 define(["jquery","fabric"],function ($,fabric) {

    //Cufon.fonts['ptsans'].offsetLeft = 110;

    $('#console').html("ready...<br/ >");



    return {
        _canvas : null,
        $canvas : null,
        id : "",
        add : function(id) {
            var $canvas = $("<canvas>");
            $("body").append($canvas);
            $canvas.attr({
                'width' : window.innerWidth,
                'height' : window.innerHeight})
            .css({
                position : 'absolute',
                top: 0 
            }); 
            this._canvas = new fabric.StaticCanvas($canvas[0]);
            $canvas.css({zIndex : -10 });
            this.drawInfo(id + " is here");
            this.id = id;
            this.$canvas = $canvas;
            return this;
        },
        remove : function() {
            this.$canvas.remove();
        },
        drawInfo : function(text) {
            // var textObj = new fabric.Text(text, { 
            //     fontFamily: 'ptsans', 
            //     left: 450,
            //     top: 60,
            //     fontSize: 20,
            //     textAlign: "left",
            //     useNative: false
            // });
            // this._canvas.add(textObj);
            $('#console').html($('#console').html() + text + "<br />");
        },
        drawSerializedObject : function(c) {
            var self = this;
            fabric.util.enlivenObjects(c.objects,function(enlivened) {
                self._canvas.clear();
                self.drawInfo(self.id + " sent something");
                enlivened.forEach(function(e){
                    self._canvas.add(e);
                })
                self._canvas.renderAll();
            });
        }
    };
});
