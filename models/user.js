const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    email: {
        type: String,
        required: true,
        unique: true
    },
    profilePicture: {
        url: String,
        filename: String
    },
    coffeeShops: [{type: Schema.Types.ObjectId, ref: 'Coffee Shop'}],
    reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);

// finds a user and checks if the password is correct
// userSchema.statics.findAndValidate = async function (username, password) {
//     const user = await this.findOne({username});
//     if(!user) return false;
//     const isValid = await bcrypt.compare(password, user.password);
//     return isValid ? user : false;
// };

// // before saving password to the database, hash it
// userSchema.pre('save', async function(next){
//     if(!this.isModified('password')) return next();
//     this.password = await bcrypt.hash(this.password, 12);
//     next();
// });

// // before saving password to the database, hash it
// userSchema.pre('save', async function(next){
//     if(this.profilePicture.url) return next();
//     this.profilePicture = {
//         url: 'https://res.cloudinary.com/christianjosuebt/image/upload/w_200,h_200,c_limit,e_blur:400,o_90,b_black/l_text:arial_80:®,ar_1:1,c_lfill,o_60,co_rgb:ffffff,b_rgb:000000,r_max/v1619026522/coffeeShops/smile_bpkzip.svg',
//         filename: 'smile_bpkzip'
//     };
//     next();
// });

// module.exports = mongoose.model('User', userSchema);