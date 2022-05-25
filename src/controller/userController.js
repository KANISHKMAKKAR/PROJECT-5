const userModel = require('../model/userModel');
const { uploadFile } = require('./awsController')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
let saltRounds = 10
let {isValid,isvalidaddress,isvalidPincode,isValidPassword,isValidRequestBody,isValidfiles} = require('../validators/validator')





//------------------------ first api to create user -----------------------------------------------------------------------------------------

const createUser = async function (req, res) {
    try {

        const requestBody = req.body
        console.log(requestBody)
        if (!isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, Message: "Invalid request parameters, Please provide user details" })
            return
        }
        requestBody.data = JSON.parse(requestBody.data)

        const { fname, lname, email, phone, password, address } = requestBody.data

        const files = req.files

        if (!isValidfiles(files)) {
            res.status(400).send({ status: false, Message: "Please provide user's profile picture" })
            return
        }
        if (!isValid(fname)) {
            res.status(400).send({ status: false, Message: "Please provide user's first name" })
            return
        }
        if (!isValid(lname)) {
            res.status(400).send({ status: false, Message: "Please provide user's last name" })
            return
        }
        if (!isValid(email)) {
            res.status(400).send({ status: false, Message: "Please provide user's email" })
            return
        }
        if (!isValid(phone)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild phone number" })
            return
        }
        if (!isValid(password)) {
            res.status(400).send({ status: false, Message: "Please provide password" })
            return
        }
        if (!isValid(address)) {
            res.status(400).send({ status: false, Message: "Please provide address" })
            return
        }
        if (address) {
            if (address.shipping) {
                if (!isValid(address.shipping.street)) {
                    res.status(400).send({ status: false, Message: "Please provide street name in shipping address" })
                    return
                }
                if (!isValid(address.shipping.city)) {
                    res.status(400).send({ status: false, Message: "Please provide city name in shipping address" })
                    return
                }
                if (!isvalidPincode(address.shipping.pincode)) {
                    res.status(400).send({ status: false, Message: "Please provide pincode in shipping address" })
                    return
                }
            }
            else {
                res.status(400).send({ status: false, Message: "Please provide shipping address and it should be present in object with all mandatory fields" })
            }
            if (address.billing) {
                if (!isValid(address.billing.street)) {
                    res.status(400).send({ status: false, Message: "Please provide street name in billing address" })
                    return
                }
                if (!isValid(address.billing.city)) {
                    res.status(400).send({ status: false, Message: "Please provide city name in billing address" })
                    return
                }
                if (!isvalidPincode(address.billing.pincode)) {
                    res.status(400).send({ status: false, Message: "Please provide pincode in billing address" })
                    return
                }
            }
            else {
                res.status(400).send({ status: false, Message: "Please provide billing address and it should be present in object with all mandatory fields" })
            }
        }

        // //----------------------------- email and phone  and password validationvalidation -------------------------------------------------


        if (!(validator.isEmail(email.trim()))) {
            return res.status(400).send({ status: false, msg: 'enter valid email' })
        }
        if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/.test(phone))) {
            res.status(400).send({ status: false, message: `phone no should be a valid phone no` })
            return
        }
        if (!isValidPassword(password)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild password ,Password should be of 8 - 15 characters" })
            return
        }

        // //-----------------------------------unique validation ----------------------------------------------------------------------------------------------



        const isEmailAlreadyUsed = await userModel.findOne({ email });
        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `email address is already registered` })
            return
        }

        const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });
        if (isPhoneAlreadyUsed) {
            res.status(400).send({ status: false, message: 'phone is already registered' })
            return
        }

        //--------------------validation ends -------------------------------------------------------------------------------------------------------------

        const profilePicture = await uploadFile(files[0])

        const encryptedPassword = await bcrypt.hash(password, saltRounds)


        const userData = {
            fname: fname, lname: lname, email: email, profileImage: profilePicture,
            phone, password: encryptedPassword, address: address
        }

        const newUser = await userModel.create(userData);

        res.status(201).send({ status: true, message: `User registered successfully`, data: newUser });

    }
    catch (error) {
        res.status(500).send({ status: false, Message: error.message })
    }
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
    let userData = await userModel.findById(userId)
    if (!isValidRequestBody(req.body)) {
        return res.status(400).send({ status: false, message: "CANT BE EMPTY BODY" })
    }
    let { fname, lname, email, phone, password, address } = req.body
   
    
    if (fname) {
        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: 'not valid fname' })
        } userData.fname = fname

    }
    if (lname) {
        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: 'not valid lname' })
        } userData.lname = lname
    }
    if (email) {
        if (!(validator.isEmail(email.trim()))) {
            return res.status(400).send({ status: false, msg: 'enter valid email' })
        }
         let duplicatemail = await userModel.findOne({ email: email })
        if (duplicatemail) {
            return res.status(400).send({ status: false, message: 'email already exists' })
        }
         userData.email = email
    }
    if (phone) {
        if (!(/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/.test(phone))) {
            res.status(400).send({ status: false, message: `phone no should be a valid phone no` })
            return
        }
        let duplicatephone = await userModel.findOne({ phone: phone })
        if (duplicatephone) {
            return res.status(400).send({ status: false, message: 'Phone no. already exists' })
        }
         userData.phone = phone
    }
    if (password) {
        if (!isValidPassword(password)) {
            res.status(400).send({ status: false, Message: "Please provide a vaild password ,Password should be of 8 - 15 characters" })
            return
        } userData.password = password
    }

    if (address) {
        if (!isvalidaddress(address)) {
            res.status(400).send({ status: false, Message: "Not valid address" })
            return
        }
        if (address.shipping) {
            if (address.shipping.street) {
                if (!isValid(address.shipping.street)) {
                    res.status(400).send({ status: false, Message: "not valid street" })
                    return
                } userData.address.shipping.street = address.shipping.street
            }
            if (address.shipping.city) {
                if (!isValid(address.shipping.city)) {
                    res.status(400).send({ status: false, Message: "not valid city" })
                    return
                } userData.address.shipping.city = address.shipping.city
            }
            if (address.shipping.pincode) {
                if (!isvalidPincode(address.shipping.pincode)) {
                    res.status(400).send({ status: false, Message: "not valid pincode" })
                    return
                } userData.address.shipping.pincode = address.shipping.pincode
            }
        }

        if (address.billing) {
            if (address.billing.street) {
                if (!isValid(address.billing.street)) {
                    res.status(400).send({ status: false, Message: "not valid street" })
                    return
                } userData.address.billing.street = address.billing.street
            }
            if (address.billing.city) {
                if (!isValid(address.billing.city)) {
                    res.status(400).send({ status: false, Message: "not valid city" })
                    return
                } userData.address.billing.city = address.billing.city
            }
            if (address.billing.pincode) {
                if (!isvalidPincode(address.billing.pincode)) {
                    res.status(400).send({ status: false, Message: "not valid pincode" })
                    return
                } userData.address.billing.pincode = address.billing.pincode
            }
        }
    }
    

    let find = await userModel.findByIdAndUpdate(userId, { ...userData }, {new: true})
   
    res.status(200).send({status:false,message:"Success",data:find})
}




module.exports = { createUser, doLogin, getdetails, updateuser }

