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
    var convertToStr = function(code, isText=null, useRegex=false) {
        let prefix = '';
        if (useRegex) {
            prefix = 'r';
        }
        if (isText != null) {
            if (isText) {
                code = `${prefix}'${code}'`;
            }
        } else {
            if (!$.isNumeric(code)) {
                if (code.includes("'")) {
                    code = `${prefix}"${code}"`;
                } else {
                    code = `${prefix}'${code}'`;
                }
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
    var renderAlertModal = function(titleStr, detail='') {
        require(['vp_base/js/com/component/AlertModal'], function(AlertModal) {
            new AlertModal(titleStr, detail=detail);
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
     * Template for error box
     * @param {*} titleStr 
     * @param {*} contentStr 
     * @returns 
     */
    var templateForErrorBox = function(titleStr, contentStr='', detailStr='') {
        let errorContent = new com_String();
        errorContent.appendFormatLine('<div class="{0}" {1}>', 'vp-data-error-box', (detailStr && detailStr.length > 0)?('title="'+detailStr+"'"):'');
        errorContent.appendLine('<i class="fa fa-exclamation-triangle"></i>');
        errorContent.appendFormatLine('<label class="{0}">{1}</label>',
            'vp-data-error-box-title', titleStr);
        if (contentStr && contentStr != '') {
            errorContent.appendFormatLine('<pre>{0}</pre>', contentStr.split('\\n').join('<br/>'));
        }
        errorContent.appendLine('</div>');
        return errorContent.toString();
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

    //============================================================================
    // Cross-browser RegEx Split
    //============================================================================

    // This code has been MODIFIED from the code licensed below to not replace the
    // default browser split.  The license is reproduced here.

    // see http://blog.stevenlevithan.com/archives/cross-browser-split for more info:
    /*!
     * Cross-Browser Split 1.1.1
     * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
     * Available under the MIT License
     * ECMAScript compliant, uniform cross-browser split method
     */

    /**
     * Splits a string into an array of strings using a regex or string
     * separator. Matches of the separator are not included in the result array.
     * However, if `separator` is a regex that contains capturing groups,
     * backreferences are spliced into the result each time `separator` is
     * matched. Fixes browser bugs compared to the native
     * `String.prototype.split` and can be used reliably cross-browser.
     * @param {String} str String to split.
     * @param {RegExp} separator Regex to use for separating
     *     the string.
     * @param {Number} [limit] Maximum number of items to include in the result
     *     array.
     * @returns {Array} Array of substrings.
     * @example
     *
     * // Basic use
     * regex_split('a b c d', ' ');
     * // -> ['a', 'b', 'c', 'd']
     *
     * // With limit
     * regex_split('a b c d', ' ', 2);
     * // -> ['a', 'b']
     *
     * // Backreferences in result array
     * regex_split('..word1 word2..', /([a-z]+)(\d+)/i);
     * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
     */
     var regex_split = function (str, separator, limit) {
        var output = [],
            flags = (separator.ignoreCase ? "i" : "") +
                    (separator.multiline  ? "m" : "") +
                    (separator.extended   ? "x" : "") + // Proposed for ES6
                    (separator.sticky     ? "y" : ""), // Firefox 3+
            lastLastIndex = 0,
            separator2, match, lastIndex, lastLength;
        // Make `global` and avoid `lastIndex` issues by working with a copy
        separator = new RegExp(separator.source, flags + "g");

        var compliantExecNpcg = typeof(/()??/.exec("")[1]) === "undefined";
        if (!compliantExecNpcg) {
            // Doesn't need flags gy, but they don't hurt
            separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
        }
        /* Values for `limit`, per the spec:
         * If undefined: 4294967295 // Math.pow(2, 32) - 1
         * If 0, Infinity, or NaN: 0
         * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
         * If negative number: 4294967296 - Math.floor(Math.abs(limit))
         * If other: Type-convert, then use the above rules
         */
        limit = typeof(limit) === "undefined" ?
            -1 >>> 0 : // Math.pow(2, 32) - 1
            limit >>> 0; // ToUint32(limit)
        for (match = separator.exec(str); match; match = separator.exec(str)) {
            // `separator.lastIndex` is not reliable cross-browser
            lastIndex = match.index + match[0].length;
            if (lastIndex > lastLastIndex) {
                output.push(str.slice(lastLastIndex, match.index));
                // Fix browsers whose `exec` methods don't consistently return `undefined` for
                // nonparticipating capturing groups
                if (!compliantExecNpcg && match.length > 1) {
                    match[0].replace(separator2, function () {
                        for (var i = 1; i < arguments.length - 2; i++) {
                            if (typeof(arguments[i]) === "undefined") {
                                match[i] = undefined;
                            }
                        }
                    });
                }
                if (match.length > 1 && match.index < str.length) {
                    Array.prototype.push.apply(output, match.slice(1));
                }
                lastLength = match[0].length;
                lastLastIndex = lastIndex;
                if (output.length >= limit) {
                    break;
                }
            }
            if (separator.lastIndex === match.index) {
                separator.lastIndex++; // Avoid an infinite loop
            }
        }
        if (lastLastIndex === str.length) {
            if (lastLength || !separator.test("")) {
                output.push("");
            }
        } else {
            output.push(str.slice(lastLastIndex));
        }
        return output.length > limit ? output.slice(0, limit) : output;
    };

    //============================================================================
    // End contributed Cross-browser RegEx Split
    //============================================================================

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

        templateForErrorBox: templateForErrorBox,

        setIsAPIListRunCode: setIsAPIListRunCode,
        getIsAPIListRunCode: getIsAPIListRunCode,
        safeString: safeString,

        regex_split: regex_split
    }

}); /* function, define */

/* End of file */
