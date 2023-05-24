/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : StudentstTest.js
 *    Author          : Black Logic
 *    Note            : Student's t-test
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 05. 09
 *    Change Date     :
 */

//============================================================================
// [CLASS] StudentstTest
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_stats/studentstTest.html'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/m_apps/Subset'
], function(stHTML, com_util, com_Const, com_String, PopupComponent, Subset) {

    /**
     * StudentstTest
     * - confidence_interval is available on upper 1.10.0 version of scipy
     */
    class StudentstTest extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];

            this.state = {
                testType: 'one-sample',
                var0: '',
                testValue: '',
                var1: '',
                var2: '',
                alterHypo: 'two-sided',
                confInt: '95',
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
            let page = $(stHTML);
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
                        // get mean value and show on test value as placeholder
                        // TODO:
                    }
                });
            this.subsetEditor['var1'] = new Subset({ 
                pandasObject: '',
                config: { name: 'Subset' } }, 
                {
                    useAsModule: true,
                    targetSelector: this.wrapSelector('#var1'),
                    pageThis: this,
                    finish: function(code) {
                        that.state.var1 = code;
                        $(that.wrapSelector('#var1')).val(code);
                    }
                });
            this.subsetEditor['var2'] = new Subset({ 
                pandasObject: '',
                config: { name: 'Subset' } }, 
                {
                    useAsModule: true,
                    targetSelector: this.wrapSelector('#var2'),
                    pageThis: this,
                    finish: function(code) {
                        that.state.var2 = code;
                        $(that.wrapSelector('#var2')).val(code);
                    }
                });

            // control display option
            $(this.wrapSelector('.vp-st-option')).hide();
            $(this.wrapSelector('.vp-st-option.' + this.state.testType)).show();
        }

        generateCode() {
            let { testType, var0, testValue, var1, var2, alterHypo, confInt } = this.state;
            let codeList = [];
            let code = new com_String();

            // 95% -> 0.95
            confInt = confInt/100;

            switch (testType) {
                case 'one-sample':
                    // variable declaration
                    codeList.push(com_util.formatString("var = {0}", var0));
                    // 1. Normality test
                    code = new com_String();
                    code.appendLine("# Normality test (Shapiro-Wilk)");
                    code.appendLine("from scipy.stats import shapiro");
                    code.appendLine();
                    code.appendLine("_res = shapiro(var)");
                    code.appendLine();
                    code.append("pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},index=['Normality test (Shapiro-Wilk)'])");
                    codeList.push(code.toString());
                    // 2. One-sample Statistics
                    code = new com_String();
                    code.appendLine("# One-sample Statistics");
                    code.appendLine("pd.DataFrame(data={'N':len(var),'Mean':np.mean(var),");
                    code.appendLine("                   'Std. Deviation':np.std(var,ddof=1),'Std. Error Mean':np.std(var,ddof=1)/np.sqrt(len(var))},");
                    code.append("             index=['One-sample Statistics'])");
                    codeList.push(code.toString());
                    // 3. One-sample t-test
                    code = new com_String();
                    code.appendLine("# One-sample t-test");
                    code.appendLine("from scipy.stats import ttest_1samp");
                    code.appendLine();
                    code.appendFormatLine("_res = ttest_1samp(var, popmean={0}, alternative='{1}')", testValue, alterHypo);
                    code.appendLine();
                    code.appendFormatLine("_lower, _upper = _res.confidence_interval(confidence_level={0})", confInt);
                    code.appendLine();
                    code.appendFormatLine("pd.DataFrame(data={'Statistic':_res.statistic,'dof':_res.df,'Alternative':'{0}',", alterHypo);
                    code.appendFormatLine("                   'p-value':_res.pvalue,'Test Value':{0},'Mean difference':np.mean(var)-{1},", testValue, testValue);
                    code.appendFormatLine("                   'Confidence interval':{0},'Lower':_lower,'Upper':_upper},", confInt);
                    code.append("             index=['One-sample t-test'])");
                    codeList.push(code.toString());
                    break;
                case 'two-sample':
                    // variable declaration
                    code = new com_String();
                    code.appendFormatLine("var1 = {0}", var1);
                    code.appendFormat("var2 = {0}", var2);
                    codeList.push(code.toString());
                    // 1. Normality test
                    code = new com_String();
                    code.appendLine("# Normality test (Shapiro-Wilk)");
                    code.appendLine("from scipy import stats");
                    code.appendLine();
                    code.appendLine("_res1 = stats.shapiro(var1)");
                    code.appendLine("_res2 = stats.shapiro(var2)");
                    code.appendLine();
                    code.appendLine("pd.DataFrame(data={'Statistic':[_res1.statistic,_res2.statistic],'p-value':[_res1.pvalue,_res2.pvalue]},");
                    code.append("             index=[['Normality test (Shapiro-Wilk)' for i in range(2)],['Variable1','Variable2']])");
                    codeList.push(code.toString());
                    // 2. Equal Variance test
                    code = new com_String();
                    code.appendLine("# Equal Variance test (Levene)");
                    code.appendLine("from scipy import stats");
                    code.appendLine();
                    code.appendLine("_res = stats.levene(var1, var2)");
                    code.appendLine();
                    code.append("pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue}, index=['Equal Variance test (Levene)'])");
                    codeList.push(code.toString());
                    // 3. Independent two-sample Statistics
                    code = new com_String();
                    code.appendLine("# Independent two-sample Statistics");
                    code.appendLine("pd.DataFrame(data={'N':[len(var1),len(var2)],'Mean':[np.mean(var1),np.mean(var2)],");
                    code.appendLine("                   'Std. Deviation':[np.std(var1,ddof=1),np.std(var2,ddof=1)],");
                    code.appendLine("                   'Std. Error mean':[np.std(var1,ddof=1)/np.sqrt(len(var1)),np.std(var2,ddof=1)/np.sqrt(len(var2))]},");
                    code.append("             index=[['Independent two-sample Statistics' for i in range(2)],['Variable1','Variable2']])");
                    codeList.push(code.toString());
                    // 4. Independent two-sample t-test
                    code = new com_String();
                    code.appendLine("# Independent two-sample t-test");
                    code.appendLine("from scipy import stats");
                    code.appendLine("");
                    code.appendFormatLine("_res1 = stats.ttest_ind(var1, var2, equal_var=True,  alternative='{0}')", alterHypo);
                    code.appendFormatLine("_res2 = stats.ttest_ind(var1, var2, equal_var=False, alternative='{0}')", alterHypo);
                    code.appendLine("");
                    code.appendLine("print('If equal_var is False, perform Welch\'s t-test, which does not assume equal population variance')");
                    code.appendFormatLine("pd.DataFrame(data={'Statistic':[_res1.statistic,_res2.statistic],'Alternative':['{0}' for i in range(2)],", alterHypo);
                    code.appendLine("                   'p-value':[_res1.pvalue,_res2.pvalue],'Mean difference':[np.mean(var1)-np.mean(var2) for i in range(2)]},");
                    code.append("             index=[['Independent two-sample t-test' for i in range(2)],['Equal variance' for i in range(2)],[True,False]])");
                    codeList.push(code.toString());
                    break;
                case 'paired-sample':
                    // variable declaration
                    code = new com_String();
                    code.appendFormatLine("var1 = {0}", var1);
                    code.appendFormat("var2 = {0}", var2);
                    codeList.push(code.toString());
                    // 1. Normality test
                    code = new com_String();
                    code.appendLine("# Normality test (Shapiro-Wilk)");
                    code.appendLine("from scipy import stats");
                    code.appendLine();
                    code.appendLine("_res = stats.shapiro(var1-var2)");
                    code.appendLine();
                    code.append("pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},index=['Normality test (Shapiro-Wilk): Paired differences'])");
                    codeList.push(code.toString());
                    // 2. Paired samples Statistics
                    code = new com_String();
                    code.appendLine("# Paired samples Statistics");
                    code.appendLine("pd.DataFrame(data={'N':[len(var1),len(var2),len(var1-var2)],'Mean':[np.mean(var1),np.mean(var2),np.mean(var1-var2)],");
                    code.appendLine("                   'Std. Deviation':[np.std(var1,ddof=1),np.std(var2,ddof=1),np.std(var1-var2,ddof=1)],");
                    code.appendLine("                   'Std. Error mean':[np.std(var1,ddof=1)/np.sqrt(len(var1)),");
                    code.appendLine("                                      np.std(var2,ddof=1)/np.sqrt(len(var2)),");
                    code.appendLine("                                      np.std(var1-var2,ddof=1)/np.sqrt(len(var1-var2))]},");
                    code.append("             index=[['Paired samples Statistics' for i in range(3)],['Variable1','Variable2','Paired differences']])");
                    codeList.push(code.toString());
                    // 3. Paired samples t-test
                    code = new com_String();
                    code.appendLine("# Paired samples t-test");
                    code.appendLine("from scipy import stats");
                    code.appendLine();
                    code.appendFormatLine("_res = stats.ttest_rel(var1, var2, alternative='{0}')", alterHypo);
                    code.appendLine();
                    code.appendFormatLine("_lower, _upper = _res.confidence_interval(confidence_level={0})", confInt);
                    code.appendLine();
                    code.appendFormatLine("pd.DataFrame(data={'Statistic':_res.statistic,'dof':_res.df,'Alternative':'{0}',", alterHypo);
                    code.appendLine("                   'p-value':_res.pvalue,'Mean difference':np.mean(var1-var2),");
                    code.appendFormatLine("                   'Confidence interval':{0},'Lower':_lower,'Upper':_upper},", confInt);
                    code.append("             index=['Paired samples t-test'])");
                    codeList.push(code.toString());
                    break;
            }
            

            return codeList;
        }

    }

    return StudentstTest;
});