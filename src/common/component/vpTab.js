define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/component/vpComComponent'
], function (requirejs, $, vpCommon, vpConst, sb, vpComComponent) {
    /**
     * @class vpTab 탭 컨트롤 객체
     * @constructor
     * @param {String} tabID 탭 아이디
     */
    var vpTab = function(tabID = "") {
        this._tabPages = new Array();
        this._tabID = tabID;
        this.setUUID();
    };
    vpTab.prototype = Object.create(vpComComponent.vpComComponent.prototype);

    /**
     * 탭 페이지 추가
     * @param {String} caption 탭 버튼 캡션
     * @param {String} pageID 탭 컨텐츠 영역 id
     */
    vpTab.prototype.addTabPage = function(caption, pageID) {
        if (pageID === undefined) {
            pageID = vpConst.VP_ID_PREFIX + caption.replace(/ /gi, "");
        }

        this._tabPages.push(new Map().set("caption", caption).set("pageid", pageID));
    }

    /**
     * 탭 태그 생성
     * @returns html tab tag string
     */
    vpTab.prototype.toTagString = function() {
        var sbTagString = new sb.StringBuilder();
        var that = this;
        
        sbTagString.appendFormatLine("<div class='{0} {1}' {2}>"
            , that._UUID, vpConst.TAB_CONTAINER, that._tabID == "" ? "" : vpCommon.formatString("id='{0}'", that._tabID));

        /** 2021 01 17 장안태 팀장 코드 주석 처리 */
        // sbTagString.appendFormatLine("<ul class='{0}'>", vpConst.TAB_HEAD_CONTROL);
        // for (tabIdx = 0; tabIdx < that._tabPages.length; tabIdx++) {
        //     sbTagString.appendFormatLine("<li class='{0}' rel='{1}'>{2}</li>"
        //         , tabIdx == 0 ? "active" : "", that._tabPages[tabIdx].get("pageid"), that._tabPages[tabIdx].get("caption"));
        // }

        sbTagString.appendLine("</ul>");
        sbTagString.appendFormatLine("<div class='{0}{1}'>", vpConst.VP_CLASS_PREFIX, "tab-content");
        
        /** 2021 01 17 이진용 주임 추가 */
        for (tabIdx = 0; tabIdx < that._tabPages.length; tabIdx++) {
            sbTagString.appendFormatLine("<div class='{0}{1}' {2} id='{3}'></div>"
                ,vpConst.VP_CLASS_PREFIX, "tab-page", tabIdx == 1 ? "" : "style='display: none;'", that._tabPages[tabIdx].get("pageid"));
        }

        /** 2021 01 17 장안태 팀장 코드 주석 처리 */
        // for (tabIdx = 0; tabIdx < that._tabPages.length; tabIdx++) {
        //     sbTagString.appendFormatLine("<div class='{0}{1}' {2} id='{3}'></div>"
        //         ,vpConst.VP_CLASS_PREFIX, "tab-page", tabIdx == 0 ? "" : "style='display: none;'", that._tabPages[tabIdx].get("pageid"));
        // }


        sbTagString.appendLine("</div>");

        sbTagString.appendLine("</div>");

        return sbTagString.toString();
    }

    vpTab.prototype.pageSelector = function(pageIndex) {
        var that = this;
        // page index 가 유효하지 않은 경우
        if (pageIndex === undefined || pageIndex < 0 || pageIndex >= that._tabPages.length) {
            console.log("Err");
            return "";
        }
        
        return this.wrapSelector("#" + that._tabPages[pageIndex].get("pageid"));
    }

    return {
        vpTab: vpTab
    }
});