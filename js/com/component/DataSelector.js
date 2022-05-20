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
    // Usage:
    // let dataSelector = new DataSelector({
    //     type: 'data',
    //     pageThis: this,
    //     id: 'targetId',
    //     finish: function() {
    //         ;
    //     }
    // });
    // $('#sample').replaceWith(dataSelector.toTagString());
    //========================================================================
    class DataSelector extends Component {

        /**
         * Constructor
         * @param {Object} prop  { type, ... }
         */
        constructor(prop) {
            super($('#site'), {}, prop);
        }

        _init() {
            super._init();

            this.prop = {
                type: 'data',   // selector type : data / column
                pageThis: null, // target's page object
                id: '',         // target id
                finish: null,   // callback after selection
                select: null,   // callback after selection from suggestInput
                allowDataType: [], // default allow data types (All)
                // additional options
                classes: '',
                ...this.prop
            }

            this.state = {
                data: '',
                dataType: '',
                slicingStart: '',
                slicingEnd: '',
                dictKey: '',
                ...this.state
            }

            this._parentTag = null;
            if (this.prop.pageThis) {
                this._parentTag = $(this.prop.pageThis.wrapSelector());
            }
            this._target = null;
            if (this.prop.pageThis) {
                this._target = this.prop.pageThis.wrapSelector('#' + this.prop.id);
            }

            this._columnSelector = null;

            this._varList = [];

            this.loadVariables();
            this.bindEvent();
        }

        /**
         * Bind event for initializing DataSelector
         */
        bindEvent() {
            let that = this;

            // bind Event on focus/click box
            $(document).on(com_util.formatString("focus.init-{0}", that.uuid), com_util.formatString(".vp-ds-box-{0}.{1}", that.uuid, 'vp-ds-uninit'), function () {
                // unbind initial event
                $(document).unbind(com_util.formatString(".init-{0}", that.uuid));
                $(com_util.formatString(".vp-ds-box-{0}.{1}", that.uuid, 'vp-ds-uninit')).removeClass('vp-ds-uninit').addClass('vp-ds-init');

                // bind autocomplete
                that._bindAutocomplete(that._varList);

                // bind Event for opening popup
                $(that._parentTag).on('click', com_util.formatString('.vp-ds-box-{0} .vp-ds-filter', that.uuid), function(evt) {
                    // check disabled
                    if (!$(this).parent().find('input.vp-ds-target').is(':disabled')) {
                        if (!$(that.wrapSelector()).length > 0) {
                            // open popup box
                            that.open();
                        }
                    }
                    evt.stopPropagation();
                });

            });

            // click filter -> open DataSelector popup
            $(document).on(com_util.formatString("click.init-{0}", that.uuid), com_util.formatString(".vp-ds-box-{0}.{1}", that.uuid, 'vp-ds-uninit'), function () {
                // unbind initial event
                $(document).unbind(com_util.formatString(".init-{0}", that.uuid));
                $(com_util.formatString(".vp-ds-box-{0}.{1}", that.uuid, 'vp-ds-uninit')).removeClass('vp-ds-uninit').addClass('vp-ds-init');

                // bind autocomplete
                that._bindAutocomplete(that._varList);

                // bind Event for opening popup
                $(that._parentTag).on('click', com_util.formatString('.vp-ds-box-{0} .vp-ds-filter', that.uuid), function(evt) {
                    // check if it's disabled
                    if (!$(this).parent().find('input.vp-ds-target').is(':disabled')) {
                        if (!$(that.wrapSelector()).length > 0) {
                            // open popup box
                            that.open();
                        }
                    }
                    evt.stopPropagation();
                });

                // do click event
                // check if it's disabled
                if (!$(this).find('input.vp-ds-target').is(':disabled')) {
                    if (!$(that.wrapSelector()).length > 0) {
                        // open popup box
                        that.open();
                    }
                }
            });

        }

        /**
         * Bind autocomplete for target input tag
         * @param {*} varList { label, value }
         */
        _bindAutocomplete(varList) {
            let that = this;

            $(com_util.formatString(".vp-ds-box-{0} input.vp-ds-target", that.uuid)).autocomplete({
                autoFocus: true,
                minLength: 0,
                source: function (req, res) {
                    var srcList = varList;
                    var returlList = new Array();
                    for (var idx = 0; idx < srcList.length; idx++) {
                        // srcList as object array
                        if (srcList[idx].label.toString().toLowerCase().includes(req.term.trim().toLowerCase())) {
                            returlList.push(srcList[idx]);
                        }
                    }
                    res(returlList);
                },
                select: function (evt, ui) {
                    let result = true;
                    // trigger change
                    $(this).val(ui.item.value);
                    $(this).trigger('change');

                    // select event
                    if (typeof that.prop.select == "function")
                        result = that.prop.select(ui.item.value, ui.item);
                    if (result != undefined) {
                        return result;
                    }
                    return true;
                },
                search: function(evt, ui) {
                    return true;
                }
            }).focus(function () {
                $(this).select();
                $(this).autocomplete('search', $(this).val());
            }).click(function () {
                $(this).select();
                $(this).autocomplete('search', $(this).val());
            }).autocomplete('instance')._renderItem = function(ul, item) {
                return $('<li>').attr('data-value', item.value)
                        .append(`<div class="vp-ds-item">${item.label}<label class="vp-gray-text vp-cursor">&nbsp;| ${item.dtype}</label></div>`)
                        .appendTo(ul);
            };
        }

        _bindEventForPopup() {
            let that = this;

            // Click X to close
            $(this.wrapSelector('.vp-inner-popup-close')).on('click', function() {
                that.close();
            });

            // Click cancel
            $(this.wrapSelector('#vp_dsCancel')).on('click', function() {
                that.close();
            });

            // Click ok
            $(this.wrapSelector('#vp_dsOk')).on('click', function() {
                // set target value
                let newValue = that.generateCode();

                $(that._target).val(newValue);
                $(that._target).data('type', that.state.dataType);
                that.prop.finish(newValue);
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

                $(that._target).val(newValue);
                $(that._target).data('type', that.state.dataType);
                that.prop.finish(newValue);
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
                // re-mapping variable list
                varList = varList.map(obj => { 
                    return {
                        label: obj.varName, 
                        value: obj.varName,
                        dtype: obj.varType
                    }; 
                });

                that._varList = varList;



                that.renderVariables(varList);
                that._bindAutocomplete(varList);

            });
        }

        template() {
            return dataHTML;
        }

        templateForTarget() {
            return `
                <div class="vp-ds-box vp-ds-box-${this.uuid} vp-ds-uninit">
                    <input type="text" class="vp-ds-target vp-input ${this.prop.classes}" id="${this.prop.id}"/>
                    <span class="vp-ds-filter"><img src="/nbextensions/visualpython/img/filter.svg"/></span>
                </div>
            `;
        }

        templateForSlicing() {
            return `
                <div>
                    <label for="slicingStart">Type start/end index for slicing.</label>
                </div>
                <div>
                    <input type="number" class="vp-input vp-state" id="slicingStart" placeholder="Start value"/>
                    <input type="number" class="vp-input vp-state" id="slicingEnd" placeholder="End value"/>
                </div>
            `;
        }

        templateForKeyPicker() {
            return `
                <div>
                    <label>Type or select key from dictionary.</label>
                </div>
                <div>
                    <input type="text" class="vp-input vp-state" id="dictKey" placeholder="Type key"/>
                </div>
            `
        }

        render() {
            ;
        }

        /** Render popup on clicking filter button */
        renderPopup() {
            super.render();
            this.loadVariables();
            this._bindEventForPopup();

            //TODO:

        }

        renderVariables(varList) {
            let varTags = new com_String();
            varList && varList.forEach((obj, idx) => {
                varTags.appendFormatLine('<div class="{0} {1}">', 'vp-ds-var-item', 'vp-grid-col-p50');
                varTags.appendFormatLine('<div class="{0}">{1}</div>', 'vp-ds-var-data', obj.label);
                varTags.appendFormatLine('<div class="{0}">{1}</div>', 'vp-ds-var-type', obj.dtype);
                varTags.appendLine('</div>');
            });
            $(this.wrapSelector('.vp-ds-variable-box')).html(varTags.toString());

            this._bindEventForItem();
        }

        renderOptionPage() {
            // initialize page and variables
            $(this.wrapSelector('.vp-ds-option-inner-box')).html('');
            this._columnSelector = null;

            switch (this.state.dataType) {
                case 'DataFrame':
                    // column selecting
                    this._columnSelector = new MultiSelector(this.wrapSelector('.vp-ds-option-inner-box'),
                        { mode: 'columns', parent: [this.state.data] }
                    );  
                    break;
                case 'Series':
                case 'list':
                case 'ndarray':
                    // slicing
                    $(this.wrapSelector('.vp-ds-option-inner-box')).html(this.templateForSlicing());
                    break;
                case 'dict':
                    // key picker
                    $(this.wrapSelector('.vp-ds-option-inner-box')).html(this.templateForKeyPicker());
                    break;
                default:
                    break;
            }
        }

        toTagString() {
            return this.templateForTarget();
        }

        generateCode() {
            let { data, dataType } = this.state;
            let code = new com_String();

            switch (dataType) {
                case 'DataFrame':
                    code.append(data);
                    if (this._columnSelector != null) {
                        let result = this._columnSelector.getDataList();
                        let columnList = [];
                        result && result.forEach(obj => {
                            columnList.push(obj.code);
                        });
                        if (columnList.length > 0) {
                            code.appendFormat('[[{0}]]', columnList.join(', '));
                        }
                    }
                    break;
                case 'Series':
                case 'list':
                case 'ndarray':
                    code.append(data);
                    // start / end value
                    let start = $(this.wrapSelector('#slicingStart')).val();
                    let end = $(this.wrapSelector('#slicingEnd')).val();
                    if ((start && start != '') || (end && end != '')) {
                        code.appendFormat('[{0}:{1}]', start, end);
                    }
                    break;
                case 'dict':
                    code.append(data);
                    let dictKey = $(this.wrapSelector('#dictKey')).val();
                    if (dictKey && dictKey != '') {
                        code.appendFormat("['{0}']", dictKey);
                    }
                    break;
                default:
                    code.append(data);
                    break;
            }
            return code.toString();
        }

        open() {
            this.renderPopup();
            $(this.wrapSelector()).show();
        }

        close() {
            $(this.wrapSelector()).remove();
        }

    }

    return DataSelector;

});