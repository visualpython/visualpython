/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Plotly.js
 *    Author          : Black Logic
 *    Note            : Visualization > Plotly
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 05. 16
 *    Change Date     :
 */

//============================================================================
// [CLASS] Plotly
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_visualize/plotly.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_visualize/plotly'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/FileNavigation',
    'vp_base/js/com/component/DataSelector',
    'vp_base/data/m_visualize/plotlyLibrary',
], function(ptHTML, ptCss, com_String, com_generator, com_util, PopupComponent, SuggestInput, FileNavigation, DataSelector, PLOTLY_LIBRARIES) {

    class Plotly extends PopupComponent {
        _init() {
            super._init();

            this.config.size = { width: 1064, height: 550 };
            this.config.installButton = true;
            this.config.importButton = true;
            this.config.dataview = false;
            this.config.checkModules = ['px'];

            this.state = {
                chartType: 'scatter',
                data: '',
                x: '', y: '', z: '',
                x_start: '', x_end: '',
                values: '', names: '', parents: '',
                color: '',
                sort: '',
                userOption: '',
                title: '',
                x_label: '',
                y_label: '',
                userCode: '',
                autoRefresh: true,
                ...this.state
            }

            /**
             * Plotly.express functions
             * ---
             * Basics: scatter, line, area, bar, funnel, timeline
             * Part-of-Whole: pie, sunburst, treemap, icicle, funnel_area
             * 1D Distributions: histogram, box, violin, strip, ecdf
             * 2D Distributions: density_heatmap, density_contour
             * Matrix or Image Input: imshow
             * 3-Dimensional: scatter_3d, line_3d
             * Multidimensional: scatter_matrix, parallel_coordinates, parallel_categories
             * Tile Maps: scatter_mapbox, line_mapbox, choropleth_mapbox, density_mapbox
             * Outline Maps: scatter_geo, line_geo, choropleth
             * Polar Charts: scatter_polar, line_polar, bar_polar
             * Ternary Charts: scatter_ternary, line_ternary
             */
            this.chartConfig = PLOTLY_LIBRARIES;
            this.chartTypeList = {
                'Basics': [ 'scatter', 'line', 'area', 'bar', 'funnel', 'timeline' ],
                'Part-of-Whole': [ 'pie', 'sunburst', 'treemap', 'funnel_area' ],       // 'icicle' removed
                '1D Distributions': [ 'histogram', 'box', 'violin', 'strip' ],          // 'ecdf' removed
                '2D Distributions': [ 'density_heatmap', 'density_contour' ],
                'Matrix or Image Input': [ 'imshow' ],
                // '3-Dimensional': [ 'scatter_3d', 'line_3d' ],
                // 'Multidimensional': [ 'scatter_matrix', 'parallel_coordinates', 'parallel_categories' ],
                // 'Tile Maps': [ 'scatter_mapbox', 'line_mapbox', 'choropleth_mapbox', 'density_mapbox' ],
                // 'Outline Maps': [ 'scatter_geo', 'line_geo', 'choropleth' ],
                // 'Polar Charts': [ 'scatter_polar', 'line_polar', 'bar_polar' ],
                // 'Ternary Charts': [ 'scatter_ternary', 'line_ternary' ],
            }

        }

        _bindEvent() {
            super._bindEvent();

            let that = this;

            // change tab
            $(this.wrapSelector('.vp-tab-item')).on('click', function() {
                let type = $(this).data('type'); // data / wordcloud / plot

                $(that.wrapSelector('.vp-tab-bar .vp-tab-item')).removeClass('vp-focus');
                $(this).addClass('vp-focus');

                $(that.wrapSelector('.vp-tab-page-box > .vp-tab-page')).hide();
                $(that.wrapSelector(com_util.formatString('.vp-tab-page[data-type="{0}"]', type))).show();
            });

            // change chart type
            $(this.wrapSelector('#chartType')).on('change', function() {
                let chartType = $(this).val();
                $(that.wrapSelector('.pt-option')).hide();
                if (chartType === 'density_heatmap' || chartType === 'density_contour') {
                    // show x, y, z
                    $(that.wrapSelector('#x')).closest('.pt-option').show();
                    $(that.wrapSelector('#y')).closest('.pt-option').show();
                    $(that.wrapSelector('#z')).closest('.pt-option').show();
                    if (chartType === 'density_contour') {
                        $(that.wrapSelector('#color')).closest('.pt-option').show();
                    }
                }
                else if (chartType === 'timeline') {
                    $(that.wrapSelector('#x_start')).closest('.pt-option').show();
                    $(that.wrapSelector('#x_end')).closest('.pt-option').show();
                    $(that.wrapSelector('#y')).closest('.pt-option').show();
                    $(that.wrapSelector('#color')).closest('.pt-option').show();
                }
                else if (chartType === 'pie' || chartType === 'funnel_area') {
                    // show values, names
                    $(that.wrapSelector('#values')).closest('.pt-option').show();
                    $(that.wrapSelector('#names')).closest('.pt-option').show();
                    $(that.wrapSelector('#color')).closest('.pt-option').show();
                }
                else if (chartType === 'sunburst' || chartType === 'treemap' || chartType === 'icicle') {
                    // show values, names, parents
                    $(that.wrapSelector('#values')).closest('.pt-option').show();
                    $(that.wrapSelector('#names')).closest('.pt-option').show();
                    $(that.wrapSelector('#color')).closest('.pt-option').show();
                    $(that.wrapSelector('#parents')).closest('.pt-option').show();
                }
                else {
                    // show x, y
                    $(that.wrapSelector('#x')).closest('.pt-option').show();
                    $(that.wrapSelector('#y')).closest('.pt-option').show();
                    $(that.wrapSelector('#color')).closest('.pt-option').show();
                }
                $(that.wrapSelector('#sort')).closest('.pt-option').show();
            });

            // use data or not
            $(this.wrapSelector('#setXY')).on('change', function() {
                let setXY = $(this).prop('checked');
                if (setXY == false) {
                    // set Data
                    $(that.wrapSelector('#data')).prop('disabled', false);

                    $(that.wrapSelector('#x')).closest('.vp-ds-box').replaceWith('<select id="x"></select>');
                    $(that.wrapSelector('#x_start')).closest('.vp-ds-box').replaceWith('<select id="x_start"></select>');
                    $(that.wrapSelector('#x_end')).closest('.vp-ds-box').replaceWith('<select id="x_end"></select>');
                    $(that.wrapSelector('#y')).closest('.vp-ds-box').replaceWith('<select id="y"></select>');
                    $(that.wrapSelector('#z')).closest('.vp-ds-box').replaceWith('<select id="z"></select>');
                    $(that.wrapSelector('#values')).closest('.vp-ds-box').replaceWith('<select id="values"></select>');
                    $(that.wrapSelector('#names')).closest('.vp-ds-box').replaceWith('<select id="names"></select>');
                    $(that.wrapSelector('#parents')).closest('.vp-ds-box').replaceWith('<select id="parents"></select>');
                    $(that.wrapSelector('#color')).closest('.vp-ds-box').replaceWith('<select id="color"></select>');
                } else {
                    // set X Y indivisually
                    // disable data selection
                    $(that.wrapSelector('#data')).prop('disabled', true);
                    $(that.wrapSelector('#data')).val('');
                    that.state.data = '';
                    that.state.x = '';
                    that.state.x_start = '';
                    that.state.x_end = '';
                    that.state.y = '';
                    that.state.z = '';
                    that.state.values = '';
                    that.state.names = '';
                    that.state.parents = '';
                    that.state.color = '';

                    let dataSelectorX = new DataSelector({ pageThis: that, id: 'x' });
                    $(that.wrapSelector('#x')).replaceWith(dataSelectorX.toTagString());

                    let dataSelectorXStart = new DataSelector({ pageThis: that, id: 'x_start' });
                    $(that.wrapSelector('#x_start')).replaceWith(dataSelectorXStart.toTagString());

                    let dataSelectorXEnd = new DataSelector({ pageThis: that, id: 'x_end' });
                    $(that.wrapSelector('#x_end')).replaceWith(dataSelectorXEnd.toTagString());

                    let dataSelectorY = new DataSelector({ pageThis: that, id: 'y' });
                    $(that.wrapSelector('#y')).replaceWith(dataSelectorY.toTagString());

                    let dataSelectorZ = new DataSelector({ pageThis: that, id: 'z' });
                    $(that.wrapSelector('#z')).replaceWith(dataSelectorZ.toTagString());
                    
                    let dataSelectorValues = new DataSelector({ pageThis: that, id: 'values' });
                    $(that.wrapSelector('#values')).replaceWith(dataSelectorValues.toTagString());
                    
                    let dataSelectorNames = new DataSelector({ pageThis: that, id: 'names' });
                    $(that.wrapSelector('#names')).replaceWith(dataSelectorNames.toTagString());

                    let dataSelectorParents = new DataSelector({ pageThis: that, id: 'parents' });
                    $(that.wrapSelector('#parents')).replaceWith(dataSelectorParents.toTagString());

                    let dataSelectorColor = new DataSelector({ pageThis: that, id: 'color' });
                    $(that.wrapSelector('#color')).replaceWith(dataSelectorColor.toTagString());
                    
                }
            });

            // load preview
            // preview refresh
            $(this.wrapSelector('#previewRefresh')).on('click', function() {
                that.loadPreview();
            });
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
            let page = $(ptHTML);

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
                    that.state.dtype = dtype;

                    if (dtype == 'DataFrame') {
                        $(that.wrapSelector('#x')).prop('disabled', false);
                        $(that.wrapSelector('#x_start')).prop('disabled', false);
                        $(that.wrapSelector('#x_end')).prop('disabled', false);
                        $(that.wrapSelector('#y')).prop('disabled', false);
                        $(that.wrapSelector('#z')).prop('disabled', false);
                        $(that.wrapSelector('#values')).prop('disabled', false);
                        $(that.wrapSelector('#names')).prop('disabled', false);
                        $(that.wrapSelector('#parents')).prop('disabled', false);
                        $(that.wrapSelector('#color')).prop('disabled', false);
                        
                        // bind column source using selected dataframe
                        com_generator.vp_bindColumnSource(that, 'data', [
                            'x', 'x_start', 'x_end', 'y', 'z', 'values', 'names', 'parents', 'color'
                        ], 'select', true, true);
                    } else {
                        $(that.wrapSelector('#x')).prop('disabled', true);
                        $(that.wrapSelector('#x_start')).prop('disabled', true);
                        $(that.wrapSelector('#x_end')).prop('disabled', true);
                        $(that.wrapSelector('#y')).prop('disabled', true);
                        $(that.wrapSelector('#z')).prop('disabled', true);
                        $(that.wrapSelector('#values')).prop('disabled', true);
                        $(that.wrapSelector('#names')).prop('disabled', true);
                        $(that.wrapSelector('#parents')).prop('disabled', true);
                        $(that.wrapSelector('#color')).prop('disabled', true);
                        
                    }
                },
                finish: function(value, dtype) {
                    that.state.dtype = dtype;

                    if (dtype == 'DataFrame') {
                        $(that.wrapSelector('#x')).prop('disabled', false);
                        $(that.wrapSelector('#x_start')).prop('disabled', false);
                        $(that.wrapSelector('#x_end')).prop('disabled', false);
                        $(that.wrapSelector('#y')).prop('disabled', false);
                        $(that.wrapSelector('#z')).prop('disabled', false);
                        $(that.wrapSelector('#values')).prop('disabled', false);
                        $(that.wrapSelector('#names')).prop('disabled', false);
                        $(that.wrapSelector('#parents')).prop('disabled', false);
                        $(that.wrapSelector('#color')).prop('disabled', false);
                        
                        // bind column source using selected dataframe
                        com_generator.vp_bindColumnSource(that, 'data', [
                            'x', 'x_start', 'x_end', 'y', 'z', 'values', 'names', 'parents', 'color'
                        ], 'select', true, true);
                    } else {
                        $(that.wrapSelector('#x')).prop('disabled', true);
                        $(that.wrapSelector('#x_start')).prop('disabled', true);
                        $(that.wrapSelector('#x_end')).prop('disabled', true);
                        $(that.wrapSelector('#y')).prop('disabled', true);
                        $(that.wrapSelector('#z')).prop('disabled', true);
                        $(that.wrapSelector('#values')).prop('disabled', true);
                        $(that.wrapSelector('#names')).prop('disabled', true);
                        $(that.wrapSelector('#parents')).prop('disabled', true);
                        $(that.wrapSelector('#color')).prop('disabled', true);
                    }
                }
            });
            $(page).find('#data').replaceWith(dataSelector.toTagString());

            $(page).find('.pt-option').hide();
            if (this.state.chartType === 'density_heatmap' 
                || this.state.chartType === 'density_contour') {
                // show x, y, z
                $(page).find('#x').closest('.pt-option').show();
                $(page).find('#y').closest('.pt-option').show();
                $(page).find('#z').closest('.pt-option').show();
                if (this.state.chartType === 'density_contour') {
                    $(page).find('#color').closest('.pt-option').show();
                }
            }
            else if (this.state.chartType === 'timeline') {
                // show x_start, x_end, y
                $(page).find('#x_start').closest('.pt-option').show();
                $(page).find('#x_end').closest('.pt-option').show();
                $(page).find('#y').closest('.pt-option').show();
                $(page).find('#color').closest('.pt-option').show();
            }
            else if (this.state.chartType === 'pie' 
                || this.state.chartType === 'funnel_area') {
                // show values, names
                $(page).find('#values').closest('.pt-option').show();
                $(page).find('#names').closest('.pt-option').show();
                $(page).find('#color').closest('.pt-option').show();
            }
            else if (this.state.chartType === 'sunburst' 
                || this.state.chartType === 'treemap' 
                || this.state.chartType === 'icicle') {
                // show values, names, parents
                $(page).find('#values').closest('.pt-option').show();
                $(page).find('#names').closest('.pt-option').show();
                $(page).find('#color').closest('.pt-option').show();
                $(page).find('#parents').closest('.pt-option').show();
            }
            else {
                // show x, y
                $(page).find('#x').closest('.pt-option').show();
                $(page).find('#y').closest('.pt-option').show();
                $(page).find('#color').closest('.pt-option').show();
            }
            $(page).find('#sort').closest('.pt-option').show();

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

            // load code tab - code mirror
            let userCodeKey = 'userCode';
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
                        
                        $(that.wrapSelector('#vp_ptPreview')).html('');
                        if (htmlResult != undefined) {
                            // 1. HTML tag
                            $(that.wrapSelector('#vp_ptPreview')).append(htmlResult);
                        } else if (imgResult != undefined) {
                            // 2. Image data (base64)
                            var imgTag = '<img src="data:image/png;base64, ' + imgResult + '">';
                            $(that.wrapSelector('#vp_ptPreview')).append(imgTag);
                        } else if (textResult != undefined) {
                            // 3. Text data
                            var preTag = document.createElement('pre');
                            $(preTag).text(textResult);
                            $(that.wrapSelector('#vp_ptPreview')).html(preTag);
                        }
                    } else {
                        var errorContent = '';
                        if (msg.content.ename) {
                            errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                        }
                        $(that.wrapSelector('#vp_ptPreview')).html(errorContent);
                        vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                    }
                }).catch(function(resultObj) {
                    let { msg } = resultObj;
                    var errorContent = '';
                    if (msg.content.ename) {
                        errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                    }
                    $(that.wrapSelector('#vp_ptPreview')).html(errorContent);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                });
            });
        }

        generateInstallCode() {
            return ['!pip install plotly'];
        }

        generateImportCode() {
            var code = new com_String();
            code.appendLine('import plotly.express as px'); // need to be installed
            code.appendLine('import plotly');
            code.append('plotly.offline.init_notebook_mode(connected=True)');
            return [code.toString()];
        }

        generateCode(preview=false) {
            /**
             * Plotly is not showing sometimes...
             * import plotly
             * plotly.offline.init_notebook_mode(connected=True)
             */
            let { 
                chartType,
                data, x, y, color, setXY, sort,
                userOption, userCode,
                title, x_label, y_label
            } = this.state;
            let code = new com_String();
            let config = this.chartConfig[chartType];

            let etcOptionCode = [];
            // add title
            if (title != '') {
                etcOptionCode.push(com_util.formatString("title='{0}'", title));
            }
            let labelOptions = [];
            // add x_label
            if (x_label != '') {
                if (setXY === true) {
                    // replace 'x' to x_label
                    labelOptions.push(com_util.formatString("'x': '{0}'", x_label));
                } else {
                    // if x is selected
                    if (x != '') {
                        // replace x column name to x_label
                        labelOptions.push(com_util.formatString("{0}: '{1}'", x, x_label));
                    } else {
                        // replace 'index' to x_label
                        labelOptions.push(com_util.formatString("'index': '{0}'", x_label));
                    }
                }
            }
            // add y_label
            if (y_label != '') {
                if (setXY === true) {
                    // replace 'y' to y_label
                    labelOptions.push(com_util.formatString("'y': '{0}'", y_label));
                } else {
                    // if y is selected
                    if (y != '') {
                        // replace y column name to y_label
                        labelOptions.push(com_util.formatString("{0}: '{1}'", y, y_label));
                    } else {
                        // replace 'index' to y_label
                        labelOptions.push(com_util.formatString("'index': '{0}'", y_label));
                    }
                }
            }
            if (labelOptions.length > 0) {
                etcOptionCode.push(com_util.formatString("labels={ {0} }", labelOptions.join(', ')));
            }
            // add user option
            if (userOption != '') {
                etcOptionCode.push(userOption);
            }

            if (preview === true) {
                // set preview size
                let width = 450;
                let height = 400;
                // let width = $(this.wrapSelector('#vp_ptPreview')).width();
                // let height = $(this.wrapSelector('#vp_ptPreview')).height();
                // console.log(width, height);
                etcOptionCode.push(com_util.formatString('width={0}, height={1}', width, height));

                // no auto-import for preview
                this.config.checkModules = [];
            } else {
                this.config.checkModules = ['px'];
            }

            let generatedCode = com_generator.vp_codeGenerator(this, config, this.state
                , etcOptionCode.length > 0? ', ' + etcOptionCode.join(', '): '');
            code.appendFormatLine("fig = {0}", generatedCode);

            // sort code
            if (sort && sort != '') {
                code.appendFormatLine("fig.update_xaxes(categoryorder='{0}')", sort);
            }

            if (userCode && userCode != '') {
                code.appendLine(userCode);
            }
            code.append('fig.show()');

            return code.toString();
        }
    }

    return Plotly;
});