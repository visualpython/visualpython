define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/pandas/common/commonPandas'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, libPandas, pdGen) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "SampleCsv"
        , funcID : "pdIo_sampleCsv"
        , libID : "pd122"
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
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "pandas/common/commonPandas.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var PandasPackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.

        this.dataPath = window.location.origin + vpConst.PATH_SEPARATOR + vpConst.BASE_PATH + vpConst.DATA_PATH + "sample_csv/";

        // pandas 함수
        this.package = {
            library: 'pandas',
            code: "${o0} = pd.read_csv('" + this.dataPath  + "${i0}'${v})",
            input: [
                {
                    name:'i0',
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
                    name:'o0',
                    type:'var',
                    label:'Return to',
                    required: true
                }
            ]
        }
    }



    /**
     * vpFuncJS 에서 상속
     */
    PandasPackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);


    /**
     * html 내부 binding 처리
     */
    PandasPackage.prototype.initHtml = function() {
        this.showFunctionTitle();
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/commonPandas.css");

        this.bindOptions();
    }

    /**
     * 선택한 패키지명 입력
     */
    PandasPackage.prototype.showFunctionTitle = function() {
        $(this.wrapSelector('.vp_functionName')).text(this.package.name);
    }

    /**
     * Pandas 기본 패키지 바인딩
     */
    PandasPackage.prototype.bindOptions = function() {
        // 옵션 경로 지정
        // this.package = JSON.parse(JSON.stringify(this.package));
        // var optionsPath = [];
        // this.package.input[0].options.forEach(path => {
        //     optionsPath.push(window.location.origin + vpConst.PATH_SEPARATOR + vpConst.BASE_PATH + vpConst.DATA_PATH + "sample_csv/" + path);
        // });
        // this.package.input[0].options = optionsPath;
        
        // HTML 구성
        pdGen.vp_showInterface(this);
        
        var sampleType = undefined;
        // get metadata - sample file
        if (this.metadata) {
            sampleType = this.getMetadata('i0');
            if (sampleType) {
                // change front url
                // var dataPath = vpConst.PATH_SEPARATOR + vpConst.BASE_PATH + vpConst.DATA_PATH + "sample_csv/";
                // var splitPath = sampleType.split(dataPath);
                // sampleType = window.location.origin + dataPath + splitPath[1];
                // this.package.input[0].value = sampleType;

                $(this.wrapSelector('#i0')).val(sampleType);
            }
        }

        // if it has no additional options, remove that box
        if (this.package.variable == undefined || this.package.variable.length <= 0) {
            $(this.wrapSelector('#vp_optionBox')).closest('div.vp-accordion-container').remove();
        }
    };

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
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    PandasPackage.prototype.generateCode = function(addCell, exec) {
        // if (!this.optionValidation()) return;
        var bgCode = new sb.StringBuilder();
        
        // 코드 생성
        var result = pdGen.vp_codeGenerator(this.uuid, this.package);
        if (result == null) return ""; // 코드 생성 중 오류 발생
        bgCode.append(result);

        if (addCell) this.cellExecute(bgCode.toString(), exec);

        return bgCode.toString();
    }

    return {
        initOption: initOption
    };
});