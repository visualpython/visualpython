/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Else.js
 *    Author          : Black Logic
 *    Note            : Logic > else
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Else
//============================================================================
define([
    'vp_base/js/com/component/PopupComponent'
], function(PopupComponent) {

    /**
     * Else
     */
    class Else extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.codeview = false;
            this.config.saveOnly = true;
        }

        generateCode() {
            return 'else:';
        }

    }

    return Else;
});