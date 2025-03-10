import Address from "../modals/addressModel.js";

//for add address
const addAddress = async (req, res) => {
  const user_id = req.userId;
  const {
    name,
    phone,
    pincode,
    locality,
    address,
    city,
    state,
    landmark,
    alternativePhone,
    addressType,
  } = req.body;
  try {
    const newAddress = Address.create({
      user_id,
      name,
      phone,
      pincode,
      locality,
      address,
      city,
      state,
      landmark,
      alternativePhone,
      addressType,
    });
    if (newAddress) {
      res.status(200).json({ message: "New address Added" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while adding address" });
  }
};

//for get address
const getAddresses = async (req, res) => {
  const user_id = req.userId;
  try {
    const addresses = await Address.find({ user_id: user_id });
    res.status(200).json({ message: "success", addresses });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while getting address" });
  }
};

//for edit address
const editAddress = async (req, res) => {
  const { _id } = req.body;
  try {
    const updateAddress = await Address.findByIdAndUpdate(_id, req.body);
    res.status(200).json({ message: "Saved Changes" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while edit address" });
  }
};

//for delete address
const deleteAddress = async (req, res) => {
  const { address_id } = req.body;

  try {
    const response = await Address.findOneAndDelete({ _id: address_id });
    res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while delete address" });
  }
};

//for set default address
const setDefaultAddress=async(req,res)=>{
  const user_id=req.userId
  const {address_id}=req.body
  try {
    await Address.updateMany(
      { user_id: user_id, defaultAddress: true },
      { $set: { defaultAddress: false } }
    );
    const address=await Address.findByIdAndUpdate(address_id,{defaultAddress:true})
    await res.status(200).json({message:'setted as default address'})
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while delete address" });
  }
}

export { addAddress, getAddresses, editAddress, deleteAddress,setDefaultAddress };
