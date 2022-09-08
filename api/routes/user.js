const User = require("../model/User");

const router = require("express").Router();
const bcrypt = require("bcrypt");


//update user
router.patch("/:id" , async (req,res) => {
    try {
        if(req.body.userId === req.params.id) {
            if(req.body.password) {
               const salt = await bcrypt.genSalt(10);
               const hashedPass = await bcrypt.hash(req.body.password, salt);
               const updateUser = await User.findOneAndUpdate({_id : req.params.id} , {
                ...req.body,
                password : hashedPass
               })
               res.status(200).json(updateUser);
            }

        } else {
            res.status(403).json("You can only update your account!")
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
})


//delete user
router.delete("/:id" , async (req,res) => {
    try {
       if(req.body.userId === req.params.id) {
        await User.findOneAndDelete({_id : req.params.id});
        res.status(200).json("User has been deleted")
       }
    }
    catch (err) {
        res.status(500).json(err);
    }
})


//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});


//follow user
router.put("/:id/follow" , async (req,res) => {
    if(req.body.userId !== req.params.id) {
       try {
         const user = await User.findById(req.params.id);
         const currentUser = await User.findById(req.body.userId);
         if(!user.followers.includes(req.body.userId)){
            await user.updateOne({ $push : {followers : req.body.userId}});
            await currentUser.updateOne({ $push: { followings : req.params.id} });
            res.status(200).json("User have been unfollow");
         } else {
            res.status(403).json("You already follow this user!");
         }
       } catch(error) {
        res.status(500).json(error);
       }
    } else {
       res.status(403).json("You can not follow your self");
    } 
})


//unfollow user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("User have been followed");
      } else {
        res.status(403).json("You do not follow this user");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("You can not unfollow your self");
  }
});
// get friends
router.get("/friends/:userId" , async (req,res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(user.followings.map((friendId) => {
      return User.findById(friendId)
    }));
    let friendList = [];
    friends.map(friend => {
      const {_id, username, profilePicture} = friend;
      friendList.push({_id, username, profilePicture})
    })
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
})


module.exports = router;