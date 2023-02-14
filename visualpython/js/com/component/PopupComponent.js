/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : PopupComponent.js
 *    Author          : Black Logic
 *    Note            : Popup Components for rendering objects
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] PopupComponent
//============================================================================
// CHROME: notebook/js/codemirror-ipython
(function(mod) {
    if (typeof exports == "object" && typeof module == "object"){ // CommonJS
        if (vpExtType === 'lab') {
            mod(require("codemirror/lib/codemirror"),
            require("codemirror/mode/python/python")
            );
        } else {
            mod(requirejs("codemirror/lib/codemirror"),
                requirejs("codemirror/mode/python/python")
            );
        }
    } else if (typeof define == "function" && define.amd){ // AMD
      define('notebook/js/codemirror-ipython',["codemirror/lib/codemirror",
              "codemirror/mode/python/python"], mod);
    } else {// Plain browser env
      mod(CodeMirror);
    }
})(function(CodeMirror) {
    "use strict";

    CodeMirror.defineMode("ipython", function(conf, parserConf) {
        var pythonConf = {};
        for (var prop in parserConf) {
            if (parserConf.hasOwnProperty(prop)) {
                pythonConf[prop] = parserConf[prop];
            }
        }
        pythonConf.name = 'python';
        pythonConf.singleOperators = new RegExp("^[\\+\\-\\*/%&|@\\^~<>!\\?]");
        if (pythonConf.version === 3) {
            pythonConf.identifiers = new RegExp("^[_A-Za-z\u00A1-\uFFFF][_A-Za-z0-9\u00A1-\uFFFF]*");
        } else if (pythonConf.version === 2) {
            pythonConf.identifiers = new RegExp("^[_A-Za-z][_A-Za-z0-9]*");
        }
        return CodeMirror.getMode(conf, pythonConf);
    }, 'python');

    CodeMirror.defineMIME("text/x-ipython", "ipython");
});

