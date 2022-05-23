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
                allowDataType: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], // default allow data types
                // additional options
                classes: '',
                ...this.prop
            }

            this.state = {
                filterType: 'All',
                data: '',
                dataType: '',
                dataInfo: '',
                slicingStart1: '',
                slicingEnd1: '',
                slicingStart2: '',
                slicingEnd2: '',
                ndRowType: 'slicing',
                ndColType: 'slicing',
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
                    $(this).data('type', ui.item.dtype);
                    $(this).trigger('change');

                    // select event
                    if (typeof that.prop.select == "function") {
                        result = that.prop.select(ui.item.value, ui.item);
                    }
                    if (result != undefined) {
                        return result;
                    }
                    return true;
                },
                search: function(evt, ui) {
                    return true;
                }
            }).focus(function () {
                $(this).val('');
                $(this).autocomplete('search', $(this).val());
            }).click(function () {
                $(this).val('');
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

            // Click data type item
            $(that.wrapSelector('.vp-ds-type-item')).off('click');
            $(that.wrapSelector('.vp-ds-type-item')).on('click', function() {
                $(that.wrapSelector('.vp-ds-type-item')).removeClass('selected');
                $(this).addClass('selected');

                let type = $(this).data('type');
                if (type == 'All') {
                    that.renderVariableBox(that._varList);
                } else if (type == 'Others') {
                    that.renderVariableBox(that._varList.filter(obj => !that.prop.allowDataType.includes(obj.dtype)));
                } else {
                    // filter variable list
                    that.renderVariableBox(that._varList.filter(obj => obj.dtype == type));
                }

            });

            // Click variable item
            $(that.wrapSelector('.vp-ds-var-item')).off('click');
            // $(that.wrapSelector('.vp-ds-var-item')).on('click', function() {
            $(that.wrapSelector('.vp-ds-var-item')).single_double_click(function(evt) {
                // single click
                $(that.wrapSelector('.vp-ds-var-item')).removeClass('selected');
                $(this).addClass('selected');

                let data = $(this).text();
                let dataType = $(this).data('type');
                that.state.data = data;
                that.state.dataType = dataType;

                // render option page
                that.renderOptionPage();
            }, function(evt) {
                // double click to select directly
                let data = $(this).text();
                let dataType = $(this).data('type');
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
                        dtype: obj.varType,
                        info: obj.varInfo
                    }; 
                });

                that._varList = varList;
                
                that.renderDataBox(varList);
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
                    <label for="slicingStart1">Type start/end index for slicing.</label>
                </div>
                <div>
                    <input type="number" class="vp-input vp-state" id="slicingStart1" placeholder="Start value"/>
                    <input type="number" class="vp-input vp-state" id="slicingEnd1" placeholder="End value"/>
                </div>
            `;
        }

        templateFor2darray() {
            return `
                <div class="vp-grid-col-p50" style="grid-column-gap: 5px;">
                    <div>
                        <label class="w50">Row</label>
                        <select id="ndRowType" class="vp-select vp-state">
                            <option value="slicing">Slicing</option>
                            <option value="indexing">Indexing</option>
                        </select>
                        <div class="vp-nd-row-box slicing">
                            <div>
                                <label for="slicingStart1">Type start/end index for slicing.</label>
                            </div>
                            <div>
                                <input type="number" class="vp-input m vp-state" id="slicingStart1" placeholder="Start value"/>
                                <input type="number" class="vp-input m vp-state" id="slicingEnd1" placeholder="End value"/>
                            </div>
                        </div>
                        <div class="vp-nd-row-box indexing">
                        </div>
                    </div>
                    <div>
                        <label class="w50">Column</label>
                        <select id="ndColType" class="vp-select vp-state">
                            <option value="slicing">Slicing</option>
                            <option value="indexing">Indexing</option>
                        </select>
                        <div class="vp-nd-col-box slicing">
                            <div>
                                <label for="slicingStart2">Type start/end index for slicing.</label>
                            </div>
                            <div>
                                <input type="number" class="vp-input m vp-state" id="slicingStart2" placeholder="Start value"/>
                                <input type="number" class="vp-input m vp-state" id="slicingEnd2" placeholder="End value"/>
                            </div>
                        </div>
                        <div class="vp-nd-col-box indexing">
                        </div>
                    </div>
                </div>
            `
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
        }

        renderDataBox(varList) {
            let that = this;
            let varTags = new com_String();
            let types = [
                'All',
                ...this.prop.allowDataType,
                'Others'
            ];
            // Add Data Types to filter
            types && types.forEach(type => {
                varTags.appendFormatLine('<div class="{0} {1}" data-type="{2}">{3}</div>'
                    , 'vp-ds-type-item', (that.state.filterType == type? 'selected': ''), type, type);
            });
            $(this.wrapSelector('.vp-ds-type-box')).html(varTags.toString());

            this.renderVariableBox(varList);
        }

        renderVariableBox(varList) {
            let that = this;
            let varTags = new com_String();
            varTags = new com_String();
            varList && varList.forEach((obj, idx) => {
                varTags.appendFormatLine('<div class="{0} {1}" title="{2}" data-type="{3}">{4}</div>'
                    , 'vp-ds-var-item', (that.state.data == obj.value?'selected':''), obj.dtype, obj.dtype, obj.label);
            });
            $(this.wrapSelector('.vp-ds-variable-box')).html(varTags.toString());

            this._bindEventForItem();
        }

        renderOptionPage() {
            let that = this;

            // initialize page and variables
            $(this.wrapSelector('.vp-ds-option-inner-box')).html('');
            this._columnSelector = null;

            let { data, dataType } = this.state;

            switch (dataType) {
                case 'DataFrame':
                    // column selecting
                    this._columnSelector = new MultiSelector(this.wrapSelector('.vp-ds-option-inner-box'),
                        { mode: 'columns', parent: [data] }
                    );
                    break;
                case 'Series':
                case 'list':
                case 'ndarray':
                    // check it's ndim
                    let ndim = 0;
                    try {
                        ndim = this._varList.filter(obj => obj.value==data)[0]['info']['ndim'];
                    } catch { ; }
                    if (ndim == 2) {
                        // 1d 2d page
                        $(this.wrapSelector('.vp-ds-option-inner-box')).html(this.templateFor2darray());
                        $(this.wrapSelector('#ndRowType')).val(this.state.ndRowType);
                        $(this.wrapSelector('#ndColType')).val(this.state.ndColType);
                        this._ndRowSelector = new MultiSelector(this.wrapSelector('.vp-nd-row-box.indexing'),
                            { mode: 'ndarray0', parent: [data] }
                        );
                        this._ndColSelector = new MultiSelector(this.wrapSelector('.vp-nd-col-box.indexing'),
                            { mode: 'ndarray1', parent: [data] }
                        );
                        $(this.wrapSelector('.vp-nd-row-box')).hide();
                        $(this.wrapSelector('.vp-nd-col-box')).hide();
                        $(this.wrapSelector('.vp-nd-row-box.' + this.state.ndRowType)).show();
                        $(this.wrapSelector('.vp-nd-col-box.' + this.state.ndColType)).show();

                        // bind event
                        $(this.wrapSelector('#ndRowType')).change(function() {
                            that.state.ndRowType = $(this).val();
                            $(that.wrapSelector('.vp-nd-row-box')).hide();
                            $(that.wrapSelector('.vp-nd-row-box.' + that.state.ndRowType)).show();
                        });
                        $(this.wrapSelector('#ndColType')).change(function() {
                            that.state.ndColType = $(this).val();
                            $(that.wrapSelector('.vp-nd-col-box')).hide();
                            $(that.wrapSelector('.vp-nd-col-box.' + that.state.ndColType)).show();
                        });

                    } else {
                        // slicing
                        $(this.wrapSelector('.vp-ds-option-inner-box')).html(this.templateForSlicing());
                    }
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

        /**
         * simple version of _saveSingleState()
         */
        _saveState() {
            let that = this;
            $(this.wrapSelector('.vp-state')).each((idx, tag) => {
                let id = tag.id;
                let tagName = $(tag).prop('tagName'); // returns with UpperCase
                let newValue = '';
                switch(tagName) {
                    case 'INPUT':
                        let inputType = $(tag).prop('type');
                        if (inputType == 'checkbox') {
                            newValue = $(tag).prop('checked');
                        } else {
                            // inputType == 'text' || inputType == 'number' || inputType == 'hidden' || inputType == 'color' || inputType == 'range'
                            newValue = $(tag).val();
                        }
                        break;
                    case 'TEXTAREA':
                    case 'SELECT':
                    default:
                        newValue = $(tag).val();
                        if (!newValue) {
                            newValue = '';
                        }
                        break;
                }

                // save state
                that.state[id] = newValue;
            }); 
        }

        generateCode() {
            // save state
            this._saveState();

            // get states
            let {
                data, dataType,
                slicingStart1, slicingEnd1,
                slicingStart2, slicingEnd2,
                ndRowType, ndColType
            } = this.state;
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
                    code.append(data);
                    // start / end value
                    if ((slicingStart1 && slicingStart1 != '') || (slicingEnd1 && slicingEnd1 != '')) {
                        code.appendFormat('[{0}:{1}]', slicingStart1, slicingEnd1);
                    }
                    break;
                case 'ndarray':
                    code.append(data);
                    let ndim = 0;
                    try {
                        ndim = this._varList.filter(obj => obj.value==data)[0]['info']['ndim'];
                    } catch { ; }
                    if (ndim == 2) {
                        let rowCode = '';
                        let colCode = '';
                        if (ndRowType == 'slicing') {
                            // slicing start / end value
                            if ((slicingStart1 && slicingStart1 != '') || (slicingEnd1 && slicingEnd1 != '')) {
                                rowCode = com_util.formatString('{0}:{1}', slicingStart1, slicingEnd1);
                            }
                        } else {
                            // indexing
                            let result = this._ndRowSelector.getDataList();
                            let rowList = [];
                            result && result.forEach(obj => {
                                rowList.push(obj.code);
                            });
                            if (rowList.length > 0) {
                                if (rowList.length == 1) {
                                    rowCode = com_util.formatString('{0}', rowList.join(', '));
                                } else {
                                    rowCode = com_util.formatString('({0})', rowList.join(', '));
                                }
                            }
                        }
                        if (ndColType == 'slicing') {
                            // slicing start / end value
                            if ((slicingStart2 && slicingStart2 != '') || (slicingEnd2 && slicingEnd2 != '')) {
                                colCode = com_util.formatString('{0}:{1}', slicingStart2, slicingEnd2);
                            }
                        } else {
                            // indexing
                            let result = this._ndColSelector.getDataList();
                            let columnList = [];
                            result && result.forEach(obj => {
                                columnList.push(obj.code);
                            });
                            if (columnList.length > 0) {
                                if (columnList.length == 1) {
                                    colCode = com_util.formatString('{0}', columnList.join(', '));
                                } else {
                                    colCode = com_util.formatString('({0})', columnList.join(', '));
                                }
                            }
                        }
                        // merge rowCode and colCode
                        if (rowCode != '' || colCode != '') {
                            if (rowCode == '' && colCode != '') {
                                rowCode = ':'
                            }
                            code.appendFormat('[{0},{1}]', rowCode, colCode);
                        }
                    } else {
                        // start / end value
                        if ((slicingStart1 && slicingStart1 != '') || (slicingEnd1 && slicingEnd1 != '')) {
                            code.appendFormat('[{0}:{1}]', slicingStart1, slicingEnd1);
                        }
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