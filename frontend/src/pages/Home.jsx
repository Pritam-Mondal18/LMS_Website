import { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses } from '../redux/slices/courseSlice';
import api from '../services/api';
import { ChevronRight, ChevronLeft, X, GraduationCap, Users, Award, BookOpen, ArrowRight, Star, HelpCircle, CheckCircle, ChevronDown, User } from 'lucide-react';
import SEO from '../components/common/SEO';

export default function Home() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { courses, loading } = useSelector((state) => state.courses);
  const [activeFaq, setActiveFaq] = useState(null);

  const facultyList = [
    {
      initials: 'SC',
      name: 'Sumit Chakraborty',
      role: 'Founder & HOD Math',
      qual: 'M.Sc. Mathematics | 15+ Years Exp',
      desc: 'Pioneer of simplified teaching methods. Passionate about helping students visualize complex equations and integrals easily. Creator of target curriculums that help students bridge the gap between school board levels and competitive exam level math.',
      color: 'from-brand-pink to-brand-purple',
      borderColor: 'border-brand-pink',
      image: '/avatars/sumit.png',
      meta: '15+ Years Exp'
    },
    {
      initials: 'SS',
      name: 'Subir Sen',
      role: 'HOD Physics',
      qual: 'M.Sc. Physics (IIT KGP) | 12+ Years Exp',
      desc: 'Former senior faculty at Allen & PW. Author of concept books. Specializes in JEE/NEET mechanics and electrodynamics. Breathes life into complex physical phenomena with simulations and real-world experiments.',
      color: 'from-brand-purple to-blue-500',
      borderColor: 'border-brand-purple',
      image: '/avatars/subir.png',
      meta: '12+ Years Exp'
    },
    {
      initials: 'AR',
      name: 'Dr. Ananya Roy',
      role: 'HOD Chemistry',
      qual: 'Ph.D. Chemistry (IIT Bombay) | 10+ Years Exp',
      desc: 'Expert in Organic & Inorganic Chemistry. Known for visual reaction mechanisms and making complex chemical structures and periodic trends intuitive for board exams and competitive test levels.',
      color: 'from-blue-500 to-emerald-500',
      borderColor: 'border-blue-400',
      image: '/avatars/ananya.png',
      meta: '10+ Years Exp'
    },
    {
      initials: 'AB',
      name: 'Dr. Amit Banerjee',
      role: 'HOD Biology',
      qual: 'Ph.D. Zoology | 8+ Years Exp',
      desc: 'NEET Biology specialist. Focuses on high-resolution diagrams, memory mnemonics, and high-yield scoring chapters to prepare medical aspirants for full marks.',
      color: 'from-emerald-500 to-brand-pink',
      borderColor: 'border-emerald-400',
      image: '/avatars/amit.png',
      meta: '8+ Years Exp'
    },
    {
      initials: 'RG',
      name: 'Prof. Rajesh Gupta',
      role: 'HOD Commerce',
      qual: 'CA, M.Com | 14+ Years Exp',
      desc: 'Expert in Accountancy and Economics for boards and college levels. Integrates real-market financial analysis and case studies into classes.',
      color: 'from-yellow-500 to-brand-pink',
      borderColor: 'border-yellow-400',
      image: '/avatars/rajesh.png',
      meta: '14+ Years Exp'
    }
  ];

  const facultyContainerRef = useRef(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const scrollFaculty = (direction) => {
    if (facultyContainerRef.current) {
      const { scrollLeft, clientWidth } = facultyContainerRef.current;
      const scrollAmount = clientWidth / 2;
      facultyContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const [platformStats, setPlatformStats] = useState({
    studentCount: 8,
    teacherCount: 3,
    courseCount: 4
  });
  const [testimonials, setTestimonials] = useState([]);

  const displayTestimonials = useMemo(() => {
    const combined = [...testimonials];
    const staticItems = [
      {
        _id: "static-1",
        name: "Aman Gupta",
        review: "The physics curriculum by Subir Sir was spectacular. The visual proofs of mechanics equations kept me hooked, and my mock test ranks improved from 5k to AIR 421 in JEE!",
        rating: 5,
        achievement: "JEE Main AIR 421"
      },
      {
        _id: "static-2",
        name: "Ritu Mishra",
        review: "Sumit Chakraborty Academy changed how I studied mathematics. The tricks for integration and trigonometry calculations saved me at least 15 minutes during exam time.",
        rating: 5,
        achievement: "NEET 685 Marks"
      },
      {
        _id: "static-3",
        name: "Sayan Karmakar",
        review: "The class 10 boards preparation notes and practice sheets were identical to the final exam paper. I scored 98% in science and math! Strongly recommend this platform.",
        rating: 5,
        achievement: "Class 10 Board 98.4%"
      }
    ];

    for (const item of staticItems) {
      if (combined.length >= 3) break;
      if (!combined.some(c => c.name.toLowerCase() === item.name.toLowerCase())) {
        combined.push(item);
      }
    }
    return combined.slice(0, 3);
  }, [testimonials]);

  useEffect(() => {
    dispatch(fetchCourses({ limit: 3 }));

    const fetchStats = async () => {
      try {
        const response = await api.get('/auth/public-stats');
        if (response.data.success) {
          setPlatformStats(response.data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch public stats:", err);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const response = await api.get('/auth/testimonials');
        if (response.data.success) {
          setTestimonials(response.data.testimonials || []);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
      }
    };

    fetchStats();
    fetchTestimonials();
  }, [dispatch]);

  // Smooth scroll to hash anchor on navigation
  useEffect(() => {
    if (location.hash === '#reviews') {
      const element = document.getElementById('reviews');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const categories = [
    { id: 'jee', title: 'JEE Main & Advanced', desc: 'Rigorous coaching with focus on advanced problem solving.', bg: 'from-blue-600/20 to-brand-purple/20', border: 'hover:border-blue-500/50' },
    { id: 'neet', title: 'NEET Prep (UG)', desc: 'Comprehensive NCERT tracking, diagram sheets, & biology mock tests.', bg: 'from-emerald-600/20 to-brand-purple/20', border: 'hover:border-emerald-500/50' },
    { id: 'boards-11-12', title: 'Class 11 - 12 (Boards)', desc: 'Physics, Chemistry, Math & Biology with top percentage focus.', bg: 'from-pink-600/20 to-brand-purple/20', border: 'hover:border-brand-pink/50' },
    { id: 'boards-5-10', title: 'Class 5 - 10 Foundation', desc: 'Building logic, science temperament & competitive aptitude early.', bg: 'from-amber-600/20 to-brand-purple/20', border: 'hover:border-amber-500/50' },
    { id: 'college', title: 'College B.Sc.', desc: 'Advanced Physics lectures, mathematical methods and syllabus coverage.', bg: 'from-violet-600/20 to-brand-purple/20', border: 'hover:border-brand-purple/50' },
    { id: 'commerce', title: 'Commerce Division', desc: 'Accountancy, Business Studies, & Economics for Class 11-College.', bg: 'from-cyan-600/20 to-brand-purple/20', border: 'hover:border-cyan-500/50' },
  ];

  const stats = [
    { label: 'Enrolled Students', value: `${platformStats.studentCount}`, icon: Users, color: 'text-brand-pink' },
    { label: 'Expert Instructors', value: `${platformStats.teacherCount}`, icon: Award, color: 'text-brand-purple' },
    { label: 'Success Rate', value: '99.2%', icon: GraduationCap, color: 'text-blue-400' },
    { label: 'Instructor Rating', value: '4.9/5', icon: Star, color: 'text-yellow-400' },
  ];

  const faqs = [
    { q: "How can I access live classes and recordings?", a: "Once you purchase any course, they will be accessible directly in your Student Dashboard. Live sessions will display a 'Join Class' link, while older sessions will have recorded backups with attached notes (PDFs)." },
    { q: "Are study materials (DPP) included with the courses?", a: "Yes, every course includes detailed study materials, daily practice problems (DPP), and topic-wise mock tests created directly by Sumit Chakraborty and Subir Sen." },
    { q: "Can I watch classes on my mobile phone?", a: "Yes! The entire academy platform is responsive and runs on any modern mobile device or tablet. You can play videos, complete assignments, and take tests on the go." },
    { q: "How does the doubt clearing system work?", a: "Each course has dedicated weekly doubt-solving live sessions. Students can also post their queries in the course discussion forum, where our teaching assistants answer within 24 hours." }
  ];

  return (
    <div className="relative">
      <SEO 
        title="Premium JEE, NEET & Board Coaching" 
        description="India's trusted online academy for JEE, NEET, Science & Commerce preparation. Live classes, interactive lectures, and top-tier mentorship by Sumit Chakraborty." 
        keywords="JEE Main, JEE Advanced, NEET preparation, CBSE Boards, Class 10 Boards, Class 12 Boards, online academy, Sumit Chakraborty"
      />
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-20 md:pt-10 md:pb-28 overflow-hidden bg-hero-gradient">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-pink/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-brand-pink/10 border border-brand-pink/30 px-3.5 py-1.5 rounded-full text-brand-pink font-bold text-xs uppercase tracking-widest animate-pulse">
                🚀 Admissions Open 2026-2027
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Unlock Your Potential In <br />
                <span className="gradient-text">Science & Commerce</span>
              </h1>
              <p className="text-lg text-brand-textMuted max-w-xl leading-relaxed">
                Learn from premium faculties like Sumit Chakraborty & Subir Sen. Custom target curriculums for JEE, NEET, board examinations, and college courses with comprehensive doubt clearance.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/courses" className="btn-primary py-3 px-8 text-base">
                  Explore Courses <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/about" className="btn-secondary py-3 px-8 text-base">
                  Meet the Faculty
                </Link>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-6 pt-6 border-t border-white/5 text-sm text-brand-textMuted">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-pink" /> 1-on-1 Mentorship
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-brand-purple" /> Weekly Mock Tests
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-400" /> Interactive DPP Sheets
                </div>
              </div>
            </div>

            {/* Right Hero Column: Premium Interactive Mockup */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden glass-card border border-brand-purple/30 p-6 flex flex-col justify-between shadow-2xl shadow-brand-dark/50">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/20 blur-2xl rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-purple/20 blur-2xl rounded-full"></div>

                {/* Header widget */}
                <div className="flex justify-between items-center bg-brand-dark/50 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  </div>
                  <span className="text-[10px] text-brand-pink font-bold uppercase tracking-wider">Live Lectures</span>
                </div>

                {/* Video Play Mockup */}
                <div className="my-6 aspect-video bg-[#050029] rounded-2xl border border-brand-purple/20 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-violet to-transparent opacity-80"></div>
                  <div className="w-12 h-12 rounded-full bg-brand-pink flex items-center justify-center text-white z-10 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 fill-current pl-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="absolute bottom-3 left-3 text-xs text-white/80 font-semibold z-10">JEE Physics Promo Lecture</span>
                  <span className="absolute bottom-3 right-3 text-[10px] bg-brand-purple/50 px-2 py-0.5 rounded-full z-10">10:45 min</span>
                </div>

                {/* Active users widget */}
                <div className="bg-brand-violet/40 p-4 rounded-2xl border border-brand-purple/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-brand-textMuted block">Active Now</span>
                    <span className="text-lg font-black text-white">{platformStats.studentCount} Students</span>
                  </div>
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500 border-2 border-brand-dark flex items-center justify-center text-[10px] font-bold">A</div>
                    <div className="w-7 h-7 rounded-full bg-brand-pink border-2 border-brand-dark flex items-center justify-center text-[10px] font-bold">B</div>
                    <div className="w-7 h-7 rounded-full bg-brand-purple border-2 border-brand-dark flex items-center justify-center text-[10px] font-bold">S</div>
                    {platformStats.studentCount > 3 && (
                      <div className="w-7 h-7 rounded-full bg-gray-600 border-2 border-brand-dark flex items-center justify-center text-[8px] font-bold">
                        +{platformStats.studentCount - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="py-12 bg-[#050029] border-y border-brand-purple/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex flex-col items-center justify-center text-center p-4">
                  <div className="p-3 bg-brand-surface/60 rounded-2xl border border-brand-purple/20 mb-3">
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-2xl sm:text-3xl font-black text-white block">{stat.value}</span>
                  <span className="text-xs sm:text-sm text-brand-textMuted uppercase tracking-wider font-bold mt-1">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BRIEF ABOUT SECTION */}
      <section className="py-24 bg-[#040026] relative overflow-hidden border-b border-brand-purple/10">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-brand-pink/10 blur-[130px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-brand-purple/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: About Text & Highlights */}
            <div className="lg:col-span-7 text-left space-y-6">
              <span className="text-xs uppercase font-extrabold tracking-widest text-brand-pink">Our Philosophy</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Revolutionizing Education, <br />
                <span className="gradient-text">One Concept at a Time</span>
              </h2>
              <p className="text-brand-textMuted text-base leading-relaxed">
                At Sumit Chakraborty Academy, we believe that education should be empowering, intuitive, and accessible. Founded by elite educator Sumit Chakraborty, our academy has evolved into a premier EdTech hub that helps school, board, and JEE/NEET competitive aspirants develop a true scientific temperament rather than relying on rote memorization.
              </p>
              <p className="text-brand-textMuted text-base leading-relaxed">
                We combine years of offline coaching excellence with modern web tools, providing students with structured schedules, high-definition lecture recordings, detailed mock exams, and structured notes.
              </p>
              <div className="pt-4">
                <Link to="/about" className="btn-secondary py-3 px-6 text-sm inline-flex items-center gap-2">
                  Learn More About Our Journey <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Key Pillars / Feature grid */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="glass-card p-6 rounded-3xl border border-brand-purple/20 bg-brand-violet/10 text-left space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-pink/20 flex items-center justify-center text-brand-pink font-bold text-lg">
                  🧪
                </div>
                <h4 className="text-white font-bold text-base">Science-First Approach</h4>
                <p className="text-xs text-brand-textMuted leading-relaxed">
                  Focus on visual experiments, logical derivations, and real-world science models for class 5-12.
                </p>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-brand-purple/20 bg-brand-violet/10 text-left space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-purple/25 flex items-center justify-center text-brand-purple font-bold text-lg">
                  🎯
                </div>
                <h4 className="text-white font-bold text-base">Competitive Edge</h4>
                <p className="text-xs text-brand-textMuted leading-relaxed">
                  Proven test-series and DPP templates modeled after NTA and actual JEE/NEET patterns.
                </p>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-brand-purple/20 bg-brand-violet/10 text-left space-y-3 sm:col-span-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                  🤝
                </div>
                <h4 className="text-white font-bold text-base">Personalized Mentorship</h4>
                <p className="text-xs text-brand-textMuted leading-relaxed">
                  We don't just lecture. Our team monitors student analytics, offering offline/online session check-ins and direct doubt resolution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TARGET AUDIENCES / CATEGORIES */}
      <section className="py-24 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Tailored Programs For Every Stage
            </h2>
            <p className="text-brand-textMuted text-base">
              Whether you are in middle school or aiming for top colleges, we have specialized syllabi crafted to ensure conceptual mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/courses?category=${cat.id}`}
                className={`group p-8 rounded-3xl glass-card border border-brand-purple/15 bg-gradient-to-br ${cat.bg} transition-all duration-300 hover:scale-102 hover:border-brand-pink/30 flex flex-col justify-between h-[220px]`}
              >
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-pink transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-brand-textMuted leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-brand-pink group-hover:gap-2 transition-all mt-4">
                  Explore Track <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED COURSES SECTION */}
      <section className="py-24 bg-[#05002d] relative">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-brand-pink/5 blur-[120px] rounded-full"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-16">
            <div className="text-left max-w-2xl space-y-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-brand-pink">Interactive Learning</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Featured Courses</h2>
              <p className="text-brand-textMuted text-sm">
                Get started on your preparation journey with our most popular courses recommended by toppers.
              </p>
            </div>
            <Link to="/courses" className="btn-secondary self-start sm:self-auto text-sm shrink-0">
              View All Courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-pink"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses && courses.length > 0 ? (
                courses.slice(0, 3).map((course) => (
                  <div key={course._id} className="glass-card rounded-3xl overflow-hidden border border-brand-purple/20 flex flex-col justify-between glass-card-hover h-full">
                    <div>
                      {/* Thumbnail mockup */}
                      <div className="aspect-video bg-brand-surface relative overflow-hidden">
                        {course.thumbnail?.url && !course.thumbnail.url.includes('via.placeholder.com') ? (
                          <img 
                            src={course.thumbnail.url} 
                            alt={course.title} 
                            className="w-full h-full object-cover animate-in fade-in duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-tr from-brand-violet to-brand-dark/40 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-brand-purple/50" />
                          </div>
                        )}
                        <span className="absolute top-4 left-4 bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                          {course.category.toUpperCase()}
                        </span>
                      </div>
                      <div className="p-6 text-left space-y-4">
                        <span className="text-xs font-semibold text-brand-pink uppercase tracking-widest">{course.subject}</span>
                        <h3 className="text-lg font-black text-white line-clamp-1">{course.title}</h3>
                        <p className="text-sm text-brand-textMuted line-clamp-2 leading-relaxed">{course.description}</p>
                      </div>
                    </div>
                    <div className="p-6 pt-0 text-left">
                      <div className="flex justify-between items-center border-t border-white/5 pt-4 mb-4">
                        <div>
                          <span className="text-xs text-brand-textMuted line-through">₹{course.price}</span>
                          <span className="text-xl font-black text-white block">₹{course.discountPrice}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                        </span>
                      </div>
                      <Link to={`/courses/${course._id}`} className="w-full btn-primary text-center text-sm py-2">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-brand-textMuted">
                  No courses found. Run the seed script.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 5. FACULTY SECTION */}
      <section className="py-24 bg-brand-dark relative overflow-hidden border-t border-brand-purple/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-pink">Experienced Mentors</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Our Premium Faculty</h2>
            <p className="text-brand-textMuted text-base">
              Learn from educators who have helped thousands of students clear JEE/NEET with double-digit ranks. Click any card to view their full credentials.
            </p>
          </div>

          {/* Carousel container styled exactly as the reference: rounded-3xl box with inside floating chevrons */}
          <div className="relative border border-amber-500/20 bg-[#050711] rounded-[2rem] px-12 md:px-16 py-14 flex items-center shadow-2xl max-w-6xl mx-auto overflow-hidden">
            {/* Left navigation chevron */}
            <button
              onClick={() => scrollFaculty('left')}
              className="absolute left-4 z-20 text-amber-500/50 hover:text-amber-400 transition-all duration-300 hover:scale-125"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-7 h-7 sm:w-9 sm:h-9" />
            </button>

            {/* Middle slider content */}
            <div
              ref={facultyContainerRef}
              className="flex gap-0 overflow-x-auto scrollbar-none scroll-smooth w-full py-4 select-none"
            >
              {facultyList.map((fac, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedFaculty(fac)}
                  className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex-shrink-0 px-4 flex flex-col items-center group cursor-pointer"
                >
                  {/* Circular Avatar */}
                  <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full p-[2.5px] bg-transparent border border-amber-500/30 group-hover:border-amber-400 shadow-md group-hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] group-hover:scale-105 transition-all duration-500 ease-out">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <img
                        src={fac.image}
                        alt={fac.name}
                        className="w-full h-full object-cover object-top rounded-full transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Faculty Details */}
                  <h3 className="text-xs sm:text-sm font-medium font-serif tracking-widest text-white mt-6 group-hover:text-amber-400 text-center transition-colors uppercase px-2 w-full leading-snug">
                    {fac.name}
                  </h3>
                  
                  {/* Subtle Divider Line */}
                  <div className="w-14 h-[1px] bg-amber-500/25 group-hover:bg-amber-400/40 mt-4 mb-3 transition-colors duration-300"></div>
                  
                  {/* Metadata Row */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500/70 group-hover:text-amber-400 transition-colors mt-2 tracking-wide">
                    <User className="w-4 h-4 text-amber-500/70 group-hover:text-amber-400 transition-colors" />
                    <span>{fac.meta}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right navigation chevron */}
            <button
              onClick={() => scrollFaculty('right')}
              className="absolute right-4 z-20 text-amber-500/50 hover:text-amber-400 transition-all duration-300 hover:scale-125"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-7 h-7 sm:w-9 sm:h-9" />
            </button>
          </div>
        </div>

        {/* Selected Faculty Bio Modal */}
        {selectedFaculty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/80 backdrop-blur-md animate-fade-in">
            <div className="glass-card max-w-md w-full rounded-3xl border border-amber-500/30 p-8 text-left relative overflow-hidden bg-gradient-to-br from-[#06003c] to-[#040026] shadow-2xl">
              {/* Decorative corner glows */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-500/5 blur-2xl rounded-full"></div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedFaculty(null)}
                className="absolute top-4 right-4 text-amber-500/60 hover:text-amber-400 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-yellow-500 shrink-0 shadow-md overflow-hidden relative">
                  <img
                    src={selectedFaculty.image}
                    alt={selectedFaculty.name}
                    className="w-full h-full object-cover object-top rounded-full"
                  />
                </div>
                <div>
                  <span className="text-xs uppercase font-extrabold text-amber-400 block tracking-wider">
                    {selectedFaculty.role}
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    {selectedFaculty.name}
                  </h3>
                  <p className="text-xs text-brand-textMuted mt-0.5">
                    {selectedFaculty.qual}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6 relative z-10">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-white border-b border-white/5 pb-1">
                  About Mentor
                </h4>
                <p className="text-sm text-brand-textMuted leading-relaxed">
                  {selectedFaculty.desc}
                </p>
              </div>

              <button
                onClick={() => setSelectedFaculty(null)}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-bold py-2.5 text-center text-sm rounded-xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 relative z-10"
              >
                Close Profile
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section id="reviews" className="py-24 bg-[#05002d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-pink">Success Stories</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Words From Our Toppers</h2>
            <p className="text-brand-textMuted text-base">
              See how our curriculum helped students cross milestones and step into premier IITs and Medical colleges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayTestimonials.map((item, idx) => (
              <div key={item._id || idx} className="glass-card p-8 rounded-3xl border border-brand-purple/15 text-left flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-brand-textMuted text-sm leading-relaxed italic">
                    "{item.review}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-white/5 mt-6">
                  {item.avatar ? (
                    <img 
                      src={item.avatar} 
                      alt={item.name} 
                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10" 
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full ${item.color || 'bg-brand-pink'} flex items-center justify-center font-bold text-white text-xs shrink-0`}>
                      {item.initials || item.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <span className="text-[10px] text-brand-pink uppercase font-extrabold">
                      {item.achievement || item.course || "Verified Student"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ SECTION */}
      <section id="faq" className="py-24 bg-brand-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-pink">Got Questions?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-brand-textMuted text-base">
              Everything you need to know about enrollments, access, and study materials.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-card rounded-2xl border border-brand-purple/10 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center text-white font-bold hover:bg-brand-purple/10 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-brand-pink shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-brand-textMuted transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-brand-pink' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="p-6 pt-0 text-sm text-brand-textMuted leading-relaxed border-t border-white/5 animate-in slide-in-from-top duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
