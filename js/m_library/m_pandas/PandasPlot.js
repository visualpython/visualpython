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
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/com/com_util'
], function(LibraryComponent, DataSelector, com_util) {
    /**
     * PandasPlot
     */
    class PandasPlot extends LibraryComponent {
        _init() {
            super._init();

            this.state = {
                i0: '',
                o0: '',
                figWidth: '',
                figHeight: '',
                ...this.state
            }
        }

        _bindEventAfterRender() {
            let that = this;

            $(this.wrapSelector('#figWidth')).on('blur', function() {
                let width = $(this).val();
                let height = $(that.wrapSelector('#figHeight')).val();

                if (width !== '' || height !== '') {
                    $(that.wrapSelector('#figsize')).val(com_util.formatString('({0},{1})', width, height));
                } else {
                    $(that.wrapSelector('#figsize')).val('');
                }
            });
            $(this.wrapSelector('#figHeight')).on('blur', function() {
                let width = $(that.wrapSelector('#figWidth')).val();
                let height = $(this).val();

                if (width !== '' || height !== '') {
                    $(that.wrapSelector('#figsize')).val(com_util.formatString('({0},{1})', width, height));
                } else {
                    $(that.wrapSelector('#figsize')).val('');
                }
            });
        }

        render() {
            super.render();
            
            // add data selector
            let dataSelector = new DataSelector({ pageThis: this, id: 'i0', value: this.state.i0, required: true });
            $(this.wrapSelector('#i0')).replaceWith(dataSelector.toTagString());

            // divide figure size option to width / height
            let figSizeTemplate = `
            <input type="number" class="vp-input m vp-state" id="figWidth" placeholder="Width" value="${this.state.figWidth}"/>
            <input type="number" class="vp-input m vp-state" id="figHeight" placeholder="Height" value="${this.state.figHeight}"/>`
            $(this.wrapSelector('#figsize')).hide();
            $(this.wrapSelector('#figsize')).parent().append(figSizeTemplate);

            this._bindEventAfterRender();
        }
    }

    return PandasPlot;
});