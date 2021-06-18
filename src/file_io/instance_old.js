define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/pandas/common/commonPandas'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
    , 'nbextensions/visualpython/src/common/vpBoard'
    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, libPandas, pdGen, VpBoard, vpSuggestInputText) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "Instance"
        , funcID : "com_instance"
    }

    var vpBoardLeft;
    var vpBoardRight;

    var selectedBoard;
    var selectedBlocks;

    var pageNumber = 0;

    //////////////// FIXME: move to constants file: Data Types constant ///////////////////////

    var _DATA_TYPES_OF_INDEX = [
        // Index 하위 유형
        'RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'
    ]

    var _DATA_TYPES_OF_GROUPBY = [
        // GroupBy 하위 유형
        'DataFrameGroupBy', 'SeriesGroupBy'
    ]

    var _SEARCHABLE_DATA_TYPES = [
        // pandas 객체
        'DataFrame', 'Series', 'Index', 'Period', 'GroupBy', 'Timestamp'
        , ..._DATA_TYPES_OF_INDEX
        , ..._DATA_TYPES_OF_GROUPBY
        // Plot 관련 유형
        //, 'Figure', 'AxesSubplot'
        // Numpy
        //, 'ndarray'
        // Python 변수
        //, 'str', 'int', 'float', 'bool', 'dict', 'list', 'tuple'
    ];

    // function/method types
    var _METHOD_TYPES = ['function', 'method', 'type', 'builtin_function_or_method']

    /**
     * html load 콜백. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var optionLoadCallback = function(callback, meta) {
        // document.getElementsByTagName("head")[0].appendChild(link);
        // 컨테이너에서 전달된 callback 함수가 존재하면 실행.
        if (typeof(callback) === 'function') {
            var uuid = 'u' + vpCommon.getUUID();
            // 최대 10회 중복되지 않도록 체크
            for (var idx = 0; idx < 10; idx++) {
                // 이미 사용중인 uuid 인 경우 다시 생성
                if ($(vpConst.VP_CONTAINER_ID).find("." + uuid).length > 0) {
                    uuid = 'u' + vpCommon.getUUID();
                }
            }
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM))).find(vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE)).addClass(uuid);

            // 옵션 객체 생성
            var varPackage = new VariablePackage(uuid);
            varPackage.metadata = meta;

            // 옵션 속성 할당.
            varPackage.setOptionProp(funcOptProp);
            // html 설정.
            varPackage.initHtml();
            callback(varPackage);  // 공통 객체를 callback 인자로 전달

            vpBoardLeft = new VpBoard(varPackage, '#vp_leftInstance');
            vpBoardLeft.setBlockClickEvent();
            vpBoardLeft.load();

            vpBoardRight = new VpBoard(varPackage, '#vp_rightInstance');
            vpBoardRight.setBlockClickEvent();
            vpBoardRight.load();

            selectedBoard = vpBoardLeft;
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "file_io/instance.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var VariablePackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        this.package = {
            input: [
                { name: 'vp_varList' },
                { name: 'vp_colMeta' },
                { name: 'vp_returnType' },
                { name: 'vp_returnVariable' }
            ]
        }

        this.state = {
            nowPdObject: '',
            nowColList: []
        }
    }


    /**
     * vpFuncJS 에서 상속
     */
    VariablePackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    VariablePackage.prototype.optionValidation = function() {
        return true;

        // 부모 클래스 유효성 검사 호출.
        // vpFuncJS.VpFuncJS.prototype.optionValidation.apply(this);
    }

    VariablePackage.prototype.getMetadata = function(id) {
        if (this.metadata == undefined)
            return "";
        var len = this.metadata.options.length;
        for (var i = 0; i < len; i++) {
            var obj = this.metadata.options[i];
            if (obj.id == id)
                return obj.value;
        }
        return "";
    }

    VariablePackage.prototype.getMetaLoaded = function(id) {
        if (this.metadata == undefined)
            return true;

        var result = true;
        var len = this.metadata.options.length;
        for (var i = 0; i < len; i++) {
            var obj = this.metadata.options[i];
            if (obj.id == id)
            {
                if (obj.metaLoaded != true) {
                    result = false;
                }
                break;
            }
        }
        return result;
    }

    VariablePackage.prototype.checkMetaLoaded = function(id) {
        if (this.metadata == undefined)
            return true;
        var len = this.metadata.options.length;
        for (var i = 0; i < len; i++) {
            if (this.metadata.options[i].id == id) {
                this.metadata['options'][i]['metaLoaded'] = true;
            }
        }
        return true;
    }

    /**
     * html 내부 binding 처리
     */
    VariablePackage.prototype.initHtml = function() {
        var that = this;

        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/commonPandas.css");
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "file_io/instance.css");

        this.showFunctionTitle();

        // operator autocomplete
        var suggestInput = new vpSuggestInputText.vpSuggestInputText();
        suggestInput.addClass('vp-input s vp-oper-list');
        suggestInput.setPlaceholder("Oper");
        suggestInput.setSuggestList(function() { return ['==', '!=', 'and', 'or', 'in', 'not in', '<', '<=', '>', '>=']; });
        suggestInput.setSelectEvent(function(value) {
            $(this.wrapSelector()).val(value);
            that.replaceBoard();
        });
        suggestInput.setNormalFilter(false);
        $(this.wrapSelector('.vp-oper-list')).replaceWith(function() {
            return suggestInput.toTagString();
        });

        this.getVariableDir();

        // hide del-col button & connect operator tag as default
        $(this.wrapSelector('.vp-oper-connect')).hide();

        // Clear Board
        $(this.wrapSelector('#vp_instanceClear')).click(function() {
            selectedBoard.clear();
            selectedBlocks = selectedBoard.getBoard();
            // search again
            that.getVariableDir();
        });

        // Toggle Equality
        $(this.wrapSelector('#vp_instanceToggleEquality')).click(function() {
            // set equality
            var hasEquality = $(that.wrapSelector('.vp-instance-base')).hasClass('equality');
            if (hasEquality) { 
                $(this).val('Enable Equality');

                // select left board
                selectedBoard = vpBoardLeft;
                selectedBlocks = selectedBoard.getBoard();
                // search again
                that.getVariableDir();
            } else {
                $(this).val('Disable Equality');
            }
            $(that.wrapSelector('.vp-instance-base')).toggleClass('equality');
        });

        // Toggle Board
        $(this.wrapSelector('#vp_instanceToggle')).click(function() {
            var leftBlocks = vpBoardLeft.getBoard();
            var rightBlocks = vpBoardRight.getBoard();

            // clear board
            vpBoardLeft.clear();
            vpBoardRight.clear();

            // set board
            vpBoardLeft.setBoard(rightBlocks);
            vpBoardRight.setBoard(leftBlocks);
            
            // load dir
            selectedBlocks = selectedBoard.getBoard();
            that.getVariableDir(selectedBoard.getCode());
        });

        // Backspace
        $(this.wrapSelector('#vp_instanceBackspace')).click(function() {
            var showBlocksLength = Object.keys(selectedBlocks).length;
            var waitingBlocksLength = selectedBoard.getBoardSize();

            // selectedBoard.removeBlock(selectedBoard.getLastBlockKey());
            selectedBoard.removeLastBlock();
            
            // if synced overwrite
            if (showBlocksLength == waitingBlocksLength) {
                selectedBlocks = selectedBoard.getBoard();
            } else {
                // remove last column option
                $(that.wrapSelector('.vp-del-col:last')).click();
            }

            // search again
            that.getVariableDir(selectedBoard.getCode());
        });

        // Board 클릭 시
        $(this.wrapSelector('.vp-instance-box')).click(function() {
            if ($(this).hasClass('selected')) {
                ;
            } else {
                $(that.wrapSelector('.vp-instance-box')).removeClass('selected');
                $(this).addClass('selected');
                if ($(this).hasClass('left')) {
                    selectedBoard = vpBoardLeft;
                } else if ($(this).hasClass('right')) {
                    selectedBoard = vpBoardRight;
                }
                selectedBlocks = selectedBoard.getBoard();
    
                // board 변경 시 다시 조회
                that.getVariableDir(selectedBoard.getCode());
            }
        });

        // Attribute, Method 변경 시
        $(this.wrapSelector('.vp-instance-search')).change(function() {
            var varName = $(this).val();
            var blockType = $(this).hasClass('attr')? 'var': 'api';

            if (selectedBoard.getBoardSize() > 0) {
                varName = '.' + varName;
            }

            selectedBoard.addBlocks([{
                code: varName,
                type: blockType
            }]);
            selectedBlocks = selectedBoard.getBoard();

            // reset search tag
            $(that.wrapSelector('.vp-instance-search')).val('');

            // refresh with dir
            that.getVariableDir(selectedBoard.getCode());
        });

        // Attribute 클릭 시
        $(document).on('click', this.wrapSelector('#vp_insAttr ul li'), function() {
            var varName = $(this).attr('data-var-name');

            $(that.wrapSelector('#vp_insAttrSearch')).val(varName);
            $(that.wrapSelector('#vp_insAttrSearch')).change();
        });

        // Method 클릭 시
        $(document).on('click', this.wrapSelector('#vp_insMethod ul li'), function() {
            var varName = $(this).attr('data-var-name');

            $(that.wrapSelector('#vp_insMethodSearch')).val(varName);
            $(that.wrapSelector('#vp_insMethodSearch')).change();
        });

        // Method parameter 입력 시
        $(this.wrapSelector('#vp_insArguments')).change(function() {
            var args = $(this).val();

            var lastBlockKey = selectedBoard.getLastBlockKey();
            var boardController = selectedBoard.getBoard();
            var code = boardController[lastBlockKey].code;
            code = code.replace('()', '(' + args + ')');

            selectedBoard.setBlockCode(lastBlockKey, code);
            selectedBlocks = selectedBoard.getBoard();

            that.replaceBoard();
        });

        // Argument Apply
        $(this.wrapSelector('#vp_insArgOk')).click(function() {
            selectedBlocks = selectedBoard.getBoard();

            // refresh with dir
            that.getVariableDir(selectedBoard.getCode());
            that.showPage('select');
        });

        // Object Apply
        $(this.wrapSelector('#vp_insObjOk')).click(function() {
            selectedBlocks = selectedBoard.getBoard();
            
            // refresh with dir
            that.getVariableDir(selectedBoard.getCode());
            that.showPage('select');
        });

        // column selection
        $(document).on('change', this.wrapSelector('.vp-col-list'), function() {
            that.replaceBoard();

            var objName = $(that.wrapSelector('#vp_instanceCode')).val();
            var colName = $(this).val();
            var colDtype = $(this).find(':selected').data('dtype');
            var conditionTag = $(this).closest('td').find('.vp-condition');

            // search column unique values
            var code = new sb.StringBuilder();
            code.appendLine('import json');
            code.appendFormatLine('_vpcoluniq = {0}[{1}].unique()', objName, convertToStr(colName));
            code.appendLine('_vpcoluniq.sort()');
            // code.append('print(json.dumps(list(_vpcoluniq)))');
            code.appendFormat(`print(json.dumps({"dtype": str({0}[{1}].dtype)`, objName, convertToStr(colName));
            code.append(`, "list": [ { "value": ("'" + c + "'") if type(c).__name__ == 'str' else c, "label": c } for c in list(_vpcoluniq) ]}))`);
            that.kernelExecute(code.toString(), function(result) {
                var varResult = JSON.parse(result);
                var dtype = varResult.dtype;
                var list = varResult.list;
                console.log('column details');
                console.log(dtype, list);
                if (dtype == 'object') {
                    if (list != undefined && list.length > 0) {
                        // conditions using suggestInput
                        var suggestInput = new vpSuggestInputText.vpSuggestInputText();
                        suggestInput.addClass('vp-input m');
                        suggestInput.addClass('vp-condition');
                        suggestInput.setPlaceholder("categorical dtype");
                        suggestInput.setSuggestList(function() { return list; });
                        suggestInput.setSelectEvent(function(value) {
                            $(this.wrapSelector()).val(value);
                            that.replaceBoard();
                        });
                        suggestInput.setNormalFilter(false);
                        $(conditionTag).replaceWith(function() {
                            return suggestInput.toTagString();
                        });
                    }
                } else {
                    // condition reset using suggestInput
                    var suggestInput = new vpSuggestInputText.vpSuggestInputText();
                    suggestInput.addClass('vp-input m');
                    suggestInput.addClass('vp-condition');
                    if (dtype != undefined) {
                        suggestInput.setPlaceholder(dtype + " dtype");
                    }
                    suggestInput.setNormalFilter(false);
                    $(conditionTag).replaceWith(function() {
                        return suggestInput.toTagString();
                    });
                }
            });

        });
        // operator selection
        $(document).on('click', this.wrapSelector('.vp-oper-list'), function() {
            that.replaceBoard();
        });
        // condition change
        $(document).on('change', this.wrapSelector('.vp-condition'), function() {
            that.replaceBoard();
        });
        // connector selection
        $(document).on('click', this.wrapSelector('.vp-oper-connect'), function() {
            that.replaceBoard();
        });

        // on column add
        $(this.wrapSelector('#vp_addCol')).click(function() {
            var clone = $(that.wrapSelector('#vp_colList tr:first')).clone();

            clone.find('input').val('');
            clone.find('.vp-condition').attr({'placeholder': ''});

            // set column suggest input
            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
            suggestInput.addClass('vp-input m vp-col-list');
            suggestInput.setPlaceholder("Column Name");
            suggestInput.setSuggestList(function() { return that.state.nowColList; });
            suggestInput.setNormalFilter(false);
            clone.find('.vp-col-list').replaceWith(function() {
                return suggestInput.toTagString();
            });

            // set operater suggest input
            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
            suggestInput.addClass('vp-input s vp-oper-list');
            suggestInput.setPlaceholder("Oper");
            suggestInput.setSuggestList(function() { return ['==', '!=', 'and', 'or', 'in', 'not in', '<', '<=', '>', '>=']; });
            suggestInput.setSelectEvent(function(value) {
                $(this.wrapSelector()).val(value);
                that.replaceBoard();
            });
            suggestInput.setNormalFilter(false);
            clone.find('.vp-oper-list').replaceWith(function() {
                return suggestInput.toTagString();
            });

            // hide last connect operator
            clone.find('.vp-oper-connect').hide();
            // show connect operator right before last one
            $(that.wrapSelector('#vp_colList .vp-oper-connect:last')).show();
            clone.insertBefore('#vp_colList tr:last');

            // show delete button
            // $(that.wrapSelector('#vp_colList tr td .vp-del-col')).show();
        });
        // on column delete
        $(document).on("click", this.wrapSelector('.vp-del-col'), function(event) {
            event.stopPropagation();
            
            var colList = $(that.wrapSelector('#vp_colList tr td:not(:last)'));
            if (colList.length <= 1) {
                // clear
                $(that.wrapSelector('.vp-col-list')).val('');
                $(that.wrapSelector('.vp-oper-list')).val('');
                $(that.wrapSelector('.vp-condition')).val('');
                $(that.wrapSelector('.vp-condition')).attr({ 'placeholder': '' });
                $(that.wrapSelector('.vp-oper-connect')).val('');
            } else {
                $(this).parent().parent().remove();
                $(that.wrapSelector('#vp_colList .vp-oper-connect:last')).hide();

                if (colList.length == 2) {
                    if ($(that.wrapSelector('.vp-col-list')).val() != '') {
                        $(that.wrapSelector('#vp_returnType')).attr('disabled', false);
                    }
                }
            }

            that.replaceBoard();
        });

        // on return type change
        $(this.wrapSelector('#vp_returnType')).change(function() {
            that.replaceBoard();

            // $(that.wrapSelector('#vp_insObjOk')).click();
        });
    }

    VariablePackage.prototype.getVariableDir = function(varName = '', callback = undefined) {
        var that = this;

        // remove brackets
        // varName = varName.replace(/([^()]*)/g, '');
        // varName = varName.replace(/\([^()]*\)/g, ''); // remove brackets and arguments

        var code = new sb.StringBuilder();
        code.appendLine('import json');
        code.appendFormatLine('_vp_vars = dir({0})', varName);
        code.append('print(json.dumps(');
        if (varName == '') {
            code.append("{ 'type': 'None', 'list': [");
            code.append("{ 'name': v, 'type': type(eval(v)).__name__ } ");
        } else {
            code.appendFormat("{ 'type': type({0}).__name__, 'list': [", varName);
            code.appendFormat("{ 'name': v, 'type': type(eval({0} + '.' + v)).__name__ } ", convertToStr(varName));
        }
        code.appendFormat(" for v in _vp_vars if (not v.startswith('_')) and (v not in {0})"
                        , JSON.stringify(pdGen._VP_NOT_USING_VAR));
        code.appendLine(']}))');
        var codes = code.toString();
        this.kernelExecute(codes, function(result) {
            try {
                var varObj = JSON.parse(result);

                var varType = varObj.type;
                var varList = varObj.list;

                // set variable type
                $(that.wrapSelector('#vp_instanceType')).text(varType);
                // set variable code
                $(that.wrapSelector('#vp_instanceCode')).val(varName);

                // dir list
                var attrListTag = new sb.StringBuilder();
                var methodListTag = new sb.StringBuilder();
                var attrList = [];
                var methodList = [];
                varList != undefined && varList.forEach(obj => {
                    if (obj.type.includes('Indexer')) {
                        // methodListTag.appendFormatLine('<li class="vp-select-item" data-var-name="{0}" data-var-type="{1}"><span>{2}</span>{3}</li>'
                        //                             , obj.name + '[]', obj.type, obj.type, obj.name);
                        // methodList.push({
                        //     label: obj.name + '[]' + ' (' + obj.type + ')',
                        //     value: obj.name + '[]' 
                        // });
                    }
                    // Method/Function... 이면 Method 항목에 표시
                    else if (_METHOD_TYPES.includes(obj.type)) {
                        methodListTag.appendFormatLine('<li class="vp-select-item" data-var-name="{0}" data-var-type="{1}"><span>{2}</span>{3}</li>'
                                                    , obj.name + '()', obj.type, obj.type, obj.name);
                        methodList.push({
                            label: obj.name + '()' + ' (' + obj.type + ')',
                            value: obj.name + '()' 
                        });
                    } else {
                        // FIXME: type이 module일 경우엔 pd(pandas) module만 표시
                        if (obj.type == 'module' && obj.name != 'pd') {
                            ;
                        } else {
                            attrListTag.appendFormatLine('<li class="vp-select-item" data-var-name="{0}" data-var-type="{1}"><span>{2}</span>{3}</li>'
                                                        , obj.name, obj.type, obj.type, obj.name);
                            attrList.push({
                                label: obj.name + ' (' + obj.type + ')',
                                value: obj.name
                            });
                        }
                    }

                });
                $(that.wrapSelector('#vp_insAttr ul')).html(attrListTag.toString());
                $(that.wrapSelector('#vp_insMethod ul')).html(methodListTag.toString());

                $(that.wrapSelector('#vp_insAttrSearch')).autocomplete({
                    source: attrList,
                    autoFocus: true
                });

                $(that.wrapSelector('#vp_insMethodSearch')).autocomplete({
                    source: methodList,
                    autoFocus: true
                });

                if (callback != undefined && typeof callback == "function") {
                    callback(varList);
                }

                // show pandas object box
                if (varType == 'DataFrame' || varType == 'Series') {
                    that.showPage('object');
                } else {
                    if (_METHOD_TYPES.includes(varType)) {
                        that.showPage('argument');
                    } else {
                        that.showPage('select');
                    }
                }
            } catch (err) {
                console.log(err);
                // set variable type
                // $(that.wrapSelector('#vp_instanceType')).text('Error');
                var prevVarType = $(that.wrapSelector('#vp_instanceType')).text();
                // set variable code
                $(that.wrapSelector('#vp_instanceCode')).val(varName);

                $(that.wrapSelector('#vp_insAttr ul')).html('');
                $(that.wrapSelector('#vp_insMethod ul')).html('');

                $(that.wrapSelector('#vp_insAttrSearch')).autocomplete({
                    source: [] 
                });
                $(that.wrapSelector('#vp_insMethodSearch')).autocomplete({
                    source: []
                });

                that.showPage('argument');
            }

        });
    }

    /**
     * Show Page
     * @param {String} pageType object / argument / select
     */
    VariablePackage.prototype.showPage = function(pageType) {
        if (pageType == 'object') {
            // show pandas object box
            $(this.wrapSelector('.vp-instance-select-base')).hide();
            $(this.wrapSelector('.vp-instance-option-base')).show();

            this.handleVariableSelection();
            $(this.wrapSelector('.vp-instance-option-box.object')).show();
            $(this.wrapSelector('.vp-instance-option-box.argument')).hide();
        } else if (pageType == 'argument') {
            // show argument input box
            $(this.wrapSelector('.vp-instance-select-base')).hide();
            $(this.wrapSelector('.vp-instance-option-base')).show();

            $(this.wrapSelector('.vp-instance-option-box.object')).hide();
            $(this.wrapSelector('.vp-instance-option-box.argument')).show();
        } else {
            // show select attribute/method page
            $(this.wrapSelector('.vp-instance-option-base')).hide();
            $(this.wrapSelector('.vp-instance-select-base')).show();
        }
    }

    var convertToStr = function(code) {
        if (!$.isNumeric(code)) {
            if (code.includes("'")) {
                code = `"${code}"`;
            } else {
                code = `'${code}'`;
            }
        }
        return code;
    }

    /**
     * make block to add on API Board
     */
    VariablePackage.prototype.makeBlock = function() {
        var varName = $(this.wrapSelector('#vp_instanceCode')).val();
        if (varName == undefined || varName == '') {
            return [];
        }

        var varType = $(this.wrapSelector('#vp_instanceType')).text();

        /**
         * Add block to board with condition
         * - type: var / api
         * - columns : column / condition(column + operator)
         * - return type : if last bracket has only one column - DataFrame/Series selectable
         *               / else - its datatype
         * - cases :
         *  1) df[col] / df[[col]] / df[[col1, col2]]
         *  2) df[condition] / df[condition1 & condition2]
         *  3) df[condition][col] / df[condition][[col]]
         *  4) df[[col]][condition]
         *  5) s
         */

        // vpBoard add
        var blocks = JSON.parse(JSON.stringify(selectedBlocks));
        // object to list
        blocks = Object.values(blocks);

        // columns + condition block
        var colList = $(this.wrapSelector('#vp_colList tr td:not(:last)'));
        var colMeta = []; // metadata for column list
        
        var colSelector = [];   // temporary column list 
        var condSelector = [];  // temporary condition list
        for (var i = 0; i < colList.length; i++) {
            var colTag = $(colList[i]);
            var colName = colTag.find('.vp-col-list').val();
            var oper = colTag.find('.vp-oper-list').val();
            var cond = colTag.find('.vp-condition').val();
            var connector = i > 0? $(colList[i- 1]).find('.vp-oper-connect').val() : undefined;

            // if no column selected, pass
            if (colName == "") continue;

            // save metadata for column list
            colMeta.push({
                'vp-col-list': colName,
                'vp-oper-list': oper,
                'vp-condition': cond,
                'vp-oper-connect': $(colList[i]).find('.vp-oper-connect').val()
            });

            // if operator selected, condition / else column
            if (oper == '') {
                // column 
                // add blocks with last temp condition list
                if (condSelector.length > 0) {
                    // block result : [condition1, condition2]
                    var idx = blocks.length;
                    blocks = blocks.concat(condSelector);
                    var lastIdx = blocks.length - 1;
                    // [] 추가
                    blocks.push({
                        code: '[]', type: 'brac', child: lastIdx
                    });

                    // idx 연결
                    blocks[idx - 1]['next'] = blocks.length - 1;

                    condSelector = [];
                }
                // column selector
                colSelector.push(colName);
            } else {
                // condition selector
                // add blocks with last temp column list
                if (colSelector.length > 0) {
                    // block result : [[code1, code2]] / [[col]]
                    var idx = blocks.length;
                    blocks[idx - 1]['next'] = idx + 2;
                    blocks.push({
                        code: colSelector.map(v => convertToStr(v)).toString(),
                        type: 'code'
                    });
                    blocks.push({
                        code: '[]', type: 'brac', child: idx
                    });
                    blocks.push({
                        code: '[]', type: 'brac', child: idx + 1
                    });
                    
                    colSelector = [];
                }
                var idx = blocks.length + condSelector.length;
                var hasPrev = condSelector.length > 0;
                condSelector = condSelector.concat([
                    { code: varName, type: 'var', next: idx + 2 },     // idx
                    { code: convertToStr(colName), type: 'code' },    
                    { code: '[]', type: 'brac', child: idx + 1 }
                ]);
                if (cond != undefined && cond !== '') {
                    condSelector.push({ code: cond, type: 'code' });
                    condSelector.push({ code: oper, type: 'oper', left: idx, right: idx + 3 });
                } else {
                    condSelector.push({ code: oper, type: 'oper', left: idx, right: -1 });
                }
                if (connector != undefined && hasPrev) {
                    condSelector.push({
                        code: connector, type: 'oper'
                        , left: idx - 1
                        , right: blocks.length + condSelector.length - 1
                    });
                }
            }
        }

        if (condSelector.length > 0) {
            var idx = blocks.length;
            blocks = blocks.concat(condSelector);
            var lastIdx = blocks.length - 1;
            // [] 추가
            blocks.push({
                code: '[]', type: 'brac', child: lastIdx
            });

            // idx 연결
            blocks[idx - 1]['next'] = blocks.length - 1;

            condSelector = [];

            // only same as datatype
            $(this.wrapSelector('#vp_returnType')).val(varType);
            $(this.wrapSelector('#vp_returnType')).attr('disabled', true);
        } else {
            // set return type depends on last columns
            if (colSelector.length != 1) {
                // only dataframe
                $(this.wrapSelector('#vp_returnType')).val(varType);
                $(this.wrapSelector('#vp_returnType')).attr('disabled', true);
            } else {
                // allow dataframe/series selection
                $(this.wrapSelector('#vp_returnType')).attr('disabled', false);
            }

            var returnType = $(this.wrapSelector('#vp_returnType')).val();
            if (colSelector.length > 0) {
                if (returnType == 'DataFrame') {
                    // with double brackets
                    var idx = blocks.length;
                    blocks[idx - 1]['next'] = idx + 2;
                    blocks.push({
                        code: colSelector.map(v => convertToStr(v)).toString(),
                        type: 'code'
                    });
                    blocks.push({
                        code: '[]', type: 'brac', child: idx
                    });
                    blocks.push({
                        code: '[]', type: 'brac', child: idx + 1
                    });
                } else if (returnType == 'Series') {
                    // with single bracket
                    var idx = blocks.length;
                    blocks[idx - 1]['next'] = idx + 1;
                    blocks.push({
                        code: colSelector.map(v => convertToStr(v)).toString(),
                        type: 'code'
                    });
                    blocks.push({
                        code: '[]', type: 'brac', child: idx
                    });
                }
            }
            
        }

        // save column metadata
        $(this.wrapSelector('#vp_colMeta')).val(encodeURIComponent(JSON.stringify(colMeta)));

        return blocks;
    }

    /**
     * initialize options
     */
    VariablePackage.prototype.initOptions = function(loadMeta = false) {
        var that = this;

        if (loadMeta) {
            // load other metadata
            $(this.wrapSelector('#vp_returnType')).val(this.getMetadata('vp_returnType'));
            this.checkMetaLoaded('vp_returnType');
            this.checkMetaLoaded('vp_apiSearch');
        } else {
            $(this.wrapSelector('#vp_varApiSearch')).val('');
            $(this.wrapSelector('#vp_varApiFuncId')).val('');
        }

        // bind event for variable selection
        this.handleVariableSelection();
        
    }

    /**
     * 선택한 패키지명 입력
     */
    VariablePackage.prototype.showFunctionTitle = function() {
        $(this.wrapSelector('.vp_functionName')).text(funcOptProp.funcName);
    }

    /**
     * refresh and replace board with current information
     * - variable + columns/conditions + return type + api
     */
    VariablePackage.prototype.replaceBoard = function() {
        // clear board
        selectedBoard.clear();

        var blocks = this.makeBlock();
        console.log('replace board', blocks);
        // add block
        selectedBoard.addBlocks(blocks);
    }

    /**
     * Bind variable selection events
     * - on change variables
     */
    VariablePackage.prototype.handleVariableSelection = function() {
        // get selected variable info
        var varName = selectedBoard.getCode();
        var varType = $(this.wrapSelector('#vp_instanceType')).text();

        // initialize on event : hide options
        $(this.wrapSelector('#vp_colList')).closest('tr').hide();
        // initialize column list
        var clone = $(this.wrapSelector('#vp_colList tr:first')).clone();
        clone.find('input').val('');
        clone.find('.vp-condition').attr({'placeholder': ''});
        // hide last connect operator
        clone.find('.vp-oper-connect').hide();
        // hide delete button
        // clone.find('.vp-del-col').hide();

        $(this.wrapSelector('#vp_colList tr:not(:last)')).remove();
        $(this.wrapSelector('#vp_colList')).prepend(clone);

        // Pandas Objects
        // if pandas object
        if (varType == 'DataFrame') {
            this.state.nowPdObject = varName;

            // 2. DataFrame - show index, columns
            this.getObjectDetail(varName, 'columns', '.vp-col-list');

            $(this.wrapSelector('#vp_colList')).closest('tr').show();

            $(this.wrapSelector('#vp_returnType')).attr('disabled', false);

        } else if (varType == 'Series') {
            this.state.nowPdObject = varName;

            // series
            // replace board with now status of board option
            this.replaceBoard();

            $(this.wrapSelector('#vp_returnType')).attr('disabled', true);
        }
    };

    /**
     * Get variable detail
     * @param {string} varName 
     * @param {string} property 
     * @param {string} selectId select tag id with selector
     */
    VariablePackage.prototype.getObjectDetail = function(varName, property, selectId) {
        var that = this;

        // init
        this.state.nowColList = [];

        // 변수 col, idx 정보 조회 command, callback
        var command = new sb.StringBuilder();
        command.appendLine('import json');
        command.append('print(json.dumps([ { "value": c ')
        // if (property == 'columns') {
        //     command.appendFormat(', "dtype": str({0}[c].dtype)', varName);
        // }
        command.appendFormat('} for c in {0}.{1} ]))', varName, property);
        this.kernelExecute(command.toString(), function(result) {
            var varList = JSON.parse(result);

            // var optVar = new sb.StringBuilder();
            // optVar.appendLine('<option value=""></option>');
            // varList.forEach(obj => {
            //     optVar.appendFormat('<option value="{0}"', obj.value);
            //     if (property == 'columns') {
            //         optVar.appendFormat(' data-dtype="{0}"', obj.dtype)
            //     }
            //     optVar.appendFormatLine('>{0}</option>', obj.value);
            // });
            var colList = [];
            varList.forEach(obj => {
                colList.push({ label: obj.value, value: obj.value });
            });
            that.state.nowColList = colList;

            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
            suggestInput.addClass('vp-input m vp-col-list');
            suggestInput.setPlaceholder("Column Name");
            suggestInput.setSuggestList(function() { return colList; });
            suggestInput.setNormalFilter(false);
            $(that.wrapSelector('.vp-col-list')).replaceWith(function() {
                return suggestInput.toTagString();
            });

            // if first time loading, set with metadata
            if (that.getMetaLoaded('vp_colMeta') == false) {
                var decodedMeta = decodeURIComponent(that.getMetadata('vp_colMeta'));
                if (decodedMeta != "") {
                    var colMeta = JSON.parse(decodedMeta);
                    // add columns as colMeta length
                    for(var i = 0; i < colMeta.length -1; i++) {
                        $(that.wrapSelector('#vp_addCol')).trigger('click');
                    }
                    // load column data
                    var colList = $(that.wrapSelector('#vp_colList tr td:not(:last)'));
                    for (var i = 0; i < colList.length; i++) {
                        var colTag = $(colList[i]);
                        colTag.find('.vp-col-list').val(colMeta[i]['vp-col-list']);
                        colTag.find('.vp-oper-list').val(colMeta[i]['vp-oper-list']);
                        colTag.find('.vp-condition').val(colMeta[i]['vp-condition']);
                        colTag.find('.vp-oper-connect').val(colMeta[i]['vp-oper-connect']);
                    }
                }
                that.checkMetaLoaded('vp_colMeta');
            }

            // replace board with now status of board option
            that.replaceBoard();
        });      
    };

    /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    VariablePackage.prototype.generateCode = function(addCell, exec) {
        
        var sbCode = new sb.StringBuilder();

        // 변수 내용 조회
        // if equality enabled
        var hasEquality = $(this.wrapSelector('.vp-instance-base')).hasClass('equality');
        if (hasEquality) {
            var leftCode = vpBoardLeft.getCode();
            var rightCode = vpBoardRight.getCode();
            sbCode.appendFormat('{0} = {1}', leftCode, rightCode);
        } else {
            var boardCode = selectedBoard.getCode();
            sbCode.appendFormat('{0}', boardCode);
        }

        if (addCell) this.cellExecute(sbCode.toString(), exec);

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});