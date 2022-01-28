/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : CodeView.js
 *    Author          : Black Logic
 *    Note            : Render Code view
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] CodeView
//============================================================================
define([
    '../com/component/PopupComponent'
], function(PopupComponent) {
	'use strict';
	
    /**
     * @class CodeView
     * @constructor
     */
    class CodeView extends PopupComponent {
        _init() {
            super._init();

            this.config.footer = false;
            this.config.sizeLevel = 1;

            this.state = {
                codeview: '',
                ...this.state
            }

            this._addCodemirror('codeview', this.wrapSelector('#codeview'), "readonly");
        }

        templateForBody() {
            return `<textarea id="codeview">${this.state.codeview}</textarea>`;
        }
    }

    return CodeView;

});