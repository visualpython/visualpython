/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : PandasOption.js
 *    Author          : Black Logic
 *    Note            : Pandas option
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 03. 28
 *    Change Date     :
 */

//============================================================================
// [CLASS] PandasOption
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_apps/pandasOption.html'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector'
], function(poHTML, com_util, com_Const, com_String, PopupComponent, DataSelector) {

    /**
     * PandasOption
     */
    class PandasOption extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.dataview = false;
            this.config.checkModules = ['pd'];

            this.state = {
                min_rows: '',
                max_rows: '',
                max_cols: '',
                max_colwidth: '',
                float_format: '',
                precision: '',
                chop_threshold: '',
                expand_frame_repr: '',
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            
            // setting popup - set default
            $(this.wrapSelector('#setDefault')).on('change', function() {
                let checked = $(this).prop('checked');

                if (checked) {
                    // disable input
                    $(that.wrapSelector('.vp-pandas-option-body input')).prop('disabled', true);
                } else {
                    // enable input
                    $(that.wrapSelector('.vp-pandas-option-body input')).prop('disabled', false);
                }
            });
        }

        templateForBody() {
            let page = $(poHTML);

            return page;
        }

        render() {
            super.render();


        }

        generateCode() {
            let that = this;
            let code = [];

            let setDefault = $(this.wrapSelector('#setDefault')).prop('checked');
            if (setDefault == true) {
                Object.keys(this.state).forEach((key) => {
                    code.push(com_util.formatString("pd.reset_option('display.{0}')", key));
                })
            } else {
                Object.keys(this.state).forEach((key) => {
                    if (that.state[key] && that.state[key] != '') {
                        code.push(com_util.formatString("pd.set_option('display.{0}', {1})", key, that.state[key]));
                    }
                })
            }
            return code.join('\n');
        }

    }

    return PandasOption;
});