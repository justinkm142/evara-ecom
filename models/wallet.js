const mongoose=require("mongoose")
const Schema= mongoose.Schema;


const walletSchema = new Schema(
        {
                userId: {
                        type:String,
                        required:true
                },
                balance:{
                        type:Number,
                        default:0
                }
                    
        },
        {
                timestamps: true
        })

    
const Wallet=mongoose.model("Wallet",walletSchema); 


module.exports={
        Wallet:Wallet,
}