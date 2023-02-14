/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : DataPrep.js
 *    Author          : Black Logic
 *    Note            : Model selection and fitting
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 02. 07
 *    Change Date     :
 */

//============================================================================
// [CLASS] DataPrep
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_ml/model.html'), // INTEGRATION: unified version of text loader
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/data/m_ml/mlLibrary',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/VarSelector2',
    'vp_base/js/com/component/ModelEditor',
    'vp_base/js/com/component/MultiSelector'
], function(msHtml, com_util, com_interface, com_String, com_generator, ML_LIBRARIES, PopupComponent, VarSelector2, ModelEditor, MultiSelector) {

    /**
     * DataPrep
     */
    class DataPrep extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 2;
            this.config.dataview = false;

            this.state = {
                // model creation
                modelControlType: 'creation',
                modelType: 'prep-onehot',
                userOption: '',
                featureData: 'X_train',
                targetData: 'y_train',
                allocateToCreation: 'model',
                // model selection
                model: '',
                method: '',
                ...this.state
            }

            this.popup = {
                type: '',
                targetSelector: '',
                colSelector: undefined // multi column selector
            }

            this.modelConfig = ML_LIBRARIES;

            this.modelTypeList = {
                'Encoding': ['prep-onehot', 'prep-label', 'prep-ordinal', 'prep-target', 'prep-smote'],
                'Scaling': ['prep-standard', 'prep-robust', 'prep-minmax', 'prep-normalizer', 'prep-func-trsfrm-log', 'prep-func-trsfrm-exp', 'prep-poly-feat', 'prep-kbins-discretizer'],
                'ETC': ['make-column-transformer']
            }

            this.mctEstimator = {
                'Encoding': ['prep-onehot', 'prep-label', 'prep-ordinal', 'prep-target', 'prep-smote'],
                'Scaling': ['prep-standard', 'prep-robust', 'prep-minmax', 'prep-normalizer', 'prep-func-trsfrm-log', 'prep-func-trsfrm-exp', 'prep-poly-feat', 'prep-kbins-discretizer'],
            }

        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            // select model control type
            $(this.wrapSelector('#modelControlType')).on('change', function() {
                let modelControlType = $(this).val();
                // show/hide model box
                $(that.wrapSelector('.vp-model-box')).hide();
                $(that.wrapSelector(`.vp-model-box[data-type="${modelControlType}"]`)).show();
            });

            // select model type
            $(this.wrapSelector('#modelType')).on('change', function() {
                let modelType = $(this).val();
                that.state.modelType = modelType;
                $(that.wrapSelector('.vp-model-option-box')).html(that.templateForOption(modelType));

                // show install button
                if (that.modelConfig[modelType].install != undefined) {
                    $(that.wrapSelector('#vp_installLibrary')).show();
                } else {
                    $(that.wrapSelector('#vp_installLibrary')).hide();
                }

                if (modelType == 'make-column-transformer') {
                    // load mct-targetData
                    that.loadVariableList();
                    that.bindMCT();
                }
            });

            // install library
            $(this.wrapSelector('#vp_installLibrary')).on('click', function() {
                let config = that.modelConfig[that.state.modelType];
                if (config && config.install != undefined) {
                    // insert install code
                    com_interface.insertCell('code', config.install, true, 'Machine Learning > DataPrep');
                }
            });

            // change model
            $(this.wrapSelector('#model')).on('change', function() {
                that.modelEditor.reload();
            });
        }

        bindMCT() {
            let that = this;
            // mct : click column selector 1
            $(this.wrapSelector('#mct_columns1btn')).on('click', function() {
                that.openColumnSelector($(that.wrapSelector('#mct_columns1')), 'Select columns to transform');
            });

            // mct : click column selector 2
            $(this.wrapSelector('#mct_columns2btn')).on('click', function() {
                that.openColumnSelector($(that.wrapSelector('#mct_columns2')), 'Select columns to transform');
            });
        }

        /**
         * Open Inner popup page for column selection
         * @param {Object} targetSelector 
         * @param {string} title 
         * @param {Array<string>} includeList 
         */
         openColumnSelector(targetSelector, title='Select columns', includeList=[]) {
            this.popup.type = 'column';
            this.popup.targetSelector = targetSelector;
            var previousList = targetSelector.data('list');
            if (previousList) {
                previousList = previousList.map(col => col.code)
            }
            this.renderMultiSelector(previousList, includeList);
            this.openInnerPopup(title);
        }   

        /**
         * Render column selector using MultiSelector module
         * @param {Array<string>} previousList previous selected columns
         * @param {Array<string>} includeList columns to include 
         */
         renderMultiSelector(previousList, includeList) {
            this.popup.colSelector = new MultiSelector(this.wrapSelector('.vp-inner-popup-body'),
                { mode: 'columns', parent: [this.state.mct_targetData], selectedList: previousList, includeList: includeList }
            );
        }

        templateForBody() {
            let page = $(msHtml);
            
            let that = this;

            // model control type
            $(page).find('.vp-model-box').hide();
            $(page).find(`.vp-model-box[data-type="${this.state.modelControlType}"]`).show();

            //================================================================
            // Model creation
            //================================================================
            // model types
            let modelTypeTag = new com_String();
            Object.keys(this.modelTypeList).forEach(modelCategory => {
                let modelOptionTag = new com_String();
                that.modelTypeList[modelCategory].forEach(opt => {
                    let optConfig = that.modelConfig[opt];
                    let selectedFlag = '';
                    if (opt == that.state.modelType) {
                        selectedFlag = 'selected';
                    }
                    modelOptionTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                                    opt, selectedFlag, optConfig.name);
                })
                modelTypeTag.appendFormatLine('<optgroup label="{0}">{1}</optgroup>', 
                    modelCategory, modelOptionTag.toString());
            });
            $(page).find('#modelType').html(modelTypeTag.toString());

            // show install button
            if (this.modelConfig[this.state.modelType].install != undefined) {
                $(page).find('#vp_installLibrary').show();
            } else {
                $(page).find('#vp_installLibrary').hide();
            }

            // render option page
            $(page).find('.vp-model-option-box').html(this.templateForOption(this.state.modelType));

            let varSelector = new VarSelector2(this.wrapSelector());
            varSelector.setComponentID('featureData');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.featureData);
            $(page).find('#featureData').replaceWith(varSelector.toTagString());

            varSelector = new VarSelector2(this.wrapSelector());
            varSelector.setComponentID('targetData');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.targetData);
            $(page).find('#targetData').replaceWith(varSelector.toTagString());

            //================================================================
            // Model selection
            //================================================================
            // set model list
            let modelOptionTag = new com_String();
            vpKernel.getModelList('Data Preparation').then(function(resultObj) {
                let { result } = resultObj;
                var modelList = JSON.parse(result);
                modelList && modelList.forEach(model => {
                    let selectFlag = '';
                    if (model.varName == that.state.model) {
                        selectFlag = 'selected';
                    }
                    modelOptionTag.appendFormatLine('<option value="{0}" data-type="{1}" {2}>{3} ({4})</option>', 
                        model.varName, model.varType, selectFlag, model.varName, model.varType);
                });
                $(page).find('#model').html(modelOptionTag.toString());
                $(that.wrapSelector('#model')).html(modelOptionTag.toString());

                if (!that.state.model || that.state.model == '') {
                    that.state.model = $(that.wrapSelector('#model')).val();
                }

                that.modelEditor.show();
            });

            //================================================================
            // Load state
            //================================================================
            Object.keys(this.state).forEach(key => {
                let tag = $(page).find('#' + key);
                let tagName = $(tag).prop('tagName'); // returns with UpperCase
                let value = that.state[key];
                if (value == undefined) {
                    return;
                }
                switch(tagName) {
                    case 'INPUT':
                        let inputType = $(tag).prop('type');
                        if (inputType == 'text' || inputType == 'number' || inputType == 'hidden') {
                            $(tag).val(value);
                            break;
                        }
                        if (inputType == 'checkbox') {
                            $(tag).prop('checked', value);
                            break;
                        }
                        break;
                    case 'TEXTAREA':
                    case 'SELECT':
                    default:
                        $(tag).val(value);
                        break;
                }
            });

            return page;
        }

        templateForOption(modelType) {
            let config = this.modelConfig[modelType];
            let state = this.state;
            let optBox = new com_String();
            if (modelType == 'make-column-transformer') {
                let that = this;
                // render tag
                // DataFrame selection
                optBox.appendLine('<label for="mct_targetData" class="vp-orange-text">DataFrame</label>');
                optBox.appendLine('<select id="mct_targetData" class="vp-state vp-select"></select>');
                // Estimator 1 selection
                optBox.appendLine('<label for="">Estimator 1</label>');
                optBox.appendLine('<select id="mct_estimator1" class="vp-state vp-select">');
                optBox.appendFormatLine('<option value="{0}">{1}</option>', '', 'None');
                Object.keys(this.mctEstimator).forEach(modelCategory => {
                    let modelOptionTag = new com_String();
                    that.mctEstimator[modelCategory].forEach(opt => {
                        let optConfig = that.modelConfig[opt];
                        let selectedFlag = '';
                        if (opt == that.state.mct_estimator1) {
                            selectedFlag = 'selected';
                        }
                        modelOptionTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                                        opt, selectedFlag, optConfig.name);
                    })
                    optBox.appendFormatLine('<optgroup label="{0}">{1}</optgroup>', 
                        modelCategory, modelOptionTag.toString());
                });
                optBox.appendLine('</select>');
                // Estimator 1 column selection
                optBox.appendLine('<label for="mct_columns1">Columns 1</label>');
                optBox.appendLine('<div>');
                optBox.appendLine('<input type="text" id="mct_columns1" class="vp-input vp-state" placeholder="Estimator 1 columns" disabled="">');
                optBox.appendLine('<button id="mct_columns1btn" class="vp-button w50">Edit</button>');
                optBox.appendLine('</div>');

                // Estimator 2 selection
                optBox.appendLine('<label for="">Estimator 2</label>');
                optBox.appendLine('<select id="mct_estimator2" class="vp-state vp-select">');
                optBox.appendFormatLine('<option value="{0}">{1}</option>', '', 'None');
                Object.keys(this.mctEstimator).forEach(modelCategory => {
                    let modelOptionTag = new com_String();
                    that.mctEstimator[modelCategory].forEach(opt => {
                        let optConfig = that.modelConfig[opt];
                        let selectedFlag = '';
                        if (opt == that.state.mct_estimator2) {
                            selectedFlag = 'selected';
                        }
                        modelOptionTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                                        opt, selectedFlag, optConfig.name);
                    })
                    optBox.appendFormatLine('<optgroup label="{0}">{1}</optgroup>', 
                        modelCategory, modelOptionTag.toString());
                });
                optBox.appendLine('</select>');
                // Estimator 2 column selection
                optBox.appendLine('<label for="mct_columns1">Columns 2</label>');
                optBox.appendLine('<div>');
                optBox.appendLine('<input type="text" id="mct_columns2" class="vp-input vp-state" placeholder="Estimator 2 columns" disabled="">');
                optBox.appendLine('<button id="mct_columns2btn" class="vp-button w50">Edit</button>');
                optBox.appendLine('</div>');
                
            } else {
                // render tag
                config.options.forEach(opt => {
                    optBox.appendFormatLine('<label for="{0}" title="{1}">{2}</label>'
                        , opt.name, opt.name, com_util.optionToLabel(opt.name));
                    let content = com_generator.renderContent(this, opt.component[0], opt, state);
                    optBox.appendLine(content[0].outerHTML);
                });
                // show user option
                if (config.code.includes('${etc}')) {
                    // render user option
                    optBox.appendFormatLine('<label for="{0}">{1}</label>', 'userOption', 'User option');
                    optBox.appendFormatLine('<input type="text" class="vp-input vp-state" id="{0}" placeholder="{1}" value="{2}"/>',
                                                'userOption', 'key=value, ...', this.state.userOption);
                }
            }
            return optBox.toString();
        }

        /**
         * Load variable list (dataframe)
         */
        loadVariableList() {
            var that = this;
            // load using kernel
            var dataTypes = ['DataFrame'];
            vpKernel.getDataList(dataTypes).then(function(resultObj) {
                let { result } = resultObj;
                try {
                    var varList = JSON.parse(result);
                    // render variable list
                    // get prevvalue
                    var prevValue = that.state.mct_targetData;
                    // replace
                    $(that.wrapSelector('#mct_targetData')).replaceWith(function() {
                        var tag = new com_String();
                        tag.appendFormatLine('<select id="{0}" class="vp-select vp-state">', 'mct_targetData');
                        varList.forEach(vObj => {
                            // varName, varType
                            var label = vObj.varName;
                            tag.appendFormatLine('<option value="{0}" data-type="{1}" {2}>{3}</option>'
                                                , vObj.varName, vObj.varType
                                                , prevValue == vObj.varName?'selected':''
                                                , label);
                        });
                        tag.appendLine('</select>'); // VP_VS_VARIABLES
                        return tag.toString();
                    });
                    $(that.wrapSelector('#mct_targetData')).trigger('change');
                } catch (ex) {
                    vpLog.display(VP_LOG_TYPE.ERROR, 'DataPrep:', result);
                }
            });
        }

        handleInnerOk() {
            // ok input popup
            var dataList = this.popup.colSelector.getDataList();

            $(this.popup.targetSelector).val(dataList.map(col => { return col.code }).join(','));
            $(this.popup.targetSelector).data('list', dataList);
            $(this.popup.targetSelector).trigger({ type: 'change', dataList: dataList });
            this.closeInnerPopup();
        }

        render() {
            super.render();

            this.loadVariableList();
            this.bindMCT();

            // Instance Editor
            this.modelEditor = new ModelEditor(this, "model", "instanceEditor");
        }

        generateCode() {
            let { modelControlType, modelType, userOption, allocateToCreation, model } = this.state;
            let code = new com_String();
            if (modelControlType == 'creation') {
                /**
                 * Model Creation
                 * ---
                 * from module import model_function
                 * model = Model(key=value, ...)
                 */
                let config = this.modelConfig[modelType];
                code.appendLine(config.import);

                // model code
                let modelCode = config.code;
                modelCode = com_generator.vp_codeGenerator(this, config, this.state, (userOption != ''? ', ' + userOption : ''));

                // generate mct code
                if (modelType == 'make-column-transformer') {
                    let mctCodes = [];
                    let { mct_estimator1, mct_columns1, mct_estimator2, mct_columns2 } = this.state;
                    if (mct_estimator1 != undefined && mct_estimator1 != '') {
                        code.appendLine(this.modelConfig[mct_estimator1].import);
                        let estimator1code = com_generator.vp_codeGenerator(this, this.modelConfig[mct_estimator1], this.state, (userOption != ''? ', ' + userOption : ''));
                        mctCodes.push(com_util.formatString('({0}, [{1}])', estimator1code, mct_columns1));
                    }
                    if (mct_estimator2 != undefined && mct_estimator2 != '') {
                        code.appendLine(this.modelConfig[mct_estimator2].import);
                        let estimator2code = com_generator.vp_codeGenerator(this, this.modelConfig[mct_estimator2], this.state, (userOption != ''? ', ' + userOption : ''));
                        mctCodes.push(com_util.formatString('({0}, [{1}])', estimator2code, mct_columns2));
                    }
                    modelCode = modelCode.replace('${mct_code}', mctCodes.join(', '));
                }

                code.appendLine();
                code.appendFormat('{0} = {1}', allocateToCreation, modelCode);                
            } else {
                /**
                 * Model Selection
                 * ---
                 * ...
                 */
                code.append(this.modelEditor.getCode({'${model}': model}));
            }

            return code.toString();
        }

    }

    return DataPrep;
});