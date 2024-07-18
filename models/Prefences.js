const mongoose = require('mongoose');

const PrefencesSchema = new mongoose.Schema({
    // user_id: {
    //     type: String
    // },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    interest: {
        type: "string",
        enum: ["male", "female", "Male", "Female","MALE","FEMALE", "couple", "Couple", "COUPLE","other", "Other", "Non-Binary", "non-binary", ""],
        lowercase:true
    },
    spotify_list: []
},
    { timestamps: true }
);

const Prefences = mongoose.model('Prefences', PrefencesSchema);
module.exports = Prefences;