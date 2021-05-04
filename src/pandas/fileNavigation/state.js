define([
    'nbextensions/visualpython/src/pandas/fileNavigation/constData'
], function (constData) {
    const { NAVIGATION_DIRECTION_TYPE } = constData;

    var FileNavigationState = function() {
        this.importPackageThis;
        this.fileNavigatiotype;
        this.baseDirStr = '';
        this.notebookPathStr = '';
        this.notebookFolder = '';
        this.currentDirStr = '';
        this.baseFolderStr = '';
        this.currentFolderStr = '';
        this.nodebookPathStr = '';
        this.relativePathStr = '';
        this.dirHistoryStack = [];
        this.stackCursor = -1;
        this.fileOptionData = {};
        this.visualpythonFileName = ``;
        this.triggerName = '';
    }

    /** ---------------------------------------------- 기본 메소드 ---------------------------------------------------- */
    FileNavigationState.prototype.setImportPackageThis = function(importPackageThis) {
        this.importPackageThis = importPackageThis;
    }

    FileNavigationState.prototype.getImportPackageThis = function() {
        return this.importPackageThis;
    }

    FileNavigationState.prototype.setFileNavigationtype = function(paramFileNavigatiotype) {
        this.fileNavigatiotype = paramFileNavigatiotype;
    }
    FileNavigationState.prototype.getFileNavigationtype = function() {
        return this.fileNavigatiotype;
    }

    /** ---------------------------------------------- dir string 관련 메소드 ---------------------------------------------------- */
    FileNavigationState.prototype.setBaseDir = function(paramBaseDirStr) {
        this.baseDirStr = paramBaseDirStr;
    }
    FileNavigationState.prototype.getBaseDir = function() {
        return this.baseDirStr;
    }

    FileNavigationState.prototype.setBaseFolder = function(paramBaseFolderStr) {
        this.baseFolderStr = paramBaseFolderStr;
    }
    FileNavigationState.prototype.getBaseFolder = function() {
        return this.baseFolderStr;
    }

    FileNavigationState.prototype.setCurrentDir = function(paramCurrentDirStr) {
        this.currentDirStr = paramCurrentDirStr;
    }
    FileNavigationState.prototype.getCurrentDir = function() {
        return this.currentDirStr;
    }

    FileNavigationState.prototype.setCurrentFolder = function(paramCurrentFolderStr) {
        this.currentFolderStr = paramCurrentFolderStr;
    }
    FileNavigationState.prototype.getCurrentFolder = function() {
        return this.currentFolderStr;
    }

    FileNavigationState.prototype.setRelativeDir = function(paramRelativePathStr) {
        this.relativePathStr = paramRelativePathStr;
    }
    FileNavigationState.prototype.getRelativeDir = function() {
        return this.relativePathStr;
    }

    FileNavigationState.prototype.setNotebookDir = function(notebookPathStr) {
        this.notebookPathStr = notebookPathStr;
    }
    FileNavigationState.prototype.getNotebookDir = function() {
        return this.notebookPathStr;
    }

    FileNavigationState.prototype.setVisualPythonFileName = function(visualpythonFileName) {
        this.visualpythonFileName = visualpythonFileName;
    }
    FileNavigationState.prototype.getVisualPythonFileName = function() {
        return this.visualpythonFileName;
    }

    FileNavigationState.prototype.setNotebookFolder = function(notebookFolder) {
        this.notebookFolder = notebookFolder; 
    }
    FileNavigationState.prototype.getNotebookFolder = function() {
        return this.notebookFolder;
    }

    /** -------------------------------------------- optionData 관련 메소드 --------------------------------------------- */
    /** 페이지의 optionData를 set합니다 */
    FileNavigationState.prototype.setFileOptionData = function(fileOptionData) {
        this.fileOptionData = fileOptionData;
    }
    /** 페이지의 optionData를 가져옵니다 */
    FileNavigationState.prototype.getFileOptionData = function() {
        return this.fileOptionData;
    }

    /** FIXME: 완료 트리거명 입력 */
    FileNavigationState.prototype.setTriggerName = function(triggerName) {
        this.triggerName = triggerName;
    }
    /** FIXME: 완료 트리거명 반환 */
    FileNavigationState.prototype.getTriggerName = function() {
        return this.triggerName;
    }

    /** --------------------------------------------- 이전 디렉토리 스택 관련 메소드 ------------------------------------------- */
    FileNavigationState.prototype.getDirHistoryStack = function() {
        return this.dirHistoryStack;
    }

    /** 
     * @param {Object} dirInfo 디렉토리 정보
     */
    FileNavigationState.prototype.pushDirHistoryStack = function(dirInfo) {

        this.dirHistoryStack = [ ...this.dirHistoryStack.slice(0,this.stackCursor + 1) , dirInfo
                                 , ...this.dirHistoryStack.slice(this.stackCursor + 1, this.dirHistoryStack.length) ];

        this.stackCursor++;
    }
    
    /** 디렉토리 스택에서 
     *  현재에서 다음 디렉토리의 정보를 가져옴  */
    FileNavigationState.prototype.getNextDirHistoryStack = function() {
        return this.dirHistoryStack[this.stackCursor];
    }

    /** 이전 디렉토리 검색 history stack에 최신 데이터를 pop합니다 */
    FileNavigationState.prototype.popDirHistoryStackAndGetPopedData = function() {
        var popStack = this.dirHistoryStack[this.stackCursor];
        return popStack;
    }

    /** 이전 디렉토리 검색 history stack을 리셋합니다  */
    FileNavigationState.prototype.resetStack = function() {
        this.dirHistoryStack = [];
    }

    /** 현재 이동한 경로를 history stack에 집어 넣고, 절대 경로를 상대 경로로 바꿔 저장한다. */
    FileNavigationState.prototype.splitPathStrAndSetStack = function(dirObj, resultInfoArr){
        var currentDirStr = resultInfoArr[0].current.split('//').join('/');
        var splitedDirStrArr = currentDirStr.split('/');
        var rootFolderName = splitedDirStrArr[splitedDirStrArr.length - 1];

        var firstIndex = currentDirStr.indexOf( this.getNotebookFolder() );

        var currentRelativePathStr = '';
        if ( firstIndex === -1 ) {
            currentRelativePathStr = currentDirStr.substring(this.getNotebookDir().length + 1, currentDirStr.length);
        } else {
            currentRelativePathStr = currentDirStr.substring(firstIndex, currentDirStr.length); 
        }

        if ( dirObj.direction === NAVIGATION_DIRECTION_TYPE.TOP 
             || dirObj.direction === NAVIGATION_DIRECTION_TYPE.TO ) {
            this.pushDirHistoryStack(currentDirStr);
        }

        return {
            currentDirStr,
            currentRelativePathStr,
            rootFolderName
        }
    }

    return FileNavigationState;
});
