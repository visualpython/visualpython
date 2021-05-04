define([
    'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/metaDataHandler'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/component/vpAccordionBox'
    , 'nbextensions/visualpython/src/common/component/vpLineNumberTextArea'
    , 'nbextensions/visualpython/src/common/component/vpTableLayoutVerticalSimple'
    , 'nbextensions/visualpython/src/common/component/vpTableLayoutHorizontalSimple'
    , 'nbextensions/visualpython/src/common/component/vpMultiButtonModal'
    , 'nbextensions/visualpython/src/common/component/vpMultiButtonModal_new'
], function($, vpCommon, vpConst, md, sb, vpAccordionBox, vpLineNumberTextArea, vpTableLayoutVerticalSimple, vpTableLayoutHorizontalSimple, vpMultiButtonModal
            , vpMultiButtonModal_new) {
    "use strict";

    /**
     * @class VpFuncJS
     * @constructor
     * @param {funcOptProp} props 기본 속성
     * @param {String} uuid 고유 id
     */
    var VpFuncJS = function(props, uuid) {
        this.setOptionProp(props);
        this.uuid = uuid;
        this.generatedCode = "";
    };

    /**
     @param {funcOptProp} props 기본 속성
     */
    VpFuncJS.prototype.setOptionProp = function(props) {
        this.funcName = props.funcName;
        this.funcID = props.funcID;
    }

    /**
     * Task Index 셋팅
     * @param {number} idx task sequential index
     */
    VpFuncJS.prototype.setTaskIndex = function(idx) {
        this.taskIdx = idx;
    }

    /**
     * Task Index 확인
     * @returns {number} task sequential index
     */
    VpFuncJS.prototype.getTaskIndex = function() {
        return this.taskIdx;
    }
    
    /**
     * 유효성 검사
     * @param {*} args 
     * @returns {boolean} 유효성 체크
     */
    VpFuncJS.prototype.optionValidation = function(args) {
        console.log("[vpFuncJS.optionValidation] Not developed yet. Need override on child.");
        return false;
    }
    
    /**
     * Python 코드 실행 후 반환 값 전달해 콜백함수 호출
     * @param {String} command 실행할 코드
     * @param {function} callback 실행 완료 후 호출될 callback
     * @param {boolean} isSilent 커널에 실행위한 신호 전달 여부 기본 false
     * @param {boolean} isStoreHistory 커널에 히스토리 채우도록 신호 기본 !isSilent
     * @param {boolean} isStopOnError 실행큐에 예외 발생시 중지 여부 기본 true
     */
    VpFuncJS.prototype.kernelExecute = function(command, callback, isSilent = false, isStoreHistory = !isSilent, isStopOnError = true) {
        Jupyter.notebook.kernel.execute(
            command,
            {
                iopub: {
                    output: function(msg) {
                        var result = String(msg.content["text"]);
                        if (!result || result == 'undefined') {
                            if (msg.content.data) {
                                result = String(msg.content.data["text/plain"]);
                            }
                        }
                        
                        callback(result);
                    }
                }
            },
            { silent: isSilent, store_history: isStoreHistory, stop_on_error: isStopOnError }
        );
    }

    /**
     * 셀에 소스 추가하고 실행.
     * @param {String} command 실행할 코드
     * @param {boolean} exec 실행여부
     * @param {String} type 셀 타입
     */
    VpFuncJS.prototype.cellExecute = function(command, exec, type = "code") {
        // TODO: Validate 거칠것
        this.generatedCode = command;

        var targetCell = Jupyter.notebook.insert_cell_below(type);
        
        // 코드타입인 경우 시그니쳐 추가.
        if (type == "code") {
            // command = vpCommon.formatString("{0}\n{1}", vpConst.PREFIX_CODE_SIGNATURE, command);
            command = vpCommon.formatString("{0}", command);
        }
        targetCell.set_text(command);
        Jupyter.notebook.select_next();
        // this.metaSave(); 각 함수에서 호출하도록 변경.
        if (exec) {
            switch (type) {
                case "markdown":
                    targetCell.render();
                    break;
                    
                case "code":
                default:
                    targetCell.execute();
            }

            /**
             * 추가 + 이진용 주임
             * 2020 10 22 한글('코드가 실행되었습니다') -> 영어로 변경('Your code has been executed)
             */
            vpCommon.renderSuccessMessage("Your code has been executed");
        }

        /** 추가 + 김민주 주임
         * 2020 11 24 주피터 셀 실행(run)/추가(add) 후 선택된 셀로 이동
         */
        Jupyter.notebook.scroll_to_cell(Jupyter.notebook.get_selected_index());

    }

    /**
     * 선택자 범위 uuid 안으로 감싸기
     * @param {String} selector 제한할 대상 선택자. 복수 매개 시 uuid 아래로 순서대로 제한됨
     * @returns 감싸진 선택자
     */
    VpFuncJS.prototype.wrapSelector = function(selector) {
        var args = Array.prototype.slice.call(arguments);
        args.unshift("." + this.uuid);
        return vpCommon.wrapSelector.apply(this, args);
    }

    /**
     * append css on option
     * @param {String} url style sheet url
     */
    VpFuncJS.prototype.loadCss = function(url) {
        try {
            var link = document.createElement("link");
            link.type = "text/css";
            link.rel = "stylesheet";
            link.href = requirejs.toUrl(url);
            document.getElementsByClassName(this.uuid)[0].appendChild(link);
        } catch (err) {
            console.log("[vp] Error occurred during load style sheet. Skip this time.");
            console.warn(err.message);
        }
    }

    /**
     * 미리 생성된 코드 실행
     */
    VpFuncJS.prototype.executeGenerated = function() {
        if (this.generatedCode !== "")
            this.cellExecute(this.generatedCode, true);
    }

    
    /**  추가 + 이진용 주임
    * 파일 네비게이션에 이 코드를 사용
     * @param {String} command 실행할 코드
     * @param {function} callback 실행 완료 후 호출될 callback
     * @param {boolean} isSilent 커널에 실행위한 신호 전달 여부 기본 false
     * @param {boolean} isStoreHistory 커널에 히스토리 채우도록 신호 기본 !isSilent
     * @param {boolean} isStopOnError 실행큐에 예외 발생시 중지 여부 기본 true
    */
    VpFuncJS.prototype.kernelExecuteV2 = function(command, callback, isSilent = false, isStoreHistory = !isSilent, isStopOnError = true) {
        Jupyter.notebook.kernel.execute(
            command,
            {
                iopub: {
                    output: function(msg) {
                        var result = msg.content.data['text/plain']; // <- 이 부분을 개선한 kernelExecute 버전2 코드 
                        callback(result);
                    }
                }
            },
            { silent: isSilent, store_history: isStoreHistory, stop_on_error: isStopOnError }
        );
    }

    /**
     * 메타데이터 핸들러 초기화
     */
    VpFuncJS.prototype.initMetaHandler = function() {
        if (this.mdHandler === undefined)
            this.mdHandler = new md.MdHandler(this.funcID);
        return this.mdHandler;
    }

    /**
     * 메타데이터 생성
     */
    VpFuncJS.prototype.metaGenerate = function() {
        if (this.package === undefined) return;
        var inputIdList = this.package.input.map(x => x.name);
        // inputIdList = inputIdList.concat(this.package.output.map(x => x.name));
        // inputIdList = inputIdList.concat(this.package.variable.map(x => x.name));
        // FIXME: minju : not existing object mapping error fixed
        if (this.package.output) inputIdList = inputIdList.concat(this.package.output.map(x => x.name));
        if (this.package.variable) inputIdList = inputIdList.concat(this.package.variable.map(x => x.name));
        // generate metadata
        this.initMetaHandler();
        
        this.metadata = this.mdHandler.generateMetadata(this, inputIdList);
    }

    /**
     * 메타데이터 세이브
     */
    VpFuncJS.prototype.metaSave = function() {
        // generate metadata
        this.metaGenerate();
        // save metadata
        if (this.package === undefined) return;
        // 20210104 minju: 셀에 Metadata 저장하지 않기
        // this.mdHandler.saveMetadata();
    }

    /**
     * 메타데이터 로드
     * @param {funcJS} option
     * @param {JSON} meta 
     */
    VpFuncJS.prototype.loadMeta = function(funcJS, meta) {
        this.initMetaHandler();

        this.mdHandler.metadata = meta;
        this.mdHandler.loadDirectMdAsTag(funcJS, meta);

        // 로드 후 작업이 바인딩 되어있으면 처리
        if (this.loadMetaExpend !== undefined && typeof this.loadMetaExpend == "function") {
            this.loadMetaExpend(funcJS, meta);
        }
    }

    /**
     * Get Value of Metadata by option id
     * @param {string} id 
     */
    VpFuncJS.prototype.getMetadata = function(id) {
        if (this.metadata == undefined)
            return "";
        if (this.metadata.options) {
            var len = this.metadata.options.length;
            for (var i = 0; i < len; i++) {
                var obj = this.metadata.options[i];
                if (obj.id == id)
                    return obj.value;
            }
        }
        return "";
    }

    /**
     * 페이지 내용 삽입.
     * @param {String} content 페이지 내용
     * @param {number} pageIndex 페이지 인덱스
     */
    VpFuncJS.prototype.setPage = function(content, pageIndex = 0) {
        $(vpCommon.wrapSelector(vpCommon.formatString(".{0}.{1}:eq({2})", this.uuid, vpConst.API_OPTION_PAGE, pageIndex))).append(content);
    }

    /**
     * prefix, postfix 입력 컨트롤 생성
     * @param {String} caption 아코디언 박스 캡션
     * @param {String} areaID textarea id
     * @param {String} content textarea content
     * @returns {String} tag string
     */
    VpFuncJS.prototype.createManualCode = function(caption, areaID, content) {
        var accBoxManualCode = new vpAccordionBox.vpAccordionBox(caption);
        var lineNumberTextArea = new vpLineNumberTextArea.vpLineNumberTextArea(areaID, content);
        
        accBoxManualCode.addClass(vpConst.ACCORDION_GRAY_COLOR);
        accBoxManualCode.appendContent(lineNumberTextArea.toTagString());

        return accBoxManualCode.toTagString();
    }

    /**
     * prefix 입력 컨트롤 생성
     * @param {String} content textarea content
     * @returns {String} tag string
     */
    VpFuncJS.prototype.createPrefixCode = function(content = "") {
        return this.createManualCode(vpConst.API_OPTION_PREFIX_CAPTION, vpConst.API_OPTION_PREFIX_CODE_ID, content);
    }

    /**
     * prefix 컨트롤 값 설정
     * @param {String} content textarea content
     */
    VpFuncJS.prototype.setPrefixCode = function(content) {
        $(this.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_OPTION_PREFIX_CODE_ID))).val(content);
    }

    /**
     * prefix 컨트롤 값 조회
     * @returns {String} textarea content
     */
    VpFuncJS.prototype.getPrefixCode = function() {
        return $(this.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_OPTION_PREFIX_CODE_ID))).val();
    }

    /**
     * postfix 입력 컨트롤 생성
     * @param {String} content textarea content
     * @returns {String} tag string
     */
    VpFuncJS.prototype.createPostfixCode = function(content = "") {
        return this.createManualCode(vpConst.API_OPTION_POSTFIX_CAPTION, vpConst.API_OPTION_POSTFIX_CODE_ID, content);
    }

    /**
     * postfix 컨트롤 값 설정
     * @param {String} content textarea content
     */
    VpFuncJS.prototype.setPostfixCode = function(content) {
        $(this.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_OPTION_POSTFIX_CODE_ID))).val(content);
    }

    /**
     * postfix 컨트롤 값 조회
     * @returns {String} textarea content
     */
    VpFuncJS.prototype.getPostfixCode = function() {
        return $(this.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_OPTION_POSTFIX_CODE_ID))).val();
    }

    /**
     * 옵션 컨테이너 생성
     * @param {String} caption 아코디언 박스 캡션
     * @returns {vpAccordionBox} 아코디언 박스 
     */
    VpFuncJS.prototype.createOptionContainer = function(caption) {
        var accBox = new vpAccordionBox.vpAccordionBox(caption);

        return accBox;
    }

    /**
     * 세로형 간단 테이블 레이아웃 생성
     * @param {String} thWidth 테이블 헤더(좌측 셀) 넓이
     */
    VpFuncJS.prototype.createVERSimpleLayout = function(thWidth) {
        var tblLayout = new vpTableLayoutVerticalSimple.vpTableLayoutVerticalSimple();
        tblLayout.setTHWidth(thWidth);
        
        return tblLayout;
    }

    /**
     * 가로형 간단 테이블 레이아웃 생성
     * @param {Array} thWidth 테이블 셀별 넓이
     */
    VpFuncJS.prototype.createHORIZSimpleLayout = function(thWidth) {
        var tblLayout = new vpTableLayoutHorizontalSimple.vpTableLayoutHorizontalSimple();
        // tblLayout.setTHWidth(thWidth);
        
        return tblLayout;
    }

    /**
     * 옵션별 이벤트 바인딩. (컨테이너 callback 에서 호출 함)
     */
    VpFuncJS.prototype.bindOptionEvent = function() {
        // var that = this;
        // $(document).on(vpCommon.formatString("click.{0}", that.uuid), function(evt) {
        //     console.log("Test log from vp func. " + that.uuid);
        // });
        // $(document).on(vpCommon.formatString("dblclick.{0}", that.uuid), function(evt) {
        //     console.log("Test log from vp func dblclick. " + that.uuid);
        // });
    }

    /**
     * 옵션별 이벤트 언바인딩. (컨테이너에서 로드옵션 파기될때 호출 함).
     */
    VpFuncJS.prototype.unbindOptionEvent = function() {
        $(document).unbind(vpCommon.formatString(".{0}", this.uuid));
    }

    /**
     * 모달 오픈
     * @param {String} message 모달 메시지
     * @param {Array} buttons 버튼 캡션
     * @param {function} callback 선택 콜백 함수
     */
    VpFuncJS.prototype.openMultiBtnModal = function(message = "", buttons = new Array(), callback) {
        var mbmModal = new vpMultiButtonModal.vpMultiButtonModal();
        mbmModal.setMessage(message);
        mbmModal.setButtons(buttons);
        mbmModal.openModal(callback);
    }

    /**
     * 모달 오픈
     * @param {String} message 모달 메시지
     * @param {Array<string>} buttons 버튼 캡션
     * @param {Array<function>} callback 선택 콜백 함수
     */
    VpFuncJS.prototype.openMultiBtnModal_new = function(message = "", submessage, buttons = new Array(), callbackList) {
        var mbmModal = new vpMultiButtonModal_new.vpMultiButtonModal(message, submessage, buttons);
        mbmModal.openModal(callbackList);
    }
    return {'VpFuncJS': VpFuncJS};
});