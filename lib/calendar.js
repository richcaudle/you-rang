var util = require('util');
var googleapis = require('googleapis');
var GoogleToken = require('gapitoken');
var Tile = require('./tile');
var settings = require('../settings');
var async = require('async');

function Calendar(settings){
	Tile.apply(this, arguments);
	this.type = "calendar";
}

util.inherits(Calendar, Tile);

Calendar.prototype.checkStatus = function() {
	if((new Date() - this.lastUpdated) > (1000 * 60 *60)) {
		this.refresh(this);
	}
}

Calendar.prototype.refresh = function(tile,completed) {
	var events = [];

	var startDate = new Date();
	var endDate = new Date();
	endDate.setHours(endDate.getHours() + 24);
	//endDate.setDate(endDate.getDate() + 1);

	async.each(tile.settings.calendars, function(calendar, callback) {

		var jwt = new googleapis.auth.JWT(settings.services[calendar.service].email_address, 
  		settings.services[calendar.service].key_file_path, null, ['https://www.googleapis.com/auth/calendar']);

		jwt.authorize(function(err, result) {
	 		if (err) throw err;
	 		
	 		var calAPI = googleapis.calendar('v3');

	 		calAPI.events.list({
		 		"calendarId": calendar.calendarId,
		 		"timeMin": startDate.toISOString(),
		 		"timeMax": endDate.toISOString(),
		 		"singleEvents": true,
		 		"auth": jwt
		 	}, function (err, response) {
		 		if (err) throw err;
		 		
		 		response.items.forEach(function(item) {
		 			if(item.start)
		 				events.push({calendar: calendar.name, start: new Date(item.start.dateTime), summary: item.summary});
		 		});
				
				callback(); 		
		 	});

	 	});

	}, function(err) {
		if( err ) {
	    	throw err;
	    } else {
			events.sort(tile.compareEntries);
	    	tile.lastUpdated = new Date();
			tile.publish(tile.id,tile.type,events.slice(0,tile.settings.parameters.maxEvents));
    	} });

}

Calendar.prototype.compareEntries = function (a,b) {
  if (a["start"] < b["start"])
     return -1;
  if (a["start"] > b["start"])
    return 1;
  return 0;
}

module.exports = Calendar;
