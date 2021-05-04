define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
    , 'nbextensions/visualpython/src/common/vpCommon'
], function (requirejs, $, vpConst, sb, vpCommon) {

    /** @private
        @param {object} attribute
    */
    var parseAttributes = function( attribute ) {
        var attributeStr = ``;
        var attributes = Object.entries(attribute);
        var text = ``;

        for ( var i = 0; i < attributes.length; i++ ) {
            /**validation 
             * attribute 속성의 key 값이 반드시 style, class, id, text, value, type, placeholder이거나 data_ 로 시작해야만 파싱한다
            */
            if ( attributes[i][0] !== "style" || attributes[i][0] !== "class" ||
                attributes[i][0] !== "id" || attributes[i][0] !== "text"||  attributes[i][0] !== "type"
                || attributes[i][0] !== "placeholder"
                || attributes[i][0] !== "value"
                || attributes[i][0].indexOf("data") === -1) {
            
            } else {
                continue;
            }
            /** attributes가 text일 경우 */
            if (attributes[i][0] === "text") {
                text = attributes[i][1];
                continue;
            }

            /** attributes가 style일 경우  */
            if ( attributes[i][0] === "style") {
                
                /** color: black 의 경우 처럼 
                 *  style을 지정하고 뒤에 ;을 붙이지 않는 경우,
                 *  자동으로 ;을 붙여주는 로직 */
                var cursor = 0;
                /**
                 * style 텍스트를 cursor가 0부터 styleText.length까지 반복문을 돔
                 * attributes[i][1] 이하 styleText로 설명
                 */
                while (cursor++ < attributes[i][1].length) {
                    /** styleText의 한 문자가 ' '(띄어쓰기)를 만날경우  */
                    if (attributes[i][1].indexOf(' ') !== -1 || attributes[i][1].indexOf(' ') !== 0
                        || attributes[i][1].indexOf(' ') !==  attributes[i][1].length - 1) {

                        /** styleText의 각 문자들을 반복문 돌다가 한 문자가 ':' 를 만날 경우 
                         *  예를 들면 `color: black` 에서 :를 만날 경우,
                         *  : black 다음에 `;`표시가 없으면 ';'을 넣어준다
                         *  `;' 표시가 있으면 넘어간다
                         */
                        if ( attributes[i][1].indexOf(':', cursor) !== -1 ) {

                            var leftCursor = attributes[i][1].indexOf(':', cursor);
                        
                            while ( leftCursor-- ) {
                            
                                if (attributes[i][1][leftCursor].indexOf(' ') !== -1 ) {
                                    if (attributes[i][1][leftCursor - 1].indexOf(' ') !== -1) {
                                        continue;
                                    }
                                    
                                    if( attributes[i][1][leftCursor - 2].indexOf(';') === -1) {
                                        attributes[i][1] = attributes[i][1].slice(0, leftCursor)
                                            .concat(';')
                                            .concat(attributes[i][1].slice(leftCursor+1, attributes[i][1].length));
                                    }
                                    break;
                                }
                            }
                            cursor = (attributes[i][1].indexOf(':', cursor) );
                        }
                        cursor ++;
                    }
                }

                attributeStr += ' ' + attributes[i][0] + '=';
                attributeStr += `'${attributes[i][1]}'`;
                continue;
            }

            /** attributes가 data_일 경우 
             *  'data_' 는 'data-' 로 파싱된다
             */
            if (attributes[i][0].indexOf('_') !== -1) {
                var cursor = 0;
                while (attributes[i][0][cursor] !== undefined ) {
                    if(attributes[i][0][cursor] === "_") {
                        attributes[i][0] = attributes[i][0].slice(0,cursor) + '-' + attributes[i][0].slice(cursor + 1,attributes[i][0].length);
                    }
                    cursor++;
                }
                // attributes[i][0] =  attributes[i][0].replaceAll('_', '-');
            }

            attributeStr += ' ' + attributes[i][0] + '=';
            attributeStr += `'${attributes[i][1]}'`;
        }
        return {
            attributeStr
            , text
        }
    }
    
    /**
     * 이하 attribute를 파라미터로 받는 함수 사용 예제
        var input = renderInput({
                        class: `vp vp-label`
                        , id: `vp_label`
                        , style: `width: 90%;
                            min-width: 50px; max-width: 100px;
                            margin: 8px; position: relative;  display: block; font-size: 12px;
                            overflow: hidden; border-width: 0; outline: none; border-radius: 2px; 
                            box-shadow: 0 1px 4px rgba(0, 0, 0, .6);
                            color: black; transition: background-color .3s`;
                        , text:"Lavel"
                        , placeholder:"입력 바랍니다"
                        , type: "text"
                        , data_input_id:"3"
                        , data_capations_id: "lang"
        });
    */
    /**
        @param {object} attribute
    */
    var renderInput = function(attribute) {
        var { attributeStr } = parseAttributes(attribute);
        return $(`<input ${attributeStr}>
                </input>`);
    }
    /**
        @param {object} attribute
    */
    var renderButton = function(attribute) {
        var { attributeStr, text } = parseAttributes(attribute);
        return $(`<button ${attributeStr}>
                    ${text}
                </button>`);
    }

    /**
        @param {object} attribute
    */
    var renderSelectBox = function(attribute) {       
        var { attributeStr } = parseAttributes(attribute);
        return $(`<select ${attributeStr}>
                </select>`);
    }

    /**
     *  @param {Document} selectBox
        @param {Object} attribute
        @param {Array} optionDataList
    */
    var renderOption = function(selectBox, attribute, optionDataList, optionTextList = []) {
        for( var a = 0; a  < optionDataList.length; a++ ) {
            var { attributeStr } = parseAttributes(attribute);

            var value = optionDataList[a];
            var text = optionTextList.length > a ? optionTextList[a] : value;
            var option = $(`<option value='${value}' 
                                    ${attributeStr} >
                                ${text}
                            </option>`);
            $(selectBox).append(option);
        }

        // select option 클릭시 클릭 된 option 태그는 selected는 true가 되고 나머진 false
        $(selectBox).change(function()  {
            var index = $(':selected', this).index();
            var value = $(':selected', this).val();
            for(var i = 0; i < $(selectBox).children().length; i++ ) {
                ((j) => {
                    $(this).find(`option:eq(${j})`).attr("selected", false);
                })(i);
            }
            $(this).find(`option:eq(${index})`).attr("selected", true);
            $(this).val(value);
        });
        return $(selectBox);
    }

    /**
        @param {object} attribute
    */
    var renderSpan = function(attribute) {
        var { attributeStr, text } = parseAttributes(attribute);
        return $(`<span ${attributeStr}>
                    ${text}
                </span>`);
    }
    /**
        @param {object} attribute
    */
    var renderLabel = function(attribute) {
        var { attributeStr, text } = parseAttributes(attribute);
        return $(`<label ${attributeStr}>
                    ${text}
                </label>`);
    }

    /**
        @param {object} attribute
    */
    var renderDiv = function(attribute) {
        var { attributeStr, text } = parseAttributes(attribute);
        return $(`<div ${attributeStr}>
                    ${text}
                </div>`);
    }
    var renderUi = function(attribute) {
        var { attributeStr, text } = parseAttributes(attribute);
        return $(`<ul ${attributeStr}>
                    ${text}
                </div>`);
    }

    var renderLi = function(attribute) {
        var { attributeStr, text } = parseAttributes(attribute);
        return $(`<li ${attributeStr}>
                    ${text}
                </li>`);
    }

    /**
     * @param {Object} option  
     *      title : CustomConfirmModal창의 타이틀 제목을 정한다. 정하지 않을시 default는 `선택 하시겠습니까?`
     *      confirm_text : 예스 버튼의 text를 정한다. 정하지 않을시 default는 '예'
     *      cancel_text : 노 버튼의 text를 정한다. 정하지 않을시 default는 '아니오'
     * @param {function} confirmFunction  confirm 예스 버튼을 누르면 실행할 함수. 
     *                                      파라미터로 넣지 않는다면 예스 버튼을 눌러도 아무것도 실행하지 않는다.
     * @param {function} cancelFunction  confirm 노 버튼을 누르면 실행할 함수
     *                                      파라미터로 넣지 않는다면 노 버튼을 눌러도 아무것도 실행하지 않는다.
     */
    var renderCustomConfirmModal = function(option, confirmFunction, cancelFunction) {
        // load css
        vpCommon.loadCss( Jupyter.notebook.base_url + vpConst.BASE_PATH + vpConst.STYLE_PATH + "common/customConfirm.css" );
        var title = `Would you like to choose?`;
        var confirm =  `Yes`;
        var cancel = `No`;

        if(option) {
            var optionArray = Object.entries(option);
            for ( var i = 0; i < optionArray.length; i++ ) {
                if ( optionArray[i][0] === 'title' ) {
                    title = optionArray[i][1];
                
                    continue;
                }

                if ( optionArray[i][0] === 'confirm_text' ) {
                    confirm = optionArray[i][1];
                    continue;
                }

                if ( optionArray[i][0] === 'cancel_text' ) {
                    cancel = optionArray[i][1];
                    continue;
                }
            }
        }

        // load customConfirm dom tag
        var customConfirm = $(`<div class='vp-customConfirm'>
                                    <div class='vp-customConfirm-container center-1rem-gray' >
                                        <div class='vp-customConfirm-inner vp-style-flex-column-evenly'>
                                            <div class='vp-customConfirm-title 
                                                        vp-style-font-weight-700
                                                        vp-style-font-size-16px 
                                                        vp-style-text-center'>
                                
                                                <span class='vp-multilang' 
                                                    data-caption-id='doYouWantToChoose'>
                                                    ${title}
                                                </span>
                                            </div>

                                            <div class='vp-customConfirm-button-container
                                                        vp-style-flex-row-evenly'>
                                                <input class='vp-customConfirm-yes' 
                                                        id='vp_modal-input-button' 
                                                        type='submit' 
                                                        value='${confirm}' />
                                                <input class='vp-customConfirm-no'
                                                        id='vp_modal-input-button' 
                                                        type='submit' 
                                                        value='${cancel}' />
                                            </div>
                                        </div>
                                    </div>
                                </div>`);

        $('body').append(customConfirm);

        $(customConfirm).find('.vp-customConfirm-yes').click(function() {
            $(customConfirm).empty();
            $(customConfirm).remove();
            
            if ( confirmFunction ) {
                confirmFunction();
            }

            $(customConfirm).find('.vp-customConfirm-yes').off();
            $(customConfirm).find('.vp-customConfirm-no').off();
        });
        
        $(customConfirm).find('.vp-customConfirm-no').click(function() {
            $(customConfirm).empty();
            $(customConfirm).remove();
            
            if ( cancelFunction ) {
                cancelFunction();
            }
        
            $(customConfirm).find('.vp-customConfirm-yes').off();
            $(customConfirm).find('.vp-customConfirm-no').off();
        });   
    }


    return {
        renderInput: renderInput
        , renderSelectBox: renderSelectBox
        , renderButton: renderButton
        , renderOption: renderOption
        , renderSpan: renderSpan
        , renderLabel: renderLabel
        , renderDiv: renderDiv
        , renderUi: renderUi
        , renderLi: renderLi
        , renderCustomConfirmModal: renderCustomConfirmModal
    }
});