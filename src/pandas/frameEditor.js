define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/common/kernelApi'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, kernelApi) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "Frame Editor"
        , funcID : "pd_frameEditor"
        , libID : "pd000"
    }

    const VP_FE = 'vp-fe';
    const VP_FE_DF_BOX = 'vp-fe-df-box';
    const VP_FE_DF_REFRESH = 'vp-fe-df-refresh';

    const VP_FE_MENU_BOX = 'vp-fe-menu-box';
    const VP_FE_MENU_ITEM = 'vp-fe-menu-item';

    const VP_FE_TABLE = 'vp-fe-table';
    const VP_FE_TABLE_MORE = 'vp-fe-table-more';

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
     * html load 콜백. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var optionLoadCallback = function(callback, meta) {
        // document.getElementsByTagName("head")[0].appendChild(link);
        // 컨테이너에서 전달된 callback 함수가 존재하면 실행.
        if (typeof(callback) === 'function') {
            var uuid = vpCommon.getUUID();
            // 최대 10회 중복되지 않도록 체크
            for (var idx = 0; idx < 10; idx++) {
                // 이미 사용중인 uuid 인 경우 다시 생성
                if ($(vpConst.VP_CONTAINER_ID).find("." + uuid).length > 0) {
                    uuid = vpCommon.getUUID();
                }
            }
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM))).find(vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE)).addClass(uuid);

            // 옵션 객체 생성
            var pdPackage = new PandasPackage(uuid);
            pdPackage.metadata = meta;

            // 옵션 속성 할당.
            pdPackage.setOptionProp(funcOptProp);
            // html 설정.
            pdPackage.initHtml();
            callback(pdPackage);  // 공통 객체를 callback 인자로 전달
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "pandas/common/commonEmptyPage.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var PandasPackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        // pandas 함수
        this.package = {
            input: [
                { name: 'vp_feVariable' }
            ]
        }
        this.state = {
            origin_obj: '',
            temp_obj: '',
            selected: '',
            axis: 0,
            lines: TABLE_LINES,
            steps: []
        }
    }


    /**
     * vpFuncJS 에서 상속
     */
    PandasPackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    PandasPackage.prototype.optionValidation = function() {
        return true;

        // 부모 클래스 유효성 검사 호출.
        // vpFuncJS.VpFuncJS.prototype.optionValidation.apply(this);
    }


    /**
     * html 내부 binding 처리
     */
    PandasPackage.prototype.initHtml = function() {
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/commonPandas.css");
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/frameEditor.css");
        this.renderThis();
        this.bindEvents();

        this.loadVariableList();
    }

    PandasPackage.prototype.renderThis = function() {
        var page = new sb.StringBuilder();
        page.appendFormatLine('<div class="{0}">', VP_FE);
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

        // Info Box
        var infoBox = this.createOptionContainer('Column Info');
        infoBox.addClass('vp-fe-info');
        // TODO: get selected columns info
        infoBox.appendContent('column info'); // value_counts()
        page.appendFormatLine('{0}', infoBox.toTagString());

        // Table
        page.appendFormatLine('<div class="{0}">', VP_FE_TABLE);

        page.appendLine('</div>'); // End of Table

        page.appendLine('</div>');

        this.setPage(page.toString());
    }

    PandasPackage.prototype.loadVariableList = function() {
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

    PandasPackage.prototype.renderVariableList = function(varList) {
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

    PandasPackage.prototype.renderTable = function(renderedText, isHtml=true) {
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
    
    PandasPackage.prototype.loadCode = function(type) {
        var that = this;

        var tempObj = this.state.temp_obj;
        var orgObj = this.state.origin_obj;
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


    PandasPackage.prototype.bindEvents = function() {
        var that = this;

        // select df
        $(document).on('change', this.wrapSelector('#vp_feVariable'), function() {
            // set temporary df
            var origin = $(this).val();

            // initialize state values
            that.state.origin_obj = origin;
            that.state.temp_obj = '_vp_temp_' + origin;
            that.state.selected = '';
            that.state.axis = 0;
            that.state.lines = TABLE_LINES;
            that.state.steps = [];

            // load code with temporary df
            that.loadCode(FRAME_EDIT_TYPE.INIT);
        });

        // refresh df
        $(document).on('click', this.wrapSelector('.vp-fe-df-refresh'), function() {
            that.loadVariableList();
        });

        // select column
        $(document).on('click', this.wrapSelector('.' + VP_FE_TABLE + ' thead th'), function() {
            $(that.wrapSelector('.' + VP_FE_TABLE + ' th')).removeClass('selected');
            $(this).addClass('selected');

            that.state.axis = 1; // column
            that.state.selected = $(this).text();
        });

        // select row
        $(document).on('click', this.wrapSelector('.' + VP_FE_TABLE + ' tbody th'), function() {
            $(that.wrapSelector('.' + VP_FE_TABLE + ' th')).removeClass('selected');
            $(this).addClass('selected');

            that.state.axis = 0; // index(row)
            that.state.selected = $(this).text();
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

    /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    PandasPackage.prototype.generateCode = function(addCell, exec) {
        
        var sbCode = new sb.StringBuilder();
        

        // 코드 생성
        var result = this.state.steps.join('\n');
        if (result == null) return "BREAK_RUN"; // 코드 생성 중 오류 발생
        sbCode.append(result);
        

        if (addCell) this.cellExecute(sbCode.toString(), exec);

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});