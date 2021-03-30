const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    author:{
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    body:{
        type:String,
        require:true
    },
    stars:{
        type:Number,
        require: true
    }
});

module.exports = mongoose.model('Comment',commentSchema);

