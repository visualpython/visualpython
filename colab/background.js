//======================================================================
// Event for extension icon - toggle
//======================================================================
chrome.action.onClicked.addListener((tab) => {
    // check origin if its url is matching our rule
    let checkOrigin = tab.url.startsWith('https://colab.research.google.com/');
    if (checkOrigin) {
        console.log('send toggle', checkOrigin, tab.id, tab);
        // send toggle action to content
        chrome.tabs.sendMessage(tab.id, { type: 'toggle' }).then(function(result) {
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
                chrome.tabs.sendMessage(tab.id, { type: 'toggle' });
            });
        });
    } else {
        console.log("it's not colab site...");
    }
});

//======================================================================
// Event for check tab to disable or enable extension 
//======================================================================
// check status on tab activated and check colab exist
chrome.tabs.onActivated.addListener(function() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
        if (tabs && tabs.length > 0) {
            let tabUrl = tabs[0].url;
            let isColabExist = tabUrl.startsWith('https://colab.research.google.com/');
            if (isColabExist == true) {
                // reset
                // chrome.action.setBadgeText({ text: '' });
                chrome.action.setPopup({ popup: '' });
            } else {
                // set badge and popup
                // chrome.action.setBadgeBackgroundColor({ color: 'red' });
                // chrome.action.setBadgeText({ text: ':(' });
                chrome.action.setPopup({ popup: 'popup.html' });
            }
        }
        
    });
});
// check status on tab updated
chrome.tabs.onUpdated.addListener(function() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
        if (tabs && tabs.length > 0) {
            let tabUrl = tabs[0].url;
            let isColabExist = tabUrl.startsWith('https://colab.research.google.com/');
            if (isColabExist == true) {
                // reset
                // chrome.action.setBadgeText({ text: '' });
                chrome.action.setPopup({ popup: '' });
            } else {
                // set badge and popup
                // chrome.action.setBadgeBackgroundColor({ color: 'red' });
                // chrome.action.setBadgeText({ text: ':(' });
                chrome.action.setPopup({ popup: 'popup.html' });
            }
        }
        
    });
});

// End of file