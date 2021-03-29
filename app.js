const express = require('express');
const app = express();

app.use( express.json() );       // to support JSON-encoded bodies
app.use( express.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// console passport = require('passport')

// const User = require('./dbModels/authData');
const Hotel = require('./dbModels/hotelData');
const Room = require('./dbModels/roomData');
const Comment = require('./dbModels/commentData');
const User = require('./dbModels/userData');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

// const Cat = mongoose.model('Cat', { name: String });

// const kitty = new Cat({ name: 'uouo' });
// kitty.save().then(() => console.log('meow'));

// method overrirde for put , patch , delete ,etc
const methodOverride = require('method-override');
// const { type } = require('node:os');
app.use(methodOverride('_method'))


// Passport 
// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// const LocalStrategy = require('passport-local').Strategy;
// const passport = require('passport');
// passport.use(new LocalStrategy(User.authenticate()));

// Registering
// app.post('/login', function(req, res) {
      
//     Users=new User({email: req.body.email, username : req.body.username});
  
//           User.register(Users, req.body.password, function(err, user) {
//             if (err) {
//                 console.log("not done");
//             //   res.json({success:false, message:"Your account couldnot be saved. Error: ", err}) 
//             }else{
//                 console.log("done");
//             //   res.json({success: true, message: "Your account has been saved"})
//             }
//           });
// });

// login
// userController.doLogin = function(req, res) {
//     if(!req.body.username){
//         res.json({success: false, message: "Username was not given"})
//     } else {
//         if(!req.body.password){
//         res.json({success: false, message: "Password was not given"})
//         }else{
//         passport.authenticate('local', function (err, user, info) {
//             if(err){
//                 console.log('error in auth login');
//             // res.json({success: false, message: err})
//             } else{
//             if (! user) {
//                 console.log('auth login done');
//                 // res.json({success: false, message: 'username or password incorrect'})
//             } else{
//                 req.login(user, function(err){
//                 if(err){
//                     res.json({success: false, message: err})
//                 }else{
//                     const token = jwt.sign({userId : user._id,
//                     username:user.username}, secretkey,
//                         {expiresIn: '24h'})
//                         console.log('done else');
//                     // res.json({success:true, message:"Authentication
//                     //     successful", token: token });
//                 }
//                 })
//             }
//             }
//         })(req, res);
//         }
//     }
//     };
    

app.get('/',(req,res)=>{
    res.render('home.ejs');
})

app.patch('/auth',(req,res)=>{
    res.send('UPDATING SOMETHING');
});

app.get('/auth',(req,res)=>{
    res.render('auth.ejs');
});

app.get('/hotels',async (req,res)=>{
    const allHotel = await Hotel.find();

    console.log(allHotel);

    // res.render('viewHotleDetails.ejs',{allHotel});
    res.render('hotels.ejs',{allHotel});
});

app.get('/hotel/:id', async (req,res)=>{
    const {id} = req.params;
    console.log('id = ',id);
    const aa = await Hotel.findById(id).populate(['room','comment']);
    console.log('h = ',aa);
    res.render('hotel.ejs',{aa});
})

app.get('/addHotel', async (req,res)=>{

    // await newRoom.save().then(()=>console.log(req.body));

    const allRoom = await Room.find();

    console.log(allRoom);

    res.render('addHotel.ejs',{allRoom});
})

app.get('/addRoom/:id', async (req,res)=>{
    const {id} = req.params;
    const aa = await Hotel.findById(id);
    res.render('addRoom.ejs',{aa});
})

app.post('/addRoom/:id',async (req,res)=>{
    const {id} = req.params;
    console.log('add room kkkkkkkkkkkkkkkkkkkkkkkkkkkkk\n');
    const  {roomName,roomSize,roomPrice} = req.body;
    const newRoom = new Room({
        roomName:roomName,
        roomSize:roomSize,
        roomPrice:roomPrice
    });

    await newRoom.save().then(()=>console.log(req.body));

    const one_room = await Room.findOne({roomName:roomName,
        roomSize:roomSize,
        roomPrice:roomPrice});

    console.log(one_room._id);


    const aa = await Hotel.findById(id);

    aa.room.push(one_room._id);

    // await h.populate('room');

    await aa.save();

    console.log('h final = ',aa);

    res.redirect(`/hotel/${id}`);
})

app.post('/addHotel', async (req,res)=>{
    const  {hotelName,hotelLocation,hotelRoomPrice} = req.body;
    const newHotel = new Hotel({
        name:hotelName,
        location:hotelLocation,
        price:hotelRoomPrice
    });

    await newHotel.save().then(()=>console.log(req.body));

    const allHotel = await Hotel.find();

    console.log(allHotel);

    res.render('hotels.ejs',{allHotel});
});

const ffs = async (req,res,next) => {

    const {name ,password} = req.body;

    console.log(name,' = ',password);

    const a = await User.findOne({
        name : name ,
        password : password
    })

    console.log(a);


    if(a){
        res.send('ALREADY TAKEN :)');
    }else{
        next();
    }
};

app.post('/auth',ffs, async (req,res)=>{
    const {name,password} = req.body;
    const newUser = new User({
        name:name,
        password:password
    });
    await newUser.save().then(()=>console.log(req.body));

    const allUser = await User.find();

    console.log(allUser);

    res.render('viewDetails.ejs',{allUser});
})

app.post('/addComment/:id', async (req,res)=>{
    const {id} = req.params;
    console.log('add room kkkkkkkkkkkkkkkkkkkkkkkkkkkkk\n');
    const  {author,body,stars} = req.body;
    const newComment = new Comment({
        author:author,
        body:body,
        stars:stars
    });

    await newComment.save().then(()=>console.log(req.body));

    const one_comment = await Comment.findOne({
        author:author,
        body:body,
        stars:stars
    });

    console.log(one_comment._id);


    const aa = await Hotel.findById(id);

    aa.comment.push(one_comment._id);

    // await h.populate('room');

    await aa.save();

    console.log('h final = ',aa);

    res.redirect(`/hotel/${id}`);
    // res.render('hotel.ejs',{aa});
});

app.get('/cart',(req,res)=>{
        
});

app.listen(3030,()=>{
    console.log('server running :) 3030');
})