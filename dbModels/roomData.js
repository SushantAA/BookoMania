const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
    roomName:{
        type:String,
        require:true
    },
    roomSize:{
        type:Number,
        require:true
    },
    roomPrice:{
        type:Number,
        require:true
    }
});

module.exports = mongoose.model('Room',roomSchema);

