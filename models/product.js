const mongoose=require("mongoose")
const Schema= mongoose.Schema;



const categorySchema= new Schema({
    name:{type:String,
        required:true,
        unique:true},
    discription:String,
    sell:Number
    })

    
const Category=mongoose.model("Category",categorySchema); 

const productSchema= new Schema(
  {
    name: {
        type: String,
        required:true,
        index: true
      },
      shortDescription: {
        type: String,
        index: true
      },
      longDescription: {
        type: String
      },
      category: {
        type: String,
        required:true,
        index: true
      },
      subCategory: {
        type: String
      },
      brand: {
        type: String
      },
      MRP: {
        type: Number
      },
      sellingPrice: {
        type: Number,
        required:true
      },
      image:[],
      stock: {
          type: Number
      },
      status: {
        type: String
      },
      rating:{
        type:Number
      },
      sellingCategory:{
        type:String
      }
  },
  { timestamps:true
  })

    
const Product=mongoose.model("Product",productSchema); 


module.exports={
    Category:Category,
    Product:Product,
}