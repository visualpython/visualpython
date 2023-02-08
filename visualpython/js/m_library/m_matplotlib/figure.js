/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : figure.js
 *    Author          : Black Logic
 *    Note            : Library Component
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Figure
//============================================================================
define([
    'vp_base/js/com/component/LibraryComponent',
    'vp_base/js/com/component/VarSelector'
], function(LibraryComponent, VarSelector) {
    /**
     * Figure
     */
    class Figure extends LibraryComponent {
        _init() {
            super._init();

            this.state = {
                subplotsRows: '',
                subplotsCols: '',
                o0: 'figure',
                figsize: '',
                ...this.state
            }

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
        }

        _bindEvent() {
            super._bindEvent();

            var that = this;

            // add subplot box on changing subplots row/column
            $(this.wrapSelector('#subplotsRows')).change(function() {
                var row = $(that.wrapSelector('#subplotsRows')).val() * 1;
                var col = $(that.wrapSelector('#subplotsCols')).val() * 1;
                // nothing entered, set 1
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

                // initialize subplot value
                that.selectedIdx = '0';
                if (row > 1 && col > 1) {
                    that.selectedIdx = '0, 0';
                }
                that.subplotOption = [];
                // add space for subplot
                for (var i = 0; i < row * col; i++) {
                    that.subplotOption.push({idx: i});
                }
            });

            $(this.wrapSelector('#subplotsCols')).change(function() {
                var row = $(that.wrapSelector('#subplotsRows')).val() * 1;
                var col = $(that.wrapSelector('#subplotsCols')).val() * 1;
                // nothing entered, set 1
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

                // initialize subplot value
                that.selectedIdx = '0';
                if (row > 1 && col > 1) {
                    that.selectedIdx = '0, 0';
                }
                that.subplotOption = [];
                // add space for subplot
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

        bindCmapSelector() {
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

        templateForBody() {
            return `
                    <div class="vp-grid-box">
                        <div class="vp-grid-box vp-grid-col-95">
                            <label for="o0" class="vp-orange-text">Allocate to</label>
                            <input type="text" class="vp-input input-single" id="o0" index=0 value="fig"/>
                        </div>
                        <div class="vp-grid-box vp-grid-col-95">
                            <label for="subplotsRows">Row</label>
                            <div class="vp-grid-col-p50">
                                <input type="range" class="subplot-range" id="subplotsRowsRange" min="0" max="30" value="1"/>
                                <input type="number" class="vp-input s input-range number-only" id="subplotsRows" index=0 placeholder="row" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');" value="1"/>
                            </div>
                        </div>
                        <div class="vp-grid-box vp-grid-col-95">
                            <label for="subplotsCols">Column</label>
                            <div class="vp-grid-col-p50">
                                <input type="range" class="subplot-range" id="subplotsColsRange" min="0" max="30" value="1"/>
                                <input type="number" class="vp-input s input-range number-only" id="subplotsCols" index=1 placeholder="column" oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');" value="1"/>
                            </div>
                        </div>
                        <div class="vp-grid-box vp-grid-col-95">
                            <label for="figsize">Figure Size</label>
                            <input type="text" class="vp-input input-single" id="figsize" index=0 placeholder="(width, height)"/>
                        </div>
                    </div>`;
        }
        render() {
            super.render();
            
            // add var selector
            var varSelector = new VarSelector(['DataFrame', 'Series', 'Index'], 'DataFrame', false);
            varSelector.setComponentId('i0');
            varSelector.addClass('vp-state');
            varSelector.setUseColumn(true);
            varSelector.setValue(this.state.i0);
            $(this.wrapSelector('#i0')).replaceWith(varSelector.render());
        }

        subplotBoxClickHandler(that, event) {
            var target = event.target;
            var parent = $(target).parent();
    
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
    }

    return Figure;
});