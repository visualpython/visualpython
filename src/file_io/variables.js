define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/pandas/common/commonPandas'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, libPandas, pdGen) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "Variables"
        , funcID : "com_variables"
        , libID : "pd000"
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
            var varPackage = new VariablePackage(uuid);
            varPackage.metadata = meta;

            // 옵션 속성 할당.
            varPackage.setOptionProp(funcOptProp);
            // html 설정.
            varPackage.initHtml();
            callback(varPackage);  // 공통 객체를 callback 인자로 전달
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "file_io/variables.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var VariablePackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        // pandas 함수
        this.package = libPandas._PANDAS_FUNCTION[funcOptProp.libID];
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


    /**
     * html 내부 binding 처리
     */
    VariablePackage.prototype.initHtml = function() {
        this.showFunctionTitle();

        this.loadVariables();

        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/commonPandas.css");
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "file_io/variables.css");

        this.bindEvent();
    }

    /**
     * 선택한 패키지명 입력
     */
    VariablePackage.prototype.showFunctionTitle = function() {
        $(this.wrapSelector('.vp_functionName')).text(funcOptProp.funcName);
    }

    VariablePackage.prototype.bindEvent = function() {
        var that = this;

        // load variables on refresh
        $(this.wrapSelector('#vp_varRefresh')).click(function(event) {
            event.stopPropagation();
            that.loadVariables();
        });
    }

    /**
     * Variables 조회
     */
    VariablePackage.prototype.loadVariables = function() {
        var that = this;

        // 조회가능한 변수 data type 정의 FIXME: 조회 필요한 변수 유형 추가
        var types = [
            // pandas 객체
            'DataFrame', 'Series', 'Index', 'Period', 'GroupBy', 'Timestamp'
            // Index 하위 유형
            , 'RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'
            // GroupBy 하위 유형
            , 'DataFrameGroupBy', 'SeriesGroupBy'
            // Plot 관련 유형
            , 'Figure', 'AxesSubplot'
            // Numpy
            , 'ndarray'
            // Python 변수
            , 'str', 'int', 'float', 'bool', 'dict', 'list', 'tuple'
        ];

        var tagTable = this.wrapSelector('#vp_var_variableBox table');

        // 변수 정보 표시
        var tagDetailTable = this.wrapSelector("#vp_varDetailTable");
        
        // initialize tags
        $(tagTable).find('tr:not(:first)').remove();
        $(tagDetailTable).html('');
        
        // HTML 구성
        pdGen.vp_searchVarList(types, function(result) {
            // var jsonVars = result.replace(/'/gi, `"`);
            // var varList = JSON.parse(jsonVars);
            var varList = JSON.parse(result);

            // table 에 변수목록 추가
            varList.forEach(varObj => {
                if (types.includes(varObj.varType) && varObj.varName[0] !== '_') {
                    var tagTr = document.createElement('tr');
                    var tagTdName = document.createElement('td');
                    var tagTdType = document.createElement('td');
                    $(tagTr).attr({
                        'data-var-name': varObj.varName,
                        'data-var-type': varObj.varType
                    });
                    tagTdName.innerText = varObj.varName;
                    tagTdType.innerText = varObj.varType;

                    $(tagTr).append(tagTdName);
                    $(tagTr).append(tagTdType);

                    $(tagTdName).attr({
                        'title': 'Click to copy'
                    });
                    // 변수이름 클릭 시 클립보드에 복사
                    $(tagTdName).click(function() {
                        // // 클립보드 복사 시작
                        var tempElem = document.createElement('input');
                        tempElem.value = varObj.varName;  
                        document.body.appendChild(tempElem);
                      
                        tempElem.select();
                        document.execCommand("copy");
                        document.body.removeChild(tempElem);
                        // 클립보드 복사 완료
                        vpCommon.renderSuccessMessage('Copied!');
                    });

                    // 변수 선택 시 표시
                    $(tagTr).click(function() {
                        $(this).parent().find('tr').removeClass('selected');
                        $(this).addClass('selected');

                        // TEST: 변수 선택 시 변수 정보를 하단에 표시
                        // vpFuncJS.kernelExecute 에서는 callback에 msg.content["text"]를 전달해주기 때문에 따로 구현함
                        Jupyter.notebook.kernel.execute(
                            varObj.varName,
                            {
                                iopub: {
                                    output: function (msg) {
                                        var textResult = msg.content.data["text/plain"];
                                        var htmlResult = msg.content.data["text/html"];
                                        var imgResult = msg.content.data["image/png"];
                                        
                                        $(tagDetailTable).html('');
                                        if (htmlResult != undefined) {
                                            // 1. HTML 태그로 구성되어 반환되는 경우
                                            $(tagDetailTable).append(htmlResult);
                                        } else if (imgResult != undefined) {
                                            // 2. 이미지 데이터가 반환되는 경우 (base64)
                                            var imgTag = '<img src="data:image/png;base64, ' + imgResult + '">';
                                            $(tagDetailTable).append(imgTag);
                                        } else if (textResult != undefined) {
                                            // 3. 텍스트 데이터가 반환되는 경우
                                            var preTag = document.createElement('pre');
                                            $(preTag).text(textResult);
                                            $(tagDetailTable).html(preTag);
                                        } else {
                                            $(tagDetailTable).append('(Select variables to preview the data.)');
                                        }
                                    }
                                }
                            },
                            { silent: false }
                        );
                        // TEST: END
                    })

                    $(tagTable).append(tagTr);
                }
            });
        });
    };

    /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    VariablePackage.prototype.generateCode = function(addCell, exec) {
        
        var sbCode = new sb.StringBuilder();

        // TODO: 변수 내용 조회
        var selectedVariable = $(this.wrapSelector('#vp_var_variableBox table tr.selected'));
        if (selectedVariable) {
            var varName = selectedVariable.attr('data-var-name');
            if (varName) {
                sbCode.appendFormat('{0}', varName);
            }
        }

        if (addCell) this.cellExecute(sbCode.toString(), exec);

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});