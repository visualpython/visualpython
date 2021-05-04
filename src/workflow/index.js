$('.blpn-nodeEditor-tab-click').click( 
    function(event) {
        event.preventDefault();
        $('.blpn-nodeEditor-left').css('width','100%');
        $('.blpn-nodeEditor-right').animate({width:'toggle'});
    }
);
$(`.blpn-panel-area-vertical-btn`).click(function() {
    if ($(this).hasClass(`blpn-arrow-down`)) {
        $(this).removeClass(`blpn-arrow-down`);
        $(this).addClass(`blpn-arrow-up`);
        $(this).parent().parent().removeClass(`blpn-minimize`);
    } else {
        $(this).removeClass(`blpn-arrow-up`);
        $(this).addClass(`blpn-arrow-down`);
        $(this).parent().parent().addClass(`blpn-minimize`);
    }
});

// MOUSE SETUP
// =============
var mouse = {
    currentLink: null,
    createPath: function(a, b) {
        var diff = {
            x: b.x - a.x,
            y: b.y - a.y
        };
    
        var pathStr = 'M' + a.x + ',' + a.y + ' ';
        pathStr += 'C';
        pathStr += a.x + diff.x / 3 * 2 + ',' + a.y + ' ';
        pathStr += a.x + diff.x / 3 + ',' + b.y + ' ';
        pathStr += b.x + ',' + b.y;
        
        return pathStr;
    }
};

// CLEAN UP AND ACTUAL CODE [WIP]
// ================================

var getFullOffset = function(element) {
    var offset = {
        top: element.offsetTop,
        left: element.offsetLeft,
    };
                
    if (element.offsetParent) {
        var po = getFullOffset(element.offsetParent);
        offset.top += po.top;
        offset.left += po.left;
        return offset;
    } else {
        return offset;
    }
}
var svg = document.getElementById('svg');
svg.ns = svg.namespaceURI;
window.onmousemove = function(event) {
    if (mouse.currentLink) {
        var p = mouse.currentLink.path;
        var iP = mouse.currentLink.getAttachPoint();
        var oP = { x: event.pageX
                    , y: event.pageY };
        var s = mouse.createPath(iP, oP);
        p.setAttributeNS(null, 'd', s);
    }
};

window.onclick = function(e) {
    if (mouse.currentLink) {
        mouse.currentLink.path.removeAttribute('d');
        if (mouse.currentLink.nextNode) {
            mouse.currentLink.nextNode.detachLink(mouse.currentLink);
        }
        mouse.currentLink = null;
    }
};

// commonApi
var getUUID = function() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

// stateApi
/** findStateValue 함수
*  state를 while루프로 돌면서 돌면서 keyName과 일치하는 state의 value값을 찾아 리턴한다
*  없으면 null을 리턴한다.
*  @param {object} state 
*  @param {string} keyName 
*  @returns {any | null} returnValueOrNull
*/           
var findStateValue = function(state, keyName) {
    var result = [];
    var stack = [{ context: result
                , key: 0
                    , value: state }];
    var currContext;
    var returnValueOrNull = null; 
    while (currContext = stack.pop()) {
        var { context, key, value } = currContext;

        if (!value || typeof value != 'object') {
            if (key === keyName) {
                returnValueOrNull = value;
                break;
            }
            
            context[key] = value; 
        }
        else if (Array.isArray(value)) {
            if (key === keyName) {
                returnValueOrNull = value;
                break;
            }
    
        } else {
            if (key === keyName) {
                returnValueOrNull = value;
                break;
            }
            context = context[key] = Object.create(null);
            Object.entries(value).forEach(([ key,value ]) => {
                stack.push({ context, key, value });
            });
        }
    };
    return returnValueOrNull;
};

/** changeOldToNewState 함수
*  oldState(이전 state 데이터)와 newState(새로운 state 데이터)를 비교해서
    newState로 들어온 새로운 값을 oldState에 덮어 씌운다.
*  @param {Object} oldState 
*  @param {Object} newState 
*  @returns {Object}
*/
var changeOldToNewState = function(oldState, newState) {
    var result = [];
    var stack = [{ context: result
                    , key: 0
                    , value: oldState }];
    var currContext;
    while (currContext = stack.pop()) {
        var { context, key, value } = currContext;

        if (!value || typeof value != 'object') {
            var newValue = findStateValue(newState, key);
            if ( newValue === "") {
                context[key] = "";
            }
            else if (newValue === false) {
                context[key] = false;
            }
            else {
                context[key] = newValue || value;
            }
        }
        else if (Array.isArray(value)) {
            var newValue = findStateValue(newState, key);
            context[key] = newValue || value;
        } 
        else {
            context = context[key] = Object.create(null);
            Object.entries(value).forEach(([ key, value ]) => {
                stack.push({context, key, value});
            });
        }
    };
    return result[0];
};    

/** updateOneArrayIndexValueAndGetNewArray
    *  배열의 특정 인덱스 값을 업데이트하고 업데이트된 새로운 배열을 리턴한다
    *  @param {Array} array 
    *  @param {number} index
    *  @param {number | string} newValue 
    *  @returns {Array} New array
    */
    var updateOneArrayIndexValueAndGetNewArray = function(array, index, newValue) {
        return [ ...array.slice(0, index), newValue,
                ...array.slice(index+1, array.length) ]
    }

    /** deleteOneArrayIndexValueAndGetNewArray
    *  배열의 특정 인덱스 값을 삭제하고 삭제된 새로운 배열을 리턴한다
    *  @param {Array} array 
    *  @param {number} index 
    *  @returns {Array} New array
    */
    var deleteOneArrayIndexValueAndGetNewArray = function(array, index) {
        return [ ...array.slice(0, index), 
                ...array.slice(index+1, array.length) ]
    }

    /** updateTwoArrayIndexValueAndGetNewArray
    *  2차원 배열의 특정 인덱스 값을 업데이트하고 업데이트된 새로운 배열을 리턴한다
    *  @param {Array} array 
    *  @param {number} row
    *  @param {number} col
    *  @param {number | string} newValue 
    *  @returns {Array} New array
    */
    var updateTwoArrayIndexValueAndGetNewArray = function(twoarray, row, col, newValue) {
        var newArray = [...twoarray[row].slice(0, col),newValue,
                        ...twoarray[row].slice(col + 1, twoarray[row].length)]
        return [ ...twoarray.slice(0, row), newArray,
                ...twoarray.slice(row+1, twoarray.length) ]
    }
    /** deleteTwoArrayIndexValueAndGetNewArray
    *  2차원 배열의 특정 인덱스 값을 삭제하고 삭제된 새로운 배열을 리턴한다
    *  @param {Array} array 
    *  @param {number} row 
    *  @param {number} col
    *  @returns {Array} New array
    */
    var deleteTwoArrayIndexValueAndGetNewArray = function(twoarray, row, col) {
        var newArray = [...twoarray[row].slice(0, col),
                        ...twoarray[row].slice(col + 1, twoarray[row].length)]
        return [ ...twoarray.slice(0, row), newArray,
                ...twoarray.slice(row+1, twoarray.length) ]
    }
const BLPN_NODE_EDITOR_LEFT = `.blpn-nodeEditor-left`;

const NODE_BLOCK_BTN_ENUM = {
    CLASS: 1
    , DEF: 2
    , IF: 3
    , FOR: 4
    , WHILE: 5
    , IMPORT: 6
    , API: 7
    , TRY: 8
    , CODE: 9
}

const NODE_BLOCK_ENUM = {
    CLASS: 1
    , DEF: 2
    , IF: 3
    , FOR: 4
    , WHILE: 5
    , IMPORT: 6
    , API: 7
    , TRY: 8
    , CODE: 9
}

const NODE_OPERATOR_ENUM = {
    PLUS: 1
    , MINUS: 2
    , MULTIPLY: 3
    , DIVIDE: 4
    , ASSIGN: 5

    , NOT_SAME: 6
    , SAME:7
    , LESS_THAN: 8
    , LESS_THAN_OR_SAME: 9
    , MORE_THAN: 10
    , MORE_THAN_OR_SMAE: 11

    , PLUS_ASSIGN: 12
    , MINUS_ASSIGN: 13

    , IN: 14
}

const NODE_ELEMENT_ENUM = {
    CLASS: 1
    , DEF: 2
    , IF: 3
    , FOR: 4
    , WHILE: 5
    , IMPORT: 6
    , API: 7
    , TRY: 8
    , CODE: 9
    , ELIF: 10
    , ELSE: 11
}

var NodeCodeLine = function( nodeElementThis ) {
    this.rootDomElement; 
    this.uuid = getUUID();     
    this.nodeElementThis = nodeElementThis; 
    this.codeTokenArray = [

    ];

    this.render();
}

NodeCodeLine.prototype.render = function() {
    var rootDomElement = $(`<div class='blpn-node-codeline'>
                                <span class='blpn-node-codeline-span'>Drop Here</span>
                            </div>`);
    this.setRootDomElement(rootDomElement);
}

