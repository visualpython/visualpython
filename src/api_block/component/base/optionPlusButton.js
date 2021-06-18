define([
    'jquery'

    , 'nbextensions/visualpython/src/common/StringBuilder'
    
], function ( $, sb) {

    var MakeOptionPlusButton = function(id, title, className) {
        var sbOptionPlusButton = new sb.StringBuilder();
        sbOptionPlusButton.appendFormatLine("<div id='{0}' class='{1}'> ", id , className);
        sbOptionPlusButton.appendFormatLine("<div class='{0}'> ", 'vp-apiblock-option-plus-button');

        sbOptionPlusButton.appendFormatLine("{0}", title);
        sbOptionPlusButton.appendLine("</div>");
        sbOptionPlusButton.appendLine("</div>");

        // sbOptionPlusButton =  $(sbOptionPlusButton.toString());
        sbOptionPlusButton = sbOptionPlusButton.toString()
        return sbOptionPlusButton;
    }
    return MakeOptionPlusButton;
});
