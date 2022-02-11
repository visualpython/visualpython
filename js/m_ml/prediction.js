/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : prediction.js
 *    Author          : Black Logic
 *    Note            : Prediction
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 02. 07
 *    Change Date     :
 */

//============================================================================
// [CLASS] Prediction
//============================================================================
define([
    'text!vp_base/html/m_ml/prediction.html!strip',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(predHTML, com_util, com_Const, com_String, PopupComponent) {

    /**
     * Prediction
     */
    class Prediction extends PopupComponent {
        _init() {
            super._init();
            this.config.dataview = false;

            this.state = {
                model: '',
                featureData: 'X_test',
                allocateTo: 'pred',
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            
        }

        templateForBody() {
            let page = $(predHTML);

            let that = this;
            // set model list
            let modelOptionTag = new com_String();
            vpKernel.getModelList().then(function(resultObj) {
                let { result } = resultObj;
                var modelList = JSON.parse(result);
                modelList && modelList.forEach(model => {
                    let selectFlag = '';
                    if (model.varName == that.state.model) {
                        selectFlag = 'selected';
                    }
                    modelOptionTag.appendFormatLine('<option value="{0}" data-type="{1}" {2}>{3}</option>', 
                        model.varName, model.varType, selectFlag, model.varName);
                });
                $(page).find('#model').html(modelOptionTag.toString());
                $(that.wrapSelector('#model')).html(modelOptionTag.toString());

                if (!that.state.model || that.state.model == '') {
                    that.state.model = $(that.wrapSelector('#model')).val();
                }
            });
            return page;
        }

        generateCode() {
            let { model, featureData, allocateTo } = this.state;

            let code = new com_String();
            code.appendFormat('{0} = {1}.predict({2})', allocateTo, model, featureData);

            if (allocateTo && allocateTo != '') {
                code.appendLine();
                code.append(allocateTo);
            }
            return code.toString();
        }

    }

    return Prediction;
});