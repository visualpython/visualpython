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
        if (vpConfig.extensionType === 'notebook') {
            return Jupyter.notebook.get_selected_index();
        } else if (vpConfig.extensionType === 'colab') {
            if (colab.global.notebook.focusedCell) {
                return colab.global.notebook.focusedCell.cellId;
            } else {
                return '';
            }
        }
    }

    /**
     * 
     * @param {String} type code / markdown 
     * @param {String} command 
     * @param {boolean} exec true(default) / false
     * @param {int} sigNum 
     */
    var insertCell = function(type, command, exec=true, sigText='') {
        // Add signature
        if (type == 'code') {
            if (sigText !== '') {
                command = com_util.formatString('# Visual Python: {0}\n', sigText) + command;
            } else {
                command = '# Visual Python\n' + command;
            }
        }

        if (vpConfig.extensionType === 'notebook') {
            var selectedIndex = getSelectedCell();
            var targetCell = Jupyter.notebook.insert_cell_below(type, selectedIndex);
    
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
        } else if (vpConfig.extensionType === 'colab') {
            // CHROME: use colab api to add cell
            let cell = null;
            // get focused index
            let lastFocusedCellId = '';
            let lastFocusedCellIdx = 0;
            try {
                // get focused cell id
                lastFocusedCellId = colab.global.notebook.focusedCell? colab.global.notebook.focusedCell.getId() : null;
                // get focused cell index
                lastFocusedCellIdx = colab.global.notebook.cells.findIndex(cell => cell.getId() === lastFocusedCellId);
            } catch (err) { 
                vpLog.display(VP_LOG_TYPE.ERROR, err);
            }
            if (exec) {
                switch (type) {
                    case "markdown":
                        // add text
                        // create cell to execute
                        colab.global.notebook.insertCell('text', {after:true, index:lastFocusedCellIdx});
                        setTimeout(() => {
                            // cell = colab.global.notebook.focusedCell;
                            cell = colab.global.notebook.cells[lastFocusedCellIdx + 1];
                            cell.setText(command);
                            // colab text cell's focus out is same as running it
                            cell.setFocused(false);
                        }, 300);
                        break;
                    case "code":
                    default:
                        // add code cell
                        // colab.global.notebook.notebookToolbar.toolbarButtons.get("insert-cell-below").click();
                        // create cell to execute
                        colab.global.notebook.insertCell('code', {after:true, index:lastFocusedCellIdx});
                        setTimeout(() => {
                            // cell = colab.global.notebook.focusedCell;
                            cell = colab.global.notebook.cells[lastFocusedCellIdx + 1];
                            cell.setText(command);
                            cell.runButton.click();
                        }, 300);
                }
            }
            // move to executed cell
            // CHROME: TODO:
        }

        com_util.renderSuccessMessage('Your code is successfully generated.');
    }

    /**
     * Insert multiple cells
     * @param {String} type 
     * @param {Array} commands 
     * @param {boolean} exec 
     * @param {int} sigNum 
     */
    var insertCells = function(type, commands, exec=true, sigText='') {
        
        commands && commands.forEach((command, idx) => {
            // Add signature
            if (type == 'code') {
                if (sigText !== '') {
                    command = com_util.formatString('# Visual Python: {0}\n', sigText) + command;
                } else {
                    command = com_util.formatString('# Visual Python') + command;
                }
            }

            if (vpConfig.extensionType === 'notebook') {
                var selectedIndex = getSelectedCell();
                var targetCell = Jupyter.notebook.insert_cell_below(type, selectedIndex);

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
            } else if (vpConfig.extensionType === 'colab') {
                // CHROME: use colab api to add cell
                let cell = null;
                // get focused index
                let lastFocusedCellId = '';
                let lastFocusedCellIdx = 0;
                try {
                    // get focused cell id
                    lastFocusedCellId = colab.global.notebook.focusedCell? colab.global.notebook.focusedCell.getId() : colab.global.notebook.lastFocusedCellId;
                    // get focused cell index
                    lastFocusedCellIdx = colab.global.notebook.cells.findIndex(cell => cell.getId() === lastFocusedCellId);
                } catch (err) { 
                    vpLog.display(VP_LOG_TYPE.ERROR, err);
                }
                if (exec) {
                    switch (type) {
                        case "markdown":
                            // add text
                            // create cell to execute
                            colab.global.notebook.insertCell('text', {after:true, index:lastFocusedCellIdx});
                            setTimeout(() => {
                                // cell = colab.global.notebook.focusedCell;
                                cell = colab.global.notebook.cells[lastFocusedCellIdx + 1];
                                cell.setText(command);
                                // colab text cell's focus out is same as running it
                                cell.setFocused(false);
                            }, 300);
                            break;
                        case "code":
                        default:
                            colab.global.notebook.insertCell('code', {after:true, index:lastFocusedCellIdx});
                            setTimeout(() => {
                                // cell = colab.global.notebook.focusedCell;
                                cell = colab.global.notebook.cells[lastFocusedCellIdx + 1];
                                cell.setText(command);
                                cell.runButton.click();
                            }, 300);
                    }
                }
            }
        });
        
        // move to executed cell
        if (vpConfig.extensionType === 'notebook') {
            Jupyter.notebook.scroll_to_cell(Jupyter.notebook.get_selected_index());
        } else if (vpConfig.extensionType === 'colab') {
            // CHROME: TODO:

        }

        com_util.renderSuccessMessage('Your code is successfully generated.');
    }
    
    var enableOtherShortcut = function() {
        vpLog.display(VP_LOG_TYPE.DEVELOP, 'enable short cut');
        if (vpConfig.extensionType == 'notebook') {
            Jupyter.notebook.keyboard_manager.enable();
        } else if (vpConfig.extensionType == 'colab') {
            ;
        }
    }

    var disableOtherShortcut = function() {
        vpLog.display(VP_LOG_TYPE.DEVELOP, 'disable short cut');
        if (vpConfig.extensionType == 'notebook') {
            Jupyter.notebook.keyboard_manager.disable();
        } else if (vpConfig.extensionType == 'colab') {
            ;
        }
    }
    
    return {
        insertCell: insertCell,
        insertCells: insertCells,
        enableOtherShortcut: enableOtherShortcut,
        disableOtherShortcut: disableOtherShortcut,

    };
});