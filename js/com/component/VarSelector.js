define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
], function(com_String, com_util) {

    const VP_VS_BOX = 'vp-vs-box';
    const VP_VS_DATA_TYPE = 'vp-vs-data-type';
    const VP_VS_VARIABLES = 'vp-vs-variables';
    const VP_VS_TYPING_INPUT = 'vp-vs-typing-input';  
  
    /**
     * @class VarSelector
     * @param {Array} dataTypes
     * @param {String} defaultType
     * @constructor
     * 
     * using sample:
        var varSelector = new vpVarSelector(this, ['DataFrame', 'Series'], 'DataFrame');
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

            this.typeClass = [];
            this.varClass = [];

            this.dataTypes = dataTypes;
            if (defaultType == '') {
                if (dataTypes.length > 0) {
                    defaultType = dataTypes[0];
                } else {
                }
            }
            this.state = {
                selectedType: defaultType,
                varList: []
            };

            this.defaultType = defaultType;
            this.defaultValue = '';

            this.showOthers = showOthers;
            this.useTyping = useTyping;

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
        addAttribute(key, value) {
            this.attributes.push({ [key]: value });
        }
        setValue(value) {
            this.defaultValue = value;
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
                    this.defaultType == v ? 'selected' : '', v);
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
            if (this.state.selectedType == 'others') {
                filteredList = varList.filter(v => !this.dataTypes.includes(v.varType));
            } else if (this.state.selectedType == 'typing') {
                filteredList = [];
            } else {
                filteredList = varList.filter(v => v.varType == this.state.selectedType);
            }

            // replace
            $(this.wrapSelector('.' + VP_VS_VARIABLES)).replaceWith(function () {
                return that.renderVariableList(filteredList);
            });
            $(this.wrapSelector('.' + VP_VS_VARIABLES)).trigger('change');
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
            });
        }
    }

    return VarSelector;
})