define([
    'css!vp_base/css/component/instanceEditor.css',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_generatorV2',
    'vp_base/js/com/component/Component',
    'vp_base/js/com/component/SuggestInput'
], function(insCss, com_String, com_util, com_generator, Component, SuggestInput) {

    // temporary const
    const VP_INS_BOX = 'vp-ins-box';
    const VP_INS_SELECT_CONTAINER = 'vp-ins-select-container';
    const VP_INS_SELECT_TITLE = 'vp-ins-select-title';
    const VP_INS_SEARCH = 'vp-ins-search';
    const VP_INS_TYPE = 'vp-ins-type';
    const VP_INS_SELECT_BOX = 'vp-ins-select-box';
    const VP_INS_SELECT_LIST = 'vp-ins-select-list';
    const VP_INS_SELECT_ITEM = 'vp-ins-select-item';

    const VP_INS_PARAMETER_BOX = 'vp-ins-parameter-box';
    const VP_INS_PARAMETER = 'vp-ins-parameter';

    class ModelEditor extends Component {
        constructor(pageThis, targetId, containerId='vp_wrapper') {
            super(null, { pageThis: pageThis, targetId: targetId, containerId: containerId });
        }

        _init() {
            super._init();

            this.pageThis = this.state.pageThis;
            this.targetId = this.state.targetId;
            this.containerId = this.state.containerId;

            this.state = {
                action: {},
                info: {},
                config: {},
                ...this.state
            }
        }

        render() {
            ;
        }

        getModelCategory(modelType) {
            let mlDict = vpConfig.getMLDataDict();
            let keys = Object.keys(mlDict);
            let modelCategory = '';
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (mlDict[key].includes(modelType)) {
                    modelCategory = key;
                    break;
                }
            }
            return modelCategory;
        }

        getAction(modelType) {
            let category = this.getModelCategory(modelType);
            let defaultActions = {
                'fit': {
                    name: 'fit',
                    code: '${model}.fit(${featureData}, ${targetData})',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X_train' },
                        { name: 'targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'y_train' }
                    ]
                },
                'predict': {
                    name: 'predict',
                    code: '${model}.predict(${featureData})',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X_train' }
                    ]
                },
                'predict_proba': {
                    name: 'predict_proba',
                    code: '${model}.predict_proba(${featureData})',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X_train' }
                    ]
                },
                'transform': {
                    name: 'transform',
                    code: '${model}.transform(${featureData})',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X_train' }
                    ]
                }
            };
            let actions = {};
            switch (category) {
                case 'Regression':
                    actions = {
                        'fit': defaultActions['fit'],
                        'predict': defaultActions['predict'],
                    }
                    break;
                case 'Classification':
                    actions = {
                        'fit': defaultActions['fit'],
                        'predict': defaultActions['predict'],
                        'predict_proba': defaultActions['predict_proba'],
                    }
                    break;
                case 'Auto ML':
                    actions = {
                        'fit': defaultActions['fit'],
                        'predict': defaultActions['predict'],
                    }
                    break;
                case 'Clustering':
                    actions = {
                        'fit': defaultActions['fit'],
                        'predict': defaultActions['predict'],
                    }
                    break;
                case 'Dimension Reduction':
                    actions = {
                        'fit': defaultActions['fit'],
                        'transform': defaultActions['transform'],
                    }
                    break;
            }
            return actions;
        }

        getInfo(modelType) {
            let category = this.getModelCategory(modelType);
            let infos = {};
            let defaultInfos = {
                'score': {
                    name: 'score',
                    code: '${model}.score(${featureData}, {targetData})',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X' },
                        { name: 'targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'y' }
                    ]
                },
                'cross_val_score': {
                    name: 'cross_val_score',
                    import: 'from sklearn.model_selection import cross_val_score',
                    code: '${allocateScore} = cross_val_score(${model}, ${featureData}, ${targetData}${scoring}${cv})',
                    options: [
                        { name: 'featureData', label: 'Feature Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'X' },
                        { name: 'targetData', label: 'Target Data', component: ['var_select'], var_type: ['DataFrame', 'Series'], default: 'y' },
                        { name: 'scoring', component: ['input'], usePair: true },
                        { name: 'cv', component: ['input'], usePair: true },
                        { name: 'allocateScore', label: 'Allocate to', component: ['input'], placeholder: 'New variable' }
                    ]
                }
            }
            switch (category) {
                case 'Regression':
                    infos = {
                        'score': defaultInfos['score'],
                        'cross_val_score': defaultInfos['cross_val_score']
                    }
                    break;
                case 'Classification':
                    infos = {
                        'score': defaultInfos['score'],
                        'cross_val_score': defaultInfos['cross_val_score']
                    }
                    break;
                case 'Auto ML':
                    break;
                case 'Clustering':
                    break;
                case 'Dimension Reduction':
                    break;
            }
            return infos;
        }

        renderPage() {
            var tag = new com_String();
            tag.appendFormatLine('<div class="{0} {1}">', VP_INS_BOX, this.uuid); // vp-select-base

            tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_CONTAINER, 'action');
            tag.appendFormatLine('<div class="vp-multilang {0}">Action</div>', VP_INS_SELECT_TITLE);

            tag.appendFormatLine('<div style="{0}">', 'position: relative;');
            tag.appendFormatLine('<input class="vp-input {0} {1}" type="text" placeholder="Search Action"/>', VP_INS_SEARCH, 'attr');
            tag.appendFormatLine('<input class="{0} {1}" type="hidden"/>', VP_INS_TYPE, 'action');
            tag.appendFormatLine('<i class="{0} {1}"></i>', 'fa fa-search', 'vp-ins-search-icon');
            tag.appendLine('</div>');

            tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_BOX, 'action');
            tag.appendFormatLine('<ul class="{0} {1}" style="height:80px">', VP_INS_SELECT_LIST, 'action');
            tag.appendLine('</ul>');
            tag.appendLine('</div>'); // VP_INS_SELECT_BOX
            tag.appendLine('</div>'); // VP_INS_SELECT_CONTAINER

            tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_CONTAINER, 'info');
            tag.appendFormatLine('<div class="vp-multilang {0}">Info</div>', VP_INS_SELECT_TITLE);

            tag.appendFormatLine('<div style="{0}">', 'position: relative;');
            tag.appendFormatLine('<input class="vp-input {0} {1}" type="text" placeholder="Search Info"/>', VP_INS_SEARCH, 'method');
            tag.appendFormatLine('<input class="{0} {1}" type="hidden"/>', VP_INS_TYPE, 'info');
            tag.appendFormatLine('<i class="{0} {1}"></i>', 'fa fa-search', 'vp-ins-search-icon');
            tag.appendLine('</div>');

            tag.appendFormatLine('<div class="{0} {1}">', VP_INS_SELECT_BOX, 'info');
            tag.appendFormatLine('<ul class="{0} {1}" style="height:80px">', VP_INS_SELECT_LIST, 'info');
            tag.appendLine('</ul>');
            tag.appendLine('</div>'); // VP_INS_SELECT_BOX
            tag.appendLine('</div>'); // VP_INS_SELECT_CONTAINER

            tag.appendFormatLine('<div class="vp-multilang {0}">Options</div>', VP_INS_SELECT_TITLE);
            tag.appendFormatLine('<div class="{0} vp-grid-col-95"></div>', VP_INS_PARAMETER_BOX);
            tag.appendLine('</div>'); // VP_INS_BOX END

            $(this.pageThis.wrapSelector('#' + this.containerId)).html(tag.toString());

            return tag.toString();
        }

        reload() {
            this.renderPage();

            let targetTag = $(this.pageThis.wrapSelector('#' + this.targetId));
            let model = $(targetTag).val();
            let modelType = $(targetTag).find('option:selected').data('type');
            
            let actions = this.getAction(modelType);
            let infos = this.getInfo(modelType);
            this.state.action = { ...actions };
            this.state.info = { ...infos };
            
            var actListTag = new com_String();
            var infoListTag = new com_String();
            
            Object.keys(actions).forEach(actKey => {
                actListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>',
                VP_INS_SELECT_ITEM, actKey, 'action', actKey, actKey);
            });
            Object.keys(infos).forEach(infoKey => {
                infoListTag.appendFormatLine('<li class="{0}" data-var-name="{1}" data-var-type="{2}" title="{3}">{4}</li>',
                VP_INS_SELECT_ITEM, infoKey, 'info', infoKey, infoKey);
            });
            
            $(this.wrapSelector('.' + VP_INS_SELECT_LIST + '.action')).html(actListTag.toString());
            $(this.wrapSelector('.' + VP_INS_SELECT_LIST + '.info')).html(infoListTag.toString());
            
            let that = this;
            // action search suggest
            var suggestInput = new SuggestInput();
            suggestInput.addClass('vp-input action');
            suggestInput.addClass(VP_INS_SEARCH);
            suggestInput.setPlaceholder("Search Action");
            suggestInput.setSuggestList(function () { return Object.keys(actions); });
            suggestInput.setSelectEvent(function (value, item) {
                $(this.wrapSelector()).val(value);
                $(that.wrapSelector('.' + VP_INS_TYPE + '.action')).val(item.type);

                $(that.pageThis.wrapSelector('#' + that.targetId)).trigger({
                    type: "model_editor_selected",
                    varName: value,
                    varOptions: actions[value],
                    isMethod: false
                });
            });
            $(that.wrapSelector('.' + VP_INS_SEARCH + '.action')).replaceWith(function () {
                return suggestInput.toTagString();
            });

            // info search suggest
            suggestInput = new SuggestInput();
            suggestInput.addClass('vp-input info');
            suggestInput.addClass(VP_INS_SEARCH);
            suggestInput.setPlaceholder("Search info");
            suggestInput.setSuggestList(function () { return Object.keys(infos); });
            suggestInput.setSelectEvent(function (value, item) {
                $(this.wrapSelector()).val(value);
                $(that.wrapSelector('.' + VP_INS_TYPE + '.info')).val(item.type);

                $(that.pageThis.wrapSelector('#' + that.targetId)).trigger({
                    type: "model_editor_selected",
                    varName: value,
                    varOptions: infos[value],
                    isMethod: true
                });
            });
            $(that.wrapSelector('.' + VP_INS_SEARCH + '.info')).replaceWith(function () {
                return suggestInput.toTagString();
            });

            // bind event
            this._bindEvent();
        }

        _bindEvent() {
            super._bindEvent();
            let that = this;

            $(this.wrapSelector('.' + VP_INS_SELECT_ITEM)).on('click', function() {
                let name = $(this).data('var-name');
                let type = $(this).data('var-type');
                let config = that.state[type][name];
                let optBox = new com_String();
                // render tag
                config.options.forEach(opt => {
                    let label = opt.name;
                    if (opt.label != undefined) {
                        label = opt.label;
                    }
                    optBox.appendFormatLine('<label for="{0}" title="{1}">{2}</label>'
                        , opt.name, opt.name, label);
                    let content = com_generator.renderContent(that, opt.component[0], opt, that.pageThis.state);
                    optBox.appendLine(content[0].outerHTML);
                });
                // replace option box
                $(that.wrapSelector('.' + VP_INS_PARAMETER_BOX)).html(optBox.toString());

                that.state.config = config;

                // add selection
                $(that.wrapSelector('.' + VP_INS_SELECT_ITEM)).removeClass('selected');
                $(this).addClass('selected');
            });
        }

        show() {
            $(this.wrapSelector()).show();
            this.reload();
        }

        hide() {
            $(this.wrapSelector()).hide();
        }

        getCode(replaceDict={}) {
            let code = new com_String();
            if (this.state.config.import != undefined) {
                code.appendLine(this.state.config.import);
                code.appendLine();
            }
            let modelCode = com_generator.vp_codeGenerator(this.pageThis, this.state.config, this.pageThis.state);
            Object.keys(replaceDict).forEach(key => {
                modelCode = modelCode.replace(key, replaceDict[key]);
            });
            code.append(modelCode);
            return code.toString();
        }
    }

    return ModelEditor;
});