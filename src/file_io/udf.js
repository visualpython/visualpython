define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/common/vpSetting'
    // TEST: CodeMirror
    , 'codemirror/lib/codemirror'
    , 'codemirror/mode/python/python'
    , 'notebook/js/codemirror-ipython'
    , 'codemirror/addon/display/placeholder'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, vpSetting, CodeMirror, cmpython, cmip) {
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
            var uuid = vpCommon.getUUID();
            // 최대 10회 중복되지 않도록 체크
            for (var idx = 0; idx < 10; idx++) {
                // 이미 사용중인 uuid 인 경우 다시 생성
                if ($(vpConst.VP_CONTAINER_ID).find("." + uuid).length > 0) {
                    uuid = vpCommon.getUUID();
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
            optionPackage.bindCodeMirror();
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
        var that = this;
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "file_io/udf.css");
        
        // bind values after loading html
        this.package.input && this.package.input.forEach(obj => {
            if (obj.value != undefined) {
                var tag = $(this.wrapSelector('#' + obj.name));
                tag.val(obj.value);
            }
        });

        // save udf
        $(this.wrapSelector('#vp_udfSave')).click(function() {
            // if title is not empty
            var key = $(that.wrapSelector('#vp_udfTitle')).val();
            if (key == undefined || key === "") {
                vpCommon.renderAlertModal('Please enter the title');
                return;
            }

            // save codemirror value to origin textarea
            that.vp_userCode.save();
            var code = that.vp_userCode.getValue();

            // save udf
            var saveUdf = { [key]: code };
            vpSetting.saveUserDefinedCode(saveUdf);

            // FIXME: vp-multilang for success message
            vpCommon.renderSuccessMessage('Successfully saved!');

            // load again
            that.loadUdfList();
        });

        // load udf list
        this.loadUdfList();

        // load when refresh clicks
        $(this.wrapSelector('#vp_udfRefresh')).click(function(event) {
            event.stopPropagation();
            that.loadUdfList();
            // show success message
            vpCommon.renderSuccessMessage('Refreshed!');
        });

        // new button clicked
        $(this.wrapSelector('#vp_udfCreate')).click(function() {
            that.vp_userCode.save();
            var code = that.vp_userCode.getValue();

            if (code && code.length > 0) {
                // ask clearing codes
                that.openMultiBtnModal_new("Save Code", "Would you like to save previous code and clear it?"
                , ["Just Clear", "Cancel", "Save and Clear"]
                , [()=> {
                    // clear code
                    $(that.wrapSelector('#vp_udfTitle')).val('');
                    $(that.wrapSelector('#vp_userCode')).val('');
                    that.vp_userCode.setValue('');
                }, ()=> {

                }, ()=> {
                    // save and clear code
                    // save
                    var key = $(that.wrapSelector('#vp_udfTitle')).val();
                    if (key == undefined || key === "") {
                        key = '_temporary';
                    }

                    // save codemirror value to origin textarea
                    that.vp_userCode.save();
                    var code = that.vp_userCode.getValue();

                    // save udf
                    var saveUdf = { [key]: code };
                    vpSetting.saveUserDefinedCode(saveUdf);

                    // clear code
                    $(that.wrapSelector('#vp_udfTitle')).val('');
                    $(that.wrapSelector('#vp_userCode')).val('');
                    that.vp_userCode.setValue('');

                    // load again
                    that.loadUdfList();
                }]);
            } else {
                // clear code
                $(that.wrapSelector('#vp_udfTitle')).val('');
                $(that.wrapSelector('#vp_userCode')).val('');
                that.vp_userCode.setValue('');
            }
        });

        // delete button clicked
        $(this.wrapSelector('#vp_udfDelete')).click(function() {
            // remove key from list
            var key = $(that.wrapSelector('#vp_udfList')).find('.vp-udf-check:checked').val();
            if (key && vpSetting.getUserDefinedCode(key)) {
                // remove key
                vpSetting.removeUserDefinedCode(key);

                // FIXME: vp-multilang for success message
                vpCommon.renderSuccessMessage('Successfully removed!');
            } else {
                vpCommon.renderAlertModal('No key available...');
            }
            
            // load again
            that.loadUdfList();
        }); 
        
        
    }

    OptionPackage.prototype.loadUdfList = function() {
        var that = this;

        // clear table except head
        $(this.wrapSelector('#vp_udfList tr:not(:first)')).remove();

        // load udf list to table 'vp_udfList'
        vpSetting.loadUserDefinedCodeList(function(udfList) {
    
            udfList.forEach(obj => {
                if (obj.code != null && obj.code != undefined) {
                    var trow = $(`<tr></tr>`);
                    var tdTitle = $(`<td class="vp-udf-key"><label><input type="checkbox" class="vp-udf-check" value="${obj.name}"/><span>${obj.name}</span></label></td>`);
                    var tdCode = $(`<td class="vp-udf-code"><pre title="${obj.code}">${obj.code}</pre></td>`);
                    // var tdDelete = $(`<td><button type="button" data-key="${obj.name}">X</button></td>`);
                    // var tdDelete = $(`<td><div class="vp-del-col" data-key="${obj.name}"></div></td>`);
        
                    // click title to load code on udf textarea
                    trow.click(function() {
                        var key = $(this).find('.vp-udf-check').val();
                        if (key == undefined || key === "") {
                            // 키가 존재하지 않습니다.
                            vpCommon.renderAlertModal('The key is not available now.');
                            return;
                        }
                        // 선택 표시
                        // $(this).closest('table').find('.vp-udf-key').removeClass('selected');
                        $(this).closest('table').find('.vp-udf-check').prop('checked', false)
                        // $(this).addClass('selected');
                        $(this).find('.vp-udf-check').prop('checked', true);

                        var code = $(this).find('.vp-udf-code pre').text();

                        // load code on udf textarea
                        // key title
                        $(that.wrapSelector('#vp_udfTitle')).val(key);
                        // code
                        $(that.wrapSelector('#vp_userCode')).val(code);
                        that.vp_userCode.setValue(code);

                    });
        
                    trow.append(tdTitle);
                    trow.append(tdCode);
        
                    $(that.wrapSelector('#vp_udfList')).append(trow);
                }
            });
        });
        

    }

    /**
     * Bind CodeMirror to Textarea
     */
    OptionPackage.prototype.bindCodeMirror = function() {
        var that = this;

        this.vp_userCode = CodeMirror.fromTextArea($(this.wrapSelector('#vp_userCode'))[0], {
            mode: {
                name: 'python',
                version: 3,
                singleLineStringErrors: false
            },  // text-cell(markdown cell) set to 'htmlmixed'
            indentUnit: 4,
            matchBrackets: true,
            lineNumbers: true,
            autoRefresh:true,
            lineWrapping: true, // text-cell(markdown cell) set to true
            theme: "default",
            extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
        });
        // this.vp_userCode.setSize(null, 100);
        this.vp_userCode.setValue($(this.wrapSelector('#vp_userCode')).val());

        // focus on codemirror
        this.vp_userCode.focus();

        /**
         * CodeMirror reference : https://codemirror.net/index.html
         *  
         * CodeMirror object Usage :
         * 1. Get value
         *  vp_testCodeMirror.getValue()
         * 2. Set value
         *  vp_testCodeMirror.setValue('string')
         * 3. Apply to original textarea
         *  vp_testCodeMirror.save()
         * 4. Get Textarea object
         *  vp_testCodeMirror.getTextArea()
         * 
         * Prefix box Textarea
         *  var vp_prefix = CodeMirror.fromTextArea($('#vp_prefixBox textarea')[0], { mode:'htmlmixed', lineNumbers: true, theme: 'default'});
         * Postfix box Textarea
         *  var vp_postfix = CodeMirror.fromTextArea($('#vp_postfixBox textarea')[0], { mode: 'htmlmixed', lineNumbers: true, theme: 'default'});
         */

        // Deprecated: no api board for udf page
        // var popupTag = `<div id="vp_cmPopup" class="vp-cm-popup no-selection"><span id="vp_cmAddBlock" class="vp-cm-popup-menu"><i class="fa fa-plus"></i> add code block</span></div>`;
        // $(this.wrapSelector('')).prepend($(popupTag));
        // $('#vp_cmPopup').hide();

        // // click - add block : add code block to vpCode Container
        // $('#vp_cmAddBlock').click(function() {
        //     if (that.vp_userCode != undefined) {
        //         var selection = that.vp_userCode.getSelection();

        //         if (selection == '' || selection.trim().length <= 0) {
        //             return false;
        //         }

        //         var blockObj = { 
        //             code: selection, 
        //             type: 'code',
        //             metadata: {
        //                 funcID: funcOptProp.funcID,
        //                 prefix: [],
        //                 postfix: [],
        //                 options: [
        //                     { id: 'vp_userCode', value: selection }
        //                 ]
        //             }
        //         };
    
        //         vpCode.addBlock(blockObj);
        //     }
        // });

        // $('.CodeMirror-lines').unbind('contextmenu');
        // // TEST: selection
        // $('.CodeMirror-lines').on('contextmenu', function(event) {
        //     event.preventDefault();
        //     event.stopPropagation();

        //     var selection = that.vp_userCode.getSelection();

        //     if (selection == '' || selection.trim().length <= 0) {
        //         return false;
        //     }

        //     $('#vp_cmPopup').css({
        //         position: 'fixed',
        //         left: event.pageX,
        //         top: event.pageY
        //     });
        //     $('#vp_cmPopup').show();

        //     return false;
        // });

        // // popup menu disappear
        // $('body').on('click', function(event) {
        //     var target = event.target;
        //     $('#vp_cmPopup').hide();
        // });

        // $('.CodeMirror-lines').attr('title', 'drag text and right click to add block');
    }

    /**
     * 코드 생성
     * @param {boolean} exec 실행여부
     */
    OptionPackage.prototype.generateCode = function(addCell, exec) {
        var sbCode = new sb.StringBuilder();
        sbCode.append(this.vp_userCode.getValue());

        // save codemirror value to origin textarea
        this.vp_userCode.save();

        if (addCell) this.cellExecute(sbCode.toString(), exec);

        return sbCode.toString();
    }

    return {
        initOption: initOption
    };
});
