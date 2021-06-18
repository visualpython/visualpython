define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/vpMakeDom'
    , 'nbextensions/visualpython/src/common/kernelApi'
], function(requirejs, $, vpConst, sb, vpCommon, vpMakeDom, kernelApi) {
    
    const { renderSpan, renderLi } = vpMakeDom;


    // Temporary constant data
    const NAVIGATION_DIRECTION_TYPE = {
        TOP: 0,
        TO: 1,
        PREV: 2,
        INIT: 3
    }

    /**
     * @class FileNavigation
     * @param {string} type
     * @param {object} state
     * @constructor
     */
    var FileNavigation = function(type, state) {
        this.uuid = 'u' + vpCommon.getUUID();
        this.type = type;
        // state types
        this.state = {
            direction: '',
            fileType: '',
            filePath: '',
            fileName: '',
            extensions: [],
            showAll: false
        };
        this.state = { ...this.state, ...state };
        this.pathStack = [];

        this.searcher = new FileSearcher(this);
        this.searcher.getNowDirectory();

        // set extension using given file type
        this.setFileState(type);
    }

    /**
     * File Types
     */
    FileNavigation.FILE_TYPE = {
        SAVE_VP_NOTE: 'save_vp_note',
        OPEN_VP_NOTE: 'open_vp_note',
        SAVE_FILE: 'save_file',
        OPEN_FILE: 'open_file',
        SAVE_IMG_FILE: 'save_img_file',
        OPEN_IMG_FILE: 'open_img_file'
    }

    FileNavigation.FILE_TYPE_DISTRIBUTE = { 
        SAVE: [
            FileNavigation.FILE_TYPE.SAVE_VP_NOTE,
            FileNavigation.FILE_TYPE.SAVE_FILE,
            FileNavigation.FILE_TYPE.SAVE_IMG_FILE
        ],
        OPEN: [
            FileNavigation.FILE_TYPE.OPEN_VP_NOTE,
            FileNavigation.FILE_TYPE.OPEN_FILE,
            FileNavigation.FILE_TYPE.OPEN_IMG_FILE
        ]
    }

    FileNavigation.prototype.wrapSelector = function(selector) {
        return vpCommon.formatString('.{0} {1}', this.uuid, selector);
    }

    /**
     * 
     * @param {Array} arr fileExtensions list 
     */
    FileNavigation.prototype.setExtensions = function(arr) {
        this.state.extensions = arr;
    }

    FileNavigation.prototype.setFileState = function(type) {
        switch (type) {
            case FileNavigation.FILE_TYPE.SAVE_VP_NOTE:
            case FileNavigation.FILE_TYPE.OPEN_VP_NOTE:
                this.state.extensions = ['vp', 'txt'];
                break;
            case FileNavigation.FILE_TYPE.SAVE_IMG_FILE:
            case FileNavigation.FILE_TYPE.OPEN_IMG_FILE:
                this.state.extensions = ['png', 'jpg', 'jpeg', 'gif'];
                break;
            case FileNavigation.FILE_TYPE.SAVE_FILE:
            case FileNavigation.FILE_TYPE.OPEN_FILE:
                break;
        }
    }

    FileNavigation.prototype.pushPath = function(path) {
        this.state.pathStack.push(path);
        return true;
    }

    FileNavigation.prototype.popPath = function() {
        if (this.state.pathStack.length <= 0) {
            return undefined;
        }
        return this.state.pathStack.pop();
    }

    FileNavigation.prototype.init = async function() {
        var that = this;

        var loadURLstyle = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH;
        var loadURLhtml = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/fileNavigation/index.html";
        
        vpCommon.loadCss( loadURLstyle + "component/fileNavigation.css");

        await $(`<div id="vp_fileNavigation" class="${this.uuid}"></div>`).load(loadURLhtml, () => {  
            that.state.direction = NAVIGATION_DIRECTION_TYPE.INIT;
            var dirObj = {
                direction: that.state.direction,
                destDir: '.',
                useFunction: false
            }         
            that.renderThis(dirObj);
            that.bindEvent();

            $('#vp_fileNavigation.' + this.uuid).show();
        }).appendTo("#site");
    }

    FileNavigation.prototype.open = function() {
        this.init();
    }

    FileNavigation.prototype.close = function() {
        $('#vp_fileNavigation.' + this.uuid).remove();
        
        // 파일 네비게이션에서 생성된 script 파일 삭제
        vpCommon.removeHeadScript('fileNavigation');
    }

    FileNavigation.prototype.filterFileInfoArr = function(fileInfoArr) {
        var allowExtensionList = this.state.extensions;
        var filtered_varList = fileInfoArr.filter((data, index) => {
            if (index == 0) {
                return true;
            }

            if (data.type && data.type == 'dir') {
                // true if it is directory(folder)
                return true;
            } else {
                if (data.name) {
                    var extension = data.name.substring(data.name.lastIndexOf('.') + 1);
                    if (allowExtensionList.includes(extension)) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
        });

        // FIXME: 쓸 이유 없으면 삭제
        if (FileNavigation.FILE_TYPE_DISTRIBUTE.SAVE.includes(this.state.fileType)) {
            // save

        } else {
            // open

        }
        return filtered_varList;
    }

    FileNavigation.prototype.renderThis = function(dirObj) {
        var that = this;
        this.searcher.executeCurrentPath(dirObj, function(resultInfoArr) {
            console.log('resultInfoArr:', resultInfoArr);
            
            // get current dir
            var currentDirStr = resultInfoArr[0].current.split('//').join('/');
            that.state.currentDir = currentDirStr;

            var splitedDirStrArr = currentDirStr.split('/');
            var rootFolderName = splitedDirStrArr[splitedDirStrArr.length - 1];
    
            var firstIndex = currentDirStr.indexOf(that.searcher.state.notebookDir);

            var currentRelativePathStr = '';
            if ( firstIndex === -1 ) {
                currentRelativePathStr = currentDirStr.substring(that.searcher.state.notebookDir.length + 1, currentDirStr.length);
            } else {
                currentRelativePathStr = currentDirStr.substring(firstIndex, currentDirStr.length); 
            }

            // filter by fileType
            var filtered_varList = that.filterFileInfoArr(resultInfoArr);

            that.renderCurrentDirPathInfo(filtered_varList);
            that.renderNowLocation(currentDirStr, currentRelativePathStr);

        });
    }

    FileNavigation.prototype.renderNowLocation = function(currentDirStr, currentRelativePathStr) {
        // TODO: render Now location
    }

    /** */
    FileNavigation.prototype.renderCurrentDirPathInfo = function(dirInfoArr) {
     
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
     FileNavigation.prototype.makeFolderDom = function(node) {
        var that = this;

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

            that.renderThis(dirObj);
        });

        $(directoryLi).append($(directorySpan).append(directoryI));
        return directoryLi;
    }

    FileNavigation.prototype.renderSaveFileBox = function() {
        
    }

    /**  <div/> 태그 형식의 파일 디렉토리를 만드는 함수
     * @param {JSON} node 
     */
     FileNavigation.prototype.makeFileDom = function(node) {
        var that = this;
        var navigationState = this.state;
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
            var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
            var allowExtensionList = navigationState.extensions;
            // if it is not allowed extension
            if (!allowExtensionList.includes(extension)) {
                vpCommon.renderAlertModal('Not supported file type');
                return;
            }
            that.handleSelectFile(dirPath, fileName);
        });

        directoryLi.append(directoryI);
        return directoryLi;
    }

    
    FileNavigation.prototype.makeFolderOrFileDomArr = function(dirInfoArr) {
        var that = this;

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
                tempDom = that.makeFolderDom(nodeInfo);
                folderArr.push(tempDom);
            } else {
            // 디렉토리 정보가 파일 일 경우
                tempDom = that.makeFileDom(nodeInfo);
                fileArr.push(tempDom);
            }

            index++;
        }

        return {
            folderArr, fileArr
        }
    }

    FileNavigation.prototype.makeNewCurrRelativePath = function() {
        var searchState = this.searcher.state;
        var dirPath = searchState.relativeDir;
        /** 
         *  만약 현재 전체 path가 C:/Users/L.E.E/Desktop/Bit Python이라면,
         *  baseFolder 변수에 Bit Python가 저장됨
         *  즉 파일 네비게이션을 연 시점의 폴더가 baseFolder 
         */
        var baseFolder = searchState.baseFolder;
        /** 
         *  만약 현재 전체 path가 C:/Users/L.E.E/Desktop/Bit Python이라면,
         *  Jupyter.notebook.notebook_path 는 'Desktop/Bit Python/Untitled4.ipynb' 
         *  noteBookFolder 변수에 Desktop가 저장됨
         *  즉 Jupyter.notebook.notebook_path의 폴더가 noteBookFolder
         */
        var noteBookFolder = searchState.notebookFolder;


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

    FileNavigation.prototype.bindEvent = function() {
        var that = this;
        // close
        $(document).on('click', this.wrapSelector('.fileNavigationPage-closedBtn'), function() {
            that.close();
        });
    }

    FileNavigation.prototype.handleSelectFile = function(relativeDirPath, filePathStr) {
        var that = this;
        var state = this.searcher.state;

        /** relative path */
        var baseFolder = state.baseFolder;
        var baseDirStr = state.baseDir;
        var noteBookPathStr = state.notebookDir;
        var currentDirStr = state.currentDir;

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
        if (upDirectoryCount > 0 
            && currentDirStr.indexOf(baseFolder) === -1) {
            /** 2020년 12월 21일 single quote 삭제 */
            console.log('path', `${prefixUpDirectory}${relativeDirPath}${slashstr}${filePathStr}`);
            console.log('file', `${filePathStr}`);

            this.resultState.path = `${prefixUpDirectory}${relativeDirPath}${slashstr}${filePathStr}`;
            this.resultState.file = `${filePathStr}`;
        /** 현재 이동한 시점의 path에서 baseFolder인 Bit Python가 존재할 때 */
        } else {
            console.log('path', `./${relativeDirPath}${slashstr}${filePathStr}`);
            console.log('file', `${filePathStr}`);

            this.resultState.path = `./${relativeDirPath}${slashstr}${filePathStr}`;
            this.resultState.file = `${filePathStr}`;
        }

        this.close();
    }

    var FileSearcher = function(navigation) {
        this.navigation = navigation;
        this.state = {
            currentDir: '',

            baseFolder: '',
            baseDir: '',
            relativeDir: '',
            
            notebookFolder: '',
            notebookDir: ''
        }
    }

    FileSearcher.prototype.getNowDirectory = function() {
        var that = this;
        kernelApi.executePython('%pwd', (currentDirStr) => {
            that.state.currentDir = currentDirStr;
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
          
            var splitedDirStrArr = slicedCurrentDirStr.split('/');
            /** 만약 현재 전체 path가 C:/Users/L.E.E/Desktop/Bit Python이라면,
             *  BaseFolderStr는  Bit Python
             *  BaseDirStr는  C:/Users/L.E.E/Desktop/Bit Python
             *  RelativePathStr는 Bit Python
             *  RelativePathStr는 파일 네비게이션 이동하면서 계속 달라진다
             */
            var rootFolderName = splitedDirStrArr[splitedDirStrArr.length - 1];
            var notebookPath = Jupyter.notebook.notebook_path;

            that.state.baseFolder = rootFolderName;
            that.state.relativeDir = rootFolderName;
            that.state.baseDir = slicedCurrentDirStr;

            var baseDirStr = slicedCurrentDirStr;

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

                that.state.notebookFolder = notebookFolder;
                that.state.notebookPath = notebookPathStr;
            } else {
                that.state.notebookFolder = rootFolderName;
                that.state.notebookPath = slicedCurrentDirStr;
            }
        })
    }

    FileSearcher.prototype.makeSearchCommand = function(path, useFunction = false) {
        if (path === '') {
            path = '.';
        }
        if (!useFunction) {
            path = "'" + path + "'";
        }
        path = path.replace('\\', '\\\\');
        var sbCode = new sb.StringBuilder();
        sbCode.appendFormat("_vp_print(_vp_search_path({0}))", path);
        return sbCode.toString();
    }

    /**
     * 
     * @param {Object} dirObj {direction, destDir, useFunction} 
     */
    FileSearcher.prototype.executeCurrentPath = function(dirObj, callback) {
        const { destDir, useFunction } = dirObj;
        var currentPathStr = this.makeSearchCommand(destDir, (useFunction? true: false));
        var fileNavigationState = this.navigation.state;
        kernelApi.executePython(currentPathStr, (result) => {
            var varList = JSON.parse(result);

            /** 폴더나 파일 이름에 . 이 들어간 폴더, 파일 제거 */
            var filterd_varList = varList.filter(data => {
                if (data.name && data.name[0] == '.') {
                    return false;
                } else {
                    return true;
                }
            /** 오름차순으로 가져옴 */
            }).sort((a,b) => {
                return a - b;
            });

            callback(filterd_varList);
        })
    }

    return FileNavigation;
});