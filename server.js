const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const PORT=8000;
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://dineshselvaraj50478:Dhinesh8833@cluster0.f9s6a.mongodb.net/profileDB?retryWrites=true&w=majority&appName=Cluster0"
    );
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};
connectDB();

// ✅ Mongoose schema
const ProfileSchema = new mongoose.Schema({
  user_id: { type: String, unique: true, required: true },
  Name: String,
  DOB: String,
  Age: Number,
  Gender: String,
  Maritial_Status: String,
  Dependents: Number,
  Education: String,
  Employment_Status: String,
  Total_Income: Number,
  Residential_Status: String,
  Rent_Amount: Number,
  Cibil_Score: Number,
  Contact_No: String,
  Address: String,
  Loan_Type: { type: String, default: "" },
  Loan_Amount: { type: Number, default: 0 },
  Loan_Term: { type: Number, default: 0 },
  Existing_EMI: { type: Number, default: 0 },
  Email: { type: String, required: true },
  Password: { type: String, required: true },
  Loan_Emi: { type: Number, default: 0 }, //new field added loan_emi
  Loan_Status: { type: String, default: "" }, // new field added loan_status
});

const Profile = mongoose.model("Profile", ProfileSchema);

const approvedLoanSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  Name: { type: String, required: true },
  Total_Income: { type: Number, required: true },
  Loan_Type: { type: String, required: true },
  Loan_Amount: { type: Number, required: true },
  Loan_Term: { type: Number, required: true },
  Loan_Emi: { type: Number, required: true },
  approval_date: { type: Date, default: Date.now },
});

const ApprovedLoan = mongoose.model("ApprovedLoan", approvedLoanSchema);

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "loaneaseofficial@gmail.com",
    pass: "ubcc aofy uuhj myao",
  },
});

