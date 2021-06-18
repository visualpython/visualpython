define ([    
    'nbextensions/visualpython/src/common/vpCommon'
], function( vpCommon ) {

    var _renderRequiredInputOutputContainer = function(numpyPageRendererThis) {
        var uuid = 'u' + vpCommon.getUUID();
        var newUuid = 'u' + vpCommon.getUUID();
        var numpyPageRendererThis = numpyPageRendererThis;
     
        var rootTagSelector = numpyPageRendererThis.getRootTagSelector();
        var optionPage = $(numpyPageRendererThis.importPackageThis.wrapSelector(rootTagSelector));

        var additionalOptionDomElement = $(`<div class="${uuid} 
                                                vp-accordion-container 
                                                vp-accordion-open  ">

                                                <div class="vp-accordion-header">
                                                    <span class="vp-accordion-indicator"></span>
                                                    <span class="vp-accordion-caption">Required Input</span>
                                                </div>

                                                <div class="vp-accordion-content">
                                                    <table class="${newUuid} 
                                                        vp-option-vertical-table-layout  
                                                        vp-th-highlight">
                                                    <colgroup>
                                                        <col width="25%">
                                                        <col width="*">
                                                    </colgroup>

                                                    <tbody class='vp-numpy-requiredPageBlock-tbody'>
                                        

                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>`);

        optionPage.append(additionalOptionDomElement);

    }
    return _renderRequiredInputOutputContainer;
});
