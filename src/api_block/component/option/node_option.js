define([
    'jquery'

    , 'codemirror/lib/codemirror'

    , '../../constData.js'
    , '../base/index.js'

], function ( $,  codemirror, 

              constData, baseComponent ) {
                  
    const {  STATE_codeLine } = constData;
    const { MakeOptionContainer } = baseComponent;

    var InitNodeBlockOption = function(thisBlock, optionPageSelector) {
        var blockContainerThis = thisBlock.getBlockContainerThis();

        /** node option 렌더링 */
        var renderThisComponent = function() {
            var nodeBlockOption = MakeOptionContainer(thisBlock);
            thisBlock.writeCode(thisBlock.getState(STATE_codeLine));

            var codeLineList = blockContainerThis.previewCode(thisBlock);

            var nodePageDom = document.createElement('div');
            $(nodePageDom).attr('class', 'vp-apiblock-nodepage');

            var textareaDom = document.createElement('textarea');
            $(textareaDom).val(codeLineList);
            $(textareaDom).attr('id','vp_userCode');
            $(textareaDom).attr('name','code');
            $(textareaDom).attr('style','display: none');
       
            // nodeBlockOption.append(`<p style='font-weight:700;'>Node</p>`)
            $(nodePageDom).append(textareaDom);
            nodeBlockOption.append(nodePageDom);

            var codemirrorCode = codemirror.fromTextArea(textareaDom, {
                mode: {
                    name: 'python',
                    version: 3,
                    singleLineStringErrors: false
                },  // text-cell(markdown cell) set to 'htmlmixed'
                indentUnit: 4,
                matchBrackets: true,
                readOnly:true,
                autoRefresh: true,
                lineWrapping: false, // text-cell(markdown cell) set to true
                indentWithTabs: true,
                theme: "ipython",
                extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
            });
  
            $(optionPageSelector).append(nodeBlockOption);
            codemirrorCode.setValue($(textareaDom).val());

            return nodeBlockOption;
        }
        return renderThisComponent();
    }       
    return InitNodeBlockOption;
});