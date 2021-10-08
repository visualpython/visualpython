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
    'text!nbextensions/visualpython/css/common/popupPage.css',

    'codemirror/lib/codemirror',
    'codemirror/mode/python/python',
    'notebook/js/codemirror-ipython',
    'codemirror/addon/display/placeholder',
    'codemirror/addon/display/autorefresh'
], function (vpConst, sb, vpCommon, appCss, codemirror) {   

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

            if (this.config.state) {
                this.init(this.config.state);
            } else {
                this.init();
            }
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
        }

        render() {
            var page = new sb.StringBuilder();
            page.appendFormatLine('<div class="{0} {1}">', APP_PREFIX, this.uuid);
            page.appendFormatLine('<div class="{0} {1}">', APP_CONTAINER, 'vp-mg-container');

            // title
            page.appendFormat('<div class="{0}">{1}</div>',
                APP_TITLE, 'Merge');

            // close button
            page.appendFormatLine('<div class="{0}"><img src="{1}"/></div>',
                APP_CLOSE, '/nbextensions/visualpython/resource/close_big.svg');

            // body start
            page.appendFormatLine('<div class="{0}">', APP_BODY);
            // TODO: button

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

        unbindEvent() {
            $(document).unbind(vpCommon.formatString(".{0} .{1}", this.uuid, APP_BODY));
            $(document).off('click', this._wrapSelector('.' + APP_CLOSE));
            $(document).off('click', this._wrapSelector('.' + APP_BUTTON_PREVIEW));
            $(document).off('click', this._wrapSelector('.' + APP_BUTTON_CANCEL));
            $(document).off('click', this._wrapSelector('.' + APP_BUTTON_RUN));
            $(document).off('click', this._wrapSelector('.' + APP_BUTTON_DETAIL));
            $(document).off('click', this._wrapSelector('.' + APP_DETAIL_ITEM));
            $(document).off('click.' + this.uuid);
    
            $(document).off('keydown.' + this.uuid);
            $(document).off('keyup.' + this.uuid);
        }

        bindEvent() {
            var that = this;

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
            // TODO: generate code
            
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