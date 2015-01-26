var util = require('util');
var fs = require('fs');
var Tile = require('./tile');
var settings = require('../settings');

function Weather(settings){
  Tile.apply(this, arguments);
  this.type = "weather";
}

util.inherits(Weather, Tile);

Weather.prototype.checkStatus = function() {
	if((new Date() - this.lastUpdated) > (1000 * 60 *60)) {
		this.refresh(this);
	}
}

Weather.prototype.refresh = function(tile,completed) {
	var url = 'https://api.forecast.io/forecast/' + settings.services.weather.apikey 
		+ '/' + this.settings.parameters.latitude + ',' 
		+ this.settings.parameters.longitude + '?units=si';

	this.httpGetJson(url, function(data) {
		tile.lastUpdated = new Date();
		tile.publish(tile.id, tile.type, data);
	});

	// this.readJsonFile('data/forecast.io.json', function(data){
	// });
}

module.exports = Weather;
