/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Bind.js
 *    Author          : Black Logic
 *    Note            : Apps > Bind
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Bind
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_apps/bind.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_apps/bind'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/MultiSelector'
], function(bindHtml, bindCss, com_util, com_String, PopupComponent, SuggestInput, MultiSelector) {

    /**
     * Bind
     */
    class Bind extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];

            this.howList = [
                { label: 'Inner', value: 'inner', desc: 'Inner join' },
                { label: 'Full outer', value: 'outer', desc: 'Full outer join' },
                { label: 'Left outer', value: 'left', desc: 'Left outer join' },
                { label: 'Right outer', value: 'right', desc: 'Right outer join' },
                { label: 'Cross', value: 'cross', desc: 'Cartesian product' },
            ]

            this.state = {
                type: 'concat',
                concat: {
                    variable: [], // DataFrame, Series
                    join: 'outer',
                    axis: 0, // 0: index, 1: column
                    sort: false
                },
                merge: {
                    left: {
                        variable: '',
                        on: [],
                        useIndex: false,
                        suffix: ''
                    },
                    right: {
                        variable: '',
                        on: [],
                        useIndex: false,
                        suffix: ''
                    },
                    on: [],
                    how: 'inner',
                },
                userOption: '',
                allocateTo: '',
                resetIndex: false,
                withoutColumn: 'True',
                ...this.state
            }
            this.popup = {
                type: '',
                targetSelector: '',
                MultiSelector: undefined
            }
        }

        _unbindEvent() {
            super._unbindEvent();
            $(document).off('change', this.wrapSelector('#vp_bdType'));

            $(document).off('change', this.wrapSelector('#vp_bdVariable'));
            $(document).off('click', this.wrapSelector('#vp_bdVariable'));
            $(document).off('change', this.wrapSelector('#vp_bdJoin'));
            $(document).off('change', this.wrapSelector('#vp_bdAxis'));
            $(document).off('change', this.wrapSelector('#vp_bdSort'));

            $(document).off('change', this.wrapSelector('#vp_bdLeftDataframe'));
            $(document).off('change', this.wrapSelector('#vp_bdRightDataframe'));
            $(document).off('click', this.wrapSelector('.vp-bd-df-refresh'));
            $(document).off('change', this.wrapSelector('#vp_bdHow'));
            $(document).off('change', this.wrapSelector('#vp_bdOn'));
            $(document).off('click', this.wrapSelector('#vp_bdOn'));
            $(document).off('change', this.wrapSelector('#vp_bdLeftOn'));
            $(document).off('click', this.wrapSelector('#vp_bdLeftOn'));
            $(document).off('change', this.wrapSelector('#vp_gbLeftIndex'));
            $(document).off('change', this.wrapSelector('#vp_bdRightOn'));
            $(document).off('click', this.wrapSelector('#vp_bdRightOn'));
            $(document).off('change', this.wrapSelector('#vp_gbRightIndex'));
            $(document).off('change', this.wrapSelector('#vp_bdLeftSuffix'));
            $(document).off('change', this.wrapSelector('#vp_bdRightSuffix'));
            $(document).off('change', this.wrapSelector('#vp_bdUserOption'));
            $(document).off('change', this.wrapSelector('#vp_bdAllocateTo'));
            $(document).off('change', this.wrapSelector('#vp_bdResetIndex'));
        }

        _bindEvent() {
            super._bindEvent();
            var that = this;
            //====================================================================
            // User operation Events
            //====================================================================
            $(document).on('change', this.wrapSelector('#vp_bdType'), function() {
                var type = $(this).val();
                that.state.type = type;
                if (type == 'concat') {
                    $(that.wrapSelector('.vp-bd-type-box.concat')).show();
                    $(that.wrapSelector('.vp-bd-type-box.merge')).hide();
                    $(that.wrapSelector('#vp_bdWithoutColumn')).hide();
                } else {
                    $(that.wrapSelector('.vp-bd-type-box.merge')).show();
                    $(that.wrapSelector('.vp-bd-type-box.concat')).hide();
                    $(that.wrapSelector('#vp_bdWithoutColumn')).show();
                }
                // clear user option
                $(that.wrapSelector('#vp_bdUserOption')).val('');
                that.state.userOption = '';
            });

            //====================================================================
            // Concat box Events
            //====================================================================\
            // variable change event
            $(document).on('change', this.wrapSelector('#vp_bdVariable'), function(event) {
                var varList = event.dataList;
                that.state.concat.variable = varList;
            });

            // variable select button event
            $(document).on('click', this.wrapSelector('#vp_bdVariable'), function() {
                that.openVariablePopup($(that.wrapSelector('#vp_bdVariable')));
            });

            // join
            $(document).on('change', this.wrapSelector('#vp_bdJoin'), function() {
                that.state.concat.join = $(this).val();
            });

            // axis
            $(document).on('change', this.wrapSelector('#vp_bdAxis'), function() {
                that.state.concat.axis = $(this).val();
            });

            // sort
            $(document).on('change', this.wrapSelector('#vp_bdSort'), function() {
                that.state.concat.sort = $(this).val() == 'yes';
            });

            //====================================================================
            // Merge box Events
            //====================================================================
            // Left variable change event
            $(document).on('change', this.wrapSelector('#vp_bdLeftDataframe'), function() {
                // if variable changed, clear groupby, display
                var newVal = $(this).val();
                if (newVal != that.state.merge.left.variable) {
                    $(that.wrapSelector('#vp_bdOn')).val('');
                    $(that.wrapSelector('#vp_bdLeftOn')).val('');
                    that.state.merge.left.variable = newVal;
                    that.state.merge.left.on = [];
                    that.state.merge.on = [];
                }
            });
            // Right variable change event
            $(document).on('change', this.wrapSelector('#vp_bdRightDataframe'), function() {
                // if variable changed, clear groupby, display
                var newVal = $(this).val();
                if (newVal != that.state.merge.right.variable) {
                    $(that.wrapSelector('#vp_bdOn')).val('');
                    $(that.wrapSelector('#vp_bdRightOn')).val('');
                    that.state.merge.right.variable = newVal;
                    that.state.merge.right.on = [];
                    that.state.merge.on = [];
                }
            });

            // variable refresh event
            $(document).on('click', this.wrapSelector('.vp-bd-df-refresh'), function() {
                that.loadVariableList();
            });

            // how
            $(document).on('change', this.wrapSelector('#vp_bdHow'), function() {
                that.state.merge.how = $(this).val();
            });

            // on change event
            $(document).on('change', this.wrapSelector('#vp_bdOn'), function(event) {
                var colList = event.dataList;
                that.state.merge.on = colList;
                
                if (colList && colList.length > 0) {
                    $(that.wrapSelector('#vp_bdLeftOn')).attr('disabled', true);
                    $(that.wrapSelector('#vp_bdRightOn')).attr('disabled', true);
                    $(that.wrapSelector('#vp_bdLeftIndex')).attr('disabled', true);
                    $(that.wrapSelector('#vp_bdRightIndex')).attr('disabled', true);
                } else {
                    $(that.wrapSelector('#vp_bdLeftOn')).attr('disabled', false);
                    $(that.wrapSelector('#vp_bdRightOn')).attr('disabled', false);
                    $(that.wrapSelector('#vp_bdLeftIndex')).attr('disabled', false);
                    $(that.wrapSelector('#vp_bdRightIndex')).attr('disabled', false);
                }
            });

            // on select button event
            $(document).on('click', this.wrapSelector('#vp_bdOn'), function() {
                var targetVariable = [ that.state.merge.left.variable, that.state.merge.right.variable ];
                that.openColumnPopup(targetVariable, $(that.wrapSelector('#vp_bdOn')), 'Select columns from both dataframe');
            });

            // Left on change event
            $(document).on('change', this.wrapSelector('#vp_bdLeftOn'), function(event) {
                var colList = event.dataList;
                that.state.merge.left.on = colList;
                
                if ((colList && colList.length > 0)
                    || that.state.merge.right.on && that.state.merge.right.on.length > 0) {
                    $(that.wrapSelector('#vp_bdOn')).attr('disabled', true);
                } else {
                    $(that.wrapSelector('#vp_bdOn')).attr('disabled', false);
                }
            });

            // Left on select button event
            $(document).on('click', this.wrapSelector('#vp_bdLeftOn'), function() {
                var targetVariable = [ that.state.merge.left.variable ];
                that.openColumnPopup(targetVariable, $(that.wrapSelector('#vp_bdLeftOn')), 'Select columns from left dataframe');
            });

            // Left use index
            $(document).on('change', this.wrapSelector('#vp_bdLeftIndex'), function() {
                var useIndex = $(this).prop('checked');
                that.state.merge.left.useIndex = useIndex;

                if (useIndex || that.state.merge.right.useIndex) {
                    $(that.wrapSelector('#vp_bdOn')).attr('disabled', true);
                    $(that.wrapSelector('#vp_bdLeftOn')).attr('disabled', true);
                } else {
                    $(that.wrapSelector('#vp_bdOn')).attr('disabled', false);
                    $(that.wrapSelector('#vp_bdLeftOn')).attr('disabled', false);
                }
            });

            // Right on change event
            $(document).on('change', this.wrapSelector('#vp_bdRightOn'), function(event) {
                var colList = event.dataList;
                that.state.merge.right.on = colList;
                
                if ((colList && colList.length > 0)
                    || that.state.merge.left.on && that.state.merge.left.on.length > 0) {
                    $(that.wrapSelector('#vp_bdOn')).attr('disabled', true);
                } else {
                    $(that.wrapSelector('#vp_bdOn')).attr('disabled', false);
                }
            });

            // Right on select button event
            $(document).on('click', this.wrapSelector('#vp_bdRightOn'), function() {
                var targetVariable = [ that.state.merge.right.variable ];
                that.openColumnPopup(targetVariable, $(that.wrapSelector('#vp_bdRightOn')), 'Select columns from right dataframe');
            });

            // Right use index
            $(document).on('change', this.wrapSelector('#vp_bdRightIndex'), function() {
                var useIndex = $(this).prop('checked');
                that.state.merge.right.useIndex = useIndex;

                if (useIndex || that.state.merge.left.useIndex) {
                    $(that.wrapSelector('#vp_bdOn')).attr('disabled', true);
                    $(that.wrapSelector('#vp_bdRightOn')).attr('disabled', true);
                } else {
                    $(that.wrapSelector('#vp_bdOn')).attr('disabled', false);
                    $(that.wrapSelector('#vp_bdRightOn')).attr('disabled', false);
                }
            });

            // Left suffix change event
            $(document).on('change', this.wrapSelector('#vp_bdLeftSuffix'), function() {
                that.state.merge.left.suffix = $(this).val();
            });

            // Right suffix change event
            $(document).on('change', this.wrapSelector('#vp_bdRightSuffix'), function() {
                that.state.merge.right.suffix = $(this).val();
            });

            // userOption event
            $(document).on('change', this.wrapSelector('#vp_bdUserOption'), function() {
                that.state.userOption = $(this).val();
            });

            // allocateTo event
            $(document).on('change', this.wrapSelector('#vp_bdAllocateTo'), function() {
                that.state.allocateTo = $(this).val();
            });
            
            // reset index checkbox event
            $(document).on('change', this.wrapSelector('#vp_bdResetIndex'), function() {
                that.state.resetIndex = $(this).prop('checked');
            });

            // with/without column select event
            $(this.wrapSelector('#vp_bdWithoutColumn')).on('change', function() {
                that.state.withoutColumn = $(this).val();
            });
        }

        templateForBody() {
            return bindHtml;
        }

        templateForDataView() {
            return '';
        }

        renderDataView() {
            super.renderDataView();

            this.loadDataPage();
            $(this.wrapSelector('.vp-popup-dataview-box')).css('height', '300px');
        }

        renderDataPage(renderedText, isHtml = true) {
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} vp-close-on-blur vp-scrollbar">', 'rendered_html'); // 'rendered_html' style from jupyter output area
            if (isHtml) {
                tag.appendLine(renderedText);
            } else {
                tag.appendFormatLine('<pre>{0}</pre>', renderedText);
            }
            tag.appendLine('</div>');
            $(this.wrapSelector('.vp-popup-dataview-box')).html(tag.toString());
        }

        loadDataPage() {
            var that = this;
            var code = this.generateCode();
            // if not, get output of all data in selected pandasObject
            vpKernel.execute(code).then(function(resultObj) {
                let { msg } = resultObj;
                if (msg.content.data) {
                    var htmlText = String(msg.content.data["text/html"]);
                    var codeText = String(msg.content.data["text/plain"]);
                    if (htmlText != 'undefined') {
                        that.renderDataPage(htmlText);
                    } else if (codeText != 'undefined') {
                        // plain text as code
                        that.renderDataPage(codeText, false);
                    } else {
                        that.renderDataPage('');
                    }
                } else {
                    var errorContent = '';
                    if (msg.content.ename) {
                        errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                    }
                    that.renderDataPage(errorContent);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                }
            }).catch(function(resultObj) {
                let { msg } = resultObj;
                var errorContent = '';
                if (msg.content.ename) {
                    errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                }
                that.renderDataPage(errorContent);
                vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
            });
        }

        render() {
            super.render();

            // check its type
            if (this.state.type === 'concat') {
                $(this.wrapSelector('#vp_bdWithoutColumn')).hide();
            } else {
                $(this.wrapSelector('#vp_bdWithoutColumn')).hide();
            }

            this.loadVariableList();
        }

        /**
         * Render variable list (for dataframe)
         * @param {Array<object>} varList
         * @param {string} defaultValue previous value
         */
        renderVariableList(id, varList, defaultValue='') {
            let mappedList = varList.map(obj => { return { label: obj.varName, value: obj.varName, dtype: obj.varType } });

            var variableInput = new SuggestInput();
            variableInput.setComponentID(id);
            variableInput.addClass('vp-state');
            variableInput.setPlaceholder('Select variable');
            variableInput.setSuggestList(function () { return mappedList; });
            variableInput.setNormalFilter(true);
            variableInput.setValue(defaultValue);
            variableInput.addAttribute('required', true);
            $(this.wrapSelector('#' + id)).replaceWith(function() {
                return variableInput.toTagString();
            });
        }

        /**
         * Load variable list (dataframe)
         */
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
                    var prevValue = that.state.merge.left.variable;
                    // replace
                    that.renderVariableList('vp_bdLeftDataframe', varList, prevValue);
                    $(that.wrapSelector('#vp_bdLeftDataframe')).trigger('change');

                    prevValue = that.state.merge.right.variable;
                    that.renderVariableList('vp_bdRightDataframe', varList, prevValue);
                    $(that.wrapSelector('#vp_bdRightDataframe')).trigger('change');
                } catch (ex) {
                    vpLog.display(VP_LOG_TYPE.ERROR, 'Bind:', result);
                }
            });
        }

        generateCode() {
            var code = new com_String();
            var {
                type, concat, merge, allocateTo, resetIndex, withoutColumn, userOption
            } = this.state;

            //====================================================================
            // Allocation
            //====================================================================
            if (allocateTo && allocateTo != '') {
                code.appendFormat('{0} = ', allocateTo);
            }

            //====================================================================
            // Dataframe variables
            //====================================================================
            code.appendFormat('pd.{0}(', type);

            if (type == 'concat') {
                //====================================================================
                // Concat
                //====================================================================
                // FIXME: consider default
                code.appendFormat("[{0}], join='{1}', axis={2}", concat.variable.map(data=>data.code).join(','), concat.join, concat.axis);

                //====================================================================
                // Sort
                //====================================================================
                if (concat.sort) {
                    code.append(', sort=True');
                }

                //====================================================================
                // Reset index
                //====================================================================
                if (resetIndex) {
                    code.append(', ignore_index=True');
                }

                //====================================================================
                // User option
                //====================================================================
                if (userOption && userOption != '') {
                    code.appendFormat(", {0}", userOption);
                }

                code.append(')');

            } else {
                //====================================================================
                // Merge
                //====================================================================
                code.appendFormat('{0}, {1}', merge.left.variable, merge.right.variable);
    
                if (merge.on && merge.on.length > 0) {
                    //================================================================
                    // On columns
                    //================================================================
                    code.appendFormat(', on=[{0}]', merge.on.map(col => col.code));
                } else {
                    //====================================================================
                    // Left & Right On columns
                    //====================================================================
                    if (merge.left.useIndex) {
                        code.append(', left_index=True');
                    } else {
                        if (merge.left.on && merge.left.on.length > 0) {
                            code.appendFormat(', left_on=[{0}]', merge.left.on.map(col => col.code));
                        } 
                    }
    
                    if (merge.right.useIndex) {
                        code.append(', right_index=True');
                    } else {
                        if (merge.right.on && merge.right.on.length > 0) {
                            code.appendFormat(', right_on=[{0}]', merge.right.on.map(col => col.code));
                        } 
                    }
                }
                //====================================================================
                // How
                //====================================================================
                if (merge.how) {
                    code.appendFormat(", how='{0}'", merge.how);
                }
    
                //====================================================================
                // Suffixes
                //====================================================================
                if (merge.left.suffix != '' || merge.right.suffix != '') {
                    code.appendFormat(", suffixes=('{0}', '{1}')", merge.left.suffix, merge.right.suffix);
                }
    
                //====================================================================
                // User option
                //====================================================================
                if (userOption && userOption != '') {
                    code.appendFormat(", {0}", userOption);
                }

                code.append(')');

                //====================================================================
                // Reset index
                //====================================================================
                if (resetIndex) {
                    if (withoutColumn === 'True') {
                        code.append('.reset_index(drop=True)');
                    } else {
                        code.append('.reset_index()');
                    }
                }
            }

            if (allocateTo && allocateTo != '') {
                code.appendLine();
                code.append(allocateTo);
            }
            
            return code.toString();
        }

        loadState() {
            var {
                type, concat, merge, userOption, allocateTo, resetIndex, withoutColumn
            } = this.state;

            // type
            $(this.wrapSelector('#vp_bdType')).val(type);

            if (type == 'concat') {
                // load concat state
                this._loadSelectorInput(this.wrapSelector('#vp_bdVariable'), concat.variable);
                $(this.wrapSelector('#vp_bdJoin')).val(concat.join);
                $(this.wrapSelector('#vp_bdAxis')).val(concat.axis);
                $(this.wrapSelector('#vp_bdSort')).val(concat.sort?'yes':'no');

            } else {
                // load merge state
                $(this.wrapSelector('#vp_bdLeftDataframe')).val(merge.left.variable);
                $(this.wrapSelector('#vp_mpRightDataframe')).val(merge.right.variable);
    
                $(this.wrapSelector('#vp_bdHow')).val(merge.how);
                this._loadSelectorInput(this.wrapSelector('#vp_bdOn'), merge.on);
                if (merge.on && merge.on.length > 0) {
                    $(this.wrapSelector('#vp_bdLeftOn')).attr('disabled', true);
                    $(this.wrapSelector('#vp_bdRightOn')).attr('disabled', true);
                    $(this.wrapSelector('#vp_bdLeftIndex')).attr('disabled', true);
                    $(this.wrapSelector('#vp_bdRightIndex')).attr('disabled', true);
                }
                this._loadSelectorInput(this.wrapSelector('#vp_bdLeftOn'), merge.left.on);
                this._loadSelectorInput(this.wrapSelector('#vp_bdRightOn'), merge.right.on);
                if (merge.left.on.length > 0 || merge.right.on.length > 0 
                    || merge.left.useIndex || merge.right.useIndex) {
                    $(this.wrapSelector('#vp_bdOn')).attr('disabled', true);
                }
    
                $(this.wrapSelector('#vp_bdLeftIndex')).prop('checked', merge.left.useIndex);
                $(this.wrapSelector('#vp_bdRightIndex')).prop('checked', merge.right.useIndex);
    
                $(this.wrapSelector('#vp_bdLeftSuffix')).val(merge.left.suffix);
                $(this.wrapSelector('#vp_bdRightSuffix')).val(merge.right.suffix);
            }
            $(this.wrapSelector('#vp_bdUserOption')).val(userOption);
            $(this.wrapSelector('#vp_bdAllocateTo')).val(allocateTo);
            $(this.wrapSelector('#vp_bdResetIndex')).prop('checked', resetIndex);
            $(this.wrapSelector('#vp_bdWithoutColumn')).val(withoutColumn);

            $(this.wrapSelector('.vp-bd-type-box')).hide();
            $(this.wrapSelector('.vp-bd-type-box.' + type)).show();
            
        }

        _loadSelectorInput(tag, dataList) {
            $(tag).val(dataList.map(data=>data.code).join(','));
            $(tag).data('list', dataList)
        }

        /**
         * Open Inner popup page for variable selection
         * @param {Object} targetSelector 
         */
        openVariablePopup(targetSelector) {
            this.popup.targetSelector = targetSelector;
            var previousList = this.popup.targetSelector.data('list');
            if (previousList) {
                previousList = previousList.map(data => data.code)
            }
            this.popup.MultiSelector = new MultiSelector(
                this.wrapSelector('.vp-inner-popup-body'), 
                { mode: 'variable', type: ['DataFrame', 'Series'], selectedList: previousList }
            );

            this.openInnerPopup('Select variables');
        }

        /**
         * Open Inner popup page for column selection
         * @param {Array<string>} targetVariable 
         * @param {Object} targetSelector 
         * @param {string} title
         */
        openColumnPopup(targetVariable, targetSelector, title='Select Columns') {
            this.popup.targetVariable = targetVariable;
            this.popup.targetSelector = targetSelector;
            var previousList = this.popup.targetSelector.data('list');
            if (previousList) {
                previousList = previousList.map(col => col.code)
            }

            this.popup.MultiSelector = new MultiSelector(
                this.wrapSelector('.vp-inner-popup-body'), 
                { mode: 'columns', parent: targetVariable, selectedList: previousList }
            );
    
            this.openInnerPopup(title);
        }

        handleInnerOk() {
            // ok input popup
            var dataList = this.popup.MultiSelector.getDataList();

            $(this.popup.targetSelector).val(dataList.map(data => { return data.code }).join(','));
            $(this.popup.targetSelector).data('list', dataList);
            $(this.popup.targetSelector).trigger({ type: 'change', dataList: dataList });
            this.closeInnerPopup();
        }
    }

    return Bind;
});