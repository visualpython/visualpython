/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Pipeline.js
 *    Author          : Black Logic
 *    Note            : Pipeline
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 08. 09
 *    Change Date     :
 */

//============================================================================
// [CLASS] Pipeline
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_ml/pipeline.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_ml/pipeline'),
    __VP_RAW_LOADER__('vp_base/data/libraries.json'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/data/m_ml/mlLibrary',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/ModelEditor'
], function(msHtml, msCss, librariesJson, com_util, com_String, com_generator, ML_LIBRARIES, PopupComponent, SuggestInput, ModelEditor) {

    /**
     * Pipeline
     */
    class Pipeline extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 4;
            this.config.dataview = false;
            this.config.autoScroll = false;

            this.state = {
                templateType: '',
                modelStep: -1, // get modelStep sequence
                modelType: '', // get modelType
                modelTypeName: '', // get modelTypeName
                model: 'model',
                // now selected pipeline info
                pipeline: [
                    // copy of step + info
                    // { name, label, useApp, state, app }
                ],
                ...this.state
            }

            /**
             * useApp
                - Data Split
                - Data Prep
                - Regressor
                - Classifier
                - Clustering
                - Dimension
                - GridSearch
                - Evaluation
              
                - Fit
                - Transform
                - Predict
                - Fit and Predict
                - Fit and Transform
                - Fit and Resample
             */
            this.templateList = {
                'data-prep': {
                    label: 'Data Preparation',
                    modelStep: 0,
                    step: [
                        /**
                         * ml_* is pre-defined app
                         * pp_* is defined only for Pipeline
                         */
                        { name: 'ml_dataPrep', label: 'Data Prep', useApp: true, child: ['pp_fit', 'pp_transform', 'pp_fit_resample'] },
                        { name: 'pp_fit', label: 'Fit' },
                        { name: 'pp_transform', label: 'Transform' },
                        { name: 'pp_fit_resample', label: 'Fit and Resample' }
                    ]
                },
                'regression': {
                    label: 'Regression',
                    modelStep: 1,
                    step: [
                        { name: 'ml_dataSplit', label: 'Data Split', useApp: true },
                        { name: 'ml_regression', label: 'Regressor', useApp: true, child: ['pp_fit', 'pp_predict'] },
                        { name: 'pp_fit', label: 'Fit' },
                        { name: 'pp_predict', label: 'Predict' },
                        { name: 'ml_evaluation', label: 'Evaluation', useApp: true, state: { modelType: 'rgs' } },
                    ]
                },
                'classification': {
                    label: 'Classification',
                    modelStep: 1,
                    step: [
                        { name: 'ml_dataSplit', label: 'Data Split', useApp: true },
                        { name: 'ml_classification', label: 'Classifier', useApp: true, child: ['pp_fit', 'pp_predict'] },
                        { name: 'pp_fit', label: 'Fit' },
                        { name: 'pp_predict', label: 'Predict' },
                        { name: 'ml_evaluation', label: 'Evaluation', useApp: true, state: { modelType: 'clf' } },
                    ]
                },
                'clustering': {
                    label: 'Clustering',
                    modelStep: 0,
                    step: [
                        { name: 'ml_clustering', label: 'Clustering', useApp: true, child: ['pp_fit', 'pp_predict', 'pp_fit_predict', 'pp_transform'] },
                        { name: 'pp_fit', label: 'Fit' },
                        { name: 'pp_predict', label: 'Predict' },
                        { name: 'pp_fit_predict', label: 'Fit and Predict' },
                        { name: 'pp_transform', label: 'Transform' },
                        { name: 'ml_evaluation', label: 'Evaluation', useApp: true, state: { modelType: 'cls' } },
                    ]
                },
                'dimension': {
                    label: 'Dimension Reduction',
                    modelStep: 0,
                    step: [
                        { name: 'ml_dimensionReduction', label: 'Dimension Reduction', useApp: true, child: ['pp_fit', 'pp_transform', 'pp_fit_transform'] },
                        { name: 'pp_fit', label: 'Fit' },
                        { name: 'pp_transform', label: 'Transform' },
                        { name: 'pp_fit_transform', label: 'Fit and Transform' },
                    ]
                },
                'gridSearch': {
                    label: 'GridSearch',
                    modelStep: 1,
                    step: [
                        { name: 'ml_dataSplit', label: 'Data Split', useApp: true },
                        { name: 'ml_gridSearch', label: 'GridSearch', useApp: true, child: ['pp_fit', 'pp_predict'] },
                        { name: 'pp_fit', label: 'Fit' },
                        { name: 'pp_predict', label: 'Predict' },
                        { name: 'ml_evaluation', label: 'Evaluation', useApp: true },
                    ]
                }
            }

            // menu libraries for ml 
            let libObj = {};
            if (vpConfig.extensionType === 'lab' || vpConfig.extensionType === 'lite') {
                libObj = librariesJson;

                this.MlAppComponent = {};
                this.MlAppComponent['ml_dataSplit'] = require('./dataSplit');
                this.MlAppComponent['ml_dataPrep'] = require('./DataPrep');
                this.MlAppComponent['ml_regression'] = require('./Regression');
                this.MlAppComponent['ml_classification'] = require('./Classification');
                this.MlAppComponent['ml_clustering'] = require('./Clustering');
                this.MlAppComponent['ml_dimensionReduction'] = require('./DimensionReduction');
                this.MlAppComponent['ml_gridSearch'] = require('./GridSearch');
                this.MlAppComponent['ml_evaluation'] = require('./evaluation');
            } else {
                libObj = JSON.parse(librariesJson);
            }
            this.mlAppList = libObj.library.item.filter(x => x.id === 'pkg_ml')[0].item;
            
            this.modelConfig = ML_LIBRARIES;
        }

        _unbindEvent() {
            super._unbindEvent();

            $(document).off('click', this.wrapSelector('.vp-pp-item[data-flag="enabled"]'));
            $(document).off('click', this.wrapSelector('.vp-pp-item-toggle'));
            $(document).off('change', this.wrapSelector(`#modelType`));
            $(document).off('change', this.wrapSelector('#allocateToCreation'));

        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;

            // select template
            $(this.wrapSelector('#templateType')).on('change', function() {
                let type = $(this).val();
                that.state.templateType = type;
                that.state.model = 'model';
                that.state.modelType = '';
                that.state.modelTypeName = '';
                that.state.modelStep = -1;
                
                // reset pp-page
                $(that.wrapSelector('.vp-pp-template')).html('');
                $(that.wrapSelector('.vp-pp-step-content')).html('');
                $(that.wrapSelector('.vp-pp-step-title')).text('');
                that.state.pipeline = [];
                $(that.wrapSelector('.vp-pp-step-prev')).addClass('disabled');
                $(that.wrapSelector('.vp-pp-step-next')).addClass('disabled');
                
                that.handleChangeTemplate(type);
            }); 

            // select pipeline item
            $(document).on('click', this.wrapSelector('.vp-pp-item[data-flag="enabled"]'), function() {
                if (!$(this).hasClass('selected')) {
                    let title = $(this).data('label');
                    let stepSeq = parseInt($(this).data('step')); // 0 ~ n
                    let name = $(this).data('name');
                    let ppObj = that.state.pipeline[stepSeq];
                    // set title
                    $(that.wrapSelector('.vp-pp-step-title')).text(title);

                    // show page
                    $(that.wrapSelector(`.vp-pp-step-page:not([data-name="${name}"])`)).hide();
                    $(that.wrapSelector(`.vp-pp-step-page[data-name="${name}"]`)).show();
                    if (ppObj.useApp === true) {
                        ppObj.app && ppObj.app.open($(that.wrapSelector(`.vp-pp-step-page[data-name="${name}"]`)));
                    } else {
                        that.renderApp(name);
                    }

                    // check selected
                    $(that.wrapSelector('.vp-pp-item')).removeClass('selected');
                    $(this).addClass('selected');

                    // check prev/next
                    let prevTagList = $(this).prevAll('.vp-pp-item[data-flag="enabled"]:visible');
                    let nextTagList = $(this).nextAll('.vp-pp-item[data-flag="enabled"]:visible');
                    if (prevTagList.length == 0) {
                        $(that.wrapSelector('.vp-pp-step-prev')).addClass('disabled');
                    } else {
                        $(that.wrapSelector('.vp-pp-step-prev')).removeClass('disabled');
                    }
                    if (nextTagList.length == 0) {
                        $(that.wrapSelector('.vp-pp-step-next')).addClass('disabled');
                    } else {
                        $(that.wrapSelector('.vp-pp-step-next')).removeClass('disabled');
                    }
                }
            });

            // pipeline item toggle (enable/disable)
            $(document).on('click', this.wrapSelector('.vp-pp-item-toggle'), function(evt) {
                evt.stopPropagation();
                let itemTag = $(this).closest('.vp-pp-item');
                let name = $(itemTag).attr('data-name');
                let flag = $(itemTag).attr('data-flag'); // enabled / disabled
                if (flag === 'enabled') {
                    $(itemTag).attr('data-flag', 'disabled');
                    $(this).prop('checked', false);
                } else if (flag === 'disabled') {
                    $(itemTag).attr('data-flag', 'enabled');
                    $(this).prop('checked', true);
                }

                if ($(itemTag).hasClass('selected')) {
                    // check if this page is this item's, then hide it.
                    $(that.wrapSelector('.vp-pp-step-title')).text('');
                    $(that.wrapSelector(`.vp-pp-step-page[data-name="${name}"]`)).hide();
                    $(itemTag).removeClass('selected');

                    // disable prev/next
                    $(that.wrapSelector('.vp-pp-step-prev')).addClass('disabled');
                    $(that.wrapSelector('.vp-pp-step-next')).addClass('disabled');
                } else {
                    // check prev/next
                    let selectedTag = $(that.wrapSelector('.vp-pp-item.selected'));
                    let prevTagList = $(selectedTag).prevAll('.vp-pp-item[data-flag="enabled"]:visible');
                    let nextTagList = $(selectedTag).nextAll('.vp-pp-item[data-flag="enabled"]:visible');
                    if (prevTagList.length == 0) {
                        $(that.wrapSelector('.vp-pp-step-prev')).addClass('disabled');
                    } else {
                        $(that.wrapSelector('.vp-pp-step-prev')).removeClass('disabled');
                    }
                    if (nextTagList.length == 0) {
                        $(that.wrapSelector('.vp-pp-step-next')).addClass('disabled');
                    } else {
                        $(that.wrapSelector('.vp-pp-step-next')).removeClass('disabled');
                    }
                }

            });

            // model type change event
            $(document).on('change', this.wrapSelector(`#modelType`), function() {
                let name = $(this).closest('.vp-pp-step-page').data('name');
                let modelCreatorList = ['ml_dataPrep', 'ml_regression', 'ml_classification', 'ml_clustering', 'ml_dimensionReduction', 'ml_gridSearch'];
                if (modelCreatorList.includes(name)) {
                    let modelType = $(this).val();
                    let modelObj = that.modelConfig[modelType];
                    let modelTypeName = modelObj.returnType;
                    
                    that.state.modelType = modelType;
                    that.state.modelTypeName = modelTypeName;
                    
                    // show fit / predict / transform depends on model selection
                    let defaultActions = ['fit', 'predict', 'transform', 'fit_predict', 'fit_transform', 'fit_resample'];
                    let actions = that.modelEditor.getAction(modelTypeName);
                    defaultActions.forEach(actKey => {
                        if (actions[actKey] === undefined) {
                            // if undefined, hide step
                            $(that.wrapSelector(`.vp-pp-item[data-name="pp_${actKey}"]`)).hide();
                        } else {
                            $(that.wrapSelector(`.vp-pp-item[data-name="pp_${actKey}"]`)).show();
                            if (actKey === 'fit_predict') {
                                if (actions['fit'] === undefined || actions['predict'] === undefined) {
                                    $(that.wrapSelector(`.vp-pp-item[data-name="pp_fit"]`)).hide();
                                    $(that.wrapSelector(`.vp-pp-item[data-name="pp_predict"]`)).hide();
                                } else {
                                    $(that.wrapSelector(`.vp-pp-item[data-name="pp_${actKey}"]`)).hide();
                                }
                            } else if (actKey === 'fit_transform') {
                                if (actions['fit'] === undefined || actions['transform'] === undefined) {
                                    $(that.wrapSelector(`.vp-pp-item[data-name="pp_fit"]`)).hide();
                                    $(that.wrapSelector(`.vp-pp-item[data-name="pp_transform"]`)).hide();
                                } else {
                                    $(that.wrapSelector(`.vp-pp-item[data-name="pp_${actKey}"]`)).hide();
                                }
                            } else if (actKey === 'fit_resample') {
                                // for SMOTE: show fit_resample only
                                $(that.wrapSelector(`.vp-pp-item[data-name="pp_fit"]`)).hide();
                                $(that.wrapSelector(`.vp-pp-item[data-name="pp_transform"]`)).hide();
                            }
                        }
                        $(that.wrapSelector('.vp-pp-item')).removeClass('vp-last-visible');
                        $(that.wrapSelector('.vp-pp-item:visible:last')).addClass('vp-last-visible');
                    });

                    // change evaluation page's default selection
                    if (name === 'ml_gridSearch') {
                        let modelCategory = that.modelEditor.getModelCategory(modelTypeName); // Regression / Classification / Clustering
                        let evalModelTypeValue = 'rgs';
                        switch (modelCategory) {
                            case 'Regression':
                                evalModelTypeValue = 'rgs';
                                break;
                            case 'Classification':
                                evalModelTypeValue = 'clf';
                                break;
                            case 'Clustering':
                                evalModelTypeValue = 'cls';
                                break;
                        }
                        let evalPageTag = $(that.wrapSelector('.vp-pp-step-page[data-name="ml_evaluation"]'));
                        if (evalPageTag.is(':empty') === true) {
                            // evaluation page is not opened yet
                            // set state for evaluation page
                            let stepSeq = $(evalPageTag).data('step');
                            let ppObj = that.state.pipeline[stepSeq];
                            if (ppObj.app) {
                                ppObj.app.state.modelType = evalModelTypeValue;
                            }
                        } else {
                            let evalModelTypeTag = $(evalPageTag).find('#modelType');
                            $(evalModelTypeTag).val(evalModelTypeValue);
                            $(evalModelTypeTag).trigger('change');
                        }
                    }
                }
            });

            // model allocation variable change
            $(document).on('change', this.wrapSelector('#allocateToCreation'), function() {
                let name = $(this).closest('.vp-pp-step-page').data('name');
                let modelAllocation = $(this).val();
                that.state.model = modelAllocation;
            });

            // click prev button
            $(this.wrapSelector('.vp-pp-step-prev:not(.disabled)')).on('click', function() {
                let selectedTag = $(that.wrapSelector('.vp-pp-item.selected'));
                let prevTagList = $(selectedTag).prevAll('.vp-pp-item[data-flag="enabled"]:visible');
                $(prevTagList[0]).trigger('click');
            });

            // click next button
            $(this.wrapSelector('.vp-pp-step-next:not(.disabled)')).on('click', function() {
                let selectedTag = $(that.wrapSelector('.vp-pp-item.selected'));
                let nextTagList = $(selectedTag).nextAll('.vp-pp-item[data-flag="enabled"]:visible')
                $(nextTagList[0]).trigger('click');
            });
        }

        /**
         * 
         * @param {*} type template type
         */
        handleChangeTemplate(type) {
            let that = this;
            if (type !== '') {
                let tplObj = this.templateList[type];
                this.state.modelStep = tplObj.modelStep;

                let ppTag = new com_String();
                let appFileList = [];
                // load pipeline items
                tplObj.step.forEach((stepObj, idx) => {
                    let { name, label, useApp=false, child=[], state={} } = stepObj;
                    ppTag.appendFormatLine(`<div class="vp-pp-item" data-flag="enabled" data-name="{0}" data-step="{1}" data-label="{2}">
                        <span>{3}</span>
                        <div class="vp-pp-item-menu">
                            <label><input type="checkbox" class="vp-toggle vp-pp-item-toggle" checked/><span></span></label>
                        </div>
                    </div>`, name, idx, label, label);

                    // get pages
                    if (useApp === true) {
                        let mlObj = that.mlAppList.filter(x => x.id === name)[0];
                        if (vpConfig.extensionType === 'lab' || vpConfig.extensionType === 'lite') {
                            appFileList.push({ index: idx, name: name, file: 'vp_base/js/' + mlObj.file});
                        } else {
                            appFileList.push({ index: idx, name: name, file: 'vp_base/js/' + mlObj.file});
                        }
                    }
                    let pipeObj = {
                        name: name,
                        label: label,
                        useApp: useApp,
                        state: state
                    };
                    if (tplObj.modelStep === idx) {
                        pipeObj.modelStep = true;
                        pipeObj.child = child;
                    }
                    that.state.pipeline.push(pipeObj);
                    // append pages
                    $(that.wrapSelector('.vp-pp-step-content')).append(
                        `<div class="vp-pp-step-page" data-step="${idx}" data-name="${name}"></div>`);
                    if (useApp === false) {
                        that.renderApp(name);
                        // hide
                        $(that.wrapSelector(`.vp-pp-step-page[data-name="${name}"]`)).hide();
                    }

                });
                $(that.wrapSelector('.vp-pp-template')).html(ppTag.toString());

                // render pages
                // for lite and lab
                if (vpConfig.extensionType === 'lab' || vpConfig.extensionType === 'lite') {
                    appFileList.forEach((obj, argIdx) => {
                        let MlComponent = that.MlAppComponent[obj.name];
                        if (MlComponent) {
                            // DUP AREA: pp-1
                            let { name, index, file } = obj;
                            let mlComponent = new MlComponent({ 
                                config: { id: name, name: that.state.pipeline[index].label, path: file, category: 'Pipeline', resizable: false },
                                    ...that.state.pipeline[index].state
                            });
                            mlComponent.loadState();
                            // mlComponent.open($(that.wrapSelector(`.vp-pp-step-page[data-name="${appId}"]`)));
                            that.state.pipeline[index].app = mlComponent;

                            if (that.state.pipeline[index].modelStep === true) {
                                // set default model type
                                that.state.model = mlComponent.state.allocateToCreation;
                                that.state.modelType = mlComponent.state.modelType;
                                let modelObj = that.modelConfig[that.state.modelType];
                                that.state.modelTypeName = modelObj.code.split('(')[0];

                                that.state.pipeline[index].child.forEach(childId => {
                                    that.renderApp(childId);
                                });
                            }
                            // handle app view
                            that.handleAppView(name, mlComponent);

                            // select first step
                            $(that.wrapSelector('.vp-pp-item[data-step="0"]')).click();
                            $(that.wrapSelector('#modelType')).trigger('change');
                            // end of DUP AREA: pp-1
                        }
                    });

                } else {
                    // for notebook and others
                    window.require(appFileList.map(x => x.file), function() {
                        appFileList.forEach((obj, argIdx) => {
                            let MlComponent = arguments[argIdx];
                            if (MlComponent) {
                                // DUP AREA: pp-1
                                let { name, index, file } = obj;
                                let mlComponent = new MlComponent({ 
                                    config: { id: name, name: that.state.pipeline[index].label, path: file, category: 'Pipeline', resizable: false },
                                        ...that.state.pipeline[index].state
                                });
                                mlComponent.loadState();
                                // mlComponent.open($(that.wrapSelector(`.vp-pp-step-page[data-name="${appId}"]`)));
                                that.state.pipeline[index].app = mlComponent;

                                if (that.state.pipeline[index].modelStep === true) {
                                    // set default model type
                                    that.state.model = mlComponent.state.allocateToCreation;
                                    that.state.modelType = mlComponent.state.modelType;
                                    let modelObj = that.modelConfig[that.state.modelType];
                                    that.state.modelTypeName = modelObj.code.split('(')[0];

                                    that.state.pipeline[index].child.forEach(childId => {
                                        that.renderApp(childId);
                                    });
                                }
                                // handle app view
                                that.handleAppView(name, mlComponent);

                                // select first step
                                $(that.wrapSelector('.vp-pp-item[data-step="0"]')).click();
                                $(that.wrapSelector('#modelType')).trigger('change');
                                // end of DUP AREA: pp-1
                            }
                        })
                        
                    });
                }
            }
        }

        templateForBody() {
            let page = $(msHtml);
            
            let that = this;

            //================================================================
            // Template list creation
            //================================================================
            let tplTag = new com_String();
            tplTag.appendLine('<option value="">Select pipeline...</option>');
            Object.keys(this.templateList).forEach(tplKey => {
                let tplObj = that.templateList[tplKey];
                let selectedFlag = '';
                if (tplKey == that.state.templateType) {
                    selectedFlag = 'selected';
                }
                tplTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                                tplKey, selectedFlag, tplObj.label);
            });
            $(page).find('#templateType').html(tplTag.toString());

            return page;
        }

        render() {
            super.render();

            // resize codeview
            $(this.wrapSelector('.vp-popup-codeview-box')).css({'height': '300px'});

            // Model Editor
            this.modelEditor = new ModelEditor(this, "model", "instanceEditor");

            // load state
            if (this.state.templateType !== '') {
                $(this.wrapSelector('#templateType')).trigger('change');
            } else {
                $(this.wrapSelector('.vp-pp-step-prev')).addClass('disabled');
                $(this.wrapSelector('.vp-pp-step-next')).addClass('disabled');
            }
        }

        /**
         * Handle app view before open
         * @param {string} appId
         * @param {*} mlApp 
         */
        handleAppView(appId, mlApp) {
            switch (appId) {
                case 'ml_dataSplit':
                    $(mlApp.wrapSelector('#inputData')).parent().hide();
                    break;
            }
        }

        /**
         * Custom pages
         * @param {*} appId 
         */
        renderApp(appId) {
            let actions = this.modelEditor.getAction(this.state.modelTypeName);
            let tag = '';
            switch (appId) {
                case 'pp_fit':
                    tag = this.templateForOptionPage(actions['fit']);
                    break;
                case 'pp_predict':
                    tag = this.templateForOptionPage(actions['predict']);
                    break;
                case 'pp_transform':
                    tag = this.templateForOptionPage(actions['transform']);
                    break;
                case 'pp_fit_predict':
                    tag = this.templateForOptionPage(actions['fit_predict']);
                    break;
                case 'pp_fit_transform':
                    tag = this.templateForOptionPage(actions['fit_transform']);
                    break;
                case 'pp_fit_resample':
                    tag = this.templateForOptionPage(actions['fit_resample']);
                    break;
            }
            $(this.wrapSelector(`.vp-pp-step-page[data-name="${appId}"]`)).html(`
                <div class="vp-grid-border-box vp-grid-col-110">${tag}</div>
            `);
        }

        templateForOptionPage(packageObj) {
            let optBox = new com_String();
            // render tag
            packageObj && packageObj.options && packageObj.options.forEach(opt => {
                let label = opt.name;
                if (opt.label != undefined) {
                    label = opt.label;
                }
                // fix label
                label = com_util.optionToLabel(label);
                optBox.appendFormatLine('<label for="{0}" title="{1}">{2}</label>'
                    , opt.name, opt.name, label);
                let tmpState = {};
                if (opt.value && opt.value !== '') {
                    tmpState[opt.name] = opt.value;
                }
                let content = com_generator.renderContent(this, opt.component[0], opt, tmpState);
                optBox.appendLine(content[0].outerHTML);
            });
            return optBox.toString();
        }

        checkBeforeRun() {
            let that = this;
            var result = true;
            for (let idx = 0; idx < this.state.pipeline.length; idx++) {
                let ppObj = this.state.pipeline[idx];
                var { name, label, useApp, app } = ppObj;
                let requiredList = [];
                result = true;
                let isVisible = $(that.wrapSelector(`.vp-pp-item[data-step="${idx}"]`)).is(':visible') === true;
                let isEnabled = $(that.wrapSelector(`.vp-pp-item[data-step="${idx}"]`)).attr('data-flag') === 'enabled';
                if (isVisible && isEnabled) {
                    switch (name) {
                        case 'ml_dataSplit':
                            requiredList = ['featureData', 'targetData'];
                            // check required data
                            for (let i = 0; i < requiredList.length; i++) {
                                let reqKey = requiredList[i];
                                result = that._checkIsEmpty($(app.wrapSelector('#' + reqKey)));
                                if (result === false) {
                                    // show page and focus it
                                    $(that.wrapSelector(`.vp-pp-item[data-name="${name}"]`)).click();
                                    $(app.wrapSelector('#' + reqKey)).focus();
                                    break;
                                }
                            }
                            break;
                        case 'ml_gridSearch':
                            result = app.checkBeforeRun();
                            if (result === false) {
                                // show page
                                $(that.wrapSelector(`.vp-pp-item[data-name="${name}"]`)).click();
                                break;
                            }
                            break;
                    }
                }
                if (result === false) {
                    break;
                }
            }
            return result;

        }

        _checkIsEmpty(tag) {
            let requiredFilled = true;
            // if it's empty, focus on it
            if (tag && $(tag) && $(tag).val() == '') {
                requiredFilled = false;
            }
            return requiredFilled;
        }

        generateCodeForOptionPage(appId) {
            let actions = this.modelEditor.getAction(this.state.modelTypeName);
            let actObj = {};
            switch (appId) {
                case 'pp_fit':
                    actObj = actions['fit'];
                    break;
                case 'pp_predict':
                    actObj = actions['predict'];
                    break;
                case 'pp_transform':
                    actObj = actions['transform'];
                    break;
                case 'pp_fit_predict':
                    actObj = actions['fit_predict'];
                    break;
                case 'pp_fit_transform':
                    actObj = actions['fit_transform'];
                    break;
                case 'pp_fit_resample':
                    actObj = actions['fit_resample'];
                    break;
            }

            let code = new com_String();
            if (actObj.import != undefined) {
                code.appendLine(actObj.import);
                code.appendLine();
            }

            let that = this;
            let state = {
                model: this.state.model
            };
            $(this.wrapSelector(`.vp-pp-step-page[data-name="${appId}"] .vp-state`)).each((idx, tag) => {
                let id = tag.id;
                let value = that._getTagValue(tag);
                state[id] = value;
            }); 
            
            let modelCode = com_generator.vp_codeGenerator(this, actObj, state);
            modelCode = modelCode.replace('${model}', state.model);
            code.append(modelCode);
            return { state: state, code: code.toString() };
        }

        generateCode() {
            let that = this;   
            let { template } = this.state;
            let code = new com_String(); 
            
            let stepNo = 1;
            this.state.pipeline.forEach((ppObj, idx) => {
                let { name, label, useApp, app } = ppObj;
                
                // check disabled
                let isVisible = $(that.wrapSelector(`.vp-pp-item[data-step="${idx}"]`)).is(':visible') === true;
                let isEnabled = $(that.wrapSelector(`.vp-pp-item[data-step="${idx}"]`)).attr('data-flag') === 'enabled';
                if (isVisible && isEnabled) {
                    if (code.toString() !== '') {
                        code.appendLine();
                        code.appendLine();
                    }
                    if (useApp === true) {
                        let appCode = app.generateCode();
                        if (appCode instanceof Array) {
                            appCode = appCode.join('\n');
                        }
                        if (appCode && appCode.trim() !== '') {
                            code.appendFormatLine("# [{0}] {1}", stepNo++, label);
                            if (name === 'ml_evaluation') {
                                // import auto generate
                                code.appendLine(app.generateImportCode().join('\n'));
                            }
                            code.append(appCode);
                        }
                        // save state
                        that.state.pipeline[idx].state = app.state;
                    } else {
                        let ppResult = that.generateCodeForOptionPage(name);
                        if (ppResult && ppResult?.code?.trim() !== '') {
                            code.appendFormatLine("# [{0}] {1}", stepNo++, label);
                            code.append(ppResult.code);
                        }
                        // save state
                        that.state.pipeline[idx].state = ppResult.state;
                    }
                }
            });

            return code.toString();
        }

    }

    return Pipeline;
});