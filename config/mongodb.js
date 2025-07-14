// import mongoose from "mongoose";

// const connectDB=async ()=>{
//     mongoose.connection.on('connected',()=>{
//         console.log('DB connected');
        
//     })
//     await mongoose.connect(`${process.env.MONGODB_URI}/e_Commerse`)
// }

// export default connectDB

import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on('connected', () => {
    console.log('✅ DB connected');
  });

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
