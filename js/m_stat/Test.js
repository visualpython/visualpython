/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Classification.js
 *    Author          : Black Logic
 *    Note            : Model selection and fitting
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 02. 07
 *    Change Date     :
 */

//============================================================================
// [CLASS] Classification
//============================================================================
define([
    'text!vp_base/html/m_ml/model.html!strip',   // TODO : 본 모듈의 화면을 구성할 html 파일명을 찾아 연결
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/data/m_ml/mlLibrary',   // TODO : 통계 모듈 메소드에 대한 공통정보는 library에 정리
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/VarSelector2',
    'vp_base/js/com/component/ModelEditor'
], function(msHtml, com_util, com_interface, com_String, com_generator, ML_LIBRARIES, PopupComponent, VarSelector2, ModelEditor) {

    /**
     * Classification
     */
    class Classification extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 2;
            this.config.dataview = false;

            this.state = {   // TODO : 화면 로딩과 동시에 세팅되어야 할 초기값 설정
                // model creation
                modelControlType: 'creation',
                modelType: 'lg-rgs',
                userOption: '',
                featureData: 'X_train',
                targetData: 'y_train',
                allocateToCreation: 'model',
                // model selection
                model: '',
                method: '',
                ...this.state
            }

            this.modelConfig = ML_LIBRARIES;   // TODO : ML_LIBRARY에 정리한 통계 메소드 정보 불러옴

            this.modelTypeList = {   // TODO : 통계 메소드 이름 정리
                'Classfication': ['lg-rgs', 'bern-nb', 'mulnom-nb', 'gaus-nb', 'sv-clf', 'dt-clf', 'rf-clf', 'gbm-clf', 'xgb-clf', 'lgbm-clf', 'cb-clf'],
            }


        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;


            // select model control type  // TODO : 화면에서 리스트 박스의 선택에 따라 특정 변수 항목을 보이기/숨기기 등 처리
            $(this.wrapSelector('#modelControlType')).on('change', function() {
                let modelControlType = $(this).val();
                // show/hide model box
                $(that.wrapSelector('.vp-model-box')).hide();   // TODO : HTML에서 div class가 'vp-model-box'인 항목을 숨기기
                $(that.wrapSelector(`.vp-model-box[data-type="${modelControlType}"]`)).show();
            });

            // select model type
            $(this.wrapSelector('#modelType')).on('change', function() {
                let modelType = $(this).val();   // TODO : 리스트박스에서 선택한 값을 변수로 넣음
                that.state.modelType = modelType;   // TODO : 화면에서 계속 보관해야 할 변수는 that.state.변수명 에 저장 -> 36 line 참고
                $(that.wrapSelector('.vp-model-option-box')).html(that.templateForOption(modelType));   // TODO : 화면에서 그려줄 다양한 모델 옵션정보 HTML을  'templateForOption' 함수에서 생성한 뒤 HTML의 'vp-model-option-box'에 표시해 줌(test.html 17라인 참고)
                that.viewOption();

                // show install button   // TODO : 모델에 따라 패키지 install 버튼을 보이기/숨기기
                if (that.modelConfig[modelType].install != undefined) {
                    $(that.wrapSelector('#vp_installLibrary')).show();
                } else {
                    $(that.wrapSelector('#vp_installLibrary')).hide();
                }
            });

            // install library   // TODO : install 버튼을 클릭했을 때 수행할 동작을 지정
            $(this.wrapSelector('#vp_installLibrary')).on('click', function() {
                let config = that.modelConfig[that.state.modelType];   // TODO : install 동작은 modelConfig -> ML_LIBRARY에 지정되어 있음
                if (config && config.install != undefined) {
                    // insert install code
                    com_interface.insertCell('code', config.install, true, 'Machine Learning > Classification');   // TODO : 화면에서의 팝업을 없애지 않고도 jupyter에 명령줄을 삽입해 줌
                }
            });
            
            // change model
            $(this.wrapSelector('#model')).on('change', function() {
                that.modelEditor.reload();
            });
        }

        templateForBody() {   // TODO : html 스크립트를 html 파일에 정적으로 구성하지 않고, 자바스크립트에서 동적으로 생성하여 html에 표시해 주는 역할.
            let page = $(msHtml);
            
            let that = this;

            // model control type
            $(page).find('.vp-model-box').hide();   // TODO : HTML에서 vp-model-box class 를 찾아서 숨김
            $(page).find(`.vp-model-box[data-type="${this.state.modelControlType}"]`).show();

            //================================================================
            // Model creation
            //================================================================
            // model types
            let modelTypeTag = new com_String();
            Object.keys(this.modelTypeList).forEach(modelCategory => {   // TODO 모델 리스트('lg-rgs', 'bern-nb', 'mulnom-nb'...) 별로 for문을 돔
                let modelOptionTag = new com_String();
                that.modelTypeList[modelCategory].forEach(opt => {
                    let optConfig = that.modelConfig[opt];
                    let selectedFlag = '';
                    if (opt == that.state.modelType) {
                        selectedFlag = 'selected';
                    }
                    modelOptionTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                                    opt, selectedFlag, optConfig.name);
                })
                modelTypeTag.appendFormatLine('<optgroup label="{0}">{1}</optgroup>', 
                    modelCategory, modelOptionTag.toString());
            });
            $(page).find('#modelType').html(modelTypeTag.toString());

            // show install button
            if (this.modelConfig[this.state.modelType].install != undefined) {
                $(page).find('#vp_installLibrary').show();
            } else {
                $(page).find('#vp_installLibrary').hide();
            }

            // render option page
            $(page).find('.vp-model-option-box').html(this.templateForOption(this.state.modelType));   // TODO : 옵션 부분은 별도의 함수(templateForOption)를 호출하여 작성

            let varSelector = new VarSelector2(this.wrapSelector());
            varSelector.setComponentID('featureData');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.featureData);
            $(page).find('#featureData').replaceWith(varSelector.toTagString());

            varSelector = new VarSelector2(this.wrapSelector());
            varSelector.setComponentID('targetData');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.targetData);
            $(page).find('#targetData').replaceWith(varSelector.toTagString());

            //================================================================
            // Model selection
            //================================================================
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

                that.modelEditor.show();
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

        templateForOption(modelType) {   // TODO : 각 모델의 옵션에 대한 화면을 별도의 함수로 구현
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

        viewOption() {   // TODO : 모델에 따라 if문으로 분기하여 모델의 각 옵션 항목을 보이기/숨기기를 결정
            // SVC - kernel selection
            if (this.state.modelType == 'sv-clf') {
                let kernelType = this.state.kernel;
                switch (kernelType) {
                    case undefined: // default = rbf
                    case '':
                    case 'rbf': // gamma
                        $(this.wrapSelector('label[for="gamma"]')).show();
                        $(this.wrapSelector('#gamma')).show(); 
                        // hide others
                        $(this.wrapSelector('label[for="degree"]')).hide();
                        $(this.wrapSelector('#degree')).hide();
                        $(this.wrapSelector('label[for="coef0"]')).hide();
                        $(this.wrapSelector('#coef0')).hide();
                        break;
                    case 'poly': // gamma / degree / coef0
                        $(this.wrapSelector('label[for="gamma"]')).show();
                        $(this.wrapSelector('#gamma')).show(); 
                        $(this.wrapSelector('label[for="degree"]')).show();
                        $(this.wrapSelector('#degree')).show(); 
                        $(this.wrapSelector('label[for="coef0"]')).show();
                        $(this.wrapSelector('#coef0')).show();
                        break;
                    case 'sigmoid': // gamma / coef0
                        $(this.wrapSelector('label[for="gamma"]')).show();
                        $(this.wrapSelector('#gamma')).show(); 
                        $(this.wrapSelector('label[for="coef0"]')).show();
                        $(this.wrapSelector('#coef0')).show();
                        // hide others
                        $(this.wrapSelector('label[for="degree"]')).hide();
                        $(this.wrapSelector('#degree')).hide();
                        break;
                    default:
                        // hide others
                        $(this.wrapSelector('label[for="gamma"]')).hide();
                        $(this.wrapSelector('#gamma')).hide(); 
                        $(this.wrapSelector('label[for="degree"]')).hide();
                        $(this.wrapSelector('#degree')).hide();
                        $(this.wrapSelector('label[for="coef0"]')).hide();
                        $(this.wrapSelector('#coef0')).hide();
                        break;
                }

                // Model Creation - SVC kernel selection
                let that = this;
                $(this.wrapSelector('#kernel')).off('change');
                $(this.wrapSelector('#kernel')).change(function() {
                    that.state.kernel = $(this).val();
                    that.viewOption();
                });
            }

        }

        render() {
            super.render();

            // Model Creation - dynamically view options
            this.viewOption();   // TODO : 사용자가 선택한 모델에 따라 옵션을 동적으로 변경하면서 보여줘야 해서, 별도의 옵션 rendor용 함수를 추가로 호출

            // Model Editor
            this.modelEditor = new ModelEditor(this, "model", "instanceEditor");   // TODO 추후 모델의 학습에 연동되는 데이터 처리를 위한 것으로 짐작됨 -> 통계에서는 없어도 되어 보임
        }

        generateCode() {   // TODO : 실제 파이썬 코드를 생성하는 부분
            let { modelControlType, modelType, userOption, allocateToCreation, model } = this.state;
            let code = new com_String();
            if (modelControlType == 'creation') {   // TODO : 모델 컨트롤 타입에 따라 코드 생성 스타일이 달라져서 본재하는 분기. 통계에서는 불필요해 보임. if문 없이 처리 가능할 것으로 생각됨
                /**
                 * Model Creation
                 * ---
                 * from module import model_function
                 * model = Model(key=value, ...)
                 */
                let config = this.modelConfig[modelType];   // TODO : 파이썬 구문은 ML_LIBRARY에 세팅된 것을 불러와서 처리
                code.appendLine(config.import);
                code.appendLine();
    
                // model code
                let modelCode = config.code;
                modelCode = com_generator.vp_codeGenerator(this, config, this.state, (userOption != ''? ', ' + userOption : ''));
                code.appendFormat('{0} = {1}', allocateToCreation, modelCode);                
            } else {
                /**
                 * Model Selection
                 * ---
                 * ...
                 */
                code.append(this.modelEditor.getCode({'${model}': model}));
            }

            return code.toString();
        }

    }

    return Classification;
});