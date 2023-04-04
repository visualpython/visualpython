define([
], function () {

    var INSTANCE_MATCHING_LIBRARY = {
        /**
         * Type: {
         *   method: {
         *     target: 'key_name',
         *   }, ...
         * }
         */
        'DataFrame': {
            'head': {
                'id': 'pdIdt_head',
                'target': 'i0'
            },
            'tail': {
                'id': 'pdIdt_tail',
                'target': 'i0'
            },
            'take': {
                'id': 'pdIdt_take',
                'target': 'i0'
            },
            'value_counts': {
                'id': 'pdIdt_valueCounts',
                'target': 'i0'
            },
            'info': {
                'id': 'pdIdt_info',
                'target': 'i0'
            },
            'describe': {
                'id': 'pdIdt_describe',
                'target': 'i0'
            },
            'groupby': {
                'id': 'pdGrp_groupby',
                'target': 'i0'
            },
            'sum': {
                'id': 'pdGrp_sum',
                'target': 'i0'
            },
            'mean': {
                'id': 'pdGrp_mean',
                'target': 'i0'
            },
            'count': {
                'id': 'pdGrp_count',
                'target': 'i0'
            },
            'max': {
                'id': 'pdGrp_max',
                'target': 'i0'
            },
            'min': {
                'id': 'pdGrp_min',
                'target': 'i0'
            },
            'median': {
                'id': 'pdGrp_median',
                'target': 'i0'
            },
            'std': {
                'id': 'pdGrp_std',
                'target': 'i0'
            },
            'quantile': {
                'id': 'pdGrp_quantile',
                'target': 'i0'
            },
            'dropna': {
                'id': 'pdFunc_dropNA',
                'target': 'i0'
            },
            'fillna': {
                'id': 'pdFunc_fillNA',
                'target': 'i0'
            },
            'duplicated': {
                'id': 'pdFunc_isDuplicated',
                'target': 'i0'
            },
            'drop_duplicates': {
                'id': 'pdFunc_dropDuplicates',
                'target': 'i0'
            },
            'combine_first': {
                'id': 'pdFunc_combineFirst',
                'target': 'i0'
            },
            'sort_index': {
                'id': 'pdSdt_sortByIndex',
                'target': 'i0'
            },
            'sort_values': {
                'id': 'pdSdt_sortByValues',
                'target': 'i0'
            },
            'drop': {
                'id': 'pdEdtRC_dropRowCol',
                'target': 'i0'
            },
            'reindex': {
                'id': 'pdFunc_reindex',
                'target': 'i0'
            },
            'set_index': {
                'id': 'pdFunc_setIndex',
                'target': 'i0'
            },
            'reset_index': {
                'id': 'pdFunc_resetIndex',
                'target': 'i0'
            },
            'replace': {
                'id': 'pdFunc_replace',
                'target': 'i0'
            },
        },
        'Series': {
            'head': {
                'id': 'pdIdt_head',
                'target': 'i0'
            },
            'tail': {
                'id': 'pdIdt_tail',
                'target': 'i0'
            },
            'take': {
                'id': 'pdIdt_take',
                'target': 'i0'
            },
            'value_counts': {
                'id': 'pdIdt_valueCounts',
                'target': 'i0'
            },
            'info': {
                'id': 'pdIdt_info',
                'target': 'i0'
            },
            'describe': {
                'id': 'pdIdt_describe',
                'target': 'i0'
            },
            'groupby': {
                'id': 'pdGrp_groupby',
                'target': 'i0'
            },
            'sum': {
                'id': 'pdGrp_sum',
                'target': 'i0'
            },
            'mean': {
                'id': 'pdGrp_mean',
                'target': 'i0'
            },
            'count': {
                'id': 'pdGrp_count',
                'target': 'i0'
            },
            'max': {
                'id': 'pdGrp_max',
                'target': 'i0'
            },
            'min': {
                'id': 'pdGrp_min',
                'target': 'i0'
            },
            'median': {
                'id': 'pdGrp_median',
                'target': 'i0'
            },
            'std': {
                'id': 'pdGrp_std',
                'target': 'i0'
            },
            'quantile': {
                'id': 'pdGrp_quantile',
                'target': 'i0'
            },
            'dropna': {
                'id': 'pdFunc_dropNA',
                'target': 'i0'
            },
            'fillna': {
                'id': 'pdFunc_fillNA',
                'target': 'i0'
            },
            'duplicated': {
                'id': 'pdFunc_isDuplicated',
                'target': 'i0'
            },
            'drop_duplicates': {
                'id': 'pdFunc_dropDuplicates',
                'target': 'i0'
            },
            'combine_first': {
                'id': 'pdFunc_combineFirst',
                'target': 'i0'
            },
            'sort_index': {
                'id': 'pdSdt_sortByIndex',
                'target': 'i0'
            },
            'sort_values': {
                'id': 'pdSdt_sortByValues',
                'target': 'i0'
            },
        },
        'Index': {
            'take': {
                'id': 'pdIdt_take',
                'target': 'i0'
            },
            'value_counts': {
                'id': 'pdIdt_valueCounts',
                'target': 'i0'
            },
            'dropna': {
                'id': 'pdFunc_dropNA',
                'target': 'i0'
            },
            'fillna': {
                'id': 'pdFunc_fillNA',
                'target': 'i0'
            },
            'duplicated': {
                'id': 'pdFunc_isDuplicated',
                'target': 'i0'
            },
            'drop_duplicates': {
                'id': 'pdFunc_dropDuplicates',
                'target': 'i0'
            },
            'sort_values': {
                'id': 'pdSdt_sortByValues',
                'target': 'i0'
            },
        },
        'GroupBy': {
            'head': {
                'id': 'pdIdt_head',
                'target': 'i0'
            },
            'tail': {
                'id': 'pdIdt_tail',
                'target': 'i0'
            },
            'take': {
                'id': 'pdIdt_take',
                'target': 'i0'
            },
            'size': {
                'id': 'pdGrp_size',
                'target': 'i0'
            },
            'value_counts': {
                'id': 'pdIdt_valueCounts',
                'target': 'i0'
            },
            'describe': {
                'id': 'pdIdt_describe',
                'target': 'i0'
            },
        },
        'pandas': {
            'merge': {
                'id': 'pdFunc_merge'
            },
            'concat': {
                'id': 'pdFunc_concat'
            },
            'isnull': {
                'id': 'pdFunc_isNull'
            },
            'notnull': {
                'id': 'pdFunc_notNull'
            },
            'cut': {
                'id': 'pdFunc_cut'
            },
            'qcut': {
                'id': 'pdFunc_qcut'
            },
        }
    }

    return {
        INSTANCE_MATCHING_LIBRARY: INSTANCE_MATCHING_LIBRARY
    }
});