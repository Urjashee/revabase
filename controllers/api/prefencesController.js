const Prefences = require('../../models/Prefences')
const BlockUser = require('../../models/BlockUser');
const User = require('../../models/User')

const addPrefences = async (req, res) => {
    try {


        if (!req.body.interest) {
            return res.status(400).json({
                status: 0,
                message: "Interest field is required",
            })
        }
        if (!req.body.spotify_list) {
            return res.status(400).json({
                status: 0,
                message: "Spotify List field is required",
            })
        }
        const userPrefencesExists = await Prefences.findOne({ user_id: req.user._id })
        // console.log(userPrefencesExists);
        if (!userPrefencesExists) {
            // console.log("working");

            const newPrefences = {
                user_id: req.user._id,
                interest: req.body.interest,
                spotify_list: req.body.spotify_list
            };
            //console.log("log", req._id);
            const prefences = await Prefences.create(newPrefences);
            await prefences.save();
            if (prefences) {
                return res.status(200).send({
                    status: 1,
                    message: 'Preferences added successfully'
                });
            }
            else {
                return res.status(400).send({
                    status: 0,
                    message: 'Something went wrong.'
                });
            }



        } else {

           const updateprefences = await Prefences.findOneAndUpdate({ user_id: req.user._id},{ interest: req.body.interest, spotify_list: req.body.spotify_list })
            // console.log(updateprefences)
            if (updateprefences) {
                return res.status(200).send({
                    status: 1,
                    message: 'Preferences Updated successfully.'
                });
            
            }
            else {
                return res.status(400).send({
                    status: 0,
                    message: 'Something went wrong.'
                });
            }
        }
    }
    catch (error) {
        console.log('error *** ', error);
        return res.status(500).json({
            status: 0,
            message: error.message
        });
    }
}

//** Get Prefrences **//
const getPreferences = async (req, res) => {
    try {

        const loginUserPrefrences = await Prefences.findOne({ user_id: req.user._id }).populate({ path: "user_id", model: "User", select: " friends " })
        console.log(loginUserPrefrences)

        if (!loginUserPrefrences) {
            return res.status(200).send({
                status: 0,
                message: "Add Preferences first",
            });
        }
        if (loginUserPrefrences) {

            const my_spotify_list = loginUserPrefrences.spotify_list; // 1

               // const checkBlockUser = await BlockUser.find({ user_id: req.user._id, is_blocked: 1 });
        const checkBlockUser = await BlockUser.find({  $or: [{ user_id: req.user._id}, { reported_user_id: req.user._id}],  $and: [{is_blocked: 1}] });
       // console.log(req.user._id)
       // console.log("checkinguser" , checkBlockUser)
        var blockUserarr = [];
        for (var i = 0; i < checkBlockUser.length; i++) {

            // console.log(checkBlockUser[i]?.user_id , "=----------------")
            if(checkBlockUser[i]?.user_id.toString() === req.user._id.toString()) {
                blockUserarr.push(checkBlockUser[i]?.reported_user_id);
            }
            else 
            {
                blockUserarr.push(checkBlockUser[i]?.user_id);
            }
            // arr.push(checkBlockUser[i].reported_user_id);
        }
            
            // const checkBlockUser = await BlockUser.find({ user_id: req.user._id, is_blocked: 1 });
            //  for (var i = 0; i < checkBlockUser.length; i++) {
            //     blockUserarr.push(checkBlockUser[i].reported_user_id);
            // }

            // const otherUserPrefrences = await Prefences.find({ 'user_id': { $ne: req.user._id } })
            //     .populate({ path: "user_id", model: "User", select: "username , user_gender , user_image , user_photos , user_description  friends pending_requests " })

            // console.log(otherUserPrefrences.user_id.friends)
            const otherUserPrefrences = await Prefences.find({ $and: [{ 'user_id': { $ne: req.user._id } }, { user_id: { $nin: blockUserarr }}]})
                .populate({ path: "user_id", model: "User", select: "username , user_gender , user_image , user_photos , user_description  friends pending_requests " })
            const arr = [];
            // console.log("working1")
            if (otherUserPrefrences.length > 0) {
                for (let i = 0; i < otherUserPrefrences.length; i++) {

                    //checking user friends
                    const other_friend_list = otherUserPrefrences[i].user_id.friends;
                    //cheking user pendingrequest
                    const other_pending_requests = otherUserPrefrences[i].user_id.pending_requests;

                    const other_spotify_list = otherUserPrefrences[i].spotify_list; // 2

                    const show = my_spotify_list.filter(item => other_spotify_list.includes(item));


                    const myid = !other_friend_list.includes(req.user._id)

                    const checkingPendingRequests = !other_pending_requests.includes(req.user._id)
                    //  console.log("of",other_friend_list)
                    //   console.log("ops",other_pending_requests)
                    //   console.log("osp",other_spotify_list)
                    //     console.log("msp",my_spotify_list)

                    //   console.log("working2" , myid)
                    if (myid && checkingPendingRequests) {
                        if (show.length > 0 && otherUserPrefrences[i].user_id.user_gender == loginUserPrefrences.interest) {
                            //console.log("object1")         
                            arr.push(otherUserPrefrences[i]);
                        }
                    }

                   

                    //     if (show.length > 0 && otherUserPrefrences[i].user_id.user_gender == loginUserPrefrences.interest) {
                    //         console.log("object1")         
                    //     arr.push(otherUserPrefrences[i]);
                    // }
                }
                // console.log(arr)
            }

            if (arr.length == 0) {
                return res.status(400).send({
                    status: 0,
                    message: "No Preferences found",
                });

            }

            return res.status(200).send({
                status: 1,
                message: "Preferences found",
                data: arr
            });
        }



    }

    catch (error) {
        return res.status(400).send({
            status: 0,
            message: error.message
        });
    }
}


