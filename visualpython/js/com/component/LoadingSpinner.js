/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : LoadingSpinner.js
 *    Author          : Black Logic
 *    Note            : LoadingSpinner
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 08. 26
 *    Change Date     :
 */

//============================================================================
// [CLASS] LoadingSpinner
//============================================================================
define([
    __VP_CSS_LOADER__('vp_base/css/component/loadingSpinner'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/component/Component'
], function(msgCss, Component) {

    /**
     * LoadingSpinner
     * Usage:
     * let loadingSpinner = new LoadingSpinner($(this.wrapSelector('.container')));
     * loadingSpinner.remove();
     */
    class LoadingSpinner extends Component {
        constructor(targetTag) {
            super($(targetTag));
        }

        template() {
            return '<div class="vp-loading-spinner"></div>';
        }

        render() {
            super.render();
        }

        remove() {
            $(this.wrapSelector()).remove();
        }

    }

    return LoadingSpinner;
});