define([], function() {

    /**
     * name / description / code
     * parameters / returns :
     * {
     * name
     * label
     * type		    var / str / num
     * var_type	
     * required		false
     * pair		    true
     * show		    true
     * component	input / option / option_bool
     * option
     * option_label
     * attributes: { title / value / class / data- }
     * }
     */

    var _PANDAS_FUNCTION = {
        'pd001': {
            name: 'Series',
            description: '동일한 데이터 타입의 1차원 배열 생성',
            code: '{return} = pd.Series({v})',
            parameters: [
                {
                    name: 'data',
                    label: 'Series data',
                    type: ['var'],
                    var_type: ['Series', 'list', 'dict'],
                    required: true,
                    pair: false
                },
                {
                    name: 'index',
                    label: 'Index',
                    type: ['var'],
                    var_type: ['list']
                },
                {
                    name: 'name',
                    label: 'Series name',
                    type: ['var', 'str']                  
                }
            ],
            returns: [
                {
                    type: ['var'],
                    var_type: ['Series'],
                    label: 'Return to'
                }
            ]
        },
        'pd002': {
            name: 'Dataframe',
            description: '2차원의 Table 형태 변수 생성',
            code: '{return} = pd.DataFrame({v})',
            parameters: [
                {
                    name: 'data',
                    label: 'DataFrame data',
                    type: ['var'],
                    var_type: ['DataFrame', 'list', 'dict'],
                    required: true,
                    pair: false
                },
                {
                    name: 'index',
                    label: 'index list',
                    type: ['var'],
                    var_type: ['list']
                },
                {
                    name: 'columns',
                    label: 'columns list',
                    type: ['var'],
                    var_type: ['list']          
                }
            ],
            returns: [
                {
                    type: ['var'],
                    var_type: ['DataFrame'],
                    label:'Return to'
                }
            ]
        },
        'pd003': {
            name: 'Index',
            description: '색인 객체 생성',
            code: '{return} = pd.Index({v})',
            parameters: [
                {
                    name: 'data',
                    label: 'Index data',
                    type: ['var'],
                    var_type: ['list', 'Series', 'Index'],
                    required: true,
                    pair: false
                },
                {
                    name: 'dtype',
                    label: 'numpy datatype',
                    type: ['str'],
                    component: 'option',
                    option: ['object', 'int32', 'int64', 'float32', 'float64', 'string', 'complex64', 'bool'],
                    option_label: ['객체', '정수형(32)', '정수형(64)', '실수형(32)', '실수형(64)', '문자형', '복소수(64bit)', 'bool형']
                },
                {
                    name: 'copy',
                    type: ['var'],
                    label: 'copy',
                    component: 'option_bool'
                },
                {
                    index: 3,
                    name: 'name',
                    type: ['var'],
                    label: 'Index name'
                },
                {
                    index: 4,
                    name: 'tupleize_cols',
                    type: ['bool'],
                    label: 'make MultiIndex',
                    component: 'option_bool'
                }
            ],
            returns: [
                {
                    type: ['var'],
                    var_type: ['Index'],
                    label:'Return to'
                }
            ]
        },
        'pd004': {
            name: 'read_csv',
            description: '',
            code: '{return} = pd.read_csv({v})',
            parameters: [
                {
                    name: 'path',
                    label: 'file path',
                    type: ['file'],
                    var_type: ['str'],
                    required: true,
                    paired: false
                },
                {
                    name: 'names',
                    label: 'columns name',
                    type: ['list']
                },
                {
                    name: 'usecols',
                    label: 'columns to use',
                    type: ['list']
                },
                {
                    name: 'index_col',
                    label: 'column as index',
                    type: ['str']
                },
                {
                    name: 'na_values',
                    label: 'na string values',
                    type: ['list']
                },
                {
                    name: 'header', 
                    label: 'header',
                    type: ['num']
                },
                {
                    name: 'sep',
                    label: 'seperator',
                    type: ['str']
                },
                {
                    name: 'skiprows',
                    label: 'rows to skip',
                    type: ['list']
                },
                {
                    name: 'chunksize',
                    label: 'chunksize',
                    type: ['num']
                }
            ]
        },
        'pd005': {
            name: 'to_csv',
            description: '',
            code: '{data}.to_csv({v})',
            parameters: [
                {
                    name: 'data',
                    label: 'Dataframe to export',
                    type: ['var'],
                    var_type: ['DataFrame', 'Series'],
                    required: true,
                    paired: false
                },
                {
                    name: 'path',
                    label: 'file path',
                    type: ['file'],
                    required: true,
                    paired: false
                },
                {
                    name: 'header',
                    label: 'header index',
                    type: ['bool', 'list', 'var'],
                    var_type: ['bool', 'list', 'Index', 'Series']
                },
                {
                    name: 'index',
                    label: 'show index',
                    type: ['bool'],
                    component: 'option_bool'
                },
                {
                    name: 'sep',
                    label: 'seperator',
                    type: ['str']
                },
                {
                    name: 'na_rep',
                    label: 'na replacement',
                    type: ['str']
                },
                {
                    name: 'columns',
                    label: 'columns',
                    type: ['list']
                }
            ]
        },
        'pd006': {
            name: 'select row',
            description: '',
            code: '{return} = {data}[{start}:{end}]',
            parameters: [
                {
                    name: 'data',
                    label: 'data',
                    type: ['var'],
                    var_type: ['DataFrame', 'Series'],
                    required: true,
                    paired: false
                },
                {
                    name: 'start',
                    label: 'start row index',
                    type: 'int',
                    paired: false
                },
                {
                    name: 'end',
                    label: 'end row index',
                    type: 'int',
                    paired: false
                }
            ],
            returns: [
                {
                    label: 'row variable name',
                    type: ['var']
                }
            ]
        },
        'pd007': {
            // TODO:
        }
    };

    return {
        _PANDAS_FUNCTION: _PANDAS_FUNCTION
    }
});