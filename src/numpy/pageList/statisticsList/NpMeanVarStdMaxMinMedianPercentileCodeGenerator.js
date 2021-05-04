define ([
    'require'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    // Numpy 패키지용 import 라이브러리
    , 'nbextensions/visualpython/src/numpy/common/numpyCodeGenerator'
    , 'nbextensions/visualpython/src/numpy/api/numpyStateApi'
], function(requirejs, sb, 
            NumpyCodeGenerator,
            NumpyStateApi) {
    "use strict";
    var sbCode = new sb.StringBuilder();
    var { fixNumpyParameterValue } = NumpyStateApi;

    /**
     * @class NpArrayCodeGenerator
     * @constructor
    */
    var NpMeanVarStdMaxMinPercentileMedianCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpMeanVarStdMaxMinPercentileMedianCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     */
    NpMeanVarStdMaxMinPercentileMedianCodeGenerator.prototype.makeCode = function() {
        const { paramOption
                , paramData
                , returnVariable
                , isReturnVariable
                , funcId
                , axis
                , indexQ
                , dtype } = this.numpyStateGenerator.getStateAll();
                
        const { paramOneArray, paramTwoArray, paramThreeArray, paramScalar, paramVariable } = paramData;
        var paramStr = this.mapParamToCode_type1(paramOption, paramData);

        // 각 funcId에 맞게 라우팅 되어 코드 실행
        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: ``,
            paramStr: `${paramStr}`, 
            dtypeStr: ``,
            isPrintReturnVar: isReturnVariable
        }

        switch(funcId){
            case "JY200": {
                codeObject.numpyFunctionName = `mean`;
                codeObject.dtypeStr = dtype;
                this.makeNumpyFunctionCode(codeObject);
                break;
            }
            case "JY201": {
                codeObject.numpyFunctionName = `var`;
                codeObject.dtypeStr = dtype;
                this.makeNumpyFunctionCode(codeObject);
                break;
            }
            case "JY202": {
                codeObject.numpyFunctionName = `std`;
                codeObject.dtypeStr = dtype;
                this.makeNumpyFunctionCode(codeObject);
                break;
            }
            case "JY203": {
                codeObject.numpyFunctionName = `max`;
                delete codeObject.dtypeStr;
                this.makeNumpyFunctionCodeNoDtype(codeObject);
                break;
            }
            case "JY204": {
                codeObject.numpyFunctionName = `min`;
                delete codeObject.dtypeStr;
                this.makeNumpyFunctionCodeNoDtype(codeObject);
                break;
            }
            case "JY205": {
                codeObject.numpyFunctionName = `median`;
                delete codeObject.dtypeStr;
                this.makeNumpyFunctionCodeNoDtype(codeObject);
                break;
            }
            case "JY206": {
                codeObject.numpyFunctionName = `percentile`;
                codeObject.paramStr += `,${indexQ},axis=${axis}`;
                delete codeObject.dtypeStr;
                this.makeNumpyFunctionCodeNoDtype(codeObject);
                break;
            }
        }
    }

    return NpMeanVarStdMaxMinPercentileMedianCodeGenerator;
});