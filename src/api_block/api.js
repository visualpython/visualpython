define([
    'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'

    , './constData.js'
], function ( vpCommon, vpConst, sb,
              constData ) {

    const { BLOCK_GROUP_TYPE
            , BLOCK_CODELINE_TYPE
            , BLOCK_DIRECTION
            , IF_BLOCK_CONDITION_TYPE

            , FOR_BLOCK_ARG3_TYPE

            , DEF_BLOCK_ARG6_TYPE

            , STR_GRP_DEFINE
            , STR_GRP_CONTROL
            , STR_GRP_EXECUTE

            , STR_CLASS
            , STR_DEF
            , STR_IF
            , STR_FOR
            , STR_WHILE
            , STR_IMPORT
            , STR_API
            , STR_APPS
            , STR_TRY
            , STR_EXCEPT
            , STR_FINALLY
            , STR_RETURN
            , STR_BREAK
            , STR_CONTINUE
            , STR_PASS
            , STR_PROPERTY
            , STR_CODE
            , STR_LAMBDA
            , STR_COMMENT
            , STR_NODE
            , STR_TEXT
            , STR_PRINT
            , STR_ELIF
            , STR_ELSE
            , STR_FOCUS
            , STR_BLUR
            , STR_INPUT
        
            , STR_EMPTY

            , STR_INPUT_YOUR_CODE
            , STR_TRANSPARENT
            , STR_COLOR
            , STR_BACKGROUND_COLOR
            , STR_KEYWORD_NEW_LINE

            , VP_ID_PREFIX 

            , VP_CLASS_PREFIX 
 
            , VP_BLOCK_BLOCKCODELINETYPE_CODE
            , VP_BLOCK_BLOCKCODELINETYPE_CLASS_DEF
            , VP_BLOCK_BLOCKCODELINETYPE_CONTROL
            , VP_BLOCK_BLOCKCODELINETYPE_API
            , VP_BLOCK_BLOCKCODELINETYPE_TEXT
            , VP_BLOCK_BLOCKCODELINETYPE_NODE
 
            , VP_CLASS_APIBLOCK_BODY 

            , STATE_metadata

            , STATE_parentClassName
            
            , STATE_defInParamList
            , STATE_defReturnType

        
            , STATE_ifConditionList
            , STATE_elifConditionList
 
    
            , STATE_forParam 

 
            , STATE_whileBlockOptionType
            , STATE_whileArgs
            , STATE_whileConditionList

 
            , STATE_baseImportList
            , STATE_customImportList
 
            , STATE_exceptConditionList
 
 
            , STATE_returnOutParamList
 
            , STATE_codeLine
 
            , STATE_lambdaArg1
            , STATE_lambdaArg2List
            , STATE_lambdaArg3
 
            , COLOR_GRAY_input_your_code
            , COLOR_FOCUSED_PAGE
            , COLOR_BLACK   } = constData;

    /** CreateOneArrayValueAndGet
        *  배열의 특정 인덱스 값을 생성하고 새로운 배열을 리턴한다
        *  @param {Array} array 
        *  @param {number} index
        *  @param {number | string} newValue 
        *  @returns {Array} New array
        */
    var CreateOneArrayValueAndGet = function(array, index, newValue) {
        return [ ...array.slice(0, index+1), newValue,
                 ...array.slice(index+1, array.length) ]
    }

    /** UpdateOneArrayValueAndGet
        *  배열의 특정 인덱스 값을 업데이트하고 업데이트된 새로운 배열을 리턴한다
        *  @param {Array} array 
        *  @param {number} index
        *  @param {number | string} newValue 
        *  @returns {Array} New array
        */
    var UpdateOneArrayValueAndGet = function(array, index, newValue) {
        return [ ...array.slice(0, index), newValue,
                 ...array.slice(index+1, array.length) ]
    }

    /** DeleteOneArrayValueAndGet
    *  배열의 특정 인덱스 값을 삭제하고 삭제된 새로운 배열을 리턴한다
    *  @param {Array} array 
    *  @param {number} index 
    *  @returns {Array} New array
    */
    var DeleteOneArrayValueAndGet = function(array, index) {
        return [ ...array.slice(0, index), 
                 ...array.slice(index+1, array.length) ]
    }
    
    /** API Block에서 자체적으로 input을 제어하기 위한 api */
    var ControlToggleInput = function() {
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BODY)).on(STR_FOCUS, STR_INPUT, function() {
            Jupyter.notebook.keyboard_manager.disable();
        });
        $(vpCommon.wrapSelector(VP_CLASS_PREFIX + VP_CLASS_APIBLOCK_BODY)).on(STR_BLUR, STR_INPUT, function() {
            Jupyter.notebook.keyboard_manager.enable();
        });
    }

    /** 그룹 type에 따라 이름을 리턴하는 함수 */
    var MapGroupTypeToName = function(type) {
        var name = '';
        switch (type) {
            case BLOCK_GROUP_TYPE.DEFINE: {
                name = STR_GRP_DEFINE;
                break;
            }
            case BLOCK_GROUP_TYPE.CONTROL: {
                name = STR_GRP_CONTROL;
                break;
            }
            case BLOCK_GROUP_TYPE.EXECUTE: {
                name = STR_GRP_EXECUTE;
                break;
            }
        }
        return name;
    }

    /** 블럭 type에 따른 이름을 리턴하는 함수 */
    var MapTypeToName = function(type) {
        var name = ``;
        switch (type) {
            case BLOCK_CODELINE_TYPE.CLASS: {
                name = STR_CLASS;
                break;
            }
            case BLOCK_CODELINE_TYPE.DEF: {
                name = STR_DEF;
                break;
            }
            case BLOCK_CODELINE_TYPE.IF: {
                name = STR_IF;
                break;
            }
            case BLOCK_CODELINE_TYPE.ELIF: {
                name = STR_ELIF;
                break;
            }
            case BLOCK_CODELINE_TYPE.ELSE: {
                name = STR_ELSE;
                break;
            }
            case BLOCK_CODELINE_TYPE.FOR: {
                name = STR_FOR;
                break;
            }
            case BLOCK_CODELINE_TYPE.FOR_ELSE: {
                name = STR_ELSE;
                break;
            }
            case BLOCK_CODELINE_TYPE.WHILE: {
                name = STR_WHILE;
                break;
            }
            case BLOCK_CODELINE_TYPE.IMPORT: {
                name = STR_IMPORT;
                break;
            }
            case BLOCK_CODELINE_TYPE.API: {
                name = STR_API;
                break;
            }
            case BLOCK_CODELINE_TYPE.APPS: {
                name = STR_APPS;
                break;
            }
            case BLOCK_CODELINE_TYPE.TRY: {
                name = STR_TRY;
                break;
            }
            case BLOCK_CODELINE_TYPE.EXCEPT: {
                name = STR_EXCEPT;
                break;
            }
            case BLOCK_CODELINE_TYPE.FINALLY: {
                name = STR_FINALLY;
                break;
            }
            case BLOCK_CODELINE_TYPE.RETURN: {
                name = STR_RETURN;
                break;
            }
            case BLOCK_CODELINE_TYPE.BREAK: {
                name = STR_BREAK;
                break;
            }
            case BLOCK_CODELINE_TYPE.CONTINUE: {
                name = STR_CONTINUE;
                break;
            }
            case BLOCK_CODELINE_TYPE.PASS: {
                name = STR_PASS;
                break;
            }
            case BLOCK_CODELINE_TYPE.PROPERTY: {
                name = STR_PROPERTY;
                break;
            }
            case BLOCK_CODELINE_TYPE.CODE: {
                name = STR_CODE;
                break;
            }
            case BLOCK_CODELINE_TYPE.LAMBDA: {
                name = STR_LAMBDA;
                break;
            }
            case BLOCK_CODELINE_TYPE.COMMENT: {
                name = STR_COMMENT;
                break;
            }
            case BLOCK_CODELINE_TYPE.PRINT: {
                name = STR_PRINT;
                break;
            }
            case BLOCK_CODELINE_TYPE.NODE: {
                name = STR_NODE;
                break;
            }
            case BLOCK_CODELINE_TYPE.TEXT: {
                name = STR_TEXT;
                break;
            }
            case BLOCK_CODELINE_TYPE.SHADOW: {
                name = '';
                break;
            }
            default: {
                break;
            }
        }
        return name;
    }

    var RemoveSomeBlockAndGetBlockList = function(allArray, exceptArray) {
        var lastArray = [];
        allArray.forEach((block) => {
            var is = exceptArray.some((exceptBlock) => {
                if ( block.getUUID() == exceptBlock.getUUID() ) {
                    return true;
                } 
            });

            if (is !== true) {
                lastArray.push(block);
            } 
        });
        return lastArray;
    }
    
    /** block데이터를 배열에 담을때 INDENT direction과 direction 타입의 위치 변경
    *  DOWN 앞으로, INDENT 뒤로
    */
    var SetChildBlockList_down_first_indent_last = function( stack, blockList ) {
        blockList = blockList.sort((block1, block2) => {
            if (block1.getDirection() == BLOCK_DIRECTION.INDENT) {
                return 1;
            } else {
                return -1;
            }
        });
        blockList.forEach(el => {
            stack.unshift(el);
        });  
        return stack;  
    }

    /** */
    var MapNewLineStrToIndentString = function(str, indentString) {
        var _str = str.replace(/(\r\n\t|\n|\r\t)/gm,`\n${indentString}`);
        return _str;
    }

    /**
     * 텍스트 박스 라인 넘버 설정
     * @vpCommon_custom
     * @param {object} trigger 이벤트 트리거 객체
     */
    var SetTextareaLineNumber_apiBlock = function(trigger, textareaValue) {
        var rowCnt = textareaValue.split('\n').length;
        var sbLineText = new sb.StringBuilder();

        for (var idx = 1; idx <= rowCnt; idx++) {
            sbLineText.appendLine(idx);
        }

        $(trigger).prev(vpCommon.formatString(".{0}", vpConst.MANUAL_CODE_INPUT_AREA_LINE)).val(sbLineText.toString());
    }

    /** api code 반환 */
    var GenerateApiCode = function(thatBlock) {
        var metadata = thatBlock.getState(STATE_metadata);
        if (metadata) {
            var code = metadata.code;
            if (code) {
                return code;
            }
        }
        return '';
    }

    /** class param 생성 */
    var GenerateClassInParamList = function(thatBlock) {
        var parentClassName = thatBlock.getState(STATE_parentClassName);
        if (parentClassName != '') {
            var classInParamStr = `(`;
            classInParamStr += parentClassName;
            classInParamStr += `):`;
            return classInParamStr;
        } else {
            return ':';
        }
    }
 
    /** def param 생성 */
    var GenerateDefCode = function(thatBlock) {
         /** 함수 파라미터 */
         var defInParamList = thatBlock.getState(STATE_defInParamList);
         var defReturnTypeState = thatBlock.getState(STATE_defReturnType);
         var defInParamStr = `(`;
         defInParamList.forEach(( defInParam, index ) => {
            const { arg3, arg5 ,arg6 } = defInParam;
                 
            if (arg6 == DEF_BLOCK_ARG6_TYPE.ARGS) {
                defInParamStr += '*';
            } else if (arg6 == DEF_BLOCK_ARG6_TYPE.KWARGS) {
                defInParamStr += '**';
            }
 
            defInParamStr += arg3;
 
            if (arg5 !== '') {
                defInParamStr += `=${arg5}`;
            }
 
            for (var i = index + 1; i < defInParamList.length; i++) {
                if (defInParamList[i].arg3 !== '') {
                    defInParamStr += `, `;
                    break;
                }
            };
         });
         defInParamStr += `):`;
 
         return defInParamStr;
    }
 
    /** return param 생성 */
    var GenerateReturnCode = function(thatBlock) {
        var returnOutParamList = thatBlock.getState(STATE_returnOutParamList);
        var returnOutParamStr = ` `;
        returnOutParamList.forEach(( returnInParam, index ) => {
            if (returnInParam !== '' ) {
                returnOutParamStr += `${returnInParam}`;
                for (var i = index + 1; i < returnOutParamList.length; i++) {
                    if (returnOutParamList[i] !== '') {
                        returnOutParamStr += `, `;
                        break;
                    }
                };
            }
        });
        returnOutParamStr += ``;
        return returnOutParamStr;
    }
 
    /** if param 생성 */
    var GenerateIfCode = function(thatBlock, blockCodeLineType) {
         var ifConditionList;
         if (blockCodeLineType == BLOCK_CODELINE_TYPE.IF) {
             ifConditionList = thatBlock.getState(STATE_ifConditionList);
         } else {
             ifConditionList = thatBlock.getState(STATE_elifConditionList);
         }
 
         var ifConditionListStr = ``;
         ifConditionList.forEach(( ifCondition, index ) => {
             const { conditionType } = ifCondition;
             if (conditionType == IF_BLOCK_CONDITION_TYPE.ARG) {
                const { arg1, arg2, arg3, arg4, arg5, arg6 } = ifCondition;

                if ( !(arg1 == '' && (arg2 == 'none' || arg2 == '') && arg3 == '')) {
                    ifConditionListStr += `(`;
                }
                ifConditionListStr += arg1;
  
                if ( arg2 !== 'none' ) {
                    ifConditionListStr += arg2;
                }
                ifConditionListStr += arg3;
         
                if ( arg4 !== 'none' ) {
                    ifConditionListStr += arg4;
                    ifConditionListStr += arg5;
                }
                 
                if ( !(arg1 == '' && (arg2 == 'none' || arg2 == '') && arg3 == '')) {
                    ifConditionListStr += `)`;
                }
         
                if ( ifConditionList.length -1 !== index ) {
                    ifConditionListStr += '';
                    ifConditionListStr += arg6;
                    ifConditionListStr += '';
                }
            } else {
                const { codeLine, arg6 } = ifCondition;
                if (codeLine == '') {
                    return;
                }
                ifConditionListStr += `(`;
                ifConditionListStr += codeLine;
                ifConditionListStr += `)`;
 
                if ( ifConditionList.length -1 !== index ) {
                    ifConditionListStr += '';
                    ifConditionListStr += arg6;
                    ifConditionListStr += '';
                }
            }
        });
 
        return ifConditionListStr;
    }
 
      /** while param 생성 */
    var GenerateWhileCode = function(thatBlock) {
        var ifConditionList = thatBlock.getState(STATE_whileConditionList);
 
        var ifConditionListStr = ``;
        ifConditionList.forEach(( ifCondition, index ) => {
    
            const { arg1, arg2, arg3, arg4 } = ifCondition;

            if ( !(arg1 == '' && (arg2 == 'none' || arg2 == '') && arg3 == '')) {
                ifConditionListStr += `(`;
            }

            ifConditionListStr += arg1;
 
            if ( arg2 !== 'none' ) {
                ifConditionListStr += arg2;
            }
            ifConditionListStr += arg3;
                
            if ( !(arg1 == '' && (arg2 == 'none' || arg2 == '') && arg3 == '')) {
                ifConditionListStr += `)`;
            }
        
            if ( ifConditionList.length -1 !== index ) {
                ifConditionListStr += '';
                ifConditionListStr += arg4;
                ifConditionListStr += '';
            }
        });

       return ifConditionListStr;
    }

    var GenerateExceptCode = function(thatBlock) {
         var exceptConditionList = thatBlock.getState(STATE_exceptConditionList);
 
         var exceptConditionListStr = ``;
         exceptConditionList.forEach(( exceptCondition, index ) => {
            const { conditionType } = exceptCondition;
            if (conditionType == IF_BLOCK_CONDITION_TYPE.ARG) {
                const { arg1, arg2, arg3 } = exceptCondition;
        
                exceptConditionListStr += arg1;

                if ( arg2 == 'none' || arg2 == STR_EMPTY ) {
                } else {
                    exceptConditionListStr += ' ';
                    exceptConditionListStr += arg2;
                    exceptConditionListStr += ' ';
                    exceptConditionListStr += arg3;
                }
        
            } else {
                const { codeLine } = exceptCondition;
                if (codeLine == '') {
                    return;
                }
             
                exceptConditionListStr += codeLine;
            }
     
         });
 
        return exceptConditionListStr;
     }
 
     /** for param 생성 */
     var GenerateForCode = function(thatBlock) {
        var forParam = thatBlock.getState(STATE_forParam);
        const { arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8 } = forParam;
 
        var forParamStr = ``;
 
         
        if ((arg3 == FOR_BLOCK_ARG3_TYPE.VARIABLE || arg3 == FOR_BLOCK_ARG3_TYPE.TYPING) && arg4 !== STR_EMPTY) {
             forParamStr += arg4;
        }
        if ((arg3 == FOR_BLOCK_ARG3_TYPE.VARIABLE || arg3 == FOR_BLOCK_ARG3_TYPE.TYPING) && arg1 !== STR_EMPTY && arg4 !== STR_EMPTY) { 
            forParamStr += ',';
        } 
            
        if (arg1 !== STR_EMPTY) {
            forParamStr += arg1;
        }
 
        forParamStr += ' ';
        forParamStr += 'in';
        forParamStr += ' ';

        if (arg3 == FOR_BLOCK_ARG3_TYPE.VARIABLE) {
        //  forParamStr += arg3;
            forParamStr += '(';
            forParamStr += arg8;
            forParamStr += ')';

        } else if (arg3 ==  FOR_BLOCK_ARG3_TYPE.TYPING ) {
        //  forParamStr += arg3;
            forParamStr += '(';
            forParamStr += arg7;
            forParamStr += ')';

        } else if (arg3 ==  FOR_BLOCK_ARG3_TYPE.RANGE ) {
            forParamStr += 'range(';

            if (arg5 !== '') {
                forParamStr += arg5;
            }

            if (arg5 !== '' && arg2 !== '') { 
                forParamStr += ',';
            }

            if (arg2 !== '') {
                forParamStr += ' ';
                forParamStr += arg2;
            }

            if ((arg5 !== '' || arg2 !== '') && arg6 !== '') { 
                forParamStr += ',';
            }

            if (arg6 !== '') {
                forParamStr += ' ';
                forParamStr += arg6;
            }

            forParamStr += ')';

        } else {
        if (arg3 != FOR_BLOCK_ARG3_TYPE.INPUT_STR) {
            forParamStr += arg3;
        }

        if (arg2 != '') {
            if (arg3 == '' || arg3 == FOR_BLOCK_ARG3_TYPE.INPUT_STR) {
                forParamStr += arg2;
            } else {
                forParamStr += '(';
                forParamStr += arg2;
                forParamStr += ')';
            }
        }

        }

        return forParamStr;
    }

 
    var GenerateLambdaCode = function(thatBlock) {
        var lambdaParamStr = STR_EMPTY;
        var lambdaArg1State = thatBlock.getState(STATE_lambdaArg1);
        var lambdaArg2ListState = thatBlock.getState(STATE_lambdaArg2List);
        var lambdaArg3State = thatBlock.getState(STATE_lambdaArg3);

        if (lambdaArg1State != '') {
            lambdaParamStr += lambdaArg1State;
            lambdaParamStr += ' ';
            lambdaParamStr += '=';
            lambdaParamStr += ' ';
        }
 
        lambdaParamStr += 'lambda';
        lambdaParamStr += ' ';
        lambdaArg2ListState.forEach( (lambdaArg2, index) => {
            lambdaParamStr += lambdaArg2;
            if ( lambdaArg2ListState.length - 1 != index) {
                if (lambdaArg2 != '') {
                    lambdaParamStr += ' ';
                    lambdaParamStr += ',';
                }
            }
        });
   
        lambdaParamStr += ':';  
        lambdaParamStr += MapNewLineStrToIndentString(lambdaArg3State);
   
        return lambdaParamStr;
     }

     var GenerateImportCode = function(thisBlock, indentString) {
        var codeLine = STR_EMPTY;
        var blockName = 'import';
        var baseImportList = thisBlock.getState(STATE_baseImportList).filter(baseImport => {
            if ( baseImport.isImport == true) {
                return true;
            } else {
                return false;
            }
        });

        var customImportList = thisBlock.getState(STATE_customImportList).filter(customImport => {
            if ( customImport.isImport == true) {
                return true;
            } else {
                return false;
            }
        });
   
        var lineNum = 0;
        var indentString = thisBlock.getIndentString();

        baseImportList.forEach((baseImport, index) => {
            if (lineNum > 0) {
                codeLine += indentString;
            } 
      
            codeLine += `${blockName.toLowerCase()} ${baseImport.baseImportName} as ${baseImport.baseAcronyms}`;
            if (baseImport.baseImportName == 'matplotlib.pyplot') {
                codeLine += STR_KEYWORD_NEW_LINE;
                codeLine += indentString;
                codeLine += `%matplotlib inline`;
            }

            if (index != baseImportList.length - 1) {
                codeLine += STR_KEYWORD_NEW_LINE;
            }
            lineNum++;
        });

        customImportList.forEach((customImport,index ) => {
            if (lineNum > 0) {
                codeLine += indentString;
            } 

            codeLine += `${blockName.toLowerCase()} ${customImport.baseImportName} as ${customImport.baseAcronyms}`;
            if (customImport.baseImportName == 'matplotlib.pyplot') {
                codeLine += STR_KEYWORD_NEW_LINE;
                codeLine += indentString;
                codeLine += `%matplotlib inline`;
            }

            if (index != customImportList.length - 1) {
                codeLine += STR_KEYWORD_NEW_LINE;
            }

            lineNum++;
        });

        // console.log(codeLine);
        return codeLine;
     };

     var ShowImportListAtBlock = function(thisBlock) {
        var codeLine = STR_EMPTY;
        var baseImportList = thisBlock.getState(STATE_baseImportList).filter(baseImport => {
            if ( baseImport.isImport == true) {
                return true;
            } else {
                return false;
            }
        });
        var customImportList = thisBlock.getState(STATE_customImportList).filter(customImport => {
            if ( customImport.isImport == true) {
                return true;
            } else {
                return false;
            }
        });

        if (baseImportList.length != 0) {
            codeLine += baseImportList[0].baseImportName + ' as ' + baseImportList[0].baseAcronyms;
        } else if (customImportList.length != 0) {
            codeLine += customImportList[0].baseImportName + ' as ' + customImportList[0].baseAcronyms;
        }
        // console.log('codeLine',codeLine);
        return codeLine;
    }
    
    /**  멀티라인의 첫번째 줄만 보여준다 */
    var ShowCodeBlockCode = function(thisBlock) {
        var codeLine = thisBlock.getState(STATE_codeLine);
        var firstNewLine_index = codeLine.indexOf('\n');
        if (firstNewLine_index != -1) {
            var sliced_codeline = codeLine.slice(0, firstNewLine_index);
            return sliced_codeline;
        } else {
            return codeLine;
        }
    }
    

 
     var RenderHTMLDomColor = function(block, htmlDom) {
         var blockType = block.getBlockType();
 
         /** class & def 블럭 */
         if ( blockType == BLOCK_CODELINE_TYPE.CLASS 
             || blockType == BLOCK_CODELINE_TYPE.DEF) {
             $(htmlDom).addClass(VP_BLOCK_BLOCKCODELINETYPE_CLASS_DEF);
             
         /** controls 블럭 */
         } else if ( blockType == BLOCK_CODELINE_TYPE.IF 
             || blockType == BLOCK_CODELINE_TYPE.FOR
             || blockType == BLOCK_CODELINE_TYPE.WHILE 
             || blockType == BLOCK_CODELINE_TYPE.TRY
             || blockType == BLOCK_CODELINE_TYPE.ELSE 
             || blockType == BLOCK_CODELINE_TYPE.ELIF
             || blockType == BLOCK_CODELINE_TYPE.FOR_ELSE 
             || blockType == BLOCK_CODELINE_TYPE.EXCEPT 
             || blockType == BLOCK_CODELINE_TYPE.FINALLY 
             || blockType == BLOCK_CODELINE_TYPE.IMPORT
             || blockType == BLOCK_CODELINE_TYPE.LAMBDA
             || blockType == BLOCK_CODELINE_TYPE.PROPERTY
             || blockType == BLOCK_CODELINE_TYPE.RETURN ) {
        
             $(htmlDom).addClass(VP_BLOCK_BLOCKCODELINETYPE_CONTROL);
        } else if (blockType == BLOCK_CODELINE_TYPE.API) {
            /** API 블럭 */
            $(htmlDom).addClass(VP_BLOCK_BLOCKCODELINETYPE_API);
        } else if (blockType == BLOCK_CODELINE_TYPE.TEXT) {
            $(htmlDom).addClass(VP_BLOCK_BLOCKCODELINETYPE_TEXT);
            $(htmlDom).css(STR_BACKGROUND_COLOR, STR_TRANSPARENT);
        } else if (blockType == BLOCK_CODELINE_TYPE.NODE) {
            $(htmlDom).addClass(VP_BLOCK_BLOCKCODELINETYPE_NODE);
        } else {
             $(htmlDom).addClass(VP_BLOCK_BLOCKCODELINETYPE_CODE);
        }
        return htmlDom;

        
    }
 


    var IsCanHaveIndentBlock = function(blockType) {
        if ( blockType == BLOCK_CODELINE_TYPE.CLASS
            || blockType == BLOCK_CODELINE_TYPE.DEF

            || blockType == BLOCK_CODELINE_TYPE.IF 
            || blockType == BLOCK_CODELINE_TYPE.FOR
            || blockType == BLOCK_CODELINE_TYPE.TRY
            || blockType == BLOCK_CODELINE_TYPE.WHILE
            
            || blockType == BLOCK_CODELINE_TYPE.ELSE 
            || blockType == BLOCK_CODELINE_TYPE.ELIF
            || blockType == BLOCK_CODELINE_TYPE.FOR_ELSE 
            || blockType == BLOCK_CODELINE_TYPE.EXCEPT 
            || blockType == BLOCK_CODELINE_TYPE.FINALLY ) {
           return true;
       } else {
           return false;
       }
    }

    var IsCodeBlockType = function(blockType) {
        if ( blockType == BLOCK_CODELINE_TYPE.CODE
            || blockType == BLOCK_CODELINE_TYPE.PASS
            || blockType == BLOCK_CODELINE_TYPE.CONTINUE 
            || blockType == BLOCK_CODELINE_TYPE.BREAK

            || blockType == BLOCK_CODELINE_TYPE.PROPERTY
            || blockType == BLOCK_CODELINE_TYPE.PRINT
            || blockType == BLOCK_CODELINE_TYPE.BLANK
            || blockType == BLOCK_CODELINE_TYPE.COMMENT  ) {
            return true;
        } else {
            return false;
        }
    }

    var IsElifElseExceptFinallyBlockType = function(blockType) {
        if ( blockType == BLOCK_CODELINE_TYPE.ELIF
            || blockType == BLOCK_CODELINE_TYPE.EXCEPT
            || blockType == BLOCK_CODELINE_TYPE.ELSE 
            || blockType == BLOCK_CODELINE_TYPE.FOR_ELSE
            || blockType == BLOCK_CODELINE_TYPE.FINALLY  ) {
            return true;
        } else {
            return false;
        }
    }

    var IsIfForTryBlockType = function(blockType) {
        if ( blockType == BLOCK_CODELINE_TYPE.IF
            || blockType == BLOCK_CODELINE_TYPE.FOR
            || blockType == BLOCK_CODELINE_TYPE.TRY) {
            return true;
        } else {
            return false;
        }
    }

    var IsNodeTextBlockType = function(blockType) {
        if ( blockType == BLOCK_CODELINE_TYPE.NODE
             || blockType == BLOCK_CODELINE_TYPE.TEXT) {
             return true;
        } else {
            return false;
        }
    }

    var IsDefineBlockType = function(blockType) {
        if ( blockType == BLOCK_CODELINE_TYPE.CLASS
             || blockType == BLOCK_CODELINE_TYPE.DEF) {
             return true;
        } else {
            return false;
        }
    }

    var IsControlBlockType = function(blockType) {
        if ( blockType == BLOCK_CODELINE_TYPE.IF 
            || blockType == BLOCK_CODELINE_TYPE.FOR
            || blockType == BLOCK_CODELINE_TYPE.WHILE 
            || blockType == BLOCK_CODELINE_TYPE.TRY

            || blockType == BLOCK_CODELINE_TYPE.CONTINUE
            || blockType == BLOCK_CODELINE_TYPE.BREAK
            || blockType == BLOCK_CODELINE_TYPE.PASS
            || blockType == BLOCK_CODELINE_TYPE.RETURN) {
             return true;
        } else {
            return false;
        }
    }

       /**
     * types에 해당하는 데이터유형을 가진 변수 목록 조회
     * @param {*} types 조회할 변수들의 데이터유형 목록
     * @param {*} callback 조회 후 실행할 callback. parameter로 result를 받는다
     */

    var LoadVariableList = function(blockContainer) {
        var types = [
            // pandas 객체
            'DataFrame', 'Series', 'Index', 'Period', 'GroupBy', 'Timestamp'
            // Index 하위 유형
            , 'RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'
            // GroupBy 하위 유형
            , 'DataFrameGroupBy', 'SeriesGroupBy'
            // Plot 관련 유형
            , 'Figure', 'AxesSubplot'
            // Numpy
            , 'ndarray'
            // Python 변수
            , 'str', 'int', 'float', 'bool', 'dict', 'list', 'tuple'
        ];
        /**
         * 변수 조회 시 제외해야할 변수명
         */
        var _VP_NOT_USING_VAR = ['_html', '_nms', 'NamespaceMagics', '_Jupyter', 'In', 'Out', 'exit', 'quit', 'get_ipython'];
        /**
         * 변수 조회 시 제외해야할 변수 타입
         */
        var _VP_NOT_USING_TYPE = ['module', 'function', 'builtin_function_or_method', 'instance', '_Feature', 'type', 'ufunc'];

        // types에 맞는 변수목록 조회하는 명령문 구성
        var cmdSB = new sb.StringBuilder();
        cmdSB.append(`print([{'varName': v, 'varType': type(eval(v)).__name__}`);
        cmdSB.appendFormat(`for v in dir() if (v not in {0}) `, JSON.stringify(_VP_NOT_USING_VAR));
        cmdSB.appendFormat(`& (type(eval(v)).__name__ not in {0}) `, JSON.stringify(_VP_NOT_USING_TYPE));
        cmdSB.appendFormat(`& (type(eval(v)).__name__ in {0})])`, JSON.stringify(types));

        // FIXME: vpFuncJS에만 kernel 사용하는 메서드가 정의되어 있어서 임시로 사용
        vp_executePython(cmdSB.toString(), function(result) {
            // callback(result);
            blockContainer.setKernelLoadedVariableList(result);
        });
    }

    /**
     * FIXME: vpFuncJS에만 kernel 사용하는 메서드가 정의되어 있어서 임시로 사용
     * @param {*} command 
     * @param {*} callback 
     * @param {*} isSilent 
     */
    var vp_executePython = function (command, callback, isSilent = false) {
        Jupyter.notebook.kernel.execute(
            command,
            {
                iopub: {
                    output: function (msg) {
                        var result = String(msg.content["text"]);
                        /** parsing */
                        var jsonVars = result.replace(/'/gi, `"`);
                        var varList = JSON.parse(jsonVars);

                        /** '_' 가 들어간 변수목록 제거 */
                        var filteredVarlist = varList.filter(varData => {
                            if (varData.varName.indexOf('_') != -1) {
                                return false;
                            } else {
                                return true;
                            }
                        });
                        callback(filteredVarlist);
                    }
                }
            },
            { silent: isSilent }
        );
    };
    return {
        ControlToggleInput

        , CreateOneArrayValueAndGet
        , UpdateOneArrayValueAndGet
        , DeleteOneArrayValueAndGet

        , SetChildBlockList_down_first_indent_last

        , MapGroupTypeToName
        , MapTypeToName
        , RemoveSomeBlockAndGetBlockList
        
        , MapNewLineStrToIndentString
        
        , SetTextareaLineNumber_apiBlock

        , IsCanHaveIndentBlock
        , IsCodeBlockType
        , IsElifElseExceptFinallyBlockType
        , IsIfForTryBlockType
        , IsNodeTextBlockType
        , IsDefineBlockType
        , IsControlBlockType

        , LoadVariableList
        
        , RenderHTMLDomColor
 
        , GenerateApiCode

        , GenerateClassInParamList
        , GenerateDefCode
        , GenerateReturnCode
        , GenerateIfCode
        , GenerateExceptCode
        , GenerateForCode
        , GenerateLambdaCode
        , GenerateImportCode
        , GenerateWhileCode

        , ShowImportListAtBlock
        , ShowCodeBlockCode
    }
});
