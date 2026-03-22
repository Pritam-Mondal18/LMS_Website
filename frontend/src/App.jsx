import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import { ToastContainer } from "react-toastify";
export const serverUrl = "http://localhost:8000"; //8000 for backend

function App() {
  return (
    <>
    <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;

// 2:39:00
// https://www.youtube.com/watch?v=p2w96Fq4d1U
