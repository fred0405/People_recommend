var express = require('express');
var fs = require('fs');
var csv = require("fast-csv");
var axios = require("axios");
var bodyParser = require('body-parser')
var router = express.Router();

let Song = require('../models/m_song');
let async = require('async');

const db = require('../db');
const utf8 = require('utf8');

router.use('/hpe', require('./hpe'));
router.use('/gqe', require('./gqe'));

function unicode(str) {
	var value = '';
	for (var i = 0; i < str.length; i++) {
		if (i == 0)
			value += 'u' + left_zero_4(parseInt(str.charCodeAt(i)).toString(16));
		else {
			value += '.*u' + left_zero_4(parseInt(str.charCodeAt(i)).toString(16))
		}
	}
	return value;
}

function left_zero_4(str) {
	if (str != null && str != '' && str != 'undefined') {
		if (str.length == 2) {
			return '00' + str;
		}
	}
	return str;
}


/* GET home page. */
router.get('/', function(req, res, next) {
    const algo = (typeof req.query.type == 'undefined') ? 'hpe' : req.query.type;
    const k1 = (typeof req.query.first == 'undefined') ? '' : req.query.first;
    const k2 = (typeof req.query.second == 'undefined') ? '' : req.query.second;
    Song.list({}, (err, rsp) => {
        if (err) {
            console.dir(err);
        } else {
            console.dir(rsp.length);
        }
    });
    res.render('index', {
        title: 'kkboxDemo',
        algo,
        k1,
        k2
    });
});

// router.post('/test2', function(req, res, next) {
//     var collection = db.get().db('kkbox').collection('song');
//     let data = {};
//     data.count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
//     data.array = [];
//     let req_data = JSON.parse(req.body.Skeyword);
//     let list = [];
//     let plus = [];
//     let minus = [];
//     async.series([function(callback) {
//         req_data = req_data.sort(function(a, b) {
//             return a.op < b.op ? 1 : -1;
//         });
//         callback();
//     }, function(callback) {
//         async.each(req_data, function(item, inner_callback) {
//             if (/.*[\u4e00-\u9fa5]+.*/.test(item.name)) {
//                 item.name = unicode(item.name);
//                 inner_callback();
//             } else {
//                 inner_callback();
//             }
//         }, function() {
//             callback();
//         });
//     }, function(callback) {
//         async.each(req_data, function(item, inner_callback) {
//             if (item.op == 'plus') {
//                 item.name = ".*" + item.name + ".*";
//                 plus.push(item.name);
//                 inner_callback();
//             } else {
//                 item.name = ".*" + item.name + ".*";
//                 minus.push(item.name);
//                 inner_callback();
//             }
//         }, function() {
//             for (var i = 0; i < plus.length; i++) {
//                 plus[i] = new RegExp(plus[i]);
//             }
//             for (var i = 0; i < minus.length; i++) {
//                 minus[i] = new RegExp(minus[i]);
//             }
//             callback();
//         });
//     }, function(callback) {
//         console.dir(plus);
//         console.dir(minus);
//         collection.find({
//             $and: [{
//                 "data": {
//                     $in: plus
//                 }
//             }, {
//                 "data": {
//                     $nin: minus
//                 }
//             }]
//         }).limit(2).toArray(function(err, doc) {
//             if (err) {
//                 console.dir(err);
//                 res.json({
//                     status: false
//                 });
//             }
//             if (doc == null)
//                 res.json({
//                     status: false,
//                     msg: 'empty'
//                 });
//             else {
//                 data.collection = doc;
//                 console.dir(doc.length);
//                 callback();
//             }
//         });
//     }, function(callback) {
//         async.each(data.collection, function(doc, inner_callback1) {
//             console.dir(doc.sond_id);
//             if (typeof doc.embedding != 'undefined' && doc.embedding != null) {
//                 console.dir('aa');
//                 async.each(data.count, function(index, inner_callback2) {
//                     var str = 'top' + String(index);
//                     console.dir(str);
//                     collection.findOne({
//                             'sond_id': doc.embedding[str]
//                         })
//                         .then(function(rsp) {
//                             if (!rsp) {
//                                 console.dir(str + 'null');
//                                 inner_callback2()
//                             } else {
//                                 console.dir(str + doc.sond_id);
//                                 rsp.dist = doc.embedding[str + 'Distance']
//                                 data.array.push(rsp);
//                                 inner_callback2()
//                             }
//                         });
//                 }, function() {
//                     inner_callback1();
//                 });
//             } else {
//                 doc.dist = '0';
//                 data.array.push(doc);
//                 inner_callback1();
//             }
//         }, function() {
//             data.array.sort(function(a, b) {
//                 return (a.dist > b.dist) ? 1 : ((b.dist > a.dist) ? -1 : 0);
//             });
//             res.json({
//                 status: true,
//                 list: data.array.splice(0, 0 + 20)
//             });
//         });
//     }]);
// });

