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
     * @class NpDotCodeGenerator
     * @constructor
    */
    var NpDotCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpDotCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     * @param {Obejct} state 
     */
    NpDotCodeGenerator.prototype.makeCode = function(state) {
        const { paramOption1
                , paramOption2
                , paramData
                , returnVariable
                , dtype
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();

        const paramData1 = {
            paramVariable: paramData.paramVariable
            , paramScalar: paramData.paramScalar
            , paramOneArray: paramData.paramOneArray
            , paramTwoArray: paramData.paramTwoArray
            , paramThreeArray: paramData.paramThreeArray
        }

        const paramData2 = {
            param2Variable: paramData.param2Variable
            , param2Scalar: paramData.param2Scalar
            , param2OneArray: paramData.param2OneArray
            , param2TwoArray: paramData.param2TwoArray
            , param2ThreeArray: paramData.param2ThreeArray
        }

        var paramStr1 = this.mapParamToCode_type1(paramOption1, paramData1);
        var paramStr2 = this.mapParamToCode_type1(paramOption2, paramData2);

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: "dot",
            paramStr: `np.array(${paramStr1}) , np.array(${paramStr2}) `, 
            dtypeStr: dtype,
            isPrintReturnVar: isReturnVariable
        }

        this.makeNumpyFunctionCodeNoDtype(codeObject);
    }

    return NpDotCodeGenerator;
});
