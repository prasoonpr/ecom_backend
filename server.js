import express from 'express'
import cors from 'cors'
import connectDB from './config/mongodb.js';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import connectColudinary from './config/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()
const app=express();
const port=process.env.PORT || 4000
connectDB()
// connectColudinary()

//middlewares
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

app.use(express.json())
const corsOptions = {
    origin: 'https://gemasdelujo.prasoonpr.tech', 

    // origin: 'http://192.168.1.9:5173', 
    credentials: true,  
  };
  app.use(cors(corsOptions));
app.use(cookieParser())
  

//api end points
app.use('/api/user',userRouter)
app.use('/api/admin',adminRouter)

app.listen(port,()=> console.log(`server is running on ${port}`))
// app.listen(port,'0.0.0.0',()=> console.log(`server is running on ${port}`))