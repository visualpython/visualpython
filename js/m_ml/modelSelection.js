/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : modelSelection.js
 *    Author          : Black Logic
 *    Note            : Model selection and fitting
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 02. 07
 *    Change Date     :
 */

//============================================================================
// [CLASS] Model selection
//============================================================================
define([
    'text!vp_base/html/m_ml/modelSelection.html!strip',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/data/m_ml/mlLibrary',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/VarSelector2'
], function(msHtml, com_util, com_Const, com_String, com_generator, ML_LIBRARIES, PopupComponent, VarSelector2) {

    /**
     * Model selection
     */
    class ModelSelection extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 2;
            this.config.dataview = false;

            this.state = {
                model: 'ln-rgs',
                userOption: '',
                featureData: 'X_train',
                targetData: 'y_train',
                allocateTo: 'model',
                ...this.state
            }

            this.modelTypes = {
                'Regression': ['ln-rgs', 'sv-rgs', 'dt-rgs', 'rf-rgs', 'gbm-rgs', 'xgb-rgs', 'lgbm-rgs', 'cb-rgs'],
                'Classfication': ['lg-rgs', 'sv-clf', 'dt-clf', 'rf-clf', 'gbm-clf', 'xgb-clf', 'lgbm-clf', 'cb-clf'],
                'Auto ML': ['tpot-rgs', 'tpot-clf'],
                'Clustering': ['k-means', 'agg-cls', 'gaus-mix', 'dbscan'], 
                'Dimension Reduction': ['pca', 'lda', 'svd', 'nmf'] 
            }

            this.modelConfig = ML_LIBRARIES;
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            // select model
            $(this.wrapSelector('#model')).on('change', function() {
                let model = $(this).val();
                that.state.model = model;
                $(that.wrapSelector('.vp-model-option-box')).html(that.templateForOption(model));

                // show install button
                if (that.modelConfig[model].install != undefined) {
                    $(that.wrapSelector('#vp_installLibrary')).show();
                } else {
                    $(that.wrapSelector('#vp_installLibrary')).hide();
                }
            });

            // install library
            $(this.wrapSelector('#vp_installLibrary')).on('click', function() {
                let config = that.modelConfig[model];
                if (config && config.install != undefined) {
                    // insert install code
                    com_interface.insertCell('code', config.install);
                }
            });
        }

        templateForBody() {
            let page = $(msHtml);
            
            let that = this;
            // model types
            let modelTypeTag = new com_String();
            Object.keys(this.modelTypes).forEach(modelCategory => {
                let modelOptionTag = new com_String();
                that.modelTypes[modelCategory].forEach(opt => {
                    let optConfig = that.modelConfig[opt];
                    let selectedFlag = '';
                    if (opt == that.state.model) {
                        selectedFlag = 'selected';
                    }
                    modelOptionTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                                    opt, selectedFlag, optConfig.name);
                })
                modelTypeTag.appendFormatLine('<optgroup label="{0}">{1}</optgroup>', 
                    modelCategory, modelOptionTag.toString());
            });
            $(page).find('#model').html(modelTypeTag.toString());

            // show install button
            if (this.modelConfig[this.state.model].install != undefined) {
                $(page).find('#vp_installLibrary').show();
            } else {
                $(page).find('#vp_installLibrary').hide();
            }

            // render option page
            $(page).find('.vp-model-option-box').html(this.templateForOption(this.state.model));

            let varSelector = new VarSelector2(this.wrapSelector(), ['DataFrame', 'List', 'string']);
            varSelector.setComponentID('featureData');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.featureData);
            $(page).find('#featureData').replaceWith(varSelector.toTagString());

            varSelector = new VarSelector2(this.wrapSelector(), ['DataFrame', 'List', 'string']);
            varSelector.setComponentID('targetData');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.targetData);
            $(page).find('#targetData').replaceWith(varSelector.toTagString());

            return page;
        }

        templateForOption(model) {
            let config = this.modelConfig[model];
            let state = this.state;

            let optBox = new com_String();
            // render tag
            config.options.forEach(opt => {
                optBox.appendFormatLine('<label for="{0}" title="{1}">{2}</label>'
                    , opt.name, opt.name, opt.name);
                let content = com_generator.renderContent(this, opt.component[0], opt, state);
                optBox.appendLine(content[0].outerHTML);
            });
            // render user option
            optBox.appendFormatLine('<label for="{0}">{1}</label>', 'userOption', 'User option');
            optBox.appendFormatLine('<input type="text" class="vp-input vp-state" id="{0}" placeholder="{1}" value="{2}"/>',
                                        'userOption', 'key=value, ...', this.state.userOption);
            return optBox.toString();
        }

        generateCode() {
            /**
             * from module import model_function
             * model = Model(key=value, ...)
             */
            let code = new com_String();
            let { model, userOption, featureData, targetData, allocateTo } = this.state;
            let config = this.modelConfig[model];
            code.appendLine(config.import);
            code.appendLine();

            // model code
            let modelCode = config.code;
            modelCode = com_generator.vp_codeGenerator(this, config, this.state, userOption);
            code.appendFormat('{0} = {1}', allocateTo, modelCode);

            return code.toString();
        }

    }

    return ModelSelection;
});