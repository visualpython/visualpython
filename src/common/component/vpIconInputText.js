define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/component/vpComComponent'
], function (requirejs, $, vpCommon, vpConst, sb, vpComComponent) {
    /**
     * @class vpIconInputText 아이콘 인풋박스 객체
     * @constructor
     * @param {boolean} rightIcon 아이콘 위치. true 오른쪽, false 왼쪽
     */
    var vpIconInputText = function(rightIcon = true) {
        this.setUUID();
        this._isRightIcon = rightIcon;
        this._placeholder = "";
        this._additionalBoxClass = "";
        this._compID = "";
    };

    vpIconInputText.prototype = Object.create(vpComComponent.vpComComponent.prototype);

    /**
     * 아이콘 버튼 이미지 클래스 설정
     * @param {String} iconClass 아이콘 클래스
     */
    vpIconInputText.prototype.setIconClass = function(iconClass ="") {
        this._iconClass = iconClass;
    }

    /**
     * 외부박스 추가 클래스 설정
     * @param {String} boxClass 외부 박스 클래스
     */
    vpIconInputText.prototype.setBoxClass = function(boxClass = "") {
        this._additionalBoxClass = boxClass;
    }

    /**
     * placeholder 설정
     * @param {String} placeholder placeholder
     */
    vpIconInputText.prototype.setPlaceholder = function(placeholder = "") {
        this._placeholder = placeholder;
    }

    vpIconInputText.prototype.setComponentID = function(compID = "") {
        this._compID = compID;
    }

    /**
     * 아이콘 인풋박스 태그 생성
     * @returns html icon input text tag string
     */
    vpIconInputText.prototype.toTagString = function() {
        var sbTagString = new sb.StringBuilder();
        var that = this;

        sbTagString.appendFormatLine("<div class='{0} {1} {2}' {3}>", that._UUID, vpConst.ICON_INPUT_TEXT
            , that._additionalBoxClass == "" ? "" : that._additionalBoxClass, that._compID == "" ? "" : vpCommon.formatString("id='{0}'", that._compID));
        
        if (that._isRightIcon) {
            sbTagString.appendFormatLine("<input type='text' placeholder='{0}'/>", that._placeholder);
    
            sbTagString.appendFormatLine("<div class='{0}{1}'></div>", vpConst.VP_CLASS_PREFIX, that._iconClass);
        } else {
            sbTagString.appendFormatLine("<div class='{0}{1}'></div>", vpConst.VP_CLASS_PREFIX, that._iconClass);
            
            sbTagString.appendFormatLine("<input type='text' placeholder='{0}'/>", that._placeholder);
        }

        sbTagString.appendLine("</div>");

        return sbTagString.toString();
    }

    /**
     * 
     * @param {String} events event type
     * @param {String} component text,input,icon or button
     * @param {function} handler event action
     */
    vpIconInputText.prototype.addEvent = function(events, component, handler) {
        var that = this;
        switch (component.toLowerCase()) {
            case "text":
            case "input":
                $(document).on(events, that.wrapSelector("input"), handler);
                break;

            case "icon":
            case "button":
                $(document).on(events, that.wrapSelector(vpCommon.formatString(".{0}{1}", vpConst.VP_CLASS_PREFIX, that._iconClass)), handler);
                break;
        }
    }
    
    return {
        vpIconInputText: vpIconInputText
    }
});