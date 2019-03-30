var express = require('express');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');

/*var store = new MongoDBStore({
    uri: config.mongoose.uri,
    collection: 'mySessions'
});

store.on('error', function (err) {
    console.log(err);
});

app.use(session({
    secret: config.session.secret,
    key: config.session.key,
    cookie: config.session.cookie,
    store: store,
    resave: true,
    saveUninitialized: true
}));*/


var urlencodedParser = bodyParser.urlencoded({extended: false});

app = express();

