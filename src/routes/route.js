const express = require('express');
const { AddCart } = require('../controller/cart');
const { newProduct, getProducts, getByIDProduct, updateByIDProduct, deleteByIDProduct } = require('../controller/productController');
const { createUser, doLogin, getdetails,updateuser } = require('../controller/userController');
const{authentication,authorization}=require('../middleware/authentication')


const router = express.Router();


//  USer api's

router.post("/register",createUser);

router.post("/login",doLogin );

router.get('/user/:userId/profile',authentication,authorization,getdetails)

router.put('/user/:userId/profile',authentication,authorization,updateuser)

// Product api's

router.post('/products',newProduct)
router.get('/products',getProducts)
router.get('/products/:productId',getByIDProduct)
router.put('/products/:productId',updateByIDProduct)
router.delete('/products/:productId',deleteByIDProduct)

//CART API

router.post("/users/:userId/cart",AddCart)



module.exports = router;
