/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : File.js
 *    Author          : Black Logic
 *    Note            : Apps > File
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
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/DataSelector'
], function(fileHtml, fileCss, com_String, com_util, com_Const, PopupComponent
            , pdGen, pandasLibrary, FileNavigation, SuggestInput, DataSelector) {

    /**
     * File
     */
    class File extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];

            this.fileExtensions = {
                'csv': ['csv', 'tsv', 'txt'],
                'excel': ['xlsx', 'xls'],
                'json': ['json'],
                'pickle': [],
                'sas': [], // xport or sas7bdat
                'spss': [],
                'parquet': ['parquet']
            }
            
            this.package = {
                input: [
                    { name: 'vp_fileioType' },
                    { name: 'vp_pageDom'}
                ]
            }

            // INTEGRATED: integrate data source from raw.github
            // if (vpConfig.extensionType === 'notebook') {
            //     this.dataPath = window.location.origin + com_Const.DATA_PATH + "sample_csv/";
            // } else if (vpConfig.extensionType === 'colab' || vpConfig.extensionType === 'lab') {
            //     // this.dataPath = com_Const.DATA_PATH + "sample_csv/";
            //     this.dataPath = 'https://raw.githubusercontent.com/visualpython/visualpython/main/data/sample_csv/';
            // }
            if (vpConfig.extensionType === 'lite') {
                this.dataPath = '/drive/data/';
            } else {
                this.dataPath = 'https://raw.githubusercontent.com/visualpython/visualpython/main/visualpython/data/sample_csv/';
            }

            this.state = {
                fileType: 'csv',
                fileExtension: ['csv'],
                selectedFile: '',
                selectedPath: '',
                vp_fileioType: 'Read',
                vp_pageDom: '',
                userOption: '',
                ...this.state
            }

            this.fileResultState = {
                pathInputId : this.wrapSelector('#vp_fileRead #i0'),
                fileInputId : this.wrapSelector('#vp_fileRead #fileName')
            };
    
            this.fileState = {
                'Read': {
                    fileTypeId: {
                        'csv': 'pd_readCsv',
                        'excel': 'pd_readExcel',
                        'json': 'pd_readJson',
                        'pickle': 'pd_readPickle',
                        'sas': 'pd_readSas',
                        'spss': 'pd_readSpss',
                        'parquet':'pd_readParquet'
                    },
                    selectedType: 'csv',
                    package: null,
                    fileResultState: {
                        pathInputId : this.wrapSelector('#vp_fileRead #i0'),
                        fileInputId : this.wrapSelector('#vp_fileRead #fileName')
                    }
                },
                'Write': {
                    fileTypeId: {
                        'csv': 'pd_toCsv',
                        'excel': 'pd_toExcel',
                        'json': 'pd_toJson',
                        'pickle': 'pd_toPickle',
                        'parquet':'pd_toParquet'
                    },
                    selectedType: 'csv',
                    package: null,
                    fileResultState: {
                        pathInputId : this.wrapSelector('#vp_fileWrite #i1'),
                        fileInputId : this.wrapSelector('#vp_fileWrite #fileName')
                    }
                },
                // 'Sample': {
                //     library: 'pandas',
                //     code: "${vp_sampleReturn} = pd.read_csv('" + this.dataPath  + "${vp_sampleFile}'${v})",
                //     input: [
                //         {
                //             name:'vp_sampleFile',
                //             label: 'Sample Data',
                //             component: 'option_select',
                //             options: [
                //                 'iris.csv', 'titanic.csv', 'fish.csv', 'campusRecruitment.csv', 
                //                 'houseData_500.csv', 'economic_index.csv', 'tips.csv'
                //             ],
                //             options_label: [
                //                 'iris', 'titanic', 'fish', 'campusRecruitment', 
                //                 'houseData_500', 'economic index', 'tips'
                //             ]
                //         }
                //     ],
                //     output: [
                //         {
                //             name:'vp_sampleReturn',
                //             type:'var',
                //             label:'Allocate to',
                //             required: true
                //         }
                //     ]
                // }
                "Sample": {
                    "library": "pandas",
                    "code": "${vp_sampleReturn} = pd.read_csv('" + this.dataPath  + "${vp_sampleFile}')",
                    "options": [
                      {
                        "name": "vp_sampleFile",
                        "label": "Sample Data",
                        "required": true,
                        "component": [
                          "option_select"
                        ],
                        "options": [
                          "iris.csv",
                          "titanic.csv",
                          "fish.csv",
                          "campusRecruitment.csv",
                          "houseData_500.csv",
                          "economic_index.csv",
                          "tips.csv"
                        ],
                        "options_label": [
                          "iris",
                          "titanic",
                          "fish",
                          "campusRecruitment",
                          "houseData_500",
                          "economic index",
                          "tips"
                        ]
                      },
                      {
                        "name": "vp_sampleReturn",
                        "label": "Allocate to",
                        "component": [
                          "data_select"
                        ],
                        "output": true,
                        "required": true,
                        "value": 'vp_df'
                      }
                    ]
                  }
            }
        }

        _unbindEvent() {
            super._unbindEvent();
            $(document).off('change', this.wrapSelector('#fileReadAs'));
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            $(this.wrapSelector('#vp_fileioType')).on('change', function() {
                var pageType = $(this).val();
                that.state['vp_fileioType'] = pageType;
                $(that.wrapSelector('.vp-fileio-box')).hide();
                $(that.wrapSelector('#vp_file' + pageType)).show();

                if (pageType === 'Read' && that.fileState[pageType].selectedType === 'spss') {
                    // show install button
                    that.showInstallButton();
                    // show install note below File type selection
                    $(`<tr class="vp-spss-note"><td colspan="2">
                        <label class="vp-orange-text vp-italic">NOTE: </label>
                        <label class="vp-gray-text vp-italic">pyreadstat package is required to read spss file.</label>
                    </td></tr>`).insertAfter($(that.wrapSelector('#fileType')).closest('tr'));
                } else {
                    that.hideInstallButton();
                    $(that.wrapSelector('.vp-spss-note')).remove();
                }


                //set fileExtensions
                that.fileResultState = {
                    ...that.fileState[pageType].fileResultState
                };
            });

            // fileReadAs change Event, Use PyArrow
            $(document).on('change', this.wrapSelector('#fileReadAs'), function() {
                let isChecked = $(this).prop('checked');
                var fileioType = that.state.vp_fileioType;
                var prefix = '#vp_file' + fileioType + ' ';
                var selectedType = that.fileState[fileioType]['selectedType'];
                var fileioTypePrefix = fileioType.toLowerCase();
                if(fileioTypePrefix == 'write'){
                    fileioTypePrefix = "to";
                }
                let fileId = that.fileState[fileioType].fileTypeId[selectedType];

                if (isChecked) {  // pyArrow
                    fileId = "pa_" + fileioTypePrefix + selectedType[0].toUpperCase() + selectedType.slice(1);
                    // that.fileState[fileioType].fileTypeId[that.state.fileExtension] = "pa_" + fileioTypePrefix + selectedFileFormat[0].toUpperCase() + selectedFileFormat.slice(1);
                    $(that.wrapSelector(prefix + '#vp_optionBox')).closest('.vp-accordian-container').hide();
                } else {  // pandas
                    // that.fileState[fileioType].fileTypeId[that.state.fileExtension] = "pd_" + fileioTypePrefix + selectedFileFormat[0].toUpperCase() + selectedFileFormat.slice(1);
                    if (that.state.fileType != 'parquet'){  // parquet has no options area
                        $(that.wrapSelector(prefix + '#vp_optionBox')).closest('.vp-accordian-container').show();
                    }
                }

                let pdLib = pandasLibrary.PANDAS_FUNCTION;
                let thisPkg = JSON.parse(JSON.stringify(pdLib[fileId]));
                
                that.fileState[fileioType].package = thisPkg;
            });

        }

        _bindEventByType(pageType) {
            var that = this;
            var prefix = '#vp_file' + pageType + ' ';

            var fileioTypePrefix = pageType.toLowerCase();
            if(fileioTypePrefix == 'write'){
                fileioTypePrefix = "to";
            }
            // select file type 
            $(this.wrapSelector(prefix + '#fileType')).change(function() {
                var fileType = $(this).val();
                that.fileState[pageType].selectedType = fileType;
    
                // reload
                that.renderPage(pageType);
                that._bindEventByType(pageType);
            });
    
            // open file navigation
            $(this.wrapSelector(prefix + '#vp_openFileNavigationBtn')).click(function() {
                
                let type = 'save';
                if (pageType == 'Read') {
                    type = 'open';
                }

                let extensionList = [];
                if (that.state.fileExtension && that.state.fileExtension.length > 0) {
                    extensionList = that.state.fileExtension;
                }

                let fileNavi = new FileNavigation({
                    type: type,
                    extensions: extensionList,
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
            var pageType = $(this.wrapSelector('#vp_fileioType')).val();

            // save input state
            $(this.wrapSelector('#vp_file' + pageType + ' input')).each(function () {
                this.defaultValue = this.value;
            });

            // save checkbox state
            $(this.wrapSelector('#vp_file' + pageType + ' input[type="checkbox"]')).each(function () {
                if (this.checked) {
                    this.setAttribute("checked", true);
                } else {
                    this.removeAttribute("checked");
                }
            });

            // save select state
            $(this.wrapSelector('#vp_file' + pageType + ' select > option')).each(function () {
                if (this.selected) {
                    this.setAttribute("selected", true);
                } else {
                    this.removeAttribute("selected");
                }
            });

            var pageDom = $(this.wrapSelector('#vp_file' + pageType)).html();
            this.state['vp_pageDom'] = pageDom;
        }

        loadStateAfterRender() {
            var pageType = this.state['vp_fileioType'];
            var pageDom = this.state['vp_pageDom'];

            // load pageDom
            $(this.wrapSelector('#vp_file' + pageType)).html(pageDom);

            // set page type
            $(this.wrapSelector('#vp_fileioType')).val(pageType);

            // show loaded page
            $(this.wrapSelector('.vp-fileio-box')).hide();
            $(this.wrapSelector('#vp_file' + pageType)).show();

            //set fileResultState
            this.fileResultState = {
                ...this.fileState[pageType].fileResultState
            };

            // bind event by page type
            this._bindEventByType(pageType);
        }

        templateForBody() {
            /** Implement generating template */
            let page = $(fileHtml);

            // Removed dataselector for Allocation input
            // let allocateSelector = new DataSelector({
            //     pageThis: this, id: 'vp_sampleReturn', placeholder: 'Variable name', value: 'vp_df'
            // });
            // $(page).find('#vp_sampleReturn').replaceWith(allocateSelector.toTagString());

            return page;
        }

        renderPage(pageType) {
            var that = this;
            var prefix = '#vp_file' + pageType + ' ';
            
            // clear
            $(this.wrapSelector(prefix + '#vp_inputOutputBox table tbody')).html('');
            $(this.wrapSelector(prefix + '#vp_optionBox table tbody')).html('');
    
            var fileTypeObj = this.fileState[pageType]['fileTypeId'];
            var selectedType = this.fileState[pageType]['selectedType'];
            let fileId = fileTypeObj[selectedType];
            let pdLib = pandasLibrary.PANDAS_FUNCTION;
            let thisPkg = JSON.parse(JSON.stringify(pdLib[fileId]));

            this.fileState[pageType].package = thisPkg;
            this.state.fileExtension = that.fileExtensions[selectedType];
            this.fileResultState = {
                ...this.fileState[pageType].fileResultState
            };

            if (selectedType == 'pickle' || selectedType == 'parquet') {
                // hide additional option box
                $(this.wrapSelector(prefix + '#vp_optionBox')).closest('.vp-accordian-container').hide();
            } else {
                $(this.wrapSelector(prefix + '#vp_optionBox')).closest('.vp-accordian-container').show();
            }
    
            if (pageType == 'Write') {
                if (selectedType == 'json') {
                    this.fileResultState.pathInputId = this.wrapSelector(prefix + '#path_or_buf');
                }
                if (selectedType == 'pickle' || selectedType == 'parquet') {
                    this.fileResultState.pathInputId = this.wrapSelector(prefix + '#path');
                }
            }
    
            // render interface
            // pdGen.vp_showInterfaceOnPage(this.wrapSelector('#vp_file' + pageType), thisPkg);
            // pdGen.vp_showInterfaceOnPage(this.wrapSelector('#vp_file' + pageType), thisPkg);
            pdGen.vp_showInterfaceOnPage(this, thisPkg, this.state, parent=('#vp_file' + pageType));
    
            // pyarrow can r/w parquet, csv and only read json.
            if ((pageType == 'Read' && selectedType == 'json') || selectedType == 'parquet'|| selectedType == 'csv') {
                // add checkbox 'Use PyArrow', next to File Type
                $(this.wrapSelector(prefix + '#vp_inputOutputBox table tbody')).prepend(
                    $('<tr>').append($(`<td><label for="fileType" class="vp-bold vp-orange-text">File Type</label></td>`))
                            .append($('<td><select id="fileType" class="vp-select"></select>  <label><input id="fileReadAs" type="checkbox"/><span>Use PyArrow</span></label></td>'))
                );
            } else {
                $(this.wrapSelector(prefix + '#vp_inputOutputBox table tbody')).prepend(
                    $('<tr>').append($(`<td><label for="fileType" class="vp-bold vp-orange-text">File Type</label></td>`))
                            .append($('<td><select id="fileType" class="vp-select"></select> </td>'))
                );
            }

            // prepend file type selector
            var fileTypeList = Object.keys(fileTypeObj);
            fileTypeList.forEach(type => {
                $(this.wrapSelector(prefix + '#fileType')).append(
                    $(`<option value="${type}">${type}</option>`)
                );
            });

            // prepend user option
            let hasAllocateTo = $(this.wrapSelector(prefix + '#o0')).length > 0;
            if (hasAllocateTo) {
                $(this.wrapSelector(prefix + '#o0')).closest('tr').after(
                    $('<tr>').append($(`<td><label for="userOption">User Option</label></td>`))
                        .append($('<td><input id="userOption" type="text" class="vp-input vp-state" placeholder="key=value, ..."/></td>'))
                )
            } else {
                $(this.wrapSelector(prefix + '#vp_inputOutputBox table tbody')).append(
                    $('<tr>').append($(`<td><label for="userOption">User Option</label></td>`))
                        .append($('<td><input id="userOption" type="text" class="vp-input vp-state" placeholder="key=value, ..."/></td>'))
                )
            }

            $(this.wrapSelector(prefix + '#fileType')).val(selectedType);

            // add file navigation button
            if (pageType == 'Write') {
                if (selectedType == 'json') {
                    $(prefix + '#path_or_buf').parent().html(
                        com_util.formatString('<input type="text" class="vp-input vp-state" id="path_or_buf" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{0}"></div>'
                        , 'vp-file-browser-button')
                    );
                } else if (selectedType == 'pickle'  || selectedType == 'parquet') {
                    $(prefix + '#path').parent().html(
                        com_util.formatString('<input type="text" class="vp-input vp-state" id="path" index="0" placeholder="" value="" title="" required="true"><div id="vp_openFileNavigationBtn" class="{0}"></div>'
                        , 'vp-file-browser-button')
                    );
                } else {
                    $(this.fileState[pageType]['fileResultState']['pathInputId']).parent().html(
                        com_util.formatString('<input type="text" class="vp-input vp-state" id="{0}" index="0" placeholder="" value="" title="" required="true"><div id="vp_openFileNavigationBtn" class="{1}"></div>'
                            , 'i1'
                            , 'vp-file-browser-button')
                    );
                }
            } else {
                $(this.fileState[pageType]['fileResultState']['pathInputId']).parent().html(
                    com_util.formatString('<input type="text" class="vp-input vp-state" id="{0}" index="0" placeholder="" value="" title="" required="true"><div id="vp_openFileNavigationBtn" class="{1}"></div>'
                        , 'i0'
                        , 'vp-file-browser-button')
                );
            }

            if (pageType === 'Read' && selectedType === 'spss') {
                // show install button
                this.showInstallButton();
                // show install note below File type selection
                $(`<tr class="vp-spss-note"><td colspan="2">
                    <label class="vp-orange-text vp-italic">NOTE: </label>
                    <label class="vp-gray-text vp-italic">pyreadstat package is required to read spss file.</label>
                </td></tr>`).insertAfter($(this.wrapSelector('#fileType')).closest('tr'));
            } else {
                this.hideInstallButton();
            }
    
            // encoding suggest input
            $(this.wrapSelector('#encoding')).replaceWith(function() {
                // encoding list : utf8 cp949 ascii
                var encodingList = ['utf8', 'cp949', 'ascii'];
                var suggestInput = new SuggestInput();
                suggestInput.setComponentID('encoding');
                suggestInput.addClass('vp-input vp-state');
                suggestInput.setSuggestList(function() { return encodingList; });
                suggestInput.setPlaceholder('encoding option');
                return suggestInput.toTagString();
            });

            // seperator suggest input
            $(this.wrapSelector('#sep')).replaceWith(function() {
                // seperator list : 
                var sepList = [',', '|', '\\t', '\\n', ':', ';', '-', '_', '&', '/', '\\'];
                var suggestInput = new SuggestInput();
                suggestInput.setComponentID('sep');
                suggestInput.addClass('vp-input vp-state');
                suggestInput.setSuggestList(function() { return sepList; });
                suggestInput.setPlaceholder('Input seperator');
                return suggestInput.toTagString();
            });
        }

        render() {
            super.render();

            this.renderPage('Read');
            this.renderPage('Write');

            // initialize fileResultState
            this.fileResultState = {
                ...this.fileState['Read'].fileResultState
            };

            if (this.state.vp_pageDom && this.state.vp_pageDom != '') {
                this.loadStateAfterRender();
            }
            this._bindEventByType('Read');
            this._bindEventByType('Write');

        }

        generateInstallCode() {
            return [ '!pip install pyreadstat' ];
        }

        generateCode() {
            var pageType = $(this.wrapSelector('#vp_fileioType')).val();
            var sbCode = new com_String;

            this.saveState();

            var prefix = '#vp_file' + pageType + ' ';
            var userOption = new com_String();
            var userOptValue = $(this.wrapSelector(prefix + '#userOption')).val();
            if (userOptValue != '') {
                userOption.appendFormat(', {0}', userOptValue);
            }

            if (pageType == 'Sample') {
                // sample csv code
                // var result = pdGen.vp_codeGenerator(this.uuid + ' #vp_fileSample', { ...this.fileState[pageType] }, userOption.toString());
                var result = pdGen.vp_codeGenerator(this, { ...this.fileState[pageType] }, this.state, userOption.toString(), parent='#vp_fileSample');
                sbCode.append(result);
            } else if (pageType == 'Read') {
                var thisPkg = JSON.parse(JSON.stringify(this.fileState[pageType].package));
                thisPkg.options.push({
                    name: 'fileType',
                    type: 'var'
                });
                // var result = pdGen.vp_codeGenerator(this.uuid + ' #vp_fileRead', thisPkg, userOption.toString());
                var result = pdGen.vp_codeGenerator(this, thisPkg, this.state, userOption.toString(), parent='#vp_fileRead');
                sbCode.append(result);
            } else if (pageType == 'Write') {
                var thisPkg = JSON.parse(JSON.stringify(this.fileState[pageType].package));
                thisPkg.options.push({
                    name: 'fileType',
                    type: 'var'
                });
                // var result = pdGen.vp_codeGenerator(this.uuid + ' #vp_fileWrite', thisPkg, userOption.toString());
                var result = pdGen.vp_codeGenerator(this, thisPkg, this.state, userOption.toString(), parent='#vp_fileWrite');
                sbCode.append(result);
            }
            return sbCode.toString();
        }

    }

    return File;
});