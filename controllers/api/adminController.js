const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Prefences = require('../../models/Prefences')
const Content = require('../../models/Content')
const Admin = require('../../models/Admin')
var FCM = require("fcm-node");
var serverKey =
  "AAAAMoqFZJY:APA91bG_Y9934IwODAHntHLxwJvwMMWifDyhwUSuh-ks2aTCHA7mO5PaSgRn2tnX54Vw3eBzXgNdFrGgaI3jr7VF24LN2FOuOUeY-SepqA0O7TuielnhGy4oraHvdsPDUWfRnyeEn1sP"; //put your server key here
var fcm = new FCM(serverKey);

/** Login Admin */
const adminLogin = async (req, res) => {
  if (!req.body.email) {
      return res.status(400).send({
          status: 0,
          message: 'Email field is required.'
      });
  }
  else if (!req.body.password) {
      return res.status(400).send({
          status: 0,
          message: 'Password field is required.'
      });
  }
  
  else {
      Admin.find({ email: req.body.email })
          .exec()
          .then(user => {
              if (user.length < 1) {
                  return res.status(404).send({
                      status: 0,
                      message: 'Email not found!'
                  });
              }
              else {
                  bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                      if (err) {
                          return res.status(400).send({
                              status: 0,
                              message: 'Auth Failed'
                          });
                      }
                      if (result) {

                          if (user[0].is_blocked == 1) {
                              return res.status(400).send({
                                  status: 0,
                                  message: 'You are temporarily blocked by Admin'
                              });

                          }
                       else if (user[0].role != 'admin') {
                              return res.status(400).send({
                                  status: 0,
                                  message: 'Access Denied!'
                              });

                          }
                          else {
                              const token = jwt.sign(
                                  {
                                      email: user[0].email,
                                      userId: user[0]._id
                                  },
                                  process.env.JWT_KEY,
                                  // {
                                  //     expiresIn: '1hr'
                                  // }
                              );
                              //   User.findOneAndUpdate({ user_authentication: token})
                              //   .exec()
                              //  console.log(user[0].user_authentication);
                              user[0].user_device_type = req.body.user_device_type,
                              user[0].user_device_token = req.body.user_device_token,
                              // user[0].user_is_profile_complete = 1
                              // user[0].user_authentication = token
                              user[0].save()
                              return res.status(200).send({
                                  status: 1,
                                  message: 'User logged in successfully!',
                                  token: token,
                                  data: user[0]
                              });
                          }
                      }
                      return res.status(400).send({
                          status: 0,
                          message: 'Incorrect password.'
                      });
                  })
              }
          })
          .catch(err => {
              res.status(400).send({
                  status: 0,
                  message: err
              });
          });
  }
}

