define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS) {

    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "instanceObject"
        , funcID : "com_instanceObject"
    }
    var vpFuncJS = new vpFuncJS.VpFuncJS(funcOptProp);

    /**
     * Instance Object for saving state
     * @param {*} objName 
     * @param {*} objType 
     */
    var Instance = function(objName, objType) {
        this.objName = objName;
        this.objType = objType;
        this.dirList = [];

        this.colList = [];
        this.colMeta = [];
        this.indexer = '';

        this.args = '';

        this.lastName = '';
        this.lastType = '';

        this.key = -1;
    }

    Instance.empty = new Instance('', '');
    /**
     * toString
     */
    Instance.prototype.toString = function() { 
        return this.key.toString() + this.objName.toString() + this.objType.toString() 
                + this.dirList.toString() 
                + this.colList.toString() + this.colMeta.toString() + this.indexer.toString()
                + this.args.toString();
    }
    /**
     * equals function to compare
     * @param {Instance} other 
     */
    Instance.prototype.equals = function(other) { return this.toString() === other.toString(); }

    /** transform to metadata */
    Instance.prototype.dumps = function() {
        var dumpObj = {
            key: this.key,
            objName: this.objName,
            objType: this.objType,
            dirList: this.dirList,
            colList: this.colList,
            colMeta: this.colMeta,
            indexer: this.indexer,
            args: this.args,
            lastName: this.lastName,
            lastType: this.lastType
        };
        return dumpObj;
    }
    /** make Instance using metadata */
    Instance.parse = function(metadata) {
        var newInstance = Instance.empty;
        try {
            if (metadata != undefined && typeof metadata == "object"
                && metadata.objName != undefined && metadata.objType != undefined) {
                newInstance = new Instance(metadata.objName, metadata.objType);
                newInstance.setDirList(metadata.dirList);
                newInstance.setColList(metadata.colList);
                newInstance.setColMeta(metadata.colMeta);
                newInstance.setIndexer(metadata.indexer);
                newInstance.setArgs(metadata.args);
                newInstance.setLastName(metadata.lastName);
                newInstance.setLastType(metadata.lastType);

                newInstance.setKey(metadata.key);
            }
        } catch {
            return Instance.empty;
        }
        return newInstance;
    }
    
    /** getter */
    Instance.prototype.getName = function() { return this.objName; }
    Instance.prototype.getType = function() { return this.objType; }
    Instance.prototype.getDirList = function() { return this.dirList; }
    Instance.prototype.getColList = function() { return this.colList; }
    Instance.prototype.getColMeta = function() { return this.colMeta; }
    Instance.prototype.getIndexer = function() { return this.indexer; }
    Instance.prototype.getArgs = function() { return this.args; }
    Instance.prototype.getLastName = function() { return this.lastName; }
    Instance.prototype.getLastType = function() { return this.lastType; }
    Instance.prototype.getKey = function() { return this.key; }

    /* setter */
    Instance.prototype.setName = function(name) { this.objName = name; }
    Instance.prototype.setType = function(type) { this.objType = type; }
    Instance.prototype.setDirList = function(dirList) { this.dirList = dirList; }
    Instance.prototype.setColList = function(colList) { this.colList = colList; }
    Instance.prototype.setColMeta = function(colMeta) { this.colMeta = colMeta; }
    Instance.prototype.setIndexer = function(indexer) { this.indexer = indexer; }
    Instance.prototype.setArgs = function(args) { this.args = args; }
    Instance.prototype.setLastName = function(lastName) { this.lastName = lastName; }
    Instance.prototype.setLastType = function(lastType) { this.lastType = lastType; }
    Instance.prototype.setKey = function(key) { this.key = key; }

    Instance.prototype.getDetail = function(callback = undefined) {
        var that = this;
        var varName = this.objName;

        // 변수 columns 정보 조회
        var command = new sb.StringBuilder();
        // command.appendLine('import json');
        // command.append(`print(json.dumps([ { "value": "'{}'".format(c) if type(c) == str else c, "label": c `);
        // command.appendFormat(', "dtype": str({0}[c].dtype)', varName);
        // command.append(', "category": ');
        // command.appendFormat(`[{ "value": "'{}'".format(u) if type(u) == str else u, "label": u } for u in {0}[c].dropna().unique()]`, varName);
        // command.appendFormat('if str({0}[c].dtype) == "object" else []', varName);
        // command.appendFormat('} for c in {0}.columns ]))', varName);
        command.appendFormat('_vp_print(_vp_get_columns_list({0}))', varName);
        var cmdString = command.toString();
        vpFuncJS.kernelExecute(cmdString, function(result) {
            var varList = JSON.parse(result);
            that.setColList(varList);

            if (callback != undefined) {
                callback(that);
            }
        });
    }

    return Instance;

});