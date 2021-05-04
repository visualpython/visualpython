define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/component/vpComComponent'
], function (requirejs, $, vpCommon, vpConst, sb, vpComComponent) {
    /**
     * @class vpAccordionBox 아코디언 박스 객체
     * @constructor
     * @param {String} caption 박스 캡션
     * @param {boolean} open 초기 오픈 상태
     * @param {boolean} uniqueness 동일레벨에서 한 박스만 오픈 허용
     */
    var vpAccordionBox = function(caption = "&nbsp;", open = false, uniqueness = false) {
        this.setUUID();
        if (caption == "") {
            caption = "&nbsp;";
        }
        this._contents = "";
        this._caption = caption;
        this._isOpen = open;
        this._uniqueness = uniqueness;
        this._additionalClass = "";
        this._attributes = "";
    };

    vpAccordionBox.prototype = Object.create(vpComComponent.vpComComponent.prototype);

    /**
     * 박스 헤더 캡션 설정
     * @param {String} caption 박스 캡션
     */
    vpAccordionBox.prototype.setCaption = function(caption = "&nbsp;") {
        if (caption == "") {
            caption = "&nbsp;";
        }
        this._caption = caption;
    }

    /**
     * 박스 컨텐츠 내용 설정
     * @param {String} html contents
     */
    vpAccordionBox.prototype.setContent = function(html = "") {
        this._contents = html;
    }

    /**
     * 박스 컨텐츠 내용 append
     * @param {String} html contents
     */
    vpAccordionBox.prototype.appendContent = function(html = "") {
        this._contents = vpCommon.formatString("{0}{1}", this._contents, html);
    }

    /**
     * 박스 컨텐츠 내용 preppend
     * @param {String} html contents
     */
    vpAccordionBox.prototype.prependContent = function(html = "") {
        this._contents = vpCommon.formatString("{0}{1}", html, this._contents);
    }

    /**
     * 박스 생성시 오픈 여부 설정
     * @param {boolean} open 초기 오픈 상태
     * @param {boolean} uniqueness 동일레벨에서 한 박스만 오픈 허용
     */
    vpAccordionBox.prototype.setOpenBox = function(open = false) {
        this._isOpen = open;
    }

    /**
     * 동일 레벨에서 한개만 오픈 허용여부 설정
     * @param {boolean} uniqueness 동일레벨에서 한 박스만 오픈 허용
     */
    vpAccordionBox.prototype.setUniqueness = function(uniqueness = false) {
        this._uniqueness = uniqueness;
    }

    /**
     * 추가 클래스 설정
     * @param {String} additionalClass 추가 클래스
     */
    vpAccordionBox.prototype.addClass = function(additionalClass = "") {
        if (additionalClass == "") return;
        var that = this;
        that._additionalClass = vpCommon.formatString("{0} {1}", that._additionalClass, additionalClass);
    }
    
    /**
     * 추가 속성 부여
     * @param {String} attrName 속성명
     * @param {String} attrValue 속성값
     */
    vpAccordionBox.prototype.addAttribute = function(attrName = "", attrValue = "") {
        if (attrName == "") return;
        var that = this;
        that._attributes = vpCommon.formatString("{0} {1}='{2}'", that._attributes, attrName, attrValue);
    }

    /**
     * 아코디언 박스 태그 생성
     * @returns html accordion box tag string
     */
    vpAccordionBox.prototype.toTagString = function() {
        var sbTagString = new sb.StringBuilder();
        var that = this;

        sbTagString.appendFormatLine("<div class='{0} {1} {2} {3} {4}' {5}>"
            , that._UUID, vpConst.ACCORDION_CONTAINER, that._isOpen ? vpConst.ACCORDION_OPEN_CLASS : "", that._uniqueness ? "uniqueType" : "", that._additionalClass, that._attributes);

        sbTagString.appendFormatLine("<div class='{0}'>", vpConst.ACCORDION_HEADER);
        sbTagString.appendFormatLine("<span class='{0}{1}'></span>", vpConst.VP_CLASS_PREFIX, "accordion-indicator");
        sbTagString.appendFormatLine("<span class='{0}{1}'>{2}</span>", vpConst.VP_CLASS_PREFIX, "accordion-caption", that._caption);
        sbTagString.appendLine("</div>");
        
        sbTagString.appendFormatLine("<div class='{0}'>{1}</div>", vpConst.ACCORDION_CONTENT_CLASS, that._contents);
        
        sbTagString.appendLine("</div>");
        
        return sbTagString.toString();
    }

    return {
        vpAccordionBox: vpAccordionBox
    }
});