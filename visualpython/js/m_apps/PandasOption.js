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
    'vp_base/js/com/component/PopupComponent'
], function(poHTML, com_util, com_Const, com_String, PopupComponent) {

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
            this.config.docs = 'https://pandas.pydata.org/docs/user_guide/options.html';

            this.state = {
                filter_warning: '',
                min_rows: '',
                max_rows: '',
                max_columns: '',
                max_colwidth: '',
                expand_frame_repr: '',
                precision: '',
                chop_threshold: '',
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            
            // setting popup - set default
            $(this.wrapSelector('#resetDisplay')).on('change', function() {
                let checked = $(this).prop('checked');

                if (checked) {
                    // disable input
                    $(that.wrapSelector('.vp-po-option-item')).prop('disabled', true);
                } else {
                    // enable input
                    $(that.wrapSelector('.vp-po-option-item')).prop('disabled', false);
                }
            });

            // show all rows
            $(this.wrapSelector('#showAllRows')).on('change', function() {
                let checked = $(this).prop('checked');
                if (checked) {
                    $(that.wrapSelector('#max_rows')).prop('disabled', true);
                } else {
                    $(that.wrapSelector('#max_rows')).prop('disabled', false);
                }
            });

            // show all columns
            $(this.wrapSelector('#showAllColumns')).on('change', function() {
                let checked = $(this).prop('checked');
                if (checked) {
                    $(that.wrapSelector('#max_columns')).prop('disabled', true);
                } else {
                    $(that.wrapSelector('#max_columns')).prop('disabled', false);
                }
            });

            // setting popup - reset warning
            $(this.wrapSelector('#resetWarning')).on('change', function() {
                let checked = $(this).prop('checked');

                if (checked) {
                    // disable input
                    $(that.wrapSelector('.vp-po-warning-item')).prop('disabled', true);
                } else {
                    // enable input
                    $(that.wrapSelector('.vp-po-warning-item')).prop('disabled', false);
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

            let resetDisplay = $(this.wrapSelector('#resetDisplay')).prop('checked');
            let resetWarning = $(this.wrapSelector('#resetWarning')).prop('checked');

            // warning options
            if (resetWarning === true) {
                code.push("import warnings\nwarnings.resetwarnings()");
            } else{
                if (that.state['filter_warning'] && that.state['filter_warning'] != '') {
                    code.push(com_util.formatString("import warnings\nwarnings.simplefilter(action='{0}', category=Warning)", that.state['filter_warning']));
                }
            }

            // display options
            if (resetDisplay === true) {
                code.push("pd.reset_option('^display')");
            } else {
                let showAllRows = $(this.wrapSelector('#showAllRows')).prop('checked');
                let showAllCols = $(this.wrapSelector('#showAllColumns')).prop('checked');
                Object.keys(this.state).forEach((key) => {
                    if ((showAllRows === true && key === 'max_rows') 
                        || (showAllCols === true && key === 'max_columns')) {
                        code.push(com_util.formatString("pd.set_option('display.{0}', {1})", key, 'None'));
                    } else if (key !== 'filter_warning' && that.state[key] && that.state[key] != '') {
                        code.push(com_util.formatString("pd.set_option('display.{0}', {1})", key, that.state[key]));
                    }
                });
            }

            return code.join('\n');
        }

    }

    return PandasOption;
});