let productModel = require('../model/productModel')



let newProduct=(req,res)=>{
    let requestBody = req.body.data
    let create = await productModel.create(requestBody)
    res.status(201).send({status:false,message:"Successfully created",data:create})
    
}

let getProducts=(req,res)=>{

}


let getByIDProduct=(req,res)=>{

}

let updateByIDProduct=(req,res)=>{

}
let deleteByIDProduct=(req,res)=>{

}
module.exports={newProduct,getProducts,getByIDProduct,updateByIDProduct,deleteByIDProduct}