define([
    'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'

    , '../../constData.js'
], function ( $, vpCommon, vpConst
              , constData ) {

    const { STR_CHANGE_KEYUP_PASTE
            , STATE_codeLine } = constData;

    var InitTextBlockOption = function(thisBlock, optionPageSelector) {
        var importPakageUUID = thisBlock.getImportPakage().uuid;
        /**
            *  @event_function
            *  code 변경 이벤트 함수 
        */
      
        $(document).off(STR_CHANGE_KEYUP_PASTE, vpCommon.formatString(".{0} #{1}{2}", importPakageUUID, vpConst.VP_ID_PREFIX, "markdownEditor"));
        $(document).on(STR_CHANGE_KEYUP_PASTE, vpCommon.formatString(".{0} #{1}{2}", importPakageUUID, vpConst.VP_ID_PREFIX, "markdownEditor"), function(event) {
            var inputValue = $(this).val();
            thisBlock.setState({
                [STATE_codeLine]: inputValue
            });
            thisBlock.blockContainerThis.setOptionPreviewBox(thisBlock);

            event.stopPropagation();
        });

        /** Text option 렌더링 */
        var renderThisComponent = function() {

            var blockOptionPageDom = thisBlock.getBlockOptionPageDom();
            $(optionPageSelector).append(blockOptionPageDom);

            var textStr = thisBlock.getState(STATE_codeLine);
            const textarea = thisBlock.getBlockOptionPageDom().find(`#vp_markdownEditor`).get(0);
            $(textarea).val(textStr);
            
            return blockOptionPageDom;
        }

        return renderThisComponent();
    }

    return InitTextBlockOption;
});