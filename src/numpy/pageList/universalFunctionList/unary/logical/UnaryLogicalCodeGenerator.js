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
     * @class UnaryArimethicCodeGenerator
     * @constructor
    */
    var UnaryArimethicCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    UnaryArimethicCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     */
    UnaryArimethicCodeGenerator.prototype.makeCode = function() {
        const { paramOption
                , paramData
                , returnVariable
                // , dtype
                , funcId
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();
        const { paramOneArray, paramTwoArray, paramThreeArray, paramScalar, paramVariable } = paramData;
        
        var paramStr = this.mapParamToCode_type1(paramOption, paramData);

        var numpyFunctionName = ``;
        switch(funcId){
            case "JY330": {
                numpyFunctionName = `all`;
                break;
            }
            case "JY331": {
                numpyFunctionName = `any`;
                break;
            }
            case "JY332": {
                numpyFunctionName = `isanan`;
                break;
            }
            case "JY333": {
                numpyFunctionName = `isfinite`;
                break;
            }
            case "JY334": {
                numpyFunctionName = `isinf`;
                break;
            }
            case "JY335": {
                numpyFunctionName = `isnan`;
                break;
            }
            case "JY336": {
                numpyFunctionName = `isneginf`;
                break;
            }
            case "JY337": {
                numpyFunctionName = `isposinf`;
                break;
            }
            case "JY338": {
                numpyFunctionName = `logical_not`;
                break;
            }
            default: {
                break;
            }
        }

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: `${numpyFunctionName}`,
            paramStr: `${paramStr}`, 
            isPrintReturnVar: isReturnVariable
        }
        this.makeNumpyFunctionCodeNoDtype(codeObject);
    }

    
    return UnaryArimethicCodeGenerator;
});
