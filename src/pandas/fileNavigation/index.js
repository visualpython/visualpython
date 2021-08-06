define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    //
    , 'nbextensions/visualpython/src/pandas/fileNavigation/state'
    , 'nbextensions/visualpython/src/pandas/fileNavigation/renderer' // 렌더링 수정
    , 'nbextensions/visualpython/src/pandas/fileNavigation/constData'
    , 'nbextensions/visualpython/src/pandas/fileNavigation/executor'
], function ( requirejs, $, vpCommon, vpConst, sb, vpFuncJS, FileNavigationState, FileNavigationRenderer, constData,
              executor) {

    const { executeKernelFromDirBody } = executor;
    const { NAVIGATION_DIRECTION_TYPE, FILE_NAVIGATION_TYPE } = constData;

    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "fileNavigation"
        , funcID : "JY900"  // TODO: ID 규칙 생성 필요
    }
    var vpFuncJS = new vpFuncJS.VpFuncJS(funcOptProp);

    var fileNavigationState;
    var fileNavigationRenderer;  

    // 시작
    var vp_init = function(importPackageThis, type) {

        fileNavigationState = new FileNavigationState();
        fileNavigationState.setFileOptionData(importPackageThis.state);
        fileNavigationState.setImportPackageThis(importPackageThis);
        fileNavigationState.setFileNavigationtype(type);
        // if file type is vp note
        if (importPackageThis.state.visualpythonFileName || importPackageThis.state.fileExtension == vpConst.VP_NOTE_EXTENSION) {
            fileNavigationState.setVisualPythonFileName(importPackageThis.state.visualpythonFileName);
        }
        // FIXME: 마크다운 이미지 불러오기 일 경우, 완료 트리거 설정
        if (type == FILE_NAVIGATION_TYPE.READ_IMG_FOR_MARKDOWN) {
            fileNavigationState.setTriggerName(importPackageThis.triggerName);
        }
        fileNavigationRenderer = new FileNavigationRenderer(fileNavigationState, vpFuncJS, importPackageThis.fileResultState);

        vpFuncJS.kernelExecuteV2(`%pwd`,(currentDirStr) => {
            var slicedCurrentDirStr = currentDirStr.slice(1, currentDirStr.length -1);
                slicedCurrentDirStr = slicedCurrentDirStr.replace(/\\/g, `/`);
      
            //** slicedCurrentDirStr = slicedCurrentDirStr.replaceAll("//","/"); 이 기능을 아래 logic으로 대체 */
            var cursor = 0;
            while (slicedCurrentDirStr[cursor] !== undefined ) {
                if(slicedCurrentDirStr[cursor] === "/" && slicedCurrentDirStr[cursor + 1] === "/") {
                    slicedCurrentDirStr = slicedCurrentDirStr.slice(0,cursor) + slicedCurrentDirStr.slice(cursor + 1,slicedCurrentDirStr.length);
                }
                cursor++;
            }
            fileNavigationState.pushDirHistoryStack(slicedCurrentDirStr);
          
            var splitedDirStrArr = slicedCurrentDirStr.split('/');
            /** 만약 현재 전체 path가 C:/Users/L.E.E/Desktop/Bit Python이라면,
             *  BaseFolderStr는  Bit Python
             *  BaseDirStr는  C:/Users/L.E.E/Desktop/Bit Python
             *  RelativePathStr는 Bit Python
             *  RelativePathStr는 파일 네비게이션 이동하면서 계속 달라진다
             */
            var rootFolderName = splitedDirStrArr[splitedDirStrArr.length - 1];
            var notebookPath = Jupyter.notebook.notebook_path;

            fileNavigationState.setBaseFolder(rootFolderName);
            fileNavigationState.setRelativeDir(rootFolderName);
            fileNavigationState.setBaseDir(slicedCurrentDirStr);

            var baseDirStr = fileNavigationState.getBaseDir();

            /** jupyter.notebook.notebook_path 의 값을 토대로
             *  notebookFolder 와 notebookPathStr을 생성
             *  만약 현재 전체 path가 C:/Users/L.E.E/Desktop/Bit Python이라면,
             *  Jupyter.notebook.notebook_path 는 Desktop/Bit Python
             *  notebookFolder는 Desktop
             *  notebookPathStr는 Desktop/Bit Python
             *  사용자가 위로 올라갈 수 있는 최상위 부모 폴더는 L.E.E
             */
            if (notebookPath.indexOf("/") !== -1) {
                var index = 0;
                while ( notebookPath[index] !== "/" ) {
                    if ( notebookPath[index] === undefined ) {
                        break;
                    }
                    index++;
                }
            
                var notebookFolder = notebookPath.substring(0, index);
                var index2 = baseDirStr.indexOf(notebookFolder);
                while (baseDirStr[index2] !== "/") {
                    if ( baseDirStr[index2] === undefined ) {
                        break;
                    }
                    index2++;
                }

                var notebookFullPathStr = baseDirStr.substring(0, index2);
                var index3 = notebookFullPathStr.indexOf(notebookFolder);
                var notebookPathStr = baseDirStr.substring(0, index3 - 1);

                fileNavigationState.setNotebookFolder(notebookFolder);
                fileNavigationState.setNotebookDir(notebookPathStr);
            } else {
  
                fileNavigationState.setNotebookFolder(rootFolderName);
                fileNavigationState.setNotebookDir(slicedCurrentDirStr);
            }

        });
        fileNavigationRenderer.initRender();
    }


    var vp_bindEventFunctions = function() {
        // 파일네비게이션을 닫았을때 실행되는 click 함수
        $('.fileNavigationPage-closedBtn').click(() => {
            fileNavigationState.resetStack();
            $('#vp_fileNavigation').remove();
            
            // 파일 네비게이션에서 생성된 script 파일 삭제
            vpCommon.removeHeadScript("fileNavigation");
            // vpCommon.removeHeadScript("successMessage");
        });

        // 사이드바 선택
        $('.fnp-sidebar-menu').click(function(event) {
            $('.fnp-sidebar-menu').removeClass('selected');
            $(this).addClass('selected');

            var pathType = $(this).attr('data-path');
            var dirObj = {
                direction: NAVIGATION_DIRECTION_TYPE.TO,
                destDir: '/'
            }
            switch (pathType) {
                case '/':
                    dirObj.direction = NAVIGATION_DIRECTION_TYPE.TOP;
                    break;
                case 'desktop':
                    dirObj.destDir = "_vp_get_desktop_path()";
                    dirObj.useFunction = true;
                    break;
                case 'documents':
                    dirObj.destDir = "_vp_get_documents_path()";
                    dirObj.useFunction = true;
                    break;
                case 'downloads':
                    dirObj.destDir = "_vp_get_downloads_path()";
                    dirObj.useFunction = true;
                    break;
                case 'userid':
                    dirObj.destDir = "_vp_get_userprofile_path()";
                    dirObj.useFunction = true;
                    break;
            }
            executeKernelFromDirBody(dirObj, fileNavigationRenderer);
        });
    
        // 다음(>) 디렉토리 클릭시 실행되는 함수
        $('.fileNavigationPage-btn-next').click(() => {
            if (fileNavigationState.stackCursor + 1 == fileNavigationState.getDirHistoryStack().length) {
                vpCommon.renderAlertModal('No next directory');
                return;
            }

            // initialize sidebar-menu selection
            $('.fnp-sidebar-menu').removeClass('selected');

            fileNavigationState.stackCursor++;

            var nextData = fileNavigationState.getNextDirHistoryStack();
            /** 그리고 만든 상위의 path를 파이썬 커널로 던진다 */
            var dirObj = {
                direction: NAVIGATION_DIRECTION_TYPE.PREV,
                destDir: nextData
            }  
            executeKernelFromDirBody(dirObj, fileNavigationRenderer);
        });
    
        // 이전(<) 디렉토리 검색 클릭시 실행되는 함수
        $('.fileNavigationPage-btn-prev').click(() => {
            if (fileNavigationState.stackCursor <= 0) {
                vpCommon.renderAlertModal('No previous directory');
                return;
            }

            // initialize sidebar-menu selection
            $('.fnp-sidebar-menu').removeClass('selected');

            fileNavigationState.stackCursor--;

            var popedData = fileNavigationState.popDirHistoryStackAndGetPopedData();
            var dirObj = {
                direction: NAVIGATION_DIRECTION_TYPE.PREV,
                destDir: popedData
            }
            executeKernelFromDirBody(dirObj, fileNavigationRenderer);         
        });
    }
   
    return {
        vp_init
        , vp_bindEventFunctions
    }
});
