const mongoose =require('mongoose')

const userCredentialSchema=mongoose.Schema({
  userName:String,
  email:String,
  password:String,
  role:String
},{
  Schema:"userCredentials"
})

const userCredentialModel=mongoose.model("userCredentials",userCredentialSchema)
module.exports=userCredentialModel;