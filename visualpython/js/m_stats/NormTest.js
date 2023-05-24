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
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/m_apps/Subset'
], function(nmHTML, com_util, com_Const, com_String, PopupComponent, Subset) {

    /**
     * NormTest
     */
    class NormTest extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];

            this.state = {
                testType: 'shapiro-wilk',
                var0: '',
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
        }

        templateForBody() {
            let page = $(nmHTML);
            let that = this;

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

        render() {
            super.render();
            let that = this;

            // render Subset
            this.subsetEditor['var0'] = new Subset({ 
                pandasObject: '',
                config: { name: 'Subset' } }, 
                {
                    useAsModule: true,
                    targetSelector: this.wrapSelector('#var0'),
                    pageThis: this,
                    allowSubsetTypes: ['iloc', 'loc'],
                    finish: function(code) {
                        that.state.var0 = code;
                        $(that.wrapSelector('#var0')).val(code);
                    }
                });

            // control display option
            $(this.wrapSelector('.vp-st-option')).hide();
            $(this.wrapSelector('.vp-st-option.' + this.state.testType)).show();
        }

        generateCode() {
            let { testType, var0, alterHypo, histogram, boxplot, qqplot } = this.state;
            let codeList = [];
            let code = new com_String();

            // variable declaration
            codeList.push(com_util.formatString("var = {0}", var0));
            switch (testType) {
                case 'shapiro-wilk':
                    // 1. Shapiro-wilk test
                    code = new com_String();
                    code.appendLine("# Normality test (Shapiro-Wilk)");
                    code.appendLine("from scipy.stats import shapiro");
                    code.appendLine();
                    code.appendLine("_res = shapiro(var)");
                    code.appendLine();
                    code.append("pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},index=['Normality test (Shapiro-Wilk)'])");
                    codeList.push(code.toString());
                    break;
                case 'anderson-darling':
                    // 1. Anderson-Darling test
                    code = new com_String();
                    code.appendLine("# Normality test (Anderson-Darling)");
                    code.appendLine("from scipy.stats import anderson");
                    code.appendLine();
                    code.appendLine("_res = anderson(var)");
                    code.appendLine();
                    code.appendLine("pd.DataFrame(data={'Statistic':[_res.statistic],'Critical values':[_res.critical_values], 'Significance level(%)':[_res.significance_level]},");
                    code.append("            index=['Normality test (Anderson-Darling)'])");
                    codeList.push(code.toString());
                    break;
                case 'kolmogorov-smirnov':
                    // 1. Kolmogorov-Smirnov test
                    code = new com_String();
                    code.appendLine("# Normality test (Kolmogorov-Smirnov)");
                    code.appendLine("from scipy import stats");
                    code.appendLine();
                    code.appendFormatLine("_res = stats.kstest(var, 'norm', alternative='{0}')", alterHypo);
                    code.appendLine();
                    code.append("pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},index=['Normality test (Kolmogorov-Smirnov)'])");
                    codeList.push(code.toString());
                    break;
                case 'dagostino-pearson':
                    // 1. D Agostino and Pearson test
                    code = new com_String();
                    code.appendLine("# Normality test (D Agostino and Pearson)");
                    code.appendLine("from scipy.stats import normaltest");
                    code.appendLine();
                    code.appendLine("_res = normaltest(var)");
                    code.appendLine();
                    code.append("pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},index=['Normality test (D Agostino and Pearson)'])");
                    codeList.push(code.toString());
                    break;
                case 'jarque-bera':
                    // 1. Jarque-Bera test
                    code = new com_String();
                    code.appendLine("# Normality test (Jarque-Bera)");
                    code.appendLine("from scipy.stats import jarque_bera");
                    code.appendLine();
                    code.appendLine("_res = jarque_bera(var)");
                    code.appendLine();
                    code.append("pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},index=['Normality test (Jarque-Bera)'])");
                    codeList.push(code.toString());
                    break;
            }

            // Display option
            if (histogram === true) {
                code = new com_String();
                code.appendLine("import seaborn as sns");
                code.appendLine();
                code.appendLine("sns.histplot(var, stat='density', kde=True)");
                code.append("plt.show()");
                codeList.push(code.toString());
            }

            if (boxplot === true) {
                code = new com_String();
                code.appendLine("import seaborn as sns");
                code.appendLine();
                code.appendLine("sns.boxplot(y=var)");
                code.append("plt.show()");
                codeList.push(code.toString());
            }

            if (qqplot === true) {
                code = new com_String();
                code.appendLine("from scipy import stats");
                code.appendLine();
                code.appendLine("import matplotlib.pyplot as plt");
                code.appendLine("%matplotlib inline");
                code.appendLine();
                code.appendLine("stats.probplot(var, plot=plt)");
                code.append("plt.show()");
                codeList.push(code.toString());
            }
            

            return codeList;
        }

    }

    return NormTest;
});