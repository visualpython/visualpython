define ([    
    'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/StringBuilder'
], function( vpCommon, sb ) {

    /** numpy의 옵션 중 indexValue를 입력하는 블럭을 동적 렌더링하는 메소드
     * numpy의 특정 함수들이 indexValue 옵션을 지정 할 수 도 안할 수도 있다.
     * @param {numpyPageRenderer this} numpyPageRendererThis
     * @param {title} title
     * @param {string || Array<string>} stateParamNameOrArray
    */
    var _renderInputIndexValueBlock = function(numpyPageRendererThis, title, bindFuncData) {
    
        var uuid = 'u' + vpCommon.getUUID();
        var numpyPageRendererThis = numpyPageRendererThis;
        var importPackageThis = numpyPageRendererThis.getImportPackageThis();
        var rootTagSelector = numpyPageRendererThis.getRequiredPageSelector();

        var rootPage = $(importPackageThis.wrapSelector(rootTagSelector));
        var sbTagString = new sb.StringBuilder();
        sbTagString.appendLine( `<tr class='vp-numpy-option-block'>`);
        sbTagString.appendLine(`<th>${title}</th>`)
        sbTagString.appendLine( `<td class='vp-numpy-${uuid}-block'>`);
        sbTagString.appendLine( `</td>`);
        sbTagString.appendLine( `<tr>`);
        rootPage.append(sbTagString.toString());

      numpyPageRendererThis.renderParamInputArrayEditor(`.vp-numpy-${uuid}-block`, bindFuncData, false)
    }

    return _renderInputIndexValueBlock;
});
