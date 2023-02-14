/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : AlertModal.js
 *    Author          : Black Logic
 *    Note            : AlertModal
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] AlertModal
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/component/alertModal.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/component/alertModal'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_Const',
    'vp_base/js/com/component/Component'
], function(msgHtml, msgCss, com_Const, Component) {

    /**
     * AlertModal
     */
    class AlertModal extends Component {
        constructor(title, detail='') {
            super($('body'), { title: title, detail: detail });
        }

        _bindEvent() {
            let that = this;
            // click ok button
            $(this.wrapSelector('.vp-alertModal-yes')).click( function() {
                that.remove();
            });   
        }

        template() {
            return msgHtml.replaceAll('${vp_base}', com_Const.BASE_PATH);
        }

        render() {
            super.render();

            // set title
            $(this.wrapSelector('.vp-alertModal-titleStr')).text(this.state.title);
            // set detail as tooltip
            if (this.state.detail) {
                $(this.wrapSelector('.vp-alertModal-titleStr')).attr({ title: this.state.detail });
            }
        }

        remove() {
            $(this.wrapSelector()).remove();
        }

    }

    return AlertModal;
});