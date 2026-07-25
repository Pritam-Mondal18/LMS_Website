import { useEffect, useState, Fragment } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { logoutUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import Footer from '../../components/common/Footer';
import Logo from '../../components/common/Logo';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CircleDollarSign,
  ShieldAlert,
  Award,
  Ban,
  CheckCircle,
  Calendar,
  FileText,
  MessageSquare,
  FolderOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Download,
  Check,
  ArrowRight,
  Activity,
  Bell
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sidebar controls
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);

  // Active view tab state
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('student');
  const [visibleCount, setVisibleCount] = useState(5);

  // Live data states
  const [usersList, setUsersList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [enrollmentsList, setEnrollmentsList] = useState([]);
  const [assignmentsList, setAssignmentsList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [blogsList, setBlogsList] = useState([]);
  const [liveClassesList, setLiveClassesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    pendingTeachers: 0,
    totalEnrollments: 0,
    successfulPaymentsCount: 0,
    pendingPaymentsCount: 0,
    pendingPaymentsAmount: 0,
    refundedPaymentsCount: 0,
    refundedPaymentsAmount: 0,
    categoryStats: []
  });

  const [showTeachersInCard1, setShowTeachersInCard1] = useState(false);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([]);
  const [studentGrowthData, setStudentGrowthData] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);

  // Live tickets and settings state
  const [ticketsList, setTicketsList] = useState([]);
  const [seenTicketIds, setSeenTicketIds] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_seen_ticket_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [settings, setSettings] = useState({
    academyName: "Sumit Chakraborty Academy",
    supportEmail: "pritam18official@gmail.com",
    supportPhone: "+91 98765 43210",
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "pritam18official@gmail.com",
    smtpPass: "",
    enableRegister: true,
    maintenanceMode: false,
  });

  const getStatusColor = (status) => {
    if (status === 'Open') return 'bg-red-500/10 text-red-400 border border-red-500/20';
    if (status === 'In Progress') return 'bg-brand-purple/20 text-brand-purple border border-brand-purple/35';
    return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'; // Resolved
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'text-red-400';
    if (priority === 'Medium') return 'text-yellow-500';
    return 'text-emerald-400'; // Low
  };

  const fetchAdminData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const statsRes = await api.get('/admin/stats');
      if (statsRes.data.success) {
        setStats({
          totalUsers: statsRes.data.stats?.totalStudents ?? 0,
          totalTeachers: statsRes.data.stats?.totalTeachers ?? 0,
          totalCourses: statsRes.data.stats?.totalCourses ?? 0,
          totalRevenue: statsRes.data.stats?.totalRevenue ?? 0,
          pendingTeachers: statsRes.data.stats?.pendingTeachers ?? 0,
          totalEnrollments: statsRes.data.stats?.totalEnrollments ?? 0,
          successfulPaymentsCount: statsRes.data.stats?.successfulPaymentsCount ?? 0,
          pendingPaymentsCount: statsRes.data.stats?.pendingPaymentsCount ?? 0,
          pendingPaymentsAmount: statsRes.data.stats?.pendingPaymentsAmount ?? 0,
          refundedPaymentsCount: statsRes.data.stats?.refundedPaymentsCount ?? 0,
          refundedPaymentsAmount: statsRes.data.stats?.refundedPaymentsAmount ?? 0,
          categoryStats: statsRes.data.stats?.categoryStats ?? []
        });
        setMonthlyRevenueData(statsRes.data.charts?.monthlyRevenue || []);
        setStudentGrowthData(statsRes.data.charts?.studentGrowth || []);
        setRecentStudents(statsRes.data.recentStudents || []);
        setRecentPayments(statsRes.data.recentPayments || []);
      }

      const usersRes = await api.get('/admin/users');
      if (usersRes.data.success) {
        setUsersList(usersRes.data.users || []);
      }

      const coursesRes = await api.get('/admin/courses');
      if (coursesRes.data.success) {
        setCoursesList(coursesRes.data.courses || []);
      }

      const enrollmentsRes = await api.get('/admin/enrollments');
      if (enrollmentsRes.data.success) {
        setEnrollmentsList(enrollmentsRes.data.enrollments || []);
      }

      const assignmentsRes = await api.get('/admin/assignments');
      if (assignmentsRes.data.success) {
        setAssignmentsList(assignmentsRes.data.assignments || []);
      }

      const paymentsRes = await api.get('/admin/payments');
      if (paymentsRes.data.success) {
        setPaymentsList(paymentsRes.data.payments || []);
      }

      const blogsRes = await api.get('/admin/blogs');
      if (blogsRes.data.success) {
        setBlogsList(blogsRes.data.blogs || []);
      }

      const ticketsRes = await api.get('/admin/tickets');
      if (ticketsRes.data.success) {
        setTicketsList(ticketsRes.data.tickets || []);
      }

      const settingsRes = await api.get('/admin/settings');
      if (settingsRes.data.success) {
        setSettings(settingsRes.data.settings);
      }

      const liveRes = await api.get('/live-classes');
      if (liveRes.data.success) {
        setLiveClassesList(liveRes.data.liveClasses || []);
      }
    } catch (e) {
      console.error("Admin dashboard load error:", e);
      setUsersList([]);
      setLiveClassesList([]);
      setCoursesList([]);
      setEnrollmentsList([]);
      setAssignmentsList([]);
      setPaymentsList([]);
      setBlogsList([]);
      setTicketsList([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Load API statistics & users
  useEffect(() => {
    fetchAdminData();
  }, []);

  // Clear support ticket badge when entering the tickets tab
  useEffect(() => {
    if (activeTab === 'tickets' && ticketsList.length > 0) {
      const currentIds = ticketsList.map(t => t._id);
      const hasUnseen = currentIds.some(id => !seenTicketIds.includes(id));
      if (hasUnseen) {
        const updatedSeen = Array.from(new Set([...seenTicketIds, ...currentIds]));
        setSeenTicketIds(updatedSeen);
        localStorage.setItem('admin_seen_ticket_ids', JSON.stringify(updatedSeen));
      }
    }
  }, [activeTab, ticketsList, seenTicketIds]);

  const handleToggleCourseApproval = async (courseId) => {
    setUserActionLoading(true);
    // Optimistic update
    setCoursesList(prevList => prevList.map(c => c._id === courseId ? { ...c, isApproved: !c.isApproved } : c));
    try {
      const res = await api.patch(`/admin/courses/${courseId}/approve`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAdminData(true);
      } else {
        // Rollback
        setCoursesList(prevList => prevList.map(c => c._id === courseId ? { ...c, isApproved: !c.isApproved } : c));
        toast.error(res.data.message || "Failed to update course approval");
      }
    } catch {
      // Rollback
      setCoursesList(prevList => prevList.map(c => c._id === courseId ? { ...c, isApproved: !c.isApproved } : c));
      toast.error("An error occurred while updating course approval");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleToggleLiveClassApproval = async (liveClassId) => {
    setUserActionLoading(true);
    // Optimistic update
    setLiveClassesList(prevList => prevList.map(lc => lc._id === liveClassId ? { ...lc, isApproved: !lc.isApproved } : lc));
    try {
      const res = await api.patch(`/admin/live-classes/${liveClassId}/approve`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAdminData(true);
      } else {
        // Rollback
        setLiveClassesList(prevList => prevList.map(lc => lc._id === liveClassId ? { ...lc, isApproved: !lc.isApproved } : lc));
        toast.error(res.data.message || "Failed to update live class approval");
      }
    } catch {
      // Rollback
      setLiveClassesList(prevList => prevList.map(lc => lc._id === liveClassId ? { ...lc, isApproved: !lc.isApproved } : lc));
      toast.error("An error occurred while updating live class approval");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleToggleBan = async (userId, currentBanStatus) => {
    setUserActionLoading(true);
    // Optimistic update
    setUsersList(prevList => prevList.map(u => u._id === userId ? { ...u, isBanned: !currentBanStatus } : u));
    try {
      const res = await api.patch(`/admin/users/${userId}/ban`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAdminData(true);
      } else {
        // Rollback
        setUsersList(prevList => prevList.map(u => u._id === userId ? { ...u, isBanned: currentBanStatus } : u));
        toast.error(res.data.message || "Failed to update ban status");
      }
    } catch (e) {
      // Rollback
      setUsersList(prevList => prevList.map(u => u._id === userId ? { ...u, isBanned: currentBanStatus } : u));
      toast.error("An error occurred while updating ban status");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleApproveTeacher = async (teacherId) => {
    setUserActionLoading(true);
    const currentTeacher = usersList.find(u => u._id === teacherId);
    const currentApprovalStatus = currentTeacher ? currentTeacher.isApproved : false;
    // Optimistic update
    setUsersList(prevList => prevList.map(u => u._id === teacherId ? { ...u, isApproved: !currentApprovalStatus } : u));
    try {
      const res = await api.patch(`/admin/teachers/${teacherId}/approve`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAdminData(true);
      } else {
        // Rollback
        setUsersList(prevList => prevList.map(u => u._id === teacherId ? { ...u, isApproved: currentApprovalStatus } : u));
        toast.error(res.data.message || "Failed to update teacher approval");
      }
    } catch (e) {
      // Rollback
      setUsersList(prevList => prevList.map(u => u._id === teacherId ? { ...u, isApproved: currentApprovalStatus } : u));
      toast.error("An error occurred while updating teacher approval");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleToggleBlogPublish = async (blogId) => {
    setUserActionLoading(true);
    const currentBlog = blogsList.find(b => b._id === blogId);
    const currentPublishStatus = currentBlog ? currentBlog.isPublished : false;
    // Optimistic update
    setBlogsList(prevList => prevList.map(b => b._id === blogId ? { ...b, isPublished: !currentPublishStatus } : b));
    try {
      const res = await api.patch(`/admin/blogs/${blogId}/publish`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAdminData(true);
      } else {
        // Rollback
        setBlogsList(prevList => prevList.map(b => b._id === blogId ? { ...b, isPublished: currentPublishStatus } : b));
        toast.error(res.data.message || "Failed to update blog publish status");
      }
    } catch (e) {
      // Rollback
      setBlogsList(prevList => prevList.map(b => b._id === blogId ? { ...b, isPublished: currentPublishStatus } : b));
      toast.error("An error occurred while updating blog publish status");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    setUserActionLoading(true);
    const deletedBlog = blogsList.find(b => b._id === blogId);
    // Optimistic update
    setBlogsList(prevList => prevList.filter(b => b._id !== blogId));
    try {
      const res = await api.delete(`/admin/blogs/${blogId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAdminData(true);
      } else {
        // Rollback
        if (deletedBlog) setBlogsList(prevList => [...prevList, deletedBlog]);
        toast.error(res.data.message || "Failed to delete blog post");
      }
    } catch (e) {
      // Rollback
      if (deletedBlog) setBlogsList(prevList => [...prevList, deletedBlog]);
      toast.error("An error occurred while deleting blog post");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleUpdateTicket = async (ticketId, updatedStatus, updatedPriority) => {
    setUserActionLoading(true);
    const originalTicket = ticketsList.find(t => t._id === ticketId);
    // Optimistic update
    setTicketsList(prevList => prevList.map(t => t._id === ticketId ? { ...t, status: updatedStatus || t.status, priority: updatedPriority || t.priority } : t));
    try {
      const res = await api.patch(`/admin/tickets/${ticketId}`, {
        status: updatedStatus,
        priority: updatedPriority
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAdminData(true);
      } else {
        // Rollback
        if (originalTicket) {
          setTicketsList(prevList => prevList.map(t => t._id === ticketId ? originalTicket : t));
        }
        toast.error(res.data.message || "Failed to update ticket");
      }
    } catch (e) {
      // Rollback
      if (originalTicket) {
        setTicketsList(prevList => prevList.map(t => t._id === ticketId ? originalTicket : t));
      }
      toast.error("An error occurred while updating ticket");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleSaveSettings = async (updatedFields) => {
    setUserActionLoading(true);
    try {
      const res = await api.put('/admin/settings', updatedFields);
      if (res.data.success) {
        alert(res.data.message || "Settings updated successfully!");
        setSettings(res.data.settings);
      }
    } catch (e) {
      alert("Failed to update settings.");
    } finally {
      setUserActionLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "PLATFORM PERFORMANCE AUDIT SUMMARY\n";
    csvContent += `Academy Name,${settings?.academyName || "Sumit Chakraborty Academy"}\n`;
    csvContent += `Generated Date,${new Date().toLocaleString()}\n\n`;
    
    csvContent += "METRICS SUMMARY\n";
    csvContent += `Metric,Value,Details\n`;
    csvContent += `Financial Performance,₹${stats.totalRevenue},${stats.successfulPaymentsCount} success / ${stats.pendingPaymentsCount} pending\n`;
    csvContent += `Class Registrations,${stats.totalEnrollments},Active student cohorts\n`;
    csvContent += `Staff Allocation,${usersList.filter(u => u.role === 'teacher').length} Teachers,${stats.pendingTeachers} pending approval\n\n`;

    csvContent += "FACULTY SALES LIST\n";
    csvContent += "Faculty Name,Email,Qualification,Experience,Course Sales\n";
    usersList.filter(u => u.role === 'teacher').forEach(t => {
      csvContent += `"${t.name}","${t.email}","${t.qualification || 'N/A'}","${t.experience || '5+ Years'} (${t.specialization || 'General'})",₹${t.totalSales || 0}\n`;
    });
    csvContent += "\n";

    csvContent += "RECENT TRANSACTIONS\n";
    csvContent += "Order ID,Student Name,Student Email,Course,Payment Method,Amount,Status,Date\n";
    paymentsList.forEach(p => {
      csvContent += `"${p.orderId}","${p.user?.name || 'N/A'}","${p.user?.email || 'N/A'}","${p.course?.title || 'N/A'}",${p.method?.toUpperCase() || 'MOCK'},₹${p.amount},${p.status?.toUpperCase() || 'PAID'},"${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "platform_audit_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  // Filter users who are pending teacher approvals
  const pendingTeachersList = usersList.filter(u => u.role === 'teacher' && !u.isApproved);

  // Filter users by role and search
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const unreadTicketsCount = ticketsList.filter(t => t.status !== 'Resolved' && !seenTicketIds.includes(t._id)).length;

  // Sidebar navigation items
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'teachers', label: 'Teachers', icon: ShieldAlert },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'batches', label: 'Batches', icon: Award },
    { id: 'enrollments', label: 'Enrollments', icon: CheckCircle },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CircleDollarSign },
    { id: 'reports', label: 'Reports', icon: Activity },
    { id: 'tickets', label: 'Support Tickets', icon: MessageSquare, badge: unreadTicketsCount || undefined },
    { id: 'announcements', label: 'Announcements', icon: FolderOpen },
    { id: 'blogs', label: 'Blog Management', icon: FileText },
    { id: 'website_settings', label: 'Website Settings', icon: Settings },
    { id: 'system_settings', label: 'System Settings', icon: Settings }
  ];

  const getFormattedDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${end.getFullYear()}`;
  };

  const getCategoryEnrollmentStats = () => {
    const statsData = stats.categoryStats || [];
    const total = statsData.reduce((sum, item) => sum + item.count, 0);
    
    const jeeItem = statsData.find(item => item._id === 'jee');
    const neetItem = statsData.find(item => item._id === 'neet');
    const boardsItem = statsData.find(item => item._id === 'boards-11-12');
    const foundationItem = statsData.find(item => item._id === 'foundation');
    
    const jeeCount = jeeItem ? jeeItem.count : 0;
    const neetCount = neetItem ? neetItem.count : 0;
    const boardsCount = boardsItem ? boardsItem.count : 0;
    const foundationCount = foundationItem ? foundationItem.count : 0;
    
    if (total === 0) {
      return {
        total: 0,
        jeeCount: 0, neetCount: 0, boardsCount: 0, foundationCount: 0,
        jeePercent: 0, neetPercent: 0, boardsPercent: 0, foundationPercent: 0
      };
    }
    
    const jeePercent = Math.round((jeeCount / total) * 100);
    const neetPercent = Math.round((neetCount / total) * 100);
    const boardsPercent = Math.round((boardsCount / total) * 100);
    const foundationPercent = Math.round((foundationCount / total) * 100);
    
    return {
      total,
      jeeCount, neetCount, boardsCount, foundationCount,
      jeePercent, neetPercent, boardsPercent, foundationPercent
    };
  };

  const getTopSellingCourses = () => {
    if (!coursesList || coursesList.length === 0) {
      return [];
    }
    return [...coursesList]
      .sort((a, b) => (b.totalEnrolled || 0) - (a.totalEnrolled || 0))
      .slice(0, 4)
      .map(c => ({
        title: c.title,
        enrollments: c.totalEnrolled || 0,
        category: c.category || 'jee'
      }));
  };

  const getRecentActivities = () => {
    const list = [];
    
    (recentStudents || []).forEach(student => {
      list.push({
        id: `student-${student._id}`,
        title: "New student registered",
        desc: student.name,
        time: student.createdAt 
          ? new Date(student.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          : 'Just now',
        date: student.createdAt ? new Date(student.createdAt) : new Date(),
        color: "bg-brand-purple/20 text-brand-purple",
        letter: "S"
      });
    });
    
    (recentPayments || []).forEach(payment => {
      list.push({
        id: `payment-${payment._id}`,
        title: "Payment received",
        desc: `₹${payment.amount} for ${payment.course?.title || 'Course'}`,
        time: payment.createdAt 
          ? new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          : 'Just now',
        date: payment.createdAt ? new Date(payment.createdAt) : new Date(),
        color: "bg-emerald-500/20 text-emerald-400",
        letter: "P"
      });
    });
    
    list.sort((a, b) => b.date - a.date);
    
    return list.slice(0, 5);
  };

  const getMonthName = (monthNum) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[monthNum - 1] || "";
  };

  const getFormattedRevenueData = () => {
    if (!monthlyRevenueData || monthlyRevenueData.length === 0) {
      const data = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const name = d.toLocaleDateString('en-US', { month: 'short' });
        data.push({ name, revenue: 0 });
      }
      return data;
    }
    return monthlyRevenueData.map(item => ({
      name: getMonthName(item._id.month),
      revenue: item.revenue,
    }));
  };

  const getFormattedGrowthData = () => {
    if (!studentGrowthData || studentGrowthData.length === 0) {
      const data = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const name = d.toLocaleDateString('en-US', { month: 'short' });
        data.push({ name, students: 0 });
      }
      return data;
    }
    return studentGrowthData.map(item => ({
      name: getMonthName(item._id.month),
      students: item.count,
    }));
  };

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden bg-[#090040] text-white relative font-sans print:hidden">
      {/* Background radial glow */}
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
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-violet to-brand-purple text-white shadow-lg shadow-brand-purple/20'
                      : 'text-brand-textMuted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="bg-brand-pink text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
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
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all text-left mt-auto border-t border-white/5 pt-4"
        >
          <LogOut className="w-4 h-4 shrink-0" />
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
                      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-violet to-brand-purple text-white shadow-lg shadow-brand-purple/20'
                          : 'text-brand-textMuted hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && !isActive && (
                        <span className="bg-brand-pink text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
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
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all text-left"
            >
              <LogOut className="w-4 h-4 shrink-0" />
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

            {/* Top Search bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-brand-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users, courses, batches..."
                className="bg-brand-dark/50 border border-brand-purple/15 rounded-full pl-10 pr-16 py-2 text-sm text-white placeholder-brand-textMuted/60 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink transition-all w-36 min-[375px]:w-44 sm:w-64 md:w-80"
              />
              <span className="hidden md:inline absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-brand-textMuted/70 border border-brand-purple/20 px-1.5 py-0.5 rounded-md font-bold bg-brand-dark/30">
                Ctrl + K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setActiveTab('tickets')}
                className="p-2 text-brand-textMuted hover:text-white rounded-full hover:bg-white/5 transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {unreadTicketsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-pink text-white rounded-full text-[9px] font-black flex items-center justify-center">
                    {unreadTicketsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setHeaderDropdownOpen(!headerDropdownOpen)}
                className="flex items-center gap-2 sm:gap-3 bg-transparent sm:bg-brand-surface/40 hover:sm:bg-brand-surface/70 sm:border sm:border-brand-purple/15 sm:pl-2 sm:pr-3 sm:py-1.5 rounded-full text-white font-semibold transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-brand-purple/30 border border-brand-purple/40 flex items-center justify-center text-sm font-black text-white uppercase shadow-md shadow-brand-purple/10 shrink-0">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="hidden sm:flex flex-col text-left shrink-0">
                  <span className="text-xs font-bold leading-tight block">{user?.name || 'Sumit Chakraborty'}</span>
                  <span className="text-[9px] text-brand-textMuted leading-none block uppercase font-bold tracking-wider">Super Admin</span>
                </div>
                <ChevronDown className="hidden sm:inline w-3.5 h-3.5 text-brand-textMuted shrink-0" />
              </button>

              {headerDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setHeaderDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-brand-surface border border-brand-purple/20 p-2 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 border-b border-white/5 mb-1.5">
                      <p className="text-[10px] font-bold text-brand-pink uppercase tracking-widest leading-none">Registered Email</p>
                      <p className="text-xs font-semibold text-white truncate mt-1">{user?.email || 'pritam18official@gmail.com'}</p>
                    </div>
                    <button
                      onClick={() => { setActiveTab('system_settings'); setHeaderDropdownOpen(false); }}
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

        {/* Scrollable Work Area Wrapper */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="min-h-full flex flex-col justify-between">
            <div className="p-4 sm:p-6 lg:p-8 space-y-8">

              {/* TAB 1: ADMIN DASHBOARD OVERVIEW */}
              {activeTab === 'dashboard' && (
                <div className="space-y-8 text-left">
                  {/* Welcome banner section */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden bg-gradient-to-r from-brand-violet to-[#140c5c] rounded-3xl p-6 sm:p-8 border border-brand-purple/15 shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/5 blur-3xl rounded-full pointer-events-none"></div>
                    <div className="space-y-1">
                      <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome back, Admin! 👋</h1>
                      <p className="text-brand-textMuted text-sm">Here's what's happening with your academy today.</p>
                    </div>
                    
                    {/* Date Selector and Export */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div className="bg-brand-dark/50 border border-brand-purple/15 py-2 px-4 rounded-xl flex items-center gap-2.5 text-xs text-white">
                        <Calendar className="w-4 h-4 text-brand-pink" />
                        <span>{getFormattedDateRange()}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-brand-textMuted" />
                      </div>
                      <button onClick={handleDownloadPDF} className="btn-primary py-2 px-4 text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer">
                        <Download className="w-4 h-4" /> Export Report
                      </button>
                    </div>
                  </div>

                  {/* Statistics Row (5 cards) */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    
                    {/* Card 1: Total Students / Teachers Toggleable */}
                    <div 
                      onClick={() => setShowTeachersInCard1(!showTeachersInCard1)}
                      className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between h-[140px] cursor-pointer hover:border-brand-pink/40 hover:bg-brand-purple/5 transition-all duration-300 select-none group relative"
                    >
                      <div className="flex justify-between items-start">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 transition-all ${
                          showTeachersInCard1 
                            ? 'bg-brand-purple/15 text-brand-purple border-brand-purple/10' 
                            : 'bg-brand-pink/15 text-brand-pink border-brand-pink/10'
                        }`}>
                          <Users className="w-5 h-5" />
                        </div>

                        {/* Sparkline line chart SVG */}
                        <div className="w-16 h-8 group-hover:scale-105 transition-transform">
                          <svg viewBox="0 0 50 20" className="w-full h-full">
                            <path 
                              d="M0 16 Q 10 18, 20 8 T 40 12 T 50 4" 
                              fill="none" 
                              stroke={showTeachersInCard1 ? "#B13BFF" : "#FF2E93"} 
                              strokeWidth="1.5" 
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">
                          {showTeachersInCard1 ? "Total Teachers" : "Total Students"}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">
                            {showTeachersInCard1 ? stats.totalTeachers : stats.totalUsers.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[8px] text-brand-textMuted block">
                          {showTeachersInCard1 ? `${stats.pendingTeachers} pending approval` : "Total registered"}
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Active Courses */}
                    <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between h-[140px]">
                      <div className="flex justify-between items-start">
                        <div className="w-9 h-9 rounded-xl bg-brand-purple/15 flex items-center justify-center text-brand-purple border border-brand-purple/10 shrink-0">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        {/* Sparkline line chart SVG */}
                        <div className="w-16 h-8">
                          <svg viewBox="0 0 50 20" className="w-full h-full text-brand-purple">
                            <path d="M0 15 Q 15 5, 25 12 T 50 8" fill="none" stroke="#B13BFF" strokeWidth="1.5" />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">Active Courses</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">{stats.totalCourses}</span>
                        </div>
                        <span className="text-[8px] text-brand-textMuted block">Published</span>
                      </div>
                    </div>

                    {/* Card 3: Total Revenue */}
                    <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between h-[140px]">
                      <div className="flex justify-between items-start">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/10 shrink-0">
                          <CircleDollarSign className="w-5 h-5" />
                        </div>
                        {/* Sparkline line chart SVG */}
                        <div className="w-16 h-8">
                          <svg viewBox="0 0 50 20" className="w-full h-full text-emerald-400">
                            <path d="M0 18 Q 12 16, 25 5 T 50 2" fill="none" stroke="#10b981" strokeWidth="1.5" />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">Total Revenue</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">₹{stats.totalRevenue.toLocaleString()}</span>
                        </div>
                        <span className="text-[8px] text-brand-textMuted block">Lifetime</span>
                      </div>
                    </div>

                    {/* Card 4: New Enrollments */}
                    <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between h-[140px]">
                      <div className="flex justify-between items-start">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 border border-blue-500/10 shrink-0">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        {/* Sparkline line chart SVG */}
                        <div className="w-16 h-8">
                          <svg viewBox="0 0 50 20" className="w-full h-full text-blue-400">
                            <path d="M0 16 Q 10 15, 25 10 T 50 6" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">New Enrollments</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">{stats.totalEnrollments.toLocaleString()}</span>
                        </div>
                        <span className="text-[8px] text-brand-textMuted block">Total</span>
                      </div>
                    </div>

                    {/* Card 5: Pending Teachers */}
                    <div className="glass-card p-5 rounded-2xl border border-brand-purple/15 flex flex-col justify-between h-[140px]">
                      <div className="flex justify-between items-start">
                        <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-500/10 shrink-0">
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        {/* Sparkline line chart SVG */}
                        <div className="w-16 h-8">
                          <svg viewBox="0 0 50 20" className="w-full h-full text-yellow-400">
                            <path d="M0 10 L 15 10 L 30 10 L 50 10" fill="none" stroke="#eab308" strokeWidth="1.5" />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">Total Teachers</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">{stats.totalTeachers}</span>
                        </div>
                        <span className="text-[8px] text-brand-textMuted block">{stats.pendingTeachers} pending approval</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Section: Revenue Chart, Student growth chart, Recent Activities */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Revenue Overview chart */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-5 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                        <div>
                          <h3 className="font-extrabold text-white text-sm">Revenue Overview</h3>
                          <p className="text-[9px] text-brand-textMuted">₹{stats.totalRevenue.toLocaleString()} Total Revenue</p>
                        </div>
                        <span className="text-[10px] text-brand-textMuted border border-white/5 rounded px-2 py-1">Last 7 Days</span>
                      </div>
                      {/* Dynamic Recharts Area Chart */}
                      <div className="h-56 relative text-xs">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 300, height: 224 }}>
                          <AreaChart
                            data={getFormattedRevenueData()}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#B13BFF" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#B13BFF" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0F0052', borderColor: 'rgba(177,59,255,0.3)', borderRadius: '12px', color: '#fff' }}
                              formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#B13BFF" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Student Growth Chart */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-4 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                        <div>
                          <h3 className="font-extrabold text-white text-sm">Student Growth</h3>
                          <p className="text-[9px] text-brand-textMuted">{stats.totalUsers.toLocaleString()} Total Students</p>
                        </div>
                        <span className="text-[10px] text-brand-textMuted border border-white/5 rounded px-2 py-1">Last 7 Days</span>
                      </div>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 300, height: 224 }}>
                          <AreaChart
                            data={getFormattedGrowthData()}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0F0052', borderColor: 'rgba(59,130,246,0.3)', borderRadius: '12px', color: '#fff' }}
                              formatter={(value) => [value, 'Students']}
                            />
                            <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-3 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <h3 className="font-extrabold text-white text-sm">Recent Activities</h3>
                        <button onClick={() => setActiveTab('reports')} className="text-[10px] text-brand-pink font-bold hover:underline">View All</button>
                      </div>
                      
                      <div className="space-y-3 flex-1 flex flex-col justify-center items-center pr-1 overflow-y-auto scrollbar-none max-h-[220px]">
                        {getRecentActivities().length > 0 ? (
                          getRecentActivities().map((act) => (
                            <div key={act.id} className="flex items-center gap-3 w-full">
                              <div className={`w-7 h-7 rounded-lg ${act.color} flex items-center justify-center shrink-0 font-bold text-xs`}>
                                {act.letter}
                              </div>
                              <div className="text-left min-w-0 flex-1">
                                <h5 className="text-xs font-bold text-white truncate">{act.title}</h5>
                                <p className="text-[9px] text-brand-textMuted truncate">{act.desc}</p>
                              </div>
                              <span className="text-[8px] text-brand-textMuted shrink-0">{act.time}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-brand-textMuted text-xs italic">
                            No recent activities recorded.
                          </div>
                        )}
                      </div>
                      
                      <button onClick={() => setActiveTab('reports')} className="w-full flex items-center justify-center gap-1 text-[10px] text-brand-pink font-bold hover:underline mt-2 pt-2 border-t border-white/5">
                        View All Activities <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>

                  {/* Bottom sales section, donut overview, payment summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Top Selling Courses */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-4 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <h3 className="font-extrabold text-white text-sm">Top Selling Courses</h3>
                        <button onClick={() => setActiveTab('courses')} className="text-[10px] text-brand-pink font-bold hover:underline">View All</button>
                      </div>

                      <div className="space-y-4 flex-grow flex flex-col justify-between">
                        {getTopSellingCourses().length > 0 ? (
                          getTopSellingCourses().map((course, index) => {
                            const catColors = {
                              jee: 'bg-brand-purple/20 text-brand-purple',
                              neet: 'bg-brand-pink/20 text-brand-pink',
                              'boards-11-12': 'bg-blue-500/20 text-blue-400',
                              foundation: 'bg-yellow-500/20 text-yellow-400'
                            };
                            const colorClass = catColors[course.category] || 'bg-white/10 text-white';
                            const catLabel = course.category === 'boards-11-12' ? 'BOARD' : course.category.toUpperCase();
                            return (
                              <div key={index} className="flex items-center gap-3">
                                <div className={`px-2 min-w-[44px] h-7 rounded ${colorClass} flex items-center justify-center font-bold text-[9px] shrink-0`}>
                                  {catLabel}
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                  <h5 className="text-xs font-bold text-white truncate">{course.title}</h5>
                                  <span className="text-[9px] text-brand-textMuted">{course.enrollments.toLocaleString()} Enrollments</span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-6 text-brand-textMuted text-xs italic">
                            No courses sold yet.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enrollments Overview Donut Chart */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-4 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <h3 className="font-extrabold text-white text-sm">Enrollments Overview</h3>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow justify-around">
                        {/* Donut SVG */}
                        <div className="w-24 h-24 relative shrink-0">
                          <svg viewBox="0 0 36 36" className="w-full h-full">
                            <circle cx="18" cy="18" r="15.91" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3.5" />
                            {(() => {
                              const catStats = getCategoryEnrollmentStats();
                              if (catStats.total === 0) {
                                return <circle cx="18" cy="18" r="15.91" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5" />;
                              }
                              return (
                                <>
                                  {catStats.jeePercent > 0 && (
                                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#B13BFF" strokeWidth="3.5" 
                                      strokeDasharray={`${catStats.jeePercent} ${100 - catStats.jeePercent}`} 
                                      strokeDashoffset="25" 
                                    />
                                  )}
                                  {catStats.neetPercent > 0 && (
                                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#3b82f6" strokeWidth="3.5" 
                                      strokeDasharray={`${catStats.neetPercent} ${100 - catStats.neetPercent}`} 
                                      strokeDashoffset={25 - catStats.jeePercent} 
                                    />
                                  )}
                                  {catStats.boardsPercent > 0 && (
                                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#eab308" strokeWidth="3.5" 
                                      strokeDasharray={`${catStats.boardsPercent} ${100 - catStats.boardsPercent}`} 
                                      strokeDashoffset={25 - catStats.jeePercent - catStats.neetPercent} 
                                    />
                                  )}
                                  {catStats.foundationPercent > 0 && (
                                    <circle cx="18" cy="18" r="15.91" fill="none" stroke="#FF2E93" strokeWidth="3.5" 
                                      strokeDasharray={`${catStats.foundationPercent} ${100 - catStats.foundationPercent}`} 
                                      strokeDashoffset={25 - catStats.jeePercent - catStats.neetPercent - catStats.boardsPercent} 
                                    />
                                  )}
                                </>
                              );
                            })()}
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                            <span className="text-[10px] font-black text-white">{getCategoryEnrollmentStats().total}</span>
                            <span className="text-[6px] text-brand-textMuted uppercase font-bold mt-0.5">Total</span>
                          </div>
                        </div>

                        {/* Legend */}
                        {(() => {
                          const catStats = getCategoryEnrollmentStats();
                          return (
                            <div className="space-y-1.5 text-left text-[9px] font-bold text-gray-200">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded bg-brand-purple shrink-0"></span>
                                <span>JEE: {catStats.jeeCount} ({catStats.jeePercent}%)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded bg-blue-500 shrink-0"></span>
                                <span>NEET: {catStats.neetCount} ({catStats.neetPercent}%)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded bg-yellow-500 shrink-0"></span>
                                <span>Boards: {catStats.boardsCount} ({catStats.boardsPercent}%)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded bg-brand-pink shrink-0"></span>
                                <span>Found: {catStats.foundationCount} ({catStats.foundationPercent}%)</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 lg:col-span-4 text-left flex flex-col justify-between">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <h3 className="font-extrabold text-white text-sm">Payment Summary</h3>
                        <button onClick={() => setActiveTab('payments')} className="text-[10px] text-brand-pink font-bold hover:underline">View All</button>
                      </div>

                      <div className="space-y-3.5 flex-grow flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span className="text-xs text-brand-textMuted font-bold">Total Revenue</span>
                          </div>
                          <span className="text-xs font-black text-white">₹{stats.totalRevenue.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            <span className="text-xs text-brand-textMuted font-bold">Pending Payments</span>
                          </div>
                          <span className="text-xs font-black text-white">₹{stats.pendingPaymentsAmount.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            <span className="text-xs text-brand-textMuted font-bold">Refunds</span>
                          </div>
                          <span className="text-xs font-black text-white">₹{stats.refundedPaymentsAmount.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span className="text-xs text-brand-textMuted font-bold">Successful Transactions</span>
                          </div>
                          <span className="text-xs font-black text-white">{stats.successfulPaymentsCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Teacher approvals & Support tickets table */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    
                    {/* Pending Teacher Approvals */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 text-left flex flex-col space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <h3 className="font-extrabold text-white text-sm">Pending Teacher Approvals</h3>
                        <button onClick={() => setActiveTab('teachers')} className="text-[10px] text-brand-pink font-bold hover:underline">View All</button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-max text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-brand-pink font-bold uppercase tracking-wider pb-2">
                              <th className="py-2">Teacher</th>
                              <th className="py-2">Subjects</th>
                              <th className="py-2">Experience</th>
                              <th className="py-2 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-semibold text-gray-200">
                            {pendingTeachersList.length > 0 ? (
                              pendingTeachersList.slice(0, 3).map((teacher) => (
                                <tr key={teacher._id} className="hover:bg-brand-surface/20 transition-all">
                                  <td className="py-2.5">
                                    <span className="font-bold text-white block">{teacher.name}</span>
                                    <span className="text-[10px] text-brand-textMuted block">{teacher.email}</span>
                                  </td>
                                  <td className="py-2.5">{teacher.specialization || 'Physics, Math'}</td>
                                  <td className="py-2.5">{teacher.experience || '5 Years'}</td>
                                  <td className="py-2.5 text-right">
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        onClick={() => handleApproveTeacher(teacher._id)}
                                        className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 p-1 rounded transition-all"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => alert("Registration declined")}
                                        className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 p-1 rounded transition-all"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="4" className="py-6 text-center text-brand-textMuted italic">
                                  No pending teacher approval requests
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Support Tickets */}
                    <div className="glass-card rounded-2xl border border-brand-purple/10 p-5 text-left flex flex-col space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                        <h3 className="font-extrabold text-white text-sm">Recent Support Tickets</h3>
                        <button onClick={() => setActiveTab('tickets')} className="text-[10px] text-brand-pink font-bold hover:underline">View All</button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-max text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-brand-pink font-bold uppercase tracking-wider pb-2">
                              <th className="py-2">Ticket</th>
                              <th className="py-2">Subject</th>
                              <th className="py-2">User</th>
                              <th className="py-2">Status</th>
                              <th className="py-2 text-right">Priority</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-semibold text-gray-200">
                            {ticketsList.length > 0 ? (
                              ticketsList.slice(0, 4).map((t) => (
                                <tr key={t._id} className="hover:bg-brand-surface/20 transition-all">
                                  <td className="py-2.5 font-bold text-white">#{t.ticketId}</td>
                                  <td className="py-2.5 truncate max-w-[130px]">{t.subject}</td>
                                  <td className="py-2.5">{t.user?.name || 'Student'}</td>
                                  <td className="py-2.5">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getStatusColor(t.status)}`}>
                                      {t.status}
                                    </span>
                                  </td>
                                  <td className={`py-2.5 text-right font-black ${getPriorityColor(t.priority)}`}>{t.priority}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="py-6 text-center text-brand-textMuted italic">
                                  No support tickets found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 2: SYSTEM ACCOUNT MANAGEMENT (Original Users Tab) */}
              {activeTab === 'users' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-white">System Account Management</h2>
                      <p className="text-xs text-brand-textMuted mt-1">Supervise role structures, verification status, and block access logs.</p>
                    </div>
                    
                    {/* Search and Role filter inside Users list */}
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto shrink-0">
                      <div className="relative w-full sm:w-48">
                        <Search className="w-3.5 h-3.5 text-brand-textMuted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setVisibleCount(5);
                          }}
                          className="w-full bg-brand-dark/60 border border-brand-purple/20 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-brand-pink"
                        />
                      </div>
                      <div className="flex items-center bg-brand-dark/60 border border-brand-purple/20 rounded-xl p-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setRoleFilter('student');
                            setVisibleCount(5);
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            roleFilter === 'student'
                              ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/25'
                              : 'text-brand-textMuted hover:text-white hover:bg-white/5'
                          }`}
                        >
                          Students
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRoleFilter('teacher');
                            setVisibleCount(5);
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            roleFilter === 'teacher'
                              ? 'bg-brand-pink text-white shadow-lg shadow-brand-pink/25'
                              : 'text-brand-textMuted hover:text-white hover:bg-white/5'
                          }`}
                        >
                          Teachers
                        </button>
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-pink"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-white/5 bg-brand-dark/40">
                      <table className="w-full min-w-max text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-brand-violet/20 text-xs font-bold text-brand-pink uppercase tracking-widest">
                            <th className="p-4 rounded-l-xl">User Details</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Verification</th>
                            <th className="p-4 text-right rounded-r-xl">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="py-6 text-center text-brand-textMuted italic">
                                No {roleFilter === 'student' ? 'students' : 'teachers'} found.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.slice(0, visibleCount).map((userItem) => (
                              <tr key={userItem._id} className="hover:bg-brand-surface/20 transition-all">
                                <td className="p-4">
                                  <span className="font-bold text-white block">{userItem.name}</span>
                                  <span className="text-xs text-brand-textMuted block">{userItem.email}</span>
                                </td>
                                <td className="p-4 capitalize">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    userItem.role === 'admin' ? 'bg-brand-pink/20 text-brand-pink' :
                                    userItem.role === 'teacher' ? 'bg-brand-purple/20 text-brand-purple' :
                                    'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {userItem.role}
                                  </span>
                                </td>
                                <td className="p-4">
                                  {userItem.role === 'teacher' ? (
                                    userItem.isApproved ? (
                                      <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                                        <CheckCircle className="w-4 h-4" /> Approved Faculty
                                      </span>
                                    ) : (
                                      <span className="text-yellow-400 text-xs flex items-center gap-1 font-semibold">
                                        <ShieldAlert className="w-4 h-4 animate-pulse" /> Pending Approval
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-brand-textMuted text-xs font-semibold">Verified User</span>
                                  )}
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex gap-2.5 justify-end">
                                    {userItem.role === 'teacher' && !userItem.isApproved && (
                                      <button
                                        onClick={() => handleApproveTeacher(userItem._id)}
                                        disabled={userActionLoading}
                                        className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold py-1.5 px-3 rounded-lg transition-all"
                                      >
                                        Approve
                                      </button>
                                    )}
                                    {userItem.role !== 'admin' && (
                                      <button
                                        onClick={() => handleToggleBan(userItem._id, userItem.isBanned)}
                                        disabled={userActionLoading}
                                        className={`text-xs font-bold py-1.5 px-3 rounded-lg border transition-all flex items-center gap-1 ${
                                          userItem.isBanned
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                            : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                        }`}
                                      >
                                        <Ban className="w-3.5 h-3.5" /> {userItem.isBanned ? 'Unban' : 'Ban'}
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {filteredUsers.length > visibleCount && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => setVisibleCount(prev => prev + 5)}
                        className="bg-brand-pink/15 hover:bg-brand-pink/25 border border-brand-pink/30 hover:border-brand-pink/50 text-white font-bold py-2 px-6 rounded-xl text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        <ChevronDown className="w-4 h-4" /> See More
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TABS 3-14: Fully Dynamic Administrative Panels */}
              {activeTab === 'teachers' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-white">Faculty Directory</h2>
                      <p className="text-xs text-brand-textMuted mt-1">Administrate qualifications, specialization, and review application statuses.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-brand-dark/40">
                    <table className="w-full min-w-max text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-brand-violet/20 text-xs font-bold text-brand-pink uppercase tracking-widest">
                          <th className="p-4 rounded-l-xl">Faculty details</th>
                          <th className="p-4">Qualification</th>
                          <th className="p-4">Experience & Specialty</th>
                          <th className="p-4">Course Sales</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right rounded-r-xl">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {usersList.filter(u => u.role === 'teacher').length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center p-6 text-brand-textMuted">No faculty accounts found.</td>
                          </tr>
                        ) : (
                          usersList.filter(u => u.role === 'teacher').map((teacher) => (
                            <tr key={teacher._id} className="hover:bg-brand-surface/20 transition-all">
                              <td className="p-4">
                                <span className="font-bold text-white block">{teacher.name}</span>
                                <span className="text-xs text-brand-textMuted block">{teacher.email}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-white block">{teacher.qualification || 'M.Sc. Education'}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-white block font-semibold">{teacher.experience || '5+ Years'}</span>
                                <span className="text-xs text-brand-textMuted block">{teacher.specialization || 'General Science'}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-emerald-400 font-bold block">₹{(teacher.totalSales || 0).toLocaleString()}</span>
                                <span className="text-[10px] text-brand-textMuted block">Total sales</span>
                              </td>
                              <td className="p-4">
                                {teacher.isApproved ? (
                                  <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                                    <CheckCircle className="w-4 h-4" /> Approved Faculty
                                  </span>
                                ) : (
                                  <span className="text-yellow-400 text-xs flex items-center gap-1 font-semibold">
                                    <ShieldAlert className="w-4 h-4 animate-pulse" /> Pending Approval
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex gap-2.5 justify-end">
                                  <button
                                    onClick={() => handleApproveTeacher(teacher._id)}
                                    disabled={userActionLoading}
                                    className={`text-xs font-bold py-1.5 px-3 rounded-lg border transition-all ${
                                      teacher.isApproved
                                        ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                    }`}
                                  >
                                    {teacher.isApproved ? 'Revoke Approval' : 'Approve'}
                                  </button>
                                  <button
                                    onClick={() => handleToggleBan(teacher._id, teacher.isBanned)}
                                    disabled={userActionLoading}
                                    className={`text-xs font-bold py-1.5 px-3 rounded-lg border transition-all flex items-center gap-1 ${
                                      teacher.isBanned
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                        : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                    }`}
                                  >
                                    <Ban className="w-3.5 h-3.5" /> {teacher.isBanned ? 'Unban' : 'Ban'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'courses' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 text-left space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-black text-white">Course Approvals & Moderation</h2>
                    <p className="text-xs text-brand-textMuted mt-1">Review faculty-submitted syllabus programs and toggle active site publication.</p>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-pink"></div>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-x-auto rounded-xl border border-white/5 bg-brand-dark/40">
                        <table className="w-full min-w-max text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 bg-brand-violet/20 text-xs font-bold text-brand-pink uppercase tracking-widest">
                              <th className="p-4 rounded-l-xl">Course Title</th>
                              <th className="p-4">Instructor</th>
                              <th className="p-4">Category & Price</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right rounded-r-xl">Operations</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                            {coursesList.length === 0 ? (
                              <tr>
                                <td colSpan="5" className="text-center p-6 text-brand-textMuted">No courses found.</td>
                              </tr>
                            ) : (
                              coursesList.map((course) => (
                                <tr key={course._id} className="hover:bg-brand-surface/20 transition-all">
                                  <td className="p-4">
                                    <span className="font-bold text-white block">{course.title}</span>
                                    <span className="text-xs text-brand-textMuted block">{course.subject} • {course.level || 'Intermediate'}</span>
                                  </td>
                                  <td className="p-4">
                                    <span className="font-bold text-white block">{course.instructor?.name || 'Unknown Faculty'}</span>
                                    <span className="text-xs text-brand-textMuted block">{course.instructor?.email}</span>
                                  </td>
                                  <td className="p-4 capitalize">
                                    <span className="bg-brand-purple/20 text-brand-purple px-2 py-0.5 rounded text-[10px] font-bold">
                                      {course.category}
                                    </span>
                                    <span className="text-white block mt-1 font-semibold">₹{course.price}</span>
                                  </td>
                                  <td className="p-4">
                                    {course.isApproved ? (
                                      <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                                        <CheckCircle className="w-4 h-4" /> Approved
                                      </span>
                                    ) : (
                                      <span className="text-yellow-400 text-xs flex items-center gap-1 font-semibold">
                                        <ShieldAlert className="w-4 h-4 animate-pulse" /> Pending Approval
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-4 text-right">
                                    <button
                                      onClick={() => handleToggleCourseApproval(course._id)}
                                      disabled={userActionLoading}
                                      className={`text-xs font-bold py-1.5 px-3 rounded-lg border transition-all ${
                                        course.isApproved
                                          ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                      }`}
                                    >
                                      {course.isApproved ? 'Revoke Approval' : 'Approve Course'}
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Section 2: Live Class Recordings Approvals */}
                      <div className="mt-12 pt-8 border-t border-white/5 space-y-6">
                        <div>
                          <h2 className="text-xl font-black text-white">Live Class Recordings Approvals</h2>
                          <p className="text-xs text-brand-textMuted mt-1">Review completed live sessions and approve recordings to make them available to students.</p>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-white/5 bg-brand-dark/40">
                          <table className="w-full min-w-max text-left border-collapse">
                            <thead>
                              <tr className="border-b border-white/5 bg-brand-violet/20 text-xs font-bold text-brand-pink uppercase tracking-widest">
                                <th className="p-4 rounded-l-xl">Live Class Title</th>
                                <th className="p-4">Associated Course</th>
                                <th className="p-4">Instructor</th>
                                <th className="p-4">Completed Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right rounded-r-xl">Operations</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                              {liveClassesList.filter(lc => lc.status === 'Completed').length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="text-center p-6 text-brand-textMuted">No completed live class recordings found.</td>
                                </tr>
                              ) : (
                                liveClassesList.filter(lc => lc.status === 'Completed').map((lc) => (
                                  <tr key={lc._id} className="hover:bg-brand-surface/20 transition-all">
                                    <td className="p-4">
                                      <span className="font-bold text-white block">{lc.title}</span>
                                      <span className="text-xs text-brand-textMuted block">Duration: {lc.duration} mins</span>
                                    </td>
                                    <td className="p-4 font-semibold text-white">
                                      {lc.course?.title || 'Unknown Course'}
                                    </td>
                                    <td className="p-4 font-semibold text-white">
                                      {lc.instructor?.name || 'Unknown Instructor'}
                                    </td>
                                    <td className="p-4">
                                      <span className="text-brand-pink font-bold block">{lc.date}</span>
                                      <span className="text-xs text-brand-textMuted block">{lc.time}</span>
                                    </td>
                                    <td className="p-4">
                                      {lc.isApproved ? (
                                        <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                                          <CheckCircle className="w-4 h-4" /> Approved & Live
                                        </span>
                                      ) : (
                                        <span className="text-yellow-400 text-xs flex items-center gap-1 font-semibold">
                                          <ShieldAlert className="w-4 h-4 animate-pulse" /> Pending Approval
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-4 text-right">
                                      <button
                                        onClick={() => handleToggleLiveClassApproval(lc._id)}
                                        disabled={userActionLoading}
                                        className={`text-xs font-bold py-1.5 px-3 rounded-lg border transition-all ${
                                          lc.isApproved
                                            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                        }`}
                                      >
                                        {lc.isApproved ? 'Revoke Approval' : 'Approve Recording'}
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'batches' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 space-y-6 text-left animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-black text-white">Academic Batches & Cohorts</h2>
                    <p className="text-xs text-brand-textMuted mt-1">Review active classroom rosters and cohort student aggregates.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {coursesList.length === 0 ? (
                      <p className="text-xs text-brand-textMuted col-span-full">No active batches detected.</p>
                    ) : (
                      coursesList.map((course) => (
                        <div key={course._id} className="bg-brand-dark/40 border border-brand-purple/15 rounded-2xl p-5 space-y-4 hover:border-brand-pink/30 transition-all flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              course.category === 'jee' ? 'bg-brand-purple/20 text-brand-purple' :
                              course.category === 'neet' ? 'bg-blue-500/20 text-blue-400' :
                              course.category === 'boards-11-12' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-brand-pink/20 text-brand-pink'
                            }`}>
                              {course.category === 'boards-11-12' ? 'BOARD' : course.category?.toUpperCase() || 'GENERAL'}
                            </span>
                            <h4 className="font-bold text-white text-sm line-clamp-1">{course.title}</h4>
                            <p className="text-xs text-brand-textMuted">Instructor: {course.instructor?.name || 'Academic Faculty'}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-white/5">
                            <div>
                              <span className="text-[10px] text-brand-textMuted uppercase font-bold block">Students</span>
                              <span className="text-xs font-black text-white">{course.totalEnrolled || 0} enrolled</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-brand-textMuted uppercase font-bold block text-right">Fee</span>
                              <span className="text-xs font-black text-emerald-400 block text-right">₹{course.price}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'enrollments' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 space-y-6 text-left animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-black text-white">Enrollment Ledger</h2>
                    <p className="text-xs text-brand-textMuted mt-1">Review live student course signups, study progress tracking, and active licenses.</p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-brand-dark/40">
                    <table className="w-full min-w-max text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-brand-violet/20 text-xs font-bold text-brand-pink uppercase tracking-widest">
                          <th className="p-4 rounded-l-xl">Student Details</th>
                          <th className="p-4">Course</th>
                          <th className="p-4">Progress</th>
                          <th className="p-4">Enrolled At</th>
                          <th className="p-4 text-right rounded-r-xl">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {enrollmentsList.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center p-6 text-brand-textMuted">No enrollment records found.</td>
                          </tr>
                        ) : (
                          enrollmentsList.map((enrollment) => (
                            <tr key={enrollment._id} className="hover:bg-brand-surface/20 transition-all">
                              <td className="p-4">
                                <span className="font-bold text-white block">{enrollment.user?.name || 'Student'}</span>
                                <span className="text-xs text-brand-textMuted block">{enrollment.user?.email}</span>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-white block">{enrollment.course?.title || 'LMS Course'}</span>
                                <span className="text-xs text-brand-textMuted block capitalize">{enrollment.course?.category}</span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-white/10 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-brand-pink h-full rounded-full" style={{ width: `${enrollment.progressPercent || 0}%` }}></div>
                                  </div>
                                  <span className="text-xs font-bold text-white">{enrollment.progressPercent || 0}%</span>
                                </div>
                              </td>
                              <td className="p-4 text-brand-textMuted">
                                {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                              </td>
                              <td className="p-4 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${enrollment.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                  {enrollment.isActive ? 'Active License' : 'Expired'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 space-y-6 text-left animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-black text-white">Class Assignments</h2>
                    <p className="text-xs text-brand-textMuted mt-1">Review student task uploads, evaluate course marks, and manage due dates.</p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-brand-dark/40">
                    <table className="w-full min-w-max text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-brand-violet/20 text-xs font-bold text-brand-pink uppercase tracking-widest">
                          <th className="p-4 rounded-l-xl">Assignment Title</th>
                          <th className="p-4">Academic Course</th>
                          <th className="p-4">Faculty Instructor</th>
                          <th className="p-4">Total Marks / Submissions</th>
                          <th className="p-4 text-right rounded-r-xl">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {assignmentsList.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center p-6 text-brand-textMuted">No class assignments found.</td>
                          </tr>
                        ) : (
                          assignmentsList.map((assignment) => (
                            <tr key={assignment._id} className="hover:bg-brand-surface/20 transition-all">
                              <td className="p-4">
                                <span className="font-bold text-white block">{assignment.title}</span>
                                <span className="text-xs text-brand-textMuted block line-clamp-1">{assignment.description}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-white block font-semibold">{assignment.course?.title || 'N/A'}</span>
                                <span className="text-xs text-brand-textMuted block capitalize">{assignment.course?.category}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-white block">{assignment.instructor?.name || 'Unknown Faculty'}</span>
                                <span className="text-xs text-brand-textMuted block">{assignment.instructor?.email}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-white block font-bold">{assignment.totalMarks} Marks</span>
                                <span className="text-xs text-brand-pink block font-bold">{assignment.submissions?.length || 0} Submissions</span>
                              </td>
                              <td className="p-4 text-right text-brand-textMuted">
                                {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 space-y-6 text-left animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-black text-white">Payment Ledgers</h2>
                    <p className="text-xs text-brand-textMuted mt-1">Review live financial transactions, refunds, and verify Order references.</p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-brand-dark/40">
                    <table className="w-full min-w-max text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-brand-violet/20 text-xs font-bold text-brand-pink uppercase tracking-widest">
                          <th className="p-4 rounded-l-xl">Order & Transaction ID</th>
                          <th className="p-4">Student Details</th>
                          <th className="p-4">Purchased Course</th>
                          <th className="p-4">Amount & Method</th>
                          <th className="p-4">Date</th>
                          <th className="p-4 text-right rounded-r-xl">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {paymentsList.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center p-6 text-brand-textMuted">No payment ledgers found.</td>
                          </tr>
                        ) : (
                          paymentsList.map((payment) => (
                            <tr key={payment._id} className="hover:bg-brand-surface/20 transition-all">
                              <td className="p-4 font-mono text-xs">
                                <span className="text-white block font-bold">{payment.orderId}</span>
                                <span className="text-brand-textMuted block">{payment.paymentId || 'N/A'}</span>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-white block">{payment.user?.name || 'Student'}</span>
                                <span className="text-xs text-brand-textMuted block">{payment.user?.email}</span>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-white block">{payment.course?.title || 'N/A'}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-emerald-400 block font-bold">₹{payment.amount}</span>
                                <span className="text-[10px] text-brand-textMuted block uppercase font-bold">{payment.method}</span>
                              </td>
                              <td className="p-4 text-brand-textMuted">
                                {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                              </td>
                              <td className="p-4 text-right">
                                <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                  payment.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' :
                                  payment.status === 'refunded' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                }`}>
                                  {payment.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'tickets' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 space-y-6 text-left animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-black text-white">Technical Support Queue</h2>
                    <p className="text-xs text-brand-textMuted mt-1">Review student issues, resolve refund requests, and update resolution priorities.</p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-brand-dark/40">
                    <table className="w-full min-w-max text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-white/5 bg-brand-violet/20 text-xs font-bold text-brand-pink uppercase tracking-widest">
                          <th className="p-4 rounded-l-xl">Ticket ID</th>
                          <th className="p-4">Subject</th>
                          <th className="p-4">Opened By</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Priority</th>
                          <th className="p-4 text-right rounded-r-xl">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-semibold text-gray-200">
                        {ticketsList.length > 0 ? (
                          ticketsList.map((t) => {
                            const isExpanded = expandedTicketId === t._id;
                            return (
                              <Fragment key={t._id}>
                                <tr 
                                  onClick={() => setExpandedTicketId(isExpanded ? null : t._id)}
                                  className="hover:bg-brand-surface/20 transition-all cursor-pointer"
                                >
                                  <td className="p-4 font-bold text-white">#{t.ticketId}</td>
                                  <td className="p-4 text-white truncate max-w-[200px]">{t.subject}</td>
                                  <td className="p-4">
                                    <span className="block font-bold text-white">{t.user?.name || 'Student'}</span>
                                    <span className="block text-[10px] text-brand-textMuted">{t.user?.email || ''}</span>
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getStatusColor(t.status)}`}>
                                      {t.status}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className={`font-black ${getPriorityColor(t.priority)}`}>{t.priority}</span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <button 
                                      className="text-xs text-brand-pink font-bold hover:underline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedTicketId(isExpanded ? null : t._id);
                                      }}
                                    >
                                      {isExpanded ? 'Hide Details' : 'Manage'}
                                    </button>
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr className="bg-brand-dark/25">
                                    <td colSpan="6" className="p-5 border-t border-brand-purple/10">
                                      <div className="space-y-4">
                                        <div className="space-y-1">
                                          <h4 className="text-xs font-bold text-brand-pink uppercase tracking-wider">Ticket Message</h4>
                                          <p className="text-xs text-gray-200 bg-brand-surface/30 border border-brand-purple/10 p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed">
                                            {t.message}
                                          </p>
                                        </div>
                                        
                                        <form 
                                          onSubmit={async (e) => {
                                            e.preventDefault();
                                            const status = e.target.status.value;
                                            const priority = e.target.priority.value;
                                            await handleUpdateTicket(t._id, status, priority);
                                            setExpandedTicketId(null);
                                          }}
                                          className="flex flex-wrap items-end gap-4"
                                        >
                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-brand-textMuted uppercase tracking-wider block">Update Status</label>
                                            <select name="status" defaultValue={t.status} className="bg-brand-dark border border-brand-purple/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-pink cursor-pointer">
                                              <option value="Open">Open</option>
                                              <option value="In Progress">In Progress</option>
                                              <option value="Resolved">Resolved</option>
                                            </select>
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-brand-textMuted uppercase tracking-wider block">Update Priority</label>
                                            <select name="priority" defaultValue={t.priority} className="bg-brand-dark border border-brand-purple/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-pink cursor-pointer">
                                              <option value="Low">Low</option>
                                              <option value="Medium">Medium</option>
                                              <option value="High">High</option>
                                            </select>
                                          </div>
                                          <button type="submit" disabled={userActionLoading} className="btn-primary py-1.5 px-4 text-xs font-bold shadow-md h-fit">
                                            Update Ticket
                                          </button>
                                        </form>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-8 text-center text-brand-textMuted italic">
                              No support tickets in queue.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 space-y-6 text-left animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-black text-white">Broadcast Announcements</h2>
                    <p className="text-xs text-brand-textMuted mt-1">Send push alerts and system-wide announcements to all students and teachers.</p>
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const title = e.target.title.value;
                    const message = e.target.message.value;
                    const targetRole = e.target.targetRole.value;
                    if (!title || !message) return alert("Title and message are required!");
                    setUserActionLoading(true);
                    try {
                      const res = await api.post('/admin/notifications/broadcast', { title, message, targetRole: targetRole === 'all' ? undefined : targetRole });
                      if (res.data.success) {
                        alert(res.data.message);
                        e.target.reset();
                      }
                    } catch (e) {
                      alert("Broadcast failed.");
                    } finally {
                      setUserActionLoading(false);
                    }
                  }} className="space-y-4 max-w-lg">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-pink uppercase tracking-widest block">Recipient Target</label>
                      <select name="targetRole" className="w-full bg-brand-dark/60 border border-brand-purple/20 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-pink cursor-pointer">
                        <option value="all">All Users</option>
                        <option value="student">Students Only</option>
                        <option value="teacher">Teachers Only</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-pink uppercase tracking-widest block">Announcement Title</label>
                      <input name="title" type="text" placeholder="e.g. Mid-term Exam Registration Open" className="w-full bg-brand-dark/60 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-brand-pink" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-pink uppercase tracking-widest block">Announcement Message</label>
                      <textarea name="message" rows="4" placeholder="Type notification content here..." className="w-full bg-brand-dark/60 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-brand-pink resize-none"></textarea>
                    </div>
                    <button type="submit" disabled={userActionLoading} className="btn-primary py-2 px-6 text-xs font-bold shadow-md">
                      {userActionLoading ? "Broadcasting..." : "Broadcast Announcement"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'blogs' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-white">Blog Management</h2>
                      <p className="text-xs text-brand-textMuted mt-1">Write, review, publish, and delete blog articles across categories.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-white/5 bg-brand-dark/40">
                    <table className="w-full min-w-max text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-brand-violet/20 text-xs font-bold text-brand-pink uppercase tracking-widest">
                          <th className="p-4 rounded-l-xl">Article Title</th>
                          <th className="p-4">Author</th>
                          <th className="p-4">Category & Reads</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right rounded-r-xl">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {blogsList.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center p-6 text-brand-textMuted">No blog posts found.</td>
                          </tr>
                        ) : (
                          blogsList.map((blog) => (
                            <tr key={blog._id} className="hover:bg-brand-surface/20 transition-all">
                              <td className="p-4">
                                <span className="font-bold text-white block">{blog.title}</span>
                                <span className="text-xs text-brand-textMuted block font-mono">/{blog.slug}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-white block font-semibold">{blog.author?.name || 'Administrator'}</span>
                                <span className="text-xs text-brand-textMuted block">{blog.author?.email}</span>
                              </td>
                              <td className="p-4 capitalize">
                                <span className="bg-brand-purple/20 text-brand-purple px-2 py-0.5 rounded text-[10px] font-bold">
                                  {blog.category}
                                </span>
                                <span className="text-xs text-brand-textMuted block mt-1 font-semibold">{blog.views || 0} views</span>
                              </td>
                              <td className="p-4">
                                {blog.isPublished ? (
                                  <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                                    <CheckCircle className="w-4 h-4" /> Published
                                  </span>
                                ) : (
                                  <span className="text-yellow-400 text-xs flex items-center gap-1 font-semibold">
                                    <ShieldAlert className="w-4 h-4" /> Draft
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex gap-2.5 justify-end">
                                  <button
                                    onClick={() => handleToggleBlogPublish(blog._id)}
                                    disabled={userActionLoading}
                                    className={`text-xs font-bold py-1.5 px-3 rounded-lg border transition-all ${
                                      blog.isPublished
                                        ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20'
                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                    }`}
                                  >
                                    {blog.isPublished ? 'Unpublish' : 'Publish'}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBlog(blog._id)}
                                    disabled={userActionLoading}
                                    className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-bold py-1.5 px-3 rounded-lg transition-all"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 space-y-6 text-left animate-in fade-in duration-300">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-white">Platform Performance Reports</h2>
                      <p className="text-xs text-brand-textMuted mt-1">Sync, download, and audit database transaction logs and student growth logs.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-brand-dark/40 border border-brand-purple/15 rounded-2xl p-5 space-y-2">
                      <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">Financial Performance</span>
                      <h4 className="text-xl font-black text-white">₹{stats.totalRevenue.toLocaleString()}</h4>
                      <p className="text-xs text-brand-textMuted">{stats.successfulPaymentsCount} success • {stats.pendingPaymentsCount} pending</p>
                    </div>
                    <div className="bg-brand-dark/40 border border-brand-purple/15 rounded-2xl p-5 space-y-2">
                      <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">Class Registrations</span>
                      <h4 className="text-xl font-black text-white">{stats.totalEnrollments.toLocaleString()}</h4>
                      <p className="text-xs text-brand-textMuted">Active learning student cohorts</p>
                    </div>
                    <div className="bg-brand-dark/40 border border-brand-purple/15 rounded-2xl p-5 space-y-2">
                      <span className="text-[10px] text-brand-textMuted font-bold uppercase tracking-wider block">Staff Allocation</span>
                      <h4 className="text-xl font-black text-white">{usersList.filter(u => u.role === 'teacher').length} Teachers</h4>
                      <p className="text-xs text-brand-textMuted">{stats.pendingTeachers} requests pending approval</p>
                    </div>
                  </div>
                  <div className="bg-brand-dark/40 border border-brand-purple/15 rounded-2xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-brand-pink/15 flex items-center justify-center text-brand-pink mx-auto">
                      <Activity className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-white text-sm">Download Audit Summary Logs</h4>
                    <p className="text-xs text-brand-textMuted max-w-md mx-auto">Export transaction ledger sheets and user list rosters formatted as a PDF document or a CSV spreadsheet for local reviews.</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                      <button onClick={handleDownloadCSV} className="btn-primary py-2 px-5 text-xs font-bold shadow-md">
                        Download CSV Log sheet
                      </button>
                      <button onClick={handleDownloadPDF} className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-2 px-5 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer">
                        Download PDF Report
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'website_settings' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 text-left space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-black text-white">Website & Theme Settings</h2>
                    <p className="text-xs text-brand-textMuted mt-1">Configure visual branding parameters and general support contact details.</p>
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const academyName = e.target.academyName.value;
                    const supportEmail = e.target.supportEmail.value;
                    const supportPhone = e.target.supportPhone.value;
                    await handleSaveSettings({ academyName, supportEmail, supportPhone });
                  }} className="space-y-4 max-w-lg">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-pink uppercase tracking-widest block">Academy Name</label>
                      <input name="academyName" type="text" defaultValue={settings?.academyName || ''} className="w-full bg-brand-dark/60 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-brand-pink" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-pink uppercase tracking-widest block">Support Email</label>
                      <input name="supportEmail" type="email" defaultValue={settings?.supportEmail || ''} className="w-full bg-brand-dark/60 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-brand-pink" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-pink uppercase tracking-widest block">Support Phone Number</label>
                      <input name="supportPhone" type="text" defaultValue={settings?.supportPhone || ''} className="w-full bg-brand-dark/60 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-brand-pink" />
                    </div>
                    <button type="submit" disabled={userActionLoading} className="btn-primary py-2 px-6 text-xs font-bold shadow-md">
                      {userActionLoading ? "Saving..." : "Save Website Settings"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'system_settings' && (
                <div className="glass-card rounded-3xl border border-brand-purple/15 p-6 text-left space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h2 className="text-xl font-black text-white">System & Server Settings</h2>
                    <p className="text-xs text-brand-textMuted mt-1">Configure SMTP credentials, enable or disable registration, and manage maintenance mode.</p>
                  </div>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const smtpHost = e.target.smtpHost.value;
                    const smtpPort = Number(e.target.smtpPort.value);
                    const smtpUser = e.target.smtpUser.value;
                    const smtpPass = e.target.smtpPass.value;
                    const enableRegister = e.target.enableRegister.checked;
                    const maintenanceMode = e.target.maintenanceMode.checked;
                    await handleSaveSettings({ smtpHost, smtpPort, smtpUser, smtpPass, enableRegister, maintenanceMode });
                  }} className="space-y-4 max-w-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-xs font-bold text-brand-pink uppercase tracking-widest block">SMTP Host</label>
                        <input name="smtpHost" type="text" defaultValue={settings?.smtpHost || ''} className="w-full bg-brand-dark/60 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-brand-pink" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-brand-pink uppercase tracking-widest block">SMTP Port</label>
                        <input name="smtpPort" type="number" defaultValue={settings?.smtpPort || 587} className="w-full bg-brand-dark/60 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-brand-pink" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-pink uppercase tracking-widest block">SMTP User</label>
                      <input name="smtpUser" type="text" defaultValue={settings?.smtpUser || ''} className="w-full bg-brand-dark/60 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-brand-pink" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-pink uppercase tracking-widest block">SMTP Password</label>
                      <input name="smtpPass" type="password" placeholder="••••••••" defaultValue={settings?.smtpPass || ''} className="w-full bg-brand-dark/60 border border-brand-purple/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-brand-textMuted focus:outline-none focus:border-brand-pink" />
                    </div>
                    
                    <div className="pt-2 space-y-3">
                      <div className="flex items-center gap-3">
                        <input name="enableRegister" type="checkbox" id="enableRegister" defaultChecked={settings?.enableRegister} className="w-4 h-4 rounded border-brand-purple/20 bg-brand-dark/60 text-brand-pink focus:ring-brand-pink cursor-pointer" />
                        <label htmlFor="enableRegister" className="text-xs font-bold text-gray-200 cursor-pointer">Allow Student Registration</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input name="maintenanceMode" type="checkbox" id="maintenanceMode" defaultChecked={settings?.maintenanceMode} className="w-4 h-4 rounded border-brand-purple/20 bg-brand-dark/60 text-brand-pink focus:ring-brand-pink cursor-pointer" />
                        <label htmlFor="maintenanceMode" className="text-xs font-bold text-gray-200 cursor-pointer">Maintenance Mode</label>
                      </div>
                    </div>

                    <button type="submit" disabled={userActionLoading} className="btn-primary py-2 px-6 text-xs font-bold shadow-md">
                      {userActionLoading ? "Saving..." : "Save System Settings"}
                    </button>
                  </form>
                </div>
              )}

            </div>
            {/* 3. Global Website Footer */}
            <Footer />
          </div>
        </main>
      </div>
    </div>

      {/* Print View (Visible only during printing) */}
      <div className="hidden print:block bg-white text-black p-10 min-h-screen font-sans">
        <div className="text-center border-b-2 border-purple-600 pb-5 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{settings?.academyName || "Sumit Chakraborty Academy"}</h1>
          <p className="text-sm text-gray-500 mt-1">Platform Performance & Audit Report</p>
          <p className="text-xs text-gray-400 mt-1">Generated on: {new Date().toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 text-left">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Financial Performance</span>
            <h4 className="text-2xl font-extrabold text-gray-900 mt-2">₹{stats.totalRevenue.toLocaleString()}</h4>
            <p className="text-xs text-gray-600 mt-1">{stats.successfulPaymentsCount} success • {stats.pendingPaymentsCount} pending</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 text-left">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Class Registrations</span>
            <h4 className="text-2xl font-extrabold text-gray-900 mt-2">{stats.totalEnrollments.toLocaleString()}</h4>
            <p className="text-xs text-gray-600 mt-1">Active learning student cohorts</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 text-left">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Staff Allocation</span>
            <h4 className="text-2xl font-extrabold text-gray-900 mt-2">{usersList.filter(u => u.role === 'teacher').length} Teachers</h4>
            <p className="text-xs text-gray-600 mt-1">{stats.pendingTeachers} requests pending approval</p>
          </div>
        </div>

        <div className="mt-8 text-left">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 uppercase tracking-wide">Faculty Performance & Sales</h2>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-[10px] tracking-wider">
                <th className="p-3">Faculty Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Qualification</th>
                <th className="p-3">Experience & Specialty</th>
                <th className="p-3 text-right">Course Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {usersList.filter(u => u.role === 'teacher').map(teacher => (
                <tr key={teacher._id}>
                  <td className="p-3 font-bold">{teacher.name}</td>
                  <td className="p-3">{teacher.email}</td>
                  <td className="p-3">{teacher.qualification || 'M.Sc. Education'}</td>
                  <td className="p-3">{teacher.experience || '5+ Years'} ({teacher.specialization || 'General'})</td>
                  <td className="p-3 text-right text-emerald-600 font-bold">₹{(teacher.totalSales || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-left">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 uppercase tracking-wide">Recent Transactions Ledger</h2>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-700 uppercase text-[10px] tracking-wider">
                <th className="p-3">Order ID</th>
                <th className="p-3">Student</th>
                <th className="p-3">Course</th>
                <th className="p-3">Method</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {paymentsList.slice(0, 15).map(payment => (
                <tr key={payment._id}>
                  <td className="p-3 font-mono">{payment.orderId}</td>
                  <td className="p-3">
                    <span className="font-bold block">{payment.user?.name || 'N/A'}</span>
                    <span className="text-[10px] text-gray-500 block">{payment.user?.email || ''}</span>
                  </td>
                  <td className="p-3">{payment.course?.title || 'N/A'}</td>
                  <td className="p-3 uppercase">{payment.method}</td>
                  <td className="p-3">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-3 text-right font-bold">₹{payment.amount}</td>
                  <td className={`p-3 text-right font-black uppercase ${
                    payment.status === 'paid' ? 'text-emerald-600' : payment.status === 'refunded' ? 'text-red-600' : 'text-yellow-600'
                  }`}>{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center text-xs text-gray-400 mt-16 border-t border-gray-100 pt-5">
          <p>Confidential - Internal Academy Document</p>
          <p>&copy; {new Date().getFullYear()} {settings?.academyName || "Sumit Chakraborty Academy"}. All rights reserved.</p>
        </div>
      </div>
    </>
  );
}
