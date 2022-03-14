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
define([
    'text!vp_base/html/popupComponent.html!strip',
    'css!vp_base/css/popupComponent.css',
    '../com_util',
    '../com_Const',
    '../com_String',
    '../com_interface',
    './Component',

    /** codemirror */
    'codemirror/lib/codemirror',
    'codemirror/mode/python/python',
    'notebook/js/codemirror-ipython',
    'codemirror/addon/display/placeholder',
    'codemirror/addon/display/autorefresh'
], function(popupComponentHtml, popupComponentCss
    , com_util, com_Const, com_String, com_interface, Component, codemirror
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
            super($('#site'), state, prop);
        }

        _init() {
            this.eventTarget = '#vp_wrapper';
            this.id = this.state.config.id;
            this.name = this.state.config.name;
            this.path = this.state.config.path;

            this.config = {
                sizeLevel: 0,          // 0: 400x400 / 1: 500x500 / 2: 600x500 / 3: 750x500
                executeMode: 'code',   // cell execute mode
                // show view box
                codeview: true, 
                dataview: true,
                // show footer
                runButton: true,
                footer: true,
                position: { right: 10, top: 120 },
                size: { width: 400, height: 550 },
                saveOnly: false
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
                // that.toggle();
                $(that.eventTarget).trigger({
                    type: 'close_option_page',
                    component: that
                });
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
                let id = $(this)[0].id;
                let customKey = $(this).data('key');
                let tagName = $(this).prop('tagName'); // returns with UpperCase
                let newValue = '';
                switch(tagName) {
                    case 'INPUT':
                        let inputType = $(this).prop('type');
                        if (inputType == 'text' || inputType == 'number' || inputType == 'hidden') {
                            newValue = $(this).val();
                            break;
                        }
                        if (inputType == 'checkbox') {
                            newValue = $(this).prop('checked');
                            break;
                        }
                        break;
                    case 'TEXTAREA':
                    case 'SELECT':
                    default:
                        newValue = $(this).val();
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
                        that.state[customKeys[0]][customKeys[1]] = newValue;
                    } else {
                        that.state[customKey] = newValue;
                    }
                } else {
                    that.state[id] = newValue;
                }
                vpLog.display(VP_LOG_TYPE.DEVELOP, 'saved state : ' + id+ '/'+tagName+'/'+newValue);
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
                        that.save();
                        that.run();
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
                        that.save();
                        that.run(false);
                        break;
                }
            });
            // Close event for inner popup
            $(this.wrapSelector('.vp-inner-popup-close')).on('click', function(evt) {
                that.handleInnerCancel();
                that.closeInnerPopup();
            });
            // Click button event for inner popup
            $(this.wrapSelector('.vp-inner-popup-button')).on('click', function(evt) {
                let btnType = $(this).data('type');
                switch(btnType) {
                    case 'cancel':
                        that.handleInnerCancel();
                        that.closeInnerPopup();
                        break;
                    case 'ok':
                        that.handleInnerOk();
                        break;
                }
            });
        }

        _unbindEvent() {
            $(document).off('change', this.wrapSelector('.vp-state'));
        }

        _bindDraggable() {
            var that = this;
            $(this.wrapSelector()).draggable({
                handle: '.vp-popup-title',
                containment: 'body',
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
            $(this.wrapSelector()).resizable({
                handles: 'all'
            });
        }

        templateForBody() {
            /** Implementation needed */
            return '';
        }

        template() { 
            this.$pageDom = $(popupComponentHtml);
            // set title
            this.$pageDom.find('.vp-popup-title').text(this.state.config.name);
            // set body
            this.$pageDom.find('.vp-popup-body').html(this.templateForBody());
            return this.$pageDom;
        }

        /**
         * Render page
         * @param {Object} config configure whether to use buttons or not 
         */
        render(inplace=false) {
            super.render(inplace);

            let {codeview, dataview, runButton, footer, sizeLevel, position} = this.config;

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
        }

        templateForDataView() {
            /** Implementation needed */
            return '';
        }

        renderDataView() {
            $('.vp-popup-dataview-box').html('');
            $('.vp-popup-dataview-box').html(this.templateForDataView());
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
                let id = tag.id;
                let customKey = $(tag).data('key');
                let tagName = $(tag).prop('tagName'); // returns with UpperCase
                let newValue = '';
                switch(tagName) {
                    case 'INPUT':
                        let inputType = $(tag).prop('type');
                        if (inputType == 'text' || inputType == 'number' || inputType == 'hidden') {
                            newValue = $(tag).val();
                            break;
                        }
                        if (inputType == 'checkbox') {
                            newValue = $(tag).prop('checked');
                            break;
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
                        that.state[customKeys[0]][customKeys[1]] = newValue;
                    } else {
                        that.state[customKey] = newValue;
                    }
                } else {
                    that.state[id] = newValue;
                }
            }); 
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'savedState', that.state);   
        }

        run(execute=true, addcell=true) {
            let code = this.generateCode();
            let mode = this.config.executeMode;
            let blockNumber = -1;
            // check if it's block
            if (this.getTaskType() == 'block') {
                let block = this.taskItem;
                blockNumber = block.blockNumber;
            }
            if (addcell) {
                if (Array.isArray(code)) {
                    // insert cells if it's array of codes
                    com_interface.insertCells(mode, code, execute, blockNumber);
                } else {
                    com_interface.insertCell(mode, code, execute, blockNumber);
                }
            }
            return code;
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
            $('.vp-popup-frame').css({ 'z-index': 200 });
            $(this.wrapSelector()).addClass('vp-focused');
            $(this.wrapSelector()).css({ 'z-index': 205 }); // move forward
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
                $(this.wrapSelector('.vp-popup-toggle')).attr('src', '/nbextensions/visualpython/img/tri_down_fill_dark.svg');
            } else {
                // hide
                $this.addClass('vp-close');
                $(this.wrapSelector('.vp-popup-toggle')).attr('src', '/nbextensions/visualpython/img/tri_right_fill_dark.svg');
            }
        }

        /**
         * Open view
         * @param {*} viewType code / data
         */
        openView(viewType) {
            if (viewType == 'code') {
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
        }
        
        /**
         * Close inner popup box
         */
        closeInnerPopup() {
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