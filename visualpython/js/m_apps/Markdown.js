/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Markdown.js
 *    Author          : Black Logic
 *    Note            : Apps > Markdown
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Markdown
//============================================================================
define([
    __VP_CSS_LOADER__('vp_base/css/m_apps/markdown'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/FileNavigation',
    // CHROME: remove mathjaxutils - use MathJax in colab
    'mathjaxutils',
    // 'marked',
// ], function(markdownCss, com_String, com_util, PopupComponent, FileNavigation, marked, mathjaxutils) {
], function(markdownCss, com_String, com_util, PopupComponent, FileNavigation, mathjaxutils) {

    // markdown default text
    const VP_MARKDOWN_DEFAULT_NEW_TITLE_TEXT = 'New Title';
    const VP_MARKDOWN_DEFAULT_BOLD_TEXT = 'Bold Text';
    const VP_MARKDOWN_DEFAULT_ITALIC_TEXT = 'Italic Text';
    const VP_MARKDOWN_DEFAULT_CODE_TEXT = 'Formatted by code';
    const VP_MARKDOWN_DEFAULT_LINK_TEXT = 'link Text';
    const VP_MARKDOWN_DEFAULT_INDENT_TEXT = '\n\n> Indented block\n\n';
    const VP_MARKDOWN_DEFAULT_LIST_TEXT = 'Add item';

    /**
     * Markdown
     */
    class Markdown extends PopupComponent {
        _init() {
            super._init();

            /** Write codes executed before rendering */
            this.config.executeMode = 'markdown';
            this.config.codeview = false;
            this.config.dataview = false;
            this.config.sizeLevel = 1;
            this.config.checkModules = ['pd'];

            this.state = {
                editor: '',
                preview: '',
                generatedCode: '',
                attachments: [],
                ...this.state
            }

            let that = this;
            this._addCodemirror('editor', this.wrapSelector('#vp_markdownEditor'), 'markdown', {
                events: [
                    { key: 'change', callback: function() {
                        that.previewRender();
                    } }
                ]
            });
        }

        _bindEvent() {
            super._bindEvent();
            let that = this;
            /** Implement binding events */
            $(document).on(com_util.formatString("propertychange change keyup paste input.{0}", that.uuid), that.wrapSelector("#vp_markdownEditor"), function(evt) {
                evt.stopPropagation();
                that.previewRender();
            });
    
            $(document).on('click', this.wrapSelector('.vp-markdown-editor-toolbar div'), function(evt) {
                // jquery object convert to javascript object for get selection properies
                const textarea = $(that.wrapSelector("#vp_markdownEditor")).get(0);
                let cmObj = that.getCodemirror('editor');
                if (!cmObj) {
                    return;
                }
                let cm = cmObj.cm;
                let menu = $(this).data('menu');

                switch (menu) {
                    case 'title':
                        that.adjustTitle(cm);
                        break;
                    case 'bold':
                        that.adjustBold(cm);
                        break;
                    case 'italic':
                        that.adjustItalic(cm);
                        break;
                    case 'code':
                        that.adjustCode(cm);
                        break;
                    case 'link':
                        that.adjustLink(cm);
                        break;
                    case 'image':
                        that.openImageFile(cm);
                        break;
                    case 'indent':
                        that.addIndentStyle(cm);
                        break;
                    case 'order-list':
                        that.addOrderdList(cm);
                        break;
                    case 'unorder-list':
                        that.addUnorderdList(cm);
                        break;
                    case 'horizontal-line':
                        that.addHorizontalLine(cm);
                        break;
                }
                
                // image renders on the process of opening image
                if (menu != 'image') {
                    // render markdown
                    that.previewRender();
                }
            });
        }

        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            page.appendLine('<div class="vp-divide-top">');
            page.appendLine(this.templateForToolbar());
            page.appendFormatLine('<textarea id="{0}" class="vp-state">{1}</textarea>', 'vp_markdownEditor', this.state.editor);
            page.appendFormatLine('<div id="{0}"></div>', "vp_attachEncodedDataArea");
            page.appendLine('</div>');
            page.appendFormatLine('<div id="{0}" class="vp-divide-bot">{1}</div>', 'vp_markdownPreview', this.state.preview);
            return page.toString();
        }

        templateForToolbar() {
            return `<div class="vp-markdown-editor-toolbar">
                <div class="vp-markdown-editor-toolbar-btn-title" data-menu="title" title="Title"></div>
                <div class="vp-markdown-editor-toolbar-btn-bold" data-menu="bold" title="Bold"></div>
                <div class="vp-markdown-editor-toolbar-btn-italic" data-menu="italic" title="Italic"></div>
                <div class="vp-markdown-editor-toolbar-btn-code" data-menu="code" title="Code"></div>
                <div class="vp-markdown-editor-toolbar-btn-link" data-menu="link" title="Link"></div>
                <div class="vp-markdown-editor-toolbar-btn-image" data-menu="image" title="Image"></div><input type="hidden" id="vp_imgFilePath"><input type="hidden" id="vp_imgAttachment" value="%5B%5D">
                <div class="vp-markdown-editor-toolbar-btn-indent" data-menu="indent" title="Indent"></div>
                <div class="vp-markdown-editor-toolbar-btn-order-list" data-menu="order-list" title="Ordered list"></div>
                <div class="vp-markdown-editor-toolbar-btn-unorder-list" data-menu="unorder-list" title="Unordered list"></div>
                <div class="vp-markdown-editor-toolbar-btn-horizontal-line" data-menu="horizontal-line" title="Horizontal line"></div>
            </div>`;
        }

        render() {
            super.render();

            let cm = this.getCodemirror('editor').cm;
            if (cm) {
                cm.setSize(null, '255px'); // set width, height of codemirror
            }
        }

        generateCode() {
            var that = this;

            var gCode = this.state['editor'];

            $(this.wrapSelector("#vp_attachEncodedDataArea input[type=hidden]")).each(function() {
                var indicator = $(this).data('indicator');
                var data = $(this).val();

                that.state.attachments.push({
                    indicator: indicator
                    , data: data
                });

                gCode = gCode.replace(indicator, data);
            });

            // metadata save for attachments
            $('#vp_imgAttachment').val(encodeURIComponent(JSON.stringify(this.state.attachments)));

            this.state.generatedCode = gCode;

            return this.state.generatedCode;
        }

        /**
         * Render markdown
         */
        previewRender = function() {
            let text = this.getCodemirror('editor').cm.getValue();
            $(com_util.wrapSelector(com_util.formatString("#{0} input[type=hidden]", "vp_attachEncodedDataArea"))).each(function() {
                text = text.replace($(this).data("indicator"), $(this).val());
            });

            var math = null;
            var text_and_math = mathjaxutils.remove_math(text);
            text = text_and_math[0];
            math = text_and_math[1];

            // CHROME: TODO: 4: marked is not loaded, before fix it comment it
            if (vpConfig.extensionType === 'notebook') {
                var marked = window.require('components/marked/lib/marked');
                var renderer = new marked.Renderer();

                // get block
                let block = this.getTaskType() == 'block'? this.taskItem: null;

                let that = this;
                // render preview
                marked(text, { renderer: renderer }, function (err, html) {
                    html = mathjaxutils.replace_math(html, math);
                    let preview = `<div>${html}</div>`;
                    if (html == '') {
                        preview = '';
                    }
                    that.state.preview = preview;
                    $(that.wrapSelector("#vp_markdownPreview")).html(preview);

                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, "vp_markdownPreview"]);
                });
            } else if (vpConfig.extensionType === 'lab') {
                var marked = require('marked');

                // get block
                let block = this.getTaskType() == 'block'? this.taskItem: null;

                let that = this;
                // render preview
                let html = marked.parse(text);
                html = mathjaxutils.replace_math(html, math);
                let preview = `<iframe id="vp_markdownIFrame" style="width:100%;height:270px;border:0px;"></iframe>`;
                if (html == '') {
                    preview = '';
                }
                that.state.preview = preview;
                $(that.wrapSelector("#vp_markdownPreview")).html(preview);
                $(that.wrapSelector('#vp_markdownIFrame')).contents().find('body').html(html);
            }
            
        }

        getPreview() {
            return this.state.preview;
        }
        
        ///////////////////////////////////////////////////// EDIT BELOW /////////////////////////////////////////////////////////////
    
        importImageByPath(cm, path) {
            // get cursor info
            let {line, ch} = cm.getCursor();

            let that = this;
            vpKernel.getImageFile(path).then(function(resultObj) {
                let data = resultObj.result;
                var imgResult = data["image/png"];

                let imgVal = com_util.formatString("![{0}]({1})", path, path);
        
                // create file attach id
                var pathSplit = path.split('.').join('/').split('/');
                var fileId = pathSplit[pathSplit.length - 2];
                var attachID = com_util.formatString("{0}__{1}", 'vpImportImage', fileId);
                
                if ($(that.wrapSelector(com_util.formatString("#{0} #{1}", "vp_attachEncodedDataArea", attachID))).length > 0) {
                    $(that.wrapSelector(com_util.formatString("#{0} #{1}", "vp_attachEncodedDataArea", attachID))).val('(data:image/png;base64,' + imgResult + ')')
                } else {
                    $(that.wrapSelector(com_util.formatString("#{0}", "vp_attachEncodedDataArea")))
                        .append(com_util.formatString("<input type='hidden' id='{0}' data-indicator='({1}:{2})' value='(data:image/png;base64,{3})'/>", attachID, 'vpImportImage', path, imgResult));
                }

                cm.setCursor({line: line+1, ch: 0});
                cm.replaceSelection(imgVal);
                cm.setSelection({line: line+1, ch: 0}, {line: line+1});
                cm.focus();
                that.previewRender();
            });
        }
        /**
         * Open file navigator for selecting image file
         */
        openImageFile(cm) {
            // open file navigation
            // allow image extensions
            let allowExtensionList = ['jpg', 'png', 'gif', 'jpeg', 'xbm', 'tif', 'pjp', 'jfif', 'ico', 'tiff', 'svg', 'webp', 'svgz', 'bmp', 'pjpeg', 'avif'];
            let that = this;
            let fileNavi = new FileNavigation({ type: 'open', extensions: allowExtensionList, finish: function(filesPath, status, error) {
                // after selection
                let { file, path } = filesPath[0];
                that.importImageByPath(cm, path);
            }});
            fileNavi.open();
        };
    
        /**
         * Adjust title
         * @param {object} cm CodeMirror Object
         */
        adjustTitle(cm) {
            // cursor position
            var { line, ch, sticky } = cm.getCursor();

            // cursor line text
            var lineText = cm.getLine(line);
            // set default text
            if (lineText.trim() == "") {
                lineText = VP_MARKDOWN_DEFAULT_NEW_TITLE_TEXT;
            }
            var adjustText;
            // check if this line is using title markdown
            if (/^[#]{6}\s{1,}/i.test(lineText)) { // ######(6) -> #(1)
                adjustText = "#" + lineText.replace("######", "");
            } else if (/^[#]{1,5}\s{1,}/i.test(lineText)) { // #(1~5) -> # + #(add 1 #)
                adjustText = "#" + lineText
            } else { // #(>6 or =0) -> add # and whitespace('# ')
                adjustText = "# " + lineText
            }
    
            // Apply adjusted text
            // select all text in this line
            cm.setSelection({line: line, ch: 0}, {line: line});
            // repace selection
            cm.replaceSelection(adjustText);
            // TODO: set block code
            cm.focus();
        }
    
        /**
         * Adjust bold
         * @param {object} cm CodeMirror Object
         */
        adjustBold(cm) {
            // cursor
            var { line, ch, sticky } = cm.getCursor();
            // this line
            var lineText = cm.getLine(line);
            
            var targetText = '';
            var adjustText;         // adjusted text
            let preSpace = '';   // space needed for previous
            let postSpace = '';  // space needed for posterior
    
            // no selection area
            if (!cm.somethingSelected()) {
                // previous text checking
                var preCh = 0;
                var postCh = 0;

                let preText = lineText.substring(0, ch);
                let boldPos1 = preText.lastIndexOf('**');
                let spacePos1 = preText.lastIndexOf(' ') + 1;
                
                // posterior text checking
                let postText = lineText.substring(ch);
                let boldPos2 = postText.indexOf('**') + 1;
                let spacePos2 = postText.indexOf(' ') - 1;

                
                preCh = Math.max(boldPos1, spacePos1, 0);
                postCh = Math.min(boldPos2, spacePos2);
                if (postCh < 0) postCh = lineText.length;

                if (preCh == boldPos1 && postCh == boldPos2) {
                    ; // no problem
                } else {
                    // if only one part of prev & post is bold, remove that part
                    if (preCh == boldPos1 && boldPos1 < 0) {
                        preCh = Math.min(boldPos1 + 2, lineText.length);
                        preSpace = ' ';
                    }
                    if (postCh == boldPos2 && boldPos2 < 0) {
                        postCh = Math.max(boldPos2 - 2, 0);
                        postSpace = ' ';
                    }
                }

                // set target text
                targetText = lineText.substring(preCh, postCh);

                // set selection
                cm.setSelection({ line: line, ch: preCh }, { line: line, ch: postCh });
            } else { 
                // has selection area
                targetText = cm.getSelection();
            }

            let regExp = /^[*]{2}(.*?)[*]{2}$/;
            // if bold(**) is included, remove it
            if (regExp.test(targetText.trim())) {
                adjustText = targetText.substring(2, targetText.length - 2);
                ch -= 2;
            } else {
                // add bold(**) before and after
                if (targetText == '') {
                    targetText = VP_MARKDOWN_DEFAULT_BOLD_TEXT;
                }
                adjustText = preSpace + '**' + targetText + '**' + postSpace;
                ch += preSpace.length + 2;
            }
    
            // replace selection
            cm.replaceSelection(adjustText);
            // set cursor
            cm.setCursor({line: line, ch: ch});
            cm.focus();
        }
    
        /**
         * Italic
         * @param {object} cm CodeMirror editor
         */
        adjustItalic(cm) {
            // cursor
            var { line, ch, sticky } = cm.getCursor();
            // this line
            var lineText = cm.getLine(line);
            
            var targetText = '';
            var adjustText;         // adjusted text
            let preSpace = '';   // space needed for previous
            let postSpace = '';  // space needed for posterior
    
            // no selection area
            if (!cm.somethingSelected()) {
                // previous text checking
                var preCh = 0;
                var postCh = 0;

                let preText = lineText.substring(0, ch);
                let italPos1 = preText.lastIndexOf('*');
                let spacePos1 = preText.lastIndexOf(' ') + 1;
                
                // posterior text checking
                let postText = lineText.substring(ch);
                let italPos2 = postText.indexOf('*');
                let spacePos2 = postText.indexOf(' ') - 1;

                
                preCh = Math.max(italPos1, spacePos1, 0);
                postCh = Math.min(italPos2, spacePos2);
                if (postCh < 0) postCh = lineText.length;

                if (preCh == italPos1 && postCh == italPos2) {
                    ; // no problem
                } else {
                    // if only one part of prev & post is italic, remove that part
                    if (preCh == italPos1 && italPos1 < 0) {
                        preCh = Math.min(italPos1 + 1, lineText.length);
                        preSpace = ' ';
                    }
                    if (postCh == italPos2 && italPos2 < 0) {
                        postCh = Math.max(italPos2 - 1, 0);
                        postSpace = ' ';
                    }
                }

                // set target text
                targetText = lineText.substring(preCh, postCh);

                // set selection
                cm.setSelection({ line: line, ch: preCh }, { line: line, ch: postCh });
            } else { 
                // has selection area
                targetText = cm.getSelection();
            }

            let regExp = /^[*]{1}(.*?)[*]{1}$/;
            // if italic(*) is included, remove it
            if (regExp.test(targetText.trim())) {
                adjustText = targetText.substring(1, targetText.length - 1);
                ch -= 1;
            } else {
                // add italic(*) before and after
                if (targetText == '') {
                    targetText = VP_MARKDOWN_DEFAULT_ITALIC_TEXT;
                }
                adjustText = preSpace + '*' + targetText + '*' + postSpace;
                ch += preSpace.length + 1;
            }
    
            // replace selection
            cm.replaceSelection(adjustText);
            // set cursor
            cm.setCursor({line: line, ch: ch});
            cm.focus();
        }
    
        /**
         * Code
         * @param {object} cm Codemirror Object
         */
        adjustCode(cm) {
            // cursor
            var { line, ch, sticky } = cm.getCursor();
            // this line
            var lineText = cm.getLine(line);
            
            var targetText = '';
            var adjustText;         // adjusted text
            let preSpace = '';   // space needed for previous
            let postSpace = '';  // space needed for posterior
            let multiLine = false;
    
            // no selection area
            if (!cm.somethingSelected()) {
                // previous text checking
                var preCh = 0;
                var postCh = 0;

                let preText = lineText.substring(0, ch);
                let codePos1 = preText.lastIndexOf('`');
                let spacePos1 = preText.lastIndexOf(' ') + 1;
                
                // posterior text checking
                let postText = lineText.substring(ch);
                let codePos2 = postText.indexOf('`');
                let spacePos2 = postText.indexOf(' ') - 1;

                
                preCh = Math.max(codePos1, spacePos1, 0);
                postCh = Math.min(codePos2, spacePos2);
                if (postCh < 0) postCh = lineText.length;

                if (preCh == codePos1 && postCh == codePos2) {
                    ; // no problem
                } else {
                    // if only one part of prev & post is italic, remove that part
                    if (preCh == codePos1 && codePos1 < 0) {
                        preCh = Math.min(codePos1 + 1, lineText.length);
                        preSpace = ' ';
                    }
                    if (postCh == codePos2 && codePos2 < 0) {
                        postCh = Math.max(codePos2 - 1, 0);
                        postSpace = ' ';
                    }
                }

                // set target text
                targetText = lineText.substring(preCh, postCh);

                // set selection
                cm.setSelection({ line: line, ch: preCh }, { line: line, ch: postCh });
            } else { 
                // has selection area
                targetText = cm.getSelection();

                let preCur = cm.getCursor('from');
                let postCur = cm.getCursor('to');

                if (preCur.line != postCur.line) {
                    multiLine = true;
                }
            }

            let regExp = /^[`]{1}(.*?)[`]{1}$/;
            let sigNum = 1; // code sign numbering 1 or 3(for multi-line)
            let sign = '`';
            if (multiLine) {
                // if multi line, use 3 sign
                regExp = /^[`]{3}(.*?)[`]{3}$/;
                sigNum = 3;
                sign = '```';
            }

            // if code(`) is included, remove it
            if (regExp.test(targetText.trim())) {
                adjustText = targetText.substring(sigNum, targetText.length - sigNum);
                ch -= sigNum;
            } else {
                // add code(`) before and after
                if (targetText == '') {
                    targetText = VP_MARKDOWN_DEFAULT_CODE_TEXT;
                }
                adjustText = preSpace + sign + targetText + sign + postSpace;
                ch += preSpace.length + sigNum;
            }
    
            // replace selection
            cm.replaceSelection(adjustText);
            // set cursor
            cm.setCursor({line: line, ch: ch});
            cm.focus();
        }
    
        /**
         * Link
         * @param {object} cm Codemirror Object
         */
        adjustLink(cm) {
            // selected text
            let { line, ch } = cm.getCursor();
            var selectedText = cm.getSelection();
            var linkText;
            if (selectedText.startsWith("http://") || selectedText.startsWith("https://")) {
                linkText = com_util.formatString("[{0}]({1})", VP_MARKDOWN_DEFAULT_LINK_TEXT, selectedText);
            } else {
                linkText = com_util.formatString("[{0}](https://)", (selectedText == undefined || selectedText == "" ? VP_MARKDOWN_DEFAULT_LINK_TEXT : selectedText));
            }
            cm.replaceSelection(linkText);
            // set cursor
            cm.setCursor({line: line, ch: ch});
            cm.focus();
        }
    
        /**
         * Indent style
         * @param {object} cm Codemirror Object
         */
        addIndentStyle(cm) {
            let {line, ch} = cm.getCursor();
            let indentText = VP_MARKDOWN_DEFAULT_INDENT_TEXT;
            // add indent style below this line
            cm.setSelection({line: line+1, ch: 0});
            cm.replaceSelection(indentText);
            // select default indent block text
            cm.setSelection({line: line+3, ch: 2}, {line: line+3});
            cm.focus();
        }
    
        /**
         * Ordered list style
         * @param {object} cm
         */
        addOrderdList(cm) {
            let {line, ch} = cm.getCursor();
            let listText = com_util.formatString("\n\n1.   {0}\n2.   {1}\n\n", VP_MARKDOWN_DEFAULT_LIST_TEXT, VP_MARKDOWN_DEFAULT_LIST_TEXT);
            // add list style below this line
            cm.setSelection({line: line+1, ch: 0});
            cm.replaceSelection(listText);
            // set cursor
            cm.setSelection({line: line+3, ch: 5}, {line: line+3});
            cm.focus();
        }
    
        /**
         * Unordered list style
         * @param {object} cm
         */
        addUnorderdList(cm) {
            let {line, ch} = cm.getCursor();
            let listText = com_util.formatString("\n\n*   {0}\n*   {1}\n\n", VP_MARKDOWN_DEFAULT_LIST_TEXT, VP_MARKDOWN_DEFAULT_LIST_TEXT);
            // add list style below this line
            cm.setSelection({line: line+1, ch: 0});
            cm.replaceSelection(listText);
            // set cursor
            cm.setSelection({line: line+3, ch: 4}, {line: line+3});
            cm.focus();
        }
    
        /**
         * Horizontal line
         * @param {object} cm
         */
        addHorizontalLine(cm) {
            let {line, ch} = cm.getCursor();
            let lineText = "\n\n---\n\n";
            // add line style below this line
            cm.setSelection({line: line+1, ch: 0});
            cm.replaceSelection(lineText);
            // set cursor
            cm.setCursor({line: line+3, ch: 3});
            cm.focus();
        }

    }

    return Markdown;
});