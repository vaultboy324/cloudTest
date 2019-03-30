const mongoose = require("mongoose");

const userAuthScheme = new mongoose.Schema({
    login: String,
    password: String,
});

const meetScheme = new mongoose.Schema({
   // _id: mongoose.Types.ObjectId,
   name: String,
    participants : [],
    messages: [],
    creator: String,
    lat: Number,
    lng: Number
});

const userScheme = new mongoose.Schema({
   login: String,
   password: String,
   age: Number,
   lastName: String,
   firstName: String,
    friends: Array,
    friendRequests: []
});

module.exports = {
//  authScheme : userAuthScheme,
    meetScheme : meetScheme,
    userScheme: userScheme
};