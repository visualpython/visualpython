define ([    
    'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/StringBuilder'
], function( vpCommon, sb ) {

    /** CALL(호출) 변수를 입력하는 <div> 블럭 동적 렌더링
     * @param {numpyPageRenderer this} numpyPageRendererThis 
     */
    var _renderCallVarBlock = function(numpyPageRendererThis) {
        var uuid = 'u' + vpCommon.getUUID();
        var numpyPageRendererThis = numpyPageRendererThis;
        var numpyStateGenerator = numpyPageRendererThis.getStateGenerator();
        var sbTagString = new sb.StringBuilder();
        var requiredPageSelector = numpyPageRendererThis.getRequiredPageSelector();
        var callVariableState = numpyStateGenerator.getState('callVariable');
        
        sbTagString.appendLine( `<tr class='vp-numpy-option-block'>`);
        sbTagString.appendLine(`<th>Call Variable</th>`)
        sbTagString.appendLine( `<td>`);
        sbTagString.appendFormatLine("<input type='text' class='{0}' id='{1}' placeholder='{2}' value='{3}'/>", 
                                            'vp-numpy-input',`vp_numpyCallVarInput-${uuid}`, 'input variable'
                                            ,callVariableState);

        sbTagString.appendLine( `</td>`);
        sbTagString.appendLine( `<tr>`);

        var callVarBlock = $(sbTagString.toString()); 
        var importPackageThis = numpyPageRendererThis.getImportPackageThis();
        var numpyStateGenerator = numpyPageRendererThis.getStateGenerator();
        var requiredPage = $(importPackageThis.wrapSelector(requiredPageSelector));
        requiredPage.append(callVarBlock);

        /** call 변수 입력 */
        $(importPackageThis.wrapSelector(`#vp_numpyCallVarInput-${uuid}`)).on('change keyup paste', function() {
            numpyStateGenerator.setState({
                callVariable: $(this).val()
            });
        });
    }

    return _renderCallVarBlock;
});