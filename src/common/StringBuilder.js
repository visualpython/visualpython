define ([
    'require'
], function(requirejs) {
    "use strict";

    /**
     * @class StringBuilder
     * @constructor
     */
    var StringBuilder = function() {
        this.buffer = new Array();
    };

    // 문자열 추가.
    StringBuilder.prototype.append = function(str) {
        this.buffer[this.buffer.length] = str;
    }

    // 문자열 추가하고 줄바꿈.
    StringBuilder.prototype.appendLine = function(str) {
        this.append((str == null ? "" : str) + "\n");
    }

    // 문자열 포멧형 추가.
    StringBuilder.prototype.appendFormat = function() {
        var cnt = arguments.length;
        if (cnt < 2) 
            return "";

        var str = arguments[0];
        for (var idx = 1; idx < cnt; idx++)
            str = str.replace("{" + (idx - 1) + "}", arguments[idx]);
        this.buffer[this.buffer.length] = str;
    }

    // 문자열 포멧형 추가하고 줄바꿈.
    StringBuilder.prototype.appendFormatLine = function() {
        var cnt = arguments.length;
        if (cnt < 2) 
            return "";

        var str = arguments[0];
        for (var idx = 1; idx < cnt; idx++)
            str = str.replace("{" + (idx - 1) + "}", arguments[idx]);
        this.buffer[this.buffer.length] = str + "\n";
    }

    // 문자열 변환.
    StringBuilder.prototype.replace = function(from, to) {
        for (var i = this.buffer.length - 1; i >= 0; i--)
            this.buffer[i] = this.buffer[i].replace(new RegExp(from, "g"), to);
    }
    
    // 문자열 반환.
    StringBuilder.prototype.toString = function() {
        return this.buffer.join("");
    }

    StringBuilder.prototype.clear = function() {
        this.buffer = new Array();
    }

    return {
        StringBuilder: StringBuilder
    };
});