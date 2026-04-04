import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { setCreatorCourseData } from "../redux/courseSlice";
import axios from "axios";
import { serverUrl } from "../App";

const useGetCreatorCourse = () => {
    const dispatch = useDispatch();
    const {userData} = useSelector((state)=>state.user);
    return (
        useEffect(()=>{
            const creatorCourses = async()=>{
                try{
                    const result = await axios.get(serverUrl + "/api/course/getcreator",{withCredentials:true})
                    console.log(result.data)
                    dispatch(setCreatorCourseData(result.data.courses));
                }catch(error){
                    console.log(error)
                    
                }
            }
            if (userData) {
                creatorCourses(); // ✅ only call when user exists
            }
        },[userData])
    )

}

export default useGetCreatorCourse;