//======================================================================
// Define variables
//======================================================================
window.vpBase = window.vpBase? window.vpBase: '';

//======================================================================
// Define functions
//======================================================================
function vp_log(msg) {
    console.log('[vp] ', ...arguments);
}
function vp_init() {
    // require config
    vp_config_require();
}

function vp_inject(path) {
    var s = document.createElement('script');
    s.src = path;
    (document.head || document.documentElement).appendChild(s);
    s.remove();
}

function __VP_CSS_LOADER__(path) {
    return 'css!' + path;
}

function __VP_TEXT_LOADER__(path) {
    return 'text!' + path + '!strip';
}

function __VP_RAW_LOADER__(path) {
    return 'text!' + path;
}

function vp_config_require() {
    // Configure requirejs
    try {
        if (require === undefined || require == null) {
            // remove inject script 
            let injectedScript = document.querySelector(`script[src="${vpBase}inject.js"]`);
            if (injectedScript) {
                injectedScript.remove();
            }
            return;
        }
    } catch (ex) {
        // remove inject script 
        let injectedScript = document.querySelector(`script[src="${vpBase}inject.js"]`);
        if (injectedScript) {
            injectedScript.remove();
        }
        return;
    }
    require.config({
        baseUrl: vpBase,
        paths:{
            'vp_base'   : 'visualpython',
            'text'      : 'visualpython/lib/require/text',
            'css'       : 'visualpython/lib/require/css.min',
            'jquery'    : 'visualpython/lib/jquery/jquery-3.6.0.min',
            'jquery-ui' : 'visualpython/lib/jquery/jquery-ui.min',
            'codemirror': 'visualpython/lib/codemirror',
            'marked'    : 'visualpython/lib/marked/marked',
            'mathjaxutils'   : 'visualpython/lib/mathjax/mathjaxutils',
            'fontawesome'    : 'visualpython/lib/fontawesome/fontawesome.min'
        },
        shim: {
            "jquery-ui": {
                exports: "$",
                deps: ['jquery']
            }
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
                css :  'visualpython/lib/require/css.min'
            }
        },
        packages: [{
            name: "codemirror",
            location: "visualpython/lib/codemirror/",
            main: "lib/codemirror"
        }]
    });

    // Load vp
    define('vp/injectScript', [
        'text', 
        'css', 
        'jquery', 
        'jquery-ui', 
        // 'css!vp_base/lib/jquery/jquery-ui.min',
        __VP_CSS_LOADER__('vp_base/lib/jquery/jquery-ui.min'),
        'codemirror/lib/codemirror', 
        __VP_CSS_LOADER__('codemirror/lib/codemirror'), 
        'vp_base/js/loadVisualpython'
    ], function(text, css, $, ui, uiCss, codemirror, cmCss, loadVisualpython) {
        // codemirror
        window.codemirror = codemirror;

        loadVisualpython.initVisualpython();
    });
    
}

//======================================================================
// Event listener
//======================================================================
var _vpcommHandler = function(e) {
    let detailObj = e.detail;
    if (detailObj && detailObj.type) {
        switch (detailObj.type) {
            case 'sendBase':
                vp_log('received from inject - ', e.detail.type, e);
                // get base url of its extension
                vpBase = detailObj.data;
                // check if it has vp_wrapper
                if (document.getElementById('vp_wrapper') == null) {
                    // initialize vp environment
                    vp_init();
                } else {
                    // send event to toggle vp
                    let detailObj = { type: 'toggle', data: 'hi' };
                    let evt = new CustomEvent('vpcomm', { bubbles: true, detail: detailObj });
                    document.dispatchEvent(evt);
                }
                break;
            // CHROME: TODO: 2: use vp frame.toggle for toggle it
            // case 'toggle':
            //     // toggle vp_wrapper
            //     if (window.vpBase != '' && window.$) {
            //         vp_toggle();
            //     } else {
            //         vp_log('No jquery...');
            //         // init again
            //         vp_init();
            //     }
            //     break;
            default:
                break;
        }
    }
};
document.removeEventListener('vpcomm', _vpcommHandler);
document.addEventListener('vpcomm', _vpcommHandler);

// End of file