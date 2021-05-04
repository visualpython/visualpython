define([
    'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'


    , '../../api.js'    
    , '../../constData.js'
    , '../base/index.js'

], function ( $, vpCommon
    
                , api,constData, baseComponent ) {
    const {  CreateOneArrayValueAndGet
            , UpdateOneArrayValueAndGet
            , DeleteOneArrayValueAndGet

            , SetTextareaLineNumber_apiBlock
            
            , GenerateLambdaCode } = api;

    const {STR_CHANGE_KEYUP_PASTE
            , STR_CLICK
            , STR_VARIABLE

            , LAMBDA_BLOCK_SELECT_VALUE_ARG_TYPE

            , VP_ID_PREFIX 
            , VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_1
            , VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_2
            , VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_3

            , VP_CLASS_STYLE_WIDTH_20PERCENT
            , VP_CLASS_STYLE_WIDTH_30PERCENT

            , STATE_lambdaArg1
            , STATE_lambdaArg2List
            , STATE_lambdaArg3
    
             } = constData;

    const { MakeOptionContainer
            , MakeVpSuggestInputText_apiblock
            , MakeLineNumberTextArea_apiblock } = baseComponent;

    var InitLambdaBlockOption = function(thisBlock, optionPageSelector) {
        var uuid = thisBlock.getUUID();
        var blockContainerThis = thisBlock.getBlockContainerThis();

        var lambdaArg2ListState = thisBlock.getState(STATE_lambdaArg2List);
        lambdaArg2ListState.forEach((lambdaArg2, index) => {

            /**
             * @event_function
             * Lambda arg2 변경 이벤트 함수
             */
            $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_2 + index + uuid);
            $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_2 + index + uuid, function(event) {
                var lambdaArg2ListState = thisBlock.getState(STATE_lambdaArg2List);

                var updatedValue =  $(this).val();
 
                lambdaArg2ListState = UpdateOneArrayValueAndGet(lambdaArg2ListState, index, updatedValue);
                thisBlock.setState({
                    [STATE_lambdaArg2List]: lambdaArg2ListState
                });

                var lambdaCode = GenerateLambdaCode(thisBlock);
                thisBlock.writeCode(lambdaCode);
  
                event.stopPropagation();
            });
        });

       /** 
         * @event_function
         * Lambda arg2 생성 이벤트 함수 바인딩 
         */
        $(document).off(STR_CLICK, vpCommon.wrapSelector(`.vp-block-lambda-arg2-plus-button-${uuid}`));
        $(document).on(STR_CLICK, vpCommon.wrapSelector(`.vp-block-lambda-arg2-plus-button-${uuid}`), function(event) {
            
            var lambdaArg2ListState = thisBlock.getState(STATE_lambdaArg2List);
            var lambdaArg2ListLength = lambdaArg2ListState.length;

            var newLambdaArg2 = '';

            lambdaArg2ListState = CreateOneArrayValueAndGet(lambdaArg2ListState, lambdaArg2ListLength, newLambdaArg2);
            thisBlock.setState({
                lambdaArg2List: lambdaArg2ListState
            });

            var lambdaCode = GenerateLambdaCode(thisBlock);
            thisBlock.writeCode(lambdaCode);

            blockContainerThis.renderBlockOptionTab();

            event.stopPropagation();
        });


        /** 
         * @event_function
         * Lambda arg2 삭제 이벤트 함수 바인딩 
         */
        $(document).off(STR_CLICK, vpCommon.wrapSelector(`.vp-block-lambda-arg2-delete-button-${uuid}`));
        $(document).on(STR_CLICK, vpCommon.wrapSelector(`.vp-block-lambda-arg2-delete-button-${uuid}`), function(event) {

            var lambdaArg2ListState = thisBlock.getState(STATE_lambdaArg2List);
            var lambdaArg2ListLength = lambdaArg2ListState.length;
            
            lambdaArg2ListState = DeleteOneArrayValueAndGet(lambdaArg2ListState, lambdaArg2ListLength-1);
            thisBlock.setState({
                lambdaArg2List: lambdaArg2ListState
            });

            var lambdaCode = GenerateLambdaCode(thisBlock);
            thisBlock.writeCode(lambdaCode);

            blockContainerThis.renderBlockOptionTab();

            event.stopPropagation();
        });

         /**
          * @event_function
          * Lambda arg3변경 이벤트 함수
          */
        $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_3 + uuid);
        $(document).on(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_3 + uuid, function(event) {
            
            var updatedValue =  $(this).val();
            thisBlock.setState({
                lambdaArg3: updatedValue
            });

            var lambdaCode = GenerateLambdaCode(thisBlock);
            thisBlock.writeCode(lambdaCode);

            event.stopPropagation();
        });

        /**
         * @event_function
         * Lambda 리턴 변수(arg1) 이름 변경 이벤트 함수
         */
        $(document).off(STR_CHANGE_KEYUP_PASTE, VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_1 + uuid);
        $(document).on(STR_CHANGE_KEYUP_PASTE,VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_1 + uuid, function(event) {
            thisBlock.setState({
                lambdaArg1: $(this).val()
            });

            var lambdaCode = GenerateLambdaCode(thisBlock);
            thisBlock.writeCode(lambdaCode);

            event.stopPropagation();
        });

        var bindSelectValueEventFunc_lambda = function(selectedValue, index, argType) {
      
            if (LAMBDA_BLOCK_SELECT_VALUE_ARG_TYPE.ARG1 == argType) {
                thisBlock.setState({
                    lambdaArg1: selectedValue
                });
            
            } else if (LAMBDA_BLOCK_SELECT_VALUE_ARG_TYPE.ARG2 == argType) {
                var lambdaArg2ListState = thisBlock.getState(STATE_lambdaArg2List);
                lambdaArg2ListState = UpdateOneArrayValueAndGet(lambdaArg2ListState, index, selectedValue);
                thisBlock.setState({
                    [STATE_lambdaArg2List]: lambdaArg2ListState
                });

            } else if (LAMBDA_BLOCK_SELECT_VALUE_ARG_TYPE.ARG3 == argType) {
                thisBlock.setState({
                    lambdaArg3: selectedValue
                });

            } 

            var lambdaCode = GenerateLambdaCode(thisBlock);
            thisBlock.writeCode(lambdaCode);
        }

        /** Lambda option 렌더링 */
        var renderThisComponent = function() {
            var loadedVariableNameList = blockContainerThis.getKernelLoadedVariableNameList();
            var loadedVariableNameList_arg1 = [ ...loadedVariableNameList, `var`];

            var lambdaArg2ListState = thisBlock.getState(STATE_lambdaArg2List);
            var lambdaArg3State = thisBlock.getState(STATE_lambdaArg3);

            var lambdaBlockOption = MakeOptionContainer(thisBlock);
            var sbforParamArg1 = MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_1 + uuid
                                                                ,lambdaArg2ListState
                                                                ,loadedVariableNameList_arg1
                                                                , VP_CLASS_STYLE_WIDTH_30PERCENT
                                                                , 'Return Var'
                                                                , function(selectedValue) {
                                                                    bindSelectValueEventFunc_lambda(selectedValue,
                                                                        0 
                                                                        ,LAMBDA_BLOCK_SELECT_VALUE_ARG_TYPE.ARG1);
                                                                });

            var lambdaArg1Dom = $(`<div class='vp-apiblock-style-flex-row'
                                        style='margin-top:5px;'>
                                        ${sbforParamArg1}
                           
                                        <span class='vp-apiblock-style-flex-column-center'
                                              style='margin-left: 5px;
                                                     margin-right: 5px;'> 
                                            =
                                        </span>

                                    </div>`);
  
            var lambdaConditionContainer2 = $(`<div class='vp-apiblock-style-flex-row-wrap'
                                                    style='margin-top: 5px;'></div>`);        
            var lambdaConditionContainer3 = $(`<div id='vp_apiblock_lambda_arg3_container'
                                                    class='vp-apiblock-style-flex-row'
                                                    style='margin-top: 5px;'></div>`);
                                           
            var lambdaArg2ContainerDom = $(`<div class='vp-apiblock-style-flex-row'>

                                                <span class='vp-apiblock-style-flex-column-center'
                                                      style='margin-left: 5px;'>
                                                      lambda
                                                </span>

                                                <button class='vp-apiblock-option-button-type2
                                                               vp-block-lambda-arg2-plus-button-${uuid}'
                                                        style='margin-left: 5px;'>
                                                    +
                                                </button>

                                                <button class='vp-apiblock-option-button-type2
                                                               vp-block-lambda-arg2-delete-button-${uuid}'
                                                        style='margin-left: 5px; margin-right: 5px;'>
                                                    -
                                                </button>
                                                     
                                            </div>`);

            lambdaConditionContainer2.append(lambdaArg2ContainerDom);
            lambdaArg2ListState.forEach((lambdaArg2, arg2Index) => {

                var loadedVariableNameList_arg2 = [ ...loadedVariableNameList, `x${arg2Index + 1}`];
               
                if ( arg2Index != 0 ) {
                    var comma = $(`<span class='vp-apiblock-style-flex-column-center'
                                        style='margin-left: 5px; margin-right: 5px;'>
                                        ,
                                    </span>`);
                    lambdaConditionContainer2.append(comma); 
                } 

                var sbforParamArg2 = MakeVpSuggestInputText_apiblock(VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_2 + arg2Index + uuid
                                                                    ,lambdaArg2
                                                                    ,loadedVariableNameList_arg2
                                                                    , VP_CLASS_STYLE_WIDTH_20PERCENT
                                                                    , STR_VARIABLE + ' ' +arg2Index
                                                                    , function(selectedValue) {
                                                                        bindSelectValueEventFunc_lambda(selectedValue,
                                                                            arg2Index 
                                                                            ,LAMBDA_BLOCK_SELECT_VALUE_ARG_TYPE.ARG2);
                                                                    });
    
                lambdaConditionContainer2.append(sbforParamArg2); 
            });      
     
            var lastBracketDom = $(`<span class='vp-apiblock-style-flex-column-center'
                                          style='margin-left: 5px;'>
                                        :
                                    </span>`);

            lambdaConditionContainer2.append(lastBracketDom);

            var lineNumberTextArea = MakeLineNumberTextArea_apiblock(VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_3 + uuid,lambdaArg3State)
            lambdaConditionContainer3.append( lineNumberTextArea);

            /** Lambda option arg1 리턴 변수 렌더링 생성 */
            lambdaBlockOption.append(lambdaArg1Dom);
      
            /** Lambda condition 렌더링 생성 */
            lambdaBlockOption.append(lambdaConditionContainer2);
            lambdaBlockOption.append(lambdaConditionContainer3);

            $(optionPageSelector).append(lambdaBlockOption);

            var lambdaArg1 = thisBlock.getState(STATE_lambdaArg1);
            var lambdaArg2ListState = thisBlock.getState(STATE_lambdaArg2List);
            var lambdaArg3State = thisBlock.getState(STATE_lambdaArg3);

            $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_1 + uuid).val(lambdaArg1);

            lambdaArg2ListState.forEach((arg2, arg2Index) => {
                $(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_2 + arg2Index + uuid).val(arg2);
            });

            SetTextareaLineNumber_apiBlock(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_3 + uuid, lambdaArg3State);
        
            return lambdaBlockOption;
        }

        return renderThisComponent();
    }

    return InitLambdaBlockOption;
});