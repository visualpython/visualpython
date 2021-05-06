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
     * @class BinaryComparatorCodeGenerator
     * @constructor
    */
    var BinaryComparatorCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    BinaryComparatorCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     */
    BinaryComparatorCodeGenerator.prototype.makeCode = function() {
        const { paramOption1
            , paramOption2
            , paramData
            , returnVariable

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
            case "JY324": {
                numpyFunctionName = `equal`;
                break;
            }
            case "JY325": {
                numpyFunctionName = `greater`;
                break;
            }
            case "JY326": {
                numpyFunctionName = `greater_equal`;
                break;
            }
            case "JY327": {
                numpyFunctionName = `less`;
                break;
            }
            case "JY328": {
                numpyFunctionName = `less_equal`;
                break;
            }
            case "JY329": {
                numpyFunctionName = `not_equal`;
                break;
            }
            default: {
                break;
            }
        }

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: `${numpyFunctionName}`,
            paramStr: `${paramStr1} , ${paramStr2} `, 
            isPrintReturnVar: isReturnVariable
        }

        this.makeNumpyFunctionCodeNoDtype(codeObject);
    }

    
    return BinaryComparatorCodeGenerator;
});
