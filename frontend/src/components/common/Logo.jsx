import React from 'react';

export default function Logo({ size = 'md', className = '' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconSize = isSm ? 'w-8 h-8' : isLg ? 'w-14 h-14' : 'w-11 h-11';
  const titleSize = isSm ? 'text-lg' : isLg ? 'text-3xl' : 'text-2xl';
  const academySize = isSm ? 'text-[8px] tracking-[0.2em]' : isLg ? 'text-[11px] tracking-[0.25em]' : 'text-[9px] tracking-[0.22em]';
  const gap = isSm ? 'gap-2' : isLg ? 'gap-3.5' : 'gap-3';

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {/* S Icon Logo */}
      <div className="relative group shrink-0">
        <svg viewBox="0 0 100 100" className={`${iconSize} select-none relative z-10 transition-transform duration-300 group-hover:rotate-12`}>
          {/* Pink shape */}
          <path
            d="M 30 15 H 70 L 45 65 H 30 A 25 25 0 0 1 30 15 Z"
            fill="#FF2E93"
          />
          {/* Blue shape */}
          <path
            d="M 70 85 H 30 L 55 35 H 70 A 25 25 0 0 1 70 85 Z"
            fill="#3B3DB6"
          />
          {/* Overlap shape */}
          <path

            d="M 55 35 H 60 L 45 65 H 40 Z"
            fill="#1E1163"
          />
        </svg>
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brand-pink to-brand-purple blur-md opacity-25 group-hover:opacity-60 transition duration-300"></div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center select-none text-left">
        <span className={`font-signature text-white leading-tight ${titleSize} tracking-wide font-medium`}>
          Sumit Chakraborty
        </span>

        {/* Centered Academy with horizontal lines */}
        <div className="flex items-center gap-1.5 w-full -mt-0.5">
          <div className="h-[1px] bg-white/20 flex-grow"></div>
          <span className={`uppercase font-bold text-brand-pink shrink-0 ${academySize}`}>
            Academy
          </span>
          <div className="h-[1px] bg-white/20 flex-grow"></div>
        </div>
      </div>
    </div>
  );
}
