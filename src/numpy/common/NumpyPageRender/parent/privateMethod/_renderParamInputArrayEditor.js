define ([    
    'nbextensions/visualpython/src/common/vpCommon'
], function( vpCommon ) {

    /**
     * parameter로 여러 개의 데이터를 받아야 하는 만큼의 input 태그가 필요하다
     * input이 여러개 일 때, input 갯수만큼 input태그와 input 입력 이벤트 함수를 동적 렌더링하는 함수
     * input이 1개여도 array로 받는다
     * @param {numpyPageRender This} numpyPageRendererThis 
     * @param {string} tagSelector 
     * @param {Array<string>} stateParamNameArray 
     * @param {boolean} isEmpty 
     */
    var _renderParamInputArrayEditor = function(numpyPageRendererThis, tagSelector, bindFuncData) {
   
        const { stateParamNameStrOrStrArray: stateParamNameArray
                , paramNameStrArray
                , placeHolderArray } = bindFuncData;

        var numpyPageRendererThis = numpyPageRendererThis;
        var numpyStateGenerator = numpyPageRendererThis.getStateGenerator();
        var importPackageThis = numpyPageRendererThis.getImportPackageThis();
        var inputArrayEditorDom = $(importPackageThis.wrapSelector(tagSelector));
        inputArrayEditorDom.empty();

        var inputBlockContainer = $(`<div class='vp-numpy-style-flex-row'></div>`);
        var uuid = [];
        var length = stateParamNameArray.length;
        var widthPx = ``;
        switch (length) {
            case 1: {
                widthPx = `width:200px;`;
                break;
            }
            case 2: {
                widthPx = `width:150px;`;
                break;
            }
            case 3: {
                widthPx = `width:100px;`;
                break;
            }
            case 4: {
                widthPx = `width:50px;`;
                break;
            }
            default: {
                widthPx = `width:150px;`;
                break;
            }
        }

        /** input 블럭 동적 렌더링 */
        for(var i = 0; i < stateParamNameArray.length; i++){
            (function(j) {
                uuid[j] = vpCommon.getUUID();
                var inputBlock = $(`<div class='vp-numpy-style-flex-row'
                                         style='margin-right:10px;'>

                                        <span class='vp-numpy-style-flex-column-center' 
                                              style='margin-right:5px;'>
                                            ${paramNameStrArray && paramNameStrArray[j] || ``}
                                        </span>

                                        <input type='text'
                                                value='${numpyStateGenerator.getState(stateParamNameArray[j])}' 
                                                class='vp-numpy-input' 
                                                style='${widthPx}' 
                                                placeholder='${placeHolderArray && placeHolderArray[j] || ``}'
                                                id='vp_${uuid[j]}input' />
                                    </div>`);
                inputBlockContainer.append(inputBlock);
            })(i)
        }
        inputArrayEditorDom.append(inputBlockContainer);

        /** bind input 이벤트 함수*/
        for(var i = 0; i < stateParamNameArray.length; i++){
            (function(j) {
                $(importPackageThis.wrapSelector(`#vp_${uuid[j]}input`)).on('change keyup paste', function() {
                    numpyStateGenerator.setState({
                        [stateParamNameArray[j]]: $(this).val()
                    });
                });
            })(i)
        }
    }

    return _renderParamInputArrayEditor;
});
