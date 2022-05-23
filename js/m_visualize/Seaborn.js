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
    'vp_base/data/m_visualize/seabornLibrary'
], function(chartHTml, chartCss, com_String, com_generator, com_util, PopupComponent, SuggestInput, VarSelector2, SEABORN_LIBRARIES) {

    class Seaborn extends PopupComponent {
        _init() {
            super._init();

            this.config.dataview = false;
            this.config.size = { width: 1064, height: 550 };

            this.state = {
                chartType: 'scatterplot',
                figWidth: '',
                figHeight: '',
                figRow: 0,
                figColumn: 0,
                shareX: false,
                shareY: false,
                setXY: false,
                data: '',
                x: '',
                y: '',
                hue: '',
                // info options
                title: '',
                x_label: '',
                y_label: '',
                legendPos: '',
                // style options
                useColor: false,
                color: '#000000',
                useGrid: '',
                gridColor: '#000000',
                markerStyle: '',
                // setting options
                x_limit_from: '',
                x_limit_to: '',
                y_limit_from: '',
                y_limit_to: '',
                // preview options
                useSampling: true,
                sampleCount: 30,
                autoRefresh: true,
                ...this.state
            }
            
            this.chartConfig = SEABORN_LIBRARIES;
            this.chartTypeList = {
                'Relational': [ 'scatterplot', 'lineplot' ],
                'Distributions': [ 'histplot', 'kdeplot', 'rugplot' ], 
                'Categorical': [ 'stripplot', 'swarmplot', 'boxplot', 'violinplot', 'pointplot', 'barplot' ],
                'ETC': [ 'countplot' ]
            }

            this.legendPosList = [
                {label: 'Select option...', value: ''},
                {label: 'best', value: 'best'},
                {label: 'upper right', value: 'upper right'},
                {label: 'upper left', value: 'upper left'},
                {label: 'lower left', value: 'lower left'},
                {label: 'lower right', value: 'lower right'},
                {label: 'center left', value: 'center left'},
                {label: 'center right', value: 'center right'},
                {label: 'lower center', value: 'lower center'},
                {label: 'upper center', value: 'upper center'},
                {label: 'center', value: 'center'},
            ];

            this.markerList = [
                // 'custom': { label: 'Custom', value: 'marker' },
                { label: 'Select option...', value: '', title: 'select marker style'},
                { label: '.', value: '.', title: 'point' }, 
                { label: ',', value: ',', title: 'pixel' }, 
                { label: 'o', value: 'o', title: 'circle' }, 
                { label: '▼', value: 'v', title: 'triangle_down' }, 
                { label: '▲', value: '^', title: 'triangle_up' }, 
                { label: '◀', value: '<', title: 'triangle_left' }, 
                { label: '▶', value: '>', title: 'triangle_right' }, 
                { label: '┬', value: '1', title: 'tri_down' }, 
                { label: '┵', value: '2', title: 'tri_up' }, 
                { label: '┤', value: '3', title: 'tri_left' }, 
                { label: '├', value: '4', title: 'tri_right' }, 
                { label: 'octagon', value: '8', title: 'octagon' }, 
                { label: 'square', value: 's', title: 'square' }, 
                { label: 'pentagon', value: 'p', title: 'pentagon' }, 
                { label: 'filled plus', value: 'P', title: 'plus (filled)' }, 
                { label: 'star', value: '*', title: 'star' }, 
                { label: 'hexagon1', value: 'h', title: 'hexagon1' }, 
                { label: 'hexagon2', value: 'H', title: 'hexagon2' }, 
                { label: 'plus', value: '+', title: 'plus' }, 
                { label: 'x', value: 'x', title: 'x' }, 
                { label: 'filled x', value: 'X', title: 'x (filled)' }, 
                { label: 'diamond', value: 'D', title: 'diamond' }, 
                { label: 'thin diamond', value: 'd', title: 'thin_diamond' }
            ]
        }

        _bindEvent() {
            let that = this;

            super._bindEvent();

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
                let type = $(this).data('type'); // data / info / element / figure

                $(that.wrapSelector(com_util.formatString('.vp-tab-bar.{0} .vp-tab-item', level))).removeClass('vp-focus');
                $(this).addClass('vp-focus');

                $(that.wrapSelector(com_util.formatString('.vp-tab-page-box.{0} > .vp-tab-page', level))).hide();
                $(that.wrapSelector(com_util.formatString('.vp-tab-page[data-type="{0}"]', type))).show();
            });
            
            // use data or not
            $(this.wrapSelector('#setXY')).on('change', function() {
                let setXY = $(this).prop('checked');
                if (setXY == false) {
                    // set Data
                    $(that.wrapSelector('#data')).prop('disabled', false);

                    $(that.wrapSelector('#x')).closest('.vp-vs-box').replaceWith('<select id="x"></select>');
                    $(that.wrapSelector('#y')).closest('.vp-vs-box').replaceWith('<select id="y"></select>');
                    $(that.wrapSelector('#hue')).closest('.vp-vs-box').replaceWith('<select id="hue"></select>');
                } else {
                    // set X Y indivisually
                    // disable data selection
                    $(that.wrapSelector('#data')).prop('disabled', true);
                    $(that.wrapSelector('#data')).val('');
                    that.state.data = '';
                    that.state.x = '';
                    that.state.y = '';
                    that.state.hue = '';

                    let varSelectorX = new VarSelector2(that.wrapSelector(), ['DataFrame', 'Series', 'list']);
                    varSelectorX.setComponentID('x');
                    varSelectorX.addClass('vp-state vp-input');
                    varSelectorX.setValue(that.state.x);
                    $(that.wrapSelector('#x')).replaceWith(varSelectorX.toTagString());

                    let varSelectorY = new VarSelector2(that.wrapSelector(), ['DataFrame', 'Series', 'list']);
                    varSelectorY.setComponentID('y');
                    varSelectorY.addClass('vp-state vp-input');
                    varSelectorY.setValue(that.state.y);
                    $(that.wrapSelector('#y')).replaceWith(varSelectorY.toTagString());

                    let varSelectorHue = new VarSelector2(that.wrapSelector(), ['DataFrame', 'Series', 'list']);
                    varSelectorHue.setComponentID('hue');
                    varSelectorHue.addClass('vp-state vp-input');
                    varSelectorHue.setValue(that.state.hue);
                    $(that.wrapSelector('#hue')).replaceWith(varSelectorHue.toTagString());
                }
            });

            // use color or not
            $(this.wrapSelector('#useColor')).on('change', function() {
                that.state.useColor = $(this).prop('checked');
                $(that.wrapSelector('#color')).prop('disabled', $(this).prop('checked') == false);
            });

            // preview refresh
            $(this.wrapSelector('#previewRefresh')).on('click', function() {
                that.loadPreview();
            });
            // auto refresh
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
            let varSelector = new VarSelector2(this.wrapSelector());
            varSelector.setComponentID('data');
            varSelector.addClass('vp-state vp-input');
            varSelector.setValue(this.state.data);
            varSelector.setSelectEvent(function (value, item) {
                $(this.wrapSelector()).val(value);
                that.state.dtype = item.dtype;

                if (item.dtype == 'DataFrame') {
                    $(that.wrapSelector('#x')).prop('disabled', false);
                    $(that.wrapSelector('#y')).prop('disabled', false);
                    $(that.wrapSelector('#hue')).prop('disabled', false);
                    
                    // bind column source using selected dataframe
                    com_generator.vp_bindColumnSource(that.wrapSelector(), $(that.wrapSelector('#data')), ['x', 'y', 'hue'], 'select', true, true);
                } else {
                    $(that.wrapSelector('#x')).prop('disabled', true);
                    $(that.wrapSelector('#y')).prop('disabled', true);
                    $(that.wrapSelector('#hue')).prop('disabled', true);
                }
            });
            $(page).find('#data').replaceWith(varSelector.toTagString());

            // legend position
            let legendPosTag = new com_String();
            this.legendPosList.forEach(pos => {
                let selectedFlag = '';
                if (pos.value == that.state.legendPos) {
                    selectedFlag = 'selected';
                }
                legendPosTag.appendFormatLine('<option value="{0}" {1}>{2}{3}</option>',
                    pos.value, selectedFlag, pos.label, pos.value == 'best'?' (default)':'');
            });
            $(page).find('#legendPos').html(legendPosTag.toString());

            // marker style
            let markerTag = new com_String();
            this.markerList.forEach(marker => {
                let selectedFlag = '';
                if (marker.value == that.state.markerStyle) {
                    selectedFlag = 'selected';
                }
                markerTag.appendFormatLine('<option value="{0}" title="{1}" {2}>{3}</option>',
                    marker.value, marker.title, selectedFlag, marker.label);
            });
            $(page).find('#markerStyle').html(markerTag.toString());

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
                        if (inputType == 'checkbox') {
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

        templateForSettingBox() {
            return `<div class="vp-grid-border-box vp-grid-col-95 vp-chart-setting-body">
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
                <div class="vp-chart-setting-footer">
                    <label>
                        <input type="checkbox" id="setDefault">
                        <span title="Set chart setting to default.">Set Default</span>
                    </label>
                </div>
            `;
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

            // set code view size
            $(this.wrapSelector('.vp-popup-codeview-box')).css({
                'height': '200px'
            });

            this.bindSettingBox();
        }

        bindSettingBox() {
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
                suggestInput.setValue('seaborn-darkgrid'); // set default (seaborn-darkgrid)
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

            let that = this;
            // setting popup - set default
            $(this.wrapSelector('#setDefault')).on('change', function() {
                let checked = $(this).prop('checked');

                if (checked) {
                    // disable input
                    $(that.wrapSelector('.vp-chart-setting-body input')).prop('disabled', true);
                } else {
                    // enable input
                    $(that.wrapSelector('.vp-chart-setting-body input')).prop('disabled', false);
                }
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
                if (msg.content.data) {
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
                } else {
                    var errorContent = '';
                    if (msg.content.ename) {
                        errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                    }
                    $(that.wrapSelector('#chartPreview')).html(errorContent);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                }
            }).catch(function(resultObj) {
                let { msg } = resultObj;
                var errorContent = '';
                if (msg.content.ename) {
                    errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                }
                $(that.wrapSelector('#chartPreview')).html(errorContent);
                vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
            });
        }

        generateImportCode () {
            var code = new com_String();
    
            // get parameters
            let setDefault = $(this.wrapSelector('#setDefault')).prop('checked');
            if (setDefault == true) {
                code.appendLine('from matplotlib import rcParams, rcParamsDefault');
                code.append('rcParams.update(rcParamsDefault)');
            } else {
                var figWidth = $(this.wrapSelector('#figureWidth')).val();
                var figHeight = $(this.wrapSelector('#figureHeight')).val();
                var styleName = $(this.wrapSelector('#styleSheet')).val();
                var fontName = $(this.wrapSelector('#fontName')).val();
                var fontSize = $(this.wrapSelector('#fontSize')).val();
        
                code.appendLine('import matplotlib.pyplot as plt');
                code.appendLine('%matplotlib inline');
                code.appendLine('import seaborn as sns');
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
            }
    
            return [code.toString()];
        }

        generateCode(preview=false) {
            let { 
                chartType, data, userOption='',
                title, x_label, y_label, legendPos,
                useColor, color, useGrid, gridColor, markerStyle,
                x_limit_from, x_limit_to, y_limit_from, y_limit_to,
                useSampling, sampleCount 
            } = this.state;

            let indent = '';
            let code = new com_String();
            let config = this.chartConfig[chartType];
            let state = JSON.parse(JSON.stringify(this.state));

            let chartCode = new com_String();

            let etcOptionCode = []
            if (useColor == true && color != '') {
                etcOptionCode.push(com_util.formatString("color='{0}'", color));
            }
            if (markerStyle != '') {
                // TODO: marker to seaborn argument (ex. marker='+' / markers={'Lunch':'s', 'Dinner':'X'})
                etcOptionCode.push(com_util.formatString("marker='{0}'", markerStyle));
            }

            // add user option
            if (userOption != '') {
                etcOptionCode.push(userOption);
            }

            if (etcOptionCode.length > 0) {
                etcOptionCode = [
                    '',
                    ...etcOptionCode
                ]
            }

            let generatedCode = com_generator.vp_codeGenerator(this, config, state, etcOptionCode.join(', '));

            // Info
            if (title && title != '') {
                chartCode.appendFormatLine("plt.title('{0}')", title);
            }
            if (x_label && x_label != '') {
                chartCode.appendFormatLine("plt.xlabel('{0}')", x_label);
            }
            if (y_label && y_label != '') {
                chartCode.appendFormatLine("plt.ylabel('{0}')", y_label);
            }
            if (x_limit_from != '' && x_limit_to != '') {
                chartCode.appendFormatLine("plt.xlim(({0}, {1}))", x_limit_from, x_limit_to);
            }
            if (y_limit_from != '' && y_limit_to != '') {
                chartCode.appendFormatLine("plt.ylim(({0}, {1}))", y_limit_from, y_limit_to);
            }
            if (legendPos != '') {
                chartCode.appendFormatLine("plt.legend(loc='{0}')", legendPos);
            }
            // Style - Grid
            // plt.grid(True, axis='x', color='red', alpha=0.5, linestyle='--')
            let gridCodeList = [];
            if (useGrid != '') {
                gridCodeList.push(useGrid);
            }
            if (useGrid == 'True' && gridColor != '') {
                gridCodeList.push(com_util.formatString("color='{0}'", gridColor));
            }
            if (gridCodeList.length > 0) {
                chartCode.appendFormatLine("plt.grid({0})", gridCodeList.join(', '));
            }
            chartCode.append('plt.show()');

            let convertedData = data;
            if (preview) {
                // Ignore warning
                code.appendLine('import warnings');
                code.appendLine('with warnings.catch_warnings():');
                code.appendLine("    warnings.simplefilter('ignore')");

                // set figure size for preview chart
                let defaultWidth = 8;
                let defaultHeight = 6;
                code.appendFormatLine('plt.figure(figsize=({0}, {1}))', defaultWidth, defaultHeight);
                if (useSampling) {
                    // data sampling code for preview
                    // convertedData = data + '.sample(n=' + sampleCount + ', random_state=0)';
                    convertedData = com_util.formatString('_vp_sample({0}, {1})', data, sampleCount);
                    // replace pre-defined options
                    generatedCode = generatedCode.replaceAll(data, convertedData);
                }   

                code.appendLine(generatedCode);
                code.appendLine(chartCode.toString());
                
            } else {
                code.appendLine(generatedCode);
                code.appendLine(chartCode.toString());
            }

            // remove last Enter(\n) from code and then run it
            return code.toString().replace(/\n+$/, "");
        }
        
    }

    return Seaborn;
});