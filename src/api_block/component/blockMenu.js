define([
    'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/container/vpContainer'

    , '../constData.js'

    
], function ( $, vpCommon, vpConst, sb, vpContainer, 
              constData) {

    const { 
        STR_CLICK

        , VP_ID_PREFIX
        , VP_CLASS_PREFIX

        , VP_ID_APIBLOCK_MENU_BOX 
        , VP_ID_APIBLOCK_MENU_RUN
        , VP_ID_APIBLOCK_MENU_ADD
        , VP_ID_APIBLOCK_MENU_DUPLICATE
        , VP_ID_APIBLOCK_MENU_DELETE

        , VP_CLASS_APIBLOCK_BOARD
        , VP_CLASS_APIBLOCK_MENU_BOX
        , VP_CLASS_APIBLOCK_MENU_ITEM

        , BLOCK_DIRECTION
    } = constData;

    var BlockMenu = function(blockContainer) {
        this.blockContainer = blockContainer;
        this.thisDom = '';
        this.block = undefined;

        this.position = {
            left: 0,
            top: 0
        }

        this.render();
        this.bindEvent();
    }

    /** render */
    BlockMenu.prototype.render = function() {
        var sbBlockMenu = new sb.StringBuilder();
        sbBlockMenu.appendFormatLine('<div id="{0}"  style="{1}" class="{2}">'
                                    , VP_ID_APIBLOCK_MENU_BOX, 'display: none; position: fixed;', VP_CLASS_APIBLOCK_MENU_BOX);
        // run button
        sbBlockMenu.appendFormatLine('<div id="{0}" class="{1}">{2}</div>'
                                    , VP_ID_APIBLOCK_MENU_RUN, VP_CLASS_APIBLOCK_MENU_ITEM, 'Run');
        // add button
        sbBlockMenu.appendFormatLine('<div id="{0}" class="{1}">{2}</div>'
                                    , VP_ID_APIBLOCK_MENU_ADD, VP_CLASS_APIBLOCK_MENU_ITEM, 'Add');
        // duplicate button
        sbBlockMenu.appendFormatLine('<div id="{0}" class="{1}">{2}</div>'
                                    , VP_ID_APIBLOCK_MENU_DUPLICATE, VP_CLASS_APIBLOCK_MENU_ITEM, 'Duplicate');
        // delete button
        sbBlockMenu.appendFormatLine('<div id="{0}" class="{1}">{2}</div>'
                                    , VP_ID_APIBLOCK_MENU_DELETE, VP_CLASS_APIBLOCK_MENU_ITEM, 'Delete');
        sbBlockMenu.appendLine('</div>');

        this.thisDom = $(sbBlockMenu.toString());

        // append on board body
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD)).append(this.thisDom);
    }

    BlockMenu.prototype.wrapSelector = function(query) {
        return vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_MENU_BOX + ' ' + query);
    }

    BlockMenu.prototype.show = function(block, left, top) {
        this.block = block;
        this.position = {
            left: left,
            top: top
        }
        this.thisDom.css(this.position)
        this.thisDom.show();
    }

    BlockMenu.prototype.close = function() {
        this.block = undefined;
        this.thisDom.hide();
    }

    BlockMenu.prototype.bindEvent = function() {
        var that = this;
        /** run block */
        $(document).off(STR_CLICK, this.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_MENU_RUN));
        $(document).on(STR_CLICK, this.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_MENU_RUN), function() {
            that.block.runThisBlock();
            that.close();
        });
        /** add block */
        $(document).off(STR_CLICK, this.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_MENU_ADD));
        $(document).on(STR_CLICK, this.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_MENU_ADD), function() {
            that.block.runThisBlock(false);
            that.close();
        });
        /** duplicate block */
        $(document).off(STR_CLICK, this.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_MENU_DUPLICATE));
        $(document).on(STR_CLICK, this.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_MENU_DUPLICATE), function() {
            // duplicate block
            var blockContainer = that.block.getBlockContainerThis();

            // blockContainer.setCtrlSaveData();
            // blockContainer.copyCtrlSaveData();
            var childBlockList = that.block.getBlockList_thisBlockArea();
            var blockList_cloned = blockContainer.copyBlockList(childBlockList);

            var copyBlock_before = that.block.getLastBlock_from_thisBlockArea();
            var copyBlock_first = blockList_cloned[0];
            
            copyBlock_before.appendBlock(copyBlock_first, BLOCK_DIRECTION.DOWN);
            // copyBlock_first.apply();
                    
            blockContainer.reRenderAllBlock_metadata();
            blockContainer.resetBlockListAndRenderThisBlock(copyBlock_first);
            vpCommon.renderSuccessMessage('Blocks copy success!');

            that.close();
        });
        /** delete block */
        $(document).off(STR_CLICK, this.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_MENU_DELETE));
        $(document).on(STR_CLICK, this.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_MENU_DELETE), function() {
            that.block.deleteBlock_childBlockList();
            that.blockContainer.resetOptionPage();
            that.blockContainer.reRenderAllBlock_asc();
            that.close();
        });
    }

    return BlockMenu;

});