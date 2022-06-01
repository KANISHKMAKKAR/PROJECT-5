let productModel = require('../model/productModel')
let uploadFile = require('../controller/awsController')
let { isValid, isValidRequestBody, isValidfiles, isValid2, isBoolean } = require('../validators/validator')
const { default: mongoose } = require('mongoose')


let newProduct = async (req, res) => {
    try {
        let requestBody = req.body
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments,productImage,...other } = requestBody
        let files = req.files

        if(isValidRequestBody(other))
        return res.status(400).send({status:false,message:"Any extra field is not allowed for updation"})

        if(isValidRequestBody(other))
        return res.status(400).send({status:false,message:"Any extra field is not allowed"})

        if (!isValid(title))
            return res.status(400).send({ status: false, message: "ADD A VALID TITLE" })
        let duplicateTitle = await productModel.findOne({ title, isDeleted: false })
        if (duplicateTitle) {
            return res.status(400).send({ status: false, message: "TITLE already present" })
        }

        if (!isValid(description))
            return res.status(400).send({ status: false, message: "ADD VALID DESCRIPTION" })


        if (!price.match(/^[1-9]\d{0,9}(\.\d{1,3})?%?$/))
            return res.status(400).send({ status: false, message: "ADD VALID PRICE" })

        if (currencyId != "INR")
            return res.status(400).send({ status: false, message: "ADD VALID CURRENCY" })


        currencyFormat = "₹"

        if (isFreeShipping) {
            isFreeShipping = isBoolean(isFreeShipping)
            if (isFreeShipping == "error")
                return res.status(400).send({ status: false, message: "FREE SHIPPING MUST BE A BOOLEAN VALUE" })
        }
        if (!isValidfiles(files))
            return res.status(400).send({ status: false, message: "ADD PRODUCT IMAGE" })

        if (files.length > 1 || files[0].fieldname != "productImage")
            return res.status(400).send({ status: false, message: `Only One ProductImage is allowed by the field name productImage, no any other file or field allowed ` })

        if (!["image/png", "image/jpeg"].includes(files[0].mimetype))
            return res.status(400).send({ status: false, message: "only png,jpg,jpeg files are allowed from productImage" })

         productImage = await uploadFile.uploadFile(files[0])

        availableSizes = availableSizes.split(",")
        console.log(availableSizes)
        for (let i = 0; i < availableSizes.length; i++) {
            if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i]))
                return res.status(400).send({ status: false, message: "AVAILABLE SIZE CAN BE S,XS,M,X,L,XXL,XL" })
        }
        let CREATE = { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage }
        let create = await productModel.create({ ...CREATE })
        res.status(201).send({ status: true, message: "Successfully created", data: create })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

