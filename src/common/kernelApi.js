define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpCommon'
], function (requirejs, $, vpConst, sb, vpCommon) {


    /**
     * Execute python kernel
     * @param {*} command 
     * @param {*} callback 
     * @param {*} isSilent 
     */
     var executePython = function (command, callback, isSilent = false) {
        Jupyter.notebook.kernel.execute(
            command,
            {
                iopub: {
                    output: function (msg) {
                        if (msg.content) {
                            if (msg.content['name'] == 'stderr') {
                                ;
                            } else {
                                var result = '';
                                var type = '';
                                if (msg.content['text']) {
                                    result = String(msg.content['text']);
                                    type = 'text';
                                } else if (msg.content.data) {
                                    if (msg.content.data['text/plain']) {
                                        result = String(msg.content.data['text/plain']);
                                        type = 'text/plain';
                                    } else if (msg.content.data['text/html']) {
                                        result = String(msg.content.data['text/html']);
                                        type = 'text/html';
                                    }
                                }
                                callback(result, type);
                            }
                        }
                    }
                }
            },
            { silent: isSilent }
        );
    };

    var searchVarList = function(types, callback) {
        // types에 맞는 변수목록 조회하는 명령문 구성
        var cmdSB = new sb.StringBuilder();
        if (types && types.length > 0) {
            cmdSB.appendFormat('_vp_print(_vp_get_variables_list({0}))', JSON.stringify(types));
        } else {
            cmdSB.appendFormat('_vp_print(_vp_get_variables_list({0}))', 'None');
        }

        executePython(cmdSB.toString(), function(result) {
            callback(result);
        });
    }

    var getColumnList = function(dataframe, callback) {
        executePython(
            vpCommon.formatString('_vp_print(_vp_get_columns_list({0}))', dataframe)
            , function(result) {
                callback(result);
        });
    }

    var getProfilingList = function(callback) {
        executePython('_vp_print(_vp_get_profiling_list())', function(result) {
            callback(result);
        });
    }

    return {
        executePython: executePython,
        searchVarList: searchVarList,
        getColumnList: getColumnList,
        getProfilingList: getProfilingList
    }
});