const express= require('express')
const bodyParser=require('body-parser')
const app=express()
const route=require('../src/routes/route')
const mongoose=require('mongoose')

app.use(bodyParser.json())

mongoose.connect('mongodb+srv://functionup-uranium-cohort:q8znVj4ly0Fp0mpU@cluster0.0wdvo.mongodb.net/group46Database',
{
    useNewUrlParser:true
})
.then(()=>console.log('Mongo Db Is Connected'))
.catch(err=>console.log(err))
app.use('/',route)



app.listen(3000,function(){
    console.log('Running on Port 3000')
})