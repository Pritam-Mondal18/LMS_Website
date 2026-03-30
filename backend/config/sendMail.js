import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();


// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // use STARTTLS (upgrade connection to TLS after connecting) [true for port 465, false for other ports]
  auth: {
    user: process.env.USER_EMAIL, //user:"p@gmail.com"
    pass: process.env.USER_PASSWORD, //pass:"enfw6wef5re7ge7e"
  },
});


const sendMail = async (to, otp) => {
    await transporter.sendMail({
        from: process.env.USER_EMAIL,
        to: to,
        subject: "OTP for password reset",
        html: `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 5 minutes. Please do not share it with anyone.</p>`,
    })
}  

export default sendMail