var Worker = require('webworker-threads').Worker;
var settings = require('../settings');
var Weather = require('lib/weather');
var News = require('lib/news');
var Break = require('lib/break');
var Trains = require('lib/trains');
var Calendar = require('lib/calendar');
var tiles = [];

function TileWorker(io) { 
	this.io = io;
}

TileWorker.prototype.setup = function () { 

	$this = this;

	settings.tiles.forEach(function(tile,index) {
		var t;

		switch(tile.type)
		{
			case "weather":
				t = new Weather(index,tile,$this.io);
				break;
			case "news":
				t = new News(index,tile,$this.io);
				break;
			case "trains":
				t = new Trains(index,tile,$this.io);
				break;
			case "calendar":
				t = new Calendar(index,tile,$this.io);
				break;
			case "break":
				t = new Break(index,tile,$this.io);
				break;
		}

		tiles.push(t);
	});

	this.worker = new Worker();

	this.worker.onmessage = function(event) {
		console.log("Worker said : " + event.data);
	};

	this.worker.checkStatus = function() {
		tiles.forEach(function(tile) {
			tile.checkStatus();
		});
	}

	$this = this;

	// On connect - start updater
	this.io.on('connection', function(socket){ 
		console.log("Connected...");

		// Reset last updated dates
		tiles.forEach(function(tile) { tile.lastUpdated = new Date(0); });

		$this.io.sockets.emit('tile-count', tiles.length);
		$this.interval = setInterval($this.worker.checkStatus, 3000);

		// On disconnect - stop updater
		socket.on('disconnect', function () {
	        console.log("Disconnected...");
			clearInterval($this.interval);
	    });
	});
	
}

module.exports = TileWorker;