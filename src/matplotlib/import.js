define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/container/vpContainer'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, vpContainer, pdGen, vpSuggestInputText) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "Import Matplotlib"
        , funcID : "mp_importMatplotlib"  // TODO: ID 규칙 생성 필요
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
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "pandas/common/commonEmptyPage.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var MatplotPackage = function(uuid) {
        this.uuid = uuid;           // Load html 영역의 uuid.
        this.package = {
            code: [
                'import matplotlib.pyplot as ${i0}'
                , '%matplotlib ${magic}'
            ],
            input: [
                {
                    name: 'i0',
                    label: 'Matplotlib.pyplot as',
                    type: 'int',
                    value: 'plt'
                },
                { name: 'magic' },
                { name: 'range' },
                { name: 'stylesheet' },
                { name: 'fontfamily' },
                { name: 'fontsize' }
            ]
        }
    }

    /**
     * vpFuncJS 에서 상속
     */
    MatplotPackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    MatplotPackage.prototype.optionValidation = function() {
        return true;

        // 부모 클래스 유효성 검사 호출.
        // vpFuncJS.VpFuncJS.prototype.optionValidation.apply(this);
    }


    /**
     * html 내부 binding 처리
     */
    MatplotPackage.prototype.initHtml = function() {
        var that = this;

        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/commonPandas.css");
        this.showFunctionTitle();

        // this.bindOptions();

        var sbPageContent = new sb.StringBuilder();
        var sbTagString = new sb.StringBuilder();

        // TODO: 필수 옵션 테이블 레이아웃
        var tblLayoutRequire = this.createVERSimpleLayout("30%");

        // 1. import matplotlib.pyplot as plt
        sbTagString.clear();
        sbTagString.appendFormatLine("<input type='text' class='vp-input' value='{0}' readonly/>", "plt");
        tblLayoutRequire.addReqRow("Matplotlib.pyplot as", sbTagString.toString());

        // FIXME: vpTableLayoutVerticalSimple에 addDivider 추가 가능한지 확인
        tblLayoutRequire.addRow("", "<hr style='margin: 0px;'/>");

        // 2. %matplotlib inline/notebook
        sbTagString.clear();
        sbTagString.appendFormatLine("<option value='{0}'>{1}</option>", "inline", "inline");
        sbTagString.appendFormatLine("<option value='{0}'>{1}</option>", "notebook", "notebook");
        var tempOptionTag = sbTagString.toString();

        sbTagString.clear();
        sbTagString.appendFormat('<select id="{0}" class="vp-select">{1}</select>', "magic", tempOptionTag);
        tblLayoutRequire.addReqRow("%matplotlib", sbTagString.toString());

        // FIXME: vpTableLayoutVerticalSimple에 addDivider 추가 가능한지 확인
        tblLayoutRequire.addRow("", "<hr style='margin: 0px;'/>"); 

        // 3. plt.style.use('style')
        sbTagString.clear();
        sbTagString.appendFormatLine("<option value='{0}'>{1}</option>", "all", "all");
        sbTagString.appendFormatLine("<option value='{0}'>{1}</option>", "part", "part");
        tempOptionTag = sbTagString.toString();

        sbTagString.clear();
        sbTagString.appendFormat('<select id="{0}" class="vp-select">{1}</select>', "range", tempOptionTag);
        tblLayoutRequire.addRow("Style Range", sbTagString.toString());

        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="vp-input"/>', "stylesheet");
        tblLayoutRequire.addRow("Style Sheet", sbTagString.toString());

        // FIXME: vpTableLayoutVerticalSimple에 addDivider 추가 가능한지 확인
        tblLayoutRequire.addRow("", "<hr style='margin: 0px;'/>"); 

        // 4. rcParams
        // #from matplotlib.pylab import rcParams
        // #rcParams['font.family'] = 'Gulim'
        // #rcParams['font.size'] = 10
        // #rcParams['figure.figsize'] = 12, 8
        // #rcParams['axes.grid'] = True
        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="vp-input" value="{1}"/>', "fontfamily", "'Gulim'");
        tblLayoutRequire.addRow("System Font", sbTagString.toString());

        sbTagString.clear();
        sbTagString.appendFormat('<input type="number" id="{0}" class="vp-input" value="10"/>', "fontsize");
        tblLayoutRequire.addRow("Font Size", sbTagString.toString());


        // 필수 옵션 영역 (아코디언 박스)
        var accBoxRequire = this.createOptionContainer(vpConst.API_REQUIRE_OPTION_BOX_CAPTION);
        accBoxRequire.setOpenBox(true);
        accBoxRequire.appendContent(tblLayoutRequire.toTagString());

        sbPageContent.appendLine(accBoxRequire.toTagString());

        // 페이지에 컨트롤 삽입 vpFuncJS 에서 제공
        $(this.wrapSelector()).append(sbPageContent.toString());
        
        // 이벤트 처리
        // e1. stylesheet autocomplete with SuggestInput
        this.bindStylesheet();

        // e2. system font autocomplete with SuggestInput
        this.bindSystemfont();

    }

    /**
     * 선택한 패키지명 입력
     */
    MatplotPackage.prototype.showFunctionTitle = function() {
        $(this.wrapSelector('.vp-funcNavi')).html(
            `
            <span class="vp-multilang" data-caption-id="funcNavi"> Matplotlib &gt; <strong><span data-caption-id="vp_functionName" class="vp_functionName">Import Matplotlib</span></strong></span>
            `
        )
        // $(this.wrapSelector('.vp_functionName')).text('Import Matplotlib');
    }

    /**
     * get metadata
     * @param {String} id id
     */
    MatplotPackage.prototype.getMetadata = function(id) {
        if (this.metadata == undefined)
            return "";
        var len = this.metadata.options.length;
        for (var i = 0; i < len; i++) {
            var obj = this.metadata.options[i];
            if (obj.id == id)
                return obj.value;
        }
        return "";
    }

    /**
     * stylesheet autocomplete
     */
    MatplotPackage.prototype.bindStylesheet = function() {
        var that = this;

        // 사용가능한 스타일 시트 조회
        var stylesheetTag = $(this.wrapSelector('#stylesheet'));
        // 스타일 시트 조회 코드
        var code = new sb.StringBuilder();
        code.appendLine('import matplotlib.pyplot as plt');
        code.appendLine('import json');
        // code.append(`print(json.dumps(plt.style.available))`);
        code.append(`print(json.dumps([{ 'label': s, 'value': "'"+s+"'" } for s in plt.style.available]))`);
        this.kernelExecute(code.toString(), function(result) {
            // 사용가능한 스타일 시트 목록
            var varList = JSON.parse(result);
            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
            suggestInput.setComponentID('stylesheet');
            suggestInput.addClass('vp-input');
            // metadata check
            var mdvalue = that.getMetadata('stylesheet');
            if (mdvalue != undefined && mdvalue != '') {
                suggestInput.setValue(mdvalue);
            }
            suggestInput.setSuggestList(function() { return varList; });
            // suggestInput.setNormalFilter(false);
            $(stylesheetTag).replaceWith(function() {
                return suggestInput.toTagString();
            });
        });
    };

    /**
     * font family autocomplete
     */
    MatplotPackage.prototype.bindSystemfont = function() {
        var that = this;

        // 사용가능한 폰트 목록 조회
        var fontFamilyTag = $(this.wrapSelector('#fontfamily'));
        // 폰트 조회 코드
        var code = new sb.StringBuilder();
        code.appendLine('import json');
        code.appendLine("import matplotlib.font_manager as fm");
        code.appendLine("_ttflist = fm.fontManager.ttflist");
        code.append(`print(json.dumps([{"label": f.name, "value":("'" + f.name + "'")} for f in _ttflist]))`);
        this.kernelExecute(code.toString(), function(result) {
            // 사용가능한 폰트 목록
            var varList = JSON.parse(result);
            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
            suggestInput.setComponentID('fontfamily');
            suggestInput.addClass('vp-input');
            // metadata check
            var mdvalue = that.getMetadata('fontfamily');
            if (mdvalue != undefined && mdvalue != '') {
                suggestInput.setValue(mdvalue);
            } else {
                suggestInput.setValue("'Gulim'");
            }
            suggestInput.setSuggestList(function() { return varList; });
            // suggestInput.setNormalFilter(false);
            $(fontFamilyTag).replaceWith(function() {
                return suggestInput.toTagString();
            });
        });
    };

    /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    MatplotPackage.prototype.generateCode = function(addCell, exec) {

        try {
            var sbCode = new sb.StringBuilder();

            // 코드 생성
            // 필수 입력 항목
            sbCode.appendFormatLine('import matplotlib.pyplot as {0}', $(this.wrapSelector('#i0')).val());
            sbCode.appendFormatLine('%matplotlib {0}', $(this.wrapSelector('#magic')).val());

            // style range, sheet
            var stylerange = $(this.wrapSelector('#range')).val();
            var stylesheet = $(this.wrapSelector('#stylesheet')).val();
            if (stylesheet != '') {
                if (stylerange == 'all') {
                    // 전체 범위 코드 구성
                    sbCode.appendFormat("plt.style.use('{0}')", stylesheet);    
                } else {
                    // 일부 범위 코드 구성
                    sbCode.appendFormatLine("with plt.style.context({0}):", stylesheet);
                    sbCode.append("    pass");
                }
            }

            // font family, size
            var fontfamily = $(this.wrapSelector('#fontfamily')).val();
            var fontsize = $(this.wrapSelector('#fontsize')).val();
            sbCode.appendLine('');
            sbCode.appendLine("from matplotlib.pylab import rcParams");
            if (fontfamily != '') {
                sbCode.appendFormatLine("rcParams['font.family'] = {0}", fontfamily);
            }
            if (fontsize != '') {
                sbCode.appendFormatLine("rcParams['font.size'] = {0}", fontsize);
            }
            sbCode.appendLine("#rcParams['figure.figsize'] = 12, 8");
            sbCode.appendLine("#rcParams['axes.grid'] = True");

            // 코드 추가 및 실행
            if (addCell) this.cellExecute(sbCode.toString(), exec);
        } catch (exmsg) {
            // 에러 표시
            vpCommon.renderAlertModal(exmsg);
            return "BREAK_RUN"; // 코드 생성 중 오류 발생
        }

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});