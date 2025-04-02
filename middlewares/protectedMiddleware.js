const jwt=require("jsonwebtoken")
const dotenv = require("dotenv");
dotenv.config();
const secretKey = process.env.JWTSECRET_KEY;

exports.protected=async (req,res)=>{
 try{
  const token=req.cookies;
  const decode=jwt.verify(token.jwt,secretKey)
  console.log(decode);
  res.status(200).json({status:"Authorize User"})
 }catch(err){
  console.log(err.message);
 }
}

exports.logOut=async(req,res)=>{
 res.cookie("jwt","",{httpOnly:true})
 res.status(200).json({
  status:"Logout Successfully"
 })
}