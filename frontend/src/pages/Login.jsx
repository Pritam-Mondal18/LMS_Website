import React from "react";
import logo from "../assets/logo.jpg";
import google from "../assets/google.jpg";
import { IoEyeOutline } from "react-icons/io5";
import { IoEye } from "react-icons/io5";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="bg-[#dddbdb] w-screen h-screen flex items-center justify-center">
      <form className="w-[90%] md:w-[800px] h-[500px] bg-white shadow-xl rounded-2xl flex">
        {/* LEFT */}
        <div className="p-1.5 md:w-1/2 w-full h-full flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <h1 className="font-semibold text-black text-2xl">Welcome Back</h1>
            <h2 className="text-[#999797] text-[18px]">Login your account</h2>
          </div>

          <div className="flex flex-col gap-1 w-[80%]">
            <label htmlFor="email" className="font-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Your Email"
              className="border border-[#e7e6e6] h-[40px] px-4 rounded-md outline-none focus:border-black"
            />
          </div>
          <div className="flex flex-col gap-1 w-[80%] relative">
            <label htmlFor="password" className="font-semibold">
              Password
            </label>
            <input
              id="password"
              type={show ? "text" : "password"}
              placeholder="Your Password"
              className="border border-[#e7e6e6] h-[40px] px-4 rounded-md outline-none focus:border-black"
            />
            {!show ? (
              <IoEyeOutline
                className="absolute w-[20px] h-[20px] cursor-pointer right-[5%] bottom-[10%]"
                onClick={() => setShow((prev) => !prev)}
              />
            ) : (
              <IoEye
                className="absolute w-[20px] h-[20px] cursor-pointer right-[5%] bottom-[10%]"
                onClick={() => setShow((prev) => !prev)}
              />
            )}
          </div>
          <button className="w-[80%] h-[40px] bg-black text-white cursor-pointer flex items-center justify-center rounded-[5px]">
            Login
          </button>
          <div className="w-[80%] flex items-center gap-5">
            <div className="w-[25%] h-[0.5px] bg-[#c4c4c4]"></div>
            <div className="w-[50%] text-[15px] text-[#6f6f6f] flex items-center justify-center">
              or countinue
            </div>
            <div className="w-[25%] h-[0.5px] bg-[#c4c4c4]"></div>
          </div>
          <div className="w-[80%] h-[40px] border-2 border-[black] rounded-[5px] flex items-center justify-center">
            <img src={google} alt="google" className="w-[25px]" />
            <span className="text-[18px] text-grey-500">Google</span>
          </div>
          <div className="text-[#6f6f6f]">
            Don't have an account?
            <span
              className="underline underline-offset-1 text-[black] cursor-pointer hover:text-[blue]"
              onClick={() => navigate("/signup")}
            >
              SignUp
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="w-1/2 h-full rounded-r-2xl bg-black md:flex hidden items-center justify-center flex-col gap-3">
          <img src={logo} alt="logo" className="w-28 shadow-2xl" />
          <span className="text-white text-2xl font-semibold">
            VIRTUAL COURSES
          </span>
        </div>
      </form>
    </div>
  );
}

export default Login;
