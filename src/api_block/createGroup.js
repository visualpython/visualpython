define([
    'nbextensions/visualpython/src/common/StringBuilder'
    , './api.js'
    , './constData.js'
    , './createBlockBtn.js'
    , './api_list.js'
    , 'nbextensions/visualpython/src/common/constant'
], function ( sb, api, constData, createBlockBtn, api_list, vpConst ) {

    var CreateGroup = function(blockContainerThis, id, name, container, level = 0, open = false) {
        this.blockContainerThis = blockContainerThis;

        this.id = id;
        this.name = name;
        this.container = container;
        this.level = level;
        this.open = open; // default open : false
        
        this.createGroupBtnDom = null;
        this.render();
    }

    CreateGroup.prototype.getId = function() { return this.id; }
    CreateGroup.prototype.getName = function() { return this.name; }

    CreateGroup.prototype.setId = function(id) { this.id = id; }
    CreateGroup.prototype.setName = function(name) { this.name = name; }

    CreateGroup.prototype.getGroupMainDom = function() { return this.createGroupBtnDom; }
    CreateGroup.prototype.setGroupMainDom = function(createGroupBtnDom) {
        this.createGroupBtnDom = createGroupBtnDom;
    }

    CreateGroup.prototype.render = function() {
        var sbCreateGroupBtn = new sb.StringBuilder();
        sbCreateGroupBtn.appendFormatLine('<div class="{0} {1}">', 'vp-block-blocktab-group-box', this.open? '': 'vp-apiblock-minimize');
        sbCreateGroupBtn.appendFormatLine('<div class="{0}"', 'vp-apiblock-tab-navigation-node-block-title vp-accordion-header');
        sbCreateGroupBtn.appendLine(' style="justify-content: flex-start;">');
        sbCreateGroupBtn.appendFormatLine('<div class="{0} {1}">', 'vp-apiblock-panel-area-vertical-btn', this.open? 'vp-apiblock-arrow-up': 'vp-apiblock-arrow-down');
        sbCreateGroupBtn.appendFormatLine('<span class="{0}"></span>', 'vp-accordion-indicator');
        sbCreateGroupBtn.appendLine('</div>');
        sbCreateGroupBtn.appendFormatLine('<span class="{0}"', 'vp-block-blocktab-name vp-block-blocktab-name-title vp-accordion-caption');
        sbCreateGroupBtn.appendFormatLine(' style="font-size: 14px;" title="{0}">{1}</span>', this.getName(), this.getName());
        sbCreateGroupBtn.appendLine('</div>');
        sbCreateGroupBtn.appendFormatLine('<div class="{0} {1} {2}"></div>'
                                    , 'vp-apiblock-group-list'
                                    , 'vp-apiblock-left-tab-' + this.getId()
                                    , 'vp-apiblock-style-column-row-wrap');
        sbCreateGroupBtn.appendLine('</div>');

        var createBlockContainer = $(this.container);
  
        var createGroupBtnDom = $(sbCreateGroupBtn.toString());
        this.setGroupMainDom(createGroupBtnDom);

        createBlockContainer.append(createGroupBtnDom);

        this.createGroupBtnDom = createGroupBtnDom;
    }

    return CreateGroup;
});