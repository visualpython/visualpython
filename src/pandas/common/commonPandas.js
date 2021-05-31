define([
    'nbextensions/visualpython/src/common/constant'
], function (vpConst) {
    // TEST
    // pandas 함수 설정값
    /**
     * Replaced with
    '([a-zA-Z0-9_.]*)'[ ]*: (\{[\n\t ]*id:)[ ]*'([a-zA-Z0-9]*)'
    '$3': $2 '$1'
    */
    var _PANDAS_FUNCTION = {
        'pd001': {
            id: 'Series',
            name: 'Series',
            library: 'pandas',
            description: '동일한 데이터 타입의 1차원 배열 생성',
            code: '${o0} = pd.Series(${i0}${v})',
            input: [
                {
                    name:'i0',
                    type:['var', 'list', 'dict'],
                    label: 'Data'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to',
                    component: 'input_single'
                }
            ],
            variable: [
                {
                    name:'index',
                    type:'list',
                    label: 'Index'
                },
                {
                    name:'name',
                    type:'text',
                    label:'Series Name'
                }
            ]
        },
        'pd002': {
            id: 'Dataframe',
            name: 'DataFrame',
            library: 'pandas',
            description: '2차원의 Table 형태 변수 생성',
            code: '${o0} = pd.DataFrame(${i0}${v})',
            input: [
                {
                    name:'i0',
                    type:['var', 'list2d', 'dict'],
                    label: 'Data',
                    component: 'table'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'index',
                    type:'list',
                    label:'Index List'
                },
                {
                    name:'columns',
                    type:'list',
                    label:'Column List'
                }
            ]
        },
        'pd003': {
            id: 'Index',
            name: 'Index',
            library: 'pandas',
            description: '색인 객체 생성',
            code: '${o0} = pd.Index(${data}${v})',
            input: [
                {
                    name: 'data',
                    type: ['list', 'var'],
                    label: 'Data'
                }
            ],
            variable: [
                {
                    name: 'dtype',
                    type: 'var',
                    label: 'Numpy Dtype',
                    component: 'option_select',
                    options: ["'object'", 'None', "'int32'", "'int64'", "'float32'", "'float64'", "'string'", "'complex64'", "'bool'"],
                    options_label: ['객체', '선택 안 함', '정수형(32)', '정수형(64)', '실수형(32)', '실수형(64)', '문자형', '복소수(64bit)', 'bool형'],
                    default: "'object'"
                },
                {
                    name: 'copy',
                    type: 'bool',
                    label: 'Copy',
                    component: 'bool_checkbox',
                    default: false
                },
                {
                    name: 'name',
                    type: 'var',
                    label: 'Index Name'
                },
                {
                    name: 'tupleize_cols',
                    type: 'bool',
                    label: 'Create Multiindex',
                    default: true,
                    component: 'bool_checkbox'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]

        },
        'pd004': {
            id: 'read_csv',
            name: 'Read CSV',
            library: 'pandas',
            description: '파일의 데이터를 읽어 DataFrame으로 생성',
            code: '${o0} = pd.read_csv(${i0}${v})',
            input: [
                {
                    name:'i0',
                    type:'text',
                    label: 'File Path',
                    component: 'file'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'names',
                    type:'list',
                    label: 'Columns'
                },
                {
                    name:'usecols',
                    type: 'list',
                    label: 'Column List To Use'
                },
                {
                    name:'index_col',
                    type:'var',
                    label: 'Column To Use As Index'
                },
                {
                    name:'na_values',
                    type:'list',
                    label: 'Na Values'
                },
                {
                    name:'header',
                    type:'int',
                    label: 'Header Index'
                },
                {
                    name: 'sep',
                    type: 'text',
                    label: 'Seperator'
                },
                {
                    name: 'skiprows',
                    type: 'list',
                    label: 'Rows To Skip'
                },
                {
                    name: 'chunksize',
                    type: 'int',
                    label: 'Chunksize'
                }
            ]
        },
        'pd005': {
            id: 'to_csv',
            name: 'To CSV',
            library: 'pandas',
            description: 'DataFrame을 csv 파일로 작성',
            code: '${i0}.to_csv(${i1}${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name:'i1',
                    type:'text',
                    label: 'File Path',
                    component: 'file'
                }
            ],
            output: [
            ],
            variable: [
                {
                    name:'header',
                    type:['bool', 'list'],
                    label: 'Header Index',
                    default: 'True'
                },
                {
                    name: 'index',
                    type: 'bool',
                    label: 'Show Index',
                    default: true,
                    component: 'bool_checkbox'
                },
                {
                    name: 'sep',
                    type: 'text',
                    label: 'Seperator'
                },
                {
                    name: 'na_rep',
                    type: 'text',
                    label: 'Na Replacing Value'
                },
                {
                    name: 'columns',
                    type: 'list',
                    label: 'Columns'
                }
            ]
        },
        'pd006': {
            id: 'select_row',
            name: '행 선택',
            library: 'pandas',
            description: '행 선택해 조회',
            code: '${o0} = ${i0}[${i1}:${i2}]',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name:'i1',
                    type:'int',
                    label: 'Start Row',
                    required: false
                },
                {
                    name:'i2',
                    type:'int',
                    label: 'End Row',
                    required: false
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                },
            ],
            variable: [
            ]
        },
        'pd007': {
            id: 'select_column',
            name: '열 선택',
            library: 'pandas',
            description: '열 선택해 조회',
            code: '${o0} = ${i0}[${i1}]',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    var_type: ['DataFrame', 'Series'],
                    component: 'var_select'
                },
                {
                    name:'i1',
                    type:'list',
                    label: 'Columns',
                    required: false
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                },
            ],
            variable: [
            ]
        },
        'pd008': {
            id: 'merge',
            name: 'Merge',
            library: 'pandas',
            description: '두 객체를 병합',
            code: '${o0} = pd.merge(${i0}, ${i1}${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Left Dataframe',
                    component: 'var_select',
                    var_type: ['DataFrame']
                },
                {
                    name:'i1',
                    type:'var',
                    label: 'Right Dataframe',
                    component: 'var_select',
                    var_type: ['DataFrame']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'left_on',
                    type:'text',
                    label: 'Left Key'
                },
                {
                    name:'right_on',
                    type:'text',
                    label: 'Right Key'
                },
                {
                    name:'how',
                    type:'text',
                    label: 'Merge Type',
                    component: 'option_select',
                    options: ['left', 'right', 'inner', 'outer']
                },
                {
                    name:'sort',
                    type:'bool',
                    label: 'Sort'
                }
            ]
        },
        'pd009': {
            id: 'join',
            name: 'Join',
            library: 'pandas',
            description: '다수의 객체를 병합',
            code: '${o0} = ${i0}.join(${i1}${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame']
                },
                {
                    name:'i1',
                    type:'var',
                    label: 'Dataframe To Join',
                    component: 'var_select',
                    var_type: ['DataFrame']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'on',
                    type:'text',
                    label: 'Key'
                },
                {
                    name:'how',
                    type:'text',
                    label: 'Type',
                    component: 'option_select',
                    options: ['left', 'right', 'inner', 'outer']
                },
                {
                    name:'sort',
                    type:'bool',
                    label: 'Sort',
                    component: 'bool_checkbox'
                },
                {
                    name:'lsuffix',
                    type:'text',
                    label: 'Left Suffix'
                },
                {
                    name:'rsuffix',
                    type:'text',
                    label: 'Right Suffix'
                }
            ]
        },
        'pd010': {
            id: 'concat',
            name: 'Concat',
            library: 'pandas',
            description: '다수의 객체를 병합',
            code: '${o0} = pd.concat([${i0}]${v})',
            guide: [
                's1 = pd.Series([0, 1],    index=["a", "b"])',
                's2 = pd.Series([2, 3, 4], index=["c", "d", "e"])',
                '_concat = pd.concat([s1, s2], keys=["one", "two"], axis=1, sort=False, join="outer")',
                '_concat'
            ],
            input: [
                {
                    name:'i0',
                    type:'list',
                    label: 'Target Variable',
                    component: 'var_multi',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'index',
                    type:'list',
                    label:'Index List'
                },
                {
                    name:'axis',
                    type:'int',
                    label:'Axis',
                    help:'0:row / 1:column',
                    options:[0, 1],
                    options_label:['row', 'column'],
                    component:'option_select'
                },
                {
                    name:'sort',
                    type:'bool',
                    label:'Sort',
                    component: 'bool_checkbox'
                },
                {
                    name:'join',
                    type:'text',
                    label:'Join',
                    options: ['inner', 'outer'],
                    component: 'option_select'
                }
            ]
        },
        'pd011': {
            id: 'sort_index',
            name: 'Sort By Index',
            library: 'pandas',
            description: 'DataFrame/Series 객체를 index 기준으로 정렬',
            code: '${o0} = ${i0}.sort_index(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'axis',
                    type:'int',
                    label: 'Sort By',
                    help: '0:row / 1:column',
                    component: 'option_select',
                    default: 0,
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name:'ascending',
                    type:'bool',
                    label: 'Ascending Sort',
                    default: true,
                    component: 'bool_checkbox'
                },
                {
                    name:'inplace',
                    type:'bool',
                    label: 'Inplace',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'kind',
                    type: 'text',
                    label: 'Sort Kind',
                    default: 'quicksort',
                    component: 'option_select',
                    options: ['quicksort', 'mergesort', 'heapsort'],
                    options_label: ['quicksort', 'mergesort', 'heapsort']
                }
            ]
        },
        'pd012': {
            id: 'groupby',
            name: 'Group By',
            library: 'pandas',
            description: 'DataFrame/Series 객체의 그룹화',
            code: '${o0} = ${i0}.groupby(${level}${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name:'level',
                    type:['var', 'int', 'text'],
                    label: 'Grouping Column'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'axis',
                    type:'int',
                    label: 'Axis',
                    help: '0:row / 1:column',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name:'sort',
                    type:'bool',
                    label:'Sort',
                    component: 'bool_checkbox'
                }, 
                {
                    name: 'as_index',
                    type: 'bool',
                    label: 'Remove Index',
                    help: 'same as reset_index()',
                    component: 'bool_checkbox',
                    default: true
                }
            ]
        },
        'pd013': {
            id: 'period',
            name: 'Period',
            library: 'pandas',
            description: 'Period 객체 생성',
            code: '${o0} = pd.Period(${i0}${v})',
            input: [
                {
                    name:'i0',
                    type:['int', 'text'],
                    label: 'Date'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'freq',
                    label: 'Frequency',
                    type: 'var',
                    component: 'option_select',
                    options: ['s', 'T', 'H', 'D', 'B', 'W', 'W-MON', 'M'],
                    options_label: ['초', '분', '시간', '일', '주말이 아닌 평일', '주(일요일)', '주(월요일)', '각 달의 마지막 날']
                },
                {
                    index : 1,
                    name: 'year',
                    type: 'int',
                    label: 'Year'
                },
                {
                    index : 2,
                    name: 'month',
                    type: 'int',
                    label: 'Month'                
                },
                {
                    index : 3,
                    name: 'day',
                    type: 'int',
                    label: 'Day'
                }
            ]
        },
        'pd014': {
            id: 'dropna',
            name: 'Drop NA',
            library: 'pandas',
            description: 'dropna()로 결측치 처리',
            code: '${o0} = ${i0}.dropna(${v})',
            guide: [
                'from numpy import nan as NA',
                'data = Series([1, NA, 3.5, NA, 7])',
                'cleaned = data.dropna()'
            ],
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type:'int',
                    label: 'Axis',
                    help: '0:row / 1:column',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'how',
                    type: 'text',
                    label: 'How',
                    help: 'any: drop if na exist more than one\nall: drop if na exist every row/column',
                    component: 'option_select',
                    options: ['any', 'all']
                },
                {
                    name: 'thresh',
                    type: 'int',
                    label: 'Na Minimum Standard',
                    help: '결측치가 몇 개일 때 부터 제거할지 개수 입력'
                }
            ]
        },
        'pd015': {
            id: 'fillna',
            name: 'Fill NA',
            library: 'pandas',
            description: 'fillna()로 널 값 대체',
            code: '${o0} = ${i0}.fillna(${v})',
            guide: [
                'from numpy import nan as NA',
                'df = pd.DataFrame([[1,2,3,NA],[4,NA,1,2],[0,9,6,7]])',
                '# dictionary 형식으로 받았는데 앞의 key가 컬럼을 나타낸다',
                'df.fillna({1: 0.5, 3: -1})',
                '# fillna는 값을 채워 넣은 객체의 참조를 반환한다',
                '_ = df.fillna(0, inplace=True)'
            ],
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'value',
                    type: ['var', 'int', 'dict'],
                    label: 'Value To Fill'
                },
                {
                    name: 'axis',
                    type:'int',
                    label: 'Axis',
                    help: '0:row / 1:column',
                    component: 'option_select',
                    default: 0,
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'method',
                    type: 'var',
                    label: 'How',
                    help: 'ffill:fill with before value\nbfill:fill with after value',
                    component: 'option_select',
                    default: 'None',
                    options: ['None', "'ffill'", "'bfill'"],
                    options_label: ['선택 안 함', '이전 값으로 채우기', '이후 값으로 채우기']
                },
                {
                    name: 'inplace',
                    type: 'bool',
                    label: 'Inplace',
                    component: 'bool_checkbox'
                },
                {
                    name: 'limit',
                    type: 'int',
                    label: 'Gap Limit',
                    help: '전/후 보간 시에 사용할 최대 갭 크기'

                }
            ]
        },
        'pd016': {
            id: 'duplicated',
            name: 'Get Duplicates',
            library: 'pandas',
            description: '중복 조회',
            code: '${o0} = ${i0}.duplicated(${v})',
            guide: [
                'data.duplicated()'
            ],
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'keep',
                    type:'var',
                    label: 'Mark Duplicated When',
                    help: 'first:첫 번째 항목 뺀 모두 중복으로 표시 / last:마지막 항목 뺀 모두 중복으로 표시 / False:모두 중복으로 표시',
                    component: 'option_select',
                    default: "'first'",
                    options: ["'first'", "'last'", 'False'],
                    options_label: ['첫 번째 항목 제외한 모두 중복으로 표시', '마지막 항목 제외한 모두 중복으로 표시', '모두 중복으로 표시']
                }
            ]
        },
        'pd017': {
            id: 'drop_duplicates',
            name: 'Drop  Duplicates',
            library: 'pandas',
            description: '중복된 항목 제거',
            code: '${o0} = ${i0}.drop_duplicates(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'keep',
                    type:'var',
                    label: 'Mark Duplicated When',
                    help: 'first:첫 번째 항목 뺀 모두 중복으로 표시 / last:마지막 항목 뺀 모두 중복으로 표시 / False:모두 중복으로 표시',
                    component: 'option_select',
                    default: "'first'",
                    options: ["'first'", "'last'", 'False'],
                    options_label: ['첫 번째 항목 제외한 모두 중복으로 표시', '마지막 항목 제외한 모두 중복으로 표시', '모두 중복으로 표시']
                }
            ]
        },
        'pd018': {
            id: 'replace_scala',
            name: 'Scala Replace',
            library: 'pandas',
            description: 'Scala 값 치환',
            code: '${o0} = ${i0}.replace(${v})',
            guide: [
                `s = pd.Series([0, 1, 2, 3, 4])`,
                `s.replace(0, 5)`,
                `df = pd.DataFrame({'A': [0, 1, 2, 3, 4],`,
                `                   'B': [5, 6, 7, 8, 9],`,
                `                   'C': ['a', 'b', 'c', 'd', 'e']})`,
                `df.replace(0, 5)`
            ],
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'to_replace',
                    type:'int',
                    label: 'To Replace',
                    required: true
                },
                {
                    name:'value',
                    type:'int',
                    label: 'Replace Value',
                },
                {
                    name: 'method',
                    type:'var',
                    label: 'Method',
                    options: ["'ffill'", "'bfill'", 'None'],
                    options_label: ['이전 값으로 채우기', '이후 값으로 채우기', '선택 안 함'],
                    component: 'option_select',
                    default: "'ffill'"
                }
            ]
        },
        'pd019': {
            id: 'replace_list',
            name: 'List-like Replace',
            library: 'pandas',
            description: 'List 값 치환',
            code: '${o0} = ${i0}.replace(${v})',
            guide: [
                `df.replace([0, 1, 2, 3], 4)`,
                `df.replace([0, 1, 2, 3], [4, 3, 2, 1])`,
                `s.replace([1, 2], method='bfill')`
            ],
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'to_replace',
                    type:'list',
                    label: 'To Replace',
                    required: true
                },
                {
                    name:'value',
                    type:['int', 'list'],
                    label: 'Value',
                },
                {
                    name: 'method',
                    type:'var',
                    label: 'Method',
                    options: ["'ffill'", "'bfill'", 'None'],
                    options_label: ['이전 값으로 채우기', '이후 값으로 채우기', '선택 안 함'],
                    component: 'option_select',
                    default: "'ffill'"
                }
            ]
        },
        'pd020': {
            id: 'replace_dict',
            name: 'Dict-like Replace',
            library: 'pandas',
            description: 'Dictionary 값 치환',
            code: '${o0} = ${i0}.replace(${v})',
            guide: [
                `df.replace({0: 10, 1: 100})`,
                `df.replace({'A': 0, 'B': 5}, 100)`,
                `df.replace({'A': {0: 100, 4: 400}})`
            ],
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'to_replace',
                    type:'dict',
                    label: 'To Replace',
                    required: true
                },
                {
                    name:'value',
                    type:['int', 'dict'],
                    label: 'Value',
                },
                {
                    name: 'method',
                    type:'var',
                    label: 'Method',
                    options: ["'ffill'", "'bfill'", 'None'],
                    options_label: ['이전 값으로 채우기', '이후 값으로 채우기', '선택 안 함'],
                    component: 'option_select',
                    default: "'ffill'"
                }
            ]
        },
        // TODO: 정규식은 PENDING
        'pd021': {
            id: 'replace_regex',
            name: 'Regular Expression Replace',
            library: 'pandas',
            description: '정규식 치환',
            code: '${o0} = ${i0}.replace(${v})',
            guide: [
                `df = pd.DataFrame({'A': ['bat', 'foo', 'bait'],`,
                `                   'B': ['abc', 'bar', 'xyz']})`,
                `df.replace(to_replace=r'^ba.$', value='new', regex=True)`,
                `df.replace({'A': r'^ba.$'}, {'A': 'new'}, regex=True)`,
                `df.replace(regex=r'^ba.$', value='new')`,
                `df.replace(regex={r'^ba.$': 'new', 'foo': 'xyz'})`,
                `df.replace(regex=[r'^ba.$', 'foo'], value='new')`
            ],
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'to_replace',
                    type:'dict',
                    label: 'To Replace',
                    required: true
                },
                {
                    name:'value',
                    type:['text', 'dict'],
                    label: 'Value',
                },
                {
                    name: 'method',
                    type:'var',
                    label: 'Method',
                    options: ["'ffill'", "'bfill'", 'None'],
                    options_label: ['이전 값으로 채우기', '이후 값으로 채우기', '선택 안 함'],
                    component: 'option_select',
                    default: "'ffill'"
                },
                {
                    name: 'regex',
                    type:'bool',
                    label:'Regex',
                    options: [true, false]
                }
            ]
        },
        'pd022': {
            id: 'sum',
            name: 'Sum',
            library: 'pandas',
            description: '합계 계산',
            code: '${o0} = ${i0}.sum(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    description: '연산을 수행할 축. DataFrame에서 0은 로우고 1은 칼럼이다.',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'skipna',
                    type: 'bool',
                    label: 'Skip Na Value',
                    description: '누락된 값을 제외할 것인지 정하는 옵션. 기본값은 True다.',
                    component: 'bool_checkbox',
                    default: true
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level',
                    description: '계산하려는 축이 계층적 색인(다중 색인)이라면 레벨에 따라 묶어서 계산한다.'
                }
            ]
        },
        'pd023': {
            id: 'mean',
            name: 'Mean',
            library: 'pandas',
            description: '평균 계산',
            code: '${o0} = ${i0}.mean(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    description: '연산을 수행할 축. DataFrame에서 0은 로우고 1은 칼럼이다.',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'skipna',
                    type: 'bool',
                    label: 'Skip Na Value',
                    description: '누락된 값을 제외할 것인지 정하는 옵션. 기본값은 True다.',
                    component: 'bool_checkbox',
                    default: true
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level',
                    description: '계산하려는 축이 계층적 색인(다중 색인)이라면 레벨에 따라 묶어서 계산한다.'
                }
            ]
        },
        'pd024': {
            id: 'count',
            name: 'Count',
            library: 'pandas',
            description: 'NA 값을 제외한 값의 수를 계산',
            code: '${o0} = ${i0}.count(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    description: '연산을 수행할 축. DataFrame에서 0은 로우고 1은 칼럼이다.',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'skipna',
                    type: 'bool',
                    label: 'Skip Na Value',
                    description: '누락된 값을 제외할 것인지 정하는 옵션. 기본값은 True다.',
                    component: 'bool_checkbox',
                    default: true
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level',
                    description: '계산하려는 축이 계층적 색인(다중 색인)이라면 레벨에 따라 묶어서 계산한다.'
                }
            ]
        },
        'pd025': {
            id: 'max',
            name: 'Max',
            library: 'pandas',
            description: '최대값을 계산',
            code: '${o0} = ${i0}.max(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    description: '연산을 수행할 축. DataFrame에서 0은 로우고 1은 칼럼이다.',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'skipna',
                    type: 'bool',
                    label: 'Skip Na Value',
                    description: '누락된 값을 제외할 것인지 정하는 옵션. 기본값은 True다.',
                    component: 'bool_checkbox',
                    default: true
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level',
                    description: '계산하려는 축이 계층적 색인(다중 색인)이라면 레벨에 따라 묶어서 계산한다.'
                }
            ]
        },
        'pd026': {
            id: 'min',
            name: 'Min',
            library: 'pandas',
            description: '최소값을 계산',
            code: '${o0} = ${i0}.min(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    description: '연산을 수행할 축. DataFrame에서 0은 로우고 1은 칼럼이다.',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'skipna',
                    type: 'bool',
                    label: 'Skip Na Value',
                    description: '누락된 값을 제외할 것인지 정하는 옵션. 기본값은 True다.',
                    component: 'bool_checkbox',
                    default: true
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level',
                    description: '계산하려는 축이 계층적 색인(다중 색인)이라면 레벨에 따라 묶어서 계산한다.'
                }
            ]
        },
        'pd027': {
            id: 'median',
            name: 'Median',
            library: 'pandas',
            description: '중간값(50% 분위)을 계산',
            code: '${o0} = ${i0}.median(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    description: '연산을 수행할 축. DataFrame에서 0은 로우고 1은 칼럼이다.',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'skipna',
                    type: 'bool',
                    label: 'Skip Na Value',
                    description: '누락된 값을 제외할 것인지 정하는 옵션. 기본값은 True다.',
                    component: 'bool_checkbox',
                    default: true

                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level',
                    description: '계산하려는 축이 계층적 색인(다중 색인)이라면 레벨에 따라 묶어서 계산한다.'
                },
                {
                    name: 'numeric_only',
                    label: 'Numeric Only',
                    var_type: ['DataFrame'],
                    type: 'var',
                    component: 'option_select',
                    default: 'None',
                    options: ['None', "'false'", "'true'"],
                    options_label: ['선택 안 함', '모두 집계', '숫자만 집계']
                }
            ]
        },
        'pd028': {
            id: 'std',
            name: 'Std',
            library: 'pandas',
            description: '표본 정규 분산의 값을 계산',
            code: '${o0} = ${i0}.std(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    description: '연산을 수행할 축. DataFrame에서 0은 로우고 1은 칼럼이다.',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'skipna',
                    type: 'bool',
                    label: 'Skip Na Value',
                    description: '누락된 값을 제외할 것인지 정하는 옵션. 기본값은 True다.',
                    component: 'bool_checkbox',
                    default: true
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level',
                    description: '계산하려는 축이 계층적 색인(다중 색인)이라면 레벨에 따라 묶어서 계산한다.'
                },
                {
                    name: 'numeric_only',
                    label: 'Numeric Only',
                    var_type: ['DataFrame'],
                    type: 'var',
                    component: 'option_select',
                    default: 'None',
                    options: ['None', "'false'", "'true'"],
                    options_label: ['선택 안 함', '모두 집계', '숫자만 집계']
                }
            ]
        },
        'pd029': {
            id: 'quantile',
            name: 'Quantile',
            library: 'pandas',
            description: '0부터 1까지의 분위수를 계산',
            code: '${o0} = ${i0}.quantile(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'q',
                    type: ['float', 'list'],
                    label: 'Percentile', // 백분위수
                    placeholder: '(0 ~ 1)',
                    description: '',
                    default: 0.5
                },
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    description: '연산을 수행할 축. DataFrame에서 0은 로우고 1은 칼럼이다.',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'numeric_only',
                    label: 'Numeric Only',
                    var_type: ['DataFrame'],
                    type: 'var',
                    component: 'option_select',
                    options: ['False', 'True'],
                    options_label: ['모두 집계', '숫자만 집계']
                },
                {
                    name: 'interpolation',
                    label: 'Interpolation',
                    type: 'text',
                    component: 'option_select',
                    options: ['linear','lower', 'higher', 'nearest', 'midpoint'],
                    default: 'linear'
                }
            ]
        },
        'pd030': {
            id: 'drop',
            name: 'Drop Row/Column',
            library: 'pandas',
            description: '지정한 행/열을 삭제',
            code: '${o0} = ${i0}.drop(${i1}${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name:'i1',
                    type: ['var', 'int', 'text'],
                    label: 'Index',
                    // component: 'var_select',
                    var_type: ['column', 'index'],
                    var_para: ['i0']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'axis',
                    type:'int',
                    label:'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                }
            ]
        },
        'pd031': {
            id: 'date_range',
            name: 'date_range',
            library: 'pandas',
            description: '정규 날짜 시퀀스를 DatetimeIndex형 타임스탬프로 생성',
            code: '${o0} = pd.date_range(${v})',
            input: [
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'start',
                    label: 'Start Date',
                    placeholder: 'yyyy-MM-dd',
                    type: 'text'
                },
                {
                    name: 'end',
                    label: 'End Date',
                    placeholder: 'yyyy-MM-dd',
                    type: 'text'
                },
                {
                    name: 'periods',
                    type: 'int',
                    label: 'Periods',
                    help: 'input number of date index to create'
                },
                {
                    name: 'freq',
                    label: 'Frequency',
                    type: 'text',
                    component: 'option_select',
                    options: ['s', 'T', 'H', 'D', 'B', 'W', 'W-MON', 'MS', 'M', 'BMS', 'BM'],
                    options_label: ['초', '분', '시간', '일', '주말이 아닌 평일', '주(일요일)', '주(월요일)', '각 달의 첫날', '각 달의 마지막 날', '평일 중 각 달의 첫날', '평일 중 각 달의 마지막 날']
                }
            ]
        },
        'pd032': {
            id: 'sort_values',
            name: 'Sort By Values',
            library: 'pandas',
            description: 'Series/DataFrame의 데이터를 기준으로 정렬',
            code: '${o0} = ${i0}.sort_values(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'by',
                    type: ['list', 'text'],
                    label: 'Sort By',
                    required: true
                },
                {
                    name:'axis',
                    type:'int',
                    label: 'Axis',
                    help: '0:Row / 1:Column',
                    component: 'option_select',
                    default: 0,
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name:'ascending',
                    type:'bool',
                    label: 'Ascending',
                    component: 'bool_checkbox',
                    default: true
                },
                {
                    name:'inplace',
                    type:'bool',
                    label: 'Inplace',
                    component: 'bool_checkbox',
                    default: false
                },
                {
                    name: 'kind',
                    type: 'text',
                    label: 'Sort Type',
                    component: 'option_select',
                    default: 'quicksort',
                    options: ['quicksort', 'mergesort', 'heapsort'],
                    options_label: ['퀵정렬', '합병정렬', '힙정렬']
                }
            ]
        },
        'pd033': {
            id: 'isnull',
            name: 'Is Null',
            library: 'pandas',
            description: 'Series/DataFrame의 결측치 탐색',
            code: '${o0} = pd.isnull(${i0})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to',
                    help: '결측치 여부를 마스킹한 DataFrame/Series'
                }
            ],
            variable: [
            ]
        },
        'pd034': {
            id: 'notnull',
            name: 'Not Null',
            library: 'pandas',
            description: 'Series/DataFrame의 결측치가 아닌 값을 탐색',
            code: '${o0} = pd.notnull(${i0})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to',
                    help: '결측치가 아닌 값을 마스킹한 DataFrame/Series'
                }
            ],
            variable: [
            ]
        },
        'pd035': {
            id: '.T',
            name: 'Transpose',
            library: 'pandas',
            description: '행/열을 바꿔 조회',
            code: '${o0} = ${i0}.T',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Index']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd036': {
            id: '.columns',
            name: 'Columns 조회',
            library: 'pandas',
            description: '열 목록 조회',
            code: '${o0} = ${i0}.columns',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd037': {
            id: '.index',
            name: 'index 조회',
            library: 'pandas',
            description: '행 목록 조회',
            code: '${o0} = ${i0}.index',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd038': {
            id: '.values',
            name: 'Values 조회',
            library: 'pandas',
            description: '내부 값들만 조회',
            code: '${o0} = ${i0}.values',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Index']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd039': {
            id: '.name',
            name: 'name 조회',
            library: 'pandas',
            description: '객체의 이름 조회',
            code: '${o0} = ${i0}.name',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['Series']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd040': {
            id: 'loc',
            name: 'Loc',
            library: 'pandas',
            description: 'index 이름으로 행 선택',
            code: '${o0} = ${i0}.loc[${i1}]',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name: 'i1',
                    type: ['text', 'list'],
                    label: 'Row/Column Name To Find'
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd041': {
            id: 'iloc',
            name: 'iLoc',
            library: 'pandas',
            description: 'index 위치로 행 선택',
            code: '${o0} = ${i0}.iloc[${i1}]',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name: 'i1',
                    type: ['text', 'list'],
                    label: 'row/column to count'
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd042': {
            id: '.array',
            name: 'array 조회',
            library: 'pandas',
            description: '객체의 배열 조회',
            code: '${o0} = ${i0}.array',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['Series', 'Index']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd043': {
            id: '.axes',
            name: 'axes 조회',
            library: 'pandas',
            description: 'Series의 인덱스 조회',
            code: '${o0} = ${i0}.axes',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['Series']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd044': {
            id: '.hasnans',
            name: 'hasnans 조회',
            library: 'pandas',
            description: 'NAN 값을 갖고 있는지 여부를 확인',
            code: '${o0} = ${i0}.hasnans',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['Series', 'Index']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd045': {
            id: '.shape',
            name: 'shape 조회',
            library: 'pandas',
            description: '객체의 행/열 크기를 튜플 형태로 반환',
            code: '${o0} = ${i0}.shape',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['Series', 'Index']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd046': {
            id: '.dtype',
            name: 'dtype 조회',
            library: 'pandas',
            description: 'Index 객체의 데이터타입 조회',
            code: '${o0} = ${i0}.dtype',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['Index']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd047': {
            id: 'len',
            name: '크기 조회',
            library: 'pandas',
            description: '배열 객체의 길이 조회',
            code: '${o0} = len(${i0})',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Index']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd048': {
            id: 'unique',
            name: '고유값 조회',
            library: 'pandas',
            description: '객체의 고유값 목록을 조회',
            code: '${o0} = ${i0}.unique()',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['Series', 'Index']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd049': {
            id: 'value_counts',
            name: '데이터 개수 조회',
            library: 'pandas',
            description: '각 데이터별 개수 집계',
            code: '${o0} = ${i0}.value_counts()',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['Series', 'Index']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd050': {
            id: 'info',
            name: '기본 정보 조회',
            library: 'pandas',
            description: 'DataFrame 객체의 정보(컬럼별 정보, 데이터타입, 메모리 사용량 등) 조회',
            code: '${o0} = ${i0}.info()',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd051': {
            id: 'describe',
            name: '기본 상세정보 조회',
            library: 'pandas',
            description: 'DataFrame/Series 객체의 행/열별 집계 연산',
            code: '${o0} = ${i0}.describe()',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd052': {
            id: 'add',
            name: 'Add 산술연산',
            library: 'pandas',
            description: 'DataFrame/Series의 덧셈연산',
            code: '${o0} = ${i0}.add(${i1}${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name:'i1',
                    type:['var', 'int'],
                    label: 'Adding Object',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['Row(index)', 'Col(columns)']
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level'
                },
                {
                    name: 'fill_value',
                    type: 'float',
                    label: 'Fill Value'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd053': {
            id: 'sub',
            name: 'Sub 산술연산',
            library: 'pandas',
            description: 'DataFrame/Series의 뺄셈연산',
            code: '${o0} = ${i0}.sub(${i1}${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name:'i1',
                    type:['var', 'int'],
                    label: 'Subtracting Object',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['행(index)', '열(columns)']
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level'
                },
                {
                    name: 'fill_value',
                    type: 'float',
                    label: 'Fill Value'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd054': {
            id: 'div',
            name: 'Div 산술연산',
            library: 'pandas',
            description: 'DataFrame/Series의 나눗셈연산',
            code: '${o0} = ${i0}.div(${i1}${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name:'i1',
                    type:['var', 'int'],
                    label: 'Dividing Object',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['행(index)', '열(columns)']
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level'
                },
                {
                    name: 'fill_value',
                    type: 'float',
                    label: 'Fill Value'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd055': {
            id: 'mul',
            name: 'Mul 산술연산',
            library: 'pandas',
            description: 'DataFrame/Series의 곱셈연산',
            code: '${o0} = ${i0}.mul(${i1}${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name:'i1',
                    type:['var', 'int'],
                    label: 'DataFrame/Series',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['행(index)', '열(columns)']
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level'
                },
                {
                    name: 'fill_value',
                    type: 'float',
                    label: 'Fill Value'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd056': {
            id: 'insert_column',
            name: 'Insert Column',
            library: 'pandas',
            description: 'DataFrame의 열 추가',
            code: '${o0} = ${i0}.insert(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame']
                }
            ],
            variable: [
                {
                    name: 'loc',
                    type: 'int',
                    label: 'Location',
                    required: true
                },
                {
                    name: 'column',
                    type: ['int', 'text', 'var', 'dict'],
                    label: 'Column Name',
                    required: true
                },
                {
                    name: 'value',
                    type: ['int', 'var', 'list'],
                    label: 'Value',
                    required: true
                },
                {
                    name: 'allow_duplicates',
                    label: 'Allow Duplicates',
                    type: 'bool',
                    default: false,
                    component: 'bool_checkbox'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd057': {
            id: 'insert_column_value',
            name: 'Insert Column Value',
            library: 'pandas',
            description: 'DataFrame의 열 추가',
            code: '${i0}[${i1}] = ${i2}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame']
                },
                {
                    name:'i1',
                    type:'text',
                    label: 'Column Name',
                    var_type: ['columns']
                },
                {
                    name:'i2',
                    type: ['var', 'int', 'text', 'list'],
                    label: 'Value'
                }
            ],
            variable: [],
            output: []
        },
        'pd058': {
            id: 'insert_row_loc',
            name: 'Insert Row Value',
            library: 'pandas',
            description: 'DataFrame의 행 추가',
            code: '${i0}.loc[${i1}] = ${i2}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame']
                },
                {
                    name:'i1',
                    type:['int', 'text'],
                    label: 'Row Name/Index',
                    var_type: ['index']
                },
                {
                    name:'i2',
                    type: ['var', 'int', 'text', 'list'],
                    label: 'Value'
                }
            ],
            variable: [],
            output: []
        },
        'pd059': {
            id: '.groups',
            name: 'Groups',
            library: 'pandas',
            description: 'GroupBy 객체의 groups 조회',
            code: '${o0} = ${i0}.groups',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'GroupBy Object',
                    component: 'var_select',
                    var_type: ['GroupBy']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd060': {
            id: 'reindex',
            name: 'Reindex',
            library: 'pandas',
            description: 'DataFrame/Series/Index의 index를 수정',
            code: '${o0} = ${i0}.reindex(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Index']
                }
            ],
            variable: [
                {
                    name: 'labels',
                    type: 'list',
                    label: 'New Labels'
                },
                {
                    name: 'index',
                    type: 'list',
                    label: 'New Indexes'
                },
                {
                    name: 'columns',
                    type: 'list',
                    label: 'New Columns'
                },
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    options: [0, 1],
                    options_label: ['row', 'column'],
                    component: 'option_select'
                },
                {
                    name: 'method',
                    type: 'text',
                    label: 'Method',
                    help: 'ffill:이전 값으로 채우기\nbfill:뒤에 있는 값으로 채우기',
                    component: 'option_select',
                    options: ['ffill', 'bfill', 'nearest'],
                    options_label: ['이전 값으로 채우기', '이후 값으로 채우기', '가장 가까운 값으로 채우기']
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd061': {
            id: 'set_index',
            name: 'Set Index Values',
            library: 'pandas',
            description: 'DataFrame의 column을 이용해 index를 생성',
            code: '${o0} = ${i0}.set_index(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame']
                }
            ],
            variable: [
                {
                    name: 'keys',
                    type: ['text', 'list'],
                    label: 'Keys',
                    required: true
                },
                {
                    name: 'drop',
                    type: 'bool',
                    label: 'Drop',
                    default: true,
                    component: 'bool_checkbox'
                },
                {
                    name: 'append',
                    type: 'bool',
                    label: 'Append',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'inplace',
                    type: 'bool',
                    label: 'Inplace',
                    default: false,
                    component: 'bool_checkbox'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd062': {
            id: 'reset_index',
            name: 'Reset Index Values',
            library: 'pandas',
            description: 'DataFrame/Series의 index를 이용해 column을 생성',
            code: '${o0} = ${i0}.reset_index(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            variable: [
                {
                    name: 'level',
                    type: ['int', 'text', 'list'],
                    label: 'Level',
                    default: 'None'
                },
                {
                    name: 'drop',
                    type: 'bool',
                    label: 'Drop',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'inplace',
                    type: 'bool',
                    label: 'Inplace',
                    default: false,
                    component: 'bool_checkbox'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Return to'
                }
            ]
        },
        'pd063': {
            id: 'edit_row_data',
            name: 'Edit Row Data',
            library: 'pandas',
            description: 'DataFrame/Series/Index객체의 index 데이터 수정',
            code: '${i0}[${i1}] = ${i2}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name: 'i1',
                    type: 'var',
                    label: 'Column Name',
                },
                {
                    name: 'i2',
                    type: ['var', 'list', 'text', 'int'],
                    label: 'Value'
                }
            ],
            variable: [],
            output: []  
        },
        'pd064': {
            id: 'head',
            name: 'Head',
            library: 'pandas',
            description: '첫 n줄의 데이터 확인',
            code: '${o0} = ${i0}.head(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            variable: [
                {
                    name: 'n',
                    type: 'int',
                    label: 'Count',
                    default: 5
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        },
        'pd065': {
            id: 'tail',
            name: 'Tail',
            library: 'pandas',
            description : '마지막 n줄의 데이터 확인',
            code: '${o0} = ${i0}.tail(${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            variable: [
                {
                    name: 'n',
                    type: 'int',
                    label: 'Count',
                    default: 5
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        },
        'pd066': {
            id: 'take',
            name: 'Take',
            library: 'pandas',
            description: 'index로 데이터 조회',
            code: '${o0} = ${i0}.take(${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Index']
                },
                {
                    name: 'i1',
                    type: 'list',
                    label: 'Search Index'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    options: [0, 1, 'None'],
                    options_label: ['행', '열', '선택 안 함'],
                    component: 'option_select',
                    default: 0
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        },
        'pd067': {
            id: 'op_add',
            name: '+',
            library: 'pandas',
            description: '변수 덧셈 연산',
            code: '${o0} = ${i0} + ${i1}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Variable 1'
                },
                {
                    name:'i1',
                    type:'var',
                    label: 'Variable 2'
                }
            ],
            variable: [],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        },
        'pd068': {
            id: 'op_sub',
            name: '-',
            library: 'pandas',
            description: '변수 뺄셈 연산',
            code: '${o0} = ${i0} - ${i1}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Variable 1'
                },
                {
                    name:'i1',
                    type:'var',
                    label: 'Variable 2'
                }
            ],
            variable: [],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        },
        'pd069': {
            id: 'op_mul',
            name: '*',
            library: 'pandas',
            description: '변수 곱셈 연산',
            code: '${o0} = ${i0} * ${i1}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Variable 1'
                },
                {
                    name:'i1',
                    type:'var',
                    label: 'Variable 2'
                }
            ],
            variable: [],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        },
        'pd070': {
            id: 'op_pow',
            name: '**',
            library: 'pandas',
            description: '변수 n승 연산',
            code: '${o0} = ${i0} ** ${i1}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Variable 1'
                },
                {
                    name:'i1',
                    type:'var',
                    label: 'Variable 2'
                }
            ],
            variable: [],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        },
        'pd071': {
            id: 'op_div',
            name: '/',
            library: 'pandas',
            description: '변수 나눗셈 연산',
            code: '${o0} = ${i0} / ${i1}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Variable 1'
                },
                {
                    name:'i1',
                    type:'var',
                    label: 'Variable 2'
                }
            ],
            variable: [],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        },
        'pd072': {
            id: 'op_mod',
            name: '//',
            library: 'pandas',
            description: '변수 나눗셈(몫) 연산',
            code: '${o0} = ${i0} // ${i1}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Variable 1'
                },
                {
                    name:'i1',
                    type:'var',
                    label: 'Variable 2'
                }
            ],
            variable: [],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        },
        'pd073': {
            id: 'op_mod_left',
            name: '%',
            library: 'pandas',
            description: '변수 나눗셈(나머지) 연산',
            code: '${o0} = ${i0} % ${i1}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Variable 1'
                },
                {
                    name:'i1',
                    type:'var',
                    label: 'Variable 2'
                }
            ],
            variable: [],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        },
        'pd074': {
            id: 'bool',
            name: 'bool',
            library: 'pandas',
            description: 'bool형 연산',
            code: '${o0} = ${i0} ${i2} ${i1}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Variable 1'
                },
                {
                    name:'i1',
                    type:'var',
                    label: 'Variable 2'
                },
                {
                    name:'i2',
                    type:'var',
                    label: 'Operator',
                    component: 'option_select',
                    options: ['==', '!=', '<', '<=', '>', '>=']
                }
            ],
            variable: [],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                },
            ]
        },
        'pd075': {
            id: 'copy',
            name: 'copy',
            library: 'pandas',
            description: '데이터 복사',
            code: '${o0} = ${i0}.copy(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Index']
                }
            ],
            variable: [
                {
                    name: 'deep',
                    type: 'bool',
                    label: 'Deep',
                    default: true,
                    component: 'bool_checkbox'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        },
        'pd076': {
            id: 'read_json',
            name: 'Read Json',
            library: 'pandas',
            description: 'json형식 파일을 읽어 DataFrame/Series로 생성',
            code: '${o0} = pd.read_json(${i0}${v})',
            input: [
                {
                    name:'i0',
                    type:'text',
                    label: 'File Path',
                    component: 'file'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name:'typ',
                    type:'text',
                    label: 'Type',
                    component: 'option_select',
                    options: ['frame', 'series'],
                    default: 'frame'
                },
                {
                    name: 'orient',
                    type: 'text',
                    label: 'JSON Orient',
                    options: ['split', 'records', 'index', 'columns', 'values', 'table'],
                    default: 'columns' // typ=series일 경우, index가 default
                },
                {
                    name:'convert_dates',
                    type: 'list',
                    label: 'Convert Dates'
                },
                {
                    name:'index_col',
                    type:'text',
                    label: 'Indexing Column'
                },
                {
                    name: 'encoding',
                    type: 'text',
                    label: 'Encoding',
                    default: 'utf-8'
                },
                {
                    name: 'chunksize',
                    type: 'int',
                    label: 'Chunk Size'
                }
            ]
        },
        'pd077': {
            id: 'to_json',
            name: 'To Json',
            library: 'pandas',
            description: 'DataFrame/Series 데이터로 Json 파일 생성',
            code: '${o0} = ${i0}.to_json(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'path_or_buf',
                    type: 'text',
                    label: 'file path/variable'
                }, 
                {
                    name: 'orient',
                    type: 'text',
                    label: 'Orient',
                    // options: series 객체일 경우 0~3 / dataframe 객체는 모두
                    options: ['split', 'records', 'index', 'table', 'columns', 'values']
                }
            ]
        },
        'pd078': {
            id: 'to_pickle',
            name: 'To Pickle',
            library: 'pandas',
            description: 'DataFrame/Series 데이터로 Pickle 파일 생성',
            code: '${i0}.to_pickle(${path})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name: 'path',
                    type: 'text',
                    label: 'file path/variable',
                    required: true
                }
            ],
            variable: [
                
            ]
        },
        'pd079': {
            id: 'read_pickle',
            name: 'Read Pickle',
            library: 'pandas',
            description: 'Pickle 파일에서 Pandas 객체 복구',
            code: '${o0} = pd.read_pickle(${i0}${v})',
            input: [
                {
                    name: 'i0',
                    type: 'text',
                    label: 'file path/object',
                    component: 'file'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
            ]
        },
        'pd080': {
            id: 'combine_first',
            name: 'Combine First',
            library: 'pandas',
            description: '참조 객체의 동일한 위치의 값을 결측치 대체값으로 사용',
            code: '${o0} = ${i0}.combine_first(${i1})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name: 'i1',
                    type:'var',
                    label: 'Combine Object',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [ ]
        },
        'pd081': {
            id: 'stack',
            name: 'Stack',
            library: 'pandas',
            description: 'DataFrame의 컬럼을 인덱스층에 추가',
            code: '${o0} = ${i0}.stack(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'level',
                    type: ['int', 'text', 'list'],
                    label: 'Level',
                    default: -1,
                },
                {
                    name: 'dropna',
                    type: 'bool',
                    label: 'Drop Na',
                    default: true,
                    component: 'bool_checkbox'
                }
            ]
        },
        'pd082': {
            id: 'unstack',
            name: 'Unstack',
            library: 'pandas',
            description: '계층적 인덱스 중 특정계층의 index를 컬럼으로 변환',
            code: '${o0} = ${i0}.unstack(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'level',
                    type: ['int', 'text', 'list'],
                    label: 'Level',
                    default: -1,
                },
                {
                    name: 'fill_value',
                    type: ['int', 'text', 'var', 'dict'],
                    label: 'Fill Value'
                }
            ]
        },
        'pd083': {
            id: 'pivot',
            name: 'Pivot',
            library: 'pandas',
            description: '행 데이터를 열 데이터로 회전해 데이터 재구조화',
            code: '${o0} = ${i0}.pivot(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'index',
                    type: ['text', 'var'],
                    label: 'Index'
                },
                {
                    name: 'columns',
                    type: ['text', 'var'],
                    label: 'Columns'
                },
                {
                    name: 'values',
                    type: ['text', 'var', 'list'],
                    label: 'Values'
                }
            ]
        },
        'pd084': {
            id: 'melt',
            name: 'Melt',
            library: 'pandas',
            description: '특정컬럼과 데이터를 variable과 value 형태로 재구조화',
            code: '${o0} = ${i0}.melt(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'id_vars',
                    type: ['var', 'list'],
                    label: 'Id Variables'
                },
                {
                    name: 'value_vars',
                    type: ['var', 'list'],
                    label: 'Value Variables'
                },
                {
                    name: 'var_name',
                    type: 'int',
                    label: 'Variable Name'
                },
                {
                    name: 'value_name',
                    type: 'int',
                    label: 'Value Name'
                },
                {
                    name: 'col_level',
                    type: ['int', 'text'],
                    label: 'Column Level'
                }
            ]
        },
        'pd085': {
            id: 'map',
            name: 'Map',
            library: 'pandas',
            description: '함수/매핑을 이용해 데이터 변형',
            code: '${o0} = ${i0}.map(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['Series', 'Index']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'arg',
                    type: ['var', 'dict'],
                    label: 'Mapping Arguments',
                    required: true
                },
                {
                    name: 'na_action',
                    type: 'var',
                    label: 'Na Action',
                    component: 'option_select',
                    options: ['None', "'ignore'"],
                    options_label: ['선택 안함', '결측치 무시'],
                    default: 'None'
                }
            ]
        },
        'pd086': {
            id: 'apply',
            name: 'Apply',
            library: 'pandas',
            description: '임의 함수를 이용해 데이터 변형',
            code: '${o0} = ${i0}.apply(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy', 'Rolling']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'func',
                    type: 'var',
                    label: 'Function',
                    component: 'var_select',
                    var_type: ['function'],
                    required: true
                },
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column'],
                    default: 0
                },
                {
                    name: 'raw',
                    type: 'bool',
                    label: 'Raw',
                    default: false,
                    component: 'option_select',
                    options_label: ['Series 객체', 'ndarray 객체']
                }
            ]
        },
        'pd087': {
            id: 'applymap',
            name: 'ApplyMap',
            library: 'pandas',
            description: '임의 함수를 이용해 데이터 변형',
            code: '${o0} = ${i0}.applymap(${i1})',
            guide: [
                'df = pd.DataFrame([[1, 2.12], [3.356, 4.567]])',
                'df.applymap(lambda x: len(str(x)))',
                'df.applymap(lambda x: x**2)'
            ],
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame']
                },
                {
                    name: 'i1',
                    type: 'var',
                    label: 'Function',
                    var_type: ['function']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: []
        },
        'pd088': {
            id: 'cut',
            name: 'Cut',
            library: 'pandas',
            description: '동일 길이로 나눠 범주 구성',
            code: '${o0} = pd.cut(${i0}, ${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:['var', 'list'],
                    label: '1-dimension Array'
                },
                {
                    name: 'i1',
                    type:['int', 'var'],
                    label: 'Divide By'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'right',
                    type: 'bool',
                    label: 'Include Right',
                    default: true,
                    component: 'bool_checkbox'
                },
                {
                    name: 'labels',
                    type: ['list', 'bool'],
                    label: 'Labels'
                },
                {
                    name: 'precision',
                    type: 'int',
                    label: 'Precision',
                    default: 3
                }
            ]
        },
        'pd089': {
            id: 'qcut',
            name: 'Qcut',
            library: 'pandas',
            description: '동일 개수로 나눠 범주 구성',
            code: '${o0} = pd.qcut(${i0}, ${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:['var', 'list'],
                    label: 'List/Series',
                    var_type: ['list', 'Series']
                },
                {
                    name: 'i1',
                    type:['int', 'var'],
                    label: 'Divide By'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'labels',
                    type: ['list', 'bool'],
                    label: 'Labels'
                },
                {
                    name: 'precision',
                    type: 'int',
                    label: 'Precision',
                    default: 3
                }
            ]
        },
        'pd090': {
            id: 'sample',
            name: 'Sample',
            library: 'pandas',
            description: '',
            code: '${o0} = ${i0}.sample(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                // n과 frac은 동시에 쓸 수 없음
                {
                    name: 'n',
                    type: 'int',
                    label: 'Number of Rows'
                },
                {
                    name: 'frac',
                    type: 'float',
                    label: 'Percentage of Rows'
                },
                {
                    name: 'replace',
                    type: 'bool',
                    label: 'Replace Duplicates',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'weights',
                    type: ['text', 'list', 'list2d'],
                    label: 'Weights'
                },
                {
                    name: 'random_state',
                    type: ['var', 'int'],
                    label: 'Random State',
                    var_type: ['RandomState']
                },
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column'],
                    default: 0
                }
            ]
        },
        'pd091': {
            id: 'get_dummies',
            name: 'Get Dummies',
            library: 'pandas',
            description: 'One-Hot Encoding',
            code: '${o0} = pd.get_dummies(${i0}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'prefix',
                    type: ['text', 'list', 'dict'],
                    label: 'Header Prefix'
                },
                {
                    name: 'prefix_sep',
                    type: ['text'],
                    label: 'Header Seperator',
                    default: '_'
                },
                {
                    name: 'dummy_na',
                    type: 'bool',
                    label: 'Dummy NA',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'columns',
                    type: 'list',
                    label: 'Columns'
                },
                {
                    name: 'drop_first',
                    type: 'bool',
                    label: 'Drop First Column',
                    default: false,
                    component: 'bool_checkbox'
                }
            ]
        },
        'pd092': {
            id: '.str',
            name: '.Str',
            library: 'pandas',
            description: '문자열의 벡터화 (문자배열에만 사용 가능)',
            code: '${o0} = ${i0}.str',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['Series', 'Index']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: []
        },
        'pd093': {
            id: 'var',
            name: 'Var',
            library: 'pandas',
            description: '분산 조회',
            code: '${o0} = ${i0}.var(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy', 'EWM', 'Rolling']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'skipna',
                    type: 'bool',
                    label: 'Skip Na',
                    default: true,
                    component: 'bool_checkbox'
                },
                {
                    name: 'level',
                    type: 'int',
                    label: 'Level'
                },
                {
                    index: 3, 
                    name: 'ddof',
                    type: 'int',
                    label: 'Delta'
                },
                {
                    name: 'numeric_only',
                    type: 'var',
                    label: 'Include Numeric Only',
                    component: 'option_select',
                    options: ['None', "'True'", "'False'"],
                    options_label: ['선택 안 함', 'O', 'X'],
                    default: 'None'
                }
            ]
        },
        'pd094': {
            id: 'prod',
            name: 'Prod',
            library: 'pandas',
            description: '결측치가 아닌 값들의 곱',
            code: '${o0} = ${i0}.prod(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'skipna',
                    type: 'bool',
                    label: 'Skip Na',
                    default: true,
                    component: 'bool_checkbox'
                },
                {
                    name: 'level',
                    type: 'int',
                    label: 'Level'
                },
                {
                    name: 'numeric_only',
                    type: 'var',
                    label: 'Include Numeric Only',
                    component: 'option_select',
                    options: ['None', "'True'", "'False'"],
                    options_label: ['선택 안 함', 'O', 'X'],
                    default: 'None'
                },
                {
                    name: 'min_count',
                    type: 'int',
                    label: 'Minimum Count',
                    default: 0
                }
            ]
        },
        'pd095': {
            id: 'first',
            name: 'First',
            library: 'pandas',
            description: '결측치가 아닌 값들 중 첫 번째 값',
            code: '${o0} = ${i0}.first(${i1})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                },
                {
                    name: 'i1', // offset
                    type: ['text','var'],
                    label: 'Date Offset',
                    help: '1M은 1달'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [

            ]
        },
        'pd096': {
            id: 'last',
            name: 'Last',
            library: 'pandas',
            description: '결측치가 아닌 값들 중 마지막 값',
            code: '${o0} = ${i0}.last(${i1})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                },
                {
                    name: 'i1', // offset
                    type: ['text','var'],
                    label: 'Date Offset',
                    help: '1M은 1달'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
            ]
        },
        'pd097': {
            id: 'agg',
            name: 'Aggregation',
            library: 'pandas',
            description: '결측치가 아닌 값들 중 마지막 값',
            code: '${o0} = ${i0}.agg(${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                },
                {
                    name: 'i1',
                    type: ['var', 'list', 'dict'],
                    label: 'Aggregation Type',
                    options: ['sum', 'mean', 'min', 'max', 'count', 'std', 'quantile']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column'],
                    default: 0
                }
            ]
        },
        'pd098': {
            id: 'transform',
            name: 'Transform',
            library: 'pandas',
            description: '',
            code: '${o0} = ${i0}.transform(${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                },
                {
                    name: 'i1',
                    type: ['var', 'list', 'dict'],
                    label: 'Aggregate Functions',
                    options: ['sum', 'mean', 'min', 'max', 'count']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column'],
                    default: 0
                }
            ]
        },
        'pd099': {
            id: 'pivot_table',
            name: 'Pivot Table',
            library: 'pandas',
            description: '집계연산한 결과물로 2차원 피봇테이블 구성',
            code: '${o0} = ${i0}.pivot_table(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'values',
                    type: 'var',
                    label: 'Values'
                },
                {
                    name: 'index',
                    type: ['var', 'list'],
                    label: 'Indexes'
                },
                {
                    name: 'columns',
                    type: ['var', 'list'],
                    label: 'Columns'
                },
                {
                    name: 'aggfunc',
                    type: ['var', 'list'],
                    label: 'Aggregate Functions'
                },
                {
                    name: 'fill_value',
                    type: ['var', 'int', 'float', 'bool'],
                    label: 'Fill Value'
                },
                {
                    name: 'margins',
                    type: 'bool',
                    label: 'Margins',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'dropna',
                    type: 'bool',
                    label: 'Drop Na',
                    default: true,
                    component: 'bool_checkbox'
                },
                {
                    name: 'margins_name',
                    type: 'text',
                    label: 'Margins Name',
                    default: 'All'
                }
            ]
        },
        'pd100': {
            id: 'crosstab',
            name: 'CrossTable',
            library: 'pandas',
            description: '교차테이블 구성',
            code: '${o0} = pd.crosstab(${i0}, ${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Index Series/list',
                    component: 'var_select',
                    var_type: ['Series', 'list']
                },
                {
                    name: 'i1',
                    type:'var',
                    label: 'Column Series/list',
                    component: 'var_select',
                    var_type: ['Series', 'list']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'values',
                    type: 'list',
                    label: 'Values'
                },
                {
                    name: 'rownames',
                    type: 'list',
                    label: 'Row Names'
                },
                {
                    name: 'colnames',
                    type: 'list',
                    label: 'Column Names'
                },
                {
                    name: 'aggfunc',
                    type: 'var',
                    label: 'Aggregate Functions',
                    options: ['sum', 'mean', 'min', 'max', 'count']
                },
                {
                    name: 'margins',
                    type: 'bool',
                    label: 'Margins',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'margins_name',
                    type: 'text',
                    label: 'Margins Name',
                    default: 'All'
                },
                {
                    name: 'dropna',
                    type: 'bool',
                    label: 'Drop Na',
                    default: true,
                    component: 'bool_checkbox'
                },
                {
                    name: 'normalize',
                    type: 'bool',
                    label: 'Normalize Rate',
                    default: true,
                    component: 'bool_checkbox'
                }
            ]
        },
        'pd101': {
            id: 'to_datetime',
            name: 'To Datetime',
            library: 'pandas',
            description: '문자열/배열을 datetime 객체로 변환',
            code: '${o0} = pd.to_datetime(${i0}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Date List',
                    component: 'var_select',
                    var_type: ['list', 'DataFrame', 'Series', 'int', 'float', 'text', 'datetime']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'

                }
            ],
            variable: [
                {
                    name: 'errors',
                    type: 'text',
                    label: 'Errors',
                    component: 'option_select',
                    default: 'raise',
                    options: ['raise', 'ignore', 'coerce'],
                    options_label: ['오류 발생', 'NaT 값으로 설정', '입력값 그대로']
                },
                {
                    name: 'dayfirst',
                    type: 'bool',
                    label: 'Day First',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'yearfirst',
                    type: 'bool',
                    label: 'Year First',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'format',
                    type: 'text',
                    label: 'Format',
                    help: '%d/%m/%Y'
                }
            ]
        },
        'pd102': {
            id: '.is_unique',
            name: 'Is Unique',
            library: 'pandas',
            description: '', // TODO:
            code: '${o0} = ${i0}.is_unique',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['Series', 'Index']
                },
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'

                }
            ],
            variable: []
        },
        'pd103': {
            id: 'resample',
            name: 'Resample',
            library: 'pandas',
            description: '', // TODO:
            code: '${o0} = ${i0}.resample(${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name: 'i1',
                    type: 'var',
                    label: 'Offset',
                    options: ['5T', '10T', '20T', '1H', '1D', '1W', '1M', 'Q', '1Y'],
                    options_label: [
                        '5분 단위', '10분 단위', '20분 단위', '1시간 단위',
                        '1일 단위', '1주일 단위', '1달 단위', '분기별', '1년 단위'
                    ]
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'

                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                }
            ]
        },
        'pd104': {
            id: 'shift',
            name: 'Shift',
            library: 'pandas',
            description: '', // TODO:
            code: '${o0} = ${i0}.shift(${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Index']
                },
                {
                    name: 'i1', // periods
                    type: 'int',
                    label: 'Shift Periods'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to',
                    var_type: ['Series']
                }
            ],
            variable: [
                {
                    name: 'freq',
                    type: 'var',
                    label: 'Frequency Offset',
                    options: ['M', 'D', '90T'],
                    options_label: ['월', '일', '90시간']
                },
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                },
                {
                    name: 'fill_value',
                    type: 'var',
                    label: 'Fill Value'
                }
            ]
        },
        'pd105': {
            id: 'tshift',
            name: 'TShift',
            library: 'pandas',
            description: '', // TODO:
            code: '${o0} = ${i0}.tshift(${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Index', 'GroupBy']
                },
                {
                    name: 'i1', // periods
                    type: 'int',
                    label: 'Shift Periods'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to',
                    var_type: ['Series', 'DataFrame']
                }
            ],
            variable: [
                {
                    name: 'freq',
                    type: 'var',
                    label: 'Frequency Offset',
                    options: ['M', 'D', '90T'],
                    options_label: ['월', '일', '90시간']
                },
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                }
            ]
        },
        'pd106': {
            id: 'date_shift',
            name: 'Date Shift Operation',
            library: 'pandas',
            description: '', // TODO:
            code: '${o0} = ${i0} ${i1} ${i2}',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'First Date',
                    options: ['datetime', 'Day()', 'MonthEnd()']
                },
                {
                    name: 'i1', // periods
                    type: 'int',
                    label: 'Shift Periods',
                    component: 'option_select',
                    options: ['+', '-', '*', '/']

                },
                {
                    name: 'i2',
                    type:'var',
                    label: 'Second Date',
                    options: ['datetime', 'Day()', 'MonthEnd()']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: []
        },
        'pd107': {
            id: 'tz_localize',
            name: 'Timezone Localize',
            library: 'pandas',
            description: '지역 시간대 설정',
            code: '${o0} = ${i0}.tz_localize(${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Timestamp', 'DatetimeIndex']
                },
                {
                    name: 'i1', // tz
                    type: ['text', 'var'],
                    label: 'Time Zone',
                    options: [
                        'UTC'
                    ]
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to',
                    var_type: ['Series', 'DataFrame']
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column'],
                    default: 0
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level'
                },
                {
                    name: 'copy',
                    type: 'bool',
                    label: 'Copy',
                    component: 'bool_checkbox',
                    default: true
                }
            ]
        },
        'pd108': {
            id: 'tz_convert',
            name: 'Timezone Convert',
            library: 'pandas',
            description: '지역 시간대 변경',
            code: '${o0} = ${i0}.tz_convert(${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Timestamp', 'DatetimeIndex']
                },
                {
                    name: 'i1', // tz
                    type: ['text', 'var'],
                    label: 'Time Zone',
                    options: [
                        'UTC',
                        'Asia/Seoul',
                        'America/New_York',
                        'Europe/Berlin'
                    ]
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to',
                    var_type: ['Series', 'DataFrame']
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column'],
                    default: 0
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level'
                },
                {
                    name: 'copy',
                    type: 'bool',
                    label: 'Copy',
                    component: 'bool_checkbox',
                    default: true
                }
            ]
        },
        'pd109': {
            id: 'Timestamp',
            name: 'Timestamp',
            library: 'pandas',
            description: 'Timestamp 객체 생성',
            code: '${o0} = pd.Timestamp(${v})',
            input: [
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'ts_input',
                    type: ['var', 'text', 'int', 'float'],
                    label: 'Timestamp Source'
                },
                {
                    name: 'freq',
                    type: ['text', 'var'],
                    label: 'Frequency Offset'
                },
                {
                    name: 'year',
                    type: 'int',
                    label: 'Year'
                },
                {
                    name: 'month',
                    type: 'int',
                    label: 'Month'
                },
                {
                    name: 'day',
                    type: 'int',
                    label: 'Day'
                },
                {
                    name: 'hour',
                    type: 'int',
                    label: 'Hour',
                    default: 0
                },
                {
                    name: 'minute',
                    type: 'int',
                    label: 'Minute',
                    default: 0
                },
                {
                    name: 'second',
                    type: 'int',
                    label: 'Second',
                    default: 0
                },
                {
                    name: 'tz',
                    type: ['text', 'var'],
                    label: 'Time Zone'
                }
            ]
        },
        'pd110': {
            id: 'period_range',
            name: 'Period Range',
            library: 'pandas',
            description: '',
            code: '${o0} = pd.period_range(${v})',
            input: [
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: 
            [
                {
                    name: 'start',
                    type: 'text',
                    label: 'Start'
                },
                {
                    name: 'end',
                    type: 'text',
                    label: 'End'
                },
                {
                    name: 'periods',
                    type: 'int',
                    label: 'Periods'
                },
                {
                    name: 'freq',
                    type: ['text', 'var'],
                    label: 'Frequency'
                },
                {
                    name: 'name',
                    type: 'text',
                    label: 'PeriodIndex Name'
                }
            ]
        },
        'pd111': {
            id: 'asfreq',
            name: 'as Frequency',
            library: 'pandas',
            description: '', // TODO:
            code: '${o0} = ${i0}.asfreq(${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Period', 'PeriodIndex', 'Resampler']
                },
                {
                    name: 'i1', // freq
                    type: ['text', 'var'],
                    label: 'Frequency Offset',
                    options: [
                        'UTC',
                        'Asia/Seoul',
                        'America/New_York',
                        'Europe/Berlin'
                    ]
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to',
                    var_type: ['Series', 'DataFrame']
                }
            ],
            variable: [
                {
                    name: 'method',
                    type: 'var',
                    label: 'Method',
                    help: 'ffill:이전 값으로 채우기\nbfill:뒤에 있는 값으로 채우기',
                    component: 'option_select',
                    default: 'None',
                    options: ['None', "'ffill'", "'bfill'"],
                    options_label: ['선택 안 함', '이전 값으로 채우기', '이후 값으로 채우기']
                },
                {
                    name: 'normalize',
                    type: 'bool',
                    label: 'Normalize',
                    component: 'bool_checkbox',
                    default: false
                },
                {
                    name: 'fill_value',
                    type: 'var',
                    label: 'Fill Value'
                }
            ]
        },
        'pd112': {
            id: 'to_period',
            name: 'To Period',
            library: 'pandas',
            description: 'Timestamp에서 Period로 변환',
            code: '${o0} = ${i0}.to_period(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Timestamp', 'DatetimeIndex']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'freq',
                    label: 'Frequency',
                    type: 'text',
                    options: ['s', 'T', 'H', 'D', 'B', 'W', 'W-MON', 'MS', 'M', 'BMS', 'BM'],
                    options_label: ['초', '분', '시간', '일', '주말이 아닌 평일', '주(일요일)', '주(월요일)', '각 달의 첫날', '각 달의 마지막 날', '평일 중 각 달의 첫날', '평일 중 각 달의 마지막 날']
                },
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column'],
                    default: 0
                },
                {
                    name: 'copy',
                    type: 'bool',
                    label: 'Copy',
                    component: 'bool_checkbox',
                    default: true
                }
            ]
        },
        'pd113': {
            id: 'to_timestamp',
            name: 'To Timestamp',
            library: 'pandas',
            description: 'PeriodIndex를 DatetimeIndex로 변환',
            code: '${o0} = ${i0}.to_timestamp(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Timestamp', 'DatetimeIndex']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'freq',
                    label: 'Frequency',
                    type: 'text',
                    options: ['s', 'T', 'H', 'D', 'B', 'W', 'W-MON', 'MS', 'M', 'BMS', 'BM'],
                    options_label: ['초', '분', '시간', '일', '주말이 아닌 평일', '주(일요일)', '주(월요일)', '각 달의 첫날', '각 달의 마지막 날', '평일 중 각 달의 첫날', '평일 중 각 달의 마지막 날']
                },
                {
                    name: 'how',
                    label: 'How', // TODO:
                    type: 'text',
                    component: 'option_select',
                    options : ['start', 'end'],
                    options_label: ['시작점', '종료점']
                },
                            {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column'],
                    default: 0
                },
                {
                    name: 'copy',
                    type: 'bool',
                    label: 'Copy',
                    component: 'bool_checkbox',
                    default: true
                }
            ]
        },
        'pd114': {
            id: 'PeriodIndex',
            name: 'PeriodIndex',
            library: 'pandas',
            description: 'PeriodIndex 생성',
            code: '${o0} = pd.PeriodIndex(${v})',
            input: [
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'data',
                    type: 'list',
                    label: 'Data'
                },
                {
                    index: 1, 
                    name: 'copy',
                    type: 'bool',
                    label: 'Deep Copy',
                    component: 'bool_checkbox',
                    default: false
                },
                {
                    name: 'freq',
                    type: 'text',
                    label: 'Frequency',
                    component: 'option_select',
                    options: ['s', 'T', 'H', 'D', 'B', 'W', 'W-MON', 'MS', 'M', 'BMS', 'BM'],
                    options_label: ['초', '분', '시간', '일', '주말이 아닌 평일', '주(일요일)', '주(월요일)', '각 달의 첫날', '각 달의 마지막 날', '평일 중 각 달의 첫날', '평일 중 각 달의 마지막 날']
                },
                {
                    name: 'year',
                    type: ['int', 'list', 'Series'],
                    label: 'Year'
                },
                {
                    name: 'month',
                    type: ['int', 'list', 'Series'],
                    label: 'Month'
                },
                {
                    name: 'quarter',
                    type: ['int', 'list', 'Series'],
                    label: 'Quarter'
                },
                {
                    name: 'day',
                    type: ['int', 'list', 'Series'],
                    label: 'Day'
                },
                {
                    name: 'hour',
                    type: ['int', 'list', 'Series'],
                    label: 'Hour',
                    default: 0
                },
                {
                    name: 'minute',
                    type: ['int', 'list', 'Series'],
                    label: 'Minute',
                    default: 0
                },
                {
                    name: 'second',
                    type: ['int', 'list', 'Series'],
                    label: 'Second',
                    default: 0
                },
                {
                    name: 'tz',
                    type: ['text', 'var'],
                    label: 'Timezone'
                }
            ]
        },
        'pd115': {
            id: 'rolling',
            name: 'Rolling',
            library: 'pandas',
            description: '시계열 롤링 통계',
            code: '${o0} = ${i0}.rolling(${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name: 'i1', // window
                    type: ['int', 'text'],
                    label: 'Data Count'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'min_periods',
                    type: 'int',
                    label: 'Minimum Periods',
                    help: '범위 내 데이터가 최소 개수보다 많으면 연산에 포함한다'
                },
                {
                    name: 'center',
                    type: 'bool',
                    label: 'Center',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'win_type',
                    type: 'text',
                    label: 'Rolling View Type',
                    component: 'option_select',
                    options: ['boxcar', 'triang', 'blackman', 'hamming', 'bartlett', 'parzen', 'bohman', 'blackmanharris', 'nuttall', 'barthann']

                },
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column'],
                    default: 0
                }
            ]
        },
        'pd116': {
            id: 'ewm',
            name: 'EWM',
            library: 'pandas',
            description: '지수 이동평균 계산',
            code: '${o0} = ${i0}.ewm(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'com',
                    type: 'float',
                    label: 'Com',
                    help: 'com≥0 일 때, α=1/(1+com)'
                },
                {
                    name: 'span',
                    type: 'float',
                    label: 'Span',
                    help: 'span≥1 일 때, α=2/(span+1)'
                },
                {
                    name: 'halflife',
                    type: 'float',
                    label: 'Half Life', 
                    help: 'halflife>0 일 때, α=1−exp(log(0.5)/halflife)'
                },
                {
                    name: 'alpha',
                    type: 'float',
                    label: 'Alpha',
                    help: '0<α≤1'
                },
                {
                    name: 'min_periods',
                    type: 'int',
                    label: 'Minimum Periods',
                    help: '',
                    default: 0
                },
                {
                    name: 'adjust',
                    type: 'bool',
                    label: 'Adjust',
                    default: true,
                    component: 'bool_checkbox'
                },
                {
                    name: 'ignore_na',
                    type: 'bool',
                    label: 'Ignore NA',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    default: 0,
                    component: 'option_select',
                    options: [0, 1],
                    options_label: ['row', 'column']
                }
            ]
        },
        'pd117': {
            id: 'pct_change',
            name: 'PCT Change',
            library: 'pandas',
            description: '전일/또는 어떤 기간에서의 변화율 계산',
            code: '${o0} = ${i0}.pct_change(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'periods',
                    type: 'int',
                    label: 'Periods',
                    default: 1
                },
                {
                    name: 'fill_method',
                    type: 'text',
                    label: 'Fill Method',
                    default: 'ffill',
                    options: ["'ffill'", "'bfill'"],
                    options_label: ['이전 값으로 채우기', '이후 값으로 채우기']
                },
                {
                    name: 'limit',
                    type: 'int',
                    label: 'Limit'
                },
                {
                    name: 'freq',
                    type: ['text','var'],
                    label: 'Frequency',
                    options: ['s', 'T', 'H', 'D', 'B', 'W', 'W-MON', 'MS', 'M', 'BMS', 'BM'],
                    options_label: ['초', '분', '시간', '일', '주말이 아닌 평일', '주(일요일)', '주(월요일)', '각 달의 첫날', '각 달의 마지막 날', '평일 중 각 달의 첫날', '평일 중 각 달의 마지막 날']
                },
            ]
        },
        'pd118': {
            id: 'corr',
            name: 'Correlation',
            library: 'pandas',
            description: '컬럼 간 상관관계 연산',
            code: '${o0} = ${i0}.corr(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'GroupBy', 'EWM']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'method',
                    type: ['text', 'var'],  // 옵션 또는 callable(arr, arr)
                    label: 'Method',
                    default: 'pearson',
                    component: 'option_select',
                    options: ['pearson', 'kendall', 'spearman'],
                },
                {
                    name: 'min_periods',
                    type: 'int',
                    label: 'Minimum Periods'
                }
            ]
        },
        'pd119': {
            id: 'corrwith',
            name: 'Correlation With',
            library: 'pandas',
            description: '상관관계 연산',
            code: '${o0} = ${i0}.corrwith(${i1}${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'DataFrameGroupBy']
                },
                {
                    name: 'i1',
                    type:'var',
                    label: 'Object To Compare',
                    component: 'var_select',
                    var_type: ['DataFrame', 'DataFrameGroupBy']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'axis',
                    type: 'int',
                    label: 'Axis',
                    default: 0,
                    options: [0, 1],
                    options_label: ['row', 'column'],
                    component: 'option_select'
                },
                {
                    name: 'drop',
                    type: 'bool',
                    label: 'Drop Empty',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'method',
                    type: ['text', 'var'],  // 옵션 또는 callable(arr, arr)
                    label: 'Method',
                    default: 'pearson',
                    component: 'option_select',
                    options: ['pearson', 'kendall', 'spearman'],
                }
            ]
        },
        'pd120': {
            id: 'cov',
            name: 'Covariance',
            library: 'pandas',
            description: '모든 변수 간 공분산 계산',
            code: '${o0} = ${i0}.cov(${v})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'DataFrameGroupBy']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'min_periods',
                    type: 'int',
                    label: 'Minimum Periods'
                }
            ]
        },
        'pd121': {
            id: 'plot',
            name: 'Plot',
            library: 'pandas',
            description: '차트 생성',
            code: '${o0} = ${i0}.plot(${v}${etc})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'Pandas Object',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'kind',
                    type: 'text',
                    label: 'Chart Type',
                    default: 'line',
                    component: 'option_select',
                    options: ['line', 'bar', 'barh', 'hist', 'box', 'kde', 'area', 'pie', 'scatter', 'hexbin'],
                    options_label: ['선', '막대', '가로 막대', '히스토그램', '박스플롯', 'Kernel Density Estimation', 'Area', '파이', 'Scatter', 'Hexbin']
                },
                {
                    name: 'title',
                    type: ['text', 'list'],
                    label: 'Chart Title'
                },
                {
                    name: 'figsize',
                    type: 'tuple',
                    label: 'Figure Size',
                    placeholder: '(width, height)'
                },
                {
                    name: 'fontsize',
                    type: 'int',
                    label: 'Font Size'
                },
                {
                    name: 'colormap',
                    type: 'text',
                    label: 'Color Map',
                    component: 'option_select',
                    options: [
                        'viridis', 'plasma', 'inferno', 'magma', 'cividis', 'Pastel1', 'Pastel2', 'Paired', 'Accent', 'Dark2', 'Set1', 'Set2', 'Set3', 'tab10', 'tab20', 'tab20b', 'tab20c'
                    ],
                    options_label: [
                        'viridis', 'plasma', 'inferno', 'magma', 'cividis', 'Pastel1', 'Pastel2', 'Paired', 'Accent', 'Dark2', 'Set1', 'Set2', 'Set3', 'tab10', 'tab20', 'tab20b', 'tab20c'
                    ]
                },
                {
                    name: 'grid',
                    type: 'bool',
                    label: 'Show Grid',
                    component: 'bool_checkbox',
                    default: false
                },
                {
                    name: 'legend',
                    type: 'bool',
                    label: 'Show Legend',
                    component: 'bool_checkbox',
                    default: false
                },
                {
                    name: 'rot',
                    type: 'int',
                    label: 'X Label Rotation'
                },
                {
                    name: 'xlabel',
                    type: 'list',
                    label: 'X Label'
                },
                {
                    name: 'ylabel',
                    type: 'list',
                    label: 'Y Label'
                },
                {
                    name: 'xlim',
                    type: ['var', 'list'], //tuple
                    label: 'X Limit',
                    placeholder: '(start, end)'
                },
                {
                    name: 'ylim',
                    type: ['var', 'list'], //tuple
                    label: 'Y Limit',
                    placeholder: '(start, end)'
                },
                {
                    name: 'xticks',
                    type: 'list',
                    label: 'X Ticks',
                    placeholder: "['tick', ...]",
                    description: 'x축에 표시되는 지점 별 라벨 목록'
                },
                {
                    name: 'yticks',
                    type: 'list',
                    label: 'Y Ticks',
                    placeholder: "['tick', ...]",
                    description: 'y축에 표시되는 지점 별 라벨 목록'
                },
                {
                    name: 'style',
                    type: ['list', 'dict'],
                    label: 'Style',
                    placeholder: '["-", "--", "-.", ":"]',
                    help: '컬럼 수와 목록 개수가 맞아야 합니다'
                },
                {
                    name: 'x',
                    type: ['text', 'int'],
                    label: 'X Column'
                },
                {
                    name: 'y',
                    type: ['text', 'int'],
                    label: 'Y Column'
                },
                {
                    name: 'subplots',
                    type: 'bool',
                    label: 'Subplots Per Column',
                    default: false,
                    component: 'bool_checkbox'
                },
                {
                    name: 'layout',
                    type: 'tuple',
                    label: 'Subplot Layout',
                    placeholder: '(row, column)'
                },
                {
                    name: 'use_index',
                    type: 'bool',
                    label: 'Use Index On X Ticks',
                    default: true,
                    component: 'bool_checkbox'
                },
                {
                    name: 'stacked',
                    type: 'bool',
                    label: 'Stacked',
                    default: false,//true in area
                    component: 'bool_checkbox'
                }
            ],
        },
        'pd123': {
            id: 'readExcel',
            name: 'Read Excel',
            library: 'pandas',
            description: '엑셀 파일을 불러와 DataFrame 생성',
            code: '${o0} = pd.read_excel(${i0}${v})',
            input: [
                {
                    name:'i0',
                    type:'text',
                    label: 'File Path',
                    component: 'file'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Return to'
                }
            ],
            variable: [
                {
                    name: 'sheet_name',
                    type: 'text',
                    label: 'Sheet Name'
                }
            ]
        },
        'pd124': {
            id: 'to_excel',
            name: 'To Excel',
            library: ['pandas', 'xlwt', 'openpyxl'], // TODO: required packages
            description: 'DataFrame을 excel 파일로 작성',
            code: '${i0}.to_excel(${i1}${v})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Pandas Object',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name:'i1',
                    type:'text',
                    label: 'File Path',
                    component: 'file'
                }
            ],
            output: [
            ],
            variable: [
                {
                    name: 'sheet_name',
                    type: 'text',
                    label: 'Sheet Name'
                }
            ]
        },
        'pd125': {
            id: 'subset',
            name: 'Subset',
            library: 'pandas',
            description : 'subset pandas object',
            code: '${o0} = ${i0}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Subset Code',
                    component: 'var_select',
                    var_type: ['DataFrame']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        },
        'pd126': {
            id: 'frame_editor',
            name: 'Frame Editor',
            library: 'pandas',
            description : 'pandas object editor',
            code: '${o0} = ${i0}',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'Code',
                    component: 'textarea',
                    var_type: ['DataFrame']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Return to'
                }
            ]
        }
    }

    return {
        _PANDAS_FUNCTION: _PANDAS_FUNCTION
    };
});