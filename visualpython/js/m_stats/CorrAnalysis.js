/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : CorrAnalysis.js
 *    Author          : Black Logic
 *    Note            : Correlation Analysis
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 05. 24
 *    Change Date     :
 */

//============================================================================
// [CLASS] CorrAnalysis
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_stats/corrAnalysis.html'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/com/component/MultiSelector',
    'vp_base/js/m_apps/Subset'
], function(eqHTML, com_util, com_Const, com_String, PopupComponent, DataSelector, MultiSelector, Subset) {

    /**
     * CorrAnalysis
     */
    class CorrAnalysis extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];
            this.config.docs = 'https://docs.scipy.org/doc/scipy/reference/';

            this.state = {
                data: '',
                variable: [],
                corrType: 'pearson',
                corrAnlaysis: true,
                corrMatrix: true,
                corrHeatmap: false,
                scatterMatrix: false,
                ...this.state
            };

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
                        { mode: 'columns', parent: this.state.data, selectedList: this.state.variable?.map(x=>x.code), showDescription: false }
                    );
        }

        generateCode() {
            let { data, variable, corrType, corrAnlaysis, corrMatrix, corrHeatmap, scatterMatrix } = this.state;
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
            code.append('.dropna().copy()');

            let corrTypeLabel = $(this.wrapSelector('#corrType option:selected')).text();

            // Display option : Correlation Analysis
            if (corrAnlaysis === true) {
                // Inner function : vp_confidence_interval_corr
                this.addCheckModules('vp_confidence_interval_corr');
                
                code.appendLine();
                code.appendLine();
                code.appendLine("# Correlation Analysis");
                code.appendLine("from scipy import stats");
                code.appendLine("from IPython.display import display, Markdown");
                code.appendLine("_dfr = pd.DataFrame()");
                code.appendLine("for i, col1 in enumerate(vp_df.columns):");
                code.appendLine("    for j, col2 in enumerate(vp_df.columns):");
                code.appendLine("        if i >= j: continue");
                code.appendLine("        if pd.api.types.is_numeric_dtype(vp_df[col1]) and pd.api.types.is_numeric_dtype(vp_df[col2]):");
                code.appendFormatLine("            _res = vp_confidence_interval_corr(vp_df[col1], vp_df[col2], method='{0}')", corrType);
                code.appendLine("            _df_t = pd.DataFrame(data={'Variable1':col1,'Variable2':col2,'N':vp_df[col1].size,'Correlation coefficient':_res[0],");
                code.appendLine("                                   'p-value':_res[1],'Lower(95%)':_res[2],'Upper(95%)':_res[3]}, index=[0])");
                code.appendLine("            _dfr = pd.concat([_dfr, _df_t]).reset_index(drop=True)");
                code.appendFormatLine("display(Markdown('### Correlation Analysis: {0}'))", corrTypeLabel.replace("'", "\\'"));
                code.append("display(_dfr)");
            }

            // Display option : Correlation Matrix
            if (corrMatrix === true) {
                code.appendLine();
                code.appendLine();
                code.appendFormatLine("# Correlation matrix: {0}", corrTypeLabel);
                code.appendLine("from IPython.display import display");
                code.appendFormat("display(vp_df.corr(method='{0}', numeric_only=True).round(2))", corrType);
            }

            if (corrHeatmap === true || scatterMatrix === true) {
                code.appendLine();
                code.appendLine();
                code.appendLine("# Chart");
                code.appendLine("import seaborn as sns");
                code.appendLine("import warnings");
                code.appendLine("with warnings.catch_warnings():");
                code.append("    warnings.simplefilter(action='ignore', category=Warning)");
                // Display option : Correlation Heatmap
                if (corrHeatmap === true) {
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("    # Heatmap");
                    code.appendFormatLine("    sns.heatmap(vp_df.corr(method='{0}', numeric_only=True), annot=True, fmt='.2f', cmap='coolwarm')", corrType);
                    code.appendFormatLine("    plt.title('Correlation heatmap: {0}')", corrTypeLabel.replace("'", "\\'"));
                    code.append("    plt.show()");
                }
                // Display option : Scatter Matrix
                if (scatterMatrix === true) {
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("    # Scatter matrix");
                    code.appendLine("    pd.plotting.scatter_matrix(vp_df)");
                    code.append("    plt.show()");
                }
            }
            codeList.push(code.toString());

            return codeList;
        }

    }

    return CorrAnalysis;
});