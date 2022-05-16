/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_util.js
 *    Author          : Black Logic
 *    Note            : Common utility function
 *    License         : GPLv3 (GNU General Public License v3.0)
 *    Date            : 2021. 08. 14
 *    Change Date     :
 */

//============================================================================
// Common utility function
//============================================================================
define([
    'vp_base/js/com/com_String'
], function (com_String) {
    'use strict'

    //========================================================================
    // Define variable
    //========================================================================
    let isAPIListRunCode = true;

    //========================================================================
    // Internal call function
    //========================================================================
    /**
     * check duplicate variable name
     * @param {string} varName 
     */
    var _checkVariableNameDuplicate = function(varName) {
        // TODO: varName duplicate check
        return true;
    }

    //========================================================================
    // External call function
    //========================================================================
    /**
     * Generate uuid
     * @returns {String} uuid
     */
    var getUUID = function() {
        return 'u' + ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    /**
     * append css on global
     * @param {String} url style url
     */
    var loadCss = function(url) {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = require.toUrl(url);
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    /**
     * VisualPython container selector (jquery selector)
     * @returns vp top container selector
     */
    var getVPContainer = function() {
        return '#vp_wrapper';
    }

    /**
     * wrap selector
     * @param {String} selector selector
     * @returns wraped selecotr 
     */
    var wrapSelector = function(selector = '') {
        var sbSelector = new com_String();
        var cnt = arguments.length;
        // no more selector
        if (cnt < 2) {
            sbSelector.appendFormat('{0} {1}', getVPContainer(), selector);
        } else {
            sbSelector.appendFormat('{0}', getVPContainer());
            for (var idx = 0; idx < cnt; idx++) {
                sbSelector.appendFormat(' {0}', arguments[idx]);
            }
        }
        return sbSelector.toString();
    }

    /**
     * add variable and trigger event
     * @param {string} varName variable name
     * @param {string} varType variable type
     * @returns if return 0 when success, -1 when variable name duplicate
     */
    var addVariable = function(varName, varType) {
        // varName check duplicate
        if (_checkVariableNameDuplicate) {
            return -1;
        } else {
            events.trigger('add-variable.vp-wrapper', {'varName': varName, 'varType': varType});
            return 0;
        }
    }

    /**
     * format simple string
     */
    var formatString = function() {
        var cnt = arguments.length;
        if (cnt < 2) 
            return arguments[0];

        var str = arguments[0];
        for (var idx = 1; idx < cnt; idx++)
            str = str.replace('{' + (idx - 1) + '}', arguments[idx]);
        
        return str;
    }

    /**
     * Convert to string format if not numeric
     * @param {*} code 
     * @returns 
     */
    var convertToStr = function(code) {
        if (!$.isNumeric(code)) {
            if (code.includes("'")) {
                code = `"${code}"`;
            } else {
                code = `'${code}'`;
            }
        }
        return code;
    }

    /**
     * Remove head's script(css, js)
     * @param {string} scriptName 
     */
    var removeHeadScript = function(scriptName) {
        for (let i = 0; i < document.querySelector('head').children.length; i++){
            if (document.querySelector('head') && document.querySelector('head').children[i].outerHTML.includes(scriptName)) { 
                document.querySelector('head').removeChild(document.querySelector('head').children[i]);
            }
        }   
    }

    /**
     * Modal
     * @param {Object} config { title, message, buttons(list), final(function), defaultIdx(int) } 
     */
    var renderModal = function(config={title:'', message:'', buttons:['Ok']}) {
        require(['vp_base/js/com/component/Modal'], function(Modal) {
            let modal = new Modal(config);
            modal.open();
        });
    }

    /** 
     * InfoModal
     * @param {string} titleStr 
     */
     var renderInfoModal = function(titleStr) {
        require(['vp_base/js/com/component/InfoModal'], function(InfoModal) {
            new InfoModal(titleStr);
        });
    }

    /** 
     * AlertModal
     * @param {string} titleStr 
     */
    var renderAlertModal = function(titleStr) {
        require(['vp_base/js/com/component/AlertModal'], function(AlertModal) {
            new AlertModal(titleStr);
        });
    }

    /**
     * Show success message on the top right of the screen
     * @param {string} titleStr 
     */
    var renderSuccessMessage = function(titleStr) {
        require(['vp_base/js/com/component/SuccessMessage'], function(SuccessMessage) {
            new SuccessMessage(titleStr);
        });
    }

    /**
     * setIsAPIListRunCode
     */
    var setIsAPIListRunCode = function(isAPIListRunCode_param) {
        isAPIListRunCode = isAPIListRunCode_param;
    }

    /**
     * getIsAPIListRunCode
     */
    var getIsAPIListRunCode = function() {
        return isAPIListRunCode;
    }

    /**
     * kernelExecute
     */
    var kernelExecute = function(command, isSilent = false, isStoreHistory = !isSilent, isStopOnError = true) {
        return new Promise((resolve, reject) => {
            Jupyter.notebook.kernel.execute(
                command,
                {
                    iopub: {
                        output: function(msg) {
                            // msg.content.data['text/plain']
                            resolve(msg.content.data);
                        }
                    }
                },
                { silent: isSilent, store_history: isStoreHistory, stop_on_error: isStopOnError }
            );
        });
    }

     /**
     * Convert string(include html text) to safe string to display
     * @param {String} text 
     * @returns 
     */
    var safeString = function(text) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    var optionToLabel = function(label) {
        label = label.replaceAll('_', ' ');
        label = label.charAt(0).toUpperCase() + label.slice(1);
        return label;
    }

    return {
        getUUID: getUUID,
        loadCss: loadCss,
        getVPContainer: getVPContainer,
        wrapSelector: wrapSelector,
        addVariable: addVariable,
        formatString: formatString,
        convertToStr: convertToStr,
        optionToLabel: optionToLabel,

        removeHeadScript: removeHeadScript,
        renderModal: renderModal,
        renderInfoModal: renderInfoModal,
        renderAlertModal: renderAlertModal,
        renderSuccessMessage: renderSuccessMessage,

        setIsAPIListRunCode: setIsAPIListRunCode,
        getIsAPIListRunCode: getIsAPIListRunCode,
        kernelExecute: kernelExecute,
        safeString: safeString
    }

}); /* function, define */

/* End of file */
