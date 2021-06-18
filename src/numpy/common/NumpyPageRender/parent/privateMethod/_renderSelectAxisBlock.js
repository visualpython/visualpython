define ([     
    'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/StringBuilder'
], function( vpCommon, sb ) {
    /**
     * _renderSelectAxisBlock
     * numpy 옵션 Axis를 편집하는 html태그를 동적 렌더링
     * @param {numpyPageRenderer this} numpyPageRendererThis 
     */
    var _renderSelectAxisBlock = function(numpyPageRendererThis) {
        var uuid = 'u' + vpCommon.getUUID();
        var numpyPageRendererThis = numpyPageRendererThis;
        var importPackageThis = numpyPageRendererThis.getImportPackageThis();
        var numpyStateGenerator = numpyPageRendererThis.getStateGenerator();
        var numpyAxisArray = numpyPageRendererThis.numpyAxisArray;
        
        var optionPageSelector = numpyPageRendererThis.getOptionPageSelector();
        var optionPage = $(numpyPageRendererThis.importPackageThis.wrapSelector(optionPageSelector));

        var sbTagString = new sb.StringBuilder();
        sbTagString.appendLine( `<tr class='vp-numpy-option-block'>`);
        sbTagString.appendLine(`<th>Select Axis</th>`)
        sbTagString.appendLine( `<td>`);
        sbTagString.appendFormatLine("<select class='vp-numpy-select-indexN' id='{0}'>", `vp_numpyIndexN-${uuid}` );
        sbTagString.appendLine("</select>" );

        sbTagString.appendLine( `</td>`);
        sbTagString.appendLine( `<tr>`);
        optionPage.append(sbTagString.toString());

        /**
         * numpyAxis 배열을 option 태그에 동적 렌더링 
         */ 
        numpyAxisArray.forEach((element) => {
            $(importPackageThis.wrapSelector(`#vp_numpyIndexN-${uuid}`)).append(`<option value='${element}'> ${element}</option>`)
        });

        /**
         * Axis change 이벤트 함수
         */
        $(importPackageThis.wrapSelector(`#vp_numpyIndexN-${uuid}`)).change(function() {
            numpyStateGenerator.setState({
                axis: $(':selected', this).val()
            });
        });
    }
    return _renderSelectAxisBlock;
});
