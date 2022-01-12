/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : SampleComponent.js
 *    Author          : Black Logic
 *    Note            : Sample Component
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] SampleComponent
//============================================================================
define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/Component'
], function(com_String, Component) {

    /**
     * SampleComponent
     * Add below code in /data/libraries.json
        {
            "id"   : "apps_sample",
            "type" : "function",
            "level": 1,
            "name" : "Sample",
            "tag"  : "SAMPLE,APPS",
            "path" : "visualpython - apps - sample",
            "desc" : "Sample app for testing",
            "file" : "m_apps/SampleApp",
            "apps" : {
                "color": 4,
                "icon": "apps/apps_white.svg"
            }
        }
     */
    class SampleComponent extends Component {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            
        }

        _bindEvent() {
            /** Implement binding events */
            
        }

        template() {
            /** Implement generating template */
            var page = new com_String();
            
            return page.toString();
        }

        render() {
            super.render();
            /** Implement after rendering */

        }

    }

    return SampleComponent;
});