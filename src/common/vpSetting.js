define([
    'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , './vpXMLHandler'
], function($, vpConst, xmlHandler) {
    // settings.xml url
    var vpSettingsUrl = window.location.origin + vpConst.PATH_SEPARATOR + vpConst.BASE_PATH + vpConst.DATA_PATH + vpConst.VP_SETTINGS_XML_URL;

    // default settings
    var default_settings = {
        'run_code_without_asking': false,
        'change_task_without_asking': false,
        'code_insert_position': 'below',
        'api_list_sort_by': 'frequency',
        'default_variable_for_required': false,
        'auto_import_package': false
    };

    // settings description list
    var settings_description = {
        'run_code_without_asking': {
            'ko': '질의 없이 코드 수행',
            'en': 'Run code without asking'
        },
        'change_task_without_asking': {
            'ko': '질의 없이 Task 변경',
            'en': 'Change task without asking'
        },
        'code_insert_position': {
            'ko': '코드 삽입 위치 지정',
            'en': 'Code insert position'
        },
        'api_list_sort_by': {
            'ko': 'API 목록의 정렬 방식',
            'en': 'Api list sorting by...'
        },
        'default_variable_for_required': {
            'ko': '필수 입력값에 임의 변수 사용 여부',
            'en': 'Default variable for required input'
        },
        'auto_import_package': {
            'ko': '패키지 자동 import',
            'en': 'Automatically import packages'
        }
    }

    // settings option list
    var settings_options = {
        'code_insert_position': [
            { text: '선택한 셀 아래에 추가', value: 'below'},
            { text: '선택한 셀 위에 추가', value: 'above'},
            { text: '선택한 셀에 덮어쓰기', value: 'overwrite'}
        ],
        'api_list_sort_by': [
            { text: '사용 빈도', value: 'frequency'},
            { text: '알파벳 순', value: 'alphabet'}
        ]
    }

    /**
     * Save settings to notebook config file
     * @param {*} obj 
     */
    var saveSettingsData = function(obj, configKey = 'vpcfg') {
        Jupyter.notebook.config.loaded.then(function() {
            Jupyter.notebook.config.update({[configKey]: obj});
        });
    }

    /**
     * load settings data
     * @returns {object} key-value object
     */
    var loadSettingsData = function(configKey = 'vpcfg') {
        var newData = Jupyter.notebook.config.data[configKey];
        if (newData == undefined) {
            newData = {};
        }

        // setting value update
        var data = {...default_settings};
        Object.keys(newData).forEach(key => {
            if (key in data) {
                data[key] = newData[key];
            }
        });

        return data;
    }

    /**
     * load settings data with additional information
     * @returns {object} list
     * { name: .., type:.., description:.., default:.., value:.., [options:..] }
     */
    var loadSettingsDataUsable = function() {
        var data = loadSettingsData();
        
        var list = [];
        Object.keys(data).forEach(key => {
            if (key in settings_options) {
                // options type
                list.push({
                    name: key,
                    type: 'options',
                    description: settings_description[key].en,
                    default: default_settings[key],
                    value: data[key],
                    options: settings_options[key]
                })
            } else {
                // checkbox type
                list.push({
                    name: key,
                    type: 'checkbox',
                    description: settings_description[key].en,
                    default: default_settings[key],
                    value: data[key]
                })
            }
        });

        return list;
    }


    /**
     * save/load user defined code
     * Jupyter.notebook.config.data['vpudf'] = {
     *  'udf-key1' : 'code...',
     *  'udf-key2' : 'code...', ...
     * }
     */

    /**
     * save user defined code to notebook config file
     * @param {object} obj { 'udf-key': 'code...' }
     * @param {string} configKey default: vpudf
     */
    var saveUserDefinedCode = function(obj, configKey = 'vpudf') {
        Jupyter.notebook.config.loaded.then(function() {
            Jupyter.notebook.config.update({[configKey]: obj});
        });
    };

    /**
     * load user defined code from notebook config file
     * @param {function} callback(data = { 'key': 'code' })
     * @param {string} configKey default: vpudf
     */
    var loadUserDefinedCode = function(callback, configKey = 'vpudf') {
        Jupyter.notebook.config.load();
        Jupyter.notebook.config.loaded.then(function() {
            var data = Jupyter.notebook.config.data[configKey];
            if (data == undefined) {
                data = {};
            }
            callback(data);
        });
    };

    /**
     * load udf as list with name, code
     * @param {function} callback(data = [{ name: 'key', code: 'code', ... }])
     * @param {string} configKey default: vpudf
     */
    var loadUserDefinedCodeList = function(callback, configKey = 'vpudf') {
        var data = loadUserDefinedCode(function(data) { 
            var udfList = [];
        
            Object.keys(data).forEach(key => {
                udfList.push({ name: key, code: data[key] });
            });

            callback(udfList);
        }, configKey);
    }

    /**
     * get udfkey value
     * @param {string} udfKey 
     * @param {*} configKey default: vpudf
     * @returns {string} code / if udfKey is not exists, returns undefined
     */
    var getUserDefinedCode = function(udfKey, configKey = 'vpudf') {
        var data = Jupyter.notebook.config.data[configKey];
        if (Object.keys(data).length > 0) {
            return data[udfKey];
        }

        return undefined;
    }

    /**
     * remove udf key from list
     * @param {*} udfKey key to delete
     * @param {*} configKey default: vpudf
     */
    var removeUserDefinedCode = function(udfKey, configKey = 'vpudf') {
        // if set value to null, it removes from config data
        Jupyter.notebook.config.loaded.then(function() {
            Jupyter.notebook.config.update({[configKey]: {[udfKey]: null}});
        });

    }













        /**
     * Deprecated: 
     * Save settings to data/settings.xml file
     * @param {*} obj 
     */
    var saveSettingsJson = function(obj) {
        loadSettingsJson(function(org) {
            // update setting list
            var updateObj = org.settings.setting;
            org.settings.setting.forEach((item, idx) => {
                if (obj[item.name] != undefined) {
                    updateObj[idx].value = obj[item.name];
                }
            });
            org.settings.setting = updateObj;

            var xmlSettings = new xmlHandler.VpXMLHandler(vpSettingsUrl);
            var xml = xmlSettings.parseToXml(org);

            // save settings
            // - not working -
            var xhr = new XMLHttpRequest();
            xhr.open("PUT", vpSettingsUrl, true);
            xhr.setRequestHeader('Content-type','text/xml');
            xhr.onload = function () {
                var settings = JSON.parse(xhr.responseText);
                if (xhr.readyState == 4 && xhr.status == "200") {
                    console.table(settings);
                } else {
                    console.error(settings);
                }
            }
            xhr.send(xml);
        })
    };

    /**
     * Load settings
     * @param {Function} callback 
     */
    var loadSettings = function(callback) {
        var xmlSettings = new xmlHandler.VpXMLHandler(vpSettingsUrl);
        xmlSettings.loadFile(function() {
            var xml = xmlSettings.getXML();
            // console.log(xml);
            settingsLoadCallback(xml, callback);
        });
    };

    var loadSettingsJson = function(callback) {
        var xmlSettings = new xmlHandler.VpXMLHandler(vpSettingsUrl);
        xmlSettings.loadFile(function() {
            var json = xmlSettings.getJson();
            // console.log(json);
            settingsLoadCallback(json, callback);
        });
    }


    /**
     * Callback for loading settings
     * @param {XMLDocument} obj 
     * @param {Function} callback 
     */
    var settingsLoadCallback = function(obj, callback) {
        callback(obj);
    }

    return {
        default_settings: default_settings,
        saveSettingsData: saveSettingsData,
        loadSettingsData: loadSettingsData,
        loadSettingsDataUsable: loadSettingsDataUsable,
        saveUserDefinedCode: saveUserDefinedCode,
        loadUserDefinedCode: loadUserDefinedCode,
        getUserDefinedCode: getUserDefinedCode,
        loadUserDefinedCodeList: loadUserDefinedCodeList,
        removeUserDefinedCode: removeUserDefinedCode
    }
});