define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
], function (requirejs, $, vpCommon, vpConst, sb) {
    let _UUID;

    /**
     * @interface vpComComponent 컴퍼넌트 인터페이스
     * @constructor
     */
    var vpComComponent = function() {

    }

    /**
     * 컨트롤 uuid 생성
     */
    vpComComponent.prototype.setUUID = function() {
        this._UUID = 'u' + vpCommon.getUUID();
    }

    /**
     * tag 생성 메서드. 오버라이트 필요.
     */
    vpComComponent.prototype.toTagString = function() {
        console.log("return component tag string");
    }

    /**
     * vp wrap selector string
     * @param {String} id 최종 tag id
     */
    vpComComponent.prototype.wrapSelector = function(selector = "") {
        return vpCommon.wrapSelector(vpCommon.formatString(".{0} {1}", this._UUID, selector));
    }
    
    return {
        vpComComponent: vpComComponent
    }
});