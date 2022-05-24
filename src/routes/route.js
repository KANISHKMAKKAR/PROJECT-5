const express=require("express")
const userController = require("../controller/user")
const router=express.Router()

router.get("/test",(req,res)=>{
  console.log("group46")
})

router.post("/register",userController.userCreate)


module.exports=router