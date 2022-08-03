/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Try.js
 *    Author          : Black Logic
 *    Note            : Logic > try
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     : 2022. 08. 0x
 */

//============================================================================
// [CLASS] Try
//============================================================================
define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(com_String, PopupComponent) {

    /**
     * Try
     */
    class Try extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.codeview = false;
            this.config.saveOnly = true;

            this.state = {
                ...this.state
            }

            this.exceptClassName = 'vp-try-except-input';
            this.addBtnIdName = 'vp-try-add-btn';
            this.inputBoxText = 'Input Error Type';
            
            this._addCodemirror('code', this.wrapSelector('#code'));
        }

        _bindEvent() {
            super._bindEvent();
            var page = new com_String();
            let that = this;
            /** Implement binding events */
            $(this.wrapSelector('#' + this.addBtnIdName)).on('click', function() {
                alert("btn click!");
                // add except input
            });
        }

        templateForBody() {
            var page = new com_String();
            // add Except Input
            page.appendLine('<div class="vp-bold" style="margin-top:5px;">Except</div>');
            page.appendFormatLine('<input type="text" class="vp-input wp100 vp-state {0}" value="{1}" placeholder="{2}">'
                                    ,this.exceptClassName , this.inputBoxText, this.inputBoxText);
            // add +except btn
            page.appendFormatLine('<button class="vp-button w90" id="{0}">+ Except</button>', this.addBtnIdName);
            return page.toString();
        }

        generateCode() {
            // generate code new!
            return 'try:';
        }

    }

    return Try;
});