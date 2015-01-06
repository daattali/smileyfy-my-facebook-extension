var smileyfyContent = {

	// the type of smileyfy on a particular image
	SMILEYFY_SMILEY : 1,
	SMILEYFY_RICK : 2,
	
	// what images to use
	STATIC_URL : "https://raw.githubusercontent.com/daattali/smileyfy-my-facebook-extension/master/img/",
	SMILEY_IMG : "smiley.png",
	RICK_IMGS : ["rick_vert.jpg", "rick_square.jpg", "rick_horiz_small.jpg", "rick_horiz.jpg"],
	RICK_RATIOS : [2/3, 1, 1.31, 1.87],
	
	// mutation observer
	observer : null,
	

	// init: add message listeners and call the appropriate function based on the request
	init : function() {
		// initialize a mutation observer (listens for changes to the DOM)
		MutationObserver = window.WebKitMutationObserver
		observer = new MutationObserver(smileyfyContent.domChanged);
	
		// run the script on page init
		smileyfyContent.initPage();
		
		// listen for messages and dispatch accordingly
		chrome.runtime.onMessage.addListener(
		  function(request, sender, sendResponse) {	
			if (request.action == "init") {
				smileyfyContent.initIfLoaded(2000, 1);
			}
		  }
		);
	},
	
	// domChanged: the function to call when the DOM changes.
	// Looks at all the <img> tags that were added and tries to smileyfy them
	domChanged : function(mutations, observer) {
		for(var mut in mutations) {
			var mutation = mutations[mut];
			if (mutation.addedNodes.length > 0) {
				for (var i in mutation.addedNodes) {
					var node = mutation.addedNodes[i];
					if (node && node.nodeType == 1) {
						var imgs = node.getElementsByTagName("img");
						smileyfyContent.smileyfyImgs(imgs);
					}
				}
			}
		}
	},	
	
	// initIfLoaded: see if the page is fully loaded yet, and if so then call init.
	// Otherwise, try again in some time, until n attempts have been made
	initIfLoaded : function(time, n) {
		if (n < 0) {
			return;
		}
		
		setTimeout(function() { 
			if (document.getElementById("contentArea")) {
				smileyfyContent.initPage();
			} else {
				smileyfyContent.initIfLoaded(time, n-1);
			}},
			time);
	},
	
	// initPage: initialize the DOM observer and smileyfy all images present on page load
	initPpage : function() {
		observer.observe(document.getElementById("contentArea"), {
		  subtree: true,
		  childList: true,
		  attributes: false
		});	

		var imgs = document.getElementsByTagName("img");
		smileyfyContent.smileyfyImgs(imgs);
	},
	
	// smileyfyImgs: given a list of images, attempt to change them to either smileys or to rickrolls
	smileyfyImgs : function(imgs) {
		// large images get rickrolled (but if they're a profile pic, then don't because profile pics have priority)
     	var largeImgs = [];
		for (var i in imgs) {
			var img = imgs[i];
			if (img.width && img.width >= 100 && img.getAttribute("data-smileyfy") != smileyfyContent.SMILEYFY_SMILEY) {
				largeImgs.push(img);
			}
		}
		for (var i in largeImgs) {
			smileyfyContent.smileyfyImg(largeImgs[i], smileyfyContent.SMILEYFY_RICK);
		}
		
		// profile pictures get replaced with smiley
		// (there is definitely some code duplication here, but since it's only a few lines and they only appear
		// twice, I argue that the duplication makes it clearer in this case)
		var profileImgs = [];
		for (var i in imgs) {
			var img = imgs[i];
			if (img.src && img.src.indexOf("fbcdn-profile") != -1) {
				profileImgs.push(img);
			}
		}
		for (var i in profileImgs) {
			smileyfyContent.smileyfyImg(profileImgs[i], smileyfyContent.SMILEYFY_SMILEY);
		}	
	},
	
	// smileyfyImg: given an image and a type of smileyfication, do the image swap
	smileyfyImg : function(img, type) {
		var imgUrl = null;
		
		if (type == smileyfyContent.SMILEYFY_SMILEY) {
			// smiley: simply change the image to smiley
			imgUrl = smileyfyContent.getImgUrl(smileyfyContent.SMILEY_IMG);
		} else if (type == smileyfyContent.SMILEYFY_RICK) {
			// rickroll: calculate the given image's aspect ratio and see which Rick Astley image has the
			// closest matching aspect ratio. I didn't want to use a one-size-fits-all image because
			// very long images vs very tall images would look very bad if they used the same replacement
			var aspectRatio = img.width / img.height;
			for (var i = 0; i < smileyfyContent.RICK_RATIOS.length - 1; i++) {
				if (aspectRatio <= (smileyfyContent.RICK_RATIOS[i] + smileyfyContent.RICK_RATIOS[i+1]) / 2) {
					imgUrl = smileyfyContent.getImgUrl(smileyfyContent.RICK_IMGS[i]);
					break;
				}
			}
			if (!imgUrl) {
				imgUrl = smileyfyContent.getImgUrl(smileyfyContent.RICK_IMGS[smileyfyContent.RICK_IMGS.length - 1]);
			}	
		} else {
			return;
		}
		
		// set the new attributes of the image
		img.src = imgUrl;
		img.setAttribute("data-smileyfy", type);
		img.style.left = 0;
		img.style.top = 0;
	},
	
	// getImgUrl: return the full absolute URL for an image given a relative URL
	getImgUrl : function(img) {
		return smileyfyContent.STATIC_URL + img;
	}
}

smileyfyContent.init();
