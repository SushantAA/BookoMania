<<<<<<< HEAD
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

module.exports = mongoose.model('User',userSchema);

=======
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

>>>>>>> f2c1f09bc077b27790ef1b9b84973524df3042f3
