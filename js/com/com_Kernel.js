/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_Kernel.js
 *    Author          : Black Logic
 *    Note            : Interface between vp and jupyter
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 16
 *    Change Date     :
 */
//============================================================================
// [CLASS] Kernel
//============================================================================
define([
    './com_util',
    './com_String'
], function(com_util, com_String) {

    /**
     * Kernel interface class
     */
    class Kernel {
        /** constructor */
        constructor() {
            this.data = [
                { varName: 'df1', varType: 'DataFrame' },
                { varName: 'df2', varType: 'DataFrame' },
                { varName: 'df3', varType: 'DataFrame' },
                { varName: 's1', varType: 'Series' },
                { varName: 's2', varType: 'Series' },
                { varName: 's3', varType: 'Series' },
                { varName: 'l1', varType: 'List' },
                { varName: 'l2', varType: 'List' },
                { varName: 'l3', varType: 'List' }
            ]

            this.config = {
                'vpcfg': {

                },
                'vpudf': {

                }
            }
        }

        getNotebookPath() {
            if (vpConfig.extensionType === 'notebook') {
                return Jupyter.notebook.notebook_path;
            } else if (vpConfig.extensionType === 'colab') {
                return colab.global.notebookModel.metadata.colab.name;
            }
            return '';
        }

        //====================================================================
        // Executing command api
        //====================================================================
        execute(command, isSilent = false) {
            return new Promise(function(resolve, reject) {
                if (vpConfig.extensionType === 'notebook') {
                    Jupyter.notebook.kernel.execute(
                        command,
                        {
                            iopub: {
                                output: function (msg) {
                                    var result = '';
                                    var type = '';
                                    if (msg.msg_type == 'error') {
                                        reject({result: msg.content, type: 'error', msg: msg});
                                    } else {
                                        if (msg.content) {
                                            try {
                                                if (msg.content['name'] == 'stderr') {
                                                    reject(msg);
                                                } else {
                                                    if (msg.content['text']) {
                                                        result = String(msg.content['text']);
                                                        type = 'text';
                                                    } else if (msg.content.data) {
                                                        if (msg.content.data['text/plain']) {
                                                            result = String(msg.content.data['text/plain']);
                                                            type = 'text/plain';
                                                        } else if (msg.content.data['text/html']) {
                                                            result = String(msg.content.data['text/html']);
                                                            type = 'text/html';
                                                        } else if (msg.content.data['image/png']) {
                                                            result = String(msg.content.data['image/png']);
                                                            type = 'image/png';
                                                        }
                                                    }
                                                    resolve({result: result, type: type, msg: msg});
                                                }
                                            } catch(ex) {
                                                reject(ex);
                                            }
                                        } else {
                                            resolve({result: result, type: type, msg: msg});
                                        }
                                    }
                                }
                            }
                        },
                        { silent: isSilent }
                    );
                } else if (vpConfig.extensionType === 'colab') {
                    // CHROME: TODO: 3: return background execution
                    if (isSilent) {
                        if (!colab.global.notebook.kernel.isConnected()) {
                            reject({status: 'error', ename: 'Kernel Error', evalue: 'Kernel is not connected...'});
                            return;
                        }
                        if (!colab.global.notebook.kernel.isRunning()) {
                            reject({status: 'error', ename: 'Kernel Error', evalue: 'Kernel is not running...'});
                            return;
                        }
                        colab.global.notebook.kernel.execute(command).then(function(msg) {
                            if (msg.status === 'ok') {
                                resolve(true);
                            } else {
                                reject(msg);
                            }
                        }).catch(function(msg) {
                            reject(msg);
                        });
                        return;
                    }
                    // get focused index
                    let lastFocusedCellId = '';
                    let lastFocusedCellIdx = 0;
                    try {
                        // get focused cell id
                        lastFocusedCellId = colab.global.notebook.focusedCell? colab.global.notebook.focusedCell.getId() : null;
                        // get focused cell index
                        lastFocusedCellIdx = colab.global.notebook.cells.findIndex(cell => cell.getId() === lastFocusedCellId);
                    } catch (err) { 
                        vpLog.display(VP_LOG_TYPE.ERROR, err);
                    }
                    // create cell to execute
                    colab.global.notebook.insertCell('code', {after:true, index:lastFocusedCellIdx});

                    // get cell
                    let cell = colab.global.notebook.focusedCell;
                    // hide cell using class
                    // cell.element_.style.display = "none";
                    $(cell.element_).addClass('vp-background-cell');
                    // set cell command
                    cell.setText(command);
                    // add execution complete listener
                    cell.model.listenOnce('execution_completed', function() {
                        let result = '';
                        let type = '';
                        let msg = {
                            content: {
                                name: type
                            }
                        };
                        let cellJson = cell.model.toJson();
                        if (cellJson.outputs.length > 0) {
                            // {output_type: 'stream', name: 'stdout', text: Array(1)}
                            /**
                             * {
                             *  output_type: stream/execute_result/display_data/error
                             *  name: stdout,
                             * // if output_type==stream
                             *  text: [ ... ] 
                             * // if output_type==execute_result/display_data
                             *  data: {
                             *    'image/png': '...'
                             *    'text/html': '...'
                             *    'text/plain': '...'
                             *  }
                             * // if output_type==error
                             *  ename: 'NameError/...'
                             *  evalue: 'ignored/...'
                             * }
                             */
                            cellJson.outputs.forEach(output => {
                                vpLog.display(VP_LOG_TYPE.DEVELOP, 'kernel output', cellJson.outputs);
                                try {
                                    if (output.output_type === 'error') {
                                        // convert traceback as evalue
                                        let simpleEvalue = '';
                                        let convertedEvalue = '';
                                        if (output.traceback.length > 0) {
                                            let traceback = output.traceback.join('\n');
                                            convertedEvalue = traceback.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
                                            simpleEvalue = output.traceback[output.traceback.length - 1].replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
                                        }
                                        reject({result: output, type: 'error', msg: { content: { ename: output.ename, evalue: simpleEvalue, detail: convertedEvalue } }});
                                    } else {
                                        if (output.output_type === 'stream') {
                                            result = String(output.text[0]);
                                            type = 'text';
                                            msg = {
                                                content: {
                                                    name: type,
                                                    [type]: result
                                                }
                                            };
                                        } else if (output.output_type === 'execute_result' || output.output_type === 'display_data') {
                                            if (output.data['image/png']) {
                                                result = String(output.data['image/png']);
                                                type = 'image/png';
                                            } else if (output.data['text/html']) {
                                                result = String(output.data['text/html'].join(''));
                                                type = 'text/html';
                                            } else if (output.data['text/plain']) {
                                                result = String(output.data['text/plain'].join(''));
                                                type = 'text/plain';
                                            }
                                            msg = {
                                                content: {
                                                    name: type,
                                                    data: {
                                                        [type]: result
                                                    }
                                                }
                                            };
                                        }
                                        resolve({result: result, type: type, msg: msg});
                                    }
                                } catch(ex) {
                                    reject(ex);
                                }
                            });
                        }
                        // delete cell
                        colab.global.notebook.notebookModel.deleteCells([cell.model]);
                        // set last focused cell
                        // colab.global.notebook.focusCell(lastFocusedCellId);
                    })
                    // run cell
                    cell.runButton.click();
                    // set last focused cell
                    colab.global.notebook.focusCell(lastFocusedCellId);
                }
                
            });
        }

        /**
         * Check if module/function is loaded already
         * @param {*} moduleList 
         */
        checkModule(moduleList) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute(com_util.formatString('_vp_print(_vp_check_module_loaded({0}))', JSON.stringify(moduleList))).then(function(resultObj) {
                    // resolve
                    resolve(resultObj);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            });
        }

        getDataList(dataTypeList=[], excludeList=[]) {
            // use function command to get variable list of selected data types
            var cmdSB = '_vp_print(_vp_get_variables_list(None))';
            if (!dataTypeList || dataTypeList.length <= 0) {
                dataTypeList = [];
            }
            cmdSB = com_util.formatString('_vp_print(_vp_get_variables_list({0}, {1}))', JSON.stringify(dataTypeList), JSON.stringify(excludeList));
            
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute(cmdSB.toString()).then(function(resultObj) {
                    // resolve
                    resolve(resultObj);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            })
        }

        getColumnList(dataframe) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute(com_util.formatString('_vp_print(_vp_get_columns_list({0}))', dataframe))
                .then(function(resultObj) {
                    resolve(resultObj);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            });
        }
    
        getCommonColumnList(dataframeList) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute(com_util.formatString('_vp_print(_vp_get_multi_columns_list([{0}]))', dataframeList.join(',')))
                .then(function(resultObj) {
                    resolve(resultObj);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            });
        }

        getColumnCategory(dataframe, columnName) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute(com_util.formatString('_vp_print(_vp_get_column_category({0}, {1}))', dataframe, columnName))
                .then(function(resultObj) {
                    resolve(resultObj);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            });
        }
    
        /**
         * Get rows list
         * @param {*} dataframe 
         * @returns 
         */
        getRowList(dataframe) {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute(com_util.formatString('_vp_print(_vp_get_rows_list({0}))', dataframe))
                .then(function(resultObj) {
                    resolve(resultObj);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            });
        }
    
        getProfilingList() {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute('_vp_print(_vp_get_profiling_list())')
                .then(function(resultObj) {
                    resolve(resultObj);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            });
        }

        //====================================================================
        // FileNavigation 
        //====================================================================
        getCurrentDirectory() {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute('%pwd')
                .then(function(resultObj) {
                    resolve(resultObj.result);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            });
        }

        getFileList(path, useFunction=false) {
            var that = this;
            if (path === '') {
                path = '.';
            }
            if (!useFunction) {
                path = "'" + path + "'";
            }
            var cmd = com_util.formatString('_vp_print(_vp_search_path({0}))', path);
            return new Promise(function(resolve, reject) {
                that.execute(cmd)
                .then(function(resultObj) {
                    resolve(resultObj.result);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            });
        }

        /**
         * Get if colab mounted (If mounted, create .visualpython directory)
         * - '/content/drive/MyDrive/.visualpython'
         * @returns Promise(resolve(true/false), reject(err))
         */
        getColabMounted() {
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute('_vp_get_colab_mounted()')
                .then(function(resultObj) {
                    resolve(resultObj.result);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            });
        }

        /**
         * Get colab's vp config file content
         * @param {String} configType vpudf, vpcfg 
         * @returns 
         */
        getColabConfig(configType='vpudf') {
            var that = this;
            var configFile = '';
            switch (configType) {
                case 'vpudf':
                    configFile = 'snippets';
                    break;
                case 'vpcfg':
                    configFile = 'configure';
                    break;
            }
            var cmd = com_util.formatString("print(_vp_get_colab_vpcfg('{0}'))", configFile);
            return new Promise(function(resolve, reject) {
                that.execute(cmd)
                .then(function(resultObj) {
                    resolve(resultObj);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            });
        }

        /**
         * Set colab's vp config file content
         * @param {String} content file content to write
         * @param {String} configType vpudf, vpcfg 
         * @returns 
         */
        setColabConfig(content, configType='vpudf') {
            var that = this;
            var configFile = '';
            switch (configType) {
                case 'vpudf':
                    configFile = 'snippets';
                    break;
                case 'vpcfg':
                    configFile = 'configure';
                    break;
            }
            // write file
            var sbfileSaveCmd = new com_String();
            sbfileSaveCmd.appendFormatLine('%%writefile "/content/drive/MyDrive/.visualpython/{0}"', configFile);
            sbfileSaveCmd.appendLine(content);
            return new Promise(function(resolve, reject) {
                that.execute(sbfileSaveCmd.toString())
                .then(function(resultObj) {
                    resolve(resultObj.result);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            });
        }
        //====================================================================
        // Image data 
        //====================================================================
        getImageFile(path) {
            var that = this;
            let code = com_util.formatString("_vp_get_image_by_path('{0}')", path);
            return new Promise(function(resolve, reject) {
                that.execute(code)
                .then(function(resultObj) {
                    resolve(resultObj);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            });
        }

        //====================================================================
        // Write File 
        //====================================================================
        saveFile(fileName, filePath, saveData) {
            let that = this;
            fetch(filePath).then(function(data) {
                // overwrite confirmation
                if (data.status == 200) {
                    if (!confirm(com_util.formatString("{0} already exists.\nDo you want to replace it?", fileName))) {
                        return false;
                    }
                }
                
                // write file
                var sbfileSaveCmd = new com_String();
                sbfileSaveCmd.appendFormatLine('%%writefile "{0}"', filePath);
                sbfileSaveCmd.appendLine(saveData);
                
                that.execute(sbfileSaveCmd.toString()).then(function(resultObj) {
                    com_util.renderSuccessMessage('Successfully saved file. (' + fileName + ')');
                }).catch(function(err) {
                    com_util.renderAlertModal("Couldn't save file. "+err.message);
                    vpLog.display(VP_LOG_TYPE.ERROR, err);
                });
            });
        }

        //====================================================================
        // Machine Learning
        //====================================================================
        getModelList(modelCategory='') {
            // use function command to get variable list of selected data types
            var cmdSB = `_vp_print(_vp_get_variables_list(${JSON.stringify(vpConfig.getMLDataTypes())}))`;
            if (modelCategory != '') {
                cmdSB = `_vp_print(_vp_get_variables_list(${JSON.stringify(vpConfig.getMLDataDict(modelCategory))}))`;
            }
            var that = this;
            return new Promise(function(resolve, reject) {
                that.execute(cmdSB).then(function(resultObj) {
                    // resolve
                    resolve(resultObj);
                }).catch(function(err) {
                    // reject
                    reject(err);
                })
            })
        }

        //====================================================================
        // Configuration api
        //====================================================================
        loadConfig() {

        }

        getConfig() {

        }

        setConfig() {

        }

    }

    return Kernel;
});