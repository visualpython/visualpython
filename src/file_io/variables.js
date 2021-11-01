define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/pandas/common/commonPandas'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, libPandas, pdGen) {
    // option property
    const funcOptProp = {
        stepCount : 1
        , funcName : "Variables"
        , funcID : "com_variables"
        , libID : "pd000"
    }

    /**
     * html load callback. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback container's callback
     */
    var optionLoadCallback = function(callback, meta) {
        // execute callback function if available
        if (typeof(callback) === 'function') {
            var uuid = 'u' + vpCommon.getUUID();
            // maximum 10 duplication allowed
            for (var idx = 0; idx < 10; idx++) {
                // uuid check and re-generate
                if ($(vpConst.VP_CONTAINER_ID).find("." + uuid).length > 0) {
                    uuid = 'u' + vpCommon.getUUID();
                }
            }
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM))).find(vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE)).addClass(uuid);

            // create object
            var varPackage = new VariablePackage(uuid);
            varPackage.metadata = meta;

            // set option property
            varPackage.setOptionProp(funcOptProp);
            // html setting
            varPackage.initHtml();
            callback(varPackage);
        }
    }
    
    /**
     * Load html
     * @param {function} callback container's callback
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "file_io/variables.html", optionLoadCallback, callback, meta);
    }

    /**
     * Option package
     * @param {String} uuid unique id
     */
    var VariablePackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        // pandas function
        this.package = libPandas._PANDAS_FUNCTION[funcOptProp.libID];
    }



    /**
     * Extend vpFuncJS
     */
    VariablePackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * Validation
     * @returns true if it's valid
     */
    VariablePackage.prototype.optionValidation = function() {
        return true;

        // parent's validation
        // vpFuncJS.VpFuncJS.prototype.optionValidation.apply(this);
    }


    /**
     * html inner binding
     */
    VariablePackage.prototype.initHtml = function() {
        this.showFunctionTitle();

        this.loadVariables();

        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/commonPandas.css");
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "file_io/variables.css");

        this.bindEvent();
    }

    /**
     * package title
     */
    VariablePackage.prototype.showFunctionTitle = function() {
        $(this.wrapSelector('.vp_functionName')).text(funcOptProp.funcName);
    }

    VariablePackage.prototype.bindEvent = function() {
        var that = this;

        // load variables on refresh
        $(this.wrapSelector('#vp_varRefresh')).click(function(event) {
            event.stopPropagation();
            that.loadVariables();
        });
    }

    /**
     * Search variables
     */
    VariablePackage.prototype.loadVariables = function() {
        var that = this;

        // Searchable variable types
        var types = [
            // pandas object
            'DataFrame', 'Series', 'Index', 'Period', 'GroupBy', 'Timestamp'
            // Index type object
            , 'RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'
            // GroupBy type object
            , 'DataFrameGroupBy', 'SeriesGroupBy'
            // Plot type
            , 'Figure', 'AxesSubplot'
            // Numpy
            , 'ndarray'
            // Python variable
            , 'str', 'int', 'float', 'bool', 'dict', 'list', 'tuple'
        ];

        var tagTable = this.wrapSelector('#vp_var_variableBox table');

        // variable list table
        var tagDetailTable = this.wrapSelector("#vp_varDetailTable");
        
        // initialize tags
        $(tagTable).find('tr:not(:first)').remove();
        $(tagDetailTable).html('');
        
        // HTML rendering
        pdGen.vp_searchVarList(types, function(result) {
            // var jsonVars = result.replace(/'/gi, `"`);
            // var varList = JSON.parse(jsonVars);
            var varList = JSON.parse(result);

            // add variable list in table
            varList.forEach(varObj => {
                if (types.includes(varObj.varType) && varObj.varName[0] !== '_') {
                    var tagTr = document.createElement('tr');
                    var tagTdName = document.createElement('td');
                    var tagTdType = document.createElement('td');
                    $(tagTr).attr({
                        'data-var-name': varObj.varName,
                        'data-var-type': varObj.varType
                    });
                    tagTdName.innerText = varObj.varName;
                    tagTdType.innerText = varObj.varType;

                    $(tagTr).append(tagTdName);
                    $(tagTr).append(tagTdType);

                    // variable click
                    $(tagTr).click(function() {
                        $(this).parent().find('tr').removeClass('selected');
                        $(this).addClass('selected');

                        // show variable information on clicking variable
                        Jupyter.notebook.kernel.execute(
                            varObj.varName,
                            {
                                iopub: {
                                    output: function (msg) {
                                        var textResult = msg.content.data["text/plain"];
                                        var htmlResult = msg.content.data["text/html"];
                                        var imgResult = msg.content.data["image/png"];
                                        
                                        $(tagDetailTable).html('');
                                        if (htmlResult != undefined) {
                                            // 1. HTML tag
                                            $(tagDetailTable).append(htmlResult);
                                        } else if (imgResult != undefined) {
                                            // 2. Image data (base64)
                                            var imgTag = '<img src="data:image/png;base64, ' + imgResult + '">';
                                            $(tagDetailTable).append(imgTag);
                                        } else if (textResult != undefined) {
                                            // 3. Text data
                                            var preTag = document.createElement('pre');
                                            $(preTag).text(textResult);
                                            $(tagDetailTable).html(preTag);
                                        } else {
                                            $(tagDetailTable).append('(Select variables to preview the data.)');
                                        }
                                    }
                                }
                            },
                            { silent: false }
                        );
                    })

                    $(tagTable).append(tagTr);
                }
            });
        });
    };

    /**
     * Generate code
     * @param {boolean} exec do execute
     */
    VariablePackage.prototype.generateCode = function(addCell, exec) {
        
        var sbCode = new sb.StringBuilder();

        // show selected variable
        var selectedVariable = $(this.wrapSelector('#vp_var_variableBox table tr.selected'));
        if (selectedVariable) {
            var varName = selectedVariable.attr('data-var-name');
            if (varName) {
                sbCode.appendFormat('{0}', varName);
            }
        }

        if (addCell) this.cellExecute(sbCode.toString(), exec);

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});