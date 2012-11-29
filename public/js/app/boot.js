define(["jquery","fabric","app/canvas","app/uploader","app/synchronize","app/ui","app/client",'bootstrap'],
    function ($,fabric,canvas,uploader,sync,ui,client) {

    ui.init({
        upload : function(elem) {
            uploader.init(elem,{
                onCompleteBitmap: function(fileName){
                    canvas.addImage('uploads/'+fileName)
                },
                onCompleteSVG: function(fileName) {
                    canvas.addSVG('uploads/'+fileName);
                },
                onError: function(error) {
                    ui.alert(error);
                }
            });
        },
        send : function() {
            sync.send('add item',canvas.getItem());
        },
        delete : function() {
            return canvas.deleteItem();
        },
        drawing : function() {
            return canvas.toggleDrawing();
        },
        image : function(prop,value) {
            return canvas.changeImage(prop,value);
        }
    });
    // get events from fabric and target them to toolbox with jquery
    canvas.consumeEvents(ui);

    var clients = {};

    sync.receive('add client', function(o) {
        if(!clients.hasOwnProperty(o,client))
            clients[o.client] = client.add(o.client);
    });

    sync.receive('remove client', function(o) {
        if(clients.hasOwnProperty(o.client)) {
           clients[o.client].remove();
           delete(clients[o.client]);     
           client.drawInfo(o.client + " is gone");       
        }
    });

    sync.receive('draw item', function(o) {
        clients[o.client].drawSerializedObject(JSON.parse(o.item));
    });

});
