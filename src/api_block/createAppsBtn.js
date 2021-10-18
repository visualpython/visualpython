/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : createAppsBtn.js
 *    Author          : Black Logic
 *    Note            : Create Apps button
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 10. 05
 *    Change Date     :
 */

//============================================================================
// [CLASS] Create Apps button
//============================================================================
define([
    './constData.js'
    , 'nbextensions/visualpython/src/common/StringBuilder'
], function(constData, sb) {
    'use strict';

    const { APPS_CONFIG } = constData;

    //========================================================================
    // [CLASS] CreateAppsBtn
    //========================================================================
    class CreateAppsBtn {
        constructor(blockContainerThis, menu) {
            this.blockContainerThis = blockContainerThis;
            this.menu = menu;

            this.icon = APPS_CONFIG[menu].icon;
            this.label = APPS_CONFIG[menu].label;
            this.tooltip = APPS_CONFIG[menu].tooltip;
            if (!this.tooltip) {
                this.tooltip = this.label;
            }
            this.colorLevel = APPS_CONFIG[menu].color;

            this.dom = undefined;
        }

        _getColorClass() {
            switch(this.colorLevel) {
                case 0:
                    return 'preparing';
                case 1:
                case 2:
                case 3:
                case 4:
                    return 'line' + this.colorLevel;
            }
        }

        render() {
            var page = new sb.StringBuilder();
            page.appendFormatLine('<div class="vp-apiblock-menu-apps-item {0}" data-menu="{1}" title="{2}">'
                            , this._getColorClass(), this.menu, this.tooltip);
            page.appendFormatLine('<img src="{0}">', this.icon);
            page.appendFormatLine('<div class="vp-apiblock-menu-apps-name">{0}</div>', this.label);
            page.append('</div>');
            // save as dom
            this.dom = $(page.toString());
            return this.dom;
        }

        bindEvent() {
            var blockContainer = this.blockContainerThis;

            // block preparing apps
            if (this.colorLevel == 0) {
                return;
            }

            $(this.dom).on('click', function() {
                var menu = $(this).attr('data-menu');

                var { file, config } = APPS_CONFIG[menu];
                if (config == undefined) {
                    config = {}
                }

                switch (menu)
                {
                    case 'markdown':
                        blockContainer.createTextBlock();
                        break;
                    case 'import':
                    case 'snippets':
                    case 'variable':
                    case 'file':
                    case 'instance':
                    case 'subset':
                    case 'frame':
                    case 'chart':
                    case 'profiling':
                    case 'pdf':
                    case 'groupby':
                    case 'bind':
                    case 'reshape':
                        blockContainer.setSelectBlock(null);
                        blockContainer.createAppsPage(menu, file, config);
                        break;
                }
            });
        }
    }

    return CreateAppsBtn;
});

/* End of file */