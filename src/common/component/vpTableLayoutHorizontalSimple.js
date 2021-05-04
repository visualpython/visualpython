define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/component/vpComComponent'
], function (requirejs, $, vpCommon, vpConst, sb, vpComComponent) {
    /**
     * @class vpTableLayoutHorizontalSimple 테이블 레이아웃 심플버전. 가로 구성
     * @constructor
     */
    var vpTableLayoutHorizontalSimple = function() {
        this.setUUID();
        this._colWidth = new Array();
        this._header = "";
        this._tbodyContent = new Array();
        this._additionalClass = "";
        this._mergeCellClass = "";
        this._isCenterHead = true;
        this.MERGED_CELL = vpConst.TABLE_LAYOUT_MERGED_CELL;
    };
    
    vpTableLayoutHorizontalSimple.prototype = Object.create(vpComComponent.vpComComponent.prototype);

    /**
     * 테이블 헤더 넓이 지정
     * @param {Array} colWidth 테이블 헤더 넓이
     */
    vpTableLayoutHorizontalSimple.prototype.setColWidth = function(colWidth = new Array()) {
        this._colWidth = colWidth;
    }

    /**
     * 테이블 헤더 중앙정렬 여부 지정
     * @param {boolean} isCenterHead 테이블 헤더 중앙정렬 여부
     */
    vpTableLayoutHorizontalSimple.prototype.setHeaderCellCenterAlign = function(isCenterHead = true) {
        this._isCenterHead = isCenterHead;
    }

    /**
     * 병합 셀 클래스 설정
     * @param {String} mergeCellClass 병합 셀 클래스
     */
    vpTableLayoutHorizontalSimple.prototype.setMergeCellClass = function(mergeCellClass = "") {
        this._mergeCellClass = mergeCellClass == "" ? mergeCellClass : vpCommon.formatString("class='{0}'", mergeCellClass);
    }

    /**
     * 추가 클래스 설정
     * @param {String} additionalClass 추가 클래스
     */
    vpTableLayoutHorizontalSimple.prototype.addClass = function(additionalClass = "") {
        if (additionalClass == "") return;
        this._additionalClass = vpCommon.formatString("{0} {1}", this._additionalClass, additionalClass);
    }

    /**
     * 테이블 헤더 정보 설정
     * @param {Array} caption 테이블 헤더 설정
     */
    vpTableLayoutHorizontalSimple.prototype.setHeader = function(header = new Array()) {
        var that = this;
        if (header[0] == this.MERGED_CELL) {
            this._header = "";
            console.error("The first cell cannot be merged.");
            return -2;
        }

        if (header.length < 1) {
            this._header = "";
        } else {
            var mergeCnt = 1;
            var headerString = new sb.StringBuilder();
            headerString.appendLine("<tr>");

            for (var idx = 0; idx < header.length; idx++) {
                mergeCnt = 1;
                if (header[idx] == this.MERGED_CELL) continue;
                // 병합된 수 체크
                for (var subIdx = idx + 1; subIdx < header.length; subIdx++) {
                    if (header[subIdx] != this.MERGED_CELL) break;
                    mergeCnt++;
                }

                headerString.appendFormatLine("<th {0} {1}>{2}</th>"
                    , that._isCenterHead ? vpCommon.formatString("class='{0}'", vpConst.TABLE_LAYOUT_CELL_CENTER_ALIGN) : ""
                    , mergeCnt > 1 ? vpCommon.formatString("colspan={0}", mergeCnt) : "", header[idx]);
            }

            headerString.appendLine("</tr>");

            this._header = headerString.toString();
        }
    }

    /**
     * 테이블 row 추가
     * @param {Array} content 로우 테이블 데이터
     * @param {number} lineIndex 추가될 라인 index (미지정시 마지막 라인에 추가)
     */
    vpTableLayoutHorizontalSimple.prototype.addRow = function(content = new Array(), lineIndex) {
        var that = this;

        if (content.length < 1) {
            console.warn("Content length is 0, so skipped addRow");
            return;
        }

        if (content[0] == this.MERGED_CELL) {
            console.error("The first cell cannot be merged.");
            return -2;
        }
        
        var mergeCnt = 1;
        var rowString = new sb.StringBuilder();
        rowString.appendLine("<tr>");

        for (var idx = 0; idx < content.length; idx++) {
            mergeCnt = 1;
            if (content[idx] == this.MERGED_CELL) continue;
            // 병합된 수 체크
            for (var subIdx = idx + 1; subIdx < content.length; subIdx++) {
                if (content[subIdx] != this.MERGED_CELL) break;
                mergeCnt++;
            }

            if (mergeCnt > 1) {
                rowString.appendFormatLine("<td {0} colspan={1}>{2}</td>", that._mergeCellClass, mergeCnt, content[idx]);
            } else {
                rowString.appendFormatLine("<td>{0}</td>", content[idx]);
            }
        }

        rowString.appendLine("</tr>");

        if (lineIndex === undefined) {
            this._tbodyContent.push(rowString.toString());
        } else if (typeof lineIndex == "number") {
            this._tbodyContent.splice(lineIndex, 0, rowString.toString());
        } else {
            console.error("Parameter lineIndex is not valid");
            return -1;
        }
    }

    /**
     * 테이블 레이아웃 심플버전 태그 생성
     * @returns html 테이블 레이아웃 심플버전 tag string
     */
    vpTableLayoutHorizontalSimple.prototype.toTagString = function() {
        var sbTagString = new sb.StringBuilder();
        var that = this;

        sbTagString.appendFormatLine("<table class='{0} {1} {2}'>"
            , that._UUID, vpConst.OPTION_HORIZONTAL_TABLE_LAYOUT, that._additionalClass);

        if (that._colWidth.length > 0) {
            sbTagString.append("<colgroup>");

            for (var idx = 0; idx < that._colWidth.length; idx++) {
                sbTagString.appendFormat("<col width='{0}'/>", that._colWidth[idx] == undefined || that._colWidth[idx].trim() == "" ? "*" : that._colWidth[idx]);
            }

            sbTagString.appendLine("</colgroup>");
        }

        sbTagString.appendLine("<tbody>");

        sbTagString.appendLine(that._header);

        for (var idx = 0; idx < that._tbodyContent.length; idx++) {
            sbTagString.appendLine(that._tbodyContent[idx]);
        }

        sbTagString.appendLine("</tbody>");

        sbTagString.appendLine("</table>");

        return sbTagString.toString();
    }

    return {
        vpTableLayoutHorizontalSimple: vpTableLayoutHorizontalSimple
    }
});