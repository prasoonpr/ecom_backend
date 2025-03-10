import mongoose from "mongoose";
import Cart from "../modals/cartModel.js";
import Orders from "../modals/orderModel.js";
import Products from "../modals/productModal.js";
import razorpayInstance from "../config/razorpay.js";
import Offer from '../modals/offerModal.js'
import crypto from 'crypto';

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
   
    return largestOffer.offer
  } catch (error) {
    console.error('Error fetching offers:', error);
    throw new Error('Failed to get offers');
  }
};


//for place a order
const placeOrder = async (req, res) => {
  const {cartSave,paymentMethod,totalPrice,couponDiscount} = req.body;
  const user_id = req.userId;
  const discountApplied=couponDiscount/cartSave.length
  const totalAmount=Math.round(totalPrice)
  try {
    for(const cartItem of cartSave){
      const isStock=await Products.findById(cartItem.product_id)
      if(isStock.stock<cartItem.quantity||!isStock.status){
        return res.status(401).json({message:`The ${isStock.productName} currently unavailable`})
      }
    }
   
   if(paymentMethod==='cashOnDeliver'){ 
    let order = await Orders.findOne({ user_id: user_id });
    //if user then update the user orders
    if (order) {
      const itemsWithOffers = await Promise.all(
        cartSave.map(async (cartItem) => {
          const isStock=await Products.findById(cartItem.product_id)
          const offerApplied = await getOffers(cartItem.product_id);
          const payableAmount=cartItem.price-(((offerApplied+discountApplied)/100)*cartItem.price)
          return {
            address_id: cartItem.address_id,
            product_id: cartItem.product_id,
            quantity: cartItem.quantity,
            price: cartItem.price,
            discount: discountApplied,
            offer: offerApplied,
            payableAmount:payableAmount,
            order_status: "Pending",
            payment_status: "Pending",
            payment_method: paymentMethod,
          };
        })
      );

      order.items.push(...itemsWithOffers);
      await order.save();
    } else {
     // if not user then creating a document and store the order details
     const itemsWithOffers = await Promise.all(
      cartSave.map(async (cartItem) => {
        const offerApplied = await getOffers(cartItem.product_id);
        const payableAmount=cartItem.price-(((offerApplied+discountApplied)/100)*cartItem.price)
        return {
          address_id: cartItem.address_id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          discount: discountApplied,
          offer: offerApplied,
          price: cartItem.price,
          payableAmount:payableAmount,
          order_status: "Pending",
          payment_status: "Pending",
          payment_method: paymentMethod,
        };
      })
    );

    order = await Orders.create({
      user_id: user_id,
      items: itemsWithOffers,
    });
  }
    //after order placed then remove those items from the cart and update the stock
    await Promise.all(
        cartSave.map(async (cartItem) => {
          await Cart.findOneAndUpdate(
            { user_id: user_id },
            { $pull: { items: { product_id: cartItem.product_id } } }
          );
          await Products.findOneAndUpdate(
            { _id: cartItem.product_id },
            {$inc:{stock:-cartItem.quantity}}
          )
        })
      );
      res.status(200).json({message:'Order placed succesfully'})
    }else if(paymentMethod==='razorpay'){
        const options = {
          amount: totalAmount * 100, 
          currency:  'INR',
          receipt: `receipt_${new Date().getTime()}`
        };
        const order = await razorpayInstance.orders.create(options);
       res.status(200).json({order});
      }
  } catch (error) {
    console.log(error);
    res.status(500).json({message:'Amount exceeds maximum amount allowed'})
  }
};


