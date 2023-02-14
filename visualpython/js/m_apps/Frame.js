/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Frame.js
 *    Author          : Black Logic
 *    Note            : Apps > Frame
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Frame
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_apps/frame.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_apps/frame'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/VarSelector',
    'vp_base/js/m_apps/Subset'
], function(frameHtml, frameCss, com_Const, com_String, com_util, PopupComponent, SuggestInput, VarSelector, Subset) {

    /**
     * Frame
     */
    class Frame extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 3;
            this.config.checkModules = ['pd'];

            // state
            this.state = {
                originObj: '',
                tempObj: '_vp',
                returnObj: '_vp',
                inplace: false,
                columnList: [],
                indexList: [],
                selected: [],
                axis: FRAME_AXIS.NONE,
                lines: TABLE_LINES,
                steps: [],
                popup: {
                    type: FRAME_EDIT_TYPE.NONE,
                    replace: { index: 0 }
                },
                selection: {
                    start: -1,
                    end: -1
                },
                ...this.state
            }

            // numpy.dtype or python type
            this.astypeList = [ 
                'datetime64', 
                'int', 'int32', 'int64', 
                'float', 'float64', 
                'object', 'category', 
                'bool', 'str'
            ];

            // Add/Replace - subset
            this.subsetCm = null;
            this.subsetEditor = null;

            this.loading = false;

            this._addCodemirror('previewCode', this.wrapSelector('#vp_fePreviewCode'), 'readonly');
        }

        loadState() {
            super.loadState();
            var {
                originObj,
                returnObj,
                steps
            } = this.state;
    
            // $(this.wrapSelector('#vp_feVariable')).val(originObj);
    
            // $(this.wrapSelector('#vp_feReturn')).val(returnObj);
    
            // // execute all steps
            if (steps && steps.length > 0) {
                var code = steps.join('\n');
                this.state.steps = [];
                this.loadCode(code);
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;

            // select df
            $(document).on('change', this.wrapSelector('#vp_feVariable'), function() {
                // set temporary df
                var origin = $(this).val();

                if (origin) {
                    // initialize state values
                    that.state.originObj = origin;
                    that.state.tempObj = '_vp';
                    that.state.returnObj = that.state.tempObj;
                    if (that.state.inplace === true) {
                        that.state.returnObj = origin;
                    }
                    that.initState();

                    // reset return obj
                    $(that.wrapSelector('#vp_feReturn')).val(that.state.returnObj);
    
                    // reset table
                    $(that.wrapSelector('.' + VP_FE_TABLE)).replaceWith(function() {
                        return that.renderTable('');
                    });
    
                    // load code with temporary df
                    that.loadCode(that.getTypeCode(FRAME_EDIT_TYPE.INIT));
                    that.loadInfo();
                }
            });

            // refresh df
            $(document).on('click', this.wrapSelector('.vp-fe-df-refresh'), function() {
                that.loadVariableList();
            });

            $(document).on('click', this.wrapSelector('.' + VP_FE_INFO), function(evt) {
                evt.stopPropagation();
            });

            // input return variable
            $(document).on('change', this.wrapSelector('#vp_feReturn'), function() {
                var returnVariable = $(this).val();
                if (returnVariable == '') {
                    returnVariable = that.state.tempObj;
                }
                // check if it's same with origin obj
                if (returnVariable === that.state.originObj) {
                    $(that.wrapSelector('#inplace')).prop('checked', true);
                    that.state.inplace = true;
                } else {
                    $(that.wrapSelector('#inplace')).prop('checked', false);
                    that.state.inplace = false;
                }

                // show preview with new return variable
                that.state.returnObj = returnVariable;
                that.setPreview(that.getCurrentCode());
            });

            // check/uncheck inplace
            $(this.wrapSelector('#inplace')).on('change', function() {
                let checked = $(this).prop('checked');
                let returnVariable = '_vp';
                if (checked === true) {
                    returnVariable = that.state.originObj;
                }
                $(that.wrapSelector('#vp_feReturn')).val(returnVariable);

                // show preview with new return variable
                that.state.inplace = checked;
                that.state.returnObj = returnVariable;
                that.setPreview(that.getCurrentCode());
            });

            // menu on column
            $(document).on('contextmenu', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN), function(event) {
                event.preventDefault();
                var hasSelected = $(this).hasClass('selected');
                $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW)).removeClass('selected');
                // select col/idx
                if (!hasSelected) {
                    $(this).addClass('selected');
                    var newAxis = $(this).data('axis');
                    that.state.axis = newAxis;
                }

                that.loadInfo();

                // show menu
                var thisPos = $(this).position();
                var thisRect = $(this)[0].getBoundingClientRect();
                that.showMenu(thisPos.left, thisPos.top + thisRect.height);
            });

            // menu on row
            $(document).on('contextmenu', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW), function(event) {
                event.preventDefault();
                var hasSelected = $(this).hasClass('selected');
                $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN)).removeClass('selected');
                // select col/idx
                if (!hasSelected) {
                    $(this).addClass('selected');
                    var newAxis = $(this).data('axis');
                    that.state.axis = newAxis;
                }

                that.loadInfo();

                // show menu
                var thisPos = $(this).position();
                var thisRect = $(this)[0].getBoundingClientRect();
                var tblPos = $(that.wrapSelector('.' + VP_FE_TABLE)).position();
                var scrollTop = $(that.wrapSelector('.' + VP_FE_TABLE)).scrollTop();
                that.showMenu(tblPos.left + thisRect.width, tblPos.top + thisPos.top - scrollTop);
            });

            // select column
            $(document).on('click', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN), function(evt) {
                evt.stopPropagation();

                var idx = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN)).index(this); // 1 ~ n
                var hasSelected = $(this).hasClass('selected');

                $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW)).removeClass('selected');

                if (vpEvent.keyManager.keyCheck.ctrlKey) {
                    if (!hasSelected) {
                        that.state.selection = { start: idx, end: -1 };
                        $(this).addClass('selected');
                        var newAxis = $(this).data('axis');
                        that.state.axis = newAxis;
                    } else {
                        $(this).removeClass('selected');
                    }
                    
                } else if (vpEvent.keyManager.keyCheck.shiftKey) {
                    var axis = that.state.axis;
                    var startIdx = that.state.selection.start;
                    if (axis != FRAME_AXIS.COLUMN) {
                        startIdx = -1;
                    }
                    
                    if (startIdx == -1) {
                        // no selection
                        that.state.selection = { start: idx, end: -1 };
                    } else if (startIdx > idx) {
                        // add selection from idx to startIdx
                        var tags = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN));
                        for (var i = idx; i <= startIdx; i++) {
                            $(tags[i]).addClass('selected');
                        }
                        that.state.selection = { start: startIdx, end: idx };
                    } else if (startIdx <= idx) {
                        // add selection from startIdx to idx
                        var tags = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN));
                        for (var i = startIdx; i <= idx; i++) {
                            $(tags[i]).addClass('selected');
                        }
                        that.state.selection = { start: startIdx, end: idx };
                    }
                } else {
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN)).removeClass('selected');
                    if (!hasSelected) {
                        $(this).addClass('selected');
                        that.state.selection = { start: idx, end: -1 };
                        var newAxis = $(this).data('axis');
                        that.state.axis = newAxis;
                    } else {
                        $(this).removeClass('selected');
                    }
                }
                that.loadInfo();
            });

            // select row
            $(document).on('click', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW), function(evt) {
                evt.stopPropagation();

                var idx = $(that.wrapSelector('.' + VP_FE_TABLE_ROW)).index(this); // 0 ~ n
                var hasSelected = $(this).hasClass('selected');

                $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN)).removeClass('selected');
                
                if (vpEvent.keyManager.keyCheck.ctrlKey) {
                    if (!hasSelected) {
                        that.state.selection = { start: idx, end: -1 };
                        $(this).addClass('selected');
                        var newAxis = $(this).data('axis');
                        that.state.axis = newAxis;
                    } else {
                        $(this).removeClass('selected');
                    }
                    
                } else if (vpEvent.keyManager.keyCheck.shiftKey) {
                    var axis = that.state.axis;
                    var startIdx = that.state.selection.start;
                    if (axis != FRAME_AXIS.ROW) {
                        startIdx = -1;
                    }
                    
                    if (startIdx == -1) {
                        // no selection
                        that.state.selection = { start: idx, end: -1 };
                    } else if (startIdx > idx) {
                        // add selection from idx to startIdx
                        var tags = $(that.wrapSelector('.' + VP_FE_TABLE_ROW));
                        for (var i = idx; i <= startIdx; i++) {
                            $(tags[i]).addClass('selected');
                        }
                        that.state.selection = { start: startIdx, end: idx };
                    } else if (startIdx <= idx) {
                        // add selection from startIdx to idx
                        var tags = $(that.wrapSelector('.' + VP_FE_TABLE_ROW));
                        for (var i = startIdx; i <= idx; i++) {
                            $(tags[i]).addClass('selected');
                        }
                        that.state.selection = { start: startIdx, end: idx };
                    }
                } else {
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW)).removeClass('selected');
                    if (!hasSelected) {
                        $(this).addClass('selected');
                        that.state.selection = { start: idx, end: -1 };
                        var newAxis = $(this).data('axis');
                        that.state.axis = newAxis;
                    } else {
                        $(this).removeClass('selected');
                    }
                }
                that.loadInfo();
            });

            // add column
            $(document).on('click', this.wrapSelector('.' + VP_FE_ADD_COLUMN), function() {
                // add column
                that.openInputPopup(FRAME_EDIT_TYPE.ADD_COL);
            });

            // add row
            $(document).on('click', this.wrapSelector('.' + VP_FE_ADD_ROW), function() {
                // add row
                that.openInputPopup(FRAME_EDIT_TYPE.ADD_ROW);
            });

            // more rows
            $(document).on('click', this.wrapSelector('.' + VP_FE_TABLE_MORE), function() {
                that.state.lines += TABLE_LINES;
                that.loadCode(that.getTypeCode(FRAME_EDIT_TYPE.SHOW), true);
            });

            // click toolbar item
            $(document).on('click', this.wrapSelector('.vp-fe-toolbar-item'), function() {
                var itemType = $(this).data('type');
                switch (parseInt(itemType)) {
                    case FRAME_EDIT_TYPE.ADD_COL:
                    case FRAME_EDIT_TYPE.ADD_ROW:
                        that.openInputPopup(itemType);
                        break;
                }
            });

            // click menu item
            $(document).on('click', this.wrapSelector('.' + VP_FE_MENU_ITEM), function(event) {
                event.stopPropagation();
                var editType = $(this).data('type');
                switch (parseInt(editType)) {
                    case FRAME_EDIT_TYPE.ADD_COL:
                    case FRAME_EDIT_TYPE.ADD_ROW:
                    case FRAME_EDIT_TYPE.RENAME:
                    case FRAME_EDIT_TYPE.REPLACE:
                    case FRAME_EDIT_TYPE.AS_TYPE:
                        that.openInputPopup(editType);
                        break;
                    case FRAME_EDIT_TYPE.DROP_OUT:
                        that.config.checkModules = ['pd', 'np', 'vp_drop_outlier'];
                        that.checkAndRunModules(true).then(function() {
                            that.loadCode(that.getTypeCode(editType));
                        });
                        break;
                    default:
                        that.loadCode(that.getTypeCode(editType));
                        break;
                }
                that.hideMenu();
            });

            // popup : replace - add button
            $(document).on('click', this.wrapSelector('.vp-inner-popup-replace-add'), function() {
                var newInput = $(that.renderReplaceInput(++that.state.popup.replace.index));
                newInput.insertBefore(
                    $(that.wrapSelector('.vp-inner-popup-replace-table tr:last'))
                );
            });

            // popup : replace - delete row
            $(document).on('click', this.wrapSelector('.vp-inner-popup-delete'), function() {
                $(this).closest('tr').remove();
            });

            
            // popup : add column - dataframe selection 1
            $(document).on('var_changed change', this.wrapSelector('.vp-inner-popup-var1'), function() {
                var type = $(that.wrapSelector('.vp-inner-popup-var1box .vp-vs-data-type')).val();
                if (type == 'DataFrame') {
                    var df = $(this).val();
                    vpKernel.getColumnList(df).then(function(resultObj) {
                        let { result } = resultObj;
                        var colList = JSON.parse(result);
                        var tag = new com_String();
                        tag.appendFormatLine('<select class="{0}">', 'vp-inner-popup-var1col');
                        colList && colList.forEach(col => {
                            tag.appendFormatLine('<option data-code="{0}" value="{1}">{2}</option>'
                                    , col.value, col.label, col.label);
                        });
                        tag.appendLine('</select>');
                        // replace column list
                        $(that.wrapSelector('.vp-inner-popup-var1col')).replaceWith(function() {
                            return tag.toString();
                        });
                    });
                }
            });

            // popup : add column - dataframe selection 2
            $(document).on('var_changed change', this.wrapSelector('.vp-inner-popup-var2'), function() {
                var type = $(that.wrapSelector('.vp-inner-popup-var2box .vp-vs-data-type')).val();
                if (type == 'DataFrame') {
                    var df = $(this).val();
                    vpKernel.getColumnList(df).then(function(resultObj) {
                        let { result } = resultObj;
                        var colList = JSON.parse(result);
                        var tag = new com_String();
                        tag.appendFormatLine('<select class="{0}">', 'vp-inner-popup-var2col');
                        colList && colList.forEach(col => {
                            tag.appendFormatLine('<option data-code="{0}" value="{1}">{2}</option>'
                                    , col.value, col.label, col.label);
                        });
                        tag.appendLine('</select>');
                        // replace column list
                        $(that.wrapSelector('.vp-inner-popup-var2col')).replaceWith(function() {
                            return tag.toString();
                        });
                    });
                }
            });
        }

        handleInnerOk() {
            // ok input popup
            var type = parseInt(this.state.popup.type);
            var content = this.getPopupContent(type);
            // required data check
            if (type == FRAME_EDIT_TYPE.ADD_COL) {
                if (content.name === '') {
                    return;
                }
            }
            var code = this.loadCode(this.getTypeCode(this.state.popup.type, content));
            if (code == '') {
                return;
            }
            this.closeInnerPopup();
        }

        _unbindEvent() {
            super._unbindEvent();
            $(document).off(this.wrapSelector('*'));
    
            $(document).off('change', this.wrapSelector('#vp_feVariable'));
            $(document).off('click', this.wrapSelector('.vp-fe-df-refresh'));
            $(document).off('click', this.wrapSelector('.' + VP_FE_INFO));
            $(document).off('change', this.wrapSelector('#vp_feReturn'));
            $(document).off('contextmenu', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN));
            $(document).off('contextmenu', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW));
            $(document).off('click', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN));
            $(document).off('click', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW));
            $(document).off('click', this.wrapSelector('.' + VP_FE_ADD_COLUMN));
            $(document).off('click', this.wrapSelector('.' + VP_FE_ADD_ROW));
            $(document).off('click', this.wrapSelector('.' + VP_FE_TABLE_MORE));
            $(document).off('click', this.wrapSelector('.vp-fe-toolbar-item'));
            $(document).off('click', this.wrapSelector('.' + VP_FE_MENU_ITEM));
            $(document).off('click', this.wrapSelector('.vp-inner-popup-replace-add'));
            $(document).off('click', this.wrapSelector('.vp-inner-popup-delete'));
            $(document).off('change', this.wrapSelector('.vp-inner-popup-var1'));
            $(document).off('change', this.wrapSelector('.vp-inner-popup-var2'));
        }

        bindEventForPopupPage() {
            var that = this;
            ///// add page
            // 1. add type
            $(this.wrapSelector('.vp-inner-popup-addtype')).on('change', function() {
                var tab = $(this).val();
                $(that.wrapSelector('.vp-inner-popup-tab')).hide();
                $(that.wrapSelector('.vp-inner-popup-tab.' + tab)).show();
            });
    
            // 2-1. hide column selection box
            $(this.wrapSelector('.vp-inner-popup-var1box .vp-vs-data-type')).on('change', function() {
                var type = $(this).val();
                if (type == 'DataFrame') {
                    $(that.wrapSelector('.vp-inner-popup-var1col')).show();
                } else {
                    $(that.wrapSelector('.vp-inner-popup-var1col')).hide();
                }
            });
    
            $(this.wrapSelector('.vp-inner-popup-var2box .vp-vs-data-type')).on('change', function() {
                var type = $(this).val();
                if (type == 'DataFrame') {
                    $(that.wrapSelector('.vp-inner-popup-var2col')).show();
                } else {
                    $(that.wrapSelector('.vp-inner-popup-var2col')).hide();
                }
            });
        }

        templateForBody() {
            return frameHtml;
        }

        render() {
            super.render();

            var {
                originObj,
                returnObj,
                inplace,
                steps
            } = this.state;

            this.loadVariableList();
    
            $(this.wrapSelector('#vp_feVariable')).val(originObj);
    
            $(this.wrapSelector('#vp_feReturn')).val(returnObj);

            $(this.wrapSelector('#inplace')).prop('checked', inplace);
    
            // execute all steps
            if (steps && steps.length > 0) {
                var code = steps.join('\n');
                // this.state.steps = [];
                this.loadCode(code);
            }
        }

        renderVariableList(varList, defaultValue='') {
            let mappedList = varList.map(obj => { return { label: obj.varName, value: obj.varName, dtype: obj.varType } });

            var variableInput = new SuggestInput();
            variableInput.setComponentID('vp_feVariable');
            variableInput.addClass('vp-state');
            variableInput.setPlaceholder('Select variable');
            variableInput.setSuggestList(function () { return mappedList; });
            variableInput.addAttribute('required', true);
            variableInput.setSelectEvent(function (value) {
                $(this.wrapSelector()).val(value);
                $(this.wrapSelector()).trigger('change');
            });
            variableInput.setNormalFilter(true);
            variableInput.setValue(defaultValue);
            $(this.wrapSelector('#vp_feVariable')).replaceWith(function() {
                return variableInput.toTagString();
            });
        }

        renderTable(renderedText, isHtml=true) {
            var tag = new com_String();
            // Table
            tag.appendFormatLine('<div class="{0} {1} {2}">', VP_FE_TABLE, 'rendered_html', 'vp-scrollbar');
            if (isHtml) {
                tag.appendFormatLine('<table class="dataframe">{0}</table>', renderedText);
                // More button
                tag.appendFormatLine('<div class="{0} {1}">More...</div>', VP_FE_TABLE_MORE, 'vp-button');
            } else {
                tag.appendFormatLine('<pre>{0}</pre>', renderedText);
            }
            tag.appendLine('</div>'); // End of Table
            return tag.toString();
        }

        /**
         * Get last code to set preview
         * @returns 
         */
        getCurrentCode() {
            let { inplace, steps, tempObj, returnObj } = this.state;
            let codeList = steps;
            if (inplace === true) {
                codeList = steps.slice(1, steps.length);
            }
            
            // get last code
            let currentCode = codeList[codeList.length - 1];
            if (currentCode && currentCode != '') {
                currentCode = currentCode.replaceAll(tempObj, returnObj);
            } else {
                currentCode = '';
            }
            return currentCode;
        }

        generateCode() {
            var code = '';
            // if inplace is true, join steps without .copy()
            if (this.state.inplace === true) {
                code = this.state.steps.slice(1).join('\n');
            } else {
                code = this.state.steps.join('\n');
            }
            var returnVariable = $(this.wrapSelector('#vp_feReturn')).val();
            if (returnVariable != '') {
                code = code.replaceAll(this.state.tempObj, returnVariable);

                if (code != '') {
                    code += '\n' + returnVariable;
                }
            } else {
                code += '\n' + this.state.tempObj;
            }
            return code;
        }

        initState() {
            this.state.selected = [];
            this.state.axis = FRAME_AXIS.NONE;
            this.state.lines = TABLE_LINES;
            this.state.steps = [];
        }

        // FIXME: 
        renderButton() {
            // set button next to input tag
            var buttonTag = new com_String();
            buttonTag.appendFormat('<button type="button" class="{0} {1} {2}">{3}</button>'
                                    , VP_FE_BTN, this.uuid, 'vp-button', 'Edit');
            if (this.pageThis) {
                $(this.pageThis.wrapSelector('#' + this.targetId)).parent().append(buttonTag.toString());
            }
        }

        setPreview(previewCodeStr) {
            // get only last line of code
            var previewCode = previewCodeStr;
            if (previewCodeStr.includes('\n') === true) {
                let previewCodeLines = previewCodeStr.split('\n');
                previewCode = previewCodeLines.pop();
            }
            this.setCmValue('previewCode', previewCode);
        }

        loadVariableList() {
            var that = this;
            // load using kernel
            var dataTypes = ['DataFrame'];
            vpKernel.getDataList(dataTypes).then(function(resultObj) {
                let { result } = resultObj;
                try {
                    var varList = JSON.parse(result);
                    // render variable list
                    // get prevvalue
                    var prevValue = that.state.originObj;
                    // if (varList && varList.length > 0 && prevValue == '') {
                    //     prevValue = varList[0].varName;
                    //     that.state.originObj = prevValue;
                    // }
                    // replace
                    that.renderVariableList(varList, prevValue);
                    $(that.wrapSelector('#vp_feVariable')).trigger('change');
                } catch (ex) {
                    vpLog.display(VP_LOG_TYPE.ERROR, 'FrameEditor:', result);
                }
            });
        }

        /**
         * Render Inner popup page
         * @param {*} type 
         * @param {*} targetLabel 
         * @returns 
         */
        renderAddPage = function(type, targetLabel = '') {
            var content = new com_String();
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-addpage');
            content.appendLine('<div>');
            content.appendLine('<table class="vp-tbl-gap5"><colgroup><col width="80px"><col width="*"></colgroup>');
            content.appendFormatLine('<tr><th class="{0}">{1}</th>', 'vp-orange-text', targetLabel);
            var target = '';
            if (type == 'replace') {
                target = this.state.selected.map(col => col.label).join(',');
            }
            content.appendFormatLine('<td><input type="text" class="{0}" value="{1}" {2}/>', 'vp-inner-popup-input1', target, type=='replace'?'disabled':'');
            content.appendFormatLine('<label><input type="checkbox" class="{0}" checked {1}/><span>{2}</span></label>'
                                    , 'vp-inner-popup-istext1', type=='replace'?'disabled':'', 'Text');
            content.appendLine('</td></tr><tr>');
            content.appendLine('<th><label>Add Type</label></th>');
            content.appendFormatLine('<td><select class="{0}">', 'vp-inner-popup-addtype');
            content.appendFormatLine('<option value="{0}">{1}</option>', 'value', 'Value');
            content.appendFormatLine('<option value="{0}">{1}</option>', 'calculation', 'Calculation');
            if (type == 'replace') {
                content.appendFormatLine('<option value="{0}">{1}</option>', 'replace', 'Replace');
            }
            if (type == 'column' || type == 'replace') {
                content.appendFormatLine('<option value="{0}">{1}</option>', 'subset', 'Subset');
            }
            content.appendFormatLine('<option value="{0}">{1}</option>', 'apply', 'Apply');
            content.appendLine('</select></td></tr>');
            content.appendLine('</table>');
            content.appendLine('</div>'); // end of vp-inner-popup-header
    
            content.appendLine('<hr style="margin: 5px 0px;"/>');
            
            // tab 1. value
            content.appendFormatLine('<div class="{0} {1}">', 'vp-inner-popup-tab', 'value');
            content.appendLine('<table class="vp-tbl-gap5"><colgroup><col width="80px"><col width="*"></colgroup><tr>');
            content.appendLine('<th><label>Value</label></th>');
            content.appendFormatLine('<td><input type="text" class="{0}"/>', 'vp-inner-popup-input2');
            content.appendFormatLine('<label><input type="checkbox" class="{0}" checked/><span>{1}</span></label>', 'vp-inner-popup-istext2','Text');
            content.appendLine('</td></tr></table>');
            content.appendLine('</div>'); // end of vp-inner-popup-tab value
    
            // tab 2. calculation
            content.appendFormatLine('<div class="{0} {1}" style="display: none;">', 'vp-inner-popup-tab', 'calculation');
            content.appendLine('<table class="vp-tbl-gap5"><colgroup><col width="80px"><col width="*"></colgroup>');
            // calc - variable 1
            content.appendLine('<tr>');
            content.appendLine('<th><label>Variable 1</label></th>');
            content.appendFormatLine('<td><select class="{0}"></select></td>', 'vp-inner-popup-var1col');
            content.appendLine('</tr>');
            // calc -operator
            content.appendLine('<tr>');
            content.appendLine('<th><label>Operator</label></th>');
            content.appendFormatLine('<td><select class="{0}">', 'vp-inner-popup-oper');
            var operList = ['+', '-', '*', '/', '%', '//', '==', '!=', '>=', '>', '<=', '<', 'and', 'or'];
            operList.forEach(oper => {
                content.appendFormatLine('<option value="{0}">{1}</option>', oper, oper);
            });
            content.appendFormatLine('</select></td>');
            content.appendLine('</tr>');
            // calc - variable 2
            content.appendLine('<tr>');
            content.appendLine('<th><label>Variable 2</label></th>');
            content.appendFormatLine('<td><select class="{0}"></select></td>', 'vp-inner-popup-var2col');
            content.appendLine('</tr>');
            content.appendLine('</table>');
            content.appendLine('</div>'); // end of vp-inner-popup-tab calculation
    
            // tab 3. replace
            content.appendFormatLine('<div class="{0} {1} {2}" style="display: none;">', 'vp-inner-popup-tab', 'replace', 'vp-scrollbar');
            content.appendLine(this.renderReplacePage());
            content.appendLine('</div>'); // end of vp-inner-popup-tab replace

            // tab 4. subset
            if (type == 'column' || type == 'replace') {
                content.appendFormatLine('<div class="{0} {1}" style="display: none;">', 'vp-inner-popup-tab', 'subset');
                content.appendLine('<table class="vp-tbl-gap5"><colgroup><col width="80px"><col width="*"></colgroup>');

                content.appendLine('<tr><td colspan="2">');
                content.appendLine('<div class="vp-fr-subset-box">');
                content.appendLine('<textarea class="vp-input vp-inner-popup-subset"></textarea>');
                content.appendLine('</div>');
                content.appendLine('</td></tr>');

                content.appendLine('<tr><th><label>Value</label></th>');
                content.appendFormatLine('<td><input type="text" class="{0}"/>', 'vp-inner-popup-input3');
                content.appendFormatLine('<label><input type="checkbox" class="{0}" checked/><span>{1}</span></label>', 'vp-inner-popup-istext3','Text');
                content.appendLine('</td></tr></table>');
                content.appendLine('</div>'); // end of vp-inner-popup-tab subset
            }
            // tab 5. apply
            content.appendFormatLine('<div class="{0} {1}" style="display: none;">', 'vp-inner-popup-tab', 'apply');
            content.appendLine('<table class="vp-tbl-gap5"><colgroup><col width="80px"><col width="*"></colgroup>');
            content.appendLine('<tr><th><label>Column</label></th>');
            content.appendFormatLine('<td>{0}</td></tr>', this.renderColumnList(this.state.columnList));
            content.appendLine('<tr><th><label>Function</label></th>');
            content.appendFormatLine('<td><input type="text" id="{0}" class="{1}" placeholder="{2}"/></td>'
                                    , 'vp_popupAddApply', 'vp-input vp-inner-popup-apply-lambda', 'Type code manually');
            content.appendLine('</tr></table>');
            content.appendLine('</div>'); // end of vp-inner-popup-tab apply
            content.appendLine('</div>'); // end of vp-inner-popup-addpage
            
            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content.toString());
            return content.toString();
        }

        renderColumnList = function(columnList) {
            var selectTag = new com_String();
            selectTag.appendFormatLine('<select class="{0}">', 'vp-inner-popup-apply-column');
            columnList && columnList.forEach(col => {
                selectTag.appendFormatLine('<option value="{0}">{1}</option>', col.code, col.label);
            }); 
            selectTag.appendLine('</select>');
            return selectTag.toString();
        }

        renderRenamePage = function() {
            var content = new com_String();
            content.appendFormatLine('<div class="{0} {1}">', 'vp-inner-popup-rename-page', 'vp-scrollbar');
            content.appendLine('<table>');
            content.appendLine('<colgroup><col width="100px"><col width="*"></colgroup>');
            this.state.selected.forEach((col, idx) => {
                content.appendLine('<tr>');
                content.appendFormatLine('<th><label>{0}</label></th>', col.label);
                content.appendFormatLine('<td><input type="text" class="{0}"/>', 'vp-inner-popup-input' + idx);
                content.appendFormatLine('<label><input type="checkbox" class="{0}" checked/><span>{1}</span></label>', 'vp-inner-popup-istext' + idx, 'Text');
                content.appendLine('</tr>');
            });
            content.appendLine('</table>');
            content.appendLine('</div>');

            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content.toString());
            return content.toString();
        }

        renderReplacePage() {
            var content = new com_String();
            content.appendFormatLine('<label><input type="checkbox" class="{0}"/><span>{1}</span></label>', 'vp-inner-popup-use-regex', 'Use Regular Expression');
            content.appendLine('<br/><br/>');
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-replace-table');
            content.appendLine('<table>');
            content.appendLine(this.renderReplaceInput(0));
            content.appendFormatLine('<tr><td colspan="3"><button class="{0} {1}">{2}</button></td></tr>', 'vp-button', 'vp-inner-popup-replace-add', '+ Add Key');
            content.appendLine('</table>');
            content.appendLine('</div>');
            return content.toString();
        }

        renderReplaceInput(index) {
            var content = new com_String();
            content.appendLine('<tr>');
            content.appendLine('<td>');
            content.appendFormatLine('<input type="text" class="{0}" placeholder="{1}"/>', 'vp-inner-popup-origin' + index, 'Origin');
            content.appendFormatLine('<label><input type="checkbox" class="{0}" checked/><span>{1}</span></label>', 'vp-inner-popup-origin-istext' + index, 'Text');
            content.appendLine('</td>');
            content.appendLine('<td>');
            content.appendFormatLine('<input type="text" class="{0}" placeholder="{1}"/>', 'vp-inner-popup-replace' + index, 'Replace');
            content.appendFormatLine('<label><input type="checkbox" class="{0}" checked/><span>{1}</span></label>', 'vp-inner-popup-replace-istext' + index, 'Text');
            content.appendLine('</td>');
            // LAB: img to url
            // content.appendFormatLine('<td><div class="{0} {1}"><img src="{2}"/></div></td>', 'vp-inner-popup-delete', 'vp-cursor', com_Const.IMAGE_PATH + 'close_small.svg');
            content.appendFormatLine('<td><div class="{0} {1} {2}"></div></td>', 'vp-inner-popup-delete', 'vp-cursor', 'vp-icon-close-small');
            content.appendLine('</tr>');
            return content.toString();
        }

        renderAsType() {
            var astypeList = this.astypeList;
            var content = new com_String();
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-astype');
            content.appendFormatLine('<table class="{0}">', 'vp-inner-popup-astype-table');
            content.appendLine('<colgroup><col width="140px"><col width="80px"><col width="*"></colgroup>');
            content.appendFormatLine('<thead style="height: 30px"><th>{0}</th><th>{1}</th><th class="{2}">{3}</th></thead>'
                                    , 'Column', 'Data type', 'vp-orange-text', 'New data type');
            content.appendLine('<tbody>');
            this.state.selected.forEach((col, idx) => {
                content.appendLine('<tr>');
                content.appendFormatLine('<td title="{0}">{1}</td>', col.label, col.label);
                content.appendFormatLine('<td><input type="text" value="{0}" readonly/></td>', col.type);
                var suggestInput = new SuggestInput();
                suggestInput.addClass('vp-inner-popup-astype' + idx);
                suggestInput.addAttribute('data-col', col.code);
                suggestInput.setSuggestList(function() { return astypeList; });
                suggestInput.setPlaceholder('Data type');
                content.appendFormatLine('<td>{0}</td>', suggestInput.toTagString());
                content.appendLine('</tr>');
            });
            content.appendLine('</tbody></table>');
            content.append('</div>');

            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content.toString());
            return content.toString();
        }

        openInputPopup(type, width=400, height=400) {
            var title = '';
            var content = '';
            let size = { width: width, height: height };
            let that = this;
    
            switch (parseInt(type)) {
                case FRAME_EDIT_TYPE.ADD_COL:
                    title = 'Add Column';
                    content = this.renderAddPage('column', 'Column Name');

                    // bind codemirror
                    this.subsetCm = this.initCodemirror({ 
                        key: 'vp-inner-popup-subset', 
                        selector: this.wrapSelector('.vp-inner-popup-subset'), 
                        type: 'readonly' 
                    });
                    // set subset
                    let contentState = that.getPopupContent(type);
                    this.subsetEditor = new Subset({ 
                        pandasObject: this.state.tempObj,
                        selectedColumns: [ com_util.convertToStr(contentState.name, contentState.nameastext) ],
                        config: { name: 'Subset' } }, 
                    { 
                        useInputVariable: true,
                        useInputColumns: true,
                        targetSelector: this.wrapSelector('.vp-inner-popup-subset'),
                        pageThis: this,
                        allowSubsetTypes: ['iloc', 'loc'],
                        beforeOpen: function(subsetThis) {
                            let contentState = that.getPopupContent(type);
                            let name = com_util.convertToStr(contentState.name, contentState.nameastext);
                            subsetThis.state.selectedColumns = [ name ];
                        },
                        finish: function(code) {
                            that.subsetCm.setValue(code);
                            that.subsetCm.save();
                            setTimeout(function () {
                                that.subsetCm.refresh();
                            }, 1);
                        }
                    });
                    // initial code
                    var code = this.subsetEditor.generateCode();
                    that.subsetCm.setValue(code);
                    that.subsetCm.save();
                    setTimeout(function () {
                        that.subsetCm.refresh();
                    }, 1);
                    
                    break;
                case FRAME_EDIT_TYPE.ADD_ROW:
                    title = 'Add Row';
                    content = this.renderAddPage('row', 'Row Name');
                    break;
                case FRAME_EDIT_TYPE.RENAME:
                    title = 'Rename';
                    content = this.renderRenamePage();
                    break;
                case FRAME_EDIT_TYPE.REPLACE:
                    title = 'Replace';
                    // content = this.renderReplacePage();
                    content = this.renderAddPage('replace', 'Column');

                    // bind codemirror
                    this.subsetCm = this.initCodemirror({ 
                        key: 'vp-inner-popup-subset', 
                        selector: this.wrapSelector('.vp-inner-popup-subset'), 
                        type: 'readonly' 
                    });
                    // set subset
                    this.subsetEditor = new Subset({ 
                        pandasObject: this.state.tempObj,
                        selectedColumns: that.state.selected.map(col=>col.code),
                        config: { name: 'Subset' } }, 
                    { 
                        useInputVariable: true,
                        useInputColumns: true,
                        targetSelector: this.wrapSelector('.vp-inner-popup-subset'),
                        pageThis: this,
                        allowSubsetTypes: ['iloc', 'loc'],
                        beforeOpen: function(subsetThis) {
                            subsetThis.state.selectedColumns = that.state.selected.map(col=>col.code);
                        },
                        finish: function(code) {
                            that.subsetCm.setValue(code);
                            that.subsetCm.save();
                            setTimeout(function () {
                                that.subsetCm.refresh();
                            }, 1);
                        }
                    });
                    // initial code
                    var code = this.subsetEditor.generateCode();
                    that.subsetCm.setValue(code);
                    that.subsetCm.save();
                    setTimeout(function () {
                        that.subsetCm.refresh();
                    }, 1);

                    break;
                case FRAME_EDIT_TYPE.AS_TYPE:
                    title = 'Convert type';
                    content = this.renderAsType();
                    break;
                default:
                    type = FRAME_EDIT_TYPE.NONE;
                    break;
            }
    
            this.state.popup.type = type;

            // set size
            $(this.wrapSelector('.vp-inner-popup-box')).css(size);
            
            // bindEventForAddPage
            this.bindEventForPopupPage();

            // set column list
            vpKernel.getColumnList(this.state.tempObj).then(function(resultObj) {
                let { result } = resultObj;
                var colList = JSON.parse(result);
                var tag1 = new com_String();
                var tag2 = new com_String();
                tag1.appendFormatLine('<select class="{0}">', 'vp-inner-popup-var1col');
                tag2.appendFormatLine('<select class="{0}">', 'vp-inner-popup-var2col');
                colList && colList.forEach(col => {
                    tag1.appendFormatLine('<option data-code="{0}" value="{1}">{2}</option>'
                            , col.value, col.label, col.label);
                    tag2.appendFormatLine('<option data-code="{0}" value="{1}">{2}</option>'
                            , col.value, col.label, col.label);
                });
                tag1.appendLine('</select>');
                tag2.appendLine('</select>');
                // replace column list
                $(that.wrapSelector('.vp-inner-popup-var1col')).replaceWith(function() {
                    return tag1.toString();
                });
                $(that.wrapSelector('.vp-inner-popup-var2col')).replaceWith(function() {
                    return tag2.toString();
                });
            });
    
            // show popup box
            this.openInnerPopup(title);
        }

        getPopupContent = function(type) {
            var content = {};
            switch (type) {
                case FRAME_EDIT_TYPE.ADD_COL:
                case FRAME_EDIT_TYPE.REPLACE:
                    content['name'] = $(this.wrapSelector('.vp-inner-popup-input1')).val();
                    if (content['name'] == '') {
                        $(this.wrapSelector('.vp-inner-popup-input1')).attr({'placeholder': 'Required input'});
                        $(this.wrapSelector('.vp-inner-popup-input1')).focus();
                    }
                    var tab = $(this.wrapSelector('.vp-inner-popup-addtype')).val();
                    content['nameastext'] = $(this.wrapSelector('.vp-inner-popup-istext1')).prop('checked');
                    content['addtype'] = tab;
                    if (tab == 'value') {
                        content['value'] = $(this.wrapSelector('.vp-inner-popup-input2')).val();
                        content['valueastext'] = $(this.wrapSelector('.vp-inner-popup-istext2')).prop('checked');
                    } else if (tab == 'calculation') {
                        content['var1col'] = $(this.wrapSelector('.vp-inner-popup-var1col')).val();
                        content['oper'] = $(this.wrapSelector('.vp-inner-popup-oper')).val();
                        content['var2col'] = $(this.wrapSelector('.vp-inner-popup-var2col')).val();
                    } else if (tab == 'replace') {
                        var useregex = $(this.wrapSelector('.vp-inner-popup-use-regex')).prop('checked');
                        content['useregex'] = useregex;
                        content['list'] = [];
                        for (var i=0; i <= this.state.popup.replace.index; i++) {
                            var origin = $(this.wrapSelector('.vp-inner-popup-origin' + i)).val();
                            var origintext = $(this.wrapSelector('.vp-inner-popup-origin-istext'+i)).prop('checked');
                            var replace = $(this.wrapSelector('.vp-inner-popup-replace' + i)).val();
                            var replacetext = $(this.wrapSelector('.vp-inner-popup-replace-istext'+i)).prop('checked');
                            if (origin && replace) {
                                content['list'].push({
                                    origin: origin,
                                    origintext: origintext,
                                    replace: replace,
                                    replacetext: replacetext
                                });
                            }
                        }
                    } else if (tab == 'subset') {
                        content['subset'] = this.subsetCm?this.subsetCm.getValue():'';
                        content['value'] = $(this.wrapSelector('.vp-inner-popup-input3')).val();
                        content['valueastext'] = $(this.wrapSelector('.vp-inner-popup-istext3')).prop('checked');
                    } else if (tab == 'apply') {
                        content['column'] = $(this.wrapSelector('.vp-inner-popup-apply-column')).val();
                        content['apply'] = $(this.wrapSelector('.vp-inner-popup-apply-lambda')).val();
                    }
                    break;
                case FRAME_EDIT_TYPE.ADD_ROW:
                    content['name'] = $(this.wrapSelector('.vp-inner-popup-input1')).val();
                    content['nameastext'] = $(this.wrapSelector('.vp-inner-popup-istext1')).prop('checked');
                    content['value'] = $(this.wrapSelector('.vp-inner-popup-input2')).val();
                    content['valueastext'] = $(this.wrapSelector('.vp-inner-popup-istext2')).prop('checked');
                    break;
                case FRAME_EDIT_TYPE.RENAME:
                    this.state.selected.forEach((element, idx) => {
                        var value = $(this.wrapSelector('.vp-inner-popup-input'+idx)).val();
                        var istext = $(this.wrapSelector('.vp-inner-popup-istext'+idx)).prop('checked');
                        content[idx] = {
                            label: element.code,
                            value: value,
                            istext: istext
                        };
                    });
                    break;
                // case FRAME_EDIT_TYPE.REPLACE:
                //     var useregex = $(this.wrapSelector('.vp-inner-popup-use-regex')).prop('checked');
                //     content['useregex'] = useregex;
                //     content['list'] = [];
                //     for (var i=0; i <= this.state.popup.replace.index; i++) {
                //         var origin = $(this.wrapSelector('.vp-inner-popup-origin' + i)).val();
                //         var origintext = $(this.wrapSelector('.vp-inner-popup-origin-istext'+i)).prop('checked');
                //         var replace = $(this.wrapSelector('.vp-inner-popup-replace' + i)).val();
                //         var replacetext = $(this.wrapSelector('.vp-inner-popup-replace-istext'+i)).prop('checked');
                //         if (origin && replace) {
                //             content['list'].push({
                //                 origin: origin,
                //                 origintext: origintext,
                //                 replace: replace,
                //                 replacetext: replacetext
                //             });
                //         }
                //     }
                //     break;
                case FRAME_EDIT_TYPE.AS_TYPE:
                    this.state.selected.forEach((col, idx) => {
                        var value = $(this.wrapSelector('.vp-inner-popup-astype'+idx)).val();
                        content[idx] = {
                            label: col.code,
                            value: value
                        };
                    });
                    break;
                default:
                    break;
            }
            return content;
        }

        templateForDataView() {
            return this.renderInfoPage('');
        }

        renderDataView() {
            super.renderDataView();

            this.loadInfo();
            $(this.wrapSelector('.vp-popup-dataview-box')).css('height', '300px');
        }

        renderInfoPage = function(renderedText, isHtml = true) {
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} {1} vp-close-on-blur vp-scrollbar">', VP_FE_INFO_CONTENT
                                , 'rendered_html'); // 'rendered_html' style from jupyter output area
            if (isHtml) {
                tag.appendLine(renderedText);
            } else {
                tag.appendFormatLine('<pre>{0}</pre>', renderedText);
            }
            tag.appendLine('</div>');
            return tag.toString();
        }

        loadInfo() {
            var that = this;
    
            // get selected columns/indexes
            var selected = [];
            $(this.wrapSelector('.' + VP_FE_TABLE + ' th.selected')).each((idx, tag) => {
                var label = $(tag).text();
                var code = $(tag).data('code');
                var type = $(tag).data('type');
                selected.push({ label: label, code: code, type: type });
            });
            this.state.selected = selected;
    
            var code = new com_String();
            var locObj = new com_String();
            locObj.appendFormat("{0}", this.state.tempObj);
            if (this.state.selected.length > 0) {
                var rowCode = ':';
                var colCode = ':';
                if (this.state.axis == FRAME_AXIS.ROW) {
                    rowCode = '[' + this.state.selected.map(col=>col.code).join(',') + ']';
                }
                if (this.state.axis == FRAME_AXIS.COLUMN) {
                    colCode = '[' + this.state.selected.map(col=>col.code).join(',') + ']';
                }
                locObj.appendFormat(".loc[{0},{1}]", rowCode, colCode);
            }
            // code.append(".value_counts()");
            code.appendFormat('_vp_display_dataframe_info({0})', locObj.toString());
    
            // CHROME: TODO: 6: use com_Kernel.execute
            // Jupyter.notebook.kernel.execute(
            vpKernel.execute(code.toString()).then(function(resultObj) {
                let { msg } = resultObj;
                if (msg.content.data) {
                    var htmlText = String(msg.content.data["text/html"]);
                    var codeText = String(msg.content.data["text/plain"]);
                    if (htmlText != 'undefined') {
                        $(that.wrapSelector('.' + VP_FE_INFO_CONTENT)).replaceWith(function() {
                            return that.renderInfoPage(htmlText);
                        });
                    } else if (codeText != 'undefined') {
                        // plain text as code
                        $(that.wrapSelector('.' + VP_FE_INFO_CONTENT)).replaceWith(function() {
                            return that.renderInfoPage(codeText, false);
                        });
                    } else {
                        $(that.wrapSelector('.' + VP_FE_INFO_CONTENT)).replaceWith(function() {
                            return that.renderInfoPage('');
                        });
                    }
                } else {
                    var errorContent = '';
                    if (msg.content.ename) {
                        errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                    }
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                    $(that.wrapSelector('.' + VP_FE_INFO_CONTENT)).replaceWith(function() {
                        return that.renderInfoPage(errorContent);
                    });
                }
            }).catch(function(resultObj) {
                let { msg } = resultObj;
                var errorContent = '';
                if (msg.content.ename) {
                    errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                }
                vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                $(that.wrapSelector('.' + VP_FE_INFO_CONTENT)).replaceWith(function() {
                    return that.renderInfoPage(errorContent);
                });
            })
        }

        getTypeCode(type, content={}) {
            var tempObj = this.state.tempObj;
            var orgObj = this.state.originObj;
            var type = parseInt(type);
    
            if (!orgObj || orgObj == '') {
                // object not selected
    
                return '';
            }
    
            var selectedName = this.state.selected.map(col=>col.code).join(',');
            var axis = this.state.axis;
    
            var code = new com_String();
            switch (type) {
                case FRAME_EDIT_TYPE.INIT:
                    code.appendFormat('{0} = {1}.copy()', tempObj, orgObj);
                    this.config.checkModules = ['pd'];
                    break;
                case FRAME_EDIT_TYPE.DROP:
                    code.appendFormat("{0}.drop([{1}], axis={2}, inplace=True)", tempObj, selectedName, axis);
                    break;
                case FRAME_EDIT_TYPE.RENAME:
                    var renameList = [];
                    Object.keys(content).forEach((key, idx) => {
                        if (content[key].value != '') {
                            renameList.push(com_util.formatString("{0}: {1}", content[key].label, com_util.convertToStr(content[key].value, content[key].istext)));
                        }
                    });
                    if (renameList.length > 0) {
                        code.appendFormat("{0}.rename({1}={{2}}, inplace=True)", tempObj, axis==FRAME_AXIS.ROW?'index':'columns', renameList.join(', '));
                    }
                    break;
                case FRAME_EDIT_TYPE.DROP_NA:
                    var locObj = '';
                    if (axis == FRAME_AXIS.ROW) {
                        locObj = com_util.formatString('.loc[[{0}],:]', selectedName);
                    } else {
                        locObj = com_util.formatString('.loc[:,[{0}]]', selectedName);
                    }
                    code.appendFormat("{0}{1}.dropna(axis={2}, inplace=True)", tempObj, locObj, axis);
                    break;
                case FRAME_EDIT_TYPE.DROP_DUP:
                    if (axis == FRAME_AXIS.COLUMN) {
                        code.appendFormat("{0}.drop_duplicates(subset=[{1}], inplace=True)", tempObj, selectedName);
                    }
                    break;
                case FRAME_EDIT_TYPE.DROP_OUT:
                    if (axis == FRAME_AXIS.COLUMN) {
                        code.appendFormat("{0} = vp_drop_outlier({1}, {2})", tempObj, tempObj, selectedName);
                    }
                    break;
                case FRAME_EDIT_TYPE.LABEL_ENCODING:
                    if (axis == FRAME_AXIS.COLUMN) {
                        let encodedColName = this.state.selected.map(col=> { 
                            if (col.code !== col.label) {
                                return com_util.formatString("'{0}'", col.label + '_label');
                            }
                            return col.label + '_label' 
                        }).join(',');
                        code.appendFormat("{0}[{1}] = pd.Categorical({2}[{3}]).codes", tempObj, encodedColName, tempObj, selectedName);
                    }
                    break;
                case FRAME_EDIT_TYPE.ONE_HOT_ENCODING:
                    if (axis == FRAME_AXIS.COLUMN) {
                        code.appendFormat("{0} = pd.get_dummies(data={1}, columns=[{2}])", tempObj, tempObj, selectedName);
                    }
                    break;
                case FRAME_EDIT_TYPE.SET_IDX:
                    if (axis == FRAME_AXIS.COLUMN) {
                        code.appendFormat("{0}.set_index([{1}], inplace=True)", tempObj, selectedName);
                    }
                    break;
                case FRAME_EDIT_TYPE.RESET_IDX:
                    if (axis == FRAME_AXIS.ROW) {
                        code.appendFormat("{0}.reset_index(inplace=True)", tempObj);
                    }
                    break;
                case FRAME_EDIT_TYPE.ADD_COL:
                case FRAME_EDIT_TYPE.REPLACE:
                    // if no name entered
                    if (content.name == '') {
                        return '';
                    }
                    var name = com_util.convertToStr(content.name, content.nameastext);
                    if (type == FRAME_EDIT_TYPE.REPLACE) {
                        name = selectedName;
                    }
                    var tab = content.addtype;
                    if (tab == 'value') {
                        var value = com_util.convertToStr(content.value, content.valueastext);
                        code.appendFormat("{0}[{1}] = {2}", tempObj, name, value);
                    } else if (tab == 'calculation') {
                        var { var1col, oper, var2col } = content;
                        var var1code = tempObj + "['" + var1col + "']";
                        var var2code = tempObj + "['" + var2col + "']";
                        code.appendFormat('{0}[{1}] = {2} {3} {4}', tempObj, name, var1code, oper, var2code);
                    } else if (tab == 'replace') {
                        var replaceStr = new com_String();
                        var useRegex = content['useregex'];
                        content['list'].forEach((obj, idx) => {
                            if (idx == 0) {
                                replaceStr.appendFormat("{0}: {1}"
                                                        , com_util.convertToStr(obj.origin, obj.origintext, useRegex)
                                                        , com_util.convertToStr(obj.replace, obj.replacetext, useRegex));
                            } else {
                                replaceStr.appendFormat(", {0}: {1}"
                                                        , com_util.convertToStr(obj.origin, obj.origintext, useRegex)
                                                        , com_util.convertToStr(obj.replace, obj.replacetext, useRegex));
                            }
                        });
                        if (selectedName && selectedName != '') {
                            selectedName = '[[' + selectedName + ']]';
                        }
                        code.appendFormat("{0}[{1}] = {2}{3}.replace({{4}}", tempObj, name, tempObj, selectedName, replaceStr);
                        if (useRegex) {
                            code.append(', regex=True');
                        }
                        code.append(')');
                    } else if (tab == 'subset') {
                        var value = com_util.convertToStr(content.value, content.valueastext);
                        code.appendFormat("{0} = {1}", content.subset, value);
                    } else if (tab == 'apply') {
                        code.appendFormat("{0}[{1}] = {2}[{3}].apply({4})", tempObj, name, tempObj, content.column, content.apply);
                    }
                    break;
                case FRAME_EDIT_TYPE.ADD_ROW: 
                    var name = com_util.convertToStr(content.name, content.nameastext);
                    var value = com_util.convertToStr(content.value, content.valueastext);
                    code.appendFormat("{0}.loc[{1}] = {2}", tempObj, name, value);
                    break;
                case FRAME_EDIT_TYPE.AS_TYPE:
                    var astypeStr = new com_String();
                    Object.keys(content).forEach((key, idx) => {
                        if (idx == 0) {
                            astypeStr.appendFormat("{0}: '{1}'", content[key].label, content[key].value);
                        } else {
                            astypeStr.appendFormat(", {0}: '{1}'", content[key].label, content[key].value);
                        }
                    });
                    code.appendFormat("{0} = {1}.astype({{2}})", tempObj, tempObj, astypeStr.toString());
                    break;
                case FRAME_EDIT_TYPE.SHOW:
                    break;
            }
    
            return code.toString();
        }

        loadCode(codeStr, more=false) {
            if (this.loading) {
                return;
            }
    
            var that = this;
            let { tempObj, lines, indexList } = this.state;
            var prevLines = 0;
            var scrollPos = -1;
            if (more) {
                prevLines = indexList.length;
                scrollPos = $(this.wrapSelector('.vp-fe-table')).scrollTop();
            }
    
            var code = new com_String();
            code.appendLine(codeStr);
            code.appendFormat("{0}.iloc[{1}:{2}].to_json(orient='{3}')", tempObj, prevLines, lines, 'split');
            
            this.loading = true;
            vpKernel.execute(code.toString()).then(function(resultObj) {
                let { result } = resultObj;
                try {
                    if (!result || result.length <= 0) {
                        return;
                    }
                    result = result.substr(1,result.length - 2).replaceAll('\\\\', '\\');
                    result = result.replaceAll('\'', "\\'");    // TEST: need test
                    // result = result.replaceAll('\\"', "\"");
                    var data = JSON.parse(result);
                    
                    vpKernel.getColumnList(tempObj).then(function(colResObj) {
                        try {
                            let columnResult = colResObj.result;
                            var columnList = JSON.parse(columnResult);
                            // var columnList = data.columns;
                            var indexList = data.index;
                            var dataList = data.data;
        
                            columnList = columnList.map(col => { return { label: col.label, type: col.dtype, code: col.value } });
                            indexList = indexList.map(idx => { return { label: idx, code: idx } });
            
                            if (!more) {
                                // table
                                var table = new com_String();
                                // table.appendFormatLine('<table border="{0}" class="{1}">', 1, 'dataframe');
                                table.appendLine('<thead>');
                                table.appendLine('<tr><th></th>');
                                columnList && columnList.forEach(col => {
                                    var colCode = col.code;
                                    var colClass = '';
                                    if (that.state.axis == FRAME_AXIS.COLUMN && that.state.selected.map(col=>col.code).includes(colCode)) {
                                        colClass = 'selected';
                                    }
                                    table.appendFormatLine('<th data-code="{0}" data-axis="{1}" data-type="{2}" class="{3} {4}">{5}</th>'
                                                            , colCode, FRAME_AXIS.COLUMN, col.type, VP_FE_TABLE_COLUMN, colClass, col.label);
                                });
                                // add column
                                // LAB: img to url
                                // table.appendFormatLine('<th class="{0}"><img src="{1}"/></th>', VP_FE_ADD_COLUMN, com_Const.IMAGE_PATH + 'plus.svg');
                                table.appendFormatLine('<th class="{0} {1}"></th>', VP_FE_ADD_COLUMN, 'vp-icon-plus');
                
                                table.appendLine('</tr>');
                                table.appendLine('</thead>');
                                table.appendLine('<tbody>');
                
                                dataList && dataList.forEach((row, idx) => {
                                    table.appendLine('<tr>');
                                    var idxName = indexList[idx].label;
                                    var idxLabel = com_util.convertToStr(idxName, typeof idxName == 'string');
                                    var idxClass = '';
                                    if (that.state.axis == FRAME_AXIS.ROW && that.state.selected.includes(idxLabel)) {
                                        idxClass = 'selected';
                                    }
                                    table.appendFormatLine('<th data-code="{0}" data-axis="{1}" class="{2} {3}">{4}</th>', idxLabel, FRAME_AXIS.ROW, VP_FE_TABLE_ROW, idxClass, idxName);
                                    row.forEach((cell, colIdx) => {
                                        if (cell == null) {
                                            cell = 'NaN';
                                        }
                                        var cellType = columnList[colIdx].type;
                                        if (cellType.includes('datetime')) {
                                            cell = new Date(parseInt(cell)).toLocaleString();
                                        }
                                        table.appendFormatLine('<td>{0}</td>', cell);
                                    });
                                    // empty data
                                    // table.appendLine('<td></td>');
                                    table.appendLine('</tr>');
                                });
                                // add row
                                table.appendLine('<tr>');
                                // LAB: img to url
                                // table.appendFormatLine('<th class="{0}"><img src="{1}"/></th>', VP_FE_ADD_ROW, com_Const.IMAGE_PATH + 'plus.svg');
                                table.appendFormatLine('<th class="{0} {1}"></th>', VP_FE_ADD_ROW, 'vp-icon-plus');
                                table.appendLine('</tr>');
                                table.appendLine('</tbody>');
                                $(that.wrapSelector('.' + VP_FE_TABLE)).replaceWith(function() {
                                    return that.renderTable(table.toString());
                                });
                            } else {
                                var table = new com_String();
                                dataList && dataList.forEach((row, idx) => {
                                    table.appendLine('<tr>');
                                    var idxName = indexList[idx].label;
                                    var idxLabel = com_util.convertToStr(idxName, typeof idxName == 'string');
                                    var idxClass = '';
                                    if (that.state.axis == FRAME_AXIS.ROW && that.state.selected.includes(idxLabel)) {
                                        idxClass = 'selected';
                                    }
                                    table.appendFormatLine('<th data-code="{0}" data-axis="{1}" class="{2} {3}">{4}</th>', idxLabel, FRAME_AXIS.ROW, VP_FE_TABLE_ROW, idxClass, idxName);
                                    row.forEach((cell, colIdx) => {
                                        if (cell == null) {
                                            cell = 'NaN';
                                        }
                                        var cellType = columnList[colIdx].type;
                                        if (cellType.includes('datetime')) {
                                            cell = new Date(parseInt(cell)).toLocaleString();
                                        }
                                        table.appendFormatLine('<td>{0}</td>', cell);
                                    });
                                    // empty data
                                    // table.appendLine('<td></td>');
                                    table.appendLine('</tr>');
                                });
                                // insert before last tr tag(add row button)
                                $(table.toString()).insertBefore($(that.wrapSelector('.' + VP_FE_TABLE + ' tbody tr:last')));
                            }
        
                            // save columnList & indexList as state
                            that.state.columnList = columnList;
                            if (!more) {
                                that.state.indexList = indexList;
                            } else {
                                that.state.indexList = that.state.indexList.concat(indexList);
                            }
        
        
                            // load info
                            that.loadInfo();
                            // add to stack
                            if (codeStr !== '') {
                                let newSteps = codeStr.split('\n');
                                that.state.steps = [
                                    ...that.state.steps,
                                    ...newSteps
                                ]
                                var replacedCode = codeStr.replaceAll(that.state.tempObj, that.state.returnObj);
                                that.setPreview(replacedCode);
                            }
                            
                            // if scrollPos is saved, go to the position
                            if (scrollPos >= 0) {
                                $(that.wrapSelector('.vp-fe-table')).scrollTop(scrollPos);
                            }
            
                            that.loading = false;
                        } catch (err1) {
                            vpLog.display(VP_LOG_TYPE.ERROR, err1);
                            that.loading = false;
                            throw err1;
                        }
                    });
                } catch (err) {
                    vpLog.display(VP_LOG_TYPE.ERROR, err);
                    that.loading = false;
                }
            }).catch(function(resultObj) {
                let { result, type, msg } = resultObj;
                vpLog.display(VP_LOG_TYPE.ERROR, result.ename + ': ' + result.evalue, msg, code.toString());
                if (that.isHidden() == false) {
                    // show alert modal only if this popup is visible
                    com_util.renderAlertModal(result.ename + ': ' + result.evalue);
                }
                that.loading = false;
            });
    
            return code.toString();
        }

        showMenu(left, top) {
            if (this.state.axis == 0) {
                // row
                $(this.wrapSelector(com_util.formatString('.{0}', VP_FE_MENU_BOX))).find('div[data-axis="col"]').hide();
                $(this.wrapSelector(com_util.formatString('.{0}', VP_FE_MENU_BOX))).find('div[data-axis="row"]').show();

                // change sub-box style
                $(this.wrapSelector(com_util.formatString('.{0}.vp-fe-sub-cleaning', VP_FE_MENU_SUB_BOX))).css({ 'top': '90px'});
            } else if (this.state.axis == 1) {
                // column
                $(this.wrapSelector(com_util.formatString('.{0}', VP_FE_MENU_BOX))).find('div[data-axis="row"]').hide();
                $(this.wrapSelector(com_util.formatString('.{0}', VP_FE_MENU_BOX))).find('div[data-axis="col"]').show();

                // change sub-box style
                $(this.wrapSelector(com_util.formatString('.{0}.vp-fe-sub-cleaning', VP_FE_MENU_SUB_BOX))).css({ 'top': '120px'});
            }
            $(this.wrapSelector(com_util.formatString('.{0}', VP_FE_MENU_BOX))).css({ top: top, left: left })
            $(this.wrapSelector(com_util.formatString('.{0}', VP_FE_MENU_BOX))).show();
        }

        hideMenu() {
            $(this.wrapSelector(com_util.formatString('.{0}', VP_FE_MENU_BOX))).hide();
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

    }

    const VP_FE_BTN = 'vp-fe-btn';

    const VP_FE_TITLE = 'vp-fe-title';

    const VP_FE_MENU_BOX = 'vp-fe-menu-box';
    const VP_FE_MENU_SUB_BOX = 'vp-fe-menu-sub-box';
    const VP_FE_MENU_ITEM = 'vp-fe-menu-item';

    const VP_FE_POPUP_BOX = 'vp-fe-popup-box';
    const VP_FE_POPUP_BODY = 'vp-fe-popup-body';
    const VP_FE_POPUP_OK = 'vp-fe-popup-ok';

    const VP_FE_TABLE = 'vp-fe-table';
    const VP_FE_TABLE_COLUMN = 'vp-fe-table-column';
    const VP_FE_TABLE_ROW = 'vp-fe-table-row';
    const VP_FE_ADD_COLUMN = 'vp-fe-add-column';
    const VP_FE_ADD_ROW = 'vp-fe-add-row';
    const VP_FE_TABLE_MORE = 'vp-fe-table-more';

    const VP_FE_INFO = 'vp-fe-info';
    const VP_FE_INFO_CONTENT = 'vp-fe-info-content';

    const VP_FE_PREVIEW_BOX = 'vp-fe-preview-box';
    const VP_FE_BUTTON_PREVIEW = 'vp-fe-btn-preview';
    const VP_FE_BUTTON_DATAVIEW = 'vp-fe-btn-dataview';

    // search rows count at once
    const TABLE_LINES = 10;

    const FRAME_EDIT_TYPE = {
        NONE: -1,
        INIT: 0,

        RENAME: 2,
        DROP: 3,
        DROP_NA: 4,
        DROP_DUP: 5,
        DROP_OUT: 11, 

        ONE_HOT_ENCODING: 6,
        LABEL_ENCODING: 12,

        SET_IDX: 7,
        RESET_IDX: 8,
        REPLACE: 9,
        AS_TYPE: 10,

        ADD_COL: 97,
        ADD_ROW: 98,
        SHOW: 99
    }

    const FRAME_AXIS = {
        NONE: -1,
        ROW: 0,
        COLUMN: 1
    }

    return Frame;
});