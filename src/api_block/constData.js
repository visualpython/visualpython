define([
    'nbextensions/visualpython/src/common/constant'
], function ( vpConstant ) {

    /** ---------------------------------------- API block에서 쓰이는 ENUM TYPE ------------------------------------------ */
    const BLOCK_GROUP_TYPE = {
        DEFINE: 1
        , CONTROL: 2
        , EXECUTE: 3
    }

    const BLOCK_CODELINE_BTN_TYPE = {
        CLASS: 1
        , DEF: 2
        , FOR: 4
        , WHILE: 5
        , IF: 3

        , TRY: 8
        , RETURN: 9
    
        , CONTINUE: 11
        , BREAK: 10
        , PASS: 12

        // , IMPORT: 6  // import 블럭 삭제 210429
        , LAMBDA: 14
        
        , CODE: 999
        , PRINT: 17
        
        , COMMENT: 16
    }
    
    const BLOCK_CODELINE_TYPE = {
        CLASS: 1
        , DEF: 2
        , IF: 3
        , FOR: 4
        , WHILE: 5
        // , IMPORT: 6
        , API: 7
        , TRY: 8

        , RETURN: 9
        , BREAK: 10
        , CONTINUE: 11
        , PASS: 12
        , PROPERTY: 13

        , LAMBDA: 14

        , COMMENT: 16
        , PRINT: 17

        , APPS: 20
        
        , ELIF: 100
        , ELSE: 200
        , FOR_ELSE: 201
        // , INIT: 300
        , DEL: 400
        , EXCEPT: 500
        , FINALLY: 600

        , TEXT: 990
        , CODE: 999
        
        , SHADOW: 1000

        , NODE: 100000
        , NONE: 0
    }
    
    const BLOCK_DIRECTION  = {
        ROOT: -1
        , DOWN: 1
        , INDENT: 2
        , NONE: 100
    }
  
    const IMPORT_BLOCK_TYPE = {
        DEFAULT: 1
        , CUSTOM: 2
    }

    const FOCUSED_PAGE_TYPE = {
        NULL: 1
        , BUTTONS: 2
        , BOARD: 3
        , OPTION: 4
        , BOARD_TITLE: 5
        , API_LIST_TAB: 6
    }

    const DEF_BLOCK_TYPE = {
        NONE: 'none'
        , ARG: '*args'
        , KWARGS: '**kwargs'
    }

    const DEF_BLOCK_PARAM_TYPE = {
        NONE: 'none'
        , INT: 'int'
        , STR: 'str'
        , INPUT_STR: 'inputStr'
    }
    
    const DEF_BLOCK_ARG6_TYPE = {
        NONE: 'Default Args'
        , ARGS: 'Variable Args'
        , KWARGS: 'Keyword Args'
    }

    const DEF_BLOCK_SELECT_VALUE_ARG_TYPE = {
        ARG3: 3
        , ARG5: 5
        , ARG6: 6
    }

    const FOR_BLOCK_TYPE = {
        FOR: 'for'
    }

    const FOR_BLOCK_ARG3_TYPE = {
        // ZIP: 'zip'
        // , RANGE: 'range'
        // , ENUMERATE: 'enumerate'
        // edit for block types
        RANGE: 'Range'
        , VARIABLE: 'Variable'
        , TYPING: 'Typing'
    }

    const FOR_BLOCK_SELECT_VALUE_ARG_TYPE = {
        ARG1: 1
        , ARG2: 2
        , ARG3: 3
        , ARG4: 4 
        , ARG5: 5
        , ARG6: 6
        , ARG7: 7
        , ARG10: 10
        , ARG11: 11
        , ARG12: 12
        , ARG13: 13
        , ARG14: 14
        , ARG15: 15

        , RETURN_VAR: 16
        , PREV_EXPRESSION: 17

        , ARG3_DEFAULT: 18
        , ARG3_INPUT_STR: 19
    }
    const IF_BLOCK_SELECT_VALUE_ARG_TYPE = {
        ARG1: 1
        , ARG2: 2
        , ARG3: 3
        , ARG4: 4 
        , ARG5: 5
        , ARG6: 6
    }

    const IF_BLOCK_CONDITION_TYPE = {
        ARG:0
        , USER_INPUT:1
    }

    const LAMBDA_BLOCK_SELECT_VALUE_ARG_TYPE = {
        ARG1: 1
        , ARG2: 2
        , ARG2_M: 3
        , ARG3: 4
        , ARG4: 5
    }

    const WHILE_BLOCK_SELECT_VALUE_ARG_TYPE = {
        ARG1: 1
        , ARG2: 2
        , ARG3: 3
        , ARG4: 4 
        , ARG5: 5
        , ARG6: 6
        , ARG7: 7
    }

    const API_BLOCK_PROCESS_PRODUCTION = Symbol();
    const API_BLOCK_PROCESS_DEVELOPMENT = Symbol();

    /** ---------------------------------------- const Number ------------------------------------------ */

    const NUM_INDENT_DEPTH_PX = 20;
    const NUM_BLOCK_HEIGHT_PX = 24;

    const NUM_MAX_ITERATION = 1000;

    const NUM_NULL = -1;
    const NUM_ZERO = 0;
    const NUM_HUNDREAD = 100;
    const NUM_THOUSAND = 1000;
    const NUM_FONT_WEIGHT_300 = 300;
    const NUM_FONT_WEIGHT_700 = 700;

    const NUM_DELETE_KEY_EVENT_NUMBER = 46;
    const NUM_ENTER_KEY_EVENT_NUMBER = 13;

    const NUM_DEFAULT_POS_X = 32;
    const NUM_DEFAULT_POS_Y = 0;
    const NUM_DEFAULT_BLOCK_LEFT_HOLDER_HEIGHT = 42;
    const NUM_BLOCK_BOTTOM_HOLDER_HEIGHT = 10;
    const NUM_BLOCK_MARGIN_TOP_PX = 2.5;
    const NUM_BLOCK_MARGIN_BOTTOM_PX = 2.5;
    const NUM_CODELINE_LEFT_MARGIN_PX = 30;
    const NUM_SHADOWBLOCK_OPACITY = 0.4;
    const NUM_EXCEED_DEPTH = 6;
    const NUM_MAX_BLOCK_NUMBER = 9999;
    const NUM_NODE_OR_TEXT_BLOCK_MARGIN_TOP_PX = 20;

    const NUM_BLOCK_MAX_WIDTH = 360;
    const NUM_APIBLOCK_MAIN_PAGE_WIDTH = 1000;
    const NUM_APIBLOCK_LEFT_PAGE_WIDTH = 140;
    const NUM_OPTION_PAGE_WIDTH = 550;
    const NUM_OPTION_PAGE_MIN_WIDTH = 333;

    const NUM_BUTTONS_PAGE_WIDTH = 265;
    const NUM_API_BOARD_CENTER_PAGE_WIDTH = 265; //282;
    const NUM_API_BOARD_CENTER_PAGE_MIN_WIDTH = 265; //282;
    const NUM_TEXT_BLOCK_WIDTH = 900;
    /** ---------------------------------------- const String ------------------------------------------ */
    const STR_EMPTY = '';
    const STR_ONE_SPACE = ' ';
    const STR_ONE_INDENT = '    ';
    const STR_DIV = 'div';
    const STR_SPAN = 'span';
    const STR_BORDER = 'border';
    const STR_BORDER_LEFT = 'border-left';
    const STR_TOP = 'top';
    const STR_LEFT = 'left';
    const STR_RIGHT = 'right';
    const STR_PX = 'px';
    const STR_OPACITY = 'opacity';
    const STR_MARGIN_TOP = 'margin-top';
    const STR_MARGIN_LEFT = 'margin-left';
    const STR_BOX_SHADOW = 'box-shadow';
    const STR_DISPLAY = 'display';
    const STR_BACKGROUND_COLOR = 'background-color';
    const STR_WIDTH = 'width';
    const STR_MIN_WIDTH = 'min-width';
    const STR_HEIGHT = 'height';
    const STR_INHERIT = 'inherit';
    const STR_YES = 'yes';
    const STR_NO = 'no';
    const STR_DATA_NUM_ID = 'data-num-id';
    const STR_DATA_DEPTH_ID = 'data-depth-id';
    const STR_NONE = 'none';
    const STR_BLOCK = 'block';
    const STR_SELECTED = 'selected';
    const STR_COLON_SELECTED = ':selected';
    const STR_POSITION = 'position';
    const STR_STATIC = 'static';
    const STR_RELATIVE = 'relative';
    const STR_ABSOLUTE = 'absolute';
    const STR_COLOR = 'color';
    const STR_PARENT = 'parent';
    const STR_DISABLED = 'disabled';

    const STR_GRP_DEFINE = 'Define';
    const STR_GRP_CONTROL = 'Control';
    const STR_GRP_EXECUTE = 'Execute';

    const STR_CLASS = 'class';
    const STR_DEF = 'def';
    const STR_IF = 'if';
    const STR_FOR = 'for';
    const STR_WHILE = 'while';
    const STR_IMPORT = 'import';
    const STR_API = 'api';
    const STR_APPS = 'apps';
    const STR_TRY = 'try';
    const STR_EXCEPT = 'except';
    const STR_FINALLY = 'finally';
    const STR_RETURN = 'return';
    const STR_BREAK = 'break';
    const STR_CONTINUE = 'continue';
    const STR_PASS = 'pass';
    const STR_CODE = 'code';
    const STR_COMMENT = 'comment';
    const STR_NODE = 'node';
    const STR_TEXT = 'text';
    const STR_PRINT = 'print';
    const STR_ELIF = 'elif';
    const STR_ELSE = 'else';
    const STR_PROPERTY = 'decoration';
    const STR_LAMBDA = 'lambda';

    const STR_TITLE = 'title';
    const STR_HIDDEN = 'hidden';
    const STR_AUTO = 'auto';
    const STR_OVERFLOW_X = 'overflow-x';
    const STR_OVERFLOW_Y = 'overflow-y';
    const STR_IS_SELECTED = 'isSelected';
    const STR_SCROLLHEIGHT = 'scrollHeight';
    const STR_CLICK = 'click';
    const STR_CHANGE = 'change';
    const STR_INPUT = 'input';
    const STR_FOCUS = 'focus';
    const STR_BLUR = 'blur';
    const STR_RIGHT_CLICK = 'contextmenu';
    const STR_CHECKED = 'checked';
    const STR_SCROLL = 'scroll';
    const STR_MAX_WIDTH = 'max-width';
    const STR_OPTION = 'Option';
    const STR_DEFAULT = 'default';
    const STR_CUSTOM = 'custom';
    const STR_TRANSPARENT = 'transparent';
    const STR_FONT_WEIGHT = 'font-weight';
    const STR_STRONG = 'strong';
    const STR_FLEX = 'flex';
    const STR_BORDER_RIGHT = 'border-right';
    const STR_BORDER_TOP_LEFT_RADIUS = 'border-top-left-radius';
    const STR_BORDER_BOTTOM_LEFT_RADIUS = 'border-bottom-left-radius';
    const STR_BORDER_TOP_RIGHT_RADIUS = 'border-top-right-radius';
    const STR_BORDER_BOTTOM_RIGHT_RADIUS = 'border-bottom-right-radius';
 
    const STR_3PX = '3px';
    const STR_100PERCENT = '100%';
    const STR_SOLID = 'solid';

    const STR_ICON_ARROW_UP = '▶';
    const STR_ICON_ARROW_DOWN = '▼';

    const STR_DOT = '.';
    const STR_KEYWORD_NEW_LINE = '\n';

    const STR_HEADER = 'header';
    const STR_NOTEBOOK = 'notebook';
    const STR_CELL = 'cell';
    const STR_CODEMIRROR_LINES = 'CodeMirror-lines';

    const STR_VARIABLE = 'Variable';
    const STR_OPERATOR = 'Operator';
    const STR_VALUE = 'Value';
    const STR_METHOD = 'Method';

    const STR_UNTITLED = 'Untitled';
    const STR_TEXT_BLOCK_MARKDOWN_FUNCID = 'com_markdown';
    const STR_SAMPLE_TEXT = 'Sample Text';

    /** ---------------------------------------- const CSS id String ------------------------------------------ */
    const VP_ID_PREFIX = '#';
    const VP_ID_WRAPPER = 'vp-wrapper';
    const VP_ID_APIBLOCK_VIEWDEPTH = 'vp_apiblock_viewdepth';
    const VP_ID_APIBLOCK_LINENUMBER_ASC = 'vp_apiblock_linenumberasc';
    const VP_ID_APIBLOCK_DELETE_BLOCK_ALL = 'vp_apiblock_deleteblockall';
    const VP_ID_APIBLOCK_CLOSE = 'vp_apiblock_close';
    const VP_ID_APIBLOCK_LEFT_TAB_API = 'vp_apiblock_left_tab_api';

    const VP_ID_APIBLOCK_MENU_BOX = 'vp_apiblock_menubox';
    const VP_ID_APIBLOCK_MENU_RUN = 'vp_apiblock_menu_run';
    const VP_ID_APIBLOCK_MENU_ADD = 'vp_apiblock_menu_add';
    const VP_ID_APIBLOCK_MENU_DUPLICATE = 'vp_apiblock_menu_duplicate';
    const VP_ID_APIBLOCK_MENU_DELETE = 'vp_apiblock_menu_delete';

    const VP_ID_APIBLOCK_OPTION_CODE_ARG = 'vp_apiblockCodeOptionInput';

    const VP_ID_APIBLOCK_OPTION_DEF_ARG_3 = 'vp_ApiblockDefArg3';
    const VP_ID_APIBLOCK_OPTION_DEF_ARG_4 = 'vp_ApiblockDefArg4';
    const VP_ID_APIBLOCK_OPTION_DEF_ARG_5 = 'vp_ApiblockDefArg5';
    const VP_ID_APIBLOCK_OPTION_DEF_ARG_6 = 'vp_ApiblockDefArg6';
    const VP_ID_APIBLOCK_OPTION_DEF_RETURN_TYPE = 'vp_ApiblockDefArgReturnType';

    const VP_ID_APIBLOCK_OPTION_FOR_TYPE_SELECT = 'vp_apiblockOptionForTypeSelect';
    const VP_ID_APIBLOCK_OPTION_FOR_ARG_1 = 'vp_apiblockOptionForArg1';
    const VP_ID_APIBLOCK_OPTION_FOR_ARG_2 = 'vp_apiblockOptionForArg2';
    const VP_ID_APIBLOCK_OPTION_FOR_ARG_3 = 'vp_apiblockOptionForArg3';
    const VP_ID_APIBLOCK_OPTION_FOR_ARG_4 = 'vp_apiblockOptionForArg4';
    const VP_ID_APIBLOCK_OPTION_FOR_ARG_5 = 'vp_apiblockOptionForArg5';
    const VP_ID_APIBLOCK_OPTION_FOR_ARG_6 = 'vp_apiblockOptionForArg6';
    const VP_ID_APIBLOCK_OPTION_FOR_ARG_7 = 'vp_apiblockOptionForArg7';
    const VP_ID_APIBLOCK_OPTION_FOR_ARG_3_INPUT_STR = 'vp_apiblockOptionForArg3InputStr';
    const VP_ID_APIBLOCK_OPTION_FOR_ARG_3_DEFAULT = 'vp_apiblockOptionForArg3Default';

    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_1 = 'vp_apiblockOptionListForArg1';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_2 = 'vp_apiblockOptionListForArg2';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_3 = 'vp_apiblockOptionListForArg3';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_4 = 'vp_apiblockOptionListForArg4';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_5 = 'vp_apiblockOptionListForArg5';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_6 = 'vp_apiblockOptionListForArg6';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_7 = 'vp_apiblockOptionListForArg7';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_10 = 'vp_apiblockOptionListForArg10';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_11 = 'vp_apiblockOptionListForArg11';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_12 = 'vp_apiblockOptionListForArg12';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_13 = 'vp_apiblockOptionListForArg13';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_14 = 'vp_apiblockOptionListForArg14';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_15 = 'vp_apiblockOptionListForArg15';

    const VP_ID_APIBLOCK_OPTION_LIST_FOR_PLUS = 'vp_apiblockOptionPlusListfor';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_RETURN_VAR = 'vp_apiblockOptionListforReturnVar';
    const VP_ID_APIBLOCK_OPTION_LIST_FOR_PREV_EXPRESSION = 'vp_apiblockOptionListforExpression';

    const VP_ID_APIBLOCK_OPTION_IF_ARG = 'vp_apiblockOptionIfArg';
    const VP_ID_APIBLOCK_OPTION_IF_ARG_1 = 'vp_apiblockOptionIfArg1';
    const VP_ID_APIBLOCK_OPTION_IF_ARG_2 = 'vp_apiblockOptionIfArg2';
    const VP_ID_APIBLOCK_OPTION_IF_ARG_3 = 'vp_apiblockOptionIfArg3';
    const VP_ID_APIBLOCK_OPTION_IF_ARG_4 = 'vp_apiblockOptionIfArg4';
    const VP_ID_APIBLOCK_OPTION_IF_ARG_5 = 'vp_apiblockOptionIfArg5';
    const VP_ID_APIBLOCK_OPTION_IF_ARG_6 = 'vp_apiblockOptionIfArg6';
    const VP_ID_APIBLOCK_OPTION_IF_USER_INPUT = 'vp_apiblockOptionIfUserInput';
    const VP_ID_APIBLOCK_OPTION_IF_PLUS = 'vp_apiblockOptionPlusIf';
    const VP_ID_APIBLOCK_OPTION_IF_PLUS_USER_INPUT = 'vp_apiblockOptionPlusUserInputIf';
    const VP_ID_APIBLOCK_OPTION_IF_DELETE = 'vp_apiblockOptionDeleteIf';

    const VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_1 = 'vp_apiblockOptionLambdaArg1';
    const VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_2 = 'vp_apiblockOptionLambdaArg2';
    const VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_2_M = 'vp_apiblockOptionLambdaArg2_m';
   
    const VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_3 = 'vp_apiblockOptionLambdaArg3';
    const VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_4 = 'vp_apiblockOptionLambdaArg4';

    const VP_ID_APIBLOCK_OPTION_WHILE_TYPE_SELECT = 'vp_apiblockOptionWhileTypeSelect';
    const VP_ID_APIBLOCK_OPTION_WHILE_ARG  = 'vp_apiblockOptionWhileArg';
    const VP_ID_APIBLOCK_OPTION_WHILE_ARG_1 = 'vp_apiblockOptionWhileArg1';
    const VP_ID_APIBLOCK_OPTION_WHILE_ARG_2 = 'vp_apiblockOptionWhileArg2';
    const VP_ID_APIBLOCK_OPTION_WHILE_ARG_3 = 'vp_apiblockOptionWhileArg3';
    const VP_ID_APIBLOCK_OPTION_WHILE_ARG_4 = 'vp_apiblockOptionWhileArg4';
    const VP_ID_APIBLOCK_OPTION_WHILE_ARG_5 = 'vp_apiblockOptionWhileArg5';
    const VP_ID_APIBLOCK_OPTION_WHILE_ARG_6 = 'vp_apiblockOptionWhileArg6';
    const VP_ID_APIBLOCK_OPTION_WHILE_ARG_7 = 'vp_apiblockOptionWhileArg7';
    const VP_ID_APIBLOCK_OPTION_WHILE_PLUS = 'vp_apiblockOptionPlusWhile';
    const VP_ID_APIBLOCK_OPTION_WHILE_DELETE = 'vp_apiblockOptionDeleteWhile';

    const VP_ID_APIBLOCK_LEFT_TAP_APILIST_PAGE = 'vp_apiblock_left_tab_api';
    const VP_ID_APIBLOCK_NODE_BLOCK_PLUS_BUTTON = 'vp_apiblock_board_node_plus_button';
    const VP_ID_APIBLOCK_TEXT_BLOCK_PLUS_BUTTON = 'vp_apiblock_board_text_plus_button';
    const VP_ID_APIBLOCK_BOARD_MAKE_NODE_BLOCK_INPUT = 'vp_apiblock_board_makenode_input';
    const VP_ID_APIBLOCK_BOARD_MAKE_NODE_PATH = 'vp_apiblock_board_makenode_path';

    const VP_APIBLOCK_BOARD_OPTION_PREVIEW_BUTTON = 'vp_apiblock_board_option_preview_button';
    const VP_APIBLOCK_BOARD_OPTION_CANCEL_BUTTON = 'vp_apiblock_board_option_cancel_button';
    const VP_APIBLOCK_BOARD_OPTION_APPLY_BUTTON = 'vp_apiblock_board_option_apply_button';

    /** ---------------------------------------- const CSS class String ------------------------------------------ */
    const VP_CLASS_PREFIX = '.';
    
    const VP_BLOCK = 'vp-block';
    const VP_CLASS_BLOCK_CONTAINER = 'vp-block-container';

    const VP_CLASS_BLOCK_GROUPBOX_PREFIX = 'vp-block-group-box-';

    const VP_BLOCK_BLOCKCODELINETYPE_CLASS_DEF = 'vp-block-class-def';
    const VP_BLOCK_BLOCKCODELINETYPE_CONTROL = 'vp-block-control';
    const VP_BLOCK_BLOCKCODELINETYPE_API = 'vp-block-api';
    const VP_BLOCK_BLOCKCODELINETYPE_CODE = 'vp-block-blockcodelinetype-code';
    const VP_BLOCK_BLOCKCODELINETYPE_TEXT = 'vp-block-text';
    const VP_BLOCK_BLOCKCODELINETYPE_NODE = 'vp-block-node';

    const VP_CLASS_BLOCK_NUM_INFO = 'vp-block-num-info';
    const VP_CLASS_APIBLOCK_MINIMIZE = 'vp-apiblock-minimize';
    const VP_CLASS_APIBLOCK_ARROW_UP = 'vp-apiblock-arrow-up';
    const VP_CLASS_APIBLOCK_ARROW_DOWN = 'vp-apiblock-arrow-down';
    const VP_CLASS_APIBLOCK_OPTION_INPUT_REQUIRED = 'vp-apiblock-option-input-required';

    const VP_CLASS_APIBLOCK_MENU_BOX = 'vp-apiblock-menu-box';
    const VP_CLASS_APIBLOCK_MENU_ITEM = 'vp-apiblock-menu-item';

    const VP_CLASS_BLOCK_BOTTOM_HOLDER = 'vp-block-bottom-holder';

    const VP_CLASS_BLOCK_CODETYPE_NAME = 'vp-block-name';

    const VP_CLASS_BLOCK_SHADOWBLOCK = 'vp-block-shadowblock';
    const VP_CLASS_BLOCK_OPTION_BTN = 'vp-block-option-btn';
    const VP_CLASS_BLOCK_DELETE_BTN = 'vp-block-delete-btn';
    const VP_CLASS_BLOCK_SUB_BTN_CONTAINER = 'vp-apiblock-block-container-button';
    const VP_CLASS_BLOCK_LEFT_HOLDER = 'vp-block-left-holder';
    const VP_CLASS_BLOCK_DEPTH_INFO = 'vp-block-depth-info';
    const VP_CLASS_BLOCK_CTRLCLICK_INFO = 'vp-block-ctrlclick-info';
    const VP_CLASS_APIBLOCK_BLOCK_HEADER = 'vp-block-header-';
    const VP_CLASS_APIBLOCK_TAB_NAVIGATION_NODE_OPTION_TITLE_SAPN = 'vp-apiblock-tab-navigation-node-option-title span';
    const VP_CLASS_APIBLOCK_TAB_NAVIGATION_NODE_OPTION_CHILDS_TOP_TITLE_SAPN ='vp-apiblock-tab-navigation-node-childs-top-option-title span'
    const VP_CLASS_APIBLOCK_BODY = 'vp-apiblock-body';
    const VP_CLASS_APIBLOCK_MAIN = 'vp-apiblock-main';
    const VP_CLASS_APIBLOCK_BOARD_CONTAINER = 'vp-apiblock-right';
    const VP_CLASS_APIBLOCK_BOARD = 'vp-apiblock-board-body';
    const VP_CLASS_APIBLOCK_BUTTONS = 'vp-apiblock-left';
    const VP_CLASS_APIBLOCK_OPTION_TAB = 'vp-apiblock-option-tab';
    const VP_CLASS_APIBLOCK_OPTION_TAB_CHILDS_OPTION = 'vp-apiblock-option-tab-childs-option';
    const VP_CLASS_APIBLOCK_OPTION_NAME = 'vp-apiblock-optionpage-name';
    const VP_CLASS_APIBLOCK_OPTION_TAB_SELECTOR = 'vp-apiblock-option-container';
    const VP_CLASS_APIBLOCK_BOTTOM_OPTIONAL_TAB_VIEW = 'vp-apiblock-bottom-optional-tab-view';
    const VP_CLASS_APIBLOCK_SCROLLBAR = 'vp-apiblock-scrollbar';
    const VP_CLASS_APIBLOCK_CODELINE_ELLIPSIS = 'vp-apiblock-codeline-ellipsis';
    const VP_CLASS_MAIN_CONTAINER = 'vp-main-container';
    const VP_CLASS_APIBLOCK_TITLE = 'vp-apiblock-title';

    const VP_CLASS_BLOCK_HEADER_PARAM = 'vp-block-header-param';
    const VP_CLASS_APIBLOCK_INPUT_PARAM = 'vp-apiblock-input-param';
    const VP_CLASS_APIBLOCK_PARAM_PLUS_BTN = 'vp-apiblock-param-plus-btn';
    const VP_CLASS_APIBLOCK_PARAM_DELETE_BTN = 'vp-apiblock-param-delete-btn';

    const VP_CLASS_BLOCK_STYLE_BORDER_TOP_LEFT_RADIUS = 'vp-block-style-border-top-left-radius'
    const VP_CLASS_BLOCK_STYLE_BORDER_BOTTOM_LEFT_RADIUS = 'vp-block-style-border-bottom-left-radius';

    const VP_CLASS_BLOCK_SHADOWBLOCK_CONTAINER = 'vp-block-shadowblock-container';
    const VP_CLASS_APIBLOCK_MENU_BTN = 'vp-apiblock-menu-button';
    const VP_CLASS_SELECTED_SHADOWBLOCK = 'selected-shadowblock';

    const VP_CLASS_APIBLOCK_NODEBLOCK_INPUT = 'vp-apiblock-nodeblock-input';
    const VP_CLASS_APIBLOCK_NODEBLOCK_TEXT = 'vp-apiblock-nodeblock-text';
    const VP_CLASS_APIBLOCK_NODEBLOCK_TEXT_CONTAINER = 'vp-apiblock-nodeblock-text-container';
    const VP_CLASS_APIBLOCK_NODEBLOCK = 'vp-apiblock-nodeblock';

    /** const Option  */
    const VP_CLASS_APIBLOCK_OPTION_INPUT = 'vp-apiblock-option-input';

    /** const Css Style */
    const VP_CLASS_STYLE_FLEX_ROW = 'vp-apiblock-style-flex-row';
    const VP_CLASS_STYLE_FLEX_ROW_CENTER = 'vp-apiblock-style-flex-row-center';
    const VP_CLASS_STYLE_FLEX_ROW_WRAP = 'vp-apiblock-style-flex-row-wrap';
    const VP_CLASS_STYLE_FLEX_ROW_CENTER_WRAP = 'vp-apiblock-style-flex-row-center-wrap';
    const VP_CLASS_STYLE_FLEX_ROW_BETWEEN = 'vp-apiblock-style-flex-row-between';
    const VP_CLASS_STYLE_FLEX_ROW_AROUND = 'vp-apiblock-style-flex-row-around';
    const VP_CLASS_STYLE_FLEX_ROW_EVENLY = 'vp-apiblock-style-flex-row-evenly';
    const VP_CLASS_STYLE_FLEX_ROW_BETWEEN_WRAP = 'vp-apiblock-style-flex-row-between-wrap';
    const VP_CLASS_STYLE_FLEX_ROW_END = 'vp-apiblock-style-flex-row-end';
    const VP_CLASS_STYLE_FLEX_COLUMN = 'vp-apiblock-style-flex-column';
    const VP_CLASS_STYLE_FLEX_COLUMN_CENTER = 'vp-apiblock-style-flex-column-center';
    const VP_CLASS_STYLE_FLEX_COLUMN_CENTER_WRAP = 'vp-apiblock-style-flex-column-center-wrap';
    const VP_CLASS_STYLE_MARGIN_TOP_5PX = 'vp-apiblock-style-margin-top-5px';

    const VP_CLASS_STYLE_WIDTH_5PERCENT = 'vp-apiblock-style-width-5percent';
    const VP_CLASS_STYLE_WIDTH_10PERCENT = 'vp-apiblock-style-width-10percent';
    const VP_CLASS_STYLE_WIDTH_15PERCENT = 'vp-apiblock-style-width-15percent';
    const VP_CLASS_STYLE_WIDTH_20PERCENT = 'vp-apiblock-style-width-20percent';
    const VP_CLASS_STYLE_WIDTH_25PERCENT = 'vp-apiblock-style-width-25percent';
    const VP_CLASS_STYLE_WIDTH_30PERCENT = 'vp-apiblock-style-width-30percent';
    const VP_CLASS_STYLE_WIDTH_35PERCENT = 'vp-apiblock-style-width-35percent';
    const VP_CLASS_STYLE_WIDTH_40PERCENT = 'vp-apiblock-style-width-40percent';
    const VP_CLASS_STYLE_WIDTH_45PERCENT = 'vp-apiblock-style-width-45percent';
    const VP_CLASS_STYLE_WIDTH_50PERCENT = 'vp-apiblock-style-width-50percent';
    const VP_CLASS_STYLE_WIDTH_55PERCENT = 'vp-apiblock-style-width-55percent';
    const VP_CLASS_STYLE_WIDTH_60PERCENT = 'vp-apiblock-style-width-60percent';
    const VP_CLASS_STYLE_WIDTH_65PERCENT = 'vp-apiblock-style-width-65percent';
    const VP_CLASS_STYLE_WIDTH_70PERCENT = 'vp-apiblock-style-width-70percent';
    const VP_CLASS_STYLE_WIDTH_75PERCENT = 'vp-apiblock-style-width-75percent';
    const VP_CLASS_STYLE_WIDTH_80PERCENT = 'vp-apiblock-style-width-80percent';
    const VP_CLASS_STYLE_WIDTH_85PERCENT = 'vp-apiblock-style-width-85percent';
    const VP_CLASS_STYLE_WIDTH_90PERCENT = 'vp-apiblock-style-width-90percent';
    const VP_CLASS_STYLE_WIDTH_95PERCENT = 'vp-apiblock-style-width-95percent';
    const VP_CLASS_STYLE_WIDTH_100PERCENT = 'vp-apiblock-style-width-100percent';

    const VP_CLASS_STYLE_BGCOLOR_C4C4C4 = 'vp-apiblock-style-bgcolor-C4C4C4';

    const VP_CLASS_STYLE_OPACITY_0 = 'vp-apiblock-style-opacity-0';
    const VP_CLASS_STYLE_OPACITY_1 = 'vp-apiblock-style-opacity-1';

    const VP_CLASS_STYLE_MARGIN_LEFT_5PX = 'vp-apiblock-style-margin-left-5px';
    const VP_CLASS_STYLE_MARGIN_LEFT_10PX = 'vp-apiblock-style-margin-left-10px';
    const VP_CLASS_STYLE_MARGIN_LEFT_15PX = 'vp-apiblock-style-margin-left-15px';

    const VP_CLASS_STYLE_DISPLAY_BLOCK = 'vp-apiblock-style-display-block';
    const VP_CLASS_STYLE_DISPLAY_NONE = 'vp-apiblock-style-display-none';
    const VP_CLASS_STYLE_DISPLAY_FLEX = 'vp-apiblock-style-display-flex';

    /** ---------------------------------------- const Message String --------------------------------------------- */
    const STR_MSG_BLOCK_DELETED = 'Block deleted!';
    const STR_MSG_AUTO_GENERATED_BY_VISUALPYTHON = '# Auto-Generated by VisualPython';
    const STR_MSG_BLOCK_DEPTH_MUSH_NOT_EXCEED_6 = 'Block depth must not exceed 6 !!';

    /** ---------------------------------------- const Phrase String --------------------------------------------- */
    const STR_INPUT_YOUR_CODE = 'input your code';
    const STR_CHANGE_KEYUP_PASTE = 'change keyup paste';
    const STR_PHRASE_2PX_SOLID_TRANSPARENT = '2px solid transparent';
    const STR_PHRASE_2PX_SOLID_YELLOW = '2px solid rgb(246, 173, 85)';

    /** ---------------------------------------- const Image Url String ------------------------------------------- */
    const PNG_VP_APIBLOCK_OPTION_ICON = 'vp-apiblock-option-icon.png';
    const PNG_VP_APIBLOCK_DELETE_ICON = 'vp-apiblock-delete-icon.png';

    /** ---------------------------------------- const State Name String ------------------------------------------ */
    const STATE_state = 'state';

    /** Api */
    const STATE_metadata = 'metadata';

    /** Class */
    const STATE_classInParamList = 'classInParamList';
    const STATE_className = 'className';
    const STATE_parentClassName = 'parentClassName';

    /** Def */
    const STATE_defName = 'defName';
    const STATE_defInParamList = 'defInParamList';
    const STATE_defReturnType = 'defReturnType';

    /** If */
    const STATE_isIfElse = 'isIfElse';
    const STATE_isForElse = 'isForElse';
    const STATE_ifConditionList = 'ifConditionList';
    const STATE_elifConditionList = 'elifConditionList';
    const STATE_forParam = 'forParam';


    /** For */

    /** While */
    const STATE_whileBlockOptionType = 'whileBlockOptionType';
    const STATE_whileConditionList = 'whileConditionList';

    /** Import */
    const STATE_baseImportList = 'baseImportList';
    const STATE_customImportList = 'customImportList';
    const STATE_isBaseImportPage = 'isBaseImportPage';

    /** Except */
    const STATE_exceptConditionList = 'exceptConditionList';

    /** Finally */
    const STATE_isFinally = 'isFinally';

    /** Return */ 
    const STATE_returnOutParamList = 'returnOutParamList';
    
    /** Code */
    const STATE_codeLine = 'customCodeLine';

    /** Lambda */
    const STATE_lambdaArg1 = 'lambdaArg1';
    const STATE_lambdaArg2List = 'lambdaArg2List';
    const STATE_lambdaArg3 = 'lambdaArg3';


    /** ---------------------------------------- const Color String ------------------------------------------ */

    const COLOR_CLASS_DEF = 'rgb(213, 231, 222)';
    const COLOR_CONTROL = 'rgb(253, 239, 221)';
    const COLOR_API = '#F9E3D6'; //'rgb(255, 165, 113)';
    const COLOR_CODE = '#E5E5E5';

    const COLOR_CLASS_DEF_STRONG = '#8AD6B0';
    const COLOR_CONTROL_STRONG = '#FFCF73';
    const COLOR_API_STRONG = '#fdb185';
    const COLOR_CODE_STRONG = '#C4C4C4';

    const COLOR_YELLOW = 'yellow';
    const COLOR_WHITE = 'white';
    const COLOR_BLOCK_ICON_BTN = '#E85401';
    const COLOR_GRAY_input_your_code = '#d4d4d4';
    const COLOR_FOCUSED_PAGE = '#66BB6A';
    const COLOR_BLACK = '#696969';
    const COLOR_LINENUMBER = '#E5E5E5';
    const COLOR_LIST = ["rgb(47, 133, 90)", "rgb(246, 173, 85)", "#E5E5E5", "yellow", "#6E5261", "#D3E9FF", "#FFD5D5", "#FFA0AD", "#509BE1", "#FF71B2"];

    /** ---------------------------------------- const Error String ------------------------------------------ */
    const ERROR_AB0001_REF_NULL_POINTER = '널 포인터 참조 에러';
    const ERROR_AB0002_INFINITE_LOOP = '무한루프 발생';
 
    /** ---------------------------------------- const URL string -------------------------------------------- */

    const API_BLOCK_HTML_URL_PATH = "api_block/index.html";
    const API_BLOCK_INDEX_CSS = "api_block/index.css";

    /** ---------------------------------------- const operator ---------------------------------------------- */
    const COMPARISON_OPERATOR = ['==' ,'!=', '<', '>', '>=', '<='];
    const COMPARISON_OPERATOR_IF_ARG2 = ['', '==' ,'!=', '<', '>', '>=', '<=', 'and', 'or', 'in','not in', '+',  '-', '*', '/', '%'];
    const COMPARISON_OPERATOR_IF_ARG4 = ['', '==' ,'!=', '<', '>', '>=', '<=', 'and', 'or', 'in','not in'];
    const COMPARISON_OPERATOR_IF_ARG6 = ['==' ,'!=', '<', '>', '>=', '<=', 'and', 'or', 'in','not in'];
    
    const DEF_PARAM_TYPE_LIST = ['int','str','float','bool','complex','bytes','tuple','list','dict'];

    const WHILE_OPERATOR_ARG1 = ['True','False'];
    const WHILE_OPERATOR_ARG2 = ['==' ,'!=', '<', '>', '>=', '<=', 'and', 'or', 'in','not in'];

    const IMPORT_DEFAULT_DATA_LIST = [
        {
            isImport: false
            , baseImportName: 'numpy' 
            , baseAcronyms: 'np' 
        }   
        , {
            isImport: false
            , baseImportName: 'pandas' 
            , baseAcronyms: 'pd' 
        }
        , {
            isImport: false
            , baseImportName: 'matplotlib.pyplot' 
            , baseAcronyms: 'plt' 
        }
        , {
            isImport: false
            , baseImportName: 'seaborn' 
            , baseAcronyms: 'sns' 
        }
        , {
            isImport: false
            , baseImportName: 'os' 
            , baseAcronyms: 'os' 
        }
        , {
            isImport: false
            , baseImportName: 'sys' 
            , baseAcronyms: 'sys' 
        }
        , {
            isImport: false
            , baseImportName: 'time' 
            , baseAcronyms: 'time' 
        }
        , {
            isImport: false
            , baseImportName: 'datetime' 
            , baseAcronyms: 'datetime' 
        }
        , {
            isImport: false
            , baseImportName: 'random' 
            , baseAcronyms: 'random' 
        }
        , {
            isImport: false
            , baseImportName: 'math' 
            , baseAcronyms: 'math' 
        }
    ]

    const IMPORT_LIBRARY_LIST = {
        0: { value: 'numpy', text: 'numpy' }
        , 1: { value: 'pandas', text: 'pandas' }
        , 2: { value: 'matplotlib', text: 'matplotlib' }
        , 3: { value: 'seaborn', text: 'seaborn'}
        , 4: { value: 'os', text: 'os'}
        , 5: { value: 'sys', text: 'sys'}
        , 6: { value: 'time', text: 'time'}
        , 7: { value: 'datetime', text: 'datetime'}
        , 8: { value: 'random', text: 'random'}
        , 9: { value: 'math', text: 'math'}
    }
    // const WHILE_OPERATOR_ARG4 = ['none', '==' ,'!=', '<', '>', '>=', '<=', 'and', 'or', 'in','not in'];
    // const WHILE_OPERATOR_ARG6 = ['==' ,'!=', '<', '>', '>=', '<=', 'and', 'or', 'in','not in'];

    const APPS_CONFIG = {
        'import': {
            file: '/nbextensions/visualpython/src/file_io/import.js',
            config: { title: 'Import', width: '500px'}
        },
        'markdown': {
            file: '/nbextensions/visualpython/src/markdown/markdown.js',
            config: { title: 'Markdown' }
        },
        'snippets': {
            file: '/nbextensions/visualpython/src/file_io/udf.js',
            config: { title: 'Snippets' }
        },
        'variable': {
            file: '/nbextensions/visualpython/src/file_io/variables.js',
            config: { title: 'Variables' }
        },
        'file': {
            file: '/nbextensions/visualpython/src/file_io/fileio.js',
            config: { title: 'File', width: '500px' }
        },
        'instance': {
            file: '/nbextensions/visualpython/src/file_io/instance.js',
            config: { title: 'Instance' }
        },
        'subset': {
            file: 'nbextensions/visualpython/src/common/vpSubsetEditor',
        },
        'frame': {
            file: 'nbextensions/visualpython/src/common/vpFrameEditor'
        },
        'chart': {
            file: '/nbextensions/visualpython/src/matplotlib/plot.js',
            config: { title: 'Chart', width: '600px' }
        },
        'profiling': {
            file: 'nbextensions/visualpython/src/common/vpProfiling'
        }
    }

    return {
        BLOCK_GROUP_TYPE
        , BLOCK_CODELINE_BTN_TYPE
        , BLOCK_CODELINE_TYPE
        , BLOCK_DIRECTION
        , IMPORT_BLOCK_TYPE
        , FOCUSED_PAGE_TYPE

        , DEF_BLOCK_TYPE
        , DEF_BLOCK_PARAM_TYPE

        , DEF_BLOCK_ARG6_TYPE
        , DEF_BLOCK_SELECT_VALUE_ARG_TYPE

        , FOR_BLOCK_TYPE
        , FOR_BLOCK_ARG3_TYPE
        , FOR_BLOCK_SELECT_VALUE_ARG_TYPE
        
        , IF_BLOCK_SELECT_VALUE_ARG_TYPE
        , IF_BLOCK_CONDITION_TYPE

        , LAMBDA_BLOCK_SELECT_VALUE_ARG_TYPE

        , WHILE_BLOCK_SELECT_VALUE_ARG_TYPE
        , WHILE_OPERATOR_ARG1
        , WHILE_OPERATOR_ARG2

        , NUM_INDENT_DEPTH_PX
        , NUM_BLOCK_HEIGHT_PX
        , NUM_MAX_ITERATION
        
        , NUM_NULL
        , NUM_ZERO
        , NUM_HUNDREAD
        , NUM_THOUSAND
        , NUM_DELETE_KEY_EVENT_NUMBER 
        , NUM_ENTER_KEY_EVENT_NUMBER
        
        , NUM_DEFAULT_POS_X
        , NUM_DEFAULT_POS_Y
        , NUM_DEFAULT_BLOCK_LEFT_HOLDER_HEIGHT
        , NUM_BLOCK_BOTTOM_HOLDER_HEIGHT
        , NUM_BLOCK_MARGIN_TOP_PX
        , NUM_BLOCK_MARGIN_BOTTOM_PX
        , NUM_CODELINE_LEFT_MARGIN_PX
        , NUM_SHADOWBLOCK_OPACITY
        , NUM_EXCEED_DEPTH
        , NUM_FONT_WEIGHT_300
        , NUM_FONT_WEIGHT_700
        , NUM_MAX_BLOCK_NUMBER
        , NUM_NODE_OR_TEXT_BLOCK_MARGIN_TOP_PX
        , NUM_BLOCK_MAX_WIDTH
        , NUM_APIBLOCK_MAIN_PAGE_WIDTH
        , NUM_APIBLOCK_LEFT_PAGE_WIDTH
        , NUM_OPTION_PAGE_WIDTH
        , NUM_OPTION_PAGE_MIN_WIDTH
        , NUM_BUTTONS_PAGE_WIDTH
        , NUM_API_BOARD_CENTER_PAGE_WIDTH
        , NUM_API_BOARD_CENTER_PAGE_MIN_WIDTH
        , NUM_TEXT_BLOCK_WIDTH

        , STR_TOP
        , STR_LEFT
        , STR_RIGHT
        , STR_DIV
        , STR_SPAN
        , STR_BORDER
        , STR_BORDER_LEFT
        , STR_PX
        , STR_OPACITY
        , STR_MARGIN_TOP
        , STR_MARGIN_LEFT
        , STR_BOX_SHADOW
        , STR_DISPLAY
        , STR_BACKGROUND_COLOR
        , STR_WIDTH
        , STR_HEIGHT
        , STR_INHERIT
        , STR_YES
        , STR_DATA_NUM_ID 
        , STR_DATA_DEPTH_ID
        , STR_NONE
        , STR_BLOCK
        , STR_SELECTED
        , STR_COLON_SELECTED
        , STR_POSITION
        , STR_STATIC
        , STR_RELATIVE
        , STR_ABSOLUTE
        , STR_NO
        , STR_COLOR
        , STR_PARENT
        , STR_DISABLED

        , STR_IS_SELECTED
        , STR_SCROLLHEIGHT

        , STR_TOP
        , STR_CHECKED
        , STR_SCROLL

        , STR_GRP_DEFINE
        , STR_GRP_CONTROL
        , STR_GRP_EXECUTE

        , STR_CLASS
        , STR_DEF
        , STR_IF
        , STR_FOR
        , STR_WHILE
        , STR_IMPORT
        , STR_API
        , STR_APPS
        , STR_TRY
        , STR_EXCEPT
        , STR_FINALLY
        , STR_RETURN
        , STR_BREAK
        , STR_CONTINUE
        , STR_PASS
        , STR_CODE
        , STR_COMMENT
        , STR_NODE
        , STR_TEXT
        , STR_PRINT
        , STR_ELIF
        , STR_ELSE
        , STR_PROPERTY
        , STR_LAMBDA

        , STR_TITLE
        , STR_OVERFLOW_X
        , STR_OVERFLOW_Y
        , STR_HIDDEN
        , STR_AUTO
        , STR_OPTION
        , STR_DEFAULT
        , STR_CUSTOM
        , STR_TRANSPARENT
        , STR_CLICK
        , STR_CHANGE
        , STR_FOCUS
        , STR_BLUR
        , STR_INPUT
        , STR_RIGHT_CLICK

        , STR_FONT_WEIGHT
        , STR_MAX_WIDTH
        , STR_MIN_WIDTH
        , STR_STRONG
        , STR_FLEX
        
        , STR_MARGIN_TOP
        , STR_BORDER_RIGHT
        , STR_BORDER_TOP_LEFT_RADIUS
        , STR_BORDER_BOTTOM_LEFT_RADIUS
        , STR_BORDER_TOP_RIGHT_RADIUS
        , STR_BORDER_BOTTOM_RIGHT_RADIUS
        , STR_3PX
        , STR_100PERCENT
        , STR_SOLID
        
        , STR_NOTEBOOK
        , STR_HEADER
        , STR_CELL
        , STR_CODEMIRROR_LINES

        , STR_EMPTY
        , STR_DOT
        , STR_KEYWORD_NEW_LINE
        , STR_ONE_SPACE
        , STR_ONE_INDENT
        
        , STR_PHRASE_2PX_SOLID_TRANSPARENT
        , STR_PHRASE_2PX_SOLID_YELLOW

        , STR_VARIABLE
        , STR_OPERATOR
        , STR_VALUE
        , STR_METHOD

        , STR_UNTITLED

        , VP_BLOCK
        , VP_BLOCK_BLOCKCODELINETYPE_CLASS_DEF
        , VP_BLOCK_BLOCKCODELINETYPE_CONTROL
        , VP_BLOCK_BLOCKCODELINETYPE_API
        , VP_BLOCK_BLOCKCODELINETYPE_CODE
        , VP_BLOCK_BLOCKCODELINETYPE_TEXT
        , VP_BLOCK_BLOCKCODELINETYPE_NODE
        
        , VP_ID_PREFIX
        , VP_ID_WRAPPER
        , VP_ID_APIBLOCK_VIEWDEPTH
        , VP_ID_APIBLOCK_LINENUMBER_ASC
        , VP_ID_APIBLOCK_DELETE_BLOCK_ALL
        , VP_ID_APIBLOCK_CLOSE
        , VP_ID_APIBLOCK_LEFT_TAB_API

        , VP_ID_APIBLOCK_MENU_BOX
        , VP_ID_APIBLOCK_MENU_RUN
        , VP_ID_APIBLOCK_MENU_ADD
        , VP_ID_APIBLOCK_MENU_DUPLICATE
        , VP_ID_APIBLOCK_MENU_DELETE

        , VP_ID_APIBLOCK_OPTION_CODE_ARG

        , VP_ID_APIBLOCK_OPTION_DEF_ARG_3
        , VP_ID_APIBLOCK_OPTION_DEF_ARG_4
        , VP_ID_APIBLOCK_OPTION_DEF_ARG_5
        , VP_ID_APIBLOCK_OPTION_DEF_ARG_6
        , VP_ID_APIBLOCK_OPTION_DEF_RETURN_TYPE

        , VP_ID_APIBLOCK_OPTION_FOR_TYPE_SELECT
        , VP_ID_APIBLOCK_OPTION_FOR_ARG_1
        , VP_ID_APIBLOCK_OPTION_FOR_ARG_2
        , VP_ID_APIBLOCK_OPTION_FOR_ARG_3
        , VP_ID_APIBLOCK_OPTION_FOR_ARG_4
        , VP_ID_APIBLOCK_OPTION_FOR_ARG_5
        , VP_ID_APIBLOCK_OPTION_FOR_ARG_6
        , VP_ID_APIBLOCK_OPTION_FOR_ARG_7
        , VP_ID_APIBLOCK_OPTION_FOR_ARG_3_INPUT_STR
        , VP_ID_APIBLOCK_OPTION_FOR_ARG_3_DEFAULT

        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_1
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_2
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_3
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_4
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_5
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_6
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_7
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_10
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_11
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_12
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_13
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_14
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_ARG_15
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_PLUS
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_RETURN_VAR
        , VP_ID_APIBLOCK_OPTION_LIST_FOR_PREV_EXPRESSION

        , VP_ID_APIBLOCK_OPTION_IF_ARG
        , VP_ID_APIBLOCK_OPTION_IF_ARG_1
        , VP_ID_APIBLOCK_OPTION_IF_ARG_2
        , VP_ID_APIBLOCK_OPTION_IF_ARG_3
        , VP_ID_APIBLOCK_OPTION_IF_ARG_4
        , VP_ID_APIBLOCK_OPTION_IF_ARG_5
        , VP_ID_APIBLOCK_OPTION_IF_ARG_6
        , VP_ID_APIBLOCK_OPTION_IF_USER_INPUT
        , VP_ID_APIBLOCK_OPTION_IF_PLUS
        , VP_ID_APIBLOCK_OPTION_IF_PLUS_USER_INPUT
        , VP_ID_APIBLOCK_OPTION_IF_DELETE

        , VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_1
        , VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_2
        , VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_2_M
        , VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_3
        , VP_ID_APIBLOCK_OPTION_LAMBDA_ARG_4
        
        , VP_ID_APIBLOCK_OPTION_WHILE_TYPE_SELECT
        , VP_ID_APIBLOCK_OPTION_WHILE_ARG 
        , VP_ID_APIBLOCK_OPTION_WHILE_ARG_1
        , VP_ID_APIBLOCK_OPTION_WHILE_ARG_2
        , VP_ID_APIBLOCK_OPTION_WHILE_ARG_3
        , VP_ID_APIBLOCK_OPTION_WHILE_ARG_4
        , VP_ID_APIBLOCK_OPTION_WHILE_ARG_5
        , VP_ID_APIBLOCK_OPTION_WHILE_ARG_6
        , VP_ID_APIBLOCK_OPTION_WHILE_ARG_7
        , VP_ID_APIBLOCK_OPTION_WHILE_PLUS
        , VP_ID_APIBLOCK_OPTION_WHILE_DELETE

        , VP_ID_APIBLOCK_LEFT_TAP_APILIST_PAGE
        , VP_ID_APIBLOCK_NODE_BLOCK_PLUS_BUTTON
        , VP_ID_APIBLOCK_TEXT_BLOCK_PLUS_BUTTON
        , VP_ID_APIBLOCK_BOARD_MAKE_NODE_BLOCK_INPUT
        , VP_ID_APIBLOCK_BOARD_MAKE_NODE_PATH

        , VP_APIBLOCK_BOARD_OPTION_PREVIEW_BUTTON
        , VP_APIBLOCK_BOARD_OPTION_CANCEL_BUTTON
        , VP_APIBLOCK_BOARD_OPTION_APPLY_BUTTON

        , VP_CLASS_PREFIX

        , VP_CLASS_BLOCK_GROUPBOX_PREFIX

        , VP_CLASS_BLOCK_CODETYPE_NAME
        , VP_CLASS_BLOCK_CONTAINER
        , VP_CLASS_BLOCK_SHADOWBLOCK_CONTAINER
        // , VP_CLASS_BLOCK_NULLBLOCK
        , VP_CLASS_BLOCK_NUM_INFO
        , VP_CLASS_BLOCK_SHADOWBLOCK
        , VP_CLASS_BLOCK_OPTION_BTN
        , VP_CLASS_BLOCK_DELETE_BTN
        , VP_CLASS_BLOCK_SUB_BTN_CONTAINER
        , VP_CLASS_BLOCK_DEPTH_INFO
        , VP_CLASS_BLOCK_CTRLCLICK_INFO
        , VP_CLASS_BLOCK_LEFT_HOLDER
        , VP_CLASS_BLOCK_BOTTOM_HOLDER
        , VP_CLASS_BLOCK_STYLE_BORDER_TOP_LEFT_RADIUS
        , VP_CLASS_BLOCK_STYLE_BORDER_BOTTOM_LEFT_RADIUS

        , VP_CLASS_APIBLOCK_OPTION_INPUT_REQUIRED
        , VP_CLASS_APIBLOCK_BODY
        , VP_CLASS_APIBLOCK_MAIN
        , VP_CLASS_APIBLOCK_BOARD_CONTAINER
        , VP_CLASS_APIBLOCK_BOARD
        , VP_CLASS_APIBLOCK_BUTTONS
        , VP_CLASS_APIBLOCK_OPTION_TAB
        , VP_CLASS_APIBLOCK_OPTION_TAB_CHILDS_OPTION
        , VP_CLASS_APIBLOCK_OPTION_NAME
        , VP_CLASS_APIBLOCK_SCROLLBAR
        , VP_CLASS_APIBLOCK_CODELINE_ELLIPSIS
        , VP_CLASS_APIBLOCK_OPTION_TAB_SELECTOR
        , VP_CLASS_APIBLOCK_BOTTOM_OPTIONAL_TAB_VIEW
        , VP_CLASS_APIBLOCK_MINIMIZE
        , VP_CLASS_APIBLOCK_ARROW_UP
        , VP_CLASS_APIBLOCK_ARROW_DOWN
        , VP_CLASS_APIBLOCK_TAB_NAVIGATION_NODE_OPTION_TITLE_SAPN
        , VP_CLASS_APIBLOCK_TAB_NAVIGATION_NODE_OPTION_CHILDS_TOP_TITLE_SAPN
        , VP_CLASS_APIBLOCK_BLOCK_HEADER
        , VP_CLASS_SELECTED_SHADOWBLOCK

        , VP_CLASS_APIBLOCK_MENU_BOX
        , VP_CLASS_APIBLOCK_MENU_ITEM

        , VP_CLASS_BLOCK_HEADER_PARAM
        , VP_CLASS_APIBLOCK_INPUT_PARAM
        , VP_CLASS_APIBLOCK_PARAM_PLUS_BTN
        , VP_CLASS_APIBLOCK_PARAM_DELETE_BTN
        , VP_CLASS_APIBLOCK_MENU_BTN
        , VP_CLASS_MAIN_CONTAINER
        , VP_CLASS_APIBLOCK_TITLE
        
        , VP_CLASS_APIBLOCK_OPTION_INPUT
        , VP_CLASS_APIBLOCK_NODEBLOCK_INPUT
        , VP_CLASS_APIBLOCK_NODEBLOCK
        , VP_CLASS_APIBLOCK_NODEBLOCK_TEXT
        , VP_CLASS_APIBLOCK_NODEBLOCK_TEXT_CONTAINER
        
        , VP_CLASS_STYLE_FLEX_ROW
        , VP_CLASS_STYLE_FLEX_ROW_CENTER
        , VP_CLASS_STYLE_FLEX_ROW_WRAP
        , VP_CLASS_STYLE_FLEX_ROW_CENTER_WRAP
        , VP_CLASS_STYLE_FLEX_ROW_BETWEEN
        , VP_CLASS_STYLE_FLEX_ROW_AROUND
        , VP_CLASS_STYLE_FLEX_ROW_EVENLY
        , VP_CLASS_STYLE_FLEX_ROW_BETWEEN_WRAP
        , VP_CLASS_STYLE_FLEX_ROW_END
        , VP_CLASS_STYLE_FLEX_COLUMN
        , VP_CLASS_STYLE_FLEX_COLUMN_CENTER
        , VP_CLASS_STYLE_FLEX_COLUMN_CENTER_WRAP
        , VP_CLASS_STYLE_MARGIN_TOP_5PX

        , VP_CLASS_STYLE_WIDTH_5PERCENT
        , VP_CLASS_STYLE_WIDTH_10PERCENT
        , VP_CLASS_STYLE_WIDTH_15PERCENT
        , VP_CLASS_STYLE_WIDTH_20PERCENT
        , VP_CLASS_STYLE_WIDTH_25PERCENT
        , VP_CLASS_STYLE_WIDTH_30PERCENT
        , VP_CLASS_STYLE_WIDTH_35PERCENT
        , VP_CLASS_STYLE_WIDTH_40PERCENT
        , VP_CLASS_STYLE_WIDTH_45PERCENT
        , VP_CLASS_STYLE_WIDTH_50PERCENT
        , VP_CLASS_STYLE_WIDTH_55PERCENT
        , VP_CLASS_STYLE_WIDTH_60PERCENT
        , VP_CLASS_STYLE_WIDTH_65PERCENT
        , VP_CLASS_STYLE_WIDTH_70PERCENT
        , VP_CLASS_STYLE_WIDTH_75PERCENT
        , VP_CLASS_STYLE_WIDTH_80PERCENT
        , VP_CLASS_STYLE_WIDTH_85PERCENT
        , VP_CLASS_STYLE_WIDTH_90PERCENT
        , VP_CLASS_STYLE_WIDTH_95PERCENT
        , VP_CLASS_STYLE_WIDTH_100PERCENT
        
        , VP_CLASS_STYLE_BGCOLOR_C4C4C4

        , VP_CLASS_STYLE_OPACITY_0
        , VP_CLASS_STYLE_OPACITY_1

        , VP_CLASS_STYLE_MARGIN_LEFT_5PX
        , VP_CLASS_STYLE_MARGIN_LEFT_10PX
        , VP_CLASS_STYLE_MARGIN_LEFT_15PX
        
        , VP_CLASS_STYLE_DISPLAY_BLOCK
        , VP_CLASS_STYLE_DISPLAY_NONE
        , VP_CLASS_STYLE_DISPLAY_FLEX

        , STR_CHANGE_KEYUP_PASTE
        , STR_INPUT_YOUR_CODE

        , STR_MSG_BLOCK_DELETED
        , STR_MSG_AUTO_GENERATED_BY_VISUALPYTHON
        , STR_MSG_BLOCK_DEPTH_MUSH_NOT_EXCEED_6

        , STR_ICON_ARROW_UP
        , STR_ICON_ARROW_DOWN

        , STR_TEXT_BLOCK_MARKDOWN_FUNCID
        , STR_SAMPLE_TEXT
        
        , STATE_state

        , STATE_metadata

        , STATE_classInParamList
        , STATE_className
        , STATE_parentClassName

        , STATE_defName
        , STATE_defInParamList
        , STATE_defReturnType

        , STATE_ifConditionList
        , STATE_elifConditionList

        , STATE_isIfElse
        , STATE_isForElse
        , STATE_forParam

        , STATE_whileBlockOptionType
        , STATE_whileConditionList

        , STATE_baseImportList
        , STATE_customImportList
        , STATE_isBaseImportPage

        , STATE_exceptConditionList
        
        , STATE_isFinally
        , STATE_returnOutParamList
        , STATE_codeLine

        , STATE_lambdaArg1
        , STATE_lambdaArg2List
        , STATE_lambdaArg3

        , COLOR_CLASS_DEF
        , COLOR_CONTROL
        , COLOR_API
        , COLOR_CODE

        , COLOR_CLASS_DEF_STRONG
        , COLOR_CONTROL_STRONG
        , COLOR_API_STRONG
        , COLOR_CODE_STRONG
        
        , COLOR_YELLOW
        , COLOR_WHITE
        , COLOR_BLOCK_ICON_BTN
        , COLOR_GRAY_input_your_code
        , COLOR_FOCUSED_PAGE
        , COLOR_BLACK
        , COLOR_LINENUMBER
        , COLOR_LIST

        , IMPORT_LIBRARY_LIST

        , PNG_VP_APIBLOCK_OPTION_ICON
        , PNG_VP_APIBLOCK_DELETE_ICON

        , API_BLOCK_PROCESS_PRODUCTION
        , API_BLOCK_PROCESS_DEVELOPMENT

        , ERROR_AB0001_REF_NULL_POINTER
        , ERROR_AB0002_INFINITE_LOOP

        , API_BLOCK_HTML_URL_PATH
        , API_BLOCK_INDEX_CSS

        , COMPARISON_OPERATOR
        , COMPARISON_OPERATOR_IF_ARG2
        , COMPARISON_OPERATOR_IF_ARG4
        , COMPARISON_OPERATOR_IF_ARG6

        , DEF_PARAM_TYPE_LIST

        , IMPORT_DEFAULT_DATA_LIST

        , APPS_CONFIG
    }
});
