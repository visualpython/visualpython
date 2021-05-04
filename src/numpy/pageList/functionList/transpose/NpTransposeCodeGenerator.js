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
     * @class NpTransposeCodeGenerator
     * @constructor
    */
    var NpTransposeCodeGenerator = function() {

    };

    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpTransposeCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     * @param {Obejct} state 
     */
    NpTransposeCodeGenerator.prototype.makeCode = function(state) {
        const { paramOption
                , paramData
                , returnVariable
                , dtype
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();
        const { paramVariable,
                paramOption1Axis1, paramOption1Axis2,
                paramOption2Axis1, paramOption2Axis2, paramOption2Axis3,
                paramOption3AxisArray } = paramData;

        var paramStr = ``;
        switch (paramOption) {
            case 1: {
                paramStr += `(${fixNumpyParameterValue(paramOption1Axis1)},${fixNumpyParameterValue(paramOption1Axis2)})`;
                break;
            }
            case 2: {
                paramStr += `(${fixNumpyParameterValue(paramOption2Axis1)},${fixNumpyParameterValue(paramOption2Axis2)},${fixNumpyParameterValue(paramOption2Axis3)})`;
                break;
            }
            case 3: {
                paramStr += `(`;
                paramOption3AxisArray.forEach(param => {
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
            numpyFunctionName: "transpose",
            paramStr: `${paramVariable},${paramStr}`, 
            isPrintReturnVar: isReturnVariable
        }

        this.makeNumpyFunctionCodeNoDtype(codeObject);
    }

    return NpTransposeCodeGenerator;
});
