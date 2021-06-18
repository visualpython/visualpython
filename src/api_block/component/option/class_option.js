define([
    'jquery'

    , '../../api.js'    
    , '../../constData.js'
    , '../base/index.js'

], function ( $, 
              api, constData, baseComponent ) {

    const { GenerateClassInParamList } = api;

    const { BLOCK_CODELINE_TYPE
            
            , STR_EMPTY
            , STR_CHANGE_KEYUP_PASTE

            , STATE_className
            , STATE_parentClassName } = constData;

    const { MakeOptionContainer } = baseComponent;
            
    var InitClassBlockOption = function(thisBlock, optionPageSelector) {
        var uuid = thisBlock.getUUID();

        /**
         * @event_function
         * Class 이름 변경 이벤트 함수
         */
        $(document).off(STR_CHANGE_KEYUP_PASTE, `.vp-apiblock-input-class-name-${uuid}`);
        $(document).on(STR_CHANGE_KEYUP_PASTE, `.vp-apiblock-input-class-name-${uuid}`, function(event) {
            thisBlock.setState({
                className: $(this).val()
            });
   
            $(`.vp-block-header-class-name-${thisBlock.getUUID()}`).html($(this).val());
            event.stopPropagation();
        });

        /**
         * @event_function
         * parent class 상속 값 입력 이벤트 함수
         */ 
        $(document).off(STR_CHANGE_KEYUP_PASTE, `.vp-apiblock-input-param-0-${uuid}`);
        $(document).on(STR_CHANGE_KEYUP_PASTE, `.vp-apiblock-input-param-0-${uuid}`, function(event) {

            thisBlock.setState({
                parentClassName: $(this).val()
            });
            var classInParamStr = GenerateClassInParamList(thisBlock);
            thisBlock.writeCode(classInParamStr);
            event.stopPropagation();
        });

        var RenderOptionPageName = function(thisBlock, name, blockCodeLineType) {
            var classStr = STR_EMPTY;
            var idStr = STR_EMPTY;
            var inputStyleStr = STR_EMPTY;
            var resetButton = null;
            var blockCodeName = thisBlock.getBlockName();
            var uuid = thisBlock.getUUID();
    
            idStr = `vp_apiblockClassOptionName${uuid}`;
            classStr = `vp-apiblock-input-class-name-${uuid}`;
            blockCodeName = 'Class Name';
            inputStyleStr = 'width: 100%';
           
            var nameDom = $(`<div class='vp-apiblock-blockoption-block 
                                         vp-apiblock-style-flex-column-between' 
                                   style='position:relative; height: 50px; margin-bottom: 15px;'>
                               <div class='vp-block-optiontab-name 
                                            vp-apiblock-style-flex-column-center
                                            vp-orange-text'>
                                   ${blockCodeName}
                               </div>
                               <input id='${idStr}'
                                      class='vp-apiblock-blockoption-input ${classStr}'
                                      style='${inputStyleStr}' 
                                      value="${name}"
                                      placeholder='input class name' ></input>   
                                                                                
                           </div>`);
                           
           if (resetButton !== null) {
               $(nameDom).append(resetButton);
           }
           return nameDom;
        }

        var RenderClassParentDom = function(thisBlock) {
            var uuid = thisBlock.getUUID();
            var parentClassName = thisBlock.getState(STATE_parentClassName);
     
            var name = 'Super Class Name';
            var classStr = `vp-apiblock-input-param-${0}-${uuid}`;
            var inputStyleStr = 'width:100%;';
     
     
            var nameDom = $(`<div class='vp-apiblock-blockoption-block  
                                         vp-apiblock-style-flex-column-between' 
                                    style='position:relative; height: 50px; '>
                                    <div class='vp-block-optiontab-name 
                                                 vp-apiblock-style-flex-column-center'>${name}</div>
                                    <input class='vp-apiblock-blockoption-input 
                                                  ${classStr}'
                                        style='${inputStyleStr}' 
                                        value="${parentClassName}"
                                        placeholder='input super class name' ></input>   
                                                                                    
                            </div>`);
            return nameDom;
        }

        /** 
         * @event_function
         * Class option 렌더링 
         */
        var renderThisComponent = function() {
            var classBlockOption = MakeOptionContainer(thisBlock);
            /** class name */
   
            var classNameState = thisBlock.getState(STATE_className);                                
            var classNameDom = RenderOptionPageName(thisBlock, classNameState, BLOCK_CODELINE_TYPE.CLASS);
            var classParentDom = RenderClassParentDom(thisBlock);
            classBlockOption.append(classNameDom);
            classBlockOption.append(classParentDom);

            /** */
            /** option 탭에 렌더링된 dom객체 생성 */
            $(optionPageSelector).append(classBlockOption);

            return classBlockOption;
        }
        
        return renderThisComponent();
    }

    return InitClassBlockOption;
});