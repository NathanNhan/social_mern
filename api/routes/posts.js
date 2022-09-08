const router = require("express").Router();

const Post = require("../model/Post");
const User = require("../model/User");



//create post
router.post("/create" , async (req,res) => {
    try {
        const post = await Post.create(req.body);
        res.status(200).json(post);

    } catch (error) {
        res.status(500).json(error);
    }
})


//update post

router.patch("/:id" , async (req,res) => {
    try {
       const post = await Post.findById(req.params.id);
       if(post.userId === req.body.userId) {
           const updatedPost = await Post.findOneAndUpdate({_id: req.params.id} , {...req.body});
           res.status(200).json(updatedPost);
       } else {
           res.status(403).json("You can only update your post!");
       }
    } catch(error) {
        res.status(500).json(error);
    }
})


//delete post
router.delete("/:id" , async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await Post.findOneAndDelete({_id:req.params.id});
            res.status(200).json("Post have been deleted!");
        } else {
            res.status(403).json("You can only delete your post!");
        }
    } catch (error) {
        res.status(500).json(error);
    }
})
//get like/dislike post
router.put("/:id/like" , async (req,res) => {
    try{
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({$push : { likes : req.body.userId}});
            res.status(200).json("Post has been liked");
        } else {
            await post.updateOne({$pull : {likes : req.body.userId}});
            res.status(200).json("Post has been disliked")
        }
    } catch (error) {
        res.status(500).json(error);
    }
})



//get post
router.get("/:id" , async (req,res) => {
    try {
       const post = await Post.findById(req.params.id);
       res.status(200).json(post);
    } catch (error) {
        res.status(500).json(error);
    }
})



//get timeline post
router.get("/timeline/:id" , async (req,res) => {
    try {
        const currentUser = await User.findById(req.params.id);
        const userPost = await Post.find({userId : currentUser._id});
        const friendPost = await Promise.all(currentUser.followings.map((friendId) => (
            Post.find({userId : friendId})
        )))
        res.status(200).json(userPost.concat(...friendPost));
    } catch (error) {
        res.status(500).json(error);
    }
})

//get user's posts 
router.get("/profile/:username" , async (req,res) => {
    try {
        const users = await User.findOne({username: req.params.username});
        const posts = await Post.find({userId : users._id});
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json(error);
    }

})


module.exports = router;