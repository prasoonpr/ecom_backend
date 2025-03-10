import mongoose from "mongoose";

const addressSchema=mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    pincode:{
        type:Number,
        required:true
    },
    locality:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    landmark:{
        type:String,
        default:null
    },
    alternativePhone:{
        type:Number,
        default:null
    },
    addressType:{
        type:String,
        enum:['home','work'],
        default:'home'
    },
    defaultAddress:{
        type:Boolean,
        default:false
    }

},{ timestamps: true })

const Address=mongoose.model('Address',addressSchema)
export default Address
