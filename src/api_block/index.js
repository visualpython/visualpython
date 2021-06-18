define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'

    , './api.js'

    , './constData.js'
    , './init.js'

], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS,
            api,  constData, init) {

    const { API_BLOCK_HTML_URL_PATH
            , API_BLOCK_INDEX_CSS } = constData;

    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "api_block"
        , funcID : "api_block"  // TODO: ID 규칙 생성 필요
    }

    /**
     * html load 콜백. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var optionLoadCallback = function(callback, meta) {

        // document.getElementsByTagName("head")[0].appendChild(link);
        // 컨테이너에서 전달된 callback 함수가 존재하면 실행.
        if (typeof(callback) == 'function') {
            var uuid = 'u' + vpCommon.getUUID();
            // 최대 10회 중복되지 않도록 체크
            for (var idx = 0; idx < 10; idx++) {
                // 이미 사용중인 uuid 인 경우 다시 생성
                if ($(vpConst.VP_CONTAINER_ID).find("." + uuid).length > 0) {
                    uuid = 'u' + vpCommon.getUUID();
                }
            }
            $(vpCommon.wrapSelector(`#${vpConst.OPTION_GREEN_ROOM}`)).find(`.${vpConst.API_OPTION_PAGE}`).addClass(uuid);
            // 옵션 객체 생성
            var ipImport = new ImportPackage(uuid);
            ipImport.metadata = meta;
            // 옵션 속성 할당.
            ipImport.setOptionProp(funcOptProp);
            // html 설정.
            ipImport.initHtml();
            callback(ipImport);  // 공통 객체를 callback 인자로 전달
        }
    }
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
    */
    var initOption = function(callback, meta) {
        var htmlUrlPath  = API_BLOCK_HTML_URL_PATH;
        vpCommon.loadHtml(vpCommon.wrapSelector(`#${vpConst.OPTION_GREEN_ROOM}`), htmlUrlPath, optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var ImportPackage = function(uuid) {
        this.uuid = uuid; // Load html 영역의 uuid.
        this.blockContainer = null;
        this.funcID = funcOptProp.funcID;
        this.metadata = null;
    }
    /**
     * vpFuncJS 에서 상속
    */
    ImportPackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
    */
    ImportPackage.prototype.optionValidation = function() {
        return true;
    }

    /**
     * html 내부 binding 처리
     */
    ImportPackage.prototype.initHtml = function() {
        var that = this;
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + API_BLOCK_INDEX_CSS);
        this.blockContainer = init(this);
        this.blockContainer.setAPIBlockMetadataHandler();

        if (this.metadata) {
            // metadata 있음;
            this.blockContainer.loadAPIBlockMetadata(this.metadata);
        } else {
            // metadata 없음 -> 새로 만듬;
            this.blockContainer.setAPIBlockMetadata();
        }
  
        /** API Block 화면 좌우로 resize 할 경우 option page width 계산 */
        $( window ).resize( function() {
            if (that.blockContainer.getIsOptionPageResize() == false) {
                that.blockContainer.resizeAPIblock();
            }
        });
    }

    /**
     * 메타데이터 로드
     * @param {funcJS} option
     * @param {JSON} meta 
     */
    ImportPackage.prototype.loadMeta = function(funcJS, meta) {
        this.metadata = meta;
        this.blockContainer.loadAPIBlockMetadata(this.metadata);
    }
    
    /**
     *  페이지에 생성된 uuid를 가져온다
     */
    ImportPackage.prototype.getUUID = function() {
        return this.uuid;
    }

    ImportPackage.prototype.getBlockContainer = function() {
        return this.blockContainer;
    }

    /**
     * 코드 생성
     * @param {boolean} addCell 
     * @param {boolean} exec 실행여부
     * @param {boolean} isClicked true면 node 단위의 코드 실행, false면 전체 단위의 코드 실행
     */
    ImportPackage.prototype.generateCode = function( addCell, exec, isClicked ) {
    
        // validate code 
        if (!this.optionValidation()) return;

        // make code
        var result = '';
        if (isClicked) {
            result = this.blockContainer.getAPIBlockCode();
        } else {
            result = this.blockContainer.makeAllCode();
        }
    
        if (this.blockContainer.getBlockList().length == 0 
            || !result) {
            result = '';
        }

        /** add code */
        if ( !addCell ) {
            // code add시 메타데이터 생성
            this.blockContainer.saveAPIBlockMetadata();
            return result;
        }
        // execute code
        this.cellExecute(result, exec);
    }

    return {
        initOption: initOption
    };
});
