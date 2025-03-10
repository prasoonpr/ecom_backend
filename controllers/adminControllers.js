import Category from "../modals/categoryModal.js";
import User from "../modals/userModal.js";
import createToken from "../utils/createToken.js";
import jwt from 'jsonwebtoken'
import Orders from "../modals/orderModel.js";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;




//for admin login
const adminLogin=async(req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(user){
      const pass=await user.matchPassword(password)
      if(pass && user.role=='admin'){
        const { accessToken, refreshToken } = createToken(user._id);
        res.cookie("adminRefreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        await res.status(200).json({ message: "User loggedin successfully", accessToken });
      }else{ 
        res.status(401).json({message:"Password not match or Not admin"})
      }
    }else{
      res.status(401).json({message:"Invalid email"}) 
    }
}

//for refreshing token
const refreshToken = async (req, res) => {  
  const  refreshToken  = req.cookies.adminRefreshToken 
  if (!refreshToken) {    
    return res.status(401).json({ message: "Refresh token is required" });
  }
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const admin = await User.findById(decoded.userId);
    
    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }
    const { accessToken, refreshToken: newRefreshToken } = createToken(admin._id);
    res.cookie("adminRefreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    console.log(error);
    
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

//get admin profile
const getProfile=async(req,res)=>{
  const id=req.userId
  try {
    const userProfile=await User.findById(id);
    if(userProfile.role=="admin"){
      res.status(200).json({message:"success",userProfile})  
    }else{
    res.status(404).json({message:"You are not admin"})
    }
  } catch (error) {
    res.status(404).json({message:"user not found"})
  }  
}
//for get users list
const userList=async(req,res)=>{
  const {page,limit,sortBy}=req.query
  const skip=(page-1)*limit;
  try {
    let sort = {};
    switch (sortBy) {
      case "name":
        sort = { firstName: 1 }; 
        break;
      case "email":
        sort = { email: 1 };
        break;
      case "joinedOn":
        sort = { date: 1 }; 
        break;
      default:
        sort = { firstName: 1 }; 
        break;
    }
    const usersList=await User.find({role:{$ne:"admin"}}).sort(sort).skip(skip).limit(limit)
    const totalProducts=await User.find({role:{$ne:"admin"}}).countDocuments()
    const totalPages=Math.ceil(totalProducts/limit)
    await res.status(200).json({message:"success",usersList,totalPages})
  } catch (error) {
    console.log(error);
    
  }
}

//for block user
const userBlock=async(req,res)=>{
  const {id}=req.body;
  try {
    const user=await User.findById(id)
    if(user.status){
      user.status=false
      user.save()
    }else{
      user.status=true
      user.save()
    }
    res.status(200).json({message:"success"})
    
  } catch (error) {
    console.log(error);
    
  }
}

// for add category
const addCategory=async(req,res)=>{
  const {category,description}=req.body
  if(category.trim()===''){
    return res.status(401).json({messageToCategory:"Category cannot be empty"})
  }
  if(description.trim()===''){
    return res.status(401).json({messageToDescription:"description cannot be empty"})
  }
  try {
    const exist=await Category.findOne({category})
    if(exist){
     return res.status(401).json({messageToCategory:"Category alredy exist"})
    }
    const newCategory= new Category({
      category,
      description
    })
    await newCategory.save()
    await res.status(200).json({message:"success"})
  } catch (error) {
    res.status(401).json({messageToCategory:"Error occured"}) 
  }  
}

//for getting category
const getCategory=async(req,res)=>{
  const {page,limit}=req.query
  const skip=(page-1)*limit;
  try {
    const categoryList=await Category.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
    const totalProducts=await User.find().countDocuments()
    const totalPages=Math.ceil(totalProducts/limit)
    res.status(200).json({message:"success",categoryList,totalPages})
  } catch (error) {
    res.status(401)
  }
}

//for getting active category in product add and edit page
const getActiveCategory=async(req,res)=>{
  try {
    const categoryList=await Category.find({status:true})
    res.status(200).json({message:"success",categoryList})
  } catch (error) {
    console.log(error);
    
  }
}

//for block category
const categoryBlock=async(req,res)=>{
  const {id}=req.body;
  try {
    const category=await Category.findById(id)
    if(category.status){
      category.status=false
      category.save()
    }else{
      category.status=true
      category.save()
    }
    res.status(200).json({message:"success"})
    
  } catch (error) {
    console.log(error);
    
  }
}

//for edit the category

const editCategory=async(req,res)=>{
  const {category,description,id}=req.body
  if(category.trim()==''){
    return res.status(401).json({messageToCategory:"Category cannot be empty"})
  }
  if(description.trim()==''){
    return res.status(401).json({messageToDescription:"Description cannot be empty"})
  }
  try {
    const exist=await Category.findOne({$and:[{category:category},{_id:{$ne:id}}]})
    if(exist){console.log(id);
      console.log(exist);
      return res.status(401).json({messageToCategory:"Category alredy exist"})
    }  
    const updateCategory=await Category.findByIdAndUpdate(id,req.body)
    res.status(200).json({message:"success"})
  } catch (error) {
     res.status(401).json({messageToCategory:"server error"})
  }
}



//for get sales report
const getSalesReport=async(req,res)=>{
  let {sortBy,startDate,endDate,productsPerPage,currentPage}=req.query
  try {
    let sort = {};
    switch (sortBy) {
      case "daily":
        sort = { "items.itemCreatedAt": { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } };
        break;
      case "weekly":
        sort =  { "items.itemCreatedAt": { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case "yearly":
        sort = { "items.itemCreatedAt": { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } };
        break;
      case "customDate":
        if (startDate && endDate) {
          sort = {
            "items.itemCreatedAt": {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          };
        }
        break;
      default:
        sort = {};
        break;
    }
    const salesReport= await Orders.aggregate([
      { 
        $unwind: "$items" 
      },
      { 
          $match: sort
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
        $sort: { "items.itemCreatedAt": -1 } 
      },
      {
      $lookup: {
        from: "users", 
        localField: "user_id",
        foreignField: "_id",
        as: "userDetails"
      }
    },
    {
      $unwind: "$userDetails"
    },
    {
        $project: {
            _id: 0,
            "items.quantity": 1,
            "items.price": 1,
            "items.payment_id": 1,
            "items.payment_method": 1,
            "items.payment_status": 1,
            "items.discount": 1,
            "items.offer": 1,
            "items.payableAmount": 1,
            "items.itemCreatedAt": 1,
            "items.order_status": 1,
            "items._id": 1,
            "productDetails._id":1,
            "productDetails.productName": 1,
            "userDetails.firstName": 1, 
            "userDetails.email": 1,
            "userDetails._id": 1,
        }
    },
  ])
  const totalPages=Math.ceil(salesReport.length / productsPerPage)
  const totalAmount=salesReport.reduce((acc,items)=>acc+items.items.price,0)
  const revenue=salesReport.reduce((acc,items)=>acc+items?.items?.payableAmount,0)
  const totalDiscount=totalAmount-revenue
  const totalOrders=salesReport.length
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = salesReport.slice(indexOfFirstProduct, indexOfLastProduct);

  const items={totalPages,totalAmount,revenue,totalOrders,totalDiscount,currentProducts}
  await res.status(200).json({message:'success',items})
  } catch (error) {
    res.status(500).json({messageToCategory:"server error"})
  }
}


export {
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
    getSalesReport
}