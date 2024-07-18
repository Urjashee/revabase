const BlockUser = require('../../models/BlockUser');
const User = require('../../models/User');


//** Block and Unblock User **//
const blockAndUnblockUser = async (req, res) => {
    try {

        if (!req.body.reported_user_id) {
            return res.status(400).send({
                status: 0,
                message: "User ID is required to report"
            })
        }
        else if (!req.body.type) {
            return res.status(400).send({
                status: 0,
                message: "Type is required"
            })
        }
        else {

            if (req.body.type === "block") {
                const findUserAlreadyblocked = await BlockUser.findOne({ user_id: req.user._id, reported_user_id: req.body.reported_user_id, is_blocked: 1 })
                if (findUserAlreadyblocked) {
                    return res.status(400).send({
                        status: 0,
                        message: "User Already Blocked",
                    })
                }

                const findUser = await BlockUser.findOne({ user_id: req.user._id, reported_user_id: req.body.reported_user_id })
                if (!findUser) {
                    const block = await BlockUser.create({
                        user_id: req.user._id,
                        reported_user_id: req.body.reported_user_id,
                        is_blocked: 1,
                        date: new Date(Date.now())
                    })

                    if (block) {

                        return res.status(200).send({
                            status: 1,
                            message: "User Has been blocked successfully",
                            data:block
                        })

                    }
                    else {
                        return res.status(400).send({
                            status: 0,
                            message: "something went wrong"
                        })
                    }

                }
                else {

                    const updateBlockStatus = await BlockUser.findOneAndUpdate({ user_id: req.user._id, reported_user_id: req.body.reported_user_id }, { is_blocked: 1 , date: new Date(Date.now()) }, { new: true })

                    if (updateBlockStatus) {

                        return res.status(200).send({
                            status: 1,
                            message: "User Has been blocked successfully",
                            data:updateBlockStatus
                        })

                    }

                }


            }
            else if (req.body.type === "unblock") {
                const findUser = await BlockUser.findOne({ user_id: req.user._id, reported_user_id: req.body.reported_user_id, is_blocked: 0 })
                if (findUser) {
                    return res.status(400).send({
                        status: 0,
                        message: "User Already Unblocked",
                    })
                }


                const unblockUser = await BlockUser.findOneAndUpdate({ user_id: req.user._id, reported_user_id: req.body.reported_user_id }, { is_blocked: 0 , date: new Date(Date.now()) }, { new: true })

                if (unblockUser) {

                    return res.status(200).send({
                        status: 1,
                        message: "User Has been unblocked successfully",
                        data:unblockUser
                    })

                }
                else {
                    return res.status(400).send({
                        status: 0,
                        message: "something went wrong"
                    })
                }

            }
            else {
                return res.status(400).send({
                    status: 0,
                    message: "Invalid Type"
                })
            }

        }

    }

    catch (error) {
        return res.status(500).send({
            status: 0,
            message: error.message
        })
    }
}


//**Deafult Card**// 
const getBlockedUser = async (req, res) => {

    try {
  
    
        const findBlockedUsers = await BlockUser.find({ user_id: req.user._id , is_blocked : 1})
      if (findBlockedUsers.length > 0) {
        return res.status(200).send({
             status: 1, 
             message: "Blocked Users Found", 
             data: findBlockedUsers 
            });
      }
      else {
        return res.status(404).send({
            status: 0,
            message: "No Record Found"
        })
    
      }
    } 
    catch (error) {
        return res.status(500).send({
            status: 0,
            message: error.message
        })
    }
  }




module.exports = {
    blockAndUnblockUser,
    getBlockedUser
}