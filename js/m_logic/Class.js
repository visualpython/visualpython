/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Class.js
 *    Author          : Black Logic
 *    Note            : Logic > class
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Class
//============================================================================
define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent'
], function(com_String, com_util, PopupComponent) {

    /**
     * Class
     */
    class Class extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.saveOnly = true;

            this.state = {
                v1: '',
                v2: '',
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
            page.appendLine('<div class="vp-orange-text vp-bold">Class Name</div>');
            page.appendFormatLine('<input type="text" id="v1" class="vp-input wp100 vp-state" value="{0}" placeholder="{1}">'
                                , this.state.v1, 'Input class name');
            page.appendLine('<div class="vp-bold" style="margin-top:5px;">Super Class Name</div>');
            page.appendFormatLine('<input type="text" id="v2" class="vp-input wp100 vp-state" value="{0}" placeholder="{1}">'
                                , this.state.v2, 'Input super class name');
            return page.toString();
        }

        generateCode() {
            let superClass = this.state.v2;
            if (superClass != '') {
                superClass = '(' + superClass + ')';
            }
            return com_util.formatString('class {0}{1}:', this.state.v1, superClass);
        }

    }

    return Class;
});