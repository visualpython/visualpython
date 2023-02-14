/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : getValueCounts.js
 *    Author          : Black Logic
 *    Note            : Library Component
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] ValueCounts
//============================================================================
define([
    'vp_base/js/com/component/LibraryComponent',
    'vp_base/js/com/component/VarSelector'
], function(LibraryComponent, VarSelector) {
    /**
     * ValueCounts
     */
    class ValueCounts extends LibraryComponent {
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
            
            // add var selector
            var varSelector = new VarSelector(['DataFrame', 'Series', 'Index'], 'DataFrame', false);
            varSelector.setComponentId('i0');
            varSelector.addClass('vp-state');
            varSelector.setUseColumn(true);
            varSelector.setValue(this.state.i0);
            $(this.wrapSelector('#i0')).replaceWith(varSelector.render());
        }
    }

    return ValueCounts;
});