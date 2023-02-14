/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Snippets.js
 *    Author          : Black Logic
 *    Note            : Apps > Snippets
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Snippets
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_apps/snippets.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_apps/snippets'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/FileNavigation',
    'vp_base/js/com/component/LoadingSpinner'
], function(snHtml, snCss, com_util, com_Const, com_String, PopupComponent, FileNavigation, LoadingSpinner) {

    /**
     * Snippets
     */
    class Snippets extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
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

            this.defaultSnippets = {
                'default import': [
                    'import numpy as np',
                    'import pandas as pd',
                    'import matplotlib.pyplot as plt',
                    '%matplotlib inline',
                    'import seaborn as sns',
                    'import plotly.express as px'
                ],
                'matplotlib customizing': [
                    'import matplotlib.pyplot as plt',
                    '%matplotlib inline',
                    '',
                    "plt.rc('figure', figsize=(12, 8))",
                    '',
                    'from matplotlib import rcParams',
                    "rcParams['font.family'] = 'New Gulim'",
                    "rcParams['font.size'] = 10",
                    "rcParams['axes.unicode_minus'] = False"
                ],
                'as_float': [
                    'def as_float(x):',
                    '    """',
                    "    usage: df['col'] = df['col'].apply(as_float)",
                    '    """',
                    '    if not isinstance(x, str):',
                    '        return 0.0',
                    '    else:',
                    '        try:',
                    '            result = float(x)',
                    '            return result',
                    '        except ValueError:',
                    '            return 0.0'
                ],
                'as_int': [
                    'def as_int(x):',
                    '    """',
                    "    usage: df['col'] = df['col'].apply(as_int)",
                    '    """',
                    '    if not isinstance(x, str):',
                    '        return 0',
                    '    else:',
                    '        try:',
                    '            result = int(x)',
                    '            return result',
                    '        except ValueError:',
                    '            return 0.0'
                ]
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;
            // menu popup
            $(this.wrapSelector('.vp-sn-menu')).on('click', function(evt) {
                evt.stopPropagation();
                $(that.wrapSelector('.vp-sn-menu-box')).toggle();
            });

            // sort menu popup
            $(this.wrapSelector('.vp-sn-sort')).on('click', function(evt) {
                evt.stopPropagation();
                $(that.wrapSelector('.vp-sn-sort-menu-box')).toggle();
            });

            // menu click 
            $(this.wrapSelector('.vp-sn-menu-item')).on('click', async function(evt) {
                var menu = $(this).data('menu');
                if (menu == 'import') {
                    let fileNavi = new FileNavigation({
                        type: 'open',
                        extensions: ['sn'],
                        finish: function(filesPath, status, error) {
                            // import sn file
                            filesPath.forEach(fileObj => {
                                var fileName = fileObj.file;
                                var selectedPath = fileObj.path;
                                fetch(selectedPath).then(function(file) {
                                    if (file.status != 200) {
                                        alert("The file format is not valid.");
                                        return;
                                    }
                            
                                    file.text().then(function(data) {
                                        var snippetData = JSON.parse(data);
                                        var timestamp = new Date().getTime();
    
                                        var keys = Object.keys(snippetData);
                                        var importKeys = [];
                                        keys.forEach(key => {
                                            var importKey = key;
                                            var importNo = 1;
                                            var titleList = Object.keys(that.codemirrorList);
                                            // set duplicate title
                                            while(titleList.includes(importKey)) {
                                                importKey = key + '_imported' + importNo;
                                                importNo += 1;
                                            }
                                            var newSnippet = { [importKey]: { code: snippetData[key], timestamp: timestamp } };
                                            vpConfig.setData(newSnippet);
    
                                            importKeys.push(importKey);
                                        });
                                        that.importedList = [ ...importKeys ];
    
                                        that.loadUdfList();
    
                                        com_util.renderSuccessMessage(fileName + ' imported ');
                                    });
                                });
                            });
                            
                        }
                    });
                    fileNavi.open();
                } else if (menu == 'export') {
                    // set as export mode
                    $(that.wrapSelector()).addClass('vp-sn-export-mode');

                    // check all
                    $(that.wrapSelector('.vp-sn-check-all')).prop('checked', true);
                    $(that.wrapSelector('.vp-sn-item-check')).prop('checked', true);
                } else if (menu == 'default-snippets') {
                    // import default snippets
                    let loadingSpinner = new LoadingSpinner($(that.wrapSelector('.vp-sn-table')));
                    var timestamp = new Date().getTime();
                    var keys = Object.keys(that.defaultSnippets);
                    var importKeys = [];
                    var newSnippet = {};
                    keys.forEach(key => {
                        var importKey = key;
                        var importNo = 1;
                        var titleList = Object.keys(that.codemirrorList);
                        // set duplicate title
                        while(titleList.includes(importKey)) {
                            importKey = key + '_imported' + importNo;
                            importNo += 1;
                        }
                        var code = that.defaultSnippets[key].join('\n');
                        newSnippet = { ...newSnippet, [importKey]: { code: code, timestamp: timestamp } };
                        importKeys.push(importKey);
                    });

                    vpConfig.setData(newSnippet).then(function() {
                        that.importedList = [ ...importKeys ];
                        that.loadUdfList();
                        com_util.renderSuccessMessage('Default snippets imported');
                    }).finally(function() {
                        loadingSpinner.remove();
                    });
                }
                $(that.wrapSelector('.vp-sn-menu-box')).hide();
                evt.stopPropagation();
            });

            // search item 
            $(this.wrapSelector('.vp-sn-search')).on('change', function(evt) {
                var value = $(this).val();
                if (value != '') {
                    $(that.wrapSelector('.vp-sn-item')).hide();
                    $(that.wrapSelector('.vp-sn-item')).filter(function() {
                        return $(this).data('title').search(value) >= 0;
                    }).show();
                } else {
                    $(that.wrapSelector('.vp-sn-item')).show();
                }
            });

            // sort item
            $(this.wrapSelector('.vp-sn-sort-menu-item')).on('click', function() {
                var menu = $(this).data('menu');
                if (menu == 'name') {
                    // sort by name
                    $(that.wrapSelector('.vp-sn-item')).sort(function(a, b) {
                        var titleA = $(a).data('title');
                        var titleB = $(b).data('title');
                        return titleA > titleB ? 1 : -1
                    }).appendTo($(that.wrapSelector('.vp-sn-table')))
                } else if (menu == 'date') {
                    // sort by date
                    $(that.wrapSelector('.vp-sn-item')).sort(function(a, b) {
                        var timeA = $(a).data('timestamp');
                        var timeB = $(b).data('timestamp');
                        return timeA < timeB ? 1 : -1
                    }).appendTo($(that.wrapSelector('.vp-sn-table')))
                }
            });

            // create item
            $(this.wrapSelector('.vp-sn-create')).on('click', function() {
                var titleList = Object.keys(that.codemirrorList);
                var newTitle = 'untitled' + that.title_no;
                while(titleList.includes(newTitle)) {
                    that.title_no += 1;
                    newTitle = 'untitled' + that.title_no;
                }

                var timestamp = new Date().getTime();
                var newItem = $(that.renderSnippetItem(newTitle, '', timestamp));
                $(that.wrapSelector('.vp-sn-table')).append(newItem);
                // bind snippet item
                that.bindSnippetItem();

                // save it
                var newSnippet = { [newTitle]: { code: '', timestamp: timestamp } };
                vpConfig.setData(newSnippet);

                var tag = $(that.wrapSelector('.vp-sn-item[data-title="' + newTitle + '"] textarea'));
                that.bindCodeMirror(newTitle, tag[0]);
                $(newItem).find('.vp-sn-indicator').trigger('click');

                that.title_no += 1;
            });
            

            //////////////// export mode ///////////////////////
            // check all
            $(this.wrapSelector('.vp-sn-check-all')).on('change', function() {
                var checked = $(this).prop('checked');
                $(that.wrapSelector('.vp-sn-item-check')).prop('checked', checked);
            });

            // export snippets
            $(this.wrapSelector('.vp-sn-export')).on('click', async function() {
                var menu = $(this).data('menu');
                if (menu == 'cancel') {
                    // cancel
                    // return to default mode
                    $(that.wrapSelector()).removeClass('vp-sn-export-mode');
                } else if (menu == 'export') {
                    var checked = $(that.wrapSelector('.vp-sn-item-check:checked'));
                    if (checked.length <= 0) {
                        return ;
                    }
        
                    let fileNavi = new FileNavigation({
                        type: 'save',
                        extensions: ['sn'],
                        finish: function(filesPath, status, error) {
                            let fileObj = filesPath[0];
                            var fileName = fileObj.file;
                            var selectedPath = fileObj.path;
            
                            // get checked snippets
                            var snippets = {};
                            $(that.wrapSelector('.vp-sn-item-check:checked')).each((idx, tag) => {
                                var title = $(tag).closest('.vp-sn-item').data('title');
                                var codemirror = that.codemirrorList[title];
                                codemirror.save();
                                var code = codemirror.getValue();
                                snippets[title] = code;
                            }); 
            
                            // make as file
                            var fileData = JSON.stringify(snippets);
                            vpKernel.saveFile(fileName, selectedPath, fileData);

                            // return to default mode
                            $(that.wrapSelector()).removeClass('vp-sn-export-mode');
                        }
                    });
                    fileNavi.open();
                }

            });
        }

        bindSnippetItem() {
            let that = this;
            // item header click (select item) &  double click (edit title)
            $(this.wrapSelector('.vp-sn-item-header')).off('click');
            $(this.wrapSelector('.vp-sn-item-header')).on('click', function(evt) {
                // stop propagation on checkbox
                if ($(evt.target).hasClass('vp-sn-item-check')) {
                    return;
                }

                var thisHeader = this;
                that.clicked++;
                if (that.clicked == 1) {
                    setTimeout(function(){
                        let selected = $(thisHeader).hasClass('selected');
                        if(selected || that.clicked > 1) {
                            // double click or clicked after selection
                            // enable input
                            $(thisHeader).find('.vp-sn-item-title').prop('disabled', false);
                            $(thisHeader).find('.vp-sn-item-title').select();
                            $(thisHeader).find('.vp-sn-item-title').focus();

                        } 
                        // single click
                        // select item
                        // remove selection
                        $(that.wrapSelector('.vp-sn-item-header')).removeClass('selected');
                        // select item
                        $(thisHeader).addClass('selected');
                        that.clicked = 0;
                    }, 200);
                }
                evt.stopPropagation();
            });

            // item indicator click (toggle item)
            $(this.wrapSelector('.vp-sn-indicator')).off('click');
            $(this.wrapSelector('.vp-sn-indicator')).on('click', function(evt) {
                // toggle item
                var parent = $(this).parent().parent();
                var indicator = $(this);
                var hasOpen = $(indicator).hasClass('open');
                // Deprecated: hide all codebox
                // $(that.wrapSelector('.vp-sn-indicator')).removeClass('open');
                // $(that.wrapSelector('.vp-sn-item-code')).hide();
                
                if (!hasOpen) {
                    // show code
                    $(indicator).addClass('open');
                    $(parent).find('.vp-sn-item-code').show();
                } else {
                    // hide code
                    $(indicator).removeClass('open');
                    $(parent).find('.vp-sn-item-code').hide();
                }
            });

            // prevent occuring header click event by clicking input
            $(this.wrapSelector('.vp-sn-item-title')).off('click');
            $(this.wrapSelector('.vp-sn-item-title')).on('click', function(evt) {
                evt.stopPropagation();
            });

            // item title save
            $(this.wrapSelector('.vp-sn-item-title')).off('blur');
            $(this.wrapSelector('.vp-sn-item-title')).on('blur', function(evt) {
                var prevTitle = $(this).closest('.vp-sn-item').data('title');
                var inputTitle = $(this).val();
                var $thisItem = $(this);

                if (prevTitle == inputTitle) {
                    ;
                } else {
                    // check duplicated
                    var titleList = Object.keys(that.codemirrorList);
                    var newTitle = inputTitle;
                    var dupNo = 0
                    while(titleList.includes(newTitle)) {
                        dupNo += 1;
                        newTitle = inputTitle + '_' + dupNo;
                    }

                    let cmCode = that.codemirrorList[prevTitle];
                    if (cmCode) {
                        cmCode.save();
                        var code = cmCode.getValue();
                        // Remove original title
                        vpConfig.removeData(prevTitle).then(function() {
                            // Save data with new title
                            // save udf
                            var newTimestamp = new Date().getTime();
                            var newSnippet = { [newTitle]: { code: code, timestamp: newTimestamp } };
                            vpConfig.setData(newSnippet);

                            // update title & codemirror
                            $thisItem.closest('.vp-sn-item-title').val(newTitle);
                            $thisItem.closest('.vp-sn-item').data('title', newTitle);
                            // update codemirror
                            that.codemirrorList[newTitle] = that.codemirrorList[prevTitle];
                            delete that.codemirrorList[prevTitle];
                        });
                    }
                }

                // disable
                $(this).prop('disabled', true);
            });

            // item menu click
            $(this.wrapSelector('.vp-sn-item-menu-item')).off('click');
            $(this.wrapSelector('.vp-sn-item-menu-item')).on('click', function(evt) {
                var menu = $(this).data('menu');
                var item = $(this).closest('.vp-sn-item');
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
                } else if (menu == 'duplicate') {
                    var dupNo = 1;
                    var timestamp = new Date().getTime();
                    var dupTitle = title + '_dup' + dupNo;
                    var titleList = Object.keys(that.codemirrorList);
                    // set duplicate title
                    while(titleList.includes(dupTitle)) {
                        dupNo += 1;
                        dupTitle = title + '_dup' + dupNo;
                    }

                    // add duplicated one
                    var code = that.codemirrorList[title].getValue();

                    var dupItem = $(that.renderSnippetItem(dupTitle, code, timestamp));
                    $(that.wrapSelector('.vp-sn-table')).append(dupItem);
                    // bind snippet item
                    that.bindSnippetItem();

                    // save it
                    var dupSnippet = { [dupTitle]: { code: code, timestamp: timestamp } };
                    vpConfig.setData(dupSnippet);

                    var tag = $(that.wrapSelector('.vp-sn-item[data-title="' + dupTitle + '"] textarea'));
                    that.bindCodeMirror(dupTitle, tag[0]);
                    $(dupItem).find('.vp-sn-indicator').trigger('click');

                } else if (menu == 'delete') {
                    let loadingSpinner = new LoadingSpinner($(that.wrapSelector('.vp-sn-table')));
                    // remove key
                    if (vpConfig.extensionType === 'lab') {
                        vpConfig.getData('').then(function(data) {
                            let dataObj = data;
                            // remove data
                            delete dataObj[title];
                            vpConfig._writeToLab(dataObj).then(function() {
                                delete that.codemirrorList[title];
                                // remove item
                                $(that.wrapSelector('.vp-sn-item[data-title="' + title + '"]')).remove();
        
                                // vp-multilang for success message
                                com_util.renderSuccessMessage('Successfully removed!');
                            }).catch(function(err) {
                                com_util.renderAlertModal('Failed to remove data...', err);
                                // load again
                                that.loadUdfList();
                            }).finally(function() {
                                loadingSpinner.remove();
                            });
                        }).catch(function(err) {

                        })
                    } else {
                        vpConfig.removeData(title).then(function() {
                            delete that.codemirrorList[title];
                            // remove item
                            $(that.wrapSelector('.vp-sn-item[data-title="' + title + '"]')).remove();
    
                            // vp-multilang for success message
                            com_util.renderSuccessMessage('Successfully removed!');
                        }).catch(function(err) {
                            com_util.renderAlertModal('Failed to remove data...', err);
                            // load again
                            that.loadUdfList();
                        }).finally(function() {
                            loadingSpinner.remove();
                        });
                    }
                    
                } else if (menu == 'save') {
                    if (!$(this).hasClass('vp-disable')) {
                        var codemirror = that.codemirrorList[title];
                        codemirror.save();
                        var code = codemirror.getValue();
                        
                        // save changed code
                        var timestamp = new Date().getTime();
                        var updateSnippet = { [title]: { code: code, timestamp: timestamp } };
                        vpConfig.setData(updateSnippet);
    
                        // disable it
                        $(this).addClass('vp-disable');
                    }
                }
                evt.stopPropagation();
            });

            // check items
            $(this.wrapSelector('.vp-sn-item-check')).off('change');
            $(this.wrapSelector('.vp-sn-item-check')).on('change', function() {
                var checked = $(this).prop('checked');
                // if unchecked at least one item, uncheck check-all
                if (!checked) {
                    $(that.wrapSelector('.vp-sn-check-all')).prop('checked', false);
                } else {
                    // if all checked, check check-all
                    var allLength = $(that.wrapSelector('.vp-sn-item-check')).length;
                    var checkedLength = $(that.wrapSelector('.vp-sn-item-check:checked')).length;
                    if (allLength == checkedLength) {
                        $(that.wrapSelector('.vp-sn-check-all')).prop('checked', true);
                    }
                }
            });
        }

        bindCodeMirror(title, selector) {
            let cmCode = this.initCodemirror({
                key: title,
                selector: selector,
                type: 'code',
                events: [{ 
                    key: 'change',
                    callback: function(evt, chgObj) {
                        if (chgObj.removed.join('') != '' || chgObj.text.join('') != '') {
                            // enable save button
                            $(selector).parent().find('.vp-sn-save').removeClass('vp-disable');
                        }
                    }
                }]
            });
            this.codemirrorList[title] = cmCode;
        }

        templateForBody() {
            return snHtml;
        }

        render() {
            super.render();

            // load udf list
            this.loadUdfList();
        }

        renderSnippetItem(title, code, timestamp, hasImported=false) {
            var item = new com_String();
            item.appendFormatLine('<div class="{0}" data-title="{1}" data-timestamp="{2}">', 'vp-sn-item', title, timestamp);
            item.appendFormatLine('<div class="{0}">', 'vp-sn-item-header');
            item.appendFormatLine('<div class="{0}"></div>', 'vp-sn-indicator');
            item.appendFormatLine('<input type="text" class="vp-input {0}" value="{1}" disabled/>', 'vp-sn-item-title', title);
            if (hasImported) {
                item.appendFormatLine('<i class="{0}"></i>', 'fa fa-circle vp-sn-imported-item');
            }
            item.appendFormatLine('<div class="{0}">', 'vp-sn-item-menu');
            // LAB: img to url
            item.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}">'
                                , 'vp-sn-item-menu-item vp-icon-run', 'run', 'Run');
            // item.appendFormatLine('<img src="{0}"/>', com_Const.IMAGE_PATH + 'snippets/run.svg');
            item.appendLine('</div>');
            // LAB: img to url
            item.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}">'
                                , 'vp-sn-item-menu-item vp-icon-duplicate', 'duplicate', 'Duplicate');
            // item.appendFormatLine('<img src="{0}"/>', com_Const.IMAGE_PATH + 'snippets/duplicate.svg');
            item.appendLine('</div>');
            // LAB: img to url
            item.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}">'
                                , 'vp-sn-item-menu-item vp-icon-delete', 'delete', 'Delete');
            // item.appendFormatLine('<img src="{0}"/>', com_Const.IMAGE_PATH + 'delete.svg');
            item.appendLine('</div>'); 
            item.appendLine('</div>'); // end of vp-sn-item-menu
            // export mode checkbox
            item.appendFormatLine('<input type="checkbox" class="{0} {1}"/>', 'vp-sn-checkbox', 'vp-sn-item-check');
            item.appendLine('</div>'); // end of vp-sn-item-header
            item.appendFormatLine('<div class="{0}">', 'vp-sn-item-code');
            item.appendFormatLine('<textarea>{0}</textarea>', code);
            // LAB: img to url
            item.appendFormatLine('<div class="{0} {1} vp-icon-save vp-disable" data-menu="{2}" title="{3}">', 'vp-sn-item-menu-item', 'vp-sn-save', 'save', 'Save changes');
            // item.appendFormatLine('<img src="{0}"/>', com_Const.IMAGE_PATH + 'snippets/save_orange.svg');
            item.appendLine('</div>'); // vp-sn-save
            item.appendLine('</div>'); // end of vp-sn-item-code
            item.appendLine('</div>'); // end of vp-sn-item
            return item.toString();
        }

        generateCode() {
            return '';
        }

        loadUdfList() {
            var that = this;

            // clear table except head
            $(this.wrapSelector('.vp-sn-table')).html('');

            // load udf list to table 'vp_udfList'
            let loadingSpinner = new LoadingSpinner($(this.wrapSelector('.vp-sn-table')));
            vpConfig.getData().then(function(udfObj) {
                vpLog.display(VP_LOG_TYPE.DEVELOP, udfObj);
                var snippets = new com_String();
                Object.keys(udfObj).forEach(key => {
                    let obj = udfObj[key];
                    if (obj.code != null && obj.code != undefined) {
    
                        var hasImported = false;
                        if (that.importedList.includes(key)) {
                            // set new label
                            hasImported = true;
                        }
                        var item = that.renderSnippetItem(key, obj.code, obj.timestamp, hasImported);
                        snippets.append(item);
                    }
                });
                $(that.wrapSelector('.vp-sn-table')).html(snippets.toString());

                // bind snippet item
                that.bindSnippetItem();
    
                // load codemirror
                var codeList = $(that.wrapSelector('.vp-sn-item-code textarea'));
                codeList.each((idx, tag) => {
                    var title = $(tag).closest('.vp-sn-item').data('title');
                    that.bindCodeMirror(title, tag);
                });
            }).catch(function(err) {
                com_util.renderAlertModal(err);
            }).finally(function() {
                loadingSpinner.remove();
            });
        }

    }

    return Snippets;
});