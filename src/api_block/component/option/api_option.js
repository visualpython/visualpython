
define([
    'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    
    , '../../api_list.js'    


], function ( $, vpCommon, vpConst, sb

              , api_list) {

    const { makeUpGreenRoomHTML } = api_list;

    /**
     * @param {Block} thisBlock Block
     * @param {string} optionPageSelector  Jquery 선택자
     */
    const InitAPIBlockOption = function(thisBlock, optionPageSelector, resetOptionPage=false) {
        // var xmlLibraries;
        var blockContainerThis = thisBlock.getBlockContainerThis();
        var blockUUID = thisBlock.getUUID();
        var blockCodeLineType = thisBlock.getBlockType();
        var blockOptionPageDom = '';
        var generatedMetaData;
        /**
         * 옵션 페이지 로드 완료 callback.
         * @param {funcJS} funcJS 옵션 js 객체
         */
        const optionPageLoadCallback = function(funcJS) {
            // console.log('funcJS',funcJS);
            thisBlock.setImportPakage(funcJS);

            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_LOAD_AREA))).empty();
        
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_NAVIGATOR_INFO_PANEL),
                vpCommon.formatString(".{0}", vpConst.OPTION_NAVIGATOR_INFO_NODE))).remove();
            $(vpCommon.wrapSelector(vpConst.OPTION_CONTAINER)).children(vpConst.OPTION_PAGE).remove();

            // load 옵션 변경시 기존 옵션 이벤트 언바인드 호출.
            if (funcJS != undefined) {
                funcJS.unbindOptionEvent();
            }
         
            funcJS.loadMeta(funcJS, generatedMetaData);
            console.log('metadata', generatedMetaData); 
            blockContainerThis.removeOptionDom(blockUUID);
            var blockOptionPageDom = makeUpGreenRoomHTML();
            thisBlock.setBlockOptionPageDom(blockOptionPageDom);

            funcJS.bindOptionEvent();

            // reset Option Page?
            if (resetOptionPage) {
                blockContainerThis.resetOptionPage();
            }
        }

        /** Code option 렌더링 */   
        const renderThisComponent = function() {
            var metadata = thisBlock.getMetadata();
            if (metadata) {
                // console.log('metadata');

                var funcID = metadata.funcID;
                var libraryURL = window.location.origin + vpConst.PATH_SEPARATOR + vpConst.BASE_PATH + vpConst.DATA_PATH + vpConst.VP_LIBRARIES_XML_URL;
                var xmlRequest = new XMLHttpRequest();
                xmlRequest.open("GET", libraryURL);
                xmlRequest.setRequestHeader("Content-Type", "test/xml");
                xmlRequest.onreadystatechange = function() {
                    // readyState : 4 > 데이터 전부 받은 상태, status : 200 요청 성공
                    if(xmlRequest.readyState === 4 && xmlRequest.status === 200){
                        var loadedXML = xmlRequest.responseXML;
                        // console.log('loadedXML',loadedXML);
                        var optionData = $(loadedXML).find(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_ID_ATTR + "=" + funcID + "]");
                        var filePath = $(optionData).find(vpConst.LIBRARY_ITEM_FILE_URL_NODE).text();
                        var sbURL = new sb.StringBuilder();
            
                        sbURL.append(Jupyter.notebook.base_url);
                        sbURL.append(vpConst.BASE_PATH);
                        sbURL.append(vpConst.SOURCE_PATH);
                        sbURL.append(filePath);
                        var loadUrl = sbURL.toString();
                        if (loadUrl !== "") {
                            // 옵션 로드
                            generatedMetaData = metadata;
                            requirejs([loadUrl], function (loaded) {
                                loaded.initOption(optionPageLoadCallback, metadata);
                            });

                            blockOptionPageDom = thisBlock.getBlockOptionPageDom();
      
                            // console.log('blockOptionPageDom',blockOptionPageDom);
                            blockContainerThis.setOptionDom(blockUUID, blockCodeLineType, blockOptionPageDom);    
                            blockContainerThis.reRenderOptionDomPool(blockOptionPageDom);

                            thisBlock.deleteMetadata();
                        }
                    }
                }
                xmlRequest.send();
         
            } else {
                blockOptionPageDom = thisBlock.getBlockOptionPageDom();
                blockContainerThis.setOptionDom(blockUUID, blockCodeLineType, blockOptionPageDom);   
                blockContainerThis.reRenderOptionDomPool(blockOptionPageDom);
            }

            // console.log('domPool', blockContainerThis.domPool);
        }

        return renderThisComponent();
    }

    const LoadAPIBlockOption = function(thisBlock, optionPageSelector) {
        var blockContainerThis = thisBlock.getBlockContainerThis();
        var blockUUID = thisBlock.getUUID();
        var blockCodeLineType = thisBlock.getBlockType();
        var blockOptionPageDom = '';
        var generatedMetaData;

        /**
         * 옵션 페이지 로드 완료 callback.
         * @param {funcJS} funcJS 옵션 js 객체
         */
         const optionPageLoadCallback = function(funcJS) {
            // console.log('funcJS',funcJS);
            thisBlock.setImportPakage(funcJS);

            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_LOAD_AREA))).empty();
        
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_NAVIGATOR_INFO_PANEL),
                vpCommon.formatString(".{0}", vpConst.OPTION_NAVIGATOR_INFO_NODE))).remove();
            $(vpCommon.wrapSelector(vpConst.OPTION_CONTAINER)).children(vpConst.OPTION_PAGE).remove();

            // load 옵션 변경시 기존 옵션 이벤트 언바인드 호출.
            if (funcJS != undefined) {
                funcJS.unbindOptionEvent();
            }
         
            funcJS.loadMeta(funcJS, generatedMetaData);
            var blockOptionPageDom = makeUpGreenRoomHTML();
            thisBlock.setBlockOptionPageDom(blockOptionPageDom);

            funcJS.bindOptionEvent();

            var blockContainerThis = thisBlock.getBlockContainerThis();
            blockContainerThis.resetOptionPage();
        }

        /** Code option 렌더링 */   
        const loadThisComponent = function() {
            var metadata = thisBlock.getMetadata();
            if (metadata) {
                // console.log('metadata');

                var funcID = metadata.funcID;
                var libraryURL = window.location.origin + vpConst.PATH_SEPARATOR + vpConst.BASE_PATH + vpConst.DATA_PATH + vpConst.VP_LIBRARIES_XML_URL;
                var xmlRequest = new XMLHttpRequest();
                xmlRequest.open("GET", libraryURL);
                xmlRequest.setRequestHeader("Content-Type", "test/xml");
                xmlRequest.onreadystatechange = function() {
                    // readyState : 4 > 데이터 전부 받은 상태, status : 200 요청 성공
                    if(xmlRequest.readyState === 4 && xmlRequest.status === 200){
                        var loadedXML = xmlRequest.responseXML;
                        // console.log('loadedXML',loadedXML);
                        var optionData = $(loadedXML).find(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_ID_ATTR + "=" + funcID + "]");
                        var filePath = $(optionData).find(vpConst.LIBRARY_ITEM_FILE_URL_NODE).text();
                        var sbURL = new sb.StringBuilder();
            
                        sbURL.append(Jupyter.notebook.base_url);
                        sbURL.append(vpConst.BASE_PATH);
                        sbURL.append(vpConst.SOURCE_PATH);
                        sbURL.append(filePath);
                        var loadUrl = sbURL.toString();
                        if (loadUrl !== "") {
                            // 옵션 로드
                            generatedMetaData = metadata;
                            requirejs([loadUrl], function (loaded) {
                                loaded.initOption(optionPageLoadCallback, metadata);
                            });

                            blockOptionPageDom = thisBlock.getBlockOptionPageDom();
      
                            // console.log('blockOptionPageDom',blockOptionPageDom);
                            blockContainerThis.setOptionDom(blockUUID, blockCodeLineType, blockOptionPageDom);    
                            blockContainerThis.reRenderOptionDomPool(blockOptionPageDom);

                            thisBlock.deleteMetadata();
                        }
                    }
                }
                xmlRequest.send();
         
            } else {
                blockOptionPageDom = thisBlock.getBlockOptionPageDom();
                blockContainerThis.setOptionDom(blockUUID, blockCodeLineType, blockOptionPageDom);   
                blockContainerThis.reRenderOptionDomPool(blockOptionPageDom);
            }

            // console.log('domPool', blockContainerThis.domPool);
        }

        return loadThisComponent();
    }

    return {
        InitAPIBlockOption: InitAPIBlockOption,
        LoadAPIBlockOption: LoadAPIBlockOption
    }
});