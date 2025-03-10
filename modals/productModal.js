import mongoose from "mongoose";

const productSchema=mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    carat:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    origin:{
        type:String,
        required:true
    },
    images:{
        type:Array,
        required:true
    },
    review:{
        type:Array,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
  
},{ timestamps: true })

const Products=mongoose.model('Products',productSchema)
export default Products