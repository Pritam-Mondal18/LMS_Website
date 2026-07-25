import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourseDetail } from '../redux/slices/courseSlice';
import { fetchCurrentUser } from '../redux/slices/authSlice';
import api from '../services/api';
import { Play, Lock, CheckCircle, ShieldCheck, BookOpen, Clock, AlertCircle, X, Star } from 'lucide-react';
import SEO from '../components/common/SEO';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
  }
  return null;
};

export default function CourseDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCourse, detailLoading, error } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('syllabus');
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [modalOpenTime, setModalOpenTime] = useState(0);
  const [enrollLoading, setEnrollLoading] = useState(false);

  const getClassroomLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin?tab=courses';
    if (user.role === 'teacher') return '/teacher?tab=courses';
    return '/student?tab=courses';
  };

  useEffect(() => {
    dispatch(fetchCourseDetail(id));
  }, [dispatch, id]);

  // Check enrollment state from Redux state and user profile
  useEffect(() => {
    if (currentCourse) {
      const isEnrolledInCourse = !!(
        currentCourse.isEnrolled || 
        (user && user.role === 'student' && user.enrolledCourses?.includes(currentCourse._id))
      );
      setIsEnrolled(isEnrolledInCourse);
    }
  }, [currentCourse, user]);

  const isInstructor = !!(user && currentCourse && currentCourse.instructor && 
    (currentCourse.instructor._id || currentCourse.instructor).toString() === user._id.toString());
  const isAdmin = user?.role === 'admin';
  const canAccessLectures = isEnrolled || isAdmin || isInstructor;

  if (detailLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-pulse text-left">
        {/* Title area */}
        <div className="space-y-4">
          <div className="h-4 bg-brand-violet/20 rounded w-24"></div>
          <div className="h-10 bg-brand-violet/20 rounded w-1/2"></div>
          <div className="h-4 bg-brand-violet/20 rounded w-1/3"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-video bg-brand-violet/20 rounded-3xl"></div>
            <div className="space-y-4">
              <div className="h-6 bg-brand-violet/20 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-3.5 bg-brand-violet/20 rounded w-full"></div>
                <div className="h-3.5 bg-brand-violet/20 rounded w-full"></div>
                <div className="h-3.5 bg-brand-violet/20 rounded w-5/6"></div>
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-brand-purple/10 space-y-6">
              <div className="h-6 bg-brand-violet/20 rounded w-1/3"></div>
              <div className="h-10 bg-brand-violet/20 rounded w-1/2"></div>
              <div className="h-12 bg-brand-violet/20 rounded-2xl w-full"></div>
              <div className="space-y-3">
                <div className="h-3.5 bg-brand-violet/20 rounded w-3/4"></div>
                <div className="h-3.5 bg-brand-violet/20 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentCourse) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-16 h-16 text-brand-pink mx-auto" />
        <h2 className="text-2xl font-black text-white">Course Not Found</h2>
        <p className="text-brand-textMuted">{error || "The requested course could not be located in our database."}</p>
        <Link to="/courses" className="btn-primary inline-flex">Go to Courses</Link>
      </div>
    );
  }

  const handleEnroll = async () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${id}`);
      return;
    }

    setEnrollLoading(true);
    try {
      if (currentCourse.price === 0) {
        // Free course enrollment
        const response = await api.post(`/courses/${currentCourse._id}/enroll`);
        if (response.data.success) {
          setIsEnrolled(true);
          dispatch(fetchCurrentUser());
          alert('Enrolled successfully!');
          navigate(getClassroomLink());
        }
      } else {
        // Paid course: Initiate payment flow
        const orderResponse = await api.post('/payments/create-order', {
          courseId: currentCourse._id,
        });

        if (orderResponse.data.success) {
          if (orderResponse.data.isMock) {
            // Simulate payment verification for development / mock setup
            const verifyResponse = await api.post('/payments/verify', {
              razorpay_order_id: orderResponse.data.order.id,
              isMock: true,
            });

            if (verifyResponse.data.success) {
              setIsEnrolled(true);
              dispatch(fetchCurrentUser());
              alert('Payment simulation successful! Course enrolled.');
              navigate(getClassroomLink());
            }
          } else {
            // Real Razorpay implementation (would open Razorpay overlay if keys are active)
            const loaded = await loadRazorpayScript();
            if (!loaded) {
              alert('Failed to load Razorpay SDK. Please check your internet connection and try again.');
              return;
            }
            const options = {
              key: orderResponse.data.razorpayKeyId,
              amount: orderResponse.data.order.amount,
              currency: 'INR',
              name: 'Sumit Chakraborty Academy',
              description: currentCourse.title,
              order_id: orderResponse.data.order.id,
              handler: async function (response) {
                const verifyRes = await api.post('/payments/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  isMock: false,
                });
                if (verifyRes.data.success) {
                  setIsEnrolled(true);
                  dispatch(fetchCurrentUser());
                  navigate(getClassroomLink());
                }
              },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
          }
        }
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Enrollment failed. Please try again.');
    } finally {
      setEnrollLoading(false);
    }
  };

  const discountPercent = Math.round(
    ((currentCourse.price - currentCourse.discountPrice) / currentCourse.price) * 100
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 text-left">
      <SEO 
        title={currentCourse.title} 
        description={currentCourse.shortDescription || currentCourse.description || "Course details."}
        keywords={`${currentCourse.title}, ${currentCourse.subject}, ${currentCourse.category}, class notes, online classes`}
      />
      {/* Course Heading Header */}
      <div className="bg-[#050029] rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-brand-purple/10 mb-6 sm:mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-3 sm:space-y-4">
          <div className="flex gap-2">
            <span className="bg-brand-pink/15 text-brand-pink text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-brand-pink/20">
              {currentCourse.category.toUpperCase()}
            </span>
            <span className="bg-brand-purple/15 text-brand-purple text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-brand-purple/20">
              {currentCourse.subject}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">{currentCourse.title}</h1>
          <p className="text-brand-textMuted max-w-3xl text-xs sm:text-sm">{currentCourse.shortDescription || currentCourse.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
        {/* Main Details Panel */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-10">
          {/* Tabs Nav */}
          <div className="flex border-b border-white/5 pb-2 overflow-x-auto scrollbar-none whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0 gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('syllabus')}
              className={`pb-3 px-4 sm:px-6 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'syllabus'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-brand-textMuted hover:text-white'
              }`}
            >
              Course Curriculum
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-3 px-4 sm:px-6 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'about'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-brand-textMuted hover:text-white'
              }`}
            >
              Instructor Profile
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`pb-3 px-4 sm:px-6 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'features'
                  ? 'border-brand-pink text-brand-pink'
                  : 'border-transparent text-brand-textMuted hover:text-white'
              }`}
            >
              What's Included
            </button>
          </div>

          {/* Tab Contents */}
          <div className="min-h-[300px]">
            {activeTab === 'syllabus' && (
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-extrabold text-white">Syllabus Breakdown</h3>
                <div className="space-y-3 sm:space-y-4">
                  {currentCourse.lessons && currentCourse.lessons.length > 0 ? (
                    currentCourse.lessons.map((lesson, idx) => (
                      <div
                        key={idx}
                        className="glass-card p-4 sm:p-5 rounded-2xl border border-brand-purple/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 text-left">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-surface border border-brand-purple/35 flex items-center justify-center font-bold text-xs sm:text-sm text-brand-pink shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-white leading-snug">{lesson.title}</h4>
                            <p className="text-[10px] sm:text-xs text-brand-textMuted mt-1 flex flex-wrap items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" /> {lesson.duration} mins
                              {lesson.isPreview && (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase px-2 py-0.5 rounded ml-1">
                                  Free Preview
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Preview Action / Lock */}
                        {canAccessLectures ? (
                          <Link
                            to={`/student/courses/${currentCourse._id}`}
                            className="bg-brand-pink/10 hover:bg-brand-pink/20 text-brand-pink px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 w-full sm:w-auto justify-center"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" /> Watch Lecture
                          </Link>
                        ) : lesson.isPreview ? (
                          <button
                            onClick={() => {
                              setPreviewVideoUrl(lesson.videoUrl);
                              setModalOpenTime(Date.now());
                            }}
                            className="bg-brand-pink hover:bg-brand-pink/90 text-white px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 w-full sm:w-auto justify-center"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" /> Preview Lesson
                          </button>
                        ) : (
                          <div className="text-brand-textMuted p-2 shrink-0 self-end sm:self-auto flex items-center gap-1">
                            <span className="text-[10px] font-semibold uppercase sm:hidden">Locked</span>
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-brand-textMuted border border-dashed border-brand-purple/20 rounded-2xl">
                      Syllabus is being updated. Live slots will be listed soon.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="glass-card p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-brand-purple/15 text-left space-y-5 sm:space-y-6">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-brand-pink to-brand-purple flex items-center justify-center font-black text-white text-xl sm:text-2xl border-2 border-brand-pink shadow-lg shadow-brand-pink/15 shrink-0">
                    {currentCourse.instructor?.name?.charAt(0) || 'F'}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{currentCourse.instructor?.name || 'Academy Instructor'}</h3>
                    <p className="text-xs text-brand-pink font-semibold uppercase mt-0.5">{currentCourse.instructor?.specialization || 'Academic Expert'}</p>
                    <p className="text-xs text-brand-textMuted mt-1">{currentCourse.instructor?.qualification || 'M.Sc. Physics'}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-brand-textMuted leading-relaxed">
                  {currentCourse.instructor?.bio || 'Passionate educator committed to developing logical rigor and clarity in science students preparing for entrance tests.'}
                </p>
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-5 sm:pt-6 text-xs sm:text-sm">
                  <div>
                    <span className="text-brand-textMuted block text-[10px] sm:text-xs uppercase tracking-wider">Experience</span>
                    <span className="text-white font-bold text-sm sm:text-base">{currentCourse.instructor?.experience || '10+ Years'}</span>
                  </div>
                  <div>
                    <span className="text-brand-textMuted block text-[10px] sm:text-xs uppercase tracking-wider">Faculty Rating</span>
                    <span className="text-white font-bold text-sm sm:text-base flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {currentCourse.instructor?.rating || '4.9'}/5
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-4 sm:space-y-6 text-left">
                <h3 className="text-lg sm:text-xl font-extrabold text-white">Course Features & Inclusions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {(currentCourse.features || [
                    "Full Access to live slots & recordings",
                    "Downloadable Lecture Notes PDF",
                    "Daily Practice Problems (DPP) with solutions",
                    "Mock test series & real-time analytics reports"
                  ]).map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 bg-brand-violet/10 border border-brand-purple/10 p-4 rounded-xl">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-brand-textMuted leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Checkout / Order Card Sidebar */}
        <div className="lg:col-span-4 sticky top-28 space-y-6 w-full">
          <div className="glass-card rounded-2xl sm:rounded-3xl border border-brand-purple/20 p-5 sm:p-6 shadow-2xl text-left">
            {/* Header info */}
            <div className="aspect-video bg-brand-surface rounded-xl sm:rounded-2xl mb-4 sm:mb-6 relative overflow-hidden flex items-center justify-center border border-brand-purple/5">
              {currentCourse.thumbnail?.url && !currentCourse.thumbnail.url.includes('via.placeholder.com') ? (
                <img 
                  src={currentCourse.thumbnail.url} 
                  alt={currentCourse.title} 
                  className="w-full h-full object-cover animate-in fade-in duration-300"
                />
              ) : (
                <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-brand-purple/40" />
              )}
            </div>

            {/* Pricing details */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-xs sm:text-sm text-brand-textMuted font-medium">Course Fee</span>
                <div className="text-right">
                  <span className="text-xs sm:text-sm text-brand-textMuted line-through mr-2">₹{currentCourse.price}</span>
                  <span className="text-xl sm:text-2xl font-black text-white">₹{currentCourse.discountPrice}</span>
                </div>
              </div>

              {currentCourse.price > 0 && (
                <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-2.5 sm:p-3 rounded-xl">
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-400">Limited Offer</span>
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-400">{discountPercent}% OFF Applied</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {canAccessLectures ? (
              <Link to={getClassroomLink()} className="w-full btn-secondary text-center justify-center py-3 text-sm">
                Go to Classroom
              </Link>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrollLoading}
                className="w-full btn-primary text-center justify-center py-3 text-sm"
              >
                {enrollLoading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                ) : (
                  currentCourse.price === 0 ? 'Enroll Now (Free)' : 'Purchase Course'
                )}
              </button>
            )}

            {/* Security stamp */}
            <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-brand-textMuted mt-4 sm:mt-5 border-t border-white/5 pt-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Secure Transactions & Instant Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Preview Modal overlay */}
      {previewVideoUrl && (
        <div 
          className="fixed inset-0 bg-brand-dark/90 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => {
            if (Date.now() - modalOpenTime > 300) {
              setPreviewVideoUrl(null);
            }
          }}
        >
          <div 
            className="bg-[#050029] border border-brand-purple/20 rounded-3xl p-6 w-full max-w-4xl relative shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start pr-10">
              <div>
                <h3 className="text-xl font-bold text-white">Lecture Sample Preview</h3>
                <p className="text-xs text-brand-textMuted mt-1">Enroll in the course to unlock the full syllabus and worksheets.</p>
              </div>
              <button
                onClick={() => setPreviewVideoUrl(null)}
                className="absolute top-6 right-6 text-brand-textMuted hover:text-white hover:bg-white/5 transition-all p-2 rounded-full flex items-center justify-center"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Container */}
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-inner border border-brand-purple/10">
              {(() => {
                const ytUrl = getYouTubeEmbedUrl(previewVideoUrl);
                if (ytUrl) {
                  return (
                    <iframe
                      key={ytUrl}
                      src={ytUrl}
                      title="Preview"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  );
                }
                return (
                  <video
                    key={previewVideoUrl}
                    src={previewVideoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                    controlsList="nodownload"
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
