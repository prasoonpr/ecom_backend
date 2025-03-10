import mongoose from "mongoose";

const offerSchema=mongoose.Schema({
    offerName:{
        type:String,
        required:true
    },
    target_value:{
        type:String,
        required:true
    },
    target_id:[
        {
        type: String,
        }
    ],
    offer:{
        type:Number,
        required:true
    },
    end_date:{
        type:Date,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

const Offer=mongoose.model('Offer',offerSchema)
export default Offer