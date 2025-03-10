import Offer from "../modals/offerModal.js"

//for add an offer
const addOffer=async(req,res)=>{
    const {offerName,offer,target_value,target_id,end_date}=req.body
    
    if(offerName.trim()===''){
        return res.status(401).json({message:"name cannot be empty"})
      }
   
      if(target_value===''){
          return res.status(401).json({message:"target cannot be empty"})
    }
    if(offer===''){
        return res.status(401).json({message:"offer cannot be empty"})
    }
      if(target_id.length<=0){
        return res.status(401).json({message:"please select an item"})
      }
      if(end_date===''){
        return res.status(401).json({message:"date cannot be empty"})
      }
      try {
        const createOffer=await Offer.create({
            offerName,
            target_value,
            target_id,
            offer,
            end_date
        })
        await res.status(200).json({message:'offer added'})
      } catch (error) {
        console.log(error);
        
        res.status(500).json({message:'server error'})
      }
}

//for getting offer
const getOffer=async(req,res)=>{
  let {page,limit,sortBy}=req.query
  const skip=(page-1)*limit;
  try {
    let sort = {};
    switch (sortBy) {
      case "ascending":
        sort = { offerName: 1 }; 
        break;
      case "descending":
        sort = { offerName: -1 };
        break;
      case "highToLow":
        sort = { offer: -1 }; 
        break;
      case "lowToHigh":
        sort = { offer: 1 }; 
        break;
        case "latest":
        sort = { createdAt: -1 }; 
        break;
      default:
        sort = { productName: 1 }; 
        break;
    }
    const offers=await Offer.find().sort(sort).skip(skip).limit(limit)
    const totalOffers=await Offer.find().countDocuments()
    const totalPages=Math.ceil(totalOffers/limit)
    res.status(200).json({message:'success',offers,totalPages})
  } catch (error) {
    res.status(500).json({message:'server error'})
  }
}

// for block a offer
const blockOffer=async(req,res)=>{
  const {id}=req.body
  try {
    const offer = await Offer.findById(id);
    if (offer) {
      offer.status = !offer.status;
      await offer.save();
      res.status(200).json({ message: "offer status updated" });
  } else {
      res.status(404).json({ message: "offer not found" });
  }
  } catch (error) {
    res.status(500).json({message:'server error'})
  }
}

export {
    addOffer,
    getOffer,
    blockOffer
}