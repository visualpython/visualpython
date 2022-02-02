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
     *          asParam
     *          code
     *      }
     * ]
     */
    var NUMPY_LIBRARIES = {
        'np_array': {
            name: 'array',
            library: 'numpy',
            description: '',
            code: '${o0} = np.array(${i0}${dtype})',
            options: [
                {
                    name: 'i0',
                    label: 'Input Parameter',
                    component: ['1darr', '2darr', 'scalar', 'param'],
                    required: true
                },
                {
                    name: 'o0',
                    label: 'Allocate to',
                    placeholder: 'New variable'
                },
                {
                    name: 'dtype',
                    label: 'Select Data Type',
                    code: ', dtype=${dtype}',
                    component: ['dtype']
                }
            ]
        }
    };

    return { 
        NUMPY_LIBRARIES: NUMPY_LIBRARIES
    };

});