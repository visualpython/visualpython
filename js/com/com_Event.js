/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_Event.js
 *    Author          : Black Logic
 *    Note            : Manage global trigger events
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 10
 *    Change Date     :
 */

//============================================================================
// [CLASS] Event
//============================================================================
define([], function() {
	'use strict';

    //========================================================================
    // Declare Class
    //========================================================================
    class Event {

        constructor(mainFrame) {
            this.mainFrame = mainFrame;
            this.useHotkey = true;

            var that = this;

            /** GLOBAL keyBoardManager */
            this.keyManager = {
                keyCode : {
                    ctrlKey: 17,
                    cmdKey: 91,
                    shiftKey: 16,
                    altKey: 18,
                    enter: 13,
                    escKey: 27,
                    vKey: 86,
                    cKey: 67
                },
                keyCheck : {
                    ctrlKey: false,
                    shiftKey: false
                }
            };

            this._globalEvent = [
                {
                    method: 'click focus',
                    operation: (evt) => {
                        var target = evt.target;
                        // Focus recognization
                        // blurred on popup frame
                        if ($('.vp-popup-frame').has(target).length <= 0) {
                            $('#vp_wrapper').trigger({
                                type: 'blur_option_page'
                            });
                        }
                        // Close on blur
                        // if (!$(target).hasClass('vp-close-on-blur-btn') && !$(target).hasClass('vp-close-on-blur')) {
                        if ($('.vp-close-on-blur-btn').find(target).length == 0 
                            && !$(target).hasClass('vp-close-on-blur') 
                            && $('.vp-close-on-blur').find(target).length == 0) {
                            $('.vp-close-on-blur').hide();
                        }
                        // VarSelector filter box
                        if ($('.vp-vs-blur-btn').find(target).length == 0 
                            && !$(target).hasClass('vp-vs-blur-btn')
                            && $('.vp-vs-blur-btn').find(target).length == 0) {
                            $('.vp-vs-blur').removeClass('vp-inline-block');
                        }
                    }
                },
                { 
                    method: 'click', 
                    selector: '.vp-accordian', 
                    operation: (evt) => {
                        var target = evt.currentTarget;
                        if ($(target).hasClass('vp-open')) {
                            // open -> close
                            $(target).removeClass('vp-open');
                            $(target).addClass('vp-close');

                        } else {
                            // close -> open
                            $(target).removeClass('vp-close');
                            $(target).addClass('vp-open');
                        }
                    }
                },
                {
                    method: 'create_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        // blockType: block/task / menuItem: menu id / menuState: saved state
                        let { blockType, menuId, menuState, position, createChild, afterAction } = evt;
                        let dupTask = that.mainFrame.checkDuplicatedTask(menuId);
                        if (blockType == 'task' && dupTask) {
                            // if duplicated, open its task
                            that.mainFrame.openPopup(dupTask);
                        } else {
                            that.mainFrame.createPopup([{
                                blockType: blockType, 
                                menuId: menuId, 
                                menuState: menuState, 
                                position: position, 
                                createChild: createChild, 
                                afterAction: afterAction
                            }]);
                        }
                    }
                },
                {
                    method: 'open_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var { component } = evt;
                        that.mainFrame.openPopup(component);
                    }
                },
                {
                    method: 'close_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var { component } = evt;
                        that.mainFrame.closePopup(component);
                    }
                },
                {
                    method: 'apply_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var { component } = evt;
                        that.mainFrame.applyPopup(component);
                    }
                },
                {
                    method: 'focus_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var { component } = evt;
                        that.mainFrame.focusPopup(component);
                    }
                },
                {
                    method: 'blur_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var { component } = evt;
                        that.mainFrame.blurPopup(component);
                    }
                },
                {
                    method: 'blur_all_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        that.mainFrame.blurPopup();
                    }
                },
                {
                    method: 'remove_option_page',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        var { component } = evt;
                        that.mainFrame.removePopup(component);
                    }
                },
                {
                    method: 'disable_vp_hotkey',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        // disable vp hotkey
                        that.disableHotkey();
                    }
                },
                {
                    method: 'enable_vp_hotkey',
                    selector: '#vp_wrapper',
                    operation: (evt) => {
                        // enable vp hotkey
                        that.enableHotkey();
                    }
                }
            ]

            this._keyEvent = [
                {
                    method: 'keydown',
                    selector: document,
                    operation: (evt) => {
                        if (evt.keyCode == that.keyManager.keyCode.ctrlKey || evt.keyCode == that.keyManager.keyCode.cmdKey) {
                            that.keyManager.keyCheck.ctrlKey = true;
                        }
                        if (evt.keyCode == that.keyManager.keyCode.shiftKey) {
                            that.keyManager.keyCheck.shiftKey = true;
                        }
                    }
                },
                {
                    method: 'keyup',
                    selector: document,
                    operation: (evt) => {
                        if (evt.keyCode == that.keyManager.keyCode.ctrlKey || evt.keyCode == that.keyManager.keyCode.cmdKey) {
                            that.keyManager.keyCheck.ctrlKey = false;
                        }
                        if (evt.keyCode == that.keyManager.keyCode.shiftKey) {
                            that.keyManager.keyCheck.shiftKey = false;
                        }
                        if (evt.keyCode == that.keyManager.keyCode.escKey) {
                            // check if there is visible data selector : DataSelector
                            if ($('.vp-dataselector-base:visible').length > 0) {
                                // close data selector
                                $('.vp-dataselector-base:visible').remove();
                            }
                            // check if there is visible inner popup
                            else if ($('.vp-popup-frame > .vp-inner-popup-box:visible').length > 0) {
                                // close inner popup on esc
                                that.mainFrame.focusedPage && that.mainFrame.focusedPage.closeInnerPopup();
                            } else {
                                // close popup on esc
                                $('#vp_wrapper').trigger({
                                    type: 'close_option_page',
                                    component: that.mainFrame.focusedPage
                                });
                            }
                        }
                        if (evt.keyCode == that.keyManager.keyCode.enter) {
                            // blur on enter
                            var target = evt.target;
                            if ($(target).hasClass('vp-blur-on-enter')) {
                                $(target).blur();
                            }
                        }
                    }
                }
            ]

            this._loadKeyEvent();
            this._loadGlobalEvent();

            // jquery custom method : single double click event
            $.fn.single_double_click = function(single_click_callback, double_click_callback, timeout) {
                return this.each(function(){
                    var clicks = 0, 
                        self = this;
                    $(this).click(function(event){
                        clicks++;
                        if (clicks == 1) {
                            setTimeout(function(){
                                if(clicks == 1) {
                                    single_click_callback.call(self, event);
                                } else {
                                    double_click_callback.call(self, event);
                                }
                                clicks = 0;
                            }, timeout || 300);
                        }
                    });
                });
            }
        }

        _loadGlobalEvent() {
            var globalEvent = this._globalEvent;
            globalEvent.forEach(event => {
                let { method, selector, operation } = event;
                if (selector != undefined) {
                    $(document).on(method, selector, operation);
                } else {
                    $(document).on(method, operation);
                }
            });
        }

        _loadKeyEvent() {
            var keyEvent = this._keyEvent;
            keyEvent.forEach(event => {
                let { method, selector, operation } = event;
                $(document).on(method, operation);
            });
        }   

        enableHotkey() {
            this.useHotkey = true;
        }

        disableHotkey() {
            this.useHotkey = false;
        }
    }

    return Event;
});

/* End of file */
