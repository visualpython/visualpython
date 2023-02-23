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
    __VP_TEXT_LOADER__('vp_base/html/component/dataSelector.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/component/dataSelector'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/Component',
    'vp_base/js/com/component/MultiSelector'
], function(dataHTML, dataCss, com_Const, com_String, com_util, Component, MultiSelector) {
    //========================================================================
    // [CLASS] DataSelector
    // Usage:
    // let dataSelector = new DataSelector({
    //     type: 'data',
    //     pageThis: this,
    //     id: 'targetId',
    //     classes: '',
    //     placeholder: '',
    //     select: function(value, dtype) {
    //         ;
    //     }
    //     finish: function(value, dtype) {
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
            super($('body'), {}, prop);
        }

        _init() {
            super._init();

            this.prop = {
                type: 'data',   // selector type : data / column
                pageThis: null, // target's page object
                id: '',         // target id
                value: null,    // pre-defined value
                finish: null,   // callback after selection
                select: null,   // callback after selection from suggestInput
                allowDataType: null,
                // additional options
                classes: '',
                placeholder: 'Select variable',
                required: false,
                ...this.prop
            }

            // If null, define default allow data type
            if (!this.prop.allowDataType) {
                // default allow data types
                this.prop.allowDataType = [
                    'DataFrame', 'Series', 'ndarray', 'list', 'dict'
                ]
            }

            this.state = {
                filterType: 'All',
                data: '',
                dataType: '',
                returnDataType: '',
                dataInfo: '',
                slicingStart1: '',
                slicingEnd1: '',
                slicingStart2: '',
                slicingEnd2: '',
                ndRowType: 'slicing',
                ndColType: 'slicing',
                useIndex: false,
                indexing: [],
                rowIndexing: [],
                colIndexing: [],
                dictKey: '',
                ...this.state
            }

            this._target = null;
            if (this.prop.pageThis) {
                this._target = this.prop.pageThis.wrapSelector('#' + this.prop.id);
            }

            this._columnSelector = null;
            this._ndRowSelector = null;
            this._ndColSelector = null;

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
                $(that.prop.pageThis.wrapSelector()).on('click', com_util.formatString('.vp-ds-box-{0} .vp-ds-filter', that.uuid), function(evt) {
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
                $(that.prop.pageThis.wrapSelector()).on('click', com_util.formatString('.vp-ds-box-{0} .vp-ds-filter', that.uuid), function(evt) {
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

                    that.state.filterType = 'All';
                    that.state.data = ui.item.value;
                    that.state.dataType = ui.item.dtype;
                    that.state.returnDataType = ui.item.dtype;

                    that.prop.pageThis.state[that.prop.id] = ui.item.value;
                    that.prop.pageThis.state[that.prop.id + '_state'] = that.state;

                    // select event
                    if (that.prop.select && typeof that.prop.select == 'function') {
                        result = that.prop.select(ui.item.value, ui.item.dtype);
                    }
                    $(this).trigger('change');

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
                        .append(`<div class="vp-sg-item">${item.label}<label class="vp-gray-text vp-cursor">&nbsp;| ${item.dtype}</label></div>`)
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
                that.setValue();
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
                that.state.filterType = type;
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
                that.state.returnDataType = dataType;

                // render option page
                that.renderOptionPage();
            }, function(evt) {
                // double click to select directly
                let data = $(this).text();
                let dataType = $(this).data('type');
                that.state.data = data;
                that.state.dataType = dataType;
                that.state.returnDataType = dataType;

                that.setValue();
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
                if (varList && varList.length > 0 && that.state.data == '') {
                    that.state.data = varList[0].value;
                    that.state.dataType = varList[0].dtype;
                    that.state.returnDataType = varList[0].dtype;
                }
                
                that.renderDataBox(varList);
                that._bindAutocomplete(varList);

            });
        }

        template() {
            return dataHTML;
        }

        templateForTarget() {
            let value = this.prop.value;
            if (value == undefined) {
                value = this.prop.pageThis.state[this.prop.id] || '';
            }
            return `
                <div class="vp-ds-box vp-ds-box-${this.uuid} vp-ds-uninit">
                    <input type="text" class="vp-ds-target vp-input vp-state ${this.prop.classes}" 
                            id="${this.prop.id}" value="${value}" 
                            placeholder="${this.prop.placeholder}" ${this.prop.required?'required="required"':''}/>
                    <span class="vp-ds-filter">
                    <!-- LAB: img to url -->
                    <!-- <img src="${com_Const.IMAGE_PATH}filter.svg"/> -->
                    </span>
                </div>
            `;
        }

        templateForMultiSelector() {
            return `
                <div class="vp-ds-df-option-box">
                    <label><input type="checkbox" id="useIndex" class="vp-state" ${this.state.useIndex===true?'checked':''}/> <span>Use Index</span></label>
                    <div class="vp-ds-df-multiselector" ${this.state.useIndex===true?'style="display:none;"':''}>
                    </div>
                    <div class="vp-ds-df-index-box" ${this.state.useIndex===false?'style="display:none;"':''}>
                        <div style="height:100%;"><label>Index selected.</label>
                            <div class="vp-cs-select-container no-selection">
                                <div class="vp-cs-select-left">
                                    <input type="text" class="vp-input wp100" placeholder="Search" value="" readonly>
                                    <div class="vp-cs-select-box left vp-cs-droppable no-selection vp-scrollbar">
                                    </div>
                                </div>
                                <div class="vp-cs-select-btn-box">
                                <!-- 
                                    <button type="button" class="vp-cs-select-add-all-btn" title="Add all items"><img src="${com_Const.IMAGE_PATH}arrow_right_double.svg"></button>
                                    <button type="button" class="vp-cs-select-add-btn" title="Add selected items"><img src="${com_Const.IMAGE_PATH}arrow_right.svg"></button>
                                    <button type="button" class="vp-cs-select-del-btn" title="Remove selected items"><img src="${com_Const.IMAGE_PATH}arrow_left.svg"></button>
                                    <button type="button" class="vp-cs-select-del-all-btn" title="Remove all items"><img src="${com_Const.IMAGE_PATH}arrow_left_double.svg"></button> 
                                -->
                                <!-- LAB: img to url -->
                                    <button type="button" class="vp-cs-select-add-all-btn" title="Add all items"><div class="vp-icon-arrow-right-double"></div></button>
                                    <button type="button" class="vp-cs-select-add-btn" title="Add selected items"><div class="vp-icon-arrow-right"></div></button>
                                    <button type="button" class="vp-cs-select-del-btn" title="Remove selected items"><div class="vp-icon-arrow-left"></div></button>
                                    <button type="button" class="vp-cs-select-del-all-btn" title="Remove all items"><div class="vp-icon-arrow-left-double"></div></button>
                                </div>
                                <div class="vp-cs-select-right">
                                    <div class="vp-cs-select-box right vp-cs-droppable no-selection vp-scrollbar ui-droppable">
                                        <div class="vp-cs-select-item">
                                            <span>index</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }

        templateForSlicing() {
            return `
                <div>
                    <label for="slicingStart1">Type start/end index for slicing.</label>
                </div>
                <div>
                    <input type="number" class="vp-input vp-state" id="slicingStart1" placeholder="Start value" value="${this.state.slicingStart1}"/>
                    <input type="number" class="vp-input vp-state" id="slicingEnd1" placeholder="End value" value="${this.state.slicingEnd1}"/>
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
                                <input type="number" class="vp-input m vp-state" id="slicingStart1" placeholder="Start value" value="${this.state.slicingStart1}"/>
                                <input type="number" class="vp-input m vp-state" id="slicingEnd1" placeholder="End value" value="${this.state.slicingEnd1}"/>
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
                                <input type="number" class="vp-input m vp-state" id="slicingStart2" placeholder="Start value" value="${this.state.slicingStart2}"/>
                                <input type="number" class="vp-input m vp-state" id="slicingEnd2" placeholder="End value" value="${this.state.slicingEnd2}"/>
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
            // load state
            let state = this.prop.pageThis.state[this.prop.id + '_state'];
            if (state) {
                this.state = {
                    ...this.state,
                    ...state
                }
            }

            super.render();

            this.loadVariables();
            this._bindEventForPopup();

            // if (this.state.data != '') {
            //     this.renderOptionPage();
            // }
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

            // focus on selected item
            let selectedTag = $(this.wrapSelector('.vp-ds-type-item.selected')).get(0);
            selectedTag && selectedTag.scrollIntoView();

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

            // focus on selected item
            let selectedTag = $(this.wrapSelector('.vp-ds-var-item.selected')).get(0);
            selectedTag && selectedTag.scrollIntoView();

            this.renderOptionPage();
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
                    // render option page
                    $(this.wrapSelector('.vp-ds-option-inner-box')).html(this.templateForMultiSelector());
                    // column selecting
                    this._columnSelector = new MultiSelector(this.wrapSelector('.vp-ds-df-multiselector'),
                        { mode: 'columns', parent: [data], selectedList: this.state.indexing, allowAdd: true }
                    );

                    // bind event
                    $(this.wrapSelector('#useIndex')).on('change', function() {
                        let checked = $(this).prop('checked');
                        that.state.useIndex = checked;
                        if (checked === true) {
                            $(that.wrapSelector('.vp-ds-df-multiselector')).hide();
                            $(that.wrapSelector('.vp-ds-df-index-box')).show();
                        } else {
                            $(that.wrapSelector('.vp-ds-df-multiselector')).show();
                            $(that.wrapSelector('.vp-ds-df-index-box')).hide();
                        }
                    });
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
                            { mode: 'ndarray0', parent: [data], selectedList: this.state.rowIndexing }
                        );
                        this._ndColSelector = new MultiSelector(this.wrapSelector('.vp-nd-col-box.indexing'),
                            { mode: 'ndarray1', parent: [data], selectedList: this.state.colIndexing }
                        );
                        $(this.wrapSelector('.vp-nd-row-box')).hide();
                        $(this.wrapSelector('.vp-nd-col-box')).hide();
                        $(this.wrapSelector('.vp-nd-row-box.' + this.state.ndRowType)).show();
                        $(this.wrapSelector('.vp-nd-col-box.' + this.state.ndColType)).show();

                        // bind event
                        $(this.wrapSelector('#ndRowType')).on('change', function() {
                            that.state.ndRowType = $(this).val();
                            $(that.wrapSelector('.vp-nd-row-box')).hide();
                            $(that.wrapSelector('.vp-nd-row-box.' + that.state.ndRowType)).show();
                        });
                        $(this.wrapSelector('#ndColType')).on('change', function() {
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

        setValue() {
            let newValue = this.generateCode();
            $(this._target).val(newValue);
            $(this._target).data('type', this.state.returnDataType);
            // set pageThis.state
            this.prop.pageThis.state[this.prop.id + '_state'] = this.state;
            $(this._target).change();

            if (this.prop.finish && typeof this.prop.finish == 'function') {
                this.prop.finish(newValue, this.state.returnDataType);
            }            
        }

        generateCode() {
            // save state
            this._saveState();

            // get states
            let {
                data, dataType,
                useIndex,
                slicingStart1, slicingEnd1,
                slicingStart2, slicingEnd2,
                ndRowType, ndColType
            } = this.state;
            let code = new com_String();

            switch (dataType) {
                case 'DataFrame':
                    code.append(data);
                    if (useIndex === true) {
                        // use index
                        code.append('.index');
                    } else {
                        // use column selector
                        if (this._columnSelector != null) {
                            let result = this._columnSelector.getDataList();
                            this.state.indexing = result.map(obj => obj.code); // save state
                            let columnList = [];
                            result && result.forEach(obj => {
                                columnList.push(obj.code);
                            });
                            if (columnList.length > 0) {
                                if (columnList.length == 1) {
                                    // return as Series
                                    code.appendFormat('[{0}]', columnList.join(', '));
                                    // change datatype to Series
                                    this.state.returnDataType = 'Series';
                                } else {
                                    code.appendFormat('[[{0}]]', columnList.join(', '));
                                }
                            }
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
                            this.state.rowIndexing = result.map(obj => obj.code); // save state
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
                            this.state.colIndexing = result.map(obj => obj.code); // save state
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
                        // return datatype to ...
                        this.state.returnDataType = 'str'; // FIXME: get dict's key value
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