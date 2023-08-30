/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : HelpViewer.js
 *    Author          : Black Logic
 *    Note            : Component > HelpViewer
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 07. 13
 *    Change Date     :
 */
//============================================================================
// [CLASS] HelpViewer
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/component/helpViewer.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/component/popupComponent'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/Component',
    'vp_base/js/com/component/LoadingSpinner'
], function(hvHtml, ppCss, com_util, com_Const, com_String, Component, LoadingSpinner) {

    /**
     * HelpViewer
     */
    class HelpViewer extends Component {
        constructor() {
            super($(vpConfig.parentSelector), {}, {});
        }

        _init() {
            this.position = {
                right: 10, top: 120
            };
            this.size = {
                width: 500,
                height: 500
            };
        }


        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;

            $(that.wrapSelector('.vp-popup-maximize')).on('click', function() {
                // save position
                that.position = $(that.wrapSelector()).position();
                // save size
                that.size = {
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
                    width: that.size.width + 'px',
                    height: that.size.height + 'px',
                    top: that.position.top,
                    left: that.position.left
                });
                // show / hide buttons
                $(this).hide();
                $(that.wrapSelector('.vp-popup-maximize')).show();
            });

            $(that.wrapSelector('.vp-popup-close')).on('click', function() {
                that.remove();
            });

            $(that.wrapSelector('.vp-popup-button')).on('click', function() {
                var btnType = $(this).data('type');
                switch(btnType) {
                    case 'cancel':
                        that.remove();
                        break;
                }
            });

            // Focus recognization
            $(this.wrapSelector()).on('click', function() {
                that.focus();
            });
        }

        _bindDraggable() {
            var that = this;
            let containment = 'body';
            if (vpConfig.extensionType === 'lab' || vpConfig.extensionType === 'lite') {
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

        template() {
            this.$pageDom = $(hvHtml);

            return this.$pageDom;
        }

        render() {
            super.render();

            // set detailed size
            $(this.wrapSelector()).css({
                width: this.size.width + 'px',
                height: this.size.height + 'px'
            });

            // position
            $(this.wrapSelector()).css({ top: this.position.top, right: this.position.right });

            this._bindDraggable();
            this._bindResizable();
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

        open(content, useHelp=true, importCode='') {
            this.show();

            let that = this;

            let code = content;
            if (useHelp === true) {
                if (importCode !== '') {
                    code = importCode + '\n' + `print(help(${content}))`;
                } else {
                    code = `print(help(${content}))`;
                }
            }

            let loadingSpinner = new LoadingSpinner($(this.wrapSelector('.vp-popup-body')));
            vpKernel.execute(code).then(function(resultObj) {
                let { result } = resultObj;

                $(that.wrapSelector('#helpContent')).text(result);

            }).catch(function(err) {
                vpLog.display(VP_LOG_TYPE.ERROR, err);
            }).finally(function() {
                loadingSpinner.remove();
            });

            this.focus();
        }

        generateCode() {
            return '';
        }

        show() {
            $(this.wrapSelector()).show();
        }

        remove() {
            $(this.wrapSelector()).remove();
        }

        focus() {
            $('.vp-popup-frame').removeClass('vp-focused');
            $('.vp-popup-frame').css({ 'z-index': 1200 });
            $(this.wrapSelector()).addClass('vp-focused');
            $(this.wrapSelector()).css({ 'z-index': 1205 }); // move forward
        }

    }

    return HelpViewer;
});