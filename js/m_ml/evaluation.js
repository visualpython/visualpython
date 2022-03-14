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
                modelType: 'rgs',
                predictData: 'pred',
                targetData: 'y_test',
                // classification
                confusion_matrix: true, report: true, 
                accuracy: false, precision: false, recall: false, f1_score: false,
                // regression
                coefficient: false, intercept: false, r_squared: true, 
                mae: false, mape: false, rmse: true, scatter_plot: false,
                // clustering
                sizeOfClusters: true, silhouetteScore: true,
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

                $(that.wrapSelector('.vp-eval-box')).hide();
                $(that.wrapSelector('.vp-eval-'+modelType)).show();  
            })
        }

        templateForBody() {
            let page = $(evalHTML);

            $(page).find('.vp-eval-box').hide();
            $(page).find('.vp-eval-'+this.state.modelType).show();

            // varselector TEST:
            let varSelector = new VarSelector2(this.wrapSelector(), ['DataFrame', 'list', 'str']);
            varSelector.setComponentID('predictData');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.predictData);
            $(page).find('#predictData').replaceWith(varSelector.toTagString());

            varSelector = new VarSelector2(this.wrapSelector(), ['DataFrame', 'list', 'str']);
            varSelector.setComponentID('targetData');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.targetData);
            $(page).find('#targetData').replaceWith(varSelector.toTagString());

            // load state
            let that = this;
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

        generateCode() {
            let codeCells = [];
            let code = new com_String();
            let { 
                modelType, predictData, targetData,
                // classification
                confusion_matrix, report, accuracy, precision, recall, f1_score, roc_curve, auc,
                // regression
                coefficient, intercept, r_squared, mae, mape, rmse, scatter_plot,
                // clustering
                sizeOfClusters, silhouetteScore, ari, nm
            } = this.state;

            //====================================================================
            // Classfication
            //====================================================================
            if (modelType == 'clf') {
                if (confusion_matrix) {
                    code = new com_String();
                    code.appendLine("# Confusion Matrix");
                    code.appendFormat('pd.crosstab({0}, {1}, margins=True)', targetData, predictData);
                    codeCells.push(code.toString());
                }
                if (report) {
                    code = new com_String();
                    code.appendLine("# Classification report");
                    code.appendFormat('print(metrics.classification_report({0}, {1}))', targetData, predictData);
                    codeCells.push(code.toString());
                }
                if (accuracy) {
                    code = new com_String();
                    code.appendLine("# Accuracy");
                    code.appendFormat('metrics.accuracy_score({0}, {1})', targetData, predictData);
                    codeCells.push(code.toString());
                }
                if (precision) {
                    code = new com_String();
                    code.appendLine("# Precision");
                    code.appendFormat("metrics.precision_score({0}, {1}, average='weighted')", targetData, predictData);
                    codeCells.push(code.toString());
                }
                if (recall) {
                    code = new com_String();
                    code.appendLine("# Recall");
                    code.appendFormat("metrics.recall_score({0}, {1}, average='weighted')", targetData, predictData);
                    codeCells.push(code.toString());
                }
                if (f1_score) {
                    code = new com_String();
                    code.appendLine("# F1-score");
                    code.appendFormat("metrics.f1_score({0}, {1}, average='weighted')", targetData, predictData);
                    codeCells.push(code.toString());
                }
                if (roc_curve) {
                    code = new com_String();
                    code.appendLine("# ROC Curve");
                    code.appendFormatLine("fpr, tpr, thresholds = roc_curve({0}, svc.decision_function({1}}))", predictData, targetData);
                    code.appendLine("plt.plot(fpr, tpr, label='ROC Curve')");
                    code.appendLine("plt.xlabel('Sensitivity') ");
                    code.append("plt.ylabel('Specificity') ")
                    codeCells.push(code.toString());
                }
                if (auc) {
                    code = new com_String();
                    code.appendLine("# AUC");
                    code.appendFormatLine("fpr, tpr, thresholds = roc_curve({0}, svc.decision_function({1}}))", predictData, targetData);
                    code.append("metrics.auc(fpr, tpr)");
                    codeCells.push(code.toString());
                }
            }

            //====================================================================
            // Regression
            //====================================================================
            if (modelType == 'rgs') {
                // if (coefficient) {
                //     code.appendLine("# Coefficient (scikit-learn only)");
                //     code.appendFormatLine('model.coef_');
                // }
                // if (intercept) {
                //     code.appendLine("# Intercept (scikit-learn only)");
                //     code.appendFormatLine('model.intercept_');
                // }
                if (r_squared) {
                    code = new com_String();
                    code.appendLine("# R square");
                    code.appendFormat('metrics.r2_score({0}, {1})', targetData, predictData);
                    codeCells.push(code.toString());
                }
                if (mae) {
                    code = new com_String();
                    code.appendLine("# MAE(Mean Absolute Error)");
                    code.appendFormat('metrics.mean_absolute_error({0}, {1})', targetData, predictData);
                    codeCells.push(code.toString());
                }
                if (mape) {
                    code = new com_String();
                    code.appendLine("# MAPE(Mean Absolute Percentage Error)");
                    code.appendLine('def MAPE(y_test, y_pred):');
                    code.appendLine('   return np.mean(np.abs((y_test - pred) / y_test)) * 100');
                    code.appendLine();
                    code.appendFormat('MAPE({0}, {1})', targetData, predictData);
                    codeCells.push(code.toString());
                }
                if (rmse) {
                    code = new com_String();
                    code.appendLine("# RMSE(Root Mean Squared Error)");
                    code.appendFormat('metrics.mean_squared_error({0}, {1})**0.5', targetData, predictData);
                    codeCells.push(code.toString());
                }
                if (scatter_plot) {
                    code = new com_String();
                    code.appendLine('# Regression plot');
                    code.appendFormatLine('plt.scatter({0}, {1})', targetData, predictData);
                    code.appendFormatLine("plt.xlabel('{0}')", targetData);
                    code.appendFormatLine("plt.ylabel('{1}')", predictData);
                    code.append('plt.show()');
                    codeCells.push(code.toString());
                }
            }
            //====================================================================
            // Clustering
            //====================================================================
            if (modelType == 'cls') {
                // if (sizeOfClusters) {
                //     code.appendLine("# Size of clusters");
                //     code.appendFormatLine("print(f'Size of clusters: {np.bincount({0})}')", predictData);
                // }
                if (silhouetteScore) {
                    code = new com_String();
                    code.appendLine("# Silhouette score");
                    code.appendFormat("print(f'Silhouette score: {metrics.cluster.silhouette_score({0}, {1})}')", targetData, predictData);
                    codeCells.push(code.toString());
                }
                if (ari) {
                    code = new com_String();
                    code.appendLine("# ARI");
                    code.appendFormat("print(f'ARI: {metrics.cluster.adjusted_rand_score({0}, {1})}')", targetData, predictData);
                    codeCells.push(code.toString());
                }
                if (nm) {
                    code = new com_String();
                    code.appendLine("# NM");
                    code.appendFormat("print(f'NM: {metrics.cluster.normalized_mutual_info_score({0}, {1})}')", targetData, predictData);
                    codeCells.push(code.toString());
                }
            }
            // return as seperated cells
            return codeCells;
        }

    }

    return Evaluation;
});