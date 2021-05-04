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
     * @class NpRandomRandintCodeGenerator
     * @constructor
    */
    var NpRandomRandintCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpRandomRandintCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     */
    NpRandomRandintCodeGenerator.prototype.makeCode = function() {
        const { indexValue
                , returnVariable
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();
        
        var paramStr = indexValue;

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: `random.randint`,
            paramStr: `${paramStr}`, 
            isPrintReturnVar: isReturnVariable
        }
        this.makeNumpyFunctionCodeNoDtype(codeObject);
    }

    
    return NpRandomRandintCodeGenerator;
});
