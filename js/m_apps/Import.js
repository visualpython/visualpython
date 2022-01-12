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
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(com_util, com_Const, com_String, PopupComponent) {

    /**
     * Import
     */
    class Import extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.sizeLevel = 1;

            this.packageList = [
                { library: 'numpy',     alias:'np'}
                , { library: 'pandas',  alias:'pd'}
                , { 
                    library: 'matplotlib.pyplot', alias:'plt' 
                    , include: [
                        '%matplotlib inline'
                    ]
                }
                , { library: 'seaborn', alias:'sns'}
            ];

            this.state = {
                importMeta: vpConfig.getDataSimple('', 'vpimport'),
                ...this.state
            }

            if (!this.state.importMeta || this.state.importMeta.length <= 0) {
                this.state.importMeta = this.packageList;
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;
            // delete lib
            $(document).on("click", this.wrapSelector('.vp-remove-option'), function() {
                // X 아이콘과 동일한 행 삭제
                $(this).closest('tr').remove();
            });

            // add lib
            $(this.wrapSelector('#vp_addLibrary')).click(function() {
                var libsLength = $(that.wrapSelector("#vp_tblImport tbody tr")).length;
                var tagTr = $(that.templateForLibrary(libsLength, '', ''));

                $(that.wrapSelector("#vp_tblImport tr:last")).after(tagTr);
            });
        }

        templateForBody() {
            /** Implement generating template */
            var page = new com_String();
            page.appendFormatLine('<input type="hidden" id="vp_importMeta" value="{0}"/>', '');
            page.appendLine('<table id="vp_tblImport" class="vp-tbl-basic w90">');
            page.appendLine('<colgroup><col width="40%"/><col width="40%"/><col width="*"/></colgroup>');
            page.appendLine('<thead><tr>');
            page.appendLine('<th>Library Name</th><th>Alias</th><th></th>');
            page.appendLine('</tr></thead>');
            page.appendLine('<tbody>');
            let that = this;
            this.state.importMeta.forEach((lib, idx) => {
                page.appendLine(that.templateForLibrary(idx, lib.library, lib.alias));
            });
            page.appendLine('</tbody>');
            page.appendLine('</table>');
            page.appendLine('<input type="button" id="vp_addLibrary" value="+ Library" class="vp-button"/>');
            return page.toString();
        }

        templateForLibrary(idx, libraryName, aliasName) {
            var tag = new com_String();
            tag.append('<tr>');
            tag.appendFormat('<td><input id="{0}" type="text" class="{1}" placeholder="{2}" required value="{3}"/></td>'
                            , 'vp_library' + idx, 'vp-input m vp-add-library', 'Type library name', libraryName);
            tag.appendFormat('<td><input id="{0}" type="text" class="{1}" placeholder="{2}" value="{3}"/></td>'
                            , 'vp_alias' + idx, 'vp-input m vp-add-alias', 'Type alias', aliasName);
            tag.appendFormat('<td class="{0}"><img src="{1}"/></td>', 'vp-remove-option w100 vp-cursor', '/nbextensions/visualpython/img/close_small.svg');
            tag.append('</tr>');
            return tag.toString();
        }

        generateCode() {
            var sbCode = new com_String();

            // code generate with library list
            var importMeta = [];
            var libraryList = $(this.wrapSelector("#vp_tblImport tbody tr"));
            for (var idx = 0; idx < libraryList.length; idx++) {
                var pacName = $(libraryList[idx]).find('.vp-add-library').val();
                var pacAlias = $(libraryList[idx]).find('.vp-add-alias').val().trim();

                if (pacName == "") {
                    continue;
                }
                if (sbCode.toString().trim().length > 0) {
                    sbCode.appendLine();
                }
                sbCode.appendFormat("import {0}{1}", pacName, ((pacAlias === undefined || pacAlias === "") ? "" : (" as " + pacAlias)));

                this.packageList.forEach(pack => {
                    if (pack.library == pacName) {
                        // if include code exists?
                        if (pack.include != undefined) {
                            pack.include.forEach(code => {
                                sbCode.appendLine();
                                sbCode.append(code);
                            });
                        }
                    }
                })

                importMeta.push({ library: pacName, alias: pacAlias });
            }
            this.state.importMeta = importMeta;

            // save import packages
            vpConfig.setData(importMeta, 'vpimport');

            // TODO: 전체에게 해당 함수 리턴 요청
            this.generatedCode = sbCode.toString();
            return sbCode.toString();
        }

    }

    return Import;
});