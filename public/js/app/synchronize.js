define(["socketio"],function (io) {

	var socket = io.connect();

	return {
		receive : function(command,callback) {
			socket.on(command,callback);
		},
		send : function(command,message) {
			socket.emit(command,message);
		}
	}

});