define ([
    'nbextensions/visualpython/src/numpy/common/NumpyPageRender/parent/NumpyPageRender'

    , 'nbextensions/visualpython/src/numpy/constant_numpy'
], function(  NumpyPageRender, constData ) {
    const { STR_INPUT_NUMBER

            , STATE_paramOption1DataStart

            , STATE_paramOption2DataStart
            , STATE_paramOption2DataStop
        
            , STATE_paramOption3DataStart
            , STATE_paramOption3DataStop
            , STATE_paramOption3DataStep } = constData;
    'use strict';
    /**
     * @class NpArangePageRender
     * @constructor
    */
    var NpArangePageRender = function(numpyOptionObj) {
        const { numpyDtypeArray, numpyEnumRenderEditorFuncType } = numpyOptionObj;
        this.numpyDtypeArray = numpyDtypeArray;
        this.numpyEnumRenderEditorFuncType = numpyEnumRenderEditorFuncType;

        NumpyPageRender.call(this);
    };

    /**
     * NumpyPageRender 에서 상속
    */
    NpArangePageRender.prototype = Object.create(NumpyPageRender.prototype);

    /**
    * NumpyPageRender 클래스의 pageRender 메소드 오버라이드
    * @param {this} importPackageThis 
    */
    NpArangePageRender.prototype.pageRender = function() {
        this.rootTagSelector =  this.getMainPageSelector();
        var numpyPageRenderThis = this;
        var numpyStateGenerator = this.numpyStateGenerator;
        const { PARAM_INPUT_EDITOR_TYPE } = this.numpyEnumRenderEditorFuncType;
        // state의 paramData 객체의 키값을 string 배열로 리턴
        // var stateParamNameStrArray = Object.keys(numpyStateGenerator.getState('paramData'));
        var tabTitle = 'Input Parameter';
        var tabBlockArray = [
            {
                tabNumber: 1
                , btnText: 'start'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: [ STATE_paramOption1DataStart ]
                    , paramNameStrArray: ['start']
                    , placeHolderArray: [STR_INPUT_NUMBER]
                }
            },
            {
                tabNumber: 2
                , btnText: 'Start, Stop'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
                    , stateParamNameStrOrStrArray: [ STATE_paramOption2DataStart, STATE_paramOption2DataStop]
                    , paramNameStrArray: ['start', 'stop']
                    , placeHolderArray: [STR_INPUT_NUMBER, STR_INPUT_NUMBER]
                }
           
            },
            {
                tabNumber: 3
                , btnText: 'Start, Stop, Step'
                , bindFuncData: {
                    numpyPageRenderThis: numpyPageRenderThis
                    , numpyPageRenderFuncType: PARAM_INPUT_EDITOR_TYPE
                    , stateParamNameStrOrStrArray:  [ STATE_paramOption3DataStart, STATE_paramOption3DataStop, STATE_paramOption3DataStep]
                    , paramNameStrArray: ['start', 'stop', 'step']
                    , placeHolderArray: [STR_INPUT_NUMBER, STR_INPUT_NUMBER, STR_INPUT_NUMBER]
                }
            
            }
        ];
        var tabDataObj = {
            tabTitle,
            tabBlockArray
        }

        this.renderPrefixCode();

        this.renderRequiredInputOutputContainer();
        this.renderParamTabBlock(tabDataObj);

        this.renderAdditionalOptionContainer();
        this.renderDtypeBlock();
        this.renderReturnVarBlock();

        this.renderPostfixCode();
    }

    return NpArangePageRender;
});
