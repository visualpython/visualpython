/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : MultiSelector.js
 *    Author          : Black Logic
 *    Note            : Multi Selector
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 10. 05
 *    Change Date     :
 */
define([
    __VP_CSS_LOADER__('vp_base/css/component/multiSelector'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/Component',
    'vp_base/js/com/component/SuggestInput'
], function(multiCss, com_Const, com_String, com_util, Component, SuggestInput) {

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
    class MultiSelector extends Component {

        /**
         * 
         * @param {string} frameSelector        query for parent component
         * @param {Object} config  parent:[], selectedList=[], includeList=[]
         */
        constructor(frameSelector, config) {
            super(frameSelector, config, {});
        }

        _init() {
            this.frameSelector = this.$target;

            // configuration
            this.config = this.state;

            var { mode, type, parent, dataList=[], selectedList=[], includeList=[], excludeList=[] } = this.config;
            this.mode = mode;   // variable / columns / index / ndarray0 / ndarray1 / methods / data(given data)
            this.parent = parent;
            this.selectedList = selectedList;
            this.includeList = includeList;
            this.excludeList = excludeList;

            this.dataList = dataList;   // [ { value, code, type }, ... ]
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
                    });
                    break;
                case 'index':
                    this._getRowList(parent, function(dataList) {
                        that._executeCallback(dataList);
                    });
                    break;
                case 'ndarray0':
                    this._getNdarray(parent, 0, function(dataList) {
                        that._executeCallback(dataList);
                    });
                    break;
                case 'ndarray1':
                    this._getNdarray(parent, 1, function(dataList) {
                        that._executeCallback(dataList);
                    });
                    break;
                case 'data':
                    that._executeCallback(this.dataList);
                    break;
            }
        }

        // render() {
        //     ;
        // }

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
            vpKernel.getDataList(type).then(function(resultObj) {
                let { result } = resultObj;
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
            if (Array.isArray(parent) && parent.length > 1) {
                vpKernel.getCommonColumnList(parent).then(function(resultObj) {
                    let { result } = resultObj;
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
                vpKernel.getColumnList(parent).then(function(resultObj) {
                    let { result } = resultObj;
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

        _getRowList(parent, callback) {
            vpKernel.getRowList(parent).then(function(resultObj) {
                let { result } = resultObj;
                try {
                    var rowList = JSON.parse(result);
                    rowList = rowList.map(function(x) {
                        return {
                            ...x,
                            value: x.label,
                            code: x.value,
                            type: x.dtype
                        };
                    });
                    callback(rowList);
                } catch (e) {
                    callback([]);
                }
            });
        }

        _getNdarray(parent, dim, callback) {
            let parentVar = '';
            if (parent && parent.length > 0) {
                parentVar = parent[0];

                let cmd = com_util.formatString('{0}.shape[{1}]', parentVar, dim);
                vpKernel.execute(cmd).then(function(resultObj) {
                    let { result } = resultObj;
                    try {
                        let dimLength = parseInt(result);
                        let ndList = [];
                        for (let i = 0; i < dimLength; i++) {
                            ndList.push({
                                value: i,
                                code: i,
                                type: 'int'
                            });
                        }
                        callback(ndList);
                    } catch (e) {
                        callback([]);
                    }
                });
            } else {
                callback([]);
            }
            
        }

        load() {
            $(this.frameSelector).html(this.render());
            this.bindEvent();
            this.bindDraggable();
        }

        getDataList() {
            var colTags = $(this.wrapSelector('.' + APP_SELECT_ITEM + '.added:not(.moving)'));
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

            var tag = new com_String();
            tag.appendLine('<label>Drag-and-drop columns to right to select.</label>');
            tag.appendFormatLine('<div class="{0} {1}">', APP_SELECT_CONTAINER, this.uuid);
            // select - left
            tag.appendFormatLine('<div class="{0}">', APP_SELECT_LEFT);
            // tag.appendFormatLine('<input type="text" class="{0}" placeholder="{1}"/>'
            //                         , APP_SELECT_SEARCH, 'Search Column');
            var vpSearchSuggest = new SuggestInput();
            vpSearchSuggest.addClass(APP_SELECT_SEARCH);
            vpSearchSuggest.addClass('vp-input');
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
            // LAB: img to url
            // tag.appendFormatLine('<button type="button" class="{0}" title="{1}"><img src="{2}"/></button>'
            //                     , APP_SELECT_ADD_ALL_BTN, 'Add all items', com_Const.IMAGE_PATH + 'arrow_right_double.svg');
            // tag.appendFormatLine('<button type="button" class="{0}" title="{1}"><img src="{2}"/></button>'
            //                     ,  APP_SELECT_ADD_BTN, 'Add selected items', com_Const.IMAGE_PATH + 'arrow_right.svg');
            // tag.appendFormatLine('<button type="button" class="{0}" title="{1}"><img src="{2}"/></button>'
            //                     , APP_SELECT_DEL_BTN, 'Remove selected items', com_Const.IMAGE_PATH + 'arrow_left.svg');
            // tag.appendFormatLine('<button type="button" class="{0}" title="{1}"><img src="{2}"/></button>'
            //                     , APP_SELECT_DEL_ALL_BTN, 'Remove all items', com_Const.IMAGE_PATH + 'arrow_left_double.svg');
            tag.appendFormatLine('<button type="button" class="{0}" title="{1}"><div class="vp-icon-arrow-right-double"></div></button>'
                                , APP_SELECT_ADD_ALL_BTN, 'Add all items');
            tag.appendFormatLine('<button type="button" class="{0}" title="{1}"><div class="vp-icon-arrow-right"></div></button>'
                                ,  APP_SELECT_ADD_BTN, 'Add selected items');
            tag.appendFormatLine('<button type="button" class="{0}" title="{1}"><div class="vp-icon-arrow-left"></div></button>'
                                , APP_SELECT_DEL_BTN, 'Remove selected items');
            tag.appendFormatLine('<button type="button" class="{0}" title="{1}"><div class="vp-icon-arrow-left-double"></div></button>'
                                , APP_SELECT_DEL_ALL_BTN, 'Remove all items');
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
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} {1} {2} {3}">', APP_SELECT_BOX, 'left', APP_DROPPABLE, 'no-selection vp-scrollbar');
            // get data and make draggable items
            dataList && dataList.forEach((data, idx) => {
                // for column : data.array parsing
                var info = com_util.safeString(data.array);
                if (info && info != 'undefined') {
                    info = data.value + ':\n' + info;
                } else {
                    info = '';
                }
                // render item box
                tag.appendFormatLine('<div class="{0} {1}" data-idx="{2}" data-name="{3}" data-type="{4}" data-code="{5}" title="{6}"><span>{7}</span></div>'
                                    , APP_SELECT_ITEM, APP_DRAGGABLE, data.location, data.value, data.type, data.code, info, data.value);
            });
            tag.appendLine('</div>');  // APP_SELECT_BOX
            return tag.toString();
        }

        renderSelectedBox(dataList) {
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} {1} {2} {3}">', APP_SELECT_BOX, 'right', APP_DROPPABLE, 'no-selection vp-scrollbar');
            // get data and make draggable items
            dataList && dataList.forEach((data, idx) => {
                // for column : data.array parsing
                var info = com_util.safeString(data.array);
                if (info) {
                    info = data.value + ':\n';
                } else {
                    info = '';
                }
                // render item box
                tag.appendFormatLine('<div class="{0} {1} {2}" data-idx="{3}" data-name="{4}" data-type="{5}" data-code="{6}" title="{7}"><span>{8}</span></div>'
                                    , APP_SELECT_ITEM, APP_DRAGGABLE, 'added', data.location, data.value, data.type, data.code, info, data.value);
            });
            tag.appendLine('</div>');  // APP_SELECT_BOX
            return tag.toString();
        }

        bindEvent() {
            var that = this;
            // item indexing - search
            $(this.wrapSelector('.' + APP_SELECT_SEARCH)).on('change', function(event) {
                var searchValue = $(this).val();
                
                // filter added items
                var addedTags = $(that.wrapSelector('.' + APP_SELECT_RIGHT + ' .' + APP_SELECT_ITEM + '.added'));
                var addedList = [];
                for (var i = 0; i < addedTags.length; i++) {
                    var value = $(addedTags[i]).attr('data-colname');
                    addedList.push(value);
                }
                var filteredList = that.dataList.filter(x => x.value.includes(searchValue) && !addedList.includes(x.value));

                // items indexing
                $(that.wrapSelector('.' + APP_SELECT_BOX + '.left')).replaceWith(function() {
                    return that.renderSelectionBox(filteredList);
                });

                // draggable
                that.bindDraggable();
            });

            // item indexing
            $(this.wrapSelector('.' + APP_SELECT_ITEM)).on('click', function(event) {
                var dataIdx = $(this).attr('data-idx');
                var idx = $(this).index();
                var added = $(this).hasClass('added'); // right side added item?
                var selector = '';

                // remove selection for select box on the other side
                if (added) {
                    // remove selection for left side
                    $(that.wrapSelector('.' + APP_SELECT_ITEM + ':not(.added)')).removeClass('selected');
                    // set selector
                    selector = '.added';
                } else {
                    // remove selection for right(added) side
                    $(that.wrapSelector('.' + APP_SELECT_ITEM + '.added')).removeClass('selected');
                    // set selector
                    selector = ':not(.added)';
                }

                if (vpEvent.keyManager.keyCheck.ctrlKey) {
                    // multi-select
                    that.pointer = { start: idx, end: -1 };
                    $(this).toggleClass('selected');
                } else if (vpEvent.keyManager.keyCheck.shiftKey) {
                    // slicing
                    var startIdx = that.pointer.start;
                    
                    if (startIdx == -1) {
                        // no selection
                        that.pointer = { start: idx, end: -1 };
                    } else if (startIdx > idx) {
                        // add selection from idx to startIdx
                        var tags = $(that.wrapSelector('.' + APP_SELECT_ITEM + selector));
                        for (var i = idx; i <= startIdx; i++) {
                            $(tags[i]).addClass('selected');
                        }
                        that.pointer = { start: startIdx, end: idx };
                    } else if (startIdx <= idx) {
                        // add selection from startIdx to idx
                        var tags = $(that.wrapSelector('.' + APP_SELECT_ITEM + selector));
                        for (var i = startIdx; i <= idx; i++) {
                            $(tags[i]).addClass('selected');
                        }
                        that.pointer = { start: startIdx, end: idx };
                    }
                } else {
                    // single-select
                    that.pointer = { start: idx, end: -1 };
                    // un-select others
                    $(that.wrapSelector('.' + APP_SELECT_ITEM + selector)).removeClass('selected');
                    // select this
                    $(this).addClass('selected');
                }
            });

            // item indexing - add all
            $(this.wrapSelector('.' + APP_SELECT_ADD_ALL_BTN)).on('click', function(event) {
                $(that.wrapSelector('.' + APP_SELECT_BOX + '.left .' + APP_SELECT_ITEM)).appendTo(
                    $(that.wrapSelector('.' + APP_SELECT_BOX + '.right'))
                );
                $(that.wrapSelector('.' + APP_SELECT_ITEM)).addClass('added');
                $(that.wrapSelector('.' + APP_SELECT_ITEM + '.selected')).removeClass('selected');
                that.pointer = { start: -1, end: -1 };
            });

            // item indexing - add
            $(this.wrapSelector('.' + APP_SELECT_ADD_BTN)).on('click', function(event) {
                var selector = '.selected';

                $(that.wrapSelector('.' + APP_SELECT_ITEM + selector)).appendTo(
                    $(that.wrapSelector('.' + APP_SELECT_BOX + '.right'))
                );
                $(that.wrapSelector('.' + APP_SELECT_ITEM + selector)).addClass('added');
                $(that.wrapSelector('.' + APP_SELECT_ITEM + selector)).removeClass('selected');
                that.pointer = { start: -1, end: -1 };
            });

            // item indexing - del
            $(this.wrapSelector('.' + APP_SELECT_DEL_BTN)).on('click', function(event) {
                var selector = '.selected';
                var targetBoxQuery = that.wrapSelector('.' + APP_SELECT_BOX + '.left');

                var selectedTag = $(that.wrapSelector('.' + APP_SELECT_ITEM + selector));
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
            $(this.wrapSelector('.' + APP_SELECT_DEL_ALL_BTN)).on('click', function(event) {
                var targetBoxQuery = that.wrapSelector('.' + APP_SELECT_BOX + '.left');
                $(that.wrapSelector('.' + APP_SELECT_BOX + '.right .' + APP_SELECT_ITEM)).appendTo(
                    $(targetBoxQuery)
                );
                // sort
                $(targetBoxQuery + ' .' + APP_SELECT_ITEM).sort(function(a, b) {
                    return ($(b).data('idx')) < ($(a).data('idx')) ? 1 : -1;
                }).appendTo(
                    $(targetBoxQuery)
                );
                $(that.wrapSelector('.' + APP_SELECT_ITEM)).removeClass('added');
                $(that.wrapSelector('.' + APP_SELECT_ITEM + '.selected')).removeClass('selected');
                that.pointer = { start: -1, end: -1 };
            });
        }

        bindDraggable() {
            var that = this;
            var draggableQuery = this.wrapSelector('.' + APP_DRAGGABLE);
            var droppableQuery = this.wrapSelector('.' + APP_DROPPABLE);
    
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