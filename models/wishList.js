const mongoose=require("mongoose")
const Schema= mongoose.Schema;


const wishListchema= new Schema(
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

    
const WishList=mongoose.model("WishList",wishListchema); 


module.exports={
    WishList:WishList,
}