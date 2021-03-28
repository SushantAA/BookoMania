const mongoose = require('mongoose');
const { number } = require('prop-types');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    type:{
        type:String,
        require:true
    },
    roomSize:{
        type:Number,
        require:true
    },
    price:{
        type:Number,
        require:true
    }
});

// roomSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Room',roomSchema);

