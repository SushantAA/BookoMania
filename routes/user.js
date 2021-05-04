const express = require('express');
const passport = require('passport');
const Hotel = require('../models/hotel');
const router =  express.Router();
const User = require('../models/user');
const catchAsync = require('../utilities/catchAsync');

router.get('/register',(req,res)=>{
    res.render('users/register');
});

router.post('/register', catchAsync (async ( req, res) => {
    try{
        const {email , username , password} = req.body;
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser , err => {
            if(err) return next(err);
            req.flash('success','welcome to Bookomania');
            res.redirect('/hotel');
        });
    }catch(e){
        req.flash('error',e.message);
        res.redirect('register');
    }
}));

router.get('/login',(req,res)=>{
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', { failureFlash : true , failureRedirect : '/login' }) ,catchAsync (async ( req, res) => {
    req.flash('success','welcome back');
    const redirectUrl = req.session.returnTo || '/hotel';
    // delete req.session.returnTo;
    res.redirect(redirectUrl);
}));

router.get('/me',async (req,res)=>{
    const user = req.user;
    await user.populate(['booking']);
    let arr = [];
    for( a of user.booking){
        const b = await Hotel.findById(a);
        arr.push(b);
    }
    res.render('users/me',{user,arr});
});

router.get('/logout',(req,res)=> {
    req.logout();
    req.flash('success',"good bye");
    res.redirect('/hotel');
})

module.exports = router;