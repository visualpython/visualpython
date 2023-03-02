/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : MenuFrame.js
 *    Author          : Black Logic
 *    Note            : Render and load menu frame
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] MenuFrame
//============================================================================
define([
    __VP_TEXT_LOADER__('../../html/menuFrame.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/menuFrame'), // INTEGRATION: unified version of css loader

    '../com/com_Config',
    '../com/com_Const',
    '../com/com_util',
    '../com/com_interface',
    '../com/component/Component',
    '../com/component/SuggestInput',
    '../com/component/InnerFuncViewer',

    __VP_RAW_LOADER__('../../data/libraries.json'), // INTEGRATION: text! to raw-loader

    './MenuGroup',
    './MenuItem',
    './TaskBar'
], function(menuFrameHtml, menuFrameCss, com_Config, com_Const, com_util, com_interface, Component, SuggestInput, InnerFuncViewer,
            librariesJson, 
            MenuGroup, MenuItem, TaskBar) {
	'use strict';
    //========================================================================
    // Define Variable
    //========================================================================
    const {
        VP_MIN_WIDTH,
        MENU_MIN_WIDTH,
        BOARD_MIN_WIDTH,
        MENU_BOARD_SPACING 
    } = com_Config;
    
    //========================================================================
    // Declare class
    //========================================================================
    /**
     * MenuFrame
     */
    class MenuFrame extends Component {
        //========================================================================
        // Constructor
        //========================================================================
        constructor($target, state, prop={}) {
            super($target, state, prop);
            /**
             * state.vp_menu_width : menu width (metadata)
             * prop.parent : MainFrame
             */
        }

        //========================================================================
        // Internal call function
        //========================================================================
        _init() {
            // get json library list
            this.menuLibrariesFlatten = []; // use it for searching
            this.menuLibraries = this.getMenuLibraries();
        }
        
        /**
         * Bind events on menuFrame
         */
        _bindEvent() {
            var that = this;
            // Click extra menu button
            $(this.wrapSelector('#vp_headerExtraMenuBtn')).on('click', function(evt) {
                $('#vp_headerExtraMenu').toggle();
                evt.stopPropagation();
            });
            // Click toggle board icon
            $(this.wrapSelector('#vp_toggleBoard')).on('click', function() {
                that.prop.parent.toggleNote();
            });
            // Click extra menu item
            $(this.wrapSelector('#vp_headerExtraMenu li')).on('click', function() {
                let menu = $(this).data('menu');
                switch(menu) {
                    case 'check-version':
                        // check vp version
                        vpConfig.checkVpVersion();
                        break;
                    case 'view-inner-func':
                        let viewer = new InnerFuncViewer();
                        viewer.open();
                        break;
                    case 'restart':
                        // restart vp
                        vpConfig.readKernelFunction().then(function() {
                            // successfully restarted
                            com_util.renderSuccessMessage('Successfully loaded inner functions for Visual Python');
                        }).catch(function() {
                            com_util.renderAlertModal('No connected runtime is detected. Please connect to runtime...');
                        });
                        break;
                    case 'about':
                    case 'vpnote':
                        break;
                }
            });
            // Click version updater
            $(this.wrapSelector('#vp_versionUpdater')).on('click', function() {
                vpConfig.checkVpVersion();
            });
        }

        _unbindResizable() {
            $('#vp_menuFrame').resizable('destroy');
        }

        /**
         * Bind resizable(jquery.ui)
         */
        _bindResizable() {
            // resizable
            $('#vp_menuFrame').resizable({
                // containment: 'parent',
                helper: 'vp-menuframe-resizer',
                handles: 'e',
                // resizeHeight: false,
                minWidth: MENU_MIN_WIDTH,
                // maxWidth: 0,
                start: function(event, ui) {
                    
                },
                resize: function(event, ui) {
                    var parentWidth = $('#vp_wrapper')[0].getBoundingClientRect().width;
                    var currentWidth = ui.size.width;
                    var newBoardWidth = 0;
                    
                    var showBoard = $('#vp_boardFrame').is(':visible');
                    if (showBoard) {
                        newBoardWidth = parentWidth - currentWidth - MENU_BOARD_SPACING;
    
                        // check board minimum width
                        if (newBoardWidth < BOARD_MIN_WIDTH + MENU_BOARD_SPACING) {
                            newBoardWidth = BOARD_MIN_WIDTH;
                            currentWidth = parentWidth - (BOARD_MIN_WIDTH + MENU_BOARD_SPACING);
                            // change current width
                            ui.size.width = currentWidth;
                        } 
                    } 
                    // resize menu frame with current resized width
                    $('#vp_menuFrame').width(currentWidth);
                    // resize board frame with left space
                    $('#vp_boardFrame').width(newBoardWidth); 

                    vpConfig.setMetadata({
                        vp_position: { width: parentWidth },
                        vp_menu_width: currentWidth,
                        vp_note_width: newBoardWidth
                    });

                    vpLog.display(VP_LOG_TYPE.DEVELOP, 'resizing menuFrame');
                },
                stop: function(event, ui) {

                },
            });
        }


        //========================================================================
        // External call function
        //========================================================================
        /**
         * Get menu object
         * @returns library object
         */
        getMenuLibraries() {
            var libraries = {};
            // LAB: webpack5 load json object by default
            if (vpConfig.extensionType === 'lab') {
                libraries = librariesJson;
            } else {
                libraries = JSON.parse(librariesJson);
            }
            if (!libraries || !libraries.library) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'vp menus are not avilable!');
                return {};
            }
            vpLog.display(VP_LOG_TYPE.LOG, 'vp menus version : ', libraries.library.version);
            if (libraries && libraries.library) {
                return libraries.library.item;
            }

            return {};
        }
        
        getMenuLibrary(menuId, libraries=this.menuLibrariesFlatten) {
            for (var i=0; i < libraries.length; i++) {
                var item = libraries[i];
                if (item) {
                    if (item.id === menuId) {
                        return item;
                    }
                    // if (item.type === 'package') {
                    //     var result = this.getMenuLibrary(menuId, item.item);
                    //     if (result) {
                    //         return result;
                    //     }
                    // }
                }
            }
            return null;
        }
        
        template() {
            this.$pageDom = $(menuFrameHtml.replaceAll('${vp_base}', com_Const.BASE_PATH));
            // LAB: vp_base replacing test
            // const regexp = /"\$\{vp_base\}(.+?)"/g;
            // var replaceHtml = menuFrameHtml;

            // const rep_list = [...replaceHtml.matchAll(regexp)];

            // for (var i=0; i<rep_list.length; i++) {
            //     try {
            //         var img_url = require(`..${rep_list[i][1]}`);
            //         // var img_url = '/lib/visualpython' + rep_list[i][1];
            //         replaceHtml = replaceHtml.replace(rep_list[i][0], `"${img_url}"`)
            //     } catch (ex) {
            //         ; // ignore error
            //         console.log(ex);
            //     }
            // }
            // this.$pageDom = $(replaceHtml);
            return this.$pageDom;
        }

        renderMenuItem(group) {
            var that = this;
            var body = group.getBody();
            var item = group.getItem();
            var state = group.getState();
            item && item.forEach(child => {
                // remember parent to navigate its parent menu
                var category = state.category?(state.category + ' > ' + state.name):state.name;
                child['category'] = category;

                if (child.type == 'package') {
                    // packages : MenuGroup
                    var menuGroup = new MenuGroup($(body), child);
                    if (child.item) {
                        that.renderMenuItem(menuGroup);
                    }
                } else {
                    // functions : MenuItem
                    if (!child.hide) {
                        that.menuLibrariesFlatten.push(child);
                        var menuItem = new MenuItem($(body), child);
                    }
                }
            });
        }   

        renderTaskBar(taskList) {
            this.taskBar = new TaskBar($(this.wrapSelector('#vp_menuFooter')), { taskList: taskList });
        }

        render() {
            super.render(true);
            var that = this;

            this._bindResizable();

            // set width using metadata
            $(this.wrapSelector()).width(this.state.vp_menu_width);

            // render menuItem
            var menuLibraries = this.menuLibraries;
            vpLog.display(VP_LOG_TYPE.DEVELOP, menuLibraries);

            this.menuLibrariesFlatten = [];
            menuLibraries && menuLibraries.forEach(item => {
                if (item.type == 'package') {
                    // packages : MenuGroup
                    var menuGroup = new MenuGroup($('.vp-menugroup-list'), item);
                    if (item.item) {
                        that.renderMenuItem(menuGroup);
                    }
                }
            });

            let functionList = this.menuLibrariesFlatten.map(menu => {
                return { label: menu.name, value: menu.name, dtype: menu.category, ...menu }
            });
            // render searchbox
            let searchBox = new SuggestInput();
            searchBox.setComponentID('vp_menuSearchBox');
            searchBox.addClass('vp-input vp-menu-search-box');
            searchBox.setPlaceholder('Search libraries');
            searchBox.setMinSearchLength(2);
            searchBox.setSuggestList(function () { return functionList; });
            searchBox.setSelectEvent(function (value) {
                $(this.wrapSelector()).val(value);
                $(this.wrapSelector()).trigger('change');
            });
            searchBox.setSelectEvent(function(value, item) {
                $(this.wrapSelector()).val(value);

                $('#vp_wrapper').trigger({
                    type:"create_option_page",
                    blockType: 'task',
                    menuId: item.id,
                    menuState: {},
                    afterAction: 'open'
                });
                $(this.wrapSelector()).trigger('change');
                // clear search box
                $(that.wrapSelector('#vp_menuSearchBox')).val('');
                return false;
            });
            searchBox.setNormalFilter(true);
            // replace searchbox
            $(this.wrapSelector('#vp_menuSearchBox')).replaceWith(searchBox.toTagString());

            // render taskBar
            this.renderTaskBar([]);
        }
    }

    return MenuFrame;
	
});

/* End of file */