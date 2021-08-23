define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
    , 'nbextensions/visualpython/src/common/component/vpVarSelector'
    , 'nbextensions/visualpython/src/common/kernelApi'
    // file navigation
    , 'nbextensions/visualpython/src/pandas/fileNavigation/index'
], function (requirejs, $
            , vpConst, sb, vpCommon, vpSuggestInputText, pdGen, vpVarSelector, kernelApi
            , fileNavigation) {

    
    const VP_PF = 'vp-pf';
    const VP_PF_CONTAINER = 'vp-pf-container';
    const VP_PF_TITLE = 'vp-pf-title';
    const VP_PF_CLOSE = 'vp-pf-close';
    const VP_PF_BODY = 'vp-pf-body';

    const VP_PF_GRID_BOX = 'vp-pf-grid-box';

    const VP_PF_PREPARE_BOX = 'vp-pf-prepare-box';
    const VP_PF_INSTALL_BTN = 'vp-pf-install-btn';
    const VP_PF_CHECK_BTN = 'vp-pf-check-btn';
    const VP_PF_IMPORT_BTN = 'vp-pf-import-btn';

    const VP_PF_SHOW_BOX = 'vp-pf-show-box';
    const VP_PF_DF_BOX = 'vp-pf-df-box';
    const VP_PF_DF_REFRESH = 'vp-pf-df-refresh';

    const VP_PF_MENU_ITEM = 'vp-pf-menu-item';

    const VP_PF_LIST_BOX = 'vp-pf-list-box';
    const VP_PF_LIST_HEADER = 'vp-pf-list-header';
    const VP_PF_LIST_HEADER_ITEM = 'vp-pf-list-header-item';
    const VP_PF_LIST_BODY = 'vp-pf-list-body';
    const VP_PF_LIST_ITEM = 'vp-pf-list-item';
    const VP_PF_LIST_BUTTON_BOX = 'vp-pf-list-button-box';
    const VP_PF_LIST_MENU_ITEM = 'vp-pf-list-menu-item';

    const VP_PF_FILEPATH = 'vp-pf-filepath';
    const VP_PF_FILENAME = 'vp-pf-filename';

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
     * @class Profiling
     * @param {object} pageThis
     * @param {string} targetId
     * @constructor
     */
     var Profiling = function(pageThis, targetId) {
        this.pageThis = pageThis;
        this.targetId = targetId;
        this.uuid = 'u' + vpCommon.getUUID();

        // file navigation
        this.state = {
            paramData:{
                encoding: "utf-8" // encoding
                , delimiter: ","  // seperater
            },
            returnVariable:"",
            isReturnVariable: false,
            fileExtension: ["html"],
            visualpythonFileName: 'report',
            selectedReport: ''
        };
        this.fileResultState = {
            pathInputId : this.wrapSelector('.' + VP_PF_FILEPATH),
            fileInputId : this.wrapSelector('.' + VP_PF_FILENAME)
        };
    }

    Profiling.prototype.wrapSelector = function(query = '') {
        return vpCommon.formatString('.{0}.{1} {2}', VP_PF, this.uuid, query);
    }

    Profiling.prototype.open = function() {
        this.init();
        $(this.wrapSelector()).show();
    }

    Profiling.prototype.close = function() {
        this.unbindEvent();
        $(this.wrapSelector()).remove();
    }

    Profiling.prototype.init = function() {
        // state

        vpCommon.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "common/profiling.css");

        this.render();
        this.checkInstalled();
        this.bindEvent();

        this.loadVariableList();
        this.loadReportList();
    }

    Profiling.prototype.render = function() {
        var page = new sb.StringBuilder();
        page.appendFormatLine('<div class="{0} {1}">', VP_PF, this.uuid);
        page.appendFormatLine('<div class="{0}">', VP_PF_CONTAINER);

        // title
        page.appendFormat('<div class="{0}">{1}</div>'
                            , VP_PF_TITLE
                            , 'Pandas Profiling');

        // close button
        page.appendFormatLine('<div class="{0}"><img src="{1}"/></div>'
                                    , VP_PF_CLOSE, '/nbextensions/visualpython/resource/close_big.svg');

        // body start
        page.appendFormatLine('<div class="{0}">', VP_PF_BODY);
        page.appendFormatLine('<div class="{0}">', VP_PF_GRID_BOX);

        // prepare box
        page.appendFormatLine('<div class="{0}">', VP_PF_PREPARE_BOX);
        page.appendFormatLine('<label>{0} <a href="{1}" target="_blank"><i class="{2} {3}" title="{4}"></i></a></label>'
                            , 'Prepare to use Pandas Profiling', 'https://github.com/pandas-profiling/pandas-profiling', 'fa fa-link', 'vp-pf-link', 'Go to pandas-profiling github page');
        page.appendLine('<div>');
        page.appendFormatLine('<button class="{0} {1}">{2}</button>', 'vp-button activated', VP_PF_INSTALL_BTN, 'Install');
        page.appendFormatLine('<div class="{0} {1}" title="{2}"><img src="{3}"/></div>', 'vp-cursor', VP_PF_CHECK_BTN, 'Check if installed', '/nbextensions/visualpython/resource/refresh.svg');
        // page.appendLine('<div class="vp-vertical-line"></div>');
        page.appendFormatLine('<button class="{0} {1}">{2}</button>', 'vp-button', VP_PF_IMPORT_BTN, 'Import');
        page.appendLine('</div>');
        page.appendLine('</div>');

        // page.appendLine('<hr style="margin:0px"/>');

        // show box
        page.appendFormatLine('<div class="{0}">', VP_PF_SHOW_BOX);
        // Select DataFrame
        page.appendFormatLine('<div class="{0}">', VP_PF_DF_BOX);

        page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_pfVariable', 'vp-orange-text', 'DataFrame');
        page.appendLine('<div>');
        page.appendFormatLine('<select id="{0}"></select>', 'vp_pfVariable');
        page.appendFormatLine('<div class="{0}" title="{1}"><img src="{2}"/></div>', VP_PF_DF_REFRESH, "Refresh variable list", '/nbextensions/visualpython/resource/refresh.svg');
        page.appendLine('</div>');

        page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_pfReturn', 'vp-orange-text', 'Allocate to');
        page.appendFormatLine('<input type="text" id="{0}" class="{1}" placeholder="{2}"/>', 'vp_pfReturn', 'vp-pf-input', 'New variable name');

        page.appendFormatLine('<label for="{0}">{1}</label>', 'vp_pfTitle', 'Report Title');
        page.appendLine('<div>');
        page.appendFormatLine('<input type="text" id="{0}" class="{1}" placeholder="{2}"/>', 'vp_pfTitle', 'vp-pf-input', 'Title name');
        // Generate Report
        page.appendFormatLine('<button class="{0} {1}" data-type="{2}">{3}</button>'
                                , 'vp-button activated', VP_PF_MENU_ITEM, PROFILE_TYPE.GENERATE, 'Generate Report');
        page.appendLine('</div>'); 
        // hidden inputs
        page.appendFormatLine('<input type="hidden" class="{0}"/>', VP_PF_FILENAME);
        page.appendFormatLine('<input type="hidden" class="{0}"/>', VP_PF_FILEPATH);
        page.appendLine('</div>'); // VP_PF_DF_BOX

        // // button box
        // page.appendLine('<div>');
        
        
        // // Show Report
        // page.appendFormatLine('<button class="{0} {1}" data-type="{2}">{3}</button>'
        //                         , 'vp-button', VP_PF_MENU_ITEM, PROFILE_TYPE.SHOW, 'Show Report');
        
        // // Save Report
        // page.appendFormatLine('<button class="{0} {1}" data-type="{2}">{3}</button>'
        //                         , 'vp-button', VP_PF_MENU_ITEM, PROFILE_TYPE.SAVE, 'Save Report');         

        // page.appendLine('</div>');
        page.appendLine('</div>'); // VP_PF_SHOW_BOX

        // list box
        page.appendLine(this.renderReportList());

        page.appendLine('</div>'); // VP_PF_GRID_BOX
        page.appendLine('</div>'); // VP_PF_BODY

        page.appendLine('</div>'); // VP_PF_CONTAINER
        page.appendLine('</div>'); // VP_PF

        $('#vp-wrapper').append(page.toString());
        $(this.wrapSelector()).hide();
    }

    Profiling.prototype.loadVariableList = function() {
        var that = this;
        // load using kernel
        var dataTypes = ['DataFrame'];
        kernelApi.searchVarList(dataTypes, function(result) {
            try {
                var varList = JSON.parse(result);
                // render variable list
                // replace
                $(that.wrapSelector('#vp_pfVariable')).replaceWith(function() {
                    return that.renderVariableList(varList);
                });
                $(that.wrapSelector('#vp_pfVariable')).trigger('change');
            } catch (ex) {
                console.log('Profiling:', result);
                // console.log(ex);
            }
        });
    }

    Profiling.prototype.renderVariableList = function(varList) {
        var tag = new sb.StringBuilder();
        var beforeValue = $(this.wrapSelector('#vp_pfVariable')).val();
        tag.appendFormatLine('<select id="{0}">', 'vp_pfVariable');
        varList.forEach(vObj => {
            // varName, varType
            var label = vObj.varName;
            tag.appendFormatLine('<option value="{0}" data-type="{1}" {2}>{3}</option>'
                                , vObj.varName, vObj.varType
                                , beforeValue == vObj.varName?'selected':''
                                , label);
        });
        tag.appendLine('</select>'); // VP_VS_VARIABLES
        return tag.toString();
    }

    Profiling.prototype.checkInstalled = function() {
        var that = this;
        // set state as 'Checking'
        $(this.wrapSelector('.' + VP_PF_INSTALL_BTN)).text('Checking...');
        // set disabled
        if (!$(that.wrapSelector('.' + VP_PF_INSTALL_BTN)).hasClass('disabled')) {
            $(that.wrapSelector('.' + VP_PF_INSTALL_BTN)).addClass('disabled');
        }
        var checking = true;

        // check installed
        Jupyter.notebook.kernel.execute(
            '!pip show pandas-profiling',
            {
                iopub: {
                    output: function(msg) {
                        if (!checking) {
                            return;
                        }
                        if (msg.content['name'] == 'stderr') {
                            if (msg.content['text'].includes('not found')) {
                                $(that.wrapSelector('.' + VP_PF_INSTALL_BTN)).text('Install');
                                // set enabled
                                if ($(that.wrapSelector('.' + VP_PF_INSTALL_BTN)).hasClass('disabled')) {
                                    $(that.wrapSelector('.' + VP_PF_INSTALL_BTN)).removeClass('disabled');
                                }
                            }
                        } else {
                            $(that.wrapSelector('.' + VP_PF_INSTALL_BTN)).text('Installed');
                            // set disabled
                            if (!$(that.wrapSelector('.' + VP_PF_INSTALL_BTN)).hasClass('disabled')) {
                                $(that.wrapSelector('.' + VP_PF_INSTALL_BTN)).addClass('disabled');
                            }
                        }
                    }
                }
            }
        );
    }

    Profiling.prototype.loadReportList = function() {
        var that = this;
        // load using kernel
        kernelApi.getProfilingList(function(result) {
            try {
                var varList = JSON.parse(result);
                // render variable list
                // replace
                $(that.wrapSelector('.' + VP_PF_LIST_BOX)).replaceWith(function() {
                    return that.renderReportList(varList);
                });
            } catch (ex) {
                console.log('Profiling:', result);
                // console.log(ex);
            }
        });
    }

    Profiling.prototype.renderReportList = function(reportList=[]) {
        var page = new sb.StringBuilder();
        page.appendFormatLine('<div class="{0}">', VP_PF_LIST_BOX);
        page.appendFormatLine('<div class="{0}">', VP_PF_LIST_HEADER);
        page.appendFormatLine('<div><label class="{0}">{1}</label></div>', VP_PF_LIST_HEADER_ITEM, 'Allocated to');
        page.appendFormatLine('<div><label class="{0}">{1}</label></div>', VP_PF_LIST_HEADER_ITEM, 'Report Title');
        page.appendFormatLine('<div><label class="{0}">{1}</label></div>', VP_PF_LIST_HEADER_ITEM, '');
        page.appendLine('</div>');
        page.appendFormatLine('<div class="{0}">', 'vp-apiblock-scrollbar');
        page.appendFormatLine('<div class="{0} {1}">', VP_PF_LIST_BODY, 'vp-apiblock-scrollbar');
        reportList.forEach((report, idx) => {
            var { varName, title } = report;
            page.appendFormatLine('<div class="{0}" data-name="{1}" data-title="{2}">', VP_PF_LIST_ITEM, varName, title);
            page.appendFormatLine('<div>{0}</div>', varName);
            page.appendFormatLine('<div>{0}</div>', title);
            // button box
            page.appendFormatLine('<div class="{0}">', VP_PF_LIST_BUTTON_BOX);
            page.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}"><img src="{3}"/></div>'
                                    , VP_PF_LIST_MENU_ITEM, LIST_MENU_ITEM.SHOW, 'Show report', '/nbextensions/visualpython/resource/snippets/run.svg');
            page.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}"><img src="{3}"/></div>'
                                    , VP_PF_LIST_MENU_ITEM, LIST_MENU_ITEM.DELETE, 'Delete report', '/nbextensions/visualpython/resource/delete.svg');
            page.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}"><img src="{3}"/></div>'
                                    , VP_PF_LIST_MENU_ITEM, LIST_MENU_ITEM.SAVE, 'Save report', '/nbextensions/visualpython/resource/snippets/export.svg');
            page.appendLine('</div>');
            page.appendLine('</div>');
        });
        page.appendLine('</div>'); // VP_PF_LIST_BODY
        page.appendLine('</div>');
        page.appendLine('</div>'); // VP_PF_LIST_BOX
        return page.toString();
    }

    Profiling.prototype.unbindEvent = function() {
        $(document).off(this.wrapSelector('*'));

        $(document).off('click', this.wrapSelector('.' + VP_PF_CLOSE));
        $(document).off('click', this.wrapSelector('.' + VP_PF_INSTALL_BTN));
        $(document).off('click', this.wrapSelector('.' + VP_PF_CHECK_BTN));
        $(document).off('click', this.wrapSelector('.' + VP_PF_IMPORT_BTN));
        $(document).off('click', this.wrapSelector('.vp-pf-df-refresh'));
        $(document).off('click', this.wrapSelector('.' + VP_PF_MENU_ITEM));
        $(document).off('click', this.wrapSelector('.' + VP_PF_LIST_MENU_ITEM));
        $(document).off('snippetSaved.fileNavigation', this.wrapSelector('.' + VP_PF_FILEPATH));

        $(document).off('keydown.' + this.uuid);
        $(document).off('keyup.' + this.uuid);
    }

    Profiling.prototype.bindEvent = function() {
        var that = this;
        
        // close popup
        $(document).on('click', this.wrapSelector('.' + VP_PF_CLOSE), function(event) {
            that.close();

            // vpCommon.removeHeadScript("vpSubsetEditor");
        });

        // click install
        $(document).on('click', this.wrapSelector('.' + VP_PF_INSTALL_BTN), function(event) {
            vpCommon.cellExecute([{command: '!pip install pandas-profiling', exec:true, type:'code'}]);
        });

        // click check installed
        $(document).on('click', this.wrapSelector('.' + VP_PF_CHECK_BTN), function() {
            that.checkInstalled();
        });

        // click import
        $(document).on('click', this.wrapSelector('.' + VP_PF_IMPORT_BTN), function(event) {
            vpCommon.cellExecute([{command: 'from pandas_profiling import ProfileReport', exec:true, type:'code'}]);
        });

        // refresh df
        $(document).on('click', this.wrapSelector('.vp-pf-df-refresh'), function() {
            that.loadVariableList();
        });

        // click menu
        $(document).on('click', this.wrapSelector('.' + VP_PF_MENU_ITEM), function() {
            var type = $(this).data('type');
            var df = $(that.wrapSelector('#vp_pfVariable')).val();
            var saveas = $(that.wrapSelector('#vp_pfReturn')).val();
            if (saveas == '') {
                saveas = '_vp_profile';
            }
            var title = $(that.wrapSelector('#vp_pfTitle')).val();
            var code = new sb.StringBuilder();
            switch(parseInt(type)) {
                case PROFILE_TYPE.GENERATE:
                    code.appendFormatLine("{0} = ProfileReport({1}, title='{2}')", saveas, df, title);
                    code.append(saveas);
                    break;
            }
            vpCommon.cellExecute([{command: code.toString(), exec:true, type:'code'}]);
            that.loadReportList();
        });

        // click list item menu
        $(document).on('click', this.wrapSelector('.' + VP_PF_LIST_MENU_ITEM), async function(evt) {
            var menu = $(this).data('menu');
            var itemTag = $(this).closest('.' + VP_PF_LIST_ITEM);
            var varName = $(itemTag).data('name');
            var title = $(itemTag).data('title');

            var code = new sb.StringBuilder();
            switch(menu) {
                case LIST_MENU_ITEM.SHOW:
                    code.appendFormat("{0}.to_notebook_iframe()", varName);
                    break;
                case LIST_MENU_ITEM.DELETE:
                    code.appendFormat("del {0}", varName);
                    break;
                case LIST_MENU_ITEM.SAVE:
                    var loadURLstyle = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH;
                    var loadURLhtml = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/fileNavigation/index.html";
                    
                    vpCommon.loadCss( loadURLstyle + "component/fileNavigation.css");
            
                    await $(`<div id="vp_fileNavigation"></div>`)
                    .load(loadURLhtml, () => {
        
                        $('#vp_fileNavigation').removeClass("hide");
                        $('#vp_fileNavigation').addClass("show");

                        that.state.selectedReport = varName;
        
                        var { vp_init
                                , vp_bindEventFunctions } = fileNavigation;

                        that.state.visualpythonFileName = title;
                            
                        fileNavigation.vp_init(that, "SAVE_SNIPPETS");
                        // fileNavigation.vp_init(that.getStateAll());
                        fileNavigation.vp_bindEventFunctions();
                    })
                    .appendTo("#site");
                    return;
                default:
                    return;
            }
            vpCommon.cellExecute([{command: code.toString(), exec:true, type:'code'}]);
            that.loadReportList();
        });

        // save file complete event
        $(document).on('snippetSaved.fileNavigation', this.wrapSelector('.' + VP_PF_FILEPATH), function(evt) {
            var fileName = evt.file;
            var path = evt.path;
            var varName = that.state.selectedReport;
            if (varName == '') {
                varName = '_vp_profile';
            }
            var code = new sb.StringBuilder();
            code.appendFormat("{0}.to_file('{1}')", varName, path);
            vpCommon.cellExecute([{command: code.toString(), exec:true, type:'code'}]);

            that.selectedReport = '';
        });

        this.keyboardManager = {
            keyCode : {
                ctrlKey: 17,
                cmdKey: 91,
                shiftKey: 16,
                altKey: 18,
                enter: 13,
                escKey: 27
            },
            keyCheck : {
                ctrlKey: false,
                shiftKey: false
            }
        }
        $(document).on('keydown.' + this.uuid, function(e) {
            var keyCode = that.keyboardManager.keyCode;
            if (e.keyCode == keyCode.ctrlKey || e.keyCode == keyCode.cmdKey) {
                that.keyboardManager.keyCheck.ctrlKey = true;
            } 
            if (e.keyCode == keyCode.shiftKey) {
                that.keyboardManager.keyCheck.shiftKey = true;
            }
        }).on('keyup.' + this.uuid, function(e) {
            var keyCode = that.keyboardManager.keyCode;
            if (e.keyCode == keyCode.ctrlKey || e.keyCode == keyCode.cmdKey) {
                that.keyboardManager.keyCheck.ctrlKey = false;
            } 
            if (e.keyCode == keyCode.shiftKey) {
                that.keyboardManager.keyCheck.shiftKey = false;
            }
            if (e.keyCode == keyCode.escKey) {
                // close on esc
                that.close();
            }
        });
    };

    return Profiling;
});