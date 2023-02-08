//======================================================================
// Event for extension icon - toggle
//======================================================================
chrome.action.onClicked.addListener((tab) => {
    // check origin if its url is matching our rule
    let checkOrigin = tab.url.startsWith('https://colab.research.google.com/');
    if (checkOrigin) {
        console.log('send toggle', checkOrigin, tab.id, tab);
        // send toggle action to content
        chrome.tabs.sendMessage(tab.id, "toggle").then(function(result) {
            // success
            console.log('ok', result);
        }).catch(function(result) {
            // error: if no content script, execute script again
            console.log('error', result);
            // execute script manually
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            }).then(function(result) {
                // toggle again
                chrome.tabs.sendMessage(tab.id, "toggle");
            });
        });
    } else {
        console.log("it's not colab site...");
    }
});

// End of file