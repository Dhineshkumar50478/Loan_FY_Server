const express=require('express');
const mongoose =require('mongoose');
const dotenv=require('dotenv')
const cors=require('cors');
// const cookieparser=require('cookie-parser');
const sessionRouter = require('./routes/sessionRouter');
const otpRouter = require('./routes/otpRouter');

dotenv.config()
const port=process.env.PORT||3002;

mongoose.connect(process.env.CONNECTION_STRING).then(()=>{
  console.log("Connected to DB");
})


const app=express();
app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true); // Accept all origins
  },
  credentials: true, // If you're using cookies
}));




app.use("/user",sessionRouter)
app.use("/otp",otpRouter)


app.listen(port,()=>{
    console.log(`Server is running on ${port}`);
})