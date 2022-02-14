/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : evaluation.js
 *    Author          : Black Logic
 *    Note            : Evaluation
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 02. 07
 *    Change Date     :
 */

//============================================================================
// [CLASS] Evaluation
//============================================================================
define([
    'text!vp_base/html/m_ml/evaluation.html!strip',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/VarSelector2'
], function(evalHTML, com_util, com_interface, com_Const, com_String, PopupComponent, VarSelector2) {

    /**
     * Evaluation
     */
    class Evaluation extends PopupComponent {
        _init() {
            super._init();
            this.config.dataview = false;

            this.state = {
                modelType: 'clf',
                predictData: 'pred',
                targetData: 'y_test',
                // classification
                confusion_matrix: true, report: true, 
                accuracy: false, precision: false, recall: false, f1_score: false,
                // regression
                coefficient: false, intercept: false, r_squared: true, 
                mae: false, mape: false, rmse: true, scatter_plot: false,
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;

            // import library
            $(this.wrapSelector('#vp_importLibrary')).on('click', function() {
                com_interface.insertCell('code', 'from sklearn import metrics');
            });

            // model type change
            $(this.wrapSelector('#modelType')).on('change', function() {
                let modelType = $(this).val();
                that.state.modelType = modelType;

                $(page).find('.vp-eval-box').hide();
                $(page).find('.vp-eval-'+modelType).show();  
            })
        }

        templateForBody() {
            let page = $(evalHTML);

            $(page).find('.vp-eval-box').hide();
            $(page).find('.vp-eval-'+this.state.modelType).show();

            // varselector TEST:
            let varSelector = new VarSelector2(this.wrapSelector(), ['DataFrame', 'List', 'string']);
            varSelector.setComponentID('predictData');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.predictData);
            $(page).find('#predictData').replaceWith(varSelector.toTagString());

            varSelector = new VarSelector2(this.wrapSelector(), ['DataFrame', 'List', 'string']);
            varSelector.setComponentID('targetData');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.targetData);
            $(page).find('#targetData').replaceWith(varSelector.toTagString());

            return page;
        }

        generateCode() {
            let code = new com_String();
            let { 
                modelType, predictData, targetData,
                // classification
                confusion_matrix, report, accuracy, precision, recall, f1_score,
                // regression
                coefficient, intercept, r_squared, mae, mape, rmse, scatter_plot
            } = this.state;

            //====================================================================
            // Classfication
            //====================================================================
            if (modelType == 'clf') {
                if (confusion_matrix) {
                    code.appendLine("# Confusion Matrix");
                    code.appendFormatLine('pd.crosstab({0}, {1}, margins=True)', targetData, predictData);
                }
                if (report) {
                    code.appendLine("# Classification report");
                    code.appendFormatLine('print(metrics.classification_report({0}, {1}))', targetData, predictData);
                }
                if (accuracy) {
                    code.appendLine("# Accuracy");
                    code.appendFormatLine('metrics.accuracy_score({0}, {1})', targetData, predictData);
                }
                if (precision) {
                    code.appendLine("# Precision");
                    code.appendFormatLine("metrics.precision_score({0}, {1}, average='weighted')", targetData, predictData);
                }
                if (recall) {
                    code.appendLine("# Recall");
                    code.appendFormatLine("metrics.recall_score({0}, {1}, average='weighted')", targetData, predictData);
                }
                if (f1_score) {
                    code.appendLine("# F1-score");
                    code.appendFormatLine("metrics.f1_score({0}, {1}, average='weighted')", targetData, predictData);
                }
            }

            //====================================================================
            // Regression
            //====================================================================
            if (modelType == 'rgs') {
                if (coefficient) {
                    code.appendLine("# Coefficient (scikit-learn only)");
                    code.appendFormatLine('model.coef_');
                }
                if (intercept) {
                    code.appendLine("# Intercept (scikit-learn only)");
                    code.appendFormatLine('model.intercept_');
                }
                if (r_squared) {
                    code.appendLine("# R square");
                    code.appendFormatLine('metrics.r2_score({0}, {1})', targetData, predictData);
                }
                if (mae) {
                    code.appendLine("# MAE(Mean Absolute Error)");
                    code.appendFormatLine('metrics.mean_absolute_error({0}, {1})', targetData, predictData);
                }
                if (mape) {
                    code.appendLine("# MAPE(Mean Absolute Percentage Error)");
                    code.appendLine('def MAPE(y_test, y_pred):');
                    code.appendLine('   return np.mean(np.abs((y_test - pred) / y_test)) * 100');
                    code.appendLine();
                    code.appendFormatLine('MAPE({0}, {1})', targetData, predictData);
                }
                if (rmse) {
                    code.appendLine("# RMSE(Root Mean Squared Error)");
                    code.appendFormatLine('metrics.mean_squared_error({0}, {1})**0.5', targetData, predictData);
                }
                if (scatter_plot) {
                    code.appendLine('# Regression plot');
                    code.appendFormatLine('plt.scatter({0}, {1})', targetData, predictData);
                    code.appendFormatLine("plt.xlabel('{0}')", targetData);
                    code.appendFormatLine("plt.ylabel('{1}')", predictData);
                    code.appendLine('plt.show()');
                }
            }
            // FIXME: as seperated cells
            return code.toString();
        }

    }

    return Evaluation;
});