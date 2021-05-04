define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/container/vpContainer'
], function (requirejs, $, vpConst, vpContainer) {
    "use strict";
    /**
     * TEST: minju: api board test
     * API Board
     * 1. set draggable event to .vp-ab-box
     * 2. set drag box information
     *  1) 
     */

    /** FIXME: move to constants.js : VpBoard const variables */
    const VP_PARENT_CONTAINER   = ''; //'.vp-option-page';
    const VP_DRAGGABLE          = '.vp-ab-box';
    const VP_DRAGGABLE_INBOX    = '.vp-ab-inbox';
    const VP_CONTAINER          = '.vp-ab-container';
    const VP_DROPPABLE_BOX      = '.vp-ab-droppable-box';
    const VP_BOX_MENU_ID        = '#vp_abBoxMenu';
    const VP_BOX_SELECTOR_ID    = '#vp_abBoxSelector';

    const VP_BOX_MENU_TAG     = ``;
    const VP_BOX_SELECTOR_TAG = ``;
    const VP_CONTAINER_TAG      = `<div class="vp-ab-area">
                                        <div class="vp-ab-container">
                                        </div>
                                    </div>`;
    const VP_DRAGGABLE_TAG      = `<span id="{id}" class="${VP_DRAGGABLE.substr(1)} ${VP_DRAGGABLE_INBOX.substr(1)} {type} no-selection" data-type="{type}" data-idx="{idx}">{code}</span>`


    const VP_BOX_ID_PREFIX      = 'vp_ab_box_';

    /**
     * @class VpBoard
     * @param {string} parentContainer
     * @constructor
     */
    var VpBoard = function (page, parentContainer = VP_PARENT_CONTAINER) {
        this.page = page;

        /**
         * api stack global variable
         * format:
         *  {
         *      code: 'df' / '.concat(opt=1)' / '[]',
         *      type: 'var' / 'oper' / 'brac' / 'api' / 'code'
         *      metadata: {},
         * 
         *      // to load/save 
         *      prev: -1,
         *      next: -1,
         *      child: -1 / left: -1, right: -1
         *  }
         */
        this._apiBoard =  {};
        this._apiHead = 0;
        this._boardNewNumber = Object.keys(this._apiBoard).length;

        this.parentContainer = page.wrapSelector(parentContainer); // '#vp_optionBook'
        this.draggable      = VP_DRAGGABLE;
        this.draggableInbox = VP_DRAGGABLE_INBOX;
        this.container      = VP_CONTAINER;
        this.droppableBox   = VP_DROPPABLE_BOX;

        this.popBoxSelector = VP_BOX_SELECTOR_ID;
        this.popBoxMenu     = VP_BOX_MENU_ID;

        this.containerTag   = VP_CONTAINER_TAG;
        this.draggableTag   = VP_DRAGGABLE_TAG;
    }

    VpBoard.prototype.clear = function() {
        this._apiHead = 0;
        this._apiBoard = {};
        this._boardNewNumber = 0;

        $(this.parentContainer).find(this.draggable).remove();
        this.syncApiStack();
    }

    /**
     * Clear apiStack Link
     */
    VpBoard.prototype.clearLink = function() {
        Object.keys(this._apiBoard).forEach(key => {
            delete this._apiBoard[key].next;
            delete this._apiBoard[key].child;
            delete this._apiBoard[key].left;
            delete this._apiBoard[key].right;
            delete this._apiBoard[key].checksum;
        })
    }

    /**
     * remove not using keys
     */
    VpBoard.prototype.clearUnchecked = function() {
        var keys = Object.keys(this._apiBoard);
        for(var i = 0; i < keys.length; i++) {
            if (this._apiBoard[keys[i]].checksum != true) {
                delete this._apiBoard[keys[i]];
            }
        }
    }

    VpBoard.prototype.loadBoard = function(apiBoard) {
        this._apiBoard = apiBoard;
        // find last key
        var boardKeys = Object.keys(apiBoard).sort().reverse();
        this._apiHead = 0;
        this._boardNewNumber = boardKeys[0] + 1;
    }

    /**
     * Load Box recursively
     * @param {number} pointer 
     * @param {string} prevBox Tag Element string
     */
    VpBoard.prototype.loadBox = function(pointer, prevBox = '') {
        if (pointer == undefined || pointer < 0 || Object.keys(this._apiBoard).length <= 0) {
            return "";
        }
        var block = this._apiBoard[pointer];
        if (block == undefined) return "";

        var box = VP_DRAGGABLE_TAG;
        box = box.replace('{id}', VP_BOX_ID_PREFIX + pointer);
        box = box.replaceAll('{type}', block.type);
        box = box.replace('{idx}', pointer);

        var code = block.code;
        
        if (block.type == "brac") {
            var child = this.loadBox(block.child);
            // brackets [{child}] ({child})
            if (block.code.indexOf('{child}') < 0) {
                code = `<span class="vp-ab-code ${block.type}">${block.code}</span>
                        <span class="vp-ab-droppable-box" data-type="${block.type}" data-idx="${pointer}" data-link="child">${child}</span>`
            } else {
                var codes = block.code.split('{child}');
                code = `<span class="vp-ab-code ${block.type}">${codes[0]}</span>
                        <span class="vp-ab-droppable-box" data-type="${block.type}" data-idx="${pointer}" data-link="child">${child}</span>
                        <span class="vp-ab-code ${block.type}">${codes[1]}</span>`
            }
        } else if (block.type == "oper") {
            // operator + - / * & | == != < <= > >=
            var left = this.loadBox(block.left);
            var right = this.loadBox(block.right);
            // code = `(${left} ${block.code} ${right})`
            code = `
            <span class="vp-ab-code ${block.type}">(</span>
            <span class="vp-ab-droppable-box left" data-type="${block.type}" data-idx="${pointer}" data-link="left">${left}</span>
            <span class="vp-ab-code ${block.type}">${block.code}</span>
            <span class="vp-ab-droppable-box right" data-type="${block.type}" data-idx="${pointer}" data-link="right">${right}</span>
            <span class="vp-ab-code ${block.type}">)</span>
            `;
        } else if (block.type == "var" || block.type == "api") {
            var left = this.loadBox(block.left);
            var right = this.loadBox(block.right);
            // code = 'api(${left})${right}'
            var codes = block.code.split('{left}').join('{}').split('{right}').join('{}').split('{}');
            code = `
            <span class="vp-ab-code ${block.type}">${codes[0]}</span>
            <span class="vp-ab-droppable-box left" data-type="${block.type}" data-idx="${pointer}" data-link="left">${left}</span>`;
            if (codes[1] != undefined && codes[1] != '') {
                code += `<span class="vp-ab-code ${block.type}">${codes[1]}</span>`;
            }
            code += `<span class="vp-ab-droppable-box right" data-type="${block.type}" data-idx="${pointer}" data-link="right">${right}</span>`;
            if (codes[2] != undefined && codes[2] != '') {
                code += `<span class="vp-ab-code ${block.type}">${codes[2]}</span>`;
            }
        } else {
            // code
            code = `<span class="vp-ab-code ${block.type}">${block.code}</span>`
        }
        box = box.replace('{code}', code);
        box = prevBox + box;
        if (block.next != undefined && block.next >= 0 
            && block.next != pointer // prevent infinite loop
            ) {
            box = this.loadBox(block.next, box);
        }
        return box;
    }

    /**
     * Synchronize container & _apiBoard
     * @param {HTMLElement} parentTag 
     */
    VpBoard.prototype.syncBoard = function(parentTag) {
        var parentKey = parentTag.data('idx');
        var parentType = parentTag.data('type');
        var parentLink = parentTag.data('link');
        if (parentLink == undefined) {
            parentLink = 'child';
        }

        // get childrenTag
        var childrenTag = parentTag.children(VP_DRAGGABLE);

        // loop and recursive function to get children
        var childrenCount = childrenTag.length;
        if (childrenCount > 0) {
            var prevKey = -1;
            for (var i = 0; i < childrenCount; i++) {
                var childTag = childrenTag[i];
                var key = $(childTag).data('idx');
                var type = $(childTag).data('type');

                this._apiBoard[key].checksum = true;
    
                if (i == 0) {
                    // first child set to child/left/right
                    if (parentKey == undefined) {
                        this._apiHead = key;
                    } else {
                        this._apiBoard[parentKey][parentLink] = key;
                    }
                }

                // if type is brac or oper
                if (type == 'brac') {
                    var boxTag = $(childTag).children(VP_DROPPABLE_BOX);
                    // link to child
                    this.syncBoard($(boxTag));
                } else if (type == 'oper') {
                    var leftTag = $(childTag).children(VP_DROPPABLE_BOX + '.left');
                    var rightTag = $(childTag).children(VP_DROPPABLE_BOX + '.right');
                    // link to left/right children
                    this.syncBoard($(leftTag));
                    this.syncBoard($(rightTag));
                }
                
                if (prevKey >= 0) {
                    this._apiBoard[prevKey].next = key;
                }
                // _apiBoard[key].prev = prevKey;
                prevKey = key;
            }
        } else {
            // no child
            if (parentKey == undefined) {
                this._apiHead = key;
            } else {
                this._apiBoard[parentKey][parentLink] = -1;
            }
        }
    }

    VpBoard.prototype.getCode = function(container = this.container) {
        // TODO: run cell : $('.vp-ab-container .vp-ab-code').text().replaceAll(/\r?\n|\r/g, '').trim()
        var code = $(this.parentContainer).find(container).find('.vp-ab-code').text().replaceAll(/\r?\n|\r/g, '').trim();
        if (code == undefined) {
            return "";
        }
        return code;
    }

    /**
     * Load container & apiStack boxes
     */
    VpBoard.prototype.load = function() {

        // clean container
        $(this.parentContainer).find('.vp-ab-area').remove();

        this.page.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "file_io/vpBoard.css");
        
        this.loadContainer();
        this.loadApiStack();
    }

    /**
     * Load api board droppable container
     * default class : .vp-ab-container
     */
    VpBoard.prototype.loadContainer = function(parentContainer = this.parentContainer) {
        var that = this;
        var droppableEle = $(this.containerTag);
        var droppableBoxEle = $(this.droppableBox);

        // load container
        $(parentContainer).prepend(droppableEle);
    }

    /**
     * Load apiStack
     */
    VpBoard.prototype.loadApiStack = function() {
        $(this.parentContainer).find(this.container).html('');

        var apiStackLength = Object.keys(this._apiBoard).length;
        if (apiStackLength === 0) {
            // no _apiBoard available
            return;
        }
        
        var box = this.loadBox(this._apiHead);
        var boxEle = $(box);

        $(this.parentContainer).find(this.container).append(boxEle);
    }

    /*** Get/Set ApiStack ***/
    /** Get api stack 
     * @returns {object} _apiBoard
    */
    VpBoard.prototype.getApiStack = function() {
        return this._apiBoard;
    }

    /**
     * sync api stack with vp-ab-container
     */
    VpBoard.prototype.syncApiStack = function(parentTag = $(this.parentContainer).find(this.container)) {
        this.clearLink();
        this.syncBoard(parentTag);
        this.clearUnchecked();
    }

    //// Lock Visualize ///////////////////////////
    VpBoard.prototype.BeginUpdate = function() {
        this.lock = true;
    }

    VpBoard.prototype.OnUpdate = function() {
        if (this.lock == undefined) {
            this.lock = false;
        }
        return this.lock == true;
    }

    VpBoard.prototype.EndUpdate = function() {
        this.lock = false;
    }
    //// End Lock Visualize /////////////////////////
    
    /**
     * add block
     * @param {Object} blockObj { code: '', type: '', metadata: {} }
     * @returns {number} number of added index
     */
    VpBoard.prototype.addBlock = function(blockObj, linkKey = -1, linkType = 'next') {
        // add on api stack
        // blockObj : { code: '', type: '', metadata: {} }
        // link with prev block
        var prevKey = this.getLastBlockKey();
        if (linkKey >= 0) {
            prevKey = linkKey;
        }

        var newKey = this._boardNewNumber;

        try {
            if (newKey == 0) {
                this._apiHead = 0;
            }
            // add block
            this._apiBoard[newKey] = {
                code: blockObj.code
                , type: blockObj.type
                , metadata: blockObj.metadata
            };
            this._boardNewNumber++;

            if (prevKey >= 0 && blockObj != undefined) {
                this._apiBoard[prevKey][linkType] = newKey;
            }
        } catch {
            this._boardNewNumber = newKey;
            return -1;
        }        

        // appendTo container
        // var box = this.loadBox(idx);
        // var boxEle = $(box);
        // $(this.parentContainer).find(this.container).append(boxEle);

        // bind event
        //this.setDroppableBox(boxEle.find(this.droppableBox));
        //this.setDraggable(boxEle);

        if (!this.OnUpdate()) {
            this.loadApiStack();
        }

        return newKey;
    }

    VpBoard.prototype.addBlockLoop = function(blockObjs, root = -1, link = 'next') {
        var prevKey = root;
        var linkType = link;
        blockObjs.forEach((obj, idx) => {
            prevKey = this.addBlock(obj, prevKey, linkType);
            // child
            if (obj.child != undefined && obj.child.length > 0) {
                this.addBlockLoop(obj.child, prevKey, 'child');
            }
            // left
            if (obj.left != undefined && obj.left.length > 0) {
                this.addBlockLoop(obj.left, prevKey, 'left');
            }
            // right
            if (obj.right != undefined && obj.right.length > 0) {
                this.addBlockLoop(obj.right, prevKey, 'right');
            }
            if (idx == 0) {
                // change link type after first element
                linkType = 'next';
            }
        });
    }

    /**
     * add blocks
     * @param {Array} blockObjs [{ code: '', type: '', metadata: {} }]
     */
    VpBoard.prototype.addBlocks = function(blockObjs, root = -1, link = 'next') {
        try {
            this.BeginUpdate();
            // add blocks
            this.addBlockLoop(blockObjs, root, link);
            this.EndUpdate();
    
            this.loadApiStack();
        } catch {
            this.EndUpdate();
        }
    }

    VpBoard.prototype.getBoardSize = function() {
        var keys = Object.keys(this._apiBoard);
        return keys.length;
    }

    VpBoard.prototype.getBoard = function() {
        return JSON.parse(JSON.stringify(this._apiBoard));
    }

    VpBoard.prototype.setBoard = function(board) {
        this._apiBoard = board;
        this._apiHead = 0;

        this.loadApiStack();
    }

    VpBoard.prototype.setBlockMetadata = function(key, metadata) {
        this._apiBoard[key].metadata = metadata;
    }
    VpBoard.prototype.getBlockMetadata = function(key) {
        return this._apiBoard[key].metadata;
    }

    VpBoard.prototype.setBlockCode = function(key, code) {
        this._apiBoard[key].code = code;
    }

    VpBoard.prototype.getParent = function(childKey) {
        var keys = Object.keys(this._apiBoard);
        var parentKey = -1;
        for (var i = 0; i < keys.length(); i++) {
            var k = keys[i];
            if ((this._apiBoard[k].left == childKey)
                || (this._apiBoard[k].right == childKey)
                || (this._apiBoard[k].child == childKey)) {
                parentKey = k;
                break;
            }
        }
        return parentKey;
    }
    
    /**
     * Get last block's key
     */
    VpBoard.prototype.getLastBlockKey = function() {
        var keys = Object.keys(this._apiBoard);
        if (keys.length > 0) {
            var key = keys[0];
            var lastKey;
            while (key >= 0 && key != undefined) {
                lastKey = key;
                key = this._apiBoard[key].next;
            }
            return lastKey;
        }
        return -1;
    }

    VpBoard.prototype.getLastBlockValue = function(key) {
        try {
            var lastKey = this.getLastBlockKey();
            var blockValue = this._apiBoard[lastKey][key];
        } catch {
            return -1;
        }
        return blockValue;
    }

    VpBoard.prototype.removeLastBlock = function() {
        var lastBlockKey = this.getLastBlockKey();

        this.removeBlock(lastBlockKey);

        this.loadApiStack();
    }

    VpBoard.prototype.removeBlock = function(key, isChild = false) {
        var keys = Object.keys(this._apiBoard);
        // remove link
        keys.forEach(k => {
            if (this._apiBoard[k].next == key) {
                this._apiBoard[k].next = this._apiBoard[key].next;
            } else if (this._apiBoard[k].left == key) {
                this._apiBoard[k].left = -1;
            } else if (this._apiBoard[k].right == key) {
                this._apiBoard[k].right = -1;
            } else if (this._apiBoard[k].child == key) {
                this._apiBoard[k].child = -1;
            }
        });

        // find child
        var block = this._apiBoard[key];
        if (isChild && block.next != undefined && block.next >= 0) {
            this.removeBlock(block.next, true);
        }
        if (block.child != undefined && block.child >= 0) {
            this.removeBlock(block.child, true);
        }
        if (block.left != undefined && block.left >= 0) {
            this.removeBlock(block.left, true);
        }
        if (block.right != undefined && block.right >= 0) {
            this.removeBlock(block.right, true);
        }
        if (key == 0) {
            this._apiHead = 0;
            this._apiBoard = {};
            this._boardNewNumber = 0;
        } else {
            delete this._apiBoard[key];
        }
    }


    VpBoard.prototype.setBlockClickEvent = function(callback = undefined) {
        var that = this;
        var draggable = this.draggable;
        var draggableInbox = this.draggableInbox;

        // click - selection
        $(document).on('click', draggable, function(event) {
            event.stopPropagation();
            if ($(this).hasClass(draggableInbox.substr(1))) {
                $(draggable).removeClass('selected');
                $(this).addClass('selected');
                if (callback != undefined) {
                    callback(this, event);
                }
            }
        });
    }


    return VpBoard;
});
