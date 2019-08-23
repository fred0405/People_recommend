var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var env = require('./env.js');
var index = require('./routes/index');
var hpe = require('./routes/hpe');
var gqe = require('./routes/gqe');
var app = express();

app.use(session({
    name: "rShow",
    secret: 'rShow',  // 用来对session id相关的cookie进行签名
    store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
    saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
    resave: false,  // 是否每次都重新保存会话，建议false
    cookie: {
        maxAge: 15 * 1000  // 有效期，单位是毫秒
    }
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
if(env.RUN_ENV=='local')app.use('/', express.static('public'));
else app.use('/kkbox', express.static('./public'));
app.use(cors());
//console.dir(env.RUN_ENV);
if(env.RUN_ENV!='local')app.use(express.static(path.join(__dirname, '/public')));

app.use('', index);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

var db = require('./db')

// Connection URL
const url = 'mongodb://localhost:27017';

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
