define([
    'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/container/vpContainer'
    , 'nbextensions/visualpython/src/common/constant'

    , './api.js'
 
    , './constData.js'

    , './component/option/class_option.js'
    , './component/option/def_option.js'
    , './component/option/if_option.js'
    , './component/option/elif_option.js'  

    , './component/option/except_option.js'  
    , './component/option/for_option.js'

    , './component/option/import_option.js'  

    , './component/option/code_option.js'

    , './component/option/return_option.js'
    , './component/option/while_option.js'
    , './component/option/lambda_option.js'

    , './component/option/api_option.js'

    , './component/option/text_option.js'
    , './component/option/node_option.js'

    , './component/option/none_option.js'
], function ( vpCommon, vpContainer, vpConst 
    
              , api 
    
              , constData 

              , InitClassBlockOption
              , InitDefBlockOption
              , InitIfBlockOption
              , InitElifBlockOption

              , InitExceptBlockOption
              , InitForBlockOption

              , InitImportBlockOption

              , InitCodeBlockOption

              , InitReturnBlockOption
              , InitWhileBlockOption
              , InitLambdaBlockOption
               
              , ApiBlockOption

              , InitTextBlockOption
              , InitNodeBlockOption
              , InitNoneOption) {

    const { InitAPIBlockOption, LoadAPIBlockOption } = ApiBlockOption;

    const {  SetChildBlockList_down_first_indent_last

            , MapTypeToName

            , MapNewLineStrToIndentString
            , IsCanHaveIndentBlock
            , IsElifElseExceptFinallyBlockType
            , IsIfForTryBlockType
            
            , GenerateApiCode

            , GenerateClassInParamList
            , GenerateDefCode
            , GenerateReturnCode
            , GenerateIfCode
            , GenerateForCode
            , GenerateLambdaCode
            , GenerateExceptCode
            , GenerateImportCode
            , GenerateWhileCode
        
            , IsCodeBlockType
            , IsDefineBlockType
            , IsNodeTextBlockType
            , ShowCodeBlockCode } = api;

    const { BLOCK_CODELINE_TYPE
            , BLOCK_DIRECTION
            , FOCUSED_PAGE_TYPE
    
            , FOR_BLOCK_ARG3_TYPE
                
             
            , IF_BLOCK_CONDITION_TYPE
    
            , NUM_BLOCK_HEIGHT_PX
            , NUM_INDENT_DEPTH_PX
            , NUM_MAX_ITERATION

            , NUM_NODE_OR_TEXT_BLOCK_MARGIN_TOP_PX
            , NUM_EXCEED_DEPTH
     
            , NUM_BLOCK_BOTTOM_HOLDER_HEIGHT
    
            , STR_EMPTY
            , STR_TOP
            , STR_LEFT
            , STR_BORDER
            , STR_BORDER_LEFT
            , STR_PX
            , STR_OPACITY
            , STR_MARGIN_TOP
            , STR_MARGIN_LEFT
            , STR_DISPLAY
            , STR_BACKGROUND_COLOR
            , STR_HEIGHT
            , STR_NONE
            , STR_BLOCK
            , STR_FLEX
            , STR_POSITION
            , STR_ABSOLUTE
            , STR_TRANSPARENT
            , STR_WIDTH
            , STR_TITLE
            , STR_BREAK
            , STR_CONTINUE
            , STR_PASS
            , STR_ONE_SPACE
            , STR_ONE_INDENT 
            , STR_MSG_BLOCK_DEPTH_MUSH_NOT_EXCEED_6
            , STR_CLICK
            , STR_RIGHT_CLICK
            , STR_KEYWORD_NEW_LINE
            , STR_INPUT_YOUR_CODE
            , STR_COLOR

            , VP_BLOCK
            , VP_BLOCK_BLOCKCODELINETYPE_CLASS_DEF
            , VP_CLASS_PREFIX
    
            , VP_CLASS_APIBLOCK_BOARD
            , VP_CLASS_BLOCK_BOTTOM_HOLDER
            , VP_CLASS_BLOCK_SHADOWBLOCK_CONTAINER
            , VP_CLASS_APIBLOCK_BLOCK_HEADER
            , VP_CLASS_SELECTED_SHADOWBLOCK
                
            , VP_CLASS_STYLE_FLEX_ROW_BETWEEN
            , VP_CLASS_STYLE_FLEX_ROW_END
            , VP_CLASS_BLOCK_SUB_BTN_CONTAINER

            , VP_CLASS_BLOCK_LEFT_HOLDER
            , VP_CLASS_BLOCK_DEPTH_INFO
            , VP_CLASS_BLOCK_NUM_INFO

            , VP_CLASS_APIBLOCK_NODEBLOCK_INPUT
            , VP_CLASS_APIBLOCK_NODEBLOCK_TEXT
            , VP_CLASS_APIBLOCK_NODEBLOCK
            , VP_CLASS_APIBLOCK_NODEBLOCK_TEXT_CONTAINER
            , STR_CHANGE_KEYUP_PASTE
    
            , STATE_className
            , STATE_defName
            , STATE_isIfElse
    
            , STATE_isFinally
            , STATE_codeLine
    
            , COLOR_CLASS_DEF
            , COLOR_CONTROL
            , COLOR_API
            , COLOR_CODE
    
            , COLOR_CLASS_DEF_STRONG
            , COLOR_CONTROL_STRONG
            , COLOR_API_STRONG
            , COLOR_CODE_STRONG
            
            , COLOR_WHITE
            , COLOR_BLACK
            , COLOR_LINENUMBER
            , COLOR_GRAY_input_your_code

            , ERROR_AB0002_INFINITE_LOOP
        
            , IMPORT_DEFAULT_DATA_LIST
        
            , APPS_CONFIG } = constData;

            
    var Block = function(blockContainerThis, type , blockData, isGroupBlock=false) {
        var codeStr = STR_EMPTY;
        var blockType = type;
        if ( blockType == BLOCK_CODELINE_TYPE.CLASS ) {
            var classNum = blockContainerThis.getClassNum();
            blockContainerThis.addClassNum();

        } else if ( blockType == BLOCK_CODELINE_TYPE.DEF) {
            var defNum = blockContainerThis.getDefNum();
            blockContainerThis.addDefNum();

        } else if (blockType == BLOCK_CODELINE_TYPE.BREAK) {
            codeStr = STR_BREAK

        } else if (blockType == BLOCK_CODELINE_TYPE.CONTINUE) {
            codeStr = STR_CONTINUE

        } else if (blockType == BLOCK_CODELINE_TYPE.PASS) {
            codeStr = STR_PASS

        } else if (blockType == BLOCK_CODELINE_TYPE.NODE) {
            blockContainerThis.addNodeBlock(this);

        } else if (blockType == BLOCK_CODELINE_TYPE.TEXT) {
            blockContainerThis.addTextBlock(this);
        }

        /** state 데이터는 vpnote로 저장할 때, 저장 되는 데이터
         *  state가 아닌 데이터는 저장 할 수 없고, 주피터에서 블럭을 표현하는 용도로만 사용된다.
         */
        this.state = {
               
            className: 'vpClass' + classNum
            , parentClassName: STR_EMPTY
            , classInParamList: [STR_EMPTY]
              
            , defName: 'vpFunc' + defNum
            , defInParamList: []

            , ifConditionList: [
                {
                    arg1: STR_EMPTY
                    , arg2: STR_EMPTY
                    , arg3: STR_EMPTY
                    , arg4: STR_EMPTY
                    , arg5: STR_EMPTY
                    , arg6: STR_EMPTY
                    , codeLine: STR_EMPTY
                    , conditionType: IF_BLOCK_CONDITION_TYPE.ARG
                }
            ]
              
            , elifConditionList: [
                {
                    arg1: STR_EMPTY
                    , arg2: STR_EMPTY
                    , arg3: STR_EMPTY
                    , arg4: STR_EMPTY
                    , arg5: STR_EMPTY
                    , arg6: STR_EMPTY
                    , codeLine: STR_EMPTY
                    , conditionType: IF_BLOCK_CONDITION_TYPE.ARG
                }
            ]
            , isIfElse: false
             
            , forParam: {
                arg1: STR_EMPTY
                , arg2: STR_EMPTY
                , arg3: FOR_BLOCK_ARG3_TYPE.RANGE
                , arg4: STR_EMPTY
                , arg5: STR_EMPTY
                , arg6: STR_EMPTY
                , arg7: STR_EMPTY
                , arg8: STR_EMPTY

                , arg3InputStr: STR_EMPTY
                , arg3Default: STR_EMPTY
            }

            , whileConditionList: [
                {
                    arg1: STR_EMPTY
                    , arg2: STR_EMPTY
                    , arg3: STR_EMPTY
                    , arg4: 'and'
                }
            ]

            , exceptConditionList: [
                {
                    arg1: STR_EMPTY
                    , arg2: `none`
                    , arg3: STR_EMPTY
                    , codeLine: STR_EMPTY
                    , conditionType: IF_BLOCK_CONDITION_TYPE.ARG
                }
            ]
            , isFinally: false

         
            , baseImportList: IMPORT_DEFAULT_DATA_LIST
            , customImportList: []
            , isBaseImportPage: true
              
            , lambdaArg1: STR_EMPTY
            , lambdaArg2List: [ ]
            , lambdaArg3: STR_EMPTY
          
            , returnOutParamList: [ STR_EMPTY ]
            
            , customCodeLine: codeStr

            , metadata: null
            , funcID: STR_EMPTY

            /** -------- apps menu data ---------- */
            , apps: {
                menu: '',
                code: '',
                state: {}
            }
        }
        this.state_backup = { ...this.state };

        this.isGroupBlock = isGroupBlock;

        /** string 데이터 */
        this.blockName = STR_EMPTY;
        this.codeLine = STR_EMPTY;

        /** boolean 데이터 */
        this.isClicked = false;
        this.isCtrlPressed = false;
        this.isNowMoved = false;

        this.isIfElse = false;
        this.isFinally = false;

        /** number(숫자) 데이터 */
        this.opacity = 1;
        this.depth = 0;
        this.blockLeftShadowHeight = 0;
        this.blockNumber = 0;
        this.width = blockContainerThis.getBlockMaxWidth();

        /** this 블럭만이 가지는 특수 데이터 
         *  이 데이터들은 이동하거나 삭제 할 때 등 여러 용도로 사용 된다.
         */
        this.type = type; // this 블럭의 타입 값 (type은 class : 1, def: 2, if: 3 ...)
        this.childBlockUUIDList = []; // vpnote 저장용 데이터
        this.uuid = 'u' + vpCommon.getUUID(); // this 블럭의 고유 값
        this.direction = BLOCK_DIRECTION.NONE; // this 블럭의 위치 값. 
                                               // 위치는 this 블럭의 부모로 부터 DOWN, INDENT인지 결정됨
                                               

        /** this 데이터 */
        this.blockContainerThis = blockContainerThis;

        /** -------- 블럭을 표현하는 dom 데이터 ------------------------------- */
        this.blockMainDom = null;
        this.blockOptionPageDom = null;

        /** -------- this 블럭을 중심으로 위치에 따른 block 데이터 ------------*/
        this.prevBlock = null; // this 블럭의 부모 블럭
        this.childBlock_down = null; // this 블럭의 자식 블럭 (DOWN 위치)
        this.childBlock_indent = null; // this 블럭의 자식 블럭 (INDENT 위치)
        this.childBlockList = []; // this 블럭의 자식 블럭 list

        /** -------- this 블럭을 중심으로 특수 타입의 block 데이터 ---------*/
        this.ifElseBlock = null;  // if, for, try 블럭만 가질 수 있음
        this.finallyBlock = null; // try 블럭만 가질 수 있음
        this.lastElifBlock = null; // if 블럭만 가질 수 있음
        this.lastChildBlock = null; // 블럭마다 클릭하면 고유 영역(this 블럭을 중심으로 자식 블럭 리스트)이 존재. 
                                    // 이 고유지역 중 가장 아래의 자식 블럭을 의미
        this.propertyBlockFromDef = null; // def블럭만 가질 수 있음. def 블럭에서 decoration 블럭을 생성할 때의 decoration 블럭을 의미

        /** ------- api list 블럭과 text 블럭만 가질 수 있는 데이터 ------------ */
        this.optionPageLoadCallback = null;
        this.loadOption = null;
        this.importPakage = null;

        /** -------- node 블럭만 가질 수 있는 데이터  --------------------------------------*/
        this.isNodeBlockInput = false;
        this.isNodeBlockToggled = false;
        this.isNodeBlockTitleEmpty = true;

        var name = MapTypeToName(type);
        this.setBlockName(name);

        /** vpnote를 open하고 블럭을 생성할 때 */
        if (blockData) {
            this.state = blockData.blockOptionState;
            this.uuid = blockData.UUID;
        /** Logic의 Define, Control, Execute을 드래그해서 블럭을 생성할 때 */
        } else {
            this.blockContainerThis.createBlock_fromLogic(this);
        }

        // if (!temporary) {
        //     this.blockContainerThis.addBlock(this);
    
        //     this.init();
        //     this.renderColor_thisBlockArea(true);
        // }
    }

    Block.prototype.init = function() {
        var blockContainerThis = this.getBlockContainerThis();
        /** 기본 블럭의 dom 생성 */
        var blockMainDom = blockContainerThis.makeBlockDom(this, true);
        this.setBlockMainDom(blockMainDom);

        /** node 블럭과 text 블럭일 경우의 만 LineNumberInfo Dom 생성 */
        var blockType = this.getBlockType();
        if ( blockType == BLOCK_CODELINE_TYPE.NODE 
             || blockType == BLOCK_CODELINE_TYPE.TEXT
             || this.isGroupBlock) {
            blockMainDom = blockContainerThis.makeBlockLineNumberInfoDom(this);
        }

        this.bindEventAll();
    }

    Block.prototype.apply = function() {
        var blockContainerThis = this.blockContainerThis;
        blockContainerThis.addBlock(this);

        this.init();
        this.renderColor_thisBlockArea(true);

        this.getChildBlockList().forEach(childBlock => {
            childBlock.apply();
        });
    }

    Block.prototype.saveState = function() {
        if (this.getBlockType() == BLOCK_CODELINE_TYPE.API
            || this.getBlockType() == BLOCK_CODELINE_TYPE.TEXT ) {
            // set metadata
            var importPackage = this.getImportPakage();
            
            // get generatedCode and save as metadata
            if (importPackage) {
                var code = importPackage.generateCode(false, false);
                importPackage.metaGenerate();
                // importPackage.metadata.code = code;
                importPackage['metadata'] = {
                    ...importPackage['metadata'],
                    code : code
                }
                this.state.metadata = importPackage.metadata;
            }
        }
        // save backup
        this.state_backup = {
            ...this.state
        };
        
        this.isModified = false;
    }

    Block.prototype.loadState = function() {
        this.state = {
            ...this.state_backup
        };
        // this.renderOptionPage(true); // Library 페이지는 로드가 늦게 되어서...
        this.isModified = false;
    }

    /** 블럭에 표시할 데이터를 dom에 write함
     * @param {string} textInfo 블럭의 text에 입력할 text string
     */
    Block.prototype.writeCode = function(textInfo) {
        var blockType = this.getBlockType();
        var blockUUID = this.getUUID();

        /** node 블럭일 경우 */
        if (this.getBlockType() == BLOCK_CODELINE_TYPE.NODE) {
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_NODEBLOCK_TEXT + blockUUID).html(textInfo);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_NODEBLOCK_INPUT + blockUUID).val(textInfo);
        /** CODE 블럭일 경우 */
        } else if ( IsCodeBlockType(blockType) == true ) {
            var codeStr = ShowCodeBlockCode(this);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + blockUUID).html(codeStr);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + blockUUID).attr('title', codeStr);
        /** node 블럭이 아닐 경우, CODE 블럭이 아닐 경우 */
        } else {
            if ( blockType == BLOCK_CODELINE_TYPE.CLASS) {
                $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + 'class-name-' + blockUUID).html(this.getState('className'));
            } 
            if ( blockType == BLOCK_CODELINE_TYPE.DEF) {
                $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + 'def-name-' + blockUUID).html(this.getState('defName'));      
            }
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + blockUUID).html(textInfo);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BLOCK_HEADER + blockUUID).attr('title', textInfo);
        }
    }



    // ** --------------------------- Block을 삭제, 수정, 불러오기 혹은 주변 block과의 관계를 규정하는 메소드들 --------------------------- */

    Block.prototype.isGroupBlock = function() {
        return this.isGroupBlock;
    }
    
    Block.prototype.setGroupBlock = function(isGroupBlock) {
        // if same state, do nothing
        if (this.isGroupBlock == isGroupBlock) {
            return;
        }
        // set groupblock
        this.isGroupBlock = isGroupBlock;
        // 1) remove group state
        if (!isGroupBlock) {
            this.blockContainerThis.removeNodeBlock(this);
            $(this.blockMainDom).find(VP_CLASS_PREFIX + VP_CLASS_BLOCK_NUM_INFO).css('display','none');
            $(this.blockMainDom).css(STR_MARGIN_TOP, 0);
        }
        // 2) add group state 
        else {
            this.blockContainerThis.addNodeBlock(this);
            if ($(this.blockMainDom).find(VP_CLASS_PREFIX + VP_CLASS_BLOCK_NUM_INFO).length <= 0) {
                this.blockContainerThis.makeBlockLineNumberInfoDom(this);
            }
            $(this.blockMainDom).find(VP_CLASS_PREFIX + VP_CLASS_BLOCK_NUM_INFO).css('display','block');
            $(this.blockMainDom).css(STR_MARGIN_TOP, NUM_NODE_OR_TEXT_BLOCK_MARGIN_TOP_PX);
        }
    }

    Block.prototype.getPrevBlock = function() {
        return this.prevBlock
    }
    Block.prototype.setPrevBlock = function(prevBlock) {
        this.prevBlock = prevBlock;
    }
    Block.prototype.addChildBlockList = function(nextBlock) {
        this.childBlockList = [ ...this.childBlockList, nextBlock]
    }
    Block.prototype.setChildBlockList = function(childBlockList) {
        this.childBlockList = childBlockList;
    }
    Block.prototype.getChildBlockList = function() {
        return this.childBlockList;
    }

    /** this 블럭의 자식 블럭 중에 DOWN 위치에 존재하는 블럭을 가져옴 */
    Block.prototype.getChildBlock_down = function() {
        var childBlock_down = null;
        var childBlockList = this.getChildBlockList();
        childBlockList.some(block => {
            if ( block.getDirection() == BLOCK_DIRECTION.DOWN) {
                childBlock_down = block;
                return true;
            }
        });
        return childBlock_down;
    }

    /** this 블럭의 자식 블럭 중에 INDENT 위치에 존재하는 블럭을 가져옴 */
    Block.prototype.getChildBlock_indent = function() {
        var childBlock_indent = null;
        var childBlockList = this.getChildBlockList();
        childBlockList.some(block => {
            if ( block.getDirection() == BLOCK_DIRECTION.INDENT) {
                childBlock_indent = block;
                return true;
            }
        });
        return childBlock_indent;
    }

    /** this 블럭의 자식 블럭(DOWN or INDENT 2개 까지 존재할 수 있음) 중에 
     *  인자로 들어온 deletedBlock과 일치하면 삭제 
     */
    Block.prototype.deleteChildBlock = function(deletedBlock) {
        var childBlockList = this.getChildBlockList();
        childBlockList.some((block, index) => {
            if (block.getUUID() == deletedBlock.getUUID()) {
                childBlockList.splice(index, 1);
            }
        });
    }

    Block.prototype.setPropertyBlockFromDef = function(propertyBlockFromDef) {
        this.propertyBlockFromDef = propertyBlockFromDef;
    }
    Block.prototype.getPropertyBlockFromDef = function() {
        return this.propertyBlockFromDef;
    }
    /**
     * if 블럭이 생성한 elifList 중에 가장 아래에 위치한 elif block을 set, get
     * @param {BLOCK} lastElifBlock 
     */
    Block.prototype.setLastElifBlock = function(lastElifBlock) {
        this.lastElifBlock = lastElifBlock;
    }
    Block.prototype.getLastElifBlock = function() {
        if (this.lastElifBlock) {
            return this.lastElifBlock;
        } else {
            return this;
        }
    }

    Block.prototype.getElseBlock = function() {
        return this.ifElseBlock;
    }
    Block.prototype.setElseBlock = function(ifElseBlock) {
        this.ifElseBlock = ifElseBlock;
    }
    
    /**
     * ---------------thisBlockArea는 블럭을 클릭했을 때 진하게 색칠되는 영역을 말함--------------
     * ---------------lastBlock_from_thisBlockArea은 thisBlockArea 영역의 맨 마지막 블럭을 의미함-----
     */
    /**
     * @param { Block } lastChildBlock 
     */
    Block.prototype.setLastBlock_from_thisBlockArea = function(lastChildBlock) {
        this.lastChildBlock = lastChildBlock;
    }
    Block.prototype.getLastBlock_from_thisBlockArea = function() {
        this.getBlockList_thisBlockArea();
        return this.lastChildBlock;
    }

    /** 현재 root 블럭부터 모든 자식 블럭리스트 들을 board에 놓인 순서대로 전부 가져온다 */
    Block.prototype.getRootToChildBlockList = function() {
        var blockContainerThis = this.getBlockContainerThis();
        var rootBlock = blockContainerThis.getRootBlock();
        return rootBlock.getThisToLastBlockList();
    }

    /** 현재 this 블럭부터 모든 자식 블럭리스트 들을 board에 놓인 순서대로 가져온다
     */
    Block.prototype.getThisToLastBlockList = function() {
        var childBlockList = this.getChildBlockList();
        var stack = [];
        stack.push(childBlockList);

        var thisToLastBlockList = [this];
        thisToLastBlockList = this._getThisToLastBlockList(thisToLastBlockList, stack);
        return thisToLastBlockList;
    }

    /**
     * @private
     * @param {Array<Block>} childBlockList 
     * @param {Array<Block>} stack 
     * @param {boolean} isNodeBlock node 블럭의 자식 블럭을 가져오냐 아니냐 true/false
     * @param {boolean} isIfForTryBlock if, for, try 블럭의 자식 블럭을 가져오냐 아니냐 true/false
     * @param {Block} ifForTryBlock if, for, try 블럭
     */
    Block.prototype._getThisToLastBlockList = function(thisToLastBlockList, stack, isNodeBlock = false, isIfForTryBlock = false, ifForTryBlock) {

        // console.log('isNodeBlock',isNodeBlock);
        if (isIfForTryBlock == true) {
            var _childBlockList = this.getChildBlockList();
            stack.push(_childBlockList);
        }

        var iteration = 0;
        var current;
        while (stack.length != 0) {
            current = stack.shift();
            /** FIXME: 무한루프 체크 */
            if (iteration > NUM_MAX_ITERATION) {
                console.log(ERROR_AB0002_INFINITE_LOOP);
                break;
            }
            iteration++;

            /** 배열 일 때 */
            if (Array.isArray(current)) {
                var currBlockList = current;
                stack = SetChildBlockList_down_first_indent_last(stack, currBlockList);
            /** 배열 이 아닐 때 */
            } else {
                var currBlock = current;
                var blockType = currBlock.getBlockType();
                var blockDirection = currBlock.getDirection();
                if (isNodeBlock == true) {
                    if ( (
                            IsNodeTextBlockType(currBlock.getBlockType()) == true
                            || currBlock.isGroupBlock
                        )
                        && currBlock.getUUID() != this.getUUID()) {
                        break;
                    }
                    this.setLastBlock_from_thisBlockArea(currBlock);
                    thisToLastBlockList.push(currBlock);
                } else if (isIfForTryBlock == true) {
                    if ( blockDirection == BLOCK_DIRECTION.DOWN ) {
                        if (IsIfForTryBlockType(blockType) == true) {
                            break;
        
                        } else if (IsElifElseExceptFinallyBlockType(blockType) == true) {
                            var lastChildBlock = currBlock.getChildBlock_down();
                            if (lastChildBlock) {
                                thisToLastBlockList.push(lastChildBlock);
                                ifForTryBlock.setLastBlock_from_thisBlockArea(lastChildBlock);
                            }
                        
                            var elifOrElseExceptFinallyBlockList = currBlock.getBlockList_thisBlockArea();
                            elifOrElseExceptFinallyBlockList.forEach(elifOrElseExceptFinallyBlock => {
                                thisToLastBlockList.push(elifOrElseExceptFinallyBlock);
                            });
                        }
                    }
                } else {
                    thisToLastBlockList.push(currBlock);
                }
                
                var childBlockList = currBlock.getChildBlockList();
                stack.unshift(childBlockList);
            }
        }
        return thisToLastBlockList;
    }
    
    /** 현재 this 블럭부터 하위 depth 자식 블럭리스트(동일 depth 블럭 제거) 들을 전부 가져온다 */
    Block.prototype.getBlockList_thisBlockArea = function() {
        var stack = [];
        var blockList_thisBlockArea  = [];
        var blockType = this.getBlockType();
        if ( blockType == BLOCK_CODELINE_TYPE.NODE || this.isGroupBlock) {
            stack = [this];
            blockList_thisBlockArea = this._getThisToLastBlockList(blockList_thisBlockArea, stack, true);
            return blockList_thisBlockArea;
        } 

        /** this 블럭의 indent 위치에 자식 블럭이 있는지 확인 
         *  this 블럭의 indent 위치에 자식 블럭이 있어야 하위 depth 자식 블럭들을 가져올 수 있다.
        */
        var childBlock_indent = this.getChildBlock_indent();
        if (childBlock_indent) {
            stack.push(childBlock_indent);
        }

        blockList_thisBlockArea = [this];
 
        /** this 블럭의 down 위치에 자식 블럭이 있는지 확인 */
        var lastChildBlock = null;
        if (IsCanHaveIndentBlock(blockType) == true) {
            var childBlock_down = this.getChildBlock_down();
            if (childBlock_down){
                blockList_thisBlockArea.push(childBlock_down);
                lastChildBlock = childBlock_down;
            }
        } else {
            lastChildBlock = this;
        }

        /** if for try 일 경우 */
        if ( IsIfForTryBlockType(blockType) == true
            && lastChildBlock != null) {
            var ifForTryList = lastChildBlock._getThisToLastBlockList([], [], false, true, this);
            blockList_thisBlockArea = this._getThisToLastBlockList(blockList_thisBlockArea, stack);
            if (!this.lastChildBlock) {
                this.setLastBlock_from_thisBlockArea(lastChildBlock);
            }

            ifForTryList.forEach(block => {
                blockList_thisBlockArea.push(block);
            });
      
            return blockList_thisBlockArea;

        /** if for try가 아닐 경우 */
        } else {
            blockList_thisBlockArea = this._getThisToLastBlockList(blockList_thisBlockArea, stack);
            this.setLastBlock_from_thisBlockArea(lastChildBlock);
            return blockList_thisBlockArea;
        }
    }

    Block.prototype.getBlockList_thisBlockArea_noShadowBlock = function() {
        var childBlockList = this.getBlockList_thisBlockArea();
        childBlockList = childBlockList.filter(childBlock => {
            if (childBlock.getBlockType() == BLOCK_CODELINE_TYPE.SHADOW) {
                return false;
            } else {
                return true;
            }
        });
        return childBlockList;
    }

    /** 생성할 블럭이 6뎁스를 초과 할 경우 alert창을 띄워 막음 */
    Block.prototype.alertExceedDepth = function() {
        vpCommon.renderAlertModal(STR_MSG_BLOCK_DEPTH_MUSH_NOT_EXCEED_6);
        var blockContainerThis = this.getBlockContainerThis();
        blockContainerThis.resetOptionPage();
    }

    /** param으로 받아온 block을 this블럭의 자식으로 append. 
     *  블럭을 생성할 때, 혹은 이동할 때 사용되는 메소드
     *  @param {BLOCK} appendedBlock 자식으로 append할 블럭
     *  @param {BLOCK_DIRECTION} direction 자식으로 append할 블럭의 위치 설정
     */
    Block.prototype.appendBlock = function(appendedBlock, direction) {
        var blockContainerThis = this.getBlockContainerThis();
        var thisBlock = this;

        /**
         * depth가 6초과할 경우 alert
         */
        var depth = thisBlock.calculateDepthAndGet();
        if ( (depth >= NUM_EXCEED_DEPTH && direction == BLOCK_DIRECTION.INDENT)
            || depth > NUM_EXCEED_DEPTH) {
            appendedBlock.alertExceedDepth();
            return;
        }

        /** append할 block의 prev 블럭이 this 블럭일 때
         * 이동한 block을 내 위치에 다시 놓을 경우 
         * */
        var prevBlock = appendedBlock.getPrevBlock();
        if ( prevBlock ) {
            if (prevBlock.getUUID() == thisBlock.getUUID()) {
                return;
            }
        }
    
        appendedBlock.reConnectPrevBlock();
        /** appendedBlock이 존재하는 영역의 가장 아래 블럭을 가져옴 */
        var lastChildBlock = appendedBlock.getLastBlock_from_thisBlockArea();

        // 새로 들어온 block의 이전 블럭을 현재 this블럭으로 정함
        appendedBlock.setPrevBlock(thisBlock);

        // 2번째 인자인 direction이 down 일 경우
        if (direction == BLOCK_DIRECTION.DOWN) {
            // console.log('BLOCK_DIRECTION.DOWN', appendedBlock.getDirection());
            var blockType = appendedBlock.getBlockType();
            if (IsElifElseExceptFinallyBlockType(blockType) == false) {
                thisBlock.reConnectLastChildBlock(prevBlock, lastChildBlock, appendedBlock.getDirection());
            } 

            var lastBlock = blockContainerThis.getLastBottomBlock(appendedBlock); 
            var childBlockList = thisBlock.getChildBlockList();
            lastBlock.setChildBlockList(childBlockList);
            childBlockList.forEach(block => {
                block.setPrevBlock(lastBlock);
            });

            thisBlock.setChildBlockList([appendedBlock]);  
        // 2번째 인자인  direction이 indent일 경우
        } else {
            // console.log('BLOCK_DIRECTION.INDENT', appendedBlock.getDirection());
            thisBlock.reConnectLastChildBlock(prevBlock, lastChildBlock, appendedBlock.getDirection());

            var childBlock_indent = thisBlock.getChildBlock_indent();
            if (childBlock_indent) {
                childBlock_indent.setDirection(BLOCK_DIRECTION.DOWN);
                childBlock_indent.setPrevBlock(lastChildBlock);
                lastChildBlock.addChildBlockList(childBlock_indent);
                thisBlock.deleteChildBlock(childBlock_indent);    
            }

            thisBlock.addChildBlockList(appendedBlock);
        }
        appendedBlock.setDirection(direction);
    }

    /**
     * 하위 depth block들을 지운다
     */
    Block.prototype.deleteBlock_childBlockList = function() {
        var blockContainerThis = this.getBlockContainerThis();
        /**
         *  만약 root 블럭일 경우 
         */
        if ( this.getPrevBlock() == null) {
            this.setDirection(BLOCK_DIRECTION.NONE);
            this.removeRootBlock();
        /**
         *  만약 root이 아닌 일반 블럭일 경우 
         */
        } else {
            /** 부모 블럭과 연결 끊음 */
            this.reConnectPrevBlock();

            var prevBlock = this.getPrevBlock();
            var deletedBlockDirection = this.getDirection();
            var lastChildBlock = this.getLastBlock_from_thisBlockArea();
            /** this 블럭이 존재하는 영역의 가장 아래 블럭과의 연결을 끊음*/
            this.reConnectLastChildBlock(prevBlock, lastChildBlock, deletedBlockDirection);
        }
  
        var blockList_thisBlockArea = this.getBlockList_thisBlockArea();
        blockList_thisBlockArea.forEach(block => {
            block.deleteBlockDomAndData();
        });
        
        /** 현재 블럭 리스트가 다 제거되면 (blockList.length == 0)
         *  이전 블럭 리스트도 제거함
         */
        if (blockContainerThis.getBlockList().length == 0) {
            blockContainerThis.setPrevBlockList([]);
        };

        /** 다시 렌더링 */
        blockContainerThis.reRenderAllBlock_asc();
    }
    
    /** this 블럭을 이동하거나 삭제할 때, 
     *  this 블럭과 prev 블럭과의 관계를 끊는 메소드
     */
    Block.prototype.reConnectPrevBlock = function() {
        var prevBlock = this.getPrevBlock();
        var block = this;
        if ( prevBlock ) {
            prevBlock.deleteChildBlock(block);
        }
    }

    /**  this 블럭을 이동하거나 삭제할 때, 
     *   this 블럭과 this 블럭영역의 가장 마지막 블럭(lastChildBlock)의 자식 블럭(down)과의 연결을 끊고,
     *   this 블럭의 prev 블럭과 this 블럭영역의 가장 마지막 블럭(lastChildBlock)의 자식 블럭(down)을 연결 시킴
     */
    Block.prototype.reConnectLastChildBlock = function(prevBlock, lastChildBlock, direction) {
        /** 블럭을 이동 시킬 때와 삭제할 때 childBlock_down가 존재
         *  블럭을 새로 만들 때는 childBlock_down가 존재하지 않는다 x
         */
        if (lastChildBlock) {
            var childBlock_down = lastChildBlock.getChildBlock_down();
            if (childBlock_down) {
                childBlock_down.setDirection(direction);
                childBlock_down.setPrevBlock(prevBlock);
                prevBlock.addChildBlockList(childBlock_down);
                lastChildBlock.deleteChildBlock(childBlock_down);
            }
        }
    }

    /** 
     *  blockContainer의 blockList에서 block 삭제
     */
    Block.prototype.deleteBlockDomAndData = function() {
        /** board에 container dom에서 
         * this 블럭의 dom을 삭제 제거 */
        const blockMainDom = this.getBlockMainDom();
        $(blockMainDom).remove();
        $(blockMainDom).empty();

        /** blockContainer에서 block 데이터 삭제 제거 */
        const blockContainerThis = this.getBlockContainerThis();
        const blockUUID = this.getUUID(); 
        blockContainerThis.deleteBlock(blockUUID);
        blockContainerThis.deleteNodeBlock(blockUUID);
    }

    // ** --------------------------- Block dom 관련 메소드들 --------------------------- */
    /** block dom을 가져옴 */
    Block.prototype.getBlockMainDom = function() {
        return this.blockMainDom;
    }
    /** block dom을 set */
    Block.prototype.setBlockMainDom = function(blockMainDom) {
        this.blockMainDom = blockMainDom;
    }

    /** Block Left Shadow dom을 가져옴 */
    Block.prototype.getBlockLeftShadowDom = function() {
        var blockMainDom = this.getBlockMainDom();
        return $(blockMainDom).find(VP_CLASS_PREFIX + VP_CLASS_BLOCK_LEFT_HOLDER);
    }
    
    /** depth를 표시하는 dom을 가져옴 */
    Block.prototype.getBlockDepthInfoDom = function() {
        var blockMainDom = this.getBlockMainDom();
        return $(blockMainDom).find(VP_CLASS_PREFIX + VP_CLASS_BLOCK_DEPTH_INFO);
    }

    /** LineNumber Info를 표시하는 dom을 가져옴 */
    Block.prototype.getBlockLineNumberInfoDom = function() {
        var blockMainDom = this.getBlockMainDom();
        return $(blockMainDom).find(VP_CLASS_PREFIX + VP_CLASS_BLOCK_NUM_INFO);
    }
 
    /** Block Option Dom을 표시하는 dom */
    Block.prototype.getBlockOptionPageDom = function() {
        return this.blockOptionPageDom; 
    }
    Block.prototype.setBlockOptionPageDom = function(blockOptionPageDom) {
        this.blockOptionPageDom = blockOptionPageDom;
    }

    /** 현재 root 블럭부터 하위 depth 자식 블럭리스트(동일 depth 블럭 제거) 들을 전부 가져오고,
     *  가져온 block들의 정보를 가지고 html dom을 만들어 return 한다.
     *  블럭을 이동할 때 보여지는 dom을 생성
     */
    Block.prototype.makeMovedBlockDom = function() {
        var blockContainerThis = this.getBlockContainerThis();
        var childBlockDomList = [];
        var rootDepth = 0;
        var $_boardPage = blockContainerThis.getBoardPage_$();
        var $_blockNewMainDom = null;

        var blockList_thisBlockArea = this.getBlockList_thisBlockArea();
        var firstBlock = blockList_thisBlockArea[0];
        /** 첫번째 블럭 dom 생성*/
        if (firstBlock) {
            rootDepth = firstBlock.calculateDepthAndGet();
        
            var blockMainDom = blockContainerThis.makeBlockDom(firstBlock, false);
            $_blockNewMainDom = $(blockMainDom);
            $_blockNewMainDom.css(STR_POSITION, STR_ABSOLUTE);
            $_boardPage.append($_blockNewMainDom);
        }

        /** 두번째 이후 블럭 dom 생성 
         *  첫번째 블럭이 node 블럭이고
         *  toggle 된 상태면 두번째 이후 블럭 생성 안함
        */
        if (firstBlock.getBlockType() != BLOCK_CODELINE_TYPE.NODE) {
            blockList_thisBlockArea.forEach((block, index) => {
                if (index == 0) {
                    return;
                } else {
                    var blockMainDom = blockContainerThis.makeBlockDom(block, false);
                    var indentPxNum = block.getIndentNumber() - (rootDepth * NUM_INDENT_DEPTH_PX);
            
                    $(blockMainDom).css(STR_MARGIN_LEFT, indentPxNum);
                    childBlockDomList.push(blockMainDom);
                }
            });
        }

        /** stack dom을 만들고
         *  stack dom에 자식 dom을 넣음
         *  blockNewMainDom은 stack dom을 자식 dom으로 넣음
         */
        var $fragDom = $(document.createDocumentFragment());
        childBlockDomList.forEach(childDom => {
            $fragDom.append(childDom);
        });
    
        var $_moveChildListDom = $(`<div class='vp-block-stack'><div>`);
        $_moveChildListDom.append($fragDom);
        $_blockNewMainDom.append($_moveChildListDom);

        return $_blockNewMainDom;
    }

    /** block main dom의 width, height 값을 가져온다 */
    Block.prototype.getBlockMainDomPosition = function() {
        var blockMainDom = this.getBlockMainDom();
        var clientRect = $(blockMainDom)[0].getBoundingClientRect();
        return clientRect;
    }

    // ** --------------------------- Block 멤버변수의 set, get 관련 메소드들 --------------------------- */
    Block.prototype.setDepth = function(depth) {
        this.depth = depth;
    }
    Block.prototype.getDepth = function() {
        return this.depth;
    }

    Block.prototype.getBlockType = function() {
        return this.type;
    }

    Block.prototype.getBlockName = function() {
        return this.blockName;
    }
    Block.prototype.setBlockName = function(blockName) {
        this.blockName = blockName;
    }

    Block.prototype.getUUID = function() {
        return this.uuid;
    }
    Block.prototype.setUUID = function(uuid) {
        this.uuid = uuid;
    }

    /**
     * @param {ENUM} direction INDENT OR DOWN
     */
    Block.prototype.setDirection = function(direction) {
        this.direction = direction;
    }
    Block.prototype.getDirection = function() {
        return this.direction;
    }

    Block.prototype.getChildBlockUUIDList = function() {
        return this.childBlockUUIDList;
    }
    Block.prototype.setChildBlockUUIDList = function(childBlockUUIDList) {
        this.childBlockUUIDList = childBlockUUIDList;
    }

    Block.prototype.getBlockContainerThis = function() {
        return this.blockContainerThis;
    }

    /** board의 class, def, if, for, try, while 블럭 이동할 때
     *  순간 순간 임시로 변하는 left shadow height
     */
    Block.prototype.getBlockLeftShadowHeight = function() {
        return this.blockLeftShadowHeight;
    }
    Block.prototype.setBlockLeftShadowHeight = function(blockLeftShadowHeight) {
        this.blockLeftShadowHeight = blockLeftShadowHeight;
    }

    // Block.prototype.getIsCtrlPressed = function() {
    //     return this.isCtrlPressed;
    // }
    // Block.prototype.setIsCtrlPressed = function(isCtrlPressed) {
    //     this.isCtrlPressed = isCtrlPressed;
    // }

    Block.prototype.getIsNowMoved = function() {
        return this.isNowMoved;
    }
    Block.prototype.setIsNowMoved = function(isNowMoved) {
        this.isNowMoved = isNowMoved;
    }

    /**
     * 코드를 생성하기위해 IndentString을 가져오는 함수
     * depth 1개 당 TAB 1개
     * @param {number} rootDepth  기본값 0
     */
    Block.prototype.getIndentString = function(rootDepth = 0) {
        var depth = this.getDepth() - rootDepth;
        var indentString = STR_EMPTY;
        while (depth-- != 0) {
            indentString += STR_ONE_INDENT;
        }
        return indentString;
    }

    /**
     * 코드를 생성하기위해 IndentNumber을 가져오는 함수
     * depth 1개 당 NUM_INDENT_DEPTH_PX 1개 증가
     */
    Block.prototype.getIndentNumber = function() {
        var depth = this.getDepth();
        var indentPxNum = 0;
        while (depth-- != 0) {
            indentPxNum += NUM_INDENT_DEPTH_PX;
        }
        return indentPxNum;
    }

    /** node 블럭 toggle */
    Block.prototype.getIsNodeBlockToggled = function() {
        return this.isNodeBlockToggled;
    }
    Block.prototype.setIsNodeBlockToggled = function(isNodeBlockToggled) {
        this.isNodeBlockToggled = isNodeBlockToggled;
    }

    /** node 블럭 title empty */
    Block.prototype.getIsNodeBlockTitleEmpty = function() {
        return this.isNodeBlockTitleEmpty;
    }
    Block.prototype.setIsNodeBlockTitleEmpty = function(isNodeBlockTitleEmpty) {
        this.isNodeBlockTitleEmpty = isNodeBlockTitleEmpty;
    }

    Block.prototype.getNowCodeLine = function() {
        var blockType = this.getBlockType();
        var codeLineStr = '';
        if ( blockType == BLOCK_CODELINE_TYPE.CLASS ) {
            codeLineStr = GenerateClassInParamList(this);
        } else if ( blockType == BLOCK_CODELINE_TYPE.DEF ) {
            codeLineStr = GenerateDefCode(this);
        } else if (blockType == BLOCK_CODELINE_TYPE.IF) {
            codeLineStr = GenerateIfCode(this, BLOCK_CODELINE_TYPE.IF);
        } else if (blockType == BLOCK_CODELINE_TYPE.ELIF) {
            codeLineStr = GenerateIfCode(this, BLOCK_CODELINE_TYPE.ELIF);
        } else if (blockType == BLOCK_CODELINE_TYPE.FOR) {
            codeLineStr = GenerateForCode(this);
        } else if (blockType == BLOCK_CODELINE_TYPE.WHILE) {
            codeLineStr = GenerateWhileCode(this);
        } else if (blockType == BLOCK_CODELINE_TYPE.EXCEPT) {
            codeLineStr = GenerateExceptCode(this);
        } else if (blockType == BLOCK_CODELINE_TYPE.RETURN) {
            codeLineStr = GenerateReturnCode(this);
        } else if (blockType == BLOCK_CODELINE_TYPE.LAMBDA) {
            codeLineStr = GenerateLambdaCode(this);
        } else if (blockType == BLOCK_CODELINE_TYPE.IMPORT) {
            codeLineStr = ShowImportListAtBlock(this);
        } else if (blockType == BLOCK_CODELINE_TYPE.BREAK  
                    || blockType == BLOCK_CODELINE_TYPE.CONTINUE  
                    || blockType == BLOCK_CODELINE_TYPE.PASS 
                    || blockType == BLOCK_CODELINE_TYPE.CODE  
                    || blockType == BLOCK_CODELINE_TYPE.COMMENT 
                    || blockType == BLOCK_CODELINE_TYPE.PRINT
                    || blockType == BLOCK_CODELINE_TYPE.PROPERTY
                    || blockType == BLOCK_CODELINE_TYPE.TEXT
                    || blockType == BLOCK_CODELINE_TYPE.API
                    || blockType == BLOCK_CODELINE_TYPE.APPS
                    || blockType == BLOCK_CODELINE_TYPE.NODE ) {
            codeLineStr = this.getState(STATE_codeLine);
        } 
        return codeLineStr;
    }

    /** code를 생성하는 메소드 
     * @param {string} indentString
     * @param {boolean} isRun
    */
    Block.prototype.setCodeLineAndGet = function(indentString = STR_EMPTY, isRun = false) {
        var thisBlock = this;
        var codeLine = indentString;
        var blockName = this.getBlockName();
        var type = thisBlock.getBlockType();
        switch (type) {
            case BLOCK_CODELINE_TYPE.NODE: {
                if (thisBlock.getIsNodeBlockTitleEmpty() == true) {
                    codeLine += `# [Visual Python] Node ${thisBlock.getBlockNumber()}`;
                } else {
                    codeLine += `# [Visual Python] Node ${thisBlock.getBlockNumber()} : ${thisBlock.getState(STATE_codeLine)}`;
                }
                break;
            }
            case BLOCK_CODELINE_TYPE.TEXT: 
            case BLOCK_CODELINE_TYPE.API: {
                // console.log('isRun',isRun);
                vpCommon.setIsAPIListRunCode(isRun);

                /** API List Pakage가 없을 때 */
                if (!thisBlock.getImportPakage()) {
                    // 없으면 기존 metadata의 code로 처리
                    codeLine += GenerateApiCode(thisBlock);
                } else {
                    var apiListPackage = thisBlock.getImportPakage();
                    var generatedCode = apiListPackage.generateCode(false, false);
                    var apicode = '';
                    /** API List 에서 generatedCode가 없을 때 */
                    if (!generatedCode) {
                        generatedCode = '';
                    } else {
                        apicode = MapNewLineStrToIndentString( generatedCode, 
                                                               indentString);
                    }
     
                    apiListPackage.metaSave();   
                    apiListPackage.metaGenerate(); 
    
                    /** API List 에서 BREAK_RUN을 리턴할 때 */
                    if (apicode.indexOf('BREAK_RUN') != -1) {
                        return 'BREAK_RUN';
                    } else {
                        codeLine += apicode;
                    }
                }

                break;
            }
            case BLOCK_CODELINE_TYPE.APPS: {
                codeLine += thisBlock.getState(STATE_codeLine);
                break;
            }
            //class
            case BLOCK_CODELINE_TYPE.CLASS: {
                codeLine += `${blockName.toLowerCase()}`;
                codeLine += STR_ONE_SPACE;
                codeLine += thisBlock.getState(STATE_className);
                codeLine += GenerateClassInParamList(thisBlock);

                break;
            }
            //def
            case BLOCK_CODELINE_TYPE.DEF: {
                codeLine += `${blockName.toLowerCase()}`;
                codeLine += STR_ONE_SPACE;
                codeLine += thisBlock.getState(STATE_defName);
                codeLine += GenerateDefCode(thisBlock);
            
                break;
            }
            //if
            case BLOCK_CODELINE_TYPE.IF: {
                codeLine += `${blockName.toLowerCase()}`;
                codeLine += STR_ONE_SPACE;
                codeLine += GenerateIfCode(thisBlock, BLOCK_CODELINE_TYPE.IF);
                codeLine += `:`;
                break;
            }
            //for
            case BLOCK_CODELINE_TYPE.FOR: {
                codeLine += `${blockName.toLowerCase()}`;
                codeLine += STR_ONE_SPACE;
                codeLine += GenerateForCode(thisBlock);
                codeLine += `:`;
                break;
            }
            //while
            case BLOCK_CODELINE_TYPE.WHILE: {
                codeLine += `${blockName.toLowerCase()}`;
                codeLine += STR_ONE_SPACE;
                codeLine +=  GenerateWhileCode(thisBlock);
                codeLine += `:`;
                break;
            }
            /** import */
            case BLOCK_CODELINE_TYPE.IMPORT: {
                codeLine += GenerateImportCode(thisBlock, indentString);
                break;
            }
            /** try */
            case BLOCK_CODELINE_TYPE.TRY: {
                codeLine += `${blockName.toLowerCase()}:`;
                break;
            }
            /** return */
            case BLOCK_CODELINE_TYPE.RETURN: {
                codeLine += `${blockName.toLowerCase()} `;
                codeLine += GenerateReturnCode(thisBlock);

                break;
            }

            /** break */
            case BLOCK_CODELINE_TYPE.BREAK: {
                codeLine += MapNewLineStrToIndentString(thisBlock.getState(STATE_codeLine), indentString);
                break;
            }
            /** continue */
            case BLOCK_CODELINE_TYPE.CONTINUE: {
                codeLine += MapNewLineStrToIndentString(thisBlock.getState(STATE_codeLine), indentString);
                break;
            }
            /** pass */
            case BLOCK_CODELINE_TYPE.PASS: {
                codeLine += MapNewLineStrToIndentString(thisBlock.getState(STATE_codeLine), indentString);
                break;
            }
   
            /** elif */
            case BLOCK_CODELINE_TYPE.ELIF: {
                codeLine += `${blockName.toLowerCase()}`;
                codeLine += STR_ONE_SPACE;
                codeLine += GenerateIfCode(thisBlock,  BLOCK_CODELINE_TYPE.ELIF);
                codeLine += `:`;
                break;
            }
            /** else */
            case BLOCK_CODELINE_TYPE.ELSE: {
                codeLine += `${blockName.toLowerCase()}:`;
                break;
            }
            /** for else */
            case BLOCK_CODELINE_TYPE.FOR_ELSE: {
                codeLine += `${blockName.toLowerCase()}:`;
                break;
            }
            /** except */
            case BLOCK_CODELINE_TYPE.EXCEPT: {
                codeLine += `${blockName.toLowerCase()}`;
                codeLine += STR_ONE_SPACE;
                codeLine += GenerateExceptCode(thisBlock);
                codeLine += `:`;
                break;
            }
            /** finally */
            case BLOCK_CODELINE_TYPE.FINALLY: {
                codeLine += `${blockName.toLowerCase()}:`;
                break;
            }
            /** code */
            case BLOCK_CODELINE_TYPE.CODE: {
                codeLine += MapNewLineStrToIndentString(thisBlock.getState(STATE_codeLine), indentString);
                break;
            }
            case BLOCK_CODELINE_TYPE.PROPERTY: {
                codeLine += '@';
                codeLine += MapNewLineStrToIndentString(thisBlock.getState(STATE_codeLine), indentString);
                break;
            }
            case BLOCK_CODELINE_TYPE.LAMBDA: {
                codeLine += GenerateLambdaCode(thisBlock);
                break;
            }
            case BLOCK_CODELINE_TYPE.COMMENT: {
                codeLine += '#';
                codeLine += thisBlock.getState(STATE_codeLine).replace(/(\r\n\t|\n|\r\t)/gm,"\n#");
                break;
            }
            case BLOCK_CODELINE_TYPE.PRINT: {
                codeLine += `${blockName.toLowerCase()}`;
                codeLine += `(`;
                codeLine += thisBlock.getState(STATE_codeLine).replace(/(\r\n\t|\n|\r\t)/gm,",");
                codeLine += `)`;
                break;
            }
        }

        this.codeLine = codeLine;
        return codeLine;
    }

    Block.prototype.getCodeLine = function() {
        return this.codeLine;
    }

    /**
     * block의 depth를 계산하고 depth 를 가져오는 함수
     */
    Block.prototype.calculateDepthAndGet = function() {
        var depth = 0;
        var direction = this.getDirection();
        var prevBlock = this;
        while (prevBlock.getPrevBlock() != null) {
            prevBlock = prevBlock.getPrevBlock();
            if (direction == BLOCK_DIRECTION.INDENT
                && prevBlock.getDirection() != BLOCK_DIRECTION.DOWN ) {
                    depth++;
            } else {
                if (prevBlock.getDirection() == BLOCK_DIRECTION.INDENT) {
                    depth++;
                } 
            }
        }
        return depth;
    }

    /**
     * block의 width를 set, get
     */
    Block.prototype.getWidth = function() {
        return this.width;
    }
    Block.prototype.setWidth = function(width) {
        this.width = width;
    }

    Block.prototype.setBlockNumber = function(blockNumber) {
        this.blockNumber = blockNumber;
    }
    Block.prototype.getBlockNumber = function() {
        return this.blockNumber;
    }


    // ** --------------------------- Block render 관련 메소드들 --------------------------- */

    /**
     * @param {ENUM} opacityNum STR_BLOCK or STR_NONE
     *                          STR_BLOCK면 1 STR_NONE면 0
     */
    Block.prototype.renderMovedBlockListOpacity = function(opacityNum) {
        var str = STR_EMPTY;
        if (opacityNum == 0) {
            str = STR_NONE;
        } else {
            str = STR_BLOCK;
        }

        var childBlockList = this.getBlockList_thisBlockArea();
        childBlockList.forEach(block => {
            var blockMainDom = block.getBlockMainDom();
            $(blockMainDom).css(STR_OPACITY, opacityNum);
            $(blockMainDom).css(STR_DISPLAY, str);
        });
    }

    /**
     * @param {boolean} isColor true면, false면
     */
    Block.prototype.renderColor_thisBlockArea = function(isColor) {
        /** block color 색칠 */
        this.renderSelectedBlockBorderColor(isColor);
        this.renderSelectedBlockColor(isColor);
        var blockList = this.getBlockList_thisBlockArea();
        blockList.forEach(block => {
            block.renderSelectedBlockColor(isColor);
        });
    }

    /**
     * block 클릭시 block border 주황색으로 변경
     * @param {boolean} isColor true면 주황색, false면 transparent
     */
    Block.prototype.renderSelectedBlockBorderColor = function(isColor) {
        var blockContainerThis = this.getBlockContainerThis();
        /** 모든 블럭들의 border 컬러 초기화 */
        var blockList = blockContainerThis.getBlockList();
        blockList.forEach(block => {
            if (block.getBlockType() == BLOCK_CODELINE_TYPE.NODE) {
                $(block.getBlockMainDom()).css(STR_BORDER, '0.5px solid #C4C4C4');
            } else {
                $(block.getBlockMainDom()).css(STR_BORDER, '1px solid transparent');
            }
        });

        if (isColor == true) {
            if (this.getBlockType() == BLOCK_CODELINE_TYPE.TEXT) {
                $(this.getBlockMainDom()).css(STR_BORDER_LEFT, '2px solid var(--highlight-color');
            } else {
                $(this.getBlockMainDom()).css(STR_BORDER, '2px solid var(--highlight-color');
            }
        }
    }

    /**
     * block 클릭시 block border 주황.색으로 변경
     * @param {boolean} isReset true면 기본 컬러, false면 색칠된 컬러
     */
    Block.prototype.renderSelectedBlockColor = function(isReset) {
        var blockMainDom = this.getBlockMainDom();
        var blockType = this.getBlockType();
        if (blockType == BLOCK_CODELINE_TYPE.SHADOW ) {
            return;
        } 
        
        if (isReset == true) {
            $(blockMainDom).css(STR_DISPLAY, STR_FLEX);
        }
        /** class & def 블럭 */
        if ( IsDefineBlockType(blockType) == true) {
            if (isReset == true) {
                $(blockMainDom).css(STR_BACKGROUND_COLOR, COLOR_CLASS_DEF_STRONG);
            } else {
                $(blockMainDom).css(STR_BACKGROUND_COLOR, COLOR_CLASS_DEF);
            }

        } else if ( blockType == BLOCK_CODELINE_TYPE.IF 
                    || blockType == BLOCK_CODELINE_TYPE.FOR
                    || blockType == BLOCK_CODELINE_TYPE.WHILE 
                    || blockType == BLOCK_CODELINE_TYPE.TRY
                    || blockType == BLOCK_CODELINE_TYPE.ELSE 
                    || blockType == BLOCK_CODELINE_TYPE.ELIF
                    || blockType == BLOCK_CODELINE_TYPE.FOR_ELSE 
                    || blockType == BLOCK_CODELINE_TYPE.EXCEPT 
                    || blockType == BLOCK_CODELINE_TYPE.FINALLY 
                    || blockType == BLOCK_CODELINE_TYPE.LAMBDA
                    || blockType == BLOCK_CODELINE_TYPE.IMPORT 
                    || blockType == BLOCK_CODELINE_TYPE.PROPERTY
                    || blockType == BLOCK_CODELINE_TYPE.RETURN ) {
            if (isReset == true) {
                $(blockMainDom).css(STR_BACKGROUND_COLOR, COLOR_CONTROL_STRONG);
            } else {
                $(blockMainDom).css(STR_BACKGROUND_COLOR, COLOR_CONTROL);
            }
        } else if (blockType == BLOCK_CODELINE_TYPE.API
                || blockType == BLOCK_CODELINE_TYPE.APPS) {
            if (isReset == true) {
                $(blockMainDom).css(STR_BACKGROUND_COLOR, COLOR_API_STRONG);
            } else {
                $(blockMainDom).css(STR_BACKGROUND_COLOR, COLOR_API);
            }
        } else if (blockType == BLOCK_CODELINE_TYPE.TEXT ) {
            $(blockMainDom).css(STR_BACKGROUND_COLOR, STR_TRANSPARENT);
        } else if (blockType == BLOCK_CODELINE_TYPE.NODE) {

        } else {
            if (isReset == true) {
                $(blockMainDom).css(STR_BACKGROUND_COLOR, COLOR_CODE_STRONG);
            } else {
                $(blockMainDom).css(STR_BACKGROUND_COLOR, COLOR_CODE);
            }
        } 
    }


    /** block shadow를 보여주거나 감추는 메소드  */
    Block.prototype.renderBlockShadow = function(NONE_OR_BLOCK) {
        var blockType = this.getBlockType();

        /** 아래 shadow */
        if ( IsCanHaveIndentBlock(blockType) == true ) {
            var childBlock_down = this.getChildBlock_down();
            var blockMainDom = childBlock_down.getBlockMainDom();
            $( blockMainDom ).css(STR_DISPLAY, NONE_OR_BLOCK);
        }

        /** 왼쪽 shadow */
        var blockLeftHolderDom = this.getBlockLeftShadowDom();
        $(blockLeftHolderDom).css(STR_DISPLAY, NONE_OR_BLOCK);
    }

    /**
     * Block Left Holder dom의 height 계산
     */
    Block.prototype.renderBlockLeftShadowHeight = function() {
        var leftHolderClientRect = $(this.getBlockLeftShadowDom())[0].getBoundingClientRect();
        var blockType = this.getBlockType();
        if ( IsCanHaveIndentBlock(blockType) == true) {
            var childBlock_down = this.getChildBlock_down();
            var blockMainDom = childBlock_down.getBlockMainDom();
            var childBlock_downBlockClientRect = $(blockMainDom)[0].getBoundingClientRect();
 
            var distance = childBlock_downBlockClientRect.y - leftHolderClientRect.y;
            $(this.getBlockLeftShadowDom()).css(STR_HEIGHT, distance);
            this.setBlockLeftShadowHeight(distance);
        }
    }

    /**
     * node 블럭의 input 상태를 변경하는 메소드
     * block이면 input 태그 형식 -> node 블럭의 이름을 변경할 수 있는 상태
     * none이면 일반 형식
     * @param {string ENUM} STR_BLOCK_OR_NONE block or none 
     */
    Block.prototype.renderNodeBlockInput = function(STR_BLOCK_OR_NONE) {
        var blockUUID = this.getUUID();
        if (STR_BLOCK_OR_NONE == STR_BLOCK) {
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_NODEBLOCK_INPUT + blockUUID).css(STR_DISPLAY, STR_BLOCK);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_NODEBLOCK_TEXT_CONTAINER + blockUUID).css(STR_DISPLAY, STR_NONE);
        } else {
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_NODEBLOCK_INPUT + blockUUID).css(STR_DISPLAY, STR_NONE);
            $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_NODEBLOCK_TEXT_CONTAINER + blockUUID).css(STR_DISPLAY, STR_BLOCK);
        }
    }

    /** node 블럭을 렌더링할 때
     *  text 영역과 blank 영역 구분해서 width를 계산하고 렌더링
     * 
     *  ex) text 영역에 Node라고 쓰여있으면,
     *      4글자 써있으므로 4 x 8 = 32px로 계산해 text 영역의 width를 계산하고 나머지 blank 영역을 계산
     * @option
     * @param {number} blockMaxWidth resize할 때만 인자로 받는다
     */
    Block.prototype.renderNodeBlockWidth = function(blockMaxWidth) {
        var codeStr = this.getState(STATE_codeLine);
        var codeStrLength = codeStr.length;
        var nodeBlockTextWidth = 0;
        while(codeStrLength-- != 0) {
            nodeBlockTextWidth += 8;
        }
     
        var blockMainDom = this.getBlockMainDom();
        var nodeBlockBlankWidth = 0;
        /** visual python 전체 혹은 option을 resize 할 때만 */
        if (blockMaxWidth) {
            if (nodeBlockTextWidth > (blockMaxWidth * 0.70)) {
                $(blockMainDom).find(VP_CLASS_PREFIX + 'vp-apiblock-nodeblock-text-container').css('overflow', 'hidden');
            } else {
                $(blockMainDom).find(VP_CLASS_PREFIX + 'vp-apiblock-nodeblock-text-container').css('overflow', 'visible');
            }
            nodeBlockBlankWidth = blockMaxWidth - nodeBlockTextWidth - 25;
         /** node 블럭을 생성한 경우나
          *  node 블럭의 input 태그에 title 입력하고 enter를 누를 경우
          */
        } else {
            var thisBlockWidth = this.getWidth();

            if (nodeBlockTextWidth > (thisBlockWidth * 0.70)) {
                $(blockMainDom).find(VP_CLASS_PREFIX + 'vp-apiblock-nodeblock-text-container').css('overflow', 'hidden');
            } else {
                $(blockMainDom).find(VP_CLASS_PREFIX + 'vp-apiblock-nodeblock-text-container').css('overflow', 'visible');
            }
            nodeBlockBlankWidth = thisBlockWidth  - nodeBlockTextWidth;
        }

        $(blockMainDom).find(VP_CLASS_PREFIX + 'vp-apiblock-nodeblock-text-blank').css(STR_WIDTH, nodeBlockBlankWidth);
    }
    /**
     * Block Type에 맵핑되는 Option을 Option tab에 렌더링하는 html 함수
     */
    Block.prototype.renderOptionPage = function(resetOptionPage=false) {
        var thisBlock = this;
        var blockContainerThis = this.getBlockContainerThis();
        var optionPageSelector = blockContainerThis.getOptionPageSelector();
        var blockUUID = this.getUUID();
        var blockOptionPageDom = blockContainerThis.getOptionDom(blockUUID);
        var blockType = thisBlock.getBlockType();
        switch(blockType) {
            /** class */
            case BLOCK_CODELINE_TYPE.CLASS: {
                blockOptionPageDom = InitClassBlockOption(thisBlock, optionPageSelector);
                break;
            }
            /** def */
            case BLOCK_CODELINE_TYPE.DEF: {
                blockOptionPageDom = InitDefBlockOption(thisBlock, optionPageSelector);
                break;
            }

            /** if */
            case BLOCK_CODELINE_TYPE.IF: {
                blockOptionPageDom = InitIfBlockOption(thisBlock, optionPageSelector);
                break;
            }
            /** elif */
            case BLOCK_CODELINE_TYPE.ELIF: {
                blockOptionPageDom = InitElifBlockOption(thisBlock, optionPageSelector);
                break;
            }     
            /** else */
            case BLOCK_CODELINE_TYPE.ELSE: {
                blockOptionPageDom = InitNoneOption(thisBlock, optionPageSelector);
                break;
            }    

            /** for */
            case BLOCK_CODELINE_TYPE.FOR: {
                blockOptionPageDom = InitForBlockOption(thisBlock, optionPageSelector);
                break;
            }
            /** while */
            case BLOCK_CODELINE_TYPE.WHILE: {
                blockOptionPageDom = InitWhileBlockOption(thisBlock, optionPageSelector);
                break;
            }

            /** Try */
            case BLOCK_CODELINE_TYPE.TRY: {
                blockOptionPageDom = InitNoneOption(thisBlock, optionPageSelector);
                break;
            }
            /** Except */
            case BLOCK_CODELINE_TYPE.EXCEPT: {
                blockOptionPageDom = InitExceptBlockOption(thisBlock, optionPageSelector);
                break;
            }   
                /** Try */
            case BLOCK_CODELINE_TYPE.FINALLY: {
                blockOptionPageDom = InitNoneOption(thisBlock, optionPageSelector);
                break;
            }
            /** Return */
            case BLOCK_CODELINE_TYPE.RETURN : {
                blockOptionPageDom = InitReturnBlockOption(thisBlock, optionPageSelector);
                break;
            }

            /** Code block */
            case BLOCK_CODELINE_TYPE.CODE: {
                blockOptionPageDom = InitCodeBlockOption(thisBlock, optionPageSelector);
                break;
            }

            /** Break block */
            case BLOCK_CODELINE_TYPE.BREAK: {
                blockOptionPageDom = InitCodeBlockOption(thisBlock, optionPageSelector);
                break;
            }
       
            /** Continue block */
            case BLOCK_CODELINE_TYPE.CONTINUE: {
                blockOptionPageDom = InitCodeBlockOption(thisBlock, optionPageSelector);
                break;
            }
          
            /** Property block */
            case BLOCK_CODELINE_TYPE.PROPERTY: {
                blockOptionPageDom = InitCodeBlockOption(thisBlock, optionPageSelector);
                break;
            }
            /** Pass block */
            case BLOCK_CODELINE_TYPE.PASS:  {
                blockOptionPageDom = InitCodeBlockOption(thisBlock, optionPageSelector);
                break;
            }

            /** Lambda block */
            case BLOCK_CODELINE_TYPE.LAMBDA: {
                blockOptionPageDom = InitLambdaBlockOption(thisBlock, optionPageSelector);
                break;
            }
            /** Comment block */
            case BLOCK_CODELINE_TYPE.COMMENT: {
                blockOptionPageDom = InitCodeBlockOption(thisBlock, optionPageSelector);
                break;
            }

            /** Print block */
            case BLOCK_CODELINE_TYPE.PRINT: {
                blockOptionPageDom = InitCodeBlockOption(thisBlock, optionPageSelector);
                break;
            }  

            /** Api block */
            case BLOCK_CODELINE_TYPE.API: {
                InitAPIBlockOption(thisBlock, optionPageSelector, resetOptionPage);
                break;
            }

            /** Import block */
            case BLOCK_CODELINE_TYPE.IMPORT: {
                blockOptionPageDom = InitImportBlockOption(thisBlock, optionPageSelector);
                break;
            }

            /** Node block */
            case BLOCK_CODELINE_TYPE.NODE: {
                blockOptionPageDom = InitNodeBlockOption(thisBlock, optionPageSelector);
                break;
            }

            /** Text block */
            case BLOCK_CODELINE_TYPE.TEXT: {
                blockOptionPageDom = InitTextBlockOption(thisBlock, optionPageSelector);
                break;
            }

            case BLOCK_CODELINE_TYPE.APPS: {
                var menu = thisBlock.state.apps.menu;
                var { file, config } = APPS_CONFIG[menu];
                if (config == undefined) {
                    config = {}
                }
                config = { 
                    ...config, 
                    state: {
                        ...thisBlock.state.apps.state
                    } 
                };

                blockContainerThis.createAppsPage(menu, file, config);
                break;
            }
        }
        
        
        if (blockType == BLOCK_CODELINE_TYPE.API) {
            // set navigation
            blockContainerThis.setNavigator(blockType, thisBlock.state.customCodeLine);
            return;
        } else if (blockType == BLOCK_CODELINE_TYPE.NODE) {
            // set navigation
            blockContainerThis.setNavigator(blockType, thisBlock.state.customCodeLine);
        } else {
            // set navigation
            blockContainerThis.setNavigator(blockType, thisBlock.getBlockName());
        }
        
        blockContainerThis.setOptionDom(blockUUID, blockType, blockOptionPageDom);   
        blockContainerThis.reRenderOptionDomPool(blockOptionPageDom);
    }

    Block.prototype.renderApiOption = function() {
        var thisBlock = this;
        var blockContainerThis = this.getBlockContainerThis();
        var optionPageSelector = blockContainerThis.getOptionPageSelector();
        var blockUUID = this.getUUID();
        var blockOptionPageDom = blockContainerThis.getOptionDom(blockUUID);
        var blockType = thisBlock.getBlockType();

        LoadAPIBlockOption(thisBlock, optionPageSelector);
    }

    Block.prototype.resetOptionPage = function() {
        var blockContainerThis = this.getBlockContainerThis();
        var blockUUID = this.getUUID();
        var blockType = this.getBlockType();
        var optionPageSelector = blockContainerThis.getOptionPageSelector();
        var blockOptionPageDom = InitNoneOption(this, optionPageSelector);
        blockContainerThis.setOptionDom(blockUUID, blockType, blockOptionPageDom);   
        blockContainerThis.reRenderOptionDomPool(blockOptionPageDom);
    }

    // ** --------------------------- Block state 관련 메소드들 --------------------------- */
    Block.prototype.setState = function(newState) {
        this.state = {
            ...this.state
            , ...newState
        }
        // this.setBlockTitle();
    }

    /**특정 state Name 값을 가져오는 함수
        @param {string} stateKeyName
    */
    Block.prototype.getState = function(stateKeyName) {
        return this.state[stateKeyName];
    }

    /** 변경된 codeline state를 html title로 set */
    Block.prototype.setBlockTitle = function() {
        var codeLine = this.setCodeLineAndGet();
        // console.log('codeLine',codeLine);
        var blockMainDom = this.getBlockMainDom();
        $(blockMainDom).attr('title',  codeLine);
    }

    /**
     * block의 left holder의 height를 계산하고 height를 set
     */
    Block.prototype.calculateLeftHolderHeightAndSet = function() {
        var blockHeight = 0;
        // var blockType = this.getBlockType();
        // if ( blockType == BLOCK_CODELINE_TYPE.CLASS 
        //      || blockType == BLOCK_CODELINE_TYPE.DEF) {
        //     blockHeight += NUM_BLOCK_BOTTOM_HOLDER_HEIGHT;
        // }

        var childBlockList = this.getBlockList_thisBlockArea();
        childBlockList.forEach(childBlock => {
            if (childBlock.getBlockType() == BLOCK_CODELINE_TYPE.SHADOW) {
                blockHeight += NUM_BLOCK_BOTTOM_HOLDER_HEIGHT;
            } else {
                blockHeight += NUM_BLOCK_HEIGHT_PX;
            }
        });

        this.setBlockLeftShadowHeight(blockHeight);
    }



















    /** ---------------------------이벤트 함수 바인딩--------------------------- */
    Block.prototype.bindEventAll = function() {
        var blockType = this.getBlockType();
        /** elif else except finally 블럭일 경우 Drag 이동 금지 */
        if ( IsElifElseExceptFinallyBlockType(blockType) == true ) {
            this.bindClickEvent();
            this.bindLineNumberEvent();
        } else if (blockType == BLOCK_CODELINE_TYPE.TEXT) {
        /** text 블럭일 경우 */
            this.bindDragEvent();   // 추가: Text Block Drag 가능하도록
            this.bindClickEvent();
            this.bindLineNumberEvent();
        /** node 블럭일 경우 */
        } else if (blockType == BLOCK_CODELINE_TYPE.NODE) {
            // this.bindClickEvent();
            this.bindDragEvent();
            this.bindNodeBlockClickEvent_text();
            this.bindNodeBlockClickEvent_blank();
            this.bindLineNumberEvent();
        /** group 블럭일 경우 */
        } else if (this.isGroupBlock) {
            this.bindDragEvent();
            this.bindClickEvent();
            this.bindLineNumberEvent();
        /** 그 외 블럭일 경우 */      
        } else {
            this.bindClickEvent();
            this.bindDragEvent();
        }
        this.bindRightClickEvent();
    }
    
    /** node 블럭의 이름을 변경하는 이벤트 함수 bind */
    Block.prototype.bindNodeBlockInputEvent = function() {
        var thisBlock = this;
        var blockUUID = thisBlock.getUUID();

        $(document).off(STR_CHANGE_KEYUP_PASTE,  vpCommon.wrapSelector(vpCommon.formatString(".{0}",VP_CLASS_APIBLOCK_NODEBLOCK_INPUT + blockUUID)));
        $(document).on(STR_CHANGE_KEYUP_PASTE, vpCommon.wrapSelector(vpCommon.formatString(".{0}",VP_CLASS_APIBLOCK_NODEBLOCK_INPUT + blockUUID)), function(event) {
            var inputValue = $(this).val();
            thisBlock.setState({
                [STATE_codeLine]: inputValue
            });
            thisBlock.writeCode(inputValue);
            /** node 블럭 input 태그에 글을 작성하면 IsNodeBlockTitleEmpty은 false
             *  IsNodeBlockTitleEmpty이 false면 node 블럭 주석에 node 블럭 타이틀이 표시 됨
             */
            thisBlock.setIsNodeBlockTitleEmpty(false);
            thisBlock.renderOptionPage();
            thisBlock.renderNodeBlockWidth();
        });
        
        $(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_NODEBLOCK_INPUT + blockUUID).focus();
    }

    /** node 블럭 앞 linenumber에 마우스를 hover했을 때 발생하는 이벤트와
     *  클릭 했을때의 이벤트 함수 bind 
     */
    Block.prototype.bindLineNumberEvent = function() {
        var thisBlock = this;
        var blockLineNumberInfoDom = this.getBlockLineNumberInfoDom();
        /** 아래 off 로직이 기존의 바인딩한 이벤트 함수 제거 */
        $(blockLineNumberInfoDom).off();

        /** node 블럭 hover */
        if (this.getBlockType() == BLOCK_CODELINE_TYPE.NODE || this.isGroupBlock) {
            // hover 시작
            $(blockLineNumberInfoDom).hover(function(event) {
                $(blockLineNumberInfoDom).html(`<div class='vp-apiblock-circle-play'></div>`);
                $(blockLineNumberInfoDom).css(STR_BACKGROUND_COLOR, STR_TRANSPARENT);
                event.preventDefault();
            // hover 해제
            }, function(event) {
                $(blockLineNumberInfoDom).text(thisBlock.getBlockNumber());
                $(blockLineNumberInfoDom).css(STR_BACKGROUND_COLOR, COLOR_LINENUMBER);
                event.preventDefault();
            });
        /** text 블럭 hover */        
        } else if (this.getBlockType() == BLOCK_CODELINE_TYPE.TEXT) {
            // hover 시작
            $(blockLineNumberInfoDom).hover(function(event) {
                $(blockLineNumberInfoDom).find('.vp-apiblock-circle-play').css(STR_OPACITY, 1);
                $(blockLineNumberInfoDom).css(STR_BACKGROUND_COLOR, 'transparent');
                event.preventDefault();
            // hover 해제             
            }, function(event) {
                $(blockLineNumberInfoDom).find('.vp-apiblock-circle-play').css(STR_OPACITY, 0);
                event.preventDefault();
            });
        }

        /** click */
        $(blockLineNumberInfoDom).on(STR_CLICK, function(event) {
            thisBlock.runThisBlock();
            event.preventDefault();
            event.stopPropagation();
        });
    }
    
    /**
     * @async
     * block click시 발생하는 이벤트 메소드 
     */
    Block.prototype.bindClickEvent = function() {

        var thisBlock = this;
        var blockContainerThis = thisBlock.getBlockContainerThis();
        var blockMainDom = thisBlock.getBlockMainDom();
        var blockType = thisBlock.getBlockType();

        /** 아래 off 로직이 기존의 바인딩한 이벤트 함수 제거 */
        $(blockMainDom).off(STR_CLICK);
        $(blockMainDom).single_double_click( function(event){

            /** this블럭이 text 블럭일 경우 */
           if (thisBlock.getBlockType() == BLOCK_CODELINE_TYPE.TEXT) {
                var blockLineNumberInfoDom = thisBlock.getBlockLineNumberInfoDom();
                $('.vp-apiblock-circle-play').css(STR_OPACITY, 0);
                $(blockLineNumberInfoDom).find('.vp-apiblock-circle-play').css(STR_OPACITY, 1);
            }

            
            blockContainerThis.resetBlockListAndRenderThisBlock(thisBlock);
  
            event.stopPropagation();
        }, function () {
            // --------------------------------더블클릭-------------------------------;
            if (blockType != BLOCK_CODELINE_TYPE.TEXT) {
                /** TEXT 블럭은 더블클릭해도 아무런 작용을 하지 않음 */
                thisBlock.runThisBlock();
            } 
        });
    }

    /**
     * block right click - simple menu
     */
    Block.prototype.bindRightClickEvent = function() {
        var thisBlock = this;
        var blockMainDom = thisBlock.getBlockMainDom();

        $(blockMainDom).off(STR_RIGHT_CLICK);
        $(blockMainDom).on(STR_RIGHT_CLICK, function(event) {
            event.preventDefault();
            thisBlock.blockContainerThis.blockMenu.show(thisBlock, event.pageX, event.pageY);
        });
    }

    /**  node 블럭에서 글자가 쓰여진 text영역을 click시 발생하는 이벤트 메소드 */
    Block.prototype.bindNodeBlockClickEvent_text = function() {
        var thisBlock = this;
        var blockContainerThis = thisBlock.getBlockContainerThis();
        var blockMainDom = thisBlock.getBlockMainDom();

        /** 아래 off 로직이 기존의 바인딩한 이벤트 함수 제거 */
        $(blockMainDom).find(VP_CLASS_PREFIX + 'vp-apiblock-nodeblock-text').off(STR_CLICK);
        $(blockMainDom).find(VP_CLASS_PREFIX + 'vp-apiblock-nodeblock-text').single_double_click( function(event){
   //'-----------------------------------클릭--------------------------------------'
            /** 블럭 클릭시 모든 node 블럭의 상태를 일반 상태로 변경 */
            const nodeBlockList = blockContainerThis.getNodeBlockList();
            nodeBlockList.forEach(nodeBlock => {
                nodeBlock.renderNodeBlockInput(STR_NONE);
            });

            var blockList_thisBlockArea = thisBlock.getBlockList_thisBlockArea_noShadowBlock();
            if (thisBlock.getIsNodeBlockToggled() == true) {
                blockList_thisBlockArea.forEach( (block, index) => {
                    $(block.getBlockMainDom()).removeClass('vp-apiblock-style-display-none');
                });
                thisBlock.setIsNodeBlockToggled(false);
            /** thisBlock이 toggle이 되지 않은 node 블럭의 경우 */
            } else {
                blockList_thisBlockArea.forEach( (block, index) => {
                    if (index != 0) {
                        $(block.getBlockMainDom()).addClass('vp-apiblock-style-display-none');
                    }
                });
                thisBlock.setIsNodeBlockToggled(true);
            }

            /** 맨위부터 스크롤바가 얼마나 떨어져있는지 가져오기 */
            var scrollHeight = $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD)).scrollTop();

            /** this블럭이 node 블럭일 경우
            */
            if (thisBlock.getBlockType() == BLOCK_CODELINE_TYPE.NODE) {
                $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD)).animate({
                    scrollTop: scrollHeight 
                }, 100);
            }

            blockContainerThis.reRenderAllBlock();
            blockContainerThis.resetBlockListAndRenderThisBlock(thisBlock);
        }, function () {
            // --------------------------------더블클릭-------------------------------;
            thisBlock.renderNodeBlockInput(STR_BLOCK);
            thisBlock.writeCode(thisBlock.getState(STATE_codeLine));
            thisBlock.bindNodeBlockInputEvent();
            thisBlock.renderColor_thisBlockArea(true);
            blockContainerThis.setSelectBlock(thisBlock);
        });
    }

    /**
     * node 블럭에서 글자가 쓰여지지 않은 blank영역 click시 발생하는 이벤트 메소드 
     */
    Block.prototype.bindNodeBlockClickEvent_blank = function() {
        var thisBlock = this;
        var blockContainerThis = thisBlock.getBlockContainerThis();
        var blockMainDom = thisBlock.getBlockMainDom();

        /** 아래 off 로직이 기존의 바인딩한 이벤트 함수 제거 */
        $(blockMainDom).find(VP_CLASS_PREFIX + 'vp-apiblock-nodeblock-text-blank').off(STR_CLICK);
        $(blockMainDom).find(VP_CLASS_PREFIX + 'vp-apiblock-nodeblock-text-blank').single_double_click( function(event){
            blockContainerThis.resetBlockListAndRenderThisBlock(thisBlock);
        }, function () {
            // --------------------------------더블클릭-------------------------------;
            thisBlock.renderNodeBlockInput(STR_BLOCK);
            thisBlock.writeCode(thisBlock.getState(STATE_codeLine));
            thisBlock.bindNodeBlockInputEvent();
            thisBlock.renderColor_thisBlockArea(true);
            blockContainerThis.setSelectBlock(thisBlock);
        });
    }

    /**
     * block drag시 발생하는 이벤트 메소드 
     */
    Block.prototype.bindDragEvent = function() {
        var thisBlock = this;
        
        var blockContainerThis = this.getBlockContainerThis();
        var blockType = this.getBlockType();
        var blockOldMainDom = this.getBlockMainDom();

        var currCursorX = 0;
        var currCursorY = 0;

        var newPointX = 0;
        var newPointY = 0;
  
        var shadowBlock = null;
        var selectedBlock = null;
        var selectedBlockDirection = null;

        /** 제이쿼리 변수 */
        var $_blockNewMainDom = null;
        var $_blockOldMainDom = $(blockOldMainDom);
        var $_boardPage = blockContainerThis.getBoardPage_$();

        $_blockOldMainDom.draggable({ 
            revert: 'invalid',
            revertDuration: 200,
            containment: VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BOARD,
            cursor: 'move', 
            distance: 10,
            start: (event, ui) => {
            
                /** */
                blockContainerThis.setFocusedPageType(FOCUSED_PAGE_TYPE.BOARD);

                /** 블럭 이동할 때 새로운 dom을 copy 생성
                 *  이 dom이 이동할 때 보여지는 dom
                 *  이동이 끝나면 이 dom은 삭제한다. -> stop에 코드 존재
                 */
                $_blockNewMainDom  = thisBlock.makeMovedBlockDom();

                /** 블럭 이동할 때 기존의 존재하던 하위 Block 들의 dom을 opacity 0 처리해 안보이게 함
                 *  이동이 끝나면 이 dom은 다시 opacity 1로 변경해 되어 보여짐 -> stop에 코드 존재
                 */
                thisBlock.renderMovedBlockListOpacity(0);

                /** 이동하는 하위 Block 들의 isNowMoved true 처리 */
                thisBlock.getBlockList_thisBlockArea().forEach(block => {
                    block.setIsNowMoved(true);
                });

                /** shadow block 생성 */
                shadowBlock = blockContainerThis.createShadowBlock( blockType, thisBlock);

                blockContainerThis.reLoadBlockListLeftHolderHeight();
            },
            drag: async (event, ui) => {
           
                currCursorX = event.clientX; 
                currCursorY = event.clientY; 
    
                var maxWidth =  blockContainerThis.getMaxWidth();
 
                /** 블럭 드래그시 
                *  왼쪽 정렬  
                */
                newPointX = currCursorX - $_boardPage.offset().left;

                var nodeBlockAdd = 0;
                if (thisBlock.getBlockType() == BLOCK_CODELINE_TYPE.NODE
                    || thisBlock.getBlockType() == BLOCK_CODELINE_TYPE.TEXT) {
                    nodeBlockAdd += NUM_NODE_OR_TEXT_BLOCK_MARGIN_TOP_PX;
                } 
                newPointY = currCursorY - ( $_boardPage.offset().top - $_boardPage.scrollTop() ) - nodeBlockAdd;
    
                /** 이동한 블럭들의 루트블럭 x좌표가 editor 화면의 maxWidth 이상 일때 */
                if (newPointX > maxWidth - $_blockNewMainDom.width()) {
                    newPointX = maxWidth - $_blockNewMainDom.width();
                }

                /** 이동한 블럭들의 루트블럭 y좌표가 0 이하 일때 */
                if (newPointY < 0) {
                    newPointY = 0;
                }

                $_blockNewMainDom.css(STR_TOP, newPointY + STR_PX);
                $_blockNewMainDom.css(STR_LEFT, newPointX + STR_PX);

                ({ selectedBlock, selectedBlockDirection} = blockContainerThis.dragBlock(true, thisBlock, shadowBlock, 
                                                                        selectedBlock,selectedBlockDirection,currCursorX, currCursorY));

            }, 
            stop: function(event, ui) { 
                // console.log('stop start');
                // 화면 밖으로 나갔을 때, 재조정
                var maxWidth =  blockContainerThis.getMaxWidth();
                var maxHeight =  blockContainerThis.getMaxHeight();
    
                var isDisappeared = false;
                /** 이동한 블럭들의 루트블럭 x좌표가 0 이하 일때 */
                if (newPointX < 0) {
                    newPointX = 0;
                    isDisappeared = true;
                }

                /** 이동한 블럭들의 루트블럭 x좌표가 editor 화면의 maxWidth 이상 일때 */
                if (newPointX > maxWidth - $_blockOldMainDom.width()) {
                    newPointX = maxWidth - $_blockOldMainDom.width();
                    isDisappeared = true;
                }
 
                /** 이동한 블럭들의 루트블럭 y좌표가 0 이하 일때 */
                if (newPointY < 0) {
                    newPointY = 0;
                    isDisappeared = true;
                }

                var nodeBlockList_asc = blockContainerThis.getNodeBlockList_asc();

                selectedBlock = shadowBlock.getSelectBlock();
                /** 블록이 화면 밖으로 나갈경우, 나간 블럭 전부 삭제 */
                if (isDisappeared == true 
                    && !selectedBlock) {
                    thisBlock.deleteBlock_childBlockList();

                /** 블록이 화면 밖으로 나가지 않고 연결되는 경우 */
                } else {
                    if ( thisBlock.getPrevBlock() == null ) {
                        thisBlock.removeRootBlock();
                    }

                    /** 어떤 블록의 DOWN이나 INDENT로 조립되지 않는 경우 */
                    if (!selectedBlock) {
                        /** 이동한 block이 rootblock일 경우 
                        *  아무것도 안 함
                        */
                        if ( thisBlock.getPrevBlock() == null ) {
                            if (blockContainerThis.getNodeBlockList().length == 1) {
                                console.log('이동한 block이 rootblock일 경우 1');
                                $_blockNewMainDom.remove();
                                thisBlock.renderMovedBlockListOpacity(1);
                                blockContainerThis.resetBlockListAndRenderThisBlock(thisBlock);
                                return;
                            } else {
                                console.log('이동한 block이 rootblock일 경우 2');
                        
                                var nodeBlock_last = nodeBlockList_asc[nodeBlockList_asc.length - 1];
                                var lastBlock = nodeBlock_last.getLastBlock_from_thisBlockArea();
                                selectedBlock = lastBlock;
                                selectedBlock.appendBlock(thisBlock, BLOCK_DIRECTION.DOWN);
                            }
                        } 
                        /** 이동한 block의 prevBlock이 rootblock일 경우 */
                        else if ( thisBlock.getPrevBlock() && 
                            thisBlock.getPrevBlock().getUUID() == blockContainerThis.getRootBlock().getUUID() ) {
                            // console.log('이동한 block이 prevBlock이 rootblock일 경우');
                            selectedBlock = blockContainerThis.getRootToLastBottomBlock();
                            selectedBlock.appendBlock(thisBlock, BLOCK_DIRECTION.DOWN);
                        } 

                        /** 이동한 block이 rootblock이 아닐 경우
                         * 이동한 block의 prevBlock이 rootblock이 아닐 경우 
                         */
                        else {
                            selectedBlock = blockContainerThis.getRootToLastBottomBlock();
                            /** 이동한 Block의 하위 블럭 중에, Board에 놓여 있는 맨 마지막 Block이 포함되어 있는 경우 */
                            thisBlock.getBlockList_thisBlockArea().some(block => {
                                if ( block.getUUID() == selectedBlock.getUUID() ) {
                                    selectedBlock = thisBlock.getPrevBlock();
                                    return true;
                                }
                            });
                
                            selectedBlock.appendBlock(thisBlock, BLOCK_DIRECTION.DOWN);

                            // set group block (except TEXT block)
                            thisBlock.setGroupBlock(thisBlock.getBlockType() != BLOCK_CODELINE_TYPE.TEXT);
                        }
                    } else if (selectedBlock.getBlockType() == BLOCK_CODELINE_TYPE.TEXT) {
                        // selectedBlock이 TEXT 블럭일 경우
                        selectedBlock.appendBlock(thisBlock, BLOCK_DIRECTION.DOWN);

                        // set group block (except TEXT block)
                        thisBlock.setGroupBlock(thisBlock.getBlockType() != BLOCK_CODELINE_TYPE.TEXT);
                    // } else if (selectedBlockDirection == BLOCK_DIRECTION.NONE) {
                    //     /** 특정 그룹블록의 다음 그룹블럭으로 넣을 경우 */
                    //     selectedBlock.appendBlock(thisBlock, BLOCK_DIRECTION.DOWN);
                    //     thisBlock.setGroupBlock(true);
                    }
                    /** 특정 블록의 DOWN이나 INDENT로 조립된 경우 */ 
                    else {
                        // console.log('특정 블록의 DOWN이나 INDENT로 조립된 경우');
                        selectedBlock.appendBlock(thisBlock, selectedBlockDirection);
                        thisBlock.setGroupBlock(false);
                    }
                }

                /** 이동하는 하위 depth Block 들의 opacity 1로 변경 */
                thisBlock.renderMovedBlockListOpacity(1);
                blockContainerThis.stopDragBlock(true, thisBlock); 
                $_blockNewMainDom.remove();
                shadowBlock.deleteShadowBlock();

                
            }
        });
    }












    /**
     * root 블럭이 이동할 때
     */
    Block.prototype.removeRootBlock = function() {
        var lastChildBlock = this.getLastBlock_from_thisBlockArea();
        var childBlockList = lastChildBlock.getChildBlockList();
        lastChildBlock.setChildBlockList([]);
        childBlockList.some(nextBlock => {
            nextBlock.setPrevBlock(null);
            nextBlock.setDirection(BLOCK_DIRECTION.ROOT);
        });
    }

    /**
     * if, for, try 블럭 sub 버튼 생성 메소드
     */
    Block.prototype.createSubButton = function() {
        var thisBlock = this;
        var blockContainerThis = thisBlock.getBlockContainerThis();
        var blockMainDom = thisBlock.getBlockMainDom();
        var blockType = thisBlock.getBlockType();

        var elseOnOffStr = STR_EMPTY;
        if (thisBlock.getState(STATE_isIfElse) == true) {
            elseOnOffStr = 'off';
        } else {
            elseOnOffStr = 'on';
        }

        var finallyOnOffStr = STR_EMPTY;
        if (thisBlock.getState(STATE_isFinally) == true) {
            finallyOnOffStr = 'off';
        } else {
            finallyOnOffStr = 'on';
        }

        /** Sub Button dom 생성 로직 */
        var containerButton = $(`<div class='${VP_CLASS_STYLE_FLEX_ROW_BETWEEN}
                                            ${VP_CLASS_BLOCK_SUB_BTN_CONTAINER}'>
                                </div>`);
        var toggleElseButton = $(`<div class='vp-apiblock-toggle-else-button'> else ${elseOnOffStr} </div>`);

        if ( blockType == BLOCK_CODELINE_TYPE.IF
             || blockType == BLOCK_CODELINE_TYPE.FOR) {                 
            if (blockType == BLOCK_CODELINE_TYPE.IF) {
                var plusElifButton = $(`<div class='vp-apiblock-plus-elif-button'>+ elif</div>'`);
                containerButton.append(plusElifButton);
            }

            containerButton.append(toggleElseButton);
        } else if (blockType == BLOCK_CODELINE_TYPE.TRY) {

            var plusElifButton = $(`<div class='vp-apiblock-plus-elif-button'> + except </div>'`);
            var finallyButton = $(`<div class='vp-apiblock-toggle-else-button'> finally ${finallyOnOffStr} </div>`);

            containerButton.append(plusElifButton);
            containerButton.append(toggleElseButton);
            containerButton.append(finallyButton);
        } 
        $(blockMainDom).append(containerButton);

        /** plus elif 버튼 클릭 */
        $(plusElifButton).click(function(plusElifEvent) {
            var blockType = thisBlock.getBlockType();
            if (blockType == BLOCK_CODELINE_TYPE.IF) {
                blockType = BLOCK_CODELINE_TYPE.ELIF;
            } else {
                blockType = BLOCK_CODELINE_TYPE.EXCEPT;
            }

            var lastElifBlock = thisBlock.getLastElifBlock();
            var lastElifBlock_childBlock_down = lastElifBlock.getChildBlock_down();

            var createdBlock = blockContainerThis.createBlock(blockType);
            createdBlock.apply();
            var elifConditionCode = GenerateIfCode(createdBlock, blockType);
            createdBlock.writeCode(elifConditionCode);

            thisBlock.setLastElifBlock(createdBlock);
            lastElifBlock_childBlock_down.appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);
    
            blockContainerThis.reRenderAllBlock_asc();
        });

        /** else 버튼 클릭 */
        $(toggleElseButton).click(function() {
            bindElseEvent();
        });
        /** finally 버튼 클릭 */
        $(finallyButton).click(function() {
            bindElseEvent(true);
        });

        var bindElseEvent = function(isFinally) {
            var STATE;
            if (isFinally == true) {
                STATE = STATE_isFinally;
            } else {
                STATE = STATE_isIfElse;
            }
            
            /** else가 존재하는 경우 -> else 삭제*/
            if (thisBlock.getState(STATE) == true) {
                var elseBlock = thisBlock.getElseBlock();
                if (elseBlock) {
                    elseBlock.deleteBlock_childBlockList();
                }

                thisBlock.setElseBlock(null);
                thisBlock.setState({
                    [STATE]: false
                });
            /** else가 존재하지 않는 경우 -> else 생성*/
            } else {
                var lastElifBlock;
                var createdBlock;
                if (isFinally == true) {
                    var elseBlock = thisBlock.getElseBlock();
                    if (elseBlock) {
                        lastElifBlock = elseBlock;
                    } else {
                        lastElifBlock = thisBlock.getLastElifBlock();
                    }
                    createdBlock = blockContainerThis.createBlock(BLOCK_CODELINE_TYPE.FINALLY );
                    createdBlock.apply();
                } else {
                    lastElifBlock = thisBlock.getLastElifBlock();
                    createdBlock = blockContainerThis.createBlock(BLOCK_CODELINE_TYPE.ELSE );
                    createdBlock.apply();
                }
                var lastElifBlock_childBlock_down = lastElifBlock.getChildBlock_down();
                lastElifBlock_childBlock_down.appendBlock(createdBlock, BLOCK_DIRECTION.DOWN);

                thisBlock.setElseBlock(createdBlock);
                thisBlock.setState({
                    [STATE]: true
                });
            }
            blockContainerThis.reRenderAllBlock_asc();
        }
    }

    

    /** this Block 부터 코드 실행 */
    Block.prototype.runThisBlock = function(runCell=true) {
        var thisBlock = this;
        var blockContainerThis = thisBlock.getBlockContainerThis();

        /** text 블럭일 경우 */
        if (thisBlock.getBlockType() == BLOCK_CODELINE_TYPE.TEXT) {
            thisBlock.getImportPakage().generateCode(true, true);
            return;
        } 
        var code = '';

        /** text 블럭이 아니면서 node 블럭이 아닐 경우 */
        if  (thisBlock.getBlockType() == BLOCK_CODELINE_TYPE.NODE
            || thisBlock.isGroupBlock) {
            // code = blockContainerThis.findNodeBlock(thisBlock).setCodeLineAndGet();
            code += '# Group ' + thisBlock.getBlockNumber();
            code += STR_KEYWORD_NEW_LINE;
        }
        
        code += blockContainerThis.makeCode(thisBlock);
        /** validation 걸릴 때 */
        if (code.indexOf('BREAK_RUN') != -1) {
            return;
        }
        blockContainerThis.setAPIBlockCode(code);
        blockContainerThis.generateCode(true, runCell);
    }







    /** ------------------------------------------- 이하 메소드는 api list 블럭만 사용하는 메소드 -----------------------------------------------------*/
    Block.prototype.setFuncID = function(funcID) {
        this.state.funcID = funcID;
    }
    Block.prototype.getFuncID = function() {
        return this.state.funcID;
    }

    Block.prototype.setOptionPageLoadCallback = function(optionPageLoadCallback) {
        this.optionPageLoadCallback = optionPageLoadCallback;
    }
    Block.prototype.getOptionPageLoadCallback = function() {
        return this.optionPageLoadCallback;
    }

    Block.prototype.setLoadOption = function(loadOption) {
        this.loadOption = loadOption;
    }
    Block.prototype.getLoadOption = function() {
        return this.loadOption;
    }

    Block.prototype.setImportPakage = function(importPakage) {
        this.importPakage = importPakage;
    }
    Block.prototype.getImportPakage = function() {
        return this.importPakage;
    }


    /** API List Block의 metadata를 vpnote에 저장할 때 실행하는 메소드 */
    Block.prototype.setMetadata = function() {
        var blockUUID = this.getUUID();
        var blockContainerThis = this.getBlockContainerThis();
        var importPakage = this.getImportPakage();
        
        // get generatedCode and save as metadata
        var code = importPakage.generateCode(false, false);
        importPakage.metaGenerate();
        importPakage.metadata.code = code;

        blockContainerThis.removeOptionDom(blockUUID);
        var generatedMetaData = importPakage.metadata;
        var funcID = '';

        /** importPakage.metadata의 ID가 있을 경우 */
        if (generatedMetaData) {
            funcID = generatedMetaData['funcID'];
        /** importPakage.metadata의 ID가 없다면 importPakage.funcID를 가져옴*/
        } else if (importPakage && importPakage.funcID) {
            funcID = importPakage.funcID;
        }
    
        vpContainer.loadOption(funcID, vpContainer.optionPageLoadCallback, generatedMetaData);
        this.state.metadata = generatedMetaData;
    }

    Block.prototype.deleteMetadata = function() {
        this.state.metadata = null;
    }
    Block.prototype.getMetadata = function() {
        return this.state.metadata;
    }

    return {
        Block
    };
});
