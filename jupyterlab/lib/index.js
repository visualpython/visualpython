const path = require('path');
const $ = require('jquery');
require("jquery-ui");

global.vp_css_loader = function(path) {
    return path + '.css';
}

global.vp_text_loader = function(path) {
    return '!!text-loader!' + path;
}

global.vp_raw_loader = function(path) {
    return path;
}

global.$ = $;
global.vpBase = path.resolve(__dirname, "lib") + '/';
module.exports = [{
    id: 'visualpython:entry',
    autoStart: true,
    activate: function (app) {
        console.log(
            'JupyterLab extension visualpython is activated!'
        );
        
        global.vpExtType = 'lab';
        global.vpLab = app;

        const VpPanel = require('./VpPanel');

        // Add vp to the right area:
        var vpPanel = new VpPanel(app);
        app.shell.add(vpPanel, 'right', { rank: 900, type: 'Visual Python' });
    }
}];