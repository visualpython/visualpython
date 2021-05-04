// Adapted from https://gist.github.com/magican/5574556 by minrk
// https://github.com/minrk/ipython_extensions See the history of contributions
// in README.md
// joan test

define([
    'require'
    , 'jquery'
    , 'base/js/namespace'
    , 'base/js/events'
    , 'nbextensions/visualpython/src/vp'
    , 'nbextensions/visualpython/src/common/constant'
], function (requirejs, $, Jupyter, events, vp, vpConst) {
    "use strict";

    /* 전역 변수 영역 */
    const origin = window.location.origin;
    const connectorAddress = `${origin}` + vpConst.PATH_SEPARATOR + vpConst.BASE_PATH;

    // imports
    var IPython = Jupyter;

    var mode = 'dev';

    /* 함수 영역 */
    /**
     * 익스텐션 로드(시작점)
     */
    var load_ipython_extension = function () {
        load_css();

        // Wait for the notebook to be fully loaded
        // 쥬피터 노트북 로딩되지 않았으면 로딩후 호출되도록 이벤트에 바인딩
        if (Jupyter.notebook !== undefined && Jupyter.notebook._fully_loaded) {
            // this tests if the notebook is fully loaded
            console.log("[vp] Notebook fully loaded -- vp initialized ")
            vp_init();
        } else {
            console.log("[vp] Waiting for notebook availability")
            events.on("notebook_loaded.Notebook", function () {
                console.log("[vp] vp initialized (via notebook_loaded)")
                vp_init();
            })
        }
    };

    /**
     * 메인 style 로드
     */
    var load_css = function () {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = requirejs.toUrl(connectorAddress + vpConst.STYLE_PATH + vpConst.MAIN_CSS_URL);
        document.getElementsByTagName("head")[0].appendChild(link);

        // root variables css
        link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = requirejs.toUrl(connectorAddress + vpConst.STYLE_PATH + 'root.css');
        document.getElementsByTagName("head")[0].appendChild(link);

        // common component css
        link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = requirejs.toUrl(connectorAddress + vpConst.STYLE_PATH + 'component/common.css');
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    /**
     * 비주얼 파이선 초기화
     */
    var vp_init = function () {
        if (mode === 'new') {
            IPython.notebook.config.loaded.then(function() {
                var vp_new = requirejs(['../new/vp']);
                var cfg = vp_new.readConfig();
                vp_new.vpInit(cfg);
            });
        } else {
            // read configuration, then call vp
            IPython.notebook.config.loaded.then(function () {
                var cfg = vp.readConfig();
                vp.vpInit(cfg);
            });
        }
    };

    return { load_ipython_extension: load_ipython_extension };

});
