/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : vpBind.js
 *    Author          : Black Logic
 *    Note            : Bind app
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
    'nbextensions/visualpython/src/common/component/vpMultiSelector',

    'codemirror/lib/codemirror',
    'codemirror/mode/python/python',
    'notebook/js/codemirror-ipython',
    'codemirror/addon/display/placeholder',
    'codemirror/addon/display/autorefresh'
], function (vpConst, sb, vpCommon, kernelApi, vpMultiSelector, codemirror) {   

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
    // [CLASS] Bind
    //========================================================================
    class Bind {
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

            this.howList = [
                { label: 'Inner', value: 'inner', desc: 'Inner join' },
                { label: 'Full outer', value: 'outer', desc: 'Full outer join' },
                { label: 'Left outer', value: 'left', desc: 'Left outer join' },
                { label: 'Right outer', value: 'right', desc: 'Right outer join' },
                { label: 'Cross', value: 'cross', desc: 'Cartesian product' },
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

        _setPreview() {
            
        }

        _loadState(state) {
            var {
                type, concat, merge, allocateTo, resetIndex
            } = state;

            // type
            $(this._wrapSelector('#vp_bdType')).val(type);

            if (type == 'concat') {
                // load concat state
                this._loadSelectorInput(this._wrapSelector('#vp_bdVariable'), concat.variable);
                $(this._wrapSelector('#vp_bdJoin')).val(concat.join);
                $(this._wrapSelector('#vp_bdAxis')).val(concat.axis);
                $(this._wrapSelector('#vp_bdSort')).val(concat.sort?'yes':'no');
            } else {
                // load merge state
                $(this._wrapSelector('#vp_bdLeftDataframe')).val(merge.left.variable);
                $(this._wrapSelector('#vp_mpRightDataframe')).val(merge.right.variable);
    
                $(this._wrapSelector('#vp_bdHow')).val(merge.how);
                this._loadSelectorInput(this._wrapSelector('#vp_bdOn'), merge.on);
                if (on && on.length > 0) {
                    $(this._wrapSelector('#vp_bdLeftOnSelect')).attr('disabled', true);
                    $(this._wrapSelector('#vp_bdRightOnSelect')).attr('disabled', true);
                }
                this._loadSelectorInput(this._wrapSelector('#vp_bdLeftOn'), merge.left.on);
                this._loadSelectorInput(this._wrapSelector('#vp_bdRightOn'), merge.right.on);
                if (merge.left.on.length > 0 || merge.right.on.length > 0) {
                    $(this._wrapSelector('#vp_bdOnSelect')).attr('disabled', true);
                }
    
                $(this._wrapSelector('#vp_bdLeftIndex')).prop('checked', merge.left.useIndex);
                $(this._wrapSelector('#vp_bdRightIndex')).prop('checked', merge.right.useIndex);
    
                $(this._wrapSelector('#vp_bdLeftSuffix')).val(merge.left.suffix);
                $(this._wrapSelector('#vp_bdRightSuffix')).val(merge.right.suffix);
            }
            $(this._wrapSelector('#vp_bdAllocateTo')).val(allocateTo);
            $(this._wrapSelector('#vp_bdResetIndex')).prop('checked', resetIndex);
        }

        _loadSelectorInput(tag, dataList) {
            $(tag).val(dataList.map(data=>data.code).join(','));
            $(tag).data('list', dataList)
        }

        _saveState() {

        }

        //====================================================================
        // External call function
        //====================================================================
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

        close() {
            this.unbindEvent();
            $(this._wrapSelector()).remove();
        }

        init(state = undefined) {
            this.state = {
                type: 'concat',
                concat: {
                    variable: [], // DataFrame, Series
                    join: 'outer',
                    axis: 0, // 0: index, 1: column
                    sort: false
                },
                merge: {
                    left: {
                        variable: '',
                        on: [],
                        useIndex: false,
                        suffix: ''
                    },
                    right: {
                        variable: '',
                        on: [],
                        useIndex: false,
                        suffix: ''
                    },
                    on: [],
                    how: 'inner',
                },
                allocateTo: '',
                resetIndex: false
            }
            this.popup = {
                type: '',
                targetSelector: '',
                MultiSelector: undefined
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
            vpCommon.loadCssForDiv(this._wrapSelector(), Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + 'common/bind.css');

            this.loadVariableList();
        }

        render() {
            var page = new sb.StringBuilder();
            page.appendFormatLine('<div class="{0} {1}">', APP_PREFIX, this.uuid);
            page.appendFormatLine('<div class="{0} {1}">', APP_CONTAINER, 'vp-bd-container');

            // popup
            page.appendLine(this.renderInnerPopup());

            // title
            page.appendFormat('<div class="{0}">{1}</div>',
                APP_TITLE, 'Bind');

            // close button
            page.appendFormatLine('<div class="{0}"><img src="{1}"/></div>',
                APP_CLOSE, '/nbextensions/visualpython/resource/close_big.svg');

            // body start
            page.appendFormatLine('<div class="{0}">', APP_BODY);
            page.appendFormatLine('<div class="{0}">', 'vp-bd-grid-box');
            // bind type : concat merge
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_bdType', 'vp-orange-text wp100', 'Bind type');
            page.appendFormatLine('<select id="{0}">', 'vp_bdType');
            page.appendFormatLine('<option value="{0}" {1}>{2}</option>', 'concat', this.state.type=='concat'?'selected':'', 'concat');
            page.appendFormatLine('<option value="{0}" {1}>{2}</option>', 'merge', this.state.type=='merge'?'selected':'', 'merge');
            page.appendLine('</select>');
            page.appendLine('</div>');
            // divider
            page.appendLine('<hr style="margin: 5px 0;"/>');

            // concat box
            page.appendLine(this.renderConcatBox());
            // merge box
            page.appendLine(this.renderMergeBox());

            // divider
            page.appendLine('<hr style="margin: 5px 0;"/>');
            // allocate to
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_bdAllocateTo', 'wp100', 'Allocate to');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}"/>', 'vp_bdAllocateTo', 'New variable name');
            // reset index
            page.appendFormatLine('<label><input type="checkbox" id="{0}"/><span>{1}</span></label>', 'vp_bdResetIndex', 'reset index');
            page.appendLine('</div>');

            page.appendLine('</div>'); // vp-bd-grid-box
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

        renderConcatBox() {
            var page = new sb.StringBuilder();
            // concat box
            page.appendFormatLine('<div class="{0} {1}" {2}>', 'vp-bd-type-box', 'concat', this.state.type=='concat'?'':'style="display: none;"');
            // variable
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_bdVariable', 'vp-orange-text wp100', 'Variable');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_bdVariable', 'Variable');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_bdVariableSelect', 'vp-button wp50', 'Edit');
            page.appendLine('</div>');
            // join
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_bdJoin', 'wp100', 'Join');
            page.appendFormatLine('<select id="{0}">', 'vp_bdJoin');
            page.appendFormatLine('<option value="{0}" {1}>{2}</option>', 'outer', this.state.concat.join=='outer'?'selected':'', 'Outer');
            page.appendFormatLine('<option value="{0}" {1}>{2}</option>', 'inner', this.state.concat.join=='inner'?'selected':'', 'Inner');
            page.appendLine('</select>');
            page.appendLine('</select>');
            page.appendLine('</div>');
            // axis
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_bdAxis', 'wp100', 'Axis');
            page.appendFormatLine('<select id="{0}">', 'vp_bdAxis');
            page.appendFormatLine('<option value="{0}" {1}>{2}</option>', 0, this.state.concat.axis==0?'selected':'', 'Index');
            page.appendFormatLine('<option value="{0}" {1}>{2}</option>', 1, this.state.concat.axis==1?'selected':'', 'Column');
            page.appendLine('</select>');
            page.appendLine('</div>');
            // sort
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_bdSort', 'wp100', 'Sort');
            page.appendFormatLine('<select id="{0}">', 'vp_bdSort');
            page.appendFormatLine('<option value="{0}" {1}>{2}</option>', 'no', this.state.concat.sort=='no'?'selected':'', 'No');
            page.appendFormatLine('<option value="{0}" {1}>{2}</option>', 'yes', this.state.concat.sort=='yes'?'selected':'', 'Yes');
            page.appendLine('</select>');
            page.appendLine('</div>');
            page.appendLine('</div>'); // vp-bd-type-box concat
            return page.toString();
        }

        renderMergeBox() {
            var page = new sb.StringBuilder();
            // merge box
            page.appendFormatLine('<div class="{0} {1}" {2}>', 'vp-bd-type-box', 'merge', this.state.type=='merge'?'':'style="display: none;"');
            // left dataframe
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_bdLeftDataframe', 'vp-orange-text wp100', 'Left Data');
            page.appendFormatLine('<select id="{0}">', 'vp_bdLeftDataframe');
            page.appendLine('</select>');
            page.appendFormatLine('<div class="{0}" title="{1}"><img src="{2}"/></div>', 'vp-bd-df-refresh', 'Refresh all dataframe list', '/nbextensions/visualpython/resource/refresh.svg');
            page.appendLine('</div>');
            // right dataframe
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_bdRightDataframe', 'vp-orange-text wp100', 'Right Data');
            page.appendFormatLine('<select id="{0}">', 'vp_bdRightDataframe');
            page.appendLine('</select>');
            page.appendLine('</div>');
            // divider  
            page.appendLine('<hr style="margin: 5px 0;"/>');
            // how
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_bdHow', 'wp100', 'How');
            page.appendFormatLine('<select id="{0}">', 'vp_bdHow');
            var savedHow = this.state.merge.how;
            this.howList.forEach(how => {
                page.appendFormatLine('<option value="{0}"{1} title="{2}">{3}</option>', how.value, savedHow==how.value?' selected':'', how.desc, how.label);
            });
            page.appendLine('</select>');
            page.appendLine('</div>');
            // on
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_bdOn', 'wp100', 'On');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_bdOn', 'Merge key');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_bdOnSelect', 'vp-button wp50', 'Edit');
            page.appendLine('</div>');
            // left on
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_bdLeftOn', 'wp100', 'Left on');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_bdLeftOn', 'Left key');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_bdLeftOnSelect', 'vp-button wp50', 'Edit');
            // left use index
            page.appendFormatLine('<label><input type="checkbox" id="{0}"/><span>{1}</span></label>', 'vp_bdLeftIndex', 'use index');
            page.appendLine('</div>');
            // right on
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_bdRightOn', 'wp100', 'Right on');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_bdRightOn', 'Right key');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_bdRightOnSelect', 'vp-button wp50', 'Edit');
            // right use index
            page.appendFormatLine('<label><input type="checkbox" id="{0}"/><span>{1}</span></label>', 'vp_bdRightIndex', 'use index');
            page.appendLine('</div>');
            // suffixes
            page.appendLine('<div>');
            page.appendFormatLine('<label class="{0}">{1}</label>', 'wp100', 'Suffixes');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}"/>', 'vp_bdLeftSuffix', 'Left suffix');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}"/>', 'vp_bdRightSuffix', 'Right suffix');
            page.appendLine('</div>');
            page.appendLine('</div>'); // vp-bd-type-box merge
            return page.toString();
        }

        /**
         * Render variable list (for dataframe)
         * @param {Array<object>} varList
         * @param {string} defaultValue previous value
         */
        renderVariableList(id, varList, defaultValue='') {
            var tag = new sb.StringBuilder();
            tag.appendFormatLine('<select id="{0}">', id);
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
         * Open Inner popup page for variable selection
         * @param {Object} targetSelector 
         */
        openVariablePopup(targetSelector) {
            this.popup.targetSelector = targetSelector;
            var previousList = this.popup.targetSelector.data('list');
            if (previousList) {
                previousList = previousList.map(data => data.code)
            }
            this.popup.MultiSelector = new vpMultiSelector(
                this._wrapSelector('.' + APP_POPUP_BODY), 
                { mode: 'variable', type: ['DataFrame', 'Series'], selectedList: previousList }
            );

            // set title
            $(this._wrapSelector('.' + APP_POPUP_BOX + ' .' + APP_TITLE)).text('Select variables');
    
            // show popup box
            $(this._wrapSelector('.' + APP_POPUP_BOX)).show();
        }

        /**
         * Open Inner popup page for column selection
         * @param {Array<string>} targetVariable 
         * @param {Object} targetSelector 
         * @param {string} title
         */
        openColumnPopup(targetVariable, targetSelector, title='Select Columns') {
            this.popup.targetVariable = targetVariable;
            this.popup.targetSelector = targetSelector;
            var previousList = this.popup.targetSelector.data('list');
            if (previousList) {
                previousList = previousList.map(col => col.code)
            }

            this.popup.MultiSelector = new vpMultiSelector(
                this._wrapSelector('.' + APP_POPUP_BODY), 
                { mode: 'columns', parent: targetVariable, selectedList: previousList }
            );
    
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
                    var prevValue = that.state.merge.left.variable;
                    // replace
                    $(that._wrapSelector('#vp_bdLeftDataframe')).replaceWith(function() {
                        return that.renderVariableList('vp_bdLeftDataframe', varList, prevValue);
                    });
                    $(that._wrapSelector('#vp_bdLeftDataframe')).trigger('change');

                    prevValue = that.state.merge.right.variable;
                    $(that._wrapSelector('#vp_bdRightDataframe')).replaceWith(function() {
                        return that.renderVariableList('vp_bdRightDataframe', varList, prevValue);
                    });
                    $(that._wrapSelector('#vp_bdRightDataframe')).trigger('change');
                } catch (ex) {
                    console.log('Bind:', result);
                }
            });
        }

        unbindEvent() {
            $(document).unbind(vpCommon.formatString(".{0} .{1}", this.uuid, APP_BODY));

            $(document).off('change', this._wrapSelector('#vp_bdType'));

            $(document).off('change', this._wrapSelector('#vp_bdVariable'));
            $(document).off('click', this._wrapSelector('#vp_bdVariableSelect'));
            $(document).off('change', this._wrapSelector('#vp_bdJoin'));
            $(document).off('change', this._wrapSelector('#vp_bdAxis'));
            $(document).off('change', this._wrapSelector('#vp_bdSort'));

            $(document).off('change', this._wrapSelector('#vp_bdLeftDataframe'));
            $(document).off('change', this._wrapSelector('#vp_bdRightDataframe'));
            $(document).off('click', this._wrapSelector('.vp-bd-df-refresh'));
            $(document).off('change', this._wrapSelector('#vp_bdHow'));
            $(document).off('change', this._wrapSelector('#vp_bdOn'));
            $(document).off('click', this._wrapSelector('#vp_bdOnSelect'));
            $(document).off('change', this._wrapSelector('#vp_bdLeftOn'));
            $(document).off('click', this._wrapSelector('#vp_bdLeftOnSelect'));
            $(document).off('change', this._wrapSelector('#vp_gbLeftIndex'));
            $(document).off('change', this._wrapSelector('#vp_bdRightOn'));
            $(document).off('click', this._wrapSelector('#vp_bdRightOnSelect'));
            $(document).off('change', this._wrapSelector('#vp_gbRightIndex'));
            $(document).off('change', this._wrapSelector('#vp_bdLeftSuffix'));
            $(document).off('change', this._wrapSelector('#vp_bdRightSuffix'));
            $(document).off('change', this._wrapSelector('#vp_bdAllocateTo'));
            $(document).off('change', this._wrapSelector('#vp_bdResetIndex'));
            

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

        bindEvent() {
            var that = this;
            //====================================================================
            // User operation Events
            //====================================================================
            $(document).on('change', this._wrapSelector('#vp_bdType'), function() {
                var type = $(this).val();
                that.state.type = type;
                if (type == 'concat') {
                    $(that._wrapSelector('.vp-bd-type-box.concat')).show();
                    $(that._wrapSelector('.vp-bd-type-box.merge')).hide();
                } else {
                    $(that._wrapSelector('.vp-bd-type-box.merge')).show();
                    $(that._wrapSelector('.vp-bd-type-box.concat')).hide();
                }
            });

            //====================================================================
            // Concat box Events
            //====================================================================\
            // variable change event
            $(document).on('change', this._wrapSelector('#vp_bdVariable'), function(event) {
                var varList = event.dataList;
                that.state.concat.variable = varList;
            });

            // variable select button event
            $(document).on('click', this._wrapSelector('#vp_bdVariableSelect'), function() {
                that.openVariablePopup($(that._wrapSelector('#vp_bdVariable')));
            });

            // join
            $(document).on('change', this._wrapSelector('#vp_bdJoin'), function() {
                that.state.concat.join = $(this).val();
            });

            // axis
            $(document).on('change', this._wrapSelector('#vp_bdAxis'), function() {
                that.state.concat.axis = $(this).val();
            });

            // sort
            $(document).on('change', this._wrapSelector('#vp_bdSort'), function() {
                that.state.concat.sort = $(this).val() == 'yes';
            });

            //====================================================================
            // Merge box Events
            //====================================================================
            // Left variable change event
            $(document).on('change', this._wrapSelector('#vp_bdLeftDataframe'), function() {
                // if variable changed, clear groupby, display
                var newVal = $(this).val();
                if (newVal != that.state.merge.left.variable) {
                    $(that._wrapSelector('#vp_bdOn')).val('');
                    $(that._wrapSelector('#vp_bdLeftOn')).val('');
                    that.state.merge.left.variable = newVal;
                    that.state.merge.left.on = [];
                    that.state.merge.on = [];
                }
            });
            // Right variable change event
            $(document).on('change', this._wrapSelector('#vp_bdRightDataframe'), function() {
                // if variable changed, clear groupby, display
                var newVal = $(this).val();
                if (newVal != that.state.merge.right.variable) {
                    $(that._wrapSelector('#vp_bdOn')).val('');
                    $(that._wrapSelector('#vp_bdRightOn')).val('');
                    that.state.merge.right.variable = newVal;
                    that.state.merge.right.on = [];
                    that.state.merge.on = [];
                }
            });

            // variable refresh event
            $(document).on('click', this._wrapSelector('.vp-bd-df-refresh'), function() {
                that.loadVariableList();
            });

            // how
            $(document).on('change', this._wrapSelector('#vp_bdHow'), function() {
                that.state.merge.how = $(this).val();
            });

            // on change event
            $(document).on('change', this._wrapSelector('#vp_bdOn'), function(event) {
                var colList = event.dataList;
                that.state.merge.on = colList;
                
                if (colList && colList.length > 0) {
                    $(that._wrapSelector('#vp_bdLeftOnSelect')).attr('disabled', true);
                    $(that._wrapSelector('#vp_bdRightOnSelect')).attr('disabled', true);
                } else {
                    $(that._wrapSelector('#vp_bdLeftOnSelect')).attr('disabled', false);
                    $(that._wrapSelector('#vp_bdRightOnSelect')).attr('disabled', false);
                }
            });

            // on select button event
            $(document).on('click', this._wrapSelector('#vp_bdOnSelect'), function() {
                var targetVariable = [ that.state.merge.left.variable, that.state.merge.right.variable ];
                that.openColumnPopup(targetVariable, $(that._wrapSelector('#vp_bdOn')), 'Select columns from both dataframe');
            });

            // Left on change event
            $(document).on('change', this._wrapSelector('#vp_bdLeftOn'), function(event) {
                var colList = event.dataList;
                that.state.merge.left.on = colList;
                
                if ((colList && colList.length > 0)
                    || that.state.merge.right.on && that.state.merge.right.on.length > 0) {
                    $(that._wrapSelector('#vp_bdOnSelect')).attr('disabled', true);
                } else {
                    $(that._wrapSelector('#vp_bdOnSelect')).attr('disabled', false);
                }
            });

            // Left on select button event
            $(document).on('click', this._wrapSelector('#vp_bdLeftOnSelect'), function() {
                var targetVariable = [ that.state.merge.left.variable ];
                that.openColumnPopup(targetVariable, $(that._wrapSelector('#vp_bdLeftOn')), 'Select columns from left dataframe');
            });

            // Left use index
            $(document).on('change', this._wrapSelector('#vp_bdLeftIndex'), function() {
                var useIndex = $(this).prop('checked');
                that.state.merge.left.useIndex = useIndex;

                if (useIndex || that.state.merge.right.useIndex) {
                    $(that._wrapSelector('#vp_bdOnSelect')).attr('disabled', true);
                } else {
                    $(that._wrapSelector('#vp_bdOnSelect')).attr('disabled', false);
                }
            });

            // Right on change event
            $(document).on('change', this._wrapSelector('#vp_bdRightOn'), function(event) {
                var colList = event.dataList;
                that.state.merge.right.on = colList;
                
                if ((colList && colList.length > 0)
                    || that.state.merge.left.on && that.state.merge.left.on.length > 0) {
                    $(that._wrapSelector('#vp_bdOnSelect')).attr('disabled', true);
                } else {
                    $(that._wrapSelector('#vp_bdOnSelect')).attr('disabled', false);
                }
            });

            // Right on select button event
            $(document).on('click', this._wrapSelector('#vp_bdRightOnSelect'), function() {
                var targetVariable = [ that.state.merge.right.variable ];
                that.openColumnPopup(targetVariable, $(that._wrapSelector('#vp_bdRightOn')), 'Select columns from right dataframe');
            });

            // Right use index
            $(document).on('change', this._wrapSelector('#vp_bdRightIndex'), function() {
                var useIndex = $(this).prop('checked');
                that.state.merge.right.useIndex = useIndex;

                if (useIndex || that.state.merge.left.useIndex) {
                    $(that._wrapSelector('#vp_bdOnSelect')).attr('disabled', true);
                } else {
                    $(that._wrapSelector('#vp_bdOnSelect')).attr('disabled', false);
                }
            });

            // Left suffix change event
            $(document).on('change', this._wrapSelector('#vp_bdLeftSuffix'), function() {
                that.state.merge.left.suffix = $(this).val();
            });

            // Right suffix change event
            $(document).on('change', this._wrapSelector('#vp_bdRightSuffix'), function() {
                that.state.merge.right.suffix = $(this).val();
            });

            // allocateTo event
            $(document).on('change', this._wrapSelector('#vp_bdAllocateTo'), function() {
                that.state.allocateTo = $(this).val();
            });
            
            // reset index checkbox event
            $(document).on('change', this._wrapSelector('#vp_bdResetIndex'), function() {
                that.state.resetIndex = $(this).prop('checked');
            });

            //================================================================
            // Page operation Events
            //================================================================
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

            //================================================================
            // Popup box Events
            //================================================================
            // ok input popup
            $(document).on('click', this._wrapSelector('.' + APP_POPUP_OK), function() {
                // ok input popup
                var dataList = that.popup.MultiSelector.getDataList();

                $(that.popup.targetSelector).val(dataList.map(data => { return data.code }).join(','));
                $(that.popup.targetSelector).data('list', dataList);
                $(that.popup.targetSelector).trigger({ type: 'change', dataList: dataList });
                that.closeInnerPopup();
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

        apply(addCell=false, runCell=false) {
            var code = this.generateCode();

            // save state for block
            this._saveState();

            if (this.pageThis) {
                $(this.pagethis._wrapSelector('#' + this.targetId)).val(code);
                $(this.pagethis._wrapSelector('#' + this.targetId)).trigger({
                    type: 'apps_run',
                    title: 'Bind',
                    code: code,
                    state: this.state,
                    addCell: addCell,
                    runCell: runCell
                });
            } else {
                $(vpCommon.wrapSelector('#' + this.targetId)).val(code);
                $(vpCommon.wrapSelector('#' + this.targetId)).trigger({
                    type: 'apps_run',
                    title: 'Bind',
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
                type, concat, merge, allocateTo, resetIndex
            } = this.state;

            //====================================================================
            // Allocation
            //====================================================================
            if (allocateTo && allocateTo != '') {
                code.appendFormat('{0} = ', allocateTo);
            }

            //====================================================================
            // Dataframe variables
            //====================================================================
            code.appendFormat('pd.{0}(', type);

            if (type == 'concat') {
                //====================================================================
                // Concat
                //====================================================================
                // FIXME: consider default
                code.appendFormat("[{0}], join='{1}', axis={2}", concat.variable.map(data=>data.code).join(','), concat.join, concat.axis);

                //====================================================================
                // Sort
                //====================================================================
                if (concat.sort) {
                    code.append(', sort=True');
                }

                //====================================================================
                // Reset index
                //====================================================================
                if (resetIndex) {
                    code.append(', ignore_index=True');
                }

                code.append(')');
            } else {
                //====================================================================
                // Merge
                //====================================================================
                code.appendFormat('{0}, {1}', merge.left.variable, merge.right.variable);
    
                if (merge.on && merge.on.length > 0) {
                    //================================================================
                    // On columns
                    //================================================================
                    code.appendFormat(', on=[{0}]', on.map(col => col.code));
                } else {
                    //====================================================================
                    // Left & Right On columns
                    //====================================================================
                    if (merge.left.useIndex) {
                        code.append(', left_index=True');
                    } else {
                        if (merge.left.on && merge.left.on.length > 0) {
                            code.appendFormat(', left_on=[{0}]', merge.left.on.map(col => col.code));
                        } 
                    }
    
                    if (merge.right.useIndex) {
                        code.append(', right_index=True');
                    } else {
                        if (merge.right.on && merge.right.on.length > 0) {
                            code.appendFormat(', right_on=[{0}]', merge.right.on.map(col => col.code));
                        } 
                    }
                }
                //====================================================================
                // How
                //====================================================================
                if (merge.how) {
                    code.appendFormat(", how='{0}'", merge.how);
                }
    
                //====================================================================
                // Suffixes
                //====================================================================
                if (merge.left.suffix != '' || merge.right.suffix != '') {
                    code.appendFormat(", suffixes=('{0}', '{1}')", merge.left.suffix, merge.right.suffix);
                }
    
                code.append(')');
    
                //====================================================================
                // Reset index
                //====================================================================
                if (resetIndex) {
                    code.append('.reset_index()');
                }
            }

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

    return Bind
}); /* function, define */

/* End of file */