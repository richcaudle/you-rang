var fs = require('fs');
var request = require('request');
var jade = require('jade');

function Tile(id,settings,io) { 
	this.id = "tile-" + id;
	this.io = io;
	this.settings = settings;
	this.lastUpdated = new Date(0);
}

Tile.prototype.publish = function(id,type,data) {
	console.log("Publishing: ", id, " (", type, ")");

	var html = jade.renderFile('./views/tiles/' + type + '.jade', { settings: this.settings, data: data });

	//console.log(html);
	this.io.sockets.emit(id, { id: id, html: html });
};

Tile.prototype.refresh =  function(){
  throw new Error('Not implemented');
};

Tile.prototype.checkStatus =  function(){
  	throw new Error('Not implemented');
};

Tile.prototype.httpGetJson =  function(url, completed){
	this.httpGet(url, function (data) {
	  completed(JSON.parse(data));
	});
};

Tile.prototype.httpGet = function(url, completed){
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	completed(body);
	  }
	  else
	  {
	  	throw new Error('Failed to get data: ' + response.statusCode + '\n' + body);
	  }
	});
}

Tile.prototype.readJsonFile = function(path, completed){
	this.readFile(path, function (data) {
	  completed(JSON.parse(data));
	});
}

Tile.prototype.readFile = function(path, completed){
	fs.readFile(path, function (err, data) {
	  if (err) throw err;
	  completed(data);
	});
}

module.exports = Tile;