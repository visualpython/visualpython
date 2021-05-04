define ([
    'nbextensions/visualpython/src/numpy/common/NumpyPageRender/parent/NumpyPageRender'

], function( NumpyPageRender ) {
    'use strict';


    /**
     * @class NpReshapePageRender
     * @constructor
    */
    var NpReshapePageRender = function(numpyOptionObj) {
        const { numpyDtypeArray, numpyEnumRenderEditorFuncType } = numpyOptionObj;
        this.numpyDtypeArray = numpyDtypeArray;
        this.numpyEnumRenderEditorFuncType = numpyEnumRenderEditorFuncType;
        NumpyPageRender.call(this);
    };

    /**
     * NumpyCodeValidator 에서 상속
    */
    NpReshapePageRender.prototype = Object.create(NumpyPageRender.prototype);

    /**
    * NumpyPageRender 클래스의 pageRender 메소드 오버라이드
    */
    NpReshapePageRender.prototype.pageRender = function() {
        this.rootTagSelector = this.getMainPageSelector();
        var numpyPageRenderThis = this;
        const { PARAM_INPUT_EDITOR_TYPE } = this.numpyEnumRenderEditorFuncType;

        var stateParamNameStrArray = Object.keys(this.numpyStateGenerator.getState('paramData'));
        var tabTitle = 'Input Parameter';
        var tabBlockArray = [
            {
                tabNumber: 1
                , btnText: 'To 1D Array'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: [stateParamNameStrArray[0]]
                    , paramNameStrArray: ['Length']
                    , placeHolderArray: ['Input Number']
                }
            },
            {
                tabNumber: 2
                , btnText: 'To 2D Array'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: [ stateParamNameStrArray[1], stateParamNameStrArray[2]]
                    , paramNameStrArray: ['Row','Column']
                    , placeHolderArray: ['Input Number', 'Input Number']
                }
            },
            {
                tabNumber: 3
                , btnText: 'To 3D Array'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
                    , stateParamNameStrOrStrArray:  [ stateParamNameStrArray[3], stateParamNameStrArray[4], stateParamNameStrArray[5]]
                    , paramNameStrArray: ['Plane','Row','Column']
                    , placeHolderArray: ['Input Number', 'Input Number' , 'Input Number']
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
        this.renderCallVarBlock();
        
        /** 옵션 창 */
        this.renderAdditionalOptionContainer();
        this.renderReturnVarBlock();
        
        this.renderPostfixCode();
    }

    return NpReshapePageRender;
});
