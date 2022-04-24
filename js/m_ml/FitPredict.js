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
    'text!vp_base/html/m_ml/fitPredict.html!strip',
    'css!vp_base/css/m_ml/fitPredict.css',
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
                model: '',
                method: '',
                action: {},
                config: {},
                userOption: '',
                ...this.state
            }

            this.modelConfig = ML_LIBRARIES;
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            
            // change model
            $(this.wrapSelector('#model')).on('change', function() {
                that.reload();
            });

            // click option
            $(this.wrapSelector('.vp-ins-select-item')).on('click', function() {
                let name = $(this).data('var-name');
                let type = $(this).data('var-type');
                
                that.renderOptionPage(type, name);
            });
        }

        templateForBody() {
            let page = $(msHtml);
            
            let that = this;

            //================================================================
            // Model selection
            //================================================================
            // set model list
            let modelOptionTag = new com_String();
            vpKernel.getModelList().then(function(resultObj) {
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

                that.reload();
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

        render() {
            super.render();

            this.reload();
        }

        reload() {
            // reset option page
            $(this.wrapSelector('.vp-ins-parameter-box')).html('');
            
            let modelTag = $(this.wrapSelector('#model'));
            let model = $(modelTag).val();
            let modelType = $(modelTag).find('option:selected').data('type');
            
            let actions = this.getAction(modelType);
            // let infos = this.getInfo(modelType);
            this.state.action = { ...actions };
            // this.state.info = { ...infos };
            
            var actListTag = new com_String();
            // var infoListTag = new com_String();
            
            Object.keys(actions).forEach(actKey => {
                let titleText = actions[actKey].description;
                if (actions[actKey].name != actions[actKey].label) {   
                    titleText = actions[actKey].name + ': ' + titleText;
                }
                actListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>',
                'vp-ins-select-item', actKey, 'action', titleText, actions[actKey].label);
            });
            // Object.keys(infos).forEach(infoKey => {
            //     let titleText = infos[infoKey].description;
            //     if (infos[infoKey].name != infos[infoKey].label) {   
            //         titleText = infos[infoKey].name + ': ' + titleText;
            //     }
            //     infoListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>',
            //     'vp-ins-select-item', infoKey, 'info', titleText, infos[infoKey].label);
            // });
            
            $(this.wrapSelector('.vp-ins-select-list.action')).html(actListTag.toString());
            // $(this.wrapSelector('.vp-ins-select-list.info')).html(infoListTag.toString());
            
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

            // info search suggest
            // suggestInput = new SuggestInput();
            // suggestInput.addClass('vp-input');
            // suggestInput.addClass('vp-ins-search');
            // suggestInput.setPlaceholder("Search info");
            // suggestInput.setSuggestList(function () { return Object.keys(infos); });
            // suggestInput.setSelectEvent(function (value, item) {
            //     $(this.wrapSelector()).val(value);
            //     $(that.wrapSelector('.vp-ins-type.info')).val(value);

            //     $(that.wrapSelector('.vp-ins-select-item[data-var-name="' + value + '"]')).click();
            // });
            // $(that.wrapSelector('.vp-ins-search')).replaceWith(function () {
            //     return suggestInput.toTagString();
            // });

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

        /**
         * Render option page for selected option
         * @param {String} type action / info
         * @param {String} name option name (ex. fit/predict/...)
         */
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
                    let content = com_generator.renderContent(this, opt.component[0], opt, this.state);
                    optBox.appendLine(content[0].outerHTML);
                });
                // replace option box
                $(this.wrapSelector('.vp-ins-parameter-box')).html(optBox.toString());
    
                this.state.config = config;
    
                // add selection
                $(this.wrapSelector('.vp-ins-select-item')).removeClass('selected');
                let typeClass = '.vp-ins-select-list.' + type;
                let nameClass = '.vp-ins-select-item[data-var-name="' + name + '"]';
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

    }

    return FitPredict;
});