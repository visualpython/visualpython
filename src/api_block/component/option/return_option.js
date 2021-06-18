define([
    'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/component/vpTableLayoutVerticalSimple'

    , '../../api.js'    
    , '../../constData.js'
    , '../base/index.js'
], function ( $, vpCommon, vpTableLayoutVerticalSimple,

              api, constData, baseComponent ) {

    const {  UpdateOneArrayValueAndGet
            , DeleteOneArrayValueAndGet

            , GenerateReturnCode } = api;

    const { STR_EMPTY
            , STR_CLICK 
            , STR_CHANGE_KEYUP_PASTE
            
            , VP_ID_PREFIX
            , VP_CLASS_APIBLOCK_PARAM_PLUS_BTN
            , VP_CLASS_APIBLOCK_PARAM_DELETE_BTN
            , VP_CLASS_STYLE_WIDTH_95PERCENT
            , VP_CLASS_STYLE_WIDTH_100PERCENT

            , STATE_returnOutParamList } = constData;

    const { MakeOptionContainer
            , MakeOptionDeleteButton
            , MakeOptionPlusButton } = baseComponent;

    var InitReturnBlockOption = function(thisBlock, optionPageSelector) {
        var uuid = thisBlock.getUUID();
        var blockContainerThis = thisBlock.getBlockContainerThis();
        var returnOutParamList = thisBlock.getState(STATE_returnOutParamList);

        /** Return Block 파라미터 변경 이벤트 함수 바인딩 */
        returnOutParamList.forEach((_, index ) => {
            $(document).off(STR_CHANGE_KEYUP_PASTE, `.vp-apiblock-input-param-${index}-${uuid}`);
            $(document).on(STR_CHANGE_KEYUP_PASTE, `.vp-apiblock-input-param-${index}-${uuid}`, function(event) {

                var newParam = $(this).val();
                thisBlock.setState({
                    returnOutParamList: UpdateOneArrayValueAndGet(thisBlock.getState(STATE_returnOutParamList), 
                                                                  index, newParam)
                });
                var returnOutParamStr = GenerateReturnCode(thisBlock);
                thisBlock.writeCode(returnOutParamStr);

                event.stopPropagation();
            });

            /**
             * @event_function
             * Return block 파라미터 삭제 
             */
            $(document).off(STR_CLICK, VP_ID_PREFIX + VP_CLASS_APIBLOCK_PARAM_DELETE_BTN + index + uuid);
            $(document).on(STR_CLICK, VP_ID_PREFIX + VP_CLASS_APIBLOCK_PARAM_DELETE_BTN + index + uuid, function() {
                var inParamList = thisBlock.getState(STATE_returnOutParamList);
                thisBlock.setState({
                    [STATE_returnOutParamList]:  DeleteOneArrayValueAndGet(inParamList, index)
                });
        
                blockContainerThis.renderBlockOptionTab(); 
                var inParamStr = GenerateReturnCode(thisBlock);
                thisBlock.writeCode(inParamStr);
            });
        });

        /** Return Block 파라미터 생성 이벤트 함수 바인딩 */
                /**
         * @event_function
         */
        $(document).off(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_CLASS_APIBLOCK_PARAM_PLUS_BTN + uuid));
        $(document).on(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_CLASS_APIBLOCK_PARAM_PLUS_BTN + uuid), function(event) {
            var inParamList = thisBlock.getState(STATE_returnOutParamList);
            var newData = STR_EMPTY;
            thisBlock.setState({
                [STATE_returnOutParamList]: [ ...inParamList, newData ]
            });
            blockContainerThis.renderBlockOptionTab(); 
            event.stopPropagation();
        });


        var renderThisComponent = function() {

            var returnBlockOption = MakeOptionContainer(thisBlock);
            var returnOutParamList = thisBlock.getState(STATE_returnOutParamList);
            var returnOutParamContainer = $(`<div class='vp-apiblock-ifoption-container'>
                                                <div class='vp-apiblock-tab-navigation-node-block-title'>
                                                    <span class='vp-block-optiontab-name vp-orange-text'>
                                                        Parameter
                                                    </span>
                                                    <div class='vp-apiblock-style-flex-row-center' >
                                            
                                                    </div>
                                                </div>
                                            </div>`);

            // defInParam 갯수만큼 bottom block 옵션에 렌더링
            var returnOutParamBody = $(`<div class='vp-apiblock-returnbody'>
                                        </div>`);
    
            returnOutParamList.forEach((returnOutParam, index ) => {

                var classStr = `vp-apiblock-input-param-${index}-${uuid}`;
                var returnOutParamDom = $(`<div class='vp-apiblock-style-flex-row-between'
                                                    style='margin-top:5px;'>
               
                                            </div>`);

                 var returnOutParamInput = `<input placeholder="input parameter" 
                                                    class="vp-apiblock-blockoption-input 
                                                            ${VP_CLASS_STYLE_WIDTH_95PERCENT}
                                                        ${classStr}" 
                                                    value="${returnOutParam}">                                                        
                                            </input>`;                    
                var tblLayout = new vpTableLayoutVerticalSimple.vpTableLayoutVerticalSimple();
                tblLayout.setTHWidth("5%");
                tblLayout.addClass(VP_CLASS_STYLE_WIDTH_100PERCENT);
                tblLayout.addRow(index + 1, returnOutParamInput);  
                returnOutParamDom.append(tblLayout.toTagString());

                var deleteButton = MakeOptionDeleteButton(VP_CLASS_APIBLOCK_PARAM_DELETE_BTN + index + uuid);   
                returnOutParamDom.append(deleteButton);
                returnOutParamBody.append(returnOutParamDom);
            });
            returnOutParamContainer.append(returnOutParamBody);
            returnBlockOption.append(returnOutParamContainer);

            var plusButton = MakeOptionPlusButton(VP_CLASS_APIBLOCK_PARAM_PLUS_BTN + uuid, '+ Parameter', 'vp-apiblock-param-box-btn');
            returnBlockOption.append(plusButton);
    
            /** bottom block option 탭에 렌더링된 dom객체 생성 */
            $(optionPageSelector).append(returnBlockOption);

            return returnBlockOption;
        }

        return renderThisComponent();
    }

    return InitReturnBlockOption;
});