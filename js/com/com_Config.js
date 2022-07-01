/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_Config.js
 *    Author          : Black Logic
 *    Note            : Configuration and settings control
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 16
 *    Change Date     :
 */
//============================================================================
// [CLASS] Configuration
//============================================================================
define([
    './com_Const', 
    './com_util', 
    './com_interface',
    'text!vp_base/python/userCommand.py',
], function(com_Const, com_util, com_interface, userCommandFile) {
	'use strict';
    //========================================================================
    // Define Inner Variable
    //========================================================================
    /**
     * Type of mode
     */
    const _MODE_TYPE = {
        DEVELOP : 0,
        RELEASE : 1
    }

    //========================================================================
    // Declare Class
    //========================================================================
    /**
     * Configuration and settings
     */
    class Config {
        //========================================================================
        // Constructor
        //========================================================================
        constructor(initialData) {
            // initial configuration
            this.data = {
                // Configuration
                'vpcfg': {
                    
                },
                // User defined code for Snippets
                'vpudf': {
                    'default import': [
                        'import numpy as np',
                        'import pandas as pd',
                        'import matplotlib.pyplot as plt',
                        '%matplotlib inline',
                        'import seaborn as sns',
                        'import plotly.express as px'
                    ],
                    'matplotlib customizing': [
                        'import matplotlib.pyplot as plt',
                        '%matplotlib inline',
                        '',
                        "plt.rc('figure', figsize=(12, 8))",
                        '',
                        'from matplotlib import rcParams',
                        "rcParams['font.family'] = 'New Gulim'",
                        "rcParams['font.size'] = 10",
                        "rcParams['axes.unicode_minus'] = False"
                    ],
                    'as_float': [
                        'def as_float(x):',
                        '    """',
                        "    usage: df['col'] = df['col'].apply(as_float)",
                        '    """',
                        '    if not isinstance(x, str):',
                        '        return 0.0',
                        '    else:',
                        '        try:',
                        '            result = float(x)',
                        '            return result',
                        '        except ValueError:',
                        '            return 0.0'
                    ],
                    'as_int': [
                        'def as_int(x):',
                        '    """',
                        "    usage: df['col'] = df['col'].apply(as_int)",
                        '    """',
                        '    if not isinstance(x, str):',
                        '        return 0',
                        '    else:',
                        '        try:',
                        '            result = int(x)',
                        '            return result',
                        '        except ValueError:',
                        '            return 0.0'
                    ]
                },
                'vpimport': [
                    { library: 'numpy', alias:'np' },
                    { library: 'pandas', alias:'pd' },
                    { library: 'matplotlib.pyplot', alias:'plt',
                        include: [
                            '%matplotlib inline'
                        ]
                    },
                    { library: 'seaborn', alias:'sns' },
                    {
                        library: 'plotly.express', alias: 'px',
                        include: [
                            'from plotly.offline import init_notebook_mode',
                            'init_notebook_mode(connected=True)'
                        ]
                    }
                ]
            }

            this.data = {
                ...this.data,
                ...initialData
            }

            this.defaultConfig = {};
            this.metadataSettings = {};

            this.moduleDict = {
                'np': {
                    code: 'import numpy as np',
                    type: 'package'
                },
                'pd': {
                    code: 'import pandas as pd',
                    type: 'package'
                },
                'plt': {
                    code: 'import matplotlib.pyplot as plt\n%matplotlib inline',
                    type: 'package'
                },
                'sns': {
                    code: 'import seaborn as sns',
                    type: 'package'
                },
                'metrics': {
                    code: 'from sklearn import metrics',
                    type: 'package'
                },
                'ProfileReport': {
                    code: 'from pandas_profiling import ProfileReport',
                    type: 'package'
                },
                'px': {
                    code: 'import plotly.express as px\nfrom plotly.offline import init_notebook_mode\ninit_notebook_mode(connected=True)',
                    type: 'package'
                },
                'WordCloud': {
                    code: 'from wordcloud import WordCloud',
                    type: 'package'
                },
                'fitz': {
                    code: 'import fitz',
                    type: 'package'
                },
                'nltk': {
                    code: "import nltk\nnltk.download('punkt')",
                    type: 'package'
                },
                'Counter': {
                    code: 'from collections import Counter',
                    type: 'package'
                }
            }

            this._readDefaultConfig();
            this._readUserCommandList();
            
        }

        /**
         * Read dejault config
         */
        _readDefaultConfig() {
            // default values for system-wide configurable parameters
            this.defaultConfig = {
                indent: 4
            };
            // default values for per-notebook configurable parameters
            this.metadataSettings = {
                vp_config_version: '1.0.0',
                vp_signature: 'VisualPython',
                vp_position: {},
                vp_section_display: false,
                vp_note_display: false,
                vp_menu_width: Config.MENU_MIN_WIDTH,
                vp_note_width: Config.BOARD_MIN_WIDTH
            };
            
            let vp_width = Config.MENU_MIN_WIDTH + (this.metadataSettings.vp_note_display? Config.BOARD_MIN_WIDTH: 0) + Config.MENU_BOARD_SPACING;
            this.metadataSettings['vp_position'] = {
                // height: 'calc(100% - 110px)',
                // width: vp_width + 'px',
                // right: '0px',
                // top: '110px',
                width: vp_width
            }
        
            // merge default config
            $.extend(true, this.defaultConfig, this.metadataSettings);
        }

        _readUserCommandList() {
            let divider = '#'.repeat(6);
            // get list of codes (ignore first 2 items)
            let tmpList = userCommandFile.split(divider).slice(2);

            // match key-codes-description
            // { 'func_name': { code: '', description: '' } }
            let funcDict = {};
            let reg = /^def (.+)\(/;
            let name = '';
            let code = '';
            let desc = '';
            let packageAlias = {
                '_vp_np': 'np',
                '_vp_pd': 'pd',
                '_vp_plt': 'plt'
            }

            for (let i = 0; i < tmpList.length; i += 2) {
                desc = tmpList[i].trim();
                code = tmpList[i + 1].trim();
                let regResult = reg.exec(code);
                if (regResult !== null) {
                    name = regResult[1];
                    // convert code's package alias
                    Object.keys(packageAlias).forEach(key => {
                        let desAlias = packageAlias[key];
                        code = code.replaceAll(key + '.', desAlias + '.');
                    });
                    // list up
                    funcDict[name] = { code: code, type: 'function', description: desc };
                }
            }

            this.moduleDict = {
                ...this.moduleDict,
                ...funcDict
            }
        }

        /**
         * Read kernel functions for using visualpython
         * - manually click restart menu (MenuFrame.js)
         * - automatically restart on jupyter kernel restart (loadVisualpython.js)
         */
        readKernelFunction() {
            var libraryList = [ 
                'printCommand.py',
                'fileNaviCommand.py',
                'pandasCommand.py',
                'variableCommand.py',
                'visualizationCommand.py',
                // 'userCommand.py'
            ];
            let promiseList = [];
            libraryList.forEach(libName => {
                var libPath = com_Const.PYTHON_PATH + libName
                $.get(libPath).done(function(data) {
                    var code_init = data;
                    promiseList.push(vpKernel.execute(code_init));
                }).fail(function() {
                    console.log('visualpython - failed to read library file', libName);
                });
            });
            // run all promises
            let failed = false;
            Promise.all(promiseList).then(function(resultObj) {
            }).catch(function(resultObj) {
                failed = true;
                console.log('visualpython - failed to load library', resultObj);
            }).finally(function() {
                if (!failed) {
                    console.log('visualpython - loaded libraries', libraryList);
                } else {
                    console.log('visualpython - failed to load libraries');
                }
            });
        }

        getMode() {
            return Config.serverMode;
        }

        loadData(configKey = 'vpudf') {
            return new Promise(function(resolve, reject) {
                Jupyter.notebook.config.load();
                Jupyter.notebook.config.loaded.then(function() {
                    var data = Jupyter.notebook.config.data[configKey];
                    if (data == undefined) {
                        data = {};
                    }
                    resolve(data);
                });
            });
        };

        /**
         * Get configuration data (on server)
         * @param {String} dataKey 
         * @param {String} configKey 
         * @returns 
         */
        getData(dataKey='', configKey='vpudf') {
            return new Promise(function(resolve, reject) {
                Jupyter.notebook.config.load();
                Jupyter.notebook.config.loaded.then(function() {
                    var data = Jupyter.notebook.config.data[configKey];
                    if (data == undefined) {
                        resolve(data);
                        return;
                    }
                    if (dataKey == '') {
                        resolve(data);
                        return;
                    }
                    if (Object.keys(data).length > 0) {
                        resolve(data[dataKey]);
                        return;
                    }
                    reject('No data available.');
                });
            });
        }

        getDataSimple(dataKey='', configKey='vpudf') {
            Jupyter.notebook.config.load();
            var data = Jupyter.notebook.config.data[configKey];
            if (data == undefined) {
                return undefined;
            }
            if (dataKey == '') {
                return data;
            }
            if (Object.keys(data).length > 0) {
                return data[dataKey];
            }
            
            return undefined;
        }

        /**
         * Set configuration data (on server)
         * @param {Object} dataObj 
         * @param {String} configKey 
         */
        setData(dataObj, configKey='vpudf') {
            // set data using key
            Jupyter.notebook.config.loaded.then(function() {
                Jupyter.notebook.config.update({[configKey]: dataObj});
            });
        }

        removeData(key, configKey = 'vpudf') {
             // if set value to null, it removes from config data
            Jupyter.notebook.config.loaded.then(function() {
                Jupyter.notebook.config.update({[configKey]: {[key]: null}});
            });
        }

        /**
         * Get metadata (on jupyter file)
         * @param {String} dataKey 
         * @param {String} configKey 
         */
        getMetadata(dataKey='', configKey='vp') {
            let metadata = Jupyter.notebook.metadata[configKey];
            if (metadata) {
                // update this metadataSetting
                this.metadataSettings = {
                    ...this.metadataSettings,
                    ...metadata
                };
                // no datakey, return all metadata
                if (dataKey == '') {
                    return metadata;
                }
                return metadata[dataKey];
            }
            return {};
        }

        /**
         * Set metadata (on jupyter file)
         * @param {Object} dataObj 
         * @param {String} configKey 
         */
        setMetadata(dataObj, configKey='vp') {
            let oldData = Jupyter.notebook.metadata[configKey];
            Jupyter.notebook.metadata[configKey] = {
                ...oldData,
                ...dataObj
            };
            Jupyter.notebook.set_dirty();

            // update this metadataSetting
            this.metadataSettings = {
                ...this.metadataSettings,
                ...dataObj
            };

        }

        /**
         * Reset metadata (on jupyter file)
         * @param {String} configKey 
         */
        resetMetadata(configKey='vp') {
            Jupyter.notebook.metadata[configKey] = {};
        }

        /**
         * Check vp pypi package version (Promise)
         * usage:
         *  vpConfig.getPackageVersion('visualpython').then(function(version) {
         *      // do something after loading version
         *      ...
         *  }).catch(function(err) {
         *      // error handling
         *      ...
         *  })
         */
        getPackageVersion(packName='visualpython') {
            let url = `https://pypi.org/pypi/${packName}/json`;
            // using the Fetch API
            return new Promise(function(resolve, reject) {
                try {
                    fetch(url).then(function (response) {
                        // if (response.statusCode === 200) {
                        //     return response.json();
                        // } else if (response.statusCode === 204) {
                        //     throw new Error('No Contents', response);
                        // } else if (response.statusCode === 404) {
                        //     throw new Error('Page Not Found', response);
                        // } else if (response.statusCode === 500) {
                        //     throw new Error('Internal Server Error', response);
                        // } else {
                        //     throw new Error('Unexpected Http Status Code', response);
                        // }
                        if (response.ok) {
                            return response.json();
                        } else {
                            throw new Error('Error', response);
                        }
                    }).then(function (data) {
                        resolve(data.info.version);
                    }).catch(function(err) {
                        let errMsg = err.message;
                        if (errMsg.includes('Failed to fetch')) {
                            errMsg = 'Network connection error';
                        }
                        reject(errMsg);
                    });
                } catch (err) {
                    reject(err);
                }
            });
        }
        
        getVpInstalledVersion() {
            return Config.version;
        }

        checkVpVersion(background=false) {
            let that = this;
            let nowVersion = this.getVpInstalledVersion();
            this.getPackageVersion().then(function(latestVersion) {
                if (nowVersion === latestVersion) {
                    // if it's already up to date
                    // hide version update icon
                    $('#vp_versionUpdater').hide();
                    if (background) {
                        ;
                    } else {
                        let msg = com_util.formatString('Visual Python is up to date. ({0})', latestVersion);
                        com_util.renderInfoModal(msg);
                    }
                    // update version_timestamp
                    that.setData({ 'version_timestamp': new Date().getTime() }, 'vpcfg');
                } else {
                    let msg = com_util.formatString('Visual Python updates are available.<br/>(Latest version: {0} / Your version: {1})', 
                                    latestVersion, nowVersion);
                    // show version update icon
                    $('#vp_versionUpdater').attr('title', msg.replace('<br/>', ''));
                    $('#vp_versionUpdater').data('version', latestVersion);
                    $('#vp_versionUpdater').show();
                    
                    // render update modal
                    com_util.renderModal({
                        title: 'Update version', 
                        message: msg,
                        buttons: ['Cancel', 'Update'],
                        defaultButtonIdx: 0,
                        buttonClass: ['cancel', 'activated'],
                        finish: function(clickedBtnIdx) {
                            switch (clickedBtnIdx) {
                                case 0:
                                    // cancel
                                    break;
                                case 1:
                                    // update
                                    let info = [
                                        '## Visual Python Upgrade',
                                        'NOTE: ',
                                        '- Refresh your web browser to start a new version.',
                                        '- Save VP Note before refreshing the page.'
                                    ];
                                    com_interface.insertCell('markdown', info.join('\n'));
                                    com_interface.insertCell('code', '!pip install visualpython --upgrade');
                                    com_interface.insertCell('code', '!visualpy install');

                                    // update version_timestamp
                                    that.setData({ 'version_timestamp': new Date().getTime() }, 'vpcfg');
                                    // hide updater
                                    $('#vp_versionUpdater').hide();
                                    break;
                            }
                        }
                    });
                }
            }).catch(function(err) {
                if (background) {
                    vpLog.display(VP_LOG_TYPE.ERROR, 'Version Checker - ' + err);
                } else {
                    com_util.renderAlertModal(err);
                }
            })
        }

        getMenuGroupLabel(key = '') {
            return Config.MENU_GROUP_DICT[key];
        }

        getMenuGroupDict() {
            return Config.MENU_GROUP_DICT;
        }

        getDataTypes() {
            return Config.DATA_TYPES;
        }

        getMLDataDict(key = '') {
            if (key == '') {
                return Config.ML_DATA_DICT;
            }
            return Config.ML_DATA_DICT[key];
        }

        getMLDataTypes() {
            return Config.ML_DATA_TYPES;
        }

        getMLCategories() {
            return Object.keys(Config.ML_DATA_DICT);
        }

        getModuleCode(modName='') {
            if (modName == '') {
                return this.moduleDict;
            }
            try {
                return this.moduleDict[modName];
            } catch {
                return null;
            }
        }

    }

    //========================================================================
    // Define static variable
    //========================================================================
    /**
     * FIXME: before release, change it to _MODE_TYPE.RELEASE
     */
    // Config.serverMode = _MODE_TYPE.DEVELOP;
    Config.serverMode = _MODE_TYPE.RELEASE; 

    /**
     * Version
     */
    Config.version = "2.2.8";

    /**
     * Type of mode
     */
    Config.MODE_TYPE = _MODE_TYPE;

    /**
     * Frame size settings
     */
    Config.JUPYTER_HEADER_SPACING = 110;
    Config.MENU_MIN_WIDTH = 273;
    Config.BOARD_MIN_WIDTH = 263;
    Config.MENU_BOARD_SPACING = 5;
    Config.VP_MIN_WIDTH = Config.MENU_MIN_WIDTH + Config.BOARD_MIN_WIDTH + Config.MENU_BOARD_SPACING; // = MENU_MIN_WIDTH + BOARD_MIN_WIDTH + MENU_BOARD_SPACING

    /**
     * Menu group codes
     */
    Config.MENU_GROUP_DICT = {
        '': '',
        'logic': 'Logic',
        'library': 'Library',
        'apps': 'Data Analysis',
        'visualization': 'Visualization',
        'machine_learning': 'Machine Learning'
    }    
    /**
     * Data types
     */
    Config.DATA_TYPES = [
        // pandas object
        'DataFrame', 'Series', 'Index', 'Period', 'GroupBy', 'Timestamp'
        // Index type object
        , 'RangeIndex', 'CategoricalIndex', 'MultiIndex', 'IntervalIndex', 'DatetimeIndex', 'TimedeltaIndex', 'PeriodIndex', 'Int64Index', 'UInt64Index', 'Float64Index'
        // GroupBy type object
        , 'DataFrameGroupBy', 'SeriesGroupBy'
        // Plot type
        , 'Figure', 'AxesSubplot'
        // Numpy
        , 'ndarray'
        // Python variable
        , 'str', 'int', 'float', 'bool', 'dict', 'list', 'tuple'
    ]

    /**
     * Data types using for searching model variables
     */
    Config.ML_DATA_DICT = {
        'Data Preparation': [
            /** Encoding */
            'OneHotEncoder', 'LabelEncoder', 'OrdinalEncoder', 'TargetEncoder', 'SMOTE',
            /** Scaling */
            'StandardScaler', 'RobustScaler', 'MinMaxScaler', 'Normalizer', 'FunctionTransformer', 'PolynomialFeatures', 'KBinsDiscretizer',
            /** ETC */
            'ColumnTransformer'
        ],
        'Regression': [
            'LinearRegression', 'Ridge', 'Lasso', 'ElasticNet', 'SVR', 'DecisionTreeRegressor', 'RandomForestRegressor', 'GradientBoostingRegressor', 'XGBRegressor', 'LGBMRegressor', 'CatBoostRegressor',
        ],
        'Classification': [
            'LogisticRegression', 'BernoulliNB', 'MultinomialNB', 'GaussianNB', 'SVC', 'DecisionTreeClassifier', 'RandomForestClassifier', 'GradientBoostingClassifier', 'XGBClassifier', 'LGBMClassifier', 'CatBoostClassifier',
        ],
        'Clustering': [
            'KMeans', 'AgglomerativeClustering', 'GaussianMixture', 'DBSCAN',
        ],
        'Dimension Reduction': [
            'PCA', 'LinearDiscriminantAnalysis', 'TruncatedSVD', 'NMF', 'TSNE'
        ],
        'Auto ML': [
            'AutoSklearnRegressor', 'AutoSklearnClassifier', 'TPOTRegressor', 'TPOTClassifier'
        ]
    };

    Config.ML_DATA_TYPES = [
        ...Config.ML_DATA_DICT['Data Preparation'],
        ...Config.ML_DATA_DICT['Regression'],
        ...Config.ML_DATA_DICT['Classification'],
        ...Config.ML_DATA_DICT['Clustering'],
        ...Config.ML_DATA_DICT['Dimension Reduction'],
        ...Config.ML_DATA_DICT['Auto ML']
    ];

    return Config;
});

/* End of file */
