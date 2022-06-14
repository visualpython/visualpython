/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Block.js
 *    Author          : Black Logic
 *    Note            : Render block
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] Block
//============================================================================
define([
    '../com/component/Component',
    '../com/com_String'
], function(Component, com_String) {
	'use strict';

    const BLOCK_PADDING = 20;
	
    /**
     * @class Block
     * @constructor
     */
     class Block extends Component {
        constructor(parent, state) {
            super($('.vp-board-body'), state, { parent: parent });
            /**
             * state.task: PopupComponent
             * prop.parent : BoardFrame
             */
        }

        _getMenuGroupRootType(idx=1) {
            // ex) visualpython - apps - frame -> apps
            let path = this.state.task.path;
            let pathList = path.split(' - ');
            return pathList[idx];
        }

        _getMenuGroupType() {
            // ex) visualpython - apps - frame -> apps-frame
            let path = this.state.task.path;
            let pathList = path.split(' - ');
            return pathList.slice(1, pathList.length - 1).join('-');
        }

        _init() {
            this.state = {
                isGroup: true,
                leftHolderHeight: 0,
                depth: 0,
                blockNumber: $('.vp-block.vp-block-group').length + 1,
                elseFlag: false,
                finallyFlag: false,
                ...this.state
            }

            this.task = this.state.task;
            this.task.setTaskItem(this);

            this.classes = [];
        }

        _bindEvent() {
            let that = this;
            // hover run button click event
            $(this.wrapSelector('.vp-block-num-info')).on('click', function(evt) {
                // run popup
                that.prop.parent.runBlock(that);
            });
            // click event - emphasize TaskItem & open/hide PopupComponent
            $(this.wrapSelector('.vp-block-header')).single_double_click(function(evt) {
                /** single click */
                let isFocused = $(that.wrapSelector()).hasClass('vp-focus');
                if (isFocused) {
                    that.blurItem();
                } else {
                    that.focusItem();
                }
                evt.stopPropagation();
            }, function(evt) {
                /** double click */
                let isSorting = $(that.wrapSelector()).hasClass('ui-sortable-helper');
                if (isSorting) {
                    return;
                }
                let isHidden = that.task.isHidden();
                if (isHidden) {
                    that.openPopup();
                } else {
                    that.closePopup();
                }
            });
            // right click event - blockMenu
            $(this.wrapSelector('.vp-block-header')).on('contextmenu', function(evt) {
                that.prop.parent.showMenu(that, evt.pageX, evt.pageY);
                evt.preventDefault();
            });

            // click event - block button
            $(this.wrapSelector('.vp-block-button')).on('click', function(evt) {
                let menu = $(this).data('menu');
                switch (menu) {
                    case 'else':
                        that.prop.parent.toggleElseBlock(that);
                        break;
                    case 'elif':
                        that.prop.parent.addElifBlock(that);
                        break;
                    case 'except':
                        that.prop.parent.addExceptBlock(that);
                        break;
                    case 'finally':
                        that.prop.parent.toggleFinallyBlock(that);
                        break;
                }
                that.focusItem();
            })
        }

        checkTaskAvailable() {
            return this.task != undefined;
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

        /**
         * Generate template
         */
        template() {
            let blockType = this.blockType;
            let taskId = this.id;
            let header = this.header;
            let isGroup = this.isGroup;
            let depth = this.depth;
            let blockNumber = this.blockNumber;
            let addedClass = this.classes.join(' ');

            var page = new com_String();
            page.appendFormatLine('<div class="vp-block {0} {1} {2}" style="padding-left: {3}px" >'
                                , isGroup?'vp-block-group':'', blockType, addedClass, depth*BLOCK_PADDING);
            page.appendFormatLine('<div class="vp-block-header">{0}</div>', header);
            page.appendFormatLine('<div class="vp-block-left-holder"></div>');
            page.appendFormatLine('<div class="vp-block-depth-info" style="left: {0}px">{1}</div>'
                                , depth*BLOCK_PADDING + BLOCK_PADDING, depth);
            page.appendFormatLine('<div class="vp-block-num-info" {0} title="{1}">{2}</div>'
                                , isGroup?'':'style="display:none;"', 'Run this group', blockNumber);

            // template for block button
            let { elseFlag, finallyFlag } = this.state; 
            if (taskId == 'lgCtrl_for' || taskId == 'lgCtrl_while') {
                page.appendLine('<div class="vp-block-button-group">');
                page.appendFormatLine('<div class="vp-block-button {0}" data-menu="{1}">{2}</div>', 'else', 'else', 'else ' + (elseFlag?'off':'on'));
                page.appendLine('</div>');
            }
            if (taskId == 'lgCtrl_if') {
                page.appendLine('<div class="vp-block-button-group">');
                page.appendFormatLine('<div class="vp-block-button {0}" data-menu="{1}">{2}</div>', 'elif', 'elif', '+ elif');
                page.appendFormatLine('<div class="vp-block-button {0}" data-menu="{1}">{2}</div>', 'else', 'else', 'else ' + (elseFlag?'off':'on'));
                page.appendLine('</div>');
            }
            if (taskId == 'lgCtrl_try') {
                page.appendLine('<div class="vp-block-button-group">');
                page.appendFormatLine('<div class="vp-block-button {0}" data-menu="{1}">{2}</div>', 'except', 'except', '+ except');
                page.appendFormatLine('<div class="vp-block-button {0}" data-menu="{1}">{2}</div>', 'else', 'else', 'else ' + (elseFlag?'off':'on'));
                page.appendFormatLine('<div class="vp-block-button {0}" data-menu="{1}">{2}</div>', 'finally', 'finally', 'finally ' + (finallyFlag?'off':'on'));
                page.appendLine('</div>');
            }
            page.appendLine('</div>');
            return page.toString();
        }

        render() {
            super.render();

            $(this.wrapSelector()).data('block', this);
            $(this.wrapSelector()).data('color', this.blockType);
            $(this.wrapSelector()).data('name', this.name);
            $(this.wrapSelector()).data('menu', this.id);

            // emphasize it if its task is visible
            if (!this.task.isHidden()) {
                this.focusItem();
            }

            // Deprecated: show markdown as other DA blocks
            // if markdown, set its height to fit-content
            // if (this.id == 'apps_markdown') {
            //     $(this.wrapSelector()).addClass('vp-block-markdown');
            // }

            // if viewDepthNumber, show it
            let viewDepthNumber = this.prop.parent.state.viewDepthNumber;
            if (this.depth > 0 && viewDepthNumber) {
                $(this.wrapSelector('.vp-block-depth-info')).css({ opacity: 1 });
            }
        }

        //========================================================================
        // Block control
        //========================================================================

        show() {
            $(this.wrapSelector()).show();
        }

        hide() {
            $(this.wrapSelector()).hide();
        }

        focusItem() {
            this.prop.parent.blurAllblock();
            $(this.wrapSelector()).addClass('vp-focus');
            this.addClass('vp-focus');

            this.getGroupedBlocks().forEach(block => {
                block.focusChild();
            });
        }
        
        blurItem() {
            this.classes = [];
            $(this.wrapSelector()).removeClass('vp-focus');
            this.removeClass('vp-focus');

            this.getGroupedBlocks().forEach(block => {
                block.blurChild();
            });
        }
        
        focusChild() {
            $(this.wrapSelector()).addClass('vp-focus-child');
            this.addClass('vp-focus-child');
        }

        blurChild() {
            $(this.wrapSelector()).removeClass('vp-focus-child');
            this.removeClass('vp-focus-child');
        }

        removeItem() {
            $(this.wrapSelector()).remove();
        }

        addClass(className) {
            this.classes.push(className);
        }

        removeClass(className) {
            let idx = this.classes.indexOf(className);
            this.classes.splice(idx, 1);
        }

        //========================================================================
        // Popup control
        //========================================================================
        openPopup() {
            // open task
            this.focusItem();
            $('#vp_wrapper').trigger({
                type: 'open_option_page',
                component: this.task
            });
        }
        
        closePopup() {
            // hide task if it's already opened
            this.blurItem();
            // close task
            $('#vp_wrapper').trigger({
                type: 'close_option_page'
            });   
        }
        //========================================================================
        // Get Set methods
        //========================================================================
        get id() {
            return this.task.id;
        }
        get name() {
            return this.task.name;
        }
        get menuGroup() {
            let groupCode = this._getMenuGroupRootType();
            let groupLabel = vpConfig.getMenuGroupLabel(groupCode);
            if (groupLabel == undefined || groupLabel === '') {
                return groupCode;
            }
            return groupLabel;
        }
        get blockType() {
            return this.getColorLabel();
        }
        get header() {
            let header = this.name;
            // if logic, show code
            if (this._getMenuGroupRootType() == 'logic') {
                header = this.task.generateCode();
            }
            // Deprecated: show markdown as other blocks
            // if (this.id == 'apps_markdown') {
            //     header = this.task.getPreview();
            // }
            this.state.header = header;
            return header;
        }
        get isGroup() {
            return this.state.isGroup;
        }
        get isHeadBlock() {
            return this.prop.parent.headBlocks.includes(this.id);
        }
        get isSubBlock() {
            return this.prop.parent.subBlocks.includes(this.id);
        }
        get blockNumber() {
            return this.state.blockNumber;
        }
        get depth() {
            return this.state.depth;
        }
        get popup() {
            return this.task;
        }
        get sigText() {
            return this.menuGroup + ' > ' + this.name;
        }
        canMakeChild() {
            let innerList = [
                'lgDef_class', 'lgDef_def', 
                'lgCtrl_for', 'lgCtrl_while', 'lgCtrl_if', 'lgCtrl_try',
                'lgCtrl_elif', 'lgCtrl_else', 'lgCtrl_except', 'lgCtrl_finally'
            ];
            if (innerList.includes(this.id)) {
                return true;
            }
            return false;
        }
        getChildDepth() {
            let depth = this.depth;
            if (this.canMakeChild()) {
                return depth + 1;
            }
            return depth;
        }
        /**
         * Get head group block of this group
         */
        getGroupBlock() {
            return this.prop.parent.getGroupBlock(this);
        }
        getGroupedBlocks() {
            return this.prop.parent.getGroupedBlocks(this);
        }
        setHeader(text) {
            this.state.header = text;
        }
        /**
         * Set block's blockNumber
          * @param {int} blockNumber
          */
        setNumber(blockNumber) {
            this.state.blockNumber = blockNumber;
        }
        /**
         * Set block's depth
         * @param {int} depth 
         */
        setDepth(depth) {
            this.state.depth = depth;
        }
        /**
         * Set block as group block
          */
        setGroupBlock() {
            let depthDiff = 0 - this.state.depth;
            this.state.isGroup = true;

            // change grouped block's depth ( depth + 1 )
            this.setGroupedBlocksState(block => { block.setDepth(block.depth + depthDiff)});
        }
        /**
         * Set block as child block of given block
         */
        setChildBlock(newDepth) {
            let depthDiff = newDepth - this.state.depth;
            this.state.isGroup = false;

            // change grouped block's depth ( depth + 1 )
            this.setGroupedBlocksState(block => { block.setDepth(block.depth + depthDiff)});
        }

        /**
         * Set grouped blocks state using setter function
         * Example:
         *  block.setGroupedBlocksState(block => { block.setDepth(block.depth + 1)})
         * @param {Function} setter 
         */
        setGroupedBlocksState(setter) {
            let groupedBlocks = this.getGroupedBlocks();
            groupedBlocks.forEach(block => {
                setter(block);
            });
        }

        //========================================================================
        // Block load/save
        //========================================================================
        toJson() {
            let state = this.task.getState();
            // delete config info
            delete state['config'];
            let jsonBlock = {
                isGroup: this.isGroup,
                depth: this.depth,
                blockNumber: this.blockNumber,
                taskId: this.id,
                taskState: state
            };
            return jsonBlock;
        }

        fromJson(jsonObject) {
            let {
                isGroup, depth, blockNumber, taskId, taskState
            } = obj;
            this.state = {
                isGroup: isGroup,
                depth: depth,
                blockNumber: blockNumber,
                ...taskState
            };
        }
    }

    return Block;
});