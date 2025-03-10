import mongoose from 'mongoose';
import Cart from '../modals/cartModel.js';
import Products from '../modals/productModal.js';
import Wishlist from '../modals/WishlistModel.js';
import Offer from '../modals/offerModal.js';

//for add products
const addProduct=async(req,res)=>{
    const {
        productName,
        price,
        stock,
        carat,
        description,
        category,
        origin,
        images
    }=req.body;
    if(productName.trim()===''){
      return res.status(401).json({messageToProductname:"*This field is required"})
    }
    if(stock<1){
      return res.status(401).json({messageToStock:"Enter a valid stock"})
    }
    if(carat<0){
      return res.status(401).json({messageToCarat:"Enter a valid carat"})
    }
    if(price<0){
      return res.status(401).json({messageToPrice:"*Enter a valid price"})
    }
    if(description.trim()===''){
      return res.status(401).json({messageToDescription:"*This field is required"})
    }
    if(category.trim()===''){
      return res.status(401).json({messageToCategory:"*This field is required"})
    }
    if(origin.trim()===''){
      return res.status(401).json({messageToOrigin:"*This field is required"})
    }
 
  const review=[
    {user_id:'671764ed401403b325ee5e83',userName:"Vinod",star:3,comment:"very nice "},
    {user_id:'671764ed401403b325ee5e83',userName:"Hari",star:2,comment:" nice product"},
    {user_id:'67172b9003b4a94ffb92dff0',userName:"John",star:4,comment:"very nice product"},
  ]
try {
   const product=await Products.create({
    productName,
    price,
    stock,
    carat,
    description,
    category,
    origin,
    review,
    images
   })
   await res.status(200).json({message:"success"})
} catch (error) {

res.status(500).json({ error: 'An error occurred while uploading images' });
}
     
}

//for edit product
const editProduct=async(req,res)=>{
  const {
    productName,
    price,
    stock,
    carat,
    description,
    category,
    origin,
    images,
    _id
  }=req.body;
  
  if(productName.trim()===''){
    return res.status(401).json({messageToProductname:"*This field is required"})
  }
  if(stock<1){
    return res.status(401).json({messageToStock:"Enter a valid stock"})
  }
  if(carat<0||carat==''){
    return res.status(401).json({messageToCarat:"Enter a valid carat"})
  }
  if(price<0||price==''){
    return res.status(401).json({messageToPrice:"*Enter a valid price"})
  }
  if(description.trim()===''){
    return res.status(401).json({messageToDescription:"*This field is required"})
  }
  if(category.trim()===''){
    return res.status(401).json({messageToCategory:"*This field is required"})
  }
  if(origin.trim()===''){
    return res.status(401).json({messageToOrigin:"*This field is required"})
  }
  try {
    const product=await Products.findByIdAndUpdate(_id,req.body)
    res.status(200).json({message:"success"})
  } catch (error) {
    console.log(error);
    
  }
}


// for getting product list for admin
const getProducts=async(req,res)=>{
  let {page,limit,sortBy}=req.query
  // filter = JSON.parse(filter);
  const skip=(page-1)*limit;
    try {
      let sort = {};
      switch (sortBy) {
        case "ascending":
          sort = { productName: 1 }; 
          break;
        case "descending":
          sort = { productName: -1 };
          break;
        case "highToLow":
          sort = { price: -1 }; 
          break;
        case "lowToHigh":
          sort = { price: 1 }; 
          break;
          case "latest":
          sort = { createdAt: -1 }; 
          break;
        default:
          sort = { productName: 1 }; 
          break;
      }
      
        const productList=await Products.find().sort(sort).skip(skip).limit(limit)
        const totalProducts=await Products.find().countDocuments()
        const totalPages=Math.ceil(totalProducts/limit)
        res.status(200).json({
          message:"success",
          productList,
          totalPages
        })
    } catch (error) {
        console.log(error);
        
    }
}

//for block product
const blockProduct=async(req,res)=>{
    const {id}=req.body;
    try {
      const product=await Products.findById(id)
      if(product.status){
        product.status=false
        product.save()
      }else{
        product.status=true
        product.save()
      }
      res.status(200).json({message:"success"})
      
    } catch (error) {
      console.log(error);
      
    }
}

