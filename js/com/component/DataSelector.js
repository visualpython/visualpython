/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : DataSelector.js
 *    Author          : Black Logic
 *    Note            : Data Selector
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 03. 23
 *    Change Date     :
 */
define([
    'text!vp_base/html/component/dataSelector.html!strip',
    'css!vp_base/css/component/dataSelector.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/Component',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/MultiSelector'
], function(dataHTML, dataCss, com_String, com_util, Component, MultiSelector) {
    //========================================================================
    // [CLASS] DataSelector
    //========================================================================
    class DataSelector extends Component {

        /**
         * 
         * @param {string} frameSelector        query for parent component
         * @param {Object} config  parent:[], selectedList=[], includeList=[]
         */
        constructor(frameSelector, config) {
            super(frameSelector, config, {});
        }

        _init() {
            this.frameSelector = this.$target;

            // configuration
            this.config = this.state;

            var { mode, type, parent, selectedList=[], includeList=[], excludeList=[] } = this.config;
            this.mode = mode;
            this.parent = parent;
            this.selectedList = selectedList;
            this.includeList = includeList;
            this.excludeList = excludeList;


        }

        load() {
            $(this.frameSelector).html(this.render());
            this.bindEvent();
        }

        template() {
            return dataHTML;
        }

        render() {
            
        }

        bindEvent() {
            let that = this;


        }
    }

    return DataSelector;

});