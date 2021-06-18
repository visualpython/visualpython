define([
    'jquery'

    , '../../api.js'    
    , '../../constData.js'
    , '../base/index.js'

], function ( $
              ,api
              , constData
              , baseComponent ) {

    const { UpdateOneArrayValueAndGet
            , DeleteOneArrayValueAndGet

            , ShowImportListAtBlock  } = api;

    const {  BLOCK_CODELINE_TYPE
            , IMPORT_BLOCK_TYPE

            , STR_COLON_SELECTED
            , STR_EMPTY
            , STR_CLICK
            , STR_CHANGE
            , STR_CHANGE_KEYUP_PASTE

            , STR_BLOCK
            , STR_DISPLAY
            , STR_NONE
            , STR_DEFAULT
            , STR_CUSTOM
            , STR_SELECTED
            , STR_CHECKED 
            
            , STATE_isBaseImportPage
            , STATE_baseImportList
            , STATE_customImportList } = constData;

    const { MakeOptionContainer
            , MakeOptionDeleteButton
            , MakeOptionPlusButton } = baseComponent;
    /**
     * @param {Block} thisBlock Block
     * @param {string} optionPageSelector  Jquery 선택자
     */
    var InitImportBlockOption = function(thisBlock, optionPageSelector) {
        var uuid = thisBlock.getUUID();
        var blockContainerThis = thisBlock.getBlockContainerThis();
        var defaultImportContainer;
        var customImportContainer;
        var baseImportList = thisBlock.getState(STATE_baseImportList);
        var customImportList = thisBlock.getState(STATE_customImportList);
        
        /**
         * @event_function 
         */
        $(document).off(STR_CLICK, `.vp-apiblock-custom-import-plus-btn`);
        $(document).on(STR_CLICK, `.vp-apiblock-custom-import-plus-btn`, function(event) {

            var newData = {
                baseAcronyms : ''
                , baseImportName : 'numpy'
                , isImport : false
            }
            thisBlock.setState({
                customImportList: [ ...thisBlock.getState(STATE_customImportList), newData ]
            });
            var importCode = ShowImportListAtBlock(thisBlock);
            thisBlock.writeCode(importCode);
    
            blockContainerThis.renderBlockOptionTab();

            event.stopPropagation();
        });

        /**
         * default 옵션 클릭
         * @event_function 
         */
        $(document).off(STR_CLICK, `.vp-apiblock-default-option-${uuid}`);
        $(document).on(STR_CLICK, `.vp-apiblock-default-option-${uuid}`, function(event) {

            $(defaultImportContainer).css(STR_DISPLAY, STR_BLOCK);
            $(customImportContainer).css(STR_DISPLAY, STR_NONE);
            thisBlock.setState({
                isBaseImportPage: true
            });

            blockContainerThis.renderBlockOptionTab();

            event.stopPropagation();
        });

        /**
         * detail 옵션 클릭
         * @event_function 
         */
        $(document).off(STR_CLICK, `.vp-apiblock-custom-option-${uuid}`);
        $(document).on(STR_CLICK, `.vp-apiblock-custom-option-${uuid}`, function(event) {

            $(customImportContainer).css(STR_DISPLAY, STR_BLOCK);
            $(defaultImportContainer).css(STR_DISPLAY, STR_NONE);
            thisBlock.setState({
                isBaseImportPage: false
            });
        
            blockContainerThis.renderBlockOptionTab();

            event.stopPropagation();
        });

        customImportList.forEach((customImportData, index) => {
            const { isImport, baseImportName, baseAcronyms } = customImportData;

            /**
             * @event_function 
             */
            $(document).off(STR_CLICK, `.vp-apiblock-blockoption-custom-import-input-${index}`);
            $(document).on(STR_CLICK, `.vp-apiblock-blockoption-custom-import-input-${index}`, function(event) {
                var _isImport = isImport === true ? false : true;
                var updatedData = {
                    baseAcronyms: thisBlock.getState(STATE_customImportList)[index].baseAcronyms
                    , baseImportName
                    , isImport: _isImport
                }
                thisBlock.setState({
                    customImportList: UpdateOneArrayValueAndGet(thisBlock.getState(STATE_customImportList), index, updatedData)
                });
                var importCode = ShowImportListAtBlock(thisBlock);
                thisBlock.writeCode(importCode);
            
                blockContainerThis.renderBlockOptionTab();

                event.stopPropagation();
            });

            /**
             * @event_function 
             */
            $(document).off(STR_CHANGE, `.vp-apiblock-blockoption-custom-import-select-${index}`);
            $(document).on(STR_CHANGE, `.vp-apiblock-blockoption-custom-import-select-${index}`, function(event) {    
                var updatedData = {
                    baseAcronyms: thisBlock.getState(STATE_customImportList)[index].baseAcronyms
                    , baseImportName : $(STR_COLON_SELECTED, this).val()
                    , isImport
                }
                
                thisBlock.setState({
                    customImportList: UpdateOneArrayValueAndGet(thisBlock.getState(STATE_customImportList), index, updatedData)
                });
                var importCode = ShowImportListAtBlock(thisBlock);
                thisBlock.writeCode(importCode);
                blockContainerThis.renderBlockOptionTab();

                event.stopPropagation();
            });

            /**
             * @event_function 
             */
            $(document).off(STR_CHANGE_KEYUP_PASTE, `.vp-apiblock-blockoption-custom-import-textinput-${index}`);
            $(document).on(STR_CHANGE_KEYUP_PASTE, `.vp-apiblock-blockoption-custom-import-textinput-${index}`, function(event) {

                var updatedData = {
                    baseAcronyms : $(this).val()
                    , baseImportName 
                    , isImport
                }
                thisBlock.setState({
                    customImportList: UpdateOneArrayValueAndGet(thisBlock.getState(STATE_customImportList), index, updatedData)
                });
                var importCode = ShowImportListAtBlock(thisBlock);
                thisBlock.writeCode(importCode);
                event.stopPropagation();
            });
        });
        
        baseImportList.forEach((_, index) => {

           /**
            * @event_function 
            */
            $(document).off(STR_CLICK, `.vp-apiblock-blockoption-default-import-input-${index}`);
            $(document).on(STR_CLICK, `.vp-apiblock-blockoption-default-import-input-${index}`, function(event) {
                var isImport = thisBlock.getState(STATE_baseImportList)[index].isImport;
                var baseImportName = thisBlock.getState(STATE_baseImportList)[index].baseImportName;
                var baseAcronyms = thisBlock.getState(STATE_baseImportList)[index].baseAcronyms;

                isImport = isImport === true 
                                ? false 
                                : true;

                var updatedData = {
                    isImport
                    , baseImportName
                    , baseAcronyms
                }
                
                thisBlock.setState({
                    baseImportList: UpdateOneArrayValueAndGet(thisBlock.getState(STATE_baseImportList), index, updatedData)
                });
                var importCode = ShowImportListAtBlock(thisBlock);
                thisBlock.writeCode(importCode);
                blockContainerThis.renderBlockOptionTab();

                event.stopPropagation();
            }); 
        });

        var RenderDefaultOrCustomImportContainer = function(importType, countisImport) {
            var name = STR_EMPTY;
            var customImportButton = STR_EMPTY;
            if (importType == IMPORT_BLOCK_TYPE.DEFAULT) {
                name = STR_DEFAULT;
            } else {
                name = STR_CUSTOM;
                customImportButton = MakeOptionPlusButton('', ' + import', 'vp-apiblock-custom-import-plus-btn');
                customImportButton = customImportButton.toString();
            }
        
            var container = $(`<div>
                                    <div class='vp-apiblock-style-flex-row-between'>
                                        <span class='vp-block-optiontab-name
                                                     vp-apiblock-style-flex-column-center'>
                                            ${name}
                                        </span>

                                        <div class='vp-apiblock-style-flex-row-center'>
                                            <span class='vp-apiblock-style-flex-column-center'
                                                    style='margin-right:5px;'>
                                                    ${countisImport} Selected
                                            </span>
                                                ${customImportButton}
                                           
                                        </div>
                                    </div>
                                </div>`);
     
            return container;
        }

        var RenderDefaultImportDom = function(baseImportData, index) {
            const { isImport, baseImportName, baseAcronyms } = baseImportData;
            var defaultImportDom = $(`<div class='vp-apiblock-style-flex-row-between'
                                            style='padding: 0.1rem 0;
                                                   margin-top:5px;'>
                                            <div class='vp-apiblock-style-flex-column-center'>
                                                <label class='vp-apiblock-style-flex-column-center'>
                                                    <input class='vp-apiblock-blockoption-default-import-input-${index}'
                                                            type='checkbox'
                                                            ${isImport == true 
                                                                ? 'checked'
                                                                : ''}>
                                                    </input>             
                                                    <span style='margin-top: -7px;'>
                                                    </span>
                                                </label>
             
                                            </div>
                                            <div class='vp-apiblock-style-flex-column-center'>
                                                <span style='font-size:12px; font-weight:700;'> 
                                                    ${baseImportName}
                                                </span>
                                            </div>
                                            <div class='vp-apiblock-style-flex-column-center'
                                                style='width: 50%; text-align: center;'>
                                                <span>
                                                    ${baseAcronyms}
                                                </span>
                                    
                                            </div>
                                    </div>`);
            return defaultImportDom;
        }

        var RenderDefaultOrCustomButton = function(thisBlock, uuid) {
            var defaultOptionTitle = 'Default Import';
            var customOptionTitle = 'Custom Import';
     
            var defaultOrCustomButton = $(`<div class='vp-apiblock-style-flex-row-between'
                                                style='margin-top:5px;'>
     
                                                <button class='vp-apiblock-default-option-${uuid} 
                                                               vp-apiblock-option-plus-button'>
                                                        ${defaultOptionTitle}
                                                </button>
     
                                                <button class='vp-apiblock-custom-option-${uuid} 
                                                               vp-apiblock-option-plus-button'>
                                                        ${customOptionTitle}
                                                </button>
                                            </div>`);
            return defaultOrCustomButton;
        }
        var RenderCustomImportDom = function(customImportData, index) {
            const { isImport, baseImportName, baseAcronyms } = customImportData;
            var customImportDom = $(`<div class='vp-apiblock-style-flex-row-between'>
     
                                        <div class='vp-apiblock-style-flex-column-center'>
                                            <label class='vp-apiblock-style-flex-column-center'>
                                                <input class='vp-apiblock-blockoption-custom-import-input-${index}' 
                                                       type='checkbox' 
                                                    ${isImport == true 
                                                        ? STR_CHECKED
                                                        : '' }>
                                                </input>

                                                <span style='margin-top: -7px;'>
                                                </span>
                                            </label>
                                        </div>
     
                                        <select class='vp-apiblock-blockoption-custom-import-select-${index}'
                                                style='margin-right:5px;'>
                                            <option value='numpy' ${baseImportName == 'numpy' ? STR_SELECTED : ''}>
                                                numpy
                                            </option>
                                            <option value='pandas' ${baseImportName == 'pandas' ? STR_SELECTED : ''}>
                                                pandas
                                            </option>
                                            <option value='matplotlib' ${baseImportName == 'matplotlib' ? STR_SELECTED : ''}>
                                                matplotlib
                                            </option>
                                            <option value='seaborn' ${baseImportName == 'seaborn' ? STR_SELECTED : ''}>
                                                seaborn
                                            </option>
                                            <option value='os' ${baseImportName == 'os' ? STR_SELECTED : ''}>
                                                os
                                            </option>
                                            <option value='sys' ${baseImportName == 'sys' ? STR_SELECTED : ''}>
                                                sys
                                            </option>
                                            <option value='time' ${baseImportName == 'time' ? STR_SELECTED : ''}>
                                                time
                                            </option>
                                            <option value='datetime' ${baseImportName == 'datetime' ? STR_SELECTED : ''}>
                                                datetime
                                            </option>
                                            <option value='random' ${baseImportName == 'random' ? STR_SELECTED : ''}>
                                                random
                                            </option>
                                            <option value='math' ${baseImportName == 'math' ? STR_SELECTED : ''}>
                                                math
                                            </option>
                                        </select>
     
                                        <div class='vp-apiblock-style-flex-column-center'>
                                            <input class='vp-apiblock-blockoption-custom-import-textinput-${index}'
                                                    style='width: 90%;' 
                                                    type='text' 
                                                    placeholder='input import'
                                                    value='${baseAcronyms}'>
                                            </input>
                                        </div>
     
                                    </div>`);
            return customImportDom;
        }
        /** Import option 렌더링 */
        var renderThisComponent = function() {
            var uuid = thisBlock.getUUID();
            var baseImportList = thisBlock.getState(STATE_baseImportList);

            var importBlockOption = MakeOptionContainer(thisBlock);
            var defaultOrCustomButton = RenderDefaultOrCustomButton(thisBlock, uuid, BLOCK_CODELINE_TYPE.IMPORT);
  
            importBlockOption.append(defaultOrCustomButton);

            /* ------------- default import -------------- */
            var countisImport = 0;
            baseImportList.forEach(baseImportData => {
                if (baseImportData.isImport == true ) {
                    countisImport += 1;
                };
            });

            defaultImportContainer = RenderDefaultOrCustomImportContainer(IMPORT_BLOCK_TYPE.DEFAULT, countisImport);
            var defaultImportBody = $('<div><div>');
            baseImportList.forEach((baseImportData, index) => {
                var defaultImportDom = RenderDefaultImportDom(baseImportData, index);
                defaultImportBody.append(defaultImportDom);                        
            });

            /** -------------custom import ------------------ */
            var customImportList = thisBlock.getState(STATE_customImportList);
            var countIsCustomImport = 0;
            customImportList.forEach(baseImportData => {
                if (baseImportData.isImport == true ) {
                    countIsCustomImport += 1;
                };
            });

            // customImport 갯수만큼 bottom block 옵션에 렌더링
            customImportContainer = RenderDefaultOrCustomImportContainer(IMPORT_BLOCK_TYPE.CUSTOM, countIsCustomImport);
            var customImportBody = $(`<div class='vp-apiblock-customimport-body'>
                                    </div>`);
            customImportList.forEach((customImportData, index ) => {
                var customImportDom = RenderCustomImportDom(customImportData, index);
    ;
                var deleteButton = MakeOptionDeleteButton(index + uuid);
                $(deleteButton).click(function() {
                    thisBlock.setState({
                        customImportList: DeleteOneArrayValueAndGet(thisBlock.getState(STATE_customImportList), index)
                    });
                    
                    blockContainerThis.renderBlockOptionTab();
                });
                customImportDom.append(deleteButton);
                customImportBody.append(customImportDom);
            });

            var isBaseImportPage = thisBlock.getState(STATE_isBaseImportPage);
            if (isBaseImportPage == true) {
                defaultImportContainer.append(defaultImportBody);
                importBlockOption.append(defaultImportContainer);
            } else {
                customImportContainer.append(customImportBody);
                importBlockOption.append(customImportContainer);
            }
        
            $(optionPageSelector).append(importBlockOption);

            return importBlockOption;
        }

        return renderThisComponent();
    }

    return InitImportBlockOption;
});