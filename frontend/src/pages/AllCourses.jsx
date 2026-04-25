import React, { useEffect, useState } from "react";
import Nav from "../component/Nav";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import ai from "../assets/SearchAi.png"
import { useSelector } from "react-redux";
import Card from "../component/Card";

function AllCourses(){
    const navigate = useNavigate()
    const {courseData} = useSelector(state=>state.course)
    const [category,setCategory] = useState([])
    const [filterCourses,setFilterCourses] = useState([])
    const [showSidebar, setShowSidebar] = useState(false)

    const toggleCategory = (e)=>{
        if(category.includes(e.target.value)){
            setCategory(prev => prev.filter(c => c !== e.target.value))
        }else{
            setCategory(prev => [...prev,e.target.value])
        }
    }

    const applyFilter = () =>{
        // let courseCopy = courseData?.slice()
        let courseCopy = Array.isArray(courseData) ? [...courseData] : []
        if(category.length>0){
            courseCopy = courseCopy.filter(c => category.includes(c.category))
        }
        setFilterCourses(courseCopy)
        // setFilterCourses(Array.isArray(courseData) ? courseData : [])
    }
    // useEffect(()=>{
    //     setFilterCourses(courseData)
    // },[courseData])
    useEffect(()=>{
        applyFilter()
    },[category,courseData])
    return (
        <div className="flex min-h-screen bg-gray-50 ">
            <Nav/>

            {/* sidebar */}
            {/* <button onClick={() => setShowSidebar(true)}className="md:hidden fixed top-20 left-4 z-[60] bg-black text-white px-4 py-2 rounded shadow-lg">Filters</button> */}
            {/* <button className={`fixed top-20 left-4 ${showSidebar ? "z-[210]" : "z-[50]"} bg-white text-black px-3 py-1 rounded md:hidden border-2 border-black`} onClick={() => setShowSidebar(prev =>!prev)}>{showSidebar ? "Hide" : "Show"}Filters</button> */}
            <button className={`fixed top-20 left-4 z-[50] bg-white text-black px-3 py-1 rounded md:hidden border-2 border-black`} onClick={() => setShowSidebar(true)}>Show Filters</button>
            {/* {!showHam && (<button className={`fixed top-20 left-4 ${showSidebar ? "z-[210]" : "z-[50]"} bg-white text-black px-3 py-1 rounded md:hidden border-2 border-black`}onClick={() => setShowSidebar(prev => !prev)}>{showSidebar ? "Hide" : "Show"} Filters</button>)} */}
            {showSidebar && (<div onClick={() => setShowSidebar(false)} className="fixed inset-0 bg-black/40 z-[190] md:hidden "/>)}
            <aside className={`w-[280px] sm:w-[300px]  overflow-y-auto bg-black fixed top-0 left-0 p-6 py-[130px] border-r border-gray-200 shadow-md transition-transform duration-300 ease-in-out z-[200]  ${showSidebar ? "translate-x-0" : "-translate-x-full"} md:block md:translate-x-0`}>
                {/* {showSidebar && (<div onClick={() => setShowSidebar(false)} className="fixed inset-0 bg-black/40 z-40 md:hidden pointer-events-auto"/>)} */}
                {/* <button onClick={() => setShowSidebar(false)}className="md:hidden text-white mb-4">Close ✖</button> */}
                <div className="md:hidden absolute top-20 left-4"><button className="bg-white text-black px-3 py-1 rounded border-2 border-black" onClick={() => setShowSidebar(false)}>Hide Filters</button></div>
                <h2 className="text-xl font-bold flex items-center justify-center gap-2 text-gray-50 mb-6">
                    <FaArrowLeftLong className="cursor-pointer" onClick={()=>navigate("/")}/>Filter by Category</h2>

                    <form action="" onSubmit={(e)=>e.preventDefault()} className="space-y-4 text-sm bg-gray-600 border-white text-white border p-[20px] rounded-2xl">
                        <button className="px-[10px] py-[10px] bg-black text-white rounded-[10px] text-[15px] font-light flex items-center justify-center gap-2 cursor-pointer">
                            Search with Ai 
                            <img src={ai} alt="" className="w-[30px] h-30px rounded-full"/>
                            </button>

                            <label htmlFor="" className="flex items-center gap-3  hover:text-gray-200 transition">
                                <input type="checkbox" checked={category.includes("Math")} className="accent-black w-4 h-4 rounded-md cursor-pointer" value={'Math'} onChange={toggleCategory}/> Math
                            </label>
                            <label htmlFor="" className="flex items-center gap-3 hover:text-gray-200 transition">
                                <input type="checkbox" checked={category.includes("Physics")} className="accent-black w-4 h-4 rounded-md cursor-pointer" value={'Physics'} onChange={toggleCategory}/> Physics
                            </label>
                            <label htmlFor="" className="flex items-center gap-3  hover:text-gray-200 transition">
                                <input type="checkbox" checked={category.includes("Chemistry")} className="accent-black w-4 h-4 rounded-md cursor-pointer" value={'Chemistry'} onChange={toggleCategory}/> Chemistry
                            </label>
                            <label htmlFor="" className="flex items-center gap-3 hover:text-gray-200 transition">
                                <input type="checkbox" checked={category.includes("Biology")} className="accent-black w-4 h-4 rounded-md cursor-pointer" value={'Biology'} onChange={toggleCategory}/> Biology
                            </label>
                            <label htmlFor="" className="flex items-center gap-3 hover:text-gray-200 transition">
                                <input type="checkbox" checked={category.includes("Commerce")} className="accent-black w-4 h-4 rounded-md cursor-pointer" value={'Commerce'} onChange={toggleCategory}/> Commerce
                            </label>
                            <label htmlFor="" className="flex items-center gap-3 hover:text-gray-200 transition">
                                <input type="checkbox" checked={category.includes("Arts")} className="accent-black w-4 h-4 rounded-md cursor-pointer" value={'Arts'} onChange={toggleCategory}/> Arts
                            </label>
                            <label htmlFor="" className="flex items-center gap-3 hover:text-gray-200 transition">
                                <input type="checkbox" checked={category.includes("Others")} className="accent-black w-4 h-4 rounded-md cursor-pointer" value={'Others'} onChange={toggleCategory}/> Others
                            </label>

                    </form>
                
            </aside>
            <main className="w-full py-[120px] md:pl-[300px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
                {filterCourses.length > 0 ? (filterCourses.map((course,index)=>(
                    <Card key={index} thumbnail={course.thumbnail} title={course.title} category={course.category} price={course.price} id={course._id}/>))) 
                    : 
                    (<p className="w-full text-center text-gray-500 text-lg font-medium mt-10">No courses found</p>)}
            </main>
        </div>
    )
}

export default AllCourses