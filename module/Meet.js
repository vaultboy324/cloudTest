const mongoose = require("mongoose");
var config = require('../config/config');

module.exports = {
    createMeet: function (oMeetContext) {
        mongoose.connect(config.mongoose.uri,{
            useNewUrlParser: true
        });

        let meetScheme = require('../Model/models').meetScheme;
        let Meet = mongoose.model("meets", meetScheme);
        let meet = new Meet({
            name: oMeetContext.name,
            address: oMeetContext.address,
            creator: oMeetContext.creator,
            participants: [oMeetContext.creator],
            lat: oMeetContext.lat,
            lng: oMeetContext.lng,
            messages: []
        });

        meet.save(function (err) {
           if(!err){
               console.log("Встреча добавлена");
           }
           else throw err;
        });
    },
    getMeets: async function () {
        mongoose.connect(config.mongoose.uri,{
            useNewUrlParser: true
        });

        let meetScheme = require('../Model/models').meetScheme;
        let Meet = mongoose.model("meets", meetScheme);

        try{
            var meets = await Meet.find({}).exec();
            return meets;
        } catch (e) {
            return e;
        }
    },
    getParticipantFlag: async function(oParams){
        var sUserLogin = oParams.userLogin;
        var sId = oParams._id;

        mongoose.connect(config.mongoose.uri,{
            useNewUrlParser: true
        });
        let meetScheme = require('../Model/models').meetScheme;
        let Meet = mongoose.model("meets", meetScheme);

        var ObjectId = mongoose.Types.ObjectId;
        var queryId = ObjectId(sId);

        try{
            var meet = await Meet.findById(queryId).exec();
            if(meet.participants.indexOf(sUserLogin) !== -1){
                return true;
            }
            return false;
        } catch (e) {
            throw e;
        }
    },
    getSingleMeet: async function(meetId){
        mongoose.connect(config.mongoose.uri,{
            useNewUrlParser: true
        });
        let meetScheme = require('../Model/models').meetScheme;
        let Meet = mongoose.model("meets", meetScheme);

        var ObjectId = mongoose.Types.ObjectId;
        var queryId = ObjectId(meetId);

        try{
           let meet  = await Meet.findById(queryId).exec();
           return meet;
        } catch (e) {
            throw e;
        }
    },
    writeMessage: async function (oMeetContext) {
        mongoose.connect(config.mongoose.uri,{
            useNewUrlParser: true
        });
        if(oMeetContext.messageText !== ""){
            var singleMeet = await this.getSingleMeet(oMeetContext.meetId);
            singleMeet.messages.push({
               author: oMeetContext.author,
               text: oMeetContext.messageText
            });
            singleMeet.save();
        }
    },
    joinToTheMeet: async function (oMeetContext) {
        mongoose.connect(config.mongoose.uri,{
            useNewUrlParser: true
        });
        var singleMeet = await this.getSingleMeet(oMeetContext.meetId);
        singleMeet.participants.push(oMeetContext.userLogin);
        singleMeet.save();
    },
    getMeetsByUser: async function(userLogin){
        mongoose.connect(config.mongoose.uri,{
            useNewUrlParser: true
        });

        let meetScheme = require('../Model/models').meetScheme;
        let Meet = mongoose.model("meets", meetScheme);

        try{
            var meets = await Meet.find({participants: userLogin}).exec();
            return meets;
        } catch (e) {
            return e;
        }
    }
};