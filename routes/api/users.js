const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')

//bring in user model
const User = require('../../models/User')

// @route   POST api/users
// @desc    register user
// @access  Public
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'please enter a password with 6 or more characters'
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      //if there are errors
      return res.status(400).json({ errors: errors.array() }) //400 is a bad request
    }

    const { name, email, password } = req.body

    try {
      //see if user exists, send back error
      let user = await User.findOne({ email })

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] })
      }

      //get users gravatar based on email
      const avatar = gravatar.url(email, {
        s: '200', //size
        r: 'pg', //rating
        d: 'mm'
      })

      user = new User({
        name,
        email,
        avatar,
        password
      })

      //encrypt password using bcrypt
      const salt = await bcrypt.genSalt(10)

      user.password = await bcrypt.hash(password, salt)

      await user.save()

      //return jsonwebtoken to allow user to log in right away; token provides this
      const payload = {
        user: {
          id: user.id
        }
      }

      //get json webtoken for accessing protected routes
      jwt.sign(
        payload,
        config.get('jwtToken'),
        {
          expiresIn: 360000
        },
        (err, token) => {
          if (err) throw err
          res.json({ token })
        }
      )
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
    }
  }
)

module.exports = router
