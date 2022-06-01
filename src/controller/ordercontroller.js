let cartModel = require('../model/cartModel')
const orderModel = require('../model/ordermodel')
const { isValid } = require('../validators/validator')



let createOrder = async (req,res)=>{
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
}
module.exports={createOrder}