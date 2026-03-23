import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoEyeOutline, IoEye } from "react-icons/io5";
import logo from "../assets/logo.jpg";
import google from "../assets/google.jpg";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "react-toastify";
import {ClipLoader} from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function SignUp() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const handleSignup = async()=>{
    // API call to backend to create user
    setLoading(true);
    try{
      const result = await axios.post(serverUrl + "/api/auth/signup", {
        name,
        email,
        password,
        role},
        {withCredentials: true})
        dispatch(setUserData(result.data)) //storing user data in redux store
        setLoading(false);
        navigate("/");
        toast.success("Signup successful! Please login to continue.");
    } catch(error){
      console.error("Error signing up:", error);
      setLoading(false);
      toast.error(error.response.data.message || "Signup failed. Please try again."); 
    }

  }
  return (
    <div className="bg-[#dddbdb] min-h-screen flex items-center justify-center py-10">
      {/* CARD */}
      <form
        className="
          w-[92%]
          max-w-[900px]
          bg-white
          shadow-2xl
          rounded-2xl
          flex
          overflow-hidden
        "
        onSubmit={(e)=>e.preventDefault}
      >
        {/* LEFT */}
        <div className="md:w-1/2 w-full flex flex-col items-center justify-center gap-4 px-6 py-10">
          <div className="text-center">
            <h1 className="font-semibold text-black text-2xl">
              Let's get started
            </h1>
            <p className="text-[#8a8a8a] text-[16px]">Create your account</p>
          </div>

          <div className="flex flex-col gap-1 w-[85%]">
            <label htmlFor="name" className="font-semibold">Name</label>
            <input
              type="text"
              placeholder="Your Name"
              onChange={(e)=>setName(e.target.value)}
              value={name}
              className="border border-[#e6e6e6] h-[42px] px-4 rounded-md outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col gap-1 w-[85%]">
            <label className="font-medium">Email</label>
            <input
              type="email"
              placeholder="Your Email"
              onChange={(e)=>setEmail(e.target.value)}
              value={email}
              className="border border-[#e6e6e6] h-[42px] px-4 rounded-md outline-none focus:border-black"
            />
          </div>

          <div className="flex flex-col gap-1 w-[85%] relative">
            <label className="font-medium">Password</label>
            <input
              type={show ? "text" : "password"}
              placeholder="Your Password"
              onChange={(e)=>setPassword(e.target.value)}
              value={password}
              className="border border-[#e6e6e6] h-[42px] px-4 rounded-md outline-none focus:border-black"
            />

            {!show ? (
              <IoEyeOutline
                className="absolute right-4 bottom-3 text-xl cursor-pointer"
                onClick={() => setShow(!show)}
              />
            ) : (
              <IoEye
                className="absolute right-4 bottom-3 text-xl cursor-pointer"
                onClick={() => setShow(!show)}
              />
            )}
          </div>

          <div className="flex w-[85%] justify-between">
            <span className={`px-5 py-1.5 border-2 border-[#e6e6e6] rounded-full cursor-pointer hover:border-black ${role === "student" ? "border-black" : "border-[#646464]"}`} onClick={()=>setRole("student")}>
              Student
            </span>
            <span className={`px-5 py-1.5 border-2 border-[#e6e6e6] rounded-full cursor-pointer hover:border-black ${role === "educator" ? "border-black" : "border-[#646464"}`} onClick={()=>setRole("educator")}>
              Educator
            </span>
          </div>

          <button className="w-[85%] h-[44px] bg-black text-white rounded-md" disabled={loading} onClick={handleSignup}>
            {loading ? <ClipLoader size={30} color='white'/>: "SignUp"}
          </button>

          <div className="w-[85%] flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-[#d0d0d0]" />
            <span className="text-[14px] text-[#777]">or continue</span>
            <div className="flex-1 h-[1px] bg-[#d0d0d0]" />
          </div>

          <div className="w-[85%] h-[44px] border-2 border-black rounded-md flex items-center justify-center gap-3">
            <img src={google} alt="google" className="w-5" />
            <span>Google</span>
          </div>

          <div className="text-[#6f6f6f] text-sm">
            Already have an account?{" "}
            <span
              className="underline cursor-pointer text-black"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="md:w-1/2 hidden md:flex bg-black items-center justify-center flex-col gap-6 py-10">
          <img src={logo} alt="logo" className="w-32" />
          <span className="text-white text-2xl font-semibold">
            VIRTUAL COURSES
          </span>
        </div>
      </form>
    </div>
  );
}

export default SignUp;
