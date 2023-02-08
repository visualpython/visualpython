/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Try.js
 *    Author          : Black Logic
 *    Note            : Logic > try
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
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
            
            this._addCodemirror('code', this.wrapSelector('#code'));
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
        }

        templateForBody() {
            return '';
        }

        generateCode() {
            return 'try:';
        }

    }

    return Try;
});