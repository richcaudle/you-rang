var util = require('util');
var cheerio = require('cheerio');
var Tile = require('./tile');
var settings = require('../settings');

function Trains(id,settings,io){
  Tile.apply(this, arguments);
  this.type = "trains";
  this.schedule = settings.schedule;
}

util.inherits(Trains, Tile);

Trains.prototype.checkStatus = function() {
	// Data lasts 1 min
	if(this.needsRefresh(1)) {
		this.refresh(this);
	}
}

Trains.prototype.refresh = function(tile) {

	var trains = [];
	var now = new Date();
	var hours = now.getHours();
	var mins = now.getMinutes();

	this.schedule.forEach(function(period) {
		if(period.start_hour <= hours) 
		{
			tile.settings = period;
		}
	});
	
	if(hours < 10)
		hours = "0" + hours;
	if(mins < 10)
		mins = "0" + mins;

	var url = 'http://ojp.nationalrail.co.uk/service/timesandfares/' + tile.settings.parameters.from + '/' 
		+ tile.settings.parameters.to + '/today/' + hours + mins + '/dep';

	this.httpGet(url, function(data){
		var $ = cheerio.load(data);

		$('#ctf-results table tbody tr.mtx').each(function(i, elem) {
		  var raw = $(this).children();

		  trains.push({
		  	"departs": $(raw[0]).text().trim(),
		  	"arrives": $(raw[3]).text().trim(),
		  	"duration": $(raw[4]).text().trim(),
		  	"changes": $(raw[5]).text().trim(),
		  	"status": tile.parseStatus($(raw[7]).text())
		  });

		});

		tile.lastUpdated = new Date();
		tile.publish(tile.id,tile.type,trains);
	});

	//this.readFile('data/nationalrail-results.html');
}

Trains.prototype.parseStatus = function(status) {

	status = status.trim().replace(/\n|\r|\t/g, "");

	if(status.indexOf("cancelled") != -1) {
		return { "text": "Cancelled", "class": "bg-danger" };
	} else if(status.indexOf("bus") != -1) {
		return { "text": "Bus", "class": "bg-warning" };
	} else if(status.indexOf("on time") != -1) {
		return { "text": "On Time", "class": "text-success" };
	} else if(status.indexOf("late") != -1) {
		return { "text": status, "class": "bg-warning" };
	}

	return { "text": "Unknown", "class": "text-muted" };
}

module.exports = Trains;