/** Register Admin */
const adminRegister = async (req, res) => {

  if (!req.body.user_name) {
      res.status(400).send({
          status: 0,
          message: 'Username is required.'
      });
  }
  else if (!req.body.email) {
      res.status(400).send({
          status: 0,
          message: 'Email is required.'
      });
  }
  else if (!req.body.password) {
      res.status(400).send({
          status: 0,
          message: 'Password is required.'
      });
  }
  // else if (!req.body.phone_number) {
  //     res.status(400).send({
  //         status: 0,
  //         message: 'Phone Number is required.'
  //     });
  // }
  // else if (!req.body.user_description) {
  //     res.status(400).send({
  //         status: 0,
  //         message: 'Description is required.'
  //     });
  // }
  // else if (!req.body.user_image) {
  //     res.status(400).send({
  //         status: 0,
  //         message: 'Image is required.'
  //     });
  // }
  else {
      Admin.find({ email: req.body.email })
          .exec()
          .then(admin => {
              if (admin.length >= 1) {
                  res.status(400).send({
                      status: 0,
                      message: 'Email already exists!'
                  });
              }
              else {
                  bcrypt.hash(req.body.password, 10, (err, hash) => {
                      if (err) {
                          res.status(400).send({
                              status: 0,
                              message: err
                          });
                      }
                      else {
                          if (req.file) {
                              user_image = req.file.path
                          }

                         // const verificationCode = Math.floor(100000 + Math.random() * 900000);
                        //  const verificationCode = 123456

                          const admin = new Admin;
                          admin.user_name = req.body.user_name;
                          admin.email = req.body.email;
                          admin.password = hash;
                          // user.phone_number = req.body.phone_number;
                          admin.user_image = (req.file ? req.file.path : req.body.user_image),
                          // user.user_gender = req.body.user_gender;
                          // user.user_description = req.body.user_description;
                          // user.user_is_profile_complete = 1
                          admin.user_device_type = req.body.user_device_type;
                          admin. user_device_token = req.body.user_device_token;
              
                          // user.verification_code = verificationCode;
                          admin.save()
// console.log(user)
                              .then(result => {
                                  // sendEmail(user.email, verificationCode, "Email verification");

                                  return res.status(200).send({
                                      status: 1,
                                      message: 'Registered successfully',
                                      data: {
                                          user: result
                                      }
                                  });
                              })
                              .catch(errr => {
                                  res.status(400).send({
                                      status: 0,
                                      message: errr
                                  });
                              });
                      }
                  });
              }
          })
          .catch(err => {
              res.status(400).send({
                  status: 0,
                  message: err
              });
          });
  }
}
//** Get All Users Profile **//
const allUsersProfile = async (req, res) => {
    try {

        const user = await User.find()
    //    console.log(user._id)
        // const preferences = await Prefences.find({user_id: req.params.id}).select('interest spotify_list')
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
            data:{
                user
                // _id : user._id,
                // email:user.email,
                // username:user.username,
                // user_image:user.user_image,
                // cover_image:user.cover_image,
                // user_gender:user.user_gender,
                // user_description:user.user_description,
                // phone_number:user.phone_number,
                // user_photos:user.user_photos,
                // user_is_profile_complete : user.user_is_profile_complete,
             
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


//** Get Single User Profile **//
const singleUserProfile = async (req, res) => {
    try {

        const user = await User.findById(req.params.id).select('user_image cover_image user_gender user_description username phone_number email user_photos user_is_profile_complete ')
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
            data:{
                _id : user._id,
                email:user.email,
                username:user.username,
                user_image:user.user_image,
                cover_image:user.cover_image,
                user_gender:user.user_gender,
                user_description:user.user_description,
                phone_number:user.phone_number,
                user_photos:user.user_photos,
                user_is_profile_complete : user.user_is_profile_complete,
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


// Get content
const getContents = async (req, res) => {      
    try{
     
        if(!req.params.content_type){
           return res.status(400).send({status: 0, message: 'Content field is required'});
        }   
        else{                           
              const contentFind = await Content.findOne({type: req.params.content_type});                                
               if(contentFind){
                return res.status(200).send({status: 1, data: contentFind});
               }
               else{
                return res.status(400).send({status: 0, message: 'Something Went Wrong.'});
               }           
        }
     } catch(e){
        return res.status(400).send(e);
     }
}

// Update Content
const updateContent = async (req, res) => {      
   try{

      const content = await Content.findOneAndUpdate({ type: req.params.content_types}, {content: req.body.content} , {new: true});
//  console.log(content, "here");
      if(content){
          
          return res.status(200).json({message: 'Content Update Successfully'})     
      } else {
        return res.status(200).json({message: 'Content Not Found'})  
      }
  } catch(e){
     res.status(400).send(e);
  }
}




// blockUser
const blockUser = async (req, res) => {
    // console.log("blockUser_id:", req.params.id);
    try {
      const UserBlock = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          is_blocked: 1,
          user_authentication: null
        },
        { new: true }
      );
  
      if (UserBlock) {
        return res.status(200).json({message: 'User Blocked Successfully'})  
      }
    } catch (error) {
      res.send(error.message);
    }
  };
  
  
  
  // UnblockUser
  const UnblockUser = async (req, res) => {
    // console.log("UnblockUser_id:", req.params.id);
    try {
      const unblockUser = await User.findOneAndUpdate(
        { _id: req.params.id },
        { is_blocked: 0 },
        { new: true }
      );
  
      if (unblockUser) {
        return res.status(200).json({message: 'User Unblocked Successfully'})  
      }
    } catch (error) {
      res.send(error.message);
    }
  };

  // Admin Notifications
  const AdminNotifications = async (req, res) => {
 
    try {
        if (!req.body.title) {
            return res.status(400).send({
                status: 0,
                message: 'Title field is required.'
            });
        }
      else if (!req.body.message) {
            return res.status(400).send({
                status: 0,
                message: 'Message field is required.'
            });
        }
        else{
let userArray = []
            const findUsers =  await User.find({ user_device_token: { $ne: null } })
            for (let i = 0; i < findUsers.length; i++){
                userArray.push(findUsers[i].user_device_token)
            }
            
        // console.log(userArray)

        for (var i = 0; i < userArray.length; i++) {
            var message = {
                to: userArray[i],
                collapse_key: "your_collapse_key",
                notification: {
                    title: req.body.title,
                    body: req.body.message,
                },
                data: {

                    notification_type:'admin_notify',
                    vibrate:1,
                    sound:1,
                }
            };
            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong!", err);
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
        }
        return res.status(200).send({
            status: 1,
            message: 'Notification send successfully',
           
        });
        }
    } catch (error) {
        return res.status(400).send({
            status: 0,
            message: error.message
        });
    }
  };

  // Admin Dashboard
  const Dashboard = async (req, res) => {
    
    try {
        const users = await User.find({}).countDocuments();
        const blocked = await User.find({is_blocked :1}).countDocuments();
        const android = await User.find({user_device_type : 'android'}).countDocuments();
        const ios = await User.find({ user_device_type: 'ios' }).countDocuments()

        // console.log("hellolo")
        return res.status(200).json({
            status: 1,
            message: 'Data Found',
            data:{
                users : users,
                blocked: blocked,
                android: android,
                ios: ios
            }
           
        });
        
    } catch (error) {
        return res.status(400).send({
            status: 0,
            message: "Data Not Found"
        });
    }
  };

  // Here is change pasword
const passwordChange = async (req, res) => {
    try {
        if (!req.body.email) {
            return res.status(400).send({
                status: 0,
                message: 'Email field is required.'
            });
        }
      const checkEmail = await Admin.findOne({ email: req.body.email });
  
      if (checkEmail) {
        const newPassword = await bcrypt.hash("Abcd@1234", 8);
        await Admin.findOneAndUpdate(
          { _id: checkEmail._id },
          {
            password: newPassword,
          }
        );
        // sendEmail(req.body.email, "Abcd@1234");
        return res.status(200).send({
            status: 1,
            message: 'Password send to email successfully',})
      } else {
        return res.status(400).send({
            status: 0,
            message: 'Email not found',})
      }
    } catch (error) {
      return res.send(error.message);
    }
  };
  


module.exports = {
    allUsersProfile,
    singleUserProfile,
    getContents,
    updateContent,
    blockUser,
    UnblockUser,
    AdminNotifications,
    Dashboard,
    adminRegister,
    adminLogin,
    passwordChange


}
