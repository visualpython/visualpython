define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
], function (requirejs, $, vpConst) {
    "use strict";

    /**
     * 1. Load Metadata from selected cell
     * var mdHandler = new MdHandler('pdPdo_dataframe');
     * mdHandler.loadMdAsTag(this);
     * 
     * 2. Save Metadata to selected cell
     * var mdHandler = new MdHandler('pdPdo_dataframe');
     * var inputIdList = ['vpOpt_i0', 'vpOpt_o0', 'vpOpt_index', 'vpOpt_columns'];
     * mdHandler.generateMetadata(this, inputIdList);
     * mdHandler.saveMetadata();
     */

    /**
     * @class MdHandler
     * @param {string} funcID xml 함수 id
     * @constructor
     */
    var MdHandler = function (funcID) {
        this.initMetadata();

        // xml 함수 id
        this.funcID = funcID;
    };

    /**
     * metadata initialize
     */
    MdHandler.prototype.initMetadata = function() {
        // sample metadata
        this.metadata = {
            funcID: this.funcID,
            code: '',
            options: [
                // {
                //     id: '',
                //     value: ''
                // }
            ]
        }
    }

    /**
     * load cell metadata
     * @param {number} cellIdx 불러올 셀 위치 (optional)
     * @returns {object} metadata
     * - get selected cell index : Jupyter.notebook.get_selected_index()
     */
    MdHandler.prototype.loadMetadata = function (cellIdx = -1) {
        var metadata = {};
        if (cellIdx < 0) {
            // 현재 선택된 셀의 metadata 불러오기
            metadata = Jupyter.notebook.get_selected_cell().metadata.vp;
        } else {
            // 주어진 위치의 셀 metadata 불러오기
            metadata = Jupyter.notebook.get_cell(cellIdx).metadata.vp;
        }
        this.metadata = metadata;
        return metadata;
    }

    /**
     * save cell metadata
     * @param {object} metadata 저장할 메타데이터 객체
     * @param {number} cellIdx 저장할 위치 (optional)
     * - get selected cell index : Jupyter.notebook.get_selected_index()
     */
    MdHandler.prototype.saveMetadata = function (metadata = this.metadata, cellIdx = -1) {
        if (cellIdx < 0) {
            // 현재 선택된 셀의 metadata 입력하기
            Jupyter.notebook.get_selected_cell().metadata.vp = metadata;
        } else {
            // 주어진 위치의 셀 metadata 입력하기
            Jupyter.notebook.get_cell(cellIdx).metadata.vp = metadata;
        }
    }

    /**
     * Get Tag values as metadata object
     * @param {object} pageThis
     * @param {Array<string>} inputIdList 
     * @returns {Object} Cell metadata object
     */
    MdHandler.prototype.generateMetadata = function(pageThis, inputIdList) {
        var metadata = {
            funcID: this.funcID // TODO: Page Redirect-able id
            , code: ''
            , options: []
        };

        metadata.code = pageThis.generatedCode;

        // get input/select values
        inputIdList && inputIdList.forEach(id => {
            metadata.options.push({ 
                id: id,
                value: $(pageThis.wrapSelector('#' + id)).val()
            });
        });

        this.metadata = metadata;
        return metadata;
    }

    /**
     * metadata load + id를 통해 값 입력
     * - execute after generating tags 
     * @param {object} pageThis 
     * @param {number} cellIdx 불러올 위치 (optional)
     */
    MdHandler.prototype.loadMdAsTag = function(pageThis, cellIdx = -1) {
        var metadata = this.loadMetadata(cellIdx);
        if (metadata == undefined) {
            return;
        }

        // set options
        metadata.options && metadata.options.forEach(opt => {
            var tag = $(pageThis.wrapSelector('#' + opt.id));
            // var tagType = tag.prop('tagName');
            tag.val(opt.value);
        })
    }

    /**
     * 장안태 추가
     * metadata load + meta 직접 입력을 통해 값 입력
     * - execute after generating tags 
     * @param {object} pageThis 
     * @param {JSON} metadata 
     */
    MdHandler.prototype.loadDirectMdAsTag = function(pageThis, metadata) {
        // var metadata = this.loadMetadata(cellIdx);
        if (metadata == undefined) {
            return;
        }

        // set options
        metadata.options && metadata.options.forEach(opt => {
            var tag = $(pageThis.wrapSelector('#' + opt.id));
            // var tagType = tag.prop('tagName');
            tag.val(opt.value);
        })
    }

    return {
        MdHandler: MdHandler
    };
});