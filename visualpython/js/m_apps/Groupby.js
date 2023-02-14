/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Groupby.js
 *    Author          : Black Logic
 *    Note            : Apps > Groupby
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Groupby
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_apps/groupby.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_apps/groupby'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/MultiSelector'
], function(gbHtml, gbCss, com_Const, com_String, com_util, PopupComponent, SuggestInput, MultiSelector) {

    /**
     * Groupby
     */
    class Groupby extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.size = { width: 700, height: 550 };
            this.config.checkModules = ['pd'];

            this.periodList = [
                { label: 'business day', value: 'B'},
                { label: 'custom business day', value: 'C'},
                { label: 'calendar day', value: 'D'},
                { label: 'weekly', value: 'W'},
                { label: 'month end', value: 'M'},
                { label: 'semi-month end', value: 'SM'},
                { label: 'business month end', value: 'BM'},
                { label: 'custom business month end', value: 'CBM'},
                { label: 'month start', value: 'MS'},
                { label: 'semi-month start', value: 'SMS'},
                { label: 'business month start', value: 'BMS'},
                { label: 'custom business month start', value: 'CBMS'},
                { label: 'quarter end', value: 'Q'},
                { label: 'business quarter end', value: 'BQ'},
                { label: 'quarter start', value: 'QS'},
                { label: 'business quarter start', value: 'BQS'},
                { label: 'year end', value: 'Y'},
                { label: 'business year end', value: 'BY'},
                { label: 'year start', value: 'YS'},
                { label: 'business year start', value: 'BYS'},
                { label: 'business hour', value: 'BH'},
                { label: 'hourly', value: 'H'},
                { label: 'minutely', value: 'min'},
                { label: 'secondly', value: 'S'},
                { label: 'milliseconds', value: 'ms'},
                { label: 'microseconds', value: 'us'},
                { label: 'nanoseconds', value: 'N'}
            ]

            this.methodList = [
                { label: 'None', value: '' },
                { label: 'count', value: 'count' },
                { label: 'first', value: 'first' },
                { label: 'last', value: 'last' },
                { label: 'size', value: 'size' },
                { label: 'std', value: 'std' },
                { label: 'sum', value: 'sum' },
                { label: 'max', value: 'max' },
                { label: 'mean', value: 'mean' },
                { label: 'median', value: 'median' },
                { label: 'min', value: 'min' },
                { label: 'quantile', value: 'quantile' },
            ]

            this.state = {
                variable: '',
                groupby: [],
                useGrouper: false,
                grouperNumber: 0,
                grouperPeriod: this.periodList[0].value,
                display: [],
                method: this.methodList[0].value,
                advanced: false,
                allocateTo: '',
                resetIndex: false,

                advPageDom: '',
                advColList: [],
                advNamingList: [],
                ...this.state
            };

            this.popup = {
                type: '',
                targetSelector: '',
                ColSelector: undefined
            }

            
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;
            //====================================================================
            // User operation Events
            //====================================================================
            // variable change event
            $(document).on('change', this.wrapSelector('#vp_gbVariable'), function() {
                // if variable changed, clear groupby, display
                var newVal = $(this).val();
                if (newVal != that.state.variable) {
                    $(that.wrapSelector('#vp_gbBy')).val('');
                    $(that.wrapSelector('#vp_gbDisplay')).val('');
                    that.state.variable = newVal;
                    that.state.groupby = [];
                    that.state.display = [];
                }
            });

            // variable refresh event
            $(document).on('click', this.wrapSelector('.vp-gb-df-refresh'), function() {
                that.loadVariableList();
            });

            // groupby change event
            $(document).on('change', this.wrapSelector('#vp_gbBy'), function(event) {
                var colList = event.dataList;
                that.state.groupby = colList;
                
                if (colList && colList.length == 1
                    && colList[0].type.includes('datetime')) {
                    $(that.wrapSelector('#vp_gbByGrouper')).removeAttr('disabled');
                } else {
                    $(that.wrapSelector('#vp_gbByGrouper')).attr('disabled', true);
                }
            });

            // groupby select button event
            $(document).on('click', this.wrapSelector('#vp_gbBy'), function() {
                that.openColumnSelector($(that.wrapSelector('#vp_gbBy')), 'Select columns to group');
            });

            // groupby grouper event
            $(document).on('change', this.wrapSelector('#vp_gbByGrouper'), function() {
                var useGrouper = $(this).prop('checked');
                that.state.useGrouper = useGrouper;

                if (useGrouper == true) {
                    $(that.wrapSelector('.vp-gb-by-grouper-box')).show();
                } else {
                    $(that.wrapSelector('.vp-gb-by-grouper-box')).hide();
                }
            });

            // grouper number change event
            $(document).on('change', this.wrapSelector('#vp_gbByGrouperNumber'), function() {
                that.state.grouperNumber = $(this).val();
            });

            // grouper period change event
            $(document).on('change', this.wrapSelector('#vp_gbByGrouperPeriod'), function() {
                that.state.grouperPeriod = $(this).val();
            });

            // display change event
            $(document).on('change', this.wrapSelector('#vp_gbDisplay'), function(event) {
                var colList = event.dataList;
                that.state.display = colList;

                if (colList && colList.length == 1) {
                    $(that.wrapSelector('#vp_gbToFrame')).parent().show();
                } else {
                    $(that.wrapSelector('#vp_gbToFrame')).parent().hide();
                }
            });

            // display select button event
            $(document).on('click', this.wrapSelector('#vp_gbDisplay'), function() {
                that.openColumnSelector($(that.wrapSelector('#vp_gbDisplay')), 'Select columns to display');
            });

            // method select event
            $(document).on('change', this.wrapSelector('#vp_gbMethodSelect'), function() {
                var method = $(this).val();
                that.state.method = method;
                $(that.wrapSelector('#vp_gbMethod')).val(method);
            });

            // advanced checkbox event
            $(document).on('change', this.wrapSelector('#vp_gbAdvanced'), function() {
                var advanced = $(this).prop('checked');
                that.state.advanced = advanced;

                if (advanced == true) {
                    // change method display
                    $(that.wrapSelector('#vp_gbMethod')).val('aggregate');
                    $(that.wrapSelector('#vp_gbMethodSelect')).hide();
                    $(that.wrapSelector('#vp_gbMethod')).show();
                    // show advanced box
                    $(that.wrapSelector('.vp-gb-adv-box')).show();
                } else {
                    $(that.wrapSelector('#vp_gbMethod')).val('sum');
                    $(that.wrapSelector('#vp_gbMethodSelect')).show();
                    $(that.wrapSelector('#vp_gbMethod')).hide();
                    // hide advanced box
                    $(that.wrapSelector('.vp-gb-adv-box')).hide();
                }
            });

            
            // allocateTo event
            $(document).on('change', this.wrapSelector('#vp_gbAllocateTo'), function() {
                that.state.allocateTo = $(this).val();
            });

            // to dataframe event
            $(document).on('change', this.wrapSelector('#vp_gbToFrame'), function() {
                that.state.toFrame = $(this).prop('checked') == true;
            });
            
            // reset index checkbox event
            $(document).on('change', this.wrapSelector('#vp_gbResetIndex'), function() {
                that.state.resetIndex = $(this).prop('checked');
            });
            
            //====================================================================
            // Advanced box Events
            //====================================================================
            // add advanced item
            $(document).on('click', this.wrapSelector('#vp_gbAdvAdd'), function() {
                that.renderAdvancedItem();
            });

            // advanced item - column change event
            $(document).on('change', this.wrapSelector('.vp-gb-adv-col'), function(event) {
                var colList = event.dataList;
                var idx = $(that.wrapSelector('.vp-gb-adv-col')).index(this);
                
                // if there's change, reset display namings
                // var previousList = that.state.advColList[idx];
                // if (!previousList || colList.length !== previousList.length 
                //     || !colList.map(col=>col.code).slice().sort().every((val, idx) => { 
                //         return val === previousList.map(col=>col.code).slice().sort()[idx]
                //     })) {
                //     that.state.advNamingList = []
                //     $(this).parent().find('.vp-gb-adv-naming').val('');
                //     $(this).parent().find('.vp-gb-adv-naming').data('dict', {});
                // }
                var namingDict = that.state.advNamingList[idx];
                if (namingDict) {
                    // namingDict = namingDict.filter(key => colList.map(col=>col.code).includes(key));
                    Object.keys(namingDict).forEach(key => {
                        if (!colList.map(col=>col.code).includes(key)) {
                            delete namingDict[key];
                        }
                    });
                    that.state.advNamingList[idx] = namingDict;
                    $(this).parent().find('.vp-gb-adv-naming').val(Object.values(namingDict).map(val => "'" + val +"'").join(','));
                    $(this).parent().find('.vp-gb-adv-naming').data('dict', namingDict);
                }

                that.state.advColList[idx] = colList;
            });

            // edit target columns
            $(document).on('click', this.wrapSelector('.vp-gb-adv-col'), function() {
                var includeList = that.state.display;
                if (includeList && includeList.length > 0) {
                    includeList = includeList.map(col => col.code);
                }
                that.openColumnSelector($(this).parent().find('.vp-gb-adv-col'), 'Select columns', includeList);
            });

            // select method
            $(document).on('change', this.wrapSelector('.vp-gb-adv-method-selector'), function() {
                var method = $(this).val();
                var parentDiv = $(this).parent();
                if (method == 'typing') {
                    // change it to typing input
                    $(parentDiv).find('.vp-gb-adv-method-selector').hide();
                    $(parentDiv).find('.vp-gb-adv-method').val('');
                    $(parentDiv).find('.vp-gb-adv-method-box').show();
                } else {
                    $(parentDiv).find('.vp-gb-adv-method').val(com_util.formatString("'{0}'", method));
                }
            });

            // return to selecting method
            $(document).on('click', this.wrapSelector('.vp-gb-adv-method-return'), function() {
                var defaultValue = '';
                var parentDiv = $(this).parent().parent();
                $(parentDiv).find('.vp-gb-adv-method-selector').val(defaultValue);
                $(parentDiv).find('.vp-gb-adv-method').val(defaultValue);
                // show and hide
                $(parentDiv).find('.vp-gb-adv-method-selector').show();
                $(parentDiv).find('.vp-gb-adv-method-box').hide();
            });

            // advanced item - naming change event
            $(document).on('change', this.wrapSelector('.vp-gb-adv-naming'), function(event) {
                var namingDict = event.namingDict;
                var idx = $(that.wrapSelector('.vp-gb-adv-naming')).index(this);
                that.state.advNamingList[idx] = namingDict;
            });

            // edit columns naming
            $(document).on('click', this.wrapSelector('.vp-gb-adv-naming'), function() {
                var parentDiv = $(this).parent();
                var columns = $(parentDiv).find('.vp-gb-adv-col').data('list');
                if (columns && columns.length > 0) {
                    columns = columns.map(col => col.code);
                }
                var method = $(parentDiv).find('.vp-gb-adv-method').val();
                if (!method || method == '' || method == "''") {
                    // set focus on selecting method tag
                    $(parentDiv).find('.vp-gb-adv-method').focus();
                    return;
                }
                that.openNamingPopup($(parentDiv).find('.vp-gb-adv-naming'), columns, method);
            });

            // delete advanced item
            $(document).on('click', this.wrapSelector('.vp-gb-adv-item-delete'), function() {
                if ($(that.wrapSelector('.vp-gb-adv-item')).length > 1) {
                    $(this).closest('.vp-gb-adv-item').remove();
                }
            });
        }

        /**
         * Unbind events
         */
        _unbindEvent() {
            super._unbindEvent();
            // user operation event
            $(document).off('change', this.wrapSelector('#vp_gbVariable'));
            $(document).off('click', this.wrapSelector('.vp-gb-df-refresh'));
            $(document).off('change', this.wrapSelector('#vp_gbBy'));
            $(document).off('click', this.wrapSelector('#vp_gbBy'));
            $(document).off('change', this.wrapSelector('#vp_gbByGrouper'));
            $(document).off('change', this.wrapSelector('#vp_gbByGrouperNumber'));
            $(document).off('change', this.wrapSelector('#vp_gbByGrouperPeriod'));
            $(document).off('change', this.wrapSelector('#vp_gbDisplay'));
            $(document).off('click', this.wrapSelector('#vp_gbDisplay'));
            $(document).off('change', this.wrapSelector('#vp_gbMethodSelect'));
            $(document).off('change', this.wrapSelector('#vp_gbAdvanced'));
            $(document).off('change', this.wrapSelector('#vp_gbAllocateTo'));
            $(document).off('change', this.wrapSelector('#vp_gbToFrame'));
            $(document).off('change', this.wrapSelector('#vp_gbResetIndex'));

            $(document).off('click', this.wrapSelector('#vp_gbAdvAdd'));
            $(document).off('change', this.wrapSelector('.vp-gb-adv-col'));
            $(document).off('click', this.wrapSelector('.vp-gb-adv-col'));
            $(document).off('change', this.wrapSelector('.vp-gb-adv-method-selector'));
            $(document).off('click', this.wrapSelector('.vp-gb-adv-method-return'));
            $(document).off('change', this.wrapSelector('.vp-gb-adv-naming'));
            $(document).off('click', this.wrapSelector('.vp-gb-adv-naming'));
            $(document).off('click', this.wrapSelector('.vp-gb-adv-item-delete'));
            $(document).off('click.' + this.uuid);
        }

        templateForBody() {
            return gbHtml;
        }

        /**
         * Template for variable list (for dataframe)
         * @param {Array<object>} varList
         * @param {string} defaultValue previous value
         */
        templateForVariableList(varList, defaultValue='') {
            // var tag = new com_String();
            // tag.appendFormatLine('<select id="{0}">', 'vp_gbVariable');
            // varList.forEach(vObj => {
            //     // varName, varType
            //     var label = vObj.varName;
            //     tag.appendFormatLine('<option value="{0}" data-type="{1}" {2}>{3}</option>'
            //                         , vObj.varName, vObj.varType
            //                         , defaultValue == vObj.varName?'selected':''
            //                         , label);
            // });
            // tag.appendLine('</select>'); // VP_VS_VARIABLES
            // return tag.toString();
            let mappedList = varList.map(obj => { return { label: obj.varName, value: obj.varName, dtype: obj.varType } });

            var variableInput = new SuggestInput();
            variableInput.setComponentID('vp_gbVariable');
            variableInput.addClass('vp-state');
            variableInput.setPlaceholder('Select variable');
            variableInput.setSuggestList(function () { return mappedList; });
            variableInput.setNormalFilter(true);
            variableInput.addAttribute('required', true);
            variableInput.setValue(defaultValue);

            return variableInput.toTagString();
        }

        /**
         * Template for advanced item and return it
         * @returns Advanced box's item
         */
        templateForAdvancedItem() {
            var page = new com_String();
            page.appendFormatLine('<div class="{0}">', 'vp-gb-adv-item');
            // target columns
            page.appendFormatLine('<input type="text" class="{0}" placeholder="{1}" title="{2}" readonly/>'
                                , 'vp-gb-adv-col', 'Column list', 'Apply All columns, if not selected');
            // method select
            page.appendFormatLine('<select class="{0}">', 'vp-gb-adv-method-selector');
            var defaultMethod = '';
            page.appendFormatLine('<option value="{0}">{1}</option>', '', 'Select method type');
            page.appendFormatLine('<option value="{0}">{1}</option>', 'typing', 'Typing');
            page.appendLine('<option disabled>-----------------------</option>');
            this.methodList.forEach(method => {
                if (method.value == '') {
                    return;
                }
                page.appendFormatLine('<option value="{0}">{1}</option>', method.value, method.label);
            });
            page.appendLine('</select>');
            page.appendFormatLine('<div class="{0}" style="display: none;">', 'vp-gb-adv-method-box');
            page.appendFormatLine('<input type="text" class="{0}" placeholder="{1}" value="{2}"/>', 'vp-gb-adv-method', 'Type function name', "'" + defaultMethod + "'");
            // page.appendFormatLine('<i class="fa fa-search {0}"></i>', 'vp-gb-adv-method-return');
            // LAB: img to url
            // page.appendFormatLine('<img src="{0}" class="{1}" title="{2}">'
            //                     , com_Const.IMAGE_PATH + 'arrow_left.svg', 'vp-gb-adv-method-return', 'Return to select method');
            page.appendFormatLine('<div class="{0} {1}" title="{2}"></div>'
                                , 'vp-icon-arrow-left', 'vp-gb-adv-method-return', 'Return to select method');
            page.appendLine('</div>');
            // naming
            page.appendFormatLine('<input type="text" class="{0}" placeholder="{1}" data-dict={} readonly/>', 'vp-gb-adv-naming', 'Display name');
            // delete button
            // LAB: img to url
            // page.appendFormatLine('<div class="{0} {1}"><img src="{2}"/></div>', 'vp-gb-adv-item-delete', 'vp-cursor', com_Const.IMAGE_PATH + 'close_small.svg');
            page.appendFormatLine('<div class="{0} {1} {2}"></div>', 'vp-gb-adv-item-delete', 'vp-cursor', 'vp-icon-close-small');
            page.appendLine('</div>');
            return page.toString();
        }

        templateForDataView() {
            return '';
        }

        renderDataView() {
            super.renderDataView();

            this.loadDataPage();
            $(this.wrapSelector('.vp-popup-dataview-box')).css('height', '300px');
        }

        renderDataPage(renderedText, isHtml = true) {
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} vp-close-on-blur vp-scrollbar">', 'rendered_html'); // 'rendered_html' style from jupyter output area
            if (isHtml) {
                tag.appendLine(renderedText);
            } else {
                tag.appendFormatLine('<pre>{0}</pre>', renderedText);
            }
            tag.appendLine('</div>');
            $(this.wrapSelector('.vp-popup-dataview-box')).html(tag.toString());
        }

        loadDataPage() {
            var that = this;
            var code = this.generateCode();
            // if not, get output of all data in selected pandasObject
            vpKernel.execute(code).then(function(resultObj) {
                let { msg } = resultObj;
                if (msg.content.data) {
                    var htmlText = String(msg.content.data["text/html"]);
                    var codeText = String(msg.content.data["text/plain"]);
                    if (htmlText != 'undefined') {
                        that.renderDataPage(htmlText);
                    } else if (codeText != 'undefined') {
                        // plain text as code
                        that.renderDataPage(codeText, false);
                    } else {
                        that.renderDataPage('');
                    }
                } else {
                    var errorContent = '';
                    if (msg.content.ename) {
                        errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                    }
                    that.renderDataPage(errorContent);
                    vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
                }
            }).catch(function(resultObj) {
                let { msg } = resultObj;
                var errorContent = '';
                if (msg.content.ename) {
                    errorContent = com_util.templateForErrorBox(msg.content.ename, msg.content.evalue);
                }
                that.renderDataPage(errorContent);
                vpLog.display(VP_LOG_TYPE.ERROR, msg.content.ename, msg.content.evalue, msg.content);
            });
        }

        render() {
            super.render();

            this.loadVariableList();
            this.renderPeriodList();
            this.renderMethodList();
            this.renderAdvancedItem();
        }

        renderPeriodList() {
            let page = new com_String();
            page.appendFormatLine('<select id="{0}">', 'vp_gbByGrouperPeriod');
            var savedPeriod = this.state.period;
            this.periodList.forEach(period => {
                page.appendFormatLine('<option value="{0}"{1}>{2}</option>', period.value, savedPeriod==period.value?' selected':'',period.label);
            });
            page.appendLine('</select>');
            $(this.wrapSelector('#vp_gbByGrouperPeriod')).replaceWith(page.toString());
        }

        renderMethodList() {
            let page = new com_String();
            page.appendFormatLine('<select id="{0}">', 'vp_gbMethodSelect');
            var savedMethod = this.state.method;
            this.methodList.forEach(method => {
                page.appendFormatLine('<option value="{0}"{1}>{2}</option>', method.value, savedMethod==method.value?' selected':'',method.label);
            });
            page.appendLine('</select>');
            $(this.wrapSelector('#vp_gbMethodSelect')).replaceWith(page.toString());
        }

        renderAdvancedItem() {
            $(this.templateForAdvancedItem()).insertBefore($(this.wrapSelector('#vp_gbAdvAdd')));
        }

        /**
         * Render column selector using MultiSelector module
         * @param {Array<string>} previousList previous selected columns
         * @param {Array<string>} includeList columns to include 
         */
        renderMultiSelector(previousList, includeList) {
            this.popup.ColSelector = new MultiSelector(this.wrapSelector('.vp-inner-popup-body'),
                { mode: 'columns', parent: [this.state.variable], selectedList: previousList, includeList: includeList }
            );
        }

        /**
         * Render naming box
         * @param {Array<string>} columns 
         * @param {string} method 
         * @param {Object} previousDict 
         * @returns 
         */
         renderNamingBox(columns, method, previousDict) {
            var page = new com_String();
            page.appendFormatLine('<div class="{0}">', 'vp-gb-naming-box');
            if (columns && columns.length > 0) {
                page.appendFormatLine('<label>Replace {0} as ...</label>', method);
                columns.forEach(col => {
                    page.appendFormatLine('<div class="{0}">', 'vp-gb-naming-item');
                    page.appendFormatLine('<label>{0}</label>', col);
                    var previousValue = '';
                    if (previousDict[col]) {
                        previousValue = previousDict[col];
                    }
                    page.appendFormatLine('<input type="text" class="{0}" placeholder="{1}" value="{2}" data-code="{3}"/>'
                                        , 'vp-gb-naming-text', 'Name to replace ' + method, previousValue, col);
                    page.appendLine('</div>');
                });
            } else {
                var previousValue = '';
                if (previousDict[method]) {
                    previousValue = previousDict[method];
                }
                page.appendFormatLine('<div class="{0}">', 'vp-gb-naming-item');
                page.appendFormatLine('<label>{0}</label>', method);
                page.appendFormatLine('<input type="text" class="{0}" placeholder="{1}" value="{2}" data-code="{3}"/>'
                                    , 'vp-gb-naming-text', 'Name to replace ' + method, previousValue, method);
                page.appendLine('</div>');
            }
            page.appendLine('</div>');
            $(this.wrapSelector('.vp-inner-popup-body')).html(page.toString());
        }

        generateCode() {
            var code = new com_String();
            var { 
                variable, groupby, useGrouper, grouperNumber, grouperPeriod, 
                display, method, advanced, allocateTo, toFrame, resetIndex 
            } = this.state;

            if (!variable || variable == '') {
                return '';
            }

            // mapping colList states
            groupby = groupby.map(col => col.code);
            display = display.map(col => col.code);

            //====================================================================
            // Allocation
            //====================================================================
            if (allocateTo && allocateTo != '') {
                code.appendFormat('{0} = ', allocateTo);
            }

            //====================================================================
            // Dataframe variable & Groupby(with Grouper) columns
            //====================================================================
            var byStr = '';
            if (groupby.length <= 1) {
                byStr = groupby.join('');
            } else {
                byStr = '[' + groupby.join(',') + ']';
            }

            // Grouper
            if (useGrouper) {
                byStr = com_util.formatString("pd.Grouper(key={0}, freq='{1}')", byStr, grouperNumber + grouperPeriod);
            } else if (resetIndex === true) {
                // as_index option cannot use with Grouper -> use .reset_index() at the end
                byStr += ', as_index=False';
            }
            // variable & groupby columns & option
            code.appendFormat('{0}.groupby({1})', variable, byStr);

            //====================================================================
            // Display columns
            //====================================================================
            var colStr = '';
            if (display) {
                if (toFrame || display.length > 1) {
                    // over 2 columns
                    colStr = '[[' + display.join(',') + ']]';
                } else if (display.length == 1) {
                    // for 1 column
                    colStr = '[' + display.join('') + ']';
                } 
            }

            //====================================================================
            // Aggregation/Method code generation
            //====================================================================
            var methodStr = new com_String();
            if (advanced) {
                //================================================================
                // Aggregation code generation
                //================================================================
                methodStr.append('agg(');
                // prepare variables for aggregation
                var advItemTags = $(this.wrapSelector('.vp-gb-adv-item'));
                if (advItemTags && advItemTags.length > 0) {
                    var advColumnDict = {
                        'nothing': []
                    }
                    for (var i = 0; i < advItemTags.length; i++) {
                        var advColumns = $(advItemTags[i]).find('.vp-gb-adv-col').data('list');
                        if (advColumns && advColumns.length > 0) {
                            advColumns = advColumns.map(col => col.code);
                        }
                        var advMethod = $(advItemTags[i]).find('.vp-gb-adv-method').val();
                        var advNaming = $(advItemTags[i]).find('.vp-gb-adv-naming').data('dict');
                        if (!advMethod || advMethod == '' || advMethod == "''") {
                            continue;
                        }
                        if (advColumns && advColumns.length > 0) {
                            advColumns.forEach(col => {
                                var naming = advNaming[col];
                                if (naming && naming != '') {
                                    naming = "'" + naming + "'";
                                }
                                if (Object.keys(advColumnDict).includes(col)) {
                                    advColumnDict[col].push({ method: advMethod, naming: naming})
                                } else {
                                    advColumnDict[col] = [{ method: advMethod, naming: naming}];
                                }
                            });

                        } else {
                            var naming = advNaming[advMethod];
                            if (naming && naming != '') {
                                naming = "'" + naming + "'";
                            }
                            advColumnDict['nothing'].push({ method: advMethod, naming: naming});
                        }
                    }

                    // if target columns not selected
                    if (Object.keys(advColumnDict).length == 1) {
                        // EX) .agg([('average', 'mean'), ('maximum value', max')])
                        var noColList = advColumnDict['nothing'];
                        if (noColList.length == 1) {
                            // 1 method
                            if (noColList[0].naming && noColList[0].naming != '') {
                                methodStr.appendFormat("[({0}, {1})]", noColList[0].naming, noColList[0].method);
                            } else {
                                methodStr.appendFormat("{0}", noColList[0].method);
                            }
                        } else {
                            // more than 1 method
                            var tmpList = [];
                            noColList.forEach(obj => {
                                if (obj.naming && obj.naming != '') {
                                    tmpList.push(com_util.formatString("({0}, {1})", obj.naming, obj.method));
                                } else {
                                    tmpList.push(obj.method);
                                }
                            });
                            methodStr.appendFormat("[{0}]", tmpList.join(', '));
                        }
                    } else {
                        // EX) .agg({'col1':[('average', 'mean')], 'col2': 'max')})
                        // apply method with empty column to all columns(display)
                        var noColList = advColumnDict['nothing'];
                        delete advColumnDict['nothing'];
                        noColList.forEach(obj => {
                            display.forEach(col => {
                                if (Object.keys(advColumnDict).includes(col)) {
                                    if (advColumnDict[col].filter(x => x.method == obj.method).length == 0) {
                                        advColumnDict[col].push({ method: obj.method, naming: obj.naming})
                                    }
                                } else {
                                    advColumnDict[col] = [{ method: obj.method, naming: obj.naming}];
                                }
                            });
                        });

                        // with target columns
                        var tmpList1 = [];
                        Object.keys(advColumnDict).forEach(key => {
                            var colList = advColumnDict[key];
                            var tmpList2 = [];
                            var useTuple = false;
                            colList.forEach(obj => {
                                if (obj.naming && obj.naming != '') {
                                    tmpList2.push(com_util.formatString("({0}, {1})", obj.naming, obj.method));
                                    useTuple = true;
                                } else {
                                    tmpList2.push(obj.method);
                                }
                            });
                            var tmpStr = tmpList2.join(',');
                            if (tmpList2.length > 1 || useTuple) {
                                tmpStr = '[' + tmpStr + ']';
                            }
                            tmpList1.push(com_util.formatString("{0}: {1}", key, tmpStr));
                        });
                        methodStr.appendFormat('{{0}}', tmpList1.join(', '));
                    }
                }
                methodStr.append(')');
            } else {
                //================================================================
                // Method code generation
                //================================================================
                if (method != '') {
                    methodStr.appendFormat('{0}()', method);
                }
            }

            if (method != '' || advanced) {
                // when using as_index option with Grouper, use .reset_index()
                if (useGrouper && resetIndex) {
                    methodStr.append('.reset_index()');
                }
                // display columns
                code.appendFormat('{0}.{1}', colStr, methodStr.toString());
            }
            
            if (allocateTo && allocateTo != '') {
                code.appendLine();
                code.append(allocateTo);
            }
            return code.toString();
        }

        /**
         * Load state and set values on components
         * @param {object} state 
         */
        loadState() {
            super.loadState();
            var {
                variable, groupby, useGrouper, grouperNumber, grouperPeriod, 
                display, method, advanced, allocateTo, toFrame, resetIndex,
                advPageDom, advColList, advNamingList
            } = this.state;

            $(this.wrapSelector('#vp_gbVariable')).val(variable);
            $(this.wrapSelector('#vp_gbBy')).val(groupby.map(col=>col.code).join(','));
            $(this.wrapSelector('#vp_gbBy')).data('list', groupby);
            if (useGrouper) {
                $(this.wrapSelector('#vp_gbByGrouper')).removeAttr('disabled');
                $(this.wrapSelector('#vp_gbByGrouper')).prop('checked', useGrouper);
                $(this.wrapSelector('#vp_gbByGrouperNumber')).val(grouperNumber);
                $(this.wrapSelector('#vp_gbByGrouperPeriod')).val(grouperPeriod);
                $(this.wrapSelector('.vp-gb-by-grouper-box')).show();
            }
            $(this.wrapSelector('#vp_gbDisplay')).val(display.map(col=>col.code).join(','));
            $(this.wrapSelector('#vp_gbDisplay')).data('list', display);
            $(this.wrapSelector('#vp_gbMethod')).val(method);
            $(this.wrapSelector('#vp_gbMethodSelector')).val(method);
            $(this.wrapSelector('#vp_gbAdvanced')).prop('checked', advanced);
            if (advanced) {
                $(this.wrapSelector('#vp_gbAdvanced')).trigger('change');
            }
            $(this.wrapSelector('#vp_gbAllocateTo')).val(allocateTo);
            $(this.wrapSelector('#vp_gbToFrame')).val(toFrame);
            $(this.wrapSelector('#vp_gbResetIndex')).prop('checked', resetIndex);

            if (advPageDom != '') {
                $(this.wrapSelector('.vp-gb-adv-box')).html(advPageDom);
            }
            
            advColList.forEach((arr, idx) => {
                $($(this.wrapSelector('.vp-gb-adv-col'))[idx]).data('list', arr);
            });
            advNamingList.forEach((obj, idx) => {
                $($(this.wrapSelector('.vp-gb-adv-naming'))[idx]).data('dict', obj);
            });
        }

        /**
         * Save now state of components
         */
        saveState() {
            super.saveState();
            // save input state
            $(this.wrapSelector('.vp-gb-adv-box input')).each(function () {
                this.defaultValue = this.value;
            });

            // save checkbox state
            $(this.wrapSelector('.vp-gb-adv-box input[type="checkbox"]')).each(function () {
                this.defaultValue = this.value;
            });

            // save select state
            $(this.wrapSelector('.vp-gb-adv-box select > option')).each(function () {
                if (this.selected) {
                    this.setAttribute("selected", true);
                } else {
                    this.removeAttribute("selected");
                }
            });
            
            // save advanced box
            this.state.advPageDom = $(this.wrapSelector('.vp-gb-adv-box')).html();
        }

        /**
         * Open Inner popup page for column selection
         * @param {Object} targetSelector 
         * @param {string} title 
         * @param {Array<string>} includeList 
         */
        openColumnSelector(targetSelector, title='Select columns', includeList=[]) {
            this.popup.type = 'column';
            this.popup.targetSelector = targetSelector;
            var previousList = this.popup.targetSelector.data('list');
            if (previousList) {
                previousList = previousList.map(col => col.code)
            }
            this.renderMultiSelector(previousList, includeList);
            this.openInnerPopup(title);
        }   

        /**
         * Open Naming popup page
         * @param {Object} targetSelector 
         * @param {Array<string>} columns 
         * @param {string} method 
         */
        openNamingPopup(targetSelector, columns, method) {
            this.popup.type = 'naming';
            this.popup.targetSelector = targetSelector;
            this.renderNamingBox(columns, method, $(this.popup.targetSelector).data('dict'));
            this.openInnerPopup('Replace naming');
        }

        handleInnerOk() {
            // ok input popup
            if (this.popup.type == 'column') {
                var dataList = this.popup.ColSelector.getDataList();

                $(this.popup.targetSelector).val(dataList.map(col => { return col.code }).join(','));
                $(this.popup.targetSelector).data('list', dataList);
                $(this.popup.targetSelector).trigger({ type: 'change', dataList: dataList });
                this.closeInnerPopup();
            } else {
                var dict = {};
                // get dict
                var tags = $(this.wrapSelector('.vp-gb-naming-text'));
                for (var i = 0; i < tags.length; i++) {
                    var key = $(tags[i]).data('code');
                    var val = $(tags[i]).val();
                    if (val && val != '') {
                        dict[key] = val;
                    }
                }

                $(this.popup.targetSelector).val(Object.values(dict).map(val => "'" + val +"'").join(','));
                $(this.popup.targetSelector).data('dict', dict);
                $(this.popup.targetSelector).trigger({ type: 'change', namingDict: dict });
                this.closeInnerPopup();
            }
        }

        /**
         * Load variable list (dataframe)
         */
         loadVariableList() {
            var that = this;
            // load using kernel
            var dataTypes = ['DataFrame'];
            vpKernel.getDataList(dataTypes).then(function(resultObj) {
                let { result } = resultObj;
                try {
                    var varList = JSON.parse(result);
                    // render variable list
                    // get prevvalue
                    var prevValue = that.state.variable;
                    // replace
                    $(that.wrapSelector('#vp_gbVariable')).replaceWith(function() {
                        return that.templateForVariableList(varList, prevValue);
                    });
                    $(that.wrapSelector('#vp_gbVariable')).trigger('change');
                } catch (ex) {
                    vpLog.display(VP_LOG_TYPE.ERROR, 'Groupby:', result);
                }
            });
        }

    }

    return Groupby;
});