define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/pandas/common/commonPandas'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
    , 'nbextensions/visualpython/src/common/vpSubsetEditor'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, libPandas, pdGen, vpSuggestInputText, vpSubsetEditor) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "Plot"
        , funcID : "pd_plot"  // TODO: ID 규칙 생성 필요
        , libID : "pd121"
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
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "pandas/plot.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var PandasPackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        // pandas 함수
        this.package = libPandas._PANDAS_FUNCTION[funcOptProp.libID];
        // plot 종류
        this.plotKind = {
            'line': '선',
            'bar': '막대',
            'barh': '가로막대',
            'hist': '히스토그램',
            'box': '박스플롯',
            'kde': 'Kernel Density Estimation',
            'area': 'Area',
            'pie': '파이',
            'scatter': 'Scatter',
            'hexbin': 'Hexbin'
        }
        // cmap 종류
        this.cmap = [
            '', 'viridis', 'plasma', 'inferno', 'magma', 'cividis'
            , 'Pastel1', 'Pastel2', 'Paired', 'Accent', 'Dark2', 'Set1', 'Set2', 'Set3', 'tab10', 'tab20', 'tab20b', 'tab20c'
        ]
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
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/plot.css");

        this.bindOptionEvents();
        this.bindOptions();
        this.bindKindSelector();
        this.bindCmapSelector();
        this.bindOptionDivider(14);

        this.subsetEditor = new vpSubsetEditor(this, "i0");

    }

    /**
     * 선택한 패키지명 입력
     */
    PandasPackage.prototype.showFunctionTitle = function() {
        $(this.wrapSelector('.vp_functionName')).text(this.package.name);
    }

    /**
     * Plot 유형 선택하는 폼 구성
     */
    PandasPackage.prototype.bindKindSelector = function() {
        var that = this;

        // 기존 유형 선택하는 select 태그 안보이게
        var kindSelector = this.wrapSelector('#kind');
        $(kindSelector).closest('tr').hide();

        // 메타데이터로 차트유형 선택
        var plotType = 'line';
        if (this.metadata != undefined && this.metadata.options != undefined) {
            plotType = this.metadata.options.filter(o => o.id == 'kind')[0].value;
        }

        // 차트 선택
        $(kindSelector).val(plotType);
        $(this.wrapSelector(`#vp_plotKind .vp-plot-item[data-kind="${plotType}"]`)).addClass('selected');

        // 유형 선택 이벤트
        $(this.wrapSelector('.vp-plot-item')).click(function() {
            // 선택한 플롯 유형 박스 표시
            $(this).parent().find('.vp-plot-item').removeClass('selected');
            $(this).addClass('selected');

            // select 태그 강제 선택
            var type = $(this).data('kind');
            $(kindSelector).val(type).prop('selected', true);

            // area plot일 경우 stacked true
            if (type == 'area') {
                $(that.wrapSelector('#stacked')).prop('checked', true);
            } else {
                $(that.wrapSelector('#stacked')).prop('checked', false);
            }
            
            // pie plot일 경우 subplots true
            if (type == 'pie') {
                $(that.wrapSelector('#subplots')).prop('checked', true);
            } else {
                $(that.wrapSelector('#subplots')).prop('checked', false);
            }

            // scatter, hexbin plot일 경우 x, y 컬럼 필수 입력으로
            if (type == 'scatter' || type == 'hexbin') {
                // that.package = JSON.parse(JSON.stringify(that.package));
                that.package = JSON.parse(JSON.stringify(that.package));
                var idx = that.package.variable.findIndex(function(item) {return item.name === 'x'});
                if (idx > -1) {
                    that.package.variable[idx].required = true;
                    // 라벨 필수 입력 표시
                    // $(that.wrapSelector('#x')).closest('tr').find('label').text(`* ${that.package.variable[idx].label} (${that.package.variable[idx].name})`);
                    var tag = $(that.wrapSelector('#x')).closest('tr').find('label');
                    if (!$(tag).hasClass(vpConst.COLOR_FONT_ORANGE)) {
                        $(that.wrapSelector('#x')).closest('tr').find('label').addClass(vpConst.COLOR_FONT_ORANGE);
                    }
                }
                var idy = that.package.variable.findIndex(function(item) {return item.name === 'y'});
                if (idy > -1) {
                    that.package.variable[idy].required = true;
                    // 라벨 필수 입력 표시
                    // $(that.wrapSelector('#y')).closest('tr').find('label').text(`* ${that.package.variable[idy].label} (${that.package.variable[idy].name})`);
                    var tag = $(that.wrapSelector('#y')).closest('tr').find('label');
                    if (!$(tag).hasClass(vpConst.COLOR_FONT_ORANGE)) {
                        $(that.wrapSelector('#y')).closest('tr').find('label').addClass(vpConst.COLOR_FONT_ORANGE);
                    }
                }
            } else {
                that.package = libPandas._PANDAS_FUNCTION[funcOptProp.libID];

                // 라벨 재정비
                var idx = that.package.variable.findIndex(function(item) {return item.name === 'x'});
                if (idx > -1) {
                    // $(that.wrapSelector('#x')).closest('tr').find('label').text(`${that.package.variable[idx].label} (${that.package.variable[idx].name})`);
                    $(that.wrapSelector('#x')).closest('tr').find('label').removeClass(vpConst.COLOR_FONT_ORANGE);
                }
                var idy = that.package.variable.findIndex(function(item) {return item.name === 'y'});
                if (idy > -1) {
                    // $(that.wrapSelector('#y')).closest('tr').find('label').text(`${that.package.variable[idy].label} (${that.package.variable[idy].name})`);
                    $(that.wrapSelector('#y')).closest('tr').find('label').removeClass(vpConst.COLOR_FONT_ORANGE);
                }
            }
        });

    }

    /**
     * Plot 색상 팔레트 선택하는 폼 구성
     */
    PandasPackage.prototype.bindCmapSelector = function() {
        // 기존 cmap 선택하는 select 태그 안보이게
        var cmapSelector = this.wrapSelector('#colormap');
        $(cmapSelector).closest('tr').hide();

        // cmap 데이터로 팔레트 div 동적 구성
        this.cmap.forEach(ctype => {
            var divColor = document.createElement('div');
            $(divColor).attr({
                'class': 'vp-plot-cmap-item',
                'data-cmap': ctype,
                'data-url': 'pandas/cmap/' + ctype + '.JPG',
                'title': ctype
            });
            $(divColor).text(ctype == ''?'None':ctype);

            // 이미지 url 바인딩
            var url = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.RESOURCE_PATH + 'pandas/cmap/' + ctype + '.JPG';
            $(divColor).css({
                'background-image' : 'url(' + url + ')'
            });

            var selectedCmap = this.wrapSelector('#vp_selectedCmap');

            // 선택 이벤트 등록
            $(divColor).click(function() {
                if (!$(this).hasClass('selected')) {
                    $(this).parent().find('.vp-plot-cmap-item.selected').removeClass('selected');
                    $(this).addClass('selected');
                    // 선택된 cmap 이름 표시
                    $(selectedCmap).text(ctype == ''?'None':ctype);
                    // 선택된 cmap data-caption-id 변경
                    $(selectedCmap).attr('data-caption-id', ctype);
                    // select 태그 강제 선택
                    $(cmapSelector).val(ctype).prop('selected', true);
                }
            });
            $(this.wrapSelector('#vp_plotCmapSelector')).append(divColor);
        });

        // 선택 이벤트
        $(this.wrapSelector('.vp-plot-cmap-wrapper')).click(function() {
            $(this).toggleClass('open');
        });
    }

    /**
     * Pandas Plot 옵션 페이지 분리
     * @param {number} div1Count 분리할 기준 숫자 (숫자 기준으로 이후 항목들 분리) 
     */
    PandasPackage.prototype.bindOptionDivider = function(div1Count) {
        var option2 = $(this.wrapSelector('#vp_optionBox table tbody tr')).filter(':gt(2):lt(' + (div1Count) + ')');
        $(this.wrapSelector('#vp_graphicsOptionBox table tbody')).append(option2);

        // useroption to the end
        $(this.wrapSelector('#vp_optionBox table tbody')).append($(this.wrapSelector('#vp_optionBox table tbody tr:nth-child(2)')));
    }

    /**
     * 옵션 변경에 따른 이벤트 등록
     */
    PandasPackage.prototype.bindOptionEvents = function() {
        var that = this;

        // 서브플롯 선택에 따라 layout 옵션 show/hide
        var optLayout = this.wrapSelector('#layout');
        $(optLayout).closest('tr').hide();
        $(this.wrapSelector('#subplots')).change(function() {
            var checked = $(this).prop('checked');
            if (checked) {
                $(optLayout).closest('tr').show();
            }
            else {
                $(optLayout).closest('tr').hide();
            }
        });

        // on dataframe change
        $(document).on('select_suggestvalue change', this.wrapSelector('#i0'), function() {
            // dataframe columns search
            pdGen.vp_bindColumnSource(that, this, ['x', 'y']);
        });
    }

    /**
     * Pandas 기본 패키지 바인딩
     */
    PandasPackage.prototype.bindOptions = function() {
        // HTML 구성
        pdGen.vp_showInterface(this);

        $(this.wrapSelector('#x')).closest('tr').insertBefore('#vp_inputOutputBox tbody tr:last');
        $(this.wrapSelector('#y')).closest('tr').insertBefore('#vp_inputOutputBox tbody tr:last');
    };

    /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    PandasPackage.prototype.generateCode = function(addCell, exec) {
        
        try {
            var sbCode = new sb.StringBuilder();

            // 사용자 옵션 설정값 가져오기
            var userOption = new sb.StringBuilder();
            // $(this.wrapSelector('#vp_userOptionBox table tbody tr:gt(0):not(:last)')).each(function() {
            //     var key = $(this).find('td:nth-child(1) input').val();
            //     var val = $(this).find('td:nth-child(2) input').val();
            //     if (key != '' && val != '') {
            //         userOption.appendFormat(', {0}={1}', key, val);
            //     } else {
            //         throw '사용자 옵션 키/값을 입력하거나 삭제해 주세요.';
            //     }
            // });

            var package = JSON.parse(JSON.stringify(this.package));

            var userOptVal = $(this.wrapSelector('#vp_userOption')).val();
            if (userOptVal != '') {
                package.variable.push({name: 'vp_userOption', value: userOptVal});
                userOption.appendFormat(', {0}', userOptVal);
            }

            this.package = package;

            // 코드 생성
            var result = pdGen.vp_codeGenerator(this.uuid, package, userOption.toString());
            if (result == null) return "BREAK_RUN"; // 코드 생성 중 오류 발생
            sbCode.append(result);

            // cell metadata 작성하기
            // pdGen.vp_setCellMetadata(_VP_CODEMD);

            if (addCell) this.cellExecute(sbCode.toString(), exec);
        } catch (exmsg) {
            // 에러 표시
            vpCommon.renderAlertModal(exmsg);
            return "BREAK_RUN";
        }

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});