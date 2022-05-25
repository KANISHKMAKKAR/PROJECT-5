const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const userModel = require('../model/userModel')

const authentication = async function (req, res, next) {
    try {
        let token = (req.headers.authorization)


        if (!token) {
            return res.status(400).send({ status: false, message: 'You are not logged in, Please login to proceed your request,Add token' })
        }
        token=token.split(' ')
        let decodedToken
        try {
            decodedToken = jwt.verify(token[1], "Group46")
        } catch (error) {
            return res.status(400).send({ status: false, msg: "INVALID TOKEN" })
        }
        req.userId = decodedToken._id
        next();

    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })

    }
}
const authorization = async (req, res, next) => {
    try {
        let userId = req.params.userId
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(400).send({status:false,message:"Invalid userID"})
        }
        
        if (req.userId != userId) {
            return res.status(403).send({ status: false, message: "YOU are not authorized" })
        }

        let user=await userModel.findById(userId)
        if(!user){
            return res.status(404).send({status:false,message:"User not found"})
        }
        
        req.userData = user;
        
        next()
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports = { authentication, authorization }