NodeCodeLine.prototype.setRootDomElement = function(element) {
    this.rootDomElement = element;
}

NodeCodeLine.prototype.getRootDomElement = function() {
    return this.rootDomElement;
}

var NodeLink = function( nodeElementThis ) {
    this.rootDomElement; 
    this.uuid = getUUID();  
    this.nodeElementThis = nodeElementThis;
    this.nextNode = null;
    this.path;

    this.render();
}

NodeLink.prototype.render = function() {
    var nodeLinkDomElementContainer = $(`<div class='blpn-node-link-container
                                            blpn-style-flex-column-center'>
                            </div>`);
    var nodeNext = $(`<div class='blpn-node-next'>
                           Next
                     </div>`);
    var nodeLinkDomElement = document.createElement('span');  
    nodeLinkDomElement.classList.add('blpn-node-link');                   

    nodeNext.append(nodeLinkDomElement);
    nodeLinkDomElementContainer.append(nodeNext);

    this.setRootDomElement(nodeLinkDomElementContainer);
    this.setNodeLinkDomElement(nodeLinkDomElement);

    // SVG Connector
    this.path = document.createElementNS(svg.ns, 'path');
    this.path.setAttributeNS(null, 'stroke', '#545454');
    this.path.setAttributeNS(null, 'stroke-width', '2');
    this.path.setAttributeNS(null, 'fill', 'none');
    svg.appendChild(this.path);

    this.bindClickNodeLinkEventFunction();
}

NodeLink.prototype.getNodeThis = function() {
    var nodeElementThis = this.getNodeElementThis();
    var nodeThis = nodeElementThis.getNodeThis();
    return nodeThis;
}

NodeLink.prototype.getNodeElementThis = function() {
    return this.nodeElementThis;
}

NodeLink.prototype.setRootDomElement = function(element) {
    this.rootDomElement = element;
}
NodeLink.prototype.getRootDomElement = function() {
    return this.rootDomElement;
}

NodeLink.prototype.setNodeLinkDomElement = function(element) {
    this.nodeLinkDomElement = element;
}
NodeLink.prototype.getNodeLinkDomElement = function() {
    return this.nodeLinkDomElement;
}

NodeLink.prototype.getNextNode = function() {
    return this.nextNode;
}
NodeLink.prototype.setNextNode = function(nextNode) {
    this.nextNode = nextNode;
}

NodeLink.prototype.getAttachPoint = function() {
    var offset = this.getNodeLinkDomElement().getBoundingClientRect();

    return {
        x: offset.left ,
        y: offset.top
    };
};

NodeLink.prototype.bindClickNodeLinkEventFunction = function() {
    // DOM Event handlers
    var that = this;
    var nodeLinkDomElement = this.getNodeLinkDomElement();
    nodeLinkDomElement.onclick = function(event) {
  
        if (mouse.currentLink) {
            if (mouse.currentLink.path.hasAttribute('d'))
                mouse.currentLink.path.removeAttribute('d');
            if (mouse.currentLink.nextNode) {
                mouse.currentLink.nextNode.detachLink(mouse.currentLink);
                mouse.currentLink.nextNode = null;
            }
        }

        mouse.currentLink = that;
        if (that.nextNode) {
            that.nextNode.detachLink(that);
            $(this).removeClass('filled');
            $(this).addClass('empty');
        }
        event.stopPropagation();
    };
}
/** option 
 *     isCodeLine
 *     isNodeLink
 */
var NodeElement = function(nodeThis, subType, elementNum, option ) {
    this.rootDomElement; 
    this.nodeLinkDomElement; 
    this.nodeCodeLineDomElement;
    this.deleteButtonElement;
     
    this.uuid = getUUID();  
    this.subType = subType;
    this.nodeThis = nodeThis;

    /** subtype이 class (1) 타입이면 코드라인을 생성하지 않는다 */
    if (subType === 1) {
        this.nodeCodeLine = null;
    } else {
        this.nodeCodeLine =  new NodeCodeLine(this);
    }

    if (option && option.isNodeLink === false ) {
        this.nodeLink = null;
    } else {
        this.nodeLink = new NodeLink(this);
    }
    var newNodeCodeLineDomElement = $(`<div class='blpn-node-codeline'>
                                            <span class='blpn-node-codeline-span'>Drop Here</span>
                                        </div>`);
    this.setNodeCodeLineDomElement(newNodeCodeLineDomElement);
    // if (subType === 1) {
    //     nodeThis.addClassState('init');
    // }
    //FIXME:
    this.elementNum = elementNum;
}

NodeElement.prototype.getElementNum = function() {
    return this.elementNum;
}
NodeElement.prototype.setElementNum = function(elementNum) {
    this.elementNum = elementNum;
}

NodeElement.prototype.render = function(elementNum) {
    var _rootDomElement = this.getRootDomElement();

    $(_rootDomElement).empty();
    $(_rootDomElement).remove();

    this.setElementNum(elementNum);


    var nodeThis = this.getNodeThis();
    var subType = this.getSubType();
    // var rootDomNodeElement = $(`<div class='blpn-node-element-container'>
    //                             </div>`);
    var rootDomNodeElement = document.createElement('div');        
    rootDomNodeElement.classList.add('blpn-node-element-container');
    var nodeElementHeader;
    switch (subType) {
        // class
        case 1: {                     
            this.setRootDomElement(rootDomNodeElement); 
            this.renderClassState(elementNum);
            break;
        }
        // def
        case 2: {
            var nodeElementRow = $(`<div class='blpn-style-flex-row'></div>`);
            var nodeCodeLineRootDom = this.getNodeCodeLineDomElement();
            var nodeLinkRootDom = this.nodeLink.getRootDomElement();

            nodeElementRow.append(nodeCodeLineRootDom);
            nodeElementRow.append(nodeLinkRootDom);
            $(rootDomNodeElement).append(nodeElementRow);

            this.setRootDomElement(rootDomNodeElement);       

            this.setNodeCodeLineDomElement(nodeCodeLineRootDom);                            
            this.setNodeLinkDomElement(nodeLinkRootDom);
            break;
        }
        // if
        case 3: {
            this.setRootDomElement(rootDomNodeElement); 
            this.renderIfState(elementNum);
            break;
        }
        // for
        case 4: {
            var nodeElementRow = $(`<div class='blpn-style-flex-row'></div>`);
            var nodeCodeLineRootDom = this.getNodeCodeLineDomElement();
            var nodeLinkRootDom = this.nodeLink.getRootDomElement();

            nodeElementRow.append(nodeCodeLineRootDom);
            nodeElementRow.append(nodeLinkRootDom);
            $(rootDomNodeElement).append(nodeElementRow);

            this.setRootDomElement(rootDomNodeElement);       

            this.setNodeCodeLineDomElement(nodeCodeLineRootDom);                            
            this.setNodeLinkDomElement(nodeLinkRootDom);
            break;
        }
        // while
        case 5: {
            var nodeElementRow = $(`<div class='blpn-style-flex-row'></div>`);
            var nodeCodeLineRootDom = this.getNodeCodeLineDomElement();
            var nodeLinkRootDom = this.nodeLink.getRootDomElement();

            nodeElementRow.append(nodeCodeLineRootDom);
            nodeElementRow.append(nodeLinkRootDom);
            $(rootDomNodeElement).append(nodeElementRow);

            this.setRootDomElement(rootDomNodeElement);       

            this.setNodeCodeLineDomElement(nodeCodeLineRootDom);                            
            this.setNodeLinkDomElement(nodeLinkRootDom);
            break;
        }
        // code
        case 9: {
            this.setRootDomElement(rootDomNodeElement); 
            this.renderCodeState(elementNum);

            break;
        }
        // elif
        case 10: {
            this.setRootDomElement(rootDomNodeElement); 
            this.renderIfState(elementNum);
            break;
        }
        // else
        case 11: {
            this.setRootDomElement(rootDomNodeElement); 
            this.renderIfState(elementNum);              
            break;
        }
        default: {
            break;
        }
    }

    var nodeThis = this.getNodeThis();
    var nodeRootDomElement = nodeThis.getRootDomElement();
    $(nodeRootDomElement).append(rootDomNodeElement);
}

NodeElement.prototype.getSubType = function() {
    return this.subType;
}

NodeElement.prototype.getNodeThis = function() {
    return this.nodeThis;
}

NodeElement.prototype.getNodeCodeLine = function() {
    return this.nodeCodeLine;
}
NodeElement.prototype.getNodeLink = function() {
    return this.nodeLink;
}

NodeElement.prototype.setRootDomElement = function(element) {
    this.rootDomElement = element;
}
NodeElement.prototype.getRootDomElement = function() {
    return this.rootDomElement;
}

