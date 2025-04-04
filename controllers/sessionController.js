const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userDetailsModel = require("../models/userDetailsModel");
const express = require("express");

dotenv.config();
const secretKey = process.env.JWTSECRET_KEY;

// Middleware to ensure JSON parsing
const app = express();
app.use(express.json());

// Helper function to generate JWT
const generatejwt = (payload, secretKey) => {
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

exports.userSignup = async (req, res) => {
  try {
    console.log("Received Request Body:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Invalid JSON input." });
    }

    // ✅ Extract values correctly
    const { 
      personalDetails: { userName, gender, contactno, address, totalFamilyIncome, DOB, maritalStatus, employmentStatus, alternateContactNo, dependents, cibilScore } = {},
      employmentDetails: { designation, companyName, companyAddress, companyContactNo, employmentType, workExperience, totalIncomePerMonth } = {},
      userCredentials: { email, password }
    } = req.body;

    // ✅ Ensure email is lowercase and trimmed
    const finalEmail = (email || "").trim().toLowerCase();
    const finalPassword = password || "";

    if (!userName || !finalEmail || !finalPassword) {
      return res.status(400).json({ 
        message: "Missing required fields.", 
        receivedFields: req.body
      });
    }

    // ✅ Log for debugging
    console.log("Checking if user exists with email:", finalEmail);

    // ✅ Check if user already exists (No regex, uses indexed search)
    const userExist = await userDetailsModel.findOne({
      "userCredentials.email": finalEmail
    });

    if (userExist) {
      return res.status(200).json({ message: "User already exists." });
    }

    // ✅ Hash the password before storing
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // ✅ Define role based on email
    const admins = ["dineshselvaraj50478@gmail.com", "dineshnayak50478@gmail.com"];
    const role = admins.includes(finalEmail) ? "Admin" : "User";

    // ✅ Save user data
    const userData = await userDetailsModel.create({
      personalDetails: {
        userName,
        email: finalEmail, // ✅ Email stored in lowercase
        password: hashedPassword,
        gender,
        contactno,
        address,
        totalFamilyIncome,
        DOB,
        maritalStatus,
        employmentStatus,
        alternateContactNo,
        dependents,
        cibilScore,
      },
      employmentDetails: {
        designation,
        companyName,
        companyAddress,
        companyContactNo,
        employmentType,
        workExperience,
        totalIncomePerMonth,
      },
      userCredentials: {
        email: finalEmail,
        password: hashedPassword, // ✅ Store hashed password here too
      },
      role,
    });

    // ✅ Generate JWT token
    const token = generatejwt({ userName, email: finalEmail, role }, secretKey);

    // ✅ Set secure cookies
    res.cookie("jwt", token, {
      maxAge: 3600000,
      httpOnly: true,
      secure: false, // Change to true in production
      sameSite: "Strict",
    });

    res.cookie("role", role, {
      maxAge: 3600000,
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    res.status(201).json({ message: "User successfully registered.", data: userData });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};




// Signin handler
exports.userSignin = async (req, res) => {
  try {
    console.log("Received Request Body:", req.body);

    const { userName,email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const userExist = await userDetailsModel.findOne({ "personalDetails.email": email });
    if (!userExist) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const validPassword = await bcrypt.compare(password, userExist.personalDetails.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generatejwt(
      { userName: userExist.personalDetails.userName, email, role: userExist.role },
      secretKey
    );

    res.cookie("jwt", token, {
      maxAge: 3600000,
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    res.status(200).json({ message: "Access granted.", token });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
