/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : InnerFuncViewer.js
 *    Author          : Black Logic
 *    Note            : Component > InnerFuncViewer
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 06. 14
 *    Change Date     :
 */

//============================================================================
// [CLASS] InnerFuncViewer
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/component/innerFuncViewer.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/component/innerFuncViewer'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/FileNavigation'
], function(ifHtml, ifCss, com_util, com_Const, com_String, PopupComponent, FileNavigation) {

    /**
     * InnerFuncViewer
     */
    class InnerFuncViewer extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.name = 'Inner Function Viewer';
            this.config.codeview = false;
            this.config.dataview = false;
            this.config.runButton = false;
            this.config.sizeLevel = 3;

            this.state = {
                vp_userCode: '',
                ...this.state
            }

            this.codemirrorList = {};
            this.importedList = [];
            this.title_no = 0;
    
            // double click setter
            this.clicked = 0;
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;

            // search item 
            $(this.wrapSelector('.vp-if-search')).on('change', function(evt) {
                var value = $(this).val();
                if (value != '') {
                    $(that.wrapSelector('.vp-if-item')).hide();
                    $(that.wrapSelector('.vp-if-item')).filter(function() {
                        return $(this).data('title').search(value) >= 0;
                    }).show();
                } else {
                    $(that.wrapSelector('.vp-if-item')).show();
                }
            });
        }

        bindSnippetItem() {
            let that = this;
            // item header click (toggle item)
            $(this.wrapSelector('.vp-if-item-header')).off('click');
            $(this.wrapSelector('.vp-if-item-header')).on('click', function(evt) {
                // select item
                // remove selection
                $(that.wrapSelector('.vp-if-item-header')).removeClass('selected');
                // select item
                $(this).addClass('selected');

                // toggle item
                var parent = $(this).parent();
                var indicator = $(parent).find('.vp-if-indicator');
                var hasOpen = $(indicator).hasClass('open');
                
                if (!hasOpen) {
                    // show code
                    $(indicator).addClass('open');
                    $(parent).find('.vp-if-item-code').show();
                } else {
                    // hide code
                    $(indicator).removeClass('open');
                    $(parent).find('.vp-if-item-code').hide();
                }
                evt.stopPropagation();
            });

            // item menu click
            $(this.wrapSelector('.vp-if-item-menu-item')).off('click');
            $(this.wrapSelector('.vp-if-item-menu-item')).on('click', function(evt) {
                var menu = $(this).data('menu');
                var item = $(this).closest('.vp-if-item');
                var title = $(item).data('title');
                if (menu == 'run') {
                    // get codemirror
                    let cmCode = that.codemirrorList[title];
                    cmCode.save();
                    var code = cmCode.getValue();
                    // create block and run it
                    $('#vp_wrapper').trigger({
                        type: 'create_option_page', 
                        blockType: 'block',
                        menuId: 'lgExe_code',
                        menuState: { taskState: { code: code } },
                        afterAction: 'run'
                    });
                } 
                evt.stopPropagation();
            });
        }

        bindCodeMirror(title, selector) {
            let cmCode = this.initCodemirror({
                key: title,
                selector: selector,
                type: 'readonly',
                events: [{ 
                    key: 'change',
                    callback: function(evt, chgObj) {
                        if (chgObj.removed.join('') != '' || chgObj.text.join('') != '') {
                            // enable save button
                            $(selector).parent().find('.vp-if-save').removeClass('vp-disable');
                        }
                    }
                }]
            });
            this.codemirrorList[title] = cmCode;
        }

        templateForBody() {
            return ifHtml;
        }

        render() {
            super.render();

            // load udf list
            this.loadUserCommandList();
        }

        renderSnippetItem(title, code, description) {
            var item = new com_String();
            item.appendFormatLine('<div class="{0}" data-title="{1}">', 'vp-if-item', title, title);
            item.appendFormatLine('<div class="{0}" title="{1}">', 'vp-if-item-header', description);
            item.appendFormatLine('<div class="{0}"></div>', 'vp-if-indicator');
            item.appendFormatLine('<input type="text" class="vp-input {0}" value="{1}" disabled/>', 'vp-if-item-title', title);
            item.appendFormatLine('<div class="{0}">', 'vp-if-item-menu');
            // LAB: img to url
            // item.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}">'
            item.appendFormatLine('<div class="{0} vp-icon-run" data-menu="{1}" title="{2}">'
                                , 'vp-if-item-menu-item', 'run', 'Run');
            // item.appendFormatLine('<img src="{0}"/>', com_Const.IMAGE_PATH + 'snippets/run.svg');
            item.appendLine('</div>');
            item.appendLine('</div>'); // end of vp-if-item-menu
            item.appendLine('</div>'); // end of vp-if-item-header
            item.appendFormatLine('<div class="{0}">', 'vp-if-item-code');
            item.appendFormatLine('<textarea>{0}</textarea>', code);
            item.appendLine('</div>'); // end of vp-if-item-code
            item.appendLine('</div>'); // end of vp-if-item
            return item.toString();
        }

        generateCode() {
            return '';
        }

        loadUserCommandList() {
            var that = this;

            let funcDict = vpConfig.getModuleCode();
            funcDict = Object.fromEntries(Object.entries(funcDict).filter(([key]) => funcDict[key].type == 'function'));

            // clear table except head
            $(this.wrapSelector('.vp-if-table')).html('');

            // load code list
            var innerFuncCode = new com_String();
            Object.keys(funcDict).forEach(key => {
                let obj = funcDict[key];
                if (obj.code != null && obj.code != undefined) {
                    var item = that.renderSnippetItem(key, obj.code, obj.description);
                    innerFuncCode.append(item);
                }
            });
            $(that.wrapSelector('.vp-if-table')).html(innerFuncCode.toString());

            // bind snippet item
            that.bindSnippetItem();

            // load codemirror
            var codeList = $(that.wrapSelector('.vp-if-item-code textarea'));
            codeList.each((idx, tag) => {
                var title = $(tag).closest('.vp-if-item').data('title');
                that.bindCodeMirror(title, tag);
            });
        }

    }

    return InnerFuncViewer;
});