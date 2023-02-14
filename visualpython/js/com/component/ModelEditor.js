define([
    __VP_CSS_LOADER__('vp_base/css/component/instanceEditor'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/component/Component',
    'vp_base/js/com/component/SuggestInput'
], function(insCss, com_String, com_util, com_generator, Component, SuggestInput) {

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

    class ModelEditor extends Component {
        constructor(pageThis, targetId, containerId) {
            super(null, { pageThis: pageThis, targetId: targetId, containerId: containerId });
        }

        _init() {
            super._init();

            this.pageThis = this.state.pageThis;
            this.targetId = this.state.targetId;
            this.containerId = this.state.containerId;

            let modelEditorType = '';
            let modelEditorName = '';
            if (this.pageThis.state['modelEditorType'] == undefined) {
                modelEditorType = '';
            }
            if (this.pageThis.state['modelEditorName'] == undefined) {
                modelEditorName = '';
            }

            this.state = {
                modelEditorType: modelEditorType,
                modelEditorName: modelEditorName,
                action: {},
                info: {},
                config: {},
                ...this.state
            }

            this.loaded = false;
        }

        render() {
            ;
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

        getAction(modelType) {
            let category = this.getModelCategory(modelType);
            let defaultActions = {
                'fit': {
                    name: 'fit',
                    label: 'Fit',
                    code: '${model}.fit(${fit_featureData}, ${fit_targetData})',
                    description: 'Perform modeling from features, or distance matrix.',
                    options: [
                        { name: 'fit_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X_train' },
                        { name: 'fit_targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'y_train' }
                    ]
                },
                'predict': {
                    name: 'predict',
                    label: 'Predict',
                    code: '${pred_allocate} = ${model}.predict(${pred_featureData})',
                    description: 'Predict the closest target data X belongs to.',
                    options: [
                        { name: 'pred_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X_test' },
                        { name: 'pred_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'pred' }
                    ]
                },
                'predict_proba': {
                    name: 'predict_proba',
                    label: 'Predict probability',
                    code: '${pred_prob_allocate} = ${model}.predict_proba(${pred_prob_featureData})',
                    description: 'Predict class probabilities for X.',
                    options: [
                        { name: 'pred_prob_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X_test' },
                        { name: 'pred_prob_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'pred' }
                    ]
                },
                'transform': {
                    name: 'transform',
                    label: 'Transform',
                    code: '${trans_allocate} = ${model}.transform(${trans_featureData})',
                    description: 'Apply dimensionality reduction to X.',
                    options: [
                        { name: 'trans_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                        { name: 'trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                    ]
                }
            };
            let actions = {};
            switch (category) {
                case 'Data Preparation':
                    actions = {
                        'fit': {
                            name: 'fit',
                            label: 'Fit',
                            code: '${model}.fit(${fit_featureData})',
                            description: 'Fit Encoder/Scaler to X.',
                            options: [
                                { name: 'fit_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' }
                            ]
                        },
                        'fit_transform': {
                            name: 'fit_transform',
                            label: 'Fit and transform',
                            code: '${fit_trans_allocate} = ${model}.fit_transform(${fit_trans_featureData})',
                            description: 'Fit Encoder/Scaler to X, then transform X.',
                            options: [
                                { name: 'fit_trans_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                { name: 'fit_trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                            ]
                        },
                        'transform': {
                            ...defaultActions['transform'],
                            description: 'Transform labels to normalized encoding.'
                        }
                    }

                    if (modelType != 'ColumnTransformer') {
                        actions = {
                            ...actions,
                            'inverse_transform': {
                                name: 'inverse_transform',
                                label: 'Inverse transform',
                                code: '${inverse_allocate} = ${model}.inverse_transform(${inverse_featureData})',
                                description: 'Transform binary labels back to multi-class labels.',
                                options: [
                                    { name: 'inverse_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                    { name: 'inverse_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'inv_trans' }
                                ]
                            }
                        }
                    }
                    break;
                case 'Regression':
                    actions = {
                        'fit': defaultActions['fit'],
                        'predict': defaultActions['predict']
                    }
                    break;
                case 'Classification':
                    actions = {
                        'fit': defaultActions['fit'],
                        'predict': defaultActions['predict'],
                        'predict_proba': defaultActions['predict_proba'],
                    }
                    if (['LogisticRegression', 'SVC', 'GradientBoostingClassifier'].includes(modelType)) {
                        actions = {
                            ...actions,
                            'decision_function': {
                                name: 'decision_function',
                                label: 'Decision function',
                                code: '${dec_allocate} = ${model}.decision_function(${dec_featureData})',
                                description: 'Compute the decision function of X.',
                                options: [
                                    { name: 'dec_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                    { name: 'dec_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
                                ]
                            }
                        }
                    }
                    break;
                case 'Auto ML':
                    actions = {
                        'fit': defaultActions['fit'],
                        'predict': defaultActions['predict'],
                        'fit_predict': {
                            name: 'fit_predict',
                            label: 'Fit and predict',
                            code: '${fit_pred_allocate} = ${model}.fit_predict(${fit_pred_featureData})',
                            description: 'Fit and predict.',
                            options: [
                                { name: 'fit_pred_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                { name: 'fit_pred_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'pred' }
                            ]
                        },
                        'predict_proba': defaultActions['predict_proba']
                    }
                    break;
                case 'Clustering':
                    if (modelType == 'AgglomerativeClustering' 
                        || modelType == 'DBSCAN') {
                        actions = {
                            'fit': {
                                name: 'fit',
                                label: 'Fit',
                                code: '${model}.fit(${fit_featureData})',
                                description: 'Perform clustering from features, or distance matrix.',
                                options: [
                                    { name: 'fit_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' }
                                ]
                            },
                            'fit_predict': {
                                name: 'fit_predict',
                                label: 'Fit and predict',
                                code: '${fit_pred_allocate} = ${model}.fit_predict(${fit_pred_featureData})',
                                description: 'Compute clusters from a data or distance matrix and predict labels.',
                                options: [
                                    { name: 'fit_pred_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                    { name: 'fit_pred_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'pred' }
                                ]
                            }
                        }
                        break;
                    }
                    actions = {
                        'fit': {
                            name: 'fit',
                            label: 'Fit',
                            code: '${model}.fit(${fit_featureData})',
                            description: 'Compute clustering.',
                            options: [
                                { name: 'fit_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' }
                            ]
                        },
                        'predict': {
                            name: 'predict',
                            label: 'Predict',
                            code: '${pred_allocate} = ${model}.predict(${pred_featureData})',
                            description: 'Predict the closest target data X belongs to.',
                            options: [
                                { name: 'pred_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                { name: 'pred_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'pred' }
                            ]
                        },
                        'fit_predict': {
                            name: 'fit_predict',
                            label: 'Fit and predict',
                            code: '${fit_pred_allocate} = ${model}.fit_predict(${fit_pred_featureData})',
                            description: 'Compute cluster centers and predict cluster index for each sample.',
                            options: [
                                { name: 'fit_pred_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                { name: 'fit_pred_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'pred' }
                            ]
                        }
                    }
                    if (modelType == 'KMeans') {
                        actions = {
                            ...actions,
                            'fit_transform': {
                                name: 'fit_transform',
                                label: 'Fit and transform',
                                code: '${fit_trans_allocate} = ${model}.fit_transform(${fit_trans_featureData})',
                                description: 'Compute clustering and transform X to cluster-distance space.', 
                                options: [
                                    { name: 'fit_trans_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                    { name: 'fit_trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                                ]
                            },
                            'transform': {
                                name: 'transform',
                                label: 'Transform',
                                code: '${trans_allocate} = ${model}.transform(${trans_featureData})',
                                description: 'Transform X to a cluster-distance space.',
                                options: [
                                    { name: 'trans_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                    { name: 'trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                                ]
                            }
                        }
                    }
                    break;
                case 'Dimension Reduction':
                    if (modelType == 'TSNE') {
                        actions = {
                            'fit': {
                                name: 'fit',
                                label: 'Fit',
                                code: '${model}.fit(${fit_featureData})',
                                description: 'Fit X into an embedded space.',
                                options: [
                                    { name: 'fit_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' }
                                ]
                            },
                            'fit_transform': {
                                name: 'fit_transform',
                                label: 'Fit and transform',
                                code: '${fit_trans_allocate} = ${model}.fit_transform(${fit_trans_featureData})',
                                description: 'Fit X into an embedded space and return that transformed output.', 
                                options: [
                                    { name: 'fit_trans_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                    { name: 'fit_trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                                ]
                            }
                        }
                        break;
                    }
                    if (modelType == 'LinearDiscriminantAnalysis') { // LDA
                        actions = {
                            'fit': {
                                name: 'fit',
                                label: 'Fit',
                                code: '${model}.fit(${fit_featureData}, ${fit_targetData})',
                                description: 'Fit the Linear Discriminant Analysis model.',
                                options: [
                                    { name: 'fit_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                    { name: 'fit_targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'y' }
                                ]
                            },
                            'fit_transform': {
                                name: 'fit_transform',
                                label: 'Fit and transform',
                                code: '${fit_trans_allocate} = ${model}.fit_transform(${fit_trans_featureData}${fit_trans_targetData})',
                                description: 'Fit to data, then transform it.', 
                                options: [
                                    { name: 'fit_trans_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                    { name: 'fit_trans_targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'y' },
                                    { name: 'fit_trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                                ]
                            },
                            'predict': {
                                name: 'predict',
                                label: 'Predict',
                                code: '${pred_allocate} = ${model}.predict(${pred_featureData})',
                                description: 'Predict class labels for samples in X.',
                                options: [
                                    { name: 'pred_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                    { name: 'pred_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'pred' }
                                ]
                            },
                            'transform': {
                                name: 'transform',
                                label: 'Transform',
                                code: '${trans_allocate} = ${model}.transform(${trans_featureData})',
                                description: 'Project data to maximize class separation.',
                                options: [
                                    { name: 'trans_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                    { name: 'trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                                ]
                            }
                        }
                        break;
                    }
                    actions = {
                        'fit': {
                            name: 'fit',
                            label: 'Fit',
                            code: '${model}.fit(${fit_featureData})',
                            description: 'Fit X into an embedded space.',
                            options: [
                                { name: 'fit_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' }
                            ]
                        },
                        'fit_transform': {
                            name: 'fit_transform',
                            label: 'Fit and transform',
                            code: '${fit_trans_allocate} = ${model}.fit_transform(${fit_trans_featureData})',
                            description: 'Fit the model with X and apply the dimensionality reduction on X.', 
                            options: [
                                { name: 'fit_trans_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                { name: 'fit_trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                            ]
                        },
                        'inverse_transform': {
                            name: 'inverse_transform',
                            label: 'Inverse transform',
                            code: '${inverse_allocate} = ${model}.inverse_transform(${inverse_featureData})',
                            description: 'Transform data back to its original space.',
                            options: [
                                { name: 'inverse_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                { name: 'inverse_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'inv_trans' }
                            ]
                        },
                        'transform': {
                            name: 'transform',
                            label: 'Transform',
                            code: '${trans_allocate} = ${model}.transform(${trans_featureData})',
                            description: 'Apply dimensionality reduction to X.',
                            options: [
                                { name: 'trans_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                { name: 'trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                            ]
                        }
                    }
                    break;
            }
            return actions;
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
                        { name: 'score_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                        { name: 'score_targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'y' },
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
                        { name: 'importance_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X_train' },
                        { name: 'importance_targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'y_train' },
                        { name: 'scoring', component: ['input'], usePair: true },
                        { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true },
                        { name: 'importance_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'importances' }
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
                                { name: 'cvs_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                { name: 'cvs_targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'y' },
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
                                { name: 'cvs_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                { name: 'cvs_targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'y' },
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
                        'permutation_importance': defaultInfos['permutation_importance']
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
                        // 'Size of clusters': {
                        //     name: 'Size of clusters',
                        //     code: "print(f'Size of clusters: {np.bincount(pred)}')", // FIXME: model.cluster_centers_ / use model info or hide it
                        //     options: []
                        // }
                    }

                    if (modelType == 'KMeans') {
                        infos = {
                            ...infos,
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
                                    { name: 'dendro_data', label: 'Data', component: ['var_select'], var_type: ['DataFrame'] }
                                ]
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
                                    { name: 'score_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                    { name: 'score_targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'y' },
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
                                { name: 'score_featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], value: 'X' },
                                { name: 'score_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'scores' }
                            ]
                        }
                    }
                    break;
            }
            return infos;
        }

        renderPage() {
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} {1}">', VP_INS_BOX, this.uuid); // vp-select-base

            // Model Editor State (Saved state)
            tag.appendFormatLine('<input type="hidden" id="{0}" class="vp-state" value="{1}"/>', 'modelEditorType', this.state.modelEditorType);
            tag.appendFormatLine('<input type="hidden" id="{0}" class="vp-state" value="{1}"/>', 'modelEditorName', this.state.modelEditorName);

            tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_CONTAINER, 'action');
            tag.appendFormatLine('<div class="vp-multilang {0}">Action</div>', VP_INS_SELECT_TITLE);

            tag.appendFormatLine('<div style="{0}">', 'position: relative;');
            tag.appendFormatLine('<input class="vp-input {0} {1}" type="text" placeholder="Search Action"/>', VP_INS_SEARCH, 'attr');
            tag.appendFormatLine('<input class="{0} {1}" type="hidden"/>', VP_INS_TYPE, 'action');
            tag.appendFormatLine('<i class="{0} {1}"></i>', 'fa fa-search', 'vp-ins-search-icon');
            tag.appendLine('</div>');

            tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_BOX, 'action');
            tag.appendFormatLine('<ul class="{0} {1}" style="height:80px">', VP_INS_SELECT_LIST, 'action');
            tag.appendLine('</ul>');
            tag.appendLine('</div>'); // VP_INS_SELECT_BOX
            tag.appendLine('</div>'); // VP_INS_SELECT_CONTAINER

            tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_CONTAINER, 'info');
            tag.appendFormatLine('<div class="vp-multilang {0}">Information</div>', VP_INS_SELECT_TITLE);

            tag.appendFormatLine('<div style="{0}">', 'position: relative;');
            tag.appendFormatLine('<input class="vp-input {0} {1}" type="text" placeholder="Search Info"/>', VP_INS_SEARCH, 'method');
            tag.appendFormatLine('<input class="{0} {1}" type="hidden"/>', VP_INS_TYPE, 'info');
            tag.appendFormatLine('<i class="{0} {1}"></i>', 'fa fa-search', 'vp-ins-search-icon');
            tag.appendLine('</div>');

            tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_BOX, 'info');
            tag.appendFormatLine('<ul class="{0} {1}" style="height:80px">', VP_INS_SELECT_LIST, 'info');
            tag.appendLine('</ul>');
            tag.appendLine('</div>'); // VP_INS_SELECT_BOX
            tag.appendLine('</div>'); // VP_INS_SELECT_CONTAINER

            tag.appendFormatLine('<div class="vp-multilang {0}">Options</div>', VP_INS_SELECT_TITLE);
            tag.appendFormatLine('<div class="{0} vp-grid-col-95"></div>', VP_INS_PARAMETER_BOX);
            tag.appendLine('</div>'); // VP_INS_BOX END

            $(this.pageThis.wrapSelector('#' + this.containerId)).html(tag.toString());

            return tag.toString();
        }

        reload() {
            this.renderPage();

            let targetTag = $(this.pageThis.wrapSelector('#' + this.targetId));
            let model = $(targetTag).val();
            let modelType = $(targetTag).find('option:selected').data('type');
            
            let actions = this.getAction(modelType);
            let infos = this.getInfo(modelType);
            this.state.action = { ...actions };
            this.state.info = { ...infos };
            
            var actListTag = new com_String();
            var infoListTag = new com_String();
            
            Object.keys(actions).forEach(actKey => {
                let titleText = actions[actKey].description;
                if (actions[actKey].name != actions[actKey].label) {   
                    titleText = actions[actKey].name + ': ' + titleText;
                }
                actListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>',
                VP_INS_SELECT_ITEM, actKey, 'action', titleText, actions[actKey].label);
            });
            Object.keys(infos).forEach(infoKey => {
                let titleText = infos[infoKey].description;
                if (infos[infoKey].name != infos[infoKey].label) {   
                    titleText = infos[infoKey].name + ': ' + titleText;
                }
                infoListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>',
                VP_INS_SELECT_ITEM, infoKey, 'info', titleText, infos[infoKey].label);
            });
            
            $(this.wrapSelector('.' + VP_INS_SELECT_LIST + '.action')).html(actListTag.toString());
            $(this.wrapSelector('.' + VP_INS_SELECT_LIST + '.info')).html(infoListTag.toString());
            
            let that = this;
            // action search suggest
            var suggestInput = new SuggestInput();
            suggestInput.addClass('vp-input action');
            suggestInput.addClass(VP_INS_SEARCH);
            suggestInput.setPlaceholder("Search Action");
            suggestInput.setSuggestList(function () { return Object.keys(actions); });
            suggestInput.setSelectEvent(function (value, item) {
                $(this.wrapSelector()).val(value);
                $(that.wrapSelector('.' + VP_INS_TYPE + '.action')).val(item.type);

                $(that.pageThis.wrapSelector('#' + that.targetId)).trigger({
                    type: "model_editor_selected",
                    varName: value,
                    varOptions: actions[value],
                    isMethod: false
                });
            });
            $(that.wrapSelector('.' + VP_INS_SEARCH + '.action')).replaceWith(function () {
                return suggestInput.toTagString();
            });

            // info search suggest
            suggestInput = new SuggestInput();
            suggestInput.addClass('vp-input info');
            suggestInput.addClass(VP_INS_SEARCH);
            suggestInput.setPlaceholder("Search info");
            suggestInput.setSuggestList(function () { return Object.keys(infos); });
            suggestInput.setSelectEvent(function (value, item) {
                $(this.wrapSelector()).val(value);
                $(that.wrapSelector('.' + VP_INS_TYPE + '.info')).val(item.type);

                $(that.pageThis.wrapSelector('#' + that.targetId)).trigger({
                    type: "model_editor_selected",
                    varName: value,
                    varOptions: infos[value],
                    isMethod: true
                });
            });
            $(that.wrapSelector('.' + VP_INS_SEARCH + '.info')).replaceWith(function () {
                return suggestInput.toTagString();
            });

            // bind event
            this._bindEvent();

            // load once on initializing page
            if (this.loaded == false) {
                let { modelEditorType, modelEditorName } = this.pageThis.state;
                if (modelEditorType != '' && modelEditorName != '') {
                    // render option page for saved state
                    that.renderOptionPage(modelEditorType, modelEditorName);
                }
                // set loaded true
                this.loaded = true;
            }
        }

        renderOptionPage(type, name) {
            if (this.state[type] != undefined && this.state[type][name] != undefined) {
                let config = this.state[type][name];
                let optBox = new com_String();
                // render tag
                config && config.options && config.options.forEach(opt => {
                    let label = opt.name;
                    if (opt.label != undefined) {
                        label = opt.label;
                    }
                    // fix label
                    label = com_util.optionToLabel(label);
                    optBox.appendFormatLine('<label for="{0}" title="{1}">{2}</label>'
                        , opt.name, opt.name, label);
                    let content = com_generator.renderContent(this, opt.component[0], opt, this.pageThis.state);
                    optBox.appendLine(content[0].outerHTML);
                });
                // replace option box
                $(this.wrapSelector('.' + VP_INS_PARAMETER_BOX)).html(optBox.toString());
    
                this.state.config = config;
    
                // add selection
                $(this.wrapSelector('.' + VP_INS_SELECT_ITEM)).removeClass('selected');
                let typeClass = '.' + VP_INS_SELECT_LIST + '.' + type;
                let nameClass = '.' + VP_INS_SELECT_ITEM + '[data-var-name="' + name + '"]';
                $(this.wrapSelector(typeClass + ' ' + nameClass)).addClass('selected');
                // set state
                $(this.wrapSelector('#modelEditorType')).val(type);
                $(this.wrapSelector('#modelEditorName')).val(name);
                this.pageThis.state.modelEditorType = type;
                this.pageThis.state.modelEditorName = name;
            }
        }

        _bindEvent() {
            super._bindEvent();
            let that = this;

            $(this.wrapSelector('.' + VP_INS_SELECT_ITEM)).on('click', function() {
                let name = $(this).data('var-name');
                let type = $(this).data('var-type');
                
                that.renderOptionPage(type, name);
            });
        }

        /**
         * Show Model Editor
         * @param {*} showType all / action / info 
         */
        show() {
            $(this.wrapSelector()).show();

            this.reload();
        }

        hide() {
            $(this.wrapSelector()).hide();
        }

        getCode(replaceDict={}) {
            let code = new com_String();
            if (this.state.config.import != undefined) {
                code.appendLine(this.state.config.import);
                code.appendLine();
            }
            let modelCode = com_generator.vp_codeGenerator(this.pageThis, this.state.config, this.pageThis.state);
            Object.keys(replaceDict).forEach(key => {
                modelCode = modelCode.replace(key, replaceDict[key]);
            });
            code.append(modelCode);

            let allocateIdx = modelCode.indexOf(' = ');
            if (allocateIdx >= 0) {
                let allocateCode = modelCode.substr(0, allocateIdx);
                code.appendLine();
                code.append(allocateCode);
            }

            return code.toString();
        }
    }

    return ModelEditor;
});