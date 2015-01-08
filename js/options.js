var smileyfyOptions = {
	init : function() {
		smileyfyOptions.restoreOptions();
		
		document.getElementById('smileyfy-options-profile').addEventListener('change', smileyfyOptions.saveOption);
		document.getElementById('smileyfy-options-large').addEventListener('change', smileyfyOptions.saveOption);
	},
	
	restoreOptions : function() {
		chrome.storage.sync.get({
			changeImgType : [true, true]
		}, function(items) {
			document.getElementById('smileyfy-options-profile').checked = items.changeImgType[smileyfyCommon.SMILEYFY_SMILEY];
			document.getElementById('smileyfy-options-large').checked = items.changeImgType[smileyfyCommon.SMILEYFY_RICK];
		});
	},
	
	saveOption : function() {
		var changeImgType = new Array(2);
		changeImgType[smileyfyCommon.SMILEYFY_SMILEY] = document.getElementById('smileyfy-options-profile').checked;
		changeImgType[smileyfyCommon.SMILEYFY_RICK] = document.getElementById('smileyfy-options-large').checked;
		
		chrome.storage.sync.set({
			changeImgType : changeImgType
		});
	}
}

document.addEventListener('DOMContentLoaded', smileyfyOptions.init);