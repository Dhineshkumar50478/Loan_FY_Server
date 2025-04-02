const express = require('express');
const {userSignin,userSignup} = require('../controllers/sessionController');
const {protected, logOut} =require('../middlewares/protectedMiddleware');
const { authorize } = require('../middlewares/authorizationMiddleware');


const sessionRouter = express.Router();

sessionRouter.post('/signin', userSignin);
sessionRouter.post('/signup', userSignup);

sessionRouter.get("/logout",authorize("Admin"),logOut)
sessionRouter.get('/protect',protected)


module.exports = sessionRouter;
