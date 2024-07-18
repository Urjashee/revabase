const router = require('express').Router();

const { verifyToken } = require('../middleware/authenticate');
const { register, login, verifyUser, resendCode, forgotPassword,
    updatePassword, changePassword, logOut, socialLogin } = require('../controllers/api/authController');
const { updateProfile, userProfile, deleteUserProfile } = require('../controllers/api/userController')
const { addFriend, recievedRequest, sendRequest, requestStatus,friendList } = require('../controllers/api/friendRequestController')
const { getContent } = require('../controllers/api/commonController');
const { addPrefences, getPreferences } = require('../controllers/api/prefencesController')
const { Notifications } = require('../controllers/api/settingsController');
const { allUsersProfile, singleUserProfile,getContents,updateContent,UnblockUser, blockUser,adminLogin,adminRegister, AdminNotifications,Dashboard , passwordChange } = require('../controllers/api/adminController');
const { blockAndUnblockUser, getBlockedUser } = require('../controllers/api/blockUserController');

//** Multer **//
const { upload } = require('../middleware/utils');

/** Admin **/
router.post("/admin/register",adminRegister );
router.post("/admin/login", adminLogin);
router.get("/dashboard", Dashboard);
router.get('/dashboard/users', allUsersProfile);
router.get('/dashboard/user/:id', singleUserProfile);
router.get('/dashboard/content/:content_type', getContents);
router.post('/dashboard/content/:content_types', updateContent);
router.post("/dashboard/blockUser/:id", blockUser);
router.post("/dashboard/UnblockUser/:id", UnblockUser);
router.post("/dashboard/notifications", AdminNotifications);
router.post("/admin/changePassword", passwordChange);

/** Auth */
router.post('/login', login);
router.post('/register', upload.single("user_image"), register);
router.post('/verifyOtp', verifyUser);
router.post('/resend-code', resendCode);
router.post('/forgetpassword', forgotPassword);
router.post('/updatePassword', updatePassword);
router.post('/change-password', verifyToken, changePassword);
router.post('/socialLogin', socialLogin);
router.post('/logout', verifyToken, logOut);


/** Content */
router.get('/content/:type', getContent);


//** User **//
router.get('/profile/:id', verifyToken, userProfile);
router.post('/delete-profile/:id', verifyToken, deleteUserProfile);

// router.post('/update-profile/:id',upload.single('user_image'), verifyToken, updateProfile);

router.post('/update-profile/:id',upload.fields([{ name: 'user_image'}, { name: 'user_photos'}, { name: 'cover_image'}]),
   verifyToken, updateProfile);

//** Friend Request **//
router.post('/add-friend', verifyToken, addFriend);
router.get('/request-received', verifyToken, recievedRequest);
router.get('/request-send', verifyToken, sendRequest);
router.post('/request-status', verifyToken, requestStatus);
router.get('/friendList', verifyToken, friendList);

//** Prefences **//
router.post('/add-prefrences', verifyToken, addPrefences);
router.get('/matchList', verifyToken, getPreferences);

//** Notification **//
router.post('/notification', verifyToken, Notifications);

//** Block User **//
router.post('/block-unblock', verifyToken, blockAndUnblockUser);
router.get('/blocked-users', verifyToken, getBlockedUser);


module.exports = router;