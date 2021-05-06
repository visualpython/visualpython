define ([
    'nbextensions/visualpython/src/numpy/common/NumpyPageRender/parent/NumpyPageRender'
], function( NumpyPageRender ) {

    'use strict';
    /**
     * @class NpRandomRandintRender
     * @constructor
    */
    var NpRandomRandintRender = function(numpyOptionObj) {
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
    NpRandomRandintRender.prototype = Object.create(NumpyPageRender.prototype);

    /**
    * NumpyPageRender 클래스의 pageRender 메소드 오버라이드
    * @param {this} importPackageThis 
    */
    NpRandomRandintRender.prototype.pageRender = function() {
        this.rootTagSelector = this.getMainPageSelector();
        var numpyStateGenerator = this.numpyStateGenerator;
        var numpyPageRenderThis = this;

        const {PARAM_INPUT_EDITOR_TYPE } = this.numpyEnumRenderEditorFuncType;

        var bindFuncData = {
            numpyPageRenderThis: numpyPageRenderThis
            , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
            , stateParamNameStrOrStrArray: ['indexValue'] 
            , paramNameStrArray: ['Number']
            , placeHolderArray: ['Input Number']
        }

        this.renderPrefixCode();
        
        this.renderRequiredInputOutputContainer();
        this.renderInputIndexValueBlock('Input Number', bindFuncData);

        /** 옵션 창 */
        this.renderAdditionalOptionContainer();
        this.renderReturnVarBlock();

        this.renderPostfixCode();
    }
    return NpRandomRandintRender;
});
