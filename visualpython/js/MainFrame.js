/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : MainFrame.js
 *    Author          : Black Logic
 *    Note            : Render and load main frame
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// Load main frame
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/mainFrame.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/mainFrame'), // INTEGRATION: unified version of css loader

    // load module
    './com/com_Config',
    './com/com_Const',
    './com/com_Event',
    './com/component/PopupComponent',
    './menu/MenuFrame',
    './board/BoardFrame'
], function(vpHtml, vpCss, com_Config, com_Const, com_Event, PopupComponent, 
            MenuFrame, BoardFrame) {
	'use strict';

    // visualpython minimum width
    const { 
        JUPYTER_HEADER_SPACING,
        VP_MIN_WIDTH, 
        MENU_MIN_WIDTH,
        BOARD_MIN_WIDTH,
        MENU_BOARD_SPACING
    } = com_Config;

    const { 
        TOOLBAR_BTN_INFO,
        JUPYTER_NOTEBOOK_ID,
        JUPYTER_HEADER_ID
    } = com_Const;

    class MainFrame {
        constructor() {
            this.$pageDom = null;
            this._menuFrame = null;
            this._boardFrame = null;
            this._nowTask = null;
            this._focusedPage = null;
            
            // Task bar options list
            this._taskPopupList = [];
            this._blockPopupList = [];

            // page info
            this.minWidth = VP_MIN_WIDTH;
            this.width = VP_MIN_WIDTH;
        }
        //========================================================================
        // Internal call function
        //========================================================================
        /**
         * Bind event for inner components under vp_wrapper
         */
        _bindEvent() {
            var that = this;

            // window resize event
            $(window).resize(function(evt){
                that._resizeWindow();
            });

            // CHROME: colab header toggle
            if (vpConfig.extensionType === 'colab') {
                $('#toggle-header-button').click(function(evt) {
                    console.log('[vp] click toggle header ')
                    // change height
                    let colabHeaderVisible = $('#header').is(':visible');
                    let colabHeaderHeight = $('#header').height() * colabHeaderVisible;
                    let colabFooterHeight = $('colab-status-bar').height();

                    let colabHeight = colabHeaderHeight + colabFooterHeight + 2;

                    $('#vp_wrapper').css( { 
                        height:  'calc(100% - ' + colabHeight + 'px)',
                        top: colabHeaderHeight + 'px' 
                    });
                });
            }

            window.vpEvent = new com_Event(this);
        }

        /**
         * Bind $.resizable event
         * // TODO: get a param to re-position vp_wrapper to the left or right
         */
        _bindResizable() {
            var that = this;

            // get visualpython minimum width
            // resizable setting
            // $('#vp_wrapper').resizable('disable');
            if (vpConfig.extensionType !== 'lab') {
                $('#vp_wrapper').resizable({
                    // alsoResize: '#vp_menuFrame',
                    helper: 'vp-wrapper-resizer',
                    handles: 'w',
                    // resizeHeight: false,
                    minWidth: this.minWidth,
                    // maxWidth: 0,
                    start: function(event, ui) {
                        
                    },
                    resize: function(event, ui) {
                        // resize #vp_wrapper with currentWidth and resize jupyter area
                        var currentWidth = ui.size.width;
                        that._resizeVp(currentWidth);
                    },
                    stop: function(event, ui) {
                        $('#vp_wrapper').css({'left': '', 'height': ''});
                    }
                });  
            }
        }

        _resizeWindow() {
            // CHROME: resize colab
            if (vpConfig.extensionType === 'notebook') {
                let jupyterHeadHeight = $('#' + JUPYTER_HEADER_ID).height();
                let jupyterBodyHeight = $('#' + JUPYTER_NOTEBOOK_ID).height();

                let vpWidth = $('#vp_wrapper')[0].getBoundingClientRect().width;
                let vpHeight = $(window).height() - jupyterHeadHeight;

                $('#vp_wrapper').css( { height: vpHeight + 'px' });
                this._resizeNotebook(vpWidth);
            } else if (vpConfig.extensionType === 'colab') {
                let colabHeaderVisible = $('#header').is(':visible');
                let colabHeaderHeight = $('#header').height() * colabHeaderVisible;
                let colabFooterHeight = $('colab-status-bar').height();

                let colabHeight = colabHeaderHeight + colabFooterHeight + 2;

                let vpWidth = $('#vp_wrapper')[0].getBoundingClientRect().width;

                $('#vp_wrapper').css( { 
                    height:  'calc(100% - ' + colabHeight + 'px)',
                    top: colabHeaderHeight + 'px'
                });
                this._resizeNotebook(vpWidth);
            } else if (vpConfig.extensionType === 'lab') {
                // LAB: do nothing
            }
        }

        _resizeVp(currentWidth) {
            // calculate inner frame width
            var menuWidth = $('#vp_menuFrame').width();
            var boardWidth = 0;
            var showBoard = $('#vp_boardFrame').is(':visible');
            if (showBoard) {
                boardWidth = currentWidth - menuWidth - MENU_BOARD_SPACING;
                if (boardWidth < BOARD_MIN_WIDTH + MENU_BOARD_SPACING) {
                    boardWidth = BOARD_MIN_WIDTH;
                    menuWidth = currentWidth - (BOARD_MIN_WIDTH + MENU_BOARD_SPACING);
                }
            } else {
                // resize menuWidth if board is hidden
                menuWidth = currentWidth - MENU_BOARD_SPACING;
            }
            $('#vp_menuFrame').width(menuWidth);
            $('#vp_boardFrame').width(boardWidth);

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'resizing wrapper to ', currentWidth, 'with', menuWidth, boardWidth);

            $('#vp_wrapper').width(currentWidth);

            // save current page info
            vpConfig.setMetadata({
                vp_position: { width: currentWidth },
                vp_menu_width: menuWidth,
                vp_note_width: boardWidth
            });

            this._resizeNotebook(currentWidth);
        }

        /**
         * Resize jupyternotebook
         */
        _resizeNotebook(vpWidth) {
            let baseWidth = $(window).width();

            // manual padding between notebook and visualpython area
            const DIV_PADDING = 2;
            // if vp area is available, add padding
            if (vpWidth > 0) {
                vpWidth += DIV_PADDING;
            }
            // calculate notebook resizing width
            let nbWidth = baseWidth - vpWidth;
            let nbContainerWidth = nbWidth - 60;
            // apply resized width
            // CHROME: resize colab
            if (vpConfig.extensionType === 'notebook') {
                $('#' + JUPYTER_NOTEBOOK_ID).css({ 'width': nbWidth + 'px' });
                $('#notebook-container').css({ 'width': nbContainerWidth + 'px' });
            } else if (vpConfig.extensionType === 'colab') {
                $('.notebook-horizontal').css({ 'width': nbWidth + 'px' });
                // $('#notebook-container').css({ 'width': nbContainerWidth + 'px' });
            }
        }

        _getMenuGroupRootType(menu) {
            // ex) visualpython - apps - frame
            let path = menu.path;
            let pathList = path.split(' - ');
            return pathList[1];
        }

        //========================================================================
        // External call function
        //========================================================================
        renderMainFrame() {
            this.$pageDom = $(vpHtml);
            this.$pageDom.addClass(vpConfig.extensionType);
            return this.$pageDom;
        }
        afterAttach() {
            // set vp width using metadata
            let metadata = vpConfig.getMetadata();
            let { vp_position, vp_note_display, vp_menu_width, vp_note_width } = metadata;
            if (vp_position) {
                $('#vp_wrapper').width(vp_position.width);
            }

            if (!vp_note_display) {
                this.minWidth = MENU_MIN_WIDTH + MENU_BOARD_SPACING;
            }
            
            // load menu & board
            this._menuFrame = new MenuFrame($('#vp_wrapper'), 
                { vp_menu_width: vp_menu_width }, 
                { parent: this }
            );
            this._boardFrame = new BoardFrame($('#vp_wrapper'), 
                { vp_note_display: vp_note_display, vp_note_width: vp_note_width }, 
                { parent: this }
            );
            
            // consider height and width
            this._resizeWindow();
            
            // bind event
            this._bindEvent();
            this._bindResizable();
        }
        /**
         * Load main frame
         */
        loadMainFrame() {
            // load vp_wrapper into jupyter base
            this.renderMainFrame();
            
            // prepend
            $(this.$pageDom).prependTo(document.body);

            this.afterAttach();

            return this.$pageDom;
        }

        toggleVp() {
            let vpDisplay = $('#vp_wrapper').is(':visible');
            let vpWidth = $('#vp_wrapper')[0].clientWidth;

            let metadata = vpConfig.getMetadata();
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'toggle vp with metadata', metadata);
            let { vp_position, vp_menu_width, vp_note_width, vp_note_display } = metadata;
            let newMetadata = { vp_section_display: !vpDisplay };
            if (vpDisplay) {
                // hide
                vpWidth = 0;
                $('#vp_wrapper').hide();
            } else {
                // show
                if (!vp_position || vp_position.width <= 0) {
                    vpWidth = (vp_menu_width + vp_note_width + MENU_BOARD_SPACING);
                    if (!vpWidth) {
                        vpWidth = com_Config.MENU_MIN_WIDTH + (vp_note_display? com_Config.BOARD_MIN_WIDTH: 0) + com_Config.MENU_BOARD_SPACING;
                    }
                    newMetadata['vp_position'] = { width: vpWidth };
                    $('#vp_wrapper').css({ width: vpWidth });
                } else {
                    vpWidth = vp_position.width;
                }
                $('#vp_wrapper').show();
            }

            // set current width
            vpConfig.setMetadata(newMetadata);

            this._resizeNotebook(vpWidth);

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'vp toggled');
        }

        openVp() {
            $('#vp_wrapper').show();

            if ($('#vp_wrapper').length > 0) {
                let vpWidth = $('#vp_wrapper')[0].clientWidth;
                this._resizeNotebook(vpWidth);
            }

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'vp opened');
        }

        //========================================================================
        // Child components control function
        //========================================================================

        toggleNote() {
            let vpWidth = $('#vp_wrapper')[0].getBoundingClientRect().width;
            let newVpWidth = vpWidth;
            let menuWidth = $('#vp_menuFrame')[0].getBoundingClientRect().width;

            let isNoteVisible = $('#vp_boardFrame').is(':visible');
            if (isNoteVisible) {
                // hide note
                this.boardFrame.hide();
                newVpWidth = menuWidth + MENU_BOARD_SPACING;
                $('#vp_wrapper').width(newVpWidth);
                if (vpConfig.extensionType === 'lab') {
                    // LAB: set parent width and position, min-width
                    let target = $('#vp_wrapper').parent();
                    let prevWidth = target[0].getBoundingClientRect().width;
                    let prevLeft = $(target).position().left;
                    let widthDiff = newVpWidth - vpWidth;
                    $(target).css({
                        width: prevWidth + widthDiff,
                        left: prevLeft - widthDiff
                    });
                    $('#vp_wrapper').attr('style', `min-width: ${MENU_MIN_WIDTH + MENU_BOARD_SPACING}px !important`);
                    if (vpLab.shell.rightCollapsed == false) {
                        vpLab.shell.collapseRight();
                        vpLab.shell.expandRight();
                    }
                    let relativeSizes = vpLab.shell._hsplitPanel.layout.relativeSizes();
                    let absoluteSizes = vpLab.shell._hsplitPanel.layout.absoluteSizes();
                    let newSize = absoluteSizes[1] - widthDiff;
                    let totalWidth = absoluteSizes.reduce((x, a) => x + a, 0);
                    vpLab.shell._hsplitPanel.layout.setRelativeSizes([relativeSizes[0], newSize/totalWidth, newVpWidth/totalWidth]);
                } else {
                    $('#vp_wrapper').resizable({ minWidth: MENU_MIN_WIDTH + MENU_BOARD_SPACING });
                }
                this.menuFrame._unbindResizable();
                
            } else {
                // show note
                this.boardFrame.show();
                newVpWidth = vpWidth + BOARD_MIN_WIDTH + MENU_BOARD_SPACING;
                $('#vp_wrapper').width(newVpWidth);
                if (vpConfig.extensionType === 'lab') {
                    // LAB: set parent width and position, min-width
                    let target = $('#vp_wrapper').parent();
                    let prevWidth = target[0].getBoundingClientRect().width;
                    let prevLeft = $(target).position().left;
                    let widthDiff = newVpWidth - vpWidth;
                    $(target).css({
                        width: prevWidth + widthDiff,
                        left: prevLeft - widthDiff
                    });
                    $('#vp_wrapper').attr('style', `min-width: ${VP_MIN_WIDTH}px !important`);
                    if (vpLab.shell.rightCollapsed == false) {
                        vpLab.shell.collapseRight();
                        vpLab.shell.expandRight();
                    }
                    let relativeSizes = vpLab.shell._hsplitPanel.layout.relativeSizes();
                    let absoluteSizes = vpLab.shell._hsplitPanel.layout.absoluteSizes();
                    let newSize = absoluteSizes[1] - widthDiff;
                    let totalWidth = absoluteSizes.reduce((x, a) => x + a, 0);
                    vpLab.shell._hsplitPanel.layout.setRelativeSizes([relativeSizes[0], newSize/totalWidth, newVpWidth/totalWidth]);
                } else {
                    $('#vp_wrapper').resizable({ minWidth: VP_MIN_WIDTH });
                }
                this.menuFrame._bindResizable();
            }
            // save current page info
            vpConfig.setMetadata({
                // vp_note_display: !isNoteVisible, // save in boardFrame.show/hide()
                vp_position: { width: newVpWidth },
                vp_menu_width: menuWidth
            });

            this._resizeVp(newVpWidth);
        }

        /**
         * Create popup
         * @param {Array} popupStateList [{ menuId, menuState, blockType, position, createChild, afterAction }]
         * - {String} menuId
         * - {Object} menuState   : { blockState, taskState }
         * -------- optional parameters ---------------------------
         * - {String} blockType   : task / block
         * - {int}    position    : 0 ~ n
         * - {bool}   createChild : true / false
         * - {String} afterAction : run / add / open
         */
        createPopup(popupStateList) {
            // set popup state's default values
            let defaultPopupState = {
                blockType: 'task',
                position: this.blockPopupList.length,
                createChild: true,
                menuId: '',
                menuState: {}, // taskState, blockState
                afterAction: ''
            };
            let that = this;
            let loadMenuList = [];  // menu list to require
            let loadStateList = []; // menu state list
            // get menu configurations
            for (let i=0; i<popupStateList.length; i++) {
                let popupState = popupStateList[i];
                let menuConfig = this.menuFrame.getMenuLibrary(popupState.menuId);
                if (menuConfig) {
                    let fileName = menuConfig.file;
                    if (menuConfig.useAuto) {
                        // if useAuto is true, use LibraryComponent to auto-generate page
                        fileName = 'com/component/LibraryComponent';
                    }
                    if (menuConfig.useAutoV2) {
                        // FIXME: must merge LibraryComponent and NumpyComponent
                        fileName = 'com/component/NumpyComponent';
                    }
                    // add to menu list
                    let filePath = 'vp_base/js/' + fileName;
                    let menuArgIdx = loadMenuList.indexOf(filePath);
                    if (menuArgIdx < 0) {
                        loadMenuList.push(filePath);
                        menuArgIdx = loadMenuList.length - 1;
                    }
                    let tmpState = {};
                    Object.keys(defaultPopupState).forEach(key => {
                        if (popupState.hasOwnProperty(key) && popupState[key] != undefined) {
                            tmpState[key] = popupState[key];
                        } else {
                            tmpState[key] = defaultPopupState[key];
                        }
                    });
                    tmpState = {
                        ...tmpState,
                        file: fileName, // set fileName 
                        argIdx: menuArgIdx,
                        menuConfig: menuConfig
                    }
                    loadStateList.push(tmpState);
                    // if createChild, get childStateInfo
                    if (tmpState.blockType == 'block' && tmpState.createChild) {
                        let childStates = this.getChildState(tmpState.menuId, tmpState.position);
                        popupStateList.splice(i+1, 0, ...childStates);
                    }
                } else {
                    vpLog.display(VP_LOG_TYPE.ERROR, 'Menu is not found (menu id: '+popupState.menuId+')');
                }
            }

            try {
                // loading bar enable
                this.boardFrame.showLoadingBar();
                // create components
                // LAB: use require
                if (vpConfig.extensionType === 'lab') {
                    let parentBlock = null;
                    let prevBlock = null;
                    loadStateList.forEach(obj => {
                        let { file, blockType, menuId, menuState, menuConfig, argIdx, position, afterAction } = obj;
                        // get OptionComponent Object
                        // LAB: relative path needed
                        let OptionComponent = require('./' + file);
                        if (OptionComponent) {
                            let taskState = menuState.taskState;
                            let blockState = menuState.blockState;
                            let tmpState = menuState.tmpState;
                            let state = {
                                ...taskState,
                                config: menuConfig
                            };
                            // create popup instance
                            let popup = new OptionComponent(state);
                            let newBlock = null;
                            if (blockType === 'block') {
                                // add to block list
                                newBlock = that.addBlock(popup, position, blockState);
                                if (parentBlock == null) {
                                    parentBlock = newBlock; // set parent block of created block
                                } else {
                                    if (!(blockState && blockState.depth != undefined) && prevBlock != null && !newBlock.isGroup) {
                                        let newDepth = prevBlock.getChildDepth();
                                        if (tmpState && tmpState.relativeDepth) {
                                            newDepth = parentBlock.getChildDepth() + tmpState.relativeDepth;
                                        }
                                        newBlock.setDepth(newDepth);
                                    }
                                }
                                vpLog.display(VP_LOG_TYPE.DEVELOP, 'new block ' + position + ' with depth ' + newBlock.depth);
                                prevBlock = newBlock;
                            } else {
                                // add to task list
                                that.addTask(popup);
                            }
                            // after action
                            if (afterAction && afterAction != '') {
                                switch (afterAction) {
                                    case 'run':
                                        popup.run();
                                        break;
                                    case 'add':
                                        popup.run(false);
                                        break;
                                    case 'open':
                                        that.openPopup(popup);
                                        break;
                                }
                            }
                        } else {
                            vpLog.display(VP_LOG_TYPE.ERROR, 'Not implemented or available menu. (menu id: '+menuConfig.id+')');
                        }
                    });
                    // focus created popup
                    if (parentBlock && parentBlock.isGroup) {
                        parentBlock.focusItem();
                        // scroll to new block
                        that.boardFrame.scrollToBlock(parentBlock);
                    }
                    that.boardFrame.hideLoadingBar();
                    that.boardFrame.reloadBlockList();
                } else {
                    window.require(loadMenuList, function() {
                        let parentBlock = null;
                        let prevBlock = null;
                        loadStateList.forEach(obj => {
                            let { blockType, menuId, menuState, menuConfig, argIdx, position, afterAction } = obj;
                            // get OptionComponent Object
                            let OptionComponent = arguments[argIdx];
                            if (OptionComponent) {
                                let taskState = menuState.taskState;
                                let blockState = menuState.blockState;
                                let tmpState = menuState.tmpState;
                                let state = {
                                    ...taskState,
                                    config: menuConfig
                                };
                                // create popup instance
                                let popup = new OptionComponent(state);
                                let newBlock = null;
                                if (blockType === 'block') {
                                    // add to block list
                                    newBlock = that.addBlock(popup, position, blockState);
                                    if (parentBlock == null) {
                                        parentBlock = newBlock; // set parent block of created block
                                    } else {
                                        if (!(blockState && blockState.depth != undefined) && prevBlock != null && !newBlock.isGroup) {
                                            let newDepth = prevBlock.getChildDepth();
                                            if (tmpState && tmpState.relativeDepth) {
                                                newDepth = parentBlock.getChildDepth() + tmpState.relativeDepth;
                                            }
                                            newBlock.setDepth(newDepth);
                                        }
                                    }
                                    vpLog.display(VP_LOG_TYPE.DEVELOP, 'new block ' + position + ' with depth ' + newBlock.depth);
                                    prevBlock = newBlock;
                                } else {
                                    // add to task list
                                    that.addTask(popup);
                                }
                                // after action
                                if (afterAction && afterAction != '') {
                                    switch (afterAction) {
                                        case 'run':
                                            popup.run();
                                            break;
                                        case 'add':
                                            popup.run(false);
                                            break;
                                        case 'open':
                                            that.openPopup(popup);
                                            break;
                                    }
                                }
                            } else {
                                vpLog.display(VP_LOG_TYPE.ERROR, 'Not implemented or available menu. (menu id: '+menuConfig.id+')');
                            }
                        });
                        // focus created popup
                        if (parentBlock && parentBlock.isGroup) {
                            parentBlock.focusItem();
                            // scroll to new block
                            that.boardFrame.scrollToBlock(parentBlock);
                        }
                        that.boardFrame.hideLoadingBar();
                        that.boardFrame.reloadBlockList();
                    }, function (err) {
                        vpLog.display(VP_LOG_TYPE.ERROR, 'Error on creating popup (' + err.message + ')');
                        that.boardFrame.hideLoadingBar();
                    });
                }
                
            } catch(err) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'Error on creating popup (' + err.message + ')');
                that.boardFrame.hideLoadingBar();
            }
        }

        getChildState(parentId, position) {
            let menuId = parentId;
            let childBlocks = [];
            switch (menuId) {
                case 'lgDef_class':
                    childBlocks = [
                        { 
                            menuId: 'lgDef_def', 
                            menuState: { 
                                blockState: {
                                    isGroup: false
                                },
                                taskState: {
                                    v1: '__init__', 
                                    v2: [{ param: 'self' }] 
                                }
                            }
                        },
                        { 
                            menuId: 'lgExe_code', 
                            menuState: { 
                                blockState: {
                                    isGroup: false
                                }
                            }
                        },
                        { 
                            menuId: 'lgCtrl_return', 
                            menuState: { 
                                blockState: {
                                    isGroup: false
                                }
                            }
                        }
                    ]
                    break;
                case 'lgDef_def':
                    childBlocks = [
                        { 
                            menuId: 'lgExe_code', 
                            menuState: { 
                                blockState: {
                                    isGroup: false
                                }
                            }
                        },
                        { 
                            menuId: 'lgCtrl_return', 
                            menuState: { 
                                blockState: {
                                    isGroup: false
                                }
                            }
                        }
                    ]
                    break;
                case 'lgCtrl_try':
                    childBlocks = [
                        { 
                            menuId: 'lgCtrl_pass', 
                            menuState: { 
                                blockState: {
                                    isGroup: false
                                }
                            }
                        },
                        { 
                            menuId: 'lgCtrl_except', 
                            menuState: { 
                                blockState: {
                                    isGroup: false
                                },
                                tmpState: {
                                    relativeDepth: -1
                                }
                            }
                        },
                        { 
                            menuId: 'lgCtrl_pass', 
                            menuState: { 
                                blockState: {
                                    isGroup: false
                                }
                            }
                        }

                    ];
                    break;
                case 'lgCtrl_for':
                case 'lgCtrl_while':
                case 'lgCtrl_if':
                case 'lgCtrl_elif':
                case 'lgCtrl_except':
                case 'lgCtrl_else':
                case 'lgCtrl_finally':
                    childBlocks = [
                        { 
                            menuId: 'lgCtrl_pass', 
                            menuState: { 
                                blockState: {
                                    isGroup: false
                                }
                            }
                        }
                    ];
                    break;
            }

            for (let i = 0; i < childBlocks.length; i++) {
                childBlocks[i]['blockType'] = 'block';
                childBlocks[i]['position'] = position + i + 1;
                childBlocks[i]['createChild'] = false;
            }
            return childBlocks;
        }
        
        /**
         * Open Popupcomponent
         * @param {PopupComponent} component 
         */
        openPopup(component) {
            if (component && component.isHidden()) {
                // hide other tasks
                this.hideAllPopup();
    
                // open it and focus it
                this._nowTask = component;
                component.open();
            }
        }

        /**
         * Close PopupComponent
         * @param {PopupComponent} component 
         */
        closePopup(component) {
            if (component) {
                component.close();
            }
        }

        /**
         * Apply task to board block
         * - remove from taskList
         * - add to blockList
         * - close component
         * @param {PopupComponent} component 
         */
        applyPopup(component) {
            let taskType = component.getTaskType();
            if (taskType == 'task') {
                // remove from taskBlockList
                this.removeTask(component);
                component.close();

                this.createPopup([{
                    menuId: component.id,
                    menuState: {
                        taskState: component.state
                    },
                    blockType: 'block'
                }]);
                // close and focus block (sequence is important)
                // newBlock.focusItem();
            } else {
                component.close();
            }
            // render board frame
            this.boardFrame.reloadBlockList();
        }

        /**
         * Remove PopupComponent
         * @param {PopupComponent} component 
         */
        removePopup(component) {
            if (component) {
                if (component.getTaskType() === 'block') {
                    // block
                    this.boardFrame.removeBlock(component);
                } else {
                    // task
                    this.removeTask(component);
                }
                component.remove();
            } else {
                vpLog.display(VP_LOG_TYPE.WARN, 'Component to remove is not available.');
            }
        }

        /**
         * Focus on PopupComponent
         * @param {PopupComponent} component 
         */
        focusPopup(component) {
            component.focus();
            this.setFocusedPage(component);
        }

        /**
         * Blur PopupComponent
         * @param {PopupComponent} component 
         */
        blurPopup(component=null) {
            if (component && (component instanceof PopupComponent)) {
                component.blur();
            } else {
                // blur all
                $('.vp-popup-frame').removeClass('vp-focused');
            }
            this.setFocusedPage(null);
        }

        /**
         * Hide all PopupComponent
         */
        hideAllPopup() {
            this.taskPopupList.forEach(task => {
                task.hide();
            });
            this.blockPopupList.forEach(task => {
                task.hide();
            });
        }

        /**
         * Focus popup page using its object
         * @param {PopupComponent} focusedPage 
         */
        setFocusedPage(focusedPage) {
            this.focusedPage = focusedPage;
        }

        checkDuplicatedTask(menuId) {
            // find on task list
            let dupTask = this._taskPopupList.filter(t => t && menuId === t.id);
            if (dupTask.length > 0) {
                return dupTask[0];
            }
            // not available
            return null;
        }

        addBlock(option, position=-1, blockState={}) {
            this._blockPopupList.push(option);
            let newBlock = this.boardFrame.addBlock(option, position, blockState);
            // render board frame
            this.boardFrame.reloadBlockList();
            return newBlock;
        }

        /**
         * Add task to task list and render TaskBar
         * @param {PopupComponent} option 
         */
        addTask(option) {
            this._taskPopupList.push(option);

            // render task bar
            this.menuFrame.renderTaskBar(this._taskPopupList);
        }

        /**
         * Remove task from task list and render TaskBar
         * @param {PopupComponent} option 
         */
        removeTask(option) {
            const taskToRemove = this._taskPopupList.find(function(item) { return item.uuid === option.uuid });
            const taskIdx = this._taskPopupList.indexOf(taskToRemove);
            if (taskIdx > -1) {
                taskToRemove.removeBlock();
                this._taskPopupList.splice(taskIdx, 1);
                // render task bar
                this.menuFrame.renderTaskBar(this._taskPopupList);
            } else {
                vpLog.display(VP_LOG_TYPE.WARN, 'No option task to remove');
            }
        }

        //========================================================================
        // Getter Setter
        //========================================================================
        get menuFrame() {
            return this._menuFrame;
        }

        get boardFrame() {
            return this._boardFrame;
        }

        get focusedPage() {
            return this._focusedPage;
        }

        set focusedPage(component) {
            this._focusedPage = component;
        }

        get taskPopupList() {
            return this._taskPopupList;
        }

        get blockPopupList() {
            return this._blockPopupList;
        }

        
    }
	
    

    return MainFrame;
});

/* End of file */