
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
const userSchema = mongoose.Schema({
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
  status: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: null
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
},{ timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}
const User = mongoose.model('User', userSchema)
export default User
