const mongoose=require("mongoose")
const Schema= mongoose.Schema;


const cartSchema= new Schema(
  {
    userId: {
            type: String,       
            unique:true
            },
    products:[{
                productId:{
                          type: String,
                          },
                quantity:{
                          type:Number,
                          default:1
                          }
              }],
  },
  {
    timestamps:true
  })

    
const Cart=mongoose.model("Cart",cartSchema); 


module.exports={
       Cart:Cart,
}