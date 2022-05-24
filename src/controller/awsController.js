const aws = require('aws-sdk')


//--------------------------------AWS Configuration-------------------------------------

aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

//--------------------------------AWS file upload--------------------------

const uploadFile = async function (file, name) {
    return new Promise(function (resolve, reject) {
        // Create S3 service object
        const s3 = new aws.S3({ apiVersion: "2006-03-01" })
        const uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: name + "/" + file.originalname,
            Body: file.buffer,
        }
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }

            return resolve(data.Location) //HERE 
        })
    })
}


module.exports.uploadFile = uploadFile