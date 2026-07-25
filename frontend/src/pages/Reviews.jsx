import { useEffect, useState, useMemo } from 'react';
import { Star, Quote, MessageSquareQuote } from 'lucide-react';
import api from '../services/api';
import SEO from '../components/common/SEO';

export default function Reviews() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await api.get('/auth/testimonials');
        if (response.data.success) {
          setTestimonials(response.data.testimonials || []);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const displayTestimonials = useMemo(() => {
    const combined = [...testimonials];
    const staticItems = [
      {
        _id: "static-1",
        name: "Aman Gupta",
        review: "The physics curriculum by Subir Sir was spectacular. The visual proofs of mechanics equations kept me hooked, and my mock test ranks improved from 5k to AIR 421 in JEE!",
        rating: 5,
        achievement: "JEE Main AIR 421",
        color: "bg-brand-pink"
      },
      {
        _id: "static-2",
        name: "Ritu Mishra",
        review: "Sumit Chakraborty Academy changed how I studied mathematics. The tricks for integration and trigonometry calculations saved me at least 15 minutes during exam time.",
        rating: 5,
        achievement: "NEET 685 Marks",
        color: "bg-brand-purple"
      },
      {
        _id: "static-3",
        name: "Sayan Karmakar",
        review: "The class 10 boards preparation notes and practice sheets were identical to the final exam paper. I scored 98% in science and math! Strongly recommend this platform.",
        rating: 5,
        achievement: "Class 10 Board 98.4%",
        color: "bg-blue-500"
      },
      {
        _id: "static-4",
        name: "Priyanjali Sen",
        review: "Sumit Sir's classes are the highlight of my preparation. Calculus was my biggest fear, but now solving limits and continuity feels like solving a puzzle!",
        rating: 5,
        achievement: "Class 12 Boards 99/100",
        color: "bg-emerald-500"
      },
      {
        _id: "static-5",
        name: "Aditya Roy",
        review: "The study materials and organic chemistry tricks provided are top-notch. I managed to score full marks in chemistry in mock papers and actual examinations.",
        rating: 5,
        achievement: "NEET Chem 180/180",
        color: "bg-amber-500"
      },
      {
        _id: "static-6",
        name: "Rohan Mukherjee",
        review: "IIT foundation course for class 9 built my physics and math logic so well. I could easily solve school questions and prepare for competitive exams simultaneously.",
        rating: 5,
        achievement: "Foundation Olympiad Winner",
        color: "bg-red-500"
      }
    ];

    for (const item of staticItems) {
      if (!combined.some(c => c.name.toLowerCase() === item.name.toLowerCase())) {
        combined.push(item);
      }
    }
    return combined;
  }, [testimonials]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-16">
      <SEO 
        title="Student Success & Reviews" 
        description="Read real topper feedback, ratings, and student reviews for courses offered by Sumit Chakraborty Academy."
        keywords="student testimonials, topper reviews, course ratings, student feedback, Sumit Chakraborty"
      />
      {/* 1. Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-pink bg-brand-pink/10 px-3 py-1 rounded-full">Topper Reviews</span>
        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">Student Success & Reviews</h1>
        <p className="text-brand-textMuted text-base">
          Read genuine feedback and experiences from students who elevated their academic levels and cracked competitive exams with our mentorship.
        </p>
      </div>

      {/* 2. Grid List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="glass-card p-8 rounded-3xl border border-brand-purple/10 text-left flex flex-col justify-between h-full animate-pulse">
              <div className="space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-brand-violet/20 rounded"></div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 bg-brand-violet/20 rounded w-full"></div>
                  <div className="h-3.5 bg-brand-violet/20 rounded w-5/6"></div>
                  <div className="h-3.5 bg-brand-violet/20 rounded w-4/5"></div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-white/5 mt-6">
                <div className="w-10 h-10 rounded-full bg-brand-violet/20 shrink-0"></div>
                <div className="space-y-2 w-1/2">
                  <div className="h-3.5 bg-brand-violet/20 rounded w-3/4"></div>
                  <div className="h-3 bg-brand-violet/20 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayTestimonials.map((item, idx) => (
            <div key={item._id || idx} className="glass-card p-8 rounded-3xl border border-brand-purple/15 text-left flex flex-col justify-between h-full relative group hover:border-brand-purple/35 transition-all duration-300">
              <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-8 h-8 text-brand-pink" />
              </div>
              <div className="space-y-4 relative z-10">
                <div className="flex gap-1">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-brand-textMuted text-sm leading-relaxed italic">
                  "{item.review}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-6 border-t border-white/5 mt-6 relative z-10">
                {item.avatar ? (
                  <img 
                    src={item.avatar} 
                    alt={item.name} 
                    className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10" 
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full ${item.color || 'bg-brand-pink'} flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md`}>
                    {item.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-white">{item.name}</h4>
                  <span className="text-[10px] text-brand-pink uppercase font-extrabold tracking-wide">
                    {item.achievement || item.course || "Verified Student"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Call to Action / doubts clearing info */}
      <div className="glass-card p-10 rounded-3xl border border-brand-purple/20 text-center max-w-4xl mx-auto space-y-6 bg-gradient-to-br from-[#0a0047] to-[#040026] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-purple/10 blur-3xl rounded-full"></div>
        
        <MessageSquareQuote className="w-12 h-12 text-brand-pink mx-auto" />
        <h3 className="text-2xl font-bold text-white">Share Your Story With Us</h3>
        <p className="text-sm text-brand-textMuted max-w-xl mx-auto leading-relaxed">
          Are you an enrolled student? Share your learning journey and feedback directly with your course mentors. Your reviews inspire us to make learning even more visual and effective.
        </p>
      </div>
    </div>
  );
}
