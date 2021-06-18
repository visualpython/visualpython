define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "Import"
        , funcID : "com_import1"
        , funcArgs : [
            { caption : "arg1", type : "number", nullable : false }
            , { caption : "arg2", type : Array, nullable : true }
            , { caption : "arg3", type : "string", nullable : true }
        ]
        , funcRetruns : Array
    }

    /**
     * html load 콜백. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var optionLoadCallback = function(callback) {
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
            $(vpCommon.wrapSelector(vpConst.OPTION_GREEN_ROOM)).find(vpConst.OPTION_PAGE).addClass(uuid);
            // 옵션 객체 생성
            var ipImport = new ImportPackage(uuid);
            // 옵션 속성 할당.
            ipImport.setOptionProp(funcOptProp);
            // html 설정.
            ipImport.initHtml();
            callback(ipImport);  // 공통 객체를 callback 인자로 전달
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var initOption = function(callback) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpConst.OPTION_GREEN_ROOM), "file_io/import_sample.html", optionLoadCallback, callback);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var ImportPackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        // 그리드 헤더
        this.tagDefaultGridHeader = "<tr><th></th><th>라이브러리</th><th>축약어</th></tr>";
        // Import 기본 패키지 목록
        this.packageList = [
            { 'name':'numpy', 'variable':'np'}
            , { 'name':'pandas', 'variable':'pd'}
            , { 'name':'matplotlib.pyplot', 'variable':'plt'}
            , { 'name':'seaborn', 'variable':'sns'}
        ];
        
        this.package = {
            id: 'import',
            name: 'import package',
            library: 'common',
            description: '공통 패키지 임포트',
            code: '',
            input: [
                {
                }
            ],
            variable: [],
            output: [
                {
                }
            ]
        }
    }

    /**
     * vpFuncJS 에서 상속
     */
    ImportPackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    ImportPackage.prototype.optionValidation = function() {
        // 체크된 import 패키지가 없는 경우
        if ($(this.wrapSelector("td input[type='checkbox']:checked")).length < 1) {
            alert("Not select package.");
            return false;
        }
        // 폰트 설정이 입력되지 않은 경우
        // if ($(this.wrapSelector("#vp_slctFontList")).val() == "") {
        //     alert("Not select font");
        //     return false;
        // }
        // if ($(this.wrapSelector("#vp_txtFontSize")).val() == "") {
        //     alert("Not select font size");
        //     return false;
        // }
        return true;

        // 부모 클래스 유효성 검사 호출.
        // vpFuncJS.VpFuncJS.prototype.optionValidation.apply(this);
    }


    /**
     * html 내부 binding 처리
     */
    ImportPackage.prototype.initHtml = function() {
        this.bindImportPackageGrid();

        // this.bindFontSetting();

        // if need additional css
        // this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "file_io/test.css");
    }

    /**
     * Import 기본 패키지 바인딩
     */
    ImportPackage.prototype.bindImportPackageGrid = function() {
        $(this.wrapSelector("#vp_tblImport")).append(this.tagDefaultGridHeader);

        this.packageList.forEach(package => {
            var tr = document.createElement("tr");
            $(tr).attr("name", package.name.toLowerCase());
            $(tr).append("<td class='td_check'><input type='checkbox' value='" + package.name.toLowerCase() + "' checked /></td>");
            $(tr).append("<td class='td_name'>" + package.name + "</td>");
            $(tr).append("<td class='td_text'><input type='text' value='" + package.variable + "' disabled/></td>");
        
            $(this.wrapSelector("#vp_tblImport")).append(tr);
        });
    }

    /**
     * 폰트 설정 바인딩
     */
    ImportPackage.prototype.bindFontSetting = function() {
        var sbCmd = new sb.StringBuilder();
        sbCmd.appendLine("import matplotlib.font_manager as fm");
        sbCmd.appendLine("_ttflist = fm.fontManager.ttflist");
        sbCmd.append("print([{'name': f.name, 'path': f.fname, 'style':f.style, 'variant': f.variant} for f in _ttflist])");
        
        var that = this;
        this.kernelExecute(sbCmd.toString(), function (result) {
            var varList = JSON.parse(result.replace(/'/gi, `"`));
            
            // 데이터 프레임 select 태그 구성
            var sbTags = new sb.StringBuilder();
            varList.forEach(listVar => {
                sbTags.appendFormatLine("<option value='{0}'>{1}</option>", listVar.name, listVar.name);
            });

            $(that.wrapSelector("#vp_slctFontList")).html(sbTags.toString());
        });
    }

    /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    ImportPackage.prototype.generateCode = function(exec) {
        // if (!this.optionValidation()) return;

        var sbCode = new sb.StringBuilder();


        var tagCheckedPackage = $(this.wrapSelector("td input[type='checkbox']:checked"));
        for (var idx = 0; idx < tagCheckedPackage.length; idx++) {
            var pacName = tagCheckedPackage[idx].value;
            var pacAcro = $(this.wrapSelector("tr[name='" + pacName + "'] td.td_text input")).val();

            sbCode.appendFormatLine("import {0}", pacName + ((pacAcro === undefined || pacAcro === "") ? "" : (" as " + pacAcro)));
        }

        var fontName = $(this.wrapSelector("#vp_slctFontList")).val();
        var fontSize = $(this.wrapSelector("#vp_txtFontSize")).val();

        // 폰트 정보 추가
        // sbCode.appendLine();
        // sbCode.appendLine("#from matplotlib.pylab import rcParams, style");
        // sbCode.appendLine("#rcParams['figure.figsize'] = 12, 8");
        // sbCode.appendFormatLine("#rcParams['font.family'] = '{0}'", fontName);
        // sbCode.appendFormatLine("#rcParams['font.size'] = {0}", fontSize);


        // if (exec) {
            this.cellExecute(sbCode.toString(), exec);
        // }

        // TODO: 전체에게 해당 함수 리턴 요청
        this.generatedCode = sbCode.toString();
        return sbCode.toString();
    }

    

    return {
        initOption: initOption
    };
});
