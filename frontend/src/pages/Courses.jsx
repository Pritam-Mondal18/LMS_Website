import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses } from '../redux/slices/courseSlice';
import { Search, BookOpen, Clock, ChevronRight } from 'lucide-react';
import SEO from '../components/common/SEO';

export default function Courses() {
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector((state) => state.courses);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch courses with current filters
    dispatch(fetchCourses({
      category: currentCategory,
      search: searchParams.get('search') || '',
    }));
  }, [dispatch, currentCategory, searchParams]);

  const handleCategoryChange = (catId) => {
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === '') {
      searchParams.delete('search');
    } else {
      searchParams.set('search', searchTerm);
    }
    setSearchParams(searchParams);
  };

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'jee', label: 'JEE' },
    { id: 'neet', label: 'NEET' },
    { id: 'boards-11-12', label: 'Boards (11-12)' },
    { id: 'boards-5-10', label: 'Foundation (5-10)' },
    { id: 'college', label: 'College' },
    { id: 'commerce', label: 'Commerce' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <SEO 
        title="Browse Courses" 
        description="Explore premium academic courses for JEE, NEET, Class 5-10 Foundation, and Commerce. Learn from HOD Sumit Chakraborty and top faculty."
        keywords="JEE courses, NEET courses, online coaching catalog, CBSE math notes, physics lectures"
      />
      {/* Header */}
      <div className="text-left space-y-3 sm:space-y-4 mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">Our Course Catalog</h1>
        <p className="text-brand-textMuted max-w-2xl text-xs sm:text-sm">
          Browse through our curriculum of highly targeted, conceptual courses designed to build clear logic and excel in competitive exams.
        </p>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 mb-8 sm:mb-12">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full lg:max-w-xs relative flex items-center shrink-0">
          <input
            type="text"
            placeholder="Search courses, topics, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-violet/20 border border-brand-purple/20 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-brand-pink transition-all placeholder-brand-textMuted/60 text-sm"
          />
          <Search className="w-5 h-5 text-brand-textMuted absolute left-4 pointer-events-none" />
          <button type="submit" className="absolute right-2 bg-brand-pink hover:bg-brand-pink/90 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
            Find
          </button>
        </form>

        {/* Category Pill Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0 pb-1.5 w-full lg:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold border transition-all duration-200 shrink-0 ${
                currentCategory === cat.id
                  ? 'bg-gradient-to-r from-brand-pink to-brand-purple text-white border-transparent shadow-lg shadow-brand-purple/20'
                  : 'bg-brand-violet/20 border-brand-purple/25 text-brand-textMuted hover:text-white hover:border-brand-purple'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, idx) => (
            <div key={idx} className="glass-card rounded-3xl overflow-hidden border border-brand-purple/10 flex flex-col justify-between h-full animate-pulse">
              <div>
                <div className="aspect-video bg-brand-violet/20"></div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-brand-violet/20 rounded w-1/4"></div>
                    <div className="h-4 bg-brand-violet/20 rounded w-1/4"></div>
                  </div>
                  <div className="h-6 bg-brand-violet/20 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-brand-violet/20 rounded w-full"></div>
                    <div className="h-3 bg-brand-violet/20 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div className="flex justify-between items-center pt-4 border-t border-white/5">
                  <div className="space-y-1 w-1/3">
                    <div className="h-3 bg-brand-violet/20 rounded w-1/2"></div>
                    <div className="h-5 bg-brand-violet/20 rounded w-3/4"></div>
                  </div>
                  <div className="h-6 bg-brand-violet/20 rounded w-1/4"></div>
                </div>
                <div className="h-10 bg-brand-violet/20 rounded-xl w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400 font-semibold bg-red-500/5 rounded-3xl border border-red-500/10">
          Error loading courses: {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-brand-violet/10 rounded-3xl border border-brand-purple/10">
          <BookOpen className="w-16 h-16 text-brand-textMuted/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Courses Found</h3>
          <p className="text-brand-textMuted text-sm max-w-md mx-auto">
            We couldn't find any courses matching "{currentCategory !== 'all' ? currentCategory : ''} {searchParams.get('search') || ''}". Try broadening your filters or keyword query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course._id} className="glass-card rounded-3xl overflow-hidden border border-brand-purple/20 flex flex-col justify-between glass-card-hover h-full">
              <div>
                {/* Thumbnail */}
                <div className="aspect-video bg-brand-surface relative overflow-hidden">
                  {course.thumbnail?.url && !course.thumbnail.url.includes('via.placeholder.com') ? (
                    <img 
                      src={course.thumbnail.url} 
                      alt={course.title} 
                      loading="lazy"
                      decoding="async"
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
                  {course.level && (
                    <span className="absolute top-4 right-4 bg-brand-dark/85 text-brand-pink text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-brand-purple/30">
                      {course.level}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 text-left space-y-4">
                  <div className="flex items-center justify-between text-xs text-brand-pink font-semibold">
                    <span>{course.subject}</span>
                    <span className="flex items-center gap-1 text-brand-textMuted"><Clock className="w-3.5 h-3.5" /> {course.lessons?.length || 0} Lessons</span>
                  </div>
                  <h3 className="text-lg font-black text-white line-clamp-1">{course.title}</h3>
                  <p className="text-sm text-brand-textMuted line-clamp-2 leading-relaxed">{course.description}</p>
                </div>
              </div>

              {/* Action and Pricing */}
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
                <Link to={`/courses/${course._id}`} className="w-full btn-primary text-center text-sm py-2.5 flex items-center justify-center gap-1.5">
                  View Syllabus & Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
