/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : FileNavigation.js
 *    Author          : Black Logic
 *    Note            : File navigation
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] FileNavigation
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/component/fileNavigation.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/component/fileNavigation'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/component/LoadingSpinner',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/Component'
], function(fileNaviHtml, fileNaviCss, LoadingSpinner, com_Const, com_String, com_util, Component) {
    // Temporary constant data
    const NAVIGATION_DIRECTION_TYPE = {
        TOP: 0,
        TO: 1,
        PREV: 2,
        INIT: 3
    }

    /**
     * FileNavigation
     * ------------------------------------------------------
     * How to use: 
     * // create file navigation
     * let fileNavigation = new FileNavigation({ 
     *          type: 'open', 
     *          extensions: ['vp'], 
     *          finish: function(filesPath, status, error) {
     *              // Do something after selecting file
     *          }});
     * // open file navigation
     * fileNavigation.open(); 
     */
    class FileNavigation extends Component {
        /**
         * Constructor
         * @param {Object} state { type, extensions, finish ... }
         */
        constructor(state) {
            super($(vpConfig.parentSelector), state);
            /**
             * state.type           open / save
             * state.extensions     extensions list
             * state.finish         callback function after selection
             * - example form : function (filesPath, status, error) { }
             * - filesPath    : list    => list of Object [ { file: '', path: '' } ]
             * - status       : boolean => true for success / false for error
             * - error        : if there's error, return its content
             * ---------------------------------------------------------------
             * state.fileName       (optional on save type) pre-defined fileName
             * state.multiSelect    (optional)
             * state.showAll        (optional)
             */
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'FileNavigation created', state);
        }
        _init() {
            super._init();
            /** Write codes executed before rendering */
            // state types
            this.state = {
                direction: '',
                type: '',           // open / save
                filePath: '',
                fileName: '',
                extensions: [],     // extensions list ex) png, jpg, gif
                multiSelect: false, // multi selection
                showAll: false,     // show other extension files also
                finish: null,        // callback after selection
                ...this.state
            };
            
            this.pathStackPointer = -1;
            this.pathStack = [];
            this.currentFileList = [];

            this.pathState = {
                parentPath: '',
                currentPath: '',
                baseFolder: '',     // root folder name
                relativeDir: '',    // root folder name
                baseDir: '',        // sliced current dir
                notebookFolder: '', // base folder of jupyter notebook path
                notebookPath: ''    // jupyter notebook path
            }
        }

        _bindEvent() {
            var that = this;
            // Close file navigation
            $(this.wrapSelector('.fileNavigationPage-closedBtn')).on('click', function() {
                that.close();
            });

            // Click root
            $(this.wrapSelector('#fnpRootFolder')).on('click', function() {
                var dirObj = {
                    direction: NAVIGATION_DIRECTION_TYPE.TOP,
                    destDir: '/'
                };
                that.getFileList(dirObj);
            });

            // Click sidebar
            $(this.wrapSelector('.fnp-sidebar-menu')).click(function(event) {
                $('.fnp-sidebar-menu').removeClass('selected');
                $(this).addClass('selected');

                var pathType = $(this).attr('data-path');
                var dirObj = {
                    direction: NAVIGATION_DIRECTION_TYPE.TO,
                    destDir: '/'
                }
                switch (pathType) {
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
                    case 'drive':
                        dirObj.destDir = "/content/drive/MyDrive";
                        break;
                    case '/':
                    default:
                        dirObj.direction = NAVIGATION_DIRECTION_TYPE.TOP;
                        break;
                }
                that.getFileList(dirObj);
            });

            // Click next(>) directory
            $(this.wrapSelector('.fileNavigationPage-btn-next')).click(() => {
                if (that.pathStackPointer + 1 == that.pathStack.length) {
                    com_util.renderAlertModal('No next directory');
                    return;
                }

                // initialize sidebar-menu selection
                $('.fnp-sidebar-menu').removeClass('selected');

                // get next path stack
                that.pathStackPointer++;
                var nextData = that.pathStack[that.pathStackPointer];

                var dirObj = {
                    direction: NAVIGATION_DIRECTION_TYPE.PREV,
                    destDir: nextData
                }  
                that.getFileList(dirObj);
            });
        
            // Click prev(<) directory
            $(this.wrapSelector('.fileNavigationPage-btn-prev')).click(() => {
                if (that.pathStackPointer <= 0) {
                    com_util.renderAlertModal('No previous directory');
                    return;
                }

                // initialize sidebar-menu selection
                $('.fnp-sidebar-menu').removeClass('selected');

                // get prev path stack
                that.pathStackPointer--;
                var popedData = that.pathStack[that.pathStackPointer];

                var dirObj = {
                    direction: NAVIGATION_DIRECTION_TYPE.PREV,
                    destDir: popedData
                }
                that.getFileList(dirObj);       
            });
        }

        template() {
            /** Implement generating template */
            let fileNaviBody = $(fileNaviHtml.replaceAll('${vp_base}', com_Const.BASE_PATH));
            $(fileNaviBody).find('.fnp-sidebar-menu').hide();
            if (vpConfig.extensionType === 'notebook') {
                $(fileNaviBody).find('.fnp-sidebar-menu.notebook').show();
            } else if (vpConfig.extensionType === 'colab') {
                $(fileNaviBody).find('.fnp-sidebar-menu.colab').show();
            } else if (vpConfig.extensionType === 'lab') {
                $(fileNaviBody).find('.fnp-sidebar-menu.lab').show();
            }
            return fileNaviBody;
        }

        /**
         * Render file item
         * @param {*} fileState { name, type, path, size, atime, mtime }
         *  - name : file name
         *  - type : file type (dir / file)
         *  - path : file absolute path
         *  - size : size (format: 0.0{B,KB,MB,...})
         *  - atime : created time (format: YYYY-MM-DD HH:mm)
         *  - mtime : modified time (format: YYYY-MM-DD HH:mm)
         */
        renderFileItem(fileState) {
            let {
                name, type, path, size, atime, mtime
            } = fileState;
            let that = this;

            let directoryLi = $('<li class="fileNavigationPage-li"></li>');
            let directoryI = $(`<i class="fileNavigationPage-dir-text 
                                            item_icon 
                                            ${type=='dir'?'folder':'file'}_icon 
                                            icon-fixed-width"
                                    data-type="${type}"
                                    data-path="${path}"
                                    data-size="${size}"
                                    data-atime="${atime}"
                                    data-mtime="${mtime}">
                                    ${name}
                                </i>`);
            directoryI.click(function() {
                if (type == 'dir') {
                    var dirObj = {
                        direction: NAVIGATION_DIRECTION_TYPE.TO,
                        destDir: path
                    }
        
                    // initialize sidebar-menu selection
                    $('.fnp-sidebar-menu').removeClass('selected');
        
                    that.getFileList(dirObj);
                } else {
                    let dirPath = that.getRelativePath(that.pathState.baseDir, that.pathState.currentPath);
                    let extension = name.substring(name.lastIndexOf('.') + 1);
                    let allowExtensionList = that.state.extensions;
                    // if it is not allowed extension
                    if (!allowExtensionList.includes(extension)) {
                        // TODO: alert
                        //vpCommon.renderAlertModal('Not supported file type');
                        return;
                    }
                    
                    that.handleSelectFile(dirPath, name);
                }
            });
    
            directoryLi.append(directoryI);
            return directoryLi;
        }

        /**
         * render file list based on currentFileList
         */
        renderFileList() {
            let that = this;
            let fileList = this.currentFileList;
            // clear body
            $(this.wrapSelector('.fileNavigationPage-body')).html('');

            // render file items
            let dirArr = [];
            let fileArr = [];

            // render upper folder
            if (that.pathState.parentPath != '') {
                let upperFolderTag = that.renderFileItem({
                    name: '..',
                    type: 'dir',
                    path: that.pathState.parentPath,
                    size: '',
                    atime: '',
                    mtime: ''
                });
                dirArr.push(upperFolderTag);
            }

            fileList && fileList.forEach((file, idx) => {
                if (idx == 0) return;
                let fileTag = that.renderFileItem(file);
                if (file.type == 'dir') {
                    dirArr.push(fileTag);
                } else {
                    fileArr.push(fileTag);
                }
            });

            var fileNavigationPageUl = $(`<ul class='fileNavigationPage-ul'></ul>`);
            // render folder first
            dirArr.forEach(dirTag => {
                fileNavigationPageUl.append(dirTag);
            });

            fileArr.forEach(fileTag => {
                fileNavigationPageUl.append(fileTag);
            });

            $(this.wrapSelector('.fileNavigationPage-body')).append(fileNavigationPageUl);

        }

        renderNowLocation() {
            let that = this;
            let currentRelativePathStr = this.pathState.relativeDir;
            let currentDirStr = this.pathState.currentPath;
            var notebookPathStr = this.pathState.notebookPath;
            var notebookPathStrLength = notebookPathStr.length;
            var baseFolder = this.pathState.baseFolder;
            var notebookFolder = this.pathState.notebookFolder;
            /** render current path */
            var currentRelativePathStrArray = currentRelativePathStr.split('/');
            
            if (baseFolder === notebookFolder && vpKernel.getNotebookPath().indexOf('/') === -1) {
                var index = currentRelativePathStrArray.indexOf(baseFolder)
                if (index >= 0) {
                    currentRelativePathStrArray.splice(index,1);
                }
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

                // render current file/dir list in fileNavigation body
                that.getFileList(dirObj, this);
            });

            var nestedLength = 0;
            // if it's outside of notebookPath, ignore notebookPath
            var prevLength = notebookPathStrLength;
            var useSidebar = false;
            if (currentRelativePathStr.includes('..')) {
                var upperList = currentRelativePathStr.match(/(\.\.\/)/g);
                if (upperList && upperList.length > 0) {
                    // in case, currentRelativePathStr = ../../somePathHere
                    prevLength -= upperList.length * 3; // 3 = length of '../' upper path string
                    useSidebar = true;
                } else {
                    // in case, currentRelativePathStr = .. 
                    prevLength = 0;
                    useSidebar = true;
                }
            }
            let slashStr = '/';
            currentRelativePathStrArray.forEach((pathToken,index) => {
                if (index === 0) {
                    slashStr = '';
                } else {
                    slashStr = '/';
                }

                var spanElement = $(`<span class='vp-filenavigation-nowLocation' value='${pathToken}'> 
                                        ${slashStr} ${pathToken}
                                    </span>`);
                
                var pathLength = prevLength + pathToken.length + 1 + nestedLength;
                spanElement.click(function() {
                    var currentRelativePathStr = `${currentDirStr.substring(0, pathLength)}`;
        
                    var dirObj = {
                        direction: NAVIGATION_DIRECTION_TYPE.TO,
                        destDir: currentRelativePathStr
                    }

                    // initialize sidebar-menu selection
                    $('.fnp-sidebar-menu').removeClass('selected');
                
                    // render current file/dir list in fileNavigation body
                    that.getFileList(dirObj, this);
                });
                currentRelativePathDomElement.append(spanElement);
                nestedLength += pathToken.length + 1;
            });
                
            $('.fileNavigationPage-directory-nowLocation').empty();
            $('.fileNavigationPage-directory-nowLocation').append(currentRelativePathDomElement);
        }

        renderSaveBox() {
            let page = new com_String();
            page.appendFormatLine('<input id="{0}" type="text" class="vp-input" placeholder="{1}" value="{2}"/>'
                                , 'vp_fileNavigationInput', 'New File Name', this.state.fileName);
            page.appendFormatLine('<select id="{0}" class="vp-select">', 'vp_fileNavigationExt');
            this.state.extensions.forEach(ext => {
                page.appendFormatLine('<option value="{0}">{1}</option>', ext, ext);
            });
            page.appendLine('</select>');
            page.appendFormatLine('<button class="{0} vp-button" data-menu="{1}">{2}</button>', 'vp-filenavi-btn', 'select', 'Select');
            $('.fileNavigationPage-button').html(page.toString());

            let that = this;
            // bind filename change event
            $(this.wrapSelector('#vp_fileNavigationInput')).on('change', function() {
                let fileName = $(this).val();
                let filePath = that.getRelativePath(that.pathState.baseDir, that.pathState.currentPath);
                
                that.handleSelectFile(filePath, fileName);
            });
            // bind save cancel event
            $(this.wrapSelector('.vp-filenavi-btn')).on('click', function() {
                let menu = $(this).data('menu');
                if (menu == 'select') {
                    // select file
                    let { fileName, filePath } = that.state;
                    let selectedExt = $(that.wrapSelector('#vp_fileNavigationExt')).val();
                    let fileExtIdx = fileName.lastIndexOf('.');
                    // if no extension, add it
                    if (selectedExt != '' && (fileExtIdx < 0 || fileName.substring(fileExtIdx + 1) != selectedExt)) {
                        fileName += '.' + selectedExt;
                    }
                    // no path, set it
                    if (filePath == '') {
                        filePath = './' + fileName;
                    }
                    fileExtIdx = filePath.lastIndexOf('.');
                    if (selectedExt != '' && (fileExtIdx < 0 || filePath.substring(fileExtIdx + 1) != selectedExt)) {
                        filePath += '.' + selectedExt;
                    }

                    // Manage result using finish function
                    let filesPath = [{ file: fileName, path: filePath }]; //FIXME: fix it if multiple selection implemented
                    let status = true;
                    let error = null;
                    vpLog.display(VP_LOG_TYPE.DEVELOP, 'fileNavigation finished saving', filesPath, status, error);
                    that.state.finish(filesPath, status, error);

                    // cancel file navigation
                    that.close();
                }
            });
        }

        loadFileList() {
            this.renderNowLocation();
            this.renderFileList();
        }

        render() {
            super.render();
            let that = this;
            /** Implement after rendering */
            // if save mode
            if (this.state.type == 'save') {
                // render saving box
                this.renderSaveBox();
            }

            // get current path
            this.getCurrentDirectory().then(function(currentPath) {
                that.pathState.currentPath = currentPath;
                that.makePaths(currentPath);
                // get file list of current path
                that.getFileList({ direction: NAVIGATION_DIRECTION_TYPE.INIT, destDir: currentPath});
            })
        }

        open() {
            $(this.wrapSelector()).show();
        }

        close() {
            $(this.wrapSelector()).remove();
        }

        //============================================================================
        // File & Path control
        //============================================================================
        handleSelectFile(relativeDirPath, filePathStr) {
            var fileNavigationState = this.pathState;

            var baseFolder = fileNavigationState.baseFolder;
            var currentDirStr = fileNavigationState.currentPath;

            var slashstr = `/`;
            if (relativeDirPath === '') {
                slashstr = '';
            }

            var pathInput = '';
            var fileInput = `${filePathStr}`;
            // if baseFolder doesn't exist in current path
            if (currentDirStr.indexOf(baseFolder) === -1) {
                
                pathInput = `${relativeDirPath}${slashstr}${filePathStr}`;
            } else {
                // if baseFolder exists in current path
                pathInput = `./${relativeDirPath}${slashstr}${filePathStr}`;
            }

            //============================================================================
            // Set selection result
            //============================================================================
            if (this.state.type == 'save') {
                // add as saving file
                this.setSelectedFile(fileInput, pathInput);
            } else {
                // Manage result using finish function
                let filesPath = [{ file: fileInput, path: pathInput }]; //FIXME: fix it if multiple selection implemented
                let status = true;
                let error = null;
                vpLog.display(VP_LOG_TYPE.DEVELOP, 'fileNavigation finished', filesPath, status, error);
                this.state.finish(filesPath, status, error);
        
                // remove and close file navigation
                this.close();
            }
        }
        getCurrentDirectory() {
            return vpKernel.getCurrentDirectory();
        }

        /**
         * Get File/Dir list
         * @param {Object} dirObj { direction, destDir, useFunction }
         *  - direction   : TO, PREV, TOP, INIT
         *  - destDir     : path to search
         *  - useFunction : boolean (true if use given path (Desktop, Downloads, User, ...))
         * @returns Promise(result)
         */
        getFileList(dirObj) {
            let that = this;
            let { direction, destDir, useFunction } = dirObj;
            if (direction === NAVIGATION_DIRECTION_TYPE.TO 
                || direction === NAVIGATION_DIRECTION_TYPE.PREV) {
                    ;
            }
            else if (direction === NAVIGATION_DIRECTION_TYPE.TOP) {
                destDir = '..';
            } else {
                destDir = '.';
            }
            // loading
            let loadingSpinner = new LoadingSpinner($(this.wrapSelector('.fileNavigationPage-directory-container')));
            // get file list using kernel
            return vpKernel.getFileList(destDir, useFunction).then(function(result) {
                /** Caution : if change code "$1" to '$1' as single quote, json parsing error occurs */
                var jsonVars = result.replace(/'([^']+)': /g, `"$1": `);        // object front
                jsonVars = jsonVars.replace(/: '([^']+)'([,}])/g, `: "$1"$2`);  // object back
                jsonVars = jsonVars.replace(/\\/g, `/`);
                var varList = JSON.parse(jsonVars);

                /** remove file/dir which starts with . */
                var filtered_varList = varList.filter(data => {
                    if (data.name && data.name[0] == '.') {
                        return false;
                    } else {
                        return true;
                    }
                }).sort((a,b) => {
                    /** sort ascending */
                    return a - b;
                });

                /**
                 * Filter file/dir which included in this.state.extensions
                 */
                if (Array.isArray(that.state.extensions) && that.state.extensions.length > 0 && that.state.extensions.toString() !== '') {
                    filtered_varList = filtered_varList.filter((data, index) => {
                        if (index == 0) {
                            return true;
                        }

                        if (data.type && data.type == 'dir') {
                            // if file, just show
                            return true;
                        } else if (data.name) {
                            var extension = data.name.substring(data.name.lastIndexOf('.') + 1);
                            if (that.state.extensions.includes(extension)) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    });
                }

                vpLog.display(VP_LOG_TYPE.DEVELOP, 'FileNavigation - getFileList: ', filtered_varList);

                var { currentDirStr,  currentRelativePathStr } = that.splitPathStrAndSetStack(dirObj, filtered_varList);
                if (filtered_varList[0].current === filtered_varList[0].parent) {
                    // no parent
                    that.pathState.parentPath = '';
                } else {
                    that.pathState.parentPath = filtered_varList[0].parent; // parent path
                }
                that.pathState.relativeDir = currentRelativePathStr;
                that.pathState.currentPath = currentDirStr;
                that.currentFileList = filtered_varList;

                that.loadFileList();
            }).catch(function(resultObj) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'FileNavigation error', resultObj);

                let { msg, result } = resultObj;
                // show error using alert
                
                if (msg.content.evalue) {
                    let resultStr = msg.content.evalue;
                    //t.match(/\[Errno [0-9]+?\] (.*)/)[1]
                    // get error message from traceback
                    let alertMsg = resultStr.match(/\[Errno [0-9]+?\] (.*)/)[1];
                    com_util.renderAlertModal(alertMsg);
                }
            }).finally(function() {
                loadingSpinner.remove();
            });
        }

        /**
         * Get current path and set pathStates
         * @param {String} currentDirStr 
         */
        makePaths(currentDirStr) {
            var slicedCurrentDirStr = currentDirStr.slice(1, currentDirStr.length -1);
                slicedCurrentDirStr = slicedCurrentDirStr.replace(/\\/g, `/`);
      
            // slicedCurrentDirStr = slicedCurrentDirStr.replaceAll("//","/"); // replace with codes below
            var cursor = 0;
            while (slicedCurrentDirStr[cursor] !== undefined ) {
                if(slicedCurrentDirStr[cursor] === "/" && slicedCurrentDirStr[cursor + 1] === "/") {
                    slicedCurrentDirStr = slicedCurrentDirStr.slice(0,cursor) + slicedCurrentDirStr.slice(cursor + 1,slicedCurrentDirStr.length);
                }
                cursor++;
            }
          
            var splitedDirStrArr = slicedCurrentDirStr.split('/');
            /** 
             *  ex) if current path is 'C:/Users/VP/Desktop/Test'
             *      BaseFolderStr = 'Test'
             *      BaseDirStr = 'C:/Users/VP/Desktop/Test'
             *      RelativePathStr = 'Test'
             *      RelativePathStr changes when moving through paths
             */
            var rootFolderName = splitedDirStrArr[splitedDirStrArr.length - 1];
            var notebookPath = vpKernel.getNotebookPath();

            this.pathState.baseFolder = rootFolderName;
            this.pathState.relativeDir = rootFolderName;
            this.pathState.baseDir = slicedCurrentDirStr;

            var baseDirStr = slicedCurrentDirStr;

            /** 
             *  Generate notebookFolder, notebookPathStr using Jupyter.notebook.notebook_path
             *  ex) if current path is 'C:/Users/VP/Desktop/Test'
             *      Jupyter.notebook.notebook_path = 'Desktop/Test'
             *      notebookFolder = 'Desktop'
             *      notebookPathStr = 'Desktop/Test'
             *      Very root folder is 'VP'
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

                this.pathState.notebookFolder = notebookFolder;
                this.pathState.notebookPath = notebookPathStr;
            } else {
                this.pathState.notebookFolder = rootFolderName;
                this.pathState.notebookPath = slicedCurrentDirStr;
            }
        }

        splitPathStrAndSetStack(dirObj, resultInfoArr){
            var currentDirStr = resultInfoArr[0].current.split('//').join('/');
            var splitedDirStrArr = currentDirStr.split('/');
            var rootFolderName = splitedDirStrArr[splitedDirStrArr.length - 1];
    
            var firstIndex = currentDirStr.indexOf( this.pathState.notebookFolder );
    
            var currentRelativePathStr = '';
            if ( firstIndex === -1 ) {
                var notebookDir = this.pathState.notebookPath; //TEST:
                // FIXME: if current path is upper than Jupyter Home, send no permission?
                // currentRelativePathStr = currentDirStr.substring(this.getNotebookDir().length + 1, currentDirStr.length);
                // currentRelativePathStr = this.getRelativePath(notebookDir, currentDirStr);
                var baseDir = this.pathState.baseDir;
                currentRelativePathStr = this.getRelativePath(baseDir, currentDirStr);
            } else {
                currentRelativePathStr = currentDirStr.substring(firstIndex, currentDirStr.length); 
            }
    
            if ( dirObj.direction === NAVIGATION_DIRECTION_TYPE.TOP 
                 || dirObj.direction === NAVIGATION_DIRECTION_TYPE.TO ) {
                this.pushPath(currentDirStr);
            }
    
            return {
                currentDirStr,
                currentRelativePathStr,
                rootFolderName
            }
        }

        /**
         * Get relative path based on start path
         * - referred python os.path.relpath()
         * @param {string} start start path (base path)
         * @param {string} path current path
         * @returns current relative path
         */
        getRelativePath(start, path) {
            const sep = '/';
            const curdir = '.';
            const pardir = '..';

            var startSplit = start.split(sep);
            var pathSplit = path.split(sep);

            // TODO: check drive: startSplit[0] == pathSplit[0]

            var startList = startSplit.slice(1);
            var pathList = pathSplit.slice(1);

            var stopIdx = 0;
            while (stopIdx < startList.length) {
                var e1 = startList[stopIdx];
                var e2 = pathList[stopIdx];
                if (e1 != e2) {
                    break;
                }
                stopIdx++;
            }
            var parList = Array(startList.length - stopIdx).fill(pardir);
            var relList = parList.concat(pathList.slice(stopIdx));
            if (!relList || relList.length == 0) {
                return ''; // curdir
            }
            return relList.join(sep);
        }

        pushPath = function(path) {
            this.pathStack.push(path);
            return true;
        }
    
        popPath = function() {
            if (this.pathStack.length <= 0) {
                return undefined;
            }
            return this.pathStack.pop();
        }

        //============================================================================
        // Set states
        //============================================================================

        setExtensions(arr) {
            this.state.extensions = arr;
        }

        setSelectedFile(fileName, filePath) {
            this.state.fileName = fileName;
            this.state.filePath = filePath;

            $(this.wrapSelector('#vp_fileNavigationInput')).val(fileName);
        }
    }

    return FileNavigation;
});