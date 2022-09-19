/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : SampleApp2.js
 *    Author          : Black Logic
 *    Note            : [앱 설명]
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : YYYY. MM. dd
 *    Change Date     :
 */

//============================================================================
// [CLASS] SampleApp 2
//============================================================================
define([
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(com_util, com_Const, com_String, PopupComponent) {

    /**
     * SampleApp2
     */
    class SampleApp2 extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            
            // $(this.wrapSelector('#sample')).on('click', function() {
						//    ;
            // });
        }

        templateForBody() {
            /** Implement generating template */
            return `This is sample.
            <input type="text" id="sample" class="vp-state vp-input" />`;
        }

        render() {
            super.render();

						/** Write codes executed after rendering */
        }

        generateCode() {
            return "print('sample code')";
        }

    }

    return SampleApp2;
});