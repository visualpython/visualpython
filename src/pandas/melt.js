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
        , funcName : "Melt"
        , funcID : "pdFunc_melt"
        , libID : "pd084"
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
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "pandas/common/commonPandas.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var PandasPackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        // pandas 함수
        this.package = libPandas._PANDAS_FUNCTION[funcOptProp.libID];
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

        this.bindOptions();

        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/commonPandas.css");
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
        pdGen.vp_showInterface(this);
        // if it has no additional options, remove that box
        if (this.package.variable == undefined || this.package.variable.length <= 0) {
            $(this.wrapSelector('#vp_optionBox')).closest('div.vp-accordion-container').remove();
        }
    };

    /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    PandasPackage.prototype.generateCode = function(addCell, exec) {
        
        var sbCode = new sb.StringBuilder();
        

        // 코드 생성
        var result = pdGen.vp_codeGenerator(this.uuid, this.package);
        if (result == null) return "BREAK_RUN"; // 코드 생성 중 오류 발생
        sbCode.append(result);

        // cell metadata 작성하기
        // pdGen.vp_setCellMetadata(_VP_CODEMD);
        

        if (addCell) this.cellExecute(sbCode.toString(), exec);

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});