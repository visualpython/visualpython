/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : vpGroupby.js
 *    Author          : Black Logic
 *    Note            : Groupby app
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 10. 05
 *    Change Date     :
 */

//============================================================================
// Define constant
//============================================================================
define([
    'nbextensions/visualpython/src/common/constant',
    'nbextensions/visualpython/src/common/StringBuilder',
    'nbextensions/visualpython/src/common/vpCommon',
    'nbextensions/visualpython/src/common/kernelApi',
    'nbextensions/visualpython/src/common/component/vpColumnSelector',

    'codemirror/lib/codemirror',
    'codemirror/mode/python/python',
    'notebook/js/codemirror-ipython',
    'codemirror/addon/display/placeholder',
    'codemirror/addon/display/autorefresh'
], function (vpConst, sb, vpCommon, kernelApi, vpColumnSelector, codemirror) {   

    //========================================================================
    // Define variable
    //========================================================================
    const APP_PREFIX = 'vp-pp';
    const APP_CONTAINER = APP_PREFIX + '-container';
    const APP_TITLE = APP_PREFIX + '-title';
    const APP_CLOSE = APP_PREFIX + '-close';
    const APP_BODY = APP_PREFIX + '-body';

    const APP_BUTTON = APP_PREFIX + '-btn';
    const APP_PREVIEW_BOX = APP_PREFIX + '-preview-box';
    const APP_BUTTON_BOX = APP_PREFIX + '-btn-box';
    const APP_BUTTON_PREVIEW = APP_PREFIX + '-btn-preview';
    const APP_BUTTON_CANCEL = APP_PREFIX + '-btn-cancel';
    const APP_BUTTON_RUNADD = APP_PREFIX + '-btn-runadd';
    const APP_BUTTON_RUN = APP_PREFIX + '-btn-run';
    const APP_BUTTON_DETAIL = APP_PREFIX + '-btn-detail';
    const APP_DETAIL_BOX = APP_PREFIX + '-detail-box';
    const APP_DETAIL_ITEM = APP_PREFIX + '-detail-item';

    const APP_POPUP_BOX = APP_PREFIX + '-popup-box';
    const APP_POPUP_CLOSE = APP_PREFIX + '-popup-close';
    const APP_POPUP_BODY = APP_PREFIX + '-popup-body';
    const APP_POPUP_BUTTON_BOX = APP_PREFIX + '-popup-button-box';
    const APP_POPUP_CANCEL = APP_PREFIX + '-popup-cancel';
    const APP_POPUP_OK = APP_PREFIX + '-popup-ok';


    //========================================================================
    // [CLASS] Groupby
    //========================================================================
    class Groupby {
        /**
         * constructor
         * @param {object} pageThis
         * @param {string} targetId
         */
        constructor(pageThis, targetId) {
            this.pageThis = pageThis;
            this.targetId = targetId;
            this.uuid = 'u' + vpCommon.getUUID();

            this.previewOpened = false;
            this.codepreview = undefined;

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
        }

        //====================================================================
        // Internal call function
        //====================================================================
        /**
         * Wrap Selector for data selector popup with its uuid
         * @param {string} query 
         */
        _wrapSelector(query = '') {
            return vpCommon.formatString('.{0}.{1} {2}', APP_PREFIX, this.uuid, query);
        }

        /**
         * Load state and set values on components
         * @param {object} state 
         */
        _loadState(state) {
            var {
                variable, groupby, useGrouper, grouperNumber, grouperPeriod, 
                display, method, advanced, allocateTo, resetIndex,
                advPageDom, advColList, advNamingList
            } = state;

            $(this._wrapSelector('#vp_gbVariable')).val(variable);
            $(this._wrapSelector('#vp_gbBy')).val(groupby.map(col=>col.code).join(','));
            $(this._wrapSelector('#vp_gbBy')).data('list', groupby);
            if (useGrouper) {
                $(this._wrapSelector('#vp_gbByGrouper')).removeAttr('disabled');
                $(this._wrapSelector('#vp_gbByGrouper')).prop('checked', useGrouper);
                $(this._wrapSelector('#vp_gbByGrouperNumber')).val(grouperNumber);
                $(this._wrapSelector('#vp_gbByGrouperPeriod')).val(grouperPeriod);
                $(this._wrapSelector('.vp-gb-by-grouper-box')).show();
            }
            $(this._wrapSelector('#vp_gbDisplay')).val(display.map(col=>col.code).join(','));
            $(this._wrapSelector('#vp_gbDisplay')).data('list', display);
            $(this._wrapSelector('#vp_gbMethod')).val(method);
            $(this._wrapSelector('#vp_gbMethodSelector')).val(method);
            $(this._wrapSelector('#vp_gbAdvanced')).prop('checked', advanced);
            if (advanced) {
                $(this._wrapSelector('#vp_gbAdvanced')).trigger('change');
            }
            $(this._wrapSelector('#vp_gbAllocateTo')).val(allocateTo);
            $(this._wrapSelector('#vp_gbResetIndex')).val(resetIndex?'yes':'no');

            $(this._wrapSelector('.vp-gb-adv-box')).html(advPageDom);
            
            advColList.forEach((arr, idx) => {
                $($(this._wrapSelector('.vp-gb-adv-col'))[idx]).data('list', arr);
            });
            advNamingList.forEach((obj, idx) => {
                $($(this._wrapSelector('.vp-gb-adv-naming'))[idx]).data('dict', obj);
            });
        }

        /**
         * Save now state of components
         */
        _saveState() {
            // save input state
            $(this._wrapSelector('.vp-gb-adv-box input')).each(function () {
                this.defaultValue = this.value;
            });

            // save checkbox state
            $(this._wrapSelector('.vp-gb-adv-box input[type="checkbox"]')).each(function () {
                this.defaultValue = this.value;
            });

            // save select state
            $(this._wrapSelector('.vp-gb-adv-box select > option')).each(function () {
                if (this.selected) {
                    this.setAttribute("selected", true);
                } else {
                    this.removeAttribute("selected");
                }
            });
            
            // save advanced box
            this.state.advPageDom = $(this._wrapSelector('.vp-gb-adv-box')).html();
        }

        //====================================================================
        // External call function
        //====================================================================
        /**
         * Open this page with initializing
         * @param {object} config 
         */
        open(config={}) {
            this.config = {
                ...this.config,
                ...config
            }

            this.init(this.config.state);
            $(this._wrapSelector()).show();

            // load state
            if (this.config.state) {
                this._loadState(this.config.state);
            }
        }

        /**
         * Close this page
         */
        close() {
            this.unbindEvent();
            $(this._wrapSelector()).remove();
        }

        /**
         * Initialize state, Render and Bind events
         * @param {object} state 
         */
        init(state = undefined) {
            
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
                advNamingList: []
            };
            this.popup = {
                type: '',
                targetSelector: '',
                ColSelector: undefined
            }

            // load state
            if (state) {
                this.state = { 
                    ...this.state,
                    ...state
                };
            }
            
            this.bindEvent();
            this.render();
            vpCommon.loadCssForDiv(this._wrapSelector(), Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + 'common/popupPage.css');
            vpCommon.loadCssForDiv(this._wrapSelector(), Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + 'common/groupby.css');


            this.loadVariableList();
        }

        /**
         * Render main page & frame
         */
        render() {
            var page = new sb.StringBuilder();
            page.appendFormatLine('<div class="{0} {1}">', APP_PREFIX, this.uuid);
            page.appendFormatLine('<div class="{0} {1}">', APP_CONTAINER, 'vp-gb-container');

            // popup
            page.appendLine(this.renderInnerPopup());

            // title
            page.appendFormat('<div class="{0}">{1}</div>',
                APP_TITLE, 'Groupby');

            // close button
            page.appendFormatLine('<div class="{0}"><img src="{1}"/></div>',
                APP_CLOSE, '/nbextensions/visualpython/resource/close_big.svg');

            // body start
            page.appendFormatLine('<div class="{0}">', APP_BODY);
            
            // target variable & column
            page.appendFormatLine('<div class="{0}">', 'vp-gb-df-box'); // df-box
            // dataframe
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_gbVariable', 'vp-orange-text wp80', 'DataFrame');
            page.appendFormatLine('<select id="{0}">', 'vp_gbVariable');
            page.appendLine('</select>');
            page.appendFormatLine('<div class="{0}"><img src="{1}"/></div>', 'vp-gb-df-refresh', '/nbextensions/visualpython/resource/refresh.svg');
            page.appendLine('</div>');
            // groupby column
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_gbBy', 'vp-orange-text wp80', 'Groupby');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled/>', 'vp_gbBy', 'Groupby columns');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_gbBySelect', 'vp-button wp50', 'Edit');
            page.appendFormatLine('<label><input type="checkbox" id="{0}" disabled/><span>{1}</span></label>', 'vp_gbByGrouper', 'Grouper');
            page.appendFormatLine('<div class="{0}" style="display:none;">', 'vp-gb-by-grouper-box');
            page.appendFormatLine('<input type="number" id="{0}" class="{1}"/>', 'vp_gbByGrouperNumber', 'vp-gb-by-number');
            page.appendFormatLine('<select id="{0}">', 'vp_gbByGrouperPeriod');
            var savedPeriod = this.state.period;
            this.periodList.forEach(period => {
                page.appendFormatLine('<option value="{0}"{1}>{2}</option>', period.value, savedPeriod==period.value?' selected':'',period.label);
            });
            page.appendLine('</select>');
            page.appendLine('</div>'); // by-grouper-box
            page.appendLine('</div>');
            // Reset index
            // page.appendFormatLine('<label><input type="checkbox" id="{0}"/><span>{1}</span></label>', 'vp_gbResetIndex', 'Reset index');
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_gbResetIndex', 'wp80', 'Reset Index');
            page.appendFormatLine('<select id="{0}">', 'vp_gbResetIndex');
            page.appendFormatLine('<option value="{0}">{1}</option>', 'no', 'No');
            page.appendFormatLine('<option value="{0}">{1}</option>', 'yes', 'Yes');
            page.appendLine('</select>');
            page.appendLine('</div>');
            page.appendLine('<hr style="margin: 5px 0;"/>');
            // display column
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_gbDisplay', 'wp80', 'Columns');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_gbDisplay', 'Display columns');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_gbDisplaySelect', 'vp-button wp50', 'Edit');
            page.appendLine('</div>');
            // method
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_gbMethodSelect', 'wp80', 'Method');
            page.appendFormatLine('<select id="{0}">', 'vp_gbMethodSelect');
            var savedMethod = this.state.method;
            this.methodList.forEach(method => {
                page.appendFormatLine('<option value="{0}"{1}>{2}</option>', method.value, savedMethod==method.value?' selected':'',method.label);
            });
            page.appendLine('</select>');
            page.appendFormatLine('<input type="text" id="{0}" class="{1}" disabled style="display: none;" value="{2}"/>', 'vp_gbMethod', 'vp-gb-method', this.methodList[0].value);
            page.appendFormatLine('<label><input type="checkbox" id="{0}"/><span>{1}</span></label>', 'vp_gbAdvanced', 'Advanced');
            page.appendLine('</div>');
            
            // Advanced box
            page.appendFormatLine('<div class="{0} {1}" style="display: none;">', 'vp-gb-adv-box', 'vp-apiblock-scrollbar');
            page.appendLine(this.renderAdvancedItem());
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_gbAdvAdd', 'vp-button', '+ Add');
            page.appendLine('</div>'); // end of adv-box

            page.appendLine('<hr style="margin: 5px 0;"/>');
            // Allocate to
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_gbAllocateTo', 'wp80', 'Allocate to');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}"/>', 'vp_gbAllocateTo', 'New variable name');
            
            page.appendLine('</div>');
            
            page.appendLine('</div>'); // end of df-box



            page.appendLine('</div>'); // APP_BODY

            // preview box
            page.appendFormatLine('<div class="{0} {1}">', APP_PREVIEW_BOX, 'vp-apiblock-scrollbar');
            page.appendFormatLine('<textarea id="{0}" name="code"></textarea>', 'vp_codePreview');
            page.appendLine('</div>');

            // button box
            page.appendFormatLine('<div class="{0}">', APP_BUTTON_BOX);
            page.appendFormatLine('<button type="button" class="{0} {1} {2}">{3}</button>'
                                    , 'vp-button', APP_BUTTON, APP_BUTTON_PREVIEW, 'Code view');
            page.appendFormatLine('<button type="button" class="{0} {1} {2}">{3}</button>'
                                    , 'vp-button cancel', APP_BUTTON, APP_BUTTON_CANCEL, 'Cancel');
            page.appendFormatLine('<div class="{0}">', APP_BUTTON_RUNADD);
            page.appendFormatLine('<button type="button" class="{0} {1}" title="{2}">{3}</button>'
                                    , 'vp-button activated', APP_BUTTON_RUN, 'Apply to Board & Run Cell', 'Run');
            page.appendFormatLine('<button type="button" class="{0} {1}"><img src="{2}"/></button>'
                                    , 'vp-button activated', APP_BUTTON_DETAIL, '/nbextensions/visualpython/resource/arrow_short_up.svg');
            page.appendFormatLine('<div class="{0} {1}">', APP_DETAIL_BOX, 'vp-cursor');
            page.appendFormatLine('<div class="{0}" data-type="{1}" title="{2}">{3}</div>', APP_DETAIL_ITEM, 'apply', 'Apply to Board', 'Apply');
            page.appendFormatLine('<div class="{0}" data-type="{1}" title="{2}">{3}</div>', APP_DETAIL_ITEM, 'add', 'Apply to Board & Add Cell', 'Add');
            page.appendLine('</div>'); // APP_DETAIL_BOX
            page.appendLine('</div>'); // APP_BUTTON_RUNADD
            page.appendLine('</div>'); // APP_BUTTON_BOX


            page.appendLine('</div>'); // APP_CONTAINER
            page.appendLine('</div>'); // APPS

            $('#vp-wrapper').append(page.toString());
            $(this._wrapSelector()).hide();
        }

        /**
         * Render variable list (for dataframe)
         * @param {Array<object>} varList
         * @param {string} defaultValue previous value
         */
        renderVariableList(varList, defaultValue='') {
            var tag = new sb.StringBuilder();
            tag.appendFormatLine('<select id="{0}">', 'vp_gbVariable');
            varList.forEach(vObj => {
                // varName, varType
                var label = vObj.varName;
                tag.appendFormatLine('<option value="{0}" data-type="{1}" {2}>{3}</option>'
                                    , vObj.varName, vObj.varType
                                    , defaultValue == vObj.varName?'selected':''
                                    , label);
            });
            tag.appendLine('</select>'); // VP_VS_VARIABLES
            return tag.toString();
        }

        /**
         * Render advanced item and return it
         * @returns Advanced box's item
         */
        renderAdvancedItem() {
            var page = new sb.StringBuilder();
            page.appendFormatLine('<div class="{0}">', 'vp-gb-adv-item');
            // target columns
            page.appendFormatLine('<input type="text" class="{0}" placeholder="{1}" title="{2}" disabled/>'
                                , 'vp-gb-adv-col', 'Column list', 'Apply All columns, if not selected');
            page.appendFormatLine('<button class="{0} {1}">{2}</button>', 'vp-gb-adv-col-selector', 'vp-button wp50', 'Edit');
            // method select
            page.appendFormatLine('<select class="{0}">', 'vp-gb-adv-method-selector');
            var defaultMethod = '';
            page.appendFormatLine('<option value="{0}">{1}</option>', '', 'Select method type');
            page.appendFormatLine('<option value="{0}">{1}</option>', 'typing', 'Typing');
            this.methodList.forEach(method => {
                page.appendFormatLine('<option value="{0}">{1}</option>', method.value, method.label);
            });
            page.appendLine('</select>');
            page.appendFormatLine('<div class="{0}" style="display: none;">', 'vp-gb-adv-method-box');
            page.appendFormatLine('<input type="text" class="{0}" placeholder="{1}" value="{2}"/>', 'vp-gb-adv-method', 'Type function name', "'" + defaultMethod + "'");
            // page.appendFormatLine('<i class="fa fa-search {0}"></i>', 'vp-gb-adv-method-return');
            page.appendFormatLine('<img src="{0}" class="{1}" title="{2}">'
                                , '/nbextensions/visualpython/resource/arrow_left.svg', 'vp-gb-adv-method-return', 'Return to select method');
            page.appendLine('</div>');
            // naming
            page.appendFormatLine('<input type="text" class="{0}" placeholder="{1}" data-dict={} disabled/>', 'vp-gb-adv-naming', 'Display name');
            page.appendFormatLine('<button class="{0} {1}">{2}</button>', 'vp-gb-adv-naming-selector', 'vp-button wp50', 'Edit');
            // delete button
            page.appendFormatLine('<div class="{0} {1}"><img src="{2}"/></div>', 'vp-gb-adv-item-delete', 'vp-cursor', '/nbextensions/visualpython/resource/close_small.svg');
            page.appendLine('</div>');
            return page.toString();
        }

        /**
         * Render inner popup for selecting columns
         * @returns Inner popup page dom
         */
        renderInnerPopup() {
            var page = new sb.StringBuilder();
            page.appendFormatLine('<div class="{0}" style="display: none; width: 400px; height: 300px;">', APP_POPUP_BOX);
            // popup title
            page.appendFormat('<div class="{0}">{1}</div>', APP_TITLE, 'Input');
            // close button
            page.appendFormatLine('<div class="{0}"><img src="{1}"/></div>', APP_POPUP_CLOSE, '/nbextensions/visualpython/resource/close_big.svg');
            page.appendFormatLine('<div class="{0}">', APP_POPUP_BODY);
            page.appendLine('</div>'); // End of Body
    
            // apply button
            page.appendFormatLine('<div class="{0}">', APP_POPUP_BUTTON_BOX);
            page.appendFormatLine('<button type="button" class="{0} {1}">{2}</button>'
                                    , APP_POPUP_CANCEL, 'vp-button cancel', 'Cancel');
            page.appendFormatLine('<button type="button" class="{0} {1}">{2}</button>'
                                    , APP_POPUP_OK, 'vp-button activated', 'OK');
            page.appendLine('</div>');
    
            page.appendLine('</div>'); // End of Popup
            return page.toString();
        }

        /**
         * Render column selector using ColumnSelector module
         * @param {Array<string>} previousList previous selected columns
         * @param {Array<string>} includeList columns to include 
         */
        renderColumnSelector(previousList, includeList) {
            this.popup.ColSelector = new vpColumnSelector(
                this._wrapSelector('.' + APP_POPUP_BODY), 
                { dataframe: [this.state.variable], selectedList: previousList, includeList: includeList }
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
            var page = new sb.StringBuilder();
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
            return page.toString();
        }
        
        /**
         * Open Inner popup page for column selection
         * @param {Object} targetSelector 
         * @param {string} title 
         * @param {Array<string>} includeList 
         */
        openInnerPopup(targetSelector, title='Select columns', includeList=[]) {
            this.popup.type = 'column';
            this.popup.targetSelector = targetSelector;
            var previousList = this.popup.targetSelector.data('list');
            if (previousList) {
                previousList = previousList.map(col => col.code)
            }
            this.renderColumnSelector(previousList, includeList);
    
            // set title
            $(this._wrapSelector('.' + APP_POPUP_BOX + ' .' + APP_TITLE)).text(title);
    
            // show popup box
            $(this._wrapSelector('.' + APP_POPUP_BOX)).show();
        }

        /**
         * Close Inner popup page
         */
        closeInnerPopup() {
            $(this._wrapSelector('.' + APP_POPUP_BOX)).hide();
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
            $(this._wrapSelector('.' + APP_POPUP_BODY)).html(this.renderNamingBox(columns, method, $(this.popup.targetSelector).data('dict')));

            // set title
            $(this._wrapSelector('.' + APP_POPUP_BOX + ' .' + APP_TITLE)).text('Replace naming');
    
            // show popup box
            $(this._wrapSelector('.' + APP_POPUP_BOX)).show();
        }

        /**
         * Load variable list (dataframe)
         */
        loadVariableList() {
            var that = this;
            // load using kernel
            var dataTypes = ['DataFrame'];
            kernelApi.searchVarList(dataTypes, function(result) {
                try {
                    var varList = JSON.parse(result);
                    // render variable list
                    // get prevvalue
                    var prevValue = that.state.variable;
                    // replace
                    $(that._wrapSelector('#vp_gbVariable')).replaceWith(function() {
                        return that.renderVariableList(varList, prevValue);
                    });
                    $(that._wrapSelector('#vp_gbVariable')).trigger('change');
                } catch (ex) {
                    console.log('Groupby:', result);
                }
            });
        }

        /**
         * Unbind events
         */
        unbindEvent() {
            $(document).unbind(vpCommon.formatString(".{0} .{1}", this.uuid, APP_BODY));

            // user operation event
            $(document).off('change', this._wrapSelector('#vp_gbVariable'));
            $(document).off('click', this._wrapSelector('.vp-gb-df-refresh'));
            $(document).off('change', this._wrapSelector('#vp_gbBy'));
            $(document).off('click', this._wrapSelector('#vp_gbBySelect'));
            $(document).off('change', this._wrapSelector('#vp_gbByGrouper'));
            $(document).off('change', this._wrapSelector('#vp_gbByGrouperNumber'));
            $(document).off('change', this._wrapSelector('#vp_gbByGrouperPeriod'));
            $(document).off('change', this._wrapSelector('#vp_gbDisplay'));
            $(document).off('click', this._wrapSelector('#vp_gbDisplaySelect'));
            $(document).off('change', this._wrapSelector('#vp_gbMethodSelect'));
            $(document).off('change', this._wrapSelector('#vp_gbAdvanced'));
            $(document).off('change', this._wrapSelector('#vp_gbAllocateTo'));
            $(document).off('change', this._wrapSelector('#vp_gbResetIndex'));

            $(document).off('click', this._wrapSelector('#vp_gbAdvAdd'));
            $(document).off('change', this._wrapSelector('.vp-gb-adv-col'));
            $(document).off('click', this._wrapSelector('.vp-gb-adv-col-selector'));
            $(document).off('change', this._wrapSelector('.vp-gb-adv-method-selector'));
            $(document).off('click', this._wrapSelector('.vp-gb-adv-method-return'));
            $(document).off('change', this._wrapSelector('.vp-gb-adv-naming'));
            $(document).off('click', this._wrapSelector('.vp-gb-adv-naming-selector'));
            $(document).off('click', this._wrapSelector('.vp-gb-adv-item-delete'));

            $(document).off('click', this._wrapSelector('.' + APP_CLOSE));
            $(document).off('click', this._wrapSelector('.' + APP_BUTTON_PREVIEW));
            $(document).off('click', this._wrapSelector('.' + APP_BUTTON_CANCEL));
            $(document).off('click', this._wrapSelector('.' + APP_BUTTON_RUN));
            $(document).off('click', this._wrapSelector('.' + APP_BUTTON_DETAIL));
            $(document).off('click', this._wrapSelector('.' + APP_DETAIL_ITEM));
            $(document).off('click.' + this.uuid);
    
            $(document).off('keydown.' + this.uuid);
            $(document).off('keyup.' + this.uuid);

            // popup box events
            $(document).off('click', this._wrapSelector('.' + APP_POPUP_OK));
            $(document).off('click', this._wrapSelector('.' + APP_POPUP_CANCEL));
            $(document).off('click', this._wrapSelector('.' + APP_POPUP_CLOSE));
        }

        /**
         * Bind events
         */
        bindEvent() {
            var that = this;
            //====================================================================
            // User operation Events
            //====================================================================
            // variable change event
            $(document).on('change', this._wrapSelector('#vp_gbVariable'), function() {
                // if variable changed, clear groupby, display
                var newVal = $(this).val();
                if (newVal != that.state.variable) {
                    $(that._wrapSelector('#vp_gbBy')).val('');
                    $(that._wrapSelector('#vp_gbDisplay')).val('');
                    that.state.variable = newVal;
                }
            });

            // variable refresh event
            $(document).on('click', this._wrapSelector('.vp-gb-df-refresh'), function() {
                that.loadVariableList();
            });

            // groupby change event
            $(document).on('change', this._wrapSelector('#vp_gbBy'), function(event) {
                var colList = event.colList;
                that.state.groupby = colList;
                
                if (colList && colList.length == 1
                    && colList[0].dtype.includes('datetime')) {
                    $(that._wrapSelector('#vp_gbByGrouper')).removeAttr('disabled');
                } else {
                    $(that._wrapSelector('#vp_gbByGrouper')).attr('disabled', true);
                }
            });

            // groupby select button event
            $(document).on('click', this._wrapSelector('#vp_gbBySelect'), function() {
                that.openInnerPopup($(that._wrapSelector('#vp_gbBy')), 'Select columns to group');
            });

            // groupby grouper event
            $(document).on('change', this._wrapSelector('#vp_gbByGrouper'), function() {
                var useGrouper = $(this).prop('checked');
                that.state.useGrouper = useGrouper;

                if (useGrouper == true) {
                    $(that._wrapSelector('.vp-gb-by-grouper-box')).show();
                } else {
                    $(that._wrapSelector('.vp-gb-by-grouper-box')).hide();
                }
            });

            // grouper number change event
            $(document).on('change', this._wrapSelector('#vp_gbByGrouperNumber'), function() {
                that.state.grouperNumber = $(this).val();
            });

            // grouper period change event
            $(document).on('change', this._wrapSelector('#vp_gbByGrouperPeriod'), function() {
                that.state.grouperPeriod = $(this).val();
            });

            // display change event
            $(document).on('change', this._wrapSelector('#vp_gbDisplay'), function(event) {
                var colList = event.colList;
                that.state.display = colList;
            });

            // display select button event
            $(document).on('click', this._wrapSelector('#vp_gbDisplaySelect'), function() {
                that.openInnerPopup($(that._wrapSelector('#vp_gbDisplay')), 'Select columns to display');
            });

            // method select event
            $(document).on('change', this._wrapSelector('#vp_gbMethodSelect'), function() {
                var method = $(this).val();
                that.state.method = method;
                $(that._wrapSelector('#vp_gbMethod')).val(method);
            });

            // advanced checkbox event
            $(document).on('change', this._wrapSelector('#vp_gbAdvanced'), function() {
                var advanced = $(this).prop('checked');
                that.state.advanced = advanced;

                if (advanced == true) {
                    // change method display
                    $(that._wrapSelector('#vp_gbMethod')).val('aggregate');
                    $(that._wrapSelector('#vp_gbMethodSelect')).hide();
                    $(that._wrapSelector('#vp_gbMethod')).show();
                    // show advanced box
                    $(that._wrapSelector('.vp-gb-adv-box')).show();
                } else {
                    $(that._wrapSelector('#vp_gbMethod')).val('sum');
                    $(that._wrapSelector('#vp_gbMethodSelect')).show();
                    $(that._wrapSelector('#vp_gbMethod')).hide();
                    // hide advanced box
                    $(that._wrapSelector('.vp-gb-adv-box')).hide();
                }
            });

            
            // allocateTo event
            $(document).on('change', this._wrapSelector('#vp_gbAllocateTo'), function() {
                that.state.allocateTo = $(this).val();
            });
            
            // reset index checkbox event
            $(document).on('change', this._wrapSelector('#vp_gbResetIndex'), function() {
                that.state.resetIndex = $(this).val() == 'yes';
            });
            
            //====================================================================
            // Advanced box Events
            //====================================================================
            // add advanced item
            $(document).on('click', this._wrapSelector('#vp_gbAdvAdd'), function() {
                $(that.renderAdvancedItem()).insertBefore($(that._wrapSelector('#vp_gbAdvAdd')));
            });

            // advanced item - column change event
            $(document).on('change', this._wrapSelector('.vp-gb-adv-col'), function(event) {
                var colList = event.colList;
                var idx = $(that._wrapSelector('.vp-gb-adv-col')).index(this);
                
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
            $(document).on('click', this._wrapSelector('.vp-gb-adv-col-selector'), function() {
                var includeList = that.state.display;
                if (includeList && includeList.length > 0) {
                    includeList = includeList.map(col => col.code);
                }
                that.openInnerPopup($(this).parent().find('.vp-gb-adv-col'), 'Select columns', includeList);
            });

            // select method
            $(document).on('change', this._wrapSelector('.vp-gb-adv-method-selector'), function() {
                var method = $(this).val();
                var parentDiv = $(this).parent();
                if (method == 'typing') {
                    // change it to typing input
                    $(parentDiv).find('.vp-gb-adv-method-selector').hide();
                    $(parentDiv).find('.vp-gb-adv-method').val('');
                    $(parentDiv).find('.vp-gb-adv-method-box').show();
                } else {
                    $(parentDiv).find('.vp-gb-adv-method').val(vpCommon.formatString("'{0}'", method));
                }
            });

            // return to selecting method
            $(document).on('click', this._wrapSelector('.vp-gb-adv-method-return'), function() {
                var defaultValue = '';
                var parentDiv = $(this).parent().parent();
                $(parentDiv).find('.vp-gb-adv-method-selector').val(defaultValue);
                $(parentDiv).find('.vp-gb-adv-method').val(defaultValue);
                // show and hide
                $(parentDiv).find('.vp-gb-adv-method-selector').show();
                $(parentDiv).find('.vp-gb-adv-method-box').hide();
            });

            // advanced item - naming change event
            $(document).on('change', this._wrapSelector('.vp-gb-adv-naming'), function(event) {
                var namingDict = event.namingDict;
                var idx = $(that._wrapSelector('.vp-gb-adv-naming')).index(this);
                that.state.advNamingList[idx] = namingDict;
            });

            // edit columns naming
            $(document).on('click', this._wrapSelector('.vp-gb-adv-naming-selector'), function() {
                var parentDiv = $(this).parent();
                var columns = $(parentDiv).find('.vp-gb-adv-col').data('list');
                if (columns && columns.length > 0) {
                    columns = columns.map(col => col.code);
                }
                var method = $(parentDiv).find('.vp-gb-adv-method').val();
                if (!method || method == '' || method == "''") {
                    // set focus on selecting method tag
                    $(parentDiv).find('.vp-gb-adv-method-selector').focus();
                    return;
                }
                that.openNamingPopup($(parentDiv).find('.vp-gb-adv-naming'), columns, method);
            });

            // delete advanced item
            $(document).on('click', this._wrapSelector('.vp-gb-adv-item-delete'), function() {
                if ($(that._wrapSelector('.vp-gb-adv-item')).length > 1) {
                    $(this).closest('.vp-gb-adv-item').remove();
                }
            });

            //====================================================================
            // Page operation Events
            //====================================================================
            // close popup
            $(document).on('click', this._wrapSelector('.' + APP_CLOSE), function(event) {
                that.close();
            });

            // click preview
            $(document).on('click', this._wrapSelector('.' + APP_BUTTON_PREVIEW), function(evt) {
                evt.stopPropagation();
                if (that.previewOpened) {
                    that.closePreview();
                } else {
                    that.openPreview();
                }
            });

            // click cancel
            $(document).on('click', this._wrapSelector('.' + APP_BUTTON_CANCEL), function() {
                that.close();
            });

            // click run
            $(document).on('click', this._wrapSelector('.' + APP_BUTTON_RUN), function() {
                that.apply(true, true);
                that.close();
            });

            // click detail button
            $(document).on('click', this._wrapSelector('.' + APP_BUTTON_DETAIL), function(evt) {
                evt.stopPropagation();
                $(that._wrapSelector('.' + APP_DETAIL_BOX)).show();
            });

            // click add / apply
            $(document).on('click', this._wrapSelector('.' + APP_DETAIL_ITEM), function() {
                var type = $(this).data('type');
                if (type == 'add') {
                    that.apply(true);
                    that.close();
                } else if (type == 'apply') {
                    that.apply();
                    that.close();
                }
            });

            // click other
            $(document).on('click.' + this.uuid, function(evt) {
                if (!$(evt.target).hasClass(APP_BUTTON_DETAIL)) {
                    $(that._wrapSelector('.' + APP_DETAIL_BOX)).hide();
                }
                if (!$(evt.target).hasClass(APP_BUTTON_PREVIEW)
                    && !$(evt.target).hasClass(APP_PREVIEW_BOX)
                    && $(that._wrapSelector('.' + APP_PREVIEW_BOX)).has(evt.target).length === 0) {
                    that.closePreview();
                }
            });

            //====================================================================
            // Popup box Events
            //====================================================================
            // ok input popup
            $(document).on('click', this._wrapSelector('.' + APP_POPUP_OK), function() {
                // ok input popup
                if (that.popup.type == 'column') {
                    var colList = that.popup.ColSelector.getColumnList();
    
                    $(that.popup.targetSelector).val(colList.map(col => { return col.code }).join(','));
                    $(that.popup.targetSelector).data('list', colList);
                    $(that.popup.targetSelector).trigger({ type: 'change', colList: colList });
                    that.closeInnerPopup();
                } else {
                    var dict = {};
                    // get dict
                    var tags = $(that._wrapSelector('.vp-gb-naming-text'));
                    for (var i = 0; i < tags.length; i++) {
                        var key = $(tags[i]).data('code');
                        var val = $(tags[i]).val();
                        if (val && val != '') {
                            dict[key] = val;
                        }
                    }

                    $(that.popup.targetSelector).val(Object.values(dict).map(val => "'" + val +"'").join(','));
                    $(that.popup.targetSelector).data('dict', dict);
                    $(that.popup.targetSelector).trigger({ type: 'change', namingDict: dict });
                    that.closeInnerPopup();
                }
            });

            // cancel input popup
            $(document).on('click', this._wrapSelector('.' + APP_POPUP_CANCEL), function() {
                that.closeInnerPopup();
            });

            // close input popup
            $(document).on('click', this._wrapSelector('.' + APP_POPUP_CLOSE), function() {
                that.closeInnerPopup();
            });
        }

        /**
         * Apply code to jupyter cell or as a block
         * @param {boolean} addCell 
         * @param {boolean} runCell 
         */
        apply(addCell=false, runCell=false) {
            var code = this.generateCode();

            // save state for block
            this._saveState();

            if (this.pageThis) {
                $(this.pagethis._wrapSelector('#' + this.targetId)).val(code);
                $(this.pagethis._wrapSelector('#' + this.targetId)).trigger({
                    type: 'apps_run',
                    title: 'Groupby',
                    code: code,
                    state: this.state,
                    addCell: addCell,
                    runCell: runCell
                });
            } else {
                $(vpCommon.wrapSelector('#' + this.targetId)).val(code);
                $(vpCommon.wrapSelector('#' + this.targetId)).trigger({
                    type: 'apps_run',
                    title: 'Groupby',
                    code: code,
                    state: this.state,
                    addCell: addCell,
                    runCell: runCell
                });
            }
        }

        /**
         * Generate code
         * @returns generatedCode
         */
        generateCode() {
            var code = new sb.StringBuilder();
            var { 
                variable, groupby, useGrouper, grouperNumber, grouperPeriod, 
                display, method, advanced, allocateTo, resetIndex 
            } = this.state;

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
                byStr = vpCommon.formatString("pd.Grouper(key={0}, freq='{1}')", byStr, grouperNumber + grouperPeriod);
            } else if (resetIndex == true) {
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
                if (display.length == 1) {
                    // for 1 column
                    colStr = '[' + display.join('') + ']';
                } else if (display.length > 1) {
                    // over 2 columns
                    colStr = '[[' + display.join(',') + ']]';
                }
            }

            //====================================================================
            // Aggregation/Method code generation
            //====================================================================
            var methodStr = new sb.StringBuilder();
            if (advanced) {
                //================================================================
                // Aggregation code generation
                //================================================================
                methodStr.append('agg(');
                // prepare variables for aggregation
                var advItemTags = $(this._wrapSelector('.vp-gb-adv-item'));
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
                                    tmpList.push(vpCommon.formatString("({0}, {1})", obj.naming, obj.method));
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
                                    tmpList2.push(vpCommon.formatString("({0}, {1})", obj.naming, obj.method));
                                    useTuple = true;
                                } else {
                                    tmpList2.push(obj.method);
                                }
                            });
                            var tmpStr = tmpList2.join(',');
                            if (tmpList2.length > 1 || useTuple) {
                                tmpStr = '[' + tmpStr + ']';
                            }
                            tmpList1.push(vpCommon.formatString("{0}: {1}", key, tmpStr));
                        });
                        methodStr.appendFormat('{{0}}', tmpList1.join(', '));
                    }
                }
                methodStr.append(')');
            } else {
                //================================================================
                // Method code generation
                //================================================================
                methodStr.appendFormat('{0}()', method);
            }

            // when using as_index option with Grouper, use .reset_index()
            if (useGrouper && resetIndex) {
                methodStr.append('.reset_index()');
            }
            // display columns
            code.appendFormat('{0}.{1}', colStr, methodStr.toString());

            if (allocateTo && allocateTo != '') {
                code.appendLine();
                code.append(allocateTo);
            }

            return code.toString();
        }

        /**
         * Open preview box
         */
        openPreview() {
            $(this._wrapSelector('.' + APP_PREVIEW_BOX)).show();

            if (!this.codepreview) {
                // codemirror setting
                this.codepreview = codemirror.fromTextArea($(this._wrapSelector('#vp_codePreview'))[0], {
                    mode: {
                        name: 'python',
                        version: 3,
                        singleLineStringErrors: false
                    },  // text-cell(markdown cell) set to 'htmlmixed'
                    height: '100%',
                    width: '100%',
                    indentUnit: 4,
                    matchBrackets: true,
                    readOnly:true,
                    autoRefresh: true,
                    theme: "ipython",
                    extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},
                    scrollbarStyle: "null"
                });
            } else {
                this.codepreview.refresh();
            }

            // get current code
            var code = this.generateCode();
            this.codepreview.setValue(code);
            this.codepreview.save();
            
            var that = this;
            setTimeout(function() {
                that.codepreview.refresh();
            },1);
            
            this.previewOpened = true;
        }

        /**
         * Close preview box
         */
        closePreview() {
            this.previewOpened = false;
            $(this._wrapSelector('.' + APP_PREVIEW_BOX)).hide();
        }
    }

    return Groupby
}); /* function, define */

/* End of file */