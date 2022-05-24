const express = require('express');
const { createUser, doLogin, getdetails,updateuser } = require('../controller/userController');
const{authentication,authorization}=require('../middleware/authentication')


const router = express.Router();

const handler = fn =>(req,res,next)=> Promise.resolve(fn(req,res,next)).catch((error)=>catcher(error,req,res,next))
function catcher(err,req,res,next)
{
    res.status(500).send({status:false,msg:err.message})
}

//  first feature apis

router.post("/register",handler(createUser));

router.post("/login",doLogin );

router.get('/user/:userId/profile',authentication,authorization,getdetails)

router.put('/user/:userId/profile',authentication,authorization,updateuser)

module.exports = router;
