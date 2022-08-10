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
        /** Data Sets */
        'load_boston': {
            name: 'load_boston',
            import: 'from sklearn.datasets import load_boston',
            code: 'load_boston()',
            options: [

            ]
        },
        'load_iris': {
            name: 'load_iris',
            import: 'from sklearn.datasets import load_iris',
            code: 'load_iris()',
            options: [

            ]
        },
        'load_diabetes': {
            name: 'load_diabetes',
            import: 'from sklearn.datasets import load_diabetes',
            code: 'load_diabetes()',
            options: [

            ]
        },
        'load_digits': {
            name: 'load_digits',
            import: 'from sklearn.datasets import load_digits',
            code: 'load_digits(${n_class})',
            options: [
                { name: 'n_class', component: ['input_number'], default: 10, usePair: true },
            ]
        },
        'load_linnerud': {
            name: 'load_linnerud',
            import: 'from sklearn.datasets import load_linnerud',
            code: 'load_linnerud()',
            options: [

            ]
        },
        'load_wine': {
            name: 'load_wine',
            import: 'from sklearn.datasets import load_wine',
            code: 'load_wine()',
            options: [

            ]
        },
        'load_breast_cancer': {
            name: 'load_breast_cancer',
            import: 'from sklearn.datasets import load_breast_cancer',
            code: 'load_breast_cancer()',
            options: [

            ]
        },
        'make_classification': {
            name: 'make_classification',
            import: 'from sklearn.datasets import make_classification',
            code: 'make_classification(${n_samples}${n_features}${n_repeated}${n_classes}${shuffle}${random_state}${etc})',
            options: [
                { name: 'n_samples', component: ['input_number'], default: 100, usePair: true },
                { name: 'n_features', component: ['input_number'], default: 20, usePair: true },
                { name: 'n_repeated', component: ['input_number'], default: 0, usePair: true },
                { name: 'n_classes', component: ['input_number'], default: 2, usePair: true },
                { name: 'shuffle', component: ['bool_select'], default: 'True', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'make_blobs': {
            name: 'make_blobs',
            import: 'from sklearn.datasets import make_blobs',
            code: 'make_blobs(${n_samples}${n_features}${shuffle}${random_state}${etc})',
            options: [
                { name: 'n_samples', component: ['input_number'], default: 100, usePair: true },
                { name: 'n_features', component: ['input_number'], default: 20, usePair: true },
                { name: 'shuffle', component: ['bool_select'], default: 'True', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'make_circles': {
            name: 'make_circles',
            import: 'from sklearn.datasets import make_circles',
            code: 'make_circles(${n_samples}${shuffle}${noise}${random_state}${factor}${etc})',
            options: [
                { name: 'n_samples', component: ['input_number'], default: 100, usePair: true },
                { name: 'shuffle', component: ['bool_select'], default: 'True', usePair: true },
                { name: 'noise', component: ['input_number'], usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true },
                { name: 'factor', component: ['input_number'], default: 0.8, usePair: true }
            ]
        },
        'make_moons': {
            name: 'make_moons',
            import: 'from sklearn.datasets import make_moons',
            code: 'make_moons(${n_samples}${shuffle}${noise}${random_state}${etc})',
            options: [
                { name: 'n_samples', component: ['input_number'], default: 100, usePair: true },
                { name: 'shuffle', component: ['bool_select'], default: 'True', usePair: true },
                { name: 'noise', component: ['input_number'], usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        /** Data Preparation - Encoding */
        'prep-onehot': {
            name: 'OneHotEncoder',
            import: 'from sklearn.preprocessing import OneHotEncoder',
            code: 'OneHotEncoder(${sparse}${handle_unknown}${etc})',
            options: [
                { name: 'sparse', component: ['bool_select'], default: 'False', usePair: true },
                { name: 'handle_unknown', component: ['option_suggest'], usePair: true, 
                    options: ['error', 'ignore'], default: 'error' },
            ]
        },
        'prep-label': {
            name: 'LabelEncoder',
            import: 'from sklearn.preprocessing import LabelEncoder',
            code: 'LabelEncoder()',
            options: [
                
            ]
        },
        'prep-ordinal': {
            name: 'OrdinalEncoder',
            import: 'from sklearn.preprocessing import OrdinalEncoder',
            code: 'OrdinalEncoder(${handle_unknown}${unknown_values}${etc})',
            options: [
                { name: 'handle_unknown', component: ['option_suggest'], usePair: true, 
                    options: ['error', 'use_encoded_value'], default: 'error' },
                { name: 'unknown_values', component: ['input'], usePair: true }
            ]
        },
        'prep-target': {
            name: 'TargetEncoder',
            install: '!pip install category_encoders',
            import: 'from category_encoders.target_encoder import TargetEncoder',
            code: 'TargetEncoder(${cols}${handle_missing}${handle_unknown}${smoothing}${etc})',
            options: [
                { name: 'cols', component: ['var_suggest', '1darr'], usePair: true },
                { name: 'handle_missing', component: ['option_suggest'], usePair: true,
                    options: ['error', 'return_nan', 'value'], default: 'value' },
                { name: 'handle_unknown', component: ['option_suggest'], usePair: true,
                    options: ['error', 'return_nan', 'value'], default: 'value' },
                { name: 'smoothing', component: ['input_number'], default: 1.0, usePair: true }
            ]
        },
        'prep-smote': {
            name: 'SMOTE',
            install: '!pip install imblearn',
            import: 'from imblearn.over_sampling import SMOTE',
            code: 'SMOTE(${random_state}${k_neighbors}${etc})',
            options: [
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true },
                { name: 'k_neighbors', component: ['input_number'], default: 5, usePair: true }
            ]
        },
        /** Data Preparation - Scaling */
        'prep-standard': {
            name: 'StandardScaler',
            import: 'from sklearn.preprocessing import StandardScaler',
            code: 'StandardScaler(${with_mean}${with_std}${etc})',
            options: [
                { name: 'with_mean', component: ['bool_select'], default: 'True', usePair: true },
                { name: 'with_std', component: ['bool_select'], default: 'True', usePair: true }
            ]
        },
        'prep-robust': {
            name: 'RobustScaler',
            import: 'from sklearn.preprocessing import RobustScaler',
            code: 'RobustScaler(${with_centering}${with_scaling}${etc})',
            options: [
                { name: 'with_centering', component: ['bool_select'], default: 'True', usePair: true },
                { name: 'with_scaling', component: ['bool_select'], default: 'True', usePair: true }
            ]
        },
        'prep-minmax': {
            name: 'MinMaxScaler',
            import: 'from sklearn.preprocessing import MinMaxScaler',
            code: 'MinMaxScaler(${feature_range}${etc})',
            options: [
                { name: 'feature_range', component: ['input'], placeholder: '(min, max)', default: '(0, 1)', usePair: true }
            ]
        },
        'prep-normalizer': {
            name: 'Normalizer',
            import: 'from sklearn.preprocessing import Normalizer',
            code: 'Normalizer(${norm}${etc})',
            options: [
                { name: 'norm', component: ['option_suggest'], usePair: true,
                    options: ['l1', 'l2', 'max'], default: 'l2' },
            ]
        },
        'prep-func-trsfrm-log': {
            name: 'Log Scaling',
            import: 'from sklearn.preprocessing import FunctionTransformer',
            code: 'FunctionTransformer(np.log1p${etc})',
            options: [

            ]
        },
        'prep-func-trsfrm-exp': {
            name: 'Exponential Scaling',
            import: 'from sklearn.preprocessing import FunctionTransformer',
            code: 'FunctionTransformer(np.expm1${etc})',
            options: [

            ]
        },
        'prep-poly-feat': {
            name: 'Polynomial Features',
            import: 'from sklearn.preprocessing import PolynomialFeatures',
            code: 'PolynomialFeatures(${etc})',
            options: [

            ]
        },
        'prep-kbins-discretizer': {
            name: 'KBins Discretizer',
            import: 'from sklearn.preprocessing import KBinsDiscretizer',
            code: 'KBinsDiscretizer(${n_bins}${strategy}${encode}${etc})',
            options: [
                { name: 'n_bins', component: ['input_number'], default: 5, usePair: true },
                { name: 'strategy', component: ['option_select'], type: 'text', default: 'quantile', usePair: true,
                    options: ['uniform', 'quantiile', 'kmeans'] },
                { name: 'encode', component: ['option_select'], type: 'text', default: 'onehot', usePair: true,
                    options: ['onehot', 'onehot-dense', 'ordinal'] }
            ]
        },
        'make-column-transformer': {
            name: 'MakeColumnTransformer',
            import: 'from sklearn.compose import make_column_transformer',
            code: 'make_column_transformer(${mct_code})',
            options: [

            ]
        },
        /** Regression */
        'ln-rgs': {
            name: 'LinearRegression',
            import: 'from sklearn.linear_model import LinearRegression',
            code: 'LinearRegression(${fit_intercept}${etc})',
            options: [
                { name: 'fit_intercept', component: ['bool_select'], default: 'True', usePair: true }
            ]
        },
        'ridge': {
            name: 'Ridge',
            import: 'from sklearn.linear_model import Ridge',
            code: 'Ridge(${alpha}${etc})',
            options: [
                { name: 'alpha', component: ['input_number'], default: 1.0, usePair: true }
            ]
        },
        'lasso': {
            name: 'Lasso',
            import: 'from sklearn.linear_model import Lasso',
            code: 'Lasso(${alpha}${etc})',
            options: [
                { name: 'alpha', component: ['input_number'], default: 1.0, usePair: true }
            ]
        },
        'elasticnet': {
            name: 'ElasticNet',
            import: 'from sklearn.linear_model import ElasticNet',
            code: 'ElasticNet(${alpha}${l1_ratio}${etc})',
            options: [
                { name: 'alpha', component: ['input_number'], default: 1.0, usePair: true },
                { name: 'l1_ratio', component: ['input_number'], default: 0.5, usePair: true }
            ]
        },
        'sv-rgs': {
            name: 'SVR',
            import: 'from sklearn.svm import SVR',
            code: 'SVR(${C}${kernel}${degree}${gamma}${coef0}${random_state}${etc})',
            options: [
                { name: 'C', component: ['input_number'], placeholder: '1.0', usePair: true, step: 0.1, min: 0 },
                { name: 'kernel', component: ['option_select'], type: 'text', usePair: true, 
                    options: ['linear', 'poly', 'rbf', 'sigmoid', 'precomputed'], default: 'rbf' },
                { name: 'degree', component: ['input_number'], placeholder: '3', usePair: true },
                { name: 'gamma', component: ['option_suggest'], usePair: true,
                    options: ["'scale'", "'auto'"], default: "'scale'" },
                { name: 'coef0', component: ['input_number'], placeholder: '0.0', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'dt-rgs': {
            name: 'DecisionTreeRegressor',
            import: 'from sklearn.tree import DecisionTreeRegressor',
            code: 'DecisionTreeRegressor(${criterion}${max_depth}${min_samples_split}${random_state}${etc})',
            options: [
                { name: 'criterion', component: ['option_select'], type: 'text', default: 'squared_error', type:'text',
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
                { name: 'criterion', component: ['option_select'], type: 'text', default: 'squared_error', type:'text', usePair: true,
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
                { name: 'loss', component: ['option_select'], type: 'text', default: 'squared_error', type:'text', usePair: true,
                    options: ['squared_error', 'absolute_error', 'huber', 'quantile'] },
                { name: 'learning_rate', component: ['input_number'], default: 0.1, usePair: true },
                { name: 'n_estimators', component: ['input_number'], default: 100, usePair: true },
                { name: 'criterion', component: ['option_select'], type: 'text', default: 'friedman_mse', type:'text', usePair: true,
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
                { name: 'boosting_type', component: ['option_select'], type: 'text', default: 'gbdt', type: 'text', usePair: true,
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
                { name: 'loss_function', component: ['option_select'], type: 'text', default: 'RMSE', type:'text', usePair: true,
                    options: ['RMSE', 'absolute_error', 'huber', 'quantile'] },
                { name: 'task_type', component: ['option_select'], type: 'text', default: 'CPU', usePair: true,
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
                { name: 'penalty', component: ['option_select'], type: 'text', default: 'l2', usePair: true, options: ['l1', 'l2', 'elasticnet', 'none']},
                { name: 'C', component: ['input_number'], placeholder: '1.0', usePair: true, step: 0.1, min: 0 },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'bern-nb': {
            name: 'BernoulliNB',
            import: 'from sklearn.naive_bayes import BernoulliNB',
            code: 'BernoulliNB(${etc})',
            options: [
                //TODO:
            ]
        },
        'mulnom-nb': {
            name: 'MultinomialNB',
            import: 'from sklearn.naive_bayes import MultinomialNB',
            code: 'MultinomialNB(${etc})',
            options: [
                //TODO:
            ]
        },
        'gaus-nb': {
            name: 'GaussianNB',
            import: 'from sklearn.naive_bayes import GaussianNB',
            code: 'GaussianNB(${etc})',
            options: [
                //TODO:
            ]
        },
        'sv-clf': {
            name: 'SVC',
            import: 'from sklearn.svm import SVC',
            code: 'SVC(${C}${kernel}${degree}${gamma}${coef0}${random_state}${etc})',
            options: [
                { name: 'C', component: ['input_number'], placeholder: '1.0', usePair: true, step: 0.1, min: 0 },
                { name: 'kernel', component: ['option_select'], type: 'text', usePair: true, 
                    options: ['linear', 'poly', 'rbf', 'sigmoid', 'precomputed'], default: 'rbf' },
                { name: 'degree', component: ['input_number'], placeholder: '3', usePair: true },
                { name: 'gamma', component: ['option_suggest'], usePair: true,
                    options: ["'scale'", "'auto'"], default: "'scale'" },
                { name: 'coef0', component: ['input_number'], placeholder: '0.0', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'dt-clf': {
            name: 'DecisionTreeClassifier',
            import: 'from sklearn.tree import DecisionTreeClassifier',
            code: 'DecisionTreeClassifier(${criterion}${max_depth}${min_samples_split}${random_state}${etc})',
            options: [
                { name: 'criterion', component: ['option_select'], type: 'text', default: 'squared_error', type:'text',
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
                { name: 'criterion', component: ['option_select'], type: 'text', default: 'gini', type:'text', usePair: true,
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
                { name: 'loss', component: ['option_select'], type: 'text', default: 'deviance', type: 'text', usePair: true,
                    options: ['deviance', 'exponential'] },
                { name: 'learning_rate', component: ['input_number'], default: 0.1, usePair: true },
                { name: 'n_estimators', component: ['input_number'], default: 100, usePair: true },
                { name: 'criterion', component: ['option_select'], type: 'text', default: 'friedman_mse', type:'text', usePair: true,
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
                { name: 'boosting_type', component: ['option_select'], type: 'text', default: 'gbdt', type: 'text', usePair: true,
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
                { name: 'loss_function', component: ['option_select'], type: 'text', default: 'RMSE', type:'text', usePair: true,
                    options: ['RMSE', 'absolute_error', 'huber', 'quantile'] },
                { name: 'task_type', component: ['option_select'], type: 'text', default: 'CPU', usePair: true,
                    options: ['CPU', 'GPU'] },
                { name: 'max_depth', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'n_estimators', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        /** Auto ML */
        'auto-sklearn-rgs': {
            name: 'AutoSklearnRegressor (Linux only)',
            install: '!pip install auto-sklearn',
            import: 'from autosklearn.regression import AutoSklearnRegressor',
            link: 'https://automl.github.io/auto-sklearn/master/api.html#regression',
            code: 'AutoSklearnRegressor(${etc})',
            options: [
                
            ]
        },
        'tpot-rgs': {
            name: 'TPOTRegressor',
            install: '!pip install tpot',
            import: 'from tpot import TPOTRegressor',
            code: 'TPOTRegressor(${generation}${population_size}${cv}${random_state}${etc})',
            options: [
                { name: 'generation', component: ['input_number'], default: 100, usePair: true },
                { name: 'population_size', component: ['input_number'], default: 100, usePair: true },
                { name: 'cv', component: ['input_number'], default: 5, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'auto-sklearn-clf': {
            name: 'AutoSklearnClassifier (Linux only)',
            install: '!pip install auto-sklearn',
            import: 'from autosklearn.classification import AutoSklearnClassifier',
            link: 'https://automl.github.io/auto-sklearn/master/api.html#classification',
            code: 'AutoSklearnClassifier(${etc})',
            options: [
                
            ]
        },
        'tpot-clf': {
            name: 'TPOTClassifier',
            install: '!pip install tpot',
            import: 'from tpot import TPOTClassifier',
            code: 'TPOTClassifier(${generation}${population_size}${cv}${random_state}${etc})',
            options: [
                { name: 'generation', component: ['input_number'], default: 100, usePair: true },
                { name: 'population_size', component: ['input_number'], default: 100, usePair: true },
                { name: 'cv', component: ['input_number'], default: 5, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
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
            name: 'PCA(Principal Component Analysis)',
            import: 'from sklearn.decomposition import PCA',
            code: 'PCA(${n_components}${random_state}${etc})',
            options: [
                { name: 'n_components', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'lda': {
            name: 'LDA(Linear Discriminant Analysis)',
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
            name: 'NMF(Non-Negative Matrix Factorization)',
            import: 'from sklearn.decomposition import NMF',
            code: 'NMF(${n_components}${random_state}${etc})',
            options: [
                { name: 'n_components', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        },
        'tsne': {
            name: 'TSNE(T-distributed Stochastic Neighbor Embedding)',
            import: 'from sklearn.manifold import TSNE',
            code: 'TSNE(${n_components}${learning_rate}${random_state}${etc})',
            options: [
                { name: 'n_components', component: ['input_number'], placeholder: 'None', usePair: true },
                { name: 'learning_rate', component: ['input_number'], default: 200.0, usePair: true },
                { name: 'random_state', component: ['input_number'], placeholder: '123', usePair: true }
            ]
        }
    }

    return ML_LIBRARIES;
});