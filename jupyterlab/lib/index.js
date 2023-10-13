const path = require('path');
const $ = require('jquery');
require("jquery-ui");

global.__VP_CSS_LOADER__ = function(path) {
    return path + '.css';
}

global.__VP_TEXT_LOADER__ = function(path) {
    return '!!text-loader!' + path;
}

global.__VP_RAW_LOADER__ = function(path) {
    return path;
}

const vpId = 'jupyterlab-visualpython:plugin';

const { ICommandPalette } = require('@jupyterlab/apputils');

global.$ = $;
global.vpBase = path.resolve(__dirname, "lib") + '/';
module.exports = [{
    id: vpId,
    autoStart: true,
    requires: [ICommandPalette],
    activate: function (app, palette) {
        console.log(
            'JupyterLab extension visualpython is activated!'
        );
        
        global.vpExtType = 'lab';
        if (app.name === 'JupyterLite') {
            global.vpExtType = 'lite';
        }
        global.vpLab = app;

        const VpPanel = require('./VpPanel');

        // Add vp to the right area:
        var vpPanel = new VpPanel(app);
        app.shell.add(vpPanel, 'right', { rank: 900, type: 'Visual Python' });

        // Add toggle button
        let isVpVisible = app.name !== 'JupyterLab'; // compatible for notebook 7.x (hidden for jupyterlab)
        let toggleCommand = 'jupyterlab-visualpython:toggle-panel';
        let vpLabel = isVpVisible?'Toggle Visual Python':'';
        app.commands.addCommand(toggleCommand, {
            isEnabled: () => isVpVisible,
            isVisible: () => isVpVisible,
            iconClass: 'jp-vp-icon',
            iconLabel: vpLabel,
            execute: () => {
                if (app.shell.rightCollapsed === true || $('#vp_wrapper').is(':visible') === false) {
                    app.shell.activateById('vp_wrapper');
                } else {
                    app.shell.collapseRight();
                }
            }
        });

        // Add command palette
        palette.addItem({
            command: toggleCommand,
            category: 'Visual Python',
            label: 'Toggle Visual Python'
        });
    }
}];