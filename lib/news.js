var util = require('util');
var cheerio = require('cheerio');
var Tile = require('./tile');
var settings = require('../settings');

function News(id,settings,io){
  Tile.apply(this, arguments);
  this.type = "news";
}

util.inherits(News, Tile);

News.prototype.checkStatus = function() {
	if((new Date() - this.lastUpdated) > (1000 * 60 *60)) {
		this.refresh(this);
	}
}

News.prototype.refresh = function(tile) {

	var stories = [];

	this.httpGet(this.settings.parameters.feed, function(data){
		var $ = cheerio.load(data);

		$('item').each(function(i, elem) {
		  if(stories.length < 5) {
		  	stories.push({
			  	"title": $(this).find('title').first().text(),
			  	"link": $(this).find('link').next().text()
			  });
		  }
		});
		
		tile.lastUpdated = new Date();
		tile.publish(tile.id,tile.type,stories);
	});

	//this.readFile('data/bbcnews.rss2.xml');
}

module.exports = News;