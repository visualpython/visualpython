/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Chi2test.js
 *    Author          : Black Logic
 *    Note            : Chi-square test of independence
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 05. 24
 *    Change Date     :
 */

//============================================================================
// [CLASS] Chi2test
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_stats/chi2test.html'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/m_apps/Subset'
], function(nmHTML, com_util, com_Const, com_String, com_generator, PopupComponent, DataSelector, Subset) {

    /**
     * Chi2test
     */
    class Chi2test extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];
            this.config.docs = 'https://docs.scipy.org/doc/scipy/reference/';

            this.state = {
                data: '',
                dataType: '',
                row: '',
                column: '',
                barplot: true,
                crossTab: true,
                cramersCoef: true,
                ...this.state
            };

            this.subsetEditor = null;
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;

            $(this.wrapSelector('#data')).on('change', function() {
                let bindIdList = ['row', 'column'];
                if (that.state.dataType === 'Series') {
                    // Series
                    bindIdList.forEach(id => {
                        $(that.wrapSelector('#' + id)).html('');
                        $(that.wrapSelector('#' + id)).prop('disabled', true);
                    });
                } else {
                    // DataFrame
                    bindIdList.forEach(id => {
                        $(that.wrapSelector('#' + id)).prop('disabled', false);
                    });
                    com_generator.vp_bindColumnSource(that, 'data', bindIdList, 'select', false, false);
                }
            });
        }

        handleVariableChange(data) {
            this.state.data = data;
            let bindIdList = ['row', 'column'];
            if (that.state.dataType === 'DataFrame') {
                // DataFrame
                bindIdList.forEach(id => {
                    $(that.wrapSelector('#' + id)).html('');
                    $(that.wrapSelector('#' + id)).prop('disabled', false);
                });
                com_generator.vp_bindColumnSource(that, 'data', bindIdList, 'select', false, false);
            } else {
                // Others
                bindIdList.forEach(id => {
                    $(that.wrapSelector('#' + id)).html('');
                    $(that.wrapSelector('#' + id)).prop('disabled', true);
                });
            }
        }

        templateForBody() {
            let page = $(nmHTML);
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
                    finish: function(code, state) {
                        that.state.data = code;
                        that.state.dataType = state.returnType;
                        $(that.wrapSelector('#data')).val(code);
                        $(that.wrapSelector('#data')).trigger('change');
                    }
                });

            // bind column if data exist
            if (this.state.data !== '') {
                com_generator.vp_bindColumnSource(this, 'data', ['row', 'column'], 'select', false, false);
            }
        }

        generateCode() {
            let { data, row, column, barplot, crossTab, cramersCoef } = this.state;
            let codeList = [];
            let code = new com_String();

            code.appendFormatLine("vp_df = {0}.dropna().copy()", data);

            // Display option
            if (barplot === true) {
                code.appendLine();
                code.appendLine("# Count plot");
                code.appendLine("import seaborn as sns");
                code.appendLine("import warnings");
                code.appendLine("with warnings.catch_warnings():");
                code.appendLine("    warnings.simplefilter(action='ignore', category=Warning)");
                code.appendFormatLine("    sns.countplot(data=vp_df, x={0}, hue={1})", row, column);
                code.appendLine("    plt.show()");
            }
            
            code.appendLine("");
            code.appendLine("# Chi-square test of independence");
            code.appendLine("from IPython.display import display, Markdown");
            code.appendLine("from scipy import stats");
            code.appendFormatLine("_obs  = pd.crosstab(index=vp_df[{0}], columns=vp_df[{1}])", row, column);
            code.appendLine("_res1 = stats.chi2_contingency(_obs)");
            code.appendLine("_res2 = stats.chi2_contingency(_obs, lambda_='log-likelihood')");
            
            if (crossTab === true) {
                code.appendLine("");
                code.appendLine("# Cross tabulation: Count");
                code.appendFormatLine("_dfc = pd.crosstab(index=vp_df[{0}],columns=vp_df[{1}],margins=True,margins_name='Total')", row, column);
                code.appendLine("_dfc = _dfc.reset_index().reset_index()");
                code.appendLine("_dfc[' '] = 'Count'");
                code.appendLine("");
                code.appendLine("# Cross tabulation: Expected count");
                code.appendLine("_dfe = pd.DataFrame(_res1.expected_freq, index=_obs.index, columns=_obs.columns).round(1)");
                code.appendLine("_dfe.loc['Total',:] = _dfe.sum(axis=0)");
                code.appendLine("_dfe.loc[:,'Total'] = _dfe.sum(axis=1)");
                code.appendLine("_dfe = _dfe.reset_index().reset_index()");
                code.appendLine("_dfe[' '] = 'Expected count'");
                code.appendLine("");
                code.appendLine("# Cross tabulation: Count + Expected count");
                code.appendLine("display(Markdown('### Cross tabulation'))");
                code.appendFormatLine("display(pd.concat([_dfc, _dfe]).set_index([{0},' ']).sort_values('index').drop('index',axis=1))", row);
            }

            code.appendLine("");
            code.appendLine("# Chi-square test");
            code.appendLine("display(Markdown('### Chi-square test'))");
            code.appendLine("display(pd.DataFrame(data = {'Value':[_res1.statistic,_res2.statistic,vp_df.dropna().shape[0]],");
            code.appendLine("                             'df':[_res1.dof,_res2.dof,np.nan],");
            code.appendLine("                             'p-value(two-sided)':[_res1.pvalue,_res2.pvalue,np.nan]},");
            code.append("                     index= ['Pearson Chi-square','Likelihood ratio','N of valid cases']))");

            if (cramersCoef === true) {
                code.appendLine("");
                code.appendLine("");
                code.appendLine("# Cramers' V coefficient");
                code.appendLine("_X2 = stats.chi2_contingency(_obs)[0]");
                code.appendLine("_sum = _obs.sum().sum()");
                code.appendLine("_minDim = min(_obs.shape)-1");
                code.appendLine("display(Markdown('### Cramers V coefficient'))");
                code.append("display(pd.DataFrame(data={'Value':np.sqrt((_X2/_sum) / _minDim)}, index=['Cramers V coefficient']))");
            }
            codeList.push(code.toString());

            return codeList;
        }

    }

    return Chi2test;
});