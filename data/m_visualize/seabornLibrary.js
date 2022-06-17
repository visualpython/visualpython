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
    var SEABORN_LIBRARIES = {
        /** Relational plots */
        'scatterplot': {
            name: 'Scatter Plot',
            code: '${allocateTo} = sns.scatterplot(${data}${x}${y}${hue}${etc})',
            description: 'Draw a scatter plot with possibility of several semantic groupings.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'], usePair: true },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'hue', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'lineplot': {
            name: 'Line Plot',
            code: '${allocateTo} = sns.lineplot(${data}${x}${y}${hue}${etc})',
            description: 'Draw a line plot with possibility of several semantic groupings.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'], usePair: true },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'hue', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        /** Distribution plots */
        'histplot': {
            name: 'Histogram Plot',
            code: '${allocateTo} = sns.histplot(${data}${x}${y}${hue}${bins}${kde}${stat}${etc})',
            description: 'Plot univariate or bivariate histograms to show distributions of datasets.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'], usePair: true },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'hue', component: ['col_select'], usePair: true },
                { name: 'bins', component: ['input_number'], usePair: true },
                { name: 'kde', component: ['option_select'], usePair: true },
                { name: 'stat', component: ['bool_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'kdeplot': {
            name: 'Kernel Density Plot',
            code: '${allocateTo} = sns.kdeplot(${data}${x}${y}${hue}${etc})',
            description: 'Plot univariate or bivariate distributions using kernel density estimation.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'], usePair: true },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'hue', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'rugplot': {
            name: 'Rug Plot',
            code: '${allocateTo} = sns.rugplot(${data}${x}${y}${hue}${etc})',
            description: 'Plot marginal distributions by drawing ticks along the x and y axes.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'], usePair: true },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'hue', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        /** Categorical plots */
        'stripplot': {
            name: 'Strip Plot',
            code: '${allocateTo} = sns.stripplot(${data}${x}${y}${hue}${etc})',
            description: 'Draw a scatterplot where one variable is categorical.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'], usePair: true },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'hue', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'swarmplot': {
            name: 'Swarm Plot',
            code: '${allocateTo} = sns.swarmplot(${data}${x}${y}${hue}${etc})',
            description: 'Draw a categorical scatterplot with non-overlapping points.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'], usePair: true },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'hue', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'boxplot': {
            name: 'Box Plot',
            code: '${allocateTo} = sns.boxplot(${data}${x}${y}${hue}${etc})',
            description: 'Draw a box plot to show distributions with respect to categories.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'], usePair: true },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'hue', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'violinplot': {
            name: 'Violin Plot',
            code: '${allocateTo} = sns.violinplot(${data}${x}${y}${hue}${etc})',
            description: 'Draw a combination of boxplot and kernel density estimate.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'], usePair: true },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'hue', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'pointplot': {
            name: 'Point Plot',
            code: '${allocateTo} = sns.pointplot(${data}${x}${y}${hue}${etc})',
            description: 'Show point estimates and confidence intervals using scatter plot glyphs.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'], usePair: true },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'hue', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'barplot': {
            name: 'Bar Plot',
            code: '${allocateTo} = sns.barplot(${data}${x}${y}${hue}${etc})',
            description: 'Show point estimates and confidence intervals as rectangular bars.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'], usePair: true },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'hue', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'countplot': {
            name: 'Count Plot',
            code: '${allocateTo} = sns.countplot(${data}${x}${y}${hue}${etc})',
            description: 'Show the counts of observations in each categorical bin using bars.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'], usePair: true },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'hue', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        }
    }

    return SEABORN_LIBRARIES;
});