/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : EqualVarTest.js
 *    Author          : Black Logic
 *    Note            : Equal Variance Test
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 05. 09
 *    Change Date     :
 */

//============================================================================
// [CLASS] EqualVarTest
//============================================================================
define([
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector'
], function(com_util, com_Const, com_String, PopupComponent, DataSelector) {

    /**
     * EqualVarTest
     */
    class EqualVarTest extends PopupComponent {
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
            return `This is sample.
            <input type="text" id="sample" class="vp-state vp-input" readonly="" />`;
        }

        render() {
            super.render();

            let dataSelector = new DataSelector({
                type: 'data',
                pageThis: this,
                id: 'sample',
                finish: function() {
                    ;
                }
            });
            $(this.wrapSelector('#sample')).replaceWith(dataSelector.toTagString());
        }

        generateCode() {
            return "print('sample code')";
        }

    }

    return EqualVarTest;
});