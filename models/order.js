const mongoose=require("mongoose")
const Schema= mongoose.Schema;


const orderSchema = new Schema(
        {
                userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        required: true
                },
                products: [{
                        productId: {
                                type: String,
                        },
                        quantity: {
                                type: Number,
                                default: 1
                        },
                        status: {
                                type: String,
                                default: "processing"
                        }
                }],
                totalAmount: {
                        type: Number,
                        required: true
                },
                address: {
                        type: Object,
                        required: true
                },
                status: {
                        type: String,
                        default: "pending"
                },
                paymentMethod: {
                        type: String,
                },
                paymentStatus: {
                        type: String,
                        default: "pending"
                },
                date: {
                        type: String,
                        
                },




        },
        {
                timestamps: true
        })

    
const Order=mongoose.model("Order",orderSchema); 


module.exports={
       Order:Order,
}