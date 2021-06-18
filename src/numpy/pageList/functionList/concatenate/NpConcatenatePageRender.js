define ([
    'nbextensions/visualpython/src/numpy/common/NumpyPageRender/parent/NumpyPageRender'
], function( NumpyPageRender ) {

    'use strict';
    /**
     * @class NpConcatenatePageRender
     * @constructor
    */
    var NpConcatenatePageRender = function(numpyOptionObj) {
        const { numpyDtypeArray, numpyAxisArray, numpyIndexValueArray, numpyEnumRenderEditorFuncType } = numpyOptionObj;
        this.numpyDtypeArray = numpyDtypeArray;
        this.numpyAxisArray = numpyAxisArray;
        this.numpyIndexValueArray = numpyIndexValueArray;
        this.numpyEnumRenderEditorFuncType = numpyEnumRenderEditorFuncType;
        NumpyPageRender.call(this);
    };

    /** numpyAxisArray
     * NumpyPageRender 에서 상속
    */
    NpConcatenatePageRender.prototype = Object.create(NumpyPageRender.prototype);

    /**
    * NumpyPageRender 클래스의 pageRender 메소드 오버라이드
    */
    NpConcatenatePageRender.prototype.pageRender = function() {
        this.rootTagSelector = this.getMainPageSelector();
        var numpyPageRenderThis = this;
        const { PARAM_INPUT_EDITOR_TYPE, PARAM_ONE_ARRAY_INDEX_N_EDITOR_TYPE } = this.numpyEnumRenderEditorFuncType;
        // state의 paramData 객체의 키값을 string 배열로 리턴
        var stateParamNameStrArray = Object.keys(this.numpyStateGenerator.getState('paramData'));
        var tabTitle = 'Input Parameter';
        var tabBlockArray = [
            {
                tabNumber: 1
                , btnText: 'Concatenating 1D Array '
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: [stateParamNameStrArray[0],stateParamNameStrArray[1]]
                    , paramNameStrArray: ['Array', 'Array']
                    , placeHolderArray: ['Input Variable', 'Input Variable']
                }
         
            },
            {
                tabNumber: 2
                , btnText: 'Concatenating 2D Array'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: [ stateParamNameStrArray[2], stateParamNameStrArray[3], stateParamNameStrArray[4]]
                    , paramNameStrArray: ['Array', 'Array', 'Array']
                    , placeHolderArray: ['Input Variable', 'Input Variable', 'Input Variable']
                }
        
            },
            {
                tabNumber: 3
                , btnText: 'Concatenating ND Array'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_ONE_ARRAY_INDEX_N_EDITOR_TYPE
                    , stateParamNameStrOrStrArray:  stateParamNameStrArray[5]
                }
            }
        ];
        var tabDataObj = {
            tabTitle,
            tabBlockArray
        }
        
        this.renderPrefixCode();

        this.renderRequiredInputOutputContainer();
        this.renderParamTabBlock(tabDataObj);

        this.renderAdditionalOptionContainer();
        this.renderSelectAxisBlock();
        this.renderDtypeBlock();
        this.renderReturnVarBlock();

        this.renderPostfixCode();
    }

    return NpConcatenatePageRender;

});
