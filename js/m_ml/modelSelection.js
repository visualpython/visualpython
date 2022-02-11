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
    'vp_base/js/com/component/PopupComponent'
], function(msHtml, com_util, com_Const, com_String, com_generator, PopupComponent) {

    /**
     * Model selection
     */
    class ModelSelection extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 2;
            this.config.dataview = false;

            this.state = {
                model: 'rf-clf',
                featureData: 'X_train',
                targetData: 'y_train',
                allocateTo: 'model',
                ...this.state
            }

            this.modelTypes = {
                'Classfication': ['rf-clf', 'tpot-clf', 'sv-clf'],
                'Regression': ['ln-rgs', 'lg-rgs', 'rf-rgs', 'tpot-rgs'],
                'Clustering': [], //TODO:
                'PCA': [] //TODO:
            }

            this.modelConfig = {
                /** Classification */
                'rf-clf': {
                    name: 'RandomForestClassifier',
                    import: 'from sklearn.ensemble import RandomForestClassifier',
                    code: 'RandomForestClassifier(...)',
                },
                'tpot-clf': {
                    name: 'TPOTClassifier',
                    import: 'from tpot import TPOTClassifier',
                    code: 'TPOTClassifier(...)'
                },
                'sv-clf': {
                    name: 'SupportVectorClassifier',
                    import: 'from sklearn.svm import SVC',
                    code: 'SVC(...)',
                },
                /** Regression */
                'ln-rgs': {
                    name: 'LinearRegression',
                    import: 'from sklearn.linear_model import LinearRegression',
                    code: 'LinearRegression(...)'
                },
                'lg-rgs': {
                    name: 'LogisticRegression',
                    import: 'from sklearn.linear_model import LogisticRegression',
                    code: 'LogisticRegression(...)'
                },
                'rf-rgs': {
                    name: 'RandomForestRegressor',
                    import: 'from sklearn.ensemble import RandomForestRegressor',
                    code: 'RandomForestRegressor(...)',
                },
                'tpot-rgs': {
                    name: 'TPOTRegressor',
                    import: 'from tpot import TPOTRegressor',
                    code: 'TPOTRegressor(...)',
                }
                /** Clustering */

                /** PCA */

            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            // select model
            $(this.wrapSelector('#model')).on('click', function() {
                let model = $(this).val();
                that.state.model = model;
                $(that.wrapSelector('.vp-model-option-box')).hide();
                $(that.wrapSelector('.vp-model-' + model)).show();
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

            // option page
            $(page).find('.vp-model-option-box').hide();
            $(page).find('.vp-model-' + this.state.model).show();
            return page;
        }

        generateCode() {
            /**
             * from module import model_function
             * model = Model(key=value, ...)
             * ---
             * %%time
             * model.fit(X_train, y_train)
             */
            let code = new com_String();
            let { model, featureData, targetData, allocateTo } = this.state;
            let config = this.modelConfig[model];
            code.appendLine(config.import);
            code.appendLine();
            code.appendFormat('{0} = {1}', allocateTo, config.code);

            // fit
            code.appendLine();
            code.appendLine('%%time');
            code.appendLine('# Model fitting');
            code.appendFormat('{0}.fit({1}, {2})', allocateTo, featureData, targetData);
            return code.toString();
        }

    }

    return ModelSelection;
});