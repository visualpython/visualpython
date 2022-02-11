/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : addData.js
 *    Author          : Black Logic
 *    Note            : Add data
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 02. 07
 *    Change Date     :
 */

//============================================================================
// [CLASS] Add data
//============================================================================
define([
    'text!vp_base/html/m_ml/addData.html!strip',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(addDataHtml, com_util, com_Const, com_String, PopupComponent) {

    /**
     * Add data
     */
    class AddData extends PopupComponent {
        _init() {
            super._init();
            
            this.state = {
                targetVariable: '',
                predictData: 'pred',
                colName: 'pred_result',
                allocateTo: '_vp',
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();
            var that = this;

        }

        templateForDataView() {
            ;
        }

        renderDataView() {
            super.renderDataView();

            this.loadDataPage();
            $(this.wrapSelector('.vp-popup-dataview-box')).css('height', '300px');
        }

        renderDataPage(renderedText, isHtml = true) {
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} vp-close-on-blur vp-scrollbar">', 'rendered_html'); // 'rendered_html' style from jupyter output area
            if (isHtml) {
                tag.appendLine(renderedText);
            } else {
                tag.appendFormatLine('<pre>{0}</pre>', renderedText);
            }
            tag.appendLine('</div>');
            $(this.wrapSelector('.vp-popup-dataview-box')).html(tag.toString());
        }

        loadDataPage() {
            var that = this;
            var code = this.generateCode();
            // if not, get output of all data in selected pandasObject
            vpKernel.execute(code).then(function(resultObj) {
                let { msg } = resultObj;
                if (msg.content.data) {
                    var htmlText = String(msg.content.data["text/html"]);
                    var codeText = String(msg.content.data["text/plain"]);
                    if (htmlText != 'undefined') {
                        that.renderDataPage(htmlText);
                    } else if (codeText != 'undefined') {
                        // plain text as code
                        that.renderDataPage(codeText, false);
                    } else {
                        that.renderDataPage('');
                    }
                } else {
                    var errorContent = new com_String();
                    if (msg.content.ename) {
                        errorContent.appendFormatLine('<div class="{0}">', 'vp-popup-data-error-box');
                        errorContent.appendLine('<i class="fa fa-exclamation-triangle"></i>');
                        errorContent.appendFormatLine('<label class="{0}">{1}</label>',
                            'vp-popup-data-error-box-title', msg.content.ename);
                        if (msg.content.evalue) {
                            // errorContent.appendLine('<br/>');
                            errorContent.appendFormatLine('<pre>{0}</pre>', msg.content.evalue.split('\\n').join('<br/>'));
                        }
                        errorContent.appendLine('</div>');
                    }
                    that.renderDataPage(errorContent);
                }
            }).catch(function(resultObj) {
                let { msg } = resultObj;
                var errorContent = new com_String();
                if (msg.content.ename) {
                    errorContent.appendFormatLine('<div class="{0}">', 'vp-popup-data-error-box');
                    errorContent.appendLine('<i class="fa fa-exclamation-triangle"></i>');
                    errorContent.appendFormatLine('<label class="{0}">{1}</label>',
                    'vp-popup-data-error-box-title', msg.content.ename);
                    if (msg.content.evalue) {
                        // errorContent.appendLine('<br/>');
                        errorContent.appendFormatLine('<pre>{0}</pre>', msg.content.evalue.split('\\n').join('<br/>'));
                    }
                    errorContent.appendLine('</div>');
                }
                that.renderDataPage(errorContent);
            });
        }

        templateForBody() {
            let page = $(addDataHtml);


            return page;
        }

        generateCode() {
            let { targetVariable, predictData, colName, allocateTo } = this.state;
            let code = new com_String();
            
            if (targetVariable != '' && targetVariable != allocateTo) {
                code.appendFormatLine('{0} = {1}.copy()', allocateTo, targetVariable);
            }
            code.appendFormat("{0}['{1}'] = {2}", allocateTo, colName, predictData);
            if (allocateTo && allocateTo != '') {
                code.appendLine();
                code.append(allocateTo);
            }
            return code.toString();
        }

    }

    return AddData;
});