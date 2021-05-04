define([
    'nbextensions/visualpython/src/common/StringBuilder'
    , './api.js'
    , './constData.js'
], function ( sb, api, constData ) {
    const { MapTypeToName
            , RenderHTMLDomColor
            , IsDefineBlockType
            , IsControlBlockType
            , GenerateDefCode } = api;
    const {  BLOCK_CODELINE_TYPE
            , BLOCK_DIRECTION

            , STR_CLICK

            , VP_CLASS_PREFIX
            , VP_CLASS_APIBLOCK_MAIN    
            , VP_CLASS_APIBLOCK_BOARD

            , STR_EMPTY
            , DEF_BLOCK_ARG6_TYPE

            , STATE_defInParamList } = constData;  

    var CreateBlockBtn = function(blockContainerThis, type) { 
        this.blockContainerThis = blockContainerThis;
        this.type = type;
        this.name = MapTypeToName(type)
        this.createBlockBtnDom = null;
        this.render();
        this.bindBtnDragEvent();
        this.bindBtnClickEvent();
    }

    CreateBlockBtn.prototype.getBlockContainerThis = function() {
        return this.blockContainerThis;
    }


    CreateBlockBtn.prototype.getBlockName = function() {
        return this.name;
    }

    CreateBlockBtn.prototype.setBlockName = function(name) {
        this.name = name;
    }
    CreateBlockBtn.prototype.getBlockType = function() {
        return this.type;
    }






    CreateBlockBtn.prototype.getBlockMainDom = function() {
        return this.createBlockBtnDom;
    }

    CreateBlockBtn.prototype.setBlockMainDom = function(createBlockBtnDom) {
        this.createBlockBtnDom = createBlockBtnDom;
    }
    CreateBlockBtn.prototype.getBlockMainDomPosition = function() {
        var createBlockDom = this.getBlockMainDom();
        var clientRect = $(createBlockDom)[0].getBoundingClientRect();
        return clientRect;
    }

    CreateBlockBtn.prototype.render = function() {
        var sbCreateBlockBtn = new sb.StringBuilder();
        sbCreateBlockBtn.appendFormatLine("<div class='{0}'>",'vp-apiblock-tab-navigation-node-block-body-btn');
        sbCreateBlockBtn.appendFormatLine("<span class='{0}'>",'vp-block-name');
        sbCreateBlockBtn.appendFormatLine("{0}", this.getBlockName());
        sbCreateBlockBtn.appendLine("</span>");
        sbCreateBlockBtn.appendLine("</div>");

        var createBlockContainer = null;
        var blockType = this.getBlockType();
        /** LOGIC - define */
        if ( IsDefineBlockType(blockType) == true ) {
            createBlockContainer = $(`.vp-apiblock-left-tab-1`);
        /** LOGIC - control */
        } else if ( IsControlBlockType(blockType) == true) {
            createBlockContainer = $(`.vp-apiblock-left-tab-2`);
        /** LOGIC - Execute */
        }  else  {
            createBlockContainer = $(`.vp-apiblock-left-tab-3`);
        }
  
        var createBlockBtnDom = $(sbCreateBlockBtn.toString());
        this.setBlockMainDom(createBlockBtnDom);
        createBlockBtnDom = RenderHTMLDomColor(this, createBlockBtnDom);

        createBlockContainer.append(createBlockBtnDom);
    }

    /**
     * 메뉴 블럭 클릭 시 Board에 생성하는 이벤트
     */
    CreateBlockBtn.prototype.bindBtnClickEvent = function() {
        var blockContainerThis = this.blockContainerThis;
        var blockCodeLineType = this.getBlockType();
        // var funcID = this.funcID;
        // var naviInfo = getNavigationInfo(funcID);
        $(this.createBlockBtnDom).on(STR_CLICK, function(event) {
            event.stopPropagation();

            /** board에 선택한 API List 블럭 생성 */
            blockContainerThis.resetBlockList();

            var isFirstBlock = false;
            const blockList = blockContainerThis.getBlockList();
            /** board에 블럭이 0개 일때
             *  즉 블럭이 처음으로 생성되는 경우
             */
            if (blockList.length == 0) {
                isFirstBlock = true;
            }

            var createdBlock_api = blockContainerThis.createBlock(blockCodeLineType);
            // createdBlock_api.setFuncID(funcID);
            // createdBlock_api.setState({
            //     [STATE_codeLine]: naviInfo
            // });
            // createdBlock_api.setOptionPageLoadCallback(optionPageLoadCallback_block);
            // createdBlock_api.setLoadOption(loadOption_block);

            var createdBlock_node;
            /** board에 블럭이 0개 있을 때 
             *  즉 블럭을 board에 처음 생성 할 때 
             */
            if (isFirstBlock == true) {
                createdBlock_node = blockContainerThis.createNodeBlock();

                /** 최초 생성된 root 블럭 set root direction */
                createdBlock_node.setDirection(BLOCK_DIRECTION.ROOT);
                createdBlock_node.appendBlock(createdBlock_api, BLOCK_DIRECTION.DOWN);
                blockContainerThis.reNewContainerDom();
                blockContainerThis.reRenderAllBlock_asc();

                createdBlock_node.writeCode('Node');
            /**  board에 블럭이 1개 이상 있을 때 */
            } else {
                var selectedBlock = blockContainerThis.getSelectBlock();
                /** board에 선택한 블럭이 있고,
                 *  선택한 블럭이 Text 블럭이 아닐 때
                 */
                if (selectedBlock 
                    && selectedBlock.getBlockType() != BLOCK_CODELINE_TYPE.TEXT) {
                            
                    selectedBlock = blockContainerThis.findNodeBlock(selectedBlock);
                    selectedBlock.getLastBlock_from_thisBlockArea().appendBlock(createdBlock_api, BLOCK_DIRECTION.DOWN);
                    selectedBlock.renderSelectedBlockColor(true);
        
                    blockContainerThis.reRenderAllBlock_asc();
                /** 그 외의 경우 */
                } else {
                    createdBlock_node = blockContainerThis.createNodeBlock();
                    createdBlock_node.appendBlock(createdBlock_api, BLOCK_DIRECTION.DOWN);

                    const nodeBlockAndTextBlockList = blockContainerThis.getNodeBlockAndTextBlockList_asc();
                    nodeBlockAndTextBlockList[nodeBlockAndTextBlockList.length -1].getLastBlock_from_thisBlockArea().appendBlock(createdBlock_node, BLOCK_DIRECTION.DOWN);

                    blockContainerThis.reRenderAllBlock_asc();
                    createdBlock_node.writeCode('Node');
                }
            }

            // createdBlock_api.writeCode(naviInfo);
            // setClosureBlock(createdBlock_api);
            // loadOption_block(funcID, optionPageLoadCallback_block);

            blockContainerThis.resetBlockListAndRenderThisBlock(createdBlock_api);
        });
    }

    CreateBlockBtn.prototype.bindBtnDragEvent = function() {
        var thisBlockBtn = this;
        var createBlockDom = this.getBlockMainDom();
        var blockContainerThis = this.getBlockContainerThis();
        var blockCodeLineType = this.getBlockType();

        var currCursorX = 0;
        var currCursorY = 0;
        var newPointX = 0;
        var newPointY = 0;

        var selectedBlockDirection = null;
        var shadowBlock = null;
        var newBlock = null;

        var width = 0;
        $(createBlockDom).draggable({ 
            appendTo: VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_MAIN,
            containment: VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_MAIN,
            cursor: 'move', 
            helper: 'clone',
            start: function(event, ui) {
                /** shadow 블럭 생성 */
                shadowBlock = blockContainerThis.createShadowBlock( blockCodeLineType);

                blockContainerThis.reLoadBlockListLeftHolderHeight();  
                /** width 길이 결정 */
                var clientRect  = thisBlockBtn.getBlockMainDomPosition();
                width = clientRect.width;
            },
            drag: async function(event, ui) {  
       
                currCursorX = event.clientX; 
                currCursorY = event.clientY; 

                /** 만약  아래 로직에서 + thisBlockWidth + 10이 없다면 마우스 커서 오른쪽으로 이동 됨*/
                newPointX = currCursorX - $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD).offset().left  + width + 80 ;
                newPointY = currCursorY - $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD).offset().top + 50 ;

                /** drag Block 생성 버튼 마우스 커서 왼쪽 위로 이동 구현 */
                ui.position = {
                    top: newPointY,
                    left: newPointX
                };
             
                ({ selectedBlock, selectedBlockDirection } = blockContainerThis.dragBlock(false, null, shadowBlock, 
                                                                                            null, selectedBlockDirection, currCursorX, currCursorY));
        
            },
            stop: function() {

                var selectedBlock = null;
                if (shadowBlock) {
                    selectedBlock = shadowBlock.getSelectBlock();
                    shadowBlock.deleteShadowBlock();
                }
           
                /** Board에 생성된 Block에 연결한 경우 */
                if (selectedBlock) {
                    newBlock = blockContainerThis.createBlock(blockCodeLineType );
                    selectedBlock.appendBlock(newBlock, selectedBlockDirection);
                    // console.log('Board에 생성된 Block에 연결한 경우');

                /** Board에 생성된 Block에 연결하지 못한 경우 
                 *  즉 어떤 블럭에도 연결하지 못하고 생성한 경우
                */
                }  else { 
           
                    /** 
                     * ----------------Board에 생성된 Block이 1개도 없을 때----------------------------
                     */
                    var blockList = blockContainerThis.getBlockList();
                    if (blockList.length == 0) {

                        blockContainerThis.reNewContainerDom();
                        blockContainerThis.reRenderAllBlock_asc();

                        newBlock = blockContainerThis.createNodeBlock();
                        var createdBlock = blockContainerThis.createBlock( blockCodeLineType );
                        newBlock.appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);

                        /** 최초 생성된 root 블럭 set root direction */
                        newBlock.setDirection(BLOCK_DIRECTION.ROOT);
                    

                    /** `
                     * -----------------Board에 생성된 Block이 적어도 1개는 있을 때---------------------
                     */
                     /** 선택한 블럭이 있을때 */
                    } else if (blockContainerThis.getSelectBlock() 
                                && blockContainerThis.getSelectBlock().getBlockType() != BLOCK_CODELINE_TYPE.TEXT) {
                        // console.log('선택한 블럭이 있을때');

                        newBlock = blockContainerThis.createBlock(blockCodeLineType );
                        var findedNodeBlock = blockContainerThis.findNodeBlock();
                        findedNodeBlock.getLastBlock_from_thisBlockArea().appendBlock(newBlock, BLOCK_DIRECTION.DOWN);
                        
                    /** 선택한 블럭이 없을때 */
                    }  else {
                        // console.log('선택한 블럭이 없을때');

                        newBlock = blockContainerThis.createNodeBlock();
                        var createdBlock = blockContainerThis.createBlock( blockCodeLineType );
                        newBlock.appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);

                        var lastBottomBlock = blockContainerThis.getRootToLastBottomBlock();
                        lastBottomBlock.appendBlock(newBlock, BLOCK_DIRECTION.DOWN);
                    }
                }
 

                blockContainerThis.stopDragBlock(false, newBlock); 
                shadowBlock = null;
                newBlock = null;

            }
        });
    }

    return CreateBlockBtn;
});
