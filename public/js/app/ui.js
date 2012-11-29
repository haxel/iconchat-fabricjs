define(["jquery"],function ($) {

	var _tools = {
		drawing : $('#tools .draw-btn').text('enter drawing mode'),
		delete : $('#tools .delete-btn').text('delete').hide(),
		fileupload : $('#tools .add-btn'),
		send : $('#tools .send-btn').text('send').hide(),
	}, $_toolbox = $('#tools') ,$_imagetools = $('#imagetools');

	var show_image_ui = function(o) {
		$_imagetools.modal('show');
	}

	var changeImage;
	
	return {
		addImageControls : function(o) {
            $('.gamma',$_imagetools).bind('change',function() {
            	changeImage('gamma',this.value);
            });
            $('.threshold',$_imagetools).bind('change',function() {
            	changeImage('threshold',this.value);
            });
            $('.blur',$_imagetools).bind('change',function() {
            	changeImage('blur',this.value);
            });
            $('.source .min_input',$_imagetools).bind('change',function() {
            	changeImage('input.min',this.value);
            });
             $('.source .max_input',$_imagetools).bind('change',function() {
            	changeImage('input.max',this.value);
            });
            $('.target .min_output',$_imagetools).bind('change',function() {
            	changeImage('output.min',this.value);
            });
            $('.target .max_output',$_imagetools).bind('change',function() {
            	changeImage('output.max',this.value);
            });
        },

		update : function(eventname,o){
			if(eventname == 'selected') {
				if(o){
					if(o.type == 'image') {
						show_image_ui(o);
					}
					_tools.delete.show();
				} else {
					_tools.delete.hide();
				}
			} else if(eventname == 'exists') {
				(o) ? _tools.send.show() : _tools.send.hide();
			} else if(eventname == 'added') {
				if(o && o.type == 'image') {
					this.addImageControls(o);
				}
			}
		},
		alert : function(error) {
			var $alert = $('<div class="alert alert-block alert-error fade in">'),
				$dismiss = $('<a class="btn btn-danger" data-dismiss="alert" >Will do!</a>');
			$('#messagebox').append($alert);
			$alert.html("<h4 class='alert-heading'>Oh snap! You got an error!</h4>" + "<p>" + error + "</p>");

			$alert.append($dismiss);
			$alert.alert();
		},
		init : function(cmd) {
			changeImage = function(prop,value) {
				cmd.image(prop,value);
			};
			cmd.upload(_tools.fileupload);
			
			_tools.send.click(function(){
				cmd.send();
			});
			_tools.delete.click(function() {
				cmd.delete();
			});

			_tools.drawing.click(function() {
				if(cmd.drawing()) {
                    $(this).text('leave drawing mode').css({color:'red'});
				} else {
                    $(this).text('enter drawing mode').css({color:'black'});
                }
            });
		}
	}
});

