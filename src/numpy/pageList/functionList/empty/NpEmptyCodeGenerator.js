define ([
    'require'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/numpy/common/numpyCodeGenerator'
    , 'nbextensions/visualpython/src/numpy/api/numpyStateApi'
], function(requirejs, sb, 
            NumpyCodeGenerator,
            numpyStateApi) {

    "use strict";
    var sbCode = new sb.StringBuilder();
    var { fixNumpyParameterValue } = numpyStateApi;
    /**
     * @class NpEmptyCodeGenerator
     * @constructor
    */
    var NpEmptyCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpEmptyCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     * @param {Obejct} state 
     */
    NpEmptyCodeGenerator.prototype.makeCode = function(state) {
        const { paramOption
                , paramData
                , returnVariable
                , dtype
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();

        var paramStr = ``;
        switch (paramOption) {
            case 1: {
                paramStr += `${fixNumpyParameterValue(paramData.paramOption1DataLength)}`;
                break;
            }
            case 2: {
                paramStr += `(${fixNumpyParameterValue(paramData.paramOption2DataRow)},${fixNumpyParameterValue(paramData.paramOption2DataCol)})`;
                break;
            }
            case 3: {
                paramStr += `(`;
                paramData.paramOption3DataArray.forEach(param => {
                    paramStr += `${fixNumpyParameterValue(param)},`;
                });
                paramStr += `)`;
                break;
            }
            default: {
                break;
            }
        }

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: "empty",
            paramStr: `${paramStr}`, 
            dtypeStr: dtype,
            isPrintReturnVar: isReturnVariable
        }

        this.makeNumpyFunctionCode(codeObject);
    }

    return NpEmptyCodeGenerator;
});
