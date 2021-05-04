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
     * @class NpLinalgInvCodeGenerator
     * @constructor
    */
    var NpLinalgInvCodeGenerator = function() {

    };

    /**
     * NumpyCodeGenerator 에서 상속
    */
    NpLinalgInvCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     * @param {Obejct} state 
     */
    NpLinalgInvCodeGenerator.prototype.makeCode = function(state) {
        const { paramOption
                , paramData
                , returnVariable
                , isReturnVariable } = this.numpyStateGenerator.getStateAll();
        const { paramVariable, paramTwoArray } = paramData;
        var paramStr = ``;
        // 파라미터 옵션에 따른 코드 실행 결정
        switch(paramOption) {
            case 1:{
                paramStr = `${paramVariable}`;
                break;
            }
            case 2:{
                sbCode.append(`[`);
                paramTwoArray.forEach(element => {
                    sbCode.append(`[`);
                    element.forEach(innerElement => {
                        sbCode.append(`${innerElement},`);
                    });
                    sbCode.append(`],`);
                });
                sbCode.append(`]`);
                paramStr += sbCode.toString();
                sbCode.clear();
                break;
            }
            default:{
                break;
            }
        }

        var codeObject = {
            returnVarStrOrNull: returnVariable, 
            numpyFunctionName: "linalg.inv",
            paramStr: `${paramStr}`, 
            isPrintReturnVar: isReturnVariable
        }

        this.makeNumpyFunctionCodeNoDtype(codeObject);
    }

    return NpLinalgInvCodeGenerator;
});
