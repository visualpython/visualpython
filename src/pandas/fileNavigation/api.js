define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
], function (requirejs, $, vpCommon) {

    // fileNavigation 등의 hotkey 제어 input text 인 경우 포커스를 가지면 핫키 막고 잃으면 핫키 허용
    var controlToggleInput = function() {
        $(`#vp_fileNavigation`).on("focus", ".fileNavigationPage-container input[type='text']", function() {
            Jupyter.notebook.keyboard_manager.disable();
        });
        $(`#vp_fileNavigation`).on("blur", ".fileNavigationPage-container input[type='text']", function() {
            Jupyter.notebook.keyboard_manager.enable();
        });
    }

    var importVisualPythonData = function(file, callback) {
        var rawFile = new XMLHttpRequest();
        rawFile.overrideMimeType("application/json");
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function() {
            if (rawFile.readyState === 4 && rawFile.status == "200") {
                callback(rawFile.responseText);
            }
        }
        rawFile.send(null);
    }

    return {
        controlToggleInput
        , importVisualPythonData
    }
});
