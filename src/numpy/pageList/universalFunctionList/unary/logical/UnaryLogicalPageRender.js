define ([
    'nbextensions/visualpython/src/numpy/common/NumpyPageRender/parent/NumpyPageRender'
], function( NumpyPageRender ) {

    'use strict';
    /**
     * @class UnaryLogicalPageRender
     * @constructor
    */
    var UnaryLogicalPageRender = function(numpyOptionObj) {
        const { numpyDtypeArray, numpyAxisArray, numpyIndexValueArray, numpyEnumRenderEditorFuncType, 
                numpyTrueFalseArray, numpyRavelOrderArray } = numpyOptionObj;
        this.numpyDtypeArray = numpyDtypeArray;
        this.numpyAxisArray = numpyAxisArray;
        this.numpyIndexValueArray = numpyIndexValueArray;
        this.numpyEnumRenderEditorFuncType = numpyEnumRenderEditorFuncType;
        this.numpyTrueFalseArray = numpyTrueFalseArray
        this.numpyRavelOrderArray = numpyRavelOrderArray;
        NumpyPageRender.call(this);
    };
    /**
     * NumpyPageRender 에서 상속
    */
    UnaryLogicalPageRender.prototype = Object.create(NumpyPageRender.prototype);

    /**
    * NumpyPageRender 클래스의 pageRender 메소드 오버라이드
    * @param {this} importPackageThis 
    */
    UnaryLogicalPageRender.prototype.pageRender = function() {
        this.rootTagSelector = this.getMainPageSelector();
        
        var numpyStateGenerator = this.numpyStateGenerator;
        var numpyPageRenderThis = this;
        // state의 paramData 객체의 키값을 string 배열로 리턴
        var stateParamNameStrArray = Object.keys(numpyStateGenerator.getState('paramData'));
        var tabTitle = 'Input Parameter';
        const { PARAM_ONE_ARRAY_EDITOR_TYPE, PARAM_TWO_ARRAY_EDITOR_TYPE, PARAM_INPUT_EDITOR_TYPE } = this.numpyEnumRenderEditorFuncType;
        var tabBlockArray = [
            {
                tabNumber: 1
                , btnText: '1D Array'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_ONE_ARRAY_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: stateParamNameStrArray[0]
                }
            },
            {
                tabNumber: 2
                , btnText: '2D Array'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_TWO_ARRAY_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: stateParamNameStrArray[1]
                }
            },
            {
                tabNumber: 4
                , btnText: 'Scalar Value'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: [ stateParamNameStrArray[3] ]
                    , paramNameStrArray: ['Scala']
                    , placeHolderArray: ['Input Number']
                }
            },
            {
                tabNumber: 5
                , btnText: 'Param Variable'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: [ stateParamNameStrArray[4] ]
                    , paramNameStrArray: ['Variable']
                    , placeHolderArray: ['Input Variable']
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
        
        /** 옵션 창 */
        this.renderAdditionalOptionContainer();
        this.renderReturnVarBlock();
    
        this.renderPostfixCode();
    }

    return UnaryLogicalPageRender;
});
