/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : FitPredict.js
 *    Author          : Black Logic
 *    Note            : Model fit / predict
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 04. 20
 *    Change Date     :
 */

//============================================================================
// [CLASS] FitPredict
//============================================================================
define([
    'text!vp_base/html/m_ml/fitPredict.html!strip',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/data/m_ml/mlLibrary',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/VarSelector2',
    'vp_base/js/com/component/ModelEditor'
], function(msHtml, com_util, com_interface, com_String, com_generator, ML_LIBRARIES, PopupComponent, VarSelector2, ModelEditor) {

    /**
     * FitPredict
     */
    class FitPredict extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 2;
            this.config.dataview = false;

            this.state = {
                // model selection
                model: '',
                method: '',
                ...this.state
            }

            this.modelConfig = ML_LIBRARIES;
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            
            // change model
            $(this.wrapSelector('#model')).on('change', function() {
                that.modelEditor.reload();
            });
        }

        templateForBody() {
            let page = $(msHtml);
            
            let that = this;

            //================================================================
            // Model selection
            //================================================================
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

                that.modelEditor.show('action');
            });

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

        templateForOption(modelType) {
            let config = this.modelConfig[modelType];
            let state = this.state;

            let optBox = new com_String();
            // render tag
            config.options.forEach(opt => {
                optBox.appendFormatLine('<label for="{0}" title="{1}">{2}</label>'
                    , opt.name, opt.name, com_util.optionToLabel(opt.name));
                let content = com_generator.renderContent(this, opt.component[0], opt, state);
                optBox.appendLine(content[0].outerHTML);
            });
            // render user option
            optBox.appendFormatLine('<label for="{0}">{1}</label>', 'userOption', 'User option');
            optBox.appendFormatLine('<input type="text" class="vp-input vp-state" id="{0}" placeholder="{1}" value="{2}"/>',
                                        'userOption', 'key=value, ...', this.state.userOption);
            return optBox.toString();
        }

        render() {
            super.render();

            // Model Editor
            this.modelEditor = new ModelEditor(this, "model", "instanceEditor");
        }

        generateCode() {
            let { model } = this.state;
            let code = new com_String();
            code.append(this.modelEditor.getCode({'${model}': model}));

            return code.toString();
        }

    }

    return FitPredict;
});