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
    'text!vp_base/html/m_ml/dataSplit.html!strip',
    'css!vp_base/css/m_ml/dataSplit.css',
    'vp_base/js/com/com_util',
    'vp_base/js/com/com_interface',
    'vp_base/js/com/com_Const',
    'vp_base/js/com/com_String',
    'vp_base/js/com/component/PopupComponent'
], function(dsHtml, dsCss, com_util, com_interface, com_Const, com_String, PopupComponent) {

    /**
     * Data split
     */
    class DataSplit extends PopupComponent {
        _init() {
            super._init();
            this.config.sizeLevel = 2;
            this.config.dataview = false;

            this.state = {
                testSize: 0.25,
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
            
            // import library
            $(this.wrapSelector('#vp_libaryImport')).on('click', function() {
                com_interface.insertCell('code', 'from sklearn.model_selection import train_test_split');
            });
        }

        templateForBody() {
            let page = $(dsHtml);

            // test size generating
            let sizeOptions = '';
            for (let i=5; i<95; i+=5) {
                sizeOptions += `<option value="0.${i}" ${this.state.testSize==('0.'+i)?'selected':''}>${i}%</option>`;
            }
            $(page).find('#testSize').html(sizeOptions);
            return page;
        }

        render() {
            super.render();

            
            
        }

        generateCode() {
            let { 
                trainFeatures, trainTarget, testFeatures, testTarget,
                dataType, featureData, targetData,
                testSize, randomState, shuffle, startify
            } = this.state;

            let options = new com_String();
            if (testSize != '0.25') {
                options.appendFormat(', test_size={0}', testSize);
            }
            if (randomState && randomState != '') {
                options.appendFormat(', random_state={0}', randomState);
            }
            if (shuffle && shuffle != '') {
                options.appendFormat(', shuffle={0}', shuffle);
            }
            if (startify && startify != '') {
                options.appendFormat(', startify={0}', startify);
            }

            let code = new com_String();
            code.appendFormat('{0}, {1}, {2}, {3} = train_test_split({4}, {5}{6})', 
                            trainFeatures, testFeatures, trainTarget, testTarget, 
                            featureData, targetData, options.toString());
            return code.toString();
        }

    }

    return DataSplit;
});