//for verify payment
const verifyPayment=async(req,res)=>{
  const user_id = req.userId;
  const { payment_id, order_id, signature,cartSave,couponDiscount,paymentMethod } = req.body;
  const discountApplied=couponDiscount/cartSave.length
  const secret = process.env.RAZORPAY_KEY_SECRET;
  try {
    let order = await Orders.findOne({ user_id: user_id });
    //if user then update the user orders
    if (order) {
      const itemsWithOffers = await Promise.all(
        cartSave.map(async (cartItem) => {
          const offerApplied = await getOffers(cartItem.product_id);
          const payableAmount=cartItem.price-(((offerApplied+discountApplied)/100)*cartItem.price)
          return {
            address_id: cartItem.address_id,
            product_id: cartItem.product_id,
            quantity: cartItem.quantity,
            price: cartItem.price,
            discount: discountApplied,
            offer: offerApplied,
            payableAmount:payableAmount,
            order_status: "Pending",
            payment_status: "Pending",
            payment_id:payment_id,
            payment_method: paymentMethod
          };
        })
      );

      order.items.push(...itemsWithOffers);
      await order.save();
    } else {
     // if not user then creating a document and store the order details
     const itemsWithOffers = await Promise.all(
      cartSave.map(async (cartItem) => {
        const offerApplied = await getOffers(cartItem.product_id);
        const payableAmount=cartItem.price-(((offerApplied+discountApplied)/100)*cartItem.price)
        return {
          address_id: cartItem.address_id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          discount: discountApplied,
          offer: offerApplied,
          price: cartItem.price,
          payableAmount:payableAmount,
          order_status: "Pending",
          payment_status: "Pending",
          payment_id:payment_id,
          payment_method: paymentMethod
        };
      })
    );

    order = await Orders.create({
      user_id: user_id,
      items: itemsWithOffers,
    });
    }
    //after order placed then remove those items from the cart and update the stock
    await Promise.all(
        cartSave.map(async (cartItem) => {
          await Cart.findOneAndUpdate(
            { user_id: user_id },
            { $pull: { items: { product_id: cartItem.product_id } } }
          );
          await Products.findOneAndUpdate(
            { _id: cartItem.product_id },
            {$inc:{stock:-cartItem.quantity}}
          )
        })
      );

    const generatedSignature = crypto.createHmac('sha256', secret).update(`${order_id}|${payment_id}`).digest('hex');
  
    if (generatedSignature === signature) {
      await Orders.updateOne(
        { user_id: user_id },
        { $set: { "items.$[item].payment_status": 'Paid' } },
        { arrayFilters: [{ "item.payment_id": payment_id }] }
      );
      res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
  console.log(error);
  }
}

//for handling failure orders
const failureOrder=async(req,res)=>{
  const user_id = req.userId;
  const { payment_id,cartSave,couponDiscount,paymentMethod } = req.body;
  const discountApplied=couponDiscount/cartSave.length
  // const secret = process.env.RAZORPAY_KEY_SECRET;
  try {
    let order = await Orders.findOne({ user_id: user_id });
    //if user then update the user orders
    if (order) {
      const itemsWithOffers = await Promise.all(
        cartSave.map(async (cartItem) => {
          const offerApplied = await getOffers(cartItem.product_id);
          const payableAmount=cartItem.price-(((offerApplied+discountApplied)/100)*cartItem.price)
          return {
            address_id: cartItem.address_id,
            product_id: cartItem.product_id,
            quantity: cartItem.quantity,
            price: cartItem.price,
            discount: discountApplied,
            offer: offerApplied,
            payableAmount:payableAmount,
            order_status: "Pending",
            payment_status: "Pending",
            payment_id:payment_id,
            payment_method: paymentMethod
          };
        })
      );

      order.items.push(...itemsWithOffers);
      await order.save();
    } else {
     // if not user then creating a document and store the order details
     const itemsWithOffers = await Promise.all(
      cartSave.map(async (cartItem) => {
        const offerApplied = await getOffers(cartItem.product_id);
        const payableAmount=cartItem.price-(((offerApplied+discountApplied)/100)*cartItem.price)
        return {
          address_id: cartItem.address_id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          discount: discountApplied,
          offer: offerApplied,
          price: cartItem.price,
          payableAmount:payableAmount,
          order_status: "Pending",
          payment_status: "Pending",
          payment_id:payment_id,
          payment_method: paymentMethod
        };
      })
    );

    order = await Orders.create({
      user_id: user_id,
      items: itemsWithOffers,
    });
    }
    //after order placed then remove those items from the cart and update the stock
    await Promise.all(
        cartSave.map(async (cartItem) => {
          await Cart.findOneAndUpdate(
            { user_id: user_id },
            { $pull: { items: { product_id: cartItem.product_id } } }
          );
          await Products.findOneAndUpdate(
            { _id: cartItem.product_id },
            {$inc:{stock:-cartItem.quantity}}
          )
        })
      );
      res.status(200).json({ success: true, message: 'Order placed successfully with payment pending.' });
  } catch (error) {
  console.log(error);
  }
}


//for retrying payment
const retryPayment=async(req,res)=>{
  const {amount,order_id}=req.body
  try {
    const options = {
      amount: amount * 100, 
      currency:  'INR',
      receipt: `receipt_${new Date().getTime()}`
    };
    const order = await razorpayInstance.orders.create(options);
   res.status(200).json({order,order_id});
  } catch (error) {
    res.status(500).json({message:'Something went wrong'})
  }
}

//for verify retrying payment
const verifyRetry=async(req,res)=>{
const {payment_id,razorpay_order_id,signature,orderId}=req.body;
const user_id=req.userId
const secret = process.env.RAZORPAY_KEY_SECRET;
try {
  const generatedSignature = crypto.createHmac('sha256', secret).update(`${razorpay_order_id}|${payment_id}`).digest('hex');
  if (generatedSignature === signature) {
    await Orders.updateOne(
      { user_id: user_id ,"items._id":orderId},
      { $set: { "items.$.payment_status": 'Paid' ,"items.$.payment_id":payment_id} },
    );
    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid payment signature' });
  }
} catch (error) {
  console.log(error);
}
}

//for getting order details
const getOrders=async(req,res)=>{
    const user_id=new mongoose.Types.ObjectId(req?.userId)
    const page=parseInt(req.query.page) || 1
    const limit=parseInt(req.query.limit) || 9
    const skip=(page-1)*limit
    try {
      const totalResults = await Orders.aggregate([
        { $match: { user_id: user_id } },
        { $unwind: "$items" }
    ]).count("totalCount");

    const totalProducts = totalResults.length > 0 ? totalResults[0].totalCount : 0;
    const totalPages = Math.ceil(totalProducts / limit);

        const orderItems = await Orders.aggregate([
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
              $lookup: {
                  from: "addresses", 
                  localField: "items.address_id",
                  foreignField: "_id",
                  as: "addressDetails"
              }
          },
          {
            $unwind: "$addressDetails" 
          },
            {
              $sort: { "items.itemCreatedAt": -1 } 
            },
            {
              $project: {
                  _id: 0,
                  "items.quantity": 1,
                  "items.price": 1,
                  "items.order_status": 1,
                  "items.payment_status": 1,
                  "items.payableAmount": 1,
                  "items.payment_id": 1,
                  "items.payment_method": 1,
                  "items.itemCreatedAt":1,
                  "items._id": 1,
                  "productDetails._id":1,
                  "productDetails.productName": 1,
                  "productDetails.carat": 1,
                  "productDetails.category": 1,
                  "productDetails.origin": 1,
                  "productDetails.images": 1,
                  "addressDetails.name":1,
                  "addressDetails.phone":1,
                  "addressDetails.pincode":1,
                  "addressDetails.address":1,
                  "addressDetails.city":1,
                  "addressDetails.locality":1,
              }
          },
          {$skip:skip},
          {$limit:limit}

        ])
        await res.status(200).json({orderItems,totalPages});
    } catch (error) {
        res.status(500).json({message:'cannot getting products'})
    }
}

