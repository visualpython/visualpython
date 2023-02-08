/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : MenuItem.js
 *    Author          : Black Logic
 *    Note            : Render and load menu item
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] MenuItem
//============================================================================
define([
    '../com/com_Const',
    '../com/com_String',
    '../com/component/Component',
    '../board/Block'
], function(com_Const, com_String, Component, Block) {
    'use strict';
    //========================================================================
    // Declare class
    //========================================================================
    /**
     * MenuItem
     */
    class MenuItem extends Component{
        constructor($target, state) {
            super($target, state);
        }

        _getMenuGroupRootType(idx=1) {
            // ex) visualpython - apps - frame
            let path = this.state.path;
            let pathList = path.split(' - ');
            return pathList[idx];
        }

        _getMenuGroupType() {
            // ex) visualpython - apps - frame
            let path = this.state.path;
            let pathList = path.split(' - ');
            return pathList.slice(1, pathList.length - 1).join('-');
        }

        /**
         * Get menu item block's background color
         * @param {*} isApps 
         * @returns 
         */
        _getColorClass(isApps=false) {
            if (isApps) {
                // For Apps menu item
                var color = this.state.apps.color;
                switch(color) {
                    case 0:
                        return 'vp-color-preparing';
                    default:
                        return 'vp-color-apps' + color;
                }
            } else {
                // return color class
                // FIXME: set detailed labels
                return this.getColorLabel();
            }
        }

        getColorLabel() {
            let root = this._getMenuGroupRootType();
            let label = root;
            switch(root) {
                case 'logic':
                    let subRoot = this._getMenuGroupRootType(2);
                    label = 'logic-' + subRoot;
                    break;
                case 'library':
                    break;
            }

            return label;
        }

        _bindEvent() {
            var that = this;
            $(this.wrapSelector()).on('click', function(evt) {
                // click event
                $('#vp_wrapper').trigger({
                    type: 'create_option_page', 
                    blockType: 'task',
                    menuId: that.state.id,
                    menuState: {},
                    afterAction: 'open'
                });
            });
        }

        _bindDraggable() {
            var that = this;
            $(this.wrapSelector()).draggable({
                containment: '#vp_wrapper',
                appendTo: '.vp-board-body',
                revert: true,
                cursor: 'move',
                connectToSortable: '.vp-board-body',
                helper: function() {
                    let isApps = that.state.apps != undefined;
                    let helperTag = new com_String();
                    let colorClass = that.getColorLabel();
                    helperTag.appendFormatLine('<div class="vp-block vp-draggable-helper {0}" style="z-index: 199;" data-color="{1}" data-menu="{2}">'
                                            , colorClass, colorClass, that.state.id);
                    helperTag.appendFormatLine('<div class="vp-block-header">{0}</div>', that.state.name);
                    helperTag.appendLine('</div>');
                    return helperTag.toString();
                },
                start: function(event, ui) {
                    // ui.helper.hide();
                    $(ui.helper).css('z-index', 200);
                },
                stop: function(event, ui) {
                    let position = ui.helper.index();
                    
                    let leftPosStr = $(ui.helper).css('left');
                    let leftPos = parseInt(leftPosStr.substr(0, leftPosStr.length - 2));
                    if (leftPos < 0) {
                        // out of board
                        return;
                    }

                    $('#vp_wrapper').trigger({
                        type: 'create_option_page', 
                        blockType: 'block',
                        menuId: that.state.id,
                        menuState: {},
                        position: position
                    });
                }
            });
        }

        template() {
            var page = new com_String();
            var { id, name, desc, apps } = this.state;
            if (apps) {
                // render apps menu item
                page.appendFormatLine('<div class="vp-menuitem apps {0}" data-menu="{1}" title="{2}">'
                            , this._getColorClass(true), id, desc);
                // LAB: img to url
                // page.appendFormatLine('<img src="{0}">', com_Const.IMAGE_PATH + apps.icon);
                page.appendFormatLine('<div class="apps-icon {0}"></div>', id);
                page.appendFormatLine('<div class="vp-menuitem-apps-name">{0}</div>', name);
                page.append('</div>');
            } else {
                // render normal group
                page.appendFormatLine('<div class="vp-menuitem {0}" data-menu="{1}" title="{2}">'
                            , this._getColorClass(), id, desc);
                page.appendFormatLine('<span class="vp-menuitem-name">{0}</span>', name);
                page.append('</div>');
            }
            return page.toString();
        }

        render() {
            super.render();
            this._bindDraggable();
        }
    }

    return MenuItem;

});

/* End of file */