let getProducts = async (req, res) => {
    try {
        const { size, name, priceGreaterThan, priceLessThan } = req.query
        let filters = {}
        console.log(size)
        if(size||size==""){
        if (!isValid(size)) {
            return res.status(400).send({ status: false, message: "WRONG INPUT" })

        }
        
        filters.availableSizes = size.split(' ')
    }

        console.log(filters)
        if (isValid(name)) {
            filters["title"] = { "$regex": name, "$options": "i" }
        }
        console.log(filters)
        if (isValid(priceGreaterThan) && isValid(priceLessThan))
            filters["price"] = { $gt: priceGreaterThan, $lt: priceLessThan }

        else {
            if (isValid(priceGreaterThan)) {
                filters["price"] = { $gt: priceGreaterThan }
            }
            if (isValid(priceLessThan)) {
                filters["price"] = { $lt: priceLessThan }
            }
        }

        if (Object.keys(filters).length == 0) {
            let AllProduct = await productModel.find({ isDeleted: false })
            if (AllProduct.length == 0) {
                return res.status(404).send({ status: false, message: "NO PRODUCT FOUND" })//.sort({price:1})
            }
            res.status(200).send({ status: false, message: "Success", data: AllProduct })//.sort({price:1})
        }
        else {
            filters["isDeleted"] = false
            let AllProduct = await productModel.find(filters)
            console.log(AllProduct)
            if (AllProduct.length == 0) {
                return res.status(404).send({ status: false, message: "NO PRODUCT FOUND" })//.sort({price:1})
            }

            res.status(200).send({ status: true, message: "Success", data: AllProduct })//.sort({price:1})

        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


let getByIDProduct = async (req, res) => {


    try {
        const productId = req.params.productId;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, message: "INVALID PRODUCT ID" });
        }

        const product = await productModel.findOne({ _id: productId, isDeleted: false, });//deletedAt: null,

        if (!product) {
            return res.status(404).send({ status: false, message: "NO PRODUCT FOUND BY THIS ID" })
        }
        res.status(200).send({ status: true, message: "success", data: product });
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
};



let updateByIDProduct = async (req, res) => {

    try {
        const productId = req.params.productId;

        if (!mongoose.Types.ObjectId.isValid(productId))
            return res.status(400).send({ status: false, message: "INVALID PRODUCT ID" });

        let requestBody = req.body
        if (!isValidRequestBody(requestBody))
            return res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })

        const product = {}
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage,...other } = requestBody
       
        if(isValidRequestBody(other))
        return res.status(400).send({status:false,message:"Any extra field is not allowed for updation"})
        let files = req.files

        if (productImage != undefined)
            return res.status(400).send({ status: false, message: "Product Image should have image file" })

        if (title || title == "") {
            if (!isValid2(title))
                return res.status(400).send({ status: false, message: "ADD A VALID TITLE" })
            let duplicateTitle = await productModel.findOne({ title, isDeleted: false })
            if (duplicateTitle) {
                return res.status(400).send({ status: false, message: "TITLE already present" })
            }
            product.title = title;
        }

        if (description || description == "") {
            if (!isValid2(description))
                return res.status(400).send({ status: false, message: "ADD VALID DESCRIPTION" })
            product.description = description;
        }

        if (price || price == "") {
            if (!price.trim().match(/^[1-9]\d*(\.\d{1,2})?%?$/))
                return res.status(400).send({ status: false, message: "ADD VALID PRICE " })
            product.price = price;
        }

        if (currencyId || currencyId == "") {
            if (currencyId != "INR")
                return res.status(400).send({ status: false, message: "ADD VALID CURRENCY, at this time only INR is acceptible" })
            product.currencyId = currencyId;
        }

        if (style || style == "") {
            if (!isValid2(style))
                return res.status(400).send({ status: false, message: "please enter valid style" })
            product.style = style
        }

        //currencyFormat = "₹"  as during creation we are not getting it user ,so user can't update that also

        if (isFreeShipping || isFreeShipping == "") {
            isFreeShipping = isBoolean(isFreeShipping)
            if (isFreeShipping === "error")
                return res.status(400).send({ status: false, message: "FREE SHIPPING MUST BE A BOOLEAN VALUE either true or false" })
            product.isFreeShipping = isFreeShipping
        }

        if (installments || installments == "") {
            const number = Math.floor(Number(installments))
            if (isNaN(number) || number != installments || installments < 1)
                return res.status(400).send({ status: false, message: `installments could have only a +ve number` })
            product.installments = installments
        }

        if (isValidfiles(files)) {
            if (files.length > 1 || files[0].fieldname != "productImage")
                return res.status(400).send({ status: false, message: `Only One ProductImage is allowed by the field name productImage, no any other file or field allowed ` })

            if (!["image/png", "image/jpeg"].includes(files[0].mimetype))
                return res.status(400).send({ status: false, message: "only png,jpg,jpeg files are allowed from productImage" })

            product.productImage = await uploadFile.uploadFile(files[0])
        }


        if (availableSizes || availableSizes == "") {
            availableSizes = availableSizes.split(",")
            for (let i = 0; i < availableSizes.length; i++) {
                if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(availableSizes[i]))
                    return res.status(400).send({ status: false, message: "AVAILABLE SIZE CAN BE S,XS,M,X,L,XXL,XL" })
            }
            product.availableSizes = availableSizes;
        }

        const updatedProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, product, { new: true })

        if (!updatedProduct)
            return res.status(404).send({ status: false, message: "NO PRODUCT FOUND BY THIS ID" })

        res.status(200).send({ status: true, message: "success", data: updatedProduct });
    }
    catch (error) {
        res.status(400).send({ status: false, message: error.message })
    }
}


let deleteByIDProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).send({ status: false, message: "NOT A VALID ID" })
        }


        const product = await productModel.findOne({ _id: productId, isDeleted: false, deletedAt: null });

        if (!product) {
            return res.status(404).send({ status: false, message: "NO PRODUCT FOUND" });
        }

        const DELETE = await productModel.findByIdAndUpdate(productId, { $set: { isDeleted: true, deletedAt: Date.now() } });

        res.status(200).send({ status: true, message: `PRODUCT WITH ID ${productId} DELETED` });
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}
module.exports = { newProduct, getProducts, getByIDProduct, updateByIDProduct, deleteByIDProduct }