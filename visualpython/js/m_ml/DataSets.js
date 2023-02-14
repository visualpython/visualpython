/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : DataSets.js
 *    Author          : Black Logic
 *    Note            : Data Sets
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 02. 07
 *    Change Date     :
 */

//============================================================================
// [CLASS] DataSets
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_ml/dataSets.html'), // INTEGRATION: unified version of text loader
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/com_generatorV2',
    'vp_base/data/m_ml/mlLibrary',
], function(dsHTML, com_util, com_Const, com_String, PopupComponent, com_generator, ML_LIBRARIES) {

    /**
     * DataSets
     */
    class DataSets extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 2;
            this.config.dataview = false;
            this.config.checkModules = ['pd'];

            this.state = {
                loadType: 'load_boston',
                userOption: '',
                allocateTo: 'ldata',
                ...this.state
            }
            
            this.mlConfig = ML_LIBRARIES;
            this.loadTypeList = {
                'Load Data': [
                    'load_boston', 'load_iris', 'load_diabetes', 'load_digits', 'load_linnerud', 'load_wine', 'load_breast_cancer'
                ],
                'Create Data': [
                    'make_classification', 'make_blobs', 'make_circles', 'make_moons'
                ]
            }

        }

        _bindEvent() {
            super._bindEvent();
            let that = this;

            // select model
            $(this.wrapSelector('#loadType')).on('change', function() {
                let loadType = $(this).val();
                that.state.loadType = loadType;
                $(that.wrapSelector('.vp-data-option-box')).html(that.templateForOption(loadType));

                // change allocateTo default variable name
                if (that.loadTypeList['Load Data'].includes(loadType)) {
                    $(that.wrapSelector('#allocateTo')).val('ldata');
                    that.state.allocateTo = 'ldata';
                } else {
                    $(that.wrapSelector('#allocateTo')).val('df');
                    that.state.allocateTo = 'df';
                }
            });
        }

        templateForBody() {
            let page = $(dsHTML);

            let that = this;
            // load types
            let loadTypeTag = new com_String();
            Object.keys(this.loadTypeList).forEach(category => {
                let optionTag = new com_String();
                that.loadTypeList[category].forEach(opt => {
                    let optConfig = that.mlConfig[opt];
                    let selectedFlag = '';
                    if (opt == that.state.modelType) {
                        selectedFlag = 'selected';
                    }
                    optionTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                                    opt, selectedFlag, optConfig.name);
                })
                loadTypeTag.appendFormatLine('<optgroup label="{0}">{1}</optgroup>', 
                    category, optionTag.toString());
            });
            $(page).find('#loadType').html(loadTypeTag.toString());

            // render option page
            $(page).find('.vp-data-option-box').html(this.templateForOption(this.state.loadType));

            return page;
        }

        templateForOption(loadType) {
            let config = this.mlConfig[loadType];
            let state = this.state;

            let optBox = new com_String();
            // render tag
            config.options.forEach(opt => {
                optBox.appendFormatLine('<label for="{0}" title="{1}">{2}</label>'
                    , opt.name, opt.name, opt.name);
                let content = com_generator.renderContent(this, opt.component[0], opt, state);
                optBox.appendLine(content[0].outerHTML);
            });

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
            let { loadType, userOption, allocateTo } = this.state;
            let code = new com_String();
            let config = this.mlConfig[loadType];
            code.appendLine(config.import);
            code.appendLine();

            // model code
            let modelCode = config.code;
            modelCode = com_generator.vp_codeGenerator(this, config, this.state, (userOption != ''? ', ' + userOption : ''));

            let allocateToVar = allocateTo;
            if (this.loadTypeList['Load Data'].includes(loadType)) {
                code.appendFormatLine('{0} = {1}', allocateTo, modelCode);
                code.appendLine("# Create DataFrame");
                code.appendFormatLine("df_{0} = pd.DataFrame(data={1}.data, columns={2}.feature_names)", allocateTo, allocateTo, allocateTo);
                if (loadType == 'load_linnerud') {
                    code.appendFormat("df_{0}[{1}.target_names] = {2}.target", allocateTo, allocateTo, allocateTo);
                } else {
                    code.appendFormat("df_{0}['target'] = {1}.target", allocateTo, allocateTo);
                }
                allocateToVar = 'df_' + allocateTo;
            } else {
                code.appendFormatLine("_X, _y = {0}", modelCode);
                code.appendLine("# Create DataFrame");
                code.appendLine("_feature_names = ['X{}'.format(i+1) for i in range(len(_X[0]))]");
                code.appendFormatLine("{0} = pd.DataFrame(data=_X, columns=_feature_names)", allocateTo);
                code.appendFormat("{0}['target'] = _y", allocateTo);
            }

            if (allocateToVar != '') {
                code.appendLine();
                code.append(allocateToVar);
            }

            
            return code.toString();
        }
    }

    return DataSets;
});