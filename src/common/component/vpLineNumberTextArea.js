define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/component/vpComComponent'
], function (requirejs, $, vpCommon, vpConst, sb, vpComComponent) {
    /**
     * @class vpLineNumberTextArea 라인넘버 textarea
     * @constructor
     * @param {String} compID 입력 textarea id
     * @param {String} content 입력 textarea 내용
     * @param {String} height textarea 높이
     * @param {boolean}} resizeX 입력 textarea 가로 크기조정 가능여부
     * @param {boolean} resizeY 입력 textarea 세로 크기조정 가능여부
     */
    var vpLineNumberTextArea = function(compID = "", content = "", height = "63px", resizeX = false, resizeY = false) {
        this.setUUID();
        this._compID = compID;
        this._content = content;
        this._attributes = "";
        this._height = height;
        this._resizeX = resizeX;
        this._resizeY = resizeY;
    };

    vpLineNumberTextArea.prototype = Object.create(vpComComponent.vpComComponent.prototype);

    /**
     * 입력 textarea id
     * @param {String} compID 입력 textarea id
     */
    vpLineNumberTextArea.prototype.setComponentID = function(compID = "") {
        this._compID = compID;
    }

    /**
     * textarea 컨텐츠 내용 preppend
     * @param {String} content contents
     */
    vpLineNumberTextArea.prototype.setContent = function(content = "") {
        this._content = content;
    }

    /**
     * textarea 높이 설정
     * @param {String} height 높이
     */
    vpLineNumberTextArea.prototype.setHeight = function(height = "63px") {
        this._height = height;
    }

    /**
     * textarea 가로 사이즈 조절 가능 여부 설정
     * @param {boolean} resizable 변경 가능 여부
     */
    vpLineNumberTextArea.prototype.setResizeX = function(resizable = false) {
        this._resizeX = resizable;
    }

    /**
     * textarea 세로 사이즈 조절 가능 여부 설정
     * @param {boolean} resizable 변경 가능 여부
     */
    vpLineNumberTextArea.prototype.setResizeY = function(resizable = false) {
        this._resizeY = resizable;
    }

    /**
     * 라인넘버 textarea 추가 속성 부여
     * @param {String} attrName 속성명
     * @param {String} attrValue 속성값
     */
    vpLineNumberTextArea.prototype.addAttribute = function(attrName = "", attrValue = "") {
        if (attrName == "") return;
        var that = this;
        that._attributes = vpCommon.formatString("{0} {1}='{2}'", that._attributes, attrName, attrValue);
    }

    /**
     * 라인넘버 textarea 태그 생성
     * @returns html 라인넘버 textarea tag string
     */
    vpLineNumberTextArea.prototype.toTagString = function() {
        var sbTagString = new sb.StringBuilder();
        var that = this;
        var scrollSyncFunc = "function vpLNTAscrollSync(trg) {trg.parentElement.parentElement.getElementsByTagName(\"textarea\")[0].scrollTop = trg.scrollTop; } vpLNTAscrollSync(this)";
        var resizableAttr;

        if (that._resizeX && that._resizeY) {
            resizableAttr = "both";
        } else if (that._resizeX) {
            resizableAttr = "horizontal";
        } else if (that._resizeY) {
            resizableAttr = "vertical";
        } else {
            resizableAttr = "none";
        }

        sbTagString.appendFormatLine("<div class='{0}' {1}>"
            , that._UUID, that._attributes);

        sbTagString.appendFormat("<textarea class='{0}' style='height:{1};' readonly>1</textarea>", vpConst.MANUAL_CODE_INPUT_AREA_LINE, that._height);
        sbTagString.appendFormatLine("<textarea class='{0}' style='height:{1};resize:{2}' {3} onscroll='{4}'>{5}</textarea>"
            , vpConst.MANUAL_CODE_INPUT_AREA, that._height, resizableAttr, that._compID == "" ? "" : vpCommon.formatString("id='{0}'", that._compID), scrollSyncFunc, that._content);

        sbTagString.appendLine("</div>");

        return sbTagString.toString();
    }

    return {
        vpLineNumberTextArea: vpLineNumberTextArea
    }
});