// //** Get Prefrences **//
// const getPreferences = async (req, res) => {
//     try {
//         //  let my_id = req.user._id
//         //  console.log(my_id)
//         const loginUserPrefrences = await Prefences.findOne({ user_id: req.user._id }).populate({ path: "user_id", model: "User", select: " friends " })
//         // console.log("match" , loginUserPrefrences[0].interest);
//         //  console.log(loginUserPrefrences)
//         if(!loginUserPrefrences){
//             return res.status(200).send({
//                 status: 0,
//                 message: "Add Preferences first",
//             });
//         }
//         if (loginUserPrefrences) {
            
//             const my_spotify_list = loginUserPrefrences.spotify_list; // 1
//             // const my_friend_list = loginUserPrefrences.user_id.friends; //
//             // console.log(my_friend_list)
//             // console.log(loginUserPrefrences.spotify_list)
//             // const get_gender = await User.find({ user_gender: loginUserPrefrences.interest });
//             const otherUserPrefrences = await Prefences.find({ 'user_id': { $ne: req.user._id } })
//                 .populate({ path: "user_id", model: "User", select: "username , user_gender , user_image , user_photos , user_description  friends " })
                
//                 // console.log(otherUserPrefrences.user_id.friends)
//                 const arr = [];
//                 if (otherUserPrefrences.length > 0) {
//                     for (let i = 0; i < otherUserPrefrences.length; i++) {
//                          const other_friend_list = otherUserPrefrences[i].user_id.friends;
//                         //   console.log(other_friend_list)
//                         const other_spotify_list = otherUserPrefrences[i].spotify_list; // 2
                        
//                         const show = my_spotify_list.filter(item => other_spotify_list.includes(item));
//                         // const friend = my_id.filter(item => !other_friend_list.includes(item));
//                       // console.log(my_id , "my")

//                       const myid = !other_friend_list.includes(req.user._id)

//                     //    console.log(myid)
//                         if(myid ){
//                             if (show.length > 0 && otherUserPrefrences[i].user_id.user_gender == loginUserPrefrences.interest) {
//                                 //console.log("object1")         
//                             arr.push(otherUserPrefrences[i]);
//                         }
//                         }
                        
//                     //     if (show.length > 0 && otherUserPrefrences[i].user_id.user_gender == loginUserPrefrences.interest) {
//                     //         console.log("object1")         
//                     //     arr.push(otherUserPrefrences[i]);
//                     // }
//                 }
//             }

//             if (arr.length == 0) {
//                 return res.status(400).send({
//                     status: 0,
//                     message: "No Preferences found",
//                 });

//             }
//             // console.log(arr[user_id])
//             // const my_interest = loginUserPrefrences.interest;
            
//             // const otherUserPrefrences = await Prefences.find({spotify_list:my_interest , 'user_id': {$ne : req.user._id}})
//             //console.log(otherUserPrefrences);

//             return res.status(200).send({
//                 status: 1,
//                 message: "Preferences found",
//                 data: arr
//             });
//         }



//     }

//     catch (error) {
//         return res.status(400).send({
//             status: 0,
//             message: error
//         });
//     }
// }


module.exports = {
    addPrefences,
    getPreferences
}