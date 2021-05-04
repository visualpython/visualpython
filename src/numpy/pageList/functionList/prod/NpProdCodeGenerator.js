define ([
    'require'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/numpy/common/numpyCodeGenerator'
], function(requirejs, sb, 
            NumpyCodeGenerator) {

    "use strict";
    var sbCode = new sb.StringBuilder();

    /**
     * @class NpProdCodeGenerator
     * @constructor
    */
    var NpProdCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpProdCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     * @param {Obejct} state 
     */
    NpProdCodeGenerator.prototype.makeCode = function(state) {
        const { paramData
                , returnVariable
                , axis
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();
        const { paramVariable } = paramData;

        var paramStr = `${paramVariable}, axis = ${axis}`;

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: "prod",
            paramStr: `${paramStr}`, 
            isPrintReturnVar: isReturnVariable
        }
        this.makeNumpyFunctionCodeNoDtype(codeObject);
    }

    return NpProdCodeGenerator;
});
