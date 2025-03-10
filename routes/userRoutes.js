import express from 'express'
const userRouter=express.Router()
import {verifyToken} from '../middleware/authMiddleware.js'
import {
    loginUser,
    checkUser,
    verifyUser,
    resendOTP, 
    refreshToken,
    userProfile,
    logoutUser,
    googleLogin,
    editInfo,
    changePass
} from '../controllers/userControllers.js'
import {
     getProductDetails, 
     getProductsForHome, 
     getReview, 
     listProducts,
     searchProduct,
 } from '../controllers/productControllers.js'
import { 
    addAddress,
    deleteAddress,
    editAddress,
    getAddresses,
    setDefaultAddress
 } from '../controllers/addressControllers.js'
import {
     addCart,
     getCartItems,
     removeCart
     } from '../controllers/cartController.js'
import { 
    cancellOrder,
    failureOrder,
    getOrders,
    placeOrder,
    retryPayment,
    verifyPayment,
    verifyRetry
    } from '../controllers/orderControllers.js'
import { 
    addWishlist,
    getWishlist,
    removeWishlist,
 } from '../controllers/wishlistControllers.js'
import { applyCoupon, getActiveCoupons, getCode } from '../controllers/couponControllers.js'
import { addWallet, getWallet } from '../controllers/walletControllers.js'

userRouter.post('/check-user',checkUser)
userRouter.post('/verify-user',verifyUser)
userRouter.post('/resend-otp',resendOTP)
userRouter.get('/refresh-token',refreshToken)
userRouter.get('/profile',verifyToken,userProfile)
userRouter.post('/edit-info',verifyToken,editInfo)
userRouter.post('/change-password',verifyToken,changePass)
userRouter.post('/log-out',logoutUser)
userRouter.post('/login',loginUser)
userRouter.get('/list-products',listProducts)
userRouter.get('/get-product-details',getProductDetails)
userRouter.post('/google-login',googleLogin)
userRouter.get('/get-review',getReview)
userRouter.post('/add-address',verifyToken,addAddress)
userRouter.get('/get-addresses',verifyToken,getAddresses)
userRouter.post('/edit-address',verifyToken,editAddress)
userRouter.post('/delete-address',deleteAddress)
userRouter.post('/add-cart',verifyToken,addCart)
userRouter.get('/get-cart-items',verifyToken,getCartItems)
userRouter.post('/remove-cart',verifyToken,removeCart)
userRouter.post('/place-order',verifyToken,placeOrder)
userRouter.get('/get-orders',verifyToken,getOrders)
userRouter.put('/cancell-order',verifyToken,cancellOrder)
userRouter.post('/add-wishlist',verifyToken,addWishlist)
userRouter.get('/get-wishlist',verifyToken,getWishlist)
userRouter.put('/remove-wishlist',verifyToken,removeWishlist)
userRouter.get('/get-active-coupons',verifyToken,getActiveCoupons)
userRouter.post('/get-code',verifyToken,getCode)
userRouter.put('/apply-coupon',verifyToken,applyCoupon)
userRouter.post('/verify-payment',verifyToken,verifyPayment)
userRouter.post('/add-wallet',verifyToken,addWallet)
userRouter.get('/get-wallet',verifyToken,getWallet)
userRouter.get('/get-products-for-home',getProductsForHome)
userRouter.post('/set-default-address',verifyToken,setDefaultAddress)
userRouter.post('/failure-order',verifyToken,failureOrder)
userRouter.post('/retry-payment',verifyToken,retryPayment)
userRouter.post('/verify-retry',verifyToken,verifyRetry)
userRouter.post('/search-product',searchProduct)


export default userRouter