/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_String.js
 *    Author          : Black Logic
 *    Note            : [CLASS] Make string
 *    License         : GPLv3 (GNU General Public License v3.0)
 *    Date            : 2021. 08. 14
 *    Change Date     :
 */

//============================================================================
// [CLASS] Make string
//============================================================================
define ([
], function () {
    'use strict';

    //========================================================================
    // [CLASS] com_String
    //========================================================================
    class com_String {

        // constructor
        constructor() {
            this.buffer = new Array();
        }

        // Append string
        append(str) {
            this.buffer[this.buffer.length] = str;
        }

        // Append string & newline
        appendLine(str) {
            this.append((str == null ? '' : str) + '\n');
        }

        // Append format string: appendFormat('str_base {0} {1}','str0','str1')
        appendFormat() {
            var cnt = arguments.length;
            if (cnt < 2)
                return '';

            var str = arguments[0];
            for (var idx = 1; idx < cnt; idx++)
                str = str.replace('{' + (idx - 1) + '}', arguments[idx]);
            this.buffer[this.buffer.length] = str;
        }

        // Append format string & newline: appendFormatLine('str_base {0} {1}','str0','str1')
        appendFormatLine() {
            var cnt = arguments.length;
            if (cnt < 2)
                return '';

            var str = arguments[0];
            for (var idx = 1; idx < cnt; idx++)
                str = str.replace('{' + (idx - 1) + '}', arguments[idx]);
            this.buffer[this.buffer.length] = str + '\n';
        }

        // Replace string
        replace(from, to) {
            for (var i = this.buffer.length - 1; i >= 0; i--)
                this.buffer[i] = this.buffer[i].replace(new RegExp(from, 'g'), to);
        }

        // Get string
        toString() {
            return this.buffer.join('');
        }

        // Clear string
        clear() {
            this.buffer = new Array();
        }

        // get Length
        get length() {
            return this.buffer.length;
        }
    }

    return com_String;

}); /* function, define */

/* End of file */
