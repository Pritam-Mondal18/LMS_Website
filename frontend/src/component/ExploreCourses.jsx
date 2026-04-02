import React from 'react';
import { SiViaplay } from "react-icons/si";
import { TbDeviceDesktopAnalytics } from "react-icons/tb";
import math from "../assets/math.svg"
import chem from "../assets/chem.svg"
import phy from "../assets/phy.svg"
import bio from "../assets/bio.svg"
import com from "../assets/com.svg"
import arts from "../assets/arts.svg"

function ExploreCourses() {
    return (
        <div className='w-full min-h-[60vh] flex flex-col lg:flex-row items-center justify-center gap-10 px-[30px] py-[40px]'>
            {/* left/top div */}
            <div className='w-full lg:w-[350px] flex flex-col items-start justify-center gap-3 px-[20px]'>
                <span className='text-[32px] font-semibold leading-tight'>Explore Courses</span>
                <span className='text-[32px] font-semibold leading-tight'>Our Courses</span>
                <p className='text-[16px] text-gray-600'>Discover a wide range of courses to enhance your skills and advance your career.</p>
                <button className="px-[20px] py-[10px] bg-black text-white rounded-[10px] text-[16px] flex items-center gap-2 mt-[20px] hover:bg-gray-800 transition cursor-pointer">Explore Courses <SiViaplay className="w-[30px] h-[30px] fill-white cursor-pointer" /></button>
                </div>
            {/* right/bottom div */}
            <div className='w-full lg:w-[500px] flex items-center justify-center gap-[25px] flex-wrap'>
                <div className='w-[110px] h-[140px] text-[13px] flex flex-col gap-3 text-center items-center hover:scale-105 transition duration-300 cursor-pointer'>
                    <div className='w-full h-[90px] bg-[#fbd9fb] rounded-lg flex items-center justify-center'><img src={math} className='w-[50px] h-[50px] text-[#6d6c6c]'/></div>
                    Math
                </div>
                <div className='w-[110px] h-[140px] text-[13px] flex flex-col gap-3 text-center items-center hover:scale-105 transition duration-300 cursor-pointer'>
                    <div className='w-full h-[90px] bg-[#d9fbe0] rounded-lg flex items-center justify-center'><img src={chem} className='w-[50px] h-[50px] text-[#6d6c6c]'/></div>
                    Chemistry
                </div>
                <div className='w-[110px] h-[140px] text-[13px] flex flex-col gap-3 text-center items-center hover:scale-105 transition duration-300 cursor-pointer'>
                    <div className='w-full h-[90px] bg-[#fafca5] rounded-lg flex items-center justify-center'><img src={phy} className='w-[50px] h-[50px] text-[#6d6c6c]'/></div>
                    Physics
                </div>
                <div className='w-[110px] h-[140px] text-[13px] flex flex-col gap-3 text-center items-center hover:scale-105 transition duration-300 cursor-pointer'>
                    <div className='w-full h-[90px] bg-[#d9fba0] rounded-lg flex items-center justify-center'><img src={bio} className='w-[50px] h-[50px] text-[#6d6c6c]'/></div>
                    Biology
                </div>
                <div className='w-[110px] h-[140px] text-[13px] flex flex-col gap-3 text-center items-center hover:scale-105 transition duration-300 cursor-pointer'>
                    <div className='w-full h-[90px] bg-[#fbadaa] rounded-lg flex items-center justify-center'><img src={com} className='w-[50px] h-[50px] text-[#6d6c6c]'/></div>
                    Commerce
                </div>
                <div className='w-[110px] h-[140px] text-[13px] flex flex-col gap-3 text-center items-center hover:scale-105 transition duration-300 cursor-pointer'>
                    <div className='w-full h-[90px] bg-[#fbd9a0] rounded-lg flex items-center justify-center'><img src={arts} className='w-[50px] h-[50px] text-[#6d6c6c]'/></div>
                    Arts
                </div>
            </div>
        </div>
    )
}

export default ExploreCourses;