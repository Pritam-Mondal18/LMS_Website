import React from "react";
import { SiViaplay } from "react-icons/si";
import ai from "../assets/ai.png"
import ai1 from "../assets/SearchAi.png"
import Nav from "../component/Nav";
import home from "../assets/home.png"
import Logos from "../component/Logos";
import ExploreCourses from "../component/ExploreCourses";

function Home() {
  return (
  <div className="w-[100%] overflow-hidden">
    <div className="w-[100%] lg:h-[140vh] h-[70vh] relative">
      <Nav/>
      <img src={home} alt="Home" className="object-cover md:object-fill w-[100%] lg:h-[100%] h-[50vh]" />

      {/* <span className="lg:text-[70px] absolute md:text-[40px] lg:top-[8%] top-[15%] w-full flex items-center justify-center text-white font-bold text-[20px]">Grow Your Skills to Advance</span>
      <span className="lg:text-[70px]  md:text-[20px] lg:top-[18%] absolute top-[20%] w-[100%] flex items-center justify-center text-white font-bold">Your Career Path</span> */}
      <span className="lg:text-[70px] absolute md:text-[40px] lg:top-[10%] top-[15%] w-[100%] flex items-center justify-center text-[#DAA520] font-bold text-[20px]">Grow Your Skills to Advance</span>
      <span className="lg:text-[70px] absolute md:text-[20px] lg:top-[18%] top-[20%] w-[100%] flex items-center justify-center text-[#E6BE8A] font-bold">Your Career Path</span>
      {/* <div className="absolute lg:top-[31%] top-[65%] w-full flex items-center justify-center gap-3 flex-wrap">
        <button className="px-[20px] py-[10px] border-2 lg:border-white border-black lg:text-white text-black [10px] text-[18px] font-light flex gap-2 cursor-pointer">View all Courses</button>
        <button className="px-[20px] py-[10px] lg:bg-white bg-black lg:text-black text-white rounded-[10px] text-[18px] font-light flex gap-2 cursor-pointer items-center justify-center">Search with AI</button>
      </div> */}
      <div className="absolute lg:top-[30%] top-[75%] md:top-[80%] w-[100%] flex items-center justify-center gap-3 flex-wrap">
        <button className="px-[20px] py-[10px] border-2 lg:border-white border-black lg:text-white text-black [10px] text-[18px] font-light flex gap-2 cursor-pointer">View all Courses <SiViaplay className="w-[30px] h-[30px] lg:fill-white fill-black" /></button>
        <button className="px-[20px] py-[10px] lg:bg-white bg-black lg:text-black text-white rounded-[10px] text-[18px] font-light flex gap-2 cursor-pointer items-center justify-center">Search with AI <img src={ai} className="w-[30px] h-[30px] rounded-full hidden lg:block" alt=""/><img src={ai1} className="w-[35px] h-[35px] rounded-full lg:hidden" alt=""/></button>
      </div>
    </div>
    <Logos/>
    <ExploreCourses/>
  </div>
  )
}

export default Home;
