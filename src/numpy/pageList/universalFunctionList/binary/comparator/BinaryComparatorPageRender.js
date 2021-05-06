define ([
    'nbextensions/visualpython/src/numpy/common/NumpyPageRender/parent/NumpyPageRender'
], function( NumpyPageRender ) {

    'use strict';
    /**
     * @class BinaryComparatorPageRender
     * @constructor
    */
    var BinaryComparatorPageRender = function(numpyOptionObj) {
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
    BinaryComparatorPageRender.prototype = Object.create(NumpyPageRender.prototype);

    /**
    * NumpyPageRender 클래스의 pageRender 메소드 오버라이드
    */
    BinaryComparatorPageRender.prototype.pageRender = function() {
        this.rootTagSelector = this.getMainPageSelector();
        var numpyPageRenderThis = this;

        // state의 paramData 객체의 키값을 string 배열로 리턴
        var stateParamNameStrArray = Object.keys(this.numpyStateGenerator.getState('paramData'));
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
            tabTitle: 'First Input Parameter',
            tabBlockArray,
            stateParamOptionName: `paramOption1`
        }

        var tabBlockArray2 = [
            {
                tabNumber: 1
                , btnText: '1D Array'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_ONE_ARRAY_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: stateParamNameStrArray[5]
                }
            },
            {
                tabNumber: 2
                , btnText: '2D Array'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_TWO_ARRAY_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: stateParamNameStrArray[6]
                }
            },
            {
                tabNumber: 4
                , btnText: 'Scalar Value'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: [ stateParamNameStrArray[8] ]
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
                    , stateParamNameStrOrStrArray: [ stateParamNameStrArray[9] ]
                    , paramNameStrArray: ['Variable']
                    , placeHolderArray: ['Input Variable']
                }
            }
        ];
        var tabDataObj2 = {
            tabTitle: 'Second Input Parameter',
            tabBlockArray: tabBlockArray2,
            stateParamOptionName: `paramOption2`
        }

        this.renderPrefixCode();
        
        this.renderRequiredInputOutputContainer();
        this.renderParamTabBlock(tabDataObj);
        this.renderParamTabBlock(tabDataObj2);
        
        /** 옵션 창 */
        this.renderAdditionalOptionContainer();
        this.renderReturnVarBlock();

        this.renderPostfixCode();
    }

    return BinaryComparatorPageRender;
});