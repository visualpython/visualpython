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
        //========================================================================
        // Basics
        //========================================================================
        'scatter': {
            name: 'Scatter Plot',
            code: '${allocateTo} = px.scatter(${data}${x}${y}${color}${etc})',
            description: 'Draw a scatter plot with possibility of several semantic groupings.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'line': {
            name: 'Line Plot',
            code: '${allocateTo} = px.line(${data}${x}${y}${color}${etc})',
            description: 'Draw a line plot with possibility of several semantic groupings.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'area': {
            name: 'Line Plot',
            code: '${allocateTo} = px.area(${data}${x}${y}${color}${etc})',
            description: 'Draw a area plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'bar': {
            name: 'Bar Plot',
            code: '${allocateTo} = px.bar(${data}${x}${y}${color}${etc})',
            description: 'Draw a bar plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'funnel': {
            name: 'Funnel Plot',
            code: '${allocateTo} = px.funnel(${data}${x}${y}${color}${etc})',
            description: 'Draw a funnel plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'timeline': {
            name: 'Timeline Plot',
            code: '${allocateTo} = px.timeline(${data}${x_start}${x_end}${y}${color}${etc})',
            description: 'Draw a timeline plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x_start', label: 'X start', component: ['col_select'], usePair: true },
                { name: 'x_end', label: 'X end', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        //========================================================================
        // Part-of-Whole
        //========================================================================
        'pie': {
            name: 'Pie Plot',
            code: '${allocateTo} = px.pie(${data}${values}${names}${color}${etc})',
            description: 'Draw a pie plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'values', label: 'Values', component: ['col_select'], usePair: true },
                { name: 'names', label: 'Names', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'sunburst': {
            name: 'Sunburst',
            code: '${allocateTo} = px.sunburst(${data}${values}${names}${color}${parents}${path}${etc})',
            description: 'Draw a sunburst plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'values', label: 'Values', component: ['col_select'], usePair: true },
                { name: 'names', label: 'Names', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'parents', label: 'Parents', component: ['col_select'], usePair: true },
                { name: 'path', label: 'Path', component: ['data_select'], var_type: ['ndarray', 'list'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'treemap': {
            name: 'Treemap',
            code: '${allocateTo} = px.treemap(${data}${values}${names}${color}${parents}${path}${etc})',
            description: 'Draw a treemap plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'values', label: 'Values', component: ['col_select'], usePair: true },
                { name: 'names', label: 'Names', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'parents', label: 'Parents', component: ['col_select'], usePair: true },
                { name: 'path', label: 'Path', component: ['data_select'], var_type: ['ndarray', 'list'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'icicle': {
            name: 'Icicle',
            code: '${allocateTo} = px.icicle(${data}${values}${names}${color}${parents}${path}${etc})',
            description: 'Draw a icicle plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'values', label: 'Values', component: ['col_select'], usePair: true },
                { name: 'names', label: 'Names', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'parents', label: 'Parents', component: ['col_select'], usePair: true },
                { name: 'path', label: 'Path', component: ['data_select'], var_type: ['ndarray', 'list'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'funnel_area': {
            name: 'Funnel area',
            code: '${allocateTo} = px.funnel_area(${data}${values}${names}${color}${etc})',
            description: 'Draw a funnel area.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'values', label: 'Values', component: ['col_select'], usePair: true },
                { name: 'names', label: 'Names', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        //========================================================================
        // 1D Distributions
        //========================================================================
        'histogram': {
            name: 'Histogram',
            code: '${allocateTo} = px.histogram(${data}${x}${y}${color}${etc})',
            description: 'Draw a histogram plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'box': {
            name: 'Box plot',
            code: '${allocateTo} = px.box(${data}${x}${y}${color}${etc})',
            description: 'Draw a box plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'violin': {
            name: 'Violin plot',
            code: '${allocateTo} = px.violin(${data}${x}${y}${color}${etc})',
            description: 'Draw a violin plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'strip': {
            name: 'Strip plot',
            code: '${allocateTo} = px.strip(${data}${x}${y}${color}${etc})',
            description: 'Draw a strip plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'ecdf': {
            name: 'Ecdf plot',
            code: '${allocateTo} = px.ecdf(${data}${x}${y}${color}${etc})',
            description: 'Draw a ecdf plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        //========================================================================
        // 2D Distributions
        //========================================================================
        'density_heatmap': {
            name: 'Density heatmap',
            code: '${allocateTo} = px.density_heatmap(${data}${x}${y}${z}${etc})',
            description: 'Draw a density heatmap plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'z', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        'density_contour': {
            name: 'Density contour',
            code: '${allocateTo} = px.density_contour(${data}${x}${y}${z}${color}${etc})',
            description: 'Draw a density contour plot.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'z', component: ['col_select'], usePair: true },
                { name: 'color', component: ['col_select'], usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        //========================================================================
        // Matrix or Image Input
        //========================================================================
        'imshow': {
            name: 'Imshow',
            code: '${allocateTo} = px.imshow(${data}${x}${y}${origin}${etc})', // zmin, zmax, origin
            description: 'Display an image, i.e. data on a 2D regular raster.',
            options: [
                { name: 'data', component: ['var_select'], var_type: ['DataFrame', 'Series', 'list'] },
                { name: 'x', component: ['col_select'], usePair: true },
                { name: 'y', component: ['col_select'], usePair: true },
                { name: 'origin', label: 'Origin', component: ['option_select'], options: ['upper', 'lower'], default: 'upper', usePair: true },
                { name: 'allocateTo', label: 'Allocate To', component: ['input'], usePair: true }
            ]
        },
        //========================================================================
        // 3-Dimensional
        //========================================================================

        //========================================================================
        // Mutidimensional
        //========================================================================

        //========================================================================
        // Tile Maps
        //========================================================================

        //========================================================================
        // Outline Maps
        //========================================================================

        //========================================================================
        // Polar Charts
        //========================================================================

        //========================================================================
        // Ternary Charts
        //========================================================================

    }

    return PLOTLY_LIBRARIES;
});