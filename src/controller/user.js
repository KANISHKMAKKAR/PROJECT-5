const userModel=require('../models/userModel')

const userCreate=  async(req,res) => {
    try{
        req.body.address=JSON.parse(req.body.address)
let create=await userModel.create(req.body)
res.send({data:create})
}catch(err){
console.log(err.message)
}}


module.exports={userCreate}