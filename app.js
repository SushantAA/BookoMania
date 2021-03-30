const express = require('express');
const app = express();
const passport = require('passport');
const localStrategy = require('passport-local');

app.use( express.json() );       // to support JSON-encoded bodies
app.use( express.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const Hotel = require('./dbModels/hotelData');
const Room = require('./dbModels/roomData');
const Comment = require('./dbModels/commentData');
const User = require('./dbModels/User');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

// method overrirde for put , patch , delete ,etc
const methodOverride = require('method-override');
app.use(methodOverride('_method'))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


let userId = undefined ;
let redirectUrl = undefined;

const isloggedin = async (req,res,next) => {
    // console.log('req.isAuthenticated =' ,req.isAuthenticated());
    if(userId){
         next();
    }else{
        userId = undefined;
       return res.redirect('/login');
    }
}

const isHotelAuthor = async (req,res,next) => {
    const {hid} = req.params;
    const aa = await Hotel.findById(hid);

    const a = String(userId);
    const b = String(aa.hotelauthor);

    if(a==b){
         next();
    }else{
       return res.redirect('/');
    }
}

const isCommentAuthor = async (req,res,next) => {
    const {hid,cid} = req.params;
    const aa = await Comment.findById(cid);
    console.log(userId,'==========AAAAAAAAAAAAAAAAA===============',aa.author);
    
    const a = String(userId);
    const b = String(aa.author);
    console.log(`a=${a}`);
    console.log(`b=${b}`);
    if(a==b){
    // if(userId == aa.author){
         next();
         return;
    }else{
       return res.redirect(`/hotel/${hid}`);
    }
}


app.get('/me', isloggedin ,async (req,res)=>{
    redirectUrl = '/me';
    // res.send('pppppp');
    console.log('user =',req.user);

    const u = await  User.findById(userId);

    if(u){
        res.render('user.ejs',{u});
    }else{
    res.send('sssss = ' + u);
    }
});

app.get('/register',(req,res)=>{
    res.render('register.ejs');
})

app.post('/register',async(req,res)=>{
    console.log('register user =',req.user);
    console.log('ppppppppppppppppppppppppppppppp\n');
    const {userName,password,email} = req.body;
    const user = new User({email:email,username:userName});
    const newUser = await User.register(user,password);
    console.log('newUser =',newUser);
    res.redirect('/');
})

app.get('/login',(req,res)=>{
    // console.log('login user =',passport.user);
    res.render('login.ejs');
})

app.post('/login',passport.authenticate('local',{failureFlash:true   ,failureRedirect:'/login'}),(req,res)=>{
 // logged
 console.log('req.user =', req.user);
 userId = req.user._id;
    // res.send(req.user.username);
    if(redirectUrl){
        res.redirect(redirectUrl);
    }else{
    res.redirect('/');
    }
});

app.get('/logout',(req,res)=>{
    userId = undefined;
    req.logout();
    res.redirect('/');
});

app.get('/',(req,res)=>{
    res.render('home.ejs');
})

app.get('/hotels',async (req,res)=>{
    const allHotel = await Hotel.find();

    console.log(allHotel);

    res.render('hotels.ejs',{allHotel});
});

app.get('/hotel/:hid', async (req,res)=>{
    const {hid} = req.params;
    console.log('1 id = ',hid);
    const aa = await Hotel.findById(hid).populate(['room','comment']);
    console.log('h = ',aa);
    res.render('hotel.ejs',{aa});
})

app.get('/addHotel', isloggedin,async (req,res)=>{
redirectUrl = '/addHotel';
    const allRoom = await Room.find();

    console.log(allRoom);

    res.render('addHotel.ejs',{allRoom});
})

app.get('/addRoom/:hid', isloggedin , isHotelAuthor ,async (req,res)=>{
    const {hid} = req.params;
    const aa = await Hotel.findById(hid);
    res.render('addRoom.ejs',{aa});
})


app.post('/addRoom/:id',async (req,res)=>{

    console.log('add room ========== post');

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

    await aa.save();

    console.log('h final = ',aa);

    res.redirect(`/hotel/${id}`);
})

app.post('/addHotel',async (req,res)=>{
    console.log('add hotel ========== post');

    const  {hotelName,hotelLocation,hotelRoomPrice} = req.body;
    const newHotel = new Hotel({
        hotelauthor:userId,
        name:hotelName,
        location:hotelLocation,
    });

    await newHotel.save().then(()=>console.log(req.body));

    const allHotel = await Hotel.find();

    console.log(allHotel);

    res.render('hotels.ejs',{allHotel});
});

app.post('/addComment/:hid',isloggedin,async (req,res)=>{
    
    console.log('add comment ========== post');

    const {hid} = req.params;
redirectUrl = `/addComment/${hid}`;
    console.log('add room kkkkkkkkkkkkkkkkkkkkkkkkkkkkk\n');
    const  {author,body,stars} = req.body;
    const newComment = new Comment({
        author:userId,
        body:body,
        stars:stars
    });

    await newComment.save().then(()=>console.log(req.body));

    const one_comment = await Comment.findOne({
        author:userId,
        body:body,
        stars:stars
    });

    console.log(one_comment._id);


    const aa = await Hotel.findById(hid);

    aa.comment.push(one_comment._id);
    await aa.save();

    console.log('h final = ',aa);

    res.redirect(`/hotel/${hid}`);
});

app.get('/addHotel/:hid',isloggedin,async (req,res)=>{
    const {hid} = req.params;
redirectUrl = `/addHotel/${hid}`;

    const aa = await Hotel.findById(hid);
    res.render('hoteEdit.ejs',{aa});
})

app.patch('/addHotel/:hid',async  (req,res)=>{

    const {hotelName,hotelLocation} = req.body;
    const {hid} = req.params;
    const aa = await Hotel.findById(hid);
    aa.location = hotelLocation;
    aa.name = hotelName;
    await aa.save();
    res.redirect(`/hotel/${hid}`);
    // res.render('hoteEdit.ejs',{aa});
    // res.send('patch of hotel');
})


app.post('/userroom/:hid/:rid', isloggedin ,async (req,res)=>{
    const {hid,rid} = req.params;
    redirectUrl = `/userroom/${hid}/${rid}`;

    const a = {hotel : hid, room : rid};

    const u = await User.findById(userId);

    u.hotelroom.push(a);

    await u.save();

    res.redirect('/me');

    res.redirect(`/hotel/${hid}`);
})


app.delete('/room/:hid/:id',isloggedin,isHotelAuthor,async (req,res)=>{
    const {hid,id} = req.params;
    redirectUrl = `/room/${hid}/${rid}`;

    console.log('room delete id =',id);
    await Room.findByIdAndDelete(id);

    // const h = Hotel.findById(hid);
    // // h.room.filter(id);
    // await h.save();

    res.redirect(`/hotel/${hid}`);
})


app.delete('/comment/:hid/:cid', isloggedin ,isCommentAuthor,async(req,res)=>{
    const {hid,cid} = req.params;
    console.log('=============uuuuuuu=================uuuu============');
    console.log('comment delete id =',cid);
    await Comment.findByIdAndDelete(cid);

    // const h = Hotel.findById(hid);
    // h.comment.filter(cid);
    // h.save(); 

    res.redirect(`/hotel/${hid}`);
})


app.delete('/hotel/:hid',isloggedin,isHotelAuthor,async (req,res)=>{
    const {hid} = req.params;
    redirectUrl = `/hotel/${hid}`;
    console.log('hotel delete id =',hid);
    await Hotel.findByIdAndDelete(hid);
    res.redirect('/hotels');
})


app.listen(3030,()=>{
    console.log('server running :) 3030');
})