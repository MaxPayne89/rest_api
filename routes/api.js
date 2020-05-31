var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');
const User = require('../models').User;
const Course = require('../models').Course;

//middleware for handling asynchronous requests
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.status(500).send(error);
    }
  }
}
//middleware that authenticates users
const authenticateUser = async (req, res, next) => {
  let message = null;

  const credentials = auth(req)

  if(credentials){
    //look for the in the db
    const user = await User.findOne({ where: { emailAddress: credentials.name}})

    if(user){
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password)
      if(authenticated){
        console.log(`Authentication successful for User: ${user.firstName} ${user.lastName}`)
        req.currentUser = user;
      }else {
        message = `Authentication failure for Username: ${user.emailAddress}`
      }
    } else {
      message = `User for username: ${credentials.name} not found`
    }
  } else {
    message = "Auth header not found"
  }

  if(message){
    console.warn(message)
    res.status(401).json({ message: 'Access Denied'})
  } else {
    next()
  }
}

//The User routes
router.get('/users', authenticateUser ,asyncHandler(async (req, res) => {
  // const users = await User.findAll({ order: [["id", "ASC"]] })
  // res.json(users)
  const user = req.currentUser;

  res.json({
    name: user.firstName + ' ' + user.lastName,
    username: user.emailAddress
  })
}))

router.post('/users', asyncHandler(async (req, res) => {

}))


module.exports = router