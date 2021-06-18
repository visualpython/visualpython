define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/component/vpComComponent'
], function (requirejs, $, vpCommon, vpConst, sb, vpComComponent) {
    /**
     * @class vpSuggestInputText 값 제안 입력 박스
     * @constructor
     */
    var vpSuggestInputText = function() {
        this.setUUID();
        this._value = "";
        this._placeholder = "";
        this._compID = "";
        this._additionalClass = "";
        this._normalFilter = true;
        this._suggestList = new Array();
        this._selectEvent = undefined;
        this._attributes = {};
    };

    vpSuggestInputText.prototype = Object.create(vpComComponent.vpComComponent.prototype);

    /**
     * value 설정
     * @param {String} value value
     */
    vpSuggestInputText.prototype.setValue = function(value = "") {
        this._value = value;
    }

    /**
     * placeholder 설정
     * @param {String} placeholder placeholder
     */
    vpSuggestInputText.prototype.setPlaceholder = function(placeholder = "") {
        this._placeholder = placeholder;
    }

    /**
     * 컴퍼넌트 id 설정
     * @param {String} compID 컴퍼넌트 id
     */
    vpSuggestInputText.prototype.setComponentID = function(compID = "") {
        this._compID = compID;
    }

    /**
     * 기본 필터 여부 설정
     * @param {String} normalFilter 컴퍼넌트 id
     */
    vpSuggestInputText.prototype.setNormalFilter = function(normalFilter = true) {
        this._normalFilter = normalFilter;
    }

    /**
     * 제안 목록 설정
     * @param {Array or Function} suggestList 제안 목록
     */
    vpSuggestInputText.prototype.setSuggestList = function(suggestList = new Array()) {
        this._suggestList = suggestList;
    }

    /**
     * 추가 클래스 설정
     * @param {String} additionalClass 추가 클래스
     */
    vpSuggestInputText.prototype.addClass = function(additionalClass = "") {
        if (additionalClass == "") return;
        this._additionalClass = vpCommon.formatString("{0} {1}", this._additionalClass, additionalClass);
    }

    vpSuggestInputText.prototype.addAttribute = function(key, value) {
        this._attributes = {
            ...this._attributes,
            [key]: value
        }
    }

    /**
     * 제안 선택 이벤트 추가
     * @param {function} selectEvent 제안 선택 이벤트
     */
    vpSuggestInputText.prototype.setSelectEvent = function(selectEvent) {
        if (typeof selectEvent != "function") {
            selectEvent = undefined;
        }
        this._selectEvent = selectEvent;
    }

    /**
     * 아이콘 인풋박스 태그 생성
     * @returns html icon input text tag string
     */
    vpSuggestInputText.prototype.toTagString = function() {
        var sbTagString = new sb.StringBuilder();
        var that = this;

        // make attributes
        var attributes = Object.keys(this._attributes).map(key => key+'="' + this._attributes[key] + '"').join(" ");

        sbTagString.appendFormatLine(`<input type='text' class='{0} {1} {2}' {3} placeholder='{4}' value="{5}" {6}/>`
            , that._UUID, vpConst.VP_SUGGEST_INPUT_UNINIT, that._additionalClass, that._compID == "" ? "" : vpCommon.formatString("id='{0}'", that._compID), that._placeholder, that._value, attributes);

        $(document).on(vpCommon.formatString("focus.init-{0}", that._UUID), vpCommon.formatString(".{0}.{1}", that._UUID, vpConst.VP_SUGGEST_INPUT_UNINIT), function() {
            $(document).unbind(vpCommon.formatString(".init-{0}", that._UUID));
            
            $(vpCommon.formatString(".{0}", that._UUID)).removeClass(vpConst.VP_SUGGEST_INPUT_UNINIT).addClass(vpConst.VP_SUGGEST_INPUT);

            $(vpCommon.formatString(".{0}", that._UUID)).autocomplete({
                minLength: 0
                , source: function(req, res) {
                    console.log(req.term);
                    var srcList = typeof that._suggestList == "function" ? that._suggestList() : that._suggestList;
                    var returlList = new Array();
                    if (that._normalFilter) {
                        for (var idx = 0; idx < srcList.length; idx++) {
                            // minju: srcList가 object array 형태일 경우 처리 2020-12-15
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
                }
                , select: function(evt, ui) { if (typeof that._selectEvent == "function") that._selectEvent(ui.item.value, ui.item); }
            }).focus(function() {
                $(vpCommon.formatString(".{0}", that._UUID)).autocomplete('search', $(vpCommon.formatString(".{0}", that._UUID)).val());
            }).click(function() {
                $(vpCommon.formatString(".{0}", that._UUID)).autocomplete('search', $(vpCommon.formatString(".{0}", that._UUID)).val());
            });
        });

        return sbTagString.toString();
    }
    
    return {
        vpSuggestInputText: vpSuggestInputText
    }
});