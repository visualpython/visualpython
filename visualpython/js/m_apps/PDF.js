/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : PDF.js
 *    Author          : Black Logic
 *    Note            : Apps > PDF
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] PDF
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_apps/pdf.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_apps/pdf'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/FileNavigation'
], function(pdfHtml, pdfCss, com_String, com_interface, PopupComponent, FileNavigation) {

    const PDF_SHOW     = '!pip show PyMuPDF nltk'
    const PDF_INSTALL1 = '!pip install PyMuPDF'
    const PDF_INSTALL2 = '!pip install nltk'

    const PDF_IMPORT   = `import pandas as pd
import fitz
import nltk
nltk.download('punkt')`;

    const PDF_FUNC = `def vp_pdf_get_sentence(fname_lst):
    '''
    Get sentence from pdf file by PyMuPDF
    '''
    df = pd.DataFrame()
    for fname in fname_lst:
        if fname.split('.')[-1] != 'pdf': continue
        try:
            doc = fitz.open(fname)
            sentence_lst = []
            for page in doc:
                block_lst = page.get_text('blocks')
        
                text_lst = [block[4] for block in block_lst if block[6] == 0]
                text = '\\n'.join(text_lst)
        
                sentence_lst.extend([sentence for sentence in nltk.sent_tokenize(text)])
                
            doc.close()
        except Exception as e:
            print(e)
            continue
            
        df_doc = pd.DataFrame({
            'fname': fname.split('/')[-1],
            'sentence': sentence_lst
        })
        df = pd.concat([df,df_doc])
        
    return df.reset_index().drop('index', axis=1)`;

    const PDF_CMD = 'df = vp_pdf_get_sentence(pdf_lst)\ndf'
    /**
     * PDF
     */
    class PDF extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.installButton = true;
            this.config.importButton = true;
            this.config.dataview = false;
            this.config.size = { width: 500, height: 400 };
            this.config.checkModules = ['pd', 'fitz', 'nltk', 'vp_pdf_get_sentence'];

            this.state = {
                vp_pdfFile: '',
                vp_pdfReturn: '',
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;

            // click file navigation button
            $(this.wrapSelector('#vp_openFileNavigationBtn')).on('click', function() {
                let fileNavi = new FileNavigation({
                    type: 'open',
                    extensions: ['pdf'],
                    finish: function(filesPath, status, error) {
                        let pathList = filesPath.map(obj => obj.path);
                        let pathStr = "'" + pathList.join("', '") + "'";
                        $(that.wrapSelector('#vp_pdfFile')).val(pathStr);
                    }
                });
                fileNavi.open();
            });
        }

        templateForBody() {
            return pdfHtml;
        }

        loadState() {
            $(this.wrapSelector('#vp_pdfFile')).val(this.state.vp_pdfFile);
            $(this.wrapSelector('#vp_pdfReturn')).val(this.state.vp_pdfReturn);
        }

        render() {
            super.render();

            this.checkInstalled();
        }

        generateInstallCode() {
            return [
                PDF_INSTALL1,
                PDF_INSTALL2
            ];
        }

        generateImportCode() {
            return [
                PDF_IMPORT,
                PDF_FUNC
            ];
        }

        generateCode() {
            var code = new com_String();

            var filePath = $(this.wrapSelector('#vp_pdfFile')).val();
            var allocateTo = $(this.wrapSelector('#vp_pdfReturn')).val();
            
            // FIXME: change it after implementing filenavigation multi-select
            code.appendFormatLine("pdf_lst = [{0}]", filePath);

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

        checkInstalled() {
            var that = this;
            // set state as 'Checking'
            $(this.wrapSelector('.vp-pdf-install-btn')).text('Checking...');
            // set disabled
            if (!$(that.wrapSelector('.vp-pdf-install-btn')).hasClass('disabled')) {
                $(that.wrapSelector('.vp-pdf-install-btn')).addClass('disabled');
            }
            var checking = true;

            // check installed
            vpKernel.execute(PDF_SHOW).then(function(resultObj) {
                let { result, type, msg } = resultObj;
                if (!checking) {
                    return;
                }
                if (msg.content['text'].includes('not found')) {
                    checking = false;
                    $(that.wrapSelector('.vp-pdf-install-btn')).text('Install');
                    // set enabled
                    if ($(that.wrapSelector('.vp-pdf-install-btn')).hasClass('disabled')) {
                        $(that.wrapSelector('.vp-pdf-install-btn')).removeClass('disabled');
                    }
                } else {
                    $(that.wrapSelector('.vp-pdf-install-btn')).text('Installed');
                    // set disabled
                    if (!$(that.wrapSelector('.vp-pdf-install-btn')).hasClass('disabled')) {
                        $(that.wrapSelector('.vp-pdf-install-btn')).addClass('disabled');
                    }
                }
            }).catch(function(msg) {
                // if stderr occurs
                checking = false;
                $(that.wrapSelector('.vp-pdf-install-btn')).text('Install');
                // set enabled
                if ($(that.wrapSelector('.vp-pdf-install-btn')).hasClass('disabled')) {
                    $(that.wrapSelector('.vp-pdf-install-btn')).removeClass('disabled');
                }
            });
        }

    }

    return PDF;
});