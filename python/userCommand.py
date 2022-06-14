# This file is converted to the list of functions on InnerFuncViewer.js
# - Divider is 6 hashes(#).
# - First 2 items include description and import codes are ignored.
# - Refer to the code(/js/com/component/InnerFuncViewer.js)
######
# Import area
import pandas as _vp_pd
import numpy as _vp_np
import matplotlib.pyplot as _vp_plt
import fitz
import nltk
nltk.download('punkt')
######
# Visual Python: Data Analysis > PDF
######
def vp_pdf_get_sentence(fname_lst):
    """
    Get sentence from pdf file by PyMuPDF
    """
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
######
# Visual Python: Data Analysis > Frame
######
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
######
# Visual Python: Machine Learning > Model Info
######
def vp_create_feature_importances(model, X_train=None, sort=False):
    if isinstance(X_train, _vp_pd.core.frame.DataFrame):
        feature_names = X_train.columns
    else:
        feature_names = [ 'X{}'.format(i) for i in range(len(model.feature_importances_)) ]
                        
    df_i = _vp_pd.DataFrame(model.feature_importances_, index=feature_names, columns=['Feature_importance'])
    df_i['Percentage'] = 100 * (df_i['Feature_importance'] / df_i['Feature_importance'].max())
    if sort: df_i.sort_values(by='Feature_importance', ascending=False, inplace=True)
    df_i = df_i.round(2)
                        
    return df_i
######
# Visual Python: Machine Learning > Model Info
######
def vp_plot_feature_importances(model, X_train=None, sort=False):
    df_i = vp_create_feature_importances(model, X_train, sort)
                        
    if sort: df_i['Percentage'].sort_values().plot(kind='barh')
    else: df_i['Percentage'].plot(kind='barh')
    _vp_plt.xlabel('Feature importance Percentage')
    _vp_plt.ylabel('Features')
                        
    _vp_plt.show()