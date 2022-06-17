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

        //====================================================================
        // Executing command api
        //====================================================================
        execute(command, isSilent = false) {
            return new Promise(function(resolve, reject) {
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