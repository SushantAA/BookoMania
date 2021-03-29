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
        type:Number
    },
    room :[
        {
            type : Schema.Types.ObjectId,
            ref : 'Room'
        }
    ],
    comment :[
        {
            type : Schema.Types.ObjectId,
            ref : 'Comment'
        }
    ]
});

module.exports = mongoose.model('Hotel',hotelSchema);

