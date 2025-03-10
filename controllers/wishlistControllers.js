import mongoose from "mongoose"
import Wishlist from "../modals/WishlistModel.js"

//for add product to wishlist
const addWishlist=async(req,res)=>{
   const {product_id}=req.body
   const user_id=req.userId
   try {
    const wishlist=await Wishlist.findOne({user_id:user_id})
    if(wishlist){
        wishlist.items.push({product_id})
        await wishlist.save()
    }else{
        const wishlist=await Wishlist.create({
            user_id:user_id,
            items:[{product_id}]
        })
    }
    await res.status(200).json({message:'Product added to wishlist'})
   } catch (error) {
    res.status(500).json({message:'error while add to whislist'})
   }
}


//for getting wishlist
const getWishlist=async(req,res)=>{
    const user_id=new mongoose.Types.ObjectId(req?.userId)
    try {
        const wishlist=await Wishlist.aggregate([
            {
                $match:{user_id:user_id}
            },
            {
               $unwind:"$items" 
            },
            {
                $lookup:{
                    from:"products",
                    localField:"items.product_id",
                    foreignField:"_id",
                    as:'productDetails'
                }
            },
            {
                $unwind:"$productDetails"
            },
            {
                $sort: { "items.itemCreatedAt": -1 } 
            },
            {
                $project:{
                    _id:false,
                   "productDetails._id":1,
                    "productDetails.productName": 1,
                    "productDetails.price": 1,
                    "productDetails.stock": 1,
                    "productDetails.carat": 1,
                    "productDetails.description": 1,
                    "productDetails.category": 1,
                    "productDetails.origin": 1,
                    "productDetails.images": 1,
                    "productDetails.status": 1,
                }
            }
        ])
        await res.status(200).json({message:'success',wishlist})

    } catch (error) {
    res.status(500).json({message:'error while getting whislist'})
    }
}

//for remove item from wishlist
const removeWishlist=async(req,res)=>{
    const user_id=req.userId
    const {product_id}=req.body
    try {
        const wishlist=await Wishlist.findOneAndUpdate(
            {user_id:user_id},
            {$pull:{items:{product_id:product_id}}}
        )
        await res.status(200).json({message:'Removed one item successfully'})
    } catch (error) {
    res.status(500).json({message:'error while removing item from whislist'})
    }
}

export {
    addWishlist,
    getWishlist,
    removeWishlist
}