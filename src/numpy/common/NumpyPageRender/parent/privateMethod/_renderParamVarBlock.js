define ([    
    'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/StringBuilder'
], function( vpCommon, sb ) {
    /** paramVariable 변수 입력 <div> 블록을 동적 렌더링하는 메소드
     * @param {numpyPageRenderer this} numpyPageRendererThis 
     */
    var _renderParamVarBlock = function(numpyPageRendererThis, title) {
        var uuid = 'u' + vpCommon.getUUID();
        var numpyPageRendererThis = numpyPageRendererThis;
        var importPackageThis = numpyPageRendererThis.getImportPackageThis();
        var numpyStateGenerator = numpyPageRendererThis.getStateGenerator();
        var requiredPageSelector = numpyPageRendererThis.getRequiredPageSelector();

        
        var paramVariableState = numpyStateGenerator.getState('paramVariable');
        var sbTagString = new sb.StringBuilder();

        sbTagString.appendLine( `<tr class='vp-numpy-option-block'>`);
        sbTagString.appendLine(`<th>Parameter Variable</th>`)
        sbTagString.appendLine( `<td>`);
        sbTagString.appendFormatLine("<input type='text' class='{0}' id='{1}' placeholder='{2}' value='{3}'/>", 
                                      'vp-numpy-input',  `vp_numpyParamVarInput-${uuid}`, 'input variable'
                                      , paramVariableState);

        sbTagString.appendLine( `</td>`);
        sbTagString.appendLine( `<tr>`);
        var optionPage = $(importPackageThis.wrapSelector(requiredPageSelector));
        optionPage.append(sbTagString.toString());

        /** paramVariable 변수 입력 */
        $(importPackageThis.wrapSelector(`#vp_numpyParamVarInput-${uuid}`)).on('change keyup paste', function() {
            numpyStateGenerator.setState({
                paramVariable: $(this).val()
            });
        });
    }

    return _renderParamVarBlock;
});
