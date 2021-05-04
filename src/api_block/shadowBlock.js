define([
    './api.js'
    , './constData.js'
], function ( api, constData ) {
    const {  MapTypeToName } = api;

    const { BLOCK_DIRECTION
            , BLOCK_CODELINE_TYPE
            , NUM_INDENT_DEPTH_PX
            , NUM_SHADOWBLOCK_OPACITY

            , STR_BLOCK
            , STR_DIV
            , STR_OPACITY
            , STR_WIDTH
            , STR_MARGIN_LEFT
            , STR_DISPLAY
            
            , VP_CLASS_PREFIX
            , VP_CLASS_BLOCK_SHADOWBLOCK_CONTAINER
            , VP_CLASS_SELECTED_SHADOWBLOCK } = constData;
    
    var ShadowBlock = function(blockContainerThis, type, realBlock) {

        this.type = type;
        this.name = MapTypeToName(type);
        this.direction = -1;
        this.rootBlockUuid = '';
        this.blockContainerThis = blockContainerThis;
        this.width = blockContainerThis.getBlockMaxWidth();
   
        this.realBlock = realBlock;
        this.rootDepth = 0;
        this.rootDom = null;
        this.containerDom = null;
        this.selectBlock = null;
        this.childListDom = null;
        this.childBlockList = [];
        this.init();
    }

    ShadowBlock.prototype.init = function() {
        var blockContainerThis = this.blockContainerThis;

        /** root container 생성 */
        var shadowContainerDom = document.createElement(STR_DIV);
        $(shadowContainerDom).css(STR_DISPLAY,STR_BLOCK);
        $(shadowContainerDom).addClass(VP_CLASS_BLOCK_SHADOWBLOCK_CONTAINER);
        $(shadowContainerDom).addClass(VP_CLASS_SELECTED_SHADOWBLOCK);

        /** 블럭을 이동할 때  */
        if (this.realBlock) {
            this.childListDom = [];
            this.childBlockList = this.realBlock.getBlockList_thisBlockArea();
            /*  첫번째 블럭이 node 블럭이고
             *  toggle 된 상태면 두번째 이후 블럭 생성 안함
             */
            if (this.realBlock.getBlockType() == BLOCK_CODELINE_TYPE.NODE
                || this.realBlock.getBlockType() == BLOCK_CODELINE_TYPE.TEXT
                || this.realBlock.isGroupBox) {
                var blockMainDom = blockContainerThis.makeShadowBlockDom(this.realBlock);
    
                $(blockMainDom).css(STR_OPACITY, NUM_SHADOWBLOCK_OPACITY);
                this.childListDom.push(blockMainDom);
                $(shadowContainerDom).append(blockMainDom);
            } else {
                this.childBlockList.forEach(block => {
                    var blockMainDom = blockContainerThis.makeShadowBlockDom(block);
    
                    $(blockMainDom).css(STR_OPACITY, NUM_SHADOWBLOCK_OPACITY);
                    this.childListDom.push(blockMainDom);
                    $(shadowContainerDom).append(blockMainDom);
                });
            }

        /** Logic(Define, Control, Execute) 이동할 때  */ 
        } else {
            this.childListDom = [];

            var blockMainDom = blockContainerThis.makeShadowBlockDom(this);

            $(blockMainDom).css(STR_OPACITY, NUM_SHADOWBLOCK_OPACITY);
            this.childListDom.push(blockMainDom);
            $(shadowContainerDom).append(blockMainDom);
        }

        this.setBlockContainerDom(shadowContainerDom);
    }
    
    ShadowBlock.prototype.reRender = function() {
        var rootDepth = this.getRootDepth();
        var blockMaxWidth = this.blockContainerThis.getBlockMaxWidth();

        /** 블럭을 이동할 때  */
        if (this.realBlock) {
            var firstShadowDomDepth = this.childBlockList[0].getDepth();
            this.childListDom.forEach( (childDom, index) => {
                var childBlockDepth = this.childBlockList[index].getDepth();
                var _childBlockDepth = childBlockDepth - firstShadowDomDepth  + rootDepth;
                var blockwidth = blockMaxWidth - (_childBlockDepth * NUM_INDENT_DEPTH_PX);
 
                $(childDom).css(STR_WIDTH, blockwidth );
                $(childDom).css(STR_MARGIN_LEFT, _childBlockDepth * NUM_INDENT_DEPTH_PX);
            });

        /** Logic(Define, Control, Execute) 이동할 때  */ 
        } else {
            this.childListDom.forEach( (childDom) => {
                var blockwidth = blockMaxWidth - (rootDepth * NUM_INDENT_DEPTH_PX);
                $(childDom).css(STR_WIDTH, blockwidth);
                $(childDom).css(STR_MARGIN_LEFT, rootDepth * NUM_INDENT_DEPTH_PX);
            });
        }
    }

    /** Logic(Define, Control, Execute)이나 블럭이 이동할 때, 
     *  shadow를 생성하고 그 shadow를 block container dom에 insert하는 메소드
    */
    ShadowBlock.prototype.insertShadowDomToBlockDom = function( thisBlock, direction, asGroup=false) {
      // var thisBlock = this;
        // console.log('depth',depth);
        var blockContainerThis = this.getBlockContainerThis();

        var depth = thisBlock.getDepth();
        var indentPxNum = thisBlock.getIndentNumber();
        if (direction == BLOCK_DIRECTION.INDENT) {
            indentPxNum += NUM_INDENT_DEPTH_PX;
            depth++;
        }
  
        var blockMaxWidth = blockContainerThis.getBlockMaxWidth() - indentPxNum;
    
        var shadowContainerDom = this.getBlockContainerDom();
        $(shadowContainerDom).css(STR_WIDTH, blockMaxWidth);
        $(shadowContainerDom).css(STR_DISPLAY,STR_BLOCK);
        // show line number for group block's shadow
        // if (asGroup) {
        //     $(shadowContainerDom).first('.vp-block-num-info').css(STR_OPACITY, 1);
        // } else {
        //     $(shadowContainerDom).first('.vp-block-num-info').css(STR_OPACITY, 0);
        // }

        this.setSelectBlock(thisBlock);
        this.setRootDepth(depth);
        this.reRender();

        var containerDom = blockContainerThis.getBlockContainerDom();
        containerDom.insertBefore(shadowContainerDom, thisBlock.getBlockMainDom().nextSibling);
    }

    ShadowBlock.prototype.insertShadowDomToBlockDomAsGroup = function(thisBlock, direction) {
        var blockContainerThis = this.getBlockContainerThis();

        var depth = thisBlock.getDepth();
        var indentPxNum = thisBlock.getIndentNumber();
        if (direction == BLOCK_DIRECTION.INDENT) {
            indentPxNum += NUM_INDENT_DEPTH_PX;
            depth++;
        }
  
        var blockMaxWidth = blockContainerThis.getBlockMaxWidth() - indentPxNum;
    
        var shadowContainerDom = this.getBlockContainerDom();
        $(shadowContainerDom).css(STR_WIDTH, blockMaxWidth);
        $(shadowContainerDom).css(STR_DISPLAY, STR_BLOCK);

        // show line number for group block's shadow
        $(shadowContainerDom).first('.vp-block-num-info').css(STR_OPACITY, 1);

        this.setSelectBlock(thisBlock);
        this.setRootDepth(depth);
        this.reRender();

        var containerDom = blockContainerThis.getBlockContainerDom();
        containerDom.insertBefore(shadowContainerDom, thisBlock.getBlockMainDom().nextSibling);
    }

    ShadowBlock.prototype.getBlockContainerThis = function() {
        return this.blockContainerThis;
    }

    ShadowBlock.prototype.setRootDepth = function(rootDepth) {
        this.rootDepth = rootDepth;
    }
    ShadowBlock.prototype.getRootDepth = function() {
        return this.rootDepth;
    }

    ShadowBlock.prototype.getBlockName = function() {
        return this.name;
    }
    ShadowBlock.prototype.setBlockName = function(name) {
        this.name = name;
    }

    ShadowBlock.prototype.getBlockType = function() {
        return this.type;
    }


    ShadowBlock.prototype.getBlockContainerDom = function() {
        return this.containerDom;
    }
    ShadowBlock.prototype.setBlockContainerDom = function(containerDom) {
        this.containerDom = containerDom;
    }






    ShadowBlock.prototype.setSelectBlock = function(selectBlock) {
        this.selectBlock = selectBlock;
    }
    ShadowBlock.prototype.getSelectBlock = function() {
        return this.selectBlock;
    }

    /** insertShadowDomToBlockDom메소드에서 
     *  block container dom에 insert된 Shadow 블럭 dom을 제거하는 메소드 */
    ShadowBlock.prototype.deleteShadowBlock = function() {
        var blockContainerThis = this.blockContainerThis;
        var rootBlockContainerDom = blockContainerThis.getBlockContainerDom();
        $(rootBlockContainerDom).find(VP_CLASS_PREFIX + VP_CLASS_BLOCK_SHADOWBLOCK_CONTAINER).remove();
    }

    return ShadowBlock;
});
