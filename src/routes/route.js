const express = require('express');
const { createUser, doLogin, getdetails,updateuser } = require('../controller/userController');
const{authentication,authorization}=require('../middleware/authentication')


const router = express.Router();


//  USer api's

router.post("/register",createUser);

router.post("/login",doLogin );

router.get('/user/:userId/profile',authentication,authorization,getdetails)

router.put('/user/:userId/profile',authentication,authorization,updateuser)

// Product api's

router.post('/products')

module.exports = router;
