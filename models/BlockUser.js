const mongoose = require('mongoose');

const BlockUserSchema = new mongoose.Schema({
     user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    reported_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    is_blocked: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
    date: {
        type: String,
        default: null
    },
},
    { timestamps: true }
);

const BlockUser = mongoose.model('BlockUser', BlockUserSchema);
module.exports = BlockUser;