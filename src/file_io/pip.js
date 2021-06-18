define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/vpCommon'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpFuncJS'
    , 'nbextensions/visualpython/src/common/component/vpSuggestInputText'
], function (requirejs, $, vpCommon, vpConst, sb, vpFuncJS, vpSuggestInputText) {
    // 옵션 속성
    const funcOptProp = {
        stepCount : 1
        , funcName : "pip"
        , funcID : "com_pip"
        , funcArgs : [
            
        ]
    }

    /**
     * html load 콜백. 고유 id 생성하여 부과하며 js 객체 클래스 생성하여 컨테이너로 전달
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     * @param {JSON} meta 메타 데이터
     */
    var optionLoadCallback = function(callback, meta) {
        // document.getElementsByTagName("head")[0].appendChild(link);
        // 컨테이너에서 전달된 callback 함수가 존재하면 실행.
        if (typeof(callback) === 'function') {
            var uuid = 'u' + vpCommon.getUUID();
            // 최대 10회 중복되지 않도록 체크
            for (var idx = 0; idx < 10; idx++) {
                // 이미 사용중인 uuid 인 경우 다시 생성
                if ($(vpConst.VP_CONTAINER_ID).find("." + uuid).length > 0) {
                    uuid = 'u' + vpCommon.getUUID();
                }
            }
            $(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM))).find(vpCommon.formatString(".{0}", vpConst.API_OPTION_PAGE)).addClass(uuid);
            // 옵션 객체 생성
            var pipPackage = new PipPackage(uuid);
            pipPackage.metadata = meta;
            
            // 옵션 속성 할당.
            pipPackage.setOptionProp(funcOptProp);
            // html 설정.
            pipPackage.initHtml();
            callback(pipPackage);  // 공통 객체를 callback 인자로 전달
        }
    }
    
    /**
     * html 로드. 
     * @param {function} callback 호출자(컨테이너) 의 콜백함수
     * @param {JSON} meta 메타 데이터
     */
    var initOption = function(callback, meta) {
        vpCommon.loadHtml(vpCommon.wrapSelector(vpCommon.formatString("#{0}", vpConst.OPTION_GREEN_ROOM)), "file_io/pip.html", optionLoadCallback, callback, meta);
    }

    /**
     * 본 옵션 처리 위한 클래스
     * @param {String} uuid 고유 id
     */
    var PipPackage = function(uuid) {
        this.uuid = uuid;   // Load html 영역의 uuid.
        this.package = {
            input: [
                { name: 'vp_pipMeta' }
            ]
        };
        // alert on changing --yes option with uninstall
        this.alertOnOption = true;
        this.loading = false;

        this.listupPkgDetails = {
            'numpy': { 'description': 'Data Analysis', 'version': 'test' },
            'scipy': { 'description': 'Data Analysis', 'version': 'test' },
            'pandas': { 'description': 'Data Analysis', 'version': 'test' },
            'sympy': { 'description': 'Data Analysis', 'version': 'test' },
            'pgmpy': { 'description': 'Data Analysis', 'version': 'test' },
            'statsmodels': { 'description': 'Data Analysis', 'version': 'test' },
            'matplotlib': { 'description': 'Visualization', 'version': 'test' },
            'seaborn': { 'description': 'Visualization', 'version': 'test' },
            'scikit-learn': { 'description': 'Machine Learning', 'version': 'test' },
            'nltk': { 'description': 'Natural Language Processing', 'version': 'test' },
            'konlpy': { 'description': 'Korean Language Processing', 'version': 'test' },
            'soynlp': { 'description': 'Korean Language Processing', 'version': 'test' },
            'opencv-python': { 'description': 'Image Processing', 'version': 'test' },
            'geopandas': { 'description': 'Geographical Information', 'version': 'test' },
            'surprise': { 'description': 'Recommended', 'version': 'test' },
            'Keras': { 'description': 'Deep Learning', 'version': 'test' },
            'tensorflow': { 'description': 'Deep Learning', 'version': 'test' }
        }
        this.listupPkgList = Object.keys(this.listupPkgDetails);
    }

    /**
     * vpFuncJS 에서 상속
     */
    PipPackage.prototype = Object.create(vpFuncJS.VpFuncJS.prototype);

    /**
     * 유효성 검사
     * @returns 유효성 검사 결과. 적합시 true
     */
    PipPackage.prototype.optionValidation = function() {
        return true;

        // 부모 클래스 유효성 검사 호출.
        // vpFuncJS.VpFuncJS.prototype.optionValidation.apply(this);
    }

    PipPackage.prototype.getMetadata = function(id) {
        if (this.metadata == undefined)
            return "";
        var len = this.metadata.options.length;
        for (var i = 0; i < len; i++) {
            var obj = this.metadata.options[i];
            if (obj.id == id)
                return obj.value;
        }
        return "";
    }

    /**
     * html 내부 binding 처리
     */
    PipPackage.prototype.initHtml = function() {
        var that = this;

        // load css
        this.loadCss(Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "file_io/pip.css");
        
        this.loadInstallPage();
        this.loadInstalledPage();
        this.loadCmdLinePage();
        
        this.loadPackagePages();
        this.showPage('install');


        // E1. event for page selection
        $(this.wrapSelector('#vp_pipSelectPage')).change(function() {
            var value = $(this).val();
            that.showPage(value);
        });

        // E2. click packages
        $(document).on('click', this.wrapSelector('.vp-pip-package-table tr:not(:first)'), function() {
            $(that.wrapSelector('.vp-pip-package-table tr')).removeClass('selected');
            $(this).addClass('selected');
        });

        // E3. install package
        $(document).on('click', this.wrapSelector('#vp_pipInstall'), function() {
            if (that.loading == true) {
                return;   
            }

            var pkgName = $(that.wrapSelector('#vp_pipInstallPage .vp-pip-package-table tr.selected td:nth(0)')).text();
            if (pkgName == undefined) {
                vpCommon.renderAlertModal('Nothing selected.');
                return;
            }

            // check installing
            that.showLoadingBox('Installing ' + pkgName + '...');

            var code = new sb.StringBuilder();
            code.appendFormat('!pip install {0} -q', pkgName);
            that.kernelExecute(code.toString(), function(result) {
                that.hideLoadingBox();
                if (result != undefined && result.includes('ERROR')) {
                    that.openMultiBtnModal(result, ["Ok"], function(clickIndex) {  });
                } else {
                    vpCommon.renderSuccessMessage(pkgName + ' installed!');
                    that.loadPackagePages();
                }

            });
        });

        // E4. upgrade package
        $(document).on('click', this.wrapSelector('#vp_pipUpgrade'), function() {
            if (that.loading == true) {
                return;   
            }

            var pkgName = $(that.wrapSelector('#vp_pipInstalledPage .vp-pip-package-table tr.selected td:nth(0)')).text();
            if (pkgName == undefined) {
                vpCommon.renderAlertModal('Nothing selected.');
                return;
            }

            // check upgrading
            that.showLoadingBox('Upgrading ' + pkgName + '...');

            var code = new sb.StringBuilder();
            code.appendFormat('!pip install {0} --upgrade', pkgName);
            that.kernelExecute(code.toString(), function(result) {

                that.hideLoadingBox();
                if (result != undefined && result.includes('ERROR')) {
                    that.openMultiBtnModal(result, ["Ok"], function(clickIndex) {  });
                } else {
                    vpCommon.renderSuccessMessage(pkgName + ' upgraded!');
                    that.loadPackagePages();
                }

            });
        });

        // E5. uninstall package
        $(document).on('click', this.wrapSelector('#vp_pipUninstall'), function() {
            if (that.loading == true) {
                return;   
            }

            var pkgName = $(that.wrapSelector('#vp_pipInstalledPage .vp-pip-package-table tr.selected td:nth(0)')).text();
            if (pkgName == undefined) {
                vpCommon.renderAlertModal('Nothing selected.');
                return;
            }
            that.openMultiBtnModal("Are you sure you want to uninstall " + pkgName + "?", ["Yes", "No"], function(clickIndex) { 
                // if yes
                if (clickIndex == 0) {
                    // check uninstall
                    that.showLoadingBox('Uninstalling ' + pkgName + '...');

                    var code = new sb.StringBuilder();
                    code.appendFormat('!pip uninstall {0} --yes', pkgName);
                    that.kernelExecute(code.toString(), function(result) {
                        that.hideLoadingBox();
                        if (result != undefined && result.includes('ERROR')) {
                            // show error logs
                            that.openMultiBtnModal(result, ["Ok"], function(clickIndex) {  });
                        } else {
                            vpCommon.renderSuccessMessage(pkgName + ' uninstalled!');
                            that.loadPackagePages();
                        }
                    });
                }

            });

        });
    }

    /**
     * load package pages (Install/Installed Packages)
     */
    PipPackage.prototype.loadPackagePages = function() {
        var that = this;
        this.showLoadingBox();

        // search packages
        this.getPackageList(function(pkgList) {
            // [ {name: _, version: _, 'latest_version': _, 'latest_filetype': _ }]
            // installed package list [['name', 'version', 'latest', 'type']]
            var installedPackages = pkgList.filter(o => that.listupPkgList.includes(o.name));
            // install package list ['key', ... ]
            var installedPackageList = installedPackages.map(o => o.name);
            var installPackages = that.listupPkgList.filter(o => !installedPackageList.includes(o));

            // install page setting
            that.renderPkgSearchBox('vp_pipInstallSearch', installPackages);
            that.renderInstallPkgTbl(installPackages);

            // installed page setting
            that.renderPkgSearchBox('vp_pipInstalledSearch', installedPackageList);
            that.renderInstalledPkgTbl(installedPackages);

            // load finished
            that.hideLoadingBox();
            var selectedPage = $(that.wrapSelector('#vp_pipSelectPage')).val();
            that.showPage(selectedPage);
        });
    }

    /**
     * Get package list on kernel
     * @param {function} callback run after result loaded
     */
    PipPackage.prototype.getPackageList = function(callback) {
        var that = this;

        // 패키지 조회 코드
        var code = new sb.StringBuilder();
        code.append(`!pip list -o --format json`);
        this.kernelExecute(code.toString(), function(result) {
            // outdated packages
            var pkgList1 = JSON.parse(result);

            var code2 = new sb.StringBuilder();
            code2.append(`!pip list -u --format json`);
            that.kernelExecute(code2.toString(), function(result2) {
                // up to date packages
                var pkgList2 = JSON.parse(result2);

                var pkgList = [... pkgList1, ...pkgList2];

                // load callback
                callback(pkgList);
            });

        });
    }

    PipPackage.prototype.showLoadingBox = function(msg = '') {
        this.loading = true;
        $(this.wrapSelector('#vp_pipInstallPage .vp-pip-package-table tr:not(:first)')).hide();
        $(this.wrapSelector('#vp_pipInstalledPage .vp-pip-package-table tr:not(:first)')).hide();
        $(this.wrapSelector('.vp-pip-loading-box')).text(msg == ''? 'Collecting packages...': msg);
        $(this.wrapSelector('.vp-pip-loading-box')).show();
    }

    PipPackage.prototype.hideLoadingBox = function() {
        this.loading = false;
        $(this.wrapSelector('#vp_pipInstallPage .vp-pip-package-table tr')).show();
        $(this.wrapSelector('#vp_pipInstalledPage .vp-pip-package-table tr')).show();
        $(this.wrapSelector('.vp-pip-loading-box')).hide();
    }


    /**
     * show selected page
     * @param {String} pageType pageType : 'install', 'installed', 'command'
     * if pageType == '', hide all
     */
    PipPackage.prototype.showPage = function(pageType = '') {
        // hide all
        $(this.wrapSelector('.vp-pip-inner-box')).hide();

        switch(pageType) {
            case 'install': 
                $(this.wrapSelector('#vp_pipInstallPage')).show();
                break;
            case 'installed':
                $(this.wrapSelector('#vp_pipInstalledPage')).show();
                break;
            case 'command':
                $(this.wrapSelector('#vp_pipCommandPage')).show();
                break;
            default:
                break;
        }
    }

    PipPackage.prototype.renderPkgSearchBox = function(id, suggestList) {
        var that = this;

        // search box
        var suggestInput = new vpSuggestInputText.vpSuggestInputText();
        suggestInput.setComponentID(id);
        suggestInput.setPlaceholder("Search packages");
        suggestInput.addClass('vp-pip-search');
        suggestInput.setSuggestList(function() { return suggestList; });
        suggestInput.setSelectEvent(function(selectedValue) { 
            $(that.wrapSelector('#' + id)).parent().find('.vp-pip-package-table tr:not(:first)').each(function(idx, tag) {
                var name = $(tag).find('td:first').text();
                if (selectedValue == name) {
                    $(that.wrapSelector('#' + id)).parent().find('.vp-pip-package-table tr:not(:first)').removeClass('selected');
                    $(tag).addClass('selected');
                    return;
                }
            });
        });

        $(this.wrapSelector('#' + id)).replaceWith(function() {
            return suggestInput.toTagString();
        });
    }

    /**
     * render install package table
     * @param {Array} installPackages install packages ['key', ... ] 
     */
    PipPackage.prototype.renderInstallPkgTbl = function(installPackages) {
        // package table
        var tblLayoutRequire = this.createHORIZSimpleLayout();
        tblLayoutRequire.addClass('vp-pip-package-table');
        tblLayoutRequire.setMergeCellClass(vpConst.TABLE_LAYOUT_CELL_CENTER_ALIGN);
        // tblLayoutRequire.setColWidth(["30%", "30%", "30%"]);
        // tblLayoutRequire.setHeader(["Package", "Description", "Lastest Version"]);
        tblLayoutRequire.setColWidth(["30%", "*"]);
        tblLayoutRequire.setHeader(["Package", "Description"]);

        // package add
        installPackages.sort(function(a, b) {
            var name1 = a.toUpperCase(); // ignore case
            var name2 = b.toUpperCase(); // ignore case
            if (name1 < name2) {
                return -1;
            }
            if (name1 > name2) {
                return 1;
            }
            // equal
            return 0;
        });
        installPackages.forEach(key => {
            var obj = this.listupPkgDetails[key];
            // tblLayoutRequire.addRow([key, obj.description, obj.version]);
            tblLayoutRequire.addRow([key, obj.description]);
        });

        $(this.wrapSelector('#vp_pipInstallPage .vp-pip-package-box')).html(tblLayoutRequire.toTagString());
    }

    /**
     * render installed package table
     * @param {Array} installedPackages installed package list [['name', 'version', 'latest', 'type']]
     */
    PipPackage.prototype.renderInstalledPkgTbl = function(installedPackages) {
        // package table
        var tblLayoutRequire = this.createHORIZSimpleLayout();
        tblLayoutRequire.addClass('vp-pip-package-table');
        tblLayoutRequire.setMergeCellClass(vpConst.TABLE_LAYOUT_CELL_CENTER_ALIGN);
        tblLayoutRequire.setColWidth(["30%", "30%", "30%"]);
        tblLayoutRequire.setHeader(["Package", "Current Version", "Lastest Version"]);

        // package add
        installedPackages.sort(function(a, b) {
            var name1 = a.name.toUpperCase(); // ignore case
            var name2 = b.name.toUpperCase(); // ignore case
            if (name1 < name2) {
                return -1;
            }
            if (name1 > name2) {
                return 1;
            }
            // equal
            return 0;
        });
        installedPackages.forEach(obj => {
            tblLayoutRequire.addRow([obj.name, obj.version, (obj.latest_version == undefined? 'up to date': obj.latest_version)]);
        });

        $(this.wrapSelector('#vp_pipInstalledPage .vp-pip-package-box')).html(tblLayoutRequire.toTagString());
    }

    /**
     * load install package page
     */
    PipPackage.prototype.loadInstallPage = function() {
        var sbPageContent = new sb.StringBuilder();
        var sbTagString = new sb.StringBuilder();

        // search box
        var suggestInput = new vpSuggestInputText.vpSuggestInputText();
        suggestInput.setComponentID('vp_pipInstallSearch');
        suggestInput.setPlaceholder("Search packages");
        suggestInput.addClass('vp-pip-search');
        sbPageContent.appendLine(suggestInput.toTagString());

        sbPageContent.appendFormatLine('<div class="{0}">', "vp-pip-package-box");

        // package table
        var tblLayoutRequire = this.createHORIZSimpleLayout();
        tblLayoutRequire.addClass('vp-pip-package-table');
        tblLayoutRequire.setMergeCellClass(vpConst.TABLE_LAYOUT_CELL_CENTER_ALIGN);
        // tblLayoutRequire.setColWidth(["30%", "30%", "30%"]);
        // tblLayoutRequire.setHeader(["Package", "Description", "Lastest Version"]);
        tblLayoutRequire.setColWidth(["30%", "*"]);
        tblLayoutRequire.setHeader(["Package", "Description"]);

        sbPageContent.appendLine(tblLayoutRequire.toTagString());
        sbPageContent.appendLine("</div>");

        // loading box
        sbPageContent.appendLine('<div class="vp-pip-loading-box">');
        sbPageContent.appendLine('Collecting packages...');
        sbPageContent.appendLine('</div>')

        // install button
        sbTagString.clear();
        sbTagString.appendFormatLine('<span type="button" id="{0}" class="{1}">{2}</span>'
                    , 'vp_pipInstall', 'vp-opt-action-btn vp-cbtn-gray-white', 'Install');

        sbPageContent.appendLine(sbTagString.toString());

        // 페이지에 로드
        $(this.wrapSelector('#vp_pipInstallPage')).html(sbPageContent.toString());
    }
    
    /**
     * load installed package page
     */
    PipPackage.prototype.loadInstalledPage = function() {
        var sbPageContent = new sb.StringBuilder();
        var sbTagString = new sb.StringBuilder();

        // search box
        var suggestInput = new vpSuggestInputText.vpSuggestInputText();
        suggestInput.setComponentID('vp_pipInstalledSearch');
        suggestInput.setPlaceholder("Search packages");
        suggestInput.addClass('vp-pip-search');
        sbPageContent.appendLine(suggestInput.toTagString());

        sbPageContent.appendFormatLine('<div class="{0}">', "vp-pip-package-box");

        // package table
        var tblLayoutRequire = this.createHORIZSimpleLayout();
        tblLayoutRequire.addClass('vp-pip-package-table');
        tblLayoutRequire.setMergeCellClass(vpConst.TABLE_LAYOUT_CELL_CENTER_ALIGN);
        tblLayoutRequire.setColWidth(["30%", "30%", "30%"]);
        tblLayoutRequire.setHeader(["Package", "Current Version", "Lastest Version"]);

        sbPageContent.appendLine(tblLayoutRequire.toTagString());
        sbPageContent.appendLine("</div>");

        // loading box
        sbPageContent.appendLine('<div class="vp-pip-loading-box">');
        sbPageContent.appendLine('Collecting packages...');
        sbPageContent.appendLine('</div>')

        // install button
        sbTagString.clear();
        sbTagString.appendFormatLine('<span type="button" id="{0}" class="{1}">{2}</span>'
                    , 'vp_pipUpgrade', 'vp-opt-action-btn vp-cbtn-gray-white', 'Upgrade');
        sbTagString.appendFormatLine('<span type="button" id="{0}" class="{1}">{2}</span>'
                    , 'vp_pipUninstall', 'vp-opt-action-btn vp-cbtn-orange-white', 'Uninstall');

        sbPageContent.appendLine(sbTagString.toString());

        // 페이지에 로드
        $(this.wrapSelector('#vp_pipInstalledPage')).html(sbPageContent.toString());
        
    }

    /**
     * load pip command line page
     */
    PipPackage.prototype.loadCmdLinePage = function() {
        var that = this;

        var sbPageContent = new sb.StringBuilder();
        var sbTagString = new sb.StringBuilder();

        // 필수 옵션 테이블 레이아웃
        var tblLayoutRequire = this.createVERSimpleLayout("10%");
        tblLayoutRequire.addClass(vpConst.OPTION_TABLE_LAYOUT_HEAD_HIGHLIGHT);
        tblLayoutRequire.addClass('vp-pip-table');

        var addRowList = [];
        // load metadata
        var decodedMeta = decodeURIComponent(that.getMetadata('vp_pipMeta'));
        if (decodedMeta != "") {
            // set page to command line
            this.showPage('command');

            var colMeta = JSON.parse(decodedMeta);
            // load column data
            for (var i = 0; i < colMeta.length; i++) {
                // checkbox
                sbTagString.clear();
                sbTagString.appendLine("<label>");
                sbTagString.appendFormatLine("<input type='checkbox' class='vp-pip-comment' {0} />", colMeta[i]['vp-pip-comment']?"checked":"");
                sbTagString.appendFormatLine("<span title='{0}'>pip</span></label>", "Check to comment this command");

                var header = sbTagString.toString();

                sbTagString.clear();
                sbTagString.appendFormatLine("<input type='text' class='vp-pip-command' placeholder='{0}' value='{1}'/>", "[command]", colMeta[i]['vp-pip-command']);
                sbTagString.appendFormatLine("<input type='text' class='vp-pip-pkgn' placeholder='{0}' value='{1}'/>", "[package]", colMeta[i]['vp-pip-pkgn']);
                sbTagString.appendFormatLine("<input type='text' class='vp-pip-opt' placeholder='{0}' value='{1}'/>", "[option]", colMeta[i]['vp-pip-opt']);
                sbTagString.appendLine("<div class='vp-icon-btn vp-pip-del'></div>");
                addRowList.push([header, sbTagString.toString()]);
            }
        } else {
            // checkbox
            sbTagString.clear();
            sbTagString.appendLine("<label>");
            sbTagString.appendLine("<input type='checkbox' class='vp-pip-comment' />");
            sbTagString.appendFormatLine("<span title='{0}'>pip</span></label>", "Check to comment this command");

            var header = sbTagString.toString();
            
            // input text (command, package, option)
            sbTagString.clear();
            sbTagString.appendFormatLine("<input type='text' class='vp-pip-command' placeholder='{0}'/>", "[command]");
            sbTagString.appendFormatLine("<input type='text' class='vp-pip-pkgn' placeholder='{0}'/>", "[package]");
            sbTagString.appendFormatLine("<input type='text' class='vp-pip-opt' placeholder='{0}'/>", "[option]");
            sbTagString.appendLine("<div class='vp-icon-btn vp-pip-del'></div>");
            addRowList.push([header, sbTagString.toString()]);
        }

        addRowList.forEach(row => {
            tblLayoutRequire.addRow(row[0], row[1]);
        });

        // add button
        sbTagString.clear();
        sbTagString.appendFormatLine("<input type='button' id='{0}' class='vp-pip-add-btn' value='{1}'/>", "vp_pipAddBtn", "+ Add Package");

        tblLayoutRequire.addRow("", sbTagString.toString());

        // 필수 옵션 영역 (아코디언 박스)
        var accBoxRequire = this.createOptionContainer('pip cmd package options');
        accBoxRequire.setOpenBox(true);
        accBoxRequire.appendContent(tblLayoutRequire.toTagString());
        accBoxRequire.appendContent("<input type='hidden' id='vp_pipMeta'/>");

        sbPageContent.appendLine(accBoxRequire.toTagString());

        // 페이지에 컨트롤 삽입 vpFuncJS 에서 제공
        $(this.wrapSelector('#vp_pipCommandPage')).html(sbPageContent.toString());

        // autocomplete
        var commandSource = ['help', 'install', 'uninstall', 'list', 'show', 'search'];
        var pkgnSource = {
            'help': ['install', 'uninstall', 'list', 'show', 'search'],
            'other': ['pandas', 'numpy', 'matplotlib', 'seaborn', 'scikit-learn', '--help'],
        };
        var optSource = {
            'uninstall': ['--yes'],
            'other': []
        };
        
        $(this.wrapSelector('.vp-pip-command')).autocomplete({
            source: commandSource,
            autoFocus: true
        });
        $(this.wrapSelector('.vp-pip-pkgn')).autocomplete({
            source: function (request, response) {
                var data = request.term;
                var cmd = $(this.element).closest('tr').find('.vp-pip-command').val();
                if (cmd != 'help') {
                    cmd = 'other';
                }
                var filteredSource = pkgnSource[cmd].filter(x => (x.indexOf(data) >= 0));
                response($.map(filteredSource, function (item) {
                    return item;
                }))
            },
            autoFocus: true
        });
        $(this.wrapSelector('.vp-pip-opt')).autocomplete({
            source: function (request, response) {
                var data = request.term;
                var cmd = $(this.element).closest('tr').find('.vp-pip-command').val();
                if (cmd != 'uninstall') {
                    cmd = 'other';
                }
                var filteredSource = optSource[cmd].filter(x => (x.indexOf(data) >= 0));
                response($.map(filteredSource, function (item) {
                    return item;
                }))
            },
            autoFocus: true
        });
        

        // 이벤트 처리
        // E1. Add Package
        $(this.wrapSelector('#vp_pipAddBtn')).click(function() {
            // tblLayoutRequire.addRow(header, inputTag);
            sbTagString.clear();
            sbTagString.appendLine("<label>");
            sbTagString.appendLine("<input type='checkbox' class='vp-pip-comment' />");
            sbTagString.appendFormatLine("<span title='{0}'>pip</span></label>", "Check to comment this command");

            var header = sbTagString.toString();
            
            // input text (command, package, option)
            sbTagString.clear();
            sbTagString.appendFormatLine("<input type='text' class='vp-pip-command' placeholder='{0}'/>", "[command]");
            sbTagString.appendFormatLine("<input type='text' class='vp-pip-pkgn' placeholder='{0}'/>", "[package]");
            sbTagString.appendFormatLine("<input type='text' class='vp-pip-opt' placeholder='{0}'/>", "[option]");
            sbTagString.appendLine("<div class='vp-icon-btn vp-pip-del'></div>");

            var inputTag = sbTagString.toString();

            var rowString = $(vpCommon.formatString("<tr><th>{0}</th><td>{1}</td></tr>", header, inputTag));

            rowString.insertBefore($(that.wrapSelector('.vp-pip-table tr:last')));

            // autocomplete set
            rowString.find('.vp-pip-command').autocomplete({
                source: commandSource,
                autoFocus: true
            });
            rowString.find('.vp-pip-pkgn').autocomplete({
                source: function (request, response) {
                    var data = request.term;
                    var cmd = $(this.element).closest('tr').find('.vp-pip-command').val();
                    if (cmd != 'help') {
                        cmd = 'other';
                    }
                    var filteredSource = pkgnSource[cmd].filter(x => (x.indexOf(data) >= 0));
                    response($.map(filteredSource, function (item) {
                        return item;
                    }))
                },
                autoFocus: true
            });
            rowString.find('.vp-pip-opt').autocomplete({
                source: function (request, response) {
                    var data = request.term;
                    var cmd = $(this.element).closest('tr').find('.vp-pip-command').val();
                    if (cmd != 'uninstall') {
                        cmd = 'other';
                    }
                    var filteredSource = optSource[cmd].filter(x => (x.indexOf(data) >= 0));
                    response($.map(filteredSource, function (item) {
                        return item;
                    }))
                },
                autoFocus: true
            });
        });

        // E2. Delete Package
        $(document).on('click', this.wrapSelector('.vp-pip-del'), function() {
            // if one left, just clear it
            if ($(that.wrapSelector('.vp-pip-table tr:not(:last)')).length <= 1) {
                // clear
                $(this).closest('tr').find('.vp-pip-command').val('');
                $(this).closest('tr').find('.vp-pip-pkgn').val('');
                $(this).closest('tr').find('.vp-pip-opt').val('');
            } else {
                // delete it
                $(this).closest('tr').remove();
            }
        });

        // E3. command change
        $(document).on('change', this.wrapSelector('.vp-pip-command'), function() {
            var val = $(this).val();
            if (val == 'uninstall') {
                $(this).closest('tr').find('.vp-pip-opt').val('--yes');
            }
        });

        // uninstall --yes : alert when user try to change it
        $(document).on('change', this.wrapSelector('.vp-pip-opt'), function() {
            var cmd = $(this).parent().find('.vp-pip-command').val();
            var val = $(this).val();
            if (cmd == 'uninstall' && val != '--yes' && that.alertOnOption == true) {
                // alert when user try to change --yes option
                vpCommon.renderAlertModal("'--yes' option is recommended for jupyter notebook environment");
                // don't show it again (FIXME: is it ok?)
                that.alertOnOption = false;
            }
        });
    }

    /**
     * 코드 생성
     * @param {boolean} addCell 셀에 추가
     * @param {boolean} exec 실행여부
     */
    PipPackage.prototype.generateCode = function(addCell = false, exec = false) {
        var code = new sb.StringBuilder();
        
        // code from user input
        var inputs = $(this.wrapSelector('.vp-pip-table tr:not(:last)'));
        // metadata save
        var pipMeta = [];
        for (var i = 0; i < inputs.length; i++) {
            var comment = $(inputs[i]).find('.vp-pip-comment').prop('checked');
            var cmd = $(inputs[i]).find('.vp-pip-command').val();
            var pkgn = $(inputs[i]).find('.vp-pip-pkgn').val();
            var opt = $(inputs[i]).find('.vp-pip-opt').val();

            var commentVal = comment ? "#" : "";

            if (i > 0) {
                code.appendLine();
            }
            code.appendFormat('{0}!pip {1} {2} {3}', commentVal, cmd, pkgn, opt);

            // save metadata for package list
            pipMeta.push({
                'vp-pip-comment': comment,
                'vp-pip-command': cmd,
                'vp-pip-pkgn': pkgn,
                'vp-pip-opt': opt
            });
        }

        // save column metadata
        $(this.wrapSelector('#vp_pipMeta')).val(encodeURIComponent(JSON.stringify(pipMeta)));

        if (addCell) {
            this.cellExecute(code.toString(), exec);
        }

        return code.toString();
    }

    return {
        initOption: initOption
    };
});
