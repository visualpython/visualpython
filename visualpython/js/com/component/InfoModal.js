/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : InfoModal.js
 *    Author          : Black Logic
 *    Note            : InfoModal
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] InfoModal
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/component/infoModal.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/component/infoModal'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_Const',
    'vp_base/js/com/component/Component'
], function(msgHtml, msgCss, com_Const, Component) {

    /**
     * InfoModal
     */
    class InfoModal extends Component {
        constructor(title) {
            super($('body'), { title: title });
        }

        _bindEvent() {
            let that = this;
            // click ok button
            $(this.wrapSelector('.vp-infoModal-yes')).click( function() {
                that.remove();
            });   
        }

        template() {
            return msgHtml.replaceAll('${vp_base}', com_Const.BASE_PATH);
        }

        render() {
            super.render();

            // set title
            $(this.wrapSelector('.vp-infoModal-titleStr')).text(this.state.title);
        }

        remove() {
            $(this.wrapSelector()).remove();
        }

    }

    return InfoModal;
});