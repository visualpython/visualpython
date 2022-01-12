/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Finally.js
 *    Author          : Black Logic
 *    Note            : Logic > finally
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Finally
//============================================================================
define([
    'vp_base/js/com/component/PopupComponent'
], function(PopupComponent) {

    /**
     * Finally
     */
    class Finally extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.codeview = false;
            this.config.saveOnly = true;
        }

        generateCode() {
            return 'finally:';
        }

    }

    return Finally;
});