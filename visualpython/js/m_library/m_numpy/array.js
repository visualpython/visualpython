/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : array.js
 *    Author          : Black Logic
 *    Note            : array
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] NpArray
//============================================================================
define([
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/NumpyComponent'
], function(com_util, com_Const, com_String, NumpyComponent) {

    /**
     * NpArray
     */
    class NpArray extends NumpyComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            
        }

        templateForBody() {
            /** Implement generating template */
            return 'This is sample.';
        }

        generateCode() {
            return "print('sample code')";
        }

    }

    return NpArray;
});