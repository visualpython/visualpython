/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : ChartSetting.js
 *    Author          : Black Logic
 *    Note            : Visualization > Setting
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 03. 21
 *    Change Date     :
 */

//============================================================================
// [CLASS] Chart Setting
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_visualize/chartSetting.html'), // INTEGRATION: unified version of text loader
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput'
], function(csHTML, com_String, com_util, PopupComponent, SuggestInput) {

    class ChartSetting extends PopupComponent {
        _init() {
            super._init();

            this.config.size = { width: 500, height: 400 };
            this.config.importButton = true;
            this.config.dataview = false;

            this.state = {
                figureWidth: '12',
                figureHeight: '8',
                styleSheet: '',
                fontName: '',
                fontSize: '10',
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();

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

        templateForBody() {
            let page = $(csHTML);

            return page;
        }

        render() {
            super.render();

            let that = this;

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
                suggestInput.addClass('vp-input vp-state');
                suggestInput.setSuggestList(function() { return varList; });
                suggestInput.setPlaceholder('style name');
                suggestInput.setValue(that.state.styleSheet);
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
                suggestInput.addClass('vp-input vp-state');
                suggestInput.setSuggestList(function() { return varList; });
                suggestInput.setPlaceholder('font name');
                suggestInput.setValue(that.state.fontName);
                // suggestInput.setNormalFilter(false);
                $(fontFamilyTag).replaceWith(function() {
                    return suggestInput.toTagString();
                });
            });
        }

        generateImportCode() {
            var code = new com_String();
            code.appendLine('import matplotlib.pyplot as plt');
            code.appendLine('%matplotlib inline');
            code.appendLine('import seaborn as sns');
            return [code.toString()];
        }

        generateCode() {
            var code = new com_String();
    
            // get parameters
            let setDefault = $(this.wrapSelector('#setDefault')).prop('checked');
            if (setDefault == true) {
                code.appendLine('from matplotlib import rcParams, rcParamsDefault');
                code.append('rcParams.update(rcParamsDefault)');
            } else {
                // get parameters
                let { figureWidth, figureHeight, styleSheet, fontName, fontSize } = this.state;
        
                code.appendLine('import matplotlib.pyplot as plt');
                code.appendLine('%matplotlib inline');
                code.appendLine('import seaborn as sns');
                if (styleSheet && styleSheet.length > 0) {
                    code.appendFormatLine("plt.style.use('{0}')", styleSheet);
                }
                code.appendFormatLine("plt.rc('figure', figsize=({0}, {1}))", figureWidth, figureHeight);
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
    
            return code.toString();
        }
    }

    return ChartSetting;
});