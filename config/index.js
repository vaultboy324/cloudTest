
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie');
var config = require('./config');
const mongoose = require("mongoose");
var session = require('express-session')
var MongoDBStore = require('connect-mongodb-session')(session);

var urlencodedParser = bodyParser.urlencoded({extended: false});

var app = express();
var store = new MongoDBStore({
   uri: config.mongoose.uri,
    collection: 'mySessions'
});

store.on('error', function (err) {
   console.log(err);
});

app.use('/public', express.static('public'));

app.set('view engine', 'ejs');

//app.use(express.bodyParser);
//app.use(express.cookieParser);

app.use(session({
    secret: config.session.secret,
    key: config.session.key,
    cookie: config.session.cookie,
    store: store,
    resave: true,
    saveUninitialized: true
}));

app.get('/', async function (request, response) {
    if(!request.session.isAutorized){
        return response.redirect("/auth");
    }
    request.session.authFailed = false;
    var meets = await require('../module/Meet').getMeets(request.session.login);
    response.render('home', {
        request: request,
        response: response,
        meets: meets
    });
});

app.get('/home', async function (request, response) {
    if(!request.session.isAutorized){
        return response.redirect("/auth");
    };
    request.session.authFailed = false;
    var meets = await require('../module/Meet').getMeets(request.session.login);
    response.render('home', {
        request: request,
        response: response,
        meets: meets
    });
});

app.get("/auth", function (request, response) {
    if(request.session.isAutorized){
        return response.redirect("/");
    }
    response.render('auth',{
        request: request,
        response: response
    });
});

app.post("/auth", urlencodedParser, async function (request, response) {
    let user =  await require('../module/User').getUserByLogPass({
        login: request.body.login,
        password: request.body.password
    });
    if(user){
        request.session.isAutorized = true;
        request.session.login = user.login;
        request.session.name = user.firstName;
        request.session.lastName = user.lastName;
        return response.redirect("/");
    }
    request.session.authFailed = true;
    return response.redirect("/auth");
});

app.get("/logout", urlencodedParser, function (request, response) {
   request.session.isAutorized = false;
   return response.redirect("auth");
});

app.get("/meets", urlencodedParser, async function (request, response) {

    var meets = await require('../module/Meet').getMeetsByUser(request.session.login);

    return response.render("meets",{
        request: request,
        response: response,
        meets: meets
    })
});

app.post("/meets", urlencodedParser, function (request, response) {
   return response.redirect("/");
});

app.get("/addMeet", urlencodedParser, function (request, response) {
    let errors = [];

    return response.render('addMeet', {
        request: request,
        response: response,
        errors: errors
    });
});

app.get("/addMeet/:lat/:lng", urlencodedParser, function (request, response) {
    return response.render('addMeet', {
        request: request,
        response: response
    });
});

app.post("/addMeet", urlencodedParser, function (request, response) {
    if(request.body.nameInput){
        require('../module/Meet').createMeet({
            name: request.body.nameInput,
            creator: request.session.login,
            lat: request.session.lat,
            lng: request.session.lng
        });
        return response.redirect('/');
    } else {
        let currentCoords = JSON.parse(request.body.jsonString);
        request.session.lat = currentCoords.lat;
        request.session.lng = currentCoords.lng;
        return response.redirect('/addMeet');
    }
});

app.get("/markers", urlencodedParser, async function (request, response) {
    let meets = await require('../module/Meet').getMeets();
    return response.json(meets);
});

app.get("/meets/:id", urlencodedParser, async function (request, response) {
    try {
        request.session.participant = await require('../module/Meet').getParticipantFlag({
            userLogin: request.session.login,
            _id: request.params.id
        });
    }
    catch (e) {
        request.session.participant = false;

    }
    try {
        var singleMeet = await require('../module/Meet').getSingleMeet(request.params.id);
    }
    catch (e) {
        var messages = [];
    }

    request.session.meetId = request.params.id;

    return response.render('currentMeet',{
       request: request,
       response: response,
       messages: singleMeet.messages
    });
});

app.post("/meets/:id", urlencodedParser, function(request, response) {
    if(request.body.join){
        require('../module/Meet').joinToTheMeet({
           meetId: request.session.meetId,
           userLogin: request.session.login
        });
    }
    else{
        require('../module/Meet').writeMessage({
            meetId: request.session.meetId,
            author: `${request.session.lastName} ${request.session.name}`,
            messageText: request.body.textInput

        });
    }
    return response.redirect(`/meets/${request.session.meetId}`);
});

app.get("/users", urlencodedParser, async function (request, response) {
    let users = await await require('../module/User').getAllUsers();
    return response.json(users);
});

app.get("/registration", urlencodedParser, function (request, response) {
    var errors = [];
    if(request.session.regErrors){
        errors = request.session.regErrors;
        request.session.regErrors = null;
    }

   return response.render("registration",{
     request: request,
     response: response,
       errors: errors
   });
});

app.post("/registration", urlencodedParser, async function (request, response) {
    let errors = await require('../module/User').validate({
       login: request.body.login,
       password: request.body.password,
       repeatPassword: request.body.repeatPassword,
       age: request.body.age,
       lastName: request.body.lastName,
       firstName: request.body.name
    });

    if(errors.length !== 0){
        request.session.regErrors = errors;
        return response.redirect("/registration");
    }

    require('../module/User').createUser({
        login: request.body.login,
        password: request.body.password,
        age: request.body.age,
        lastName: request.body.lastName,
        firstName: request.body.name
    });
    return response.redirect("/auth");
});

app.get("/user/:login", urlencodedParser, async function (request,response) {
    var user = await require('../module/User').getUserByLogin(request.params.login);
    console.log(user);
    return response.render("userPage",{
        request: request,
        response: response,
        user: user

    });
});

let port = process.env.port || 1337;

app.listen(port);
