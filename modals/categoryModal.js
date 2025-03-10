import mongoose from "mongoose";

const categorySchema=mongoose.Schema({
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
},{ timestamps: true })

const Category=mongoose.model('Category',categorySchema)
export default Category;