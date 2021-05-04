define ([
    'nbextensions/visualpython/src/numpy/common/NumpyPageRender/parent/NumpyPageRender'
], function( NumpyPageRender ) {

    'use strict';
    /**
     * @class NpRandomRandRender
     * @constructor
    */
    var NpRandomRandRender = function(numpyOptionObj) {
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
    NpRandomRandRender.prototype = Object.create(NumpyPageRender.prototype);

    /**
    * NumpyPageRender 클래스의 pageRender 메소드 오버라이드
    * @param {this} importPackageThis 
    */
    NpRandomRandRender.prototype.pageRender = function() {
        this.rootTagSelector = this.getMainPageSelector();
        var numpyStateGenerator = this.numpyStateGenerator;
        var numpyPageRenderThis = this;

        const {PARAM_INPUT_EDITOR_TYPE } = this.numpyEnumRenderEditorFuncType;
        
        var bindFuncData = {
            numpyPageRenderThis: numpyPageRenderThis
            , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
            , stateParamNameStrOrStrArray: ['indexValue1', 'indexValue2'] 
            , paramNameStrArray: ['Number1', 'Number2']
            , placeHolderArray: ['Input Number', 'Input Number']
        }

        this.renderPrefixCode();
        
        this.renderRequiredInputOutputContainer();
        this.renderInputIndexValueBlock('Input Number', bindFuncData);

        /** 옵션 창 */
        this.renderAdditionalOptionContainer();
        this.renderDtypeBlock();
        this.renderReturnVarBlock();

        this.renderPostfixCode();
    }
    return NpRandomRandRender;
});
