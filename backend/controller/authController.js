import User from "../model/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";
import sendMail from "../config/sendMail.js";

export const signUp = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let existUser = await User.findOne({ email: email });
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }
    let hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role,
    });
    let token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      // sameSite: "Strict",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    return res.status(500).json({ message: `Signup failed ${error}` });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    let token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      // sameSite: "Strict",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Login failed ${error}` });
  }
};

export const logOut = async (req, res) => {
  try {
    await res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: `Logout failed ${error}` });
  }
};

export const sendOTP = async (req, res) => {
  try{
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    const otp = Math.floor(1000 + Math.random()*9000).toString()

    user.resetotp = otp,
    user.otpExpires = Date.now() + 5*60*1000,
    user.isOtpVerified = false,

    await user.save()
    await sendMail(email, otp)
    return res.status(200).json({message:"OTP sent to email"})
  }catch(error){
    return res.status(500).json({message:`Error in sending OTP ${error}`})  
  }
}

export const verifyOTP = async (req, res) => {
  try{
    const {email, otp} = req.body
    const user = await User.findOne({email})
    if(!user || user.resetotp !== otp || user.otpExpires < Date.now()){
      return res.status(404).json({message:"Invalid OTP"})
    }
    user.isOtpVerified = true
    user.resetotp = undefined
    user.otpExpires = undefined
    await user.save()

    return res.status(200).json({message:"OTP verified successfully"})
  }catch(error){
    return res.status(500).json({message:`Error in verifying OTP ${error}`})
  }
}

export const resetPassword = async (req, res) => {
  try{
    const {email, password} = req.body
    const user = await User.findOne({email})
    if(!user || !user.isOtpVerified){
      return res.status(404).json({message:"OTP verification is required"})
    }
    const hashPassword = await bcrypt.hash(password, 10)
    user.password = hashPassword,
    user.isOtpVerified = false
    await user.save()
    return res.status(200).json({message:"Password reset successfully"})  
  }catch(error){
    return res.status(500).json({message:`Error in resetting password ${error}`}) 
  }
}


export const googleAuth = async (req,res)=> {
  try{
    const {name, email, role} = req.body
    let user = await User.findOne({email})
    if(!user){
      user = await User.create({
        name, 
        email,
        password: "", // No password for Google auth users
        isGoogleUser: true, // ✅ SET THIS FLAG FOR GOOGLE AUTH USERS 
        role: role || "student"
      })
    }
    let token = await genToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    return res.status(200).json(user)
  }catch(error){
    return res.status(500).json({message:`Google authentication failed ${error}`}) 
  }
}