var smileyfyBg = {

	// init: add listeners
	init : function() {
		chrome.runtime.onInstalled.addListener(function() {
		  // Replace all rules ...
		  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
			// With a new rule ...
			chrome.declarativeContent.onPageChanged.addRules([
			  {
				// That fires when a page's URL is in a github edit page
				conditions: [ 
				  new chrome.declarativeContent.PageStateMatcher({
					pageUrl: { urlMatches: 'facebook' },
				  })
				],
				// And shows the extension's page action.
				actions: [ new chrome.declarativeContent.ShowPageAction() ]
			  }
			]);
		  });
		});	
	
		chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
		  if (changeInfo.status == 'complete' && tab.active) {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			  chrome.tabs.sendMessage(tabs[0].id, {action : "init"});
			});
		  }
		});
	},
	
	deb : function(msg) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		  chrome.tabs.sendMessage(tabs[0].id, {message: msg});
		});
		console.log(msg);
	}	
};

smileyfyBg.init();
