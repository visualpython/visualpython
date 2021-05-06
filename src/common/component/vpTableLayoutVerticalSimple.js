define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/component/vpComComponent'
], function (requirejs, $, vpCommon, vpConst, sb, vpComComponent) {
    /**
     * @class vpTableLayoutVerticalSimple 테이블 레이아웃 심플버전. 세로 구성, <헤더, 데이터> 페어
     * @constructor
     */
    var vpTableLayoutVerticalSimple = function() {
        this.setUUID();
        this._thWidth = "50%";
        this._tbodyContent = new Array();
        this._additionalClass = "";
    };

    vpTableLayoutVerticalSimple.prototype = Object.create(vpComComponent.vpComComponent.prototype);

    /**
     * 테이블 헤더 넓이 지정
     * @param {String} thWidth 테이블 헤더 넓이
     */
    vpTableLayoutVerticalSimple.prototype.setTHWidth = function(thWidth = "50%") {
        if (thWidth.trim() == "") thWidth = "50%";
        this._thWidth = thWidth;
    }

    /**
     * 추가 클래스 설정
     * @param {String} additionalClass 추가 클래스
     */
    vpTableLayoutVerticalSimple.prototype.addClass = function(additionalClass = "") {
        if (additionalClass == "") return;
        this._additionalClass = vpCommon.formatString("{0} {1}", this._additionalClass, additionalClass);
    }

    /**
     * 테이블 row 추가
     * @param {String} caption 로우 테이블 헤더 캡션
     * @param {String} content 로우 테이블 데이터
     * @param {number} lineIndex 추가될 라인 index (미지정시 마지막 라인에 추가)
     */
    vpTableLayoutVerticalSimple.prototype.addRow = function(caption = "", content = "", lineIndex) {
        var rowString = vpCommon.formatString("<tr><th>{0}</th><td>{1}</td></tr>", caption, content);
        if (lineIndex === undefined) {
            this._tbodyContent.push(rowString);
        } else if (typeof lineIndex == "number") {
            this._tbodyContent.splice(lineIndex, 0, rowString);
        } else {
            console.error("Parameter lineIndex is not valid");
            return -1;
        }
    }

    /**
     * 테이블 require row 추가
     * @param {String} caption 로우 테이블 헤더 캡션
     * @param {String} content 로우 테이블 데이터
     * @param {number} lineIndex 추가될 라인 index (미지정시 마지막 라인에 추가)
     */
    vpTableLayoutVerticalSimple.prototype.addReqRow = function(caption = "", content = "", lineIndex) {
        var rowString = vpCommon.formatString("<tr><th class='{0}'>{1}</th><td>{2}</td></tr>", vpConst.COLOR_FONT_ORANGE, caption, content);
        if (lineIndex === undefined) {
            this._tbodyContent.push(rowString);
        } else if (typeof lineIndex == "number") {
            this._tbodyContent.splice(lineIndex, 0, rowString);
        } else {
            console.error("Parameter lineIndex is not valid");
            return -1;
        }
    }

    /**
     * 테이블 헤더 content length 만큼 rowsapn 된 row 추가 (최소 1row는 추가 됨)
     * @param {String} caption 로우 테이블 헤더 캡션
     * @param {Array} content 로우 테이블 데이터
     * @param {number} lineIndex 추가될 라인 index (미지정시 마지막 라인에 추가)
     */
    vpTableLayoutVerticalSimple.prototype.addRowSpanRow = function(caption = "", content = new Array(), lineIndex) {
        if (content.length == 0) {
            content.push("");
        }
        
        var sbRowString = new sb.StringBuilder();

        for (var idx = 0; idx < content.length; idx++) {
            if (idx == 0) {
                sbRowString.appendFormatLine("<tr><th rowspan='{0}'>{1}</th><td>{2}</td></tr>", content.length, caption, content[idx]);
            } else {
                sbRowString.appendFormatLine("<tr><td>{0}</td></tr>", content[idx]);
            }
        }
        
        if (lineIndex === undefined) {
            this._tbodyContent.push(sbRowString.toString());
        } else if (typeof lineIndex == "number") {
            this._tbodyContent.splice(lineIndex, 0, sbRowString.toString());
        } else {
            console.error("Parameter lineIndex is not valid");
            return -1;
        }
    }

    /**
     * 테이블 레이아웃 심플버전 태그 생성
     * @returns html 테이블 레이아웃 심플버전 tag string
     */
    vpTableLayoutVerticalSimple.prototype.toTagString = function() {
        var sbTagString = new sb.StringBuilder();
        var that = this;

        sbTagString.appendFormatLine("<table class='{0} {1} {2}'>"
            , that._UUID, vpConst.OPTION_VERTICAL_TABLE_LAYOUT, that._additionalClass);

        sbTagString.appendFormatLine("<colgroup><col width='{0}'/><col width='*'/></colgroup>", that._thWidth);

        sbTagString.appendLine("<tbody>");

        for (var idx = 0; idx < that._tbodyContent.length; idx++) {
            sbTagString.appendLine(that._tbodyContent[idx]);
        }

        sbTagString.appendLine("</tbody>");

        sbTagString.appendLine("</table>");

        return sbTagString.toString();
    }

    return {
        vpTableLayoutVerticalSimple: vpTableLayoutVerticalSimple
    }
});