NodeElement.prototype.makeNodeCodeLineDomElement = function(operatorSubType) {
    var nodeThis = this.getNodeThis();
    var elementNum = this.getElementNum();
    var nodeElementSubType = this.getSubType();

    var reNewData = function(data) {
        // console.log('elementNum', elementNum);
        // console.log('operatorSubType', operatorSubType);
        // console.log('nodeElementSubType', nodeElementSubType);
        if ( nodeElementSubType === 3 || nodeElementSubType === 10 || nodeElementSubType === 11) {
            nodeThis.getState('ifCodeLineList')[elementNum].codeTokenList.push(data);
            // console.log('ifCodeLineList', nodeThis.getState('ifCodeLineList'));
        } else if (nodeElementSubType === 9) {
            nodeThis.getState('codeBlockLineList')[elementNum].codeTokenList.push(data);
            // console.log('codeBlockLineList', nodeThis.getState('codeBlockLineList'));
        }
    }



    var operatorName = ``;
        switch (operatorSubType) {
            case 1: {
                var codeToken = { type: "CALCULATION_OPERATOR", data:"+" }
                
                reNewData(codeToken);
                operatorName = `+`;
                break;
            }
            case 2: {
                var codeToken = { type: "CALCULATION_OPERATOR", data:"-" }
                
                reNewData(codeToken);
                operatorName = `-`;
                break;
            }
            case 3: {
                var codeToken = { type: "CALCULATION_OPERATOR", data:"*" }  
                      
                reNewData(codeToken);
                operatorName = `x`;
                break;
            }
            case 4: {
                var codeToken = { type: "CALCULATION_OPERATOR", data:"/" }  
                      
                reNewData(codeToken);
                operatorName = `÷`;
                break;
            }
            case 5: {
                var codeToken = { type: "ASSIGN_OPERATOR", data:"=" }  
                      
                reNewData(codeToken);
                operatorName = `=`;
                break;
            }
            case 6: {
                var codeToken = { type: "CONDITION_OPERATOR", data:"!=" }  
                      
                reNewData(codeToken);
                operatorName = `≠≠`;
                break;
            }
            case 7: {
                var codeToken = { type: "CONDITION_OPERATOR", data:"==" }  
                      
                reNewData(codeToken);
                operatorName = `==`;
                break;
            }
            case 8: {
                var codeToken = { type: "CONDITION_OPERATOR", data:"<" }  
                      
                reNewData(codeToken);
                operatorName = `<`;
                break;
            }
            case 9: {
                var codeToken = { type: "CONDITION_OPERATOR", data:"<=" }  
                      
                reNewData(codeToken);
                operatorName = `≤`;
                break;
            }
            case 10: {
                var codeToken = { type: "CONDITION_OPERATOR", data:">" }  
                      
                reNewData(codeToken);
                operatorName = `＞`;
                break;
            }
            case 11: {
                var codeToken = { type: "CONDITION_OPERATOR", data:">=" }  
                      
                reNewData(codeToken);
                operatorName = `≥`;
                break;
            }
            case 12: {
                var codeToken = { type: "CALCULATION_OPERATOR", data:"+=" }  
                      
                reNewData(codeToken);
                operatorName = `+=`;
                break;
            }
            case 13: {
                var codeToken = { type: "CALCULATION_OPERATOR", data:"-=" }  
                      
                reNewData(codeToken);
                operatorName = `-=`;
                break;
            }
            case 14: {
                var codeToken = { type: "CONDITION_OPERATOR", data:"in" }  
                      
                reNewData(codeToken);
                operatorName = `in`;
                break;
            }
            default :{
                break;
            }
        }
    var newNodeCodeLineDomElement = $(`<div class='blpn-node-codeline
                                                   blpn-style-flex-row-between'>
                                            <span class='blpn-node-codeline-span'>Drop Here</span>
                                            <span class='blpn-node-codeline-span-new'>
                                                ${operatorName}
                                            </span>
                                            <span class='blpn-node-codeline-span'>Drop Here</span>
                                        </div>`);
    this.setNodeCodeLineDomElement(newNodeCodeLineDomElement);
    // this.render();
    var nodeThis = this.getNodeThis();
    nodeThis.renderNodeElementList();
}

NodeElement.prototype.setNodeCodeLineDomElement = function(element) {
    this.nodeCodeLineDomElement = element;
}
NodeElement.prototype.getNodeCodeLineDomElement = function() {
    return this.nodeCodeLineDomElement;
}

NodeElement.prototype.setNodeLinkDomElement = function(element) {
    this.nodeLinkDomElement = element;
}
NodeElement.prototype.getNodeLinkDomElement = function() {
    return this.nodeLinkDomElement;
}

NodeElement.prototype.setDeleteButtonElement = function(element) {
    this.deleteButtonElement = element;
}
NodeElement.prototype.getDeleteButtonElement = function() {
    return this.deleteButtonElement;
}

NodeElement.prototype.getUUID = function() {
    return this.uuid;
}
NodeElement.prototype.setUUID = function(uuid) {
    this.uuid = uuid;
}

NodeElement.prototype.getCodeLineDomPoint = function() {
    var rootDomElement = this.getRootDomElement();
    var offset = rootDomElement.getElementsByClassName("blpn-node-codeline")[0].getBoundingClientRect();

    return {
        x: offset.left 
        , y: offset.top
        , width: offset.width
        , height: offset.height
        , dom: rootDomElement.getElementsByClassName("blpn-node-codeline")[0]
        , nodeElementThis: this
        , nodeThis : this.getNodeThis()
    };
};

/** type에 따른 렌더링 */
NodeElement.prototype.renderClassState = function(index) {
    var nodeThis = this.getNodeThis();
    var rootDomNodeElement = this.getRootDomElement();
    var methodName = nodeThis.getState(`methodList`)[index].name;
    var nodeElementHeader = $(`<div style='position:relative;'>
                                       
                                    </div>`);
    if( methodName !== '_init_') {
        var deleteButtonElement = $(`<button class='blpn-node-btn blpn-node-delete-btn'
                                            style=' position:absolute;
                                                    right: 0px;
                                                    width: 20px;
                                                    height: 20px;
                                                    z-index: 1;'>
                                        <span>x</span>
                                    </button>`); 
                                    
        nodeElementHeader.append(deleteButtonElement); 
        this.setDeleteButtonElement(deleteButtonElement);  
        this.bindDeleteNodeElementEventFunction();

        var flexRow = $(`<div class='blpn-style-flex-row'></div>`);
        var methodNameElement = $(`<div style='font-weight:700;'> Method: </div>`);   
        var methodNameInput = $(`<input class='blpn-node-input' 
                                        style='margin-left:10px;'
                                        value='${methodName}'
                                        placeholder='input name'
                                        type='text'></input>`);
                             
        flexRow.append(methodNameElement);
        flexRow.append(methodNameInput);

        $(methodNameInput).on("change keyup paste", function() {
            nodeThis.getState('methodList')[index]['name'] =  $(this).val()
        });

        $(rootDomNodeElement).append(flexRow);
    } else {
        var initName = $(`<strong>${ methodName || ''}</strong>`);
        nodeElementHeader.append(initName);
    }
 
    var nodeElementRow = $(`<div class='blpn-style-flex-row'></div>`);
    var nodeEmptyLineDom = $(`<div class='blpn-node-emptyline'>
                                </div>`);
    var inParamDomeElement = $(`<div>In Param: </div>`);        

    nodeThis.getState(`methodList`)[index]['inParamList'].forEach( (inParam, paramIndex) => {
        var inParamNode = $(`<div class='blpn-style-flex-row'>
                            <span style='margin-right:10px;'>${paramIndex}</span>
                         </div>`);

        var input = $(`<input class='blpn-node-input' 
                                        type='text' 
                                        value='${inParam.name}'
                                        placeholder='input'></input>`);

        var deleteButton = $(`<button class='blpn-node-btn'>x</button>`);
        $(input).on("change keyup paste", function() {
                var newData = {
                    name: $(this).val()
                }
                nodeThis.getState('methodList')[index]['inParamList'][paramIndex] = newData;
            });

            $(deleteButton).on('click', function() {
                nodeThis.getState('methodList')[index]['inParamList'].splice(paramIndex,1);
                nodeThis.render();
            });

            inParamNode.append(input);
            inParamNode.append(deleteButton);
            inParamDomeElement.append(inParamNode);
    });
    var inParamPlusButton = $(`<button class='blpn-node-btn'
                                            style='width:100%;'>
                                    +</button>`);

    $(inParamPlusButton).click(function() {
        var newData = {
            name: ''
        }
        nodeThis.getState('methodList')[index]['inParamList'].push(newData);
        nodeThis.render();
    });

    nodeEmptyLineDom.append(inParamDomeElement);
    nodeEmptyLineDom.append(inParamPlusButton);

    var nodeLinkRootDom = this.nodeLink.getRootDomElement();

    nodeElementRow.append(nodeEmptyLineDom);
    nodeElementRow.append(nodeLinkRootDom);

    $(rootDomNodeElement).append(nodeElementHeader); 
    $(rootDomNodeElement).append(nodeElementRow);
}

