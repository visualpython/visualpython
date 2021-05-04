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
     * @class LinearAlgebraCodeGenerator
     * @constructor
    */
    var LinearAlgebraCodeGenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    LinearAlgebraCodeGenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     */
    LinearAlgebraCodeGenerator.prototype.makeCode = function() {
        const {paramOption
                , paramData
                , returnVariable
                , isReturnVariable
                , funcId } = this.numpyStateGenerator.getStateAll();
        const { paramOneArray, paramTwoArray, paramThreeArray, paramScalar, paramVariable } = paramData;
     
        var paramStr = ``;
        switch (paramOption) {

            // 2차원 배열
            case 1:{
                sbCode.append(`[`);
                paramTwoArray.forEach(element => {
                    sbCode.append(`[`);
                    element.forEach(innerElement => {
                        sbCode.append(`${fixNumpyParameterValue(innerElement)},`);
                    });
                    sbCode.append(`],`);
                });
                sbCode.append(`]`);
                paramStr += sbCode.toString();
                sbCode.clear();
                break;
            }
            // 3차원 배열
            case 2:{
                sbCode.append(`[`);
                paramThreeArray.forEach(n2array => {
                    sbCode.append(`[`);
                    n2array.forEach(n1array => {
                        sbCode.append(`[`);
                        n1array.forEach(element => {
                            sbCode.append(`${fixNumpyParameterValue(element)},`);
                        });
                        sbCode.append(`],`);
                    });
                    sbCode.append(`],`);
                });
                sbCode.append(`]`);
                paramStr += sbCode.toString();
                sbCode.clear();
                break;
            }
            // 사용자 정의 파라미터 변수
            case 3:{
                paramStr += paramVariable;
                break;
            }
            default:{
                break;
            }
        }


        var numpyFunctionName = ``;
        switch(funcId){
            case 'JY339': {
                numpyFunctionName = `linalg.det`;
                break;
            }
            case 'JY340': {
                numpyFunctionName = `linalg.eig`;
                break;
            }
            case 'JY341': {
                numpyFunctionName = `linalg.svd`;
                break;
            }
            case 'JY342': {
                numpyFunctionName = `trace`;
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
    return LinearAlgebraCodeGenerator;
});