//for listing products based on pagination
const listProducts=async(req,res)=>{
  let {page,limit,filter,sortBy}=req.query
  // let {page,limit,filter,sortBy,searchTerm}=req.query
  filter = JSON.parse(filter);
  const skip=(page-1)*limit;
  
try {
  let sort = {};
    switch (sortBy) {
      case "ascending":
        sort = { productName: 1 }; 
        break;
      case "descending":
        sort = { productName: -1 };
        break;
      case "highToLow":
        sort = { price: -1 }; 
        break;
      case "lowToHigh":
        sort = { price: 1 }; 
        break;
      default:
        sort = { productName: 1 }; 
        break;
    }
  const categoryFilter = filter.length > 0 ? { category: { $in: filter } } : {};
  if (sortBy === "outofstock") {
    categoryFilter.stock = { $gt: 0 }; 
  }
  // if (searchTerm) {
  //   categoryFilter.productName = { $regex: searchTerm, $options: "i" };
  // }
  const productList=await Products.find({status:true,...categoryFilter}).sort(sort).skip(skip).limit(limit)
  const totalProducts=await Products.find({status:true,...categoryFilter}).countDocuments()
  const totalPages=Math.ceil(totalProducts/limit)
  res.status(200).json({
    message:"success",
    productList,
    totalPages
  })
} catch (error) {
  console.log(error);
}
}

//function for getting offers
const getOffers = async (product_id) => {
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

    return {
      largestOffer: {
        name: largestOffer.offerName,
        value: largestOffer.offer
      },
      allOffers: detailedOffers
    };
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw new Error('Failed to get offers');
  }
};


//for getting single product details
const getProductDetails=async(req,res)=>{
  const {product_id,userId}=req.query
  try {
    const offers=await getOffers(product_id)
    const product=await Products.findById(product_id)
    if(userId&& userId !== 'null'){
      const cart = await Cart.findOne({
        user_id: userId,
        items: { $elemMatch: { product_id: product_id } }
      });
      const wishlist=await Wishlist.findOne({
        user_id:userId,
        items:{$elemMatch:{product_id:product_id}}
      })
      const isCart = !!cart;
      const isWishlist = !!wishlist;     
      res.status(200).json({message:"success",product,isCart,isWishlist,offers})
    }else{
      res.status(200).json({message:"success",product,offers})
    }
   
  } catch (error) {
    console.log(error);
  }
}

//for getting the review
const getReview=async(req,res)=>{
  const {product_id}=req.query
  try {
    const product=await Products.findById(product_id)
    const review=product.review
    res.status(200).json({message:"success",review})
  } catch (error) {
    console.log(error);
  }
}

//for getting the edit product
const getEditProduct=async(req,res)=>{
  const {product_id}=req.query
  try {
    const product=await Products.findById(product_id)
    res.status(200).json({message:"success",product})
  } catch (error) {
    console.log(error);
    
  }
  
}

//getting products for adding offer
const getProductsForOffer=async(req,res)=>{
  try {
    const products=await Products.find()
    await res.status(200).json({message:'success',products})
  } catch (error) {
    console.log(error);
  }
}

//getting products for homepage
const getProductsForHome=async(req,res)=>{
  try {
    const products=await Products.find({status:true})
    await res.status(200).json({message:'success',products})
  } catch (error) {
    console.log(error);
  }
}


//for searching a product
const searchProduct=async(req,res)=>{
  const {term}=req.body
  try {
    const searchProduct=await Products.find({productName:{$regex:term,$options:"i"}})
    // setTimeout(() => {
    //    res.status(200).json({message:'success',searchProduct})
    // }, 1000);
       await res.status(200).json({message:'success',searchProduct})
  } catch (error) {
    console.log(error);
    
  }  
}


export{
    addProduct,
    getProducts,
    blockProduct,
    listProducts,
    getProductDetails,
    getReview,
    getEditProduct,
    editProduct,
    getProductsForOffer,
    getProductsForHome,
    searchProduct
}