NodeElement.prototype.renderIfState = function(index) {
    var nodeThis = this.getNodeThis();
    var rootDomNodeElement = this.getRootDomElement();
    var {name} = nodeThis.getState('ifCodeLineList')[index];

    var nodeElementHeader = $(`<div style='position:relative;'>
                                    <strong>${name}</strong>
                                </div>`);
    if ( name !== 'IF') {
        var deleteButtonElement = $(`<button class='blpn-node-btn blpn-node-delete-btn'
                                             style=' position:absolute;
                                                        right: 0px;
                                                        width: 20px;
                                                        height: 20px;'>
                                            <span>x</span>
                                        </button>`);
            nodeElementHeader.append(deleteButtonElement);
            this.setDeleteButtonElement(deleteButtonElement);
            this.bindDeleteNodeElementEventFunction();

            $(rootDomNodeElement).append(nodeElementHeader);  
        }

    var nodeElementRow = $(`<div class='blpn-style-flex-row'></div>`);
    // var nodeCodeLineRootDom = this.nodeCodeLine.getRootDomElement();
    var nodeCodeLineRootDom = this.getNodeCodeLineDomElement();
    var nodeLinkRootDom = this.nodeLink.getRootDomElement();
    nodeElementRow.append(nodeCodeLineRootDom);
    nodeElementRow.append(nodeLinkRootDom);
    $(rootDomNodeElement).append(nodeElementRow);

    this.setNodeCodeLineDomElement(nodeCodeLineRootDom);    
    this.setNodeLinkDomElement(nodeLinkRootDom);
}

NodeElement.prototype.renderCodeState = function(index) {
    var nodeThis = this.getNodeThis();
    var rootDomNodeElement = this.getRootDomElement();
    // console.log(nodeThis.getState('codeBlockLineList'), index);
    var { codeTokenList } = nodeThis.getState('codeBlockLineList')[index];

    var nodeElementHeader = $(`<div style='position:relative; height:25px;'>
                                       
                                </div>`);
    var deleteButtonElement = $(`<button class='blpn-node-btn blpn-node-delete-btn'
                                                style=' position:absolute;
                                                        right: 0px;
                                                        width: 20px;
                                                        height: 20px;'>
                                            <span>x</span>
                                        </button>`);
    nodeElementHeader.append(deleteButtonElement);
    this.setDeleteButtonElement(deleteButtonElement);
    this.bindDeleteNodeElementEventFunction();
    $(rootDomNodeElement).append(nodeElementHeader);     
            
    var nodeElementRow = $(`<div class='blpn-style-flex-row'></div>`);
    // var nodeCodeLineRootDom = this.nodeCodeLine.getRootDomElement();
    var nodeCodeLineRootDom = this.getNodeCodeLineDomElement();
    var nodeLinkRootDom = this.nodeLink.getRootDomElement();
    nodeElementRow.append(nodeCodeLineRootDom);
    nodeElementRow.append(nodeLinkRootDom);
    $(rootDomNodeElement).append(nodeElementRow);


    this.setNodeCodeLineDomElement(nodeCodeLineRootDom);                            
    this.setNodeLinkDomElement(nodeLinkRootDom);
}

/** 이벤트 함수 바인딩 */
NodeElement.prototype.bindDeleteNodeElementEventFunction = function() {
    var that = this;
    var deleteButtonElement = this.getDeleteButtonElement();
    deleteButtonElement.click( function() {
 
        var subType = that.getSubType();
        var elementNum = that.getElementNum();
        // console.log('삭제 subType, elementNum',subType, elementNum);
        var nodeThis = that.getNodeThis();
        /** node의 특정 elementNum의 class state 삭제*/
        if ( subType === 1) {
            nodeThis.deleteOneArrayIndexValue("methodList", elementNum);
        }
        /** node의 특정 elementNum의 if state 삭제*/
        if ( subType === 10 || subType === 11) {
            nodeThis.deleteOneArrayIndexValue("ifCodeLineList", elementNum);
        }
        /** node의 특정 elementNum의 codeBlock state 삭제*/
        if ( subType === 9) {
            nodeThis.deleteOneArrayIndexValue("codeBlockLineList", elementNum);
        }

        var rootDomElement = that.getRootDomElement();
        var uuid = that.getUUID();
        nodeThis.deleteNodeElement(uuid);
        $(rootDomElement).empty();
        $(rootDomElement).remove();

        nodeThis.renderNodeElementList();
    });
}

var Node = function(nodeContainerThis, subType, point) {
    this.type = `NODE`;
    this.subType = subType;
    this.pointX = point.x;
    this.pointY = point.y;
    this.scrollNum = 1;
    this.isConnected = false;

    this.uuid = getUUID();        
    this.nodeContainerThis = nodeContainerThis;      // nodeContainer에 push 될 때 할당
    this.rootDomElement; // render 시점에 할당
    this.deleteBtnDomElement;  // render 시점에 할당

    // this.nodeCodeLineList = [];
    // this.nodeLinkList = [];
    this.nodeElementList = [];
    this.attachedLinkList = [];
    /**
     * subType에 따라 node의 state는 달라짐 
    */
    this.state = {
        class: {
            methodButton: null
            , selfVariableList: []
            , methodList: [
                // {
                //     name:'_init_'
                //     , inParamList: []
                // }
            ]
            , inParamList: []
        }
        , def: {
            defName: ''
            , defInParamList: []
            , defOutParamList: []
        }
        , if: {
            elifButton: null
            , elseButton: null
            , ifCodeLineList: []
        }
        , for: {
            forCodeLine: ''
        }
        , while: {
            whileCodeLine: ''
        }
        , code: {
            codeBlockLineList: []
            , lineButton: null
        }
    }

    if (this.subType === 1) {
        this.addNodeElement(NODE_ELEMENT_ENUM.CLASS); 
        this.addClassState('init');
    }

    if (this.subType === 3) {
        this.addNodeElement(NODE_ELEMENT_ENUM.IF); 
        this.addIfState('IF');
    }
    if (this.subType === 9) {
        this.addNodeElement(NODE_ELEMENT_ENUM.CODE); 
        this.addCodeBlockState();
    }
    this.render();
}
Node.prototype.getSubType = function() {
    return this.subType;
}
Node.prototype.getUUID = function() {
    return this.uuid;
}
Node.prototype.setUUID = function(uuid) {
    this.uuid = uuid;
}
Node.prototype.getNodeContainerThis = function() {
    return this.nodeContainerThis;
}
Node.prototype.setNodeContainerThis = function(nodeContainerThis) {
    this.nodeContainerThis = nodeContainerThis;
}

Node.prototype.getPointX = function() {
    return this.pointX;
}
Node.prototype.setPointX = function(pointX) {
    this.pointX = pointX;
}

Node.prototype.setPointY = function(pointY) {
    this.pointY = pointY;
}
Node.prototype.getPointY = function() {
    return this.pointY;
}

Node.prototype.getScrollNum = function() {
    return this.scrollNum;
}
Node.prototype.setScrollNum = function(scrollNum) {
    this.scrollNum = scrollNum;
}

Node.prototype.getIsConnected = function() {
    return this.isConnected;
}
Node.prototype.setIsConnectedToFalse = function() {
    this.isConnected = false;
}
Node.prototype.setIsConnectedToTrue = function() {
    this.isConnected = true;
}

/** DOM 조작 관련 메소드 들 */
Node.prototype.setRootDomElement = function(element) {
    this.rootDomElement = element;
}
Node.prototype.getRootDomElement = function() {
    return this.rootDomElement;
}

Node.prototype.setDeleteBtnDomElement = function(element) {
    this.deleteBtnDomElement = element;
}
Node.prototype.getDeleteBtnDomElement = function() {
    return this.deleteBtnDomElement;
}

Node.prototype.setHeaderLinkDomElement = function(element) {
    this.headerLinkDomElement = element;
}
Node.prototype.getHeaderLinkDomElement = function() {
    return this.headerLinkDomElement;
}


// Node.prototype.getNodeCodeLineList = function() {
//     return this.nodeCodeLineList;
// }
// Node.prototype.addNodeCodeLine = function(nodeCodeLine) {
//     this.nodeCodeLineList.push(nodeCodeLine);
// }
// Node.prototype.deleteCodeLine = function() {

// }

// Node.prototype.getNodeLinkList = function() {
//     return this.nodeLinkList;
// }
// Node.prototype.addNodeLink = function(nodeLink) {
//     this.nodeLinkList.push(nodeLink);
// }
// Node.prototype.deleteNodeLink = function() {

// }

Node.prototype._renderHeaderLink = function(headerName) {
    var rootDomElement = this.getRootDomElement();
    var header = $(`<div class='blpn-node-header'>
                        <strong>${headerName}</strong>
                    </div>`);
    // headerLinkDomElement = $(`<span class='blpn-node-headlink'></span>`);
    var headerLinkDomElement = document.createElement('span');
    headerLinkDomElement.classList.add('blpn-node-headlink');
    headerLinkDomElement.innerHTML = '&nbsp;';

    $(header).append(headerLinkDomElement);
    $(rootDomElement).append(header);

    var that = this;
    headerLinkDomElement.onclick = function(event) {
        if (mouse.currentLink 
            && !that.ownsLink(mouse.currentLink)) {
            var tmp = mouse.currentLink;
            mouse.currentLink = null;
            that.connectTo(tmp);
        }
        event.stopPropagation();
    };
    this.setHeaderLinkDomElement(headerLinkDomElement);
    return header;
}


