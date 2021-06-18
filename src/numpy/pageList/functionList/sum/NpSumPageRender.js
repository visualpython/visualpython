define ([
    'nbextensions/visualpython/src/numpy/common/NumpyPageRender/parent/NumpyPageRender'
], function( NumpyPageRender ) {
    'use strict';

    /**
     * @class NpSumPageRender
     * @constructor
    */
    var NpSumPageRender = function(numpyOptionObj) {
        const { numpyDtypeArray, numpyAxisArray, numpyIndexValueArray, numpyEnumRenderEditorFuncType } = numpyOptionObj;
        this.numpyDtypeArray = numpyDtypeArray;
        this.numpyAxisArray = numpyAxisArray;
        this.numpyIndexValueArray = numpyIndexValueArray;
        this.numpyEnumRenderEditorFuncType = numpyEnumRenderEditorFuncType;
        NumpyPageRender.call(this);
    };

    /**
     * NumpyPageRender 에서 상속
    */
    NpSumPageRender.prototype = Object.create(NumpyPageRender.prototype);

    /**
    * NumpyPageRender 클래스의 pageRender 메소드 오버라이드
    */
    NpSumPageRender.prototype.pageRender = function() {
        this.rootTagSelector = this.getMainPageSelector();

        this.renderPrefixCode();

        this.renderRequiredInputOutputContainer();
        this.renderParamVarBlock();

        /** 옵션 창 */
        this.renderAdditionalOptionContainer();
        this.renderSelectAxisBlock();
        this.renderReturnVarBlock();
        
        this.renderPostfixCode();
    }

    return NpSumPageRender;
});
