/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : For.js
 *    Author          : Black Logic
 *    Note            : Logic > for
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] For
//============================================================================
define([
    __VP_CSS_LOADER__('vp_base/css/m_logic/for'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/VarSelector'
], function(forCss, com_String, com_util, PopupComponent, VarSelector) {

    /**
     * For
     */
    class For extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.saveOnly = true;
            this.config.sizeLevel = 1;

            this.state = {
                v1: 'idx', // index
                v2: 'item', // item
                v3: 'range', // Type : range/variable/typing
                v4: '', // Range - start
                v5: '', //       - stop
                v6: '', //       - step
                v7: '', // Variable
                v8: '', // Typing
                useEnumerate: true,
                ...this.state
            }
            
            this._addCodemirror('code', this.wrapSelector('#code'));
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;
            $(this.wrapSelector('#v3')).on('change', function() {
                let type = $(this).val();

                // show input
                if (type == 'range') {
                    $(that.wrapSelector('#v2')).hide();
                    $(that.wrapSelector('.vp-enumerate-box')).hide();
                } else {
                    $(that.wrapSelector('#v2')).show();
                    $(that.wrapSelector('.vp-enumerate-box')).show();
                }
                // show sub box
                $('.vp-for-sub-box').hide();
                $('.vp-sub-'+type).show();
            });

            $(this.wrapSelector('#v7')).on('var_changed', function(evt) {
                let value = evt.value;
                that.state.v7 = value;
            });

            $(this.wrapSelector('#useEnumerate')).on('change', function() {
                let checked = $(this).prop('checked');
                that.state.useEnumerate = checked;
                if (checked) {
                    $(that.wrapSelector('#v1')).show();
                } else {
                    $(that.wrapSelector('#v1')).hide();
                }
            });
        }

        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            page.appendLine('<div class="vp-flex-column-center">');
            page.appendLine('<div class="vp-flex-row-between">');
            page.appendLine('<div class="vp-orange-text vp-bold vp-flex-column-center wp5">For</div>');
            page.appendLine('<div class="vp-flex-row-between wp80">');
            let showIndex = true;
            if (this.state.v3 != 'range' && this.state.useEnumerate == false) {
                showIndex = false;
            }
            page.appendFormatLine('<input type="text" id="v1" class="vp-input vp-state wp100" value="{0}" placeholder="{1}" {2}>'
                                , this.state.v1, 'Index', showIndex?'':'style="display:none;"');
            page.appendFormatLine('<input type="text" id="v2" class="vp-input vp-state wp100" value="{0}" placeholder="{1}" {2}>'
                                , this.state.v2, 'Item', this.state.v3 == 'range'?'style="display:none;"':'');
            page.appendLine('</div>');
            page.appendLine('</div>');
            page.appendLine('<div class="vp-flex-row-between mb5">');
            page.appendLine('<div class="vp-orange-text vp-bold vp-flex-column-center wp5">In</div>');
            page.appendLine('<div class="vp-flex-row-between wp80">');
            page.appendLine('<select class="vp-select vp-state wp100" id="v3">');
            let types = ['Range', 'Variable', 'Typing'];
            types.forEach(type => {
                let val = type.toLowerCase();
                page.appendFormatLine('<option value="{0}" {1}>{2}</option>', val, val==this.state.v3?'selected':'', type);
            });
            page.appendLine('</select>');
            page.appendLine('</div>');
            page.appendLine('</div>');
            page.appendLine(this.templateForRangeBox());
            page.appendLine(this.templateForVariableBox());
            page.appendLine(this.templateForTypingBox());
            page.appendFormatLine('<div class="vp-enumerate-box vp-flex-row-between mb5" {0}>', this.state.v3 == 'range'?'style="display:none;"':'');
            page.appendFormatLine(`<div class="vp-flex-column-center wp5"></div>
            <div class="vp-flex-row-right wp80"><input type="checkbox" id="useEnumerate" {0}/><label for="useEnumerate">Enumerate</label></div>
            </div>`, this.state.useEnumerate?'checked':'');
            page.appendLine('</div>');
            return page.toString();
        }

        templateForRangeBox() {
            return `<div class="vp-for-sub-box vp-sub-range" ${this.state.v3=='range'?'':'style="display:none;"'}>
                <div class="vp-flex-row-between mb5">
                    <div class="vp-flex-column-center wp5"></div>
                    <div class="vp-for-sub-header vp-flex-row-between wp80">
                        <div class="vp-flex-column-center wp100 vp-orange-text">Start</div>
                        <div class="vp-flex-column-center wp100">Stop</div>
                        <div class="vp-flex-column-center wp100">Step</div>
                    </div>
                </div>
                <div class="vp-for-sub-body vp-flex-row-between mb5">
                    <div class="vp-flex-column-center wp5"></div>
                    <div class="vp-flex-row-between wp80">
                        <input type="text" id="v4" class="vp-input wp100 vp-state" value="${this.state.v4}" placeholder="Value">
                        <input type="text" id="v5" class="vp-input wp100 vp-state" value="${this.state.v5}" placeholder="Value">
                        <input type="text" id="v6" class="vp-input wp100 vp-state" value="${this.state.v6}" placeholder="Value">
                    </div>
                </div>
            </div>`;
        }

        templateForVariableBox() {
            var dataTypes = ['DataFrame', 'Series', 'nparray', 'list', 'str'];
            var varSelector = new VarSelector(dataTypes, 'DataFrame', true, true);
            varSelector.setComponentId('v7');
            varSelector.addBoxClass('vp-flex-row-between wp100');
            varSelector.addTypeClass('wp50');
            varSelector.addVarClass('vp-state wp50');
            varSelector.setValue(this.state.v7);
            
            return `<div class="vp-for-sub-box vp-sub-variable" ${this.state.v3=='variable'?'':'style="display:none;"'}>
                <div class="vp-for-sub-header vp-flex-row-between mb5">
                    <div class="vp-flex-column-center wp5"></div>
                    <div class="vp-flex-row-between wp80">
                        <div class="vp-orange-text vp-flex-column-center wp50">Data Type</div>
                        <div class="vp-orange-text vp-flex-column-center wp50">Data</div>
                    </div>
                </div>
                <div class="vp-for-sub-body vp-flex-row-between mb5">
                    <div class="vp-flex-column-center wp5"></div>
                    <div class="vp-flex-row-between wp80">
                        ${varSelector.render()}
                    </div>
                </div>
            </div>`;
        }

        templateForTypingBox() {
            return `<div class="vp-for-sub-box vp-sub-typing" ${this.state.v3=='typing'?'':'style="display:none;"'}>
                <div class="vp-flex-row-between mb5">
                    <div class="vp-flex-column-center wp5"></div>
                    <div class="vp-flex-row-between wp80">
                        <input type="text" id="v8" class="vp-input vp-state wp100" value="${this.state.v8}" placeholder="User Input">
                    </div>
                </div>
            </div>`;
        }

        generateCode() {
            let { v1, v2, v3, v4 ,v5, v6, v7, v8, useEnumerate } = this.state;
            let front = v2;
            let back = '';
            if (v3 == 'range') {
                front = v1;
                back = `range(${v4}${v5!=''?', '+v5:''}${v6!=''?', '+v6:''})`
            } else if (v3 == 'variable') {
                if (useEnumerate) {
                    let optionList = [];
                    if (v1 != '') {
                        optionList.push(v1);
                    }
                    if (v2 != '') {
                        optionList.push(v2);
                    }
                    front = optionList.join(', ');
                }
                back = `${useEnumerate?'enumerate':''}(${v7})`;
            } else {
                if (useEnumerate) {
                    let optionList = [];
                    if (v1 != '') {
                        optionList.push(v1);
                    }
                    if (v2 != '') {
                        optionList.push(v2);
                    }
                    front = optionList.join(', ');
                }
                back = `${useEnumerate?'enumerate':''}(${v8})`;
            }

            return com_util.formatString('for {0} in {1}:', front, back);
        }

    }

    return For;
});