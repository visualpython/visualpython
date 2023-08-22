/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : FactorAnalysis.js
 *    Author          : Black Logic
 *    Note            : Factor Analysis
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 05. 24
 *    Change Date     :
 */

//============================================================================
// [CLASS] FactorAnalysis
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_stats/factorAnalysis.html'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/com/component/MultiSelector',
    'vp_base/js/m_apps/Subset'
], function(eqHTML, com_util, com_Const, com_String, PopupComponent, DataSelector, MultiSelector, Subset) {

    /**
     * FactorAnalysis
     */
    class FactorAnalysis extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];
            this.config.installButton = true;
            this.config.docs = 'https://factor-analyzer.readthedocs.io/en/latest/factor_analyzer.html';

            this.state = {
                data: '',
                variable: [],
                rotation: "'varimax'",
                method: 'principal',
                impute: 'drop',
                extract: 'eigenvalue',
                eigenvalue: 1,
                factor: '',
                corrMatrix: true,
                screePlot: true,
                ...this.state
            };

            this.rotationList = [
                { label: "None", value: "None" },
                { label: "varimax", value: "'varimax'" },
                { label: "promax", value: "'promax'" },
                { label: "oblimin", value: "'oblimin'" },
                { label: "oblimax", value: "'oblimax'" },
                { label: "quartimin", value: "'quartimin'" },
                { label: "quartimax", value: "'quartimax'" },
                { label: "equamax", value: "'equamax'" },
            ];
            this.methodList = [
                { label: "minres", value: "minres" },
                { label: "ml", value: "ml" },
                { label: "principal", value: "principal" },
            ];
            this.imputeList = [
                { label: "drop", value: "drop" },
                { label: "mean", value: "mean" },
                { label: "median", value: "median" },
            ]

            this.subsetEditor = null;
            this.columnSelector = null;
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;

            $(this.wrapSelector('#data')).on('change', function() {
                let data = $(this).val();
                that.handleVariableChange(data);
            });
        }

        handleVariableChange(data) {
            this.state.data = data;
            this.state.variable = [];
            // render variable selector
            this.columnSelector = new MultiSelector(this.wrapSelector('#variable'),
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

            // generate rotation options
            this.rotationList.forEach(obj => {
                let selected = obj.value === that.state.rotation;
                $(page).find('#rotation').append(`<option value="${obj.value}" ${selected?'selected':''}>${obj.label}</option>`);
            });

            // generate method options
            this.methodList.forEach(obj => {
                let selected = obj.value === that.state.method;
                $(page).find('#method').append(`<option value="${obj.value}" ${selected?'selected':''}>${obj.label}</option>`);
            });

            // generate impute options
            this.imputeList.forEach(obj => {
                let selected = obj.value === that.state.impute;
                $(page).find('#impute').append(`<option value="${obj.value}" ${selected?'selected':''}>${obj.label}</option>`);
            });

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

            // render variable selector
            this.columnSelector = new MultiSelector(this.wrapSelector('#variable'),
                        { mode: 'columns', parent: this.state.data, selectedList: this.state.variable.map(x=>x.code), showDescription: false }
                    );
        }

        generateInstallCode() {
            let installCode = '!pip install factor-analyzer';
            // Add installation code
            if (vpConfig.extensionType === 'lite') {
                installCode = '%pip install factor-analyzer';
            }
            return [ installCode ];
        }

        generateCode() {
            let { data, variable, rotation, method, impute, extract, eigenvalue, factor, corrMatrix, screePlot } = this.state;
            let codeList = [];
            let code = new com_String();

            // data declaration
            code.appendFormat("vp_df = {0}", data);
            if (this.columnSelector) {
                let columns = this.columnSelector.getDataList();
                this.state.variable = columns;
                if (columns.length > 0) {
                    code.appendFormat("[[{0}]]", columns.map(x => x.code).join(', '));
                }
            }
            code.appendLine('.dropna().copy()');

            // KMO(Kaiser-Meyer-Olkin) measure of sampling adequacy
            code.appendLine();
            code.appendLine("# KMO(Kaiser-Meyer-Olkin) measure of sampling adequacy");
            code.appendLine("from IPython.display import display, Markdown");
            code.appendLine("from factor_analyzer.factor_analyzer import calculate_kmo");
            code.appendLine("_kmo = calculate_kmo(vp_df)");
            code.appendLine("display(Markdown('### KMO measure of sampling adequacy'))");
            code.appendLine("display(pd.DataFrame(data={'Statistic ':_kmo[1]}, index=['KMO measure of sampling adequacy']))");

            // Bartlett's test of sphericity
            code.appendLine();
            code.appendLine("# Bartlett's test of sphericity");
            code.appendLine("from factor_analyzer.factor_analyzer import calculate_bartlett_sphericity");
            code.appendLine("_bartlett = calculate_bartlett_sphericity(vp_df)");
            code.appendLine("display(Markdown('### Bartlett\\'s test of sphericity'))");
            code.appendLine("display(pd.DataFrame(data={'Chi-square statistic':_bartlett[0],'p-value':_bartlett[1]}, index=['Bartlett test of sphericity']))");

            // Initial of Factor Analysis
            code.appendLine();
            code.appendLine("# Initial");
            code.appendLine("from factor_analyzer import FactorAnalyzer");
            code.appendFormatLine("_fa1 = FactorAnalyzer(n_factors=vp_df.shape[1], rotation=None, method='{0}', impute='{1}')", method, impute);
            code.appendLine("_fa1.fit(vp_df)");

            // Number of Factor
            code.appendLine();
            code.appendLine("# Number of Factor");
            if (extract === 'eigenvalue') {
                code.appendFormatLine("_nof = (_fa1.get_eigenvalues()[0] > {0}).sum()", eigenvalue);
            } else if (extract === 'factor') {
                code.appendFormatLine("_nof = {0}", factor);
            }

            // Unrotated
            code.appendLine();
            code.appendLine("# Un-rotated");
            code.appendFormatLine("_fa2 = FactorAnalyzer(n_factors=_nof, rotation=None, method='{0}', impute='{1}')", method, impute);
            code.appendLine("_fa2.fit(vp_df)");

            // Rotated
            code.appendLine();
            code.appendLine("# Rotated");
            code.appendFormatLine("_fa3 = FactorAnalyzer(n_factors=_nof, rotation={0}, method='{1}', impute='{2}')", rotation, method, impute);
            code.append("_fa3.fit(vp_df)");

            // Display option : Correlation Matrix
            if (corrMatrix === true) {
                code.appendLine();
                code.appendLine();
                code.appendLine("# Correlation matrix");
                code.appendLine("display(Markdown('### Correlation matrix'))");
                code.append("display(pd.DataFrame(data= _fa1.corr_ , index=vp_df.columns, columns=vp_df.columns).round(2))");
            }

            // Display option : Scree plot
            if (screePlot === true) {
                code.appendLine();
                code.appendLine();
                code.appendLine("# Scree plot");
                code.appendLine("import warnings");
                code.appendLine("with warnings.catch_warnings():");
                code.appendLine("    warnings.simplefilter(action='ignore', category=Warning)");
                code.appendLine("    plt.plot(_fa1.get_factor_variance()[1], 'o-')");
                code.appendLine("    plt.title('Scree Plot')");
                code.appendLine("    plt.xlabel('Factors')");
                code.appendLine("    plt.ylabel('Eigenvalue')");
                code.append("    plt.show()");
            }

            // Communalities
            code.appendLine();
            code.appendLine();
            code.appendLine("# Communalities");
            code.appendLine("display(Markdown('### Communalities'))");
            code.appendLine("display(pd.DataFrame(data={'Initial':_fa1.get_communalities(),'Extraction':_fa2.get_communalities()},index=vp_df.columns).round(3))");

            // Total variance explained
            code.appendLine();
            code.appendLine("# Total variance explained");
            code.appendLine("# Initial Eigenvalues");
            code.appendLine("_ss1 = pd.DataFrame(data=_fa1.get_factor_variance(),");
            code.appendLine("                    index=[['Initial Eigenvalues' for i in range(3)],['Total','% of variance','Cumulative %']]).T");
            code.appendLine("# Extraction sums of squared loadings");
            code.appendLine("_ss2 = pd.DataFrame(data=_fa1.get_factor_variance(),");
            code.appendLine("                    index=[['Extraction sums of squared loadings' for i in range(3)],['Total','% of variance','Cumulative %']]).T[:3]");
            code.appendLine("# Rotation sums of squared loadings");
            code.appendLine("_ss3 = pd.DataFrame(data=_fa3.get_factor_variance(),");
            code.appendLine("                    index=[['Rotation sums of squared loadings' for i in range(3)],['Total','% of variance','Cumulative %']]).T");
            code.appendLine("                    ");
            code.appendLine("display(Markdown('### Total variance explained'))");
            code.appendLine("display(pd.concat([_ss1,_ss2,_ss3], axis=1).round(3))");

            // Factor Matrix
            code.appendLine();
            code.appendLine("# Factor matrix");
            code.appendLine("display(Markdown('### Factor matrix'))");
            code.appendLine("display(pd.DataFrame(data=_fa2.loadings_,index=vp_df.columns,");
            code.appendLine("                     columns=list(range(_nof))).round(3))");

            // Rotated Factor Matrix
            code.appendLine();
            code.appendLine("# Rotated factor matrix");
            code.appendLine("display(Markdown('### Rotated factor matrix'))");
            code.appendLine("display(pd.DataFrame(data=_fa3.loadings_,index=vp_df.columns,");
            code.append("                     columns=list(range(_nof))).round(3))");

            codeList.push(code.toString());

            return codeList;
        }

    }

    return FactorAnalysis;
});