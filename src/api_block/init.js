define([
    'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/container/vpContainer'

    , './api.js'    

    , './constData.js'
    , './blockContainer.js'
    , './createBlockBtn.js'
    , './createApiBtn.js'
    , './createGroup.js'
    , './api_list.js'

    , './component/boardMenuBar.js'
    // TEST: File Navigation
    , 'nbextensions/visualpython/src/common/vpFileNavigation'
], function ( $, vpCommon, vpConst, vpContainer, 
              api, constData, blockContainer, createBlockBtn, createApiBtn, createGroup, api_list,
              apiBlockMenuInit
              // TEST: File Navigation
              , FileNavigation
              ) {
 
    const { IsCodeBlockType, ControlToggleInput, LoadVariableList, MapGroupTypeToName } = api;
  
    const { BLOCK_GROUP_TYPE
            , BLOCK_CODELINE_BTN_TYPE
            , BLOCK_CODELINE_TYPE
            , FOCUSED_PAGE_TYPE
            , BLOCK_DIRECTION

            , VP_ID_PREFIX
            , VP_ID_WRAPPER
            , VP_ID_APIBLOCK_LEFT_TAB_API
            , VP_ID_APIBLOCK_LEFT_TAP_APILIST_PAGE
            , VP_ID_APIBLOCK_NODE_BLOCK_PLUS_BUTTON
            , VP_ID_APIBLOCK_TEXT_BLOCK_PLUS_BUTTON
            , VP_ID_APIBLOCK_BOARD_MAKE_NODE_BLOCK_INPUT 
            , VP_ID_APIBLOCK_BOARD_MAKE_NODE_PATH
            , VP_ID_APIBLOCK_DELETE_BLOCK_ALL

            , VP_ID_APIBLOCK_MENU_BOX

            , VP_APIBLOCK_BOARD_OPTION_PREVIEW_BUTTON
            , VP_APIBLOCK_BOARD_OPTION_CANCEL_BUTTON
            , VP_APIBLOCK_BOARD_OPTION_APPLY_BUTTON

            , VP_CLASS_PREFIX
            , VP_CLASS_BLOCK_GROUPBOX_PREFIX
            , VP_CLASS_APIBLOCK_BOARD_CONTAINER

            , VP_CLASS_APIBLOCK_BUTTONS
            , VP_CLASS_APIBLOCK_BOARD
            , VP_CLASS_APIBLOCK_OPTION_TAB

            , NUM_DELETE_KEY_EVENT_NUMBER
            , NUM_ENTER_KEY_EVENT_NUMBER
            , NUM_APIBLOCK_LEFT_PAGE_WIDTH
            , NUM_API_BOARD_CENTER_PAGE_WIDTH

            , STR_CLICK
            , STR_EMPTY
            , STR_WIDTH 
            , STR_MAX_WIDTH
            , STR_PARENT
            , STR_NONE
            , STR_NOTEBOOK
            , STR_HEADER
            , STR_CELL
            , STR_CODEMIRROR_LINES
            , STR_UNTITLED

            , STATE_codeLine
        
            , APPS_CONFIG } = constData;

    const BlockContainer = blockContainer;
    const CreateBlockBtn = createBlockBtn;
    const CreateApiBtn = createApiBtn;
    const CreateGroup = createGroup;
    
    const { toggleApiListSubGroupShow
            , loadLibraries
            , loadLibrariesToJson
            , getNavigationInfo } = api_list;

    const { saveAsNotePage
            , openNotePage
            , closeNoteExtraMenu
            , saveNotePageAction_newVersion
            , openNotePageAction_newVersion } = vpContainer;
            

    var init = function(apiBlockPackage){
        /** 제이쿼리 커스텀 메소드 생성
         *  싱글 클릭 혹은 더블 클릭 바인딩
         * 
         *  이 메소드 하나로 싱글 클릭과 더블 클릭을 동시에 처리할 수 있음
         */
        $.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
            return this.each(function(){
                var clicks = 0, 
                    self = this;
                $(this).click(function(event){
                    clicks++;
                    if (clicks == 1) {
                        setTimeout(function(){
                            if(clicks == 1) {
                                single_click_callback.call(self, event);
                            } else {
                                double_click_callback.call(self, event);
                            }
                            clicks = 0;
                        }, timeout || 300);
                    }
                });
            });
        }

        /** block container 생성
         * 싱글톤 무조건 1개
         */
        var blockContainer = new BlockContainer();
        blockContainer.setImportPackageThis(apiBlockPackage);

        /** Logic에 블럭 그룹 생성 */
        var createLogicGroupArray = Object.values(BLOCK_GROUP_TYPE);
        var logicBlockContainer = VP_CLASS_PREFIX + VP_CLASS_BLOCK_GROUPBOX_PREFIX + 'logic';
        createLogicGroupArray.forEach(enumData => {
            var groupName = MapGroupTypeToName(enumData);
            var open = false;
            var defaultOpenGroupList = ['Define', 'Control'];
            // open defined group div
            if (defaultOpenGroupList.includes(groupName)) {
                open = true;
            }
            new CreateGroup(blockContainer, enumData, MapGroupTypeToName(enumData), logicBlockContainer, 0, open);
        });

        /** Logic(Define, Control, Execute)에 블럭 생성 버튼 생성 */
        var createBlockBtnArray = Object.values(BLOCK_CODELINE_BTN_TYPE);
        createBlockBtnArray.forEach(enumData => {
            new CreateBlockBtn(blockContainer, enumData);
        });

        /** 추가: API 버튼 추가 */
        var xmlLibraries = {};
        loadLibrariesToJson(function(param) {
            xmlLibraries = param.getJson();
            // make group & list
            apiLibariesToBtn(blockContainer, xmlLibraries.library);
            
        }, xmlLibraries);

        /** API Block 햄버거 메뉴바 생성 */
        apiBlockMenuInit(blockContainer);

        /** ------------------처음 파일을 오픈할 때 화면의 width 값 계산 ----------------------------------- */
        /** 전체 visual python width 계산 */
        var mainPageRectWidth = $(VP_ID_PREFIX + VP_ID_WRAPPER).css(STR_WIDTH);
        var index = mainPageRectWidth.indexOf('px');
        var mainPageRectWidthNum = parseInt(mainPageRectWidth.slice(0,index));

        var PADDING_BETWEEN_BOXES = 10; // left line padding 5 + between padding 5

        /** 왼쪽 Logic, API 블럭 생성 영역의 width*/
        /** 가운데 board 영역의 width */
        var boardPageRectWidth = NUM_API_BOARD_CENTER_PAGE_WIDTH;
        /** 오른쪽 option 영역의 width 계산 */
        var optionPageRectWidth = mainPageRectWidthNum - boardPageRectWidth - PADDING_BETWEEN_BOXES;

        /** visual python 전체의 width 렌더링 */
        $(vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_WRAPPER)).css(STR_WIDTH, mainPageRectWidth);
        /** 가운데 board 영역의 width 렌더링 */
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + 'vp-apiblock-tab-container')).css(STR_WIDTH, boardPageRectWidth);
        /** 오른쪽 option 영역의 width 렌더링*/
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_OPTION_TAB)).css(STR_WIDTH, optionPageRectWidth);
        
        /** 오른쪽 option 영역의 max-width 렌더링*/
        // var optionPageRectWidth_maxWidth = mainPageRectWidthNum - buttonsPageRectWidth - 290 - 103;
        var optionPageRectWidth_maxWidth = mainPageRectWidthNum - boardPageRectWidth - PADDING_BETWEEN_BOXES;
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_OPTION_TAB)).css(STR_MAX_WIDTH, optionPageRectWidth_maxWidth);

        /** 가운데 board 위 영역의 렌더링 */
        $(VP_ID_PREFIX + VP_ID_APIBLOCK_BOARD_MAKE_NODE_BLOCK_INPUT).val(STR_UNTITLED);
        $(VP_ID_PREFIX + VP_ID_APIBLOCK_BOARD_MAKE_NODE_BLOCK_INPUT).focus();

        /** API List 함수들을 Logic아래에 렌더링한 후에 
         *  API List xml 데이터를 xmlLibraries변수에 대입 */
        var xmlLibraries = loadLibraries(VP_ID_PREFIX + VP_ID_APIBLOCK_LEFT_TAB_API);

        /** 블럭이 생성되어 보여지는 container dom을 생성하고
         *  board에 container dom을 렌더링
         */
        blockContainer.reNewContainerDom();

        /** Block Max Width 설정 */
        blockContainer.setBlockMaxWidth(boardPageRectWidth - 60);
        
        /** delete 키 or 엔터 키를 누를 때 keyup 이벤트 발동
         */
        // $(document).keyup(function(e) {
        //     var keycode =  e.keyCode 
        //                         ? e.keyCode 
        //                         : e.which;

        //     var selectedBlock = blockContainer.getSelectBlock();

        //     /** Delete 이벤트 */
        //     /** block을 클릭하고 delete 키 눌렀을 때 */ 
        //     if (keycode == NUM_DELETE_KEY_EVENT_NUMBER
        //         && selectedBlock){
        //         selectedBlock.deleteBlock_childBlockList();
        //         blockContainer.resetOptionPage();
        //         blockContainer.reRenderAllBlock_asc();
        //     } 

        //     /** 엔터 이벤트 */
        //     /** node 블럭을 클릭하고 엔터키를 눌렀을 때 */
        //     if (keycode == NUM_ENTER_KEY_EVENT_NUMBER
        //         && selectedBlock
        //         && selectedBlock.getBlockType() == BLOCK_CODELINE_TYPE.NODE){
        //         // console.log('엔터');
        //         selectedBlock.renderNodeBlockInput(STR_NONE);
        //     }
        // });

        /** Apps Menu Open */
        $(document).on(STR_CLICK, '#vp_menuApps', function() {
            var appContainer = $('.vp-apiblock-menu-apps-container');
            if (appContainer.hasClass('show')) {
                appContainer.removeClass('show');
            } else {
                appContainer.addClass('show');
            }
        });

        /** Apps Menu item click */
        /** Apps Menu item click */
        $(document).on(STR_CLICK,'.vp-apiblock-menu-apps-item', function() {
            var menu = $(this).attr('data-menu');

            var { file, config } = APPS_CONFIG[menu];
            if (config == undefined) {
                config = {}
            }

            switch (menu)
            {
                case 'markdown':
                    // blockContainer.createAppsPage('/nbextensions/visualpython/src/markdown/markdown.js', {
                    //     title: 'Markdown'
                    // }, function(funcJS) {
                    //     funcJS.bindOptionEventForPopup();
                    // });
                    blockContainer.createTextBlock();
                    break;
                case 'import':
                case 'snippets':
                case 'variable':
                case 'file':
                case 'instance':
                case 'subset':
                case 'frame':
                case 'chart':
                case 'profiling':
                    blockContainer.setSelectBlock(null);
                    blockContainer.createAppsPage(menu, file, config);
                    break;
                case 'merge':
                    // TODO: Merge
                    break;
                case 'groupby':
                    // TODO: Groupby
                    break;
                case 'reshape':
                    // TODO: Reshape
                    break;
                case 'timeseries':
                    // TODO: TimeSeries
                    break;
            }
        });

        $(document).on('popup_run', '#vp_appsCode', function(evt) {
            var code = evt.code;
            var title = evt.title;
            var state = evt.state;
            var addCell = evt.addCell == true;
            var runCell = evt.runCell == true;

            var isFirstBlock = false;
            const blockList = blockContainer.getBlockList();

            /** board에 블럭이 0개 일때
             *  즉 블럭이 처음으로 생성되는 경우
             */
             if (blockList.length == 0) {
                isFirstBlock = true;
            }

            var createdBlock = blockContainer.getSelectBlock();
            if (createdBlock) {
                // apply to original block
                createdBlock.setState({
                    apps: {
                        menu: blockContainer.apps,
                        code: code,
                        state: state
                    }
                });
                createdBlock.saveState();
            } else {
                if (title === 'Snippets') {
                    // 1. add code block
                    // create block as group block
                    createdBlock = blockContainer.createBlock(BLOCK_CODELINE_TYPE.CODE, null, null, true);
                    // set code
                    createdBlock.setState({
                        [STATE_codeLine]: code
                    });
                    createdBlock.writeCode(code);
                    createdBlock.apply();
                    if (isFirstBlock == true) {
                        // if it is first block, set as ROOT
                        createdBlock.setDirection(BLOCK_DIRECTION.ROOT);
                    } else {
                        var lastBottomBlock = blockContainer.getRootToLastBottomBlock();
                        lastBottomBlock.appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);
                    }
                    blockContainer.addNodeBlock(createdBlock);
                    blockContainer.resetBlockList();
                    blockContainer.reRenderAllBlock_asc();
                    blockContainer.resetBlockListAndRenderThisBlock(createdBlock);
                } else if (title === 'Import' || title === 'Variables' || title === 'File' 
                        || title === 'Instance' || title === 'Chart') {
                    // add apps block
                    createdBlock = blockContainer.createBlock(BLOCK_CODELINE_TYPE.APPS, null, null, true, true);
                    createdBlock.setState({
                        apps: {
                            menu: blockContainer.apps,
                            code: code,
                            state: state
                        }
                    });
                    // set code
                    createdBlock.setState({
                        [STATE_codeLine]: 'Apps > ' + title
                    });
                    // createdBlock.writeCode(code);
                    createdBlock.apply();
                    if (isFirstBlock == true) {
                        // if it is first block, set as ROOT
                        createdBlock.setDirection(BLOCK_DIRECTION.ROOT);
                    } else {
                        var lastBottomBlock = blockContainer.getRootToLastBottomBlock();
                        lastBottomBlock.appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);
                    }
                    blockContainer.addNodeBlock(createdBlock);
                    blockContainer.resetBlockList();
                    blockContainer.reRenderAllBlock_asc();
                } 
            }

            // 2. add cell and run cell
            if (addCell) {
                createdBlock.runThisBlock(runCell);
            }
        });

        /** Apps Menu Apply event */
        $(document).on('subset_run frame_run', '#vp_appsCode', function(evt) {
            var code = evt.code;
            var title = evt.title;
            var state = evt.state;
            var addCell = evt.addCell == true;
            var runCell = evt.runCell == true;

            var isFirstBlock = false;
            const blockList = blockContainer.getBlockList();
            /** board에 블럭이 0개 일때
             *  즉 블럭이 처음으로 생성되는 경우
             */
            if (blockList.length == 0) {
                isFirstBlock = true;
            }

            var createdBlock = blockContainer.getSelectBlock();
            if (createdBlock) {
                // apply to original block
                createdBlock.setState({
                    apps: {
                        menu: blockContainer.apps,
                        code: code,
                        state: state
                    }
                });
                createdBlock.saveState();
            } else {
                // new block
                if (title === 'Markdown') {
    
                    createdBlock = blockContainer.createTextBlock(code);
    
                    // createdBlock = blockContainer.createBlock(BLOCK_CODELINE_TYPE.TEXT);
                    // createdBlock.apply();
                    // createdBlock.setFuncID(STR_TEXT_BLOCK_MARKDOWN_FUNCID);
                    // createdBlock.setOptionPageLoadCallback(optionPageLoadCallback_block);
                    // createdBlock.setLoadOption(loadOption_block);
                    // createdBlock.setState({
                    //     [STATE_codeLine]: code
                    // });
    
                    // /** board에 블럭이 0개일 경우 */
                    // if (isFirstBlock == true) {
                    //     createdBlock.setDirection(BLOCK_DIRECTION.ROOT);
                    //     blockContainer.reNewContainerDom();
                    // /** board에 블럭이 1개 이상 일 경우 */         
                    // } else {
                    //     /** board의 가장 아래 블럭을 가져옴 */
                    //     var lastBottomBlock = blockContainer.getRootToLastBottomBlock();
                    //     lastBottomBlock.appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);
                    // }
                    // blockContainer.reRenderAllBlock_asc(); 
                    // blockContainer.resetBlockList();
                    // blockContainer.setSelectBlock(createdBlock);
    
                    // createdBlock.writeCode(`<p>${code}</p>`);
                    // createdBlock.renderSelectedBlockBorderColor(true);
                } else {
                    // add apps block
                    createdBlock = blockContainer.createBlock(BLOCK_CODELINE_TYPE.APPS, null, null, true, true);
                    createdBlock.setState({
                        apps: {
                            menu: blockContainer.apps,
                            code: code,
                            state: state
                        }
                    });
                    // set code
                    createdBlock.setState({
                        [STATE_codeLine]: 'Apps > ' + title
                    });
                    // createdBlock.writeCode(code);
                    createdBlock.apply();
                    if (isFirstBlock == true) {
                        // if it is first block, set as ROOT
                        createdBlock.setDirection(BLOCK_DIRECTION.ROOT);
                    } else {
                        var lastBottomBlock = blockContainer.getRootToLastBottomBlock();
                        lastBottomBlock.appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);
                    }
                    blockContainer.addNodeBlock(createdBlock);
                    blockContainer.resetBlockList();
                    blockContainer.reRenderAllBlock_asc();
                }
    
            }

            // 2. add cell and run cell
            if (addCell) {
                createdBlock.runThisBlock(runCell);
            }
        });

        /** Logic, API, Data Analysis 의 > 버튼 클릭 */
        $(document).on(STR_CLICK,`.vp-apiblock-panel-area-vertical-btn`, function(){
            if ($(this).hasClass(`vp-apiblock-arrow-down`)) {
                // 펼치기
                $(this).removeClass(`vp-apiblock-arrow-down`);
                $(this).addClass(`vp-apiblock-arrow-up`);
                $(this).parent().parent().removeClass(`vp-apiblock-minimize`);
            } else {
                // 닫기
                $(this).removeClass(`vp-apiblock-arrow-up`);
                $(this).addClass(`vp-apiblock-arrow-down`);
                $(this).parent().parent().addClass(`vp-apiblock-minimize`);
            }
        });
         
        /** Logic, API, Data Analysis 의 이름 클릭*/
        $(document).on(STR_CLICK,`.vp-block-blocktab-name`, function(){
            var $arrowBtn = $(this).prev();
            if ($($arrowBtn).hasClass(`vp-apiblock-arrow-down`)) {
                // 펼치기
                $($arrowBtn).removeClass(`vp-apiblock-arrow-down`);
                $($arrowBtn).addClass(`vp-apiblock-arrow-up`);
                $($arrowBtn).parent().parent().removeClass(`vp-apiblock-minimize`);
            } else {
                // 닫기
                $($arrowBtn).removeClass(`vp-apiblock-arrow-up`);
                $($arrowBtn).addClass(`vp-apiblock-arrow-down`);
                $($arrowBtn).parent().parent().addClass(`vp-apiblock-minimize`);
            }
        });

        // 추가 : 대메뉴 접기/펼치기
        $('.vp-apiblock-category').on(STR_CLICK, function() {
            var category = $(this).attr('data-category');
            // 해당 대메뉴 접기/펼치기 토글
            $('.vp-block-group-box-' + category).toggle();
        });

        /** 2021-01-28 수정: 주피터쪽을 선택한다고 VisualPython의 포커스를 변경하지 않도록 수정
         *  2021-02-10 수정: 주피터쪽 선택 여부는 체크, 대신 VisualPython의 작업환경을 초기화하지 않도록 수정
         */
        /** visual python 화면 이외에 화면(jupyter header 영역 , jupyter cell 영역)을 클릭했을 때, 
         *  page 포커스 해제 
         *  option (N/A) 처리
         *  selected 된 블럭 해제 */
        $(vpCommon.wrapSelector(`${VP_ID_PREFIX}${STR_NOTEBOOK}, 
                                 ${VP_ID_PREFIX}${STR_HEADER}, 
                                 ${VP_CLASS_PREFIX}${STR_CELL}, 
                                 ${VP_CLASS_PREFIX}${STR_CODEMIRROR_LINES},
                                 div#notebook`)).click(function(event) {
            // blockContainer.resetBlockList();
            // blockContainer.resetOptionPage();
            blockContainer.setFocusedPageType(FOCUSED_PAGE_TYPE.NULL);
        });
        
        /** Create block buttons page를 클릭했을 때 */
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BUTTONS)).click(function(event) {
            blockContainer.setFocusedPageType(FOCUSED_PAGE_TYPE.BUTTONS);
        });

        /** Block Board page를 클릭했을 때 */
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD)).click(function(event) {
            /** Board에서 Board page를 클릭하고, block을 클릭하지 않았을 때 */
            if ($(event.target).hasClass('vp-apiblock-board-body') 
                    || $(event.target).hasClass('vp-block-container')) {
                blockContainer.checkModified();
                blockContainer.checkSaveOptionPage(function(result) {
                    blockContainer.resetBlockList();
                    blockContainer.resetOptionPage();
                });
            }
        });

        /** Block Board 위 Input 영역을 클릭했을 때 */
        $(vpCommon.wrapSelector(VP_ID_PREFIX + "vp_apiblock_board_main_title")).click(function(event) {
            blockContainer.setFocusedPageType(FOCUSED_PAGE_TYPE.BOARD_TITLE);
        });

        /** Board Main Title에서 엔터키 눌렀을 때 */
        $(vpCommon.wrapSelector(VP_ID_PREFIX + "vp_apiblock_board_main_title")).keyup(function(event) {
            var keyCode = event.keyCode ? event.keyCode : event.which;
            if (keyCode == NUM_ENTER_KEY_EVENT_NUMBER) {
                blockContainer.setFocusedPageType(FOCUSED_PAGE_TYPE.NULL);
                $(this).find('input').blur();
            }
        });

        /** Board File Name changed */
        $(vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_BOARD_MAKE_NODE_BLOCK_INPUT)).change(function(event) {
            // reset path
            $(vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_BOARD_MAKE_NODE_PATH)).val('');
        });

        /** API List를 클릭했을 때*/
        $(vpCommon.wrapSelector(VP_ID_PREFIX + VP_ID_APIBLOCK_LEFT_TAP_APILIST_PAGE)).click(function(event) {
            blockContainer.setFocusedPageType(FOCUSED_PAGE_TYPE.API_LIST_TAB);
        });

        /** Option page를 클릭했을 때 */
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_OPTION_TAB)).click(function(event) {
            blockContainer.setFocusedPageType(FOCUSED_PAGE_TYPE.OPTION);
        });
        
        /** 블럭 복사하고 붙여넣는 기능 이벤트 바인딩 */
        $(document).ready(function() {
            var ctrlDown = false,
                ctrlKey = 17,
                cmdKey = 91,
                vKey = 86,
                cKey = 67;
        
            $(document).keydown(function(e) {
                if (e.keyCode == ctrlKey || e.keyCode == cmdKey) {
                    ctrlDown = true;
                }
            }).keyup(function(e) {
                if (e.keyCode == ctrlKey || e.keyCode == cmdKey) {
                    ctrlDown = false;
                }
            }).click(function(e) {
                // check modified
                blockContainer.checkModified();
            });

            $(document).change($(vpCommon.wrapSelector('.vp-apiblock-option input')), function() {
                // check modified
                blockContainer.checkModified();
            });

            // DEPRECATED: ctrl+c / ctrl+v 삭제
            // $(document).keydown(function(e) {
            //     /** board에 선택한 블럭 없거나
            //     *  TEXT 블럭인 경우에 ctrl + c , ctrl + v 금지
            //     */
            //     var selectedBlock = blockContainer.getSelectBlock();
            //     if (!selectedBlock 
            //         || selectedBlock.getBlockType() == BLOCK_CODELINE_TYPE.TEXT
            //         || IsCodeBlockType(selectedBlock.getBlockType()) == true ) {
            //         return;
            //     }   
            //     // console.log('selectedBlock',selectedBlock);

            //     /** ctrl + c */
            //     if (ctrlDown 
            //         && e.ctrlKey && (e.keyCode == cKey)
            //         && !e.shiftKey && !e.altKey ) {
            //         blockContainer.setCtrlSaveData();
            //     }
              
            //     /** ctrl + v */
            //     if (ctrlDown 
            //         && e.ctrlKey && (e.keyCode == vKey) 
            //         && !e.shiftKey && !e.altKey ) {
            //         blockContainer.copyCtrlSaveData();
            //     }
            // });
        });

        /** tab button click */
        $(document).on(STR_CLICK, VP_CLASS_PREFIX + 'vp-apiblock-tab-button', function() {
            var type = $(this).data('type');
            $(VP_CLASS_PREFIX + 'vp-apiblock-tab-button').removeClass('selected');
            $(this).addClass('selected');
            if (type == 'menu') {
                $(vpCommon.wrapSelector('.vp-apiblock-left')).show();
                $(vpCommon.wrapSelector('.vp-apiblock-right')).hide();
            } else if (type == 'board') {
                $(vpCommon.wrapSelector('.vp-apiblock-left')).hide();
                $(vpCommon.wrapSelector('.vp-apiblock-right')).show();
            }
        });

        /** +code 블럭 생성 버튼 클릭 함수 바인딩 */
        $(document).on(STR_CLICK, VP_ID_PREFIX + VP_ID_APIBLOCK_NODE_BLOCK_PLUS_BUTTON, function() {
            // blockContainer.createNodeBlock(true);
            // +code 블럭 생성
            blockContainer.createCodeBlock();
        });

        /** +text 블럭 생성 버튼 클릭 함수 바인딩 */
        $(document).on(STR_CLICK, VP_ID_PREFIX + VP_ID_APIBLOCK_TEXT_BLOCK_PLUS_BUTTON, function() {
            blockContainer.createTextBlock();
        });

        /** option page - preview 버튼 클릭 함수 바인딩 */
        $(document).on(STR_CLICK, VP_ID_PREFIX + VP_APIBLOCK_BOARD_OPTION_PREVIEW_BUTTON, function() {
            var selectedBlock = blockContainer.getSelectBlock();
            if (selectedBlock == null) {
                blockContainer.hideOptionPreviewBox();
                if ($(this).hasClass('enabled')) {
                    blockContainer.resetOptionPage();
                    $(this).removeClass('enabled');
                } else {
                    blockContainer.showOptionPageWithPreview();
                    $(this).addClass('enabled');
                }
            } else {
                if ($(this).hasClass('enabled')) {
                    blockContainer.hideOptionPreviewBox();
                    $(this).removeClass('enabled');
                } else {
                    blockContainer.showOptionPreviewBox();
                    $(this).addClass('enabled');
                }
            }
        });

        /** option page - cancel button click */
        $(document).on(STR_CLICK, VP_ID_PREFIX + VP_APIBLOCK_BOARD_OPTION_CANCEL_BUTTON, function() {
            blockContainer.cancelBlock();
        });

        /** option page - run detail button click */
        $(document).on(STR_CLICK, VP_ID_PREFIX + 'vp_apiblock_board_option_detail_button', function(evt) {
            evt.stopPropagation();
            $(VP_CLASS_PREFIX + 'vp-apiblock-option-detail-box').show();
        });

        $(document).on(STR_CLICK, VP_CLASS_PREFIX + 'vp-apiblock-option-detail-item', function(evt) {
            var type = $(this).data('type');
            if (type == 'add') {
                // apply it and add cell
                var appliedBlock = blockContainer.applyBlock();

                if (appliedBlock) {
                    // #11 applied! popup
                    vpCommon.renderSuccessMessage('Applied!');

                    // #10 scroll to selected/applied block
                    var appliedBlockDom = appliedBlock.getBlockMainDom();
                    $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD).animate({scrollTop: $(appliedBlockDom).position().top}, "fast");

                    // add and not run
                    appliedBlock.runThisBlock(false);
                }
            } else if (type == 'apply') {
                // apply it
                var appliedBlock = blockContainer.applyBlock();

                if (appliedBlock) {
                    // applied! popup
                    vpCommon.renderSuccessMessage('Applied!');

                    // scroll to applied block
                    var appliedBlockDom = appliedBlock.getBlockMainDom();
                    $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD).animate({scrollTop: $(appliedBlockDom).position().top}, "fast");
                }
            }
        });

        /** option page - run button click */
        // $(document).on(STR_CLICK, VP_ID_PREFIX + VP_APIBLOCK_BOARD_OPTION_APPLY_BUTTON, function() {
        $(document).on(STR_CLICK, VP_ID_PREFIX + 'vp_apiblock_board_option_run_button', function() {
            var appliedBlock = blockContainer.applyBlock();

            if (appliedBlock) {
                // #11 applied! popup
                vpCommon.renderSuccessMessage('Applied!');

                // #10 scroll to selected/applied block
                var appliedBlockDom = appliedBlock.getBlockMainDom();
                $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD).animate({scrollTop: $(appliedBlockDom).position().top}, "fast");

                appliedBlock.runThisBlock();
            }
        });

        /**
         * API List item 클릭 이벤트 함수 바인딩
         * API List 목록의 함수에 대응되는 API List 블럭을 생성하기 위해서
         */ 
        $(document).off(STR_CLICK,VP_CLASS_PREFIX + vpConst.LIST_ITEM_LIBRARY + 'li');
        $(document).on(STR_CLICK, VP_CLASS_PREFIX + vpConst.LIST_ITEM_LIBRARY + 'li', function(event) {
            event.stopPropagation();
            if ($(this).hasClass(vpConst.LIST_ITEM_LIBRARY_GROUP)) {
                toggleApiListSubGroupShow($(this));
            } else if ($(this).hasClass(vpConst.LIST_ITEM_LIBRARY_FUNCTION)) {
                const funcID = $(this).data(vpConst.LIBRARY_ITEM_DATA_ID.replace(vpConst.TAG_DATA_PREFIX, ""));
                var naviInfo = getNavigationInfo(funcID);

                /** board에 선택한 API List 블럭 생성 */
                blockContainer.createAPIListBlock(funcID, naviInfo);
            }
        });


        /** API Block의 option을 화면 좌우로 resize하는 이벤트 함수 */
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_OPTION_TAB)).resizable({
            containment: STR_PARENT, // 부모 dom을 기준으로 resize -> 확실하진 않지만 'parent'라고 되어있어서 추정
            handles: 'w', // 'w'는 width 좌우  'h'는 상하 height
            resizeHeight: false // height resize 금지
            // resize 할 경우 계속 실행
            ,resize:(function() {
                blockContainer.setIsOptionPageResize(true);
                blockContainer.resizeOptionPopup();
            })
            // resize 끝나면 멈춤
            ,stop: function(event, ui) { 
                blockContainer.setIsOptionPageResize(false);
            }
        });
        
        /** 햄버거 메뉴 open 클릭 */
        $(document).on(STR_CLICK, vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_OPEN_NOTE)), function() {
            var saveFileName = $(VP_ID_PREFIX + VP_ID_APIBLOCK_BOARD_MAKE_NODE_BLOCK_INPUT).val();
            /** 빈 string이거나 
             *  Untitled이면 File navigation을 open */
            if ( saveFileName == STR_EMPTY
                 || saveFileName == STR_UNTITLED) {
                openNotePage();
             /** File navigation을 open하지 않고 alert창 띄움*/    
            } else {
                var saveFilePath = vpCommon.formatString("./{0}.{1}", saveFileName, vpConst.VP_NOTE_EXTENSION);
                apiBlockPackage.openMultiBtnModal_new('Save As', `Save changes to '${saveFileName}.vp'`,['Yes','No', 'Cancel'], [() => {
                    saveNotePageAction_newVersion(saveFileName, saveFilePath);
                    openNotePage();

                },() => {
                    openNotePage();
                    
                },() => {
                    
                }]);
            }
        });

        /** 햄버거 메뉴 save 저장 클릭 */
        $(document).on(STR_CLICK, vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_SAVE_NOTE)), function() {
            var saveFileName = $(VP_ID_PREFIX + VP_ID_APIBLOCK_BOARD_MAKE_NODE_BLOCK_INPUT).val();
            var saveFilePath = $(VP_ID_PREFIX + VP_ID_APIBLOCK_BOARD_MAKE_NODE_PATH).val(); // path

            // TEST: File Navigation
            // var state = {
            //     fileType: FileNavigation.SAVE_FILE

            // };
            // var fileNavigation = new FileNavigation(FileNavigation.FILE_TYPE.SAVE_VP_NOTE, state);
            // fileNavigation.open();
            // return;

            /** 빈 string이거나 
             *  Untitled이면 File navigation을 open */
            if ( saveFileName == STR_EMPTY
                || saveFileName == STR_UNTITLED) {
                saveAsNotePage();
                closeNoteExtraMenu();
            /** File navigation을 open하지 않고 alert창 띄움*/
            } else {
                if (!saveFilePath.includes(saveFileName)) {
                    // 다른 파일이면 save as
                    saveAsNotePage();
                    closeNoteExtraMenu();
                } else {
                    var saveFilePath = vpCommon.formatString("{0}", saveFilePath, vpConst.VP_NOTE_EXTENSION);
                    saveNotePageAction_newVersion(vpCommon.formatString("{0}.{1}", saveFileName, vpConst.VP_NOTE_EXTENSION), saveFilePath);
                    // apiBlockPackage.openMultiBtnModal_new('Save As', `Save changes to '${saveFileName}.vp'`,['Yes', 'No', 'Cancel'], [() => {
                    // },() => {
                        
                    // },() => {
                        
                    // }]);
                }
            }
        });

        /** 햄버거 메뉴 save as 다른 이름으로 저장 클릭 이벤트 함수 */
        $(document).on(STR_CLICK, vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_SAVE_AS_NOTE)), function() {
            saveAsNotePage();
            closeNoteExtraMenu();
        });

        /**
         * 파일 브라우저 로드 파일 선택
         */
        $(document).on("fileReadSelected.fileNavigation", function(e) {
            // 선택 파일 확장자가 노트 세이브 파일인 경우만 동작
            if (e.file.substring(e.file.lastIndexOf(".") + 1) === vpConst.VP_NOTE_EXTENSION) {
                openNotePageAction_newVersion();
            }
        });

        /**
         * 파일 브라우저 저장 파일 선택
         */
        $(document).on("fileSaveSelected.fileNavigation", function(e) {
            // 선택 파일 확장자가 노트 세이브 파일인 경우만 동작
            if (e.file.substring(e.file.lastIndexOf(".") + 1) === vpConst.VP_NOTE_EXTENSION) {
                var selectedPath = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_REAL_FILE_PATH))).val();
                var saveFileName = selectedPath.substring(selectedPath.lastIndexOf("/") + 1);

                saveNotePageAction_newVersion(saveFileName, selectedPath);
            }
        });

        $(document).on('click', function(evt) {
            if (evt.target.id != 'vp_apiblock_menu_box') {
                // close block menu
                $(vpCommon.wrapSelector(vpCommon.formatString('#{0}', VP_ID_APIBLOCK_MENU_BOX))).hide();
            }
            if (evt.target.id != 'vp_menuAppsContainer'
                && evt.target.id != 'vp_menuApps') {
                // close apps menu
                $(vpCommon.wrapSelector('#vp_menuAppsContainer')).removeClass('show');
            }
            if (!$(evt.target).hasClass('vp-temp-popup-menu')) {
                $('.vp-temp-popup-menu').hide();
            }
            if (evt.target.id != 'vp_apiblock_board_option_detail_button') {
                $(VP_CLASS_PREFIX + 'vp-apiblock-option-detail-box').hide();
            }
            if (evt.target.id != 'vp_apiblock_board_option_preview_button'
                && $(vpCommon.wrapSelector('.vp-apiblock-option-preview-container')).has(evt.target).length === 0) {
                blockContainer.hideOptionPreviewBox();
                $(VP_ID_PREFIX + VP_APIBLOCK_BOARD_OPTION_PREVIEW_BUTTON).removeClass('enabled');
            }
        });

        ControlToggleInput();
        return blockContainer;
    }

    var apiLibariesToBtn = function(blockContainer, libObj, parentId = '') {
        if (libObj._type == undefined // root
            || libObj._type == 'package') {
            // 패키지인 경우 그룹 생성
            if (libObj._name != undefined) {
                if (libObj._level == 0) {
                    var open = false;
                    if (libObj._name == 'Common'
                        || libObj._name == 'Pandas') {
                        // Common은 처음에 열어놓고 시작
                        open = true;
                    }
                    new CreateGroup(blockContainer, libObj._id, libObj._name, VP_CLASS_PREFIX + 'vp-block-group-box-api', libObj._level, open);
                } else {
                    new CreateGroup(blockContainer, libObj._id, libObj._name, VP_CLASS_PREFIX + 'vp-apiblock-left-tab-' + parentId, libObj._level);
                }
            }
            // 하위 아이템 있으면 다시 호출
            if (libObj.item) {
                if (typeof libObj.item == "object") {
                    if (Array.isArray(libObj.item)) {
                        // item이 array일 경우
                        libObj.item.forEach(obj => {
                            apiLibariesToBtn(blockContainer, obj, libObj._id);
                        });
                    } else {
                        // 단일 항목일 경우
                        apiLibariesToBtn(blockContainer, libObj.item, libObj._id);
                    }
                }
            }
        } else if (libObj._type == 'function' && libObj.level != "0") {
            // 함수인 경우 버튼 생성 (단, level은 0 이상)
            // parentId 없는 경우 생성안함
            if (parentId != undefined && parentId !== STR_EMPTY) {
                new CreateApiBtn(blockContainer, libObj._id, libObj._name, parentId);
            }
        }
    }

    return init;
});
