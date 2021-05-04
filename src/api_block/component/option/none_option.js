define([
    'jquery'

    
    , '../base/index.js'
], function ( $
              , baseComponent ) {


    const { MakeOptionContainer } = baseComponent;
    var InitNoneOption = function(thisBlock, optionPageSelector) {
        var renderThisComponent = function() {
            var noneOption = MakeOptionContainer(thisBlock);
            // noneOption.append('<div>(N/A)</div>');
            noneOption.append('<div></div>');

            /**block option 탭에 렌더링된 dom객체 생성 */
            $(optionPageSelector).append(noneOption);

            return noneOption;
        }
        return renderThisComponent();
    }

    return InitNoneOption;
});