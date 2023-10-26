const auth = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')

//*REGISTER
auth.post('/register', async function (req, res) {
  try {
    //* Generate new password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    //*create new user
    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashPassword,
    })

    //*save user and response
    const user = await newUser.save()
    res.status(200).json(user)
  } catch (err) {
    console.log(err)
  }
})

//*LOGIN
auth.post('/login', async function (req, res) {
  try {
    const user = await User.findOne({ email: req.body.email })
    !user && res.status(404).json('user not found!')

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    !validPassword && res.status(400).json('wrong password!')
    user && validPassword && res.status(200).json(user)
  } catch (err) {
    console.log(err)
  }
})

module.exports = auth
