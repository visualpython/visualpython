/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : NormTest.js
 *    Author          : Black Logic
 *    Note            : Normality test
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 05. 09
 *    Change Date     :
 */

//============================================================================
// [CLASS] NormTest
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_stats/normTest.html'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/m_apps/Subset'
], function(nmHTML, com_util, com_Const, com_String, com_generator, PopupComponent, DataSelector, Subset) {

    /**
     * NormTest
     */
    class NormTest extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];
            this.config.docs = 'https://docs.scipy.org/doc/scipy/reference/';

            this.state = {
                testType: 'shapiro-wilk',
                data0: '',
                alterHypo: 'two-sided',
                histogram: false,
                boxplot: false,
                qqplot: true,
                ...this.state
            };

            this.subsetEditor = {};
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;

            $(this.wrapSelector('#testType')).on('change', function() {
                let testType = $(this).val();
                that.state.testType = testType;

                $(that.wrapSelector('.vp-st-option')).hide();
                $(that.wrapSelector('.vp-st-option.' + testType)).show();
            });

            $(this.wrapSelector('#data0')).on('change', function() {
                if (that.state.data0type === 'DataFrame') {
                    // DataFrame
                    that.state.var0 = '';
                    $(that.wrapSelector('#var0')).prop('disabled', false);
                    com_generator.vp_bindColumnSource(that, 'data0', ['var0'], 'select', false, false);
                } else {
                    // Series
                    that.state.var0 = '';
                    $(that.wrapSelector('#var0')).html('');
                    $(that.wrapSelector('#var0')).prop('disabled', true);
                }
            });
        }

        templateForBody() {
            let page = $(nmHTML);
            let that = this;

            let dataSelector = new DataSelector({
                pageThis: this, id: 'data0', placeholder: 'Select data', required: true, boxClasses: 'vp-flex-gap5',
                allowDataType: ['DataFrame', 'Series'], withPopup: false,
                finish: function(data, type) {
                    that.state.data0 = data;
                    that.state.data0type = type;
                    that.state.var0 = '';
                    $(that.wrapSelector('#data0')).trigger('change');
                },
                select: function(data, type) {
                    that.state.data0 = data;
                    that.state.data0type = type;
                    that.state.var0 = '';
                    $(that.wrapSelector('#data0')).trigger('change');
                }
            });
            $(page).find('#data0').replaceWith(dataSelector.toTagString());

            return page;
        }

        render() {
            super.render();
            let that = this;

            // render Subset
            this.subsetEditor['data0'] = new Subset({ 
                pandasObject: '',
                config: { name: 'Subset', category: this.name } }, 
                {
                    useAsModule: true,
                    useInputColumns: true,
                    targetSelector: this.wrapSelector('#data0'),
                    pageThis: this,
                    finish: function(code, state) {
                        that.state.data0 = code;
                        $(that.wrapSelector('#data0')).val(code);
                        that.state.data0type = state.returnType;
                        $(that.wrapSelector('#data0')).trigger('change');
                    }
                });

            // control display option
            $(this.wrapSelector('.vp-st-option')).hide();
            $(this.wrapSelector('.vp-st-option.' + this.state.testType)).show();
        }

        generateCode() {
            let { testType, data0, data0type, var0, alterHypo, histogram, boxplot, qqplot } = this.state;
            let codeList = [];
            let code = new com_String();

            // test type label
            let testTypeLabel = $(this.wrapSelector('#testType option:selected')).text();
            code.appendFormatLine('# {0}', testTypeLabel);

            // variable declaration
            code.appendFormatLine("vp_df = {0}.dropna().copy()", data0);

            let dataVar = 'vp_df';
            if (var0 !== '') {
                dataVar += com_util.formatString("[{0}]", var0);
            }

            switch (testType) {
                case 'shapiro-wilk':
                    // 1. Shapiro-wilk test
                    code.appendLine();
                    code.appendLine("# Normality test (Shapiro-Wilk)");
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("from scipy import stats");
                    code.appendFormatLine("_res = stats.shapiro({0})", dataVar);
                    code.appendLine("display(Markdown('### Normality test (Shapiro-Wilk)'))");
                    code.append("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},index=['Normality test (Shapiro-Wilk)']))");
                    break;
                case 'anderson-darling':
                    // 1. Anderson-Darling test
                    code.appendLine();
                    code.appendLine("# Normality test (Anderson-Darling)");
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("from scipy import stats");
                    code.appendFormatLine("_res = stats.anderson({0})", dataVar);
                    code.appendLine("display(Markdown('### Normality test (Anderson-Darling)'))");
                    code.appendLine("display(pd.DataFrame(data={'Statistic':[_res.statistic],'Critical values':[_res.critical_values],");
                    code.appendLine("                           'Significance level(%)':[_res.significance_level]},");
                    code.append("                     index=['Normality test (Anderson-Darling)']))");
                    break;
                case 'kolmogorov-smirnov':
                    // 1. Kolmogorov-Smirnov test
                    code.appendLine();
                    code.appendLine("# Normality test (Kolmogorov-Smirnov)");
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("from scipy import stats");
                    code.appendFormatLine("_res = stats.kstest({0}, 'norm', alternative='{1}')", dataVar, alterHypo);
                    code.appendLine("display(Markdown('### Normality test (Kolmogorov-Smirnov)'))");
                    code.appendLine("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},");
                    code.append("                     index=['Normality test (Kolmogorov-Smirnov)']))");
                    break;
                case 'dagostino-pearson':
                    // 1. D Agostino and Pearson test
                    code.appendLine();
                    code.appendLine("# Normality test (D Agostino and Pearson)");
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("from scipy import stats");
                    code.appendFormatLine("_res = stats.normaltest({0})", dataVar);
                    code.appendLine("display(Markdown('### Normality test (D Agostino and Pearson)'))");
                    code.appendLine("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},");
                    code.append("                     index=['Normality test (D Agostino and Pearson)']))");
                    break;
                case 'jarque-bera':
                    // 1. Jarque-Bera test
                    code.appendLine();
                    code.appendLine("# Normality test (Jarque-Bera)");
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("from scipy import stats");
                    code.appendFormatLine("_res = stats.jarque_bera({0})", dataVar);
                    code.appendLine("display(Markdown('### Normality test (Jarque-Bera)'))");
                    code.appendLine("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},");
                    code.append("                     index=['Normality test (Jarque-Bera)']))");
                    break;
            }

            // Display option
            if (histogram === true || boxplot === true || qqplot === true) {
                code.appendLine();
                code.appendLine();
                code.appendLine("# Charts");
                code.appendLine("import seaborn as sns");
                code.appendLine("import warnings");
                code.appendLine("with warnings.catch_warnings():");
                code.append("    warnings.simplefilter(action='ignore', category=Warning)");
                let displayNum = 1;
                if (histogram === true) {
                    code.appendLine();
                    code.appendLine();
                    code.appendFormatLine("    plt.subplot(2,2,{0})", displayNum++);
                    code.appendFormatLine("    sns.histplot({0}, stat='density', kde=True)", dataVar);
                    code.append("    plt.title('Histogram')");
                }
                if (boxplot === true) {
                    code.appendLine();
                    code.appendLine();
                    code.appendFormatLine("    plt.subplot(2,2,{0})", displayNum++);
                    code.appendFormatLine("    sns.boxplot(y={0})", dataVar);
                    code.append("    plt.title('Boxplot')");
                }
    
                if (qqplot === true) {
                    code.appendLine();
                    code.appendLine();
                    code.appendFormatLine("    plt.subplot(2,2,{0})", displayNum);
                    code.appendFormatLine("    stats.probplot({0}, plot=plt)", dataVar);
                    code.append("    plt.title('Q-Q Plot')");
                }
                code.appendLine();
                code.appendLine();
                code.appendLine("    plt.tight_layout()");
                code.append("    plt.show()");
            }

            return code.toString();
        }

    }

    return NormTest;
});