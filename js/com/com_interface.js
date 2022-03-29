/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : com_interface.js
 *    Author          : Black Logic
 *    Note            : Interface for jupyter
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 09. 16
 *    Change Date     :
 */
define([
    './com_util',
    './com_String'
], function(com_util, com_String) {

    var getSelectedCell = function() {
        return Jupyter.notebook.get_selected_index();
    }

    /**
     * 
     * @param {String} type code / markdown 
     * @param {String} command 
     * @param {boolean} exec true(default) / false
     * @param {int} sigNum 
     */
    var insertCell = function(type, command, exec=true, sigNum=-1) {
        var selectedIndex = getSelectedCell();
        var targetCell = Jupyter.notebook.insert_cell_below(type, selectedIndex);

        // Add signature
        if (type == 'code' && sigNum >= 0) {
            command = com_util.formatString('# VisualPython [{0}]\n', sigNum) + command
        }
        targetCell.set_text(command);
        Jupyter.notebook.select_next();
        if (exec) {
            switch (type) {
                case "markdown":
                    targetCell.render();
                    break;
                case "code":
                default:
                    targetCell.execute();
            }
        }
        // move to executed cell
        Jupyter.notebook.scroll_to_cell(Jupyter.notebook.get_selected_index());

        com_util.renderSuccessMessage('Your code is successfully generated.');
    }

    /**
     * Insert multiple cells
     * @param {String} type 
     * @param {Array} commands 
     * @param {boolean} exec 
     * @param {int} sigNum 
     */
    var insertCells = function(type, commands, exec=true, sigNum=-1) {
        var selectedIndex = getSelectedCell();
        var targetCell = Jupyter.notebook.insert_cell_below(type, selectedIndex);

        commands && commands.forEach((command, idx) => {
            // Add signature
            if (type == 'code' && sigNum >= 0) {
                command = com_util.formatString('# VisualPython [{0}] - {1}\n', sigNum, idx + 1) + command
            }
            targetCell.set_text(command);
            Jupyter.notebook.select_next();
            if (exec) {
                switch (type) {
                    case "markdown":
                        targetCell.render();
                        break;
                    case "code":
                    default:
                        targetCell.execute();
                }
            }

            selectedIndex = getSelectedCell();
            targetCell = Jupyter.notebook.insert_cell_below(type, selectedIndex);
        });
        
        // move to executed cell
        Jupyter.notebook.scroll_to_cell(Jupyter.notebook.get_selected_index());

        com_util.renderSuccessMessage('Your code is successfully generated.');
    }
    
    var enableOtherShortcut = function() {
        vpLog.display(VP_LOG_TYPE.DEVELOP, 'enable short cut');
        Jupyter.notebook.keyboard_manager.enable();
    }

    var disableOtherShortcut = function() {
        vpLog.display(VP_LOG_TYPE.DEVELOP, 'disable short cut');
        Jupyter.notebook.keyboard_manager.disable();
    }
    
    return {
        insertCell: insertCell,
        insertCells: insertCells,
        enableOtherShortcut: enableOtherShortcut,
        disableOtherShortcut: disableOtherShortcut,

    };
});