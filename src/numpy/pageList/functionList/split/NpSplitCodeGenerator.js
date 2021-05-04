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
     * @class NpSplitCodeGenerator
     * @constructor
    */
    var NpSplitCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpSplitCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator 클래스의 makeCode 메소드 오버라이드
     * @param {Obejct} state 
     */
    NpSplitCodeGenerator.prototype.makeCode = function(state) {
        const { paramOption
                , paramData
                , returnVariable
                , axis
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();
        const { paramVariable,
                paramOption1DataLength, 
                paramOption2DataRow, paramOption2DataCol,
                paramOption3DataRow, paramOption3DataCol, paramOption3DataDepth,
                paramOption4DataArray } = paramData;
        var paramStr = ``;
        switch (paramOption) {
            case 1: {
                paramStr += `(${paramOption1DataLength})`;
                break;
            }
            case 2: {
                paramStr += `(${paramOption2DataRow},${paramOption2DataCol})`;
                break;
            }
            case 3: {
                paramStr += `(${paramOption3DataRow},${paramOption3DataCol},${paramOption3DataDepth})`;
                break;
            }
            case 4: {
                paramStr += `(`;
                paramOption4DataArray.forEach(param => {
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
            numpyFunctionName: "split",
            paramStr: `${paramVariable},${paramStr}, axis = ${axis}`, 
            isPrintReturnVar: isReturnVariable
        }

        this.makeNumpyFunctionCodeNoDtype(codeObject);
    }

    return NpSplitCodeGenerator;
});