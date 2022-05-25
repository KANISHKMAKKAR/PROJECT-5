const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const mongoose = require('mongoose');
const multer = require('multer')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(multer().any())

mongoose.connect("mongodb+srv://functionup-uranium-cohort:q8znVj4ly0Fp0mpU@cluster0.0wdvo.mongodb.net/group46Database",
{
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) );

// app.use(
//     function (req,res,next)
//     {
//         const date = new Date();
//         let currDateAndTime = date.toString();
//         console.log(currDateAndTime,',',req.ip,',',req.method,',',req.path);
//         next();
//     }
// );

app.use('/',route);

app.listen(process.env.PORT || 3000, (err)=> {
    console.log("Connected to PORT 3000")
});