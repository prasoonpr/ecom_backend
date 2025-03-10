import mongoose from "mongoose";
import Cart from "../modals/cartModel.js";
import Products from "../modals/productModal.js";
import Offer from "../modals/offerModal.js";


// for adding products to cart
const addCart=async(req,res)=>{
   const userId=req.userId;
   const {product_id,price,quantity}=req.body
   try {

    let cart = await Cart.findOne({ user_id: userId });
    if (cart){
    const existingProductIndex = cart.items.findIndex(item =>
        item.product_id.equals(product_id)
        );
        if (existingProductIndex > -1) {
        cart.items[existingProductIndex].quantity = quantity;
        cart.items[existingProductIndex].price = price;
        } else {
        cart.items.push({ product_id, quantity, price });
        }
        await cart.save()
    }else{
    cart = await Cart.create({
    user_id: userId,
    items: [{ product_id, quantity, price }],
    totalPrice: 0, 
    });
    }
     res.status(200).json({message:'successfully added to cart'})
   } catch (error) {
    res.status(500).json({message:'error while adding to cart'})
   }
} 

//function for getting offers
const getOffers = async (product_id,quantity) => {
    try {
      const offersForProduct = await Offer.find({ 
        target_id: { $in: [product_id] },
        status: true,
        end_date: { $gt: Date.now() }
      });
  
      const product = await Products.findById(product_id);
  
      const offersForCategory = await Offer.find({ 
        target_id: { $in: [product.category] },
        status: true,
        end_date: { $gt: Date.now() }
      });
  
      const allOffers = [...offersForProduct, ...offersForCategory];
  
      const largestOffer = allOffers.reduce((max, current) => {
        return current.offer > max.offer ? current : max;
      }, { offer: 0 }); 
  
      const detailedOffers = allOffers.map(offer => ({
        name: offer.offerName,
        value: offer.offer
      }));
      
      const offerAmount=(product.price*quantity)-(((product.price*quantity)/100)*largestOffer.offer)
  
      return {
        largestOffer: {
          name: largestOffer.offerName,
          value: largestOffer.offer,
          offerAmount
        },
        allOffers: detailedOffers
      };
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw new Error('Failed to get offers');
    }
  };

//for getting cart items
const getCartItems=async(req,res)=>{
    const user_id=  new mongoose.Types.ObjectId(req?.userId)
    try {
 
        const cartItems = await Cart.aggregate([
            { 
                $match: { user_id: user_id }
            },
            { 
                $unwind: "$items" 
            },
            {
                $lookup: {
                    from: "products", 
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails" 
            },
            {
                $project: {
                    _id: 0,
                    "items.quantity": 1,
                    "items.price": 1,
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
        ]);
        const cartItemsWithOffer=await Promise.all(
            cartItems.map(async(item)=>{
                const offers=await getOffers(item.productDetails._id,item.items.quantity)
                    return {
                    ...item,
                    offers,
                }
            })
        )
        const totalAmount=cartItemsWithOffer.reduce((acc,item)=>{
            return acc+item.offers.largestOffer.offerAmount
        },0)
        
       await res.status(200).json({cartItemsWithOffer,totalAmount});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch cart items", error });
    }
}

//for removing cart item
const removeCart=async(req,res)=>{
    const userId=req.userId;
    const {product_id}=req.body
    try {
        let cart = await Cart.findOneAndUpdate(
            { user_id: userId },
            {$pull:{items:{product_id:product_id}}}
        );
        res.status(200).json({message:'Successfully removed one item'})
    } catch (error) {
        res.status(500).json({ message: "Failed remove cart items", error });
    }
}

export{
    addCart,
    getCartItems,
    removeCart
}