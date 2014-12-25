var express = require('express');
var router = express.Router();

router.put('/:currency/:from/:to', function (req, res) {
    var db = req.db;
    var currency = req.params.currency;
    var from = req.params.from;
    var to = req.params.to;

    var numTest = /^[0-9]{6}$/;
    if (!numTest.test(from) || !numTest.test(to) || currency.toLowerCase() != 'usd' && currency.toLowerCase() != 'eur') {
        res.sendStatus(400);
        return;        
    }

    db.collection('requests').insert({
        currency: req.params.currency,
        from: req.params.from,
        to: req.params.to
    }, function (err, result) {
        if (!err) {
            res.sendStatus(200);
        } else {
            res.sendStatus(500);
        }
    });
});

router.delete('/:id', function (req, res) {
    var db = req.db;
    var toBeDeleted = req.params.id;
    db.collection('requests')
        .removeById(toBeDeleted,
        function (err, result) {
            if (result === 1) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        });
});

router.post('/:id/:currency/:from/:to', function (req, res) {
    var db = req.db;
    db.collection('requests').updateById(req.params.id, {
            currency: req.params.currency,
            from: req.params.from,
            to: req.params.to
        },
        function (err, result) {
            if (result === 1) {
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        });
});

router.get('/:id', function (req, res) {
    if (!req.accepts('html', 'json', 'text', 'xml')) {
        res.sendStatus(406);
        return;
    }

    var db = req.db;
    db.collection('requests').findById(req.params.id,
        function (err, result) {
            if (!result) {
                res.sendStatus(404);
            } else {
                var fromY = parseInt(result.from.slice(0, 4));
                var fromM = parseInt(result.from.slice(4, 6));
                var toY = parseInt(result.to.slice(0, 4));
                var toM = parseInt(result.to.slice(4, 6));
                var currency = result.currency;
                db.collection(currency.toLowerCase() + "Quotes").
                    find({year: {$gte: fromY, $lte: toY}, month: {$gte: fromM, $lte: toM}})
                    .toArray(function (err, table) {
                        table.forEach(function (e) {
                            delete e._id;
                        });
                        res.format({
                            text: function () {
                                res.send(JSON.stringify(table, null, 4).replace(/({|}|:|,)/g, ''));
                            },
                            html: function () {
                                var json2html = require('node-json2html');
                                var transform = {
                                    'tag': 'li',
                                    'html': 'On ${year}.${month}.${day} ' + currency + ' was ${price} RUR'
                                };
                                res.send(json2html.transform(table, transform));
                            },
                            json: function () {
                                res.json(table);
                            },
                            xml: function () {
                                var js2xmlparser = require("js2xmlparser");
                                res.send(js2xmlparser("result", {fromYYYYmm: result.from, toYYYYmm: result.to, qoute: table}));
                            }
                        });
                    });
            }
        });
});

module.exports = router;