/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Except.js
 *    Author          : Black Logic
 *    Note            : Logic > except
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Except
//============================================================================
define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput'
], function(com_String, PopupComponent, SuggestInput) {

    /**
     * Except
     */
    class Except extends PopupComponent {
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
        }

        templateForBody() {
            let { v1, v2 } = this.state;
            let page = new com_String();
            // suggestInput for operator
            let errorList = [ 
                'AssertionError', 'SystemError', 'TypeError',  'ModuleNotFoundError',
                'BaseException', 'FileNotFoundError', 'ImportError',
                'IndexError', 'MemoryError', 'LookupError', 'BufferError',
                'EOFError'
            ];
            var suggestInput = new SuggestInput();
            suggestInput.setComponentID('v1');
            suggestInput.addClass('vp-input vp-state w150 v1');
            suggestInput.setSuggestList(function() { return errorList; });
            suggestInput.setPlaceholder('Error');
            suggestInput.setNormalFilter(false);
            suggestInput.setValue(v1);
            suggestInput.setSelectEvent(function(selectedValue) {
                // trigger change
                $(this.wrapSelector()).val(selectedValue);
                $(this.wrapSelector()).trigger('change');
            });
            page.appendLine(suggestInput.toTagString());
            page.appendLine('<label style="padding: 0 10px 0 10px;">as</label>');
            page.appendFormatLine('<input type="text" id="v2" class="vp-input vp-state w50 v2" value="{0}"/>', v2);
            return page.toString();
        }

        generateCode() {
            let { v1, v2 } = this.state;
            let asVariableStr = '';
            if (v2 != '') {
                asVariableStr = ' as ' + v2;
            }
            return `except ${v1}${asVariableStr}:`;
        }

    }

    return Except;
});