/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : vpPDF.js
 *    Author          : Black Logic
 *    Note            : Define constant value
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 08. 14
 *    Change Date     :
 */

//============================================================================
// Define constant
//============================================================================
define([
    'nbextensions/visualpython/src/common/constant',
    'nbextensions/visualpython/src/common/StringBuilder',
    'nbextensions/visualpython/src/common/vpCommon',
    'nbextensions/visualpython/src/common/pycode',
    // file navigation
    'nbextensions/visualpython/src/pandas/fileNavigation/index',

    'codemirror/lib/codemirror',
    'codemirror/mode/python/python',
    'notebook/js/codemirror-ipython',
    'codemirror/addon/display/placeholder',
    'codemirror/addon/display/autorefresh',
], function (vpConst, sb, vpCommon, pycode, fileNavigation, codemirror) {
    
    //========================================================================
    // Define variable
    //=======================================================================
    const VP_PDF             = 'vp-pdf';
    const VP_PDF_CONTAINER   = 'vp-pdf-container';
    const VP_PDF_TITLE       = 'vp-pdf-title';
    const VP_PDF_CLOSE       = 'vp-pdf-close';
    const VP_PDF_BODY        = 'vp-pdf-body';
    const VP_PDF_GRID_BOX    = 'vp-pdf-grid-box';

    const VP_PDF_PREPARE_BOX = 'vp-pdf-prepare-box';
    const VP_PDF_INSTALL_BTN = 'vp-pdf-install-btn';
    const VP_PDF_CHECK_BTN   = 'vp-pdf-check-btn';
    const VP_PDF_IMPORT_BTN  = 'vp-pdf-import-btn';
    const VP_PDF_SHOW_BOX    = 'vp-pdf-show-box';
    const VP_PDF_DF_BOX      = 'vp-pdf-df-box';
    const VP_PDF_RUN_BTN     = 'vp-pdf-run-btn';

    const VP_PDF_PREVIEW_BOX = 'vp-pdf-preview-box';
    const VP_PDF_BUTTON_BOX = 'vp-pdf-btn-box';
    const VP_PDF_BUTTON_PREVIEW = 'vp-pdf-btn-preview';
    const VP_PDF_BUTTON_CANCEL = 'vp-pdf-btn-cancel';
    const VP_PDF_BUTTON_RUNADD = 'vp-pdf-btn-runadd';
    const VP_PDF_BUTTON_RUN = 'vp-pdf-btn-run';
    const VP_PDF_BUTTON_DETAIL = 'vp-pdf-btn-detail';
    const VP_PDF_DETAIL_BOX = 'vp-pdf-detail-box';
    const VP_PDF_DETAIL_ITEM = 'vp-pdf-detail-item';

    const VP_PDF_FILEPATH = 'vp-pdf-filepath';
    const VP_PDF_FILENAME = 'vp-pdf-filename';

    //========================================================================
    // [CLASS] PDF
    //========================================================================
     class PDF {
        /**
         * constructor
         * @param {object} pageThis
         * @param {string} targetId
         */
        constructor(pageThis, targetId) {
            this.pageThis = pageThis;
            this.targetId = targetId;
            this.uuid = 'u' + vpCommon.getUUID();

            // file navigation state
            this.state = {
                paramData:{
                    encoding: 'utf-8' // encoding
                    , delimiter: ','  // seperater
                },
                returnVariable:'',
                isReturnVariable: false,
                fileExtension: ['pdf']
            };
            this.fileResultState = {
                pathInputId : this.wrapSelector('.' + VP_PDF_FILEPATH),
                fileInputId : this.wrapSelector('.' + VP_PDF_FILENAME)
            };
        }

        wrapSelector(query = '') {
            return vpCommon.formatString('.{0}.{1} {2}', VP_PDF, this.uuid, query);
        }

        open(config={}) {
            this.config = {
                ...this.config,
                ...config
            }

            if (this.config.state) {
                this.init(this.config.state);
            } else {
                this.init();
            }
            $(this.wrapSelector()).show();

            // load state
            if (this.config.state) {
                this.loadState(this.config.state);
            }
        }

        close() {
            this.unbindEvent();
            $(this.wrapSelector()).remove();
        }

        init() {
            // state
            vpCommon.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + 'common/pdf.css');

            this.cmpreviewall = undefined;
            this.previewOpened = false;

            this.render();
            this.checkInstalled();
            this.bindEvent();
        }

        loadState(state) {
            var {
                filepath, filename, allocateTo
            } = state;

            // load variable
            $(this.wrapSelector('.' + VP_PDF_FILEPATH)).val(filepath);
            $(this.wrapSelector('.' + VP_PDF_FILENAME)).val(filename);
            $(this.wrapSelector('#vp_pdfReturn')).val(allocateTo);
        }

        saveState() {
            this.state.filepath = $(this.wrapSelector('.' + VP_PDF_FILEPATH)).val();
            this.state.filename = $(this.wrapSelector('.' + VP_PDF_FILENAME)).val();
            this.state.allocateTo = $(this.wrapSelector('#vp_pdfReturn')).val();
        }

        render() {
            var page = new sb.StringBuilder();
            page.appendFormatLine('<div class="{0} {1}">', VP_PDF, this.uuid);
            page.appendFormatLine('<div class="{0}">', VP_PDF_CONTAINER);

            // title
            page.appendFormat('<div class="{0}">{1}</div>',
                VP_PDF_TITLE, 'PyMuPDF - Extract text from pdf');

            // close button
            page.appendFormatLine('<div class="{0}"><img src="{1}"/></div>',
                VP_PDF_CLOSE, '/nbextensions/visualpython/resource/close_big.svg');

            // body start
            page.appendFormatLine('<div class="{0}">', VP_PDF_BODY);
            page.appendFormatLine('<div class="{0}">', VP_PDF_GRID_BOX);

            // prepare box
            page.appendFormatLine('<div class="{0}">', VP_PDF_PREPARE_BOX);
            page.appendFormatLine('<label>{0} <a href="{1}" target="_blank"><i class="{2} {3}" title="{4}"></i></a></label>',
                'Prepare to use PyMuPDF', 'https://pymupdf.readthedocs.io/', 'fa fa-link', 'vp-pdf-link', 'Go to PyMuPDF Documentaion');
            page.appendLine('<div>');
            page.appendFormatLine('<button class="{0} {1}">{2}</button>', 'vp-button activated', VP_PDF_INSTALL_BTN, 'Install');
            page.appendFormatLine('<div class="{0} {1}" title="{2}"><img src="{3}"/></div>', 'vp-cursor', VP_PDF_CHECK_BTN, 'Check if installed', '/nbextensions/visualpython/resource/refresh.svg');
            // page.appendLine('<div class="vp-vertical-line"></div>');
            page.appendFormatLine('<button class="{0} {1}" title="{2}">{3}</button>', 'vp-button', VP_PDF_IMPORT_BTN, 'Import and Add defined function', 'Import');
            page.appendLine('</div>');
            page.appendLine('</div>');

            // page.appendLine('<hr style="margin:0px"/>');
            // show box
            page.appendFormatLine('<div class="{0}">', VP_PDF_SHOW_BOX);
            // Select DataFrame
            page.appendFormatLine('<div class="{0}">', VP_PDF_DF_BOX);

            page.appendFormatLine('<label for="{0}" class="{1}">{2}</label>', 'vp_pdfVariable', 'vp-orange-text', 'File Path');

            page.appendLine('<div>');

            page.appendFormatLine('<input type="text" class="vp-input input-single {0}" index="0" placeholder="" value="" title=""><div id="vp_openFileNavigationBtn" class="{1}"></div>',
                VP_PDF_FILEPATH, vpConst.FILE_BROWSER_INPUT_BUTTON)

            page.appendLine('</div>');

            page.appendFormatLine('<label for="{0}">{1}</label>', 'vp_pdfReturn', 'Allocate to');
            page.appendLine('<div>');
            page.appendFormatLine('<input type="text" id="{0}" class="{1}" placeholder="{2}"/>', 'vp_pdfReturn', 'vp-pdf-input', 'New variable name');
            page.appendLine('</div>');

            // hidden inputs
            page.appendFormatLine('<input type="hidden" class="{0}"/>', VP_PDF_FILENAME);
            page.appendLine('</div>'); // VP_PDF_DF_BOX

            page.appendLine('</div>'); // VP_PDF_SHOW_BOX

            page.appendLine('</div>'); // VP_PDF_GRID_BOX
            page.appendLine('</div>'); // VP_PDF_BODY

            // preview box
            page.appendFormatLine('<div class="{0} {1}">', VP_PDF_PREVIEW_BOX, 'vp-apiblock-scrollbar');
            page.appendFormatLine('<textarea id="{0}" name="code"></textarea>', 'vp_codePreview');
            page.appendLine('</div>');

            // button box
            page.appendFormatLine('<div class="{0}">', VP_PDF_BUTTON_BOX);
            page.appendFormatLine('<button type="button" class="{0} {1} {2}">{3}</button>'
                                    , 'vp-button', 'vp-pdf-btn', VP_PDF_BUTTON_PREVIEW, 'Code view');
            page.appendFormatLine('<button type="button" class="{0} {1} {2}">{3}</button>'
                                    , 'vp-button cancel', 'vp-pdf-btn', VP_PDF_BUTTON_CANCEL, 'Cancel');
            page.appendFormatLine('<div class="{0}">', VP_PDF_BUTTON_RUNADD);
            page.appendFormatLine('<button type="button" class="{0} {1}" title="{2}">{3}</button>'
                                    , 'vp-button activated', VP_PDF_BUTTON_RUN, 'Apply to Board & Run Cell', 'Run');
            page.appendFormatLine('<button type="button" class="{0} {1}"><img src="{2}"/></button>'
                                    , 'vp-button activated', VP_PDF_BUTTON_DETAIL, '/nbextensions/visualpython/resource/arrow_short_up.svg');
            page.appendFormatLine('<div class="{0} {1}">', VP_PDF_DETAIL_BOX, 'vp-cursor');
            page.appendFormatLine('<div class="{0}" data-type="{1}" title="{2}">{3}</div>', VP_PDF_DETAIL_ITEM, 'apply', 'Apply to Board', 'Apply');
            page.appendFormatLine('<div class="{0}" data-type="{1}" title="{2}">{3}</div>', VP_PDF_DETAIL_ITEM, 'add', 'Apply to Board & Add Cell', 'Add');
            page.appendLine('</div>'); // VP_PDF_DETAIL_BOX
            page.appendLine('</div>'); // VP_PDF_BUTTON_RUNADD
            page.appendLine('</div>'); // VP_PDF_BUTTON_BOX

            page.appendLine('</div>'); // VP_PDF_CONTAINER
            page.appendLine('</div>'); // VP_PDF

            $('#vp-wrapper').append(page.toString());
            $(this.wrapSelector()).hide();
        }

        checkInstalled() {
            var that = this;
            // set state as 'Checking'
            $(this.wrapSelector('.' + VP_PDF_INSTALL_BTN)).text('Checking...');
            // set disabled
            if (!$(that.wrapSelector('.' + VP_PDF_INSTALL_BTN)).hasClass('disabled')) {
                $(that.wrapSelector('.' + VP_PDF_INSTALL_BTN)).addClass('disabled');
            }
            var checking = true;

            // check installed
            Jupyter.notebook.kernel.execute(
                pycode.PDF_SHOW,
                {
                    iopub: {
                        output: function (msg) {
                            if (!checking) {
                                return;
                            }
                            if (msg.content['name'] == 'stderr' || msg.content['text'].includes('not found')) {
                                checking = false;
                                $(that.wrapSelector('.' + VP_PDF_INSTALL_BTN)).text('Install');
                                // set enabled
                                if ($(that.wrapSelector('.' + VP_PDF_INSTALL_BTN)).hasClass('disabled')) {
                                    $(that.wrapSelector('.' + VP_PDF_INSTALL_BTN)).removeClass('disabled');
                                }
                            } else {
                                $(that.wrapSelector('.' + VP_PDF_INSTALL_BTN)).text('Installed');
                                // set disabled
                                if (!$(that.wrapSelector('.' + VP_PDF_INSTALL_BTN)).hasClass('disabled')) {
                                    $(that.wrapSelector('.' + VP_PDF_INSTALL_BTN)).addClass('disabled');
                                }
                            }
                        }
                    }
                }
            );
        }

        unbindEvent() {
            $(document).off(this.wrapSelector('*'));

            $(document).off('click', this.wrapSelector('.' + VP_PDF_CLOSE));
            $(document).off('click', this.wrapSelector('.' + VP_PDF_INSTALL_BTN));
            $(document).off('click', this.wrapSelector('.' + VP_PDF_CHECK_BTN));
            $(document).off('click', this.wrapSelector('.' + VP_PDF_IMPORT_BTN));
            $(document).off('click', this.wrapSelector('#vp_openFileNavigationBtn'));
            $(document).off('click', this.wrapSelector('.' + VP_PDF_BUTTON_RUN));
            $(document).off('click', this.wrapSelector('.' + VP_PDF_BUTTON_DETAIL));
            $(document).off('click', this.wrapSelector('.' + VP_PDF_DETAIL_ITEM));
            $(document).off('click', this.wrapSelector('.' + VP_PDF_BUTTON_PREVIEW));
            $(document).off('click', this.wrapSelector('.' + VP_PDF_BUTTON_CANCEL));
            $(document).off('click.' + this.uuid);
        }

        bindEvent() {
            var that = this;

            // close popup
            $(document).on('click', this.wrapSelector('.' + VP_PDF_CLOSE), function () {
                that.close();
            });

            // click install
            $(document).on('click', this.wrapSelector('.' + VP_PDF_INSTALL_BTN + ':not(.disabled)'), function () {
                vpCommon.cellExecute([{ command: pycode.PDF_INSTALL1, exec: true, type: 'code' }]);
                vpCommon.cellExecute([{ command: pycode.PDF_INSTALL2, exec: true, type: 'code' }]);
            });

            // click check installed
            $(document).on('click', this.wrapSelector('.' + VP_PDF_CHECK_BTN), function () {
                that.checkInstalled();
            });

            // click import
            $(document).on('click', this.wrapSelector('.' + VP_PDF_IMPORT_BTN), function () {
                vpCommon.cellExecute([{ command: pycode.PDF_IMPORT, exec: true, type: 'code' }]);
                vpCommon.cellExecute([{ command: pycode.PDF_FUNC, exec: true, type: 'code' }]);
            });

            // click file navigation button
            $(document).on('click', this.wrapSelector('#vp_openFileNavigationBtn'), async function() {
                var loadURLstyle = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH;
                    var loadURLhtml = Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + "component/fileNavigation/index.html";
                    
                    vpCommon.loadCss( loadURLstyle + "component/fileNavigation.css");
            
                    await $(`<div id="vp_fileNavigation"></div>`)
                    .load(loadURLhtml, () => {
        
                        $('#vp_fileNavigation').removeClass("hide");
                        $('#vp_fileNavigation').addClass("show");
        
                        var { vp_init
                                , vp_bindEventFunctions } = fileNavigation;
                            
                        fileNavigation.vp_init(that);
                        fileNavigation.vp_bindEventFunctions();
                    })
                    .appendTo("#site");
            });

            // click run
            $(document).on('click', this.wrapSelector('.' + VP_PDF_BUTTON_RUN), function(event) {
                that.apply(true, true);
                that.close();
            });

            // click detail button
            $(document).on('click', this.wrapSelector('.' + VP_PDF_BUTTON_DETAIL), function(evt) {
                evt.stopPropagation();
                $(that.wrapSelector('.' + VP_PDF_DETAIL_BOX)).show();
            });

            // click add / apply
            $(document).on('click', this.wrapSelector('.' + VP_PDF_DETAIL_ITEM), function() {
                var type = $(this).data('type');
                if (type == 'add') {
                    that.apply(true);
                    that.close();
                } else if (type == 'apply') {
                    that.apply();
                    that.close();
                }
            });

            // click preview
            $(document).on('click', this.wrapSelector('.' + VP_PDF_BUTTON_PREVIEW), function(evt) {
                // evt.stopPropagation();
                if (that.previewOpened) {
                    that.closePreview();
                } else {
                    that.openPreview();
                }
            });

            // click cancel
            $(document).on('click', this.wrapSelector('.' + VP_PDF_BUTTON_CANCEL), function(event) {
                that.close();
            });

            // click others
            $(document).on('click.' + this.uuid, function(evt) {
                if (!$(evt.target).hasClass(VP_PDF_BUTTON_DETAIL)) {
                    $(that.wrapSelector('.' + VP_PDF_DETAIL_BOX)).hide();
                }
                if (!$(evt.target).hasClass(VP_PDF_BUTTON_PREVIEW)
                    && !$(evt.target).hasClass(VP_PDF_PREVIEW_BOX)
                    && $(that.wrapSelector('.' + VP_PDF_PREVIEW_BOX)).has(evt.target).length === 0) {
                    that.closePreview();
                }
            });
        }

        apply(addCell=false, runCell=false) {
            var code = this.generateCode();

            // save state for block
            this.saveState();

            if (this.pageThis) {
                $(this.pageThis.wrapSelector('#' + this.targetId)).val(code);
                $(this.pageThis.wrapSelector('#' + this.targetId)).trigger({
                    type: 'apps_run',
                    title: 'PDF',
                    code: code,
                    state: this.state,
                    addCell: addCell,
                    runCell: runCell
                });
            } else {
                $(vpCommon.wrapSelector('#' + this.targetId)).val(code);
                $(vpCommon.wrapSelector('#' + this.targetId)).trigger({
                    type: 'apps_run',
                    title: 'PDF',
                    code: code,
                    state: this.state,
                    addCell: addCell,
                    runCell: runCell
                });
            }
        }

        /**
         * Open preview box
         */
        openPreview() {
            $(this.wrapSelector('.' + VP_PDF_PREVIEW_BOX)).show();

            if (!this.cmpreviewall) {
                // codemirror setting
                this.cmpreviewall = codemirror.fromTextArea($(this.wrapSelector('#vp_codePreview'))[0], {
                    mode: {
                        name: 'python',
                        version: 3,
                        singleLineStringErrors: false
                    },  // text-cell(markdown cell) set to 'htmlmixed'
                    height: '100%',
                    width: '100%',
                    indentUnit: 4,
                    matchBrackets: true,
                    readOnly:true,
                    autoRefresh: true,
                    theme: "ipython",
                    extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"},
                    scrollbarStyle: "null"
                });
            } else {
                this.cmpreviewall.refresh();
            }

            // get current code
            var code = this.generateCode();
            this.cmpreviewall.setValue(code);
            this.cmpreviewall.save();
            
            var that = this;
            setTimeout(function() {
                that.cmpreviewall.refresh();
            },1);
            
            this.previewOpened = true;
        }

        /**
         * Close preview box
         */
        closePreview() {
            this.previewOpened = false;
            $(this.wrapSelector('.' + VP_PDF_PREVIEW_BOX)).hide();
        }

        /**
         * Generate code
         * @returns generatedCode
         */
        generateCode() {
            var code = new sb.StringBuilder();

            var filePath = $(this.wrapSelector('.' + VP_PDF_FILEPATH)).val();
            var allocateTo = $(this.wrapSelector('#vp_pdfReturn')).val();
            
            // FIXME: change it after implementing filenavigation multi-select
            code.appendFormatLine("pdf_lst = ['{0}']", filePath);

            if (allocateTo && allocateTo != '') {
                code.appendFormat('{0} = ', allocateTo);
            }
            code.append('vp_pdf_get_sentence(pdf_lst)');

            if (allocateTo && allocateTo != '') {
                code.appendLine();
                code.append(allocateTo);
            }

            return code.toString();
        }
    }

    return PDF;

}); /* function, define */

/* End of file */
