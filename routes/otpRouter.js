const express = require('express');
const otpRouter = express.Router();
const otpController = require('../controllers/otpController');

otpRouter.post('/send-otp', otpController.sendOtp);
otpRouter.post('/verify-otp', otpController.verifyOtp);

module.exports = otpRouter;
