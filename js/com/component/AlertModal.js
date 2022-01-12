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
    'text!vp_base/html/component/alertModal.html!strip',
    'css!vp_base/css/component/alertModal.css',
    'vp_base/js/com/component/Component'
], function(msgHtml, msgCss, Component) {

    /**
     * AlertModal
     */
    class AlertModal extends Component {
        constructor(title) {
            super($('body'), { title: title });
        }

        _bindEvent() {
            let that = this;
            // click ok button
            $(this.wrapSelector('.vp-alertModal-yes')).click( function() {
                that.remove();
            });   
        }

        template() {
            return msgHtml;
        }

        render() {
            super.render();

            // set title
            $(this.wrapSelector('.vp-alertModal-titleStr')).text(this.state.title);
        }

        remove() {
            $(this.wrapSelector()).remove();
        }

    }

    return AlertModal;
});