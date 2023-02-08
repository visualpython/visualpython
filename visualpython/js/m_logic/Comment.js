/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Comment.js
 *    Author          : Black Logic
 *    Note            : Logic > comment
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Comment
//============================================================================
define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(com_String, PopupComponent) {

    const COMMENT_DEFAULT_CODE = '# Write down comments'

    /**
     * Comment
     */
    class Comment extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.codeview = false;
            this.config.saveOnly = true;

            this.state = {
                code: COMMENT_DEFAULT_CODE,
                ...this.state
            }
            
            this._addCodemirror('code', this.wrapSelector('#code'));
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
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

            if (this.state.code === COMMENT_DEFAULT_CODE) {
                // set default selection
                let cmObj = this.getCodemirror('code');
                if (cmObj && cmObj.cm) {
                    cmObj.cm.setSelection({ line: 0, ch: 2 }, { line: 0 });
                    cmObj.cm.focus();
                }
            }
        }

        generateCode() {
            return this.state.code;
        }

    }

    return Comment;
});