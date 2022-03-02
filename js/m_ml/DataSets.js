/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : DataSets.js
 *    Author          : Black Logic
 *    Note            : Data Sets
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 02. 07
 *    Change Date     :
 */

//============================================================================
// [CLASS] DataSets
//============================================================================
define([
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
], function(com_util, com_Const, com_String, PopupComponent) {

    /**
     * DataSets
     */
    class DataSets extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 2;
            this.config.dataview = false;

            this.state = {
                
                ...this.state
            }
        }



    }

    return DataSets;
});