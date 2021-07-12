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
    const VP_PF_IMPORT_BTN = 'vp-pf-import-btn';

    const VP_PF_SHOW_BOX = 'vp-pf-show-box';
    const VP_PF_DF_BOX = 'vp-pf-df-box';
    const VP_PF_DF_REFRESH = 'vp-pf-df-refresh';

    const VP_PF_MENU_ITEM = 'vp-pf-menu-item';

    const VP_PF_FILEPATH = 'vp-pf-filepath';
    const VP_PF_FILENAME = 'vp-pf-filename';

    const VP_PF_BUTTON_BOX = 'vp-pf-btn-box';
    const VP_PF_BUTTON_CANCEL = 'vp-pf-btn-cancel';
    const VP_PF_BUTTON_APPLY = 'vp-pf-btn-apply';

    const PROFILE_TYPE = {
        NONE: -1,
        GENERATE: 1,
        SHOW: 2,
        SAVE: 3
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
            fileExtension: ["html"]
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
        this.state = {

        }

        vpCommon.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "common/profiling.css");

        this.render();
        this.bindEvent();

        this.loadVariableList();
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
        page.appendFormatLine('<div class="{0}"><i class="{1}"></i></div>'
                                    , VP_PF_CLOSE, 'fa fa-close');

        // body start
        page.appendFormatLine('<div class="{0}">', VP_PF_BODY);
        page.appendFormatLine('<div class="{0}">', VP_PF_GRID_BOX);

        // prepare box
        page.appendFormatLine('<div class="{0}">', VP_PF_PREPARE_BOX);
        page.appendFormatLine('<label>{0} <a href="{1}" target="_blank"><i class="{2} {3}" title="{4}"></i></a></label>'
                            , 'Prepare to use Pandas Profiling', 'https://github.com/pandas-profiling/pandas-profiling', 'fa fa-link', 'vp-pf-link', 'Go to pandas-profiling github page');
        page.appendLine('<div>');
        page.appendFormatLine('<button class="{0} {1}">{2}</button>', 'vp-button', VP_PF_INSTALL_BTN, 'Install');
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
        page.appendFormatLine('<i class="{0} {1}" title="{2}"></i>', VP_PF_DF_REFRESH, 'fa fa-refresh', "Refresh variable list");
        page.appendLine('</div>');

        page.appendFormatLine('<label for="{0}">{1}</label>', 'vp_pfReturn', 'Save as');
        page.appendFormatLine('<input type="text" id="{0}" class="{1}" placeholder="{2}"/>', 'vp_pfReturn', 'vp-pf-input', 'variable name');

        page.appendFormatLine('<label for="{0}">{1}</label>', 'vp_pfTitle', 'Report Title');
        page.appendFormatLine('<input type="text" id="{0}" class="{1}" placeholder="{2}"/>', 'vp_pfTitle', 'vp-pf-input', 'title name');
        page.appendLine('</div>');

        // button box
        page.appendLine('<div>');
        // Generate Report
        page.appendFormatLine('<button class="{0} {1}" data-type="{2}">{3}</button>'
                                , 'vp-button activated', VP_PF_MENU_ITEM, PROFILE_TYPE.GENERATE, 'Generate Report');
        
        // Show Report
        page.appendFormatLine('<button class="{0} {1}" data-type="{2}">{3}</button>'
                                , 'vp-button', VP_PF_MENU_ITEM, PROFILE_TYPE.SHOW, 'Show Report');
        
        // Save Report
        page.appendFormatLine('<button class="{0} {1}" data-type="{2}">{3}</button>'
                                , 'vp-button', VP_PF_MENU_ITEM, PROFILE_TYPE.SAVE, 'Save Report');         

        page.appendLine('</div>');
        page.appendLine('</div>'); // VP_PF_SHOW_BOX

        page.appendLine('</div>'); // VP_PF_GRID_BOX
        page.appendLine('</div>'); // VP_PF_BODY

        // apply button
        page.appendFormatLine('<div class="{0}">', VP_PF_BUTTON_BOX);
        page.appendFormatLine('<button type="button" class="{0}">{1}</button>'
                                , VP_PF_BUTTON_CANCEL, 'Cancel');
        // page.appendFormatLine('<button type="button" class="{0}">{1}</button>'
        //                         , VP_PF_BUTTON_APPLY, 'Apply');
        page.appendLine('</div>');

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
                console.log('FrameEditor:', result);
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

    Profiling.prototype.unbindEvent = function() {
        $(document).off(this.wrapSelector('*'));

        $(document).off('click', this.wrapSelector('.' + VP_PF_CLOSE));
        $(document).off('change', this.wrapSelector('#vp_pfVariable'));
        $(document).off('click', this.wrapSelector('.vp-pf-df-refresh'));
        $(document).off('click', this.wrapSelector('.' + VP_PF_BUTTON_CANCEL));
        $(document).off('click', this.wrapSelector('.' + VP_PF_BUTTON_APPLY));
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

        // click import
        $(document).on('click', this.wrapSelector('.' + VP_PF_IMPORT_BTN), function(event) {
            vpCommon.cellExecute([{command: 'from pandas_profiling import ProfileReport', exec:true, type:'code'}]);
        });

        // refresh df
        $(document).on('click', this.wrapSelector('.vp-pf-df-refresh'), function() {
            that.loadVariableList();
        });

        // click menu
        $(document).on('click', this.wrapSelector('.' + VP_PF_MENU_ITEM), async function() {
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
                    code.appendFormat("{0} = ProfileReport({1}, title='{2}')", saveas, df, title);
                    break;
                case PROFILE_TYPE.SHOW:
                    code.appendFormat("{0}.to_notebook_iframe()", saveas);
                    break;
                case PROFILE_TYPE.SAVE:
                    var loadURLstyle = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH;
                    var loadURLhtml = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/fileNavigation/index.html";
                    
                    vpCommon.loadCss( loadURLstyle + "component/fileNavigation.css");
            
                    await $(`<div id="vp_fileNavigation"></div>`)
                    .load(loadURLhtml, () => {
        
                        $('#vp_fileNavigation').removeClass("hide");
                        $('#vp_fileNavigation').addClass("show");
        
                        var { vp_init
                                , vp_bindEventFunctions } = fileNavigation;
                            
                        fileNavigation.vp_init(that, "SAVE_SNIPPETS");
                        // fileNavigation.vp_init(that.getStateAll());
                        fileNavigation.vp_bindEventFunctions();
                    })
                    .appendTo("#site");
                    return;
            }
            vpCommon.cellExecute([{command: code.toString(), exec:true, type:'code'}]);
        });

        // save file complete event
        $(document).on('snippetSaved.fileNavigation', this.wrapSelector('.' + VP_PF_FILEPATH), function(evt) {
            var fileName = evt.file;
            var path = evt.path;
            var saveas = $(that.wrapSelector('#vp_pfReturn')).val();
            if (saveas == '') {
                saveas = '_vp_profile';
            }
            var code = new sb.StringBuilder();
            code.appendFormat("{0}.to_file('{1}')", saveas, path);
            vpCommon.cellExecute([{command: code.toString(), exec:true, type:'code'}]);
        });

        // click cancel
        $(document).on('click', this.wrapSelector('.' + VP_PF_BUTTON_CANCEL), function() {
            that.close();
        });

        // click apply
        // $(document).on('click', this.wrapSelector('.' + VP_PF_BUTTON_APPLY), function() {
        //     var code = 'test code'; //TODO:
        //     if (that.pageThis) {
        //         $(that.pageThis.wrapSelector('#' + that.targetId)).val(code);
        //         $(that.pageThis.wrapSelector('#' + that.targetId)).trigger({
        //             type: 'profiling_apply',
        //             code: code
        //         });
        //     } else {
        //         $(vpCommon.wrapSelector('#' + that.targetId)).val(code);
        //         $(vpCommon.wrapSelector('#' + that.targetId)).trigger({
        //             type: 'profiling_apply',
        //             code: code
        //         });
        //     }
        //     that.close();
        // });
    };

    return Profiling;
});