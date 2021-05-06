define([
    'require'
    , 'jquery'
    ,'nbextensions/visualpython/src/common/vpCommon'

    , 'nbextensions/visualpython/src/pandas/fileNavigation/helperFunction'
    , 'nbextensions/visualpython/src/pandas/fileNavigation/constData'
], function (requirejs, $, vpCommon,
            helperFunction, constData) {

    const { makeKernelCurrentPath } = helperFunction;
    const { NAVIGATION_DIRECTION_TYPE
            , FILE_EXTENSION_TYPE } = constData;
    /** 
     *  @private
     *  파이썬 커널에서
        1. 디렉토리 정보를 string으로 받아옴 
            이 함수가 디렉토리를 찾는 direction 가짓수는 총 4가지
            before 상위 디렉토리 검색
            to 특정 폴더 디렉토리 검색
            prev 이전 디렉토리 검색
            init 파일네비게이션 처음 시작할 때 기본 디렉토리 검색
        2. string을 자바스크립트 객체로 파싱
        2. 파싱된 객체정보를 <div/> 형식으로 바꿔 화면에 동적 렌더링
    */
    var _executeKernelFromDir = function(dirObj, callback, fileNavigationRendererThis) {
        const { direction } = dirObj;
        if (direction === NAVIGATION_DIRECTION_TYPE.TO 
            || direction === NAVIGATION_DIRECTION_TYPE.PREV) {
            _executeCurrentPath(dirObj, callback, fileNavigationRendererThis);
        } else if (direction === NAVIGATION_DIRECTION_TYPE.TOP) {
            dirObj.destDir = '..';
            _executeCurrentPath(dirObj, callback, fileNavigationRendererThis);
        } else {
            dirObj.destDir = '.';
            _executeCurrentPath(dirObj, callback, fileNavigationRendererThis);
        }
    }

    /**
     * @private
     * 파이썬 커널로 현재 디렉토리의 폴더 및 파일 목록 가져오기 */ 
    var _executeCurrentPath = function(dirObj, callback, fileNavigationRendererThis) {
        const { destDir, useFunction } = dirObj;
        var currentPathStr = makeKernelCurrentPath(destDir, (useFunction? true : false));
        var fileNavigationState = fileNavigationRendererThis.getFileNavigationState();
        var dataOption = fileNavigationState.getFileOptionData();
        fileNavigationRendererThis.vpFuncJS.kernelExecute(currentPathStr, (result) => {
            // var jsonVars = result.replace(/'/gi, `"`);
            // jsonVars = jsonVars.replace(/\\/gi, `/`);

            /** 주의 : 만약 아래의 코드 "$1"을 '$1' single quote로 바꾸면 json parsing 에러 발생 */
            var jsonVars = result.replace(/'([^']+)': /g, `"$1": `);        // 객체 앞부분 대체
            jsonVars = jsonVars.replace(/: '([^']+)'([,}])/g, `: "$1"$2`);  // 객체 뒷부분 대체
            jsonVars = jsonVars.replace(/\\/g, `/`);
            var varList = JSON.parse(jsonVars);

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

            /** vp 파일을 열기 위해 file navigation을 열였을 때,
             * 
             *  파일 확장자는 .vp .txt 
             *  파일 타입은 dir(폴더를 의미)
             *  인 경우만 filtering해서 가져옴
             */
            if (dataOption.fileExtension == FILE_EXTENSION_TYPE.VP) {
                filterd_varList = filterd_varList.filter((data, index) => {
                    if (index == 0) {
                        return true;
                    }

                    if (data.type && data.type == 'dir') {
                        // 폴더인 경우 표시
                        return true;
                    } else if (data.name) {
                        var extension = data.name.substring(data.name.lastIndexOf('.') + 1);
                        var allowExtensionList = ['vp', 'txt'];
                        if (allowExtensionList.includes(extension)) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }

                    // if (data.name && data.name.indexOf('vp') != -1
                    //     || data.name && data.name.indexOf('txt') != -1
                    //     || data.type && data.type.indexOf('dir') != -1) {
                    //     return true;
                    // } else {
                    //     return false;
                    // }
                });
            }
            /**
             * 확장자가 여러 개 입력되었다면, 
             * 해당 확장자 list에 포함된 확장자의 파일 목록 & 폴더 반환
             */
            if (Array.isArray(dataOption.fileExtension)) {
                filterd_varList = filterd_varList.filter((data, index) => {
                    if (index == 0) {
                        return true;
                    }

                    if (data.type && data.type == 'dir') {
                        // 폴더인 경우 표시
                        return true;
                    } else if (data.name) {
                        var extension = data.name.substring(data.name.lastIndexOf('.') + 1);
                        if (dataOption.fileExtension.includes(extension)) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                });
            }

            callback(filterd_varList);
        });
    }



    /**
     * @param {object} dirObj 
     * @param {fileNavigationRenderer This} fileNavigationRendererThis 
     */
    var executeKernelFromDirBody = function(dirObj, fileNavigationRendererThis) {
        _executeKernelFromDir(dirObj , (resultInfoArr) => {
            var { currentDirStr,  currentRelativePathStr } 
                = fileNavigationRendererThis.fileNavigationState.splitPathStrAndSetStack(dirObj, resultInfoArr);
            
            fileNavigationRendererThis.renderNowLocation(currentDirStr, currentRelativePathStr);
            fileNavigationRendererThis.renderCurrentDirPathInfoRightBody(resultInfoArr);   
        }, fileNavigationRendererThis);
    }

    return {
        executeKernelFromDirBody
    }
});
