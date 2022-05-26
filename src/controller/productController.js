let productModel = require('../model/productModel')
let uploadFile=require('../controller/awsController')
let {isValid,isvalidaddress,isvalidPincode,isValidPassword,isValidRequestBody,isValidfiles} = require('../validators/validator')
const currencySymbol = require("currency-symbol")

let newProduct= async (req,res)=>{
    try{
    let requestBody = req.body
    let {title,description, price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments} = requestBody
    let files = req.files
    
    if(!isValid(title))
    return res.status(400).send({status:false,message:"ADD A VALID TITLE"})
    let duplicateTitle = await productModel.findOne({title})
    if (duplicateTitle){
        return res.status(400).send({status:false,message:"TITLE already present"})
    }
 
    if(!isValid(description))
    return res.status(400).send({status:false,message:"ADD VALID DESCRIPTION"})
   

    if(!price.match(/^[1-9]\d{0,9}(\.\d{1,3})?%?$/))
    return res.status(400).send({status:false,message:"ADD VALID PRICE"})

    if(currencyId != "INR")
    return res.status(400).send({status:false,message:"ADD VALID CURRENCY"})

    
    currencyFormat="₹"
   if(isFreeShipping){
       if(typeof isFreeShipping!=Boolean)
       return res.status(400).send({status:false,message:"FREE SHIPPING MUST BE A BOOLEAN VALUE"})
   }
   if(!isValidfiles(files))
    return res.status(400).send({status:false,message:"ADD PRODUCT IMAGE"})

    let productImage = await uploadFile.uploadFile(files[0])




     availableSizes=availableSizes.split(",")
     console.log(availableSizes)
   for(let i=0;i<availableSizes.length;i++){
       if(!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i]))
   return res.status(400).send({status:false,message:"AVAILABLE SIZE CAN BE S,XS,M,X,L,XXL,XL"})
   }
   let CREATE={title,description, price,currencyId,currencyFormat,isFreeShipping,style,availableSizes,installments,productImage}
   let create = await productModel.create({...CREATE})
    res.status(201).send({status:false,message:"Successfully created",data:create})
    
}catch(err){
    return res.status(500).send({status:false,message:err.message})
}
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