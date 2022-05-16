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
], function(dataHTML, dataCss, com_String, com_util, Component, SuggestInput, MultiSelector) {
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

            this.columnSelector = null;

        }

        _bindEvent() {
            let that = this;

            // Click X to close
            $(that.wrapSelector('.vp-inner-popup-close')).on('click', function() {
                that.close();
            });

            // Click cancel
            $(that.wrapSelector('#vp_dsCancel')).on('click', function() {
                that.close();
            });

            // Click ok
            $(that.wrapSelector('#vp_dsOk')).on('click', function() {
                // TODO: set target value
                let newValue = that.generateCode();

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
            // $(that.wrapSelector('.vp-ds-var-item')).on('click', function() {
            $(that.wrapSelector('.vp-ds-var-item')).single_double_click(function(evt) {
                // single click
                $(that.wrapSelector('.vp-ds-var-item')).removeClass('selected');
                $(this).addClass('selected');

                let data = $(this).find('.vp-ds-var-data').text();
                let dataType = $(this).find('.vp-ds-var-type').text();
                that.state.data = data;
                that.state.dataType = dataType;

                // render option page
                that.renderOptionPage();
            }, function(evt) {
                // double click to select directly
                let data = $(this).find('.vp-ds-var-data').text();
                let dataType = $(this).find('.vp-ds-var-type').text();
                that.state.data = data;
                that.state.dataType = dataType;

                let newValue = that.generateCode();

                $(that.state.target).val(newValue);
                $(that.state.target).data('type', that.state.dataType);
                that.state.finish(newValue);
                that.close();
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

        templateForSlicing() {
            return `
                <div>
                    <label>Type start/end index for slicing.</label>
                </div>
                <div>
                    <input type="number" class="vp-input" id="vp_dsStart" placeholder="Start value"/>
                    <input type="number" class="vp-input" id="vp_dsEnd" placeholder="End value"/>
                </div>
            `;
        }

        render() {
            super.render();

            this.loadVariables();
        }

        renderOptionPage() {
            // initialize page and variables
            $(this.wrapSelector('.vp-ds-option-inner-box')).html('');
            this.columnSelector = null;

            switch (this.state.dataType) {
                case 'DataFrame':
                    // column selecting
                    this.columnSelector = new MultiSelector(this.wrapSelector('.vp-ds-option-inner-box'),
                        { mode: 'columns', parent: [this.state.data] }
                    );  
                    break;
                case 'Series':
                case 'list':
                case 'ndarray':
                    // slicing
                    $(this.wrapSelector('.vp-ds-option-inner-box')).html(this.templateForSlicing());
                    break;
                default:
                    break;
            }
        }

        generateCode() {
            let { data, dataType } = this.state;
            let code = new com_String();

            switch (dataType) {
                case 'DataFrame':
                    code.append(data);
                    if (this.columnSelector != null) {
                        let result = this.columnSelector.getDataList();
                        let columnList = [];
                        result && result.forEach(obj => {
                            columnList.push(obj.code);
                        });
                        if (columnList.length > 0) {
                            code.appendFormat('[{0}]', columnList.join(', '));
                        }
                    }
                    break;
                case 'Series':
                case 'list':
                case 'ndarray':
                    code.append(data);
                    // start / end value
                    let start = $(this.wrapSelector('#vp_dsStart')).val();
                    let end = $(this.wrapSelector('#vp_dsEnd')).val();
                    if ((start && start != '') || (end && end != '')) {
                        code.appendFormat('[{0}:{1}]', start, end);
                    }
                    break;
                default:
                    code.append(data);
                    break;
            }
            return code.toString();
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