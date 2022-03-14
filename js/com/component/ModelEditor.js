define([
    'css!vp_base/css/component/instanceEditor.css',
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
                    code: '${model}.fit(${featureData}, ${targetData})',
                    description: 'Perform modeling from features, or distance matrix.',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X_train' },
                        { name: 'targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'y_train' }
                    ]
                },
                'predict': {
                    name: 'predict',
                    code: '${allocatePredict} = ${model}.predict(${featureData})',
                    description: 'Predict the closest target data X belongs to.',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X_test' },
                        { name: 'allocatePredict', label: 'Allocate to', component: ['input'], placeholder: 'New variable', default: 'pred' }
                    ]
                },
                'predict_proba': {
                    name: 'predict_proba',
                    code: '${allocatePredict} = ${model}.predict_proba(${featureData})',
                    description: 'Predict class probabilities for X.',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X_test' },
                        { name: 'allocatePredict', label: 'Allocate to', component: ['input'], placeholder: 'New variable', default: 'pred' }
                    ]
                },
                'transform': {
                    name: 'transform',
                    code: '${allocateTransform} = ${model}.transform(${featureData})',
                    description: 'Apply dimensionality reduction to X.',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X' },
                        { name: 'allocateTransform', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
                    ]
                }
            };
            let actions = {};
            switch (category) {
                case 'Data Preparation':
                    actions = {
                        'fit': {
                            name: 'fit',
                            code: '${model}.fit(${featureData})',
                            description: 'Fit Encoder/Scaler to X.',
                            options: [
                                { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X' }
                            ]
                        },
                        'fit_transform': {
                            name: 'fit_transform',
                            code: '${allocateTransform} = ${model}.fit_transform(${featureData})',
                            description: 'Fit Encoder/Scaler to X, then transform X.',
                            options: [
                                { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X' },
                                { name: 'allocateTransform', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
                            ]
                        },
                        'transform': {
                            ...defaultActions['transform'],
                            description: 'Transform labels to normalized encoding.'
                        },
                        'inverse_transform': {
                            name: 'inverse_transform',
                            code: '${allocateInverse} = ${model}.inverse_transform(${featureData})',
                            description: 'Transform binary labels back to multi-class labels.',
                            options: [
                                { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X_train' },
                                { name: 'allocateInverse', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
                            ]
                        }
                    }
                    break;
                case 'Regression':
                    actions = {
                        'fit': defaultActions['fit'],
                        'predict': defaultActions['predict'],
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
                                code: '${allocateScore} = ${model}.decision_function(${featureData})',
                                description: 'Compute the decision function of X.',
                                options: [
                                    { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X' },
                                    { name: 'allocateScore', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
                                ]
                            }
                        }
                    }
                    break;
                case 'Auto ML':
                    actions = {
                        'fit': defaultActions['fit'],
                        'predict': defaultActions['predict']
                    }
                    if (modelType == 'TPOTClassifier') {
                        actions = {
                            ...actions,
                            'predict_proba': defaultActions['predict_proba']
                        }
                    }
                    break;
                case 'Clustering':
                    if (modelType == 'AgglomerativeClustering' 
                        || modelType == 'DBSCAN') {
                        actions = {
                            'fit': defaultActions['fit'],
                            'fit_predict': {
                                name: 'fit_predict',
                                code: '${allocatePredict} = ${model}.fit_predict(${featureData})',
                                description: 'Compute clusters from a data or distance matrix and predict labels.',
                                options: [
                                    { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X' },
                                    { name: 'allocatePredict', label: 'Allocate to', component: ['input'], placeholder: 'New variable', default: 'pred' }
                                ]
                            }
                        }
                        break;
                    }
                    actions = {
                        'fit': defaultActions['fit'],
                        'predict': defaultActions['predict'],
                        'fit_predict': {
                            name: 'fit_predict',
                            code: '${allocatePredict} = ${model}.fit_predict(${featureData})',
                            description: 'Compute cluster centers and predict cluster index for each sample.',
                            options: [
                                { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X' },
                                { name: 'allocatePredict', label: 'Allocate to', component: ['input'], placeholder: 'New variable', default: 'pred' }
                            ]
                        }
                    }
                    if (modelType == 'KMeans') {
                        actions = {
                            ...actions,
                            'fit_transform': {
                                name: 'fit_transform',
                                code: '${model}.fit_transform(${featureData})',
                                description: 'Compute clustering and transform X to cluster-distance space.', 
                                options: [
                                    { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X_train' }
                                ]
                            },
                            'transform': {
                                name: 'transform',
                                code: '${allocateTransform} = ${model}.transform(${featureData})',
                                description: 'Transform X to a cluster-distance space.',
                                options: [
                                    { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X' },
                                    { name: 'allocateTransform', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
                                ]
                            }
                        }
                    }
                    break;
                case 'Dimension Reduction':
                    if (modelType == 'TSNE') {
                        actions = {
                            'fit': defaultActions['fit'],
                            'fit_transform': {
                                name: 'fit_transform',
                                code: '${model}.fit_transform(${featureData})',
                                description: 'Fit X into an embedded space and return that transformed output.', 
                                options: [
                                    { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X_train' }
                                ]
                            }
                        }
                        break;
                    }
                    actions = {
                        'fit': defaultActions['fit'],
                        'transform': defaultActions['transform'],
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
                    code: '${model}.score(${featureData}, {targetData})',
                    description: '',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X' },
                        { name: 'targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'y' }
                    ]
                },
                'cross_val_score': {
                    name: 'cross_val_score',
                    import: 'from sklearn.model_selection import cross_val_score',
                    code: '${allocateScore} = cross_val_score(${model}, ${featureData}, ${targetData}${scoring}${cv})',
                    description: 'Evaluate a score by cross-validation.',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X' },
                        { name: 'targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'y' },
                        { name: 'scoring', component: ['input'], usePair: true },
                        { name: 'cv', component: ['input'], usePair: true },
                        { name: 'allocateScore', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
                    ]
                },
                'get_params': {
                    name: 'get_params',
                    code: '${allocateParam} = ${model}.get_params(${deep})',
                    description: 'Get parameters for this estimator.',
                    options: [
                        { name: 'deep', component: ['bool_select'], default: 'True', usePair: true },
                        { name: 'allocateParam', component: ['input'] }
                    ]  
                },
                'permutation_importance': {
                    name: 'permutation_importance',
                    import: 'from sklearn.inspection import permutation_importance',
                    code: '${allocateImportance} = permutation_importance(${model}, ${featureData}, ${targetData}${scoring}${random_state}${etc})',
                    description: 'Permutation importance for feature evaluation.',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X_train' },
                        { name: 'targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'y_train' },
                        { name: 'scoring', component: ['input'], usePair: true },
                        { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true },
                        { name: 'allocateImportance', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
                    ]
                }
            }
            switch (category) {
                case 'Data Preparation':
                    infos = {
                        'get_params': defaultInfos['get_params']
                    }
                    break;
                case 'Regression':
                    infos = {
                        'score': {
                            ...defaultInfos['score'],
                            description: 'Return the coefficient of determination of the prediction.'
                        },
                        'cross_val_score': defaultInfos['cross_val_score'],
                        'permutation_importance': defaultInfos['permutation_importance'],
                        'Coefficient': {
                            name: 'Coefficient',
                            code: '${allocateCoef} = ${model}.coef_',
                            options: [
                                { name: 'allocateCoef', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
                            ]
                        },
                        'Intercept': {
                            name: 'Intercept',
                            code: '${allocateIntercept} = ${model}.intercept_',
                            options: [
                                { name: 'allocateIntercept', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
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
                        'cross_val_score': defaultInfos['cross_val_score'],
                        'permutation_importance': defaultInfos['permutation_importance']
                    }
                    break;
                case 'Auto ML':
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
                                code: '${allocateCenters} = ${model}.cluster_centers_',
                                description: 'Coordinates of cluster centers.', 
                                options: [
                                    { name: 'allocateCenters', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
                                ]
                            }
                        }
                    }

                    if (modelType == 'AgglomerativeClustering') {
                        infos = {
                            ...infos,
                            'Dendrogram': { // FIXME:
                                name: 'Dendrogram',
                                code: "# import\nfrom scipy.cluster.hierarchy import dendrogram, ward\n\nlinkage_array = ward(${data})\ndendrogram(linkage_array, p=3, truncate_mode='level', no_labels=True)\nplt.show()",
                                description: 'Draw a dendrogram',
                                options: [
                                    { name: 'data', label: 'Data', component: ['var_select'], var_type: ['DataFrame']}
                                ]
                            }
                        }
                    }
                    break;
                case 'Dimension Reduction':
                    if (modelType == 'PCA') {
                        infos = {
                            'explained_variance_ratio_': {
                                name: 'explained_variance_ratio_',
                                code: '${allocateRatio} = ${model}.explained_variance_ratio_',
                                description: 'Percentage of variance explained by each of the selected components.',
                                options: [
                                    { name: 'allocateRatio', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
                                ]
                            }
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
            tag.appendFormatLine('<div class="vp-multilang {0}">Info</div>', VP_INS_SELECT_TITLE);

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
                actListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>',
                VP_INS_SELECT_ITEM, actKey, 'action', actions[actKey].description, actKey);
            });
            Object.keys(infos).forEach(infoKey => {
                infoListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>',
                VP_INS_SELECT_ITEM, infoKey, 'info', infos[infoKey].description, infoKey);
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
            return code.toString();
        }
    }

    return ModelEditor;
});