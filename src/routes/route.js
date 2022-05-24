const express = require('express');

const userController = require('../controller/userController')
const middleware = require('../middleware/authentication')
const router = express.Router();


//  first feature apis

router.post("/register", userController.createUser);

router.post("/login", userController.doLogin);

module.exports = router;
