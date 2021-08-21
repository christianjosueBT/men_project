const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    body: String,
    rating: Number
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.virtual('starRating').get(function() {
    let num = 0;
    if(this.rating < 1) num = this.rating * 300 + 100;
    else if( this.rating < 2) num = (this.rating % 1) * 300 + 600;
    else if( this.rating < 3) num = (this.rating % 2) * 300 + 1100;
    else if( this.rating < 4) num = (this.rating % 3) * 300 + 1600;
    else if( this.rating <= 5) num = (this.rating % 4) * 300 + 2100;
    return num;
});

module.exports = mongoose.model('Review', reviewSchema);