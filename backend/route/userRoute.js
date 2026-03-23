import express from "express"; 
import isAuth from "../middleware/isAuth.js";
import {getCurrentUser} from "../controller/userControler.js";

const userRoute = express.Router();


userRoute.get("/getcurrentuser", isAuth, getCurrentUser);


export default userRoute;