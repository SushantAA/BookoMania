const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hotelSchema = new Schema({
    name:{
        type:String,
        require:true
    },
    location:{
        type:String,
        require:true
    },
    price :{
        type:Number,
        require:true
    }
});

module.exports = mongoose.model('Hotel',hotelSchema);

