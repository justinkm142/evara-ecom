const mongoose=require("mongoose")
const Schema= mongoose.Schema;

// user data base 
//mongoose.connect("mongodb://127.0.0.1:27017/evaraDataDB").catch((err)=>{ console.log(err);console.log("Database connection error")})

mongoose.connect("mongodb+srv://admin-evara:"+process.env.mongo_pass+"@evara-ecom.il0m4vi.mongodb.net/evaraDataDB").catch((err)=>{ console.log(err);console.log("Database connection error")})





const userSchema= new Schema({
    name: String,
    email:{type:String,
        unique: true},
    phone:{type:Number,
        unique:true},
    password:String,
    address:[],
    userBlocked:{type:Boolean,
        default:false},
    coupanUsed:[]
    },
    { timestamps:true}
    )

    
const user=mongoose.model("user",userSchema); 


// admin data base 

const adminSchema= new Schema({
    name: String,
    email:String,
    phone:Number,
    password:String,
    employeeCode:String,
    userBlocked:Boolean,
    })

    
const Admin=mongoose.model("Admin",adminSchema); 



module.exports={
    user:user,
    Admin:Admin,
}