/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : Import.js
 *    Author          : Black Logic
 *    Note            : Apps > Import
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] Import
//============================================================================
define([
    __VP_CSS_LOADER__('vp_base/css/m_apps/import'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(importCss, com_util, com_Const, com_String, PopupComponent) {

    const importTemplates = {
        'data-analysis': [
            { i0: 'numpy',  i1: 'np', type: 'module'},
            { i0: 'pandas',  i1: 'pd', type: 'module'},
            { 
                i0: 'matplotlib.pyplot', i1: 'plt', type: 'module'
                , include: [
                    '%matplotlib inline'
                ]
            },
            { i0: 'seaborn', i1: 'sns', type: 'module'},
            {
                i0: 'plotly.express', i1: 'px', type: 'module'
                , include: [
                    'from plotly.offline import init_notebook_mode',
                    'init_notebook_mode(connected=True)'
                ], checked: false
            }
        ],
        'machine-learning': [
            { i0: 'sklearn.model_selection',  i1: 'train_test_split', type: 'function' },
            { i0: 'sklearn',  i1: 'metrics', type: 'function' }
        ]
    }

    /**
     * Import
     */
    class Import extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.sizeLevel = 1;

            let savedData = vpConfig.getDataSimple('', 'vpimport');
            // Reset abnormal data
            if (savedData == undefined || savedData.tabType == undefined) {
                savedData = {};
                vpConfig.setData(null, 'vpimport');
            }

            this.state = {
                tabType: 'data-analysis',
                importMeta: [],
                ...savedData,
                ...this.state
            }

            if (!this.state.importMeta || this.state.importMeta.length <= 0) {
                this.state.importMeta = JSON.parse(JSON.stringify(importTemplates[this.state.tabType]));
            }
        }

        _bindEvent() {
            super._bindEvent();
            let that = this;

            // select tab
            $(this.wrapSelector('.vp-tab-button')).on('click', function() {
                let tabType = $(this).data('tab');
                // set button selected
                that.state.tabType = tabType;
                $(that.wrapSelector('.vp-tab-button')).removeClass('vp-tab-selected');
                $(this).addClass('vp-tab-selected');
                // replace libraries
                that.state.importMeta = importTemplates[tabType];
                $(that.wrapSelector('#vp_tblImport')).replaceWith(function() {
                    return that.templateTable(that.state.importMeta);
                });
            });

            // delete lib
            $(this.wrapSelector()).on("click", '.vp-remove-option', function() {
                $(this).closest('tr').remove();

                that.checkAll();
            });
            // check/uncheck all
            $(this.wrapSelector()).on('change', '#vp_libraryCheckAll', function() {
                var checked = $(this).prop('checked');
                $(that.wrapSelector('.vp-item-check')).prop('checked', checked);
            }); 
            // check item
            $(this.wrapSelector()).on('change', '.vp-item-check', function() {
                var checked = $(this).prop('checked');
                // if unchecked at least one item, uncheck check-all
                if (!checked) {
                    $(that.wrapSelector('.vp-check-all')).prop('checked', false);
                } else {
                    // if all checked, check check-all
                    that.checkAll();
                }
            });

            // add module
            $(this.wrapSelector('#vp_addModule')).click(function() {
                var libsLength = $(that.wrapSelector("#vp_tblImport tbody tr")).length;
                var tagTr = $(that.templateForModule(libsLength, '', ''));

                $(that.wrapSelector("#vp_tblImport tr:last")).after(tagTr);
            });
            // add function
            $(this.wrapSelector('#vp_addFunction')).click(function() {
                var libsLength = $(that.wrapSelector("#vp_tblImport tbody tr")).length;
                var tagTr = $(that.templateForFunction(libsLength, '', ''));

                $(that.wrapSelector("#vp_tblImport tr:last")).after(tagTr);
            });
        }

        checkAll() {
            // check if all checked
            // if all checked, check check-all
            var allLength = $(this.wrapSelector('.vp-item-check')).length;
            var checkedLength = $(this.wrapSelector('.vp-item-check:checked')).length;
            if (allLength == checkedLength) {
                $(this.wrapSelector('.vp-check-all')).prop('checked', true);
            } else {
                $(this.wrapSelector('.vp-check-all')).prop('checked', false);
            }
        }

        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            // tab buttons
            page.appendLine('<div class="vp-tab-box">');
            page.appendFormatLine('<div class="vp-tab-button {0}" data-tab="{1}">{2}</div>'
                                , this.state.tabType=='data-analysis'?'vp-tab-selected':'', 'data-analysis', 'Data Analysis');
            page.appendFormatLine('<div class="vp-tab-button {0}" data-tab="{1}">{2}</div>'
                                , this.state.tabType=='machine-learning'?'vp-tab-selected':'', 'machine-learning', 'Machine Learning');
            page.appendLine('</div>');
            // import table
            page.appendLine(this.templateTable(this.state.importMeta));
            page.appendLine('<input type="button" id="vp_addModule" value="+ Module" class="vp-button" title="import (module) as"/>');
            page.appendLine('<input type="button" id="vp_addFunction" value="+ Function" class="vp-button" title="from (module) import (function)"/>');
            return page.toString();
        }

        templateTable(libraries) {
            var page = new com_String();
            page.appendLine('<table id="vp_tblImport" class="vp-tbl-basic w90 vp-tbl-gap5">');
            page.appendLine('<colgroup><col width="10px"/><col width="10%"/><col width="30%"/><col width="10%"/><col width="30%"/><col width="*"/></colgroup>');
            page.appendLine('<thead><tr>');
            page.appendFormat('<th><input id="{0}" type="checkbox" class="vp-checkbox vp-check-all" checked/></th>', 'vp_libraryCheckAll');
            page.appendLine('<th></th><th></th><th></th><th></th><th></th>');
            page.appendLine('</tr></thead>');
            page.appendLine('<tbody>');
            let that = this;
            libraries && libraries.forEach((lib, idx) => {
                if (lib.type == 'function') {
                    page.appendLine(that.templateForFunction(idx, lib.i0, lib.i1, lib.checked));
                } else {
                    page.appendLine(that.templateForModule(idx, lib.i0, lib.i1, lib.checked));
                }
            });
            page.appendLine('</tbody>');
            page.appendLine('</table>');
            return page.toString();
        }

        templateForModule(idx, moduleName, aliasName, checked=true) {
            var tag = new com_String();
            tag.append('<tr data-type="module">');
            // checkbox
            tag.appendFormat('<td><input id="{0}" type="checkbox" class="vp-checkbox vp-item-check" {1}/></td>'
                            , 'vp_libraryCheck' + idx, checked?'checked':'');
            // inputs
            tag.appendFormat('<td style="{0}">import</td>', 'text-align="center";');
            tag.appendFormat('<td><input id="{0}" type="text" class="{1}" placeholder="{2}" required value="{3}"/></td>'
                            , 'vp_i0_' + idx, 'vp-input m vp-add-i0', 'Type module', moduleName);
            tag.appendFormat('<td style="{0}">as</td>', 'text-align="center";');
            tag.appendFormat('<td><input id="{0}" type="text" class="{1}" placeholder="{2}" value="{3}"/></td>'
                            , 'vp_i1_' + idx, 'vp-input m vp-add-i1', 'Type alias', aliasName);
            // LAB: img to url
            // tag.appendFormat('<td class="{0}"><img src="{1}"/></td>', 'vp-remove-option w100 vp-cursor', com_Const.IMAGE_PATH + 'close_small.svg');
            tag.appendFormat('<td class="{0} {1}"></td>', 'vp-remove-option w100 vp-cursor', 'vp-icon-close-small');
            tag.append('</tr>');
            return tag.toString();
        }

        templateForFunction(idx, moduleName, functionName, checked=true) {
            var tag = new com_String();
            tag.append('<tr data-type="function">');
            // checkbox
            tag.appendFormat('<td><input id="{0}" type="checkbox" class="vp-checkbox vp-item-check" {1}/></td>'
                            , 'vp_libraryCheck' + idx, checked?'checked':'');
            // inputs
            tag.appendFormat('<td style="{0}">from</td>', 'text-align="center";');
            tag.appendFormat('<td><input id="{0}" type="text" class="{1}" placeholder="{2}" required value="{3}"/></td>'
                            , 'vp_i0_' + idx, 'vp-input m vp-add-i0', 'Type module', moduleName);
            tag.appendFormat('<td style="{0}">import</td>', 'text-align="center";');
            tag.appendFormat('<td><input id="{0}" type="text" class="{1}" placeholder="{2}" value="{3}"/></td>'
                            , 'vp_i1_' + idx, 'vp-input m vp-add-i1', 'Type function', functionName);
            // LAB: img to url
            // tag.appendFormat('<td class="{0}"><img src="{1}"/></td>', 'vp-remove-option w100 vp-cursor', com_Const.IMAGE_PATH + 'close_small.svg');
            tag.appendFormat('<td class="{0} {1}"></td>', 'vp-remove-option w100 vp-cursor', 'vp-icon-close-small');
            tag.append('</tr>');
            return tag.toString();
        }

        render() {
            super.render();

            this.checkAll();
        }

        generateCode() {
            var sbCode = new com_String();

            // code generate with library list
            var importMeta = [];
            var libraryList = $(this.wrapSelector("#vp_tblImport tbody tr"));
            for (var idx = 0; idx < libraryList.length; idx++) {
                var pacType = $(libraryList[idx]).data('type');
                var pacI0 = $(libraryList[idx]).find('.vp-add-i0').val();
                var pacI1 = $(libraryList[idx]).find('.vp-add-i1').val().trim();
                var pacChecked = $(libraryList[idx]).find('.vp-item-check').prop('checked');

                if (pacI0 == "") {
                    continue;
                }
                if (pacChecked) {
                    if (sbCode.toString().trim().length > 0) {
                        sbCode.appendLine();
                    }
                    if (pacType == 'function') {
                        // function
                        sbCode.appendFormat("from {0} import {1}", pacI0, pacI1); 
                    } else {
                        // module
                        sbCode.appendFormat("import {0}{1}", pacI0, ((pacI1 === undefined || pacI1 === "") ? "" : (" as " + pacI1)));
                    }

                    // Need additional code?
                    if (pacI0 == 'matplotlib.pyplot' || pacI0 == 'matplotlib') {
                        sbCode.appendLine();
                        sbCode.append('%matplotlib inline');
                    }
                    if (pacI0 == 'plotly.express' || pacI0 == 'plotly') {
                        sbCode.appendLine();
                        sbCode.appendLine('from plotly.offline import init_notebook_mode');
                        sbCode.append('init_notebook_mode(connected=True)');
                    }
                }
                
                importMeta.push({ i0: pacI0, i1: pacI1, type: pacType, checked: pacChecked });
            }
            this.state.importMeta = importMeta;

            // save import packages
            vpConfig.setData({ tabType: this.state.tabType, importMeta: importMeta }, 'vpimport');

            this.generatedCode = sbCode.toString();
            return sbCode.toString();
        }

    }

    return Import;
});