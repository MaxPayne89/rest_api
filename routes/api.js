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
//get currently authenticated user
router.get('/users', authenticateUser ,asyncHandler(async (req, res) => {
  const user = req.currentUser;
  //format the res to be lil nicer
  res.json({
    name: user.firstName + ' ' + user.lastName,
    username: user.emailAddress
  })
}))
//create a new user
router.post('/users',[
  check('firstName')
    .exists({ checkNull: true, checkFalsy: true})
    .withMessage('Please provide a value for "firstName"'),
  check('lastName')
    .exists({ checkNull: true, checkFalsy: true})
    .withMessage('Please provide a value for "lastName"'),
  check('emailAddress')
    .exists({ checkNull: true, checkFalsy: true})
    .withMessage('Please provide a value for "emailAddress"'),
  check('password')
    .exists({ checkNull: true, checkFalsy: true})
    .withMessage('Please provide a value for "password"')
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    //if there are any
    if(!errors.isEmpty()){
      const errorMessages = errors.array().map(err => err.msg)
      return res.status(400).json({ errors: errorMessages })
    }

    const user = req.body;
    user.password = bcryptjs.hashSync(user.password)

    await User.create({ ...user })

    return res.status(201).end()

}))
//course routes
//get all courses
router.get('/courses', asyncHandler(async (req, res) => {
  const courses = await Course.findAll({order: [["id", "ASC"]] })
  res.json(courses)
}))
//get one course
router.get('/courses/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id)
  if(course){
    res.json(course)
  }else {
    res.status(400).json({ msg: "Could not find a course with a corresponding ID"})
  }
}))
//create new course
router.post('/courses', authenticateUser,[
  check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "title"!'),
  check('description')
    .exists({ checkNull: true, checkFalsy: true})
    .withMessage('Please provide a value for "description"!'),
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    //if there are any
    if(!errors.isEmpty()){
      const errorMessages = errors.array().map(err => err.msg)
      return res.status(400).json({ errors: errorMessages })
    }

    const course = req.body;
    course.userId = req.currentUser.id;

    await Course.create({...course})

    return res.status(201).end()

}))

router.put('/courses/:id', authenticateUser, [
  check('title')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Please provide a value for "title"!'),
  check('description')
    .exists({ checkNull: true, checkFalsy: true})
    .withMessage('Please provide a value for "description"!'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    const errorMessages = errors.array().map(err => err.msg)
    return res.status(400).json({ errors: errorMessages })
  }

  const courseToBeUpdated = await Course.findByPk(req.params.id)
  //if it exists
  if(courseToBeUpdated){
    const updates = req.body;
    await courseToBeUpdated.update({ ...updates });
    return res.status(204).end()
  }else {
    return res.status(400).json({ msg: "Could not find a course with a corresponding ID!"})
  }

}))


module.exports = router