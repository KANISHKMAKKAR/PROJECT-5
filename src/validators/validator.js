const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValid2= (value)=> {
    if (value.trim().length === 0 || !value.match(/[a-zA-Z]/)) return false // typeof value != 'string' 
    return true;
}

let isvalidaddress = (value) => ({}.toString.call(value) == '[object Object]' && Object.keys(value).length>0) ? true : false
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}
const isvalidPincode = (value) => (/\d{6}/.test(value.trim())) ? true : false //{}.toString.call(value) == '[object Number]'
const isValidPassword = function (password) {
    if (password.length > 7 && password.length < 16)
        return true
}
const isValidfiles = function (files) {
    if (files && files.length > 0)
        return true
}
const isBoolean = (value) => {
    value = value.toLowerCase()
    return value==="true"?true:(value==="false")?false:"error"
}

module.exports={isValid,isvalidaddress,isvalidPincode,isValidPassword,isValidRequestBody,isValidfiles,isValid2,isBoolean}