// importing modules
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
	email: {type: String, required:true, unique:true},
	hotelroom :[
		{
			hotel:{
				type : Schema.Types.ObjectId,
				ref : 'Hotel'
			},
			room: {
				type : Schema.Types.ObjectId,
				ref : 'Room'
			}
		}
    ]
});

// plugin for passport-local-mongoose
UserSchema.plugin(passportLocalMongoose);

// export User Schema
module.exports = mongoose.model("User", UserSchema);
