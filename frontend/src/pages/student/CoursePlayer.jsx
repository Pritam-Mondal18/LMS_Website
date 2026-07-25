import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import { Download, BookOpen, AlertCircle, ArrowLeft, Trophy, FileText, CheckCircle2, Play, Check, Clock, Sparkles } from 'lucide-react';

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

export default function CoursePlayer() {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  
  // Test State
  const [tests, setTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [testAnswers, setTestAnswers] = useState({});
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/courses/${id}`);
        if (res.data.success) {
          setCourse(res.data.course);
          setCanAccess(res.data.canAccess || false);
          
          // Fetch student enrollment to see progress percent and completed lessons list
          const dashboardRes = await api.get('/dashboard/student');
          if (dashboardRes.data.success) {
            const enrollment = dashboardRes.data.enrollments.find(
              (e) => e.course?._id === res.data.course._id
            );
            if (enrollment) {
              setCompletedLessons(enrollment.completedLessons || []);
            }
          }

          // Fetch tests for this course
          const testRes = await api.get(`/tests?courseId=${res.data.course._id}`);
          if (testRes.data.success) {
            setTests(testRes.data.tests || []);
          }
        }
      } catch (err) {
        console.error("Error loading course progress details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndProgress();
  }, [id]);

  const toggleLessonCompleted = async (lessonId) => {
    if (!course) return;
    try {
      const isCompleted = completedLessons.includes(lessonId);
      
      // Update in local state
      if (isCompleted) {
        setCompletedLessons(completedLessons.filter(id => id !== lessonId));
      } else {
        setCompletedLessons([...completedLessons, lessonId]);
      }
      
      // Sync progress with backend
      await api.put(`/courses/${course._id}/progress`, { lessonId });
    } catch (err) {
      console.warn("Failed to update progress:", err);
    }
  };

  // Start a Quiz Mock
  const startQuiz = (test) => {
    setActiveTest(test);
    setTestAnswers({});
    setTestResult(null);
  };

  // Select Option in Quiz
  const selectOption = (questionIdx, optionLabel) => {
    setTestAnswers({
      ...testAnswers,
      [questionIdx]: optionLabel,
    });
  };

  // Submit Quiz Mock
  const submitQuiz = async () => {
    if (!activeTest) return;
    setTestSubmitting(true);
    try {
      // Structure: answers = [ { questionId, selectedOption } ]
      const answersArray = activeTest.questions.map((q, idx) => ({
        questionId: q._id,
        selectedOption: testAnswers[idx] || '',
      }));

      const res = await api.post(`/tests/${activeTest._id}/submit`, {
        answers: answersArray,
      });

      if (res.data.success) {
        setTestResult(res.data.result);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit quiz results');
    } finally {
      setTestSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-pink"></div>
      </div>
    );
  }

  if (!course || !canAccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <AlertCircle className="w-16 h-16 text-brand-pink mx-auto animate-pulse" />
        <h2 className="text-3xl font-black text-white">Classroom Closed</h2>
        <p className="text-brand-textMuted text-sm">You need to enroll in this course first to access the video player.</p>
        <Link to="/courses" className="btn-primary inline-flex">View Catalog</Link>
      </div>
    );
  }

  const activeLesson = course.lessons?.[activeLessonIdx];
  const progressPercent = course.lessons?.length 
    ? Math.round((completedLessons.length / course.lessons.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-brand-dark text-left relative overflow-hidden">
      {/* Decorative Glow elements */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-brand-purple/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-0 w-[350px] h-[350px] bg-brand-pink/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        
        {/* Header Back & Info Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#050029]/80 border border-brand-purple/10 p-5 rounded-2xl backdrop-blur-xl">
          <div className="space-y-1.5">
            <Link to="/student" className="inline-flex items-center gap-1.5 text-xs font-black text-brand-pink hover:text-white transition-all uppercase tracking-wider">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{course.title}</h1>
            <p className="text-xs text-brand-textMuted flex items-center gap-2">
              <span className="bg-brand-purple/15 text-brand-purple text-[9px] font-black uppercase px-2 py-0.5 rounded border border-brand-purple/20">
                {course.subject}
              </span>
              <span>{course.lessons?.length || 0} Lectures</span>
            </p>
          </div>

          <div className="w-full sm:w-60 space-y-2 shrink-0">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-brand-textMuted">Classroom Progress</span>
              <span className="text-brand-pink font-black">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-brand-dark rounded-full overflow-hidden border border-white/5 relative">
              <div 
                className="h-full bg-gradient-to-r from-brand-pink to-brand-purple rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-brand-textMuted/80 block text-right font-medium">
              {completedLessons.length} of {course.lessons?.length || 0} completed
            </span>
          </div>
        </div>

        {/* Main Content Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Player & Active Lesson Info / Quiz Module */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeTest ? (
              /* Premium Mock Test Exam Panel */
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-brand-purple/20 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-purple/5 blur-3xl rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-center border-b border-white/5 pb-4 relative z-10">
                  <div className="space-y-1">
                    <span className="bg-brand-pink/15 text-brand-pink border border-brand-pink/20 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                      Academy Mock Test
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white">{activeTest.title}</h3>
                    <p className="text-xs text-brand-textMuted">{activeTest.description || "Practice exam paper to analyze your subject skills."}</p>
                  </div>
                  <button
                    onClick={() => setActiveTest(null)}
                    className="bg-brand-surface hover:bg-red-500/10 text-brand-textMuted hover:text-red-400 border border-brand-purple/20 hover:border-red-500/30 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                  >
                    Exit Exam
                  </button>
                </div>

                {testResult ? (
                  /* Premium Quiz Results Panel */
                  <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-300 relative z-10">
                    <div className="w-20 h-20 bg-yellow-400/10 border border-yellow-400/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-yellow-400/5">
                      <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-white">Quiz Evaluation Completed!</h4>
                      <p className="text-xs text-brand-textMuted max-w-sm mx-auto">Your mock results have been computed. You can review your detailed report below.</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2 text-sm">
                      <div className="bg-brand-surface/60 backdrop-blur-md p-4 rounded-2xl border border-brand-purple/10">
                        <span className="text-brand-textMuted block text-[10px] uppercase font-bold tracking-wider">Marks Scored</span>
                        <span className="text-xl font-black text-brand-pink block mt-1">{testResult.score} / {activeTest.questions?.length * 4 || 100}</span>
                      </div>
                      <div className="bg-brand-surface/60 backdrop-blur-md p-4 rounded-2xl border border-brand-purple/10">
                        <span className="text-brand-textMuted block text-[10px] uppercase font-bold tracking-wider">Correct</span>
                        <span className="text-xl font-black text-emerald-400 block mt-1">{testResult.correctAnswers}</span>
                      </div>
                      <div className="bg-brand-surface/60 backdrop-blur-md p-4 rounded-2xl border border-brand-purple/10">
                        <span className="text-brand-textMuted block text-[10px] uppercase font-bold tracking-wider">Incorrect</span>
                        <span className="text-xl font-black text-red-400 block mt-1">{testResult.wrongAnswers}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTest(null)}
                      className="btn-primary inline-flex py-3 px-8 text-xs font-bold"
                    >
                      Resume Study Lectures
                    </button>
                  </div>
                ) : (
                  /* Premium Quiz Questions Form */
                  <div className="space-y-6 relative z-10">
                    {activeTest.questions?.map((q, qIdx) => (
                      <div key={qIdx} className="bg-[#050029]/40 p-5 sm:p-6 rounded-2xl border border-brand-purple/15 space-y-4">
                        <h4 className="font-extrabold text-white text-sm sm:text-base leading-relaxed flex items-start gap-2">
                          <span className="bg-brand-pink/10 text-brand-pink text-xs font-black rounded-lg w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 border border-brand-pink/20">
                            {qIdx + 1}
                          </span>
                          {q.text}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                          {q.options?.map((opt, optIdx) => {
                            const isSelected = testAnswers[qIdx] === opt.label;
                            return (
                              <button
                                key={optIdx}
                                onClick={() => selectOption(qIdx, opt.label)}
                                className={`p-4 rounded-xl text-xs sm:text-sm text-left font-bold border transition-all transform-gpu active:scale-98 flex items-center gap-1 ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-brand-pink/15 to-brand-purple/15 border-brand-pink text-white shadow-md shadow-brand-pink/5'
                                    : 'bg-brand-dark/45 border-brand-purple/20 text-brand-textMuted hover:text-white hover:border-brand-purple'
                                }`}
                              >
                                <span className={`inline-block w-6 h-6 rounded-lg text-center leading-6 font-black mr-2 text-xs shrink-0 border transition-all ${
                                  isSelected
                                    ? 'bg-brand-pink border-brand-pink text-white shadow'
                                    : 'bg-brand-surface border-brand-purple/35 text-brand-pink'
                                }`}>
                                  {opt.label}
                                </span>
                                <span className="leading-snug">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={submitQuiz}
                      disabled={testSubmitting}
                      className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-sm font-bold shadow-lg"
                    >
                      {testSubmitting ? (
                        <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                      ) : (
                        'Finish & Submit Exam'
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : activeLesson ? (
              /* Premium Video Lecture Panel */
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Sleek Beveled Video Player Container */}
                <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-brand-purple/15 shadow-2xl relative shadow-brand-purple/10 transform-gpu">
                  {activeLesson.videoUrl ? (
                    (() => {
                      const ytUrl = getYouTubeEmbedUrl(activeLesson.videoUrl);
                      if (ytUrl) {
                        return (
                          <iframe
                            key={ytUrl}
                            src={ytUrl}
                            title={activeLesson.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        );
                      }
                      return (
                        <video
                          key={activeLesson.videoUrl}
                          src={activeLesson.videoUrl}
                          poster={activeLesson.thumbnailUrl || undefined}
                          controls
                          playsInline
                          className="w-full h-full object-contain"
                          controlsList="nodownload"
                        />
                      );
                    })()
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-textMuted bg-brand-surface/20 font-bold">
                      No video file uploaded for this lecture.
                    </div>
                  )}
                </div>

                {/* Lesson Details Card */}
                <div className="bg-[#050029]/80 p-5 sm:p-7 rounded-3xl border border-brand-purple/10 space-y-5 backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/5 blur-2xl rounded-full pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5 relative z-10">
                    <div className="space-y-1">
                      <span className="bg-brand-pink/15 text-brand-pink border border-brand-pink/20 text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest">
                        Lecture {activeLessonIdx + 1}
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-white leading-tight mt-1.5">{activeLesson.title}</h2>
                      <p className="text-xs text-brand-textMuted flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-brand-pink" /> {activeLesson.duration} minutes duration
                      </p>
                    </div>
                    
                    <button
                      onClick={() => toggleLessonCompleted(activeLesson._id)}
                      className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-black transition-all border transform-gpu hover:scale-105 active:scale-95 shrink-0 ${
                        completedLessons.includes(activeLesson._id)
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/15'
                          : 'bg-brand-pink/10 hover:bg-brand-pink text-brand-pink hover:text-white border-brand-pink/20 hover:border-transparent shadow-md'
                      }`}
                    >
                      {completedLessons.includes(activeLesson._id) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-current" /> Completed
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" /> Mark Completed
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-xs font-black text-brand-pink uppercase tracking-widest mb-1.5">Lecture Description</h4>
                    <p className="text-xs sm:text-sm text-brand-textMuted leading-relaxed">{activeLesson.description || "In this concept class, we break down core logical derivations and walk through standard test problems step-by-step."}</p>
                  </div>
                  
                  {/* PDF Notes Section */}
                  {activeLesson.notes && activeLesson.notes.length > 0 && (
                    <div className="border-t border-white/5 pt-5 mt-4 space-y-3 relative z-10">
                      <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-pink" /> Attachments & Study Notes
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {activeLesson.notes.map((note, noteIdx) => (
                          <a
                            key={noteIdx}
                            href={note.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-xs font-bold text-brand-pink bg-brand-pink/10 border border-brand-pink/20 hover:bg-brand-pink hover:text-white py-2.5 px-4 rounded-xl transition-all shadow-sm transform-gpu hover:scale-103"
                          >
                            <Download className="w-3.5 h-3.5" /> {note.title} (PDF)
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-[#050029]/50 rounded-3xl border border-brand-purple/10 backdrop-blur-xl">
                <BookOpen className="w-12 h-12 text-brand-textMuted/40 mx-auto mb-3" />
                <p className="text-brand-textMuted text-sm">No lecture video loaded.</p>
              </div>
            )}
          </div>
          
          {/* Right Column: Lessons Index Sidebar & Practice Tests */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Syllabus Index Card */}
            <div className="glass-card rounded-3xl border border-brand-purple/20 p-5 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/5 blur-2xl rounded-full pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-3.5 relative z-10">
                <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-pink" /> Course Syllabus
                </h3>
                <span className="text-[10px] bg-brand-purple/15 text-brand-purple font-black border border-brand-purple/25 px-2 py-0.5 rounded uppercase">
                  Lectures
                </span>
              </div>
              
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin relative z-10">
                {course.lessons?.map((lesson, idx) => {
                  const isActive = !activeTest && activeLessonIdx === idx;
                  const isCompleted = completedLessons.includes(lesson._id);
                  return (
                    <button
                      key={lesson._id}
                      onClick={() => {
                        setActiveTest(null);
                        setActiveLessonIdx(idx);
                      }}
                      className={`w-full flex items-start gap-3.5 p-3 rounded-xl border text-left transition-all duration-200 transform-gpu active:scale-98 ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-pink/15 to-brand-purple/15 border-brand-pink text-white shadow-md shadow-brand-pink/5'
                          : 'bg-brand-surface/40 border-brand-purple/10 hover:border-brand-purple/30 hover:bg-brand-surface/60 text-brand-textMuted hover:text-white'
                      }`}
                    >
                      {lesson.thumbnailUrl ? (
                        <img 
                          src={lesson.thumbnailUrl} 
                          alt="" 
                          className="w-10 h-7 object-cover rounded-lg border border-brand-purple/20 shrink-0 mt-0.5" 
                        />
                      ) : (
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5 border transition-all ${
                          isActive
                            ? 'bg-brand-pink border-brand-pink text-white'
                            : isCompleted 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                              : 'bg-brand-dark/50 border-brand-purple/35 text-brand-purple'
                        }`}>
                          {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                        </span>
                      )}
                      <div className="space-y-1 min-w-0">
                        <span className={`text-xs font-bold block truncate leading-snug ${isActive ? 'text-white' : 'text-gray-200'}`}>{lesson.title}</span>
                        <span className="text-[10px] text-brand-textMuted flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.duration} mins</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Series Card */}
            {tests.length > 0 && (
              <div className="glass-card rounded-3xl border border-brand-purple/20 p-5 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 blur-2xl rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-center border-b border-white/5 pb-3.5 relative z-10">
                  <h3 className="font-extrabold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" /> Linked Mock Exams
                  </h3>
                </div>
                
                <div className="space-y-3 relative z-10">
                  {tests.map((test) => {
                    const isSelected = activeTest?._id === test._id;
                    return (
                      <div 
                        key={test._id} 
                        className={`bg-brand-surface/40 p-4 rounded-2xl border transition-all ${
                          isSelected ? 'border-brand-pink' : 'border-brand-purple/10'
                        }`}
                      >
                        <div className="space-y-1 mb-3.5 text-left">
                          <span className="text-xs font-black text-white block line-clamp-1">{test.title}</span>
                          <span className="text-[10px] text-brand-textMuted flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {test.duration} mins duration
                          </span>
                        </div>
                        <button
                          onClick={() => startQuiz(test)}
                          className="w-full btn-primary text-xs py-2.5 justify-center font-extrabold tracking-wide uppercase shadow"
                        >
                          Start Mock Exam
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
