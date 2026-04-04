import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
// import { useEffect } from "react";
// import { useEffect } from "react";
// import getCurrentUser from "./customHooks/getCurrentUser";
import ForgetPassword from "./pages/ForgetPassword";
import EditProfile from "./pages/EditProfile";
import Dashboard from "./pages/Educator/Dashboard";
import Courses from "./pages/Educator/Courses";
import CreateCourse from "./pages/Educator/CreateCourses";
import useGetCurrentUser from "./customHooks/getCurrentUser";
import useGetCreatorCourse from "./customHooks/getCreatorCourse";
import EditCourse from "./pages/Educator/EditCourse";
export const serverUrl = "http://localhost:8000"; //8000 for backend

function App() {

  useGetCurrentUser() //custom hook to get current user data and store in redux store
  useGetCreatorCourse() // custom hook to get creator course data and store in redux store
  const {userData,loading } = useSelector((state) => state.user)
  if (loading) return <p>Loading...</p>; // Show loading state while fetching user data
  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={!userData ? <SignUp />: <Navigate to ={"/"}/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={userData ? <Profile /> : <Navigate to="/SignUp" />} />
        <Route path="/forget" element={userData ? <ForgetPassword /> : <Navigate to="/Login" />} />
        <Route path="/editprofile" element={userData ? <EditProfile /> : <Navigate to="/Login" />} />
        <Route path="/dashboard" element={userData ?.role === "educator" ? <Dashboard /> : <Navigate to="/Login" />} />
        <Route path="/courses" element={userData ?.role === "educator" ? <Courses /> : <Navigate to="/Login" />} />
        <Route path="/createcourse" element={userData ?.role === "educator" ? <CreateCourse /> : <Navigate to="/Login" />} />
        <Route path="/editcourse/:courseId" element={userData ?.role === "educator" ? <EditCourse /> : <Navigate to="/Login" />} />
      </Routes>
    </>
  );
}

export default App;

// 2:39:00
// https://www.youtube.com/watch?v=p2w96Fq4d1U
