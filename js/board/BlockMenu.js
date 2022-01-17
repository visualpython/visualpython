/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : BlockMenu.js
 *    Author          : Black Logic
 *    Note            : Render block menu
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 12. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] Block
//============================================================================
define([
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/Component',
], function (com_util, com_String, Component) {
    'use strict';

    class BlockMenu extends Component {
        constructor(boardFrame) {
            super($('#vp_boardFrame'), {}, {boardFrame: boardFrame});
        }

        _init() {
            this.boardFrame = this.prop.boardFrame;
            this.block = undefined;

            this.position = {
                left: 0,
                top: 0
            };
        }

        _bindEvent() {
            var that = this;
            /** edit block */
            $(this.wrapSelector('#vp_block_menu_edit')).on('click', function () {
                that.block.openPopup();
                that.close();
            });
            /** run block */
            $(this.wrapSelector('#vp_block_menu_run')).on('click', function () {
                that.boardFrame.runBlock(that.block);
                that.close();
            });
            /** add block */
            $(this.wrapSelector('#vp_block_menu_add')).on('click', function () {
                that.boardFrame.runBlock(that.block, false);
                that.close();
            });
            /** duplicate block */
            $(this.wrapSelector('#vp_block_menu_duplicate')).on('click', function () {
                // duplicate block
                that.boardFrame.copyBlock(that.block);
                that.close();
            });
            /** delete block */
            $(this.wrapSelector('#vp_block_menu_delete')).on('click', function () {
                that.boardFrame.removeBlock(that.block);
                that.close();
            });
        }

        template() {
            var sbBlockMenu = new com_String();
            sbBlockMenu.appendFormatLine('<div id="vp_block_menubox"  style="0" class="vp-block-menu-box vp-close-on-blur">',
                'display: none; position: fixed;');
            // edit button
            sbBlockMenu.appendLine('<div id="vp_block_menu_edit" class="vp-block-menu-item">Edit</div>');
            sbBlockMenu.appendLine('<hr class="vp-extra-menu-line">');
            // run button
            sbBlockMenu.appendLine('<div id="vp_block_menu_run" class="vp-block-menu-item">Run</div>');
            // add button
            sbBlockMenu.appendLine('<div id="vp_block_menu_add" class="vp-block-menu-item">Code to cell</div>');
            // duplicate button
            sbBlockMenu.appendLine('<div id="vp_block_menu_duplicate" class="vp-block-menu-item">Duplicate</div>');
            // delete button
            sbBlockMenu.appendLine('<div id="vp_block_menu_delete" class="vp-block-menu-item">Delete</div>');
            sbBlockMenu.appendLine('</div>');
            return sbBlockMenu.toString();
        }

        open(block, left, top) {
            this.block = block;
            this.position = {
                left: left,
                top: top
            };
            
            $(this.wrapSelector()).css(this.position);
            $(this.wrapSelector()).show();
            // filter menu depends on block
            if (this.block.isSubBlock) {
                // no duplicate
                $(this.wrapSelector('#vp_block_menu_duplicate')).hide();
            }
        }
        
        close() {
            this.block = undefined;
            $(this.wrapSelector()).hide();
        }
        
    }

    return BlockMenu;

});