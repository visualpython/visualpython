/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : ReliabAnalysis.js
 *    Author          : Black Logic
 *    Note            : Reliability Analysis
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 05. 24
 *    Change Date     :
 */

//============================================================================
// [CLASS] ReliabAnalysis
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_stats/reliabAnalysis.html'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/com/component/MultiSelector',
    'vp_base/js/m_apps/Subset'
], function(eqHTML, com_util, com_Const, com_String, PopupComponent, DataSelector, MultiSelector, Subset) {

    /**
     * ReliabAnalysis
     */
    class ReliabAnalysis extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd', 'np', 'vp_cronbach_alpha'];

            this.state = {
                data: '',
                variable: [],
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
                        { mode: 'columns', parent: this.state.data, selectedList: this.state.variable.map(x=>x.code), showDescription: false }
                    );
        }

        generateCode() {
            let { data, variable } = this.state;
            let codeList = [];
            let code = new com_String();
            let that = this;

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

            // Inner function : vp_cronbach_alpha

            // Cronbach alpha
            code.appendLine("");
            code.appendLine("# Cronbach alpha");
            code.appendLine("from IPython.display import display, Markdown");
            code.appendLine("display(Markdown('### Cronbach alpha'))");
            code.appendLine("display(pd.DataFrame({'Cronbach alpha':vp_cronbach_alpha(vp_df), 'N':vp_df.shape[1]},index=['Reliability statistics']).round(3))");
            code.appendLine("");

            // Item-total Statistics
            code.appendLine("# Item-Total Statistics");
            code.appendLine("_dfr = pd.DataFrame()");
            code.appendLine("for i, col in enumerate(vp_df.columns):");
            code.appendLine("    _sr = vp_df.drop(col,axis=1).sum(axis=1)");
            code.appendLine("    _df_t = pd.DataFrame(data={'Scale Mean if Item Deleted':_sr.mean(),'Scale Variance if Item Deleted':_sr.var(),");
            code.appendLine("                               'Corrected Item-Total Correlation':_sr.corr(vp_df[col]),");
            code.appendLine("                               'Cronbach Alpha if Item Deleted':vp_cronbach_alpha(vp_df.drop(col,axis=1))}, index=[col])");
            code.appendLine("    _dfr = pd.concat([_dfr, _df_t])");
            code.appendLine("display(Markdown('### Item-Total Statistics'))");
            code.append("display(_dfr.round(3))");
            codeList.push(code.toString());

            return codeList;
        }

    }

    return ReliabAnalysis;
});