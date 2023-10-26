const router = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')

//*update user
router.put('/:id', async function (req, res) {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
      } catch (err) {
        return res.status(500).json(err)
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      })
      res.status(200).json('Account has been updated')
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    return res.status(403).json('You can update only your account!')
  }
})
//* get all friends
router.get('/friends/:userId', async function (req, res) {
  try {
    const user = await User.findById(req.params.userId)
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId)
      }),
    )
    let friendList = []
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend
      friendList.push({ _id, username, profilePicture })
    })
    res.status(200).json(friendList)
  } catch (err) {
    res.status(500).json(err)
  }
})
//*delete a user
router.delete('/:id', async function (req, res) {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.deleteOne({ _id: req.params.id })
      res.status(200).json('Account has been Deleted')
    } catch (err) {
      return res.status(500).json(err)
    }
  } else {
    return res.status(403).json('You can delete only your account!')
  }
})

//*Get user
router.get('/', async function (req, res) {
  try {
    const userId = req.query.userId
    const username = req.query.username

    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username })
    const { password, updatedAt, ...other } = user._doc
    res.status(200).json(other)
  } catch (err) {
    return res.status(500).json(err)
  }
})

//*Follw user
router.put('/:id/follow', async function (req, res) {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      const currentUser = User.findById(req.body.userId)
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } })
        await currentUser.updateOne({ $push: { followings: req.params.id } })
        res.status(200).json('You have been follow')
      }
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    res.status(403).json('You cant follow yourself')
  }
})

//*Unfollow user
router.put('/:id/unfollow', async function (req, res) {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      const currentUser = User.findById(req.body.userId)
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } })
        await currentUser.updateOne({ $pull: { followings: req.params.id } })
        res.status(200).json('user has not been follow')
      } else {
        res.status(403).json('user already unfollow to this user')
      }
    } catch (err) {
      res.status(500).json(err)
    }
  } else {
    res.status(403).json('You cant unfollow yourself')
  }
})

module.exports = router