//for getting order details for admin
const getOrdersForAdmin=async(req,res)=>{
  const page=parseInt(req.query.page) || 1
  const limit=parseInt(req.query.limit) || 9
  const skip=(page-1)*limit
  try {
    const totalResults = await Orders.aggregate([
      { $match: {} },
      { $unwind: "$items" }
  ]).count("totalCount");

  const totalProducts = totalResults.length > 0 ? totalResults[0].totalCount : 0;
  const totalPages = Math.ceil(totalProducts / limit);

      const orderItems = await Orders.aggregate([
          { 
              $match: {  }
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
                "items.order_status": 1,
                "items._id": 1,
                "items.payableAmount": 1,
                "productDetails._id":1,
                "productDetails.productName": 1,
                "productDetails.carat": 1,
                "productDetails.category": 1,
                "productDetails.origin": 1,
                "productDetails.images": 1,
                "userDetails.firstName": 1, 
                "userDetails.email": 1,
                "userDetails._id": 1,
            }
        },
        {$skip:skip},
        {$limit:limit}

      ])
      await res.status(200).json({orderItems,totalPages});
  } catch (error) {
      res.status(500).json({message:'cannot getting products'})
  }
}

//for change order status
  const changeOrderStatus=async(req,res)=>{
    const {user_id,action,order_id,product_id,quantity}=req.body
    try {
      const IsCancelled=await Orders.findOne( {user_id: user_id,items: {$elemMatch: {_id: order_id, }}},{"items.$": 1 })
      if(IsCancelled.items[0].order_status=='Cancelled'){
        return  res.status(401).json({message:'This item is cancelled'})
      }
      
      let order = await Orders.findOneAndUpdate(
        { user_id: user_id, "items._id":order_id },
        {$set:{"items.$.order_status":action}}
      );
      if(action==='Cancelled'){
        await Products.findOneAndUpdate(
          { _id: product_id },
          { $inc: { stock: quantity } }
        );
      }
        await res.status(200).json({message:`Order status changed to ${action}`})
    } catch (error) {
      console.log(error);
      res.status(500).json({message:'something went worng'})
    }
  }

