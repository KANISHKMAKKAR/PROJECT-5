const mongoose = require('mongoose')

let newProduct = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },//validnumber/decimal

    currencyId: {
        type: String,
        required: true
    },//INR

    currencyFormat: {
        type: String,
        required: true
    },//Rupee symbol

    isFreeShipping: {
        type: Boolean,
        default: false
    },

    productImage: {
        type: String,
        required: true
    },  // s3 link

    style: String,

    availableSizes: {
        type: [String],
        required:true,
        enum: ["S", "XS", "M", "X", "L", "XXL", "XL"]
    },

    installments: Number,

    deletedAt: {
        type: Date,
        default: null
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

},{timestamps:true})
module.exports = mongoose.model('Product',newProduct)