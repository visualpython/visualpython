define ([    
    'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/vpMakeDom'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    // + 추가 numpy 폴더  패키지 : 이진용 주임
    ,'nbextensions/visualpython/src/numpy/api/numpyStateApi' 
    
], function( vpCommon, vpMakeDom, sb, numpyStateApi ){
    const { updateOneArrayIndexValueAndGetNewArray: updateOneArrayValueAndGet, 
            deleteOneArrayIndexValueAndGetNewArray: deleteOneArrayValueAndGet } = numpyStateApi;
    const { renderDiv, renderInput, renderButton, renderSpan } = vpMakeDom;
    /** 1차원 배열을 편집하는 편집기를 동적 렌더링하는 메소드 
     *  @param {numpyPageRenderer this} numpyPageRenderThis numpyPageRender.prototype을 가르키는 this
     *  @param {string} tagSelector 1차원 배열 편집기가 렌더링될 css tagSelector 
     *  @param {string} stateParamName 1차원 배열을 생성 변경, 삭제할 state  이름
    */
    var _renderParamOneArrayEditor = function(numpyPageRenderThis, tagSelector, stateParamName) {
        var numpyPageRenderThis = numpyPageRenderThis;
        var importPackageThis = numpyPageRenderThis.getImportPackageThis();
        var numpyStateGenerator = numpyPageRenderThis.getStateGenerator();
        var uuid = importPackageThis.uuid;
        
        var onearrayDom = $(importPackageThis.wrapSelector(tagSelector));
        onearrayDom.empty();
        
        numpyPageRenderThis.renderArrayEditorTitle(onearrayDom, tagSelector, stateParamName, 'JY901');

        var flexRowDiv = null;
    
        var sbTagString = new sb.StringBuilder();
        sbTagString.appendFormatLine("<div class='{0}' />", 
                                            'vp-numpy-style-flex-row-wrap');
        flexRowDiv = $(sbTagString.toString()); 
        

        /**, 
         * numpyStateGenerator.getState(stateParamName) 배열의 인덱스 갯수만큼 for문 돌아 편집기 생성
         */
        var oneArrayState = numpyStateGenerator.getState(stateParamName);
        for (var i = 0; i < oneArrayState.length; i++) {
            (function(j) {
                var oneArrayStateElement = numpyStateGenerator.getState(stateParamName)[j];
                var oneArrayBlockDiv = renderDiv({class:'vp-numpy-style-flex-column' 
                                                    ,style:'margin-top:10px; margin-bottom:10px;'});
                var oneArrayBlockIndexDiv = renderDiv({class:'text-center' 
                                                        ,style:'margin-top:10px; margin-bottom:10px;'
                                                        ,text: j});
                var oneArrayBlockInput = renderInput({class:'vp-numpy-input text-center' 
                                                     , style:'width:40px;'
                                                     , text: j
                                                     , type: 'text'
                                                     , value: `${oneArrayStateElement}`});
                var deleteButton = renderButton({ class: 'vp-numpy-func_btn'
                                                         , style: 'width:40px;'
                                                         , text:'x'});
                oneArrayBlockDiv.append(oneArrayBlockIndexDiv);
                oneArrayBlockDiv.append(oneArrayBlockInput);
                oneArrayBlockDiv.append(deleteButton);
                flexRowDiv.append(oneArrayBlockDiv);
                onearrayDom.append(flexRowDiv);

                /**
                 *  1차원 배열 값 변경
                 */
                $(oneArrayBlockInput).on('change keyup paste', function() {
                    var updatedIndexValue = $(this).val();
                    var updatedParamOneArray = updateOneArrayValueAndGet(numpyStateGenerator.getState(stateParamName), j, updatedIndexValue);
                    numpyStateGenerator.setState({
                        [stateParamName]: updatedParamOneArray
                    });
                });
              
                /**
                 *  1차원 배열 값 삭제
                 */
                $(deleteButton).click(function() {
                    var deletedParamOneArray = deleteOneArrayValueAndGet(numpyStateGenerator.getState(stateParamName),j);
                    numpyStateGenerator.setState({
                        [stateParamName]: deletedParamOneArray
                    });
                    numpyPageRenderThis.renderParamOneArrayEditor(tagSelector, stateParamName);
                });
            })(i);
        }

        // console.log('onearrayDom.parent()',onearrayDom.parent());
        var oneArrayContainerDom = onearrayDom.parent();
        oneArrayContainerDom.find(`.vp-numpy-array-oneArray-func-plusbtn-${stateParamName}`).off();
        oneArrayContainerDom.find(`.vp-numpy-array-oneArray-func-plusbtn-${stateParamName}`).remove();
        
        var plusButton = renderButton({ class: `vp-numpy-func_btn 
                                                vp-numpy-array-oneArray-func-plusbtn-${stateParamName}` });
        var span = renderSpan({class:'vp-multilang'
                                , text: '+ Plus'});

        plusButton.append(span);
        oneArrayContainerDom.append(plusButton);
    
        /**   - 1차원 배열 생성 클릭 - */
        $(plusButton).click( function() {
            numpyStateGenerator.getState(stateParamName).push(0);

            numpyStateGenerator.setState({
                [stateParamName]: numpyStateGenerator.getState(stateParamName)
            });
            numpyPageRenderThis.renderParamOneArrayEditor(tagSelector, stateParamName);
            /**  
             * - 1차원 배열 생성 버튼 클릭 후 배열 다시 렌더링
            */
        });
    }
    
    return _renderParamOneArrayEditor;
});
