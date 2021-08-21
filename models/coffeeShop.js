const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coffeeShopSchema = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    name: String,
    price: String,
    description: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    unsplash: [String],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
    // location: String
});

// coffeeShopSchema.virtual('averageRating').get(async function() {
//     let num = 0;
//     const shop = await this.populate('reviews', 'rating');
//     for(let i = 0; i < shop.reviews.length; i++){
//         num += shop.reviews[i].rating;
//     }
//     num = num / shop.reviews.length;
//     console.log(num);
//     return num;
// });

module.exports = mongoose.model('CoffeeShop', coffeeShopSchema);