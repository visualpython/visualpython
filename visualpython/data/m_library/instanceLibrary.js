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
            }
        },
        'Series': {
            
        }
    }

    return {
        INSTANCE_MATCHING_LIBRARY: INSTANCE_MATCHING_LIBRARY
    }
});