/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : ModelInfo.js
 *    Author          : Black Logic
 *    Note            : Model information
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 04. 20
 *    Change Date     :
 */

//============================================================================
// [CLASS] ModelInfo
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_ml/modelInfo.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_ml/modelInfo'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/data/m_ml/mlLibrary',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/VarSelector2',
    'vp_base/js/com/component/SuggestInput'
], function(msHtml, msCss, com_util, com_String, com_generator, ML_LIBRARIES, PopupComponent, VarSelector2, SuggestInput) {

    /**
     * ModelInfo
     */
    class ModelInfo extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 2;
            this.config.dataview = false;

            this.state = {
                // model selection
                category: 'All',
                model: '',
                modelType: '',
                method: '',
                info: {},
                optionConfig: {},
                userOption: '',
                ...this.state
            }

            // categories : Data Preparation / Regression / Classification / Clustering / Dimension Reduction / Auto ML
            this.modelCategories = [
                'All',
                ...vpConfig.getMLCategories()
            ]

            this.modelConfig = ML_LIBRARIES;

            this.loaded = false;

        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
        
            // click category
            $(this.wrapSelector('.vp-ins-select-list.category .vp-ins-select-item')).on('click', function() {
                let category = $(this).data('var-name');

                that.state.category = category;

                $(that.wrapSelector('.vp-ins-select-list.category .vp-ins-select-item')).removeClass('selected');
                $(this).addClass('selected');

                // load model list for this category
                that.loadModelList(category);
            });
        }

        templateForBody() {
            let page = $(msHtml);
            
            let that = this;

            //================================================================
            // Model selection
            //================================================================
            // set model category list
            let modelCategoryTag = new com_String();
            this.modelCategories.forEach(category => {
                let selected = '';
                if (category == that.state.category) {
                    selected = 'selected';
                }
                modelCategoryTag.appendFormatLine('<li class="{0} {1}" data-var-name="{2}" data-var-type="{3}" title="{4}">{5}</li>',
                'vp-ins-select-item', selected, category, 'category', category, category);
            });
            $(page).find('.vp-ins-select-list.category').html(modelCategoryTag.toString());

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
            let optionConfig = this.modelConfig[modelType];
            let state = this.state;

            let optBox = new com_String();
            // render tag
            optionConfig.options.forEach(opt => {
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

        render() {
            super.render();

            this.loadModelList(this.state.category);
        }

        loadModelList(category='') {
            // reset page
            try {
                $(this.wrapSelector('.vp-ins-search')).autocomplete("destroy");
            } catch { ; }
            $(this.wrapSelector('.vp-ins-select-list.info')).html('');
            $(this.wrapSelector('.vp-ins-parameter-box')).html('');

            if (category == 'All') {
                category = '';
            }
            // set model list
            let that = this;
            let modelOptionTag = new com_String();
            vpKernel.getModelList(category).then(function(resultObj) {
                let { result } = resultObj;
                var modelList = JSON.parse(result);
                modelList && modelList.forEach((model, idx) => {
                    let selectFlag = '';
                    // if this item is pre-selected model or first item of model list
                    if ((model.varName == that.state.model)
                        || (that.state.model == '' && idx == 0)) {
                        selectFlag = 'selected';
                        that.state.model = model.varName;
                        that.state.modelType = model.varType;
                    }
                    modelOptionTag.appendFormatLine('<li class="{0} {1}" data-var-name="{2}" data-var-type="{3}" title="{4}">{5} ({6})</li>',
                    'vp-ins-select-item', selectFlag, model.varName, model.varType, model.varName, model.varName, model.varType);
                });
                $(that.wrapSelector('.vp-ins-select-list.model')).html(modelOptionTag.toString());

                // click model event
                $(that.wrapSelector('.vp-ins-select-list.model .vp-ins-select-item')).on('click', function() {
                    let model = $(this).data('var-name');
                    let modelType = $(this).data('var-type');

                    that.state.model = model;
                    that.state.modelType = modelType;
                    
                    $(that.wrapSelector('.vp-ins-select-list.model .vp-ins-select-item')).removeClass('selected');
                    $(this).addClass('selected');

                    that.reload();
                });

                that.reload();
            });
        }

        /**
         * Load options for selected model
         */
        reload() {
            // reset option page
            try {
                $(this.wrapSelector('.vp-ins-search')).autocomplete("destroy");
            } catch { ; }
            $(this.wrapSelector('.vp-ins-select-list.info')).html('');
            $(this.wrapSelector('.vp-ins-parameter-box')).html('');
            
            let model = this.state.model;
            let modelType = this.state.modelType;
            
            let infos = this.getInfo(modelType);
            this.state.info = { ...infos };
            
            var infoListTag = new com_String();
            
            Object.keys(infos).forEach(infoKey => {
                let titleText = infos[infoKey].description;
                if (infos[infoKey].name != infos[infoKey].label) {   
                    titleText = infos[infoKey].name + ': ' + titleText;
                }
                infoListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>',
                'vp-ins-select-item', infoKey, 'info', titleText, infos[infoKey].label);
            });
            
            $(this.wrapSelector('.vp-ins-select-list.info')).html(infoListTag.toString());
            
            let that = this;
            // info search suggest
            let suggestInput = new SuggestInput();
            suggestInput.addClass('vp-input');
            suggestInput.addClass('vp-ins-search');
            suggestInput.setPlaceholder("Search information");
            suggestInput.setSuggestList(function () { return Object.keys(infos); });
            suggestInput.setSelectEvent(function (value, item) {
                $(this.wrapSelector()).val(value);
                $(that.wrapSelector('.vp-ins-type.info')).val(value);

                $(that.wrapSelector('.vp-ins-select-item[data-var-name="' + value + '"]')).click();
            });
            $(that.wrapSelector('.vp-ins-search')).replaceWith(function () {
                return suggestInput.toTagString();
            });

            // bind event
            // click option
            $(this.wrapSelector('.vp-ins-select-list.info .vp-ins-select-item')).on('click', function() {
                let name = $(this).data('var-name');
                let type = $(this).data('var-type');

                if (name == 'feature_importances') {
                    that.config.checkModules = ['pd', 'vp_create_feature_importances'];
                } else if (name == 'plot_feature_importances') {
                    that.config.checkModules = ['pd', 'plt', 'vp_create_feature_importances', 'vp_plot_feature_importances'];
                } else {
                    that.config.checkModules = ['pd'];
                }
                
                that.renderOptionPage(type, name);

                let optionPage = $(that.wrapSelector('.vp-ins-parameter-box')).get(0);
                optionPage && optionPage.scrollIntoView();
            });

            // load once on initializing page
            if (this.loaded == false) {
                let { modelEditorType, modelEditorName } = this.state;
                if (modelEditorType != '' && modelEditorName != '') {
                    // render option page for saved state
                    that.renderOptionPage(modelEditorType, modelEditorName);
                }
                // set loaded true
                this.loaded = true;
            }
        }

        /**
         * Render option page for selected option
         * @param {String} type action / info
         * @param {String} name option name (ex. fit/predict/...)
         */
        renderOptionPage(type, name) {
            if (this.state[type] != undefined && this.state[type][name] != undefined) {
                let optionConfig = this.state[type][name];
                let optBox = new com_String();
                // render tag
                optionConfig && optionConfig.options && optionConfig.options.forEach(opt => {
                    let label = opt.name;
                    if (opt.label != undefined) {
                        label = opt.label;
                    }
                    // fix label
                    label = com_util.optionToLabel(label);
                    optBox.appendFormatLine('<label for="{0}" title="{1}">{2}</label>'
                        , opt.name, opt.name, label);
                    let content = com_generator.renderContent(this, opt.component[0], opt, this.state);
                    optBox.appendLine(content[0].outerHTML);
                });
                // replace option box
                $(this.wrapSelector('.vp-ins-parameter-box')).html(optBox.toString());
    
                this.state.optionConfig = optionConfig;
    
                // add selection
                let typeClass = '.vp-ins-select-list.' + type;
                let nameClass = '.vp-ins-select-item[data-var-name="' + name + '"]';
                $(this.wrapSelector(typeClass + ' ' + '.vp-ins-select-item')).removeClass('selected');
                $(this.wrapSelector(typeClass + ' ' + nameClass)).addClass('selected');
                // set state
                $(this.wrapSelector('#modelEditorType')).val(type);
                $(this.wrapSelector('#modelEditorName')).val(name);
                this.state.modelEditorType = type;
                this.state.modelEditorName = name;
            }
        }

        generateCode() {
            let { model } = this.state;
            let codeList = [];
            let code = new com_String();
            let replaceDict = {'${model}': model};

            // If functions are available
            if (this.state.optionConfig.functions != undefined) {
                this.state.optionConfig.functions.forEach(func => {
                    codeList.push(func);
                });
            }

            // If import code is available, generate its code in front of code
            if (this.state.optionConfig.import != undefined) {
                code.appendLine(this.state.optionConfig.import);
                code.appendLine();
            }
            
            // Auto-generate model info code
            let modelCode = com_generator.vp_codeGenerator(this, this.state.optionConfig, this.state);
            if (modelCode) {
                Object.keys(replaceDict).forEach(key => {
                    modelCode = modelCode.replace(key, replaceDict[key]);
                });
                code.append(modelCode);
    
                // Exception for re-generating allocate variables
                if (!modelCode.includes('plt.show()')) {
                    // Find allocate variable
                    let allocateIdx = modelCode.indexOf(' = ');
                    if (allocateIdx >= 0) {
                        // if available, show again to display its value
                        let allocateCode = modelCode.substr(0, allocateIdx);
                        code.appendLine();
                        code.append(allocateCode);
                    }
                }
            }
            codeList.push(code.toString());

            return codeList;
        }

        getModelCategory(modelType) {
            let mlDict = vpConfig.getMLDataDict();
            let keys = Object.keys(mlDict);
            let modelCategory = '';
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (mlDict[key].includes(modelType)) {
                    modelCategory = key;
                    break;
                }
            }
            return modelCategory;
        }

        getInfo(modelType) {
            let category = this.getModelCategory(modelType);
            let infos = {};
            let defaultInfos = {
                'score': {
                    name: 'score',
                    label: 'Score',
                    code: '${score_allocate} = ${model}.score(${score_featureData}, ${score_targetData})',
                    description: '',
                    options: [
                        { name: 'score_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X_train' },
                        { name: 'score_targetData', label: 'Target Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'y_train' },
                        { name: 'score_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'scores' }
                    ]
                },
                'get_params': {
                    name: 'get_params',
                    label: 'Get parameters',
                    code: '${param_allocate} = ${model}.get_params(${deep})',
                    description: 'Get parameters for this estimator.',
                    options: [
                        { name: 'deep', component: ['bool_select'], default: 'True', usePair: true },
                        { name: 'param_allocate', label: 'Allocate to', component: ['input'], value: 'params' }
                    ]  
                },
                'permutation_importance': {
                    name: 'permutation_importance',
                    label: 'Permutation importance',
                    import: 'from sklearn.inspection import permutation_importance',
                    code: '${importance_allocate} = permutation_importance(${model}, ${importance_featureData}, ${importance_targetData}${scoring}${random_state}${etc})',
                    description: 'Permutation importance for feature evaluation.',
                    options: [
                        { name: 'importance_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X_train' },
                        { name: 'importance_targetData', label: 'Target Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'y_train' },
                        { name: 'scoring', component: ['input'], usePair: true },
                        { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true },
                        { name: 'importance_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'importances' }
                    ]
                },
                'feature_importances': {
                    name: 'feature_importances',
                    label: 'Feature importances',
                    code: "${fi_allocate} = vp_create_feature_importances(${model}, ${fi_featureData}${sort})",
                    description: 'Allocate feature_importances_',
                    options: [
                        { name: 'fi_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X_train' },
                        { name: 'fi_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'df_i' },
                        { name: 'sort', label: 'Sort data', component: ['bool_checkbox'], value: true, usePair: true }
                    ]
                },
                'plot_feature_importances': {
                    name: 'plot_feature_importances',
                    label: 'Plot feature importances',
                    code: "vp_plot_feature_importances(${model}, ${fi_featureData}${sort}${top_count})",
                    description: 'Draw feature_importances_',
                    options: [
                        { name: 'fi_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X_train' },
                        { name: 'sort', label: 'Sort data', component: ['bool_checkbox'], value: true, usePair: true },
                        { name: 'top_count', label: 'Top count', component: ['input_number'], min: 0, usePair: true },
                    ]
                }
            }
            switch (category) {
                case 'Data Preparation':
                    if (modelType == 'OneHotEncoder') {
                        infos = {
                            'categories_': { // TODO:
                                name: 'categories_',
                                label: 'Categories',
                                code: '${categories_allocate} = ${model}.categories_',
                                description: 'The categories of each feature determined during fitting',
                                options: [
                                    { name: 'categories_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'categories' }
                                ]
                            },
                            'get_feature_names_out': {
                                name: 'get_feature_names_out',
                                label: 'Get feature names',
                                code: '${feature_names_allocate} = ${model}.get_feature_names_out()',
                                description: 'Get output feature names.',
                                options: [
                                    { name: 'feature_names_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'features' }
                                ]
                            }
                        }
                    }
                    if (modelType == 'LabelEncoder') {
                        infos = {
                            'classes_': {
                                name: 'classes_',
                                label: 'Classes',
                                code: '${classes_allocate} = ${model}.classes_',
                                description: 'Holds the label for each class.',
                                options: [
                                    { name: 'classes_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'classes' }
                                ]
                            }
                        }
                    }
                    if (modelType == 'KBinsDiscretizer') {
                        infos = {
                            'bin_edges': { // TODO:
                                name: 'bin_edges',
                                label: 'Bin edges',
                                code: '${bin_edges_allocate} = ${model}.bin_edges_',
                                description: 'The edges of each bin. Contain arrays of varying shapes',
                                options: [
                                    { name: 'bin_edges_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'bin_edges' }
                                ]
                            }
                        }
                    }
                    if (modelType == 'ColumnTransformer') {
                        infos = {
                            'transformers_': {
                                name: 'transformers_',
                                label: 'Transformers_',
                                code: '${transformers_allocate} = ${model}.transformers_',
                                description: 'The collection of fitted transformers as tuples of (name, fitted_transformer, column).',
                                options: [
                                    { name: 'transformers_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'classes' }
                                ]
                            },
                            'get_feature_names_out': {
                                name: 'get_feature_names_out',
                                label: 'Get feature names',
                                code: '${feature_names_allocate} = ${model}.get_feature_names_out()',
                                description: 'Get output feature names.',
                                options: [
                                    { name: 'feature_names_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'features' }
                                ]
                            }
                        }
                    }
                    infos = {
                        ...infos,
                        'get_params': defaultInfos['get_params']
                    }
                    break;
                case 'Regression':
                    infos = {
                        'score': {
                            ...defaultInfos['score'],
                            description: 'Return the coefficient of determination of the prediction.'
                        },
                        'cross_val_score': {
                            name: 'cross_val_score',
                            label: 'Cross validation score',
                            import: 'from sklearn.model_selection import cross_val_score',
                            code: '${cvs_allocate} = cross_val_score(${model}, ${cvs_featureData}, ${cvs_targetData}${scoring}${cv})',
                            description: 'Evaluate a score by cross-validation.',
                            options: [
                                { name: 'cvs_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
                                { name: 'cvs_targetData', label: 'Target Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'y' },
                                { name: 'scoring', component: ['option_select'], usePair: true, type: 'text',
                                    options: [
                                        '',
                                        'explained_variance', 'max_error', 'neg_mean_absolute_error', 'neg_mean_squared_error', 'neg_root_mean_squared_error',
                                        'neg_mean_squared_log_error', 'neg_median_absolute_error', 'r2', 'neg_mean_poisson_deviance', 'neg_mean_gamma_deviance',
                                        'neg_mean_absolute_percentage_error'
                                    ] },
                                { name: 'cv', label: 'Cross Validation', component: ['input_number'], placeholder: '1 ~ 10', default: 5, usePair: true },
                                { name: 'cvs_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'scores' }
                            ]
                        },
                        'permutation_importance': defaultInfos['permutation_importance'],
                        'Coefficient': {
                            name: 'coef_',
                            label: 'Coefficient',
                            code: '${coef_allocate} = ${model}.coef_',
                            description: 'Weights assigned to the features.',
                            options: [
                                { name: 'coef_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'coef' }
                            ]
                        },
                        'Intercept': {
                            name: 'intercept_',
                            label: 'Intercept',
                            code: '${intercept_allocate} = ${model}.intercept_',
                            description: 'Constants in decision function.',
                            options: [
                                { name: 'intercept_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'intercepts' }
                            ]
                        }
                    }
                    let svcList = [
                        'DecisionTreeRegressor', 
                        'RandomForestRegressor',
                        'GradientBoostingRegressor', 
                        'XGBRegressor', 'LGBMRegressor', 'CatBoostRegressor'
                    ];
                    if (svcList.includes(modelType)) {
                        infos = {
                            ...infos,
                            'feature_importances': defaultInfos['feature_importances'],
                            'plot_feature_importances': defaultInfos['plot_feature_importances']
                        }
                    }
                    break;
                case 'Classification':
                    infos = {
                        'score': {
                            ...defaultInfos['score'],
                            description: 'Return the mean accuracy on the given test data and labels.'
                        },
                        'cross_val_score': {
                            name: 'cross_val_score',
                            label: 'Cross validation score',
                            import: 'from sklearn.model_selection import cross_val_score',
                            code: '${cvs_allocate} = cross_val_score(${model}, ${cvs_featureData}, ${cvs_targetData}${scoring}${cv})',
                            description: 'Evaluate a score by cross-validation.',
                            options: [
                                { name: 'cvs_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
                                { name: 'cvs_targetData', label: 'Target Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'y' },
                                { name: 'scoring', component: ['option_select'], usePair: true, type: 'text', 
                                    options: [
                                        '',
                                        'accuracy', 'balanced_accuracy', 'top_k_accuracy', 'average_precision', 'neg_brier_score',
                                        'f1', 'f1_micro', 'f1_macro', 'f1_weighted', 'f1_samples', 'neg_log_loss', 'precision', 'recall', 'jaccard', 
                                        'roc_auc', 'roc_auc_ovr', 'roc_auc_ovo', 'roc_auc_ovr_weighted', 'roc_auc_ovo_weighted'
                                    ] },
                                { name: 'cv', label: 'Cross Validation', component: ['input_number'], placeholder: '1 ~ 10', default: 5, usePair: true },
                                { name: 'cvs_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'scores' }
                            ]
                        },
                        'roc_curve': {
                            name: 'roc_curve',
                            label: 'ROC Curve',
                            import: 'from sklearn import metrics',
                            code: "fpr, tpr, thresholds = metrics.roc_curve(${roc_targetData}, ${model}.predict_proba(${roc_featureData})[:, 1])\
                                \nplt.plot(fpr, tpr, label='ROC Curve')\
                                \nplt.xlabel('Sensitivity')\
                                \nplt.ylabel('Specificity')\
                                \nplt.show()",
                            description: '',
                            options: [
                                { name: 'roc_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X_test' }, 
                                { name: 'roc_targetData', label: 'Target Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'y_test' }
                            ]
                        },
                        'auc': {
                            name: 'auc',
                            label: 'AUC',
                            import: 'from sklearn import metrics',
                            code: 'metrics.roc_auc_score(${auc_targetData}, ${model}.predict_proba(${auc_featureData})[:, 1])',
                            description: '',
                            options: [
                                { name: 'auc_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X_test' },
                                { name: 'auc_targetData', label: 'Target Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'y_test' }
                            ]
                        },
                        'permutation_importance': defaultInfos['permutation_importance']
                    }

                    // feature importances
                    let clfList = [
                        'DecisionTreeClassifier', 
                        'RandomForestClassifier', 
                        'GradientBoostingClassifier', 
                        'XGBClassifier', 
                        'LGBMClassifier', 
                        'CatBoostClassifier',
                    ]
                    if (clfList.includes(modelType)) {
                        infos = {
                            ...infos,
                            'feature_importances': defaultInfos['feature_importances'],
                            'plot_feature_importances': defaultInfos['plot_feature_importances']
                        }
                    }

                    // use decision_function on ROC, AUC
                    let decisionFunctionTypes = [
                        'LogisticRegression', 'SVC', 'GradientBoostingClassifier'
                    ];
                    if (decisionFunctionTypes.includes(modelType)) {
                        infos = {
                            ...infos,
                            'roc_curve': {
                                ...infos['roc_curve'],
                                code: "fpr, tpr, thresholds = metrics.roc_curve(${roc_targetData}, ${model}.decision_function(${roc_featureData}))\
                                    \nplt.plot(fpr, tpr, label='ROC Curve')\
                                    \nplt.xlabel('Sensitivity')\
                                    \nplt.ylabel('Specificity')\
                                    \nplt.show()"
                            },
                            'auc': {
                                ...infos['auc'],
                                code: 'metrics.roc_auc_score(${auc_targetData}, ${model}.decision_function(${auc_featureData}))',
                            }
                        }
                    }
                    break;
                case 'Auto ML':
                    infos = {
                        'score': {
                            ...defaultInfos['score'],
                            description: 'Return the mean accuracy on the given test data and labels.'
                        },
                        'get_params': {
                            ...defaultInfos['get_params']
                        }
                    }
                    break;
                case 'Clustering':
                    infos = {
                        'get_params': {
                            ...defaultInfos['get_params']
                        }
                    }

                    if (modelType == 'KMeans') {
                        infos = {
                            ...infos,
                            'score': {
                                ...defaultInfos['score'],
                                description: 'Return the mean accuracy on the given test data and labels.'
                            },
                            'cluster_centers_': {
                                name: 'cluster_centers',
                                label: 'Cluster centers',
                                code: '${centers_allocate} = ${model}.cluster_centers_',
                                description: 'Coordinates of cluster centers.', 
                                options: [
                                    { name: 'centers_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'cluster_centers' }
                                ]
                            }
                        }
                    }

                    if (modelType == 'AgglomerativeClustering') {
                        infos = {
                            ...infos,
                            'Dendrogram': { // FIXME:
                                name: 'dendrogram',
                                label: 'Dendrogram',
                                code: "# import\nfrom scipy.cluster.hierarchy import dendrogram, ward\n\nlinkage_array = ward(${dendro_data})\ndendrogram(linkage_array, p=3, truncate_mode='level', no_labels=True)\nplt.show()",
                                description: 'Draw a dendrogram',
                                options: [
                                    { name: 'dendro_data', label: 'Data', component: ['data_select'], var_type: ['DataFrame'] }
                                ]
                            }
                        }
                    }

                    if (modelType == 'GaussianMixture') {
                        infos = {
                            ...infos,
                            'score': {
                                ...defaultInfos['score'],
                                description: 'Compute the per-sample average log-likelihood of the given data X.'
                            }
                        }
                    }
                    break;
                case 'Dimension Reduction':
                    if (modelType == 'LDA') {
                        infos = {
                            'score': {
                                name: 'score',
                                label: 'Score',
                                code: '${score_allocate} = ${model}.score(${score_featureData}, ${score_targetData})',
                                description: 'Return the average log-likelihood of all samples.',
                                options: [
                                    { name: 'score_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
                                    { name: 'score_targetData', label: 'Target Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'y' },
                                    { name: 'score_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'scores' }
                                ]
                            }
                        }
                        break;
                    }
                    if (modelType == 'PCA') {
                        infos = {
                            'explained_variance_ratio_': {
                                name: 'explained_variance_ratio_',
                                label: 'Explained variance ratio',
                                code: '${ratio_allocate} = ${model}.explained_variance_ratio_',
                                description: 'Percentage of variance explained by each of the selected components.',
                                options: [
                                    { name: 'ratio_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'ratio' }
                                ]
                            }
                        }
                    }
                    infos = {
                        ...infos,
                        'score': {
                            name: 'score',
                            label: 'Score',
                            code: '${score_allocate} = ${model}.score(${score_featureData})',
                            description: 'Return the average log-likelihood of all samples.',
                            options: [
                                { name: 'score_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
                                { name: 'score_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'scores' }
                            ]
                        }
                    }
                    break;
            }
            return infos;
        }

    }

    return ModelInfo;
});