define ([    
    'nbextensions/visualpython/src/common/vpCommon'
    // + 추가 numpy 폴더  패키지 : 이진용 주임
    , 'nbextensions/visualpython/src/numpy/api/numpyStateApi' 
], function( vpCommon, numpyStateApi ){
    /**
     * oneArrayEditor twoArrayEditor 제목과 생성 버튼, 크게보기 버튼을 렌더링하는 메소드
     * @param {numpyPageRender This} numpyPageRenderThis 
     * @param {document} baseDom 
     * @param {string} tagSelector 
     * @param {string} stateParamName 
     * @param {string} funcId 
     */
    var _renderArrayEditorTitle = function(numpyPageRenderThis, baseDom, tagSelector, stateParamName, funcId) {
        var numpyPageRenderThis = numpyPageRenderThis;
        var importPackageThis = numpyPageRenderThis.getImportPackageThis();
        var numpyStateGenerator = numpyPageRenderThis.getStateGenerator();
        var uuid = 'u' + vpCommon.getUUID();
        var dom;
        switch(funcId){
            /**
             * oneArrayEditor
             */
            case 'JY901':{
                /** 1차원 배열 행의 길이를 구하는 로직 */
                numpyPageRenderThis.setOneArrayLength ( numpyStateGenerator.getState(stateParamName).length );
                
                /** 1차원 배열 길이 값 입력 <div>블럭 생성 */
                dom = $(`<div class='vp-numpy-style-flex-row-center'>
                                <div style='margin:0 5px;'>
                                    <span class='vp-multilang' 
                                          data-caption-id='length-kor'>Length : </span>
                                    <input class='vp-numpy-input
                                                  vp-numpy-oneArrayEditor-length-input-${uuid}'
                                           style='width:50px;'

                                        value='${numpyPageRenderThis.getOneArrayLength()}' 
                                        type='text'/>
                                </div>
                                <button class='vp-numpy-func_btn 
                                              vp-numpy-oneArrayEditor-make-btn-${uuid}'>
                                    New
                                </button>
                            </div>`);
                baseDom.append(dom);

                /**  1차원 배열 길이를 입력하는 이벤트 함수  */
                $(importPackageThis.wrapSelector(`.vp-numpy-oneArrayEditor-length-input-${uuid}`)).on('change keyup paste', function() {
                    numpyPageRenderThis.setOneArrayLength ( parseInt($(this).val()) );
                });

                /**  입력한 길이 숫자 만큼의 1차원 배열을 생성하는 이벤트 함수  */
                $(importPackageThis.wrapSelector(`.vp-numpy-oneArrayEditor-make-btn-${uuid}`)).click(function() {
                    var newArray = [];
                    for(var i = 0; i <  numpyPageRenderThis.getOneArrayLength(); i++){
                        newArray.push('0');
                    }
                    numpyStateGenerator.setState({
                        [stateParamName]: newArray
                    });
                    numpyPageRenderThis.renderParamOneArrayEditor(tagSelector, stateParamName);
                });
                break;
            }
            /**
             * twoArrayEditor
             */
            case 'JY902':{
                /** 2차원 배열 행의 길이를 구하는 로직 */
                numpyPageRenderThis.setTwoArrayRow(numpyStateGenerator.getState(stateParamName).length);

                /** 2차원 배열 열의 길이를 구하는 로직 */
                var maxColNum = 0;
                numpyStateGenerator.getState(stateParamName).forEach(elementArray => {
                    var num = elementArray.length;
                    maxColNum = Math.max(maxColNum, num);
                });
                numpyPageRenderThis.setTwoArrayCol(maxColNum);

                /** 2차원 행 열 값 입력 <div>블럭 생성 */
                dom = $(`<div class='vp-numpy-style-flex-row-center'>
                            <div style='margin:0 5px;'>
                                <span  class='vp-multilang' 
                                        data-caption-id='row-kor'>Row : </span>
                                <input class='vp-numpy-input
                                              vp-numpy-twoArrayEditor-row-input-${uuid}'
                                        style='width:50px;'
                                    value='${numpyPageRenderThis.getTwoArrayRow()}'
                                    type='text'/>
                            </div>
                            <div style='margin:0 5px;'>
                                <span  class='vp-multilang' 
                                        data-caption-id='col-kor'>Col : </span>
                                <input class='vp-numpy-input 
                                              vp-numpy-twoArrayEditor-col-input-${uuid}' 
                                        style='width:50px;'
                                    value='${numpyPageRenderThis.getTwoArrayCol()}'
                                    type='text'/>
                            </div>
                                <button class='vp-numpy-func_btn 
                                               vp-numpy-twoArrayEditor-make-btn-${uuid}'>New</button>
                            </div>`);
                baseDom.append(dom);

                /** 2차원 배열 행의 길이 값을 입력하는 이벤트 함수 */
                $(importPackageThis.wrapSelector(`.vp-numpy-twoArrayEditor-row-input-${uuid}`)).on('change keyup paste', function() {
                    numpyPageRenderThis.setTwoArrayRow( parseInt( $(this).val() ) );
                });
                /** 2차원 배열 열의 길이 값을 입력하는 이벤트 함수 */
                $(importPackageThis.wrapSelector(`.vp-numpy-twoArrayEditor-col-input-${uuid}`)).on('change keyup paste', function() {
                    numpyPageRenderThis.setTwoArrayCol( parseInt( $(this).val() ) );
                });

                /** 입력한 행과 열의 숫자 만큼의 2차원 배열 을 생성하는 이벤트 함수 */
                $(importPackageThis.wrapSelector(`.vp-numpy-twoArrayEditor-make-btn-${uuid}`)).click(function() {
                    var newTwoArray = [];
                    for(var i = 0; i < numpyPageRenderThis.getTwoArrayRow(); i++){
                        newTwoArray.push([]);
                        for(var j = 0; j < numpyPageRenderThis.getTwoArrayCol(); j++){
                            newTwoArray[i].push('0');
                        }
                    }
                    numpyStateGenerator.setState({
                        [stateParamName]: newTwoArray
                    });

                    /** 2차원 배열 생성 버튼을 클릭하면 입력한 행과 열의 숫자 만큼의 2차원 배열을 다시 렌더링 */
                    numpyPageRenderThis.renderParamTwoArrayEditor(tagSelector, stateParamName);
                });

                break;
            }
        }
    }

    return _renderArrayEditorTitle;
});
