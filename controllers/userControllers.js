import TempUser from "../modals/tempUser.js";
import User from "../modals/userModal.js";
import crypto from "crypto";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { sendOTP } from "../services/otpServices.js";
import createToken from "../utils/createToken.js";
import {OAuth2Client} from 'google-auth-library'

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const client=new OAuth2Client();

//for generating otp
const generateOTP = () => {
  return crypto.randomInt(100000, 999999);
};

//for refreshing token
const refreshToken = async (req, res) => {
  const  refreshToken  = req.cookies.refreshToken  
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token is required" });
  }
  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { accessToken, refreshToken: newRefreshToken } = createToken(user._id);
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

//for sending otp to the email
const checkUser = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const userExits = await User.findOne({ email });
    if (userExits) {
      return res.status(400).json({ message: "Email alredy exits" });
    }
    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000;
    const tempUser = await TempUser.create({
      firstName,
      lastName,
      password,
      email,
      otp,
      otpExpires,
    });
    await sendOTP(email, otp);
    res.status(200).json({ message: "OTP sent succesfully", email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//for verify the otp
const verifyUser = async (req, res) => {
  const { otp } = req.body;
  const user = await TempUser.findOne({ otp });
  if (!user) {
    return res.status(400).json({ message: "OTP expired or invalid OTP" });
  }
  const { firstName, lastName, email, password } = user;
  try {
    const verifiedUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      status: true,
      date:Date.now()
    });
    const { accessToken, refreshToken } = createToken(verifiedUser._id);
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    await res.status(200).json({ message: "User verified successfully", accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// for resending the otp
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const tempUser = await TempUser.findOne({ email });
    const otp = generateOTP();
    tempUser.otp = otp;
    await tempUser.save();
    await sendOTP(email, otp);
  } catch (error) {
    console.log(error);
  }
};

//for login the user
const loginUser = async (req,res) => {
  const {email,password}=req.body
  const user=await User.findOne({email})
  if(user){
    const pass=await user.matchPassword(password)
    if(pass){
      if(user.status){
        const { accessToken, refreshToken } = createToken(user._id);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        await res.status(200).json({ message: "User loggedin successfully", accessToken });
      }else{
        res.status(401).json({message:"You were banned by admin"})
      }
    }else{ 
      res.status(401).json({message:"Password not match"})
    }
  }else{
    res.status(401).json({message:"Invalid email"}) 
  }
};

//for login with goolgle
const googleLogin=async(req,res)=>{
    const {credential}=req.body
    try {
      const ticket=await client.verifyIdToken({
        idToken:credential,
        audience: process.env.GOOGLE_CLIENT_ID
      })
      const {email}=ticket.getPayload()
      const user=await User.findOne({email})
      if(!user){
        return res.status(401).json({message:"user not found"})
      }
      if(!user.status){
        return res.status(401).json({message:"You were blocked by admin"})
      }
      if(user){
        const { accessToken, refreshToken } = createToken(user._id);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV !== "development",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        await res.status(200).json({ message: "User loggedin successfully", accessToken });
      }
    } catch (error) {
      res.status(500).json({message:"server error"})
    }    

}

//for geting user profile
const userProfile=async (req,res)=>{
  const id=req.userId
  try {
  const userProfile=await User.findById(id);
  if(userProfile.status){
    res.status(200).json({message:"success",userProfile})  
  }else{
  res.status(404).json({message:"user banned by admin"})
  }
} catch (error) {
  res.status(404).json({message:"user not found"})
}  
}

//for edit user information
const editInfo=async(req,res)=>{
  const id=req.userId
  try {
    await User.findByIdAndUpdate(id,req.body)
    res.status(200).json({message:"success"})  
  } catch (error) {
  res.status(404).json({message:"user not found"})
  }
}

//for change password
const changePass=async(req,res)=>{
  const id=req.userId
  const {oldPass,password}=req.body
  try {
    const user=await User.findById(id)
    const truePass=await bcrypt.compare(oldPass,user.password)
    if(truePass){
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.findByIdAndUpdate(id, { password: hashedPassword });
      res.status(200).json({message:"success"})  
    }else{
      res.status(401).json({message:"password not match"})  
    }
    
  } catch (error) {
  res.status(404).json({message:"user not found"})
  }
}

//for logout user
const logoutUser=async(req,res)=>{
  res.clearCookie('refreshToken',{
     httpOnly: true,
     secure: process.env.NODE_ENV !== "development"
  })
  return res.status(200).json({ message: "Logged out successfully" });
}



export {
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
  };
