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
    'text!vp_base/html/component/infoModal.html!strip',
    'css!vp_base/css/component/infoModal.css',
    'vp_base/js/com/component/Component'
], function(msgHtml, msgCss, Component) {

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
            return msgHtml;
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