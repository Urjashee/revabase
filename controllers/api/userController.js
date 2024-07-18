const User = require("../../models/User");
const Chat = require("../../models/Chat");
const Prefences = require("../../models/Prefences");
const FriendRequest = require("../../models/FriendRequest");
var mongoose = require("mongoose");


//** Get User Profile **//
const userProfile = async (req, res) => {
    try {

        const user = await User.findById(req.params.id)
        const preferences = await Prefences.findOne({user_id: req.params.id}).select('interest spotify_list')
        // console.log(user)
        if (!user) {
            res.status(404).json({
                status: 0,
                message: "user not found",
            })
        }
        res.status(200).json({
            status: 1,
            message: "user found",
            // data: user,
            // prefences
             data: {
                                       friends: user.friends,
                                        pending_requests: user.pending_requests,
                                        user_photos: user.user_photos,
                                        user_image: user.user_image,
                                        _id: user._id,
                                        username: user.username,
                                        phone_number: user.phone_number,
                                        user_image: user.user_image,
                                        user_description: user.user_description,
                                        cover_image: user.cover_image,
                                        user_gender: user.user_gender,
                                        verification_code: user.verification_code,
                                        is_verified: user.is_verified,
                                        user_is_profile_complete: user.user_is_profile_complete,
                                        is_blocked: user.is_blocked,
                                        user_authentication: user.user_authentication,
                                        user_social_token: user.user_social_token,
                                        user_social_type: user.user_social_type,
                                        user_device_type: user.user_device_type,
                                        user_device_token: user.user_device_token,
                                        is_notification: user.is_notification,
                                        email: user.email,
                                        password: user.password,
                                        createdAt: user.createdAt,
                                        updatedAt: user.updatedAt,
                                        __v: user.__v,
					preferences

                                    }

        })
    }
    catch (error) {
        console.log('error *** ', error);
        res.status(500).json({
            status: 0,
            message: error.message
        });
    }
}

//** update User Profile **//
const updateProfile = async (req, res) => {
    // console.log(req.files , "this")
    // console.log(req.files.user_image[0].path);
    try {

        if (!req.headers.authorization) {
            res.status(400).send({ status: 0, message: 'Authentication Field is required' });
        }
        else 
    {
        // console.log(req.body)
        // console.log(req.files.user_image[0].mimetype)
       
            // if (req.files.user_image[0].mimetype == "image/jpeg" ||
            //     req.files.user_image[0].mimetype == "image/png" ||
            //     req.files.user_image[0].mimetype == "image/jpg" ||
            //     req.files.cover_image[0].mimetype == "image/jpeg" ||
            //     req.files.cover_image[0].mimetype == "image/png" ||
            //     req.files.cover_image[0].mimetype == "image/jpg"
            // ) {
               var arr = []
                const userData = await User.findById(req.user._id)
                //  console.log(req.files.user_photos, "userphotos")
                
                 if(req.files.user_photos != undefined){

                    for (let i = 0; i < req.files.user_photos.length; i++) {
                        arr.push(req.files.user_photos[i].path)
                }
            }else{
                    // arr= userData.user_photos;
                    arr= [];
                }
                //  for (let i = 0; i < req.files.user_photos.length; i++) {
                //     arr.push(req.files.user_photos[i].path)
                 
                 
                //  console.log(arr)
                var user_image = "";
                var cover_image = "";
                // var photos = "";
                if(req.files.user_image != undefined){
                    user_image = req.files.user_image[0].path;
                }else{
                    user_image = userData.user_image;
                }
                if(req.files.cover_image != undefined){
                    cover_image = req.files.cover_image[0].path;
                }else{
                    cover_image = userData.cover_image;
                }
                // if(req.files.photos != undefined){
                //     photos = req.files.photos[0].path;
                // }else{
                //     photos = userData.photos;
                // }
                const updateUser = await User.findByIdAndUpdate({ _id: req.params.id }, {
                    username: req.body.username,
                    phone_number: req.body.phone_number,
                    user_gender: req.body.user_gender,
                    phone_number: req.body.phone_number,
                    user_description: req.body.user_description,
                    user_is_profile_complete: req.body.user_is_profile_complete,
                    // photos: photos,
                    user_photos: arr,
                    cover_image: cover_image,
                    user_image: user_image
                },{ new: true });

                if (updateUser) {
                    res.status(200).send({ status: 1, message: 'Profile Update Successfully.', data: updateUser });

                } else {
                    res.status(400).send({ status: 0, message: 'Something Went Wrong.' });
                }

        }

    }
    catch (error) {
        return res.status(500).send({
            status: 0,
            message: "error:---------- " + error.message
        });
    }
}

//** Delete User Profile **//
const deleteUserProfile = async (req, res) => {
  try {
    var id = mongoose.Types.ObjectId(req.params.id);
    const userid = id;

    const user = await User.findById(userid);
    if (!user) {
      res.status(404).json({
        status: 0,
        message: "user not found",
      });
    } else {
      const deleteUserProfile = await User.findOneAndDelete({ _id: userid });
      //deleting user id fron other users field
      const alluser = await User.find();
      for (let i = 0; i < alluser.length; i++) {
        const otherid = alluser[i]._id;
        const other_friends = alluser[i].friends;
        const other_pending_requests = alluser[i].pending_requests;
        const check_friends = other_friends.includes(userid);
        const check_requests = other_pending_requests.includes(userid);

        if (check_friends == true) {
          // console.log(otherid)
          const oppositeUserfriend = await User.findByIdAndUpdate(
            { _id: otherid },
            { $pull: { friends: userid } },
            { new: true }
          );
          // console.log(oppositeUserRequest)
        } else if (check_requests == true) {
          const oppositeUserRequest = await User.findByIdAndUpdate(
            { _id: otherid },
            { $pull: { pending_requests: userid } },
            { new: true }
          );
        }
      }
      
      //deleting friend requests of user
      const findUSerRequests = await FriendRequest.deleteMany({
        $or: [{ sender_Id: userid }, { reciever_Id: userid }],
      });

      //deleting Chat of user
      const findUserChat = await Chat.deleteMany({
        $or: [{ sender_Id: userid }, { reciever_Id: userid }],
      });

      //deleting Prefrences of user
      const userPreferences = await Prefences.findOneAndDelete({
        user_id: userid,
      });

      res.status(200).json({
        status: 1,
        message: "User deleted successfully",
      });
    }
  } catch (error) {
    console.log("error *** ", error);
    res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};


module.exports = {
    userProfile,
    updateProfile,
    deleteUserProfile
}
