define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/container/vpContainer'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, vpContainer, pdGen) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "Figure 구성"
        , funcID : "mp_figure"  // TODO: ID 규칙 생성 필요
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
            var mpPackage = new MatplotPackage(uuid);
            mpPackage.metadata = meta;

            // 옵션 속성 할당.
            mpPackage.setOptionProp(funcOptProp);
            // html 설정.
            mpPackage.initHtml();
            callback(mpPackage);  // 공통 객체를 callback 인자로 전달
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "matplotlib/figure.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var MatplotPackage = function(uuid) {
        this.uuid = uuid;           // Load html 영역의 uuid.
        this.package = {
            name: 'plt.subplots()',
            code: '${o0}, ax = plt.subplots(${subplotsRows}, ${subplotsCols}${v})',
            input: [
                {
                    name: 'subplotsRows',
                    type: 'int',
                    label: 'Number of Rows',
                    component: 'input_single'
                },
                {
                    name: 'subplotsCols',
                    type: 'int',
                    label: 'Number of Columns',
                    component: 'input_single'
                }
            ],
            output: [
                {
                    name: 'o0',
                    type: 'var',
                    label: 'Figure Variable',
                    component: 'input_single',
                    required: true
                }
            ],
            variable: [
                {
                    name: 'figsize',
                    type: 'var'
                }
            ]
        };
        // cmap 종류
        this.cmap = [
            'viridis', 'plasma', 'inferno', 'magma', 'cividis'
            , 'Pastel1', 'Pastel2', 'Paired', 'Accent', 'Dark2', 'Set1', 'Set2', 'Set3', 'tab10', 'tab20', 'tab20b', 'tab20c'
        ];
    }



    /**
     * vpFuncJS 에서 상속
     */
    MatplotPackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    MatplotPackage.prototype.optionValidation = function() {
        return true;

        // 부모 클래스 유효성 검사 호출.
        // vpFuncJS.VpFuncJS.prototype.optionValidation.apply(this);
    }


    /**
     * html 내부 binding 처리
     */
    MatplotPackage.prototype.initHtml = function() {
        this.showFunctionTitle();

        // 차트 옵션 페이지 구성
        this.bindOption();
        this.bindSubplotRange();

        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "pandas/commonPandas.css");
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "matplotlib/figure.css");
    }

    /**
     * 선택한 패키지명 입력
     */
    MatplotPackage.prototype.showFunctionTitle = function() {
        $(this.wrapSelector('.vp_functionName')).text(this.package.name);
    }

    /**
     * 옵션 구성 이벤트 바인딩
     */
    MatplotPackage.prototype.bindOption = function() {
        var that = this;

        //subplots 행/열 입력 시 subplot 박스 추가
        $(this.wrapSelector('#subplotsRows')).change(function() {
            var row = $(that.wrapSelector('#subplotsRows')).val() * 1;
            var col = $(that.wrapSelector('#subplotsCols')).val() * 1;
            // 행/열에 아무것도 입력되어있지 않으면 1
            if (row == 0) row = 1;
            if (col == 0) col = 1;

            $(that.wrapSelector('#subplotsRowsRange')).val(row);

            $(that.wrapSelector('#vp_subplotsGrid')).attr('data-row', row);
            $(that.wrapSelector('#vp_subplotsGrid')).css('height', 80 * row + 'px');
            $(that.wrapSelector('#vp_subplotsGrid')).css('grid-template-rows', 'repeat(' + row + ', 1fr)');

            $(that.wrapSelector('#vp_subplotsGrid')).html('');

            for (var i = 0; i < row * col; i++) {
                var div = document.createElement('div');
                var r = parseInt(i / col);
                var c = i % col;
                $(div).attr({
                    'class': 'grid-item',
                    'data-idx': i,
                    'data-row': r,
                    'data-col': c
                });
                
                var position = i;
                if (row > 1 && col > 1) {
                    position = r + ', ' + c;
                }
                $(div).text('[' + position + ']');
                $(div).click(function(evt) { that.subplotBoxClickHandler(that, evt); });
                $(that.wrapSelector('#vp_subplotsGrid')).append(div);
            }

            // 서브플롯 설정값 초기화
            that.selectedIdx = '0';
            if (row > 1 && col > 1) {
                that.selectedIdx = '0, 0';
            }
            that.subplotOption = [];
            // 서브플롯에 공간 만들기
            for (var i = 0; i < row * col; i++) {
                that.subplotOption.push({idx: i});
            }
        });

        $(this.wrapSelector('#subplotsCols')).change(function() {
            var row = $(that.wrapSelector('#subplotsRows')).val() * 1;
            var col = $(that.wrapSelector('#subplotsCols')).val() * 1;
            // 행/열에 아무것도 입력되어있지 않으면 1
            if (row == 0) row = 1;
            if (col == 0) col = 1;

            $(that.wrapSelector('#subplotsColsRange')).val(col);

            $(that.wrapSelector('#vp_subplotsGrid')).attr('data-col', col);
            $(that.wrapSelector('#vp_subplotsGrid')).css('width', 80 * col + 'px');
            $(that.wrapSelector('#vp_subplotsGrid')).css('grid-template-columns', 'repeat(' + col + ', 1fr)');

            $(that.wrapSelector('#vp_subplotsGrid')).html('');

            for (var i = 0; i < row * col; i++) {
                var div = document.createElement('div');
                var r = parseInt(i / col);
                var c = i % col;
                $(div).attr({
                    'class': 'grid-item',
                    'data-idx': i,
                    'data-row': r,
                    'data-col': c
                });
                
                var position = i;
                if (row > 1 && col > 1) {
                    position = r + ', ' + c;
                }
                $(div).text('[' + position + ']');
                $(div).click(function(evt) { that.subplotBoxClickHandler(that, evt); });
                $(that.wrapSelector('#vp_subplotsGrid')).append(div);
            }

            // 서브플롯 설정값 초기화
            that.selectedIdx = '0';
            if (row > 1 && col > 1) {
                that.selectedIdx = '0, 0';
            }
            that.subplotOption = [];
            // 서브플롯에 공간 만들기
            for (var i = 0; i < row * col; i++) {
                that.subplotOption.push({idx: i});
            }
        });

        
        // subplot 위치 버튼 클릭 시 해당 subplot의 옵션 설정을 위해 다음 페이지로 이동
        // 참고 : vpContainer.js > tabPageShow($(this).index());
        // - #vp_subplot span[data-caption-id="vp_functionDetail"]
        // - #vp_subplotOptional span[data-caption-id="vp_functionDetail"]
        $(this.wrapSelector('#vp_subplotsGrid div')).click(function (evt) {
            that.subplotBoxClickHandler(that, evt);
        });
    }

    /**
     * Subplot 행/열 범위 조정 이벤트
     */
    MatplotPackage.prototype.bindSubplotRange = function() {
        var that = this;
        // range 변경 시 값 표시
        $(this.wrapSelector('#subplotsRowsRange')).change(function() {
            var value = $(this).val();
            $(that.wrapSelector('#subplotsRows')).val(value);
            $(that.wrapSelector('#subplotsRows')).change();
        });
        $(this.wrapSelector('#subplotsColsRange')).change(function() {
            var value = $(this).val();
            $(that.wrapSelector('#subplotsCols')).val(value);
            $(that.wrapSelector('#subplotsCols')).change();
        });
    }

    /**
     * 서브플롯 버튼 클릭 이벤트핸들러
     */
    MatplotPackage.prototype.subplotBoxClickHandler = function(that, event) {
        var target = event.target;
        var parent = $(target).parent();
        // TODO: 설정하고 있던 서브플롯이 있었다면 설정값 저장

        // 다음 옵션 페이지 이동
        var thisPageIdx = $(target).closest(vpConst.OPTION_PAGE).index();
        vpContainer.tabPageShow(thisPageIdx + 1);

        // 다음 옵션 페이지의 위치 설명란에 [0,0] 표기
        var row = $(target).data('row');
        var col = $(target).data('col');
        
        // 표기 : row나 col이 하나라도 1이면 1차원, 그 이상이면 2차원 배열로 접근
        var position = $(target).data('idx');
        var rowLen = $(parent).data('row') * 1;
        var colLen = $(parent).data('col') * 1;
        
        if (rowLen > 1 && colLen > 1) { // TODO: parent().data-row / data-col 받아와야댐
            position = row + ', ' + col;
        }
        // 선택한 서브플롯 인덱스 설정
        that.selectedIdx = position + '';

        $(that.wrapSelector('span[data-caption-id="pageTitle"]'))[1].innerText = 'Subplot [' + position + '] Setting';
        $(that.wrapSelector('span[data-caption-id="pageTitle"]'))[2].innerText = 'Subplot [' + position + '] Add Chart';
    }

    

    /**
     * 색상 스타일 선택지 구현
     */
    MatplotPackage.prototype.bindCmapSelector = function() {
        // 기존 cmap 선택하는 select 태그 안보이게
        var cmapSelector = this.wrapSelector('#cmap');
        $(cmapSelector).hide();

        // cmap 데이터로 팔레트 div 동적 구성
        this.cmap.forEach(ctype => {
            var divColor = document.createElement('div');
            $(divColor).attr({
                'class': 'vp-plot-cmap-item',
                'data-cmap': ctype,
                'data-url': 'pandas/cmap/' + ctype + '.JPG',
                'title': ctype
            });
            $(divColor).text(ctype);
            // 이미지 url 바인딩
            var url = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.RESOURCE_PATH + 'pandas/cmap/' + ctype + '.JPG';
            $(divColor).css({
                'background-image' : 'url(' + url + ')'
            })

            var selectedCmap = this.wrapSelector('#vp_selectedCmap');

            // 선택 이벤트 등록
            $(divColor).click(function() {
                if (!$(this).hasClass('selected')) {
                    $(this).parent().find('.vp-plot-cmap-item.selected').removeClass('selected');
                    $(this).addClass('selected');
                    // 선택된 cmap 이름 표시
                    $(selectedCmap).text(ctype);
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
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    MatplotPackage.prototype.generateCode = function(addCell, exec) {
        
        var sbCode = new sb.StringBuilder();
        

        // 사용자 옵션 설정값 가져오기
        // var userOption = new sb.StringBuilder();
        // $(this.wrapSelector('#vp_userOption table tr:gt(0):not(:last)')).each(function() {
        //     var key = $(this).find('td:nth-child(1) input').val();
        //     var val = $(this).find('td:nth-child(2) input').val();
        //     userOption.appendFormat(', {0}={1}', key, val);
        // });

        // 코드 생성
        var figureCode = pdGen.vp_codeGenerator(this.uuid, this.package);
        if (figureCode == null) return "BREAK_RUN"; // 코드 생성 중 오류 발생

        sbCode.append(figureCode);
        // cell metadata 작성하기
        // pdGen.vp_setCellMetadata(_VP_CODEMD);
        

        if (addCell) this.cellExecute(sbCode.toString(), exec);

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});