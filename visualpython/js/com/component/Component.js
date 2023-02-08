/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Component.js
 *    Author          : Black Logic
 *    Note            : Base Components for rendering objects
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Component
//============================================================================
define([
    '../com_util',
    '../com_String'
], function(com_util, com_String) {
    'use strict';

    //========================================================================
    // Declare class
    //========================================================================
    /**
     * Component
     */
    class Component {
        constructor($target, state, prop={}) {
            // get uuid
            this._uuid = com_util.getUUID();
            // target, pageDom query objects
            this.$target = $target;
            this.$pageDom = '';
            // save state
            this.state = state;
            // save propagation from parent
            this.prop = prop;

            this._init();
            this.load();
            this.render();
        }

        wrapSelector(selector='') {
            var sbSelector = new com_String();
            var cnt = arguments.length;
            if (cnt < 2) {
                // if there's no more arguments
                sbSelector.appendFormat(".{0} {1}", this.uuid, selector);
            } else {
                // if there's more arguments
                sbSelector.appendFormat(".{0}", this.uuid);
                for (var idx = 0; idx < cnt; idx++) {
                    sbSelector.appendFormat(" {0}", arguments[idx]);
                }
            }
            return sbSelector.toString();
        }

        _init() {
            /** Implementation needed */
        }

        _unbindEvent() {
            /** Implementation needed */
        }

        _bindEvent() {
            /** Implementation needed */
        }

        /**
         * Load data
         */
        load() {
            /** Implementation needed */
        }

        /**
         * Generate template using states and return
         * @returns template DOM
         */
        template() { 
            /** Implementation needed */
            return '';
        }

        /**
         * Render component under $target
         * @param {*} inplace overwrite under $target
         */
        render(inplace=false) {
            this.$pageDom = $(this.template());
            this.$pageDom.addClass(this.uuid);

            let $page = this.$target.find('.' + this.uuid);
            if ($page.length > 0) {
                // if exists, replace it
                $page.replaceWith(this.$pageDom);
            } else {
                // if not exists...
                if (inplace) {
                    // replace under $target
                    this.$target.html(this.$pageDom);
                } else {
                    // append under $target
                    this.$target.append(this.$pageDom);
                }
            }

            this._bindEvent();
        }

        equals(component) {
            if (!component) {
                return false;
            }
            return component.uuid === this.uuid;
        }

        get uuid() {
            return this._uuid;
        }

        getTag() {
            return $(this.wrapSelector());
        }

        setState(stateObj) {
            this.state = {
                ...this.state,
                ...stateObj
            }
        }

        getState(stateKey=undefined) {
            if (stateKey == undefined) {
                return this.state;
            }
            return this.state[stateKey];
        }
    }

    return Component;

});

/* End of file */