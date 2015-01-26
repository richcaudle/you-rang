var express = require('express');
var router = express.Router();
var settings = require('../settings');

router.get('/', function(req, res, next) {
	res.render('index', { title: 'You Rang Sir?', tiles: settings.tiles });
});

module.exports = router;
