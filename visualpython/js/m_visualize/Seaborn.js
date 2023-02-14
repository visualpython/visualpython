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
    __VP_TEXT_LOADER__('vp_base/html/m_visualize/seaborn.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_visualize/seaborn'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/VarSelector2',
    'vp_base/data/m_visualize/seabornLibrary',
    'vp_base/js/com/component/DataSelector'
], function(chartHTml, chartCss, com_String, com_generator, com_util, PopupComponent, SuggestInput, VarSelector2, SEABORN_LIBRARIES, DataSelector) {

    class Seaborn extends PopupComponent {
        _init() {
            super._init();

            this.config.dataview = false;
            this.config.size = { width: 1064, height: 550 };
            this.config.checkModules = ['plt', 'sns'];

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
                bins: '',
                kde: '',
                stat: '',
                showValues: false,
                showValuesPrecision: '',
                sortBy: 'y',
                sortType: '',
                sortHue: '',
                sortHueText: true,
                // axes options
                x_limit_from: '',
                x_limit_to: '',
                y_limit_from: '',
                y_limit_to: '',
                xticks: '',
                xticks_label: '',
                xticks_rotate: '',
                removeXticks: false,
                yticks: '',
                yticks_label: '',
                yticks_rotate: '',
                removeYticks: false,
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
                // code option
                userCode: '',
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

            this.statList = [
                { label: 'Select option...', value: '' },
                { label: 'count', value: "'count'" },
                { label: 'frequency', value: "'frequency'" },
                { label: 'density', value: "'density'" },
                { label: 'probability', value: "'probability'" },
                { label: 'proportion', value: "'proportion'" },
                { label: 'percent', value: "'percent'" }
            ];
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

            // change chart type
            $(this.wrapSelector('#chartType')).on('change', function() {
                // add bins to histplot
                let chartType = $(this).val();
                $(that.wrapSelector('.sb-option')).hide();
                if (chartType == 'histplot') {
                    $(that.wrapSelector('#bins')).closest('.sb-option').show();
                    $(that.wrapSelector('#kde')).closest('.sb-option').show();
                    $(that.wrapSelector('#stat')).closest('.sb-option').show();
                } else if (chartType == 'barplot') {
                    $(that.wrapSelector('#showValues')).closest('.sb-option').show();
                    if (that.state.setXY === false) {
                        if (that.state.x !== '' && that.state.y !== '') {
                            $(that.wrapSelector('#sortBy')).closest('.sb-option').show();
                        }
                        if (that.state.hue !== '') {
                            $(that.wrapSelector('#sortHue')).closest('.sb-option').show();
                        }
                    }
                } else if (chartType == 'countplot') {
                    $(that.wrapSelector('#showValues')).closest('.sb-option').show();
                    if (that.state.setXY === false) {
                        if (that.state.x !== '' || that.state.y !== '') {
                            $(that.wrapSelector('#sortBy')).closest('.sb-option').show();
                        }
                        if (that.state.hue !== '') {
                            $(that.wrapSelector('#sortHue')).closest('.sb-option').show();
                        }
                    }
                }
            });
            
            // use data or not
            $(this.wrapSelector('#setXY')).on('change', function() {
                let setXY = $(this).prop('checked');
                if (setXY == false) {
                    // set Data
                    $(that.wrapSelector('#data')).prop('disabled', false);

                    $(that.wrapSelector('#x')).closest('.vp-ds-box').replaceWith('<select id="x"></select>');
                    $(that.wrapSelector('#y')).closest('.vp-ds-box').replaceWith('<select id="y"></select>');
                    $(that.wrapSelector('#hue')).closest('.vp-ds-box').replaceWith('<select id="hue"></select>');
                } else {
                    // set X Y indivisually
                    // disable data selection
                    $(that.wrapSelector('#data')).prop('disabled', true);
                    $(that.wrapSelector('#data')).val('');
                    that.state.data = '';
                    that.state.x = '';
                    that.state.y = '';
                    that.state.hue = '';

                    let dataSelectorX = new DataSelector({ pageThis: that, id: 'x' });
                    $(that.wrapSelector('#x')).replaceWith(dataSelectorX.toTagString());

                    let dataSelectorY = new DataSelector({ pageThis: that, id: 'y' });
                    $(that.wrapSelector('#y')).replaceWith(dataSelectorY.toTagString());

                    let dataSelectorHue = new DataSelector({ pageThis: that, id: 'hue' });
                    $(that.wrapSelector('#hue')).replaceWith(dataSelectorHue.toTagString());

                    // FIXME: hide sort values for barplot/countplot
                    if (that.state.chartType == 'barplot' || that.state.chartType == 'countplot') {
                        $(that.wrapSelector('#sortBy')).closest('.sb-option').hide();
                        $(that.wrapSelector('#sortHue')).closest('.sb-option').hide();
                    }
                    
                }
            });

            // change x, y
            $(document).off('change', this.wrapSelector('#x'));
            $(document).on('change', this.wrapSelector('#x'), function() {
                let { chartType, y, setXY } = that.state;
                let x = $(this).val();
                if (setXY === false) {
                    if (chartType == 'barplot') {
                        if (x !== '' && y !== '') {
                            $(that.wrapSelector('#sortBy')).closest('.sb-option').show();
                        } else {
                            $(that.wrapSelector('#sortBy')).closest('.sb-option').hide();
                        }
                    } else if (chartType == 'countplot') {
                        if (x !== '' || y !== '') {
                            $(that.wrapSelector('#sortBy')).closest('.sb-option').show();
                        } else {
                            $(that.wrapSelector('#sortBy')).closest('.sb-option').hide();
                        }
                    }
                }
            });

            $(document).off('change', this.wrapSelector('#y'));
            $(document).on('change', this.wrapSelector('#y'), function() {
                let { chartType, x, setXY } = that.state;
                let y = $(this).val();
                if (setXY === false) {
                    if (chartType == 'barplot') {
                        if (x !== '' && y !== '') {
                            $(that.wrapSelector('#sortBy')).closest('.sb-option').show();
                        } else {
                            $(that.wrapSelector('#sortBy')).closest('.sb-option').hide();
                        }
                    } else if (chartType == 'countplot') {
                        if (x !== '' || y !== '') {
                            $(that.wrapSelector('#sortBy')).closest('.sb-option').show();
                        } else {
                            $(that.wrapSelector('#sortBy')).closest('.sb-option').hide();
                        }
                    }
                }
            });

            // change hue
            $(document).off('change', this.wrapSelector('#hue'));
            $(document).on('change', this.wrapSelector('#hue'), function() {
                let { chartType, data } = that.state;
                let hue = $(this).val();
                if (hue !== '') {
                    if (chartType == 'barplot' || chartType == 'countplot') {
                        let colDtype = $(that.wrapSelector('#hue')).find('option:selected').data('type');
                        // get result and load column list
                        vpKernel.getColumnCategory(data, hue).then(function (resultObj) {
                            let { result } = resultObj;
                            try {
                                var category = JSON.parse(result);
                                if (category && category.length > 0 && colDtype == 'object') {
                                    // if it's categorical column and its dtype is object, check 'Text' as default
                                    $(that.wrapSelector('#sortHueText')).prop('checked', true);
                                    that.state.sortHueText = true;
                                } else {
                                    $(that.wrapSelector('#sortHueText')).prop('checked', false);
                                    that.state.sortHueText = false;
                                }
                                $(that.wrapSelector('#sortHue')).replaceWith(that.templateForHueCondition(category, colDtype));
                            } catch {
                                $(that.wrapSelector('#sortHueText')).prop('checked', false);
                                that.state.sortHueText = false;

                                $(that.wrapSelector('#sortHue')).replaceWith(that.templateForHueCondition([], colDtype));
                            }
                        });
                    }
                    $(that.wrapSelector('#sortHue')).closest('.sb-option').show();
                } else {
                    $(that.wrapSelector('#sortHue')).closest('.sb-option').hide();
                }
            });

            // show values or not
            $(this.wrapSelector('#showValues')).on('change', function() {
                let checked = $(this).prop('checked');
                if (checked === true) {
                    $(that.wrapSelector('#showValuesPrecision')).attr('disabled', false);
                } else {
                    $(that.wrapSelector('#showValuesPrecision')).attr('disabled', true);
                }
            });

            // use color or not
            $(this.wrapSelector('#useColor')).on('change', function() {
                that.state.useColor = $(this).prop('checked');
                $(that.wrapSelector('#color')).prop('disabled', $(this).prop('checked') == false);
            });

            // axes - ticks location
            $(this.wrapSelector('#xticks')).on('change', function() {
                let val = $(this).val();
                if (val !== '') {
                    // enable xticks_label
                    $(that.wrapSelector('#xticks_label')).prop('readonly', false);
                } else {
                    // disable xticks_label
                    $(that.wrapSelector('#xticks_label')).prop('readonly', true);
                }
            });
            $(this.wrapSelector('#yticks')).on('change', function() {
                let val = $(this).val();
                if (val !== '') {
                    // enable yticks_label
                    $(that.wrapSelector('#yticks_label')).prop('readonly', false);
                } else {
                    // disable yticks_label
                    $(that.wrapSelector('#yticks_label')).prop('readonly', true);
                }
            });

            // axes - ticks label: inform user to type location option to use label
            $(this.wrapSelector('#xticks_label[readonly]')).on('click', function() {
                $(that.wrapSelector('#xticks')).focus();
            });
            $(this.wrapSelector('#yticks_label[readonly]')).on('click', function() {
                $(that.wrapSelector('#yticks')).focus();
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
            let dataSelector = new DataSelector({
                type: 'data',
                pageThis: this,
                id: 'data',
                select: function(value, dtype) {
                    that.state.data = value;
                    that.state.dtype = dtype;

                    if (dtype == 'DataFrame') {
                        $(that.wrapSelector('#x')).prop('disabled', false);
                        $(that.wrapSelector('#y')).prop('disabled', false);
                        $(that.wrapSelector('#hue')).prop('disabled', false);
                        
                        // bind column source using selected dataframe
                        com_generator.vp_bindColumnSource(that, 'data', ['x', 'y', 'hue'], 'select', true, true);
                    } else {
                        $(that.wrapSelector('#x')).prop('disabled', true);
                        $(that.wrapSelector('#y')).prop('disabled', true);
                        $(that.wrapSelector('#hue')).prop('disabled', true);
                    }
                },
                finish: function(value, dtype) {
                    that.state.dtype = dtype;

                    if (dtype == 'DataFrame') {
                        $(that.wrapSelector('#x')).prop('disabled', false);
                        $(that.wrapSelector('#y')).prop('disabled', false);
                        $(that.wrapSelector('#hue')).prop('disabled', false);
                        
                        // bind column source using selected dataframe
                        com_generator.vp_bindColumnSource(that, 'data', ['x', 'y', 'hue'], 'select', true, true);
                    } else {
                        $(that.wrapSelector('#x')).prop('disabled', true);
                        $(that.wrapSelector('#y')).prop('disabled', true);
                        $(that.wrapSelector('#hue')).prop('disabled', true);
                    }
                }
            });
            $(page).find('#data').replaceWith(dataSelector.toTagString());

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

            // x, yticks label check
            if (this.state.xticks && this.state.xticks !== '') {
                $(page).find('#xticks_label').prop('readonly', false);
            }
            if (this.state.yticks && this.state.yticks !== '') {
                $(page).find('#yticks_label').prop('readonly', false);
            }

            // stat options
            let statTag = new com_String();
            this.statList.forEach(stat => {
                let selectedFlag = '';
                if (stat.value == that.state.stat) {
                    selectedFlag = 'selected';
                }
                statTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                    stat.value, selectedFlag, stat.label);
            });
            $(page).find('#stat').html(statTag.toString());

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

            // data options depend on chart type
            $(page).find('.sb-option').hide();
            if (this.state.chartType == 'histplot') {
                $(page).find('#bins').closest('.sb-option').show();
                $(page).find('#kde').closest('.sb-option').show();
                $(page).find('#stat').closest('.sb-option').show();
            } else if (this.state.chartType == 'barplot') {
                $(page).find('#showValues').closest('.sb-option').show();
                if (this.state.setXY === false) {
                    if (this.state.x !== '' && this.state.y !== '') {
                        $(page).find('#sortBy').closest('.sb-option').show();
                    }
                    if (this.state.hue !== '') {
                        $(page).find('#sortHue').closest('.sb-option').show();
                    }
                }
            } else if (this.state.chartType == 'countplot') {
                $(page).find('#showValues').closest('.sb-option').show();
                if (this.state.setXY === false) {
                    if (this.state.x !== '' || this.state.y !== '') {
                        $(page).find('#sortBy').closest('.sb-option').show();
                    }
                    if (this.state.hue !== '') {
                        $(page).find('#sortHue').closest('.sb-option').show();
                    }
                }
            }

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

            // Load chart options
            if (this.state.setXY) {
                // disable data selection
                $(this.wrapSelector('#data')).prop('disabled', true);

                let dataSelectorX = new DataSelector({ pageThis: this, id: 'x' });
                $(this.wrapSelector('#x')).replaceWith(dataSelectorX.toTagString());

                let dataSelectorY = new DataSelector({ pageThis: this, id: 'y' });
                $(this.wrapSelector('#y')).replaceWith(dataSelectorY.toTagString());

                let dataSelectorHue = new DataSelector({ pageThis: this, id: 'hue' });
                $(this.wrapSelector('#hue')).replaceWith(dataSelectorHue.toTagString());
            } else {
                if (this.state.dtype == 'DataFrame') {
                    $(this.wrapSelector('#x')).prop('disabled', false);
                    $(this.wrapSelector('#y')).prop('disabled', false);
                    $(this.wrapSelector('#hue')).prop('disabled', false);
                    
                    // bind column source using selected dataframe
                    com_generator.vp_bindColumnSource(this, 'data', ['x', 'y', 'hue'], 'select', true, true);
                } else {
                    $(this.wrapSelector('#x')).prop('disabled', true);
                    $(this.wrapSelector('#y')).prop('disabled', true);
                    $(this.wrapSelector('#hue')).prop('disabled', true);
                }
            }

            // load code tab - code mirror
            let that = this;
            let userCodeKey = 'userCode1';
            let userCodeTarget = this.wrapSelector('#' + userCodeKey);
            this.codeArea = this.initCodemirror({
                key: userCodeKey,
                selector: userCodeTarget,
                events: [{
                    key: 'blur',
                    callback: function(instance, evt) {
                        // save its state
                        instance.save();
                        that.state[userCodeKey] = $(userCodeTarget).val();
                        // refresh preview
                        that.loadPreview();
                    }
                }]
            });
            
            this.loadPreview();
        }

        templateForHueCondition(category, dtype='object') {
            var vpCondSuggest = new SuggestInput();
            vpCondSuggest.setComponentID('sortHue');
            vpCondSuggest.addClass('vp-input vp-state');
            vpCondSuggest.setPlaceholder('Type hue condition');
            if (category && category.length > 0) {
                vpCondSuggest.setPlaceholder((dtype=='object'?'Categorical':dtype) + " dtype");
                vpCondSuggest.setSuggestList(function () { return category; });
                vpCondSuggest.setSelectEvent(function (value) {
                    $(this.wrapSelector()).val(value);
                    $(this.wrapSelector()).trigger('change');
                });
                vpCondSuggest.setNormalFilter(false);
            } else {
                vpCondSuggest.setPlaceholder(dtype==''?'Value':(dtype + " dtype"));
            }
            return vpCondSuggest.toTagString();
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

            // load preview
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
                            errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue, msg.content.detail);
                        }
                        $(that.wrapSelector('#chartPreview')).html(errorContent);
                        vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                    }
                }).catch(function(resultObj) {
                    let { msg } = resultObj;
                    var errorContent = '';
                    if (msg.content.ename) {
                        errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue, msg.content.detail);
                    }
                    $(that.wrapSelector('#chartPreview')).html(errorContent);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                });
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
                if (styleName && styleName.length > 0) {
                    code.appendFormatLine("plt.style.use('{0}')", styleName);
                }
                code.appendFormatLine("plt.rc('figure', figsize=({0}, {1}))", figWidth, figHeight);
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
                chartType, data, x, y, setXY, hue, kde, stat, 
                showValues, showValuesPrecision, 
                sortType, sortBy, sortHue, sortHueText,
                userOption='', 
                x_limit_from, x_limit_to, y_limit_from, y_limit_to,
                xticks, xticks_label, xticks_rotate, removeXticks,
                yticks, yticks_label, yticks_rotate, removeYticks,
                title, x_label, y_label, legendPos,
                useColor, color, useGrid, gridColor, markerStyle,
                userCode1,
                useSampling, sampleCount 
            } = this.state;

            let indent = '';
            let code = new com_String();
            let config = this.chartConfig[chartType];
            let state = JSON.parse(JSON.stringify(this.state));

            // set checkmodules
            if (preview === true) {
                // no auto-import for preview
                this.config.checkModules = [];
            } else {
                if (showValues && showValues === true) {
                    this.config.checkModules = ['plt', 'sns', 'np', 'vp_seaborn_show_values'];
                } else {
                    this.config.checkModules = ['plt', 'sns'];
                }
            }

            if (preview === true && useSampling) {
                // data sampling code for preview
                // convertedData = data + '.sample(n=' + sampleCount + ', random_state=0)';
                // convertedData = com_util.formatString('_vp_sample({0}, {1})', data, sampleCount);
                // replace pre-defined options
                // generatedCode = generatedCode.replaceAll(data, convertedData);
                if (setXY) {
                    if (x && x != '') {
                        state.x = com_util.formatString('_vp_sample({0}, {1})', x, sampleCount);
                    }
                    if (y && y != '') {
                        state.y = com_util.formatString('_vp_sample({0}, {1})', y, sampleCount);
                    }
                    if (hue && hue != '') {
                        state.hue = com_util.formatString('_vp_sample({0}, {1})', hue, sampleCount);
                    }
                } else {
                    if (data && data != '') {
                        state.data = com_util.formatString('_vp_sample({0}, {1})', data, sampleCount);
                    }
                }
            }  

            let chartCode = new com_String();

            let etcOptionCode = []
            if (useColor == true && color != '') {
                etcOptionCode.push(com_util.formatString("color='{0}'", color));
            }
            if (markerStyle != '') {
                // TODO: marker to seaborn argument (ex. marker='+' / markers={'Lunch':'s', 'Dinner':'X'})
                etcOptionCode.push(com_util.formatString("marker='{0}'", markerStyle));
            }
            if (showValues === true && chartType === 'barplot') {
                etcOptionCode.push('ci=None');
            }
            if (setXY === false && sortType !== '') {
                let sortCode = '';
                let sortTypeStr = (sortType === 'descending'? 'ascending=False': 'ascending=True');
                let sortX = state.x;
                let sortY = state.y;
                if (sortBy === 'x') {
                    sortX = state.y;
                    sortY = state.x;
                }
                if (chartType === 'barplot' && sortX !== '' && sortY !== '') {
                    if (hue !== '' && sortHue !== '') {
                        sortCode = com_util.formatString("{0}[{1}[{2}]=={3}].groupby({4})[{5}].mean().sort_values({6}).index"
                                            , state.data, state.data, state.hue, com_util.convertToStr(sortHue, sortHueText), sortX, sortY, sortTypeStr);
                    } else {
                        sortCode = com_util.formatString("{0}.groupby({1})[{2}].mean().sort_values({3}).index", state.data, sortX, sortY, sortTypeStr);
                    }
                } else if (chartType === 'countplot' && (sortX !== '' || sortY !== '')) {
                    let countVar = sortX === ''? sortY: sortX;
                    if (hue !== '' && sortHue !== '') {
                        sortCode = com_util.formatString("{0}[{1}[{2}]=={3}][{4}].value_counts({5}).index"
                                            , state.data, state.data, state.hue, com_util.convertToStr(sortHue, sortHueText), countVar, sortTypeStr);
                    } else {
                        sortCode = com_util.formatString("{0}[{1}].value_counts({2}).index", state.data, countVar, sortTypeStr);
                    }
                }

                if (sortCode != '') {
                    etcOptionCode.push('order=' + sortCode);
                }
            }

            // add user option
            if (userOption != '') {
                etcOptionCode.push(userOption);
            } 

            let generatedCode = com_generator.vp_codeGenerator(this, config, state
                , etcOptionCode.length > 0? ', ' + etcOptionCode.join(', '): '');

            // Axes
            if (x_limit_from != '' && x_limit_to != '') {
                chartCode.appendFormatLine("plt.xlim(({0}, {1}))", x_limit_from, x_limit_to);
            }
            if (y_limit_from != '' && y_limit_to != '') {
                chartCode.appendFormatLine("plt.ylim(({0}, {1}))", y_limit_from, y_limit_to);
            }
            if (legendPos != '') {
                chartCode.appendFormatLine("plt.legend(loc='{0}')", legendPos);
            }
            if (removeXticks === true) {
                // use empty list to disable xticks
                chartCode.appendLine("plt.xticks([])");
            } else {
                let xticksOptList = [];
                if (xticks && xticks !== '') {
                    xticksOptList.push('ticks=' + xticks);
                    // Not able to use xticks_label without xticks
                    if (xticks_label && xticks_label != '') {
                        xticksOptList.push('labels=' + xticks_label);
                    }
                }
                if (xticks_rotate && xticks_rotate !== '') {
                    xticksOptList.push('rotation=' + xticks_rotate)
                }
                // Add option to chart code if available
                if (xticksOptList.length > 0) {
                    chartCode.appendFormatLine("plt.xticks({0})", xticksOptList.join(', '));
                }
            }
            if (removeYticks === true) {
                // use empty list to disable yticks
                chartCode.appendLine("plt.yticks([])");
            } else {
                let yticksOptList = [];
                if (yticks && yticks !== '') {
                    yticksOptList.push('ticks=' + yticks);
                    // Not able to use xticks_label without xticks
                    if (yticks_label && yticks_label != '') {
                        yticksOptList.push('labels=' + yticks_label);
                    }
                }
                if (yticks_rotate && yticks_rotate !== '') {
                    yticksOptList.push('rotation=' + yticks_rotate)
                }
                // Add option to chart code if available
                if (yticksOptList.length > 0) {
                    chartCode.appendFormatLine("plt.yticks({0})", yticksOptList.join(', '));
                }
            }
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

            if (preview === true) {
                // Ignore warning
                code.appendLine('import warnings');
                code.appendLine('with warnings.catch_warnings():');
                code.appendLine("    warnings.simplefilter('ignore')");

                // set figure size for preview chart
                let defaultWidth = 8;
                let defaultHeight = 6;
                code.appendFormatLine('plt.figure(figsize=({0}, {1}))', defaultWidth, defaultHeight);

                if (showValues && showValues === true) {
                    code.appendLine('ax = ' + generatedCode);
                    code.append("_vp_seaborn_show_values(ax");
                    if (showValuesPrecision !== '') {
                        code.appendFormat(", precision={0}", showValuesPrecision);
                    }
                    code.appendLine(")");
                } else {
                    code.appendLine(generatedCode);  
                }
                code.appendLine(chartCode.toString());
            } else {
                if (showValues && showValues === true) {
                    code.appendLine('ax = ' + generatedCode);
                    code.appendLine("vp_seaborn_show_values(ax)");
                } else {
                    code.appendLine(generatedCode);  
                }
                if (chartCode.length > 0) {
                    code.append(chartCode.toString());
                }
            }

            if (userCode1 && userCode1 != '') {
                code.appendLine(userCode1);
            }

            code.append('plt.show()');

            // remove last Enter(\n) from code and then run it
            return code.toString().replace(/\n+$/, "");
        }
        
    }

    return Seaborn;
});