/*
 *    Project Name    : Visual Python
 *    Description     : GUI-based Python code generator
 *    File Name       : dataSplit.js
 *    Author          : Black Logic
 *    Note            : Data split
 *    License         : GNU GPLv3 with Visual Python special exception
 *    Date            : 2022. 02. 07
 *    Change Date     :
 */

//============================================================================
// [CLASS] Data split
//============================================================================
define([
    __VP_TEXT_LOADER__('vp_base/html/m_ml/dataSplit.html'), // INTEGRATION: unified version of text loader
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent',
    'vp_base/js/com/component/VarSelector2',
    'vp_base/js/com/component/DataSelector'
], function(dsHtml, com_util, com_interface, com_Const, com_String, PopupComponent, VarSelector2, DataSelector) {

    /**
     * Data split
     */
    class DataSplit extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 2;
            this.config.dataview = false;

            this.state = {
                inputData: 'with_target_data',
                featureData: '',
                targetData: '',
                testSize: 0.25,
                shuffle: 'True',
                stratify: '',
                trainFeatures: 'X_train',
                trainTarget: 'y_train',
                testFeatures: 'X_test',
                testTarget: 'y_test',
                ...this.state
            }
        }

        _bindEvent() {
            super._bindEvent();
            var that = this;

            // change input data
            $(this.wrapSelector('#inputData')).on('change', function() {
                let inputData = $(this).val();
                if (inputData == 'with_target_data') {
                    // with target data
                    $(that.wrapSelector('.vp-target-data-box')).show();
                    // set label
                    $(that.wrapSelector('label[for=featureData]')).text('Feature data');
                    $(that.wrapSelector('label[for=trainFeatures]')).text('Train features');
                    $(that.wrapSelector('label[for=testFeatures]')).text('Test features');
                    // set value
                    $(that.wrapSelector('#trainFeatures')).val('X_train').trigger('change');
                    $(that.wrapSelector('#testFeatures')).val('X_test').trigger('change');
                } else {
                    // without target data
                    // with target data
                    $(that.wrapSelector('.vp-target-data-box')).hide();
                    // set label
                    $(that.wrapSelector('label[for=featureData]')).text('Data');
                    $(that.wrapSelector('label[for=trainFeatures]')).text('Train data');
                    $(that.wrapSelector('label[for=testFeatures]')).text('Test data');
                    // set value
                    $(that.wrapSelector('#trainFeatures')).val('train').trigger('change');
                    $(that.wrapSelector('#testFeatures')).val('test').trigger('change');
                }
            });

            // Stratify depends on Shuffle
            $(this.wrapSelector('#shuffle')).on('change', function() {
                let shuffle = $(this).val();
                if (shuffle == 'True') {
                    // enable stratify
                    $(that.wrapSelector('#stratify')).prop('disabled', false);
                } else {
                    // disable stratify
                    $(that.wrapSelector('#stratify')).prop('disabled', true);
                }
            });
        }

        templateForBody() {
            let page = $(dsHtml);

            // test size generating
            let sizeOptions = '';
            for (let i=5; i<95; i+=5) {
                sizeOptions += `<option value="${i / 100}" ${parseFloat(this.state.testSize)==(i / 100)?'selected':''}>
                    ${i}%${i==25?' (default)':''}
                </option>`;
            }
            $(page).find('#testSize').html(sizeOptions);

            let featureSelector = new DataSelector({
                pageThis: this, id: 'featureData', placeholder: 'Select feature data', required: true
            });
            $(page).find('#featureData').replaceWith(featureSelector.toTagString());

            let targetSelector = new DataSelector({
                pageThis: this, id: 'targetData', placeholder: 'Select target data', required: true
            });
            $(page).find('#targetData').replaceWith(targetSelector.toTagString());

            let stratifySelector = new DataSelector({
                pageThis: this, id: 'stratify', placeholder: 'None' 
            });
            $(page).find('#stratify').replaceWith(stratifySelector.toTagString());
            
            // load state
            let that = this;
            Object.keys(this.state).forEach(key => {
                let tag = $(page).find('#' + key);
                let tagName = $(tag).prop('tagName'); // returns with UpperCase
                let value = that.state[key];
                if (value == undefined) {
                    return;
                }
                switch(tagName) {
                    case 'INPUT':
                        let inputType = $(tag).prop('type');
                        if (inputType == 'text' || inputType == 'number' || inputType == 'hidden') {
                            $(tag).val(value);
                            break;
                        }
                        if (inputType == 'checkbox') {
                            $(tag).prop('checked', value);
                            break;
                        }
                        break;
                    case 'TEXTAREA':
                    case 'SELECT':
                    default:
                        $(tag).val(value);
                        break;
                }
            });
            
            return page;
        }

        render() {
            super.render();

            
            
        }

        generateCode() {
            let { 
                trainFeatures, trainTarget, testFeatures, testTarget,
                inputData, featureData, targetData,
                testSize, randomState, shuffle, stratify
            } = this.state;

            let options = new com_String();
            if (testSize != '0.25') {
                options.appendFormat(', test_size={0}', testSize);
            }
            if (randomState && randomState != '') {
                options.appendFormat(', random_state={0}', randomState);
            }
            if (shuffle && shuffle != 'True') {
                options.appendFormat(', shuffle={0}', shuffle);
            }
            if (shuffle != 'False' && stratify && stratify != '') {
                options.appendFormat(', startify={0}', stratify);
            }

            let code = new com_String();
            code.appendLine('from sklearn.model_selection import train_test_split');
            code.appendLine();
            if (inputData == 'with_target_data') {
                code.appendFormat('{0}, {1}, {2}, {3} = train_test_split({4}, {5}{6})', 
                                trainFeatures, testFeatures, trainTarget, testTarget, 
                                featureData, targetData, options.toString());
            } else {
                code.appendFormat('{0}, {1} = train_test_split({2}{3})',
                    trainFeatures, testFeatures, featureData, options.toString());
            }
            return code.toString();
        }

    }

    return DataSplit;
});