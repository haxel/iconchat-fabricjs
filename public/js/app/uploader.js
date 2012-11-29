define(["jquery","fileuploader"],function ($) {

    return {
		init : function($el,callbacks) {
			/*
			var onComplete = function(id,filename,result) {
				var ext = (-1 !== filename.indexOf('.')) ? filename.replace(/.*[.]/, '').toLowerCase() : '';
				if(ext == 'gif' || ext == 'jpg' || ext == 'png'){
					callbacks.onCompleteBitmap(filename);
				} else if( ext == 'svg') {
					callbacks.onCompleteSVG(filename);
				}
			};
			var _uploader = new qq.FileUploaderBasic({
				button: $el[0],
				onComplete : onComplete,
				action: 'upload',
				debug: true,
				allowedExtensions : ['gif','jpg','png','svg']
    		});
*/		
			$el.attr({'data-url':'/upload'});
    		$el.fileupload({
    			dataType:'json',
    			url:'/upload',
    			progressall: function (e, data) {
    				console.log(data);
    			},
    			done: function(e,data) {
    				console.log(e);
    				if(data.result.success){
    					var file = data.files[0];
						if(file.type == 'image/gif' || file.type == 'image/jpeg' || file.type == 'image/png'){
							callbacks.onCompleteBitmap(file.name);
						} else if( file.type == 'image/svg+xml') {
							callbacks.onCompleteSVG(file.name);
						} else {
							callbacks.onError('Please use either a PNG/JPG/GIF or SVG');
						}

    				}
				}
    		})	
		}
	};
});