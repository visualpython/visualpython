/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_generator_v2.js
 *    Author          : Black Logic
 *    Note            : Generator for library options
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 12. 17
 *    Change Date     :
 */
define([
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_makeDom',
    'vp_base/js/com/component/SuggestInput'
], function (com_util, com_makeDom, SuggestInput) {
    /**
     * show result after code executed
     */
    var _VP_SHOW_RESULT = true;

    const _VP_COMP_TYPE_LABEL = {
        '1darr': '1D Array',
        '2darr': '2D Array',
        'ndarr': 'ND Array',
        'scalar': 'Scalar Value',
        'param': 'Param Value',
        'dtype': 'Dtype',
    }

    const _VP_NP_DTYPES = [
        {
            name: 'None',
            value: 'None'
        },
        {
            name: 'Int8',
            value: 'np.int8'
        },
        {
            name: 'Int16',
            value: 'np.int16'
        },
        {
            name: 'Int32',
            value: 'np.int32'
        },
        {
            name: 'Int64',
            value: 'np.int64'
        },
        {
            name: 'Intp',
            value: 'np.intp'
        },
        {
            name: 'uInt8',
            value: 'np.uint8'
        },
        {
            name: 'uInt16',
            value: 'np.uint16'
        },
        {
            name: 'uInt32',
            value: 'np.uint32'
        },
        {
            name: 'uInt64',
            value: 'np.uint64'
        },
        {
            name: 'Float16',
            value: 'np.float16'
        },
        {
            name: 'Float32',
            value: 'np.float32'
        },
        {
            name: 'Float64',
            value: 'np.float64'
        },
        {
            name: 'Bool',
            value: 'np.bool'
        },
        {
            name: 'String',
            value: 'np.string_'
        }
    ];

     /**
     * Generate page interface based on package configuration
     * @param {Component} pageThis
     * @param {*} package 
     */
    var vp_showInterfaceOnPage = function(pageThis, package, state={}) {

        // generate input variable tag
        var tblInput = $(pageThis.wrapSelector()+' #vp_inputOutputBox table tbody');
        // generate option variable tag
        var tblOption = $(pageThis.wrapSelector()+' #vp_optionBox table tbody');

        package.options && package.options.forEach(function(o, i) {
            var obj = JSON.parse(JSON.stringify(o));
            let newTag = vp_createTag(pageThis, obj, state);
            if (obj.required) {
                tblInput.append(newTag);
            } else {
                tblOption.append(newTag);
            }
        });

        bindAutoComponentEvent(pageThis);
    }

    /**
     * Generate tag using type
     * @param {String} selector
     * @param {Object} obj 
     * @param {Object} state
     */
    var vp_createTag = function(pageThis, obj, state) {
        // TR tag & TD label tag
        var tblRow = $('<tr></tr>')
        var tblLabel = $('<td></td>');
        var tblContent = $('<td></td>');

        
        let { name, label, component, required } = obj;
        let value = state[name];
        
        var requiredFontStyle = required == true? 'vp-orange-text' : '';
        var lblTag = $(`<label>${label}</label>`).attr({
            'for': name,
            'class': requiredFontStyle,
            'title': '(' + name + ')'
        });
        $(tblLabel).append(lblTag);

        let componentType = 'input';
        if (component) {
            if (component.length == 1) {
                componentType = component[0];
            } else {
                let compSlct = $('<select></select>').attr({
                    'class': 'vp-select vp-state vp-auto-component-selector',
                    'id': name + '_type'
                });
                compSlct.data('obj', obj);
                let defaultCompIdx = 0;
                component.forEach((comp, idx) => {
                    let compLabel = _VP_COMP_TYPE_LABEL[comp];
                    let option = $(`<option>${compLabel}</option>`).attr({
                        'index': idx,
                        'value': comp
                    });
                    // set as previous data 
                    if (state[name + '_type'] != undefined) {
                        // set as saved value
                        if (state[name + '_type'] == comp) {
                            $(option).attr({
                                'selected':'selected'
                            });
                            defaultCompIdx = idx;
                        }
                    }
                    compSlct.append(option);
                });
                tblContent.append(compSlct);
                // set default component type
                componentType = component[defaultCompIdx];
            }
        }
        // render content
        let contentTag = $('<div class="vp-auto-component-content"></div>');
        contentTag.append(renderContent(pageThis, componentType, obj, value, state));
        tblContent.append(contentTag);
        
        tblRow.append(tblLabel);
        tblRow.append(tblContent);
        
        return tblRow;
    }

    var renderContent = function(pageThis, componentType, obj, state={}) {
        let content = '';
        let value = state[obj.name];
        if (value == undefined) {
            value = '';
        }
        // create as component type
        switch (componentType) {
            case '1darr':
                content = render1dArr(pageThis, obj, state);
                break;
            case '2darr':
                content = render2dArr(pageThis, obj, state);
                break;
            case 'ndarr':
                content = renderNdArr(pageThis, obj, state);
                break;
            case 'scalar':
                content = renderScalar(pageThis, obj, state);
                break;
            case 'param':
                content = renderParam(pageThis, obj, state);
                break;
            case 'dtype':
                content = renderDtypeSelector(pageThis, obj, state);
                break;
            case 'tabblock':
                content = renderTabBlock(pageThis, obj, state);
                break;
            case 'bool_checkbox':
                // True False select box
                var select = $(`<select id="${obj.name}" class="vp-select vp-state"><option value="">Default</option></select>`);
                select.append($('<option value="True">True</option>'))
                    .append($('<option value="False">False</option>'));
                content = select;
                break;
            case 'option_select':
                var optSlct = $('<select></select>').attr({
                    'class':'vp-select option-select vp-state',
                    'id':obj.name
                });
                // if required, no default option
                if (required != true) {
                    $(optSlct).append($('<option value="">Default</option>'));
                }
                obj.options.forEach((opt, idx, arr) => {
                    var label = (obj.options_label != undefined? obj.options_label[idx]:opt);
                    var option = $(`<option>${label}</option>`).attr({
                        // 'id':opt,
                        'index':obj.index,
                        'name':obj.name,
                        'value':opt
                    });
                    // cell metadata test
                    if (value != undefined) {
                        // set as saved value
                        if (value == opt) {
                            $(option).attr({
                                'selected':'selected'
                            });
                        }
                    }
                    optSlct.append(option);
                });
                content = optSlct;
                break;
            case 'var_select':
                // suggest input tag
                var tag = $('<input/>').attr({
                    'type': 'text',
                    'id': obj.name,
                    'class': 'vp-input vp-state'
                });
                vp_generateVarSuggestInput(pageThis.wrapSelector(), obj);
                content = tag;
                break;
            case 'var_multi':
                // select tag with multiple selection
                var tag = $('<select></select>').attr({
                    'id': obj.name,
                    'class': 'vp-select var-multi vp-state',
                    // multiple selection true
                    'multiple': true
                });
                vp_generateVarSelect(tag, obj.var_type, obj.value);
                content = tag;
                break;
            case 'col_select':
                var tag = $('<input/>').attr({
                    'type': 'text',
                    'id': obj.name,
                    'class': 'vp-input vp-state'
                });
                content = tag;
                break;
            case 'textarea':
                var textarea = $(`<textarea id="${obj.name}" class="vp-textarea vp-state">${(obj.default==undefined?'':obj.default)}</textarea>`);
                // cell metadata test
                if (value != undefined) {
                    // set as saved value
                    textarea.val(value);
                }
                content = textarea;
                break;
            case 'table':
                // break;
            case 'file':
                // break;
            // default : input_single
            default:
                var input = $('<input/>').attr({
                    'type':'text',
                    'class':'vp-input input-single vp-state',
                    'id':obj.name,
                    'placeholder':(obj.placeholder==undefined?'':obj.placeholder),
                    'value':(obj.default==undefined?'':obj.default),
                    'title':(obj.help==undefined?'':obj.help)
                });
                // cell metadata test
                if (value != undefined) {
                    // set as saved value
                    $(input).attr({
                        'value': value
                    });
                }
                content = input;
                break;
        }

        return content;
    }

    /**
     * Generate suggest input
     * @param {object} obj
     */
    var vp_generateVarSuggestInput = function(divTag, obj) {
        var types = obj.var_type;
        var defaultValue = obj.value;

        // Include various index types for Index type
        var INDEX_TYPES = ['RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'];
        // Include various groupby types for Groupby type
        var GROUPBY_TYPES = ['DataFrameGroupBy', 'SeriesGroupBy']
        if (types.indexOf('Index') >= 0) {
            types = types.concat(INDEX_TYPES);
        }
        if (types.indexOf('GroupBy') >= 0) {
            types = types.concat(GROUPBY_TYPES);
        }

        vpKernel.getDataList(types).then((resultObj) => {
            let { result, type, msg } = resultObj;
            var varList = JSON.parse(result);
            varList = varList.map(function(v) {
                return { label: v.varName + ' (' + v.varType + ')', value: v.varName, dtype: v.varType };
            });
            // 1. Target Variable
            var suggestInput = new SuggestInput();
            suggestInput.setComponentID(obj.name);
            suggestInput.addClass('vp-input vp-state');
            suggestInput.setSuggestList(function() { return varList; });
            suggestInput.setNormalFilter(false);
            suggestInput.setValue($(divTag + ' #' + obj.name).val());
            suggestInput.setSelectEvent(function(selectedValue) {
                // trigger change
                $(divTag + ' #' + obj.name).val(selectedValue);
                $(divTag + ' #' + obj.name).trigger('change');
            });
            $(divTag + ' #' + obj.name).replaceWith(function() {
                return suggestInput.toTagString();
            });
        }).catch(err => {
            vpLog.display(VP_LOG_TYPE.ERROR, 'Error on generating var suggest input', err);
        });
    }

    /**
     * Generate variable select tag
     * @param {object} tag 
     * @param {Array<string>} types 
     * @param {string} defaultValue 
     */
    var vp_generateVarSelect = function(tag, types, defaultValue = '') {
        // Include various index types for Index type
        var INDEX_TYPES = ['RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'];
        // Include various groupby types for Groupby type
        var GROUPBY_TYPES = ['DataFrameGroupBy', 'SeriesGroupBy']
        if (types.indexOf('Index') >= 0) {
            types = types.concat(INDEX_TYPES);
        }
        if (types.indexOf('GroupBy') >= 0) {
            types = types.concat(GROUPBY_TYPES);
        }

        vpKernel.getDataList(types).then(function(resultObj) {
            let { result, type, msg } = resultObj;
            var jsonVars = result.replace(/'/gi, `"`);
            var varList = JSON.parse(jsonVars);
            
            // option tags
            varList.forEach(listVar => {
                if (types.includes(listVar.varType) && listVar.varName[0] !== '_') {
                    var option = document.createElement('option');
                    $(option).attr({
                        'value':listVar.varName,
                        'text':listVar.varName,
                        'data-type':listVar.varType
                    });
                    // cell metadata test : defaultValue as selected
                    if (listVar.varName == defaultValue) {
                        $(option).prop('selected', true);
                    }
                    option.append(document.createTextNode(listVar.varName));
                    $(tag).append(option);
                }
            });

            // val-multi(select multiple) value list registration
            var classname = $(tag).attr('class');
            if (classname == 'var-multi') {
                $(tag).val(defaultValue);
            }

            // trigger change
            $(tag).trigger('change');
        }).catch(err => {
            vpLog.display(VP_LOG_TYPE.ERROR, 'Error on generating var selector', err);
        });
    }

    /**
     * Get tag value
     * @param {Object} pageThis
     * @param {*} obj 
     * @returns {string} tag's value
     */
    var vp_getTagValue = function(pageThis, obj) {
        var value = '';
        switch (obj.component) {
            case 'option_radio':
                var input = $(pageThis.wrapSelector("input[name='"+obj.name+"']:checked")).val();
                // same as default
                if (input == obj.default) break;
                value = input;
                break;
            case 'option_checkbox':
                var checked = $(pageThis.wrapSelector("input[name='"+obj.name+"']:checked")).val();

                for (var i = 0; i < checked.length; i++) {
                    value += "'" + $(checked[i]).val() + "',";
                }
                value = value.substr(0, value.length-1);
                break;
            case 'input_multi':
            case 'var_select':
            case 'var_multi':
            case 'col_select':
            case 'dtype':
                value = $(pageThis.wrapSelector('#'+obj.name)).val();
                break;
            case 'table':
            case 'file':
            case 'option_select':
            default:
                var input = $(pageThis.wrapSelector('#'+obj.name)).val();
                // same as default
                if (input == obj.default) break;
                value = input;
        }
        return value;
    }

    /**
     * Generate code
     * @param {Object} pageThis
     * @param {Object} package 
     * @param {string} etcOptions [optional] userOptionCode addition ex) ", test='TEST'"
     * @returns {string} generated code / if error, null
     */
    var vp_codeGenerator = function(pageThis, package, state = {}, etcOptions = '') {
        var code = package.code;
        
        try {
            package.options && package.options.forEach(function(v, i) {
                var val = state[v.name];
                if (val == undefined) {
                    val = vp_getTagValue(pageThis, v);
                }
                var id = '${' + v.name + '}';
                if (val == undefined || val.trim() == ''){
                    if (v.required == true) {
                        // throw new Error("'" + v.label + "' is required.");
                    }
                    // if no value, replace it
                    code = code.split(id).join('');
                } else {
                    // text quotation
                    if (v.type == 'text') {
                        val = "'"+val+"'";
                    } 
                    // code completion
                    if (v.code != undefined) {
                        val = v.code.split(id).join(val);
                    }
                    code = code.split(id).join(val);
                }
            });

            // additional userOptionCode
            code = code.split('${etc}').join(etcOptions);

            // () prevent code: (, ${v})
            code = code.split('(, ').join('(');

            // prevent code: no allocation variable ( = pd.DataFrame())
            if (code.startsWith(' = ')) {
                code = code.substr(3);
            }

            // show_result 
            if (_VP_SHOW_RESULT && package.output && package.output.length > 0) {
                var outputVariable = vp_getTagValue(pageThis, package.output[0]);
                if (outputVariable != '') {
                    code += '\n'+ outputVariable
                }
            }

        } catch (e) {
            vpLog.display(VP_LOG_TYPE.ERROR, 'com_generator v2 code generation error ' + e.message);
            return null;
        }
        return code;
    }

    /**
     * Bind columns source function
     * @param {string} selector thisWrapSelector 
     * @param {object} target 
     * @param {array} columnInputIdList 
     * Usage : 
     *  $(document).on('change', this.wrapSelector('#dataframe_tag_id'), function() {
     *      pdGen.vp_bindColumnSource(that.wrapSelector(), this, ['column_input_id']);
     *  });
     */
    var vp_bindColumnSource = function(selector, target, columnInputIdList) {
        var varName = '';
        if ($(target).length > 0) {
            varName = $(target).val();
        }
        if (varName === '') {
            // reset with no source
            columnInputIdList && columnInputIdList.forEach(columnInputId => {
                var suggestInputX = new SuggestInput();
                suggestInputX.setComponentID(columnInputId);
                suggestInputX.addClass('vp-input vp-state');
                suggestInputX.setNormalFilter(false);
                suggestInputX.setValue($(selector + ' #' + columnInputId).val());
                $(selector + ' #' + columnInputId).replaceWith(function() {
                    return suggestInputX.toTagString();
                });
            });
            return ;
        }
        // get result and show on detail box
        vpKernel.getColumnList(varName).then(function(resultObj) {
            try {
                let { result, type, msg } = resultObj;
                var varResult = JSON.parse(result);

                // columns using suggestInput
                columnInputIdList && columnInputIdList.forEach(columnInputId => {
                    var suggestInputX = new SuggestInput();
                    suggestInputX.setComponentID(columnInputId);
                    suggestInputX.addClass('vp-input vp-state');
                    suggestInputX.setPlaceholder("column name");
                    suggestInputX.setSuggestList(function() { return varResult; }); //FIXME:
                    suggestInputX.setNormalFilter(false);
                    suggestInputX.setValue($(selector + ' #' + columnInputId).val());
                    $(selector + ' #' + columnInputId).replaceWith(function() {
                        return suggestInputX.toTagString();
                    });
                });
            } catch (e) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'com_generator - bindColumnSource: not supported data type. ', e);
            }
        });
    }

    //========================================================================
    // Render components
    //========================================================================
    var render1dArr = function(pageThis, obj, state) {
        let arrKey = obj.name + '_1darr';
        let arrState = [ 0 ];
        let value = `[${arrState.join(',')}]`;
        if (state[arrKey] == undefined) {
            pageThis.setState({ [arrKey]: arrState });
            pageThis.setState({ [obj.name]: value});
        } else {
            arrState = state[arrKey];
            value = `[${arrState.join(',')}]`;
        }

        let contentTag = $(`<div class="vp-numpy-1darr-box"></div>`);
        $(contentTag).attr({
            'data-id': obj.name
        });
        contentTag.data('obj', obj);
        // Length setting
        contentTag.append($(`<div class="vp-numpy-style-flex-row-center">
            <div style="margin:0 5px;">
                <span>Length : </span>
                <input class="vp-input vp-numpy-1darr-set-num" style="width:50px;"
                    value="${arrState.length}" type="number">
            </div>
            <button class="vp-button vp-numpy-1darr-set">
                Set
            </button>
            <input type="hidden" class="vp-state" id="${obj.name}" value="${value}">
        </div>`));
        // Array Items
        let arrItems = $(`<div class="vp-numpy-style-flex-row-wrap vp-numpy-1darr-item-box"></div>`);
        arrState.forEach((item, idx) => {
            arrItems.append(render1dArrItem(pageThis, idx, item));
        });
        contentTag.append(arrItems);
        // add button
        contentTag.append($(`<button class="vp-button vp-numpy-1darr-add">+ Add</button>`));
        return contentTag;
    }

    var render1dArrItem = function(pageThis, idx, value=0) {
        return $(`<div class="vp-numpy-style-flex-column" style="margin-top:10px;;margin-bottom:10px;">
            <div class="text-center" style="margin-top:10px;;margin-bottom:10px;">
                ${idx}
            </div>
            <input class="vp-input vp-numpy-1darr-item" style="width:40px;" type="text" data-idx="${idx}" value="${value}">
            <button class="vp-button vp-numpy-1darr-del" style="width:40px;">
                x
            </button>
        </div>`);
    }

    var render2dArr = function(pageThis, obj, defaultValue) {
        return $('<input value="2darr"/>');
    }

    var renderNdArr = function(pageThis, obj, defaultValue) {
        return $('<input value="ndarr"/>');
    }

    var renderScalar = function(pageThis, obj, defaultValue) {
        return $('<input value="scalar"/>');
    }

    var renderParam = function(pageThis, obj, defaultValue) {
        return $('<input value="param"/>');
    }

    var renderDtypeSelector = function(pageThis, obj, defaultValue) {
        let slctTag = $('<select></select>').attr({
            class: 'vp-select vp-state',
            id: obj.name
        });
        _VP_NP_DTYPES.forEach(dtypeObj => {
            let { name, value } = dtypeObj;
            let option = $(`<option>${name}</option>`).attr({
                'value': value
            });
            if (value != undefined && value == defaultValue) {
                $(option).attr({
                    'selected':'selected'
                });
            }
            slctTag.append(option);
        });
        return slctTag;
    }

    var renderTabBlock = function(pageThis, obj, defaultValue) {
        return $('<input value="tabblock"/>');
    }

    var bindAutoComponentEvent = function(pageThis) {
        let selector = pageThis.wrapSelector();
        // Auto-component selector
        $(selector).on('change', '.vp-auto-component-selector', function() {
            let contentTag = $(this).parent().find('.vp-auto-component-content');
            let newType = $(this).val();
            let obj = $(this).data('obj');
            $(contentTag).html(renderContent(pageThis, newType, obj, pageThis.getState()));
        }); 

        //====================================================================
        // Event for 1dArr
        //====================================================================
        $(selector).on('click', '.vp-numpy-1darr-set', function() {
            let id = $(this).closest('.vp-numpy-1darr-box').data('id');
            let arrId = id + '_1darr';
            let len = $(this).parent().find('.vp-numpy-1darr-set-num').val();
            // update state
            let state = Array(parseInt(len)).fill(0);
            pageThis.setState({ [arrId]: state });
            pageThis.setState({ [id]: `[${state.join(',')}]` });
            // re-render
            let obj = $(this).closest('.vp-numpy-1darr-box').data('obj');
            $(this).closest('.vp-numpy-1darr-box').replaceWith(function() {
                return render1dArr(pageThis, obj, pageThis.getState());
            });
        }); 

        $(selector).on('click', '.vp-numpy-1darr-del', function() {
            let id = $(this).closest('.vp-numpy-1darr-box').data('id');
            let arrId = id + '_1darr';
            let idx = $(this).parent().find('.vp-numpy-1darr-item').data('idx');
            // update state
            let state = pageThis.getState(arrId);
            state.splice(idx, 1);
            pageThis.setState({ [arrId]: state });
            pageThis.setState({ [id]: `[${state.join(',')}]` });
            // re-render
            let obj = $(this).closest('.vp-numpy-1darr-box').data('obj');
            $(this).closest('.vp-numpy-1darr-box').replaceWith(function() {
                return render1dArr(pageThis, obj, pageThis.getState());
            });
        });

        $(selector).on('click', '.vp-numpy-1darr-add', function() {
            let id = $(this).closest('.vp-numpy-1darr-box').data('id');
            let arrId = id + '_1darr';
            let idx = 0;
            // update state
            let state = pageThis.getState(arrId);
            if (!state) {
                state = [];
            } else {
                idx = state.length;
            }
            state.push(0);
            pageThis.setState({ [arrId]: state });
            pageThis.setState({ [id]: `[${state.join(',')}]` });
            // re-render
            let obj = $(this).closest('.vp-numpy-1darr-box').data('obj');
            $(this).closest('.vp-numpy-1darr-box').replaceWith(function() {
                return render1dArr(pageThis, obj, pageThis.getState());
            });
        });

        $(selector).on('change', '.vp-numpy-1darr-item', function() {
            let id = $(this).closest('.vp-numpy-1darr-box').data('id');
            let arrId = id + '_1darr';
            let idx = $(this).data('idx');
            let value = $(this).val();
            // update state
            let state = pageThis.getState(arrId);
            state[idx] = value;
            let code = `[${state.join(',')}]`;
            pageThis.setState({ [arrId]: state });
            pageThis.setState({ [id]: code });
            $(pageThis.wrapSelector('#'+id)).val(code);
        });

        //====================================================================
        // Event for 2dArr
        //====================================================================


        //====================================================================
        // Event for ndArr
        //====================================================================


    }

    return {
        vp_showInterfaceOnPage: vp_showInterfaceOnPage,
        vp_codeGenerator: vp_codeGenerator,
        vp_generateVarSelect: vp_generateVarSelect,
        vp_getTagValue: vp_getTagValue,
        vp_bindColumnSource: vp_bindColumnSource
    };
});