define([
    __VP_TEXT_LOADER__('vp_base/html/component/popupComponent.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/component/popupComponent'), // INTEGRATION: unified version of css loader
    '../com_util',
    '../com_Const',
    '../com_String',
    '../com_interface',
    './Component',
    './DataSelector',

    /** codemirror */
    'codemirror/lib/codemirror',
    'codemirror/mode/python/python',
    'codemirror/addon/display/placeholder',
    'codemirror/addon/display/autorefresh',
    // 'notebook/js/codemirror-ipython' // LAB: disabled to avoid error FIXME:
], function(popupComponentHtml, popupComponentCss
    , com_util, com_Const, com_String, com_interface, Component, DataSelector, codemirror
) {
    'use strict';

    //========================================================================
    // Declare class
    //========================================================================
    /**
     * Component
     */
    class PopupComponent extends Component {
        constructor(state={ config: { id: 'popup', name: 'Popup title', path: 'path/file' }}, prop={}) {
            // CHROME: FIXME: #site -> .notebook-vertical
            // super($('#site'), state, prop);
            super($(vpConfig.parentSelector), state, prop);
        }

        _init() {
            this.eventTarget = '#vp_wrapper';
            this.id = this.state.config.id;
            this.name = this.state.config.name;
            this.path = this.state.config.path;
            

            this.config = {
                sizeLevel: 0,          // 0: 400x400 / 1: 500x500 / 2: 600x500 / 3: 750x500
                executeMode: 'code',   // cell execute mode
                // show header bar buttons
                installButton: false, // install button (#popupInstall) // FIXME: after creating packagemanager, deprecate it
                importButton: false,  // import library button (#popupImport)
                packageButton: false, // package manager button (#popupPackage)
                // show view box
                codeview: true, 
                dataview: true,
                // show footer
                runButton: true,
                footer: true,
                position: { right: 10, top: 120 },
                size: { width: 400, height: 550 },
                saveOnly: false,
                checkModules: [] // module aliases or function names
            };

            // check BoardFrame width and set initial position of popup
            let boardWidth = $('#vp_boardFrame').width();
            this.config.position.right = boardWidth + 10;

            this.cmPythonConfig = {
                mode: {
                    name: 'python',
                    version: 3,
                    singleLineStringErrors: false
                },
                height: '100%',
                width: '100%',
                indentUnit: 4,
                lineNumbers: true,
                matchBrackets: true,
                autoRefresh: true,
                theme: "ipython",
                extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
            }
            this.cmReadonlyConfig = {
                ...this.cmPythonConfig,
                readOnly: true,
                lineNumbers: false,
                scrollbarStyle: "null"
            }

            this.cmCodeview = null;

            this.cmCodeList = [];
        }

        wrapSelector(selector='') {
            var sbSelector = new com_String();
            var cnt = arguments.length;
            if (cnt < 2) {
                // if there's no more arguments
                sbSelector.appendFormat(".vp-popup-frame.{0} {1}", this.uuid, selector);
            } else {
                // if there's more arguments
                sbSelector.appendFormat(".vp-popup-frame.{0}", this.uuid);
                for (var idx = 0; idx < cnt; idx++) {
                    sbSelector.appendFormat(" {0}", arguments[idx]);
                }
            }
            return sbSelector.toString();
        }

        /**
         * Add codemirror object
         * usage: 
         *  this._addCodemirror('code', this.wrapSelector('#code'));
         * @param {String} key stateKey
         * @param {String} selector textarea class name
         * @param {boolean} type code(python)/readonly/markdown
         * @param {Object} etcOpt { events:[{key, callback}, ...] }
         * @returns Object { key, selector, type, cm, ... }
         */
        _addCodemirror(key, selector, type='code', etcOpt={}) {
            this.cmCodeList.push({ key: key, selector: selector, type: type, cm: null, ...etcOpt });
            return this.cmCodeList[this.cmCodeList.length - 1];
        }

        /**
         * bind codemirror
         * @param {string} selector 
         */
        _bindCodemirror() {
            // codemirror editor (if available)
            for (let i = 0; i < this.cmCodeList.length; i++) {
                let cmObj = this.cmCodeList[i];
                if (cmObj.cm == null) {
                    let cm = this.initCodemirror(cmObj);
                    cmObj.cm = cm;
                }
            }

            // code view
            if (this.config.codeview) {
                if (!this.cmCodeview) {
                    // codemirror setting
                    let selector = this.wrapSelector('.vp-popup-codeview-box textarea');
                    let textarea = $(selector);
                    if (textarea && textarea.length > 0) {
                        this.cmCodeview = codemirror.fromTextArea(textarea[0], this.cmReadonlyConfig);
                    } else {
                        vpLog.display(VP_LOG_TYPE.ERROR, 'No text area to create codemirror. (selector: '+selector+')');
                    }
                } else {
                    this.cmCodeview.refresh();
                }
            }
        }

        /**
         * Initialize codemirror
         * @param {Object} cmObj { key, selector, type, ... }
         *  - key      : key to save its value as state (this.state[key])
         *  - selector : selector to distinguish codemirror tag (textarea)
         *    ex) this.wrapSelector('.cm-tag')
         *  - type     : code / readonly / markdown
         *  - events   : list of event objects
         *    ex) [{ key: 'change', callback: function() { ; } }]
         */
        initCodemirror(cmObj) {
            let {key, selector, type, events} = cmObj;
            let that = this;

            let cmCode = null;
            let targetTag = $(selector);
            let cmConfig = this.cmPythonConfig;
            if (type == 'readonly') {
                cmConfig = {
                    ...cmConfig,
                    readOnly: true,
                    lineNumbers: false,
                    scrollbarStyle: "null"
                }
            } else if (type == 'markdown') {
                cmConfig = {
                    ...cmConfig,
                    mode: 'markdown'
                }
            }
            
            if (targetTag && targetTag.length > 0) {
                cmCode = codemirror.fromTextArea(targetTag[0], cmConfig);
                if (cmCode) {
                    // add class on text area
                    if (type != 'readonly') {
                        $(selector).parent().find('.CodeMirror').addClass('vp-writable-codemirror');
                    }
                    cmCode.on('focus', function() {
                        // disable other shortcuts
                        com_interface.disableOtherShortcut();
                    });
                    cmCode.on('blur', function(instance, evt) {
                        // enable other shortcuts
                        com_interface.enableOtherShortcut();
                        // instance = codemirror
                        // save its code to textarea component
                        instance.save();
                        that.state[key] = targetTag.val();
                    });
                    // bind events
                    events && events.forEach(evObj => {
                        cmCode.on(evObj.key, evObj.callback);
                    });
                    vpLog.display(VP_LOG_TYPE.DEVELOP, key, cmCode);
                }
            } else {
                vpLog.display(VP_LOG_TYPE.ERROR, 'No text area to bind codemirror. (selector: '+selector+')');
            }

            return cmCode;
        }

        setCmValue(key, value) {
            let targetCmObj = this.cmCodeList.filter(obj => obj.key == key);
            if (targetCmObj.length > 0) {
                let cm = targetCmObj[0].cm;
                if (cm) {
                    cm.setValue(value);
                    cm.save();
                    setTimeout(function () {
                        cm.refresh();
                    }, 1);
                }
            }
        }

        _bindEvent() {
            var that = this;
            // Close popup event
            $(this.wrapSelector('.vp-popup-close')).on('click', function(evt) {
                if (that.getTaskType() === 'task') {
                    $(that.eventTarget).trigger({
                        type: 'remove_option_page',
                        component: that
                    });
                } else {
                    // if it's block, just hide it
                    $(that.eventTarget).trigger({
                        type: 'close_option_page',
                        component: that
                    });
                }
            });
            // Toggle operation (minimize)
            $(this.wrapSelector('.vp-popup-toggle')).on('click', function(evt) {
                $(that.eventTarget).trigger({
                    type: 'close_option_page',
                    component: that
                });
            });
            // Maximize operation
            $(this.wrapSelector('.vp-popup-maximize')).on('click', function(evt) {
                // save position
                that.config.position = $(that.wrapSelector()).position();
                // save size
                that.config.size = {
                    width: $(that.wrapSelector()).width(),
                    height: $(that.wrapSelector()).height()
                }
                // maximize popup
                $(that.wrapSelector()).css({
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0
                });
                // show / hide buttons
                $(this).hide();
                $(that.wrapSelector('.vp-popup-return')).show();
            });
            // Return operation
            $(this.wrapSelector('.vp-popup-return')).on('click', function(evt) {
                // return size
                $(that.wrapSelector()).css({
                    width: that.config.size.width + 'px',
                    height: that.config.size.height + 'px',
                    top: that.config.position.top,
                    left: that.config.position.left
                });
                // show / hide buttons
                $(this).hide();
                $(that.wrapSelector('.vp-popup-maximize')).show();
            });

            // Click install package
            $(this.wrapSelector('#popupInstall')).on('click', function() {
                // add install codes
                var codes = that.generateInstallCode();
                codes && codes.forEach(code => {
                    com_interface.insertCell('code', code, true, that.getSigText());
                });
            });

            // Click import library
            $(this.wrapSelector('#popupImport')).on('click', function() {
                // add import codes
                var codes = that.generateImportCode();
                codes && codes.forEach(code => {
                    // create block and run it
                    $('#vp_wrapper').trigger({
                        type: 'create_option_page', 
                        blockType: 'block',
                        menuId: 'lgExe_code',
                        menuState: { taskState: { code: code } },
                        afterAction: 'run'
                    });
                });
            });

            // Click package manager
            $(this.wrapSelector('#popupPackage')).on('click', function() {
                // TODO:
            });


            // Focus recognization
            $(this.wrapSelector()).on('click', function() {
                $(that.eventTarget).trigger({
                    type: 'focus_option_page',
                    component: that
                });
            });

            // save state values
            $(document).on('change', this.wrapSelector('.vp-state'), function() {
                that._saveSingleState($(this)[0]);
            });

            // Click buttons
            $(this.wrapSelector('.vp-popup-button')).on('click', function(evt) {
                var btnType = $(this).data('type');
                switch(btnType) {
                    case 'code':
                        if ($(that.wrapSelector('.vp-popup-codeview-box')).is(':hidden')) {
                            that.openView('code');
                        } else {
                            that.closeView('code');
                        }
                        evt.stopPropagation();
                        break;
                    case 'data':
                        if ($(that.wrapSelector('.vp-popup-dataview-box')).is(':hidden')) {
                            that.openView('data');
                        } else {
                            that.closeView('data');
                        }
                        evt.stopPropagation();
                        break;
                    case 'cancel':
                        if (that.getTaskType() === 'task') {
                            $(that.eventTarget).trigger({
                                type: 'remove_option_page',
                                component: that
                            });
                        } else {
                            // if it's block, just hide it
                            $(that.eventTarget).trigger({
                                type: 'close_option_page',
                                component: that
                            });
                        }
                        break;
                    case 'run':
                        let result = that.run();
                        if (result) {
                            that.save();
                        }
                        break;
                    case 'show-detail':
                        $(that.wrapSelector('.vp-popup-run-detailbox')).show();
                        evt.stopPropagation();
                        break;
                    case 'save':
                        that.save();
                        break;
                }
            });
            // Click detail buttons
            $(this.wrapSelector('.vp-popup-detail-button')).on('click', function(evt) {
                var btnType = $(this).data('type');
                switch(btnType) {
                    case 'apply':
                        that.save();
                        break;
                    case 'add':
                        let result = that.run(false);
                        if (result) {
                            that.save();
                        }
                        break;
                }
            });
            // Close event for inner popup
            $(this.wrapSelector('.vp-inner-popup-close')).on('click', function(evt) {
                that.closeInnerPopup();
            });
            // Click button event for inner popup
            $(this.wrapSelector('.vp-inner-popup-button')).on('click', function(evt) {
                let btnType = $(this).data('type');
                switch(btnType) {
                    case 'cancel':
                        that.closeInnerPopup();
                        break;
                    case 'ok':
                        that.handleInnerOk();
                        break;
                }
            });

            // focus on data selector input
            $(this.wrapSelector('.vp-data-selector')).on('focus', function(evt) {
                
            });

            // click on data selector input filter
            $(this.wrapSelector('.vp-data-selector')).on('click', function(evt) {

            });
        }

        _unbindEvent() {
            $(document).off('change', this.wrapSelector('.vp-state'));
        }

        _bindDraggable() {
            var that = this;
            let containment = 'body';
            if (vpConfig.extensionType === 'lab') {
                containment = '#main';
            }
            $(this.wrapSelector()).draggable({
                handle: '.vp-popup-title',
                containment: containment,
                start: function(evt, ui) {
                    // check focused
                    $(that.eventTarget).trigger({
                        type: 'focus_option_page',
                        component: that
                    });
                }
            });

            // inner popup draggable
            $(this.wrapSelector('.vp-inner-popup-box')).draggable({
                handle: '.vp-inner-popup-title',
                containment: 'parent'
            });
        }

        _unbindResizable() {
            $(this.wrapSelector()).resizable('disable');
        }

        _bindResizable() {
            let that = this;
            $(this.wrapSelector()).resizable({
                handles: 'all',
                start: function(evt, ui) {
                    // show / hide buttons
                    $(that.wrapSelector('.vp-popup-return')).hide();
                    $(that.wrapSelector('.vp-popup-maximize')).show();
                }
            });
        }

        templateForBody() {
            /** Implementation needed */
            return '';
        }

        template() { 
            this.$pageDom = $(popupComponentHtml.replaceAll('${vp_base}', com_Const.BASE_PATH));
            // set title
            this.$pageDom.find('.vp-popup-title').text(this.name);
            // set body
            let bodyTemplate = this.templateForBody();
            // CHROME: check url keyword and replace it
            if (bodyTemplate) {
                if (typeof bodyTemplate === 'string') {
                    // string replacement
                    bodyTemplate = bodyTemplate.replaceAll('${vp_base}', com_Const.BASE_PATH);
                } else {
                    // object = jquery object

                }
            }
            this.$pageDom.find('.vp-popup-content').html(bodyTemplate);
            return this.$pageDom;
        }

        /**
         * Render page
         * @param {Object} config configure whether to use buttons or not 
         */
        render(inplace=false) {
            super.render(inplace);

            let { 
                installButton, importButton, packageButton, 
                codeview, dataview, runButton, footer, 
                sizeLevel, position
            } = this.config;

            // import & package manager button hide/show
            if (!installButton) { // FIXME: Deprecated after creating package manager
                $(this.wrapSelector('#popupInstall')).hide();
            }
            if (!importButton) {
                $(this.wrapSelector('#popupImport')).hide();
            }
            if (!packageButton) {
                $(this.wrapSelector('#popupPackage')).hide();
            }
            if (installButton || importButton || packageButton) {
                // resize height
                $(this.wrapSelector('.vp-popup-content')).css({
                    'height': 'calc(100% - 30px)'
                });
            } else {
                $(this.wrapSelector('.vp-popup-content')).css({
                    'height': '100%'
                });
            }

            // codeview & dataview button hide/show
            if (!codeview) {
                $(this.wrapSelector('.vp-popup-button[data-type="code"]')).hide();
            } 
            if (!dataview) {
                $(this.wrapSelector('.vp-popup-button[data-type="data"]')).hide();
            }

            // run button
            if (!runButton) {
                $(this.wrapSelector('.vp-popup-runadd-box')).hide();
            }

            // footer
            if(!footer) {
                $(this.wrapSelector('.vp-popup-footer')).hide();
                // set body wider
                $(this.wrapSelector('.vp-popup-body')).css({
                    'height': 'calc(100% - 30px)'
                })
            }

            // popup-frame size
            switch (sizeLevel) {
                case 1: 
                    this.config.size = { width: 500, height: 550 };
                    break;
                case 2: 
                    this.config.size = { width: 600, height: 550 };
                    break;
                case 3: 
                    this.config.size = { width: 760, height: 550 };
                    break;
            }

            // set detailed size
            $(this.wrapSelector()).css({
                width: this.config.size.width + 'px',
                height: this.config.size.height + 'px'
            });

            // position
            $(this.wrapSelector()).css({ top: position.top, right: position.right });

            // set apply mode
            if (this.config.saveOnly) {
                this.setSaveOnlyMode();
            }

            this._bindDraggable();
            this._bindResizable();
        }
        
        templateForInnerPopup() {
            /** Implementation needed */
            return '';
        }
        
        /**
         * Render inner popup for selecting columns
         * @returns Inner popup page dom
         */
        renderInnerPopup() {
            $(this.wrapSelector('.vp-inner-popup-body')).html(this.templateForInnerPopup());


            // set position to center
            let width = $(this.wrapSelector('.vp-inner-popup-box')).width();
            let height = $(this.wrapSelector('.vp-inner-popup-box')).height();

            $(this.wrapSelector('.vp-inner-popup-box')).css({
                left: 'calc(50% - ' + parseInt(width/2) + 'px)',
                top: 'calc(50% - ' + parseInt(height/2) + 'px)',
            })
        }

        templateForDataView() {
            /** Implementation needed */
            return '';
        }

        renderDataView() {
            $('.vp-popup-dataview-box').html('');
            $('.vp-popup-dataview-box').html(this.templateForDataView());
        }

        /**
         * Generated on clicking Install Package button
         * @returns Array of installment codes
         */
        generateInstallCode() {
            /** Implementation needed - Generated on clicking Install Package button */
            return [];
        }

        generateImportCode() {
            /** Implementation needed - Generated on clicking Import Library button */
            return [];
        }

        generateCode() {
            /** Implementation needed */
            return '';
        }

        load() {
            
        }

        loadState() {
            /** Implementation needed */
        }

        saveState() {
            /** Implementation needed */
            let that = this;
            $(this.wrapSelector('.vp-state')).each((idx, tag) => {
                that._saveSingleState(tag);
            }); 
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'savedState', that.state);   
        }

        _saveSingleState(tag) {
            let id = tag.id;
            let customKey = $(tag).data('key');
            let tagName = $(tag).prop('tagName'); // returns with UpperCase
            let newValue = '';
            switch(tagName) {
                case 'INPUT':
                    let inputType = $(tag).prop('type');
                    if (inputType == 'checkbox') {
                        newValue = $(tag).prop('checked');
                    } else {
                        // inputType == 'text' || inputType == 'number' || inputType == 'hidden' || inputType == 'color' || inputType == 'range'
                        newValue = $(tag).val();
                    }
                    break;
                case 'TEXTAREA':
                case 'SELECT':
                default:
                    newValue = $(tag).val();
                    if (!newValue) {
                        newValue = '';
                    }
                    break;
            }
            
            // if custom key is available, use it
            if (customKey && customKey != '') {
                // allow custom key until level 2
                let customKeys = customKey.split('.');
                if (customKeys.length == 2) {
                    this.state[customKeys[0]][customKeys[1]] = newValue;
                } else {
                    this.state[customKey] = newValue;
                }
            } else {
                this.state[id] = newValue;
            }
        }

        getSigText() {
            let sigText = '';
            if (this.getTaskType() == 'block') {
                let block = this.taskItem;
                sigText = block.sigText;
            } else {
                try {
                    let menuGroup = this.path.split(' - ')[1];
                    let menuGroupLabel = vpConfig.getMenuGroupLabel(menuGroup);
                    if (menuGroupLabel != undefined && menuGroupLabel !== '') {
                        sigText = menuGroupLabel + ' > ' + this.name;
                    } else {
                        sigText = this.name;
                    }
                } catch {}
            }
            return sigText;
        }

        /**
         * Check if required option is filled
         * @returns true if it's ok / false if there is empty required option
         */
        checkRequiredOption() {
            let requiredFilled = true;
            let requiredTags = $(this.wrapSelector('input[required=true]') + ',' + this.wrapSelector('input[required=required]'));

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'checkRequiredOption', this, requiredTags);

            if (requiredTags) {
                for (let i = 0; i < requiredTags.length; i++) {
                    let thisTag = $(requiredTags[i]);
                    // if it's visible and empty, focus on it
                    if (thisTag.is(':visible') && thisTag.val() == '') {
                        $(requiredTags[i]).focus();
                        requiredFilled = false;
                        break;
                    }
                }
            }

            return requiredFilled;
        }

        checkAndRunModules(execute=true, background=false) {
            let sigText = this.getSigText();

            let checkModules = this.config.checkModules;
            return new Promise(function(resolve, reject) {
                // CHROME: TODO: 9: checkmodule works strange...
                if (checkModules.length > 0) {
                    vpKernel.checkModule(checkModules).then(function(resultObj) {
                        let { result } = resultObj;
                        vpLog.display(VP_LOG_TYPE.DEVELOP, resultObj);
                        let checkedList = JSON.parse(result);
                        let executeList = [];
                        checkedList && checkedList.forEach((mod, idx) => {
                            if (mod == false) {
                                let modInfo = vpConfig.getModuleCode(checkModules[idx]);
                                if (modInfo) {
                                    executeList.push(modInfo.code);
                                }
                            }
                        });
                        if (executeList && executeList.length > 0) {
                            com_interface.insertCell('code', executeList.join('\n'), execute, sigText);
                        }
                        resolve(executeList);
                    });
                } else {
                    resolve([]);
                }
                // resolve([]);
            });
        }

        run(execute=true, addcell=true) {
            // check required
            if (this.checkRequiredOption() === false) {
                return false;
            }

            let mode = this.config.executeMode;
            let sigText = this.getSigText();
            let code = this.generateCode();

            vpLog.display(VP_LOG_TYPE.DEVELOP, sigText, mode, code);

            // check modules
            this.checkAndRunModules(execute).then(function(executeList) {
                if (addcell) {
                    if (Array.isArray(code)) {
                        // insert cells if it's array of codes
                        com_interface.insertCells(mode, code, execute, sigText);
                    } else {
                        com_interface.insertCell(mode, code, execute, sigText);
                    }
                }
            });
            return true;
        }

        /**
         * Open popup
         * - show popup
         * - focus popup
         * - bind codemirror
         */
        open() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'open popup', this);
            this.loadState();
            
            this.show();

            // set popup position if its top-left side is outside of view
            let pos = $(this.wrapSelector()).position();
            if (pos) {
                if (pos.top < 0) {
                    $(this.wrapSelector()).css({ top: 0 });
                }
                if (pos.left < 0) {
                    $(this.wrapSelector()).css({ left: 0 });
                }
            }

            this._bindCodemirror();

            $(this.eventTarget).trigger({
                type: 'focus_option_page',
                component: this
            });
        }

        setSaveOnlyMode() {
            // show save button only
            $(this.wrapSelector('.vp-popup-runadd-box')).hide();
            $(this.wrapSelector('.vp-popup-save-button')).show();
        }

        /**
         * Close popup
         * - remove popup
         * - unbind event
         */
        close() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'close popup', this);
            this.saveState();
            this.hide();
        }

        save() {
            $(this.eventTarget).trigger({
                type: 'apply_option_page', 
                blockType: 'block',
                component: this
            });
        }

        remove() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'remove popup', this);
            this._unbindEvent();
            $(this.wrapSelector()).remove();
        }

        focus() {
            $('.vp-popup-frame').removeClass('vp-focused');
            $('.vp-popup-frame').css({ 'z-index': 1200 });
            $(this.wrapSelector()).addClass('vp-focused');
            $(this.wrapSelector()).css({ 'z-index': 1205 }); // move forward
            // focus on its block
            if (this.taskItem) {
                this.taskItem.focusItem();
            }
        }

        blur() {
            $(this.wrapSelector()).removeClass('vp-focused');
        }

        show() {
            this.taskItem && this.taskItem.focusItem();
            $(this.wrapSelector()).show();
        }

        hide() {
            this.taskItem && this.taskItem.blurItem();
            $(this.wrapSelector()).hide();
        }

        isHidden() {
            return !$(this.wrapSelector()).is(':visible');
        }

        /**
         * minimize and maximize
         */
        toggle() {
            let $this = $(this.wrapSelector());
            let isClosed = $this.hasClass('vp-close');
            if (isClosed) {
                // show
                $this.removeClass('vp-close');
                $(this.wrapSelector('.vp-popup-toggle')).attr('src', com_Const.IMAGE_PATH + 'tri_down_fill_dark.svg');
            } else {
                // hide
                $this.addClass('vp-close');
                $(this.wrapSelector('.vp-popup-toggle')).attr('src', com_Const.IMAGE_PATH + 'tri_right_fill_dark.svg');
            }
        }

        /**
         * Open view
         * @param {*} viewType code / data
         */
        openView(viewType) {
            if (viewType == 'code') {
                this.saveState();
                var code = this.generateCode();
                let codeText = '';
                if (Array.isArray(code)) {
                    codeText = code.join('\n');
                } else {
                    codeText = code;
                }
                this.cmCodeview.setValue(codeText);
                this.cmCodeview.save();
                
                var that = this;
                setTimeout(function() {
                    that.cmCodeview.refresh();
                }, 1);
                $(this.wrapSelector('.vp-popup-dataview-box')).hide();
            } else {
                this.renderDataView();
                $(this.wrapSelector('.vp-popup-codeview-box')).hide();
            }

            $(this.wrapSelector('.vp-popup-'+viewType+'view-box')).show();
        }

        closeView(viewType) {
            $(this.wrapSelector('.vp-popup-'+viewType+'view-box')).hide();
        }

        /**
         * Open inner popup box
         */
        openInnerPopup(title) {
            $(this.wrapSelector('.vp-inner-popup-title')).text(title);
            $(this.wrapSelector('.vp-inner-popup-box')).show();

            // focus on first input
            $(this.wrapSelector('.vp-inner-popup-box input:not(:disabled):visible:first')).focus();
            // disable Jupyter key
            com_interface.disableOtherShortcut();
        }
        
        /**
         * Close inner popup box
         */
        closeInnerPopup() {
            this.handleInnerCancel();
            $(this.wrapSelector('.vp-inner-popup-box')).hide();
        }

        handleInnerCancel() {
            /** Implementation needed */
        }

        handleInnerOk() {
            /** Implementation needed */
        }

        //========================================================================
        // Get / set
        //========================================================================
        getCodemirror(key) {
            let filteredCm = this.cmCodeList.find(cmObj => cmObj.key == key);
            return filteredCm;
        }

        //========================================================================
        // Control task item 
        //========================================================================
        setTaskItem(taskItem) {
            this.taskItem = taskItem;
        }

        getTaskType() {
            if (this.taskItem) {
                if (this.taskItem.constructor.name == 'Block') {
                    return 'block';
                }
                if (this.taskItem.constructor.name == 'TaskItem') {
                    return 'task';
                }
            }
            return null;
        }

        removeBlock() {
            this.taskItem && this.taskItem.removeItem();
        }
    }

    return PopupComponent;

});

/* End of file */