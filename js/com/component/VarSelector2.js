define([
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/Component',
], function(com_Const, com_String, com_util, Component) {
    /**
     * @class VarSelector
     * @constructor
     */
     class VarSelector extends Component{
        constructor(parentTag, dataTypes=['DataFrame', 'Series', 'ndarray', 'list', 'dict'], defaultType='', showOthers=true, showFilterbox=true) {
            super(null, {parentTag: parentTag, dataTypes: dataTypes, defaultType: defaultType, showOthers: showOthers, showFilterbox: showFilterbox});
        }

        _init() {
            this._value = "";
            this._placeholder = "Select variable";
            this._compID = "";
            this._additionalClass = "";
            this._normalFilter = true;
            this._suggestList = new Array();
            this._selectEvent = undefined;
            this._attributes = {};
            this._minLength = 0;

            this._parentTag = this.state.parentTag;
            this._dataTypes = this.state.dataTypes;
            this._defaultType = this.state.defaultType;
            this._showOthers = this.state.showOthers;
            this._showFilterbox = this.state.showFilterbox;
            if (this._defaultType == '') {
                if (this._dataTypes.length > 0) {
                    this._defaultType = this._dataTypes[0];
                } else {
                }
            }

            this.state = {
                selectedType: this._defaultType,
                varList: [],
                column: ''
            }

            this.reload();
            this.bindEvent();
        }

        render() {
            ;
        }
        
        bindEvent() {
            let that = this;

            // bind Event on focus/click box
            $(document).on(com_util.formatString("focus.init-{0} click.init-{1}", that.uuid, that.uuid), com_util.formatString(".{0}.{1}", that.uuid, 'vp-vs-uninit'), function () {
                // unbind initial event
                $(document).unbind(com_util.formatString(".init-{0}", that.uuid));
                $(com_util.formatString(".{0}.{1}", that.uuid, 'vp-vs-uninit')).removeClass('vp-vs-uninit').addClass('vp-vs-init');

                // bind autocomplete
                that.bindAutocomplete();

                // bind Event
                $(that._parentTag).on('click', that.wrapSelector('.vp-vs-filter'), function(evt) {
                    // check disabled
                    if (!$(this).parent().find('input').is(':disabled')) {
                        // toggle filter box
                        let isOpen = $(that.wrapSelector('.vp-vs-filter-box')).hasClass('vp-inline-block');
                        $('.vp-vs-filter-box').removeClass('vp-inline-block');
                        
                        if (!isOpen) {
                            // open filter box
                            $(that.wrapSelector('.vp-vs-filter-box')).addClass('vp-inline-block');
                        }
                    }
                    evt.stopPropagation();
                });

                $(that._parentTag).on('click', function(evt) {
                    let target = evt.target;
                    if ($(that.wrapSelector('.vp-vs-filter-box')).find(target).length > 0 
                        || $(target).hasClass('vp-vs-filter-box')) {
                        // trigger focus
                        $(that.wrapSelector('.vp-vs-input')).trigger('focus');
                    }
                });
    
                $(that._parentTag).on('change', that.wrapSelector('.vp-vs-filter-select-all'), function() {
                    let checked = $(this).prop('checked');
                    // check all
                    $(that.wrapSelector('.vp-vs-filter-type')).prop('checked', checked);
                    // reload
                    that.reload().then(function() {
                        $(that.wrapSelector('.vp-vs-input')).trigger('focus');
                    });
                });
    
                $(that._parentTag).on('change', that.wrapSelector('.vp-vs-filter-type'), function() {
                    // if checked all
                    let allLength = $(that.wrapSelector('.vp-vs-filter-type')).length;
                    let checkedLength = $(that.wrapSelector('.vp-vs-filter-type:checked')).length;
                    if (allLength == checkedLength) {
                        $(that.wrapSelector('.vp-vs-filter-select-all')).prop('checked', true);
                    } else {
                        $(that.wrapSelector('.vp-vs-filter-select-all')).prop('checked', false);
                    }
                    that.reload().then(function() {
                        $(that.wrapSelector('.vp-vs-input')).trigger('focus');
                    });
                });
            });
        }

        /**
         * value
         * @param {String} value value
         */
        setValue(value = "") {
            this._value = value;
        }
        /**
         * placeholder
         * @param {String} placeholder placeholder
         */
        setPlaceholder(placeholder = "") {
            this._placeholder = placeholder;
        }
        /**
         * Component id
         * @param {String} compID
         */
        setComponentID(compID = "") {
            this._compID = compID;
        }
        /**
         * normal filter usage
         * @param {String} normalFilter 
         */
        setNormalFilter(normalFilter = true) {
            this._normalFilter = normalFilter;
        }
        /**
         * suggest list
         * @param {Array or Function} suggestList
         */
        setSuggestList(suggestList = new Array()) {
            this._suggestList = suggestList;
        }
        /**
         * show default list
         * - true: autocomplete.minLength to 0
         * - false: autocomplete.minLength to 1
         * @param {bool} showDefaultList 
         */
        setMinSearchLength(minLength) {
            this._minLength = minLength;
        }
        /**
         * Additional Class
         * @param {String} additionalClass
         */
        addClass(additionalClass = "") {
            if (additionalClass == "")
                return;
            this._additionalClass = com_util.formatString("{0} {1}", this._additionalClass, additionalClass);
        }
        addAttribute(key, value) {
            this._attributes = {
                ...this._attributes,
                [key]: value
            };
        }
        /**
         * selection event
         * @param {function} selectEvent
         */
        setSelectEvent(selectEvent) {
            if (typeof selectEvent != "function") {
                selectEvent = undefined;
            }
            this._selectEvent = selectEvent;
        }

        reload() {
            var that = this;
            // load using kernel
            let dataTypes = this._dataTypes;
            let excludeTypes = [];
            let othersChecked = this._showOthers;
            // check filter
            if ($(this.wrapSelector('.vp-vs-filter-box')).length > 0) {
                let filterTypes = [];
                let filterTypeTags = $(this.wrapSelector('.vp-vs-filter-type'));
                filterTypeTags.each((i, tag) => {
                    let checked = $(tag).prop('checked');
                    let dtype = $(tag).data('dtype');
                    if (checked) {
                        if (dtype == 'others') {
                            othersChecked = true;
                        } else {
                            filterTypes.push(dtype);
                        }
                    } else {
                        if (dtype == 'others') {
                            othersChecked = false;
                        } else {
                            excludeTypes.push(dtype);
                        }
                    }
                });
                let allChecked = $(this.wrapSelector('.vp-vs-filter-select-all')).prop('checked');
                if (allChecked) {
                    if (othersChecked) {
                        dataTypes = []; // load all types of variables
                        excludeTypes = [];
                    } else {
                        dataTypes = filterTypes;
                    }
                } else {
                    if (othersChecked) {
                        dataTypes = [];
                    } else {
                        if (filterTypes.length == 0) {
                            // nothing checked
                            // no variable list
                            this.state.varList = [];
                            this._suggestList = [];
                            return new Promise(function(resolve, reject) {
                                resolve([]);
                            });
                        }
                        dataTypes = filterTypes;
                    }
                    
                }
            } else {
                dataTypes = [];
            }

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'VarSelector2 - reload ', dataTypes, excludeTypes);

            return new Promise(function(resolve, reject) {
                vpKernel.getDataList(dataTypes, excludeTypes).then(function (resultObj) {
                    try {
                        let { result, type, msg } = resultObj;
                        var varList = JSON.parse(result);
                        // re-mapping variable list
                        varList = varList.map(obj => { 
                            return {
                                label: obj.varName, 
                                value: obj.varName,
                                dtype: obj.varType
                            }; 
                        });

                        // save variable list as state
                        that.state.varList = varList;
                        that._suggestList = varList;
                        resolve(varList);

                    } catch (ex) {
                        reject(ex);
                    }
                });
            });
        }

        bindAutocomplete() {
            let that = this;
            let minLength = this._minLength;

            $(com_util.formatString(".{0} input", that.uuid)).autocomplete({
                autoFocus: true,
                minLength: minLength,
                source: function (req, res) {
                    var srcList = typeof that._suggestList == "function" ? that._suggestList() : that._suggestList;
                    var returlList = new Array();
                    if (that._normalFilter) {
                        for (var idx = 0; idx < srcList.length; idx++) {
                            // srcList as object array
                            if (typeof srcList[idx] == "object") {
                                // { label: string, value: string } format
                                if (srcList[idx].label.toString().toLowerCase().includes(req.term.trim().toLowerCase())) {
                                    returlList.push(srcList[idx]);
                                }
                            } else if (srcList[idx].toString().toLowerCase().includes(req.term.trim().toLowerCase()))
                                returlList.push(srcList[idx]);
                        }
                    } else {
                        returlList = srcList;
                    }
                    res(returlList);
                },
                select: function (evt, ui) {
                    let result = true;
                    // trigger change
                    $(this).val(ui.item.value);
                    $(this).trigger('change');

                    // select event
                    if (typeof that._selectEvent == "function")
                        result = that._selectEvent(ui.item.value, ui.item);
                    if (result != undefined) {
                        return result;
                    }
                    return true;
                },
                search: function(evt, ui) {
                    return true;
                },
                open: function(evt, ui) {
                    if (!$(that.wrapSelector('.vp-vs-filter-box')).hasClass('vp-inline-block')) {
                        $(that.wrapSelector('.vp-vs-filter-box')).addClass('vp-inline-block');
                    }
                },
                close: function(evt, ui) {
                    // $(that.wrapSelector('.vp-vs-filter-box')).removeClass('vp-inline-block');
                    evt.preventDefault();
                    return false;
                }
            }).focus(function () {
                $(this).select();
                $(this).autocomplete('search', $(this).val());
            }).click(function () {
                $(this).select();
                $(this).autocomplete('search', $(this).val());
            }).autocomplete('instance')._renderItem = function(ul, item) {
                return $('<li>').attr('data-value', item.value)
                        .append(`<div class="vp-vs-item">${item.label}<label class="vp-gray-text vp-cursor">&nbsp;| ${item.dtype}</label></div>`)
                        .appendTo(ul);
            };
        }

        /**
         * icon input box tag
         * @returns html icon input text tag string
         */
        toTagString() {
            var sbTagString = new com_String();
            var that = this;

            // make attributes
            var attributes = Object.keys(this._attributes).map(key => key + '="' + this._attributes[key] + '"').join(" ");

            sbTagString.appendFormatLine('<div class="{0} {1}">', this.uuid, 'vp-vs-box vp-vs-uninit');
            sbTagString.appendFormatLine(`<input type="text" class="vp-vs-blur-btn {0} {1}" {2} placeholder="{3}" value="{4}" {5}/>`,
                'vp-vs-input', that._additionalClass, that._compID == "" ? "" : com_util.formatString('id="{0}"', that._compID), that._placeholder, that._value, attributes);
            if (this._showFilterbox) {
                // filter icon
                // LAB: img to url
                // sbTagString.appendFormatLine('<span class="vp-vs-blur-btn {0}"><img src="{1}"/></span>', 'vp-vs-filter', com_Const.IMAGE_PATH + 'filter.svg');
                sbTagString.appendFormatLine('<span class="vp-vs-blur-btn {0} {1}"></span>', 'vp-vs-filter', 'vp-icon-filter');
                // filter box
                sbTagString.appendFormatLine('<div class="vp-vs-blur-btn vp-vs-blur {0}">', 'vp-vs-filter-box');
                sbTagString.appendLine('<div class="vp-grid-box">');
                sbTagString.appendFormatLine('<input type="checkbox" id="{0}" class="{1}" checked><label for="{2}">{3}</label>', 
                    this.uuid + '_vsSelectAll', 'vp-vs-filter-select-all', this.uuid + '_vsSelectAll', 'Select All');
                this._dataTypes && this._dataTypes.forEach(dt => {
                    let tmpId = that.uuid + '_' + dt;
                    sbTagString.appendFormatLine('<input type="checkbox" id="{0}" class="{1}" data-dtype="{2}" checked><label for="{3}">{4}</label>', 
                        tmpId, 'vp-vs-filter-type', dt, tmpId, dt);
                });
                if (this._showOthers) {
                    let tmpId = that.uuid + '_others';
                    sbTagString.appendFormatLine('<input type="checkbox" id="{0}" class="{1}" data-dtype="{2}" checked><label for="{3}">{4}</label>', 
                        tmpId, 'vp-vs-filter-type', 'others', tmpId, 'Others');
                }
                sbTagString.appendLine('</div>'); // end of vp-grid-box
                sbTagString.appendLine('</div>'); // end of vp-vs-filter-box
            }
            sbTagString.appendLine('</div>'); // end of vp-vs-box

            return sbTagString.toString();
        }

    }

    return VarSelector;
});