app.post("/profile_completion", async (req, res) => {
  user_name = req.body.eli_values.Name;
  dob = req.body.eli_values.DOB;
  gender = req.body.eli_values.Gender;
  martial_status = req.body.eli_values.Maritial_Status;
  dependents = req.body.eli_values.Dependents;
  age = req.body.eli_values.Age;
  education = req.body.eli_values.Education;
  employment_status = req.body.eli_values.Employment_Status;
  income = req.body.eli_values.Total_Income;
  residential_status = req.body.eli_values.Residential_Status;
  rent_amount = req.body.eli_values.Rent_Amount;
  cibil_score = req.body.eli_values.Cibil_Score;
  contact_no = req.body.eli_values.Contact_No;
  address = req.body.eli_values.Address;
  console.log(
    user_name,
    dob,
    gender,
    martial_status,
    dependents,
    age,
    education,
    employment_status,
    income,
    residential_status,
    rent_amount,
    cibil_score,
    contact_no,
    address
  );
  try {
    const {
      Name,
      DOB,
      Gender,
      Maritial_Status,
      Dependents,
      Age,
      Education,
      Employment_Status,
      Total_Income,
      Residential_Status,
      Rent_Amount,
      Cibil_Score,
      Contact_No,
      Address,
      Email,
      Password,
    } = req.body.eli_values;

    // 1️⃣ Get the last created profile
    const lastProfile = await Profile.findOne().sort({ user_id: -1 }).exec();

    // 2️⃣ Extract the number and increment it
    let newIdNumber = 1; // Default for first user
    if (lastProfile && lastProfile.user_id) {
      const lastId = lastProfile.user_id.replace("LP", ""); // Remove LP
      newIdNumber = parseInt(lastId) + 1;
    }

    // 3️⃣ Format the new ID as LP001, LP002, etc.
    const user_id = `LP${String(newIdNumber).padStart(3, "0")}`;

    const newProfile = new Profile({
      user_id,
      Name,
      DOB,
      Age,
      Gender,
      Maritial_Status,
      Dependents,
      Education,
      Employment_Status,
      Total_Income,
      Residential_Status,
      Rent_Amount,
      Cibil_Score,
      Contact_No,
      Address,
      Loan_Amount: 0,
      Loan_Term: 0,
      Existing_EMI: 0,
      Email,
      Password,
    });

    await newProfile.save();

    // ✅ Send Email with user_id
    const mailOptions = {
      from: "loaneaseofficial@gmail.com",
      to: Email,
      subject: "🎉 Profile Created Successfully!",
      html: `
        <h2>Hello ${Name},</h2>
        <p>Your profile has been successfully created.</p>
        <p><strong>Your User ID:</strong> ${user_id}</p>
        <br/>
        <p>Thanks for registering with us!</p>
        <p><em>LoanPort Team</em></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to", Email);

    console.log("✅ Profile Saved:", newProfile);
    res.status(201).json({ message: "Profile saved successfully" });
  } catch (error) {
    console.error("❌ Error saving profile:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/update_loan", async (req, res) => {
  const { user_id, loan_type, loan_amount, loan_term, existing_emi } = req.body;

  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id: user_id }, // use unique field here ideally (like contact/email)
      {
        $set: {
          Loan_Type: loan_type,
          Loan_Amount: loan_amount,
          Loan_Term: loan_term,
          Existing_EMI: existing_emi,
        },
      },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    console.log("Updated Profile:", updatedProfile);
    res.status(200).json({ message: "Loan data updated successfully" });
  } catch (error) {
    console.error("Error updating loan data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/get_user/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const user = await Profile.findOne({ user_id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user); // send full profile
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/get_user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ user_id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/update_profile", async (req, res) => {
  const updatedProfile = req.body;

  if (!updatedProfile.user_id) {
    return res.status(400).json({ message: "User ID is required for update." });
  }

  try {
    const profile = await Profile.findOneAndUpdate(
      { user_id: updatedProfile.user_id },
      { $set: updatedProfile },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const multer = require("multer");
const storage = multer.memoryStorage(); // Store files as Buffer
const upload = multer({ storage: storage });

app.post(
  "/upload_documents",
  upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "employmentId", maxCount: 1 },
    { name: "salarySlip", maxCount: 1 },
  ]),
  async (req, res) => {
    const { user_id } = req.body;

    try {
      // 🔹 Fetch the profile first
      const profile = await Profile.findOne({ user_id });

      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // 🔹 Only after fetching, generate dynamic profile details
      let profileDetailsHtml = "";
      for (const [key, value] of Object.entries(profile.toObject())) {
        if (key !== "password" && typeof value !== "object" && value !== null) {
          profileDetailsHtml += `<p><strong>${key}:</strong> ${value}</p>`;
        }
      }

      // 🔹 Compose the email with attachments
      const mailOptions = {
        from: "loaneaseofficial@gmail.com",
        to: "loaneaseofficial@gmail.com",
        subject: `📄 Document Submission for User ID: ${user_id}`,
        html: `
          <h3>📌 Profile Summary</h3>
          ${profileDetailsHtml}
          <hr/>
          <h3>📎 Attached Documents:</h3>
          <ul>
            <li>Aadhar.pdf</li>
            <li>PAN.pdf</li>
            <li>EmploymentID.pdf</li>
            <li>SalarySlip.pdf</li>
          </ul>
        `,
        attachments: [
          {
            filename: "Aadhar.pdf",
            content: req.files["aadhar"][0].buffer,
          },
          {
            filename: "PAN.pdf",
            content: req.files["pan"][0].buffer,
          },
          {
            filename: "EmploymentID.pdf",
            content: req.files["employmentId"][0].buffer,
          },
          {
            filename: "SalarySlip.pdf",
            content: req.files["salarySlip"][0].buffer,
          },
        ],
      };

      // 🔹 Send the email
      await transporter.sendMail(mailOptions);
      console.log("✅ Documents emailed successfully");

      res
        .status(200)
        .json({ message: "Documents emailed to verification team" });
    } catch (error) {
      console.error("❌ Error sending documents:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.post("/update_loan_status", async (req, res) => {
  const { user_id, emi } = req.body;
  console.log(user_id, emi);

  try {
    const result = await Profile.findOneAndUpdate(
      { user_id },
      { Loan_Emi: emi, Loan_Status: "Pending" },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Loan status updated", data: result });
  } catch (err) {
    console.error("❌ Error updating loan status:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
});

app.post("/contact-msg", (req, res) => {
  const { name, email, query } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "loaneaseofficial@gmail.com",
      pass: "erav gpxv tdji pfyz",
    },
  });

  const emailContent = `
    <div style="font-family: Arial, sans-serif; padding: 30px; background-color: #f4f4f4; border-radius: 8px; text-align: center;">
      <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">New Client Message</h2>
        <p style="font-size: 16px; color: #555;">You’ve received a message from a potential client. Here are the details:</p>

        <table style="width: 100%; margin-top: 20px; font-size: 16px; color: #444;">
          <tr>
            <td style="font-weight: bold; padding: 10px; text-align: right;">Name:</td>
            <td style="padding: 10px; text-align: left;">${name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 10px; text-align: right;">Email:</td>
            <td style="padding: 10px; text-align: left;">${email}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 10px; text-align: right; vertical-align: top;">Message:</td>
            <td style="padding: 10px; text-align: left;">${query}</td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #777; margin-top: 30px;">Please reach out to the client using the provided email address.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: "loaneaseofficial@gmail.com",
    to: "loaneaseofficial@gmail.com",
    subject: "Client Query",
    html: emailContent,
  };

  transporter
    .sendMail(mailOptions)
    .then(() => {
      console.log("Mail sent successfully");
      res.status(200).json({ message: "Mail sent successfully" });
    })
    .catch((err) => {
      console.error("Error sending mail:", err);
      res.status(500).json({ message: "Error sending email" });
    });
});

app.post("/signin", async (req, res) => {
  const { userid, password } = req.body;

  // Validation
  if (!userid || !password) {
    return res
      .status(400)
      .json({ message: "User ID and Password are required." });
  }

  try {
    // Match with MongoDB fields
    const user = await Profile.findOne({ user_id: userid, Password: password });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid credentials. Please try again." });
    }

    const userData = {
      user_id: user.user_id,
      Name: user.Name,
      Email: user.Email,
      DOB: user.DOB,
    };

    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.error("Error during signin:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ✅ GET profiles based on loan status
app.get("/api/profiles", async (req, res) => {
  try {
    const status = req.query.status || "Pending";
    
    // Fetch from the correct collection based on status
    let profiles;
    if (status === "Approved") {
      profiles = await ApprovedLoan.find();  // Fetch data from ApprovedLoan collection
    } else {
      profiles = await Profile.find({ Loan_Status: status });  // Fetch data from Profile collection
    }
    
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profiles", error });
  }
});


// ✅ UPDATE loan status by _id
app.put("/api/profiles/:id", async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "loaneaseofficial@gmail.com",
      pass: "rvhc nbjb lccf bkpj", // ⚠️ Move this to environment variables for safety
    },
  });

  try {
    const { Loan_Status } = req.body;

    // Find and update the loan status
    const updatedProfile = await Profile.findByIdAndUpdate(
      req.params.id,
      { Loan_Status },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // If approved, store details in ApprovedLoan collection
    if (Loan_Status === "Approved") {
      const approvedLoan = new ApprovedLoan({
        user_id: updatedProfile.user_id,
        Name: updatedProfile.Name,
        Total_Income: updatedProfile.Total_Income,
        Loan_Type: updatedProfile.Loan_Type,
        Loan_Amount: updatedProfile.Loan_Amount,
        Loan_Term: updatedProfile.Loan_Term,
        Loan_Emi: updatedProfile.Loan_Emi,
      });

      // Save the approved loan data to the ApprovedLoan collection
      await approvedLoan.save();
    }

    const subject =
      Loan_Status === "Approved"
        ? "🎉 Loan Approved - Congratulations!"
        : "⚠️ Loan Application Status - Rejected";

    const message =
      Loan_Status === "Approved"
        ? `Dear ${updatedProfile.Name},

Congratulations! We are pleased to inform you that your loan application has been **approved**.

Our team will reach out to you shortly to guide you through the next steps.

Thank you for trusting **LoanPort**!

Warm regards,  
LoanPort Team`
        : `Dear ${updatedProfile.Name},

We regret to inform you that your loan application has been **rejected** due to incomplete or incorrect document submission.

Please review your application and consider reapplying with the necessary corrections.

If you have any questions, feel free to contact our support team.

Sincerely,  
LoanPort Team`;

    // Send email notification
    await transporter.sendMail({
      from: '"LoanPort Notifications" <loaneaseofficial@gmail.com>',
      to: updatedProfile.Email,
      subject,
      text: message,
    });

    res.json(updatedProfile);
  } catch (error) {
    console.error("Error updating loan status:", error);
    res.status(500).json({ message: "Error updating loan status", error });
  }
});

app.get('/api/loan-stats', async (req, res) => {
  try {
    const totalAccounts = await Profile.countDocuments();

    const loanTypes = ['Home Loan', 'Education Loan', 'Vehicle Loan', 'Personal Loan', 'Gold Loan'];

    const pendingLoans = await Profile.aggregate([
      { $match: { Loan_Status: 'Pending' } }, // Case-sensitive
      { $group: { _id: "$Loan_Type", count: { $sum: 1 } } }
    ]);

    const approvedLoans = await ApprovedLoan.aggregate([
      { $group: { _id: "$Loan_Type", count: { $sum: 1 } } }
    ]);

    const stats = loanTypes.map((type) => {
      const approved = approvedLoans.find(l => l._id === type)?.count || 0;
      const pending = pendingLoans.find(l => l._id === type)?.count || 0;
      return { label: type, approved, pending };
    });

    res.json({ totalAccounts, stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});


// ADMIN ROLE
const ADMIN_EMAIL = "loaneaseofficial@gmail.com";
let otpStore = {}; // { email: { otp: '123456', expiresAt: timestamp } }

// ✅ Send OTP
app.post("/api/admin/send-otp", async (req, res) => {
  const { email } = req.body;

  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({ success: false, message: "You are not the admin" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins expiry
  otpStore[email] = { otp, expiresAt };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ADMIN_EMAIL,
      pass: "runj rgtg aqkx qcry",
    },
  });

  try {
    await transporter.sendMail({
      from: `"LoanEase Admin Login" <${ADMIN_EMAIL}>`,
      to: email,
      subject: "Admin OTP Verification",
      text: `Your OTP for admin login is: ${otp}`,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// ✅ Verify OTP
app.post("/api/admin/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ success: false, message: "OTP expired or not found" });
  }

  if (record.otp !== otp) {
    return res.status(401).json({ success: false, message: "Invalid OTP" });
  }

  delete otpStore[email];
  res.json({ success: true, message: "OTP verified. Redirecting to admin portal..." });
});

//forgot password

// ✅ Send OTP
app.post("/api/otp/send-otp", async (req, res) => {
  const { email } = req.body;

  const user=await Profile.findOne({ Email:email });

  if (!user) {
    return res.status(403).json({ success: false, message: "Not registered? Create an account first" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins expiry
  otpStore[email] = { otp, expiresAt };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: ADMIN_EMAIL,
      pass: "runj rgtg aqkx qcry",
    },
  });

  try {
    await transporter.sendMail({
      from: `"LoanEase Admin Login" <${ADMIN_EMAIL}>`,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP for password reset is: ${otp}`,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// ✅ Verify OTP
app.post("/api/otp/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ success: false, message: "OTP expired or not found" });
  }

  if (record.otp !== otp) {
    return res.status(401).json({ success: false, message: "Invalid OTP" });
  }

  delete otpStore[email];
  res.json({ success: true, message: "OTP verified. Successfully" });
});

// ✅ Update Password
app.post("/api/otp/updatePassword", async (req, res) => {
  const { email, newPassword } = req.body;
  console.log(email,newPassword);
  

  try {
    // Check if the user exists
    const user = await Profile.findOne({ Email: email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update password
    await Profile.updateOne({ Email: email }, { Password: newPassword });

    res.status(201).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} successfully....`);
});
