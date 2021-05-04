define([
    'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'

    
    , '../../api.js'    
    , '../../constData.js'
    , '../base/index.js'
    
    , 'codemirror/lib/codemirror'
    , 'codemirror/mode/python/python'
    , 'notebook/js/codemirror-ipython'
    , 'codemirror/addon/display/placeholder'

], function ( $, vpCommon
  
              , api
              , constData
              , baseComponent
              
              , CodeMirror
              , cmpython
              , cmip) {

    const { SetTextareaLineNumber_apiBlock
            , ShowCodeBlockCode } = api;

    const { STR_CHANGE_KEYUP_PASTE

            , STR_EMPTY

            , STR_INPUT_YOUR_CODE
            , STR_COLOR

            , STATE_codeLine
            , COLOR_BLACK
            , COLOR_GRAY_input_your_code

            , VP_ID_PREFIX
            , VP_ID_APIBLOCK_OPTION_CODE_ARG

            , VP_CLASS_PREFIX
            , VP_CLASS_APIBLOCK_BLOCK_HEADER } = constData;
    const { MakeOptionContainer
            , MakeLineNumberTextArea_apiblock } = baseComponent;
    /**
     * @param {Block} thisBlock Block
     * @param {string} optionPageSelector  Jquery 선택자
     */
    var InitCodeBlockOption = function(thisBlock, optionPageSelector) {
        var uuid = thisBlock.getUUID();

        /**
         *  @event_function
         *  code 변경 이벤트 함수 
         */
        // $(document).off(STR_CHANGE_KEYUP_PASTE,  vpCommon.wrapSelector(vpCommon.formatString("#{0}",VP_ID_APIBLOCK_OPTION_CODE_ARG + uuid)));
        // $(document).on(STR_CHANGE_KEYUP_PASTE, vpCommon.wrapSelector(vpCommon.formatString("#{0}",VP_ID_APIBLOCK_OPTION_CODE_ARG + uuid)), function(event) {
        //     var inputValue = $(this).val();
        //     thisBlock.setState({
        //         [STATE_codeLine]: inputValue
        //     });
        //     inputValue = ShowCodeBlockCode(thisBlock);
        //     /** 어떤 데이터도 입력되지 않을 때 */
        //     if (inputValue == STR_EMPTY) {
        //         thisBlock.writeCode(STR_INPUT_YOUR_CODE);
        //         $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).css(STR_COLOR, COLOR_GRAY_input_your_code);
  
        //     /** 데이터가 입력되었을 때 */
        //     } else {
        //         thisBlock.writeCode(inputValue);
        //         $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).css(STR_COLOR, COLOR_BLACK);
        //     }

        //     event.stopPropagation();
        // });


        /** Code option 렌더링 */
        var renderThisComponent = function() {
            /** ------------ get state -------------*/
            var codeState = thisBlock.getState(STATE_codeLine);
            
            /* ------------- string builder render -------------- */
            var optionContainer = MakeOptionContainer(thisBlock);
            // var lineNumberTextAreaStr = MakeLineNumberTextArea_apiblock(VP_ID_APIBLOCK_OPTION_CODE_ARG + uuid, 
            //                                                             codeState); 
            thisBlock.writeCode(codeState);

            var codePageDom = document.createElement('div');
            $(codePageDom).attr('class', 'vp-apiblock-codepage cm-s-ipython');

            var textareaDom = document.createElement('textarea');
            $(textareaDom).val(codeState);
            $(textareaDom).attr('id','vp_apiCode');
            $(textareaDom).attr('name','code');
            $(textareaDom).attr('style','display: none;');
     
            // optionContainer.append(lineNumberTextAreaStr);
            $(codePageDom).append(textareaDom);
            optionContainer.append(codePageDom);

            /** bottom block option 탭에 렌더링된 dom객체 생성 */
            $(optionPageSelector).append(optionContainer);

            var cmInstance = CodeMirror.fromTextArea(textareaDom, {
                mode: {
                    name: 'python',
                    version: 3,
                    singleLineStringErrors: false
                },  // text-cell(markdown cell) set to 'htmlmixed'
                indentUnit: 4,
                matchBrackets: true,
                lineNumbers: true,
                autoRefresh: true,
                lineWrapping: true, // text-cell(markdown cell) set to true
                theme: "default",
                extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
            });
            cmInstance.setValue($(textareaDom).val());
            cmInstance.focus();
            // 가장 마지막 부분에 커서 이동
            cmInstance.setCursor(cmInstance.lineCount(), 0);

            /**
             * CodeMirror change event
             */
            cmInstance.on('change', function(cm, change) {
                var inputValue = cm.getValue();
                thisBlock.setState({
                    [STATE_codeLine]: inputValue
                });
                inputValue = ShowCodeBlockCode(thisBlock);
                thisBlock.blockContainerThis.setOptionPreviewBox(thisBlock);
                
                /** 어떤 데이터도 입력되지 않을 때 */
                if (inputValue == STR_EMPTY) {
                    thisBlock.writeCode(STR_INPUT_YOUR_CODE);
                    $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).css(STR_COLOR, COLOR_GRAY_input_your_code);
    
                /** 데이터가 입력되었을 때 */
                } else {
                    thisBlock.writeCode(inputValue);
                    $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + uuid).css(STR_COLOR, COLOR_BLACK);
                }

                event.stopPropagation();
            })

            // save code mirror editor instance
            $(textareaDom).attr('data-codemirrorEditor', cmInstance);


            /** 처음 Code Option 생성시,
             *  사용자가 입력한 값을 토대로
             *  라인 넘버를 생성하기 위해서 커스터 마이징한 api 사용 */
            // SetTextareaLineNumber_apiBlock(VP_ID_PREFIX + VP_ID_APIBLOCK_OPTION_CODE_ARG + uuid, codeState); 

            return optionContainer;
        }

        return renderThisComponent();
    }

    return InitCodeBlockOption;
});