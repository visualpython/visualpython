define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/pandas/common/commonPandas'
    , 'nbextensions/visualpython/src/common/vpMakeDom'
    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, libPandas, vpMakeDom, vpSuggestInputText) {
    // FIXME: cell metadata test / 전역으로 말고 불러오기/덮어쓰기로 수정
    var _VP_CODEMD = {};

    /**
     * 코드 실행 후 결과값 보여주기 여부
     */
    var _VP_SHOW_RESULT = true;

    /**
     * 변수 조회 시 제외해야할 변수명
     */
    var _VP_NOT_USING_VAR = ['_html', '_nms', 'NamespaceMagics', '_Jupyter', 'In', 'Out', 'exit', 'quit', 'get_ipython'];
    /**
     * 변수 조회 시 제외해야할 변수 타입
     */
    var _VP_NOT_USING_TYPE = ['module', 'function', 'builtin_function_or_method', 'instance', '_Feature', 'type', 'ufunc'];

    /**
     * 셀 metadata 에 해당 셀의 모듈 표기
     * @param {object} codeMd 
     */
    var vp_setCellMetadata = function(codeMd) {
        // 현재 선택된 셀의 metadata 입력하기
        Jupyter.notebook.get_selected_cell().metadata.vp = codeMd;
    }

    var vp_showInterface = function(pageThis) {
        var divTag = pageThis.wrapSelector('');
        var funcSetting = pageThis.package;

        vp_showInterfaceOnPage(pageThis, divTag, funcSetting);
    }

     /**
     * 정의된 설정값을 토대로 입출력 및 옵션 항목 그려주기
     * @param {*} funcSetting 
     */
    var vp_showInterfaceOnPage = function(pageThis, divTag, funcSetting) {

        // cell metadata test : metadata 값 받아와서 뿌려주기
        // _VP_CODEMD = Jupyter.notebook.get_selected_cell().metadata.vp;
        // // metadata 값이 없거나, 다른 기능의 메뉴일 경우 초기화
        // if (_VP_CODEMD == undefined || _VP_CODEMD.id != funcSetting.id) {
        //     _VP_CODEMD = {};
        // }

        // 입력값을 위한 태그 생성
        var tblInput = $(divTag+' #vp_inputOutputBox table');
        funcSetting.input && funcSetting.input.forEach(function(o, i) {
            // tblInput.append(vp_createTag(o));
            // cell metadata test
            var obj = JSON.parse(JSON.stringify(o)); // 깊은 복사
            // if ('input' in _VP_CODEMD)
            //     obj.value = _VP_CODEMD.input[i].value;
            tblInput.append(vp_createTag(divTag, obj, false, true, (obj.required == false? false: true)));
        });

        // 옵션값을 위한 태그 생성
        var tblOption = $(divTag+' #vp_optionBox table');
        funcSetting.variable && funcSetting.variable.forEach(function(o, i) {
            // tblOption.append(vp_createTag(o, true));
            // cell metadata test
            var obj = JSON.parse(JSON.stringify(o)); // 깊은 복사
            // if ('variable' in _VP_CODEMD)
            //     obj.value = _VP_CODEMD.variable[i].value;
            tblOption.append(vp_createTag(divTag, obj, true, true, (obj.required == true? true: false)));
        });

        // 출력값을 위한 태그 생성
        var tblOutput = $(divTag+' #vp_inputOutputBox table');
        funcSetting.output && funcSetting.output.forEach(function(o, i) {
            // tblOutput.append(vp_createTag(o));
            // cell metadata test
            var obj = JSON.parse(JSON.stringify(o)); // 깊은 복사
            // if ('output' in _VP_CODEMD)
            //     obj.value = _VP_CODEMD.output[i].value;
            tblOutput.append(vp_createTag(divTag, obj, false, true, (obj.required == true? true: false)));
        });
    }

    /**
     * 입출력/옵션의 type에 따라 특정 태그 구현하기
     * @param {object} divTag
     * @param {*} obj 
     * @param {boolean} showKey 
     * @param {boolean} getValue 
     * @returns {HTMLTableRowElement} tblRow (TR태그)
     */
    var vp_createTag = function(divTag, obj, showKey=false, getValue=false, required=false) {
        // TR 태그 & TD 라벨 태그 생성
        var tblRow = document.createElement('tr');
        // tblRow.innerHTML = ('<td><label for='+obj.name+'>'+ obj.label + (showKey?' ('+obj.name+')':'') +'</label> &nbsp;</td>')
        var tblLabel = document.createElement('td');
        var tblInput = document.createElement('td');

        var lbl = document.createElement('label');
        var requiredFontStyle = required? vpConst.COLOR_FONT_ORANGE : '';
        $(lbl).attr({
            'for': obj.name,
            'class': requiredFontStyle
        });
        // lbl.innerText = (required? '* ':'') + obj.label + (showKey?' ('+obj.name+')':'');
        lbl.innerText = obj.label + (showKey?' ('+obj.name+')':'');
        tblLabel.appendChild(lbl);

        // 명시된 component에 맞는 태그 구성해서 붙여주기
        switch (obj.component) {
            case 'bool_checkbox':
                // FIXME: True False select box
                var select = $(`<select id="${obj.name}" class="vp-select"><option value="">Default</option></select>`);
                select.append($('<option value="True">True</option>'))
                    .append($('<option value="False">False</option>'));
                $(tblInput).append(select);
                break;
            case 'option_select':
                var optSlct = document.createElement('select');
                $(optSlct).attr({
                    'class':'vp-select option-select',
                    'id':obj.name
                });
                // if required, no default option
                if (required != true) {
                    $(optSlct).append($('<option value="">Default</option>'));
                }
                obj.options.forEach((opt, idx, arr) => {
                    var label = (obj.options_label != undefined? obj.options_label[idx]:opt);
                    var option = document.createElement('option');
                    $(option).attr({
                        // 'id':opt,
                        'index':obj.index,
                        'name':obj.name,
                        'value':opt
                    });
                    // if (obj.default != undefined && obj.default == opt) {
                    //     $(option).attr({
                    //         'selected':'selected'
                    //     });
                    // }
                    // cell metadata test
                    if (getValue && obj.value != undefined) {
                        // metadata 에 저장된 값으로 표시
                        if (obj.value == opt) {
                            $(option).attr({
                                'selected':'selected'
                            });
                        }
                    }
                    option.append(document.createTextNode(label));
                    optSlct.appendChild(option);
                });
                tblInput.appendChild(optSlct);
                break;
            case 'var_select':
                // 데이터 프레임 suggest input 태그 구성
                var tag = document.createElement('input');
                $(tag).attr({
                    'type': 'text',
                    'id': obj.name,
                    'class': 'vp-input'
                });
                vp_generateVarSuggestInput(divTag, obj);
                tblInput.appendChild(tag);
                break;
            case 'var_multi':
                // 데이터 프레임 select 태그 구성 (다중선택 가능)
                var tag = document.createElement('select');
                $(tag).attr({
                    'id': obj.name,
                    'class': 'vp-select var-multi',
                    // 다중 선택 가능하게 설정
                    'multiple': true
                });
                vp_generateVarSelect(tag, obj.var_type, obj.value);
                tblInput.appendChild(tag);
                break;
            case 'textarea':
                var textarea = $(`<textarea id="${obj.name}" class="vp-textarea">${(obj.default==undefined?'':obj.default)}</textarea>`);
                // cell metadata test
                if (getValue && obj.value != undefined) {
                    // metadata 에 저장된 값으로 표시
                    textarea.val(obj.value);
                }
                $(tblInput).append(textarea);
                break;
            case 'table':
                // break;
            case 'file':
                // break;
            // default : input_single
            default:
                // FIXME: use makedom
                var input = vpMakeDom.renderInput({
                    'type':'text',
                    'class':'vp-input input-single',
                    'id':obj.name,
                    'placeholder':(obj.placeholder==undefined?'':obj.placeholder),
                    'value':(obj.default==undefined?'':obj.default),
                    'title':(obj.help==undefined?'':obj.help)
                });
                // cell metadata test
                if (getValue && obj.value != undefined) {
                    // metadata 에 저장된 값으로 표시
                    input.attr({
                        'value': obj.value
                    });
                }
                $(tblInput).append(input);
        }
        tblRow.appendChild(tblLabel);
        tblRow.appendChild(tblInput);
        
        return tblRow;
    }

    /**
     * 알맞은 type 변수 목록을 suggestInput 태그로 반환
     * @param {object} obj
     */
    var vp_generateVarSuggestInput = function(divTag, obj) {
        var types = obj.var_type;
        var defaultValue = obj.value;

        // Index 는 여러 유형의 Index 타입이 있어 하위 타입들도 포함 필요
        var INDEX_TYPES = ['RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'];
        // GroupBy 는 여러 유형의 GroupyBy 타입이 있어 하위 타입들도 포함시키기
        var GROUPBY_TYPES = ['DataFrameGroupBy', 'SeriesGroupBy']
        if (types.indexOf('Index') >= 0) {
            types = types.concat(INDEX_TYPES);
        }
        if (types.indexOf('GroupBy') >= 0) {
            types = types.concat(GROUPBY_TYPES);
        }

        vp_searchVarList(types, function (result) {
            var varList = JSON.parse(result);
            varList = varList.map(function(v) {
                return { label: v.varName + ' (' + v.varType + ')', value: v.varName, dtype: v.varType };
            });
            // 1. Target Variable
            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
            suggestInput.setComponentID(obj.name);
            suggestInput.addClass('vp-input');
            suggestInput.setSuggestList(function() { return varList; });
            suggestInput.setNormalFilter(false);
            suggestInput.setValue($(divTag + ' #' + obj.name).val());
            suggestInput.setSelectEvent(function(selectedValue) {
                // trigger change
                $(divTag + ' #' + obj.name).val(selectedValue);
                $(divTag + ' #' + obj.name).trigger('select_suggestvalue');
            });
            $(divTag + ' #' + obj.name).replaceWith(function() {
                return suggestInput.toTagString();
            });
        });
    }

    /**
     * 알맞은 type 목록을 select 태그로 반환
     * @param {object} tag 
     * @param {Array<string>} types 
     * @param {string} defaultValue 
     */
    var vp_generateVarSelect = function(tag, types, defaultValue = '') {
        // Index 는 여러 유형의 Index 타입이 있어 하위 타입들도 포함 필요
        var INDEX_TYPES = ['RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'];
        // GroupBy 는 여러 유형의 GroupyBy 타입이 있어 하위 타입들도 포함시키기
        var GROUPBY_TYPES = ['DataFrameGroupBy', 'SeriesGroupBy']
        if (types.indexOf('Index') >= 0) {
            types = types.concat(INDEX_TYPES);
        }
        if (types.indexOf('GroupBy') >= 0) {
            types = types.concat(GROUPBY_TYPES);
        }

        vp_searchVarList(types, function (result) {
            var jsonVars = result.replace(/'/gi, `"`);
            var varList = JSON.parse(jsonVars);
            
            // option 태그 구성
            varList.forEach(listVar => {
                if (types.includes(listVar.varType) && listVar.varName[0] !== '_') {
                    var option = document.createElement('option');
                    $(option).attr({
                        'value':listVar.varName,
                        'text':listVar.varName,
                        'data-type':listVar.varType
                    });
                    // cell metadata test : defaultValue에 따라서 selected 적용
                    if (listVar.varName == defaultValue) {
                        $(option).prop('selected', true);
                    }
                    option.append(document.createTextNode(listVar.varName));
                    $(tag).append(option);
                }
            });

            // val-multi 일 경우(select multiple) value list 등록
            var classname = $(tag).attr('class');
            if (classname == 'var-multi') {
                $(tag).val(defaultValue);
            }

            // trigger change
            $(tag).trigger('change');
        });
    }

    /**
     * types에 해당하는 데이터유형을 가진 변수 목록 조회
     * @param {Array} types 조회할 변수들의 데이터유형 목록
     * @param {Function} callback 조회 후 실행할 callback. parameter로 result를 받는다
     */
    var vp_searchVarList = function(types, callback) {
        // types에 맞는 변수목록 조회하는 명령문 구성
        var cmdSB = new sb.StringBuilder();
        // cmdSB.appendLine('import json');
        // cmdSB.append(`print(json.dumps([{'varName': v, 'varType': type(eval(v)).__name__}`);
        // cmdSB.append(`for v in dir() if (not v.startswith('_')) `);
        // cmdSB.appendFormat('& (v not in {0})', JSON.stringify(_VP_NOT_USING_VAR));
        // if (types != undefined && types.length > 0) {
        //     cmdSB.appendFormat(`& (type(eval(v)).__name__ in {0})`, JSON.stringify(types));
        // } else {
        //     cmdSB.appendFormat(`& (type(eval(v)).__name__ not in {0}) `, JSON.stringify(_VP_NOT_USING_TYPE));
        // }
        // cmdSB.append(']))');
        if (types != undefined && types.length > 0) {
            cmdSB.appendFormat('_vp_print(_vp_get_variables_list({0}))', JSON.stringify(types));
        } else {
            cmdSB.appendFormat('_vp_print(_vp_get_variables_list({0}))', 'None');
        }

        // FIXME: vpFuncJS에만 kernel 사용하는 메서드가 정의되어 있어서 임시로 사용
        vp_executePython(cmdSB.toString(), function(result) {
            callback(result);
        });
    }

    /**
     * FIXME: vpFuncJS에만 kernel 사용하는 메서드가 정의되어 있어서 임시로 사용
     * @param {*} command 
     * @param {*} callback 
     * @param {*} isSilent 
     */
    var vp_executePython = function (command, callback, isSilent = false) {
        Jupyter.notebook.kernel.execute(
            command,
            {
                iopub: {
                    output: function (msg) {
                        var result = String(msg.content["text"]);
                        callback(result);
                    }
                }
            },
            { silent: isSilent }
        );
    };

    /**
     * Type 별 라벨값 반환
     * @param {string} type 
     */
    var vp_getTypeLabel = function(type) {
        var typeLabel = '';
        switch (type) {
            case 'text':
                typeLabel = '문자';
                break;
            case 'var':
                typeLabel = '변수';
                break;
            case 'int':
            case 'float':
                typeLabel = '숫자';
                break;
            case 'list':
            case 'list2d':
                typeLabel = '배열';
                break;
            case 'dict':
                typeLabel = '사전';
                break;
            default:
                typeLabel = '변수';
        }
        return typeLabel;
    }

    /**
     * pageId 클래스 하위에서 쿼리하도록 구성
     * @param {string} pageId vp-option-page의 uuid값
     * @param {string} query 
     */
    var vp_wrapSelector = function(pageId, query) {
        return vpCommon.wrapSelector('.'+pageId+' '+query);
    }

    /**
     * 입출력/옵션의 type에 따라 특정 태그에 입력된 값 반환하기
     * @param {string} pageId vp-option-page의 uuid값
     * @param {*} obj 
     * @returns {string} 입력값
     */
    var vp_getTagValue = function(pageId, obj) {
        var value = '';
        switch (obj.component) {
            case 'input_multi':
                value = $(vp_wrapSelector(pageId, '#'+obj.name)).val();
                break;
            case 'option_radio':
                var input = $(vp_wrapSelector(pageId, "input[name='"+obj.name+"']:checked")).val();
                // default 값과 동일하다면 굳이 옵션에 넣어주지 않는다
                if (input == obj.default) break;
                value = input;
                break;
            // case 'bool_checkbox':
            //     var input = $(vp_wrapSelector(pageId, "input[name='"+obj.name+"']")).is(":checked");
            //     // default 값과 동일하다면 굳이 옵션에 넣어주지 않는다
            //     if (input == obj.default) break;
            //     value = input == true?'True':'False';
            //     break;
            case 'option_checkbox':
                var checked = $(vp_wrapSelector(pageId, "input[name='"+obj.name+"']:checked")).val();

                for (var i = 0; i < checked.length; i++) {
                    value += "'" + $(checked[i]).val() + "',";
                }
                value = value.substr(0, value.length-1);
                break;
            case 'option_select':
                var input = $(vp_wrapSelector(pageId, '#'+obj.name)).val();
                // default 값과 동일하다면 굳이 옵션에 넣어주지 않는다
                if (input == obj.default) break;
                value = input;
                break;
            case 'var_select':
                value = $(vp_wrapSelector(pageId, '#'+obj.name)).val();
                break;
            case 'var_multi':
                value = $(vp_wrapSelector(pageId, '#'+obj.name)).val();
                break;
            case 'table':
                // break;
            case 'file':
                // break;
            // default : input_single
            default:
                var input = $(vp_wrapSelector(pageId, '#'+obj.name)).val();
                // default 값과 동일하다면 굳이 옵션에 넣어주지 않는다
                if (input == obj.default) break;
                value = input;
        }
        return value;
    }

    /**
     * 입출력/옵션에 입력된 값을 코드에 넣어 코드 완성하기
     * @param {string} pageId vp-option-page의 uuid값
     * @param {Object} funcSetting 
     * @param {string} etcOptions [선택] 추가 사용자 옵션 ", test='TEST'" 형태로 전달
     * @returns {string} 입력값 반영된 코드 반환 / 오류 발생할 경우 null 반환
     */
    var vp_codeGenerator = function(pageId, funcSetting, etcOptions = '') {
        var code = funcSetting.code;

        // Cell Metadata에 넣을 구조 TODO:
        // _VP_CODEMD = {
        //     menu: _VP_PAGE_ID,
        //     id: funcSetting.id,
        //     name: funcSetting.name,
        //     code: code,
        //     // input: [...funcSetting.input],
        //     // variable: [...funcSetting.variable],
        //     // output: [...funcSetting.output]
        //     input: JSON.parse(JSON.stringify(funcSetting.input)),
        //     variable: JSON.parse(JSON.stringify(funcSetting.variable)),
        //     output: JSON.parse(JSON.stringify(funcSetting.output)),
        // };
        
        try {
            // 입력값 대체
            funcSetting.input && funcSetting.input.forEach(function(v, i) {
                // var val = $('#'+i.name).val();
                var val = vp_getTagValue(pageId, v);
                var id = '${' + v.name + '}';
                if (val == undefined || val == ''){
                    if (v.required == undefined || v.required == true) {
                        // throw new Error(v.label+'에 값을 입력해주세요.');
                        // throw new Error("'" + v.label + "' is required.");
                    }
                    // 값이 없을 경우 빈 값으로 파라미터 대체
                    code = code.split(id).join('');
                } else {
                    // Deprecated: val type 에 따라 다른 형식 적용
                    if (v.type == 'text') {
                        val = "'"+val+"'";
                    } 
                    // else if (v.type == 'list') {
                    //     val = '['+val+']';
                    // }
                    code = code.split(id).join(val);
                }
            });

            // 옵션값 대체
            var opt_params = ``;
            funcSetting.variable && funcSetting.variable.forEach(function(v, i) {
                // var val = $('#'+i.name).val();
                var val = vp_getTagValue(pageId, v);
                // 값이 입력되지 않았을 경우, 필수 표시가 되어있으면 알림
                if (val == undefined || val == ''){
                    if (v.required == true) {
                        // throw new Error(v.label+'에 값을 입력해주세요.');
                        // throw new Error("'" + v.label + "' is required.");
                    }
                }
                else {
                    // Deprecated: val type 에 따라 다른 형식 적용
                    if (v.type == 'text') {
                        val = "'"+val+"'";
                    }
                    //  else if (v.type == 'list') {
                    //     val = '['+val+']';
                    // }
                    opt_params += ', '+v.name+'='+val;
                }
            })
            code = code.split('${v}').join(opt_params);

            // 출력값 대체
            funcSetting.output && funcSetting.output.forEach(function(v, i) {
                // var val = $('#'+i.name).val();
                var val = vp_getTagValue(pageId, v);
                var id = '${' + v.name + '}'
                if (val == undefined || val == ''){
                    if (v.required == true) {
                        // throw new Error(v.label+'에 값을 입력해주세요.');
                        // throw new Error("'" + v.label + "' is required.");

                        // 출력 변수 없을 경우 공백으로 만들기
                        code = code.split(id).join('');
                        code = code.split(' = ').join('');
                    } else {
                        // 출력 변수 없을 경우 공백으로 만들기
                        code = code.split(id).join('');
                        code = code.split(' = ').join('');
                    }
                } else {
                    // TODO: Cell MD
                    // _VP_CODEMD.output[i].value = val;
                    // Deprecated: val type 에 따라 다른 형식 적용
                    if (v.type == 'text') {
                        val = "'"+val+"'";
                    } 
                    // else if (v.type == 'list') {
                    //     val = '['+val+']';
                    // }
                    code = code.split(id).join(val);
                }
            });

            // 추가 사용자 옵션
            code = code.split('${etc}').join(etcOptions);

            // () 함수 파라미터 공간에 input 없을 경우 (, ${v}) 와 같은 형태로 출력되는 것 방지
            code = code.split('(, ').join('(');

            // show_result : 마지막에 결과값 보여주기
            if (_VP_SHOW_RESULT && funcSetting.output && funcSetting.output.length > 0) {
                var outputVariable = vp_getTagValue(pageId, funcSetting.output[0]);
                if (outputVariable != '') {
                    code += '\n'+ outputVariable
                }
            }

        } catch (e) {
            // vpCommon.renderAlertModal(e.message);
            console.log('vp error: ' + e.message);
            return null;
        }
        return code;
    }

    /**
     * Bind columns source function
     * @param {object} pageThis 
     * @param {object} target 
     * @param {array} columnInputIdList 
     * Usage : 
     *  $(document).on('change', this.wrapSelector('#dataframe_tag_id'), function() {
     *      pdGen.vp_bindColumnSource(that, this, ['column_input_id']);
     *  });
     */
    var vp_bindColumnSource = function(pageThis, target, columnInputIdList) {
        var varName = $(target).val();
        // var varType = $(target).attr('data-type');

        // if (varType != 'DataFrame')
        if (varName === '') {
            // reset with no source
            columnInputIdList && columnInputIdList.forEach(columnInputId => {
                var suggestInputX = new vpSuggestInputText.vpSuggestInputText();
                suggestInputX.setComponentID(columnInputId);
                suggestInputX.addClass('vp-input');
                suggestInputX.setNormalFilter(false);
                suggestInputX.setValue($(pageThis.wrapSelector('#' + columnInputId)).val());
                $(pageThis.wrapSelector('#' + columnInputId)).replaceWith(function() {
                    return suggestInputX.toTagString();
                });
            });
            return ;
        }

        var code = new sb.StringBuilder();
        // code.appendLine('import json');
        // code.appendFormat(`print(json.dumps([ { "value": ("'" + c + "'") if type(c).__name__ == 'str' else c, "label": c, "dtype": str({0}[c].dtype), "array": str({1}[c].array) } for c in list({2}.columns) ]))`
        //                 , varName, varName, varName);
        code.appendFormat('_vp_print(_vp_get_columns_list({0}))', varName);
        // get result and show on detail box
        pageThis.kernelExecute(code.toString(), function(result) {
            try {
                var varResult = JSON.parse(result);
    
                if (varResult.length > 0) {
                    // columns using suggestInput
                    columnInputIdList && columnInputIdList.forEach(columnInputId => {
                        var suggestInputX = new vpSuggestInputText.vpSuggestInputText();
                        suggestInputX.setComponentID(columnInputId);
                        suggestInputX.addClass('vp-input');
                        suggestInputX.setPlaceholder("column name");
                        suggestInputX.setSuggestList(function() { return varResult; }); //FIXME:
                        suggestInputX.setNormalFilter(false);
                        suggestInputX.setValue($(pageThis.wrapSelector('#' + columnInputId)).val());
                        $(pageThis.wrapSelector('#' + columnInputId)).replaceWith(function() {
                            return suggestInputX.toTagString();
                        });
                    });
                }
            } catch (e) {
                console.log('not supported data type. ' + e);
            }
        });

    }

    return {
        vp_showInterface: vp_showInterface,
        vp_showInterfaceOnPage: vp_showInterfaceOnPage,
        vp_codeGenerator: vp_codeGenerator,
        vp_generateVarSelect: vp_generateVarSelect,
        vp_searchVarList: vp_searchVarList,
        vp_getTagValue: vp_getTagValue,
        vp_bindColumnSource: vp_bindColumnSource,
        _VP_NOT_USING_VAR: _VP_NOT_USING_VAR,
        _VP_NOT_USING_TYPE: _VP_NOT_USING_TYPE
    };
});