import React from 'react';

const LogoPlaceholder = () => (
  <div className="flex flex-col items-center justify-center gap-6 select-none animate-in fade-in zoom-in-95 duration-500">
    {/* S Icon Logo */}
    <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-2 border-brand-purple/20 flex items-center justify-center bg-[#090040]/40 backdrop-blur-xl relative group shadow-2xl">
      <svg viewBox="0 0 100 100" className="w-14 h-14 md:w-20 md:h-20 select-none relative z-10 transition-transform duration-300 group-hover:scale-105">
        <path d="M 30 15 H 70 L 45 65 H 30 A 25 25 0 0 1 30 15 Z" fill="#FF2E93" />
        <path d="M 70 85 H 30 L 55 35 H 70 A 25 25 0 0 1 70 85 Z" fill="#3B3DB6" />
        <path d="M 55 35 H 60 L 45 65 H 40 Z" fill="#1E1163" />
      </svg>
      <div className="absolute inset-[-6px] rounded-full border border-dashed border-brand-pink/30 animate-[spin_40s_linear_infinite]"></div>
      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brand-pink to-brand-purple blur-lg opacity-20 group-hover:opacity-40 transition duration-300"></div>
    </div>

    {/* Brand Text */}
    <div className="flex flex-col items-center text-center">
      <span className="font-signature text-white text-xl md:text-2xl leading-none font-semibold tracking-wide">
        Sumit Chakraborty
      </span>
      <div className="flex items-center gap-2 w-32 mt-1">
        <div className="h-[1px] bg-white/20 flex-grow"></div>
        <span className="uppercase font-bold text-brand-pink text-[8px] tracking-[0.2em]">
          Academy
        </span>
        <div className="h-[1px] bg-white/20 flex-grow"></div>
      </div>
    </div>
  </div>
);

export default LogoPlaceholder;
