const requireUser= require('../middlewares/requireUser');
const UserController =require('../controllers/userController');
const router =require('express').Router();

router.post("/follow",requireUser ,UserController.followOrUnfollowUserController);

router.get('/getFeedData' ,requireUser , UserController.getPostsOfFollowing);
router.get('/getMyPosts' ,requireUser , UserController.getMyPosts);
router.get('/getUserPost' ,requireUser, UserController.getUserPosts);
router.delete('/' ,requireUser , UserController.deleteMyProfile);
router.get('/getMyInfo' ,requireUser ,UserController.getMyPosts);
router.put('/' ,requireUser ,UserController.updateUserProfile);
router.post('/getUserProfile' ,requireUser ,UserController.getUserProfile);
router.delete('/deleteUser' ,requireUser , UserController.deleteUser)
module.exports=router;