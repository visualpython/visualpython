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
    var STATS_LIBRARIES = {
        /** Discrete prob. dist. */
        'bernoulli': {
            name: 'Bernoulli',
            import: 'from scipy import stats',
            code: '_rv = stats.bernoulli(${p})',
            description: 'A Bernoulli discrete random variable.',
            options: [
                { name: 'p', component: ['input_number'], value: 0.6, required: true, usePair: true },
            ]
        },
        'binomial': {
            name: 'Binomial',
            import: 'from scipy import stats',
            code: '_rv = stats.binom(${n}${p})',
            description: 'A binomial discrete random variable.',
            help: '_vp_stats.binom',
            options: [
                { name: 'n', component: ['input_number'], value: 10, required: true, usePair: true },
                { name: 'p', component: ['input_number'], value: 0.6, required: true, usePair: true },
            ]
        },
        'multinomial': {
            name: 'Multinomial',
            import: 'from scipy import stats',
            code: '_rv = stats.multinomial(${n}${p})',
            description: 'A multinomial random variable.',
            help: '_vp_stats.multinomial',
            options: [
                { name: 'n', component: ['input_number'], value: 10, required: true, usePair: true },
                { name: 'p', component: ['data_select'], value: '[0.4, 0.6]', required: true, usePair: true },
            ]
        },
        /** Continumous prob. dist. */
        'uniform': {
            name: 'Uniform',
            import: 'from scipy import stats',
            code: '_rv = stats.uniform()',
            description: 'A uniform continuous random variable.',
            help: '_vp_stats.uniform',
            options: [
            ]
        },
        'normal': {
            name: 'Normal',
            import: 'from scipy import stats',
            code: '_rv = stats.norm(${loc}${scale})',
            description: 'A normal continuous random variable.',
            help: '_vp_stats.norm',
            options: [
                { name: 'loc', component: ['input_number'], value: 0, usePair: true },
                { name: 'scale', component: ['input_number'], value: 1, usePair: true },
            ]
        },
        'beta': {
            name: 'Beta',
            import: 'from scipy import stats',
            code: '_rv = stats.beta(${a}${b})',
            description: 'A beta continuous random variable.',
            help: '_vp_stats.beta',
            options: [
                { name: 'a', component: ['input_number'], required: true, usePair: true },
                { name: 'b', component: ['input_number'], required: true, usePair: true },
            ]
        },
        'gamma': {
            name: 'Gamma',
            import: 'from scipy import stats',
            code: '_rv = stats.gamma(${a})',
            description: 'A gamma continuous random variable.',
            help: '_vp_stats.gamma',
            options: [
                { name: 'a', component: ['input_number'], required: true, usePair: true },
            ]
        },
        'studentst': {
            name: "Student's t",
            import: 'from scipy import stats',
            code: '_rv = stats.t(${df})',
            description: "A Student's t continuous random variable.",
            help: '_vp_stats.t',
            options: [
                { name: 'df', component: ['input_number'], required: true, usePair: true },
            ]
        },
        'chi2': {
            name: 'Chi2',
            import: 'from scipy import stats',
            code: '_rv = stats.chi2(${df})',
            description: 'A chi-squared continuous random variable.',
            help: '_vp_stats.chi2',
            options: [
                { name: 'df', component: ['input_number'], required: true, usePair: true },
            ]
        },
        'f': {
            name: 'F',
            import: 'from scipy import stats',
            code: '_rv = stats.f(${dfn}${dfd})',
            description: 'An F continuous random variable.',
            help: '_vp_stats.f',
            options: [
                { name: 'dfn', component: ['input_number'], required: true, usePair: true },
                { name: 'dfd', component: ['input_number'], required: true, usePair: true },
            ]
        },
        'dirichlet': {
            name: 'Dirichlet',
            import: 'from scipy import stats',
            code: '_rv = stats.dirichlet(${alpha}${seed})',
            description: 'A Dirichlet random variable.',
            help: '_vp_stats.dirichlet',
            options: [
                { name: 'alpha', component: ['input'], required: true, usePair: true, value: '(3,5,2)', placeholder: '(x, y, z)' },
                { name: 'seed', component: ['input_number'], usePair: true },
            ]
        },
        'multivariate_normal': {
            name: 'Multivariate normal',
            import: 'from scipy import stats',
            code: '_rv = stats.multivariate_normal(${mean}${cov}${allow_singular})',
            description: 'A multivariate normal random variable.',
            help: '_vp_stats.multivariate_normal',
            options: [
                { name: 'mean', component: ['data_select'], value: '[0]', usePair: true },
                { name: 'cov', component: ['data_select'], value: '[1]', usePair: true },
                { name: 'allow_singular', component: ['bool_select'], default: 'False', usePair: true },
            ]
        },
    }

    return STATS_LIBRARIES;
});