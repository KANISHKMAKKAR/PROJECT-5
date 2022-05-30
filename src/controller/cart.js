const cartModel = require('../model/cartModel')
let productModel = require('../model/productModel')
const mongoose=require("mongoose")

let AddCart = async (req, res) => {

  let UserId = req.params.userId;
  let { productId } = req.body;
  //const product = await cartModel.findOne({ items: { $elemMatch: { productId: productId } } })
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).send({ status: false, message: "Invalid productId" })
  }
  let cartDeatil = await cartModel.findOne({ userId: UserId })
  let ProductDeatil = await productModel.findOne({ _id: productId, isDeleted: false })

  if (!ProductDeatil) {
    return res.status(400).send({ status: false, message: "Product not valid", })
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
module.exports = { AddCart }