import pandas as _vp_pd
import numpy as _vp_np
import fitz
import nltk
nltk.download('punkt')

def vp_pdf_get_sentence(fname_lst):
    '''
    Get sentence from pdf file by PyMuPDF
    '''
    df = _vp_pd.DataFrame()
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
            
        df_doc = _vp_pd.DataFrame({
            'fname': fname.split('/')[-1],
            'sentence': sentence_lst
        })
        df = _vp_pd.concat([df,df_doc])
        
    return df.reset_index().drop('index', axis=1)

def vp_drop_outlier(df, col, weight=1.5):
    sr = df[col]
    
    q25 = _vp_np.percentile(sr.values, 25)
    q75 = _vp_np.percentile(sr.values, 75)
    
    iqr   = q75 - q25
    iqr_w = iqr * weight
    
    val_l = q25 - iqr_w
    val_h = q75 + iqr_w
    
    outlier_index = sr[(sr < val_l) | (sr > val_h)].index
    
    df_res = df.drop(outlier_index).copy()
    
    return df_res