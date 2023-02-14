/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : FitPredict.js
 *    Author          : Black Logic
 *    Note            : Model fit / predict
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 04. 20
 *    Change Date     :
 */

//============================================================================
// [CLASS] FitPredict
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_ml/fitPredict.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_ml/fitPredict'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/data/m_ml/mlLibrary',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/VarSelector2',
    'vp_base/js/com/component/SuggestInput'
], function(msHtml, msCss, com_util, com_String, com_generator, ML_LIBRARIES, PopupComponent, VarSelector2, SuggestInput) {

    /**
     * FitPredict
     */
    class FitPredict extends PopupComponent {
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
                action: {},
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
            $(this.wrapSelector('.vp-ins-select-list.action')).html('');
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
            $(this.wrapSelector('.vp-ins-select-list.action')).html('');
            $(this.wrapSelector('.vp-ins-parameter-box')).html('');
            
            let model = this.state.model;
            let modelType = this.state.modelType;
            
            let actions = this.getAction(modelType);
            this.state.action = { ...actions };
            
            var actListTag = new com_String();
            
            Object.keys(actions).forEach(actKey => {
                let titleText = actions[actKey].description;
                if (actions[actKey].name != actions[actKey].label) {   
                    titleText = actions[actKey].name + ': ' + titleText;
                }
                actListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>',
                'vp-ins-select-item', actKey, 'action', titleText, actions[actKey].label);
            });
            
            $(this.wrapSelector('.vp-ins-select-list.action')).html(actListTag.toString());
            
            let that = this;
            // action search suggest
            var suggestInput = new SuggestInput();
            suggestInput.addClass('vp-input');
            suggestInput.addClass('vp-ins-search');
            suggestInput.setPlaceholder("Search Action");
            suggestInput.setSuggestList(function () { return Object.keys(actions); });
            suggestInput.setSelectEvent(function (value, item) {
                $(this.wrapSelector()).val(value);
                $(that.wrapSelector('.vp-ins-type.action')).val(value);

                $(that.wrapSelector('.vp-ins-select-item[data-var-name="' + value + '"]')).click();
            });
            $(that.wrapSelector('.vp-ins-search')).replaceWith(function () {
                return suggestInput.toTagString();
            });

            // bind event
            // click option
            $(this.wrapSelector('.vp-ins-select-list.action .vp-ins-select-item')).on('click', function() {
                let name = $(this).data('var-name');
                let type = $(this).data('var-type');
                
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
            let code = new com_String();
            let replaceDict = {'${model}': model};

            if (this.state.optionConfig.import != undefined) {
                code.appendLine(this.state.optionConfig.import);
                code.appendLine();
            }
            let modelCode = com_generator.vp_codeGenerator(this, this.state.optionConfig, this.state);
            if (modelCode) {
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
            }

            return code.toString();
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
                        { name: 'fit_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X_train' },
                        { name: 'fit_targetData', label: 'Target Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'y_train' }
                    ]
                },
                'predict': {
                    name: 'predict',
                    label: 'Predict',
                    code: '${pred_allocate} = ${model}.predict(${pred_featureData})',
                    description: 'Predict the closest target data X belongs to.',
                    options: [
                        { name: 'pred_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X_test' },
                        { name: 'pred_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'pred' }
                    ]
                },
                'predict_proba': {
                    name: 'predict_proba',
                    label: 'Predict probability',
                    code: '${pred_prob_allocate} = ${model}.predict_proba(${pred_prob_featureData})',
                    description: 'Predict class probabilities for X.',
                    options: [
                        { name: 'pred_prob_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X_test' },
                        { name: 'pred_prob_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'pred' }
                    ]
                },
                'transform': {
                    name: 'transform',
                    label: 'Transform',
                    code: '${trans_allocate} = ${model}.transform(${trans_featureData})',
                    description: 'Apply dimensionality reduction to X.',
                    options: [
                        { name: 'trans_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
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
                                { name: 'fit_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' }
                            ]
                        },
                        'fit_transform': {
                            name: 'fit_transform',
                            label: 'Fit and transform',
                            code: '${fit_trans_allocate} = ${model}.fit_transform(${fit_trans_featureData})',
                            description: 'Fit Encoder/Scaler to X, then transform X.',
                            options: [
                                { name: 'fit_trans_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
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
                                    { name: 'inverse_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
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
                                    { name: 'dec_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
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
                                { name: 'fit_pred_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
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
                                    { name: 'fit_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' }
                                ]
                            },
                            'fit_predict': {
                                name: 'fit_predict',
                                label: 'Fit and predict',
                                code: '${fit_pred_allocate} = ${model}.fit_predict(${fit_pred_featureData})',
                                description: 'Compute clusters from a data or distance matrix and predict labels.',
                                options: [
                                    { name: 'fit_pred_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
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
                                { name: 'fit_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' }
                            ]
                        },
                        'predict': {
                            name: 'predict',
                            label: 'Predict',
                            code: '${pred_allocate} = ${model}.predict(${pred_featureData})',
                            description: 'Predict the closest target data X belongs to.',
                            options: [
                                { name: 'pred_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
                                { name: 'pred_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'pred' }
                            ]
                        },
                        'fit_predict': {
                            name: 'fit_predict',
                            label: 'Fit and predict',
                            code: '${fit_pred_allocate} = ${model}.fit_predict(${fit_pred_featureData})',
                            description: 'Compute cluster centers and predict cluster index for each sample.',
                            options: [
                                { name: 'fit_pred_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
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
                                    { name: 'fit_trans_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
                                    { name: 'fit_trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                                ]
                            },
                            'transform': {
                                name: 'transform',
                                label: 'Transform',
                                code: '${trans_allocate} = ${model}.transform(${trans_featureData})',
                                description: 'Transform X to a cluster-distance space.',
                                options: [
                                    { name: 'trans_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
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
                                    { name: 'fit_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' }
                                ]
                            },
                            'fit_transform': {
                                name: 'fit_transform',
                                label: 'Fit and transform',
                                code: '${fit_trans_allocate} = ${model}.fit_transform(${fit_trans_featureData})',
                                description: 'Fit X into an embedded space and return that transformed output.', 
                                options: [
                                    { name: 'fit_trans_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
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
                                    { name: 'fit_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
                                    { name: 'fit_targetData', label: 'Target Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'y' }
                                ]
                            },
                            'fit_transform': {
                                name: 'fit_transform',
                                label: 'Fit and transform',
                                code: '${fit_trans_allocate} = ${model}.fit_transform(${fit_trans_featureData}${fit_trans_targetData})',
                                description: 'Fit to data, then transform it.', 
                                options: [
                                    { name: 'fit_trans_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
                                    { name: 'fit_trans_targetData', label: 'Target Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'y' },
                                    { name: 'fit_trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                                ]
                            },
                            'predict': {
                                name: 'predict',
                                label: 'Predict',
                                code: '${pred_allocate} = ${model}.predict(${pred_featureData})',
                                description: 'Predict class labels for samples in X.',
                                options: [
                                    { name: 'pred_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
                                    { name: 'pred_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'pred' }
                                ]
                            },
                            'transform': {
                                name: 'transform',
                                label: 'Transform',
                                code: '${trans_allocate} = ${model}.transform(${trans_featureData})',
                                description: 'Project data to maximize class separation.',
                                options: [
                                    { name: 'trans_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
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
                                { name: 'fit_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' }
                            ]
                        },
                        'fit_transform': {
                            name: 'fit_transform',
                            label: 'Fit and transform',
                            code: '${fit_trans_allocate} = ${model}.fit_transform(${fit_trans_featureData})',
                            description: 'Fit the model with X and apply the dimensionality reduction on X.', 
                            options: [
                                { name: 'fit_trans_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
                                { name: 'fit_trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                            ]
                        },
                        'inverse_transform': {
                            name: 'inverse_transform',
                            label: 'Inverse transform',
                            code: '${inverse_allocate} = ${model}.inverse_transform(${inverse_featureData})',
                            description: 'Transform data back to its original space.',
                            options: [
                                { name: 'inverse_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
                                { name: 'inverse_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'inv_trans' }
                            ]
                        },
                        'transform': {
                            name: 'transform',
                            label: 'Transform',
                            code: '${trans_allocate} = ${model}.transform(${trans_featureData})',
                            description: 'Apply dimensionality reduction to X.',
                            options: [
                                { name: 'trans_featureData', label: 'Feature Data', component: ['data_select'], var_type: ['DataFrame', 'Series', 'ndarray', 'list', 'dict'], value: 'X' },
                                { name: 'trans_allocate', label: 'Allocate to', component: ['input'], placeholder: 'New variable', value: 'trans' }
                            ]
                        }
                    }
                    break;
            }
            return actions;
        }

    }

    return FitPredict;
});