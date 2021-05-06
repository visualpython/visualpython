define ([
    'require'
], function(requirejs) {
    "use strict";

    /** findStateValue 함수
     *  state를 while루프로 돌면서 돌면서 keyName과 일치하는 state의 value값을 찾아 리턴한다
     *  없으면 null을 리턴한다.
     *  @param {object} state 
     *  @param {string} keyName 
     *  @returns {any | null} returnValueOrNull
     */
    var findStateValue = function(state, keyName) {
        var result = [];
        var stack = [{ context: result
                       , key: 0
                       , value: state }];
        var currContext;
        var returnValueOrNull = null; 
        while (currContext = stack.pop()) {
            var {context, key, value} = currContext;

            if (!value || typeof value != 'object') {
                if (key === keyName) {
                    returnValueOrNull = value;
                    break;
                }
         
                context[key] = value; 
            }
            else if (Array.isArray(value)) {
                if (key === keyName) {
                    returnValueOrNull = value;
                    break;
                }
   
            } else {
                if (key === keyName) {
                    returnValueOrNull = value;
                    break;
                }
                context = context[key] = Object.create(null);
                Object.entries(value).forEach(([ key,value ]) => {
                    stack.push({ context, key, value });
                });
            }
        };
        return returnValueOrNull;
    };

    /** changeOldToNewState 함수
     *  oldState(이전 state 데이터)와 newState(새로운 state 데이터)를 비교해서 newState로 들어온 새로운 값을 oldState에 덮어 씌운다.
     *  @param {Object} oldState 
     *  @param {Object} newState 
     *  @returns {Object}
     */
    var changeOldToNewState = function(oldState, newState) {
        var result = [];
        var stack = [{ context: result
                       , key: 0
                       , value: oldState }];
        var currContext;
        while (currContext = stack.pop()) {
            var {context, key, value} = currContext;
   
            if (!value || typeof value != 'object') {
                var newValue = findStateValue(newState, key);
                if (newValue === "") {
                    context[key] = "";
                }
                else if (newValue === false) {
                    context[key] = false;
                }
                else {
                    context[key] = newValue || value;
                }
            }
            else if (Array.isArray(value)) {
                var newValue = findStateValue(newState, key);
                context[key] = newValue || value;
            } 
            else {
                context = context[key] = Object.create(null);
                Object.entries(value).forEach(([ key, value ]) => {
                    stack.push({context, key, value});
                });
            }
        };
        return result[0];
    };

    /** updateOneArrayIndexValueAndGetNewArray
     *  배열의 특정 인덱스 값을 업데이트하고 업데이트된 새로운 배열을 리턴한다
     *  @param {Array} array 
     *  @param {number} index
     *  @param {number | string} newValue 
     *  @returns {Array} New array
     */
    var updateOneArrayIndexValueAndGetNewArray = function(array, index, newValue) {
        return [ ...array.slice(0, index), newValue,
                 ...array.slice(index+1, array.length) ]
    }

    /** deleteOneArrayIndexValueAndGetNewArray
     *  배열의 특정 인덱스 값을 삭제하고 삭제된 새로운 배열을 리턴한다
     *  @param {Array} array 
     *  @param {number} index 
     *  @returns {Array} New array
     */
    var deleteOneArrayIndexValueAndGetNewArray = function(array, index) {
        return [ ...array.slice(0, index), 
                 ...array.slice(index+1, array.length) ]
    }
    
    /** updateTwoArrayIndexValueAndGetNewArray
     *  2차원 배열의 특정 인덱스 값을 업데이트하고 업데이트된 새로운 배열을 리턴한다
     *  @param {Array} array 
     *  @param {number} row
     *  @param {number} col
     *  @param {number | string} newValue 
     *  @returns {Array} New array
     */
    var updateTwoArrayIndexValueAndGetNewArray = function(twoarray, row, col, newValue) {
        var newArray = [...twoarray[row].slice(0, col),newValue,
                        ...twoarray[row].slice(col + 1, twoarray[row].length)]
        return [ ...twoarray.slice(0, row), newArray,
                 ...twoarray.slice(row+1, twoarray.length) ]
    }
    /** deleteTwoArrayIndexValueAndGetNewArray
     *  2차원 배열의 특정 인덱스 값을 삭제하고 삭제된 새로운 배열을 리턴한다
     *  @param {Array} array 
     *  @param {number} row 
     *  @param {number} col
     *  @returns {Array} New array
     */
    var deleteTwoArrayIndexValueAndGetNewArray = function(twoarray, row, col) {
        var newArray = [...twoarray[row].slice(0, col),
                        ...twoarray[row].slice(col + 1, twoarray[row].length)]
        return [ ...twoarray.slice(0, row), newArray,
                 ...twoarray.slice(row+1, twoarray.length) ]
    }
    /** fixNumpyParameterValue
     *  numpy 파라미터에 "00",  "01" 혹은 "000" 처럼 숫자 0이 단독으로 있지않고 중복되거나 다른 숫자 앞에 올 때 parsing 에러가 난다
     *  그럴 때 "00" 을 "0"으로 "01"을 "1"로 바꿔주는 fix함수
     *  @param {string} parameterStr 
     */

    var fixNumpyParameterValue = function(parameterStr) {
        var length = parameterStr.length;
        var currParameterStr = parameterStr;
        while (0 < length) {
            if (currParameterStr[0] === "0" && currParameterStr[1]) {
                currParameterStr = currParameterStr.slice(1, currParameterStr.length);
            } else {
                break;
            }
        }
        return currParameterStr;
    }

    return {
        findStateValue,
        changeOldToNewState,
        updateOneArrayIndexValueAndGetNewArray,
        deleteOneArrayIndexValueAndGetNewArray,
        updateTwoArrayIndexValueAndGetNewArray,
        deleteTwoArrayIndexValueAndGetNewArray,
        fixNumpyParameterValue
    }
});
