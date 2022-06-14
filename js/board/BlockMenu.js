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
    './CodeView'
], function (com_util, com_String, Component, CodeView) {
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

            this.prevBlockCodeview = null;
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
                that.boardFrame.runBlock(that.block, true, false);
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
            /** code view */
            $(this.wrapSelector('#vp_block_menu_codeview')).on('click', function() {
                let overallCode = new com_String();
                let groupCode = that.boardFrame.runBlock(that.block, false, false);
                if (that.block.id == 'apps_markdown') {
                    // if markdown, add #
                    groupCode = '#' + groupCode.replaceAll('\n', '\n# ');
                }
                overallCode.appendFormatLine('# Visual Python: {0} > {1}', that.block.name, that.block.name);
                overallCode.append(groupCode);

                // open codeview
                let codeview = new CodeView({ 
                    codeview: overallCode.toString(),
                    config: {
                        id: 'blockCodeview',
                        name: 'Block Codeview',
                        path: ''
                    }
                });
                if (that.prevBlockCodeview != null) {
                    // remove prev code view
                    that.prevBlockCodeview.remove();
                }
                that.prevBlockCodeview = codeview;
                codeview.open();

                that.close();
            });
        }

        template() {
            var sbBlockMenu = new com_String();
            sbBlockMenu.appendFormatLine('<div id="vp_block_menubox"  style="0" class="vp-block-menu-box vp-close-on-blur">',
                'display: none; position: fixed;');
            // edit button
            sbBlockMenu.appendLine('<div id="vp_block_menu_edit" class="vp-block-menu-item">Edit</div>');
            sbBlockMenu.appendLine('<hr class="vp-extra-menu-line" id="vp_block_menu_line_1">');
            // run button
            sbBlockMenu.appendLine('<div id="vp_block_menu_run" class="vp-block-menu-item">Run</div>');
            // add button
            sbBlockMenu.appendLine('<div id="vp_block_menu_add" class="vp-block-menu-item">Code to cell</div>');
            // duplicate button
            sbBlockMenu.appendLine('<div id="vp_block_menu_duplicate" class="vp-block-menu-item">Duplicate</div>');
            // delete button
            sbBlockMenu.appendLine('<div id="vp_block_menu_delete" class="vp-block-menu-item">Delete</div>');
            // codeview button
            sbBlockMenu.appendLine('<hr class="vp-extra-menu-line" id="vp_block_menu_line_2">');
            sbBlockMenu.appendLine('<div id="vp_block_menu_codeview" class="vp-block-menu-item">Code view</div>');
            sbBlockMenu.appendLine('</div>');
            return sbBlockMenu.toString();
        }

        open(block, left, top) {
            this.block = block;
            this.position = {
                left: left,
                top: top
            };

            // handling menu box to show inside visible area
            let docWidth = $(document).width();
            let docHeight = $(document).height();
            let menuWidth = $(this.wrapSelector()).outerWidth();
            let menuHeight = $(this.wrapSelector()).outerHeight();
            if (docWidth < left + menuWidth) {
                // horizontally out of view
                this.position.left -= menuWidth;
            }
            if (docHeight < top + menuHeight) {
                // vertically out of view
                this.position.top -= menuHeight;
            }
            
            $(this.wrapSelector()).css(this.position);
            // show items
            $(this.wrapSelector('.vp-block-menu-item')).show();
            $(this.wrapSelector('.vp-extra-menu-line')).show();
            $(this.wrapSelector()).show();

            // filter menu depends on block
            let noContentBlocks = ['lgCtrl_try', 'lgCtrl_else', 'lgCtrl_finally'];
            if (this.block.isSubBlock) {
                // no duplicate
                $(this.wrapSelector('#vp_block_menu_duplicate')).hide();
            } 
            if (noContentBlocks.includes(this.block.id)) {
                // no edit mode
                $(this.wrapSelector('#vp_block_menu_edit')).hide();
                $(this.wrapSelector('#vp_block_menu_line_1')).hide();
            }
        }
        
        close() {
            this.block = undefined;
            $(this.wrapSelector()).hide();
        }
        
    }

    return BlockMenu;

});