Node.prototype.render = function() {
    var that = this;
    /** 기존 렌더링 삭제*/
    var _rootDomElement = this.getRootDomElement();
    $(_rootDomElement).remove();
    $(_rootDomElement).empty();

    /** 새로 렌더링 */
    var subType = this.getSubType();

    var rootDomElement = document.createElement('div');
    this.setRootDomElement(rootDomElement);
    rootDomElement.classList.add('blpn-node');

    var headerName = ``;
    switch (subType) {
        /** class */
        case 1: {
            headerName = `CLASS`;
            var headerDomElement = this._renderHeaderLink(headerName);     
  
            var buttonContainer = $(`<div class='blpn-node-class-button-container
                                        blpn-style-flex-row'>
                                </div>`);
            var methodButton = $(`<button class='blpn-node-btn'>
                                    <span>+ Method</span>
                                </button>`);
        
            this.setState({
                methodButton: methodButton
            });

            buttonContainer.append(methodButton);
            headerDomElement.append(buttonContainer);

            $(methodButton).click(function() {
              
                that.addNodeElement(NODE_ELEMENT_ENUM.CLASS); 
                that.addClassState();
                var nodeElementList = that.getNodeElementList();
        
                nodeElementList.forEach(( nodeElement, index) => {
                    nodeElement.render(index);
                });
            });

            /** class node self variable */
            var selfVariableDomeElement = $(`<div>
                                                <div>Self Variable :</div>
                                            </div>`);

            that.getState(`selfVariableList`).forEach( (selfVar, index) => {
                var selfVarNode = $(`<div class='blpn-style-flex-row'>
                                         <span style='margin-right:10px;'>${index}</span>
                                         
                                     </div>`);
                var input = $(`<input class='blpn-node-input' 
                                      type='text' 
                                      value='${selfVar.name}'
                                      placeholder='input'></input>`);

                var deleteButton = $(`<button class='blpn-node-btn'>x</button>`);

                $(input).on("change keyup paste", function() {
                    var newData = {
                        name: $(this).val()
                    }
                 
                    that.updateOneArrayIndexValue("selfVariableList", index, newData);
                });

                $(deleteButton).on('click', function() {
                    that.deleteOneArrayIndexValue("selfVariableList", index);
                    that.render();
                });

                selfVarNode.append(input);
                selfVarNode.append(deleteButton);
                selfVariableDomeElement.append(selfVarNode);
            });

            var selfVariablePlusButton = $(`<button class='blpn-node-btn'
                                                style='width:100%;'>+</button>`);

            $(rootDomElement).append(selfVariableDomeElement);  
            $(rootDomElement).append(selfVariablePlusButton);  
            $(selfVariablePlusButton).click(function() {
                var newData = {
                    name: ''
                }
                that.setState({
                    selfVariableList: [...that.getState(`selfVariableList`), newData]
                });
                that.render();
            });

            this.renderNodeElementList();

            break;
        }
        /** def */
        case 2: {
            headerName = `DEF`;
            this._renderHeaderLink(headerName);
            this.addNodeElement(NODE_ELEMENT_ENUM.DEF);

            this.renderNodeElementList();

            break;
        }
        /** if */
        case 3: {
            headerName = `IF`;
            var headerDomElement = this._renderHeaderLink(headerName);

            var buttonContainer = $(`<div class='blpn-node-if-button-container
                                        blpn-style-flex-row'>
                                </div>`);
            var elifButton = $(`<button class='blpn-node-btn'>
                                    <span>+ Elif</span>
                                </button>`);
            var elseButton = $(`<button class='blpn-node-btn'
                                        style='margin-left:10px;'>
                                    <span>+ Else</span>
                                </button>`);
            this.setState({
                elifButton
                , elseButton
            });

            buttonContainer.append(elifButton);
            buttonContainer.append(elseButton);
            headerDomElement.append(buttonContainer);
                
                         
            // this.addNodeElement(NODE_ELEMENT_ENUM.IF);

            this.renderNodeElementList();

            this.bindClickElifBtnEvent();
            this.bindClickElseBtnEvent();
            break;
        }
        /** for */
        case 4: {
            headerName = `FOR`;
            this._renderHeaderLink(headerName);
            this.addNodeElement(NODE_ELEMENT_ENUM.FOR);

            this.renderNodeElementList();
            break;
        }
        /** while */
        case 5: {
            headerName = `WHILE`;
            this._renderHeaderLink(headerName); 
            this.addNodeElement(NODE_ELEMENT_ENUM.WHILE);        
                        
            this.renderNodeElementList();
            break;
        }
        
        /** code block */
        case 9: {   
            headerName = `CODE BLOCK`;
            var headerDomElement = this._renderHeaderLink(headerName); 
            var buttonContainer = $(`<div class='blpn-node-if-button-container
                                        blpn-style-flex-row'>
                                </div>`);
            var lineButton = $(`<button class='blpn-node-btn'>
                                    <span>+ Line</span>
                                </button>`);

            // this.addNodeElement(NODE_ELEMENT_ENUM.CODE);      
            this.setState({
                lineButton
            });
            buttonContainer.append(lineButton);
            headerDomElement.append(buttonContainer);
            this.renderNodeElementList();
            this.bindClickLineBtnEvent();
            break;
        }

        default: {
            break;
        }
    }

    /** 공통 dom 렌더링 */
       /* top: -25px; */

    var btnContainer = $(`<div  style='position:absolute; 
                                        width: 50px;
                                        height: 30px; top: 0px; right: -50px;
                                        display: flex;
                                        flex-direction: column;'></div>`);
    var deleteBtn = $(`<button class='blpn-node-btn blpn-node-delete-btn
                                      blpn-style-flex-row-center'
                                style=' width: 20px;
                                        height: 20px;'>
                            <span>x</span>
                        </button>`);
    var updownToggleBtn = $(`  <button class='blpn-node-btn
                                              blpn-node-header-updown-btn'
                                      style='width: 20px;
                                             height: 20px;
                                             padding:0px;
                                             position: relative;'>▼</button>`);
    btnContainer.append(deleteBtn);     
    btnContainer.append(updownToggleBtn);    
                                     
    $(rootDomElement).append(btnContainer);
    this.setDeleteBtnDomElement(deleteBtn);

    rootDomElement.style.top = `${this.getPointY()}` + 'px';
    rootDomElement.style.left = `${this.getPointX()}` + 'px';
    $(`.blpn-nodeEditor-left`).append(rootDomElement);

    // 이벤트 함수 바인딩
    this.bindDragEvent();
    this.bindClickNodeEvent();
    this.bindMouseWheelEvent();
    this.bindDeleteNodeEvent();
}

Node.prototype.getNodeElementList = function() {
    return this.nodeElementList;
}

Node.prototype.addNodeElement = function(nodeElementSubType) {
    var nodeElementSubType = nodeElementSubType;
    var elementNum = this.getNodeElementList().length;
    var nodeElement = new NodeElement(this, nodeElementSubType, elementNum);
    this.nodeElementList.push(nodeElement);
    return nodeElement;
}

Node.prototype.deleteNodeElement = function(nodeElementUUID) {
    var nodeElementList = this.getNodeElementList();
    var selectedIndex = -1;
    var is = this.nodeElementList.some((nodeElement, index) => {
        if (nodeElement.getUUID() === nodeElementUUID) {
            selectedIndex = index;
            return true;
        } else {
            return false;
        }
    });

    if (is) {
        this.nodeElementList.splice(selectedIndex,1);
    } 
}

Node.prototype.renderNodeElementList = function() {
    var nodeElementList = this.getNodeElementList();
    nodeElementList.forEach(( nodeElement, index) => {
        nodeElement.render(index);
    });
}
// ** link 연결하는 메소드 들*/
Node.prototype.getOutputPoint = function() {
    var rootDomElement = this.getRootDomElement();
    var offset = rootDomElement.getElementsByClassName("blpn-node-headlink")[0].getBoundingClientRect();
    return {
        x: offset.left,
        y: offset.top
    };
};

Node.prototype.getCurrPosition = function() {      
    var rootDomElement = this.getRootDomElement();
    var tmp = rootDomElement.firstElementChild;
    var offset = getFullOffset(tmp);
    return {
        x: offset.left,
        y: offset.top
    };
};

Node.prototype.createPath = function(a, b) {
    var diff = {
        x: b.x - a.x,
        y: b.y - a.y
    };

    var pathStr = 'M' + a.x + ',' + a.y + ' ';
        pathStr += 'C';
        pathStr += a.x + diff.x / 3 * 2 + ',' + a.y + ' ';
        pathStr += a.x + diff.x / 3 + ',' + b.y + ' ';
        pathStr += b.x + ',' + b.y;
        
    return pathStr;
};

