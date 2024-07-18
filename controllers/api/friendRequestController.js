const mongoose = require("mongoose");
const FriendRequest = require('../../models/FriendRequest');
const User = require('../../models/User');
const BlockUser = require('../../models/BlockUser');
const { push_notifications } = require('../../middleware/push_notification')


const addFriend = async (req, res) => {
    try {
        if (!req.body.reciever_Id) {
            return res.status(400).send({
                status: 0,
                message: "Reciever ID is required.",
            });
        }
        const receiver_object = await User.find({
            _id: req.body.reciever_Id,
        });
        //  console.log(receiver_object)

        if (receiver_object.length <= 0) {
            return res.status(404).send({
                status: 0,
                message: "User not found.",
            });
        }

        if (req.body.reciever_Id == req.user._id) {
            return res.status(400).send({
                status: 0,
                message: "Request could not send to yourself.",
            });
        }
        const findrequest = await FriendRequest.find({
            sender_Id: req.user._id,
            reciever_Id: req.body.reciever_Id,
            $or: [
                { request_status: 0 },
                { request_status: 1 },
                { request_status: 3 },
            ],
        });
        // console.log(findrequest);
        if (findrequest.length >= 1) {
            return res.status(404).send({
                status: 0,
                message: "Request Already sent ",
            });
        } else {
            const newRequestData = {
                reciever_Id: req.body.reciever_Id,
                sender_Id: req.user._id,
                request_status: req.body.request_status,
                is_heart: req.body.is_heart,
            };

            const request = await FriendRequest.create(newRequestData);
            await request.save();

            // console.log(request)
            //pending_request array

            const user = await User.findByIdAndUpdate(
                { _id: req.user._id },
                { $push: { pending_requests: request.reciever_Id } }
            );
            const oppositeuser = await User.findByIdAndUpdate(
                { _id: request.reciever_Id },
                { $push: { pending_requests: request.sender_Id } }
            );
            //end

            // console.log("h1")

            // Notification Start //
            const receiver_object = await User.find({

                _id: req.body.reciever_Id
            });

            //   console.log(receiver_object)

            const sender_object = await User.find({
                _id: req.user._id,
            });

            //  console.log("sender_object:", sender_object);

            let receiver_device_token = "";
            let receiver_name = "";
            let is_notification_reciever = " ";
            for (let i = 0; i < receiver_object.length; i++) {
                receiver_device_token = receiver_object[i].user_device_token;
                receiver_name = receiver_object[i].username;
                is_notification_reciever = receiver_object[i].is_notification;
            }

            let sender_device_token = "";
            let sender_name = "";
            let sender_image = "";
            let sender_id = "";

            for (let i = 0; i < sender_object.length; i++) {
                sender_device_token = sender_object[i].user_device_token;
                sender_name = sender_object[i].username;
                sender_image = sender_object[i].user_image;
                sender_id = sender_object[i]._id;

            }

            // console.log("recier", receiver_name)
            const notification_obj_receiver = {
                user_device_token: receiver_device_token,
                title: receiver_name,
                body: `${sender_name} has send you a request.`,
                notification_type: 'request_notify',
                vibrate: 1,
                sound: 1,
                sender_id: sender_id,
                sender_name: sender_name,
                sender_image: sender_image,

            };
            if (is_notification_reciever == 1) {
                //  console.log("pushnotification")
                push_notifications(notification_obj_receiver);
            }
            //   console.log(notification_obj_receiver)
            // Notification End //


            if (request) {
                return res.status(200).send({
                    status: 1,
                    message: 'Request send successfully.'
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
        res.status(400).send({
            status: 0,
            message: error
        });
    }
}

//** Get Recieved Request **//
const recievedRequest = async (req, res) => {
    try {
        const checkBlockUser = await BlockUser.find({  user_id: req.user._id, is_blocked: 1 });

        var arr = [];
        for (var i = 0; i < checkBlockUser.length; i++) {
            arr.push(checkBlockUser[i]?.reported_user_id);
              
        }

        const recievedRequest = await FriendRequest.find({ reciever_Id: req.user._id, request_status: 0  , $and: [{sender_Id: { $nin: arr } }]  }).populate({ path: "sender_Id", model: "User", select: "username , user_description , user_image" });

        if (recievedRequest.length < 1) {
            return res.status(400).send({
                status: 0,
                message: 'Friend Requests not found.'
            });
        }
        if (recievedRequest) {
            res.status(200).send({
                status: 1,
                message: 'Requests recieved.',
                data: recievedRequest
            });
        }
        else {
            res.status(404).send({
                status: 0,
                message: 'Requests not found.'
            });
        }


    }

    catch (error) {
        res.status(400).send({
            status: 0,
            message: error
        });
    }
}

//** Get Send Request **//
const sendRequest = async (req, res) => {
    try {

        const checkBlockUser = await BlockUser.find({  user_id: req.user._id, is_blocked: 1 });

        var arr = [];
        for (var i = 0; i < checkBlockUser.length; i++) {
            arr.push(checkBlockUser[i]?.reported_user_id);
        }

        const sendRequest = await FriendRequest.find({ sender_Id: req.user._id, $or: [{ request_status: 1 }, { request_status: 3 }] , $and: [{reciever_Id: { $nin: arr } }] }).populate({ path: "reciever_Id", model: "User", select: "username , user_description , user_image" });

        if (sendRequest.length < 1) {
            return res.status(400).send({
                status: 0,
                message: 'Requests not found.'
            });
        }
        if (sendRequest) {
            res.status(200).send({
                status: 1,
                message: 'Accepted Friend Requests',
                data: sendRequest
            });
        }
        else {
            res.status(404).send({
                status: 0,
                message: 'Requests not found.'
            });
        }

    }

    catch (error) {
        res.status(400).send({
            status: 0,
            message: error
        });
    }
}

//** Accept/ Decline Request **//
const requestStatus = async (req, res) => {
    try {
        if (!req.body.request_id) {
            return res.status(400).send({
                status: 0,
                message: 'Request ID is required.'
            });
        }
        if (!req.body.request_status) {
            return res.status(400).send({
                status: 0,
                message: 'Request status is required.'
            });
        }

        const requestStatus = await FriendRequest.findByIdAndUpdate({ _id: req.body.request_id, }, { request_status: req.body.request_status }, { new: true })
        if (!requestStatus)
            return res.status(400).send({
                status: 0,
                message: "No User Found"
            });

        if (req.body.request_status == 1 || req.body.request_status == 3) {
            // console.log(requestStatus, "here")
            if (requestStatus.sender_Id != req.user._id) {
                const user = await User.findByIdAndUpdate({ _id: req.user._id }, { $push: { friends: requestStatus.sender_Id } })
                const oppositeuser = await User.findByIdAndUpdate({ _id: requestStatus.sender_Id }, { $push: { friends: requestStatus.reciever_Id } })

                //pull from requets array
                const userRequest = await User.findByIdAndUpdate({ _id: req.user._id }, { $pull: { pending_requests: requestStatus.sender_Id } })
                const oppositeUserRequest = await User.findByIdAndUpdate({ _id: requestStatus.sender_Id }, { $pull: { pending_requests: requestStatus.reciever_Id } })
                //end

                return res.status(200).send({
                    status: 1,
                    message: "Request Accepted"
                });
            } else {
                const user = await User.findByIdAndUpdate({ _id: req.user._id }, { $push: { friends: requestStatus.reciever_Id } })
                const oppositeuser = await User.findByIdAndUpdate({ _id: requestStatus.reciever_Id }, { $push: { friends: requestStatus.sender_Id } })
                return res.status(200).send({
                    status: 1,
                    message: "Request Accepted"
                });
            }
            // // const user = User.findByIdAndUpdate({_id: req.user._id}, {$push: {friends:}})
            // return res.status(200).send({
            //     status: 1,
            //     message: "Request Accepted"
            // });
        }
        else if (req.body.request_status == 2) {
            return res.status(200).send({
                status: 1,
                message: "Request Rejected"
            });

        } else {
            return res.status(400).send({
                status: 0,
                message: 'Something went wrong.'
            });

        }





    }

    catch (error) {
        res.status(400).send({
            status: 0,
            message: error
        });
    }
}
// const requestStatus = async (req, res) => {
//     try {
//         if (!req.body.request_id) {
//             return res.status(400).send({
//                 status: 0,
//                 message: 'Request ID is required.'
//             });
//         }
//         if (!req.body.request_status) {
//             return res.status(400).send({
//                 status: 0,
//                 message: 'Request status is required.'
//             });
//         }

//         const requestStatus = await FriendRequest.findByIdAndUpdate({ _id: req.body.request_id, }, { request_status: req.body.request_status }, { new: true })
//         if (!requestStatus)
//             return res.status(400).send({
//                 status: 0,
//                 message: "No User Found"
//             });

//         if (req.body.request_status == 1) {
//             return res.status(200).send({
//                 status: 1,
//                 message: "Request Accepted"
//             });
//         }
//         else if (req.body.request_status == 2) {
//             return res.status(200).send({
//                 status: 1,
//                 message: "Request Rejected"
//             });

//         } else {
//             return res.status(400).send({
//                 status: 0,
//                 message: 'Something went wrong.'
//             });

//         }





//     }

//     catch (error) {
//         res.status(400).send({
//             status: 0,
//             message: error
//         });
//     }
// }

//** Get Friend List **//
const friendList = async (req, res) => {
    try {
        // const checkBlockUser = await BlockUser.find({ user_id: req.user._id, is_blocked: 1 });
        const checkBlockUser = await BlockUser.find({  $or: [{ user_id: req.user._id}, { reported_user_id: req.user._id}],  $and: [{is_blocked: 1}] });

        var arr = [];
        for (var i = 0; i < checkBlockUser.length; i++) {

           
            if(checkBlockUser[i]?.user_id.toString() === req.user._id.toString()) {
                arr.push(checkBlockUser[i]?.reported_user_id);
            }
            else 
            {
                arr.push(checkBlockUser[i]?.user_id);
            }
            
        }
        // console.log(arr)
        // return
        const friendList = await FriendRequest.find({
            $and: [
                { $or: [{ request_status: 1 }, { request_status: 3 }] },
                { $or: [{ sender_Id: req.user._id }, { reciever_Id: req.user._id }] },
                { $and: [{ sender_Id:  { $nin: arr }}, { reciever_Id: { $nin: arr } }] }
            ]
        }).populate({ path: "reciever_Id", model: "User", select: "username , user_description , user_image" }).populate({ path: "sender_Id", model: "User", select: "username , user_description , user_image" });;

        if (friendList.length < 1) {
            return res.status(400).send({
                status: 0,
                message: 'Friends not found.'
            });
        }
        if (friendList) {
            res.status(200).send({
                status: 1,
                message: 'Friend List',
                data: friendList
            });
        }
        else {
            res.status(404).send({
                status: 0,
                message: 'friendList not found.'
            });
        }

        ////////////////////////////backup/////////////////////////
        //     const friendList = await FriendRequest.find({
        //          $and: [
        //       {  $or: [ { request_status: 1}, { request_status: 3 } ]},
        //       { $or: [ { sender_Id: req.user._id }, { reciever_Id: req.user._id } ] }
        //   ]}).populate({ path: "reciever_Id", model: "User", select: "username , user_description , user_image" }).populate({ path: "sender_Id", model: "User", select: "username , user_description , user_image" });;

        //     if (friendList.length < 1) {
        //         return res.status(400).send({
        //             status: 0,
        //             message: 'Friends not found.'
        //         });
        //     }
        //     if (friendList) {
        //         res.status(200).send({
        //             status: 1,
        //             message: 'Friend List',
        //             data: friendList
        //         });
        //     }
        //     else {
        //         res.status(404).send({
        //             status: 0,
        //             message: 'friendList not found.'
        //         });
        //     }


    }

    catch (error) {
        res.status(400).send({
            status: 0,
            message: error
        });
    }
}


module.exports = {
    addFriend,
    recievedRequest,
    sendRequest,
    requestStatus,
    friendList
}