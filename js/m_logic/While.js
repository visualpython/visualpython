/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : While.js
 *    Author          : Black Logic
 *    Note            : Logic > while
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] While
//============================================================================
define([
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput'
], function(com_Const, com_String, com_util, PopupComponent, SuggestInput) {

    /**
     * While
     */
    class While extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.sizeLevel = 1;
            this.config.saveOnly = true;

            this.state = {
                v1: [{ type: 'condition', value: {} }],
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;
            // Add param
            $(this.wrapSelector('#vp_addCondition')).on('click', function() {
                that.state.v1.push({ type: 'condition', value: {} });
                $(that.wrapSelector('.v1 tbody')).append(that.templateForList(that.state.v1.length, {}));

                // enable and disable last one
                // enable all operator
                $(that.wrapSelector('.v1 .v1-i4')).prop('disabled', false);
                // disable last operator
                $(that.wrapSelector('.v1 tr:last .v1-i4')).prop('disabled', true);
            });
            $(this.wrapSelector('#vp_addUserInput')).on('click', function() {
                that.state.v1.push({ type: 'input', value: {} });
                $(that.wrapSelector('.v1 tbody')).append(that.templateForInput(that.state.v1.length, {}));

                // enable and disable last one
                // enable all operator
                $(that.wrapSelector('.v1 .v1-i4')).prop('disabled', false);
                // disable last operator
                $(that.wrapSelector('.v1 tr:last .v1-i4')).prop('disabled', true);
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

                // disable last operator
                $(that.wrapSelector('.v1 tr:last .v1-i4')).prop('disabled', true);
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
                let type = $(tag).data('type');
                let v1_ele = {};
                if (type == 'condition') {
                    v1_ele['i1'] = $(tag).find('.v1-i1').val();
                    v1_ele['i2'] = $(tag).find('.v1-i2').val();
                    v1_ele['i3'] = $(tag).find('.v1-i3').val();
                    v1_ele['i4'] = $(tag).find('.v1-i4').val();
                } else {
                    v1_ele['i1'] = $(tag).find('.v1-i1').val();
                    v1_ele['i4'] = $(tag).find('.v1-i4').val();
                }
                v1.push({ type: type, value: v1_ele });
            });
            this.state.v1 = v1;
        }

        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            page.appendLine('<table class="v1 wp100 vp-tbl-gap5" style="margin: 10px 0">');
            // page.appendLine('<thead><tr><td></td><td>Parameter</td><td></td><td>Default Value</td></tr></thead>');
            page.appendLine('<colgroup><col width="20px"><col width="100px"><col width="70px"><col width="100px"><col width="100px"><col width="30px"></colgroup>');
            page.appendLine('<tbody class="v1-table">');
            let that = this;
            this.state.v1.forEach((v, idx) => {
                if (v.type == 'condition') {
                    page.appendLine(that.templateForList(idx + 1, v.value));
                } else {
                    page.appendLine(that.templateForInput(idx + 1, v.value));
                }
            });
            page.appendLine('</tbody></table>');
            page.appendFormatLine('<button class="vp-button w100" id="{0}">+ Condition</button>', 'vp_addCondition');
            page.appendFormatLine('<button class="vp-button w100" id="{0}">+ User Input</button>', 'vp_addUserInput');
            return page.toString();
        }

        templateForList(idx, v) {
            v = {
                i1: '', i2: '', i3: '', i4: '',
                ...v
            }
            var page = new com_String();
            page.appendFormatLine('<tr class="{0}" data-type="{1}">', 'v1-tr', 'condition');
            page.appendFormatLine('<th>{0}</th>', idx);
            page.appendFormatLine('<td><input type="text" class="vp-input w100 {0}" value="{1}" placeholder="{2}"/></td>'
                                , 'v1-i1', v.i1, 'Variable');
            // suggestInput for operator
            let operList = ['', '==', '!=', 'in', 'not in', '<', '<=', '>', '>='];
            var suggestInput = new SuggestInput();
            suggestInput.addClass('vp-input w70 v1-i2');
            suggestInput.setSuggestList(function() { return operList; });
            suggestInput.setPlaceholder('Operator');
            suggestInput.setNormalFilter(false);
            suggestInput.setValue(v.i2);
            suggestInput.setSelectEvent(function(selectedValue) {
                // trigger change
                $(this.wrapSelector()).val(selectedValue);
                $(this.wrapSelector()).trigger('change');
            });
            page.appendFormatLine('<td>{0}</td>', suggestInput.toTagString());
            page.appendFormatLine('<td><input type="text" class="vp-input w100 {0}" value="{1}" placeholder="{2}"/></td>'
                                , 'v1-i3', v.i3, 'Variable');
            page.appendFormatLine('<td><select class="vp-select w100 {0}">', 'v1-i4');
            let operator2 = ['and', 'or'];
            operator2.forEach(op => {
                page.appendFormatLine('<option value="{0}" {1}>{2}</option>', op, op == v.i4? 'selected': '', op);
            })
            page.appendLine('</select></td>');
            // LAB: img to url
            // page.appendFormatLine('<td class="{0} vp-cursor"><img src="{1}close_big.svg"/></td>', 'v1-del', com_Const.IMAGE_PATH);
            page.appendFormatLine('<td class="{0} vp-cursor"><div class="vp-icon-close-big"></div></td>', 'v1-del');
            page.appendLine('</tr>');
            return page.toString();
        }
        templateForInput(idx, v) {
            v = {
                i1: '', i4: '',
                ...v
            }
            var page = new com_String();
            page.appendFormatLine('<tr class="{0}" data-type="{1}">', 'v1-tr', 'input');
            page.appendFormatLine('<th>{0}</th>', idx);
            page.appendFormatLine('<td colspan="3"><input type="text" class="vp-input wp100 {0}" value="{1}" placeholder="{2}"/></td>'
                                , 'v1-i1', v.i1, 'Variable');
            page.appendFormatLine('<td><select class="vp-select w100 {0}">', 'v1-i4');
            let operator2 = ['and', 'or'];
            operator2.forEach(op => {
                page.appendFormatLine('<option value="{0}" {1}>{2}</option>', op, op == v.i4? 'selected': '', op);
            })
            page.appendLine('</select></td>');
            // LAB: img to url
            // page.appendFormatLine('<td class="{0} vp-cursor"><img src="{1}close_big.svg"/></td>', 'v1-del', com_Const.IMAGE_PATH);
            page.appendFormatLine('<td class="{0} vp-cursor"><div class="vp-icon-close-big"></div></td>', 'v1-del');
            page.appendLine('</tr>');
            return page.toString();
        }

        render() {
            super.render();

            // disable last operator
            $(this.wrapSelector('.v1 tr:last .v1-i4')).prop('disabled', true);
        }

        generateCode() {
            this.saveState();

            let parameters = [];
            let length = this.state.v1.length;
            this.state.v1.forEach((v, idx) => {
                let value = v.value;
                let line = '';
                if (v.type == 'condition') {
                    line = value.i1 + value.i2 + value.i3;
                } else {
                    line = value.i1;
                }
                if (length > 1) {
                    line = '(' + line + ')';
                }
                if (idx + 1 < length) {
                    line += value.i4;
                }
                parameters.push(line);
            });
            return com_util.formatString('while ({0}):', parameters.join(''));
        }

    }

    return While;
});