define(["jquery","fabric","highpass_filter"],function ($,fabric) {

    var $canvas = $('#main');
    $canvas.attr({
        "width" : window.innerWidth,
        "height" : window.innerHeight
    });

    var canvas = new fabric.Canvas('main');
    canvas.freeDrawingLineWidth = 6;
    var img_options = {
                    threshold : 128,
                    radius : 8,
                    iterations : 1,
                    gamma : 1.7,
                    input : {
                        min:100,
                        max:180
                    },
                    output : {
                        min:0,
                        max:255
                    }
                };

    var groups = [];

    return  {
        consumeEvents : function(target) {
            var update = function() {
                var o = canvas.getActiveObject();
                if(!o) o = canvas.getActiveGroup();
                target.update('selected',o);
                target.update('exists',(canvas._objects.length > 0));
            }
            canvas.on('mouse:up',function(e){
                update();
            });
            canvas.on('object:added',function(e){
                target.update('added',e.target);
            });
            canvas.on('object:removed',function(e){
                update();
            });
        },
        addImage : function(filename,callback) {
            fabric.Image.fromURL(filename, function(img) {
                var f = fabric.Image.filters;
                var object = img.set({ left: 300, top: 300}).scale(0.9);
                object.filters.push(new f.Highpass(img_options));

                canvas.add(object);
                canvas.setActiveObject(object);
                object.applyFilters(canvas.renderAll.bind(canvas));
                canvas.fire('object:added', { target: object });
                if(callback) callback(object);
            });
        },
        changeImage : function(prop,value) {
            var f = fabric.Image.filters;
            var obj = canvas.getActiveObject();
            eval("img_options."+prop+" = value");
            obj.filters.length = 0;
            obj.filters.push(new f.Highpass(img_options));
            obj.applyFilters(canvas.renderAll.bind(canvas));
        },
        addSVG : function(filename,callback) {
            fabric.loadSVGFromURL(filename, function(objects,options) { 
                var loadedObject;
                 if (objects.length > 1) {
                    loadedObject = new fabric.PathGroup(objects, options);
                } else {
                    loadedObject = objects[0];
                }
                canvas.add(loadedObject);
                if(callback) callback(object);
            });
        },
        deleteItem : function() {
            function remove(o) {
                canvas.remove(o);
                canvas.fire('object:removed', { target: o });
            }
            if(canvas.getActiveGroup()){
                canvas.getActiveGroup().forEachObject(function(o){ 
                    remove(o)
                });
                canvas.discardActiveGroup().renderAll();
            } else {
                var o = canvas.getActiveObject()
                remove(o);
            }
        },
        getItem :function() {
            return JSON.stringify(canvas.toJSON());
        },
        toggleDrawing : function() {
            canvas.discardActiveGroup();
            canvas.isDrawingMode = !canvas.isDrawingMode;
            return canvas.isDrawingMode
        },
    };
});