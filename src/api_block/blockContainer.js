const { now } = require("jquery");

define([
    'require'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/common/metaDataHandler'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'

    , './shadowBlock.js'
    , './api.js'
    , './api_list.js'
    , './constData.js'
    , './block.js'

    , './component/blockMenu.js'

    , 'nbextensions/visualpython/src/common/vpPopupPage'

    , 'codemirror/lib/codemirror'
], function (requirejs, vpCommon, vpFuncJS, md, vpConst, sb,
              shadowBlock, api, api_list, constData, block, BlockMenu
              , popupPage
              , codemirror) {

    const { RemoveSomeBlockAndGetBlockList
        
            , IsCodeBlockType
            , IsDefineBlockType
            , IsCanHaveIndentBlock    
            , IsNodeTextBlockType 
            , RenderHTMLDomColor
    
            , GenerateClassInParamList
            , GenerateDefCode
            , GenerateReturnCode
            , GenerateIfCode
            , GenerateExceptCode
            , GenerateForCode
            , GenerateLambdaCode

            , GenerateWhileCode

            , ShowImportListAtBlock } = api;

    const {  BLOCK_CODELINE_TYPE
            , BLOCK_DIRECTION
            , FOCUSED_PAGE_TYPE
            , DEF_BLOCK_ARG6_TYPE
        
            , VP_CLASS_PREFIX 

            , VP_CLASS_BLOCK_NUM_INFO
            , VP_CLASS_BLOCK_CONTAINER
            , VP_CLASS_APIBLOCK_MAIN
            , VP_CLASS_APIBLOCK_BOARD
            , VP_CLASS_APIBLOCK_BOARD_CONTAINER
            , VP_CLASS_APIBLOCK_BUTTONS
            , VP_CLASS_APIBLOCK_OPTION_TAB
            , VP_CLASS_APIBLOCK_OPTION_TAB_SELECTOR
            , VP_CLASS_BLOCK_SUB_BTN_CONTAINER
            , VP_CLASS_BLOCK_BOTTOM_HOLDER
            , VP_BLOCK_BLOCKCODELINETYPE_CLASS_DEF

            , VP_APIBLOCK_BOARD_OPTION_PREVIEW_BUTTON
            , VP_APIBLOCK_BOARD_OPTION_CANCEL_BUTTON
            , VP_APIBLOCK_BOARD_OPTION_APPLY_BUTTON

            , VP_ID_PREFIX
            , VP_ID_WRAPPER

            , NUM_INDENT_DEPTH_PX
            , NUM_DEFAULT_POS_Y
            , NUM_DEFAULT_POS_X
            , NUM_NODE_OR_TEXT_BLOCK_MARGIN_TOP_PX
            , NUM_BLOCK_MAX_WIDTH
            , NUM_TEXT_BLOCK_WIDTH
            , NUM_OPTION_PAGE_WIDTH
            , NUM_OPTION_PAGE_MIN_WIDTH
            , NUM_BUTTONS_PAGE_WIDTH
            , NUM_API_BOARD_CENTER_PAGE_MIN_WIDTH
            
            , VP_BLOCK

        
            , NUM_SHADOWBLOCK_OPACITY
    
            , STR_CLICK
            , STR_EMPTY
            , STR_TOP
            , STR_LEFT
            , STR_DIV
            , STR_PX
            , STR_HEIGHT
            , STR_WIDTH
            , STR_MARGIN_LEFT
            , STR_MAX_WIDTH
            , STR_MIN_WIDTH
            , STR_KEYWORD_NEW_LINE
            , STR_COLOR
            , STR_BOX_SHADOW
            , STR_BACKGROUND_COLOR
            , STR_TRANSPARENT
            , STR_OPACITY      
            , STR_MARGIN_TOP
            , STR_TEXT_BLOCK_MARKDOWN_FUNCID
            , STR_DISPLAY
            , STR_BLOCK
            , STR_NONE 
            , STR_SAMPLE_TEXT

            , STATE_className
            , STATE_defInParamList
            , STATE_codeLine

            , STATE_defName
            
            , COLOR_CLASS_DEF

            , STR_BORDER } = constData;
 
    const { Block } = block;
    const ShadowBlock = shadowBlock; 

    const { setClosureBlock
            , loadOption_block
            , loadOption_textBlock
            , optionPageLoadCallback_block
            , makeUpGreenRoomHTML
            , getNavigationInfo  } = api_list;

    var BlockContainer = function() {
        this.importPackageThis = null;

        /** 현재 블럭 list */
        this.blockList = [];
        /** 이전 블럭 list */
        this.prevBlockList = [];
        /** node 블럭 list */
        this.nodeBlockList = [];
        /** text 블럭 list */
        this.textBlockList = [];
        this.loadedVariableList = [];

        // API Block 햄버거 메뉴바를 open하면 true, close하면 false
        this.isMenubarOpen = false; 

        /**  API Block 햄버거 메뉴에서 depth를 보여줄지 말지 결정 가능 
         *  true면 보여주고 false면 안 보여줌
         */
        this.isShowDepth = true;  

        /** API List를 보여줄지 말지 결정 
         *  true면 보여주고 false면 안 보여줌
         */
        this.isAPIListPageOpen = true; 

        /** option popup을 resize하면 true
         * resize가 끝나면 false
         * 
         * option popup이 끝난 상태(isOptionPageResize = false) 이어야
         * visual python 전체 resize 기능 가능
         */
        this.isOptionPageResize = false; 

        this.classNum = 1;
        this.defNum = 1;
        this.nodeBlockNumber = 1;

        /** 현재 작업하고 있는 API Block 영역의 데이터를 저장 
         * 영역은 총 4가지 FOCUSED_PAGE_TYPE
        */
        this.focusedPageType = null;

        /** option popup의 width값 지정 
         * 이후 resize를 통해 늘어나거나 줄어들 수 있음 
        */
        this.optionPageWidth = NUM_OPTION_PAGE_WIDTH;

        /** block의 width 값. 기본은 300. 
         * 이후 resize를 통해 늘어나거나 줄어들 수 있음 */
        this.blockMaxWidth = NUM_BLOCK_MAX_WIDTH;

        this.scrollHeight = 0;

        /** 현재 작업 중이거나, 클릭한 블럭을 selectedBlock에 저장함 
         *  현재 작업 중이거나, 클릭한 블럭이 무엇인지 알기 위해서 필요
         */
        this.selectedBlock = null;
        this.prevSelectedBlock = null;

        this.copyBlock_last = null;
        this.copyBlock_first = null;

        this.blockContainerDom = null;

        /** generateCode를 실행하면 이 데이터로 실행 */
        this.code = STR_EMPTY;

        this.mdHandler = null;  

        this.domPool = new Map();

        var cmReadonlyConfig = {
            mode: {
                name: 'python',
                version: 3,
                singleLineStringErrors: false
            },  // text-cell(markdown cell) set to 'htmlmixed'
            height: '100%',
            width: '100%',
            indentUnit: 4,
            matchBrackets: true,
            readOnly:true,
            autoRefresh: true,
            // lineWrapping: false, // text-cell(markdown cell) set to true
            // indentWithTabs: true,
            theme: "ipython",
            extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},
            scrollbarStyle: "null"
        };
        this.cmOverallPreview = codemirror.fromTextArea($('#vp_overallCodePreview')[0], cmReadonlyConfig);
        this.cmOptionPreview = codemirror.fromTextArea($('#vp_optionCodePreview')[0], cmReadonlyConfig);

        // blockmenu
        this.blockMenu = new BlockMenu(this);

        // loadedAppsMenu
        this.apps = undefined;
        this.appsMenu = null;
    }

    /** Apply not saved block */
    BlockContainer.prototype.applyBlock = function() {
        var isFirstBlock = false;
        const blockList = this.getBlockList();
        /** board에 블럭이 0개 일때
         *  즉 블럭이 처음으로 생성되는 경우
         */
        if (blockList.length == 0) {
            isFirstBlock = true;
        }

        var block = this.getSelectBlock();
        if (block) {
            // blockList에 있는 블럭이면, 값 적용
            if (blockList.some(blockEle => {
                if (blockEle.getUUID() == block.getUUID()) {
                    return true;
                } else {
                    return false;
                }
            })) {
                block.saveState();
            } else {
                // blockList에 없으면, 추가
                block.apply();
                block.saveState();
                if (isFirstBlock == true) {
                    block.setDirection(BLOCK_DIRECTION.ROOT);
                    this.addNodeBlock(block);
                    // this.reNewContainerDom();
                } else {
                    this.addNodeBlock(block);
                    
                    var lastBottomBlock = this.getRootToLastBottomBlock();
                    lastBottomBlock.appendBlock(block, BLOCK_DIRECTION.DOWN);
                }
                this.reRenderAllBlock_asc();
                this.resetBlockListAndRenderThisBlock(block);
            }
            return block;
        } else {
            return null;
        }
    }

    BlockContainer.prototype.cancelBlock = function() {
        const blockList = this.getBlockList();
            var block = this.getSelectBlock();
            if (block) {
                // blockList에 있는 블럭이면, 값 되돌리기
                if (blockList.some(blockEle => {
                    if (blockEle.getUUID() == block.getUUID()) {
                        return true;
                    } else {
                        return false;
                    }
                })) {
                    block.loadState();
                    // re-render block name

                    // re-render block header
                    var codeLineStr = block.getNowCodeLine();
                    block.writeCode(codeLineStr);
                    this.resetBlockList();
                    this.resetOptionPage();
                    this.reRenderAllBlock_asc();

                } else {
                    // blockList에 없으면, 삭제
                    block.deleteBlock_childBlockList();
                    this.resetBlockList();
                    this.resetOptionPage();
                    this.reRenderAllBlock_asc();
                }
                return block;
            } else {
                return null;
            }
            
    }

    BlockContainer.prototype.checkModified = function() {
        var block = this.getSelectBlock();
        var passChecking = false;
        if (block) {
            if (block.isModified) {
                // show title alert
                $(VP_CLASS_PREFIX + 'vp-apiblock-option-new-to-save').css('display', 'block');
            } else {
                var nowState = block.state;
                var blockType = block.getBlockType();
                if (blockType == BLOCK_CODELINE_TYPE.API
                || blockType == BLOCK_CODELINE_TYPE.TEXT) {
                    var importPackage = block.getImportPakage();
                
                    // get generatedCode and save as metadata
                    if (importPackage) {
                        var code = importPackage.generateCode(false, false);
                        importPackage.metaGenerate();
                        // importPackage.metadata.code = code;
                        importPackage['metadata'] = {
                            ...importPackage['metadata'],
                            code : code
                        }
                        nowState = { 
                            ...nowState, 
                            metadata: importPackage.metadata
                        };
                    } 
                    // for api, if metadata is not loaded yet for state_backup
                    if (!importPackage || !block.state_backup || block.state_backup.metadata == null) {
                        passChecking = true;
                        block.state_backup = {
                            ...nowState
                        };
                    }
                }
                // ignore isIfElse, isFinally state (toggle state of else/finally option)
                if (blockType == BLOCK_CODELINE_TYPE.IF 
                    || blockType == BLOCK_CODELINE_TYPE.TRY) {
                        block.state_backup['isIfElse'] = nowState['isIfElse'];
                        block.state_backup['isFinally'] = nowState['isFinally'];
                }
                if (!passChecking && JSON.stringify(nowState) != JSON.stringify(block.state_backup)) {
                    // show title alert
                    $(VP_CLASS_PREFIX + 'vp-apiblock-option-new-to-save').css('display', 'block');

                    // set this block to isModified = true
                    block.isModified = true;
                } else {
                    $(VP_CLASS_PREFIX + 'vp-apiblock-option-new-to-save').css('display', 'none');
                    block.isModified = false;
                }
            }
        } else {
            $(VP_CLASS_PREFIX + 'vp-apiblock-option-new-to-save').css('display', 'none');
        }
    }

    BlockContainer.prototype.setMetahandler = function(funcID) {
        this.mdHandler = new md.MdHandler(funcID); 
    }

    BlockContainer.prototype.setImportPackageThis = function(importPackageThis) {
        this.importPackageThis = importPackageThis;
    }

    BlockContainer.prototype.getImportPackageThis = function() {
        return this.importPackageThis;
    }

    BlockContainer.prototype.setIsMenubarOpen = function(isMenubarOpen) {
        this.isMenubarOpen = isMenubarOpen;
    }
    BlockContainer.prototype.getIsMenubarOpen = function() {
        return this.isMenubarOpen;
    }

    BlockContainer.prototype.setIsShowDepth = function(isShowDepth) {
        this.isShowDepth = isShowDepth;
    }
    BlockContainer.prototype.getIsShowDepth = function() {
        return this.isShowDepth;
    }


    BlockContainer.prototype.setIsAPIListPageOpen = function(isAPIListPageOpen) {
        this.isAPIListPageOpen = isAPIListPageOpen;
    }
    BlockContainer.prototype.getIsAPIListPageOpen = function() {
        return this.isAPIListPageOpen;
    }
    
    BlockContainer.prototype.setIsOptionPageResize = function(isOptionPageResize) {
        this.isOptionPageResize = isOptionPageResize;
    }
    BlockContainer.prototype.getIsOptionPageResize = function() {
        return this.isOptionPageResize;
    }


    BlockContainer.prototype.setBlockMaxWidth = function(blockMaxWidth) {
        this.blockMaxWidth = blockMaxWidth;
    }
    BlockContainer.prototype.getBlockMaxWidth = function() {
        return this.blockMaxWidth;
    }

    /** block을 blockList에 add */
    BlockContainer.prototype.addBlock = function(block) {
        this.blockList = [...this.blockList, block];
    }

    /** blockList를 가져옴*/
    BlockContainer.prototype.getBlockList = function() {
        return this.blockList;
    }
    /** blockList를 파라미터로 받은 blockList로 덮어 씌움*/
    BlockContainer.prototype.setBlockList = function(blockList) {
        this.blockList = blockList;
    }
    
    /**
     * node 블럭 리스트를 가져옴
     */
    BlockContainer.prototype.getNodeBlockList = function() {
        return this.nodeBlockList;
    }

    /**
     * node 블럭 리스트를 오름차순으로 가져옴
     * board에서의 오름차순
     */
    BlockContainer.prototype.getNodeBlockList_asc = function() {
        var rootBlock = this.getRootBlock();
        var blockChildList = rootBlock.getThisToLastBlockList();
        var nodeBlockList = [];
        var blockContainerThis = this;
        blockChildList.forEach((block, index) => {
            if (block.getBlockType() == BLOCK_CODELINE_TYPE.NODE
                || block.isGroupBlock) {
                nodeBlockList.push(block);
            } 
        });
        return nodeBlockList;
    }

    /**
     *  node text 블럭의 리스트를 오름차순으로 가져옴
     *  board에서의 오름차순
     */
    BlockContainer.prototype.getNodeBlockAndTextBlockList_asc = function() {
        var rootBlock = this.getRootBlock();
        var blockChildList = rootBlock.getThisToLastBlockList();
        var nodeBlockList = [];
        var blockContainerThis = this;
        blockChildList.forEach((block, index) => {
            if (block.getBlockType() == BLOCK_CODELINE_TYPE.NODE
                || block.getBlockType() == BLOCK_CODELINE_TYPE.TEXT
                || block.isGroupBlock) {
                nodeBlockList.push(block);
            } 
        });
        return nodeBlockList;
    }

    BlockContainer.prototype.setNodeBlockList = function(nodeBlockList) {
        this.nodeBlockList = nodeBlockList;
    }

    /** block을 blockList에 add */
    BlockContainer.prototype.addNodeBlock = function(block) {
        this.addNodeBlockNumber();
        this.nodeBlockList = [...this.nodeBlockList, block];
    }

    BlockContainer.prototype.removeNodeBlock = function(block) {
        this.decNodeBlockNumber();
        this.nodeBlockList = this.nodeBlockList.filter(b => b.getUUID() != block.getUUID());
    }

    BlockContainer.prototype.getTextBlockList = function() {
        return this.textBlockList;
    }
    BlockContainer.prototype.setTextBlockList = function(textBlockList) {
        this.textBlockList = textBlockList;
    }

    /** block을 blockList에 add */
    BlockContainer.prototype.addTextBlock = function(block) {
        this.textBlockList = [...this.textBlockList, block];
    }
    
    /** prevBlockList를 가져옴*/
    BlockContainer.prototype.getPrevBlockList = function() {
        return this.prevBlockList;
    }
    /** prevBlockList를 파라미터로 받은 prevBlockList로 덮어 씌움*/
    BlockContainer.prototype.setPrevBlockList = function(prevBlockList) {
        this.prevBlockList = prevBlockList;
    }

    /** root block을 get */
    BlockContainer.prototype.getRootBlock = function() {
        var blockList = this.getBlockList();

        var rootBlock = null;
        blockList.some(block => {
            if (block.getDirection() == BLOCK_DIRECTION.ROOT) {
                rootBlock = block;
                return true;
            }
        });
        return rootBlock;
    }

    BlockContainer.prototype.setClassNum = function(classNum) {
        this.classNum = classNum;
    }
    BlockContainer.prototype.addClassNum = function() {
        this.classNum += 1;
    }
    BlockContainer.prototype.getClassNum = function() {
        return this.classNum;
    }

    BlockContainer.prototype.setDefNum = function(defNum) {
        this.defNum = defNum;
    }
    BlockContainer.prototype.addDefNum = function() {
        this.defNum += 1;
    }
    BlockContainer.prototype.getDefNum = function() {
        return this.defNum;
    }


    BlockContainer.prototype.setNodeBlockNumber = function(nodeBlockNumber) {
        this.nodeBlockNumber = nodeBlockNumber;
    }
    BlockContainer.prototype.addNodeBlockNumber = function() {
        this.nodeBlockNumber += 1;
    }
    BlockContainer.prototype.decNodeBlockNumber = function() {
        this.nodeBlockNumber -= 1;
    }
    BlockContainer.prototype.getNodeBlockNumber = function() {
        return this.nodeBlockNumber;
    }

    BlockContainer.prototype.getMaxWidth = function() {
        var maxWidth = $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD_CONTAINER)).width();
        return maxWidth;
    }

    BlockContainer.prototype.getMaxHeight = function() {
        var maxHeight = $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD_CONTAINER)).height();
        return maxHeight;
    }

    BlockContainer.prototype.getScrollHeight = function() {
        return this.scrollHeight;
    }
    BlockContainer.prototype.setScrollHeight = function(scrollHeight) {
        this.scrollHeight = scrollHeight;
    }

    BlockContainer.prototype.setBlockContainerDom = function(blockContainerDom) {
        this.blockContainerDom = blockContainerDom;
    }
    BlockContainer.prototype.getBlockContainerDom = function() {
        return this.blockContainerDom;
    }

    BlockContainer.prototype.setSelectBlock = function(selectedBlock) {
        this.selectedBlock = selectedBlock;

        this.setOptionPreviewBox(selectedBlock);
    }
    BlockContainer.prototype.getSelectBlock = function() {
        return this.selectedBlock;
    }

    BlockContainer.prototype.setPrevSelectBlock = function(prevSelectedBlock) {
        this.prevSelectedBlock = prevSelectedBlock;
    }
    BlockContainer.prototype.getPrevSelectBlock = function() {
        return this.prevSelectedBlock;
    }

    BlockContainer.prototype.getAPIBlockCode = function() {
        return this.code;
    }
    BlockContainer.prototype.setAPIBlockCode = function(code) {
        this.code = code;
    }
    /**
     * API Block은 크게 4가지 영역으로 나뉨
     * 1. Logic
     * 2. Board 
     * 3.     - Board 위에 node 블럭 생성 input 칸
     * 4. Option popup
     * 
     * 각 영역에서 작업을 할 때, 
     * 내부적으로 focus해서 어느 영역에서 작업하는지 알고 있기 위해 FocusedPageType 지정
     * 예전에는 초록색 border로 영역을 지정했으니 현재는 삭제하여 보여지지는 않음
     * @param {ENUM} focusedPageType 
     */
    BlockContainer.prototype.setFocusedPageType = function(focusedPageType) {
        // 추가: FOCUSED_PAGE_TYPE = NULL일 경우 주피터 단축키 활성화 / 아닐 경우 비활성화
        if (focusedPageType == FOCUSED_PAGE_TYPE.NULL) {
            // Jupyter.notebook.keyboard_manager.enable();
        } else {
            // Jupyter.notebook.keyboard_manager.disable();
        }
        this.focusedPageType = focusedPageType;
    }
    BlockContainer.prototype.getFocusedPageType = function() {
        return this.focusedPageType;
    }

    /** blockList에서 특정 block을 삭제
     * @param {string} blockUUID
     */
    BlockContainer.prototype.deleteBlock = function(blockUUID) {
        /** blockList를 돌며 삭제하고자 하는 block을 찾아 제거
         */
        var blockList = this.getBlockList();
        blockList.some((block, index) => {
            if (block.getUUID() == blockUUID) {
                delectedIndex = index;
                blockList.splice(index, 1);
                return true;
            } else {
                return false;
            }
        });
    }

    /** Blocklist의 block들 전부삭제 */
    BlockContainer.prototype.deleteAllBlock = function() {
        var rootBlock = this.getRootBlock();
        if (rootBlock) {
            var blockList = this.getBlockList();
            blockList.forEach(block => {
                block.reConnectPrevBlock();
                block.deleteBlockDomAndData();
            });
            this.setBlockList([]);
            this.setPrevBlockList([]);

            this.resetOptionPage();
    
            this.setFocusedPageType(FOCUSED_PAGE_TYPE.EDITOR);
            this.reNewContainerDom();
            this.reRenderAllBlock_asc();
        }
    }

    /** nodeBlockList에서 특정 block을 삭제
     * @param {string} blockUUID
     */
    BlockContainer.prototype.deleteNodeBlock = function(blockUUID) {
        var nodeBlockList = this.getNodeBlockList();
        nodeBlockList.some((block, index) => {
            if (block.getUUID() == blockUUID) {
                nodeBlockList.splice(index, 1);
                return true;
            } else {
                return false;
            }
        });
    }

    /** 블럭 데이터 복사 */
    BlockContainer.prototype.setCtrlSaveData = function() {
        var selectedBlock = this.getSelectBlock();
        var childBlockList = selectedBlock.getBlockList_thisBlockArea();
        var blockList_cloned = this.copyBlockList(childBlockList);

        this.copyBlock_before = selectedBlock.getLastBlock_from_thisBlockArea();
        this.copyBlock_first = blockList_cloned[0];

        selectedBlock.renderSelectedBlockBorderColor(true);
    }

    /** 복사한 블럭 데이터 copy해서 board에 렌더링 */
    BlockContainer.prototype.copyCtrlSaveData = function() {
        this.copyBlock_before.appendBlock(this.copyBlock_first, BLOCK_DIRECTION.DOWN);
                    
        this.reRenderAllBlock_metadata();
        vpCommon.renderSuccessMessage('Blocks copy success!');

        this.copyBlock_first.renderSelectedBlockBorderColor(true)
    }

    /** 인자로 받은 블럭 데이터 list 복사 */
    BlockContainer.prototype.copyBlockList = function(copyedBlockList) {
        var apiBlockJsonDataList = this.blockToJson(copyedBlockList);

        var uuid_hable = [];
        apiBlockJsonDataList.forEach((blockData,index) => {
            const { UUID } = blockData;
            uuid_hable[UUID] = {
                oldUUID: UUID
                , newUUID: vpCommon.getUUID()
            }
        });

        apiBlockJsonDataList.forEach((blockData,index) => {
            var newChildBlockUUIDList = [];
            blockData.childBlockUUIDList.forEach(uuid => {
                if (uuid_hable[uuid] != undefined) {
                    newChildBlockUUIDList.push(uuid_hable[uuid].newUUID);
                }
            });

            blockData.childBlockUUIDList = newChildBlockUUIDList;
            blockData.UUID = uuid_hable[blockData.UUID].newUUID;
        });

        var createdBlockList = this.jsonToBlock(apiBlockJsonDataList);
        return createdBlockList;
    }

    BlockContainer.prototype.makeAPIBlockMetadata = function() {
        var rootBlock = this.getRootBlock();
        if (!rootBlock) {
            return [];
        }

        var childBlockList = rootBlock.getThisToLastBlockList();
        var apiBlockJsonDataList = this.blockToJson(childBlockList);
        return apiBlockJsonDataList;
    }

    /** Block list을 json 데이터로 변환
     * @param {Array<Block>} blockList
     */
    BlockContainer.prototype.blockToJson = function(blockList) {
        var apiBlockJsonDataList = [];
        blockList.forEach( (block, index) => {
            if (block.getBlockType() == BLOCK_CODELINE_TYPE.API) {
                // FIXME: Text 블럭 Metadata load/save 검증 필요
                //|| block.getBlockType() == BLOCK_CODELINE_TYPE.TEXT) {
                block.setMetadata();
            }

            /** 자식 블럭 리스트 중에 uuid만 뽑아서 리턴 */
            var childBlockUUIDList = block.getChildBlockList().map(childBlock => {
                return childBlock.getUUID();
            });
            apiBlockJsonDataList[index] = {
                UUID: block.getUUID()
                , childBlockUUIDList
                , blockType: block.getBlockType()
                , blockName: block.getBlockName()
                , blockOptionState: block.state
                , blockDepth: block.getDepth()
                , blockDirection: block.getDirection()
                , isGroupBlock: block.isGroupBlock
            }
        });
        return apiBlockJsonDataList;
    }

    /** 인자로 들어온 json list을 Block 데이터로 변환 
     * @param {Array<JSON>} apiBlockJsonDataList
    */
    BlockContainer.prototype.jsonToBlock = function(apiBlockJsonDataList) {
        var createdBlockList = [];
        var createdBlock = null;
        apiBlockJsonDataList.forEach( (blockData, index) => {
            const { UUID
                    , childBlockUUIDList // 새 버전
                    , nextBlockUUIDList // childBlockUUIDList변수가 쓰이지 않은 기존 버전 호환을 위한 변수
                    , blockType
                    , blockName
                    , blockOptionState
                    , blockDepth
                    , blockDirection
                    , isGroupBlock } = blockData;

            createdBlock = this.createBlock(blockType, blockData, null, isGroupBlock);
            createdBlock.apply();
            createdBlock.setUUID(UUID);
            createdBlock.setDepth(blockDepth);
            createdBlock.setDirection(blockDirection);
            createdBlock.setBlockName(blockName);
            createdBlock.state = {
                ...createdBlock.state
                , blockOptionState
            };
            createdBlock.setChildBlockUUIDList(childBlockUUIDList || nextBlockUUIDList);
            
            createdBlockList.push(createdBlock);
        });

        var childBlockUUIDList = [];
        createdBlockList.forEach((createdBlock,index) => {
            childBlockUUIDList = createdBlock.getChildBlockUUIDList();
            childBlockUUIDList.forEach(uuid => {
                createdBlockList.forEach(nextCreatedBlock => {
                    if (uuid == nextCreatedBlock.getUUID()) {
                        nextCreatedBlock.setPrevBlock(createdBlock);
                        createdBlock.addChildBlockList(nextCreatedBlock);
                    }           
                });
            });
        });
        return createdBlockList;
    }
    
    /** 블럭 이동시 모든 블럭의 left shadow 계산 */
    BlockContainer.prototype.reLoadBlockListLeftHolderHeight = function() {
        const blockContainerThis = this;
        const blockList = blockContainerThis.getBlockList();
        blockList.forEach(block => {
            const blockType = block.getBlockType();
            if ( IsCanHaveIndentBlock(blockType) == true ) {
                block.calculateLeftHolderHeightAndSet();
                const distance = block.getBlockLeftShadowHeight();
                $(block.getBlockLeftShadowDom()).css(STR_HEIGHT, distance);
            } 
        });
    }

    /**
     * board에 있는 블럭들 다시 렌더링
     */
    BlockContainer.prototype.reRenderAllBlock = function() {
        this.reRenderBlockList_prefix();
        this.reRenderBlockList();
    }
    
    /**
     * board에 있는 블럭들 다시 렌더링 (오름차순으로)
     */
    BlockContainer.prototype.reRenderAllBlock_asc = function() {
        this.reRenderBlockList_prefix(true);
        this.reRenderBlockList();

    }

    /**
     * board에 있는 블럭들 다시 렌더링 - vpnote 데이터(metadata)를 기반으로
     */
    BlockContainer.prototype.reRenderAllBlock_metadata = function() {
        this.reRenderBlockList_prefix(true);
        this.reRenderBlockList(true);
    }

    /**
     * block의 depth를 계산하고 block 앞에 depth 를 보여주는 함수
     ** Block 앞에 line number를 정렬
      * isAsc true면 오름차순 정렬
     *
     */
    BlockContainer.prototype.reRenderBlockList_prefix = function(isAsc) {
        var blockContainerThis = this;
        const rootBlock = this.getRootBlock();
        if (rootBlock) {
            //** rootBlock의 아래에 있는 블럭들을 순서대로 가져옴 */
            const childBlockList = rootBlock.getThisToLastBlockList();
            childBlockList.forEach((block) => {
                /** 블럭 depth 계산하고 저장 */
                var depth = block.calculateDepthAndGet();
                block.setDepth(depth);

                var indentPxNum = block.getIndentNumber();
                var numWidth = 0;
                var blockType = block.getBlockType();


                /** 블럭의 WIDTH값을 계산 */
                // DEPRECATED : TEXT Block도 일반 블럭과 동일하게 너비 계산
                // if (blockType == BLOCK_CODELINE_TYPE.TEXT) {
                //     numWidth = NUM_TEXT_BLOCK_WIDTH;
                // } else {
                    numWidth = this.getBlockMaxWidth() - indentPxNum;
                // }
                var blockMainDom = block.getBlockMainDom();
                $(blockMainDom).css(STR_MARGIN_LEFT, indentPxNum);
                $(blockMainDom).css(STR_WIDTH, numWidth);

                /** 0 depth는 opacity 0으로 처리
                 *  1 이상의 depth는 opacity 1로 처리
                 */
                var blockDepthInfoDom = block.getBlockDepthInfoDom();
                blockDepthInfoDom.text(depth);
                if (block.getDepth() == 0) {
                    $(blockDepthInfoDom).css(STR_OPACITY,0);
                } else {
                    $(blockDepthInfoDom).css(STR_OPACITY,1);
                }

                /** node 블럭과 text 블럭일 경우
                 *  block LineNumberInfo Dom 보여줌
                 */
                if (IsNodeTextBlockType(blockType) == true
                    || block.isGroupBlock) {
                    var $blockLineNumberInfoDom = $(block.getBlockLineNumberInfoDom());
                    $blockLineNumberInfoDom.css( STR_LEFT, -NUM_DEFAULT_POS_X );
                    $blockLineNumberInfoDom.css( STR_OPACITY, 1);
                }
            });

            //** node 블럭 list들을 순서대로 가져옴 */
            var nodeBlockList = this.getNodeBlockList_asc();
            nodeBlockList.forEach(async (block, index) => {
                /** toggle 된 것과 안 된 것 구분해서 box shadow 처리 */
                if (block.getIsNodeBlockToggled() == true){
                    $(block.getBlockMainDom()).css(STR_BOX_SHADOW,'0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)');
                } else {
                    $(block.getBlockMainDom()).css(STR_BOX_SHADOW, STR_NONE);
                }
             
                var $blockLineNumberInfoDom = $(block.getBlockLineNumberInfoDom());
                var blockLineNumber = 0;
    
                /** Line number 오름차순 정렬의 경우 */
                if (isAsc == true) {
                    $blockLineNumberInfoDom.css(STR_COLOR, '#828282');
                    blockLineNumber = index + 1;
                /** 처음 생성한 Line number를 그대로 보여줄 경우 */
                } else {
                    blockLineNumber = block.getBlockNumber();
                }
    
                block.setBlockNumber(blockLineNumber);
    
                $blockLineNumberInfoDom.text(block.getBlockNumber());
            });
        }
    }
    /** 
     * @async
     * Block editor에 존재하는 블럭들을 
     * (이전) prevBlockList 데이터와
     * (현재) blockList 데이터를 기반으로
     * 전부 다시 렌더링한다 
     */
    BlockContainer.prototype.reRenderBlockList = async function(isMetaData) {
        var blockContainerThis = this;
        var rootBlock = this.getRootBlock();
        if (rootBlock == null) {
            return;
        }
        var scrollTop = $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD).scrollTop();

        var blockList = rootBlock.getThisToLastBlockList();
        var prevBlockList = this.getPrevBlockList();

        /** metadata를 받아서 reRender */
        if (isMetaData == true) {
            var containerDom = this.reNewContainerDom();
            for await (var block of blockList) {
                new Promise( (resolve) => resolve( $(containerDom).append(block.getBlockMainDom())));
                block.bindEventAll();
            }
        /** blockList 길이 < prevBlockList 길이 */
        } else if ( blockList < prevBlockList ) {
            // console.log('blockList < prevBlockList');
            var deletedBlockList = RemoveSomeBlockAndGetBlockList(prevBlockList, blockList);
            deletedBlockList.forEach(block => {
               var blockMainDom = block.getBlockMainDom();
               $(blockMainDom).remove();
            });

        /** blockList 길이 > prevBlockList 길이 */
        } else if (blockList > prevBlockList) {
            // console.log('blockList > prevBlockList');
            var containerDom = this.getBlockContainerDom();
            var addedBlockList = RemoveSomeBlockAndGetBlockList(blockList, prevBlockList);
            var prevBlock = addedBlockList[0].getPrevBlock();
            if (prevBlock === null) {
               addedBlockList.forEach((addedBlock,index) => {
                   $(containerDom).append(addedBlock.getBlockMainDom() );
                   addedBlock.bindEventAll();
               });
           } else {
               addedBlockList.forEach(addedBlock => {
                   $( addedBlock.getBlockMainDom() ).insertAfter(prevBlock.getBlockMainDom());
                   addedBlock.bindEventAll();
                   prevBlock = addedBlock;
               });
           }
           /** 그외 */
        } else {
            var containerDom = this.reNewContainerDom();
            for await (var block of blockList) {
                new Promise( (resolve) => resolve( 
                    $(containerDom).append(block.getBlockMainDom())
                ));
                block.bindEventAll();
            }
        }

        /** node 블럭
         *  code 블럭
         *  write code */
        blockList.forEach(block => {
            var blockType = block.getBlockType();
            if (blockType == BLOCK_CODELINE_TYPE.NODE) {
                var code = block.getState(STATE_codeLine);
                block.writeCode(code);
            } else if (IsCodeBlockType(blockType) == true) {
                var code = block.getState(STATE_codeLine);
                block.writeCode(code);
            }
        });
        this.setPrevBlockList(blockList);

        $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD).scrollTop(scrollTop);
    }

    /** vpnote를 open할 때 실행되는 메소드
     *  @param {Array<JSON>} apiBlockJsonDataList vpnote에 담겨 있는 데이터들
     *  vpnote에 담긴 json 데이터를 block데이터로 전환한 다음
     *  board에 렌더링
     */
    BlockContainer.prototype.reRenderBlockList_fromMetadata = function(apiBlockJsonDataList) {
    

        /** metadata json을 기반으로 블럭 렌더링 */
        var createdBlockList = this.jsonToBlock(apiBlockJsonDataList);

        this.reNewContainerDom();
        this.deleteAllOptionDom();
        this.setBlockList(createdBlockList);
        this.reRenderAllBlock_metadata();
        this.setNodeBlockNumber(1);
        /** text 블럭일 경우 
         *  Markdown pakage를 생성해서 text 블럭에 넣어주고,
         *  text 블럭 preview에 Markdown 형식의 preview Render를 한다.
         */
        createdBlockList.forEach(block => {
            var blockType = block.getBlockType();
            if (blockType == BLOCK_CODELINE_TYPE.TEXT) {
                loadOption_textBlock(STR_TEXT_BLOCK_MARKDOWN_FUNCID, (markdownPakage) => {
                    block.setImportPakage(markdownPakage);
                    markdownPakage.setBlock(block);
                
                    /** option popup 생성 */
                    var blockOptionPageDom = makeUpGreenRoomHTML();
                    /** text 블럭 데이터 */
                    var text = block.getState(STATE_codeLine);
        
                    block.setBlockOptionPageDom(blockOptionPageDom);

                    /** text 블럭 preview에 Markdown 형식의 preview Render */
                    markdownPakage.bindOptionEvent();
                    
                    /** option popup에 있는 textarea에 text 블럭 데이터 넣기 */
                    const textarea = block.getBlockOptionPageDom().find(`#vp_markdownEditor`).get(0);
                    $(textarea).val(text);

                    // markdownPakage.previewRender(block.getImportPakage().uuid, text);
                    markdownPakage.previewRender(text);

                    this.resetOptionPage();
                });
            } else if (blockType == BLOCK_CODELINE_TYPE.API) {
                block.renderApiOption();
            }
        });

        this.resetOptionPage();
    }

    /**
     *  옵션 페이지를 새로 렌더링하는 메소드
     */
    BlockContainer.prototype.renderBlockOptionTab = function() {
        // console.log('renderBlockOptionTab');

        var selectedBlock = this.getSelectBlock();
        // console.log('selectedBlock',selectedBlock);
        if(selectedBlock) {
            // selectedBlock.resetOptionPage();
            selectedBlock.renderOptionPage();
        }
    }

    /** 전체 블럭 리스트 리셋*/
    BlockContainer.prototype.resetBlockList = function() {

        /** 전체 블럭 리스트 color 리셋*/
        const blockList = this.getBlockList();
        blockList.forEach(block => {
            block.renderBlockShadow(STR_NONE);
            block.renderSelectedBlockColor(false);
            // block.renderSelectedBlockBorderColor(false);
            if (block.getBlockType() == BLOCK_CODELINE_TYPE.NODE) {
                $(block.getBlockMainDom()).css(STR_BORDER, '0.5px solid #C4C4C4');
            } else {
                $(block.getBlockMainDom()).css(STR_BORDER, '1px solid transparent');
            }
            $(block.getBlockMainDom()).find(VP_CLASS_PREFIX + VP_CLASS_BLOCK_SUB_BTN_CONTAINER).remove();
        });
        
        /** node 블럭 일반 상태로 변경 */
        const nodeBlockList = this.getNodeBlockList();
        nodeBlockList.forEach(nodeBlock => {
            nodeBlock.renderNodeBlockInput(STR_NONE);
        });
    }
    BlockContainer.prototype.checkSaveOptionPage = function(callback) {
        var blockContainerThis = this;
        var prevSelectedBlock = this.getSelectBlock();
        if (prevSelectedBlock && prevSelectedBlock.isModified) {
            // Ask to save
            var apiBlockPackage = this.getImportPackageThis();
            apiBlockPackage.openMultiBtnModal_new('Unsaved Changes', 'Save changes before leave?',['Don&rsquo;t save', 'Save'], [() => {
                // cancel
                // $(VP_ID_PREFIX + VP_APIBLOCK_BOARD_OPTION_CANCEL_BUTTON).trigger(STR_CLICK);
                blockContainerThis.cancelBlock();
                callback(false);
            },() => {
                // apply
                // $(VP_ID_PREFIX + VP_APIBLOCK_BOARD_OPTION_APPLY_BUTTON).trigger(STR_CLICK);
                blockContainerThis.applyBlock();
                callback(true);
            }]);
        } else {
            callback(false);
        }
    }
    /** 
     *  Block List들의 color를 리셋하고 인자로 받은 block의  
     *  1. 옵션 팝업을 열고, 
     *  2. sub 버튼을 생성하고(if, for, try), 
     *  3. 인자로 받은 block의  color를 색칠
     * @param {Block} thisBlock 
     */ 
    BlockContainer.prototype.resetBlockListAndRenderThisBlock = function(thisBlock) {
        var blockContainerThis = this;
        this.checkSaveOptionPage(function(result) {
            blockContainerThis.resetBlockList();
    
            /** 인자로 받은 block render */
            blockContainerThis.setSelectBlock(thisBlock);
            /** 옵션 페이지 오픈 */
            blockContainerThis.renderBlockOptionTab(thisBlock);
            // set state
            thisBlock.saveState();
            // blockContainerThis.checkModified();
    
            /** 서브 버튼 생성 */
            thisBlock.createSubButton();
            /** this 블럭과 자식  Block Color 색칠 */
            thisBlock.renderColor_thisBlockArea(true);
        });

    }

    /** board에 container dom을 새로 만드는 메소드 */
    BlockContainer.prototype.reNewContainerDom = function() {
        // console.log('reNewContainerDom');
     
        /** 기존의 block container dom 삭제 */
        var containerDom = this.getBlockContainerDom();
        $(containerDom).empty();
        $(containerDom).remove();
        $(VP_CLASS_PREFIX + VP_CLASS_BLOCK_CONTAINER).remove();

        /** 새로운 block container dom 생성 */
        var containerDom = document.createElement(STR_DIV);
        containerDom.classList.add(VP_CLASS_BLOCK_CONTAINER);

        $(containerDom).css(STR_TOP, NUM_DEFAULT_POS_Y + STR_PX);
        $(containerDom).css(STR_LEFT, NUM_DEFAULT_POS_X + STR_PX);

        /** +Node, +Text 버튼 생성 */
        /** Deprecated: 2021-02-08
         * block을 보유한 boardContainer가 아닌 상위그룹에 고정시킨 플로팅버튼 형태로 수정
         * index.html에서 정적으로 관리(계속 생성할 필요 없음)
         */
        // var sbNodeOrTextPlusButton = new sb.StringBuilder();
        // sbNodeOrTextPlusButton.appendFormatLine("<div id='{0}' class='{1}'>",'vp_apiblock_board_node_plus_button_container',
        //                                                                     'vp-apiblock-style-flex-row');
        // sbNodeOrTextPlusButton.appendFormatLine("<div id='{0}' class='{1}'>",'vp_apiblock_board_node_plus_button',
        //                                                                     'vp-apiblock-option-plus-button');
        // sbNodeOrTextPlusButton.appendFormatLine("{0}", '+ Node');
        // sbNodeOrTextPlusButton.appendLine("</div>");

        // sbNodeOrTextPlusButton.appendFormatLine("<div id='{0}' class='{1}' style='{2}'>",'vp_apiblock_board_text_plus_button',
        //                                                                                  'vp-apiblock-option-plus-button',
        //                                                                                  'margin-left: 10px');
        // sbNodeOrTextPlusButton.appendFormatLine("{0}", '+ Text');
        // sbNodeOrTextPlusButton.appendLine("</div>");

        // sbNodeOrTextPlusButton.appendLine("</div>");
        // var nodePlusButtonContainer = sbNodeOrTextPlusButton.toString();

        // $(containerDom).append(nodePlusButtonContainer);

        $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD).append(containerDom);
        this.setBlockContainerDom(containerDom);

        return containerDom;
    }
    
















    /**
     */
    BlockContainer.prototype.getRootToLastBottomBlock = function() {
        var rootBlock = this.getRootBlock();
        return this.getLastBottomBlock(rootBlock);
    }

    /**
     * @param {BLOCK} thisBlock 
     */
    BlockContainer.prototype.getLastBottomBlock = function(thisBlock) {
        var childBlockList = thisBlock.getThisToLastBlockList();
        var childBlockList_down = childBlockList.filter(childBlock => {
            if (childBlock.getDirection() == BLOCK_DIRECTION.DOWN) {
                return true;
            } else {
                return false;
            }
        });
        if (childBlockList_down.length == 0) {
            return childBlockList[childBlockList.length-1];
        } else {
            return childBlockList_down[childBlockList_down.length-1];
        }
    }

    /** 블럭을 drag할 때 실행하는 메소드
     * @param {boolean} isBlock true면 블럭의 이동, false면 Logic에 있는 블럭 생성 버튼의 이동
     * @param {Block} thisBlock
     * @param {Block} shadowBlock
     * @param {Block} selectedBlock   
     * @param {Direction} selectedBlockDirection
     * @param {number} currCursorX
     * @param {number} currCursorY
     */
    BlockContainer.prototype.dragBlock = function(isBlock, thisBlock, shadowBlock, selectedBlock, selectedBlockDirection, currCursorX, currCursorY) {
        var blockContainerThis = this;

        // if (isBlock == true) {
        //     /** 각 node 블럭 영역의 가장 아래의 블럭들을 가져옴 */
        //     var nodeBlockList = blockContainerThis.getNodeBlockList();
        //     var lastBlockList_blockArea = []
        //     nodeBlockList.forEach(nodeBlock => {
        //         if (thisBlock.getUUID() == nodeBlock.getUUID()) {
        //             return;
        //         }
        //         var lastBlock = nodeBlock.getLastBlock_from_thisBlockArea();
        //         $( lastBlock.getBlockMainDom() ).css(STR_DISPLAY, STR_BLOCK);
        //         lastBlockList_blockArea.push(lastBlock);
        //     });
        // }
        
        var lastBlockList_blockArea = []
        if (isBlock == true) {
            /** 각 node, text 블럭 영역의 가장 아래의 블럭들을 가져옴 */
            var nodeTextBlockList = blockContainerThis.getNodeBlockAndTextBlockList_asc();
            nodeTextBlockList.forEach(nodeTextBlock => {
                if (thisBlock.getUUID() == nodeTextBlock.getUUID()) {
                    return;
                }
                var lastBlock = nodeTextBlock.getLastBlock_from_thisBlockArea();
                $( lastBlock.getBlockMainDom() ).css(STR_DISPLAY, STR_BLOCK);
                lastBlockList_blockArea.push(lastBlock);
            });
        }
        

        /** 블록 전체를 돌면서 drag하는 Block과 Board위에 생성된 블록들과 충돌 작용  */
        var boardBlockList = blockContainerThis.getBlockList();
        boardBlockList.forEach( async (block) => {
            var blockType = block.getBlockType();
            // if (blockType == BLOCK_CODELINE_TYPE.TEXT) {
            //     return;
            // }

            var isLastBlock = false;
            if (isBlock == true) {
                /**
                 * 움직이는 블럭이 노드/텍스트 블럭이 아닐 경우
                 * 텍스트 블럭과 충돌 금지
                 */
                if ((   thisBlock.getBlockType() != BLOCK_CODELINE_TYPE.NODE &&
                        thisBlock.getBlockType() != BLOCK_CODELINE_TYPE.TEXT &&
                        !thisBlock.isGroupBlock    ) 
                        && (blockType == BLOCK_CODELINE_TYPE.TEXT)) {
                    return;
                }
                
                /** 자기 자신인 블럭과는 충돌 금지 
                 *  혹은 자신의 하위 블럭과도 충돌 금지
                 */
                if ( thisBlock.getUUID() == block.getUUID()
                    || block.getIsNowMoved() == true ) {
                    return;
                }

                if (thisBlock.getBlockType() == BLOCK_CODELINE_TYPE.NODE
                    || thisBlock.getBlockType() == BLOCK_CODELINE_TYPE.TEXT
                    ) {
                    isLastBlock = lastBlockList_blockArea.some(lastBlock => {
                        if (lastBlock.getUUID() == block.getUUID()) {
                            return true;
                        }
                    });

                    if (isLastBlock == false) {
                        return;
                    }
                }

                if (thisBlock.isGroupBlock) {
                    isLastBlock = lastBlockList_blockArea.some(lastBlock => {
                        if (lastBlock.getUUID() == block.getUUID()) {
                            return true;
                        }
                    });
                }
            }

            /** 충돌할 block의 x,y, width, height를 가져온다 */
            var { x: blockX, 
                  y: blockY, 
                  width: blockWidth, 
                  height: blockHeight } = block.getBlockMainDomPosition();

            /** 블럭 충돌에서 벗어나는 로직 */
            var blockLeftHolderHeight = block.getBlockLeftShadowHeight();
            if ( (blockX > currCursorX 
                  || currCursorX > (blockX + blockWidth)
                  || blockY  > currCursorY 
                  || currCursorY > (blockY + blockHeight + blockHeight + blockHeight + blockLeftHolderHeight) ) ) {
                block.renderBlockShadow(STR_NONE);
            }

            /** 블럭 충돌 left holder shadow 생성 로직 */
            if ( blockX < currCursorX
                && currCursorX < (blockX + blockWidth)
                && blockY  < currCursorY
                && currCursorY < (blockY + blockHeight + blockHeight + blockLeftHolderHeight) ) {     
                block.renderBlockShadow(STR_BLOCK);
                block.renderBlockLeftShadowHeight();
            }

            /** 블럭 충돌 로직 */  
            if ( blockX < currCursorX
                    && currCursorX < (blockX + blockWidth + blockWidth)
                    && blockY  < currCursorY
                    && currCursorY < (blockY + blockHeight  + blockHeight) ) { 

                block.renderBlockLeftShadowHeight();

                /** 충돌시 direction 설정
                 * class, def, if, for, while, try, else, elif, finally, except Block은 INDENT
                 * 그 외 Block은 DOWN
                 */
                if ( IsCanHaveIndentBlock(blockType) ) {
                    selectedBlockDirection = BLOCK_DIRECTION.INDENT;
                } else {
                    selectedBlockDirection = BLOCK_DIRECTION.DOWN; 
                }
                shadowBlock.insertShadowDomToBlockDom( block, selectedBlockDirection);
    
            // } else if (currCursorX < (blockX + blockWidth + blockWidth)
            //     && blockY  < currCursorY
            //     && currCursorY < (blockY + blockHeight  + blockHeight)
            //     // 해당 그룹블럭의 마지막 블럭과 충돌할 경우 허용
            //     && isLastBlock) {
            //     /** Group 충돌 */
            //     console.log('Group 충돌!' + currCursorX); 

            //     selectedBlock = block;
            //     block.renderBlockShadow(STR_BLOCK);
            //     // block.renderBlockLeftShadowHeight();

            //     selectedBlockDirection = BLOCK_DIRECTION.DOWN;
            //     // TODO: insert shadow dom as group - create new function
            //     shadowBlock.insertShadowDomToBlockDomAsGroup( block, selectedBlockDirection);
            } else {

                selectedBlock = shadowBlock.getSelectBlock();

                var containerDom = blockContainerThis.getBlockContainerDom();
                var containerDomRect = $(containerDom)[0].getBoundingClientRect();
                var { x: containerDomX, 
                      y: containerDomY, 
                      width: containerDomWidth, 
                      height: containerDomHeight } = containerDomRect;
    
                /** board에 있는 어떠한 block에 닿았을 때 */
                if ( containerDomX < currCursorX
                     && currCursorX < (containerDomX + containerDomWidth)
                     && containerDomY  < currCursorY
                     && currCursorY < (containerDomY + containerDomHeight) ) {  
                    
                    /** board에 있는 어떠한 block에도 닿지 않았을 때 */
                } else {
                    /** shadow 블록 해제하는 로직 */
                    var $shadowBlockMainDom = $(shadowBlock.getBlockContainerDom());
                    $shadowBlockMainDom.css(STR_DISPLAY,STR_NONE);
                    shadowBlock.setSelectBlock(null);
                }
            }
        });

        return { 
            selectedBlock, 
            selectedBlockDirection
        };
    }

    /**
     * @param {boolean} isBlock true면 블럭의 이동, false면 Logic(Define, Control, Execute)에서 블럭의 생성
     * @param {Block} thisBlock 이동이 멈춘 블럭
     */
    BlockContainer.prototype.stopDragBlock = function(isBlock, thisBlock) {
        var blockContainerThis = this;

        /** 블록을 이동시킨 경우 */
        if (isBlock == true) {
            blockContainerThis.reRenderAllBlock_asc();       
        } else {
        /** 블록을 생성한 경우 */
            blockContainerThis.reRenderAllBlock_asc();
            blockContainerThis.setFocusedPageType(FOCUSED_PAGE_TYPE.BUTTONS);
        }

        /** thisBlock 영역 블럭들의 isNowMoved false 처리 */
        var blockList_thisBlockArea = thisBlock.getBlockList_thisBlockArea();
        blockList_thisBlockArea.forEach(block => {
            block.setIsNowMoved(false);
        });

        /** 
         *  모든 Block color 리셋하고
         *  인자로 들어간 this 블럭 렌더링
         */
        blockContainerThis.resetBlockListAndRenderThisBlock(thisBlock);


        /** isBlock == false 경우(LOGIC이나 API의 경우에서 생성하는 경우)
         *  새로 생성한 thisBlock이 def 타입이고,
          *  thisBlock의 부모가 class 타입이면, def 블럭에 self 파라미터 추가
          */
        if (thisBlock.getBlockType() == BLOCK_CODELINE_TYPE.DEF
            && isBlock == false) {
            // var findedNodeBlock = blockContainerThis.findNodeBlock(thisBlock);
            // var blockList_thisBlockArea = findedNodeBlock.getBlockList_thisBlockArea();
            // blockList_thisBlockArea.some(block => {
            //     if (block.getBlockType() == BLOCK_CODELINE_TYPE.CLASS) {
            //         return true; 
            //     } 
            // });
            var depthList = [];
            var prevBlock = thisBlock.getPrevBlock();
            while( prevBlock != null) {

                /** prev 블럭들이 this 블록보다 depth가 작으면서
                 *  class 타입이 아니면;
                 */
                if (prevBlock.getBlockType() != BLOCK_CODELINE_TYPE.CLASS
                    && prevBlock.getDepth() < thisBlock.getDepth()) {
                    var prevBlockDepth = prevBlock.getDepth();
                    depthList.push(prevBlockDepth);
                }

                /** prev 블럭이 node 블럭일 경우 break;
                 */
                if (prevBlock.getBlockType() == BLOCK_CODELINE_TYPE.NODE 
                    || prevBlock.isGroupBlock) {
                    break;
                }
        
                /**
                 * prev 블럭이 class 타입이고,
                 * prev 블럭의 depth이 this 블럭의 depth보다 작을 경우
                 * this 블럭(def 블럭)에 self 파라미터 추가
                 */
                if (prevBlock.getBlockType() == BLOCK_CODELINE_TYPE.CLASS
                    && prevBlock.getDepth() < thisBlock.getDepth()) {
                    
                    /** def 블럭과 class 블럭 사이에
                     *  class 블럭과 동일한 depth의 블럭이 있다면 validation true -> self 파라미터 추가하지 않음
                     */
                    var isValidation = depthList.some(depth => {
                        if (depth == prevBlock.getDepth()) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    
                    if (isValidation == true) {
                        break;
                    }

                    var newData = {
                        arg3: 'self'
                        , arg5: STR_EMPTY
                        , arg6: DEF_BLOCK_ARG6_TYPE.NONE
                    }

                    var inParamList = thisBlock.getState(STATE_defInParamList);
                    inParamList.push(newData);
                    thisBlock.setState({
                        [STATE_defInParamList]: inParamList
                    });
                    var defCode = GenerateDefCode(thisBlock);

                    thisBlock.writeCode(defCode);
                    break;
                }
        
                prevBlock = prevBlock.getPrevBlock();
            }
        }
    }

    
    /** 인자로 들어온 this 블럭이 속한 영역의 node 블럭을 찾아서 return 
     * @param {Block} thisBlock
     */
    BlockContainer.prototype.findNodeBlock = function(thisBlock) {
        var blockContainerThis = this;
        var nodeBlockList = blockContainerThis.getNodeBlockList();
        var selectedBlock = blockContainerThis.getSelectBlock() || thisBlock;
        nodeBlockList.some(nodeBlock => {
            var blockList_thisBlockArea = nodeBlock.getBlockList_thisBlockArea();
            blockList_thisBlockArea.push(nodeBlock);
            blockList_thisBlockArea.some(block => {
                if (block.getUUID() == selectedBlock.getUUID()) {
                    selectedBlock = nodeBlock;
                    return true;
                }
            });
        });
        return selectedBlock;
    }










     /** Block 생성
     * @param {string} blockType 생성할 블럭의 타입 ex) class, def, if ...
     * 
     * @option
     * @param {Object} blockData vpnote을 open할 때 vpnote에 담긴 데이터를 기반으로 블럭을 생성
     */
    BlockContainer.prototype.createBlock = function(blockType, blockData = null, apiData = null, isGroupBlock = false) {
        var thisBlock =  new Block(this, blockType, blockData, isGroupBlock);
        /** API 블럭 설정값 입력 */
        if (blockType == BLOCK_CODELINE_TYPE.API && apiData) {
            var funcID = apiData.funcID;
            if (funcID) {
                var naviInfo = getNavigationInfo(funcID);

                thisBlock.setFuncID(funcID);
                thisBlock.setOptionPageLoadCallback(optionPageLoadCallback_block);
                thisBlock.setLoadOption(loadOption_block);
                thisBlock.setState({
                    [STATE_codeLine]: naviInfo
                });
                
                setClosureBlock(thisBlock);
                loadOption_block(funcID, optionPageLoadCallback_block);
            }
        }
        return thisBlock;
    }

    /** Logic에서 Block을 드래그해서 생성 할 때 */
    BlockContainer.prototype.createBlock_fromLogic = function(thisBlock) {
        var blockType = thisBlock.getBlockType();
        /** class 일 경우 */
        if (blockType == BLOCK_CODELINE_TYPE.CLASS) {
            var defBlock = this.createBlock(BLOCK_CODELINE_TYPE.DEF);
            defBlock.setState({
                defName: '__init__'
            });
            var newData = {
                arg3: 'self'
                , arg5: STR_EMPTY
                , arg6: DEF_BLOCK_ARG6_TYPE.NONE
            }
            var inParamList = thisBlock.getState(STATE_defInParamList);
            inParamList.push(newData);
            defBlock.setState({
                [STATE_defInParamList]: inParamList
            });
            defBlock.init();

            var holderBlock = this.createBlock(BLOCK_CODELINE_TYPE.SHADOW );

            thisBlock.appendBlock(holderBlock, BLOCK_DIRECTION.DOWN);
            thisBlock.appendBlock(defBlock, BLOCK_DIRECTION.INDENT);

            $(holderBlock.getBlockMainDom()).addClass(VP_BLOCK_BLOCKCODELINETYPE_CLASS_DEF);
            $(holderBlock.getBlockMainDom()).css(STR_BACKGROUND_COLOR, COLOR_CLASS_DEF);

        /** def block일 경우 */
        } else if ( blockType == BLOCK_CODELINE_TYPE.DEF) {

            var codeBlock = this.createBlock( BLOCK_CODELINE_TYPE.CODE );
            var returnBlock = this.createBlock( BLOCK_CODELINE_TYPE.RETURN );
            var holderBlock = this.createBlock( BLOCK_CODELINE_TYPE.SHADOW );
            
            thisBlock.appendBlock(holderBlock, BLOCK_DIRECTION.DOWN);
            thisBlock.appendBlock(returnBlock, BLOCK_DIRECTION.INDENT);
            thisBlock.appendBlock(codeBlock, BLOCK_DIRECTION.INDENT);

            $(holderBlock.getBlockMainDom()).addClass(VP_BLOCK_BLOCKCODELINETYPE_CLASS_DEF);
            $(holderBlock.getBlockMainDom()).css(STR_BACKGROUND_COLOR, COLOR_CLASS_DEF);

        /** if, for, while, try, else, elif, except, finally block일 경우 */
        } else if ( blockType == BLOCK_CODELINE_TYPE.IF 
                    || blockType == BLOCK_CODELINE_TYPE.FOR 
                    || blockType == BLOCK_CODELINE_TYPE.WHILE 
                    || blockType == BLOCK_CODELINE_TYPE.TRY 
                    || blockType == BLOCK_CODELINE_TYPE.ELSE 
                    || blockType == BLOCK_CODELINE_TYPE.ELIF 
                    || blockType == BLOCK_CODELINE_TYPE.FOR_ELSE 
                    || blockType == BLOCK_CODELINE_TYPE.EXCEPT 
                    || blockType == BLOCK_CODELINE_TYPE.FINALLY ) {

            var passBlock = this.createBlock( BLOCK_CODELINE_TYPE.PASS);
            var holderBlock = this.createBlock( BLOCK_CODELINE_TYPE.SHADOW );
            
            thisBlock.appendBlock(holderBlock, BLOCK_DIRECTION.DOWN);
            thisBlock.appendBlock(passBlock, BLOCK_DIRECTION.INDENT);
        } 
    }
    /**
     * @param {boolean} isAlone node 생성 할 때
     *                          true면 node 블럭 1개만 생성, (input에서 엔터 생성, +Node 블럭 생성의 경우)
     *                          false면 node 블럭의 자식으로 일반 블럭도 생성 (board에 어떤 블럭도 선택하지 않고 일반 블럭 생성할 경우)
     * @param {string} title node 블럭 이름
     */
    BlockContainer.prototype.createNodeBlock = function(isAlone = false, title = STR_EMPTY) {
    /** board에 블럭이 
     *  0개일 경우 isFirstBlock true
         *  1개 이상일 경우 isFirstBlock false 
         */
        var isFirstBlock = false;
        const blockList = this.getBlockList();
        if (blockList.length == 0) {
            isFirstBlock = true;
        }

        /** node 블럭 이름 생성 */
        var codeLineStr = STR_EMPTY;
        if (title != STR_EMPTY) {
            codeLineStr = title;
        } else {
            codeLineStr = 'Node';
        }
    
        /** node 블럭 생성 */
        var createdNodeBlock = this.createBlock(BLOCK_CODELINE_TYPE.NODE);
        createdNodeBlock.setState({
            [STATE_codeLine]: codeLineStr
        });

        /** 블럭 생성할 때,
         *  node 블럭 1개만 생성할 경우 
         */
        if (isAlone == true) {
            if (isFirstBlock == true) {
                createdNodeBlock.setDirection(BLOCK_DIRECTION.ROOT);
            } else {
                var lastBottomBlock = this.getRootToLastBottomBlock();
                lastBottomBlock.appendBlock(createdNodeBlock, BLOCK_DIRECTION.DOWN);
            }
            this.reRenderAllBlock_asc();
            this.resetBlockListAndRenderThisBlock(createdNodeBlock);
        } 
        createdNodeBlock.renderNodeBlockWidth();
        return createdNodeBlock;
    }

    BlockContainer.prototype.createCodeBlock = function() {
        var isFirstBlock = false;
        const blockList = this.getBlockList();
        if (blockList.length == 0) {
            isFirstBlock = true;
        }

        var blockContainerThis = this;
        var createdBlock;

        var selectedBlock = this.getSelectBlock();
        // if there is selected block (except TEXT block)
        if (selectedBlock && (
            selectedBlock.getBlockType() != BLOCK_CODELINE_TYPE.TEXT
        )) {
            // append to selected block's group
            createdBlock = blockContainerThis.createBlock(BLOCK_CODELINE_TYPE.CODE);
            createdBlock.apply();
            var nodeBlock = this.findNodeBlock();
            nodeBlock.getLastBlock_from_thisBlockArea().appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);
        } else {
            // if nothing selected,
            // create block as group block
            createdBlock = blockContainerThis.createBlock(BLOCK_CODELINE_TYPE.CODE, null, null, true);
            createdBlock.apply();
            if (isFirstBlock == true) {
                // if it is first block, set as ROOT
                createdBlock.setDirection(BLOCK_DIRECTION.ROOT);
            } else {
                var lastBottomBlock = this.getRootToLastBottomBlock();
                lastBottomBlock.appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);
            }
            this.addNodeBlock(createdBlock);
        }

        this.reRenderAllBlock_asc();
        this.resetBlockListAndRenderThisBlock(createdBlock);
        return createdBlock;
    }

    BlockContainer.prototype.createTextBlock = function(textCode = STR_SAMPLE_TEXT) {
        /** board에 블럭이 
         *  0개일 경우 isFirstBlock true
         *  1개 이상일 경우 isFirstBlock false 
         */
        var isFirstBlock = false;
        const blockList = this.getBlockList();
        if (blockList.length == 0) {
            isFirstBlock = true;
        }

        var blockContainerThis = this;
        var createdBlock = blockContainerThis.createBlock(BLOCK_CODELINE_TYPE.TEXT);
        createdBlock.apply();
        createdBlock.setFuncID(STR_TEXT_BLOCK_MARKDOWN_FUNCID);
        createdBlock.setOptionPageLoadCallback(optionPageLoadCallback_block);
        createdBlock.setLoadOption(loadOption_block);
        createdBlock.setState({
            [STATE_codeLine]: textCode
        });

        /** board에 블럭이 0개일 경우 */
        if (isFirstBlock == true) {
            createdBlock.setDirection(BLOCK_DIRECTION.ROOT);
            this.reNewContainerDom();
        /** board에 블럭이 1개 이상 일 경우 */         
        } else {
            /** board의 가장 아래 블럭을 가져옴 */
            var lastBottomBlock = this.getRootToLastBottomBlock();
            lastBottomBlock.appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);
        }
        this.reRenderAllBlock_asc(); 
        this.resetBlockList();
        this.setSelectBlock(createdBlock);

        setClosureBlock(createdBlock);
        loadOption_textBlock(STR_TEXT_BLOCK_MARKDOWN_FUNCID, optionPageLoadCallback_block);

        createdBlock.writeCode(`<p>${textCode}</p>`);
        createdBlock.renderSelectedBlockBorderColor(true);
        return createdBlock;
    }

    /**
     * @param {string} funcID xml에 적힌 API List의 funcID
     * @param {string} naviInfo Common > Import 같은 naigation 정보
     */
    BlockContainer.prototype.createAPIListBlock = async function(funcID, naviInfo) {
        this.resetBlockList();

        var isFirstBlock = false;
        const blockList = this.getBlockList();
        /** board에 블럭이 0개 일때
         *  즉 블럭이 처음으로 생성되는 경우
         */
        if (blockList.length == 0) {
            isFirstBlock = true;
        }

        var createdBlock_api = this.createBlock(BLOCK_CODELINE_TYPE.API, null, null, true, true);
        createdBlock_api.setFuncID(funcID);
        createdBlock_api.setOptionPageLoadCallback(optionPageLoadCallback_block);
        createdBlock_api.setLoadOption(loadOption_block);
        createdBlock_api.setState({
            [STATE_codeLine]: naviInfo
        });

        createdBlock_api.writeCode(naviInfo);
        setClosureBlock(createdBlock_api);
        loadOption_block(funcID, optionPageLoadCallback_block);
        this.resetBlockListAndRenderThisBlock(createdBlock_api);
    }

    BlockContainer.prototype.createAppsPage = function(appsKey, moduleFile, config={}, callback=undefined) {
        var that = this;

        // var loadUrl = 'markdown/markdown.js';
        // var loadUrl = 'common/' + moduleFile;
        var loadUrl = moduleFile;
        requirejs([loadUrl], function (loaded) {
            if (Object.keys(loaded).includes('initOption')) {
                loaded.initOption(function(funcJS) {
                    // optionPage load callback
                    that.apps = appsKey;
                    that.appsMenu = new popupPage(funcJS, 'vp_appsCode');
                    funcJS.wrapSelector = that.appsMenu.wrapSelector;
                    funcJS.loadMeta(funcJS, config.state);
                    // library page
                    $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM), vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE))).each(function() {
                        that.appsMenu.open({
                            ...config,
                            pageDom: $(this)
                        });
                    });
                    if (callback) {
                        callback(funcJS);
                    }
                }, config.state);
            } else {
                // save appsMenu object
                that.apps = appsKey;
                that.appsMenu = new loaded(null, 'vp_appsCode');
                that.appsMenu.open({ 
                    ...config 
                });
                if (callback) {
                    callback(that.appsMenu);
                }
            }


        });
        return this.appsMenu;
    }

    /** 블럭을 이동할 때,
     *  shadow 블럭을 만드는 메소드
     * @param {ENUM} blockType 
     * @param {Block} thisBlock 
     */
    BlockContainer.prototype.createShadowBlock = function( blockType, thisBlock) {
        var blockContainerThis = this;
        var shadowBlock = new ShadowBlock(blockContainerThis, blockType, thisBlock);
        var $shadowBlockContainerDom = $(shadowBlock.getBlockContainerDom());
        $shadowBlockContainerDom.css(STR_DISPLAY, STR_NONE);

        var containerDom = blockContainerThis.getBlockContainerDom();
        $(containerDom).append(shadowBlock.getBlockContainerDom());

        return shadowBlock;
    }









    



    
    /** Block의 HTML 생성
     *  이동하는 block과 동일한 모양의 html tag 생성
     *  @param {Block} thisBlock
    */
    BlockContainer.prototype.makeBlockDom = function(thisBlock) {
        var blockMainDom = document.createElement(STR_DIV);
        blockMainDom.classList.add(VP_BLOCK);
        blockMainDom.classList.add(`vp-block-${thisBlock.getUUID()}`);

        var blockType = thisBlock.getBlockType();
        /** node or text 블럭일 경우 */
        if ( IsNodeTextBlockType(blockType) == true
            || thisBlock.isGroupBlock ) {
            if (blockType == BLOCK_CODELINE_TYPE.NODE) {
                $(blockMainDom).css(STR_BACKGROUND_COLOR, STR_TRANSPARENT);
            }
            $(blockMainDom).css(STR_MARGIN_TOP, NUM_NODE_OR_TEXT_BLOCK_MARGIN_TOP_PX);
        /** shadow 블럭일 경우 */    
        } else if (blockType == BLOCK_CODELINE_TYPE.SHADOW) {
            blockMainDom.classList.add(VP_CLASS_BLOCK_BOTTOM_HOLDER);
        } 

        /** 이동하는 block의 header 생성 */
 
        var classOrDefName;
        /** class */
        if ( blockType == BLOCK_CODELINE_TYPE.CLASS ) {
            classOrDefName = thisBlock.getState(STATE_className);
        /** def 이름 */
        } else if ( blockType == BLOCK_CODELINE_TYPE.DEF ) {
            classOrDefName = thisBlock.getState(STATE_defName);
        }
        
        var codeLineStr = thisBlock.getNowCodeLine();

        var blockName = thisBlock.getBlockName();
        if ( blockType == BLOCK_CODELINE_TYPE.CODE
            || blockType == BLOCK_CODELINE_TYPE.PASS
            || blockType == BLOCK_CODELINE_TYPE.CONTINUE 
            || blockType == BLOCK_CODELINE_TYPE.BREAK
            || blockType == BLOCK_CODELINE_TYPE.LAMBDA
            || blockType == BLOCK_CODELINE_TYPE.NODE
            || blockType == BLOCK_CODELINE_TYPE.TEXT
            || blockType == BLOCK_CODELINE_TYPE.API
            || blockType == BLOCK_CODELINE_TYPE.APPS ) {
            blockName = '';
        } else if (blockType == BLOCK_CODELINE_TYPE.PROPERTY) {
            blockName = '@';
        } else if (blockType == BLOCK_CODELINE_TYPE.COMMENT) {
            blockName = '#';
        }

        var sbMainHeader = new sb.StringBuilder();
        var blockUUID = thisBlock.getUUID();
        if (blockType == BLOCK_CODELINE_TYPE.NODE) {
            sbMainHeader.appendFormatLine("<div class='{0}' style='{1}'>",'vp-block-header', '');
            sbMainHeader.appendFormatLine("<div class='{0}' style='{1}'>",  'vp-apiblock-codeline-ellipsis',
                                                                            'background-color:white; margin-left: 0em; margin-right: 0em;');

            sbMainHeader.appendFormatLine("<div class='{0}'>",'vp-apiblock-nodeblock');

            sbMainHeader.appendFormatLine("<div class='{0} {1} {2} {3}' style='{4}'>",`vp-block-header-param`, 
                                                                                  `vp-block-header-${blockUUID}`,
                                                                                  `vp-apiblock-nodeblock${blockUUID}`,
                                                                                  'vp-apiblock-nodeblock-inner',
                                                                                  ``);

            sbMainHeader.appendFormatLine("<div class='{0} {1}' >",'vp-apiblock-nodeblock-text-container', `vp-apiblock-nodeblock-text-container${blockUUID}`);
            sbMainHeader.appendFormatLine("<span class='{0} {1}'>", 'vp-apiblock-nodeblock-text', `vp-apiblock-nodeblock-text${blockUUID}`);
            sbMainHeader.appendFormatLine("{0}", codeLineStr);
            sbMainHeader.appendLine("</span>");
            sbMainHeader.appendLine("</div>");

            sbMainHeader.appendFormatLine("<div class='{0} {1}' >",'vp-apiblock-nodeblock-text-blank', `vp-apiblock-nodeblock-text-blank${blockUUID}`);
     
            sbMainHeader.appendLine("</div>");

            sbMainHeader.appendLine("</div>");

            sbMainHeader.appendFormatLine("<input class='{0} {1}' style='{2}' value='{3}'/>", 
                                                                            'vp-apiblock-nodeblock-input',
                                                                            `vp-apiblock-nodeblock-input${blockUUID}`,
                                                                            'display:none',
                                                                             codeLineStr);

            sbMainHeader.appendLine("</div>");
            sbMainHeader.appendLine("</div>");
            sbMainHeader.appendLine("</div>");
            
            
        } else if ( IsDefineBlockType(blockType) == true ) {
            sbMainHeader.appendFormatLine("<div class='{0}'>",'vp-block-header');

            sbMainHeader.appendFormatLine("<strong class='{0}' style='margin-right:10px;'>",'vp-block-header-name');
            sbMainHeader.appendFormatLine("{0}", blockName);
            sbMainHeader.appendLine("</strong>");

            sbMainHeader.appendFormatLine("<div class='{0}'>",'vp-apiblock-codeline-ellipsis');
            sbMainHeader.appendFormatLine("<div class='{0}'>",'vp-apiblock-style-flex-row');

            sbMainHeader.appendFormatLine("<div class='{0} {1}' style='{2}'>", `vp-block-header-class-name-${blockUUID}`, 
                                                                               `vp-block-header-def-name-${blockUUID}`,
                                                                               'font-size:14px');
            sbMainHeader.appendFormatLine("{0}", classOrDefName);
            sbMainHeader.appendLine("</div>");

            sbMainHeader.appendFormatLine("<div class='{0} {1}' style='{2}' title='{3}'>", `vp-block-header-param`, 
                                                                                `vp-block-header-${blockUUID}`,
                                                                                'text-indent: 0em',
                                                                                codeLineStr);
            sbMainHeader.appendFormatLine("{0}", codeLineStr);
            sbMainHeader.appendLine("</div>");

            sbMainHeader.appendLine("</div>");
            sbMainHeader.appendLine("</div>");

            sbMainHeader.appendLine("</div>");

        
        } else if (blockType == BLOCK_CODELINE_TYPE.IF    
                    || blockType == BLOCK_CODELINE_TYPE.FOR 
                    || blockType == BLOCK_CODELINE_TYPE.TRY 
                    || blockType == BLOCK_CODELINE_TYPE.ELIF
                    || blockType == BLOCK_CODELINE_TYPE.WHILE 
                    || blockType == BLOCK_CODELINE_TYPE.EXCEPT
                    || blockType == BLOCK_CODELINE_TYPE.RETURN  
                    || blockType == BLOCK_CODELINE_TYPE.LAMBDA 
                    || blockType == BLOCK_CODELINE_TYPE.IMPORT 
                    || blockType == BLOCK_CODELINE_TYPE.API
                    || blockType == BLOCK_CODELINE_TYPE.APPS

                    || blockType == BLOCK_CODELINE_TYPE.ELSE
                    || blockType == BLOCK_CODELINE_TYPE.FINALLY

                    || blockType == BLOCK_CODELINE_TYPE.BREAK  
                    || blockType == BLOCK_CODELINE_TYPE.CONTINUE  
                    || blockType == BLOCK_CODELINE_TYPE.PASS 
                    || blockType == BLOCK_CODELINE_TYPE.CODE  
                    || blockType == BLOCK_CODELINE_TYPE.COMMENT 
                    || blockType == BLOCK_CODELINE_TYPE.PRINT
                    || blockType == BLOCK_CODELINE_TYPE.PROPERTY
                    || blockType == BLOCK_CODELINE_TYPE.TEXT ) {

            sbMainHeader.appendFormatLine("<div class='{0}' style='{1}'>", 'vp-block-header', blockType == BLOCK_CODELINE_TYPE.TEXT
                                                                                                    ? 'height: unset;'
                                                                                                    : '');
            if ( blockType == BLOCK_CODELINE_TYPE.BREAK  
                || blockType == BLOCK_CODELINE_TYPE.CONTINUE  
                || blockType == BLOCK_CODELINE_TYPE.PASS 
                || blockType == BLOCK_CODELINE_TYPE.CODE  
                || blockType == BLOCK_CODELINE_TYPE.COMMENT
                || blockType == BLOCK_CODELINE_TYPE.PROPERTY
                || blockType == BLOCK_CODELINE_TYPE.API
                || blockType == BLOCK_CODELINE_TYPE.APPS
                || blockType == BLOCK_CODELINE_TYPE.LAMBDA ) {
                sbMainHeader.appendFormatLine("<strong class='{0}'>",'vp-block-header-name');
                sbMainHeader.appendFormatLine("{0}", blockName);
                sbMainHeader.appendLine("</strong>");
            } else if (blockType == BLOCK_CODELINE_TYPE.TEXT) {
                 
            } else {
                sbMainHeader.appendFormatLine("<strong class='{0}' style='margin-right:10px;'>",'vp-block-header-name');
                sbMainHeader.appendFormatLine("{0}", blockName);
                sbMainHeader.appendLine("</strong>");
            }

            sbMainHeader.appendFormatLine("<div class='{0}' style='{1}'>",'vp-apiblock-codeline-ellipsis', blockType == BLOCK_CODELINE_TYPE.TEXT
                                                                                                                ? 'background-color: transparent'
                                                                                                                : '');

            sbMainHeader.appendFormatLine("<div class='{0} {1}' title='{2}'>",'vp-block-header-param', `vp-block-header-${blockUUID}`, codeLineStr);
            sbMainHeader.appendFormatLine("{0}", codeLineStr);
            sbMainHeader.appendLine("</div>");

            sbMainHeader.appendLine("</div>");

            sbMainHeader.appendLine("</div>");
        }

        const mainHeaderDom = $(sbMainHeader.toString());
        $(blockMainDom).append(mainHeaderDom);

        /** left shadow dom 생성 */
        var blockLeftShadowDom = document.createElement(STR_DIV);
        blockLeftShadowDom.classList.add('vp-block-left-holder');
        const blockLeftShadowHeight = thisBlock.getBlockLeftShadowHeight();
        $(blockLeftShadowDom).css(STR_HEIGHT, blockLeftShadowHeight + STR_PX);
        $(blockMainDom).append(blockLeftShadowDom);



        /** depth dom 생성
         */
        var blockDepthInfoDom = $(`<span class='vp-block-depth-info'></span>`);
        var isShowDepth = this.getIsShowDepth();
        if ( isShowDepth == false ) {
            $(blockDepthInfoDom).css(STR_OPACITY, 0);
        }
        $(blockMainDom).append(blockDepthInfoDom);

        /** text 블럭일 경우 width 계산 */
        if (blockType == BLOCK_CODELINE_TYPE.TEXT) {
            $(blockMainDom).css(STR_BACKGROUND_COLOR, STR_TRANSPARENT);
            // DEPRECATED : TEXT Block도 일반 블럭과 동일하게 너비 계산
            // $(blockMainDom).css(STR_WIDTH, NUM_TEXT_BLOCK_WIDTH);
        }
        /** block width 계산 */
        var blockMaxWidth = this.getBlockMaxWidth() - (thisBlock.getDepth() * NUM_INDENT_DEPTH_PX);
        $(blockMainDom).css(STR_WIDTH, blockMaxWidth);

        blockMainDom = RenderHTMLDomColor(thisBlock, blockMainDom);

        return blockMainDom;
    }

    BlockContainer.prototype.makeShadowBlockDom = function(thisBlock) {
        var sbBlockMainDom = new sb.StringBuilder();
        sbBlockMainDom.appendFormatLine("<div class='{0}' style='{1}'>", VP_BLOCK, 'width=100%;');

        sbBlockMainDom.appendFormatLine("<div class='{0}'>",'vp-block-inner');
        sbBlockMainDom.appendFormatLine("<div class='{0}'>",'vp-block-header');
        sbBlockMainDom.appendFormatLine("<strong class='{0}' style='{1}'>",'vp-apiblock-style-flex-column-center',`margin-right:10px; 
                                                                                                    font-size:13px; 
                                                                                                    color: var(--font-primary);`);
        sbBlockMainDom.appendFormatLine("{0}",thisBlock.getBlockName());
        sbBlockMainDom.appendLine("</strong>");
        sbBlockMainDom.appendLine("</div>");
        sbBlockMainDom.appendLine("</div>");
        // line number
        // sbBlockMainDom.appendFormatLine('<span class="{0}" style="left: -32px; opacity: {1}; color: rgb(130, 130, 130);"></span>'
        //                                 , 'vp-block-num-info', 0);

        sbBlockMainDom.appendLine("</div>");

        var blockMainDom = $(sbBlockMainDom.toString());
        blockMainDom = RenderHTMLDomColor(thisBlock, blockMainDom);
        $(blockMainDom).css(STR_OPACITY, NUM_SHADOWBLOCK_OPACITY);

        var blockType = thisBlock.getBlockType()
        if (blockType == BLOCK_CODELINE_TYPE.SHADOW) {
            $(blockMainDom).addClass(VP_CLASS_BLOCK_BOTTOM_HOLDER);
        } 

        return blockMainDom;
    }

    /** node 블럭 과 text 블럭일 경우에만 line number 생성
     *  line number는 마우스 hover하면 실행버튼으로 변경 됨
     * 
     *  @param {Block} block
     */
    BlockContainer.prototype.makeBlockLineNumberInfoDom = function(block) {
        var styleName = '';
        var styleName2 = '';
        if (block.getBlockType() == BLOCK_CODELINE_TYPE.TEXT) {
            styleName = 'background-color: transparent';
            styleName2 = 'opacity:0';
        }

        var sbBlockLineNumberInfoDom = new sb.StringBuilder();
        sbBlockLineNumberInfoDom.appendFormatLine("<span class='{0}' style='{1}'>", VP_CLASS_BLOCK_NUM_INFO, styleName);
        sbBlockLineNumberInfoDom.appendFormatLine("<span class='{0}'>", 'vp-block-prefixnum-info');
        sbBlockLineNumberInfoDom.appendLine("</span>");

        sbBlockLineNumberInfoDom.appendFormatLine("<span class='{0}'>", 'vp-block-linenumber-info');
        sbBlockLineNumberInfoDom.appendLine("</span>");

        sbBlockLineNumberInfoDom.appendFormatLine("<div class='vp-apiblock-circle-play' style='{0}'></div>", styleName2);

        sbBlockLineNumberInfoDom.appendLine("</span>");

        var blockMainDom = block.getBlockMainDom();
        $(blockMainDom).append(sbBlockLineNumberInfoDom.toString());

        return blockMainDom;
    }
















    /** importPackage의 generateCode 이전에 실행할 prefix code
     *  @param {boolean} isClicked true면 node 블럭 앞 run 버튼 클릭으로 코드 실행
     */
    BlockContainer.prototype.generateCode = function(isClicked, runCell=true) {
        var importPackageThis = this.getImportPackageThis();
        importPackageThis.generateCode(true, runCell, isClicked);
    }

    /** 코드 생성 */
    BlockContainer.prototype.makeCode = function(thisBlock, asPreview = false) {
        var codeLine = STR_EMPTY;
        var rootDepth = thisBlock.getDepth();
        var blockList_thisBlockArea = thisBlock.getBlockList_thisBlockArea_noShadowBlock();

        var codeList = [];
        blockList_thisBlockArea.some( (block,index) => {
            /** 각 Block의 blockCodeLine에 맞는 코드 생성 */
            var indentString = block.getIndentString(rootDepth);
            var blockType = block.getBlockType();

            if ( blockType == BLOCK_CODELINE_TYPE.API ) {
                var apiCodeLine = block.setCodeLineAndGet(indentString, true);
                if (apiCodeLine.indexOf('BREAK_RUN') != -1) {
                    // codeLineStr += 'BREAK_RUN';
                    // return true;
                } else {
                    codeList.push(apiCodeLine);
                }
            } else if (blockType == BLOCK_CODELINE_TYPE.APPS) {
                var { code } = block.getState('apps');
                codeList.push(code);
            } else {
                var tmpCodeLine = block.setCodeLineAndGet(indentString, false)
                if (asPreview && blockType == BLOCK_CODELINE_TYPE.TEXT && tmpCodeLine.length > 0) {
                    tmpCodeLine = '# ' + tmpCodeLine.replaceAll('\n', '\n# ');
                }
                codeList.push(tmpCodeLine);
            }
        });

        // run all cell
        codeLine = codeList.join('\n');

        vpCommon.setIsAPIListRunCode(true);
        return codeLine;
    }

    /** Run All 버튼 실행시 board에 있는 전체 코드 생성 
     * FIXME: 노드별로 셀 추가하도록 수정해야 함
    */
    BlockContainer.prototype.makeAllCode = function(runcell = true, asPreview = false) {
        var rootBlock = this.getRootBlock();
        if (!rootBlock) {
            return;
        }

        // var isBreakRun = false;
        var codeLineStr = STR_EMPTY;
        var blockList = rootBlock.getRootToChildBlockList();
        var rootDepth = rootBlock.getDepth();

        var groupIdx = -1; 
        var codeList = [
            /** { type: 'code/markdown', data: '' } */
        ];
        blockList.some( (block,index) => {

            if (block.getBlockType() == BLOCK_CODELINE_TYPE.SHADOW) {
                return;
            }
            /** 각 Block의 blockCodeLine에 맞는 코드 생성 */
            var indentString = block.getIndentString(rootDepth);
            var codeLine = STR_EMPTY;
            var blockType = block.getBlockType();

            if ( blockType == BLOCK_CODELINE_TYPE.API) {
                var apiCodeLine = block.setCodeLineAndGet(indentString, true);
                if (apiCodeLine.indexOf('BREAK_RUN') != -1) {
                    // codeLineStr += 'BREAK_RUN';
                    // return true;
                } else {
                    codeLine += apiCodeLine;
                }
            } else if (blockType == BLOCK_CODELINE_TYPE.APPS) {
                var { code } = block.getState('apps');
                codeLine += code;
            } else {
                codeLine += block.setCodeLineAndGet(indentString, false);
            }

            if (blockType == BLOCK_CODELINE_TYPE.NODE || block.isGroupBlock) {
                codeList.push( { type: 'code', data: [ codeLine ] } );
                groupIdx = codeList.length - 1;
            } else if (blockType == BLOCK_CODELINE_TYPE.TEXT) {
                if (asPreview && codeLine.length > 0) {
                    codeLine = '# ' + codeLine.replaceAll('\n', '\n# ');
                }
                codeList.push( { type: 'markdown', data: [ codeLine ] } );
                groupIdx = codeList.length - 1;
            } else {
                if (codeLine != STR_EMPTY) {
                    codeList[groupIdx].data.push(codeLine);
                }
            }
        });

        // run all cell
        var cmdList = codeList.map(function(obj) { 
            var command = obj.data.join('\n');
            if (command != STR_EMPTY) {
                if (codeLineStr != STR_EMPTY) {
                    codeLineStr += '\n';
                }
                codeLineStr += command;
            }
            return { command: command, type: obj.type, exec: true }
        });
        if (runcell) {
            vpCommon.cellExecute(cmdList);
        }

        this.setAPIBlockCode(codeLineStr);
        return codeLineStr;
    }

    /** node 블럭 클릭할 때 preview */
    BlockContainer.prototype.previewCode = function(thisBlock) {
        vpCommon.setIsAPIListRunCode(false);

        var rootDepth = thisBlock.getDepth();
        var codeLine = ``;
        var blockList_thisBlockArea = thisBlock.getBlockList_thisBlockArea_noShadowBlock();
        blockList_thisBlockArea.forEach( ( block ) => {
            var indentString = block.getIndentString(rootDepth);
            var thisCodeLine =  block.setCodeLineAndGet(indentString, false);
            /** api list validation 걸릴 때 BREAK_RUN을 반환*/
            if (thisCodeLine.indexOf('BREAK_RUN') != -1) {
                /** 그래서 BREAK_RUN을 replace함수로 제거 */
                thisCodeLine = thisCodeLine.replace('BREAK_RUN','');
            }
            codeLine += thisCodeLine;
            codeLine += STR_KEYWORD_NEW_LINE;
        });

        vpCommon.setIsAPIListRunCode(true);
        return codeLine;
    }














    /** API Block 전체를 resize  할 때 */
    BlockContainer.prototype.resizeAPIblock = function() {
        /** API Block 전체 width 계산*/
        var mainPageRectWidth = $(VP_ID_PREFIX + VP_ID_WRAPPER).css(STR_WIDTH);
        var index = mainPageRectWidth.indexOf('px');
        var mainPageRectWidthNum = parseInt(mainPageRectWidth.slice(0,index));

        var PADDING_BETWEEN_BOXES = 10; // left line padding 5 + between padding 5

        var boardPageRect =  $(vpCommon.wrapSelector(VP_CLASS_PREFIX + 'vp-apiblock-tab-container'))[0].getBoundingClientRect(); 
        var boardPageRectWidth = boardPageRect.width;
        var optionPageRectWidth = mainPageRectWidthNum - boardPageRectWidth - PADDING_BETWEEN_BOXES;

        if (optionPageRectWidth < NUM_OPTION_PAGE_MIN_WIDTH) {
            boardPageRectWidth = mainPageRectWidthNum - NUM_OPTION_PAGE_MIN_WIDTH - PADDING_BETWEEN_BOXES;
            optionPageRectWidth = NUM_OPTION_PAGE_MIN_WIDTH;
        } 
        
        var optionPageRectWidth_maxWidth = mainPageRectWidthNum - NUM_API_BOARD_CENTER_PAGE_MIN_WIDTH - PADDING_BETWEEN_BOXES;

        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_OPTION_TAB)).css(STR_MAX_WIDTH, optionPageRectWidth_maxWidth);
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + 'vp-apiblock-tab-container')).css(STR_WIDTH, boardPageRectWidth );
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_OPTION_TAB)).css(STR_WIDTH, optionPageRectWidth );
        $(VP_ID_PREFIX + VP_ID_WRAPPER).css(STR_MIN_WIDTH, 830);

        this.setBlockMaxWidth_blockList(boardPageRectWidth - 60);

        /** node 블럭 width 재 계산 */
        var nodeBlockList = this.getNodeBlockList();
        nodeBlockList.forEach(nodeBlock => {
            nodeBlock.renderNodeBlockWidth(boardPageRectWidth - 60);
        });
    }

    /** option popup을 resize  할 때 */
    BlockContainer.prototype.resizeOptionPopup = function() {
        var optionPageRect = $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_OPTION_TAB))[0].getBoundingClientRect();
        var mainPageRect = $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_MAIN))[0].getBoundingClientRect();
        
        var PADDING_BETWEEN_BOXES = 4;
        
        var mainPageRectWidth = mainPageRect.width; 
        var optionPageRectWidth = optionPageRect.width;
        var boardPageRectWidth = mainPageRectWidth - optionPageRectWidth - PADDING_BETWEEN_BOXES;

        var optionPageRectWidth_maxWidth = mainPageRectWidth - NUM_API_BOARD_CENTER_PAGE_MIN_WIDTH - PADDING_BETWEEN_BOXES;

        if (boardPageRectWidth > NUM_API_BOARD_CENTER_PAGE_MIN_WIDTH) {
            $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_OPTION_TAB)).css(STR_MAX_WIDTH, 'unset !important;');
        } else {
            boardPageRectWidth = NUM_API_BOARD_CENTER_PAGE_MIN_WIDTH;
            optionPageRectWidth = optionPageRectWidth_maxWidth;
            $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_OPTION_TAB)).css(STR_MAX_WIDTH, optionPageRectWidth_maxWidth);
        }

        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + 'vp-apiblock-tab-container')).css(STR_WIDTH, boardPageRectWidth );
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_OPTION_TAB)).css(STR_WIDTH, optionPageRectWidth);
    
        this.setBlockMaxWidth_blockList(boardPageRectWidth - 60);
        
       /** node 블럭 width 재 계산 */
        var nodeBlockList = this.getNodeBlockList();
        nodeBlockList.forEach(nodeBlock => {
            nodeBlock.renderNodeBlockWidth(boardPageRectWidth - 60);
        });
    }
    
    /** resize할 때
     *  board의 width를 토대로 블럭의 max width를 정하고
     *  max width를 토대로 블럭의 width를 다시 표시함
     */
    BlockContainer.prototype.setBlockMaxWidth_blockList = function(boardPageRectWidth) {
        var blockMaxWidth = boardPageRectWidth;
        this.setBlockMaxWidth(boardPageRectWidth);
        var blockList = this.getBlockList();
        blockList.forEach(block => {
            
            var indentDepthNum = block.getIndentNumber();
            var blockWidth = blockMaxWidth - indentDepthNum;
            var blockMainDom = block.getBlockMainDom();

            block.setWidth(blockWidth);
            $(blockMainDom).css(STR_WIDTH, blockWidth);
        });
    }


    /**  LoadedVariableList  예제
        0:
        varName: "cam"
        varType: "DataFrame"
    */
    BlockContainer.prototype.setKernelLoadedVariableList = function(loadedVariableList) {
        this.loadedVariableList = loadedVariableList;
    }

    /** varName varType를 Array로 다 가져오기*/
    BlockContainer.prototype.getKernelLoadedVariableList = function() {
        return this.loadedVariableList;
    }

    /** varName만 Array로 가져오기*/
    BlockContainer.prototype.getKernelLoadedVariableNameList = function() {
        return this.loadedVariableList.map(varData => {
            return varData.varName;
        });
    }












    /** metadata init */
    BlockContainer.prototype.setAPIBlockMetadataHandler = function() {  
        var importPackageThis = this.getImportPackageThis();
        this.setMetahandler(importPackageThis.funcID);
        this.mdHandler.generateMetadata(importPackageThis);  
        this.mdHandler.metadata.apiblockList = [];
    }

    /** metadata set */
    BlockContainer.prototype.setAPIBlockMetadata = function() {  
        var importPackageThis = this.getImportPackageThis();  
        var apiBlockJsonDataList = this.makeAPIBlockMetadata();  
        var encoded_apiBlockJsonDataList = encodeURIComponent(JSON.stringify(apiBlockJsonDataList));
        
        /** API BLOCK container가 가지고 있는 metadata 
         *  이 데이터는 API Block가 metadata를 핸들링하기 위해 존재
         */
        this.mdHandler.metadata.apiblockList = encoded_apiBlockJsonDataList;
        /** importPackage가 가지고 있는 metadata 
         *  이 데이터는 #vp_saveOn 버튼을 누를시 vpNote로 간다.
        */
        importPackageThis.metadata = this.mdHandler.metadata;        
    }

    /** metadata 로드 */
    BlockContainer.prototype.loadAPIBlockMetadata = function(loadedMetadata) {
        if (loadedMetadata) {
            var importPackageThis = this.getImportPackageThis(); 
            var decodedMetadata = decodeURIComponent(loadedMetadata.apiblockList);
            var parsedDecodedMetadata = JSON.parse(decodedMetadata);

            this.mdHandler.metadata = loadedMetadata;
            this.mdHandler.metadata.apiblockList = parsedDecodedMetadata;
            importPackageThis.metadata = this.mdHandler.metadata;  

            this.reRenderBlockList_fromMetadata(parsedDecodedMetadata);   
        } 
    }

    /** metadata 세이브 */
    BlockContainer.prototype.saveAPIBlockMetadata = function() {  
        var apiBlockJsonDataList = this.makeAPIBlockMetadata();  
        var importPackageThis = this.getImportPackageThis();  
        var encoded_apiBlockJsonDataList = encodeURIComponent(JSON.stringify(apiBlockJsonDataList));
        this.mdHandler.metadata.apiblockList = encoded_apiBlockJsonDataList;

        importPackageThis.metadata = this.mdHandler.metadata;  
        this.mdHandler.saveMetadata(this.mdHandler.metadata);
    }














    /** ---------------------option popup dom 관련 메소드 --------------------------------------- */
    //

    BlockContainer.prototype.setNavigator = function(blockType, title) {
        var tag = new sb.StringBuilder();
        if (blockType == BLOCK_CODELINE_TYPE.API) {
            // api blocks
            tspl = title.split('>');
            tspl.push(vpCommon.formatString('<strong>{0}</strong>', tspl.pop()));
            tag.appendLine(tspl.join('>'));
        } else if (blockType == BLOCK_CODELINE_TYPE.NONE) {
            // visual python preview
            tag.appendFormatLine('<span class="vp-orange-text">{0}</span>', title);
        } else {
            // blocks
            tag.appendFormatLine('<strong>{0}</strong>', title);
        }

        // set navigator label
        $('.vp-apiblock-option-navigator-label').html(tag.toString());
    }

    BlockContainer.prototype.setOptionDom = function(UUID, type, blockOptionPageDom_new) {
        this.setOptionDomPool_none();
        if (this.domPool.get(UUID)) {
            if (type == BLOCK_CODELINE_TYPE.TEXT || type == BLOCK_CODELINE_TYPE.API) {
                const blockOptionPageDom_old = this.domPool.get(UUID);
                $(blockOptionPageDom_old).css(STR_DISPLAY, STR_NONE);
            } else {
                const blockOptionPageDom_old = this.domPool.get(UUID);
                $(blockOptionPageDom_old).remove();
            }
        }
        this.domPool.set(UUID, blockOptionPageDom_new);
        $('.vp-apiblock-option-tab-none').css(STR_DISPLAY, STR_NONE);
    }

    BlockContainer.prototype.getOptionDom = function(UUID) {
        const blockOptionPageDom = this.domPool.get(UUID);
        return blockOptionPageDom;
    }

    BlockContainer.prototype.deleteOptionDom = function(UUID) {
        if (this.domPool.get(UUID)) {
            const blockOptionPageDom_old = this.domPool.get(UUID);
            $(blockOptionPageDom_old).css({
                display: STR_NONE
            });
        }
    }
    BlockContainer.prototype.setOptionDom_none = function(UUID) {
        if (this.domPool.get(UUID)) {
            const blockOptionPageDom_old = this.domPool.get(UUID);
            $(blockOptionPageDom_old).css({
                display: STR_NONE
            });
        }
    }
    BlockContainer.prototype.removeOptionDom = function(UUID) {
        if (this.domPool.get(UUID)) {
            const blockOptionPageDom_old = this.domPool.get(UUID);
            $(blockOptionPageDom_old).remove();
        }
    }
    BlockContainer.prototype.deleteAllOptionDom = function() {
        this.domPool.clear();

        var optionPageSelector = this.getOptionPageSelector();
        $(optionPageSelector + ' .vp-apiblock-option').remove();
        $(optionPageSelector + ' .vp-option-page').remove();
    }

    BlockContainer.prototype.reRenderOptionDomPool = function(blockOptionPageDom_new) {
        for (const blockOptionPageDom_old of this.domPool.values()) {
            $(blockOptionPageDom_old).css({
                display: STR_NONE
            });
        }
        $(blockOptionPageDom_new).css({
            display: STR_BLOCK
        });
    }

    /** 옵션 페이지에 있는 옵션 페이지들 전부 none 처리 */
    BlockContainer.prototype.setOptionDomPool_none = function() {
        for (const blockOptionPageDom_old of this.domPool.values()) {
            $(blockOptionPageDom_old).css(STR_DISPLAY, STR_NONE);
        }

        $('.vp-apiblock-option-tab-none').css(STR_DISPLAY, STR_NONE);
        $('.vp-apiblock-option-tab-preview').css(STR_DISPLAY, STR_NONE);

        var optionPageSelector = this.getOptionPageSelector();
        $(optionPageSelector + ' .vp-apiblock-option').css(STR_DISPLAY, STR_NONE);
        $(optionPageSelector + ' .vp-option-page').css(STR_DISPLAY, STR_NONE);
    }

    /** 옵션페이지를  (N/A)로 표기 */
    BlockContainer.prototype.resetOptionPage = function() {
        // if selected block is not null, cancel process
        var block = this.getSelectBlock();
        if (block) {
            // apiBlockPackage.openMultiBtnModal_new('Cancel Option Page', `Save changes to '${saveFileName}.vp'`,['Yes', 'No', 'Cancel'], [() => {
                    // },() => {
                        
                    // },() => {
                        
                    // }]);
        }

        this.setOptionDomPool_none();
        this.setSelectBlock(null);
        this.hideOptionPreviewBox();
        $(VP_ID_PREFIX + VP_APIBLOCK_BOARD_OPTION_PREVIEW_BUTTON).removeClass('enabled');

        this.setNavigator(BLOCK_CODELINE_TYPE.NONE, 'Visual Python 1.1.7');
        this.setFocusedPageType(FOCUSED_PAGE_TYPE.BOARD);
        $('.vp-apiblock-option-tab-none').css(STR_DISPLAY, STR_BLOCK);
    }

    BlockContainer.prototype.setOptionPageWithPreview = function(codeLineStr) {
        this.setOptionDomPool_none();
        this.setSelectBlock(null);

        // codemirror with vp_overallCodePriview
        this.cmOverallPreview.setValue(codeLineStr);
        this.cmOverallPreview.save();
        this.cmOverallPreview.focus();
        var that = this;
        // this.cmOverallPreview.setCursor({ line: codeLineStr.split('\n').length, ch: 1 });
        setTimeout(function() {
            that.cmOverallPreview.refresh();
        },1);
        $('.vp-apiblock-option-tab-preview').css(STR_DISPLAY, STR_BLOCK);
    }

    BlockContainer.prototype.showOptionPageWithPreview = function() {
        var rootBlock = this.getRootBlock();
        if (rootBlock) {
            var blockList = rootBlock.getRootToChildBlockList();
            if (blockList && blockList.length > 0) {
                var allCodeLineStr = this.makeAllCode(false, true);
                this.setOptionPageWithPreview(allCodeLineStr);
                this.setNavigator(BLOCK_CODELINE_TYPE.NODE, 'Overall Code Preview');
                this.setFocusedPageType(FOCUSED_PAGE_TYPE.BOARD);
            }
        }
    }

    BlockContainer.prototype.showOptionPreviewBox = function() {
        var selectedBlock = this.getSelectBlock();
        this.setOptionPreviewBox(selectedBlock);
        $('.vp-apiblock-option-preview-container').css(STR_DISPLAY, STR_BLOCK);
    }

    BlockContainer.prototype.setOptionPreviewBox = function(selectedBlock) {
        var that = this;

        var codeLineStr = selectedBlock == null? '': this.makeCode(selectedBlock, true);

        this.cmOptionPreview.setValue(codeLineStr);
        this.cmOptionPreview.save();
        setTimeout(function() {
            that.cmOptionPreview.refresh();
        },1);
    }

    BlockContainer.prototype.hideOptionPreviewBox = function() {
        $('.vp-apiblock-option-preview-container').css(STR_DISPLAY, STR_NONE);
    }

    BlockContainer.prototype.getBoardPage_$ = function() {
        var $boardPage = $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD));
        return $boardPage;
    }

    BlockContainer.prototype.getOptionPage_$ = function() {
        var $optionPage = $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_OPTION_TAB_SELECTOR));
        return $optionPage;
    }

    BlockContainer.prototype.getOptionPageSelector = function() {
        var optionPageSelector = VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_OPTION_TAB_SELECTOR;
        return optionPageSelector;
    }
    return BlockContainer;
});
