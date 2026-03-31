import express from "express"; 
import isAuth from "../middleware/isAuth.js";
import upload from "../middleware/multer.js";
import {getCurrentUser, updateProfile} from "../controller/userControler.js";

const userRoute = express.Router();


userRoute.get("/getcurrentuser", isAuth, getCurrentUser);
userRoute.post ("/profile", isAuth,upload.single("photoUrl"),updateProfile)
export default userRoute;