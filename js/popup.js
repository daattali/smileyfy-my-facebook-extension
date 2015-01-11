var smileyfyPopup = {

    // init: when the user clicks on the extension icon, initialize the UI and add listeners on buttons
    init : function() {
        document.getElementById("smileyfy-ext-refresh").addEventListener("click", smileyfyPopup.refreshClick);        
        document.getElementById("smileyfy-options-profile").addEventListener("change", smileyfyPopup.optionClicked);
        document.getElementById("smileyfy-options-large").addEventListener("change", smileyfyPopup.optionClicked);

        smileyfyPopup.initUi();
    },
    
    // refreshClick: initialize the UI from clicking on Refresh
    refreshClick : function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action : "refresh"});
        });
    },
    
    // optionClicked: one of the options was changed, so save it and refresh the UI
    optionClicked : function() {
        var changeImgType = new Array(2);
        changeImgType[smileyfyCommon.SMILEYFY_SMILEY] = document.getElementById('smileyfy-options-profile').checked;
        changeImgType[smileyfyCommon.SMILEYFY_RICK] = document.getElementById('smileyfy-options-large').checked;
        
        chrome.storage.sync.set({
            changeImgType : changeImgType
        });
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action : "optionsChanged", changeImgType : changeImgType});
        });            
    },
    
    // initUi: initialize the UI
    initUi : function() {
        chrome.storage.sync.get({
            changeImgType : [true, true]
        }, function(items) {
            document.getElementById('smileyfy-options-profile').checked = items.changeImgType[smileyfyCommon.SMILEYFY_SMILEY];
            document.getElementById('smileyfy-options-large').checked = items.changeImgType[smileyfyCommon.SMILEYFY_RICK];
        });
    }
};

document.addEventListener('DOMContentLoaded', function () {
    smileyfyPopup.init();
});