//for cancell order
const cancellOrder=async(req,res)=>{
  const user_id=req.userId
  const {product_id,quantity,order_id}=req.body
try {
  let order = await Orders.findOneAndUpdate(
    { user_id: user_id, "items._id":order_id },
    {$set:{"items.$.order_status":"Cancelled"}}
  );
  await Products.findOneAndUpdate(
    { _id: product_id },
    { $inc: { stock: quantity } }
  );
    await res.status(200).json({message:`Order Cancelled`})
} catch (error) {
  console.log(error);
  res.status(500).json({message:'something went worng'})
}  
}


//for getting the top ten products for admin
const getTopTenProducts = async (req, res) => {
  try {
    const topProducts = await Orders.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product_id",
          orderCount: { $sum: 1 },  
          totalQuantitySelled: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.payableAmount" },
        },
      },
      { $sort: { totalQuantitySelled: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",  
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: "$productDetails.productName",
          category: "$productDetails.category",
          orderCount: 1,
          totalQuantitySelled: 1,
          totalRevenue: 1,
        },
      },
    ]);
    res.status(200).json(topProducts);
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



//for getting the top five category for admin
const getTopFiveCategory=async(req,res)=>{
  try {
    const topCategory = await Orders.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product_id",  
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails.category",
          totalOrder: { $sum: 1 },  
          totalQuantitySelled: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.payableAmount" },
        },
      },
      { $sort: { totalQuantitySelled: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,                     
          category: "$_id",          
          totalOrder: 1,
          totalQuantitySelled: 1,
          totalRevenue: 1,
        },
      },
    ]);
    res.status(200).json(topCategory);
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


//for getting graph datas for admin
const getGraphData=async(req,res)=>{
  try {
    const { period } = req.query;
    let dateFormat;
    switch (period) {
      case "daily":
        dateFormat = "%Y-%m-%d" 
        break;
      case "monthly":
        dateFormat = "%Y-%m"
        break;
      case "yearly":
        dateFormat = "%Y"
        break;
      default:
        dateFormat = "%Y-%m-%d" 
    }
    const salesData = await Orders.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$items.itemCreatedAt" } }, 
          totalSales: { $sum: "$items.payableAmount" }, 
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          name: "$_id",          
          value: "$totalSales",   
        },
      },
    ]);

    res.status(200).json(salesData); 
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export { 
    placeOrder,
    getOrders,
    getOrdersForAdmin,
    changeOrderStatus,
    cancellOrder,
    verifyPayment,
    failureOrder,
    retryPayment,
    verifyRetry,
    getTopTenProducts,
    getTopFiveCategory,
    getGraphData
};
