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
     * @class NpConcatenateCodeGenerator
     * @constructor
    */
    var NpConcatenateCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpConcatenateCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);


    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     * @param {Obejct} state 
    */
    NpConcatenateCodeGenerator.prototype.makeCode = function(state) {
        const { paramOption
                , axis
                , paramData
                , returnVariable
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();
        const { paramOption1ParamVariable1
                , paramOption1ParamVariable2

                , paramOption2ParamVariable1
                , paramOption2ParamVariable2
                , paramOption2ParamVariable3

                , paramOption3ParamVariableArray } = paramData;

        var paramStr = ``;
        switch (paramOption) {
            // 2개의 배열을 합침
            case 1:{
                paramStr += `(${paramOption1ParamVariable1},${paramOption1ParamVariable2})`;
                break;
            }
            // 3개의 배열을 합칩
            case 2:{
                paramStr += `(${paramOption2ParamVariable1},${paramOption2ParamVariable2},${paramOption2ParamVariable3})`;
                break;
            }
            // n차원 배열
            case 3:{
                paramStr += `(`;
                paramOption3ParamVariableArray.forEach(param => {
                    paramStr += `${fixNumpyParameterValue(param)},`;
                });
                paramStr += `)`;
                break;
            }
        }

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: "concatenate",
            paramStr: `${paramStr}, axis = ${axis}`, 
            isPrintReturnVar: isReturnVariable
        }
        this.makeNumpyFunctionCodeNoDtype(codeObject);
    };

    return NpConcatenateCodeGenerator;
});
