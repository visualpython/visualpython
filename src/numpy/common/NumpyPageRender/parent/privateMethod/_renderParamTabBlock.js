define ([    
    'nbextensions/visualpython/src/common/vpCommon'
], function( vpCommon ){
    var _mapNumpyPageRenderFunc = function(tagSelector, tabBlockArray) {
        const { bindFuncData } = tabBlockArray;
        const { numpyPageRenderThis, numpyPageRenderFuncType, stateParamNameStrOrStrArray } = bindFuncData;
        const { PARAM_ONE_ARRAY_EDITOR_TYPE, PARAM_TWO_ARRAY_EDITOR_TYPE,
                PARAM_INPUT_EDITOR_TYPE, PARAM_ONE_ARRAY_INDEX_N_EDITOR_TYPE } 
                = numpyPageRenderThis.numpyEnumRenderEditorFuncType;
 
        switch(numpyPageRenderFuncType){
            case PARAM_ONE_ARRAY_EDITOR_TYPE: {
                numpyPageRenderThis.renderParamOneArrayEditor(tagSelector, stateParamNameStrOrStrArray);
                break;
            }
            case PARAM_TWO_ARRAY_EDITOR_TYPE: {
                numpyPageRenderThis.renderParamTwoArrayEditor(tagSelector, stateParamNameStrOrStrArray);
                break;
            }
            case PARAM_INPUT_EDITOR_TYPE: {
                numpyPageRenderThis.renderParamInputArrayEditor(tagSelector, bindFuncData);
                break;
            }
            case PARAM_ONE_ARRAY_INDEX_N_EDITOR_TYPE: {
                numpyPageRenderThis.renderParamOneArrayIndexValueEditor(tagSelector, stateParamNameStrOrStrArray);
                break;
            }
        }
    }
    /**
     * 
     * @param {numpyPageRender this} numpyPageRenderThis 
     * @param {Object} tabDataObj 
     *      value1 {string} tabTitle ,
     *      value2 {Array<object>} tabBlockArray
     */
    var renderParamTabBlock = function(numpyPageRenderThis, tabDataObj) {
        var numpyPageRenderThis = numpyPageRenderThis
        var importPackageThis = numpyPageRenderThis.getImportPackageThis();
        var rootTagSelector = numpyPageRenderThis.getRequiredPageSelector();
        var mainPage = $(importPackageThis.wrapSelector(rootTagSelector));
        var uuid = 'u' + vpCommon.getUUID();
        var tabTitle = tabDataObj.tabTitle;

        /** */
        var numpyBlock = $(`<tr class='vp-numpy-option-block'>
                                <th>${tabTitle}</th>
                            
                            </tr>`);
        var numpyBlockTd =  $(`<td></td>`);
        numpyBlock.append(numpyBlockTd);


        const STR_SELECTED = 'selected';
        var numpyStateGenerator = numpyPageRenderThis.getStateGenerator();
        var stateParamOptionName = tabDataObj.stateParamOptionName || 'paramOption';

        var paramOption = numpyStateGenerator.getState(stateParamOptionName);
        var paramOptionNum  = parseInt(paramOption);
        
        /** */
        var buttonContainer = $(`<select id='vp_numpyTabSelect${uuid}'></select>`);
        var tabBlockArray = tabDataObj.tabBlockArray;
        for (var i = 0; i < tabBlockArray.length; i++) {
            (function(j) {
                var isCheckedStr = '';
                if (paramOptionNum == j + 1) {
                    isCheckedStr = STR_SELECTED;
                }
                const { btnText } = tabBlockArray[j];
                var buttonDom = $(`<option class='vp-numpy-func_btn' 
                                           value='${j}'
                                           ${isCheckedStr}>

                                        <span class='vp-multilang'>
                                            ${btnText}
                                        </span>

                                    </option>`);
                buttonContainer.append(buttonDom);
            })(i);
        }
        numpyBlockTd.append(buttonContainer);

        /** */
        var viewContainer = $(`<div class='vp-numpy-tab'>`);
        for (var i = 0; i < tabBlockArray.length; i++) {
            (function(j) {
                var viewDom = $(`<div class='vp-numpy-tab-block-element-${uuid}-${j+1} 
                                             vp-numpy-tab-block-element-${uuid}'>
                      
                                        <div class='vp-numpy-tab-block-element-${uuid}-${j+1}-view'>
                                        </div>
                                    </div>`);
                viewContainer.append(viewDom);                    
            })(i);
        }
        numpyBlockTd.append(viewContainer);
        mainPage.append(numpyBlock);
    

        // console.log('stateParamOptionName',stateParamOptionName);
        // console.log('paramOptionNum',paramOptionNum);
        _mapNumpyPageRenderFunc(`.vp-numpy-tab-block-element-${uuid}-${paramOptionNum}-view`, tabBlockArray[paramOptionNum-1]);
       
        $(importPackageThis.wrapSelector(`.vp-numpy-tab-block-element-${uuid}`)).css('display','none');
        $(importPackageThis.wrapSelector(`.vp-numpy-tab-block-element-${uuid}-${paramOptionNum}`)).css('display','block');

        /** param 선택
         *  ex 1D Array or 2D Array
         */
        $(document).off('change', '#' + `vp_numpyTabSelect${uuid}`);
        $(document).on('change', '#' + `vp_numpyTabSelect${uuid}`, function(event) {
            const STR_COLON_SELECTED = ':selected';
            var selectedValue = parseInt($(STR_COLON_SELECTED, this).val());

            $(importPackageThis.wrapSelector(`.vp-numpy-tab-block-element-${uuid}`)).css('display','none');
            $(importPackageThis.wrapSelector(`.vp-numpy-tab-block-element-${uuid}-${selectedValue+1}`)).css('display','block');

            var tagSelector = `.vp-numpy-tab-block-element-${uuid}-${selectedValue+1}-view`;
      
            _mapNumpyPageRenderFunc(tagSelector, tabBlockArray[selectedValue]);

            numpyStateGenerator.setState({
                [stateParamOptionName]: selectedValue + 1
            });
        });
    }

    return renderParamTabBlock;
});
