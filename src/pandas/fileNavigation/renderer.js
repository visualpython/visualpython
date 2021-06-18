define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/vpMakeDom'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    //
    , 'nbextensions/visualpython/src/pandas/fileNavigation/api'
    , 'nbextensions/visualpython/src/pandas/fileNavigation/executor'
    , 'nbextensions/visualpython/src/pandas/fileNavigation/constData'
], function ( requirejs, $, vpCommon, vpMakeDom, sb,
              componentConstApi, executor, constData) {

    const { NAVIGATION_DIRECTION_TYPE
            , FILE_NAVIGATION_TYPE } = constData;

    // kernel executor에 필요한 함수 import
    const { executeKernelFromDirBody } = executor;

    // dom 만드는데 필요한 함수 import
    const { controlToggleInput } = componentConstApi;
    const { renderSpan, renderLi } = vpMakeDom;

    var FileNavigationRenderer = function(fileNavigationState, vpFuncJS, fileResultState) {
        this.fileNavigationState = fileNavigationState;
        this.vpFuncJS = vpFuncJS;
        this.fileResultState = fileResultState;
    }

    FileNavigationRenderer.prototype.getFileNavigationState = function() {
        return this.fileNavigationState;
    }

    // CSV 파일네비게이션 시작시 처음으로 렌더링하는 함수
    FileNavigationRenderer.prototype.initRender = function() {
        var fileNavigationRendererThis = this;
        var dirObj = {
            direction: NAVIGATION_DIRECTION_TYPE.INIT,
        }

        /** fileNavigation right tab에 현재 path의 폴더와 파일들 렌더링 */
        executeKernelFromDirBody(dirObj, fileNavigationRendererThis);

        /** 만약 타입이 'SAVE_FILE'일 경우' */
        var fileNavigationState = fileNavigationRendererThis.getFileNavigationState();
        var fileNavigationtype = fileNavigationState.getFileNavigationtype();
        var fileOptionData = fileNavigationState.getFileOptionData();

        /** Pandas > File IO > to_csv(), to_excel(), to_json(), to_pickle() 네비게이션 클릭시 */
        if(fileNavigationtype == FILE_NAVIGATION_TYPE.SAVE_FILE
            || fileNavigationtype == FILE_NAVIGATION_TYPE.SAVE_SNIPPETS){
            var saveFileDataBtn = $(`<button class='fileNavigationPage-btn-saveVisualPython'
                                             style='margin-left: 10px;'>Save</button>`);
            var cancelFileDataBtn = $(`<button class='fileNavigationPage-btn-cabcelVisualPython'
                                               style='margin-left: 10px;'>Cancel</button>`);
            var saveFileDataInput = $(`<input id='vp-fileNavigation' type='text' placeholder='Input file name' />`);
            var saveFileDataInput = $(vpCommon.formatString('<input id="{0}" type="text" placeholder="{1}" value="{2}" />'
                                                            , 'vp=fileNavigation', 'Input file name', fileNavigationState.getVisualPythonFileName()));
            $('.fileNavigationPage-button').append(saveFileDataInput);
            $('.fileNavigationPage-button').append(saveFileDataBtn);
            $('.fileNavigationPage-button').append(cancelFileDataBtn);

            controlToggleInput();
            $(saveFileDataInput).on('change keyup paste', function() {
                fileNavigationState.setVisualPythonFileName($(this).val());
            });
            
            /** 
             * 현재 디렉토리에 저장 버튼을 누르면 실행되는 이벤트 click 함수 
             */
            $(saveFileDataBtn).click(function(){
                if(fileNavigationState.getVisualPythonFileName() === ``){
                    vpCommon.renderAlertModal('Please input file name');
                    return;
                }
                var dirPath = fileNavigationRendererThis.makeNewCurrRelativePath();

                var fileName = `${fileNavigationState.getVisualPythonFileName()}`;
                if (fileName.indexOf('.' + fileOptionData.fileExtension) === -1) {
                    fileName += `.${fileOptionData.fileExtension}`;
                }

                fileNavigationRendererThis.selectFile(dirPath, fileName);
                fileNavigationState.resetStack();
            });

            $(cancelFileDataBtn).click(function(){
                fileNavigationState.resetStack();
                $('#vp_fileNavigation').remove();
                
                // 파일 네비게이션에서 생성된 script 파일 삭제
                vpCommon.removeHeadScript("fileNavigation");
            });
        }
    }

    /** */
    FileNavigationRenderer.prototype.renderCurrentDirPathInfoRightBody = function(dirInfoArr) {
     
        $('.fileNavigationPage-body').empty();
        var currentDirRootDom = $('.fileNavigationPage-body');
        var { folderArr, fileArr } = this.makeFolderOrFileDomArr(dirInfoArr);
        var fileNavigationPageUl = $(`<ul class='fileNavigationPage-ul'>
                                      </ul>`);
  
        folderArr.forEach(dom => {
            fileNavigationPageUl.append(dom);
        });
        fileArr.forEach(dom => {
            fileNavigationPageUl.append(dom);
        });
        currentDirRootDom.append(fileNavigationPageUl);
    }

    /** <div/> 태그 형식의 폴더 디렉토리를 만드는 함수 
     * @param {JSON} node
    */
    FileNavigationRenderer.prototype.makeFolderDom = function(node) {
        var fileNavigationRendererThis = this;

        var folderName = node.name;
        var folderPath = node.path;

        var directoryLi = renderLi({class: 'fileNavigationPage-li'});
        var directorySpan = renderSpan({class:'fileNavigationPage-column'});
        var directoryI = $(`<i class="fileNavigationPage-dir-text 
                                        item_icon 
                                        folder_icon 
                                        icon-fixed-width">
                                ${folderName}
                            </i>`);
        $(directoryI).click(function() {
            var dirObj = {
                direction: NAVIGATION_DIRECTION_TYPE.TO,
                destDir: folderPath
            }

            // initialize sidebar-menu selection
            $('.fnp-sidebar-menu').removeClass('selected');

            executeKernelFromDirBody(dirObj, fileNavigationRendererThis);
        });

        $(directoryLi).append($(directorySpan).append(directoryI));
        return directoryLi;
    }

    /**  <div/> 태그 형식의 파일 디렉토리를 만드는 함수
     * @param {JSON} node 
     */
    FileNavigationRenderer.prototype.makeFileDom = function(node) {
        var that = this;
        var fileNavigationState = this.getFileNavigationState();
        var fileName = node.name;

        var directoryLi = renderLi({class: 'fileNavigationPage-li'});
        var directoryI = $(`<i class="fileNavigationPage-dir-text 
                                        item_icon 
                                        file_icon 
                                        icon-fixed-width">
                                ${fileName}
                            </i>`);
        directoryI.click(function() {
            var dirPath = that.makeNewCurrRelativePath();
            var dataOption = fileNavigationState.getFileOptionData();
            var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
            if (Array.isArray(dataOption.fileExtension)) {
                // 확장자 여러개 입력되었을 경우
                // 확장자 목록에 포함되어있지 않을 경우
                if (!dataOption.fileExtension.includes(extension)) {
                    vpCommon.renderAlertModal('Not supported file type');
                    return;
                }
            } else {
                // Deprecated: 여러 항목 명시하지 않는 경우, 확장자 체크 제외
                // 확장자가 맞지 않는 경우
                // if (extension != dataOption.fileExtension) {
                //     vpCommon.renderAlertModal('Not ' + dataOption.fileExtension + ' file');
                //     return;
                // }
            }
            that.selectFile(dirPath, fileName);
        });

        directoryLi.append(directoryI);
        return directoryLi;
    }

    
    FileNavigationRenderer.prototype.makeFolderOrFileDomArr = function(dirInfoArr) {
        var fileNavigationRendererThis = this;

        var folderArr = [];
        var fileArr = [];

        var nodeInfo = { name:'', 
                         type:'' };
        // 디렉토리 정보가 담긴 자바스크립트 배열 dirInfoArr을 index 1부터 1씩 늘려가면서
        // 폴더인지 파일인지 확인후 html 태그를 만든다. 
        // index 0의 데이터는 현재 디렉토리가 담긴 별도의 특수 데이터라 건너 뛴다.
        var index = 1;
        while(index < dirInfoArr.length) {
            nodeInfo = dirInfoArr[index];
            var tempDom = null;
            // 디렉토리 정보가 폴더 일 경우
            if (nodeInfo.type === 'dir') {
                tempDom = fileNavigationRendererThis.makeFolderDom(nodeInfo);
                folderArr.push(tempDom);
            } else {
            // 디렉토리 정보가 파일 일 경우
                tempDom = fileNavigationRendererThis.makeFileDom(nodeInfo);
                fileArr.push(tempDom);
            }

            index++;
        }

        return {
            folderArr, fileArr
        }
    }

    FileNavigationRenderer.prototype.makeNewCurrRelativePath = function() {
        var fileNavigationState = this.getFileNavigationState();
        var dirPath = fileNavigationState.getRelativeDir();
        /** 
         *  만약 현재 전체 path가 C:/Users/L.E.E/Desktop/Bit Python이라면,
         *  baseFolder 변수에 Bit Python가 저장됨
         *  즉 파일 네비게이션을 연 시점의 폴더가 baseFolder 
         */
        var baseFolder = fileNavigationState.getBaseFolder();
        /** 
         *  만약 현재 전체 path가 C:/Users/L.E.E/Desktop/Bit Python이라면,
         *  Jupyter.notebook.notebook_path 는 'Desktop/Bit Python/Untitled4.ipynb' 
         *  noteBookFolder 변수에 Desktop가 저장됨
         *  즉 Jupyter.notebook.notebook_path의 폴더가 noteBookFolder
         */
        var noteBookFolder = fileNavigationState.getNotebookFolder();


        /** 파일 네비게이션을 실행한 baseFolder 이름이 현재 상대 경로에 있을때 */
        if (dirPath.indexOf(baseFolder) !== -1) {
            var baseFolderIndex = dirPath.indexOf(baseFolder);
            dirPath = dirPath.substring(baseFolderIndex,dirPath.length);
            dirPath = dirPath.replace(baseFolder, '');
        }
        
        /** 만약 baseFolder 이름과 noteBookFolder 이름이 동일하면 
         *  dirPath 안에 존재하는 noteBookFolder이름을  replace 하지 않음
         * */
        if (baseFolder !== noteBookFolder) {
            dirPath = dirPath.replace(noteBookFolder, '');
        }

        if (dirPath[0] === '/') {
            dirPath = dirPath.substring(1, dirPath.length);
        }
        return dirPath;
    }

    /**
     *  파일 네비게이션 위에 / Desktop / Bit Python 이런식으로 현재 디렉토리의 정보를 보여주는 메소드
     */
    FileNavigationRenderer.prototype.renderNowLocation = function(currentDirStr, currentRelativePathStr) {
        /** 이 메소드에서 사용할 state 데이터 가져오기 */
        var fileNavigationRendererThis = this;
        var fileNavigationState = this.getFileNavigationState();
        fileNavigationState.setRelativeDir(currentRelativePathStr);
        fileNavigationState.setCurrentDir(currentDirStr);

        var notebookPathStr = fileNavigationState.getNotebookDir();
        var notebookPathStrLength = notebookPathStr.length;
        var baseFolder = fileNavigationState.getBaseFolder();
        var notebookFolder = fileNavigationState.getNotebookFolder();
        /** 파일 네비게이션에 현재 path를 렌더링해서 보여주는 logic */
        var currentRelativePathStrArray = currentRelativePathStr.split('/');
        
        if (baseFolder === notebookFolder && Jupyter.notebook.notebook_path.indexOf('/') === -1) {
            var index = currentRelativePathStrArray.indexOf(baseFolder)
            currentRelativePathStrArray.splice(index,1);
        }

        var currentRelativePathDomElement = $(`<div><div>`);
        var basePathDomElement = $(`<span class='vp-filenavigation-nowLocation' value='/'> / </span>`);
        currentRelativePathDomElement.append(basePathDomElement);
        basePathDomElement.click(function() {
            var dirObj = {
                direction: NAVIGATION_DIRECTION_TYPE.TO,
                destDir: notebookPathStr
            }
            
            // initialize sidebar-menu selection
            $('.fnp-sidebar-menu').removeClass('selected');

            // fileNavigation body에 현재 path의 폴더와 파일들 렌더링
            executeKernelFromDirBody(dirObj, fileNavigationRendererThis);
        });

        var nestedLength = 0;
        currentRelativePathStrArray.forEach((pathToken,index) => {
            if (index === 0) {
                slashStr = '';
            } else {
                slashStr = '/';
            }

            var spanElement = $(`<span class='vp-filenavigation-nowLocation' value='${pathToken}'> 
                                    ${slashStr} ${pathToken}
                                </span>`);
            var pathLength = notebookPathStrLength + pathToken.length + 1 + nestedLength;
            spanElement.click(function() {
                var currentRelativePathStr = `${currentDirStr.substring(0, pathLength)}`;
     
                var dirObj = {
                    direction: NAVIGATION_DIRECTION_TYPE.TO,
                    destDir: currentRelativePathStr
                }

                // initialize sidebar-menu selection
                $('.fnp-sidebar-menu').removeClass('selected');
             
                // fileNavigation body에 현재 path의 폴더와 파일들 렌더링
                executeKernelFromDirBody(dirObj, fileNavigationRendererThis);
                
            });
            currentRelativePathDomElement.append(spanElement);
            nestedLength += pathToken.length + 1;
        });
             
        $('.fileNavigationPage-directory-nowLocation').empty();
        $('.fileNavigationPage-directory-nowLocation').append(currentRelativePathDomElement);
    }

    FileNavigationRenderer.prototype.selectFile = function(relativeDirPath, filePathStr) {
        var fileNavigationRendererThis = this;
        var fileNavigationState = fileNavigationRendererThis.getFileNavigationState();

        /** 상대 경로 string을 자르고 붙이는 로직 */
        var baseFolder = fileNavigationState.getBaseFolder();
        var baseDirStr = fileNavigationState.getBaseDir();
        var noteBookPathStr = fileNavigationState.getNotebookDir();
        var currentDirStr = fileNavigationState.getCurrentDir();
        var noteBookPathStrLength = noteBookPathStr.length;
       
        var baseDirStrLength = baseDirStr.length;

        /** upDirectoryCount는 파일 네비게이션을 연 시점의 path 경로 에서 
         *  얼마만큼 상위 path로 올라갔는지 횟수를 count하는 변수 
         */
        var upDirectoryCount = 0;
        var _upDirectoryCount = 0;

        var splitedNoteBookPathStrArray = noteBookPathStr.split('/');
        var splitedBaseDirArray = baseDirStr.split('/');
        var splitedCurrentDirArray  = currentDirStr.split('/');

        var relativeBaseDirArray = splitedBaseDirArray.slice(splitedNoteBookPathStrArray.length, splitedBaseDirArray.length);
        var relativeCurrentDirArray = splitedCurrentDirArray.slice(splitedNoteBookPathStrArray.length, splitedCurrentDirArray.length);

        /** 최초 파일 네비게이션을 연 시점의 path 경로와 Jupyter notebook의 path 경로를 비교하여
         *  최초 파일 네비게이션을 연 시점의 path에서 얼마만큼 상위로 올라가야 Jupyter notebook의 path 경로에 도달할 수 있는지 count
         */
        var _baseDirStrLength = baseDirStrLength;
        while ( noteBookPathStrLength < _baseDirStrLength ) {
            _baseDirStrLength--;
            if ( baseDirStr[_baseDirStrLength] === '/') {
                upDirectoryCount += 1;
            }
        }

        /** Jupyter notebook의 path 경로와 현재 이동한 path 경로를 비교하여
         *  Jupyter notebook의 path 경로에서 얼마만큼 하위로 내려와야 현재 이동한 path 경로에 도달할 수 있는지 count
         */
        relativeCurrentDirArray.forEach((forderName,index) => {
            if ( forderName === relativeBaseDirArray[index] ) {
                upDirectoryCount -= 1;
            }
        });
       
        /**upDirectoryCount의 숫자 만큼 '../'을 추가
         * upDirectoryCount의 숫자 만큼 다시말하면 '../'가 추가 된 만큼, 현재 path 폴더에서 상위 폴더로 이동했다는 의미.
         */
        _upDirectoryCount = upDirectoryCount;
        var prefixUpDirectory = ``;
        while (_upDirectoryCount-- > 0) {
            prefixUpDirectory += `../`;
        }

        var slashstr = `/`;
        if (relativeDirPath === '') {
            slashstr = '';
        }

        /** 최초의 path가 C:/Users/L.E.E/Desktop/Bit Python이라면, baseFolder는 Bit Python
         *  현재 이동한 시점의 path에서 baseFolder인 Bit Python가 존재하지 않을 때
         */
        var pathInput = '';
        var fileInput = `${filePathStr}`;
        if (upDirectoryCount > 0 
            && currentDirStr.indexOf(baseFolder) === -1) {
            /** 2020년 12월 21일 single quote 삭제 */
            pathInput = `${prefixUpDirectory}${relativeDirPath}${slashstr}${filePathStr}`;
            /** 현재 이동한 시점의 path에서 baseFolder인 Bit Python가 존재할 때 */
        } else {
            pathInput = `./${relativeDirPath}${slashstr}${filePathStr}`;
        }
        $(fileNavigationRendererThis.fileResultState.pathInputId).val(pathInput);
        $(fileNavigationRendererThis.fileResultState.fileInputId).val(fileInput);
        
        // vpCommon.renderSuccessMessage(filePathStr + ' selection ' + 'completed');
        
        /** 장안태 추가. 파일 선택 완료시 문서 이벤트 발동 */
        if (fileNavigationState.getFileNavigationtype() === FILE_NAVIGATION_TYPE.SAVE_FILE) {
            $(document).trigger({
                type: "fileSaveSelected.fileNavigation",
                file: fileInput,
                path: pathInput
            });
        } else {
            $(document).trigger({
                type: "fileReadSelected.fileNavigation",
                file: fileInput,
                path: pathInput
            });
        }

        /** Markdown 이미지 파일 선택 완료시 이벤트 발동 */
        // imgFileOpenForMarkdown.fileNavigation
        if (fileNavigationState.getFileNavigationtype() === FILE_NAVIGATION_TYPE.READ_IMG_FOR_MARKDOWN) {
            $(document).trigger({
                type: fileNavigationState.getTriggerName(),
                file: fileInput,
                path: pathInput
            })
        }

        /** Snippets 저장 후 이벤트 발동 */
        if (fileNavigationState.getFileNavigationtype() === FILE_NAVIGATION_TYPE.SAVE_SNIPPETS) {
            $(fileNavigationRendererThis.fileResultState.pathInputId).trigger({
                type: 'snippetSaved.fileNavigation',
                file: fileInput,
                path: pathInput
            });
        }
        /** Snippets 불러오기 후 이벤트 발동 */
        if (fileNavigationState.getFileNavigationtype() === FILE_NAVIGATION_TYPE.READ_SNIPPETS) {
            $(fileNavigationRendererThis.fileResultState.pathInputId).trigger({
                type: 'snippetRead.fileNavigation',
                file: fileInput,
                path: pathInput
            });
        }
   
        $('#vp_fileNavigation').remove();
        
        // 파일 네비게이션에서 생성된 script 파일 삭제
        vpCommon.removeHeadScript('fileNavigation');
    }

    return FileNavigationRenderer;
});
