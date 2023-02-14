const path = require('path');

module.exports = {
    resolve: {
        alias: {
            "vp_base": path.resolve(__dirname, "lib/visualpython"),
            "text": path.resolve(__dirname, "lib/visualpython/lib/require/text"),
            'css': path.resolve(__dirname, "lib/visualpython/lib/require/css.min"),
            "jquery": path.resolve(__dirname, "lib/visualpython/lib/jquery/jquery-3.6.0.min"),
            "jquery-ui": path.resolve(__dirname, "lib/visualpython/lib/jquery/jquery-ui.min"),
            "jquery-ui-css": path.resolve(__dirname, "lib/visualpython/lib/jquery/jquery-ui.min_org.css"),
            "codemirror":path.resolve(__dirname, "lib/visualpython/lib/codemirror"),
            "mathjaxutils": path.resolve(__dirname, "lib/visualpython/lib/mathjax/mathjaxutils"),
        }           
    },
    module: {
        rules: [
            {    
                test: /\.(woff|woff2|eot|ttf|otf)(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset/resource'
            }
        ]
    }
};