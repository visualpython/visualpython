define ([
    'nbextensions/visualpython/src/numpy/common/NumpyPageRender/parent/NumpyPageRender'
], function( NumpyPageRender ) {

    'use strict';
    /**
     * @class NpImportRender
     * @constructor
    */
    var NpImportRender = function(numpyOptionObj) {
        const { numpyDtypeArray, numpyIndexValueArray, numpyEnumRenderEditorFuncType } = numpyOptionObj;
        this.numpyDtypeArray = numpyDtypeArray;
        this.numpyIndexValueArray = numpyIndexValueArray;
        this.numpyEnumRenderEditorFuncType = numpyEnumRenderEditorFuncType;
        NumpyPageRender.call(this);
    };

    /**
     * NumpyPageRender 에서 상속
    */
    NpImportRender.prototype = Object.create(NumpyPageRender.prototype);

    /**
    * NumpyPageRender 클래스의 pageRender 메소드 오버라이드
    */
    NpImportRender.prototype.pageRender = function(tagSelector) {
        this.rootTagSelector = tagSelector || this.getMainPageSelector();
        var numpyPageRenderThis = this;
        const { PARAM_INPUT_EDITOR_TYPE } = this.numpyEnumRenderEditorFuncType;
        var bindFuncData = {
            numpyPageRenderThis: numpyPageRenderThis
            , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
            , stateParamNameStrOrStrArray: ['acronyms'] 
            , paramNameStrArray: ['']
            , placeHolderArray: ['Input']
        }

        this.renderPrefixCode();

        this.renderRequiredInputOutputContainer();
        this.renderInputIndexValueBlock('Numpy As', bindFuncData);

        /** 옵션 창 */

        /** userOption 창 */

        this.renderPostfixCode();
    }

    return NpImportRender;
});
