import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col relative overflow-x-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-brand-purple/10 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-[30vh] left-[-100px] w-[400px] h-[400px] bg-brand-pink/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      {/* Navbar Header */}
      <Navbar />
      
      {/* Main Page Area */}
      <main className="flex-grow pt-24">
        <Outlet />
      </main>
      
      {/* Footer Area */}
      <Footer />
    </div>
  );
}
