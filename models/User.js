const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        lowercase:true,
        unique: true,
        trim: true,
        match: /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {
        type: String,
        require: true
    },
    phone_number: {
        type: Number,
        require: true
    },
    user_image: {
        type: String,
        require: true,
        default: null
    },

    cover_image: {
        type: String,
        require: false,
        default: null
    },
    user_gender: {
        type: "string",
        enum: ["male", "female", "Male", "Female","MALE","FEMALE", "couple", "Couple", "COUPLE","other", "Other", "Non-Binary", "non-binary", ""],
        lowercase:true,
        default: "",
    },
    user_description: {
        type: String,
        required: false,
        default: null
    },
    user_photos: [],
    // prefences:{

    //     interest: {
    //         type: String,
    //         default: null 
    //     },
    //     spotify_list:[]

    // },


    verification_code: {
        type: Number,
        default: null
    },
    is_verified: {
        type: Number,
        default: 0
    },
    user_is_profile_complete: {
        type: Number,
        default: 0,
        trim: true,
    },
    
     
    is_blocked: {
        type: Number,
        default: 0
    },
    user_authentication: {
        type: String,
        required: false,
        default: null,
    },
    user_social_token: {
        type: String,
        require: false,
        trim: true,
        default: null,
    },
    user_social_type: {
        type: String,
        require: false,
        trim: true,
        default: null,
    },
    user_device_type: {
        type: String,
        required: false,
        trim: true,
        default: null
    },
    user_device_token: {
        type: String,
        required: false,
        trim: true,
        default: null
    },
    is_notification: {
        type: Boolean,
        default: 1,
    },
     friends: [],
    pending_requests: []
},
    { timestamps: true }
);


// Here generate Auth Token for social login
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({
        email: user.email,
        userId: user._id
    },
        process.env.JWT_KEY);
    user.user_authentication = token;
    await user.save();
    //console.log("tokeeen--->", token);
    return token;
}

const User = mongoose.model('User', userSchema);
module.exports = User;