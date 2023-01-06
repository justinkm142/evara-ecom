const mongoose=require("mongoose")
const Schema= mongoose.Schema;


const paymentSchema= new Schema(
  {
    everaOrderId: {
            type: String,       
            unique:true
            },
    paymentDetails:Object,
    amount:Number,
    status:String,
    date:String
  },
  {
    timestamps:true
  })

    
const Payment=mongoose.model("Payment",paymentSchema); 


module.exports={
    Payment:Payment,
}