Node.prototype.ownsLink = function(link) {
    var nodeLinkList = this.getNodeLinkList();
    for (var i = 0; i < nodeLinkList.length; i++) {
        if (nodeLinkList[i] == link) {
            return true;
        }
    }
    return false;
};

/** FIXME: */
Node.prototype.addLink = function(name, nodeLinkSubType) {
    var rootDomElement = this.getRootDomElement();
    // var link = new NodeLink(this, name, nodeLinkSubType);
    // this.nodeLinkList.push(link);


    // if ( name === "elif" && this.subType === 6) {

    //     if (this.domElement.children.length < 5 ) {
    //         this.domElement.appendChild(link.domElement);
    //     } else {
    //         var elseDomElement = this.domElement.children[this.domElement.children.length - 1];
    //         this.domElement.insertBefore(link.domElement, elseDomElement);
    //     }

    // } else {
    //     this.domElement.appendChild(link.domElement);
    // }

    
    return link;
};
Node.prototype.getAttachedLinkList = function() {
    return this.attachedLinkList;
}

Node.prototype.getNodeLinkList = function() {
    var nodeElementList = this.getNodeElementList();
    var nodeLinkList = [];
    
    nodeElementList.forEach(nodeElement => {
        var nodeLink = nodeElement.getNodeLink();
        if (nodeLink) {
            nodeLinkList.push(nodeLink);
        }
    });
    return nodeLinkList;
}

Node.prototype.getAttachingLinkList = function() {
    var attachingLinkList = [];
    var nodeLinkList = this.getNodeLinkList();
    nodeLinkList.forEach(nodeLink => {
        if (nodeLink.getNextNode()) {
            attachingLinkList.push(nodeLink);
        } 
    });
    return attachingLinkList;
}     

Node.prototype.detachLink = function(nodeLink) {
    var rootDomElement = this.getRootDomElement();
    var index = -1;
    var attachedLinkList = this.getAttachedLinkList();
    for ( var i = 0; i < attachedLinkList.length; i++) {
        if ( attachedLinkList[i] == nodeLink) {
            index = i;
        }

    };

    if (index >= 0) {
        attachedLinkList[index].path.removeAttribute('d');
        attachedLinkList[index].setNextNode(null);
        attachedLinkList.splice(index, 1);
    }
    
    if (attachedLinkList.length <= 0) {
        this.removeConnectedCssClass();
        this.setIsConnectedToFalse();
    }
};

Node.prototype.detachAttachedLink = function(nodeLink) {
    var rootDomElement = this.getRootDomElement();
    var index = -1;
    var attachedLinkList = this.getAttachedLinkList();
    for ( var i = 0; i < attachedLinkList.length; i++) {
        if ( attachedLinkList[i] == nodeLink) {
            index = i;
        }

    };

    if (index >= 0) {
        attachedLinkList[index].path.removeAttribute('d');
        attachedLinkList[index].setNextNode(null);
        attachedLinkList.splice(index, 1);
    }
    
    if (attachedLinkList.length <= 0) {
        this.removeConnectedCssClass();
        this.setIsConnectedToFalse();
    }
}

/**
* @param {object} link 
*/
Node.prototype.detachAttachingLink = function(nodeLink) {
    var attachingLinkList = this.getAttachingLinkList();
    var index = -1;
    for ( var i = 0; i < attachingLinkList.length; i++) {
        if ( attachingLinkList[i] == nodeLink) {
            index = i;
        }
    };
    if (index >= 0) {
        attachingLinkList[index].path.removeAttribute('d');
        attachingLinkList[index].nextNode = null;
        attachingLinkList.splice(index, 1);
        var nodeLinkRootDomElement = nodeLink.getRootDomElement();
        $(nodeLinkRootDomElement).find(`.blpn-node-link`).removeClass('filled');
        $(nodeLinkRootDomElement).find(`.blpn-node-link`).addClass('empty');
    }
}

Node.prototype.updatePosition = function() {
    var outPoint = this.getOutputPoint();
    
    var attachedLinkList = this.getAttachedLinkList();
    for (var i = 0; i < attachedLinkList.length; i++) {
        var iPoint = attachedLinkList[i].getAttachPoint();
        var pathStr = this.createPath(iPoint, outPoint);
        attachedLinkList[i].path.setAttributeNS(null, 'd', pathStr);
    }

    var attachingLinkList = this.getAttachingLinkList();
    for (var i = 0; i < attachingLinkList.length; i++) {
        var iPoint = attachingLinkList[i].getAttachPoint();
        var outPoint = attachingLinkList[i].getNextNode().getOutputPoint();
        var pathStr = this.createPath(iPoint, outPoint);
        attachingLinkList[i].path.setAttributeNS(null, 'd', pathStr);
    }
    var nodeLinkList = this.getNodeLinkList();
    for (var j = 0; j < nodeLinkList.length; j++) {
        if (nodeLinkList[j].getNextNode() != null) {
            var iP = nodeLinkList[j].getAttachPoint();
            var oP = nodeLinkList[j].getNextNode().getOutputPoint();
            
            var pStr = this.createPath(iP, oP);
            nodeLinkList[j].path.setAttributeNS(null, 'd', pStr);
        }
    }
};

Node.prototype.connectTo = function(nodeLink) {
   
    nodeLink.setNextNode(this);
    this.setIsConnectedToTrue();
    this.addConnectedCssClass();
    var nodeLinkRootDomElement = nodeLink.getRootDomElement();
    $(nodeLinkRootDomElement).find(`.blpn-node-link`).removeClass('empty');
    $(nodeLinkRootDomElement).find(`.blpn-node-link`).addClass('filled');

    this.attachedLinkList.push(nodeLink);

    var iPoint = nodeLink.getAttachPoint();
    var oPoint = this.getOutputPoint();

    var pathStr = this.createPath(iPoint, oPoint);
    
    nodeLink.path.setAttributeNS(null, 'd',pathStr);

};

Node.prototype.moveTo = function(point) {
    var rootDomElement = this.getRootDomElement();
    rootDomElement.style.top = point.y + 'px';
    rootDomElement.style.left = point.x + 'px';
    this.setPointX(point.x);
    this.setPointY(point.y);
    this.updatePosition();
};

Node.prototype.checkIsConnectedAndRender = function() {
    if( this.getAttachedLinkList().length !== 0 ) {
        this.setIsConnectedToTrue();
        this.addConnectedCssClass();
    } else {  
        this.setIsConnectedToFalse();
        this.removeConnectedCssClass();
    }
}
Node.prototype.addConnectedCssClass = function() {
    var rootDomElement = this.getRootDomElement();
    rootDomElement.classList.add('connected');
}
Node.prototype.removeConnectedCssClass = function() {
    var rootDomElement = this.getRootDomElement();
    rootDomElement.classList.remove('connected');
}       


Node.prototype.deleteNode = function() {
    var rootDomElement = this.getRootDomElement();
    $(rootDomElement).remove();
    $(rootDomElement).empty();
    var attachedLinkList = this.getAttachedLinkList();
    var attachingLinkList = this.getAttachingLinkList();

    
    attachedLinkList.forEach( ( nodeLink, index ) => {
        var node = nodeLink.getNodeThis();
        node.detachAttachingLink(nodeLink);
    });

    attachingLinkList.forEach( ( nodeLink, index ) => {
        var node = nodeLink.getNextNode();
        node.detachAttachedLink(nodeLink);
    });

    var nodeUuid = this.getUUID(); 
    var nodeContainerThis = this.getNodeContainerThis();
    nodeContainerThis.deleteNode(nodeUuid);
}

// ** node state 관련 메소드들 */
Node.prototype.setState = function(newState) {
    this.state = changeOldToNewState(this.state, newState);
    this.consoleState();
}

/**
    모든 state 값을 가져오는 함수
*/
Node.prototype.getStateAll = function() {
    return this.state;
}

/**
    특정 state Name 값을 가져오는 함수
    @param {string} stateKeyName
*/
Node.prototype.getState = function(stateKeyName) {
    return findStateValue(this.state, stateKeyName);
}

Node.prototype.consoleState = function() {
    // console.log(this.state);
}
Node.prototype.updateOneArrayIndexValue = function(stateParamName, index, updatedIndexValue) {
    var updatedParamOneArray = updateOneArrayIndexValueAndGetNewArray(this.getState(stateParamName), 
                                                                        index, 
                                                                        updatedIndexValue);
    this.setState({
        [`${stateParamName}`]: updatedParamOneArray
    });
}

Node.prototype.deleteOneArrayIndexValue = function(stateParamName, index) {
    var deletedParamOneArray = deleteOneArrayIndexValueAndGetNewArray(this.getState(stateParamName), 
                                                                        index);
    
    this.setState({
        [`${stateParamName}`]: deletedParamOneArray
    });
}


