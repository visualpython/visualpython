# This file is converted to the list of functions on InnerFuncViewer.js
# - Divider is 6 hashes(#).
# - First 2 items include description and import codes are ignored.
# - Refer to the code(/js/com/component/InnerFuncViewer.js)
######
# Import area
import pandas as _vp_pd
import numpy as _vp_np
import matplotlib.pyplot as _vp_plt
import scipy.stats as _vp_stats
import statsmodels.api as _vp_sm
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
def vp_fill_outlier(df, col_lst, fill_type='iqr', fill_value_lst=[], weight=1.5):
    dfr = df.copy()
    for idx, col in enumerate(col_lst):
        sr = dfr[col]
        q25 = _vp_np.percentile(sr.values, 25)
        q75 = _vp_np.percentile(sr.values, 75)
        iqr   = q75 - q25
        iqr_w = iqr * weight
        val_l = q25 - iqr_w
        val_h = q75 + iqr_w
        if fill_type == 'mean':
            f_val = sr[~((sr < val_l) | (sr > val_h))].mean()
        elif fill_type == 'median':
            f_val = sr[~((sr < val_l) | (sr > val_h))].median()
        elif fill_type == 'value':
            f_val = fill_value_lst[idx]
        elif fill_type == 'NA':
            f_val = _vp_np.nan
        if fill_type == 'iqr':
            dfr.loc[(sr < val_l), col] = val_l
            dfr.loc[(sr > val_h), col] = val_h
        else:
            dfr.loc[(sr < val_l) | (sr > val_h), col] = f_val
    return dfr
######
# Visual Python: Data Analysis > Frame
######
def vp_drop_outlier(df, col_lst, weight=1.5):
    dfr = df.copy()
    outlier_index_lst = []
    for idx, col in enumerate(col_lst):
        sr = dfr[col]
        q25 = _vp_np.percentile(sr.values, 25)
        q75 = _vp_np.percentile(sr.values, 75)
        iqr   = q75 - q25
        iqr_w = iqr * weight
        val_l = q25 - iqr_w
        val_h = q75 + iqr_w
        outlier_index_lst += sr[(sr < val_l) | (sr > val_h)].index.to_list()
    outlier_index_lst = list(set(outlier_index_lst))
    dfr.drop(outlier_index_lst, inplace=True)
    return dfr
######
# Visual Python: Machine Learning > Model Info
######
def vp_create_feature_importances(model, X_train=None, sort=False):
    if isinstance(X_train, _vp_pd.core.frame.DataFrame):
        feature_names = X_train.columns
    else:
        feature_names = [ 'X{}'.format(i) for i in range(len(model.feature_importances_)) ]
                        
    df_i = _vp_pd.DataFrame(model.feature_importances_, index=feature_names, columns=['Feature_importance'])
    df_i['Percentage'] = 100 * df_i['Feature_importance']
    if sort: df_i.sort_values(by='Feature_importance', ascending=False, inplace=True)
    df_i = df_i.round(2)
                        
    return df_i
######
# Visual Python: Machine Learning > Model Info
######
def vp_plot_feature_importances(model, X_train=None, sort=False, top_count=0):
    df_i = vp_create_feature_importances(model, X_train, sort)
                        
    if sort: 
        if top_count > 0:
            df_i['Percentage'].sort_values().tail(top_count).plot(kind='barh')
        else:
            df_i['Percentage'].sort_values().plot(kind='barh')
    else: 
        df_i['Percentage'].plot(kind='barh')
    _vp_plt.xlabel('Feature importance Percentage')
    _vp_plt.ylabel('Features')
                        
    _vp_plt.show()
