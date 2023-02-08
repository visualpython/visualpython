define([
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
], function(com_Const, com_String, com_util) {

    const VP_VS_BOX = 'vp-vs-box';
    const VP_VS_DATA_TYPE = 'vp-vs-data-type';
    const VP_VS_VARIABLES = 'vp-vs-variables';
    const VP_VS_TYPING_INPUT = 'vp-vs-typing-input';  
    const VP_VS_COLUMN_INPUT = 'vp-vs-column-input';
    const VP_VS_REFRESH = 'vp-vs-refresh';

    /**
     * @class VarSelector
     * @param {Array} dataTypes
     * @param {String} defaultType
     * @constructor
     * 
     * using sample:
        var varSelector = new VarSelector(['DataFrame', 'Series'], 'DataFrame');
        $(this.wrapSelector('.vp-vs-tester')).html(varSelector.render());
     */
    class VarSelector {
        constructor(dataTypes, defaultType = '', showOthers = true, useTyping = true) {
            this.uuid = 'u' + com_util.getUUID();
            this.label = {
                'others': 'Others',
                'typing': 'Typing'
            };

            this.boxClass = [];

            this.id = '';
            this.class = [];
            this.attributes = {};

            this.typeClass = []; // type selector class
            this.varClass = [];  // variable selector class
            this.colClass = [];  // column selector class

            this.dataTypes = dataTypes;
            if (defaultType == '') {
                if (dataTypes.length > 0) {
                    defaultType = dataTypes[0];
                } else {
                }
            }
            this.state = {
                selectedType: defaultType,
                varList: [],
                column: ''
            };

            this.defaultType = defaultType;
            this.defaultValue = '';
            this.defaultColumn = '';

            this.showOthers = showOthers;
            this.useTyping = useTyping;
            this.useColumn = false;

            this.reload();
            this.bindEvent();
        }
        setComponentId(id) {
            this.id = id;
        }
        addBoxClass(classname) {
            this.boxClass.push(classname);
        }
        addClass(classname) {
            this.class.push(classname);
        }
        addTypeClass(classname) {
            this.typeClass.push(classname);
        }
        addVarClass(classname) {
            this.varClass.push(classname);
        }
        addColClass(classname) {
            this.colClass.push(classname);
        }
        addAttribute(key, value) {
            this.attributes.push({ [key]: value });
        }
        setValue(value) {
            if (value == null || value == undefined) {
                value = '';
            }
            this.defaultValue = value;
            if (value.includes('[') && value.includes(']') ) {
                // divide it to variable / column
                let startIdx = value.indexOf('[');
                let endIdx = value.indexOf(']');
                this.defaultValue = value.substring(0, startIdx);
                this.defaultColumn = value.substring(startIdx + 1, endIdx);
            }
        }
        setState(newState) {
            this.state = {
                ...this.state,
                ...newState
            }
        }
        setUseColumn(useColumn) {
            this.useColumn = useColumn;
        }
        wrapSelector(selector = '') {
            return com_util.formatString('.{0} {1}', this.uuid, selector);
        }
        render(defaultType = this.defaultType, defaultValue = this.defaultValue) {
            var tag = new com_String();

            // var selector box
            tag.appendFormatLine('<div class="{0} {1} {2}">', VP_VS_BOX, this.uuid, this.boxClass.join(' '));

            // // hidden input value
            // tag.appendFormatLine('<input type="hidden" {0} />', 
            //                     this.attributes.id? 'id="' + this.attributes.id + '"': '');
            // data type selector
            tag.appendFormatLine('<select class="{0} {1} {2}">', VP_VS_DATA_TYPE, 'vp-select m', this.typeClass.join(' '));
            this.dataTypes.forEach((v, i) => {
                tag.appendFormatLine('<option value="{0}" {1}>{2}</option>', v,
                    defaultType == v ? 'selected' : '', v);
            });
            if (this.showOthers) {
                tag.appendFormatLine('<option value="{0}">{1}</option>', 'others', this.label.others);
            }
            if (this.useTyping) {
                tag.appendFormatLine('<option value="{0}">{1}</option>', 'typing', this.label.typing);
            }
            tag.appendLine('</select>'); // VP_VS_DATA_TYPE


            // variable selctor
            tag.appendLine(this.renderVariableList(this.state.varList));

            var attrStr = Object.keys(this.attributes).map(key => key + '="' + this.attributes[key] + '"').join(' ');

            // typing
            tag.appendFormatLine('<input type="text" class="{0} {1} {2}" placeholder="{3}" style="display: none;" {4} value="{5}" data-type="{6}" {7}/>',
                VP_VS_TYPING_INPUT, 'vp-input m', this.class.join(' '),
                'Type your code',
                this.id ? 'id="' + this.id + '"' : '',
                defaultValue,
                defaultType,
                attrStr);

            // column for dataframe
            tag.appendFormatLine('<select class="{0} {1} {2}" {3}></select>', 
                VP_VS_COLUMN_INPUT, 'vp-select m', this.colClass.join(' '),
                (this.useColumn == true && defaultType == 'DataFrame'?'':'style="display: none;"'));

            // reload
            // LAB: img to url
            // tag.appendFormatLine('<span class="{0} vp-cursor" title="{1}"><img src="{2}"></span>',
            //                     VP_VS_REFRESH, 'Refresh variables', com_Const.IMAGE_PATH + 'refresh.svg');
            tag.appendFormatLine('<span class="{0} vp-cursor vp-icon-refresh" title="{1}"></span>',
                                VP_VS_REFRESH, 'Refresh variables');

            tag.appendLine('</div>'); // VP_VS_BOX
            return tag.toString();
        }
        reload() {
            var that = this;
            // load using kernel
            var dataTypes = this.showOthers ? [] : this.dataTypes;
            vpKernel.getDataList(dataTypes).then(function (resultObj) {
                try {
                    let { result, type, msg } = resultObj;
                    var varList = JSON.parse(result);
                    that.state.varList = varList;
                    // render variable list
                    that.loadVariableList(varList);
                } catch (ex) {
                    // console.log(ex);
                }
            });
        }
        renderVariableList(varList) {
            var tag = new com_String();
            tag.appendFormatLine('<select class="{0} {1} {2}" {3}>', VP_VS_VARIABLES, 'vp-select m', this.varClass.join(' '),
                this.state.selectedType == 'typing' ? 'style="display:none;"' : '');
            varList.forEach(vObj => {
                // varName, varType
                var label = vObj.varName;
                if (this.state.selectedType == 'others') {
                    label += com_util.formatString(' ({0})', vObj.varType);
                }
                tag.appendFormatLine('<option value="{0}" data-type="{1}" {2}>{3}</option>',
                    vObj.varName, vObj.varType,
                    this.defaultValue == vObj.varName ? 'selected' : '',
                    label);
            });
            tag.appendLine('</select>'); // VP_VS_VARIABLES
            return tag.toString();
        }
        loadVariableList(varList) {
            var filteredList = varList;
            var that = this;
            let dataTypes = this.dataTypes;
            // Include various index types for Index type
            var INDEX_TYPES = ['RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'];
            // Include various groupby types for Groupby type
            var GROUPBY_TYPES = ['DataFrameGroupBy', 'SeriesGroupBy']
            if (dataTypes.indexOf('Index') >= 0) {
                dataTypes = dataTypes.concat(INDEX_TYPES);
            }
            if (dataTypes.indexOf('GroupBy') >= 0) {
                dataTypes = dataTypes.concat(GROUPBY_TYPES);
            }

            if (this.state.selectedType == 'others') {
                filteredList = varList.filter(v => !dataTypes.includes(v.varType));
            } else if (this.state.selectedType == 'typing') {
                filteredList = [];
            } else {
                let filterDataTypes = [ this.state.selectedType ];
                if (filterDataTypes.indexOf('Index') >= 0) {
                    filterDataTypes = filterDataTypes.concat(INDEX_TYPES);
                }
                if (filterDataTypes.indexOf('GroupBy') >= 0) {
                    filterDataTypes = filterDataTypes.concat(GROUPBY_TYPES);
                }

                filteredList = varList.filter(v => filterDataTypes.includes(v.varType));
            }

            // replace
            $(this.wrapSelector('.' + VP_VS_VARIABLES)).replaceWith(function () {
                return that.renderVariableList(filteredList);
            });
            $(this.wrapSelector('.' + VP_VS_VARIABLES)).trigger('change');
        }
        loadColumnList(varName) {
            let that = this;
            // get result and show on detail box
            vpKernel.getColumnList(varName).then(function(resultObj) {
                try {
                    let { result, type, msg } = resultObj;
                    var varResult = JSON.parse(result);

                    let newTag = new com_String();
                    newTag.appendFormatLine('<select class="{0} {1} {2}" {3}>', 
                        VP_VS_COLUMN_INPUT, 'vp-select m', that.colClass.join(' '),
                        (that.useColumn == true && that.defaultType == 'DataFrame'?'':'style="display: none;"'));
                    newTag.appendFormatLine('<option value="{0}" data-dtype="{1}">{2}</option>',
                        '', '', '');
                    varResult && varResult.forEach(col => {
                        // label, value, dtype, array, location, category
                        newTag.appendFormatLine('<option value="{0}" data-dtype="{1}" {2}>{3}</option>',
                            col.value, col.dtype, 
                            that.defaultColumn == col.value ? 'selected' : '',
                            col.label);
                    });
                    newTag.appendLine('</select>');
                    // replace
                    $(that.wrapSelector('.' + VP_VS_COLUMN_INPUT)).replaceWith(function() {
                        return newTag.toString();
                    });
                } catch (e) {
                    vpLog.display(VP_LOG_TYPE.ERROR, 'varSelector - bindColumnSource: not supported data type. ', e);
                }
            });
        }
        bindEvent() {
            var that = this;
            // data type selection
            $(document).on('change', this.wrapSelector('.' + VP_VS_DATA_TYPE), function (event) {
                // re-renderVariableList
                var dataType = $(this).val();
                that.state.selectedType = dataType;
                if (dataType == 'typing') {
                    $(that.wrapSelector('.' + VP_VS_TYPING_INPUT)).val('');
                    $(that.wrapSelector('.' + VP_VS_TYPING_INPUT)).attr('data-type', '');
                    $(that.wrapSelector('.' + VP_VS_TYPING_INPUT)).show();
                    $(that.wrapSelector('.' + VP_VS_VARIABLES)).hide();
                    $(that.wrapSelector('.' + VP_VS_TYPING_INPUT)).trigger({
                        type: 'var_changed',
                        value: '',
                        dataType: ''
                    });
                } else {
                    $(that.wrapSelector('.' + VP_VS_VARIABLES)).show();
                    $(that.wrapSelector('.' + VP_VS_TYPING_INPUT)).hide();
                    // 1) load variable once
                    that.loadVariableList(that.state.varList);
                    // 2) load on every selection of data types
                    // that.reload();
                }

                if (that.useColumn == true) {
                    if (dataType == 'DataFrame') {
                        $(that.wrapSelector('.' + VP_VS_COLUMN_INPUT)).show();
                    } else {
                        $(that.wrapSelector('.' + VP_VS_COLUMN_INPUT)).hide();
                    }
                } else {
                    $(that.wrapSelector('.' + VP_VS_COLUMN_INPUT)).hide();
                }
            });

            // variable selection
            $(document).on('change', this.wrapSelector('.' + VP_VS_VARIABLES), function (event) {
                var value = $(this).val();
                var dataType = $(this).find('option:selected').attr('data-type');
                $(that.wrapSelector('.' + VP_VS_TYPING_INPUT)).val(value);
                $(that.wrapSelector('.' + VP_VS_TYPING_INPUT)).attr('data-type', dataType);
                $(that.wrapSelector('.' + VP_VS_TYPING_INPUT)).trigger({
                    type: 'var_changed',
                    value: value,
                    dataType: dataType
                });

                // if datatype == dataframe, change column list
                if (that.useColumn == true && dataType == 'DataFrame') {
                    that.loadColumnList(value);
                }
            });

            // column selection
            $(document).on('change', this.wrapSelector('.' + VP_VS_COLUMN_INPUT), function(event) {
                var value = $(that.wrapSelector('.' + VP_VS_VARIABLES)).val();
                var colValue = $(this).val();
                var newValue = value;
                if (colValue != '') {
                    newValue += '[' + colValue + ']';
                }

                var dataType = $(this).find('option:selected').attr('data-type');
                $(that.wrapSelector('.' + VP_VS_TYPING_INPUT)).val(newValue);
                $(that.wrapSelector('.' + VP_VS_TYPING_INPUT)).attr('data-type', dataType);
                $(that.wrapSelector('.' + VP_VS_TYPING_INPUT)).trigger({
                    type: 'var_changed',
                    value: newValue,
                    dataType: 'DataFrame'
                });
            });

            // refresh
            $(document).on('click', this.wrapSelector('.' + VP_VS_REFRESH), function() {
                that.reload();
            });
        }
    }

    return VarSelector;
})