import mongoose from 'mongoose'

const tempUserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    default: null
  },
  otp: {
    type: String,

    default: null
  },
  otpExpiresAt: {
    type: Date,

    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120 
  }
})

const TempUser = mongoose.model('TempUser', tempUserSchema)
export default TempUser