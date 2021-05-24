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

    , 'codemirror/lib/codemirror'
    , 'codemirror/mode/python/python'
    , 'notebook/js/codemirror-ipython'
    , 'codemirror/addon/display/placeholder'
    , 'codemirror/addon/display/autorefresh'
], function (requirejs, $
    
            , vpConst, sb, vpCommon, vpSuggestInputText, pdGen, vpVarSelector, kernelApi
            
            , codemirror) {

    const VP_FE_BTN = 'vp-fe-btn';

    const VP_FE = 'vp-fe';
    const VP_FE_CONTAINER = 'vp-fe-container';
    const VP_FE_TITLE = 'vp-fe-title';
    const VP_FE_CLOSE = 'vp-fe-close';
    const VP_FE_BODY = 'vp-fe-body';

    const VP_FE_DF_BOX = 'vp-fe-df-box';
    const VP_FE_DF_REFRESH = 'vp-fe-df-refresh';

    const VP_FE_MENU_BOX = 'vp-fe-menu-box';
    const VP_FE_MENU_ITEM = 'vp-fe-menu-item';

    const VP_FE_TABLE = 'vp-fe-table';
    const VP_FE_TABLE_MORE = 'vp-fe-table-more';

    const VP_FE_INFO = 'vp-fe-info';
    const VP_FE_INFO_CONTENT = 'vp-fe-info-content';

    const TABLE_LINES = 5;

    const FRAME_EDIT_TYPE = {
        INIT: 0,
        DELETE: 1,
        RENAME: 2,
        DROP_NA: 3,
        DROP_DUP: 4,
        ONE_HOT_ENCODING: 5,
        SET_IDX: 6,
        REPLACE: 7,

        ADD_COL: 8,
        ADD_ROW: 9,
        SHOW: 10
    }

    /**
     * @class FrameEditor
     * @param {object} pageThis
     * @param {string} targetId
     * @constructor
     */
    var FrameEditor = function(pageThis, targetId) {
        this.pageThis = pageThis;
        this.targetId = targetId;
        this.uuid = vpCommon.getUUID();

        // state
        this.state = {
            originObj: '',
            tempObj: '',
            selected: '',
            axis: 0,
            lines: TABLE_LINES,
            steps: []
        }

        this.bindEvent();
        this.init();
    }

    FrameEditor.prototype.wrapSelector = function(query = '') {
        return vpCommon.formatString('.{0}.{1} {2}', VP_FE, this.uuid, query);
    }

    FrameEditor.prototype.open = function() {
        this.loadVariableList();
        
        $(this.wrapSelector()).show();
    }

    FrameEditor.prototype.close = function() {
        $(this.wrapSelector()).hide();
    }

    FrameEditor.prototype.init = function() {
        this.pageThis.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "common/frameEditor.css");

        this.renderButton();
        this.renderThis();
    }

    FrameEditor.prototype.initState = function() {
        this.state.selected = '';
        this.state.axis = -1;
        this.state.lines = TABLE_LINES;
        this.state.steps = [];
    }

    FrameEditor.prototype.renderButton = function() {
        // set button next to input tag
        var buttonTag = new sb.StringBuilder();
        buttonTag.appendFormat('<button type="button" class="{0} {1} {2}">{3}</button>'
                                , VP_FE_BTN, this.uuid, 'vp-button', 'Edit');
        $(this.pageThis.wrapSelector('#' + this.targetId)).parent().append(buttonTag.toString());
    }

    FrameEditor.prototype.renderThis = function() {
        var page = new sb.StringBuilder();
        page.appendFormatLine('<div class="{0} {1}">', VP_FE, this.uuid);
        page.appendFormatLine('<div class="{0}">', VP_FE_CONTAINER);

        // title
        page.appendFormat('<div class="{0}">{1}</div>'
                            , VP_FE_TITLE
                            , 'Frame Editor');

        // close button
        page.appendFormatLine('<div class="{0}"><i class="{1}"></i></div>'
                                    , VP_FE_CLOSE, 'fa fa-close');

        // body start
        page.appendFormatLine('<div class="{0}">', VP_FE_BODY);

        // Select DataFrame
        page.appendFormatLine('<div class="{0}">', VP_FE_DF_BOX);
        page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_feVariable', 'vp-orange-text', 'DataFrame');
        page.appendFormatLine('<select id="{0}">', 'vp_feVariable');
        page.appendLine('</select>');
        page.appendFormatLine('<i class="{0} {1}"></i>', VP_FE_DF_REFRESH, 'fa fa-refresh');
        page.appendLine('</div>');

        // Menus
        page.appendFormatLine('<div class="{0}">', VP_FE_MENU_BOX);
        // menu 1. delete
        page.appendFormatLine('<div class="{0} {1}" data-type="{2}">{3}</div>'
                            , VP_FE_MENU_ITEM, 'vp-fe-menu-delete', FRAME_EDIT_TYPE.DELETE, 'Delete');
        // menu 2. rename
        page.appendFormatLine('<div class="{0} {1}" data-type="{2}">{3}</div>'
                            , VP_FE_MENU_ITEM, 'vp-fe-menu-rename', FRAME_EDIT_TYPE.RENAME, 'Rename');
        // menu 3. drop
        page.appendFormatLine('<div class="{0} {1}" data-type="{2}">{3}</div>'
                            , VP_FE_MENU_ITEM, 'vp-fe-menu-drop', FRAME_EDIT_TYPE.DROP_NA, 'Drop'); //TODO: NA & Duplicate selection needed
        // menu 4. one-hot encoding
        page.appendFormatLine('<div class="{0} {1}" data-type="{2}">{3}</div>'
                            , VP_FE_MENU_ITEM, 'vp-fe-menu-ohe', FRAME_EDIT_TYPE.ONE_HOT_ENCODING, 'One-Hot Encoding');
        // menu 5. set/reset index
        page.appendFormatLine('<div class="{0} {1}" data-type="{2}">{3}</div>'
                            , VP_FE_MENU_ITEM, 'vp-fe-menu-index', FRAME_EDIT_TYPE.SET_IDX, 'Set Index');
        // menu 6. replace
        page.appendFormatLine('<div class="{0} {1}" data-type="{2}">{3}</div>'
                            , VP_FE_MENU_ITEM, 'vp-fe-menu-replace', FRAME_EDIT_TYPE.REPLACE, 'Replace');

        page.appendLine('</div>'); // End of Menus

        // Table
        page.appendFormatLine('<div class="{0}">', VP_FE_TABLE);

        page.appendLine('</div>'); // End of Table

        // Info Box
        var infoBox = this.pageThis.createOptionContainer('Info');
        infoBox.addClass(VP_FE_INFO);
        // TODO: get selected columns info
        infoBox.appendContent(vpCommon.formatString('<div class="{0}">info...</div>', VP_FE_INFO_CONTENT)); // value_counts()
        page.appendFormatLine('{0}', infoBox.toTagString());

        page.appendLine('</div>'); // VP_FE_BODY
        page.appendLine('</div>'); // VP_FE_CONTAINER
        page.appendLine('</div>'); // VP_FE

        $('#vp-wrapper').append(page.toString());
        $(this.wrapSelector()).hide();
    }

    FrameEditor.prototype.loadVariableList = function() {
        var that = this;
        // load using kernel
        var dataTypes = ['DataFrame'];
        kernelApi.searchVarList(dataTypes, function(result) {
            try {
                var varList = JSON.parse(result);
                // render variable list
                // replace
                $(that.wrapSelector('#vp_feVariable')).replaceWith(function() {
                    return that.renderVariableList(varList);
                });
                $(that.wrapSelector('#vp_feVariable')).trigger('change');
            } catch (ex) {
                // console.log(ex);
            }
        });
    }

    FrameEditor.prototype.renderVariableList = function(varList) {
        var tag = new sb.StringBuilder();
        var beforeValue = $(this.wrapSelector('#vp_feVariable')).val();
        tag.appendFormatLine('<select id="{0}">', 'vp_feVariable');
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

    FrameEditor.prototype.renderTable = function(renderedText, isHtml=true) {
        var tag = new sb.StringBuilder();
        // Table
        tag.appendFormatLine('<div class="{0} {1}">', VP_FE_TABLE, 'rendered_html');
        if (isHtml) {
            var renderedTable = $(renderedText).find('table');
            tag.appendFormatLine('<table class="dataframe">{0}</table>', renderedTable.html());
            // More button
            tag.appendFormatLine('<div class="{0} {1}">More...</div>', VP_FE_TABLE_MORE, 'vp-button');
        } else {
            tag.appendFormatLine('<pre>{0}</pre>', renderedText);
        }
        tag.appendLine('</div>'); // End of Table
        return tag.toString();
    }

    FrameEditor.prototype.loadInfo = function() {
        var that = this;
        var code = new sb.StringBuilder();
        code.appendFormat("{0}", this.state.tempObj);
        if (this.state.selected != '') {
            code.appendFormat(".loc[{0},{1}]"
                            , this.state.axis==0?this.state.selected:":"
                            , this.state.axis==1?"'"+this.state.selected+"'":":");
        }
        code.append(".value_counts()");
        console.log(code.toString());
        kernelApi.executePython(code.toString(), function(result) {
            $(that.wrapSelector('.' + VP_FE_INFO_CONTENT)).replaceWith(function() {
                return vpCommon.formatString('<div class="{0}"><pre>{1}</pre></div>', VP_FE_INFO_CONTENT, result);
            });
        }); 
    }
    
    FrameEditor.prototype.loadCode = function(type) {
        var that = this;

        var tempObj = this.state.tempObj;
        var orgObj = this.state.originObj;
        var selectedName = this.state.selected;
        var axis = this.state.axis;
        var lines = this.state.lines;

        var code = new sb.StringBuilder();
        switch (parseInt(type)) {
            case FRAME_EDIT_TYPE.INIT:
                code.appendFormatLine('{0} = {1}.copy()', tempObj, orgObj);
                break;
            case FRAME_EDIT_TYPE.DELETE:
                code.appendFormatLine("{0}.drop(['{1}'], axis={2}, inplace=True)", tempObj, selectedName, axis);
                break;
            case FRAME_EDIT_TYPE.RENAME:
                break;
            case FRAME_EDIT_TYPE.DROP_NA:
                var locObj = '';
                if (axis == 0) {
                    locObj = vpCommon.formatString('.loc[{0},]', selectedName);
                } else {
                    locObj = vpCommon.formatString('.loc[,{0}]', selectedName);
                }
                code.appendFormatLine("{0}{1}.dropna(axis={2}, inplace=True)", tempObj, locObj, axis);
                break;
            case FRAME_EDIT_TYPE.DROP_DUP:
                if (axis == 0) {
                    locObj = vpCommon.formatString('.loc[{0},]', selectedName);
                } else {
                    locObj = vpCommon.formatString('.loc[,{0}]', selectedName);
                }
                code.appendFormatLine("{0}{1}.drop_duplicates(axis={2}, inplace=True)", tempObj, locObj, axis);
                break;
            case FRAME_EDIT_TYPE.ONE_HOT_ENCODING:
                break;
            case FRAME_EDIT_TYPE.SET_IDX:
                break;
            case FRAME_EDIT_TYPE.REPLACE:
                break;
            case FRAME_EDIT_TYPE.SHOW:
                break;
        }
        code.appendFormat('{0}.head({1})', tempObj, lines);

        Jupyter.notebook.kernel.execute(
            code.toString(),
            {
                iopub: {
                    output: function(msg) {
                        if (msg.content.data) {
                            var htmlText = String(msg.content.data["text/html"]);
                            var codeText = String(msg.content.data["text/plain"]);
                            if (htmlText != 'undefined') {
                                $(that.wrapSelector('.' + VP_FE_TABLE)).replaceWith(function() {
                                    return that.renderTable(htmlText);
                                });
                            } else if (codeText != 'undefined') {
                                // plain text as code
                                $(that.wrapSelector('.' + VP_FE_TABLE)).replaceWith(function() {
                                    return that.renderTable(codeText, false);
                                });
                            } else {
                                $(that.wrapSelector('.' + VP_FE_TABLE)).replaceWith(function() {
                                    return that.renderTable('');
                                });
                            }
                            that.loadInfo();
                            that.state.steps.push(code.toString());
                        } else {
                            var errorContent = new sb.StringBuilder();
                            if (msg.content.ename) {
                                errorContent.appendFormatLine('<div class="{0}">', VP_DS_DATA_ERROR_BOX);
                                errorContent.appendLine('<i class="fa fa-exclamation-triangle"></i>');
                                errorContent.appendFormatLine('<label class="{0}">{1}</label>'
                                                            , VP_DS_DATA_ERROR_BOX_TITLE, msg.content.ename);
                                if (msg.content.evalue) {
                                    // errorContent.appendLine('<br/>');
                                    errorContent.appendFormatLine('<pre>{0}</pre>', msg.content.evalue.split('\\n').join('<br/>'));
                                }
                                errorContent.appendLine('</div>');
                            }
                            $(that.wrapSelector('.' + VP_FE_TABLE)).replaceWith(function() {
                                return that.renderTable(errorContent);
                            });
                        }
                    }
                }
            },
            { silent: false, store_history: true, stop_on_error: true }
        );
    }


    FrameEditor.prototype.bindEvent = function() {
        var that = this;
        // open popup
        $(document).on('click', vpCommon.formatString('.{0}.{1}', VP_FE_BTN, this.uuid), function(event) {
            if (!$(this).hasClass('disabled')) {
                that.open();
            }
        });
        
        // close popup
        $(document).on('click', this.wrapSelector('.' + VP_FE_CLOSE), function(event) {
            that.close();

            $(vpCommon.formatString('.{0}.{1}', VP_FE_BTN, this.uuid)).remove();
            // vpCommon.removeHeadScript("vpSubsetEditor");
        });

        // select df
        $(document).on('change', this.wrapSelector('#vp_feVariable'), function() {
            // set temporary df
            var origin = $(this).val();

            // initialize state values
            that.state.originObj = origin;
            that.state.tempObj = '_vp_temp_' + origin;
            that.initState();

            // load code with temporary df
            that.loadCode(FRAME_EDIT_TYPE.INIT);
            that.loadInfo();
        });

        // refresh df
        $(document).on('click', this.wrapSelector('.vp-fe-df-refresh'), function() {
            that.loadVariableList();
        });

        // select column
        $(document).on('click', this.wrapSelector('.' + VP_FE_TABLE + ' thead th'), function() {
            var hasSelected = $(this).hasClass('selected');
            $(that.wrapSelector('.' + VP_FE_TABLE + ' th')).removeClass('selected');
            if (!hasSelected) {
                $(this).addClass('selected');
                that.state.axis = 1; // column
                that.state.selected = $(this).text();
            } else {
                that.initState();
                $(this).removeClass('selected');
            }
            
            that.loadInfo();
        });

        // select row
        $(document).on('click', this.wrapSelector('.' + VP_FE_TABLE + ' tbody th'), function() {
            var hasSelected = $(this).hasClass('selected');
            $(that.wrapSelector('.' + VP_FE_TABLE + ' th')).removeClass('selected');
            if (!hasSelected) {
                $(this).addClass('selected');
                that.state.axis = 0; // index(row)
                that.state.selected = $(this).text();
            } else {
                that.initState();
                $(this).removeClass('selected');
            }
            
            that.loadInfo();
        });

        // more rows
        $(document).on('click', this.wrapSelector('.' + VP_FE_TABLE_MORE), function() {
            that.state.lines += TABLE_LINES;
            that.loadCode(FRAME_EDIT_TYPE.SHOW);
        });

        // click button
        $(document).on('click', this.wrapSelector('.' + VP_FE_MENU_ITEM), function() {
            var editType = $(this).attr('data-type');
            that.loadCode(editType);
        });
    }

    return FrameEditor;
});