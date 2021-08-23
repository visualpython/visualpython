define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/common/vpSetting'
    // file navigation
    , 'nbextensions/visualpython/src/pandas/fileNavigation/index'

    // CodeMirror
    , 'codemirror/lib/codemirror'
    , 'codemirror/mode/python/python'
    , 'notebook/js/codemirror-ipython'
    , 'codemirror/addon/display/placeholder'
    , 'codemirror/addon/display/autorefresh'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, vpSetting
            , fileNavigation
            , CodeMirror, cmpython, cmip) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "User-defined Code"
        , funcID : "com_udf"
    }

    /**
     * html load 콜백. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var optionLoadCallback = function(callback, meta) {
        // document.getElementsByTagName("head")[0].appendChild(link);
        // 컨테이너에서 전달된 callback 함수가 존재하면 실행.
        if (typeof(callback) === 'function') {
            var uuid = 'u' + vpCommon.getUUID();
            // 최대 10회 중복되지 않도록 체크
            for (var idx = 0; idx < 10; idx++) {
                // 이미 사용중인 uuid 인 경우 다시 생성
                if ($(vpConst.VP_CONTAINER_ID).find("." + uuid).length > 0) {
                    uuid = 'u' + vpCommon.getUUID();
                }
            }
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM))).find(vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE)).addClass(uuid);
            // 옵션 객체 생성
            var optionPackage = new OptionPackage(uuid);
            optionPackage.metadata = meta;
            // 옵션 속성 할당.
            optionPackage.setOptionProp(funcOptProp);
            // html 설정.
            optionPackage.initHtml();
            callback(optionPackage);  // 공통 객체를 callback 인자로 전달

            // after load cell metadata, set codemirror value
            // optionPackage.vp_userCode.setValue($(vpCommon.wrapSelector('#vp_userCode')).val());
            // optionPackage.bindCodeMirror();
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "file_io/udf.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var OptionPackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        this.package = {
            input: [
                { name: 'vp_userCode' }
            ]
        }

        this.codemirrorList = {};
        this.importedList = [];
        this.title_no = 0;

        // double click setter
        this.clicked = 0;

        // file navigation : state 데이터 목록
        this.state = {
            paramData:{
                encoding: "utf-8" // 인코딩
                , delimiter: ","  // 구분자
            },
            returnVariable:"",    // 반환값
            isReturnVariable: false,
            fileExtension: ["sn"] // 확장자
        };
        this.fileResultState = {
            pathInputId : this.wrapSelector('.vp-sn-filepath'),
            fileInputId : this.wrapSelector('.vp-sn-filename')
        };
    }

    /**
     * vpFuncJS 에서 상속
     */
    OptionPackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    OptionPackage.prototype.optionValidation = function() {
        return true;

        // 부모 클래스 유효성 검사 호출.
        // vpFuncJS.VpFuncJS.prototype.optionValidation.apply(this);
    }


    /**
     * html 내부 binding 처리
     */
    OptionPackage.prototype.initHtml = function() {
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "file_io/udf.css");

        this.bindEvent();
        
        // bind values after loading html
        this.package.input && this.package.input.forEach(obj => {
            if (obj.value != undefined) {
                var tag = $(this.wrapSelector('#' + obj.name));
                tag.val(obj.value);
            }
        });

        // load udf list
        this.loadUdfList();
    }

    OptionPackage.prototype.bindEvent = function() {
        var that = this;

        // toggle item codebox 
        // $(document).on('click', this.wrapSelector('.vp-sn-item-header .vp-sn-indicator'), function() {
        //     var parent = $(this).parent();
        //     var hasOpen = $(this).hasClass('open');
        //     // hide all codebox
        //     $(that.wrapSelector('.vp-sn-indicator')).removeClass('open');
        //     $(that.wrapSelector('.vp-sn-item-code')).hide();
            
        //     if (!hasOpen) {
        //         // show code
        //         $(this).addClass('open');
        //         $(parent).parent().find('.vp-sn-item-code').show();
        //     } else {
        //         // hide code
        //         $(parent).parent().find('.vp-sn-item-code').hide();
        //     }
        // });

        // menu popup
        $(document).on('click', this.wrapSelector('.vp-sn-menu'), function(evt) {
            evt.stopPropagation();
            $(that.wrapSelector('.vp-sn-menu-box')).toggle();
        });

        // sort menu popup
        $(document).on('click', this.wrapSelector('.vp-sn-sort'), function(evt) {
            evt.stopPropagation();
            $(that.wrapSelector('.vp-sn-sort-menu-box')).toggle();
        });

        // menu click 
        $(document).on('click', this.wrapSelector('.vp-sn-menu-item'), async function(evt) {
            var menu = $(this).data('menu');
            if (menu == 'import') {
                var loadURLstyle = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH;
                var loadURLhtml = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/fileNavigation/index.html";
                
                that.loadCss( loadURLstyle + "component/fileNavigation.css");
        
                await $(`<div id="vp_fileNavigation"></div>`)
                .load(loadURLhtml, () => {

                    $('#vp_fileNavigation').removeClass("hide");
                    $('#vp_fileNavigation').addClass("show");

                    var { vp_init
                            , vp_bindEventFunctions } = fileNavigation;
                        
                    fileNavigation.vp_init(that, "READ_SNIPPETS");
                    // fileNavigation.vp_init(that.getStateAll());
                    fileNavigation.vp_bindEventFunctions();
                })
                .appendTo("#site");
            } else if (menu == 'export') {
                // set as export mode
                $(that.wrapSelector('.vp-sn-body')).addClass('vp-sn-export-mode');

                // check all
                $(that.wrapSelector('.vp-sn-check-all')).prop('checked', true);
                $(that.wrapSelector('.vp-sn-item-check')).prop('checked', true);
            } else if (menu == 'default-snippets') {
                // import default snippets
                var defaultSnippets = {
                    'default import': 'import numpy as np\nimport pandas as pd\nimport matplotlib.pyplot as plt\n%matplotlib inline\nimport seaborn as sns'
                }
                var timestamp = new Date().getTime();

                var keys = Object.keys(defaultSnippets);
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
                    var newSnippet = { [importKey]: { code: defaultSnippets[key], timestamp: timestamp } };
                    vpSetting.saveUserDefinedCode(newSnippet);

                    importKeys.push(importKey);
                });
                that.importedList = [ ...importKeys ];

                that.loadUdfList();

                vpCommon.renderSuccessMessage('Default snippets imported');
            }
            evt.stopPropagation();
        });

        // search item 
        $(document).on('change', this.wrapSelector('.vp-sn-search'), function(evt) {
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
        $(document).on('click', this.wrapSelector('.vp-sn-sort-menu-item'), function() {
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
        $(document).on('click', this.wrapSelector('.vp-sn-create'), function() {
            var titleList = Object.keys(that.codemirrorList);
            var newTitle = 'untitled' + that.title_no;
            while(titleList.includes(newTitle)) {
                that.title_no += 1;
                newTitle = 'untitled' + that.title_no;
            }

            var timestamp = new Date().getTime();
            var newItem = $(that.renderSnippetItem(newTitle, '', timestamp));
            $(that.wrapSelector('.vp-sn-table')).append(newItem);

            // save it
            var newSnippet = { [newTitle]: { code: '', timestamp: timestamp } };
            vpSetting.saveUserDefinedCode(newSnippet);

            var tag = $(that.wrapSelector('.vp-sn-item[data-title="' + newTitle + '"] textarea'));
            that.bindCodeMirror(newTitle, tag[0]);
            $(newItem).find('.vp-sn-indicator').trigger('click');

            that.title_no += 1;
        });

        // item header click (toggle & select item) &  double click (edit title)
        $(document).on('click', this.wrapSelector('.vp-sn-item-header'), function(evt) {
            console.log('header click ' + that.clicked);
            var thisHeader = this;
            that.clicked++;
            if (that.clicked == 1) {
                setTimeout(function(){
                    if(that.clicked > 1) {
                        // double click
                        // enable input
                        $(thisHeader).find('.vp-sn-item-title').prop('disabled', false);
                        $(thisHeader).find('.vp-sn-item-title').focus();

                    } 
                    // single click
                    // select item
                    // remove selection
                    $(that.wrapSelector('.vp-sn-item-header')).removeClass('selected');
                    // select item
                    $(thisHeader).addClass('selected');

                    // toggle item
                    var parent = $(thisHeader).parent();
                    var indicator = $(thisHeader).find('.vp-sn-indicator');
                    var hasOpen = $(indicator).hasClass('open');
                    // Deprecated: hide all codebox
                    // $(that.wrapSelector('.vp-sn-indicator')).removeClass('open');
                    // $(that.wrapSelector('.vp-sn-item-code')).hide();
                    
                    if (that.clicked > 1 || !hasOpen) {
                        // show code
                        $(indicator).addClass('open');
                        $(parent).find('.vp-sn-item-code').show();
                    } else {
                        // hide code
                        $(indicator).removeClass('open');
                        $(parent).find('.vp-sn-item-code').hide();
                    }
                    that.clicked = 0;
                }, 200);
            }
            evt.stopPropagation();
        });

        // prevent occuring header click event by clicking input
        $(document).on('click', this.wrapSelector('.vp-sn-item-title'), function(evt) {
            evt.stopPropagation();
        });

        // item title save
        $(document).on('blur', this.wrapSelector('.vp-sn-item-title'), function(evt) {
            var prevTitle = $(this).closest('.vp-sn-item').data('title');
            var inputTitle = $(this).val();

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
    
                that.codemirrorList[prevTitle].save();
                var code = that.codemirrorList[prevTitle].getValue();
                // 기존 title 제거
                vpSetting.removeUserDefinedCode(prevTitle);
                
                // 새 title로 저장
                // save udf
                var newTimestamp = new Date().getTime();
                var newSnippet = { [newTitle]: { code: code, timestamp: newTimestamp } };
                vpSetting.saveUserDefinedCode(newSnippet);
    
                // update title & codemirror
                $(this).closest('.vp-sn-item-title').val(newTitle);
                $(this).closest('.vp-sn-item').data('title', newTitle);
                // update codemirror
                that.codemirrorList[newTitle] = that.codemirrorList[prevTitle];
                delete that.codemirrorList[prevTitle];
            }

            // disable
            $(this).prop('disabled', true);
        });

        // item menu click
        $(document).on('click', this.wrapSelector('.vp-sn-item-menu-item'), function(evt) {
            var menu = $(this).data('menu');
            var item = $(this).closest('.vp-sn-item');
            var title = $(item).data('title');
            if (menu == 'run') {
                // get codemirror
                that.codemirrorList[title].save();
                var code = that.codemirrorList[title].getValue();
                $(vpCommon.wrapSelector('#vp_appsCode')).val(code);
                $(vpCommon.wrapSelector('#vp_appsCode')).trigger({
                    type: 'popup_run',
                    title: 'Snippets',
                    code: code,
                    addCell: true,
                    runCell: true
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

                // save it
                var dupSnippet = { [dupTitle]: { code: code, timestamp: timestamp } };
                vpSetting.saveUserDefinedCode(dupSnippet);

                var tag = $(that.wrapSelector('.vp-sn-item[data-title="' + dupTitle + '"] textarea'));
                that.bindCodeMirror(dupTitle, tag[0]);
                $(dupItem).find('.vp-sn-indicator').trigger('click');

            } else if (menu == 'delete') {
                if (title && vpSetting.getUserDefinedCode(title)) {
                    // remove key
                    vpSetting.removeUserDefinedCode(title);
                    delete that.codemirrorList[title];
                    // remove item
                    $(that.wrapSelector('.vp-sn-item[data-title="' + title + '"]')).remove();

                    // vp-multilang for success message
                    vpCommon.renderSuccessMessage('Successfully removed!');
                } else {
                    vpCommon.renderAlertModal('No key available...');
                    // load again
                    that.loadUdfList();
                }
                
            } else if (menu == 'save') {
                var codemirror = that.codemirrorList[title];
                codemirror.save();
                var code = codemirror.getValue();
                
                // save changed code
                var timestamp = new Date().getTime();
                var updateSnippet = { [title]: { code: code, timestamp: timestamp } };
                vpSetting.saveUserDefinedCode(updateSnippet);

                // hide it
                $(this).hide();
            }
            evt.stopPropagation();
        });

        //////////////// export mode ///////////////////////
        // check all
        $(document).on('change', this.wrapSelector('.vp-sn-check-all'), function() {
            var checked = $(this).prop('checked');
            $(that.wrapSelector('.vp-sn-item-check')).prop('checked', checked);
        });

        // check items
        $(document).on('change', this.wrapSelector('.vp-sn-item-check'), function() {
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

        // export snippets
        $(document).on('click', this.wrapSelector('.vp-sn-export'), async function() {
            var menu = $(this).data('menu');
            if (menu == 'cancel') {
                // cancel
                // return to default mode
                $(that.wrapSelector('.vp-sn-body')).removeClass('vp-sn-export-mode');
            } else if (menu == 'export') {
                var checked = $(that.wrapSelector('.vp-sn-item-check:checked'));
                if (checked.length <= 0) {
                    return ;
                }
    
                var loadURLstyle = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH;
                var loadURLhtml = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/fileNavigation/index.html";
                
                that.loadCss( loadURLstyle + "component/fileNavigation.css");
        
                await $(`<div id="vp_fileNavigation"></div>`)
                .load(loadURLhtml, () => {
    
                    $('#vp_fileNavigation').removeClass("hide");
                    $('#vp_fileNavigation').addClass("show");
    
                    var { vp_init
                            , vp_bindEventFunctions } = fileNavigation;
                        
                    fileNavigation.vp_init(that, "SAVE_SNIPPETS");
                    // fileNavigation.vp_init(that.getStateAll());
                    fileNavigation.vp_bindEventFunctions();
                })
                .appendTo("#site");
            }

        });

        // export complete event
        $(document).on('snippetSaved.fileNavigation', this.wrapSelector('.vp-sn-filepath'), function(evt) {
            var fileName = evt.file;
            var selectedPath = $(this).val();

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
            var file = JSON.stringify(snippets);

            var cmd = new sb.StringBuilder();
            cmd.appendFormatLine('%%writefile "{0}"', selectedPath);
            cmd.append(file);
            Jupyter.notebook.kernel.execute(cmd.toString());
            
            vpCommon.renderSuccessMessage(fileName + ' exported ');

            // return to default mode
            $(that.wrapSelector('.vp-sn-body')).removeClass('vp-sn-export-mode');
        });

        // import complete event
        $(document).on('snippetRead.fileNavigation', this.wrapSelector('.vp-sn-filepath'), function(evt) {
            var selectedPath = $(this).val();
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
                        vpSetting.saveUserDefinedCode(newSnippet);

                        importKeys.push(importKey);
                    });
                    that.importedList = [ ...importKeys ];

                    that.loadUdfList();

                    vpCommon.renderSuccessMessage(fileName + ' imported ');
                });
            });
        });
        
    }

    OptionPackage.prototype.renderSnippetItem = function(title, code, timestamp, hasImported=false) {
        var item = new sb.StringBuilder();
        item.appendFormatLine('<div class="{0}" data-title="{1}" data-timestamp="{2}">', 'vp-sn-item', title, timestamp);
        item.appendFormatLine('<div class="{0}">', 'vp-sn-item-header');
        item.appendFormatLine('<div class="{0}"></div>', 'vp-sn-indicator');
        item.appendFormatLine('<input type="text" class="{0}" value="{1}" disabled/>', 'vp-sn-item-title', title);
        if (hasImported) {
            item.appendFormatLine('<i class="{0}"></i>', 'fa fa-circle vp-sn-imported-item');
        }
        item.appendFormatLine('<div class="{0}">', 'vp-sn-item-menu');
        item.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}">'
                            , 'vp-sn-item-menu-item', 'run', 'Run');
        item.appendFormatLine('<img src="{0}"/>', '/nbextensions/visualpython/resource/snippets/run.svg');
        item.appendLine('</div>');
        item.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}">'
                            , 'vp-sn-item-menu-item', 'duplicate', 'Duplicate');
        item.appendFormatLine('<img src="{0}"/>', '/nbextensions/visualpython/resource/snippets/duplicate.svg');
        item.appendLine('</div>');
        item.appendFormatLine('<div class="{0}" data-menu="{1}" title="{2}">'
                            , 'vp-sn-item-menu-item', 'delete', 'Delete');
        item.appendFormatLine('<img src="{0}"/>', '/nbextensions/visualpython/resource/delete.svg');
        item.appendLine('</div>'); 
        item.appendLine('</div>'); // end of vp-sn-item-menu
        // export mode checkbox
        item.appendFormatLine('<input type="checkbox" class="{0} {1}"/>', 'vp-sn-checkbox', 'vp-sn-item-check');
        item.appendLine('</div>'); // end of vp-sn-item-header
        item.appendFormatLine('<div class="{0}">', 'vp-sn-item-code');
        item.appendFormatLine('<textarea>{0}</textarea>', code);
        item.appendFormatLine('<div class="{0} {1}" data-menu="{2}" title="{3}">', 'vp-sn-item-menu-item', 'vp-sn-save', 'save', 'Save changes');
        item.appendFormatLine('<img src="{0}"/>', '/nbextensions/visualpython/resource/snippets/save_orange.svg');
        // item.appendFormatLine('<object class="{0}" type="image/svg+xml" data="{1}" width="20" height="20"></object>', 'vp-sn-saveimg', '/nbextensions/visualpython/resource/snippets/save_gray2.svg');
        item.appendLine('</div>'); // vp-sn-save
        item.appendLine('</div>'); // end of vp-sn-item-code
        item.appendLine('</div>'); // end of vp-sn-item
        return item.toString();
    }

    OptionPackage.prototype.loadUdfList = function() {
        var that = this;

        // clear table except head
        $(this.wrapSelector('.vp-sn-table')).html('');

        // load udf list to table 'vp_udfList'
        vpSetting.loadUserDefinedCodeList(function(udfList) {
            var snippets = new sb.StringBuilder();
            udfList.forEach(obj => {
                if (obj.code != null && obj.code != undefined) {

                    var hasImported = false;
                    if (that.importedList.includes(obj.name)) {
                        // set new label
                        hasImported = true;
                    }
                    var item = that.renderSnippetItem(obj.name, obj.code.code, obj.code.timestamp, hasImported);
                    snippets.append(item);
                }
            });
            $(that.wrapSelector('.vp-sn-table')).html(snippets.toString());

            // load codemirror
            var codeList = $(that.wrapSelector('.vp-sn-item-code textarea'));
            codeList.each((idx, tag) => {
                var title = $(tag).closest('.vp-sn-item').data('title');
                that.bindCodeMirror(title, tag);
            });
        });

        

    }

    OptionPackage.prototype.bindCodeMirror = function(title, tag) {
        var codemirrorConfig = {
            mode: {
                name: 'python',
                version: 3,
                singleLineStringErrors: false
            },  // text-cell(markdown cell) set to 'htmlmixed'
            indentUnit: 4,
            matchBrackets: true,
            lineNumbers: true,
            autoRefresh: true,
            lineWrapping: true, // text-cell(markdown cell) set to true
            theme: "default",
            extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
        };

        var prevValue = $(tag).val();
        var codemirror = CodeMirror.fromTextArea(tag, codemirrorConfig);
        codemirror.setValue(prevValue);
        this.codemirrorList[title] = codemirror;

        // bind code change
        // item code save
        codemirror.on('change', function() {
            // var title = $(tag).closest('.vp-sn-item').data('title');
            // codemirror.save();
            // var code = codemirror.getValue();
            
            // // save changed code
            // var timestamp = new Date().getTime();
            // var updateSnippet = { [title]: { code: code, timestamp: timestamp } };
            // vpSetting.saveUserDefinedCode(updateSnippet);

            // show save button
            $(tag).parent().find('.vp-sn-save').show();
        });
    }

    
    /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    OptionPackage.prototype.generateCode = function(addCell, exec) {
        var sbCode = new sb.StringBuilder();
        // sbCode.append(this.vp_userCode.getValue());

        // save codemirror value to origin textarea
        // this.vp_userCode.save();

        // selected snippet
        var selected = $(this.wrapSelector('.vp-sn-item-header.selected'));
        if (selected) {
            var item = $(selected).closest('.vp-sn-item');
            var title = $(item).data('title');

            // get codemirror
            this.codemirrorList[title].save();
            var code = this.codemirrorList[title].getValue();
            sbCode.append(code);
        }


        if (addCell) this.cellExecute(sbCode.toString(), exec);

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});
