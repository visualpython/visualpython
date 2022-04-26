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
            this.config.importButton = true;
            this.config.dataview = false;

            this.state = {
                modelType: 'rgs',
                predictData: 'pred',
                targetData: 'y_test',
                // regression
                r_squared: true, mae: true, mape: false, rmse: true, scatter_plot: false,
                // classification
                confusion_matrix: true, report: true, 
                accuracy: false, precision: false, recall: false, f1_score: false,
                roc_curve: false, auc: false,
                model: '',
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
                com_interface.insertCell('code', 'from sklearn import metrics');
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
                    if (that.checkToShowModel('roc-auc') == true) {
                        $(that.wrapSelector('.vp-ev-model.roc-auc')).prop('disabled', false);
                    } else {
                        $(that.wrapSelector('.vp-ev-model.roc-auc')).prop('disabled', true);
                    }
                } else {
                    // Clustering
                    if (that.checkToShowModel('silhouette') == true) {
                        $(that.wrapSelector('.vp-ev-model.silhouette')).prop('disabled', false);
                    } else {
                        $(that.wrapSelector('.vp-ev-model.silhouette')).prop('disabled', true);
                    }
                    if (that.checkToShowModel('ari-nmi') == true) {
                        $(that.wrapSelector('.vp-ev-model.ari-nmi')).prop('disabled', false);
                    } else {
                        $(that.wrapSelector('.vp-ev-model.ari-nmi')).prop('disabled', true);
                    }
                }
            });

            // open model selection show
            $(this.wrapSelector('.vp-eval-check')).on('change', function() {
                let checked = $(this).prop('checked');
                let type = $(this).data('type');

                if (checked) {
                    $(that.wrapSelector('.vp-ev-model.' + type)).prop('disabled', false);
                } else {
                    if (that.checkToShowModel(type) == false) {
                        $(that.wrapSelector('.vp-ev-model.' + type)).prop('disabled', true);
                    }
                }
            });
        }

        /**
         * Check if anything checked available ( > 0)
         * @returns 
         */
        checkToShowModel(type) {
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

            // varselector
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

            // Clustering - data selection
            varSelector = new VarSelector2(this.wrapSelector(), ['DataFrame', 'list', 'str']);
            varSelector.setComponentID('clusteredIndex');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.clusteredIndex);
            $(page).find('#clusteredIndex').replaceWith(varSelector.toTagString());

            varSelector = new VarSelector2(this.wrapSelector(), ['DataFrame', 'list', 'str']);
            varSelector.setComponentID('featureData2');
            varSelector.addClass('vp-state vp-input vp-ev-model silhouette');
            varSelector.setValue(this.state.featureData2);
            $(page).find('#featureData2').replaceWith(varSelector.toTagString());

            varSelector = new VarSelector2(this.wrapSelector(), ['DataFrame', 'list', 'str']);
            varSelector.setComponentID('targetData2');
            varSelector.addClass('vp-state vp-input vp-ev-model ari-nmi');
            varSelector.setValue(this.state.targetData2);
            $(page).find('#targetData2').replaceWith(varSelector.toTagString());

            // model
            // set model list
            let modelOptionTag = new com_String();
            vpKernel.getModelList('Classification').then(function(resultObj) {
                let { result } = resultObj;
                var modelList = JSON.parse(result);
                modelList && modelList.forEach(model => {
                    let selectFlag = '';
                    if (model.varName == that.state.model) {
                        selectFlag = 'selected';
                    }
                    modelOptionTag.appendFormatLine('<option value="{0}" data-type="{1}" {2}>{3} ({4})</option>', 
                        model.varName, model.varType, selectFlag, model.varName, model.varType);
                });
                $(page).find('#model').html(modelOptionTag.toString());
                $(that.wrapSelector('#model')).html(modelOptionTag.toString());

                if (!that.state.model || that.state.model == '') {
                    that.state.model = $(that.wrapSelector('#model')).val();
                }
            });

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
                if (this.state.roc_curve == false && this.state.auc == false) {
                    $(page).find('.vp-ev-model.roc-auc').prop('disabled', true);
                }
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
            return 'from sklearn import metrics';
        }

        generateCode() {
            let codeCells = [];
            let code = new com_String();
            let { 
                modelType, predictData, targetData,
                // classification
                confusion_matrix, report, accuracy, precision, recall, f1_score, roc_curve, auc,
                model,
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
                if (roc_curve) {
                    code = new com_String();
                    code.appendLine("# ROC Curve");
                    code.appendFormatLine("fpr, tpr, thresholds = metrics.roc_curve({0}, {1}.decision_function({2}))", predictData, model, targetData);
                    code.appendLine("plt.plot(fpr, tpr, label='ROC Curve')");
                    code.appendLine("plt.xlabel('Sensitivity') ");
                    code.append("plt.ylabel('Specificity') ")
                    codeCells.push(code.toString());
                }
                if (auc) {
                    code = new com_String();
                    code.appendLine("# AUC");
                    code.appendFormat("metrics.roc_auc_score({0}, {1}.decision_function({2}))", predictData, model, targetData);
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