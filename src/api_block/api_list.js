define([
    'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpXMLHandler'
    , 'nbextensions/visualpython/src/common/component/vpAccordionBox'
    , 'nbextensions/visualpython/src/common/component/vpLineNumberTextArea'
    , 'nbextensions/visualpython/src/common/component/vpIconInputText'
    , 'nbextensions/visualpython/src/common/vpFuncJS'

    , './constData.js'
], function ( $, vpCommon, vpConst, sb, xmlHandler, vpAccordionBox, vpLineNumberTextArea,vpIconInputText, vpFuncJS
              , constData ) {

    const { BLOCK_CODELINE_TYPE
            , VP_ID_APIBLOCK_LEFT_TAB_API
            , VP_CLASS_APIBLOCK_OPTION_TAB_SELECTOR } = constData;

        let xmlLibraries;
        let loadedFuncJS;
        let generatedMetaData;
        let loadedFuncID;
        var events;
        let librarySearchComplete = new Array();
        let searchBoxUUID;
        let block_closure;
        
        try {
            // events 에 대한 예외 발생 가능할 것으로 예상.
            // console.log('requirejs',requirejs);
            events = requirejs('base/js/events');
        } catch (err) {
            if (window.events === undefined) {
                var Events = function () { };
                window.events = $([new Events()]);
            }
            events = window.events;
        }
    
        // mathjaxutils 경로 문제 처리 - notebook 패키지 버전 6.1.6부터는 base/js로 이동됨
        try {
            // 6.1.6 version path for mathjaxutils
            mathjaxutils = requirejs('base/js/mathjaxutils');
        } catch (err) {
            // console.log('behind 6.1.6... reload mathjaxutils.');
            mathjaxutils = requirejs('notebook/js/mathjaxutils')
        }

        var getOptionPageURL = function(funcID) {
            // console.log('funcID', funcID);
            var sbURL = new sb.StringBuilder();
            
            sbURL.append(Jupyter.notebook.base_url);
            sbURL.append(vpConst.BASE_PATH);
            sbURL.append(vpConst.SOURCE_PATH);

            // 함수 경로 바인딩
            var optionData = $(xmlLibraries.getXML()).find(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_ID_ATTR + "=" + funcID + "]");
            var filePath = $(optionData).find(vpConst.LIBRARY_ITEM_FILE_URL_NODE).text();
       
            sbURL.append(filePath);
            return sbURL.toString();
        }

        var addAutoCompleteItem = function(item) {
            // 이미 등록된 항목은 제외한다.
            if (!librarySearchComplete.includes(item)) {
                librarySearchComplete.push(item);
            }
        }

        var setLibraryLoadComplete = function() {
            libraryLoadComplete = true;
            events.trigger('library_load_complete.vp');
        }

        var librariesBind = function(node, container) {
            $(node).children(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_TYPE_ATTR + "=" + vpConst.LIBRARY_ITEM_TYPE_PACKAGE + "]").each(function() {
                var thisNode = $(this);
                var accboxTopGrp;
                if ($(thisNode).attr(vpConst.LIBRARY_ITEM_DEPTH_ATTR) == 0) {
                    accboxTopGrp = makeLibraryTopGroupBox($(thisNode));
                    
                    $(container).append(accboxTopGrp.toTagString());
                }
            });
        }

        var bindSearchAutoComplete = function() {
            $(xmlLibraries.getXML()).find(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_TYPE_ATTR + "=" + vpConst.LIBRARY_ITEM_TYPE_FUNCTION + "]").each(function() {
                addAutoCompleteItem($(this).attr(vpConst.LIBRARY_ITEM_NAME_ATTR));
                $(this).attr(vpConst.LIBRARY_ITEM_TAG_ATTR).split(",").forEach(function(tag) {
                    addAutoCompleteItem(tag.trim());
                });
            });
    
            $(vpCommon.wrapSelector(vpCommon.formatString(".{0} input", searchBoxUUID))).autocomplete({
                source: librarySearchComplete
                , classes: {
                    "ui-autocomplete": "vp-search-autocomplete"
                  }
            });
        }

        var libraryLoadCallback = function(container) {
            setLibraryLoadComplete();
            librariesBind($(xmlLibraries.getXML()).children(vpConst.LIBRARY_ITEM_WRAP_NODE), container);
            bindSearchAutoComplete();
        };

        var loadLibraries = function(container) {
            var libraryURL = window.location.origin + vpConst.PATH_SEPARATOR + vpConst.BASE_PATH + vpConst.DATA_PATH + vpConst.VP_LIBRARIES_XML_URL;
            xmlLibraries = new xmlHandler.VpXMLHandler(libraryURL);
            xmlLibraries.loadFile(libraryLoadCallback, container);

            /** 추가 */
            return xmlLibraries;
        }

        var loadLibrariesToJson = function(callback, param) {
            var libraryURL = window.location.origin + vpConst.PATH_SEPARATOR + vpConst.BASE_PATH + vpConst.DATA_PATH + vpConst.VP_LIBRARIES_XML_URL;
            xmlLibraries = new xmlHandler.VpXMLHandler(libraryURL);
            param = xmlLibraries;
            xmlLibraries.loadFile(callback, param);
        }

        /**
         * 최상위 패키지는 아코디언 박스로 생성한다.
         * @param {xmlNode} topGrpNode 최상위 페키지
         */
        var makeLibraryTopGroupBox = function(topGrpNode) {
            var accBox = new vpAccordionBox.vpAccordionBox($(topGrpNode).attr(vpConst.LIBRARY_ITEM_NAME_ATTR), false, true);

            // 추가 클래스 설정
            // accBox.addClass(vpConst.ACCORDION_GRAY_BGCOLOR);
            accBox.addClass(vpConst.ACCORDION_SMALL_ARROW);

            // 속성 부여
            accBox.addAttribute(vpConst.LIBRARY_ITEM_DATA_ID, $(topGrpNode).attr(vpConst.LIBRARY_ITEM_ID_ATTR));

            // 자식 그룹 노드 생성
            accBox.appendContent(makeLibraryListsGroupNode(topGrpNode));
            
            return accBox;
        }

        /**
         * api list 그룹 하위 표시 토글
         * @param {object} trigger 이벤트 트리거 객체
         */
        var toggleApiListSubGroupShow = function(trigger) {
            $(trigger).parent().children(vpCommon.formatString("li.{0}", vpConst.LIST_ITEM_LIBRARY_GROUP)).not($(trigger)).find(vpCommon.formatString(".{0}", vpConst.LIST_ITEM_LIBRARY)).hide();
            $(trigger).children(vpCommon.formatString(".{0}", vpConst.LIST_ITEM_LIBRARY)).toggle();
     
            // 하이라이트 처리
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", VP_ID_APIBLOCK_LEFT_TAB_API)))
                    .find(vpCommon.formatString(".{0}", vpConst.COLOR_FONT_ORANGE))
                    .not($(trigger)).removeClass(vpConst.COLOR_FONT_ORANGE);
            $(trigger).addClass(vpConst.COLOR_FONT_ORANGE);
        }

        /**
         * 옵션 페이지 로드 완료 callback.
         * @param {funcJS} funcJS 옵션 js 객체
         */
        var optionPageLoadCallback_block = function(funcJS) {
            /**  --------------- 기존의 optionPageLoadCallback코드 에서 변경한 코드 --------------------- */

            /** 블럭이 package를 지역변수로 잡음 
             *  package(== funcJS)는 API List(common, numpy, pandas... 등등) 혹은 Markdown 을 의미
            */
            block_closure.setImportPakage(funcJS);
            const importPakage = block_closure.getImportPakage();

            /** Text 블럭일 경우 */
            if (block_closure.getBlockType() == BLOCK_CODELINE_TYPE.TEXT) {
                /** Markdown package와 Text 블럭이 데이터를 통신하기 위해 서로의 this 포인트를 지역변수로 참조 함*/
                importPakage.setBlock(block_closure);
            }

            /** ---------------- 이하 기존의 optionPageLoadCallback코드 -----------------------------*/
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_LOAD_AREA))).empty();
        
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_NAVIGATOR_INFO_PANEL),
                vpCommon.formatString(".{0}", vpConst.OPTION_NAVIGATOR_INFO_NODE))).remove();
            $(vpCommon.wrapSelector(vpConst.OPTION_CONTAINER)).children(vpConst.OPTION_PAGE).remove();

            // load 옵션 변경시 기존 옵션 이벤트 언바인드 호출.
            if (loadedFuncJS != undefined) {
                // loadedFuncJS.unbindOptionEvent();
            }
            loadedFuncJS = funcJS;

            var naviInfoTag = makeOptionPageNaviInfo($(xmlLibraries.getXML()).find(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_ID_ATTR + "=" + loadedFuncID + "]"));
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_NAVIGATOR_INFO_PANEL))).append(naviInfoTag);

            // metadata 존재하면 load
            if (loadedFuncJS.metadata !== undefined && loadedFuncJS.metadata != "") {
                loadedFuncJS.loadMeta(loadedFuncJS, generatedMetaData);
            }
            var blockOptionPageDom = makeUpGreenRoomHTML();

            /**  --------------- 다시 기존의 optionPageLoadCallback코드 에서 변경한 코드 --------------------- */
            block_closure.setBlockOptionPageDom(blockOptionPageDom);
            block_closure.renderOptionPage();
            loadedFuncJS.bindOptionEvent();
        }
        /**
         * 그룹 노드 리스트 아이템으로 생성
         * @param {xmlNode} grpNode 그룹 노드
         */
        var makeLibraryListsGroupNode = function(grpNode) {
            var sbGrpNode = new sb.StringBuilder();
            
            sbGrpNode.appendLine(makeLibraryListsFunctionNode(grpNode));
            
            sbGrpNode.appendFormatLine("<ul class='{0}' {1}>", vpConst.LIST_ITEM_LIBRARY, $(grpNode).attr(vpConst.LIBRARY_ITEM_DEPTH_ATTR) > 0 ? "style='display:none;'" : "");

            $(grpNode).children(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_TYPE_ATTR + "=" + vpConst.LIBRARY_ITEM_TYPE_PACKAGE + "]").each(function() {
                sbGrpNode.appendFormatLine("<li class='{0}' {1}='{2}'>{3}"
                    , vpConst.LIST_ITEM_LIBRARY_GROUP, vpConst.LIBRARY_ITEM_DATA_ID, $(this).attr(vpConst.LIBRARY_ITEM_ID_ATTR), $(this).attr(vpConst.LIBRARY_ITEM_NAME_ATTR));
                
                sbGrpNode.appendLine(makeLibraryListsGroupNode($(this)));
                
                sbGrpNode.appendLine("</li>");
            });
            sbGrpNode.appendLine("</ul>");
            
            return sbGrpNode.toString();
        }
        /**
         * 함수 노드 리스트 아이템으로 생성
         * @param {xmlNode} grpNode 그룹 노드
         */
        var makeLibraryListsFunctionNode = function(grpNode) {
            var sbFuncNode = new sb.StringBuilder();

            sbFuncNode.appendFormatLine("<ul class='{0}' {1}>", vpConst.LIST_ITEM_LIBRARY, $(grpNode).attr(vpConst.LIBRARY_ITEM_DEPTH_ATTR) > 0 ? "style='display:none;'" : "");

            $(grpNode).children(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_TYPE_ATTR + "=" + vpConst.LIBRARY_ITEM_TYPE_FUNCTION + "]").each(function() {
                sbFuncNode.appendFormatLine("<li class='{0}' {1}='{2}'>{3}</li>"
                    , vpConst.LIST_ITEM_LIBRARY_FUNCTION, vpConst.LIBRARY_ITEM_DATA_ID, $(this).attr(vpConst.LIBRARY_ITEM_ID_ATTR), $(this).attr(vpConst.LIBRARY_ITEM_NAME_ATTR));
            });

            sbFuncNode.appendLine("</ul>");

            return sbFuncNode.toString();
        }
        /**
         * api list library 검색
         * @param {String} keyword 검색어
         */
        var searchAPIList = function(keyword) {
            alert(vpCommon.formatString("search keyword > {0}", keyword));
        }

    /**
     * 옵션 페이지 로드
     * @param {String} funcID xml 함수 id
     * @param {function} callback 로드 완료시 실행할 함수
     * @param {JSON} metadata 메타데이터
     */
    var loadOption_block = function(funcID, callback, metadata) {
        var loadUrl = '';
        if (funcID == 'com_markdown') {
            loadUrl = 'markdown/markdown.js';
        } else {
            loadUrl = getOptionPageURL(funcID);
        }
        // var loadUrl = getOptionPageURL(funcID);
        // 옵션 페이지 url 로딩이 정상처리 된 경우 js 파일 로드
        if (loadUrl !== "") {
            // 옵션 로드
            loadedFuncID = funcID;
            generatedCode = undefined;
            generatedMetaData = metadata;
            requirejs([loadUrl], function (loaded) {
                loaded.initOption(callback, metadata);
            });
        }
    }

    var loadOption_textBlock = function(funcID, callback, metadata) {
        var loadUrl = '/nbextensions/visualpython/src/markdown/markdown.js';
            // 옵션 페이지 url 로딩이 정상처리 된 경우 js 파일 로드
        if (loadUrl !== "") {
            // 옵션 로드
            loadedFuncID = funcID;
            generatedCode = undefined;
            generatedMetaData = metadata;
            requirejs([loadUrl], function (loaded) {
                loaded.initOption(callback, metadata);
            });
        }
    }

    /**
     * 로드된 함수 경로 바인딩
     * @param {xmlNode} node node for binding
    */
    var makeOptionPageNaviInfo = function(node) {
        var sbNaviInfo = new sb.StringBuilder();
            
        if ($(node).parent().attr(vpConst.LIBRARY_ITEM_DEPTH_ATTR) !== undefined) {
            sbNaviInfo.appendLine(makeOptionPageNaviInfo($(node).parent()));
        }

        sbNaviInfo.appendFormatLine("<span class='{0}' {1}={2}>{3}</span>"
            , vpConst.OPTION_NAVIGATOR_INFO_NODE, vpConst.LIBRARY_ITEM_DATA_ID, $(node).attr(vpConst.LIBRARY_ITEM_ID_ATTR), $(node).attr(vpConst.LIBRARY_ITEM_NAME_ATTR));
                
        return sbNaviInfo.toString();
    }

    /** 
    * 로딩된 옵션 페이지 html 처리
    */
    var makeUpGreenRoomHTML = function() {
        var that;
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM), vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE))).each(function() {
            // $(this).find("h4:eq(0)").hide();
            // $(this).find("hr:eq(0)").hide();
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_LOAD_AREA))).html($(this));
            $(vpCommon.wrapSelector(vpCommon.formatString(".{0}", VP_CLASS_APIBLOCK_OPTION_TAB_SELECTOR))).append($(this));
            that = $(this);
        });

        // that = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM), vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE)))[0];
        // $(that).find("h4:eq(0)").hide();
        // $(that).find("hr:eq(0)").hide();
        // $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_LOAD_AREA))).append($(that));
        // $(vpCommon.wrapSelector(vpCommon.formatString(".{0}", VP_CLASS_APIBLOCK_OPTION_TAB_SELECTOR))).append($(that));

        return that;
    }

    /** 2021 01 19 이진용 추가 
     *  funcID를 인자로 받고
     *  funcID에 매핑되는 navigation Info를 가져오는 함수
     *  navigation Info는 API List 블록 preview에 표시하기 위해 사용됨
     */
    var getNavigationInfo = function(funcID) {
        const naviInfoTag = makeOptionPageNaviInfo($(xmlLibraries.getXML()).find(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_ID_ATTR + "=" + funcID + "]"));
        let naviInfo = '';
        let index = 0;
        $(naviInfoTag).each(function() {
            index++;
            if ($(this).html()) {
                naviInfo += $(this).html();
                naviInfo += ' ';
                if (index != $(naviInfoTag).length) {
                    naviInfo += '>';
                    naviInfo += ' ';
                }
            }
        });

        return naviInfo;
    }

    /** 2021 01 19 이진용 추가
     *  TODO: 이 함수는 새로 개선 하고 싶은 함수
     * 
     *  -함수 설명-
     *  생성한 API List블럭이나 Text 블럭을 클로저 변수인 block_closure에 담아놓고 
     *  optionPageLoadCallback_block의 콜백 인자로 
     *  전달하기 위해서 생성한 함수
     *  콜백인자로 전달하는 이유는
     *  optionPageLoadCallback_block의 콜백 인자로 API List블럭이나 Text 블럭을 넣어야
     *  python common, numpy, pandas 같은 package를 API List블럭이 setImportPackage함수를 통해 지역변수 데이터로 가져올 수 있고,
     *  Markdown package를 Text 블럭이 마찬가지로 setImportPackage함수를 통해 지역변수 데이터로 가져올 수 있기 때문
     *  
     *  -민주님께 전달-
     *  현재 loadoption과 optionPageLoadCallback 콜백 함수를 거쳐야만 
     *  API Block블럭에서 API List package에 접근할 수 있어서 이런 방식을 택했습니다. (다른 방법이 있을 수도 있는데 일단은 이렇게 했습니다.)
     *  개인적으로는
     *  모든 API List package 클래스의 첫번째에 똑같은 optionPageLoadCallback 코드가 있는게 비효율적이라 생각합니다.
     *  그렇다고 현재 이걸 바꾼다는건 무리인거 같습니다.
     * 
     *  API Block이나 혹은 또 다른 무언가를 새로 만들었을 때,
     *  API List의 데이터를 가져오기 위해 통신한다던가 할 때 필요한 프로토콜을 정할 필요가 있는 것 같습니다.
     * 
     */

     /**
      * @param {Block} block_closure_param API List 블럭 or Text 블럭 만 올 수 있음
      */
    const setClosureBlock = function(block_closure_param) {
        block_closure = block_closure_param;
    }

    return { loadLibraries
             , loadLibrariesToJson
             , loadOption_block
             , loadOption_textBlock
             , makeUpGreenRoomHTML 
             , optionPageLoadCallback_block
             , setClosureBlock
             , getNavigationInfo

             , libraryLoadCallback
             , toggleApiListSubGroupShow
             , makeOptionPageNaviInfo
    };
});
