/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Seaborn.js
 *    Author          : Black Logic
 *    Note            : Visualization > Seaborn
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 03. 21
 *    Change Date     :
 */

//============================================================================
// [CLASS] Seaborn
//============================================================================
define([
    'text!vp_base/html/m_stat/descriptiveStat.html!strip',
    'css!vp_base/css/m_stat/descriptiveStat.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generator',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/VarSelector2',
    // 'vp_base/data/m_visualize/seabornLibrary',  // TODO : 추후 Descriptive Stat 으로 변경
    'vp_base/data/m_stat/descriptiveStatLibrary',  // TODO : 추후 Descriptive Stat 으로 변경
    'vp_base/js/com/component/DataSelector'
], function(methodHTml, methodCss, com_String, com_generator, com_util, PopupComponent, SuggestInput, VarSelector2, DESCRIPTIVE_STAT_LIBRARIES, DataSelector) {

    class DescriptiveStat extends PopupComponent {
        _init() {
            super._init();

            this.config.dataview = false;
            this.config.size = { width: 1064, height: 550 };
            this.config.checkModules = ['plt', 'sns'];

            this.state = {
                methodType: 'count',
                data: '',
                userOption: '',
                // preview options
                useSampling: true,
                sampleCount: 30,
                autoRefresh: true,

                ...this.state
            }
            
            this.methodConfig = DESCRIPTIVE_STAT_LIBRARIES;
            this.methodTypeList = {
                'Pandas': [ 'count', 'describe' ],
                'Numpy': [ 'sum', 'mean' ],
            }
            this.codeList = {}
            this.title_no = 0
        }

        _bindEvent() {
            let that = this;
            super._bindEvent();

            // [Method Setting] setting popup
            $(this.wrapSelector('#methodSetting')).on('click', function() {
                // show popup box
                that.openInnerPopup('Method Setting');
            });

            // // [Method Type] change method
            // $(this.wrapSelector('#chartType')).on('change', function() {
            //     // add bins to histplot
            //     let chartType = $(this).val();
            //     $(that.wrapSelector('.sb-option')).hide();
            //     if (chartType == 'histplot') {
            //         $(that.wrapSelector('#bins')).closest('.sb-option').show();
            //         $(that.wrapSelector('#kde')).closest('.sb-option').show();
            //         $(that.wrapSelector('#stat')).closest('.sb-option').show();
            //     } else if (chartType == 'barplot') {
            //         $(that.wrapSelector('#showValues')).closest('.sb-option').show();
            //         if (that.state.setXY === false) {
            //             if (that.state.x !== '' && that.state.y !== '') {
            //                 $(that.wrapSelector('#sortBy')).closest('.sb-option').show();
            //             }
            //             if (that.state.hue !== '') {
            //                 $(that.wrapSelector('#sortHue')).closest('.sb-option').show();
            //             }
            //         }
            //     } else if (chartType == 'countplot') {
            //         $(that.wrapSelector('#showValues')).closest('.sb-option').show();
            //         if (that.state.setXY === false) {
            //             if (that.state.x !== '' || that.state.y !== '') {
            //                 $(that.wrapSelector('#sortBy')).closest('.sb-option').show();
            //             }
            //             if (that.state.hue !== '') {
            //                 $(that.wrapSelector('#sortHue')).closest('.sb-option').show();
            //             }
            //         }
            //     }
            // });

            // [Refresh Button] preview refresh
            $(this.wrapSelector('#previewRefresh')).on('click', function() {
                that.loadPreview();
            });

            // [Auto Refresh Button] auto refresh
            $(document).off('change', this.wrapSelector('.vp-state'));
            $(document).on('change', this.wrapSelector('.vp-state'), function(evt) {
                that._saveSingleState($(this)[0]);
                if (that.state.autoRefresh) {
                    that.loadPreview();
                }
                evt.stopPropagation();
            });

        }

        templateForBody() {
            let page = $(methodHTml);
            let that = this;

            // [Method Type] 리스트 박스에 Method 목록 표시
            let methodTypeTag = new com_String();
            Object.keys(this.methodTypeList).forEach(methodCategory => {
                let methodOptionTag = new com_String();
                that.methodTypeList[methodCategory].forEach(opt => {
                    let selectedFlag = '';
                    if (opt === that.state.methodType) {
                        selectedFlag = 'selected';
                    }
                    methodOptionTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                                    opt, selectedFlag, opt);
                })
                methodTypeTag.appendFormatLine('<optgroup label="{0}">{1}</optgroup>',
                    methodCategory, methodOptionTag.toString());
            });
            $(page).find('#methodType').html(methodTypeTag.toString());

            // [Data] 기술통계 Data 선택
            let dataSelector = new DataSelector({
                type: 'data',
                pageThis: this,
                id: 'data',
            });
            $(page).find('#data').replaceWith(dataSelector.toTagString());

            // [Preview Sample] preview sample count
            let sampleCountList = [30, 50, 100, 300, 500, 700, 1000];
            let sampleCountTag = new com_String();
            sampleCountList.forEach(cnt => {
                let selectedFlag = '';
                if (cnt === that.state.sampleCount) {
                    selectedFlag = 'selected';
                }
                sampleCountTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                    cnt, selectedFlag, cnt);
            });
            $(page).find('#sampleCount').html(sampleCountTag.toString());

            //================================================================
            // Load state
            //================================================================
            Object.keys(this.state).forEach(key => {
                let tag = $(page).find('#' + key);
                let tagName = $(tag).prop('tagName'); // returns with UpperCase
                let value = that.state[key];
                if (value === undefined) {
                    return;
                }
                switch(tagName) {
                    case 'INPUT':
                        let inputType = $(tag).prop('type');
                        if (inputType === 'checkbox') {
                            $(tag).prop('checked', value);
                        } else {
                            // if (inputType == 'text' || inputType == 'number' || inputType == 'hidden') {
                            $(tag).val(value);
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

        // 수정 불필요
        templateForSettingBox() {
            return `<div class="vp-grid-border-box vp-grid-col-95 vp-method-setting-body">
                    <label for="figureWidth" class="">Figure size</label>
                    <div>
                        <input type="number" id="figureWidth" class="vp-input m" placeholder="width" value="12">
                        <input type="number" id="figureHeight" class="vp-input m" placeholder="height" value="8">
                    </div>
                    <label for="styleSheet" class="">Style sheet</label>
                    <input type="text" class="vp-input" id="styleSheet" placeholder="style name" value="">
                    <label for="fontName" class="">System font</label>
                    <input type="text" class="vp-input" id="fontName" placeholder="font name" value="">
                    <label for="fontSize" class="">Font size</label>
                    <input type="number" id="fontSize" class="vp-input" placeholder="size" value="10">
                </div>
                <div class="vp-method-setting-footer">
                    <label>
                        <input type="checkbox" id="setDefault">
                        <span title="Set method setting to default.">Set Default</span>
                    </label>
                </div>
            `;
        }

        render() {
            super.render();

            //================================================================
            // Method Setting Popup
            //================================================================
            // set inner popup content (chart setting)
            $(this.wrapSelector('.vp-inner-popup-body')).html(this.templateForSettingBox());

            // set inner button
            $(this.wrapSelector('.vp-inner-popup-button[data-type="ok"]')).text('Run');

            // set size
            $(this.wrapSelector('.vp-inner-popup-box')).css({ width: 400, height: 260});

            // set code view size
            $(this.wrapSelector('.vp-popup-codeview-box')).css({
                'height': '200px'
            });

            this.bindSettingBox();

            this.loadPreview();

            // Snippet 코드 그려주기
            // this.loadUdfList();
        }

        // 수정 불필요
        bindSettingBox() {
            //====================================================================
            // Stylesheet suggestinput
            //====================================================================
            const stylesheetTag = $(this.wrapSelector('#styleSheet'));
            // search available stylesheet list
            let code = new com_String();
            // FIXME: convert it to kernelApi
            code.appendLine('import matplotlib.pyplot as plt');
            code.appendLine('import json');
            code.append(`print(json.dumps([{ 'label': s, 'value': s } for s in plt.style.available]))`);
            vpKernel.execute(code.toString()).then(function(resultObj) {
                let { result } = resultObj;
                // get available stylesheet list
                var varList = JSON.parse(result);
                var suggestInput = new SuggestInput();
                suggestInput.setComponentID('styleSheet');
                suggestInput.setSuggestList(function() { return varList; });
                suggestInput.setPlaceholder('style name');
                // suggestInput.setValue('seaborn-darkgrid'); // set default (seaborn-darkgrid)
                // suggestInput.setNormalFilter(false);
                $(stylesheetTag).replaceWith(function() {
                    return suggestInput.toTagString();
                });
            });
    
            //====================================================================
            // System font suggestinput
            //====================================================================
            var fontFamilyTag = $(this.wrapSelector('#fontName'));
            // search system font list
            code = new com_String();
            // FIXME: convert it to kernelApi
            code.appendLine('import json'); 
            code.appendLine("import matplotlib.font_manager as fm");
            code.appendLine("_ttflist = fm.fontManager.ttflist");
            code.append("print(json.dumps([{'label': f.name, 'value': f.name } for f in _ttflist]))");
            vpKernel.execute(code.toString()).then(function(resultObj) {
                let { result } = resultObj;
                // get available font list
                var varList = JSON.parse(result);
                var suggestInput = new SuggestInput();
                suggestInput.setComponentID('fontName');
                suggestInput.setSuggestList(function() { return varList; });
                suggestInput.setPlaceholder('font name');
                // suggestInput.setNormalFilter(false);
                $(fontFamilyTag).replaceWith(function() {
                    return suggestInput.toTagString();
                });
            });

            let that = this;
            // setting popup - set default
            $(this.wrapSelector('#setDefault')).on('change', function() {
                let checked = $(this).prop('checked');

                if (checked) {
                    // disable input
                    $(that.wrapSelector('.vp-method-setting-body input')).prop('disabled', true);
                } else {
                    // enable input
                    $(that.wrapSelector('.vp-method-setting-body input')).prop('disabled', false);
                }
            });
        }

        // 수정 불필요
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
                        
                        $(that.wrapSelector('#methodPreview')).html('');
                        if (htmlResult !== undefined) {
                            // 1. HTML tag
                            $(that.wrapSelector('#methodPreview')).append(htmlResult);
                        } else if (imgResult !== undefined) {
                            // 2. Image data (base64)
                            var imgTag = '<img src="data:image/png;base64, ' + imgResult + '">';
                            $(that.wrapSelector('#methodPreview')).append(imgTag);
                        } else if (textResult !== undefined) {
                            // 3. Text data
                            var preTag = document.createElement('pre');
                            $(preTag).text(textResult);
                            $(that.wrapSelector('#methodPreview')).html(preTag);
                        }
                    } else {
                        var errorContent = '';
                        if (msg.content.ename) {
                            errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                        }
                        $(that.wrapSelector('#methodPreview')).html(errorContent);
                        vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                    }
                }).catch(function(resultObj) {
                    let { msg } = resultObj;
                    var errorContent = '';
                    if (msg.content.ename) {
                        errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                    }
                    $(that.wrapSelector('#methodPreview')).html(errorContent);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                });
            });
        }


        generateCode(preview=false) {
            let { 
                methodType, data, userOption='',
                useSampling, sampleCount
            } = this.state;

            if (data === '') {
                return "print('Please select data.')"
            }

            let code = new com_String();
            let config = this.methodConfig[methodType];
            let state = JSON.parse(JSON.stringify(this.state));

            // set check modules : Preview에 필요한 패키지가 Import 되어 있는지 체크
            if (preview === true) {
                // no auto-import for preview
                this.config.checkModules = [];
            } else {
                // if (showValues && showValues === true) {
                //     this.config.checkModules = ['plt', 'sns', 'np', 'vp_seaborn_show_values'];
                // } else {
                //     this.config.checkModules = ['plt', 'sns'];
                // }
                this.config.checkModules = ['plt', 'sns'];
            }

            if (preview === true && useSampling) {
                // data sampling code for preview
                // convertedData = data + '.sample(n=' + sampleCount + ', random_state=0)';
                // convertedData = com_util.formatString('_vp_sample({0}, {1})', data, sampleCount);
                // replace pre-defined options
                // generatedCode = generatedCode.replaceAll(data, convertedData);
                // if (setXY) {
                //     if (x && x != '') {
                //         state.x = com_util.formatString('_vp_sample({0}, {1})', x, sampleCount);
                //     }
                //     if (y && y != '') {
                //         state.y = com_util.formatString('_vp_sample({0}, {1})', y, sampleCount);
                //     }
                //     if (hue && hue != '') {
                //         state.hue = com_util.formatString('_vp_sample({0}, {1})', hue, sampleCount);
                //     }
                // } else {
                //     if (data && data != '') {
                //         state.data = com_util.formatString('_vp_sample({0}, {1})', data, sampleCount);
                //     }
                // }

                if (data && data !== '') {
                    state.data = com_util.formatString('_vp_sample({0}, {1})', data, sampleCount);
                }
            }

            // let methodCode = new com_String();

            let etcOptionCode = []
            // if (useColor == true && color != '') {
            //     etcOptionCode.push(com_util.formatString("color='{0}'", color));
            // }
            // if (markerStyle != '') {
            //     // TODO: marker to seaborn argument (ex. marker='+' / markers={'Lunch':'s', 'Dinner':'X'})
            //     etcOptionCode.push(com_util.formatString("marker='{0}'", markerStyle));
            // }
            // if (showValues === true && chartType === 'barplot') {
            //     etcOptionCode.push('ci=None');
            // }

            // if (setXY === false && sortType !== '') {
            //     let sortCode = '';
            //     let sortTypeStr = (sortType === 'descending'? 'ascending=False': 'ascending=True');
            //     let sortX = state.x;
            //     let sortY = state.y;
            //     if (sortBy === 'x') {
            //         sortX = state.y;
            //         sortY = state.x;
            //     }
            //     if (chartType === 'barplot' && sortX !== '' && sortY !== '') {
            //         if (hue !== '' && sortHue !== '') {
            //             sortCode = com_util.formatString("{0}[{1}[{2}]=={3}].groupby({4})[{5}].mean().sort_values({6}).index"
            //                                 , state.data, state.data, state.hue, com_util.convertToStr(sortHue, sortHueText), sortX, sortY, sortTypeStr);
            //         } else {
            //             sortCode = com_util.formatString("{0}.groupby({1})[{2}].mean().sort_values({3}).index", state.data, sortX, sortY, sortTypeStr);
            //         }
            //     } else if (chartType === 'countplot' && (sortX !== '' || sortY !== '')) {
            //         let countVar = sortX === ''? sortY: sortX;
            //         if (hue !== '' && sortHue !== '') {
            //             sortCode = com_util.formatString("{0}[{1}[{2}]=={3}][{4}].value_counts({5}).index"
            //                                 , state.data, state.data, state.hue, com_util.convertToStr(sortHue, sortHueText), countVar, sortTypeStr);
            //         } else {
            //             sortCode = com_util.formatString("{0}[{1}].value_counts({2}).index", state.data, countVar, sortTypeStr);
            //         }
            //     }
            //
            //     if (sortCode != '') {
            //         etcOptionCode.push('order=' + sortCode);
            //     }
            // }

            // add user option
            if (userOption !== '') {
                etcOptionCode.push(userOption);
            }

            let generatedCode = com_generator.vp_codeGenerator(this.uuid, config)

            // let generatedCode = com_generator.vp_codeGenerator(this, config, state
            //     , etcOptionCode.length > 0? ', ' + etcOptionCode.join(', '): '');

            // // Axes
            // if (x_limit_from != '' && x_limit_to != '') {
            //     chartCode.appendFormatLine("plt.xlim(({0}, {1}))", x_limit_from, x_limit_to);
            // }
            // if (y_limit_from != '' && y_limit_to != '') {
            //     chartCode.appendFormatLine("plt.ylim(({0}, {1}))", y_limit_from, y_limit_to);
            // }
            // if (legendPos != '') {
            //     chartCode.appendFormatLine("plt.legend(loc='{0}')", legendPos);
            // }
            // if (removeXticks === true) {
            //     // use empty list to disable xticks
            //     chartCode.appendLine("plt.xticks([])");
            // } else {
            //     let xticksOptList = [];
            //     if (xticks && xticks !== '') {
            //         xticksOptList.push('ticks=' + xticks);
            //         // Not able to use xticks_label without xticks
            //         if (xticks_label && xticks_label != '') {
            //             xticksOptList.push('labels=' + xticks_label);
            //         }
            //     }
            //     if (xticks_rotate && xticks_rotate !== '') {
            //         xticksOptList.push('rotation=' + xticks_rotate)
            //     }
            //     // Add option to chart code if available
            //     if (xticksOptList.length > 0) {
            //         chartCode.appendFormatLine("plt.xticks({0})", xticksOptList.join(', '));
            //     }
            // }
            // if (removeYticks === true) {
            //     // use empty list to disable yticks
            //     chartCode.appendLine("plt.yticks([])");
            // } else {
            //     let yticksOptList = [];
            //     if (yticks && yticks !== '') {
            //         yticksOptList.push('ticks=' + yticks);
            //         // Not able to use xticks_label without xticks
            //         if (yticks_label && yticks_label != '') {
            //             yticksOptList.push('labels=' + yticks_label);
            //         }
            //     }
            //     if (yticks_rotate && yticks_rotate !== '') {
            //         yticksOptList.push('rotation=' + yticks_rotate)
            //     }
            //     // Add option to chart code if available
            //     if (yticksOptList.length > 0) {
            //         chartCode.appendFormatLine("plt.yticks({0})", yticksOptList.join(', '));
            //     }
            // }
            // // Info
            // if (title && title != '') {
            //     chartCode.appendFormatLine("plt.title('{0}')", title);
            // }
            // if (x_label && x_label != '') {
            //     chartCode.appendFormatLine("plt.xlabel('{0}')", x_label);
            // }
            // if (y_label && y_label != '') {
            //     chartCode.appendFormatLine("plt.ylabel('{0}')", y_label);
            // }
            // // Style - Grid
            // // plt.grid(True, axis='x', color='red', alpha=0.5, linestyle='--')
            // let gridCodeList = [];
            // if (useGrid != '') {
            //     gridCodeList.push(useGrid);
            // }
            // if (useGrid == 'True' && gridColor != '') {
            //     gridCodeList.push(com_util.formatString("color='{0}'", gridColor));
            // }
            // if (gridCodeList.length > 0) {
            //     chartCode.appendFormatLine("plt.grid({0})", gridCodeList.join(', '));
            // }

            code.appendLine(generatedCode);

            // if (preview === true) {
            //     Ignore warning
            //     code.appendLine('import warnings');
            //     code.appendLine('with warnings.catch_warnings():');
            //     code.appendLine("    warnings.simplefilter('ignore')");
            //
            //     set figure size for preview method
            //     let defaultWidth = 8;
            //     let defaultHeight = 6;
            //     code.appendFormatLine('plt.figure(figsize=({0}, {1}))', defaultWidth, defaultHeight);
            //
            //     // if (showValues && showValues === true) {
            //     //     code.appendLine('ax = ' + generatedCode);
            //     //     code.append("_vp_seaborn_show_values(ax");
            //     //     if (showValuesPrecision !== '') {
            //     //         code.appendFormat(", precision={0}", showValuesPrecision);
            //     //     }
            //     //     code.appendLine(")");
            //     // } else {
            //     //     code.appendLine(generatedCode);
            //     // }
            //     code.appendLine(generatedCode);
            //     // code.appendLine(methodCode.toString());
            // } else {
            //     // if (showValues && showValues === true) {
            //     //     code.appendLine('ax = ' + generatedCode);
            //     //     code.appendLine("vp_seaborn_show_values(ax)");
            //     // } else {
            //     //     code.appendLine(generatedCode);
            //     // }
            //     code.appendLine(generatedCode);
            //     if (methodCode.length > 0) {
            //         code.append(methodCode.toString());
            //     }
            // }

            // if (userCode1 && userCode1 != '') {
            //     code.appendLine(userCode1);
            // }

            // code.append('plt.show()');

            generatedCode = code.toString().replace(/\n+$/, "");

            this.createSnippetItem(generatedCode)

            // remove last Enter(\n) from code and then run it
            return generatedCode;
        }


        // Snippet 코드 불러오기
        // loadUdfList() {
        //     var that = this;
        //
        //     // clear table except head
        //     $(this.wrapSelector('.vp-sn-table')).html('');
        //
        //     // load udf list to table 'vp_udfList'
        //     vpConfig.getData().then(function(udfObj) {
        //         vpLog.display(VP_LOG_TYPE.DEVELOP, udfObj);
        //         var snippets = new com_String();
        //         Object.keys(udfObj).forEach(key => {
        //             let obj = udfObj[key];
        //             if (obj.code != null && obj.code != undefined) {
        //
        //                 var hasImported = false;
        //                 if (that.importedList.includes(key)) {
        //                     // set new label
        //                     hasImported = true;
        //                 }
        //                 var item = that.renderSnippetItem(key, obj.code, obj.timestamp, hasImported);
        //                 snippets.append(item);
        //             }
        //         });
        //         $(that.wrapSelector('.vp-sn-table')).html(snippets.toString());
        //
        //         // bind snippet item
        //         that.bindSnippetItem();
        //
        //         // load codemirror
        //         var codeList = $(that.wrapSelector('.vp-sn-item-code textarea'));
        //         codeList.each((idx, tag) => {
        //             var title = $(tag).closest('.vp-sn-item').data('title');
        //             that.bindCodeMirror(title, tag);
        //         });
        //     });
        // }

        // Snippet 라인을 HTML 코드로 만들어주기 ★
        renderSnippetItem(title, code, timestamp, hasImported=false) {
            var item = new com_String();
            item.appendFormatLine('<div class="{0}" data-title="{1}" data-timestamp="{2}">', 'vp-sn-item', title, timestamp);
            item.appendFormatLine('<div class="{0}">', 'vp-sn-item-header');
            item.appendFormatLine('<div class="{0}"></div>', 'vp-sn-indicator');
            item.appendFormatLine('<input type="text" class="vp-input {0}" value="{1}" disabled/>', 'vp-sn-item-title', code.split('\n')[0]);
            if (hasImported) {
                item.appendFormatLine('<i class="{0}"></i>', 'fa fa-circle vp-sn-imported-item');
            }
            item.appendFormatLine('<div class="{0}">', 'vp-sn-item-menu');
            item.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}">'
                , 'vp-sn-item-menu-item', 'run', 'Run');
            item.appendFormatLine('<img src="{0}"/>', '/nbextensions/visualpython/img/snippets/run.svg');
            item.appendLine('</div>');
            item.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}">'
                , 'vp-sn-item-menu-item', 'duplicate', 'Duplicate');
            item.appendFormatLine('<img src="{0}"/>', '/nbextensions/visualpython/img/snippets/duplicate.svg');
            item.appendLine('</div>');
            item.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}">'
                , 'vp-sn-item-menu-item', 'delete', 'Delete');
            item.appendFormatLine('<img src="{0}"/>', '/nbextensions/visualpython/img/delete.svg');
            item.appendLine('</div>');
            item.appendLine('</div>'); // end of vp-sn-item-menu
            // export mode checkbox
            item.appendFormatLine('<input type="checkbox" class="{0} {1}"/>', 'vp-sn-checkbox', 'vp-sn-item-check');
            item.appendLine('</div>'); // end of vp-sn-item-header
            item.appendFormatLine('<div class="{0}">', 'vp-sn-item-code');
            item.appendFormatLine('<textarea>{0}</textarea>', code);
            item.appendFormatLine('<div class="{0} {1} vp-disable" data-menu="{2}" title="{3}">', 'vp-sn-item-menu-item', 'vp-sn-save', 'save', 'Save changes');
            item.appendFormatLine('<img src="{0}"/>', '/nbextensions/visualpython/img/snippets/save_orange.svg');
            item.appendLine('</div>'); // vp-sn-save
            item.appendLine('</div>'); // end of vp-sn-item-code
            item.appendLine('</div>'); // end of vp-sn-item
            return item.toString();
        }

        // Snippet 관련 : Code Mirror는 원래의 Code를 복사한 후 변경여부를 파악하기 위함 -> 필요없음
        // bindCodeMirror(title, selector) {
        //     let cmCode = this.initCodemirror({
        //         key: title,
        //         selector: selector,
        //         type: 'code',
        //         events: [{
        //             key: 'change',
        //             callback: function(evt, chgObj) {
        //                 if (chgObj.removed.join('') != '' || chgObj.text.join('') != '') {
        //                     // enable save button
        //                     $(selector).parent().find('.vp-sn-save').removeClass('vp-disable');
        //                 }
        //             }
        //         }]
        //     });
        //     this.codemirrorList[title] = cmCode;
        // }

        // TODO : Snippet의 메뉴 버튼에 대한 Action 관련 - 삭제 버튼만 남기고 제거하기
        bindSnippetItem() {
            let that = this;
            // item header click (select item) &  double click (edit title)
            $(this.wrapSelector('.vp-sn-item-header')).off('click');
            $(this.wrapSelector('.vp-sn-item-header')).on('click', function(evt) {
                // stop propagation on checkbox
                if ($(evt.target).hasClass('vp-sn-item-check')) {
                    return;
                }

                var thisHeader = this;
                that.clicked++;
                if (that.clicked == 1) {
                    setTimeout(function(){
                        let selected = $(thisHeader).hasClass('selected');
                        if(selected || that.clicked > 1) {
                            // double click or clicked after selection
                            // enable input
                            $(thisHeader).find('.vp-sn-item-title').prop('disabled', false);
                            $(thisHeader).find('.vp-sn-item-title').select();
                            $(thisHeader).find('.vp-sn-item-title').focus();

                        }
                        // single click
                        // select item
                        // remove selection
                        $(that.wrapSelector('.vp-sn-item-header')).removeClass('selected');
                        // select item
                        $(thisHeader).addClass('selected');
                        that.clicked = 0;
                    }, 200);
                }
                evt.stopPropagation();
            });

            // item indicator click (toggle item)
            $(this.wrapSelector('.vp-sn-indicator')).off('click');
            $(this.wrapSelector('.vp-sn-indicator')).on('click', function(evt) {
                // toggle item
                var parent = $(this).parent().parent();
                var indicator = $(this);
                var hasOpen = $(indicator).hasClass('open');
                // Deprecated: hide all codebox
                // $(that.wrapSelector('.vp-sn-indicator')).removeClass('open');
                // $(that.wrapSelector('.vp-sn-item-code')).hide();

                if (!hasOpen) {
                    // show code
                    $(indicator).addClass('open');
                    $(parent).find('.vp-sn-item-code').show();
                } else {
                    // hide code
                    $(indicator).removeClass('open');
                    $(parent).find('.vp-sn-item-code').hide();
                }
            });

            // prevent occuring header click event by clicking input
            $(this.wrapSelector('.vp-sn-item-title')).off('click');
            $(this.wrapSelector('.vp-sn-item-title')).on('click', function(evt) {
                evt.stopPropagation();
            });

            // item title save
            $(this.wrapSelector('.vp-sn-item-title')).off('blur');
            $(this.wrapSelector('.vp-sn-item-title')).on('blur', function(evt) {
                var prevTitle = $(this).closest('.vp-sn-item').data('title');
                var inputTitle = $(this).val();

                if (prevTitle == inputTitle) {
                    ;
                } else {
                    // check duplicated
                    var titleList = Object.keys(that.codemirrorList);
                    var newTitle = inputTitle;
                    var dupNo = 0
                    while(titleList.includes(newTitle)) {
                        dupNo += 1;
                        newTitle = inputTitle + '_' + dupNo;
                    }

                    let cmCode = that.codemirrorList[prevTitle];
                    if (cmCode) {
                        cmCode.save();
                        var code = cmCode.getValue();
                        // Remove original title
                        vpConfig.removeData(prevTitle);

                        // Save data with new title
                        // save udf
                        var newTimestamp = new Date().getTime();
                        var newSnippet = { [newTitle]: { code: code, timestamp: newTimestamp } };
                        vpConfig.setData(newSnippet);

                    }
                    // update title & codemirror
                    $(this).closest('.vp-sn-item-title').val(newTitle);
                    $(this).closest('.vp-sn-item').data('title', newTitle);
                    // update codemirror
                    that.codemirrorList[newTitle] = that.codemirrorList[prevTitle];
                    delete that.codemirrorList[prevTitle];
                }

                // disable
                $(this).prop('disabled', true);
            });

            // item menu click
            $(this.wrapSelector('.vp-sn-item-menu-item')).off('click');
            $(this.wrapSelector('.vp-sn-item-menu-item')).on('click', function(evt) {
                var menu = $(this).data('menu');
                var item = $(this).closest('.vp-sn-item');
                var title = $(item).data('title');
                if (menu == 'run') {
                    // get codemirror
                    let cmCode = that.codemirrorList[title];
                    cmCode.save();
                    var code = cmCode.getValue();
                    // create block and run it
                    $('#vp_wrapper').trigger({
                        type: 'create_option_page',
                        blockType: 'block',
                        menuId: 'lgExe_code',
                        menuState: { taskState: { code: code } },
                        afterAction: 'run'
                    });
                } else if (menu == 'duplicate') {
                    var dupNo = 1;
                    var timestamp = new Date().getTime();
                    var dupTitle = title + '_dup' + dupNo;
                    var titleList = Object.keys(that.codemirrorList);
                    // set duplicate title
                    while(titleList.includes(dupTitle)) {
                        dupNo += 1;
                        dupTitle = title + '_dup' + dupNo;
                    }

                    // add duplicated one
                    var code = that.codemirrorList[title].getValue();

                    var dupItem = $(that.renderSnippetItem(dupTitle, code, timestamp));
                    $(that.wrapSelector('.vp-sn-table')).append(dupItem);
                    // bind snippet item
                    that.bindSnippetItem();

                    // save it
                    var dupSnippet = { [dupTitle]: { code: code, timestamp: timestamp } };
                    vpConfig.setData(dupSnippet);

                    var tag = $(that.wrapSelector('.vp-sn-item[data-title="' + dupTitle + '"] textarea'));
                    that.bindCodeMirror(dupTitle, tag[0]);
                    $(dupItem).find('.vp-sn-indicator').trigger('click');

                } else if (menu === 'delete') {
                    delete that.codeList[title]
                    $(that.wrapSelector('.vp-sn-item[data-title="' + title + '"]')).remove();
                    com_util.renderSuccessMessage('Successfully removed!');

                    // title && vpConfig.getData(title).then(function(dataObj) {
                    //     // remove key
                    //     vpConfig.removeData(title);
                    //     delete that.codemirrorList[title];
                    //     // remove item
                    //     $(that.wrapSelector('.vp-sn-item[data-title="' + title + '"]')).remove();
                    //
                    //     // vp-multilang for success message
                    //     com_util.renderSuccessMessage('Successfully removed!');
                    // }).catch(function(err) {
                    //     com_util.renderAlertModal('No key available...');
                    //     // load again
                    //     that.loadUdfList();
                    // });

                } else if (menu == 'save') {
                    if (!$(this).hasClass('vp-disable')) {
                        var codemirror = that.codemirrorList[title];
                        codemirror.save();
                        var code = codemirror.getValue();

                        // save changed code
                        var timestamp = new Date().getTime();
                        var updateSnippet = { [title]: { code: code, timestamp: timestamp } };
                        vpConfig.setData(updateSnippet);

                        // disable it
                        $(this).addClass('vp-disable');
                    }
                }
                evt.stopPropagation();
            });

            // check items
            $(this.wrapSelector('.vp-sn-item-check')).off('change');
            $(this.wrapSelector('.vp-sn-item-check')).on('change', function() {
                var checked = $(this).prop('checked');
                // if unchecked at least one item, uncheck check-all
                if (!checked) {
                    $(that.wrapSelector('.vp-sn-check-all')).prop('checked', false);
                } else {
                    // if all checked, check check-all
                    var allLength = $(that.wrapSelector('.vp-sn-item-check')).length;
                    var checkedLength = $(that.wrapSelector('.vp-sn-item-check:checked')).length;
                    if (allLength == checkedLength) {
                        $(that.wrapSelector('.vp-sn-check-all')).prop('checked', true);
                    }
                }
            });
        }

        // Snippet 생성하기
        createSnippetItem(generatedCode) {
            // var titleList = Object.keys(that.codemirrorList);
            // var newTitle = 'untitled' + that.title_no;
            // while(titleList.includes(newTitle)) {
            //     that.title_no += 1;
            //     newTitle = 'untitled' + that.title_no;
            // }
            //
            // var timestamp = new Date().getTime();
            // var newItem = $(that.renderSnippetItem(newTitle, '', timestamp));
            // $(that.wrapSelector('.vp-sn-table')).append(newItem);
            // // bind snippet item
            // that.bindSnippetItem();
            //
            // // save it
            // var newSnippet = { [newTitle]: { code: '', timestamp: timestamp } };
            // vpConfig.setData(newSnippet);
            //
            // var tag = $(that.wrapSelector('.vp-sn-item[data-title="' + newTitle + '"] textarea'));
            // that.bindCodeMirror(newTitle, tag[0]);
            // $(newItem).find('.vp-sn-indicator').trigger('click');
            //
            // that.title_no += 1;

            let that = this;
            var newTitle = 'title' + that.title_no;
            var timestamp = new Date().getTime();
            // show snippet item
            var newItem = $(that.renderSnippetItem(newTitle, generatedCode, timestamp));
            $(that.wrapSelector('.vp-sn-table')).append(newItem);
            // bind snippet item
            that.bindSnippetItem();

            // save it
            // var newSnippet = { [newTitle]: { code: generatedCode, timestamp: timestamp } };
            that.codeList[newTitle] = { code: generatedCode, timestamp: timestamp };
            that.title_no += 1;
        }

    }

    return DescriptiveStat;
});