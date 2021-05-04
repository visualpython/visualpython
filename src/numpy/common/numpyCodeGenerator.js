define ([
    'require'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/numpy/api/numpyStateApi'
], function(requirejs, sb
            , numpyStateApi) {
    'use strict';
    var { fixNumpyParameterValue } = numpyStateApi;
    var sbCode = new sb.StringBuilder();

    /**
     * @class NumpyCodeGenerator
     * @constructor
    */
    var NumpyCodeGenerator = function() {
        // this.numpyStateGenerator;
    };

    /** 자식 클래스에서 반드시! 오버라이드 되는 메소드
     *  nummpy 패키지에서 코드 실행을 버튼을 누르면 생성하는 함수.
     * @param {Object} state 
     */
    NumpyCodeGenerator.prototype.makeCode = function(state) {

    }
    /**
    * mapFuncIdToFuncData api 함수에서 사용
    * PythonComStateGenerator 인스턴스를 가지고 있기 위해 사용하는 메소드
    * @override
    * @param {numpyStateGenerator instance} numpyStateGenerator 
    */
    NumpyCodeGenerator.prototype.setStateGenerator = function(numpyStateGenerator) {
        this.numpyStateGenerator = numpyStateGenerator;
    }
    NumpyCodeGenerator.prototype.getStateGenerator = function() {
        return this.numpyStateGenerator;
    }
    
    NumpyCodeGenerator.prototype.getPrefixCode = function() {
        return this.numpyStateGenerator.getState('prefixCode');
    }
    NumpyCodeGenerator.prototype.getPostfixCode = function() {
        return this.numpyStateGenerator.getState('postfixCode');
    }

    /** make prefix code */
    NumpyCodeGenerator.prototype.makePrefixCode = function() {
        var prefixCode = this.getPrefixCode();
        if (prefixCode.length > 0) {
            sbCode.appendLine(prefixCode);
        }
    }
    /** make postfix code */
    NumpyCodeGenerator.prototype.makePostfixCode = function() {
        var postfixCode = this.getPostfixCode();
        if (postfixCode.length > 0) {
            sbCode.appendLine('');
            sbCode.append(postfixCode);
        }
    }

    /** 
     * numpy 함수 코드를 만드는 함수
         @param {object} codeObject 
     *       -> @param {number} indentSpaceNum
     *       -> @param {string} numpyFunctionName
     *       -> @param {string} paramStr
     *       -> @param {string} dtypeStr
     *       -> @param {boolean} isPrintReturnVar
     *       -> @param {string || null} returnVarStrOrNull
    */
    NumpyCodeGenerator.prototype.makeNumpyFunctionCode = function(codeObject) {

        var { returnVarStrOrNull, numpyFunctionName, paramStr, dtypeStr, isPrintReturnVar } = codeObject;
        var _returnVarStrOrNull = this._validateReturnVar(returnVarStrOrNull);
        dtypeStr = this._makeDtype(dtypeStr);
     
        this.makePrefixCode();

        var userOptionListStr = this.makeNumpyUserOptionList();
        /** make numpy pakage function code */
        if (isPrintReturnVar === true) {
            sbCode.appendFormatLine(`{0}np.${numpyFunctionName}({1},{2},{3})`,`${_returnVarStrOrNull}`, `${paramStr}`, `${dtypeStr}`,`${userOptionListStr}`);
            this._appendPrintReturnVar(returnVarStrOrNull);
        } else {
            sbCode.appendFormat(`{0}np.${numpyFunctionName}({1},{2},{3})`, `${_returnVarStrOrNull}`, `${paramStr}`, `${dtypeStr}`,`${userOptionListStr}`);
        }

        this.makePostfixCode();
    };


    /** 
     * numpy 함수 코드를 만드는 함수
     * 위의 함수와 달리 dtype을 만들지 않는다.
        @param {object} codeObject 
     *       -> @param {number} indentSpaceNum
     *       -> @param {string} numpyFunctionName
     *       -> @param {string} paramStr
     *       -> @param {boolean} isPrintReturnVar
     *       -> @param {string || null} returnVarStrOrNull
    */
    NumpyCodeGenerator.prototype.makeNumpyFunctionCodeNoDtype = function(codeObject) {

        var { returnVarStrOrNull, numpyFunctionName, paramStr, isPrintReturnVar } = codeObject;
  
        var _returnVarStrOrNull = this._validateReturnVar(returnVarStrOrNull);

        this.makePrefixCode();

        /** make numpy pakage function code */
        if (isPrintReturnVar === true) {
            sbCode.appendFormatLine(`{0}np.${numpyFunctionName}({1})`,`${_returnVarStrOrNull}`, `${paramStr}`);
            this._appendPrintReturnVar(returnVarStrOrNull);
        } else {
            sbCode.appendFormat(`{0}np.${numpyFunctionName}({1})`,`${_returnVarStrOrNull}`, `${paramStr}`);
        }

        this.makePostfixCode();
    }

    /** 
     * numpy 인스턴스 메소드 함수
     * 이름 앞에 np가 붙지 않는 numpy 함수 코드를 만들기 위한 함수
     *  ex) np.reshape는 임의의 call 변수를 생성한 다음 reshapte 함수를 사용한다
     *      -> ` customVariable.reshape() `
     *      여기서 customVariable 변수는 사용자가 설정한 변수
        @param {object} codeObject 
     *       -> @param {number} indentSpaceNum
     *       -> @param {string} numpyFunctionName
     *       -> @param {string} paramStr
     *       -> @param {string} callVarStr
     *       -> @param {boolean} isPrintReturnVar
     *       -> @param {string || null} returnVarStrOrNull
    */
    NumpyCodeGenerator.prototype.makeNumpyInstanceFunctionCode = function(codeObject) {

        var { callVarStr , returnVarStrOrNull, numpyFunctionName, paramStr, isPrintReturnVar } = codeObject;
  
        var _returnVarStrOrNull = this._validateReturnVar(returnVarStrOrNull);
        var _callVarStrOrNull = this._validateCallVar(callVarStr);

        this.makePrefixCode();

        /** make numpy pakage function code */
        if (isPrintReturnVar === true) {
            sbCode.appendFormatLine(`{0}{1}.${numpyFunctionName}({2})`, `${_returnVarStrOrNull}`, `${_callVarStrOrNull}`,`${paramStr}`);
            this._appendPrintReturnVar(returnVarStrOrNull);
        } else {
            sbCode.appendFormat(`{0}{1}.${numpyFunctionName}({2})`, `${_returnVarStrOrNull}`, `${_callVarStrOrNull}`,`${paramStr}`);
        }

        this.makePostfixCode();
    }

    /** 
     * numpy indexing 코드를 만드는 함수
        @param {object} codeObject 
     *        -> @param {number} indentSpaceNum
     *        -> @param {string} numpyFunctionName
     *        -> @param {string} paramStr
     *        -> @param {string} callVarStr
     *        -> @param {string} assignedValueStr
     *        -> @param {boolean} isPrintCallVar
     *        -> @param {string || null} returnVarStrOrNull
    */
    NumpyCodeGenerator.prototype.makeNumpyIndexingCode = function(codeObject) {

        var { paramStr, callVarStr, assignedValueStr, isPrintCallVar, returnVarStrOrNull } = codeObject;
        var _returnVarStrOrNull = this._validateReturnVar(returnVarStrOrNull);
        if (assignedValueStr !== '') {
            var prefix = ` = `;
            assignedValueStr = prefix + assignedValueStr;
        }

        this.makePrefixCode();

        /** make numpy pakage function code */
        if (isPrintCallVar === true) {
            sbCode.appendFormatLine(`{0}{1}{2}`, `${_returnVarStrOrNull}`, `${paramStr}`, `${assignedValueStr}`);
            this._appendPrintReturnVar(returnVarStrOrNull);
        } else {
            sbCode.appendFormat(`{0}{1}{2}`,`${_returnVarStrOrNull}`, `${paramStr}`, `${assignedValueStr}`);
        }

        this.makePostfixCode();
    }

    /** userOption의 코드를 생성하는 함수 */
    NumpyCodeGenerator.prototype.makeNumpyUserOptionList = function() {
        var stateGenerator = this.getStateGenerator();
        var userOptionListStr = ``;
        for (var i = 0; i < stateGenerator.getState('userOptionList').length; i++ ) {
            const { optionKey, optionValue } = stateGenerator.getState('userOptionList')[i];
            if (optionKey === '' || optionValue === '') {
                continue;
            }

            if (i > 0) {
                userOptionListStr += `,`;
            } 
       
            userOptionListStr += `${optionKey}=${optionValue}`;
        }
        return userOptionListStr;
    }

    /** import numpy 함수 */
    NumpyCodeGenerator.prototype.makeImportNumpyCode = function() {
        var stateGenerator = this.getStateGenerator();
        var codeStr = `import numpy as ${stateGenerator.getState('acronyms')}`;
        sbCode.appendFormatLine(`{0}`, codeStr);
    }

    /** 
     * prefix dtype 함수
     * @private
            @param {string} dtypeStr 
    */
    NumpyCodeGenerator.prototype._makeDtype = function(dtypeStr) {
        var prefixDtypeStr = 'dtype=';
        dtypeStr = prefixDtypeStr + dtypeStr;
        return dtypeStr;
    }

    /** 
     * 리턴 변수를 프린트 하는 함수
     * @private
            @param {string} returnVar 
    */
    NumpyCodeGenerator.prototype._appendPrintReturnVar = function(returnVar) {
        sbCode.appendFormat(`{0}`, `${returnVar}`)
    }

    /** 
     * 리턴 변수가 있는지 없는지 확인하는 함수
     * @private
            @param {string | null} returnVarOrNull 
    */
    NumpyCodeGenerator.prototype._validateReturnVar = function(returnVarOrNull) {
        if (returnVarOrNull === null || returnVarOrNull === '') {
            returnVarOrNull = '';
        } else {
            returnVarOrNull += ' = ';
        }
        return returnVarOrNull;
    }

    /**
     * 호출 변수가 있는지 검사하는 함수
     * 예) n2array.reshape() 에서 n2array의 존재 여부를 검사
     * @param {callVarStr} callVarStr 
     */
    NumpyCodeGenerator.prototype._validateCallVar = function(callVarStr) {
        if (callVarStr === null || callVarStr === '') {
            callVarStr = '';
        } 
        return callVarStr;
    }

    /** FIXME: 현재 사용하지 않는 메소드
     * 현재 sbCode에 저장된 코드를 가져오는 함수
     */
    NumpyCodeGenerator.prototype.getCode = function() {
        return sbCode.toString();
    }
    
    /**
     * 현재 sbCode에 저장된 코드를 보여주고 삭제하는 함수
     */
    NumpyCodeGenerator.prototype.getCodeAndClear = function() {
        var returnStr = sbCode.toString();
        sbCode.clear();

        if(returnStr === '') {
            return null;
        }
        return returnStr;
    }

    NumpyCodeGenerator.prototype.mapParamToCode_type1 = function(paramOption, paramData) {
        var paramStr = '';
        switch (paramOption) {
            // 1차원 배열
            case 1:{
                sbCode.append(`[`);
                var paramOneArray = paramData['paramOneArray'] || paramData['param2OneArray']
                paramOneArray.forEach(element => {
                    sbCode.append(`${fixNumpyParameterValue(element)},`);
                });
                sbCode.append(`]`);
                paramStr += sbCode.toString();
                sbCode.clear();
                break;
            }
            // 2차원 배열
            case 2:{
                sbCode.append(`[`);
                var paramTwoArray = paramData['paramTwoArray'] || paramData['param2TwoArray']
                paramTwoArray.forEach(element => {
                    sbCode.append(`[`);
                    element.forEach(innerElement => {
                        sbCode.append(`${fixNumpyParameterValue(innerElement)},`);
                    });
                    sbCode.append(`],`);
                });
                sbCode.append(`]`);
                paramStr += sbCode.toString();
                sbCode.clear();
                break;
            }

            case 4: {
                paramStr += paramData['paramScalar'] || paramData['param2Scalar'];
                break;
            }
            case 5: {
                paramStr += paramData['paramVariable'] || paramData['param2Variable'];
                break;
            }
            default: {
                break;
            }
        }

        return paramStr;
    }
    return NumpyCodeGenerator;
});
