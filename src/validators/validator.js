const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}
let isvalidaddress = (value) => ({}.toString.call(value) == '[object Object]') ? true : false
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isvalidPincode = (value) => ({}.toString.call(value) == '[object Number]') ? true : false
const isValidPassword = function (password) {
    if (password.length > 7 && password.length < 16)
        return true
}
const isValidfiles = function (files) {
    if (files && files.length > 0)
        return true
}
module.exports={isValid,isvalidaddress,isvalidPincode,isValidPassword,isValidRequestBody,isValidfiles}