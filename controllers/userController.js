const { error, success } = require("../utils/responseWrapper");
const User = require("../models/User");
const Post = require("../models/Post");
const { mapPostOutput } = require("../utils/Utils");
const cloudinary =require ('cloudinary').v2;

const followOrUnfollowUserController =async (req ,res) =>{
   try{
    const {userIdToFollow} =req.body;
    console.log("Request User ID:", req._id);
    const curUserId = req._id;
    const userToFollow = await User.findById(userIdToFollow);
    const curUser =await User.findById(curUserId);

    if(curUserId === userIdToFollow){
        return res.send(error(409 ,'Users cannot follow themselves'))
    }
    if(!userToFollow){
        return res.send(error(404,'user to follow not found'));
    }
     //already following then unfollow the curUser by userId
    if(curUser.followings.includes(userIdToFollow)){
        const index =curUser.followings.indexOf(userIdToFollow);
        curUser.followings.splice(index ,1);
    //and remove the follower from the userIdFollow 
        const followerIndex =userToFollow.followers.indexOf(curUser);
        userToFollow.followers.splice(followerIndex,1);
       

    }

    else {
     // then following the userId by curUser
     userToFollow.followers.push(curUserId);
     curUser.followings.push(userIdToFollow);
     
    

    }
    await userToFollow.save();
    await curUser.save();
    return res.send(success(200,{user:userToFollow}))
   }
   catch(e){
      return res.send(error(500 ,e.message));
   }
    };



// jo jo user mere following me hai unki post mujha le aa kar dedo
const getPostsOfFollowing =async(req ,res) =>{
    try{
        console.log("Request User ID:", req._id);
        const curUserId = req._id;
        //populate means come full data from followings
        const curUser =await User.findById(curUserId).populate("followings");
        const fullPosts = await Post.find({
            'owner': {
                $in :curUser.followings
            }
        }).populate('owner');
        const posts = fullPosts.map(item => mapPostOutput(item ,req._id)).reverse();
        
        
        // mujha sabhi log ki Id chahiye jin log ko mai follow kar rha hu.
        const followingIds =curUser.followings.map(item => item._id);
        // yeh meri id ko daal dia hu
        followingIds.push(req._id);
        // all id comes jisko mai follow in kia hu
        const suggestions =await User.find({
            _id:{
                $nin: followingIds
            }
        })
        
         // update posts from curUser._doc post
        return res.send(success(200, {...curUser._doc , suggestions,posts}));
    }
    catch(error){
        console.log(e);
        return res.send(error(500,e.message));
    }
}

const getMyPosts = async(req ,res) =>{
    try{
        const curUserId = req._id;
        const allUserPosts =await Post.find({
            owner : curUserId
        }).populate("likes");
    return res.send(success(200 ,{
        allUserPosts
    })) 
    }
    catch(e){
        console.log(e);
        return res.send(error(500,e.message));
    }
}

const getUserPosts = async(req ,res) =>{
    try{
        const userId = req.body.userId;
        if(!userId){
            return res.send(error(400 ,'userId is required'))
        }
        const allUserPosts =await Post.find({
            owner : userId
        }).populate("likes");
    return res.send(success(200 ,{
        allUserPosts
    })) 
    }
    catch (error) {
        console.log(e);
        return res.send(error(500, e.message));
    }
   
}

const deleteMyProfile =async (req ,res) =>{
    try{

    
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);

    //delete all posts
    await Post.deleteMany({
        owner:curUserId
    })
    // removed myself from follower from followings
    curUser.followers.forEach(async(followerId) =>{
        const follower =await User.findById(followerId);
        const index =follower.followings.indexOf(curUserId);
        follower.followings.splice(index ,1);
        await follower.save();
        
    })
    // removed myself from following jisko mai follow kar rha from followers
    curUser.followings.forEach(async(followingId) =>{
        const following =await User.findById(followingId);
        const index =following.followers.indexOf(curUserId);
        following.followers.splice(index ,1);
        await following.save();
        
    })

    //remove myself from all likes where I like
        const allPosts = await Post.find();
        allPosts.forEach(async(post) =>{
            const index = post.likes.indexOf(curUserId);
            post.likes.splice(index ,1);
            await post.save();
        });
        await curUser.deleteOne();
        res.clearCookie('jwt' ,{
            httpOnly :true,
            secure:true,
        });
        return res.send(success(200 ,'user deleted'))
    }
    catch(e){
        console.log(e);
        return res.send(error(500,e.message))
    }
}
const getMyInfo =async (req ,res) =>{
    try{
        const user =await User.findById(req._id);
        return res.send(success(200 ,{user}))
    }
    catch(e){
        console.log(e);
        return res.send(error(500 ,e.message));
    }
}
const updateUserProfile = async (req ,res) =>{
    try{
        const {name ,bio , userImg} =req.body;
        const user =await User.findById(req._id);
        if(name){
            user.name =name;
        }
        if(bio){
            user.bio =bio;
        }
        //upload userImg from cloudinary
        if (userImg) {
            const cloudImg = await cloudinary.uploader.upload(userImg, {
                folder: "profileimg",
            });
            user.avatar = {
                url: cloudImg.secure_url,
                publicId: cloudImg.public_id,
            };
        }
        await user.save();
        return res.send(success(200 ,{user}));
    }
    catch(e){
        console.log('put e',e);
        return res.send(error(500 ,e.message));
    }
}
const getUserProfile =async(req ,res) =>{
    try{
        //when I go to someone post then we can fetch by its userId of that someone 
        //populate show that all the post of that someone comes
        const userId =req.body.userId;
        console.log(userId);
        const user =await User.findById(userId).populate({
            path:'posts',
            populate:{
                path :'owner',
            }
        });

        const fullPosts =user.posts;
        // all the post of user comes in particular order(most recent post come first)
        const posts = fullPosts.map((item) => mapPostOutput(item ,req._id)).reverse();
        //user doc means schema wise post come with there all details
        // send all post to frontend 
        return res.send(success(200,{...user._doc ,posts}))
    }
    catch(e){
        console.log('error put' ,e);
        return res.send(error(500,e.message));
    }
    }
    const deleteUser =async (req ,res) =>{
        try{
    
        
        const curUserId = req._id;
        const curUser = await User.findById(curUserId);
    
        //delete all posts
        await Post.deleteOne({
            owner:curUserId
        })
        // removed myself from follower from followings
        curUser.followers.forEach(async(followerId) =>{
            const follower =await User.findById(followerId);
            const index =follower.followings.indexOf(curUserId);
            follower.followings.splice(index ,1);
            await follower.save();
            
        })
        // removed myself from following jisko mai follow kar rha from followers
        curUser.followings.forEach(async(followingId) =>{
            const following =await User.findById(followingId);
            const index =following.followers.indexOf(curUserId);
            following.followers.splice(index ,1);
            await following.save();
            
        })
    
        //remove myself from all likes where I like
            const allPosts = await Post.find();
            allPosts.forEach(async(post) =>{
                const index = post.likes.indexOf(curUserId);
                post.likes.splice(index ,1);
                await post.save();
            });
            await curUser.deleteOne();
            res.clearCookie('jwt' ,{
                httpOnly :true,
                secure:true,
            });
            return res.send(success(200 ,'user deleted'))
        }
        catch(e){
            console.log(e);
            return res.send(error(500,e.message))
        }
    }

module.exports ={
    followOrUnfollowUserController,
    getPostsOfFollowing,
    getMyPosts,
    getUserPosts,
    deleteMyProfile,
    getMyInfo,
    updateUserProfile,
    getUserProfile,
    deleteUser
};