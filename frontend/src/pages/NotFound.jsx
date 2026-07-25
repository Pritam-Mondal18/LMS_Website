import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-purple leading-none select-none opacity-20">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-brand-purple/20 flex items-center justify-center backdrop-blur-sm border border-brand-purple/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-brand-textMuted text-lg mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-pink to-brand-purple text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Go Home
          </Link>
          <Link
            to="/courses"
            className="px-8 py-3 rounded-xl bg-brand-surface border border-brand-purple/20 text-white font-semibold hover:bg-brand-violet/40 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    </div>
  );
}
