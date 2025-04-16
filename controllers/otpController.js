const nodemailer = require('nodemailer');
const otpModel = require("../models/userOtpModel");
const dotEnv=require('dotenv');
dotEnv.config()

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  },
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    // Delete any existing OTPs before sending a new one
    await otpModel.deleteMany({ email });

    const otpCode = generateOTP();

    // Save OTP to DB
    const otpDoc = new otpModel({ email, otp: otpCode });
    await otpDoc.save();

    // Send Email
    await transporter.sendMail({
      from: 'loaneaseofficial@gmail.com',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otpCode}. It will expire in 5 minutes.`
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

  try {
    const record = await otpModel.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP matched – delete it after verification
    await otpModel.deleteOne({ _id: record._id });

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};
