/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : NumpyComponent.js
 *    Author          : Black Logic
 *    Note            : Library Component
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2021. 11. 18
 *    Change Date     :
 */

//============================================================================
// [CLASS] NumpyComponent
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_library/numpyComponent.html'), // INTEGRATION: unified version of text loader
    __VP_CSS_LOADER__('vp_base/css/m_library/numpyComponent'), // INTEGRATION: unified version of css loader
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/com_generatorV2',
    'vp_base/data/m_library/numpyLibrary',
    'vp_base/data/m_library/pythonLibrary'
], function(libHtml, libCss, PopupComponent, com_generatorV2, numpyLibrary, pythonLibrary) {

    /**
     * NumpyComponent
     */
    class NumpyComponent extends PopupComponent {
        _init() {
            super._init();
            /** Write codes executed before rendering */
            this.config.dataview = false;
            this.config.sizeLevel = 1;
            
            this.packageId = this.state.config.id;
            // deep copy package info
            this.package = null;
            try {
                let packageName = this.state.config.path.split(' - ')[2];
                let findPackage = null;
                if (packageName == 'numpy') {
                    findPackage = numpyLibrary.NUMPY_LIBRARIES[this.packageId];
                } else if (packageName == 'python') {
                    findPackage = pythonLibrary.PYTHON_LIBRARIES[this.packageId];
                }
                if (findPackage) {
                    this.package = JSON.parse(JSON.stringify(findPackage)); // deep copy of package
                } else {
                    throw 'Cannot find package';
                }
            } catch(err) {
                vpLog.display(VP_LOG_TYPE.ERROR, 'Cannot find package id from library: ' + this.packageId);
                return;
            }
            this.config.checkModules = ['np'];

            vpLog.display(VP_LOG_TYPE.DEVELOP, 'loading state', this.state);
        }

        _bindEvent() {
            super._bindEvent();
            /** Implement binding events */
            var that = this;
            // save change of vp-state component
            $(this.wrapSelector('.vp-state')).on('change', function() {
                let id = $(this)[0].id;
                let val = $(this).val();
                that.state[id] = val;
            });
        }

        loadState() {
            vpLog.display(VP_LOG_TYPE.DEVELOP, this.state);   

            let that = this;
            Object.keys(this.state).forEach(key => {
                if (key !== 'config') {
                    let tag = $(that.wrapSelector('#' + key));
                    let tagName = $(tag).prop('tagName');
                    let savedValue = that.state[key];
                    switch(tagName) {
                        case 'INPUT':
                            let inputType = $(tag).prop('type');
                            if (inputType == 'text' || inputType == 'number' || inputType == 'hidden') {
                                $(tag).val(savedValue);
                                break;
                            }
                            if (inputType == 'checkbox') {
                                $(tag).prop('checked', savedValue);
                                break;
                            }
                            break;
                        case 'TEXTAREA':
                        case 'SELECT':
                        default:
                            $(tag).val(savedValue);
                            break;
                    }
                }
            });
        }

        saveState() {
            let that = this;
            $(this.wrapSelector('.vp-state')).each((idx, tag) => {
                let id = tag.id;
                let tagName = $(tag).prop('tagName');
                let newValue = '';
                switch(tagName) {
                    case 'INPUT':
                        let inputType = $(tag).prop('type');
                        if (inputType == 'text' || inputType == 'number' || inputType == 'hidden') {
                            newValue = $(tag).val();
                            break;
                        }
                        if (inputType == 'checkbox') {
                            newValue = $(tag).prop('checked');
                            break;
                        }
                        break;
                    case 'TEXTAREA':
                    case 'SELECT':
                    default:
                        newValue = $(tag).val();
                        break;
                }
                
                that.state[id] = newValue;
            }); 
            vpLog.display(VP_LOG_TYPE.DEVELOP, 'savedState', that.state);   
        }

        templateForBody() {
            return libHtml;
        }

        render() {
            super.render();

            // show interface
            com_generatorV2.vp_showInterfaceOnPage(this, this.package, this.state);

            // hide required page if no options
            if ($.trim($(this.wrapSelector('#vp_inputOutputBox table tbody')).html())=='') {
                $(this.wrapSelector('.vp-require-box')).hide();
            }

            // hide optional page if no options
            if ($.trim($(this.wrapSelector('#vp_optionBox table tbody')).html())=='') {
                $(this.wrapSelector('.vp-option-box')).hide();
            }
        }

        open() {
            super.open();
            // hide optional page if no options
            if ($.trim($(this.wrapSelector('#vp_optionBox table tbody')).html())=='') {
                $(this.wrapSelector('.vp-option-box')).hide();
            }
        }

        generateCode() {
            let code = com_generatorV2.vp_codeGenerator(this, this.package, this.state);
            return code;
        }

    }

    return NumpyComponent;
});