const userModel = require('../model/userModel');
const { uploadFile } = require('./awsController')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
let saltRounds = 10
//------------------------------- validation functions ---------------------------------------------------------------------------------

const isValid = function (obj, err, err2) {
    for (let i in obj) {
        if (typeof obj[i] === 'undefined' || obj[i] === null) return err ? err.replace("xvarx", i) : i
        if (typeof obj[i] !== 'string' || obj[i].trim().length === 0) return err2 ? err2.replace("xvarx", i) : i
    }
}
const hasValidObj = (obj, err, err2) => {
    for (let i in obj) {
        if (typeof obj[i] === 'undefined' || obj[i] === null)
            return err ? err.replace("xvarx", i) : i

        if ({}.toString.call(obj[i]) != "[object Object]")
            return err2 ? err2.replace("xvarx", i) : i
    }

}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isValidPassword = function (password) {
    if (password.length > 7 && password.length < 16)
        return true
}
const isValidfiles = function (files) {
    if (files && files.length > 0)
        return true
}


//------------------------ first api to create user -----------------------------------------------------------------------------------------

const createUser = async function (req, res) {

    const requestBody = req.body
    if (!isValidRequestBody(requestBody))
        return res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })

    requestBody.data = JSON.parse(requestBody.data)

    const { fname, lname, email, phone, password, address } = requestBody.data

    const files = req.files

    if (!isValidfiles(files))
        return res.status(400).send({ status: false, Message: "Please provide user's profile picture" })
    let isObject, billing, shipping;
    let mandatory = isValid({ "first name": fname, "last name": lname, email, "phone number": phone, password, }, `Please provide user's  xvarx `, `xvarx should be a  String and non-empty`)
    if (!mandatory)
        isObject = hasValidObj({ "user's": address, "shipping": address?.shipping, "billing": address?.billing }, `xvarx address is mandatory`, " xvarx address should have data as an object form")

    if (!mandatory && !isObject)
        shipping = isValid({ "street": address.shipping.street, "city": address.shipping.city, pincode: address.shipping.pincode }, `Please provide xvarx in shipping address`, `xvarx in shipping address should be a string and non-empty`)

    if (!mandatory && !isObject && !shipping)
        billing = isValid({ "street": address.billing.street, "city": address.billing.city, pincode: address.billing.pincode }, `Please provide xvarx in billing address`, `xvarx in billing address should be a string and non-empty`)

    result = mandatory || isObject || shipping || billing
    if (result)
        return res.status(400).send({ status: false, Message: result })

    // //----------------------------- email and phone  and password validationvalidation -------------------------------------------------

    if (!(validator.isEmail(email.trim())))
        return res.status(400).send({ status: false, msg: 'enter valid email' })

    if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/.test(phone)))
        return res.status(400).send({ status: false, message: `phone no should be a valid phone no` })

    if (!isValidPassword(password))
        return res.status(400).send({ status: false, Message: "Please provide a vaild password ,Password should be of 8 - 15 characters" })

    // //-----------------------------------unique validation ----------------------------------------------------------------------------------------------

    const isEmailAlreadyUsed = await userModel.findOne({ email });
    if (isEmailAlreadyUsed)
        return res.status(400).send({ status: false, message: `email address is already registered` })

    const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });
    if (isPhoneAlreadyUsed)
        return res.status(400).send({ status: false, message: 'phone is already registered' })

    //--------------------validation ends -------------------------------------------------------------------------------------------------------------

    const profilePicture = await uploadFile(files[0])

    const encryptedPassword = await bcrypt.hash(password, saltRounds)

    const userData = { fname, lname, email, profileImage: profilePicture, phone, password: encryptedPassword, address }

    const newUser = await userModel.create(userData);

    res.status(201).send({ status: true, message: `User registered successfully`, data: newUser });
}

// ============================ second login api =============================================================================================

