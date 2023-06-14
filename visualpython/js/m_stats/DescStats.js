/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : DescStats.js
 *    Author          : Black Logic
 *    Note            : Descriptive Statistics
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 05. 31
 *    Change Date     :
 */

//============================================================================
// [CLASS] DescStats
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_stats/descStats.html'),
    __VP_CSS_LOADER__('vp_base/css/m_stats/descStats'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector',
    'vp_base/js/com/component/MultiSelector',
    'vp_base/js/m_apps/Subset'
], function(eqHTML, dsCss, com_util, com_Const, com_String, PopupComponent, DataSelector, MultiSelector, Subset) {

    /**
     * DescStats
     */
    class DescStats extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd'];

            this.state = {
                data: '',
                variable: [],
                // Central tendency
                mean: true,
                median: false,
                mode: false,
                sum: true,
                // Dispersion
                min: false,
                max: false,
                range: false,
                std: true,
                var: true,
                semean: false,
                skew: false,
                kurtosis: false,
                // Percentile values
                quantile: true,
                usePercentile: false,
                percentiles: [],
                // Frequency table
                frequency: true,
                percent: true,
                validPercent: true,
                cumulativePercent: true,
                noUniqVals: 10,
                // Display
                histogram: true,
                scatterMatrix: true,
                boxplot: true,
                ...this.state
            };

            this.subsetEditor = null;
            this.columnSelector = null;
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;

            // data selection
            $(this.wrapSelector('#data')).on('change', function() {
                let data = $(this).val();
                that.handleVariableChange(data);
            });

            // use percentile
            $(this.wrapSelector('#usePercentile')).on('change', function() {
                let checked = $(this).prop('checked');
                if (checked === true) {
                    // enable percentile editing
                    $(that.wrapSelector('#percentile')).prop('disabled', false);
                    $(that.wrapSelector('#addPercentile')).prop('disabled', false);
                    $(that.wrapSelector('.vp-percentile-box')).removeClass('disabled');
                } else {
                    // disable percentile editing
                    $(that.wrapSelector('#percentile')).prop('disabled', true);
                    $(that.wrapSelector('#addPercentile')).prop('disabled', true);
                    $(that.wrapSelector('.vp-percentile-box')).addClass('disabled');

                }
            });

            // add percentile
            $(this.wrapSelector('#addPercentile')).on('click', function() {
                let newVal = $(that.wrapSelector('#percentile')).val();
                if (newVal && newVal !== '') {
                    let newValNum = parseInt(newVal);
                    that.addPercentile(newValNum);
                    that.state.percentiles.push(newValNum);
                    $(that.wrapSelector('#percentile')).val('');
                }
            });
        }

        handleVariableChange(data) {
            this.state.data = data;
            // render variable selector
            this.columnSelector = new MultiSelector(this.wrapSelector('#variable'),
                { mode: 'columns', parent: data, showDescription: false }
            );
        }

        addPercentile(percentile) {
            if (this.state.percentiles.indexOf(percentile) === -1) {
                $(this.wrapSelector('.vp-percentile-box')).append(
                    $(`<div class="vp-percentile-item">
                        <div class="vp-percentile-value">${percentile}</div>
                        <div class="vp-percentile-remove vp-icon-close-small"></div>
                    </div>`));
    
                // delete percentile
                let that = this;
                $(this.wrapSelector('.vp-percentile-box:not(.disabled) .vp-percentile-remove')).on('click', function() {
                    if (that.state.usePercentile === true) {
                        let delVal = parseInt($(this).parent().find('.vp-percentile-value').text());
                        that.state.percentiles = that.state.percentiles.filter(x => x !== delVal);
                        $(this).closest('.vp-percentile-item').remove();
                    }
                });
            }
        }

        templateForBody() {
            let page = $(eqHTML);
            let that = this;

            // generate dataselector
            let dataSelector = new DataSelector({
                pageThis: this, id: 'data', placeholder: 'Select data', required: true, boxClasses: 'vp-flex-gap5',
                allowDataType: ['DataFrame'], withPopup: false,
                finish: function(data, type) {
                    that.state.data = data;
                    $(that.wrapSelector('#data')).trigger('change');
                },
                select: function(data, type) {
                    that.state.data = data;
                    $(that.wrapSelector('#data')).trigger('change');
                }
            });
            $(page).find('#data').replaceWith(dataSelector.toTagString());

            return page;
        }

        render() {
            super.render();
            let that = this;

            // render Subset
            this.subsetEditor = new Subset({ 
                pandasObject: '',
                config: { name: 'Subset', category: this.name } }, 
                {
                    useAsModule: true,
                    useInputColumns: true,
                    targetSelector: this.wrapSelector('#data'),
                    pageThis: this,
                    finish: function(code) {
                        $(that.wrapSelector('#data')).val(code);
                        that.handleVariableChange(code);
                    }
                });

            // render variable selector
            this.columnSelector = new MultiSelector(this.wrapSelector('#variable'),
                        { mode: 'columns', parent: this.state.data, showDescription: false }
                    );
        }

        generateCode() {
            let { data, variable,
                // Central tendency
                mean,median,mode,sum,
                // Dispersion
                min,max,range,std,variance,semean,skew,kurtosis,
                // Percentile values
                quantile,usePercentile,percentiles,
                // Frequency table
                frequency,percent,validPercent,cumulativePercent,noUniqVals,
                // Display
                histogram,scatterMatrix,boxplot
            } = this.state;
            let codeList = [];
            let code = new com_String();

            // data declaration
            code.appendFormat("vp_df = {0}", data);
            if (this.columnSelector) {
                let columns = this.columnSelector.getDataList();
                if (columns.length > 0) {
                    code.appendFormat("[[{0}]]", columns.map(x => x.code).join(', '));
                }
            }
            code.appendLine('.copy()');

            // Descriptive statistics
            code.appendLine();
            code.appendLine("# Descriptive statistics");
            code.appendLine("from IPython.display import display, Markdown");
            code.appendLine("display(Markdown('### Descriptive statistics'))");
            code.appendLine("display(pd.DataFrame({");
            code.appendLine("    'N Total':vp_df.shape[0],");
            code.appendLine("    'N Valid':vp_df.count(numeric_only=True),");
            code.appendLine("    'N Missing':vp_df.loc[:,vp_df.apply(pd.api.types.is_numeric_dtype)].isnull().sum(),");
            if (mean === true)      code.appendLine("    'Mean':vp_df.mean(numeric_only=True),");
            if (median === true)    code.appendLine("    'Median':vp_df.median(numeric_only=True),");
            if (mode === true)      code.appendLine("    'Mode':vp_df.mode(numeric_only=True).iloc[0],");
            if (sum === true)       code.appendLine("    'Sum':vp_df.sum(numeric_only=True),");
            if (min === true)       code.appendLine("    'Minimun':vp_df.min(numeric_only=True),");
            if (max === true)       code.appendLine("    'Maximum':vp_df.max(numeric_only=True),");
            if (range === true)     code.appendLine("    'Range':vp_df.max(numeric_only=True) - vp_df.min(numeric_only=True),");
            if (std === true)       code.appendLine("    'Std. deviation':vp_df.std(numeric_only=True),");
            if (variance === true)  code.appendLine("    'Variance':vp_df.var(numeric_only=True),");
            if (semean === true)    code.appendLine("    'S.E. mean':vp_df.std(numeric_only=True)/np.sqrt(vp_df.count(numeric_only=True)),");
            if (skew === true)      code.appendLine("    'Skewness':vp_df.skew(numeric_only=True),");
            if (kurtosis === true)  code.appendLine("    'Kurtosis':vp_df.kurtosis(numeric_only=True),");
            let sortedPercentiles = [];
            if (quantile === true) {
                sortedPercentiles = [25, 50, 75];
            }
            if (usePercentile === true && percentiles.length > 0) {
                sortedPercentiles = [...sortedPercentiles, ...percentiles];
            }
            sortedPercentiles.sort((a, b) => { return a - b; });
            sortedPercentiles.forEach(num => {
                code.appendFormatLine("    'Percentile: {0}':vp_df.quantile(q={1}, numeric_only=True),", num, (num / 100).toFixed(2));
            });
            code.appendLine("}).round(3).T)");

            // Frequency table
            code.appendLine();
            code.appendLine("# Frequency table");
            code.appendLine("display(Markdown('### Frequency table'))");
            code.appendLine("for col in vp_df.columns:");
            code.appendFormatLine("    if pd.api.types.is_numeric_dtype(vp_df[col]) and  vp_df[col].value_counts().size > {0}:", noUniqVals);
            code.appendFormatLine("        _bins = {0}", noUniqVals);
            code.appendLine("    else: _bins = None");
            code.appendLine("        ");
            code.appendLine("    _dfr = pd.DataFrame({");
            if (frequency === true) code.appendLine("              'Frequency':vp_df[col].value_counts(bins=_bins, sort=False),");
            if (percent === true) code.appendLine("              'Percent':100*(vp_df[col].value_counts(bins=_bins, sort=False) / vp_df[col].size),");
            if (validPercent === true) code.appendLine("              'Valid percent':100*(vp_df[col].value_counts(bins=_bins, sort=False)/vp_df[col].count())");
            code.appendLine("}).round(2)");
            if (cumulativePercent === true) code.appendLine("    _dfr['Cumulative percent'] = _dfr['Valid percent'].cumsum()");
            code.appendLine("    _dfr.loc['N Valid',:] =  _dfr.iloc[:,:3].sum()");
            code.appendLine("    _dfr.loc['N Missing','Frequency'] =  vp_df[col].isnull().sum()");
            code.appendLine("    _dfr.loc['N Total','Frequency'] =  vp_df[col].size");
            code.append("    display(_dfr)");

            // Display option
            if (histogram || scatterMatrix || boxplot) {
                code.appendLine();
                code.appendLine();
                code.appendLine("# Charts");
                code.appendLine("import seaborn as sns");
                code.appendLine("import warnings");
                code.appendLine("with warnings.catch_warnings():");
                code.append("    warnings.simplefilter(action='ignore', category=Warning)");
                if (histogram === true) {
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("    # Histogram");
                    code.appendLine("    idx = 1");
                    code.appendLine("    for col in vp_df.columns:");
                    code.appendLine("        plt.subplot(2,2, idx)");
                    code.appendFormatLine("        if pd.api.types.is_numeric_dtype(vp_df[col]) and  vp_df[col].value_counts().size > {0}:", noUniqVals);
                    code.appendLine("            sns.histplot(data=vp_df, x=col, kde=True)");
                    code.appendLine("        else:");
                    code.appendLine("            sns.countplot(data=vp_df, x=col)");
                    code.appendLine("        ");
                    code.appendLine("        if idx < 4:");
                    code.appendLine("            idx += 1");
                    code.appendLine("        else:");
                    code.appendLine("            idx = 1");
                    code.appendLine("            plt.tight_layout()");
                    code.append("            plt.show()");
                }
                if (scatterMatrix === true) {
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("    # Scatter matrix        ");
                    code.appendLine("    pd.plotting.scatter_matrix(vp_df, marker='o', hist_kwds={'bins': 30}, s=30, alpha=.8)");
                    code.append("    plt.show()");
                }
                if (boxplot === true) {
                    code.appendLine();
                    code.appendLine();
                    code.appendLine("    # Boxplot");
                    code.appendLine("    sns.boxplot(vp_df)");
                    code.append("    plt.show()");
                }
            }

            return code.toString();
        }

    }

    return DescStats;
});