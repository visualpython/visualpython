define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/vpXMLHandler'
    , 'nbextensions/visualpython/src/pandas/fileNavigation/index'
    , 'nbextensions/visualpython/src/common/component/vpTab'
    , 'nbextensions/visualpython/src/common/component/vpIconInputText'
    , 'nbextensions/visualpython/src/common/component/vpAccordionBox'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'components/marked/lib/marked'

], function ( requirejs, $, vpCommon, sb, vpConst, xmlHandler, fileNavigation, vpTab, vpIconInputText, vpAccordionBox, vpFuncJS, marked) {
    "use strict";
    
    /** 전역 변수 영역 시작 */

    let xmlLibraries;
    let libraryLoadComplete = false;
    let loadedFuncJS;
    let apiBlockJS;
    let generatedCode;
    let generatedMetaData;
    let loadedFuncID;
    var events;
    let nodeIndex = 0;
    let textNodeIndex = 0;
    let librarySearchComplete = new Array();
    let searchBoxUUID;
    let isShowNoteNodeDetail = false;
    var mathjaxutils;

    try {
        // events 에 대한 예외 발생 가능할 것으로 예상.
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
        console.log('behind 6.1.6... reload mathjaxutils.');
        mathjaxutils = requirejs('notebook/js/mathjaxutils')
    }

    var noteBrowser = function(obj) {
        // file navigation : state 데이터 목록
        this.state = {
            paramData:{
                encoding: "utf-8" // 인코딩
                , delimiter: ","  // 구분자
            },
            returnVariable:"",    // 반환값
            isReturnVariable: false,
            fileExtension: vpConst.VP_NOTE_EXTENSION // 확장자
        }; 
        this.fileResultState = {
            pathInputId : vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_REAL_FILE_PATH))
        };
    }
    var nbNote = new noteBrowser(this);

    /** 전역 변수 영역 끝 */

    
    /** 컨트롤 초기화 영역 시작 */

    /**
     * 메인 UI init
     */
    var containerInit = function() {
        headerExtraMenuPopupInit();

        apiModeInit();

        noteModeInit();
        
        // FIXME: workflow 탭 헤더 임시 숨김
        $(vpCommon.wrapSelector("li[rel='vp_Workflow'")).hide();

        setNotePaletteWidthLimit();

        // 사이즈 변경 설정
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).resizable({
            minWidth: 200,
            // maxWidth: 500,
            handles:"w",
            start: releaseNotePaletteWidthLimit,
            resize: resizingPalette,
            stop: setNotePaletteWidthLimit
        });
    }

    /**
     * Header Extra Menu Popup Page
     */
    var headerExtraMenuPopupInit = function() {
        var sbPopupPage = new sb.StringBuilder();

        sbPopupPage.appendFormatLine("<div id='{0}'>", vpConst.MENU_POPUP);
        // container
        sbPopupPage.appendFormatLine("<div class='{0}'>", vpConst.MENU_POPUP_CONTAINER);

        // header
        sbPopupPage.appendFormatLine("<div class='{0}'>", vpConst.MENU_POPUP_HEADER);
        // title
        sbPopupPage.appendFormatLine("<div class='{0}'></div>", vpConst.MENU_POPUP_TITLE);
        // close button
        sbPopupPage.appendFormatLine("<div class='{0}'><i class='{1}'></i></div>"
                                    , vpConst.MENU_POPUP_CLOSE, 'fa fa-close');
        sbPopupPage.appendLine('</div>');

        // body
        sbPopupPage.appendFormatLine("<div class='{0}'>", vpConst.MENU_POPUP_BODY);
        sbPopupPage.appendLine('</div>');
        sbPopupPage.appendLine('</div>');
        sbPopupPage.appendLine('</div>');

        $(vpCommon.formatString("#{0}", vpConst.VP_CONTAINER_ID)).append(sbPopupPage.toString());
        $(vpCommon.formatString("#{0}", vpConst.MENU_POPUP)).hide();
    }

    /**
     * API Mode html initialize
     */
    var apiModeInit = function() {
        // api 탭 생성
        var apiTypeTab = new vpTab.vpTab();
        apiTypeTab.addTabPage(vpConst.API_LIST_CAPTION);
        apiTypeTab.addTabPage(vpConst.API_BLOCK_CAPTION);
        
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).append(apiTypeTab.toTagString());

        // api list 페이지 바인딩
        $(apiTypeTab.pageSelector(0)).append(apiListPageInit());
        
        // 라이브러리 바인딩.
        loadLibraries($(apiTypeTab.pageSelector(0)).children(vpCommon.formatString("#{0}", vpConst.API_LIST_LIBRARY_LIST_CONTAINER)));
        
        // api block 페이지 바인딩
        // $(apiTypeTab.pageSelector(1)).append("TEST PAGE FOR API BLOCK TAB PAGE!")
        $(apiTypeTab.pageSelector(1)).append(apiBlockPageInit());

        // api block load call
        loadApiBlock($(apiTypeTab.pageSelector(1)).children(vpCommon.formatString("#{0}", vpConst.API_BLOCK_CONTAINER)));
    }

    /**
     * API List Mode tab page initialize
     * @returns api list tab page
     */
    var apiListPageInit = function() {
        var sbApiListPage = new sb.StringBuilder();

        // 라이브러리 리스트(네비게이터) 영역
        sbApiListPage.appendFormatLine("<div id='{0}'>", vpConst.API_LIST_LIBRARY_LIST_CONTAINER);

        // 검색 컨트롤 추가
        // var searchBox = new vpIconInputText.vpIconInputText();
        // searchBox.setIconClass("srch-icon");
        // searchBox.setPlaceholder("search");
        // sbApiListPage.appendLine(searchBox.toTagString());
        // searchBoxUUID = searchBox._UUID;
        
        // 검색 아이콘 클릭 이벤트 바인딩
        // searchBox.addEvent("click", "icon", function() { searchAPIList($(this).parent().children("input").val()); });
        // searchBox.addEvent("keydown", "text", function(evt) {
        //     if (evt.keyCode == 13) {
        //         evt.preventDefault();
        //         searchAPIList($(this).parent().children("input").val());
        //     }
        // });

        sbApiListPage.appendLine("</div>");
        
        // 옵션 로드용 임시 영역
        sbApiListPage.appendFormatLine("<div id='{0}'></div>", vpConst.OPTION_GREEN_ROOM);

        // 옵션 표시 영역
        sbApiListPage.appendFormatLine("<div id='{0}' style='display:none;'>", vpConst.OPTION_CONTAINER);

        // 옵션 컨트롤 영역
        sbApiListPage.appendFormatLine("<div id='{0}'>", vpConst.OPTION_CONTROL_PANEL);

        // 옵션 네비 인포 영역
        sbApiListPage.appendFormatLine("<div id='{0}'></div>", vpConst.OPTION_NAVIGATOR_INFO_PANEL);
        
        // 로드 옵션 설정창 닫기 버튼
        sbApiListPage.appendFormatLine("<div id='{0}'></div>", vpConst.CLOSE_OPTION_BUTTON);
        
        // 옵션 액션 버튼 컨테이너
        sbApiListPage.appendFormatLine("<div id='{0}'>", vpConst.ACTION_OPTION_BUTTON_PANEL);

        sbApiListPage.appendFormatLine("<span type='button' class='{0} {1}' id='{2}'>Add</span>"
            , vpConst.ACTION_OPTION_BUTTON, vpConst.COLOR_BUTTON_GRAY_WHITE, vpConst.OPTION_BTN_ADD_CELL);

        sbApiListPage.appendFormatLine("<span type='button' class='{0} {1}' id='{2}'>Run</span>"
            , vpConst.ACTION_OPTION_BUTTON, vpConst.COLOR_BUTTON_ORANGE_WHITE, vpConst.OPTION_BTN_RUN_CELL);

        sbApiListPage.appendFormatLine("<div id='{0}'></div>", vpConst.OPTION_BTN_SAVE_ON_NOTE);
        
        sbApiListPage.appendLine("</div>");
        
        sbApiListPage.appendLine("</div>");
        
        // 로드된 옵션 위치 영역
        sbApiListPage.appendFormatLine("<div id='{0}'></div>", vpConst.OPTION_LOAD_AREA);

        sbApiListPage.appendLine("</div>");

        return sbApiListPage.toString();
    }

    /**
     * API Block tab page initialize
     * @returns api list tab page
     */
    var apiBlockPageInit = function() {
        var sbApiBlockPage = new sb.StringBuilder();
        // api block wrap 영역
        sbApiBlockPage.appendFormatLine("<div id='{0}'>", vpConst.API_BLOCK_CONTAINER);

        /** TODO: 이진용 주임 2021 01 10 새버전에서 주석처리 */
        // // 옵션 액션 버튼 컨테이너
        // sbApiBlockPage.appendFormatLine("<div id='{0}'>", vpConst.BLOCK_OPTION_BUTTON_PANEL);

        // sbApiBlockPage.appendFormatLine("<span type='button' class='{0} {1}' id='{2}'>Add</span>"
        //     , vpConst.ACTION_OPTION_BUTTON, vpConst.COLOR_BUTTON_GRAY_WHITE, vpConst.BLOCK_BTN_ADD_CELL);

        // sbApiBlockPage.appendFormatLine("<span type='button' class='{0} {1}' id='{2}'>Run</span>"
        //     , vpConst.ACTION_OPTION_BUTTON, vpConst.COLOR_BUTTON_ORANGE_WHITE, vpConst.BLOCK_BTN_RUN_CELL);
    
        // sbApiBlockPage.appendFormatLine("<div id='{0}'></div>", vpConst.BLOCK_BTN_SAVE_ON_NOTE);

        // sbApiBlockPage.appendLine("</div>");





        sbApiBlockPage.appendLine("</div>");
        return sbApiBlockPage.toString();
    }

    /**
     * note Mode html initialize
     */
    var noteModeInit = function() {
        // note 탭 생성
        var noteTypeTab = new vpTab.vpTab();
        noteTypeTab.addTabPage(vpConst.VP_NOTE_CAPTION);
        noteTypeTab.addTabPage(vpConst.WORKFLOW_CAPTION);
        
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).append(noteTypeTab.toTagString());
        
        // extra menu btn 추가
        $(noteTypeTab.wrapSelector(vpCommon.formatString("ul.{0}", vpConst.TAB_HEAD_CONTROL))).append(noteModeExtraMenuInit());

        // api list 페이지 바인딩
        $(noteTypeTab.pageSelector(0)).append(notePageInit());

        // note node detail show or hide setting FIXME: 현재는 무조건 default hide 로 설정
        toggleNoteDetailInfo(false);

        // note node list sortable 설정
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER))).sortable({
            containment: $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
            , axis: "y"
            , revert: false
            , scroll: true
            , cancel: vpCommon.formatString(".{0},.{1},.{2}", vpConst.VP_NOTE_NODE_ICON_HEADER, vpConst.VP_NOTE_NODE_ADDITIONAL_CONTROLS, vpConst.VP_NOTE_NODE_CAPTION_INPUT)
            , update: nodeReIndexing
        });
    }

    /**
     * note Mode tab additional menu button
     * @returns note mode extra menu
     */
    var noteModeExtraMenuInit = function() {
        var sbExtraMenu = new sb.StringBuilder();

        sbExtraMenu.appendFormatLine("<div id='{0}'>", vpConst.VP_NOTE_EXTRA_MENU_BTN);

        sbExtraMenu.appendFormatLine("<div id='{0}'>", vpConst.VP_NOTE_EXTRA_MENU_CONTAINER);

        sbExtraMenu.appendFormatLine("<ul class='{0}'>", vpConst.VP_NOTE_EXTRA_MENU_LIST);
        
        sbExtraMenu.appendFormatLine("<li class='{0}' id='{1}'>{2}</li>"
            , vpConst.VP_EXCEPT_BIND, vpConst.VP_NOTE_EXTRA_MENU_NEW_NOTE, vpConst.VP_NOTE_EXTRA_MENU_NEW_NOTE_CAPTION);
        sbExtraMenu.appendFormatLine("<li class='{0}' id='{1}'>{2}</li>"
            , vpConst.VP_EXCEPT_BIND, vpConst.VP_NOTE_EXTRA_MENU_OPEN_NOTE, vpConst.VP_NOTE_EXTRA_MENU_OPEN_NOTE_CAPTION);

        sbExtraMenu.appendFormatLine("<hr class='{0}'/>", vpConst.VP_NOTE_EXTRA_MENU_LINE);

        // FIXME: 현재 기능 없어 메뉴 추가 임시 제거
        // sbExtraMenu.appendFormatLine("<li class='{0}' id='{1}'>{2}</li>"
        //     , vpConst.VP_EXCEPT_BIND, vpConst.VP_NOTE_EXTRA_MENU_UNDO_NOTE, vpConst.VP_NOTE_EXTRA_MENU_UNDO_NOTE_CAPTION);
        // sbExtraMenu.appendFormatLine("<li class='{0}' id='{1}'>{2}</li>"
        //     , vpConst.VP_EXCEPT_BIND, vpConst.VP_NOTE_EXTRA_MENU_REDO_NOTE, vpConst.VP_NOTE_EXTRA_MENU_REDO_NOTE_CAPTION);
        sbExtraMenu.appendFormatLine("<li class='{0}' id='{1}'>{2}</li>"
            , vpConst.VP_EXCEPT_BIND, vpConst.VP_NOTE_EXTRA_MENU_RUN_ALL_NOTE, vpConst.VP_NOTE_EXTRA_MENU_RUN_ALL_NOTE_CAPTION);

        sbExtraMenu.appendFormatLine("<hr class='{0}'/>", vpConst.VP_NOTE_EXTRA_MENU_LINE);

        sbExtraMenu.appendFormatLine("<li class='{0}' id='{1}'>{2}</li>"
            , vpConst.VP_EXCEPT_BIND, vpConst.VP_NOTE_EXTRA_MENU_SHOW_DETAIL_NOTE, vpConst.VP_NOTE_EXTRA_MENU_SHOW_DETAIL_NOTE_CAPTION);
        sbExtraMenu.appendFormatLine("<li class='{0}' id='{1}'>{2}</li>"
            , vpConst.VP_EXCEPT_BIND, vpConst.VP_NOTE_EXTRA_MENU_HIDE_DETAIL_NOTE, vpConst.VP_NOTE_EXTRA_MENU_HIDE_DETAIL_NOTE_CAPTION);

        sbExtraMenu.appendFormatLine("<hr class='{0}'/>", vpConst.VP_NOTE_EXTRA_MENU_LINE);

        sbExtraMenu.appendFormatLine("<li class='{0}' id='{1}'>{2}</li>"
            , vpConst.VP_EXCEPT_BIND, vpConst.VP_NOTE_EXTRA_MENU_SAVE_NOTE, vpConst.VP_NOTE_EXTRA_MENU_SAVE_NOTE_CAPTION);
        sbExtraMenu.appendFormatLine("<li class='{0}' id='{1}'>{2}</li>"
            , vpConst.VP_EXCEPT_BIND, vpConst.VP_NOTE_EXTRA_MENU_SAVE_AS_NOTE, vpConst.VP_NOTE_EXTRA_MENU_SAVE_AS_NOTE_CAPTION);

        sbExtraMenu.appendFormatLine("<hr class='{0}'/>", vpConst.VP_NOTE_EXTRA_MENU_LINE);

        sbExtraMenu.appendFormatLine("<li class='{0}' id='{1}'>{2}</li>"
            , vpConst.VP_EXCEPT_BIND, vpConst.VP_NOTE_EXTRA_MENU_CLOSE_NOTE, vpConst.VP_NOTE_EXTRA_MENU_CLOSE_NOTE_CAPTION);
        
        sbExtraMenu.appendLine("</ul>");

        sbExtraMenu.appendLine("</div>");

        sbExtraMenu.appendLine("</div>");
        
        return sbExtraMenu.toString();
    }

    /**
     * note Mode tab page initialize
     * @returns note tab page
     */
    var notePageInit = function() {
        var sbNotePage = new sb.StringBuilder();

        // 노트 메인메뉴(초기화면) 영역
        sbNotePage.appendFormatLine("<div id='{0}'>", vpConst.VP_NOTE_MENU_CONTAINER);

        sbNotePage.appendFormatLine("<ul class='{0}'>", vpConst.VP_NOTE_MENU_LIST);

        sbNotePage.appendFormatLine("<li id='{0}'><div class='{1}'></div>{2}</li>"
            , vpConst.VP_NOTE_MENU_NEW_NOTE, vpConst.VP_NOTE_MENU_ICON, vpConst.VP_NOTE_MENU_NEW_NOTE_CAPTION);
        sbNotePage.appendFormatLine("<li id='{0}'><div class='{1}'></div>{2}</li>"
            , vpConst.VP_NOTE_MENU_OPEN_NOTE, vpConst.VP_NOTE_MENU_ICON, vpConst.VP_NOTE_MENU_OPEN_NOTE_CAPTION);

        sbNotePage.appendLine("</ul>");

        sbNotePage.appendLine("</div>");

        // 노트 노드 리스트(컨텐츠) 영역
        sbNotePage.appendFormatLine("<div id='{0}'>", vpConst.VP_NOTE_NODE_CONTAINER);
        
        // 노트 파일 정보 영역
        sbNotePage.appendFormatLine("<div id='{0}'>", vpConst.VP_NOTE_FILE_INFO_CONTAINER);
        
        sbNotePage.appendFormatLine("<input type='text' id='{0}' placeholder='{1}'/>", vpConst.VP_NOTE_FILE_PATH_CONTROL, "untitled");
        
        sbNotePage.appendFormatLine("<input type='hidden' id='{0}'/>", vpConst.VP_NOTE_REAL_FILE_PATH);
        
        sbNotePage.appendLine("</div>");
        
        // 노드 아이템 컨테이너
        sbNotePage.appendFormatLine("<div id='{0}'></div>", vpConst.VP_NOTE_NODE_LIST_CONTAINER);

        // 노트 노드 추가 버튼
        sbNotePage.appendFormatLine("<div id='{0}'>", vpConst.VP_NOTE_MENU_NEW_NODE_CONTAINER);

        sbNotePage.appendFormatLine("<div class='{0}' id='{1}'>{2}</div>"
            , vpConst.VP_NOTE_NEW_NODE_TYPE, vpConst.VP_NOTE_NEW_NOTE_TYPE_NODE, vpConst.VP_NOTE_NEW_NOTE_TYPE_NODE_CAPTION);

        sbNotePage.appendFormatLine("<div class='{0}' id='{1}'>{2}</div>"
            , vpConst.VP_NOTE_NEW_NODE_TYPE, vpConst.VP_NOTE_NEW_NOTE_TYPE_TEXT, vpConst.VP_NOTE_NEW_NOTE_TYPE_TEXT_CAPTION);
            
        sbNotePage.appendLine("</div>");

        sbNotePage.appendLine("</div>");

        return sbNotePage.toString();
    }

    /**
     * load libraries data
     * @param {Tag} container loaded libray binding container
     */
    var loadLibraries = function(container) {
        var libraryURL = window.location.origin + vpConst.PATH_SEPARATOR + vpConst.BASE_PATH + vpConst.DATA_PATH + vpConst.VP_LIBRARIES_XML_URL;
        xmlLibraries = new xmlHandler.VpXMLHandler(libraryURL);
        xmlLibraries.loadFile(libraryLoadCallback, container);
    }

    /**
     * library load complete callback
     * @param {Tag} container loaded libray binding container
     */
    var libraryLoadCallback = function(container) {
        setLibraryLoadComplete();
        librariesBind($(xmlLibraries.getXML()).children(vpConst.LIBRARY_ITEM_WRAP_NODE), container);
        
        bindSearchAutoComplete();
    };

    /**
     * api list search box autocomplete bind
     */
    var bindSearchAutoComplete = function() {
        $(xmlLibraries.getXML()).find(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_TYPE_ATTR + "=" + vpConst.LIBRARY_ITEM_TYPE_FUNCTION + "]").each(function() {
            // addAutoCompleteItem($(this).attr(vpConst.LIBRARY_ITEM_NAME_ATTR));
            // $(this).attr(vpConst.LIBRARY_ITEM_TAG_ATTR).split(",").forEach(function(tag) {
            //     addAutoCompleteItem(tag.trim());
            // });
            if ($(this).attr(vpConst.LIBRARY_ITEM_DEPTH_ATTR) > 0) {
                addAutoCompleteItem(
                    vpCommon.formatString("{0} ({1})", $(this).attr(vpConst.LIBRARY_ITEM_NAME_ATTR), $(this).attr(vpConst.LIBRARY_ITEM_TAG_ATTR))
                    , $(this).attr(vpConst.LIBRARY_ITEM_ID_ATTR)
                );
            }
        });

        $(vpCommon.wrapSelector(vpCommon.formatString(".{0} input", searchBoxUUID))).autocomplete({
            source: librarySearchComplete
            , classes: {
                "ui-autocomplete": "vp-search-autocomplete"
            }
            , select: function(evt, ui) {
                // 함수 이름으로만 값 설정
                $(vpCommon.wrapSelector(vpCommon.formatString(".{0} input", searchBoxUUID))).val(
                    $(xmlLibraries.getXML()).find(vpCommon.formatString("#{0}", ui.item.value)).attr(vpConst.LIBRARY_ITEM_NAME_ATTR));
                    
                // 함수 로드.
                loadOption(ui.item.value, optionPageLoadCallback);
                return false;
            }
        });
    }

    /**
     * add auto complete item
     * @param {String} itemLabel library search auto complete item label
     * @param {String} itemValue library search auto complete item value
     */
    var addAutoCompleteItem = function(itemLabel, itemValue) {
        // page load를 위해 value 에 id 를 포함한다.
        librarySearchComplete.push( { label : itemLabel, value : itemValue } );

        // 이미 등록된 항목은 제외한다.
        // if (!librarySearchComplete.includes(item)) {
        //     librarySearchComplete.push(item);
        // }
    }

    /**
     * 라이브러르 로드 상태 변경 및 변경완료 트리거 발동
     */
    var setLibraryLoadComplete = function() {
        libraryLoadComplete = true;
        events.trigger('library_load_complete.vp');
    }

    /**
     * api list initialize
     * @param {xmlNode} node mother node for binding
     * @param {Tag} container loaded libray binding container
     */
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

    /**
     * 최상위 패키지는 아코디언 박스로 생성한다.
     * @param {xmlNode} topGrpNode 최상위 페키지
     */
    var makeLibraryTopGroupBox = function(topGrpNode) {
        var accBox = new vpAccordionBox.vpAccordionBox($(topGrpNode).attr(vpConst.LIBRARY_ITEM_NAME_ATTR), false, true);

        // 추가 클래스 설정
        accBox.addClass(vpConst.ACCORDION_GRAY_BGCOLOR);
        accBox.addClass(vpConst.ACCORDION_SMALL_ARROW);

        // 속성 부여
        accBox.addAttribute(vpConst.LIBRARY_ITEM_DATA_ID, $(topGrpNode).attr(vpConst.LIBRARY_ITEM_ID_ATTR));

        // 자식 그룹 노드 생성
        accBox.appendContent(makeLibraryListsGroupNode(topGrpNode));
        
        return accBox;
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
     * load api block
     */
    var loadApiBlock = function() {
        // library 정보 로드 종료되지 않으면 이벤트로 등록
        if (!libraryLoadComplete) {
            events.on('library_load_complete.vp', loadApiBlock);
            return;
        }

        events.off('library_load_complete.vp', loadApiBlock);
        var loadUrl = getOptionPageURL("api_block");
        // 옵션 페이지 url 로딩이 정상처리 된 경우 js 파일 로드
        if (loadUrl !== "") {
            // 옵션 로드
            requirejs([loadUrl], function (loaded) {
                loaded.initOption(apiBlockLoadCallback);
            });
        }
    }

    /** 컨트롤 초기화 영역 끝 */
    
    /** 이벤트 핸들러 영역 시작 */
    
    /**
     * 노트모드 영역 넓이 제한 해제
     */
    var releaseNotePaletteWidthLimit = function() {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).css("min-width", "");
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).css("max-width", "");
    }

    /**
     * 노트모드 영역 넓이 제한 설정
     */
    var setNotePaletteWidthLimit = function() {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).css("min-width", "200px");
        // $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).css("max-width", "500px");
    }

    /**
     * Note palette resize event hanlder
     */
    var resizingPalette = function() {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).css("left", "");
        calculatePaletteWidth(false);
    }

    /**
     * api, note palette width calculate
     * @param {boolean} isMainContainer vp 전체 영역 사이즈 변경 여부
     */
    var calculatePaletteWidth = function(isMainContainer = true) {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).css("right", "0");
        
        // note mode 표시중인 경우
        if ($(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).is(":visible")) {
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).width(
                $(vpCommon.wrapSelector(".vp-main-container")).width() - $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).outerWidth(true)
            );
            // 전체 영역에서 줄어드는 경우 api palette 가 최소이면 note palette 도 축소한다.
            if (isMainContainer && ($(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).width() == $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).css("min-width").replace("px", ""))) {
                $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).width(
                    $(vpCommon.wrapSelector(".vp-main-container")).width() - 20 - $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).width()
                );
            }
        } else {
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).width($(vpCommon.wrapSelector(".vp-main-container")).width());
        }
    }

    /**
     * api list library 검색
     * @param {String} keyword 검색어
     */
    var searchAPIList = function(keyword) {
        alert(vpCommon.formatString("search keyword > {0}", keyword));
    }

    /**
     * 공통 컴퍼넌트 탭 체인지
     * @param {object} trigger 이벤트 트리거 객체
     */
    var vpTabPageChange = function(trigger) {
        // console.log('vpTabPageChange');

        // 활성화 탭인경우 동작없음
        if ($(trigger).hasClass("active")) return;

        var openPageID = $(trigger).attr("rel");
        
        $(trigger).parent().parent()
            .children(vpCommon.formatString(".{0}{1}", vpConst.VP_CLASS_PREFIX, "tab-content"))
            .children(vpCommon.formatString(".{0}{1}", vpConst.VP_CLASS_PREFIX, "tab-page")).hide();
        $(trigger).parent().parent().find(vpCommon.formatString("#{0}", openPageID)).show();
        $(trigger).parent().children(".active").removeClass("active");
        $(trigger).addClass("active");

        // var openPageID = 'vp_APIBlock';
        // $(trigger).parent().parent().find(vpCommon.formatString("#{0}", openPageID)).show();
    }

    /**
     * 공통 컴퍼넌트 아코디언 박스 내용 표시 토글
     * @param {object} trigger 이벤트 트리거 객체
     */
    var toggleAccordionBoxShow = function(trigger) {
        // console.log('toggleAccordionBoxShow');
        // 유니크 타입인경우 다른 아코디언 박스를 닫는다.
        if ($(trigger).parent().hasClass("uniqueType")) {
            $(trigger.parent().parent().children(vpCommon.formatString(".{0}", vpConst.ACCORDION_CONTAINER)).not($(trigger).parent()).removeClass(vpConst.ACCORDION_OPEN_CLASS));
        }
        $(trigger).parent().toggleClass(vpConst.ACCORDION_OPEN_CLASS);

        // API List library 인 경우 추가 처리.
        if ($(trigger).parent().parent().attr("id") == vpConst.API_LIST_LIBRARY_LIST_CONTAINER) {
            // 하이라이트 처리
            $(trigger).children(vpCommon.formatString(".{0}", vpConst.ACCORDION_HEADER_CAPTION)).addClass(vpConst.COLOR_FONT_ORANGE);

            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_LIST_LIBRARY_LIST_CONTAINER)))
                .find(vpCommon.formatString(".{0}", vpConst.COLOR_FONT_ORANGE))
                .not($(trigger).children(vpCommon.formatString(".{0}", vpConst.ACCORDION_HEADER_CAPTION)))
                    .removeClass(vpConst.COLOR_FONT_ORANGE);
            
            closeSubLibraryGroup();
        }
    }

    /**
     * api list 그룹 하위 표시 토글
     * @param {object} trigger 이벤트 트리거 객체
     */
    var toggleApiListSubGroupShow = function(trigger) {
        // console.log('toggleApiListSubGroupShow');
        $(trigger).parent().children(vpCommon.formatString("li.{0}", vpConst.LIST_ITEM_LIBRARY_GROUP)).not($(trigger)).find(vpCommon.formatString(".{0}", vpConst.LIST_ITEM_LIBRARY)).hide();
        $(trigger).children(vpCommon.formatString(".{0}", vpConst.LIST_ITEM_LIBRARY)).toggle();
        
        // 하이라이트 처리
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_LIST_LIBRARY_LIST_CONTAINER)))
                .find(vpCommon.formatString(".{0}", vpConst.COLOR_FONT_ORANGE))
                .not($(trigger)).removeClass(vpConst.COLOR_FONT_ORANGE);
        $(trigger).addClass(vpConst.COLOR_FONT_ORANGE);
    }

    /**
     * api list 그룹 하위 모두 숨기기
     */
    var closeSubLibraryGroup = function() {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_LIST_LIBRARY_LIST_CONTAINER), 
            vpCommon.formatString(".{0}", vpConst.ACCORDION_CONTENT_CLASS))).children(vpCommon.formatString(".{0}", vpConst.LIST_ITEM_LIBRARY))
                .find(vpCommon.formatString(".{0}", vpConst.LIST_ITEM_LIBRARY)).hide();
    }

    /**
     * 옵션 페이지 로드
     * @param {String} funcID xml 함수 id
     * @param {function} callback 로드 완료시 실행할 함수
     * @param {JSON} metadata 메타데이터
     */
    var loadOption = function(funcID, callback, metadata) {
        var loadUrl = getOptionPageURL(funcID);
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
     * 메뉴 팝업 페이지 로드 완료 callback.
     * @param {funcJS} funcJS 
     */
    var popupPageLoadCallback = function(funcJS) {
        $(vpCommon.formatString(".{0}", vpConst.MENU_POPUP_BODY)).empty();
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM), vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE))).each(function() {
            $(vpCommon.wrapSelector(vpCommon.formatString(".{0}", vpConst.MENU_POPUP_BODY))).append($(this));
        });
    }

    /**
     * 옵션 페이지 로드 완료 callback.
     * @param {funcJS} funcJS 옵션 js 객체
     */
    var optionPageLoadCallback = function(funcJS) {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_LOAD_AREA))).empty();
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_NAVIGATOR_INFO_PANEL),
            vpCommon.formatString(".{0}", vpConst.OPTION_NAVIGATOR_INFO_NODE))).remove();
        $(vpCommon.wrapSelector(vpConst.OPTION_CONTAINER)).children(vpConst.OPTION_PAGE).remove();

        // load 옵션 변경시 기존 옵션 이벤트 언바인드 호출.
        if (loadedFuncJS != undefined) {
            loadedFuncJS.unbindOptionEvent();
        }
        loadedFuncJS = funcJS;

        var naviInfoTag = makeOptionPageNaviInfo($(xmlLibraries.getXML()).find(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_ID_ATTR + "=" + loadedFuncID + "]"));
        // FIXME: funcJS 내부 id libraries.xml 과 매칭 필요
        // var naviInfoTag = makeOptionPageNaviInfo($(xmlLibraries.getXML()).find(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_ID_ATTR + "=" + loadedFuncJS.funcID + "]"));
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_NAVIGATOR_INFO_PANEL))).append(naviInfoTag);

        // metadata 존재하면 load
        if (loadedFuncJS.metadata !== undefined && loadedFuncJS.metadata != "") {
            loadedFuncJS.loadMeta(loadedFuncJS, generatedMetaData);
        }
        makeUpGreenRoomHTML();
        loadedFuncJS.bindOptionEvent();
    }

    /**
     * api block 로드 완료 callback
     * @param {funcJS} funcJS 옵션 js 객체
     */
    var apiBlockLoadCallback = function(funcJS) {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM), vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE))).each(function() {
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_BLOCK_CONTAINER))).append($(this));
        });
        apiBlockJS = funcJS;
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
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM), vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE))).each(function() {
            $(this).find("h4:eq(0)").hide(); // FIXME: 타이틀 임시 제거.
            $(this).find("hr:eq(0)").hide();
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_LOAD_AREA))).append($(this));
        });

        openOptionBook();
    }

    /**
     * 옵션 페이지 URL 조회
     * @param {String} funcID xml 함수 id
     * @returns path url
     */
    var getOptionPageURL = function(funcID) {
        var sbURL = new sb.StringBuilder();
        
        sbURL.append(Jupyter.notebook.base_url);
        sbURL.append(vpConst.BASE_PATH);
        sbURL.append(vpConst.SOURCE_PATH);
        // 함수 경로 바인딩
        var optionData = $(xmlLibraries.getXML()).find(vpConst.LIBRARY_ITEM_TAG + "[" + vpConst.LIBRARY_ITEM_ID_ATTR + "=" + funcID + "]");
        var filePath = $(optionData).find(vpConst.LIBRARY_ITEM_FILE_URL_NODE).text();
        
        // 경로가 조회되지 않는 경우
        if (filePath === undefined || filePath === "") {
            console.log("option page url - function id not founded!");
            return "";
        }

        sbURL.append(filePath);
        return sbURL.toString();
    }

    /**
     * open api option container
     */
    var openOptionBook = function() {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_LIST_LIBRARY_LIST_CONTAINER))).hide();
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_CONTAINER))).show();
    }

    /**
     * 로드된 옵션 페이지 닫기
     */
    var closeOptionBook = function() {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_LIST_LIBRARY_LIST_CONTAINER))).show();
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_CONTAINER))).hide();
        
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_NAVIGATOR_INFO_PANEL),
            vpCommon.formatString(".{0}", vpConst.OPTION_NAVIGATOR_INFO_NODE))).remove();
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_LOAD_AREA))).children().remove();
    }

    /**
     * 네비 항목 클릭하여 리스트로 이동
     * @param {object} trigger 이벤트 트리거 객체
     */
    var goListOnNavInfo = function(trigger) {
        // console.log('goListOnNavInfo');
        var obj = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_LIST_LIBRARY_LIST_CONTAINER)))
            .children(vpCommon.formatString("div[{0}={1}]", vpConst.LIBRARY_ITEM_DATA_ID, $(trigger).data(vpConst.LIBRARY_ITEM_DATA_ID.replace(vpConst.TAG_DATA_PREFIX, ""))));

        // 최상위 그룹클릭인 경우
        if (obj.length > 0) {
            // 유니크 타입인경우 다른 아코디언 박스를 닫는다.
            if ($(obj).hasClass("uniqueType")) {
                $(obj.parent().children(vpCommon.formatString(".{0}", vpConst.ACCORDION_CONTAINER)).not($(obj)).removeClass(vpConst.ACCORDION_OPEN_CLASS));
            }
            $(obj).addClass(vpConst.ACCORDION_OPEN_CLASS);
            // 하위 그룹 닫기
            closeSubLibraryGroup();
            closeOptionBook();
        } else {
            closeSubLibraryGroup();
            obj = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_LIST_LIBRARY_LIST_CONTAINER)))
                .find(vpCommon.formatString("[{0}={1}]", vpConst.LIBRARY_ITEM_DATA_ID, $(trigger).data(vpConst.LIBRARY_ITEM_DATA_ID.replace(vpConst.TAG_DATA_PREFIX, ""))));
            
            obj.children(vpCommon.formatString(".{0}", vpConst.LIST_ITEM_LIBRARY)).show();
            var objParent = obj.parent();
            for (var loopSafety = 0; loopSafety < 10; loopSafety++) {
                // 부모 리스트 존재하면 표시
                if ($(objParent).hasClass(vpConst.LIST_ITEM_LIBRARY)) {
                    $(objParent).show();
                } else if ($(objParent).hasClass(vpConst.ACCORDION_CONTAINER)) {
                    // 유니크 타입인경우 다른 아코디언 박스를 닫는다.
                    if ($(objParent).hasClass("uniqueType")) {
                        $(objParent.parent().children(vpCommon.formatString(".{0}", vpConst.ACCORDION_CONTAINER)).not($(objParent)).removeClass(vpConst.ACCORDION_OPEN_CLASS));
                    }
                    $(objParent).addClass(vpConst.ACCORDION_OPEN_CLASS);
                }
                objParent = $(objParent).parent();
                
                // 부모가 api list contianer 이면 종료
                if ($(objParent).attr("id") == vpConst.API_LIST_LIBRARY_LIST_CONTAINER) {
                    break;
                }
            }
            closeOptionBook();
        }
    }

    /**
     * 제네레이트 코드.
     * @param {funcJS} funcJS 옵션 js 객체
     * @param {boolean} addCell 셀에 코드 추가
     * @param {boolean} run 실행여부
     * @param {function} callback 로드 완료시 실행할 함수
     * @param {object} callbackParam 로드 완료시 실행할 함수 파라미터
     */
    var addLibraryToJupyterCell = function(funcJS, addCell, run, callback, callbackParam) {
        // TODO: valitate
        if (!funcJS.optionValidation()) {
            return false;
        }

        funcJS.funcID = loadedFuncID;
        generatedCode = funcJS.generateCode(addCell, run);

        if (addCell) {
            funcJS.metaSave();    
        } else {
            funcJS.metaGenerate();
        }
        generatedMetaData = funcJS.metadata;
        
        // callback 함수가 존재하면 실행.
        if (callback !== undefined) {
            callback(callbackParam);
        }

        // console.log('generatedMetaData',generatedMetaData);
        // closeOptionBook();
    }

    /**
     * 노트 노드 바로 실행
     * @param {object} trigger 이벤트 트리거 객체
     */
    var runLibraryOnNote = function(trigger) {
        var gCode = decodeURIComponent($(trigger).find(vpCommon.formatString(".{0}", vpConst.NOTE_NODE_GENERATE_CODE)).val());

        vpFuncJS.VpFuncJS.prototype.cellExecute(gCode, true, $(trigger).hasClass(vpConst.VP_NOTE_MARKDOWN_NODE) ? "markdown" : "code");
    }

    /**
     * 모드 표시를 끌수 있는지 확인 (최소 1개의 모드는 켜져 있어야 한다.)
     * @param {object} trigger 이벤트 트리거 객체
     * @returns 끌수 있는경우 true
     */
    var checkPossibleOffMode = function(trigger) {
        var onPaletteExceptSelfCount = $(vpCommon.wrapSelector(
                vpCommon.formatString("#{0}{1}", vpConst.VP_ID_PREFIX, "headerContainer")
                , vpCommon.formatString(".{0}{1}.{2}{3}", vpConst.VP_CLASS_PREFIX, "palette-selector", vpConst.VP_CLASS_PREFIX, "on")))
            .not($(trigger)).length;
        return onPaletteExceptSelfCount > 0;
    }

    /**
     * api mode on off
     * @param {object} trigger 이벤트 트리거 객체
     */
    var toggleAPIMode = function(trigger) {
        if ($(trigger).hasClass(vpCommon.formatString("{0}{1}", vpConst.VP_CLASS_PREFIX, "on"))) {
            if (checkPossibleOffMode(trigger)) {
                closeAPIArea();
            }
        } else {
            openAPIArea();
        }
    }

    /**
     * vp note mode on off
     * @param {object} trigger 이벤트 트리거 객체
     */
    var toggleNoteMode = function(trigger) {
        if ($(trigger).hasClass(vpCommon.formatString("{0}{1}", vpConst.VP_CLASS_PREFIX, "on"))) {
            if (checkPossibleOffMode(trigger)) {
                closeNoteArea();
                calculatePaletteWidth(true);
            }
        } else {
            openNoteArea();
        }
    }

    /**
     * api 영역 열기
     */
    var openAPIArea = function() {
        var btn = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_PALETTE_MODE_BTN)));
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).show();
        $(btn).addClass(vpCommon.formatString("{0}{1}", vpConst.VP_CLASS_PREFIX, "on")).removeClass(vpCommon.formatString("{0}{1}", vpConst.VP_CLASS_PREFIX, "off"));

        // palette 계산 
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).width(
            $(vpCommon.wrapSelector(".vp-main-container")).width() - 20
             - $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).children(vpCommon.formatString(".{0}:eq(0)", vpConst.TAB_CONTAINER)).width()
        );

        // 전체 영역에서 줄어드는 경우 api palette 가 최소이면 note palette 도 축소한다.
        if ($(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).width() == $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).css("min-width").replace("px", "")) {
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).width(
                $(vpCommon.wrapSelector(".vp-main-container")).width() - $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).width()
            );
        }
    }

    /**
     * api 영역 닫기
     */
    var closeAPIArea = function() {
        var btn = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_PALETTE_MODE_BTN)));
        var apiWidth = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).width();
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).hide();
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).width(
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).width() + apiWidth
        );
        $(btn).addClass(vpCommon.formatString("{0}{1}", vpConst.VP_CLASS_PREFIX, "off")).removeClass(vpCommon.formatString("{0}{1}", vpConst.VP_CLASS_PREFIX, "on"));

    }

    /**
     * vp note 영역 열기
     */
    var openNoteArea = function() {
        var btn = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_PALETTE_MODE_BTN)));
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).show();
        $(btn).addClass(vpCommon.formatString("{0}{1}", vpConst.VP_CLASS_PREFIX, "on")).removeClass(vpCommon.formatString("{0}{1}", vpConst.VP_CLASS_PREFIX, "off"));

        // palette 계산 
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).width(
            $(vpCommon.wrapSelector(".vp-main-container")).width() - 20
             - $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).children(vpCommon.formatString(".{0}:eq(0)", vpConst.TAB_CONTAINER)).width()
        );

        // 전체 영역에서 줄어드는 경우 api palette 가 최소이면 note palette 도 축소한다.
        if ($(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).width() == $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).css("min-width").replace("px", "")) {
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).width(
                $(vpCommon.wrapSelector(".vp-main-container")).width() - $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER))).width()
            );
        }
    }

    /**
     * vp note 영역 닫기
     */
    var closeNoteArea = function() {
        var btn = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_PALETTE_MODE_BTN)));
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_MODE_CONTAINER))).hide();
        $(btn).addClass(vpCommon.formatString("{0}{1}", vpConst.VP_CLASS_PREFIX, "off")).removeClass(vpCommon.formatString("{0}{1}", vpConst.VP_CLASS_PREFIX, "on"));
    }

    /**
     * 노트 모드 추가 메뉴 표시 토글
     */
    var toggleNoteExtraMenu = function() {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_CONTAINER))).toggle();

        // 하이라이트된 노드 제거
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
            .find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).removeClass(vpConst.COLOR_FONT_ORANGE);
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
            .find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_BODY)).removeClass(vpConst.COLOR_BORDER_ORANGE);
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
            .find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ADDITIONAL_CONTROLS)).hide();
    }

    /**
     * 노트 모드 추가 메뉴 표시 닫기
     */
    var closeNoteExtraMenu = function() {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_CONTAINER))).hide();
    }

    /**
     * 노드 상세정보 표시여부 토글
     * @param {boolean} show show detail
     */
    var toggleNoteDetailInfo = function(show) {
        if (show) {
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_HIDE_DETAIL_NOTE))).show();
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_SHOW_DETAIL_NOTE))).hide();
            isShowNoteNodeDetail = true;

            // 생성된 노드들 변경
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
                .find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT)).each(function() {
                    if ($(this).parent().children(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_FUNC_NAME)).val() != "") {
                        $(this).parent().children(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).html(
                            vpCommon.formatString("{0}{1}{2}", $(this).val(), vpConst.VP_NOTE_NODE_FUNC_NAME_COUPLER
                                , $(this).parent().children(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_FUNC_NAME)).val())
                        );
                    }
            });
        } else {
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_HIDE_DETAIL_NOTE))).hide();
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_SHOW_DETAIL_NOTE))).show();
            isShowNoteNodeDetail = false;

            // 생성된 노드들 변경
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
                .find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT)).each(function() {
                    $(this).parent().children(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).html($(this).val());
            });
        }
    }

    /**
     * vp note all node 제거
     */
    var clearAllNoteNode = function() {
        nodeIndex = 0;
        textNodeIndex = 0;
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_FILE_PATH_CONTROL))).val("");
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_REAL_FILE_PATH))).val("");
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER))).children(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ITEM)).remove();
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_FILE_PATH_CONTROL))).attr("disabled", false);
    }

    /**
     * 새 vp note 열기
     * @param {boolean} isReset 노트 초기화 여부
     */
    var newNotePage = function(isReset = true) {
        if (isReset) {
            clearAllNoteNode();
            // 빈노드 채우기
            addEmptyNode();
        }
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_MENU_CONTAINER))).hide();
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_CONTAINER))).show();
    }

    /**
     * 새 노트 페이지에 빈노드(node, markdonw) 추가
     * @param {String} addNodeType 추가할 노드타입. 미전달시 2타입 모두 추가
     */
    var addEmptyNode = function(addNodeType = "") {
        if (addNodeType == "" || addNodeType == vpConst.VP_NOTE_NODE_TYPE_MARKDOWN) {
            // 미전달이거나 markdonw 타입 추가인경우
            makeNoteNodeTag(vpConst.VP_NOTE_NODE_TYPE_MARKDOWN, "", "", "", false, false);
        }
        if (addNodeType == "" || addNodeType == vpConst.VP_NOTE_NODE_TYPE_NODE) {
            // 미전달이거나 node 타입 추가인경우
            makeNoteNodeTag(vpConst.VP_NOTE_NODE_TYPE_NODE, "", "", "", false, false);
        }
    }

    /**
     * vp note 열기(파일 브라우저 오픈)
     */
    var openNotePage = async function() {
        var loadURLstyle = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH;
        var loadURLhtml = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/fileNavigation/index.html";
        
        vpCommon.loadCss( loadURLstyle + "component/fileNavigation.css");

        await $(`<div id="vp_fileNavigation"></div>`).load(loadURLhtml, () => {
            $('#vp_fileNavigation').removeClass("hide");
            $('#vp_fileNavigation').addClass("show");
            
            var {vp_init, vp_bindEventFunctions } = fileNavigation;
                
            fileNavigation.vp_init(nbNote);
            fileNavigation.vp_bindEventFunctions();
        }).appendTo("#site");
    }

    /**
     * 노트 파일 열기
     * @param {boolean} isReset 노트 초기화 여부
     */
    var openNotePageAction = function(isReset = true) {
        var saveFilePath = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_REAL_FILE_PATH))).val();
        fetch(saveFilePath).then(function(file) {
            if (file.status != 200) {
                alert("The file format is not valid.");
                return;
            }

            file.text().then(function(data) {
                nodeIndex = 0;
                textNodeIndex = 0;
                var alNoteNodeList = JSON.parse(data);
                var objNode;

                if (isReset) {
                    clearAllNoteNode();
                }

                // 로드 파일 정보 바인딩
                $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_FILE_PATH_CONTROL))).val(
                    saveFilePath.substring(saveFilePath.lastIndexOf("/") + 1, saveFilePath.lastIndexOf(vpCommon.formatString(".{0}", vpConst.VP_NOTE_EXTENSION)))
                );
                $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_FILE_PATH_CONTROL))).attr("disabled", true);
                $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_REAL_FILE_PATH))).val(saveFilePath);

                for (var idx = 0; idx < alNoteNodeList.length; idx++) {
                    objNode = alNoteNodeList[idx];

                    // node index 타입별 설정
                    if (objNode[vpConst.VP_NOTE_NODE_DATA_TYPE] == vpConst.VP_NOTE_NODE_TYPE_MARKDOWN) {
                        if (/^text node\s{0,}\d{1,}$/i.test(objNode[vpConst.VP_NOTE_NODE_DATA_CAPTION].trim())) {
                            var tmpTextIdx = objNode[vpConst.VP_NOTE_NODE_DATA_CAPTION].trim().replace(/[a-z|\s]/gi, "");
                            if (tmpTextIdx > textNodeIndex) {
                                textNodeIndex = tmpTextIdx;
                            }
                        }
                    } else {
                        if (/^node\s{0,}\d{1,}$/i.test(objNode[vpConst.VP_NOTE_NODE_DATA_CAPTION].trim())) {
                            var tmpIdx = objNode[vpConst.VP_NOTE_NODE_DATA_CAPTION].trim().replace(/[a-z|\s]/gi, "");
                            if (tmpIdx > nodeIndex) {
                                nodeIndex = tmpIdx;
                            }
                        }
                    }
                    
                    makeNoteNodeTag(objNode[vpConst.VP_NOTE_NODE_DATA_TYPE], objNode[vpConst.VP_NOTE_NODE_DATA_CAPTION], objNode[vpConst.VP_NOTE_NODE_DATA_CODE], objNode[vpConst.VP_NOTE_NODE_DATA_META], true, false);
                }
                $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_MENU_CONTAINER))).hide();
                $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_CONTAINER))).show();
            });
        });
    }
    /**
     * 노트 파일 저장
     */
    var saveNotePage = function() {
        // 노드가 없으면 저장 안함
        if ($(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
                .children(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ITEM)).length < 1) {
            return;
        }

        var saveFileName = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_FILE_PATH_CONTROL))).val();
        
        // 입력한 파일명이 없으면 기본값(placeholder)를 파일명으로 사용한다. 파일명이 존재할경우 확장자(.vp) 제거 
        if (saveFileName == "") {
            saveFileName = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_FILE_PATH_CONTROL))).attr("placeholder");
        } else if (saveFileName.lastIndexOf(vpCommon.formatString(".{0}", vpConst.VP_NOTE_EXTENSION)) > -1) {
            saveFileName = saveFileName.substring(0, saveFileName.lastIndexOf(vpCommon.formatString(".{0}", vpConst.VP_NOTE_EXTENSION)));
        }
        
        var saveFilePath = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_REAL_FILE_PATH))).val();
        // 파일명 지정이 없는 경우(새 노트) 파일명 임시 저장.
        if (saveFilePath === undefined || saveFilePath == "") {
            saveFilePath = vpCommon.formatString("./{0}.{1}", saveFileName, vpConst.VP_NOTE_EXTENSION);
        }
        
        saveNotePageAction(vpCommon.formatString("{0}.{1}", saveFileName, vpConst.VP_NOTE_EXTENSION), saveFilePath);
    }

    /**
     * 노트 파일 다른이름으로 저장(파일 브라우저 오픈)
     */
    var saveAsNotePage = async function() {
        var loadURLstyle = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH;
        var loadURLhtml = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/fileNavigation/index.html";
        
        vpCommon.loadCss( loadURLstyle + "component/fileNavigation.css");

        await $(`<div id="vp_fileNavigation"></div>`).load(loadURLhtml, () => {
            $('#vp_fileNavigation').removeClass("hide");
            $('#vp_fileNavigation').addClass("show");
            
            var {vp_init, vp_bindEventFunctions } = fileNavigation;

            nbNote.state.visualpythonFileName = $(vpCommon.wrapSelector('#vp_apiblock_board_makenode_input')).val();
                
            fileNavigation.vp_init(nbNote, "SAVE_FILE");
            fileNavigation.vp_bindEventFunctions();
        }).appendTo("#site");
    }

    /**
     * 파일 존재 여부 확인 후 노트 파일 저장
     * @param {String} saveFileName 저장 파일 명(확장자 포함)
     * @param {String} saveFilePath 저장 파일 경로(파일명, 확장자 포함)
     */
    var saveNotePageAction = function(saveFileName, saveFilePath) {
        // console.log('saveFileName', saveFileName);
        // console.log('saveFilePath', saveFilePath);
        fetch(saveFilePath).then(function(data) {
            // 파일이 존재하는 경우 덮어쓰기 확인을 진행한다.
            if (data.status == 200) {
                if (!confirm(vpCommon.formatString("{0} already exists.\nDo you want to replace it?", saveFileName))) {
                    return false;
                }
            }
            
            var sbfileSaveCmd = new sb.StringBuilder();
            sbfileSaveCmd.appendFormatLine('%%writefile "{0}"', saveFilePath);
            sbfileSaveCmd.appendLine(parseNodeTagToData());
            Jupyter.notebook.kernel.execute(sbfileSaveCmd.toString());
        });
    }

    /**
     * 노트 노드 파일저장 데이터로 변환
     * @returns parsed data from nodes
     */
    var parseNodeTagToData = function() {
        var alNoteNodeList = new Array();
        var objNode = new Object();
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
            .children(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ITEM)).each(function() {
            
            objNode = new Object();
            objNode[vpConst.VP_NOTE_NODE_DATA_TYPE] = $(this).hasClass(vpConst.VP_NOTE_MARKDOWN_NODE) ? vpConst.VP_NOTE_NODE_TYPE_MARKDOWN : vpConst.VP_NOTE_NODE_TYPE_NODE;
            // 마크다운인 경우 div.html() 을 일반 노드인 경우 input.val() 을 사용한다.
            objNode[vpConst.VP_NOTE_NODE_DATA_CAPTION] = 
                $(this).hasClass(vpConst.VP_NOTE_MARKDOWN_NODE) ? $(this).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).html() : $(this).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT)).val();
            objNode[vpConst.VP_NOTE_NODE_DATA_CODE] = $(this).find(vpCommon.formatString(".{0}", vpConst.NOTE_NODE_GENERATE_CODE)).val();
            objNode[vpConst.VP_NOTE_NODE_DATA_META] = $(this).find(vpCommon.formatString(".{0}", vpConst.NOTE_NODE_GENERATE_META)).val();

            alNoteNodeList.push(objNode);
        });
        return JSON.stringify(alNoteNodeList);
    }

    /**
     * 노트 노드 전체 실행
     */
    var runAllNodeOnNote = function() {
        var gCode;
        var trigger;
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0} .{1}", vpConst.VP_NOTE_NODE_LIST_CONTAINER, vpConst.VP_NOTE_NODE_ITEM))).each(function() {
            trigger = $(this);
            if (!$(trigger).hasClass(vpConst.VP_NOTE_EMPTY_NODE)) {
                gCode = decodeURIComponent($(trigger).find(vpCommon.formatString(".{0}", vpConst.NOTE_NODE_GENERATE_CODE)).val());

                vpFuncJS.VpFuncJS.prototype.cellExecute(gCode, true, $(trigger).hasClass(vpConst.VP_NOTE_MARKDOWN_NODE) ? "markdown" : "code");
            }
        });
    }

    /**
     * vp note 닫기
     * @param {boolean} isReset 노트 초기화 여부
     */
    var closeNotePage = function(isReset = true) {
        if (isReset) {
            clearAllNoteNode();
        }
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_CONTAINER))).hide();
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_MENU_CONTAINER))).show();
    }

    /**
     * 노트 노드 생성
     * @param {string} nodeType node type
     * @param {string} caption node caption
     * @param {string} gCode generated code
     * @param {string} gMeta generated meta
     * @param {boolean} encoded data encoded
     * @param {boolean} highlight added node hightlight
     */
    var makeNoteNodeTag = function(nodeType = vpConst.VP_NOTE_NODE_TYPE_NODE, caption = "", gCode = generatedCode, gMeta = generatedMetaData, encoded = false, highlight = true) {

        // caption 값 없으면 dafault 로 설정
        if (caption == "") {
            // nodeIndex 노드타입 구분
            if (nodeType == vpConst.VP_NOTE_NODE_TYPE_MARKDOWN) {
                if (gCode == "") {
                    caption = vpCommon.formatString("{0} {1}", vpConst.VP_NOTE_NODE_TYPE_MARKDOWN_DEFAULT_CAPTION, ++textNodeIndex);
                } else {
                    caption = gCode;
                }
            } else {
                caption = vpCommon.formatString("{0} {1}", vpConst.VP_NOTE_NODE_TYPE_NODE_DEFAULT_CAPTION, ++nodeIndex);
            }
        }
        var sbNoteNode = new sb.StringBuilder();

        sbNoteNode.appendFormatLine("<div class='{0} {1} {2} {3}'>", vpConst.VP_NOTE_NODE_ITEM, gCode == "" || gCode == undefined ? vpConst.VP_NOTE_EMPTY_NODE : ""
            , nodeType == vpConst.VP_NOTE_NODE_TYPE_MARKDOWN ? vpConst.VP_NOTE_MARKDOWN_NODE : "", highlight ? vpConst.VP_NOTE_NEW_NODE_ITEM : "");
            
        sbNoteNode.appendFormatLine("<div class='{0}'><span>{1}</span></div>", vpConst.VP_NOTE_NODE_ICON_HEADER
            , $(vpCommon.wrapSelector(vpCommon.formatString("#{0} .{1}", vpConst.VP_NOTE_NODE_LIST_CONTAINER, vpConst.VP_NOTE_NODE_ITEM))).length + 1);

        sbNoteNode.appendFormatLine("<div class='{0}'>", vpConst.VP_NOTE_NODE_BODY);

        var uuidMD = "";
        // 마크다운 노드인경우 캡션 구조 구분
        if (nodeType == vpConst.VP_NOTE_NODE_TYPE_MARKDOWN) {
            uuidMD = vpCommon.getUUID();
            // 최대 10회 중복되지 않도록 체크
            for (var idx = 0; idx < 10; idx++) {
                // 이미 사용중인 uuid 인 경우 다시 생성
                if ($(vpConst.VP_CONTAINER_ID).find(vpCommon.formatString("#{0}", uuidMD)).length > 0) {
                    uuidMD = vpCommon.getUUID();
                }
            }
            sbNoteNode.appendFormat("<div class='{0} rendered_html' id='{1}'>", vpConst.VP_NOTE_NODE_CAPTION, uuidMD, caption);
            sbNoteNode.append(caption);
            sbNoteNode.appendLine("</div>");
            sbNoteNode.appendFormat("<input type='hidden' id='{0}' class='{1}' value='", vpCommon.formatString("{0}_hidden", uuidMD), vpConst.VP_NOTE_MARKDOWN_NODE_HIDDEN);
            sbNoteNode.append(caption);
            sbNoteNode.appendLine("'/>");
        } else {
            var funcName;
            // 메타데이터 인코딩된 경우 함수명을 가져오기 위하여 디코딩한다.
            if (encoded) {
                funcName = $(xmlLibraries.getXML()).find(vpCommon.formatString("{0}[{1}={2}]", vpConst.LIBRARY_ITEM_TAG, vpConst.LIBRARY_ITEM_ID_ATTR, JSON.parse(decodeURIComponent(gMeta)).funcID)).attr(vpConst.LIBRARY_ITEM_NAME_ATTR);
            } else {
                funcName = $(xmlLibraries.getXML()).find(vpCommon.formatString("{0}[{1}={2}]", vpConst.LIBRARY_ITEM_TAG, vpConst.LIBRARY_ITEM_ID_ATTR, gMeta.funcID)).attr(vpConst.LIBRARY_ITEM_NAME_ATTR);
            }
            if (funcName == undefined) funcName = "";
            // 상세정보 표시중이면 함수명 포함하여 캡션 지정한다.
            sbNoteNode.appendFormatLine("<div class='{0}'>{1}</div>", vpConst.VP_NOTE_NODE_CAPTION
                , isShowNoteNodeDetail && funcName != "" ? vpCommon.formatString("{0}{1}{2}", caption, vpConst.VP_NOTE_NODE_FUNC_NAME_COUPLER, funcName) : caption);
            sbNoteNode.appendFormatLine("<input type='text' class='{0}' value='{1}' />", vpConst.VP_NOTE_NODE_CAPTION_INPUT, caption);
            
            sbNoteNode.appendFormatLine("<input type='hidden' class='{0}' value='{1}' />", vpConst.VP_NOTE_NODE_FUNC_NAME, funcName);
        }


        sbNoteNode.appendFormatLine("<div class='{0}'>", vpConst.VP_NOTE_NODE_ADDITIONAL_CONTROLS);

        sbNoteNode.appendFormatLine("<div class='{0}'></div>", vpConst.VP_NOTE_NODE_MOVE_UP);
        sbNoteNode.appendFormatLine("<div class='{0}'></div>", vpConst.VP_NOTE_NODE_MOVE_DOWN);
        sbNoteNode.appendFormatLine("<div class='{0}'></div>", vpConst.VP_NOTE_NODE_MODIFY);
        sbNoteNode.appendFormatLine("<div class='{0}'></div>", vpConst.VP_NOTE_NODE_CLONE);
        sbNoteNode.appendFormatLine("<div class='{0}'></div>", vpConst.VP_NOTE_NODE_REMOVE);

        sbNoteNode.appendLine("</div>");
        
        sbNoteNode.appendFormatLine(`<input type="hidden" class="{0}" value="{1}" />`
            , vpConst.NOTE_NODE_GENERATE_CODE, encoded ? gCode : encodeURIComponent(gCode));
        sbNoteNode.appendFormatLine(`<input type="hidden" class="{0}" value="{1}" />`
            , vpConst.NOTE_NODE_GENERATE_META, encoded ? gMeta : gMeta == "" ? "" : encodeURIComponent(JSON.stringify(gMeta)));
        
        sbNoteNode.appendLine("</div>");

        sbNoteNode.appendLine("</div>");

        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER))).append(sbNoteNode.toString());

        if (nodeType == vpConst.VP_NOTE_NODE_TYPE_MARKDOWN) {
            nodeMarkdownRender(uuidMD);
        }

        // 새로 추가된 노드 하이라이트.
        var target = $(vpCommon.wrapSelector(vpCommon.formatString(".{0}.{1}", vpConst.VP_NOTE_NODE_ITEM, vpConst.VP_NOTE_NEW_NODE_ITEM))).last();
        nodeHighlight(target);
    }

    /**
     * 노트 노드 오버라이트
     * @param {Array} nodeInfo node info (node type, dest node)
     * @param {string} caption node caption
     * @param {string} gCode generated code
     * @param {string} gMeta generated meta
     * @param {boolean} encoded data encoded
     */
    var overwriteNoteNode = function(nodeInfo = vpConst.VP_NOTE_NODE_TYPE_NODE, caption = "", gCode = generatedCode, gMeta = generatedMetaData, encoded = false) {
        var destNode = nodeInfo[1];
        $(destNode).find(vpCommon.formatString(".{0}", vpConst.NOTE_NODE_GENERATE_CODE)).val(encoded ? gCode : encodeURIComponent(gCode));
        $(destNode).find(vpCommon.formatString(".{0}", vpConst.NOTE_NODE_GENERATE_META)).val(encoded ? gMeta : gMeta == "" ? "" : encodeURIComponent(JSON.stringify(gMeta)));
        
        // 마크다운 노드이면 gCode가 캡션이며, hidden 도 처리해줘야 한다.
        if (nodeInfo[0] == vpConst.VP_NOTE_NODE_TYPE_MARKDOWN) {
            caption = gCode;
            $(destNode).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_MARKDOWN_NODE_HIDDEN)).val(caption);
            nodeMarkdownRender($(destNode).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_MARKDOWN_NODE_HIDDEN)).attr("id").replace("_hidden", ""));
        } else { // 캡션 지정이 있으면 캡션 변경
            if (caption == "") {
                caption = $(destNode).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT)).val();
            }
            var funcName;
            // 메타데이터 인코딩된 경우 함수명을 가져오기 위하여 디코딩한다.
            if (encoded) {
                funcName = $(xmlLibraries.getXML()).find(vpCommon.formatString("{0}[{1}={2}]", vpConst.LIBRARY_ITEM_TAG, vpConst.LIBRARY_ITEM_ID_ATTR, JSON.parse(decodeURIComponent(gMeta)).funcID)).attr(vpConst.LIBRARY_ITEM_NAME_ATTR);
            } else {
                funcName = $(xmlLibraries.getXML()).find(vpCommon.formatString("{0}[{1}={2}]", vpConst.LIBRARY_ITEM_TAG, vpConst.LIBRARY_ITEM_ID_ATTR, gMeta.funcID)).attr(vpConst.LIBRARY_ITEM_NAME_ATTR);
            }
            if (funcName == undefined) funcName = "";

            $(destNode).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).html(
                isShowNoteNodeDetail && funcName != "" ? vpCommon.formatString("{0}{1}{2}", caption, vpConst.VP_NOTE_NODE_FUNC_NAME_COUPLER, funcName) : caption
            );
            $(destNode).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT)).val(caption);
            $(destNode).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_FUNC_NAME)).val(funcName);
        }

        $(destNode).removeClass(vpConst.VP_NOTE_EMPTY_NODE);
    }

    /**
     * 마크다운 렌더링
     * @param {String} uuid 미크다운 노드 캡션 id
     */
    var nodeMarkdownRender = function(uuid) {
        if (uuid == undefined || uuid == "") {
            return false;
        }

        var text = $(vpCommon.formatString("#{0}_hidden", uuid)).val();
        
        var math = null;
        var text_and_math = mathjaxutils.remove_math(text);
        text = text_and_math[0];
        math = text_and_math[1];

        var renderer = new marked.Renderer();

        marked(text, { renderer: renderer }, function (err, html) {
            html = mathjaxutils.replace_math(html, math);
            document.getElementById(uuid).innerHTML = html;

            MathJax.Hub.Queue(["Typeset", MathJax.Hub, uuid]);
        });
    }

    /**
     * 노트 노드 순번 재부여
     */
    var nodeReIndexing = function() {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0} .{1}", vpConst.VP_NOTE_NODE_LIST_CONTAINER, vpConst.VP_NOTE_NODE_ITEM))).length + 1;
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0} .{1}", vpConst.VP_NOTE_NODE_LIST_CONTAINER, vpConst.VP_NOTE_NODE_ITEM))).each(function() {
            $(this).find(vpCommon.formatString(".{0} span", vpConst.VP_NOTE_NODE_ICON_HEADER)).html($(this).index() + 1);
        });
    }

    /**
     * 노트 노드 순서 변경
     * @param {object} trigger 이벤트 트리거 객체
     * @param {string} direction 변경 방향
     */
    var nodeOrderChange = function(trigger, direction) {
        var nodeCnt = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER))).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ITEM)).length;
        var curIndex = $(trigger).index();
        switch (direction) {
            case "up":
                // 첫번째 노드인 경우 동작 없음.
                if (curIndex > 0) {
                    $(trigger).insertBefore($(trigger).prev(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ITEM)));
                }
                break;

            case "down":
                // 마지막 노드인 경우 동작 없음
                if (curIndex + 1 < nodeCnt) {
                    $(trigger).insertAfter($(trigger).next(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ITEM)));
                }
                break;

            default:
                console.warn("Wrong direction type.")
                break;
        }
        nodeReIndexing();
    }

    /**
     * 노트 노드 복제
     * @param {object} trigger 이벤트 트리거 객체
     */
    var cloneNoteNode = function(trigger) {
        var clone = $(trigger).clone();
        
        $(clone).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT)).val(
            vpCommon.formatString("{0}{1}", $(clone).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT)).val(), vpConst.VP_NOTE_NODE_CLONE_POSTFIX)
        )
        $(clone).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION))
            .removeClass(vpConst.COLOR_FONT_ORANGE).html(
                isShowNoteNodeDetail && $(clone).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_FUNC_NAME)).val() != ""
                ? vpCommon.formatString("{0}{1}{2}", $(clone).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT)).val()
                    , vpConst.VP_NOTE_NODE_FUNC_NAME_COUPLER, $(clone).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_FUNC_NAME)).val())
                : $(clone).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT)).val()
            );

        $(clone).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_BODY)).removeClass(vpConst.COLOR_BORDER_ORANGE);
        $(clone).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ADDITIONAL_CONTROLS)).hide();
        $(trigger).after(clone);
        
        nodeReIndexing();
    }

    /**
     * 노트 노드 제거
     * @param {object} trigger 이벤트 트리거 객체
     */
    var removeNoteNode = function(trigger) {
        vpFuncJS.VpFuncJS.prototype.openMultiBtnModal(vpConst.VP_NOTE_NODE_REMOVE_CONFIRM_MESSAGE, ["Yes", "Cancel"]
            , function(clickIndex) {
                if (clickIndex == 0) {
                    $(trigger).remove();
                    nodeReIndexing();
                }
            });
    }

    /**
     * 노트 노드 하이라이트
     * @param {object} trigger 이벤트 트리거 객체
     */
    var nodeHighlight = function(trigger) {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
            .find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).removeClass(vpConst.COLOR_FONT_ORANGE);
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
            .find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_BODY)).removeClass(vpConst.COLOR_BORDER_ORANGE);
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
            .find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ADDITIONAL_CONTROLS)).hide();

        $(trigger).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).addClass(vpConst.COLOR_FONT_ORANGE);
        $(trigger).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_BODY)).addClass(vpConst.COLOR_BORDER_ORANGE);
        $(trigger).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ADDITIONAL_CONTROLS)).show();
        if ($(trigger)[0] != undefined) {
            $(trigger)[0].scrollIntoView();
        }
    }

    /**
     * 노트 노드 캡션 수정모드
     * @param {object} trigger 이벤트 트리거 객체
     */
    var onModifyNodeCaption = function(trigger) {
        // $(trigger).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT))
        //     .val($(trigger).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).html());
        $(trigger).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).removeClass(vpConst.COLOR_FONT_ORANGE).hide();
        $(trigger).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ADDITIONAL_CONTROLS)).hide();
        $(trigger).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT)).show().focus();
    }

    /**
     * 노트 노드 캡션 수정종료
     */
    var offModifyNodeCaption = function() {
        var caption;
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
            .find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT)).each(function() {
                if ($(this).is(":visible")) {
                    $(this).parent().removeClass(vpConst.COLOR_BORDER_ORANGE);
                    $(this).hide();
                    if ($(this).val().trim() != "") {
                        if (isShowNoteNodeDetail && $(this).parent().children(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_FUNC_NAME)).val() != "") {
                            caption = vpCommon.formatString("{0}{1}{2}"
                                , $(this).val(), vpConst.VP_NOTE_NODE_FUNC_NAME_COUPLER
                                , $(this).parent().children(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_FUNC_NAME)).val());
                        } else {
                            caption = $(this).val();
                        }
                        $(this).parent().children(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).html(caption).show();
                    }
                }
        });
    }

    /**
     * 새 node, text 타입
     */
    var newNodeTextMode = function() {
        var apiListTabHeader = $(vpCommon.wrapSelector(
            vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER), vpCommon.formatString(".{0}:eq(0)", vpConst.TAB_CONTAINER)
            , vpCommon.formatString(".{0}:eq(0) li:eq(0)", vpConst.TAB_HEAD_CONTROL)
        ));
        vpTabPageChange(apiListTabHeader);
        loadOption("com_markdown", optionPageLoadCallback);
        addEmptyNode(vpConst.VP_NOTE_NODE_TYPE_MARKDOWN);
    }

    /**
     * 새 node, node 타입
     */
    var newNodeNodeMode = function() {
        // API LIST 홈 화면
        closeOptionBook();
        closeSubLibraryGroup();
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_LIST_LIBRARY_LIST_CONTAINER), 
            vpCommon.formatString(".{0}.{1}", vpConst.ACCORDION_CONTAINER, vpConst.ACCORDION_OPEN_CLASS))).each(function() {
                toggleAccordionBoxShow($(this).children(vpCommon.formatString(".{0}", vpConst.ACCORDION_HEADER)));
        });
        
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_LIST_LIBRARY_LIST_CONTAINER)))
                .find(vpCommon.formatString(".{0}", vpConst.COLOR_FONT_ORANGE)).removeClass(vpConst.COLOR_FONT_ORANGE);

        var apiListTabHeader = $(vpCommon.wrapSelector(
            vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER), vpCommon.formatString(".{0}:eq(0)", vpConst.TAB_CONTAINER)
            , vpCommon.formatString(".{0}:eq(0) li:eq(0)", vpConst.TAB_HEAD_CONTROL)
        ));
        vpTabPageChange(apiListTabHeader);
        addEmptyNode(vpConst.VP_NOTE_NODE_TYPE_NODE);
    }

    /**
     * 노드 옵션 로드
     * @param {HTMLtag} node 
     */
    var loadNoteNodeOption = function(node) {
        // api list tab
        var destTabHeader = $(vpCommon.wrapSelector(
            vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER), vpCommon.formatString(".{0}:eq(0)", vpConst.TAB_CONTAINER)
            , vpCommon.formatString(".{0}:eq(0) li:eq(0)", vpConst.TAB_HEAD_CONTROL)
        ));
        if ($(node).hasClass(vpConst.VP_NOTE_EMPTY_NODE)) {
            if ($(node).hasClass(vpConst.VP_NOTE_MARKDOWN_NODE)) {
                loadOption("com_markdown", optionPageLoadCallback);
            } else {
                // API LIST 홈 화면
                closeOptionBook();
                closeSubLibraryGroup();
                $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_LIST_LIBRARY_LIST_CONTAINER), 
                    vpCommon.formatString(".{0}.{1}", vpConst.ACCORDION_CONTAINER, vpConst.ACCORDION_OPEN_CLASS))).each(function() {
                        toggleAccordionBoxShow($(this).children(vpCommon.formatString(".{0}", vpConst.ACCORDION_HEADER)));
                });
                
                $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_LIST_LIBRARY_LIST_CONTAINER)))
                        .find(vpCommon.formatString(".{0}", vpConst.COLOR_FONT_ORANGE)).removeClass(vpConst.COLOR_FONT_ORANGE);

                vpTabPageChange(destTabHeader);
            }
        } else {
            var value = decodeURIComponent($(node).find(vpCommon.formatString(".{0}", vpConst.NOTE_NODE_GENERATE_META)).val());
            generatedMetaData = JSON.parse(value);

            // api block 노드인 경우는 노드 페이지를 연다.
            if (generatedMetaData.funcID == "api_block") {
                // 블락 화면 메타 로드 call
                apiBlockJS.loadMeta(apiBlockJS, generatedMetaData);

                // api block tab
                destTabHeader = $(vpCommon.wrapSelector(
                    vpCommon.formatString("#{0}", vpConst.API_MODE_CONTAINER), vpCommon.formatString(".{0}:eq(0)", vpConst.TAB_CONTAINER)
                    , vpCommon.formatString(".{0}:eq(0) li:eq(1)", vpConst.TAB_HEAD_CONTROL)
                ));

            } else { // api list 화면을 연다
                loadOption(generatedMetaData.funcID, optionPageLoadCallback, generatedMetaData);
            }
            
            vpTabPageChange(destTabHeader);
        }
    }

    /**
     * 텍스트 박스 라인 넘버 설정
     * @param {object} trigger 이벤트 트리거 객체
     */
    var setTextareaLineNumber = function(trigger) {
        var value = $(trigger).val();
        var rowCnt = value.split('\n').length;
        var sbLineText = new sb.StringBuilder();

        for (var idx = 1; idx <= rowCnt; idx++) {
            sbLineText.appendLine(idx);
        }

        $(trigger).parent().children(vpCommon.formatString(".{0}", vpConst.MANUAL_CODE_INPUT_AREA_LINE)).val(sbLineText.toString());
    }
    
    /**
     * 텍스트 박스 높이 싱크
     * @param {object} trigger 이벤트 트리거 객체
     */
    var setTextareaSizeSync = function(trigger) { 
        // $(trigger).parent().children(vpCommon.formatString(".{0}", vpConst.MANUAL_CODE_INPUT_AREA_LINE)).height($(trigger).height());
        // var parentWidth = 0;
        // $(trigger).parent().children('textarea').each(function() {
        //     parentWidth += $(this).outerWidth();
        // });
        // $(trigger).parent().width(parentWidth);
    }

    /**
     * 헤더 추가 메뉴 표시 토글
     */
    var toggleHeaderExtraMenu = function() {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.HEADER_EXTRA_MENU_CONTAINER))).toggle();
    }

    /**
     * 메뉴 팝업창 열기
     * @param {string} loadType
     * @param {string} title 
     */
    var openMenuPopup = function(loadType, title) {
        $(vpCommon.formatString("#{0} .{1}", vpConst.MENU_POPUP, vpConst.MENU_POPUP_TITLE)).text(title);
        loadMenuPopupPage(loadType);
        $(vpCommon.formatString("#{0}", vpConst.MENU_POPUP)).show();

        // bind handle esc key to exit
        $(document).bind('keydown', handlePopupExitWithESC);
    }

    /**
     * 메뉴 팝업창 Load
     * @param {*} loadType preferences / package
     */
    var loadMenuPopupPage = function(loadType) {
        // TODO:
        if (loadType == 'preferences') {
            // system preferences
            loadOption("com_setting", popupPageLoadCallback);
        } else if (loadType == 'package') {
            // package management
            // loadLibraries($(vpCommon.formatString(".{0}", vpConst.MENU_POPUP_BODY)));
            loadOption("com_pip", popupPageLoadCallback);
        }
    }

    /**
     * 메뉴 팝업창 닫기
     */
    var closeMenuPopup = function() {
        $(vpCommon.formatString("#{0}", vpConst.MENU_POPUP)).hide();
        // unbind handle esc key to exit
        $(document).unbind('keydown', handlePopupExitWithESC);
    }

    /**
     * 헤더 메뉴 표시 닫기
     */
    var closeHeaderExtraMenu = function() {
        $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.HEADER_EXTRA_MENU_CONTAINER))).hide();
    }
    /** 이벤트 핸들러 영역 끝 */
    
    /** 이벤트 바인딩 영역 시작 */
    
    /**
     * 컨테이너 사이즈 변경시 division resize
     */
    events.on('resize-container.vp-wrapper', function() {
        calculatePaletteWidth(true);
    });

    /**
     * Menu Popup 닫기버튼 클릭
     */
    $(document).on("click", vpCommon.formatString(".{0}", vpConst.MENU_POPUP_CLOSE), function() {
        closeMenuPopup();
    });

    /**
     * Popup ESC키로 닫기
     * @param {event} event 
     */
    var handlePopupExitWithESC = function(event) {
        var keyCode = event.keyCode ? event.keyCode : event.which;
        // press esc
        if (keyCode == 27) {
            closeMenuPopup();
        }
    }

    /**
     * Header extra menu 로그인 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.HEADER_EXTRA_MENU_LOGIN)), function() {
        //TODO: login 기능
        closeHeaderExtraMenu();
    });

    /**
     * Header extra menu 시스템 설정 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.HEADER_EXTRA_MENU_PREFERENCES)), function() {
        //TODO: system preference 창
        closeHeaderExtraMenu();
        openMenuPopup("preferences", "System Preferences");
    });

    /**
     * Header extra menu 패키지 관리 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.HEADER_EXTRA_MENU_PACKAGES)), function() {
        //TODO: package management 창
        closeHeaderExtraMenu();
        openMenuPopup("package", "Package Management");
    });

    /**
     * Header extra menu FAQ 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.HEADER_EXTRA_MENU_VPNOTE)), function() {
        // faq 페이지 열기
        window.open(vpConst.VPNOTE_PAGE_LINK);
        closeHeaderExtraMenu();
    });

    /**
     * Header extra menu About 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.HEADER_EXTRA_MENU_ABOUT)), function() {
        // about 페이지 열기
        window.open(vpConst.ABOUT_PAGE_LINK);
        closeHeaderExtraMenu();
    });

    /**
     * 공통 컴퍼넌트 탭 헤더 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString(".{0}", vpConst.TAB_CONTAINER), vpCommon.formatString(".{0}", vpConst.TAB_HEAD_CONTROL), "li"), function(evt) {
        if ($(this).hasClass(vpConst.VP_EXCEPT_BIND)) {
            evt.preventDefault();
            evt.stopPropagation();
            return;
        }
        vpTabPageChange($(this));
    });


    /**
     * api 모드 셀렉터 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.API_PALETTE_MODE_BTN)), function() {
        toggleAPIMode($(this));
    });

    /**
     * 노트 모드 셀렉터 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.NOTE_PALETTE_MODE_BTN)), function() {
        toggleNoteMode($(this));
    });

    /**
     * 공통 컴퍼넌트 아코디언 박스 헤더 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString(".{0}", vpConst.ACCORDION_CONTAINER), vpCommon.formatString(".{0}", vpConst.ACCORDION_HEADER)), function() {
        toggleAccordionBoxShow($(this));
    });

    /**
     * api list item 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#vp_apiListLibContainer .{0} li", vpConst.LIST_ITEM_LIBRARY)), function(evt) {
        // console.log('api list item 클릭');
        evt.stopPropagation();
        if ($(this).hasClass(vpConst.LIST_ITEM_LIBRARY_GROUP)) {
            toggleApiListSubGroupShow($(this));
        } else if ($(this).hasClass(vpConst.LIST_ITEM_LIBRARY_FUNCTION)) {
            loadOption($(this).data(vpConst.LIBRARY_ITEM_DATA_ID.replace(vpConst.TAG_DATA_PREFIX, "")), optionPageLoadCallback);
        }
    });

    /**
     * api option navi info item 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString(".{0}:not(:last-child)", vpConst.OPTION_NAVIGATOR_INFO_NODE)), function() {
        goListOnNavInfo($(this));
    });

    /**
     * api option add 버튼 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_BTN_ADD_CELL)), function() {
        addLibraryToJupyterCell(loadedFuncJS ,true, false);
    });

    /**
     * api option run 버튼 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_BTN_RUN_CELL)), function() {
        addLibraryToJupyterCell(loadedFuncJS, true, true);
    });

    /**
     * api block add 버튼 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.BLOCK_BTN_ADD_CELL)), function() {
        addLibraryToJupyterCell(apiBlockJS, true, false);
    });

    /**
     * api block run 버튼 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.BLOCK_BTN_RUN_CELL)), function() {
        addLibraryToJupyterCell(apiBlockJS, true, true);
    });

    /**
     * 옵션 설정 화면 닫기버튼 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.CLOSE_OPTION_BUTTON)), function() {
        closeOptionBook();
    });

    /**
     * 노트에 저장 버튼 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_BTN_SAVE_ON_NOTE)), function() {
        var isMarkdownNode = loadedFuncJS.funcName.toLowerCase() == vpConst.VP_NOTE_NODE_TYPE_MARKDOWN.toLowerCase();
        
        // 노드 컨테이너가 빈경우 빈노드 채워넣는다.
        if ($(vpCommon.wrapSelector(vpCommon.formatString("#{0} .{1}", vpConst.VP_NOTE_NODE_LIST_CONTAINER, vpConst.VP_NOTE_NODE_ITEM))).length == 0) {
            if (isMarkdownNode) {
                // 마크다운 노드 추가시에는 빈 일반노드를 뒤에 넣는다.
                // 새 노드로 추가
                addLibraryToJupyterCell(loadedFuncJS, false, false, makeNoteNodeTag
                    , isMarkdownNode ? vpConst.VP_NOTE_NODE_TYPE_MARKDOWN : vpConst.VP_NOTE_NODE_TYPE_NODE);

                // 빈 일반 노드 추가
                addEmptyNode(vpConst.VP_NOTE_NODE_TYPE_NODE);
            } else {
                // 일반 노드 추가시에는 빈 마크다운 노드를 앞에 넣는다.
                addEmptyNode(vpConst.VP_NOTE_NODE_TYPE_MARKDOWN);

                // 새 노드로 추가
                addLibraryToJupyterCell(loadedFuncJS, false, false, makeNoteNodeTag
                    , isMarkdownNode ? vpConst.VP_NOTE_NODE_TYPE_MARKDOWN : vpConst.VP_NOTE_NODE_TYPE_NODE);
            }
        } else { // 선택된 노드가 있는경우 오버라이드 할지 여부 체크
            var hasFocusedNode = $(vpCommon.wrapSelector(vpCommon.formatString("#{0} .{1} .{2}.{3}"
                , vpConst.VP_NOTE_NODE_LIST_CONTAINER, vpConst.VP_NOTE_NODE_ITEM, vpConst.VP_NOTE_NODE_BODY, vpConst.COLOR_BORDER_ORANGE))).length > 0;
            
            if (!hasFocusedNode) {
                // 포커스 노드 없으면 새 노드로 추가
                addLibraryToJupyterCell(loadedFuncJS, false, false, makeNoteNodeTag
                    , isMarkdownNode ? vpConst.VP_NOTE_NODE_TYPE_MARKDOWN : vpConst.VP_NOTE_NODE_TYPE_NODE);
            } else { // 포커스 노드와 추가될 노드 비교하여 액션 구분
                var nodeItem = $(vpCommon.wrapSelector(vpCommon.formatString("#{0} .{1} .{2}.{3}"
                    , vpConst.VP_NOTE_NODE_LIST_CONTAINER, vpConst.VP_NOTE_NODE_ITEM, vpConst.VP_NOTE_NODE_BODY, vpConst.COLOR_BORDER_ORANGE)))
                    .parents(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ITEM));
                
                if (isMarkdownNode && $(nodeItem).hasClass(vpConst.VP_NOTE_MARKDOWN_NODE)) {
                    // 마크다운 노드를 선택하고 마크다운 노드를 추가하는 경우
                    
                    if ($(nodeItem).hasClass(vpConst.VP_NOTE_EMPTY_NODE)) {
                        // 선택된 마크다운 노드가 빈 노드인경우 덮어쓴다.
                        addLibraryToJupyterCell(loadedFuncJS, false, false, overwriteNoteNode, [vpConst.VP_NOTE_NODE_TYPE_MARKDOWN, nodeItem]);
                    } else {
                        // 선택된 마크다운 노드가 빈 노드가 아닌경우 컨펌 메시지
                        vpFuncJS.VpFuncJS.prototype.openMultiBtnModal(vpConst.VP_NOTE_NODE_REWRITE_CONFIRM_MESSAGE, ["Rewrite", "Add New Node", "Cancel"]
                            , function(clickIndex) {
                                switch (clickIndex) {
                                    case 0:
                                        // 마크다운 노드 오버라이트
                                        addLibraryToJupyterCell(loadedFuncJS, false, false, overwriteNoteNode, [vpConst.VP_NOTE_NODE_TYPE_MARKDOWN, nodeItem]);
                                        break;
                                        
                                    case 1:
                                        // 새 노드로 추가
                                        addLibraryToJupyterCell(loadedFuncJS, false, false, makeNoteNodeTag, vpConst.VP_NOTE_NODE_TYPE_MARKDOWN);
                                        break;
                                            
                                    case 2:
                                        return false;

                                    default:
                                        console.error(vpCommon.formatString("Wrong return value from modal : [{0}]", clickIndex));
                                        break;
                                }
                            });
                    }
                } else if (!isMarkdownNode && !$(nodeItem).hasClass(vpConst.VP_NOTE_MARKDOWN_NODE)) {
                    // 마크다운 노드가 아닌 노드를(일반노드) 선택하고 마크다운 노드가 아닌 노드(일반노드) 추가하는 경우

                    if ($(nodeItem).hasClass(vpConst.VP_NOTE_EMPTY_NODE)) {
                        // 선택된 일반 노드가 빈 노드인경우 덮어쓴다.
                        
                        addLibraryToJupyterCell(loadedFuncJS, false, false, overwriteNoteNode, [vpConst.VP_NOTE_NODE_TYPE_NODE, nodeItem]);
                    } else {
                        // 선택된 노드가 빈 노드가 아닌경우 컨펌 메시지
                        vpFuncJS.VpFuncJS.prototype.openMultiBtnModal(vpConst.VP_NOTE_NODE_REWRITE_CONFIRM_MESSAGE, ["Rewrite", "Add New Node", "Cancel"]
                            , function(clickIndex) {
                                switch (clickIndex) {
                                    case 0:
                                        // 일반 노드 오버라이트
                                        addLibraryToJupyterCell(loadedFuncJS, false, false, overwriteNoteNode, [vpConst.VP_NOTE_NODE_TYPE_NODE, nodeItem]);
                                        break;
                                        
                                    case 1:
                                        // 새 노드로 추가
                                        addLibraryToJupyterCell(loadedFuncJS, false, false, makeNoteNodeTag, vpConst.VP_NOTE_NODE_TYPE_NODE);
                                        break;
                                            
                                    case 2:
                                        return false;

                                    default:
                                        console.error(vpCommon.formatString("Wrong return value from modal : [{0}]", clickIndex));
                                        break;
                                }
                            });
                    }
                } else {
                    // 노드 타입이 다르면 새 노드로 추가
                    addLibraryToJupyterCell(loadedFuncJS, false, false, makeNoteNodeTag
                        , isMarkdownNode ? vpConst.VP_NOTE_NODE_TYPE_MARKDOWN : vpConst.VP_NOTE_NODE_TYPE_NODE);
                }
            }
        }
        
        openNoteArea();
        newNotePage(false);
    });

    /**
     * 블럭 노트에 저장 버튼 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.BLOCK_BTN_SAVE_ON_NOTE)), function() {
        
        // 노드 컨테이너가 빈경우 빈노드 채워넣는다.
        if ($(vpCommon.wrapSelector(vpCommon.formatString("#{0} .{1}", vpConst.VP_NOTE_NODE_LIST_CONTAINER, vpConst.VP_NOTE_NODE_ITEM))).length == 0) {
            // 빈 마크다운 노드를 앞에 넣는다.
            addEmptyNode(vpConst.VP_NOTE_NODE_TYPE_MARKDOWN);

            // 새 노드로 추가
            addLibraryToJupyterCell(apiBlockJS, false, false, makeNoteNodeTag, vpConst.VP_NOTE_NODE_TYPE_NODE);
        } else { // 선택된 노드가 있는경우 오버라이드 할지 여부 체크

            var hasFocusedNode = $(vpCommon.wrapSelector(vpCommon.formatString("#{0} .{1} .{2}.{3}"
                , vpConst.VP_NOTE_NODE_LIST_CONTAINER, vpConst.VP_NOTE_NODE_ITEM, vpConst.VP_NOTE_NODE_BODY, vpConst.COLOR_BORDER_ORANGE))).length > 0;

            if (!hasFocusedNode) {
                // 포커스 노드 없으면 새 노드로 추가
                addLibraryToJupyterCell(apiBlockJS, false, false, makeNoteNodeTag, vpConst.VP_NOTE_NODE_TYPE_NODE);
            } else { // 포커스 노드와 추가될 노드 비교하여 액션 구분
                var nodeItem = $(vpCommon.wrapSelector(vpCommon.formatString("#{0} .{1} .{2}.{3}"
                    , vpConst.VP_NOTE_NODE_LIST_CONTAINER, vpConst.VP_NOTE_NODE_ITEM, vpConst.VP_NOTE_NODE_BODY, vpConst.COLOR_BORDER_ORANGE)))
                    .parents(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ITEM));
                
                // 포커스 노드가 마크다운 노드인 경우
                
                if ($(nodeItem).hasClass(vpConst.VP_NOTE_MARKDOWN_NODE)) {
                    // 노드 타입이 다르므로 새 노드로 추가한다.
                    addLibraryToJupyterCell(apiBlockJS, false, false, makeNoteNodeTag, vpConst.VP_NOTE_NODE_TYPE_NODE);
                } else { // 마크다운 노드가 아닌경우(현재 노드타입은 마크다운과 일반 노드 2종이며 일반노드는 추가 구분자가 없다.)
                    // 선택된 일반 노드가 빈 노드인경우 덮어쓴다.                        
                    if ($(nodeItem).hasClass(vpConst.VP_NOTE_EMPTY_NODE)) {
                        addLibraryToJupyterCell(apiBlockJS, false, false, overwriteNoteNode, [vpConst.VP_NOTE_NODE_TYPE_NODE, nodeItem]);
                    } else {
                        // 선택된 노드가 빈 노드가 아닌경우 컨펌 메시지
                        vpFuncJS.VpFuncJS.prototype.openMultiBtnModal(vpConst.VP_NOTE_NODE_REWRITE_CONFIRM_MESSAGE, ["Rewrite", "Add New Node", "Cancel"]
                            , function(clickIndex) {
                                switch (clickIndex) {
                                    case 0:
                                        // 일반 노드 오버라이트
                                        addLibraryToJupyterCell(apiBlockJS, false, false, overwriteNoteNode, [vpConst.VP_NOTE_NODE_TYPE_NODE, nodeItem]);
                                        break;
                                        
                                    case 1:
                                        // 새 노드로 추가
                                        addLibraryToJupyterCell(apiBlockJS, false, false, makeNoteNodeTag, vpConst.VP_NOTE_NODE_TYPE_NODE);
                                        break;
                                            
                                    case 2:
                                        return false;

                                    default:
                                        console.error(vpCommon.formatString("Wrong return value from modal : [{0}]", clickIndex));
                                        break;
                                }
                            });
                    }
                }
            }
        }
        openNoteArea();
        newNotePage(false);
    });

    /**
     * 노트모드 추가 옵션 버튼 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_BTN)), function() {
        toggleNoteExtraMenu();
    });

    /**
     * 새 노트 버튼 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_MENU_NEW_NOTE)), function() {
        newNotePage();
        // 파일명 입력창이 활성화 되어있는경우 포커스
        if ($(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_FILE_PATH_CONTROL))).is(':enabled')) {
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_FILE_PATH_CONTROL))).focus();
        }
    });

    /**
     * 노트 오픈 버튼 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_MENU_OPEN_NOTE)), function() {
        openNotePage();
    });

    /**
     * 노트 노드 클릭 이벤트 (이벤트 트리거 객체에 따라 분기)
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ITEM)), function(evt) {
        if ($(evt.target).hasClass(vpConst.VP_NOTE_NODE_ICON_HEADER)) {
            // 노드 헤더 아이콘인 경우 바로 셀로 실행한다.
            runLibraryOnNote($(this));
        } else if ($(evt.target).hasClass(vpConst.VP_NOTE_NODE_MOVE_UP)) {
            // 노드 순서를 위로 올린다.
            nodeOrderChange($(this), "up");
        } else if ($(evt.target).hasClass(vpConst.VP_NOTE_NODE_MOVE_DOWN)) {
            // 노드 순서를 아래로 내린다.
            nodeOrderChange($(this), "down");
        } else if ($(evt.target).hasClass(vpConst.VP_NOTE_NODE_MODIFY)) {
            // 노드를 로드한다.
            loadNoteNodeOption($(this));
        } else if ($(evt.target).hasClass(vpConst.VP_NOTE_NODE_CLONE)) {
            // 복제 버튼인 경우 노드를 복제한다.
            cloneNoteNode($(this));
        } else if ($(evt.target).hasClass(vpConst.VP_NOTE_NODE_REMOVE)) {
            // 닫기 버튼인 경우 노드를 제거한다.
            removeNoteNode($(this));
        } else {
            // 그외 영역은 노드 선택으로 판단.
            if ($(this).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).hasClass(vpConst.COLOR_FONT_ORANGE)) {
                // 선택된 노드 재 선택시 마크다운 노드가 아니면 노드 캡션 수정으로 처리
                if (!$(this).hasClass(vpConst.VP_NOTE_MARKDOWN_NODE)) {
                    onModifyNodeCaption($(this));
                }
                evt.stopPropagation();
            } else {
                // 새로 선택된 경우 하이라이트 처리
                if ($(this).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).is(":visible")) {
                    nodeHighlight($(this));
                } else {
                    $(this).find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION_INPUT)).focus();
                    evt.stopPropagation();
                }
            }
        }
    });

    /**
     * 텍스트 타입 새 노드
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NEW_NOTE_TYPE_TEXT)), function() {
        newNodeTextMode();
    });

    /**
     * 노드 타입 새 노드
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NEW_NOTE_TYPE_NODE)), function() {
        newNodeNodeMode();
    });
    
    /**
     * note mode extra 메뉴 새 노트 클릭
     */
    // $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_NEW_NOTE)), function() {
    //     newNotePage();
    //     closeNoteExtraMenu();
    //     // 파일명 입력창이 활성화 되어있는경우 포커스
    //     if ($(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_FILE_PATH_CONTROL))).is(':enabled')) {
    //         $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_FILE_PATH_CONTROL))).focus();
    //     }
    // });

    /**
     * note mode extra 메뉴 닫기 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_CLOSE_NOTE)), function() {
        closeNotePage();
        closeNoteExtraMenu();
    });

    /**
     * note mode extra 메뉴 un do 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_UNDO_NOTE)), function() {
        console.log("Undo Note action");
    });

    /**
     * note mode extra 메뉴 re do 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_REDO_NOTE)), function() {
        console.log("Redo Note action");
    });

    /**
     * note mode extra 메뉴 run all 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_RUN_ALL_NOTE)), function() {
        closeNoteExtraMenu();
        runAllNodeOnNote();
    });

    /**
     * note mode extra 메뉴 show detail 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_SHOW_DETAIL_NOTE)), function() {
        toggleNoteDetailInfo(true);
        closeNoteExtraMenu();
    });

    /**
     * note mode extra 메뉴 hide detail 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_EXTRA_MENU_HIDE_DETAIL_NOTE)), function() {
        toggleNoteDetailInfo(false);
        closeNoteExtraMenu();
    });

    /**
     * 문서 전체에 클릭 이벤트. (vp note extra menu off 검증 위해 사용)
     */
    $(document).on("click", function(evt) {
        // 엑스트라 메뉴 버튼이 아닌경우 닫기
        if (evt.target.id != vpConst.VP_NOTE_EXTRA_MENU_BTN) {
            closeNoteExtraMenu();
        }
        if (evt.target.id != vpConst.HEADER_EXTRA_MENU_BTN) {
            closeHeaderExtraMenu();
        }
        // 노트 노드 캡션 수정 종료
        offModifyNodeCaption();
    });

    /**
     * 노트 영역 클릭 이벤트(포커스 노드 제거)
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_CONTAINER)), function(evt) {
        // 이벤트가 노드아이템 자식이 아닌경우 노드 포커스 제거
        if ($(evt.target).parents(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ITEM)).length < 1) {

            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
                .find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_CAPTION)).removeClass(vpConst.COLOR_FONT_ORANGE);
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
                .find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_BODY)).removeClass(vpConst.COLOR_BORDER_ORANGE);
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_NODE_LIST_CONTAINER)))
                .find(vpCommon.formatString(".{0}", vpConst.VP_NOTE_NODE_ADDITIONAL_CONTROLS)).hide();
        }
    });

    /**
     * 공통 컴퍼넌트 라인넘버 textarea 입력
     */
    $(document).on("input change", vpCommon.wrapSelector(vpCommon.formatString(".{0}", vpConst.MANUAL_CODE_INPUT_AREA)), function() {
        setTextareaLineNumber($(this));
    });

    /**
     * 공통 컴퍼넌트 라인넘버 textarea 마우스 이동
     */
    $(document).on("mousemove", vpCommon.wrapSelector(vpCommon.formatString(".{0}", vpConst.MANUAL_CODE_INPUT_AREA)), function(evt) {
        setTextareaSizeSync($(this));
    });

    /**
     * 공통 컴퍼넌트 라인넘버 textarea 마우스 up
     */
    $(document).on("mouseup", vpCommon.wrapSelector(vpCommon.formatString(".{0}", vpConst.MANUAL_CODE_INPUT_AREA)), function() {
        setTextareaSizeSync($(this));
    });

    /**
     * 헤더 추가 옵션 버튼 클릭
     */
    $(document).on("click", vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.HEADER_EXTRA_MENU_BTN)), function() {
        toggleHeaderExtraMenu();
    });

    /** 이벤트 바인딩 영역 끝 */

    /** 임시 이벤트(구버전) TODO: 향후 삭제 예정 */
    
    /**
     * 수직 최소화 버튼 클릭시 영역 표시 변환
     */
    $(document).on("click", vpCommon.wrapSelector(".vp-panel-area-vertical-btn"), function(evt) {
        evt.stopPropagation();
        toggleVerticalMinimizeArea($(this));
    });
    $(document).on("click", vpCommon.wrapSelector(".vp-minimize", ".vp-accordion-header"), function(evt) {
        evt.stopPropagation();
        toggleVerticalMinimizeArea2($(this));
    });
    $(document).on("click", vpCommon.wrapSelector(".vp-spread", ".vp-accordion-header"), function(evt) {
        evt.stopPropagation();
        toggleVerticalMinimizeArea2($(this));
    });

    /**
     * 영역 수직 최소화, 복원
     * @param {HTMLtag} btnObj 
     */
    var toggleVerticalMinimizeArea = function(btnObj) {
        $(btnObj).parent().parent().toggleClass("vp-spread").toggleClass("vp-minimize");
        $(btnObj).toggleClass("vp-arrow-right").toggleClass("vp-arrow-down");
    }
    var toggleVerticalMinimizeArea2 = function(obj) {
        $(obj).parent().toggleClass("vp-spread").toggleClass("vp-minimize");
        $(obj).parent().find(".vp-panel-area-vertical-btn").toggleClass("vp-arrow-right").toggleClass("vp-arrow-down");
    }

    /** 임시 이벤트 끝 */

















    /** ------------------------ 2021 01 17 이진용 새버전 추가---------------------------- */

    /** 
     * 파일 존재 여부 확인 후 노트 파일 저장
     * @param {String} saveFileName 저장 파일 명(확장자 포함)
     * @param {String} saveFilePath 저장 파일 경로(파일명, 확장자 포함)
     */
    var saveNotePageAction_newVersion = function(saveFileName, saveFilePath) {
        var blockContainer = apiBlockJS.getBlockContainer();
        blockContainer.saveAPIBlockMetadata();
        apiBlockJS.metaGenerate();
        var generatedMetaData = apiBlockJS.metadata;
        var encoded_generatedMetaData = encodeURIComponent(JSON.stringify(generatedMetaData));

        var sbfileSaveCmd = new sb.StringBuilder();
        sbfileSaveCmd.appendFormatLine('%%writefile "{0}"', saveFilePath);
        sbfileSaveCmd.appendLine(encoded_generatedMetaData);
        Jupyter.notebook.kernel.execute(sbfileSaveCmd.toString());

        vpCommon.renderSuccessMessage(saveFileName + ' saved ');
        /** vpnote 파일 save 이후 
          *  board 위에 save한 file 이름 적음 
          */
        var indexVp = saveFileName.indexOf('.vp');
        saveFileName = saveFileName.slice(0,indexVp);
        $('#vp_apiblock_board_makenode_input').val(saveFileName);
        $('#vp_apiblock_board_makenode_path').val(saveFilePath);
    }

    /** 2021 01 17 진용 추가
     * 
     */
    var openNotePageAction_newVersion = function() {
        var saveFilePath = $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.VP_NOTE_REAL_FILE_PATH))).val();
        fetch(saveFilePath).then(function(file) {
            if (file.status != 200) {
                alert("The file format is not valid.");
                return;
            }
    
            file.text().then(function(data) {
                var parsedData = decodeURIComponent(data);
                var generatedMetaData = JSON.parse(parsedData);
                apiBlockJS.loadMeta(apiBlockJS, generatedMetaData);
                var saveFileName = saveFilePath.substring(saveFilePath.lastIndexOf("/") + 1);
                var indexVp = saveFileName.indexOf('.vp');
                saveFileName = saveFileName.slice(0,indexVp);

                /** vpnote 파일 open 이후 
                 *  board 위에 open한 file 이름 적음 */
                $('#vp_apiblock_board_makenode_input').val(saveFileName);
                $('#vp_apiblock_board_makenode_path').val(saveFilePath);
            });
        });
    }

    return {
        containerInit: containerInit
        , loadOption: loadOption

        /** 2021 01 11 진용 추가 API Block block.js에서 사용하기 위해서*/
        , makeNoteNodeTag: makeNoteNodeTag
        , loadNoteNodeOption: loadNoteNodeOption
        , optionPageLoadCallback: optionPageLoadCallback
        , openNotePage: openNotePage
        , closeNoteExtraMenu: closeNoteExtraMenu

        , saveAsNotePage: saveAsNotePage
        , saveNotePageAction_newVersion: saveNotePageAction_newVersion
        , openNotePageAction_newVersion: openNotePageAction_newVersion

        // TEST: minju: 옵션페이지 로드 필요
        // , optionPageLoadCallbackWithData: optionPageLoadCallbackWithData
    };
});
