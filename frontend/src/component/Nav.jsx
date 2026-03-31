import React from "react";
import { IoPersonCircle } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg"
import Profile from "../pages/Profile";
import axios from "axios";
import { serverUrl } from "../App"
import { setUserData } from "../redux/userSlice";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { GiHamburgerMenu } from "react-icons/gi";
import { ImCross } from "react-icons/im";

function Nav() {
    const {userData} = useSelector((state) => state.user)
    const [show,setShow] = React.useState(false)
    const [showHam,setShowHam] = React.useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleLogout = async () => {
        try{
            const result = await axios.get(serverUrl+"/api/auth/logout", {withCredentials:true})
            dispatch(setUserData(null))
            console.log(result.data)
            toast.success("Logout successful")
        }catch{
            console.log("error while logout")
            toast.error(error.response.data.message)   
        }
    }
    return (
        <div>
            <div className="w-[100%] h-[70px] fixed top-0 px-[20px] py-[10px] flex items-center justify-between bg-[#00000047] z-10">
                <div className="lg:w-[20%] w-[40%] lg:pl-[50px]">
                    <img src={logo} alt="logo" className="w-[60px] rounded-[5px] border-2 border-white " />
                </div>
                <div className="w-[30%] lg:flex items-center justify-center gap-4 hidden">

                    {!userData &&<IoPersonCircle className="w-[50px] h-[50px] text-white cursor-pointer" onClick={()=>setShow(prev=>!prev)}/>}
                    {userData && <div className="w-[50px] h-[50px] rounded-full text-white flex items-center justify-center text-[20px] border-2 bg-black border-white cursor-pointer" onClick={()=>setShow(prev=>!prev)}>
                        {userData?.name?.slice(0,1)?.toUpperCase()}
                        {/* {userData?.name ? userData.name[0].toUpperCase() : "?"} */}
                        {/* {userData?.name?.[0]?.toUpperCase() || "?"} */}
                    </div>}
                    {userData?.role==='educator' && <div className="px-[20px] py-[10px] border-2 border-white text-white bg-[black] rounded-[10px] text-[18px] font-light cursor-pointer">Dashboard</div>}
                    {!userData ?<span className="px-[20px] py-[10px] border-2 border-white text-white bg-[black] rounded-[10px] text-[18px] font-light cursor-pointer" onClick={()=>navigate("/login")}>login</span>:
                    <span className="px-[20px] py-[10px] bg-white text-black rounded-[10px] shadow-sm shadow-black text-[18px] cursor-pointer" onClick={handleLogout}>logout</span>}
                    {show && <div className="absolute top-[110%] right-[15%] flex items-center flex-col justify-center gap-2 text-[16px] rounded-black hover:border-white hover:text-white cursor-pointer hover:bg-black">
                        <span className="bg-black text-white px-[30px] py-[10px] rounded-2xl hover:bg-gray-600" onClick={()=>navigate("/profile")}>My Profile</span>
                        <span className="bg-black text-white px-[30px] py-[10px] rounded-2xl hover:bg-gray-600">My Courses</span>
                    </div>}
                </div>
                <GiHamburgerMenu className="w-[35px] h-[35px] lg:hidden text-white cursor-pointer" onClick={()=>setShowHam(prev=>!prev)}/>

                <div className={`fixed top-0 left-0 w-[100vw] h-[100vh] bg-[#000000d6] flex items-center justify-center flex-col gap-5 z-10 lg:hidden ${showHam ? "translate-x-[0] transition duration-600" : "translate-x-[-100%] transition duration-600"}`}>
                    <ImCross className="w-[35px] h-[35px] fill-white absolute top-5 right-[4%] cursor-pointer" onClick={()=>setShowHam(prev=>!prev)}/>
                        {!userData &&<IoPersonCircle className="w-[50px] h-[50px] text-white cursor-pointer" />}
                        {userData && <div className="w-[50px] h-[50px] rounded-full text-white flex items-center justify-center text-[20px] border-2 bg-black border-white cursor-pointer" >
                        {userData?.name?.slice(0,1)?.toUpperCase()}
                    </div>}
                    <div className="w-[200px] h-[65px] flex items-center justify-center border-2 border-white text-white bg-[black] rounded-[10px] text-[18px] font-light cursor-pointer" onClick={()=>navigate("/profile")}>My Profile</div>
                    <div className="w-[200px] h-[65px] flex items-center justify-center border-2 border-white text-white bg-[black] rounded-[10px] text-[18px] font-light cursor-pointer">My Courses</div>
                        {userData?.role==='educator' && <div className="w-[200px] h-[65px] flex items-center justify-center border-2 border-white text-white bg-[black] rounded-[10px] text-[18px] font-light cursor-pointer">Dashboard</div>}
                        {!userData ?<span className="w-[200px] h-[65px] flex items-center justify-center border-2 border-white text-white bg-[black] rounded-[10px] text-[18px] font-light cursor-pointer" onClick={()=>navigate("/login")}>login</span>:
                        <span className="w-[200px] h-[65px] flex items-center justify-center border-2 border-white text-white bg-[black] rounded-[10px] text-[18px] font-light cursor-pointer" onClick={handleLogout}>logout</span>}
                    </div>
            </div>
        </div>
    )
}

export default Nav