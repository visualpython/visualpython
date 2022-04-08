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
    'text!vp_base/html/m_visualize/seaborn.html!strip',
    'css!vp_base/css/m_visualize/seaborn.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/VarSelector2',
    'vp_base/data/m_visualize/chartLibrary'
], function(chartHTml, chartCss, com_String, com_generator, com_util, PopupComponent, SuggestInput, VarSelector2, CHART_LIBRARIES) {

    class Seaborn extends PopupComponent {
        _init() {
            super._init();

            this.config.dataview = false;
            this.config.sizeLevel = 3;

            this.state = {
                chartType: 'scatterplot',
                figWidth: '',
                figHeight: '',
                figRow: 0,
                figColumn: 0,
                shareX: false,
                shareY: false,
                data: '',
                x: '',
                y: '',
                hue: '',
                useSampling: true,
                sampleCount: 30,
                autoRefresh: true,
                ...this.state
            }
            
            this.chartConfig = CHART_LIBRARIES;
            this.chartTypeList = {
                'Relational': [ 'scatterplot', 'lineplot' ],
                'Distributions': [ 'histplot', 'kdeplot', 'ecdfplot', 'rugplot' ], // FIXME: ecdf : no module
                'Categorical': [ 'stripplot', 'swarmplot', 'boxplot', 'violinplot', 'pointplot', 'barplot' ],
                'ETC': [ ]
            }
        }

        _bindEvent() {
            super._bindEvent();

            let that = this;

            // setting popup
            $(this.wrapSelector('#chartSetting')).on('click', function() {
                // show popup box
                that.openInnerPopup('Chart Setting');
            });

            // check create subplots
            $(this.wrapSelector('#createSubplots')).on('change', function() {
                let checked = $(this).prop('checked');
                // toggle figure option box
                if (checked) {
                    $(that.wrapSelector('#subplotBox')).show();
                } else {
                    $(that.wrapSelector('#subplotBox')).hide();
                }
            });

            // create subplots
            $(this.wrapSelector('#createSubplotsBtn')).on('click', function() {
                // TODO:
            });

            // change tab
            $(this.wrapSelector('.vp-tab-item')).on('click', function() {
                let level = $(this).parent().data('level');
                let type = $(this).data('type'); // info / element / figure

                $(that.wrapSelector(com_util.formatString('.vp-tab-bar.{0} .vp-tab-item', level))).removeClass('vp-focus');
                $(this).addClass('vp-focus');

                $(that.wrapSelector(com_util.formatString('.vp-tab-page-box.{0} .vp-tab-page', level))).hide();
                $(that.wrapSelector(com_util.formatString('.vp-tab-page[data-type="{0}"]', type))).show();
            });

            // bind column by dataframe
            $(document).on('change', this.wrapSelector('#data'), function() {
                com_generator.vp_bindColumnSource(that.wrapSelector(), this, ['x', 'y', 'hue'], 'select');
            });

            // preview refresh
            $(this.wrapSelector('#previewRefresh')).on('click', function() {
                that.loadPreview();
            });
            $(this.wrapSelector('.vp-state')).on('change', function() {
                if (that.state.autoRefresh && that.state.data != '') {
                    that.loadPreview();
                }
            });

        }

        templateForBody() {
            let page = $(chartHTml);

            let that = this;

            // chart types
            let chartTypeTag = new com_String();
            Object.keys(this.chartTypeList).forEach(chartCategory => {
                let chartOptionTag = new com_String();
                that.chartTypeList[chartCategory].forEach(opt => {
                    let optConfig = that.chartConfig[opt];
                    let selectedFlag = '';
                    if (opt == that.state.chartType) {
                        selectedFlag = 'selected';
                    }
                    chartOptionTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                                    opt, selectedFlag, opt);
                })
                chartTypeTag.appendFormatLine('<optgroup label="{0}">{1}</optgroup>', 
                    chartCategory, chartOptionTag.toString());
            });
            $(page).find('#chartType').html(chartTypeTag.toString());

            // chart variable
            let varSelector = new VarSelector2(this.wrapSelector(), ['DataFrame', 'Series', 'list']);
            varSelector.setComponentID('data');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.featureData);
            $(page).find('#data').replaceWith(varSelector.toTagString());

            // preview sample count
            let sampleCountList = [30, 50, 100, 300, 500, 700, 1000];
            let sampleCountTag = new com_String();
            sampleCountList.forEach(cnt => {
                let selectedFlag = '';
                if (cnt == that.state.sampleCount) {
                    selectedFlag = 'selected';
                }
                sampleCountTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                    cnt, selectedFlag, cnt);
            });
            $(page).find('#sampleCount').html(sampleCountTag.toString());

            return page;
        }

        templateForSettingBox() {
            return `<div class="vp-grid-border-box vp-grid-col-95">
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
            </div>`;
        }

        render() {
            super.render();

            //================================================================
            // Chart Setting Popup
            //================================================================
            // set inner popup content (chart setting)
            $(this.wrapSelector('.vp-inner-popup-body')).html(this.templateForSettingBox());

            // set inner button
            $(this.wrapSelector('.vp-inner-popup-button[data-type="ok"]')).text('Run');

            // set size
            $(this.wrapSelector('.vp-inner-popup-box')).css({ width: 400, height: 260});

            this.renderImportOptions();
        }

        renderImportOptions() {
            //====================================================================
            // Stylesheet suggestinput
            //====================================================================
            var stylesheetTag = $(this.wrapSelector('#styleSheet'));
            // search available stylesheet list
            var code = new com_String(); 
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
            var code = new com_String();
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
        }

        handleInnerOk() {
            // generateImportCode
            var code = this.generateImportCode();
            // create block and run it
            $('#vp_wrapper').trigger({
                type: 'create_option_page', 
                blockType: 'block',
                menuId: 'lgExe_code',
                menuState: { taskState: { code: code } },
                afterAction: 'run'
            });

            this.closeInnerPopup();
        }

        loadPreview() {
            let that = this;
            let code = this.generateCode(true);

            // show variable information on clicking variable
            vpKernel.execute(code).then(function(resultObj) {
                let { result, type, msg } = resultObj;
                var textResult = msg.content.data["text/plain"];
                var htmlResult = msg.content.data["text/html"];
                var imgResult = msg.content.data["image/png"];
                
                $(that.wrapSelector('#chartPreview')).html('');
                if (htmlResult != undefined) {
                    // 1. HTML tag
                    $(that.wrapSelector('#chartPreview')).append(htmlResult);
                } else if (imgResult != undefined) {
                    // 2. Image data (base64)
                    var imgTag = '<img src="data:image/png;base64, ' + imgResult + '">';
                    $(that.wrapSelector('#chartPreview')).append(imgTag);
                } else if (textResult != undefined) {
                    // 3. Text data
                    var preTag = document.createElement('pre');
                    $(preTag).text(textResult);
                    $(that.wrapSelector('#chartPreview')).html(preTag);
                }
            });
        }

        generateImportCode () {
            var code = new com_String();
    
            // get parameters
            var figWidth = $(this.wrapSelector('#figureWidth')).val();
            var figHeight = $(this.wrapSelector('#figureHeight')).val();
            var styleName = $(this.wrapSelector('#styleSheet')).val();
            var fontName = $(this.wrapSelector('#fontName')).val();
            var fontSize = $(this.wrapSelector('#fontSize')).val();
    
            code.appendLine('import matplotlib.pyplot as plt');
            code.appendFormatLine("plt.rc('figure', figsize=({0}, {1}))", figWidth, figHeight);
            if (styleName && styleName.length > 0) {
                code.appendFormatLine("plt.style.use('{0}')", styleName);
            }
            code.appendLine();
    
            code.appendLine('from matplotlib import rcParams');
            if (fontName && fontName.length > 0) {
                code.appendFormatLine("rcParams['font.family'] = '{0}'", fontName);
            }
            if (fontSize && fontSize.length > 0) {
                code.appendFormatLine("rcParams['font.size'] = {0}", fontSize);
            }
            code.append("rcParams['axes.unicode_minus'] = False");
    
            return code.toString();
        }

        generateCode(preview=false) {
            let { chartType, data, x, y, userOption='', allocateTo='', useSampling } = this.state;
            let code = new com_String();
            let config = this.chartConfig[chartType];

            let chartCode = com_generator.vp_codeGenerator(this, config, this.state, (userOption != ''? ', ' + userOption : ''));

            let convertedData = data;
            if (preview) {
                // set figure size for preview chart
                code.appendLine('plt.figure(figsize=(6, 4))');
                if (useSampling) {
                    // data sampling code for preview
                    convertedData = data + '.sample(n=30, random_state=0)';
                }   
            }

            // replace pre-defined options
            chartCode = chartCode.replace(data, convertedData);

            code.appendLine(chartCode);
            code.append('plt.show()');

            return code.toString();
        }
        
    }

    return Seaborn;
});