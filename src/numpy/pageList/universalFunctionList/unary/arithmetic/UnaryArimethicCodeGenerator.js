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
                , dtype
                , funcId
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();
        const { paramOneArray, paramTwoArray, paramThreeArray, paramScalar, paramVariable } = paramData;
        
        var paramStr = this.mapParamToCode_type1(paramOption, paramData);

        var numpyFunctionName = ``;
        switch(funcId){
            case "JY300": {
                numpyFunctionName = `abs`;
                break;
            }
            case "JY301": {
                numpyFunctionName = `ceil`;
                break;
            }
            case "JY302": {
                numpyFunctionName = `exp`;
                break;
            }
            case "JY303": {
                numpyFunctionName = `fabs`;
                break;
            }
            case "JY304": {
                numpyFunctionName = `floor`;
                break;
            }
            case "JY305": {
                numpyFunctionName = `log`;
                break;
            }
            case "JY306": {
                numpyFunctionName = `log1p`;
                break;
            }
            case "JY307": {
                numpyFunctionName = `log2`;
                break;
            }
            case "JY308": {
                numpyFunctionName = `log10`;
                break;
            }
            case "JY309": {
                numpyFunctionName = `modf`;
                break;
            }
            case "JY310": {
                numpyFunctionName = `rint`;
                break;
            }
            case "JY311": {
                numpyFunctionName = `sqrt`;
                break;
            }
            case "JY312": {
                numpyFunctionName = `square`;
                break;
            }
        }

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: `${numpyFunctionName}`,
            paramStr: `${paramStr}`, 
            dtypeStr: dtype,
            isPrintReturnVar: isReturnVariable
        }
        this.makeNumpyFunctionCode(codeObject);
    }

    
    return UnaryArimethicCodeGenerator;
});
