const  mongoose = require('mongoose')
let cartModel = require('../model/cartModel')
const orderModel = require('../model/ordermodel')
const { isValid, isValidRequestBody } = require('../validators/validator')



let createOrder = async (req,res)=>{
    try{
    let userId=req.params.userId
    let {status,cancellable}=req.body
   
 let cart = await cartModel.findOne({userId:userId})
 if(!cart)
 return res.status(400).send({status:false,message:"EMPTY CART"})
 if(cart.items.length==0){
    return res.status(400).send({status:false,message:"EMPTY CART"})
 }
 
 if(status||status===""){
     if(!isValid(status)){
         return res.status(400).send({status:false,message:"NOT VALID STATUS"})
     }if(status=="pending"||status=="completed"||status=="cancelled"){
         status=status
        }
         else
         return res.status(400).send({status:false,message:"STATUS CAN ONLY BE SET WITH PENDING,COMPLETED,CANCELLED"})
     }
     
     if(cancellable||cancellable===""){
         if(cancellable=="true"||cancellable=="false"){
             cancellable=cancellable
         }
         else
         return res.status(400).send({status:false,message:"CANCELLABLE CAN ONLY BE TRUE OR FALSE"})
     }
 

 let totalQuantity=0
for(let i=0;i<cart.items.length;i++){
    
    totalQuantity += cart.items[i].quantity
}

 let order ={
     userId:userId,
     items:cart.items,
     totalPrice:cart.totalPrice,
     totalItems:cart.totalItems,
     totalQuantity:totalQuantity,
     status:status,
     cancellable:cancellable


 }
 let result = await orderModel.create(order)
 let emptycart = await cartModel.findOneAndUpdate({userId:userId},{items:[],totalItems:0,totalPrice:0})

     res.status(201).send({status:true,message:"Order generated",data:result})
}catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}

let updateORder=async (req,res)=>{
    try{
let userId =req.params.userId
let{orderId,status}=req.body

if(!isValidRequestBody(req.body))

return res.status(400).send({status:false,message:"EMPTY BODY"})

if(!orderId){
    return res.status(400).send({status:false,message:"ORDER ID IS MANDATORY"})
}
if(!mongoose.Types.ObjectId.isValid(orderId)){
    return res.status(400).send({status:false,message:"NOT A VALID ORDER ID"})
}

let order = await orderModel.findOne({_id:orderId})

if(!order)
return res.status(404).send({status:false,message:"NOT FOUND"})

if(!status){
    return res.status(400).send({status:false,message:"STATUS MANDATORY"})
}
if(!["completed","cancelled"].includes(status)){
    return res.status(400).send({status:false,message:"STATUS CAN BE COMPLETED OR CANCELLED"})
}
if(order.userId.toString() !== userId){
    return res.status(403).send({status:false,message:"USER ID DOES NOT BELONG TO THE GIVEN ORDER ID"})
}
if(order.status !== "pending"){
    return res.status(400).send({status:false,message:"ORDER STATUS IS "+ order.status + " YOU CANNOT UPDATE THIS"})
}
if(status ==="cancelled" && order.cancellable==false){
    return res.status(400).send({status:false,message:"THIS ORDER CAN NOT BE CANCELLED"})
}

let update = await orderModel.findOneAndUpdate({_id:orderId},{$set:{status:status,cancellable:false}},{new:true})
return res.status(200).send({status:true,message:"Updated Successfully",data:update})
}
catch (error) {
    res.status(500).send({ status: false, message: error.message })
  }
}
module.exports={createOrder,updateORder}