define([
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/Component',
], function (com_util, com_String, Component) {
    /**
     * @class SuggestInput
     * @constructor
     */
    class SuggestInput extends Component{
        constructor() {
            super(null, {});
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
        }

        render() {
            ;
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
        /**
         * icon input box tag
         * @returns html icon input text tag string
         */
        toTagString() {
            var sbTagString = new com_String();
            var that = this;

            let minLength = this._minLength;

            // make attributes
            var attributes = Object.keys(this._attributes).map(key => key + '="' + this._attributes[key] + '"').join(" ");

            sbTagString.appendFormatLine(`<input type='text' class='{0} {1} {2}' {3} placeholder='{4}' value="{5}" {6}/>`,
                that.uuid, 'suggest-input-uninit', that._additionalClass, that._compID == "" ? "" : com_util.formatString("id='{0}'", that._compID), that._placeholder, that._value, attributes);

            $(document).on(com_util.formatString("focus.init-{0}", that.uuid), com_util.formatString(".{0}.{1}", that.uuid, 'suggest-input-uninit'), function () {
                $(document).unbind(com_util.formatString(".init-{0}", that.uuid));

                $(com_util.formatString(".{0}", that.uuid)).removeClass('suggest-input-uninit').addClass('suggest-input');

                $(com_util.formatString(".{0}", that.uuid)).autocomplete({
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
                        
                        if (typeof that._selectEvent == "function") {
                            result = that._selectEvent(ui.item.value, ui.item);
                        }
                        $(this).trigger('change');
                        if (result != undefined) {
                            return result;
                        }
                        return true;
                    }
                }).focus(function() {
                    $(this).select();
                    $(com_util.formatString(".{0}", that.uuid)).autocomplete('search', $(com_util.formatString(".{0}", that.uuid)).val());
                }).click(function() {
                    $(this).select();
                    $(com_util.formatString(".{0}", that.uuid)).autocomplete('search', $(com_util.formatString(".{0}", that.uuid)).val());
                }).autocomplete('instance')._renderItem = function(ul, item) {
                    if (item.dtype != undefined) {
                        return $('<li>').attr('data-value', item.value)
                            .append(`<div class="vp-sg-item">${item.label}<label class="vp-gray-text vp-cursor">&nbsp;| ${item.dtype}</label></div>`)
                            .appendTo(ul);
                    }
                    return $('<li>').attr('data-value', item.value)
                            .append(`<div class="vp-sg-item">${item.label}</div>`)
                            .appendTo(ul);
                };;
            });

            return sbTagString.toString();
        }
    }
    
    return SuggestInput;
});