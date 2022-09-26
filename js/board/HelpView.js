/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : HelpView.js
 *    Author          : Black Logic
 *    Note            : Render Help view
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] HelpView
//============================================================================
define([
    '../com/component/PopupComponent'
], function(PopupComponent) {
	'use strict';
	
    /**
     * @class HelpView
     * @constructor
     */
    class HelpView extends PopupComponent {
        _init() {
            super._init();

            this.config.footer = false;
            this.config.sizeLevel = 1;

            this.state = {
                helpview: '',
                ...this.state
            }

            this._addCodemirror('helpview', this.wrapSelector('#helpview'), "readonly");
        }

        templateForBody() {
            return `<textarea id="helpview">${this.state.helpview}</textarea>`;
        }
    }

    return HelpView;

});