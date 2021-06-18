define ([    
    'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/vpMakeDom'
    // + 추가 numpy 폴더  패키지 : 이진용 주임
    , 'nbextensions/visualpython/src/numpy/api/numpyStateApi' 
], function( vpCommon, vpMakeDom, numpyStateApi ){
    const { renderDiv, renderInput, renderButton, renderSpan } = vpMakeDom;

    const { updateOneArrayIndexValueAndGetNewArray, 
            deleteOneArrayIndexValueAndGetNewArray } = numpyStateApi;
    /**
     * 2차원 배열을 편집하는 편집기를 동적 렌더링하는 메소드 
     * @param {numpyPageRenderer this} numpyPageRenderThis 
     * @param {string} tagSelector 2차원 배열 편집기가 렌더링될 css tagSelector 
     * @param {string} stateParamName 2차원 배열을 생성 변경, 삭제할 state 이름
     */
    var _renderParamTwoArrayEditor = function(numpyPageRenderThis, tagSelector, stateParamName) {
        var numpyPageRenderThis = numpyPageRenderThis;
        var importPackageThis = numpyPageRenderThis.getImportPackageThis();
        var numpyStateGenerator = numpyPageRenderThis.getStateGenerator();
        var twoarrayDom = $(importPackageThis.wrapSelector(tagSelector));
        var uuid = 'u' + vpCommon.getUUID();

        /** 기존의 렌더링된 2차원 배열 editor <diV> 블록을 삭제*/
        twoarrayDom.empty();
        /** 제목 생성 */
        numpyPageRenderThis.renderArrayEditorTitle(twoarrayDom, tagSelector, stateParamName, 'JY902');
    
        var flexColumnDiv = renderDiv({class:'vp-numpy-style-flex-column'});
     
        // 2차원 배열 열  생성
        for (var i = 0; i < numpyStateGenerator.getState(stateParamName).length; i++) {
            (function(j) {
                var twoArrayBlockDiv = renderDiv({class: 'vp-numpy-arrayEditor-row-block vp-numpy-style-flex-row'});
                var scrollbarDiv = renderDiv({class: `overflow-x-auto 
                                                         vp-numpy-style-flex-row 
                                                         vp-numpy-scrollbar`
                                               , style: `width: 80%; 
                                                            overflow: auto; 
                                                            margin-top:5px;
                                                             margin-bottom:5px;`});
                var twoArrayBlockIndexDiv = renderDiv({class: `vp-numpy-style-flex-column-center 
                                                                 vp-numpy-style-text-center 
                                                                 vp-numpy-style-font-weight-700`
                                                        , style:'width: 10%;'
                                                        , text: j});
                var twoArrayRowDivContainer = renderDiv({class:'vp-numpy-style-flex-column'
                                                         , style:'width: 90%;'});
                var twoArrayRowDivInner = renderDiv({ class:`vp-numpy-array-row-container 
                                                                vp-numpy-style-flex-row-wrap 
                                                                vp-numpy-array-twoarray-row-${j}-container-${uuid}`
                                                       , style:'width:100%;'});

                var plusButtonContainer = renderDiv({class:'vp-numpy-style-flex-column-center '
                                                     , style:'width:10%;'});
                var plusButton = renderButton({class:'vp-numpy-func_btn'
                                                , style:'width: 100%; height:40px; max-height:80px;'
                                                , text:'+ Col'});

                var deleteButtonContainer = renderDiv({class:'vp-numpy-style-flex-column-center'
                                                     , style:'width:10%;'});        
                var deleteButton = renderButton({class:'vp-numpy-func_btn'
                                                     , style:'width: 100%; height:40px; max-height:80px;'
                                                     , text:'x'});   

                scrollbarDiv.append(twoArrayBlockIndexDiv);
                twoArrayRowDivContainer.append(twoArrayRowDivInner);
                scrollbarDiv.append(twoArrayRowDivContainer);

                twoArrayBlockDiv.append(scrollbarDiv);

                plusButtonContainer.append(plusButton);
                deleteButtonContainer.append(deleteButton);

                twoArrayBlockDiv.append(plusButtonContainer);
                twoArrayBlockDiv.append(deleteButtonContainer);

                flexColumnDiv.append(twoArrayBlockDiv);
                twoarrayDom.append(flexColumnDiv);

                // 2차원 배열 열 삭제
                $(deleteButton).click( function() {
                    var deletedParamTwoArray = deleteOneArrayIndexValueAndGetNewArray(numpyStateGenerator.getState(stateParamName), j);
                    numpyStateGenerator.setState({
                        [stateParamName]: deletedParamTwoArray
                    });
                    numpyPageRenderThis.renderParamTwoArrayEditor(tagSelector, stateParamName);
                });

                // 2차원 배열 열 COL 생성
                $(plusButton).click( function() {
                    var tempNarray = [...numpyStateGenerator.getState(stateParamName)[j], '0'];
                    numpyStateGenerator.setState({
                        [stateParamName]: updateOneArrayIndexValueAndGetNewArray(numpyStateGenerator.getState(stateParamName), j, tempNarray)
                    });
                    numpyPageRenderThis.renderParamTwoArrayEditor(tagSelector, stateParamName);
                });

                // 2차원 배열 행 ROW 생성
                for (var y = 0; y < numpyStateGenerator.getState(stateParamName)[j].length; y++) {
                    (function(z) {
                        var towArrayRowStateElement = numpyStateGenerator.getState(stateParamName)[j][z];
                        var rowContainer = $(importPackageThis.wrapSelector(`.vp-numpy-array-twoarray-row-${j}-container-${uuid}`));
                        var colBlockDiv = renderDiv({'class': 'vp-numpy-style-flex-column'
                                                    , 'style': 'margin-top:5px'});
                        var colBlockIndexDiv = renderSpan({'class': `vp-numpy-style-flex-row-center 
                                                                    vp-numpy-style-font-weight-700`
                                                            , 'text':`${z}`});
                        var colBlockInput = renderInput({'class':'vp-numpy-input vp-numpy-style-text-center'
                                                        , 'style':'width:40px;'
                                                        , 'value': `${towArrayRowStateElement}`
                                                        , 'type': 'text'});
                        var deleteButton = renderButton({ 'class':'vp-numpy-func_btn'
                                                        , 'style': 'width:40px;'
                                                        , 'text': 'x'});      

                        colBlockDiv.append(colBlockIndexDiv);     
                        colBlockDiv.append(colBlockInput);           
                        colBlockDiv.append(deleteButton);         

                        rowContainer.append(colBlockDiv);
                        
                        // 2차원 배열 행 삭제
                        $(deleteButton).click( function() {
                            var tempNarray = deleteOneArrayIndexValueAndGetNewArray(numpyStateGenerator.getState(stateParamName)[j], z);
                            numpyStateGenerator.setState({
                                [stateParamName]: updateOneArrayIndexValueAndGetNewArray(numpyStateGenerator.getState(stateParamName), j, tempNarray)
                            });
                            numpyPageRenderThis.renderParamTwoArrayEditor(tagSelector, stateParamName);
                        });

                        // 2차원 배열 행 값 변경
                        $(colBlockInput).on('change keyup paste', function() {
                            var updatedIndexValue = $(this).val();
                            var tempNarray = updateOneArrayIndexValueAndGetNewArray(numpyStateGenerator.getState(stateParamName)[j], z, updatedIndexValue);
                            numpyStateGenerator.setState({
                                [stateParamName]:  updateOneArrayIndexValueAndGetNewArray(numpyStateGenerator.getState(stateParamName), j, tempNarray)
                            });
                        });
                    })(y);
                }
            })(i);
        }

        twoarrayDom.find(`.vp-numpy-array-twoarray-row-func_plusbtn-${stateParamName}`).off();
        twoarrayDom.find(`.vp-numpy-array-twoarray-row-func_plusbtn-${stateParamName}`).remove();
        var plusButton = renderButton({class:`vp-numpy-func_btn vp-numpy-array-twoarray-row-func_plusbtn-${stateParamName}`
                                        , style: 'width: 100%; padding: 1rem;'});
        var span = renderSpan({class: 'vp-multilang'
                                , 'data_caption_id': 'numpyPlusRow'
                                , text: '+ Row'});
        plusButton.append(span);
        twoarrayDom.append(plusButton);

        // 2차원 배열 행(row) 생성 클릭
        $(plusButton).click( function() {
            numpyStateGenerator.setState({
                [stateParamName]: [...numpyStateGenerator.getState(stateParamName), ['0']]
            });
            /** - 2차원 배열 생성 버튼 클릭 후 배열 다시 렌더링- */
            numpyPageRenderThis.renderParamTwoArrayEditor(tagSelector, stateParamName);
        });
    }

    return _renderParamTwoArrayEditor;
});
