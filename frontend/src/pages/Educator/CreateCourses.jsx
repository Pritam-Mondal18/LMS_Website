import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { serverUrl } from "../../App";

function CreateCourse() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateCourse = async() => {
        setLoading(true)
        try{
            const result = await axios.post(serverUrl+"/api/course/create", {title, category}, {withCredentials:true})
            console.log(result.data)
            setLoading(false)
            toast.success("Course created successfully")
            navigate("/courses")
        }catch(error){
            setLoading(false)
            console.log("Error while creating course", error)
            toast.error(error.response?.data?.message || "Failed to create course")
        }
    }
    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
            <div className="max-w-xl w-[600px] mx-auto p-6 bg-white shadow-md mt-10 relative">
                <FaArrowLeft className="top-[8%] absolute left-[5%] w-[22px] h-[22px] cursor-pointer" onClick={() => navigate("/courses")}/>
                <h2 className="text-2xl font-semibold mb-6 text-center">Create Course</h2>
                <form className="space-y-5" onSubmit={(e)=>e.preventDefault()}>
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                        <input type="text" id="title" placeholder="Enter Course title" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[black]" onChange={(e)=>setTitle(e.target.value)} value={title}/>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Course Category</label>
                        <select id="category" className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[black]" onChange={(e)=>setCategory(e.target.value)}>
                            <option value="">Select Category</option>
                            <option value="Math">Math</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Biology">Biology</option>
                            <option value="Commerce">Commerce</option>
                            <option value="Arts">Arts</option>
                            <option value="Others">Others</option>
                        </select>
                        </div>
                        <button className="w-full bg-[black] text-white py-2 px-4 rounded-md active:bg-[#3a3a3a]  transition cursor-pointer" disabled={loading} onClick={handleCreateCourse}>
                            {loading ? <ClipLoader size={30} color="white"/> : "Create Course"}
                        </button>
                </form>
            </div>
            </div>
    )
}

export default CreateCourse;