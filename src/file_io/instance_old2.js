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
    , './instanceObject.js'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, libPandas, pdGen, VpBoard, vpSuggestInputText, Instance) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "Instance"
        , funcID : "com_instance"
    }

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
    var _METHOD_TYPES = ['function', 'method', 'type', 'builtin_function_or_method', 'PlotAccessor'];

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
            
            // load metadata
            if (meta != undefined && meta.options != undefined) {
                try {
                    var leftMeta = decodeURIComponent(meta.options[0].value);
                    var rightMeta = decodeURIComponent(meta.options[1].value);
                    
                    var leftBlocks = JSON.parse(leftMeta);
                    var rightBlocks = JSON.parse(rightMeta);
                    
                    varPackage.state.left.board.loadBoard(leftBlocks);
                    varPackage.state.right.board.loadBoard(rightBlocks);
                } catch {
                    ;
                }
            }

            // html 설정.
            varPackage.initHtml();
            callback(varPackage);  // 공통 객체를 callback 인자로 전달
            
            // varPackage.state.left.board.setBlockClickEvent();
            varPackage.state.left.board.load();
            // varPackage.state.right.board.setBlockClickEvent();
            varPackage.state.right.board.load();

            varPackage.state.pointer = varPackage.state.left;
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
                { name: 'vp_stateLeft' },
                { name: 'vp_stateRight' }
            ]
        }

        this.state = {
            left: {
                board: new VpBoard(this, '#vp_leftInstance'),
                instance: Instance.empty
            }
            , right: {
                board: new VpBoard(this, '#vp_rightInstance'),
                instance: Instance.empty
            }
        }
        this.pointer = this.state.left;
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

        // Consider Equality using metadata
        if (this.metadata && this.metadata.options) {
            var size = this.state.right.board.getBoardSize();
            if (size > 0) {
                // Enable Equality
                $(this.wrapSelector('.vp-instance-base')).addClass('equality');
                $(this.wrapSelector('#vp_instanceToggleEquality')).val('Disable Equality');
            }
        }
        
        this.handleInstanceSelection();

        // Clear Board
        $(this.wrapSelector('#vp_instanceClear')).click(function() {
            that.pointer.board.clear();
            // search again
            that.handleInstanceSelection();
        });

        // Toggle Equality
        $(this.wrapSelector('#vp_instanceToggleEquality')).click(function() {
            // set equality
            var hasEquality = $(that.wrapSelector('.vp-instance-base')).hasClass('equality');
            if (hasEquality) { 
                $(this).val('Enable Equality');

                // save Instance as a metadata
                // that.saveCurrentInstanceInBlock();

                // select left board
                that.pointer = that.state.left;
                // search again
                that.handleInstanceSelection();
            } else {
                $(this).val('Disable Equality');
            }
            $(that.wrapSelector('.vp-instance-base')).toggleClass('equality');
        });

        // Toggle Board
        $(this.wrapSelector('#vp_instanceToggle')).click(function() {
            // save Instance as a metadata
            // that.saveCurrentInstanceInBlock();

            var leftBlocks = that.state.left.board.getBoard();
            var rightBlocks = that.state.right.board.getBoard();

            // clear board
            that.state.left.board.clear();
            that.state.right.board.clear();

            // set board
            that.state.left.board.setBoard(rightBlocks);
            that.state.right.board.setBoard(leftBlocks);
            
            // load dir
            that.handleInstanceSelection();
        });

        // Backspace
        $(this.wrapSelector('#vp_instanceBackspace')).click(function() {
            that.pointer.board.removeLastBlock();

            // search again
            that.handleInstanceSelection();
        });

        // Board 클릭 시
        $(this.wrapSelector('.vp-instance-box')).click(function() {
            if ($(this).hasClass('selected')) {
                that.loadCurrentInstance();
            } else {
                $(that.wrapSelector('.vp-instance-box')).removeClass('selected');
                $(this).addClass('selected');
                if ($(this).hasClass('left')) {
                    that.pointer = that.state.left;
                } else if ($(this).hasClass('right')) {
                    that.pointer = that.state.right;
                }
                
                // board 변경 시 다시 조회
                that.handleInstanceSelection();
            }
        });

        // Attribute, Method 변경 시
        // $(document).on('change', this.wrapSelector('.vp-instance-search'), function() {
        //     var varName = $(this).val();
        //     var varType = $(this).closest('.vp-instance-type').val();
        //     var blockType = $(this).hasClass('attr')? 'var': 'api';

        //     that.handleAttrMethodSelection(varName, varType, blockType);
        // });

        // Attribute 클릭 시
        $(document).on('click', this.wrapSelector('#vp_insAttr ul li'), function() {
            var varName = $(this).attr('data-var-name');
            var varType = $(this).attr('data-var-type');

            that.handleAttrMethodSelection(varName, varType, 'var');
        });

        // Method 클릭 시
        $(document).on('click', this.wrapSelector('#vp_insMethod ul li'), function() {
            var varName = $(this).attr('data-var-name');
            var varType = $(this).attr('data-var-type');

            that.handleAttrMethodSelection(varName, varType, 'api');
        });

        // Method parameter 입력 시
        $(this.wrapSelector('#vp_insArguments')).change(function() {
            var args = $(this).val();
            if (args == undefined || args == '') {
                return ;
            }

            var lastBlockKey = that.pointer.board.getLastBlockKey();
            var boardController = that.pointer.board.getBoard();
            var left = boardController[lastBlockKey].left;
            // replace child
            if (left != undefined && left >= 0) {
                that.pointer.board.removeBlock(left, true);
            }
            that.pointer.board.addBlock({ code: args, type: 'code' }, lastBlockKey, 'left');

            that.pointer.instance.setArgs(args);

            // save Instance as a metadata
            that.saveCurrentInstanceInBlock();
        });

        // Argument Apply
        $(this.wrapSelector('#vp_insArgOk')).click(function() {
            // refresh with dir
            $(that.wrapSelector('#vp_insArguments')).change();
            that.handleInstanceSelection(function() {
                that.showPage('select');
            });
        });

        // Object Apply
        $(this.wrapSelector('#vp_insObjOk')).click(function() {
            // save Instance as a metadata
            that.saveCurrentInstanceInBlock();
            // refresh with dir
            that.handleInstanceSelection(function() {
                that.showPage('select');
            });
        });

        // column selection
        $(document).on('change', this.wrapSelector('.vp-col-list'), function() {
            var colName = $(this).val();

            that.handleColumnSelection(colName, $(this));
        });
        // operator selection
        $(document).on('click', this.wrapSelector('.vp-oper-list'), function() {
            that.loadBoard();
        });
        // condition change
        $(document).on('change', this.wrapSelector('.vp-condition'), function() {
            that.loadBoard();
        });
        // connector selection
        $(document).on('click', this.wrapSelector('.vp-oper-connect'), function() {
            that.loadBoard();
        });
        // on column add
        $(document).on('click', this.wrapSelector('#vp_addCol'), function() {
            that.handleColumnAdd();
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

            that.loadBoard();
        });

        $(this.wrapSelector('#vp_useIndexer')).change(function() {
            that.loadBoard();
        });

        // on return type change
        $(this.wrapSelector('#vp_returnType')).change(function() {
            that.loadBoard();

            // $(that.wrapSelector('#vp_insObjOk')).click();
        });

    }

    VariablePackage.prototype.loadBoard = function() {
        if (this.pointer.instance.getType() == 'DataFrame') {
            var rootKey = this.pointer.board.getLastBlockKey();
            // remove child 
            var boardController = this.pointer.board.getBoard();
            if (rootKey > 0) {
                var right = boardController[rootKey].right;
                // replace child
                if (right != undefined && right >= 0) {
                    this.pointer.board.removeBlock(right, true);
                }
            }
            // add new child
            this.appendBlockForObject(rootKey, 'right');

            // save Instance as a metadata
            this.saveCurrentInstanceInBlock();
        }
    }

    /**
     * Show Page
     * @param {String} pageType object / argument / select
     */
    VariablePackage.prototype.showPage = function(pageType) {
        // TODO: init pages
        if (pageType == 'select') {
            // show select attribute/method page
            $(this.wrapSelector('.vp-instance-option-base')).hide();
            $(this.wrapSelector('.vp-instance-select-base')).show();
        } else {
            // show option page
            $(this.wrapSelector('.vp-instance-select-base')).hide();
            $(this.wrapSelector('.vp-instance-option-base')).show();

            if (pageType == 'object') {
                // show pandas object box
                $(this.wrapSelector('.vp-instance-option-box.object')).show();
                $(this.wrapSelector('.vp-instance-option-box.argument')).hide();
            } else if (pageType == 'argument') {
                // show argument input box
                $(this.wrapSelector('.vp-instance-option-box.object')).hide();
                $(this.wrapSelector('.vp-instance-option-box.argument')).show();
            }
        }
    }

    ///////// Handler //////////////////////////////
    VariablePackage.prototype.handleInstanceSelection = function(callback = undefined) {
        var that = this;

        this.initTags();
        
        var newVariable = this.pointer.board.getCode();
        
        var code = new sb.StringBuilder();
        code.appendLine('import json');
        code.appendFormatLine('_vp_vars = dir({0})', newVariable);
        code.append('print(json.dumps(');
        if (newVariable == '') {
            code.append("{ 'type': 'None', 'list': [");
            code.append("{ 'name': v, 'type': type(eval(v)).__name__ } ");
        } else {
            code.appendFormat("{ 'type': type({0}).__name__, 'list': [", newVariable);
            code.appendFormat("{ 'name': v, 'type': type(eval({0} + '.' + v)).__name__ } ", convertToStr(newVariable));
        }
        code.appendFormat(" for v in _vp_vars if (not v.startswith('_')) and (v not in {0})"
                        , JSON.stringify(pdGen._VP_NOT_USING_VAR));
        code.appendLine(']}))');
        var codes = code.toString(); // TEST:
        this.kernelExecute(codes, function(result) {
            try {
                var varObj = JSON.parse(result);

                var varType = varObj.type;
                var varList = varObj.list;

                var LastBlockKey = that.pointer.board.getLastBlockKey();
                if (LastBlockKey != that.pointer.instance.getKey()) {
                    // that.loadCurrentInstance();
                } else {
                    that.pointer.instance.setType(varType);
                    that.pointer.instance.setDirList(varList);

                    that.saveCurrentInstanceInBlock();
                }

                // set variable type
                $(that.wrapSelector('#vp_instanceType')).text(varType);

                // set dir list
                var attrListTag = new sb.StringBuilder();
                var methodListTag = new sb.StringBuilder();
                var attrList = [];
                var methodList = [];
                varList != undefined && varList.forEach(obj => {
                    if (obj.type.includes('Indexer')) {
                        methodListTag.appendFormatLine('<li class="vp-select-item" data-var-name="{0}" data-var-type="{1}"><span>{2}</span>{3}</li>'
                                                    , obj.name + '[]', obj.type, obj.type, obj.name);
                        methodList.push({
                            label: obj.name + '[]' + ' (' + obj.type + ')',
                            value: obj.name + '[]',
                            type: obj.type 
                        });
                    }
                    // Method/Function... 이면 Method 항목에 표시
                    else if (_METHOD_TYPES.includes(obj.type)) {
                        methodListTag.appendFormatLine('<li class="vp-select-item" data-var-name="{0}" data-var-type="{1}"><span>{2}</span>{3}</li>'
                                                    , obj.name + '()', obj.type, obj.type, obj.name);
                        methodList.push({
                            label: obj.name + '()' + ' (' + obj.type + ')',
                            value: obj.name + '()' ,
                            type: obj.type
                        });
                    } else {
                        // FIXME: type이 module일 경우엔 pd(pandas) module만 표시
                        // if (obj.type == 'module' && obj.name != 'pd') {
                        //     ;
                        // } else {
                        attrListTag.appendFormatLine('<li class="vp-select-item" data-var-name="{0}" data-var-type="{1}"><span>{2}</span>{3}</li>'
                                                    , obj.name, obj.type, obj.type, obj.name);
                        attrList.push({
                            label: obj.name + ' (' + obj.type + ')',
                            value: obj.name,
                            type: obj.type
                        });
                        // }
                    }
                });
                $(that.wrapSelector('#vp_insAttr ul')).html(attrListTag.toString());
                $(that.wrapSelector('#vp_insMethod ul')).html(methodListTag.toString());

                // attribute search suggest
                var suggestInput = new vpSuggestInputText.vpSuggestInputText();
                suggestInput.setComponentID('vp_insAttrSearch');
                suggestInput.addClass('vp-input vp-instance-search attr');
                suggestInput.setPlaceholder("search attribute");
                suggestInput.setSuggestList(function() { return attrList; });
                suggestInput.setSelectEvent(function(value, item) {
                    $(this.wrapSelector()).val(value);
                    $(that.wrapSelector('#vp_insAttrType')).val(item.type);

                    that.handleAttrMethodSelection(item.value, item.type, 'var');
                });
                $(that.wrapSelector('#vp_insAttrSearch')).replaceWith(function() {
                    return suggestInput.toTagString();
                });

                // method search suggest
                suggestInput = new vpSuggestInputText.vpSuggestInputText();
                suggestInput.setComponentID('vp_insMethodSearch');
                suggestInput.addClass('vp-input vp-instance-search method');
                suggestInput.setPlaceholder("search method");
                suggestInput.setSuggestList(function() { return methodList; });
                suggestInput.setSelectEvent(function(value, item) {
                    $(this.wrapSelector()).val(value);
                    $(that.wrapSelector('#vp_insMethodType')).val(item.type);

                    that.handleAttrMethodSelection(item.value, item.type, 'api');
                });
                $(that.wrapSelector('#vp_insMethodSearch')).replaceWith(function() {
                    return suggestInput.toTagString();
                });


                // show page
                if (varType == 'DataFrame') {
                    // get Column Details
                    that.pointer.instance.getDetail(function (thisInstance) {
                        var colList = thisInstance.colList;
                        
                        $(that.wrapSelector('.vp-col-list')).replaceWith(function() {
                            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
                            suggestInput.addClass('vp-input m vp-col-list');
                            suggestInput.setPlaceholder("Column Name");
                            suggestInput.setSuggestList(function() { return colList; });
                            suggestInput.setNormalFilter(false);
                            suggestInput.setSelectEvent(function(value) {
                                $(this.wrapSelector()).val(value);
                                that.handleColumnSelection(value, $(this.wrapSelector()));
                            });
                            var tag = $(suggestInput.toTagString());
                            $(tag).val($(this).val());
                            return tag;
                        });

                        // set operator autocomplete
                        $(that.wrapSelector('.vp-oper-list')).replaceWith(function() {
                            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
                            suggestInput.addClass('vp-input s vp-oper-list');
                            suggestInput.setPlaceholder("Oper");
                            suggestInput.setSuggestList(function() { return ['==', '!=', 'and', 'or', 'in', 'not in', '<', '<=', '>', '>=']; });
                            suggestInput.setSelectEvent(function(value) {
                                $(this.wrapSelector()).val(value);
                                that.loadBoard();
                            });
                            suggestInput.setNormalFilter(false);
                            var tag = $(suggestInput.toTagString());
                            $(tag).val($(this).val());
                            return tag;
                        });

                        // init condition value input tag
                        
                        $(that.wrapSelector('.vp-condition')).replaceWith(function() {
                            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
                            suggestInput.addClass('vp-input m vp-condition');
                            suggestInput.setPlaceholder("");
                            suggestInput.setSuggestList(function() { return []; });
                            suggestInput.setSelectEvent(function(value) {
                                $(this.wrapSelector()).val(value);
                                that.loadBoard();
                            });
                            suggestInput.setNormalFilter(false);
                            var tag = $(suggestInput.toTagString());
                            $(tag).val($(this).val());
                            return tag;
                        });

                        that.showPage('object');

                        // run callback
                        if (callback != undefined) {
                            callback(varObj);
                        }
                    });
                } else {
                    if (_METHOD_TYPES.includes(varType) || varType.includes('Indexer')) {
                        that.showPage('argument');
                    } else {
                        that.showPage('select');
                    }

                    // run callback
                    if (callback != undefined) {
                        callback(varObj);
                    }
                }

            } catch (err) {
                that.loadCurrentInstance();
            }
        });

    }

    /**
     * 
     * @param {String} varName 
     * @param {String} varType 
     * @param {String} blockType var / api
     */
    VariablePackage.prototype.handleAttrMethodSelection = function(varName, varType, blockType) {
        if (varName == undefined || varName == '') {// reset search tag
            $(this.wrapSelector('.vp-instance-search')).val('');
            $(this.wrapSelector('.vp-instance-type')).val('');
            return;
        }

        this.pointer.varName = varName;
        this.pointer.varType = varType;

        if (this.pointer.board.getBoardSize() > 0) {
            varName = '.' + varName.replace('()', '({left}){right}').replace('[]', '[{left}]{right}');
        }
        
        var lastBlockKey = this.pointer.board.addBlock({
            code: varName,
            type: blockType
        });
        
        // create new instance and allocate it as the latest instance
        var newInstance = new Instance(this.pointer.board.getCode(), varType);
        newInstance.setLastName(varName);
        newInstance.setLastType(varType);
        newInstance.setKey(lastBlockKey);
        this.pointer.instance = newInstance;
        this.saveCurrentInstanceInBlock();

        // init
        this.initTags();

        // refresh with dir
        this.handleInstanceSelection();
    }

    VariablePackage.prototype.handleColumnSelection = function(colName, columnTag) {
        var that = this;

        var conditionTag = $(columnTag).closest('td').find('.vp-condition');

        var colObj = this.pointer.instance.getColList().find(x => x.value == colName);
        if (colObj != undefined) {
            if (colObj.category != undefined && colObj.category.length > 0) {
                // conditions using suggestInput
                var suggestInput = new vpSuggestInputText.vpSuggestInputText();
                suggestInput.addClass('vp-input m vp-condition');
                suggestInput.setPlaceholder("categorical dtype");
                suggestInput.setSuggestList(function() { return colObj.category; });
                suggestInput.setSelectEvent(function(value) {
                    $(this.wrapSelector()).val(value);
                    that.loadBoard();
                });
                suggestInput.setNormalFilter(false);
                $(conditionTag).replaceWith(function() {
                    var tag = $(suggestInput.toTagString());
                    $(tag).val($(this).val());
                    return tag;
                });
            } else {
                var suggestInput = new vpSuggestInputText.vpSuggestInputText();
                suggestInput.addClass('vp-input m vp-condition');
                suggestInput.setPlaceholder(colObj.dtype + " dtype");
                suggestInput.setSuggestList(function() { return []; });
                suggestInput.setSelectEvent(function(value) {
                    $(this.wrapSelector()).val(value);
                    that.loadBoard();
                });
                suggestInput.setNormalFilter(false);
                $(conditionTag).replaceWith(function() {
                    var tag = $(suggestInput.toTagString());
                    $(tag).val($(this).val());
                    return tag;
                });
            }
        }

        this.loadBoard();
    }

    VariablePackage.prototype.handleColumnAdd = function() {
        var that = this;
        var clone = $(this.wrapSelector('#vp_colList tr:first')).clone();

        clone.find('input').val('');
        clone.find('.vp-condition').attr({'placeholder': ''});

        // set column suggest input
        clone.find('.vp-col-list').replaceWith(function() {
            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
            suggestInput.addClass('vp-input m vp-col-list');
            suggestInput.setPlaceholder("Column Name");
            suggestInput.setSuggestList(function() { return that.pointer.instance.getColList(); });
            suggestInput.setNormalFilter(false);
            suggestInput.setSelectEvent(function(value) {
                $(this.wrapSelector()).val(value);
                that.handleColumnSelection(value, $(this.wrapSelector()));
            });
            return suggestInput.toTagString();
        });

        // set operater suggest input
        clone.find('.vp-oper-list').replaceWith(function() {
            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
            suggestInput.addClass('vp-input s vp-oper-list');
            suggestInput.setPlaceholder("Oper");
            suggestInput.setSuggestList(function() { return ['==', '!=', 'and', 'or', 'in', 'not in', '<', '<=', '>', '>=']; });
            suggestInput.setSelectEvent(function(value) {
                $(this.wrapSelector()).val(value);
                that.loadBoard();
            });
            suggestInput.setNormalFilter(false);
            return suggestInput.toTagString();
        });

        // hide last connect operator
        clone.find('.vp-oper-connect').hide();
        // show connect operator right before last one
        $(this.wrapSelector('#vp_colList .vp-oper-connect:last')).show();
        clone.insertBefore(this.wrapSelector('#vp_colList tr:last'));
    }

    ///////// Handler End ///////////////////////////

    VariablePackage.prototype.initTags = function() {
        // initialize start
        $(this.wrapSelector('#vp_insAttr ul')).html('');
        $(this.wrapSelector('#vp_insMethod ul')).html('');

        $(this.wrapSelector('#vp_insAttrSearch')).autocomplete({
            source: [] 
        });
        $(this.wrapSelector('#vp_insAttrSearch')).val('');
        $(this.wrapSelector('#vp_insAttrType')).val('');
        $(this.wrapSelector('#vp_insMethodSearch')).autocomplete({
            source: []
        });
        $(this.wrapSelector('#vp_insMethodSearch')).val('');
        $(this.wrapSelector('#vp_insMethodType')).val('');

        $(this.wrapSelector('#vp_insArguments')).val('');

        $(this.wrapSelector('#vp_colList tr td:not(:first):not(:last)')).remove();
        $(this.wrapSelector('#vp_colList tr td input')).val('');

        $(this.wrapSelector('#vp_useIndexer')).val('');
        // initialize end
    }

    VariablePackage.prototype.saveCurrentInstanceInBlock = function() {
        // save Instance as a metadata
        if (this.pointer.instance != undefined && this.pointer.instance != Instance.empty) {
            this.pointer.instance.setLastName(this.pointer.varName);
            this.pointer.instance.setLastType(this.pointer.varType);

            var instanceMeta = this.pointer.instance.dumps();
            var lastInstanceKey = this.pointer.board.getLastBlockKey();
            if (lastInstanceKey != undefined && lastInstanceKey >= 0) {
                this.pointer.board.setBlockMetadata(lastInstanceKey, instanceMeta);
            }
        }
    }

    VariablePackage.prototype.loadCurrentInstance = function() {
        var lastKey = this.pointer.board.getLastBlockKey();
        var boardController = this.pointer.board.getBoard();
        var boardSize = this.pointer.board.getBoardSize();
        if (lastKey >= 0 && boardController != undefined && boardSize > 0) {
            var insMeta = boardController[lastKey].metadata;
            var prevInstance = Instance.parse(insMeta);
            var prevVarType = prevInstance.getLastType();
            if (prevVarType == undefined) {
                prevVarType = prevInstance.getType();
            }
            if (prevVarType == 'DataFrame') {
                        
                this.initTags();
                
                // load column options
                var colMeta = prevInstance.getColMeta();
                
                // add columns as colMeta length
                for(var i = 0; i < colMeta.length -1; i++) {
                    this.handleColumnAdd();
                }
                // load column data
                var colList = $(this.wrapSelector('#vp_colList tr td:not(:last)'));
                for (var i = 0; i < colMeta.length; i++) {
                    var colTag = $(colList[i]);
                    colTag.find('.vp-col-list').val(colMeta[i]['vp-col-list']);
                    colTag.find('.vp-oper-list').val(colMeta[i]['vp-oper-list']);
                    colTag.find('.vp-condition').val(colMeta[i]['vp-condition']);
                    colTag.find('.vp-oper-connect').val(colMeta[i]['vp-oper-connect']);
                }

                $(this.wrapSelector('#vp_useIndexer')).val(prevInstance.getIndexer());

                this.pointer.instance = prevInstance;
                
                this.showPage('object');
            } else if (_METHOD_TYPES.includes(prevVarType) || prevVarType.includes('Indexer')) {
                
                this.initTags();
                
                // load argument value
                var args = prevInstance.getArgs();

                $(this.wrapSelector('#vp_insArguments')).val(args);

                this.pointer.instance = prevInstance;

                this.showPage('argument');
            } else {
                this.showPage('select');
            }
        } else {
            this.showPage('select');
        }
    }

    /**
     * make block to add on API Board
     */
    VariablePackage.prototype.appendBlockForObject = function(rootKey, link = 'left') {
        // console.log('appendBlockForObject', rootKey, this.pointer);
        var varName = this.pointer.instance.getName();
        var varType = $(this.wrapSelector('#vp_instanceType')).text();

        // columns + condition block
        var colList = $(this.wrapSelector('#vp_colList tr td:not(:last)'));
        var colMeta = []; // metadata for column list

        // use Indexer
        var indexer = $(this.wrapSelector('#vp_useIndexer')).val();

        var blocks = [];
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

            // if operator not selected, column / else condition
            if (oper == '') {
                // column 
                // add blocks with last temp condition list
                if (condSelector.length > 0) {
                    // block result : [condition1, condition2]
                    // [] 추가
                    var condBase = '[{child}]';
                    if (indexer != undefined && indexer != '') {
                        condBase = indexer;
                    }
                    blocks.push({
                        code: condBase, type: 'brac', child: [
                            ...condSelector
                        ]
                    });

                    condSelector = [];
                }
                // column selector
                colSelector.push(colName);
            } else {
                // condition selector
                // add blocks with last temp column list
                if (colSelector.length > 0) {
                    // block result : [[code1, code2]] / [[col]]
                    blocks.push({
                        code: '[[{child}]]', type: 'brac', child: [
                            { code: colSelector.toString(), type: 'code' }
                        ]
                    });
                    
                    colSelector = [];
                }
                var hasPrev = condSelector.length > 0;
                var tmpCondSelector = [];
                if (cond != undefined && cond !== '') {
                    // var[colName] oper condition
                    // ex) df['col'] != 'cond'
                    tmpCondSelector.push({ code: oper, type: 'oper'
                    , left: [
                        { code: varName, type: 'var', left: [
                            { code: '[{child}]', type: 'brac', child: [
                                { code: colName, type: 'code' }
                            ] }
                        ] }
                    ]
                    , right: [
                        { code: cond, type: 'code' }
                    ] });
                } else {
                    // var[colName] oper
                    tmpCondSelector.push({ code: oper, type: 'oper', left: [
                        { code: varName, type: 'var', left: [
                            { code: '[{child}]', type: 'brac', child: [
                                { code: colName, type: 'code' }
                            ] }
                        ] }
                    ] });
                }
                if (connector != undefined && hasPrev) {
                    condSelector = [{
                        code: connector, type: 'oper'
                        , left: [
                            ...condSelector
                        ]
                        , right: [
                            ...tmpCondSelector
                        ]
                    }];
                } else {
                    condSelector = tmpCondSelector;
                }
            }
        }

        if (condSelector.length > 0) {
            var condBase = '[{child}]';
            if (indexer != undefined && indexer != '') {
                condBase = indexer;
            }
            blocks.push({
                code: condBase, type: 'brac', child: [
                    ...condSelector
                ]
            });

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
                    // block result : [[code1, code2]] / [[col]]
                    blocks.push({
                        code: '[[{child}]]', type: 'brac', child: [
                            { code: colSelector.toString(), type: 'code' }
                        ]
                    });
                } else if (returnType == 'Series') {
                    // with single bracket
                    // block result : [[code1, code2]] / [[col]]
                    blocks.push({
                        code: '[{child}]', type: 'brac', child: [
                            { code: colSelector.toString(), type: 'code' }
                        ]
                    });
                }
            }
        }

        // save colMeta on now instance
        this.pointer.instance.setColMeta(colMeta);
        this.pointer.instance.setIndexer(indexer);

        // set to board
        this.pointer.board.addBlocks(blocks, rootKey, link);
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
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    VariablePackage.prototype.generateCode = function(addCell, exec) {
        var sbCode = new sb.StringBuilder();

        // 변수 내용 조회
        // if equality enabled
        var hasEquality = $(this.wrapSelector('.vp-instance-base')).hasClass('equality');
        if (hasEquality) {
            var leftCode = this.state.left.board.getCode();
            var rightCode = this.state.right.board.getCode();
            sbCode.appendFormat('{0} = {1}', leftCode, rightCode);
        } else {
            var boardCode = this.pointer.board.getCode();
            sbCode.appendFormat('{0}', boardCode);
        }

        // save left/right board metadata
        try {
            $(this.wrapSelector('#vp_stateLeft')).val(encodeURIComponent(JSON.stringify(this.state.left.board.getBoard())));
            $(this.wrapSelector('#vp_stateRight')).val(encodeURIComponent(JSON.stringify(this.state.right.board.getBoard())));
        } catch {
            ;
        }

        if (addCell) this.cellExecute(sbCode.toString(), exec);

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});
