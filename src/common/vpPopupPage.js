define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpCommon'
    /** codemirror */
    , 'codemirror/lib/codemirror'
    , 'codemirror/mode/python/python'
    , 'notebook/js/codemirror-ipython'
    , 'codemirror/addon/display/placeholder'
    , 'codemirror/addon/display/autorefresh'
], function(requirejs, $, vpConst, sb, vpCommon, codemirror) {

    const VP_PP = 'vp-pp';
    const VP_PP_CONTAINER = 'vp-pp-container';
    const VP_PP_TITLE = 'vp-pp-title';
    const VP_PP_CLOSE = 'vp-pp-close';
    const VP_PP_BODY = 'vp-pp-body';

    const VP_PP_PREVIEW_BOX = 'vp-pp-preview-box';
    const VP_PP_BUTTON_BOX = 'vp-pp-btn-box';
    const VP_PP_BUTTON_PREVIEW = 'vp-pp-btn-preview';
    const VP_PP_BUTTON_CANCEL = 'vp-pp-btn-cancel';
    const VP_PP_BUTTON_RUNADD = 'vp-pp-btn-runadd';
    const VP_PP_BUTTON_RUN = 'vp-pp-btn-run';
    const VP_PP_BUTTON_DETAIL = 'vp-pp-btn-detail';
    const VP_PP_DETAIL_BOX = 'vp-pp-detail-box';
    const VP_PP_DETAIL_ITEM = 'vp-pp-detail-item';

    /**
     * @class PopupPage
     * @param {object} pageThis
     * @param {string} targetId
     * @constructor
     */
    var PopupPage = function(pageThis, targetId) {
        this.pageThis = pageThis;
        this.targetId = targetId;
        this.uuid = 'u' + vpCommon.getUUID();

        this.config = {
            title: '',
            width: '95%',
            height: '95%',
            pageDom: $('<div>Empty</div>')
        };

        this.cmReadonlyConfig = {
            mode: {
                name: 'python',
                version: 3,
                singleLineStringErrors: false
            },  // text-cell(markdown cell) set to 'htmlmixed'
            height: '100%',
            width: '100%',
            indentUnit: 4,
            matchBrackets: true,
            readOnly: true,
            autoRefresh: true,
            theme: "ipython",
            extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},
            scrollbarStyle: "null"
        };
        this.previewOpened = false;
    }

    PopupPage.prototype.wrapSelector = function(selector='') {
        return vpCommon.formatString('.{0} {1}', this.uuid, selector);
    }

    PopupPage.prototype.init = function() {
        vpCommon.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "common/popupPage.css");
        this.renderPopup();
        this.bindEvent();
    }

    PopupPage.prototype.renderPopup = function() {
        var { title, width, height, pageDom } = this.config;

        var page = new sb.StringBuilder();
        page.appendFormatLine('<div class="{0} {1}">', VP_PP, this.uuid);
        page.appendFormatLine('<div class="{0}" style="width: {1}; height: {2};">', VP_PP_CONTAINER, width, height);

         // title
         page.appendFormat('<div class="{0}">{1}</div>'
         , VP_PP_TITLE
         , title);

        // close button
        page.appendFormatLine('<div class="{0}"><img src="{1}"/></div>'
                        , VP_PP_CLOSE, '/nbextensions/visualpython/resource/close_big.svg');

        // body start
        page.appendFormatLine('<div class="{0} {1}">', VP_PP_BODY, 'vp-apiblock-scrollbar');
        page.appendLine('</div>');  // body end

        // Snippets menu don't use buttons
        if (title != 'Snippets') {
            
            // preview box
            page.appendFormatLine('<div class="{0} {1}">', VP_PP_PREVIEW_BOX, 'vp-apiblock-scrollbar');
            page.appendFormatLine('<textarea id="{0}" name="code"></textarea>', 'vp_codePreview');
            page.appendLine('</div>');

            // button box
            page.appendFormatLine('<div class="{0}">', VP_PP_BUTTON_BOX);
            page.appendFormatLine('<button type="button" class="{0} {1} {2}">{3}</button>'
                                    , 'vp-button', 'vp-pp-btn', VP_PP_BUTTON_PREVIEW, 'Code view');
            page.appendFormatLine('<button type="button" class="{0} {1} {2}">{3}</button>'
                                    , 'vp-button cancel', 'vp-pp-btn', VP_PP_BUTTON_CANCEL, 'Cancel');
            page.appendFormatLine('<div class="{0}">', VP_PP_BUTTON_RUNADD);
            page.appendFormatLine('<button type="button" class="{0} {1}" title="{2}">{3}</button>'
                                    , 'vp-button activated', VP_PP_BUTTON_RUN, 'Apply to Board & Run Cell', 'Run');
            page.appendFormatLine('<button type="button" class="{0} {1}"><img src="{2}"/></button>'
                                    , 'vp-button activated', VP_PP_BUTTON_DETAIL, '/nbextensions/visualpython/resource/arrow_short_up.svg');
            page.appendFormatLine('<div class="{0} {1}">', VP_PP_DETAIL_BOX, 'vp-cursor');
            page.appendFormatLine('<div class="{0}" data-type="{1}" title="{2}">{3}</div>', VP_PP_DETAIL_ITEM, 'apply', 'Apply to Board', 'Apply');
            page.appendFormatLine('<div class="{0}" data-type="{1}" title="{2}">{3}</div>', VP_PP_DETAIL_ITEM, 'add', 'Apply to Board & Add Cell', 'Add');
            page.appendLine('</div>'); // VP_PP_DETAIL_BOX
            page.appendLine('</div>'); // VP_PP_BUTTON_RUNADD
            page.appendLine('</div>'); // VP_PP_BUTTON_BOX
        }

        page.appendLine('</div>');  // container end
        page.appendLine('</div>');  // VP_PP end

        $('#vp-wrapper').append(page.toString());
        
        $(pageDom).appendTo($(this.wrapSelector('.' + VP_PP_BODY)));
        $(this.wrapSelector()).hide();
        
        return page.toString();
    }

    PopupPage.prototype.open = function(config) {
        this.config = {
            ...this.config,
            ...config
        };

        this.init();

        // load state
        if (this.config.state) {
            this.loadState(this.config.state);
        }

        $(this.wrapSelector()).show();

        if (!this.cmpreview) {
            // codemirror setting
            this.cmpreview = codemirror.fromTextArea($('#vp_codePreview')[0], this.cmReadonlyConfig);
        } else {
            this.cmpreview.refresh();
        }
    }

    PopupPage.prototype.close = function() {
        this.unbindEvent();
        $(this.wrapSelector()).remove();
    }

    PopupPage.prototype.apply = function(addCell=false, runCell=false) {
        if (this.pageThis) {
            var code = this.pageThis.generateCode(false, false);
            this.pageThis.metaGenerate();
            $(vpCommon.wrapSelector('#' + this.targetId)).val(code);
            $(vpCommon.wrapSelector('#' + this.targetId)).trigger({
                type: 'popup_run',
                title: this.config.title,
                code: code,
                state: this.pageThis.metadata,
                addCell: addCell,
                runCell: runCell
            });
        }
    }

    PopupPage.prototype.openPreview = function() {
        if (this.pageThis) {
            var code = this.pageThis.generateCode(false, false);
            this.cmpreview.setValue(code);
            this.cmpreview.save();
            this.cmpreview.focus();

            var that = this;
            setTimeout(function() {
                that.cmpreview.refresh();
            },1);

            this.previewOpened = true;
            $(this.wrapSelector('.' + VP_PP_PREVIEW_BOX)).show();
        }
    }

    PopupPage.prototype.closePreview = function() {
        this.previewOpened = false;
        $(this.wrapSelector('.' + VP_PP_PREVIEW_BOX)).hide();
    }

    PopupPage.prototype.loadState = function() {

    }

    PopupPage.prototype.bindEvent = function() {
        var that = this;

        // close popup
        $(document).on('click', this.wrapSelector('.' + VP_PP_CLOSE), function(event) {
            that.close();
        });

        // click preview
        $(document).on('click', this.wrapSelector('.' + VP_PP_BUTTON_PREVIEW), function(evt) {
            evt.stopPropagation();
            if (that.previewOpened) {
                that.closePreview();
            } else {
                that.openPreview();
            }
        });

        // click cancel
        $(document).on('click', this.wrapSelector('.' + VP_PP_BUTTON_CANCEL), function() {
            that.close();
        });

        // click run
        $(document).on('click', this.wrapSelector('.' + VP_PP_BUTTON_RUN), function() {
            that.apply(true, true);
            that.close();
        });

        // click detail button
        $(document).on('click', this.wrapSelector('.' + VP_PP_BUTTON_DETAIL), function(evt) {
            evt.stopPropagation();
            $(that.wrapSelector('.' + VP_PP_DETAIL_BOX)).show();
        });

        // click add / apply
        $(document).on('click', this.wrapSelector('.' + VP_PP_DETAIL_ITEM), function() {
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
            if (!$(evt.target).hasClass('.' + VP_PP_BUTTON_DETAIL)) {
                $(that.wrapSelector('.' + VP_PP_DETAIL_BOX)).hide();
            }
            if (!$(evt.target).hasClass('.' + VP_PP_BUTTON_PREVIEW)
                && $(that.wrapSelector('.' + VP_PP_PREVIEW_BOX)).has(evt.target).length === 0) {
                that.closePreview();
            }
        });

        this.keyboardManager = {
            keyCode : {
                ctrlKey: 17,
                cmdKey: 91,
                shiftKey: 16,
                altKey: 18,
                enter: 13,
                escKey: 27
            },
            keyCheck : {
                ctrlKey: false,
                shiftKey: false
            }
        }
        $(document).on('keydown.' + this.uuid, function(e) {
            var keyCode = that.keyboardManager.keyCode;
            if (e.keyCode == keyCode.ctrlKey || e.keyCode == keyCode.cmdKey) {
                that.keyboardManager.keyCheck.ctrlKey = true;
            } 
            if (e.keyCode == keyCode.shiftKey) {
                that.keyboardManager.keyCheck.shiftKey = true;
            }
        }).on('keyup.' + this.uuid, function(e) {
            var keyCode = that.keyboardManager.keyCode;
            if (e.keyCode == keyCode.ctrlKey || e.keyCode == keyCode.cmdKey) {
                that.keyboardManager.keyCheck.ctrlKey = false;
            } 
            if (e.keyCode == keyCode.shiftKey) {
                that.keyboardManager.keyCheck.shiftKey = false;
            }
            if (e.keyCode == keyCode.escKey) {
                // close on esc
                that.close();
            }
        });
    }

    PopupPage.prototype.unbindEvent = function() {
        $(document).unbind(vpCommon.formatString(".{0} .{1}", this.uuid, VP_PP_BODY));
        $(document).off('click', this.wrapSelector('.' + VP_PP_CLOSE));
        $(document).off('click', this.wrapSelector('.' + VP_PP_BUTTON_PREVIEW));
        $(document).off('click', this.wrapSelector('.' + VP_PP_BUTTON_CANCEL));
        $(document).off('click', this.wrapSelector('.' + VP_PP_BUTTON_RUN));
        $(document).off('click', this.wrapSelector('.' + VP_PP_BUTTON_DETAIL));
        $(document).off('click', this.wrapSelector('.' + VP_PP_DETAIL_ITEM));
        $(document).off('click.' + this.uuid);

        $(document).off('keydown.' + this.uuid);
        $(document).off('keyup.' + this.uuid);
    }

    PopupPage.prototype.generateCode = function() {
        return this.pageThis.generateCode(false, false);
    }


    return PopupPage;
});