define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/common/vpSetting'
    // TEST: CodeMirror
    , 'codemirror/lib/codemirror'
    , 'codemirror/mode/python/python'
    , 'notebook/js/codemirror-ipython'
    , 'codemirror/addon/display/placeholder'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, vpSetting, CodeMirror, cmpython, cmip) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "Setting"
        , funcID : "com_setting"
    }

    /**
     * html load 콜백. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var optionLoadCallback = function(callback, meta) {
        // document.getElementsByTagName("head")[0].appendChild(link);
        // 컨테이너에서 전달된 callback 함수가 존재하면 실행.
        if (typeof(callback) === 'function') {
            var uuid = 'u' + vpCommon.getUUID();
            // 최대 10회 중복되지 않도록 체크
            for (var idx = 0; idx < 10; idx++) {
                // 이미 사용중인 uuid 인 경우 다시 생성
                if ($(vpConst.VP_CONTAINER_ID).find("." + uuid).length > 0) {
                    uuid = 'u' + vpCommon.getUUID();
                }
            }
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM))).find(vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE)).addClass(uuid);
            // 옵션 객체 생성
            var settingPackage = new SettingPackage(uuid);
            settingPackage.metadata = meta;
            
            // 옵션 속성 할당.
            settingPackage.setOptionProp(funcOptProp);
            // html 설정.
            settingPackage.initHtml();
            callback(settingPackage);  // 공통 객체를 callback 인자로 전달
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "file_io/settings.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var SettingPackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        this.divId = 'vp_settingBox';
    }

    /**
     * vpFuncJS 에서 상속
     */
    SettingPackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    SettingPackage.prototype.optionValidation = function() {
        return true;

        // 부모 클래스 유효성 검사 호출.
        // vpFuncJS.VpFuncJS.prototype.optionValidation.apply(this);
    }


    /**
     * html 내부 binding 처리
     */
    SettingPackage.prototype.initHtml = function() {
        this.bindSettings();

        this.bindFunctions();

        // TEST: Bind CodeMirror to Textarea
        //this.bindCodeMirror();
        // TEST: Bind CodeMirror stylesheet
        //this.loadCss(Jupyter.notebook.base_url + "/codemirror/lib/codemirror.css");
        //this.loadCss(Jupyter.notebook.base_url + "/codemirror/lib/codemirror.css");
    }

    /**
     * Setting 목록 추가
     */
    SettingPackage.prototype.bindSettings = function() {
        this.loadSettings(true);
    };

    /**
     * TEST: Bind CodeMirror to Textarea
     */
    SettingPackage.prototype.bindCodeMirror = function() {
        // var editor = CodeMirror.fromTextArea(document.getElementById('vp_testCodeMirror'), {
        window.vp_testCodeMirror = CodeMirror.fromTextArea($(this.wrapSelector('#vp_testCodeMirror'))[0], {
            mode: 'markdown', // text-cell(markdown cell) set to 'htmlmixed'
            lineNumbers: true,
            lineWrapping: true, // text-cell(markdown cell) set to true
            theme: "default",
            extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
        });

        /**
         * CodeMirror reference : https://codemirror.net/index.html
         *  
         * CodeMirror object Usage :
         * 1. Get value
         *  vp_testCodeMirror.getValue()
         * 2. Set value
         *  vp_testCodeMirror.setValue('string')
         * 3. Apply to original textarea
         *  vp_testCodeMirror.save()
         * 4. Get Textarea object
         *  vp_testCodeMirror.getTextArea()
         * 
         * Prefix box Textarea
         *  var vp_prefix = CodeMirror.fromTextArea($('#vp_prefixBox textarea')[0], { mode:'htmlmixed', lineNumbers: true, theme: 'default'});
         * Postfix box Textarea
         *  var vp_postfix = CodeMirror.fromTextArea($('#vp_postfixBox textarea')[0], { mode: 'htmlmixed', lineNumbers: true, theme: 'default'});
         */
    }

    /**
     * Load Settings
     * @param {boolean} showValue true : value / false : default value
     */
    SettingPackage.prototype.loadSettings = function(showValue) {
        var that = this;

        $(this.wrapSelector('#' + that.divId)).html('');

        // load setting list to div
        var settingList = vpSetting.loadSettingsDataUsable();
        settingList.forEach(obj => {
            var value = (showValue == true? obj.value : obj.default);
            var divSetItem = $('<div class="vp-setting-item form-group list-group-item"></div>');
            var label = $(`<label for="${obj.name}">${obj.description}</label>`);
            if (obj.type == 'options') {
                // select options
                var select = $(`<select id=${obj.name} class="form-control"></select>`);
                obj.options.forEach(opt => {
                    // FIXME: if korean, can use opt.text
                    var option = $(`<option value="${opt.value}">${opt.value}</option>`);
                    select.append(option);
                });
                $(select).val(value);

                divSetItem.append(label);
                divSetItem.append(select);
            } else if (obj.type == 'checkbox') {
                // input checkbox
                var checkbox = $(`<input id="${obj.name}" type="${obj.type}" value="${value}" ${value==true?"checked":""}/>`);
                divSetItem.append(checkbox);
                divSetItem.append(label);
            } else if (obj.type == 'text') {
                // input text
                var input = $(`<input id="${obj.name}" class="form-control" type="${obj.type}" value="${value}" />`);
                divSetItem.append(label);
                divSetItem.append(input);
            }

            $(that.wrapSelector('#' + that.divId)).append(divSetItem);
        });
    }

    /**
     * save settings
     * 
     * reference
     * Jupyter.notebook.config.update({'vp': {'run_code_without_asking':true}});
     * Jupyter.notebook.config.data.vp
     */
    SettingPackage.prototype.saveSettings = function() {
        var updateObj = {};

        // make update object for setting list
        Object.keys(vpSetting.default_settings).forEach(key => {
            var tag = $(this.wrapSelector('#' + key));
            var value = tag.val().toString();
            if (tag.attr('type') == 'checkbox') {
                value = tag.prop('checked');
            }
            updateObj[key] = value;
        });

        // vpSetting.saveSettingsJson(updateObj);
        vpSetting.saveSettingsData(updateObj);
    };

    /**
     * bind button function
     */
    SettingPackage.prototype.bindFunctions = function() {
        var that = this;

        // load setting
        $(this.wrapSelector('#vp_loadSetting')).click(function() {
            that.loadSettings(true);
        });

        // save setting
        $(this.wrapSelector('#vp_saveSetting')).click(function() {
            that.saveSettings();
        });

        // set to default
        $(this.wrapSelector('#vp_setDefault')).click(function() {
            that.loadSettings(false);
        });
    }

    /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    SettingPackage.prototype.generateCode = function(addCell, exec) {
        // if (!this.optionValidation()) return;
        return "BREAK_RUN"
    }

    

    return {
        initOption: initOption
    };
});
