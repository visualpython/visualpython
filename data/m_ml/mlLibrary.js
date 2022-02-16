define([
], function () {
    /**
     * name
     * library
     * description
     * code
     * options: [
     *      {
     *          name
     *          label
     *          [optional]
     *          component : 
     *              - 1darr / 2darr / ndarr / scalar / param / dtype / tabblock
     *          default
     *          required
     *          usePair
     *          code
     *      }
     * ]
     */
    var ML_LIBRARIES = {
        /** Regression */
        'ln-rgs': {
            name: 'LinearRegression',
            import: 'from sklearn.linear_model import LinearRegression',
            code: 'LinearRegression(${fit_intercept})',
            options: [
                { name: 'fit_intercept', component: ['bool_select'], default: 'True', usePair: true }
            ]
        },
        'sv-rgs': {
            name: 'SVR',
            import: 'from sklearn.svm import SVR',
            code: 'SVR(${C}${kernel}${gamma}${random_state}${etc})',
            options: [
                { name: 'C', component: ['input_number'], placeholder: '1.0', usePair: true },
                { name: 'kernel', component: ['option_select'], default: 'rbf', type:'text', usePair: true,
                    options: ['linear', 'poly', 'rbf', 'sigmoid', 'precomputed'] },
                { name: 'gamma', component: ['option_suggest'], default: 'scale', type:'text', usePair: true,
                    options: ['scale', 'auto'] },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'dt-rgs': {
            name: 'DecisionTreeRegressor',
            import: 'from sklearn.tree import DecisionTreeRegressor',
            code: 'DecisionTreeRegressor(${criterion}${max_depth}${min_samples_split}${random_state}${etc})',
            options: [
                { name: 'criterion', component: ['option_select'], default: 'squared_error', type:'text',
                    options: ['squared_error', 'friedman_mse', 'absolute_error', 'poisson'] },
                { name: 'max_depth', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'min_samples_split', component: ['input_number'], default: 2, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'rf-rgs': {
            name: 'RandomForestRegressor',
            import: 'from sklearn.ensemble import RandomForestRegressor',
            code: 'RandomForestRegressor(${n_estimators}${criterion}${max_depth}${min_samples_split}${n_jobs}${random_state}${etc})',
            options: [
                { name: 'n_estimators', component: ['input_number'], default: 100, usePair: true },
                { name: 'criterion', component: ['option_select'], default: 'squared_error', type:'text', usePair: true,
                    options: ['squared_error', 'absolute_error', 'poisson'] },
                { name: 'max_depth', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'min_samples_split', component: ['input_number'], default: 2, usePair: true },
                { name: 'n_jobs', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'gbm-rgs': {
            name: 'GradientBoostingRegressor',
            import: 'from sklearn.ensemble import GradientBoostingRegressor',
            code: 'GradientBoostingRegressor(${loss}${learning_rate}${n_estimators}${criterion}${random_state}${etc})',
            options: [
                { name: 'loss', component: ['option_select'], default: 'squared_error', type:'text', usePair: true,
                    options: ['squared_error', 'absolute_error', 'huber', 'quantile'] },
                { name: 'learning_rate', component: ['input_number'], default: 0.1, usePair: true },
                { name: 'n_estimators', component: ['input_number'], default: 100, usePair: true },
                { name: 'criterion', component: ['option_select'], default: 'friedman_mse', type:'text', usePair: true,
                    options: ['friedman_mse', 'squared_error', 'mse', 'mae'] },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'xgb-rgs': {
            name: 'XGBRegressor',
            install: '!pip install xgboost',
            import: 'from xgboost import XGBRegressor',
            code: 'XGBRegressor(${n_estimators}${max_depth}${learning_rate}${gamma}${random_state}${etc})',
            options: [
                { name: 'n_estimators', component: ['input_number'], default: 100, usePair: true },
                { name: 'max_depth', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'learning_rate', component: ['input_number'], placeholder: 0.1, usePair: true },
                { name: 'gamma', component: ['input_number'], placeholder: 0.1, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'lgbm-rgs': {
            name: 'LGBMRegressor',
            install: '!pip install lightgbm',
            import: 'from lightgbm import LGBMRegressor',
            code: 'LGBMRegressor(${boosting_type}${max_depth}${learning_rate}${n_estimators}${random_state}${etc})',
            options: [
                { name: 'boosting_type', component: ['option_select'], default: 'gbdt', type: 'text', usePair: true,
                    options: ['gbdt', 'dart', 'goss', 'rf']},
                { name: 'max_depth', component: ['input_number'], placeholder: '-1', usePair: true },
                { name: 'learning_rate', component: ['input_number'], default: 0.1, usePair: true },
                { name: 'n_estimators', component: ['input_number'], default: 100, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },  
        'cb-rgs': {
            name: 'CatBoostRegressor',
            install: '!pip install catboost',
            import: 'from catboost import CatBoostRegressor',
            code: 'CatBoostRegressor(${learning_rate}${loss_function}${task_type}${max_depth}${n_estimators}${random_state}${etc})',
            options: [
                { name: 'learning_rate', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'loss_function', component: ['option_select'], default: 'RMSE', type:'text', usePair: true,
                    options: ['RMSE', 'absolute_error', 'huber', 'quantile'] },
                { name: 'task_type', component: ['option_select'], default: 'CPU', usePair: true,
                    options: ['CPU', 'GPU'] },
                { name: 'max_depth', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'n_estimators', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        /** Classification */
        'lg-rgs': {
            name: 'LogisticRegression',
            import: 'from sklearn.linear_model import LogisticRegression',
            code: 'LogisticRegression(${penalty}${C}${random_state}${etc})',
            options: [
                { name: 'penalty', component: ['option_select'], default: 'l2', usePair: true, options: ['l1', 'l2', 'elasticnet', 'none']},
                { name: 'C', component: ['input_number'], placeholder: '1.0', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'sv-clf': {
            name: 'SupportVectorClassifier',
            import: 'from sklearn.svm import SVC',
            code: 'SVC(${C}${kernel}${gamma}${random_state}${etc})',
            options: [
                { name: 'C', component: ['input_number'], placeholder: '1.0', usePair: true },
                { name: 'kernel', component: ['option_select'], usePair: true, 
                    options: ['linear', 'poly', 'rbf', 'sigmoid', 'precomputed'], default: 'rbf' },
                { name: 'gamma', component: ['option_suggest'], usePair: true, 
                    options: ['scale', 'auto'], default: 'scale' },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'dt-clf': {
            name: 'DecisionTreeClassifier',
            import: 'from sklearn.tree import DecisionTreeClassifier',
            code: 'DecisionTreeClassifier(${criterion}${max_depth}${min_samples_split}${random_state}${etc})',
            options: [
                { name: 'criterion', component: ['option_select'], default: 'squared_error', type:'text',
                    options: ['squared_error', 'friedman_mse', 'absolute_error', 'poisson'], usePair: true },
                { name: 'max_depth', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'min_samples_split', component: ['input_number'], default: 2, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'rf-clf': {
            name: 'RandomForestClassifier',
            import: 'from sklearn.ensemble import RandomForestClassifier',
            code: 'RandomForestClassifier(${n_estimators}${criterion}${max_depth}${min_samples_split}${n_jobs}${random_state}${etc})',
            options: [
                { name: 'n_estimators', component: ['input_number'], default: 100, usePair: true },
                { name: 'criterion', component: ['option_select'], default: 'gini', type:'text', usePair: true,
                    options: ['gini', 'entropy'] },
                { name: 'max_depth', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'min_samples_split', component: ['input_number'], default: 2, usePair: true },
                { name: 'n_jobs', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'gbm-clf': {
            name: 'GradientBoostingClassifier',
            import: 'from sklearn.ensemble import GradientBoostingClassifier',
            code: 'GradientBoostingClassifier(${loss}${learning_rate}${n_estimators}${criterion}${random_state}${etc})',
            options: [
                { name: 'loss', component: ['option_select'], default: 'deviance', type: 'text', usePair: true,
                    options: ['deviance', 'exponential'] },
                { name: 'learning_rate', component: ['input_number'], default: 0.1, usePair: true },
                { name: 'n_estimators', component: ['input_number'], default: 100, usePair: true },
                { name: 'criterion', component: ['option_select'], default: 'friedman_mse', type:'text', usePair: true,
                    options: ['friedman_mse', 'squared_error', 'mse', 'mae'] },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'xgb-clf': {
            name: 'XGBClassifier',
            install: '!pip install xgboost',
            import: 'from xgboost import XGBClassifier',
            code: 'XGBClassifier(${n_estimators}${max_depth}${learning_rate}${gamma}${random_state}${etc})',
            options: [
                { name: 'n_estimators', component: ['input_number'], default: 100, usePair: true },
                { name: 'max_depth', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'learning_rate', component: ['input_number'], placeholder: 0.1, usePair: true },
                { name: 'gamma', component: ['input_number'], placeholder: 0.1, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'lgbm-clf': {
            name: 'LGBMClassifier',
            install: '!pip install lightgbm',
            import: 'from lightgbm import LGBMClassifier',
            code: 'LGBMClassifier(${boosting_type}${max_depth}${learning_rate}${n_estimators}${random_state}${etc})',
            options: [
                { name: 'boosting_type', component: ['option_select'], default: 'gbdt', type: 'text', usePair: true,
                    options: ['gbdt', 'dart', 'goss', 'rf']},
                { name: 'max_depth', component: ['input_number'], placeholder: '-1', usePair: true },
                { name: 'learning_rate', component: ['input_number'], default: 0.1, usePair: true },
                { name: 'n_estimators', component: ['input_number'], default: 100, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },  
        'cb-clf': {
            name: 'CatBoostClassifier',
            install: '!pip install catboost',
            import: 'from catboost import CatBoostClassifier',
            code: 'CatBoostClassifier(${learning_rate}${loss_function}${task_type}${max_depth}${n_estimators}${random_state}${etc})',
            options: [
                { name: 'learning_rate', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'loss_function', component: ['option_select'], default: 'RMSE', type:'text', usePair: true,
                    options: ['RMSE', 'absolute_error', 'huber', 'quantile'] },
                { name: 'task_type', component: ['option_select'], default: 'CPU', usePair: true,
                    options: ['CPU', 'GPU'] },
                { name: 'max_depth', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'n_estimators', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        /** Auto ML */
        'tpot-rgs': {
            name: 'TPOTRegressor',
            import: 'from tpot import TPOTRegressor',
            code: 'TPOTRegressor(...${etc})',
            options: [

            ]
        },
        'tpot-clf': {
            name: 'TPOTClassifier',
            import: 'from tpot import TPOTClassifier',
            code: 'TPOTClassifier(...${etc})',
            options: [
                
            ]
        },
        /** Clustering */
        'k-means': {
            name: 'KMeans',
            import: 'from sklearn.cluster import KMeans',
            code: 'KMeans(${n_clusters}${random_state}${etc})',
            options: [
                { name: 'n_clusters', component: ['input_number'], default: 8, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'agg-cls': {
            name: 'AgglomerativeClustering',
            import: 'from sklearn.cluster import AgglomerativeClustering',
            code: 'AgglomerativeClustering(${n_clusters}${random_state}${etc})',
            options: [
                { name: 'n_clusters', component: ['input_number'], default: 2, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'gaus-mix': {
            name: 'GaussianMixture',
            import: 'from sklearn.mixture import GaussianMixture',
            code: 'GaussianMixture(${n_components}${random_state}${etc})',
            options: [
                { name: 'n_components', component: ['input_number'], default: 1, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'dbscan': {
            name: 'DBSCAN',
            import: 'from sklearn.cluster import DBSCAN',
            code: 'DBSCAN(${eps}${min_samples}${etc})',
            options: [
                { name: 'eps', component: ['input_number'], default: 0.5, usePair: true },
                { name: 'min_samples', component: ['input_number'], default: 5, usePair: true }
            ]
        },
        /** Dimension Reduction */
        'pca': {
            name: 'Principal Component Analysis',
            import: 'from sklearn.decomposition import PCA',
            code: 'PCA(${n_components}${random_state}${etc})',
            options: [
                { name: 'n_components', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'lda': {
            name: 'Linear Discriminant Analysis',
            import: 'from sklearn.discriminant_analysis import LinearDiscriminantAnalysis',
            code: 'LinearDiscriminantAnalysis(${n_components}${etc})',
            options: [
                { name: 'n_components', component: ['input_number'], placeholder: 'None', usePair: true }
            ]
        },
        'svd': {
            name: 'Truncated SVD',
            import: 'from sklearn.decomposition import TruncatedSVD',
            code: 'TruncatedSVD(${n_components}${random_state}${etc})',
            options: [
                { name: 'n_components', component: ['input_number'], default: 2, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'nmf': {
            name: 'Non-Negative Matrix Factorization',
            import: 'from sklearn.decomposition import NMF',
            code: 'NMF(${n_components}${random_state}${etc})',
            options: [
                { name: 'n_components', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        }
    }

    return ML_LIBRARIES;
});