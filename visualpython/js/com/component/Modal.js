/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Modal.js
 *    Author          : Black Logic
 *    Note            : Modal
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Modal
//============================================================================
define([
    __VP_CSS_LOADER__('vp_base/css/component/modal'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/Component',
    'vp_base/js/com/com_util'
], function(modalCss, com_String, Component, com_util) {

    /**
     * Modal
     */
    class Modal extends Component {
        /**
         * 
         * @param {Object} state {title, message, buttons, defaultButtonIdx, finish}
         *  - title   : string / modal title
         *  - message : string / modal message
         *  - buttons : list / at least 1 button needed
         * [optional]
         *  - defaultButtonIdx : int (default: 1)
         *  - finish : callback function when modal button clicked (result:button idx 0~n)
         *  - buttonClass : list / same length as buttons, define classes for buttons
         */
        constructor(state) {
            super($('body'), state);
        }
        _init() {
            super._init();
            this.state = {
                title: '',
                message: '',
                buttons: [],
                defaultButtonIdx: 1,
                finish: function(modalIdx) {
                    /* Implementation needed */
                },
                buttonClass: [],
                ...this.state
            }
            /** Write codes executed before rendering */
            if (this.state.buttons.length == 0) {
                this.state.buttons.push("OK");
            }
        }

        _bindEvent() {
            /** Implement binding events */
            let that = this;
            // button click event
            $(this.wrapSelector('.vp-modal-button')).on('click', function () {
                if (typeof that.state.finish == "function") {
                    let modalIdx = parseInt($(this).data('idx'));
                    that.state.finish(modalIdx);
                }
                that.close();
            });
            
            // esc key to close, enter key to select
            $(document).bind(com_util.formatString('keydown.{0}', this.uuid), function (event) {
                that.handleEscToExit(event);
                that.handleEnterToClickButton(event);
            });
        }

        template() {
            /** Implement generating template */
            let { title, message, buttons, defaultButtonIdx, buttonClass } = this.state;
            var sbTagString = new com_String();
            sbTagString.appendLine("<div id='vp_multiButtonModal'>");
            sbTagString.appendLine("<div class='vp-multi-button-modal-box'>");
            sbTagString.appendLine("<div class='vp-multi-button-modal-message'>");
            sbTagString.appendLine("<div class='vp-multi-button-modal-message-inner'>");
            sbTagString.appendFormatLine("<span>{0}</span>", title);
            sbTagString.appendFormatLine("<p>{0}</p>", message);
            sbTagString.appendLine("</div>");
            sbTagString.appendLine("</div>");
            sbTagString.appendLine("<div class='vp-multi-button-modal-buttons'>");

            buttons && buttons.forEach((btn, idx) => {
                sbTagString.appendFormatLine("<input class='vp-button vp-modal-button {0} {1}' data-idx={2} type='button' value='{3}' />",
                    defaultButtonIdx == idx? 'vp-modal-selected-button' : '',
                    buttonClass[idx],
                    idx,
                    btn);
            });

            sbTagString.appendLine("</div>");
            sbTagString.appendLine("</div>");
            sbTagString.appendLine("</div>");
            sbTagString.appendLine("</div>");
            return sbTagString.toString();
        }

        render() {
            /** Implement after rendering */

        }

        //============================================================================
        // Settings
        //============================================================================
        /**
         * Open modal tag
         * @param {function} callBackList
         */
        open() {
            // render on open
            super.render();
            /** focus on default button */
            $(this.wrapSelector('.vp-modal-button[data-idx="' + this.state.defaultButtonIdx + '"]')).focus();
            // show
            $(this.wrapSelector()).show();
        }
        close() {
            $(document).unbind(com_util.formatString(".{0}", this.uuid));
            $(document).unbind(com_util.formatString("keydown.{0}", this.uuid));
            $(this.wrapSelector()).remove();
        }
        /**
         * close using esc
         * @param {Event} event
         */
        handleEscToExit(event) {
            var keyCode = event.keyCode ? event.keyCode : event.which;
            // esc
            if (keyCode == 27) {
                this.close();
            }
        }
        /**
         * select using enter
         * @param {Event} event 
         */
        handleEnterToClickButton(event) {
            var keyCode = event.keyCode ? event.keyCode : event.which;
            // enter
            if (keyCode == 13) {
                $(this.wrapSelector('.vp-modal-button[data-idx="' + this.state.defaultButtonIdx + '"]')).click();
                this.close();
            }
        }

    }

    return Modal;
});