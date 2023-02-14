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
    __VP_TEXT_LOADER__('vp_base/html/m_ml/evaluation.html'), // INTEGRATION: unified version of text loader
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector'
], function(evalHTML, com_util, com_interface, com_Const, com_String, PopupComponent, DataSelector) {

    /**
     * Evaluation
     */
    class Evaluation extends PopupComponent {
        _init() {
            super._init();
            this.config.importButton = true;
            this.config.dataview = false;
            this.config.checkModules = ['metrics'];

            this.state = {
                modelType: 'rgs',
                predictData: 'pred',
                targetData: 'y_test',
                // regression
                r_squared: true, mae: true, mape: false, rmse: true, scatter_plot: false,
                // classification
                confusion_matrix: true, report: true, 
                accuracy: false, precision: false, recall: false, f1_score: false,
                // clustering
                clusteredIndex: 'clusters',
                silhouetteScore: true, ari: false, nmi: false,
                featureData2: 'X',
                targetData2: 'y',
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;

            // import library
            $(this.wrapSelector('#vp_importLibrary')).on('click', function() {
                com_interface.insertCell('code', 'from sklearn import metrics', true, 'Machine Learning > Evaluation');
            });

            // model type change
            $(this.wrapSelector('#modelType')).on('change', function() {
                let modelType = $(this).val();
                that.state.modelType = modelType;

                $(that.wrapSelector('.vp-upper-box')).hide();
                $(that.wrapSelector('.vp-upper-box.' + modelType)).show();

                $(that.wrapSelector('.vp-eval-box')).hide();
                $(that.wrapSelector('.vp-eval-'+modelType)).show();  

                if (modelType == 'rgs') {
                    // Regression

                } else if (modelType == 'clf') {
                    // Classification - model selection
                    // if (that.checkToShowSelector('roc-auc') == true) {
                    //     $(that.wrapSelector('.vp-ev-model.roc-auc')).prop('disabled', false);
                    // } else {
                    //     $(that.wrapSelector('.vp-ev-model.roc-auc')).prop('disabled', true);
                    // }
                } else {
                    // Clustering
                    if (that.checkToShowSelector('silhouette') == true) {
                        $(that.wrapSelector('.vp-ev-model.silhouette')).prop('disabled', false);
                    } else {
                        $(that.wrapSelector('.vp-ev-model.silhouette')).prop('disabled', true);
                    }
                    if (that.checkToShowSelector('ari-nmi') == true) {
                        $(that.wrapSelector('.vp-ev-model.ari-nmi')).prop('disabled', false);
                    } else {
                        $(that.wrapSelector('.vp-ev-model.ari-nmi')).prop('disabled', true);
                    }
                }
            });

            // check to enable/disable selector
            $(this.wrapSelector('.vp-eval-check')).on('change', function() {
                let checked = $(this).prop('checked');
                let type = $(this).data('type');

                if (checked) {
                    $(that.wrapSelector('.vp-ev-model.' + type)).prop('disabled', false);
                } else {
                    if (that.checkToShowSelector(type) == false) {
                        $(that.wrapSelector('.vp-ev-model.' + type)).prop('disabled', true);
                    }
                }
            });
        }

        /**
         * Check if anything checked available ( > 0)
         * @returns 
         */
        checkToShowSelector(type) {
            let checked = $(this.wrapSelector('.vp-eval-check[data-type="' + type + '"]:checked')).length;
            if (checked > 0) { 
                return true;
            }
            return false;
        }

        templateForBody() {
            let page = $(evalHTML);

            $(page).find('.vp-eval-box').hide();
            $(page).find('.vp-eval-'+this.state.modelType).show();

            // data selector
            let predDataSelector = new DataSelector({
                pageThis: this, id: 'predictData', value: this.state.predictData, required: true
            });
            $(page).find('#predictData').replaceWith(predDataSelector.toTagString());

            let targetDataSelector = new DataSelector({
                pageThis: this, id: 'targetData', value: this.state.targetData, required: true
            });
            $(page).find('#targetData').replaceWith(targetDataSelector.toTagString());

            // Clustering - data selection
            let clusteredIdxSelector = new DataSelector({
                pageThis: this, id: 'clusteredIndex', value: this.state.clusteredIndex, required: true
            });
            $(page).find('#clusteredIndex').replaceWith(clusteredIdxSelector.toTagString());

            let featureData2Selector = new DataSelector({
                pageThis: this, id: 'featureData2', value: this.state.featureData2, classes: 'vp-ev-model silhouette', required: true
            });
            $(page).find('#featureData2').replaceWith(featureData2Selector.toTagString());

            let targetData2Selector = new DataSelector({
                pageThis: this, id: 'targetData2', value: this.state.targetData2, classes: 'vp-ev-model ari-nmi', required: true
            });
            $(page).find('#targetData2').replaceWith(targetData2Selector.toTagString());

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

            $(page).find('.vp-upper-box').hide();
            $(page).find('.vp-upper-box.' + this.state.modelType).show();

            if (this.state.modelType == 'rgs') {
                // Regression

            } else if (this.state.modelType == 'clf') {
                // Classification
                // if (this.state.roc_curve == false && this.state.auc == false) {
                //     $(page).find('.vp-ev-model.roc-auc').prop('disabled', true);
                // }
            } else {
                // Clustering
                if (this.state.silhouetteScore == false) {
                    $(page).find('.vp-ev-model.silhouette').prop('disabled', true);
                }
                if (this.state.ari == false && this.state.nmi == false) {
                    $(page).find('.vp-ev-model.ari-nmi').prop('disabled', true);
                }
            }

            return page;
        }
        
        generateImportCode() {
            return ['from sklearn import metrics'];
        }

        generateCode() {
            let codeCells = [
                ...this.generateImportCode() // run import codes
            ];
            let code = new com_String();
            let { 
                modelType, predictData, targetData,
                // classification
                confusion_matrix, report, accuracy, precision, recall, f1_score, 
                // regression
                coefficient, intercept, r_squared, mae, mape, rmse, scatter_plot,
                // clustering
                sizeOfClusters, silhouetteScore, ari, nmi,
                clusteredIndex, featureData2, targetData2
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
                // if (roc_curve) {
                //     code = new com_String();
                //     code.appendLine("# ROC Curve");
                //     code.appendFormatLine("fpr, tpr, thresholds = metrics.roc_curve({0}, {1}.decision_function({2}))", predictData, model, targetData);
                //     code.appendLine("plt.plot(fpr, tpr, label='ROC Curve')");
                //     code.appendLine("plt.xlabel('Sensitivity') ");
                //     code.append("plt.ylabel('Specificity') ")
                //     codeCells.push(code.toString());
                // }
                // if (auc) {
                //     code = new com_String();
                //     code.appendLine("# AUC");
                //     code.appendFormat("metrics.roc_auc_score({0}, {1}.decision_function({2}))", predictData, model, targetData);
                //     codeCells.push(code.toString());
                // }
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
                    code.appendLine('    return np.mean(np.abs((y_test - pred) / y_test)) * 100');
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
                    code.appendFormatLine("plt.ylabel('{0}')", predictData);
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
                    code.appendFormat("print(f'Silhouette score: {metrics.cluster.silhouette_score({0}, {1})}')", featureData2, clusteredIndex);
                    codeCells.push(code.toString());
                }
                if (ari) {
                    code = new com_String();
                    code.appendLine("# ARI(Adjusted Rand score)");
                    code.appendFormat("print(f'ARI: {metrics.cluster.adjusted_rand_score({0}, {1})}')", targetData2, clusteredIndex);
                    codeCells.push(code.toString());
                }
                if (nmi) {
                    code = new com_String();
                    code.appendLine("# NMI(Normalized Mutual Info Score)");
                    code.appendFormat("print(f'NM: {metrics.cluster.normalized_mutual_info_score({0}, {1})}')", targetData2, clusteredIndex);
                    codeCells.push(code.toString());
                }
            }
            // return as seperated cells
            return codeCells;
        }

    }

    return Evaluation;
});