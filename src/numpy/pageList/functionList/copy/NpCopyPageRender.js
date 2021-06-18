define ([
    'nbextensions/visualpython/src/numpy/common/NumpyPageRender/parent/NumpyPageRender'
], function( NumpyPageRender ) {

    'use strict';
    /**
     * @class NpCopyPageRender
     * @constructor
    */
    var NpCopyPageRender = function() {
        NumpyPageRender.call(this);
    };

    /**
     * NumpyPageRender 에서 상속
    */
    NpCopyPageRender.prototype = Object.create(NumpyPageRender.prototype);

    /**
    * NumpyPageRender 클래스의 pageRender 메소드 오버라이드
    */
    NpCopyPageRender.prototype.pageRender = function() {
        this.rootTagSelector = this.getMainPageSelector();

        this.renderPrefixCode();

        this.renderRequiredInputOutputContainer();
        this.renderParamVarBlock();
        
        this.renderAdditionalOptionContainer();
        this.renderReturnVarBlock();

        this.renderPostfixCode();
    }

    return NpCopyPageRender;
});
