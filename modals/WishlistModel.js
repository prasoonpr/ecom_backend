import mongoose from 'mongoose'

const wishlistSchema=mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[
        {
            product_id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Products',
                required:true
            },
            itemCreatedAt: {
                type: Date,
                default: Date.now 
            },
            _id:false
        },
    ]
},{timestamps:true})

const Wishlist=mongoose.model('Wishlist',wishlistSchema)
export default Wishlist