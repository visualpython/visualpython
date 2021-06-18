define ([
    'require'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    // Numpy 패키지용 import 라이브러리
    , 'nbextensions/visualpython/src/numpy/common/numpyCodeGenerator'
    , 'nbextensions/visualpython/src/numpy/api/numpyStateApi'
], function(requirejs, sb, 
            NumpyCodeGenerator,
            numpyStateApi) {
    "use strict";
    var sbCode = new sb.StringBuilder();
    var { fixNumpyParameterValue } = numpyStateApi;

    /**
     * @class NpArrayCodeGenerator
     * @constructor
    */
    var NpArrayCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpArrayCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     */
    NpArrayCodeGenerator.prototype.makeCode = function() {
        const { paramOption
                , paramData
                , returnVariable
                , dtype
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();
        const { paramOneArray, paramTwoArray, paramThreeArray, paramScalar, paramVariable } = paramData;
        
        var paramStr = this.mapParamToCode_type1(paramOption, paramData);
        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: "array",
            paramStr: paramStr, 
            dtypeStr: dtype,
            isPrintReturnVar: isReturnVariable
        }
        this.makeNumpyFunctionCode(codeObject);
    }

    
    return NpArrayCodeGenerator;
});