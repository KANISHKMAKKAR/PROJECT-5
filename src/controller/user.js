const userModel=require('../models/userModel')

const userCreate=  async(req,res) => {
    try{
      let {fname,lname,email,phone,password,address}=req.body
let create=await userModel.create(req.body)
res.send({data:create})
}catch(err){
console.log(err.message)
}}


module.exports={userCreate}