######
# Visual Python: Machine Learning > Model Info
######
def vp_create_permutation_importances(model, X_train, y_train, scoring=None, sort=False):
    from sklearn.inspection import permutation_importance
    if isinstance(X_train, _vp_pd.core.frame.DataFrame):
        feature_names = X_train.columns
    else:
        feature_names = [ 'X{}'.format(i) for i in range(X_train.shape[1]) ]
                        
    imp = permutation_importance(model, X_train, y_train, scoring=scoring)

    df_i = _vp_pd.DataFrame(imp['importances_mean'], index=feature_names, columns=['Feature_importance'])
    df_i['Percentage'] = 100 * df_i['Feature_importance']
    if sort: df_i.sort_values(by='Feature_importance', ascending=False, inplace=True)
    df_i = df_i.round(2)
                        
    return df_i
######
# Visual Python: Machine Learning > Model Info
######
def vp_plot_permutation_importances(model, X_train, y_train, scoring=None, sort=False, top_count=0):
    df_i = vp_create_permutation_importances(model, X_train, y_train, scoring=scoring, sort=sort)
                        
    if sort: 
        if top_count > 0:
            df_i['Percentage'].sort_values().tail(top_count).plot(kind='barh')
        else:
            df_i['Percentage'].sort_values().plot(kind='barh')
    else: 
        df_i['Percentage'].plot(kind='barh')
    _vp_plt.xlabel('Feature importance Percentage')
    _vp_plt.ylabel('Features')
                        
    _vp_plt.show()
######
# Visual Python: Visualization > Seaborn
######
def vp_seaborn_show_values(axs, precision=1, space=0.01):
    pstr = '{:.' + str(precision) + 'f}'
    
    def _single(ax):
        # check orient
        orient = 'v'
        if len(ax.patches) == 1:
            # check if 0
            if ax.patches[0].get_x() == 0:
                orient = 'h'
        else:
            # compare 0, 1 patches
            p0 = ax.patches[0]
            p1 = ax.patches[1]
            if p0.get_x() == p1.get_x():
                orient = 'h'
                
        if orient == 'v':
            for p in ax.patches:
                _x = p.get_x() + p.get_width() / 2
                _y = p.get_y() + p.get_height() + (p.get_height()*space)
                if not _vp_np.isnan(_x) and not _vp_np.isnan(_y):
                    value = pstr.format(p.get_height())
                    ax.text(_x, _y, value, ha='center') 
        elif orient == 'h':
            for p in ax.patches:
                _x = p.get_x() + p.get_width() + (space - 0.01)
                _y = p.get_y() + p.get_height() / 2
                if not _vp_np.isnan(_x) and not _vp_np.isnan(_y):
                    value = pstr.format(p.get_width())
                    ax.text(_x, _y, value, ha='left')

    if isinstance(axs, _vp_np.ndarray):
        for idx, ax in _vp_np.ndenumerate(axs):
            _single(ax)
    else:
        _single(axs)
######
# Visual Python: Statistics > Correlation Analysis
######
def vp_confidence_interval_corr(x, y, method='pearson', alpha=0.05):
    try: x=_vp_pd.Series(x); y=_vp_pd.Series(y)
    except: return _vp_np.nan

    corr_func = {'pearson':_vp_stats.pearsonr,'spearman':_vp_stats.spearmanr,'kendall':_vp_stats.kendalltau}
    se_diff   = {'pearson':3,'spearman':3,'kendall':4}
    se_func   = {'pearson': lambda corr: 1,
                 'spearman':lambda corr: 1 + corr ** 2 / 2.,
                 'kendall': lambda corr: .437 }
                     
    corr, pvalue = corr_func[method](x,y)
    
    z  = _vp_np.log((1 + corr) / (1 - corr)) / 2
    se = _vp_np.sqrt(se_func[method](corr) / (x.size - se_diff[method]))
    
    z_lower = z - _vp_stats.norm.ppf(1 - alpha / 2.) * se
    z_upper = z + _vp_stats.norm.ppf(1 - alpha / 2.) * se
    
    corr_lower = (_vp_np.exp(2 * z_lower) - 1) / (_vp_np.exp(2 * z_lower) + 1)
    corr_upper = (_vp_np.exp(2 * z_upper) - 1) / (_vp_np.exp(2 * z_upper) + 1)    
    
    return corr, pvalue, corr_lower, corr_upper
