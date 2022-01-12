/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Instance.js
 *    Author          : Black Logic
 *    Note            : Apps > Instance
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Instance
//============================================================================
define([
    'text!vp_base/html/m_apps/instance.html!strip',
    'css!vp_base/css/m_apps/instance.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/InstanceEditor',
    'vp_base/js/m_apps/Subset'
], function(insHtml, insCss, com_String, PopupComponent, InstanceEditor, Subset) {

    const MAX_STACK_SIZE = 20;

    /**
     * Instance
     */
    class Instance extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.sizeLevel = 1;

            this.state = {
                subsetEditor: undefined,
                variable: {
                    stack: []
                },
                selectedBox: 'variable',
                allocate: '',
                ...this.state
            }
            this.pointer = this.state.variable;

            this._addCodemirror('vp_instanceVariable', this.wrapSelector('#vp_instanceVariable'), 'readonly');
        }

        _bindEvent() {
            super._bindEvent();
            let that = this;
            // clear
            $(this.wrapSelector('#vp_instanceClear')).on('click', function(event) {
                that.addStack();
                that.updateValue('');
                that.reloadInsEditor();
            });

            // undo
            $(this.wrapSelector('#vp_instanceUndo')).on('click', function(event) {
                that.popStack();
                that.reloadInsEditor();
            });

            // backspace
            $(document).on('keyup', this.wrapSelector('.CodeMirror'), function(event) {
                var keycode =  event.keyCode 
                            ? event.keyCode 
                            : event.which;
                if (keycode == 8) {
                    // backspace
                    that.popStack();
                    that.reloadInsEditor();
                }
            });

            // subset button clicked
            $(document).on('click', this.wrapSelector('.vp-ds-button'), function(event) {
                var insEditorType = $(this).closest('.vp-instance-box').hasClass('variable')? 'variable': 'allocate';
                $(that.wrapSelector('.CodeMirror')).removeClass('selected');
                if (insEditorType == 'variable') {
                    // variable
                    that.pointer = that.state.variable;
                    $(that.wrapSelector('.variable .CodeMirror')).addClass('selected');
                } else if (insEditorType == 'allocate'){
                    // allocate
                    that.pointer = that.state.allocate;
                    $(that.wrapSelector('.allocate .CodeMirror')).addClass('selected');
                } else {
                    // that.state.variable.insEditor.hide();
                    // that.state.allocate.insEditor.hide();
                }
            });

            // subset applied - variable
            $(document).on('change apps_run', this.wrapSelector('#vp_instanceVariable'), function(event) {
                var val = $(this).val();
                that.addStack();
                that.updateValue(val);
            });

            // codemirror clicked
            $(document).on('click', this.wrapSelector('.CodeMirror'), function(event) {
                $(that.wrapSelector('.CodeMirror')).removeClass('selected');
                $(this).addClass('selected');

                // show/hide insEditor
                var insEditorType = $(this).closest('.vp-instance-box').hasClass('variable')? 'variable': 'allocate';

                if (insEditorType == 'variable') {
                    // variable
                    that.state.selectedBox = 'variable';
                    that.pointer = that.state.variable;
                } else if (insEditorType == 'allocate'){
                    // allocate
                    that.state.selectedBox = 'allocate';
                    that.pointer = that.state.allocate;
                } else {
                    that.state.selectedBox = '';
                }
            });

            $(document).on('focus', this.wrapSelector('.CodeMirror'), function(event) {
                $(this).trigger('click');
            });
            
            // instance_editor_selected - variable
            $(document).on('instance_editor_selected', this.wrapSelector('#vp_instanceVariable'), function(event) {
                that.addStack();
                let cmObj = that.getCodemirror('vp_instanceVariable');
                var nowCode = (cmObj && cmObj.cm)?cmObj.cm.getValue():'';
                if (nowCode != '') {
                    nowCode += '.'
                }
                var selectedVariable = event.varName;
                let fullCode = nowCode + selectedVariable;
                that.updateValue(fullCode);
                that.reloadInsEditor('variable');
            });

            // instance_editor_replaced - variable
            $(document).on('instance_editor_replaced', this.wrapSelector('#vp_instanceVariable'), function(event) {
                that.addStack();

                var newCode = event.newCode;
                that.updateValue(newCode);
                that.reloadInsEditor('variable');
            });

            // co-op with Subset
            $(this.wrapSelector('#vp_instanceVariable')).on('remove_option_page', function(evt) {
                let component = evt.component;
                component.close();
            });
            $(this.wrapSelector('#vp_instanceVariable')).on('close_option_page', function(evt) {
                let component = evt.component;
                component.close();
            });
            $(this.wrapSelector('#vp_instanceVariable')).on('apply_option_page', function(evt) {
                let component = evt.component;
                // apply its value
                let code = component.generateCode();
                component.close();
                that.addStack();
                that.state.subsetEditor.state.pandasObject = code;
                that.updateValue(code);
            });
        }

        templateForBody() {
            return insHtml;
        }

        render() {
            super.render();

            // vpSubsetEditor
            this.state.subsetEditor = new Subset({ pandasObject: '', config: { name: 'Subset' } }, 
                { 
                    useInputVariable: true,
                    targetSelector: this.wrapSelector('#vp_instanceVariable'),
                    pageThis: this
                });
            this.state.subsetEditor.disableButton();

            this.ALLOW_SUBSET_TYPES = this.state.subsetEditor.getAllowSubsetTypes();

            // vpInstanceEditor
            this.state.variable.insEditor = new InstanceEditor(this, "vp_instanceVariable", 'vp_variableInsEditContainer');

            this.state.variable.insEditor.show();

            // variable load
            this.reloadInsEditor();
        }

        loadState() {
            super.loadState();

            // load metadata
            let { vp_instanceVariable, allocate } = this.state;
            this.updateValue(vp_instanceVariable);
            $(this.wrapSelector('#vp_instanceAllocate')).val(allocate);
        }

        generateCode() {
            var sbCode = new com_String();

            var leftCode = $(this.wrapSelector('#vp_instanceAllocate')).val();
            let cmObj = this.getCodemirror('vp_instanceVariable');
            let rightCode = (cmObj && cmObj.cm)?cmObj.cm.getValue():'';
            if (leftCode && leftCode != '') {
                sbCode.appendFormat('{0} = {1}', leftCode, rightCode);
            } else {
                sbCode.appendFormat('{0}', rightCode);
            }

            return sbCode.toString();
        }

        updateValue(value) {
            let cmObj = this.getCodemirror('vp_instanceVariable');
            if (cmObj && cmObj.cm) {
                let cm = cmObj.cm;
                cm.setValue(value);
                cm.save();
                cm.focus();
                cm.setCursor({ line: 0, ch: value.length});
            }
        }

        addStack() {
            let cmObj = this.getCodemirror('vp_instanceVariable');
            var currentValue = (cmObj && cmObj.cm)?cmObj.cm.getValue():'';
            this.pointer.stack.push(currentValue);
    
            // if stack over MAX_STACK_SIZE
            if (this.pointer.stack.length > MAX_STACK_SIZE) {
                this.pointer.stack.splice(0, 1);
            }
            // console.log('add stack', currentValue, this.pointer.stack);
        }

        popStack(replace=true) {
            var lastValue = this.pointer.stack.pop();
            if (!lastValue) {
                lastValue = '';
            }
            if (replace) {
                this.updateValue(lastValue);
            }
            // console.log('pop stack', lastValue, this.pointer.stack);
            return lastValue;
        }

        reloadInsEditor(type='') {
            var that = this;
            var tempPointer = this.pointer;
            var callbackFunction = function (varObj) {
                var varType = varObj.type;
    
                if (that.ALLOW_SUBSET_TYPES.includes(varType)) {
                    that.state.subsetEditor.state.dataType = varType;
                    let cmObj = that.getCodemirror('vp_instanceVariable');
                    let nowCode = (cmObj && cmObj.cm)?cmObj.cm.getValue():'';
                    that.state.subsetEditor.state.pandasObject = nowCode;
                    that.state.subsetEditor.enableButton();
                } else {
                    that.state.subsetEditor.disableButton();
                }
            };
    
            if (type == '') {
                this.pointer.insEditor.reload(callbackFunction);
            } else {
                tempPointer = this.state[type];
                this.state[type].insEditor.reload(callbackFunction);
            }
        }
    }

    return Instance;
});