const mongoose =require('mongoose')

const userDetailsSchema=mongoose.Schema({
  personalDetails:{ userName:String,
    gender:String,
    contactno:String,
    address:String,
    totalFamilyIncome:String,
    DOB:String,
    maritalStatus:String,
    alternateContactNo:String,
    employmentStatus:String,
    dependents:Number,
    cibilScore:Number,},
  employmentDetails:{
    designation:String,
    companyName:String,
    companyAddress:String,
    companyContactNo:String,
    employmentType:String,
    workExperience:Number,
    totalIncomePerMonth:Number
  },
  userCredentials:{
    email:String,
    password:String,
  },
  role:String
},{
  Schema:"userDetails"
})

const userDetailsModel=mongoose.model("userDetails",userDetailsSchema)
module.exports=userDetailsModel;