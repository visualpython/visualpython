/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : loadVisualpython.js
 *    Author          : Black Logic
 *    Note            : Load Visual Python
 *    License         : GPLv3 (GNU General Public License v3.0)
 *    Date            : 2021. 08. 14
 *    Change Date     :
 */

//============================================================================
// Load Visual Python
//============================================================================
(
    require.specified('base/js/namespace')
        ? define
        : function (deps, callback) {
            'use strict';
            // if here, the Jupyter namespace hasn't been specified to be loaded.
            // This means that we're probably embedded in a page,
            // so we need to make our definition with a specific module name
            return define('vp_base/js/loadVisualpython', deps, callback);
        }
)([
    'css!vp_base/css/root.css',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Config',
    'vp_base/js/com/com_Log',
    'vp_base/js/com/com_Kernel',
    'vp_base/js/com/com_interface',
    'vp_base/js/MainFrame'
], function (rootCss, com_Const, com_util, com_Config, com_Log, com_Kernel, com_interface, MainFrame) {
    'use strict';

    //========================================================================
    // Define variable
    //========================================================================
    var Jupyter;
    var events;
    var liveNotebook = false;

    var metadataSettings;
    var vpPosition;
    var vpFrame;
    
    //========================================================================
    // Require: Jupyter & events
    //========================================================================
    try {
        // namespace's specified checking. events exception can occur
        // this will work in a live notebook because nbextensions & custom.js are loaded
        // by/after notebook.js, which requires base/js/namespace
        Jupyter = require('base/js/namespace');
        events = require('base/js/events');
        liveNotebook = true;
    } catch (err) {
        // We *are* theoretically in a non-live notebook
        console.log('[vp] working in non-live notebook'); //, err);
        // in non-live notebook, there's no event structure, so we make our own
        if (window.events === undefined) {
            var Events = function () { };
            window.events = $([new Events()]);
        }
        events = window.events;
    }

    //========================================================================
    // Internal call function
    //========================================================================

    /**
     * Add toolbar button
     */
    var _addToolBarVpButton = function () {
        // Call notebookApp initialize event, if toolbar is not yet ready
        if (!Jupyter.toolbar) {
            events.on('app_initialized.NotebookApp', function (evt) {
                _addToolBarVpButton();
            });
            return;
        }
        
        // Add toolbar button, if it's not existing
        if ($('#' + com_Const.TOOLBAR_BTN_INFO.ID).length === 0) {
            $(Jupyter.toolbar.add_buttons_group([
                Jupyter.keyboard_manager.actions.register({
                    'help': com_Const.TOOLBAR_BTN_INFO.HELP
                    , 'icon': com_Const.TOOLBAR_BTN_INFO.ICON
                    , 'handler': function () {
                        // Extension 버튼 클릭 시 실행
                        // _toggleVp(cfg);
                        vpFrame.toggleVp();
                    }
                }, com_Const.TOOLBAR_BTN_INFO.NAME, com_Const.TOOLBAR_BTN_INFO.PREFIX)
            ])).find('.btn').attr('id', com_Const.TOOLBAR_BTN_INFO.ID).addClass(com_Const.TOOLBAR_BTN_INFO.ICON_CONTAINER);
        }
    };

    /**
     * Create vp
     * @param {Object} cfg configuration
     * @param {*} st 
     */
    var _loadVpResource = function (cfg, st) {
        if (!liveNotebook)
            cfg = $.extend(true, {}, vpConfig.defaultConfig, cfg);

        vpFrame = new MainFrame();
        vpFrame.loadMainFrame();

        // TODO: hotkey control -> Implement under InputComponent or Event class
        // input:text - hotkey control
        $(document).on('focus', com_util.wrapSelector('input'), function() {
            com_interface.disableOtherShortcut();
        });
        $(document).on('blur', com_util.wrapSelector('input'), function() {
            com_interface.enableOtherShortcut();
        });
        $(document).on('focus', '.vp-popup-frame input', function() {
            com_interface.disableOtherShortcut();
        });
        $(document).on('blur', '.vp-popup-frame input', function() {
            com_interface.enableOtherShortcut();
        });
        $(document).on('focus', '#vp_fileNavigation input', function() {
            com_interface.disableOtherShortcut();
        });
        $(document).on('blur', '#vp_fileNavigation input', function() {
            com_interface.enableOtherShortcut();
        });
        // textarea - hotkey control
        $(document).on('focus', com_util.wrapSelector('.vp-popup-frame textarea'), function() {
            com_interface.disableOtherShortcut();
        });
        $(document).on('blur', com_util.wrapSelector('.vp-popup-frame textarea'), function() {
            com_interface.enableOtherShortcut();
        });
    };

    /**
     * Declare background vp functions
     */
    var _readKernelFunction = function() {
        var libraryList = [ 
            'printCommand.py',
            'fileNaviCommand.py',
            'pandasCommand.py',
            'variableCommand.py'
        ];
        libraryList.forEach(libName => {
            var libPath = com_Const.PYTHON_PATH + libName
            $.get(libPath).done(function(data) {
                var code_init = data;
                Jupyter.notebook.kernel.execute(code_init, { iopub: { output: function(data) {
                    console.log('visualpython - loaded library', data);
                } } }, { silent: false });
            }).fail(function() {
                console.log('visualpython - failed to load getPath library');
            });
        })
    }

    var _setGlobalVariables = function() {
        /**
         * visualpython log util
         * - use it instead of console.log
         * ex) vpLog.display(VP_LOG_TYPE.LOG, 'log text');
         */
        window.vpLog = new com_Log();
        /**
         * visualpython log util types
         * DEVELOP, LOG, ERROR
         */
        window.VP_LOG_TYPE = com_Log.LOG_TYPE;
        /**
         * visualpython config util
         */
        window.vpConfig = new com_Config();
        window.VP_MODE_TYPE = com_Config.MODE_TYPE;
        /**
         * visualpython kernel
         */
        window.vpKernel = new com_Kernel();
    }

    //========================================================================
    // External call function
    //========================================================================
    /**
     * Read our config from server config & notebook metadata
     * This function should only be called when both:
     * 1. the notebook (and its metadata) has fully loaded
     *  AND
     * 2. Jupyter.notebook.config.loaded has resolved
     */
    var readConfig = function () {
        var cfg = vpConfig.defaultConfig;

        if (!liveNotebook) {
            return cfg;
        }

        // config may be specified at system level or at document level. first, update
        // defaults with config loaded from server
        let defaultMetadata = JSON.parse(JSON.stringify(vpConfig.metadataSettings));
        let metadata = vpConfig.getMetadata();
        
        vpConfig.resetMetadata();

        if (metadata && defaultMetadata.vp_config_version == metadata.vp_config_version) {
            Object.keys(defaultMetadata).forEach(key => {
                let value = (metadata && metadata.hasOwnProperty(key) ? metadata : defaultMetadata)[key];
                vpConfig.setMetadata({ [key]: value });
                cfg[key] = value;
            });
        } else {
            // if config version is different, overwrite config
            vpConfig.setMetadata(defaultMetadata);
        }
        
        return cfg;
    };

    /**
     * Initialize Visual Python
     */
    var initVisualpython = function () {
        _setGlobalVariables();

        let cfg = readConfig();

        _readKernelFunction();
        _addToolBarVpButton();
        _loadVpResource(cfg);

        if (cfg.vp_section_display && vpFrame) {
            vpFrame.openVp();
        }

        // Operations on kernel restart
        events.on('kernel_ready.Kernel', function (evt, info) {
            vpLog.display(VP_LOG_TYPE.LOG, 'vp operations for kernel ready...');
            // read vp functions
            _readKernelFunction();
        });
    }

    return { initVisualpython: initVisualpython, readConfig: readConfig };

}); /* function, define */

/* End of file */
