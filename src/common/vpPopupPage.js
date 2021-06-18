define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpCommon'
], function(requirejs, $, vpConst, sb, vpCommon) {

    // TEST: testing popuppage as an interface of every popup modules

    const VP_PP = 'vp-pp';
    const VP_PP_CONTAINER = 'vp-pp-container';
    const VP_PP_TITLE = 'vp-pp-title';
    const VP_PP_CLOSE = 'vp-pp-close';
    const VP_PP_BODY = 'vp-pp-body';
    const VP_PP_BUTTON_BOX = 'vp-pp-btn-box';
    const VP_PP_BUTTON_CANCEL = 'vp-pp-btn-cancel';
    const VP_PP_BUTTON_APPLY = 'vp-pp-btn-apply';

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
        page.appendFormatLine('<div class="{0}"><i class="{1}"></i></div>'
                        , VP_PP_CLOSE, 'fa fa-close');

        // body start
        page.appendFormatLine('<div class="{0}">', VP_PP_BODY);
        page.appendLine('</div>');  // body end

        // button box
        // Snippets menu don't use buttons
        if (title != 'Snippets') {
            page.appendFormatLine('<div class="{0}">', VP_PP_BUTTON_BOX);
            page.appendFormatLine('<button type="button" class="{0}">{1}</button>'
                                    , VP_PP_BUTTON_CANCEL, 'Cancel');
            page.appendFormatLine('<button type="button" class="{0}">{1}</button>'
                                    , VP_PP_BUTTON_APPLY, 'Apply');
            page.appendLine('</div>');
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
        $(this.wrapSelector()).show();
    }

    PopupPage.prototype.close = function() {
        this.unbindEvent();
        $(this.wrapSelector()).remove();
    }

    PopupPage.prototype.apply = function() {
        if (this.pageThis) {
            var code = this.pageThis.generateCode(false, false);
            $(vpCommon.wrapSelector('#' + this.targetId)).val(code);
            $(vpCommon.wrapSelector('#' + this.targetId)).trigger({
                type: 'popup_apply',
                title: this.config.title,
                code: code 
            });
        }
    }

    PopupPage.prototype.bindEvent = function() {
        var that = this;

        // close popup
        $(document).on('click', this.wrapSelector('.' + VP_PP_CLOSE), function(event) {
            that.close();
        });

        // click cancel
        $(document).on('click', this.wrapSelector('.' + VP_PP_BUTTON_CANCEL), function() {
            that.close();
        });

        // click apply
        $(document).on('click', this.wrapSelector('.' + VP_PP_BUTTON_APPLY), function() {
            that.apply();
            that.close();
        });
    }

    PopupPage.prototype.unbindEvent = function() {
        $(document).unbind(vpCommon.formatString(".{0} .{1}", this.uuid, VP_PP_BODY));
    }


    return PopupPage;
});