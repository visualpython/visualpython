/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : SaveLoad.js
 *    Author          : Black Logic
 *    Note            : Save and load models
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 03. 09
 *    Change Date     :
 */

//============================================================================
// [CLASS] DataSets
//============================================================================
define([
    __VP_CSS_LOADER__('vp_base/css/m_ml/saveLoad'), 
    __VP_TEXT_LOADER__('vp_base/html/m_ml/saveLoad.html'), 
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/FileNavigation',
    'vp_base/data/m_ml/mlLibrary',
], function(slCss, slHTML, com_util, com_Const, com_String, com_generator, PopupComponent, FileNavigation, ML_LIBRARIES) {

    /**
     * SaveLoad
     */
    class SaveLoad extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 2;
            this.config.dataview = false;
            this.config.checkModules = ['joblib'];

            this.state = {
                modelio: 'model_save', // model_save / model_load
                target: '',
                allocateTo: '',
                userOption: '',
                savePath: '',
                loadPath: '',
                ...this.state
            }
            
            this.mlConfig = ML_LIBRARIES;
        }

        _bindEvent() {
            super._bindEvent();
            let that = this;

            // select model
            $(this.wrapSelector('#modelio')).on('change', function() {
                let modelio = $(this).val();
                that.state.modelio = modelio;
                $(that.wrapSelector('.vp-modelio-option-box')).html(that.templateForOption(modelio));

                $(that.wrapSelector('#userOption')).val('');
            });

            // user option
            $(this.wrapSelector('#userOption')).on('change', function() {
                that.state.userOption = $(this).val();
            })
        }

        templateForBody() {
            let page = $(slHTML);

            // render option page
            $(page).find('.vp-modelio-option-box').html(this.templateForOption(this.state.modelio));

            $(page).find('#modelio').val(this.state.modelio);
            $(page).find('#userOption').val(this.state.userOption);

            return page;
        }

        templateForOption(modelio) {
            let config = this.mlConfig[modelio];
            let state = this.state;

            let optBox = new com_String();
            // render tag
            config.options.forEach(opt => {
                optBox.appendFormatLine('<label for="{0}" title="{1}">{2}</label>'
                    , opt.name, opt.name, com_util.optionToLabel(opt.name));
                let content = com_generator.renderContent(this, opt.component[0], opt, state);
                optBox.appendLine(content[0].outerHTML);
            });

            // render file navigation


            // show user option
            if (config.code.includes('${etc}')) {
                // render user option
                optBox.appendFormatLine('<label for="{0}">{1}</label>', 'userOption', 'User option');
                optBox.appendFormatLine('<input type="text" class="vp-input vp-state" id="{0}" placeholder="{1}" value="{2}"/>',
                                            'userOption', 'key=value, ...', this.state.userOption);
            }
            return optBox.toString();
        }

        generateCode() {
            let { modelio, userOption } = this.state;
            let code = new com_String();
            if (userOption && userOption != '') {
                userOption = ', ' + userOption;
            }

            let modelCode = com_generator.vp_codeGenerator(this, this.mlConfig[modelio], this.state, userOption);
            code.append(modelCode);
            return code.toString();
        }
    }

    return SaveLoad;
});