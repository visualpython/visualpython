define ([    
    'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/vpMakeDom'
    // + 추가 numpy 폴더  패키지 : 이진용 주임
    , 'nbextensions/visualpython/src/numpy/api/numpyStateApi' 
], function( vpCommon, vpMakeDom,
             numpyStateApi ){
    const { updateOneArrayIndexValueAndGetNewArray, 
            deleteOneArrayIndexValueAndGetNewArray } = numpyStateApi;
    const { renderDiv, renderInput, renderButton, renderSpan } = vpMakeDom;
    /**
     * 배열의 차원과 갯수를 편집하는 편집기를 동적 렌더링하는 메소드 
     *  _renderParamOneArrayEditor가 배열의 값을 CRUD하는 편집기라면,
     *  ex) np.array([1,2,3,4,5,6,7]) -> 1차원 배열 안에 들어있는 값 편집
     * _renderParamOneArrayIndexValueEditor는 배열의 차원과 갯수를 CRUD하는 편집기
     *  ex) np.zero(2,3) -> 2행 3열 배열 생성. 
    */

    var _renderParamOneArrayIndexValueEditor = function(numpyPageRenderThis, tagSelector, stateParamName) {
        var numpyPageRenderThis = numpyPageRenderThis;
        var importPackageThis = numpyPageRenderThis.getImportPackageThis();
        var numpyStateGenerator = numpyPageRenderThis.getStateGenerator();
        var editorDom = $(importPackageThis.wrapSelector(tagSelector));
        var uuid = 'u' + vpCommon.getUUID();
        editorDom.empty();

        /**
         *  1차원 배열의 인덱스 갯수만큼 for문 돌아 편집기 생성
         */
        var flexRowBetweenDiv = renderDiv({class:'vp-numpy-style-flex-row-between-wrap'});
        for (var i = 0; i < numpyStateGenerator.getState(stateParamName).length; i++) {
            (function(j) {
                var stateElement = numpyStateGenerator.getState(stateParamName)[j];
                var narrayBlockDiv = renderDiv({class: 'vp-numpy-style-flex-row'});
                var narrayBlockIndexDiv = renderDiv({class: `vp-numpy-style-flex-column-center 
                                                               vp-numpy-style-font-weight-700 
                                                               margin-right-5px`
                                                     , text: j+1});
                var narrayBlockInput = renderInput({class: 'vp-numpy-input'
                                                     , value: stateElement
                                                     , type: 'text'
                                                     , placeholder: 'Value'});
                var deleteButton = renderButton({class:'vp-numpy-func_btn'
                                                 , text:'x'});

                narrayBlockDiv.append(narrayBlockIndexDiv);
                narrayBlockDiv.append(narrayBlockInput);
                narrayBlockDiv.append(deleteButton);
                flexRowBetweenDiv.append(narrayBlockDiv);
                editorDom.append(flexRowBetweenDiv);

                // 편집기 j번 인덱스의 값 변경
                $(narrayBlockInput).on('change keyup paste', function() {
                    var updatedIndexValue = $(this).val();
                    var updatedParamTwoArray = updateOneArrayIndexValueAndGetNewArray(numpyStateGenerator.getState(stateParamName), j, updatedIndexValue);
                    // console.log('stateParamName',stateParamName);
                    // console.log('updatedParamTwoArray',updatedParamTwoArray);

                    numpyStateGenerator.setState({
                        [stateParamName]: updatedParamTwoArray
                    });
                });
                
                // 편집기 j번 인덱스의 값 삭제
                $(deleteButton).click(function() {
                    numpyStateGenerator.setState({
                        [stateParamName]: deleteOneArrayIndexValueAndGetNewArray(numpyStateGenerator.getState(stateParamName),j)
                    });
                    numpyPageRenderThis.renderParamOneArrayIndexValueEditor(tagSelector, stateParamName);
                });
            })(i);
        }

        editorDom.parent().find(`.vp-numpy-block-empty-shape-n-array-btn-${stateParamName}`).remove();
        // +추가 button 생성 
        var plusButton = renderButton({class:`vp-numpy-func_btn 
                                              vp-numpy-block-empty-shape-n-array-btn-${stateParamName}`});
        var span = renderSpan({class: 'vp-multilang'
                                , data_caption_id: 'numpyPlus'
                                , text: '+'});
        plusButton.append(span);                        
        editorDom.append(plusButton);       
 
        // n차원 배열 추가 차원 입력
        $(plusButton).click(function() {
            numpyStateGenerator.setState({
                [stateParamName]: [...numpyStateGenerator.getState(stateParamName), '']
            });
            /** 배열 생성 버튼 삭제 후 다시 렌더링 */
            numpyPageRenderThis.renderParamOneArrayIndexValueEditor(tagSelector, stateParamName);
        });
    }

    return _renderParamOneArrayIndexValueEditor;
});
