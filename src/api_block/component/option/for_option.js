define([
    'jquery'

    , 'nbextensions/visualpython/src/common/StringBuilder'

    , '../../api.js'    
    , '../../constData.js'
    , '../base/index.js'

    , 'nbextensions/visualpython/src/common/component/vpVarSelector'

], function ( $, sb, 
                api, constData, baseComponent, vpVarSelector) {
                    
    const { GenerateForCode
            , GenerateListforConditionList } = api;

    const VarSelector = vpVarSelector;
             
    const { FOR_BLOCK_TYPE
            , FOR_BLOCK_ARG3_TYPE
            , FOR_BLOCK_SELECT_VALUE_ARG_TYPE

            , VP_ID_PREFIX
            , VP_ID_APIBLOCK_OPTION_FOR_TYPE_SELECT
            , VP_ID_APIBLOCK_OPTION_FOR_ARG_1
            , VP_ID_APIBLOCK_OPTION_FOR_ARG_2
            , VP_ID_APIBLOCK_OPTION_FOR_ARG_3
            , VP_ID_APIBLOCK_OPTION_FOR_ARG_4
            , VP_ID_APIBLOCK_OPTION_FOR_ARG_5
            , VP_ID_APIBLOCK_OPTION_FOR_ARG_6
            , VP_ID_APIBLOCK_OPTION_FOR_ARG_7
            , VP_ID_APIBLOCK_OPTION_FOR_ARG_8
            , VP_ID_APIBLOCK_OPTION_FOR_ARG_3_INPUT_STR
            , VP_ID_APIBLOCK_OPTION_FOR_ARG_3_DEFAULT

            , VP_CLASS_PREFIX

            , VP_CLASS_APIBLOCK_OPTION_NAME
            , VP_CLASS_APIBLOCK_BLOCK_HEADER
            , VP_CLASS_STYLE_FLEX_ROW_BETWEEN
            , VP_CLASS_STYLE_FLEX_COLUMN_CENTER

            , VP_CLASS_STYLE_WIDTH_20PERCENT
            , VP_CLASS_STYLE_WIDTH_30PERCENT
            , VP_CLASS_STYLE_WIDTH_40PERCENT
            , VP_CLASS_STYLE_WIDTH_50PERCENT
            , VP_CLASS_STYLE_WIDTH_80PERCENT
            , VP_CLASS_STYLE_WIDTH_100PERCENT

            , VP_CLASS_STYLE_OPACITY_0
            , VP_CLASS_STYLE_OPACITY_1

            , STR_EMPTY
            , STR_COLON_SELECTED
            , STR_CHANGE
            , STR_CHANGE_KEYUP_PASTE
            , STR_STRONG
            , STR_FLEX
            , STR_NONE
            , STR_DISPLAY
            , STR_VARIABLE
            , STR_VALUE
            , STR_MARGIN_LEFT
            , STATE_forParam
            , STATE_forBlockOptionType } = constData;

    const { MakeOptionContainer
            , MakeVpSuggestInputText_apiblock
            , MakeOptionSelectBox } = baseComponent;    

    var InitForBlockOption = function(thisBlock, optionPageSelector) {
        var uuid = thisBlock.getUUID();
        var blockContainerThis = thisBlock.getBlockContainerThis();

        /**
         * @event_function
         * for arg1 변경 
         */
        $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_1 + uuid);
        $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_1 + uuid, function(event) {         
            var forParam = thisBlock.getState(STATE_forParam);
            thisBlock.setState({
                [STATE_forParam]: {
                    ...forParam
                    , arg1 : $(this).val()
                }
            });
            var forParamStr = GenerateForCode(thisBlock);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);

            event.stopPropagation();
        });

        /** 
         * @event_function
         * for arg2 변경
         */
        $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_2 + uuid);
        $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_2 + uuid, function(event) {
            var forParam = thisBlock.getState(STATE_forParam);
            thisBlock.setState({
                [STATE_forParam]: {
                    ...forParam
                    , arg2 :  $(this).val()
                }
            });
            var forParamStr = GenerateForCode(thisBlock);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);

            event.stopPropagation();
        });
                
        /**
         * @event_function
         *  for arg3 변경 
         */
    
        $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_3 + uuid);
        $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_3 + uuid, function(event) {
            var forParam = thisBlock.getState(STATE_forParam);
            thisBlock.setState({
                [STATE_forParam]: {
                    ...forParam
                    , arg3 :  $(this).val()
                }
            });
            var forParamStr = GenerateForCode(thisBlock);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);

            // if ($(this).val() == STR_EMPTY) {
                blockContainerThis.renderBlockOptionTab();
            // }
  
            event.stopPropagation();
        });

        // $(document).off(STR_CHANGE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_3 + uuid);
        // $(document).on(STR_CHANGE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_3 + uuid, function(event) {
        //     var forParam = thisBlock.getState(STATE_forParam);
        //     thisBlock.setState({
        //         [STATE_forParam]: {
        //             ...forParam
        //             , arg3 :  $(STR_COLON_SELECTED, this).val()  
        //         }
        //     });
        //     var forParamStr = GenerateForCode(thisBlock);
        //     $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);
        //     blockContainerThis.renderBlockOptionTab();
        //     event.stopPropagation();
        // });

        /**
         * @event_function
         * for arg4 변경 
         */
        $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_4 + uuid);
        $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_4 + uuid, function(event) {
            var forParam = thisBlock.getState(STATE_forParam);
            thisBlock.setState({
                [STATE_forParam]: {
                    ...forParam
                    , arg4 : $(this).val()
                }
            });
            var forParamStr = GenerateForCode(thisBlock);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);

            event.stopPropagation();
        });


        /**
         * @event_function
         * for arg5 변경 
         */
        $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_5 + uuid);
        $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_5 + uuid, function(event) {
            var forParam = thisBlock.getState(STATE_forParam);
            thisBlock.setState({
                [STATE_forParam]: {
                    ...forParam
                    , arg5 : $(this).val()
                }
            });
            var forParamStr = GenerateForCode(thisBlock);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);

            event.stopPropagation();
        });


        /**
         * @event_function
         * for arg6 변경 
         */
        $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_6 + uuid);
        $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_6 + uuid, function(event) {
            var forParam = thisBlock.getState(STATE_forParam);
            thisBlock.setState({
                [STATE_forParam]: {
                    ...forParam
                    , arg6 : $(this).val()
                }
            });
            var forParamStr = GenerateForCode(thisBlock);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);
            
            event.stopPropagation();
        });


        /**
         * @event_function
         * for arg7 변경 
         */
        $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_7 + uuid);
        $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_7 + uuid, function(event) {
            var forParam = thisBlock.getState(STATE_forParam);
            thisBlock.setState({
                [STATE_forParam]: {
                    ...forParam
                    , arg7 : $(this).val() 
                }
            });
            var forParamStr = GenerateForCode(thisBlock);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);

            event.stopPropagation();
        });

        /**
         * @event_function
         * for arg8 변경 
         */
        $(document).off(STR_CHANGE_KEYUP_PASTE + ' var_changed', VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_8 + uuid);
        $(document).on(STR_CHANGE_KEYUP_PASTE + ' var_changed', VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_8 + uuid, function(event) {
            var forParam = thisBlock.getState(STATE_forParam);
            thisBlock.setState({
                [STATE_forParam]: {
                    ...forParam
                    , arg8 : event.value
                }
            });
            var forParamStr = GenerateForCode(thisBlock);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);

            event.stopPropagation();
        });

        /** for arg3 inputStr 변경
         * @event_function
         */
        $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_3_INPUT_STR + uuid);
        $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_3_INPUT_STR + uuid, function(event) {
            var forParam = thisBlock.getState(STATE_forParam);
            thisBlock.setState({
                [STATE_forParam]: {
                    ...forParam
                    , arg3InputStr: $(this).val() 
                }
            });
            var forParamStr = GenerateForCode(thisBlock);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);

            event.stopPropagation();
        });

        /**
         * @event_function
         */
        $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_3_DEFAULT + uuid);
        $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_3_DEFAULT + uuid, function(event) {
            var forParam = thisBlock.getState(STATE_forParam);
            thisBlock.setState({
                [STATE_forParam]: {
                    ...forParam
                    , arg3Default: $(this).val()
                }
            });
            var forParamStr = GenerateForCode(thisBlock);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);

            event.stopPropagation();
        });

        /**
         * @event_function
         * For or List for 선택 이벤트 함수
         */
        $(document).off(STR_CHANGE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_TYPE_SELECT + uuid);
        $(document).on(STR_CHANGE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_TYPE_SELECT + uuid, function(event) {
    
            var selectedVal = $(STR_COLON_SELECTED, this).val();
            thisBlock.setState({
                [STATE_forBlockOptionType]: $(STR_COLON_SELECTED, this).val()
            });

            var forParamStr = STR_EMPTY;
            if ( selectedVal == FOR_BLOCK_TYPE.FOR ) {
                forParamStr = GenerateForCode(thisBlock);
                $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);
                thisBlock.getBlockHeaderDom().find(STR_STRONG).css(STR_DISPLAY, STR_FLEX);
            } else {
                forParamStr = GenerateListforConditionList(thisBlock);
                $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);
                thisBlock.getBlockHeaderDom().find(STR_STRONG).css(STR_DISPLAY, STR_NONE);
            }

            blockContainerThis.renderBlockOptionTab();

            event.stopPropagation();
        });

        var bindSelectValueEventFunc_for = function(selectedValue, argType) {
            var forParam = thisBlock.getState(STATE_forParam);

            var updatedValue;
        
            if (FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG1 == argType) {
                updatedValue = {
                    ...forParam
                    , arg1 : selectedValue
                }
            } else if (FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG2 == argType) {
                updatedValue = {
                    ...forParam
                    , arg2 : selectedValue
                }
            } else if (FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3 == argType) {
                updatedValue = {
                    ...forParam
                    , arg3 : selectedValue
                }
            } else if (FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG4 == argType) {
                updatedValue = {
                    ...forParam
                    , arg4 : selectedValue
                }
            } else if (FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG5 == argType) {
                updatedValue = {
                    ...forParam
                    , arg5 : selectedValue
                }
            } else if (FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG6 == argType) {
                updatedValue = {
                    ...forParam
                    , arg6 : selectedValue
                }
            } else if (FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG7 == argType) {
                updatedValue = {
                    ...forParam
                    , arg7 : selectedValue
                }
            } else if (FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG8 == argType) {
                updatedValue = {
                    ...forParam
                    , arg8 : selectedValue
                }
            } else if (FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3_DEFAULT == argType) {
                updatedValue = {
                    ...forParam
                    , arg3Default : selectedValue
                }
            } else if (FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3_INPUT_STR == argType) {
                updatedValue = {
                    ...forParam
                    , arg3InputStr : selectedValue
                }
            }

            thisBlock.setState({
                [STATE_forParam]: updatedValue
            });
            var forParamStr = GenerateForCode(thisBlock);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).html(forParamStr);

            if (FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3 == argType) {
                blockContainerThis.renderBlockOptionTab();
            }
        }
        
        /** For option 렌더링 */
        var renderThisComponent = function() {
            var optionContainerDom = MakeOptionContainer(thisBlock);
            var loadedVariableNameList = blockContainerThis.getKernelLoadedVariableNameList();
            var loadedVariableNameList_arg1 = [ ...loadedVariableNameList ];
            var loadedVariableNameList_arg4 = [ ...loadedVariableNameList ];
            var loadedVariableNameList_arg3 = [ ...Object.values( FOR_BLOCK_ARG3_TYPE) ];
            /** 0,1,2,3 */
            var loadedVariableNameList_arg5 = [ ...loadedVariableNameList, '0','1','2','3','4','5','6','7','8','9'];
            /** 9 */
            var loadedVariableNameList_arg6 = [ ...loadedVariableNameList, '0','1','2','3','4','5','6','7','8','9'];
            /** 내부변수 */
            var loadedVariableNameList_arg2 = [ ...loadedVariableNameList, '0','1','2','3','4','5','6','7','8','9'];
            var loadedVariableNameList_arg7 = [ ...loadedVariableNameList, '0','1','2','3','4','5','6','7','8','9'];
            /* ------------- For html dom 생성 ------------------ */

            /** For Type 설정 */
            var forParamState = thisBlock.getState(STATE_forParam);  

            const { arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg3Default, arg3InputStr } = forParamState;

            var sbforParam = new sb.StringBuilder();
            sbforParam.appendFormatLine("<div class='{0}' style='{1}'>", VP_CLASS_STYLE_FLEX_ROW_BETWEEN, 
                                                                        'margin-top: 5px;');
            sbforParam.appendLine("</div>");
            var sbforParamDom1 = sbforParam.toString();
            var $sbforParamDom1 = $(sbforParamDom1);

            var sbforName = new sb.StringBuilder();
            sbforName.appendFormatLine("<div class='{0} {1} {2}'", VP_CLASS_STYLE_FLEX_COLUMN_CENTER, VP_CLASS_APIBLOCK_OPTION_NAME, 'vp-orange-text');
            sbforName.appendFormatLine("style='{0} '>", '');
            sbforName.appendFormatLine("{0}", 'for');
            sbforName.appendLine("</div>");
            $sbforParamDom1.append(sbforName.toString());

            var sbforVariable = new sb.StringBuilder();
            sbforVariable.appendFormatLine("<div class='{0} {1}'>", VP_CLASS_STYLE_FLEX_ROW_BETWEEN 
                                                                  , VP_CLASS_STYLE_WIDTH_80PERCENT);

            /** For arg4 - Index */
            if (arg3 == FOR_BLOCK_ARG3_TYPE.VARIABLE
                || arg3 == FOR_BLOCK_ARG3_TYPE.TYPING) {
                var sbforParamArg1Input4 = MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_FOR_ARG_4 + uuid
                    , arg4
                    , loadedVariableNameList_arg4
                    , VP_CLASS_STYLE_WIDTH_100PERCENT
                    , 'Index'
                    , function(selectedValue) {
                        bindSelectValueEventFunc_for(selectedValue, 
                            FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG4);
                });
                sbforVariable.appendLine(sbforParamArg1Input4);
            }

            /** For arg1 */
            var sbforParamArg1Input = MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_FOR_ARG_1 + uuid
                                                                    ,arg1
                                                                    ,loadedVariableNameList_arg1
                                                                    , VP_CLASS_STYLE_WIDTH_100PERCENT
                                                                    , 'Item'
                                                                    , function(selectedValue) {
                                                                        bindSelectValueEventFunc_for(selectedValue, 
                                                                            FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG1);
                                                                    });

            sbforVariable.appendLine(sbforParamArg1Input);
            sbforVariable.appendLine("</div>");
            $sbforParamDom1.append(sbforVariable.toString());
            

            var sbforParam2 = new sb.StringBuilder();
            sbforParam2.appendFormatLine("<div class='{0}' style='{1}'>", VP_CLASS_STYLE_FLEX_ROW_BETWEEN, 
                                                                        'margin-top: 5px;');
            sbforParam2.appendLine("</div>");
            var sbforParamDom2 = sbforParam2.toString();
            var $sbforParamDom2 = $(sbforParamDom2);

            /** For in */
            var sbforParamIn = new sb.StringBuilder();
            sbforParamIn.appendFormatLine("<div class='{0} {1} {2}'", VP_CLASS_STYLE_FLEX_COLUMN_CENTER, VP_CLASS_APIBLOCK_OPTION_NAME, 'vp-orange-text');
            sbforParamIn.appendFormatLine("style='{0} {1}'>", 'width: 5%;','');
            sbforParamIn.appendFormatLine("{0}", 'in');
            sbforParamIn.appendLine("</div>");
            $sbforParamDom2.append(sbforParamIn.toString());
            sbforParamIn.clear();

            var sbforArgContainer = new sb.StringBuilder();
            sbforArgContainer.appendFormatLine("<div class='{0} {1}'>", VP_CLASS_STYLE_FLEX_ROW_BETWEEN 
                                                                        , VP_CLASS_STYLE_WIDTH_80PERCENT);
            // var sbforParamArg3 = MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_FOR_ARG_3 + uuid
            //                                                     , arg3
            //                                                     , loadedVariableNameList_arg3
            //                                                     , VP_CLASS_STYLE_WIDTH_40PERCENT
            //                                                     , 'Method'
            //                                                     , function(selectedValue) {
            //                                                         bindSelectValueEventFunc_for(selectedValue, 
            //                                                             FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3);
            //                                                     });    
            var sbforParamArg3 = MakeOptionSelectBox(VP_ID_APIBLOCK_OPTION_FOR_ARG_3 + uuid
                , VP_CLASS_STYLE_WIDTH_100PERCENT
                , arg3
                , loadedVariableNameList_arg3);

            sbforArgContainer.appendLine(sbforParamArg3);   
            $sbforParamDom2.append(sbforArgContainer.toString());
            
            // next line div
            var sbforParam3 = new sb.StringBuilder();
            sbforParam3.appendFormatLine("<div class='{0}' style='{1}'>", VP_CLASS_STYLE_FLEX_ROW_BETWEEN, 
                                                                        'margin-top: 5px;');
            sbforParam3.appendLine("</div>");
            var sbforParamDom3 = sbforParam3.toString();
            var $sbforParamDom3 = $(sbforParamDom3);

            var sbforParamLine = new sb.StringBuilder();
            sbforParamLine.appendFormatLine("<div class='{0}'", VP_CLASS_STYLE_FLEX_COLUMN_CENTER);
            sbforParamLine.appendFormatLine("style='{0} {1}'>", 'width: 5%;','');
            sbforParamLine.appendLine("</div>");
            $sbforParamDom3.append(sbforParamLine.toString());
            
            sbforArgContainer.clear();    
            sbforArgContainer.appendFormatLine("<div class='{0} {1}'>", VP_CLASS_STYLE_FLEX_ROW_BETWEEN 
                                                                        , VP_CLASS_STYLE_WIDTH_80PERCENT);
            
            // argContainer header
            if (arg3 == FOR_BLOCK_ARG3_TYPE.RANGE) {
                sbforArgContainer.appendFormatLine("<div class='{0} {1} {2}'>{3}</div>", VP_CLASS_STYLE_FLEX_COLUMN_CENTER 
                                                    , VP_CLASS_STYLE_WIDTH_100PERCENT, 'vp-orange-text'
                                                    , 'Start');
                sbforArgContainer.appendFormatLine("<div class='{0} {1} {2}'>{3}</div>", VP_CLASS_STYLE_FLEX_COLUMN_CENTER 
                                                    , VP_CLASS_STYLE_WIDTH_100PERCENT, ''
                                                    , 'Stop');
                sbforArgContainer.appendFormatLine("<div class='{0} {1} {2}'>{3}</div>", VP_CLASS_STYLE_FLEX_COLUMN_CENTER 
                                                    , VP_CLASS_STYLE_WIDTH_100PERCENT, ''
                                                    , 'Step');
            }
            if (arg3 == FOR_BLOCK_ARG3_TYPE.VARIABLE) {
                sbforArgContainer.appendFormatLine("<div class='{0} {1} {2}'>{3}</div>", VP_CLASS_STYLE_FLEX_COLUMN_CENTER 
                                                    , VP_CLASS_STYLE_WIDTH_50PERCENT, 'vp-orange-text'
                                                    , 'Data Type');
                sbforArgContainer.appendFormatLine("<div class='{0} {1} {2}'>{3}</div>", VP_CLASS_STYLE_FLEX_COLUMN_CENTER 
                                                    , VP_CLASS_STYLE_WIDTH_50PERCENT, 'vp-orange-text'
                                                    , 'Data');
            }
            sbforArgContainer.appendLine("</div>");
            $sbforParamDom3.append(sbforArgContainer.toString());
            
            // next line div
            var sbforParam4 = new sb.StringBuilder();
            sbforParam4.appendFormatLine("<div class='{0}' style='{1}'>", VP_CLASS_STYLE_FLEX_ROW_BETWEEN, 
                                                                        'margin-top: 5px;');
            sbforParam4.appendLine("</div>");
            var sbforParamDom4 = sbforParam4.toString();
            var $sbforParamDom4 = $(sbforParamDom4);

            $sbforParamDom4.append(sbforParamLine.toString());
            
            sbforArgContainer.clear();
            sbforArgContainer.appendFormatLine("<div class='{0} {1}'>", VP_CLASS_STYLE_FLEX_ROW_BETWEEN 
                                                                        , VP_CLASS_STYLE_WIDTH_80PERCENT);
            // argContainer inputs
            if (arg3 == FOR_BLOCK_ARG3_TYPE.RANGE) {
                var sbforParamArg5 = MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_FOR_ARG_5 + uuid
                                                                        ,arg5
                                                                        ,loadedVariableNameList_arg5
                                                                        , VP_CLASS_STYLE_WIDTH_100PERCENT
                                                                        , STR_VALUE
                                                                        , function(selectedValue) {
                                                                            bindSelectValueEventFunc_for(selectedValue, 
                                                                                FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG5);
                });
                sbforArgContainer.appendLine(sbforParamArg5);

                var sbforParamArg2 = MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_FOR_ARG_2 + uuid
                    ,arg2
                    ,loadedVariableNameList_arg2
                    , VP_CLASS_STYLE_WIDTH_100PERCENT
                    , STR_VALUE
                    , function(selectedValue) {
                        bindSelectValueEventFunc_for(selectedValue, 
                            FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG2);
                });
                sbforArgContainer.appendLine(sbforParamArg2);

                var sbforParamArg6 = MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_FOR_ARG_6 + uuid
                    , arg6
                    , loadedVariableNameList_arg6
                    , VP_CLASS_STYLE_WIDTH_100PERCENT
                    , STR_VALUE
                    , function(selectedValue) {
                        bindSelectValueEventFunc_for(selectedValue, 
                            FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG6);
                });
                sbforArgContainer.appendLine(sbforParamArg6);
            }            

            if (arg3 == FOR_BLOCK_ARG3_TYPE.VARIABLE) {
                var dataTypes = ['DataFrame', 'Series', 'nparray', 'list', 'str'];
                var varSelector = new vpVarSelector(dataTypes, 'DataFrame', true, true);
                varSelector.setComponentId(VP_ID_APIBLOCK_OPTION_FOR_ARG_8 + uuid);
                varSelector.addBoxClass(VP_CLASS_STYLE_WIDTH_100PERCENT);
                varSelector.addBoxClass(VP_CLASS_STYLE_FLEX_ROW_BETWEEN);
                varSelector.addTypeClass(VP_CLASS_STYLE_WIDTH_50PERCENT);
                varSelector.addVarClass(VP_CLASS_STYLE_WIDTH_50PERCENT);
                varSelector.setValue(arg8);
                sbforArgContainer.appendLine(varSelector.render());
            }
            
            if (arg3 == FOR_BLOCK_ARG3_TYPE.TYPING) {
                var sbforParamArg7 = MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_FOR_ARG_7 + uuid
                                                                    ,arg7
                                                                    ,loadedVariableNameList_arg7
                                                                    , VP_CLASS_STYLE_WIDTH_100PERCENT
                                                                    , 'User Input'
                                                                    , function(selectedValue) {
                                                                        bindSelectValueEventFunc_for(selectedValue, 
                                                                            FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG7);
                                                                    });
                sbforArgContainer.appendLine(sbforParamArg7);
            }     

            if (arg3 == FOR_BLOCK_ARG3_TYPE.DEFAULT) {
                var sbforParamArg7 = MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_FOR_ARG_3_DEFAULT + uuid
                                                                    ,arg3Default
                                                                    ,loadedVariableNameList_arg7
                                                                    , VP_CLASS_STYLE_WIDTH_40PERCENT
                                                                    , STR_VALUE
                                                                    , function(selectedValue) {
                                                                        bindSelectValueEventFunc_for(selectedValue, 
                                                                            FOR_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3_DEFAULT);
                                                                    });
                sbforArgContainer.appendLine(sbforParamArg7);
            }

            sbforArgContainer.appendLine("</div>");
            $sbforParamDom4.append(sbforArgContainer.toString());

            optionContainerDom.append($sbforParamDom1);
            optionContainerDom.append($sbforParamDom2);
            optionContainerDom.append($sbforParamDom3);
            optionContainerDom.append($sbforParamDom4);

            /** bottom block option 탭에 렌더링된 dom객체 생성 */
            $(optionPageSelector).append(optionContainerDom);

            $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_1 + uuid).val(arg1);
            $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_2 + uuid).val(arg2);
            $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_3 + uuid).val(arg3);
            $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_4 + uuid).val(arg4);

            /** For arg4 */
            // if (arg3 == FOR_BLOCK_ARG3_TYPE.ENUMERATE) {
            //     $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_4 + uuid).addClass(VP_CLASS_STYLE_OPACITY_1);
            //     $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_4 + uuid).css(STR_MARGIN_LEFT,'5px');
            // } else {
            //     $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_4 + uuid).addClass(VP_CLASS_STYLE_OPACITY_0);
            // }

            $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_5 + uuid).val(arg5);
            $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_6 + uuid).val(arg6);
            $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_7 + uuid).val(arg7);
            $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_FOR_ARG_8 + uuid).val(arg8);

            return optionContainerDom;
        }

        return renderThisComponent();
    };

    return InitForBlockOption;
});
