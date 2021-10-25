/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : vpMultiSelector.js
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
    // [CLASS] MultiSelector
    //========================================================================
    class MultiSelector {

        /**
         * 
         * @param {string} frameSelector        query for parent component
         * @param {Object} config  parent:[], selectedList=[], includeList=[]
         */
        constructor(frameSelector, config) {
            this.uuid = 'u' + vpCommon.getUUID();
            this.frameSelector = frameSelector;

            // configuration
            this.config = config;

            var { mode, type, parent, selectedList=[], includeList=[], excludeList=[] } = config;
            this.mode = mode;
            this.parent = parent;
            this.selectedList = selectedList;
            this.includeList = includeList;
            this.excludeList = excludeList;

            this.dataList = [];
            this.pointer = { start: -1, end: -1 };

            var that = this;

            switch (mode) {
                case 'columns':
                    this._getColumnList(parent, function(dataList) {
                        that._executeCallback(dataList);
                    });
                    break;
                case 'variable':
                    this._getVariableList(type, function(dataList) {
                        that._executeCallback(dataList);
                    })
                    break;
            }
        }

        _executeCallback(dataList) {
            if (this.includeList && this.includeList.length > 0) {
                dataList = dataList.filter(data => this.includeList.includes(data.code));
            }
            if (this.excludeList && this.excludeList.length > 0) {
                dataList = dataList.filter(data => !this.excludeList.includes(data.code));
            }
            this.dataList = dataList;

            // load
            this.load();
        }

        _getVariableList(type, callback) {
            kernelApi.searchVarList(type, function(result) {
                try {
                    var dataList = JSON.parse(result);
                    dataList = dataList.map(function(x, idx) {
                        return {
                            ...x,
                            value: x.varName,
                            code: x.varName,
                            type: x.varType,
                            location: idx
                        };
                    });
                    callback(dataList);
                } catch (e) {
                    callback([]);
                }
            });
        }
        
        _getColumnList(parent, callback) {
            if (parent && parent.length > 1) {
                kernelApi.getCommonColumnList(parent, function(result) {
                    try {
                        var colList = JSON.parse(result);
                        colList = colList.map(function(x) {
                            return {
                                ...x,
                                value: x.label,
                                code: x.value,
                                type: x.dtype
                            };
                        });
                        callback(colList);
                    } catch (e) {
                        callback([]);
                    }
                });
            } else {
                kernelApi.getColumnList(parent, function(result) {
                    try {
                        var colList = JSON.parse(result);
                        colList = colList.map(function(x) {
                            return {
                                ...x,
                                value: x.label,
                                code: x.value,
                                type: x.dtype
                            };
                        });
                        callback(colList);
                    } catch (e) {
                        callback([]);
                    }
                });
            }
        }

        _wrapSelector(query='') {
            return vpCommon.formatString('.{0} {1}', this.uuid, query);
        }

        load() {
            $(vpCommon.wrapSelector(this.frameSelector)).html(this.render());
            vpCommon.loadCssForDiv(this._wrapSelector(), Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + 'common/component/multiSelector.css');
            this.bindEvent();
            this.bindDraggable();
        }

        getDataList() {
            var colTags = $(this._wrapSelector('.' + APP_SELECT_ITEM + '.added:not(.moving)'));
            var dataList = [];
            if (colTags.length > 0) {
                for (var i = 0; i < colTags.length; i++) {
                    var name = $(colTags[i]).data('name');
                    var type = $(colTags[i]).data('type');
                    var code = $(colTags[i]).data('code');
                    if (code) {
                        dataList.push({ name: name, type: type, code: code});                   
                    }
                }
            }
            return dataList;
        }

        render() {
            var that = this;

            var tag = new sb.StringBuilder();
            tag.appendFormatLine('<div class="{0} {1}">', APP_SELECT_CONTAINER, this.uuid);
            // select - left
            tag.appendFormatLine('<div class="{0}">', APP_SELECT_LEFT);
            // tag.appendFormatLine('<input type="text" class="{0}" placeholder="{1}"/>'
            //                         , APP_SELECT_SEARCH, 'Search Column');
            var vpSearchSuggest = new vpSuggestInputText.vpSuggestInputText();
            vpSearchSuggest.addClass(APP_SELECT_SEARCH);
            vpSearchSuggest.setPlaceholder('Search ' + this.mode);
            vpSearchSuggest.setSuggestList(function() { return that.dataList; });
            vpSearchSuggest.setSelectEvent(function(value) {
                $(this.wrapSelector()).val(value);
                $(this.wrapSelector()).trigger('change');
            });
            vpSearchSuggest.setNormalFilter(true);
            tag.appendLine(vpSearchSuggest.toTagString());
            tag.appendFormatLine('<i class="fa fa-search search-icon"></i>')
            
            var selectionList = this.dataList.filter(data => !that.selectedList.includes(data.code));
            tag.appendLine(this.renderSelectionBox(selectionList));
            tag.appendLine('</div>');  // APP_SELECT_LEFT
            // select - buttons
            tag.appendFormatLine('<div class="{0}">', APP_SELECT_BTN_BOX);
            tag.appendFormatLine('<button type="button" class="{0}" title="{1}">{2}</button>'
                                , APP_SELECT_ADD_ALL_BTN, 'Add all items', '<img src="/nbextensions/visualpython/resource/arrow_right_double.svg"/></i>');
            tag.appendFormatLine('<button type="button" class="{0}" title="{1}">{2}</button>'
                                ,  APP_SELECT_ADD_BTN, 'Add selected items', '<img src="/nbextensions/visualpython/resource/arrow_right.svg"/></i>');
            tag.appendFormatLine('<button type="button" class="{0}" title="{1}">{2}</button>'
                                , APP_SELECT_DEL_BTN, 'Remove selected items', '<img src="/nbextensions/visualpython/resource/arrow_left.svg"/>');
            tag.appendFormatLine('<button type="button" class="{0}" title="{1}">{2}</button>'
                                , APP_SELECT_DEL_ALL_BTN, 'Remove all items', '<img src="/nbextensions/visualpython/resource/arrow_left_double.svg"/>');
            tag.appendLine('</div>');  // APP_SELECT_BTNS
            // select - right
            tag.appendFormatLine('<div class="{0}">', APP_SELECT_RIGHT);
            var selectedList = this.dataList.filter(data => that.selectedList.includes(data.code));
            tag.appendLine(this.renderSelectedBox(selectedList));
            tag.appendLine('</div>');  // APP_SELECT_RIGHT
            tag.appendLine('</div>');  // APP_SELECT_CONTAINER
            return tag.toString();
        }

        renderSelectionBox(dataList) {
            var tag = new sb.StringBuilder();
            tag.appendFormatLine('<div class="{0} {1} {2} {3}">', APP_SELECT_BOX, 'left', APP_DROPPABLE, 'no-selection');
            // get data and make draggable items
            dataList && dataList.forEach((data, idx) => {
                // for column : data.array parsing
                var info = vpCommon.safeString(data.array);
                // render item box
                tag.appendFormatLine('<div class="{0} {1}" data-idx="{2}" data-name="{3}" data-type="{4}" data-code="{5}" title="{6}"><span>{7}</span></div>'
                                    , APP_SELECT_ITEM, APP_DRAGGABLE, data.location, data.value, data.type, data.code, info?data.value + ': \n' + info:'', data.value);
            });
            tag.appendLine('</div>');  // APP_SELECT_BOX
            return tag.toString();
        }

        renderSelectedBox(dataList) {
            var tag = new sb.StringBuilder();
            tag.appendFormatLine('<div class="{0} {1} {2} {3}">', APP_SELECT_BOX, 'right', APP_DROPPABLE, 'no-selection');
            // get data and make draggable items
            dataList && dataList.forEach((data, idx) => {
                // for column : data.array parsing
                var info = vpCommon.safeString(data.array);
                // render item box
                tag.appendFormatLine('<div class="{0} {1} {2}" data-idx="{3}" data-name="{4}" data-type="{5}" data-code="{6}" title="{7}"><span>{8}</span></div>'
                                    , APP_SELECT_ITEM, APP_DRAGGABLE, 'added', data.location, data.value, data.type, data.code, info?data.value + ': \n' + info:'', data.value);
            });
            tag.appendLine('</div>');  // APP_SELECT_BOX
            return tag.toString();
        }

        bindEvent() {
            var that = this;
            // item indexing - search
            $(this._wrapSelector('.' + APP_SELECT_SEARCH)).on('change', function(event) {
                var searchValue = $(this).val();
                
                // filter added items
                var addedTags = $(that._wrapSelector('.' + APP_SELECT_RIGHT + ' .' + APP_SELECT_ITEM + '.added'));
                var addedList = [];
                for (var i = 0; i < addedTags.length; i++) {
                    var value = $(addedTags[i]).attr('data-colname');
                    addedList.push(value);
                }
                var filteredList = that.dataList.filter(x => x.value.includes(searchValue) && !addedList.includes(x.value));

                // items indexing
                $(that._wrapSelector('.' + APP_SELECT_BOX + '.left')).replaceWith(function() {
                    return that.renderSelectionBox(filteredList);
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

    return MultiSelector;
});

/* End of file */