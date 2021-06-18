define([
    'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/component/vpTableLayoutVerticalSimple'

    , '../../api.js'    
    , '../../constData.js'
    , '../base/index.js'

], function ( $, vpCommon, sb, vpTableLayoutVerticalSimple,
            api,constData, baseComponent ) {
    const {  UpdateOneArrayValueAndGet
            , DeleteOneArrayValueAndGet
        
            , GenerateDefCode } = api;

    const { BLOCK_DIRECTION
            , BLOCK_CODELINE_TYPE
            , DEF_BLOCK_ARG6_TYPE
            , DEF_BLOCK_SELECT_VALUE_ARG_TYPE

            , VP_ID_PREFIX
            , VP_ID_APIBLOCK_OPTION_DEF_ARG_3
            , VP_ID_APIBLOCK_OPTION_DEF_ARG_5
            , VP_ID_APIBLOCK_OPTION_DEF_ARG_6
  
            , VP_CLASS_STYLE_FLEX_ROW_BETWEEN


            , VP_CLASS_STYLE_WIDTH_5PERCENT
            , VP_CLASS_STYLE_WIDTH_20PERCENT
            , VP_CLASS_STYLE_WIDTH_25PERCENT
            , VP_CLASS_STYLE_WIDTH_30PERCENT
            , VP_CLASS_STYLE_WIDTH_100PERCENT

            , VP_CLASS_APIBLOCK_PARAM_DELETE_BTN
            , VP_CLASS_APIBLOCK_PARAM_PLUS_BTN

            , STR_COLON_SELECTED
            , STR_EMPTY
            , STR_VARIABLE
            , STR_INPUT
            , STR_CLICK
            , STR_CHANGE
            , STR_CHANGE_KEYUP_PASTE

            , STATE_defName
            , STATE_defInParamList
            , STATE_codeLine } = constData;

    const { MakeOptionContainer
            , MakeOptionDeleteButton
            , MakeOptionPlusButton
            , MakeVpSuggestInputText_apiblock
            , MakeOptionSelectBox } = baseComponent;

    var InitDefBlockOption = function(thisBlock, optionPageSelector) {
        var uuid = thisBlock.getUUID();
        var blockContainerThis = thisBlock.getBlockContainerThis();

        /** Def 이름 변경 이벤트 함수 */
        $(document).off(STR_CHANGE_KEYUP_PASTE, `.vp-apiblock-input-def-name-${uuid}`);
        $(document).on(STR_CHANGE_KEYUP_PASTE, `.vp-apiblock-input-def-name-${uuid}`, function(event) {

            thisBlock.setState({
                defName: $(this).val()
            });

            $(`.vp-block-header-def-name-${thisBlock.getUUID()}`).html($(this).val());
            event.stopPropagation();
        });

        // Deprecated: property/decoration removed 210419
        /** Def block property 변경 이벤트 함수 */
        // $(document).off(STR_INPUT, `.vp-apiblock-defproperty-input-${uuid}`);
        // $(document).on(STR_INPUT, `.vp-apiblock-defproperty-input-${uuid}`, function(event) {
        //     var inputValue = $(this).val();
        //     var propertyBlock = thisBlock.getPropertyBlockFromDef();
        //     var prevBlockFromDef = null;
                
        //     /** property block 삭제 */
        //     if ( inputValue == STR_EMPTY 
        //          && thisBlock.getPrevBlock() != null ) {
        //         prevBlockFromDef = thisBlock.getPrevBlock();
        //         prevBlockFromDef.deleteBlock_childBlockList();
        //         thisBlock.setPropertyBlockFromDef(null);
        //     } else {
        //         /** property block 생성 */  
        //         if ( propertyBlock == null ) {
        //             prevBlockFromDef = thisBlock.getPrevBlock();
        //             var defBlockDirection = thisBlock.getDirection();
        //             propertyBlock = blockContainerThis.createBlock(BLOCK_CODELINE_TYPE.PROPERTY);
        //             thisBlock.setPropertyBlockFromDef(propertyBlock);

        //              /** this block이 root block이 아닐 경우 */   
        //             if (prevBlockFromDef != null) {
        //                 prevBlockFromDef.appendBlock(propertyBlock, defBlockDirection);
        //                 /** this block이 root block일 경우 */   
        //             }  else {
        //                 propertyBlock.appendBlock(thisBlock, BLOCK_DIRECTION.DOWN);
        //             }
        //             blockContainerThis.reRenderAllBlock_asc();
        //         } 

        //         /** property block 변경 */  
        //         propertyBlock.setState({
        //             [STATE_codeLine] : inputValue
        //         });
        //         propertyBlock.writeCode(inputValue);
        //     }
        //     blockContainerThis.reRenderAllBlock_asc();
        //     event.stopPropagation();
        // });


        /**
         * @event_function
         * Def block 파라미터 생성 
         */
        $(document).off(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_CLASS_APIBLOCK_PARAM_PLUS_BTN + uuid));
        $(document).on(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_CLASS_APIBLOCK_PARAM_PLUS_BTN + uuid), function(event) {

            var inParamList = thisBlock.getState(STATE_defInParamList);
            var newData = {
                arg3: STR_EMPTY
                , arg5: STR_EMPTY
                , arg6: DEF_BLOCK_ARG6_TYPE.NONE
            }
            inParamList.push(newData);
            thisBlock.setState({
                [STATE_defInParamList]: inParamList
            });

            var defInParamStr = GenerateDefCode(thisBlock);
            thisBlock.writeCode(defInParamStr);
            blockContainerThis.renderBlockOptionTab(); 
            
            event.stopPropagation();
        });

        var defInParamList = thisBlock.getState(STATE_defInParamList);
        defInParamList.forEach((_, index ) => {
            /**
             * @event_function
             * Def block 파라미터 삭제 
             */
            $(document).off(STR_CLICK, VP_ID_PREFIX + VP_CLASS_APIBLOCK_PARAM_DELETE_BTN + index + uuid);
            $(document).on(STR_CLICK, VP_ID_PREFIX + VP_CLASS_APIBLOCK_PARAM_DELETE_BTN + index + uuid, function() {
                var inParamList = thisBlock.getState(STATE_defInParamList);
                thisBlock.setState({
                    [STATE_defInParamList]:  DeleteOneArrayValueAndGet(inParamList, index)
                });
        
                var defInParamStr = GenerateDefCode(thisBlock);
                thisBlock.writeCode(defInParamStr);
                blockContainerThis.renderBlockOptionTab(); 
            });

            /** 
             * @event_function
             * def 이름 변경 이벤트 함수 바인딩 arg3
             */
            $(document).off(STR_CHANGE_KEYUP_PASTE,  VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_DEF_ARG_3 + index + uuid);
            $(document).on(STR_CHANGE_KEYUP_PASTE,  VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_DEF_ARG_3 + index + uuid, function() {
                var defInParam = thisBlock.getState(STATE_defInParamList)[index];
                var changedParamName = $(this).val();
            
                var updatedData = {
                    ...defInParam
                    , arg3: changedParamName
                }
   
                thisBlock.setState({
                    defInParamList:   UpdateOneArrayValueAndGet( thisBlock.getState(STATE_defInParamList), index, updatedData)
                });
                var defInParamStr = GenerateDefCode(thisBlock);
                thisBlock.writeCode(defInParamStr);
            });

            /** 
             * @event_function
             * def default value 변경 이벤트 함수 바인딩 
             */
            $(document).off(STR_CHANGE_KEYUP_PASTE,  VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_DEF_ARG_5 + index + uuid);
            $(document).on(STR_CHANGE_KEYUP_PASTE,  VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_DEF_ARG_5 + index + uuid, function() {
                var defInParam = thisBlock.getState(STATE_defInParamList)[index];
                var changedDefaultVal = $(this).val();
            
                var updatedData = {
                    ...defInParam
                    , arg5 : changedDefaultVal
                    
                }
                thisBlock.setState({
                    defInParamList:  UpdateOneArrayValueAndGet( thisBlock.getState(STATE_defInParamList), index, updatedData)
                });
                var defInParamStr = GenerateDefCode(thisBlock);
                thisBlock.writeCode(defInParamStr);
            });

            /** 
             * @event_function
             * def param type select 변경 이벤트 함수 바인딩 
             */
            $(document).off(STR_CHANGE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_DEF_ARG_6+ index + uuid);
            $(document).on(STR_CHANGE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_DEF_ARG_6+ index + uuid, function() {
                var defInParam = thisBlock.getState(STATE_defInParamList)[index];
                var updatedData = {
                    ...defInParam
                    , arg6 : $(STR_COLON_SELECTED, this).val()   
                }
           
                thisBlock.setState({
                    defInParamList:   UpdateOneArrayValueAndGet( thisBlock.getState(STATE_defInParamList), index, updatedData)
                });

                var defInParamStr = GenerateDefCode(thisBlock);
                thisBlock.writeCode(defInParamStr);
                blockContainerThis.renderBlockOptionTab();
            });

        });

        var bindSelectValueEventFunc_def = function(selectedValue, index, argType) {
            var defParamListState = thisBlock.getState(STATE_defInParamList);
            var defParamState = defParamListState[index];
            var updatedValue;

            if (argType == DEF_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3) {
                updatedValue = {
                    ...defParamState
                    , arg3: selectedValue 
                }
        
            }  else if (argType == DEF_BLOCK_SELECT_VALUE_ARG_TYPE.ARG5) {
                updatedValue = {
                    ...defParamState
                    , arg5: selectedValue 
                }
       
            } else if (argType == DEF_BLOCK_SELECT_VALUE_ARG_TYPE.ARG6) {
                updatedValue = {
                    ...defParamState
                    , arg6: selectedValue 
                }
                
            }

            defParamListState = UpdateOneArrayValueAndGet(defParamListState, index, updatedValue);
            thisBlock.setState({
                [STATE_defInParamList]: defParamListState
            });
            var defParamCode = GenerateDefCode(thisBlock);
            thisBlock.writeCode(defParamCode);
        }

        var RenderOptionPageName = function(thisBlock, name) {
            var classStr = STR_EMPTY;
            var idStr = STR_EMPTY;
            var inputStyleStr = STR_EMPTY;
            var blockCodeName = thisBlock.getBlockName();
            var uuid = thisBlock.getUUID();
    
            idStr = `vp_apiblockDefOptionName${uuid}`;
            classStr = `vp-apiblock-input-def-name-${uuid}`;
            blockCodeName = 'Function Name';
            inputStyleStr = 'width: 100%';

            var nameDom = $(`<div class='vp-apiblock-blockoption-block 
                                         vp-apiblock-style-flex-column-between' 
                                   style='position:relative; height: 50px; margin-bottom: 15px; '>
                               <div class='vp-block-optiontab-name 
                                            vp-apiblock-style-flex-column-center
                                            vp-orange-text'>
                                   ${blockCodeName}
                               </div>
                               <input id='${idStr}'
                                      class='vp-apiblock-blockoption-input ${classStr}'
                                      style='${inputStyleStr}' 
                                      value="${name}"
                                      placeholder='input code line' ></input>   
                                                                                
                           </div>`);
                           

           return nameDom;
       }
        /** Def option 렌더링 */
        var renderThisComponent = function() {
            var defBlockOption = MakeOptionContainer(thisBlock);

            // Deprecated: property/decoration option removed 210419
            /** def property */
            // var propertyBlock = null;
            // var propertyCodeLineState = STR_EMPTY;
            // /** def block 바로 위에 property block이 있을 경우 */
            // if (thisBlock.getPrevBlock() 
            //      && thisBlock.getPrevBlock().getBlockType() == BLOCK_CODELINE_TYPE.PROPERTY ) {
            //     thisBlock.setPropertyBlockFromDef(thisBlock.getPrevBlock());
            //     propertyBlock = thisBlock.getPropertyBlockFromDef();
            //     propertyCodeLineState = propertyBlock.getState(STATE_codeLine);
            // /** def block 바로 위에 property block이 없을 경우 */      
            // } else {
            //     thisBlock.setPropertyBlockFromDef(null);
            // }
     
            // var defPropertyDom = $(`<div class='vp-apiblock-blockoption-block 
            //                                     vp-apiblock-style-flex-row-end'>

            //                             <span class='vp-block-optiontab-name 
            //                                          vp-apiblock-style-flex-column-center'
            //                                   style='margin-right: 5px;'>
            //                                   Decoration
            //                             </span>    
                                        
            //                             <span class='vp-apiblock-style-flex-column-center'
            //                                 style='margin-right: 5px;'>
            //                                 @
            //                             </span>   

            //                         </div>`);
     
            // var inputDom = $(`<input class='vp-apiblock-defproperty-input-${uuid}'
            //                         style='width:25%; 
            //                               margin-right: 5px;' 
            //                         value="${propertyCodeLineState}"
            //                         placeholder='input'
            //                         type='text' >
            //                     </input> `);
     
        
            // var propertyDeleteButton = MakeOptionDeleteButton(uuid);                            
            // $(propertyDeleteButton).click(function() {
            //     var propertyBlock = thisBlock.getPropertyBlockFromDef();
            //     if (propertyBlock) {
            //         propertyBlock.deleteBlock_childBlockList();
            //     }
            //     blockContainerThis.renderBlockOptionTab();
            // });     
     
            // defPropertyDom.append(inputDom);
            // defPropertyDom.append(propertyDeleteButton);
    
            /**  def 이름 function name */
            var defName = thisBlock.getState(STATE_defName);
            var defNameDom = RenderOptionPageName(thisBlock, defName, BLOCK_CODELINE_TYPE.DEF);
          
            // defBlockOption.append( defPropertyDom );
            defBlockOption.append(defNameDom);
          
    
            var loadedVariableNameList = blockContainerThis.getKernelLoadedVariableNameList();
            var loadedVariableNameList_arg5 = [ '0','1','2','3','4','5','6','7','8','9', '[1,2,3]', ...loadedVariableNameList ];
            var loadedVariableNameList_arg6 = [ ...Object.values( DEF_BLOCK_ARG6_TYPE ) ];
            
            var inParamDom = $(`<div class='vp-apiblock-blockoption-block 
                                         vp-apiblock-style-flex-row-between'
                                    style="margin-bottom: 3px;">
                                    <div class='vp-block-optiontab-name 
                                                vp-apiblock-style-flex-column-center 
                                                ${VP_CLASS_STYLE_WIDTH_25PERCENT}
                                                vp-orange-text'>
                                       Parameter
                                    </div>
                                    <div class='vp-block-optiontab-name 
                                                vp-apiblock-style-flex-column-center
                                                vp-orange-text' style="width: 20px;">
                                    </div>
                                    <div class='vp-block-optiontab-name 
                                                vp-apiblock-style-flex-column-center 
                                                ${VP_CLASS_STYLE_WIDTH_25PERCENT}
                                                vp-orange-text'>
                                       Value
                                    </div>
                                    <div class='vp-block-optiontab-name 
                                                vp-apiblock-style-flex-column-center 
                                                ${VP_CLASS_STYLE_WIDTH_25PERCENT}
                                                vp-orange-text'>
                                       Argument Type
                                    </div>
                                    <div class='vp-block-optiontab-name 
                                                vp-apiblock-style-flex-row-between' style="width: 15px;">
                                    </div>
                                </div>`);

            var defInParamContainer = $(`<div class='vp-apiblock-tab-navigation-node-block-title'>
                                                <div class='vp-apiblock-style-flex-row-center' >
                                                </div>
                                            </div>`);
            defBlockOption.append(inParamDom);

            /** Def defInParam 갯수만큼 bottom block 옵션에 렌더링 */
            var defInParamBody = $(`<div>
                                    </div>`);

            /** Def param */
            var defInParamList = thisBlock.getState(STATE_defInParamList);
            defInParamList.forEach((defInParams, index ) => {
                var loadedVariableNameList_arg3 = [ `arg${index + 1}`, ...loadedVariableNameList ];
      
         

                const { arg3, arg5, arg6 } = defInParams;

                var sbDefParam = new sb.StringBuilder();
                sbDefParam.appendFormatLine("<div class='{0}'  ", VP_CLASS_STYLE_FLEX_ROW_BETWEEN);
                sbDefParam.appendFormatLine("     style='{0}'  >",'');
       

                var sbDefVariable = new sb.StringBuilder();
                sbDefVariable.appendFormatLine("<div class='{0} {1}'>", VP_CLASS_STYLE_FLEX_ROW_BETWEEN 
                                                                            , VP_CLASS_STYLE_WIDTH_20PERCENT);
                // Deprecated: don't show this on ui
                // if (arg6 == DEF_BLOCK_ARG6_TYPE.ARGS) {
                //     sbDefVariable.appendLine("<span class='vp-apiblock-style-flex-column-center'>*</span>");
                // } else if (arg6 == DEF_BLOCK_ARG6_TYPE.KWARGS) {
                //     sbDefVariable.appendLine("<span class='vp-apiblock-style-flex-column-center'>**</span>");
                // }                                                
                var suggestInputArg3 =  MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_DEF_ARG_3 + index + uuid
                                                                                    , arg3
                                                                                    , loadedVariableNameList_arg3
                                                                                    , VP_CLASS_STYLE_WIDTH_100PERCENT
                                                                                    , STR_VARIABLE
                                                                                    , function(selectedValue) {
                                                                                        bindSelectValueEventFunc_def(selectedValue, 
                                                                                                                    index,
                                                                                                                    DEF_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3);
                                                                        });   
                sbDefVariable.appendLine(suggestInputArg3.toString());
                sbDefVariable.appendLine("</div>");   
                sbDefParam.appendLine(sbDefVariable.toString());
                
                if (arg3 != 'self') {
                
                    sbDefParam.appendLine(`<div class='vp-apiblock-style-flex-column-center'> = </div>`);   
    
                    var suggestInputArg5 =  MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_DEF_ARG_5 + index + uuid
                                                                                                , arg5
                                                                                                , loadedVariableNameList_arg5
                                                                                                , VP_CLASS_STYLE_WIDTH_25PERCENT
                                                                                                , 'Value'
                                                                                                , function(selectedValue) {
                                                                                                    bindSelectValueEventFunc_def(selectedValue, 
                                                                                                                                index,
                                                                                                                                DEF_BLOCK_SELECT_VALUE_ARG_TYPE.ARG5);
                                                                            }); 
                    sbDefParam.appendLine(suggestInputArg5.toString());                                                                  
                    var sbselectBoxArg6 = MakeOptionSelectBox(VP_ID_APIBLOCK_OPTION_DEF_ARG_6 + index + uuid
                                                                                , VP_CLASS_STYLE_WIDTH_25PERCENT
                                                                                , arg6
                                                                                , loadedVariableNameList_arg6);
                    sbDefParam.appendLine(sbselectBoxArg6.toString()); 
                } 
                
         
          
                                    
                var deleteButton = MakeOptionDeleteButton(VP_CLASS_APIBLOCK_PARAM_DELETE_BTN + index + uuid);
                sbDefParam.appendLine(deleteButton);
                sbDefParam.appendLine("</div>");

                var tblLayout = new vpTableLayoutVerticalSimple.vpTableLayoutVerticalSimple();
                tblLayout.setTHWidth("5%");
                tblLayout.addClass(VP_CLASS_STYLE_WIDTH_100PERCENT);
                tblLayout.addRow(index + 1, sbDefParam.toString());
                defInParamBody.append(tblLayout.toTagString());
            });

            defInParamContainer.append(defInParamBody);
            defBlockOption.append(defInParamContainer);
 
            var defPlusButton = MakeOptionPlusButton(VP_CLASS_APIBLOCK_PARAM_PLUS_BTN + uuid, '+ Parameter', 'vp-apiblock-param-box-btn');
            defBlockOption.append(defPlusButton);
    
            /** bottom block option 탭에 렌더링된 dom객체 생성 */
            $(optionPageSelector).append(defBlockOption);

            var defInParamList = thisBlock.getState(STATE_defInParamList);  
            defInParamList.forEach( (param,index) => {
                const { arg3, arg5, arg6 } = param;
                $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_DEF_ARG_3 + index + uuid).val(arg3);
                $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_DEF_ARG_5 + index + uuid).val(arg5);
                $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_DEF_ARG_6 + index + uuid).val(arg6);
            });
         
            return defBlockOption;
        }

        return renderThisComponent();
    }

    return InitDefBlockOption;
});