/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : EqualVarTest.js
 *    Author          : Black Logic
 *    Note            : Equal Variance test
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 05. 09
 *    Change Date     :
 */

//============================================================================
// [CLASS] EqualVarTest
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_stats/equalVarTest.html'),
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
     * EqualVarTest
     */
    class EqualVarTest extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];
            this.config.docs = 'https://docs.scipy.org/doc/scipy/reference/';

            this.state = {
                testType: 'bartlett',
                inputType: 'long-data',
                data: '',
                variableMulti: [],
                variable: '',
                factor: '',
                center: 'mean',
                histogram: true,
                ...this.state
            };

            this.subsetEditor = {};
            this.columnSelector = {};
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;

            // change test type
            $(this.wrapSelector('#testType')).on('change', function() {
                let testType = $(this).val();
                that.state.testType = testType;

                $(that.wrapSelector('.vp-st-option')).hide();
                $(that.wrapSelector('.vp-st-option.' + testType)).show();
            });

            // change input type
            $(this.wrapSelector('input[name="inputType"]:radio')).on('change', function() {
                let inputType = $(this).val();
                that.state.inputType = inputType;
                $(that.wrapSelector('.vp-variable-box')).hide();
                $(that.wrapSelector('.vp-variable-box.' + inputType)).show();
            });

            // data change event
            $(this.wrapSelector('#data')).on('change', function() {
                let data = $(this).val();
                that.handleVariableChange(data);
            });
        }

        handleVariableChange(data) {
            this.state.data = data;
            // render column selector
            com_generator.vp_bindColumnSource(this, 'data', ['variable', 'factor'], 'select', false, false);
            // render variable selector
            this.columnSelector = new MultiSelector(this.wrapSelector('#variableMulti'),
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

            if (this.state.data !== '') {
                // render column selector
                com_generator.vp_bindColumnSource(this, 'data', ['variable', 'factor'], 'select', false, false);
            }
            // render variable selector
            this.columnSelector = new MultiSelector(this.wrapSelector('#variableMulti'),
                        { mode: 'columns', parent: this.state.data, selectedList: this.state.variableMulti?.map(x => x.code), showDescription: false }
                    );

            $(this.wrapSelector('.vp-variable-box')).hide();
            $(this.wrapSelector('.vp-variable-box.' + this.state.inputType)).show();

            // control display option
            $(this.wrapSelector('.vp-st-option')).hide();
            $(this.wrapSelector('.vp-st-option.' + this.state.testType)).show();
        }

        generateCode() {
            let { testType, inputType, data, variable, factor, center, histogram } = this.state;
            let codeList = [];
            let code = new com_String();
            let that = this;

            // test type label
            let testTypeLabel = $(this.wrapSelector('#testType option:selected')).text();
            code.appendFormatLine("# {0}", testTypeLabel);

            if (inputType === 'long-data') {
                code.appendFormatLine("vp_df = {0}.dropna().copy()", data);
                code.appendLine("_df = pd.DataFrame()");
                code.appendFormatLine("for k, v in  dict(list(vp_df.groupby({0})[{1}])).items():", factor, variable);
                code.appendLine("    _df_t = v.reset_index(drop=True)");
                code.appendLine("    _df_t.name = k");
                code.append("    _df = pd.concat([_df, _df_t], axis=1)");
            } else if (inputType === 'wide-data') {
                // get variable multi
                let columns = this.columnSelector.getDataList();
                this.state.variableMulti = columns;
                code.appendFormatLine("vp_df = {0}[[{1}]].copy()", data, columns.map(x => x.code).join(', ')); // without dropna
                code.append("_df = vp_df.copy()");
            }

            // add variance code
            code.appendLine();
            code.appendLine();
            code.appendLine("# Variance");
            code.appendLine("from IPython.display import display, Markdown");
            code.appendLine("from scipy import stats");
            code.appendLine("_dfr = _df.var().to_frame()");
            code.appendLine("_dfr.columns = ['Variance']");
            code.append("display(_dfr)");

            switch (testType) {
                case 'bartlett':
                    // 1. Bartlett test
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("# Bartlett test");
                    code.appendLine("_lst = []");
                    code.appendLine("_df.apply(lambda x: _lst.append(x.dropna()))");
                    code.appendLine("_res = stats.bartlett(*_lst)");
                    code.appendLine("display(Markdown('### Bartlett test'))");
                    code.appendLine("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},");
                    code.append("                     index=['Equal Variance test (Bartlett)']))");
                    break;
                case 'levene':
                    // 1. Levene test
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("# Levene test");
                    code.appendLine("_lst = []");
                    code.appendLine("_df.apply(lambda x: _lst.append(x.dropna()))");
                    code.appendFormatLine("_res = stats.levene(*_lst, center='{0}')", center);
                    code.appendLine("display(Markdown('### Levene test'))");
                    code.appendLine("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},");
                    code.append("                     index=['Equal Variance test (Levene)']))");
                    break;
                case 'fligner':
                    // 1. Fligner test
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("# Fligner test");
                    code.appendLine("_lst = []");
                    code.appendLine("_df.apply(lambda x: _lst.append(x.dropna()))");
                    code.appendFormatLine("_res = stats.fligner(*_lst, center='{0}')", center);
                    code.appendLine("display(Markdown('### Fligner test'))");
                    code.appendLine("display(pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},");
                    code.append("                     index=['Equal Variance test (Fligner)']))");
                    break;
            }

            // Display option
            if (histogram === true) {
                code.appendLine();
                code.appendLine();
                code.appendLine("# Histogram");
                code.appendLine("import seaborn as sns");
                code.appendLine("import warnings");
                code.appendLine("with warnings.catch_warnings():");
                code.appendLine("    warnings.simplefilter(action='ignore', category=Warning)");
                code.appendLine("    sns.histplot(_df, stat='density', kde=True)");
                code.appendLine("    plt.title('Histogram')");
                code.append("    plt.show()");
            }
            codeList.push(code.toString());

            return codeList;
        }

    }

    return EqualVarTest;
});