import Course from "../models/courseModel.js";

export const createCourse = async (req,res) => {
    try{
        const{title,category} = req.body;

        if(!title || !category){
            return res.status(400).json({message:"Title or category is required"})
        }
        const course = await Course.create({
            title,
            description,
            creator:req.user._id,

        })
        return res.status(201).json({message:"Course created successfully",course})
    }catch(error){
        res.status(500).json({message:`Create course error: ${error}`})
    }
}

export const getPublishedCourses = async (req,res) => {
    try{
        const courses = await Course.find({isPublished:true})
        if(!courses){
            return res.status(404).json({message:"No courses are found"})
        }
        return res.status(200).json({courses})
    }catch(error){
        res.status(500).json({message:`Failed to get published courses: ${error}`})
    }
}

export const getCreatorCourses = async(req,res) => {
    try{
        const userId = req.user._id;
        const courses = await Course.find({creator:userId})
        if(!courses){
            return res.status(404).json({message:"No courses are found for this creator"})
        }
        return res.status(200).json({courses})

    }catch(error){
        res.status(500).json({message:`Failed to get creator courses: ${error}`})
    }
}

export const editCourse = async(req,res) => {
    try{
        const {courseId} = req.params
        const {title,subTitle,description,category,level,isPublished,price,} = req.body;
        let thumbnail 
        if(req.file){
            thumbnail = await uploadOnCloudinary(req.file.path)
        }
        let course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course not found"})
        }
        const updateData = {
            title,
            subTitle,
            description,
            category,
            level,
            isPublished,
            price,
            thumbnail
        }
        course = await Course.findByIdAndUpdate(courseId, updateData, {new:true})
        return res.status(200).json({message:"Course updated successfully", course})
    }catch(error){
        res.status(500).json({message:`Failed to edit course: ${error}`})
    }
}

export const getCourseById = async(req,res) => {
    try{
        const {courseId} = req.params;
        let course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course is not found"})
        }
        return res.status(200).json({course})

    }catch(error){
        res.status(500).json({message:`Failed to get course by ID: ${error}`})
    }
}

export const removeCourse = async(req,res) => {
    try{
        const {courseId} = req.params;
        let course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course is not found"})
        }
        course = await Course.findByIdAndDelete(courseId,{new:true})
        return res.status(200).json({message:"Course deleted successfully"})

    }catch(error){
        res.status(500).json({message:`Failed to remove course: ${error}`})
    }
}
