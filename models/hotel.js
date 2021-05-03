const mongoose = require('mongoose');
const Review = require('./reviews');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get( function () {
    return this.url.replace('/upload','/upload/w_200');
});

const opt = { toJSON: { virtuals: true } };

const HotelSchema = new Schema({
    title : String,
    price : Number,
    image : [ImageSchema],

    geometry: {
        type:{
            type:String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    discription : String,
    location : String,
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
},opt);

HotelSchema.virtual('properties.popUpMarkup').get( function () {
    return `<strong><a href ="/hotel/${this._id}" >${this.title}</a></strong>
            <p>${this.location}</p>`;
})

HotelSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Hotel',HotelSchema);