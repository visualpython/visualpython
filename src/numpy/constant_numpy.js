define([
    'require'

], function( requirejs ) {
    'use strict';

    /** 
     * Numpy 패키지 데이터 타입
     */
    const numpyDtypeArray = [
        {
            name: 'None',
            value: 'None'
        },
        {
            name: 'Int8',
            value: 'np.int8'
        },
        {
            name: 'Int16',
            value: 'np.int16'
        },
        {
            name: 'Int32',
            value: 'np.int32'
        },
        {
            name: 'Int64',
            value: 'np.int64'
        },
        {
            name: 'Intp',
            value: 'np.intp'
        },
        {
            name: 'uInt8',
            value: 'np.uint8'
        },
        {
            name: 'uInt16',
            value: 'np.uint16'
        },
        {
            name: 'uInt32',
            value: 'np.uint32'
        },
        {
            name: 'uInt64',
            value: 'np.uint64'
        },
        {
            name: 'Float16',
            value: 'np.float16'
        },
        {
            name: 'Float32',
            value: 'np.float32'
        },
        {
            name: 'Float64',
            value: 'np.float64'
        },
        {
            name: 'Bool',
            value: 'np.bool'
        },
        {
            name: 'String',
            value: 'np.string_'
        }
    ];
    /**
     * Numpy 패키지 데이터 타입
     * value 앞에 np가 빠진 버전
     */
    const numpyBriefDtype = [
        {
            name: 'None',
            value: 'None'
        },
        {
            name: 'Int8',
            value: 'int8'
        },
        {
            name: 'Int16',
            value: 'int16'
        },
        {
            name: 'Int32',
            value: 'int32'
        },
        {
            name: 'Int64',
            value: 'int64'
        },
        {
            name: 'uInt8',
            value: 'uint8'
        },
        {
            name: 'uInt16',
            value: 'uint16'
        },
        {
            name: 'uInt32',
            value: 'uint32'
        },
        {
            name: 'uInt64',
            value: 'uint64'
        },
        {
            name: 'Float16',
            value: 'float16'
        },
        {
            name: 'Float32',
            value: 'float32'
        },
        {
            name: 'Float64',
            value: 'float64'
        },
        {
            name: 'Complex64',
            value: 'complex64'
        },
        {
            name: 'Complex128',
            value: 'complex128'
        },
        {
            name: 'Complex256',
            value: 'complex256'
        },
        {
            name: 'Bool',
            value: 'bool'
        },
        {
            name: 'String',
            value: 'string_'
        },
        {
            name: 'Object',
            value: 'object'
        }
    ];

    const numpyComparisonoperator = [
        {
            name: '<',
            value: '<'
        },
        {
            name: '<=',
            value: '<='
        },
        {
            name: '>',
            value: '>'
        },
        {
            name: '=>',
            value: '=>'
        },
        {
            name: '==',
            value: '=='
        },
        {
            name: '!=',
            value: '!='
        }
    ]

    const numpyUnaryoperator = [
        {
            name: '&',
            value: '&'
        },
        {
            name: '~',
            value: '~'
        },
        {
            name: '@',
            value: '@'
        },
        {
            name: '|',
            value: '|'
        },
        {
            name: '||',
            value: '||'
        }
    ]

    const numpyAxisArray = [
        '0','1','2','3','4','5','6','7','8','9','10','-1','-2','-3','-4','-5','-6','-7','-8','-9'
    ];

    const numpyIndexN = [
        '0','1','2','3','4','5','6','7','8','9','10'
    ];

    const numpyTrueFalseArray = [ 
        'True'
        , 'False'
    ]

    const numpyRavelOrderArray = [ 
        'C'
        , 'F'
        , 'K'
    ]

    const numpyEnumRenderEditorFuncType = {
        PARAM_ONE_ARRAY_EDITOR_TYPE: 0,
        PARAM_TWO_ARRAY_EDITOR_TYPE: 1,
        PARAM_THREE_ARRAY_EDITOR_TYPE: 2,
        PARAM_INPUT_EDITOR_TYPE: 3,
        PARAM_ONE_ARRAY_INDEX_N_EDITOR_TYPE: 4,
        PARAM_INDEXING_EDITOR_TYPE: 5
    }
    
    const numpyOptionObj = {
        numpyDtypeArray
        , numpyAxisArray
        , numpyIndexN
        , numpyIndexValueArray: numpyIndexN
        , numpyComparisonoperator
        , numpyUnaryoperator
        , numpyEnumRenderEditorFuncType
        , numpyTrueFalseArray
        , numpyRavelOrderArray
    }

    const VP_ID_PREFIX = '#';
    const VP_CLASS_PREFIX = '.';

    // numpy패키지 path string
    const numpyBaseCssPath = 'numpy/index.css';

    // numpy패키지 const 상수 string
    const STR_NULL = '';
    const STR_NUMPY_HTML_URL_PATH = 'numpy/pageList/index.html';

    const NP_STR_NULL = '';
    const NP_STR_EVENTTYPE_CHANGE_KEYUP_PASTE = 'change keyup paste';

    const NP_STR_ARRAY_ENG = 'array';
    const NP_STR_ARANGE_ENG = 'arange';
    const NP_STR_CONCATENATE_ENG = 'concatenate';
    const NP_STR_COPY_ENG = 'copy';
    
    const NP_STR_NP_ARRAY_ENG = 'np.array';
    const NP_STR_NP_ARANGE_ENG = 'np.arange';
    const NP_STR_NP_CONCATENATE_ENG = 'np.concatenate';
    const NP_STR_NP_COPY_ENG = 'np.copy';
    
    const NP_STR_INPUTED_KOR = '입력된';
    const NP_STR_CODE_KOR = '코드';
    const NP_STR_INFORMATION_KOR = '정보';

    const STR_INPUT_NUMBER = 'input number';
    const STR_INPUT_VARIABLE = 'input variable';

    const STR_INPUT_NUMBER_KOR = 'Input Number';
    const STR_INPUT_VARIABLE_KOR = 'Input Variable';

    const STR_CHANGE_KEYUP_PASTE = 'change keyup paste';

    /** np array */
    const STATE_paramOneArray = 'paramOneArray';
    const STATE_paramTwoArray = 'paramTwoArray';
    const STATE_paramThreeArray = 'paramThreeArray';
    const STATE_paramScalar = 'paramScalar';
    const STATE_paramVariable = 'paramVariable';

    /** np arrange */
    const STATE_paramOption1DataStart = 'paramOption1DataStart';

    const STATE_paramOption2DataStart = 'paramOption2DataStart';
    const STATE_paramOption2DataStop = 'paramOption2DataStop';

    const STATE_paramOption3DataStart = 'paramOption3DataStart';
    const STATE_paramOption3DataStop = 'paramOption3DataStop';
    const STATE_paramOption3DataStep = 'paramOption3DataStep';
    return { 
        STR_NULL
        , STR_NUMPY_HTML_URL_PATH
        // numpy 패키지에 사용될 매직 데이터, 함수 객체 들
        , NUMPY_DTYPE: numpyDtypeArray
        , NUMPY_BRIEF_DTYPE: numpyBriefDtype
        , NUMPY_AXIS: numpyAxisArray
        , ENUM_NUMPY_RENDER_EDITOR_FUNC_TYPE: numpyEnumRenderEditorFuncType
        // numpy 패키지 파일 PATH
        , NUMPY_BASE_CSS_PATH : numpyBaseCssPath
        , NUMPY_OPTION_OBJ : numpyOptionObj
        // numpy 패키지에 사용될 매직 상수 들
        , NP_STR_NULL
        , NP_STR_EVENTTYPE_CHANGE_KEYUP_PASTE

        , NP_STR_ARRAY_ENG
        , NP_STR_ARANGE_ENG
        , NP_STR_CONCATENATE_ENG
        , NP_STR_COPY_ENG
        , NP_STR_NP_ARRAY_ENG
        , NP_STR_NP_ARANGE_ENG
        , NP_STR_NP_CONCATENATE_ENG
        , NP_STR_NP_COPY_ENG

        , NP_STR_INPUTED_KOR
        , NP_STR_CODE_KOR
        , NP_STR_INFORMATION_KOR

        , STR_CHANGE_KEYUP_PASTE
        , STR_INPUT_NUMBER
        , STR_INPUT_VARIABLE

        , STR_INPUT_NUMBER_KOR
        , STR_INPUT_VARIABLE_KOR

        , VP_ID_PREFIX
        , VP_CLASS_PREFIX

        , STATE_paramOneArray
        , STATE_paramTwoArray
        , STATE_paramThreeArray
        , STATE_paramScalar
        , STATE_paramVariable

        , STATE_paramOption1DataStart

        , STATE_paramOption2DataStart
        , STATE_paramOption2DataStop
    
        , STATE_paramOption3DataStart
        , STATE_paramOption3DataStop
        , STATE_paramOption3DataStep
    };
});

