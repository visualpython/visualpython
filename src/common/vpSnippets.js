define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
    , 'nbextensions/visualpython/src/pandas/common/pandasGenerator'
    , 'nbextensions/visualpython/src/common/component/vpVarSelector'
    , 'nbextensions/visualpython/src/common/kernelApi'

    , 'codemirror/lib/codemirror'
    , 'codemirror/mode/python/python'
    , 'notebook/js/codemirror-ipython'
    , 'codemirror/addon/display/placeholder'
    , 'codemirror/addon/display/autorefresh'
], function (requirejs, $
    
            , vpConst, sb, vpCommon, vpSuggestInputText, pdGen, vpVarSelector, kernelApi
            
            , codemirror) {    

    const VP_SN = 'vp-sn';
    const VP_SN_CONTAINER = 'vp-sn-container';
    const VP_SN_TITLE = 'vp-sn-title';
    const VP_SN_CLOSE = 'vp-sn-close';
    const VP_SN_BODY = 'vp-sn-body';


    /**
     * @class Snippets
     * @param {object} pageThis
     * @param {string} targetId
     * @constructor
     */
    var Snippets = function(pageThis, targetId) {
        this.pageThis = pageThis;
        this.targetId = targetId;
        this.uuid = 'u' + vpCommon.getUUID();

        this.state = {

        }

        this.bindEvent();
        this.init();
    }

    Snippets.prototype.wrapSelector = function(query = '') {
        return vpCommon.formatString('.{0}.{1} {2}', VP_SN, this.uuid, query);
    }

    Snippets.prototype.open = function() {
        $(this.wrapSelector()).show();
    }

    Snippets.prototype.close = function() {
        this.unbindEvent();
        $(this.wrapSelector()).hide();

        // delete page
        // TODO:
    }

    Snippets.prototype.init = function() {
        vpCommon.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "common/snippets.css");
        this.render();
    }

    Snippets.prototype.render = function() {
        var page = new sb.StringBuilder();
        page.appendFormatLine('<div class="{0} {1}">', VP_SN, this.uuid);
        page.appendFormatLine('<div class="{0}">', VP_SN_CONTAINER);

         // title
         page.appendFormat('<div class="{0}">{1}</div>'
         , VP_SN_TITLE
         , 'Snippets');

        // close button
        page.appendFormatLine('<div class="{0}"><img src="{1}"/></div>'
                        , VP_SN_CLOSE, '/nbextensions/visualpython/resource/close_big.svg');

        // body start
        page.appendFormatLine('<div class="{0}">', VP_SN_BODY);



        page.appendLine('</div>');  // body end
        page.appendLine('</div>');  // container end
        page.appendLine('</div>');  // VP_SN end

        $('#vp-wrapper').append(page.toString());
        $(this.wrapSelector()).hide();
    }    

    Snippets.prototype.bindEvent = function() {
        
    }

    Snippets.prototype.unbindEvent = function() {

    }
    

    return Snippets;
});