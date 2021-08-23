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
        , funcID : "com_import"
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
                if ($(vpCommon.wrapSelector(vpCommon.formatString(".{0}", uuid))).length > 0) {
                    uuid = 'u' + vpCommon.getUUID();
                }
            }
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM))).find(vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE)).addClass(uuid);
            // 옵션 객체 생성
            var ipImport = new ImportPackage(uuid);
            ipImport.metadata = meta;
            
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
     * @param {JSON} meta 메타 데이터
     */
    var initOption = function(callback, meta) {
        // console.log('import 화면 실행');
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "file_io/import.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var ImportPackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        // Import 기본 패키지 목록
        this.packageList = [
            { library:'numpy',     alias:'np'}
            , { library:'pandas',  alias:'pd'}
            , { 
                library:'matplotlib.pyplot', alias:'plt' 
                , include: [
                    '%matplotlib inline'
                ]
            }
            , { library:'seaborn', alias:'sns'}
        ];
        
        this.package = {
            id: 'import',
            name: 'import package',
            library: 'common',
            description: '공통 패키지 임포트',
            code: '',
            input: [
                {
                    name: 'vp_importMeta'
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
        return true;

        // 부모 클래스 유효성 검사 호출.
        // vpFuncJS.VpFuncJS.prototype.optionValidation.apply(this);
    }


    /**
     * html 내부 binding 처리
     */
    ImportPackage.prototype.initHtml = function() {
        this.bindEvent();

        // if need additional css
        // this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "file_io/test.css");
    }

    /**
     * Import 기본 패키지 바인딩
     */
    ImportPackage.prototype.bindEvent = function() {
        var that = this;


        if (this.metadata) {
            try {
                var importMeta = JSON.parse(decodeURIComponent(this.metadata.options.find(x=>x.id=='vp_importMeta').value));
                importMeta && importMeta.forEach((obj, i) => {
                    // var tagTr = $(`<tr><td><input id="vp_library${i}" type="text" class="vp-input m vp-add-library" placeholder="library name" required value="${obj.library.toLowerCase()}"/></td>
                    // <td><input id="vp_alias${i}" type="text" class="vp-input m vp-add-alias" placeholder="as" value="${obj.alias}"/></td>
                    // <td><input type="button" class="vp-remove-option w100" style="width:100%;" value="x"></td></tr>`);
                    var tagTr = $(that.renderLibraryRow(i, obj.library.toLowerCase(), obj.alias));
                
                    $(this.wrapSelector("#vp_tblImport tr:last")).before(tagTr);
                });
            } catch {}
        } else {
            this.packageList.forEach((package, i) => {
                // <select class="vp-add-type">
                //         <option value="as">as</option>
                //         <option value="import">import</option>
                //     </select>
                // var tagTr = $(`<tr><td><input id="vp_library${i}" type="text" class="vp-input m vp-add-library" placeholder="library name" required value="${package.library.toLowerCase()}"/></td>
                // <td><input id="vp_alias${i}" type="text" class="vp-input m vp-add-alias" placeholder="as" value="${package.alias}"/></td>
                // <td><input type="button" class="vp-remove-option w100" style="width:100%;" value="x"></td></tr>`);
                var tagTr = $(that.renderLibraryRow(i, package.library.toLowerCase(), package.alias));

                $(this.wrapSelector("#vp_tblImport tr:last")).before(tagTr);
    
                // add to package input
                // that.package.input.push({ name: `vp_library${i}`});
                // that.package.input.push({ name: `vp_alias${i}`});
            });
        }

        // 라이브러리 삭제
        $(document).on("click", this.wrapSelector('.vp-remove-option'), function() {
             // X 아이콘과 동일한 행 삭제
             $(this).closest('tr').remove();
        });

        // 라이브러리 추가
        $(this.wrapSelector('#vp_addLibrary')).click(function() {
            var libsLength = $(that.wrapSelector("#vp_tblImport tr:not(:first):not(:last)")).length;

            // var tagTr = $(`<tr><td><input type="text" class="vp-add-library" placeholder="library name" required/></td>
            // <td><input type="text" class="vp-input m vp-add-alias" placeholder="alias"/></td>
            // <td><input type="button" class="vp-remove-option w100" style="width:100%;" value="x"></td></tr>`);
            var tagTr = $(that.renderLibraryRow(libsLength, '', ''));

            $(that.wrapSelector("#vp_tblImport tr:last")).before(tagTr);
        });

        // As / Import
        // $(document).on("change", this.wrapSelector('#vp_tblImport .vp-add-type'), function() {
        //     var tagAddName = $(this).closest('tr').find('.vp-add-alias');
        //     var value = $(this).val();

        //     // change placeholder
        //     tagAddName.attr({ 'placeholder': value });

        //     // set import name required
        //     if (value == 'import') {
        //         // import
        //         tagAddName.attr({ 'required': true });
        //     } else {
        //         // as
        //         tagAddName.removeAttr('required');
        //     }
        // });
        
    }

    ImportPackage.prototype.renderLibraryRow = function(idx, libraryName, aliasName) {
        var tag = new sb.StringBuilder();
        /**
         * <td><input id="vp_library${i}" type="text" class="vp-input m vp-add-library" placeholder="library name" required value="${package.library.toLowerCase()}"/></td>
                <td><input id="vp_alias${i}" type="text" class="vp-input m vp-add-alias" placeholder="as" value="${package.alias}"/></td>
                <td><input type="button" class="vp-remove-option w100" style="width:100%;" value="x"></td></tr>
         */
        tag.append('<tr>');
        tag.appendFormat('<td><input id="{0}" type="text" class="{1}" placeholder="{2}" required value="{3}"/></td>'
                        , 'vp_library' + idx, 'vp-input m vp-add-library', 'Type library name', libraryName);
        tag.appendFormat('<td><input id="{0}" type="text" class="{1}" placeholder="{2}" value="{3}"/></td>'
                        , 'vp_alias' + idx, 'vp-input m vp-add-alias', 'Type alias', aliasName);
        tag.appendFormat('<td class="{0}"><img src="{1}"/></td>', 'vp-remove-option w100 vp-cursor', '/nbextensions/visualpython/resource/close_small.svg');
        tag.append('</tr>');
        return tag.toString();
    }

    /**
     * 코드 생성
     * @param {boolean} addCell 셀 추가 여부
     * @param {boolean} exec 실행여부
     */
    ImportPackage.prototype.generateCode = function(addCell, exec) {
        // if (!this.optionValidation()) return;

        var sbCode = new sb.StringBuilder();

        // code generate with library list
        var importMeta = [];
        var libraryList = $(this.wrapSelector("#vp_tblImport tr:gt(0):not(:last)"));
        for (var idx = 0; idx < libraryList.length; idx++) {
            var pacName = $(libraryList[idx]).find('.vp-add-library').val();
            var pacAlias = $(libraryList[idx]).find('.vp-add-alias').val().trim();

            if (pacName == "") {
                continue;
            }
            if (sbCode.toString().trim().length > 0) {
                sbCode.appendLine();
            }
            sbCode.appendFormat("import {0}{1}", pacName, ((pacAlias === undefined || pacAlias === "") ? "" : (" as " + pacAlias)));

            this.packageList.forEach(pack => {
                if (pack.library == pacName) {
                    // if include code exists?
                    if (pack.include != undefined) {
                        pack.include.forEach(code => {
                            sbCode.appendLine();
                            sbCode.append(code);
                        });
                    }
                }
            })

            importMeta.push({ library: pacName, alias: pacAlias });
        }
        $(this.wrapSelector('#vp_importMeta')).val(encodeURIComponent(JSON.stringify(importMeta)));

        if (addCell) {
            this.cellExecute(sbCode.toString(), exec);
        }

        // TODO: 전체에게 해당 함수 리턴 요청
        this.generatedCode = sbCode.toString();
        return sbCode.toString();
    }

    

    return {
        initOption: initOption
    };
});
