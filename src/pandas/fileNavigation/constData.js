define([

], function () {

    /** 
        TOP 상위 디렉토리 검색
        TO 특정 폴더 디렉토리 검색
        PREV 이전 디렉토리 검색
        INIT 파일네비게이션 처음 시작할 때 기본 디렉토리 검색
    */
    const NAVIGATION_DIRECTION_TYPE = {
        TOP: 0,
        TO: 1,
        PREV: 2,
        INIT: 3
    }

    const FILE_EXTENSION_TYPE = {
        VP: 'vp'
        , CSS: 'css'
    }

    const FILE_NAVIGATION_TYPE = {
        SAVE_FILE: 'SAVE_FILE',
        READ_IMG_FOR_MARKDOWN: 'READ_IMG_FOR_MARKDOWN',
        SAVE_SNIPPETS: 'SAVE_SNIPPETS',
        READ_SNIPPETS: 'READ_SNIPPETS'
    }

    /**
     * 
     */
    const ENUM_FOLDER_DIRECTION = {
        IMPORT_CSV: 0,
        IMMORT_VisualPython: 1,
        SAVE_VisualPython: 2,
    }

    return {
        ENUM_FOLDER_DIRECTION
        , NAVIGATION_DIRECTION_TYPE
        , FILE_EXTENSION_TYPE
        , FILE_NAVIGATION_TYPE
    }
});