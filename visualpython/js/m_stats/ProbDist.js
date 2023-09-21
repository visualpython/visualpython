/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : ProbDist.js
 *    Author          : Black Logic
 *    Note            : Probability Distribution
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 05. 09
 *    Change Date     :
 */

//============================================================================
// [CLASS] ProbDist
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_stats/probDist.html'),
    __VP_CSS_LOADER__('vp_base/css/m_stats/probDist'),
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_generatorV2',
    'vp_base/data/m_stats/statsLibrary',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/DataSelector'
], function(pdHTML, pdCss, com_util, com_Const, com_String, com_generator, STATS_LIBRARIES, PopupComponent, DataSelector) {

    /**
     * ProbDist
     */
    class ProbDist extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.sizeLevel = 2;
            this.config.checkModules = ['pd', 'plt'];
            this.config.docs = 'https://docs.scipy.org/doc/scipy/reference/';
            this.config.helpview = true;

            this.state = {
                distType: 'normal',
                userOption: '',
                action: 'random-number',
                // random-number
                size: 10000,
                randomState: '',
                allocateTo: 'samples',
                sampledDist: true,
                // distribution-plot
                probDensityFunc: true,
                probMassFunc: true,
                cumDistFunc: true,
                // stats-to-pvalue
                stats: '',
                pAlter: 'two-sided',
                // pvalue-to-stats
                pvalue: '',
                statsAlter: 'two-sided',
                ...this.state
            };

            this.distList = [
                {
                    label: 'Discrete probability distribution',
                    child: ['bernoulli', 'binomial', 'multinomial']
                }, 
                {
                    label: 'Continuous probability distribution',
                    child: ['uniform','normal','beta','gamma','studentst','chi2','f','dirichlet','multivariate_normal']
                }
            ];
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;

            $(this.wrapSelector('#distType')).on('change', function() {
                let distType = $(this).val();
                that.state.distType = distType;
                $(that.wrapSelector('.vp-pd-dist-option-box')).html(that.templateForOption(distType));

                $(that.wrapSelector('.vp-pd-display-option')).hide();
                // show/hide display option
                if (that.distList[0].child.includes(distType)) {
                    // discrete option
                    $(that.wrapSelector('.vp-pd-display-option.dist')).show();

                    // set size to 1000
                    $(that.wrapSelector('#size')).val(1000);
                    that.state.size = 1000;

                    // hide distribution plot for multinomial
                    if (distType === 'multinomial') {
                        $(that.wrapSelector('.vp-pd-display-option.dist-plot')).hide();
                        // hide other actions
                        if (that.state.action !== 'random-number') {
                            $(that.wrapSelector('#action')).val('random-number');
                            $(that.wrapSelector('#action')).trigger('change');
                        }
                    } else {
                        // hide continuous action
                        if (that.state.action === 'stats-to-pvalue' || that.state.action === 'pvalue-to-stats') {
                            $(that.wrapSelector('#action')).val('random-number');
                            $(that.wrapSelector('#action')).trigger('change');
                        }
                    }
                } else {
                    // continuous option
                    $(that.wrapSelector('.vp-pd-display-option.cont')).show();

                    // set size to 10000
                    $(that.wrapSelector('#size')).val(10000);
                    that.state.size = 10000;
                }

                // show install button
                let thisDistObj = STATS_LIBRARIES[distType];
                if (thisDistObj.install != undefined) {
                    $(that.wrapSelector('#vp_installLibrary')).show();
                } else {
                    $(that.wrapSelector('#vp_installLibrary')).hide();
                }

                // set help content
                that.setHelpContent(thisDistObj.help);
            });

            $(this.wrapSelector('#action')).on('change', function() {
                let action = $(this).val();
                that.state.action = action;

                $(that.wrapSelector('.vp-pd-action-box')).hide();
                $(that.wrapSelector('.vp-pd-action-box.' + action)).show();

                $(that.wrapSelector('.vp-pd-display-option')).hide();
                // show/hide display option
                if (that.distList[0].child.includes(that.state.distType)) {
                    // discrete option
                    $(that.wrapSelector('.vp-pd-display-option.dist')).show();
                } else {
                    // continuous option
                    $(that.wrapSelector('.vp-pd-display-option.cont')).show();
                }
            });
        }

        templateForBody() {
            let page = $(pdHTML);
            let that = this;

            //================================================================
            // Distribution type creation
            //================================================================
            // dist types
            let distTypeTag = new com_String();
            this.distList.forEach(distObj => {
                let { label, child } = distObj;
                let distOptionTag = new com_String();
                child && child.forEach(opt => {
                    let optConfig = STATS_LIBRARIES[opt];
                    let selectedFlag = '';
                    if (opt == that.state.distType) {
                        selectedFlag = 'selected';
                    }
                    distOptionTag.appendFormatLine('<option value="{0}" {1}>{2}</option>',
                                    opt, selectedFlag, optConfig.name);
                })
                distTypeTag.appendFormatLine('<optgroup label="{0}">{1}</optgroup>', 
                    label, distOptionTag.toString());
            });
            $(page).find('#distType').html(distTypeTag.toString());

            // render option page
            $(page).find('.vp-pd-dist-option-box').html(this.templateForOption(this.state.distType));

            // control display option
            $(this.wrapSelector('.vp-pd-display-option')).hide();
            // show/hide display option
            if (this.distList[0].child.includes(this.state.distType)) {
                // discrete option
                $(this.wrapSelector('.vp-pd-display-option.dist')).show();
            } else {
                // continuous option
                $(this.wrapSelector('.vp-pd-display-option.cont')).show();
            }

            return page;
        }

        templateForOption(distType) {
            let config = STATS_LIBRARIES[distType];
            let state = this.state;

            let optBox = new com_String();
            // render tag
            config.options.forEach(opt => {
                optBox.appendFormatLine('<label for="{0}" class="{1}" title="{2}">{3}</label>'
                    , opt.name, (opt.required===true?'vp-orange-text':''), opt.name, com_util.optionToLabel(opt.name));
                let content = com_generator.renderContent(this, opt.component[0], opt, state);
                optBox.appendLine(content[0].outerHTML);
            });
            // render user option
            optBox.appendFormatLine('<label for="{0}">{1}</label>', 'userOption', 'User option');
            optBox.appendFormatLine('<input type="text" class="vp-input vp-state" id="{0}" placeholder="{1}" value="{2}"/>',
                                        'userOption', 'key=value, ...', this.state.userOption);
            return optBox.toString();
        }

        render() {
            super.render();

            let allocateSelector = new DataSelector({
                type: 'data',
                pageThis: this,
                id: 'allocatedTo',
                classes: 'vp-input vp-state',
                placeholder: '_res',
                finish: function() {
                    ;
                }
            });
            $(this.wrapSelector('#allocatedTo')).replaceWith(allocateSelector.toTagString());

            this.setHelpContent(STATS_LIBRARIES[this.state.distType].help, true, 'import scipy.stats as _vp_stats');
        }

        generateCode() {
            this.config.checkModules = ['pd'];
            let { 
                distType, userOption, action, 
                size, randomState, allocateTo, sampledDist, 
                probDensityFunc, probMassFunc, cumDistFunc,
                stats, pAlter,
                pvalue, statsAlter
            } = this.state;

            let codeList = [];
            let code = new com_String();
            /**
             * Model Creation
             */
            let config = STATS_LIBRARIES[distType];
            let label = config.name;
            code.appendLine(config.import);
            code.appendLine();

            // model code
            let modelCode = config.code;
            modelCode = com_generator.vp_codeGenerator(this, config, this.state, (userOption != ''? ', ' + userOption : ''));
            code.append(modelCode);

            switch (action) {
                case 'random-number':
                    code.appendLine();
                    code.appendLine();
                    code.appendFormatLine("# Generate random numbers ({0})", label);
                    code.appendLine("from IPython.display import display");
                    code.appendFormat('{0} = _rv.rvs(size={1}', allocateTo, size);
                    if (randomState !== '') {
                        code.appendFormat(", random_state={0}", randomState);
                    }
                    code.appendLine(')');
                    code.appendFormat("display({0})", allocateTo);

                    if (sampledDist === true) {
                        this.addCheckModules('plt');
                        this.addCheckModules('sns');

                        code.appendLine();
                        code.appendLine();
                        code.appendFormatLine("# Sample distribution ({0})", label);
                        code.appendLine("import warnings");
                        code.appendLine("with warnings.catch_warnings():");
                        code.appendLine("    warnings.simplefilter(action='ignore', category=Warning)");
                        if (distType === 'multinomial') {
                            // code.appendFormatLine("    plt.boxplot(x={0})", allocateTo);
                            code.appendFormatLine("    for i in range(0, {0}.shape[1]):", allocateTo);
                            code.appendLine("        plt.subplot(2, 2, i+1)");
                            code.appendLine("        plt.title('$x$=' + str(i))");
                            code.appendFormatLine("        sns.countplot(x=[ x[i] for x in {0} ])", allocateTo);
                            code.appendLine("    plt.suptitle('Generate random numbers: Multinomial')");
                            code.appendLine("    plt.tight_layout()");
                            code.appendLine("    plt.show()");
                        } else {
                            if (this.distList[0].child.includes(distType)) {
                                code.appendFormatLine("    sns.countplot(x={0})", allocateTo);
                            } else {
                                code.appendFormatLine("    sns.histplot({0}, stat='density', kde=True)", allocateTo);
                            }
                            code.appendFormatLine("    plt.title('Generate random numbers: {0}')", label.replace("'", "\\'"));
                            code.appendLine("    plt.xlabel('$x$')");
                            code.append("    plt.show()");
                        }
                    }
                    break;
                case 'distribution-plot':
                    if (this.distList[0].child.includes(distType)) {
                        if (probMassFunc === true) {
                            this.addCheckModules('np');
                            this.addCheckModules('plt');

                            code.appendLine();
                            code.appendLine();
                            code.appendFormatLine("# Probability mass function ({0})", label);
                            if (distType === 'bernoulli') {
                                code.appendLine("plt.bar([0,1], _rv.pmf([0,1]))");
                                code.appendFormatLine("plt.title('Probability mass function: {0}')", label.replace("'", "\\'"));
                                code.appendLine("plt.xlim(-1, 2)");
                                code.appendLine("plt.ylim(0, 1)");
                                code.appendLine("plt.xticks([0, 1], ['x=0', 'x=1'])");
                                code.appendLine("plt.xlabel('$x$')");
                                code.appendLine("plt.ylabel('$p(x)$')");
                                code.append("plt.show()");
                            } else if (distType === 'binomial') {
                                var { n=10 } = this.state;
                                code.appendFormatLine("plt.bar(range(0,{0}), _rv.pmf(range(0,{1})))", n, n);
                                code.appendFormatLine("plt.title('Probability mass function: {0}')", label.replace("'", "\\'"));
                                code.appendFormatLine("plt.xlim(-1, {0})", n);
                                code.appendFormatLine("plt.xticks(range(0, {0}), ['x='+str(i) for i in range(0, {1})])", n, n);
                                code.appendLine("plt.xlabel('$x$')");
                                code.appendLine("plt.ylabel('$p(x)$')");
                                code.append("plt.show()");
                            } else if (distType === 'multinomial') {
                                code.appendFormatLine("for i in range(0, {0}.shape[1]):", allocateTo);
                                code.appendLine("    plt.subplot(2, 2, i+1)");
                                code.appendLine("    plt.title('$x$=' + str(i))");
                                code.appendFormatLine("    sns.countplot(x=[ x[i] for x in {0} ])", allocateTo);
                                code.appendLine("plt.suptitle('Probability mass function: Multinomial')");
                                code.appendLine("plt.tight_layout()");
                                code.append("plt.show()");
                            }
                        }
                    } else {
                        let start = -5;
                        let end = 5;
                        switch (distType) {
                            case 'normal':
                            case 'studentst':
                            case 'multivariate_normal':
                                start = -5;
                                end = 5;
                                break;
                            case 'uniform':
                            case 'beta':
                            case 'dirichlet':
                                start = 0;
                                end = 1;
                                break;
                            case 'gamma':
                            case 'chi2':
                                start = 0;
                                end = 30;
                                break;
                            case 'f':
                                start = 0;
                                end = 10;
                                break;
                        }

                        if (probDensityFunc === true || cumDistFunc === true) {
                            code.appendLine();
                            code.appendFormat("x = np.linspace({0}, {1}, 100)", start, end);
                            if (probDensityFunc === true) {
                                this.addCheckModules('np');
                                this.addCheckModules('plt');
    
                                code.appendLine();
                                code.appendLine();
                                code.appendFormatLine("# Probability density function ({0})", label);
                                code.appendLine("plt.plot(x, _rv.pdf(x))");
                                code.appendFormatLine("plt.title('Probability density function: {0}')", label.replace("'", "\\'"));
                                code.appendLine("plt.xlabel('$x$')");
                                code.appendLine("plt.ylabel('$p(x)$')");
                                code.append("plt.show()");
                            }
                            if (cumDistFunc === true) {
                                this.addCheckModules('np');
                                this.addCheckModules('plt');
                                
                                code.appendLine();
                                code.appendLine();
                                code.appendFormatLine("# Cumulative distribution function ({0})", label);
                                code.appendLine("import warnings");
                                code.appendLine("with warnings.catch_warnings():");
                                code.appendFormatLine("    _x = np.linspace({0}, {1}, 100)", start, end);
                                code.appendLine("    plt.plot(_x, _rv.cdf(_x))");
                                code.appendLine();
                                code.appendFormatLine("    plt.title('Cumulative distribution function: {0}')", label.replace("'", "\\'"));
                                code.appendLine("    plt.xlabel('$x$')");
                                code.appendLine("    plt.ylabel('$F(x)$')");
                                code.append("    plt.show()");
                            }
                        }
                    }
                    break;
                case 'stats-to-pvalue':
                    if (pAlter === 'one-sided') {
                        // one-sided
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Proportional values");
                        code.appendFormatLine("p_value = _rv.sf(abs({0}))", stats);
                        code.append("p_value");
                    } else {
                        // two-sided
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Proportional values");
                        code.appendFormatLine("p_value = _rv.sf(abs({0}))*2", stats);
                        code.append("p_value");
                    }
                    break;
                case 'pvalue-to-stats': 
                    if (statsAlter === 'one-sided') {
                        // one-sided
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Statistic");
                        code.appendFormatLine("statistic = _rv.isf({0})", pvalue);
                        code.append("statistic");
                    } else {
                        // two-sided
                        code.appendLine();
                        code.appendLine();
                        code.appendLine("# Statistic");
                        code.appendFormatLine("statistic = _rv.isf({0}/2)", pvalue);
                        code.append("statistic");
                    }
                    break;
            }
            codeList.push(code.toString());
                
            return codeList;
        }

    }

    return ProbDist;
});