// router.post('/test1', function(req, res, next) {
//     var collection = db.get().db('kkbox').collection('song');
//     let data = {};
//     data.count = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
//     data.array = [];
//     data.name = req.body.name;
//     if (/.*[\u4e00-\u9fa5]+.*/.test(data.name)) {
//         data.name = unicode(data.name);
//     }
//     async.series([function(callback) {
//         collection.find({
//             "data": {
//                 $regex: ".*" + data.name + ".*"
//             }
//         }).limit(3).toArray(function(err, doc) {
//             if (err) {
//                 console.dir(err);
//                 res.json({
//                     status: false
//                 });
//             }
//             if (doc == null)
//                 res.json({
//                     status: false,
//                     msg: 'empty'
//                 });
//             else {
//                 data.collection = doc;
//                 console.dir(doc.length);
//                 callback();
//             }
//         });
//     }, function(callback) {
//         async.each(data.collection, function(doc, inner_callback1) {
//             console.dir(doc.sond_id);
//             if (typeof doc.embedding != 'undefined' && doc.embedding != null) {
//                 console.dir('aa');
//                 async.each(data.count, function(index, inner_callback2) {
//                     var str = 'top' + String(index);
//                     console.dir(str);
//                     collection.findOne({
//                             'sond_id': doc.embedding[str]
//                         })
//                         .then(function(rsp) {
//                             if (!rsp) {
//                                 console.dir(str + 'null');
//                                 inner_callback2()
//                             } else {
//                                 console.dir(str + doc.sond_id);
//                                 rsp.dist = doc.embedding[str + 'Distance']
//                                 data.array.push(rsp);
//                                 inner_callback2()
//                             }
//                         });
//                 }, function() {
//                     inner_callback1();
//                 });
//             } else {
//                 doc.dist = '0';
//                 data.array.push(doc);
//                 inner_callback1();
//             }
//         }, function() {
//             data.array.sort(function(a, b) {
//                 return (a.dist > b.dist) ? 1 : ((b.dist > a.dist) ? -1 : 0);
//             });
//             res.json({
//                 status: true,
//                 list: data.array.splice(0, 0 + 20)
//             });
//         });
//     }]);
// });
// router.post('/ajax_searchBy_song', (req, res, next) => {
//     Song.list({
//         "song_data.name": new RegExp(req.body.song_name)
//     }, (err, rsp) => {
//         if (err) {
//             res.json({
//                 status: false,
//                 msg: err
//             });
//         } else {
//             res.json({
//                 status: true,
//                 song: rsp
//             });
//         }
//     });
// });

// router.post('/ajax_searchBy_singerName', (req, res, next) => {
//     Song.list({
//         "song_data.album.artist.name": new RegExp(req.body.signer_name)
//     }, (err, rsp) => {
//         if (err) {
//             res.json({
//                 status: false,
//                 msg: err
//             });
//         } else {
//             res.json({
//                 status: true,
//                 song_list: rsp
//             });
//         }
//     });
// });

// router.post('/ajax_searchBy_album', (req, res, next) => {
//     Song.list({
//         "song_data.album.name": new RegExp(req.body.album)
//     }, (err, rsp) => {
//         if (err) {
//             res.json({
//                 status: false,
//                 msg: err
//             });
//         } else {
//             res.json({
//                 status: true,
//                 song_list: rsp
//             });
//         }
//     });
// });
/*
   router.get('/play', (req, res, next)=>{
   var test = Song.aggregate([
   {$match: {"song_data.album.artist.name": new RegExp('林俊傑')}}, // filter the results
   {$sample: {size: 5}} // You want to get 5 docs
   ]);
   res.send(test);
   });
   */
// router.post('/ajax_multiple_search', (req, res, next) => {
//     console.dir(req.body);