/** type에 따른 state 생성 */
Node.prototype.addClassState = function(methodNameType) {
    var name = '';
    if (methodNameType === 'init') {
        name = '_init_';
    }
    
    var nodeThis = this;
    var newData = {
        name
        , inParamList: []
    }
    nodeThis.setState({
        methodList: [...nodeThis.getState('methodList'), newData]
    });
}

Node.prototype.addIfState = function(methodNameType) {
    var nodeThis = this;
    var newData = {
        name: methodNameType
        , codeTokenList: []
    }
    nodeThis.setState({
        ifCodeLineList: [...nodeThis.getState('ifCodeLineList'), newData]
    });
}

Node.prototype.addCodeBlockState = function(methodNameType) {
    var nodeThis = this;
    var newData = {
        codeTokenList: []
    }
    nodeThis.setState({
        codeBlockLineList: [...nodeThis.getState('codeBlockLineList'), newData ]
    });
}

// ** node 이벤트 메소드 들*/

Node.prototype.bindDragEvent = function() {
    var that = this;
    var rootDomElement = this.getRootDomElement();

    /** 드래그 범뮈 지정 */
    // $(rootDomElement).draggable({
    //     cancel: '.blpn-node-input'
    //     ,containment: '.blpn-nodeEditor-left',
    // });

    var pos1 = 0;
    var pos2 = 0; 
    var pos3 = 0; 
    var pos4 = 0;

    var dragMouseDown = function (event) {
        event = event || window.event;
        // event.preventDefault();
        // 시작지점 마우스좌표 얻기
        pos3 = event.clientX;
        pos4 = event.clientY;
        document.onmouseup = closeDragElement;
        // 이동지점 마우스좌표 얻기
        document.onmousemove = elementDrag;

        event.stopPropagation();
    }

    var elementDrag = function(event) {
        event = event || window.event;
        // event.preventDefault();
        // 이동지점 커서좌표 계산
        pos1 = pos3 - event.clientX;
        pos2 = pos4 - event.clientY;
        pos3 = event.clientX;
        pos4 = event.clientY;

        // 요소의 새 위치 설정
        var y = rootDomElement.offsetTop - pos2;
        var x = rootDomElement.offsetLeft - pos1;
        that.setPointX(x);
        that.setPointY(y);
        rootDomElement.style.top = `${y}` + 'px';
        rootDomElement.style.left = `${x}` + 'px';

        that.updatePosition();
    
        event.stopPropagation();
    }

    var closeDragElement = function() {
        /* 마우스버튼 풀렸을 때, 이동 멈춤 */
        document.onmouseup = null;
        document.onmousemove = null;
   
    }
 
    // 이동 목적지
    rootDomElement.onmousedown = dragMouseDown;
}

Node.prototype.bindMouseWheelEvent = function() {
    var that = this;            
    var rootDomElement = this.getRootDomElement();
    $(rootDomElement).bind('mousewheel', function (event) {

        var scrollNum = that.getScrollNum();
        if ( scrollNum < 0.5) {
            that.setScrollNum(0.5);
            return;
        }

        if (event.originalEvent.wheelDelta / 120 > 0) {
            scrollNum += 0.05;
            that.setScrollNum(scrollNum);
            $(this).css('transform', 'scale(' + scrollNum + ')');
        } else {
            scrollNum -= 0.05;
            that.setScrollNum(scrollNum);
            $(this).css('transform', 'scale(' + scrollNum + ')');
        }
        that.updatePosition();
    });
}

Node.prototype.bindClickNodeEvent = function() {
    var rootDomElement = this.getRootDomElement();
    $(rootDomElement).click(function() {

    });
}

Node.prototype.bindDeleteNodeEvent = function() {
    var that = this;
    var nodeContainerThis = this.getNodeContainerThis();
    var uuid = this.getUUID();
    var rootDomElement = this.getRootDomElement();

    this.deleteBtnDomElement.click(function() {
        that.deleteNode();
        // nodeContainerThis.deleteNode(uuid);
        // $(rootDomElement).remove();
        // $(rootDomElement).empty();
    });
}

/** NODE SUBTYPE : IF */
Node.prototype.bindClickElifBtnEvent = function() {
    var that = this;
    var elifButton = this.getState('elifButton');
    elifButton.click( function() {
        that.addNodeElement(NODE_ELEMENT_ENUM.ELIF);    
        that.addIfState('ELIF');  
        that.renderNodeElementList();
    });
}

/** NODE SUBTYPE : IF */
Node.prototype.bindClickElseBtnEvent = function() {
    var that = this;
    var elseButton = this.getState('elseButton');
    elseButton.click( function() {           
        var nodeElementList = that.getNodeElementList();

        var is = nodeElementList.some(( nodeElement, index ) => {
            var nodeElementSubType = nodeElement.getSubType();
            if (nodeElementSubType === NODE_ELEMENT_ENUM.ELSE) {
                return true;
            } else {
                return false;
            }
        });

        if (is === true) {
            return;
        } else {
            that.addNodeElement(NODE_ELEMENT_ENUM.ELSE);
            that.addIfState('ELSE');  
            that.renderNodeElementList();
        }
    });
}

Node.prototype.bindClickLineBtnEvent = function() {
     var that = this;
    var lineButton = this.getState('lineButton');
    lineButton.click( function() {    
        that.addNodeElement(NODE_ELEMENT_ENUM.CODE);   
        that.addCodeBlockState();  
        that.renderNodeElementList();
    });     
}

var NodeContainer = function() {
    this.nodeList = [];
}

NodeContainer.prototype.pushNode = function(node) {
    node.setNodeContainerThis(this);
    this.nodeList.push(node);
}

NodeContainer.prototype.popNode = function() {
    this.nodeList.pop();
}

NodeContainer.prototype.getNodeList = function() {
    return this.nodeList; 
}

NodeContainer.prototype.makeUUID = function() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
NodeContainer.prototype.deleteNode = function(nodeUUID) {
    var selectedIndex = -1;
    var is = this.nodeList.some((node, index) => {
        if (node.getUUID() === nodeUUID) {
            selectedIndex = index;
            return true;
        } else {
            return false;
        }
    });

    if (is) {
        this.nodeList.splice(selectedIndex,1);
        // this.traverseNodeList();
    } 
}

NodeContainer.prototype.getCodeLineDomPoint = function() {
    var nodeList = this.getNodeList();
    var nodeCodeLineDomPointList = [];

    nodeList.forEach(node => {
        var nodeElementList = node.getNodeElementList();
        nodeElementList.forEach(nodeElement => {
            var nodeCodeLineDomElement = nodeElement.getNodeCodeLineDomElement();
            if( nodeCodeLineDomElement ) {
                var nodeCodeLinePoint = nodeElement.getCodeLineDomPoint();
                nodeCodeLineDomPointList.push(nodeCodeLinePoint);
            }
        });
    });

    return nodeCodeLineDomPointList;
}

NodeContainer.prototype.getNodeCodeLineDomElementList = function() {
    var nodeList = this.getNodeList();
    var nodeCodeLineDomElementList = [];

    nodeList.forEach(node => {
        var nodeElementList = node.getNodeElementList();
        nodeElementList.forEach(nodeElement => {
            var nodeCodeLineDomElement = nodeElement.getNodeCodeLineDomElement();
            if( nodeCodeLineDomElement ) {
                nodeCodeLineDomElementList.push(nodeCodeLineDomElement);
            }
        });
    });

    return nodeCodeLineDomElementList;
}

NodeContainer.prototype.traverseNodeList = function() {
    var stack = [];

    this.nodeList.forEach((node, index) => {
        if ( node.getIsConnected() === false && node.getAttachingLinkList().length !== 0) {
            stack.push(node);
        }
    });

    var current;
    var currType = "";
    var iterationCount = 0;
    while (stack.length !== 0) {
        if ( iterationCount > 100 ) {
            console.log('NODE 무한 루프!!!');
            break;
        }
        current = stack.pop();

        if ( Array.isArray(current) ) {
            var j = current.length;
            while (j--) {
                var node = current[j].getNextNode();
                if (node !== null) {
                    stack.push(node);
                }
            }
        } else {
            console.log("NODE",current);
            var attachingLinkList = current.getAttachingLinkList();
            if (attachingLinkList.length === 0) {
                continue;
            }
            stack.push(attachingLinkList);
        }
        iterationCount++;
    }
}

var CreateBlockNodeBtn = function(nodeContainerThis, subType) {
    this.nodeContainerThis = nodeContainerThis;

    this.mapSubTypeToName(subType);


    this.type = 'CREATE_NODE_BTN';
    this.subType = subType;
    this.isStartDrag = false;
    this.rootDomElement;

    this.render();
    this.bindDragEvent();
}

CreateBlockNodeBtn.prototype.mapSubTypeToName = function(subType) {
    switch (subType) {
        case 1: {
            this.name = 'Class';
            break;
        }
        case 2: {
            this.name = 'Def';
            break;
        }
        case 3: {
            this.name = 'If';
            break;
        }
        case 4: {
            this.name = 'For';
            break;
        }
        case 5: {
            this.name = 'While';
            break;
        }
        case 6: {
            this.name = 'Import';
            break;
        }
        case 7: {
            this.name = 'Api';
            break;
        }
        case 8: {
            this.name = 'Try';
            break;
        }
        case 9: {
            this.name = 'Code';
            break;
        }
    
        default: {
            break;
        }
    }
}

