/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : vpReshape.js
 *    Author          : Black Logic
 *    Note            : Reshape app
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
    // [CLASS] Reshape
    //========================================================================
    class Reshape {
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

            this.state = {};
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
                variable, type, pivot, melt, allocateTo, resetIndex
            } = state;

            $(this._wrapSelector('#vp_rsDataframe')).val(variable);
            $(this._wrapSelector('#vp_rsType')).val(type);

            // pivot
            this._loadColumnSelectorInput(this._wrapSelector('#vp_rsIndex'), pivot.index);
            this._loadColumnSelectorInput(this._wrapSelector('#vp_rsColumns'), pivot.columns);
            this._loadColumnSelectorInput(this._wrapSelector('#vp_rsValues'), pivot.values);

            // melt
            this._loadColumnSelectorInput(this._wrapSelector('#vp_rsIdVars'), melt.idVars);
            this._loadColumnSelectorInput(this._wrapSelector('#vp_rsValueVars'), melt.valueVars);

            // allocateTo
            $(this._wrapSelector('#vp_rsAllocateTo')).val(allocateTo);
            $(this._wrapSelector('#vp_rsResetIndex')).prop('checked', resetIndex);
        }

        _saveState() {

        }

        _resetColumnSelector(target) {
            $(target).val('');
            $(target).data('list', []);
        }

        _loadColumnSelectorInput(tag, colList) {
            $(tag).val(colList.map(col=>col.code).join(','));
            $(tag).data('list', colList)
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
                variable: '',
                type: 'pivot',
                resetIndex: false,
                pivot: {
                    index: [],
                    columns: [],
                    values: []
                },
                melt: {
                    idVars: [],
                    ValueVars: []
                }
            }
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
            vpCommon.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + 'common/popupPage.css');
            vpCommon.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + 'common/reshape.css');

            this.loadVariableList();
        }

        render() {
            var page = new sb.StringBuilder();
            page.appendFormatLine('<div class="{0} {1}">', APP_PREFIX, this.uuid);
            page.appendFormatLine('<div class="{0} {1}">', APP_CONTAINER, 'vp-rs-container');

            // popup
            page.appendLine(this.renderInnerPopup());

            // title
            page.appendFormat('<div class="{0}">{1}</div>',
                APP_TITLE, 'Reshape');

            // close button
            page.appendFormatLine('<div class="{0}"><img src="{1}"/></div>',
                APP_CLOSE, '/nbextensions/visualpython/resource/close_big.svg');

            // body start
            page.appendFormatLine('<div class="{0}">', APP_BODY);
            page.appendFormatLine('<div class="{0}">', 'vp-rs-df-box'); // df-box
            // dataframe
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_rsDataframe', 'vp-orange-text wp100', 'Dataframe');
            page.appendFormatLine('<select id="{0}">', 'vp_rsDataframe');
            page.appendLine('</select>');
            page.appendFormatLine('<div class="{0}" title="{1}"><img src="{2}"/></div>', 'vp-rs-df-refresh', 'Refresh dataframe list', '/nbextensions/visualpython/resource/refresh.svg');
            page.appendLine('</div>');
            // reshape type
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_rsType', 'vp-orange-text wp100', 'Reshape Type');
            page.appendFormatLine('<select id="{0}">', 'vp_rsType');
            var savedType = this.state.type;
            var typeList = ['pivot', 'melt'];
            typeList.forEach(type => {
                page.appendFormatLine('<option value="{0}"{1}>{2}</option>', type, type==savedType?' selected':'', type);
            });
            page.appendLine('</select>');
            page.appendLine('</div>');
            // divider
            page.appendLine('<hr style="margin: 5px 0;"/>');
            // pivot page
            page.appendFormatLine('<div class="{0} {1}" {2}>', 'vp-rs-type-box', 'pivot', this.state.type=='pivot'?'':'style="display:none;"'); // pivot box
            // pivot page
            page.appendFormatLine('<div class="{0}">{1}</div>', 'vp-rs-type-title', 'Pivot');
            // index
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_rsIndex', 'wp100', 'Index');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_rsIndex', 'Index key');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_rsIndexSelect', 'vp-button wp50', 'Edit');
            page.appendLine('</div>');
            // columns
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_rsColumns', 'vp-orange-text wp100', 'Columns');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_rsColumns', 'Columns key');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_rsColumnsSelect', 'vp-button wp50', 'Edit');
            page.appendLine('</div>');
            // values
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_rsValues', 'wp100', 'Values');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_rsValues', 'Values key');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_rsValuesSelect', 'vp-button wp50', 'Edit');
            page.appendLine('</div>');
            page.appendLine('</div>'); // end of pivot box
            // melt page
            page.appendFormatLine('<div class="{0} {1}" {2}>', 'vp-rs-type-box', 'melt', this.state.type=='melt'?'':'style="display:none;"'); // melt box
            page.appendFormatLine('<div class="{0}">{1}</div>', 'vp-rs-type-title', 'Melt');
            // id vars
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_rsIdVars', 'wp100', 'Id');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_rsIdVars', 'Id vars');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_rsIdVarsSelect', 'vp-button wp50', 'Edit');
            page.appendLine('</div>');
            // value vars
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_rsValueVars', 'wp100', 'Value');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_rsValueVars', 'Value vars');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_rsValueVarsSelect', 'vp-button wp50', 'Edit');
            page.appendLine('</div>');
            page.appendLine('</div>'); // end of melt box
            // divider
            page.appendLine('<hr style="margin: 5px 0;"/>');
            // allocate to
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_rsAllocateTo', 'wp100', 'Allocate to');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}"/>', 'vp_rsAllocateTo', 'New variable name');
            // reset index
            page.appendFormatLine('<label><input type="checkbox" id="{0}"/><span>{1}</span></label>', 'vp_rsResetIndex', 'reset index');
            page.appendLine('</div>');
            page.appendLine('</div>'); // end of vp-rs-df-box
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
         * Render column selector using ColumnSelector module
         * @param {Array<string>} previousList previous selected columns
         * @param {Array<string>} includeList columns to include 
         */
        renderColumnSelector(targetVariable, previousList, includeList) {
            this.popup.ColSelector = new vpColumnSelector(
                this._wrapSelector('.' + APP_POPUP_BODY), 
                { dataframe: targetVariable, selectedList: previousList, includeList: includeList }
            );
        }

        /**
         * Open Inner popup page for column selection
         * @param {Object} targetSelector 
         * @param {string} title 
         * @param {Array<string>} includeList 
         */
        openInnerPopup(targetVariable, targetSelector, title='Select columns', includeList=[]) {
            this.popup.targetVariable = targetVariable;
            this.popup.targetSelector = targetSelector;
            var previousList = this.popup.targetSelector.data('list');
            if (previousList) {
                previousList = previousList.map(col => col.code)
            }
            this.renderColumnSelector(targetVariable, previousList, includeList);
    
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
                    var prevValue = that.state.variable;
                    // replace
                    $(that._wrapSelector('#vp_rsDataframe')).replaceWith(function() {
                        return that.renderVariableList('vp_rsDataframe', varList, prevValue);
                    });
                    $(that._wrapSelector('#vp_rsDataframe')).trigger('change');
                } catch (ex) {
                    console.log('Bind:', result);
                }
            });
        }

        unbindEvent() {
            $(document).unbind(vpCommon.formatString(".{0} .{1}", this.uuid, APP_BODY));

            $(document).off('change', this._wrapSelector('#vp_rsDataframe'));
            $(document).off('click', this._wrapSelector('.vp-rs-df-refresh'));
            $(document).off('change', this._wrapSelector('#vp_rsType'));
            $(document).off('change', this._wrapSelector('#vp_rsIndex'));
            $(document).off('click', this._wrapSelector('#vp_rsIndexSelect'));
            $(document).off('change', this._wrapSelector('#vp_rsColumns'));
            $(document).off('click', this._wrapSelector('#vp_rsColumnsSelect'));
            $(document).off('change', this._wrapSelector('#vp_rsValues'));
            $(document).off('click', this._wrapSelector('#vp_rsValuesSelect'));
            $(document).off('change', this._wrapSelector('#vp_rsIdVars'));
            $(document).off('click', this._wrapSelector('#vp_rsIdVarsSelect'));
            $(document).off('change', this._wrapSelector('#vp_rsValueVars'));
            $(document).off('click', this._wrapSelector('#vp_rsValueVarsSelect'));
            $(document).off('change', this._wrapSelector('#vp_rsAllocateTo'));
            $(document).off('change', this._wrapSelector('#vp_rsResetIndex'));

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
            // variable change event
            $(document).on('change', this._wrapSelector('#vp_rsDataframe'), function() {
                // if variable changed
                var newVal = $(this).val();
                if (newVal != that.state.variable) {
                    that.state.variable = newVal;
                    // initial child values
                    that._resetColumnSelector(that._wrapSelector('#vp_rsIndex'));
                    that._resetColumnSelector(that._wrapSelector('#vp_rsColumns'));
                    that._resetColumnSelector(that._wrapSelector('#vp_rsValues'));

                    that._resetColumnSelector(that._wrapSelector('#vp_rsIdVars'));
                    that._resetColumnSelector(that._wrapSelector('#vp_rsValueVars'));

                    that.state.pivot = {
                        index: [], columns: [], values: []
                    };
                    that.state.melt = {
                        idVars: [], valueVars: []
                    };
                }
            });

            // variable refresh event
            $(document).on('click', this._wrapSelector('.vp-rs-df-refresh'), function() {
                that.loadVariableList();
            });

            // on change event
            $(document).on('change', this._wrapSelector('#vp_rsType'), function(event) {
                var type = $(this).val();
                that.state.type = type;
                // change visibility
                if (type == 'pivot') {
                    $(that._wrapSelector('.vp-rs-type-box.melt')).hide();
                    $(that._wrapSelector('.vp-rs-type-box.pivot')).show();
                } else {
                    $(that._wrapSelector('.vp-rs-type-box.pivot')).hide();
                    $(that._wrapSelector('.vp-rs-type-box.melt')).show();
                }
            });

            // index change event
            $(document).on('change', this._wrapSelector('#vp_rsIndex'), function(event) {
                var colList = event.colList;
                that.state.pivot.index = colList;
            });

            // index select button event
            $(document).on('click', this._wrapSelector('#vp_rsIndexSelect'), function() {
                var targetVariable = [ that.state.variable ];
                that.openInnerPopup(targetVariable, $(that._wrapSelector('#vp_rsIndex')), 'Select columns');
            });

            // columns change event
            $(document).on('change', this._wrapSelector('#vp_rsColumns'), function(event) {
                var colList = event.colList;
                that.state.pivot.columns = colList;
            });

            // columns select button event
            $(document).on('click', this._wrapSelector('#vp_rsColumnsSelect'), function() {
                var targetVariable = [ that.state.variable ];
                that.openInnerPopup(targetVariable, $(that._wrapSelector('#vp_rsColumns')), 'Select columns');
            });

            // values change event
            $(document).on('change', this._wrapSelector('#vp_rsValues'), function(event) {
                var colList = event.colList;
                that.state.pivot.values = colList;
            });

            // values select button event
            $(document).on('click', this._wrapSelector('#vp_rsValuesSelect'), function() {
                var targetVariable = [ that.state.variable ];
                that.openInnerPopup(targetVariable, $(that._wrapSelector('#vp_rsValues')), 'Select columns');
            });

            // id vars change event
            $(document).on('change', this._wrapSelector('#vp_rsIdVars'), function(event) {
                var colList = event.colList;
                that.state.melt.idVars = colList;
            });

            // id vars select button event
            $(document).on('click', this._wrapSelector('#vp_rsIdVarsSelect'), function() {
                var targetVariable = [ that.state.variable ];
                that.openInnerPopup(targetVariable, $(that._wrapSelector('#vp_rsIdVars')), 'Select columns');
            });

            // value vars change event
            $(document).on('change', this._wrapSelector('#vp_rsValueVars'), function(event) {
                var colList = event.colList;
                that.state.melt.valueVars = colList;
            });

            // value vars select button event
            $(document).on('click', this._wrapSelector('#vp_rsValueVarsSelect'), function() {
                var targetVariable = [ that.state.variable ];
                that.openInnerPopup(targetVariable, $(that._wrapSelector('#vp_rsValueVars')), 'Select columns');
            });

            // allocateTo event
            $(document).on('change', this._wrapSelector('#vp_rsAllocateTo'), function() {
                that.state.allocateTo = $(this).val();
            });
            
            // reset index checkbox event
            $(document).on('change', this._wrapSelector('#vp_rsResetIndex'), function() {
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
                if (!$(evt.target).hasClass('.' + APP_BUTTON_DETAIL)) {
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
                var colList = that.popup.ColSelector.getColumnList();

                $(that.popup.targetSelector).val(colList.map(col => { return col.code }).join(','));
                $(that.popup.targetSelector).data('list', colList);
                $(that.popup.targetSelector).trigger({ type: 'change', colList: colList });
                that.closeInnerPopup(); that.closeInnerPopup();
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
                    title: 'Reshape',
                    code: code,
                    state: this.state,
                    addCell: addCell,
                    runCell: runCell
                });
            } else {
                $(vpCommon.wrapSelector('#' + this.targetId)).val(code);
                $(vpCommon.wrapSelector('#' + this.targetId)).trigger({
                    type: 'apps_run',
                    title: 'Reshape',
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
            var { variable, type, allocateTo, resetIndex, pivot, melt } = this.state;

            //====================================================================
            // Allocation
            //====================================================================
            if (allocateTo && allocateTo != '') {
                code.appendFormat('{0} = ', allocateTo);
            }

            //====================================================================
            // Dataframe variables
            //====================================================================
            code.appendFormat('{0}.{1}(', variable, type);

            var options = [];
            if (type == 'pivot') {
                //================================================================
                // pivot
                //================================================================
                // index (optional)
                if (pivot.index && pivot.index.length > 0) {
                    if (pivot.index.length == 1) {
                        options.push(vpCommon.formatString("index={0}", pivot.index[0].code));
                    } else {
                        options.push(vpCommon.formatString("index=[{0}]", pivot.index.map(col => col.code).join(',')));
                    }
                }

                // columns
                if (pivot.columns && pivot.columns.length > 0) {
                    if (pivot.columns.length == 1) {
                        options.push(vpCommon.formatString("columns={0}", pivot.columns[0].code));
                    } else {
                        options.push(vpCommon.formatString("columns=[{0}]", pivot.columns.map(col => col.code).join(',')));
                    }
                }

                // values (optional)
                if (pivot.values && pivot.values.length > 0) {
                    if (pivot.values.length == 1) {
                        options.push(vpCommon.formatString("values={0}", pivot.values[0].code));
                    } else {
                        options.push(vpCommon.formatString("values=[{0}]", pivot.values.map(col => col.code).join(',')));
                    }
                }

            } else {
                //================================================================
                // melt
                //================================================================
                // id vars (optional)
                if (melt.idVars && melt.idVars.length > 0) {
                    if (melt.idVars.length == 1) {
                        options.push(vpCommon.formatString("id_vars={0}", melt.idVars[0].code));
                    } else {
                        options.push(vpCommon.formatString("id_vars=[{0}]", melt.idVars.map(col => col.code).join(',')));
                    }
                }

                // value vars (optional)
                if (melt.valueVars && melt.valueVars.length > 0) {
                    if (melt.valueVars.length == 1) {
                        options.push(vpCommon.formatString("value_vars={0}", melt.valueVars[0].code));
                    } else {
                        options.push(vpCommon.formatString("value_vars=[{0}]", melt.valueVars.map(col => col.code).join(',')));
                    }
                }
            }

            code.appendFormat('{0})', options.join(', '));

            //====================================================================
            // Reset index
            //====================================================================
            if (resetIndex) {
                code.append('.reset_index()');
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

    return Reshape
}); /* function, define */

/* End of file */