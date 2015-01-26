io = io.connect();
io.emit('ready');

io.on('tile-count', function(count){

	for(var i=0; i<count; i++) {
		io.on('tile-' + i, function(msg){
			$('#' + msg.id).html(msg.html);
		});
	}
});