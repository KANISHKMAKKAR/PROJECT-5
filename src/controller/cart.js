const cartModel = require('../model/cartModel')
let productModel = require('../model/productModel')
const mongoose = require("mongoose")

let AddCart = async (req, res) => {

  let UserId = req.params.userId;
  let { productId, cartId } = req.body;
  let cartDeatil;
  //const product = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } })

  if (cartId) {
    if (!mongoose.isValidObjectId(cartId))
      return res.status(400).send({ status: false, message: "Invalid cartId" })
      
    cartDeatil = await cartModel.findOne({ _id: cartId, userId: UserId })
    if (!cartDeatil)
      return res.status(404).send({ status: false, message: "No cart found with provided cart Id" })
  }
  else {
    cartDeatil = await cartModel.findOne({ userId: UserId })
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).send({ status: false, message: "Invalid productId" })
  }

  let ProductDeatil = await productModel.findOne({ _id: productId, isDeleted: false })

  if (!ProductDeatil) {
    return res.status(404).send({ status: false, message: "No product found with provided product Id", })
  }

  if (!cartDeatil) {
    let cart = await cartModel.create({
      userId: UserId,
      items: [{
        productId: ProductDeatil.id,
        quantity: 1
      }],
      totalPrice: ProductDeatil.price,
      totalItems: 1
    }
    )
    return res.status(201).send({ status: false, message: "Successfully created", data: cart })
  } else {
    const product = await cartModel.findOne({ items: { $elemMatch: { productId: productId } }, userId: UserId })

    if (!product) {

      let addData = {
        productId: productId,
        quantity: 1
      }
      cartDeatil.items.push(addData)
      cartDeatil.totalItems = cartDeatil.totalItems + 1
      cartDeatil.totalPrice = cartDeatil.totalPrice + ProductDeatil.price
      cartDeatil.save()
      return res.status(201).send({ status: false, message: "Successfully created", data: cartDeatil })

    } else {
      const product = await cartModel.findOneAndUpdate({ "items.productId": productId, userId: UserId }, { $inc: { "items.$.quantity": 1, totalItems: 1, totalPrice: ProductDeatil.price } }, { new: true })

      
      return res.status(201).send({ status: false, message: "Successfully created", data: product })
    }
  }

}
const changeCart = async (req, res) => {
  try {
    let UserId = req.params.userId;
    let { productId, cartId, removeProduct } = req.body;
    let cartDeatil;
    //const product = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } })

    if (!cartId) {
      return res.status(404).send({ status: false, message: "cartId is mandatory" })
    }
    if (!mongoose.isValidObjectId(cartId))
      return res.status(400).send({ status: false, message: "Invalid cartId" })

    cartDeatil = await cartModel.findOne({ _id: cartId, userId: UserId })
    if (!cartDeatil)
      return res.status(404).send({ status: false, message: "No cart found with provided cart Id" })


    if (!mongoose.isValidObjectId(productId)) 
      return res.status(400).send({ status: false, message: "Invalid productId" })

    let ProductDeatil = await productModel.findOne({ _id: productId, isDeleted: false }).lean()
    if (!ProductDeatil) 
      return res.status(404).send({ status: false, message: "No product found with provided product Id", })


    let index = cartDeatil.items.findIndex((element) => element.productId.toString() == productId)

    if (index == -1)
      return res.status(400).send({ status: false, message: "No product available in cart corresponding to provided productId" })

    if (!(removeProduct == 0 || removeProduct == 1))
      return res.status(400).send({ status: false, message: "removeProduct can contain only 0 or 1" })

    let quantity = cartDeatil.items[index].quantity;
    if (removeProduct == 0) {
      cartDeatil.items.splice(index, 1)
      cartDeatil.totalItems -= quantity;
      cartDeatil.totalPrice -= quantity * ProductDeatil.price;
    }
    else {
      if (quantity == 1)
        cartDeatil.items.splice(index, 1)
      else
        cartDeatil.items[index].quantity -= 1
      cartDeatil.totalItems -= 1;
      cartDeatil.totalPrice -= ProductDeatil.price;
    }

    cartDeatil.save()

    res.status(200).send({ status: true, message: "Updated Successfully", data: cartDeatil })
  }

  catch (err) {
    res.status(200).send({ status: true, message: err.message })
  }
}

const getCart = async (req,res) => {
  try {
    let userId = req.params.userId;
    const cartDeatil = await cartModel.findOne({userId:userId,isDeleted:false})
    if(!cartDeatil)
    return res.status(400).send({status:false,message:"No cart exist with provided userId"})

      res.status(200).send({status:false,message:"Success",data:cartDeatil})
  }
  catch(error) {
    res.status(500).send({status:false,message:error.message})
  }
}

const deleteCart = async (req,res)=> {
  try {
    let userId = req.params.userId;
    const cartDetail = await cartModel.findOneAndUpdate({userId:userId,isDeleted:false},{items:[],totalItems:0,totalPrice:0},{new:true})

    res.status(200).send({status:true,message:cartDetail})
  }
  catch (error){
 res.status(500).send({status:false,message:error.message})
  }
}

module.exports = { AddCart, changeCart,getCart,deleteCart }