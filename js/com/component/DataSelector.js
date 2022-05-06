/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : DataSelector.js
 *    Author          : Black Logic
 *    Note            : Data Selector
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 03. 23
 *    Change Date     :
 */
define([
    'text!vp_base/html/component/dataSelector.html!strip',
    'css!vp_base/css/component/dataSelector.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/Component',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/MultiSelector'
], function(dataHTML, dataCss, com_String, com_util, Component, MultiSelector) {
    //========================================================================
    // [CLASS] DataSelector
    //========================================================================
    class DataSelector extends Component {

        /**
         * Constructor
         * @param {Object} state  { type, ... }
         */
        constructor(state) {
            super($('#site'), state);
        }

        _init() {
            super._init();

            this.state = {
                type: 'data',   // selector type : data / column
                target: null,   // target jquery object
                finish: null,   // callback after selection
                data: '',
                dataType: '',
                ...this.state
            }

        }

        _bindEvent() {
            let that = this;

            // Click X to close
            $(that.wrapSelector('.vp-inner-popup-close')).on('click', function() {
                that.close();
            });

            // Click ok
            $(that.wrapSelector('#vp_dsOk')).on('click', function() {
                // TODO: set target value
                let newValue = that.state.data;

                $(that.state.target).val(newValue);
                $(that.state.target).data('type', that.state.dataType);
                that.state.finish(newValue);
                that.close();
            });

        }

        /**
         * Bind event for items created dynamically
         */
        _bindEventForItem() {
            let that = this;

            // Click variable item
            $(that.wrapSelector('.vp-ds-var-item')).off('click');
            $(that.wrapSelector('.vp-ds-var-item')).on('click', function() {
                $(that.wrapSelector('.vp-ds-var-item')).removeClass('selected');
                $(this).addClass('selected');

                let data = $(this).find('.vp-ds-var-data').text();
                let dataType = $(this).find('.vp-ds-var-type').text();
                that.state.data = data;
                that.state.dataType = dataType;

                // TODO: load preview
            });
        }

        loadVariables() {
            let that = this;
            // Searchable variable types
            let types = [
                ...vpConfig.getDataTypes(),
                // ML Data types
                ...vpConfig.getMLDataTypes()
            ];
            
            vpKernel.getDataList(types).then(function(resultObj) {
                var varList = JSON.parse(resultObj.result);

                let varTags = new com_String();
                varList && varList.forEach((varObj, idx) => {
                    varTags.appendFormatLine('<div class="{0} {1}">', 'vp-ds-var-item', 'vp-grid-col-p50');
                    varTags.appendFormatLine('<div class="{0}">{1}</div>', 'vp-ds-var-data', varObj.varName);
                    varTags.appendFormatLine('<div class="{0}">{1}</div>', 'vp-ds-var-type', varObj.varType);
                    varTags.appendLine('</div>');
                });

                $(that.wrapSelector('.vp-ds-variable-box')).html(varTags.toString());

                that._bindEventForItem();

            });
        }

        template() {
            return dataHTML;
        }

        render() {
            super.render();

            this.loadVariables();
        }

        open() {
            $(this.wrapSelector()).show();
        }

        close() {
            $(this.wrapSelector()).remove();
        }
    }

    return DataSelector;

});