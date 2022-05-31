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
    var PLOTLY_LIBRARIES = {
        'scatter': {
            name: 'Scatter Plot',
            code: '${allocateTo} = px.scatter(${data}${x}${y}${etc})',
            description: 'Draw a scatter plot with possibility of several semantic groupings.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'line': {
            name: 'Line Plot',
            code: '${allocateTo} = px.line(${data}${x}${y}${etc})',
            description: 'Draw a line plot with possibility of several semantic groupings.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'area': {
            name: 'Line Plot',
            code: '${allocateTo} = px.area(${data}${x}${y}${etc})',
            description: 'Draw a area plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'bar': {
            name: 'Bar Plot',
            code: '${allocateTo} = px.bar(${data}${x}${y}${etc})',
            description: 'Draw a bar plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'funnel': {
            name: 'Funnel Plot',
            code: '${allocateTo} = px.funnel(${data}${x}${y}${etc})',
            description: 'Draw a funnel plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'timeline': {
            name: 'Timeline Plot',
            code: '${allocateTo} = px.timeline(${data}${x_start}${x_end}${y}${etc})',
            description: 'Draw a timeline plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x_start', component: ['col_select'], usePair: true },
                { name: 'x_end', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
    }

    return PLOTLY_LIBRARIES;
});