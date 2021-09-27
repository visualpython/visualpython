/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : pycode.js
 *    Author          : Black Logic
 *    Note            : Define constant value
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 08. 14
 *    Change Date     :
 */

//============================================================================
// Define constant
//============================================================================
define ([
], function() {
    'use strict';

    //========================================================================
    // vpPDF
    //========================================================================
    const PDF_SHOW     = '!pip show PyMuPDF nltk'
    const PDF_INSTALL1 = '!pip install PyMuPDF'
    const PDF_INSTALL2 = '!pip install nltk'

    const PDF_IMPORT   = `import pandas as pd
import fitz
from nltk.tokenize import sent_tokenize`;

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
                block_lst = page.getText('blocks')
        
                text_lst = [block[4] for block in block_lst if block[6] == 0]
                text = '\\n'.join(text_lst)
        
                sentence_lst.extend([sentence for sentence in sent_tokenize(text)])
                
            doc.close()
        except:
            continue
            
        df_doc = pd.DataFrame({
            'fname': fname,
            'sentence': sentence_lst
        })
        df = pd.concat([df,df_doc])
        
    return df.reset_index().drop('index', axis=1)`;

    const PDF_CMD = 'df = vp_pdf_get_sentence(pdf_lst)\ndf'



    //========================================================================
    // return value
    //========================================================================
    return {
        PDF_SHOW,
        PDF_INSTALL1,
        PDF_INSTALL2,
        PDF_IMPORT,
        PDF_FUNC,
        PDF_CMD
    };

}); /* function, define */

/* End of file */

