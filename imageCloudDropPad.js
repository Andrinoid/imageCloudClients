var ImageCloud = (function () {
	/**
	 * --------------------------------------------------------------------
	 * Utilities
	 * --------------------------------------------------------------------
	 */
	//extend Object
	function extend() {
	    for (var i = 1; i < arguments.length; i++)
	        for (var key in arguments[i])
	            if (arguments[i].hasOwnProperty(key))
	                arguments[0][key] = arguments[i][key];
	    return arguments[0];
	};

	function toQueryString(obj) {
	    var parts = [];
	    for (var i in obj) {
	        if (obj.hasOwnProperty(i)) {
	            parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
	        }
	    }
	    return parts.join("&");
	}
	
	function setClass(el, className) {
    //credit: http://youmightnotneedjquery.com/
    if (el.classList)
        el.classList.add(className);
    else
        el.className += ' ' + className;
	}
	
	function removeClass(el, className) {
		if (el.classList)
  		el.classList.remove(className);
		else
  		el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
	}

	Dropzone.autoDiscover = false;

	var styles = [
	    '.imageCloud {',
	        'position: relative;',
	        'background-size: cover;',
	        'background-position: 50% 50%;',
	        'cursor: pointer;',
	        'font-family: arial, serif;',
	        'min-height: 200px;',
	    '}',

	    '.imageCloud .dropSheet {',
	        'position: absolute;',
	        'top: 0;',
	        'bottom: 0;',
	        'left: 0;',
	        'right: 0;',
	        'background: rgba(0, 0, 0, 0.5);',
	        'text-align: center;',
	        'padding: 10px;',
	        'opacity: 0;',
	        'transition: ease all 0.5s;',
	        'pointer-events: none;',
	    '}',

			'.imageCloud .dropSheet.shown {',
					'background: rgba(0, 0, 0, 0);',
					'opacity: 1;',
			'}',
		
	    '.imageCloud:hover .dropSheet {',
					'background: rgba(0, 0, 0, 0.5);',
	        'opacity: 1;',
	    '}',

	    '.imageCloud .dropSheet > div {',
	        'padding: 10px;',
	        'color: white;',
	        'border: dashed 2px #fff;',
	        'position: absolute;',
	        'top: 10px;',
	        'bottom: 10px;',
	        'left: 10px;',
	        'right: 10px;',
	    '}',

	    '.imageCloud .dropSheet > div .dropLabel {',
	        'position: absolute;',
	        'top: 50%;',
	        'left: 50%;',
	        'transform: translate(-50%, -50%);',
	        'white-space: nowrap;',
	    '}',

	    '.imageCloud .dropSheet > div p {',
	        'font-size: 18px;',
	    '}',

	    '.imageCloud .fallBack {',
	        'position: absolute;',
	        'top: 0;',
	        'bottom: 0;',
	        'left: 0;',
	        'right: 0;',
	        'pointer-events: none;',
	        'background-color: gray;',
	        'background-size: cover;',
	        'background-position: center;',
	    '}',

	    '.imageCloud .loadedImage {',
	        'position: absolute;',
	        'top: 0;',
	        'bottom: 0;',
	        'left: 0;',
	        'right: 0;',
	        'pointer-events: none;',
	        'opacity: 0;',
	        'transition: ease opacity 0.5s;',
	        'background-size: cover;',
	        'background-position: center;',
	    '}'
    ].join('');
	
		/**
		* Initialize
		*/
    function ImageCloud(elm, options) {
        this.parent = elm;
        if(!this.parent) {
					throw 'ImageCloud: prent elemet missing';
				}
        this.defaults = {
        	width: 'auto',
        	height: 'auto',
					quality: 70,
					maxFilesize: 8,
					currentImage: '',
                    title: 'Drop Image here.',
                    subTitle: 'or click here'
        };
        this.options = options;
        this.layout();
        this.injectStyleSheet(styles);
        this.setDropPad();
    }

    ImageCloud.prototype.layout = function () {
			  this.defaults = extend(this.defaults, this.options);
        var dom =
                '<div class="fallBack"></div>' +
                '<div class="loadedImage"></div>' +
                '<div class="dropSheet">' +
                    '<div>' +
                        '<div class="dropLabel">' +
                            '<p>' + this.defaults.title + '</p>' +
                                '<p>' +
                                    '<small>' + this.defaults.subTitle + '</small>' +
                                '</p>' +
                        '</div>' +
                    '</div>' +
                '</div>';
				
        this.parent.innerHTML = dom;
        setClass(this.parent, 'imageCloud');
        var bgElm = this.parent.querySelector('.fallBack');
        bgElm.style.backgroundImage = 'url(' + this.defaults.currentImage + ')';
				bgElm.style.opacity = 1;
			
				
				if(!this.defaults.currentImage) {
					var sheet = this.parent.querySelector('.dropSheet');
					setClass(sheet, 'shown');
				}

    };

    ImageCloud.prototype.injectStyleSheet = function(value) {
    	//if styles exists do nothing
    	if(document.getElementById('imagecloudStyles')) return;
        var tag = document.createElement('style');
        tag.type = 'text/css';
        tag.id = 'imagecloudStyles';
        if( tag.styleSheet ) {
            tag.styleSheet.cssText = value;
        }
        else {
            tag.appendChild( document.createTextNode(value));
        }
        document.getElementsByTagName('head')[0].appendChild(tag);
    };

    ImageCloud.prototype.resolveOptions = function() {
    	var options = null;
    	if(typeof(this.options) === 'function') {
    		options = this.options();
    	} else {
    		options = this.options;
    	}
    	this.defaults = extend(this.defaults, options);

        this.defaults.currentImage = ''; //Hakk frá Óla því það fer allt í fokk ef að currentImage er base64 strengur...auk þess sem ég sé engan tilgang með því að senda current image url-ið aftur á serverinn

    	return queryParams = '?' + toQueryString(this.defaults);
    };

    ImageCloud.prototype.setDropPad = function() {
    	var self = this;
    	
    	var queryParams = this.resolveOptions();
    	this.droppad = new Dropzone(this.parent, {
            url: 'http://tweecode.com/api/imagecloud/' + queryParams,
            paramName: 'image',
            addRemoveLinks: true,
						//forceFallback: true,
            acceptedFiles: 'image/*',
            maxFilesize: this.defaults.maxFilesize,
            previewTemplate: '<div id="preview-template" style="display: none;"></div>',
				 		headers: {

        		'Cache-Control': null,
        		'X-Requested-With': null
    			}
        });
    	
        this.droppad.on('success', function(e) {
					var sheet = self.parent.querySelector('.dropSheet');
					removeClass(sheet, 'shown');
        	var rsp = JSON.parse(e.xhr.response);
					self.resetBackgrounds(rsp.url);
        	self.success(rsp);
        });

        this.droppad.on('uploadprogress', function(e, progress) {
        	console.log('progress', progress);
        });
    };

    ImageCloud.prototype.setOptions = function() {
    	this.resolveOptions();
    	this.droppad.options.url = 'http://tweecode.com/api/imagecloud/' + this.resolveOptions();

    };

    ImageCloud.prototype.resetBackgrounds = function(url) {
			var self = this;
			var imageloader = new Image();
			imageloader.onload = function() {
				 	
					var bgElm = self.parent.querySelector('.loadedImage');
					bgElm.style.backgroundImage = 'url(' + url + ')';
					bgElm.style.opacity = 1;

					setTimeout(function() {
						var bgElm2 = self.parent.querySelector('.fallBack');
						bgElm2.style.backgroundImage = 'url(' + url + ')';
						bgElm2.style.opacity = 1;
						bgElm.style.opacity = 0;
					}, 500);
			}
			imageloader.src = url;
			
   
    };

    ImageCloud.prototype.on = function(type, fn) {
    	if( this[type] ) {
    		this[type] = fn;
    	} else {
	    	throw 'event type: ' + type + ' is not valid';
    	}
    };

    ImageCloud.prototype.success = function(cb) {
    	cb();
    }

    return ImageCloud;

})();
