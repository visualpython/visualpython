/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : MenuGroup.js
 *    Author          : Black Logic
 *    Note            : Render and load menu group
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] MenuGroup
//============================================================================
define([
    '../com/component/Component',
    '../com/com_util',
    '../com/com_String',
], function(Component, com_util, com_String) {
    'use strict';
    //========================================================================
    // Declare class
    //========================================================================
    /**
     * MenuGroup
     */
    class MenuGroup extends Component {
        constructor($target, state) {
            super($target, state);
        }

        _bindEvent() {
            var that = this;
            this.$target.on('click', function(evt) {
                var target = evt.target;
                if ($(target).parent().hasClass(that.uuid)) {
                    var bodyTag = $('.' + that.uuid).find('.vp-menugroup-box');
                    if (bodyTag.is(':visible')) {
                        bodyTag.hide();
                    } else {
                        bodyTag.show();
                        // scroll to view
                        $(target)[0].scrollIntoView({behavior: "smooth", block: "start"});
                    }
                    evt.stopPropagation();
                }
            });
        }

        template() {
            var { id, name, desc, level, open, grid } = this.state;
            // open menu group on default?
            var openItemsAttribute = open && open==true? '': 'style="display:none;"'
            var isGrid = (grid == true);

            var page = new com_String();
            page.appendFormatLine('<div class="{0} {1}">', this.uuid, isGrid?'apps':'');
            if (level == 0) {
                // render root group
                page.appendFormatLine('<div class="{0}" data-category="{1}" title="{2}">{3}</div>'
                                    , 'vp-menugroup-root vp-no-selection', id, desc, name);
                page.appendFormatLine('<div class="{0}" {1}>', 'vp-menugroup-box', openItemsAttribute);
                if (isGrid) {
                    // add grid template if it's apps
                    page.appendFormatLine('<div class="{0}"></div>', 'vp-menugroup-grid');
                }
                // menu items here
                page.appendLine('</div>');
            } else {
                // render normal group
                page.appendFormatLine('<div class="{0} {1}" data-category="{2}" title="{3}">'
                                    , 'vp-menugroup vp-no-selection vp-accordian'
                                    , open && open==true?'vp-open':'vp-close', id, desc);
                page.appendFormatLine('<span class="{0}"></span>', 'vp-indicator');
                page.appendFormatLine('<span>{0}</span>', name)
                page.appendLine('</div>');
                page.appendFormatLine('<div class="{0}" {1}></div>', 'vp-menugroup-box vp-accordian-box', openItemsAttribute);
            }
            page.appendLine('</div>');
            return page.toString();
        }

        /**
         * Get child items
         * @returns object
         */
        getItem() {
            return this.state.item;
        }

        /**
         * Get body tag to append items
         * @returns queryTag
         */
        getBody() {
            var queryString = '.' + this.uuid;
            if (this.state.grid == true) {
                return this.$target.find(queryString + ' .vp-menugroup-grid');
            }
            return this.$target.find(queryString + ' .vp-menugroup-box');
        }
    }

    return MenuGroup;

});

/* End of file */