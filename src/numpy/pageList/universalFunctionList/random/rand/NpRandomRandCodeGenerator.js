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
     * @class NpRandomRandCodeGenerator
     * @constructor
    */
    var NpRandomRandCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpRandomRandCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     */
    NpRandomRandCodeGenerator.prototype.makeCode = function() {
        const { indexValue1
                , indexValue2
                , returnVariable
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();
        
        var paramStr = `${indexValue1},${indexValue2}`;

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: `random.rand`,
            paramStr: `${paramStr}`, 
            isPrintReturnVar: isReturnVariable
        }
        
        this.makeNumpyFunctionCodeNoDtype(codeObject);
    }

    
    return NpRandomRandCodeGenerator;
});
