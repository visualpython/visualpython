const { param } = require("jquery");

define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
    , 'nbextensions/visualpython/src/common/kernelApi'
], function(requirejs, $, vpConst, sb, vpCommon, vpSuggestInputText, kernelApi) {


    // temporary const
    const VP_INS_BOX = 'vp-ins-box';
    const VP_INS_SELECT_CONTAINER = 'vp-ins-select-container';
    const VP_INS_SELECT_TITLE = 'vp-ins-select-title';
    const VP_INS_SEARCH = 'vp-ins-search';
    const VP_INS_TYPE = 'vp-ins-type';
    const VP_INS_SELECT_BOX = 'vp-ins-select-box';
    const VP_INS_SELECT_LIST = 'vp-ins-select-list';
    const VP_INS_SELECT_ITEM = 'vp-ins-select-item';

    const VP_INS_PARAMETER_BOX = 'vp-ins-parameter-box';
    const VP_INS_PARAMETER = 'vp-ins-parameter';

    const VP_CREATE_VAR_BOX = 'vp-create-var-box';
    const VP_CREATE_VAR = 'vp-create-var';
    const VP_CREATE_VAR_BTN = 'vp-create-var-btn';

    // function/method types
    var _METHOD_TYPES = ['function', 'method', 'type', 'builtin_function_or_method', 'PlotAccessor'];

    /**
     * @class InstanceEditor
     * @param {object} pageThis
     * @param {string} targetId
     * @param {boolean} popup
     * @constructor
     */
    var InstanceEditor = function(pageThis, targetId, containerId='vp-wrapper', popup=false) {
        this.pageThis = pageThis;
        this.targetId = targetId;
        this.uuid = 'u' + vpCommon.getUUID();
        this.containerId = containerId;
        this.popup = popup;

        this.state = {
            code: '',
            type: '',
            list: [],
        }

        this.isFirstPage = false;
        this.dataTypeInfo = [
            { label: 'DataFrame', type: 'DataFrame',  assign: ' = pd.DataFrame()'},
            { label: 'Series', type: 'Series', assign: ' = pd.Series()' },
            { label: 'Dict', type: 'dict', assign: ' = {}' },
            { label: 'List', type: 'list', assign: ' = []' },
            { label: 'Integer', type: 'int', assign: ' = 0' },
            { label: 'Others', type: '' }
        ]
        this.dataTypeList = ['DataFrame', 'Series', 'dict', 'list', 'int'];

        this.bindEvent();
        this.init();
        
    }

    InstanceEditor.prototype.getVarType = function() {
        return this.state.type;
    }

    InstanceEditor.prototype.getVarList = function() {
        return this.state.list;
    }

    InstanceEditor.prototype.init = function() {
        // load css
        vpCommon.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "common/instanceEditor.css");

        this.reload();
    }
    
    InstanceEditor.prototype.wrapSelector = function(selector='') {
        return vpCommon.formatString('.{0} {1}', this.uuid, selector);
    }

    InstanceEditor.prototype.renderFirstPage = function() {
        var tag = new sb.StringBuilder();
        tag.appendFormatLine('<div class="{0} {1}">', VP_INS_BOX, this.uuid); // vp-select-base

        tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_CONTAINER, 'datatype');
        tag.appendFormatLine('<div class="vp-multilang {0}">Data Type</div>', VP_INS_SELECT_TITLE);
        tag.appendFormatLine('<input class="{0} {1}" type="hidden"/>', VP_INS_TYPE, 'datatype');
        tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_BOX, 'datatype');
        tag.appendFormatLine('<ul class="{0} {1}">', VP_INS_SELECT_LIST, 'datatype');
        this.dataTypeInfo.forEach((obj, idx) => {
            tag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" data-var-assign="{3}">{4}</li>'
                                                , VP_INS_SELECT_ITEM + (idx==0?' selected':''), obj.label, obj.type, obj.assign, obj.label);
        });
        tag.appendLine('</ul>');
        tag.appendLine('</div>'); // VP_INS_SELECT_BOX
        tag.appendLine('</div>'); // VP_INS_SELECT_CONTAINER

        tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_CONTAINER, 'variable');
        tag.appendFormatLine('<div class="vp-multilang {0}">Variable</div>', VP_INS_SELECT_TITLE);
        tag.appendFormatLine('<input class="{0} {1}" type="hidden"/>', VP_INS_TYPE, 'variable');
        tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_BOX, 'variable');
        tag.appendFormatLine('<ul class="{0} {1}">', VP_INS_SELECT_LIST, 'variable');
        tag.appendLine('</ul>');
        tag.appendLine('</div>'); // VP_INS_SELECT_BOX

        // create variable input
        tag.appendFormatLine('<div class="{0}">', VP_CREATE_VAR_BOX);
        tag.appendFormatLine('<input class="vp-input {0}" type="text" placeholder="Create Variable" />', VP_CREATE_VAR);
        tag.appendFormatLine('<div class="{0}"><img src="{1}"/></div>', VP_CREATE_VAR_BTN, '/nbextensions/visualpython/resource/plus.svg');
        tag.appendLine('</div>');

        tag.appendLine('</div>'); // VP_INS_SELECT_CONTAINER

        tag.appendLine('</div>'); // VP_INS_BOX END

        // TODO: if this.popup == true

        $(this.pageThis.wrapSelector('#' + this.containerId)).html(tag.toString());

        return tag.toString();
    }

    InstanceEditor.prototype.renderVarList = function(varType, varList) {
        var varListTag = new sb.StringBuilder();
        varList != undefined && varList.forEach(obj => {
            if ((varType == '' && !this.dataTypeList.includes(obj.type)) 
                || obj.type == varType) {
                varListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>'
                                                        , VP_INS_SELECT_ITEM, obj.name, obj.type, obj.type, obj.name);
            }
        });
        $(this.wrapSelector('.' + VP_INS_SELECT_LIST + '.variable')).html(varListTag.toString());
    }

    InstanceEditor.prototype.renderPage = function(replace=true) {
        var tag = new sb.StringBuilder();
        tag.appendFormatLine('<div class="{0} {1}">', VP_INS_BOX, this.uuid); // vp-select-base

        tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_CONTAINER, 'attr');
        tag.appendFormatLine('<div class="vp-multilang {0}">Attribute</div>', VP_INS_SELECT_TITLE);

        tag.appendFormatLine('<div style="{0}">', 'position: relative;');
        tag.appendFormatLine('<input class="vp-input {0} {1}" type="text" placeholder="search attribute" />', VP_INS_SEARCH, 'attr');
        tag.appendFormatLine('<input class="{0} {1}" type="hidden"/>', VP_INS_TYPE, 'attr');
        tag.appendFormatLine('<i class="{0} {1}"></i>', 'fa fa-search', 'vp-ins-search-icon');
        tag.appendLine('</div>');

        tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_BOX, 'attr');
        tag.appendFormatLine('<ul class="{0} {1}">', VP_INS_SELECT_LIST, 'attr');
        tag.appendLine('</ul>');
        tag.appendLine('</div>'); // VP_INS_SELECT_BOX
        tag.appendLine('</div>'); // VP_INS_SELECT_CONTAINER

        tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_CONTAINER, 'method');
        tag.appendFormatLine('<div class="vp-multilang {0}">Method</div>', VP_INS_SELECT_TITLE);

        tag.appendFormatLine('<div style="{0}">', 'position: relative;');
        tag.appendFormatLine('<input class="vp-input {0} {1}" type="text" placeholder="search method" />', VP_INS_SEARCH, 'method');
        tag.appendFormatLine('<input class="{0} {1}" type="hidden"/>', VP_INS_TYPE, 'method');
        tag.appendFormatLine('<i class="{0} {1}"></i>', 'fa fa-search', 'vp-ins-search-icon');
        tag.appendLine('</div>');
        
        tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_BOX, 'method');
        tag.appendFormatLine('<ul class="{0} {1}">', VP_INS_SELECT_LIST, 'method');
        tag.appendLine('</ul>');
        tag.appendLine('</div>'); // VP_INS_SELECT_BOX
        tag.appendLine('</div>'); // VP_INS_SELECT_CONTAINER

        tag.appendFormatLine('<div class="{0}">', VP_INS_PARAMETER_BOX);
        tag.appendFormatLine('<input type="text" class="{0}" placeholder="{1}"/>'
                            , VP_INS_PARAMETER, 'input parameter');
        tag.appendLine('</div>'); // VP_INS_PARAMETER

        tag.appendLine('</div>'); // VP_INS_BOX END

        // TODO: if this.popup == true

        $(this.pageThis.wrapSelector('#' + this.containerId)).html(tag.toString());

        return tag.toString();
    }

    InstanceEditor.prototype.bindEvent = function() {
        var that = this;

        // select datatype
        $(document).on('click', this.wrapSelector('.' + VP_INS_SELECT_LIST + '.datatype .' + VP_INS_SELECT_ITEM), function(event) {
            var varType = $(this).attr('data-var-type');
            $(that.wrapSelector('.' + VP_INS_SELECT_LIST + '.datatype .' + VP_INS_SELECT_ITEM)).removeClass('selected');
            $(this).addClass('selected');

            // if others selected, cannot create variable
            if (varType == '') {
                $(that.wrapSelector('.' + VP_CREATE_VAR_BOX)).hide();
            } else {
                $(that.wrapSelector('.' + VP_CREATE_VAR_BOX)).show();
            }

            that.reload();
        });

        // select variable
        $(document).on('click', this.wrapSelector('.' + VP_INS_SELECT_LIST + '.variable .' + VP_INS_SELECT_ITEM), function(event) {
            var varName = $(this).attr('data-var-name');
            var varType = $(this).attr('data-var-type');

            // console.log('clicked', varName, varType, that.state);
            $(that.pageThis.wrapSelector('#' + that.targetId)).trigger({
                type:"instance_editor_selected",
                varName: varName,
                varType: varType,
                isMethod: false
            });
        });

        // create variable
        $(document).on('click', this.wrapSelector('.' + VP_CREATE_VAR_BTN), function(event) {
            var varName = $(that.wrapSelector('.' + VP_CREATE_VAR)).val();
            var selectedType = $(that.wrapSelector('.' + VP_INS_SELECT_LIST + '.datatype .' + VP_INS_SELECT_ITEM + '.selected'));
            var varType = selectedType.attr('data-var-type');
            var assignCode = selectedType.attr('data-var-assign');

            if (varName == '') {
                ; // no variable name entered
            } else {
                var code = vpCommon.formatString('{0}{1}\n{2}', varName, assignCode, 'type(' + varName + ').__name__');
                kernelApi.executePython(code, function(result) {
                    if (result.includes(varType)) {
                        vpCommon.renderSuccessMessage('Variable Created!');
                        that.reload();
                    }
                    $(that.wrapSelector('.' + VP_CREATE_VAR)).val('');
                });
            }
        });

        // select attribute
        $(document).on('click', this.wrapSelector('.' + VP_INS_SELECT_LIST + '.attr .' + VP_INS_SELECT_ITEM), function(event) {
            var varName = $(this).attr('data-var-name');
            var varType = $(this).attr('data-var-type');

            // console.log('clicked', varName, varType, that.state);
            $(that.pageThis.wrapSelector('#' + that.targetId)).trigger({
                type:"instance_editor_selected",
                varName: varName,
                varType: varType,
                isMethod: false
            });
        });

        // select method
        $(document).on('click', this.wrapSelector('.' + VP_INS_SELECT_LIST + '.method .' + VP_INS_SELECT_ITEM), function(event) {
            var varName = $(this).attr('data-var-name');
            var varType = $(this).attr('data-var-type');
            // console.log('clicked', varName, varType, that.state);
            $(that.pageThis.wrapSelector('#' + that.targetId)).trigger({
                type:"instance_editor_selected",
                varName: varName,
                varType: varType,
                isMethod: true
            });
        });

        // parameter input
        $(document).on('change', this.wrapSelector('.' + VP_INS_PARAMETER), function(event) {
            var parameter = $(this).val();
            var variable = $(that.pageThis.wrapSelector('#' + that.targetId)).val();
            var splitList = variable.split('.');
            if (splitList && splitList.length > 0) {
                var lastSplit = splitList[splitList.length - 1];
                var matchList = lastSplit.match(/\(.*?\)$/gi);
                if (matchList && matchList.length > 0) {
                    var lastBracket = matchList[matchList.length - 1];
                    splitList[splitList.length - 1] = lastSplit.replace(lastBracket, vpCommon.formatString('({0})', parameter));
                    var newCode = splitList.join('.');
                    $(that.pageThis.wrapSelector('#' + that.targetId)).trigger({
                        type:"instance_editor_replaced",
                        originCode: variable,
                        newCode: newCode
                    });
                }
            }
        });
    }

    InstanceEditor.prototype.reload = function(callback=undefined) {
        var that = this;
        var variable = $(this.pageThis.wrapSelector('#' + this.targetId)).val();
        this.state.code = variable;

        if (variable == '') {
            if (!this.isFirstPage) {
                this.renderFirstPage();
                this.isFirstPage = true;
            }
        } else {
            this.isFirstPage = false;
            this.renderPage();
        }
        
        var code = vpCommon.formatString('_vp_print(_vp_load_instance("{0}"))', variable);

        kernelApi.executePython(code, function(result) {
            var varObj = {
                type: 'None',
                list: []
            };
            try {
                varObj = JSON.parse(result);
            } catch {
                ; // command error
            }

            var varType = varObj.type;
            var varList = varObj.list;

            that.state.type = varType;
            that.state.list = varList;

            // set variable type
            // $(that.wrapSelector('#vp_instanceType')).text(varType);

            // set dir list
            
            if (that.isFirstPage) {
                varType = $(that.wrapSelector('.' + VP_INS_SELECT_LIST + '.datatype .' + VP_INS_SELECT_ITEM + '.selected')).attr('data-var-type');
                that.renderVarList(varType, varList);
            } else {
                var attrListTag = new sb.StringBuilder();
                var methodListTag = new sb.StringBuilder();
                var attrList = [];
                var methodList = [];
                varList != undefined && varList.forEach(obj => {
                    if (obj.type.includes('Indexer')) {
                        methodListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>'
                                                    , VP_INS_SELECT_ITEM, obj.name + '[]', obj.type, obj.type, obj.name);
                        methodList.push({
                            label: obj.name + '[]' + ' (' + obj.type + ')',
                            value: obj.name + '[]',
                            type: obj.type 
                        });
                    }
                    // Method/Function... 이면 Method 항목에 표시
                    else if (_METHOD_TYPES.includes(obj.type)) {
                        methodListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>'
                                                    , VP_INS_SELECT_ITEM, obj.name + '()', obj.type, obj.type, obj.name);
                        methodList.push({
                            label: obj.name + '()' + ' (' + obj.type + ')',
                            value: obj.name + '()' ,
                            type: obj.type
                        });
                    } else {
                        // FIXME: type이 module일 경우엔 pd(pandas) module만 표시
                        // if (obj.type == 'module' && obj.name != 'pd') {
                        //     ;
                        // } else {
                        attrListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>'
                                                    , VP_INS_SELECT_ITEM, obj.name, obj.type, obj.type, obj.name);
                        attrList.push({
                            label: obj.name + ' (' + obj.type + ')',
                            value: obj.name,
                            type: obj.type
                        });
                        // }
                    }
                });
                $(that.wrapSelector('.' + VP_INS_SELECT_LIST + '.attr')).html(attrListTag.toString());
                $(that.wrapSelector('.' + VP_INS_SELECT_LIST + '.method')).html(methodListTag.toString());

                // attribute search suggest
                var suggestInput = new vpSuggestInputText.vpSuggestInputText();
                suggestInput.addClass('vp-input attr');
                suggestInput.addClass(VP_INS_SEARCH);
                suggestInput.setPlaceholder("search attribute");
                suggestInput.setSuggestList(function() { return attrList; });
                suggestInput.setSelectEvent(function(value, item) {
                    $(this.wrapSelector()).val(value);
                    $(that.wrapSelector('.' + VP_INS_TYPE + '.attr')).val(item.type);
    
                    $(that.pageThis.wrapSelector('#' + that.targetId)).trigger({
                        type:"instance_editor_selected",
                        varName: value,
                        varType: item.type,
                        isMethod: false
                    });
                });
                $(that.wrapSelector('.' + VP_INS_SEARCH + '.attr')).replaceWith(function() {
                    return suggestInput.toTagString();
                });
    
                // method search suggest
                suggestInput = new vpSuggestInputText.vpSuggestInputText();
                suggestInput.addClass('vp-input method');
                suggestInput.addClass(VP_INS_SEARCH);
                suggestInput.setPlaceholder("search method");
                suggestInput.setSuggestList(function() { return methodList; });
                suggestInput.setSelectEvent(function(value, item) {
                    $(this.wrapSelector()).val(value);
                    $(that.wrapSelector('.' + VP_INS_TYPE + '.method')).val(item.type);
    
                    $(that.pageThis.wrapSelector('#' + that.targetId)).trigger({
                        type:"instance_editor_selected",
                        varName: value,
                        varType: item.type,
                        isMethod: true
                    });
                });
                $(that.wrapSelector('.' + VP_INS_SEARCH + '.method')).replaceWith(function() {
                    return suggestInput.toTagString();
                });

                // get parameter
                var splitList = variable.split('.');
                if (splitList && splitList.length > 0) {
                    var lastSplit = splitList[splitList.length - 1];
                    // if bracket is at the end of code
                    var matchList = lastSplit.match(/\(.*?\)$/gi);
                    if (matchList != null && matchList.length > 0) {
                        var lastBracket = matchList[matchList.length - 1];
                        // remove first/last brackets
                        var parameter = lastBracket.substr(1, lastBracket.length - 2);
                        $(that.wrapSelector('.' + VP_INS_PARAMETER)).val(parameter);
                        $(that.wrapSelector('.' + VP_INS_PARAMETER)).show();
                    } else {
                        $(that.wrapSelector('.' + VP_INS_PARAMETER)).val('');
                        $(that.wrapSelector('.' + VP_INS_PARAMETER)).hide();
                    }
                } else {
                    $(that.wrapSelector('.' + VP_INS_PARAMETER)).hide();
                }
            }

            // callback
            if (callback) {
                callback(varObj);
            }
        });

        
    }

    InstanceEditor.prototype.show = function() {
        $(this.wrapSelector()).show();
        this.reload();
    }

    InstanceEditor.prototype.hide = function() {
        $(this.wrapSelector()).hide();
    }

    return InstanceEditor;
})