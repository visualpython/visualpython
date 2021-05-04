define ([
    'require'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    // Numpy 패키지용 import 라이브러리
    , 'nbextensions/visualpython/src/numpy/common/numpyCodeGenerator'
    , 'nbextensions/visualpython/src/numpy/api/numpyStateApi'
], function(requirejs, sb, 
            NumpyCodeGenerator,
            numpyStateApi) {
    'use strict';
    var sbCode = new sb.StringBuilder();
    var { fixNumpyParameterValue } = numpyStateApi;

    /**
     * @class TrigonometricCodeGenerator
     * @constructor
    */
    var TrigonometricCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    TrigonometricCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     */
    TrigonometricCodeGenerator.prototype.makeCode = function() {
        const {paramOption
                , paramData
                , returnVariable
                , isReturnVariable
                , funcId } = this.numpyStateGenerator.getStateAll();
        const { paramOneArray, paramTwoArray, paramThreeArray, paramScalar, paramVariable } = paramData;

        var paramStr = this.mapParamToCode_type1(paramOption, paramData);

        var numpyFunctionName = ``;
        switch(funcId){
            case 'JY344': {
                numpyFunctionName = `sin`;
                break;
            }
            case 'JY345': {
                numpyFunctionName = `cos`;
                break;
            }
            case 'JY346': {
                numpyFunctionName = `tan`;
                break;
            }
            case 'JY347': {
                numpyFunctionName = `arcsin`;
                break;
            }
            case 'JY348': {
                numpyFunctionName = `arccos`;
                break;
            }
            case 'JY349': {
                numpyFunctionName = `arctan`;
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
    return TrigonometricCodeGenerator;
});