const doLogin = async function (req, res) {
    try {
        let requestBody = req.body

        // request body validation 

        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid request parameters. Please provide login details' })
            return
        }
        if (requestBody.email && requestBody.password) {

            // email id or password is velid or not check validation 

            let userEmail = await userModel.findOne({ email: requestBody.email });

            if (!userEmail) {
                return res.status(400).send({ status: false, msg: "Invalid user email" })
            }

            const decryptPassword = await bcrypt.compare(requestBody.password, userEmail.password)

            if (!decryptPassword) {
                return res.status(400).send({ status: false, msg: 'password is incorrect' })
            }

            // jwt token create and send back the user

            let payload = { _id: userEmail._id }

            let generatedToken = jwt.sign(payload, 'Group46', { expiresIn: '60m' })

            res.header('x-api-key', generatedToken);

            res.status(200).send({ status: true, data: " user  login successfull", userId: userEmail._id, token: { generatedToken } })
        } else {
            res.status(400).send({ status: false, msg: "must contain email and password" })
        }
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};

const getdetails = async (req, res) => {
    try {
        let userId = req.params.userId
        let user = await userModel.findById(userId)
        res.status(200).send({ status: true, message: "Success", data: user })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}
const updateuser = async (req, res) => {
    let userId = req.params.userId
    if (!isValidRequestBody(req.body)) {
        return res.status(400).send({ status: false, message: "CANT BE EMPTY BODY" })
    }
    let { fname, lname, email, phone, password, address } = req.body
    let duplicatemail = await userModel.findOne({ email: email })
    if (duplicatemail) {
        return res.status(400).send({ status: false, message: 'email already exists' })
    }
    let duplicatephone = await userModel.findOne({ phone: phone })
    if (duplicatephone) {
        return res.status(400).send({ status: false, message: 'Phone no. already exists' })
    }
    if (fname) {
        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: 'not valid fname' })
        }
    }
    if (lname) {
        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: 'not valid lname' })
        }
    }
    if (email) {
        if (!(validator.isEmail(email.trim()))) {
            return res.status(400).send({ status: false, msg: 'enter valid email' })
        }
    }
    if (phone) {
        if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/.test(phone))) {
            res.status(400).send({ status: false, message: `phone no should be a valid phone no` })
            return
        }
    }
    if (password) {
        if (!isValidPassword(password)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild password ,Password should be of 8 - 15 characters" })
            return
        }
    }
    if (address) {
        if (!isValid(address)) {
            res.status(400).send({ status: false, Message: "Not valid address" })
            return
        }
        if (address.shipping) {
            if (address.shipping.street) {
                if (!isValid(address.shipping.street)) {
                    res.status(400).send({ status: false, Message: "not valid street" })
                    return
                }
            }
            if (address.shipping.city) {
                if (!isValid(address.shipping.city)) {
                    res.status(400).send({ status: false, Message: "not valid city" })
                    return
                }
            } if (address.shipping.pincode) {
                if (!isValid(address.shipping.pincode)) {
                    res.status(400).send({ status: false, Message: "not valid pincode" })
                    return
                }
            }
        }

        if (address.billing) {
            if (address.billing.street) {
                if (!isValid(address.billing.street)) {
                    res.status(400).send({ status: false, Message: "not valid street" })
                    return
                }
            }
            if (address.billing.city) {
                if (!isValid(address.billing.city)) {
                    res.status(400).send({ status: false, Message: "not valid city" })
                    return
                }
            } if (address.billing.pincode) {
                if (!isValid(address.billing.pincode)) {
                    res.status(400).send({ status: false, Message: "not valid pincode" })
                    return
                }
            }
        }
    }
    let find = await userModel.findByIdAndUpdate(userId, { fname, lname, email, phone, password, address }, { new: true })
    res.status(200).send({ status: false, message: "Success", data: find })
}




module.exports = { createUser, doLogin, getdetails, updateuser }


