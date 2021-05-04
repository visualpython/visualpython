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

    /**
     * @class NumpyImportCodegenerator
     * @constructor
    */
    var NumpyImportCodegenerator = function() {

    };
    /**
     * NumpyCodeGenerator 에서 상속
    */
    NumpyImportCodegenerator.prototype = Object.create(NumpyCodeGenerator.prototype);

    /**
     * NumpyCodeGenerator makeCode 메소드 오버라이드
     */
    NumpyImportCodegenerator.prototype.makeCode = function() {
        const { acronyms } = this.numpyStateGenerator.getStateAll();
        this.makeImportNumpyCode(acronyms);
    }
    
    return NumpyImportCodegenerator;
});
