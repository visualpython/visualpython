
define([

    'nbextensions/visualpython/src/common/component/vpLineNumberTextArea'
    
], function ( vpLineNumberTextArea ) {
    
    /** src/common에 있는 vpLineNumberTextArea을 api block에 맞게 커스텀 */
    var vpLineNumberTextArea_apiblock = function(id, codeState, styleObj) {
        var lineNumberTextArea = new vpLineNumberTextArea.vpLineNumberTextArea( id, 
                                                                                codeState);     
                          
        lineNumberTextArea.setHeight('250px');        
        var lineNumberTextAreaStr = lineNumberTextArea.toTagString();
        return lineNumberTextAreaStr;
    }

    return vpLineNumberTextArea_apiblock;
});