const express = require('express');
const { createUser, doLogin, getdetails,updateuser } = require('../controller/userController');
const{authentication,authorization}=require('../middleware/authentication')


const router = express.Router();

const errHandler = (fn) =>async (req,res,next)=> {
    try {
       await fn(req,res,next)
    }
    catch(error){
        res.status(500).send({status:false,msg:error.message})
    }
}

//  first feature apis

router.post("/register",errHandler(createUser));

router.post("/login",doLogin);

router.get('/user/:userId/profile',authentication,authorization,errHandler(getdetails))

router.put('/user/:userId/profile',authentication,authorization,updateuser)

module.exports = router;
