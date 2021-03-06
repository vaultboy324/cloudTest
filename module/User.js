const mongoose = require("mongoose");
var env = require('dotenv').load;
var config = require('../config/config');

module.exports = {
    createUser: function (oUserContext) {
        mongoose.connect(config.mongoose.uri,{
           useNewUrlParser: true,
        });

        let userScheme = require('../Model/models').userScheme;
        let User = mongoose.model("users", userScheme);

        let user = new User({
           login: oUserContext.login,
           password: oUserContext.password,
           age: oUserContext.age,
           lastName: oUserContext.lastName,
           firstName: oUserContext.firstName,
            friends: [],
            friendRequests: []
        });
        user.save();
    },
    getAllUsers: async function(){
        mongoose.connect(config.mongoose.uri,{
            useNewUrlParser: true,
        });

        let userScheme = require('../Model/models').userScheme;
        let User = mongoose.model("users", userScheme);

        let users = await User.find({}).select({"login": 1, "_id": 0}).exec();
        return users;
    },
    getUserByLogin: async function(userLogin){
        mongoose.connect(config.mongoose.uri,{
            useNewUrlParser: true,
        });

        let userScheme = require('../Model/models').userScheme;
        let User = mongoose.model("users", userScheme);

        let user = await User.findOne({login: userLogin}).exec();
        return user;
    },
    validate: async function (formData) {
        errors = [];
        let password = formData.password;
        let repeatPassword = formData.repeatPassword;
        if(password !== repeatPassword){
            let error = "Пароли не совпадают";
            errors.push(error);
        }
        if(formData.age > 100){
            let error = "Некорректный возраст";
            errors.push(error);
        }

        let user = await this.getUserByLogin(formData.login);
        if(user){
            let error = "Пользователь с данным логином уже существует";
            errors.push(error);
        }

        formData.firstName.toLowerCase();
        formData.lastName.toLowerCase();


        formData.firstName.charAt(0).toUpperCase();
        formData.lastName.charAt(0).toUpperCase();

        return errors;
    },
    getUserByLogPass: async function(oAuthContext){
        mongoose.connect(config.mongoose.uri,{
            useNewUrlParser: true,
        });

        let userScheme = require('../Model/models').userScheme;
        let User = mongoose.model("users", userScheme);

        let user = await User.findOne({
           login: oAuthContext.login,
           password : oAuthContext.password
        }).exec();

        return user;
    }
};