import mongoose from "mongoose";
import Coupon from "../modals/couponModel.js"


//for add a coupon
const addCoupon=async(req,res)=>{
    const {couponName,description,offer,minAmount,startDate,endDate}=req.body
    if (!couponName.trim()) {
        return res.status(401).json({ message: "coupon name cannot be empty" });
    }
    if (!description.trim()) {
        return res.status(401).json({ message: "description cannot be empty" });
    }
    if (!minAmount) {
        return res.status(401).json({ message: "Offer cannot be empty" });
    }
    if (!offer) {
        return res.status(401).json({ message: "Offer cannot be empty" });
    }
    if (!startDate) {
        return res.status(401).json({ message: "start date cannot be empty" });
    }
    if (!endDate) {
        return res.status(401).json({ message: "end date cannot be empty" });
    }
    if (new Date(endDate) <= Date.now()) {
        return res.status(401).json({ message: "end date cannot be set to today or earlier" });
    }
    try {
        const exist = await Coupon.findOne({
            couponName: { $regex: new RegExp(`^${couponName}$`, 'i') }
        });
        if(exist){
            return res.status(401).json({message:"the coupon name alredy exist"})
        }
        const coupon=await Coupon.create({
            couponName,
            description,
            offer,
            minAmount,
            startDate,
            endDate
        })
        await res.status(200).json({message:"coupon added"})
        } catch (error) {
        res.status(500).json({ error: 'an error occurred while add coupon' });
    }
}


//for get the coupons for admin
const getCoupons=async(req,res)=>{
    const {page,limit}=req.query
    const skip=(page-1)*limit;
    console.log();
    
    try {
        const coupons=await Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
        const totalProducts=await Coupon.find().countDocuments()
        const totalPages=Math.ceil(totalProducts/limit)
        await res.status(200).json({message:'success',coupons,totalPages})
    } catch (error) {
        res.status(500).json({ error: 'an error occurred while getting coupons' });
    }
}

//for block coupon
const blockCoupon=async(req,res)=>{
    const {id}=req.body
try {
    const coupon = await Coupon.findById(id);
if (coupon) {
    coupon.status = !coupon.status;
    await coupon.save();
    res.status(200).json({ message: "Coupon status updated" });
} else {
    res.status(404).json({ message: "Coupon not found" });
}
} catch (error) {
    res.status(500).json({ message: "Internal server error" });
}    
}

//for get active coupons
const getActiveCoupons=async(req,res)=>{
    const user_id=req.userId
    try {
        const coupons=await Coupon.find({status:true}).sort({ createdAt: -1 })
        const filteredCoupons = coupons.map(coupon => {
            const user = coupon.users.find(user => user.user_id.toString() === user_id.toString());
            if (user) {
                return { ...coupon.toObject(), user };  
            }
            return coupon;  
        }); 
        
        await res.status(200).json({message:'success',coupons:filteredCoupons})
    } catch (error) {
    res.status(500).json({ message: "Internal server error" });
    }
}

//for getting code
const getCode=async(req,res)=>{
    const user_id=req.userId
    const {coupon_id}=req.body
   try {
    const coupon=await Coupon.findById(coupon_id)
    coupon.users.push({user_id})
    await coupon.save()
    await res.status(200).json({message:'Coupon Opened'})
   } catch (error) {
    res.status(500).json({ message: "Internal server error" });
   }
    
}

//for applying coupon
const applyCoupon=async(req,res)=>{
    const user_id=req.userId
    const {couponCode,totalAmount}=req.body
    
try {
    const coupon=await Coupon.findOne({"users.user_id":user_id,"users.couponCode":couponCode})
    if(totalAmount<coupon.minAmount){
        return res.status(404).json({ message:`Purchase above ${coupon.minAmount} can only apply this coupon` });
       }
   if(!coupon){
    return res.status(404).json({ message: "Invalid Coupon" });
   }
   if(new Date(coupon.endDate)<Date.now()){
    return res.status(404).json({ message: "The coupon is expired" });
   }
   const user= await coupon.users.find(users=>users.couponCode===couponCode)
   if(user.status){
    return res.status(404).json({ message: " Expired code" });
   }
 
   user.status = true;
   await coupon.save();
   await res.status(200).json({message:'Coupon applied successfully',coupon})
   
} catch (error) {
    res.status(500).json({ message: "Internal server error" });
}    
}

export{
    addCoupon,
    getCoupons,
    blockCoupon,
    getActiveCoupons,
    getCode,
    applyCoupon
}