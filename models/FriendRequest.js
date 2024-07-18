const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
    sender_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    reciever_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    request_status: {
        type: Number,
        default: 0
    },
        is_heart: {
        type: Boolean,
        default: 0
    }
},
    { timestamps: true }
);

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
module.exports = FriendRequest;