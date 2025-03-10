import express from 'express'
const adminRouter=express.Router()
// import { upload } from '../middleware/multer.js'
import { 
    adminLogin,
    userList,
    userBlock,
    addCategory,
    getCategory,
    categoryBlock,
    editCategory,
    getActiveCategory,
    refreshToken,
    getProfile,
    getSalesReport,
 } from '../controllers/adminControllers.js'
 import { 
    addProduct,
    getProducts,
    blockProduct,
    getEditProduct,
    editProduct,
    getProductsForOffer,
    
 } from '../controllers/productControllers.js'
import { verifyAdminToken } from '../middleware/authMiddleware.js'
import { changeOrderStatus, getGraphData, getOrdersForAdmin, getTopFiveCategory, getTopTenProducts } from '../controllers/orderControllers.js'
import { addCoupon, blockCoupon, getCoupons } from '../controllers/couponControllers.js'
import { addOffer, blockOffer, getOffer } from '../controllers/offerControllers.js'

 adminRouter.post('/login',adminLogin)
 adminRouter.get('/refresh-token',refreshToken)
 adminRouter.get('/get-profile',verifyAdminToken,getProfile)
 adminRouter.get('/getuserslist',userList)
 adminRouter.post('/user-block',userBlock)
 adminRouter.post('/add-category',addCategory)
 adminRouter.get('/get-category',getCategory)
 adminRouter.get('/get-active-category',getActiveCategory)
 adminRouter.post('/category-block',categoryBlock)
 adminRouter.post('/add-product',addProduct)
 adminRouter.get('/get-products',getProducts)
 adminRouter.post('/product-block',blockProduct)
 adminRouter.post('/edit-category',editCategory)
 adminRouter.get('/get-edit-product',getEditProduct)
 adminRouter.put('/edit-product',editProduct)
 adminRouter.get('/get-orderDetials',getOrdersForAdmin)
 adminRouter.put('/change-order-status',changeOrderStatus)
 adminRouter.post('/add-coupon',addCoupon)
 adminRouter.get('/get-coupons',getCoupons)
 adminRouter.put('/block-coupon',blockCoupon)
 adminRouter.get('/get-productsForOffer',getProductsForOffer)
 adminRouter.post('/add-offer',addOffer)
 adminRouter.get('/get-offers',getOffer)
 adminRouter.post('/block-offers',blockOffer)
 adminRouter.get('/get-sales-report',getSalesReport)
 adminRouter.get('/get-top-ten-products',getTopTenProducts)
 adminRouter.get('/get-top-five-category',getTopFiveCategory)
 adminRouter.get('/get-graph-data',getGraphData)



 export default adminRouter