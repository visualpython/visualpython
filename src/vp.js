(
    requirejs.specified('base/js/namespace')
        ? define
        : function (deps, callback) {
            "use strict";
            // if here, the Jupyter namespace hasn't been specified to be loaded. This means
            // that we're probably embedded in a page, so we need to make our definition
            // with a specific module name
            return define('nbextensions/visualpython/src/vp', deps, callback);
        }
)([
    'jquery'
    , 'require'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/container/vpContainer'
    , 'nbextensions/visualpython/src/common/constant'
], function ($, requirejs, vpCommon, sb, vpContainer, vpConst) {
    "use strict";

    /* 전역 변수 영역 */
    var IPython;
    var events;
    var liveNotebook = false;

    // 기본설정
    var defaultConfig;
    var metadataSettings;
    var vpPosition;
    
    try {
        // namespace 의 경우 specifed 체크. events 에 대한 예외 발생 가능할 것으로 예상.
        // this will work in a live notebook because nbextensions & custom.js are loaded
        // by/after notebook.js, which requires base/js/namespace
        IPython = requirejs('base/js/namespace');
        events = requirejs('base/js/events');
        liveNotebook = true;
    } catch (err) {
        // We *are* theoretically in a non-live notebook
        console.log('[vp] working in non-live notebook'); //, err);
        // in non-live notebook, there's no event structure, so we make our own
        if (window.events === undefined) {
            var Events = function () { };
            window.events = $([new Events()]);
        }
        events = window.events;
    }
    var Jupyter = IPython;

    /* 이벤트 영역 */
    // 브라우저 히스토리 이벤트 추가.
    window.addEventListener('popstate', function (e) {
        if (e.state != null && e.state.back != null) {
            var backId = e.state.back;
            document.getElementById(backId).scrollIntoView(true);
            if (liveNotebook) {
                var cell = $(document.getElementById(backId)).closest('.cell').data('cell');
                Jupyter.notebook.select(Jupyter.notebook.find_cell_index(cell));
                //highlight_vp_item("vp_link_click", {cell: cell});
            }
        }
    });

    /* 함수 영역 */
    /**
     * 기본설정 불러오기. 
     * TODO: 하드코딩이 아닌 file read 로 변경 되어야 할듯.
     */
    var readDefaultConfig = function() {
        // default values for system-wide configurable parameters
        defaultConfig = {
            colors: {
                hover_highlight: '#DAA520',
                selected_highlight: '#FFD700',
                running_highlight: '#FF0000',
                wrapper_background: '#FFFFFF',
                sidebar_border: '#EEEEEE',
                navigate_text: '#333333',
                navigate_num: '#000000',
                on_scroll: '#2447f0'
            },
            moveMenuLeft: true,
            navigate_menu: true,
            threshold: 4,
            widenNotebook: false
        };
        // default values for per-notebook configurable parameters
        metadataSettings = {
            nav_menu: {},
            number_sections: true,
            sideBar: true,
            base_numbering: 1,
            title_cell: 'VisualPython',
            title_sidebar: 'VisualPython',
            vp_cell: false,
            vpPosition: {},
            vp_section_display: true,
            vp_window_display: false
        };
    
        // 기본설정 병합
        $.extend(true, defaultConfig, metadataSettings);
        
        // vpPosition default also serves as the defaults for a non-live notebook
        vpPosition = {
            height: 'calc(100% - 180px)',
            width: '50%',
            right: '10px',
            top: '110px'
        };
        $.extend(true, defaultConfig.vpPosition, vpPosition);
    }

    /**
     *  Read our config from server config & notebook metadata
     *  This function should only be called when both:
     *   1. the notebook (and its metadata) has fully loaded
     *  AND
     *   2. Jupyter.notebook.config.loaded has resolved
     */
    var readConfig = function () {
        var cfg = defaultConfig;

        if (!liveNotebook) {
            return cfg;
        }

        // config may be specified at system level or at document level. first, update
        // defaults with config loaded from server
        $.extend(true, cfg, IPython.notebook.config.data.vp);
        // ensure notebook metadata has vp object, cache old values
        var vpMetaData = IPython.notebook.metadata.vp || {};
        // reset notebook metadata to remove old values
        IPython.notebook.metadata.vp = {};
        // then update cfg with any found in current notebook metadata and save in nb
        // metadata (then can be modified per document)
        Object.keys(metadataSettings).forEach(function (key) {
            cfg[key] = IPython.notebook.metadata.vp[key] = (vpMetaData.hasOwnProperty(key) ? vpMetaData : cfg)[key];
        });
        
        return cfg;
    };

    /**
     * 추가 스타일 설정
     * TODO: 조건 추가외에 필요성 요부 검토 필요.
     * @param {defaultConfig} cfg 설정값
     */
    function adjustAdditionalStyle(cfg) {
        var sheet = document.createElement('style');
        
        var sbStyle = new sb.StringBuilder();
        sbStyle.appendFormatLine("#vpBtnToggle li > span:hover { background-color: {0}; }", cfg.colors.hover_highlight);
        sbStyle.appendFormatLine(".vp-item-highlight-select {background-color: {0}; }", cfg.colors.selected_highlight);
        sbStyle.appendFormatLine(".vp-item-highlight-execute {background-color: {0}; }", cfg.colors.running_highlight);
        sbStyle.appendFormatLine(".vp-item-highlight-execute.vp-item-highlight-select {background-color: {0}; }", cfg.colors.selected_highlight);
        
        if (cfg.moveMenuLeft) {
            sbStyle.appendLine("div#menubar-container, div#header-container { width: auto; padding-left: 20px; }");
        }
        // Using custom colors
        sbStyle.appendFormatLine("#vp-wrapper { background-color: {0}; }", cfg.colors.wrapper_background);
        sbStyle.appendFormatLine("#vpBtnToggle a, #navigate_menu a, .vp { color: {0}; }", cfg.colors.navigate_text);
        sbStyle.appendFormatLine("#vp-wrapper .vp-item-num { color: {0}; }", cfg.colors.navigate_num);
        sbStyle.appendFormatLine(".sidebar-wrapper { border-color: {0}; }", cfg.colors.sidebar_border);
        sbStyle.appendFormatLine(".highlight_on_scroll { border-left: solid 4px {0}; }", cfg.colors.on_scroll);

        sheet.innerHTML = sbStyle.toString();
        document.body.appendChild(sheet);
    }

    /**
     * 메타 데이터 반영
     * @param {*} key 설정 키
     * @param {*} value 설정 값
     */
    var setVpMetaData = function (key, value) {
        // Jupyter Notebook 정상 로드된 경우
        if (liveNotebook) {
            var vpMetaData = IPython.notebook.metadata.vp;
            if (vpMetaData === undefined) {
                vpMetaData = IPython.notebook.metadata.vp = {};
            }
            var oldVal = vpMetaData[key];
            vpMetaData[key] = value;
            if (typeof _ !== undefined ? !_.isEqual(value, oldVal) : oldVal != value) {
                IPython.notebook.set_dirty();
            }
        }
        return value;
    };

    /**
     * 툴바 버튼 추가
     * @param {defaultConfig} cfg 설정값
     */
    var addToolBarVpButton = function (cfg) {
        // 툴바가 생성되기 전이라면 노트북앱 초기화 후 호출되도록 이벤트 바인딩
        if (!IPython.toolbar) {
            events.on("app_initialized.NotebookApp", function (evt) {
                addToolBarVpButton(cfg);
            });
            return;
        }
        
        // 툴바 토글버튼이 존재하지 않으면 추가
        if ($("#" + vpConst.TOOLBAR_BTN_INFO.ID).length === 0) {
            $(IPython.toolbar.add_buttons_group([
                Jupyter.keyboard_manager.actions.register({
                    'help': vpConst.TOOLBAR_BTN_INFO.HELP
                    , 'icon': vpConst.TOOLBAR_BTN_INFO.ICON
                    , 'handler': function () {
                        // Extension 버튼 클릭 시 실행
                        toggleVp(cfg);
                    }
                }, vpConst.TOOLBAR_BTN_INFO.NAME, vpConst.TOOLBAR_BTN_INFO.PREFIX)
            ])).find('.btn').attr('id', vpConst.TOOLBAR_BTN_INFO.ID).addClass(vpConst.TOOLBAR_BTN_INFO.ICON_CONTAINER);
        }
    };

    /**
     * Jupyter notebook 넓이 설정
     * @param {defaultConfig} cfg 설정값
     * @param {*} st 
     */
    function setNotebookWidth(cfg, st) {
        var containerWidth = $(vpCommon.getVPContainer()).is(":visible") ? $(vpCommon.getVPContainer()).width() + 6 : 0;
        var jupyterWidth = $(window).width() - containerWidth;
        
        $('#site').width(jupyterWidth);
        $('#notebook-container').width(jupyterWidth - 60 > 1140 ? 1140 : jupyterWidth - 60);
        // var margin = 20;
        // var nbInner = $('#notebook-container');
        // var nbWrapWidth = $('#notebook').width();
        // var sidebar = $(vpCommon.getVPContainer());
        // var visibleSidebar = cfg.sideBar && sidebar.is(':visible');
        // var sidebarWidth = visibleSidebar ? sidebar.outerWidth() : 0;
        // var availableSpace = nbWrapWidth - 2 * margin - sidebarWidth;
        
        // var innerCtyle = {
        //     marginRight: '',
        //     width: ''
        // };
        // if (cfg.widenNotebook) {
        //     innerCtyle.width = availableSpace;
        // }
        // if (visibleSidebar) {
        //     var nbInnerWidth = nbInner.outerWidth();
        //     if (availableSpace <= nbInnerWidth + sidebarWidth + 42) {
        //         innerCtyle.marginRight = sidebarWidth + margin + 42; // shift notebook rightward to fit the sidebar in
        //         if (availableSpace <= nbInnerWidth) {
        //             innerCtyle.width = availableSpace; // also slim notebook to fit sidebar
        //         }
        //     }
        // }
        // nbInner.css(innerCtyle);
    }

    /**
     * 넓이 정보 메타데이터에 저장
     */
    var saveVpPosition = function () {
        var vpWrapper = $(vpCommon.getVPContainer());
        var newValues = ['width'];
        $.extend(vpPosition, vpWrapper.css(newValues));
        setVpMetaData(vpConst.VP_POSITION_META_NAME, vpPosition);
        $(vpCommon.getVPContainer()).css('left', '');
        events.trigger('resize-container.vp-wrapper');
    };

    
    /**
     * 최소화 토글
     * @param {defaultConfig} cfg 설정값
     * @param {*} animate 
     */
    var toggleMinimized = function (cfg, animate) {
        var open = cfg.sideBar || cfg.vp_section_display;
        var newStyle,
            wrap = $(vpCommon.getVPContainer());
        var animOpts = {
            duration: animate ? 'fast' : 0
        };
        if (open) {
            $('#' + vpConst.TOOLBAR_BTN_INFO.ID).show();
            newStyle = cfg.sideBar ? {} : {
                height: vpPosition.height,
                width: vpPosition.width
            };
        } else {
            newStyle = {
                height: wrap.outerHeight() - wrap.find('#' + vpConst.TOOLBAR_BTN_INFO.ID).outerHeight()
            };
            animOpts.complete = function () {
                $('#' + vpConst.TOOLBAR_BTN_INFO.ID).hide();
                $(vpCommon.getVPContainer()).css('width', '');
            };
        }
        wrap.toggleClass('closed', !open)
            .animate(newStyle, animOpts)
            .find('.hide-btn')
            .attr('title', open? 'Hide vp' : 'Show vp');
        return open;
    };

    /**
     * 토글 사이드 바 모드
     * @param {defaultConfig} cfg 설정값
     */
    var toggleSidebar = function (cfg) {
        // var makeSidebar = cfg.sideBar;
        // var viewRect = (liveNotebook ? document.getElementById('site') : document.body).getBoundingClientRect();
        // var wrap = $(vpCommon.getVPContainer())
        //     .toggleClass('sidebar-wrapper', makeSidebar)
        //     .toggleClass('float-wrapper', !makeSidebar)
        //     .resizable('option', 'handles', makeSidebar ? 'w' : 'all');
        // wrap.children('.ui-resizable-w').toggleClass('ui-icon ui-icon-grip-dotted-vertical', makeSidebar);
        // if (makeSidebar) {
        //     wrap.css({ top: viewRect.top, height: '', right: 0 });
        // } else {
        //     wrap.css({ height: vpPosition.height });
        // }
        // setNotebookWidth(cfg);
        
        var viewRect = (liveNotebook ? document.getElementById('site') : document.body).getBoundingClientRect();
        var wrap = $(vpCommon.getVPContainer()).addClass('sidebar-wrapper').resizable('option', 'handles', 'w');
        // wrap.children('.ui-resizable-w').addClass('ui-icon ui-icon-grip-dotted-vertical');
        wrap.css({ top: liveNotebook ? viewRect.top : "110px", height: '', right: 0 });
        setNotebookWidth(cfg);
    };

    /**
     * vp 생성
     * @param {defaultConfig} cfg 설정값
     * @param {*} st 
     */
    var createVpDiv = function (cfg, st) {
        var callbackPageResize = function (evt) {
            setNotebookWidth(cfg);
        };
        // hotkey 제어 input text 인 경우 포커스를 가지면 핫키 막고 잃으면 핫키 허용
        $(document).on("focus", vpCommon.wrapSelector("input[type='text']"), function() {
            Jupyter.notebook.keyboard_manager.disable();
        });
        $(document).on("blur", vpCommon.wrapSelector("input[type='text']"), function() {
            Jupyter.notebook.keyboard_manager.enable();
        });
        // minju: hotkey 제어 input number 인 경우 포커스를 가지면 핫키 막고 잃으면 핫키 허용
        $(document).on("focus", vpCommon.wrapSelector("input[type='number']"), function() {
            Jupyter.notebook.keyboard_manager.disable();
        });
        $(document).on("blur", vpCommon.wrapSelector("input[type='number']"), function() {
            Jupyter.notebook.keyboard_manager.enable();
        });
        // minju: textarea용 - hotkey 제어 textarea 인 경우 포커스를 가지면 핫키 막고 잃으면 핫키 허용
        $(document).on("focus", vpCommon.wrapSelector("textarea"), function() {
            Jupyter.notebook.keyboard_manager.disable();
        });
        $(document).on("blur", vpCommon.wrapSelector("textarea"), function() {
            Jupyter.notebook.keyboard_manager.enable();
        });

        var vpWrapper = $('<div id="' + vpConst.VP_CONTAINER_ID + '"/>').css('display', 'none')
            // vp main container
            .load(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.SOURCE_PATH + vpConst.VP_CONTAINER_PAGE_URL, function (response, status, xhr) {
                if (status === "error") {
                    alert(xhr.status + " " + xhr.statusText);
                } else {
                    vpContainer.containerInit();
                    toggleSidebar(cfg);
                    events.trigger('resize-container.vp-wrapper');
                }
            })
            // .prependTo(liveNotebook ? '#site' : document.body);
            .prependTo(document.body);
        

        // enable dragging and save position on stop moving
        // vpWrapper.draggable({
        //     drag: function (event, ui) {
        //         var notebookWidth = $('#notebook').width();
        //         var vpWrapperWidth = $(vpCommon.getVPContainer()).width();
        //         // console.log('position : ', (ui.position.left + vp_wrap per_width + 22), ' width : ', notebookWidth, ' vp-wrapper-width : ', vpWrapperWidth);
        //         var makeSidebar = (ui.position.left + vpWrapperWidth + 42) >= notebookWidth; // 20 is snapTolerance
        //         if (makeSidebar) {
        //             ui.position.top = (liveNotebook ? document.getElementById('site') : document.body).getBoundingClientRect().top;
        //             ui.position.right = 0;
        //         }
        //         if (makeSidebar !== cfg.sideBar) {
        //             cfg.vp_section_display = setVpMetaData('vp_section_display', true);
        //             cfg.sideBar = setVpMetaData('sideBar', makeSidebar);
        //             toggleMinimized(cfg);
        //             toggleSidebar(cfg);
        //         }
        //     }, //end of drag function
        //     stop: saveVpPosition,
        //     containment: 'parent',
        //     snap: 'body, #site',
        //     snapTolerance: 20
        // });

        vpWrapper.resizable({
            // handles: 'all',
            resize: function (event, ui) {
                if (cfg.sideBar) {
                    // unset the height set by jquery resizable
                    $(vpCommon.getVPContainer()).css('height', '');
                    setNotebookWidth(cfg, st);
                }
                events.trigger('resize-container.vp-wrapper');
            },
            start: function (event, ui) {
                if (!cfg.sideBar) {
                    cfg.vp_section_display = setVpMetaData('vp_section_display', true);
                    toggleMinimized(cfg);
                }
                $(this).resizable( "option", "maxWidth", $(document).width() * 0.8);
            },
            stop: saveVpPosition,
            containment: 'parent',
            // minHeight: 100,
            // minWidth: 165,
            handles: 'w',
            resizeHeight: false
        });

        // On header/menu/toolbar resize, resize the vp itself
        $(window).on('resize', callbackPageResize);
        if (liveNotebook) {
            events.on("resize-header.Page toggle-all-headers", callbackPageResize);
            $.extend(vpPosition, IPython.notebook.metadata.vp.vpPosition);
        } else {
            // default to true for non-live notebook
            cfg.vp_window_display = true;
        }
        // restore vp position at load
        vpWrapper.css(cfg.sideBar ? { width: vpPosition.width } : vpPosition);
        // older vp versions stored string representations, so update those
        if (cfg.vp_window_display === 'none') {
            cfg.vp_window_display = setVpMetaData('vp_window_display', false);
        }
        if (cfg.vp_section_display === 'none') {
            cfg.vp_section_display = setVpMetaData('vp_section_display', false);
        }
        vpWrapper.toggle(cfg.vp_window_display);
        $("#" + vpConst.TOOLBAR_BTN_INFO.ID).toggleClass('active', cfg.vp_window_display);
        if (!cfg.vp_section_display) {
            toggleMinimized(cfg);
        }

        // // 영역 dragable 제어 헤더부분에서만 기동
        // vpWrapper.draggable( "disable" );
        // $(document).on("mouseover", vpCommon.wrapSelector("#vp_headerContainer .vp-header"), function() {
        //     vpWrapper.draggable( "enable" );
        // });
        // $(document).on("mouseout", vpCommon.wrapSelector("#vp_headerContainer .vp-header"), function() {
        //     vpWrapper.draggable( "disable" );
        // });
    };

    /**
     * vp 생성
     * @param {defaultConfig} cfg 설정값
     * @param {*} st 
     */
    var loadVpResource = function (cfg, st) {
        if (!liveNotebook)
            cfg = $.extend(true, {}, defaultConfig, cfg);
        
        // 구버전 css load
        // vpCommon.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH +  "container" + vpConst.PATH_SEPARATOR + "vpContainer.css");
        
        var vpWrapper = $(vpCommon.getVPContainer());
        if (vpWrapper.length === 0) { // vp window doesn't exist at all
            createVpDiv(cfg, st); // create it
        }

        // update sidebar/window title
        $(vpCommon.wrapSelector("#vp_headerContainer", ">", ".header")).text(cfg.title_sidebar + ' ');
    };

    /**
     * toggle vp 영역 표시
     * @param {defaultConfig} cfg 설정값
     * @param {*} st 
     */
    var toggleVp = function (cfg, st) {
        // toggle draw (first because of first-click behavior)
        var wrap = $(vpCommon.getVPContainer());
        var show = wrap.is(':hidden');
        wrap.toggle(show);
        
        cfg['vp_window_display'] = setVpMetaData('vp_window_display', show);
        setNotebookWidth(cfg);
        vpInit(cfg);
        $("#" + vpConst.TOOLBAR_BTN_INFO.ID).toggleClass('active');
        
        // 영역 표시시 resize event trigger
        if (show)
            events.trigger('resize-container.vp-wrapper');
    };

    /**
     * 사용할 파이썬 코드를 함수로 구성해 초기에만 한 번 실행함
     */
    var read_kernel_functions = function() {
        // FIXME: 여러 개 파일 받아올 것도 고려해야 함

        var libraryList = [ 
            "functions/printCommand.py"
            , "functions/fileNaviCommand.py"
            , "functions/pandasCommand.py"
            , "functions/variableCommand.py"
        ];
        libraryList.forEach(libName => {
            var libPath = Jupyter.notebook.base_url + "nbextensions/visualpython/src/api/" + libName
            $.get(libPath).done(function(data) {
                var code_init = data;
                Jupyter.notebook.kernel.execute(code_init, { iopub: { output: function(data) {
                    console.log('visualpython - loaded library', data);
                } } }, { silent: false });
            }).fail(function() {
                console.log('visualpython - failed to load getPath library');
            });
        })
    }

    /**
     * 외부 호출 Init
     * @param {defaultConfig} cfg 설정값
     * @param {*} st 
     */
    var vpInit = function (cfg, st) {
        // 전달된 설정값이 없는 경우 불러온다.
        if (cfg === undefined) {
            cfg = readConfig();
        }

        // vp 내부 커널 함수 실행
        read_kernel_functions();
        
        // 추가 스타일 설정
        adjustAdditionalStyle(cfg);

        // 툴바 버튼 추가
        addToolBarVpButton(cfg);

        // vp 생성
        loadVpResource(cfg);
    }
    
    // 기본설정 불러오기
    readDefaultConfig();

    return {
        vpInit: vpInit, readConfig: readConfig
    };
});
// export vpInit to global namespace for backwards compatibility Do
// export synchronously, so that it's defined as soon as this file is loaded
if (!requirejs.specified('base/js/namespace')) {
    window.vpInit = function (cfg, st) {
        "use strict";
        // use require to ensure the module is correctly loaded before the actual call
        // is made
        requirejs(['nbextensions/visualpython/src/vp'], function (vp) {
            vp.vpInit(cfg, st);
        });
    };
}
