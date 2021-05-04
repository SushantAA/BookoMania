const express = require('express');
const router = express.Router({mergeParams : true});
const Hotel = require('../models/hotel');
const catchAsync = require('../utilities/catchAsync');
const expresError = require('../utilities/expressError');
const {reviewSchema}  = require('../schemas');
const Review = require('../models/reviews')
const { isLogedin } = require('../middleware');

const validatehotel = (req,res,next) => {
    const HotelSchema = Joi.object({
        // Hotel : Joi.object({
            title : Joi.string().required(),
            price : Joi.number().required().min(0),
            image :  Joi.string().required(),
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



const isReviewAuthor = async (req,res,next) =>{
    const {reviewId , id} = req.params;
    const aa = await Review.findById(reviewId);    
    if(!aa.author.equals(req.user._id)){
        req.flash('error','You don\'t have permission to edit' )
        return  res.redirect(`/hotel/${id}`);
    }

    next();
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


router.post('/', isLogedin ,async (req,res)=>{
    const id = req.params.id;
    const hh = await Hotel.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    hh.reviews.push(review);



    await review.save();
    await hh.save();


    req.flash('success','succesfully add review to Hotel');

    res.redirect(`/hotel/${hh._id}`);

});

router.delete('/:reviewId',isReviewAuthor,async (req,res) => {
    const {id,reviewId} = req.params;
    await Hotel.findByIdAndUpdate(id,{ $pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','succesfully deleted');
    res.redirect(`/hotel/${id}`);
    // res.send ('sdfsfdf');
});

module.exports = router;