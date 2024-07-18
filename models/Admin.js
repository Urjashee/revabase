const mongoose = require('mongoose');


const adminSchema = new mongoose.Schema({
    user_name: {
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
    user_image: {
        type: String,
        require: true,
        default: null
    },
    is_verified: {
        type: Number,
        default: 1
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
    role:{
        type: String,
        // enum: ["Admin", "ADMIN", "admin", "User", "USER", "user"],
        default: "admin"
    },

    
},
    { timestamps: true }
);
const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;