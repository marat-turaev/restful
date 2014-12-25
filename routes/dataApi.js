var express = require('express');
var router = express.Router();

router.put('/:currency/:year/:month/:day/:price', function (req, res) {
    var db = req.db;
    var table = req.params.currency.toLowerCase() + "Quotes";
    db.collection(table).insert({
        year: req.params.year,
        month: req.params.month,
        day: req.params.day,
        price: req.params.price
    }, function (err, result) {
        if (!err) {
            res.sendStatus(200);
        } else {
            res.sendStatus(500);
        }
    });
});

router.delete('/:currency/:id', function (req, res) {
    var db = req.db;
    var table = req.params.currency.toLowerCase() + "Quotes";
    db.collection(table)
        .removeById(req.params.id,
        function (err, result) {
            if (result === 1) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        });
});

router.post('/:currency/:id/:year/:month/:day/:price', function (req, res) {
    var db = req.db;
    var table = req.params.currency.toLowerCase() + "Quotes";
    db.collection(table).updateById(req.params.id, {
            year: req.params.year,
            month: req.params.month,
            day: req.params.day,
            price: req.params.price
        },
        function (err, result) {
            if (result === 1) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        });
});

router.get('/:currency/:id', function (req, res) {
    if (!req.accepts('html', 'json', 'text', 'xml')) {
        res.sendStatus(406);
        return;
    }

    var db = req.db;
    var currency = req.params.currency;
    var table = currency.toLowerCase() + "Quotes";
    db.collection(table).findById(req.params.id,
        function (err, result) {
            if (!result) {
                res.sendStatus(404);
            } else {
                delete result._id;
                res.format({
                    text: function () {
                        res.send(JSON.stringify(result, null, 4));
                    },
                    html: function () {
                        var json2html = require('node-json2html');
                        var transform = {
                            'tag': 'p',
                            'html': 'On ${year}.${month}.${day} ' + currency + ' was ${price} RUR'
                        };
                        res.send(json2html.transform(result, transform));
                    },
                    json: function () {
                        res.json(result);
                    },
                    xml: function () {
                        var js2xmlparser = require("js2xmlparser");
                        res.send(js2xmlparser("qoute", result));
                    }
                });
            }
        });
});

module.exports = router;