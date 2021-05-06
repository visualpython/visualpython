define([
    'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/component/vpTableLayoutVerticalSimple'

    , '../../api.js'    
    , '../../constData.js'
    , '../base/index.js'

], function ( $, vpCommon, sb, vpTableLayoutVerticalSimple

              , api
              , constData
              , baseComponent ) {

    const {  CreateOneArrayValueAndGet
            , UpdateOneArrayValueAndGet
            , DeleteOneArrayValueAndGet
            , GenerateExceptCode } = api;

    const { BLOCK_CODELINE_TYPE

            , IF_BLOCK_CONDITION_TYPE
            , IF_BLOCK_SELECT_VALUE_ARG_TYPE

            , STR_EMPTY
            , STR_DISABLED
            , STR_CLICK
            , STR_CHANGE_KEYUP_PASTE

            , STR_VARIABLE
            , STR_OPERATOR

            , STATE_exceptConditionList

            , VP_CLASS_STYLE_FLEX_ROW
            , VP_CLASS_STYLE_FLEX_ROW_BETWEEN


            , VP_CLASS_STYLE_WIDTH_20PERCENT
            , VP_CLASS_STYLE_WIDTH_35PERCENT

            , VP_CLASS_STYLE_WIDTH_100PERCENT

            , VP_CLASS_STYLE_BGCOLOR_C4C4C4

            , VP_ID_PREFIX
            , VP_ID_APIBLOCK_OPTION_IF_ARG
            , VP_ID_APIBLOCK_OPTION_IF_ARG_1
            , VP_ID_APIBLOCK_OPTION_IF_ARG_2
            , VP_ID_APIBLOCK_OPTION_IF_ARG_3
            , VP_ID_APIBLOCK_OPTION_IF_USER_INPUT
            , VP_ID_APIBLOCK_OPTION_IF_PLUS
            , VP_ID_APIBLOCK_OPTION_IF_PLUS_USER_INPUT
            , VP_ID_APIBLOCK_OPTION_IF_DELETE

            , COMPARISON_OPERATOR_IF_ARG2 } = constData;

    const { MakeOptionContainer
            , MakeOptionDeleteButton
            , MakeVpSuggestInputText_apiblock
            , MakeOptionInput } = baseComponent;

    var InitIfBlockOption = function(thisBlock, optionPageSelector) {
        var uuid = thisBlock.getUUID();
        var blockContainerThis = thisBlock.getBlockContainerThis();
        var ifConditionListState = thisBlock.getState(STATE_exceptConditionList);  
   
        /** --------------------------------- If Option 이벤트 함수 바인딩 ---------------------------------- */           

        /** if 변경 이벤트 함수 바인딩 */
        ifConditionListState.forEach( ( condition, index ) => {
            var uuid = thisBlock.getUUID();
            const { conditionType } = condition;

            // IF_BLOCK_CONDITION_TYPE
            if (conditionType == IF_BLOCK_CONDITION_TYPE.ARG) {
                for (var k = 1; k < 4; k++) {
                    ((i) => {
    
                        /** arg1 arg2 arg3 arg4 arg5 arg6 */
                        /** If arg input 변경 이벤트 함수 바인딩 */
                            $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG +i+ index + uuid);
                            $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG +i+ index + uuid, function(event) {
                     
                     
                       
                                var ifConditionListState = thisBlock.getState(STATE_exceptConditionList);
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
                                }  
    
                                ifConditionListState = UpdateOneArrayValueAndGet(ifConditionListState, index, updatedValue);
                                thisBlock.setState({
                                    [STATE_exceptConditionList]: ifConditionListState
                                });
                                var ifConditionCode = GenerateExceptCode(thisBlock,BLOCK_CODELINE_TYPE.ELIF);
                                thisBlock.writeCode(ifConditionCode);
                                event.stopPropagation();
                            });
        
                    })(k);
                }       
            } else {
                /** codeline arg6 */
                /** If USER input 변경 이벤트 함수 바인딩 */
                $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_USER_INPUT + index + uuid);
                $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_USER_INPUT + index + uuid, function(event) {
           
                    var ifConditionListState = thisBlock.getState(STATE_exceptConditionList);
                    var ifConditionState = ifConditionListState[index];
                    var inputValue = $(this).val();

                    var updatedValue= {
                        ...ifConditionState
                        , codeLine: inputValue
                    }
               

                    ifConditionListState = UpdateOneArrayValueAndGet(ifConditionListState, index, updatedValue);
                    thisBlock.setState({
                        [STATE_exceptConditionList]: ifConditionListState
                    });
                    var ifConditionCode = GenerateExceptCode(thisBlock,BLOCK_CODELINE_TYPE.ELIF);
                    thisBlock.writeCode(ifConditionCode);
                
                    event.stopPropagation();
                });
            }
                   
            /** 삭제 if condition */
            $(document).off(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_DELETE + index + uuid));
            $(document).on(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_DELETE + index + uuid), function(event) {
                var ifConditionListState = thisBlock.getState(STATE_exceptConditionList);

                if (ifConditionListState.length == 1) {
                    return;
                }
                
                ifConditionListState = DeleteOneArrayValueAndGet(ifConditionListState, index);

                thisBlock.setState({
                    [STATE_exceptConditionList]: ifConditionListState
                });
                var ifConditionCode = GenerateExceptCode(thisBlock, BLOCK_CODELINE_TYPE.ELIF);
                thisBlock.writeCode(ifConditionCode);

                blockContainerThis.renderBlockOptionTab();

                event.stopPropagation();
            }); 
        });
        
        /** 생성 if condition - arg1, arg2, arg3, arg4, arg5, arg6*/
        $(document).off(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_PLUS + uuid));
        $(document).on(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_PLUS + uuid), function(event) {

            var ifConditionListState = thisBlock.getState(STATE_exceptConditionList);
            var newCondition = {
                arg1: ''
                , arg2: 'none'
                , arg3: ''
                , conditionType: IF_BLOCK_CONDITION_TYPE.ARG
            }
            ifConditionListState = CreateOneArrayValueAndGet(ifConditionListState, ifConditionListState.length, newCondition);
            thisBlock.setState({
                [STATE_exceptConditionList]: ifConditionListState
            });
            var ifConditionCode = GenerateExceptCode(thisBlock, BLOCK_CODELINE_TYPE.ELIF);
            thisBlock.writeCode(ifConditionCode);
            
            blockContainerThis.renderBlockOptionTab();
            event.stopPropagation();
        });

        /** 생성 if condition - User Input ,arg6*/
        $(document).off(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_PLUS_USER_INPUT + uuid));
        $(document).on(STR_CLICK, vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_PLUS_USER_INPUT + uuid), function(event) {

            var ifConditionListState = thisBlock.getState(STATE_exceptConditionList);
            var newCondition = {
                codeLine: ''
                , arg6: ''
                , conditionType: IF_BLOCK_CONDITION_TYPE.USER_INPUT
            }
            ifConditionListState = CreateOneArrayValueAndGet(ifConditionListState, ifConditionListState.length, newCondition);
            thisBlock.setState({
                [STATE_exceptConditionList]: ifConditionListState
            });
            var ifConditionCode = GenerateExceptCode(thisBlock, BLOCK_CODELINE_TYPE.ELIF);
            thisBlock.writeCode(ifConditionCode);
            
            blockContainerThis.renderBlockOptionTab();
            event.stopPropagation();
        });

        /** arg1, arg2, arg3, arg4, arg5, arg6 select 변경 if condition */
        var bindSelectValueEventFunc_if = function(selectedValue, index, type) {
            var ifConditionListState = thisBlock.getState(STATE_exceptConditionList);
            var ifConditionState = ifConditionListState[index];
            var updatedValue;
            if (type == IF_BLOCK_SELECT_VALUE_ARG_TYPE.ARG1) {
                updatedValue = {
                    ...ifConditionState
                    , arg1: selectedValue 
                }
            } else if (type == IF_BLOCK_SELECT_VALUE_ARG_TYPE.ARG2) {
                updatedValue = {
                    ...ifConditionState
                    , arg2: selectedValue 
                }
                if (selectedValue == 'none' || selectedValue == STR_EMPTY) {
                    $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_2 + index + uuid).addClass(VP_CLASS_STYLE_BGCOLOR_C4C4C4);
                    $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_3 + index + uuid).attr(STR_DISABLED, true);
                    $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_3 + index + uuid).addClass(VP_CLASS_STYLE_BGCOLOR_C4C4C4);

                } else {
                    $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_2 + index + uuid).removeClass(VP_CLASS_STYLE_BGCOLOR_C4C4C4);
                    $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_3 + index + uuid).attr(STR_DISABLED, false);
                    $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_3 + index + uuid).removeClass(VP_CLASS_STYLE_BGCOLOR_C4C4C4);
                } 
            } else if (type == IF_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3) {
                updatedValue = {
                    ...ifConditionState
                    , arg3: selectedValue 
                }
            } 

            ifConditionListState = UpdateOneArrayValueAndGet(ifConditionListState, index, updatedValue);
            thisBlock.setState({
                [STATE_exceptConditionList]: ifConditionListState
            });
            var ifConditionCode = GenerateExceptCode(thisBlock, BLOCK_CODELINE_TYPE.ELIF);
            thisBlock.writeCode(ifConditionCode);
        }

        /** --------------------------------- Else Option 이벤트 함수 바인딩 ---------------------------------- */  













        /** If option 렌더링 */
        var renderThisComponent = function() {
            var optionContainerDom = MakeOptionContainer(thisBlock);
            /* --------------------------- if ----------------------------- */
            var loadedVariableNameList = blockContainerThis.getKernelLoadedVariableNameList();
            var ifConditionListState = thisBlock.getState(STATE_exceptConditionList);   
            ifConditionListState.forEach( (condition, index) => {
     
                const { conditionType } = condition; 
     
                var sbCondition = new sb.StringBuilder();
                sbCondition.appendFormatLine("<div class='{0}'  ", VP_CLASS_STYLE_FLEX_ROW_BETWEEN);
                sbCondition.appendFormatLine("     style='{0}'  >",'');

                var sbConditionLeft = new sb.StringBuilder();
                sbConditionLeft.appendFormatLine("<div class='{0}'  ", VP_CLASS_STYLE_FLEX_ROW_BETWEEN);
                sbConditionLeft.appendFormatLine("     style='{0}'  >",'width:80%;');
                // var sbConditionDom = $(sbCondition.toString());
                if (conditionType == IF_BLOCK_CONDITION_TYPE.ARG) {
                    const { arg1, arg2, arg3 } = condition; 
                    var loadedVariableNameList_arg1 = [ `AssertionError`, 'SystemError', 'TypeError',  'ModuleNotFoundError',
                                                        'BaseException', 'FileNotFoundError', 'ImportError',
                                                        'IndexError', 'MemoryError', 'LookupError', 'BufferError',
                                                        'EOFError'];
                    var loadedVariableNameList_arg3 = [ `e_${index + 1}`, ...loadedVariableNameList];
                    // var loadedVariableNameList_arg5 = [ `'k${index + 1}'`, ...loadedVariableNameList];
                    var suggestInputArg1 =  MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_IF_ARG_1 + index + uuid
                                                                            , arg1
                                                                            , loadedVariableNameList_arg1
                                                                            , VP_CLASS_STYLE_WIDTH_35PERCENT
                                                                            , 'Error'
                                                                            , function(selectedValue) {
                                                                                bindSelectValueEventFunc_if(selectedValue, 
                                                                                                            index,
                                                                                                            IF_BLOCK_SELECT_VALUE_ARG_TYPE.ARG1);
                                                                                });   
                    var suggestInputArg2 =  MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_IF_ARG_2 + index + uuid
                                                                            , arg2
                                                                            , [ 'none', 'as', ...COMPARISON_OPERATOR_IF_ARG2]
                                                                            , VP_CLASS_STYLE_WIDTH_20PERCENT
                                                                            , STR_OPERATOR
                                                                            , function(selectedValue) {
                                                                            bindSelectValueEventFunc_if(selectedValue, 
                                                                                                        index,
                                                                                                        IF_BLOCK_SELECT_VALUE_ARG_TYPE.ARG2);
                                                                            });                                                               
                    var suggestInputArg3 =  MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_IF_ARG_3 + index + uuid
                                                                            , arg3
                                                                            , loadedVariableNameList_arg3
                                                                            , VP_CLASS_STYLE_WIDTH_35PERCENT
                                                                            , STR_VARIABLE
                                                                            , function(selectedValue) {
                                                                                bindSelectValueEventFunc_if(selectedValue, 
                                                                                                            index,
                                                                                                            IF_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3);
                                                                                });   
    
                    sbConditionLeft.appendLine(suggestInputArg1);
                    sbConditionLeft.appendLine(suggestInputArg2);
                    sbConditionLeft.appendLine(suggestInputArg3);
          
                    sbConditionLeft.appendLine("</div>");
                    sbCondition.appendLine(sbConditionLeft.toString());

                    var deleteConditionButton = MakeOptionDeleteButton(VP_ID_APIBLOCK_OPTION_IF_DELETE + index + uuid);
                    sbCondition.appendLine(deleteConditionButton);

                    sbCondition.appendLine("</div>");
                } else {
                    const { codeLine } = condition;
                    var sbOptionInput = MakeOptionInput(VP_ID_APIBLOCK_OPTION_IF_USER_INPUT + index + uuid
                                                        , VP_CLASS_STYLE_WIDTH_100PERCENT
                                                        , codeLine
                                                        , 'Type user code');
                    sbConditionLeft.appendLine(sbOptionInput);
                    sbConditionLeft.appendLine("</div>");

                    sbCondition.appendLine(sbConditionLeft.toString());

                    sbCondition.appendLine("</div>");
                }

                var tblLayout = new vpTableLayoutVerticalSimple.vpTableLayoutVerticalSimple();
                tblLayout.setTHWidth("5%");
                tblLayout.addClass(VP_CLASS_STYLE_WIDTH_100PERCENT);
                tblLayout.addRow('', sbCondition.toString());
 
                optionContainerDom.append(tblLayout.toTagString());              
            });
         


            var sbButtonContainer = new sb.StringBuilder();
            sbButtonContainer.appendFormatLine("<div class='{0}' style='{1}' >", VP_CLASS_STYLE_FLEX_ROW, 'margin-top:15px;');
            sbButtonContainer.appendLine("</div>");
            var sbButtonContainerDom = $(sbButtonContainer.toString());

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
            ifConditionListState.forEach( (condition,index) => {
                const { arg1, arg2, arg3, arg4, arg5, arg6 } = condition;

                $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_1 + index + uuid).val(arg1);
                $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_2 + index + uuid).val(arg2);
                $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_3 + index + uuid).val(arg3);
   
                if (arg2 == 'none' || arg2 == STR_EMPTY) {
                    $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_2 + index + uuid).addClass(VP_CLASS_STYLE_BGCOLOR_C4C4C4);
                    $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_3 + index + uuid).attr(STR_DISABLED, true);
                    $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_3 + index + uuid).addClass(VP_CLASS_STYLE_BGCOLOR_C4C4C4);

                } else {
                    $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_2 + index + uuid).removeClass(VP_CLASS_STYLE_BGCOLOR_C4C4C4);
                    $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_3 + index + uuid).attr(STR_DISABLED, false);
                    $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_IF_ARG_3 + index + uuid).removeClass(VP_CLASS_STYLE_BGCOLOR_C4C4C4);
                } 

            });

            return optionContainerDom;
        }

        return renderThisComponent();
    }

    return InitIfBlockOption;
});