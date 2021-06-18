define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
    , 'nbextensions/visualpython/src/component/fileNavigation/index'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, vpSuggestInputText, pdGen, fileNavigation) {
    // 옵션 속성
    const funcOptProp = {
        funcName : "open()"
        , funcID : "pyBuilt_open"
    }

    /**
     * html load 콜백. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     * @param {JSON} meta 메타 데이터
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
            var osSample = new PythonCommon(uuid);
            osSample.metadata = meta;
            
            // 옵션 속성 할당.
            osSample.setOptionProp(funcOptProp);

            // html 설정.
            osSample.initHtml();

            // TODO: meta load 처리 방안 검토. 
            // 방안 1. callback 에서 처리
            // 방안 2. initHtml 내에서 meta 존재 시 init과 동시에 처리.
            // 방안 3. initHtml 후에 옵션 내에서 load 함수 호출.

            callback(osSample);  // 객체를 callback 인자로 전달
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     * @param {JSON} meta 메타 데이터
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "python_common/index.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var PythonCommon = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        this.package = {
            input: [
                { name: 'vp_pyFile' },
                { name: 'vp_pyReturn' },

                { name: 'vp_pyMode' },
                { name: 'vp_pyBuffering' },
                { name: 'vp_pyEncoding' },
                { name: 'vp_pyErrors' },
                { name: 'vp_userOption' }
            ]
        }

        // file navigation : state 데이터 목록
        this.state = {
            paramData:{
                encoding: "utf-8" // 인코딩
                , delimiter: ","  // 구분자
            },
            returnVariable:"",    // 반환값
            isReturnVariable: false,
            fileExtension: "" // 확장자 // FIXME: file navigation 모든 파일 선택 가능하게
        };
        this.fileResultState = {
            pathInputId : this.wrapSelector('#vp_pyFile'),
            fileInputId : this.wrapSelector('#fileName')
        };
    }

    /**
     * vpFuncJS 에서 상속
     */
    PythonCommon.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    PythonCommon.prototype.optionValidation = function() {
        var required = [ 'vp_pyFile' ];
        for (var i=0; i < required.length; i++) {
            var tag = $(this.wrapSelector('#' + required[i]));
            var value = $(tag).val();
            if (value == '') {
                var label = $(tag).closest('tr').find('th').text().trim();
                vpCommon.renderAlertModal("'" + label + "' is required.");
                return false;
            }
        }
        return true;
    }

    /**
     * html 내부 binding 처리
     */
    PythonCommon.prototype.initHtml = function() {
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "python_common/index.css");

        var sbPageContent = new sb.StringBuilder();
        var sbTagString = new sb.StringBuilder();

        

        // 필수 옵션 테이블 레이아웃
        var tblLayoutRequire = this.createVERSimpleLayout("25%");

        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_pyFile', 'vp-input');
        sbTagString.appendFormatLine('<div id="{0}" class="{1}"></div>', 'vp_openFileNavigationBtn', 'vp-file-browser-button');
        tblLayoutRequire.addReqRow("Select File", sbTagString.toString());

        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_pyReturn', 'vp-input');
        tblLayoutRequire.addRow("Return to", sbTagString.toString());
        
        sbTagString.clear();
        sbTagString.appendFormat('<select id="{0}" class="{1}">', 'vp_pyModeSelector', 'vp-select');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', '', 'Default');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'custom', 'Custom');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'r', 'read');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'w', 'write');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'x', 'create');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'a', 'append');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'b', 'binary mode');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 't', 'text mode');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', '+', 'read & write');
        sbTagString.appendLine('</select>');
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_pyMode', 'vp-input');
        tblLayoutRequire.addRow("Mode", sbTagString.toString());

        // 필수 옵션 영역 (아코디언 박스)
        var accBoxRequire = this.createOptionContainer(vpConst.API_REQUIRE_OPTION_BOX_CAPTION);
        accBoxRequire.setOpenBox(true);
        accBoxRequire.appendContent(tblLayoutRequire.toTagString());

        sbPageContent.appendLine(accBoxRequire.toTagString());

        // 추가 옵션 테이블 레이아웃
        var tblLayoutAdditional = this.createVERSimpleLayout("25%");

        sbTagString.clear();
        sbTagString.appendFormat('<input type="number" id="{0}" class="{1}" />', 'vp_pyBuffering', 'vp-input');
        tblLayoutAdditional.addRow("Buffering", sbTagString.toString());

        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_pyEncoding', 'vp-input');
        tblLayoutAdditional.addRow("Encoding", sbTagString.toString());

        sbTagString.clear();
        // sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_pyErrors', 'vp-input');
        var suggestInput = new vpSuggestInputText.vpSuggestInputText();
        suggestInput.setComponentID("vp_pyErrors");
        suggestInput.addClass('vp-input');
        suggestInput.setSuggestList(function() { return [
            { label: 'strict', value: "'strict'" },
            { label: 'ignore', value: "'ignore'" },
            { label: 'replace', value: "'replace'" },
            { label: 'surrogateescape', value: "'surrogateescape'" },
            { label: 'xmlcharrefreplace', value: "'xmlcharrefreplace'" },
            { label: 'backslashreplace', value: "'backslashreplace'" },
            { label: 'namereplace', value: "'namereplace'" }
        ]; });
        suggestInput.setNormalFilter(false);
        // tblLayoutRequire.addReqRow("Errors", sbTagString.toString());
        tblLayoutAdditional.addRow("Errors", suggestInput.toTagString());

        sbTagString.clear();
        sbTagString.appendFormatLine('<input id="{0}" type="text" class="vp-input" placeholder="{1}"/>'
                                    , 'vp_userOption', 'key=value, key=value ...');
        tblLayoutAdditional.addRow('User Option', sbTagString.toString());

        // // 추가 옵션 영역
        var accBoxAdditional = this.createOptionContainer(vpConst.API_ADDITIONAL_OPTION_BOX_CAPTION);
        accBoxAdditional.appendContent(tblLayoutAdditional.toTagString());

        sbPageContent.appendLine(accBoxAdditional.toTagString());

                
        this.setPage(sbPageContent.toString());
        sbPageContent.clear();

        var that = this;

        // E1. mode selector
        $(this.wrapSelector('#vp_pyMode')).hide();
        $(this.wrapSelector('#vp_pyModeSelector')).change(function() {
            var value = $(this).val();
            if (value == 'custom') {
                $(that.wrapSelector('#vp_pyMode')).show();
                $(that.wrapSelector('#vp_pyMode')).val('');
            } else {
                $(that.wrapSelector('#vp_pyMode')).hide();
                $(that.wrapSelector('#vp_pyMode')).val(value);
            }
        });

        // E2. 파일 네비게이션 오픈
        $(this.wrapSelector('#vp_openFileNavigationBtn')).click(async function() {
            
            var loadURLstyle = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH;
            var loadURLhtml = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/fileNavigation/index.html";
            
            that.loadCss( loadURLstyle + "component/fileNavigation.css");
    
            await $(`<div id="vp_fileNavigation"></div>`)
                    .load(loadURLhtml, () => {

                        $('#vp_fileNavigation').removeClass("hide");
                        $('#vp_fileNavigation').addClass("show");

                        var { vp_init
                              , vp_bindEventFunctions } = fileNavigation;
                    
                        fileNavigation.vp_init(that, "SAVE_FILE");
                        // fileNavigation.vp_init(that.getStateAll());
                        fileNavigation.vp_bindEventFunctions();
                    })
                    .appendTo("#site");
        });
    }

    /**
     * 코드 생성
     * @param {boolean} addCell 셀에 추가
     * @param {boolean} exec 실행여부
     * @returns 생성된 코드
     */
    PythonCommon.prototype.generateCode = function(addCell = false, exec = false) {
        var code = new sb.StringBuilder();
        
        var returnVar = $(this.wrapSelector('#vp_pyReturn')).val();
        if (returnVar != '') {
            code.appendFormat("{0} = ", returnVar);
        }
        code.appendFormat("open('{0}'", $(this.wrapSelector('#vp_pyFile')).val());
        var mode = $(this.wrapSelector('#vp_pyMode')).val();
        if (mode != '') {
            code.appendFormat(", mode='{0}'", mode);
        }
        var buffering = $(this.wrapSelector('#vp_pyBuffering')).val();
        if (buffering != '') {
            code.appendFormat(", buffering={0}", buffering);
        }
        var encoding = $(this.wrapSelector('#vp_pyEncoding')).val();
        if (encoding != '') {
            code.appendFormat(", encoding='{0}'", encoding);
        }
        var errors = $(this.wrapSelector('#vp_pyErrors')).val();
        if (errors != '') {
            code.appendFormat(", errors={0}", errors);
        }
        var userOption = $(this.wrapSelector('#vp_userOption')).val();
        if (userOption != '') {
            code.appendFormat(", {0}", userOption);
        }
        code.append(')');

        

        if (addCell) {
            this.cellExecute(code.toString(), exec);
        }

        return code.toString();
    }

    return {
        initOption: initOption
    };
});
