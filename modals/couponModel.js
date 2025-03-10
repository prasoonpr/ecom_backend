import mongoose from "mongoose";

const couponSchema=mongoose.Schema({
    couponName:{
        type:String,
        required:true
    },
   users:[
    {
        user_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
        },
        couponCode:{
            type:String,
        },
        status:{
            type:Boolean,
            default:false
        },
        _id:false
    }
   ],
    description:{
        type:String,
        required:true
    },
    offer:{
        type:Number,
        required:true
    },
    minAmount:{
        type:Number,
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
},{ timestamps: true })

// Function to generate a random 6-character coupon code
function generateCouponCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// Pre-save hook to generate the coupon code for each new user entry
couponSchema.pre('save', function(next) {
    this.users.forEach(user => {
        if (!user.couponCode) {
            user.couponCode = generateCouponCode();
        }
    });
    next();
});

const Coupon=mongoose.model('Coupon',couponSchema)
export default Coupon