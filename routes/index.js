var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  var db = req.db;
  db.collection('usdQuotes').find().toArray(function (err, usd) {
    db.collection('eurQuotes').find().toArray(function (err, eur) {
      db.collection('requests').find().toArray(function (err, requests) {
        res.render('index', { title: 'Express', usdQuotes : usd, eurQuotes : eur, requests: requests});
      });
    });
  });
});

module.exports = router;
