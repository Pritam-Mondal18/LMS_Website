import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import getCurrentUser from "./customHooks/getCurrentUser";
import ForgetPassword from "./pages/ForgetPassword";
export const serverUrl = "http://localhost:8000"; //8000 for backend

function App() {
  getCurrentUser() //custom hook to get current user data and store in redux store
  const {userData} = useSelector((state) => state.user)
  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={!userData ? <SignUp />: <Navigate to ={"/"}/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={userData ? <Profile /> : <Navigate to="/SignUp" />} />
        <Route path="/forget" element={userData ? <ForgetPassword /> : <Navigate to="/Login" />} />
      </Routes>
    </>
  );
}

export default App;

// 2:39:00
// https://www.youtube.com/watch?v=p2w96Fq4d1U
