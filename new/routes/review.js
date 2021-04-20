const express = require('express');
const router = express.Router({mergeParams : true});
const Hotel = require('../models/Campground');
const catchAsync = require('../utilities/catchAsync');
const expresError = require('../utilities/expressError');
const {reviewSchema}  = require('../schemas');
const Review = require('../models/reviews')
const { isLogedin } = require('../middleware');

const validatecg = (req,res,next) => {
    const CampgroundSchema = Joi.object({
        // Campground : Joi.object({
            title : Joi.string().required(),
            price : Joi.number().required().min(0),
            image :  Joi.string().required(),
            location : Joi.string().required(),
            discription : Joi.string().required()
        // }).required()
    });

    const {error} = CampgroundSchema.validate(req.body);

    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        console.log(msg);
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
        return  res.redirect(`/cg/${id}`);
    }

    next();
}


const validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body);
    
    if(error){
        const msg = error.details.map(el=>el.message).join(',');
        console.log(msg);
        throw new expresError(msg,400);
    }else{
        next();
    }
}


router.post('/', isLogedin ,async (req,res)=>{
    console.log("sdddddddddddddd");
    const id = req.params.id;
    const Campground = await Hotel.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;

    Campground.reviews.push(review);

    console.log( 'review sdfsdfsdf = ' ,review);
    console.log('camp sdfsdfsdfsd = ',Campground);

    await review.save();
    await Campground.save();

    req.flash('success','succesfully add review to Hotel');

    res.redirect(`/cg/${Campground._id}`);

});

router.delete('/:reviewId',isReviewAuthor,async (req,res) => {
    const {id,reviewId} = req.params;
    console.log('eeeeeeeeeeeeeeeeeeeeeee\n');
    await Hotel.findByIdAndUpdate(id,{ $pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','succesfully deleted');
    res.redirect(`/cg/${id}`);
    // res.send ('sdfsfdf');
});

module.exports = router;