let productModel = require('../model/productModel')



let newProduct=(req,res)=>{
    let requestBody = req.body.data
    let create = await productModel.create(requestBody)
    res.status(201).send({status:false,message:"Successfully created",data:create})
    
}
module.exports={newProduct}