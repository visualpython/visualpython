define([
	'@jupyterlab/ui-components',
	'@lumino/widgets',
	'../style/icon.svg',
	'text', 
	'css', 
	'jquery', 
	'jquery-ui', 
	'jquery-ui-css',
	'codemirror/lib/codemirror', 
	// __VP_CSS_LOADER__('codemirror/lib/codemirror'), // INTEGRATION: unified version of css loader 
	'vp_base/js/loadVisualpython',
	'vp_base/js/com/com_Config'
], function(
	{ LabIcon }, { Panel, Widget }, 
	vpIcon, 
	text, css, $, 
	ui, uiCss,
	codemirror, 
	// cmCss, 
	loadVisualpython, com_Config) {

	const { 
		JUPYTER_HEADER_SPACING,
		VP_MIN_WIDTH, 
		MENU_MIN_WIDTH,
		BOARD_MIN_WIDTH,
		MENU_BOARD_SPACING
	} = com_Config;

   	class VpPanel extends Panel {
		/**
		 * Constructor
		 */
		constructor(app) {
			super();

			// codemirror
			global.codemirror = codemirror;

			this.app = app;
			this.vpFrame = loadVisualpython.initVisualpython();

			this.id = 'visualpython_vpPanel';
			// LabIcon with svg : @jupyterlab/ui-components/lib/icon/labicon.js
			this.title.icon = new LabIcon({ name: 'visualpython:toggle', svgstr: vpIcon.default });
			this.title.caption = 'Visual Python';
			
			// register node using jquery to element
			this.node = this.vpFrame.renderMainFrame().get(4);
		}

		onResize(msg) {
			super.onResize(msg);
			var { type, width, height } = msg;
			this._resizeVp(width);
			$('#vp_wrapper').css({'left': '', 'height': ''});
		}

		_resizeVp(currentWidth) {
            // calculate inner frame width
            var menuWidth = $('#vp_menuFrame').width();
            var boardWidth = 0;
            var showBoard = $('#vp_boardFrame').is(':visible');
            if (showBoard) {
                boardWidth = currentWidth - menuWidth - MENU_BOARD_SPACING;
                if (boardWidth < BOARD_MIN_WIDTH + MENU_BOARD_SPACING) {
                    boardWidth = BOARD_MIN_WIDTH;
                    menuWidth = currentWidth - (BOARD_MIN_WIDTH + MENU_BOARD_SPACING);
                }
            } else {
                // resize menuWidth if board is hidden
                menuWidth = currentWidth - MENU_BOARD_SPACING;
            }
            $('#vp_menuFrame').width(menuWidth);
            $('#vp_boardFrame').width(boardWidth);

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'resizing wrapper to ', currentWidth, 'with', menuWidth, boardWidth);

            $('#vp_wrapper').width(currentWidth);

            // save current page info
            vpConfig.setMetadata({
                vp_position: { width: currentWidth },
                vp_menu_width: menuWidth,
                vp_note_width: boardWidth
            });
        }

		onBeforeShow() {
			// show #vp_wrapper
			$(this.node).show();
			this.vpFrame.openVp();
			// LAB: FIXME: select which is not toggled to task bar
			// $('.vp-popup-frame').show();
		}

		onAfterHide() {
			// hide #vp_wrapper
			$(this.node).hide();
			// LAB: FIXME: select which is not toggled to task bar
			// hide .vp-popup-frame
			// $('.vp-popup-frame').hide();
		}

		onAfterAttach() {
			this.vpFrame.afterAttach();
		}

		onAfterDetach() {
		}

		onCloseRequest(msg) {
			super.onCloseRequest(msg);
			this.dispose();
		}
    }

    return VpPanel;
});