define([
], function () {
    /**
     * name
     * library
     * description
     * code
     * options: [
     *      {
     *          name
     *          label
     *          [optional]
     *          component : 
     *              - 1darr / 2darr / ndarr / scalar / param / dtype / tabblock
     *          default
     *          required
     *          asParam
     *          code
     *      }
     * ]
     */
    var NUMPY_LIBRARIES = {
        'np_array': {
            name: 'array',
            library: 'numpy',
            description: '',
            code: '${o0} = np.array(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_zeros': {
            name: 'zeros',
            library: 'numpy',
            description: '',
            code: '${o0} = np.zeros(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['1dlen', '2dlen', 'ndarr'],
                    componentCode: ['', '(${i0})', '(${i0})'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_ones': {
            name: 'ones',
            library: 'numpy',
            description: '',
            code: '${o0} = np.ones(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['1dlen', '2dlen', 'ndarr'],
                    componentCode: ['', '(${i0})', '(${i0})'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_empty': {
            name: 'empty',
            library: 'numpy',
            description: '',
            code: '${o0} = np.empty(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['1dlen', '2dlen', 'ndarr'],
                    componentCode: ['', '(${i0})', '(${i0})'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_copy': {
            name: 'copy',
            library: 'numpy',
            description: '',
            code: '${o0} = np.copy(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Parameter Variable',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_arange': {
            name: 'arange',
            library: 'numpy',
            description: '',
            code: '${o0} = np.arange(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    placeholder: '(start, stop, step)',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_concatenate': {
            name: 'concatenate',
            library: 'numpy',
            description: '',
            code: '${o0} = np.concatenate(${i0}${axis}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['ndarr'],
                    componentCode: ['(${i0})'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'axis',
                    label: 'Select Axis',
                    code: ', axis=${axis}',
                    component: ['option_select'],
                    options: [0,1]
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_stack': {
            name: 'stack',
            library: 'numpy',
            description: '',
            code: '${o0} = np.stack((${i0})${axis})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['ndarr'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'axis',
                    label: 'Select Axis',
                    code: ', axis=${axis}',
                    component: ['option_select'],
                    options: [0,1]
                }
            ]
        },
        'np_dstack': {
            name: 'dstack',
            library: 'numpy',
            description: '',
            code: '${o0} = np.dstack((${i0}))',
            options: [
                {
                    name: 'i0',
                    label: 'Input Stacking Array',
                    component: ['ndarr'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_hstack': {
            name: 'hstack',
            library: 'numpy',
            description: '',
            code: '${o0} = np.hstack((${i0}))',
            options: [
                {
                    name: 'i0',
                    label: 'Input Stacking Array',
                    component: ['ndarr'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_vstack': {
            name: 'vstack',
            library: 'numpy',
            description: '',
            code: '${o0} = np.vstack((${i0}))',
            options: [
                {
                    name: 'i0',
                    label: 'Input Stacking Array',
                    component: ['ndarr'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_split': {
            name: 'split',
            library: 'numpy',
            description: '',
            code: '${o0} = np.split(${param},(${i0})${axis})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Stacking Array',
                    component: ['ndarr'],
                    required: true
                },
                {
                    name: 'param',
                    label: 'Parameter Variable',
                    placeholder: 'Input Variable',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'axis',
                    label: 'Select Axis',
                    code: ', axis=${axis}',
                    component: ['option_select'],
                    options: [0,1]
                }
            ]
        },
        'np_dsplit': {
            name: 'dsplit',
            library: 'numpy',
            description: '',
            code: '${o0} = np.dsplit(${param},(${i0}))',
            options: [
                {
                    name: 'i0',
                    label: 'Input Stacking Array',
                    component: ['ndarr'],
                    required: true
                },
                {
                    name: 'param',
                    label: 'Parameter Variable',
                    placeholder: 'Input Variable',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_hsplit': {
            name: 'hsplit',
            library: 'numpy',
            description: '',
            code: '${o0} = np.hsplit(${param},(${i0}))',
            options: [
                {
                    name: 'i0',
                    label: 'Input Stacking Array',
                    component: ['ndarr'],
                    required: true
                },
                {
                    name: 'param',
                    label: 'Parameter Variable',
                    placeholder: 'Input Variable',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_vsplit': {
            name: 'vsplit',
            library: 'numpy',
            description: '',
            code: '${o0} = np.vsplit(${param},(${i0}))',
            options: [
                {
                    name: 'i0',
                    label: 'Input Stacking Array',
                    component: ['ndarr'],
                    required: true
                },
                {
                    name: 'param',
                    label: 'Parameter Variable',
                    placeholder: 'Input Variable',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_reshape': {
            name: 'reshape',
            library: 'numpy',
            description: '',
            code: '${o0} = ${i0}.reshape(${param})',
            options: [
                {
                    name: 'param',
                    label: 'Input Parameter',
                    component: ['1dlen', '2dlen', '3dlen'],
                    required: true
                },
                {
                    name: 'i0',
                    label: 'Call Variable',
                    component: ['ndarr'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_transpose': {
            name: 'transpose',
            library: 'numpy',
            description: '',
            code: '${o0} = np.transpose(${param},(${i0}))',
            options: [
                {
                    name: 'param',
                    label: 'Parameter Variable',
                    placeholder: 'Input Variable',
                    required: true
                },
                {
                    name: 'i0',
                    label: 'Input Axis',
                    component: ['ndarr'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_T': {
            name: 'T',
            library: 'numpy',
            description: '',
            code: '${o0} = ${i0}.T()',
            options: [
                {
                    name: 'i0',
                    label: 'Call Variable',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_flatten': {
            name: 'flatten',
            library: 'numpy',
            description: '',
            code: '${o0} = ${i0}.flatten()',
            options: [
                {
                    name: 'i0',
                    label: 'Call Variable',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_mean': {
            name: 'mean',
            library: 'numpy',
            description: '',
            code: '${o0} = np.mean(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_var': {
            name: 'var',
            library: 'numpy',
            description: '',
            code: '${o0} = np.var(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_std': {
            name: 'std',
            library: 'numpy',
            description: '',
            code: '${o0} = np.std(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_max': {
            name: 'max',
            library: 'numpy',
            description: '',
            code: '${o0} = np.max(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_min': {
            name: 'min',
            library: 'numpy',
            description: '',
            code: '${o0} = np.min(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_median': {
            name: 'median',
            library: 'numpy',
            description: '',
            code: '${o0} = np.median(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_percentile': {
            name: 'percentile',
            library: 'numpy',
            description: '',
            code: '${o0} = np.percentile(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_linalg_inv': {
            name: 'linalg.inv',
            library: 'numpy',
            description: '',
            code: '${o0} = np.linalg.inv(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['param', '2darr'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_linalg_det': {
            name: 'linalg.det',
            library: 'numpy',
            description: '',
            code: '${o0} = np.linalg.det(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['2darr', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_linalg_eig': {
            name: 'linalg.eig',
            library: 'numpy',
            description: '',
            code: '${o0} = np.linalg.eig(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['2darr', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_linalg_svd': {
            name: 'linalg.svd',
            library: 'numpy',
            description: '',
            code: '${o0} = np.linalg.svd(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['2darr', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_trace': { // FIXME:
            name: 'trace',
            library: 'numpy',
            description: '',
            code: '${o0} = np.trace(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['2darr', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                }
            ]
        },
        'np_dot': {
            name: 'dot',
            library: 'numpy',
            description: '',
            code: '${o0} = np.dot(${i0}, ${i1}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'First Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'i1',
                    label: 'Second Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        'np_add': {
            name: 'add',
            library: 'numpy',
            description: '',
            code: '${o0} = np.add(${i0}, ${i1}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'First Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'i1',
                    label: 'Second Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        },
        "np_divide": {
            "name": "divide",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.divide(${i0}, ${i1}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_floor_divide": {
            "name": "floor_divide",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.floor_divide(${i0}, ${i1}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_fmax": {
            "name": "fmax",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.fmax(${i0}, ${i1}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_fmin": {
            "name": "fmin",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.fmin(${i0}, ${i1}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_maxmimum": {
            "name": "maxmimum",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.maxmimum(${i0}, ${i1}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_sum": {
            "name": "sum",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.sum(${i0}${axis})",
            "options": [
                {
                    "name": "i0",
                    "label": "Parameter Variable",
                    "placeholder": "Input variable",
                    "required": true
                },
                {
                    name: 'axis',
                    label: 'Select Axis',
                    code: ', axis=${axis}',
                    component: ['option_select'],
                    options: [0,1]
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                }
            ]
        },
        "np_mod": {
            "name": "mod",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.mod(${i0}, ${i1}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_multiply": {
            "name": "multiply",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.multiply(${i0}, ${i1}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_prod": {
            "name": "prod",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.prod(${i0}${axis})",
            "options": [
                {
                    "name": "i0",
                    "label": "Parameter Variable",
                    "placeholder": "Input variable",
                    "required": true
                },
                {
                    name: 'axis',
                    label: 'Select Axis',
                    code: ', axis=${axis}',
                    component: ['option_select'],
                    options: [0,1]
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                }
            ]
        },
        "np_power": {
            "name": "power",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.power(${i0}, ${i1}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_subtract": {
            "name": "subtract",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.subtract(${i0}, ${i1}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_abs": {
            "name": "abs",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.abs(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_ceil": {
            "name": "ceil",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.ceil(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_exp": {
            "name": "exp",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.exp(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_fabs": {
            "name": "fabs",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.fabs(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_floor": {
            "name": "floor",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.floor(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_log": {
            "name": "log",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.log(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_log1p": {
            "name": "log1p",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.log1p(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_log2": {
            "name": "log2",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.log2(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_log10": {
            "name": "log10",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.log10(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_modf": {
            "name": "modf",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.modf(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_rint": {
            "name": "rint",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.rint(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_sqrt": {
            "name": "sqrt",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.sqrt(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_square": {
            "name": "square",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.square(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_sin": {
            "name": "sin",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.sin(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_cos": {
            "name": "cos",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.cos(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_tan": {
            "name": "tan",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.tan(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_arcsin": {
            "name": "arcsin",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.arcsin(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_arccos": {
            "name": "arccos",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.arccos(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_arctan": {
            "name": "arctan",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.arctan(${i0}${dtype})",
            "options": [
                {
                    "name": "i0",
                    "label": "Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
        "np_equal": {
            "name": "equal",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.equal(${i0}, ${i1})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                }
            ]
        },
        "np_greater": {
            "name": "greater",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.greater(${i0}, ${i1})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                }
            ]
        },
        "np_greater_equal": {
            "name": "greater_equal",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.greater_equal(${i0}, ${i1})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                }
            ]
        },
        "np_less": {
            "name": "less",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.less(${i0}, ${i1})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                }
            ]
        },
        "np_less_equal": {
            "name": "less_equal",
            "library": "numpy",
            "description": "",
            "code": "${o0} = np.less_equal(${i0}, ${i1})",
            "options": [
                {
                    "name": "i0",
                    "label": "First Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "i1",
                    "label": "Second Input Parameter",
                    "component": [
                        "1darr",
                        "2darr",
                        "scalar",
                        "param"
                    ],
                    "required": true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                }
            ]
        },
        'np_randint': {
            name: 'randint',
            library: 'numpy',
            description: '',
            code: "${o0} = np.random.randint(${i0})",
            options: [
                {
                    "name": "i0",
                    "label": "Input Number",
                    "placeholder": "Input Number",
                    required: true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                }
            ]
        },
        'np_rand': {
            name: 'rand',
            library: 'numpy',
            description: '',
            code: "${o0} = np.random.rand(${i0}, ${i1}${dtype})",
            options: [
                {
                    "name": "i0",
                    "label": "First Input Number",
                    "placeholder": "Input Number",
                    required: true
                },
                {
                    "name": "i1",
                    "label": "Second Input Number",
                    "placeholder": "Input Number",
                    required: true
                },
                {
                    "name": "o0",
                    "label": "Allocate to",
                    "placeholder": "New variable"
                },
                {
                    "name": "dtype",
                    "label": "Select Data Type",
                    "code": ", dtype=${dtype}",
                    "component": [
                        "dtype"
                    ]
                }
            ]
        },
    };

    return { 
        NUMPY_LIBRARIES: NUMPY_LIBRARIES
    };

});