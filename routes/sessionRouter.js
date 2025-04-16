const express = require('express');
const {userSignin,userSignup, updateUserPassword} = require('../controllers/sessionController');
const {protected, logOut} =require('../middlewares/protectedMiddleware');
const { authorize } = require('../middlewares/authorizationMiddleware');
const { getUserById } = require('../controllers/sessionController');


const sessionRouter = express.Router();

sessionRouter.post('/signin', userSignin);
sessionRouter.post('/signup', userSignup);

sessionRouter.get("/logout",authorize("Admin"),logOut)
sessionRouter.get('/protect',protected)
sessionRouter.post('/updatePassword',updateUserPassword)

sessionRouter.get('/getUser/:id',getUserById)


module.exports = sessionRouter;
