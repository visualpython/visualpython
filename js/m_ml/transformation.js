/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : transformation.js
 *    Author          : Black Logic
 *    Note            : Transformation
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 02. 07
 *    Change Date     :
 */

//============================================================================
// [CLASS] Transformation
//============================================================================
define([
    'text!vp_base/html/m_ml/prediction.html!strip',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/VarSelector2'
], function(predHTML, com_util, com_Const, com_String, PopupComponent, VarSelector2) {

    /**
     * Transformation
     */
    class Transformation extends PopupComponent {
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
                    modelOptionTag.appendFormatLine('<option value="{0}" data-type="{1}" {2}>{3} ({4})</option>', 
                        model.varName, model.varType, selectFlag, model.varName, model.varType);
                });
                $(page).find('#model').html(modelOptionTag.toString());
                $(that.wrapSelector('#model')).html(modelOptionTag.toString());

                if (!that.state.model || that.state.model == '') {
                    that.state.model = $(that.wrapSelector('#model')).val();
                }
            });

            // feature data
            let varSelector = new VarSelector2(this.wrapSelector(), ['DataFrame', 'List', 'string']);
            varSelector.setComponentID('featureData');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.featureData);
            $(page).find('#featureData').replaceWith(varSelector.toTagString());
            
            return page;
        }

        generateCode() {
            let { model, featureData, allocateTo } = this.state;

            let code = new com_String();
            code.appendFormat('{0} = {1}.transform({2})', allocateTo, model, featureData);

            if (allocateTo && allocateTo != '') {
                code.appendLine();
                code.append(allocateTo);
            }
            return code.toString();
        }

    }

    return Transformation;
});