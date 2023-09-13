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
    __VP_TEXT_LOADER__('vp_base/html/m_apps/instance.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_apps/instance'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/InstanceEditor',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/m_apps/Subset'
], function(insHtml, insCss, com_String, com_util, PopupComponent, InstanceEditor, DataSelector, Subset) {

    const MAX_STACK_SIZE = 20;

    /**
     * Instance
     */
    class Instance extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.sizeLevel = 5;
            this.config.checkModules = ['pd'];

            this.state = {
                target: '',
                vp_instanceVariable: '',
                variable: {
                    stack: []
                },
                selectedBox: 'variable',
                allocate: '',
                ...this.state
            }
            this.pointer = this.state.variable;
            this.subsetEditor = null;
            this.insEditor = null;

            this._addCodemirror('vp_instanceVariable', this.wrapSelector('#vp_instanceVariable'), 'readonly');
        }

        _bindEvent() {
            super._bindEvent();
            let that = this;
            // target change
            $(this.wrapSelector('#vp_instanceTarget')).on('change', function(event) {
                let value = $(this).val();
                that.updateValue(value);
                that.reloadInsEditor();
            });
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
                that.reloadInsEditor();
            });

            // instance_editor_replaced - variable
            $(document).on('instance_editor_replaced', this.wrapSelector('#vp_instanceVariable'), function(event) {
                that.addStack();

                var newCode = event.newCode;
                that.updateValue(newCode);
                that.reloadInsEditor();
            });

            // co-op with Subset
            // $(this.wrapSelector('#vp_instanceVariable')).on('remove_option_page', function(evt) {
            //     let component = evt.component;
            //     component.close();
            // });
            // $(this.wrapSelector('#vp_instanceVariable')).on('close_option_page', function(evt) {
            //     let component = evt.component;
            //     component.close();
            // });
            // $(this.wrapSelector('#vp_instanceVariable')).on('focus_option_page', function(evt) {
            //     let component = evt.component;
            //     component.focus();
            // });
            // $(this.wrapSelector('#vp_instanceVariable')).on('apply_option_page', function(evt) {
            //     let component = evt.component;
            //     // apply its value
            //     let code = component.generateCode();
            //     component.close();
            //     that.addStack();
            //     that.state.subsetEditor.state.pandasObject = code;
            //     that.updateValue(code);
            // });
        }

        templateForBody() {
            let that = this;
            let page = $(insHtml);
            $(page).find('#vp_instanceVariable').val(this.state.vp_instanceVariable);

            let targetSelector = new DataSelector({
                pageThis: this, id: 'vp_instanceTarget', placeholder: 'Select variable',
                allowDataType: [
                    'module', 'DataFrame', 'Series', 'dict', 'list', 'int'
                ],
                allowModule: true,
                finish: function(value, dtype) {
                    $(that.wrapSelector('#vp_instanceTarget')).trigger({type: 'change', value: value});
                    that.updateValue(value);
                    that.reloadInsEditor();
                },
                select: function(value, dtype) {
                    $(that.wrapSelector('#vp_instanceTarget')).trigger({type: 'change', value: value});
                    that.updateValue(value);
                    that.reloadInsEditor();
                }
            });
            $(page).find('#vp_instanceTarget').replaceWith(targetSelector.toTagString());

            // Removed dataselector for Allocation input
            // let allocateSelector = new DataSelector({
            //     pageThis: this, id: 'vp_instanceAllocate', placeholder: 'Variable name'
            // });
            // $(page).find('#vp_instanceAllocate').replaceWith(allocateSelector.toTagString());

            return page;
        }

        render() {
            super.render();

            let that = this;

            // vpSubsetEditor
            this.subsetEditor = new Subset({ pandasObject: '', config: { name: 'Subset', category: this.name } }, 
                { 
                    useInputVariable: true,
                    targetSelector: this.wrapSelector('#vp_instanceVariable'),
                    pageThis: this,
                    finish: function(code) {
                        that.addStack();
                        that.subsetEditor.state.pandasObject = code;
                        that.updateValue(code);
                    }
                });
            this.subsetEditor.disableButton();

            this.ALLOW_SUBSET_TYPES = this.subsetEditor.getAllowSubsetTypes();

            // vpInstanceEditor
            this.insEditor = new InstanceEditor(this, "vp_instanceVariable", 'vp_variableInsEditContainer', { targetType: 'outside' });

            this.insEditor.show();

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
                sbCode.appendFormatLine('{0} = {1}', leftCode, rightCode);
                sbCode.append(leftCode); // show allocation (from version 2.4.10)
            } else {
                sbCode.appendFormat('{0}', rightCode);
            }

            return sbCode.toString();
        }

        hide() {
            super.hide();
            this.subsetEditor && this.subsetEditor.hide();
        }

        close() {
            super.close();
            this.subsetEditor && this.subsetEditor.close();
        }

        remove() {
            super.remove();
            this.subsetEditor && this.subsetEditor.remove();
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
            this.state.vp_instanceVariable = value;

            // show preview
            this.loadPreview(value);
        }

        loadPreview(code) {
            let that = this;
            if (!code || code === '') {
                $(that.wrapSelector('#instancePreview')).html('');
                return;
            }
            // show variable information on clicking variable
            vpKernel.execute(code).then(function(resultObj) {
                let { result, type, msg } = resultObj;
                if (msg.content.data) {
                    var textResult = msg.content.data["text/plain"];
                    var htmlResult = msg.content.data["text/html"];
                    var imgResult = msg.content.data["image/png"];
                    
                    $(that.wrapSelector('#instancePreview')).html('');
                    if (htmlResult != undefined) {
                        // 1. HTML tag
                        $(that.wrapSelector('#instancePreview')).append(htmlResult);
                    } else if (imgResult != undefined) {
                        // 2. Image data (base64)
                        var imgTag = '<img src="data:image/png;base64, ' + imgResult + '">';
                        $(that.wrapSelector('#instancePreview')).append(imgTag);
                    } else if (textResult != undefined) {
                        // 3. Text data
                        var preTag = document.createElement('pre');
                        $(preTag).text(textResult);
                        $(that.wrapSelector('#instancePreview')).html(preTag);
                    }
                } else {
                    var errorContent = '';
                    if (msg.content && msg.content.ename) {
                        errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue, msg.content.detail);
                    }
                    $(that.wrapSelector('#instancePreview')).html(errorContent);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content?.ename, msg.content?.evalue, msg.content);
                }
            }).catch(function(resultObj) {
                let { msg, ename, evalue, status } = resultObj;
                var errorContent = '';
                if (msg && msg.content && msg.content.ename) {
                    // NOTEBOOK: notebook error FIXME: migrate it on com_Kernel.execute
                    errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue, msg.content.detail);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content?.ename, msg.content?.evalue, msg.content);
                } else {
                    // LAB: lab error FIXME: migrate it on com_Kernel.execute
                    errorContent = com_util.templateForErrorBox(ename, evalue, '');
                    vpLog.display(VP_LOG_TYPE.ERROR, ename, evalue);
                }
                $(that.wrapSelector('#instancePreview')).html(errorContent);
            });
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

        reloadInsEditor() {
            var that = this;
            var tempPointer = this.pointer;
            this.subsetEditor.disableButton();
            var callbackFunction = function (varObj) {
                var varType = varObj.type;
    
                if (that.ALLOW_SUBSET_TYPES.includes(varType)) {
                    that.subsetEditor.state.dataType = varType;
                    let cmObj = that.getCodemirror('vp_instanceVariable');
                    let nowCode = (cmObj && cmObj.cm)?cmObj.cm.getValue():'';
                    that.subsetEditor.state.pandasObject = nowCode;
                    that.subsetEditor.enableButton();
                }
            };
    
            this.insEditor.reload(callbackFunction);
        }
    }

    return Instance;
});