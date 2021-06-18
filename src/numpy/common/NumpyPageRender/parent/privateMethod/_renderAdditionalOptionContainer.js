define ([    
    'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/StringBuilder'
], function( vpCommon, sb ) {

    var _renderAdditionalOptionContainer = function(numpyPageRendererThis) {
        var uuid = 'u' + vpCommon.getUUID();
        var newUuid = 'u' + vpCommon.getUUID();

        var numpyPageRendererThis = numpyPageRendererThis;
        var importPackageThis = numpyPageRendererThis.getImportPackageThis();
     
        var rootTagSelector = numpyPageRendererThis.getRootTagSelector();
        var optionPage = $(importPackageThis.wrapSelector(rootTagSelector));

        // var sbTagString = new sb.StringBuilder();


        var additionalOptionDom =    $(`<div class="${uuid} 
                                                    vp-accordion-container">
                                            <div class="vp-accordion-header">
                                                <span class="vp-accordion-indicator"></span>
                                                <span class="vp-accordion-caption">Additional Option</span>
                                            </div>

                                            <div class="vp-accordion-content">
                                                <table class="${newUuid} 
                                                        vp-option-vertical-table-layout ">
                                                    <colgroup>
                                                        <col width="30%">
                                                        <col width="*">
                                                    </colgroup>
                                                    <tbody class="vp-numpy-optionPageBlock-view">

                                                    </tbody>
                                                </table>
                                            </div>

                                        </div>`)
        // var additionalOptionDom = $(sbTagString.toString());  
        optionPage.append(additionalOptionDom);

    }
    return _renderAdditionalOptionContainer;
});
