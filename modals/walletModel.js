import mongoose from 'mongoose'

const walletSchema=mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    balance_amount:{
        type:Number,
        required:true
    },
   data:[
    {
        order_id:{
            type:mongoose.Schema.Types.ObjectId,
        },
        item:{
            type:String,
        },
        amount:{
            type:Number
        },
        date:{
            type:Date
        }
    }
   ]

},{ timestamps: true })

walletSchema.pre("save", function (next) {
    // Calculate totalAmount based on all items in the cart.
    this.balance_amount = this.data.reduce((acc, item) => {
      return acc + item.amount;
    }, 0);
  
    this.updatedAt = Date.now();
    next();
  });

const Wallet=mongoose.model('Wallet',walletSchema)
export default Wallet