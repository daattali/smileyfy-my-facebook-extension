var smileyfy = {

	// which image types to change (profile/other/both/none)
	changeImgType : null,
	
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
		observer = new MutationObserver(smileyfy.domChanged);
				
		// run the script on page init
		smileyfy.initPage();					

		// listen for messages and dispatch accordingly
		chrome.runtime.onMessage.addListener(
		  function(request, sender, sendResponse) {
			if (request.action == "init") {
				smileyfy.initIfLoaded(2000, 1);
			}
			if (request.action == "refresh") {
				smileyfy.initPage();
			}
			if (request.action == "optionsChanged") {
				smileyfy.changeImgType = request.changeImgType;
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
						smileyfy.smileyfyImgs(imgs);
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
				smileyfy.initPage();
			} else {
				smileyfy.initIfLoaded(time, n-1);
			}},
			time);
	},
	
	// initPage: initialize the DOM observer and smileyfy all images present on page load
	initPage : function() {
		observer.observe(document.getElementById("contentArea"), {
		  subtree: true,
		  childList: true,
		  attributes: false
		});	

		var imgs = document.getElementsByTagName("img");
		
		// load the options of which images to change
		chrome.storage.sync.get({
			changeImgType : [true, true]
		}, function(items) {
			smileyfy.changeImgType = items.changeImgType;
	
			// unsmileyfy all the images (in case some images were smileyfied from before and now the option is off)
			smileyfy.unsmileyfyImgs(imgs);
			// now perform the smileyfication!
			smileyfy.smileyfyImgs(imgs);			
		});		
	},
	
	// smileyfyImgs: given a list of images, attempt to change them to either smileys or to rickrolls
	smileyfyImgs : function(imgs) {	
		var convertProfile = smileyfy.changeImgType[smileyfyCommon.SMILEYFY_SMILEY];
		var convertLarge = smileyfy.changeImgType[smileyfyCommon.SMILEYFY_RICK];
		
		if (convertLarge) {
			// large images get rickrolled (but if they're a profile pic, then don't because profile pics have priority)
			var largeImgs = [];
			var smileyfyType = smileyfyCommon.SMILEYFY_RICK;
			for (var i in imgs) {
				var img = imgs[i];
				if (img.width && img.width >= 100) {
					largeImgs.push(img);
				}
			}
			for (var i in largeImgs) {
				smileyfy.smileyfyImg(largeImgs[i], smileyfyType);
			}
		}
		
		if (convertProfile) {
			// profile pictures get replaced with smiley
			// (there is definitely some code duplication here, but since it's only a few lines and they only appear
			// twice, I argue that the duplication makes it clearer in this case)
			var profileImgs = [];
			var smileyfyType = smileyfyCommon.SMILEYFY_SMILEY;
			for (var i in imgs) {
				var img = imgs[i];
				if (img.src && img.src.indexOf("fbcdn-profile") != -1) {
					profileImgs.push(img);
				}
			}
			for (var i in profileImgs) {
				smileyfy.smileyfyImg(profileImgs[i], smileyfyType);
			}
		}
	},
	
	// smileyfyImg: given an image and a type of smileyfication, do the image swap
	smileyfyImg : function(img, type) {
		var imgUrl = null;
		
		if (parseInt(img.getAttribute("data-smileyfy-type")) >= type) return;
		
		if (type == smileyfyCommon.SMILEYFY_SMILEY) {
			// smiley: simply change the image to smiley
			imgUrl = smileyfy.getImgUrl(smileyfy.SMILEY_IMG);
		} else if (type == smileyfyCommon.SMILEYFY_RICK) {
			// rickroll: calculate the given image's aspect ratio and see which Rick Astley image has the
			// closest matching aspect ratio. I didn't want to use a one-size-fits-all image because
			// very long images vs very tall images would look very bad if they used the same replacement
			var aspectRatio = img.width / img.height;
			for (var i = 0; i < smileyfy.RICK_RATIOS.length - 1; i++) {
				if (aspectRatio <= (smileyfy.RICK_RATIOS[i] + smileyfy.RICK_RATIOS[i+1]) / 2) {
					imgUrl = smileyfy.getImgUrl(smileyfy.RICK_IMGS[i]);
					break;
				}
			}
			if (!imgUrl) {
				imgUrl = smileyfy.getImgUrl(smileyfy.RICK_IMGS[smileyfy.RICK_IMGS.length - 1]);
			}	
		} else {
			return;
		}
		
		// set the new attributes of the image
		img.setAttribute("data-smileyfy-type", type);
		img.setAttribute("data-smileyfy-orig", img.src);		
		img.src = imgUrl;
		img.style.left = 0;
		img.style.top = 0;
	},
	
	// unsmileyfyImgs: look at the given images, and if any of them have changed
	// by the extension, then revert them
	unsmileyfyImgs : function(imgs) {	
		for (var i in imgs) {
			var img = imgs[i];

			if (img instanceof HTMLElement && img.getAttribute("data-smileyfy-type") &&
				!smileyfy.changeImgType[img.getAttribute("data-smileyfy-type")]) {
				img.removeAttribute("data-smileyfy-type");
				img.src = img.getAttribute("data-smileyfy-orig");
				img.removeAttribute("data-smileyfy-orig");
			}
		}
	},
	
	// getImgUrl: return the full absolute URL for an image given a relative URL
	getImgUrl : function(img) {
		return smileyfy.STATIC_URL + img;
	}
};

smileyfy.init();
