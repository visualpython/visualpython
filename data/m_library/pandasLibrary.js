define([
], function () {
    // TEST
    /**
     * Replaced with
    '([a-zA-Z0-9_.]*)'[ ]*: (\{[\n\t ]*id:)[ ]*'([a-zA-Z0-9]*)'
    '$3': $2 '$1'
    */
    var PANDAS_FUNCTION = {
        'pdPdo_series': {
            id: 'Series',
            name: 'Series',
            library: 'pandas',
            description: '1 dimension array with same data types',
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
                    label:'Allocate to',
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
        'pdPdo_dataframe': {
            id: 'Dataframe',
            name: 'DataFrame',
            library: 'pandas',
            description: '2 dimension data table type pandas variable',
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
                    label:'Allocate to'
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
        'pdPdo_index': {
            id: 'Index',
            name: 'Index',
            library: 'pandas',
            description: 'Create index object',
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
                    default: "'object'"
                },
                {
                    name: 'copy',
                    type: 'bool',
                    label: 'Copy',
                    component: 'bool_checkbox',
                    default: 'False'
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
                    default: 'True',
                    component: 'bool_checkbox'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Allocate to'
                }
            ]

        },
        'pd004': {
            id: 'read_csv',
            name: 'Read CSV',
            library: 'pandas',
            description: '',
            code: '${o0} = pd.read_csv(${i0}${v}${etc})',
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
                    label:'Allocate to'
                }
            ],
            variable: [
                {
                    name: 'encoding',
                    type: 'text',
                    label: 'Encoding'
                },
                {
                    name: 'header',
                    type: 'int',
                    label: 'Header',
                    component: 'option_suggest',
                    options: ['None', '0']
                },
                {
                    name: 'sep',
                    type: 'text',
                    label: 'Seperator'
                },
                {
                    name: 'names',
                    type: 'list',
                    label: 'Columns'
                },
                {
                    name: 'usecols',
                    type: 'list',
                    label: 'Column List To Use'
                },
                {
                    name: 'index_col',
                    type: 'var',
                    label: 'Column To Use As Index'
                },
                {
                    name: 'na_values',
                    type: 'list',
                    label: 'Na Values'
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
            description: 'dataframe to csv',
            code: '${i0}.to_csv(${i1}${v}${etc})',
            input: [
                {
                    name:'i0',
                    type:'var',
                    label: 'DataFrame',
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
                    name: 'encoding',
                    type: 'text',
                    label: 'Encoding'
                },
                {
                    name: 'header',
                    type: ['bool', 'list'],
                    label: 'Header',
                    default: 'True',
                    component: 'bool_checkbox'
                },
                {
                    name: 'index',
                    type: 'bool',
                    label: 'Index',
                    default: 'True',
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
        'pdFunc_merge': {
            id: 'merge',
            name: 'Merge',
            library: 'pandas',
            description: 'Merge 2 objects',
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
                    label:'Allocate to'
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
            description: 'Merge multiple objects',
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
                    label:'Allocate to'
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
        'pdFunc_concat': {
            id: 'concat',
            name: 'Concat',
            library: 'pandas',
            description: 'Merge multiple objects',
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
                    label:'Allocate to'
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
        'pdSdt_sortByIndex': {
            id: 'sort_index',
            name: 'Sort By Index',
            library: 'pandas',
            description: 'Sort by index',
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
                    label:'Allocate to'
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
                    default: 'True',
                    component: 'bool_checkbox'
                },
                {
                    name:'inplace',
                    type:'bool',
                    label: 'Inplace',
                    default: 'False',
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
        'pdGrp_groupby': {
            id: 'groupby',
            name: 'Group By',
            library: 'pandas',
            description: 'Group DataFrame/Series',
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
                    label:'Allocate to'
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
                    default: 'True'
                }
            ]
        },
        'pdParr_period': {
            id: 'period',
            name: 'Period',
            library: 'pandas',
            description: 'Create Period object',
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
                    label:'Allocate to'
                }
            ],
            variable: [
                {
                    name: 'freq',
                    label: 'Frequency',
                    type: 'var',
                    component: 'option_select',
                    options: ['s', 'T', 'H', 'D', 'B', 'W', 'W-MON', 'M'],
                    options_label: ['second', 'minute', 'hour', 'day', 'weekdays', 'week(Sunday)', 'week(Monday)', 'last day of month']
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
        'pdFunc_dropNA': {
            id: 'dropna',
            name: 'Drop NA',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
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
                }
            ]
        },
        'pdFunc_fillNA': {
            id: 'fillna',
            name: 'Fill NA',
            library: 'pandas',
            description: 'replace null using value',
            code: '${o0} = ${i0}.fillna(${v})',
            guide: [
                'from numpy import nan as NA',
                '',
                'df = pd.DataFrame([[1,2,3,NA],[4,NA,1,2],[0,9,6,7]])',
                'df.fillna({1: 0.5, 3: -1})',
                'df.fillna(0, inplace=True)'
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
                    label:'Allocate to'
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
                    options: ['None', "'ffill'", "'bfill'"]
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
                    label: 'Gap Limit'

                }
            ]
        },
        'pdFunc_isDuplicated': {
            id: 'duplicated',
            name: 'Get Duplicates',
            library: 'pandas',
            description: 'Get duplicates',
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
                    label:'Allocate to'
                }
            ],
            variable: [
                {
                    name: 'keep',
                    type:'var',
                    label: 'Mark Duplicated When',
                    component: 'option_select',
                    default: "'first'",
                    options: ["'first'", "'last'", 'False']
                }
            ]
        },
        'pdFunc_dropDuplicates': {
            id: 'drop_duplicates',
            name: 'Drop Duplicates',
            library: 'pandas',
            description: 'Drop duplicates',
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
                    label:'Allocate to'
                }
            ],
            variable: [
                {
                    name: 'keep',
                    type:'var',
                    label: 'Mark Duplicated When',
                    component: 'option_select',
                    default: "'first'",
                    options: ["'first'", "'last'", 'False']
                }
            ]
        },
        'pdFunc_replace': {
            id: 'replace_scala',
            name: 'Scala Replace',
            library: 'pandas',
            description: 'Replace scala value',
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
                    label:'Allocate to'
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
                    component: 'option_select',
                    default: "'ffill'"
                }
            ]
        },
        'pd019': {
            id: 'replace_list',
            name: 'List-like Replace',
            library: 'pandas',
            description: 'Replace values using list',
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
                    label:'Allocate to'
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
                    component: 'option_select',
                    default: "'ffill'"
                }
            ]
        },
        'pd020': {
            id: 'replace_dict',
            name: 'Dict-like Replace',
            library: 'pandas',
            description: 'Replace values using dictionary',
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
                    label:'Allocate to'
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
                    component: 'option_select',
                    default: "'ffill'"
                }
            ]
        },
        // TODO: PENDING
        'pd021': {
            id: 'replace_regex',
            name: 'Regular Expression Replace',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
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
        'pdGrp_sum': {
            id: 'sum',
            name: 'Sum',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
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
                    label: 'Skip Na Value',
                    component: 'bool_checkbox',
                    default: 'True'
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level',
                }
            ]
        },
        'pdGrp_mean': {
            id: 'mean',
            name: 'Mean',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
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
                    label: 'Skip Na Value',
                    component: 'bool_checkbox',
                    default: 'True'
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level'
                }
            ]
        },
        'pdGrp_count': {
            id: 'count',
            name: 'Count',
            library: 'pandas',
            description: 'Count except NA values',
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
                    label:'Allocate to'
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
                    label: 'Skip Na Value',
                    component: 'bool_checkbox',
                    default: 'True'
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level'
                }
            ]
        },
        'pdGrp_max': {
            id: 'max',
            name: 'Max',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
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
                    label: 'Skip Na Value',
                    component: 'bool_checkbox',
                    default: 'True'
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level'
                }
            ]
        },
        'pdGrp_min': {
            id: 'min',
            name: 'Min',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
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
                    label: 'Skip Na Value',
                    component: 'bool_checkbox',
                    default: 'True'
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level'
                }
            ]
        },
        'pdGrp_median': {
            id: 'median',
            name: 'Median',
            library: 'pandas',
            description: 'Median(50%)',
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
                    label:'Allocate to'
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
                    label: 'Skip Na Value',
                    component: 'bool_checkbox',
                    default: 'True'

                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level'
                },
                {
                    name: 'numeric_only',
                    label: 'Numeric Only',
                    var_type: ['DataFrame'],
                    type: 'var',
                    component: 'option_select',
                    default: 'None',
                    options: ['None', "'false'", "'true'"]
                }
            ]
        },
        'pdGrp_std': {
            id: 'std',
            name: 'Std',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
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
                    label: 'Skip Na Value',
                    component: 'bool_checkbox',
                    default: 'True'
                },
                {
                    name: 'level',
                    type: ['int', 'text'],
                    label: 'Level'
                },
                {
                    name: 'numeric_only',
                    label: 'Numeric Only',
                    var_type: ['DataFrame'],
                    type: 'var',
                    component: 'option_select',
                    default: 'None',
                    options: ['None', "'false'", "'true'"]
                }
            ]
        },
        'pdGrp_quantile': {
            id: 'quantile',
            name: 'Quantile',
            library: 'pandas',
            description: 'Calculate quantile between 0 and 1',
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
                    label:'Allocate to'
                }
            ],
            variable: [
                {
                    name: 'q',
                    type: ['float', 'list'],
                    label: 'Percentile',
                    placeholder: '(0 ~ 1)',
                    description: '',
                    default: 0.5
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
                    name: 'numeric_only',
                    label: 'Numeric Only',
                    var_type: ['DataFrame'],
                    type: 'var',
                    component: 'option_select',
                    options: ['False', 'True']
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
        'pdEdtRC_dropRowCol': {
            id: 'drop',
            name: 'Drop Row/Column',
            library: 'pandas',
            description: 'Drop row and column',
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
                    label:'Allocate to'
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
            description: 'Create DatetimeIndex type timestamp',
            code: '${o0} = pd.date_range(${v})',
            input: [
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Allocate to'
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
                    options_label: ['second', 'minute', 'hour', 'day', 'weekdays', 'week(Sunday)', 'week(Monday)', 
                        'first day of month', 'last day of month', 'first weekday of month', 'last weekday of month']
                }
            ]
        },
        'pdSdt_sortByValues': {
            id: 'sort_values',
            name: 'Sort By Values',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
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
                    default: 'True'
                },
                {
                    name:'inplace',
                    type:'bool',
                    label: 'Inplace',
                    component: 'bool_checkbox',
                    default: 'False'
                },
                {
                    name: 'kind',
                    type: 'text',
                    label: 'Sort Type',
                    component: 'option_select',
                    default: 'quicksort',
                    options: ['quicksort', 'mergesort', 'heapsort']
                }
            ]
        },
        'pdFunc_isNull': {
            id: 'isnull',
            name: 'Is Null',
            library: 'pandas',
            description: 'Find null',
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
                    label:'Allocate to'
                }
            ],
            variable: [
            ]
        },
        'pdFunc_notNull': {
            id: 'notnull',
            name: 'Not Null',
            library: 'pandas',
            description: 'Find not null',
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
                    label:'Allocate to'
                }
            ],
            variable: [
            ]
        },
        'pdIdt_transpose': {
            id: '.T',
            name: 'Transpose',
            library: 'pandas',
            description: 'Transpose row and column',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pdIdt_columns': {
            id: '.columns',
            name: 'Get columns',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pdIdt_index': {
            id: '.index',
            name: 'Get index',
            library: 'pandas',
            description: 'Get index',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pdIdt_values': {
            id: '.values',
            name: 'Values',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd039': {
            id: '.name',
            name: 'name',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd040': {
            id: 'loc',
            name: 'Loc',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd041': {
            id: 'iloc',
            name: 'iLoc',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd042': {
            id: '.array',
            name: 'array',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd043': {
            id: '.axes',
            name: 'axes',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd044': {
            id: '.hasnans',
            name: 'hasnans',
            library: 'pandas',
            description: 'Check if it has NaN values',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd045': {
            id: '.shape',
            name: 'shape',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd046': {
            id: '.dtype',
            name: 'dtype',
            library: 'pandas',
            description: 'Check data type of Index',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pdIdt_len': {
            id: 'len',
            name: 'Length',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pdIdt_unique': {
            id: 'unique',
            name: 'Unique',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pdIdt_valueCounts': {
            id: 'value_counts',
            name: 'get data counts',
            library: 'pandas',
            description: 'get data value counts',
            code: '${o0} = ${i0}.value_counts()',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    // component: 'var_select',
                    // var_type: ['DataFrame', 'Series', 'Index']
                }
            ],
            variable: [],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Allocate to'
                }
            ]
        },
        'pdIdt_info': {
            id: 'info',
            name: 'Info',
            library: 'pandas',
            description: 'DataFrame info(info per columns, data type, memory usage, ...)',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pdIdt_describe': {
            id: 'describe',
            name: 'Describe',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd052': {
            id: 'add',
            name: 'Add',
            library: 'pandas',
            description: 'DataFrame/Series addition',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd053': {
            id: 'sub',
            name: 'Subtract',
            library: 'pandas',
            description: 'DataFrame/Series subtraction',
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
                    options_label: ['Index', 'Columns']
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd054': {
            id: 'div',
            name: 'Divide',
            library: 'pandas',
            description: 'DataFrame/Series division',
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
                    options_label: ['Index', 'Columns']
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd055': {
            id: 'mul',
            name: 'Multiply',
            library: 'pandas',
            description: 'DataFrame/Series multipy',
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
                    options_label: ['Index', 'Columns']
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
                    label: 'Allocate to'
                }
            ]
        },
        'pdEdtRC_insertColumn': {
            id: 'insert_column',
            name: 'Insert Column',
            library: 'pandas',
            description: '',
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
                    default: 'False',
                    component: 'bool_checkbox'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Allocate to'
                }
            ]
        },
        'pd057': {
            id: 'insert_column_value',
            name: 'Insert Column Value',
            library: 'pandas',
            description: '',
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
        'pdEdtRC_insertRow': {
            id: 'insert_row_loc',
            name: 'Insert Row Value',
            library: 'pandas',
            description: '',
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
        'pdGrp_groups': {
            id: '.groups',
            name: 'Groups',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pdFunc_reindex': {
            id: 'reindex',
            name: 'Reindex',
            library: 'pandas',
            description: '',
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
                    help: 'ffill:fill with front value\nbfill:fill with back value',
                    component: 'option_select',
                    options: ['ffill', 'bfill', 'nearest']
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Allocate to'
                }
            ]
        },
        'pdFunc_setIndex': {
            id: 'set_index',
            name: 'Set Index Values',
            library: 'pandas',
            description: 'create index using column',
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
                    default: 'True',
                    component: 'bool_checkbox'
                },
                {
                    name: 'append',
                    type: 'bool',
                    label: 'Append',
                    default: 'False',
                    component: 'bool_checkbox'
                },
                {
                    name: 'inplace',
                    type: 'bool',
                    label: 'Inplace',
                    default: 'False',
                    component: 'bool_checkbox'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Allocate to'
                }
            ]
        },
        'pdFunc_resetIndex': {
            id: 'reset_index',
            name: 'Reset Index Values',
            library: 'pandas',
            description: '',
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
                    default: 'False',
                    component: 'bool_checkbox'
                },
                {
                    name: 'inplace',
                    type: 'bool',
                    label: 'Inplace',
                    default: 'False',
                    component: 'bool_checkbox'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Allocate to'
                }
            ]
        },
        'pd063': {
            id: 'edit_row_data',
            name: 'Edit Row Data',
            library: 'pandas',
            description: '',
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
        'pdIdt_head': {
            id: 'head',
            name: 'Head',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pdIdt_tail': {
            id: 'tail',
            name: 'Tail',
            library: 'pandas',
            description : '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pdIdt_take': {
            id: 'take',
            name: 'Take',
            library: 'pandas',
            description: '',
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
                    options_label: ['Row', 'Column', 'None'],
                    component: 'option_select',
                    default: 0
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label: 'Allocate to'
                }
            ]
        },
        'pd067': {
            id: 'op_add',
            name: '+',
            library: 'pandas',
            description: 'Addition',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd068': {
            id: 'op_sub',
            name: '-',
            library: 'pandas',
            description: 'Subtract',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd069': {
            id: 'op_mul',
            name: '*',
            library: 'pandas',
            description: 'Multiply',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd070': {
            id: 'op_pow',
            name: 'power',
            library: 'pandas',
            description: '',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd071': {
            id: 'op_div',
            name: '/',
            library: 'pandas',
            description: 'Divide',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd072': {
            id: 'op_mod',
            name: '//',
            library: 'pandas',
            description: 'Quotient',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd073': {
            id: 'op_mod_left',
            name: '%',
            library: 'pandas',
            description: 'Remainder',
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
                    label: 'Allocate to'
                }
            ]
        },
        'pd074': {
            id: 'bool',
            name: 'bool',
            library: 'pandas',
            description: 'bool',
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
                    label: 'Allocate to'
                },
            ]
        },
        'pdPdo_copy': {
            id: 'copy',
            name: 'copy',
            library: 'pandas',
            description: 'Copy data',
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
                    default: 'True',
                    component: 'bool_checkbox'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type:'var',
                    label: 'Allocate to'
                }
            ]
        },
        'pd076': {
            id: 'read_json',
            name: 'Read Json',
            library: 'pandas',
            description: 'json to pandas object',
            code: '${o0} = pd.read_json(${i0}${v}${etc})',
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
                    label:'Allocate to'
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
                    component: 'option_select',
                    options: ['split', 'records', 'index', 'columns', 'values', 'table'],
                    default: 'columns' // if typ==series, index is default
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
            description: 'DataFrame/Series to Json file',
            code: '${o0} = ${i0}.to_json(${v}${etc})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'DataFrame',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Allocate to'
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
                    component: 'option_select',
                    // options: series 0~3 / dataframe *
                    options: ['split', 'records', 'index', 'table', 'columns', 'values']
                }
            ]
        },
        'pd078': {
            id: 'to_pickle',
            name: 'To Pickle',
            library: 'pandas',
            description: 'DataFrame/Series to Pickle file',
            code: '${i0}.to_pickle(${path}${etc})',
            input: [
                {
                    name: 'i0',
                    type:'var',
                    label: 'DataFrame',
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
            description: 'Pickle to pandas object',
            code: '${o0} = pd.read_pickle(${i0}${v}${etc})',
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
                    label:'Allocate to'
                }
            ],
            variable: [
            ]
        },
        'pdFunc_combineFirst': {
            id: 'combine_first',
            name: 'Combine First',
            library: 'pandas',
            description: 'Use same position of target data as substitue value for missing value',
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
                    label:'Allocate to'
                }
            ],
            variable: [ ]
        },
        'pdFunc_stack': {
            id: 'stack',
            name: 'Stack',
            library: 'pandas',
            description: 'Add column to index level',
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
                    label:'Allocate to'
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
                    default: 'True',
                    component: 'bool_checkbox'
                }
            ]
        },
        'pdFunc_unstack': {
            id: 'unstack',
            name: 'Unstack',
            library: 'pandas',
            description: 'Convert specific index level to column',
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
                    label:'Allocate to'
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
        'pdFunc_pivot': {
            id: 'pivot',
            name: 'Pivot',
            library: 'pandas',
            description: 'Pivot data',
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
                    label:'Allocate to'
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
        'pdFunc_melt': {
            id: 'melt',
            name: 'Melt',
            library: 'pandas',
            description: 'Melt data',
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
                    label:'Allocate to'
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
            description: 'Map data using function or argument',
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
                    label:'Allocate to'
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
                    options_label: ['None', 'Ignore NA'],
                    default: 'None'
                }
            ]
        },
        'pd086': {
            id: 'apply',
            name: 'Apply',
            library: 'pandas',
            description: 'Change data using function',
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
                    label:'Allocate to'
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
                    default: 'False',
                    component: 'option_select',
                    options: ['False', 'True'],
                    options_label: ['Series', 'ndarray']
                }
            ]
        },
        'pd087': {
            id: 'applymap',
            name: 'ApplyMap',
            library: 'pandas',
            description: 'Map data using function',
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
                    label:'Allocate to'
                }
            ],
            variable: []
        },
        'pd088': {
            id: 'cut',
            name: 'Cut',
            library: 'pandas',
            description: 'Cut data for ranging',
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
                    label:'Allocate to'
                }
            ],
            variable: [
                {
                    name: 'right',
                    type: 'bool',
                    label: 'Include Right',
                    default: 'True',
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
            description: 'Q-cut',
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
                    label:'Allocate to'
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
                    label:'Allocate to'
                }
            ],
            variable: [
                // cannot use n and func on same time
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
                    default: 'False',
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
                    label:'Allocate to'
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
                    default: 'False',
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
                    default: 'False',
                    component: 'bool_checkbox'
                }
            ]
        },
        'pd092': {
            id: '.str',
            name: '.Str',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
                }
            ],
            variable: []
        },
        'pd093': {
            id: 'var',
            name: 'Var',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
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
                    default: 'True',
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
                    options_label: ['None', 'Yes', 'No'],
                    default: 'None'
                }
            ]
        },
        'pd094': {
            id: 'prod',
            name: 'Prod',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
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
                    default: 'True',
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
                    options_label: ['None', 'Yes', 'No'],
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
            description: '',
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
                    label: 'Date Offset'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Allocate to'
                }
            ],
            variable: [

            ]
        },
        'pd096': {
            id: 'last',
            name: 'Last',
            library: 'pandas',
            description: '',
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
                    label: 'Date Offset'
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Allocate to'
                }
            ],
            variable: [
            ]
        },
        'pdGrp_agg': {
            id: 'agg',
            name: 'Aggregation',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
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
                    label:'Allocate to'
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
        'pdFunc_pivotTable': {
            id: 'pivot_table',
            name: 'Pivot Table',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'
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
                    default: 'False',
                    component: 'bool_checkbox'
                },
                {
                    name: 'dropna',
                    type: 'bool',
                    label: 'Drop Na',
                    default: 'True',
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
            description: '',
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
                    label:'Allocate to'
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
                    default: 'False',
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
                    default: 'True',
                    component: 'bool_checkbox'
                },
                {
                    name: 'normalize',
                    type: 'bool',
                    label: 'Normalize Rate',
                    default: 'True',
                    component: 'bool_checkbox'
                }
            ]
        },
        'pd101': {
            id: 'to_datetime',
            name: 'To Datetime',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to'

                }
            ],
            variable: [
                {
                    name: 'errors',
                    type: 'text',
                    label: 'Errors',
                    component: 'option_select',
                    default: 'raise',
                    options: ['raise', 'ignore', 'coerce']
                },
                {
                    name: 'dayfirst',
                    type: 'bool',
                    label: 'Day First',
                    default: 'False',
                    component: 'bool_checkbox'
                },
                {
                    name: 'yearfirst',
                    type: 'bool',
                    label: 'Year First',
                    default: 'False',
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
                    label:'Allocate to'

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
                        '5 min', '10 min', '20 min', '1 hour',
                        '1 day', '1 week', '1 month', '1 quarter', '1 year'
                    ]
                }
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Allocate to'

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
                    label:'Allocate to',
                    var_type: ['Series']
                }
            ],
            variable: [
                {
                    name: 'freq',
                    type: 'var',
                    label: 'Frequency Offset',
                    options: ['M', 'D', '90T'],
                    options_label: ['Month', 'Day', '90 hour']
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
                    label:'Allocate to',
                    var_type: ['Series', 'DataFrame']
                }
            ],
            variable: [
                {
                    name: 'freq',
                    type: 'var',
                    label: 'Frequency Offset',
                    options: ['M', 'D', '90T'],
                    options_label: ['Month', 'Day', '90 hour']
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
                    label:'Allocate to'
                }
            ],
            variable: []
        },
        'pd107': {
            id: 'tz_localize',
            name: 'Timezone Localize',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to',
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
                    default: 'True'
                }
            ]
        },
        'pd108': {
            id: 'tz_convert',
            name: 'Timezone Convert',
            library: 'pandas',
            description: '',
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
                    label:'Allocate to',
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
                    default: 'True'
                }
            ]
        },
        'pdParr_timestamp': {
            id: 'Timestamp',
            name: 'Timestamp',
            library: 'pandas',
            description: 'Create Timestamp object',
            code: '${o0} = pd.Timestamp(${v})',
            input: [
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Allocate to'
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
                    label:'Allocate to'
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
                    label:'Allocate to',
                    var_type: ['Series', 'DataFrame']
                }
            ],
            variable: [
                {
                    name: 'method',
                    type: 'var',
                    label: 'Method',
                    component: 'option_select',
                    default: 'None',
                    options: ['None', "'ffill'", "'bfill'"]
                },
                {
                    name: 'normalize',
                    type: 'bool',
                    label: 'Normalize',
                    component: 'bool_checkbox',
                    default: 'False'
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
            description: '',
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
                    label:'Allocate to'
                }
            ],
            variable: [
                {
                    name: 'freq',
                    label: 'Frequency',
                    type: 'text',
                    options: ['s', 'T', 'H', 'D', 'B', 'W', 'W-MON', 'MS', 'M', 'BMS', 'BM'],
                    options_label: ['second', 'minute', 'hour', 'day', 'weekdays', 'week(Sunday)', 'week(Monday)', 
                        'first day of month', 'last day of month', 'first weekday of month', 'last weekday of month']
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
                    default: 'True'
                }
            ]
        },
        'pd113': {
            id: 'to_timestamp',
            name: 'To Timestamp',
            library: 'pandas',
            description: 'Convert from PeriodIndex to DatetimeIndex',
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
                    label:'Allocate to'
                }
            ],
            variable: [
                {
                    name: 'freq',
                    label: 'Frequency',
                    type: 'text',
                    options: ['s', 'T', 'H', 'D', 'B', 'W', 'W-MON', 'MS', 'M', 'BMS', 'BM'],
                    options_label: ['second', 'minute', 'hour', 'day', 'weekdays', 'week(Sunday)', 'week(Monday)', 
                    'first day of month', 'last day of month', 'first weekday of month', 'last weekday of month']
                },
                {
                    name: 'how',
                    label: 'How', // TODO:
                    type: 'text',
                    component: 'option_select',
                    options : ['start', 'end']
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
                    default: 'True'
                }
            ]
        },
        'pdParr_periodIndex': {
            id: 'PeriodIndex',
            name: 'PeriodIndex',
            library: 'pandas',
            description: 'Create PeriodIndex',
            code: '${o0} = pd.PeriodIndex(${v})',
            input: [
            ],
            output: [
                {
                    name:'o0',
                    type:'var',
                    label:'Allocate to'
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
                    default: 'False'
                },
                {
                    name: 'freq',
                    type: 'text',
                    label: 'Frequency',
                    component: 'option_select',
                    options: ['s', 'T', 'H', 'D', 'B', 'W', 'W-MON', 'MS', 'M', 'BMS', 'BM'],
                    options_label: ['second', 'minute', 'hour', 'day', 'weekdays', 'week(Sunday)', 'week(Monday)', 
                    'first day of month', 'last day of month', 'first weekday of month', 'last weekday of month']
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
            description: '',
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
                    label:'Allocate to'
                }
            ],
            variable: [
                {
                    name: 'min_periods',
                    type: 'int',
                    label: 'Minimum Periods',
                },
                {
                    name: 'center',
                    type: 'bool',
                    label: 'Center',
                    default: 'False',
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
            description: '',
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
                    label:'Allocate to'
                }
            ],
            variable: [
                {
                    name: 'com',
                    type: 'float',
                    label: 'Com',
                    help: 'com≥0, α=1/(1+com)'
                },
                {
                    name: 'span',
                    type: 'float',
                    label: 'Span',
                    help: 'span≥1, α=2/(span+1)'
                },
                {
                    name: 'halflife',
                    type: 'float',
                    label: 'Half Life', 
                    help: 'halflife>0, α=1−exp(log(0.5)/halflife)'
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
                    default: 'True',
                    component: 'bool_checkbox'
                },
                {
                    name: 'ignore_na',
                    type: 'bool',
                    label: 'Ignore NA',
                    default: 'False',
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
            description: '',
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
                    label:'Allocate to'
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
                    options_label: ['fill with front value', 'fill with back value']
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
                    options_label: ['second', 'minute', 'hour', 'day', 'weekdays', 'week(Sunday)', 'week(Monday)', 
                        'first day of month', 'last day of month', 'first weekday of month', 'last weekday of month']
                },
            ]
        },
        'pd118': {
            id: 'corr',
            name: 'Correlation',
            library: 'pandas',
            description: 'correlation between columns',
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
                    label:'Allocate to'
                }
            ],
            variable: [
                {
                    name: 'method',
                    type: ['text', 'var'],
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
            description: 'correlation',
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
                    label:'Allocate to'
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
                    default: 'False',
                    component: 'bool_checkbox'
                },
                {
                    name: 'method',
                    type: ['text', 'var'],
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
            description: 'covariance between all features',
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
                    label:'Allocate to'
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
        'pd_plot': {
            id: 'plot',
            name: 'Plot',
            library: 'pandas',
            description: 'create chart',
            code: '${i0}.plot(${v}${etc})\nplt.show()',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'DataFrame',
                    var_type: ['DataFrame', 'Series'],
                    required: true
                }
            ],
            output: [
            ],
            variable: [
                {
                    name: 'kind',
                    type: 'text',
                    label: 'Chart Type',
                    default: 'line',
                    component: 'option_select',
                    options: ['line', 'bar', 'barh', 'hist', 'box', 'kde', 'area', 'pie', 'scatter', 'hexbin'],
                    options_label: ['Line', 'Bar', 'Barh', 'Hist', 'Box', 'Kernel Density Estimation', 'Area', 'Pie', 'Scatter', 'Hexbin']
                },
                {
                    name: 'title',
                    type: 'text',
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
                    component: 'input_number',
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
                    default: 'False'
                },
                {
                    name: 'legend',
                    type: 'bool',
                    label: 'Show Legend',
                    component: 'bool_checkbox',
                    default: 'False'
                },
                {
                    name: 'rot',
                    type: 'int',
                    component: 'input_number',
                    label: 'X Label Rotation'
                },
                {
                    name: 'xlabel',
                    type: 'text',
                    label: 'X Label'
                },
                {
                    name: 'ylabel',
                    type: 'text',
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
                    placeholder: "['tick', ...]"
                },
                {
                    name: 'yticks',
                    type: 'list',
                    label: 'Y Ticks',
                    placeholder: "['tick', ...]"
                },
                {
                    name: 'style',
                    type: ['list', 'dict'],
                    label: 'Style',
                    placeholder: '["-", "--", "-.", ":"]',
                    help: 'Length of columns and style list must be same'
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
                    default: 'False',
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
                    default: 'True',
                    component: 'bool_checkbox'
                },
                {
                    name: 'stacked',
                    type: 'bool',
                    label: 'Stacked',
                    default: 'False',//true in area
                    component: 'bool_checkbox'
                }
            ],
        },
        'pd123': {
            id: 'readExcel',
            name: 'Read Excel',
            library: 'pandas',
            description: 'excel to pandas object',
            code: '${o0} = pd.read_excel(${i0}${v}${etc})',
            input: [
                {
                    name: 'i0',
                    type: 'text',
                    label: 'File Path',
                    component: 'file'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Allocate to'
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
            description: 'DataFrame to excel file',
            code: '${i0}.to_excel(${i1}${v}${etc})',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'DataFrame',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series']
                },
                {
                    name: 'i1',
                    type: 'text',
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
                    name: 'i0',
                    type: 'var',
                    label: 'Subset Code',
                    component: 'var_select',
                    var_type: ['DataFrame']
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Allocate to'
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
                    name: 'i0',
                    type: 'var',
                    label: 'Code',
                    component: 'textarea',
                    var_type: ['DataFrame']
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Allocate to'
                }
            ]
        },
        'pdIdt_size': {
            id: 'size',
            name: 'Size', 
            library: 'pandas',
            description: 'pandas object size info',
            code: '${o0} = ${i0}.size',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['DataFrame', 'Series', 'Index']
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Allocate to'
                }
            ]
        },
        'pdGrp_size': {
            id: 'groupby_size',
            name: 'Size',
            library: 'pandas',
            description: 'groupby size info',
            code: '${o0} = ${i0}.size()',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    label: 'Target Variable',
                    component: 'var_select',
                    var_type: ['GroupBy']
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Allocate to'
                }
            ]
        }
    }

    return {
        PANDAS_FUNCTION: PANDAS_FUNCTION
    };
});