define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, vpSuggestInputText) {
    // 옵션 속성
    const funcOptProp = {
        funcName : "print()"
        , funcID : "pyBuilt_print"
    }

    /**
     * html load 콜백. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     * @param {JSON} meta 메타 데이터
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
            var osSample = new PythonCommon(uuid);
            osSample.metadata = meta;
            
            // 옵션 속성 할당.
            osSample.setOptionProp(funcOptProp);

            // html 설정.
            osSample.initHtml();

            // TODO: meta load 처리 방안 검토. 
            // 방안 1. callback 에서 처리
            // 방안 2. initHtml 내에서 meta 존재 시 init과 동시에 처리.
            // 방안 3. initHtml 후에 옵션 내에서 load 함수 호출.

            callback(osSample);  // 객체를 callback 인자로 전달
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     * @param {JSON} meta 메타 데이터
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "python_common/index.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var PythonCommon = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        this.state = {

        }
        this.package = {
            input: [
                { name: 'vp_pyReturn' },
                { name: 'vp_pyPrint' }
            ]
        }
    }

    /**
     * vpFuncJS 에서 상속
     */
    PythonCommon.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    PythonCommon.prototype.optionValidation = function() {
        return true;
    }

    /**
     * html 내부 binding 처리
     */
    PythonCommon.prototype.initHtml = function() {
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "python_common/index.css");

        var sbPageContent = new sb.StringBuilder();
        var sbTagString = new sb.StringBuilder();

        

        // 필수 옵션 테이블 레이아웃
        var tblLayoutRequire = this.createVERSimpleLayout("25%");

        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_pyPrint', 'vp-input l')
        tblLayoutRequire.addRow("Input Print Data", sbTagString.toString());
        
        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_pyReturn', 'vp-input l');
        tblLayoutRequire.addRow("Return to", sbTagString.toString());
        

        // 필수 옵션 영역 (아코디언 박스)
        var accBoxRequire = this.createOptionContainer(vpConst.API_REQUIRE_OPTION_BOX_CAPTION);
        accBoxRequire.setOpenBox(true);
        accBoxRequire.appendContent(tblLayoutRequire.toTagString());

        sbPageContent.appendLine(accBoxRequire.toTagString());

        // 추가 옵션 테이블 레이아웃
        // var tblLayoutAdditional = this.createVERSimpleLayout("30%");

        // // 추가 옵션 영역
        // var accBoxAdditional = this.createOptionContainer(vpConst.API_ADDITIONAL_OPTION_BOX_CAPTION);
        // accBoxAdditional.appendContent(tblLayoutAdditional.toTagString());

        // sbPageContent.appendLine(accBoxAdditional.toTagString());

                
        this.setPage(sbPageContent.toString());
        sbPageContent.clear();
    }

    /**
     * 코드 생성
     * @param {boolean} addCell 셀에 추가
     * @param {boolean} exec 실행여부
     * @returns 생성된 코드
     */
    PythonCommon.prototype.generateCode = function(addCell = false, exec = false) {
        var code = new sb.StringBuilder();
        
        var returnVar = $(this.wrapSelector('#vp_pyReturn')).val();
        if (returnVar != '') {
            code.appendFormat("{0} = ", returnVar);
        }
        code.appendFormatLine('print({0})', $(this.wrapSelector('#vp_pyPrint')).val());
        

        if (addCell) {
            this.cellExecute(code.toString(), exec);
        }

        return code.toString();
    }

    return {
        initOption: initOption
    };
});
