var express = require('express');
var fs = require('fs');
var csv = require("fast-csv");
var axios = require("axios");
var bodyParser = require('body-parser')
var router = express.Router();
let async = require('async');

const utf8 = require('utf8');

var stream_70w = fs.createReadStream("./public/rshowSmall_70w_wh.csv");

let song_small_csv = [];
//[ 'song_id', 'song_length', 'song_name', 'genere_ids', 'singer_id', 'singer', 'composer_id', 'composer', 'language', 'album', 'image','pid' ]

var csvStream = csv()
    .on("data", function(data) {
        song_small_csv.push(data);
    })
    .on("end", function() {});

stream_70w.pipe(csvStream);


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

router.post('/query_with_singer', (req, res, next) => {
    var keyword1 = new RegExp(req.body.k1);
    var keyword2 = new RegExp(req.body.k2);
    var ans = [];
    var rtn = [];
    async.waterfall([function(callback) {
        if (req.body.k1_is_singer) {
            async.each(song_small_csv, (item, inner_callback) => {
                if (item[5].match(keyword1)) {
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
                    callback(null, rsp[4]);
                }
            });
        } else {
            async.each(song_small_csv, (item, inner_callback) => {
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
        }
    }, function(id1, callback) {
        if (req.body.k2_is_singer) {
            async.each(song_small_csv, (item, inner_callback) => {
                if (item[5].match(keyword2)) {
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
                    callback(null, id1, rsp[4]);
                }
            });
        } else {
            async.each(song_small_csv, (item, inner_callback) => {
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
                    callback(null, id1, rsp[0]);
                }
            });
        }
    }, function(id1, id2, callback) {
        if (req.body.k1_is_singer && req.body.k2_is_singer) {
            axios.get('http://localhost:5000/query_gqe_singer', {
                    params: {
                        singer_id1: id1,
                        singer_id2: id2
                    }
                })
                .then(function(response) {
                    callback(null, response.data);
                })
                .catch(function(error) {
                    res.json({
                        status: false,
                        msg: "Sorry, service error"
                    });
                });
        } else {
            if (req.body.k1_is_singer) {
                axios.get('http://localhost:5000/query_gqe_single_singer', {
                        params: {
                            song_id: id2,
                            singer_id: id1
                        }
                    })
                    .then(function(response) {
                        callback(null, response.data);
                    })
                    .catch(function(error) {
                        res.json({
                            status: false,
                            msg: "Sorry, service error"
                        });
                    });
            } else {
                axios.get('http://localhost:5000/query_gqe_single_singer', {
                        params: {
                            song_id: id1,
                            singer_id: id2
                        }
                    })
                    .then(function(response) {
                        callback(null, response.data);
                    })
                    .catch(function(error) {
                        res.json({
                            status: false,
                            msg: "Sorry, service error"
                        });
                    });
            }
        }
    }, function(rtn_array, callback) {
        async.each(rtn_array, (_id, inner_callback1) => {
            async.each(song_small_csv, (item, inner_callback2) => {
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
                list: rtn,
                k1_is_singer: req.body.k1_is_singer,
                k2_is_singer: req.body.k2_is_singer                
            });
        });
    }]);
});

router.use(function(req, res, next) {
    var keyword1 = new RegExp(req.body.k1);
    var keyword2 = new RegExp(req.body.k2);
    var k1_song = 0;
    var k1_singer = 0;
    var k2_song = 0;
    var k2_singer = 0;
    async.series([function(callback) {
        async.each(song_small_csv, (item, inner_callback) => {
            if (item[2].match(keyword1)) {
                k1_song++;
                inner_callback()
            } else {
                inner_callback();
            }
        }, function() {
            callback();
        });
    }, function(callback) {
        async.each(song_small_csv, (item, inner_callback) => {
            if (item[5].match(keyword1)) {
                k1_singer++;
                inner_callback()
            } else {
                inner_callback();
            }
        }, function() {
            if (k1_singer > k1_song) req.session.k1_is_singer = true;
            else req.session.k1_is_singer = false;
            callback();
        });
    }, function(callback) {
        async.each(song_small_csv, (item, inner_callback) => {
            if (item[2].match(keyword2)) {
                k2_song++;
                inner_callback()
            } else {
                inner_callback();
            }
        }, function() {
            callback();
        });
    }, function(callback) {
        async.each(song_small_csv, (item, inner_callback) => {
            if (item[5].match(keyword2)) {
                k2_singer++;
                inner_callback()
            } else {
                inner_callback();
            }
        }, function() {
            if (k2_singer > k2_song) req.session.k2_is_singer = true;
            else req.session.k2_is_singer = false;
            callback();
        });
    }, function(callback){
        if ((k1_song == 0 && k1_singer == 0) || (k2_song == 0 && k2_singer == 0))
            res.json({
                status: false,
                msg: "Sorry, input not found!"
            });
        else 
            callback();
    }, function(callback) {
        if (!req.session.k1_is_singer && !req.session.k2_is_singer) next();
        else {
            axios.post('http://localhost:3000/gqe/query_with_singer', {
                    k1: req.body.k1,
                    k2: req.body.k2,
                    k1_is_singer: req.session.k1_is_singer,
                    k2_is_singer: req.session.k2_is_singer
                })
                .then(function(response) {
                    res.json(response.data);
                })
                .catch(function(error) {
                    res.json({
                        status: false,
                        msg: error
                    });
                });
        }
    }]);
});

router.post('/', (req, res, next) => {
    if (typeof req.body.k1 != null && typeof req.body.k2 != null) {
        var keyword1 = new RegExp(req.body.k1);
        var keyword2 = new RegExp(req.body.k2);
        var ans = [];
        var rtn = [];
        async.waterfall([function(callback) {
            async.each(song_small_csv, (item, inner_callback) => {
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
            async.each(song_small_csv, (item, inner_callback) => {
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
                    axios.get('http://localhost:5000/query_gqe', {
                            params: {
                                song_id1: song_id1,
                                song_id2: rsp[0]
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
                async.each(song_small_csv, (item, inner_callback2) => {
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
                    list: rtn,
                    k1_is_singer: req.session.k1_is_singer,
                    k2_is_singer: req.session.k2_is_singer
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