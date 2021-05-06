define ([
    'require'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/numpy/common/numpyCodeGenerator'
], function(requirejs, sb, 
            NumpyCodeGenerator) {

    "use strict";
    var sbCode = new sb.StringBuilder();

    /**
     * @class NpTCodeGenerator
     * @constructor
    */
    var NpTCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpTCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     * @param {Obejct} state 
     */
    NpTCodeGenerator.prototype.makeCode = function(state) {
        const { returnVariable
                , callVariable
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            callVarStr : callVariable,
            numpyFunctionName: "T",
            paramStr: ``, 
            isPrintReturnVar: isReturnVariable
        }

        this.makeNumpyInstanceFunctionCode(codeObject);
    }
    return NpTCodeGenerator;
});
