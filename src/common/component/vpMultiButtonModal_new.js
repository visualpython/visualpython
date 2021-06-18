define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/component/vpComComponent'
], function (requirejs, $, vpCommon, vpConst, sb, vpComComponent) {
    /**
     * @class vpMultiButtonModal 다중버튼 모달(최소 1개 버튼 바인딩)
     * @constructor
     */
    var vpMultiButtonModal = function(message, submessage, buttons, defaultButtonIdx=1) {
        this.setUUID();
        this._buttons = buttons;
        this._message = message;
        this._submessage = submessage;
        this._defaultButtonIdx = defaultButtonIdx;
    };
    
    vpMultiButtonModal.prototype = Object.create(vpComComponent.vpComComponent.prototype);

    /**
     * 버튼들 설정
     * @param {Array} buttons 버튼들. 최소 1개 버튼 바인딩
     */
    vpMultiButtonModal.prototype.setButtons = function(buttons = new Array()) {
        if (buttons.length == 0) {
            buttons.push("OK");
        }
        this._buttons = buttons;
    }

    /**
     * 메시지 설정
     * @param {String} message 모달 메시지 설정
     */
    vpMultiButtonModal.prototype.setMessage = function(message = "") {
        this._message = message;
    }

    /**
     * 모달 태그 오픈
     * @param {function} closeCallback 종료 콜백함수
     */
    vpMultiButtonModal.prototype.openModal = function(callBackList) {
        var sbTagString = new sb.StringBuilder();
        var that = this;

        sbTagString.appendFormatLine("<div id='vp_multiButtonModal' class='{0}'>", that._UUID);
        sbTagString.appendLine("<div class='vp-multi-button-modal-box'>");
        sbTagString.appendLine("<div class='vp-multi-button-modal-message'>");
        sbTagString.appendLine("<div class='vp-multi-button-modal-message-inner'>");
        sbTagString.appendFormatLine("<span>{0}</span>", that._message);
        sbTagString.appendFormatLine("<p>{0}</p>", that._submessage);
        sbTagString.appendLine("</div>");
        sbTagString.appendLine("</div>");
        sbTagString.appendLine("<div class='vp-multi-button-modal-buttons'>");

        if (that._buttons[0]) {
            sbTagString.appendFormatLine("<input class='vp-modal-button vp-modal-button-1 {0}' type='button' value='{1}' />"
                                        , that._defaultButtonIdx == 1? 'vp-modal-selected-button': ''
                                        , that._buttons[0]);
        }
        sbTagString.appendLine("<div class=''>");
        if (that._buttons[1]) {
            sbTagString.appendFormatLine("<input class='vp-modal-button vp-modal-button-2 {0}' type='button' value='{1}' />"
                                        , that._defaultButtonIdx == 2? 'vp-modal-selected-button': ''
                                        , that._buttons[1]);
        }
        if (that._buttons[2]) {
            sbTagString.appendFormatLine("<input class='vp-modal-button vp-modal-button-3 {0}' type='button' value='{1}' />"
                                        , that._defaultButtonIdx == 3? 'vp-modal-selected-button': ''
                                        , that._buttons[2]);
        }
        sbTagString.appendLine("</div>");
        
        sbTagString.appendLine("</div>");
        sbTagString.appendLine("</div>");
        sbTagString.appendLine("</div>");

        /** 첫번째 버튼 클릭 이벤트 함수 */
        $(document).on(vpCommon.formatString("click.{0}", that._UUID), vpCommon.formatString(".{0} .{1}", that._UUID, "vp-modal-button-1"), function() {
            $(document).unbind(vpCommon.formatString(".{0}", that._UUID));
            if (typeof callBackList[0] == "function") {
                callBackList[0]($(this).index());
            }
          
            $(vpCommon.formatString(".{0}", that._UUID)).remove();
        });

        /** 두번째 버튼 클릭 이벤트 함수 */
        $(document).on(vpCommon.formatString("click.{0}", that._UUID), vpCommon.formatString(".{0} .{1}", that._UUID, "vp-modal-button-2"), function() {
            $(document).unbind(vpCommon.formatString(".{0}", that._UUID));
            if (typeof callBackList[1] == "function") {
                callBackList[1]($(this).index());
            }

            $(vpCommon.formatString(".{0}", that._UUID)).remove();
        });

        /** 세번째 버튼 클릭 이벤트 함수 */
        $(document).on(vpCommon.formatString("click.{0}", that._UUID), vpCommon.formatString(".{0} .{1}", that._UUID, "vp-modal-button-3"), function() {
            $(document).unbind(vpCommon.formatString(".{0}", that._UUID));
            if (typeof callBackList[2] == "function") {
                callBackList[2]($(this).index());
            }

            $(vpCommon.formatString(".{0}", that._UUID)).remove();
        });

        /** esc shortcut add */
        $(document).bind(vpCommon.formatString('keydown.{0}', that._UUID), function(event) {
            that.handleEscToExit(event);
            that.handleEnterToClickButton(event);
        });

        $(sbTagString.toString()).appendTo("body");

        /** focus on default button */
        $(vpCommon.formatString(".{0} .{1}", that._UUID, "vp-modal-button-" + that._defaultButtonIdx)).focus();
    }

    /**
     * ESC키로 창 닫기
     * @param {Event} event 
     */
    vpMultiButtonModal.prototype.handleEscToExit = function(event) {
        var keyCode = event.keyCode ? event.keyCode : event.which;
        // esc
        if (keyCode == 27) {
            // console.log('esc from modal', this._UUID);

            $(document).unbind(vpCommon.formatString(".{0}", this._UUID));
            $(vpCommon.formatString(".{0}", this._UUID)).remove();
            $(vpCommon.formatString("keydown.{0}", this._UUID), this.handleEscToExit);
        }
    }

    vpMultiButtonModal.prototype.handleEnterToClickButton = function(event) {
        var keyCode = event.keyCode ? event.keyCode : event.which;
        var that = this;
        // enter
        if (keyCode == 13) {
            // console.log('enter from modal', this._UUID);

            $(vpCommon.formatString("keydown.{0}", this._UUID), this.handleEnterToClickButton);
            $(vpCommon.formatString(".{0} .{1}", that._UUID, "vp-modal-button-" + that._defaultButtonIdx)).click();
        }
    }

    return {
        vpMultiButtonModal: vpMultiButtonModal
    }
});