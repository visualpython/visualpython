/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Profiling.js
 *    Author          : Black Logic
 *    Note            : Apps > Profiling
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Profiling
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_apps/profiling.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_apps/profiling'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/FileNavigation'
], function(proHTML, proCss, com_Const, com_String, com_interface, PopupComponent, SuggestInput, FileNavigation) {

    const PROFILE_TYPE = {
        NONE: -1,
        GENERATE: 1
    }

    const LIST_MENU_ITEM = {
        SHOW: 'show',
        DELETE: 'delete',
        SAVE: 'save'
    }

    /**
     * Profiling
     */
    class Profiling extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.installButton = true;
            this.config.importButton = true;
            this.config.codeview = false;
            this.config.dataview = false;
            this.config.runButton = false;
            this.config.size = { width: 500, height: 500 };
            this.config.checkModules = ['ProfileReport'];

            this.selectedReport = '';
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;

            // refresh df
            $(this.wrapSelector('.vp-pf-df-refresh')).on('click', function() {
                that.loadVariableList();
            });

            // click menu
            $(this.wrapSelector('.vp-pf-menu-item')).on('click', function() {
                // check required filled
                if (that.checkRequiredOption() === false) {
                    return ;
                }

                var type = $(this).data('type');
                var df = $(that.wrapSelector('#vp_pfVariable')).val();
                var saveas = $(that.wrapSelector('#vp_pfReturn')).val();
                if (saveas == '') {
                    saveas = '_vp_profile';
                }
                var title = $(that.wrapSelector('#vp_pfTitle')).val();
                var code = new com_String();
                switch(parseInt(type)) {
                    case PROFILE_TYPE.GENERATE:
                        code.appendFormatLine("{0} = ProfileReport({1}, title='{2}')", saveas, df, title);
                        code.append(saveas);
                        break;
                }
                that.checkAndRunModules(true).then(function() {
                    com_interface.insertCell('code', code.toString(), true, 'Data Analysis > Profiling');
                    that.loadReportList();
                });
            });
        }

        bindReportListEvent() {
            let that = this;
            // click list item menu
            $(this.wrapSelector('.vp-pf-list-menu-item')).off('click');
            $(this.wrapSelector('.vp-pf-list-menu-item')).on('click', function(evt) {
                var menu = $(this).data('menu');
                var itemTag = $(this).closest('.vp-pf-list-item');
                var varName = $(itemTag).data('name');
                var title = $(itemTag).data('title');

                var code = new com_String();
                switch(menu) {
                    case LIST_MENU_ITEM.SHOW:
                        code.appendFormat("{0}.to_notebook_iframe()", varName);
                        break;
                    case LIST_MENU_ITEM.DELETE:
                        code.appendFormat("del {0}", varName);
                        break;
                    case LIST_MENU_ITEM.SAVE:
                        let fileNavi = new FileNavigation({
                            type: 'save',
                            extensions: ['html'],
                            fileName: 'report',
                            finish: function(filesPath, status, error) {
                                filesPath.forEach( fileObj => {
                                    var fileName = fileObj.file;
                                    var path = fileObj.path;
                                    if (varName == '') {
                                        varName = '_vp_profile';
                                    }
                                    var code = new com_String();
                                    code.appendFormat("{0}.to_file('{1}')", varName, path);
                                    com_interface.insertCell('code', code.toString(), true, 'Data Analysis > Profiling');
                    
                                    that.selectedReport = '';
                                });
                            }
                        });
                        fileNavi.open();
                        return;
                    default:
                        return;
                }
                com_interface.insertCell('code', code.toString(), true, 'Data Analysis > Profiling');
                that.loadReportList();
            });
        }

        templateForBody() {
            return proHTML;
        }

        render() {
            super.render();

            this.loadVariableList();
            this.loadReportList();
            this.checkInstalled();
        }

        generateInstallCode() {
            return [
                '!pip install pandas-profiling'
            ];
        }

        generateImportCode() {
            return [
                'from pandas_profiling import ProfileReport'
            ];
        }

        generateCode() {
            return "";
        }

        loadVariableList() {
            var that = this;
            // load using kernel
            var dataTypes = ['DataFrame'];
            vpKernel.getDataList(dataTypes).then(function(resultObj) {
                try {
                    let { result, msg } = resultObj;
                    var varList = JSON.parse(result);
                    // render variable list
                    // replace
                    $(that.wrapSelector('#vp_pfVariable')).replaceWith(function() {
                        return that.templateForVariableList(varList);
                    });
                    $(that.wrapSelector('#vp_pfVariable')).trigger('change');
                } catch (ex) {
                    vpLog.display(VP_LOG_TYPE.ERROR, 'Profiling:', result);
                }
            });
        }

        templateForVariableList(varList) {
            var beforeValue = $(this.wrapSelector('#vp_pfVariable')).val();
            if (beforeValue == null) {
                beforeValue = '';
            }
            // var tag = new com_String();
            // tag.appendFormatLine('<select id="{0}" class="vp-select vp-pf-select">', 'vp_pfVariable');
            // varList.forEach(vObj => {
            //     // varName, varType
            //     var label = vObj.varName;
            //     tag.appendFormatLine('<option value="{0}" data-type="{1}" {2}>{3}</option>'
            //                         , vObj.varName, vObj.varType
            //                         , beforeValue == vObj.varName?'selected':''
            //                         , label);
            // });
            // tag.appendLine('</select>'); // VP_VS_VARIABLES
            // return tag.toString();

            let mappedList = varList.map(obj => { return { label: obj.varName, value: obj.varName, dtype: obj.varType } });

            var variableInput = new SuggestInput();
            variableInput.setComponentID('vp_pfVariable');
            variableInput.addClass('vp-pf-select');
            variableInput.setPlaceholder('Select variable');
            variableInput.setSuggestList(function () { return mappedList; });
            variableInput.setNormalFilter(true);
            variableInput.addAttribute('required', true);
            variableInput.setValue(beforeValue);

            return variableInput.toTagString();
        }

        /**
         * Toggle check button state
         * @param {String} mode install/checking/installed 
         */
        toggleCheckState(mode='checking') {
            let message = 'Checking...';
            let disable = true;
            switch (mode) {
                case 'install':
                    message = 'Install';
                    disable = false;
                    break;
                case 'installed':
                    message = 'Installed';
                    disable = true;
                    break;
                case 'installing':
                    message = 'Installing';
                    disable = true;
                    break;
            }
            $(this.wrapSelector('.vp-pf-install-btn')).text(message);
            if (disable) {
                // set state as 'Checking'
                // set disabled
                if (!$(this.wrapSelector('.vp-pf-install-btn')).hasClass('disabled')) {
                    $(this.wrapSelector('.vp-pf-install-btn')).addClass('disabled');
                }
            } else {
                // set enabled
                $(this.wrapSelector('.vp-pf-install-btn')).removeClass('disabled');
            }
        }

        checkInstalled() {
            var that = this;
            // set state as 'Checking'
            this.toggleCheckState();
            this.checking = true;
    
            // check installed
            vpKernel.execute('!pip show pandas-profiling').then(function(resultObj) {
                let { result, msg } = resultObj;
                if (!that.checking) {
                    return;
                }
                if (msg.content['text'].includes('not found')) {
                    that.toggleCheckState('install');
                } else {
                    that.toggleCheckState('installed');
                }
                that.checking = false;
            }).catch(function(err) {
                that.toggleCheckState('install');
                that.checking = false;
            });
        }

        loadReportList() {
            var that = this;
            // load using kernel
            vpKernel.getProfilingList().then(function(resultObj) {
                try {
                    let { result } = resultObj;
                    var varList = JSON.parse(result);
                    // render variable list
                    // replace
                    $(that.wrapSelector('.vp-pf-list-box')).replaceWith(function() {
                        return that.renderReportList(varList);
                    });

                    that.bindReportListEvent();
                } catch (ex) {
                    vpLog.display(VP_LOG_TYPE.ERROR, 'Profiling:', result);
                    // console.log(ex);
                }
            });
        }

        renderReportList = function(reportList=[]) {
            var page = new com_String();
            page.appendFormatLine('<div class="{0}">', 'vp-pf-list-box');
            page.appendFormatLine('<div class="{0}">', 'vp-pf-list-header');
            page.appendFormatLine('<div><label class="{0}">{1}</label></div>', 'vp-pf-list-header-item', 'Allocated to');
            page.appendFormatLine('<div><label class="{0}">{1}</label></div>', 'vp-pf-list-header-item', 'Report Title');
            page.appendFormatLine('<div><label class="{0}">{1}</label></div>', 'vp-pf-list-header-item', '');
            page.appendLine('</div>');
            page.appendFormatLine('<div class="{0}">', 'vp-apiblock-scrollbar');
            page.appendFormatLine('<div class="{0} {1}">', 'vp-pf-list-body', 'vp-apiblock-scrollbar');
            reportList.forEach((report, idx) => {
                var { varName, title } = report;
                page.appendFormatLine('<div class="{0}" data-name="{1}" data-title="{2}">', 'vp-pf-list-item', varName, title);
                page.appendFormatLine('<div>{0}</div>', varName);
                page.appendFormatLine('<div>{0}</div>', title);
                // button box
                page.appendFormatLine('<div class="{0}">', 'vp-pf-list-button-box');
                // LAB: img to url
                // page.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}"><img src="{3}"/></div>'
                //                         , 'vp-pf-list-menu-item', LIST_MENU_ITEM.SHOW, 'Show report', com_Const.IMAGE_PATH + 'snippets/run.svg');
                // page.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}"><img src="{3}"/></div>'
                //                         , 'vp-pf-list-menu-item', LIST_MENU_ITEM.DELETE, 'Delete report', com_Const.IMAGE_PATH + 'delete.svg');
                // page.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}"><img src="{3}"/></div>'
                //                         , 'vp-pf-list-menu-item', LIST_MENU_ITEM.SAVE, 'Save report', com_Const.IMAGE_PATH + 'snippets/export.svg');
                page.appendFormatLine('<div class="{0} {1}" data-menu="{2}" title="{3}"></div>'
                                        , 'vp-pf-list-menu-item', 'vp-icon-run', LIST_MENU_ITEM.SHOW, 'Show report');
                page.appendFormatLine('<div class="{0} {1}" data-menu="{2}" title="{3}"></div>'
                                        , 'vp-pf-list-menu-item', 'vp-icon-delete', LIST_MENU_ITEM.DELETE, 'Delete report');
                page.appendFormatLine('<div class="{0} {1}" data-menu="{2}" title="{3}"></div>'
                                        , 'vp-pf-list-menu-item', 'vp-icon-export', LIST_MENU_ITEM.SAVE, 'Save report');
                page.appendLine('</div>');
                page.appendLine('</div>');
            });
            page.appendLine('</div>'); // VP_PF_LIST_BODY
            page.appendLine('</div>');
            page.appendLine('</div>'); // 'vp-pf-list-box'
            return page.toString();
        }

    }

    return Profiling;
});