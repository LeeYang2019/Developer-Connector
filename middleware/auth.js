const jwt = require('jsonwebtoken')
const config = require('config')

//exporting middleware function to get token
module.exports = function(req, res, next) {
  //get token from header
  const token = req.header('x-auth-token')

  //check if token exists
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' })
  }

  //verify token if there is one, if matches else...
  try {
    const decoded = jwt.verify(token, config.get('jwtToken'))
    req.user = decoded.user
    next()
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' })
  }
}
