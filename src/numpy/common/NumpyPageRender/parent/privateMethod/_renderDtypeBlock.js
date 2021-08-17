define ([    
    'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/StringBuilder'
], function( vpCommon, sb ) {
    /**
     * numpy의 dtype을 선택하는 <div> 블록을 생성하는 렌더링 함수
     * numpy의 모든 함수에서 dtype을 입력받는 state 이름은 dtype이다
     * @param {numpyPageRenderer this} numpyPageRendererThis 
     */
    var _renderDtypeBlock = function(numpyPageRendererThis) {
        var uuid = 'u' + vpCommon.getUUID();
        var numpyStateGenerator = numpyPageRendererThis.getStateGenerator();

        const { dtype } = numpyStateGenerator.getStateAll();

        var importPackageThis = numpyPageRendererThis.getImportPackageThis();
        
        var numpyStateGenerator = numpyPageRendererThis.getStateGenerator();
        var optionPageSelector = numpyPageRendererThis.getOptionPageSelector();
        var optionPage = $(importPackageThis.wrapSelector(optionPageSelector));
        var numpyDtypeArray = numpyPageRendererThis.numpyDtypeArray;

        var sbTagString = new sb.StringBuilder();

        sbTagString.appendLine( `<tr>`);
        sbTagString.appendLine(`<th>Select Data Type</th>`)
        sbTagString.appendLine( `<td>`);
        sbTagString.appendFormatLine("<select id='{0}'>", `vp_numpyDtype-${uuid}` );
        sbTagString.appendLine("</select>" );
        sbTagString.appendLine( `</td>`);
        sbTagString.appendLine( `<tr>`);

        var dtypeBlock = $(sbTagString.toString());
        optionPage.append(dtypeBlock);

        /** src/common/const_numpy.js에서 설정한 dtype 배열 값을 <select>태그 안에 
         * <option>태그 value안에 동적 렌더링 
         */
        numpyDtypeArray.forEach(function (element) {
            const STR_SELECTED = 'selected';
            var isCheckedStr = '';
            if (dtype == element.value) {
                isCheckedStr = STR_SELECTED;
            }
            $(importPackageThis.wrapSelector(`#vp_numpyDtype-${uuid}`)).append(`<option value='${element.value}' ${isCheckedStr}> ${element.name}</option>`)
        });

        /** dtype 선택  이벤트 함수 */
        $(importPackageThis.wrapSelector(`#vp_numpyDtype-${uuid}`)).change(function()  {
            numpyStateGenerator.setState({
                dtype: $(':selected', this).val()
            });
        });
    }
    return _renderDtypeBlock;
});
