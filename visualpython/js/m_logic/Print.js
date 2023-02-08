/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Print.js
 *    Author          : Black Logic
 *    Note            : Logic > print
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Print
//============================================================================
define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(com_String, PopupComponent) {

    /**
     * Print
     */
    class Print extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.codeview = false;
            this.config.saveOnly = true;

            this.state = {
                code: 'print()',
                ...this.state
            }
            
            this._addCodemirror('code', this.wrapSelector('#code'));
        }

        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            page.appendFormatLine('<textarea name="code" class="code vp-state" id="code">{0}</textarea>'
                                , this.state.code);
            return page.toString();
        }

        open() {
            super.open();

            // if start with print(, set default cursor on codemirror
            if (this.state.code.substr(0, 6) === 'print(') {
                // set default cursor
                let cmObj = this.getCodemirror('code');
                if (cmObj && cmObj.cm) {
                    cmObj.cm.setCursor({ line: 0, ch: 6 });
                    cmObj.cm.focus();
                }
            }
        }

        generateCode() {
            return this.state.code;
        }

    }

    return Print;
});