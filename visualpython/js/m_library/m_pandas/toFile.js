/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : toFile.js
 *    Author          : Black Logic
 *    Note            : to file
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] File
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_apps/file.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_apps/file'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/com_generatorV2',
    'vp_base/data/m_library/pandasLibrary',
    'vp_base/js/com/component/FileNavigation',
    'vp_base/js/com/component/SuggestInput'
], function(fileHtml, fileCss, com_String, com_util, com_Const, PopupComponent
            , pdGen, pandasLibrary, FileNavigation, SuggestInput) {

    /**
     * File
     */
    class File extends PopupComponent {
        _init() {
            super._init();
            this.config.dataview = false;
            this.config.sizeLevel = 1;

            this.state = {
                fileExtension: 'csv',
                selectedType: 'csv',
                selectedFile: '',
                selectedPath: '',
                vp_pageDom: '',
                ...this.state
            }

            this.fileExtensions = {
                'csv': 'csv',
                'excel': 'xlsx',
                'json': 'json',
                'pickle': ''
            }
            this.dataPath = 'https://raw.githubusercontent.com/visualpython/visualpython/main/visualpython/data/sample_csv/';
            this.fileResultState = {
                pathInputId : this.wrapSelector('#i1'),
                fileInputId : this.wrapSelector('#fileName')
            };
            this.fileState = {
                fileTypeId: {
                    'csv': 'pd005',
                    'excel': 'pd124',
                    'json': 'pd077',
                    'pickle': 'pd078'
                },
                selectedType: 'csv',
                package: null
            };
        }

        _bindEvent() {
            super._bindEvent();
            this.bindEvent();
        }
        
        bindEvent() {
            let that = this;
    
            // select file type 
            $(this.wrapSelector('#fileType')).change(function() {
                var value = $(this).val();
                that.state.selectedType = value;
    
                // reload
                that.renderPage();
                that.bindEvent();
            });
    
            // open file navigation
            $(this.wrapSelector('#vp_openFileNavigationBtn')).click(function() {
                let fileNavi = new FileNavigation({
                    type: 'save',
                    extensions: [ that.state.fileExtension ],
                    finish: function(filesPath, status, error) {
                        let {file, path} = filesPath[0];
                        that.state.selectedFile = file;
                        that.state.selectedPath = path;

                        // set text
                        $(that.fileResultState.fileInputId).val(file);
                        $(that.fileResultState.pathInputId).val(path);
                    }
                });
                fileNavi.open();
            });
        }

        saveState() {
            // save input state
            $(this.wrapSelector('input')).each(function () {
                this.defaultValue = this.value;
            });

            // save checkbox state
            $(this.wrapSelector('input[type="checkbox"]')).each(function () {
                if (this.checked) {
                    this.setAttribute("checked", true);
                } else {
                    this.removeAttribute("checked");
                }
            });

            // save select state
            $(this.wrapSelector('select > option')).each(function () {
                if (this.selected) {
                    this.setAttribute("selected", true);
                } else {
                    this.removeAttribute("selected");
                }
            });

            var pageDom = $(this.wrapSelector('.vp-fileio-box')).html();
            this.state['vp_pageDom'] = pageDom;
        }

        loadStateAfterRender() {
            var pageDom = this.state['vp_pageDom'];

            // load pageDom
            $(this.wrapSelector('.vp-fileio-box')).html(pageDom);
        }

        templateForBody() {
            return `<div class="vp-fileio-box">
                    <div class="vp-accordian-container">
                    <div class="vp-accordian vp-open"><span class="vp-indicator"></span><span class="vp-accordian-caption">Required Input & Output</span></div>
                    <div id="vp_inputOutputBox" class="vp-accordian-box">
                        <table class="vp-option-table vp-tbl-gap5">
                            <colgroup><col width="30%"/><col width="*"/></colgroup>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
                <div class="vp-accordian-container vp-accordion-gray-color">
                    <div class="vp-accordian vp-open"><span class="vp-indicator"></span><span class="vp-accordian-caption">Additional Options</span></div>
                    <div id="vp_optionBox" class="vp-accordian-box">
                        <table class="vp-option-table vp-tbl-gap5">
                            <colgroup><col width="30%"/><col width="*"/></colgroup>
                            <tbody></tbody>
                        </table>
                    </div>
                </div>
            </div>`;
        }

        render() {
            super.render();

            this.renderPage();

            if (this.state.vp_pageDom && this.state.vp_pageDom != '') {
                this.loadStateAfterRender();
            }
            this.bindEvent();
        }

        renderPage() {
            var that = this;
    
            // clear
            $(this.wrapSelector('#vp_inputOutputBox table')).html('<colgroup><col width="40%"/><col width="*"/></colgroup><tbody></tbody>');
            $(this.wrapSelector('#vp_optionBox table')).html('<colgroup><col width="40%"/><col width="*"/></colgroup><tbody></tbody>');
    
            var fileTypeObj = this.fileState['fileTypeId'];
            var selectedType = this.state['selectedType'];

            let fileId = fileTypeObj[selectedType];
            let pdLib = pandasLibrary.PANDAS_FUNCTION;
            let thisPkg = JSON.parse(JSON.stringify(pdLib[fileId]));

            this.fileState.package = thisPkg;
            this.state.fileExtension = that.fileExtensions[selectedType];

            if (selectedType == 'json') {
                this.fileResultState.pathInputId = this.wrapSelector('#path_or_buf');
            }
            if (selectedType == 'pickle') {
                this.fileResultState.pathInputId = this.wrapSelector('#path');
            }

            // render interface
            // pdGen.vp_showInterfaceOnPage(this.wrapSelector('.vp-fileio-box'), thisPkg);
            pdGen.vp_showInterfaceOnPage(this, thisPkg, this.state);
    
            // prepend file type selector
            $(this.wrapSelector('#vp_inputOutputBox table tbody')).prepend(
                $('<tr>').append($(`<td><label for="fileType" class="vp-orange-text">File Type</label></td>`))
                    .append($('<td><select id="fileType" class="vp-select"></select></td>'))
            );
            var fileTypeList = Object.keys(fileTypeObj);
            fileTypeList.forEach(type => {
                $(this.wrapSelector('#fileType')).append(
                    $(`<option value="${type}">${type}</option>`)
                );
            });
    
            $(this.wrapSelector('#fileType')).val(selectedType);
    
            // add file navigation button
            if (selectedType == 'json') {
                $(this.wrapSelector('#path_or_buf')).parent().html(
                    com_util.formatString('<input type="text" class="vp-input input-single" id="path_or_buf" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{0}"></div>'
                    , 'vp-file-browser-button')
                );
            } else if (selectedType == 'pickle') {
                $(this.wrapSelector('#path')).parent().html(
                    com_util.formatString('<input type="text" class="vp-input input-single" id="path" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{0}"></div>'
                    , 'vp-file-browser-button')
                );
            } else {
                $(this.fileResultState['pathInputId']).parent().html(
                    com_util.formatString('<input type="text" class="vp-input input-single" id="{0}" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{1}"></div>'
                        , 'i1'
                        , 'vp-file-browser-button')
                );
            }
    
            // encoding suggest input
            $(this.wrapSelector('#encoding')).replaceWith(function() {
                // encoding list : utf8 cp949 ascii
                var encodingList = ['utf8', 'cp949', 'ascii'];
                var suggestInput = new SuggestInput();
                suggestInput.setComponentID('encoding');
                suggestInput.addClass('vp-input');
                suggestInput.setSuggestList(function() { return encodingList; });
                suggestInput.setPlaceholder('encoding option');
                return suggestInput.toTagString();
            });
        }

        generateCode() {
            var sbCode = new com_String;

            this.saveState();

            var thisPkg = JSON.parse(JSON.stringify(this.fileState.package));
            thisPkg.options.push({
                name: 'fileType',
                type: 'var'
            });
            // var result = pdGen.vp_codeGenerator(this.uuid, thisPkg);
            var result = pdGen.vp_codeGenerator(this, thisPkg, this.state);
            sbCode.append(result);

            return sbCode.toString();
        }

    }

    return File;
});