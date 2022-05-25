const userModel = require('../model/userModel');
const { uploadFile } = require('./awsController')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
let saltRounds = 10
//------------------------------- validation functions ---------------------------------------------------------------------------------

const isValid = function (obj, err, err2) {
    for (let i in obj) {
        if (typeof obj[i] === 'undefined' || obj[i] === null)
            return err ? err.replace("xvarx", i) : i

        if (typeof obj[i] !== 'string' || obj[i].trim().length === 0)
            return err2 ? err2.replace("xvarx", i) : i
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

    if (!isValidRequestBody(req.body))
        return res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })

    const { fname, lname, email, phone, password, address } = JSON.parse(req.body.data)

    const files = req.files
    let msg;
    if (!isValidfiles(files))
        msg = "Please provide user's profile picture"

    if (!msg && (files.length > 1 || files[0].fieldname != "profileImage"))
        msg = `Only One profileImage is allowed by the field name profileImage, no any other file or field allowed `

    if (!msg && !["image/png", "image/jpeg"].includes(files[0].mimetype))
        msg = "only png,jpg,jpeg files are allowed from profileImage"

    if (!msg)
        msg = isValid({ "first name": fname, "last name": lname, email, "phone number": phone, password, }, `Please provide user's  xvarx `, `xvarx should be a  String and non-empty`)
    if (!msg)
        msg = hasValidObj({ "user's": address, "shipping": address?.shipping, "billing": address?.billing }, `xvarx address is mandatory`, " xvarx address should have data as an object form")

    if (!msg) {
        const { shipping: { street: sStreet, city: sCity, pincode: sPincode }, billing: { street: bStreet, city: bCity, pincode: bPincode } } = address

        msg = isValid({ "street": sStreet, "city": sCity, pincode: sPincode }, `Please provide xvarx in shipping address`, `xvarx in shipping address should be a string and non-empty`)

        if (!msg)
            msg = isValid({ "street": bStreet, "city": bCity, pincode: bPincode }, `Please provide xvarx in billing address`, `xvarx in billing address should be a string and non-empty`)

        const reg = /^\d{6}$/
        if (!msg && !(reg.test(sPincode.trim()) && reg.test(bPincode.trim())))
            msg = `pincode should be six digit long`
    }


    // //----------------------------- email and phone  and password validationvalidation -------------------------------------------------

    if (!msg && !(validator.isEmail(email.trim())))
        msg = 'enter valid email'

    if (!msg && !(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/.test(phone)))
        msg = `phone no should be a valid phone no`

    if (!msg && !isValidPassword(password))
        msg = "Please provide a vaild password ,Password should be of 8 - 15 characters"

    if (msg)
        return res.status(400).send({ status: false, message: msg })

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

const getdetails = async (req, res) => 
        res.status(200).send({ status: true, message: "Success", data: req.userData })

        
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


