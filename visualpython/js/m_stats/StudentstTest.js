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
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/m_apps/Subset'
], function(stHTML, com_util, com_Const, com_String, com_generator, PopupComponent, DataSelector, SuggestInput, Subset) {

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
            this.config.docs = 'https://docs.scipy.org/doc/scipy/reference/';

            this.state = {
                testType: 'one-sample',
                inputType: 'long-data',
                data: '',
                dataType: '',
                testVariable: '',
                testVariable1: '',
                testVariable2: '',
                groupingVariable: '',
                group1: '',
                group2: '',
                group1_istext: true,
                group2_istext: true,
                pairedVariable1: '',
                pairedVariable2: '',
                testValue: '',
                alterHypo: 'two-sided',
                confInt: '95',
                ...this.state
            };

            this.columnBindDict = {
                'one-sample': ['testVariable'], 
                'two-sample': ['testVariable', 'testVariable1', 'testVariable2', 'groupingVariable'],
                'paired-sample': ['pairedVariable1', 'pairedVariable2']
            };

            this.subsetEditor = null;
        }

        _unbindEvent() {
            super._unbindEvent();
            var that = this;

            $(document).off(this.wrapSelector('#testVariable'), 'change');
            $(document).off(this.wrapSelector('#groupingVariable'), 'change');
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;

            // change test type
            $(this.wrapSelector('#testType')).on('change', function() {
                let testType = $(this).val();
                that.state.testType = testType;

                that.handleVariableChange(that.state.data);

                $(that.wrapSelector('.vp-st-option')).hide();
                $(that.wrapSelector('.vp-st-option.' + testType)).show();
                if (testType === 'two-sample') {
                    $(that.wrapSelector('.vp-st-option.two-sample-' + that.state.inputType)).show();   
                }
            });

            // change input type
            $(this.wrapSelector('input[name="inputType"]:radio')).on('change', function() {
                let inputType = $(this).val();
                that.state.inputType = inputType;
                $(that.wrapSelector('.vp-st-option.two-sample-long-data')).hide();
                $(that.wrapSelector('.vp-st-option.two-sample-wide-data')).hide();
                $(that.wrapSelector('.vp-st-option.two-sample-' + inputType)).show();
            });

            // data change event
            $(this.wrapSelector('#data')).on('change', function() {
                let data = $(this).val();
                that.handleVariableChange(data);
            });

            // change test variable
            $(document).on('change', this.wrapSelector('#testVariable'), function() {
                if (that.state.testType === 'one-sample') {
                    // get mean of data and show on placeholder
                    $(that.wrapSelector('#testValue')).prop('placeholder', '');
                    vpKernel.execute(com_util.formatString("int({0}[{1}].mean())", that.state.data, that.state.testVariable)).then(function(resultObj) {
                        let { result } = resultObj;
                        $(that.wrapSelector('#testValue')).prop('placeholder', result);
                    });
                }
            });

            // change grouping variable
            $(document).on('change', this.wrapSelector('#groupingVariable'), function() {
                let colCode = $(this).val();
                var colName = $(this).find('option:selected').text();
                var colDtype = $(this).find('option:selected').attr('data-type');
                that.state.groupingVariable = colCode;
                // get result and load column list
                vpKernel.getColumnCategory(that.state.data, colCode).then(function(resultObj) {
                    let { result } = resultObj;
                    $(that.wrapSelector('#group1')).val('');
                    $(that.wrapSelector('#group2')).val('');
                    that.state.group1 = '';
                    that.state.group2 = '';
                    that.state.group1_istext = true;
                    that.state.group2_istext = true;
                    try {
                        var category = JSON.parse(result);
                        // if (category && category.length > 0 && colDtype == 'object') {
                        //     // if it's categorical column and its dtype is object, check 'Text' as default
                        //     category.forEach(obj => {
                        //         let selected1 = obj.value === that.state.group1;
                        //         let selected2 = obj.value === that.state.group2;
                        //         $(that.wrapSelector('#group1')).append(`<option value="${obj.value}" ${selected1?'selected':''}>${obj.label}</option>`);
                        //         $(that.wrapSelector('#group2')).append(`<option value="${obj.value}" ${selected2?'selected':''}>${obj.label}</option>`);
                        //     });
                        // }
                        var groupSuggest1 = new SuggestInput();
                        groupSuggest1.setComponentID('group1');
                        groupSuggest1.addClass('vp-input vp-state');
                        groupSuggest1.setSuggestList(function() { return category; });
                        groupSuggest1.setNormalFilter(true);
                        groupSuggest1.setPlaceholder('Select value');
                        $(that.wrapSelector('#group1')).replaceWith(groupSuggest1.toTagString());
                        var groupSuggest2 = new SuggestInput();
                        groupSuggest2.setComponentID('group2');
                        groupSuggest2.addClass('vp-input vp-state');
                        groupSuggest2.setSuggestList(function() { return category; });
                        groupSuggest2.setNormalFilter(true);
                        groupSuggest2.setPlaceholder('Select value');
                        $(that.wrapSelector('#group2')).replaceWith(groupSuggest2.toTagString());

                        if (category && category.length > 0) {
                            that.state.group1 = category[0].value;
                            that.state.group2 = category[0].value;
                        }

                        if (colDtype == 'object') {
                            // check as default
                            $(that.wrapSelector('#group1_istext')).prop('checked',  true);
                            $(that.wrapSelector('#group2_istext')).prop('checked',  true);
                            that.state.group1_istext = true;
                            that.state.group2_istext = true;
                        } else {
                            $(that.wrapSelector('#group1_istext')).prop('checked',  false);
                            $(that.wrapSelector('#group2_istext')).prop('checked',  false);
                            that.state.group1_istext = false;
                            that.state.group2_istext = false;
                        }
                    } catch {
                        $(that.wrapSelector('#group1')).val('');
                        $(that.wrapSelector('#group2')).val('');
                    }
                });
            });
        }

        handleVariableChange(data) {
            let that = this;
            this.state.data = data;
            let columnBindList = this.columnBindDict[this.state.testType];
            if (this.state.dataType === 'DataFrame') {
                // DataFrame
                columnBindList.forEach(col => {
                    $(that.wrapSelector('#' + col)).prop('disabled', false);
                });
                com_generator.vp_bindColumnSource(that, 'data', columnBindList, 'select', false, false);
            } else {
                // Series
                columnBindList.forEach(col => {
                    $(that.wrapSelector('#' + col)).html('');
                    $(that.wrapSelector('#' + col)).prop('disabled', true);
                });
            }
        }

        templateForBody() {
            let page = $(stHTML);
            let that = this;

            // generate dataselector
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
                config: { name: 'Subset' } }, 
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

            if (this.state.data !== '') {
                let columnBindList = this.columnBindDict[this.state.testType];
                com_generator.vp_bindColumnSource(this, 'data', columnBindList, 'select', false, false);
            }

            // control display option
            $(this.wrapSelector('.vp-st-option')).hide();
            $(this.wrapSelector('.vp-st-option.' + this.state.testType)).show();
            if (this.state.testType === 'two-sample') {
                $(this.wrapSelector('.vp-st-option.two-sample-' + this.state.inputType)).show();   
            }
        }

        generateCode() {
            let { 
                testType, inputType, data, 
                testVariable, testVariable1, testVariable2, groupingVariable,
                pairedVariable1, pairedVariable2,
                group1, group2, group1_istext, group2_istext,
                testValue, alterHypo, confInt 
            } = this.state;
            let codeList = [];
            let code = new com_String();

            // 95% -> 0.95
            confInt = confInt/100;

            switch (testType) {
                case 'one-sample':
                    code.appendLine("# One-sample t-test");
                    // variable declaration
                    code.appendFormatLine("vp_df = {0}.dropna().copy()", data);
                    code.appendLine("");
                    // 1. Normality test
                    code.appendLine("# Normality test (Shapiro-Wilk)");
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("from scipy import stats");
                    code.appendFormatLine("_res = stats.shapiro(vp_df[{0}])", testVariable);
                    code.appendLine("display(Markdown('### Normality test (Shapiro-Wilk)'))");
                    code.appendLine("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},index=['Normality test (Shapiro-Wilk)']))");
                    code.appendLine("");
                    // 2. One-sample Statistics
                    code.appendLine("# Statistics");
                    code.appendLine("display(Markdown('### Statistics'))");
                    code.appendFormatLine("display(pd.DataFrame(data={'N':vp_df[{0}].size,'Mean':vp_df[{1}].mean(),", testVariable, testVariable);
                    code.appendFormatLine("                           'Std. Deviation':vp_df[{0}].std(),", testVariable);
                    code.appendFormatLine("                           'Std. Error Mean':vp_df[{0}].std()/np.sqrt(vp_df[{1}].size)},", testVariable, testVariable);
                    code.appendLine("                     index=['Statistics']))");
                    code.appendLine("");
                    // 3. One-sample t-test
                    code.appendLine("# One-sample t-test");
                    code.appendFormatLine("_res = stats.ttest_1samp(vp_df[{0}], popmean={1}, alternative='{2}')", testVariable, testValue, alterHypo);
                    code.appendFormatLine("_lower, _upper = _res.confidence_interval(confidence_level={0})", confInt);
                    code.appendLine("display(Markdown('### One-sample t-test'))");
                    code.appendFormatLine("display(pd.DataFrame(data={'Statistic':_res.statistic,'dof':_res.df,'Alternative':'{0}',", alterHypo);
                    code.appendFormatLine("                           'p-value':_res.pvalue,'Test Value':{0},'Mean difference':vp_df[{1}].mean()-{2},", testValue, testVariable, testValue);
                    code.appendFormatLine("                           'Confidence interval':{0},'Lower':_lower,'Upper':_upper},", confInt);
                    code.append("                     index=['One-sample t-test']))");
                    break;
                case 'two-sample':
                    code.appendLine("# Independent two-sample t-test");
                    // variable declaration
                    if (inputType === 'long-data') {
                        code.appendFormatLine("vp_df1 = {0}[({1}[{2}] == {3})][{4}].dropna().copy()", data, data, groupingVariable, com_util.convertToStr(group1, group1_istext), testVariable);
                        code.appendFormatLine("vp_df2 = {0}[({1}[{2}] == {3})][{4}].dropna().copy()", data, data, groupingVariable, com_util.convertToStr(group2, group2_istext), testVariable);
                    } else if (inputType === 'wide-data') {
                        code.appendFormatLine("vp_df1 = {0}[{1}].dropna().copy()", data, testVariable1);
                        code.appendFormatLine("vp_df2 = {0}[{1}].dropna().copy()", data, testVariable2);
                    }
                    code.appendLine("");
                    // 1. Normality test
                    code.appendLine("# Normality test (Shapiro-Wilk)");
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("from scipy import stats");
                    code.appendLine("_res1 = stats.shapiro(vp_df1)");
                    code.appendLine("_res2 = stats.shapiro(vp_df2)");
                    code.appendLine("display(Markdown('### Normality test (Shapiro-Wilk)'))");
                    code.appendLine("display(pd.DataFrame(data={'Statistic':[_res1.statistic,_res2.statistic],'p-value':[_res1.pvalue,_res2.pvalue]},");
                    code.appendLine("                    index=[['Normality test (Shapiro-Wilk)' for i in range(2)],['Variable1','Variable2']]))");
                    code.appendLine("");
                    // 2. Equal Variance test
                    code.appendLine("# Equal Variance test (Levene)");
                    code.appendLine("display(Markdown('### Equal Variance test (Levene)'))");
                    code.appendLine("_res = stats.levene(vp_df1, vp_df2, center='mean')");
                    code.appendLine("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue}, index=['Equal Variance test (Levene)']))");
                    code.appendLine("");
                    // 3. Independent two-sample Statistics
                    code.appendLine("# Statistics");
                    code.appendLine("display(Markdown('### Statistics'))");
                    code.appendLine("display(pd.DataFrame(data={'N':[vp_df1.size,vp_df2.size],");
                    code.appendLine("                           'Mean':[vp_df1.mean(),vp_df2.mean()],");
                    code.appendLine("                           'Std. Deviation':[vp_df1.std(),vp_df2.std()],");
                    code.appendLine("                           'Std. Error mean':[vp_df1.std()/np.sqrt(vp_df1.size),");
                    code.appendLine("                                              vp_df2.std()/np.sqrt(vp_df2.size )]},");
                    code.appendLine("                     index=[['Statistics' for i in range(2)],['Variable1','Variable2']]))");
                    code.appendLine("");
                    // 4. Independent two-sample t-test
                    code.appendLine("# Independent two-sample t-test");
                    code.appendFormatLine("_res1 = stats.ttest_ind(vp_df1, vp_df2, equal_var=True,  alternative='{0}')", alterHypo);
                    code.appendFormatLine("_res2 = stats.ttest_ind(vp_df1, vp_df2, equal_var=False, alternative='{0}')", alterHypo);
                    code.appendLine("display(Markdown('### Independent two-sample t-test'))");
                    code.appendFormatLine("display(pd.DataFrame(data={'Statistic':[_res1.statistic,_res2.statistic],'Alternative':['{0}' for i in range(2)],", alterHypo);
                    code.appendLine("                           'p-value':[_res1.pvalue,_res2.pvalue],");
                    code.appendLine("                           'Mean difference':[vp_df1.mean()-vp_df2.mean() for i in range(2)]},");
                    code.appendLine("                     index=[['Independent two-sample t-test' for i in range(2)],['Equal variance' for i in range(2)],[True,False]]))");
                    code.append("display(Markdown('If equal_var is False, perform Welch\\\'s t-test, which does not assume equal population variance'))");
                    break;
                case 'paired-sample':
                    // variable declaration
                    code.appendLine("# Paired samples t-test");
                    code.appendFormatLine("vp_df = {0}.dropna().copy()", data);
                    code.appendLine("");
                    code.appendFormatLine("try: vp_df[{0}].reset_index(drop=True, inplace=True)", pairedVariable1);
                    code.appendLine("except: pass");
                    code.appendFormatLine("try: vp_df[{0}].reset_index(drop=True, inplace=True)", pairedVariable2);
                    code.appendLine("except: pass");
                    code.appendLine("");
                    // 1. Normality test
                    code.appendLine("# Normality test (Shapiro-Wilk)");
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("from scipy import stats");
                    code.appendFormatLine("_res = stats.shapiro(vp_df[{0}]-vp_df[{1}])", pairedVariable1, pairedVariable2);
                    code.appendLine("display(Markdown('### Normality test (Shapiro-Wilk)'))");
                    code.appendLine("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},");
                    code.appendLine("                     index=['Normality test (Shapiro-Wilk): Paired differences']))");
                    code.appendLine("");
                    // 2. Paired samples Statistics
                    code.appendLine("# Statistics");
                    code.appendLine("display(Markdown('### Statistics'))");
                    code.appendFormatLine("display(pd.DataFrame(data={'N':[vp_df[{0}].size,vp_df[{1}].size,vp_df[{2}].size],", pairedVariable1, pairedVariable2, pairedVariable1);
                    code.appendFormatLine("                   'Mean':[vp_df[{0}].mean(),vp_df[{1}].mean(),(vp_df[{2}]-vp_df[{3}]).mean()],", pairedVariable1, pairedVariable2, pairedVariable1, pairedVariable2);
                    code.appendFormatLine("                   'Std. Deviation':[vp_df[{0}].std(),vp_df[{1}].std(),(vp_df[{2}]-vp_df[{3}]).std()],", pairedVariable1, pairedVariable2, pairedVariable1, pairedVariable2);
                    code.appendFormatLine("                   'Std. Error mean':[vp_df[{0}].std()/np.sqrt(vp_df[{1}].size),", pairedVariable1, pairedVariable1);
                    code.appendFormatLine("                                      vp_df[{0}].std()/np.sqrt(vp_df[{1}].size),", pairedVariable2, pairedVariable2);
                    code.appendFormatLine("                                      (vp_df[{0}]-vp_df[{1}]).std()/np.sqrt(vp_df[{2}].size)]},", pairedVariable1, pairedVariable2, pairedVariable1);
                    code.appendLine("             index=[['Statistics' for i in range(3)],['Variable1','Variable2','Paired differences']]))");
                    code.appendLine("");
                    // 3. Paired samples t-test
                    code.appendLine("# Paired samples t-test");
                    code.appendFormatLine("_res = stats.ttest_rel(vp_df[{0}], vp_df[{1}], alternative='{2}')", pairedVariable1, pairedVariable2, alterHypo);
                    code.appendFormatLine("_lower, _upper = _res.confidence_interval(confidence_level={0})", confInt);
                    code.appendLine("display(Markdown('### Paired samples t-test'))");
                    code.appendFormatLine("display(pd.DataFrame(data={'Statistic':_res.statistic,'dof':_res.df,'Alternative':'{0}',", alterHypo);
                    code.appendFormatLine("                           'p-value':_res.pvalue,'Mean difference':(vp_df[{0}]-vp_df[{1}]).mean(),", pairedVariable1, pairedVariable2);
                    code.appendFormatLine("                           'Confidence interval':{0},'Lower':_lower,'Upper':_upper},", confInt);
                    code.append("                     index=['Paired samples t-test']))");
                    break;
            }
            codeList.push(code.toString());
            

            return codeList;
        }

    }

    return StudentstTest;
});