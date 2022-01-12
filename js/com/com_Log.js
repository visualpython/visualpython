/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_Log.js
 *    Author          : Black Logic
 *    Note            : Log control
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// Load extension
//============================================================================
define([
    './com_Config'
], function(com_Config) {
	'use strict';
    //========================================================================
    // Define Inner Variable
    //========================================================================
    /**
     * Type of log
     * DEVELOP 0 : log for developing/testing. if mode
     */
    const _LOG_TYPE = {
        ERROR   : -1,
        DEVELOP : 0,
        LOG     : 1,
        WARN    : 4
    }
    /**
     * Log label
     */
    const _LOG_LABEL = {
        [_LOG_TYPE.DEVELOP]  : 'VP_Test',
        [_LOG_TYPE.LOG]      : 'VP_Log',

        [_LOG_TYPE.ERROR]    : 'VP_ERROR',
        [_LOG_TYPE.WARN]     : 'VP_WARN'
    }

    //========================================================================
    // Declare Class
    //========================================================================
    /**
     * Log util class
     */
    class Log {
        //========================================================================
        // Constructor
        //========================================================================
        constructor() {
            this.currentMode = com_Config.serverMode;
        }

        //========================================================================
        // Internal call function
        //========================================================================
        /**
         * Get current mode
         */
        get _mode() {
            return this.currentMode;
        }
        
        //========================================================================
        // External call function
        //========================================================================
        /**
         * Display logs
         * @param {Log.LOG_TYPE}    logType     Log type : DEVELOP 0/LOG 1/ERROR -1
         * @param {String}          displayArgs  Log string text
         */
        display(logType, ...displayArgs) {
            // on RELEASE mode, do not show develop/test logs
            if (this._mode == com_Config.MODE_TYPE.RELEASE) {
                if (logType == _LOG_TYPE.DEVELOP) {
                    return;
                }
            }
            if (displayArgs.length == 1) {
                console.log('[' + _LOG_LABEL[logType] + ']', displayArgs[0]);
            } else {
                console.log('[' + _LOG_LABEL[logType] + ']', displayArgs);
            }
        }
    }

    //========================================================================
    // Define Static Variable
    //========================================================================
    /**
     * Type of log
     * DEVELOP 0 : log for developing/testing. if mode
     */
    Log.LOG_TYPE = _LOG_TYPE;
    /**
     * Log label
     */
    Log.LOG_LABEL = _LOG_LABEL;
    

    return Log;
});