CreateBlockNodeBtn.prototype.getSubType = function() {
    return this.subType;
}

CreateBlockNodeBtn.prototype.getNodeContainerThis = function() {
    return this.nodeContainerThis;
}
CreateBlockNodeBtn.prototype.setNodeContainerThis = function(nodeContainerThis) {
    this.nodeContainerThis = nodeContainerThis;
}
CreateBlockNodeBtn.prototype.getRootDomElement = function() {
    return this.rootDomElement;
}

CreateBlockNodeBtn.prototype.setRootDomElement = function(rootDomElement) {
    this.rootDomElement = rootDomElement;
}

CreateBlockNodeBtn.prototype.getName = function() {
    return this.name;
}

CreateBlockNodeBtn.prototype.setName = function(name) {
    this.name = name;
}

CreateBlockNodeBtn.prototype.render = function() {
    var blockContainer = $(`.blpn-nodeEditor-tab-navigation-node-block-body`);

    var rootDomElement = $(`<div class='blpn-nodeEditor-tab-navigation-node-block-body-btn'>
                                <span>${this.getName()}</span>
                            </div>`);
    this.setRootDomElement(rootDomElement);

    blockContainer.append(this.rootDomElement);
}

CreateBlockNodeBtn.prototype.bindDragEvent = function() {
    var nodeContainerThis = this.getNodeContainerThis();
    var subType = this.getSubType();

    this.getRootDomElement().draggable({ 
        revert: 'invalid',
        revertDuration: 200,
        appendTo: '.blpn-nodeEditor-left',
        // containment: 'window',
        cursor: 'move', 
        helper: 'clone',
        // scroll: false,
        cursorAt: { top: 17, left: 80 },
        start: (event, ui) => {
  
        },
        drag: (event, ui) => {

            $('.blpn-nodeEditor-left').droppable({
                activeClass: 'ui-hover',
                hoverClass: 'ui-active',
                drop: ( _, __ ) => {
                    if( this.type === 'CREATE_NODE_BTN') {
       
                        var buttonX = event.clientX;
                        var buttonY = event.clientY;
                        var node = new Node(nodeContainerThis, subType, {x: buttonX, y: buttonY} );
                        nodeContainerThis.pushNode(node);
                    }
                    $('.blpn-nodeEditor-left').off();
                }
            });

    

        },
        stop: () => {
            $('.blpn-nodeEditor-left').off();
        }
    });
}

var CreateOperatorNodeBtn = function(nodeContainerThis, subType) {
    this.nodeContainerThis = nodeContainerThis;

    this.mapSubTypeToName(subType);

    this.type = 'CREATE_NODE_OPERATOR_BTN';
    this.subType = subType;
    this.isStartDrag = false;
    this.rootDomElement;

    this.render();
    this.bindDragEvent();
}
CreateOperatorNodeBtn.prototype.getSubType = function() {
    return this.subType;
}

CreateOperatorNodeBtn.prototype.getNodeContainerThis = function() {
    return this.nodeContainerThis;
}
CreateOperatorNodeBtn.prototype.setNodeContainerThis = function(nodeContainerThis) {
    this.nodeContainerThis = nodeContainerThis;
}
CreateOperatorNodeBtn.prototype.getRootDomElement = function() {
    return this.rootDomElement;
}

CreateOperatorNodeBtn.prototype.setRootDomElement = function(rootDomElement) {
    this.rootDomElement = rootDomElement;
}

CreateOperatorNodeBtn.prototype.getName = function() {
    return this.name;
}

CreateOperatorNodeBtn.prototype.setName = function(name) {
    this.name = name;
}
CreateOperatorNodeBtn.prototype.mapSubTypeToName = function(subType) {
    switch (subType) {
        case 1: {
            this.name = '+';
            break;
        }
        case 2: {
            this.name = '-';
            break;
        }
        case 3: {
            this.name = 'x';
            break;
        }
        case 4: {
            this.name = '÷';
            break;
        }
        case 5: {
            this.name = '=';
            break;
        }
        case 6: {
            this.name = '≠≠';
            break;
        }
        case 7: {
            this.name = '==';
            break;
        }
        case 8: {
            this.name = '<';
            break;
        }
        case 9: {
            this.name = '≤';
            break;
        }
        case 10: {
            this.name = '＞';
            break;
        }
        case 11: {
            this.name = '≥';
            break;
        }
        case 12: {
            this.name = '+=';
            break;
        }
        case 13: {
            this.name = '-=';
            break;
        }
        case 14: {
            this.name = 'in';
            break;
        }
        default: {
            this.name = '';
            break;
        }
    }
}
CreateOperatorNodeBtn.prototype.render = function() {
    var blockContainer = $(`.blpn-nodeEditor-tab-navigation-node-operator-body`);

    var rootDomElement = $(`<div class='blpn-nodeEditor-tab-navigation-node-operator-body-btn'>
                                <span>${this.getName()}</span>
                            </div>`);
    this.setRootDomElement(rootDomElement);

    blockContainer.append(this.rootDomElement);
}

CreateOperatorNodeBtn.prototype.bindDragEvent = function() {
    var nodeContainerThis = this.getNodeContainerThis();
    var subType = this.getSubType();

    this.getRootDomElement().draggable({ 
        revert: 'invalid',
        revertDuration: 200,
        appendTo: '.blpn-nodeEditor-left',
        // containment: 'window',
        cursor: 'move', 
        helper: 'clone',
        // scroll: false,
        cursorAt: { top: 17, left: 80 },
        start: (event, ui) => {
  
        },
        drag: (event, ui) => {

            var nodeCodeLineDomElementList = nodeContainerThis.getCodeLineDomPoint();
            nodeCodeLineDomElementList.forEach(nodeCodeLineDomElement => {
  
                var nodeCodeLineDomPointX = nodeCodeLineDomElement.x;
                var nodeCodeLineDomPointY = nodeCodeLineDomElement.y;
                var nodeCodeLineDomPointWidth = nodeCodeLineDomElement.width;
                var nodeCodeLineDomPointHeight = nodeCodeLineDomElement.height;
                var nodeCodeLineDom = nodeCodeLineDomElement.dom;
                var nodeElementThis = nodeCodeLineDomElement.nodeElementThis;

                /** 물체 충돌 로직 */
                if(nodeCodeLineDomPointX < event.clientX 
                    && event.clientX < (nodeCodeLineDomPointX + nodeCodeLineDomPointWidth)
                    && nodeCodeLineDomPointY < event.clientY 
                    && event.clientY < (nodeCodeLineDomPointY + nodeCodeLineDomPointHeight)  ) {
                    $(nodeCodeLineDom).addClass('blpn-nodeCodeLine-selected');
                    // $(nodeCodeLineDom).find('.blpn-node-codeline-span').addClass('blpn-node-codeline-selected-span');
                } else {
                    $(nodeCodeLineDom).removeClass('blpn-nodeCodeLine-selected');
                    // $(nodeCodeLineDom).find('.blpn-node-codeline-span').removeClass('blpn-node-codeline-selected-span');
                }

                $('.blpn-nodeEditor-left').droppable({
                    activeClass: 'ui-hover',
                    hoverClass: 'ui-active',
                    drop: ( _, __ ) => {
            
                    }
                });

                $(nodeCodeLineDom).droppable({
                    drop: ( event, ui ) => { 
                        $(nodeCodeLineDom).removeClass("blpn-nodeCodeLine-selected");
                        // $(nodeCodeLineDom).find('.blpn-node-codeline-span').removeClass('blpn-node-codeline-selected-span');
                      
                        nodeElementThis.makeNodeCodeLineDomElement(subType);
                        // nodeCodeLine.setSubType( this.getSubType() );
                        // /** 헤드 코드 라인 */
                        // if ( nodeCodeLine.getType() === "HEAD_NODE_CODELINE" ) {
                        //     nodeCodeLine.render();
                        //     return;
                        // }
                        // /** 일반 코드 라인 */
                        // var nodeLink = nodeCodeLine.getNodeLink();
                        // nodeLink.renderNodeCodeLineList();
                    }
                });
            });
        },
        stop: () => {
    
        }
    });
}

var nodeContainer = new NodeContainer();
var createBlockNodeBtnArray = Object.values(NODE_BLOCK_BTN_ENUM);
createBlockNodeBtnArray.forEach(enumData => {
    new CreateBlockNodeBtn(nodeContainer, enumData);
});

var operatorNodeBtnList = Object.values(NODE_OPERATOR_ENUM);
operatorNodeBtnList.forEach(enumData => {
    new CreateOperatorNodeBtn(nodeContainer, enumData);
});

var node1 = new Node(nodeContainer, NODE_BLOCK_ENUM.IF, {x:100,y:300});
nodeContainer.pushNode(node1);
