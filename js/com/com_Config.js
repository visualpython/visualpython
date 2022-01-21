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
define(['./com_Const'], function(com_Const) {
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
                    { library: 'seaborn', alias:'sns' }
                ]
            }

            this.data = {
                ...this.data,
                ...initialData
            }

            this.defaultConfig = {};
            this.metadataSettings = {};

            this._readDefaultConfig();
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
                vp_note_display: true,
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
                'variableCommand.py'
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
                        reject('No data available.');
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

    return Config;
});

/* End of file */