/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Information.js
 *    Author          : Black Logic
 *    Note            : Apps > Information
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 04. 05
 *    Change Date     :
 */

//============================================================================
// [CLASS] Information
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_apps/information.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_apps/information'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/com/component/LoadingSpinner'
], function(varHtml, varCss, com_String, com_util, com_interface, PopupComponent, DataSelector, LoadingSpinner) {

    /**
     * Information
     */
    class Information extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.sizeLevel = 5;
            this.config.dataview = false;
            this.config.runButton = false;
            this.config.checkModules = ['pd', 'plt'];

            this.state = {
                data: '',
                selected: [],  // selected items depend on dtype (ex. DataFrame - columns)
                menu: '',       // selected menu id
                menuItem: [],   // selected menu item
                // DataFrame
                selection: {    // selection of columns
                    start: -1,
                    end: -1
                },
                columnLevel: 1,
                columnList: [],
                indexLevel: 1,
                indexList: [],
                lines: TABLE_LINES,
                ...this.state
            }

            this.menuList = [
                {
                    id: 'general',
                    label: 'General',
                    dtype: ['DataFrame', 'Series'],
                    child: [
                        { id: 'info', label: 'Info', code: '${data}.info()', dtype: ['DataFrame', 'Series'] },
                        { id: 'describe', label: 'Describe', code: '${data}.describe()', dtype: ['DataFrame', 'Series'] },
                        { id: 'head', label: 'Head', code: '${data}.head()', dtype: ['DataFrame', 'Series'] },
                        { id: 'tail', label: 'Tail', code: '${data}.tail()', dtype: ['DataFrame', 'Series'] },
                    ]
                },
                {
                    id: 'status',
                    label: 'Status',
                    dtype: ['DataFrame', 'Series'],
                    child: [
                        { id: 'null_count', label: 'Null count', 
                            code: "pd.DataFrame({'Null Count': ${data}.isnull().sum(), 'Non-Null Count': ${data}.notnull().sum()})", dtype: ['DataFrame', 'Series'], toframe: true },
                        // { id: 'duplicates', label: 'Duplicated', code: '${data}.duplicated()', dtype: ['DataFrame', 'Series'] },
                        { id: 'duplicates', label: 'Duplicated', code: "_duplicated = ([${data}.duplicated().sum()] + [${data}[col].duplicated().sum() for col in ${data}.columns])\
\n_duplicated_df = pd.DataFrame({\
\n    'Rows':[len(${data})]*len(_duplicated),\
\n    'Unique':[len(${data}) - dups for dups in _duplicated],\
\n    'Duplicated': _duplicated,\
\n    'Duplicated by': ['All columns'] + ${data}.columns.to_list()\
\n}, index=['Combination']+${data}.columns.to_list())\
\n_duplicated_df", dtype: ['DataFrame', 'Series'], toframe: true },
                        { id: 'unique', label: 'Unique', code: '${data}.unique()', dtype: ['Series'] },
                        { id: 'value_counts', label: 'Value counts', 
                        // code: "_value_counts_dict = {}\
                        // \nfor col in ${data}.columns:\
                        // \n    if pd.api.types.is_numeric_dtype(${data}[col]):\
                        // \n        _value_counts = ${data}[col].value_counts(bins=10, sort=False)\
                        // \n        _value_counts_dict[(col, 'bins')] = list(_value_counts.index) + ['']*(10 - len(_value_counts))\
                        // \n    else:\
                        // \n        _value_counts = ${data}[col].value_counts()\
                        // \n        _value_counts_dict[(col, 'category')] = list(_value_counts.index) + ['']*(10 - len(_value_counts))\
                        // \n    _value_counts_dict[(col, 'count')] = list(_value_counts.values) + ['']*(10 - len(_value_counts))\
                        // \npd.DataFrame(_value_counts_dict)", 
                        code: "_dfr = pd.DataFrame()\
\nfor col in ${data}.columns:\
\n    if pd.api.types.is_numeric_dtype(${data}[col]) and  ${data}[col].value_counts().size > 10:\
\n        _value_counts = ${data}[col].value_counts(bins=10, sort=False)\
\n        _dfr = pd.concat([_dfr, pd.DataFrame({(col,'bins'): _value_counts.index})], axis=1)\
\n    else:\
\n        _value_counts = ${data}[col].value_counts()\
\n        _dfr = pd.concat([_dfr, pd.DataFrame({(col,'category'): _value_counts.index})], axis=1)\
\n    _dfr = pd.concat([_dfr, pd.DataFrame({(col,'count'): _value_counts.values})], axis=1)\
\n_dfr.replace(np.nan,'')",
                        code2: "${data}.value_counts()",
                        dtype: ['DataFrame', 'Series'], toframe: true },
                    ]
                },
                {
                    id: 'statistics',
                    label: 'Statistics',
                    dtype: ['DataFrame', 'Series'],
                    child: [
                        /** checkbox */
                        { id: 'count', label: 'count', code: '${data}.count()' },
                        { id: 'min', label: 'min', code: '${data}.min(numeric_only=True)' },
                        { id: 'max', label: 'max', code: '${data}.max(numeric_only=True)' },
                        { id: 'quantile', label: 'quantile', code: '${data}.quantile(numeric_only=True)' },
                        { id: 'sum', label: 'sum', code: '${data}.sum(numeric_only=True)' },
                        { id: 'mean', label: 'mean', code: '${data}.mean(numeric_only=True)' },
                        { id: 'median', label: 'median', code: '${data}.median(numeric_only=True)' },
                        // { id: 'mad', label: 'mad', code: '${data}.mad(numeric_only=True)' }, // FutureWarning: Deprecated and will be removed
                        { id: 'var', label: 'var', code: '${data}.var(numeric_only=True)' },
                        { id: 'std', label: 'std', code: '${data}.std(numeric_only=True)' },
                        { id: 'skew', label: 'skew', code: '${data}.skew(numeric_only=True)' },
                        { id: 'kurtosis', label: 'kurtosis', code: '${data}.kurtosis(numeric_only=True)' },
                        /** radio */
                        { id: 'cumsum', label: 'cumsum', code: '${data}.cumsum()', type: 'radio' },
                        { id: 'cummin', label: 'cummin', code: '${data}.cummin()', type: 'radio' },
                        { id: 'cummax', label: 'cummax', code: '${data}.cummax()', type: 'radio' },
                        { id: 'cumprod', label: 'cumprod', code: '${data}.cumprod()', type: 'radio' },
                        { id: 'diff', label: 'diff', code: '${data}.diff()', type: 'radio' },
                        { id: 'pct_change', label: 'pct_change', code: '${data}.pct_change()', type: 'radio' }
                    ]
                },
                {
                    id: 'corr_menu',
                    label: 'Correlation',
                    dtype: ['DataFrame'],
                    child: [
                        { id: 'corr', label: 'Correlation table', code: '${data}.corr(numeric_only=True)', dtype: ['DataFrame'] },
                        { id: 'corr_matrix', label: 'Correlation matrix'
                            , code: "_corr = ${data}.corr(numeric_only=True)\n_corr.style.background_gradient(cmap='coolwarm')", dtype: ['DataFrame'] },
                    ]
                },
                {
                    id: 'distribution',
                    label: 'Distribution',
                    dtype: ['DataFrame', 'Series'],
                    child: [
                        { id: 'hist', label: 'Histogram', code: "${data}.hist()\nplt.show()", dtype: ['DataFrame', 'Series'] },
                        { id: 'scatter_matrix', label: 'Scatter matrix'
                            , code: "pd.plotting.scatter_matrix(${data}, marker='o', hist_kwds={'bins': 30}, s=30, alpha=.8)\nplt.show()"
                            , dtype: ['DataFrame'] },
                        { id: 'boxplot', label: 'Box plot', code: "${data}.plot(kind='box')\nplt.show()", dtype: ['DataFrame', 'Series'] },
                        { id: 'count_plot', label: 'Count plot', code: "${data}.value_counts().plot(kind='bar', rot=30)\nplt.show()", dtype: ['DataFrame', 'Series'] }
                    ]
                }
                
            ];

            this.loading = false;
        }

        _unbindEvent() {
            super._unbindEvent();

            $(document).off('click', this.wrapSelector('.vp-popup-body'));
            $(document).off('click', this.wrapSelector('.vp-information-menu'));
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;

            // change data
            $(this.wrapSelector('#data')).on('change', function() {
                let val = $(this).val();
            });

            // un-select every selection
            $(document).on('click', this.wrapSelector('.vp-variable-table'), function(evt) {
                evt.stopPropagation();
                var target = evt.target;
                // if(!$(target).is("input") && !$(target).is("label")) {
                if (that.state.selected.length > 0) {
                    if ($('.vp-dropdown-content').find(target).length == 0 
                        && !$(target).hasClass('vp-dropdown-content') ) {
                        $(that.wrapSelector('.vp-variable-table thead th')).removeClass('selected');
                        that.state.selected = [];
                        
                        // load menu
                        that.renderMenu();
                        // load info
                        that.loadInfo();
                    }
                }

            });

            // click menu
            $(document).on('click', this.wrapSelector('.vp-information-menu:not(.disabled)'), function(event) {
                event.stopPropagation();
                let menuId = $(this).data('menu');
                let menuParent = $(this).data('parent');
                
                if (menuParent) {
                    if (menuParent === 'statistics') {
                        let menuType = $(this).attr('type'); // checkbox or radio
                        if (menuType === 'radio') {
                            // uncheck all checkbox
                            $(that.wrapSelector('.vp-information-menu[data-parent="statistics"][type="checkbox"]:checked')).prop('checked', false);
                        } else {
                            // uncheck all radio
                            $(that.wrapSelector('.vp-information-menu[data-parent="statistics"][type="radio"]:checked')).prop('checked', false);
                        }
                        // allow multi-select
                        that.state.menu = menuParent;
                        that.state.menuItem = [];
                        $('.vp-information-menu[data-parent="statistics"]:checked').each((i, tag) => {
                            that.state.menuItem.push(tag.id);
                        });
                        // add selection
                        $(that.wrapSelector('.vp-information-menu')).removeClass('selected');
                        if (that.state.menuItem.length > 0) {
                            $(that.wrapSelector('.vp-information-menu[data-menu="statistics"]')).addClass('selected');
                        } else {
                            // all selection removed from statistics
                            that.state.menu = '';
                        }
                    } else {
                        that.state.menu = menuParent;
                        that.state.menuItem = [ menuId ];
                        // remove checkbox selection for statistics
                        $(that.wrapSelector('.vp-information-menu[data-parent="statistics"]:checked')).prop('checked', false);
                        // add selection
                        $(that.wrapSelector('.vp-information-menu')).removeClass('selected');
                        $(this).addClass('selected');
                        $(that.wrapSelector(`.vp-information-menu[data-menu="${menuParent}"]`)).addClass('selected');
                    }

                    that.loadInfo();
                }
            });

            // column group selection
            // select column group
            $(document).on('click', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN_GROUP), function(evt) {
                evt.stopPropagation();

                let hasSelected = $(this).hasClass('selected');
                let colLabel = $(this).data('label');
                let firstIdx = $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${colLabel}"]:first`)).index();
                let lastIdx = $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${colLabel}"]:last`)).index();
                if (firstIdx === lastIdx) {
                    lastIdx = -1;
                }

                $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW)).removeClass('selected');

                if (vpEvent.keyManager.keyCheck.ctrlKey) {
                    if (!hasSelected) {
                        that.state.selection = { start: firstIdx, end: -1 };
                        $(this).addClass('selected');
                        $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${colLabel}"]`)).addClass('selected');
                    } else {
                        $(this).removeClass('selected');
                        $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${colLabel}"]`)).removeClass('selected');
                    }
                } else if (vpEvent.keyManager.keyCheck.shiftKey) {
                    var startIdx = that.state.selection.start;
                    
                    if (startIdx == -1) {
                        // no selection
                        that.state.selection = { start: firstIdx, end: -1 };
                    } else if (startIdx > firstIdx) {
                        // add selection from idx to startIdx
                        var tags = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN));
                        let parentSet = new Set();
                        for (var i = firstIdx - 1; i <= startIdx; i++) {
                            $(tags[i]).addClass('selected');
                            parentSet.add($(tags[i]).data('parent'));
                        }
                        parentSet.forEach(parentKey => {
                            let length = $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${parentKey}"]`)).length;
                            let selectedLength = $(that.wrapSelector(`.${VP_FE_TABLE} th.selected[data-parent="${parentKey}"]`)).length;
                            if (length === selectedLength) {
                                $(that.wrapSelector(`.${VP_FE_TABLE} th[data-label="${parentKey}"]`)).addClass('selected');
                            } else {
                                $(that.wrapSelector(`.${VP_FE_TABLE} th[data-label="${parentKey}"]`)).removeClass('selected');
                            }
                        });
                        that.state.selection = { start: startIdx, end: firstIdx };
                    } else if (startIdx <= firstIdx) {
                        // add selection from startIdx to idx
                        var tags = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN));
                        let parentSet = new Set();
                        for (var i = startIdx; i < lastIdx; i++) {
                            $(tags[i]).addClass('selected');
                            parentSet.add($(tags[i]).data('parent'));
                        }
                        parentSet.forEach(parentKey => {
                            let length = $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${parentKey}"]`)).length;
                            let selectedLength = $(that.wrapSelector(`.${VP_FE_TABLE} th.selected[data-parent="${parentKey}"]`)).length;
                            if (length === selectedLength) {
                                $(that.wrapSelector(`.${VP_FE_TABLE} th[data-label="${parentKey}"]`)).addClass('selected');
                            } else {
                                $(that.wrapSelector(`.${VP_FE_TABLE} th[data-label="${parentKey}"]`)).removeClass('selected');
                            }
                        });
                        that.state.selection = { start: startIdx, end: lastIdx };
                    }
                } else {
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN)).removeClass('selected');
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN_GROUP)).removeClass('selected');

                    $(this).addClass('selected');
                    $(that.wrapSelector(`.${VP_FE_TABLE} th[data-parent="${colLabel}"]`)).addClass('selected');
                    that.state.selection = { start: firstIdx, end: lastIdx };
                }
                var selected = [];
                $(that.wrapSelector(`.${VP_FE_TABLE} th:not(.${VP_FE_TABLE_COLUMN_GROUP}).selected`)).each((idx, tag) => {
                    var label = $(tag).text();
                    var code = $(tag).data('code');
                    var type = $(tag).data('type');
                    selected.push({ label: label, code: code, type: type });
                });
                that.state.selected = selected;

                // load info
                that.renderMenu();
                that.loadInfo();
            });

            // column selection
            // select column
            $(document).on('click', this.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN), function(evt) {
                evt.stopPropagation();

                var idx = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN)).index(this); // 1 ~ n
                var hasSelected = $(this).hasClass('selected');

                $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_ROW)).removeClass('selected');

                if (vpEvent.keyManager.keyCheck.ctrlKey) {
                    if (!hasSelected) {
                        that.state.selection = { start: idx, end: -1 };
                        $(this).addClass('selected');
                    } else {
                        $(this).removeClass('selected');
                    }
                    
                } else if (vpEvent.keyManager.keyCheck.shiftKey) {
                    var startIdx = that.state.selection.start;
                    
                    if (startIdx == -1) {
                        // no selection
                        that.state.selection = { start: idx, end: -1 };
                    } else if (startIdx > idx) {
                        // add selection from idx to startIdx
                        var tags = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN));
                        for (var i = idx; i <= startIdx; i++) {
                            $(tags[i]).addClass('selected');
                        }
                        that.state.selection = { start: startIdx, end: idx };
                    } else if (startIdx <= idx) {
                        // add selection from startIdx to idx
                        var tags = $(that.wrapSelector('.' + VP_FE_TABLE_COLUMN));
                        for (var i = startIdx; i <= idx; i++) {
                            $(tags[i]).addClass('selected');
                        }
                        that.state.selection = { start: startIdx, end: idx };
                    }
                } else {
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN)).removeClass('selected');
                    $(that.wrapSelector('.' + VP_FE_TABLE + ' .' + VP_FE_TABLE_COLUMN_GROUP)).removeClass('selected');

                    $(this).addClass('selected');
                    that.state.selection = { start: idx, end: -1 };
                }
                // select its group
                $(that.wrapSelector(`.${VP_FE_TABLE} th[data-label="${$(this).data('parent')}"]`)).addClass('selected');

                var selected = [];
                $(that.wrapSelector(`.${VP_FE_TABLE} th:not(.${VP_FE_TABLE_COLUMN_GROUP}).selected`)).each((idx, tag) => {
                    var label = $(tag).text();
                    var code = $(tag).data('code');
                    var type = $(tag).data('type');
                    selected.push({ label: label, code: code, type: type });
                });
                that.state.selected = selected;

                // load info
                that.renderMenu();
                that.loadInfo();
            });

            // click more button for more rows
            $(document).on('click', this.wrapSelector('.' + VP_FE_TABLE_MORE), function() {
                that.state.lines += TABLE_LINES;
                that.loadCode(that.state.data, true);
            });


            // click run button
            $(this.wrapSelector('.vp-information-run-button')).click(function(event) {
                // get code
                var code = that.generateCodeForInfo();
                // DEPRECATED: no longer save to block as default
                // create block and run it
                // $('#vp_wrapper').trigger({
                //     type: 'create_option_page', 
                //     blockType: 'block',
                //     menuId: 'lgExe_code',
                //     menuState: { taskState: { code: code } },
                //     afterAction: 'run'
                // });
                com_interface.insertCell('code', code, true, 'Data Analysis > Data Info');
            });
        }

        handleChangeData(data, dtype) {
            this.state.data = data;
            this.state.dtype = dtype;
            this.state.menu = '';
            this.state.menuItem = [];
            this.state.selected = [];
            this.state.selection = { start: -1, end: -1 };
            this.renderMenu();
            $(this.wrapSelector('.' + VP_FE_TABLE)).html('');
            this.loadCode(data);
            this.loadInfo(data, this.state.menu);
        }

        templateForBody() {
            /** Implement generating template */
            let that = this;
            let page = $(varHtml);

            // add Data Selector
            let targetSelector = new DataSelector({
                pageThis: this, id: 'data', placeholder: 'Select data',
                finish: function(value, dtype) {
                    // $(that.wrapSelector('#data')).trigger({type: 'change', value: value, dtype: dtype});
                    that.handleChangeData(value, dtype);
                },
                select: function(value, dtype) {
                    // $(that.wrapSelector('#data')).trigger({type: 'change', value: value, dtype: dtype});
                    that.handleChangeData(value, dtype);
                    // that.updateValue(value);
                    // that.reloadInsEditor();
                }
            });
            $(page).find('#data').replaceWith(targetSelector.toTagString());

            return page;
        }

        render() {
            super.render();

            this.renderMenu();
        }

        renderMenu() {
            let that = this;
            $(this.wrapSelector('.vp-information-toolbox')).html('');
            // get current dtype
            let currentDtype = this.state.dtype;
            if (currentDtype === 'DataFrame' && this.state.selected.length == 1) {
                currentDtype = 'Series';
            }
            // add menu list
            this.menuList & this.menuList.forEach(menuObj => {
                // show menu list dynamically
                let { id, label, child, dtype } = menuObj;
                let enabled = dtype.includes(currentDtype);
                let selected = id === that.state.menu;
                let $menu = $(`<div class="vp-dropdown ${enabled?'':'disabled'}">
                    <div class="vp-information-menu vp-drop-button ${enabled?'':'disabled'} ${selected?'selected':''}" data-menu="${id}">${label}</div>
                    <div class="vp-dropdown-content"></div>
                </div>`);
                if (id === 'statistics') {
                    $menu.find('.vp-dropdown-content').css({'width': '300px'});
                    $menu.find('.vp-dropdown-content').append(`<div class="vp-information-multi-box"></div><hr style="margin: 5px 0;"><div class="vp-information-single-box"></div>`);
                    child && child.forEach(itemObj => {
                        let { id, label, type='checkbox' } = itemObj;
                        let selected = that.state.menuItem.includes(id);
                        if (type === 'checkbox') {
                            // checkbox to allow multi-select
                            $menu.find('.vp-dropdown-content .vp-information-multi-box')
                                .append($(`<label style="padding: 0 5px;"><input type="checkbox" id="${id}" value="${id}" ${selected?'checked':''} class="vp-information-menu" data-menu="${id}" data-parent="${menuObj.id}"><span>${label}</span></label>`));
                        } else {
                            // radio to allow only single-select
                            $menu.find('.vp-dropdown-content .vp-information-single-box')
                                .append($(`<label style="padding: 0 5px;"><input type="radio" name="statistics" id="${id}" value="${id}" ${selected?'checked':''} class="vp-information-menu" data-menu="${id}" data-parent="${menuObj.id}"><span>${label}</span></label>`));
                        }
                    });
                } else {
                    child && child.forEach(itemObj => {
                        let { id, label, dtype } = itemObj;
                        let enabled = dtype.includes(currentDtype);
                        let selected = that.state.menuItem.includes(id);
                        if (enabled === false && selected === true) {
                            // if disabled menu is selected, remove selection
                            $menu.find('.vp-information-menu').removeClass('selected');
                            selected = false;
                            that.state.menu = '';
                            that.state.menuItem = [];
                        }
                        // disable item depends on dtype
                        $menu.find('.vp-dropdown-content')
                            .append($(`<div class="vp-dropdown-item vp-information-menu ${enabled?'':'disabled'} ${selected?'selected':''}" data-menu="${id}" data-parent="${menuObj.id}">${label}</div>`));
                    });
                }
                $(this.wrapSelector('.vp-information-toolbox')).append($menu);
            });
        }

        renderTable(renderedText, isHtml=true) {
            var tag = new com_String();
            // Table
            tag.appendFormatLine('<div class="{0} {1} {2}">', VP_FE_TABLE, 'vp_rendered_html', 'vp-scrollbar');
            if (isHtml) {
                tag.appendFormatLine('<table class="dataframe">{0}</table>', renderedText);
                // More button
                tag.appendFormatLine('<div class="{0} {1}">Show more</div>', VP_FE_TABLE_MORE, 'vp-button');
            } else {
                tag.appendFormatLine('<pre>{0}</pre>', renderedText);
            }
            tag.appendLine('</div>'); // End of Table
            return tag.toString();
        }

        generateCode() {
            return this.tempCode;
        }

        generateCodeForInfo() {
            let { data, dtype, menu, menuItem } = this.state;

            var selected = [];
            $(this.wrapSelector(`.${VP_FE_TABLE} th:not(.${VP_FE_TABLE_COLUMN_GROUP}).selected`)).each((idx, tag) => {
                var label = $(tag).text();
                var code = $(tag).data('code');
                var type = $(tag).data('type');
                selected.push({ label: label, code: code, type: type });
            });
            this.state.selected = selected;
            
            let currentDtype = dtype;
            let dataVar = new com_String();
            dataVar.append(data);
            if (dtype === 'DataFrame') {
                if (selected.length > 0) {
                    if (selected.length == 1) {
                        // series
                        dataVar.appendFormat("[{0}]", selected[0].code);
                        currentDtype = 'Series';
                    } else {
                        // dataframe
                        dataVar.appendFormat("[[{0}]]", selected.map(col=>col.code).join(','));
                    }
                }
            }
            
            if (menu && menu !== '') {
                // get code pattern string
                let codePattern = '';

                // add info methods
                let infoObj = this.menuList.find(obj=>obj.id === menu);
                if (menu === 'statistics') {
                    // allow multi-select
                    if (menuItem && menuItem.length > 0) {
                        if (menuItem.length > 1) {
                            let statList = [];
                            menuItem && menuItem.forEach(itemId => {
                                let childObj = infoObj.child.find(obj=>obj.id === itemId);
                                statList.push(com_util.formatString("'{0}': {1}", itemId, childObj.code));
                            });
                            if (currentDtype === 'Series' && selected.length > 0) {
                                // if multiple stats selected, set series data as dataframe
                                dataVar = new com_String();
                                dataVar.appendFormat("{0}[[{1}]]", data, selected.map(col=>col.code).join(','));
                                currentDtype = 'DataFrame';
                            }
                            codePattern = com_util.formatString("pd.DataFrame({{0}})", statList.join(','));
                        } else {
                            if (currentDtype === 'Series' && selected.length > 0) {
                                // if multiple stats selected, set series data as dataframe
                                dataVar = new com_String();
                                dataVar.appendFormat("{0}[[{1}]]", data, selected.map(col=>col.code).join(','));
                                currentDtype = 'DataFrame';
                            }
                            let childObj = infoObj.child.find(obj=>obj.id === menuItem[0]);
                            codePattern = childObj.code;
                        }
                    } else {
                        codePattern = infoObj.code;
                    }
                } else {
                    // only one method selected
                    if (menuItem.length > 0 && infoObj.child) {
                        let childObj = infoObj.child.find(obj=>obj.id === menuItem[0]);
                        if (menuItem[0] === 'value_counts') {
                            if (currentDtype === 'Series') {
                                codePattern = childObj.code2;
                            } else {
                                codePattern = childObj.code;
                            }
                        } else {
                            if (childObj.toframe === true) {
                                if (dtype === 'Series') {
                                    dataVar = new com_String();
                                    dataVar.appendFormat("{0}.to_frame()", data);
                                    currentDtype = 'DataFrame';
                                } else if (currentDtype === 'Series') { // DataFrame with single column selected
                                    dataVar = new com_String();
                                    dataVar.appendFormat("{0}[[{1}]]", data, selected.map(col=>col.code).join(','));
                                    currentDtype = 'DataFrame';
                                }
                            }
                            codePattern = childObj.code;
                        }
                    } else {
                        codePattern = infoObj.code;
                    }
                }

                // match code pattern with data
                if (codePattern) {
                    let code = codePattern.replaceAll('${data}', dataVar.toString());
                    return code;
                }
            } 
            // else if (currentDtype == 'DataFrame') {
            //     // if dtype is dataframe, show describe + info preview
            //     let codePattern = "_desc = ${data}.describe().T\
            //     \n_info = pd.DataFrame({'Non-Null Count': ${data}.notnull().sum(), 'Dtype': ${data}.dtypes})\
            //     \ndisplay(pd.concat([_info, _desc], axis=1).fillna(''))";

            //     let code = codePattern.replaceAll('${data}', dataVar.toString());
            //     return code;
            // }

            // add ignore options TODO:
            // let ignoreCode = `import warnings\
            // \nwith warnings.catch_warnings():
            // \n    warnings.simplefilter("ignore")\n`;

            return `display(${dataVar.toString()})`;
        }

        loadCode(codeStr, more=false) {
            if (this.loading === true) {
                return;
            }
    
            var that = this;
            let { data, lines, indexList } = this.state;
            var prevLines = 0;
            var scrollPos = -1;
            if (more) {
                prevLines = indexList.length;
                scrollPos = $(this.wrapSelector('.vp-variable-table')).scrollTop();
            }
    
            var code = new com_String();
            code.appendLine(codeStr);
            code.appendFormat("{0}.iloc[{1}:{2}].to_json(orient='{3}')", data, prevLines, lines, 'split');
            
            this.loading = true;
            vpKernel.execute(code.toString()).then(function(resultObj) {
                let { result } = resultObj;
                try {
                    if (!result || result.length <= 0) {
                        return;
                    }
                    result = result.substr(1,result.length - 2).replaceAll('\\\\', '\\');
                    result = result.replaceAll('\'', "\\'");    // TEST: need test
                    // result = result.replaceAll('\\"', "\"");
                    var dataJson = JSON.parse(result);
                    
                    vpKernel.getColumnList(data).then(function(colResObj) {
                        try {
                            let columnResult = colResObj.result;
                            var columnInfo = JSON.parse(columnResult);
                            let { name:columnName='', level:columnLevel, list:columnList } = columnInfo;
                            // var columnList = data.columns;
                            var indexList = dataJson.index;
                            var dataList = dataJson.data;

                            columnList = columnList.map(col => { return { label: col.label, type: col.dtype, code: col.value } });
                            indexList = indexList.map(idx => { return { label: idx, code: idx } });
            
                            if (!more) {
                                // table
                                var table = new com_String();
                                // table.appendFormatLine('<table border="{0}" class="{1}">', 1, 'dataframe');
                                table.appendLine('<thead>');
                                if (columnLevel > 1) {
                                    for (let colLevIdx = 0; colLevIdx < columnLevel; colLevIdx++) {
                                        table.appendLine('<tr><th></th>');
                                        let colIdx = 0;
                                        let colSpan = 1;
                                        while (colIdx < columnList.length) {
                                            let col = columnList[colIdx];
                                            let colCode = col.code.slice(0, colLevIdx + 1).join(',');
                                            let nextCol = columnList[colIdx + 1];
                                            if (nextCol && nextCol.code.slice(0, colLevIdx + 1).join(',') === colCode) {
                                                colSpan++;
                                            } else {
                                                let colClass = '';
                                                let selected = ''; // set class if it's leaf node of columns on multi-level
                                                if (that.state.selected.map(col=>col.code[colLevIdx]).includes(colCode)) {
                                                    selected = 'selected';
                                                }
                                                if ((columnLevel - 1) === colLevIdx) {
                                                    colClass = VP_FE_TABLE_COLUMN;
                                                } else {
                                                    colClass = VP_FE_TABLE_COLUMN_GROUP;
                                                }
                                                table.appendFormatLine('<th data-code="({0})" data-axis="{1}" data-type="{2}" data-parent="{3}" data-label="{4}" class="{5} {6}" colspan="{7}">{8}</th>'
                                                                , colCode, FRAME_AXIS.COLUMN, col.type, col.label[colLevIdx-1], col.label[colLevIdx], colClass, selected, colSpan, col.label[colLevIdx]);
                                                colSpan = 1;
                                            }
                                            colIdx++;
                                        }
                        
                                        table.appendLine('</tr>');
                                    }
                                } else {
                                    table.appendLine('<tr><th></th>');
                                    columnList && columnList.forEach(col => {
                                        var colCode = col.code;
                                        var colClass = '';
                                        if (that.state.selected.map(col=>col.code).includes(colCode)) {
                                            colClass = 'selected';
                                        }
                                        table.appendFormatLine('<th data-code="{0}" data-axis="{1}" data-type="{2}" data-label="{3}" class="{4} {5}">{6}</th>'
                                                                , colCode, FRAME_AXIS.COLUMN, col.type, col.label, VP_FE_TABLE_COLUMN, colClass, col.label);
                                    });
                                    table.appendLine('</tr>');
                                }
                                table.appendLine('</thead>');
                                table.appendLine('<tbody>');
                
                                dataList && dataList.forEach((row, idx) => {
                                    table.appendLine('<tr>');
                                    var idxName = indexList[idx].label;
                                    var idxLabel = com_util.convertToStr(idxName, typeof idxName == 'string');
                                    var idxClass = '';
                                    table.appendFormatLine('<th data-code="{0}" data-axis="{1}" class="{2} {3}">{4}</th>', idxLabel, FRAME_AXIS.ROW, VP_FE_TABLE_ROW, idxClass, idxName);
                                    row.forEach((cell, colIdx) => {
                                        if (cell == null) {
                                            cell = 'NaN';
                                        }
                                        var cellType = columnList[colIdx].type;
                                        if (cellType.includes('datetime')) {
                                            cell = new Date(parseInt(cell)).toLocaleString();
                                        }
                                        table.appendFormatLine('<td>{0}</td>', cell);
                                    });
                                    table.appendLine('</tr>');
                                });
                                // add row
                                table.appendLine('<tr>');
                                table.appendLine('</tr>');
                                table.appendLine('</tbody>');
                                $(that.wrapSelector('.' + VP_FE_TABLE)).replaceWith(function() {
                                    return that.renderTable(table.toString());
                                });
                            } else {
                                var table = new com_String();
                                dataList && dataList.forEach((row, idx) => {
                                    table.appendLine('<tr>');
                                    var idxName = indexList[idx].label;
                                    var idxLabel = com_util.convertToStr(idxName, typeof idxName == 'string');
                                    var idxClass = '';
                                    table.appendFormatLine('<th data-code="{0}" data-axis="{1}" class="{2} {3}">{4}</th>', idxLabel, FRAME_AXIS.ROW, VP_FE_TABLE_ROW, idxClass, idxName);
                                    row.forEach((cell, colIdx) => {
                                        if (cell == null) {
                                            cell = 'NaN';
                                        }
                                        var cellType = columnList[colIdx].type;
                                        if (cellType.includes('datetime')) {
                                            cell = new Date(parseInt(cell)).toLocaleString();
                                        }
                                        table.appendFormatLine('<td>{0}</td>', cell);
                                    });
                                    table.appendLine('</tr>');
                                });
                                // insert before last tr tag(add row button)
                                $(table.toString()).insertBefore($(that.wrapSelector('.' + VP_FE_TABLE + ' tbody tr:last')));
                            }
        
                            // save columnList & indexList as state
                            that.state.columnLevel = columnLevel;
                            that.state.columnList = columnList;
                            if (!more) {
                                that.state.indexList = indexList;
                            } else {
                                that.state.indexList = that.state.indexList.concat(indexList);
                            }
                            
                            // if scrollPos is saved, go to the position
                            if (scrollPos >= 0) {
                                $(that.wrapSelector('.vp-variable-table')).scrollTop(scrollPos);
                            }
            
                            that.loading = false;
                        } catch (err1) {
                            vpLog.display(VP_LOG_TYPE.ERROR, err1);
                            that.loading = false;
                            throw err1;
                        }
                    });
                } catch (err) {
                    vpLog.display(VP_LOG_TYPE.ERROR, err);
                    that.loading = false;
                }
            }).catch(function(resultObj) {
                let { msg } = resultObj;
                var errorContent = '';
                if (msg.content && msg.content.ename) {
                    errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content?.evalue, msg.content?.detail);
                }
                vpLog.display(VP_LOG_TYPE.ERROR, msg.content?.ename, msg.content?.evalue, msg.content);
                $(variablePreviewTag).html(errorContent);
                that.loading = false;
            });
    
            return code.toString();
        }

        /**
         * Load information preview
         */
        loadInfo() {
            let that = this;
            let { menu, menuItem } = this.state;

            $(this.wrapSelector('#informationPreviewTitle')).text('');
            if (menu) {
                let { label, child } = this.menuList.find(x => x.id === menu);
                let menuItemLabelList = child.filter(x => menuItem.includes(x.id)).map(x => x.label);
    
                // load preview title
                $(this.wrapSelector('#informationPreviewTitle')).text(com_util.formatString('{0} > {1}', label, menuItemLabelList.join(', ')));
            }
            // load preview content
            let $infoPreviewTag = $(this.wrapSelector('#informationPreview'));
            $infoPreviewTag.html('');
            let code = this.generateCodeForInfo();
            this.tempCode = code;

            // use default pandas option
            // let defaultPOCode = new com_String();
            // defaultPOCode.appendLine("with pd.option_context('display.min_rows', 10, 'display.max_rows', 60, 'display.max_columns', 0, 'display.max_colwidth', 50, 'display.expand_frame_repr', True, 'display.precision', 6, 'display.chop_threshold', None):");
            // defaultPOCode.append('    ' + code.replaceAll('\n', '\n    '));

            let loadingSpinner = new LoadingSpinner($(this.wrapSelector('#informationPreview')));
            // show variable information on clicking variable
            vpKernel.execute(code).then(function(resultObj) {
                let { result, type, msg } = resultObj;
                if (type !== 'error' && result) {
                    $infoPreviewTag.html('');
                    if (type == 'text/html') {
                        // 1. HTML tag
                        $infoPreviewTag.append(result);
                    } else if (type == 'image/png') {
                        // 2. Image data (base64)
                        var imgTag = '<img src="data:image/png;base64, ' + result + '">';
                        $infoPreviewTag.append(imgTag);
                    } else if (type == 'text/plain' || type == 'text') {
                        // 3. Text data
                        var preTag = document.createElement('pre');
                        $(preTag).text(result);
                        $infoPreviewTag.html(preTag);
                    } else {
                        $infoPreviewTag.append('(Select data to preview.)');
                    }
                } else {
                    var errorContent = '';
                    if (msg.content && msg.content.ename) {
                        errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue, msg.content.detail);
                    }
                    $infoPreviewTag.html(errorContent);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content?.ename, msg.content?.evalue, msg.content);
                }
            }).catch(function(resultObj) {
                let { msg, ename, evalue } = resultObj;
                var errorContent = '';
                if (msg && msg?.content?.ename) {
                    errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue, msg.content.detail);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content?.ename, msg.content?.evalue, msg.content);
                } else if (ename && evalue) {
                    errorContent = com_util.templateForErrorBox(ename, evalue);
                    vpLog.display(VP_LOG_TYPE.ERROR, ename, evalue, resultObj);
                }
                $infoPreviewTag.html(errorContent);
            }).finally(function() {
                loadingSpinner.remove();
            });
        }
    }

    // search rows count at once
    const TABLE_LINES = 10;

    const VP_FE_TABLE = 'vp-variable-table';
    const VP_FE_TABLE_COLUMN = 'vp-variable-table-column';
    const VP_FE_TABLE_COLUMN_GROUP = 'vp-variable-table-column-group';
    const VP_FE_TABLE_ROW = 'vp-variable-table-row';
    const VP_FE_TABLE_MORE = 'vp-variable-table-more';

    const FRAME_AXIS = {
        NONE: -1,
        ROW: 0,
        COLUMN: 1
    }

    return Information;
});