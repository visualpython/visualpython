define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, vpSuggestInputText, pdGen) {
    // 옵션 속성
    const funcOptProp = {
        funcName : "frozenset()"
        , funcID : "pyBuilt_frozenset"
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
        this.state = {

        }
        this.package = {
            input: [
                { name: 'vp_pyReturn' },
                { name: 'vp_pyObj' },
                { name: 'vp_pyStart' },
                { name: 'vp_pyStop' },
                { name: 'vp_pyStep' },
                { name: 'vp_pyArgMeta' }
            ]
        }
        // variable list for suggest input tag
        this.varList = [];
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
        return true;
    }

    PythonCommon.prototype.getMetadata = function(id) {
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
     * html 내부 binding 처리
     */
    PythonCommon.prototype.initHtml = function() {
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "python_common/index.css");

        var that = this;

        var sbPageContent = new sb.StringBuilder();
        var sbTagString = new sb.StringBuilder();

        

        // 필수 옵션 테이블 레이아웃
        var tblLayoutRequire = this.createVERSimpleLayout("25%");
        
        // 집합 유형
        sbTagString.clear();
        sbTagString.appendFormatLine('<select id="{0}" class="{1}">', 'vp_pySetType', 'vp-select');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'object', 'object');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'tuple', 'tuple');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'list', 'list');
        sbTagString.appendFormatLine('<option value="{0}">{1}</option>', 'range', 'range');
        sbTagString.appendLine('</select>');
        tblLayoutRequire.addRow("Set Type", sbTagString.toString());

        // Type 1. iterable object
        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_pyObj', 'vp-input')
        tblLayoutRequire.addRow("Input Object", sbTagString.toString());

        // Type2, 3. arguments
        // meta save
        // load metadata
        var decodedMeta = decodeURIComponent(that.getMetadata('vp_pyArgMeta'));
        
        sbTagString.clear();
        sbTagString.appendFormatLine('<div id="{0}">', 'vp_pySetArg');
        sbTagString.appendFormatLine('<input type="hidden" id="{0}" />', 'vp_pyArgMeta');
        if (decodedMeta != "") {
            // if metadata exist, use as a default
            var argMeta = JSON.parse(decodedMeta);
            argMeta != undefined && argMeta.forEach(arg => {
                sbTagString.appendFormatLine('<div class="{0}">', 'vp-py-arg-box');
                sbTagString.appendFormatLine('<input type="text" class="{0}" value="{1}"/>', 'vp-input vp-py-args', arg);
                sbTagString.appendFormatLine('<input type="button" value="{0}" class="{1}"/>', 'Del', 'vp-py-btn vp-py-arg-del');
                sbTagString.appendFormatLine('<input type="button" value="{0}" class="{1}"/>', 'Add', 'vp-py-btn vp-py-arg-add');
                sbTagString.appendLine('</div>');
            });

        } else {
            sbTagString.appendFormatLine('<div class="{0}">', 'vp-py-arg-box');
            sbTagString.appendFormatLine('<input type="text" class="{0}" />', 'vp-input vp-py-args');
            sbTagString.appendFormatLine('<input type="button" value="{0}" class="{1}"/>', 'Del', 'vp-py-btn vp-py-arg-del');
            sbTagString.appendFormatLine('<input type="button" value="{0}" class="{1}"/>', 'Add', 'vp-py-btn vp-py-arg-add');
            sbTagString.appendLine('</div>');
        }

        sbTagString.appendFormatLine('</div>');
        tblLayoutRequire.addRow("Input Arguments", sbTagString.toString());

        // Type 4. range
        sbTagString.clear();
        sbTagString.appendFormat('<input type="number" id="{0}" class="{1}"/>', 'vp_pyStart', 'vp-input vp-set-range');
        tblLayoutRequire.addRow("Start Number", sbTagString.toString());

        sbTagString.clear();
        sbTagString.appendFormat('<input type="number" id="{0}" class="{1}" />', 'vp_pyStop', 'vp-input vp-set-range');
        tblLayoutRequire.addReqRow("Stop Number", sbTagString.toString());

        sbTagString.clear();
        sbTagString.appendFormat('<input type="number" id="{0}" class="{1}"/>', 'vp_pyStep', 'vp-input vp-set-range');
        tblLayoutRequire.addRow("Step Number", sbTagString.toString());

        // return value
        sbTagString.clear();
        sbTagString.appendFormat('<input type="text" id="{0}" class="{1}" />', 'vp_pyReturn', 'vp-input');
        tblLayoutRequire.addRow("Return to", sbTagString.toString());
        
        // 필수 옵션 영역 (아코디언 박스)
        var accBoxRequire = this.createOptionContainer(vpConst.API_REQUIRE_OPTION_BOX_CAPTION);
        accBoxRequire.setOpenBox(true);
        accBoxRequire.appendContent(tblLayoutRequire.toTagString());

        sbPageContent.appendLine(accBoxRequire.toTagString());

        
        this.setPage(sbPageContent.toString());
        sbPageContent.clear();

        // async bind suggest input
        pdGen.vp_searchVarList([], function(result) {
            var varList = JSON.parse(result);
            varList = varList.map(function(v) {
                return { label: v.varName + ' (' + v.varType + ')', value: v.varName };
            });
            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
            suggestInput.setComponentID('vp_pyObj');
            suggestInput.addClass('vp-input');
            suggestInput.setSuggestList(function() { return varList; });
            suggestInput.setNormalFilter(false);
            suggestInput.setValue($(that.wrapSelector('#vp_pyObj')).val());
            $(that.wrapSelector('#vp_pyObj')).replaceWith(function() {
                return suggestInput.toTagString();
            })
        });

        // set hide/show for set type
        var value = $(this.wrapSelector('#vp_pySetType')).val();
        this.showSetPage(value);

        // E0. select set type
        $(this.wrapSelector('#vp_pySetType')).change(function() {
            var value = $(this).val();
            that.showSetPage(value);
        });

        // E1. add row
        $(document).on('click', this.wrapSelector('.vp-py-arg-add'), function() {
            var suggestInput = new vpSuggestInputText.vpSuggestInputText();
            suggestInput.addClass('vp-input vp-py-args');
            suggestInput.setSuggestList(function() { return that.varList; });
            suggestInput.setNormalFilter(false);

            sbTagString.clear();
            sbTagString.appendFormatLine('<div class="{0}">', 'vp-py-arg-box');
            sbTagString.appendLine(suggestInput.toTagString());
            sbTagString.appendFormatLine('<input type="button" value="{0}" class="{1}"/>', 'Del', 'vp-py-btn vp-py-arg-del');
            sbTagString.appendFormatLine('<input type="button" value="{0}" class="{1}"/>', 'Add', 'vp-py-btn vp-py-arg-add');
            sbTagString.appendFormatLine('</div>');

            var tag = $(sbTagString.toString());


            // append after selected row
            $(this).closest('.vp-py-arg-box').after(tag);
            // focus on added input tag
            $(tag).find('.vp-py-args').focus();
        });

        // E1-2. add row by enter
        $(document).on('keydown', this.wrapSelector('.vp-py-args'), function(event) {
            if (event.keyCode == 13) {
                // add row by enter
                $(this).parent().find('.vp-py-arg-add').click();
            }
        });

        // E2. delete/clear row
        $(document).on('click', this.wrapSelector('.vp-py-arg-del'), function() {
            var length = $(that.wrapSelector('.vp-py-arg-box')).length;
            if (length <= 1) {
                // if only one left, clear it
                $(this).parent().find('.vp-py-args').val('');
            } else {
                // remove it
                $(this).closest('.vp-py-arg-box').remove();
            }
        });
    }

    /**
     * show selected set type
     * @param {string} setType object / range / tuple / list
     */
    PythonCommon.prototype.showSetPage = function(setType) {
        // hide object
        $(this.wrapSelector('#vp_pyObj')).closest('tr').hide();
        // hide arguments
        $(this.wrapSelector('#vp_pySetArg')).closest('tr').hide();
        // hide ranges
        $(this.wrapSelector('.vp-set-range')).closest('tr').hide();
        
        // show selected set type
        if (setType == 'object') {
            // show object
            $(this.wrapSelector('#vp_pyObj')).closest('tr').show();
        } else if (setType == 'range') {
            // show ranges
            $(this.wrapSelector('.vp-set-range')).closest('tr').show();
        } else {
            // show arguments
            $(this.wrapSelector('#vp_pySetArg')).closest('tr').show();
        }
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

        code.append('frozenset(');
        var setType = $(this.wrapSelector('#vp_pySetType')).val();
        if (setType == 'object') {
            var obj = $(this.wrapSelector('#vp_pyObj')).val();
            code.append(obj);
        } else if (setType == 'range') {
            var start = $(this.wrapSelector('#vp_pyStart')).val();
            var stop = $(this.wrapSelector('#vp_pyStop')).val();
            var step = $(this.wrapSelector('#vp_pyStep')).val();

            if (start != '') {
                code.appendFormat("{0}, ", start);
            }
            code.append(stop);
            if (step != '') {
                code.appendFormat(", {0}", step);
            }
        } else {
            var argCode = new sb.StringBuilder();
            var argMeta = [];
            var args = $(this.wrapSelector('#vp_pySetArg')).find('.vp-py-args');
            var validArgCount = 0;
            args.each((i, tag) => {
                var argValue = $(tag).val();
                if (argValue != '') {
                    if (validArgCount > 0) {
                        argCode.append(', ');
                    }
                    argCode.append(argValue);
                    argMeta.push(argValue);
                    validArgCount++;
                }
            });
            if (setType == 'tuple') {
                // tuple set
                code.appendFormat('({0})', argCode.toString());
            } else {
                // list set
                code.appendFormat('[{0}]', argCode.toString());
            }
        }
        code.append(')');

        // save argument metadata
        $(this.wrapSelector('#vp_pyArgMeta')).val(encodeURIComponent(JSON.stringify(argMeta)));

        

        if (addCell) {
            this.cellExecute(code.toString(), exec);
        }

        return code.toString();
    }

    return {
        initOption: initOption
    };
});
