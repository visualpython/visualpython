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
// CHROME: removed code
define([
    // CHROME: removed .css extension type
    __VP_CSS_LOADER__('vp_base/css/root'), // INTEGRATION: unified version of css loader
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
    var Jupyter = null;
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
                        // on clicking extension button
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
        if (vpConfig.extensionType !== 'lab') {
            vpFrame.loadMainFrame();
        }

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
        $(document).on('focus', '.vp-dataselector input', function() {
            com_interface.disableOtherShortcut();
        });
        $(document).on('blur', '.vp-dataselector input', function() {
            com_interface.enableOtherShortcut();
        });
        // textarea - hotkey control
        $(document).on('focus', com_util.wrapSelector('.vp-popup-frame textarea'), function() {
            com_interface.disableOtherShortcut();
        });
        $(document).on('blur', com_util.wrapSelector('.vp-popup-frame textarea'), function() {
            com_interface.enableOtherShortcut();
        });

        
        // CHROME: TODO: 2: background <-> vp
        //======================================================================
        // Event listener
        //======================================================================
        if (window.colab) {
            document.removeEventListener('vpcomm', _vpcommHandler);
            document.addEventListener('vpcomm', _vpcommHandler);
        }
    };

    var _vpcommHandler = function(e) {
        let detailObj = e.detail;
        switch (detailObj.type) {
            // case 'sendBase':
            //     // get base url of its extension
            //     vpBase = detailObj.data;
            //     // initialize vp environment
            //     vp_init();
            //     break;
            case 'toggle':
                vpLog.display(VP_LOG_TYPE.DEVELOP, 'received from inject - ', e.detail.type, e);
                // toggle vp_wrapper
                if (window.vpBase != '' && window.$ && $('#vp_wrapper').length > 0) {
                    vpFrame.toggleVp();
                } else {
                    vpLog.display(VP_LOG_TYPE.DEVELOP, 'No vp...');
                }
                break;
            default:
                break;
        }
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
        if (window.colab) {
            // CHROME: added extType as 'colab' // CHROME: FIXME: use window.vpExtType = 'colab'
            window.vpConfig = new com_Config('colab');
        } else if (window.vpExtType === 'lab') {
            // LAB: added extType as 'lab'
            window.vpConfig = new com_Config('lab');
        } else {
            window.vpConfig = new com_Config();
        }
        window.VP_MODE_TYPE = com_Config.MODE_TYPE;
        /**
         * visualpython kernel
         */
        if (vpConfig.extensionType === 'lab') {
            window.vpKernel = new com_Kernel(vpLab);
        } else {
            window.vpKernel = new com_Kernel();
        }
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

        vpConfig.readKernelFunction();
        // CHROME: edited
        if (Jupyter) {
            _addToolBarVpButton();
        }
        _loadVpResource(cfg);
        vpConfig.checkVersionTimestamp();

        if ((cfg.vp_section_display && vpFrame) 
            || vpConfig.extensionType === 'colab') { // CHROME: default to display vp
            vpFrame.openVp();
        }

        // Operations on kernel restart
        if (vpConfig.extensionType === 'notebook') {
            events.on('kernel_ready.Kernel', function (evt, info) {
                vpLog.display(VP_LOG_TYPE.LOG, 'vp operations for kernel ready...');
                // read vp functions
                vpConfig.readKernelFunction();
            });
        } else if (vpConfig.extensionType === 'colab') {
            // CHROME: ready for colab kernel connected, and restart vp
            colab.global.notebook.kernel.listen('connected', function(x) { 
                vpLog.display(VP_LOG_TYPE.LOG, 'vp operations for kernel ready...');
                // read vp functions
                vpConfig.readKernelFunction();
            });
        } else if (vpConfig.extensionType === 'lab') {
            // LAB: if widget is ready or changed, ready for lab kernel connected, and restart vp
            vpLab.shell._currentChanged.connect(function(s1, value) {
                var { newValue } = value;
                // kernel restart for notebook and console
                if (newValue && newValue.sessionContext) {
                    if (newValue.sessionContext.isReady) {
                        vpLog.display(VP_LOG_TYPE.LOG, 'vp operations for kernel ready...');
                        vpConfig.readKernelFunction();
                        vpConfig.checkVersionTimestamp();
                    }
                    newValue.sessionContext._connectionStatusChanged.connect(function(s2, status) {
                        if (status === 'connected') {
                            vpLog.display(VP_LOG_TYPE.LOG, 'vp operations for kernel ready...');
                            vpConfig.readKernelFunction();
                            vpConfig.checkVersionTimestamp();
                        }
                    });
                } else {
                    vpLog.display(VP_LOG_TYPE.LOG, 'No widget detected...');
                }
            });
        }

        return vpFrame;
    }

    return { initVisualpython: initVisualpython, readConfig: readConfig };

}); /* function, define */

/* End of file */
