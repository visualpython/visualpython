/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : SuccessMessage.js
 *    Author          : Black Logic
 *    Note            : SuccessMessage
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] SuccessMessage
//============================================================================
define([
    'text!vp_base/html/component/successMessage.html!strip',
    'css!vp_base/css/component/successMessage',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/component/Component'
], function(msgHtml, msgCss, com_Const, Component) {

    /**
     * SuccessMessage
     */
    class SuccessMessage extends Component {
        constructor(title, timeout=1500) {
            super($('#header'), { title: title, timeout: timeout });
        }

        template() {
            return msgHtml.replaceAll('${vp_base}', com_Const.BASE_PATH);
        }

        render() {
            super.render();

            // set title
            $(this.wrapSelector('.vp-successMessage-title')).text(this.state.title);

            let that = this;
            // remove after timeout
            setTimeout( function() {
                $(that.wrapSelector()).remove();
            }, this.state.timeout);
        }

    }

    return SuccessMessage;
});