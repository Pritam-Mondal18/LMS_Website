import express from "express";
import { createCourse, editCourse, getCourseById, getCreatorCourses, getPublishedCourses, removeCourse } from "../controller/courseController.js";
import { isAuth} from "../middleware/isAuth.js";
import multer from "multer";
import upload from "../utils/multer.js";

const courseRouter = express.Router();

courseRouter.post("/create",isAuth,createCourse)
courseRouter.get("/published", getPublishedCourses)
courseRouter.get("/getcreator", isAuth,getCreatorCourses)
courseRouter.post("/editcourse/:courseId",isAuth, upload.single("thumbnail"), editCourse)
courseRouter.get("/getcourse/:courseId",isAuth,getCourseById)
courseRouter.delete("/remove/:courseId",isAuth, removeCourse)