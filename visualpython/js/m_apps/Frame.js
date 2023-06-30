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
    __VP_TEXT_LOADER__('vp_base/html/m_apps/frame.html'),   // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_apps/frame'),          // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/m_apps/Subset'
], function(frameHtml, frameCss, com_Const, com_String, com_util, PopupComponent, SuggestInput, DataSelector, Subset) {

    /**
     * Frame
     */
    class Frame extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 4;
            this.config.checkModules = ['pd'];

            // state
            this.state = {
                originObj: '',
                tempObj: '_vp',
                returnObj: '_vp',
                inplace: false,
                menu: '',
                menuItem: '',
                columnLevel: 1,
                columnList: [],
                indexLevel: 1,
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
                'object', 'int64', 'float64', 'bool', 
                'datetime64[ns]', 'timedelta[ns]', 'category'
            ];

            // {
            //     id: 'id',
            //     label: 'menu label',
            //     child: [
            //         { 
            //             id: 'id', label: 'label', code: 'code', 
            //             axis: 'col/row', single_select: true/false,
            //             numeric_only: true/false 
            //         }
            //     ]
            // }
            this.menuList = [
                {
                    id: 'edit',
                    label: 'Edit',
                    child: [
                        { id: 'add_col', label: 'Add column', selection: FRAME_SELECT_TYPE.NONE, menuType: FRAME_EDIT_TYPE.ADD_COL },
                        { id: 'add_row', label: 'Add row', selection: FRAME_SELECT_TYPE.NONE, menuType: FRAME_EDIT_TYPE.ADD_ROW },
                        { id: 'delete', label: 'Delete', selection: FRAME_SELECT_TYPE.MULTI, menuType: FRAME_EDIT_TYPE.DROP },
                        { id: 'rename', label: 'Rename', selection: FRAME_SELECT_TYPE.NONE, menuType: FRAME_EDIT_TYPE.RENAME },
                        { id: 'asType', label: 'As type', selection: FRAME_SELECT_TYPE.NONE, axis: FRAME_AXIS.COLUMN, menuType: FRAME_EDIT_TYPE.AS_TYPE },
                        { id: 'replace', label: 'Replace', selection: FRAME_SELECT_TYPE.SINGLE, axis: FRAME_AXIS.COLUMN, menuType: FRAME_EDIT_TYPE.REPLACE },
                        { id: 'discretize', label: 'Discretize', selection: FRAME_SELECT_TYPE.SINGLE, axis: FRAME_AXIS.COLUMN, numeric_only: true, menuType: FRAME_EDIT_TYPE.DISCRETIZE }
                    ]
                },
                {
                    id: 'transform',
                    label: 'Transform',
                    child: [
                        { id: 'set_index', label: 'Set index', axis: FRAME_AXIS.COLUMN, selection: FRAME_SELECT_TYPE.MULTI, menuType: FRAME_EDIT_TYPE.SET_IDX },
                        { id: 'reset_index', label: 'Reset index', selection: FRAME_SELECT_TYPE.NONE, menuType: FRAME_EDIT_TYPE.RESET_IDX },
                        { id: 'data_shift', label: 'Data shift', axis: FRAME_AXIS.COLUMN, selection: FRAME_SELECT_TYPE.NONE, menuType: FRAME_EDIT_TYPE.DATA_SHIFT }
                    ]
                },
                {
                    id: 'sort',
                    label: 'Sort',
                    axis: FRAME_AXIS.COLUMN,
                    child: [
                        { id: 'sort_index', label: 'Sort index', selection: FRAME_SELECT_TYPE.NONE, menuType: FRAME_EDIT_TYPE.SORT_INDEX },
                        { id: 'sort_values', label: 'Sort values', axis: FRAME_AXIS.COLUMN, selection: FRAME_SELECT_TYPE.MULTI, menuType: FRAME_EDIT_TYPE.SORT_VALUES },
                    ]
                },
                {
                    id: 'encoding',
                    label: 'Encoding',
                    axis: FRAME_AXIS.COLUMN,
                    selection: FRAME_SELECT_TYPE.SINGLE, 
                    child: [
                        { id: 'label_encoding', label: 'Label encoding', axis: FRAME_AXIS.COLUMN, selection: FRAME_SELECT_TYPE.SINGLE, menuType: FRAME_EDIT_TYPE.LABEL_ENCODING },
                        { id: 'one_hot_encoding', label: 'Onehot encoding', axis: FRAME_AXIS.COLUMN, selection: FRAME_SELECT_TYPE.SINGLE, menuType: FRAME_EDIT_TYPE.ONE_HOT_ENCODING },
                    ]
                },
                {
                    id: 'data_cleaning',
                    label: 'Data cleaning',
                    axis: FRAME_AXIS.COLUMN,
                    child: [
                        { id: 'fillna', label: 'Fill NA', axis: FRAME_AXIS.COLUMN, selection: FRAME_SELECT_TYPE.NONE, menuType: FRAME_EDIT_TYPE.FILL_NA },
                        { id: 'dropna', label: 'Drop NA', axis: FRAME_AXIS.COLUMN, selection: FRAME_SELECT_TYPE.NONE, menuType: FRAME_EDIT_TYPE.DROP_NA },
                        { id: 'fill_outlier', label: 'Fill outlier', axis: FRAME_AXIS.COLUMN, selection: FRAME_SELECT_TYPE.MULTI, menuType: FRAME_EDIT_TYPE.FILL_OUT },
                        { id: 'drop_outlier', label: 'Drop outlier', axis: FRAME_AXIS.COLUMN, selection: FRAME_SELECT_TYPE.MULTI, menuType: FRAME_EDIT_TYPE.DROP_OUT },
                        { id: 'drop_duplicates', label: 'Drop duplicates', axis: FRAME_AXIS.COLUMN, selection: FRAME_SELECT_TYPE.NONE, menuType: FRAME_EDIT_TYPE.DROP_DUP },
                    ]
                },
            ];

            // Add/Replace - subset
            this.subsetCm = null;
            this.subsetEditor = null;

            this.loading = false;

            // this._addCodemirror('previewCode', this.wrapSelector('#vp_fePreviewCode'), 'readonly');
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

            // menu on column (Deprecated on v2.3.6 - Temporarily Show on v.2.4.2)
            $(document).on('contextmenu', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN), function(event) {
                event.preventDefault();

                var idx = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN)).index(this); // 1 ~ n
                var hasSelected = $(this).hasClass('selected');
                $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW)).removeClass('selected');
                // select col/idx
                if (!hasSelected) {
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN)).removeClass('selected');
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN_GROUP)).removeClass('selected');

                    $(this).addClass('selected');
                    that.state.selection = { start: idx, end: -1 };
                    var newAxis = $(this).data('axis');
                    that.state.axis = newAxis;
                }
                // select its group
                $(that.wrapSelector(`.${VP_FE_TABLE} th[data-label="${$(this).data('parent')}"]`)).addClass('selected');

                that.loadInfo();
                // load toolbar
                that.renderToolbar();

                // show menu
                var thisPos = $(this).position();
                var thisRect = $(this)[0].getBoundingClientRect();
                that.showMenu(thisPos.left, thisPos.top + thisRect.height);
            });

            // menu on row (Deprecated on v2.3.6 - Temporarily Show on v.2.4.2)
            $(document).on('contextmenu', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW), function(event) {
                event.preventDefault();
                var idx = $(that.wrapSelector('.' + VP_FE_TABLE_ROW)).index(this); // 0 ~ n
                var hasSelected = $(this).hasClass('selected');
                $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN)).removeClass('selected');
                // select col/idx
                if (!hasSelected) {
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW)).removeClass('selected');
                    $(this).addClass('selected');
                    that.state.selection = { start: idx, end: -1 };
                    var newAxis = $(this).data('axis');
                    that.state.axis = newAxis;
                }

                that.loadInfo();
                // load toolbar
                that.renderToolbar();

                // show menu
                var thisPos = $(this).position();
                var thisRect = $(this)[0].getBoundingClientRect();
                var tblPos = $(that.wrapSelector('.' + VP_FE_TABLE)).position();
                var scrollTop = $(that.wrapSelector('.' + VP_FE_TABLE)).scrollTop();
                that.showMenu(tblPos.left + thisRect.width, tblPos.top + thisPos.top - scrollTop);
            });

            // un-select every selection and menu box
            $(document).on('click', this.wrapSelector('.vp-fe-table'), function(evt) {
                evt.stopPropagation();
                var target = evt.target;
                if ($('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN).find(target).length == 0 
                    && !$(target).hasClass('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN) ) {
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW)).removeClass('selected');
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN)).removeClass('selected');
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN_GROUP)).removeClass('selected');
                    $(that.wrapSelector('.vp-fe-menu-box')).hide();
    
                    // reset selected columns/indexes
                    that.state.axis = FRAME_AXIS.NONE;
                    that.state.selected = [];
                    // load toolbar
                    that.renderToolbar();
                }
            });

            // select column group
            $(document).on('click', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN_GROUP), function(evt) {
                evt.stopPropagation();

                let hasSelected = $(this).hasClass('selected');
                let colLabel = $(this).data('label');
                let firstIdx = $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${colLabel}"]:first`)).index();
                let lastIdx = $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${colLabel}"]:last`)).index();
                if (firstIdx === lastIdx) {
                    lastIdx = -1;
                }

                $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW)).removeClass('selected');

                if (vpEvent.keyManager.keyCheck.ctrlKey) {
                    if (!hasSelected) {
                        that.state.selection = { start: firstIdx, end: -1 };
                        $(this).addClass('selected');
                        $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${colLabel}"]`)).addClass('selected');
                        var newAxis = $(this).data('axis');
                        that.state.axis = newAxis;
                    } else {
                        $(this).removeClass('selected');
                        $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${colLabel}"]`)).removeClass('selected');
                    }
                } else if (vpEvent.keyManager.keyCheck.shiftKey) {
                    var axis = that.state.axis;
                    var startIdx = that.state.selection.start;
                    if (axis != FRAME_AXIS.COLUMN) {
                        startIdx = -1;
                    }
                    
                    if (startIdx == -1) {
                        // no selection
                        that.state.selection = { start: firstIdx, end: -1 };
                    } else if (startIdx > firstIdx) {
                        // add selection from idx to startIdx
                        var tags = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN));
                        let parentSet = new Set();
                        for (var i = firstIdx - 1; i <= startIdx; i++) {
                            $(tags[i]).addClass('selected');
                            parentSet.add($(tags[i]).data('parent'));
                        }
                        parentSet.forEach(parentKey => {
                            let length = $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${parentKey}"]`)).length;
                            let selectedLength = $(that.wrapSelector(`.${VP_FE_TABLE} th.selected[data-parent="${parentKey}"]`)).length;
                            if (length === selectedLength) {
                                $(that.wrapSelector(`.${VP_FE_TABLE} th[data-label="${parentKey}"]`)).addClass('selected');
                            } else {
                                $(that.wrapSelector(`.${VP_FE_TABLE} th[data-label="${parentKey}"]`)).removeClass('selected');
                            }
                        });
                        that.state.selection = { start: startIdx, end: firstIdx };
                    } else if (startIdx <= firstIdx) {
                        // add selection from startIdx to idx
                        var tags = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN));
                        let parentSet = new Set();
                        for (var i = startIdx; i < lastIdx; i++) {
                            $(tags[i]).addClass('selected');
                            parentSet.add($(tags[i]).data('parent'));
                        }
                        parentSet.forEach(parentKey => {
                            let length = $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${parentKey}"]`)).length;
                            let selectedLength = $(that.wrapSelector(`.${VP_FE_TABLE} th.selected[data-parent="${parentKey}"]`)).length;
                            if (length === selectedLength) {
                                $(that.wrapSelector(`.${VP_FE_TABLE} th[data-label="${parentKey}"]`)).addClass('selected');
                            } else {
                                $(that.wrapSelector(`.${VP_FE_TABLE} th[data-label="${parentKey}"]`)).removeClass('selected');
                            }
                        });
                        that.state.selection = { start: startIdx, end: lastIdx };
                    }
                } else {
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN)).removeClass('selected');
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN_GROUP)).removeClass('selected');

                    $(this).addClass('selected');
                    $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${colLabel}"]`)).addClass('selected');
                    that.state.selection = { start: firstIdx, end: lastIdx };
                    var newAxis = $(this).data('axis');
                    that.state.axis = newAxis;
                }
                that.loadInfo();
                // load toolbar
                that.renderToolbar();
            });

            /**
             * Drag and drop selection TODO: release for later version v2.3.8
             */
            // drag start column
            // $(document).on('mousedown', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN), function(evt) {
            //     var idx = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN)).index(this); // 1 ~ n
            //     that.state.axis = FRAME_AXIS.COLUMN;
            //     that.state.selection = { start: idx, end: -1 };
            //     that.isMouseDown = true;
            //     console.log('down');

            //     $(document).on('mouseover', that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN), function(evt) {
            //         evt.stopPropagation();
            //         var idx = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN)).index(this); // 1 ~ n
            //         var axis = that.state.axis;
            //         var startIdx = that.state.selection.start;
            //         if (that.isMouseDown === true) {
            //             if (axis === FRAME_AXIS.ROW) {
            //                 startIdx = -1;
            //             }
                        
            //             if (startIdx == -1) {
            //                 // no selection
            //                 that.state.selection = { start: idx, end: -1 };
            //             } else if (startIdx > idx) {
            //                 // add selection from idx to startIdx
            //                 var tags = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN));
            //                 for (var i = idx; i <= startIdx; i++) {
            //                     $(tags[i]).addClass('selected');
            //                 }
            //                 that.state.selection = { start: startIdx, end: idx };
            //             } else if (startIdx <= idx) {
            //                 // add selection from startIdx to idx
            //                 var tags = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN));
            //                 for (var i = startIdx; i <= idx; i++) {
            //                     $(tags[i]).addClass('selected');
            //                 }
            //                 that.state.selection = { start: startIdx, end: idx };
            //             }

            //             that.loadInfo();
            //             // load toolbar
            //             that.renderToolbar();
            //         }
            //     });
            // });

            // $(document).on('mouseup', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN), function(evt) {
            //     that.isMouseDown = false;
            //     console.log('up');
            //     $(document).off('mouseover', that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN));
            // });

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
                    if (axis === FRAME_AXIS.ROW) {
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
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN_GROUP)).removeClass('selected');

                    $(this).addClass('selected');
                    that.state.selection = { start: idx, end: -1 };
                    var newAxis = $(this).data('axis');
                    that.state.axis = newAxis;
                }
                // select its group
                $(that.wrapSelector(`.${VP_FE_TABLE} th[data-label="${$(this).data('parent')}"]`)).addClass('selected');

                that.loadInfo();
                // load toolbar
                that.renderToolbar();
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
                // load toolbar
                that.renderToolbar();
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

            // click toolbar item (Deprecated on v2.3.6 - Temporarily Show on v.2.4.2)
            $(document).on('click', this.wrapSelector('.vp-fe-toolbar-item'), function(evt) {
                evt.stopPropagation();
                var itemType = $(this).data('type');
                switch (parseInt(itemType)) {
                    case FRAME_EDIT_TYPE.ADD_COL:
                    case FRAME_EDIT_TYPE.ADD_ROW:
                        that.openInputPopup(itemType);
                        break;
                }
            });

            // click menu item
            $(document).on('click', this.wrapSelector('.' + VP_FE_MENU_ITEM + ':not(.disabled)'), function(event) {
                event.stopPropagation();
                var editType = $(this).data('type');
                switch (parseInt(editType)) {
                    case FRAME_EDIT_TYPE.ADD_COL:
                    case FRAME_EDIT_TYPE.ADD_ROW:
                    case FRAME_EDIT_TYPE.RENAME:
                    case FRAME_EDIT_TYPE.REPLACE:
                    case FRAME_EDIT_TYPE.AS_TYPE:
                    case FRAME_EDIT_TYPE.DISCRETIZE:
                    case FRAME_EDIT_TYPE.DATA_SHIFT:
                    case FRAME_EDIT_TYPE.SORT_INDEX:
                    case FRAME_EDIT_TYPE.SORT_VALUES:
                    case FRAME_EDIT_TYPE.FILL_NA:
                    case FRAME_EDIT_TYPE.DROP_NA:
                    case FRAME_EDIT_TYPE.DROP_DUP:
                    case FRAME_EDIT_TYPE.FILL_OUT:
                    case FRAME_EDIT_TYPE.DROP_OUT:
                    case FRAME_EDIT_TYPE.DROP: 
                        // open inner popup
                        that.openInputPopup(editType);
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
                        var { list } = JSON.parse(result);
                        var tag = new com_String();
                        tag.appendFormatLine('<select class="{0}">', 'vp-inner-popup-var1col');
                        list && list.forEach(col => {
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
                        var { list } = JSON.parse(result);
                        var tag = new com_String();
                        tag.appendFormatLine('<select class="{0}">', 'vp-inner-popup-var2col');
                        list && list.forEach(col => {
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
            if (type === FRAME_EDIT_TYPE.ADD_COL 
                || type === FRAME_EDIT_TYPE.ADD_ROW) {
                if (content.name === '' || content.name === "''") {
                    $(this.wrapSelector('.vp-inner-popup-input0')).focus();
                    return;
                }
            } else if (type === FRAME_EDIT_TYPE.REPLACE) {
                if (content.replacetype === 'condition' && content.value === '') {
                    $(this.wrapSelector('.vp-inner-popup-input3')).focus();
                    return;
                }
            } else if (type === FRAME_EDIT_TYPE.FILL_NA) {
                if (content.method === 'value' && content.value === '') {
                    $(this.wrapSelector('.vp-inner-popup-value')).focus();
                    return;
                }
            } else if (type === FRAME_EDIT_TYPE.FILL_OUT) {
                if (content.filltype === 'value' && content.fillvalue === '') {
                    $(this.wrapSelector('.vp-inner-popup-fillvalue')).focus();
                    return;
                }
            }
            // run check modules for outliers and load codes
            if (type === FRAME_EDIT_TYPE.FILL_OUT) {
                this.config.checkModules = ['pd', 'np', 'vp_fill_outlier'];
                let that = this;
                this.checkAndRunModules(true).then(function() {
                    that.loadCode(that.getTypeCode(that.state.popup.type, content));
                });
            } else if (type === FRAME_EDIT_TYPE.DROP_OUT) {
                this.config.checkModules = ['pd', 'np', 'vp_drop_outlier'];
                let that = this;
                this.checkAndRunModules(true).then(function() {
                    that.loadCode(that.getTypeCode(that.state.popup.type, content));
                });
            } else {
                var code = this.loadCode(this.getTypeCode(this.state.popup.type, content));
                if (code == '') {
                    return;
                }
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
            $(document).off('click', this.wrapSelector('.vp-popup-body'));
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

        bindEventForPopupPage(menuType) {
            var that = this;

            if (menuType === FRAME_EDIT_TYPE.ADD_COL
                || menuType === FRAME_EDIT_TYPE.ADD_ROW
                || menuType === FRAME_EDIT_TYPE.REPLACE) {
                // Add page
                if (menuType === FRAME_EDIT_TYPE.ADD_COL
                    || menuType === FRAME_EDIT_TYPE.ADD_ROW) {
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

                    $(document).off('change', this.wrapSelector('.vp-inner-popup-vartype'));
                    $(document).on('change', this.wrapSelector('.vp-inner-popup-vartype'), function() {
                        var type = $(this).val();
                        $(this).closest('tr').find('.vp-inner-popup-vartype-box').hide();
                        $(this).closest('tr').find('.vp-inner-popup-vartype-box.' + type).show();
                    });

                    // 4. apply
                    $(this.wrapSelector('.vp-inner-popup-apply-column')).on('change', function() {
                        // TODO: change apply-condition (save value)

                    });

                    $(this.wrapSelector('.vp-inner-popup-toggle-else')).on('click', function() {
                        // toggle else on/off
                        let elseOn = $(this).attr('data-else'); // on / off
                        if (elseOn === 'off') {
                            // off -> on
                            $(this).attr('data-else', 'on');
                            $(this).text('Else off');
                            $(that.wrapSelector('.vp-inner-popup-apply-else-value')).prop('disabled', false);
                            $(that.wrapSelector('.vp-inner-popup-apply-else-usetext')).prop('disabled', false);
                        } else {
                            // on -> off
                            $(this).attr('data-else', 'off');
                            $(this).text('Else on');
                            $(that.wrapSelector('.vp-inner-popup-apply-else-value')).prop('disabled', true);
                            $(that.wrapSelector('.vp-inner-popup-apply-else-usetext')).prop('disabled', true);
                        }
                    });

                    $(this.wrapSelector('.vp-inner-popup-add-case')).on('click', function() {
                        // add case
                        $(this).parent().find('.vp-inner-popup-apply-case-box').append($(that.templateForApplyCase()));
                    });

                    $(document).off('click', this.wrapSelector('.vp-inner-popup-apply-add-cond'));
                    $(document).on('click', this.wrapSelector('.vp-inner-popup-apply-add-cond'), function() {
                        // add condition
                        $(this).parent().find('.vp-inner-popup-apply-cond-box').append($(that.templateForApplyCondition()));
                        // show operator except last operator
                        $(this).parent().find('.vp-inner-popup-apply-oper-connect:not(:last)').show();
                    });

                    $(document).off('click', this.wrapSelector('.vp-inner-popup-apply-del-cond'));
                    $(document).on('click', this.wrapSelector('.vp-inner-popup-apply-del-cond'), function() {
                        // hide last operator
                        $(this).closest('.vp-inner-popup-apply-cond-box').find('.vp-inner-popup-apply-oper-connect:last').hide();
                        // delete apply cond
                        $(this).parent().remove();
                    });

                    $(document).off('click', this.wrapSelector('.vp-inner-popup-apply-del-case'));
                    $(document).on('click', this.wrapSelector('.vp-inner-popup-apply-del-case'), function() {
                        // delete apply case
                        $(this).parent().remove();
                    });
                }

                // Replace page
                if (menuType === FRAME_EDIT_TYPE.REPLACE) {
                    $(this.wrapSelector('.vp-inner-popup-replacetype')).on('change', function() {
                        var tab = $(this).val();
                        $(that.wrapSelector('.vp-inner-popup-tab')).hide();
                        $(that.wrapSelector('.vp-inner-popup-tab.' + tab)).show();
                    });
                }

                // Add & Replace page
                // condition add
                $(document).off('click', this.wrapSelector('.vp-inner-popup-add-cond'));
                $(document).on('click', this.wrapSelector('.vp-inner-popup-add-cond'), function (event) {
                    that.handleConditionAdd();
                });

                // condition delete
                $(document).off('click', this.wrapSelector('.vp-inner-popup-del-cond'));
                $(document).on('click', this.wrapSelector('.vp-inner-popup-del-cond'), function (event) {
                    event.stopPropagation();
    
                    // clear previous one
                    $(this).closest('tr').remove();
                    $(that.wrapSelector('.vp-inner-popup-oper-connect:last')).hide();
                });

                // change column selection for condition page
                $(document).off('change', this.wrapSelector('.vp-inner-popup-col-list'));
                $(document).on('change', this.wrapSelector('.vp-inner-popup-col-list'), function () {
                    var thisTag = $(this);
                    var varName = that.state.tempObj;
                    var colName = $(this).find('option:selected').attr('data-code');
                    var colDtype = $(this).find('option:selected').attr('data-dtype');

                    var operTag = $(this).closest('td').find('.vp-inner-popup-oper-list');
                    var condTag = $(this).closest('td').find('.vp-inner-popup-condition');

                    if (colName == '.index') {
                        // index
                        $(thisTag).closest('td').find('.vp-inner-popup-cond-use-text').prop('checked', false);
                        $(operTag).replaceWith(function () {
                            return that.templateForConditionOperator('');
                        });
                        $(condTag).replaceWith(function () {
                            return that.templateForConditionCondInput([], '');
                        });
                        that.generateCode();
                    } else {
                        // get result and load column list
                        vpKernel.getColumnCategory(varName, colName).then(function (resultObj) {
                            let { result } = resultObj;
                            try {
                                var category = JSON.parse(result);
                                if (category && category.length > 0 && colDtype == 'object') {
                                    // if it's categorical column and its dtype is object, check 'Text' as default
                                    $(thisTag).closest('td').find('.vp-inner-popup-cond-use-text').prop('checked', true);
                                } else {
                                    $(thisTag).closest('td').find('.vp-inner-popup-cond-use-text').prop('checked', false);
                                }
                                $(operTag).replaceWith(function () {
                                    return that.templateForConditionOperator(colDtype);
                                });
                                $(condTag).replaceWith(function () {
                                    return that.templateForConditionCondInput(category, colDtype);
                                });
                            } catch {
                                $(thisTag).closest('td').find('.vp-inner-popup-cond-use-text').prop('checked', false);
                                $(operTag).replaceWith(function () {
                                    return that.templateForConditionOperator(colDtype);
                                });
                                $(condTag).replaceWith(function () {
                                    return that.templateForConditionCondInput([], colDtype);
                                });
                            }
                        });
                    }
                });

                // change operator selection
                $(document).off('change', this.wrapSelector('.vp-inner-popup-oper-list'));
                $(document).on('change', this.wrapSelector('.vp-inner-popup-oper-list'), function () {
                    var oper = $(this).val();
                    var condTag = $(this).closest('td').find('.vp-inner-popup-condition');
                    var useTextTag = $(this).closest('td').find('.vp-inner-popup-cond-use-text');
                    // var colDtype = $(this).closest('td').find('.vp-col-list option:selected').attr('data-dtype');

                    // if operator is isnull(), notnull(), disable condition input
                    if (oper == 'isnull()' || oper == 'notnull()') {
                        $(condTag).prop('disabled', true);
                        $(useTextTag).prop('disabled', true);
                    } else {
                        $(condTag).prop('disabled', false);
                        $(useTextTag).prop('disabled', false);
                    }
                });
            } else if (menuType === FRAME_EDIT_TYPE.DISCRETIZE) {
                // change bins
                $(this.wrapSelector('.vp-inner-popup-bins')).on('change', function() {
                    let binsCount = $(this).val();
                    that.handleDiscretizeEdges(binsCount);
                });

                // change cut to qcut(quantile based discretization)
                $(this.wrapSelector('.vp-inner-popup-discretizetype')).on('change', function() {
                    let binsCount = $(that.wrapSelector('.vp-inner-popup-bins')).val();
                    let discretizeType = $(this).val();
                    // disable right and range table
                    if (discretizeType === 'qcut') {
                        $(that.wrapSelector('.vp-inner-popup-right')).prop('disabled', true);
                        $(that.wrapSelector('.vp-inner-popup-range-table input.vp-inner-popup-left-edge')).val('');
                        $(that.wrapSelector('.vp-inner-popup-range-table input.vp-inner-popup-right-edge')).val('');
                        $(that.wrapSelector('.vp-inner-popup-range-table input:not(.vp-inner-popup-label)')).prop('disabled', true);
                    } else {
                        $(that.wrapSelector('.vp-inner-popup-right')).prop('disabled', false);
                        $(that.wrapSelector('.vp-inner-popup-range-table input.vp-inner-popup-left-edge')).val('');
                        $(that.wrapSelector('.vp-inner-popup-range-table input.vp-inner-popup-right-edge')).val('');
                        $(that.wrapSelector('.vp-inner-popup-range-table input:not(.vp-inner-popup-label)')).prop('disabled', false);
                    }
                    that.handleDiscretizeEdges(binsCount);
                });

                // change right option
                $(this.wrapSelector('.vp-inner-popup-right')).on('change', function() {
                    let binsCount = $(that.wrapSelector('.vp-inner-popup-bins')).val();
                    let right = $(this).prop('checked');
                    that.handleDiscretizeEdges(binsCount, right);
                });
            } else if (menuType === FRAME_EDIT_TYPE.SORT_INDEX 
                    || menuType === FRAME_EDIT_TYPE.SORT_VALUES) {
                $(this.wrapSelector('.vp-inner-popup-axis')).on('change', function() {
                    let axis = $(this).val();
                    if (axis === '0') {
                        axis = FRAME_AXIS.ROW;
                    } else {
                        axis = FRAME_AXIS.COLUMN;
                    }
                    $(that.wrapSelector('.vp-inner-popup-sortby')).replaceWith(that.templateForSortByBox('index', axis));
                    // re-bind events
                    $(that.wrapSelector('.vp-inner-popup-sortby-up')).on('click', function() {
                        let tag = $(this).closest('.vp-inner-popup-sortby-item');
                        tag.insertBefore(tag.prev());
                    });
                    $(that.wrapSelector('.vp-inner-popup-sortby-down')).on('click', function() {
                        let tag = $(this).closest('.vp-inner-popup-sortby-item');
                        tag.insertAfter(tag.next());
                    });
                });

                $(this.wrapSelector('.vp-inner-popup-sortby-up')).on('click', function() {
                    let tag = $(this).closest('.vp-inner-popup-sortby-item');
                    tag.insertBefore(tag.prev());
                });
                $(this.wrapSelector('.vp-inner-popup-sortby-down')).on('click', function() {
                    let tag = $(this).closest('.vp-inner-popup-sortby-item');
                    tag.insertAfter(tag.next());
                });
            } else if (menuType === FRAME_EDIT_TYPE.FILL_OUT) {
                $(this.wrapSelector('.vp-inner-popup-filltype')).on('change', function() {
                    let filltype = $(this).val();
                    if (filltype === 'value') {
                        $(that.wrapSelector('.vp-inner-popup-fillvalue')).prop('disabled', false);
                    } else {
                        $(that.wrapSelector('.vp-inner-popup-fillvalue')).prop('disabled', true);
                    }
                });
            } else if (menuType === FRAME_EDIT_TYPE.DROP_NA) {
                $(this.wrapSelector('.vp-inner-popup-how')).on('change', function() {
                    let val = $(this).val();
                    if (val === '') {
                        $(that.wrapSelector('.vp-inner-popup-thresh')).prop('disabled', false);
                    } else {
                        $(that.wrapSelector('.vp-inner-popup-thresh')).prop('disabled', true);
                    }
                });
            } else if (menuType === FRAME_EDIT_TYPE.FILL_NA) {
                // bind event on method
                $(this.wrapSelector('.vp-inner-popup-method')).on('change', function() {
                    let changedVal = $(this).val();
                    if (changedVal === 'value') {
                        // show value row
                        $(that.wrapSelector('.vp-inner-popup-value-row')).show();
                        $(that.wrapSelector('.vp-inner-popup-fill-row')).hide();
                    } else if (changedVal === 'ffill' || changedVal === 'bfill') {
                        // show method fill row
                        $(that.wrapSelector('.vp-inner-popup-value-row')).hide();
                        $(that.wrapSelector('.vp-inner-popup-fill-row')).show();
                    } else {
                        // hide all
                        $(that.wrapSelector('.vp-inner-popup-value-row')).hide();
                        $(that.wrapSelector('.vp-inner-popup-fill-row')).hide();
                    }
                });
            }
            
        }

        handleDiscretizeEdges(binsCount=1, right=true) {
            let that = this;
            $(this.wrapSelector('.vp-inner-popup-range-table tbody')).html('');
            $(this.wrapSelector('.vp-inner-popup-islabelchanged')).val("false");
            $(that.wrapSelector('.vp-inner-popup-isedgechanged')).val("false");

            let code = new com_String();
            code.appendFormatLine("_out, _bins = pd.cut({0}[{1}], bins={2}, right={3}, retbins=True)"
                , this.state.tempObj, this.state.selected[0].code, binsCount, right?'True':'False');
            code.append("_vp_print({'edges': list(_bins)})");
            vpKernel.execute(code.toString()).then(function(resultObj) {
                let { result } = resultObj;
                let { edges } = JSON.parse(result);

                let labelLength = edges.length - 1;
                let edgeTbody = new com_String();
                for (let idx = 0; idx < labelLength; idx++ ) {
                    let leftDisabled = 'disabled';
                    let rightDisabled = '';
                    if (idx === (labelLength - 1)) {
                        rightDisabled = 'disabled';
                    }
                    edgeTbody.append('<tr>');
                    edgeTbody.appendFormatLine('<td><input type="text" class="vp-input m vp-inner-popup-label" data-idx="{0}" value="{1}"/></td>', idx, idx);
                    edgeTbody.appendLine('<td>:</td>');
                    edgeTbody.appendFormatLine('<td><input type="number" class="vp-input m vp-inner-popup-left-edge" data-idx="{0}" value="{1}" {2}/></td>', idx, edges[idx], leftDisabled);
                    edgeTbody.appendLine('<td>~</td>');
                    edgeTbody.appendFormatLine('<td><input type="number" class="vp-input m vp-inner-popup-right-edge" data-idx="{0}" value="{1}" {2}/></td>', idx + 1, edges[idx+1], rightDisabled);
                    edgeTbody.append('</tr>');
                }
                $(that.wrapSelector('.vp-inner-popup-range-table tbody')).html(edgeTbody.toString());

                // label change event
                $(that.wrapSelector('.vp-inner-popup-label')).change(function() {
                    $(that.wrapSelector('.vp-inner-popup-islabelchanged')).val("true");
                });

                // edge change event
                $(that.wrapSelector('.vp-inner-popup-left-edge')).change(function() {
                    let idx = $(this).data('idx');
                    let val = $(this).val();
                    $(that.wrapSelector(`.vp-inner-popup-right-edge[data-idx=${idx}]`)).val(val);
                    $(that.wrapSelector('.vp-inner-popup-isedgechanged')).val("true");
                });
                $(that.wrapSelector('.vp-inner-popup-right-edge')).change(function() {
                    let idx = $(this).data('idx');
                    let val = $(this).val();
                    $(that.wrapSelector(`.vp-inner-popup-left-edge[data-idx=${idx}]`)).val(val);
                    $(that.wrapSelector('.vp-inner-popup-isedgechanged')).val("true");
                });

            }).catch(function(errObj) {
                vpLog.display(VP_LOG_TYPE.ERROR, errObj);
            });
        }

        templateForBody() {
            let page = $(frameHtml);

            let allocateSelector = new DataSelector({
                pageThis: this, id: 'vp_feReturn', placeholder: 'Variable name', required: true, value: '_vp'
            });
            $(page).find('#vp_feReturn').replaceWith(allocateSelector.toTagString());

            return page;
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

            this.renderToolbar();
    
            $(this.wrapSelector('#vp_feVariable')).val(originObj);
    
            $(this.wrapSelector('#vp_feReturn')).val(returnObj);

            $(this.wrapSelector('#inplace')).prop('checked', inplace);
    
            // execute all steps
            if (steps && steps.length > 0) {
                var code = steps.join('\n');
                // this.state.steps = [];
                this.loadCode(code);
            }

            // resize codeview
            $(this.wrapSelector('.vp-popup-codeview-box')).css({'height': '300px'})
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

        /**
         * Render toolbar and contextmenu
         */
        renderToolbar() {
            let that = this;
            $(this.wrapSelector('.vp-fe-toolbox')).html('');
            $(this.wrapSelector('.vp-fe-menu-box')).html('');
            // add menu list
            this.menuList & this.menuList.forEach((menuObj, idx) => {
                // show menu list dynamically
                let { id, label, child, axis, selection } = menuObj;
                let enabled = true;
                if ((that.state.axis !== FRAME_AXIS.NONE) && (axis !== undefined) && (axis !== FRAME_AXIS.NONE) && (that.state.axis !== axis)) {
                    enabled = false;
                }
                if (selection !== undefined && (selection !== FRAME_SELECT_TYPE.NONE)) {
                    if ((selection === FRAME_SELECT_TYPE.SINGLE) && (that.state.selected.length !== 1)) {
                        enabled = false;
                    }
                    if ((selection === FRAME_SELECT_TYPE.MULTI) && (that.state.selected.length === 0)) {
                        enabled = false;
                    }
                }
                let selected = id === that.state.menu;
                let $toolbar = $(`<div class="vp-dropdown ${enabled?'':'disabled'}">
                    <div class="vp-drop-button ${enabled?'':'disabled'} ${selected?'selected':''}" data-menu="${id}">${label}</div>
                    <div class="vp-dropdown-content"></div>
                </div>`);
                let $menubox = '';
                if (child !== undefined) {
                    $menubox = $(`<div class="vp-fe-menu-item vp-fe-menu-drop ${enabled?'':'disabled'}" data-menu="${id}">${label}
                        <i class="fa fa-caret-right" style="float: right; margin-top: 7.5px; margin-right: 2px; margin-left: 5px;"></i>
                        <div class="vp-fe-menu-sub-box" style="top: ${30 * idx}px;"></div>
                    </div>`);
                } else {
                    $menubox = $(`<div class="vp-fe-menu-item vp-fe-menu-drop ${enabled?'':'disabled'}" data-menu="${id}">${label}</div>`);
                }
                child && child.forEach(itemObj => {
                    let { id, label, menuType, axis, selection } = itemObj;
                    let enabled = true;
                    if ((that.state.axis !== FRAME_AXIS.NONE) && (axis !== undefined) && (axis !== FRAME_AXIS.NONE) && (that.state.axis !== axis)) {
                        enabled = false;
                    }
                    if (selection !== undefined && (selection !== FRAME_SELECT_TYPE.NONE)) {
                        if ((selection === FRAME_SELECT_TYPE.SINGLE) && (that.state.selected.length !== 1)) {
                            enabled = false;
                        }
                        if ((selection === FRAME_SELECT_TYPE.MULTI) && (that.state.selected.length === 0)) {
                            enabled = false;
                        }
                    }
                    let selected = that.state.menuItem === id;
                    $toolbar.find('.vp-dropdown-content')
                        .append($(`<div class="vp-dropdown-item ${VP_FE_MENU_ITEM} ${enabled?'':'disabled'} ${selected?'selected':''}" data-menu="${id}" data-type="${menuType}" data-parent="${menuObj.id}">${label}</div>`));
                    $menubox.find('.vp-fe-menu-sub-box')
                        .append($(`<div class="vp-fe-menu-item ${enabled?'':'disabled'} ${selected?'selected':''}" data-menu="${id}" data-type="${menuType}" data-parent="${menuObj.id}">${label}</div>`))
                });
                $(this.wrapSelector('.vp-fe-toolbox')).append($toolbar);
                $(this.wrapSelector('.vp-fe-menu-box')).append($menubox);
            });
        }

        renderTable(renderedText, isHtml=true) {
            var tag = new com_String();
            // Table
            tag.appendFormatLine('<div class="{0} {1} {2}">', VP_FE_TABLE, 'vp_rendered_html', 'vp-scrollbar');
            if (isHtml) {
                tag.appendFormatLine('<table class="dataframe">{0}</table>', renderedText);
                // More button
                tag.appendFormatLine('<div class="{0} {1}">Show more</div>', VP_FE_TABLE_MORE, 'vp-button');
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
         * @returns 
         */
        renderAddPage(type = '') {
            var content = new com_String();
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-addpage');
            content.appendLine('<div>');
            content.appendLine('<table class="vp-tbl-gap5 wp100"><colgroup><col width="110px"><col width="*"></colgroup>');
            content.appendFormatLine('<tr><th class="{0}">New {1}</th>', 'vp-orange-text', type);
            if (type === 'row') {
                content.appendFormatLine('<td><input type="text" class="{0}" placeholder="{1}"/>', 'vp-inner-popup-input0', 'Type row name');
            } else {
                content.appendFormatLine('<td><input type="text" class="{0}" placeholder="{1}"/>', 'vp-inner-popup-input0', 'level 0');
            }
            content.appendFormatLine('<label><input type="checkbox" class="{0}" checked/><span>{1}</span></label>'
                                    , 'vp-inner-popup-inputastext0', 'Text');
            content.appendLine('</td></tr>');
            if (type === 'column' && this.state.columnLevel > 1) {
                for (let i = 1; i < this.state.columnLevel; i++ ) {
                    content.appendLine('<tr><td></td>');
                    content.appendFormatLine('<td><input type="text" class="{0}" placeholder="{1}"/>', 'vp-inner-popup-input' + i, 'level ' + i);
                    content.appendFormatLine('<label><input type="checkbox" class="{0}" checked/><span>{1}</span></label>'
                                            , 'vp-inner-popup-inputastext' + i, 'Text');
                    content.appendLine('</td></tr>');
                }
            }
            if (type === 'column') {
                content.appendLine('<tr><th><label>Add type</label></th>');
                content.appendFormatLine('<td><select class="{0}">', 'vp-inner-popup-addtype');
                content.appendFormatLine('<option value="{0}">{1}</option>', 'calculate', 'Calculate');
                content.appendFormatLine('<option value="{0}">{1}</option>', 'replace', 'Replace');
                content.appendFormatLine('<option value="{0}">{1}</option>', 'condition', 'Condition');
                content.appendFormatLine('<option value="{0}">{1}</option>', 'apply', 'Apply');
                content.appendLine('</select></td></tr>');
            }
            content.appendLine('</table>');
            content.appendLine('</div>'); // end of vp-inner-popup-header
    
            content.appendLine('<hr style="margin: 5px 0px;"/>');
            
            // tab 1. calculate
            content.appendFormatLine('<div class="{0} {1}">', 'vp-inner-popup-tab', 'calculate');
            content.appendLine('<table class="vp-tbl-gap5"><colgroup><col width="110px"><col width="*"><col width="15px"></colgroup>');
            content.appendLine('<tr class="vp-inner-popup-value-row">');
            content.appendFormatLine('<th><select class="{0}"><option value="variable">Variable</option><option value="column">Column</option></select></th>', 'vp-inner-popup-vartype');
            content.appendLine('<td>');
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-vartype-box variable');
            content.appendFormatLine('<input type="text" class="{0}" data-idx="{1}" placeholder="Type value"/>', 'vp-inner-popup-value', 0);
            content.appendFormatLine('<label><input type="checkbox" class="{0}"/><span>{1}</span></label>', 'vp-inner-popup-istext','Text');
            content.appendLine('</div>');
            content.appendFormatLine('<div class="{0}" style="display:none;">', 'vp-inner-popup-vartype-box column');
            content.appendFormatLine('<select class="vp-select {0}">', 'vp-inner-popup-var-col-list');
            this.state.columnList.forEach(col => {
                content.appendFormatLine('<option data-code="{0}" data-dtype="{1}" value="{2}">{3}</option>',
                    col.code, col.type, col.code, col.label);
            });
            content.appendLine('</select>');
            content.appendLine('</div>');
            // content.appendFormatLine('<span class="{0} vp-icon-close-small"></span>', 'vp-inner-popup-delete-value');
            content.appendLine('</td><td></td></tr>');
            content.appendFormatLine('<tr class="vp-inner-popup-addvalue-row"><td colspan="2"><button class="vp-button {0}">+ Variable</button></td></tr>', 'vp-inner-popup-addvalue');
            content.appendLine('</table>');
            content.appendLine('</div>'); // end of vp-inner-popup-tab value

            // tab 2. replace
            content.appendFormatLine('<div class="{0} {1}" style="display:none;">', 'vp-inner-popup-tab', 'replace');
            content.appendFormatLine('<div class="{0}">', 'vp-grid-col-120');
            content.appendLine('<label class="vp-orange-text">Target column</label>');
            content.appendFormatLine('<select class="vp-select {0}">', 'vp-inner-popup-value-col-list');
            this.state.columnList.forEach(col => {
                content.appendFormatLine('<option data-code="{0}" data-dtype="{1}" value="{2}">{3}</option>',
                    col.code, col.type, col.code, col.label);
            });
            content.appendLine('</select>');
            content.appendLine('</div>');
            content.appendFormatLine('<label><input type="checkbox" class="{0}"/><span>{1}</span></label>', 'vp-inner-popup-use-regex', 'Use Regular Expression');
            content.appendLine('<br/><br/>');
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-replace-table');
            content.appendLine('<table class="vp-tbl-gap5">');
            content.appendLine('<colgroup><col width="170px"><col width="170px"><col width="*"></colgroup>');
            content.appendFormatLine('<thead><th>{0}</th><th>{1}</th><th></th></thead>', 'Value', 'New value');
            content.appendLine('<tbody>');
            content.appendLine(this.renderReplaceInput(0));
            content.appendFormatLine('<tr><td colspan="3"><button class="{0} {1}">{2}</button></td></tr>', 'vp-button', 'vp-inner-popup-replace-add', '+ Add value');
            content.appendLine('</tbody>');
            content.appendLine('</table>');
            content.appendLine('</div>');
            content.appendLine('</div>');

            // tab 3. condition
            // replace page - 2. condition
            content.appendFormatLine('<div class="{0} {1}" style="display:none;">', 'vp-inner-popup-tab', 'condition');
            // value
            content.appendLine('<div class="vp-grid-col-120">');
            content.appendLine('<label class="pl5">Add value</label>');
            content.appendLine('<div>')
            content.appendFormatLine('<input type="text" class="{0}"/>', 'vp-inner-popup-condvalue');
            content.appendFormatLine('<label><input type="checkbox" class="{0}"/><span>{1}</span></label>', 'vp-inner-popup-condvalueastext','Text');
            content.appendLine('</div>');
            content.appendLine('</div>');
            // condition table
            content.appendLine('<table class="vp-inner-popup-condition-tbl vp-tbl-gap5 wp100 mt5"><colgroup><col width="110px"><col width="*"></colgroup>');
            content.appendLine(this.renderReplaceCondition());
            content.appendFormatLine('<tr><td colspan="4"><button type="button" class="vp-button {0}">{1}</button></td></tr>',
            'vp-inner-popup-add-cond', '+ Condition');
            content.appendLine('</table>');
            content.appendLine('</div>');

            // tab 4. apply
            content.appendFormatLine('<div class="{0} {1}" style="display: none;">', 'vp-inner-popup-tab', 'apply');
            content.appendLine('<div class="vp-grid-box">');
            content.appendLine('<div class="vp-grid-col-120">');
            content.appendLine('<label>Target column</label>');
            content.appendLine('<div class="vp-flex-gap5">');
            content.appendLine(this.renderColumnList(this.state.columnList));
            // else on/off
            content.appendFormatLine('<button class="vp-button {0}" data-else="off">Else On</button>', 'vp-inner-popup-toggle-else');
            content.appendLine('</div>');
            content.appendLine('</div>');
            // content.appendFormatLine('<textarea type="text" id="{0}" class="{1}" placeholder="{2}">lambda x: x</textarea>'
            //                         , 'vp_popupAddApply', 'vp-input vp-inner-popup-apply-lambda', 'Type code manually');
            // render condition
            content.appendLine('<div class="vp-grid-box vp-scrollbar" style="max-height: 220px;">');
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-apply-case-box');
            content.appendLine(this.templateForApplyCase());
            content.appendLine('</div>');
            content.appendFormatLine('<button class="vp-button {0}">+ Case</button>', 'vp-inner-popup-add-case');
            content.appendLine('</div>'); 
            content.appendLine('<div class="vp-grid-col-120">');
            content.appendLine('<label>Else value</label>');
            content.appendLine('<div>');
            content.appendFormatLine('<input type="text" class="{0}" disabled/>', 'vp-inner-popup-apply-else-value');
            content.appendFormatLine('<label><input type="checkbox" class="{0}" checked disabled/><span>{1}</span></label>', 'vp-inner-popup-apply-else-usetext','Text');
            content.appendLine('</div>');
            content.appendLine('</div>'); // end of else value line
            content.appendLine('</div>');
            content.appendLine('</div>'); // end of vp-inner-popup-tab apply
            content.appendLine('</div>'); // end of vp-inner-popup-addpage
            
            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content.toString());
            return content.toString();
        }

        renderAddValueBox(idx) {
            // add dataselector
            let valueSelector = new DataSelector({
                pageThis: this, classes: 'vp-inner-popup-value', placeholder: 'Type value', withPopup: false
            });
            $(this.wrapSelector('.vp-inner-popup-body')).find('.vp-inner-popup-value:nth(' + idx + ')').replaceWith(valueSelector.toTagString());
        }

        templateForApplyCase() {
            return `<div class="vp-inner-popup-apply-case-item">
                <div class="vp-icon-btn vp-icon-close-small vp-inner-popup-apply-del-case" style="float:right;"></div>
                <div class="vp-grid-border-box">
                    <div class="vp-grid-col-120">
                        <label>Replace value</label>
                        <div>
                            <input type="text" class="vp-input vp-inner-popup-apply-case-val" />
                            <label>
                                <input type="checkbox" class="vp-inner-popup-apply-case-usetext" checked>
                                <span>Text</span>
                            </label>
                        </div>
                    </div>
                    <div class="vp-inner-popup-apply-cond-box">
                        ${this.templateForApplyCondition()}
                    </div>
                    <button class="vp-button vp-inner-popup-apply-add-cond">+ Condition</button>
                </div>
            </div>`;
        }

        templateForApplyCondition() {
            return `<div class="vp-inner-popup-apply-cond-item wp100 mt5">
                <div class="vp-icon-btn vp-icon-close-small vp-inner-popup-apply-del-cond" style="float:right;"></div>
                ${this.templateForConditionOperator('', 'vp-inner-popup-apply-oper-list')}
                <input class="vp-input m vp-inner-popup-apply-condition" type="text" placeholder="Value"/>
                <label>
                    <input type="checkbox" class="vp-inner-popup-apply-cond-usetext" title="Uncheck it if you want to use variable or numeric values.">
                    <span>Text</span>
                </label>
                <select class="vp-select s vp-inner-popup-apply-oper-connect" style="display:none;">
                    <option value="&">and</option>
                    <option value="|">or</option>
                </select>
            </div>`;
        }

        renderCalculator(idx) {
            let content = new com_String();
            content.appendFormatLine('<select class="{0}" data-idx="{1}">', 'vp-input s vp-inner-popup-oper', idx);
            let operList = ['+', '-', '*', '/', '%', '//', '==', '!=', '>=', '>', '<=', '<', 'and', 'or'];
            operList.forEach(oper => {
                content.appendFormatLine('<option value="{0}">{1}</option>', oper, oper);
            });
            content.appendFormatLine('</select>');
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

        renderDropPage() {
            var content = new com_String();
            content.appendFormatLine('<div class="{0} vp-grid-box vp-center">', 'vp-inner-popup-drop-page');
            content.appendFormatLine('Are you sure to delete {0} below?', (this.state.axis === FRAME_AXIS.COLUMN?'columns':'rows'));
            content.appendFormatLine('<pre>{0}</pre>', this.state.selected.map(col=>col.code).join(', '))
            content.appendLine('</div>');
            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content.toString());
            return content.toString();
        }

        /**
         * Render rename page
         * @param {string} type FRAME_AXIS
         * @returns 
         */
        renderRenamePage = function(type = FRAME_AXIS.COLUMN) {
            var content = new com_String();
            content.appendFormatLine('<div class="{0} {1}">', 'vp-inner-popup-rename-page', 'vp-scrollbar');
            if (type === FRAME_AXIS.COLUMN && this.state.columnLevel > 1) {
                content.appendFormatLine('<div class="{0}">', 'vp-grid-col-110');
                content.appendLine('<label>Level</label>');
                content.appendFormatLine('<select class="{0}">', 'vp-inner-popup-level');
                for (let i = 0; i < this.state.columnLevel; i++) {
                    content.appendFormatLine('<option value="{0}">{1}</option>', i, i);
                }
                content.appendLine('</select>');
                content.appendLine('</div>');
                content.appendLine('<hr style="margin: 5px 0;">');
            }
            content.appendLine('<table class="vp-tbl-gap5 wp100">');
            content.appendLine('<colgroup><col width="110px"><col width="*"></colgroup>');
            content.appendLine('<tbody>');
            if (this.state.columnLevel > 1) {
                let selectedList = this.state.selected;
                let selectedStr = '';
                if (selectedList.length === 0) {
                    // select all
                    selectedList = this.state.columnList;
                    selectedStr = selectedList.map(col => "(" + col.code.join(',') + ")").join(',')
                } else {
                    selectedStr = selectedList.map(col => col.code).join(',');
                }
                let codeStr = com_util.formatString("_vp_print([ list(col) for col in {0}[[{1}]].columns.to_list()])"
                    , this.state.tempObj, selectedStr);
                let that = this;
                vpKernel.execute(codeStr).then(function(resultObj) {
                    let { result } = resultObj;
                    let colList = JSON.parse(result);
                    let colTags = new com_String();
                    for (let i = 0; i < colList.length; i++) {
                        let colLevels = colList[i];
                        for (let j = 0; j < colLevels.length; j++) {
                            let idx = (i + 1) * j
                            colTags.appendFormatLine('<tr class="{0}">', 'vp-inner-popup-input-row');
                            colTags.appendFormatLine('<th><label style="padding-left:{0}px;">{1}</label></th>', j * 10, colLevels[j]);
                            colTags.appendFormatLine('<td><input type="text" class="{0}" data-code="{1}"/>'
                                , 'vp-inner-popup-input' + idx, com_util.convertToStr(colLevels[j], true)); // FIXME: text or num ?
                            colTags.appendFormatLine('<label><input type="checkbox" class="{0}" checked/><span>{1}</span></label></td>', 'vp-inner-popup-istext' + idx, 'Text');
                            colTags.appendLine('</tr>');
                        }
                    }
                    $(that.wrapSelector('.vp-inner-popup-rename-page tbody')).html(colTags.toString());
                });
            } else {
                let selectedList = this.state.selected;
                if (selectedList.length === 0) {
                    // select all
                    selectedList = this.state.columnList;
                }
                selectedList.forEach((col, idx) => {
                    content.appendFormatLine('<tr class="{0}">', 'vp-inner-popup-input-row');
                    content.appendFormatLine('<th><label>{0}</label></th>', col.label);
                    content.appendFormatLine('<td><input type="text" class="{0}" data-code="{1}"/>'
                        , 'vp-inner-popup-input' + idx, col.code);
                    content.appendFormatLine('<label><input type="checkbox" class="{0}" checked/><span>{1}</span></label></td>'
                        , 'vp-inner-popup-istext' + idx, 'Text');
                    content.appendLine('</tr>');
                });
            }
            content.appendLine('</tbody>');
            content.appendLine('</table>');
            content.appendLine('</div>');

            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content.toString());
            return content.toString();
        }

        renderDiscretizePage() {
            var content = new com_String();
            content.appendLine(`
            <div class="vp-inner-popup-discretize-page vp-grid-box">
                <div class="vp-grid-col-110">
                    <label class="vp-orange-text">New column</label>
                    <div>
                        <input type="text" class="vp-input vp-inner-popup-input" value=""/>
                        <label>
                            <input type="checkbox" class="vp-inner-popup-inputastext" checked>
                            <span>Text</span>
                        </label>
                    </div>
                    <label>Target column</label>
                    <input type="text" class="vp-input" value="${this.state.selected[0].label}" readonly />
                    <label>Bins count</label>
                    <input type="number" class="vp-input vp-inner-popup-bins" placeholder="Input count of bins"/>
                    <label>Discretize type</label>
                    <select class="vp-inner-popup-discretizetype">
                        <option value="cut">Interval based</option>
                        <option value="qcut">Quantile based</option>
                    </select>
                </div>
                <div>
                    <label title="right option">
                        <input type="checkbox" class="vp-inner-popup-right" checked>
                        <span>Include the rightmost edge</span>
                    </label>
                </div>
                <hr style="margin: 5px 0;"/>
                <table class="vp-tbl-gap5 vp-inner-popup-range-table">
                    <colgroup><col width="116px"><col width="5px"><col width="116px"><col width="5px"><col width="*"></colgroup>
                    <thead>
                        <tr>
                            <th>Label</th>
                            <th></th>
                            <th>Left edge</th>
                            <th></th>
                            <th>Right edge</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
                <div>
                    <label title="Set all labels as text">
                        <input type="checkbox" class="vp-inner-popup-labelastext">
                        <span>Label as Text</span>
                    </label>
                </div>
                <input type="hidden" class="vp-inner-popup-islabelchanged" value=false />
                <input type="hidden" class="vp-inner-popup-isedgechanged" value=false />
            </div>
            `)

            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content.toString());
            return content.toString();
        }

        renderShiftPage() {
            var content = new com_String();
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-shift-page');
            content.appendLine('<table class="vp-tbl-gap5">');
            content.appendLine('<colgroup><col width="110px"><col width="*"></colgroup>');
            content.appendLine('<tr>');
            content.appendFormatLine('<th><label class="vp-orange-text">{0}</label></th>', 'Periods');
            content.appendFormatLine('<td><input type="number" class="{0}" placeholder="{1}" value="1" required></td>'
                , 'vp-inner-popup-periods', 'Type number');
            content.appendLine('</tr>');
            content.appendFormatLine('<td colspan="2"><label class="vp-orange-text vp-italic">{0}</label> <label class="vp-gray-text vp-italic">{1}</label></td>'
                , 'NOTE:', 'Number of periods to shift. Can be positive or negative.');
            content.appendLine('</tr>');
            content.appendLine('<tr>');
            content.appendFormatLine('<th><label>{0}</label></th>', 'Frequency');
            content.appendFormatLine('<td><input type="text" class="{0}" placeholder="{1}"></td>'
                , 'vp-inner-popup-freq', 'Offset for timeseries');
            content.appendLine('</tr>');
            content.appendLine('<tr>');
            content.appendFormatLine('<th><label>{0}</label></th>', 'Fill value');
            content.appendLine('<td>');
            content.appendFormatLine('<input type="text" class="{0}" placeholder="{1}">'
                , 'vp-inner-popup-fillvalue', 'Type value to fill');
            content.appendFormatLine('<label><input type="checkbox" class="{0}"/><span>{1}</span></label>', 'vp-inner-popup-fillvalueastext', 'Text');
            content.appendLine('</td>');
            content.appendLine('</tr>');
            content.appendLine('</table>');
            content.appendLine('</div>');

            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content.toString());
            return content.toString();
        }

        /**
         * 
         * @param {int} method index / values
         * @returns 
         */
        renderSortPage(method='values') {
            var content = new com_String();
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-sort-page');
            content.appendLine('<div class="vp-grid-col-110">');
            // axis
            let sortByStr = 'column';
            if (method === 'index') {
                content.appendFormatLine('<label>{0}</label>', 'Axis');
                content.appendFormatLine('<select class="{0}">', 'vp-inner-popup-axis');
                content.appendFormatLine('<option value="{0}">{1}</option>', "0", "Index (default)");
                content.appendFormatLine('<option value="{0}">{1}</option>', "1", "Column");
                content.appendLine('</select>');
                sortByStr = 'level';
            }
            // sort by
            content.appendFormatLine('<label>{0} {1}</label>', 'Sort by', sortByStr);
            content.appendLine(this.templateForSortByBox(method));

            // ascending
            content.appendFormatLine('<label>{0}</label>', 'Ascending');
            content.appendFormatLine('<select class="{0}">', 'vp-inner-popup-isascending');
            content.appendFormatLine('<option value="{0}">{1}</option>', "True", "True (default)");
            content.appendFormatLine('<option value="{0}">{1}</option>', "False", "False");
            content.appendLine('</select>');
            content.appendLine('</div>');
            content.appendLine('</div>');
            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content.toString());
            return content.toString();
        }

        templateForSortByBox(method='index', axis=FRAME_AXIS.ROW) {
            var content = new com_String();
            let sortByList = [];
            if (method === 'values') {
                // sort_values
                sortByList = this.state.selected;
            } else {
                // sort_index
                if (axis === FRAME_AXIS.ROW) {
                    sortByList = Array.from({ length:this.state.indexLevel },(v,k)=>{ return {label: k, code: k} });
                } else {
                    sortByList = Array.from({ length:this.state.columnLevel },(v,k)=>{ return {label: k, code: k} });
                }
            }
            
            // movable list
            content.appendLine('<div class="vp-inner-popup-sortby">');
            sortByList.forEach((obj, idx) => {
                content.appendFormatLine('<div class="vp-inner-popup-sortby-item" data-code="{0}">', obj.code);
                content.appendFormatLine('<label>{0}</label>', obj.label);
                content.appendLine('<span class="vp-inner-popup-sortby-down vp-icon-chevron-down" title="Set lower priority on sorting"></span>');
                content.appendLine('<span class="vp-inner-popup-sortby-up vp-icon-chevron-up" title="Set upper priority on sorting"></span>');
                content.appendLine('</div>');
            });
            content.appendLine('</div>');
            return content.toString();
        }

        renderReplacePage() {
            var content = new com_String();
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-replacepage');
            content.appendLine('<div>');
            content.appendLine('<table class="vp-tbl-gap5 wp100"><colgroup><col width="110px"><col width="*"></colgroup>');
            content.appendFormatLine('<tr><th class="{0}">{1}</th>', '', 'Column');
            var target = this.state.selected[0];
            content.appendFormatLine('<td><input type="text" class="{0}" value="{1}" data-code="{2}" readonly/>'
                , 'vp-inner-popup-input1', target.label, target.code);
            content.appendLine('</td></tr>');
            content.appendLine('<tr><th><label>Replace type</label></th>');
            content.appendFormatLine('<td><select class="{0}">', 'vp-inner-popup-replacetype');
            content.appendFormatLine('<option value="{0}">{1}</option>', 'replace', 'Replace');
            content.appendFormatLine('<option value="{0}">{1}</option>', 'condition', 'Condition');
            content.appendLine('</select></td></tr>');
            content.appendLine('</table>');
            content.appendLine('</div>'); // end of vp-inner-popup-header
    
            content.appendLine('<hr style="margin: 5px 0px;"/>');
            // replace page - 1. replace
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-tab replace');
            content.appendFormatLine('<label><input type="checkbox" class="{0}"/><span>{1}</span></label>', 'vp-inner-popup-use-regex', 'Use Regular Expression');
            content.appendLine('<br/><br/>');
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-replace-table');
            content.appendLine('<table class="vp-tbl-gap5">');
            content.appendLine('<colgroup><col width="170px"><col width="170px"><col width="*"></colgroup>');
            content.appendFormatLine('<thead><th>{0}</th><th>{1}</th><th></th></thead>', 'Value', 'New value');
            content.appendLine('<tbody>');
            content.appendLine(this.renderReplaceInput(0));
            content.appendFormatLine('<tr><td colspan="3"><button class="{0} {1}">{2}</button></td></tr>', 'vp-button', 'vp-inner-popup-replace-add', '+ Add value');
            content.appendLine('</tbody>');
            content.appendLine('</table>');
            content.appendLine('</div>');
            content.appendLine('</div>');
            // replace page - 2. condition
            content.appendFormatLine('<div class="{0}" style="display:none;">', 'vp-inner-popup-tab condition');
            // value
            content.appendLine('<div class="vp-grid-col-120">');
            content.appendLine('<label class="pl5">Replace value</label>');
            content.appendLine('<div>')
            content.appendFormatLine('<input type="text" class="{0}"/>', 'vp-inner-popup-condvalue');
            content.appendFormatLine('<label><input type="checkbox" class="{0}"/><span>{1}</span></label>', 'vp-inner-popup-condvalueastext','Text');
            content.appendLine('</div>');
            content.appendLine('</div>');
            // condition table
            content.appendLine('<table class="vp-inner-popup-condition-tbl vp-tbl-gap5 wp100 mt5"><colgroup><col width="110px"><col width="*"></colgroup>');
            // content.appendLine('<tr><td><label>Condition</label></td>');
            // content.appendLine('<td><div class="vp-fr-subset-box">');
            // content.appendLine('<textarea class="vp-input vp-inner-popup-subset"></textarea>');
            // content.appendLine('</div></td>');
            // content.appendLine('</tr>');

            // content.appendLine('<tr><th><label>Variable</label></th>');
            // content.appendFormatLine('<td><input type="text" class="{0}"/>', 'vp-inner-popup-input3');
            // content.appendFormatLine('<label><input type="checkbox" class="{0}"/><span>{1}</span></label>', 'vp-inner-popup-istext3','Text');
            // content.appendLine('</td></tr>');
            content.appendLine(this.renderReplaceCondition());
            content.appendFormatLine('<tr><td colspan="4"><button type="button" class="vp-button {0}">{1}</button></td></tr>',
                'vp-inner-popup-add-cond', '+ Condition');
            content.appendLine('</table>');

            content.appendLine('</div>'); // end of vp-inner-popup-addpage

            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content.toString());
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

        handleConditionAdd() {
            var conditonBox = $(this.renderReplaceCondition());

            // hide last connect operator
            conditonBox.find('.vp-inner-popup-oper-connect').hide();

            // show connect operator right before last one
            $(this.wrapSelector('.vp-inner-popup-oper-connect:last')).show();
            conditonBox.insertBefore(this.wrapSelector('.vp-inner-popup-condition-tbl tr:last'));
        }

        renderReplaceCondition() {
            var content = new com_String();
            content.appendLine('<tr><td>');
            // delete condition button
            content.appendLine('<div class="vp-icon-btn vp-icon-close-small vp-inner-popup-del-cond" style="float:right;"></div>');
            // condition line
            content.appendLine('<div class="vp-td-line mb5">');
            // - 1. column list
            content.appendFormatLine('<select class="{0} {1}">', 'vp-select m', 'vp-inner-popup-col-list');
            // add .index
            content.appendFormatLine('<option data-code="{0}" value="{1}">{2}</option>', '.index', '.index', 'index');
            this.state.columnList.forEach(col => {
                content.appendFormatLine('<option data-code="{0}" data-dtype="{1}" value="{2}">{3}</option>',
                    col.code, col.type, col.code, col.label);
            });
            content.appendLine('</select>');
            // - 2. operator
            content.appendLine(this.templateForConditionOperator(''));
            // - 3. oper-value
            content.appendLine('<input class="vp-input m vp-inner-popup-condition" type="text" placeholder="Value"/>');
            // use text
            content.appendFormatLine('<label class="{0}"><input type="checkbox" class="{1}" title="{2}"/><span>{3}</span></label>',
                'vp-inner-popup-condition-use-text', 'vp-inner-popup-cond-use-text', 'Uncheck it if you want to use variable or numeric values.', 'Text');
            content.appendLine('</div>');
            content.appendLine('<div class="vp-td-line">');
            content.appendLine('<select class="vp-select s vp-inner-popup-oper-connect" style="display:none;">');
            content.appendLine('<option value="&">and</option>');
            content.appendLine('<option value="|">or</option>');
            content.appendLine('</select>');
                content.appendLine('</div>');
            content.appendLine('</td></tr>');
            return content.toString();
        }

        templateForConditionOperator(dtype='object', className='vp-inner-popup-oper-list') {
            var content = new com_String();
            content.appendFormatLine('<select class="{0} {1}">', 'vp-select s', className);
            var operList = ['', '==', '!=', '<', '<=', '>', '>=', 'contains', 'not contains', 'starts with', 'ends with', 'isnull()', 'notnull()'];
            if (dtype == '') {
                // .index
                operList = ['', '==', '!=', '<', '<=', '>', '>='];
            } else if (dtype != 'object') {
                operList = ['', '==', '!=', '<', '<=', '>', '>=', 'isnull()', 'notnull()'];
            }
            operList.forEach(oper => {
                content.appendFormatLine('<option value="{0}">{1}</option>', oper, oper);
            });
            content.appendLine('</select>');
            return content.toString();
        }

        templateForConditionCondInput(category, dtype='object') {
            var vpCondSuggest = new SuggestInput();
            vpCondSuggest.addClass('vp-input m vp-inner-popup-condition');

            if (category && category.length > 0) {
                vpCondSuggest.setPlaceholder((dtype=='object'?'Categorical':dtype) + " dtype");
                vpCondSuggest.setSuggestList(function () { return category; });
                vpCondSuggest.setSelectEvent(function (value) {
                    $(this.wrapSelector()).val(value);
                    $(this.wrapSelector()).trigger('change');
                });
                vpCondSuggest.setNormalFilter(false);
            } else {
                vpCondSuggest.setPlaceholder(dtype==''?'Value':(dtype + " dtype"));
            }
            return vpCondSuggest.toTagString();
        }

        renderAsType() {
            var astypeList = this.astypeList;
            var content = new com_String();
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-astype');
            content.appendFormatLine('<table class="vp-tbl-gap5 {0}">', 'vp-inner-popup-astype-table');
            content.appendLine('<colgroup><col width="140px"><col width="160px"><col width="*"></colgroup>');
            content.appendFormatLine('<thead style="height: 30px"><th>{0}</th><th>{1}</th><th class="{2}">{3}</th></thead>'
                                    , 'Column', 'Data type', 'vp-orange-text', 'New data type');
            content.appendLine('<tbody>');
            let selectedList = this.state.selected;
            if (selectedList.length === 0) {
                // select all
                selectedList = this.state.columnList;
            }
            selectedList.forEach((col, idx) => {
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

        renderFillNAPage() {
            var content = new com_String();
            content.appendFormatLine('<div class="{0}">', 'vp-inner-popup-fillna-page');
            content.appendLine('<table class="vp-tbl-gap5">');
            content.appendLine('<colgroup><col width="110px"><col width="*"></colgroup>');
            content.appendLine('<tr>');
            content.appendFormatLine('<th><label class="vp-orange-text">{0}</label></th>', 'Method');
            content.appendFormatLine('<td><select class="{0}">', 'vp-inner-popup-method');
            content.appendFormatLine('<option value="{0}">{1}</option>', "value", "Value");
            content.appendFormatLine('<option value="{0}">{1}</option>', "ffill", "Forward fill");
            content.appendFormatLine('<option value="{0}">{1}</option>', "bfill", "Back fill");
            let statsMethodList = ['mean', 'median', 'mode', 'min', 'max'];
            content.appendLine('<optgroup label="Statistics">');
            statsMethodList.forEach(opt => {
                content.appendFormatLine('<option value="{0}">{1}</option>', opt, opt);
            })
            content.appendLine('</optgroup>');
            content.appendLine('</select></td>');
            content.appendLine('</tr>');
            content.appendFormatLine('<tr class="{0}">', 'vp-inner-popup-value-row');
            content.appendFormatLine('<th><label class="vp-orange-text">{0}</label></th>', 'Fill value');
            content.appendLine('<td>');
            content.appendFormatLine('<input type="text" id="{0}" class="{1}" placeholder="{2}" required>'
                , 'vp_fillValue', 'vp-inner-popup-value', 'Type or select value');
            content.appendFormatLine('<label><input type="checkbox" class="{0}"/><span>{1}</span></label>'
                , 'vp-inner-popup-valueastext', 'Text');
            content.appendLine('</td>');
            content.appendLine('</tr>');
            content.appendFormatLine('<tr class="{0}" style="display:none;">', 'vp-inner-popup-fill-row');
            content.appendFormatLine('<th><label>{0}</label></th>', 'Limit');
            content.appendLine('<td>');
            content.appendFormatLine('<input type="number" class="{0}" placeholder="{1}">'
                , 'vp-inner-popup-limit', 'Type limit to fill');
            content.appendLine('</td>');
            content.appendLine('</tr>');
            content.appendLine('</table>');
            content.appendLine('</div>');

            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content.toString());
            return content.toString();
        }

        renderDropNAPage() {
            // how / thresh / ignore_index
            let content = `<div class="vp-inner-popup-dropna-page vp-grid-col-110">
                <label>How</label>
                <select class="vp-inner-popup-how">
                    <option value="">Select option...</option>
                    <option value="any">Any</option>
                    <option value="all" selected>All</option>
                </select>
                <label>Threshold</label>
                <input type="number" class="vp-input vp-inner-popup-thresh" value="" disabled />
                <label>Ignore index</label>
                <select class="vp-inner-popup-ignoreindex">
                    <option value="">Select option...</option>
                    <option value="True">True</option>
                    <option value="False">False</option>
                </select>
            </div>`;

            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content);
            return content.toString();
        }

        renderDropDupPage() {
            // keep / ignore_index
            let content = `<div class="vp-inner-popup-dropdup-page vp-grid-col-110">
                <label>Keep</label>
                <select class="vp-inner-popup-how">
                    <option value="">Select option...</option>
                    <option value="'first'">First</option>
                    <option value="'last'">Last</option>
                    <option value="False">False</option>
                </select>
                <label>Ignore index</label>
                <select class="vp-inner-popup-ignoreindex">
                    <option value="">Select option...</option>
                    <option value="True">True</option>
                    <option value="False">False</option>
                </select>
            </div>`;

            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content);
            return content.toString();
        }

        renderFillOutPage() {
            let content = `<div class="vp-inner-popup-fillout-page vp-grid-col-110">
                <label>Fill type</label>
                <select class="vp-inner-popup-filltype">
                    <option value="iqr">IQR</option>
                    <option value="mean">Mean</option>
                    <option value="median">Median</option>
                    <option value="value">Value</option>
                    <option value="NA">NA</option>
                </select>
                <label>Value</label>
                <input type="text" class="vp-input vp-inner-popup-fillvalue" disabled>
            </div>`;

            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content);
            return content.toString();
        }


        renderDropOutPage() {
            var content = new com_String();
            content.appendFormatLine('<div class="{0} vp-grid-box vp-center">', 'vp-inner-popup-dropout-page');
            content.appendLine('Are you sure to drop outliers from columns below?');
            content.appendFormatLine('<pre>{0}</pre>', this.state.selected.map(col=>col.code).join(', '))
            content.appendLine('</div>');

            // set content
            $(this.wrapSelector('.vp-inner-popup-body')).html(content.toString());
            return content.toString();
        }

        openInputPopup(type, width=450, height=450) {
            var title = '';
            var content = '';
            let size = { width: width, height: height };
            let that = this;

            $(this.wrapSelector('.vp-inner-popup-body')).empty();
    
            switch (parseInt(type)) {
                case FRAME_EDIT_TYPE.ADD_COL:
                    title = 'Add column';
                    size = { width: 450, height: 480 };
                    content = this.renderAddPage('column');
                    this.renderAddValueBox(0);

                    // bind event for adding values to calculate
                    $(this.wrapSelector('.vp-inner-popup-addvalue')).on('click', function() {
                        let valueCount = $(that.wrapSelector('.vp-inner-popup-value')).length;
                        let columnOptStr = '';
                        that.state.columnList.forEach(col => {
                            columnOptStr += `<option data-code="${col.code}" data-dtype="${col.type}" value="${col.code}">${col.label}</option>`;
                        });
                        $(`<tr class="vp-inner-popup-oper-row">
                            <td></td>
                            <td>${that.renderCalculator(valueCount)}</td>
                        </tr>
                        <tr class="vp-inner-popup-value-row">
                            <th>
                                <select class="vp-inner-popup-vartype">
                                    <option value="variable">Variable</option>
                                    <option value="column">Column</option>
                                </select>
                            </th>
                            <td>
                                <div class="vp-inner-popup-vartype-box variable">
                                    <input type="text" class="vp-inner-popup-value"/>
                                    <label><input type="checkbox" class="vp-inner-popup-istext"/><span>Text</span></label>
                                </div>
                                <div class="vp-inner-popup-vartype-box column" style="display:none;">
                                    <select class="vp-select vp-inner-popup-var-col-list">
                                        ${columnOptStr}
                                    </select>
                                </div>
                            </td>
                            <td>
                                <span class="vp-inner-popup-delete-value vp-icon-close-small"></span>
                            </td>
                        </tr>`).insertBefore($(that.wrapSelector('.vp-inner-popup-addvalue-row')));
                        that.renderAddValueBox(valueCount);
                        
                        $(that.wrapSelector('.vp-inner-popup-delete-value')).off('click');
                        $(that.wrapSelector('.vp-inner-popup-delete-value')).on('click', function() {
                            // delete variable item
                            let index = $(this).closest('tr.vp-inner-popup-value-row').index();
                            $(that.wrapSelector('.vp-inner-popup-oper-row:nth(' + (index - 2) + ')')).remove();
                            $(that.wrapSelector('.vp-inner-popup-value-row:nth(' + (index - 1) + ')')).remove();
                        });
                    });

                    // bind codemirror for apply textarea
                    this.applyCm = this.initCodemirror({ 
                        key: 'vp-inner-popup-apply-lambda', 
                        selector: this.wrapSelector('.vp-inner-popup-apply-lambda'),
                    });
                    break;
                case FRAME_EDIT_TYPE.ADD_ROW:
                    title = 'Add row';
                    size = { width: 450, height: 450 };
                    content = this.renderAddPage('row');
                    this.renderAddValueBox(0);

                    // bind event for adding values to calculate
                    $(this.wrapSelector('.vp-inner-popup-addvalue')).on('click', function() {
                        let valueCount = $(that.wrapSelector('.vp-inner-popup-value')).length;
                        $(`<tr class="vp-inner-popup-oper-row">
                            <td></td>
                            <td>${that.renderCalculator(valueCount)}</td>
                        </tr>
                        <tr class="vp-inner-popup-value-row">
                            <th><label>Variable</label></th>
                            <td>
                                <input type="text" class="vp-inner-popup-value"/>
                                <label><input type="checkbox" class="vp-inner-popup-istext"/><span>Text</span></label>
                                <span class="vp-inner-popup-delete-value vp-icon-close-small"></span>
                            </td>
                        </tr>`).insertBefore($(that.wrapSelector('.vp-inner-popup-addvalue-row')));
                        that.renderAddValueBox(valueCount);
                        
                        $(that.wrapSelector('.vp-inner-popup-delete-value')).off('click');
                        $(that.wrapSelector('.vp-inner-popup-delete-value')).on('click', function() {
                            // delete variable item
                            let index = $(this).closest('tr.vp-inner-popup-value-row').index();
                            $(that.wrapSelector('.vp-inner-popup-oper-row:nth(' + (index - 2) + ')')).remove();
                            $(that.wrapSelector('.vp-inner-popup-value-row:nth(' + (index - 1) + ')')).remove();
                        });
                    });
                    break;
                case FRAME_EDIT_TYPE.DROP:
                    title = 'Drop ';
                    if (this.state.axis === FRAME_AXIS.COLUMN) {
                        title += 'columns';
                    } else {
                        title += 'rows';
                    }
                    size = { width: 400, height: 200 };
                    content = this.renderDropPage();
                    break;
                case FRAME_EDIT_TYPE.RENAME:
                    title = 'Rename ';
                    if (this.state.axis === FRAME_AXIS.ROW) {
                        title += 'rows';
                        content = this.renderRenamePage(FRAME_AXIS.ROW);
                    } else {
                        title += 'columns';
                        content = this.renderRenamePage(FRAME_AXIS.COLUMN);
                    }
                    break;
                case FRAME_EDIT_TYPE.DISCRETIZE:
                    title = 'Discretize';
                    size = { width: 450, height: 450 };
                    content = this.renderDiscretizePage();
                    break;
                case FRAME_EDIT_TYPE.DATA_SHIFT:
                    title = 'Data shift';
                    size = { width: 450, height: 300 };
                    content = this.renderShiftPage();

                    // set suggestinput
                    let freqFormats = [
                        {'label': 'infer', 'value': 'infer'},
                        {'label': 'second', 'value': 's'},
                        {'label': 'minute', 'value': 'T'},
                        {'label': 'hour', 'value': 'H'},
                        {'label': 'day', 'value': 'D'},
                        {'label': 'weekdays', 'value': 'B'},
                        {'label': 'week(Sunday)', 'value': 'W'},
                        {'label': 'week(Monday)', 'value': 'W-MON'},
                        {'label': 'first day of month', 'value': 'MS'},
                        {'label': 'last day of month', 'value': 'M'},
                        {'label': 'first weekday of month', 'value': 'BMS'},
                        {'label': 'last weekday of month', 'value': 'BM'}
                    ];
                    var freqInput = new SuggestInput();
                    freqInput.addClass('vp-inner-popup-freq');
                    freqInput.setPlaceholder('Type frequency');
                    freqInput.setSuggestList(freqFormats);
                    freqInput.setNormalFilter(true);
                    $(this.wrapSelector('.vp-inner-popup-freq')).replaceWith(function() {
                        return freqInput.toTagString();
                    });
                    break;
                case FRAME_EDIT_TYPE.SORT_INDEX:
                    title = 'Sort by index';
                    content = this.renderSortPage('index');
                    break;
                case FRAME_EDIT_TYPE.SORT_VALUES:
                    title = 'Sort by values';
                    content = this.renderSortPage('values');
                    break;
                case FRAME_EDIT_TYPE.REPLACE:
                    title = 'Replace';
                    content = this.renderReplacePage();

                    // // bind codemirror
                    // this.subsetCm = this.initCodemirror({ 
                    //     key: 'vp-inner-popup-subset', 
                    //     selector: this.wrapSelector('.vp-inner-popup-subset'), 
                    //     type: 'readonly' 
                    // });
                    // // set subset
                    // let contentState = that.getPopupContent(type);
                    // this.subsetEditor = new Subset({ 
                    //     pandasObject: this.state.tempObj,
                    //     selectedColumns: [ com_util.convertToStr(contentState.name, contentState.nameastext) ],
                    //     config: { name: 'Subset' } }, 
                    //     { 
                    //         useInputVariable: true,
                    //         useInputColumns: true,
                    //         targetSelector: this.wrapSelector('.vp-inner-popup-subset'),
                    //         pageThis: this,
                    //         allowSubsetTypes: ['iloc', 'loc'],
                    //         beforeOpen: function(subsetThis) {
                    //             let contentState = that.getPopupContent(type);
                    //             let name = com_util.convertToStr(contentState.name, contentState.nameastext);
                    //             subsetThis.state.selectedColumns = [ name ];
                    //         },
                    //         finish: function(code) {
                    //             that.subsetCm.setValue(code);
                    //             that.subsetCm.save();
                    //             setTimeout(function () {
                    //                 that.subsetCm.refresh();
                    //             }, 1);
                    //         }
                    //     });
                    // initial code
                    // var code = this.subsetEditor.generateCode();
                    // this.subsetCm.setValue(code);
                    // this.subsetCm.save();
                    // setTimeout(function () {
                    //     that.subsetCm.refresh();
                    // }, 1);

                    // set dataselector
                    let replaceVarSelector = new DataSelector({
                        pageThis: this, id: 'vp_replaceVariable', classes: 'vp-inner-popup-value', placeholder: 'Type or select variable'
                        , withPopup: false
                    });
                    $(this.wrapSelector('.vp-inner-popup-body')).find('.vp-inner-popup-value').replaceWith(replaceVarSelector.toTagString());
                    break;
                case FRAME_EDIT_TYPE.AS_TYPE:
                    title = 'Convert type';
                    content = this.renderAsType();
                    break;
                case FRAME_EDIT_TYPE.FILL_NA:
                    title = 'Fill NA';
                    content = this.renderFillNAPage();

                    // set dataselector
                    let valueSelector = new DataSelector({
                        pageThis: this, classes: 'vp-inner-popup-value', placeholder: 'Type or select value',
                        withPopup: false
                    });
                    $(this.wrapSelector('.vp-inner-popup-body')).find('.vp-inner-popup-value').replaceWith(valueSelector.toTagString());
                    break;
                case FRAME_EDIT_TYPE.DROP_NA:
                    title = 'Drop NA';
                    content = this.renderDropNAPage();
                    break;
                case FRAME_EDIT_TYPE.DROP_DUP:
                    title = 'Drop duplicates';
                    content = this.renderDropDupPage();
                    break;
                case FRAME_EDIT_TYPE.FILL_OUT:
                    title = 'Fill outlier';
                    content = this.renderFillOutPage();

                    // set dataselector
                    let fillvalueSelector = new DataSelector({
                        pageThis: this, classes: 'vp-inner-popup-fillvalue', placeholder: 'Type or select value',
                        withPopup: false
                    });
                    $(this.wrapSelector('.vp-inner-popup-body')).find('.vp-inner-popup-fillvalue').replaceWith(fillvalueSelector.toTagString());
                    $(this.wrapSelector('.vp-inner-popup-body')).find('.vp-inner-popup-fillvalue').prop('disabled', true);
                    break;
                case FRAME_EDIT_TYPE.DROP_OUT:
                    title = 'Drop outlier';
                    size = { width: 400, height: 200 };
                    content = this.renderDropOutPage();
                    break;
                default:
                    type = FRAME_EDIT_TYPE.NONE;
                    break;
            }
    
            this.state.popup.type = type;

            // set size and position
            $(this.wrapSelector('.vp-inner-popup-box')).css({
                width: size.width,
                height: size.height,
                left: 'calc(50% - ' + (size.width/2) + 'px)',
                top: 'calc(50% - ' + (size.height/2) + 'px)',
            });
            
            // bindEventForAddPage
            this.bindEventForPopupPage(type);

            // set column list
            vpKernel.getColumnList(this.state.tempObj).then(function(resultObj) {
                let { result } = resultObj;
                var { list } = JSON.parse(result);
                var tag1 = new com_String();
                var tag2 = new com_String();
                tag1.appendFormatLine('<select class="{0}">', 'vp-inner-popup-var1col');
                tag2.appendFormatLine('<select class="{0}">', 'vp-inner-popup-var2col');
                list && list.forEach(col => {
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
            let that = this;
            var content = {};
            switch (type) {
                case FRAME_EDIT_TYPE.ADD_COL:
                case FRAME_EDIT_TYPE.ADD_ROW:
                    let variableTuple = [];
                    let thisLevel = this.state.columnLevel;
                    if (type === FRAME_EDIT_TYPE.ADD_ROW) {
                        thisLevel = this.state.indexLevel;
                    }
                    for (let i = 0; i < thisLevel; i++) {
                        let val = $(this.wrapSelector('.vp-inner-popup-input' + i)).val();
                        let istext = $(this.wrapSelector('.vp-inner-popup-inputastext' + i)).prop('checked');
                        variableTuple.push(com_util.convertToStr(val, istext));
                    }
                    if (variableTuple.length > 1) {
                        content['name'] = '(' + variableTuple.join(',') + ')';
                    } else {
                        content['name'] = variableTuple.join(',');
                    }
                    var tab = $(this.wrapSelector('.vp-inner-popup-addtype')).val();
                    if (type === FRAME_EDIT_TYPE.ADD_ROW) {
                        tab = 'calculate';
                    }
                    content['addtype'] = tab;
                    if (tab == 'calculate') {
                        let values = [];
                        let opers = [];
                        $(this.wrapSelector('.vp-inner-popup-tab.calculate tr.vp-inner-popup-value-row')).each((idx, tag) => {
                            let varType = $(tag).find('.vp-inner-popup-vartype').val();
                            if (varType === 'variable') {
                                let valueastext = $(tag).find('.vp-inner-popup-istext').prop('checked');
                                values.push(com_util.convertToStr($(tag).find('.vp-inner-popup-value').val(), valueastext));
                            } else {
                                // columns
                                let column = $(tag).find('.vp-inner-popup-var-col-list').val();
                                values.push(com_util.formatString("{0}[{1}]", this.state.tempObj, column));
                            }
                            let oper = $(that.wrapSelector('.vp-inner-popup-oper:nth(' + idx + ')')).val();
                            if (oper && oper !== '') {
                                opers.push(oper);
                            }
                        });
                        content['values'] = values;
                        content['opers'] = opers;
                    } else if (tab == 'replace') {
                        content['target'] = $(this.wrapSelector('.vp-inner-popup-value-col-list option:selected')).data('code');
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
                    } else if (tab == 'apply') {
                        content['target'] = $(this.wrapSelector('.vp-inner-popup-apply-column')).val();
                        let caseList = [];
                        $(this.wrapSelector('.vp-inner-popup-apply-case-item')).each((idx, caseTag) => {
                            let condList = [];
                            let replaceValue = $(caseTag).find('.vp-inner-popup-apply-case-val').val();
                            let replaceValText = $(caseTag).find('.vp-inner-popup-apply-case-usetext').prop('checked');

                            let operTag = $(caseTag).find('.vp-inner-popup-apply-oper-list');
                            let condTag = $(caseTag).find('.vp-inner-popup-apply-condition');
                            let condTextTag = $(caseTag).find('.vp-inner-popup-apply-cond-usetext');
                            let operConnTag = $(caseTag).find('.vp-inner-popup-apply-oper-connect');
                            for (let i=0; i<operTag.length; i++) {
                                var oper = $(operTag[i]).val();
                                var cond = $(condTag[i]).val();
                                var condText = $(condTextTag[i]).prop('checked');
                                var operConn = $(operConnTag[i]).val();
                                var condObj = {};
                                if (col !== '' && oper !== '' && cond !== '') {
                                    condObj = {
                                        oper: oper,
                                        cond: com_util.convertToStr(cond, condText)
                                    };
                                    if (i < (operTag.length - 1)) {
                                        condObj['connector'] = operConn;
                                    }
                                    condList.push(condObj);
                                }
                            };
                            if (replaceValue !== '') {
                                caseList.push({
                                    value: com_util.convertToStr(replaceValue, replaceValText),
                                    condList: condList
                                });
                            }
                        });
                        content['caseList'] = caseList;
                        content['else'] = 'np.nan';
                        if ($(this.wrapSelector('.vp-inner-popup-toggle-else')).attr('data-else') === 'on') {
                            let elseValue = $(this.wrapSelector('.vp-inner-popup-apply-else-value')).val();
                            let elseastext = $(this.wrapSelector('.vp-inner-popup-apply-else-usetext')).prop('checked');
                            if (elseValue !== '') {
                                content['else'] = com_util.convertToStr(elseValue, elseastext);
                            }
                        }
                    } else if (tab === 'condition') {
                        content['list'] = [];
                        var colTag = $(this.wrapSelector('.vp-inner-popup-col-list'));
                        var operTag = $(this.wrapSelector('.vp-inner-popup-oper-list'));
                        var condTag = $(this.wrapSelector('.vp-inner-popup-condition'));
                        var condTextTag = $(this.wrapSelector('.vp-inner-popup-cond-use-text'));
                        var operConnTag = $(this.wrapSelector('.vp-inner-popup-oper-connect'));
                        for (let i=0; i<colTag.length; i++) {
                            var col = $(colTag[i]).val();
                            var oper = $(operTag[i]).val();
                            var cond = $(condTag[i]).val();
                            var condText = $(condTextTag[i]).prop('checked');
                            var operConn = $(operConnTag[i]).val();
                            var condObj = {};
                            if (col !== '' && oper !== '' && cond !== '') {
                                condObj = {
                                    colName: col,
                                    oper: oper,
                                    cond: cond,
                                    condAsText: condText
                                };
                                if (i < (colTag.length - 1)) {
                                    condObj['connector'] = operConn;
                                }
                                content['list'].push(condObj);
                            }
                        }
                        content['value'] = $(this.wrapSelector('.vp-inner-popup-condvalue')).val();
                        content['valueastext'] = $(this.wrapSelector('.vp-inner-popup-condvalueastext')).prop('checked');
                    }
                    break;
                case FRAME_EDIT_TYPE.REPLACE:
                    content['name'] = $(this.wrapSelector('.vp-inner-popup-input1')).data('code');
                    var tab = $(this.wrapSelector('.vp-inner-popup-replacetype')).val();
                    content['replacetype'] = tab;
                    if (tab == 'replace') {
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
                    } else if (tab === 'condition') {
                        content['list'] = [];
                        var colTag = $(this.wrapSelector('.vp-inner-popup-col-list'));
                        var operTag = $(this.wrapSelector('.vp-inner-popup-oper-list'));
                        var condTag = $(this.wrapSelector('.vp-inner-popup-condition'));
                        var condTextTag = $(this.wrapSelector('.vp-inner-popup-cond-use-text'));
                        var operConnTag = $(this.wrapSelector('.vp-inner-popup-oper-connect'));
                        for (let i=0; i<colTag.length; i++) {
                            var col = $(colTag[i]).val();
                            var oper = $(operTag[i]).val();
                            var cond = $(condTag[i]).val();
                            var condText = $(condTextTag[i]).prop('checked');
                            var operConn = $(operConnTag[i]).val();
                            var condObj = {};
                            if (col !== '' && oper !== '' && cond !== '') {
                                condObj = {
                                    colName: col,
                                    oper: oper,
                                    cond: cond,
                                    condAsText: condText
                                };
                                if (i < (colTag.length - 1)) {
                                    condObj['connector'] = operConn;
                                }
                                content['list'].push(condObj);
                            }
                        }
                        content['value'] = $(this.wrapSelector('.vp-inner-popup-condvalue')).val();
                        content['valueastext'] = $(this.wrapSelector('.vp-inner-popup-condvalueastext')).prop('checked');
                    }
                    break;
                case FRAME_EDIT_TYPE.RENAME:
                    content['list'] = {};
                    let inputLength = $(this.wrapSelector('.vp-inner-popup-input-row')).length;
                    for (let idx = 0; idx < inputLength; idx++) {
                        var label = $(this.wrapSelector('.vp-inner-popup-input'+idx)).data('code');
                        var value = $(this.wrapSelector('.vp-inner-popup-input'+idx)).val();
                        var istext = $(this.wrapSelector('.vp-inner-popup-istext'+idx)).prop('checked');
                        content['list'][idx] = {
                            label: label,
                            value: value,
                            istext: istext
                        };
                    }
                    if (this.state.axis !== FRAME_AXIS.ROW && this.state.columnLevel > 1) {
                        content['level'] = $(this.wrapSelector('.vp-inner-popup-level')).val();
                    }
                    break;
                case FRAME_EDIT_TYPE.SORT_INDEX:
                    content['axis'] = $(this.wrapSelector('.vp-inner-popup-axis')).val();
                case FRAME_EDIT_TYPE.SORT_VALUES:
                    let values = [];
                    $(this.wrapSelector('.vp-inner-popup-sortby-item')).each((idx, tag) => {
                        values.push($(tag).data('code'));
                    });
                    content['values'] = values;
                    content['ascending'] = $(this.wrapSelector('.vp-inner-popup-isascending')).val();
                    break;
                case FRAME_EDIT_TYPE.AS_TYPE:
                    let selectedList = this.state.selected;
                    if (selectedList.length === 0) {
                        // select all
                        selectedList = this.state.columnList;
                    }
                    selectedList.forEach((col, idx) => {
                        var value = $(this.wrapSelector('.vp-inner-popup-astype'+idx)).val();
                        if (value !== undefined && value !== '') {
                            content[idx] = {
                                label: col.code,
                                value: value
                            };
                        }
                    });
                    break;
                case FRAME_EDIT_TYPE.DISCRETIZE:
                    content['input'] = $(this.wrapSelector('.vp-inner-popup-input')).val();
                    content['inputastext'] = $(this.wrapSelector('.vp-inner-popup-inputastext')).prop('checked');
                    content['bins'] = $(this.wrapSelector('.vp-inner-popup-bins')).val();
                    content['type'] = $(this.wrapSelector('.vp-inner-popup-discretizetype')).val();
                    content['isright'] = $(this.wrapSelector('.vp-inner-popup-right')).prop('checked');
                    let labelastext = $(this.wrapSelector('.vp-inner-popup-labelastext')).prop('checked');
                    let islabelchanged = $(this.wrapSelector('.vp-inner-popup-islabelchanged')).val() === 'true';
                    let isedgechanged = $(this.wrapSelector('.vp-inner-popup-isedgechanged')).val() === 'true';
                    let rangeTableTags = $(this.wrapSelector('.vp-inner-popup-range-table tbody tr'));
                    let labels = [];
                    let edges = [];
                    rangeTableTags && rangeTableTags.each((idx, tag) => {
                        if (islabelchanged === true) {
                            labels.push(com_util.convertToStr($(tag).find('.vp-inner-popup-label').val(), labelastext));
                        }
                        if (content['type'] === 'cut' && isedgechanged === true) {
                            edges.push($(tag).find('.vp-inner-popup-left-edge').val());
                            if (idx === (rangeTableTags.length - 1)) {
                                edges.push($(tag).find('.vp-inner-popup-right-edge').val());
                            }
                        }
                    });
                    content['labels'] = labels;
                    content['edges'] = edges;
                    break;
                case FRAME_EDIT_TYPE.DATA_SHIFT:
                    content['periods'] = $(this.wrapSelector('.vp-inner-popup-periods')).val();
                    content['freq'] = $(this.wrapSelector('.vp-inner-popup-freq')).val();
                    let fillValue = $(this.wrapSelector('.vp-inner-popup-fillvalue')).val();
                    let fillValueAsText= $(this.wrapSelector('.vp-inner-popup-fillvalueastext')).prop('checked');
                    content['fill_value'] = '';
                    if (fillValue && fillValue !== '') {
                        content['fill_value'] = com_util.convertToStr(fillValue, fillValueAsText);
                    }
                    break;
                case FRAME_EDIT_TYPE.FILL_NA:
                    content['method'] = $(this.wrapSelector('.vp-inner-popup-method')).val();
                    content['value'] = $(this.wrapSelector('.vp-inner-popup-value')).val();
                    content['valueastext'] = $(this.wrapSelector('.vp-inner-popup-valueastext')).prop('checked');
                    content['limit'] = $(this.wrapSelector('.vp-inner-popup-limit')).val();
                    break;
                case FRAME_EDIT_TYPE.DROP_NA:
                    content['how'] = $(this.wrapSelector('.vp-inner-popup-how')).val();
                    content['thresh'] = $(this.wrapSelector('.vp-inner-popup-thresh')).val();
                    content['ignore_index'] = $(this.wrapSelector('.vp-inner-popup-ignoreindex')).val();
                    break;
                case FRAME_EDIT_TYPE.FILL_OUT:
                    content['filltype'] = $(this.wrapSelector('.vp-inner-popup-filltype')).val();
                    content['fillvalue'] = $(this.wrapSelector('.vp-inner-popup-fillvalue')).val();
                    break;
                case FRAME_EDIT_TYPE.DROP_DUP:
                    content['keep'] = $(this.wrapSelector('.vp-inner-popup-how')).val();
                    content['ignore_index'] = $(this.wrapSelector('.vp-inner-popup-ignoreindex')).val();
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
                                , 'vp_rendered_html'); // 'rendered_html' style from jupyter output area
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
            $(this.wrapSelector(`.${VP_FE_TABLE} th:not(.${VP_FE_TABLE_COLUMN_GROUP}).selected`)).each((idx, tag) => {
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
            var subsetObjStr = tempObj;
            if (selectedName && selectedName !== '') {
                if (this.state.selected.length > 1) {
                    subsetObjStr += "[[" + selectedName + "]]";
                } else {
                    subsetObjStr += "[" + selectedName + "]";
                }
            }
    
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
                    Object.keys(content['list']).forEach((key, idx) => {
                        if (content['list'][key].value !== undefined && content['list'][key].value !== '') {
                            renameList.push(com_util.formatString("{0}: {1}", content['list'][key].label, com_util.convertToStr(content['list'][key].value, content['list'][key].istext)));
                        }
                    });
                    if (renameList.length > 0) {
                        code.appendFormat("{0}.rename({1}={{2}}", tempObj, axis==FRAME_AXIS.ROW?'index':'columns', renameList.join(', '));
                        if (content['level'] !== undefined) {
                            code.appendFormat(", level={0}", content['level']);
                        }
                        code.append(', inplace=True)')
                    }
                    break;
                case FRAME_EDIT_TYPE.DROP_NA:
                    var dropNAOptions = [];
                    if (axis == FRAME_AXIS.ROW) {
                        dropNAOptions.push("axis=1");
                    } else {
                        dropNAOptions.push("axis=0");
                    }
                    if (selectedName && selectedName !== '') {
                        dropNAOptions.push(com_util.formatString("subset=[{0}]", selectedName));
                    }
                    if (content.how && content.how !== '') {
                        dropNAOptions.push(com_util.formatString("how='{0}'", content.how));
                    }
                    if (content.thresh && content.thresh !== '') {
                        dropNAOptions.push(com_util.formatString("thresh={0}", content.thresh));
                    }
                    if (content.ignore_index && content.ignore_index !== '') {
                        dropNAOptions.push(com_util.formatString("ignore_index={0}", content.ignore_index));
                    }
                    dropNAOptions.push("inplace=True");
                    code.appendFormat("{0}.dropna({1})", tempObj, dropNAOptions.join(', '));
                    break;
                case FRAME_EDIT_TYPE.DROP_DUP:
                    let dropDupOptions = [];
                    if (selectedName && selectedName !== '') {
                        dropDupOptions.push(com_util.formatString("subset=[{0}]", selectedName));
                    }
                    if (content.keep && content.keep !== '') {
                        dropDupOptions.push(com_util.formatString("keep={0}", content.keep));
                    }
                    if (content.ignore_index && content.ignore_index !== '') {
                        dropDupOptions.push(com_util.formatString("ignore_index={0}", content.ignore_index));
                    }
                    dropDupOptions.push("inplace=True");
                    code.appendFormat("{0}.drop_duplicates({1})", tempObj, dropDupOptions.join(', '));
                    break;
                case FRAME_EDIT_TYPE.FILL_OUT:
                    if (axis == FRAME_AXIS.COLUMN) {
                        code.appendFormat("{0} = vp_fill_outlier({1}, [{2}], fill_type='{3}'", tempObj, tempObj, selectedName, content.filltype);
                        if (content.filltype === 'value') {
                            code.appendFormat(", fill_value_lst={0}", content.fillvalue);
                        }
                        code.append(")");
                    }
                    break;
                case FRAME_EDIT_TYPE.DROP_OUT:
                    if (axis == FRAME_AXIS.COLUMN) {
                        code.appendFormat("{0} = vp_drop_outlier({1}, [{2}])", tempObj, tempObj, selectedName);
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
                    code.appendFormat("{0}.reset_index(inplace=True)", tempObj);
                    break;
                case FRAME_EDIT_TYPE.SORT_INDEX:
                    let selectedStr = '';
                    if (content.values.length > 1) {
                        selectedStr = content.values.join(',');
                    }
                    code.appendFormat("{0}.sort_index(axis={1}, ascending={2}", tempObj, content.axis, content.ascending);
                    if (selectedStr !== '') {
                        code.appendFormat(', level=[{0}]', selectedStr);
                    }
                    code.append(', inplace=True)');
                    break;
                case FRAME_EDIT_TYPE.SORT_VALUES:
                    if (axis == FRAME_AXIS.COLUMN) {
                        let selectedStr = '';
                        if (content.values.length > 1) {
                            selectedStr = "[" + content.values.join(',') + "]";
                        } else {
                            selectedStr = content.values[0];
                        }
                        code.appendFormat("{0}.sort_values(by={1}, ascending={2}, inplace=True)", tempObj, selectedStr, content.ascending);
                    }
                    break;
                case FRAME_EDIT_TYPE.ADD_COL:
                    // if no name entered
                    if (content.name == '') {
                        return '';
                    }
                    var tab = content.addtype;
                    if (tab == 'calculate') {
                        let values = [];
                        content['values'] && content['values'].forEach((val, idx) => {
                            if (idx > 0) {
                                values.push(content['opers'][idx - 1]);
                            }
                            values.push(val);
                        });
                        let valueStr = values.join(' ');
                        if (valueStr === "" || valueStr === "''") {
                            code.appendFormat("{0}[{1}] = np.NaN", tempObj, content.name);
                        } else {
                            code.appendFormat("{0}[{1}] = {2}", tempObj, content.name, valueStr);
                        }
                    } else if (tab == 'replace') {
                        var replaceStr = new com_String();
                        var targetName = content['target'];
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
                        code.appendFormat("{0}[{1}] = {2}[[{3}]].replace({{4}}", tempObj, content.name, tempObj, targetName, replaceStr);
                        if (useRegex) {
                            code.append(', regex=True');
                        }
                        code.append(')');
                    } else if (tab == 'apply') {
                        // code.appendFormat("{0}[{1}] = {2}[{3}].apply({4})", tempObj, content.name, tempObj, content.column, content.apply);
                        let lambdaCode = 'lambda x: ';
                        content['caseList'].forEach(obj => {
                            // value if (cond list) else
                            let caseCode = obj.value + ' ';
                            let condCode = '';
                            obj.condList.forEach((condObj, idx) => {
                                let { oper, cond, connector } = condObj;
                                condCode += `(x ${oper} ${cond})`;
                                if (connector !== undefined) {
                                    condCode += ` ${connector} `;
                                }
                            });
                            caseCode += 'if ' + condCode + ' else ';
                            lambdaCode += caseCode;
                        });
                        lambdaCode += content['else'];
                        code.appendFormat("{0}[{1}] = {2}[{3}].apply({4})", tempObj, content.name, tempObj, content.target, lambdaCode);
                    } else if (tab === 'condition') {
                        code.appendFormat("{0}.loc[", tempObj);
                        content['list'].forEach((obj, idx) => {
                            let { colName, oper, cond, condAsText, connector } = obj;
                            code.append('(');

                            let colValue = tempObj;
                            if (colName && colName != '') {
                                if (colName == '.index') {
                                    colValue += colName;
                                } else {
                                    colValue += com_util.formatString('[{0}]', colName);
                                }
                            }
                            let condValue = com_util.convertToStr(cond, condAsText);
                            if (oper == 'contains') {
                                code.appendFormat('{0}.str.contains({1})', colValue, condValue);
                            } else if (oper == 'not contains') {
                                code.appendFormat('~{0}.str.contains({1})', colValue, condValue);
                            } else if (oper == 'starts with') {
                                code.appendFormat('{0}.str.startswith({1})', colValue, condValue);
                            } else if (oper == 'ends with') {
                                code.appendFormat('{0}.str.endswith({1})', colValue, condValue);
                            } else if (oper == 'isnull()' || oper == 'notnull()') {
                                code.appendFormat('{0}.{1}', colValue, oper);
                            } else {
                                code.appendFormat('{0}{1}{2}', colValue, oper != ''?(' ' + oper):'', condValue != ''?(' ' + condValue):'');
                            }
                            code.append(')');
                            if (idx < (content['list'].length - 1)) {
                                code.append(connector);
                            }
                        });
                        var value = com_util.convertToStr(content.value, content.valueastext);
                        code.appendFormat(", {0}] = {1}", content.name, value);
                    }
                    break;
                case FRAME_EDIT_TYPE.ADD_ROW: 
                    // if no name entered
                    if (content.name == '') {
                        return '';
                    }
                    var tab = content.addtype;
                    let values = [];
                    content['values'] && content['values'].forEach((val, idx) => {
                        if (idx > 0) {
                            values.push(content['opers'][idx - 1]);
                        }
                        values.push(val);
                    });
                    code.appendFormat("{0}.loc[{1}] = {2}", tempObj, content.name, values.join(' '));
                    break;
                case FRAME_EDIT_TYPE.REPLACE:
                    var name = content.name;
                    var tab = content.replacetype;
                    if (tab === 'replace') {
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
                    } else if (tab === 'condition') {
                        code.appendFormat("{0}.loc[", tempObj);
                        content['list'].forEach((obj, idx) => {
                            let { colName, oper, cond, condAsText, connector } = obj;
                            code.append('(');

                            let colValue = tempObj;
                            if (colName && colName != '') {
                                if (colName == '.index') {
                                    colValue += colName;
                                } else {
                                    colValue += com_util.formatString('[{0}]', colName);
                                }
                            }
                            let condValue = com_util.convertToStr(cond, condAsText);
                            if (oper == 'contains') {
                                code.appendFormat('{0}.str.contains({1})', colValue, condValue);
                            } else if (oper == 'not contains') {
                                code.appendFormat('~{0}.str.contains({1})', colValue, condValue);
                            } else if (oper == 'starts with') {
                                code.appendFormat('{0}.str.startswith({1})', colValue, condValue);
                            } else if (oper == 'ends with') {
                                code.appendFormat('{0}.str.endswith({1})', colValue, condValue);
                            } else if (oper == 'isnull()' || oper == 'notnull()') {
                                code.appendFormat('{0}.{1}', colValue, oper);
                            } else {
                                code.appendFormat('{0}{1}{2}', colValue, oper != ''?(' ' + oper):'', condValue != ''?(' ' + condValue):'');
                            }
                            code.append(')');
                            if (idx < (content['list'].length - 1)) {
                                code.append(connector);
                            }
                        });
                        var value = com_util.convertToStr(content.value, content.valueastext);
                        code.appendFormat(", {0}] = {1}", content.name, value);
                    }
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
                case FRAME_EDIT_TYPE.DISCRETIZE:
                    let newColumn = com_util.convertToStr(content['input'], content['inputastext']);
                    let method = content['type'];
                    let bins = content['bins'];
                    if (method === 'cut') {
                        if (content['edges'] && content['edges'].length > 0) {
                            bins = "[" + content['edges'].join(',') + "]";
                        }
                    }

                    code.appendFormat("{0}[{1}] = pd.{2}({3}[{4}], {5}"
                        , tempObj, newColumn, method, tempObj, selectedName, bins);

                    if (method === 'cut' && content['isright'] === false) {
                        code.append(", right=False");
                    }
                    if (content['labels'] && content['labels'].length > 0) {
                        code.appendFormat(", labels=[{0}]", content['labels'].join(', '));
                    } else {
                        code.append(", labels=False");
                    }
                    code.append(')');
                    break;
                case FRAME_EDIT_TYPE.DATA_SHIFT:
                    code.appendFormat("{0} = {1}.shift({2}", subsetObjStr, subsetObjStr, content['periods']);
                    if (content['freq'] && content['freq'] !== '') {
                        code.appendFormat(", freq='{0}'", content['freq']);
                    }
                    if (content['fill_value'] && content['fill_value'] !== '') {
                        code.appendFormat(", fill_value={0}", content['fill_value']);
                    }
                    code.append(')');
                    break;
                case FRAME_EDIT_TYPE.FILL_NA:
                    code.appendFormat("{0} = {1}.fillna(", subsetObjStr, subsetObjStr);
                    if (content['method'] == 'value') {
                        code.append(com_util.convertToStr(content['value'], content['valueastext']));
                    } else if (content['method'] === 'ffill' || content['method'] === 'bfill') {
                        code.appendFormat("method='{0}'", content['method']);
                        if (content['limit'] && content['limit'] !== '') {
                            code.appendFormat(", limit={0}", content['limit']);
                        }
                    } else {
                        code.appendFormat("{0}.{1}()", subsetObjStr, content['method']);
                    }
                    code.append(')');
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
                            var columnInfo = JSON.parse(columnResult);
                            let { name:columnName='', level:columnLevel, list:columnList } = columnInfo;
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
                                if (columnLevel > 1) {
                                    for (let colLevIdx = 0; colLevIdx < columnLevel; colLevIdx++) {
                                        table.appendLine('<tr><th></th>');
                                        let colIdx = 0;
                                        let colSpan = 1;
                                        while (colIdx < columnList.length) {
                                            let col = columnList[colIdx];
                                            let colCode = col.code.slice(0, colLevIdx + 1).join(',');
                                            let nextCol = columnList[colIdx + 1];
                                            if (nextCol && nextCol.code.slice(0, colLevIdx + 1).join(',') === colCode) {
                                                colSpan++;
                                            } else {
                                                let colClass = '';
                                                let selected = ''; // set class if it's leaf node of columns on multi-level
                                                if (that.state.axis == FRAME_AXIS.COLUMN && that.state.selected.map(col=>col.code[colLevIdx]).includes(colCode)) {
                                                    selected = 'selected';
                                                }
                                                if ((columnLevel - 1) === colLevIdx) {
                                                    colClass = VP_FE_TABLE_COLUMN;
                                                } else {
                                                    colClass = VP_FE_TABLE_COLUMN_GROUP;
                                                }
                                                table.appendFormatLine('<th data-code="({0})" data-axis="{1}" data-type="{2}" data-parent="{3}" data-label="{4}" class="{5} {6}" colspan="{7}">{8}</th>'
                                                                , colCode, FRAME_AXIS.COLUMN, col.type, col.label[colLevIdx-1], col.label[colLevIdx], colClass, selected, colSpan, col.label[colLevIdx]);
                                                colSpan = 1;
                                            }
                                            colIdx++;
                                        }
    
                                        // add column
                                        // LAB: img to url
                                        // table.appendFormatLine('<th class="{0}"><img src="{1}"/></th>', VP_FE_ADD_COLUMN, com_Const.IMAGE_PATH + 'plus.svg');
                                        if (colLevIdx === 0) {
                                            table.appendFormatLine('<th class="{0}"><div class="{1}"></div></th>', VP_FE_ADD_COLUMN, 'vp-icon-plus');
                                        }
                        
                                        table.appendLine('</tr>');
                                    }
                                } else {
                                    table.appendLine('<tr><th></th>');
                                    columnList && columnList.forEach(col => {
                                        var colCode = col.code;
                                        var colClass = '';
                                        if (that.state.axis == FRAME_AXIS.COLUMN && that.state.selected.map(col=>col.code).includes(colCode)) {
                                            colClass = 'selected';
                                        }
                                        table.appendFormatLine('<th data-code="{0}" data-axis="{1}" data-type="{2}" data-label="{3}" class="{4} {5}">{6}</th>'
                                                                , colCode, FRAME_AXIS.COLUMN, col.type, col.label, VP_FE_TABLE_COLUMN, colClass, col.label);
                                    });
                                    // // add column
                                    table.appendFormatLine('<th class="{0}"><div class="{1}"></div></th>', VP_FE_ADD_COLUMN, 'vp-icon-plus');
                    
                                    table.appendLine('</tr>');
                                }
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
                                // table.appendFormatLine('<th class="{0}"><div class="{1}"></div></th>', VP_FE_ADD_ROW, 'vp-icon-plus');
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
                            that.state.columnLevel = columnLevel;
                            that.state.columnList = columnList;
                            if (!more) {
                                that.state.indexList = indexList;
                            } else {
                                that.state.indexList = that.state.indexList.concat(indexList);
                            }
        
        
                            // load info
                            that.loadInfo();
                            // load toolbar
                            that.renderToolbar();
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

                            // if add column, go to the right position
                            if (that.state.popup.type === FRAME_EDIT_TYPE.ADD_COL) {
                                $(that.wrapSelector('.vp-fe-add-column'))[0].scrollIntoView();
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
    const VP_FE_TABLE_COLUMN_GROUP = 'vp-fe-table-column-group';
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

        ADD_COL: 97,
        ADD_ROW: 98,
        DROP: 3,
        RENAME: 2,
        AS_TYPE: 10,
        REPLACE: 9,
        DISCRETIZE: 15,

        SET_IDX: 7,
        RESET_IDX: 8,
        DATA_SHIFT: 14,

        SORT_INDEX: 16,
        SORT_VALUES: 17,

        ONE_HOT_ENCODING: 6,
        LABEL_ENCODING: 12,

        FILL_NA: 13,
        DROP_NA: 4,
        FILL_OUT: 18, 
        DROP_OUT: 11,
        DROP_DUP: 5,

        SHOW: 99
    }

    const FRAME_AXIS = {
        NONE: -1,
        ROW: 0,
        COLUMN: 1
    }

    const FRAME_SELECT_TYPE = {
        NONE: -1,  // no problem with every selection type
        SINGLE: 0, // only single select supported
        MULTI: 1   // more than 1 selection needed
    }

    return Frame;
});