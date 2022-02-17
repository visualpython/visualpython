define([
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/Component',
], function(com_String, com_util, Component) {
    /**
     * @class VarSelector
     * @constructor
     */
     class VarSelector extends Component{
        constructor(parentTag, dataTypes=[], defaultType='', showOthers = true) {
            super(null, {parentTag: parentTag, dataTypes: dataTypes, defaultType: defaultType, showOthers: showOthers});
        }

        _init() {
            this._value = "";
            this._placeholder = "";
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
            this.bindAutocomplete();
            this.bindEvent();
        }

        render() {
            ;
        }
        
        bindEvent() {
            let that = this;

            $(this._parentTag).on('click', this.wrapSelector('.vp-vs-filter'), function() {
                // check disabled
                if (!$(this).parent().find('input').is(':disabled')) {
                    // toggle filter box
                    $(that.wrapSelector('.vp-vs-filter-box')).toggleClass('vp-inline-block');
                }
            });

            $(this._parentTag).on('change', this.wrapSelector('.vp-vs-filter-select-all'), function() {
                // check all
                $(that.wrapSelector('.vp-vs-filter-type')).prop('checked', true);
                // reload
                that.reload();
            });

            $(this._parentTag).on('change', this.wrapSelector('.vp-vs-filter-type'), function() {
                // TODO: 

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
            var dataTypes = this._showOthers ? [] : this._dataTypes;
            vpKernel.getDataList(dataTypes).then(function (resultObj) {
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
                    
                    let idx = 0; // use to Add variable
                    $(com_util.formatString(".{0} input", that.uuid)).autocomplete('option', 'source', function (req, res) {
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
                    });

                } catch (ex) {
                    // console.log(ex);
                }
            });
        }

        bindAutocomplete() {
            let that = this;
            let minLength = this._minLength;

            $(this._parentTag).on(com_util.formatString("focus.init-{0}", that.uuid), com_util.formatString(".{0} .{1}", that.uuid, 'vp-vs-uninit'), function () {
                $(that._parentTag).unbind(com_util.formatString(".init-{0}", that.uuid));

                $(com_util.formatString(".{0} .{1}", that.uuid, 'vp-vs-uninit')).removeClass('vp-vs-uninit').addClass('vp-vs-init');

                // if ($(com_util.formatString(".{0} input", that.uuid)).data('ui-autocomplete') != undefined) {
                //     $(com_util.formatString(".{0} input", that.uuid)).autocomplete('destroy');
                //     $(com_util.formatString(".{0} input", that.uuid)).removeData('autocomplete');
                // }
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
                    }
                }).autocomplete('instance')._renderItem = function(ul, item) {
                    return $('<li>').append(`<div class="vp-vs-item">${item.label}<label class="vp-gray-text">&nbsp;| ${item.dtype}</label></div>`).appendTo(ul);
                };
                
                $(that._parentTag).off('focus', com_util.formatString(".{0} input", that.uuid));
                $(that._parentTag).on('focus', com_util.formatString(".{0} input", that.uuid), function () {
                    $(com_util.formatString(".{0} input", that.uuid)).autocomplete('search', $(com_util.formatString(".{0} input", that.uuid)).val());
                });
                $(that._parentTag).off('click', com_util.formatString(".{0} input", that.uuid));
                $(that._parentTag).on('click', com_util.formatString(".{0} input", that.uuid), function () {
                    $(com_util.formatString(".{0} input", that.uuid)).autocomplete('search', $(com_util.formatString(".{0} input", that.uuid)).val());
                });
            });
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

            sbTagString.appendFormatLine('<div class="{0} {1}">', this.uuid, 'vp-vs-box');
            sbTagString.appendFormatLine(`<input type="text" class="{0} {1}" {2} placeholder="{3}" value="{4}" {5}/>`,
                'vp-vs-uninit', that._additionalClass, that._compID == "" ? "" : com_util.formatString('id="{0}"', that._compID), that._placeholder, that._value, attributes);
            // filter icon
            sbTagString.appendFormatLine('<span class="{0}"><img src="{1}"/></span>', 'vp-vs-filter vp-close-on-blur-btn', '/nbextensions/visualpython/img/filter.svg');
            // filter box
            sbTagString.appendFormatLine('<div class="{0} vp-close-on-blur">', 'vp-vs-filter-box');
            sbTagString.appendLine('<div class="vp-grid-box">');
            sbTagString.appendFormatLine('<input type="checkbox" id="{0}" class="{1}" checked><label for="{2}">{3}</label>', 
                this.uuid + '_vsSelectAll', 'vp-vs-filter-select-all', this.uuid + '_vsSelectAll', 'Select All');
            this._dataTypes && this._dataTypes.forEach(dt => {
                let tmpId = that.uuid + '_' + dt;
                sbTagString.appendFormatLine('<input type="checkbox" id="{0}" class="{1}" data-dtype="{2}" checked><label for="{3}">{4}</label>', 
                tmpId, 'vp-vs-filter-type', dt, tmpId, dt);
            });
            sbTagString.appendLine('</div>'); // end of vp-grid-box
            sbTagString.appendLine('</div>'); // end of vp-vs-filter-box
            sbTagString.appendLine('</div>');

            this.bindAutocomplete();

            return sbTagString.toString();
        }

    }

    return VarSelector;
});