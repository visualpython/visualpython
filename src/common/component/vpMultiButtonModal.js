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
    var vpMultiButtonModal = function() {
        this.setUUID();
        this._buttons = new Array();
        this._buttons.push("OK");
        this._message = "";
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
    vpMultiButtonModal.prototype.openModal = function(closeCallback) {
        var sbTagString = new sb.StringBuilder();
        var that = this;

        sbTagString.appendFormatLine("<div id='vp_multiButtonModal' class='{0}'>", that._UUID);
        sbTagString.appendLine("<div class='vp-multi-button-modal-box'>");
        sbTagString.appendLine("<div class='vp-multi-button-modal-message'>");
        sbTagString.appendFormatLine("<span>{0}</span>", that._message);
        sbTagString.appendLine("</div>");
        sbTagString.appendLine("<div class='vp-multi-button-modal-buttons'>");
        for (var idx = 0; idx < that._buttons.length; idx++) {
            sbTagString.appendFormatLine("<input class='vp-modal-button' type='button' value='{0}' />", that._buttons[idx]);
        }
        sbTagString.appendLine("</div>");
        sbTagString.appendLine("</div>");
        sbTagString.appendLine("</div>");

        $(document).on(vpCommon.formatString("click.{0}", that._UUID), vpCommon.formatString(".{0} .{1}", that._UUID, "vp-modal-button"), function() {
            $(document).unbind(vpCommon.formatString(".{0}", that._UUID));
            if (typeof closeCallback == "function")
                closeCallback($(this).index());
            $(vpCommon.formatString(".{0}", that._UUID)).remove();
        });

        /** esc shortcut add */
        $(document).bind(vpCommon.formatString('keydown.{0}', that._UUID), function(event) {
            that.handleEscToExit(event);
        });

        $(sbTagString.toString()).appendTo("body");
    }

    /**
     * ESC키로 창 닫기
     * @param {Event} event 
     */
    vpMultiButtonModal.prototype.handleEscToExit = function(event) {
        var keyCode = event.keyCode ? event.keyCode : event.which;
        // esc
        if (keyCode == 27) {
            console.log('esc from modal', this._UUID);

            $(document).unbind(vpCommon.formatString(".{0}", this._UUID));
            $(vpCommon.formatString(".{0}", this._UUID)).remove();
            $(vpCommon.formatString("keydown.{0}", this._UUID), this.handleEscToExit);
        }
    }

    return {
        vpMultiButtonModal: vpMultiButtonModal
    }
});