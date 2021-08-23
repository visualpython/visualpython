define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/pandas/common/commonPandas'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
    , 'nbextensions/visualpython/src/pandas/fileNavigation/index'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, libPandas, pdGen, fileNavigation) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "기본 연산"
        , funcID : "pdFunc_basicCal"  // TODO: ID 규칙 생성 필요
        , libID : "pd052"
    }

    /**
     * html load 콜백. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var optionLoadCallback = function(callback, meta) {
        // document.getElementsByTagName("head")[0].appendChild(link);
        // 컨테이너에서 전달된 callback 함수가 존재하면 실행.
        if (typeof(callback) === 'function') {
            var uuid = 'u' + vpCommon.getUUID();
            // 최대 10회 중복되지 않도록 체크
            for (var idx = 0; idx < 10; idx++) {
                // 이미 사용중인 uuid 인 경우 다시 생성
                if ($(vpConst.VP_CONTAINER_ID).find("." + uuid).length > 0) {
                    uuid = 'u' + vpCommon.getUUID();
                }
            }
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM))).find(vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE)).addClass(uuid);

            // 옵션 객체 생성
            var pdPackage = new PandasPackage(uuid);
            pdPackage.metadata = meta;

            // 옵션 속성 할당.
            pdPackage.setOptionProp(funcOptProp);
            // html 설정.
            pdPackage.initHtml();
            callback(pdPackage);  // 공통 객체를 callback 인자로 전달
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "file_io/fileio.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var PandasPackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        
        this.dataPath = window.location.origin + vpConst.PATH_SEPARATOR + vpConst.BASE_PATH + vpConst.DATA_PATH + "sample_csv/";

        
        this.fileExtensions = {
            'csv': 'csv',
            'excel': 'xls',
            'json': 'json',
            'pickle': 'pickle'
        }
        
        this.package = {
            input: [
                { name: 'vp_fileioType' },
                { name: 'vp_pageDom'}
            ]
        }

        this.fileState = {
            'Sample': {
                library: 'pandas',
                code: "${vp_sampleReturn} = pd.read_csv('" + this.dataPath  + "${vp_sampleFile}'${v})",
                input: [
                    {
                        name:'vp_sampleFile',
                        label: 'Sample File',
                        component: 'option_select',
                        options: [
                            'iris.csv', 'Titanic_train.csv', 'Titanic_test.csv', 'cancer.csv',
                            'fish.csv', 'accidentData.csv', 'campusRecruitment.csv', 'houseData_500.csv',
                            'lolRankedData_500.csv', 'weatherData_500.csv', 'welfareCenter.csv',
                            'mnist_train_1000.csv'
                        ],
                        options_label: [
                            'iris', 'Titanic_train', 'Titanic_test', 'cancer',
                            'fish', 'accidentData', 'campusRecruitment', 'houseData_500',
                            'lolRankedData_500', 'weatherData_500', 'welfareCenter',
                            'mnist_train_1000'
                        ]
                    }
                ],
                output: [
                    {
                        name:'vp_sampleReturn',
                        type:'var',
                        label:'Return to',
                        required: true
                    }
                ]
            },
            'Read': {
                fileTypeId: {
                    'csv': 'pd004',
                    'excel': 'pd123',
                    'json': 'pd076',
                    'pickle': 'pd079'
                },
                selectedType: 'csv',
                package: null,
                fileResultState: {
                    pathInputId : this.wrapSelector('#vp_fileRead #i0'),
                    fileInputId : this.wrapSelector('#vp_fileRead #fileName')
                }
            },
            'Write': {
                fileTypeId: {
                    'csv': 'pd005',
                    'excel': 'pd124',
                    'json': 'pd077',
                    'pickle': 'pd078'
                },
                selectedType: 'csv',
                package: null,
                fileResultState: {
                    pathInputId : this.wrapSelector('#vp_fileWrite #i1'),
                    fileInputId : this.wrapSelector('#vp_fileWrite #fileName')
                }
            }
        }

        this.state = {
            paramData:{
                encoding: "utf-8" // 인코딩
                , delimiter: ","  // 구분자
            },
            returnVariable:"",    // 반환값
            isReturnVariable: false,
            fileExtension: "csv" // 확장자
        };
        this.fileResultState = {
            pathInputId : this.wrapSelector('#i1'),
            fileInputId : this.wrapSelector('#fileName')
        };
    }



    /**
     * vpFuncJS 에서 상속
     */
    PandasPackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    PandasPackage.prototype.optionValidation = function() {
        return true;

        // 부모 클래스 유효성 검사 호출.
        // vpFuncJS.VpFuncJS.prototype.optionValidation.apply(this);
    }


    /**
     * html 내부 binding 처리
     */
    PandasPackage.prototype.initHtml = function() {
        this.showFunctionTitle();
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/commonPandas.css");
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "file_io/fileio.css");

        this.bindOptions();

        if (this.metadata) {
            this.loadState(this.metadata);
        }
    }

    /**
     * 선택한 패키지명 입력
     */
    PandasPackage.prototype.showFunctionTitle = function() {
        $(this.wrapSelector('.vp_functionName')).text('File');
    }

    PandasPackage.prototype.saveState = function() {
        var pageType = $(this.wrapSelector('#vp_fileioType')).val();

        // save input state
        $(this.wrapSelector('#vp_file' + pageType + ' input')).each(function () {
            this.defaultValue = this.value;
        });

        // save checkbox state
        $(this.wrapSelector('#vp_file' + pageType + ' input[type="checkbox"]')).each(function () {
            if (this.checked) {
                this.setAttribute("checked", true);
            } else {
                this.removeAttribute("checked");
            }
        });

        // save select state
        $(this.wrapSelector('#vp_file' + pageType + ' select > option')).each(function () {
            if (this.selected) {
                this.setAttribute("selected", true);
            } else {
                this.removeAttribute("selected");
            }
        });

        var pageDom = $(this.wrapSelector('#vp_file' + pageType)).html();
        $(this.wrapSelector('#vp_pageDom')).val(pageDom);
    }

    PandasPackage.prototype.loadState = function(state) {
        var pageType = this.getMetadata('vp_fileioType');
        var pageDom = this.getMetadata('vp_pageDom');

        // load pageDom
        $(this.wrapSelector('#vp_file' + pageType)).html(pageDom);

        // show loaded page
        $(this.wrapSelector('.vp-fileio-box')).hide();
        $(this.wrapSelector('#vp_file' + pageType)).show();

        //set fileResultState
        this.fileResultState = {
            ...this.fileState[pageType].fileResultState
        };

        // bind event by page type
        this.bindEventByType(pageType);
    }

    /**
     * Pandas 기본 패키지 바인딩
     */
    PandasPackage.prototype.bindOptions = function() {
        var that = this;

        this.renderPage('Read');
        this.renderPage('Write');

        this.bindEvent();
    };

    /**
     * get metadata
     * @param {String} id id
     */
     PandasPackage.prototype.getMetadata = function(id) {
        if (this.metadata == undefined)
            return "";
        var len = this.metadata.options.length;
        for (var i = 0; i < len; i++) {
            var obj = this.metadata.options[i];
            if (obj.id == id)
                return obj.value;
        }
        return "";
    }

    PandasPackage.prototype.renderPage = function(pageType) {
        var that = this;
        var prefix = '#vp_file' + pageType + ' ';

        // clear
        $(this.wrapSelector(prefix + '#vp_inputOutputBox table')).html('<colgroup><col width="40%"/><col width="*"/></colgroup>');
        $(this.wrapSelector(prefix + '#vp_optionBox table')).html('<colgroup><col width="40%"/><col width="*"/></colgroup>');

        var fileTypeObj = this.fileState[pageType]['fileTypeId'];
        var selectedType = this.fileState[pageType]['selectedType'];
        var package = { ...libPandas._PANDAS_FUNCTION[fileTypeObj[selectedType]] };
        this.fileState[pageType].package = package;
        this.state.fileExtension = that.fileExtensions[selectedType];
        this.fileResultState = {
            ...this.fileState[pageType].fileResultState
        };

        if (pageType == 'Write') {
            if (selectedType == 'json') {
                this.fileResultState.pathInputId = this.wrapSelector(prefix + '#path_or_buf');
            }
            if (selectedType == 'pickle') {
                this.fileResultState.pathInputId = this.wrapSelector(prefix + '#path');
            }
        }

        // render interface
        pdGen.vp_showInterfaceOnPage(this, this.wrapSelector('#vp_file' + pageType), package);

        // prepend file type selector
        $(this.wrapSelector(prefix + '#vp_inputOutputBox table')).prepend(
            $('<tr>').append($(`<td><label for="fileType" class="${vpConst.COLOR_FONT_ORANGE}">File Type</label></td>`))
                .append($('<td><select id="fileType" class="vp-select"></select></td>'))
        );
        var fileTypeList = Object.keys(fileTypeObj);
        fileTypeList.forEach(type => {
            $(this.wrapSelector(prefix + '#fileType')).append(
                $(`<option value="${type}">${type}</option>`)
            );
        });

        $(this.wrapSelector(prefix + '#fileType')).val(selectedType);

        // add file navigation button
        if (pageType == 'Write') {
            if (selectedType == 'json') {
                $(prefix + '#path_or_buf').parent().html(
                    vpCommon.formatString('<input type="text" class="vp-input input-single" id="path_or_buf" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{0}"></div>'
                    , vpConst.FILE_BROWSER_INPUT_BUTTON)
                );
            } else if (selectedType == 'pickle') {
                $(prefix + '#path').parent().html(
                    vpCommon.formatString('<input type="text" class="vp-input input-single" id="path" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{0}"></div>'
                    , vpConst.FILE_BROWSER_INPUT_BUTTON)
                );
            } else {
                $(this.fileState[pageType]['fileResultState']['pathInputId']).parent().html(
                    vpCommon.formatString('<input type="text" class="vp-input input-single" id="{0}" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{1}"></div>'
                        , 'i1'
                        , vpConst.FILE_BROWSER_INPUT_BUTTON)
                );
            }
        } else {
            $(this.fileState[pageType]['fileResultState']['pathInputId']).parent().html(
                vpCommon.formatString('<input type="text" class="vp-input input-single" id="{0}" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{1}"></div>'
                    , 'i0'
                    , vpConst.FILE_BROWSER_INPUT_BUTTON)
            );
        }

        
    }

    PandasPackage.prototype.bindEvent = function() {
        var that = this;

        $(this.wrapSelector('#vp_fileioType')).on('change', function() {
            var pageType = $(this).val();
            $(that.wrapSelector('.vp-fileio-box')).hide();
            $(that.wrapSelector('#vp_file' + pageType)).show();

            //set fileResultState
            that.fileResultState = {
                ...that.fileState[pageType].fileResultState
            };
        });

        this.bindEventByType('Read');
        this.bindEventByType('Write');
    }

    PandasPackage.prototype.bindEventByType = function(pageType) {
        var that = this;
        var prefix = '#vp_file' + pageType + ' ';

        // select file type 
        $(this.wrapSelector(prefix + '#fileType')).change(function() {
            var value = $(this).val();
            that.fileState[pageType].selectedType = value;

            // reload
            that.renderPage(pageType);
            that.bindEventByType(pageType);
        });

        // open file navigation
        $(this.wrapSelector(prefix + '#vp_openFileNavigationBtn')).click(async function() {
                    
            var loadURLstyle = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH;
            var loadURLhtml = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/fileNavigation/index.html";
            
            that.loadCss( loadURLstyle + "component/fileNavigation.css");

            await $(`<div id="vp_fileNavigation"></div>`)
                    .load(loadURLhtml, () => {

                        $('#vp_fileNavigation').removeClass("hide");
                        $('#vp_fileNavigation').addClass("show");

                        var { vp_init
                            , vp_bindEventFunctions } = fileNavigation;
                    
                        if (pageType == 'Read') {
                            fileNavigation.vp_init(that);
                        } else {
                            fileNavigation.vp_init(that, 'SAVE_FILE');
                        }
                        fileNavigation.vp_bindEventFunctions();
                    })
                    .appendTo("#site");
        });
    }

    /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    PandasPackage.prototype.generateCode = function(addCell, exec) {
        var pageType = $(this.wrapSelector('#vp_fileioType')).val();
        var sbCode = new sb.StringBuilder();

        this.saveState();

        if (pageType == 'Sample') {
            // sample csv code
            var result = pdGen.vp_codeGenerator(this.uuid + ' #vp_fileSample', { ...this.fileState[pageType] });
            sbCode.append(result);
        } else if (pageType == 'Read') {
            var package = JSON.parse(JSON.stringify(this.fileState[pageType].package));
            package.input.push({
                name: 'fileType',
                type: 'var'
            });
            var result = pdGen.vp_codeGenerator(this.uuid + ' #vp_fileRead', package);
            sbCode.append(result);
        } else if (pageType == 'Write') {
            var package = JSON.parse(JSON.stringify(this.fileState[pageType].package));
            package.input.push({
                name: 'fileType',
                type: 'var'
            });
            var result = pdGen.vp_codeGenerator(this.uuid + ' #vp_fileWrite', package);
            sbCode.append(result);
        }

        if (addCell) this.cellExecute(sbCode.toString(), exec);

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});