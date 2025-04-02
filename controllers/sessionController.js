const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userCredentialModel = require("../models/userCredentialModel");

dotenv.config();
const secretKey = process.env.JWTSECRET_KEY;

// Helper function to generate JWT
const generatejwt = (payload, secretKey) => {
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

// Signup handler
exports.userSignup = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    // Check if user already exists
    const userExist = await userCredentialModel.findOne({ email });
    if (userExist) {
      return res.status(409).json({ message: "User already exists." }); // Use 409 for conflict
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admins = ["dineshselvaraj50478@gmail.com", "dineshnayak50478@gmail.com"];
    const role = admins.includes(email) ? "Admin" : "User";

    const userData = await userCredentialModel.create({
      userName,
      email,
      password: hashedPassword,
      role,
    });

    const token = generatejwt({ userName, email }, secretKey);
    res.cookie("jwt", token, {
      maxAge: 3600000,
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "Strict",
    });

    res.cookie("role", role, {
      maxAge: 3600000,
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: "Strict",
    });

    res.status(201).json({ message: "User successfully registered.", data: userData }); // Use 201 for created
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// Signin handler
exports.userSignin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExist = await userCredentialModel.findOne({ email });

    if (!userExist || !(await bcrypt.compare(password, userExist.password))) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generatejwt({ userName: userExist.userName, email }, secretKey);
    res.cookie("jwt", token, {
      maxAge: 3600000,
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
    });
    res.status(200).json({ message: "Access granted." });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
