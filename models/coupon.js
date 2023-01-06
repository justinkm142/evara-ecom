const mongoose=require("mongoose")
const Schema= mongoose.Schema;


const couponSchema= new Schema(
  {
    coupon: {
            type: String,       
            unique:true
            },
    discount:Number,
    startDate:String,
    endDate:String,
    limit1:Number,
    limit:Number
  },
  {
    timestamps:true
  })

    
const Coupon=mongoose.model("Coupon",couponSchema); 


module.exports={
    Coupon:Coupon,
}