define([
    'nbextensions/visualpython/src/common/StringBuilder'
], function(sb) {

    /** makeKernelCurrentPath
     * @param {string} path 
     */
    var makeKernelCurrentPath = function(path, useFunction = false) {
        if (path === '') {
            path = '.';
        }
        if (!useFunction) {
            path = "'" + path + "'";
        }
        var sbCode = new sb.StringBuilder();
        sbCode.appendFormat("print(_vp_search_path({0}))", path);
        return sbCode.toString();
    }
    return {
        makeKernelCurrentPath
    }
});