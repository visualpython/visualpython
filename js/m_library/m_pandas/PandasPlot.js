/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : PandasPlot.js
 *    Author          : Black Logic
 *    Note            : Library Component
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 06. 22
 *    Change Date     :
 */

//============================================================================
// [CLASS] PandasPlot
//============================================================================
define([
    'vp_base/js/com/component/LibraryComponent',
    'vp_base/js/com/component/DataSelector'
], function(LibraryComponent, DataSelector) {
    /**
     * PandasPlot
     */
    class PandasPlot extends LibraryComponent {
        _init() {
            super._init();

            this.state = {
                i0: '',
                o0: '',
                ...this.state
            }
        }
        render() {
            super.render();
            
            // add data selector
            let dataSelector = new DataSelector({ pageThis: this, id: 'i0', value: this.state.i0, required: true });
            $(this.wrapSelector('#i0')).replaceWith(dataSelector.toTagString());
        }
    }

    return PandasPlot;
});