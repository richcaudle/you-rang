var util = require('util');
var Tile = require('./tile');

function Break(id,settings,io){
  Tile.apply(this, arguments);
  this.type = "break";
}

util.inherits(Break, Tile);

Break.prototype.checkStatus = function() {
	if(this.lastUpdated.getTime() == 0) {
		this.refresh(this);
	}
}

Break.prototype.refresh = function(tile,completed) {
	tile.lastUpdated = new Date();
	tile.publish(tile.id,tile.type);
}

module.exports = Break;