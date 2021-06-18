define([
    'jquery'
    , 'nbextensions/visualpython/src/common/StringBuilder'
   
    , '../../constData.js'

], function ( $, sb , constData ){

    const { VP_CLASS_STYLE_FLEX_ROW_CENTER
            , VP_CLASS_STYLE_FLEX_COLUMN_CENTER } = constData;

    var MakeOptionContainer = function(block) {
        var sbOptionContainer = new sb.StringBuilder();
        sbOptionContainer.appendFormatLine("<div class='{0}'", VP_CLASS_STYLE_FLEX_ROW_CENTER);
        sbOptionContainer.appendFormatLine("     style='{0}' >", 'padding: 0.5rem;');
        sbOptionContainer.appendFormatLine("<div class='{0} {1} {2}' >", 'vp-apiblock-option', 
                                                                      VP_CLASS_STYLE_FLEX_COLUMN_CENTER,
                                                                      block.getUUID());
        sbOptionContainer.appendLine("</div>");
        sbOptionContainer.appendLine("</div>");
        sbOptionContainer = $(sbOptionContainer.toString());
        // console.log('sbOptionContainer',sbOptionContainer);
        return sbOptionContainer.find('.vp-apiblock-option');
    }

    return MakeOptionContainer;
});