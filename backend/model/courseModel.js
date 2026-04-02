import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    subtitle:{
        type:String
    },
    description:{
        type:String
    },
    category:{
        type:String,
        required:true
    },
    level:{
        type:String,
        enum:["Beginner","Intermediate","Advanced"],
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    thumbnail:{
        type:String
    },
    enrolledStudents:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    lectures:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Lecture"
    }],
    creater:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    
    isPublished:{
        type:Boolean,
        default:false
    },
    reviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Review"
    }]

},{timestamps:true})

const Course = mongoose.model("Course",courseSchema);

export default Course;