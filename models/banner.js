const mongoose=require("mongoose")
const Schema= mongoose.Schema;


const bannerSchema= new Schema(
  {
    h1:String,
    h2:String,
    h3:String,
    offer:String,
    startDate:String,
    endDate:String,
    imageName:String
  },
  {
    timestamps:true
  })

    
const Banner=mongoose.model("Banner",bannerSchema); 


module.exports={
  Banner:Banner,
}