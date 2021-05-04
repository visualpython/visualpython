define ([
    'require'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    // Numpy 패키지용 import 라이브러리
    , 'nbextensions/visualpython/src/numpy/common/numpyCodeGenerator'
    , 'nbextensions/visualpython/src/numpy/api/numpyStateApi'
], function(requirejs, sb, 
            NumpyCodeGenerator,
            numpyStateApi) {
    "use strict";
    var sbCode = new sb.StringBuilder();
    var { fixNumpyParameterValue } = numpyStateApi;

    /**
     * @class BinaryArimethicCodeGenerator
     * @constructor
    */
    var BinaryArimethicCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    BinaryArimethicCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     */
    BinaryArimethicCodeGenerator.prototype.makeCode = function() {
        const { paramOption1
            , paramOption2
            , paramData
            , returnVariable
            , dtype
            , isReturnVariable
            , funcId } = this.numpyStateGenerator.getStateAll();

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

        var numpyFunctionName = ``;
        switch(funcId){
            case "JY313": {
                numpyFunctionName = `add`;
                break;
            }
            case "JY314": {
                numpyFunctionName = `divide`;
                break;
            }
            case "JY315": {
                numpyFunctionName = `floor_divide`;
                break;
            }
            case "JY316": {
                numpyFunctionName = `fmax`;
                break;
            }
            case "JY317": {
                numpyFunctionName = `fmin`;
                break;
            }
            case "JY318": {
                numpyFunctionName = `maximum`;
                break;
            }
            case "JY319": {
                numpyFunctionName = `minimum`;
                break;
            }
            case "JY320": {
                numpyFunctionName = `mod`;
                break;
            }
            case "JY321": {
                numpyFunctionName = `multiply`;
                break;
            }
            case "JY322": {
                numpyFunctionName = `power`;
                break;
            }
            case "JY323": {
                numpyFunctionName = `subtract`;
                break;
            }
        }

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: `${numpyFunctionName}`,
            paramStr: `${paramStr1} , ${paramStr2} `, 
            dtypeStr: dtype,
            isPrintReturnVar: isReturnVariable
        }

        this.makeNumpyFunctionCode(codeObject);
    }

    
    return BinaryArimethicCodeGenerator;
});
