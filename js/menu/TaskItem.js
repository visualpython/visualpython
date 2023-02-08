/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : TaskItem.js
 *    Author          : Black Logic
 *    Note            : Render and load task item
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 13
 *    Change Date     :
 */

//============================================================================
// [CLASS] TaskItem
//============================================================================
define([
    '../com/com_Const',
    '../com/com_String',
    '../com/component/Component',
], function(com_Const, com_String, Component) {
    'use strict';
    //========================================================================
    // Declare class
    //========================================================================
    /**
     * TaskItem
     */
    class TaskItem extends Component{

        _init() {
            // set taskitem to component
            this.state.task.setTaskItem(this);
        }
        
        _bindEvent() {
            let that = this;
            // click event - emphasize TaskItem & open/hide PopupComponent
            $(this.wrapSelector()).on('click', function(evt) {
                let isOpen = $(that.wrapSelector()).hasClass('vp-focus');
                if (isOpen) {
                    // hide task if it's already opened
                    // open task
                    $('#vp_wrapper').trigger({
                        type: 'close_option_page',
                        component: that.state.task
                    });
                } else {
                    // open task
                    $('#vp_wrapper').trigger({
                        type: 'open_option_page',
                        component: that.state.task
                    });
                }
            });

            // remove click event
            $(this.wrapSelector('.vp-menu-task-remove')).on('click', function(evt) {
                $('#vp_wrapper').trigger({
                    type: 'remove_option_page',
                    component: that.state.task
                });
            });
        }

        _getOptionInfo() {
            let task = this.state.task;
            let info = {};
            if (task && task.state && task.state.config) {
                let { id, name, desc, apps }= task.state.config;
                info = { 
                    id:     id,
                    title:  name, 
                    desc:   desc,
                    icon:   'apps/apps_white.svg'
                };

                if (apps) {
                    info.icon = apps.icon;
                }
            }
            return info;
        }

        template() {
            let { title, icon, desc } = this._getOptionInfo();
            let page = new com_String();
            page.appendFormatLine('<div class="{0} vp-no-selection" title="{1}">', 'vp-menu-task-item', desc);
            // page.appendFormatLine('<img class="vp-menu-task-icon" src="/nbextensions/visualpython/img/{0}">', icon);
            page.appendFormatLine('<span>{0}</span>', title);
            // LAB: img to url
            // page.appendFormatLine('<img class="vp-menu-task-remove" title="{0}" src="{1}">', 'Close task', com_Const.IMAGE_PATH + 'close_small.svg');
            page.appendFormatLine('<div class="vp-menu-task-remove vp-icon-close-small" title="{0}"></div>', 'Close task');
            page.appendLine('</div>');
            return page.toString();
        }

        render() {
            super.render();

            // emphasize it if its task is visible
            if (!this.state.task.isHidden()) {
                this.$target.find('.vp-menu-task-item').removeClass('vp-focus');
                $(this.wrapSelector()).addClass('vp-focus');
            }
        }

        focusItem() {
            this.$target.find('.vp-menu-task-item').removeClass('vp-focus');
            $(this.wrapSelector()).addClass('vp-focus');
        }

        blurItem() {
            // hide task if it's already opened
            $(this.wrapSelector()).removeClass('vp-focus');
        }

        removeItem() {
            $(this.wrapSelector()).remove();
        }
    }

    return TaskItem;

});

/* End of file */