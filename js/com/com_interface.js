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
        } else if (vpConfig.extensionType === 'lab') {
            var { NotebookActions } = require('@jupyterlab/notebook');
            var notebookPanel = vpKernel.getLabNotebookPanel();
            if (notebookPanel && notebookPanel.sessionContext){
                var sessionContext = notebookPanel.sessionContext;	
                let sessionType = sessionContext.type;
                if (sessionType === 'notebook') {
                    var notebook = notebookPanel.content;
                    var notebookModel = notebook.model;
            
                    var cellModel = notebookModel.contentFactory.createCell(type, {});				
                    cellModel.value.text = command;
            
                    const newCellIndex = notebook.activeCellIndex + 1;
                    // 셀 추가
                    notebookModel.cells.insert(newCellIndex, cellModel);				
                    notebook.activeCellIndex = newCellIndex;
            
                    var cell = notebook.activeCell;
                    if (exec == true) {
                        try{
                            NotebookActions.run(notebook, sessionContext);
                        } catch(err){
                            vpLog.display(VP_LOG_TYPE.ERROR, err);
                        }
                    }
                    // move to executed cell
                    let activeCell = notebookPanel.content.activeCell;
                    let activeCellTop = $(activeCell.node).position().top;
                    // scroll to current cell top
                    $(notebookPanel.layout.widgets[2].node).animate({scrollTop: activeCellTop},"fast");
                } else if (sessionType === 'console') {
                    var labConsole = notebookPanel.content;
                    var widget = labConsole.widgets[0];

                    // execute or not
                    if (exec == true) {
                        // console allow only code cell
                        var cellModel = widget.createCodeCell();
                        cellModel.model.value.text = command;
                        widget.addCell(cellModel);
                        widget._execute(cellModel);
                    } else {
                        widget.promptCell.model.value.text = command;
                    }
                    widget.promptCell.inputArea.editor.focus();
                }
            } else {
                // No session found
                com_util.renderAlertModal('Visual Python only supports Notebook and Console type.  Please use appropriate type of file to use it.');
            }
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

        if (vpConfig.extensionType === 'lab') {
            var { NotebookActions } = require('@jupyterlab/notebook');
            var notebookPanel = vpKernel.getLabNotebookPanel();
        }
        
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
            } else if (vpConfig.extensionType === 'lab') {
                if (notebookPanel && notebookPanel.sessionContext){ 
                    var sessionContext = notebookPanel.sessionContext;	
                    let sessionType = sessionContext.type;
                    if (sessionType === 'notebook') {
                        var notebook = notebookPanel.content;
                        var notebookModel = notebook.model;
                
                        var options = {	};
                        var cellModel = notebookModel.contentFactory.createCell(type, options);				
                        cellModel.value.text = command;
                
                        const newCellIndex = notebook.activeCellIndex + 1;
                        // 셀 추가
                        notebookModel.cells.insert(newCellIndex, cellModel);				
                        notebook.activeCellIndex = newCellIndex;
                
                        var cell = notebook.activeCell;
                        if (exec == true) {
                            try{
                                NotebookActions.run(notebook, sessionContext);
                            } catch(err){
                                vpLog.display(VP_LOG_TYPE.ERROR, err);
                            }
                        }
                    } else if (sessionType === 'console') {
                        var console = notebookPanel.content;
                        var cellModel = console.contentFactory.createCell(type, {});
                        cellModel.value.text = command;

                    } 
                } else {
                    // No session found
                    com_util.renderAlertModal('Visual Python only supports Notebook and Console type. Please use appropriate type of file to use it.');
                }
            }
        });
        
        // move to executed cell
        if (vpConfig.extensionType === 'notebook') {
            Jupyter.notebook.scroll_to_cell(Jupyter.notebook.get_selected_index());
        } else if (vpConfig.extensionType === 'colab') {
            // CHROME: TODO:

        } else if (vpConfig.extensionType === 'lab') {
            // LAB: TODO:
            let activeCell = notebookPanel.content.activeCell;
            let activeCellTop = $(activeCell.node).position().top;
            // scroll to current cell top
            $(notebookPanel.layout.widgets[2].node).animate({scrollTop: activeCellTop},"fast");
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