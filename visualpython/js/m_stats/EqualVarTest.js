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
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/m_apps/Subset'
], function(eqHTML, com_util, com_Const, com_String, PopupComponent, Subset) {

    /**
     * EqualVarTest
     */
    class EqualVarTest extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];

            this.state = {
                testType: 'bartlett',
                variables: {
                },
                center: 'median',
                histogram: true,
                ...this.state
            };

            this.subsetEditor = {};
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

            // add variable
            $(this.wrapSelector('#addVariable')).on('click', function() {
                that.addVariable();
            });

            // remove variable
            $(this.wrapSelector('#removeVariable')).on('click', function() {
                // remove last variable
                that.removeVariable('var' + Object.keys(that.state.variables).length);
            });
        }

        addVariable() {
            let varNameList = Object.keys(this.state.variables);
            let newNumber = varNameList.length + 1;
            let newVarId = 'var' + newNumber;
            $(this.wrapSelector('.vp-st-variable-box')).append(
                $(`<div class="vp-st-variable-item vp-grid-col-160" data-name="${newVarId}">
                        <label for="${newVarId}" class="vp-orange-text">Variable ${newNumber}</label>
                        <div class="vp-flex-gap5"><input type="text" id="${newVarId}" class="vp-input"/></div>
                    </div>`));
            this.state.variables[newVarId] = '';

            let that = this;
            // render Subset
            this.subsetEditor[newVarId] = new Subset({ 
                pandasObject: '',
                config: { name: 'Subset', category: 'Equal Var. test' } }, 
                {
                    useAsModule: true,
                    targetSelector: this.wrapSelector('#' + newVarId),
                    pageThis: this,
                    allowSubsetTypes: ['iloc', 'loc'],
                    finish: function(code) {
                        that.state.variables[newVarId] = code;
                        $(that.wrapSelector('#' + newVarId)).val(code);
                    }
                });

            $(this.wrapSelector('#' + newVarId)).on('change', function() {
                that.state.variables[newVarId] = $(this).val();
            });
        }

        removeVariable(varName) {
            delete this.state.variables[varName];
            delete this.subsetEditor[varName];

            $(this.wrapSelector(`.vp-st-variable-item[data-name="${varName}"]`)).remove();
        }

        templateForBody() {
            let page = $(eqHTML);
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

            // render variables input based on state
            $(this.wrapSelector('.vp-st-variable-box')).html('');
            // add 2 variable by default
            this.addVariable();
            this.addVariable();

            // control display option
            $(this.wrapSelector('.vp-st-option')).hide();
            $(this.wrapSelector('.vp-st-option.' + this.state.testType)).show();
        }

        generateCode() {
            let { testType, variables, center, histogram } = this.state;
            let codeList = [];
            let code = new com_String();

            // variable declaration
            let varNameList = Object.keys(variables).filter(x => x !== '');
            let varNameStr = varNameList.join(',');
            varNameList.forEach((varName, idx) => {
                if (varName !== variables[varName]) {
                    if (idx > 0) {
                        code.appendLine();
                    }
                    code.appendFormat("{0} = {1}", varName, variables[varName]);
                }
            });
            codeList.push(code.toString());

            // add variance code
            code = new com_String();
            code.appendLine("# Variance");
            code.appendLine("from scipy import stats");
            code.appendLine();
            code.appendFormat("pd.DataFrame(data={'Variance':[np.var(x, ddof=1) for x in [{0}]]})", varNameStr);
            codeList.push(code.toString());

            switch (testType) {
                case 'bartlett':
                    // 1. Bartlett test
                    code = new com_String();
                    code.appendLine("# Equal Variance test (Bartlett)");
                    code.appendLine("from scipy import stats");
                    code.appendLine();
                    code.appendFormatLine("_res = stats.bartlett({0})", varNameStr);
                    code.appendLine();
                    code.appendLine("pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},");
                    code.append("             index=['Equal Variance test (Bartlett)'])");
                    codeList.push(code.toString());
                    break;
                case 'levene':
                    // 1. Levene test
                    code = new com_String();
                    code.appendLine("# Equal Variance test (Levene)");
                    code.appendLine("from scipy import stats");
                    code.appendLine();
                    code.appendFormatLine("_res = stats.levene({0}, center='{1}')", varNameStr, center);
                    code.appendLine();
                    code.appendLine("pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},");
                    code.append("             index=['Equal Variance test (Levene)'])");
                    codeList.push(code.toString());
                    break;
                case 'fligner':
                    // 1. Fligner test
                    code = new com_String();
                    code.appendLine("# Equal Variance test (Fligner)");
                    code.appendLine("from scipy import stats");
                    code.appendLine();
                    code.appendFormatLine("_res = stats.fligner({0}, center='{1}')", varNameStr, center);
                    code.appendLine();
                    code.appendLine("pd.DataFrame(data={'Statistic':_res.statistic,'p-value':_res.pvalue},");
                    code.append("             index=['Equal Variance test (Fligner)'])");
                    codeList.push(code.toString());
                    break;
            }

            // Display option
            if (histogram === true) {
                code = new com_String();
                code.appendLine("# Histogram");
                code.appendLine("import seaborn as sns");
                code.appendLine();
                code.appendFormatLine("for x in [{0}]:", varNameStr);
                code.append("    sns.histplot(x, stat='density', kde=True)");
                codeList.push(code.toString());
            }

            return codeList;
        }

    }

    return EqualVarTest;
});