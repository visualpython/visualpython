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
     *          usePair
     *          code
     *      }
     * ]
     */
    var PYTHON_LIBRARIES = {
        'pyBuilt_abs': {
            name: 'abs',
            library: 'python',
            description: '',
            code: '${o0} = abs(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Number',
                    component: ['input_number'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_all': {
            name: 'all',
            library: 'python',
            description: '',
            code: '${o0} = all(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_any': {
            name: 'any',
            library: 'python',
            description: '',
            code: '${o0} = any(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_ascii': {
            name: 'ascii',
            library: 'python',
            description: '',
            code: '${o0} = ascii(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_bin': {
            name: 'bin',
            library: 'python',
            description: '',
            code: '${o0} = bin(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Number',
                    component: ['input_number'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_bool': {
            name: 'bool',
            library: 'python',
            description: '',
            code: '${o0} = bool(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Expression'
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_breakpoint': {
            name: 'breakpoint',
            library: 'python',
            description: '',
            code: 'breakpoint()',
            options: [
            ]
        },
        'pyBuilt_bytearray': {
            name: 'bytearray',
            library: 'python',
            description: '',
            code: '${o0} = bytearray(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Source',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_bytes': {
            name: 'bytes',
            library: 'python',
            description: '',
            code: '${o0} = bytes(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Source',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_callable': {
            name: 'callable',
            library: 'python',
            description: '',
            code: '${o0} = callable(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Object',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_chr': {
            name: 'chr',
            library: 'python',
            description: '',
            code: '${o0} = chr(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input ASCII',
                    component: ['input_number'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_classmethod': {
            name: 'classmethod',
            library: 'python',
            description: '',
            code: '${o0} = classmethod(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Function',
                    component: ['var_select'],
                    var_type: ['function'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_complex': {
            name: 'complex',
            library: 'python',
            description: '',
            code: '${o0} = complex(${i0}${i1})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Real',
                    placeholder: 'real/expression'
                },
                {
                    name: 'i1',
                    label: 'Input Imag',
                    code: ', ${i1}',
                    component: ['input_number']
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_delattr': {
            name: 'delattr',
            library: 'python',
            description: '',
            code: '${o0} = delattr(${i0}, ${i1})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Object',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'i1',
                    label: 'Attribute Name',
                    type: 'text',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_dict': {
            name: 'dict',
            library: 'python',
            description: '',
            code: '${o0} = dict(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    component: ['var_select']
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_dir': {
            name: 'dir',
            library: 'python',
            description: '',
            code: '${o0} = dir(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Data',
                    component: ['var_select'],
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_divmod': {
            name: 'divmod',
            library: 'python',
            description: '',
            code: '${o0} = divmod(${i0}, ${i1})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Number to Divide',
                    component: ['input_number'],
                    required: true
                },
                {
                    name: 'i1',
                    label: 'Input Divider',
                    component: ['input_number'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_enumerate': {
            name: 'enumerate',
            library: 'python',
            description: '',
            code: '${o0} = enumerate(${i0}${start})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'start',
                    label: 'Start Index',
                    component: ['input_number'],
                    code: ', start=${start}'
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_eval': {
            name: 'eval',
            library: 'python',
            description: '',
            code: '${o0} = eval(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_exec': {
            name: 'exec',
            library: 'python',
            description: '',
            code: '${o0} = exec(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Object',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_filter': {
            name: 'filter',
            library: 'python',
            description: '',
            code: '${o0} = filter(${i0}, ${i1})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Function',
                    component: ['var_select'],
                    var_type: ['function'],
                    required: true
                },
                {
                    name: 'i1',
                    label: 'Input Iterable Data',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_float': {
            name: 'float',
            library: 'python',
            description: '',
            code: '${o0} = float(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data'
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_format': {
            name: 'format',
            library: 'python',
            description: '',
            code: '${o0} = format(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_frozenset': {
            name: 'frozenset',
            library: 'python',
            description: '',
            code: '${o0} = frozenset(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    component: ['var_select', 'ndarr', '1darr'],
                    componentCode: ['', '(${i0})', '']
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_getattr': {
            name: 'getattr',
            library: 'python',
            description: '',
            code: '${o0} = getattr(${i0}, ${i1})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Object',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'i1',
                    label: 'Attribute Name',
                    type: 'text',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_globals': {
            name: 'globals',
            library: 'python',
            description: '',
            code: '${o0} = globals()',
            options: [
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_hasattr': {
            name: 'hasattr',
            library: 'python',
            description: '',
            code: '${o0} = hasattr(${i0}, ${i1})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Object',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'i1',
                    label: 'Attribute Name',
                    type: 'text',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_hash': {
            name: 'hash',
            library: 'python',
            description: '',
            code: '${o0} = hash(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_help': {
            name: 'help',
            library: 'python',
            description: '',
            code: 'help(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Object',
                    component: ['var_select']
                }
            ]
        },
        'pyBuilt_hex': {
            name: 'hex',
            library: 'python',
            description: '',
            code: '${o0} = hex(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Number',
                    component: ['input_number'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_id': {
            name: 'id',
            library: 'python',
            description: '',
            code: '${o0} = id(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Object',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_input': {
            name: 'input',
            library: 'python',
            description: '',
            code: '${o0} = input(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Prompt'
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_int': {
            name: 'int',
            library: 'python',
            description: '',
            code: '${o0} = int(${i0}${base})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    required: true
                },
                {
                    name: 'base',
                    label: 'Base',
                    component: ['input_number'],
                    placeholder: '10',
                    code: ", base=${base}"
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_isinstance': {
            name: 'isinstance',
            library: 'python',
            description: '',
            code: '${o0} = isinstance(${i0}, ${i1})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Object',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'i1',
                    label: 'Class Info',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_issubclass': {
            name: 'issubclass',
            library: 'python',
            description: '',
            code: '${o0} = issubclass(${i0}, ${i1})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Object',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'i1',
                    label: 'Class Info',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_iter': {
            name: 'iter',
            library: 'python',
            description: '',
            code: '${o0} = iter(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Object',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_len': {
            name: 'len',
            library: 'python',
            description: '',
            code: '${o0} = len(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Object',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_list': {
            name: 'list',
            library: 'python',
            description: '',
            code: '${o0} = list(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Object',
                    component: ['var_select']
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_locals': {
            name: 'locals',
            library: 'python',
            description: '',
            code: '${o0} = locals()',
            options: [
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_map': {
            name: 'map',
            library: 'python',
            description: '',
            code: '${o0} = map(${i0}, ${i1})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Function',
                    component: ['var_select'],
                    var_type: ['function'],
                    required: true
                },
                {
                    name: 'i1',
                    label: 'Input Iterable Data',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_max': {
            name: 'max',
            library: 'python',
            description: '',
            code: '${o0} = max(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    component: ['var_select', 'ndarr'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_memoryview': {
            name: 'memoryview',
            library: 'python',
            description: '',
            code: '${o0} = memoryview(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Data',
                    var_type: ['bytes', 'bytearray'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_min': {
            name: 'min',
            library: 'python',
            description: '',
            code: '${o0} = min(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    component: ['var_select', 'ndarr'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_next': {
            name: 'next',
            library: 'python',
            description: '',
            code: '${o0} = next(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Data',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_object': {
            name: 'object',
            library: 'python',
            description: '',
            code: '${o0} = object()',
            options: [
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_oct': {
            name: 'oct',
            library: 'python',
            description: '',
            code: '${o0} = oct(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Number',
                    component: ['input_number'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_open': { // FIXME:
            name: 'open',
            library: 'python',
            description: '',
            code: '${o0} = open(${i0}${mode}${buffering}${encoding}${errors})',
            options: [
                {
                    name: 'i0',
                    label: 'Select File',
                    component: ['file'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                },
                {
                    name: 'mode',
                    label: 'Mode',
                    usePair: true,
                    component: ['option_select']
                },
                {
                    name: 'buffering',
                    label: 'Buffering',
                    usePair: true,
                    component: ['input_number']
                },
                {
                    name: 'encoding',
                    label: 'Encoding',
                    usePair: true,
                    component: ['option_suggest'],
                    type: 'text',
                    options: ['utf8', 'cp949', 'ascii'],
                    placeholder: 'encoding option'
                },
                {
                    name: 'error',
                    label: 'Errors',
                    usePair: true,
                    component: ['option_suggest'],
                    type: 'text',
                    options: ['strict', 'ignore', 'replace', 'surrogateescape', 
                        'xmlcharrefreplace', 'backslashreplace', 'namereplace']
                }
            ]
        },
        'pyBuilt_ord': {
            name: 'ord',
            library: 'python',
            description: '',
            code: '${o0} = ord(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Enter Character',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_pow': {
            name: 'pow',
            library: 'python',
            description: '',
            code: '${o0} = pow(${i0}, ${i1})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Base',
                    placeholder: 'base/expression',
                    required: true
                },
                {
                    name: 'i0',
                    label: 'Exponent',
                    component: ['input_number'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_print': {
            name: 'print',
            library: 'python',
            description: '',
            code: '${o0} = print(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Print Data'
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_property': {
            name: 'property',
            library: 'python',
            description: '',
            code: 'property(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Getter',
                    component: ['var_select'],
                    var_type: ['function'],
                    required: true
                },
                {
                    name: 'i0',
                    label: 'Setter',
                    component: ['var_select'],
                    var_type: ['function'],
                    required: true
                }
            ]
        },
        'pyBuilt_range': {
            name: 'range',
            library: 'python',
            description: '',
            code: '${o0} = range(${i0}${i1}${i2})',
            options: [
                {
                    name: 'i0',
                    label: 'Start Number',
                    component: ['input_number'],
                    code: '${i0}, '
                },
                {
                    name: 'i1',
                    label: 'Stop Number',
                    component: ['input_number'],
                    required: true
                },
                {
                    name: 'i2',
                    label: 'Step Number',
                    component: ['input_number'],
                    code: ', ${i2}'
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_repr': {
            name: 'repr',
            library: 'python',
            description: '',
            code: '${o0} = repr(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Object',
                    component: ['var_select']
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_reversed': {
            name: 'reversed',
            library: 'python',
            description: '',
            code: '${o0} = reversed(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Data',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_round': {
            name: 'round',
            library: 'python',
            description: '',
            code: '${o0} = round(${i0}${ndigits})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Number',
                    component: ['input_number'],
                    required: true
                },
                {
                    name: 'ndigits',
                    label: 'Number Digits',
                    component: ['input_number'],
                    usePair: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_set': {
            name: 'set',
            library: 'python',
            description: '',
            code: '${o0} = set(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Data',
                    component: ['var_select']
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_setattr': {
            name: 'setattr',
            library: 'python',
            description: '',
            code: '${o0} = setattr(${i0}, ${i1}, ${i2})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Object',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'i1',
                    label: 'Attribute Name',
                    type: 'text',
                    required: true
                },
                {
                    name: 'i2',
                    label: 'Attribute Value',
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_slice': {
            name: 'slice',
            library: 'python',
            description: '',
            code: '${o0} = slice(${i0}${i1}${i2})',
            options: [
                {
                    name: 'i0',
                    label: 'Start Number',
                    component: ['input_number'],
                    code: '${i0}, '
                },
                {
                    name: 'i1',
                    label: 'Stop Number',
                    component: ['input_number'],
                    required: true
                },
                {
                    name: 'i2',
                    label: 'Step Number',
                    component: ['input_number'],
                    code: ', ${i2}'
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_sorted': {
            name: 'sorted',
            library: 'python',
            description: '',
            code: '${o0} = sorted(${i0}${reverse})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Data',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'reverse',
                    label: 'Reverse',
                    usePair: true,
                    component: ['bool_select']
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_staticmethod': {
            name: 'staticmethod',
            library: 'python',
            description: '',
            code: '${o0} = staticmethod(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Function',
                    component: ['var_select'],
                    var_type: ['function'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_str': {
            name: 'str',
            library: 'python',
            description: '',
            code: '${o0} = str(${i0}${encoding})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data'
                },
                {
                    name: 'encoding',
                    label: 'Encoding',
                    usePair: true,
                    component: ['option_suggest'],
                    type: 'text',
                    options: ['utf8', 'cp949', 'ascii'],
                    placeholder: 'encoding option'
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_sum': {
            name: 'sum',
            library: 'python',
            description: '',
            code: '${o0} = sum(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    component: ['var_select', 'ndarr'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_super': {
            name: 'super',
            library: 'python',
            description: '',
            code: '${o0} = super(${i0}${i1})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Type'
                },
                {
                    name: 'i1',
                    label: 'Input Object or Type',
                    code: ', ${i1}',
                    component: ['var_select']
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_tuple': {
            name: 'tuple',
            library: 'python',
            description: '',
            code: '${o0} = tuple(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    component: ['var_select']
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_type': {
            name: 'type',
            library: 'python',
            description: '',
            code: '${o0} = type(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Data',
                    component: ['var_select'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_vars': {
            name: 'vars',
            library: 'python',
            description: '',
            code: '${o0} = vars(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Select Object',
                    component: ['var_select']
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        },
        'pyBuilt_zip': {
            name: 'zip',
            library: 'python',
            description: '',
            code: '${o0} = zip(${i0})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Object',
                    component: ['ndarr']
                },
                {
                    name: 'o0',
                    label: 'Allocate to'
                }
            ]
        }
    }
    return { PYTHON_LIBRARIES: PYTHON_LIBRARIES };
});