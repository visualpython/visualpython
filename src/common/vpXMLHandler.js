define([
    'require'
    , 'jquery'
    , 'nbextensions/visualpython/src/common/constant'
    , 'nbextensions/visualpython/src/common/StringBuilder'
], function (requirejs, $, vpConst, sb) {
    "use strict";

    /**
     * @class VpXMLHandler
     * @constructor
     * @param {String} path xml path
     */
    var VpXMLHandler = function(path) {
        this.xmlPath = path;
        this.loadedXML = undefined;
        this.xmlSerialize = new XMLSerializer();
    };

    /**
     * load xml
     * @param {function} callback execute function at load finished
     * @param {object} callbackParam parameter of execute function at load finished
     */
    VpXMLHandler.prototype.loadFile = function(callback, callbackParam) {
        var that = this;
        this.xmlRequest = new XMLHttpRequest();
        this.xmlRequest.open("GET", this.xmlPath);
        this.xmlRequest.setRequestHeader("Content-Type", "test/xml");
        this.xmlRequest.onreadystatechange = function() {
            // readyState : 4 > 데이터 전부 받은 상태, status : 200 요청 성공
            if(that.xmlRequest.readyState === 4 && that.xmlRequest.status === 200){
                that.loadedXML = that.xmlRequest.responseXML;
                that.xmlString = that.xmlSerialize.serializeToString(that.xmlRequest.responseXML);
                callback(callbackParam);
            }
        }
        this.xmlRequest.send();
    }

    /**
     * return serializeString
     * @returns serializeString
     */
    VpXMLHandler.prototype.toString = function() {
        return this.xmlString
    }

    /**
     * return loaded xml data
     * @returns xml data
     */
    VpXMLHandler.prototype.getXML = function() {
        return this.loadedXML;
    }

    /**
     * xml data parse to json
     * @returns json data
     */
    VpXMLHandler.prototype.getJson = function() {
        return xmlToJson(this.loadedXML);
    }

    /**
     * xml data parse to array
     * @returns array data
     */
    VpXMLHandler.prototype.getArray = function() {
        return xmlToArray(this.xmlString);
    }
    
    /**
     * json data parse to xml
     * @param {json or Array} json json string or Array to parse xml
     */
    VpXMLHandler.prototype.parseToXml = function(json) {
        return jsonToXml(json);
    }

    /**
     * parse to xml from json or Array
     * @param {json or Array} obj json or Array data for parse
     * @param {number} depth xml depth
     */
    function OBJtoXML(obj, depth = 0) {
        var xml = '', idx;

        for (var prop in obj) {
            switch (typeof obj[prop]) {
                case 'object':
                    if(obj[prop] instanceof Array) {
                        for (var instance in obj[prop]) {
                            xml += `\n\t<${prop}>\n${OBJtoXML(new Object(obj[prop][instance]))}\t</${prop}>`;
                        }
                    } else {
                        for (idx = 0; idx < depth; idx++) {
                            xml += `\t`;
                        }
                        xml += `<${prop}>\n${OBJtoXML(new Object(obj[prop]), depth + 1)}`;

                        for (idx = 0; idx < depth; idx++) {
                            xml += `\t`;
                        }
                        xml += `</${prop}>\n`;
                    }
                    break;
                
                case 'number':
                case 'string':
                    for (idx = 0; idx < depth; idx++) {
                        xml += `\t`;
                    }
                    xml += `<${prop}>${obj[prop]}</${prop}>\n`;
                    break;
            }
            
        }
        return xml;
    }

    /**
     * parse to json from xml
     * @param {xml} xml xml data for parse
     * @returns json data
     */
    var xmlToJson = function(xml) {
        try {
            var obj = {};

            if (xml.children.length > 0) {
                for (var i = 0; i < xml.children.length; i++) {
                    var item = xml.children.item(i);
                    var nodeName = item.nodeName;
    
                    if (typeof (obj[nodeName]) == "undefined") {
                        obj[nodeName] = xmlToJson(item);
                        
                        for (var j = 0; j < item.attributes.length; j++) {
                            if (typeof (obj[nodeName]) == "string") {
                                var old = obj[nodeName];
                                var tmp = {};
                                tmp["@text"] = old;
                                obj[nodeName] = tmp;
                            }
                            obj[nodeName]["_" + item.attributes[j].nodeName] = item.attributes[j].nodeValue;
                        }
                    } else {
                        if (typeof (obj[nodeName].length) == "undefined") {
                            var old = obj[nodeName];
                    
                            obj[nodeName] = new Array();
                            obj[nodeName][obj[nodeName].length] = old;

                        }
                        obj[nodeName][obj[nodeName].length] = xmlToJson(item);
                        for (var j = 0; j < item.attributes.length; j++) {
                            obj[nodeName][obj[nodeName].length - 1]["_" + item.attributes[j].nodeName] = item.attributes[j].nodeValue;
                        }
                    }
                }
            } else {
                obj = xml.textContent;
            }
            return obj;
        } catch (err) {
            console.log("[vp] Error occurred during parse xml to json.");
            console.warn(err.message);
        }
    };

































































    
    // <div>visualpython</div>에 text인 "visualpython" 정보 를 만드는 함수
    var makeTextNode = (text, target, prev, identityNumber) => {    
        if (text.trim().length !== 0) {
            target.push({type:'TEXT', 
                        text, 
                        prev, 
                        identityNumber});
        }
        return '';
    };

    // <div id="value"></div>에서 value인 id="value" 정보를 만드는 함수
    var makeAttributeNode = (value, target, prev, identityNumber) => {
        target.push({type:'ATTRIBUTE', 
                    key: value[0], 
                    value: value[1], 
                    prev, 
                    identityNumber});
    }

    

    // <main></main>에서 태그 이름인 main에 대한 정보를 만드는 함수
    var makeElementNode = (input, cursor, text, stack, stacks) => {
        var char = input[cursor++];
        var isBreak = false;
        if(char === '<'){

            text = makeTextNode(text, stack.tag.children, stack.tag, cursor);
            if(input[cursor++] !== '/'){
                var name = input.substring(cursor - 1, cursor = input.indexOf('>', cursor));

                var isClose = input[cursor - 1] === '/';
                if(isClose) {
                    name = name.substr(0, name.length - 1);
                }

                var tag = {
                    name, 
                    type:'NODE', 
                    children: [],
                    identityNumber: cursor
                };

                if(name.includes(`="`) === true){
                    var valueLength = name.split(" ").length;
                    tag.name = name.split(" ")[0];
                    while(valueLength-- > 1){
                        var splitedValue = name.split(" ")[valueLength].replace(/"/gi,``).split("=");
                        makeAttributeNode(splitedValue, tag.children, tag, cursor);
                    }
                }
                cursor++;
                tag.prev = stack.tag;
                stack.tag.children.push(tag);
                if(!isClose){
                    stacks.push({tag, back:stack});
                    isBreak = true;
                }
            } else if(stack.tag.name == input.substring(cursor, input.indexOf('>', cursor))){
                for(var i = 0; i <= stack.tag.name.length; i++){
                    cursor += 1;
                }
                text = '';
                stack = stack.back;
            }
        } 
        else {
            text += char
        };
        return {cursor, text, isBreak, stack};
    };

    // json을 받아서 자바스크립트 xml로 바꾸는 함수
    var xmlToJson2 = input => {
        var result = { tag: {
                                type:'ROOT', 
                                children:[]
                            } 
                    };
        var stacks = [];
        var cursor = 0;
        var stack = result;
        var isBreak = false;
        do {
            var text = '';
            while(cursor < input.length){
                var element = makeElementNode(input, cursor, text, stack, stacks);
                ({cursor, text, isBreak, stack} = element);
                if(isBreak) {
                    break;
                }
            }
        } while(stack = stacks.pop());

        return result.tag.children[0];
    };

    // XML string을 받아서 자바스크립트 Array로 바꾸는 함수
    // 위의 구현한 xmlToJson을 이용
    var xmlToArray = function(xmlstring){
        var json = xmlToJson2(xmlstring);
        var dataArray = [];
        var stacks = [];
        stacks.push(json);
        
        // identityNumber 값으로 특정 위치의 JSON값을 불러오는 함수
        var findNode = (identityNumber) => {
            var findedNode = dataArray.find(element => {
                if(element.identityNumber === identityNumber){
                    return element;
                }
            });
            return findedNode;
        }

        var context;
        while(context = stacks.shift()){
            if(Array.isArray(context.children)){
                context.children.forEach((childrenElement,index) => {
                    console.log('childrenElement',childrenElement);
                    if(childrenElement.type === "NODE"){
                        var isHaveTEXTorVALUE = childrenElement.children.some(element => {
                            if(element.type === "TEXT" || element.type === "ATTRIBUTE"){
                                return true;
                            } else {
                                return false;
                            }
                        });
                        // 자식(children) 중에 TEXT type이나 ATTRIBUTE type 데이터가 있을 경우
                        if(isHaveTEXTorVALUE === true){
                            stacks.push(childrenElement);
                        // 자식(children) 중에 TEXT type이나 ATTRIBUTE type 데이터가 없을 경우
                        } else {
                            dataArray.push({
                                name: childrenElement.name,
                                identityNumber: childrenElement.identityNumber,
                                prevname: childrenElement.prev.name
                            });
                            stacks.push(childrenElement);
                        }
                    } else if(childrenElement.type === "TEXT"){
                        dataArray.push({
                            name: childrenElement.prev.name,
                            text: childrenElement.text,
                            identityNumber: childrenElement.identityNumber,
                            prevname: childrenElement.prev.prev.name
                        });
                    } else {
                        var findedNode = findNode(childrenElement.identityNumber);

                        if(findedNode && findedNode.attributes){
                            findedNode.attributes.push({
                                key: childrenElement.key,
                                value: childrenElement.value
                            });
                        } else {
                            dataArray.push({
                                name: childrenElement.prev.name,
                                attributes: [
                                    {
                                        key: childrenElement.key,
                                        value: childrenElement.value
                                    }
                                ],
                                identityNumber: childrenElement.identityNumber,
                                prevname: childrenElement.prev.prev.name
                            });
                            stacks.push(childrenElement);
                        }
                    }
                });
            }
        }
        return dataArray.map(element=> {
            delete element.identityNumber;
            return element;
        });
    }

    // json을 받아서 자바스크립트 xml로 바꾸는 함수
    var jsonToXml = json => {

        var stack = [];
        var domarr = [];

        var context;
        var rootDom;
        var currentDom;
        stack.push(json);

        var makeDom = (tagSelector) => {
            return document.createElement(tagSelector);
        }
        var pushDom = function(dom, context) {
            domarr.push({
                dom,
                name: context.name,
                identityNumber: context.identityNumber
            });
        };
        
        var findDom = function(context) {
            var returndom;
            domarr.some(element => {
                if(element.name === context.prev.name 
                    && element.identityNumber === context.prev.identityNumber){
                    returndom = element.dom;
                    return true;
                } else {
                    return false;
                }
            });

            return returndom;
        };

        var pushAndFindDom = function(context) {
            var tempDom = makeDom(`${context.name}`);
            pushDom(tempDom, context);
            var retdom;
            if(findDom(context)){
                retdom = findDom(context).appendChild(tempDom);
            } else {
                retdom = currentDom.appendChild(tempDom);
            }
            return retdom;
        }
        
        var deleteGarbageDom = function(domArr){
            domArr = null;
        }

        while(context = stack.shift()){
            if(context.children){
                if(context.children.length !== 0){
                    var isTypeNode = context.children.every(element => {
                        if(element.type === "TEXT" || element.type === "ATTRIBUTE"){
                            return true;
                        } else {
                            return false;
                        }
                    });
                    stack.push(context.children);

                    if(isTypeNode === true){
                        currentDom = pushAndFindDom(context);
                        continue;
                    }
                } else if(context.children.length === 0){
                    currentDom = findDom(context);
                    continue;
                } 
            } else if(Array.isArray(context)) {
                context.forEach(element => {
                    stack.push(element);
                });
            } else {
                if(context.type === "TEXT"){
                    findDom(context).innerHTML = context.text;
                } else { // context.type === "ATTRIBUTE"
                    findDom(context).setAttribute(context.key, context.value || " ");
                }
                continue;
            }

            if(currentDom){
                if(context.name !== undefined){
                    currentDom = pushAndFindDom(context);
                }
            } else {
                rootDom = currentDom = makeDom(`${context.name}`);
                pushDom(currentDom, context);
            }
        }
        deleteGarbageDom(domarr);
        return rootDom;
    }

    return { VpXMLHandler: VpXMLHandler };
});