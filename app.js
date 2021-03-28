const express = require('express');
const app = express();

const bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const User = require('./dbModels/authData');
const Hotel = require('./dbModels/hotelData');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

// const Cat = mongoose.model('Cat', { name: String });

// const kitty = new Cat({ name: 'uouo' });
// kitty.save().then(() => console.log('meow'));

// method overrirde for put , patch , delete ,etc
const methodOverride = require('method-override');
// const { type } = require('node:os');
app.use(methodOverride('_method'))


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

app.get('/hotel',(req,res)=>{
    res.render('hotel.ejs');
})

app.get('/addHotel',(req,res)=>{
    res.render('addHotel.ejs');
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

app.listen(3030,()=>{
    console.log('server running :) 3030');
})