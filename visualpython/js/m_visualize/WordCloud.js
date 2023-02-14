/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : WordCloud.js
 *    Author          : Black Logic
 *    Note            : Visualization > WordCloud
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 05. 16
 *    Change Date     :
 */

//============================================================================
// [CLASS] WordCloud
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_visualize/wordCloud.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_visualize/wordCloud'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/FileNavigation',
    'vp_base/js/com/component/DataSelector'
], function(wcHTML, wcCss, com_String, com_util, PopupComponent, SuggestInput, FileNavigation, DataSelector) {

    class WordCloud extends PopupComponent {
        _init() {
            super._init();

            this.config.size = { width: 1064, height: 550 };
            this.config.installButton = true;
            this.config.importButton = true;
            this.config.dataview = false;
            this.config.checkModules = ['Counter', 'plt', 'WordCloud'];

            this.state = {
                data: '',
                useFile: false,
                encoding: '',
                wordCount: '200',
                stopWords: '',
                fontPath: '',
                userOption: '', 
                figWidth: '8',
                figHeight: '20',
                autoRefresh: true,
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();

            let that = this;
            // open file event for data
            $(this.wrapSelector('#vp_wcOpenFile')).on('click', function() {
                if (that.state.useFile === true) {
                    let fileNavi = new FileNavigation({
                        type: 'open',
                        extensions: [ 'txt' ],
                        finish: function(filesPath, status, error) {
                            let {file, path} = filesPath[0];
                            that.state.data = path;
    
                            that.state.useFile = true;
                            $(that.wrapSelector('.vp-wc-file-option')).show();
                            $(that.wrapSelector('#useFile')).prop('checked', true);
                            $(that.wrapSelector('#useFile')).trigger('change');
    
                            // set text
                            $(that.wrapSelector('#data')).val(path);
                            $(that.wrapSelector('#data')).trigger('change');
                        }
                    });
                    fileNavi.open();
                }
            });

            // use file
            $(this.wrapSelector('#useFile')).on('change', function() {
                let checked = $(this).prop('checked');
                if (checked === true) {
                    $(that.wrapSelector('.vp-wc-file-option')).show();
                    $(that.wrapSelector('#vp_wcOpenFile')).show();
                } else {
                    $(that.wrapSelector('.vp-wc-file-option')).hide();
                    $(that.wrapSelector('#vp_wcOpenFile')).hide();
                }
            });

            // change tab
            $(this.wrapSelector('.vp-tab-item')).on('click', function() {
                let type = $(this).data('type'); // data / wordcloud / plot

                $(that.wrapSelector('.vp-tab-bar .vp-tab-item')).removeClass('vp-focus');
                $(this).addClass('vp-focus');

                $(that.wrapSelector('.vp-tab-page-box > .vp-tab-page')).hide();
                $(that.wrapSelector(com_util.formatString('.vp-tab-page[data-type="{0}"]', type))).show();
            });

            // load preview
            $(document).off('change', this.wrapSelector('.vp-state'));
            $(document).on('change', this.wrapSelector('.vp-state'), function(evt) {
                that._saveSingleState($(this)[0]);
                if (that.state.autoRefresh) {
                    that.loadPreview();
                }
                evt.stopPropagation();
            });
            
            // preview refresh
            $(this.wrapSelector('#previewRefresh')).on('click', function() {
                that.loadPreview();
            });

        }

        templateForBody() {
            let page = $(wcHTML);

            if (this.state.useFile == true) {
                $(page).find('.vp-wc-file-option').show();
                $(page).find('#vp_wcOpenFile').show();
            } else {
                $(page).find('.vp-wc-file-option').hide();
                $(page).find('#vp_wcOpenFile').hide();
            }

            let that = this;
            //================================================================
            // Load state
            //================================================================
            Object.keys(this.state).forEach(key => {
                let tag = $(page).find('#' + key);
                let tagName = $(tag).prop('tagName'); // returns with UpperCase
                let value = that.state[key];
                if (value == undefined) {
                    return;
                }
                switch(tagName) {
                    case 'INPUT':
                        let inputType = $(tag).prop('type');
                        if (inputType == 'text' || inputType == 'number' || inputType == 'hidden') {
                            $(tag).val(value);
                            break;
                        }
                        if (inputType == 'checkbox') {
                            $(tag).prop('checked', value);
                            break;
                        }
                        break;
                    case 'TEXTAREA':
                    case 'SELECT':
                    default:
                        $(tag).val(value);
                        break;
                }
            });

            return page;
        }

        render() {
            super.render();

            let that = this;

            // Add style
            $(this.wrapSelector('.vp-popup-body-top-bar')).css({
                'position': 'absolute',
                'left': 'calc(50% - 250px)'
            });
            $(this.wrapSelector('.vp-popup-codeview-box')).css({
                'height': '200px'
            });

            // bind dataSelector to #data
            let dataSelector = new DataSelector({
                type: 'data',
                pageThis: this,
                id: 'data',
                required: true,
                select: function() {
                    that.state.useFile = false;
                    $(that.wrapSelector('#useFile')).prop('checked', false);
                    $(that.wrapSelector('.vp-wc-file-option')).hide();
                },
                finish: function() {
                    that.state.useFile = false;
                    $(that.wrapSelector('#useFile')).prop('checked', false);
                    $(that.wrapSelector('.vp-wc-file-option')).hide();
                }
            });
            $(this.wrapSelector('#data')).replaceWith(dataSelector.toTagString());
    
            // System font suggestinput
            var fontFamilyTag = $(this.wrapSelector('#fontPath'));
            // search system font list
            var code = new com_String(); 
            // FIXME: convert it to kernelApi
            code.appendLine('import json'); 
            code.appendLine("import matplotlib.font_manager as fm");
            code.appendLine("_ttflist = fm.fontManager.ttflist");
            code.append("print(json.dumps([{'label': f.name, 'value': f.fname.replace('\\\\', '/') } for f in _ttflist]))");
            vpKernel.execute(code.toString()).then(function(resultObj) {
                let { result } = resultObj;
                // get available font list
                var varList = JSON.parse(result);
                var suggestInput = new SuggestInput();
                suggestInput.setComponentID('fontPath');
                suggestInput.addClass('vp-input vp-state');
                suggestInput.setSuggestList(function() { return varList; });
                suggestInput.setPlaceholder('font path');
                suggestInput.setValue(that.state.fontPath);
                // suggestInput.setNormalFilter(false);
                $(fontFamilyTag).replaceWith(function() {
                    return suggestInput.toTagString();
                });
            });

            // encoding suggest input
            $(this.wrapSelector('#encoding')).replaceWith(function() {
                // encoding list : utf8 cp949 ascii
                var encodingList = ['utf8', 'cp949', 'ascii'];
                var suggestInput = new SuggestInput();
                suggestInput.setComponentID('encoding');
                suggestInput.addClass('vp-input vp-state');
                suggestInput.setSuggestList(function() { return encodingList; });
                suggestInput.setPlaceholder('encoding option');
                suggestInput.setValue(that.state.encoding);
                return suggestInput.toTagString();
            });

            this.loadPreview();
        }

        loadPreview() {
            let that = this;
            let code = this.generateCode(true);

            that.checkAndRunModules(true).then(function() {
                // show variable information on clicking variable
                vpKernel.execute(code).then(function(resultObj) {
                    let { result, type, msg } = resultObj;
                    if (msg.content.data) {
                        var textResult = msg.content.data["text/plain"];
                        var htmlResult = msg.content.data["text/html"];
                        var imgResult = msg.content.data["image/png"];
                        
                        $(that.wrapSelector('#vp_wcPreview')).html('');
                        if (htmlResult != undefined) {
                            // 1. HTML tag
                            $(that.wrapSelector('#vp_wcPreview')).append(htmlResult);
                        } else if (imgResult != undefined) {
                            // 2. Image data (base64)
                            var imgTag = '<img src="data:image/png;base64, ' + imgResult + '">';
                            $(that.wrapSelector('#vp_wcPreview')).append(imgTag);
                        } else if (textResult != undefined) {
                            // 3. Text data
                            var preTag = document.createElement('pre');
                            $(preTag).text(textResult);
                            $(that.wrapSelector('#vp_wcPreview')).html(preTag);
                        }
                    } else {
                        var errorContent = '';
                        if (msg.content.ename) {
                            errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                        }
                        $(that.wrapSelector('#vp_wcPreview')).html(errorContent);
                        vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                    }
                }).catch(function(resultObj) {
                    let { msg } = resultObj;
                    var errorContent = '';
                    if (msg.content.ename) {
                        errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                    }
                    $(that.wrapSelector('#vp_wcPreview')).html(errorContent);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                });
            });
        }

        generateInstallCode() {
            return ['!pip install wordcloud'];
        }

        generateImportCode() {
            var code = new com_String();
            code.appendLine('from wordcloud import WordCloud'); // need to be installed

            code.appendLine('from collections import Counter');
            code.appendLine('import matplotlib.pyplot as plt');
            code.append('%matplotlib inline');
            return [code.toString()];
        }

        generateCode(preview=false) {
            let { 
                data, data_state, useFile, encoding, wordCount, 
                stopWords, fontPath, userOption, figWidth, figHeight 
            } = this.state;
            let code = new com_String();
            
            // preview option
            if (preview === true) {
                // Ignore warning
                code.appendLine('import warnings');
                code.appendLine('with warnings.catch_warnings():');
                code.appendLine("    warnings.simplefilter('ignore')");

                // no auto-import for preview
                this.config.checkModules = [];
            } else {
                this.config.checkModules = ['Counter', 'plt', 'WordCloud'];
            }

            // counter for top limit
            let dataVariable = data;
            if (useFile) {
                code.appendFormat("with open('{0}', 'rt'", data);
                if (encoding && encoding != '') {
                    code.appendFormat(", encoding='{0}'", encoding);
                }
                code.appendLine(") as fp:");
                code.appendLine("    word_cloud_text = fp.read()");
                code.appendLine();
                dataVariable = 'word_cloud_text';
            } else {
                // check data type and convert it to string
                // let dataType = $(this.wrapSelector('#data')).data('type');
                let dataType = '';
                if (data_state) {
                    dataType = data_state['returnDataType'];
                }
                if (dataType == 'DataFrame' || dataType == 'Series') {
                    dataVariable = data + '.to_string()';
                }
            }
            code.appendFormatLine("counts = Counter({0}.split())", dataVariable);
            code.appendFormatLine("tags = counts.most_common({0})", wordCount);
            code.appendLine();

            // create wordcloud FIXME:
            let options=[];
            options.push("max_font_size=200");
            options.push("background_color='white'");
            options.push("width=1000, height=800");

            if (stopWords && stopWords != '') {
                options.push(com_util.formatString("stopwords=['{0}']", stopWords.split(',').join("','")));
            }
            if (fontPath && fontPath != '') {
                options.push(com_util.formatString("font_path='{0}'", fontPath));
            }
            if (userOption && userOption != '') {
                options.push(', ' + userOption);
            }

            code.appendFormatLine("wc = WordCloud({0})", options.join(', '));
            code.appendLine("cloud = wc.generate_from_frequencies(dict(tags))");
            code.appendLine();
            
            // use plot to show 
            code.appendFormatLine("plt.figure(figsize=({0}, {1}))", figWidth, figHeight);
            code.appendLine("plt.imshow(cloud)");
            code.appendLine("plt.tight_layout(pad=0)");
            code.appendLine("plt.axis('off')");
            code.appendLine("plt.show()");
    
            return code.toString();
        }
    }

    return WordCloud;
});