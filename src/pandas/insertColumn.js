var requirePath = 'require';
define([
    requirePath
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/pandas/common/commonPandas'
    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, libPandas, vpSuggestInputText, pdGen) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "insert col"
        , funcID : "pdEdtRC_insertColumn"
        , libID : "pd057"
    }

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
                { name: 'vp_target' },
                { name: 'vp_colName' },
                { name: 'vp_addType' },
                { name: 'vp_colType' },
                { name: 'vp_colValue' },
                { name: 'vp_calcSrcObj1' },
                { name: 'vp_calcSrcCol1' },
                { name: 'vp_calcOper' },
                { name: 'vp_calcSrcObj2' },
                { name: 'vp_calcSrcCol2' }
            ]
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
        this.showFunctionTitle();
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/commonPandas.css");

        this.bindOptions();
    }

    /**
     * 선택한 패키지명 입력
     */
    PandasPackage.prototype.showFunctionTitle = function() {
        $(this.wrapSelector('.vp_functionName')).text(this.package.name);
    }

    /**
     * Pandas 기본 패키지 바인딩
     */
    PandasPackage.prototype.bindOptions = function() {
        // HTML 구성
        // pdGen.vp_showInterface(this);
        // // if it has no additional options, remove that box
        // if (this.package.variable == undefined || this.package.variable.length <= 0) {
        //     $(this.wrapSelector('#vp_optionBox')).closest('div.vp-accordion-container').remove();
        // }

        var that = this;

        var sbPageContent = new sb.StringBuilder();
        var sbTagString = new sb.StringBuilder();

        // 필수 옵션 테이블 레이아웃
        var tblLayoutRequire = this.createVERSimpleLayout("25%");

        // DataFrame object
        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_target', 'vp-input');  // suggest input
        tblLayoutRequire.addRow("Target Variable", sbTagString.toString());

        // New Column Name
        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_colName', 'vp-input');
        tblLayoutRequire.addRow("Column Name", sbTagString.toString());

        // 컬럼 생성 유형
        sbTagString.clear();
        sbTagString.appendFormatLine('<select id="{0}" class="{1}">', 'vp_addType', 'vp-select');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'value', 'value');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'calculation', 'calculation');
        sbTagString.appendLine('</select>');
        tblLayoutRequire.addRow("Add Type", sbTagString.toString());

        // 구분선
        tblLayoutRequire.addRow("", "<hr style='margin:0px;'/>");

        // Type 1. value
        sbTagString.clear();
        sbTagString.appendFormatLine('<select id="{0}" class="{1}">', 'vp_colType', 'vp-select vp-add-value');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'num', 'number');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'str', 'string');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'nan', 'NaN');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'random', 'Random');
        sbTagString.appendLine('</select>');
        tblLayoutRequire.addRow("Column Type", sbTagString.toString());

        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_colValue', 'vp-input vp-add-value');
        tblLayoutRequire.addRow("Value", sbTagString.toString());

        // Type 2. calculation
        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_calcSrcObj1', 'vp-input vp-add-calc'); // suggest input
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_calcSrcCol1', 'vp-input vp-add-calc'); // suggest input
        tblLayoutRequire.addRow("Source Object1", sbTagString.toString());

        sbTagString.clear();
        var suggestInput = new vpSuggestInputText.vpSuggestInputText();
        suggestInput.setComponentID('vp_calcOper');
        suggestInput.addClass('vp-input vp-add-calc');
        suggestInput.setSuggestList(function() { return ['+', '-', '*', '/', '%', '//', '==', '!=', '>=', '>', '<=', '<', 'and', 'or']; });
        suggestInput.setNormalFilter(false);
        //suggestInput.setValue(/* metatdata */);
        tblLayoutRequire.addRow("Operator", suggestInput.toTagString());

        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_calcSrcObj2', 'vp-input vp-add-calc'); // suggest input
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_calcSrcCol2', 'vp-input vp-add-calc'); // suggest input
        tblLayoutRequire.addRow("Source Object2", sbTagString.toString());

        // 필수 옵션 영역 (아코디언 박스)
        var accBoxRequire = this.createOptionContainer(vpConst.API_REQUIRE_OPTION_BOX_CAPTION);
        accBoxRequire.setOpenBox(true);
        accBoxRequire.appendContent(tblLayoutRequire.toTagString());

        sbPageContent.appendLine(accBoxRequire.toTagString());

        
        this.setPage(sbPageContent.toString());
        sbPageContent.clear();

        // async bind suggest input - dataframe
        pdGen.vp_searchVarList(['DataFrame'], function(result) {
            var varList = JSON.parse(result);
            varList = varList.map(function(v) {
                return { label: v.varName + ' (' + v.varType + ')', value: v.varName };
            });
            // 1. Target Variable
            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
            suggestInput.setComponentID('vp_target');
            suggestInput.addClass('vp-input');
            suggestInput.setSuggestList(function() { return varList; });
            suggestInput.setNormalFilter(false);
            suggestInput.setValue($(that.wrapSelector('#vp_target')).val());
            $(that.wrapSelector('#vp_target')).replaceWith(function() {
                return suggestInput.toTagString();
            });

            // 2. Source Object 1
            var suggestInput1 = new vpSuggestInputText.vpSuggestInputText();
            suggestInput1.setComponentID('vp_calcSrcObj1');
            suggestInput1.addClass('vp-input vp-add-calc');
            suggestInput1.setSuggestList(function() { return varList; });
            suggestInput1.setNormalFilter(false);
            suggestInput1.setValue($(that.wrapSelector('#vp_calcSrcObj1')).val());
            suggestInput1.setSelectEvent(function(selectedValue) {
                that.getColumnList(selectedValue, function(varResult) {
                    if (varResult.length > 0) {
                        // columns using suggestInput
                        var colSugInput = new vpSuggestInputText.vpSuggestInputText();
                        colSugInput.setComponentID('vp_calcSrcCol1');
                        colSugInput.addClass('vp-input vp-add-calc');
                        colSugInput.setPlaceholder("column name");
                        colSugInput.setSuggestList(function() { return varResult; });
                        colSugInput.setNormalFilter(false);
                        $(that.wrapSelector('#vp_calcSrcCol1')).replaceWith(function() {
                            return colSugInput.toTagString();
                        });
                    }
                });
            });
            $(that.wrapSelector('#vp_calcSrcObj1')).replaceWith(function() {
                return suggestInput1.toTagString();
            });

            // 3. Source Object 2
            var suggestInput2 = new vpSuggestInputText.vpSuggestInputText();
            suggestInput2.setComponentID('vp_calcSrcObj2');
            suggestInput2.addClass('vp-input vp-add-calc');
            suggestInput2.setSuggestList(function() { return varList; });
            suggestInput2.setNormalFilter(false);
            suggestInput2.setValue($(that.wrapSelector('#vp_calcSrcObj2')).val());
            suggestInput2.setSelectEvent(function(selectedValue) {
                that.getColumnList(selectedValue, function(varResult) {
                    if (varResult.length > 0) {
                        // columns using suggestInput
                        var colSugInput = new vpSuggestInputText.vpSuggestInputText();
                        colSugInput.setComponentID('vp_calcSrcCol2');
                        colSugInput.addClass('vp-input vp-add-calc');
                        colSugInput.setPlaceholder("column name");
                        colSugInput.setSuggestList(function() { return varResult; });
                        colSugInput.setNormalFilter(false);
                        $(that.wrapSelector('#vp_calcSrcCol2')).replaceWith(function() {
                            return colSugInput.toTagString();
                        });
                    }
                });
            });
            $(that.wrapSelector('#vp_calcSrcObj2')).replaceWith(function() {
                return suggestInput2.toTagString();
            });


        });

        // init show page
        var pageMeta = $(this.wrapSelector('#vp_addType')).val();
        // load metadata
        if (this.metadata != undefined) {
            pageMeta = this.metadata.options.filter(x => x.id == 'vp_addType')[0].value;
        }
        this.showPage(pageMeta);

        // E1. show page 
        $(this.wrapSelector('#vp_addType')).change(function() {
            that.showPage($(this).val());
        });

        // E2. column type selection
        $(this.wrapSelector('#vp_colType')).change(function() {
            var value = $(this).val();
            switch (value) {
                case 'str':
                    $(that.wrapSelector('#vp_colValue')).val('');
                    break;
                case 'num':
                    $(that.wrapSelector('#vp_colValue')).val('');
                    break;
                case 'nan':
                    $(that.wrapSelector('#vp_colValue')).val('np.nan');
                    break;
                case 'random':
                    var df = $(that.wrapSelector('#vp_target')).val();
                    var code = "[np.random.randint(-10, 10) for r in range(len(" + df + "))]"
                    $(that.wrapSelector('#vp_colValue')).val(code);
                    break;
            }
        });


    };

    /**
     * Show Selected Type Page
     * @param {string} type value / calculation
     */
    PandasPackage.prototype.showPage = function(type) {
        if (type == 'value') {
            // show type1: value
            $(this.wrapSelector('.vp-add-value')).closest('tr').show();
            // hide type2: calculation
            $(this.wrapSelector('.vp-add-calc')).closest('tr').hide();
        } else {
            // hide type1: value
            $(this.wrapSelector('.vp-add-value')).closest('tr').hide();
            // show type2: calculation
            $(this.wrapSelector('.vp-add-calc')).closest('tr').show();
        }
    }

    PandasPackage.prototype.getColumnList = function(varName, callback) {
        var code = new sb.StringBuilder();
        code.appendLine('import json');
        code.appendFormat(`print(json.dumps([ { "value": ("'" + c + "'") if type(c).__name__ == 'str' else c, "label": c, "dtype": str({0}[c].dtype), "array": str({1}[c].array) } for c in list({2}.columns) ]))`
                        , varName, varName, varName);
        // get result and show on detail box
        this.kernelExecute(code.toString(), function(result) {
            var varResult = JSON.parse(result);
            callback(varResult);
        });
    }

    /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    PandasPackage.prototype.generateCode = function(addCell, exec) {

        var sbCode = new sb.StringBuilder();

        // 코드 생성
        var targetObj = $(this.wrapSelector('#vp_target')).val();
        var targetColName = $(this.wrapSelector('#vp_colName')).val();
        sbCode.appendFormat("{0}['{1}'] = ", targetObj, targetColName);

        var type = $(this.wrapSelector('#vp_addType')).val();
        if (type == 'value') {
            // Type 1: value 입력일 때
            var colType = $(this.wrapSelector('#vp_colType')).val();
            var colValue = $(this.wrapSelector('#vp_colValue')).val();
            switch (colType) {
                case 'str':
                    sbCode.appendFormat("'{0}'", colValue);
                    break;
                case 'num':
                case 'nan':
                case 'random':
                    sbCode.appendFormat("{0}", colValue);
                    break;
            }
        } else {
            // Type 2: calculation 입력일 때
            var obj1 = $(this.wrapSelector('#vp_calcSrcObj1')).val();
            var col1 = $(this.wrapSelector('#vp_calcSrcCol1')).val();
            var oper = $(this.wrapSelector('#vp_calcOper')).val();
            var obj2 = $(this.wrapSelector('#vp_calcSrcObj2')).val();
            var col2 = $(this.wrapSelector('#vp_calcSrcCol2')).val();

            sbCode.appendFormat("{0}[{1}] {2} {3}[{4}]", obj1, col1, oper, obj2, col2);
        }

        if (addCell) this.cellExecute(sbCode.toString(), exec);

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});