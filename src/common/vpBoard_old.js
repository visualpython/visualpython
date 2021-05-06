define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/container/vpContainer'
], function (requirejs, $, vpConst, vpContainer) {
    "use strict";

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
    var _apiBoard =  {
        // TEST:
        0: { code: 'df_train', type: 'var', next: 1, metadata: { funcID: 'com_variables', prefix: [], postfix: [], options: [] } },
        1: { code: '[]', type: 'brac', next: 2, child: 4 },
        2: { code: '[]', type: 'brac', next: 3, child: 11 },
        3: { code: '.median()', type: 'api', next: -1, metadata: { funcID: 'pdGrp_median', prefix: [], postfix: [], options: [] } },
        4: { code: '&', type: 'oper', left: 5, right: 6 },
        5: { code: "==", type: 'oper', left: 7, right: 8 }, 
        6: { code: "==", type: 'oper', left: 9, right: 10 },
        7: { code: "df_train['Sex']", type: 'var', metadata: { funcID: 'com_variables', prefix: [], postfix: [], options: [] } },
        8: { code: "'male'", type: 'code', metadata: { funcID: 'com_udf', prefix: [], postfix: [], options: [ { id: 'vp_userCode', value: "'male'"} ] } },
        9: { code: "df_train['Pclass']", type: 'var', metadata: { funcID: 'com_variables', prefix: [], postfix: [], options: [] } },
        10: { code: "1", type: 'code', metadata: { funcID: 'com_udf', prefix: [], postfix: [], options: [ { id: 'vp_userCode', value: "1"} ] } },
        11: { code: "'Age'", type: 'code', metadata: { funcID: 'com_udf', prefix: [], postfix: [], options: [ { id: 'vp_userCode', value: "'Age'"} ] } }
    }
    var _apiHead = 0;
    var _boardNewNumber = Object.keys(_apiBoard).length;

    /**
     * TEST: minju: api board test
     * API Board
     * 1. set draggable event to .vp-ab-box
     * 2. set drag box information
     *  1) 
     */

    /** FIXME: move to constants.js : VpBoard const variables */
    const VP_PARENT_CONTAINER   = '#vp_optionLoadArea'; //'.vp-option-page';
    const VP_DRAGGABLE          = '.vp-ab-box';
    const VP_DRAGGABLE_INBOX    = '.vp-ab-inbox';
    const VP_CONTAINER          = '.vp-ab-container';
    const VP_DROPPABLE_BOX      = '.vp-ab-droppable-box';
    const VP_BOX_MENU_ID        = '#vp_abBoxMenu';
    const VP_BOX_SELECTOR_ID    = '#vp_abBoxSelector';

    const VP_BOX_MENU_TAG     = ``;
    const VP_BOX_SELECTOR_TAG = ``;
    const VP_CONTAINER_TAG      = `<div class="vp-ab-area">
                                        <div class="vp-ab-container" title="right click to add blocks">
                                            <span class="vp-ab-container-helper">Drag api here</span>
                                        </div>
                                        <!--
                                        <div class="vp-ab-sidebar">
                                            <i id="vp_toggleContainer" class="vp-ab-toggle-container vp-fa fa fa-compress" title="compress box"></i>
                                            <i id="vp_runMultiCode" class="vp-ab-run-multi-code vp-fa fa fa-play" title="run code"></i>
                                        </div>
                                        -->
                                    </div>`;
    const VP_DRAGGABLE_TAG      = `<span id="{id}" class="${VP_DRAGGABLE.substr(1)} ${VP_DRAGGABLE_INBOX.substr(1)} {type} no-selection" data-type="{type}" data-idx="{idx}">{code}</span>`


    const VP_BOX_ID_PREFIX      = 'vp_ab_box_';

    /**
     * Clear apiStack
     */
    var clear = function() {
        _apiBoard = {};
        _apiHead = 0;
    }

    /**
     * Clear apiStack Link
     */
    var clearLink = function() {
        Object.keys(_apiBoard).forEach(key => {
            delete _apiBoard[key].next;
            delete _apiBoard[key].child;
            delete _apiBoard[key].left;
            delete _apiBoard[key].right;
            delete _apiBoard[key].checksum;
        })
    }

    /**
     * remove not using keys
     */
    var clearUnchecked = function() {
        var keys = Object.keys(_apiBoard);
        for(var i = 0; i < keys.length; i++) {
            if (_apiBoard[keys[i]].checksum != true) {
                delete _apiBoard[keys[i]];
            }
        }
    }

    /**
     * Load Box recursively
     * @param {number} pointer 
     * @param {string} prevBox Tag Element string
     */
    var loadBox = function(pointer, prevBox = '') {
        if (pointer == undefined || pointer < 0) {
            return "";
        }
        var block = _apiBoard[pointer];

        var box = VP_DRAGGABLE_TAG;
        box = box.replace('{id}', VP_BOX_ID_PREFIX + pointer);
        box = box.replaceAll('{type}', block.type);
        box = box.replace('{idx}', pointer);

        var code = block.code;
        
        if (block.type == "brac") {
            var child = loadBox(block.child);
            // brackets [] ()
            if (block.code === "[]") {
                code = `<span class="vp-ab-code">[</span>
                        <span class="vp-ab-droppable-box" data-type="${block.type}" data-idx="${pointer}" data-link="child">${child}</span>
                        <span class="vp-ab-code">]</span>`
            } else {
                code = `<span class="vp-ab-code">(</span>
                        <span class="vp-ab-droppable-box" data-type="${block.type}" data-idx="${pointer}" data-link="child">${child}</span>
                        <span class="vp-ab-code">)</span>`
            }
        } else if (block.type == "oper") {
            // operator + - / * & | == != < <= > >=
            var left = loadBox(block.left);
            var right = loadBox(block.right);
            // code = `(${left} ${block.code} ${right})`
            code = `
            <span class="vp-ab-code">(</span>
            <span class="vp-ab-droppable-box left" data-type="${block.type}" data-idx="${pointer}" data-link="left">${left}</span>
            <span class="vp-ab-code">${block.code}</span>
            <span class="vp-ab-droppable-box right" data-type="${block.type}" data-idx="${pointer}" data-link="right">${right}</span>
            <span class="vp-ab-code">)</span>
            `;
        } else {
            // var, code, api
            code = `<span class="vp-ab-code">${block.code}</span>`
        }
        box = box.replace('{code}', code);
        box = prevBox + box;
        if (block.next != undefined && block.next >= 0) {
            box = loadBox(block.next, box);
        }
        return box;
    }

    /**
     * Synchronize container & _apiBoard
     * @param {HTMLElement} parentTag 
     */
    var syncApiStack = function(parentTag) {
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

                _apiBoard[key].checksum = true;
    
                if (i == 0) {
                    // first child set to child/left/right
                    if (parentKey == undefined) {
                        _apiHead = key;
                    } else {
                        _apiBoard[parentKey][parentLink] = key;
                    }
                }

                // if type is brac or oper
                if (type == 'brac') {
                    var boxTag = $(childTag).children(VP_DROPPABLE_BOX);
                    // link to child
                    syncApiStack($(boxTag));
                } else if (type == 'oper') {
                    var leftTag = $(childTag).children(VP_DROPPABLE_BOX + '.left');
                    var rightTag = $(childTag).children(VP_DROPPABLE_BOX + '.right');
                    // link to left/right children
                    syncApiStack($(leftTag));
                    syncApiStack($(rightTag));
                }
                
                if (prevKey >= 0) {
                    _apiBoard[prevKey].next = key;
                }
                // _apiBoard[key].prev = prevKey;
                prevKey = key;
            }
        } else {
            // no child
            if (parentKey == undefined) {
                _apiHead = key;
            } else {
                _apiBoard[parentKey][parentLink] = -1;
            }
        }
    }

    /**
     * @class VpBoard
     * @param {string} parentContainer
     * @constructor
     */
    var VpBoard = function (page, parentContainer = VP_PARENT_CONTAINER) {
        this.page = page;

        this.parentContainer = parentContainer //page.wrapSelector(''); // '#vp_optionBook'
        this.draggable      = VP_DRAGGABLE;
        this.draggableInbox = VP_DRAGGABLE_INBOX;
        this.container      = VP_CONTAINER;
        this.droppableBox   = VP_DROPPABLE_BOX;

        this.popBoxSelector = VP_BOX_SELECTOR_ID;
        this.popBoxMenu     = VP_BOX_MENU_ID;

        this.containerTag   = VP_CONTAINER_TAG;
        this.draggableTag   = VP_DRAGGABLE_TAG;
    }

    VpBoard.prototype.getCode = function(container = this.container) {
        console.log('getCode', container);

        // TODO: run cell : $('.vp-ab-container .vp-ab-code').text().replaceAll(/\r?\n|\r/g, '').trim()
        var code = $(container).find(' .vp-ab-code').text().replaceAll(/\r?\n|\r/g, '').trim();
        return code;
    }

    /**
     * Load container & apiStack boxes
     */
    VpBoard.prototype.load = function() {

        // clean container
        $('.vp-ab-area').remove();

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

        // expand & compress container event
        $('#vp_toggleContainer').click(function() {
            // fa-expand <-> fa-compress class toggle
            // container hide and show

            if ($(this).hasClass('fa-compress')) {
                // compress container
                $(that.container).hide();

                $(this).attr({ title: 'expand box'});
                $(this).removeClass('fa-compress');
                $(this).addClass('fa-expand');

            } else if ($(this).hasClass('fa-expand')) {
                // expand container
                $(that.container).show();

                $(this).attr({ title: 'compress box'});
                $(this).removeClass('fa-expand');
                $(this).addClass('fa-compress');
                
            }

        });

        // run multi code on selected cell event
        $('#vp_runMultiCode').click(function() {
            var code = that.getCode();
            // run cell
            that.page.cellExecute(code, true);
        })


        // load box selector
        // var boxSelectorTag = `<!-- box selector -->
        // <div id="vp_abBoxSelector" class="vp-ab-popup no-selection">
        //   <span><strong>Add block</strong></span>
        //   <div class="vp-ab-popup-box">
        //     <span class="vp-ab-popup-item brac no-selection" data-type="brac">[]</span>
        //     <span class="vp-ab-popup-item brac no-selection" data-type="brac">()</span>
        //   </div>
        //   <div class="vp-ab-popup-box">
        //     {oper}
        //   </div>
        // </div>`;
        var boxSelectorTag = `<!-- box selector -->
            <div id="vp_abBoxSelector" class="vp-ab-popup no-selection">
                <ul class="vp-ab-popup-box">
                    <li class="vp-ab-popup-item brac no-selection" data-type="brac">[]</li>
                    <li class="vp-ab-popup-item brac no-selection" data-type="brac">()</li>
                    <li class="vp-ab-popup-item code no-selection" data-type="code">
                        <input id="vp_abBoxCode" type="text" placeholder="code" focus/>
                    </li>
                </ul>
                <ul class="vp-ab-popup-box">
                    {oper}
                </ul>
                <ul class="vp-ab-popup-box">
                    <li class="vp-ab-popup-item remove no-selection" data-type="remove"><i class="vp-fa fa fa-remove"></i> remove all blocks</li>
                    <!-- <li class="vp-ab-popup-item test no-selection" data-type="test">(TEST)API STACK</li> -->
                </ul>
            </div>
        `;
        var operList = ['==', '!=', '&', '|', '<', '<=', '>', '>='];
        var operTag = '';
        operList.forEach(oper => {
            // operTag += `<span class="vp-ab-popup-item oper no-selection" data-type="oper">${oper}</span>`;
            operTag += `<li class="vp-ab-popup-item oper no-selection" data-type="oper">${oper}</li>`;
        });
        boxSelectorTag = boxSelectorTag.replaceAll('{oper}', operTag);
        // add box selector container
        $('.vp-ab-area').prepend($(boxSelectorTag));

        // popup menu - box selector
        droppableEle.contextmenu(function(event) {
            event.preventDefault();
            $('.vp-ab-popup').hide();
            if (event.target.className.includes('vp-ab-container')) {
                // calculate left & top
                // var boxSize = { width: $('#vp_abBoxSelector').outerWidth(), height: $('#vp_abBoxSelector').outerHeight() }
                var boxSize = { width: 120, height: 70 };
                var boxPosition = { position: 'fixed', left: event.pageX + 10, top: event.pageY + 10 };
                if (event.pageX + boxSize.width > window.innerWidth) {
                    boxPosition.left = event.pageX - boxSize.width;
                }
                if (event.pageY + boxSize.height > window.innerHeight) {
                    boxPosition.top = event.pageY - boxSize.height - 20;
                }

                $('#vp_abBoxSelector').css({
                    // position: 'fixed',
                    // left: event.pageX,
                    // top: event.pageY + 10
                    ...boxPosition
                });
                $('#vp_abBoxSelector').show();
                return false;
            }
        });

        // popup menu - box selector item click
        $('#vp_abBoxSelector .vp-ab-popup-item').click(function() {
            var type = $(this).data('type');

            if (type == 'remove') {
                // remove all block
                $(that.draggable).remove();
                _apiBoard = {}; // FIXME: make as method
                that.syncApiStack();
            } else if (type == 'test') {
                // TEST:
                console.log('apiStack', _apiBoard);
            } else {
                // add block to container
                var blockObj = { 
                    code: $(this).text(), 
                    type: $(this).data('type')
                };
    
                that.addBlock(blockObj);
            }
        });


        // load box menu
        var boxMenuTag = `<!-- box menu -->
        <div id="vp_abBoxMenu" class="vp-ab-popup">
            <div class="vp-ab-popup-box">
            <span class="vp-ab-popup-menu no-selection" data-menu="load"><i class="vp-fa fa fa-external-link"></i> option page</span>
            </div>
            <div class="vp-ab-popup-box">
            <span class="vp-ab-popup-menu no-selection" data-menu="run"><i class="vp-fa fa fa-play"></i> run block</span>
            </div>
            <div class="vp-ab-popup-box">
            <span class="vp-ab-popup-menu no-selection" data-menu="remove"><i class="vp-fa fa fa-remove"></i> remove</span>
            </div>
        </div>`;
        // add box menu container
        $('.vp-ab-area').prepend($(boxMenuTag));

        // popup menu - box menu item click
        $('#vp_abBoxMenu .vp-ab-popup-menu').click(function(event) {
            event.stopPropagation();
            var menu = $(this).data('menu');
            var type = $(that.popBoxMenu).attr('data-type');
            var idx = $(that.popBoxMenu).attr('data-idx');
            var block = _apiBoard[idx];

            if (menu == 'load') {
                // load
                // sync _apiBoard
                that.syncApiStack();

                // FIXME: go to funcID page (block.metadata.funcID)
                block.metadata && vpContainer.loadOption(block.metadata.funcID, function(funcJS) {
                    // load saved data (block.metadata)
                    vpContainer.optionPageLoadCallbackWithData(funcJS, block.metadata);
                });

            } else if (menu == 'run') {
                // run
                var code = that.getCode('#' + VP_BOX_ID_PREFIX + idx);
                that.page.cellExecute(code, true);
            } else if (menu == 'remove') {
                // remove
                // delete _apiBoard[idx];
                $('#' + VP_BOX_ID_PREFIX + idx).remove();

                // sync _apiBoard
                that.syncApiStack();
            }
            $(that.popBoxMenu).hide();
        });
        

        // popup menu disappear
        $('body').on('click', function(event) {
            var target = event.target;
            if (target.id !== 'vp_abBoxSelector') {
                $('#vp_abBoxSelector').hide();
                $('#vp_abBoxMenu').hide();
            }
        });

        this.setDroppableContainer();
        this.setDroppableBox(droppableBoxEle);
        this.setDraggable($(this.draggable));
    }

    /**
     * Load apiStack
     */
    VpBoard.prototype.loadApiStack = function() {
        var apiStackLength = Object.keys(_apiBoard).length
        if (apiStackLength === 0) {
            // no _apiBoard available
            return;
        }
        
        var box = loadBox(_apiHead);
        var boxEle = $(box);

        $(this.container).append(boxEle);

        // this.setDraggable($(this.draggable));
        // this.setDroppableBox($(this.droppableBox));

        this.setDroppableBox(boxEle.find(this.droppableBox));
        this.setDraggable($(this.container).find(this.draggable));
    }

    /*** Get/Set ApiStack ***/
    /** Get api stack 
     * @returns {object} _apiBoard
    */
    VpBoard.prototype.getApiStack = function() {
        return _apiBoard;
    }

    /**
     * sync api stack with vp-ab-container
     */
    VpBoard.prototype.syncApiStack = function(parentTag = $(this.container)) {
        clearLink();
        syncApiStack(parentTag);
        clearUnchecked();
    }
    
    VpBoard.prototype.addBlock = function(blockObj) {
        // add on api stack
        // blockObj : { code: '', type: '', metadata: {} }

        var idx = _boardNewNumber++;
        _apiBoard[idx] = blockObj;

        // appendTo container
        var box = loadBox(idx);

        var boxEle = $(box);

        $(this.container).append(boxEle);

        // bind event
        this.setDroppableBox(boxEle.find(this.droppableBox));
        this.setDraggable(boxEle);

        this.syncApiStack();
    }

    

    /**
     * set droppable to va-ma-container
     * @param {Element} droppableEle
     */
    VpBoard.prototype.setDroppableContainer = function() {
        var droppableEle = $(this.container);
        var that = this;
        var draggable = this.draggable;
        var draggableInbox = this.draggableInbox;
        var droppableBox = this.droppableBox;

        droppableEle.on('dragover', function(event) {
            event.preventDefault();
        });
        
        droppableEle.sortable({
            connectWith: droppableBox,
            sort: function(event, ui) {
                console.log('sort');
            },
            update: function(event, ui) {
                console.log('update');
                // update occurs when element position changed

            }
        });
        droppableEle.droppable({
            accept: draggable,
            // accept: function(obj) {
            //     if (obj.hasClass(draggable.substr(1))) {
            //         return true;
            //     }
            //     return true;
            // },
            activate: function(event, ui) {
                //event.stopPropagation();
            },
            deactivate: function(event, ui) {
                //event.stopPropagation();
            },
            drop: function(event, ui) {
                //event.stopPropagation();
                console.log('drop to container');
                var targetEle = event.target;
                var sourceEle = ui.draggable;

                if ($(sourceEle).hasClass(draggableInbox.substr(1))) {
                    console.log('move box');
                    // move box
                    sourceEle.appendTo(targetEle);
                } else {
                    console.log('new box');
                    // new box
                    var cloneEle = $(sourceEle).clone(true);
    
                    $(cloneEle).addClass(draggableInbox.substr(1));

                    // connect with _apiBoard
                    var idx = Object.keys(_apiBoard).length;
                    $(cloneEle).attr({id: VP_BOX_ID_PREFIX + idx});

                    var apiObj = {
                        code: 'df_train', type: 'var', prev: -1, next: 1
                    }


                    cloneEle.appendTo(targetEle);
                    // that.setDraggable($(cloneEle));
                }

            },
            over: function(event, ui) {
                //event.stopPropagation();
            }
        });
    }

    VpBoard.prototype.setDroppableBox = function(droppableBoxEle) {
        var that = this;
        var draggable = this.draggable;
        var draggableInbox = this.draggableInbox;

        droppableBoxEle.on('dragover', function(event) {
            event.preventDefault();
        });
        
        droppableBoxEle.sortable({
            connectWith: this.container,
            sort: function(event, ui) {
                console.log('sort');
            },
            update: function(event, ui) {
                console.log('update');
                // update occurs when element position changed

            }
        });
        droppableBoxEle.droppable({
            accept: draggable,
            activate: function(event, ui) {
                //event.stopPropagation();
            },
            deactivate: function(event, ui) {
                //event.stopPropagation();
            },
            drop: function(event, ui) {
                //event.stopPropagation();
                console.log('drop');
                var targetEle = event.target;
                var sourceEle = ui.draggable;

                if ($(sourceEle).hasClass(draggableInbox.substr(1))) {
                    // move box
                    sourceEle.appendTo(targetEle);
                } else {
                    // new box
                    var cloneEle = $(sourceEle).clone(true);

                    // new number
    
                    $(cloneEle).addClass(draggableInbox.substr(1));
                    $(cloneEle).attr({id: VP_BOX_ID_PREFIX + _boardNewNumber++});
                    cloneEle.appendTo(targetEle);
                }

            },
            over: function(event, ui) {
                event.stopPropagation();
            }
        });
    }

    /**
     * set draggable to every va-ma-box
     * @param {Element} draggableEle
     */
    VpBoard.prototype.setDraggable = function(draggableEle) {
        var that = this;
        var draggable = this.draggable;
        var draggableInbox = this.draggableInbox;

        // set draggable item
        draggableEle.draggable({
            connectToSortable: VP_CONTAINER_TAG,
            containment: $(this.parentContainer),
            // appendTo: $('.vp-ab-container'),
            revert: 'invalid',
            // helper: 'clone',
            helper: function() {
                // custom helper tag
                return $('<span class="vp-ab-box-helper">|</span>');
            },
            cursor: 'pointer',
            opacity: 0.7,
            cursorAt: { // cursor on bottom-right
                top: 5,
                left: 5
            },
            // snap: draggable,
            start: function(event, ui) {
                //event.stopPropagation();
                // drag start
                ui.helper.addClass('helper');
                if ($(this).hasClass('selected')) {
                    $(this).removeClass('selected');
                } else {
                    $(draggable).removeClass('selected');
                    $(this).addClass('selected');
                }
            },
            stop: function(event, ui) {
                //event.stopPropagation();
                // drag stops
            },
            change: function(event) {
                //event.stopPropagation();
                // on change
            }
        });

        // click - selection
        draggableEle.on('click', function(event) {
            event.stopPropagation();
            $('.vp-ab-popup').hide();
            // select
            if ($(this).hasClass(draggableInbox.substr(1))) {
                // if ($(this).hasClass('selected')) {
                //     $(this).removeClass('selected');
                // } else {
                    $(draggable).removeClass('selected');
                    $(this).addClass('selected');

                    // show popup menu

                    // calculate left & top
                    // var boxSize = { width: $(that.popBoxMenu).outerWidth(), height: $(that.popBoxMenu).outerHeight() }
                    var boxSize = { width: 90, height: 60 };
                    var boxPosition = { position: 'fixed', left: event.pageX + 10, top: event.pageY + 10 };
                    if (event.pageX + boxSize.width > window.innerWidth) {
                        boxPosition.left = event.pageX - boxSize.width;
                    }
                    if (event.pageY + boxSize.height > window.innerHeight) {
                        boxPosition.top = event.pageY - boxSize.height - 20;
                    }

                    $(that.popBoxMenu).css({
                        // position: 'fixed',
                        // left: event.pageX,
                        // top: event.pageY + 10
                        ...boxPosition
                    });

                    // set data to popup menu
                    var type = $(this).attr('data-type');
                    var idx = $(this).attr('data-idx');
                    $(that.popBoxMenu).attr({
                        'data-type': type,
                        'data-idx': idx
                    });

                    $(that.popBoxMenu).show();
                    if (['api', 'var', 'code'].includes($(this).data('type'))) {
                        $(that.popBoxMenu).find('.vp-ab-popup-box:nth-child(1)').show();
                    } else {
                        $(that.popBoxMenu).find('.vp-ab-popup-box:nth-child(1)').hide();
                    }
                    // show popup menu
                    
                // }
            }

        });

        // double click
        // show selectable api list? / option page?
        draggableEle.on('dblclick', function(event) {
            event.stopPropagation();
            // remain selected
            if ($(this).hasClass(draggableInbox.substr(1))) {
                $(draggable).removeClass('selected');
                $(this).addClass('selected');
            }

            var type = $(this).data('type');
            var idx = $(this).data('idx');
            var block = _apiBoard[idx];
            if (type == 'api' || type == 'var' || type == 'code') {
                // sync _apiBoard
                that.syncApiStack();

                // FIXME: go to funcID page (block.metadata.funcID)
                block.metadata && vpContainer.loadOption(block.metadata.funcID, function(funcJS) {
                    // load saved data (block.metadata)
                    vpContainer.optionPageLoadCallbackWithData(funcJS, block.metadata);
                });
            }

        });
    }

    return VpBoard;
});
