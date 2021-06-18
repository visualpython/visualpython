define ([    
    'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/StringBuilder'
], function( vpCommon, sb ) {
    /** 
     * return 변수를 편집하는 html태그를 동적 렌더링
     * @param {numpyPageRenderer this} numpyPageRendererThis 
     */
    var _renderReturnVarBlock = function(numpyPageRendererThis) {
        var uuid = 'u' + vpCommon.getUUID();
        var numpyPageRendererThis = numpyPageRendererThis;

        /**
         * return 변수 동적 태그 블럭
         */
        var sbTagString = new sb.StringBuilder();
        var numpyStateGenerator = numpyPageRendererThis.getStateGenerator();
        var returnVariableState = numpyStateGenerator.getState('returnVariable');
        sbTagString.appendLine( `<tr class='vp-numpy-option-block'>`);
        sbTagString.appendLine(`<th>Input Return to</th>`)
        sbTagString.appendLine( `<td>`);
      
        sbTagString.appendFormatLine("<input type='text' class='{0} {1}' id='{2}' placeholder='{3}' value='{4}'/>", 
                                            'vp-numpy-input', 'vp-numpy-return-input', `vp_numpyReturnVarInput-${uuid}`, 'input variable'
                                            , returnVariableState);

        sbTagString.appendLine( `</td>`);
        sbTagString.appendLine( `<tr>`);

        var returnVarBlock = $(sbTagString.toString()); 
        var importPackageThis = numpyPageRendererThis.getImportPackageThis();
        var numpyStateGenerator = numpyPageRendererThis.getStateGenerator();
       
        var optionPageSelector = numpyPageRendererThis.getOptionPageSelector();
        var optionPage = $(importPackageThis.wrapSelector(optionPageSelector));
        optionPage.append(returnVarBlock);

        /** return 변수 입력 */
        $(importPackageThis.wrapSelector(`#vp_numpyReturnVarInput-${uuid}`)).on('change keyup paste', function() {
            numpyStateGenerator.setState({
                returnVariable: $(this).val()
            });
        });          
    }

    return _renderReturnVarBlock;
});
