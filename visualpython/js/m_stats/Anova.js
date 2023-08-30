/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Anova.js
 *    Author          : Black Logic
 *    Note            : ANOVA
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 05. 24
 *    Change Date     :
 */

//============================================================================
// [CLASS] Anova
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_stats/anova.html'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/m_apps/Subset'
], function(nmHTML, com_util, com_Const, com_String, com_generator, PopupComponent, DataSelector, Subset) {

    /**
     * Anova
     */
    class Anova extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd', 'np', 'stats', 'vp_confidence_interval', 'vp_sem'];
            this.config.docs = 'https://docs.scipy.org/doc/scipy/reference/';

            this.state = {
                testType: 'one-way',
                data: '',
                dataType: '',
                depVar: '',
                factor: '',
                factorA: '',
                factorB: '',
                covariate: '',
                sigLevel: 0.05,
                // Post hoc analysis option
                tukeyHSD: true,
                tukey: false,
                scheffe: false,
                duncan: false,
                bonferroni: false,
                // Display option
                statistics: true,
                boxplot: true,
                equalVariance: true,
                interPlot: true,
                ...this.state
            };

            this.columnBindList = ['depVar', 'factor', 'factorA', 'factorB', 'covariate'];

            this.tmpInstallCode = []; // install codes

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

                that.tmpInstallCode = [];
                that.hideInstallButton();

                if (testType === 'one-way' || testType === 'two-way') {
                    if (that.state.tukey || that.state.scheffe || that.state.duncan) {
                        // Add installation code
                        if (vpConfig.extensionType === 'lite') {
                            that.tmpInstallCode = ["%pip install scikit-posthocs"];
                        } else {
                            that.tmpInstallCode = ["!pip install scikit-posthocs"];
                        }
                        that.showInstallButton();
                    }
                } else if (testType === 'ancova') {
                    // Add installation code : # pip install pingouin
                    if (vpConfig.extensionType === 'lite') {
                        that.tmpInstallCode = ["%pip install pingouin"];
                    } else {
                        that.tmpInstallCode = ["!pip install pingouin"];
                    }
                    that.showInstallButton();
                }
            });

            $(this.wrapSelector('#data')).on('change', function() {
                if (that.state.dataType === 'Series') {
                    // Series
                    that.columnBindList.forEach(id => {
                        $(that.wrapSelector('#' + id)).html('');
                        $(that.wrapSelector('#' + id)).prop('disabled', true);
                    });
                } else {
                    // DataFrame
                    that.columnBindList.forEach(id => {
                        $(that.wrapSelector('#' + id)).prop('disabled', false);
                    });
                    com_generator.vp_bindColumnSource(that, 'data', that.columnBindList, 'select', false, false);
                }
            });

            $(this.wrapSelector('.vp-st-posthoc-box .vp-state')).on('change', function() {
                let id = $(this)[0].id;
                let checked = $(this).prop('checked') === true;
                that.state[id] = checked;
                let { testType, tukey, scheffe, duncan } = that.state;
                if (testType === 'one-way' || testType === 'two-way') {
                    if (tukey || scheffe || duncan) {
                        // Add installation code
                        if (vpConfig.extensionType === 'lite') {
                            that.tmpInstallCode = ["%pip install scikit-posthocs"];
                        } else {
                            that.tmpInstallCode = ["!pip install scikit-posthocs"];
                        }
                        that.showInstallButton();
                    } else {
                        that.hideInstallButton();
                    }
                }
            });

            $(this.wrapSelector(''))
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
            this.subsetEditor['data'] = new Subset({ 
                pandasObject: '',
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

            // bind column if data exist
            if (this.state.data !== '') {
                com_generator.vp_bindColumnSource(this, 'data', this.columnBindList, 'select', false, false);
            }

            // control display option
            $(this.wrapSelector('.vp-st-option')).hide();
            $(this.wrapSelector('.vp-st-option.' + this.state.testType)).show();
        }

        generateInstallCode() {
            return this.tmpInstallCode;
        }

        generateCode() {
            let { 
                testType, data, depVar, factor, factorA, factorB, covariate, sigLevel,
                // Post hoc analysis option
                tukeyHSD, tukey, scheffe, duncan, bonferroni,
                // Display option
                statistics, boxplot, equalVariance, interPlot 
            } = this.state;

            // get only text without '' or ""
            let depVarText = $(this.wrapSelector('#depVar option:selected')).text();
            let factorText = $(this.wrapSelector('#factor option:selected')).text();
            let factorAText = $(this.wrapSelector('#factorA option:selected')).text();
            let factorBText = $(this.wrapSelector('#factorB option:selected')).text();
            let covariateText = $(this.wrapSelector('#covariate option:selected')).text();

            let codeList = [];
            let code = new com_String();

            // test type label
            let testTypeLabel = $(this.wrapSelector('#testType option:selected')).text();
            code.appendFormatLine("# {0}", testTypeLabel);
            code.appendFormat("vp_df = {0}.dropna().copy()", data);

            switch (testType) {
                case 'one-way':
                    // 1. One-way ANOVA
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("_df = pd.DataFrame()");
                    code.appendFormatLine("for k, v in  dict(list(vp_df.groupby({0})[{1}])).items():", factor, depVar);
                    code.appendLine("    _df_t = v.reset_index(drop=True)");
                    code.appendLine("    _df_t.name = k");
                    code.append("    _df = pd.concat([_df, _df_t], axis=1)");

                    // Display - Statistics
                    if (statistics === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Statistics");
                        code.appendLine("display(Markdown('### Statistics'))");
                        code.appendLine("display(pd.DataFrame(data={'Count':_df.count(),'Mean':_df.mean(numeric_only=True),'Std. Deviation':_df.std(numeric_only=True),'Min':_df.min(),'Max':_df.max(),");
                        code.appendLine("                           'Std. Error Mean':_df.apply(vp_sem),'Confidence interval':0.95,");
                        code.append("                           'Lower':_df.apply(vp_confidence_interval).T[0],'Upper':_df.apply(vp_confidence_interval).T[1] }))");
                    }
                    // Display - Boxplot
                    if (boxplot === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Boxplot");
                        code.appendLine("import seaborn as sns");
                        code.appendLine("import warnings");
                        code.appendLine("with warnings.catch_warnings():");
                        code.appendLine("    warnings.simplefilter(action='ignore', category=Warning)");
                        code.appendLine("    sns.boxplot(data=_df)");
                        code.append("    plt.show()");
                    }
                    // Display - Equal Variance
                    if (equalVariance === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Equal Variance test (Levene)");
                        code.appendLine("from scipy import stats");
                        code.appendLine("_lst = []");
                        code.appendLine("_df.apply(lambda x: _lst.append(x.dropna()))");
                        code.appendLine("_res = stats.levene(*_lst, center='mean')");
                        code.appendLine("display(Markdown('### Equal Variance test (Levene)'))");
                        code.append("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue}, index=['Equal Variance test (Levene)']))");
                    }

                    code.appendLine();
                    code.appendLine();
                    code.appendLine("# One-way ANOVA");
                    code.appendLine("import statsmodels.formula.api as smf");
                    code.appendLine("from statsmodels.stats.anova import anova_lm");
                    code.appendFormatLine("_model  = smf.ols('{0} ~ C({1})', vp_df)", depVarText, factorText);
                    code.appendLine("_result = _model.fit()");
                    code.appendLine("_dfr = anova_lm(_result)");
                    code.appendLine("_dfr.loc['Total','df'] = _dfr['df'].sum()");
                    code.appendLine("_dfr.loc['Total','sum_sq'] = _dfr['sum_sq'].sum()");
                    code.appendLine("display(Markdown('### One-way ANOVA'))");
                    code.append("display(_dfr)");

                    // Post hoc analysis - Tukey HSD
                    if (tukeyHSD === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Post-hoc: Tukey HSD");
                        code.appendLine("from statsmodels.sandbox.stats.multicomp import MultiComparison");
                        code.appendFormatLine("_res = MultiComparison(vp_df[{0}], vp_df[{1}]).tukeyhsd(alpha={2})", depVar, factor, sigLevel);
                        code.appendLine("display(Markdown('### Post-hoc: Tukey HSD'))");
                        code.append("display(_res.summary())");
                    }
                    // Post hoc analysis - Bonferroni
                    if (bonferroni === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Post-hoc: Bonferroni");
                        code.appendLine("from statsmodels.sandbox.stats.multicomp import MultiComparison");
                        code.appendFormatLine("_res = MultiComparison(vp_df[{0}], vp_df[{1}]).allpairtest(stats.ttest_ind,alpha={2},method='bonf')", depVar, factor, sigLevel);
                        code.appendLine("display(Markdown('### Post-hoc: Bonferroni'))");
                        code.append("display(_res[0])");
                    }

                    if (tukey === true || scheffe === true || duncan === true) {
                        // Post hoc analysis - Tukey
                        if (tukey === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendLine("# Post-hoc: Tukey");
                            code.appendLine("import scikit_posthocs as sph");
                            code.appendLine("display(Markdown('### Post-hoc: Tukey'))");
                            code.appendFormat("display(sph.posthoc_tukey(vp_df, val_col={0}, group_col={1}))", depVar, factor);
                        }
                        // Post hoc analysis - Scheffe
                        if (scheffe === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendLine("# Post-hoc: Scheffe");
                            code.appendLine("import scikit_posthocs as sph");
                            code.appendLine("display(Markdown('### Post-hoc: Scheffe'))");
                            code.appendFormat("display(sph.posthoc_scheffe(vp_df, val_col={0}, group_col={1}))", depVar, factor);
                            
                        }
                        // Post hoc analysis - duncan
                        if (duncan === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendLine("# Post-hoc: Duncan");
                            code.appendLine("import scikit_posthocs as sph");
                            code.appendLine("display(Markdown('### Post-hoc: Duncan'))");
                            code.appendFormat("display(sph.posthoc_dunn(vp_df, val_col={0}, group_col={1}))", depVar, factor);
                        }
                    }

                    break;
                case 'two-way':
                    // 1. Two-way ANOVA
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("_df = pd.DataFrame()");
                    code.appendFormatLine("for k, v in  dict(list(vp_df.groupby([{0},{1}])[{2}])).items():", factorB, factorA, depVar);
                    code.appendLine("    _df_t = v.reset_index(drop=True)");
                    code.appendLine("    _df_t.name = k");
                    code.appendLine("    _df = pd.concat([_df, _df_t], axis=1)");
                    code.append("    _df.columns = [[x[0] for x in _df.columns],[x[1] for x in _df.columns]]");

                    // Display - Statistics
                    if (statistics === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Statistics");
                        code.appendLine("display(Markdown('### Statistics'))");
                        code.appendLine("display(pd.DataFrame(data={'Count':_df.count(),'Mean':_df.mean(numeric_only=True),'Std. Deviation':_df.std(numeric_only=True),'Min':_df.min(),'Max':_df.max(),");
                        code.appendLine("                   'Std. Error Mean':_df.apply(vp_sem),'Confidence interval':0.95,");
                        code.append("                   'Lower':_df.apply(vp_confidence_interval).T[0],'Upper':_df.apply(vp_confidence_interval).T[1] }))");
                    }
                    // Display - Boxplot
                    if (boxplot === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Boxplot");
                        code.appendLine("import seaborn as sns");
                        code.appendLine("import warnings");
                        code.appendLine("with warnings.catch_warnings():");
                        code.appendLine("    warnings.simplefilter(action='ignore', category=Warning)");
                        code.appendLine("    sns.boxplot(data=_df)");
                        code.append("    plt.show()");
                    }
                    // Display - Equal Variance test
                    if (equalVariance === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Equal Variance test (Levene)");
                        code.appendLine("from scipy import stats");
                        code.appendLine("_lst = []");
                        code.appendLine("_df.apply(lambda x: _lst.append(x.dropna()))");
                        code.appendLine("_res = stats.levene(*_lst, center='mean')");
                        code.appendLine("display(Markdown('### Equal Variance test (Levene)'))");
                        code.append("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue}, index=['Equal Variance test (Levene)']))");
                    }
                    
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("# Two-way ANOVA");
                    code.appendLine("import statsmodels.formula.api as smf");
                    code.appendLine("from statsmodels.stats.anova import anova_lm");
                    code.appendFormatLine("_model  = smf.ols('{0} ~ C({1}) + C({2}) + C({3}):C({4})', vp_df)", depVarText, factorAText, factorBText, factorAText, factorBText);
                    code.appendLine("_result = _model.fit()");
                    code.appendLine("_dfr = anova_lm(_result)");
                    code.appendLine("_dfr.loc['Total','df'] = _dfr['df'].sum()");
                    code.appendLine("_dfr.loc['Total','sum_sq'] = _dfr['sum_sq'].sum()");
                    code.appendLine("display(Markdown('### Two-way ANOVA'))");
                    code.append("display(_dfr)");

                    // Display - Interaction plot
                    if (interPlot === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Interaction plot");
                        code.appendLine("from statsmodels.graphics.factorplots import interaction_plot");
                        code.appendLine("import warnings");
                        code.appendLine("with warnings.catch_warnings():");
                        code.appendLine("    warnings.simplefilter(action='ignore', category=Warning)");
                        code.appendFormatLine("    fig = interaction_plot(x=vp_df[{0}], trace=vp_df[{1}], response=vp_df[{2}])", factorA, factorB, depVar);
                        code.append("    plt.show()");
                    }
                    // Post hoc analysis - Tukey HSD
                    if (tukeyHSD === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Post-hoc: Tukey HSD");
                        code.appendLine("from statsmodels.sandbox.stats.multicomp import MultiComparison");
                        code.appendFormatLine("_res = MultiComparison(vp_df[{0}], vp_df[{1}]).tukeyhsd(alpha={2})", depVar, factorA, sigLevel);
                        code.appendLine("display(Markdown('### Post-hoc: Tukey HSD'))");
                        code.append("display(_res.summary())");
                    }
                    // Post hoc analysis - Bonferroni
                    if (bonferroni === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Post-hoc: Bonferroni");
                        code.appendLine("from statsmodels.sandbox.stats.multicomp import MultiComparison");
                        code.appendFormatLine("_res = MultiComparison(vp_df[{0}], vp_df[{1}]).allpairtest(stats.ttest_ind,alpha={2},method='bonf')", depVar, factorA, sigLevel);
                        code.appendLine("display(Markdown('### Post-hoc: Bonferroni'))");
                        code.append("display(_res[0])");
                    }
                    if (tukey === true || scheffe === true || duncan === true) {
                        // Post hoc analysis - Tukey
                        if (tukey === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendLine("# Post-hoc: Tukey");
                            code.appendLine("import scikit_posthocs as sph");
                            code.appendLine("display(Markdown('### Post-hoc: Tukey'))");
                            code.appendFormat("display(sph.posthoc_tukey(vp_df, val_col={0}, group_col={1}))", depVar, factorA);
                        }
                        // Post hoc analysis - Scheffe
                        if (scheffe === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendLine("# Post-hoc: Scheffe");
                            code.appendLine("import scikit_posthocs as sph");
                            code.appendLine("display(Markdown('### Post-hoc: Scheffe'))");
                            code.appendFormat("display(sph.posthoc_scheffe(vp_df, val_col={0}, group_col={1}))", depVar, factorA);
                        }
                        // Post hoc analysis - Duncan
                        if (duncan === true) {
                            code.appendLine();
                            code.appendLine();
                            code.appendLine("# Post-hoc: Duncan");
                            code.appendLine("import scikit_posthocs as sph");
                            code.appendLine("display(Markdown('### Post-hoc: Duncan'))");
                            code.appendFormat("display(sph.posthoc_dunn(vp_df, val_col={0}, group_col={1}))", depVar, factorA);
                        }
                    }
                    break;
                case 'ancova':
                    // 1. ANCOVA
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("from IPython.display import display, Markdown");
                    code.appendLine("_df = pd.DataFrame()");
                    code.appendFormatLine("for k, v in  dict(list(vp_df.groupby({0})[{1}])).items():", factor, depVar);
                    code.appendLine("    _df_t = v.reset_index(drop=True)");
                    code.appendLine("    _df_t.name = k");
                    code.append("    _df = pd.concat([_df, _df_t], axis=1)");

                    // Display - Statistics
                    if (statistics === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Statistics");
                        code.appendLine("display(Markdown('### Statistics'))");
                        code.appendLine("display(pd.DataFrame(data={'Count':_df.count(),'Mean':_df.mean(numeric_only=True),'Std. Deviation':_df.std(numeric_only=True),'Min':_df.min(),'Max':_df.max(),");
                        code.appendLine("                   'Std. Error Mean':_df.apply(vp_sem),'Confidence interval':0.95,");
                        code.append("                   'Lower':_df.apply(vp_confidence_interval).T[0],'Upper':_df.apply(vp_confidence_interval).T[1] }))");
                    }
                    // Display - Boxplot
                    if (boxplot === true) {
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Boxplot");
                        code.appendLine("import seaborn as sns");
                        code.appendLine("import warnings");
                        code.appendLine("with warnings.catch_warnings():");
                        code.appendLine("    warnings.simplefilter(action='ignore', category=Warning)");
                        code.appendLine("    sns.boxplot(data=_df)");
                        code.append("    plt.show()");
                    }

                    code.appendLine();
                    code.appendLine();
                    code.appendLine("# ANCOVA - Analysis of covariance");
                    code.appendLine("import pingouin as pg");
                    code.appendLine("display(Markdown('### ANCOVA - Analysis of covariance'))");
                    code.appendFormat("display(pg.ancova(data=vp_df, dv={0}, between={1}, covar={2}))", depVar, factor, covariate);
                    break;
            }
            
            codeList.push(code.toString());

            return codeList;
        }

    }

    return Anova;
});