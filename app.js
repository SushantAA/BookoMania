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

const isloggedin = (req,res,next) => {
    console.log('req.isAuthenticated =' ,req.isAuthenticated());
    if(req.isAuthenticated()){
         next();
    }else{
       return res.redirect('/login');
    }
}

app.get('/register',(req,res)=>{
    res.render('register.ejs');
})

app.post('/register',async(req,res)=>{
    console.log('ppppppppppppppppppppppppppppppp\n');
    const {userName,password,email} = req.body;
    const user = new User({email:email,username:userName});
    const newUser = await User.register(user,password);
    console.log('newUser =',newUser);
    res.redirect('/');
})

app.get('/login',(req,res)=>{
    res.render('login.ejs');
})

app.post('/login',passport.authenticate('local',{failureFlash:true   ,failureRedirect:'/login'}),(req,res)=>{
 // logged
    res.redirect('/');
});

app.get('/logout',(req,res)=>{
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

app.get('/hotel/:id', async (req,res)=>{
    const {id} = req.params;
    console.log('id = ',id);
    const aa = await Hotel.findById(id).populate(['room','comment']);
    console.log('h = ',aa);
    res.render('hotel.ejs',{aa});
})

app.get('/addHotel', async (req,res)=>{

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
        name:hotelName,
        location:hotelLocation,
        price:hotelRoomPrice
    });

    await newHotel.save().then(()=>console.log(req.body));

    const allHotel = await Hotel.find();

    console.log(allHotel);

    res.render('hotels.ejs',{allHotel});
});

app.post('/addComment/:id',async (req,res)=>{
    
    console.log('add comment ========== post');

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
});

app.delete('/room/:hid/:id', async (req,res)=>{
    const {hid,id} = req.params;
    console.log('room delete id =',id);
    await Room.findByIdAndDelete(id);

    // const h = Hotel.findById(hid);
    // // h.room.filter(id);
    // await h.save();

    res.redirect(`/hotel/${hid}`);
})

app.delete('/comment/:hid/:id', async(req,res)=>{
    const {hid,id} = req.params;
    console.log('comment delete id =',id);
    await Comment.findByIdAndDelete(id);

    // const h = Hotel.findById(hid);
    // h.comment.filter(id);
    //  h.save();

    res.redirect(`/hotel/${hid}`);
})


app.delete('/hotel/:id',async (req,res)=>{
    const {hid,id} = req.params;
    console.log('hotel delete id =',id);
    await Hotel.findByIdAndDelete(id);
    res.redirect('/hotels');
})


app.listen(3030,()=>{
    console.log('server running :) 3030');
})