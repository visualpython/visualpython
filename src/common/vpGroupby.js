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

            this.methodList = [
                { label: 'sum', value: 'sum'},
                { label: 'mean', value: 'mean'},
                { label: 'min', value: 'min'},
                { label: 'max', value: 'max'},
                { label: 'std', value: 'std'},
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
                variable, groupby, columns, method, advanced, allocateTo, resetIndex
            } = state;

            console.log(state);

            $(this._wrapSelector('#vp_gbVariable')).val(variable);
            $(this._wrapSelector('#vp_gbBy')).val(groupby.join(','));
            $(this._wrapSelector('#vp_gbColumn')).val(columns.join(','));
            $(this._wrapSelector('#vp_gbMethod')).val(method);
            $(this._wrapSelector('#vp_gbMethodSelector')).val(method);
            $(this._wrapSelector('#vp_gbAdvanced')).prop('checked', advanced);
            if (advanced) {
                $(this._wrapSelector('#vp_gbAdvanced')).trigger('change');
            }
            $(this._wrapSelector('#vp_gbAllocateTo')).val(allocateTo);
            $(this._wrapSelector('#vp_gbResetIndex')).prop('checked', resetIndex);
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
                variable: '',
                groupby: [],
                columns: [],
                method: 'sum',
                advanced: false,
                allocateTo: '',
                resetIndex: false
            };
            this.popup = {
                type: '',
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
            page.appendFormatLine('<input type="text" id="{0}"/>', 'vp_gbBy');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_gbBySelect', 'vp-button wp50', 'Edit');
            page.appendLine('</div>');
            page.appendLine('<hr style="margin: 10px 0;"/>');
            // display column
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_gbColumn', 'wp80', 'Columns');
            page.appendFormatLine('<input type="text" id="{0}">', 'vp_gbColumn');
            page.appendFormatLine('<button id="{0}" class="{1}">{2}</button>', 'vp_gbColumnSelect', 'vp-button wp50', 'Edit');
            page.appendLine('</div>');
            // method
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_gbMethodSelect', 'wp80', 'Method');
            page.appendFormatLine('<select id="{0}">', 'vp_gbMethodSelect');
            this.methodList.forEach(method => {
                page.appendFormatLine('<option value="{0}">{1}</option>', method.value, method.label);
            });
            page.appendLine('</select>');
            page.appendFormatLine('<input type="text" id="{0}" class="{1}" disabled style="display: none;"/>', 'vp_gbMethod', 'vp-gb-method');
            page.appendFormatLine('<label><input type="checkbox" id="{0}"/><span>{1}</span></label>', 'vp_gbAdvanced', 'Advanced');
            page.appendLine('</div>');
            
            // Advanced box
            page.appendFormatLine('<div class="{0}" style="display: none;">', 'vp-gb-adv-box');

            page.appendLine('</div>'); // end of adv-box

            page.appendLine('<hr style="margin: 10px 0;"/>');
            // Allocate to
            page.appendLine('<div>');
            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_gbAllocateTo', 'wp80', 'Allocate to');
            page.appendFormatLine('<input type="text" id="{0}" placeholder="{1}"/>', 'vp_gbAllocateTo', 'New variable name');
            page.appendFormatLine('<label><input type="checkbox" id="{0}"/><span>{1}</span></label>', 'vp_gbResetIndex', 'Reset index');
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

        renderColumnSelector(previousList) {
            this.popup.ColSelector = new vpColumnSelector(this._wrapSelector('.' + APP_POPUP_BODY), this.state.variable, previousList);
        }
        
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

        openInnerPopup(type) {
            var title = '';
            this.popup.type = type;
    
            switch (type) {
                case 'groupby':
                    title = 'Select columns to group';
                    this.renderColumnSelector(this.state.groupby);
                    break;
                case 'column':
                    title = 'Select columns to display';
                    this.renderColumnSelector(this.state.columns);
                    break;
            }
    
            // set title
            $(this._wrapSelector('.' + APP_POPUP_BOX + ' .' + APP_TITLE)).text(title);
    
            // show popup box
            $(this._wrapSelector('.' + APP_POPUP_BOX)).show();
        }

        closeInnerPopup() {
            $(this._wrapSelector('.' + APP_POPUP_BOX)).hide();
        }

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

        unbindEvent() {
            $(document).unbind(vpCommon.formatString(".{0} .{1}", this.uuid, APP_BODY));

            // user operation event
            $(document).off('change', this._wrapSelector('#vp_gbVariable'));
            $(document).off('click', this._wrapSelector('#vp_gbBySelect'));
            $(document).off('click', this._wrapSelector('#vp_gbColumnSelect'));
            $(document).off('change', this._wrapSelector('#vp_gbMethodSelect'));
            $(document).off('change', this._wrapSelector('#vp_gbAdvanced'));
            $(document).off('change', this._wrapSelector('#vp_gbAllocateTo'));
            $(document).off('change', this._wrapSelector('#vp_gbResetIndex'));

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
            $(document).on('change', this._wrapSelector('#vp_gbVariable'), function() {
                // if variable changed, clear groupby, columns
                var newVal = $(this).val();
                if (newVal != that.state.variable) {
                    $(that._wrapSelector('#vp_gbBy')).val('');
                    $(that._wrapSelector('#vp_gbColumn')).val('');
                    that.state.variable = newVal;
                }
            });

            // variable refresh event
            $(document).on('click', this._wrapSelector('.vp-gb-df-refresh'), function() {
                that.loadVariableList();
            });

            // groupby select button event
            $(document).on('click', this._wrapSelector('#vp_gbBySelect'), function() {
                // TODO: open popup
                that.openInnerPopup('groupby');
            });

            // columns select button event
            $(document).on('click', this._wrapSelector('#vp_gbColumnSelect'), function() {
                // TODO: open popup
                that.openInnerPopup('column');
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
                that.state.resetIndex = $(this).prop('checked');
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
                if (!$(evt.target).hasClass('.' + APP_BUTTON_DETAIL)) {
                    $(that._wrapSelector('.' + APP_DETAIL_BOX)).hide();
                }
                if (!$(evt.target).hasClass('.' + APP_BUTTON_PREVIEW)
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
                var type = that.popup.type;
                var colList = that.popup.ColSelector.getColumnList();
                switch (type) {
                    case 'groupby':
                        that.state.groupby = colList;
                        $(that._wrapSelector('#vp_gbBy')).val(colList.join(','));
                        break;
                    case 'column':
                        that.state.columns = colList;
                        $(that._wrapSelector('#vp_gbColumn')).val(colList.join(','));
                }
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
                variable, groupby, columns, method, advanced, allocateTo, resetIndex 
            } = this.state;
            if (allocateTo && allocateTo != '') {
                code.appendFormat('{0} = ', allocateTo);
            }
            var byStr = '';
            if (groupby.length <= 1) {
                byStr = groupby.join('');
            } else {
                byStr = '[' + groupby.join(',') + ']';
            }

            var optStr = '';
            if (resetIndex == true) {
                optStr = ', as_index=False';
            }
            // variable & groupby columns & option
            code.appendFormat('{0}.groupby({1}{2})', variable, byStr, optStr);

            var colStr = '';
            if (columns.length == 1) {
                // for 1 column
                colStr = '[' + columns.join('') + ']';
            } else if (columns.length > 1) {
                // over 2 columns
                colStr = '[[' + columns.join(',') + ']]';
            }

            var methodStr = '';
            if (advanced) {
                // aggregation
                methodStr = 'agg(';

                methodStr += ')';
            } else {
                methodStr = method + '()';
            }
            // display columns
            code.appendFormat('{0}.{1}', colStr, methodStr);

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