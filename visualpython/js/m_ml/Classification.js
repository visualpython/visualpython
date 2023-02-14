/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Classification.js
 *    Author          : Black Logic
 *    Note            : Model selection and fitting
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 02. 07
 *    Change Date     :
 */

//============================================================================
// [CLASS] Classification
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
    'vp_base/js/com/component/ModelEditor'
], function(msHtml, com_util, com_interface, com_String, com_generator, ML_LIBRARIES, PopupComponent, VarSelector2, ModelEditor) {

    /**
     * Classification
     */
    class Classification extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 2;
            this.config.dataview = false;

            this.state = {
                // model creation
                modelControlType: 'creation',
                modelType: 'lg-rgs',
                userOption: '',
                featureData: 'X_train',
                targetData: 'y_train',
                allocateToCreation: 'model',
                // model selection
                model: '',
                method: '',
                ...this.state
            }

            this.modelConfig = ML_LIBRARIES;

            this.modelTypeList = {
                'Classfication': ['lg-rgs', 'bern-nb', 'mulnom-nb', 'gaus-nb', 'sv-clf', 'dt-clf', 'rf-clf', 'gbm-clf', 'xgb-clf', 'lgbm-clf', 'cb-clf'],
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
                that.viewOption();

                // show install button
                if (that.modelConfig[modelType].install != undefined) {
                    $(that.wrapSelector('#vp_installLibrary')).show();
                } else {
                    $(that.wrapSelector('#vp_installLibrary')).hide();
                }
            });

            // install library
            $(this.wrapSelector('#vp_installLibrary')).on('click', function() {
                let config = that.modelConfig[that.state.modelType];
                if (config && config.install != undefined) {
                    // insert install code
                    com_interface.insertCell('code', config.install, true, 'Machine Learning > Classification');
                }
            });
            
            // change model
            $(this.wrapSelector('#model')).on('change', function() {
                that.modelEditor.reload();
            });
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
            vpKernel.getModelList('Classification').then(function(resultObj) {
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
            // render tag
            config.options.forEach(opt => {
                optBox.appendFormatLine('<label for="{0}" title="{1}">{2}</label>'
                    , opt.name, opt.name, com_util.optionToLabel(opt.name));
                let content = com_generator.renderContent(this, opt.component[0], opt, state);
                optBox.appendLine(content[0].outerHTML);
            });
            // render user option
            optBox.appendFormatLine('<label for="{0}">{1}</label>', 'userOption', 'User option');
            optBox.appendFormatLine('<input type="text" class="vp-input vp-state" id="{0}" placeholder="{1}" value="{2}"/>',
                                        'userOption', 'key=value, ...', this.state.userOption);
            return optBox.toString();
        }

        viewOption() {
            // SVC - kernel selection
            if (this.state.modelType == 'sv-clf') {
                let kernelType = this.state.kernel;
                switch (kernelType) {
                    case undefined: // default = rbf
                    case '':
                    case 'rbf': // gamma
                        $(this.wrapSelector('label[for="gamma"]')).show();
                        $(this.wrapSelector('#gamma')).show(); 
                        // hide others
                        $(this.wrapSelector('label[for="degree"]')).hide();
                        $(this.wrapSelector('#degree')).hide();
                        $(this.wrapSelector('label[for="coef0"]')).hide();
                        $(this.wrapSelector('#coef0')).hide();
                        break;
                    case 'poly': // gamma / degree / coef0
                        $(this.wrapSelector('label[for="gamma"]')).show();
                        $(this.wrapSelector('#gamma')).show(); 
                        $(this.wrapSelector('label[for="degree"]')).show();
                        $(this.wrapSelector('#degree')).show(); 
                        $(this.wrapSelector('label[for="coef0"]')).show();
                        $(this.wrapSelector('#coef0')).show();
                        break;
                    case 'sigmoid': // gamma / coef0
                        $(this.wrapSelector('label[for="gamma"]')).show();
                        $(this.wrapSelector('#gamma')).show(); 
                        $(this.wrapSelector('label[for="coef0"]')).show();
                        $(this.wrapSelector('#coef0')).show();
                        // hide others
                        $(this.wrapSelector('label[for="degree"]')).hide();
                        $(this.wrapSelector('#degree')).hide();
                        break;
                    default:
                        // hide others
                        $(this.wrapSelector('label[for="gamma"]')).hide();
                        $(this.wrapSelector('#gamma')).hide(); 
                        $(this.wrapSelector('label[for="degree"]')).hide();
                        $(this.wrapSelector('#degree')).hide();
                        $(this.wrapSelector('label[for="coef0"]')).hide();
                        $(this.wrapSelector('#coef0')).hide();
                        break;
                }

                // Model Creation - SVC kernel selection
                let that = this;
                $(this.wrapSelector('#kernel')).off('change');
                $(this.wrapSelector('#kernel')).change(function() {
                    that.state.kernel = $(this).val();
                    that.viewOption();
                });
            }

        }

        render() {
            super.render();

            // Model Creation - dynamically view options
            this.viewOption();

            // Model Editor
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
                code.appendLine();
    
                // model code
                let modelCode = config.code;
                modelCode = com_generator.vp_codeGenerator(this, config, this.state, (userOption != ''? ', ' + userOption : ''));
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

    return Classification;
});