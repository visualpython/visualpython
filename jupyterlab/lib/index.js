const path = require('path');
const $ = require('jquery');
require("jquery-ui");

function vp_css_loader(path) {
    return path + '.css';
}

function vp_text_loader(path) {
    return '!!text-loader!' + path;
}

function vp_raw_loader(path) {
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