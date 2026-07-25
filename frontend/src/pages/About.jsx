import React from 'react';
import { Award, Users, BookOpen, HeartHandshake } from 'lucide-react';
import SEO from '../components/common/SEO';

export default function About() {
  const values = [
    { title: 'Rigorous Concepts First', desc: 'We do not believe in rote memorization. We start from basic definitions and build the logical steps to complex derivations.', icon: BookOpen, color: 'text-brand-pink bg-brand-pink/10' },
    { title: 'Personalized Attention', desc: 'Our batch sizes and online forums are tailored to make sure no student is left behind with unresolved doubts.', icon: HeartHandshake, color: 'text-brand-purple bg-brand-purple/10' },
    { title: 'Quality over Quantity', desc: 'Carefully curated problems and daily practice papers (DPP) that represent the actual exam layout instead of spamming 1000s of generic questions.', icon: Award, color: 'text-blue-400 bg-blue-500/10' },
    { title: 'Inclusivity in Learning', desc: 'Affordable tier models ensuring students from all backgrounds can access top faculty materials.', icon: Users, color: 'text-yellow-400 bg-yellow-500/10' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-16">
      <SEO 
        title="About Us" 
        description="Learn more about the vision, mission, HOD team, and visual teaching pedagogy of Sumit Chakraborty Academy."
        keywords="about Sumit Chakraborty Academy, core values, visual math proof, study methods"
      />
      {/* 1. Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-pink bg-brand-pink/10 px-3 py-1 rounded-full">Our Story</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">About Sumit Chakraborty Academy</h1>
        <p className="text-brand-textMuted text-base">
          A premium EdTech platform built to elevate conceptual clarity, analytical skills, and competitive success in mathematics, physics, and science boards.
        </p>
      </div>

      {/* 2. Brand Vision & Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
        <div className="glass-card p-8 rounded-3xl border border-brand-purple/15 space-y-4">
          <h2 className="text-2xl font-bold text-white border-l-4 border-brand-pink pl-3">Our Vision</h2>
          <p className="text-brand-textMuted text-sm leading-relaxed">
            To democratize high-yield, conceptual instruction across India. We aim to transform how kids learn science, shifting their focus from passing tests to building structural knowledge that unlocks premium tech, medical, and scientific careers.
          </p>
        </div>
        <div className="glass-card p-8 rounded-3xl border border-brand-purple/15 space-y-4">
          <h2 className="text-2xl font-bold text-white border-l-4 border-brand-purple pl-3">Our Mission</h2>
          <p className="text-brand-textMuted text-sm leading-relaxed">
            To provide comprehensive curriculum coverage, continuous test-series assessments, and direct teacher-mentored query resolution. Through interactive recorded visual modules and doubt clearing streams, we bridge the gap between students and premium IIT/NEET coaching centers.
          </p>
        </div>
      </div>

      {/* 3. Detailed Faculty Biographies */}
      <div className="space-y-10">
        <h2 className="text-2xl sm:text-3xl font-black text-white text-center">Meet the Pioneers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          {/* Faculty Profile 1 */}
          <div className="glass-card p-8 rounded-3xl border border-brand-purple/20 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-24 h-24 rounded-full p-[2px] bg-transparent border border-amber-500/30 overflow-hidden shrink-0 shadow-md">
                <img
                  src="/avatars/sumit.png"
                  alt="Sumit Chakraborty"
                  className="w-full h-full object-cover object-top rounded-full"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-brand-pink tracking-widest bg-brand-pink/15 px-2.5 py-0.5 rounded-full">Academy Founder</span>
                <h3 className="text-xl font-bold text-white mt-1">Sumit Chakraborty</h3>
                <p className="text-xs text-brand-textMuted">M.Sc. Mathematics | 15+ Years Experience</p>
              </div>
            </div>
            <p className="text-sm text-brand-textMuted leading-relaxed">
              Sumit Chakraborty is a veteran mathematics instructor. He has taught over 20,000 students offline and online, mentoring multiple board state toppers. He specializes in Calculus, Coordinate Geometry, and Algebra tricks that convert difficult equations into quick solutions.
            </p>
          </div>

          {/* Faculty Profile 2 */}
          <div className="glass-card p-8 rounded-3xl border border-brand-purple/20 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-24 h-24 rounded-full p-[2px] bg-transparent border border-amber-500/30 overflow-hidden shrink-0 shadow-md">
                <img
                  src="/avatars/subir.png"
                  alt="Subir Sen"
                  className="w-full h-full object-cover object-top rounded-full"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-brand-purple tracking-widest bg-brand-purple/15 px-2.5 py-0.5 rounded-full">HOD Physics</span>
                <h3 className="text-xl font-bold text-white mt-1">Subir Sen</h3>
                <p className="text-xs text-brand-textMuted">M.Sc. Physics (IIT Kharagpur) | 12+ Years</p>
              </div>
            </div>
            <p className="text-sm text-brand-textMuted leading-relaxed">
              Subir Sen is a premium physics faculty member. He spent several years teaching at major coaching hubs including Allen Career Institute and Physics Wallah before co-founding this academy. He is known for using real-life experiments and visual mechanics to clear student concepts.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Core Values */}
      <div className="space-y-10">
        <h2 className="text-2xl sm:text-3xl font-black text-white text-center">Our Pillars</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="glass-card p-6 rounded-2xl border border-brand-purple/10 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${v.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">{v.title}</h3>
                </div>
                <p className="text-xs text-brand-textMuted leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
