const express = require('express');
const router = express.Router();
const Hotel = require('../models/hotel');
const catchAsync = require('../utilities/catchAsync');
const expresError = require('../utilities/expressError');
const {reviewSchema}  = require('../schemas');
const Review = require('../models/reviews');
const Joi = require('joi');
const { isLogedin } = require('../middleware');
var multer  = require('multer');

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); 

const  {storage, cloudinary} = require('../cloudinary/index');

var upload = multer({ storage });

const validatehotel = (req,res,next) => {
    const HotelSchema = Joi.object({
        // Hotel : Joi.object({
            title : Joi.string().required(),
            price : Joi.number().required().min(0),
            // image :  Joi.string().required(),
            location : Joi.string().required(),
            discription : Joi.string().required()
        // }).required()
    });

    const {error} = HotelSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new expresError(msg,400);
    }else{
        next();
    }

}

const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new expresError(msg,400);
    }else{
        next();
    }
}

const isAuthor = async (req,res,next) =>{
    const {id} = req.params;
    const aa = await Hotel.findById(id);    
    if(!aa.author.equals(req.user._id)){
        req.flash('error','You don\'t have permission to edit' )
        return  res.redirect(`/hotel/${id}`);
    }

    next();
}

const isReviewAuthor = async (req,res,next) =>{
    const {reviewId , id} = req.params;
    const aa = await Review.findById(reviewId);    
    if(!aa.author.equals(req.user._id)){
        req.flash('error','You don\'t have permission to edit' )
        return  res.redirect(`/hotel/${id}`);
    }

    next();
}

router.get('/new',isLogedin,catchAsync( async (req,res) => {
    res.render('hotel/new');
}));

router.get('/', catchAsync( async (req,res) => {
    const all_cg = await Hotel.find({});
    // res.send(all_cg);
    res.render('hotel/index',{all_cg})
}));

router.get('/map', catchAsync( async (req,res) => {
    const all_cg = await Hotel.find({});
    // res.send(all_cg);
    res.render('hotel/map',{all_cg})
}));

router.post('/', isLogedin ,upload.array('image'),validatehotel ,catchAsync( async (req,res) => {
    
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()

    // res.send(geoData.body.features[0].geometry.coordinates);

    // res.send('ok>>>>>>');
    const a = await Hotel(req.body);
    a.geometry = geoData.body.features[0].geometry;
    a.image = req.files.map(f => ({ url: f.path,filename: f.filename }));
    a.author = req.user._id;
    await a.save();
    req.flash('success','successfully made new Hotel');
    res.redirect('/hotel');
}));

// router.post('/',  upload.array('image')  , (req,res) => {
//     res.send('it worked ?');
// });

router.put('/:id',isAuthor, upload.array('image') ,catchAsync( async(req,res,next) => {
    const {id} = req.params;
    const a = await Hotel.findByIdAndUpdate(id,req.body);
    
    if(req.body.deleteImage){

        for(let ai of req.body.deleteImage){
            await cloudinary.uploader.destroy(ai);
        }

        await a.updateOne({ $pull: { image: { filename: { $in: req.body.deleteImage } }} })
    }

    const arr = req.files.map(f => ({ url: f.path,filename: f.filename }));
    a.image.push(...arr);
    await a.save();
    req.flash('success','succesfully updated Hotel');
    res.redirect(`/hotel/${id}`);
}));


router.get('/:id/edit',isLogedin , isAuthor ,catchAsync( async (req,res) => {
    const {id} = req.params;
    const a = await Hotel.findById(id);
    res.render('hotel/edit',{a});
}));

router.post('/:hid/book', async (req,res) => {
    const {hid} = req.params;
    const {num} = req.body;
    const hh = await Hotel.findById(hid);
    res.render('pay',{hh,hid,num})
});

router.post('/:hid/done', async (req,res) => {
    const {hid} = req.params;
    const h = await Hotel.findById(hid);
    let a =  req.user;
    a.booking.push(hid);
    await a.save();
    res.redirect('/me');
});


router.delete('/:id',isAuthor ,catchAsync( async (req,res) => {
    const {id} = req.params;
    await Hotel.findByIdAndDelete(id);
    req.flash('success','succesfully deleted Hotel');
    res.redirect(`/hotel`);
}));

router.get('/:id', catchAsync( async (req,res) => {
    const {id}  = req.params;
    const a = await (await Hotel.findById(id).populate({
        path : 'reviews',
        populate : {
            path : 'author'
        }
    }).populate('author'));
    if(!a){
        req.flash('error','cannot find Hotel');
        return  res.redirect('/hotel');
    }
    res.render('hotel/show_detail',{a});
}));

module.exports = router;