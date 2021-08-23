define([
    'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/component/vpTableLayoutVerticalSimple'
    
    , '../../api.js'    
    , '../../constData.js'
    , '../base/index.js'

], function ( $, vpCommon, sb, vpTableLayoutVerticalSimple,

              api,  constData, baseComponent ) {
    const {  CreateOneArrayValueAndGet
            , UpdateOneArrayValueAndGet
            , DeleteOneArrayValueAndGet

            , GenerateWhileCode } = api;

    const { STR_COLON_SELECTED

            , STR_EMPTY
            , STR_CHANGE 
            , STR_CHANGE_KEYUP_PASTE
            , STR_CLICK 
            , STR_OPERATOR
            , STR_VARIABLE
            , STR_DISABLED

            , VP_CLASS_PREFIX
            , VP_CLASS_STYLE_FLEX_ROW
            , VP_CLASS_STYLE_FLEX_ROW_CENTER    
            , VP_CLASS_STYLE_FLEX_ROW_BETWEEN

            , VP_CLASS_STYLE_WIDTH_25PERCENT
            , VP_CLASS_STYLE_WIDTH_35PERCENT
            , VP_CLASS_STYLE_WIDTH_100PERCENT

            , VP_CLASS_STYLE_BGCOLOR_C4C4C4

            , VP_ID_PREFIX
            , VP_ID_APIBLOCK_OPTION_WHILE_ARG
            , VP_ID_APIBLOCK_OPTION_WHILE_ARG_1
            , VP_ID_APIBLOCK_OPTION_WHILE_ARG_2
            , VP_ID_APIBLOCK_OPTION_WHILE_ARG_3
            , VP_ID_APIBLOCK_OPTION_WHILE_ARG_4
            , VP_ID_APIBLOCK_OPTION_WHILE_PLUS
            , VP_ID_APIBLOCK_OPTION_WHILE_DELETE

            , VP_CLASS_STYLE_OPACITY_0
            , VP_CLASS_STYLE_OPACITY_1

            , WHILE_BLOCK_SELECT_VALUE_ARG_TYPE
            , WHILE_OPERATOR_ARG2
            , COMPARISON_OPERATOR_IF_ARG4

            , STATE_whileConditionList

             } = constData;

    const { MakeOptionContainer
            , MakeOptionDeleteButton
            , MakeOptionPlusButton
            , MakeOptionSelectBox
            , MakeVpSuggestInputText_apiblock } = baseComponent;

    var InitWhileBlockOption = function(thisBlock, optionPageSelector) {
        var uuid = thisBlock.getUUID();
        var blockContainerThis = thisBlock.getBlockContainerThis();
        var ifConditionListState = thisBlock.getState(STATE_whileConditionList);  
           
        /** --------------------------------- If Option 이벤트 함수 바인딩 ---------------------------------- */           
        
        /** if 변경 이벤트 함수 바인딩 */
        ifConditionListState.forEach( ( condition, index ) => {
            var uuid = thisBlock.getUUID();
    
            /**
             * @event_function
             * iF arg2 선택 변경 
             */
            $(document).off(STR_CHANGE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_ARG_2 + index + uuid);
            $(document).on(STR_CHANGE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_ARG_2 + index + uuid, function(event) {
                var ifConditionListState = thisBlock.getState(STATE_whileConditionList);
                var ifConditionState = ifConditionListState[index];
                var selectedValue = $(STR_COLON_SELECTED, this).val();
                    if (selectedValue == 'none') {
                        selectedValue = STR_EMPTY;
                    }

                    var updatedValue = {
                        ...ifConditionState
                        ,arg2: selectedValue
                    }

                    ifConditionListState = UpdateOneArrayValueAndGet(ifConditionListState, index, updatedValue);
                    thisBlock.setState({
                        [STATE_whileConditionList]: ifConditionListState
                    });

                    var whileBlockCode = GenerateWhileCode(thisBlock);
                    thisBlock.writeCode(whileBlockCode);
                    blockContainerThis.renderBlockOptionTab();
                    event.stopPropagation();
                });


                        for (var k = 1; k < 5; k++) {
                            ((i) => {
            
                                /** arg1 arg2 arg3 arg4 */
                                /** If arg input 입력 변경 이벤트 함수 바인딩 */
                                    $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_ARG +i+ index + uuid);
                                    $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_ARG +i+ index + uuid, function(event) {
                            
                                        var ifConditionListState = thisBlock.getState(STATE_whileConditionList);
                                        var ifConditionState = ifConditionListState[index];
                                        var inputValue = $(this).val();
            
                                        var updatedValue;
                                        if (i == 1) {
                                            updatedValue = {
                                                ...ifConditionState
                                                , arg1: inputValue
                                            }
                                        } else if (i == 2) {
                                            updatedValue = {
                                                ...ifConditionState
                                                , arg2: inputValue 
                                            }
                                        } else if (i == 3) {
                                            updatedValue = {
                                                ...ifConditionState
                                                , arg3: inputValue 
                                            }
                                        } else {
                                            updatedValue = {
                                                ...ifConditionState
                                                , arg4: inputValue
                                            }
                                        }
            
                                        ifConditionListState = UpdateOneArrayValueAndGet(ifConditionListState, index, updatedValue);
                                        thisBlock.setState({
                                            [STATE_whileConditionList]: ifConditionListState
                                        });
                                        var ifConditionCode = GenerateWhileCode(thisBlock);
                                        thisBlock.writeCode(ifConditionCode);
                                    
                                        event.stopPropagation();
                                    });
                
                            })(k);
                        }       
                           
                    /** 삭제 if condition */
                    $(document).off(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_DELETE + index + uuid));
                    $(document).on(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_DELETE + index + uuid), function(event) {
                        var ifConditionListState = thisBlock.getState(STATE_whileConditionList);
        
                        if (ifConditionListState.length == 1) {
                            return;
                        }
                        
                        ifConditionListState = DeleteOneArrayValueAndGet(ifConditionListState, index);
        
                        thisBlock.setState({
                            [STATE_whileConditionList]: ifConditionListState
                        });
                        var ifConditionCode = GenerateWhileCode(thisBlock);
                        thisBlock.writeCode(ifConditionCode);
                        blockContainerThis.renderBlockOptionTab();
        
                        event.stopPropagation();
                    }); 
                });
                
                /** 생성 if condition - arg1, arg2, arg3, arg4 */
                $(document).off(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_PLUS + uuid));
                $(document).on(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_PLUS + uuid), function(event) {
        
                    var ifConditionListState = thisBlock.getState(STATE_whileConditionList);
      
                    var newCondition = {
                        arg1: ''
                        , arg2: ''
                        , arg3: ''
                        , arg4: 'and'
                    }
                    ifConditionListState = CreateOneArrayValueAndGet(ifConditionListState, ifConditionListState.length, newCondition);
                    thisBlock.setState({
                        [STATE_whileConditionList]: ifConditionListState
                    });
                    var ifConditionCode = GenerateWhileCode(thisBlock);
                    thisBlock.writeCode(ifConditionCode);
                    
                    blockContainerThis.renderBlockOptionTab();
                    event.stopPropagation();
                });
    
        
                /** arg1, arg2, arg3, arg4 select 변경 if condition */
                var bindSelectValueEventFunc_while = function(selectedValue, index, type) {
                    var ifConditionListState = thisBlock.getState(STATE_whileConditionList);
                    var ifConditionState = ifConditionListState[index];
                    var updatedValue;
                    if (type == WHILE_BLOCK_SELECT_VALUE_ARG_TYPE.ARG1) {
                        updatedValue = {
                            ...ifConditionState
                            , arg1: selectedValue 
                        }
                        
                    } else if (type == WHILE_BLOCK_SELECT_VALUE_ARG_TYPE.ARG2) {
                        if (selectedValue == 'none') {
                            selectedValue = STR_EMPTY;
                        }
                        updatedValue = {
                            ...ifConditionState
                            , arg2: selectedValue 
                        }
                      
                    } else if (type == WHILE_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3) {
                        updatedValue = {
                            ...ifConditionState
                            , arg3: selectedValue 
                        }
                    } else {
                        updatedValue = {
                            ...ifConditionState
                            , arg4: selectedValue 
                        }
                      
                    }
                    ifConditionListState = UpdateOneArrayValueAndGet(ifConditionListState, index, updatedValue);
                    thisBlock.setState({
                        [STATE_whileConditionList]: ifConditionListState
                    });
                    var ifConditionCode = GenerateWhileCode(thisBlock);
                    thisBlock.writeCode(ifConditionCode);
    
                }
        
        
        
        
                /** While option 렌더링 */
                var renderThisComponent = function() {
          
      
                    var optionContainerDom = MakeOptionContainer(thisBlock);
                    /* --------------------------- While ----------------------------- */
                    var loadedVariableNameList = blockContainerThis.getKernelLoadedVariableNameList();
                    var ifConditionListState = thisBlock.getState(STATE_whileConditionList);   
                    ifConditionListState.forEach( (condition, index) => {
             
                        var sbCondition = new sb.StringBuilder();
                        sbCondition.appendFormatLine("<div class='{0}'  ", VP_CLASS_STYLE_FLEX_ROW_BETWEEN);
                        sbCondition.appendFormatLine("     style='{0}'  >",'');
        
                        var sbConditionLeft = new sb.StringBuilder();
                        sbConditionLeft.appendFormatLine("<div class='{0}'  ", VP_CLASS_STYLE_FLEX_ROW_BETWEEN);
                        sbConditionLeft.appendFormatLine("     style='{0}'  >",'width:70%;');
               
                        const { arg1, arg2, arg3, arg4 } = condition; 
                        var loadedVariableNameList_arg1 = [ `'i${index + 1}'`, ...loadedVariableNameList];
                        var loadedVariableNameList_arg3 = [ `'j${index + 1}'`, ...loadedVariableNameList];
                        // var loadedVariableNameList_arg5 = [ `'k${index + 1}'`, ...loadedVariableNameList];

                        var suggestInputArg1 =  MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_WHILE_ARG_1 + index + uuid
                                                                                , arg1
                                                                                , loadedVariableNameList_arg1
                                                                                , VP_CLASS_STYLE_WIDTH_35PERCENT
                                                                                , STR_VARIABLE
                                                                                , function(selectedValue) {
                                                                                    bindSelectValueEventFunc_while(selectedValue, 
                                                                                                                index,
                                                                                                                WHILE_BLOCK_SELECT_VALUE_ARG_TYPE.ARG1);
                                                                                    });  
                                                                                                                                             

                        var sbIfArg2 = MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_WHILE_ARG_2 + index + uuid
                                            , arg2
                                            , WHILE_OPERATOR_ARG2
                                            , VP_CLASS_STYLE_WIDTH_25PERCENT
                                            , STR_OPERATOR
                                            , function(selectedValue) {
                                            bindSelectValueEventFunc_while(selectedValue, 
                                                                        index,
                                                                        WHILE_BLOCK_SELECT_VALUE_ARG_TYPE.ARG2);
                                            });     
                        
                                                          
                        var suggestInputArg3 =  MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_WHILE_ARG_3 + index + uuid
                                                                                , arg3
                                                                                , loadedVariableNameList_arg3
                                                                                , VP_CLASS_STYLE_WIDTH_35PERCENT
                                                                                , STR_VARIABLE
                                                                                , function(selectedValue) {
                                                                                    bindSelectValueEventFunc_while(selectedValue, 
                                                                                                                index,
                                                                                                                WHILE_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3);
                                                                                    });   
    
                        // var suggestInputArg4 =  MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_WHILE_ARG_4 + index + uuid
                        //                                                             , arg4
                        //                                                             , COMPARISON_OPERATOR_IF_ARG4
                        //                                                             , VP_CLASS_STYLE_WIDTH_15PERCENT
                        //                                                             , STR_OPERATOR
                        //                                                             , function(selectedValue) {
                        //                                                                 bindSelectValueEventFunc_while(selectedValue, 
                        //                                                                     index,
                        //                                                                     WHILE_BLOCK_SELECT_VALUE_ARG_TYPE.ARG4);
                        //                                                         });      
                        var operArg4 = MakeOptionSelectBox(VP_ID_APIBLOCK_OPTION_WHILE_ARG_4 + index + uuid
                                                    , VP_CLASS_STYLE_WIDTH_25PERCENT
                                                    , arg4
                                                    // , COMPARISON_OPERATOR_IF_ARG4);
                                                    , ['and', 'or']);
                        sbConditionLeft.appendLine(suggestInputArg1);
                        sbConditionLeft.appendLine(sbIfArg2);
                        sbConditionLeft.appendLine(suggestInputArg3);
                        sbConditionLeft.appendLine("</div>");
    
                        sbCondition.appendLine(sbConditionLeft.toString());
                        // sbCondition.appendLine(suggestInputArg4);
                        sbCondition.appendLine(operArg4);
    
                        var deleteConditionButton = MakeOptionDeleteButton(VP_ID_APIBLOCK_OPTION_WHILE_DELETE + index + uuid);
                        sbCondition.appendLine(deleteConditionButton);
    
                        sbCondition.appendLine("</div>");
        
                        var tblLayout = new vpTableLayoutVerticalSimple.vpTableLayoutVerticalSimple();
                        tblLayout.setTHWidth("5%");
                        tblLayout.addClass(VP_CLASS_STYLE_WIDTH_100PERCENT);
                        tblLayout.addRow(index + 1, sbCondition.toString());
        
         
                        optionContainerDom.append(tblLayout.toTagString());              
                    });
                 
        
        
                    var sbButtonContainer = new sb.StringBuilder();
                    sbButtonContainer.appendFormatLine("<div class='{0}' style='{1}' >", VP_CLASS_STYLE_FLEX_ROW, 'margin-top:15px;');
                    sbButtonContainer.appendLine("</div>");
                    var sbButtonContainerDom = $(sbButtonContainer.toString());
        
                    var plusButton = MakeOptionPlusButton(VP_ID_APIBLOCK_OPTION_WHILE_PLUS + uuid, '+ Condition');
                  
                    sbButtonContainerDom.append(plusButton);

        
                    optionContainerDom.append(sbButtonContainerDom);
                    /** bottom block option 탭에 렌더링된 dom객체 생성 */
                    $(optionPageSelector).append(optionContainerDom);
        
                    /** 새로 IF OPTION을 열었을때,
                     * 
                     *  1. arg value 값 넣기, 
                     *  2. none disabled 설정, 
                     *  3. none opacity 0 설정
                     *  4. 입력되지 않은 값 border alert 처리
                     *  */
                    var ifConditionListState = thisBlock.getState(STATE_whileConditionList);   
                    ifConditionListState.forEach( (condition,index) => {
                        const { arg1, arg2, arg3, arg4 } = condition;
        
                        $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_ARG_1 + index + uuid).val(arg1);
                  
                        $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_ARG_3 + index + uuid).val(arg3);

                        $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_ARG_2 + index + uuid).val(arg2);
      
                        if ( ifConditionListState.length -1 == index ) {
                            $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_ARG_4 + index + uuid).addClass(VP_CLASS_STYLE_OPACITY_0);
                        } else {
                            $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_ARG_4 + index + uuid).val(arg4);
                            $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_WHILE_ARG_4 + index + uuid).addClass(VP_CLASS_STYLE_OPACITY_1);
                        }
            
                    });


                    return optionContainerDom;
                }
        
                return renderThisComponent();
            }
        
            return InitWhileBlockOption;
        });