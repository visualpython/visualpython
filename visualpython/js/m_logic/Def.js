/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Def.js
 *    Author          : Black Logic
 *    Note            : Logic > def
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Def
//============================================================================
define([
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent'
], function(com_Const, com_String, com_util, PopupComponent) {

    /**
     * Def
     */
    class Def extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.saveOnly = true;

            this.state = {
                v1: '',
                v2: [],
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;
            $(this.wrapSelector('#vp_addParam')).on('click', function() {
                that.state.v2.push({ param: '', value: ''});
                $(that.wrapSelector('.v2 tbody')).append(that.templateForList(that.state.v2.length, '', ''));
            });

            // Delete param
            $(document).on('click', this.wrapSelector('.v2-del'), function() {
                let pos = $(this).closest('.v2-tr').index();
                
                $(that.wrapSelector('.v2-tr:nth('+pos+')')).remove();
                that.state.v2.splice(pos, 1);

                // re-numbering
                $(that.wrapSelector('.v2-tr')).each((idx, tag) => {
                    $(tag).find('th').text(idx + 1);
                });
            });
        }

        _unbindEvent() {
            super._unbindEvent();
            $(document).off('click', this.wrapSelector('.v2-del'));
        }

        saveState() {
            let that = this;
            let v2 = [];
            $(this.wrapSelector('.v2-tr')).each((idx, tag) => {
                let v2_ele = {};
                v2_ele['param'] = $(tag).find('.v2-param').val();
                v2_ele['value'] = $(tag).find('.v2-value').val();
                v2.push(v2_ele);
            });
            this.state.v2 = v2;
        }

        loadState() {
            let { v1, v2 } = this.state;
        }

        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            page.appendLine('<div class="vp-orange-text vp-bold">Function Name</div>');
            page.appendFormatLine('<input type="text" id="v1" class="vp-input wp100 vp-state" value="{0}" placeholder="{1}">'
                                , this.state.v1, 'Input code line');
            page.appendLine('<table class="v2 wp100 vp-tbl-gap5" style="margin: 10px 0">');
            page.appendLine('<thead><tr><td></td><td>Parameter</td><td></td><td>Default Value</td><td></td></tr></thead>');
            page.appendLine('<tbody><colgroup><col width="20px"><col width="100px"><col width="30px"><col width="100px"><col width="*"></colgroup>');
            let that = this;
            this.state.v2.forEach((v, idx) => {
                page.appendLine(that.templateForList(idx + 1, v.param, v.value));
            });
            page.appendLine('</tbody></table>');
            page.appendFormatLine('<button class="vp-button w100" id="{0}">+ Parameter</button>', 'vp_addParam');
            return page.toString();
        }

        templateForList(idx, param, value) {
            if (!value) {
                value = '';
            }
            var page = new com_String();
            page.appendFormatLine('<tr class="{0}">', 'v2-tr');
            page.appendFormatLine('<th>{0}</th>', idx);
            page.appendFormatLine('<td><input type="text" class="vp-input w100 {0}" value="{1}" placeholder="{2}"/></td>'
                                , 'v2-param', param, 'Variable');
            page.appendLine('<td class="w30 vp-center">=</td>');
            page.appendFormatLine('<td><input type="text" class="vp-input w100 {0}" value="{1}" placeholder="{2}"/></td>'
                                , 'v2-value', value, 'Value');
            // LAB: img to url
            // page.appendFormatLine('<td class="{0} vp-cursor"><img src="{1}close_big.svg"/></td>', 'v2-del', com_Const.IMAGE_PATH);
            page.appendFormatLine('<td class="{0} vp-cursor"><div class="vp-icon-close-big"></div></td>', 'v2-del');
            page.appendLine('</tr>');
            return page.toString();
        }

        generateCode() {
            this.saveState();

            let parameters = [];
            this.state.v2.forEach(v => {
                let param = v.param;
                if (v.value != '') {
                    param += '=' + v.value;
                }
                if (param == '') {
                    return;
                }
                parameters.push(param);
            });
            return com_util.formatString('def {0}({1}):', this.state.v1, parameters.join(', '));
        }

    }

    return Def;
});