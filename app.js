require('dotenv').config()
const express=require ("express")
const app=express()
const port = 3000
const session=require("express-session")
const userRoutes=require('./routes/userRoutes')
const adminRoutes=require('./routes/adminRoutes')


app.use(session({secret:"key",cookie:{maxAge:24 * 60 * 60 * 1000 * 7},resave:true,saveUninitialized:true}))

const bodyParser=require("body-parser")

app.use(bodyParser.urlencoded({extended:true}))

app.set("view engine","ejs")
 
app.use(express.static("public"));



app.use(userRoutes);
app.use(adminRoutes);


app.use((request,response)=>{
    response.status(404).render('./user/404')
})



app.listen(port, function(){
    console.log("port is working in port 3000")
})


app.listen(3001, function(){
    console.log("port is working in port 3001")
})


app.listen(3002, function(){
    console.log("port is working in port 3002")
})
