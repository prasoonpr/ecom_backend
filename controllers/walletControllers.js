import Wallet from "../modals/walletModel.js"


//for getting wallet details
const getWallet=async(req,res)=>{
    const user_id=req.userId
    try {
        const wallet=await Wallet.findOne({user_id:user_id}).sort({createdAt:-1})
        await res.status(200).json({message:'success',wallet})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'server error'})
    }
}


//for add wallet
const addWallet=async(req,res)=>{
    const user_id=req.userId
    const{amount,productName,order_id,payment_id}=req.body
    try {
        if(payment_id){
            const user=await Wallet.findOne({user_id:user_id})
            if(user){
              user.data.push({
                order_id:order_id,
                item:productName,
                amount:amount,
                date:Date.now()
              })
              await user.save()
            }else{
                const user=await Wallet.create({
                    user_id:user_id,
                    balance_amount:amount,
                    data:[{
                        order_id:order_id,
                        item:productName,
                        amount:amount,
                        date:Date.now()
                    }]
                })
            }
        }
        await res.status(200).json({message:'success'})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'server error'})
    }
}

export {
    getWallet,
    addWallet
}