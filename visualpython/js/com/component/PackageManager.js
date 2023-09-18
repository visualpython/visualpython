/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : PackageManager.js
 *    Author          : Black Logic
 *    Note            : Component > PackageManager
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2023. 06. 14
 *    Change Date     :
 */
//============================================================================
// [CLASS] PackageManager
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/component/packageManager.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/component/packageManager'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/component/SuggestInput',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/FileNavigation',
    'vp_base/js/com/component/LoadingSpinner'
], function(ifHtml, ifCss, com_util, com_Const, com_String, com_interface, SuggestInput, PopupComponent, FileNavigation, LoadingSpinner) {

    /**
     * PackageManager
     */
    class PackageManager extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.name = 'Package Manager';
            this.config.codeview = false;
            this.config.dataview = false;
            this.config.runButton = false;
            this.config.sizeLevel = 1;

            this.state = {
                selected: '',
                popupType: '',
                ...this.state
            }

            this.packageLib = {};
            this.packageLibTemplate = {
                'numpy': { pipName: 'numpy' },
                'pandas': { pipName: 'pandas' },
                'pyarrow': { pipName: 'pyarrow' },
                'matplotlib': { pipName: 'matplotlib' },
                'seaborn': { pipName: 'seaborn' },
                'plotly': { pipName: 'plotly' },
                'wordcloud': { pipName: 'wordcloud' },
                'sklearn': { pipName: 'scikit-learn' },
                'scikit_posthocs': { pipName: 'scikit-posthocs' },
                'scipy': { pipName: 'scipy' },
                'statsmodels': { pipName: 'statsmodels' },
                'factor_analyzer': { pipName: 'factor-analyzer' },
                'pingouin': { pipName: 'pingouin' },
                'category_encoders': { pipName: 'category_encoders' },
                'imblearn': { pipName: 'imblearn' },
                'xgboost': { pipName: 'xgboost' },
                'lightgbm': { pipName: 'lightgbm' },
                'catboost': { pipName: 'catboost' },
                'autosklearn': { pipName: 'auto-sklearn' },
                'tpot': { pipName: 'tpot' },
                'pymupdf': { pipName: 'pymupdf' },
                'sweetviz': { pipName: 'sweetviz' },
            }
            
            if (vpConfig.extensionType === 'lite') {
                this.packageLibTemplate = {
                    'numpy': { pipName: 'numpy' },
                    'pandas': { pipName: 'pandas' },
                    'matplotlib': { pipName: 'matplotlib' },
                    'seaborn': { pipName: 'seaborn' },
                    'plotly': { pipName: 'plotly' },
                    'sklearn': { pipName: 'scikit-learn' },
                    'scikit_posthocs': { pipName: 'scikit-posthocs' },
                    'scipy': { pipName: 'scipy' },
                    'statsmodels': { pipName: 'statsmodels' },
                    'factor_analyzer': { pipName: 'factor-analyzer' },
                    'category_encoders': { pipName: 'category_encoders' },
                    'imblearn': { pipName: 'imblearn' },
                    'xgboost': { pipName: 'xgboost' },
                    'lightgbm': { pipName: 'lightgbm' },
                    'catboost': { pipName: 'catboost' },
                    'autosklearn': { pipName: 'auto-sklearn' },
                    'sweetviz': { pipName: 'sweetviz' },
                }
            }
        }

        _unbindEvent() {
            super._unbindEvent();
            $(document).off('change', this.wrapSelector('.vp-pm-search'));
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            let that = this;

            // search item 
            $(document).on('change', this.wrapSelector('.vp-pm-search'), function(evt) {
                var value = $(this).val();
                if (value != '') {
                    $(that.wrapSelector('.vp-pm-item')).hide();
                    $(that.wrapSelector('.vp-pm-item')).filter(function() {
                        let key = $(this).data('key');
                        return key.search(value.toLowerCase()) >= 0;
                    }).show();
                } else {
                    $(that.wrapSelector('.vp-pm-item')).show();
                }
            });

             // sort menu popup
            $(this.wrapSelector('.vp-pm-sort')).on('click', function(evt) {
                evt.stopPropagation();
                $(that.wrapSelector('.vp-pm-sort-menu-box')).toggle();
            });

            // sort item
            $(this.wrapSelector('.vp-pm-sort-menu-item')).on('click', function() {
                var menu = $(this).data('menu');
                if (menu === 'registered') {
                    // sort by name
                    $(that.wrapSelector('.vp-pm-item')).sort(function(a, b) {
                        var keyA = parseInt($(a).data('seq'));
                        var keyB = parseInt($(b).data('seq'));
                        return keyA > keyB ? 1 : -1
                    }).appendTo($(that.wrapSelector('.vp-pm-table')))
                } else if (menu === 'name') {
                    // sort by name
                    $(that.wrapSelector('.vp-pm-item')).sort(function(a, b) {
                        var keyA = $(a).data('key');
                        var keyB = $(b).data('key');
                        return keyA > keyB ? 1 : -1
                    }).appendTo($(that.wrapSelector('.vp-pm-table')))
                } else if (menu === 'installed') {
                    // sort by date
                    $(that.wrapSelector('.vp-pm-item')).sort(function(a, b) {
                        var insA = $(a).data('installed');
                        var insB = $(b).data('installed');
                        if (insA === insB) {
                            var keyA = $(a).data('key');
                            var keyB = $(b).data('key');
                            return keyA > keyB ? 1 : -1
                        }
                        return insA < insB ? 1 : -1
                    }).appendTo($(that.wrapSelector('.vp-pm-table')))
                } else if (menu === 'uninstalled') {
                    $(that.wrapSelector('.vp-pm-item')).sort(function(a, b) {
                        var insA = $(a).data('installed');
                        var insB = $(b).data('installed');
                        if (insA === insB) {
                            var keyA = $(a).data('key');
                            var keyB = $(b).data('key');
                            return keyA > keyB ? 1 : -1
                        }
                        return insA > insB ? 1 : -1
                    }).appendTo($(that.wrapSelector('.vp-pm-table')))
                }
                $(that.wrapSelector('.vp-pm-sort-menu-box')).hide();
            });

            // reload package list
            $(this.wrapSelector('.vp-pm-func-reload')).on('click', function() {
                // reset search keyword
                $(that.wrapSelector('.vp-pm-search')).val('');
                
                // load package list
                that.loadPackageList();
            });

            // add package
            $(this.wrapSelector('.vp-pm-add')).on('click', function() {
                that.openOptionPopup('add');
            });
        }

        bindItemEvent() {
            let that = this;

            // item menu click
            $(this.wrapSelector('.vp-pm-item-menu-item')).off('click');
            $(this.wrapSelector('.vp-pm-item-menu-item:not(.disabled)')).on('click', function(evt) {
                var menu = $(this).data('menu');
                var item = $(this).closest('.vp-pm-item');
                var key = $(item).data('key');
                if (menu === 'install') {
                    that.state.selected = key;
                    that.openOptionPopup('install');
                } else if (menu === 'uninstall') {
                    var pipName = that.packageLib[key].pipName;
                    var code = com_util.formatString("!pip uninstall -y {0}", pipName);
                    if (vpConfig.extensionType === 'lite') {
                        code = com_util.formatString("%pip uninstall {0}", pipName);
                    }
                    // DEPRECATED: no longer save to block as default
                    // create block and run it
                    // $('#vp_wrapper').trigger({
                    //     type: 'create_option_page', 
                    //     blockType: 'block',
                    //     menuId: 'lgExe_code',
                    //     menuState: { taskState: { code: code } },
                    //     afterAction: 'run'
                    // });
                    com_interface.insertCell('code', code, true, 'Package Manager');
                    that.loadPackageList();
                } else if (menu === 'upgrade') {
                    var pipName = that.packageLib[key].pipName;
                    var code = com_util.formatString("!pip install --upgrade {0}", pipName);
                    if (vpConfig.extensionType === 'lite') {
                        code = com_util.formatString("%pip install {0}", pipName);
                    }
                    // DEPRECATED: no longer save to block as default
                    // create block and run it
                    // $('#vp_wrapper').trigger({
                    //     type: 'create_option_page', 
                    //     blockType: 'block',
                    //     menuId: 'lgExe_code',
                    //     menuState: { taskState: { code: code } },
                    //     afterAction: 'run'
                    // });
                    com_interface.insertCell('code', code, true, 'Package Manager');
                    that.loadPackageList();
                } else if (menu === 'delete') {
                    $(item).remove();
                    delete that.packageLib[key];
                    vpConfig.removeData('packageList', 'vppackman').then(function() {
                        vpConfig.setData({ 'packageList': that.packageLib }, 'vppackman');
                        that.loadPackageList();
                    });
                }
                evt.stopPropagation();
            });
        }

        templateForBody() {
            return ifHtml;
        }

        templateForAddPage() {
            return `<div class="vp-grid-col-110 vp-grid-border-box">
                <label class="vp-orange-text">Package name</label>
                <input type="text" class="vp-inner-popup-package" required/>
                <label>Pip name</label>
                <input type="text" class="vp-inner-popup-pip"/>
            </div>`;
        }

        templateForInstallPage() {
            return `<div class="vp-grid-box">
                <label class="vp-bold">Version selection</label>
                <div class="vp-grid-border-box">
                    <label><input type="radio" name="ver_select" class="vp-inner-popup-latest" value="latest" checked/><span>Latest version</span></label>
                    <div>
                        <label><input type="radio" name="ver_select" class="vp-inner-popup-specified" value="specified"/><span>Specified version</span></label>
                        <input type="text" class="vp-inner-popup-version" placeholder="0.0.0" disabled/>
                    </div>
                </div>
            </div>`;
        }

        openOptionPopup(type) {
            let that = this;
            let title = '';
            let size = { width: 400, height: 250 };

            $(this.wrapSelector('.vp-inner-popup-body')).empty();

            this.state.popupType = type;
            switch (type) {
                case 'add':
                    title = 'Add new package to manage'
                    $(this.wrapSelector('.vp-inner-popup-body')).html(this.templateForAddPage());
                    break;
                case 'install':
                    title = 'Install package'
                    // set content
                    $(this.wrapSelector('.vp-inner-popup-body')).html(this.templateForInstallPage());

                    $(this.wrapSelector('.vp-inner-popup-body input[name="ver_select"]')).on('change', function() {
                        let checkedType = $(this).val();
                        if (checkedType === 'specified') {
                            $(that.wrapSelector('.vp-inner-popup-version')).prop('disabled', false);
                        } else {
                            $(that.wrapSelector('.vp-inner-popup-version')).prop('disabled', true);
                        }
                    });
                    break;
            }

            // set size and position
            $(this.wrapSelector('.vp-inner-popup-box')).css({
                width: size.width,
                height: size.height,
                left: 'calc(50% - ' + (size.width/2) + 'px)',
                top: 'calc(50% - ' + (size.height/2) + 'px)',
            });

            // show popup box
            this.openInnerPopup(title);
        }

        handleInnerOk() {
            switch (this.state.popupType) {
                case 'add':
                    var packName = $(this.wrapSelector('.vp-inner-popup-package')).val();
                    var pipName = $(this.wrapSelector('.vp-inner-popup-pip')).val();
                    if (pipName === '') {
                        pipName = packName;
                    }
                    this.packageLib[packName] = { pipName: pipName };
                    vpConfig.setData({ 'packageList': this.packageLib }, 'vppackman');

                    // load package list
                    this.loadPackageList();
                    break;
                case 'install':
                    let versionType = $(this.wrapSelector('.vp-inner-popup-body input[name="ver_select"]:checked')).val();
                    var pipName = this.packageLib[this.state.selected].pipName;
                    var code = com_util.formatString("!pip install {0}", pipName);
                    if (vpConfig.extensionType === 'lite') {
                        code = com_util.formatString("%pip install {0}", pipName);
                    }
                    if (versionType === 'specified') {
                        // specified version
                        let version = $(this.wrapSelector('.vp-inner-popup-version')).val();
                        if (version && version !== '') {
                            code = com_util.formatString("!pip install {0}=={1}", pipName, version);
                            if (vpConfig.extensionType === 'lite') {
                                code = com_util.formatString("%pip install {0}=={1}", pipName, version);
                            }
                        } else {
                            $(this.wrapSelector('.vp-inner-popup-version')).focus();
                            return false;
                        }
                    }
                    // DEPRECATED: no longer save to block as default
                    // create block and run it
                    // $('#vp_wrapper').trigger({
                    //     type: 'create_option_page', 
                    //     blockType: 'block',
                    //     menuId: 'lgExe_code',
                    //     menuState: { taskState: { code: code } },
                    //     afterAction: 'run'
                    // });
                    com_interface.insertCell('code', code, true, 'Package Manager');
                    
                    // load package list
                    this.loadPackageList();
                    break;
            }

            this.closeInnerPopup();
        }

        render() {
            super.render();

            let that = this;
            let loadingSpinner = new LoadingSpinner($(this.wrapSelector('.vp-popup-body')));
            vpConfig.getData('', 'vppackman').then(function(savedData) {
                // Reset abnormal data
                if (savedData == undefined || savedData.packageList === undefined) {
                    savedData = { packageList: JSON.parse(JSON.stringify(that.packageLibTemplate)) };
                    vpConfig.setData({ savedData }, 'vppackman');
                }

                that.packageLib = {
                    ...savedData.packageList
                };
                loadingSpinner.remove();
                // load package list
                that.loadPackageList();
            }).catch(function(err) {
                vpLog.display(VP_LOG_TYPE.ERROR, err);

                that.packageLib = {
                    ...that.packageLibTemplate
                };
                loadingSpinner.remove();
                // load package list
                that.loadPackageList();
            });
        }

        /**
         * 
         * @param {String} key 
         * @param {Object} info installed, version, path
         * @param {number} index sequence of initial package list
         * @returns 
         */
        renderPackageItem(key, info, index) {
            var item = new com_String();
            item.appendFormatLine('<div class="{0}" data-key="{1}" data-installed="{2}" data-seq="{3}">', 'vp-pm-item', key, info.installed===true?'1':'0', index);
            item.appendFormatLine('<div class="{0}" title="{1}">', 'vp-pm-item-header', (info.path?info.path:''));
            item.appendFormatLine('<label>{0}</label>', key);
            if (info.installed === true) {
                item.appendFormatLine('<label class="vp-orange-text">{0}</label>', info.version);
            } else {
                item.appendLine('<label class="vp-orange-text">Not installed</label>');
            }
            item.appendFormatLine('<div class="{0}">', 'vp-pm-item-menu');
            // install
            item.appendFormatLine('<div class="{0} vp-icon-install" data-menu="{1}" title="{2}"></div>'
                                , 'vp-pm-item-menu-item', 'install', 'Install');
            if (vpConfig.extensionType !== 'lite') {
                // upgrade
                item.appendFormatLine('<div class="{0} vp-icon-upgrade {1}" data-menu="{2}" title="{3}"></div>'
                                    , 'vp-pm-item-menu-item', (info.installed===true?'':'disabled'), 'upgrade', 'Upgrade');
                // uninstall
                item.appendFormatLine('<div class="{0} vp-icon-delete {1}" data-menu="{2}" title="{3}"></div>'
                                    , 'vp-pm-item-menu-item', (info.installed===true?'':'disabled'), 'uninstall', 'Uninstall');
            }
            item.appendLine('</div>'); // end of vp-pm-item-menu
            item.appendLine('</div>'); // end of vp-pm-item-header
            // delete button
            item.appendLine('<span class="vp-icon-close-small vp-pm-item-menu-item vp-pm-item-delete" data-menu="delete"></span>');
            item.appendLine('</div>'); // end of vp-pm-item
            return item.toString();
        }

        generateCode() {
            return '';
        }

        loadPackageList() {
            var that = this;
            // import importlib
            // _vp_pack = importlib.import_module('numpy')
            // print(_vp_pack.__version__)

            // clear table except head
            $(this.wrapSelector('.vp-pm-table')).html('');

            let packageList = Object.keys(this.packageLib);

            // set auto search
            let searchInput = new SuggestInput();
            searchInput.addClass('vp-pm-search vp-input');
            searchInput.setPlaceholder("Search");
            searchInput.setSuggestList(function () { return packageList; });
            $(this.wrapSelector('.vp-pm-search')).replaceWith(searchInput.toTagString());

            let loadingSpinner = new LoadingSpinner($(this.wrapSelector('.vp-popup-body')));
            vpKernel.getPackageList(packageList).then(function(resultObj) {
                let { result } = resultObj;
                let packageInfo = JSON.parse(result);

                // load code list
                var innerFuncCode = new com_String();
                Object.keys(packageInfo).forEach((key, idx) => {
                    let info = packageInfo[key]; // installed, version, path
                    if (info) {
                        var item = that.renderPackageItem(key, info, idx);
                        innerFuncCode.append(item);
                    }
                });
                $(that.wrapSelector('.vp-pm-table')).html(innerFuncCode.toString());

                // bind item menu event
                that.bindItemEvent();
            }).catch(function() {

            }).finally(function() {
                loadingSpinner.remove();
            });
        }

    }

    return PackageManager;
});