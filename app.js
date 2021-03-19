const express = require('express');
const app = express();

const bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

const User = require('./dbModels/authData');
const Message = require('./dbModels/message');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

// const Cat = mongoose.model('Cat', { name: String });

// const kitty = new Cat({ name: 'uouo' });
// kitty.save().then(() => console.log('meow'));

// method overrirde for put , patch , delete ,etc
const methodOverride = require('method-override')
app.use(methodOverride('_method'))


app.get('/',(req,res)=>{
    res.render('home.ejs');
})

app.get('/chat', async (req,res)=>{
    const all_message = await Message.find();
    res.render('chat.ejs',{all_message});
})

app.put('/chat', async (req,res)=>{
    
    const a = new Message(req.body);

    await a.save();

    const all_message = await Message.find();
    res.render('chat.ejs',{all_message});
})

app.patch('/auth',(req,res)=>{
    res.send('UPDATING SOMETHING');
});

app.get('/auth',(req,res)=>{
    res.render('auth.ejs');
});


const ffs = async (req,res,next) => {
    console.log('middle ware hit yooooooo');

    const {name ,password} = req.body;

    const a = await User.find({
        name : name ,
        password : password
    })

    if(a){
        res.send('ALREADY TAKEN :))))');
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


app.get('/cats',(req,res)=>{
    res.send('<h1>catspage</h1>');
})

app.get('/cats/:anyobj',(req,res)=>{
    const {anyobj} = req.params;
    res.send(`<h1>${anyobj}</h1>`);
});

app.listen(3030,()=>{
    console.log('server running :) 3030');
})