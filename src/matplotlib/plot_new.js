define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/container/vpContainer'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
    , 'nbextensions/visualpython/src/matplotlib/plotLibrary'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, vpContainer, pdGen, plotLib) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "Make chart"
        , funcID : "mp_plotNew"  // TODO: ID 규칙 생성 필요
    }

    /**
     * html load 콜백. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var optionLoadCallback = function(callback, meta) {
        // document.getElementsByTagName("head")[0].appendChild(link);
        // 컨테이너에서 전달된 callback 함수가 존재하면 실행.
        if (typeof(callback) === 'function') {
            var uuid = 'u' + vpCommon.getUUID();
            // 최대 10회 중복되지 않도록 체크
            for (var idx = 0; idx < 10; idx++) {
                // 이미 사용중인 uuid 인 경우 다시 생성
                if ($(vpConst.VP_CONTAINER_ID).find("." + uuid).length > 0) {
                    uuid = 'u' + vpCommon.getUUID();
                }
            }
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM))).find(vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE)).addClass(uuid);

            // 옵션 객체 생성
            var mpPackage = new MatplotPackage(uuid);
            mpPackage.metadata = meta;

            // 옵션 속성 할당.
            mpPackage.setOptionProp(funcOptProp);
            // html 설정.
            mpPackage.initHtml();
            callback(mpPackage);  // 공통 객체를 callback 인자로 전달
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "matplotlib/plot_new.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var MatplotPackage = function(uuid) {
        this.uuid = uuid;           // Load html 영역의 uuid.
        this.package = {};
    }

    /**
     * vpFuncJS 에서 상속
     */
    MatplotPackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * html 내부 binding 처리
     */
    MatplotPackage.prototype.initHtml = function() {
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/commonPandas.css");
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "matplotlib/plot.css");

        var sbPageContent = new sb.StringBuilder();
        var sbTagString = new sb.StringBuilder();

        // matplot contents
        // 1. subplot setting 테이블 레이아웃
        var tblLayoutSubPlot = this.createVERSimpleLayout("20%");
        tblLayoutSubPlot.addClass(vpConst.API_ADDITIONAL_OPTION_BOX_CAPTION);
        tblLayoutSubPlot.addClass('vp-subplot-table');

        // 1-add. subplot setting
        // TODO:
        // 1-1. figure variable
        sbTagString.clear();
        sbTagString.appendFormatLine("<input type='text' id='vp_figure' class='vp-input' placeholder='{0}'/>", "fig");
        tblLayoutSubPlot.addRow("figure variable", sbTagString.toString());

        // 1-2. row/column
        sbTagString.clear();
        sbTagString.appendFormatLine(`<input type="number" class="{0}" id="{1}" index=0 placeholder="{2}" value="1"/>`
                                    , "vp-input s input-range"
                                    , "vp_subplotsRows"
                                    , "row"
        );
        sbTagString.appendFormatLine(`<input type="range" class="{0}" id="{1}" min="0" max="30" value="1"/>`, "vp-range", "vp_subplotsRowsRange");
        tblLayoutSubPlot.addRow("row count", sbTagString.toString());
        sbTagString.clear();
        sbTagString.appendFormatLine(`<input type="number" class="{0}" id="{1}" index=0 placeholder="{2}" value="1"/>`
                                    , "vp-input s input-range"
                                    , "vp_subplotsCols"
                                    , "col"
        );
        sbTagString.appendFormatLine(`<input type="range" class="{0}" id="{1}" min="0" max="30" value="1"/>`, "vp-range", "vp_subplotsColsRange");
        tblLayoutSubPlot.addRow("column count", sbTagString.toString());

        // 1-3. figure size
        sbTagString.clear();
        sbTagString.appendFormatLine("(<input type='number' id='vp_figureWidth' class='vp-input m' placeholder='{0}'/>,", "width");
        sbTagString.appendFormatLine("<input type='number' id='vp_figureHeight' class='vp-input m' placeholder='{0}'/>)", "height");
        tblLayoutSubPlot.addRow("figure size", sbTagString.toString());

        // 1-end. subplot setting 아코디언 박스
        var accBoxSubplot = this.createOptionContainer('Subplot Setting');
        accBoxSubplot.appendContent(tblLayoutSubPlot.toTagString());
        sbPageContent.appendLine(accBoxSubplot.toTagString());

        // 2. required 테이블 레이아웃
        var tblLayoutRequired = this.createVERSimpleLayout("20%");
        tblLayoutRequired.addClass(vpConst.OPTION_TABLE_LAYOUT_HEAD_HIGHLIGHT);
        tblLayoutRequired.addClass('vp-required-table');

        // 2-add. required setting
        // TODO: subplotindex(r,c), kind, data(x,y), color/cmap, ... , user option
        // 2-1. subplot index
        sbTagString.clear();
        sbTagString.appendFormatLine("(<input type='number' id='vp_subplotRow' class='vp-input m' placeholder='{0}'/>,", "row");
        sbTagString.appendFormatLine("<input type='number' id='vp_subplotCol' class='vp-input m' placeholder='{0}'/>)", "col");
        // TODO: view button
        tblLayoutSubPlot.addRow("subplot position", sbTagString.toString());
        
        // 2-end. required 아코디언 박스
        var accBoxRequired = this.createOptionContainer(vpConst.API_REQUIRE_OPTION_BOX_CAPTION);
        accBoxRequired.setOpenBox(true);
        accBoxRequired.appendContent(tblLayoutRequired.toTagString());
        sbPageContent.appendLine(accBoxRequired.toTagString());

        // 3. Additional Options 테이블 레이아웃
        var tblLayoutAddOption = this.createVERSimpleLayout("20%");
        tblLayoutAddOption.addClass(vpConst.API_ADDITIONAL_OPTION_BOX_CAPTION);
        tblLayoutAddOption.addClass('vp-additional-table');

        // 3-add. Additional Options setting
        // TODO: title, label, limit, legend
        
        
        // 3-end. Additional Options 아코디언 박스
        var accBoxAddOption = this.createOptionContainer('Additional Options');
        accBoxAddOption.appendContent(tblLayoutAddOption.toTagString());
        sbPageContent.appendLine(accBoxAddOption.toTagString());

        // 페이지에 컨트롤 삽입 vpFuncJS 에서 제공
        $(this.wrapSelector()).append(sbPageContent.toString());
        
        // 차트 서브플롯 페이지 구성
        // this.bindSubplotOption1();
        // this.bindCmapSelector();

        // this.bindSubplotOption2();
    }

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    MatplotPackage.prototype.optionValidation = function() {

        return true;
    }

        /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    MatplotPackage.prototype.generateCode = function(addCell, exec) {
        var code = new sb.StringBuilder();

        //TODO:

        if (addCell) {
            // execute code
            this.cellExecute(code.toString(), exec);
        }

        return code.toString();
    }

    return {
        initOption: initOption
    }
});