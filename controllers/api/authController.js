const { hash } = require('bcrypt');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../../config/mailer');
const req = require('express/lib/request');

/** Login user */
const login = async (req, res) => {
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
        User.find({ email: req.body.email })
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
                         else if (user[0].is_verified == 0) {
                                return res.status(400).send({
                                    status: 1,
                                    message: 'Please verify your account.',
                                    data: {_id : user[0]._id ,is_verified : user[0].is_verified}

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
                                user[0].user_authentication = token
                                user[0].save()
                                return res.status(200).send({
                                    status: 1,
                                    message: 'User logged in successfully!',
                                    // token: token,
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

/** Register user */
const register = async (req, res) => {

    if (!req.body.username) {
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
    else if (!req.body.phone_number) {
        res.status(400).send({
            status: 0,
            message: 'Phone Number is required.'
        });
    }
    else if (!req.body.user_description) {
        res.status(400).send({
            status: 0,
            message: 'Description is required.'
        });
    }
    // else if (!req.body.user_image) {
    //     res.status(400).send({
    //         status: 0,
    //         message: 'Image is required.'
    //     });
    // }
    else {
        User.find({ email: req.body.email })
            .exec()
            .then(user => {
                if (user.length >= 1) {
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
                          const verificationCode = 123456

                            const user = new User;
                            user.username = req.body.username;
                            user.email = req.body.email;
                            user.password = hash;
                            user.phone_number = req.body.phone_number;
                            user.user_image = (req.file ? req.file.path : req.body.user_image),
                            user.user_gender = req.body.user_gender;
                            user.user_description = req.body.user_description;
                            user.user_is_profile_complete = 1
                            user.user_device_type = req.body.user_device_type;
                            user. user_device_token = req.body. user_device_token;
                
                            user.verification_code = verificationCode;
                            user.save()

                                .then(result => {
                                    // sendEmail(user.email, verificationCode, "Email verification");

                                    return res.status(200).send({
                                        status: 1,
                                        message: 'User verification code successfully sent to email.',
                                        data: {
                                            user_id: result._id
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

/** Verify user */
const verifyUser = async (req, res) => {
    // console.log(req.body);
    if (!req.body.user_id) {
        res.status(400).send({
            status: 0,
            message: 'User id field is required'
        });
    }
    else if (!req.body.verification_code) {
        res.status(400).send({
            status: 0,
            message: 'Verification code field is required'
        });
    }
    else {
        User.find({ _id: req.body.user_id })
            .exec()
            .then(result => {
                if (!req.body.verification_code) {
                    res.status(400).send({
                        status: 0,
                        message: 'Verification code is required.'
                    });
                }


                if (req.body.verification_code == result[0].verification_code) {

                   User.findByIdAndUpdate(req.body.user_id, { is_verified: 1, verification_code: null },{new : true},(err, _result) => {
                        if (err) {
                            res.status(400).send({
                                status: 0,
                                message: 'Something went wrong.'
                            });
                        }


                        if (_result) 
                        {
                            
                            const token = jwt.sign(
                                {
                                    email: result[0].email,
                                    userId: result[0]._id
                                },
                                process.env.JWT_KEY,
                                // {
                                //     expiresIn: '1hr'
                                // }
                            );
          		    result[0].is_verified = 1
                            result[0].user_authentication = token
                            result[0].save()
                            return res.status(200).send({
                                status: 1,
                                message: 'Otp matched successfully.',
                                // token: token,
                                data: result[0]
                            });
                        }
                    });
                }
                else {
                    res.status(200).send({
                        status: 0,
                        message: 'Verification code did not matched.'
                    });
                }
            })
            .catch(err => {
                res.status(400).send({
                    status: 0,
                    message: 'User not found'
                });
            });
    }
}

/** Resend code */
const resendCode = async (req, res) => {
    if (!req.body.user_id) {
        res.status(400).send({
            status: 0,
            message: 'User id failed is required.'
        });
    }
    else {
        User.find({ _id: req.body.user_id })
            .exec()
            .then(result => {
                const verificationCode = Math.floor(100000 + Math.random() * 900000);

                User.findByIdAndUpdate(req.body.user_id, { is_verified: 0, verification_code: verificationCode },{new: true} , (err, _result) => {
                    if (err) {
                        res.status(400).send({
                            status: 0,
                            message: 'Something went wrong.'
                        });
                    }
                    if (_result) {
                        sendEmail(result[0].email, verificationCode, "Verification Code Resend");
                        res.status(200).send({
                            status: 1,
                            message: 'Verification code resend successfully.'
                        });
                    }
                });
            })
            .catch(err => {
                res.status(400).send({
                    status: 0,
                    message: 'User not found'
                });
            });
    }
}

/** Forgot password */
const forgotPassword = async (req, res) => {
    if (!req.body.email) {
        res.status(400).send({
            status: 0,
            message: 'Email field is required'
        });
    }
    else {
        User.find({ email: req.body.email })
            .exec()
            .then(user => {
                if (user.length < 1) {
                    return res.status(404).send({
                        status: 0,
                        message: 'Email not found!'
                    });
                }
                else {
                   const verificationCode = Math.floor(100000 + Math.random() * 900000);
                    // const verificationCode = 123456

                    User.findByIdAndUpdate(user[0]._id, { verification_code: verificationCode }, (err, _result) => {
                        if (err) {
                            res.status(400).send({
                                status: 0,
                                message: 'Something went wrong.'
                            });
                        }
                        if (_result) {
                            sendEmail(user[0].email, verificationCode, 'Forgot Password');
                            res.status(200).send({
                                status: 1,
                                message: 'Code successfully send to email.',
                                data: {
                                    user_id: user[0]._id
                                }
                            });
                        }
                    });
                }
            })
            .catch(err => {
                res.status(400).send({
                    status: 0,
                    message: 'User not found'
                });
            });
    }
}

const updatePassword = async (req, res) => {
    if (!req.body.user_id) {
        res.status(400).send({
            status: 0,
            message: 'User id field is required.'
        });
    }
    else if (!req.body.new_password) {
        res.status(400).send({
            status: 0,
            message: 'New password field is required.'
        });
    }
    else {
        User.find({ _id: req.body.user_id })
            .exec()
            .then(user => {

                bcrypt.hash(req.body.new_password, 10, (error, hash) => {
                    if (error) {
                        return res.status(400).send({
                            status: 0,
                            message: error
                        });
                    }
                    else {
                        User.findByIdAndUpdate(req.body.user_id, { password: hash }, (err, _result) => {
                            if (err) {
                                res.status(400).send({
                                    status: 0,
                                    message: 'Something went wrong.'
                                });
                            }
                            if (_result) {
                                res.status(200).send({
                                    status: 1,
                                    message: 'Password updated successfully.'
                                });
                            }
                        });
                    }
                });
            })
            .catch(err => {
                res.status(400).send({
                    status: 0,
                    message: 'User not found.'
                });
            });
    }
}

//** Logout **//
const logOut = async (req, res) => {
    try {

        if (!req.body.user_id) {
            res.status(400).send({ status: 0, message: 'User ID field is required' });
        }
        else if (!req.headers.authorization) {
            res.status(400).send({ status: 0, message: 'Authentication Field is required' });
        }
        else {
            const updateUser = await User.findOneAndUpdate({ _id: req.body.user_id }, {
                user_authentication: null,
                user_device_type: null,
                user_device_token: null
            });
            updateUser.save()
            // console.log(req.headers['authorization']);
            res.removeHeader('authorization');
            return res.status(200).send({ status: 1, message: 'User logout Successfully.' });

        }
    }
    catch (error) {
        res.status(400).json({
            status: 0,
            message: error + 'error'
        });
    }
}

//** Change Password **//
const changePassword = async (req, res) => {
    try {
        if (!req.body.user_id) {
            res.send({ status: 0, message: 'User ID field is required' });
        }
        // else if (req.body.user_authentication.length === 0) {
        //     res.send({ status: 0, message: 'Authentication field is required' });
        // }
        else if (!req.body.old_password) {
            res.send({ status: 0, message: 'Old Password field is required' });
        }
        else if (!req.body.new_password) {
            res.send({ status: 0, message: 'New Password field is required' });
        }
        else {
            // const userFind = await User.findOne({ _id: req.body.user_id, user_authentication: req.body.user_authentication });
            const userFind = await User.findOne({ _id: req.body.user_id });
            if (userFind) {
                const oldPassword = await bcrypt.compare(req.body.old_password, userFind.password);



                if (userFind && oldPassword == true) {
                    const newPassword = await bcrypt.hash(req.body.new_password, 8);
                    await User.findOneAndUpdate({ _id: req.body.user_id }, { password: newPassword });
                    res.send({ status: 1, message: 'New password Updated Successfully.' });
                }
                else {
                    res.send({ status: 0, message: 'Old password is incorrect' });
                }

            } else {
                res.send({ status: 0, message: 'Something Went Wrong.' });
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




const socialLogin = async (req, res) => {
    try {
        // const alreadyUserAsSocialToke = await User.findOne({ user_social_token: req.body.user_social_token })

        if (!req.body.user_social_token) {
            return res.status(400).send({ status: 0, message: 'User Social Token field is required' });
        }
        else if (!req.body.user_social_type) {
            return res.status(400).send({ status: 0, message: 'User Social Type field is required' });
        }
          else if (!req.body.user_device_type) {
            return res.status(400).send({ status: 0, message: 'User Device Type field is required' });
        }
          else if (!req.body.user_device_token) {
            return res.status(400).send({ status: 0, message: 'User Device Token field is required' });
        }
        else {
            const checkUser = await User.findOne({ user_social_token: req.body.user_social_token });
            if (!checkUser) {
                const newRecord = new User();
                // if(req.file){
                //     newRecord.user_image    = req.file.path
                //  }
                // const customer = await stripe.customers.create({
                //     description: 'New Customer Created',
                // });
                // newRecord.stripe_id = customer.id;
                // newRecord.user_image = req.body.user_image ? req.body.user_image : ""
                // newRecord.user_image = req.body.user_image
                // newRecord.user_image = req.file ? req.file.path : req.body.user_image,
                newRecord.user_social_token = req.body.user_social_token,///
                    newRecord.user_social_type = req.body.user_social_type,
                    newRecord.user_device_type = req.body.user_device_type,
                    newRecord.user_device_token = req.body.user_device_token,
                    // newRecord.user_name = req.body.user_name,////
                    newRecord.email = req.body.email,
                    //newRecord.user_type = req.body.user_type,
                    newRecord.is_verified = 1
                await newRecord.generateAuthToken();
                const saveLogin = await newRecord.save();
                return res.status(200).send({ status: 1, message: 'Login Successfully', data: saveLogin });
            } else {
                 const token = await checkUser.generateAuthToken();
                const upatedRecord = await User.findOneAndUpdate({ _id: checkUser._id },
                    { is_verified: 1 , user_authentication: token, user_device_type : req.body.user_device_type,user_device_token : req.body.user_device_token, }
                    , { new: true });
                return res.status(200).send({ status: 1, message: 'Login Successfully', data: upatedRecord });
            }
        }
        // console.log("here 3 ")

    }
    catch (error) {
        // console.log('error *** ', error);
        res.status(500).json({
            status: 0,
            message: error.message
        });
    }
}



module.exports = {
    register,
    login,
    verifyUser,
    resendCode,
    forgotPassword,
    updatePassword,
    changePassword,
    //  newSocialLogin,
    socialLogin,
    logOut,
 
}