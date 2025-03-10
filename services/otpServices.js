import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config();


const transporter=nodemailer.createTransport({
    service:"Gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

// Function to send OTP via email
export const sendOTP = async (email, otp) => {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER, 
        to: email,                    
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      };
        await transporter.sendMail(mailOptions);

    } catch (error) {
      console.error('Error sending OTP email:', error.message);  
      throw new Error('Could not send OTP email. Please try again later.');
    }
  };