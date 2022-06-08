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
    'text!vp_base/html/m_visualize/plotly.html!strip',
    'css!vp_base/css/m_visualize/plotly.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/FileNavigation',
    'vp_base/js/com/component/DataSelector',
    'vp_base/data/m_visualize/plotlyLibrary',
], function(ptHTML, ptCss, com_String, com_generator, com_util, PopupComponent, SuggestInput, FileNavigation, DataSelector, PLOTLY_LIBRARIES) {

    /**
     * TODO: libraries.json add menu
     * {
            "id"   : "visualize_plotly",
            "type" : "function",
            "level": 1,
            "name" : "Plotly",
            "tag"  : "PLOTLY,VISUALIZATION,VISUALIZE",
            "path" : "visualpython - visualization - plotly",
            "desc" : "Plotly express",
            "file" : "m_visualize/Plotly",
            "apps" : {
                "color": 5,
                "icon": "apps/apps_visualize.svg"
            }
        },
     */
    class Plotly extends PopupComponent {
        _init() {
            super._init();

            this.config.size = { width: 1064, height: 550 };
            this.config.installButton = true;
            this.config.importButton = true;
            this.config.dataview = false;

            this.state = {
                chartType: 'scatter',
                data: '',
                userOption: '',
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
                'Part-of-Whole': [ 'pie', 'sunburst', 'treemap', 'icicle', 'funnel_area' ],
                '1D Distributions': [ 'histogram', 'box', 'violin', 'strip', 'ecdf' ],
                '2D Distributions': [ 'density_heatmap', 'density_contour' ],
                'Matrix or Image Input': [ 'imshow' ],
                '3-Dimensional': [ 'scatter_3d', 'line_3d' ],
                'Multidimensional': [ 'scatter_matrix', 'parallel_coordinates', 'parallel_categories' ],
                'Tile Maps': [ 'scatter_mapbox', 'line_mapbox', 'choropleth_mapbox', 'density_mapbox' ],
                'Outline Maps': [ 'scatter_geo', 'line_geo', 'choropleth' ],
                'Polar Charts': [ 'scatter_polar', 'line_polar', 'bar_polar' ],
                'Ternary Charts': [ 'scatter_ternary', 'line_ternary' ],
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
                    
                }
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
                    console.log('data selected');

                    if (dtype == 'DataFrame') {
                        $(that.wrapSelector('#x')).prop('disabled', false);
                        $(that.wrapSelector('#y')).prop('disabled', false);
                        
                        // bind column source using selected dataframe
                        com_generator.vp_bindColumnSource(that, 'data', ['x', 'y'], 'select', true, true);
                    } else {
                        $(that.wrapSelector('#x')).prop('disabled', true);
                        $(that.wrapSelector('#y')).prop('disabled', true);
                    }
                },
                finish: function(value, dtype) {
                    that.state.dtype = dtype;
                    console.log('data selected');

                    if (dtype == 'DataFrame') {
                        $(that.wrapSelector('#x')).prop('disabled', false);
                        $(that.wrapSelector('#y')).prop('disabled', false);
                        
                        // bind column source using selected dataframe
                        com_generator.vp_bindColumnSource(that, 'data', ['x', 'y'], 'select', true, true);
                    } else {
                        $(that.wrapSelector('#x')).prop('disabled', true);
                        $(that.wrapSelector('#y')).prop('disabled', true);
                    }
                }
            });
            $(page).find('#data').replaceWith(dataSelector.toTagString());

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

            this.loadPreview();
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
                data, x, y, setXY,
                userOption
            } = this.state;
            let code = new com_String();
            let config = this.chartConfig[chartType];

            let etcOptionCode = [];
            // add user option
            if (userOption != '') {
                etcOptionCode.push(userOption);
            }

            let generatedCode = com_generator.vp_codeGenerator(this, config, this.state, etcOptionCode.join(', '));
            code.append(generatedCode);
            return code.toString();
        }
    }

    return Plotly;
});