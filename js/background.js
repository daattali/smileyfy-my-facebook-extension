var smileyfyBg = {

    // init: add listeners
    init : function() {
    
        // when to show the extension icon?
        chrome.runtime.onInstalled.addListener(function() {
            // Replace all rules ...
            chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
                // With a new rule ...
                chrome.declarativeContent.onPageChanged.addRules([
                    {
                        // That fires when a page's URL is in a  Facebook page
                        conditions: [ 
                            new chrome.declarativeContent.PageStateMatcher({
                                pageUrl: { urlContains: 'facebook.com' },
                            })
                        ],
                        // And shows the extension's page action.
                        actions: [ new chrome.declarativeContent.ShowPageAction() ]
                    }
                ]);
            });
        });    
    
        // when the URL changes, re-run the script
        chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
            if (changeInfo.status == 'complete' && tab.active) {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {action : "init"});
                });
            }
        });   
    },
        
    // deb: show a debug message
    deb : function(msg) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message: msg});
        });
        console.log(msg);
    }    
};

smileyfyBg.init();
