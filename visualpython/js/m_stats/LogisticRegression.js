/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : LogisticRegression.js
 *    Author          : Black Logic
 *    Note            : Correlation Analysis
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 06. 02
 *    Change Date     :
 */

//============================================================================
// [CLASS] LogisticRegression
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_stats/logisticRegression.html'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/com/component/MultiSelector',
    'vp_base/js/m_apps/Subset'
], function(eqHTML, com_util, com_Const, com_String, com_generator, PopupComponent, DataSelector, MultiSelector, Subset) {

    /**
     * LogisticRegression
     */
    class LogisticRegression extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];
            this.config.docs = 'https://www.statsmodels.org/stable/api.html';

            this.state = {
                data: '',
                dependent: '',
                encoding: true,
                independent: [],
                showOdds: true,
                multiCollinearity: true,
                ...this.state
            };

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

            // data change
            $(this.wrapSelector('#data')).on('change', function() {
                let data = $(this).val();
                that.handleVariableChange(data);
            });

            // dependent change
            $(document).on('change', this.wrapSelector('#dependent'), function() {
                let depVal = $(this).val();
                that.columnSelector = new MultiSelector(that.wrapSelector('#independent'),
                    {   
                        mode: 'columns', parent: that.state.data, showDescription: false, 
                        excludeList: [ depVal ]
                    }
                );
            });
        }

        handleVariableChange(data) {
            this.state.data = data;
            this.state.dependent = '';
            this.state.independent = [];
            // render column
            com_generator.vp_bindColumnSource(this, 'data', ['dependent'], 'select', false, false);
            // render variable selector
            this.columnSelector = new MultiSelector(this.wrapSelector('#independent'),
                { mode: 'columns', parent: data, showDescription: false }
            ); 
        }

        templateForBody() {
            let page = $(eqHTML);
            let that = this;

            // generate dataselector
            let dataSelector = new DataSelector({
                pageThis: this, id: 'data', placeholder: 'Select data', required: true, boxClasses: 'vp-flex-gap5',
                allowDataType: ['DataFrame'], withPopup: false,
                finish: function(data, type) {
                    that.state.data = data;
                    $(that.wrapSelector('#data')).trigger('change');
                },
                select: function(data, type) {
                    that.state.data = data;
                    $(that.wrapSelector('#data')).trigger('change');
                }
            });
            $(page).find('#data').replaceWith(dataSelector.toTagString());

            return page;
        }

        render() {
            super.render();
            let that = this;

            // render Subset
            this.subsetEditor = new Subset({ 
                pandasObject: '',
                config: { name: 'Subset', category: this.name } }, 
                {
                    useAsModule: true,
                    useInputColumns: true,
                    targetSelector: this.wrapSelector('#data'),
                    pageThis: this,
                    finish: function(code) {
                        $(that.wrapSelector('#data')).val(code);
                        that.handleVariableChange(code);
                    }
                });

            // bind column if data exist
            if (this.state.data !== '') {
                com_generator.vp_bindColumnSource(this, 'data', ['dependent'], 'select', false, false);
            }

            let excludeList = [];
            if (this.state.dependent !== '') {
                excludeList = [ this.state.dependent ];
            }

            // render variable selector
            this.columnSelector = new MultiSelector(this.wrapSelector('#independent'),
                        { mode: 'columns', parent: this.state.data, selectedList: this.state.independent, excludeList: excludeList, showDescription: false });
        }

        generateCode() {
            let { data, dependent, encoding, independent, showOdds, multiCollinearity } = this.state;
            let codeList = [];
            let code = new com_String();

            let dependentValue = $(this.wrapSelector('#dependent option:selected')).text();
            let independentMulti = this.columnSelector.getDataList();
            this.state.independent = independentMulti;

            // data declaration
            code.appendFormatLine("vp_df = {0}.dropna().copy()", data);
            if (encoding === true) {
                code.appendFormatLine("vp_df['{0}'+'_EL'] = pd.Categorical(vp_df[{1}]).codes", dependentValue, dependent);
                dependentValue = dependentValue + '_EL';
            }
            code.appendLine();
            code.appendLine("# Logistic regression");
            code.appendLine("from IPython.display import display");
            code.appendLine("import statsmodels.formula.api as smf");
            code.appendFormatLine("_model  = smf.logit('{0} ~ {1}', vp_df)", dependentValue, independentMulti.map(x=>x.name).join(' + '));
            code.appendLine("_result = _model.fit()");
            code.appendLine("print(_result.summary())");
            code.appendLine("");
            code.appendLine("# Multi-collinearity statistics");
            code.appendLine("from statsmodels.stats.outliers_influence import variance_inflation_factor");
            code.appendLine("_dfr = pd.DataFrame(_result.summary().tables[1].data[1:],columns=_result.summary().tables[1].data[0]).set_index('')");
            if (showOdds === true) {
                code.appendLine("_dfr['Odds'] = np.exp(_result.params)");
                code.appendLine("_dfr['Lower(Odds)'] = np.exp(_result.conf_int()[0])");
                code.appendLine("_dfr['Upper(Odds)'] = np.exp(_result.conf_int()[1])");
            }
            if (multiCollinearity === true) {
                code.appendLine("for i, col in enumerate(_model.exog_names[1:]):");
                code.appendLine("    _vif = variance_inflation_factor(_model.exog, i+1)");
                code.appendLine("    _dfr.loc[col,'Tolerance'] = 1/_vif");
                code.appendLine("    _dfr.loc[col,'VIF'] = _vif");
            }
            code.append("display(_dfr)");

            return code.toString();
        }

    }

    return LogisticRegression;
});