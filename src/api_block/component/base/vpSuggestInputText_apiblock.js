
define([
    'jquery'

    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
], function ( $, vpSuggestInputText ) {
    /** src/common에 있는 vpSuggestInputText을 api block에 맞게 커스텀 */
    var MakeVpSuggestInputText_apiblock = function(id, value, loadedVariableNameList, 
                                                    classList, placeholder, callback = console.log) {
        var suggestInputArg1 = new vpSuggestInputText.vpSuggestInputText();
        suggestInputArg1.setPlaceholder(placeholder);
        suggestInputArg1.setComponentID(id);

        /** classList 인자가 배열이면 */
        if (Array.isArray(classList)) {
            classList.forEach(cl => {
                suggestInputArg1.addClass(cl);
            });
        /** classList 인자가 배열이 아니면 */
        } else {
            suggestInputArg1.addClass(classList);
        }

        suggestInputArg1.setSelectEvent(callback);
        var tempSrc = function() {
            return loadedVariableNameList;
        };
 
        suggestInputArg1.setSuggestList(tempSrc);
        suggestInputArg1 = suggestInputArg1.toTagString();

        /** set value */
        $(suggestInputArg1).val(value);
        return suggestInputArg1;
    }

    return MakeVpSuggestInputText_apiblock;
});