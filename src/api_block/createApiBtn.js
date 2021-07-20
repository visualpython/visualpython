define([
    'nbextensions/visualpython/src/common/StringBuilder'
    , './api.js'
    , './constData.js'
    , './createBlockBtn.js'
    , './api_list.js'
    , 'nbextensions/visualpython/src/common/constant'
], function ( sb, api, constData, createBlockBtn, api_list, vpConst ) {

    const { RenderHTMLDomColor } = api;
    const {  BLOCK_CODELINE_TYPE
            , BLOCK_DIRECTION

            , VP_CLASS_PREFIX
            , VP_CLASS_APIBLOCK_MAIN    
            , VP_CLASS_APIBLOCK_BOARD

            , STATE_codeLine
        
            , STR_CLICK } = constData;  

    const { api_listInit 
        , libraryLoadCallback
        , toggleApiListSubGroupShow
        , makeOptionPageNaviInfo
        , loadLibraries
        , getNavigationInfo } = api_list;
        
    const CreateBlockBtn = createBlockBtn;

    var CreateApiBtn = function(blockContainerThis, funcID, name, grpName) { 
        this.blockContainerThis = blockContainerThis;
        this.type = constData.BLOCK_CODELINE_TYPE.API;

        this.funcID = funcID;
        this.name = name;
        this.grpName = grpName;

        this.createBlockBtnDom = null;
        this.render();
        // this.bindBtnDragEvent();
        this.bindApiClickEvent();
    }

    /**
     * CreateBlockBtn 에서 상속
     */
    CreateApiBtn.prototype = Object.create(CreateBlockBtn.prototype);

    CreateApiBtn.prototype.getName = function() { return this.name; }
    CreateApiBtn.prototype.getGrpName = function() { return this.grpName; }

    CreateApiBtn.prototype.setName = function(name) { this.name = name; }
    CreateApiBtn.prototype.setGrpName = function(grpName) { this.grpName = grpName; }

    CreateApiBtn.prototype.render = function() {
        var sbCreateBlockBtn = new sb.StringBuilder();
        // sbCreateBlockBtn.appendFormatLine("<div class='{0}'>",'vp-apiblock-tab-navigation-node-block-body-btn');
        sbCreateBlockBtn.appendFormatLine("<div class='{0}'>", 'vp-apiblock-tab-navigation-node-block-body-btn api');
        sbCreateBlockBtn.appendFormatLine("<span class='{0}' title='{1}'>",'vp-block-name', this.getName());
        sbCreateBlockBtn.appendFormatLine("{0}", this.getName());
        sbCreateBlockBtn.appendLine("</span>");
        sbCreateBlockBtn.appendLine("</div>");

        var createBlockContainer = null;

        /** API - define */
        createBlockContainer = $(`.vp-apiblock-left-tab-` + this.getGrpName());
  
        var createBlockBtnDom = $(sbCreateBlockBtn.toString());
        this.setBlockMainDom(createBlockBtnDom);
        createBlockBtnDom = RenderHTMLDomColor(this, createBlockBtnDom);

        createBlockContainer.append(createBlockBtnDom);

        // this.createBlockBtnDom = createBlockBtnDom;
    }

    /**
     * 메뉴 블럭 클릭 시 Board에 생성하는 이벤트
     */
    CreateApiBtn.prototype.bindApiClickEvent = function() {
        var blockContainerThis = this.blockContainerThis;
        var funcID = this.funcID;
        $(this.createBlockBtnDom).on(STR_CLICK, function(event) {
            var naviInfo = getNavigationInfo(funcID);
            
            /** board에 선택한 API List 블럭 생성 */
            blockContainerThis.createAPIListBlock(funcID, naviInfo);
            event.stopPropagation();
        });
    }

    /**
     * 메뉴 블럭 Drag & Drop으로 Board에 생성하는 이벤트
     */
    CreateApiBtn.prototype.bindBtnDragEvent = function() {
        var funcID = this.funcID;
        var naviInfo = getNavigationInfo(funcID);

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

                var createdBlock = null;
           
                /** Board에 생성된 Block에 연결한 경우 */
                if (selectedBlock) {
                    createdBlock = blockContainerThis.createBlock(blockCodeLineType, null, { funcID: funcID } );
                    createdBlock.apply();
                    newBlock = createdBlock;
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

                        // newBlock = blockContainerThis.createNodeBlock();
                        createdBlock = blockContainerThis.createBlock( blockCodeLineType, null, { funcID: funcID }, true);
                        createdBlock.apply();
                        newBlock = createdBlock;
                        createdBlock.setDirection(BLOCK_DIRECTION.ROOT);
                        blockContainerThis.addNodeBlock(createdBlock);
                        
                        // newBlock.appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);

                        /** 최초 생성된 root 블럭 set root direction */
                        // newBlock.setDirection(BLOCK_DIRECTION.ROOT);
                    

                    /** `
                     * -----------------Board에 생성된 Block이 적어도 1개는 있을 때---------------------
                     */
                     /** 선택한 블럭이 있을때 */
                    // } else if (blockContainerThis.getSelectBlock() 
                    //             && blockContainerThis.getSelectBlock().getBlockType() != BLOCK_CODELINE_TYPE.TEXT) {
                    //     // console.log('선택한 블럭이 있을때');

                    //     createdBlock = blockContainerThis.createBlock(blockCodeLineType, { funcID: funcID } );
                    //     newBlock = createdBlock;
                    //     var findedNodeBlock = blockContainerThis.findNodeBlock();
                    //     findedNodeBlock.getLastBlock_from_thisBlockArea().appendBlock(newBlock, BLOCK_DIRECTION.DOWN);
                        
                    /** 선택한 블럭이 없을때 */
                    }  else {
                        // console.log('선택한 블럭이 없을때');

                        createdBlock = blockContainerThis.createBlock( blockCodeLineType, null, { funcID: funcID }, true);
                        createdBlock.apply();
                        newBlock = createdBlock;
                        blockContainerThis.addNodeBlock(createdBlock);

                        var lastBottomBlock = blockContainerThis.getRootToLastBottomBlock();
                        lastBottomBlock.appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);
                    }
                }
                
                blockContainerThis.stopDragBlock(false, newBlock); 
                
                // write code
                createdBlock.writeCode(createdBlock.getState(STATE_codeLine));
                
                blockContainerThis.reRenderAllBlock_asc();
                blockContainerThis.resetBlockListAndRenderThisBlock(newBlock);

                // save state
                // createdBlock.saveState();
                
                shadowBlock = null;
                newBlock = null;
            }
        });
    }

    return CreateApiBtn;
});