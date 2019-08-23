var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Song = new Schema(
  {
    song_id: { type: String },
    song_data: { type: Object }
  }
);

let Model = mongoose.model('Song', Song);

Model.insert = function(data, callback) {
    Model(data).save((err, rsp) => {
        callback(err, rsp);
    });
};

Model.delete = function(data, callback) {
    Model.remove(data, (err, rsp) => {
        callback(err, rsp);
    });
};


Model.list = function(data, callback) {
  Model.find(data).
  	exec((err, rsp)=>{
  		callback(err, rsp);
  	});
}


Model.detail = function(data, callback) {
    Model.findOne(data).
  	exec((err, rsp)=>{
  		callback(err, rsp);
  	});
};


Model.has = function(data, callback) {
    Model.findOne(data, (err, rsp) => {
        if (rsp == null) {
            callback(err, false);
        } else {
            callback(err, true);
        }
    });
};

module.exports = Model;
