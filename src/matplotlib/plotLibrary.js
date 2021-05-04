define([
    'require'
    , 'jquery'
], function(requirejs, $) {

    var plotPackage = {
        'plot': {
            code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
            input: [
                {
                    name: 'i0',
                    label: '대상 변수명',
                    type: 'int',
                    required: false
                },
                {
                    name: 'kind',
                    type: 'var',
                    label: '차트 유형'
                },
                {
                    name: 'x',
                    type: 'var',
                    label: 'x축 데이터'
                },
                {
                    name: 'y',
                    type: 'var',
                    label: 'y축 데이터'
                }
            ],
            variable: [
                {
                    name: 'label',
                    type: 'text'
                },
                {
                    name: 'color', 
                    type: 'text',
                    default: '#000000'
                },
                {
                    name: 'marker',
                    type: 'text'
                },
                {
                    name: 'linestyle',
                    type: 'text',
                    component: 'option_select',
                    default: '-'
                }
            ]
        },
        'bar': {
            code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
            input: [
                {
                    name: 'i0',
                    label: '대상 변수명',
                    type: 'int',
                    required: false
                },
                {
                    name: 'kind',
                    type: 'var',
                    label: '차트 유형'
                },
                {
                    name: 'x',
                    type: 'var',
                    label: 'x축 데이터'
                },
                {
                    name: 'y',
                    type: 'var',
                    label: 'y축 데이터'
                }
            ],
            variable: [
                {
                    name: 'label',
                    type: 'text'
                },
                {
                    name: 'color', 
                    type: 'text',
                    default: '#000000'
                },
                {
                    name: 'linestyle',
                    type: 'text',
                    component: 'option_select',
                    default: '-'
                }
            ]
        },
        'barh': {
            code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
            input: [
                {
                    name: 'i0',
                    label: '대상 변수명',
                    type: 'int',
                    required: false
                },
                {
                    name: 'kind',
                    type: 'var',
                    label: '차트 유형'
                },
                {
                    name: 'x',
                    type: 'var',
                    label: 'x축 데이터'
                },
                {
                    name: 'y',
                    type: 'var',
                    label: 'y축 데이터'
                }
            ],
            variable: [
                {
                    name: 'label',
                    type: 'text'
                },
                {
                    name: 'color', 
                    type: 'text',
                    default: '#000000'
                },
                {
                    name: 'linestyle',
                    type: 'text',
                    component: 'option_select',
                    default: '-'
                }
            ]
        },
        'hist': {
            code: '${i0}.${kind}(${x}${v}${etc})',
            input: [
                {
                    name: 'i0',
                    label: '대상 변수명',
                    type: 'int',
                    required: false
                },
                {
                    name: 'kind',
                    type: 'var',
                    label: '차트 유형'
                },
                {
                    name: 'x',
                    type: 'var',
                    label: '데이터'
                }
            ],
            variable: [
                {
                    name: 'bins',
                    type: 'int',
                    required: true,
                    label: 'bins' // TODO: 라벨명
                },
                {
                    name: 'label',
                    type: 'text'
                },
                {
                    name: 'color', 
                    type: 'text',
                    default: '#000000'
                },
                {
                    name: 'linestyle',
                    type: 'text',
                    component: 'option_select',
                    default: '-'
                }
            ]
        },
        'boxplot': {
            code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
            input: [
                {
                    name: 'i0',
                    label: '대상 변수명',
                    type: 'int',
                    required: false
                },
                {
                    name: 'kind',
                    type: 'var',
                    label: '차트 유형'
                },
                {
                    name: 'x',
                    type: 'var',
                    label: 'x축 데이터'
                },
                {
                    name: 'y',
                    type: 'var',
                    label: 'y축 데이터'
                }
            ],
            variable: [
            ]
        },
        'stackplot': {
            code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
            input: [
                {
                    name: 'i0',
                    label: '대상 변수명',
                    type: 'int',
                    required: false
                },
                {
                    name: 'kind',
                    type: 'var',
                    label: '차트 유형'
                },
                {
                    name: 'x',
                    type: 'var',
                    label: 'x축 데이터'
                },
                {
                    name: 'y',
                    type: 'var',
                    label: 'y축 데이터'
                }
            ],
            variable: [
                {
                    name: 'color', 
                    type: 'text',
                    default: '#000000'
                },
                {
                    name: 'linestyle',
                    type: 'text',
                    component: 'option_select',
                    default: '-'
                }
            ]
        },
        'pie': {
            code: '${i0}.${kind}(${x}${v}${etc})',
            tailCode: "${i0}.axis('equal')",
            input: [
                {
                    name: 'i0',
                    label: '대상 변수명',
                    type: 'int',
                    required: false
                },
                {
                    name: 'kind',
                    type: 'var',
                    label: '차트 유형'
                },
                {
                    name: 'x',
                    type: 'var',
                    label: '데이터'
                }
            ],
            variable: [
            ]
        },
        'hexbin': {
            code: '${i0}.${kind}(${x}, ${y}${v}${etc})',
            tailCode: '${i0}.colorbar()', // 색상 막대 범례 표시
            input: [
                {
                    name: 'i0',
                    label: '대상 변수명',
                    type: 'int',
                    required: false
                },
                {
                    name: 'kind',
                    type: 'var',
                    label: '차트 유형'
                },
                {
                    name: 'x',
                    type: 'var',
                    label: 'x축 데이터'
                },
                {
                    name: 'y',
                    type: 'var',
                    label: 'y축 데이터'
                }
            ],
            variable: [
                {
                    name: 'label',
                    type: 'text'
                },
                {
                    name: 'color', 
                    type: 'text',
                    default: '#000000'
                }
            ]
        },
        'contour': {
            code: '${i0}.${kind}(${x}, ${y}, ${z}${v}${etc})',
            input: [
                {
                    name: 'i0',
                    label: '대상 변수명',
                    type: 'int',
                    required: false
                },
                {
                    name: 'kind',
                    type: 'var',
                    label: '차트 유형'
                },
                {
                    name: 'x',
                    type: 'var',
                    label: 'x축 데이터'
                },
                {
                    name: 'y',
                    type: 'var',
                    label: 'y축 데이터'
                },
                {
                    name: 'z',
                    type: 'var',
                    label: 'z축 데이터'
                }
            ],
            variable: [
                {
                    name: 'cmap',
                    type: 'text'
                },
                {
                    name: 'label',
                    type: 'text'
                }
            ]
        },
        'imshow': {
            code: '${i0}.${kind}(${z}${v}${etc})',
            input: [
                {
                    name: 'i0',
                    label: '대상 변수명',
                    type: 'int',
                    required: false
                },
                {
                    name: 'kind',
                    type: 'var',
                    label: '차트 유형'
                },
                {
                    name: 'z',
                    type: 'var',
                    label: 'z축 데이터'
                }
            ],
            variable: [
                {
                    name: 'extent', // [xmin, xmax, ymin, ymax]
                    type: 'var'
                },
                {
                    name: 'origin',
                    type: 'text'
                },
                {
                    name: 'cmap',
                    type: 'text'
                }
            ]
        }
    };

    var optionalPackage = {
        'title': {
            code: '${i0}.set_title(${title})',
            code2: 'plt.title(${title})',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    required: false
                },
                {
                    name: 'title',
                    type: 'text',
                    required: false
                }
            ]
        },
        'xlabel': {
            code: '${i0}.set_xlabel(${xlabel})',
            code2: 'plt.xlabel(${xlabel})',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    required: false
                },
                {
                    name: 'xlabel',
                    type: 'var',
                    required: false
                }
            ]
        },
        'ylabel': {
            code: '${i0}.set_ylabel(${ylabel})',
            code2: 'plt.ylabel(${ylabel})',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    required: false
                },
                {
                    name: 'ylabel',
                    type: 'var',
                    required: false
                }
            ]
        },
        'xlim': {
            code: '${i0}.set_xlim(${xlim})',
            code2: 'plt.xlim(${xlim})',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    required: false
                },
                {
                    name: 'xlim',
                    type: 'var',
                    required: false
                }
            ]
        },
        'ylim': {
            code: '${i0}.set_ylim(${ylim})',
            code2: 'plt.ylim(${ylim})',
            input: [
                {
                    name: 'i0',
                    type: 'var',
                    required: false
                },
                {
                    name: 'ylim',
                    type: 'var',
                    required: false
                }
            ]
        },
        'legend': {
            code: '${i0}.legend(${v})',
            code2: 'plt.legend(${v})',
            input: [
                {
                    name: 'i0',
                    type: 'var'
                }
            ],
            variable: [
                {
                    key: 'title',
                    name: 'legendTitle',
                    type: 'text'
                },
                {
                    key: 'label',
                    name: 'legendLabel',
                    type: 'var'
                },
                {
                    key: 'loc',
                    name: 'legendLoc',
                    type: 'text',
                    component: 'option_select',
                    default: 'best'
                }
            ]
        }
    };
    // plot 종류
    var plotKind = [
        'plot', 'bar', 'barh', 'hist', 'boxplot', 'stackplot',
        'pie', 'scatter', 'hexbin', 'contour', 'imshow', 'errorbar'
    ];
    var plotKindLangKo = {
        'plot': '플롯',
        'bar': '바 차트',
        'barh': '가로 바',
        'hist': '히스토그램',
        'boxplot': '박스 플롯',
        'stackplot': '스택 플롯',
        'pie': '파이 차트',
        'scatter': '스캐터 플롯',
        'hexbin': '헥스빈 플롯',
        'contour': '컨투어 플롯',
        'imshow': '이미지 플롯',
        'errorbar': '오차 막대'
    };
    // cmap 종류
    var cmap = [
        'viridis', 'plasma', 'inferno', 'magma', 'cividis'
        , 'Pastel1', 'Pastel2', 'Paired', 'Accent', 'Dark2', 'Set1', 'Set2', 'Set3', 'tab10', 'tab20', 'tab20b', 'tab20c'
    ];

    return { 
        package: plotPackage,
        optionalPackage: optionalPackage,
        plotKind: plotKind,
        plotKindLangKo: plotKindLangKo,
        cmap: cmap
    };
})