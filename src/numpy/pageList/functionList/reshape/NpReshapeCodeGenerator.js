define ([
    'require'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/numpy/common/numpyCodeGenerator'
], function(requirejs, sb, 
            NumpyCodeGenerator) {
    "use strict";

    /**
     * @class NpReshapeCodeGenerator
     * @constructor
    */
    var NpReshapeCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpReshapeCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator 클래스의 makeCode 메소드 오버라이드
     * @param {Obejct} state 
     */
    NpReshapeCodeGenerator.prototype.makeCode = function(state) {
        const { paramOption
                , paramData
                , returnVariable
                , callVariable
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();

        var paramStr = ``;
        switch (paramOption) {
            case 1: {
                paramStr += `${paramData.paramOption1DataLength}`;
                break;
            }
            case 2: {
                paramStr += `${paramData.paramOption2DataRow},${paramData.paramOption2DataCol}`;
                break;
            }
            case 3: {
                paramStr += `${paramData.paramOption3DataRow},${paramData.paramOption3DataCol},${paramData.paramOption3DataDepth}`;
                break;
            }
            default: {
                break;
            }
        }

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            callVarStr : callVariable,
            numpyFunctionName: "reshape",
            paramStr: `${paramStr}`, 
            isPrintReturnVar: isReturnVariable
        }

        this.makeNumpyInstanceFunctionCode(codeObject);
    }

    return NpReshapeCodeGenerator;
});