/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : visualpython.js
 *    Author          : Black Logic
 *    Note            : Visual Python main module
 *    License         : GPLv3 (GNU General Public License v3.0)
 *    Date            : 2021. 08. 14
 *    Change Date     :
 */

//============================================================================
// Set require.config
//============================================================================
require.config({
    paths: { 
        'vp_base'   : '../nbextensions/visualpython',
        'css'       : 'vp_base/lib/require/css.min',
        'mathjaxutils': 'notebook/js/mathjaxutils'
    },
    config: {
        text: {
            // allow CORS        
            useXhr: function(url, protocol, hostname, port) {
                // console.log('allow xhr');
                return true;
            },
            onXhr: function(xhr, url) {
                // console.log(xhr);
            }
        }
    },
    map: {
        '*': {
            css :  'vp_base/lib/require/css.min'
        }
    }
});

function __VP_CSS_LOADER__(path) {
    return 'css!' + path + '.css';
}

function __VP_TEXT_LOADER__(path) {
    return 'text!' + path + '!strip';
}

function __VP_RAW_LOADER__(path) {
    return 'text!' + path;
}

window.vpBase = "/nbextensions/";

//============================================================================
// Load extension
//============================================================================
define([
    'vp_base/js/com/com_Const',
    'vp_base/js/loadVisualpython'
], function (com_Const, loadVisualpython) {
    'use strict';

    //========================================================================
    // Define variable
    //========================================================================
    // Constant
    const origin = window.location.origin;
    const connectorAddress = `${origin}` + com_Const.PATH_SEPARATOR + com_Const.BASE_PATH;

    //========================================================================
    // Internal call function
    //========================================================================
    /**
     * Initialize Visual Python
     */
    var _init_vp = function () {
        // Read configuration, then call Initialize Visual Python
        Jupyter.notebook.config.loaded.then( function () {
            loadVisualpython.initVisualpython();
        });
    };

    //========================================================================
    // External call function
    //========================================================================
    /**
     * Load jupyter extenstion
     */
    var load_ipython_extension = function () {

        // Wait for the jupyter notebook to be fully loaded
        if (Jupyter.notebook !== undefined && Jupyter.notebook._fully_loaded) {
            // This tests if the notebook is fully loaded
            console.log('[vp] Notebook fully loaded -- vp initialized ')
            _init_vp();
        } else {
            console.log('[vp] Waiting for notebook availability')
            events.on('notebook_loaded.Notebook', function () {
                console.log('[vp] Visual Python initialized (via notebook_loaded)')
                _init_vp();
            })
        }
    };

    return { load_ipython_extension: load_ipython_extension };

}); /* function, define */

/* End of file */
