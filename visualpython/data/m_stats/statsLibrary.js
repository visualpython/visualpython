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
                { name: 'p', component: ['input_number'], default: 0.6, usePair: true },
            ]
        },
        'binomial': {
            name: 'Binomial',
            import: 'from scipy import stats',
            code: '_rv = stats.binom(${N}${p})',
            description: 'A binomial discrete random variable.',
            options: [
                { name: 'N', component: ['input_number'], default: 10, usePair: true },
                { name: 'p', component: ['input_number'], default: 0.6, usePair: true },
            ]
        },
        'multinomial': {
            name: 'Multinomial',
            import: 'from scipy import stats',
            code: '_rv = stats.multinomial(${N}${mu})',
            description: 'A multinomial random variable.',
            options: [
                { name: 'N', component: ['input_number'], default: 10, usePair: true },
                { name: 'p', component: ['data_select'], usePair: true },
            ]
        },
        /** Continumous prob. dist. */
        'uniform': {
            name: 'Uniform',
            import: 'from scipy import stats',
            code: '_rv = stats.uniform()',
            description: 'A uniform continuous random variable.',
            options: [
            ]
        },
        'normal': {
            name: 'Normal',
            import: 'from scipy import stats',
            code: '_rv = stats.norm(${loc}${scale})',
            description: 'A normal continuous random variable.',
            options: [
                { name: 'loc', component: ['input_number'], default: 0, usePair: true },
                { name: 'scale', component: ['input_number'], default: 1, usePair: true },
            ]
        },
        'beta': {
            name: 'Beta',
            import: 'from scipy import stats',
            code: '_rv = stats.beta(${a}${b})',
            description: 'A beta continuous random variable.',
            options: [
                { name: 'a', component: ['input_number'], usePair: true },
                { name: 'b', component: ['input_number'], usePair: true },
            ]
        },
        'gamma': {
            name: 'Gamma',
            import: 'from scipy import stats',
            code: '_rv = stats.gamma(${a})',
            description: 'A gamma continuous random variable.',
            options: [
                { name: 'a', component: ['input_number'], usePair: true },
            ]
        },
        'studentst': {
            name: "Student's t",
            import: 'from scipy import stats',
            code: '_rv = stats.t(${df})',
            description: "A Student's t continuous random variable.",
            options: [
                { name: 'df', component: ['input_number'], usePair: true },
            ]
        },
        'chi2': {
            name: 'Chi2',
            import: 'from scipy import stats',
            code: '_rv = stats.chi2(${df})',
            description: 'A chi-squared continuous random variable.',
            options: [
                { name: 'df', component: ['input_number'], usePair: true },
            ]
        },
        'f': {
            name: 'F',
            import: 'from scipy import stats',
            code: '_rv = stats.f(${dfn}${dfd})',
            description: 'An F continuous random variable.',
            options: [
                { name: 'dfn', component: ['input_number'], usePair: true },
                { name: 'dfd', component: ['input_number'], usePair: true },
            ]
        },
        'dirichlet': {
            name: 'Dirichlet',
            import: 'from scipy import stats',
            code: '_rv = stats.dirichlet(${alpha}${seed})',
            description: 'A Dirichlet random variable.',
            options: [
                { name: 'alpha', component: ['input_number'], usePair: true },
                { name: 'seed', component: ['input_number'], usePair: true },
            ]
        },
        'multivariate_normal': {
            name: 'Multivariate normal',
            import: 'from scipy import stats',
            code: '_rv = stats.multivariate_normal(${mean}${cov}${allow_singular})',
            description: 'A multivariate normal random variable.',
            options: [
                { name: 'mean', component: ['data_select'], default: '[0]', usePair: true },
                { name: 'cov', component: ['data_select'], default: '[1]', usePair: true },
                { name: 'allow_singular', component: ['bool_select'], default: 'False', usePair: true },
            ]
        },
    }

    return STATS_LIBRARIES;
});