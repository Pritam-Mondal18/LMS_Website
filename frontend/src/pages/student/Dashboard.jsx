import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import { logoutUser } from '../../redux/slices/authSlice';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Award,
  Calendar,
  MessageSquare,
  FolderOpen,
  User,
  Settings,
  LogOut,
  Flame,
  Bell,
  ChevronRight,
  ChevronLeft,
  Search,
  Menu,
  X,
  ChevronDown,
  CheckCircle2,
  Send,
  Download,
  Book,
  MapPin,
  TrendingUp,
  Star,
  Plus,
  Video
} from 'lucide-react';
import Logo from '../../components/common/Logo';
import Footer from '../../components/common/Footer';

export default function StudentDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sidebar responsive toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);

  // Active view tab state
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // API data states
  const [enrollments, setEnrollments] = useState([]);
  const [liveSessions, setLiveSessions] = useState([]);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [stats, setStats] = useState({
    enrolledCount: 0,
    ongoingCount: 0,
    completedCount: 0,
    avgTestScore: 0,
    totalStreak: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [notificationsDropdownOpen, setNotificationsDropdownOpen] = useState(false);

  const getGpaLabel = (avgScore) => {
    if (!avgScore) return 'N/A';
    if (avgScore >= 90) return 'A+';
    if (avgScore >= 80) return 'A';
    if (avgScore >= 70) return 'B';
    if (avgScore >= 60) return 'C';
    return 'D';
  };

  const getDynamicSchedule = () => {
    if (enrollments.length === 0) return [];
    const slots = [
      { start: '09:00 AM', end: '10:00 AM', color: 'bg-emerald-500', textLink: 'text-brand-pink' },
      { start: '11:00 AM', end: '12:00 PM', color: 'bg-blue-500', textLink: 'text-blue-400' },
      { start: '01:00 PM', end: '02:00 PM', color: 'bg-brand-purple', textLink: 'text-brand-purple' },
      { start: '03:00 PM', end: '04:00 PM', color: 'bg-yellow-500', textLink: 'text-yellow-500' }
    ];
    return enrollments.slice(0, 4).map((enroll, idx) => {
      const slot = slots[idx % slots.length];
      return {
        id: enroll._id,
        courseTitle: enroll.course?.title || 'Lecture Class',
        subject: enroll.course?.subject || 'LMS Lecture',
        start: slot.start,
        end: slot.end,
        color: slot.color,
        textLink: slot.textLink,
        room: `Room ${201 + idx}`
      };
    });
  };

  const getRecentUpdates = () => {
    const list = [];
    assignments.forEach(asg => {
      list.push({
        id: `asg-${asg._id}`,
        title: `New Assignment: ${asg.title}`,
        date: asg.createdAt ? new Date(asg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent'
      });
    });
    results.forEach(res => {
      list.push({
        id: `res-${res._id}`,
        title: `Test Graded: ${res.test?.title || 'Quiz'}`,
        date: res.createdAt ? new Date(res.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent'
      });
    });
    return list.slice(0, 3);
  };
  const [assignments, setAssignments] = useState([]);
  const [results, setResults] = useState([]);

  // Assignment submission modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAsgForSubmission, setSelectedAsgForSubmission] = useState(null);
  const [submitComment, setSubmitComment] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Profile Form state
  const [profileData, setProfileData] = useState({
    name: user?.name || 'student',
    email: user?.email || 'student@academy.com',
    major: 'Computer Science Major',
    year: 'Sophomore',
    bio: user?.bio || 'Passionate about structural algorithm design, quantum physics, and exploring classical literature themes.',
    phone: user?.phone || '+91 98765 43210'
  });

  // Checklist items
  const [todoList, setTodoList] = useState(() => {
    const saved = localStorage.getItem('student_todo');
    if (saved) {
      try { return JSON.parse(saved); } catch { return []; }
    }
    return [];
  });

  // Active calendar date
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().getDate());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  // Chat message simulator state
  const [activeChat, setActiveChat] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chats, setChats] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/student');
      if (response.data.success) {
        // Handle courses/enrollments
        const fetchedCourses = response.data.courses || response.data.enrollments || [];
        setEnrollments(fetchedCourses);

        // Handle stats
        if (response.data.stats) {
          setStats({
            enrolledCount: response.data.stats.enrolledCount ?? fetchedCourses.length,
            ongoingCount: response.data.stats.ongoingCount ?? fetchedCourses.length,
            completedCount: response.data.stats.completedCount ?? 0,
            avgTestScore: response.data.stats.avgTestScore ?? 0,
            totalStreak: response.data.stats.totalStreak ?? user?.streak ?? 0
          });
        }
        
        // Handle assignments & results
        if (response.data.assignments) {
          setAssignments(response.data.assignments);
        }
        if (response.data.results) {
          setResults(response.data.results);
        }
        if (response.data.liveClasses) {
          setLiveSessions(response.data.liveClasses);
        }
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
      setEnrollments([]);
      setAssignments([]);
      setResults([]);
      setLiveSessions([]);
    }

    // Fetch notifications separately
    try {
      const notifRes = await api.get('/notifications');
      if (notifRes.data.success) {
        setNotifications(notifRes.data.notifications || []);
      }
    } catch (e) {
      console.error("Notifications fetch error:", e);
    }
  }, [user]);

  // Save todo list
  useEffect(() => {
    localStorage.setItem('student_todo', JSON.stringify(todoList));
  }, [todoList]);

  // Fetch API dashboard info
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Prevent student from accessing messages page
  useEffect(() => {
    if (activeTab === 'messages') {
      setActiveTab('dashboard');
    }
  }, [activeTab]);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      }
      setNotificationsDropdownOpen(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!selectedAsgForSubmission) return;
    setSubmitting(true);
    try {
      let fileUrl = '';
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await api.post('/uploads/file', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.success) {
          fileUrl = uploadRes.data.url;
        }
      }
      
      const submitRes = await api.post(`/assignments/${selectedAsgForSubmission._id}/submit`, {
        fileUrl,
        comment: submitComment
      });
      
      if (submitRes.data.success) {
        alert('Assignment submitted successfully!');
        setShowSubmitModal(false);
        setSubmitComment('');
        setSelectedFile(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };



  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const toggleTodo = (id) => {
    setTodoList(todoList.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    alert("Profile saved successfully!");
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const updatedChats = [...chats];
    const messageTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    updatedChats[activeChat].messages.push({
      sender: 'student',
      text: chatInput,
      time: messageTime
    });

    setChats(updatedChats);
    const sentText = chatInput;
    setChatInput('');

    // Simulate reply
    setTimeout(() => {
      const repliedChats = [...chats];
      let replyText = "Alright! Let's check this in our next class schedule.";
      if (sentText.toLowerCase().includes('help') || sentText.toLowerCase().includes('problem')) {
        replyText = "Let's set up a doubt-clearing call. Please review the notes uploaded in the resources section.";
      } else if (sentText.toLowerCase().includes('homework') || sentText.toLowerCase().includes('assignment')) {
        replyText = "The submission link is open on the assignments page. Please submit before the deadline!";
      }
      
      repliedChats[activeChat].messages.push({
        sender: 'instructor',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setChats(repliedChats);
    }, 1200);
  };

  // Calendar month names
  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const startDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  // Side bar Navigation links
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'grades', label: 'Grades', icon: Award },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'live', label: 'Live Classes', icon: Video },
    { id: 'resources', label: 'Resources', icon: FolderOpen },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // SVG Course Graphics mapping
  const renderCourseThumbnail = (courseSlug, thumbnailObj, lessons = []) => {
    if (thumbnailObj && thumbnailObj.url && !thumbnailObj.url.includes('via.placeholder.com')) {
      return (
        <img 
          src={thumbnailObj.url} 
          alt="Course Thumbnail" 
          className="w-full h-full object-cover animate-in fade-in duration-300"
        />
      );
    }
    const firstLessonWithThumb = lessons?.find(l => l.thumbnailUrl && !l.thumbnailUrl.includes('via.placeholder.com'));
    if (firstLessonWithThumb) {
      return (
        <img 
          src={firstLessonWithThumb.thumbnailUrl} 
          alt="Course Thumbnail" 
          className="w-full h-full object-cover animate-in fade-in duration-300"
        />
      );
    }
    switch (courseSlug) {
      case 'calculus-ii':
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#471396] to-[#0f0052] flex items-center justify-center p-3">
            <svg viewBox="0 0 100 60" className="w-full h-full opacity-60">
              <g stroke="rgba(177, 59, 255, 0.4)" strokeWidth="0.5">
                <line x1="10" y1="50" x2="90" y2="50" />
                <line x1="10" y1="10" x2="10" y2="50" />
                <line x1="30" y1="10" x2="30" y2="50" strokeDasharray="2,2" />
                <line x1="50" y1="10" x2="50" y2="50" strokeDasharray="2,2" />
                <line x1="70" y1="10" x2="70" y2="50" strokeDasharray="2,2" />
                <line x1="10" y1="30" x2="90" y2="30" strokeDasharray="2,2" />
              </g>
              <path d="M 10 40 Q 30 10, 50 35 T 90 20" fill="none" stroke="#B13BFF" strokeWidth="2" />
              <path d="M 10 40 Q 30 10, 50 35 T 90 20 L 90 50 L 10 50 Z" fill="rgba(177, 59, 255, 0.15)" />
              <text x="12" y="18" fill="#B13BFF" fontSize="6" fontWeight="bold">y = f(x)</text>
              <text x="75" y="47" fill="white" fontSize="6" opacity="0.8">∫ a→b</text>
            </svg>
          </div>
        );
      case 'physics-i':
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#090040] to-[#140c5c] flex items-center justify-center p-3">
            <svg viewBox="0 0 100 60" className="w-full h-full opacity-60">
              <ellipse cx="50" cy="30" rx="35" ry="12" fill="none" stroke="rgba(0, 112, 243, 0.4)" strokeWidth="1" transform="rotate(30 50 30)" />
              <ellipse cx="50" cy="30" rx="35" ry="12" fill="none" stroke="rgba(0, 112, 243, 0.4)" strokeWidth="1" transform="rotate(-30 50 30)" />
              <ellipse cx="50" cy="30" rx="35" ry="12" fill="none" stroke="rgba(0, 112, 243, 0.4)" strokeWidth="1" transform="rotate(90 50 30)" />
              <circle cx="50" cy="30" r="5" fill="#0070F3" />
              <circle cx="48" cy="28" r="2" fill="#B13BFF" />
              <circle cx="52" cy="31" r="2.5" fill="#FF2E93" />
              <circle cx="20" cy="20" r="2.5" fill="#0070F3" />
              <circle cx="80" cy="40" r="2.5" fill="#0070F3" />
            </svg>
          </div>
        );
      case 'english-literature':
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#8B5A2B]/40 to-[#0f0052] flex items-center justify-center p-3">
            <svg viewBox="0 0 100 60" className="w-full h-full opacity-60">
              <path d="M 15 45 Q 50 50, 50 45 Q 50 50, 85 45 L 85 15 Q 50 20, 50 15 Q 50 20, 15 15 Z" fill="#8B5A2B" stroke="#5C3A1A" strokeWidth="1" />
              <path d="M 18 42 Q 50 47, 50 42 Q 50 47, 82 42 L 82 12 Q 50 17, 50 12 Q 50 17, 18 12 Z" fill="#Fdf5e6" />
              <g stroke="rgba(92, 58, 26, 0.3)" strokeWidth="0.8">
                <line x1="22" y1="18" x2="45" y2="18" />
                <line x1="22" y1="22" x2="42" y2="22" />
                <line x1="22" y1="26" x2="45" y2="26" />
                <line x1="22" y1="30" x2="38" y2="30" />
                
                <line x1="55" y1="18" x2="78" y2="18" />
                <line x1="55" y1="22" x2="75" y2="22" />
                <line x1="55" y1="26" x2="78" y2="26" />
                <line x1="55" y1="30" x2="72" y2="30" />
              </g>
              <polygon points="50,8 51,10 53,11 51,12 50,14 49,12 47,11 49,10" fill="#FFD700" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-gradient-to-br from-[#0F0052] to-[#140c5c] flex items-center justify-center p-3">
            <svg viewBox="0 0 100 60" className="w-full h-full opacity-60 font-mono">
              <g fill="#00FF66" fontSize="5" opacity="0.7">
                <text x="15" y="15">0101</text>
                <text x="15" y="25">1100</text>
                <text x="15" y="35">1010</text>
                <text x="45" y="18" fill="#FF2E93">const cs</text>
                <text x="45" y="28">class</text>
                <text x="65" y="15">1010</text>
                <text x="65" y="25">0110</text>
                <text x="65" y="35">1101</text>
              </g>
              <rect x="5" y="5" width="90" height="50" rx="3" fill="none" stroke="rgba(0, 255, 102, 0.2)" strokeWidth="1" />
            </svg>
          </div>
        );
    }
  };

  // Filter dynamic courses
  const filteredEnrollments = enrollments.filter(e => 
    e.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.course?.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090040] text-white relative">
      {/* Dynamic glow objects background */}
      <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] bg-brand-purple/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-100px] left-[-200px] w-[500px] h-[500px] bg-brand-pink/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* 1. Left Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-brand-purple/10 bg-[#0F0052]/40 backdrop-blur-2xl shrink-0 p-6 justify-between h-full relative z-25">
        <div className="space-y-8 w-full">
          <Link to="/" className="flex items-center">
            <Logo size="sm" />
          </Link>

          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] pr-1 scrollbar-thin">
            {sidebarItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-violet to-brand-purple text-white shadow-lg shadow-brand-purple/20'
                      : 'text-brand-textMuted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="bg-brand-pink text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all text-left mt-auto border-t border-white/5 pt-4"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="fixed top-0 left-0 h-full w-64 bg-[#0F0052] border-r border-brand-purple/15 p-6 flex flex-col justify-between z-50 animate-in slide-in-from-left duration-300">
            <div className="space-y-8 w-full">
              <div className="flex justify-between items-center">
                <Logo size="sm" />
                <button onClick={() => setSidebarOpen(false)} className="text-brand-textMuted hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] pr-1 scrollbar-thin">
                {sidebarItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-violet to-brand-purple text-white shadow-lg shadow-brand-purple/20'
                          : 'text-brand-textMuted hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className="w-5 h-5 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && !isActive && (
                        <span className="bg-brand-pink text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all text-left mt-auto border-t border-white/5 pt-4"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>Logout</span>
            </button>
          </aside>
        </>
      )}

      {/* 2. Main Right Container */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative z-10">
        {/* Top Navbar Header */}
        <header className="h-20 border-b border-brand-purple/10 bg-[#0F0052]/20 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 relative z-30">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-brand-textMuted hover:text-white rounded-lg hover:bg-white/5"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Top Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-brand-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses, assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-brand-dark/50 border border-brand-purple/15 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder-brand-textMuted/60 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all w-36 min-[375px]:w-44 sm:w-64 md:w-80"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsDropdownOpen(!notificationsDropdownOpen)}
                className="p-2 text-brand-textMuted hover:text-white rounded-full hover:bg-white/5 transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-pink text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {notificationsDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotificationsDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-brand-surface/95 backdrop-blur-xl border border-brand-purple/20 p-4 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                      <h4 className="text-sm font-extrabold text-white">Notifications</h4>
                      {notifications.filter(n => !n.isRead).length > 0 && (
                        <button 
                          onClick={handleMarkAllNotificationsRead}
                          className="text-[10px] text-brand-pink font-bold hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto space-y-2 scrollbar-thin pr-1">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <button
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex gap-3 ${
                              notif.isRead 
                                ? 'bg-transparent border-transparent hover:bg-white/5' 
                                : 'bg-brand-purple/10 border-brand-purple/20 hover:bg-brand-purple/15'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-brand-pink/15 flex items-center justify-center shrink-0 border border-brand-pink/10 mt-0.5">
                              {notif.type === 'live-class' ? (
                                <Video className="w-4 h-4 text-brand-pink" />
                              ) : (
                                <Bell className="w-4 h-4 text-brand-purple" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline gap-2">
                                <h5 className={`text-xs font-black truncate ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>
                                  {notif.title}
                                </h5>
                                {!notif.isRead && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-pink shrink-0"></span>
                                )}
                              </div>
                              <p className="text-[10px] text-brand-textMuted mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                              <span className="text-[8px] text-brand-textMuted/60 block mt-1">
                                {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-8 text-brand-textMuted text-xs italic">
                          All caught up! 🎉
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setHeaderDropdownOpen(!headerDropdownOpen)}
                className="flex items-center gap-2 sm:gap-3 bg-transparent sm:bg-brand-surface/40 hover:sm:bg-brand-surface/70 sm:border sm:border-brand-purple/15 sm:pl-2 sm:pr-3 sm:py-1.5 rounded-full text-white font-semibold transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-brand-purple/30 border border-brand-purple/40 flex items-center justify-center text-sm font-black text-white uppercase shadow-md shadow-brand-purple/10 shrink-0">
                  {profileData.name.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left shrink-0">
                  <span className="text-xs font-bold leading-tight block">{profileData.name}</span>
                  <span className="text-[9px] text-brand-textMuted leading-none block uppercase font-bold tracking-wider">Student</span>
                </div>
                <ChevronDown className="hidden sm:inline w-3.5 h-3.5 text-brand-textMuted shrink-0" />
              </button>

              {headerDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setHeaderDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-brand-surface border border-brand-purple/20 p-2 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                      <p className="text-[10px] font-bold text-brand-pink uppercase tracking-widest leading-none">Registered Email</p>
                      <p className="text-xs font-semibold text-white truncate mt-1">{profileData.email}</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab('profile'); setHeaderDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-brand-purple/20 hover:text-white rounded-xl transition-all text-left"
                    >
                      <User className="w-4 h-4 text-brand-pink" />
                      View Profile
                    </button>
                    <button
                      onClick={() => { setActiveTab('settings'); setHeaderDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-brand-purple/20 hover:text-white rounded-xl transition-all text-left"
                    >
                      <Settings className="w-4 h-4 text-brand-purple" />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-left mt-1 border-t border-white/5 pt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="min-h-full flex flex-col justify-between">
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* Left Column contents */}
              <div className="xl:col-span-9 space-y-8">
                
                {/* A. Welcome Banner & Streak Counter */}
                <div className="bg-gradient-to-r from-brand-violet to-[#140c5c] rounded-3xl p-6 sm:p-8 border border-brand-purple/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 blur-3xl rounded-full pointer-events-none"></div>
                  <div className="space-y-2 text-left">
                    <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome back, {profileData.name}! 👋</h1>
                    <p className="text-brand-textMuted text-sm">Keep pushing forward. You've got this!</p>
                    
                    {/* Inner Trophy Box */}
                    <div className="flex items-center gap-3.5 bg-brand-dark/40 border border-brand-purple/10 rounded-2xl p-4 mt-4">
                      <div className="w-11 h-11 rounded-xl bg-yellow-500/15 flex items-center justify-center text-xl shrink-0">
                        🏆
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-bold text-white">You're on a roll! 🔥</h4>
                        <p className="text-xs text-brand-textMuted">5 days in a row of learning. Great consistency!</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Learning Streak widget */}
                  <div className="bg-brand-dark/60 border border-brand-purple/20 py-3.5 px-6 rounded-2xl flex items-center gap-4 shrink-0 shadow-inner">
                    <div className="w-10 h-10 rounded-full bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center shrink-0">
                      <Flame className="w-6 h-6 text-brand-pink animate-bounce" />
                    </div>
                    <div className="text-left">
                      <span className="text-2xl font-black text-white block leading-tight">{stats.totalStreak} Days</span>
                      <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider">Learning Streak</span>
                    </div>
                  </div>
                </div>

                {/* B. Stat Cards (4 columns in a row) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: In-Progress Courses */}
                  <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between gap-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-black text-white">{stats.enrolledCount}</span>
                    </div>
                    <div>
                      <p className="text-xs text-brand-textMuted font-semibold">In-Progress Courses</p>
                      <button onClick={() => setActiveTab('courses')} className="text-[10px] text-brand-purple font-bold flex items-center gap-0.5 mt-2 hover:text-white transition-colors">
                        View all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Assignments Due */}
                  <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between gap-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-black text-white">{assignments.length}</span>
                    </div>
                    <div>
                      <p className="text-xs text-brand-textMuted font-semibold">Assignments Due</p>
                      <button onClick={() => setActiveTab('assignments')} className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-2 hover:text-white transition-colors">
                        View all <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Card 3: GPA */}
                  <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between gap-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink">
                        <Star className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-black text-white">{getGpaLabel(stats.avgTestScore)}</span>
                    </div>
                    <div>
                      <p className="text-xs text-brand-textMuted font-semibold">Current GPA</p>
                      <button onClick={() => setActiveTab('grades')} className="text-[10px] text-brand-pink font-bold flex items-center gap-0.5 mt-2 hover:text-white transition-colors">
                        View grades <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Card 4: Attendance */}
                  <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between gap-3 text-left">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <span className="text-2xl font-black text-white">{stats.attendanceRate ? `${stats.attendanceRate}%` : '100%'}</span>
                    </div>
                    <div>
                      <p className="text-xs text-brand-textMuted font-semibold">Attendance</p>
                      <button onClick={() => setActiveTab('calendar')} className="text-[10px] text-blue-400 font-bold flex items-center gap-0.5 mt-2 hover:text-white transition-colors">
                        View details <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* C. Middle Widgets (3 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
                  
                  {/* Widget 1: Today's Schedule */}
                  <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 xl:col-span-6 md:col-span-2 text-left flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                      <h3 className="font-extrabold text-white text-sm tracking-wide">Today's Schedule</h3>
                      <button onClick={() => setActiveTab('calendar')} className="text-[10px] text-brand-pink font-bold hover:underline">
                        View full calendar
                      </button>
                    </div>
                    <div className="space-y-3.5">
                      {getDynamicSchedule().length > 0 ? (
                        getDynamicSchedule().map((sched) => (
                          <div key={sched.id} className="flex items-center gap-4 bg-brand-surface/20 p-2.5 rounded-xl border border-white/5 hover:border-brand-purple/20 transition-all">
                            <div className="text-left shrink-0">
                              <span className={`text-[10px] ${sched.textLink} font-black block`}>{sched.start}</span>
                              <span className="text-[9px] text-brand-textMuted block">{sched.end}</span>
                            </div>
                            <div className={`w-[1.5px] h-6 ${sched.color} shrink-0`}></div>
                            <div className="text-left">
                              <h5 className="text-xs font-bold text-white">{sched.courseTitle}</h5>
                              <p className="text-[9px] text-brand-textMuted flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {sched.room}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-brand-textMuted text-xs italic">
                          No scheduled lectures today. Enroll in a course to build your timetable.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Widget 2: Upcoming Assignments */}
                  <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 xl:col-span-3 md:col-span-1 text-left flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                      <h3 className="font-extrabold text-white text-sm tracking-wide">Upcoming</h3>
                      <button onClick={() => setActiveTab('assignments')} className="text-[10px] text-brand-pink font-bold hover:underline">
                        View all
                      </button>
                    </div>
                    <div className="space-y-3 flex-1 flex flex-col justify-between">
                      {assignments.length > 0 ? (
                        assignments.slice(0, 4).map((asg, idx) => {
                          const icons = ['∫', 'Δ', '✎', '<>'];
                          const colors = [
                            'bg-brand-purple/20 text-brand-purple',
                            'bg-emerald-500/20 text-emerald-400',
                            'bg-yellow-500/20 text-yellow-400',
                            'bg-blue-500/20 text-blue-400'
                          ];
                          const icon = icons[idx % icons.length];
                          const color = colors[idx % colors.length];
                          const dueDateFormatted = asg.dueDate 
                            ? new Date(asg.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) 
                            : 'No due date';
                          return (
                            <div key={asg._id} className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-xs font-black shrink-0`}>
                                {icon}
                              </div>
                              <div className="text-left truncate">
                                <h5 className="text-xs font-bold text-white truncate">{asg.title}</h5>
                                <p className="text-[9px] text-brand-textMuted">Due {dueDateFormatted}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 text-brand-textMuted text-xs italic">
                          No upcoming assignments.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Widget 3: To Do Checklist */}
                  <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 xl:col-span-3 md:col-span-1 text-left flex flex-col justify-between">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                      <h3 className="font-extrabold text-white text-sm tracking-wide">To Do</h3>
                      <button onClick={() => setActiveTab('assignments')} className="text-[10px] text-brand-pink font-bold hover:underline">
                        View all
                      </button>
                    </div>
                    <div className="flex gap-2 mb-3 mt-1.5">
                      <input 
                        type="text" 
                        placeholder="Add new task..." 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            setTodoList([
                              ...todoList,
                              { id: Date.now(), text: e.target.value.trim(), due: 'Due Soon', completed: false }
                            ]);
                            e.target.value = '';
                          }
                        }}
                        className="flex-grow bg-brand-dark/50 border border-brand-purple/15 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-brand-pink"
                      />
                    </div>
                    <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                      {todoList.length > 0 ? (
                        todoList.map((todo) => (
                          <label key={todo.id} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={() => toggleTodo(todo.id)}
                              className="w-4 h-4 rounded-md border-brand-purple/40 bg-brand-surface text-brand-pink focus:ring-0 focus:ring-offset-0 cursor-pointer accent-brand-pink"
                            />
                            <div className="text-left flex-1 min-w-0">
                              <span className={`text-xs font-semibold block truncate leading-tight transition-all ${todo.completed ? 'line-through text-brand-textMuted/60' : 'text-gray-200 group-hover:text-white'}`}>
                                {todo.text}
                              </span>
                              <span className={`text-[9px] block leading-tight ${todo.due === 'Due Today' && !todo.completed ? 'text-red-400 font-bold' : 'text-brand-textMuted/70'}`}>
                                {todo.due}
                              </span>
                            </div>
                          </label>
                        ))
                      ) : (
                        <div className="text-center py-6 text-brand-textMuted text-xs italic">
                          Your checklist is empty.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* D. Continue Learning (Course Grid) */}
                <div className="space-y-5 text-left">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-brand-pink" /> Continue Learning
                    </h3>
                    <button onClick={() => setActiveTab('courses')} className="text-xs text-brand-purple font-bold hover:underline">
                      View all courses
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {filteredEnrollments.length > 0 ? (
                      filteredEnrollments.map((enroll) => (
                        <div
                          key={enroll._id}
                          className="bg-brand-surface/40 hover:bg-brand-surface/60 rounded-2xl border border-brand-purple/15 overflow-hidden flex flex-col justify-between h-[290px] hover:border-brand-pink/40 hover:shadow-lg hover:shadow-brand-purple/5 transition-all group"
                        >
                          {/* Course Cover SVG */}
                          <div className="h-28 w-full relative overflow-hidden border-b border-brand-purple/10 shrink-0">
                            {renderCourseThumbnail(enroll.course?.slug, enroll.course?.thumbnail, enroll.course?.lessons)}
                          </div>
                          
                          {/* Card Content info */}
                          <div className="p-5 flex-grow flex flex-col justify-between">
                            <div>
                              <h3 className="text-base font-extrabold text-white line-clamp-1 leading-snug group-hover:text-brand-pink transition-colors">
                                {enroll.course?.title}
                              </h3>
                              <p className="text-xs text-brand-textMuted mt-1 font-semibold">{enroll.course?.subject}</p>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-2 mt-4">
                              <div className="flex justify-between text-xs text-brand-textMuted font-bold">
                                <span>Lecture Completion</span>
                                <span className="text-white">{enroll.progressPercent}%</span>
                              </div>
                              <div className="w-full h-2 bg-brand-dark rounded-full overflow-hidden border border-white/5">
                                <div
                                  className="h-full bg-gradient-to-r from-brand-pink to-brand-purple"
                                  style={{ width: `${enroll.progressPercent}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Hover action bar */}
                          <Link
                            to={`/student/courses/${enroll.course?.slug}`}
                            className="w-full bg-brand-purple/10 hover:bg-brand-purple/20 text-center text-xs font-bold py-2.5 border-t border-brand-purple/10 flex justify-center items-center gap-1 text-brand-purple hover:text-white transition-all shrink-0"
                          >
                            Resume Learning <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-10 text-center bg-brand-surface/20 rounded-2xl border border-brand-purple/10 border-dashed">
                        <p className="text-sm text-brand-textMuted">No matching courses found in classroom.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Right Column: Widgets */}
              <div className="xl:col-span-3 space-y-6">
                
                {/* Widget 1: Student Profile Summary */}
                <div className="glass-card rounded-2xl border border-brand-purple/15 p-6 text-center space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-pink/5 blur-2xl rounded-full pointer-events-none"></div>
                  
                  {/* Large Avatar Badge */}
                  <div className="relative w-20 h-20 mx-auto group">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-brand-pink to-brand-purple flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-brand-purple/20 relative z-10 border-2 border-brand-surface">
                      {profileData.name.charAt(0)}
                    </div>
                    {/* Glow Ring */}
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-brand-pink to-brand-purple opacity-40 blur-md group-hover:opacity-75 transition duration-300"></div>
                    
                    {/* Edit Pencil Overlay */}
                    <button onClick={() => setActiveTab('profile')} className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-brand-dark hover:bg-brand-pink border border-brand-purple/35 flex items-center justify-center text-white text-[10px] z-20 shadow-md transition-colors">
                      ✏️
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-white leading-tight capitalize">{profileData.name}</h3>
                    <p className="text-xs text-brand-textMuted font-bold leading-normal">{profileData.major}</p>
                    <p className="text-[10px] text-brand-textMuted/70 font-semibold uppercase tracking-wider leading-none mt-1">{profileData.year}</p>
                  </div>

                  <button
                    onClick={() => setActiveTab('profile')}
                    className="w-full btn-secondary py-2 text-xs flex justify-center items-center gap-1.5 shadow-sm"
                  >
                    View Profile
                  </button>
                </div>

                {/* Widget 2: Month Browser Calendar */}
                <div className="glass-card rounded-2xl border border-brand-purple/15 p-4 space-y-4">
                  
                  {/* Month Switcher Head */}
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h4 className="font-extrabold text-sm text-white">
                      {monthsList[calendarMonth]} {calendarYear}
                    </h4>
                    <div className="flex items-center gap-1 bg-brand-dark/40 border border-white/5 rounded-lg p-0.5">
                      <button onClick={handlePrevMonth} className="p-1 hover:text-brand-pink hover:bg-white/5 rounded transition-all">
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={handleNextMonth} className="p-1 hover:text-brand-pink hover:bg-white/5 rounded transition-all">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid Table */}
                  <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center">
                    {/* Days Name Header */}
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                      <span key={idx} className="text-[9px] font-black text-brand-textMuted/60 uppercase">
                        {d}
                      </span>
                    ))}

                    {/* Pre-spaces of month start */}
                    {Array.from({ length: startDayOfMonth(calendarMonth, calendarYear) }).map((_, idx) => (
                      <span key={`empty-${idx}`}></span>
                    ))}

                    {/* Day numbers */}
                    {Array.from({ length: daysInMonth(calendarMonth, calendarYear) }).map((_, idx) => {
                      const dayNumber = idx + 1;
                      const isSelected = calendarMonth === 4 && calendarYear === 2024 && dayNumber === selectedCalendarDate;
                      
                      // Highlight random active indicator dates
                      const hasEvent = [5, 12, 14, 21, 24, 28].includes(dayNumber) && calendarMonth === 4;

                      return (
                        <button
                          key={`day-${dayNumber}`}
                          onClick={() => setSelectedCalendarDate(dayNumber)}
                          className={`relative text-[10px] font-bold w-6 h-6 mx-auto rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-gradient-to-tr from-brand-pink to-brand-purple text-white shadow-md shadow-brand-pink/20'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span>{dayNumber}</span>
                          {hasEvent && !isSelected && (
                            <span className="absolute bottom-0.5 w-1 h-1 bg-brand-pink rounded-full"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Widget 3: Recent Platform Updates */}
                <div className="glass-card rounded-2xl border border-brand-purple/15 p-5 space-y-4 text-left">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <h4 className="font-extrabold text-sm text-white">Recent Updates</h4>
                  </div>
                  
                  <div className="space-y-4">
                    {getRecentUpdates().length > 0 ? (
                      getRecentUpdates().map((upd) => (
                        <div key={upd.id} className="flex items-start gap-3.5 group">
                          <div className="w-8 h-8 rounded-lg bg-brand-pink/15 flex items-center justify-center shrink-0 border border-brand-pink/10">
                            <FileText className="w-4 h-4 text-brand-pink" />
                          </div>
                          <div className="text-left min-w-0">
                            <h5 className="text-xs font-bold text-gray-200 group-hover:text-white truncate transition-colors">{upd.title}</h5>
                            <span className="text-[9px] text-brand-textMuted block">{upd.date}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-brand-textMuted text-xs italic">
                        No recent updates recorded.
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MY COURSES VIEW */}
          {activeTab === 'courses' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-white">My Enrolled Courses</h1>
                  <p className="text-sm text-brand-textMuted mt-1">Access lectures and classroom material for your ongoing batches.</p>
                </div>
                <Link to="/courses" className="btn-primary py-2 px-5 text-xs">
                  Browse Catalog
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEnrollments.map((enroll) => (
                  <div key={enroll._id} className="bg-brand-surface/40 hover:bg-brand-surface/60 rounded-2xl border border-brand-purple/15 overflow-hidden flex flex-col justify-between h-[290px] group transition-all">
                    <div className="h-28 w-full relative overflow-hidden border-b border-brand-purple/10 shrink-0">
                      {renderCourseThumbnail(enroll.course?.slug, enroll.course?.thumbnail, enroll.course?.lessons)}
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-extrabold text-white line-clamp-1 leading-snug group-hover:text-brand-pink transition-colors">
                          {enroll.course?.title}
                        </h3>
                        <p className="text-xs text-brand-textMuted mt-1 font-semibold">{enroll.course?.subject}</p>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs text-brand-textMuted font-bold">
                          <span>Lecture Completion</span>
                          <span className="text-white">{enroll.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-brand-dark rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-brand-pink to-brand-purple" style={{ width: `${enroll.progressPercent}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/student/courses/${enroll.course?.slug}`}
                      className="w-full bg-brand-purple/10 hover:bg-brand-purple/20 text-center text-xs font-bold py-2.5 border-t border-brand-purple/10 flex justify-center items-center gap-1 text-brand-purple hover:text-white transition-all shrink-0"
                    >
                      Resume Learning <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ASSIGNMENTS VIEW */}
          {activeTab === 'assignments' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-black text-white">Assignments & Tasks</h1>
                <p className="text-sm text-brand-textMuted mt-1">Submit responses, check evaluation metrics, and review homework templates.</p>
              </div>

              <div className="glass-card rounded-2xl border border-brand-purple/15 p-6">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-bold text-brand-pink uppercase tracking-widest bg-brand-violet/10">
                        <th className="p-4 rounded-l-xl whitespace-nowrap pr-4">Subject Batch</th>
                        <th className="p-4 whitespace-nowrap pr-4">Assignment Description</th>
                        <th className="p-4 whitespace-nowrap pr-4">Submission Period</th>
                        <th className="p-4 text-center whitespace-nowrap pr-4">Status</th>
                        <th className="p-4 text-right rounded-r-xl whitespace-nowrap">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {assignments.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center p-6 text-brand-textMuted">No assignments posted for your courses.</td>
                        </tr>
                      ) : (
                        assignments.map((asg) => {
                          const studentIdVal = user?._id || user?.id;
                          const userSubmission = asg.submissions?.find(sub => 
                            (sub.student?._id === studentIdVal || sub.student === studentIdVal)
                          );
                          const status = userSubmission 
                            ? (userSubmission.isGraded ? 'Graded' : 'Submitted') 
                            : 'Pending';
                          return (
                            <tr key={asg._id} className="hover:bg-brand-surface/20 transition-all">
                              <td className="p-4 font-bold text-white whitespace-nowrap pr-4">{asg.course?.title || 'General'}</td>
                              <td className="p-4 min-w-[250px] pr-4">
                                <div className="font-semibold text-white whitespace-nowrap">{asg.title}</div>
                                <div className="text-xs text-brand-textMuted mt-1 whitespace-normal">{asg.description}</div>
                              </td>
                              <td className="p-4 text-xs text-brand-textMuted whitespace-nowrap pr-4">
                                {asg.dueDate ? new Date(asg.dueDate).toLocaleString() : 'N/A'}
                              </td>
                              <td className="p-4 text-center whitespace-nowrap pr-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                  status === 'Graded'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : status === 'Submitted'
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                  {status}
                                </span>
                              </td>
                              <td className="p-4 text-right whitespace-nowrap">
                                {status === 'Graded' ? (
                                  <div className="text-right">
                                    <div className="text-emerald-400 font-bold text-xs">Score: {userSubmission.grade} / {asg.totalMarks}</div>
                                    {userSubmission.feedback && <div className="text-[10px] text-brand-textMuted mt-0.5">Feedback: {userSubmission.feedback}</div>}
                                  </div>
                                ) : status === 'Submitted' ? (
                                  <span className="text-xs font-semibold text-brand-textMuted">Awaiting Grading</span>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      setSelectedAsgForSubmission(asg);
                                      setShowSubmitModal(true);
                                    }} 
                                    className="btn-primary py-1 px-3 text-xs inline-flex font-bold"
                                  >
                                    Submit
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GRADES VIEW */}
          {activeTab === 'grades' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-black text-white">Academic Grades & Performance</h1>
                <p className="text-sm text-brand-textMuted mt-1">Review mock test records, GPA projections, and overall ranking details.</p>
              </div>

              {/* GPA overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-brand-purple/15 text-center space-y-2">
                  <span className="text-brand-textMuted text-xs font-bold uppercase tracking-wider block">Estimated Grade Avg</span>
                  <span className="text-4xl font-black text-white block">
                    {results.length > 0 
                      ? `${Math.round(results.reduce((acc, r) => acc + r.percentageScore, 0) / results.length)}%` 
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-brand-purple/15 text-center space-y-2">
                  <span className="text-brand-textMuted text-xs font-bold uppercase tracking-wider block">Completed Exams</span>
                  <span className="text-4xl font-black text-emerald-400 block">{results.length} Tests</span>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-brand-purple/15 text-center space-y-2">
                  <span className="text-brand-textMuted text-xs font-bold uppercase tracking-wider block">Completed Assignments</span>
                  <span className="text-4xl font-black text-brand-pink block">
                    {assignments.filter(asg => 
                      asg.submissions?.some(sub => {
                        const studentIdVal = user?._id || user?.id;
                        return (sub.student?._id === studentIdVal || sub.student === studentIdVal);
                      })
                    ).length} / {assignments.length}
                  </span>
                </div>
              </div>

              <div className="glass-card rounded-2xl border border-brand-purple/15 p-6">
                <h3 className="font-extrabold text-white text-base mb-4">Mock Test results</h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-bold text-brand-pink uppercase tracking-widest bg-brand-violet/10">
                        <th className="p-4 rounded-l-xl whitespace-nowrap pr-4">Test Name</th>
                        <th className="p-4 whitespace-nowrap pr-4">Course Section</th>
                        <th className="p-4 text-center whitespace-nowrap pr-4">Score obtained</th>
                        <th className="p-4 text-center whitespace-nowrap pr-4">Percentile</th>
                        <th className="p-4 text-center rounded-r-xl whitespace-nowrap">Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {results.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center p-6 text-brand-textMuted">No test results available yet.</td>
                        </tr>
                      ) : (
                        results.map((res) => (
                          <tr key={res._id} className="hover:bg-brand-surface/20 transition-all">
                            <td className="p-4 font-bold text-white whitespace-nowrap pr-4">{res.test?.title}</td>
                            <td className="p-4 whitespace-nowrap pr-4">{res.test?.course?.title || 'Course'}</td>
                            <td className="p-4 text-center whitespace-nowrap pr-4">{res.scoreObtained} / {res.test?.totalMarks}</td>
                            <td className="p-4 text-center whitespace-nowrap pr-4">{res.percentageScore}%</td>
                            <td className={`p-4 text-center font-bold whitespace-nowrap ${res.isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
                              {res.isPassed ? 'Passed' : 'Failed'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CALENDAR VIEW */}
          {activeTab === 'calendar' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-white">Academic Calendar</h1>
                  <p className="text-sm text-brand-textMuted mt-1">Review scheduled doubts lectures, exam periods, and assignment deadlines.</p>
                </div>
                <div className="flex items-center gap-2 bg-brand-surface/60 border border-brand-purple/20 rounded-xl p-1 shrink-0">
                  <button onClick={handlePrevMonth} className="p-2 hover:text-brand-pink hover:bg-white/5 rounded-lg transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-sm text-white px-3">
                    {monthsList[calendarMonth]} {calendarYear}
                  </span>
                  <button onClick={handleNextMonth} className="p-2 hover:text-brand-pink hover:bg-white/5 rounded-lg transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Main Calendar Month Table */}
                <div className="glass-card rounded-2xl border border-brand-purple/15 p-6 lg:col-span-8">
                  <div className="grid grid-cols-7 gap-4 text-center">
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, idx) => (
                      <span key={idx} className="text-xs font-black text-brand-pink uppercase tracking-widest pb-3 border-b border-white/5">
                        {d.substring(0, 3)}
                      </span>
                    ))}

                    {/* Pre-spaces */}
                    {Array.from({ length: startDayOfMonth(calendarMonth, calendarYear) }).map((_, idx) => (
                      <div key={`cal-empty-${idx}`} className="h-16 sm:h-20 border border-white/5 bg-white/1 flex items-center justify-center opacity-25"></div>
                    ))}

                    {/* Month Days */}
                    {Array.from({ length: daysInMonth(calendarMonth, calendarYear) }).map((_, idx) => {
                      const dayNumber = idx + 1;
                      const isSelected = calendarMonth === 4 && calendarYear === 2024 && dayNumber === selectedCalendarDate;
                      const hasEvent = [5, 12, 14, 21, 24, 28].includes(dayNumber) && calendarMonth === 4;

                      return (
                        <button
                          key={`cal-day-${dayNumber}`}
                          onClick={() => setSelectedCalendarDate(dayNumber)}
                          className={`h-16 sm:h-20 border border-white/5 p-2 rounded-xl flex flex-col justify-between items-start transition-all ${
                            isSelected
                              ? 'bg-gradient-to-tr from-brand-pink/20 to-brand-purple/20 border-brand-pink'
                              : 'bg-brand-surface/20 hover:bg-white/5'
                          }`}
                        >
                          <span className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-brand-pink text-white' : 'text-gray-300'}`}>
                            {dayNumber}
                          </span>
                          {hasEvent && (
                            <span className="w-2.5 h-2.5 bg-brand-pink rounded-full self-end animate-pulse"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right side Event panel list */}
                <div className="glass-card rounded-2xl border border-brand-purple/15 p-6 lg:col-span-4 space-y-4">
                  <h3 className="font-extrabold text-white text-base border-b border-white/5 pb-2">
                    Events on May {selectedCalendarDate}, 2024
                  </h3>
                  <div className="space-y-4">
                    {selectedCalendarDate === 21 ? (
                      <>
                        <div className="bg-brand-surface/40 p-3 rounded-xl border border-brand-purple/10 space-y-1">
                          <span className="text-[10px] text-brand-pink font-bold block">09:00 AM - 10:00 AM</span>
                          <h5 className="text-xs font-bold text-white">Calculus II: Fourier Integrals</h5>
                          <span className="text-[9px] text-brand-textMuted block"><MapPin className="w-3 h-3 inline mr-1" />Room 201</span>
                        </div>
                        <div className="bg-brand-surface/40 p-3 rounded-xl border border-brand-purple/10 space-y-1">
                          <span className="text-[10px] text-blue-400 font-bold block">11:00 AM - 12:00 PM</span>
                          <h5 className="text-xs font-bold text-white">Physics I: Coulomb Fields Lab</h5>
                          <span className="text-[9px] text-brand-textMuted block"><MapPin className="w-3 h-3 inline mr-1" />Room 305</span>
                        </div>
                      </>
                    ) : selectedCalendarDate === 24 ? (
                      <div className="bg-brand-surface/40 p-3 rounded-xl border border-brand-purple/10 space-y-1">
                        <span className="text-[10px] text-red-400 font-bold block">05:00 PM Deadline</span>
                        <h5 className="text-xs font-bold text-white">Coulomb Field Vectors Lab report submission</h5>
                      </div>
                    ) : (
                      <p className="text-xs text-brand-textMuted py-4">No scheduled lectures or submissions on this date.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: MESSAGES VIEW */}
          {activeTab === 'messages' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300 h-[600px] flex flex-col justify-between">
              <div>
                <h1 className="text-2xl font-black text-white">Messages & doubts</h1>
                <p className="text-sm text-brand-textMuted mt-1">Communicate directly with your class professors and get homework query resolutions.</p>
              </div>

              {chats.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-brand-surface/20 border border-brand-purple/15 rounded-2xl overflow-hidden flex-grow">
                  {/* Left conversations column */}
                  <div className="md:col-span-4 border-r border-brand-purple/10 flex flex-col">
                    <div className="p-4 border-b border-brand-purple/10">
                      <h3 className="font-extrabold text-white text-sm">Instructors</h3>
                    </div>
                    <div className="divide-y divide-white/5 overflow-y-auto flex-1">
                      {chats.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => setActiveChat(chat.id)}
                          className={`w-full p-4 text-left flex items-center gap-3.5 transition-all ${
                            activeChat === chat.id
                              ? 'bg-brand-purple/20'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-pink to-brand-purple flex items-center justify-center font-bold text-white">
                            {chat.avatar}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-extrabold text-white truncate">{chat.instructor}</h5>
                            <p className="text-[10px] text-brand-textMuted truncate mt-0.5">
                              {chat.messages[chat.messages.length - 1].text}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right chat thread column */}
                  <div className="md:col-span-8 flex flex-col justify-between h-[450px] md:h-full bg-brand-dark/20">
                    {/* Chat header */}
                    <div className="p-4 border-b border-brand-purple/10 bg-[#0F0052]/20">
                      <h4 className="text-xs font-extrabold text-white">{chats[activeChat]?.instructor}</h4>
                      <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span> Active now
                      </span>
                    </div>

                    {/* Messages container list */}
                    <div className="p-4 flex-1 overflow-y-auto space-y-4">
                      {chats[activeChat]?.messages?.map((msg, idx) => {
                        const isStudent = msg.sender === 'student';
                        return (
                          <div key={idx} className={`flex ${isStudent ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3.5 rounded-2xl text-xs space-y-1 ${
                              isStudent
                                ? 'bg-gradient-to-r from-brand-pink to-brand-purple text-white rounded-tr-none'
                                : 'bg-brand-surface border border-brand-purple/10 text-gray-200 rounded-tl-none'
                            }`}>
                              <p className="leading-relaxed">{msg.text}</p>
                              <span className="text-[8px] text-white/50 block text-right">{msg.time}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat input box footer */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-brand-purple/10 bg-[#0F0052]/20 flex gap-3">
                      <input
                        type="text"
                        placeholder="Type your doubts here..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="bg-brand-dark/40 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-brand-pink flex-grow"
                      />
                      <button type="submit" className="btn-primary p-2.5 shrink-0 rounded-xl">
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="bg-brand-surface/20 border border-brand-purple/15 rounded-2xl p-8 text-center text-brand-textMuted text-xs italic py-16">
                  No direct conversations started with instructors yet. You can interact with course materials in the classroom.
                </div>
              )}
            </div>
          )}

          {/* TAB 7: RESOURCES VIEW */}
          {activeTab === 'resources' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-black text-white">Study Materials & Notes</h1>
                <p className="text-sm text-brand-textMuted mt-1">Download reference PDFs, lecture worksheets, and formulas lists.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 text-left flex flex-col justify-between h-[160px]">
                  <div className="space-y-2">
                    <span className="text-[9px] text-brand-pink font-bold uppercase tracking-wider bg-brand-pink/10 px-2 py-0.5 rounded border border-brand-pink/20">Physics I</span>
                    <h4 className="text-sm font-extrabold text-white mt-2">Coulomb field vectors & force calculations worksheet</h4>
                  </div>
                  <button onClick={() => alert("Mock File downloading...")} className="btn-secondary py-2 text-xs w-full flex justify-center items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-brand-pink" /> Download PDF
                  </button>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 text-left flex flex-col justify-between h-[160px]">
                  <div className="space-y-2">
                    <span className="text-[9px] text-brand-purple font-bold uppercase tracking-wider bg-brand-purple/10 px-2 py-0.5 rounded border border-brand-purple/20">Calculus II</span>
                    <h4 className="text-sm font-extrabold text-white mt-2">Fourier integrals & Linear spaces reference formulae</h4>
                  </div>
                  <button onClick={() => alert("Mock File downloading...")} className="btn-secondary py-2 text-xs w-full flex justify-center items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-brand-purple" /> Download PDF
                  </button>
                </div>

                <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 text-left flex flex-col justify-between h-[160px]">
                  <div className="space-y-2">
                    <span className="text-[9px] text-yellow-400 font-bold uppercase tracking-wider bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">Literature</span>
                    <h4 className="text-sm font-extrabold text-white mt-2">Macbeth analysis essay references and quotes templates</h4>
                  </div>
                  <button onClick={() => alert("Mock File downloading...")} className="btn-secondary py-2 text-xs w-full flex justify-center items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-yellow-400" /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LIVE CLASSES VIEW */}
          {activeTab === 'live' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h1 className="text-2xl font-black text-white">Live Classes</h1>
                  <p className="text-sm text-brand-textMuted mt-1">Join scheduled interactive lectures and doubt-clearing sessions.</p>
                </div>
                <div className="flex items-center gap-2 bg-brand-dark/40 border border-brand-purple/15 rounded-xl px-3 py-2 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider">{liveSessions.filter(s => s.status !== 'Completed').length} Scheduled</span>
                </div>
              </div>

              {/* Active Scheduled Rooms */}
              <div className="glass-card rounded-2xl border border-brand-purple/15 p-4 sm:p-5 space-y-4">
                <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2">Active Scheduled Rooms</h3>
                <div className="space-y-3">
                  {liveSessions.filter(s => s.status !== 'Completed').length > 0 ? (
                    liveSessions.filter(s => s.status !== 'Completed').map((session) => {
                      const isToday = session.date === new Date().toISOString().split('T')[0];
                      return (
                        <div key={session._id || session.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 p-4 bg-brand-surface/30 border border-brand-purple/10 rounded-2xl hover:border-brand-purple/25 transition-all group">
                          <div className="flex gap-3 sm:gap-4 items-start sm:items-center flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-brand-pink/15 flex items-center justify-center text-brand-pink shrink-0">
                              <Video className="w-5 h-5" />
                            </div>
                            <div className="text-left min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-black text-white truncate">{session.title}</h4>
                                {isToday && (
                                  <span className="text-[8px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">Today</span>
                                )}
                              </div>
                              <p className="text-[10px] text-brand-textMuted mt-0.5 truncate">
                                {typeof session.course === 'object' ? session.course?.title : session.course} • {session.instructor?.name || 'Prof. Academy'} • {session.duration} mins
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end pl-13 sm:pl-0 shrink-0">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-brand-pink font-bold block">{session.date}</span>
                              <span className="text-[9px] text-brand-textMuted block">{session.time}</span>
                            </div>
                            <button 
                              onClick={() => navigate(`/meeting/${session.meetingId}`)} 
                              className="bg-gradient-to-r from-brand-pink to-brand-purple text-white text-[10px] font-bold px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-md shadow-brand-pink/15 flex items-center gap-1.5"
                            >
                              <Video className="w-3 h-3" /> Join Room
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center mx-auto">
                        <Video className="w-6 h-6 text-brand-purple/50" />
                      </div>
                      <p className="text-xs text-brand-textMuted font-semibold">No live classes scheduled</p>
                      <p className="text-[10px] text-brand-textMuted/60">Your instructors will schedule live sessions here for your enrolled courses.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Past Classes & Recordings */}
              <div className="glass-card rounded-2xl border border-brand-purple/15 p-4 sm:p-5 space-y-4">
                <h3 className="font-extrabold text-white text-sm border-b border-white/5 pb-2">Past Classes & Recordings</h3>
                <div className="space-y-3">
                  {liveSessions.filter(s => s.status === 'Completed').length > 0 ? (
                    liveSessions.filter(s => s.status === 'Completed').map((session) => (
                      <div key={session._id || session.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 p-4 bg-[#0A004C]/30 border border-brand-purple/10 rounded-2xl hover:border-brand-purple/20 transition-all">
                        <div className="flex gap-4 items-center min-w-0 flex-1 text-left">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                            <Video className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-black text-white truncate">{session.title}</h4>
                            <p className="text-[10px] text-brand-textMuted mt-0.5 truncate">
                              {typeof session.course === 'object' ? session.course?.title : session.course} • {session.instructor?.name || 'Prof. Academy'} • {session.duration} mins
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 justify-between sm:justify-end pl-14 sm:pl-0 shrink-0">
                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-brand-pink font-bold block">{session.date}</span>
                            <span className="text-[9px] text-brand-textMuted block">{session.time}</span>
                          </div>
                          {session.recordingUrl ? (
                            <button
                              onClick={() => setRecordingUrl(session.recordingUrl)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                            >
                              Watch Recording
                            </button>
                          ) : (
                            <span className="text-[10px] text-brand-textMuted italic font-semibold">Processing...</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-brand-textMuted text-xs italic">
                      No recorded live classes available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: PROFILE VIEW */}
          {activeTab === 'profile' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-black text-white">Student Profile Settings</h1>
                <p className="text-sm text-brand-textMuted mt-1">Review registrations details, majors, and academic bio details.</p>
              </div>

              <div className="glass-card rounded-2xl border border-brand-purple/15 p-6 max-w-2xl">
                <form onSubmit={handleProfileSave} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-xs text-brand-textMuted font-bold uppercase">Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full bg-brand-dark/40 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-pink"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-brand-textMuted font-bold uppercase">Registered Email</label>
                      <input
                        disabled
                        type="email"
                        value={profileData.email}
                        className="w-full bg-brand-dark/20 border border-white/5 text-brand-textMuted/50 rounded-xl px-4 py-2.5 text-xs cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-brand-textMuted font-bold uppercase">Academic Major</label>
                      <input
                        type="text"
                        value={profileData.major}
                        onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                        className="w-full bg-brand-dark/40 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-pink"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-brand-textMuted font-bold uppercase">Academic Year</label>
                      <input
                        type="text"
                        value={profileData.year}
                        onChange={(e) => setProfileData({ ...profileData, year: e.target.value })}
                        className="w-full bg-brand-dark/40 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-pink"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-brand-textMuted font-bold uppercase">Contact Telephone</label>
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full bg-brand-dark/40 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-pink"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-brand-textMuted font-bold uppercase">Profile Bio</label>
                    <textarea
                      rows="4"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="w-full bg-brand-dark/40 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-pink"
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-primary w-full py-3 text-xs font-bold">
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS VIEW */}
          {activeTab === 'settings' && (
            <div className="space-y-6 text-left animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-black text-white">Platform Settings</h1>
                <p className="text-sm text-brand-textMuted mt-1">Configure notification triggers, system preferences, and security accounts.</p>
              </div>

              <div className="glass-card rounded-2xl border border-brand-purple/15 p-6 max-w-xl space-y-6">
                <div className="space-y-4">
                  <h3 className="font-extrabold text-white text-base border-b border-white/5 pb-2">Preferences</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">Email Notifications</h5>
                      <p className="text-[10px] text-brand-textMuted">Receive emails about assignments updates, test grades, and doubt replies.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-brand-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-pink"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">Dark Mode system</h5>
                      <p className="text-[10px] text-brand-textMuted">Keep theme dark or sync with desktop preferences settings.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-brand-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-pink"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="font-extrabold text-white text-base pb-2">Change Password</h3>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-brand-textMuted font-bold uppercase">Old Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-brand-dark/40 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-pink"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-brand-textMuted font-bold uppercase">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-brand-dark/40 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-pink"
                      />
                    </div>
                    <button onClick={() => alert("Password modified successfully!")} className="btn-secondary w-full py-2.5 text-xs font-bold">
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

            </div>
            <Footer />
          </div>
        </main>
      </div>

      {/* Submit Assignment Modal */}
      {showSubmitModal && selectedAsgForSubmission && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F0052] border border-brand-purple/20 rounded-3xl p-6 w-full max-w-md space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-base font-extrabold text-white">Submit Assignment</h3>
              <button 
                onClick={() => { setShowSubmitModal(false); setSelectedFile(null); setSubmitComment(''); }} 
                className="text-brand-textMuted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-1 text-left">
              <h4 className="text-xs font-bold text-brand-pink uppercase">Assignment Details</h4>
              <p className="text-sm font-extrabold text-white">{selectedAsgForSubmission.title}</p>
              <p className="text-xs text-brand-textMuted">{selectedAsgForSubmission.description}</p>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] text-brand-textMuted font-bold uppercase block">Upload Solution File</label>
                <div className="border border-brand-purple/15 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-brand-pink transition-all relative">
                  <input 
                    type="file" 
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Plus className="w-6 h-6 text-brand-textMuted mx-auto mb-2" />
                  <span className="text-[10px] text-brand-textMuted font-bold uppercase block">
                    {selectedFile ? selectedFile.name : "Select solution file (PDF, Doc, Image)"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-brand-textMuted font-bold uppercase block font-semibold">Comments for Instructor</label>
                <textarea 
                  rows="3"
                  value={submitComment}
                  onChange={(e) => setSubmitComment(e.target.value)}
                  placeholder="Ask a question or describe your solution..."
                  className="w-full bg-brand-dark border border-brand-purple/20 text-white rounded-xl py-2 px-3 focus:outline-none focus:border-brand-pink text-xs"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button"
                  onClick={() => { setShowSubmitModal(false); setSelectedFile(null); setSubmitComment(''); }}
                  className="bg-brand-dark border border-brand-purple/20 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  {submitting ? 'Submitting...' : 'Upload & Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Playback Modal */}
      {recordingUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0F0052] border border-brand-purple/20 rounded-3xl p-6 w-full max-w-4xl space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-400" /> Class Recording Playback
              </h3>
              <button 
                onClick={() => setRecordingUrl(null)} 
                className="text-brand-textMuted hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-brand-purple/10">
              <video 
                src={recordingUrl} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <p className="text-xs text-brand-textMuted">
                This recording is provided for offline review and course preparation.
              </p>
              <button 
                onClick={() => setRecordingUrl(null)}
                className="bg-brand-dark hover:bg-white/5 border border-brand-purple/20 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                Close Playback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
