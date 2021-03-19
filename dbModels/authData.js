const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// module.exports = mongoose.model('User', {
//     name: String,
//     password: String
// });

const userSchema = new Schema({
    name:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',userSchema);

