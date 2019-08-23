var express = require('express');
var fs = require('fs');
var csv = require("fast-csv");
var axios = require("axios");
var bodyParser = require('body-parser')
var router = express.Router();
let async = require('async');

const utf8 = require('utf8');

var stream = fs.createReadStream("./public/rshow.csv");

let song_csv = [];
//[ 'song_id', 'song_length', 'song_name', 'genere_ids', 'singer_id', 'singer', 'composer_id', 'composer', 'language', 'album', 'image','pid' ]

var csvStream = csv()
    .on("data", function(data) {
        song_csv.push(data);
    })
    .on("end", function() {});

stream.pipe(csvStream);

function reconvert(str) {
    str = str.replace(/(\\u)(\w{1,4})/gi, function($0) {
        return (String.fromCharCode(parseInt((escape($0).replace(/(%5Cu)(\w{1,4})/g, "$2")), 16)));
    });
    str = str.replace(/(&#x)(\w{1,4});/gi, function($0) {
        return String.fromCharCode(parseInt(escape($0).replace(/(%26%23x)(\w{1,4})(%3B)/g, "$2"), 16));
    });
    str = str.replace(/(&#)(\d{1,6});/gi, function($0) {
        return String.fromCharCode(parseInt(escape($0).replace(/(%26%23)(\d{1,6})(%3B)/g, "$2")));
    });

    return str;
}

router.post('/', (req, res, next) => {
    if (typeof req.body.k1 != null) {
        var keyword = new RegExp(req.body.k1);
        var ans = [];
        var rtn = [];
        async.waterfall([function(callback) {
            async.each(song_csv, (item, inner_callback) => {
                if (item[2].match(keyword)) {
                    return inner_callback(item);
                }
                inner_callback();
            }, function(rsp) {
                if (!rsp) {
                    res.json({
                        status: false,
                        msg: "Sorry, input not found!"
                    });
                } else {
                    axios.get('http://localhost:5000/query', {
                            params: {
                                song_id: rsp[0]
                            }
                        })
                        .then(function(response) {
                            callback(null, response.data);
                        })
                        .catch(function(error) {
                            res.json({
                                status: false,
                                msg: error
                            });
                        });
                }
            });
        }, function(rtn_array, callback) {
            async.each(rtn_array, (_id, inner_callback1) => {
                async.each(song_csv, (item, inner_callback2) => {
                    if (item[0].match(_id)) {
                        ans.push(item);
                        return inner_callback2();
                    }
                    inner_callback2();
                }, function() {
                    inner_callback1();
                });
            }, function() {
                callback(null, rtn_array, ans);
            });
        }, function(rtn_array, ans_arr, callback) {
            async.each(ans_arr, (item, inner_callback) => {
                if (item.length >= 12) {
                    rtn.push({
                        song_id: item[0],
                        song_name: item[2],
                        singer: item[5],
                        composer: item[7],
                        album: reconvert(item[9]),
                        image: item[10],
                        pid: item[11]
                    });
                    inner_callback();
                } else {
                    inenr_callback();
                }
            }, function() {
                res.json({
                    status: true,
                    list: rtn
                });
            });
        }]);
    } else {
        res.json({
            status: false,
            msg: "Please enter correct keyword!"
        });
    }
});

router.post('/multi_search', (req, res, next) => {
    if (typeof req.body.k1 != null && typeof req.body.k2 != null) {
        var keyword1 = new RegExp(req.body.k1);
        var keyword2 = new RegExp(req.body.k2);
        var ans = [];
        var rtn = [];
        async.waterfall([function(callback) {
            async.each(song_csv, (item, inner_callback) => {
                if (item[2].match(keyword1)) {
                    return inner_callback(item);
                }
                inner_callback();
            }, function(rsp) {
                if (!rsp) {
                    res.json({
                        status: false,
                        msg: "Sorry, input not found!"
                    });
                } else {
                    callback(null, rsp[0]);
                }
            });
        }, function(song_id1, callback) {
            async.each(song_csv, (item, inner_callback) => {
                if (item[2].match(keyword2)) {
                    return inner_callback(item);
                }
                inner_callback();
            }, function(rsp) {
                if (!rsp) {
                    res.json({
                        status: false,
                        msg: "Sorry, input not found!"
                    });
                } else {
                    axios.get('http://localhost:5000/query_hpe_multiple', {
                            params: {
                                song_id1: song_id1,
                                song_id2: rsp[0]
                            }
                        })
                        .then(function(response) {
                            callback(null, response.data, song_id1, rsp[0]);
                        })
                        .catch(function(error) {
                            res.json({
                                status: false,
                                msg: error
                            });
                        });
                }
            });
        }, function(rtn_array, song_id1, song_id2, callback) {
            async.each(song_csv, (item, inner_callback) => {
                if (item[0].match(song_id1)) {
                    ans.push(item);
                    return inner_callback(item);
                }
                inner_callback();
            }, function(rsp) {
                callback(null, rtn_array, song_id2, ans);
            });
        }, function(rtn_array, song_id2, ans, callback) {
            async.each(song_csv, (item, inner_callback) => {
                if (item[0].match(song_id2)) {
                    ans.push(item);
                    return inner_callback(item);
                }
                inner_callback();
            }, function(rsp) {
                callback(null, rtn_array, ans);
            });
        }, function(rtn_array, ans, callback) {
            async.each(rtn_array, (_id, inner_callback1) => {
                async.each(song_csv, (item, inner_callback2) => {
                    if (item[0].match(_id)) {
                        ans.push(item);
                        return inner_callback2();
                    }
                    inner_callback2();
                }, function() {
                    inner_callback1();
                });
            }, function() {
                callback(null, rtn_array, ans);
            });
        }, function(rtn_array, ans_arr, callback) {
            async.each(ans_arr, (item, inner_callback) => {
                if (item.length >= 12) {
                    rtn.push({
                        song_id: item[0],
                        song_name: item[2],
                        singer: item[5],
                        composer: item[7],
                        album: reconvert(item[9]),
                        image: item[10],
                        pid: item[11]
                    });
                    inner_callback();
                } else {
                    inenr_callback();
                }
            }, function() {
                res.json({
                    status: true,
                    list: rtn
                });
            });
        }]);
    } else {
        res.json({
            status: false,
            msg: "Please enter correct keyword!"
        });
    }
});

module.exports = router;