//     let data = JSON.parse(req.body.Skeyword);
//     let list = [];
//     async.series([function(callback) {
//         data = data.sort(function(a, b) {
//             return a.op < b.op ? 1 : -1;
//         });
//         callback();
//     }, function(callback) {
//         async.each(data, function(item, inner_callback1) {
//             if (item.op == 'plus') {
//                 if (item.type == 'singer') {
//                     console.dir(item);
//                     Song.list({
//                         "song_data.album.artist.name": new RegExp(item.name)
//                     }, (err, rsp) => {
//                         if (err) {
//                             inner_callback1(err);
//                         } else {
//                             console.dir(rsp);
//                             async.each(rsp, function(single_data, inner_callback2) {
//                                 list.push(single_data);
//                                 inner_callback2();
//                             }, function(error) {
//                                 if (error) {
//                                     inner_callback1(error);
//                                 } else {
//                                     console.dir('plus singer');
//                                     inner_callback1();
//                                 }
//                             });
//                         }
//                     });
//                 } else if (item.type == 'album') {
//                     Song.list({
//                         "song_data.album.name": new RegExp(item.name)
//                     }, (err, rsp) => {
//                         if (err) {
//                             inner_callback1(err);
//                         } else {
//                             async.each(rsp, function(single_data, inner_callback2) {
//                                 list.push(single_data);
//                                 inner_callback2();
//                             }, function(error) {
//                                 if (error) {
//                                     inner_callback1(error);
//                                 } else {
//                                     console.dir('plus album');
//                                     inner_callback1();
//                                 }
//                             });
//                         }
//                     });
//                 } else {
//                     Song.list({
//                         "song_data.name": new RegExp(item.name)
//                     }, (err, rsp) => {
//                         if (err) {
//                             inner_callback1(err);
//                         } else {
//                             console.dir(rsp);
//                             async.each(rsp, function(single_data, inner_callback2) {
//                                 list.push(single_data);
//                                 inner_callback2();
//                             }, function(error) {
//                                 if (error) {
//                                     inner_callback1(error);
//                                 } else {
//                                     console.dir('plus song');
//                                     inner_callback1();
//                                 }
//                             });
//                         }
//                     });
//                 }
//             } else {
//                 inner_callback1();
//             }
//         }, function(finalerror) {
//             if (finalerror) {
//                 res.json({
//                     status: false,
//                     msg: finalerror
//                 });
//             } else {
//                 callback();
//             }
//         });
//     }, function(callback) {
//         async.each(data, function(item, inner_callback1) {
//             if (item.op == 'minus') {
//                 if (item.type == 'singer') {
//                     Song.list({
//                         "song_data.album.artist.name": new RegExp(item.name)
//                     }, (err, rsp) => {
//                         if (err) {
//                             inner_callback1(err);
//                         } else {
//                             async.each(rsp, function(single_data, inner_callback2) {
//                                 for (var i = 0; i < list.length; i++) {
//                                     if (list[i].song_id == single_data.song_id) {
//                                         list.splice(i, 1);
//                                         inner_callback2();
//                                     } else if (i == list.length - 1) {
//                                         inner_callback2();
//                                     }
//                                 }

//                             }, function(error) {
//                                 if (error) {
//                                     inner_callback1(error);
//                                 } else {
//                                     inner_callback1();
//                                 }
//                             });
//                         }
//                     });
//                 } else if (item.type == 'album') {
//                     console.dir('minus album');
//                     Song.list({
//                         "song_data.album.name": new RegExp(item.name)
//                     }, (err, rsp) => {
//                         if (err) {
//                             inner_callback1(err);
//                         } else {
//                             for (var i = list.length - 1; i >= 0; i--) {
//                                 for (var j = 0; j < rsp.length; j++) {
//                                     if (list[i] && (list[i].song_id === rsp[j].song_id)) {
//                                         list.splice(i, 1);
//                                         rsp.splice(j, 1);
//                                     }
//                                 }
//                             }
//                             inner_callback1();
//                         }
//                     });
//                 } else {
//                     console.dir(item.name);
//                     Song.list({
//                         "song_data.name": new RegExp(item.name)
//                     }, (err, rsp) => {
//                         if (err) {
//                             inner_callback1(err);
//                         } else {
//                             for (var i = list.length - 1; i >= 0; i--) {
//                                 for (var j = 0; j < rsp.length; j++) {
//                                     if (list[i] && (list[i].song_id === rsp[j].song_id)) {
//                                         list.splice(i, 1);
//                                         rsp.splice(j, 1);
//                                         console.dir('aa');
//                                     }
//                                 }
//                             }
//                             inner_callback1();
//                         }
//                     });
//                 }
//             } else {
//                 inner_callback1();
//             }
//         }, function(finalerror) {
//             if (finalerror) {
//                 res.json({
//                     status: false,
//                     msg: finalerror
//                 });
//             } else {
//                 res.json({
//                     status: true,
//                     msg: 'success',
//                     list: list
//                 });
//             }
//         });
//     }]);
// });

module.exports = router;