######
# Visual Python: Statistics > Reliability Analysis
######
def vp_cronbach_alpha(data):
    _corr = data.corr()
    _N = data.shape[1]
    _rs = _vp_np.array([])
    for i, col in enumerate(_corr.columns):
        _sum = _corr[col][i+1:].values
        _rs  = _vp_np.append(_sum, _rs)
    _mean = _vp_np.mean(_rs)
    
    return (_N*_mean)/(1+(_N-1)*_mean)
######
# Visual Python: Statistics > ANOVA
######
def vp_confidence_interval(var, confidence_level=0.95):
    try: sr = _vp_pd.Series(var)
    except: return _vp_np.nan
    return _vp_stats.t.interval(confidence_level, df=sr.count()-1, loc=sr.mean(), scale=sr.std() / _vp_np.sqrt(sr.count()) )
######
# Visual Python: Statistics > ANOVA
######
def vp_sem(var):
    try: sr = _vp_pd.Series(var)
    except: return _vp_np.nan
    return sr.std() / _vp_np.sqrt(sr.count())
######
# Visual Python: Statistics > Regression - Multiple linear regression > Method: Stepwise
######
def vp_stepwise_select(df_x, df_y, alpha=0.05):
    select_list = list()
    while len(df_x.columns) > 0:
        col_list = list(set(df_x.columns)-set(select_list))
        sr_pval = _vp_pd.Series(index=col_list)
        for col in col_list:
            result = _vp_sm.OLS(df_y, _vp_sm.add_constant(df_x[select_list+[col]])).fit()
            sr_pval[col] = result.pvalues[col]
        best_pval = sr_pval.min()
        if best_pval < alpha:
            select_list.append(sr_pval.idxmin())
            while len(select_list) > 0:
                result = _vp_sm.OLS(df_y, _vp_sm.add_constant(df_x[select_list])).fit()
                sr_pval2 = result.pvalues.iloc[1:]
                worst_pval = sr_pval2.max()
                if worst_pval > alpha:
                    select_list.remove(sr_pval2.idxmax())
                else:
                    break
        else:
            break
    return select_list
######
# Visual Python: Statistics > Regression - Multiple linear regression > Method: Backward
######
def vp_backward_select(df_x, df_y, alpha=0.05):
    select_list=list(df_x.columns)
    while True:
        result = _vp_sm.OLS(df_y, _vp_sm.add_constant(_vp_pd.DataFrame(df_x[select_list]))).fit()
        sr_pval = result.pvalues.iloc[1:]
        worst_pval = sr_pval.max()
        if worst_pval > alpha:
            select_list.remove(sr_pval.idxmax())
        else:
            break
    return select_list
######
# Visual Python: Statistics > Regression - Multiple linear regression > Method: Forward
######
def vp_forward_select(df_x, df_y, alpha=0.05):
    select_list = list()
    while True:
        col_list = list(set(df_x.columns)-set(select_list))
        sr_pval = _vp_pd.Series(index=col_list)
        for col in col_list:
            result = _vp_sm.OLS(df_y, _vp_sm.add_constant(_vp_pd.DataFrame(df_x[select_list+[col]]))).fit()
            sr_pval[col] = result.pvalues[col]
        best_pval = sr_pval.min()
        if best_pval < alpha:
            select_list.append(sr_pval.idxmin())
        else:
            break
            
    return select_list
######
# Visual Python: Statistics > Regression - Mediated linear regression
######
def vp_sobel(a, b, sea, seb):
    z = (a * b) / ( (a**2)*(seb**2) + (b**2)*(sea**2) )**0.5
    one_pvalue = _vp_stats.norm.sf(abs(z))
    two_pvalue = _vp_stats.norm.sf(abs(z))*2
    return z, one_pvalue, two_pvalue