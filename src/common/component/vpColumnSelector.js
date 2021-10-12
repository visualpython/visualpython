/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : vpColumnSelector.js
 *    Author          : Black Logic
 *    Note            : Groupby app
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 10. 05
 *    Change Date     :
 */
define([
    'nbextensions/visualpython/src/common/constant',
    'nbextensions/visualpython/src/common/StringBuilder',
    'nbextensions/visualpython/src/common/vpCommon',
    'nbextensions/visualpython/src/common/component/vpSuggestInputText',
    'nbextensions/visualpython/src/common/kernelApi'
], function(vpConst, sb, vpCommon, vpSuggestInputText, kernelApi) {

    //========================================================================
    // Define variable
    //========================================================================
    /** select */
    const APP_PREFIX = 'vp-cs'
    const APP_SELECT_CONTAINER = APP_PREFIX + '-select-container';
    const APP_SELECT_LEFT = APP_PREFIX + '-select-left';
    const APP_SELECT_BTN_BOX = APP_PREFIX + '-select-btn-box';
    const APP_SELECT_RIGHT = APP_PREFIX + '-select-right';

    const APP_SELECT_BOX = APP_PREFIX + '-select-box';
    const APP_SELECT_ITEM = APP_PREFIX + '-select-item';
    
    /** select left */
    const APP_SELECT_SEARCH = APP_PREFIX + '-select-search';
    const APP_DROPPABLE = APP_PREFIX + '-droppable';
    const APP_DRAGGABLE = APP_PREFIX + '-draggable';

    /** select btns */
    const APP_SELECT_ADD_ALL_BTN = APP_PREFIX + '-select-add-all-btn';
    const APP_SELECT_ADD_BTN = APP_PREFIX + '-select-add-btn';
    const APP_SELECT_DEL_BTN = APP_PREFIX + '-select-del-btn';
    const APP_SELECT_DEL_ALL_BTN = APP_PREFIX + '-select-del-all-btn';


    //========================================================================
    // [CLASS] ColumnSelector
    //========================================================================
    class ColumnSelector {

        /**
         * 
         * @param {string} frameSelector        query for parent component
         * @param {string} dataframe            dataframe variable name
         * @param {Array<string>} selectedList  
         * @param {Array<string>} includeList   
         */
        constructor(frameSelector, dataframe, selectedList=[], includeList=[]) {
            this.uuid = 'u' + vpCommon.getUUID();
            this.frameSelector = frameSelector;
            this.dataframe = dataframe;
            this.selectedList = selectedList;
            this.includeList = includeList;
            this.columnList = [];
            this.pointer = { start: -1, end: -1 };

            var that = this;
            kernelApi.getColumnList(dataframe, function(result) {
                var colList = JSON.parse(result);
                colList = colList.map(function(x) {
                    return {
                        ...x,
                        value: x.label,
                        code: x.value
                    };
                });
                if (includeList && includeList.length > 0) {
                    that.columnList = colList.filter(col => includeList.includes(col.code));
                } else {
                    that.columnList = colList;
                }
                that.load();
                that.bindEvent();
                that.bindDraggable();
            });
        }

        _wrapSelector(query='') {
            return vpCommon.formatString('.{0} {1}', this.uuid, query);
        }

        load() {
            $(vpCommon.wrapSelector(this.frameSelector)).html(this.render());
            vpCommon.loadCssForDiv(this._wrapSelector(), Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + 'common/component/columnSelector.css');
        }

        getColumnList() {
            var colTags = $(this._wrapSelector('.' + APP_SELECT_ITEM + '.added:not(.moving)'));
            var colList = [];
            if (colTags.length > 0) {
                for (var i = 0; i < colTags.length; i++) {
                    var colName = $(colTags[i]).data('colname');
                    var colDtype = $(colTags[i]).data('dtype');
                    var colCode = $(colTags[i]).data('code');
                    if (colCode) {
                        colList.push({ name: colName, dtype: colDtype, code: colCode});                   
                    }
                }
            }
            return colList;
        }

        render() {
            var that = this;

            var tag = new sb.StringBuilder();
            tag.appendFormatLine('<div class="{0} {1}">', APP_SELECT_CONTAINER, this.uuid);
            // col select - left
            tag.appendFormatLine('<div class="{0}">', APP_SELECT_LEFT);
            // tag.appendFormatLine('<input type="text" class="{0}" placeholder="{1}"/>'
            //                         , APP_SELECT_SEARCH, 'Search Column');
            var vpSearchSuggest = new vpSuggestInputText.vpSuggestInputText();
            vpSearchSuggest.addClass(APP_SELECT_SEARCH);
            vpSearchSuggest.setPlaceholder('Search Column');
            vpSearchSuggest.setSuggestList(function() { return that.columnList; });
            vpSearchSuggest.setSelectEvent(function(value) {
                $(this.wrapSelector()).val(value);
                $(this.wrapSelector()).trigger('change');
            });
            vpSearchSuggest.setNormalFilter(true);
            tag.appendLine(vpSearchSuggest.toTagString());
            tag.appendFormatLine('<i class="fa fa-search search-icon"></i>')
            
            var selectionList = this.columnList.filter(col => !that.selectedList.includes(col.code));
            tag.appendLine(this.renderColumnSelectionBox(selectionList));
            tag.appendLine('</div>');  // APP_SELECT_LEFT
            // col select - buttons
            tag.appendFormatLine('<div class="{0}">', APP_SELECT_BTN_BOX);
            tag.appendFormatLine('<button type="button" class="{0}" title="{1}">{2}</button>'
                                , APP_SELECT_ADD_ALL_BTN, 'Add all columns', '<img src="/nbextensions/visualpython/resource/arrow_right_double.svg"/></i>');
            tag.appendFormatLine('<button type="button" class="{0}" title="{1}">{2}</button>'
                                ,  APP_SELECT_ADD_BTN, 'Add selected columns', '<img src="/nbextensions/visualpython/resource/arrow_right.svg"/></i>');
            tag.appendFormatLine('<button type="button" class="{0}" title="{1}">{2}</button>'
                                , APP_SELECT_DEL_BTN, 'Remove selected columns', '<img src="/nbextensions/visualpython/resource/arrow_left.svg"/>');
            tag.appendFormatLine('<button type="button" class="{0}" title="{1}">{2}</button>'
                                , APP_SELECT_DEL_ALL_BTN, 'Remove all columns', '<img src="/nbextensions/visualpython/resource/arrow_left_double.svg"/>');
            tag.appendLine('</div>');  // APP_SELECT_BTNS
            // col select - right
            tag.appendFormatLine('<div class="{0}">', APP_SELECT_RIGHT);
            var selectedList = this.columnList.filter(col => that.selectedList.includes(col.code));
            tag.appendLine(this.renderColumnSelectedBox(selectedList));
            tag.appendLine('</div>');  // APP_SELECT_RIGHT
            tag.appendLine('</div>');  // APP_SELECT_CONTAINER
            return tag.toString();
        }

        renderColumnSelectionBox(colList) {
            var tag = new sb.StringBuilder();
            tag.appendFormatLine('<div class="{0} {1} {2} {3}">', APP_SELECT_BOX, 'left', APP_DROPPABLE, 'no-selection');
            // get col data and make draggable items
            colList && colList.forEach((col, idx) => {
                // col.array parsing
                var colInfo = vpCommon.safeString(col.array);
                // render column box
                tag.appendFormatLine('<div class="{0} {1}" data-idx="{2}" data-colname="{3}" data-dtype="{4}" data-code="{5}" title="{6}"><span>{7}</span></div>'
                                    , APP_SELECT_ITEM, APP_DRAGGABLE, col.location, col.value, col.dtype, col.code, col.label + ': \n' + colInfo, col.label);
            });
            tag.appendLine('</div>');  // APP_SELECT_BOX
            return tag.toString();
        }

        renderColumnSelectedBox(colList) {
            var tag = new sb.StringBuilder();
            tag.appendFormatLine('<div class="{0} {1} {2} {3}">', APP_SELECT_BOX, 'right', APP_DROPPABLE, 'no-selection');
            // get col data and make draggable items
            colList && colList.forEach((col, idx) => {
                // col.array parsing
                var colInfo = vpCommon.safeString(col.array);
                // render column box
                tag.appendFormatLine('<div class="{0} {1} {2}" data-idx="{3}" data-colname="{4}" data-dtype="{5}" data-code="{6}" title="{7}"><span>{8}</span></div>'
                                    , APP_SELECT_ITEM, APP_DRAGGABLE, 'added', col.location, col.value, col.dtype, col.code, col.label + ': \n' + colInfo, col.label);
            });
            tag.appendLine('</div>');  // APP_SELECT_BOX
            return tag.toString();
        }

        bindEvent() {
            var that = this;
            // item indexing - search columns
            $(this._wrapSelector('.' + APP_SELECT_SEARCH)).on('change', function(event) {
                var searchValue = $(this).val();
                
                // filter added columns
                var addedTags = $(that._wrapSelector('.' + APP_SELECT_RIGHT + ' .' + APP_SELECT_ITEM + '.added'));
                var addedColumnList = [];
                for (var i = 0; i < addedTags.length; i++) {
                    var value = $(addedTags[i]).attr('data-colname');
                    addedColumnList.push(value);
                }
                var filteredColumnList = that.columnList.filter(x => x.value.includes(searchValue) && !addedColumnList.includes(x.value));

                // column indexing
                $(that._wrapSelector('.' + APP_SELECT_BOX + '.left')).replaceWith(function() {
                    return that.renderColumnSelectionBox(filteredColumnList);
                });

                // draggable
                that.bindDraggable();
            });

            // item indexing
            $(this._wrapSelector('.' + APP_SELECT_ITEM)).on('click', function(event) {
                var dataIdx = $(this).attr('data-idx');
                var idx = $(this).index();
                var added = $(this).hasClass('added'); // right side added item?
                var selector = '';

                // remove selection for select box on the other side
                if (added) {
                    // remove selection for left side
                    $(that._wrapSelector('.' + APP_SELECT_ITEM + ':not(.added)')).removeClass('selected');
                    // set selector
                    selector = '.added';
                } else {
                    // remove selection for right(added) side
                    $(that._wrapSelector('.' + APP_SELECT_ITEM + '.added')).removeClass('selected');
                    // set selector
                    selector = ':not(.added)';
                }

                if (vpKeyManager.keyCheck.ctrlKey) {
                    // multi-select
                    that.pointer = { start: idx, end: -1 };
                    $(this).toggleClass('selected');
                } else if (vpKeyManager.keyCheck.shiftKey) {
                    // slicing
                    var startIdx = that.pointer.start;
                    
                    if (startIdx == -1) {
                        // no selection
                        that.pointer = { start: idx, end: -1 };
                    } else if (startIdx > idx) {
                        // add selection from idx to startIdx
                        var tags = $(that._wrapSelector('.' + APP_SELECT_ITEM + selector));
                        for (var i = idx; i <= startIdx; i++) {
                            $(tags[i]).addClass('selected');
                        }
                        that.pointer = { start: startIdx, end: idx };
                    } else if (startIdx <= idx) {
                        // add selection from startIdx to idx
                        var tags = $(that._wrapSelector('.' + APP_SELECT_ITEM + selector));
                        for (var i = startIdx; i <= idx; i++) {
                            $(tags[i]).addClass('selected');
                        }
                        that.pointer = { start: startIdx, end: idx };
                    }
                } else {
                    // single-select
                    that.pointer = { start: idx, end: -1 };
                    // un-select others
                    $(that._wrapSelector('.' + APP_SELECT_ITEM + selector)).removeClass('selected');
                    // select this
                    $(this).addClass('selected');
                }
            });

            // item indexing - add all
            $(this._wrapSelector('.' + APP_SELECT_ADD_ALL_BTN)).on('click', function(event) {
                $(that._wrapSelector('.' + APP_SELECT_BOX + '.left .' + APP_SELECT_ITEM)).appendTo(
                    $(that._wrapSelector('.' + APP_SELECT_BOX + '.right'))
                );
                $(that._wrapSelector('.' + APP_SELECT_ITEM)).addClass('added');
                $(that._wrapSelector('.' + APP_SELECT_ITEM + '.selected')).removeClass('selected');
                that.pointer = { start: -1, end: -1 };
            });

            // item indexing - add
            $(this._wrapSelector('.' + APP_SELECT_ADD_BTN)).on('click', function(event) {
                var selector = '.selected';

                $(that._wrapSelector('.' + APP_SELECT_ITEM + selector)).appendTo(
                    $(that._wrapSelector('.' + APP_SELECT_BOX + '.right'))
                );
                $(that._wrapSelector('.' + APP_SELECT_ITEM + selector)).addClass('added');
                $(that._wrapSelector('.' + APP_SELECT_ITEM + selector)).removeClass('selected');
                that.pointer = { start: -1, end: -1 };
            });

            // item indexing - del
            $(this._wrapSelector('.' + APP_SELECT_DEL_BTN)).on('click', function(event) {
                var selector = '.selected';
                var targetBoxQuery = that._wrapSelector('.' + APP_SELECT_BOX + '.left');

                var selectedTag = $(that._wrapSelector('.' + APP_SELECT_ITEM + selector));
                selectedTag.appendTo(
                    $(targetBoxQuery)
                );
                // sort
                $(targetBoxQuery + ' .' + APP_SELECT_ITEM).sort(function(a, b) {
                    return ($(b).data('idx')) < ($(a).data('idx')) ? 1 : -1;
                }).appendTo(
                    $(targetBoxQuery)
                );
                selectedTag.removeClass('added');
                selectedTag.removeClass('selected');
                that.pointer = { start: -1, end: -1 };
            });

            // item indexing - delete all
            $(this._wrapSelector('.' + APP_SELECT_DEL_ALL_BTN)).on('click', function(event) {
                var targetBoxQuery = that._wrapSelector('.' + APP_SELECT_BOX + '.left');
                $(that._wrapSelector('.' + APP_SELECT_BOX + '.right .' + APP_SELECT_ITEM)).appendTo(
                    $(targetBoxQuery)
                );
                // sort
                $(targetBoxQuery + ' .' + APP_SELECT_ITEM).sort(function(a, b) {
                    return ($(b).data('idx')) < ($(a).data('idx')) ? 1 : -1;
                }).appendTo(
                    $(targetBoxQuery)
                );
                $(that._wrapSelector('.' + APP_SELECT_ITEM)).removeClass('added');
                $(that._wrapSelector('.' + APP_SELECT_ITEM + '.selected')).removeClass('selected');
                that.pointer = { start: -1, end: -1 };
            });
        }

        bindDraggable() {
            var that = this;
            var draggableQuery = this._wrapSelector('.' + APP_DRAGGABLE);
            var droppableQuery = this._wrapSelector('.' + APP_DROPPABLE);
    
            $(draggableQuery).draggable({
                // containment: '.select-' + type + ' .' + APP_DROPPABLE,
                // appendTo: droppableQuery,
                // snap: '.' + APP_DRAGGABLE,
                revert: 'invalid',
                cursor: 'pointer',
                connectToSortable: droppableQuery + '.right',
                // cursorAt: { bottom: 5, right: 5 },
                helper: function() {
                    // selected items
                    var widthString = parseInt($(this).outerWidth()) + 'px';
                    var selectedTag = $(this).parent().find('.selected');
                    if (selectedTag.length <= 0) {
                        selectedTag = $(this);
                    }
                    return $('<div></div>').append(selectedTag.clone().addClass('moving').css({ 
                        width: widthString, border: '0.25px solid #C4C4C4'
                    }));
                }
            });

            $(droppableQuery).droppable({
                accept: draggableQuery,
                drop: function(event, ui) {
                    var dropped = ui.draggable;
                    var droppedOn = $(this);
    
                    // is dragging on same droppable container?
                    if (droppedOn.get(0) == $(dropped).parent().get(0)) {
                        
                        return ;
                    }
    
                    var dropGroup = $(dropped).parent().find('.selected:not(.moving)');
                    // if nothing selected(as orange_text), use dragging item
                    if (dropGroup.length <= 0) {
                        dropGroup = $(dropped);
                    }
                    $(dropGroup).detach().css({top:0, left:0}).appendTo(droppedOn);
    
                    if ($(this).hasClass('right')) {
                        // add
                        $(dropGroup).addClass('added');
                    } else {
                        // del
                        $(dropGroup).removeClass('added');
                        // sort
                        $(droppedOn).find('.' + APP_SELECT_ITEM).sort(function(a, b) {
                            return ($(b).data('idx')) < ($(a).data('idx')) ? 1 : -1;
                        }).appendTo( $(droppedOn) );
                    }
                    // remove selection
                    $(droppableQuery).find('.selected').removeClass('selected');
                    that.pointer = { start: -1, end: -1 };
                },
                over: function(event, elem) {
                },
                out: function(event, elem) {
                }
            });
        }
    }

    return ColumnSelector;
});

/* End of file */