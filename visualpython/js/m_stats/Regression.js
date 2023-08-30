/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Regression.js
 *    Author          : Black Logic
 *    Note            : Equal Variance test
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 05. 09
 *    Change Date     :
 */

//============================================================================
// [CLASS] EqualVarTest
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_stats/regression.html'),
    __VP_CSS_LOADER__('vp_base/css/m_stats/regression'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/com/component/MultiSelector',
    'vp_base/js/m_apps/Subset'
], function(eqHTML, rgCss, com_util, com_Const, com_String, com_generator, PopupComponent, DataSelector, MultiSelector, Subset) {

    /**
     * Regression
     */
    class Regression extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];
            this.config.docs = 'https://www.statsmodels.org/stable/api.html';

            this.state = {
                testType: 'simple',
                // Data selection
                data: '',
                dataType: '',
                dependent: '',
                independent: '',
                independentMulti: [],
                moderated: '',
                mediated: '',
                // options
                categorical: [],
                method: 'enter',
                meanCentering: true,
                sobelTest: true,
                // Multi-collinearity
                multiCollinearity: true,
                // Residual option
                statistics: false,
                normTest: true,
                histogram: true,
                scatterplot: true,
                ...this.state
            };

            this.colBindList = ['dependent', 'independent', 'moderated', 'mediated'];

            this.subsetEditor = null;
            this.columnSelector = null;
        }

        _unbindEvent() {
            super._unbindEvent();
            $(document).off('change', this.wrapSelector('#dependent'));
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;

            // change test type
            $(this.wrapSelector('#testType')).on('change', function() {
                let testType = $(this).val();
                that.state.testType = testType;

                $(that.wrapSelector('.vp-st-option')).hide();
                $(that.wrapSelector('.vp-st-option.' + testType)).show();

                let excludeList = [];
                if (that.state.testType === 'multiple' 
                || that.state.testType === 'hierarchical' 
                || that.state.testType === 'dummy') {
                    let depVal = $(that.wrapSelector('#dependent')).val();
                    excludeList = [ depVal ];
                }

                // render variable selector
                that.columnSelector = new MultiSelector(that.wrapSelector('#independentBox'),
                    { 
                        mode: 'columns', parent: that.state.data, showDescription: false,
                        excludeList: excludeList,
                        change: function(type, list) {
                            that._handleMultiColumnChange(type, list);
                        } 
                    });
            });

            // data change
            $(this.wrapSelector('#data')).on('change', function() {
                let data = $(this).val();
                that.handleVariableChange(data);
            });

            // dependent change
            $(document).on('change', this.wrapSelector('#dependent'), function() {
                let depVal = $(this).val();
                if (that.state.testType === 'multiple' 
                || that.state.testType === 'hierarchical' 
                || that.state.testType === 'dummy') {
                    that.columnSelector = new MultiSelector(that.wrapSelector('#independentBox'),
                        {   
                            mode: 'columns', parent: that.state.data, showDescription: false, 
                            excludeList: [ depVal ],
                            change: function(type, list) {
                                that._handleMultiColumnChange(type, list);
                            }
                        }
                    );
                }
            });
        }

        handleVariableChange(data) {
            this.state.data = data;
            this.state.independentMulti = [];
            let that = this;
            // bind column sources
            if (this.state.dataType === 'DataFrame') {
                // DataFrame
                this.colBindList && this.colBindList.forEach(id => {
                    that.state[id] = '';
                    $(that.wrapSelector('#' + id)).prop('disabled', false);
                });
                com_generator.vp_bindColumnSource(this, 'data', this.colBindList, 'select', false, false);
            } else {
                // Others
                this.colBindList && this.colBindList.forEach(id => {
                    that.state[id] = '';
                    $(that.wrapSelector('#' + id)).html('');
                    $(that.wrapSelector('#' + id)).prop('disabled', true);
                });
            }
            // render variable selector
            this.columnSelector = new MultiSelector(this.wrapSelector('#independentBox'),
                {   
                    mode: 'columns', parent: data, showDescription: false, 
                    change: function(type, list) {
                        that._handleMultiColumnChange(type, list);
                    }
                }
            );
        }

        _handleMultiColumnChange(type, list) {
            let $newCateBox = $('<div class="vp-categorical-box"></div>');
            let that = this;
            list && list.forEach(item => {
                let checkedStr = 'checked';
                if ($(that.wrapSelector('.vp-categorical-box input[data-name="' + item.name + '"]')).length > 0) {
                    $(that.wrapSelector('.vp-categorical-box input[data-name="' + item.name + '"]')).prop('checked')?'checked':'';
                }
                $newCateBox.append(`<label>
                    <input type="checkbox" data-name="${item.name}" data-code="${item.code}" class="vp-state" ${checkedStr}><span>${item.name}</span>
                </label>`);
            });
            $(this.wrapSelector('.vp-categorical-box')).replaceWith($newCateBox);
        }

        templateForBody() {
            let page = $(eqHTML);
            let that = this;

            let dataSelector = new DataSelector({
                pageThis: this, id: 'data', placeholder: 'Select data', required: true, boxClasses: 'vp-flex-gap5',
                allowDataType: ['DataFrame'], withPopup: false,
                finish: function(data, type) {
                    that.state.data = data;
                    that.state.dataType = type;
                    $(that.wrapSelector('#data')).trigger('change');
                },
                select: function(data, type) {
                    that.state.data = data;
                    that.state.dataType = type;
                    $(that.wrapSelector('#data')).trigger('change');
                }
            });
            $(page).find('#data').replaceWith(dataSelector.toTagString());

            // depend on test type
            $(page).find('.vp-st-option').hide();
            $(page).find('.vp-st-option.' + this.state.testType).show();

            return page;
        }

        render() {
            super.render();
            let that = this;

            // render Subset
            this.subsetEditor = new Subset({ 
                pandasObject: this.state.data,
                config: { name: 'Subset', category: this.name } }, 
                {
                    useAsModule: true,
                    useInputColumns: true,
                    targetSelector: this.wrapSelector('#data'),
                    pageThis: this,
                    finish: function(code, state) {
                        that.state.data = code;
                        $(that.wrapSelector('#data')).val(code);
                        that.state.dataType = state.returnType;
                        $(that.wrapSelector('#data')).trigger('change');
                    }
                });

            let excludeList = [];
            if (this.state.testType === 'multiple' 
                || this.state.testType === 'hierarchical' 
                || this.state.testType === 'dummy') {
                if (this.state.dependent !== '') {
                    excludeList = [ this.state.dependent ];
                }
            }

            // render variable selector
            this.columnSelector = new MultiSelector(this.wrapSelector('#indenpendentBox'),
                { 
                    mode: 'columns', parent: this.state.data, 
                    selectedList: this.state.independentMulti.map(x=>x.code), excludeList: excludeList, showDescription: false 
                }
            );
            
            // bind column if data exist
            if (this.state.data !== '') {
                com_generator.vp_bindColumnSource(this, 'data', this.colBindList, 'select', false, false);
            }

            // control display option
            $(this.wrapSelector('.vp-st-option')).hide();
            $(this.wrapSelector('.vp-st-option.' + this.state.testType)).show();
        }

        generateCode() {
            let { testType,
                // Data selection
                data, dataType, dependent, independent, independentMulti, moderated, mediated,
                // options
                method, meanCentering, sobelTest,
                // Multi-collinearity
                multiCollinearity,
                // Residual option
                statistics, normTest, histogram, scatterplot
            } = this.state;
            let codeList = [];
            let code = new com_String();
            let that = this;
            let lastModelNum = 0;

            // Commentary
            let testTypeLabel = $(this.wrapSelector('#testType option:selected')).text();
            let methodLabel = $(this.wrapSelector('#method option:selected')).text();
            if (testType === 'multiple') {
                code.appendFormatLine("# {0} > Method: {1}", testTypeLabel, methodLabel);
            } else {
                code.appendFormatLine("# {0}", testTypeLabel);
            }

            // data declaration
            code.appendFormatLine("vp_df = {0}.dropna().copy()", data);
            
            // data and columns
            let dependentValue = $(this.wrapSelector('#dependent option:selected')).text();
            let independentValue = $(this.wrapSelector('#independent option:selected')).text();
            let moderatedValue = $(this.wrapSelector('#moderated option:selected')).text();
            let mediatedValue = $(this.wrapSelector('#mediated option:selected')).text();
            independentMulti = this.columnSelector.getDataList();
            this.state.independentMulti = independentMulti;

            switch (testType) {
                case 'simple':
                    // 1. Simple
                    code.appendLine();
                    code.appendLine("# Simple linear regression");
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("import statsmodels.formula.api as smf");
                    code.appendLine("# Model - Dependent variable ~ Independent variable");
                    code.appendFormatLine("_model  = smf.ols('{0} ~ {1}', vp_df)", dependentValue, independentValue);
                    code.appendLine("_result = _model.fit()");
                    code.appendLine("display(Markdown('### Model - Dependent variable ~ Independent variable'))");
                    code.append("print(_result.summary())");
                    // Multi-collinearity statistics
                    if (multiCollinearity === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Multi-collinearity statistics");
                        code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                        code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                        code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                        code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                        code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                        code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                        code.append("display(_dfr)");
                    }
                    break;
                case 'multiple':
                    // 2. Multiple
                    code.appendLine();
                    if (method === 'enter') {
                        code.appendLine("# Model - Dependent variable ~ Independent variable");
                        code.appendLine("from IPython.display import display, Markdown");
                        code.appendLine("import statsmodels.formula.api as smf");
                        code.appendFormatLine("_model  = smf.ols('{0} ~ {1}', vp_df)", dependentValue, independentMulti.map(x => x.name).join(' + '));
                        code.appendLine("_result = _model.fit()");
                        code.appendLine("display(Markdown('### Model - Dependent variable ~ Independent variable'))");
                        code.append("print(_result.summary())");
                    } else if (method === 'stepwise') {
                        // Inner function : vp_stepwise_select
                        this.addCheckModules('sm');
                        this.addCheckModules('vp_stepwise_select');

                        code.appendFormatLine("_selected_stepwise = vp_stepwise_select(vp_df[[{0}]], vp_df[{1}])", independentMulti.map(x => x.code).join(','), dependent);
                        code.appendLine("");
                        code.appendLine("# Model 1 - Dependent variable ~ Independent variable");
                        code.appendLine("from IPython.display import display, Markdown");
                        code.appendLine("import statsmodels.api as sm");
                        code.appendFormatLine("_model  = sm.OLS(vp_df[{0}], sm.add_constant(vp_df[_selected_stepwise[0]]))", dependent);
                        code.appendLine("_result = _model.fit()");
                        code.appendLine("display(Markdown('### Model 1 - Dependent variable ~ Independent variable'))");
                        code.append("print(_result.summary())");
                        if (multiCollinearity === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendLine("# Model 1 - Multi-collinearity statistics");
                            code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                            code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                            code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                            code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                            code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                            code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                            code.append("display(_dfr)");
                        }
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Model 2 - Dependent variable ~ Stepwised variable");
                        code.appendLine("import statsmodels.api as sm");
                        code.appendFormatLine("_model  = sm.OLS(vp_df[{0}], sm.add_constant(vp_df[_selected_stepwise]))", dependent);
                        code.appendLine("_result = _model.fit()");
                        code.appendLine("display(Markdown('### Model 2 - Dependent variable ~ Stepwised variable'))");
                        code.append("print(_result.summary())");
                        if (multiCollinearity === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendLine("# Model 2 - Multi-collinearity statistics");
                            code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                            code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                            code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                            code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                            code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                            code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                            code.append("display(_dfr)");
                        }
                        // set last model number
                        lastModelNum = 2;
                    } else if (method === 'backward') {
                        // Inner function : vp_backward_select
                        this.addCheckModules('sm');
                        this.addCheckModules('vp_backward_select');

                        code.appendFormatLine("_selected_backward = vp_backward_select(vp_df[[{0}]], vp_df[{1}])", independentMulti.map(x => x.code).join(','), dependent);
                        code.appendLine();
                        code.appendLine("# Model 1 - Dependent variable ~ Independent variable");
                        code.appendLine("from IPython.display import display, Markdown");
                        code.appendLine("import statsmodels.api as sm");
                        code.appendFormatLine("_model  = sm.OLS(vp_df[{0}], sm.add_constant(vp_df[[{1}]]))", dependent, independentMulti.map(x => x.code).join(','));
                        code.appendLine("_result = _model.fit()");
                        code.appendLine("display(Markdown('### Model 1 - Dependent variable ~ Independent variable'))");
                        code.append("print(_result.summary())");
                        if (multiCollinearity === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendLine("# Model 1 - Multi-collinearity statistics");
                            code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                            code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                            code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                            code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                            code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                            code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                            code.append("display(_dfr)");
                        }
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Model 2 - Dependent variable ~ Backward variable");
                        code.appendLine("import statsmodels.api as sm");
                        code.appendFormatLine("_model  = sm.OLS(vp_df[{0}], sm.add_constant(vp_df[_selected_backward]))", dependent);
                        code.appendLine("_result = _model.fit()");
                        code.appendLine("display(Markdown('### Model 2 - Dependent variable ~ Backward variable'))");
                        code.append("print(_result.summary())");
                        if (multiCollinearity === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendLine("# Model 2 - Multi-collinearity statistics");
                            code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                            code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                            code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                            code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                            code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                            code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                            code.append("display(_dfr)");
                        }
                        // set last model number
                        lastModelNum = 2;
                    } else if (method === 'forward') {
                        // Inner function : vp_forward_select
                        this.addCheckModules('sm');
                        this.addCheckModules('vp_forward_select');

                        code.appendFormatLine("_selected_forward = vp_forward_select(vp_df[[{0}]], vp_df[{1}])", independentMulti.map(x => x.code).join(','), dependent);
                        code.appendLine();
                        code.appendLine("# Model 1 - Dependent variable ~ Independent variable");
                        code.appendLine("from IPython.display import display, Markdown");
                        code.appendLine("import statsmodels.api as sm");
                        code.appendFormatLine("_model  = sm.OLS(vp_df[{0}], sm.add_constant(vp_df[_selected_forward[0]]))", dependent);
                        code.appendLine("_result = _model.fit()");
                        code.appendLine("display(Markdown('### Model 1 - Dependent variable ~ Independent variable'))");
                        code.append("print(_result.summary())");
                        if (multiCollinearity === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendLine("# Model 1 - Multi-collinearity statistics");
                            code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                            code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                            code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                            code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                            code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                            code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                            code.append("display(_dfr)");
                        }
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Model 2 - Dependent variable ~ Forward variable");
                        code.appendLine("import statsmodels.api as sm");
                        code.appendFormatLine("_model  = sm.OLS(vp_df[{0}], sm.add_constant(vp_df[_selected_forward]))", dependent);
                        code.appendLine("_result = _model.fit()");
                        code.appendLine("display(Markdown('### Model 2 - Dependent variable ~ Forward variable'))");
                        code.append("print(_result.summary())");
                        if (multiCollinearity === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendLine("# Model 2 - Multi-collinearity statistics");
                            code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                            code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                            code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                            code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                            code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                            code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                            code.append("display(_dfr)");
                        }
                        // set last model number
                        lastModelNum = 2;
                    }
                    break;
                case 'hierarchical':
                    // 3. Hierarchical
                    for (let i = 0; i < independentMulti.length; i++) {
                        if (i === 0) {
                            code.appendLine();
                        } else {
                            code.appendLine();
                            code.appendLine();
                        }
                        code.appendFormatLine("# Model {0} - Hierarchical linear regression", (i + 1));
                        code.appendLine("from IPython.display import display, Markdown");
                        code.appendLine("import statsmodels.formula.api as smf");
                        code.appendFormatLine("_model  = smf.ols('{0} ~ {1}', vp_df)", dependentValue, independentMulti.slice(0, i + 1).map(x => x.name).join(' + '));
                        code.appendLine("_result = _model.fit()");
                        code.appendFormatLine("display(Markdown('### Model {0} - Dependent variable ~ Independent variable'))", (i + 1));
                        code.append("print(_result.summary())");
                        if (multiCollinearity === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendFormatLine("# Model {0} - Multi-collinearity statistics", (i + 1));
                            code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                            code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                            code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                            code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                            code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                            code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                            code.append("display(_dfr)");
                        }
                    }
                    lastModelNum = independentMulti.length;
                    break;
                case 'moderated':
                    // 4. Moderated
                    // Mean centering
                    if (meanCentering === true) {
                        code.appendLine();
                        code.appendLine("# Mean Centering ");
                        independentValue = com_util.formatString("{0}_MC", independentValue);
                        moderatedValue = com_util.formatString("{0}_MC", moderatedValue);
                        code.appendFormatLine("vp_df['{0}'] = vp_df[{1}] - vp_df[{2}].mean(numeric_only=True)", independentValue, independent, independent);
                        code.appendFormatLine("vp_df['{0}'] = vp_df[{1}] - vp_df[{2}].mean(numeric_only=True)", moderatedValue, moderated, moderated);
                    }
                    // Model 1 to 3
                    code.appendLine();
                    code.appendLine("# Model 1 - Dependent variable ~ Independent variable");
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("import statsmodels.formula.api as smf");
                    code.appendFormatLine("_model  = smf.ols('{0} ~ {1}', vp_df)", dependentValue, independentValue);
                    code.appendLine("_result = _model.fit()");
                    code.appendLine("display(Markdown('### Model 1 - Dependent variable ~ Independent variable'))");
                    code.append("print(_result.summary())");
                    if (multiCollinearity === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Model 1 - Multi-collinearity statistics");
                        code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                        code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                        code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                        code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                        code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                        code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                        code.append("display(_dfr)");
                    }
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("# Model 2 - Dependent variable ~ Independent variable + Moderated variable");
                    code.appendLine("import statsmodels.formula.api as smf");
                    code.appendFormatLine("_model  = smf.ols('{0} ~ {1} + {2}', vp_df)", dependentValue, independentValue, moderatedValue);
                    code.appendLine("_result = _model.fit()");
                    code.appendLine("display(Markdown('### Model 2 - Dependent variable ~ Independent variable + Moderated variable'))");
                    code.append("print(_result.summary())");
                    if (multiCollinearity === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Model 2 - Multi-collinearity statistics");
                        code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                        code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                        code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                        code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                        code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                        code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                        code.append("display(_dfr)");
                    }
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("# Model 3 - Dependent variable ~ Independent variable + Moderated variable +Independent:Moderated");
                    code.appendLine("import statsmodels.formula.api as smf");
                    code.appendFormatLine("_model  = smf.ols('{0} ~ {1} + {2} + {3}:{4}', vp_df)", dependentValue, independentValue, moderatedValue, independentValue, moderatedValue);
                    code.appendLine("_result = _model.fit()");
                    code.appendLine("display(Markdown('### Model 3 - Dependent variable ~ Independent variable + Moderated variable +Independent:Moderated'))");
                    code.append("print(_result.summary())");
                    if (multiCollinearity === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Model 3 - Multi-collinearity statistics");
                        code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                        code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                        code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                        code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                        code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                        code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                        code.append("display(_dfr)");
                    }
                    // set last model number
                    lastModelNum = 3;
                    break;
                case 'mediated':
                    // 5. Mediated
                    if (sobelTest === true) {
                        this.addCheckModules('stats');
                        this.addCheckModules('vp_sobel');
                    }
                    code.appendLine();
                    code.appendLine("# Model 1 - Mediated variable ~ Independent variable");
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("import statsmodels.formula.api as smf");
                    code.appendFormatLine("_model  = smf.ols('{0} ~ {1}', vp_df)", mediatedValue, independentValue);
                    code.appendLine("_result = _model.fit()");
                    code.appendLine("display(Markdown('### Model 1 - Mediated variable ~ Independent variable'))");
                    code.append("print(_result.summary())");
                    if (multiCollinearity === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Model 1 - Multi-collinearity statistics");
                        code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                        code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                        code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                        code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                        code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                        code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                        code.append("display(_dfr)");
                    }
                    if (sobelTest === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Model 1 - Sobel test");
                        code.appendFormatLine("_sobel_M1   = _result.params[{0}]", independent);
                        code.appendFormat("_sobel_M1se = _result.bse[{0}]", independent);
                    }
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("# Model 2 - Dependent variable ~ Independent variable");
                    code.appendLine("import statsmodels.formula.api as smf");
                    code.appendFormatLine("_model  = smf.ols('{0} ~ {1}', vp_df)", dependentValue, independentValue);
                    code.appendLine("_result = _model.fit()");
                    code.appendLine("display(Markdown('### Model 2 - Dependent variable ~ Independent variable'))");
                    code.append("print(_result.summary())");
                    if (multiCollinearity === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Model 2 - Multi-collinearity statistics");
                        code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                        code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                        code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                        code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                        code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                        code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                        code.append("display(_dfr)");
                    }
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("# Model 3 - Dependent variable ~ Independent variable + Mediated variable");
                    code.appendLine("import statsmodels.formula.api as smf");
                    code.appendFormatLine("_model  = smf.ols('{0} ~ {1} + {2}', vp_df)", dependentValue, independentValue, mediatedValue);
                    code.appendLine("_result = _model.fit()");
                    code.appendLine("display(Markdown('### Model 3 - Dependent variable ~ Independent variable + Mediated variable'))");
                    code.append("print(_result.summary())");
                    if (multiCollinearity === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Model 3 - Multi-collinearity statistics");
                        code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                        code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                        code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                        code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                        code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                        code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                        code.append("display(_dfr)");
                    }
                    if (sobelTest === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Model 3 - Sobel test");
                        code.appendFormatLine("_sobel_M3   = _result.params[{0}]", mediated);
                        code.appendFormatLine("_sobel_M3se = _result.bse[{0}]", mediated);
                        code.appendLine();
                        code.appendLine("# Mediated linear regression: Sobel test");
                        code.appendLine("from scipy import stats");
                        code.appendLine("_res = vp_sobel(_sobel_M1, _sobel_M3, _sobel_M1se, _sobel_M3se)");
                        code.appendLine("display(Markdown('### Sobel test'))");
                        code.append("display(pd.DataFrame(data={'Sobel Z-score':_res[0],'p-value':_res[2]},index=['Sobel test']))");
                    }
                    // set last model number
                    lastModelNum = 3;
                    break;
                case 'dummy':
                    // 6. Dummy variable
                    code.appendLine();
                    code.appendLine("# Dummy variable linear regression");
                    code.appendLine("import statsmodels.formula.api as smf");
                    code.appendFormatLine("_model  = smf.ols('{0} ~ {1}', vp_df)"
                        , dependentValue, independentMulti.map(item => {
                            let checked = $(that.wrapSelector('.vp-categorical-box input[data-name="' + item.name + '"]')).prop('checked');
                            if (checked === true) {
                                return 'C(' + item.name + ')';
                            } else {
                                return item.name;
                            }
                        }).join(' + '));
                    code.appendLine("_result = _model.fit()");
                    code.append("print(_result.summary())");
                    if (multiCollinearity === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Multi-collinearity statistics");
                        code.appendLine("from IPython.display import display");
                        code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
                        code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
                        code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                        code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                        code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                        code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
                        code.append("display(_dfr)");
                    }
                    break;
            }

            // Residual option
            if (statistics === true || normTest === true || histogram === true || scatterplot === true) {
                let residualTitle = 'Residual'
                if (lastModelNum > 0) {
                    residualTitle += ' - Model ' + lastModelNum;
                }
                code.appendLine();
                code.appendLine();
                code.appendFormatLine("# {0}", residualTitle);
                code.appendLine("from IPython.display import display, Markdown");
                code.appendLine("from scipy import stats");
                code.appendLine("import statsmodels.api as sm");
                if (testType === 'multiple' && ['stepwise', 'backward', 'forward'].includes(method)) {
                    code.appendLine("_predict =  _result.predict(sm.add_constant(vp_df[_model.exog_names[1:]]))");
                } else {
                    code.appendLine("_predict  = _result.predict(vp_df)");
                }
                
                code.appendLine("_residual = _result.resid");
                code.appendLine("vp_residual = pd.DataFrame({'predict':_predict,'residual':_residual,");
                code.appendLine("                            'predict_z':stats.zscore(_predict),'residual_z':stats.zscore(_residual)})");
                code.appendFormatLine("display(Markdown('### {0}'))", residualTitle);
                code.append("display(vp_residual)");
           
                if (statistics === true) {
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("# Residual statistics");
                    code.appendLine("display(Markdown('### Residual statistics'))");
                    code.appendLine("display(pd.DataFrame(data={'Min':vp_residual.min(),'Max':vp_residual.max(),'Mean':vp_residual.mean(numeric_only=True),");
                    code.append("                           'Std. Deviation':vp_residual.std(numeric_only=True),'N':vp_residual.count()}))");
                }
                if (normTest === true) {
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("# Resisual Normality test (Shapiro-Wilk)");
                    code.appendLine("_res = stats.shapiro(vp_residual['residual_z'])");
                    code.appendLine("display(Markdown('### Residual Normality test (Shapiro-Wilk)'))");
                    code.append("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},index=['Resisual Normality test (Shapiro-Wilk)']))");
                }
                if (histogram === true || scatterplot === true) {
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("import seaborn as sns");
                    code.appendLine("import warnings");
                    code.append("with warnings.catch_warnings():");
                    let displayNum = 1;
                    if (histogram === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("    # Residual histogram");
                        code.appendFormatLine("    plt.subplot(2,2,{0})", displayNum++);
                        code.appendLine("    warnings.simplefilter(action='ignore', category=Warning)");
                        code.appendLine("    sns.histplot(data=vp_residual, x='residual_z', kde=True)");
                        code.appendLine("    plt.title(f'Dependent variable: {_model.endog_names}')");
                        code.append("    plt.xlabel('Regression Standardized residual')");
                    }
                    if (scatterplot === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("    # Residual scatterplot");
                        code.appendFormatLine("    plt.subplot(2,2,{0})", displayNum++);
                        code.appendLine("    sns.scatterplot(data=vp_residual, x='predict_z', y='residual_z')");
                        code.appendLine("    plt.title(f'Dependent variable: {_model.endog_names}')");
                        code.appendLine("    plt.xlabel('Regression Standardized predicted value')");
                        code.append("    plt.ylabel('Regression Standardized residual')");
                    }
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("    plt.tight_layout()");
                    code.append("    plt.show()");
                }
            }

            codeList.push(code.toString());
            return codeList;
        }

    }

    return Regression;
});