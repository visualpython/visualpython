/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Return.js
 *    Author          : Black Logic
 *    Note            : Logic > Return
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Return
//============================================================================
define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput'
], function(com_String, com_util, PopupComponent, SuggestInput) {

    /**
     * Return
     */
    class Return extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.saveOnly = true;

            this.state = {
                v1: [],
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;
            // Add param
            $(this.wrapSelector('#vp_addParam')).on('click', function() {
                that.state.v1.push('');
                $(that.wrapSelector('.v1 tbody')).append(that.templateForInput(that.state.v1.length, ''));
            });

            // Delete param
            $(document).on('click', this.wrapSelector('.v1-del'), function() {
                let pos = $(this).closest('.v1-tr').index();
                
                $(that.wrapSelector('.v1-tr:nth('+pos+')')).remove();
                that.state.v1.splice(pos, 1);

                // re-numbering
                $(that.wrapSelector('.v1-tr')).each((idx, tag) => {
                    $(tag).find('th').text(idx + 1);
                });
            });
        }

        _unbindEvent() {
            super._unbindEvent();
            $(document).off('click', this.wrapSelector('.v1-del'));
        }

        saveState() {
            let that = this;
            let v1 = [];
            $(this.wrapSelector('.v1-tr')).each((idx, tag) => {
                let value = $(tag).find('.v1-i1').val();
                v1.push(value);
            });
            this.state.v1 = v1;
        }

        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            page.appendLine('<table class="v1 wp100" style="margin: 10px 0">');
            // page.appendLine('<thead><tr><td></td><td>Parameter</td><td></td><td>Default Value</td></tr></thead>');
            page.appendLine('<tbody><colgroup><col width="20px"><col width="*"><col width="30px"></colgroup>');
            this.state.v1.forEach((v, idx) => {
                this.templateForInput(idx + 1, v);
            });
            page.appendLine('</tbody></table>');
            page.appendFormatLine('<button class="vp-button w100" id="{0}">+ Parameter</button>', 'vp_addParam');
            return page.toString();
        }
        templateForInput(idx, value) {
            var page = new com_String();
            page.appendFormatLine('<tr class="{0}">', 'v1-tr');
            page.appendFormatLine('<th>{0}</th>', idx);
            page.appendFormatLine('<td><input type="text" class="vp-input wp100 {0}" value="{1}" placeholder="{2}"/></td>'
                                , 'v1-i1', value, 'Input parameter');
            // LAB: img to url
            // page.appendFormatLine('<td class="{0} vp-cursor"><img src="{1}close_big.svg"/></td>', 'v1-del', );
            page.appendFormatLine('<td class="{0} vp-cursor"><div class="vp-icon-close-big"></div></td>', 'v1-del');
            page.appendLine('</tr>');
            return page.toString();
        }

        generateCode() {
            this.saveState();
            let params = this.state.v1.filter(v => v != '');

            return com_util.formatString('return {0}', params.join(', '));
        }

    }

    return Return;
});