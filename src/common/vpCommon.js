define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
], function (requirejs, $, vpConst, sb) {

    let isAPIListRunCode = true;

    /**
     * 옵션 페이지 로드.
     * @param {String} destSelector 로드될 목적지 선택자
     * @param {String} url 로드할 html url
     * @param {String} prefix html url 앞부분 명시가능(생략 가능)
     * @param {function} callback callback 함수
     * @param {function} recursiveCallback callback 의 callback
     * @param {object} callbackParam callback 사용 추가 파라미터
     */
    var loadHtml = function(destSelector, url, prefix, callback, recursiveCallback, callbackParam) {
        // prefix 없이 callback 전달된 경우 처리
        if (typeof(prefix) === 'function') {
            callbackParam = recursiveCallback;
            recursiveCallback = callback;
            callback = prefix;
            prefix = null;
        }

        var loadURL;
        // prefix로 풀경로를 지정하지 않은 경우
        if (prefix === undefined || prefix === null) {
            loadURL = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + url;
        } else {
            loadURL = prefix + url;
        }

        $(destSelector).load(loadURL, function (response, status, xhr) {
            // 로딩 에러시 처리
            if (status === "error") {
                // TODO: 에러 처리 방법 정의 필요. 알람은 개발 편의를 위해.
                alert(xhr.status + " " + xhr.statusText);
                console.warn("[vp] Unexcepted error occurred during load option page." + xhr.status + " " + xhr.statusText);
            } else {
                // callback 이 함수이면 실행
                if (typeof(callback) === 'function')
                    callback(recursiveCallback, callbackParam);
            }
        });
    }

    /**
     * uuid 생성
     * @returns {String} uuid
     */
    var getUUID = function() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    /**
     * append css on global
     * @param {String} url style url
     */
    var loadCss = function(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = requirejs.toUrl(url);
        document.getElementsByTagName("head")[0].appendChild(link);
    }

    /**
     * VisualPython container selector (jquery selector)
     * @returns vp top container selector
     */
    var getVPContainer = function() {
        return "#" + vpConst.VP_CONTAINER_ID;
    }

    /**
     * 선택자 범위 vp 안으로 감싸기
     * @param {String} selector 제한할 대상 선택자. 복수 매개 시 순서대로 제한됨
     * @returns wraped selecotr 
     */
    var wrapSelector = function(selector = "") {
        var sbSelector = new sb.StringBuilder();
        var cnt = arguments.length;
        // 추가 제한자가 없는 경우
        if (cnt < 2) {
            sbSelector.appendFormat("{0} {1}", getVPContainer(), selector);
        } else {
            sbSelector.appendFormat("{0}", getVPContainer());
            for (var idx = 0; idx < cnt; idx++) {
                sbSelector.appendFormat(" {0}", arguments[idx]);
            }
        }
        // console.log('wrapSelector', sbSelector.toString());
        return sbSelector.toString();
    }

    /**
     * add variable and trigger event
     * @param {string} varName variable name
     * @param {string} varType variable type
     * @returns if return 0 when success, -1 when variable name duplicate
     */
    var addVariable = function(varName, varType) {
        // varName 중복 체크
        if (checkVariableNameDuplicate) {
            return -1;
        } else {
            events.trigger('add-variable.vp-wrapper', {'varName': varName, 'varType': varType});
            return 0;
        }
    }

    /**
     * 스트링 포맷형 조합
     */
    var formatString = function() {
        var cnt = arguments.length;
        if (cnt < 2) 
            return arguments[0];

        var str = arguments[0];
        for (var idx = 1; idx < cnt; idx++)
            str = str.replace("{" + (idx - 1) + "}", arguments[idx]);
        
        return str;
    }

    /**
     * Convert to string format if not numeric
     * @param {*} code 
     * @returns 
     */
    var convertToStr = function(code) {
        if (!$.isNumeric(code)) {
            if (code.includes("'")) {
                code = `"${code}"`;
            } else {
                code = `'${code}'`;
            }
        }
        return code;
    }

    /**
     * check duplicate variable name
     * @param {string} varName 
     */
    var checkVariableNameDuplicate = function(varName) {
        // TODO: varName 중복 체크
        return true;
    }

     // ----- 추가 + 이진용 주임 -----

    /**
     * scriptName이름과 일치하는 head태그에 load한 css와 js파일을 삭제
     * @param {string} scriptName 
     */
    var removeHeadScript = function(scriptName) {
        for (let i = 0; i < document.querySelector('head').children.length; i++){
            if (document.querySelector('head').children[i].outerHTML.includes(scriptName)) { 
                document.querySelector('head').removeChild(document.querySelector('head').children[i]);
            }
        }   
    }

    /**
     * head태그에 특정 scriptName과 일치하는 css html js 파일이 import 되어있는지 콘솔로 찍어 확인
     * @param {string} scriptName 
     */
    var consoleHeadScript = function(scriptName) {
        for (let i = 0; i < document.querySelector('head').children.length; i++){
            if (document.querySelector('head').children[i].outerHTML.includes(scriptName)) { 
                console.log(document.querySelector('head').children[i]);
                break;
            }
        }   
    }
    /** 
     * alertModal html과 css를 load하는 함수
     * alertModal은 주로 코드 생성 validation message로 사용한다
     * @param {string} titleStr 
     */
    var renderAlertModal = function(titleStr) {
        if (isAPIListRunCode == true) {
            // load css
            loadCss( Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "component/alertModal.css");
            // set html url
            var loadURL = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/alertModal.html";
            // load alertModal html
            $(`<div id="vp_alertModal"></div>`)
                .load(loadURL, function() {
                    // bind 이벤트 함수

                    // alertModal창 메세지 출력
                    $('.vp-alertModal-titleStr').html(titleStr);
                    // alertModal창 확인 버튼 누를시
                    $('.vp-alertModal-yes').click( function() {
                        $('body').find('#vp_alertModal').remove();
                        // 종료후 head 태그에 import된 alertModal.css와 alertModal.html을 삭제함
                        removeHeadScript("alertModal");
                    });   
            })
            .appendTo("body");
        }
    }

    /** 
     * 데이터가 생성되기 전에 Loading을 일으키는 함수
     * 파일 네비게이션 작업이 끝나면 삭제됨
     */
    var renderLoadingBar = function() {
        // load css
        loadCss( Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "component/loadingBar.css");
        // set html url
        var loadURL = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/loadingBar.html";
        // load renderLoadingBar html 
        $(`<div id="vp_loadingBar"></div>`)
            .load(loadURL, function() {
        })
        .appendTo(".fileNavigationPage-directory-container");
    }

    /**
     * 성공 메세지를 화면 우측 오른쪽에 띄우는 함수
     * 메세지는 3초후 사라진다.
     * @param {string} titleStr 
     */
    var renderSuccessMessage = function(titleStr) {
        loadCss( Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "component/successMessage.css");
        var loadURL = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/successMessage.html";
        $(`<div id="vp_successMessage"></div>`)
            .load(loadURL, function() {
                $('.vp-successMessage').append(`<div>${titleStr}</div>`);
                // 한 번 비동기 실행 다음 3초 후  종료
                setTimeout( function() {
                    $("#vp_successMessage").remove();
                    // 종료후 head 태그에 import된 successMessage.css와 successMessage.html을 삭제함
                    removeHeadScript("successMessage");
                }, 3000);
            })
        .appendTo("#header");
    }

    var renderYesOrNoModal = function(callback) {
        // load css
        loadCss( Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "component/yesOrNoModal.css");
        // set html url
        var loadURL = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/yesOrNoModal.html";
        // load alertModal html
        $(`<div id="vp_yesOrNoModal"></div>`)
            .load(loadURL, callback)
        .appendTo(".FileNavigationPage-inner");
    }

    var setIsAPIListRunCode = function(isAPIListRunCode_param) {
        isAPIListRunCode = isAPIListRunCode_param;
    }

    var getIsAPIListRunCode = function() {
        return isAPIListRunCode;
    }

    var kernelExecute = function(command, isSilent = false, isStoreHistory = !isSilent, isStopOnError = true) {
        return new Promise((resolve, reject) => {
            Jupyter.notebook.kernel.execute(
                command,
                {
                    iopub: {
                        output: function(msg) {
                            // msg.content.data['text/plain']
                            console.log(msg);
                            resolve(msg.content.data);
                        }
                    }
                },
                { silent: isSilent, store_history: isStoreHistory, stop_on_error: isStopOnError }
            );
        });
    }

    /**
     * 셀에 소스 추가하고 실행.
     * @param {Array<object>} cmdList 실행할 코드 목록 { command, exec, type }
     */
    var cellExecute = function(cmdList) {
        var executed = false;

        cmdList && cmdList.forEach((cmd, idx) => {
            var command = cmd.command;
            var exec = cmd.exec;
            var type = cmd.type;

            var targetCell = Jupyter.notebook.insert_cell_below(type);
            
            // 코드타입인 경우 시그니쳐 추가.
            if (type == "code") {
                // command = vpCommon.formatString("{0}\n{1}", vpConst.PREFIX_CODE_SIGNATURE, command);
                command = formatString("{0}", command);
            }
            targetCell.set_text(command);
            Jupyter.notebook.select_next();
            // this.metaSave(); 각 함수에서 호출하도록 변경.
            if (exec) {
                switch (type) {
                    case "markdown":
                        targetCell.render();
                        break;
                        
                    case "code":
                    default:
                        targetCell.execute();
                }
                executed = true;
            }
        });
        
        /** 추가 + 김민주 주임
         * 2020 11 24 주피터 셀 실행(run)/추가(add) 후 선택된 셀로 이동
         */
        Jupyter.notebook.scroll_to_cell(Jupyter.notebook.get_selected_index());
        
        if (executed) {
            /**
             * 추가 + 이진용 주임
             * 2020 10 22 한글('코드가 실행되었습니다') -> 영어로 변경('Your code has been executed)
             */
            renderSuccessMessage("Your code has been executed");
        }
    }

    return {
        loadHtml: loadHtml
        , getUUID: getUUID
        , loadCss: loadCss
        , getVPContainer: getVPContainer
        , wrapSelector: wrapSelector
        , addVariable: addVariable
        , formatString: formatString

        // 추가 + 이진용 주임
        , renderAlertModal: renderAlertModal
        , renderLoadingBar: renderLoadingBar
        , renderSuccessMessage: renderSuccessMessage
        , renderYesOrNoModal: renderYesOrNoModal
        , removeHeadScript: removeHeadScript
        , setIsAPIListRunCode: setIsAPIListRunCode
        , getIsAPIListRunCode: getIsAPIListRunCode

        // 추가
        , kernelExecute: kernelExecute
        , cellExecute: cellExecute
        , convertToStr: convertToStr
    };
});