/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : GridSearch.js
 *    Author          : Black Logic
 *    Note            : GridSearch
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 08. 09
 *    Change Date     :
 */

//============================================================================
// [CLASS] GridSearch
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_ml/gridSearch.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_ml/gridSearch'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/data/m_ml/mlLibrary',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/MultiSelector',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/ModelEditor'
], function(msHtml, msCss, com_util, com_interface, com_String, com_generator, ML_LIBRARIES, PopupComponent, MultiSelector, SuggestInput, ModelEditor) {

    /**
     * GridSearch
     */
    class GridSearch extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 3;
            this.config.dataview = false;
            this.config.docs = 'https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GridSearchCV.html';

            this.state = {
                modelType: 'ln-rgs',
                userOption: '',
                allocateToCreation: 'model',
                ...this.state
            }

            this.targetSetTag = null;

            this.modelConfig = ML_LIBRARIES;

            this.modelTypeList = {
                'Regression': ['ln-rgs', 'ridge', 'lasso', 'elasticnet', 'sv-rgs', 'dt-rgs', 'rf-rgs', 'gbm-rgs', 'xgb-rgs', 'lgbm-rgs', 'cb-rgs'],
                'Classfication': ['lg-rgs', 'bern-nb', 'mulnom-nb', 'gaus-nb', 'sv-clf', 'dt-clf', 'rf-clf', 'gbm-clf', 'xgb-clf', 'lgbm-clf', 'cb-clf']
            }


        }

        _unbindEvent() {
            super._unbindEvent();
            $(document).off('click', this.wrapSelector('.vp-param-set-del'));
            $(document).off('click', this.wrapSelector('.vp-param-item-add'));
            $(document).off('click', this.wrapSelector('.vp-param-item-del'));
            $(document).off('keyup', this.wrapSelector('.vp-param-val'));
            $(document).off('click', this.wrapSelector('.vp-param-result-item-del'));
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;

            // select model type
            $(this.wrapSelector('#modelType')).on('change', function() {
                let modelType = $(this).val();
                that.state.modelType = modelType;

                // show install button
                if (that.modelConfig[modelType].install != undefined) {
                    that.showInstallButton();
                } else {
                    that.hideInstallButton();
                }

                that.handleScoringOptions(modelType);

                // reset model param set
                $(that.wrapSelector('.vp-param-grid-box')).html('');
                $(that.wrapSelector('.vp-param-grid-box')).html(that.templateForParamSet());
            });

            // Add param set
            $(this.wrapSelector('#vp_addParamSet')).on('click', function() {
                let newSet = $(that.templateForParamSet());
                $(that.wrapSelector('.vp-param-grid-box')).append(newSet);
                // focus
                $(newSet)[0].scrollIntoView();
            });

            // delete param set
            $(document).on('click', this.wrapSelector('.vp-param-set-del'), function() {
                $(this).closest('.vp-param-set-box').remove();

                // rename param set
                $(that.wrapSelector('.vp-param-set-name')).each((i, tag) => {
                    $(tag).text('Param set ' + (i + 1));
                });
            });

            // Add param item
            $(document).on('click', this.wrapSelector('.vp-param-item-add'), function() {
                that.targetSetTag = $(this).parent(); // target param-set-box
                that.openParamPopup();
            });

            // Delete param item
            $(document).on('click', this.wrapSelector('.vp-param-item-del'), function() {
                $(this).closest('.vp-param-item').remove();
            });

            // add param value - using enter
            $(document).on('keyup', this.wrapSelector('.vp-param-val'), function(event) {
                var keycode =  event.keyCode 
                            ? event.keyCode 
                            : event.which;
                if (keycode == vpEvent.keyManager.keyCode.enter) { // enter
                    that.handleAddParamValue($(this));
                }
                if (keycode === 188) {// ,<
                    let val = $(this).val();
                    $(this).val(val.split(',')[0]); // remove , and add param
                    that.handleAddParamValue($(this));
                }
            });

            // delete param set item
            $(document).on('click', this.wrapSelector('.vp-param-result-item-del'), function() {
                $(this).closest('.vp-param-result-item').remove();
            });
        }

        handleAddParamValue(thisTag) {
            let parentTag = $(thisTag).parent();
            let paramIsText = $(parentTag).find('.vp-param-val').data('type') === 'text'; // text / var
            let paramVal = $(parentTag).find('.vp-param-val').val();
            let reservedKeywordList = ['None', 'True', 'False', 'np.nan', 'np.NaN'];
            if (reservedKeywordList.includes(paramVal)) {
                paramIsText = false;
            }
            // check , and split it
            let paramSplit = paramVal.split(',');
            paramSplit && paramSplit.forEach(val => {
                // add only if it is not empty value
                if (val.trim() !== '') {
                    val = com_util.convertToStr(val.trim(), paramIsText);
                    $(parentTag).find('.vp-param-result-box').append(`
                        <span class="vp-param-result-item" data-value="${val}">${val}
                        <span class="vp-icon-close-small vp-param-result-item-del" title="Click to delete this param value."></span>
                        </span>
                    `);
                    // clear param val
                    $(parentTag).find('.vp-param-val').val('');
                }
            });
        }

        bindEventForInnerPopup() {
            let that = this;
            // Inner popup: Select param
            $(document).off('click', this.wrapSelector('.vp-inner-param-list-item'));
            $(document).on('click', this.wrapSelector('.vp-inner-param-list-item'), function() {
                if ($(this).hasClass('selected')) {
                    $(this).removeClass('selected');
                } else {
                    $(this).addClass('selected');
                }
            });

            // Inner popup: Add param
            $(this.wrapSelector('.vp-add-param-btn')).on('click', function() {
                let newParam = $(that.wrapSelector('.vp-add-param-name')).val();
                if (newParam != undefined && newParam.trim() != '') {
                    // check if exist
                    let checkTag = $(that.wrapSelector(`.vp-inner-param-list-item[data-name="${newParam}"]`));
                    if (checkTag.length > 0) {
                        if (!checkTag.hasClass('selected')) {
                            checkTag.addClass('selected');
                        }
                        checkTag[0].scrollIntoView();
                    } else {
                        // add to param list
                        $(that.wrapSelector('.vp-inner-param-list-box')).append(
                            `<div class="vp-inner-param-list-item selected" data-name="${newParam}" title="${newParam}">${newParam}</div>`
                        );
                        // scroll to added item
                        $(that.wrapSelector('.vp-inner-param-list-item.selected:last'))[0].scrollIntoView();
                    }

                    // clear input value
                    $(that.wrapSelector('.vp-add-param-name')).val('');
                }
            });
        }

        handleScoringOptions(modelType) {
            let options = {
                'Classification': [
                    "'accuracy'",
                    "'balanced_accuracy'",
                    "'top_k_accuracy'",
                    "'average_precision'",
                    "'neg_brier_score'",
                    "'f1'",
                    "'f1_micro'",
                    "'f1_macro'",
                    "'f1_weighted'",
                    "'f1_samples'",
                    "'neg_log_loss'",
                    "'precision' etc.",
                    "'recall' etc.",
                    "'jaccard' etc.",
                    "'roc_auc'",
                    "'roc_auc_ovr'",
                    "'roc_auc_ovo'",
                    "'roc_auc_ovr_weighted'",
                    "'roc_auc_ovo_weighted'",
                ],
                'Regression': [
                    "'explained_variance'",
                    "'max_error'",
                    "'neg_mean_absolute_error'",
                    "'neg_mean_squared_error'",
                    "'neg_root_mean_squared_error'",
                    "'neg_mean_squared_log_error'",
                    "'neg_median_absolute_error'",
                    "'r2'",
                    "'neg_mean_poisson_deviance'",
                    "'neg_mean_gamma_deviance'",
                    "'neg_mean_absolute_percentage_error'",
                    "'d2_absolute_error_score'",
                    "'d2_pinball_score'",
                    "'d2_tweedie_score'"
                ]
            }
            let modelCategory = this.modelTypeList['Regression'].includes(modelType)?'Regression':'Classification';

            // Set suggestInput on scoring option
            var suggestInput = new SuggestInput();
            suggestInput.setComponentID('scoring');
            suggestInput.setPlaceholder('Select option');
            suggestInput.addClass('vp-input vp-state');
            suggestInput.setSuggestList(function() { return options[modelCategory]; });
            suggestInput.setNormalFilter(true);
            $(this.wrapSelector('#scoring')).replaceWith(suggestInput.toTagString());
        }

        templateForParamSet() {
            let paramSetNo = 1;
            // set param set number
            paramSetNo += $(this.wrapSelector('.vp-param-set-box')).length;
            return `<div class="vp-grid-border-box vp-param-set-box">
                <div>
                    <label class="vp-bold vp-param-set-name">Param set ${paramSetNo}</label>
                    <div class="vp-icon-delete vp-param-set-del" title="Delete this param set."></div>
                </div>
                <div class="vp-grid-box vp-param-item-box">

                </div>
                <button class="vp-button vp-param-item-add">+ Add param</button>
            </div>`;
        }

        templateForParamPopup() {
            let config = this.modelConfig[this.state.modelType];
            let optBox = new com_String();
            // render tag
            config.options.forEach(opt => {
                optBox.appendFormatLine('<div class="vp-inner-param-list-item" data-name="{0}" title="{1}">{2}</div>'
                    , opt.name, opt.name, opt.name);
            });

            return `
            <div class="vp-italic"><span class="vp-orange-text">NOTE:</span> Select parameters to add.</div>
            <div class="vp-inner-param-list-box vp-scrollbar no-selection">
                ${optBox.toString()}
            </div>
            <div>
                <input type="text" class="vp-input vp-add-param-name" placeholder="Input param name"/>
                <button class="vp-button vp-add-param-btn">Add</button>
            </div>
            `;
        }

        openParamPopup() {
            let size = { width: 400, height: 300 };

            $(this.wrapSelector('.vp-inner-popup-body')).empty();

            // set size and position
            $(this.wrapSelector('.vp-inner-popup-box')).css({
                width: size.width,
                height: size.height,
                left: 'calc(50% - ' + (size.width/2) + 'px)',
                top: 'calc(50% - ' + (size.height/2) + 'px)',
            });

            $(this.wrapSelector('.vp-inner-popup-body')).html(this.templateForParamPopup());

            this.bindEventForInnerPopup();

            // show popup box
            this.openInnerPopup('Add parameter');
        }

        handleInnerOk() {
            // get selected param list
            let paramList = [];
            $(this.wrapSelector('.vp-inner-param-list-item.selected')).each((i, tag) => {
                paramList.push($(tag).data('name'));
            });

            if (paramList.length > 0) {
                // add param box
                $(this.targetSetTag).find('.vp-param-item-box').append(this.templateForParamItemList(paramList));
    
                this.closeInnerPopup();
            } else {
                com_util.renderAlertModal('No params selected. Please select more than one param.');
            }

            this.targetSetTag = null;
        }

        templateForBody() {
            let page = $(msHtml);
            
            let that = this;

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

            //================================================================
            // GridSearch option
            //================================================================
            $(page).find('.vp-model-option-box').html(this.templateForOption('grid-search', ['estimator', 'param_grid']));

            // show install button
            if (this.modelConfig[this.state.modelType].install != undefined) {
                this.showInstallButton();
            } else {
                this.hideInstallButton();
            }

            // render option page
            // $(page).find('.vp-model-param-box').html(this.templateForOption(this.state.modelType));

            return page;
        }

        templateForOption(modelType, excludeOptList=[]) {
            let config = this.modelConfig[modelType];
            let state = this.state;

            let optBox = new com_String();
            // render tag
            config.options.forEach(opt => {
                if (!excludeOptList.includes(opt.name)) {
                    optBox.appendFormatLine('<label for="{0}" title="{1}">{2}</label>'
                        , opt.name, opt.name, com_util.optionToLabel(opt.name));
                    let content = com_generator.renderContent(this, opt.component[0], opt, state);
                    optBox.appendLine(content[0].outerHTML);
                }
            });
            // render user option
            optBox.appendFormatLine('<label for="{0}">{1}</label>', 'userOption', 'User option');
            optBox.appendFormatLine('<input type="text" class="vp-input vp-state" id="{0}" placeholder="{1}" value="{2}"/>',
                                        'userOption', 'key=value, ...', this.state.userOption);
            return optBox.toString();
        }

        /**
         * template for param box
         * @param {*} paramList ['param-name1', 'param-name2', ...]
         */
        templateForParamItemList(paramList) {
            let that = this;
            let config = this.modelConfig[this.state.modelType];
            let paramSet = new com_String();
            paramList && paramList.forEach(name => {
                // get option component
                  let componentType = 'input'; // default
                let paramObj = config.options.filter(x => x.name === name).at(0);
                if ((paramObj !== undefined) && (['option_select', 'bool_select'].includes(paramObj.component[0]))) {
                    componentType = 'option';
                }
                paramSet.appendLine('<div class="vp-grid-col-110 vp-param-item">');
                paramSet.appendFormatLine('<label title="{0}">{1}</label>', name, com_util.optionToLabel(name));
                paramSet.appendLine('<div class="vp-flex-gap5">');
                paramSet.appendFormatLine('<div class="vp-param-result-input-box vp-no-selection vp-cursor" data-name="{0}">', name);
                paramSet.appendFormatLine('<span class="vp-param-result-box vp-no-selection vp-cursor" data-name="{0}"></span>', name);
                if (componentType === 'input') {
                    paramSet.appendFormatLine('<input type="text" class="vp-param-val" data-name="{0}" data-type="var" placeholder="Type here"/>', name);
                    
                } else {
                    // paramSet.appendFormatLine('<input type="text" class="vp-input vp-param-val" data-name="{0}"/>', name);
                    var suggestInput = new SuggestInput();
                    suggestInput.setPlaceholder('Type here');
                    suggestInput.addClass('vp-param-val');
                    suggestInput.addAttribute('data-name', name);
                    suggestInput.addAttribute('data-type', (paramObj.type === 'text' ? 'text' : 'var'));
                    let optionList = paramObj.options;
                    if (paramObj.component[0] === 'bool_select') {
                        optionList = ['True', 'False'];
                    }
                    suggestInput.setSuggestList(function() { return optionList; });
                    suggestInput.setNormalFilter(false);
                    suggestInput.setSelectEvent(function(selectedValue) {
                        // trigger change
                        let thisTag = $(that.wrapSelector('.' + suggestInput.uuid));
                        that.handleAddParamValue($(thisTag));
                        $(thisTag).val('');
                        return false;
                    });
                    paramSet.appendLine(suggestInput.toTagString());
                }
                paramSet.appendLine('</div>');
                paramSet.appendLine('<div class="vp-icon-close-small vp-param-item-del" title="Click to delete this param from this set."></div>');
                paramSet.appendLine('</div>');
                paramSet.appendLine('</div>'); // vp-param-item
            });
            return paramSet.toString();
        }

        render() {
            super.render();

            // Model Editor
            this.modelEditor = new ModelEditor(this, "model", "instanceEditor");

            this.handleScoringOptions(this.state.modelType);
        }

        generateInstallCode() {
            let installCode = this.modelConfig[this.state.modelType].install;
            if (vpConfig.extensionType === 'lite') {
                installCode = installCode.replace('!', '%');
            }
            return [ installCode ];
        }

        checkBeforeRun() {
            // if no param is registered, stop and show alert
            if ($(this.wrapSelector('.vp-param-result-item')).length <= 0) {
                com_util.renderAlertModal('No params added. Please add params.');
                return false;
            }

            return true;
        }

        generateCode() {
            let { modelType, userOption, allocateToCreation, model } = this.state;
            let code = new com_String();
            /**
             * Model Creation
             * ---
             * from module import model_function
             * model = Model(key=value, ...)
             */
            let gsConfig = this.modelConfig['grid-search'];
            

            let state = JSON.parse(JSON.stringify(this.state));
            let estConfig = this.modelConfig[this.state.modelType];
            let estimator = com_generator.vp_codeGenerator(null, estConfig, {}, '');
            state['estimator'] = estimator;
            state['param_grid'] = '{}';

            let paramGrid = [];
            // generate param_grid
            $(this.wrapSelector('.vp-param-set-box')).each((i, tag) => {
                let paramSet = {};
                $(tag).find('.vp-param-result-box').each((j, resTag) => {
                    let paramName = $(resTag).data('name');
                    let paramValList = [];
                    $(resTag).find('.vp-param-result-item').each((k, itemTag) => {
                        let val = $(itemTag).data('value');
                        if (!isNaN(val)) {
                            // numeric string -> numeric
                            val = parseFloat(val);
                        }
                        paramValList.push(val);
                    });
                    if (paramValList.length > 0) {
                        // Add only its result exists
                        paramSet[paramName] = paramValList;
                    }
                });
                if (Object.keys(paramSet).length > 0) {
                    paramGrid.push(paramSet);
                }
            });
            
            state['param_grid'] = this.paramStringify(paramGrid);

            // import code
            code.appendLine(gsConfig.import);
            code.appendLine(estConfig.import);

            // model code
            let gsCode = gsConfig.code;
            gsCode = com_generator.vp_codeGenerator(this, gsConfig, state, (userOption != ''? ', ' + userOption : ''));
            code.appendLine();
            code.appendFormat('{0} = {1}', allocateToCreation, gsCode);                

            return code.toString();
        }

        paramStringify(paramGridList=[]) {
            let paramGridCode = new com_String();
            if (paramGridList.length > 1) {
                paramGridCode.append('[');
            }
            paramGridList.forEach((paramSet, i) => {
                if (i > 0) {
                    paramGridCode.append(', \n    ');
                }
                paramGridCode.append('{');
                Object.keys(paramSet).forEach((paramName, j) => {
                    if (j > 0) {
                        paramGridCode.append(', ');
                    }
                    paramGridCode.appendFormat("'{0}': [{1}]", paramName, paramSet[paramName].toString());
                });
                paramGridCode.append('}');
            })

            if (paramGridList.length > 1) {
                paramGridCode.append(']');
            }
            return paramGridCode.toString();
        }

    }

    return GridSearch;
});