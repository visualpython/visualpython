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
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector'
], function(varHtml, varCss, com_String, com_util, PopupComponent, DataSelector) {

    /**
     * Information
     */
    class Information extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.sizeLevel = 4;
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
                            code: "pd.DataFrame({'Null Count': ${data}.isnull().sum(), 'Non-Null Count': ${data}.notnull().sum()})", dtype: ['DataFrame', 'Series'] },
                        // { id: 'duplicates', label: 'Duplicated', code: '${data}.duplicated()', dtype: ['DataFrame', 'Series'] },
                        { id: 'duplicates', label: 'Duplicated', code: "with pd.option_context('display.max_colwidth', None):\
                            \n    _duplicated = ([${data}.duplicated().sum()] + [${data}[col].duplicated().sum() for col in df.columns])\
                            \n    _duplicated_df = pd.DataFrame({\
                            \n        'Rows':[len(${data})]*len(_duplicated),\
                            \n        'Unique':[len(${data}) - dups for dups in _duplicated],\
                            \n        'Duplicated': _duplicated,\
                            \n        'Duplicated values': [' + '.join(${data}.columns.to_list())] + ${data}.columns.to_list()\
                            \n    }, index=['Combination']+${data}.columns.to_list())\
                            \n    display(_duplicated_df)", dtype: ['DataFrame', 'Series'] },
                        { id: 'unique', label: 'Unique', code: '${data}.unique()', dtype: ['Series'] },
                        { id: 'value_counts', label: 'Value counts', code: '${data}.value_counts()', dtype: ['DataFrame', 'Series'] },
                    ]
                },
                {
                    id: 'statistics',
                    label: 'Statistics',
                    dtype: ['DataFrame', 'Series'],
                    child: [
                        { id: 'count', label: 'count', code: '${data}.count()' },
                        { id: 'min', label: 'min', code: '${data}.min()' },
                        { id: 'max', label: 'max', code: '${data}.max()' },
                        { id: 'argmin', label: 'min', code: '${data}.argmin()' },
                        { id: 'argmax', label: 'max', code: '${data}.argmax()' },
                        { id: 'quantile', label: 'quantile', code: '${data}.quantile(numeric_only=True)' },
                        { id: 'sum', label: 'sum', code: '${data}.sum()' },
                        { id: 'mean', label: 'mean', code: '${data}.mean(numeric_only=True)' },
                        { id: 'median', label: 'median', code: '${data}.median(numeric_only=True)' },
                        // { id: 'mad', label: 'mad', code: '${data}.mad(numeric_only=True)' }, // FutureWarning: Deprecated and will be removed
                        { id: 'var', label: 'var', code: '${data}.var(numeric_only=True)' },
                        { id: 'std', label: 'std', code: '${data}.std(numeric_only=True)' },
                        { id: 'skew', label: 'skew', code: '${data}.skew(numeric_only=True)' },
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
                        { id: 'count_plot', label: 'Count plot', code: "${data}.value_counts().plot(kind='bar')\nplt.show()", dtype: ['DataFrame', 'Series'] }
                    ]
                }
                
            ]
        }

        _unbindEvent() {
            super._unbindEvent();

            $(document).off('click', this.wrapSelector('.vp-information-menu'));
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;

            // change data
            $(this.wrapSelector('#data')).on('change', function() {
                let val = $(this).val();
                if (val === '') {
                    that.handleChangeData('');
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
                            $('.vp-information-menu[data-parent="statistics"][type="checkbox"]:checked').prop('checked', false);
                        } else {
                            // uncheck all radio
                            $('.vp-information-menu[data-parent="statistics"][type="radio"]:checked').prop('checked', false);
                        }
                        // allow multi-select
                        that.state.menu = menuParent;
                        that.state.menuItem = [];
                        $('.vp-information-menu[data-parent="statistics"]:checked').each((i, tag) => {
                            that.state.menuItem.push(tag.id);
                        });
                        // add selection
                        $(that.wrapSelector('.vp-information-menu')).removeClass('selected');
                        $(that.wrapSelector('.vp-information-menu[data-menu="statistics"]')).addClass('selected');
                    } else {
                        that.state.menu = menuParent;
                        that.state.menuItem = [ menuId ];
                        // remove checkbox selection for statistics
                        $(that.wrapSelector('.vp-information-menu[data-parent="statistics"] input')).prop('checked', false);
                        // add selection
                        $(that.wrapSelector('.vp-information-menu')).removeClass('selected');
                        $(this).addClass('selected');
                        $(that.wrapSelector(`.vp-information-menu[data-menu="${menuParent}"]`)).addClass('selected');
                    }

                    that.loadInfo();
                }
            });

            // click run button
            $(this.wrapSelector('.vp-information-run-button')).click(function(event) {
                // get code
                var code = that.generateCode();
                // create block and run it
                $('#vp_wrapper').trigger({
                    type: 'create_option_page', 
                    blockType: 'block',
                    menuId: 'lgExe_code',
                    menuState: { taskState: { code: code } },
                    afterAction: 'run'
                });
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
            this.loadPreview(data);
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
                        // disable item depends on dtype
                        $menu.find('.vp-dropdown-content')
                            .append($(`<div class="vp-dropdown-item vp-information-menu ${enabled?'':'disabled'} ${selected?'selected':''}" data-menu="${id}" data-parent="${menuObj.id}">${label}</div>`));
                    });
                }
                $(this.wrapSelector('.vp-information-toolbox')).append($menu);
            });
        }

        generateCode() {
            let { data, dtype, selected, menu, menuItem } = this.state;
            let currentDtype = dtype;
            let dataVar = new com_String();
            dataVar.append(data);
            if (dtype === 'DataFrame') {
                if (selected.length > 0) {
                    if (selected.length == 1) {
                        // series
                        dataVar.appendFormat("[{0}]", selected[0]);
                        currentDtype = 'Series';
                    } else {
                        // dataframe
                        dataVar.appendFormat("[[{0}]]", selected.join(','));
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
                            codePattern = com_util.formatString("pd.DataFrame({{0}})", statList.join(','));
                        } else {
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
                        codePattern = childObj.code;
                    } else {
                        codePattern = infoObj.code;
                    }
                }

                // match code pattern with data
                if (codePattern) {
                    let code = codePattern.replaceAll('${data}', dataVar.toString());
                    return code;
                }
            } else if (currentDtype == 'DataFrame') {
                // if dtype is dataframe, show describe + info preview
                let codePattern = "_desc = ${data}.describe().T\
                \n_info = pd.DataFrame({'Non-Null Count': ${data}.notnull().sum(), 'Dtype': ${data}.dtypes})\
                \ndisplay(pd.concat([_info, _desc], axis=1).fillna(''))";

                let code = codePattern.replaceAll('${data}', dataVar.toString());
                return code;
            }

            return dataVar.toString();
        }

        loadPreview(data) {
            let that = this;
            let variablePreviewTag = $(this.wrapSelector('#variablePreview'));
            $(variablePreviewTag).html('');
            // show variable information on clicking variable
            vpKernel.execute(data).then(function(resultObj) {
                let { result, type, msg } = resultObj;
                if (msg.content.data) {
                    var textResult = msg.content.data["text/plain"];
                    var htmlResult = msg.content.data["text/html"];
                    var imgResult = msg.content.data["image/png"];
                    
                    if (htmlResult != undefined) {
                        // 1. HTML tag
                        $(variablePreviewTag).append(htmlResult);
                    } else if (imgResult != undefined) {
                        // 2. Image data (base64)
                        var imgTag = '<img src="data:image/png;base64, ' + imgResult + '">';
                        $(variablePreviewTag).append(imgTag);
                    } else if (textResult != undefined) {
                        // 3. Text data
                        var preTag = document.createElement('pre');
                        $(preTag).text(textResult);
                        $(variablePreviewTag).html(preTag);
                    } else {
                        $(variablePreviewTag).append('(Select data to preview.)');
                    }
                    
                    // add event listener for columns
                    $(that.wrapSelector('.vp-variable-preview thead th')).click(function() {
                        let col = $(this).text();
                        // if ($(this).hasClass('selected')) {
                        //     $(this).removeClass('selected');
                        //     that.state.selection = that.state.selection.filter(x => x !== ("'" + col + "'"));
                        // } else {
                        //     $(this).addClass('selected');
                        //     that.state.selection.push("'" + col + "'");
                        // }

                        var idx = $(that.wrapSelector('.vp-variable-preview thead th')).index(this); // 1 ~ n
                        var hasSelected = $(this).hasClass('selected');

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
                                var tags = $(that.wrapSelector('.vp-variable-preview thead th'));
                                for (var i = idx; i <= startIdx; i++) {
                                    $(tags[i]).addClass('selected');
                                }
                                that.state.selection = { start: startIdx, end: idx };
                            } else if (startIdx <= idx) {
                                // add selection from startIdx to idx
                                var tags = $(that.wrapSelector('.vp-variable-preview thead th'));
                                for (var i = startIdx; i <= idx; i++) {
                                    $(tags[i]).addClass('selected');
                                }
                                that.state.selection = { start: startIdx, end: idx };
                            }
                        } else {
                            $(that.wrapSelector('.vp-variable-preview thead th')).removeClass('selected');
                            if (!hasSelected) {
                                $(this).addClass('selected');
                                that.state.selection = { start: idx, end: -1 };
                            } else {
                                $(this).removeClass('selected');
                            }
                        }

                        var selected = [];
                        $(that.wrapSelector('.vp-variable-preview thead th.selected')).each((idx, tag) => {
                            var label = $(tag).text();
                            selected.push("'" + label + "'"); // FIXME: get data columns and use its code
                        });
                        that.state.selected = selected;

                        // load info
                        that.renderMenu();
                        that.loadInfo();
                    });
                } else {
                    var errorContent = '';
                    if (msg.content.ename) {
                        errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue, msg.content.detail);
                    }
                    $(variablePreviewTag).html(errorContent);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                }
                
            }).catch(function(resultObj) {
                let { msg } = resultObj;
                var errorContent = '';
                if (msg.content.ename) {
                    errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue, msg.content.detail);
                }
                $(variablePreviewTag).html(errorContent);
                vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
            });
        }

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
            let code = this.generateCode();
            console.log('load info: ', code, this.state); // TEST:
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
                    if (msg.content.ename) {
                        errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue, msg.content.detail);
                    }
                    $infoPreviewTag.html(errorContent);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                }
                
            }).catch(function(resultObj) {
                let { msg } = resultObj;
                var errorContent = '';
                if (msg.content.ename) {
                    errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue, msg.content.detail);
                }
                $infoPreviewTag.html(errorContent);
                vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
            });
        }
    }

    return Information;
});