/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : vpMerge.js
 *    Author          : Black Logic
 *    Note            : Merge app
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
    // [CLASS] Merge
    //========================================================================
    class Merge {
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
                { label: 'inner', value: 'inner' },
                { label: 'outer', value: 'outer' },
                { label: 'left', value: 'left' },
                { label: 'right', value: 'right' },
                { label: 'cross', value: 'cross' },
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
                left, right, on, how, allocateTo, resetIndex
            } = state;

            $(this._wrapSelector('#vp_mgLeftDataframe')).val(left.variable);
            $(this._wrapSelector('#vp_mpRightDataframe')).val(right.variable);

            $(this._wrapSelector('#vp_mgHow')).val(how);
            this._loadColumnSelectorInput(this._wrapSelector('#vp_mgOn'), on);
            if (on && on.length > 0) {
                $(this._wrapSelector('#vp_mgLeftOnSelect')).attr('disabled', true);
                $(this._wrapSelector('#vp_mgRightOnSelect')).attr('disabled', true);
            }
            this._loadColumnSelectorInput(this._wrapSelector('#vp_mgLeftOn'), left.on);
            this._loadColumnSelectorInput(this._wrapSelector('#vp_mgRightOn'), right.on);
            if (left.on.length > 0 || right.on.length > 0) {
                $(this._wrapSelector('#vp_mgOnSelect')).attr('disabled', true);
            }

            $(this._wrapSelector('#vp_mgLeftIndex')).prop('checked', left.useIndex);
            $(this._wrapSelector('#vp_mgRightIndex')).prop('checked', right.useIndex);

            $(this._wrapSelector('#vp_mgLeftSuffix')).val(left.suffix);
            $(this._wrapSelector('#vp_mgRightSuffix')).val(right.suffix);

            $(this._wrapSelector('#vp_mgAllocateTo')).val(allocateTo);

            $(this._wrapSelector('#vp_mgResetIndex')).prop('checked', resetIndex);
        }

        _loadColumnSelectorInput(tag, colList) {
            $(tag).val(colList.map(col=>col.code).join(','));
            $(tag).data('list', colList)
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
                allocateTo: '',
                resetIndex: false
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
            vpCommon.loadCssForDiv(this._wrapSelector(), Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + 'common/popupPage.css');
            vpCommon.loadCssForDiv(this._wrapSelector(), Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + 'common/merge.css');

            this.loadVariableList();
        }

        render() {
            var page = new sb.StringBuilder();
            page.appendFormatLine('<div class="{0} {1}">', APP_PREFIX, this.uuid);
            page.appendFormatLine('<div class="{0} {1}">', APP_CONTAINER, 'vp-mg-container');

            // popup
            page.appendLine(this.renderInnerPopup());

            // title
            page.appendFormat('<div class="{0}">{1}</div>',
                APP_TITLE, 'Merge');

            // close button
            page.appendFormatLine('<div class="{0}"><img src="{1}"/></div>',
                APP_CLOSE, '/nbextensions/visualpython/resource/close_big.svg');

            // body start
            page.appendFormatLine('<div class="{0}">', APP_BODY);
            page.appendFormatLine('<div class="{0}">', 'vp-mg-df-box'); // df-box
            // left dataframe
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_mgLeftDataframe', 'vp-orange-text wp100', 'Left Dataframe');
            page.appendFormatLine('<select id="{0}">', 'vp_mgLeftDataframe');
            page.appendLine('</select>');
            page.appendFormatLine('<div class="{0}" title="{1}"><img src="{2}"/></div>', 'vp-mg-df-refresh', 'Refresh all dataframe list', '/nbextensions/visualpython/resource/refresh.svg');
            page.appendLine('</div>');
            // right dataframe
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_mgRightDataframe', 'vp-orange-text wp100', 'Right Dataframe');
            page.appendFormatLine('<select id="{0}">', 'vp_mgRightDataframe');
            page.appendLine('</select>');
            page.appendLine('</div>');
            // divider
            page.appendLine('<hr style="margin: 5px 0;"/>');
            // how
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_mgHow', 'wp100', 'How');
            page.appendFormatLine('<select id="{0}">', 'vp_mgHow');
            var savedHow = this.state.how;
            this.howList.forEach(how => {
                page.appendFormatLine('<option value="{0}"{1}>{2}</option>', how.value, savedHow==how.value?' selected':'', how.label);
            });
            page.appendLine('</select>');
            page.appendLine('</div>');
            // on
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_mgOn', 'wp100', 'On');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_mgOn', 'Merge key');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_mgOnSelect', 'vp-button wp50', 'Edit');
            page.appendLine('</div>');
            // left on
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_mgLeftOn', 'wp100', 'Left on');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_mgLeftOn', 'Left key');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_mgLeftOnSelect', 'vp-button wp50', 'Edit');
            // left use index
            page.appendFormatLine('<label><input type="checkbox" id="{0}"/><span>{1}</span></label>', 'vp_mgRightIndex', 'use index');
            page.appendLine('</div>');
            // right on
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_mgRightOn', 'wp100', 'Right on');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}" disabled>', 'vp_mgRightOn', 'Right key');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_mgRightOnSelect', 'vp-button wp50', 'Edit');
            // right use index
            page.appendFormatLine('<label><input type="checkbox" id="{0}"/><span>{1}</span></label>', 'vp_mgLeftIndex', 'use index');
            page.appendLine('</div>');
            // suffixes
            page.appendLine('<div>');
            page.appendFormatLine('<label class="{0}">{1}</label>', 'wp100', 'Suffixes');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}"/>', 'vp_mgLeftSuffix', 'Left suffix');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}"/>', 'vp_mgRightSuffix', 'Right suffix');
            page.appendLine('</div>');
            // divider
            page.appendLine('<hr style="margin: 5px 0;"/>');
            // allocate to
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_mgAllocateTo', 'wp100', 'Allocate to');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}"/>', 'vp_mgAllocateTo', 'New variable name');
            // reset index
            page.appendFormatLine('<label><input type="checkbox" id="{0}"/><span>{1}</span></label>', 'vp_mgResetIndex', 'reset index');
            
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
                    var prevValue = that.state.left.variable;
                    // replace
                    $(that._wrapSelector('#vp_mgLeftDataframe')).replaceWith(function() {
                        return that.renderVariableList('vp_mgLeftDataframe', varList, prevValue);
                    });
                    $(that._wrapSelector('#vp_mgLeftDataframe')).trigger('change');

                    prevValue = that.state.right.variable;
                    $(that._wrapSelector('#vp_mgRightDataframe')).replaceWith(function() {
                        return that.renderVariableList('vp_mgRightDataframe', varList, prevValue);
                    });
                    $(that._wrapSelector('#vp_mgRightDataframe')).trigger('change');
                } catch (ex) {
                    console.log('Merge:', result);
                }
            });
        }

        unbindEvent() {
            $(document).unbind(vpCommon.formatString(".{0} .{1}", this.uuid, APP_BODY));

            $(document).off('change', this._wrapSelector('#vp_mgLeftDataframe'));
            $(document).off('change', this._wrapSelector('#vp_mgRightDataframe'));
            $(document).off('click', this._wrapSelector('.vp-mg-df-refresh'));
            $(document).off('change', this._wrapSelector('#vp_mgHow'));
            $(document).off('change', this._wrapSelector('#vp_mgOn'));
            $(document).off('click', this._wrapSelector('#vp_mgOnSelect'));
            $(document).off('change', this._wrapSelector('#vp_mgLeftOn'));
            $(document).off('click', this._wrapSelector('#vp_mgLeftOnSelect'));
            $(document).off('change', this._wrapSelector('#vp_gbLeftIndex'));
            $(document).off('change', this._wrapSelector('#vp_mgRightOn'));
            $(document).off('click', this._wrapSelector('#vp_mgRightOnSelect'));
            $(document).off('change', this._wrapSelector('#vp_gbRightIndex'));
            $(document).off('change', this._wrapSelector('#vp_mgLeftSuffix'));
            $(document).off('change', this._wrapSelector('#vp_mgRightSuffix'));
            $(document).off('change', this._wrapSelector('#vp_mgAllocateTo'));
            $(document).off('change', this._wrapSelector('#vp_mgResetIndex'));
            

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
            // Left variable change event
            $(document).on('change', this._wrapSelector('#vp_mgLeftDataframe'), function() {
                // if variable changed, clear groupby, display
                var newVal = $(this).val();
                if (newVal != that.state.left.variable) {
                    $(that._wrapSelector('#vp_mgOn')).val('');
                    $(that._wrapSelector('#vp_mgLeftOn')).val('');
                    that.state.left.variable = newVal;
                    that.state.left.on = [];
                    that.state.on = [];
                }
            });
            // Right variable change event
            $(document).on('change', this._wrapSelector('#vp_mgRightDataframe'), function() {
                // if variable changed, clear groupby, display
                var newVal = $(this).val();
                if (newVal != that.state.right.variable) {
                    $(that._wrapSelector('#vp_mgOn')).val('');
                    $(that._wrapSelector('#vp_mgRightOn')).val('');
                    that.state.right.variable = newVal;
                    that.state.right.on = [];
                    that.state.on = [];
                }
            });

            // variable refresh event
            $(document).on('click', this._wrapSelector('.vp-mg-df-refresh'), function() {
                that.loadVariableList();
            });

            // how
            $(document).on('change', this._wrapSelector('#vp_mgHow'), function() {
                that.state.how = $(this).val();
            });

            // on change event
            $(document).on('change', this._wrapSelector('#vp_mgOn'), function(event) {
                var colList = event.colList;
                that.state.on = colList;
                
                if (colList && colList.length > 0) {
                    $(that._wrapSelector('#vp_mgLeftOnSelect')).attr('disabled', true);
                    $(that._wrapSelector('#vp_mgRightOnSelect')).attr('disabled', true);
                } else {
                    $(that._wrapSelector('#vp_mgLeftOnSelect')).attr('disabled', false);
                    $(that._wrapSelector('#vp_mgRightOnSelect')).attr('disabled', false);
                }
            });

            // on select button event
            $(document).on('click', this._wrapSelector('#vp_mgOnSelect'), function() {
                var targetVariable = [ that.state.left.variable, that.state.right.variable ];
                that.openInnerPopup(targetVariable, $(that._wrapSelector('#vp_mgOn')), 'Select columns from both dataframe');
            });

            // Left on change event
            $(document).on('change', this._wrapSelector('#vp_mgLeftOn'), function(event) {
                var colList = event.colList;
                that.state.left.on = colList;
                
                if ((colList && colList.length > 0)
                    || that.state.right.on && that.state.right.on.length > 0) {
                    $(that._wrapSelector('#vp_mgOnSelect')).attr('disabled', true);
                } else {
                    $(that._wrapSelector('#vp_mgOnSelect')).attr('disabled', false);
                }
            });

            // Left on select button event
            $(document).on('click', this._wrapSelector('#vp_mgLeftOnSelect'), function() {
                var targetVariable = [ that.state.left.variable ];
                that.openInnerPopup(targetVariable, $(that._wrapSelector('#vp_mgLeftOn')), 'Select columns from left dataframe');
            });

            // Left use index
            $(document).on('change', this._wrapSelector('#vp_mgLeftIndex'), function() {
                var useIndex = $(this).prop('checked');
                that.state.left.useIndex = useIndex;

                if (useIndex || that.state.right.useIndex) {
                    $(that._wrapSelector('#vp_mgOnSelect')).attr('disabled', true);
                } else {
                    $(that._wrapSelector('#vp_mgOnSelect')).attr('disabled', false);
                }
            });

            // Right on change event
            $(document).on('change', this._wrapSelector('#vp_mgRightOn'), function(event) {
                var colList = event.colList;
                that.state.right.on = colList;
                
                if ((colList && colList.length > 0)
                    || that.state.left.on && that.state.left.on.length > 0) {
                    $(that._wrapSelector('#vp_mgOnSelect')).attr('disabled', true);
                } else {
                    $(that._wrapSelector('#vp_mgOnSelect')).attr('disabled', false);
                }
            });

            // Right on select button event
            $(document).on('click', this._wrapSelector('#vp_mgRightOnSelect'), function() {
                var targetVariable = [ that.state.right.variable ];
                that.openInnerPopup(targetVariable, $(that._wrapSelector('#vp_mgRightOn')), 'Select columns from right dataframe');
            });

            // Right use index
            $(document).on('change', this._wrapSelector('#vp_mgRightIndex'), function() {
                var useIndex = $(this).prop('checked');
                that.state.right.useIndex = useIndex;

                if (useIndex || that.state.left.useIndex) {
                    $(that._wrapSelector('#vp_mgOnSelect')).attr('disabled', true);
                } else {
                    $(that._wrapSelector('#vp_mgOnSelect')).attr('disabled', false);
                }
            });

            // Left suffix change event
            $(document).on('change', this._wrapSelector('#vp_mgLeftSuffix'), function() {
                that.state.left.suffix = $(this).val();
            });

            // Right suffix change event
            $(document).on('change', this._wrapSelector('#vp_mgRightSuffix'), function() {
                that.state.right.suffix = $(this).val();
            });

            // allocateTo event
            $(document).on('change', this._wrapSelector('#vp_mgAllocateTo'), function() {
                that.state.allocateTo = $(this).val();
            });
            
            // reset index checkbox event
            $(document).on('change', this._wrapSelector('#vp_mgResetIndex'), function() {
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
                    title: 'Merge',
                    code: code,
                    state: this.state,
                    addCell: addCell,
                    runCell: runCell
                });
            } else {
                $(vpCommon.wrapSelector('#' + this.targetId)).val(code);
                $(vpCommon.wrapSelector('#' + this.targetId)).trigger({
                    type: 'apps_run',
                    title: 'Merge',
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
                left, right, on, how, allocateTo, resetIndex
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
            code.appendFormat('pd.merge({0}, {1}', left.variable, right.variable);

            if (on && on.length > 0) {
                //================================================================
                // On columns
                //================================================================
                code.appendFormat(', on=[{0}]', on.map(col => col.code));
            } else {
                //====================================================================
                // Left & Right On columns
                //====================================================================
                if (left.useIndex) {
                    code.append(', left_index=True');
                } else {
                    if (left.on && left.on.length > 0) {
                        code.appendFormat(', left_on=[{0}]', left.on.map(col => col.code));
                    } 
                }

                if (right.useIndex) {
                    code.append(', right_index=True');
                } else {
                    if (right.on && right.on.length > 0) {
                        code.appendFormat(', right_on=[{0}]', right.on.map(col => col.code));
                    } 
                }
            }
            //====================================================================
            // How
            //====================================================================
            if (how) {
                code.appendFormat(", how='{0}'", how);
            }

            //====================================================================
            // Suffixes
            //====================================================================
            if (left.suffix != '' || right.suffix != '') {
                code.appendFormat(", suffixes=('{0}', '{1}')", left.suffix, right.suffix);
            }

            code.append(')');

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

    return Merge
}); /* function, define */

/* End of file */