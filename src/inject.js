var smileyfyContent = {

	SMILEYFY_SMILEY : 1,
	SMILEYFY_RICK : 2,
	observer : null,

	// init: add message listeners and call the appropriate function based on the request
	init : function() {
		MutationObserver = window.WebKitMutationObserver
		observer = new MutationObserver(smileyfyContent.domchanged);
	
		smileyfyContent.initpage();
		
		chrome.runtime.onMessage.addListener(
		  function(request, sender, sendResponse) {	
			if (request.action == "init") {
				smileyfyContent.initIfLoaded(2000, 1);
			}
		  }
		);
	},
	
	initIfLoaded : function(time, n) {
		if (n < 0) {
			return;
		}
		
		setTimeout(function() { 
			if (document.getElementById("contentArea")) {
				smileyfyContent.initpage();
			} else {
				smileyfyContent.initIfLoaded(time, n-1);
			}},
			time);
	},
	
	initpage : function() {
		observer.observe(document.getElementById("contentArea"), {
		  subtree: true,
		  childList: true,
		  attributes: false
		});	

		var imgs = document.getElementsByTagName("img");
		smileyfyContent.changeimgs(imgs);
	},
	
	domchanged : function(mutations, observer) {
		for(var mut in mutations) {
			var mutation = mutations[mut];
			if (mutation.addedNodes.length > 0) {
				for (var i in mutation.addedNodes) {
					var node = mutation.addedNodes[i];
					if (node && node.nodeType == 1) {
						var imgs = node.getElementsByTagName("img");
						smileyfyContent.changeimgs(imgs);
					}
				}
			}
		}
	},
	
	changeimgs : function(imgs) {
     	var larges = [];
		for(var img in imgs){if(imgs[img].width && imgs[img].width >= 100 && imgs[img].getAttribute("data-smileyfy") != smileyfyContent.SMILEYFY_SMILEY) larges.push(imgs[img])}
		for (var i in larges) {
			smileyfyContent.smileyfy(larges[i], smileyfyContent.SMILEYFY_RICK);
		}
		
		var profiles = [];
		for(var img in imgs){if(imgs[img].src && imgs[img].src.indexOf("fbcdn-profile") != -1) profiles.push(imgs[img])}		
		for (var i in profiles) {
			smileyfyContent.smileyfy(profiles[i], smileyfyContent.SMILEYFY_SMILEY);
		}	
	},
	
	smileyfy : function(img, type) {
		var imgUrl = null;
		if (type == smileyfyContent.SMILEYFY_SMILEY) {
			imgUrl = "http://i.imgur.com/8R14wYO.png";
		} else if (type == smileyfyContent.SMILEYFY_RICK) {
			var rickUrls = ["http://i.imgur.com/nM35rg5.jpg", "http://i.imgur.com/5mlKU3V.jpg", "http://i.imgur.com/ColJHC5.jpg", "http://i.imgur.com/li6fDFh.jpg"];
			var rickRatios = [2/3, 1, 1.31, 1.87];
			
			var aspectRatio = img.width / img.height;
			for (var i = 0; i < rickRatios.length - 1; i++) {
				if (aspectRatio <= (rickRatios[i] + rickRatios[i+1]) / 2) {
					imgUrl = rickUrls[i];
					break;
				}
			}
			if (!imgUrl) {
				imgUrl = rickUrls[rickUrls.length - 1];
			}	
		} else {
			return;
		}
		img.src = imgUrl;
		img.setAttribute("data-smileyfy", type);
		img.style.left = 0;
		img.style.top = 0;
	}
}

smileyfyContent.init();
