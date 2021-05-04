define ([
    'require'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/numpy/common/numpyCodeGenerator'
], function(requirejs, sb, 
            NumpyCodeGenerator) {
    "use strict";

    /**
     * @class NpArangeCodeGenerator
     * @constructor
    */
    var NpArangeCodeGenerator = function() {

    };

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드 
     */
    NpArangeCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    NpArangeCodeGenerator.prototype.makeCode = function() {
        const { paramOption
                , paramData
                , returnVariable
                , dtype
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();

        var paramStr = ``;
        switch (paramOption) {
            case 1: {
                paramStr += `${paramData.paramOption1DataStart}`;
                break;
            }
            case 2: {
                paramStr += `${paramData.paramOption2DataStart},${paramData.paramOption2DataStop}`;
                break;
            }
            case 3: {
                paramStr += `${paramData.paramOption3DataStart},${paramData.paramOption3DataStop},${paramData.paramOption3DataStep}`;
                break;
            }
            default: {
                break;
            }
        }

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: "arange",
            paramStr: `${paramStr}`, 
            dtypeStr: dtype,
            isPrintReturnVar: isReturnVariable
        }

        this.makeNumpyFunctionCode(codeObject);
    }

    return NpArangeCodeGenerator;
});
