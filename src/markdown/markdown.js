define([
    'require'
    , 'jquery'
    , 'notebook/js/mathjaxutils'
    , 'components/marked/lib/marked'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/common/component/vpLineNumberTextArea'
    , 'nbextensions/visualpython/src/pandas/fileNavigation/index'
    , 'nbextensions/visualpython/src/pandas/fileNavigation/constData'
    // , 'nbextensions/visualpython/src/api_block/api'
], function (requirejs, $, mathjaxutils, marked, vpCommon, vpConst, sb, vpFuncJS, vpLineNumberTextArea, fileNavigation, constData
            ) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "Markdown"
        , funcID : "com_markdown"
    }

    var { FILE_NAVIGATION_TYPE, STATE_codeLine } = constData;

    // const { SetTextareaLineNumber_apiBlock } = api_blockApi;
    /**
     * html load 콜백. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     * @param {JSON} meta 메타 데이터
     */
    var optionLoadCallback = function(callback, meta) {
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
            var mMarkdown = new Markdown(uuid);
            mMarkdown.metadata = meta;
            
            // 옵션 속성 할당.
            mMarkdown.setOptionProp(funcOptProp);
            // html 설정.
            mMarkdown.initHtml();
            callback(mMarkdown);  // 공통 객체를 callback 인자로 전달
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     * @param {JSON} meta 메타 데이터
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "markdown/markdown.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var Markdown = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        this.packageList = [
            {}
        ]
        this.package = {
            id: 'com_markdown',
            name: 'Markdown',
            library: 'common',
            description: '마크다운',
            input: [
                {
                    name: vpCommon.formatString("{0}{1}", vpConst.VP_ID_PREFIX, "markdownEditor")
                },
                {
                    name: vpCommon.formatString("{0}{1}", vpConst.VP_ID_PREFIX, "imgAttachment")
                }
            ]
        }
        this.block = null;

        this.attachments = [];
    }

    /**
     * vpFuncJS 에서 상속
     */
    Markdown.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    Markdown.prototype.optionValidation = function() {
        return true;

        // 부모 클래스 유효성 검사 호출.
        // vpFuncJS.VpFuncJS.prototype.optionValidation.apply(this);
    }

    /**
     * html 내부 binding 처리
     */
    Markdown.prototype.initHtml = function() {
        var that = this;
        // const textBlock = this.getBlock();
        // console.log('textBlock',textBlock);
        // const blockUUID = textBlock.getUUID();
        // console.log('initHtml');
        var sbPageContent = new sb.StringBuilder();
        var lineNumberTextArea = new vpLineNumberTextArea.vpLineNumberTextArea(vpCommon.formatString("{0}{1}", vpConst.VP_ID_PREFIX, "markdownEditor"));
        lineNumberTextArea.setHeight("255px");
        sbPageContent.appendLine(lineNumberTextArea.toTagString());
        sbPageContent.appendFormatLine("<div class='rendered_html' id='{0}{1}'></div>", vpConst.VP_ID_PREFIX, "markdownPreview");

        // metadata load
        if (this.metadata) {
            console.log(this.metadata.options);
        }

        sbPageContent.appendFormatLine("<div id='{0}{1}'></div>", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea");

        this.setPage(sbPageContent.toString());

        // 상단 에디터 메뉴 추가
        addEditorOptionLine($(this.wrapSelector(vpCommon.formatString(".{0}", lineNumberTextArea._UUID))), that.uuid);
  
        $(this.wrapSelector(vpCommon.formatString(".{0}", lineNumberTextArea._UUID))).css({
            width: "calc(100% - 20px)"
            , margin: "10px"
        });

        $(this.wrapSelector(vpCommon.formatString("#{0}{1}", vpConst.VP_ID_PREFIX, "markdownPreview"))).css({
            margin: "20px 10px 5px 10px"
            , "max-height": "300px"
            , overflow: "auto"
        })
    }

    // 상단 에디터 메뉴 추가
    var addEditorOptionLine = function(target,uuid) {
        var sbEditorOptionLine = new sb.StringBuilder();

        sbEditorOptionLine.appendFormatLine("<div class='{0} {1}'>", vpConst.VP_MARKDOWN_EDITOR_TOOLBAR, vpConst.VP_MARKDOWN_EDITOR_TOOLBAR + uuid);

        sbEditorOptionLine.appendFormatLine("<div class='{0}' title='{1}'></div>", vpConst.VP_MARKDOWN_TOOBAR_BTN_TITLE, vpConst.VP_MARKDOWN_TOOBAR_BTN_TITLE_TITLE);
        sbEditorOptionLine.appendFormatLine("<div class='{0}' title='{1}'></div>", vpConst.VP_MARKDOWN_TOOBAR_BTN_BOLD, vpConst.VP_MARKDOWN_TOOBAR_BTN_BOLD_TITLE);
        sbEditorOptionLine.appendFormatLine("<div class='{0}' title='{1}'></div>", vpConst.VP_MARKDOWN_TOOBAR_BTN_ITALIC, vpConst.VP_MARKDOWN_TOOBAR_BTN_ITALIC_TITLE);
        sbEditorOptionLine.appendFormatLine("<div class='{0}' title='{1}'></div>", vpConst.VP_MARKDOWN_TOOBAR_BTN_CODE, vpConst.VP_MARKDOWN_TOOBAR_BTN_CODE_TITLE);
        sbEditorOptionLine.appendFormatLine("<div class='{0}' title='{1}'></div>", vpConst.VP_MARKDOWN_TOOBAR_BTN_LINK, vpConst.VP_MARKDOWN_TOOBAR_BTN_LINK_TITLE);
        // sbEditorOptionLine.appendFormatLine("<div class='{0}' title='{1}'></div><input type='file' class='{2}'/>"
        //     , vpConst.VP_MARKDOWN_TOOBAR_BTN_IMAGE, vpConst.VP_MARKDOWN_TOOBAR_BTN_IMAGE_TITLE, vpConst.VP_MARKDOWN_TOOBAR_INPUT_FILE_IMAGE);
        sbEditorOptionLine.appendFormatLine("<div class='{0}' title='{1}'></div><input type='hidden' id='vp_imgFilePath'/><input type='hidden' id='vp_imgAttachment'/>"
            , vpConst.VP_MARKDOWN_TOOBAR_BTN_IMAGE, vpConst.VP_MARKDOWN_TOOBAR_BTN_IMAGE_TITLE);
        sbEditorOptionLine.appendFormatLine("<div class='{0}' title='{1}'></div>", vpConst.VP_MARKDOWN_TOOBAR_BTN_INDENT, vpConst.VP_MARKDOWN_TOOBAR_BTN_INDENT_TITLE);
        sbEditorOptionLine.appendFormatLine("<div class='{0}' title='{1}'></div>", vpConst.VP_MARKDOWN_TOOBAR_BTN_ORDER_LIST, vpConst.VP_MARKDOWN_TOOBAR_BTN_ORDER_LIST_TITLE);
        sbEditorOptionLine.appendFormatLine("<div class='{0}' title='{1}'></div>", vpConst.VP_MARKDOWN_TOOBAR_BTN_UNORDER_LIST, vpConst.VP_MARKDOWN_TOOBAR_BTN_UNORDER_LIST_TITLE);
        sbEditorOptionLine.appendFormatLine("<div class='{0}' title='{1}'></div>", vpConst.VP_MARKDOWN_TOOBAR_BTN_HORIZONTAL_LINE, vpConst.VP_MARKDOWN_TOOBAR_BTN_HORIZONTAL_LINE_TITLE);

        sbEditorOptionLine.appendLine("</div>");
        
        $(sbEditorOptionLine.toString()).prependTo(target);
    }

    /**
     * 코드 생성
     * @param {boolean} addCell 셀에 추가
     * @param {boolean} exec 실행여부
     */
    Markdown.prototype.generateCode = function(addCell = false, exec = false) {
        // var gCode = $(this.wrapSelector(vpCommon.formatString("#{0}{1}", vpConst.VP_ID_PREFIX, "markdownEditor"))).val();
        var that = this;

        const textBlock = that.getBlock();
        var textarea;
        if (textBlock) {
            textarea = textBlock.getBlockOptionPageDom().find(`#vp_markdownEditor`).get(0);
        } else {
            textarea = $(vpCommon.formatString(".{0} #{1}{2}", that.uuid, vpConst.VP_ID_PREFIX, "markdownEditor")).get(0);
        }
        var gCode = textarea.value;

        $(this.wrapSelector(vpCommon.formatString(".{0} #{1}{2} input[type=hidden]", this.uuid, vpConst.VP_ID_PREFIX, "attachEncdoedDataArea"))).each(function() {
            var indicator = $(this).data('indicator');
            var data = $(this).val();

            that.attachments.push({
                indicator: indicator
                , data: data
            });

            gCode = gCode.replace(indicator, data);
        });

        // metadata save for attachments
        $('#vp_imgAttachment').val(encodeURIComponent(JSON.stringify(this.attachments)));

        this.generatedCode = gCode;
        if (addCell) {
            this.cellExecute(this.generatedCode, exec, "markdown");
        }

        return this.generatedCode;
    }

    /**
     * 옵션내 이벤트 바인딩.
     */
    Markdown.prototype.bindOptionEvent = function() {
        var that = this;
        $(document).on(vpCommon.formatString("propertychange change keyup paste input.{0}", that.uuid), that.wrapSelector(vpCommon.formatString("#{0}{1}", vpConst.VP_ID_PREFIX, "markdownEditor")), function(evt) {
            // previewRender(that.uuid, $(this).val());
            evt.stopPropagation();
            that.previewRender($(this).val());
        });

        $(document).on(vpCommon.formatString("click.{0}", that.uuid), that.wrapSelector(vpCommon.formatString(".{0} div[class^={1}]", vpConst.VP_MARKDOWN_EDITOR_TOOLBAR + that.uuid, vpConst.VP_MARKDOWN_TOOBAR_BTN)), function(evt) {
            // jquery object convert to javascript object for get selection properies
            // console.log($(vpCommon.formatString(".{0} #{1}{2}", that.uuid, vpConst.VP_ID_PREFIX, "markdownEditor")));
            const textBlock = that.getBlock();
            const textarea = textBlock.getBlockOptionPageDom().find(`#vp_markdownEditor`).get(0);

            if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_TITLE)) {
                adjustTitle(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_BOLD)) {
                adjustBold(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_ITALIC)) {
                adjustItalic(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_CODE)) {
                adjustCode(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_LINK)) {
                adjustLink(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_IMAGE)) {
                // 클릭시 hidden file control 오픈처리. 선택시 처리는 hidden file control onChange에서 처리
                // $(this).parent().find(vpCommon.formatString(".{0}", vpConst.VP_MARKDOWN_TOOBAR_INPUT_FILE_IMAGE)).click();
                openImageFile(that.uuid);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_INDENT)) {
                addIndentStyle(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_ORDER_LIST)) {
                addOrderdList(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_UNORDER_LIST)) {
                addUnorderdList(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_HORIZONTAL_LINE)) {
                addHorizontalLine(textarea);
            }
            
            // 이미지 로드의 경우 처리단계에서 랜더링 호출 하므로 이곳에서 호출하면 중복
            if (!$(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_IMAGE)) {
                // 마크다운 렌더링 시행
                // previewRender(that.uuid, textarea.value);
                that.previewRender(textarea.value);
                
                // change 트리거 발생 - 입력값 저장 및 좌측 번호칸 동기화
                $(textarea).trigger('change');
            }
        });
        
        // $(document).on(vpCommon.formatString("change.{0}", that.uuid), that.wrapSelector(vpCommon.formatString(".{0}", vpConst.VP_MARKDOWN_TOOBAR_INPUT_FILE_IMAGE)), function(evt) {
        //     // jquery object convert to javascript object for get selection properies
        //     var textarea = $(vpCommon.formatString(".{0} #{1}{2}", that.uuid, vpConst.VP_ID_PREFIX, "markdownEditor")).get(0);

        //     // importImage(that.uuid, textarea, evt.target.files[0]);
        //     that.importImage(that.uuid, textarea, evt.target.files[0]);
        // });

        $(document).off(vpCommon.formatString("imgFileOpenForMarkdown.fileNavigation.{0}", that.uuid));
        $(document).on(vpCommon.formatString("imgFileOpenForMarkdown.fileNavigation.{0}", that.uuid), function(e) {
            // jquery object convert to javascript object for get selection properies
            // var textarea = $(vpCommon.formatString(".{0} #{1}{2}", that.uuid, vpConst.VP_ID_PREFIX, "markdownEditor")).get(0);
            const textBlock = that.getBlock();
            const textarea = textBlock.getBlockOptionPageDom().find(`#vp_markdownEditor`).get(0);
            that.importImageByPath(textarea, $(that.wrapSelector("#vp_imgFilePath")).val());
        });
    }

    Markdown.prototype.bindOptionEventForPopup = function() {
        var that = this;
        $(document).on(vpCommon.formatString("propertychange change keyup paste input.{0}", that.uuid), that.wrapSelector(vpCommon.formatString("#{0}{1}", vpConst.VP_ID_PREFIX, "markdownEditor")), function(evt) {
            evt.stopPropagation();
            previewRender(that.uuid, $(this).val());
        });

        $(document).on(vpCommon.formatString("click.{0}", that.uuid), that.wrapSelector(vpCommon.formatString(".{0} div[class^={1}]", vpConst.VP_MARKDOWN_EDITOR_TOOLBAR + that.uuid, vpConst.VP_MARKDOWN_TOOBAR_BTN)), function(evt) {
            // jquery object convert to javascript object for get selection properies
            // console.log($(vpCommon.formatString(".{0} #{1}{2}", that.uuid, vpConst.VP_ID_PREFIX, "markdownEditor")));
            const textarea = $(vpCommon.formatString(".{0} #{1}{2}", that.uuid, vpConst.VP_ID_PREFIX, "markdownEditor")).get(0);

            if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_TITLE)) {
                adjustTitle(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_BOLD)) {
                adjustBold(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_ITALIC)) {
                adjustItalic(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_CODE)) {
                adjustCode(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_LINK)) {
                adjustLink(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_IMAGE)) {
                // 클릭시 hidden file control 오픈처리. 선택시 처리는 hidden file control onChange에서 처리
                // $(this).parent().find(vpCommon.formatString(".{0}", vpConst.VP_MARKDOWN_TOOBAR_INPUT_FILE_IMAGE)).click();
                openImageFile(that.uuid);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_INDENT)) {
                addIndentStyle(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_ORDER_LIST)) {
                addOrderdList(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_UNORDER_LIST)) {
                addUnorderdList(textarea);
            } else if ($(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_HORIZONTAL_LINE)) {
                addHorizontalLine(textarea);
            }
            
            // 이미지 로드의 경우 처리단계에서 랜더링 호출 하므로 이곳에서 호출하면 중복
            if (!$(this).hasClass(vpConst.VP_MARKDOWN_TOOBAR_BTN_IMAGE)) {
                // 마크다운 렌더링 시행
                const textarea = $(vpCommon.formatString(".{0} #{1}{2}", that.uuid, vpConst.VP_ID_PREFIX, "markdownEditor")).get(0);
                previewRender(that.uuid, textarea.value);
                
                // change 트리거 발생 - 입력값 저장 및 좌측 번호칸 동기화
                $(textarea).trigger('change');
            }
        });
        
        // $(document).on(vpCommon.formatString("change.{0}", that.uuid), that.wrapSelector(vpCommon.formatString(".{0}", vpConst.VP_MARKDOWN_TOOBAR_INPUT_FILE_IMAGE)), function(evt) {
        //     // jquery object convert to javascript object for get selection properies
        //     var textarea = $(vpCommon.formatString(".{0} #{1}{2}", that.uuid, vpConst.VP_ID_PREFIX, "markdownEditor")).get(0);

        //     // importImage(that.uuid, textarea, evt.target.files[0]);
        //     that.importImage(that.uuid, textarea, evt.target.files[0]);
        // });

        $(document).off(vpCommon.formatString("imgFileOpenForMarkdown.fileNavigation.{0}", that.uuid));
        $(document).on(vpCommon.formatString("imgFileOpenForMarkdown.fileNavigation.{0}", that.uuid), function(e) {
            // jquery object convert to javascript object for get selection properies
            var textarea = $(vpCommon.formatString(".{0} #{1}{2}", that.uuid, vpConst.VP_ID_PREFIX, "markdownEditor")).get(0);
            that.importImageByPath(textarea, $(that.wrapSelector("#vp_imgFilePath")).val());
        });
    }

    Markdown.prototype.setBlock = function(block) {
        this.block = block;
    }

    Markdown.prototype.getBlock = function() {
        return this.block;
    }
    /**
     * 마크다운 렌더링
     * @param {String} uuid 포함된 옵션 uuid
     * @param {String} text 렌더링할 텍스트
     */
    var previewRender = function(uuid, text, block) {
        $(vpCommon.wrapSelector(vpCommon.formatString(".{0} #{1}{2} input[type=hidden]", uuid, vpConst.VP_ID_PREFIX, "attachEncdoedDataArea"))).each(function() {
            text = text.replace($(this).data("indicator"), $(this).val());
        });

        var math = null;
        var text_and_math = mathjaxutils.remove_math(text);
        text = text_and_math[0];
        math = text_and_math[1];

        var renderer = new marked.Renderer();

        // console.log('text',text);
        
        marked(text, { renderer: renderer }, function (err, html) {
            html = mathjaxutils.replace_math(html, math);
            document.getElementById(vpCommon.formatString("{0}{1}", vpConst.VP_ID_PREFIX, "markdownPreview")).innerHTML = html;

            MathJax.Hub.Queue(["Typeset", MathJax.Hub, vpCommon.formatString("{0}{1}", vpConst.VP_ID_PREFIX, "markdownPreview")]);
            
            // console.log('html',html);
        });
    }

    Markdown.prototype.previewRender = function(text) {
        var that = this;

        const textBlock = this.getBlock();
        const textarea = textBlock.getBlockOptionPageDom().find(`#vp_markdownEditor`).get(0);
        const blockUUID = textBlock.getUUID();

        // 이미지 실제 데이터 가져오기
        $(vpCommon.wrapSelector(vpCommon.formatString(".{0} #{1}{2} input[type=hidden]", this.uuid, vpConst.VP_ID_PREFIX, "attachEncdoedDataArea"))).each(function() {
            text = text.replace($(this).data("indicator"), $(this).val());
        });

        var math = null;
        var text_and_math = mathjaxutils.remove_math(text);
        text = text_and_math[0];
        math = text_and_math[1];

        var renderer = new marked.Renderer();
        marked(text, { renderer: renderer }, function (err, html) {
            html = mathjaxutils.replace_math(html, math);
            // document.getElementById(vpCommon.formatString("{0}{1}", vpConst.VP_ID_PREFIX, "markdownPreview")).innerHTML = html;

            MathJax.Hub.Queue(["Typeset", MathJax.Hub, that.wrapSelector(vpCommon.formatString("{0}{1}", vpConst.VP_ID_PREFIX, "markdownPreview"))]);

            // 변환안 된 이미지 있으면 경로로 설정하기 FIXME:
            html = html.replaceAll('vpImportImage:', '');

            textBlock.writeCode(html);
        });
    }

    Markdown.prototype.importImageByPath = async function(textarea, file) {
        var that = this;
        // 커서 위치
        var cursorPosition = 0;
        // 선택영역 시작과 끝이 같으면 선택 영역이 없는 현재 커서 위치
        if (textarea.selectionStart == textarea.selectionEnd) {
            cursorPosition = textarea.selectionStart;
        } else { // 선택영역 시작과 끝이 다르면 선택 방향에 따라서 잡아준다.
            cursorPosition = textarea.selectionDirection == "forward" ? textarea.selectionEnd : textarea.selectionStart;
        }

        // 커서 기준 앞 전체 텍스트
        var preText = textarea.value.substring(0, cursorPosition);
        // 커서 기준 뒤 전체 텍스트
        var postText = textarea.value.substring(cursorPosition);
        
        var code = vpCommon.formatString("_vp_get_image_by_path('{0}')", file);
        vpCommon.kernelExecute(code)
            .then(data => {
                var imgResult = data["image/png"];
                
                textarea.value = vpCommon.formatString("{0}![{1}]({2}:{3}){4}", preText, file, vpConst.VP_MARKDOWN_TOOLBAR_IMAGE_INDICATOR, file, postText);
            
                // 파일 ATTACH ID 생성
                var pathSplit = file.split('.').join('/').split('/');
                var fileId = pathSplit[pathSplit.length - 2];
                var attachID = vpCommon.formatString("{0}__{1}", vpConst.VP_MARKDOWN_TOOLBAR_IMAGE_INDICATOR, fileId);
                
                if ($(that.wrapSelector(vpCommon.formatString("#{0}{1} #{2}", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea", attachID))).length > 0) {
                    $(that.wrapSelector(vpCommon.formatString("#{0}{1} #{2}", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea", attachID))).val('(data:image/png;base64,' + imgResult + ')')
                } else {
                    $(that.wrapSelector(vpCommon.formatString("#{0}{1}", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea")))
                        .append(vpCommon.formatString("<input type='hidden' id='{0}' data-indicator='({1}:{2})' value='(data:image/png;base64,{3})'/>", attachID, vpConst.VP_MARKDOWN_TOOLBAR_IMAGE_INDICATOR, file, imgResult));
                }
                // previewRender(motherUUID, textarea.value);
                that.previewRender(textarea.value);
                // change 트리거 발생 - 입력값 저장 및 좌측 번호칸 동기화
                $(textarea).trigger('change');
            });
    }

    Markdown.prototype.importImage = async function(motherUUID, textarea, file) {
        var that = this;
        // 커서 위치
        var cursorPosition = 0;
        // 선택영역 시작과 끝이 같으면 선택 영역이 없는 현재 커서 위치
        if (textarea.selectionStart == textarea.selectionEnd) {
            cursorPosition = textarea.selectionStart;
        } else { // 선택영역 시작과 끝이 다르면 선택 방향에 따라서 잡아준다.
            cursorPosition = textarea.selectionDirection == "forward" ? textarea.selectionEnd : textarea.selectionStart;
        }

        // 커서 기준 앞 전체 텍스트
        var preText = textarea.value.substring(0, cursorPosition);
        // 커서 기준 뒤 전체 텍스트
        var postText = textarea.value.substring(cursorPosition);

        var fileReader = new FileReader();
        fileReader.onload = function() {
            textarea.value = vpCommon.formatString("{0}![{1}]({2}:{3}){4}", preText, file.name, vpConst.VP_MARKDOWN_TOOLBAR_IMAGE_INDICATOR, file.name, postText);
            that.getBlock().setState({
                [STATE_codeLine]: textarea.value
            });
            
            var attachID = vpCommon.formatString("{0}__{1}", vpConst.VP_MARKDOWN_TOOLBAR_IMAGE_INDICATOR, file.name.substring(0, file.name.indexOf(".")));
            
            // if ($(textarea).parent().parent().find(vpCommon.formatString("#{0}{1} #{2}", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea", attachID)).length > 0) {
            //     $(textarea).parent().parent().find(vpCommon.formatString("#{0}{1} #{2}", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea", attachID)).val(fileReader.result)
            // } else {
            //     $(textarea).parent().parent().find(vpCommon.formatString("#{0}{1}", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea"))
            //         .append(vpCommon.formatString("<input type='hidden' id='{0}' data-indicator='({1}:{2})' value='({3})'/>", attachID, vpConst.VP_MARKDOWN_TOOLBAR_IMAGE_INDICATOR, file.name, fileReader.result));
            // }
            if ($(vpCommon.formatString("#{0}{1} #{2}", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea", attachID)).length > 0) {
                $(vpCommon.formatString("#{0}{1} #{2}", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea", attachID)).val(fileReader.result)
            } else {
                $(vpCommon.formatString("#{0}{1}", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea"))
                    .append(vpCommon.formatString("<input type='hidden' id='{0}' data-indicator='({1}:{2})' value='({3})'/>", attachID, vpConst.VP_MARKDOWN_TOOLBAR_IMAGE_INDICATOR, file.name, fileReader.result));
            }
            // previewRender(motherUUID, textarea.value);
            that.previewRender(motherUUID, textarea.value);
        }
        fileReader.readAsDataURL(file);
    }

    // Jupyter Insert Image할 때 확장자 기준
    var allowExtensionList = ['jpg', 'png', 'gif', 'jpeg', 'xbm', 'tif', 'pjp', 'jfif', 'ico', 'tiff', 'svg', 'webp', 'svgz', 'bmp', 'pjpeg', 'avif'];
    var fileState = function() {
        // file navigation : state 데이터 목록
        this.state = {
            paramData:{
                encoding: "utf-8" // 인코딩
                , delimiter: ","  // 구분자
            },
            returnVariable:"",    // 반환값
            isReturnVariable: false,
            fileExtension: allowExtensionList // 확장자
        }; 
        this.fileResultState = {
            pathInputId : vpCommon.wrapSelector(vpCommon.formatString("#{0}", 'vp_imgFilePath'))
        };
        this.triggerName = '';
    }
    // Image File State for fileNavigation
    var imgFileState = new fileState();
    /**
     * Open file navigator for selecting image file
     */
    var openImageFile = async function(uuid) {
        var loadURLstyle = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH;
        var loadURLhtml = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/fileNavigation/index.html";
        
        vpCommon.loadCss( loadURLstyle + "component/fileNavigation.css");

        await $(`<div id="vp_fileNavigation"></div>`).load(loadURLhtml, () => {
            $('#vp_fileNavigation').removeClass("hide");
            $('#vp_fileNavigation').addClass("show");
            
            var {vp_init, vp_bindEventFunctions } = fileNavigation;
            imgFileState.triggerName = vpCommon.formatString("imgFileOpenForMarkdown.fileNavigation.{0}", uuid);
                
            fileNavigation.vp_init(imgFileState, FILE_NAVIGATION_TYPE.READ_IMG_FOR_MARKDOWN);
            fileNavigation.vp_bindEventFunctions();
        }).appendTo("#site");
    };

    /**
     * 타이틀 설정
     * @param {object} textarea 마크다운 에디터 입력창
     */
    var adjustTitle = function(textarea) {
        // 커서 위치
        var cursorPosition = 0;
        // 선택영역 시작과 끝이 같으면 선택 영역이 없는 현재 커서 위치
        if (textarea.selectionStart == textarea.selectionEnd) {
            cursorPosition = textarea.selectionStart;
        } else { // 선택영역 시작과 끝이 다르면 선택 방향에 따라서 잡아준다.
            cursorPosition = textarea.selectionDirection == "forward" ? textarea.selectionEnd : textarea.selectionStart;
        }

        // 커서 기준 앞 전체 텍스트
        var preText = textarea.value.substring(0, cursorPosition);
        // 커서 기준 뒤 전체 텍스트
        var postText = textarea.value.substring(cursorPosition);
        // 커서 기준 현재 라인
        var lineText = preText.substring(preText.lastIndexOf('\n') + 1) + postText.substring(0, postText.indexOf('\n'));
        // 빈 라인이면 default text로 변경해준다.
        if (lineText.trim() == "") {
            lineText = vpConst.VP_MARKDOWN_DEFAULT_NEW_TITLE_TEXT;
        }
        var adjustText;
        // 현재 라인이 타이틀 마크다운으로 되어 있는지 확인
        if (/^[#]{6}\s{1,}/i.test(lineText)) { // #이 6개면 1개로 되돌린다.
            adjustText = preText.substring(0, preText.lastIndexOf('\n') + 1) + "#" + lineText.replace("######", "") + postText.substring(postText.indexOf('\n'));
        } else if (/^[#]{1,5}\s{1,}/i.test(lineText)) { // #이 1개에서 5개사이면 #한개 추가한다
            adjustText = preText.substring(0, preText.lastIndexOf('\n') + 1) + "#" + lineText + postText.substring(postText.indexOf('\n'));
        } else { // #이 6개를 초과했거나 없으면 #과 1공백문자를 추가한다. 
            adjustText = preText.substring(0, preText.lastIndexOf('\n') + 1) + "# " + lineText + postText.substring(postText.indexOf('\n'));
        }

        // 변경 텍스트 반영
        textarea.value = adjustText;
        that.getBlock().setState({
            [STATE_codeLine]: textarea.value
        });
    }

    /**
     * 볼드체 설정
     * @param {object} textarea 마크다운 에디터 입력창
     */
    var adjustBold = function(textarea) {
        // 정규식
        let regExp = /^[*]{2}(.*?)[*]{2}$/;
        // 선택된 텍스트
        var selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        
        var targetText = "";    // 비교대상 텍스트
        var adjustText;         // 변형 결과 텍스트
        var preCheck = true;    // 기준 앞 비교 필요 여부
        var postCheck = true;   // 기준 뒤 비교 필요 여부
        var nIdx = 0;           // 반복문에서 사용할 카운터
        var preShiftCount = 0;  // 대상 앞 시프트 카운트
        var postShiftCount = 0; // 대상 뒤 시프트 카운트

        // 커서 기준 앞 전체 텍스트
        var preText = textarea.value.substring(0, textarea.selectionStart);
        // 커서 기준 뒤 전체 텍스트
        var postText = textarea.value.substring(textarea.selectionEnd);

        // 선택 영역이 없는경우 디폴트 텍스트로 볼드 입력
        if (textarea.selectionStart == textarea.selectionEnd) {
            var checkChar;
            var preCheckChar;
            // 커서 앞으로 체크
            while (true) {
                nIdx++;
                preCheckChar = checkChar;
                checkChar = textarea.value.charAt(textarea.selectionStart - nIdx);
                // *가 끝나면 중지
                if (preCheckChar == "*" && checkChar != "*") break;
                // 문자가 없거나 공백이거나 개행이면 중지
                if (checkChar == "" || checkChar == " " || checkChar == '\n') {
                    break;
                } else {
                    targetText = checkChar + targetText;
                    preShiftCount++;
                }
            }
            // 커서 뒤로 체크
            nIdx = 0;
            while (true) {
                preCheckChar = checkChar;
                checkChar = textarea.value.charAt(textarea.selectionStart + nIdx);
                // *가 끝나면 중지
                if (preCheckChar == "*" && checkChar != "*") break;
                // 문자가 없거나 공백이거나 개행이면 중지
                if (checkChar == "" || checkChar == " " || checkChar == '\n') {
                    break;
                } else {
                    targetText = targetText + checkChar;
                    postShiftCount++;
                }
                nIdx++;
            }

            // targetText로 포함시킨 만큼 preText, postText 잘라내기
            // 잘라낸게 존재하면 slice
            if (preShiftCount != 0) {
                preText = preText.slice(0, -preShiftCount);
            }
            postText = postText.substring(postShiftCount);

            // 볼드체를 제거할지 추가할지 판단
            if (regExp.test(targetText.trim())) { // ** ** 로 감싸져 있어 볼드 제거
                adjustText = preText + targetText.slice(2, -2) + postText;
            } else {
                // 대상 텍스트가 없거나 *를 포함하는 경우는 커서 단어(공백) 뒤에 디폴트 텍스트 추가
                if (targetText == "" || targetText.indexOf("*") > -1) {
                    adjustText = preText + targetText + (targetText == "" ? "**" : " **") + vpConst.VP_MARKDOWN_DEFAULT_BOLD_TEXT + "**" + postText;
                } else { // 대상 텍스트에 대하여 볼드체 추가
                    adjustText = preText + "**" + targetText + "**" + postText;
                }
            }
        } else { // 선택영역이 있는경우 볼드체를 제거할지 추가할지 판단
            targetText = selectedText;
    
            // selectedText 앞뒤로 * 가 아닌것 만날때까지 targetText에 추가.
            for (nIdx = 0; nIdx < 3; nIdx++) {
                // 선택영역 앞으로 * 가 붙어있는경우 확장해준다.
                if (preCheck && textarea.value.charAt(textarea.selectionStart - (nIdx + 1)) === "*") {
                    targetText = "*" + targetText;
                    preShiftCount++;
                } else { // 선택영역 앞이 * 가 아닌경우 범위 확장 중지
                    preCheck = false;
                }
                // 선택영역 뒤로 * 가 붙어있는경우 확장해준다.
                if (postCheck && textarea.value.charAt(textarea.selectionEnd + nIdx) === "*") {
                    targetText = targetText + "*";
                    postShiftCount++;
                } else { // 선택영역 뒤가 * 가 아닌경우 범위 확장 중지
                    postCheck = false;
                }
            }
            
            // 볼드체를 제거할지 추가할지 판단
            if (regExp.test(targetText.trim())) { // ** ** 로 감싸져 있어 볼드 제거
                // targetText로 포함시킨 만큼 preText, postText 잘라내기
                // 잘라낸게 존재하면 slice
                if (preShiftCount != 0) {
                    preText = preText.slice(0, -preShiftCount);
                }
                postText = postText.substring(postShiftCount);

                adjustText = preText + targetText.slice(2, -2) + postText;
            } else {
                adjustText = preText + "**" + targetText + "**" + postText;
            }
        }

        // 변경 텍스트 반영
        textarea.value = adjustText;
    }

    /**
     * 이탈릭체 설정
     * @param {object} textarea 마크다운 에디터 입력창
     */
    var adjustItalic = function(textarea) {
        // 정규식
        let regExp = /^[*]{1}(.*?)[*]{1}$/;
        // 선택된 텍스트
        var selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        
        var targetText = "";    // 비교대상 텍스트
        var adjustText;         // 변형 결과 텍스트
        var preCheck = true;    // 기준 앞 비교 필요 여부
        var postCheck = true;   // 기준 뒤 비교 필요 여부
        var nIdx = 0;           // 반복문에서 사용할 카운터
        var preShiftCount = 0;  // 대상 앞 시프트 카운트
        var postShiftCount = 0; // 대상 뒤 시프트 카운트

        // 커서 기준 앞 전체 텍스트
        var preText = textarea.value.substring(0, textarea.selectionStart);
        // 커서 기준 뒤 전체 텍스트
        var postText = textarea.value.substring(textarea.selectionEnd);

        // 선택 영역이 없는경우 디폴트 텍스트로 이탈릭 입력
        if (textarea.selectionStart == textarea.selectionEnd) {
            var checkChar;
            var preCheckChar;
            // 커서 앞으로 체크
            while (true) {
                nIdx++;
                preCheckChar = checkChar;
                checkChar = textarea.value.charAt(textarea.selectionStart - nIdx);
                if (preCheckChar == "*" && checkChar != "*") break;
                // 문자가 없거나 공백이거나 개행이면 중지
                if (checkChar == "" || checkChar == " " || checkChar == '\n') {
                    break;
                } else {
                    targetText = checkChar + targetText;
                    preShiftCount++;
                }
            }
            // 커서 뒤로 체크
            nIdx = 0;
            while (true) {
                preCheckChar = checkChar;
                checkChar = textarea.value.charAt(textarea.selectionStart + nIdx);
                if (preCheckChar == "*" && checkChar != "*") break;
                // 문자가 없거나 공백이거나 개행이면 중지
                if (checkChar == "" || checkChar == " " || checkChar == '\n') {
                    break;
                } else {
                    targetText = targetText + checkChar;
                    postShiftCount++;
                }
                nIdx++;
            }

            // targetText로 포함시킨 만큼 preText, postText 잘라내기
            // 잘라낸게 존재하면 slice
            if (preShiftCount != 0) {
                preText = preText.slice(0, -preShiftCount);
            }
            postText = postText.substring(postShiftCount);

            // 이탈릭체를 제거할지 추가할지 판단
            if (regExp.test(targetText.trim())) { // * * 로 감싸져 있어 이탈릭 제거
                adjustText = preText + targetText.slice(1, -1) + postText;
            } else {
                // 대상 텍스트가 없거나 *를 포함하는 경우는 커서 단어(공백) 뒤에 디폴트 텍스트 추가
                if (targetText == "" || targetText.indexOf("*") > -1) {
                    adjustText = preText + targetText + (targetText == "" ? "*" : " *") + vpConst.VP_MARKDOWN_DEFAULT_ITALIC_TEXT + "*" + postText;
                } else { // 대상 텍스트에 대하여 이탈릭체 추가
                    adjustText = preText + "*" + targetText + "*" + postText;
                }
            }
        } else { // 선택영역이 있는경우 이탈릭체를 제거할지 추가할지 판단
            targetText = selectedText;
    
            // selectedText 앞뒤로 * 가 아닌것 만날때까지 targetText에 추가.
            for (nIdx = 0; nIdx < 3; nIdx++) {
                // 선택영역 앞으로 * 가 붙어있는경우 확장해준다.
                if (preCheck && textarea.value.charAt(textarea.selectionStart - (nIdx + 1)) === "*") {
                    targetText = "*" + targetText;
                    preShiftCount++;
                } else { // 선택영역 앞이 * 가 아닌경우 범위 확장 중지
                    preCheck = false;
                }
                // 선택영역 뒤로 * 가 붙어있는경우 확장해준다.
                if (postCheck && textarea.value.charAt(textarea.selectionEnd + nIdx) === "*") {
                    targetText = targetText + "*";
                    postShiftCount++;
                } else { // 선택영역 뒤가 * 가 아닌경우 범위 확장 중지
                    postCheck = false;
                }
            }
            
            // 이탈릭체를 제거할지 추가할지 판단
            if (regExp.test(targetText.trim())) { // * * 로 감싸져 있어 이탈릭 제거
                // targetText로 포함시킨 만큼 preText, postText 잘라내기
                // 잘라낸게 존재하면 slice
                if (preShiftCount != 0) {
                    preText = preText.slice(0, -preShiftCount);
                }
                postText = postText.substring(postShiftCount);

                adjustText = preText + targetText.slice(1, -1) + postText;
            } else {
                adjustText = preText + "*" + targetText + "*" + postText;
            }
        }

        // 변경 텍스트 반영
        textarea.value = adjustText;
    }

    /**
     * 코드체 설정
     * @param {object} textarea 마크다운 에디터 입력창
     */
    var adjustCode = function(textarea) {
        // 정규식
        let regExp = /^[`]{1}(.*?)[`]{1}$/;
        // 선택된 텍스트
        var selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        
        var targetText = "";    // 비교대상 텍스트
        var adjustText;         // 변형 결과 텍스트
        var preCheck = true;    // 기준 앞 비교 필요 여부
        var postCheck = true;   // 기준 뒤 비교 필요 여부
        var nIdx = 0;           // 반복문에서 사용할 카운터
        var preShiftCount = 0;  // 대상 앞 시프트 카운트
        var postShiftCount = 0; // 대상 뒤 시프트 카운트

        // 커서 기준 앞 전체 텍스트
        var preText = textarea.value.substring(0, textarea.selectionStart);
        // 커서 기준 뒤 전체 텍스트
        var postText = textarea.value.substring(textarea.selectionEnd);

        // 선택 영역이 없는경우 디폴트 텍스트로 코드 입력
        if (textarea.selectionStart == textarea.selectionEnd) {
            var checkChar;
            var preCheckChar;
            // 커서 앞으로 체크
            while (true) {
                nIdx++;
                preCheckChar = checkChar;
                checkChar = textarea.value.charAt(textarea.selectionStart - nIdx);
                if (preCheckChar == "`" && checkChar != "`") break;
                // 문자가 없거나 공백이거나 개행이면 중지
                if (checkChar == "" || checkChar == " " || checkChar == '\n') {
                    break;
                } else {
                    targetText = checkChar + targetText;
                    preShiftCount++;
                }
            }
            // 커서 뒤로 체크
            nIdx = 0;
            while (true) {
                preCheckChar = checkChar;
                checkChar = textarea.value.charAt(textarea.selectionStart + nIdx);
                if (preCheckChar == "`" && checkChar != "`") break;
                // 문자가 없거나 공백이거나 개행이면 중지
                if (checkChar == "" || checkChar == " " || checkChar == '\n') {
                    break;
                } else {
                    targetText = targetText + checkChar;
                    postShiftCount++;
                }
                nIdx++;
            }

            // targetText로 포함시킨 만큼 preText, postText 잘라내기
            // 잘라낸게 존재하면 slice
            if (preShiftCount != 0) {
                preText = preText.slice(0, -preShiftCount);
            }
            postText = postText.substring(postShiftCount);

            // 코드체를 제거할지 추가할지 판단
            if (regExp.test(targetText.trim())) { // ` ` 로 감싸져 있어 코드 제거
                adjustText = preText + targetText.slice(1, -1) + postText;
            } else {
                // 대상 텍스트가 없거나 `를 포함하는 경우는 커서 단어(공백) 뒤에 디폴트 텍스트 추가
                if (targetText == "" || targetText.indexOf("`") > -1) {
                    adjustText = preText + targetText + "\n\n```\n# " + vpConst.VP_MARKDOWN_DEFAULT_CODE_TEXT + "\n```\n\n\n" + postText;
                } else { // 대상 텍스트에 대하여 코드체 추가
                    adjustText = preText + "`" + targetText + "`" + postText;
                }
            }
        } else { // 선택영역이 있는경우 코드체를 제거할지 추가할지 판단
            targetText = selectedText;
    
            // selectedText 앞뒤로 ` 가 아닌것 만날때까지 targetText에 추가.
            for (nIdx = 0; nIdx < 3; nIdx++) {
                // 선택영역 앞으로 ` 가 붙어있는경우 확장해준다.
                if (preCheck && textarea.value.charAt(textarea.selectionStart - (nIdx + 1)) === "`") {
                    targetText = "`" + targetText;
                    preShiftCount++;
                } else { // 선택영역 앞이 ` 가 아닌경우 범위 확장 중지
                    preCheck = false;
                }
                // 선택영역 뒤로 ` 가 붙어있는경우 확장해준다.
                if (postCheck && textarea.value.charAt(textarea.selectionEnd + nIdx) === "`") {
                    targetText = targetText + "`";
                    postShiftCount++;
                } else { // 선택영역 뒤가 ` 가 아닌경우 범위 확장 중지
                    postCheck = false;
                }
            }
            
            // 코드체를 제거할지 추가할지 판단
            if (regExp.test(targetText.trim())) { // ` ` 로 감싸져 있어 코드 제거
                // targetText로 포함시킨 만큼 preText, postText 잘라내기
                // 잘라낸게 존재하면 slice
                if (preShiftCount != 0) {
                    preText = preText.slice(0, -preShiftCount);
                }
                postText = postText.substring(postShiftCount);

                adjustText = preText + targetText.slice(1, -1) + postText;
            } else {
                adjustText = preText + "`" + targetText + "`" + postText;
            }
        }

        // 변경 텍스트 반영
        textarea.value = adjustText;
    }

    /**
     * 링크 설정
     * @param {object} textarea 마크다운 에디터 입력창
     */
    var adjustLink = function(textarea) {
        // 커서 기준 앞 전체 텍스트
        var preText = textarea.value.substring(0, textarea.selectionStart);
        // 커서 기준 뒤 전체 텍스트
        var postText = textarea.value.substring(textarea.selectionEnd);
        // 선택된 텍스트
        var selectedText = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
        var linkText;
        if (selectedText.startsWith("http://") || selectedText.startsWith("https://")) {
            linkText = vpCommon.formatString("[{0}]({1})", vpConst.VP_MARKDOWN_DEFAULT_LINK_TEXT, selectedText);
        } else {
            linkText = vpCommon.formatString("[{0}](https://)", (selectedText == undefined || selectedText == "" ? vpConst.VP_MARKDOWN_DEFAULT_LINK_TEXT : selectedText));
        }
        
        textarea.value = preText + linkText + postText;
    }

    /**
     * 선택된 이미지 파일 인코딩하여 첨부
     * @param {String} motherUUID 포함된 옵션 uuid
     * @param {object} textarea 마크다운 에디터 입력창
     * @param {object} file 선택된 파일 정보
     */
    var importImage = function(motherUUID, textarea, file) {
        var that = this;
        // 커서 위치
        var cursorPosition = 0;
        // 선택영역 시작과 끝이 같으면 선택 영역이 없는 현재 커서 위치
        if (textarea.selectionStart == textarea.selectionEnd) {
            cursorPosition = textarea.selectionStart;
        } else { // 선택영역 시작과 끝이 다르면 선택 방향에 따라서 잡아준다.
            cursorPosition = textarea.selectionDirection == "forward" ? textarea.selectionEnd : textarea.selectionStart;
        }

        // 커서 기준 앞 전체 텍스트
        var preText = textarea.value.substring(0, cursorPosition);
        // 커서 기준 뒤 전체 텍스트
        var postText = textarea.value.substring(cursorPosition);

        var fileReader = new FileReader();
        fileReader.onload = function() {
            textarea.value = vpCommon.formatString("{0}![{1}]({2}:{3}){4}", preText, file.name, vpConst.VP_MARKDOWN_TOOLBAR_IMAGE_INDICATOR, file.name, postText);
            
            var attachID = vpCommon.formatString("{0}__{1}", vpConst.VP_MARKDOWN_TOOLBAR_IMAGE_INDICATOR, file.name.substring(0, file.name.indexOf(".")));
            
            if ($(textarea).parent().parent().find(vpCommon.formatString("#{0}{1} #{2}", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea", attachID)).length > 0) {
                $(textarea).parent().parent().find(vpCommon.formatString("#{0}{1} #{2}", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea", attachID)).val(fileReader.result)
            } else {
                $(textarea).parent().parent().find(vpCommon.formatString("#{0}{1}", vpConst.VP_ID_PREFIX, "attachEncdoedDataArea"))
                    .append(vpCommon.formatString("<input type='hidden' id='{0}' data-indicator='({1}:{2})' value='({3})'/>", attachID, vpConst.VP_MARKDOWN_TOOLBAR_IMAGE_INDICATOR, file.name, fileReader.result));
            }
            // previewRender(motherUUID, textarea.value);
            that.previewRender(textarea.value);
        }
        fileReader.readAsDataURL(file);
    }

    /**
     * 들여쓰기 스타일 추가
     * @param {object} textarea 마크다운 에디터 입력창
     */
    var addIndentStyle = function(textarea) {
        // 커서 위치
        var cursorPosition = 0;
        // 선택영역 시작과 끝이 같으면 선택 영역이 없는 현재 커서 위치
        if (textarea.selectionStart == textarea.selectionEnd) {
            cursorPosition = textarea.selectionStart;
        } else { // 선택영역 시작과 끝이 다르면 선택 방향에 따라서 잡아준다.
            cursorPosition = textarea.selectionDirection == "forward" ? textarea.selectionEnd : textarea.selectionStart;
        }

        // 커서 기준 앞 전체 텍스트
        var preText = textarea.value.substring(0, cursorPosition);
        // 커서 기준 뒤 전체 텍스트
        var postText = textarea.value.substring(cursorPosition);

        // 커서 기준 뒤 텍스트중 현재 커서 라인 텍스트는 preText 로 이전 한다.
        preText = preText + postText.substring(0, postText.indexOf('\n') == -1 ? postText.length : postText.indexOf('\n'));
        // 이전해준 현재 커서 라인 텍스트만큼 postText 에서 제거한다.
        postText = postText.substring(postText.indexOf('\n') == -1 ? postText.length : postText.indexOf('\n'));

        // 변경 텍스트 반영
        textarea.value = preText + vpConst.VP_MARKDOWN_DEFAULT_INDENT_TEXT + postText;
    }

    /**
     * 번호 매기기 목록 추가
     * @param {object} textarea 마크다운 에디터 입력창
     */
    var addOrderdList = function(textarea) {
        // 커서 위치
        var cursorPosition = 0;
        // 선택영역 시작과 끝이 같으면 선택 영역이 없는 현재 커서 위치
        if (textarea.selectionStart == textarea.selectionEnd) {
            cursorPosition = textarea.selectionStart;
        } else { // 선택영역 시작과 끝이 다르면 선택 방향에 따라서 잡아준다.
            cursorPosition = textarea.selectionDirection == "forward" ? textarea.selectionEnd : textarea.selectionStart;
        }

        // 커서 기준 앞 전체 텍스트
        var preText = textarea.value.substring(0, cursorPosition);
        // 커서 기준 뒤 전체 텍스트
        var postText = textarea.value.substring(cursorPosition);

        // 커서 기준 뒤 텍스트중 현재 커서 라인 텍스트는 preText 로 이전 한다.
        preText = preText + postText.substring(0, postText.indexOf('\n') == -1 ? postText.length : postText.indexOf('\n'));
        // 이전해준 현재 커서 라인 텍스트만큼 postText 에서 제거한다.
        postText = postText.substring(postText.indexOf('\n') == -1 ? postText.length : postText.indexOf('\n'));

        var addText = vpCommon.formatString("\n\n1.   {0}\n2.   {1}\n\n", vpConst.VP_MARKDOWN_DEFAULT_LIST_TEXT, vpConst.VP_MARKDOWN_DEFAULT_LIST_TEXT);

        // 변경 텍스트 반영
        textarea.value = preText + addText + postText;
    }

    /**
     * 글머리기호 목록 추가
     * @param {object} textarea 마크다운 에디터 입력창
     */
    var addUnorderdList = function(textarea) {
        // 커서 위치
        var cursorPosition = 0;
        // 선택영역 시작과 끝이 같으면 선택 영역이 없는 현재 커서 위치
        if (textarea.selectionStart == textarea.selectionEnd) {
            cursorPosition = textarea.selectionStart;
        } else { // 선택영역 시작과 끝이 다르면 선택 방향에 따라서 잡아준다.
            cursorPosition = textarea.selectionDirection == "forward" ? textarea.selectionEnd : textarea.selectionStart;
        }

        // 커서 기준 앞 전체 텍스트
        var preText = textarea.value.substring(0, cursorPosition);
        // 커서 기준 뒤 전체 텍스트
        var postText = textarea.value.substring(cursorPosition);

        // 커서 기준 뒤 텍스트중 현재 커서 라인 텍스트는 preText 로 이전 한다.
        preText = preText + postText.substring(0, postText.indexOf('\n') == -1 ? postText.length : postText.indexOf('\n'));
        // 이전해준 현재 커서 라인 텍스트만큼 postText 에서 제거한다.
        postText = postText.substring(postText.indexOf('\n') == -1 ? postText.length : postText.indexOf('\n'));

        var addText = vpCommon.formatString("\n\n*   {0}\n*   {1}\n\n", vpConst.VP_MARKDOWN_DEFAULT_LIST_TEXT, vpConst.VP_MARKDOWN_DEFAULT_LIST_TEXT);

        // 변경 텍스트 반영
        textarea.value = preText + addText + postText;
    }

    /**
     * 가로줄 추가
     * @param {object} textarea 마크다운 에디터 입력창
     */
    var addHorizontalLine = function(textarea) {
        // 커서 위치
        var cursorPosition = 0;
        // 선택영역 시작과 끝이 같으면 선택 영역이 없는 현재 커서 위치
        if (textarea.selectionStart == textarea.selectionEnd) {
            cursorPosition = textarea.selectionStart;
        } else { // 선택영역 시작과 끝이 다르면 선택 방향에 따라서 잡아준다.
            cursorPosition = textarea.selectionDirection == "forward" ? textarea.selectionEnd : textarea.selectionStart;
        }

        // 커서 기준 앞 전체 텍스트
        var preText = textarea.value.substring(0, cursorPosition);
        // 커서 기준 뒤 전체 텍스트
        var postText = textarea.value.substring(cursorPosition);

        // 커서 기준 뒤 텍스트중 현재 커서 라인 텍스트는 preText 로 이전 한다.
        preText = preText + postText.substring(0, postText.indexOf('\n') == -1 ? postText.length : postText.indexOf('\n'));
        // 이전해준 현재 커서 라인 텍스트만큼 postText 에서 제거한다.
        postText = postText.substring(postText.indexOf('\n') == -1 ? postText.length : postText.indexOf('\n'));

        // 변경 텍스트 반영
        textarea.value = preText + "\n\n---\n\n" + postText;
    }

    /**
     * 메타데이터 로드 후 액션
     * @param {funcJS} option
     * @param {JSON} meta 
     */   
    Markdown.prototype.loadMetaExpend = function(funcJS, meta) {
        console.log('loadMetaExpend');
        this.previewRender($(this.wrapSelector(vpCommon.formatString("#{0}{1}", vpConst.VP_ID_PREFIX, "markdownEditor"))).val());
        // previewRender(this.uuid, $(vpCommon.formatString("#{0}{1}", vpConst.VP_ID_PREFIX, "markdownEditor")).val());
    }

    return {
        initOption: initOption
    };
});
