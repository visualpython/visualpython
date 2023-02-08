//======================================================================
// Inner functions
//======================================================================
/**
 * Send event to inject script
 * @param {*} type event type defined on inject script
 * @param {*} data data to send
 */
function sendEvent(type, data='') {
    let detailObj = { type: type, data: data };
    let evt = new CustomEvent('vpcomm', { bubbles: true, detail: detailObj });
    console.log('[vp content] send from content - ', type, data, evt);
    document.dispatchEvent(evt);

}
function checkScriptExists(url) {
    return document.querySelectorAll(`script[src="${url}"]`).length > 0;
}
/**
 * Inject file
 */
function injectFile() {
    let url = chrome.runtime.getURL('inject.js');
    console.log('[vp content] check inject file...')
    if (checkScriptExists(url)) {
        console.log('[vp content] inject file already exist!');
        return false; 
    }
    console.log('[vp content] inject file!');
    // inject script
    var s = document.createElement('script');
    s.src = url;
    s.onload = function() {
        // send event to inject.js to send its url
        var url = chrome.runtime.getURL('');
        // var evt = new CustomEvent('vpcomm', { bubbles: true, detail: { type: 'sendBase', data: url } });
        // document.dispatchEvent(evt);
        sendEvent('sendBase', url);
    };
    (document.head || document.documentElement).appendChild(s);
    return true;
}

//======================================================================
// Event listener - background <-> inject
//======================================================================
function msgHandler(msg, sender) {
    if (msg == "toggle"){
        // var evt = new CustomEvent('vpcomm', { bubbles: true, detail: { type: 'toggle' } });
        // document.dispatchEvent(evt);
        // check if injected
        injectFile();
        sendEvent('toggle');
    }
}
chrome.runtime.onMessage.removeListener(msgHandler);
chrome.runtime.onMessage.addListener(msgHandler);

console.log('[vp content] content script executed!');

// End of file