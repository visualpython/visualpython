define ([
    './privateMethod/index'
], function( privateMethodList) {

    "use strict";

    var { _renderArrayEditorTitle, 
          _renderParamTabBlock, 
          _renderParamOneArrayEditor, 
          _renderParamTwoArrayEditor,
          _renderParamOneArrayIndexValueEditor,
          _renderParamInputArrayEditor, 
          _renderCallVarBlock, 
          _renderReturnVarBlock,
          _renderParamVarBlock, 
          _renderDtypeBlock, 
          _renderSelectAxisBlock,
          _renderAdditionalOptionContainer,
          _renderRequiredInputOutputContainer,
          _renderInputIndexValueBlock } = privateMethodList;
    /**
     * @class NumpyCodeValidator
     * @constructor
    */

    var NumpyPageRender = function() {
        /** setImportPackageThis 메소드로 동적 set */
        this.importPackageThis;

        /** 배열을 동적으로 추가 삭제 생성할 때마다 값이 달라진다 */
        this.oneArrayLength = 0;

        this.twoArrayRow = 0;
        this.twoArrayCol = 0;
        /** 
            optionPageSelector는 */
        this.mainPageSelector = `.vp-numpy-mainPageBlock-view`;
        this.requiredPageSelector = `.vp-numpy-requiredPageBlock-tbody`;
        this.optionPageSelector = `.vp-numpy-optionPageBlock-view`;

        this.funcName = ``;
    };

    /** ------------------------------------------------------------------------------------------------------------ */
    /**
     * @publicMethod

    */
    /**
    * 자식 클래스에서 반드시! 오버라이드 되는 메소드
    * nummpy 패키지에서 page를 렌더하는 메소드.
    * @param {this} importPackageThis 
    */
    NumpyPageRender.prototype.pageRender = function() {

    }

    /** ------------------------------------------------------------------------------------------------------------ */
    NumpyPageRender.prototype.setMainPageSelector = function(mainPageSelector) {
        this.mainPageSelector = mainPageSelector;
    }
    
    NumpyPageRender.prototype.getMainPageSelector = function() {
        return this.mainPageSelector;
    }
    NumpyPageRender.prototype.setOptionPageSelector = function(optionPageSelector) {
        this.optionPageSelector = optionPageSelector;
    }

    NumpyPageRender.prototype.getOptionPageSelector = function() {
        return this.optionPageSelector;
    }

    NumpyPageRender.prototype.setRequiredPageSelector = function(requiredPageSelector) {
        this.requiredPageSelector = requiredPageSelector;
    }

    NumpyPageRender.prototype.getRequiredPageSelector = function() {
        return this.requiredPageSelector;
    }

    NumpyPageRender.prototype.setRootTagSelector = function() {
        return this.rootTagSelector;
    }
    NumpyPageRender.prototype.getRootTagSelector = function() {
        return this.rootTagSelector;
    }
 
    /**
    *  StateGenerator 인스턴스를 가져오기 위해 실행되는 메소드
    * @override
    * @param {NumpyStateGenerator instance} numpyStateGenerator 
    */
    NumpyPageRender.prototype.setStateGenerator = function(numpyStateGenerator) {
        this.numpyStateGenerator = numpyStateGenerator;
    }

    /**
     * getStateGenerator
     */
    NumpyPageRender.prototype.getStateGenerator = function() {
        return this.numpyStateGenerator;
    }

    /**
    * pageList index.js 파일에서 importPackage 인스턴스의 this를 가져오는 메소드
    * @param {ImportPackage Instance this} importPackageThis 
    */
    NumpyPageRender.prototype.setImportPackageThis = function(importPackageThis) {
        this.importPackageThis = importPackageThis;
    }
    NumpyPageRender.prototype.getImportPackageThis = function() {
        return this.importPackageThis;
    }

    /** ------------------------------------------------------------------------------------------------------------ */
    /**
     * 1차원 배열의 길이를 가져온다
     */
    NumpyPageRender.prototype.getOneArrayLength= function() {
        return this.oneArrayLength;
    }
    NumpyPageRender.prototype.setOneArrayLength = function(oneArrayLength) {
        return this.oneArrayLength = oneArrayLength;
    }
    
    /**
     * 2차원 배열의 행을 가져온다
     */
    NumpyPageRender.prototype.getTwoArrayRow = function() {
        return this.twoArrayRow;
    }
    NumpyPageRender.prototype.getTwoArrayCol = function() {
        return this.twoArrayCol;
    }
    NumpyPageRender.prototype.setTwoArrayRow = function(twoArrayRow) {
        return this.twoArrayRow = twoArrayRow;
    }
    NumpyPageRender.prototype.setTwoArrayCol = function(twoArrayCol) {
        return this.twoArrayCol = twoArrayCol;
    }


    /** ------------------------------------------------------------------------------------------------------------ */
    /**
     * @priavteMethod
     */
    /** renderParamOneArrayEditor
     *  배열 편집기의 타이틀과 배열 생성버튼을 생성한다
     */
    NumpyPageRender.prototype.renderArrayEditorTitle = function(baseDom, tagSelector, stateParamName, funcId) {
        var numpyPageRendererThis = this;
        _renderArrayEditorTitle(numpyPageRendererThis, baseDom, tagSelector, stateParamName, funcId)
    }

    /** renderParamOneArrayEditor
     *  1차원 배열 편집기를 특정 돔 tagSelector 태그에 렌더링한다
     *  @param {string} tagSelector 편집기를 동적 랜더링할 태그 이름
     *  @param {string} stateParamName state parameter 이름 -> 편집된 데이터는 이 state parameter에 저장된다
     */

    NumpyPageRender.prototype.renderParamOneArrayEditor = function(tagSelector, stateParamName) {
        var numpyPageRendererThis = this;
        _renderParamOneArrayEditor(numpyPageRendererThis, tagSelector, stateParamName);
    }

    /**
     * renderParamTwoArrayEditor
     * 2차원 배열 편집기를 특정 돔 tagSelector 태그에 렌더링한다
     *  @param {string} tagSelector 편집기를 동적 랜더링할 태그 이름
     *  @param {string} stateParamName state parameter 이름 -> 편집된 데이터는 이 state parameter에 저장된다
     */
    NumpyPageRender.prototype.renderParamTwoArrayEditor = function(tagSelector, stateParamName) {
        var numpyPageRendererThis = this;
        _renderParamTwoArrayEditor(numpyPageRendererThis, tagSelector, stateParamName);
    }


    /**
     * 
     * n차원 배열을 만들기 위해 n개의 int값을 파라미터로 받는 편집기를 특정 돔 태그에 렌더링
     *  @param {string} tagSelector 편집기를 동적 랜더링할 태그 이름
     *  @param {string} stateParamName state parameter 이름 -> 편집된 데이터는 이 state parameter에 저장
     */
    NumpyPageRender.prototype.renderParamOneArrayIndexValueEditor = function(tagSelector, stateParamName) {
        var numpyPageRendererThis = this;
        _renderParamOneArrayIndexValueEditor(numpyPageRendererThis, tagSelector, stateParamName);
    }
 
    /**
     * renderIndexingEditor
     * @param {object} tabDataObj
     */
    NumpyPageRender.prototype.renderParamTabBlock = function(tabDataObj) {
        var numpyPageRendererThis = this;
        _renderParamTabBlock(numpyPageRendererThis, tabDataObj);
    }

    /** renderParamInputArrayEditor
     * @param {string} tagSelector
     * @param {Array<string>} stateParamNameArray
     * @param {boolean} isEmpty
     */
    NumpyPageRender.prototype.renderParamInputArrayEditor = function(tagSelector, stateParamNameArray) {
        var numpyPageRendererThis = this;
        _renderParamInputArrayEditor(numpyPageRendererThis, tagSelector, stateParamNameArray);
    }

    /** renderCallVarBlock
     */
    NumpyPageRender.prototype.renderCallVarBlock = function() {
        var numpyPageRendererThis = this;
        _renderCallVarBlock(numpyPageRendererThis);
    }

    /** renderCallVarBlock
     */
    NumpyPageRender.prototype.renderReturnVarBlock = function() {
        var numpyPageRendererThis = this;
        _renderReturnVarBlock(numpyPageRendererThis);          
    }

    /** renderParamVarBlock
     */
    NumpyPageRender.prototype.renderParamVarBlock = function(title) {
        var numpyPageRendererThis = this;
        _renderParamVarBlock(numpyPageRendererThis, title)
    }

    /** renderDtypeBlock
     */
    NumpyPageRender.prototype.renderDtypeBlock = function() {
        var numpyPageRendererThis = this;
        _renderDtypeBlock(numpyPageRendererThis)
    }
    
    /** renderSelectAxisBlock
     */
    NumpyPageRender.prototype.renderSelectAxisBlock = function() {
        var numpyPageRendererThis = this;
        _renderSelectAxisBlock(numpyPageRendererThis);
    }

    NumpyPageRender.prototype.renderPostfixCode = function() {
        // var numpyPageRendererThis = this;
        // _renderPostfixCode(numpyPageRendererThis);
    }

    NumpyPageRender.prototype.renderPrefixCode = function() {
        // var numpyPageRendererThis = this;
        // _renderPrefixCode(numpyPageRendererThis);
    }

    NumpyPageRender.prototype.renderInputIndexValueBlock = function(title, bindFuncData) {
        var numpyPageRendererThis = this;
        _renderInputIndexValueBlock(numpyPageRendererThis, title, bindFuncData);
    }
    NumpyPageRender.prototype.renderAdditionalOptionContainer = function() {
        var numpyPageRendererThis = this;
        _renderAdditionalOptionContainer(numpyPageRendererThis);
    }
    NumpyPageRender.prototype.renderRequiredInputOutputContainer = function() {
        var numpyPageRendererThis = this;
        _renderRequiredInputOutputContainer(numpyPageRendererThis);
    }

    NumpyPageRender.prototype.renderFuncName = function(funcName) {
        var importPackageThis = this.getImportPackageThis();
        this.funcName = funcName;
        $(importPackageThis.wrapSelector(`.vp-numpy-title`)).html(funcName);
    }


    return NumpyPageRender;
});
